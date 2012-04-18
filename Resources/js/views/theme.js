YUI().use('view','event-custom','event-focus','array-extras', function(Y) { 
///start

//Global handler for when a theme is being watched/unwatched.
Y.Global.on('watch:start', function(e) {
    var el = Y.one('.themes li#theme-'+e.themeId+'.nowatch');
    if(el) {
        el.replaceClass('nowatch', 'watch');
    }
});

Y.Global.on('watch:stop', function(e) {
    var el = Y.one('.themes li#theme-'+e.themeId+'.watch');
    el.replaceClass('watch', 'nowatch');
});

Themer.ThemeView = Y.Base.create('themeView', Y.View, [], {
    
    template: Y.one('#theme-template').getContent(),

    initializer: function(e) {
        this.container = Y.Node.create('<div id="theme-' + e.model.get('id') + '" class="theme-container nowatch"></div>');
        //Attach here instead, because container isn't available during create
        this.container.delegate('click', function() {
            Titanium.Platform.openURL('file://'+e.model.get('path'));
        }, '.path');
        this.container.delegate('click', this.remove, '.remove-theme', this);
    },
    
    render: function() {
        var container = this.container, 
            model = this.model;

        var viewLink = function(themeModel) {
            return 'http://'+themeModel.get('parent_id')+'.myshopify.com/?preview_theme_id='+themeModel.get('id');
        };

        var data = model.toJSON();
        data.viewLink = viewLink(model);
        container.setContent(Y.Lang.sub(this.template, data));
        
        return this;
    },
    
    remove: function(e) {
        console.log('ThemeView:remove');
        this.constructor.superclass.remove.call(this);
        this.model.destroy({'delete': true});
    }    
});


///end
});
