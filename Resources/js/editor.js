YUI().use('node', function(Y) { 
/////

var Editor = YUI.namespace('Themer.Editor');

//Hold the user's editor choice.
// Titanium.App.Properties.setString('editor', '');
Editor.app = Titanium.App.Properties.getString('editor', '');

//string path (opt) if provided, we open in the editor after its picked.
Editor.pickEditor = function(path) {
    
    path = path || false;
    
    Titanium.UI.currentWindow.openFileChooserDialog(function(file) {
            if(file.length == 0) { return false; }
            
            var selectedApp = file[0].split('/').pop().replace('.app', '');
            Editor.app = selectedApp;
            Ti.App.Properties.setString('editor', selectedApp);
            Y.all('.editor-name').set('text', selectedApp);
            if(path) {
                Editor.open(path);
            }
            return true;
        },
        {
            title: 'Choose Your Editor',
            multiple:false,
            types:['app']
        }
    );
};

Editor.open = function(path) {
    open_in_editor(Editor.app, path);
};

/////
});
