YUI().use('event', 'event-focus','event-custom', function(Y) {Y.on("domready", function() { 
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

