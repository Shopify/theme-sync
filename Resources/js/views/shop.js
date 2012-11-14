YUI().use('view', 'panel', 'event-custom','event-focus','array-extras', function(Y) { 
///start

var IO = YUI.namespace('Themer.IO');

Themer.ShopView = Y.Base.create('shopView', Y.View, [], {

    //container: pass in custom container when creating ShopView
    template: '{store}',
    
    initializer: function() {
        console.log('ShopView: initializer');
        var model = this.model,
            themes = model.themes = new Themer.themeList();

        //@todo clean up themes when shop destroyed?
        //model.after('destroy', this.destroy, this);

        themes.parent_id = model.get('id');
        themes.after('add', this.addTheme, this);

        themes.load();

    },

    render: function() {
        console.log('Render Shopview');
        var container = this.container, 
            model = this.model,
            store = this.model.get('id');
            
        container.setContent(Y.Lang.sub(this.template, {
            store: store
        }));

        //Create the Theme container
        Y.one('div#themes-container').append(Y.Lang.sub(
            Y.one('#shop-themes-wrapper').getContent(), {
                store: store,
                'class': (container.hasClass('active')) ? 'theme-show' : 'theme-hide'
            }
        ));

        //Handle no themes on the active shop created at init...
        if(model.themes.isEmpty() && container.hasClass('active')) {
          Y.one('div#themes-'+store).append(Y.one('#no-themes'));
          Y.one('#no-themes').removeClass('hide');
        } 

        //If themes, empty, does nothing
        model.themes.each(function(theme) {
            var view = new Themer.ThemeView({
                model: theme
            });
            Y.one('div#themes-'+store+" .theme-list").append(view.render().container);
        });
        
        //Add, Remove button delegates
        Y.one('div#themes-'+store).delegate('click', 
            this.chooseTheme, 
            '.add-theme', 
            {'model': model} //Add some context
        );

        Y.one('div#themes-'+store).delegate('click', 
            this.remove, 
            '.remove-shop', 
            this //Add some context
        );

        return this;
    },
    
    remove: function(e) {
        console.log('ShopView:remove');
        //Delete the associated themes list view
        Y.one('#themes-'+this.model.get('id')).remove(true);

        this.constructor.superclass.remove.call(this);
        this.model.destroy({'delete': true});
    },

    //Called when theme added to the shop themes list
    addTheme: function(e) {
        console.log('shopView: New Theme Added');
        var shop = this.model,
            theme = e.model,
            themeList = Y.one('#themes-'+shop.get('id')+' .theme-list');

        var view = new Themer.ThemeView({
            model: theme
        });

        var existing = themeList.one('#theme-'+theme.get('id')),
            newNode = view.render().container;

        if(existing) {
            themeList.replaceChild(newNode, existing);
        } else {
            themeList.append(newNode);
        }
        
        Y.one('#no-themes').addClass('hide');

        //Throw up download activity panel.
        var panel = downloadThemeActivity(theme);


        var destinationDir = Ti.Filesystem.getFile(theme.get('path'));
        //Will create folder if it doesn't exist.
        if( (destinationDir.exists() == false) && (destinationDir.createDirectory() == false)) {
            alert('We could not create the download directory.');
            return;
        }
        
        //Before download, kill off any watchers on that theme 
        //otherwise we will have a right mess.
        Themer.Watcher.kill(theme.get('id'));

        //Begin download.
        IO.downloadTheme(shop, theme);
        
        Y.Global.on('download:done', function(e) { 
            //Spin up a watcher
            Themer.Watcher.start(shop, theme);
        });
    },

    //Open & handle the theme selection panel
    chooseTheme: function() {
        console.log('ShopView:chooseTheme');
        var ThisShopModel = this.model,
            shopWorkingThemes = ThisShopModel.themes;

        var panel = createThemePicker();

        IO.fetchThemesList(ThisShopModel, {

            success: function(resp) {                
                var result = JSON.parse(resp.responseText),
                    themeList = Y.Node.create('<ul class="theme-picker"></ul>');
                
                result.themes.forEach(function(item) {
                    var li = Y.Lang.sub('<li id="theme-{id}">{name} [{role}]</li>', item);
                    themeList.append(li);
                });
                
                themeList.delegate('click', function(e) {
                    var selectedId = e.currentTarget.get('id').replace('theme-', '');
                    
                    var selectedTheme = Y.Array.find(result.themes, function(item) {
                        return (item.id == selectedId);
                    });
                    selectedTheme.parent_id = ThisShopModel.get('id');

                    panel.hide();
                    panel.destroy();
                    
                    //Show folder picker
                    Ti.UI.currentWindow.openFolderChooserDialog(function(dir) {
                            //handle the user choice
                            if(dir.length == 0) { return false; }
                            selectedTheme.path = dir[0].concat(Ti.Filesystem.getSeparator(), selectedTheme.parent_id, '-', selectedTheme.id);
                            shopWorkingThemes.create(selectedTheme);
                            return true;
                        },
                        //options for the picker
                        {
                            title: 'Choose Download Location',
                            multiple:false,
                            directories:true,
                            files:false
                        }
                    );
                    
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
    }
});

var createThemePicker = function(shopModel) {

    var panel = new Y.Panel({
        width: 400, 
        centered: true,
        visible: true,
        modal: true,
        headerContent: '<h3>Choose a theme</h3>',
        zIndex: 10,
        bodyContent: '<p>Loading themes for this Shop... Just a moment please</p>'
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
        headerContent: '<h3>Download theme: '+ themeModel.get('name')+'</h3>',
        zIndex: 10,
        bodyContent: '<h4>Downloading files to:<br>'+ themeModel.get('path')+'</h4><div id="downstatus"></div>(^v^)/'
    });

    panel.addButton({
        value: 'Cancel',
        action: function(e) {
            e.preventDefault();
            Y.Global.fire('download:cancel');
        },
        classNames: 'btn',
        section: Y.WidgetStdMod.FOOTER
    });

    panel.render();
    panel.set('centered', true); //to re-center post render
    var assetDlHandle = Y.Global.on('asset:download', function(e) {
        Y.one('#downstatus').setContent(e.asset + '...');
    });

    //Handle some download events
    var ddHandle = Y.Global.once('download:done', function(e) { 

        e = e || {};
        var cancelled = e.cancelled || false;
        panel.hide(); 
        var gmsg = {
            title: 'Download Done',
            message: 'The theme '+themeModel.get('name')+' is done downloading'
        };
        
        if(cancelled){
            gmsg = {
                title: 'Download Cancelled',
                message: 'Some files have been downloaded.'
            };
        } 
        growl(gmsg);
        cleanUp();
    });
    
    var deHandle = Y.Global.once('download:error', function(e) { 
        panel.hide(); 
        cleanUp(); 
    });

    var cleanUp = function() {
        ddHandle.detach();
        deHandle.detach();
        assetDlHandle.detach();
    };

    return panel;
    
};

///end
});
