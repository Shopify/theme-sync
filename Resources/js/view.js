YUI().use('view','panel', 'event-custom','event-focus', function(Y) { 
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

        var shops = this.shops = new Themer.shopList();
        shops.after('add', this.add, this);
        shops.after('remove', this.remove, this);        

        //Reset also fires on initial model list load. 
        shops.after('reset', this.render, this);

        shops.load();

        //Custom event that passes in the data
        Y.on('addShopOk', function(shopData) {
            console.log('Add Shop OK!');
            this.shops.create(shopData);
        }, this);

    },

    render: function(e) {
        console.log('RENDER: appView');

        if(this.shops.isEmpty()) {
            console.log('No Shops! Show Onboard!');
            Y.one('#onboard').removeClass('util-hide');
            return this;
        }

        Y.one('#onboard').addClass('util-hide');

        var fragment = Y.one(Y.config.doc.createDocumentFragment());

        Y.Array.each(e.models, function (model) {
            console.log(model);
            var view = new ShopView({model: model});
            fragment.append(view.render().container);
        });

        this.container.one('#content').setContent(fragment);

        return this;
    },
   
    //Click handler for the add shop button
    addShop: function(e) {
        console.log('addd');
        this.addShopForm.show();
    }, 

    //Called when something added to the list.
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
        width: 400, 
        centered: true,
        visible: false,
        modal: true,
        headerContent: 'Add A New Shop',
        zIndex: 10
    });
    
    panel.addButton({
        id: 'addShopOk',
        value: 'Add Shop',
        action: function(e) {
            console.log('Add a new shop submit!');
            // console.log(e);

            e.preventDefault(); 

            var data = {
                id: Y.one('input[name=id]').get('value'),
                api_key: Y.one('input[name=api_key]').get('value'),
                password: Y.one('input[name=password]').get('value')
            };
            
            //@todo validate data
            //Assuming its ok...
            Y.fire('addShopOk', data);
            panel.hide();
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
