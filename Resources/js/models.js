YUI().use('model', 'model-list', function(Y) { 
///start

//Shop Models
Themer.shopModel = Y.Base.create('shopModel', Y.Model, [], {
    sync: PropertiesStorageSync('shop')    
}, {
    ATTRS: {
        id: { value: '' },
        api_key: { value: '' },
        password: { value: '' }
    }
});

Themer.shopList = Y.Base.create('shopList', Y.ModelList, [], {
    model: Themer.shopModel,
    sync: PropertiesStorageSync('shop')
});

// Theme models
Themer.themeModel = Y.Base.create('themeModel', Y.Model, [], {
    sync: function(action, options, callback) {
        var sync = Y.bind(PropertiesStorageSync('themes'+this.get('parent_id')), this);
        sync(action, options, callback);
    }
}, {
    ATTRS: {
        id: { value: '' },
        name: { value: '' },
        role: { value: '' },
        created_at: { value: '' },
        updated_at: { value: '' },
        path: { value: '' },
        parent_id: { value: '' } //The ID of the parent shop. needed for saving in proper buckets.
    }
});

Themer.themeList = Y.Base.create('themeList', Y.ModelList, [], {
    model: Themer.themeModel,
    sync: function(action, options, callback) {
        var sync = Y.bind(PropertiesStorageSync('themes'+this.parent_id), this);
        sync(action, options, callback);
    }
});


//Storage Layer used for models
//Uses Titanium Properties
//Based off LocalStorageSync from YUI example
function PropertiesStorageSync(key) {
    
    var data = JSON.parse(Ti.App.Properties.getString(key, '{}'));
    
    function destroy(id) {
        var modelHash;

        if ((modelHash = data[id])) {
            delete data[id];
            save();
        }

        return modelHash;
    }
    
    // Loads a model with the specified id. This method is a little tricky,
    // since it handles loading for both individual models and for an entire
    // model list.
    //
    // If an id is specified, then it loads a single model. If no id is
    // specified then it loads an array of all models. This allows the same sync
    // layer to be used for both the TodoModel and TodoList classes.
    function get(id) {
        return id ? data[id] : Y.Object.values(data);
    }

    function save() {        
        Ti.App.Properties.setString(key, JSON.stringify(data));
    }

    function set(model) {
        var hash        = model.toJSON(),
            idAttribute = model.idAttribute;

        data[hash[idAttribute]] = hash;
        save();

        return hash;
    }

    // Returns a `sync()` function that can be used with either a Model or a
    // ModelList instance.
    return function (action, options, callback) {
        // `this` refers to the Model or ModelList instance to which this sync
        // method is attached.
        var isModel = Y.Model && this instanceof Y.Model;

        switch (action) {
        case 'create': // intentional fallthru
        case 'update':
            callback(null, set(this));
            return;

        case 'read':
            callback(null, get(isModel && this.get('id')));
            return;

        case 'delete':
            callback(null, destroy(isModel && this.get('id')));
            return;
        }
    };

};
Themer.sync = PropertiesStorageSync;

///end
});