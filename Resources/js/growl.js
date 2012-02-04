var growl = function(args) {
    args.icon = args.icon || '/img/shopify-36.png';
    Titanium.Notification.createNotification(args).show();
};