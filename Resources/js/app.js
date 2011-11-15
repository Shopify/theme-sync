YUI().use('event', function(Y) {Y.on("domready", function() { 
    console.log('Dom Ready');

    new Themer.appView();
    //Load shops
    //No shop? Show starting instructions

});});

