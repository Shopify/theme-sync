YUI().use('event-custom', function(Y) { 
/////

var IO = YUI.namespace('Themer.IO'),
    TIMEOUT = 30000;

IO.authUrl = function(shopId) {
    var u = Y.Lang.sub('http://{store}.myshopify.com/admin/api/auth?api_key={app_api_key}', {
        store: shopId,
        app_api_key: APP_API_KEY
    });
    
    return u;
};

//@param shop ShopModel
//@param endpoint our target, like themes
IO.url = function(shopModel, endpoint) {
    return Y.Lang.sub('http://{api_key}:{password}@{store}.myshopify.com/admin/{endpoint}.json', {
        store: shopModel.get('id'), 
        api_key: shopModel.get('api_key'),
        password: shopModel.get('password'),
        'endpoint': endpoint
    });
};

IO.fetchThemesList = function(shopModel, handlers) {
    console.log('io: fetchThemesList');
    var target = IO.url(shopModel, 'themes');
    IO.get(target, handlers);
};

//Filter out .css & .js files when a .css.liquid is available.
//returns array of assets to upload
var filterAssetList = function(assets) {
    var newList = [],
        toCheck = [],
        rx = /(\.css|\.js)$/;

    assets.forEach(function(item) {
        if(true == rx.test(item.key)) {
            toCheck.push(item.key);
        } else {
            newList.push(item.key);
        }
    });
    
    toCheck.forEach(function(item) {
        if(newList.indexOf(item.concat('.liquid')) == -1) { 
            newList.push(item);
        }
    });
    
    return newList;
}; 

IO.downloadTheme = function(shopModel, themeModel, handlers) {
    var assetsListTarget = IO.url(shopModel, 'themes/'+themeModel.get('id')+'/assets');
    console.log(themeModel.get('path'));
    //Fetch the assets list
    IO.get(assetsListTarget, {
        success: function(e) {
            var result = JSON.parse(e.responseText);

            var assetQ = new Y.Queue();
            assetQ.add.apply(assetQ, filterAssetList(result.assets));

            var successGetAsset = function(e) {
                
                var assetRes = JSON.parse(e.responseText),
                    fileHandle = Titanium.Filesystem.getFile(themeModel.get('path'), assetRes.asset.key);

                var destPath = fileHandle.nativePath().split(Titanium.Filesystem.getSeparator());
                destPath.pop();
                var destinationDir = Titanium.Filesystem.getFile(destPath.join(Titanium.Filesystem.getSeparator()));
                if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
                    alert('We could not create the directory: ' + destPath.nativePath());
                    return;
                }
                
                if(assetRes.asset.value) {
                    fileHandle.write(assetRes.asset.value);
                } else {
                    //defined in lib/util.php - workaround for http://developer.appcelerator.com/question/128541/how-to-ticodecdecodebase64-an-image-to-write-to-disk
                    writeBase64Asset(fileHandle.nativePath(), assetRes.asset.attachment);
                }

                if(assetQ.size() > 0) {
                    IO.getAsset(shopModel, themeModel, assetQ.next(), {success: successGetAsset});
                } else {
                    Y.Global.fire('download:done');
                }
            };
            
            //Start the download queue...
            IO.getAsset(shopModel, themeModel, assetQ.next(), { success: successGetAsset });

        }, 
        failure: function(e) {
            console.log('Error: assetsList fetch');
            console.log(e);
        }
    });
    
};

IO.getAsset = function(shopModel, themeModel, asset, handlers) {
    
    var assetTarget = IO.url(shopModel, 'themes/'+themeModel.get('id')+'/assets');
    assetTarget = assetTarget.concat('?', 'asset[key]=', Titanium.Network.encodeURIComponent(asset));

    Y.Global.fire('asset:download', {
        asset: asset
    });

    IO.get(assetTarget, handlers);
};

//Deploy full theme
IO.deployTheme = function(shopModel, themeModel) {
    Ti.API.warn('IO.deployTheme');

    var files = []
        , path = themeModel.get('path')
        , foldersOfInterest = 
            [ 'assets'
            , 'config'
            , 'layout'
            , 'snippets'
            , 'templates',
            , 'templates/customers'
        ]
        , uploadQ = new Y.Queue();

    //Build the list of files
    foldersOfInterest.forEach(function(folder) {

        var dir = Ti.Filesystem.getFile(path,folder)
            , f = (dir.exists()) ? dir.getDirectoryListing() : [];

        //Tear through listing
        f.forEach(function(item) {
            //exclude folders & hidden
            if( !item.isDirectory() && !item.isHidden()) {
                uploadQ.add(item.toString());
            }
        });
    });

    //And, now chew through the q, much like we do for download theme.
    var toUpload = uploadQ.next(),
        key = toUpload.replace(path+Ti.Filesystem.getSeparator(), ''),
        errorCount = 0,
        failureSendAsset = function(e) {
            if(e.timedOut) {
                //On a timeout we dont want to continue.
                growlTimedOut();
                Y.Global.fire('deploy:done');
            } else {
                Ti.API.error('Error deployTheme: '+e.status + ' - ' + e.statusText);
                var response = JSON.parse(e.responseText);
                var errors = response.errors || {};
                Y.each(errors, function(message) {
                    growl({
                        title: 'Error uploading',
                        message: key.concat(' - ', message)
                    });
                });
                errorCount++;
                //Then call successSendAsset to go onto the next item...
                successSendAsset();
            }
        },
        successSendAsset = function() {
            if(uploadQ.size() > 0) {
                toUpload =  uploadQ.next();
                key = toUpload.replace(path+Ti.Filesystem.getSeparator(), '');
                
                IO.sendAsset(shopModel, themeModel, key, toUpload, {success: successSendAsset, failure: failureSendAsset});
            } else {
                var doneMessage = themeModel.get('name').concat(' has been uploaded.');
                if(errorCount > 0) {
                    Ti.API.warn('adding to message');                    
                    doneMessage += ("\n" + errorCount + ' ' + ((errorCount == 1)?'file':'files') +' not uploaded');
                }
                growl({
                    title: 'Deploy done!',
                    message: doneMessage
                });
                Y.Global.fire('deploy:done');
            }
        };

    IO.sendAsset( 
        shopModel, 
        themeModel, 
        key, 
        toUpload, 
        { 
            success: successSendAsset,
            failure: failureSendAsset 
        }
    );
};

//@param shopModel
//@param themeModel
//@param assetKey
//@param filePath
IO.sendAsset = function(shopModel, themeModel, assetKey, filePath, handlers) {
    console.log('IO:sendAsset: '+assetKey);
    
    var assetTarget = IO.url(shopModel, 'themes/'+themeModel.get('id')+'/assets');

    //Ti throws exception when trying to read empty file,
    //but no advice given how to catch said exception. try/catch doesn't work - app still crashes,
    //To work around, we create File obj first, and check size()
    var assetFile = Titanium.Filesystem.getFile(filePath),

        contents = '',

        payload = {
            "asset": {
                "key": assetKey
              }
        };

    if(0 < assetFile.size()) {
        var readfile = Titanium.Filesystem.getFileStream(assetFile);
        readfile.open();
        contents = readfile.read();
    }

    if(is_binary(filePath)) {
        payload.asset.attachment = Titanium.Codec.encodeBase64(contents);
    } else {
        payload.asset.value = contents.toString();
    }

    Y.Global.fire('asset:upload', {
        asset: assetKey
    });

    IO.put(assetTarget, payload, handlers);
};


IO.put = function(target, data, handlers) {

    handlers = handlers || {};
    handlers.failure = handlers.failure || function(e) {console.log('PUT: Fail');console.log(e);};
    handlers.success = handlers.success || function(e) {console.log('PUT: Success');};

    var xhr = Titanium.Network.createHTTPClient();
    xhr.setTimeout(TIMEOUT);
    xhr.setRequestHeader('Content-Type','application/json');

    xhr.onload = function(event) {
        var status = this.status || 999, //Fallback on my own code if status is null
            timedOut = event.timedOut;

        if(timedOut || (status > 399)) {
            Ti.API.info('PUT: Failure');
            handlers.failure.call({}, event);
        } else {
            Ti.API.info('PUT: Success');
            handlers.success.call({}, event);
        }
    };

    xhr.open("PUT",target);
    xhr.send(JSON.stringify(data));
   
};

IO.get = function(target, handlers) {

    var xhr = Titanium.Network.createHTTPClient();
    xhr.setTimeout(TIMEOUT);

    xhr.onload = function(event) {
        var status = this.status || 999, //Fallback on my own code if status is null
            timedOut = event.timedOut;

        if(timedOut || (status > 399)) {
            Ti.API.info('PUT: Failure');
            handlers.failure.call({}, event);
        } else {
            Ti.API.info('PUT: Success');
            handlers.success.call({}, event);
        }
    };

    xhr.open("GET",target);
    xhr.send();

};


/////
});
