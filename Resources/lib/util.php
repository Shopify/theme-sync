//A file to smooth over any shortcomings of Titanium

// Ti.Codec.decodeBase64 doesn't work as expected. 
// This is a workaround to write encoded binary assets to the disk
function writeBase64Asset($path, $data) {
    return file_put_contents($path, base64_decode($data));
}