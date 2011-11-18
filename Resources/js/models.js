YUI().use('model', 'model-list', function(Y) { 
///start


//Shop Model
Themer.shopModel = Y.Base.create('shopModel', Y.Model, [], {
    sync: PropertiesStorageSync('shop')
}, {
    ATTRS: {
        id: { value: '' },
        api_key: { value: '' },
        password: { value: '' },
        themes: { value: [] } //Themes for this shop being worked on
    }
});

//List of Shop Models
Themer.shopList = Y.Base.create('shopList', Y.ModelList, [], {
    model: Themer.shopModel,
    sync: PropertiesStorageSync('shop')
});


//Storage Layer used for models
//Uses Titanium Properties
//Based off LocalStorageSync from YUI example
function PropertiesStorageSync (key) {
    
    var data = JSON.parse(Titanium.App.Properties.getString(key, '{}'));
    
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

        // if (!Y.Lang.isValue(hash[idAttribute])) {
        //     hash[idAttribute] = generateId();
        // }

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

}



///end
});