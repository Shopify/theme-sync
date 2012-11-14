//There is a bug as of 1.2.0(RC6e) where files in 
//Resources aren't being copied with proper permissions.
//This aims to fix that. 
var path_to_script = [
    Ti.Filesystem.getResourcesDirectory(),
    'lib','watch_server.rb'].join(Ti.Filesystem.getSeparator());

var chmoder= Ti.Process.createProcess({
   args: ['chmod', '755', path_to_script],
   env: {'PATH': '/bin'}
});

console.log('Fixing perms on: '+path_to_script);

chmoder.launch();
