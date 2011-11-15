YUI().use('model', 'model-list', function(Y) { 
///start

Themer.shopModel = Y.Base.create('shopModel', Y.Model, [], {
    //Any prototype methods needed
    
}, {
    ATTRS: {
        id: {
            value: ''
        },
        api_key: {
            value: ''
        },
        password: {
            value: ''
        },
        themes: {
            value: []
        }
    }
});


Y.ShopList = Y.Base.create('shopList', Y.ModelList, [], {
    model: Themer.shopModel
});
///end
});