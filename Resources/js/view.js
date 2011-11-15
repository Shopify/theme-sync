YUI().use('view','panel', function(Y) { 
///start

Themer.appView = Y.Base.create('appView', Y.View, [], {
   
    container: Y.one('#container'),

    events: {
        '#add-shop' : { click: 'addShop'}
    },
   
    initializer: function() {
        console.log('Initializer appView');

        //Setup the Add Shop form overlay
        this.addShopForm = createAddShopPanel();
        // this.addShopForm.render();

        var shops = this.shops = new Themer.shopList();

        shops.after('add', this.add, this);
        shops.after('remove', this.remove, this);

        shops.load();

    },
   
    //Click handler for the add shop button
    addShop: function(e) {
        console.log('Add Shop!');
        this.addShopForm.show();
    }, 

    add: function(e) {
        console.log('New Shop Added');
    },

    remove: function(e) {
        console.log('Shop Removed');
    }

});

var createAddShopPanel = function() {

    var panel = new Y.Panel({
        srcNode: '#add-shop-panel',
        width: 250, 
        centered: true,
        visible: false,
        modal: true,
        headerContent: 'Add A New Shop',
        zIndex: 10
    });
    
    panel.addButton({
        value: 'Add Shop',
        action: function(e) {
            e.preventDefault(); 

            console.log('Add a new shop submit!');
            console.log(e);
        },
        section: Y.WidgetStdMod.FOOTER
    });

    panel.addButton({
        value: 'Cancel',
        action: function(e) {
            e.preventDefault(); 
            panel.hide();
        },
        section: Y.WidgetStdMod.FOOTER
    });

    panel.render();
    Y.one('#add-shop-panel').removeClass('util-hide');

    return panel;
};




///end
});
