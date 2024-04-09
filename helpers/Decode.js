const aesjs = require('aes-js');
require('dotenv').config()

function Decode(encryptedHex) {
    var key = process.env.KEY;
    key = key.split(", ")
    key = key.map(function (x) {
        return parseInt(x, 10);
    });

    var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

    return decryptedText;
}

module.exports = {
    Decode
}