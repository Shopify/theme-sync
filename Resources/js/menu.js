YUI().use(function(Y) { 
/////

var menu = Ti.UI.createMenu(),
    utility = Ti.UI.createMenuItem('Utility');

utility.addItem("Choose 'Open In ...' Editor", function() {
    Themer.Editor.pickEditor();
});

menu.appendItem(utility);
Ti.UI.setMenu(menu);

/////
});

