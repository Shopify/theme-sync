YUI().use('event', 'event-custom','oop', function(Y) {
///

var IO = YUI.namespace('Themer.IO');

Y.Global.on('asset:send', function(e) {
    console.log('asset:send listener');

    var key = e.relative,
        path = e.base.concat(Ti.Filesystem.getSeparator(), e.relative),
        successHandler = function(_e) {
            // fileUploadedAlert(key);
            growl({title: 'File Uploaded', message: key});
        },
        failureHandler = function(_e) {
            if(_e.timedOut) {
                growlTimedOut();
            } 
            else {
                //output error to console
                Ti.API.error(_e.status);
                Ti.API.error(_e.statusText);
                var response = JSON.parse(_e.responseText);
                var errors = response.errors || {};
                Y.each(errors, function(message) {
                    growl({
                        title: 'Error uploading',
                        message: key.concat(' - ', message)
                    });
                });
            }
        };

    IO.sendAsset(e.shop, e.theme, key, path, {success: successHandler, failure: failureHandler});
});

///
});