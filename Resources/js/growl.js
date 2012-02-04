var growl = function(args) {
    args.icon = args.icon || '/img/shopify-36.png';
    Titanium.Notification.createNotification(args).show();
};

var growlTimedOut = function() {
    growl({
        title: 'Error contacting Shopify',
        message: 'The connection timed out. Please try again.'
    });
};