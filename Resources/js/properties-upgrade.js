//Upgrade fix for 1.2 -> 1.3 of TideSDK
//1.3 changed where app data gets saved, so users will lose any old settings.
//I'd rather not do that to users when they upgrade to new version.
//So, this script is loaded before the app loads, and will move over info if it exists.
(function doPropertiesUpgrade() {

    var oldAppData = Ti.Filesystem.getFile(
        Ti.Filesystem.getUserDirectory()
        , 'Library'
        , Ti.API.getApplication().getName()
        , 'application.properties'
    );

    var alreadyUpgraded = Ti.App.Properties.hasProperty('upgradeTideSDK1_2_to_1_3');

    //Nothing to do
    if(!oldAppData.exists() || alreadyUpgraded) {
        console.log('No upgrade required');
        return false;
    }

    var oldProperties =  Ti.App.loadProperties(oldAppData.toString())
        , propertyKeys = oldProperties.listProperties()
        ;

    propertyKeys.forEach(function(item) {
        Ti.App.Properties.setString(item, oldProperties.getString(item));
    });

    //Set a new property - upgrade done, so we never run it again.
    Ti.App.Properties.setInt('upgradeTideSDK1_2_to_1_3', 1);
    return true;
})();
