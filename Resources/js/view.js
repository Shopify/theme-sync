YUI().use('view', function(Y) { 
///start

Themer.appView = Y.Base.create('appView', Y.View, [], {
   
   container: Y.one('#container'),

   events: {
       '#add-shop' : { click: 'addShop'}
   },
   
   initializer: function() {
       //Set up app!
       console.log('Initializer appView');
   },
   
   addShop: function(e) {
       console.log('Add Shop!');
   }
});

///end
});
