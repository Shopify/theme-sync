YUI().use('event', 'event-focus','event-custom', 'querystring-parse', function(Y) {Y.on("domready", function() { 
//@todo / bookmark : fix it so when you add first shop, that we don't see
//                  the You have no shops so add one overlay. Basically a timing issue I suspect
//                  of when we check
//@todo need to spin down watchers when going for remote auth
    if(window.location.search != '') {
        var shoplist = new Themer.shopList();
        shoplist.load();

        var qs = Y.QueryString.parse(window.location.search.replace('?', ''));
        console.log(qs);

        shoplist.create({
            id:qs.shop.replace('.myshopify.com', '', 'i'),
            api_key: APP_API_KEY,
            password: Titanium.Codec.digestToHex(Titanium.Codec.MD5, SHARED_SECRET+qs.t)         
        });
    }
    
    var theApp = new Themer.appView();

    //Stop right click outside of the LIs
    //LI contextmenu listener setup in view.js
    Y.one('body').on('contextmenu', function(e) {
        e.preventDefault();
        //Remove contextual right click options
        // var emptyMenu = Ti.UI.createMenu();
        // Ti.UI.setContextMenu(emptyMenu);
    });
    
    //Spin up watchers...
    Themer.Watcher.init(theApp);

    Y.Global.on('asset:send', function(e) {
        console.log('asset:send listener');
        //@todo allowed list?
        var key = e.relative,
            path = e.base.concat(Ti.Filesystem.getSeparator(), e.relative);

        Themer.IO.sendAsset(e.shop, e.theme, key, path);
    });    
});});

