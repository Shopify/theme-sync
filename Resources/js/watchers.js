YUI().use(function(Y) {
//BEGIN Y closure
var Watcher = YUI.namespace('Themer.Watcher');

Watcher.processes = [];

//Initialize all watchers on startup
Watcher.init = function(app) {

    app.shops.each(function(shop) {
        var themes = new Themer.themeList();
        themes.parent_id = shop.get('id');
        themes.load();

        themes.each(function(theme) {
            Watcher.watch(shop, theme);
        });

    });
};

Watcher.watch = function(shop, theme) {

    //Need to send in port as a string, else 'd' appended to it: ie: 40000 becomes 40000d
    console.log('Watch '+theme.get('id'));
    var port = '40003';

    var process = Titanium.Process.createProcess({
        args: ["/Users/mitch/src/shopify-theme2/Resources/lib/watch_server.rb",port],
        env: {'PATH': '/usr/bin:/bin'}
    });

    process.launch();
    Watcher.processes.push(process);
    
    //@todo check if we get a race condition where process isn't running, but we try to establish socket
    console.log('Watch process launched: '+ process.getPID());
    console.log('Watch process running: '+ process.isRunning());
    Watcher.connect(shop, theme, port);
};

Watcher.connect = function(shop, theme, port) {
    console.log('Connecting socket theme: '+theme.get('id') +  ' on port '+ port);

    //port needs to be an int
    var socket = Titanium.Network.createTCPSocket('127.0.0.1', parseInt(port, 10));

    socket.onError(function(e) {
        console.log('Error with socket');
        console.log(e);
    });
    socket.onTimeout(function(e) {
        console.log('Timeout with socket');
        // console.log(e);
    });
    socket.onRead(function(e) {
        console.log('Read');
        console.log(e.toString());
    });
    socket.onReadComplete(function(e) {
        console.log('ReadComplete');
    });
    socket.connect();
    console.log('Socket is closed? '+ socket.isClosed());
};

//Clean up watchers on exit.
Ti.API.addEventListener(Titanium.APP_EXIT, function() {
    Titanium.API.warn('Exiting...');
    Watcher.processes.forEach(function(p) {

        Titanium.API.warn('Killing '+ p.getPID());
        if(p.isRunning()) {
            p.kill();
        }
    });
});


//end closure
});
