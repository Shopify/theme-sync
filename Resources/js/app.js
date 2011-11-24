YUI().use('event', 'event-focus', function(Y) {Y.on("domready", function() { 
    new Themer.appView();

    //Stop right click outside of the LIs
    //LI contextmenu listener setup in view.js
    Y.one('body').on('contextmenu', function(e) {
        e.preventDefault();
        //Remove contextual right click options
        // var emptyMenu = Ti.UI.createMenu();
        // Ti.UI.setContextMenu(emptyMenu);
    });
});});

