YUI().use(function(Y) { 
/////
//Adds a top level Utility menu item with a Choose Your Editor menu item

var menu = Ti.UI.createMenu(),
    utility = Ti.UI.createMenuItem('Utility');

utility.addItem("Choose 'Open In ...' Editor", function() {
    Themer.Editor.pickEditor();
});

menu.appendItem(utility);
Ti.UI.setMenu(menu);

/////
});

