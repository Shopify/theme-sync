YUI().use(function(Y) { 
/////

var menu = Titanium.UI.createMenu(),
    utility = Titanium.UI.createMenuItem('Utility');

utility.addItem("Choose 'Open With...' Editor", function() {
    alert('run!');
});

menu.appendItem(utility);
Titanium.UI.setMenu(menu);

/////
});

