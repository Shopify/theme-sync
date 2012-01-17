YUI().use('view','panel', 'event-custom','event-focus','node-event-simulate','array-extras', function(Y) { 
///start

var IO = YUI.namespace('Themer.IO');

Themer.appView = Y.Base.create('appView', Y.View, [], {
   
    container: Y.one('#container'),

    events: {
        //General External Link handler. Open in browser window.
        'a.external': { click: function(e) {
            e.halt(true);
            Titanium.Platform.openURL(e.currentTarget.get('href'));
        }},
        
        '#add-shop' : { click: 'addShop'},
        'ul.themes li': { contextmenu: function(e) {
            e.stopPropagation();

            var li = e.currentTarget,
                currentMenu = Ti.UI.createMenu(),
                shops = this.shops;

            var openFolder = Ti.UI.createMenuItem('Open In Finder', function() {
                li.one('.path').simulate('click');
            });
            
            var forceDeploy = Ti.UI.createMenuItem('Force Deploy', function() {
                Ti.API.warn('Force Deploy TK');
                var themeId = li.get('id').replace('theme-', '');

                //go through the shops, look for the theme model of interest
                shops.some(function(shopModel) {
                    var themeModel = shopModel.themes.getById(themeId);
                    if(themeModel) {
                        uploadThemeActivity(themeModel);
                        IO.deployTheme(shopModel, themeModel);
                        return true;
                    }
                    return false;
                });
            });

            currentMenu.appendItem(openFolder);
            currentMenu.appendItem(forceDeploy);
            Ti.UI.setContextMenu(currentMenu);
        }}
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
            Y.one('#onboard').removeClass('util-hide');
            this.addShop();
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
        //Setup the Add Shop form overlay
        this.addShopForm = this.addShopForm || createAddShopPanel();        
        this.addShopForm.show();
    }, 

    //Called when shop added to the shops list
    add: function(e) {
        console.log('appView: New Shop Added');
        Y.one('#onboard').hide();
        //If its showing, hide it...
        var view = new Themer.ShopView({
            model: e.model,
            container: Y.Lang.sub('<div id="{store}" class="shop-themes"></div>', {store: e.model.get('id')})
        });
        
        this.container.one('#content').append(view.render().container);
        view.chooseTheme();
        
    },

    remove: function(e) {
        console.log('appView: Shop Removed');
    }

});

var createAddShopPanel = function() {

    var panel = new Y.Panel({
        srcNode: '#add-shop-panel',
        width: 500, 
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
                id: Y.one('input[name=id]').get('value').replace('.myshopify.com', '', 'i')
                // api_key: Y.one('input[name=api_key]').get('value'),
                // password: Y.one('input[name=password]').get('value')
            };
            
            //@todo validate data
            //Assuming its ok...
            Y.fire('addShopOk', data);
            // panel.hide();
        },
        classNames: 'btn',
        section: Y.WidgetStdMod.FOOTER
    });

    panel.addButton({
        value: 'Cancel',
        action: function(e) {
            e.preventDefault(); 
            panel.hide();
        },
        classNames: 'btn',
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
        
        var themes = model.themes = new Themer.themeList();
        themes.parent_id = model.get('id');

        themes.after('add', this.addTheme, this);
        // themes.after('remove', this.remove, this);

        themes.load();
        
    },
    
    render: function() {
        var container = this.container, 
            model = this.model;
            
        container.setContent(Y.Lang.sub(this.template, {
            store: model.get('id')
        }));

        model.themes.each(function(theme) {
            // console.log(item.toJSON());
            var view = new Themer.ThemeView({
                model: theme
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
        console.log('shopView: New Theme Added');        
        var shop = this.model,
            theme = e.model,
            ul = this.container.one('ul.themes');
        
        var view = new Themer.ThemeView({
            model: theme
        });
        
        var existing = ul.one('#theme-'+theme.get('id')),
            newNode = view.render().container;

        if(existing) {
            ul.replaceChild(newNode, existing);
        } else {
            ul.append(newNode);
        }

        //Throw up activity indicator.
        var panel = downloadThemeActivity(theme);

        //Create folder, if it doesn't exist
        var destinationDir = Titanium.Filesystem.getFile(theme.get('path'));
        if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
            alert('We could not create the download directory.');
            return;
        }
        
        //Before download, kill off any watchers on that theme 
        //otherwise we will have a right mess
        Themer.Watcher.kill(theme.get('id'));

        //Begin download.
        IO.downloadTheme(shop, theme);
        
        Y.Global.on('download:done', function(e) { 
            //Spin up a watcher
            Themer.Watcher.start(shop, theme);
        });
    },

    
    chooseTheme: function() {
        console.log('ShopView:chooseTheme');
        var ThisShopModel = this.model,
            shopWorkingThemes = ThisShopModel.themes;

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
                        if(dir.length == 0) { return false; }
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
                panel.set('centered', true); //to re-center
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
        width: 500, 
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        headerContent: 'Download theme: '+ themeModel.get('name'),
        zIndex: 10,
        bodyContent: 'Downloading files to:<br>'+ themeModel.get('path')+'<div id="downstatus"></div>(^v^)/'
    });

    panel.render();

    Y.Global.on('download:done', function(e) { panel.hide(); });
    Y.Global.on('asset:download', function(e) {
        Y.one('#downstatus').setContent(e.asset + '...');
    });

    return panel;
    
};

var uploadThemeActivity = function(themeModel) {

    var panel = new Y.Panel({
        width: 500, 
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        headerContent: 'Uploading theme: '+ themeModel.get('name'),
        zIndex: 10,
        bodyContent: 'Now uploading:<div id="upstatus"></div>(^v^)/'
    });

    panel.render();

    Y.Global.on('deploy:done', function(e) { panel.hide(); });
    Y.Global.on('asset:upload', function(e) {
        Y.one('#upstatus').setContent(e.asset + '...');
    });

    return panel;
    
};

var connectingPanel = function() {

    var panel = new Y.Panel({
        width: 300, 
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        zIndex: 12,
        bodyContent: 'Connecting to Shopify...'
    });

    panel.render();

    return panel;

};


///end
});
