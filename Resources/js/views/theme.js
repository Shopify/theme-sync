YUI().use('view','event-custom','event-focus','array-extras', function(Y) { 
///start

Themer.ThemeView = Y.Base.create('themeView', Y.View, [], {
    container: '<li></li>', 
    
    template: Y.one('#theme-li-template').getContent(),
    
    initializer: function() {
        console.log('ThemeView: initializer');
    },
    
    render: function() {
        var container = this.container, 
            model = this.model;
            
        container.setContent(Y.Lang.sub(this.template, model.toJSON()));
        
        return this;
    }
});


///end
});
