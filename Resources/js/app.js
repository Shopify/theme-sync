YUI().use('event', 'event-focus','event-custom', 'querystring-parse','oop', function(Y) {Y.on("domready", function() { 

    //app instance accessible all over.
    var theApp = Themer.theApp = new Themer.appView();
    
    //Spin up theme watchers...
    Themer.Watcher.init(theApp);

    //Returning from authorizing shop callback
    if(window.location.search != '') {
        var qs = Y.QueryString.parse(window.location.search.replace('?', '')),
            shopid = qs.shop.replace('.myshopify.com', '', 'i');

        theApp.shops.create({
            id: shopid,
            api_key: APP_API_KEY,
            password: qs.p
        }, function(err) {
            //Hack hack hack!
            if(!err) {
                console.log('Shop Created!');
                Themer.shopFocus = shopid; //force focus onto new shop
            } else {
                console.log(err);
                growl({title: 'Error', message: 'There was a problem adding your shop'});
            }
        });
    }

    //Stop right click outside of the LIs
    //LI contextmenu listener setup in view.js
    // Y.one('body').on('contextmenu', function(e) {
        //e.preventDefault();
        //Remove contextual right click options
        //var emptyMenu = Ti.UI.createMenu();
        //Ti.UI.setContextMenu(emptyMenu);
    // });

});});

