Shopify Theme Developer Tool Anatomy
====================================

This document goes over some of the details of the app. Please contact [meeech](https://github.com/meeech) if you have any questions or suggestions. Pull requests welcome.

The core of the app is built using the App Framework from YUI 3.4.1, and the front is some customized Bootstrap.

As a desktop app, resources are shipped with the app, so there was no reason for minification & concatination. 

TideSDK apps are basically HTML running in a webkit browser, with a `Ti` js object available in the global scope with allows access to system functionality. A good analogy is phonegap for the desktop. 

Files for the app live under `Resources` - paths are relative to that.

`index.html` The core of the app, this loads first, and behaves how you would expect a regular HTML page loaded in a browser to behave. This is where you would start. Contains markup for the app, as well as some templates which we pull in as needed.

`js/permfix.js` Intended to work around a bug where when packaging the app Resources aren't being copied with proper permissions. On startup, this will fix the permissions on `lib/watch_server.rb` so that it is executable.

`js/config.js` Where the App API Key lives. 

`lib/util.php` Used to spackle over some minor shortcomings of TideSDK. 

Watch Servers
-------------

`lib/watch_server.rb` This is the watch server we spin up to listen for changes to the filesystem. The script is executed using `Ti.Process`, and relies on stock Ruby 1.8.7 which ships with OSX. 

`js/watchers.js` This is the JS which we use to control & track watch servers.

Authentication
--------------

`/Resources/vendor/auth`

The app uses the old Shopify Auth method for apps. 

Problem: We are distributing the app for desktop, and all the code is visible to anyone digging into the package contents, which would include the shared secret key. 

Solution: A simple script running on Node. This lets us keep our shared secret key secret. When the user Adds a Shop, they are sent to the auth url for the app. This will then redirect to user to our Node app, which will generate the password for the shop, and redirect the user back to the application.

In `app.js` you can see we check for the existence of querystring. If one exists, we can infer a new shop is being added, at which point we parse out the password & create the new shop. 


