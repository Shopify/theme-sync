YUI().use('view', 'panel', 'event-custom','event-focus','array-extras', function(Y) { 
///start
var IO = YUI.namespace('Themer.IO'),
    EDITOR = YUI.namespace('Themer.Editor');

//Global handlers for displaying watch status
Y.Global.on('watch:start', function(e) {
    var el = Y.one('#theme-'+e.themeId+' .theme-status.loading-watch');
    if(el) {
        el.replaceClass('loading-watch', 'watch');
    }
});

Y.Global.on('watch:loading', function(e) {
    var el = Y.one('#theme-'+e.themeId+' .theme-status.nowatch');
    if(el) {
        el.replaceClass('nowatch', 'loading-watch');
    }
});

Y.Global.on('watch:stop', function(e) {
    var el = Y.one('#theme-'+e.themeId+' .theme-status.watch') || Y.one('#theme-'+e.themeId+' .theme-status.loading-watch');
    if(el) {
        el.replaceClass('watch', 'nowatch');
    }
});

Themer.ThemeView = Y.Base.create('themeView', Y.View, [], {
    
    template: Y.one('#theme-template').getContent(),

    initializer: function(e) {
        this.container = Y.Node.create('<div id="theme-' + e.model.get('id') + '" class="theme-container nowatch"></div>');
        //Attach here instead, because container isn't available during create
        this.container.delegate('click', function() {
            Ti.Platform.openURL('file://'+escape(e.model.get('path')));
        }, '.path');
        this.container.delegate('click', this.openIn, '.open-in', this);
        this.container.delegate('click', this.remove, '.remove-theme', this);
        this.container.delegate('click', this.deploy, '.force-deploy', this);
    },
    
    openIn: function(e) {
        var themeModel = this.model;
        if(EDITOR.app == '') {
            EDITOR.pickEditor(themeModel.get('path'));
        }
        else {
            EDITOR.open(themeModel.get('path'));
        }

        //check if themer editor is set, otherwise, open editor picker.
        
        // open_in_editor(themeModel.get('path'));
        // opener.launch();
    },
    
    render: function() {
        var container = this.container, 
            model = this.model;

        var viewLink = function(themeModel) {
            return 'http://'+themeModel.get('parent_id')+'.myshopify.com/?preview_theme_id='+themeModel.get('id');
        };

        var data = model.toJSON();
        data.viewLink = viewLink(model);
        data.editor = (Themer.Editor.app == '') ? '...' : Themer.Editor.app; 
        container.setContent(Y.Lang.sub(this.template, data));
        
        return this;
    },
    
    deploy: function(e) {
        var themeModel = this.model;
        if(confirm("Are you sure you want to upload this theme?")) {
            var shopModel = Themer.theApp.shops.getById(themeModel.get('parent_id'));
            uploadThemeActivity(themeModel);
            IO.deployTheme(shopModel, themeModel);
        }
    },
    
    remove: function(e) {
        console.log('ThemeView:remove');
        this.constructor.superclass.remove.call(this);
        this.model.destroy({'delete': true});
    }    
});

var uploadThemeActivity = function(themeModel) {

    var panel = new Y.Panel({
        width: 500, 
        centered: true,
        visible: true,
        modal: true,
        buttons: [], //no close button
        headerContent: '<h3>Uploading theme: '+ themeModel.get('name')+'</h3>',
        zIndex: 10,
        bodyContent: '<h4>Now uploading:<div id="upstatus"></div></h4>(^v^)/'
    });

    panel.addButton({
        value: 'Cancel',
        action: function(e) {
            e.preventDefault();
            Y.Global.fire('upload:cancel');
        },
        classNames: 'btn',
        section: Y.WidgetStdMod.FOOTER
    });

    panel.render();

    Y.Global.on('deploy:done', function(e) { panel.hide(); });
    Y.Global.on('asset:upload', function(e) {
        Y.one('#upstatus').setContent(e.asset + '...');
    });

    return panel;
    
};

///end
});
