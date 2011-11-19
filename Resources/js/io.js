YUI().use('queue', function(Y) { 
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
    //Fetch the assets list
    IO.get(assetsListTarget, {
        success: function(e) {
            var result = JSON.parse(e.responseText);
            
            var assetQ = new Y.Queue();
            assetQ.add.apply(assetQ, result.assets);
            
            var successGetAsset = function(e) {
                if(assetQ.size() > 0) {
                    IO.getAsset(themeModel, assetQ.next(), {success: successGetAsset});
                } else {
                    console.log('Done Q!');
                }
            };

            IO.getAsset(themeModel, assetQ.next(), { success: successGetAsset });

        }, 
        failure: function(e) {
            console.log('Error: assetsList fetch');
            console.log(e);
        }
    });
    
};

IO.getAsset = function(themeModel, asset, handlers) {
    console.log(asset);
    handlers.success();
};

//Utility: get + post
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