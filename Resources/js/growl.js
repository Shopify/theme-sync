// Simple wrapper for easy growl messaging
var growl = function(args) {
    args.icon = args.icon || '/img/shopify-36.png';
    Ti.Notification.createNotification(args).show();
};

var growlTimedOut = function() {
    growl({
        title: 'Error contacting Shopify',
        message: 'The connection timed out. Please check your network and try again.'
    });
};