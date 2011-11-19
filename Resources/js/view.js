YUI().use('view','panel', 'event-custom','event-focus','array-extras', function(Y) { 
///start

var IO = YUI.namespace('Themer.IO');

Themer.appView = Y.Base.create('appView', Y.View, [], {
   
    container: Y.one('#container'),

    events: {
        '#add-shop' : { click: 'addShop'}
    },
   
    initializer: function() {
        console.log('appView: Initializer');

        //Setup the Add Shop form overlay
        this.addShopForm = createAddShopPanel();

        var shops = this.shops = new Themer.shopList();
        shops.after('add', this.add, this);
        shops.after('remove', this.remove, this);        

        //Reset also fires on initial model list load. 
        shops.after('reset', this.render, this);

        shops.load();

        //Custom event that gets the new shop data from form, and creates the model.
        Y.on('addShopOk', function(shopData) {
            console.log('appView: addShopOk');
            this.shops.create(shopData);
        }, this);

    },

    render: function(e) {
        console.log('appView: render');

        if(this.shops.isEmpty()) {
            console.log('No Shops! Show Onboard!');
            Y.one('#onboard').removeClass('util-hide');
            return this;
        }

        Y.one('#onboard').addClass('util-hide');

        var fragment = Y.one(Y.config.doc.createDocumentFragment());

        Y.Array.each(e.models, function (model) {
            console.log('render shop id:' + model.get('id'));
            var view = new Themer.ShopView({
                model: model,
                container: Y.Lang.sub('<div id="{store}" class="shop-themes"></div>', {store: model.get('id')})
            });
            fragment.append(view.render().container);
        });

        this.container.one('#content').setContent(fragment);

        return this;
    },
   
    // Click handler for the add shop button
    addShop: function(e) {
        this.addShopForm.show();
    }, 

    //Called when shop added to the shops list
    add: function(e) {
        console.log('appView: New Shop Added');
        var view = new Themer.ShopView({
            model: e.model,
            container: Y.Lang.sub('<div id="{store}" class="shop-themes"></div>', {store: e.model.get('id')})
        });
        
        this.container.one('#content').append(view.render().container);
    },

    remove: function(e) {
        console.log('appView: Shop Removed');
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


Themer.ShopView = Y.Base.create('shopView', Y.View, [], {

    //Will pass in a custom container at instantiation
    //    <div id='{store}' class='shop-themes'></div>
    // container: Y.one('#shop-template').getContent(), 
    template: Y.one('#shop-template').getContent(),
    
    events: {
        'button.add-theme': { click: 'chooseTheme'},
        'button.remove-shop': { click: 'remove'}
    },
    
    initializer: function() {
        console.log('ShopView: initializer');
        var model = this.model;
        //@todo clean up themes when shop destroyed
        // model.after('destroy', this.destroy, this);
        
        var themes = this.themes = new Themer.themeList();
        themes.parent_id = model.get('id');

        themes.after('add', this.addTheme, this);
        // themes.after('remove', this.remove, this);        

        //Reset also fires on initial model list load. 
        // themes.after('reset', this.render, this);
        themes.load();
        
    },
    
    render: function() {
        var container = this.container, 
            model = this.model;
            
        container.setContent(Y.Lang.sub(this.template, {
            store: model.get('id')
        }));

        this.themes.each(function(item) {
            // console.log(item.toJSON());
            var view = new Themer.ThemeView({
                model: item
            });
            container.one('ul.themes').append(view.render().container);
            // fragment.append(view.render().container);
        });

        return this;
    },
    
    remove: function(e) {
        console.log('ShopView:remove');
        this.constructor.superclass.remove.call(this);
        this.model.destroy({'delete': true});
    },

    //Called when theme added to the shop themes list
    addTheme: function(e) {
        
        var shop = this.model,
            theme = e.model;
        
        console.log('shopView: New Theme Added');
        // console.log(e.model.toJSON());
        var view = new Themer.ThemeView({
            model: theme
        });
        this.container.one('ul.themes').append(view.render().container);
        
        //Throw up activity indicator.
        var panel = downloadThemeActivity(theme);

        //Create folder, if it doesn't exist
        var destinationDir = Titanium.Filesystem.getFile(theme.get('path'));
        if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
            alert('We could not create the download directory.');
            return;
        }
        //Begin download.
        IO.downloadTheme(shop, theme);
    },

    
    chooseTheme: function() {
        console.log('ShopView:chooseTheme');

        var ThisShopModel = this.model,
            shopWorkingThemes = this.themes;

        //Open Panel
        var panel = createThemePicker();
        //Fetch Themes
        IO.fetchThemesList(ThisShopModel, {

            success: function(resp) {
                // console.log('Success!');
                // console.log(resp);
                
                var result = JSON.parse(resp.responseText),
                    themeList = Y.Node.create('<ul class="theme-picker"></ul>');
                
                result.themes.forEach(function(item) {
                    var li = Y.Lang.sub('<li id="theme-{id}">{name} [{role}]</li>', item);
                    themeList.append(li);
                });
                
                themeList.delegate('click', function(e) {
                    // console.log(e);
                    var selectedId = e.currentTarget.get('id').replace('theme-', '');
                    
                    var selectedTheme = Y.Array.find(result.themes, function(item) {
                        return (item.id == selectedId);
                    });
                    selectedTheme.parent_id = ThisShopModel.get('id');

                    panel.hide();
                    panel.destroy();
                    
                    //Show folder picker
                    Titanium.UI.currentWindow.openFolderChooserDialog(function(dir) {

                        if(dir.length == 0) {
                            return false;
                        }
                        
                        selectedTheme.path = dir[0].concat(Ti.Filesystem.getSeparator(), selectedTheme.parent_id, '-', selectedTheme.id);
                        shopWorkingThemes.create(selectedTheme);
                        return true;
                    },
                    {
                        title: 'Choose Download Location',
                        multiple:false,
                        directories:true,
                        files:false});
                    
                }, 'li');
                
                panel.set('bodyContent', themeList);
                
            },
            
            failure: function(resp) {
                console.log('Failure!');
                console.log(resp);
                var result = JSON.parse(resp.responseText);
                panel.set('bodyContent', result.errors || "Unknown Error");
            }
        });
        //On selection of theme, prompt with folder. 
        
    }
});

var createThemePicker = function(shopModel) {

    var panel = new Y.Panel({
        width: 400, 
        centered: true,
        visible: true,
        modal: true,
        headerContent: 'Choose a theme',
        zIndex: 10,
        bodyContent: 'Loading themes for this Shop... Just a moment please'
    });
    
    panel.render();
    
    return panel;
    
};


var downloadThemeActivity = function(themeModel) {

    var panel = new Y.Panel({
        width: 400, 
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        headerContent: 'Download theme: '+ themeModel.get('name'),
        zIndex: 10,
        bodyContent: 'Downloading files to PATH... This may take a minute.'
    });
    
    panel.render();
    
    return panel;
    
};

///end
});
