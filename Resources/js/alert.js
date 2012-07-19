//Temporary till we get growl fixed up for 10.7
var fileUploadedAlertHideTimeout = false;
var fileUploadedAlert = function(filename) {
    $('#info-box .message').html(filename);
    $('#info-box').animate(
        { 
            opacity: 1.0
        },
        500,
        function() {
            if(fileUploadedAlertHideTimeout !== false) {
                clearTimeout(fileUploadedAlertHideTimeout);
            }
            fileUploadedAlertHideTimeout = setTimeout(function() {
                $('#info-box').animate({opacity:0}, 1000);
            }, 3000);
        }
    );
};