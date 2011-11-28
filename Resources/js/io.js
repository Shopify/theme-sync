YUI().use('event-custom', function(Y) { 
/////

var IO = YUI.namespace('Themer.IO'),
    TIMEOUT = 30000;

//@param shop ShopModel
//@param endpoint our target, like themes
IO.url = function(shop, endpoint) {
    return Y.Lang.sub('http://{api_key}:{password}@{store}.myshopify.com/admin/{endpoint}.json', {
        store: shop.get('id'), 
        api_key: shop.get('api_key'),
        password: shop.get('password'),
        'endpoint': endpoint
    });
};

IO.fetchThemesList = function(shopModel, handlers) {
    console.log('io: fetchThemesList');
    var target = IO.url(shopModel, 'themes');
    IO.get(target, handlers);
};


IO.downloadTheme = function(shopModel, themeModel, handlers) {
    var assetsListTarget = IO.url(shopModel, 'themes/'+themeModel.get('id')+'/assets');
    console.log(themeModel.get('path'));
    //Fetch the assets list
    IO.get(assetsListTarget, {
        success: function(e) {
            var result = JSON.parse(e.responseText);
            
            var assetQ = new Y.Queue();
            assetQ.add.apply(assetQ, result.assets);
            
            var successGetAsset = function(e) {
                
                var assetRes = JSON.parse(e.responseText),
                    fileHandle = Titanium.Filesystem.getFile(themeModel.get('path'), assetRes.asset.key);
                
                //@todo filter out .css if .css.liquid exists
                
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
    assetTarget = assetTarget.concat('?', 'asset[key]=', asset.key);

    Y.Global.fire('asset:download', {
        asset: asset.key
    });

    IO.get(assetTarget, handlers);
};

IO.sendAsset = function(shopModel, themeModel, assetKey, filePath) {
    console.log('IO:sendAsset'+assetKey);

    var assetTarget = IO.url(shopModel, 'themes/'+themeModel.get('id')+'/assets');
    
    var readfile = Titanium.Filesystem.getFileStream(filePath);
    readfile.open();
    var contents = readfile.read();

    var payload = {
        "asset": {
            "key": assetKey
          }
    };
    
    if(is_binary(filePath)) {
        payload.asset.attachment = Titanium.Codec.encodeBase64(contents);
    } else {
        payload.asset.value = contents.toString();
    }

    IO.put(assetTarget, payload);
};


IO.put = function(target, data, handlers) {

    handlers = handlers || {};
    handlers.failure = handlers.failure || function(e) {console.log('fail:PUT');console.log(e.responseText);};
    handlers.success = handlers.success || function(e) {console.log('success:PUT');console.log(e.responseText);};

    var xhr = Titanium.Network.createHTTPClient();
    xhr.setTimeout(TIMEOUT);
    xhr.setRequestHeader('Content-Type','application/json');
    
    xhr.onerror = handlers.failure;

    xhr.onload = function(event) {
        var status = this.status;
        if((400 > status)) {        
            // var response = JSON.parse(this.responseText);
            handlers.success.call({}, event);
        }
        else {
            handlers.failure.call({}, event);
        }
    };

    xhr.open("PUT",target);
    xhr.send(JSON.stringify(data));
   
};

IO.get = function(target, handlers) {

    var xhr = Titanium.Network.createHTTPClient();
    xhr.setTimeout(TIMEOUT);

    xhr.onerror = handlers.failure;

    xhr.onload = function(event) {
        var status = this.status;
        if((400 > status)) {        
            // var response = JSON.parse(this.responseText);
            handlers.success.call({}, event);
        }
        else {
            handlers.failure.call({}, event);
        }
    };

    xhr.open("GET",target);
    xhr.send();

};


/////
});
/*
(function(){
//Begin Closure


IO.baseUrl = NIRV.baseurl_api;
// Ti.API.error('TEST BASEURL - FIX FOR RELEASE');
// IO.baseUrl = 'http://morea.local:8085/';



IO.post = function(url, data, callback, type) {
    
    Ti.API.info('POST: '+ url);

    if(false == Ti.Network.online) {
        Ti.API.warn('OFFLINE MODE');
        return false;
    }

    var xhr = Titanium.Network.createHTTPClient();    
    xhr.setTimeout(20000);
    //Timeout triggers error callback
    xhr.onerror = function(event) {
        var method = data.method || 'method.unknown';
        Ti.API.fireEvent('xhr:onerror', {method: method});
        alert('Error Posting');
    };

    //this = TiNetworkHTTPClientResult
    xhr.onload = function(event) {
        var status = this.status;
        Ti.API.warn(status);
        
        // cacheResponse(Date().toString(), this.responseText);
        
        var response = JSON.parse(this.responseText);

        response = dataFilter(response, type);

        if((400 > status)) {
            // Ti.API.warn(response);
            callback.call({}, response);
        }
        else {
            Ti.API.log('Response Error: '+status);
        }
    };

    //Update the progress meter
    xhr.onsendstream = function(event) {
        Ti.API.warn('in progress');
    };

    xhr.open('POST',url);
    xhr.send(data);
};
postCORS = IO.post;


IO.get = function(url, data, callback, type) {

    Ti.API.info('GET: '+ url);
    if(false == Ti.Network.online) {
        Ti.API.warn('OFFLINE MODE');
        return false;
    }

    callback = callback || function() {};

    var xhr = Titanium.Network.createHTTPClient();
    xhr.setTimeout(20000);

    xhr.onerror = function(event) {
        Ti.API.info(event);
    };

    xhr.onload = function(event) {
        var status = this.status;
        if((400 > status)) {        
            // cacheResponse(Date().toString(), this.responseText);
            var response = JSON.parse(this.responseText);
            response = dataFilter(response, type);

            callback.call({}, response);
        }
        else {
            Ti.API.info('Error');
        }
    };

    xhr.open("GET",url);
    xhr.send();

};
getCORS = IO.get;




//End Closure
})();

*/