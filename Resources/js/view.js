
YUI().use('view','panel', 'event-custom','event-focus','array-extras', function(Y) { 
///start

var IO = YUI.namespace('Themer.IO');

Themer.appView = Y.Base.create('appView', Y.View, [], {
   
    container: Y.one('body'),

    //These events are app wide - hooked off body
    events: {
        //General External Link handler. Open in browser window.
        'a.external': { click: function(e) {
            e.halt(true);
            Titanium.Platform.openURL(e.currentTarget.get('href'));

            //from bootstrap :/ because we halt the event, 
            //we need to manually close the dropdown. grrr...
            $('[data-toggle="dropdown"]').parent().removeClass('open');
        }},
        'a#reload': { click: function(e) {
            e.halt(true);
            window.location.reload(true);
        }},
        
        '.add-shop' : { click: 'addShop'}
    },
   
    initializer: function() {
        console.log('appView: Initializer');

        var shops = this.shops = new Themer.shopList();
        shops.after('add', this.add, this);
        shops.after('remove', this.remove, this);        

        //Reset also fires on initial model list load. 
        shops.after('reset', this.render, this);

        shops.load();

        //Custom event that gets the new shop data from form
        //Creates the redirect URL to get the perms, and sends user there
        Y.on('addShopOk', function(shopData) {
            console.log('appView: addShopOk');
            // Ti.API.warn(shopData);
            connectingPanel().show();
            //Spin down any watchers
            Y.Global.fire('watch:killall');
            window.location = IO.authUrl(shopData.id);
            // this.shops.create(shopData);
        }, this);
    },

    render: function(e) {
        console.log('appView: render');

        if(this.shops.isEmpty()) {
            console.log('No Shops! Show Onboard!');
            Y.one('#no-shops').removeClass('hide');
            this.splash();
            // this.addShop();
            return this;
        }

        Y.one('#no-shops').addClass('hide');

        var fragment = Y.one(Y.config.doc.createDocumentFragment());

        Y.Array.each(e.models, function (model, index) {
            console.log('render shop id:' + model.get('id'));
            var view = new Themer.ShopView({
                model: model,
                container: Y.Lang.sub(Y.one('#shop-template').getContent(), {
                    store: model.get('id'),
                    'class': (index == 0) ? 'active':''
                })
            });
            
            fragment.append(view.render().container);
        });

        this.container.one('#shops').setContent(fragment);

        return this;
    },

    splash: function() {
        this.splashPanel = splashPanel();
        this.splashPanel.show();
    },
   
    // Click handler for the add shop button
    addShop: function(e) {
        //Setup the Add Shop form overlay
        this.addShopForm = this.addShopForm || this.createAddShopPanel();        
        this.addShopForm.show();
        
        if(this.splashPanel) {
            this.splashPanel.hide();
        }
        
    }, 

    //Called when shop added to the shops list
    add: function(e) {
        console.log('appView: New Shop Added');

        //If its showing, hide it...
        if(this && this.splashPanel){ this.splashPanel.hide(); }
        if(this && this.addShopForm){ this.addShopForm.hide(); }
        Y.one('#no-shops').addClass('hide');
        var view = new Themer.ShopView({
            model: e.model,
            container: Y.Lang.sub(
                Y.one('#shop-template').getContent(), {store: e.model.get('id'), 'class': ''}
            )
        });
        
        this.container.one('#shops').append(view.render().container);
        
        view.chooseTheme();
        
    },

    remove: function(e) {
        console.log('appView: Shop Removed');
        if(this.shops.isEmpty()) {
            Y.one('#no-shops').removeClass('hide');
        } else {
            Y.Global.fire('shop:switch', {
              container: Y.one('#shops'), 
              currentTarget: Y.one('#'+this.shops.item(0).get('id'))
            });
        }
    },
    
    createAddShopPanel: function() {

        var currentShops = this.shops; 

        var panel = new Y.Panel({
            srcNode: '#add-shop-panel',
            width: 500, 
            centered: true,
            visible: false,
            modal: true,
            headerContent: '<h3>Add a New Shop</h3>',
            zIndex: 10
        });

        var submitHandler = function(e) {
             e.preventDefault(); 

             //Step through and remove all unwanted crap that may be submitted
             var sanitizeShopId = function(str) {
                 var sid = str.replace('http://', '', 'i') 
                           .replace('https://', '', 'i') //In case someone uses https://
                           .replace('.myshopify.com', '', 'i')
                           .replace('/',''); //#fixes public issue #10 - trailing slash

                return Y.Lang.trim(sid);
             };

             var data = {
                 id: sanitizeShopId(Y.one('input[name=id]').get('value'))
             };

             if((data.id == '') || (currentShops.getById(data.id) != null)) {
                 Y.one('input[name=id]').set('value','');
                 panel.hide();
             }
             else {
                 //Does this already exist?
                 Y.fire('addShopOk', data);                 
             }
        };


        panel.addButton({
            value: 'Cancel',
            action: function(e) {
                e.preventDefault(); 
                panel.hide();
            },
            classNames: 'btn',
            section: Y.WidgetStdMod.FOOTER
        });

        panel.get('contentBox').one('form').on('submit', submitHandler);
        panel.addButton({
             id: 'addShopOk',
             value: 'Add Shop',
             action: submitHandler,
             classNames: 'btn btn-primary',
             section: Y.WidgetStdMod.FOOTER
         });


        panel.render();
        Y.one('#add-shop-panel').removeClass('hide');

        return panel;
    }

});


var createPanel = function(args) {
    var p = new Y.Panel(args);
    p.render();
    Y.one(args.srcNode).removeClass('hide');
    p.set('centered', true); //to re-center
    return p;
};

var splashPanel = function() {
    return createPanel({
        width: 700, 
        height: 450,
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        zIndex: 12,
        srcNode: '#splash-page'
    });
};

var connectingPanel = function() {
    return createPanel({
        width: 300, 
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        zIndex: 12,
        srcNode: '#connecting-shopify-panel'
    });
};


///end
});
