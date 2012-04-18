YUI().use('event', 'event-focus','event-custom', 'querystring-parse','oop', function(Y) {Y.on("domready", function() { 

    var theApp = new Themer.appView();
    
    //Spin up watchers...
    Themer.Watcher.init(theApp);

    //Returning from the callback...
    if(window.location.search != '') {
        var qs = Y.QueryString.parse(window.location.search.replace('?', '')),
            shopid = qs.shop.replace('.myshopify.com', '', 'i');

        theApp.shops.create({
            id: shopid,
            api_key: APP_API_KEY,
            password: Titanium.Codec.digestToHex(Titanium.Codec.MD5, SHARED_SECRET+qs.t)         
        }, function(err) {
            //Hack hack hack!
            if(!err) {
                Y.log('Shop Created!');
                Themer.shopFocus = shopid; //force focus onto new shop
            } else {
                //@todo Throw up error panel.
                alert(err);
            }
        });
    }

    Y.Global.on('asset:send', function(e) {
        console.log('asset:send listener');

        var key = e.relative,
            path = e.base.concat(Ti.Filesystem.getSeparator(), e.relative),
            failureHandler = function(e) {
                if(e.timedOut) {
                    growlTimedOut();
                } 
                else {
                    //output error to console
                    Ti.API.error(e.status);
                    Ti.API.error(e.statusText);
                    var response = JSON.parse(e.responseText);
                    var errors = response.errors || {};
                    Y.each(errors, function(message) {
                        growl({
                            title: 'Error uploading',
                            message: key.concat(' - ', message)
                        });
                    });
                }
            };

        Themer.IO.sendAsset(e.shop, e.theme, key, path, {failure: failureHandler});
    });

    //Stop right click outside of the LIs
    //LI contextmenu listener setup in view.js
    Y.one('body').on('contextmenu', function(e) {
        // e.preventDefault();
        //Remove contextual right click options
        // var emptyMenu = Ti.UI.createMenu();
        // Ti.UI.setContextMenu(emptyMenu);
    });

});});

