YUI().use(function(Y) { 
/////

var menu = Titanium.UI.createMenu(),
    utility = Titanium.UI.createMenuItem('Utility');

utility.addItem("Choose 'Open In ...' Editor", function() {
    Themer.Editor.pickEditor();
});

menu.appendItem(utility);
Titanium.UI.setMenu(menu);

/////
});

