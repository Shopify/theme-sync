YUI().use('event', function(Y) {Y.on("domready", function() { 
    console.log('Dom Ready');

    var app = new Themer.appView();

    //No shop? Show starting instructions
    if(app.shops.isEmpty()) {
        console.log('No Shops! Show Onboard!');
        Y.one('#onboard').removeClass('util-hide');
    }

});});

