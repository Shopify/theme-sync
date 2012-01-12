YUI().use('event', 'event-focus','event-custom', 'querystring-parse', function(Y) {Y.on("domready", function() { 
//@todo need to spin down watchers when going for remote auth
    
    var theApp = new Themer.appView();
    
    //Spin up watchers...
    Themer.Watcher.init(theApp);

    //Returning from the callback...
    if(window.location.search != '') {
        var qs = Y.QueryString.parse(window.location.search.replace('?', ''));

        theApp.shops.create({
            id:qs.shop.replace('.myshopify.com', '', 'i'),
            api_key: APP_API_KEY,
            password: Titanium.Codec.digestToHex(Titanium.Codec.MD5, SHARED_SECRET+qs.t)         
        }, function(err) {
            //Hack hack hack!
            if(!err) {
                theApp.addShopForm.hide();
            } else {
                //@todo Throw up error panel.
                alert(err);
            }
        });
    }

    Y.Global.on('asset:send', function(e) {
        console.log('asset:send listener');
        //@todo allowed list?
        var key = e.relative,
            path = e.base.concat(Ti.Filesystem.getSeparator(), e.relative);

        Themer.IO.sendAsset(e.shop, e.theme, key, path);
    });

    //Stop right click outside of the LIs
    //LI contextmenu listener setup in view.js
    Y.one('body').on('contextmenu', function(e) {
        e.preventDefault();
        //Remove contextual right click options
        // var emptyMenu = Ti.UI.createMenu();
        // Ti.UI.setContextMenu(emptyMenu);
    });

    
});});

