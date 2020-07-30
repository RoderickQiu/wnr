const fs = require("fs");
const path = require("path");

fs.access('../../.env', (err) => {
    if (err) {
        fs.writeFile(path.join(__dirname, "../../.env"), "\r\rNODE_ENV=\"" + process.env.NODE_ENV + "\"", function (err) {
            if (err) {
                console.log(err);
                return false;
            }
        });//write to a brand new file
    } else {
        fs.appendFile(path.join(__dirname, "../../.env"), "\r\rNODE_ENV=\"" + process.env.NODE_ENV + "\"", 'utf-8', function (err) {
            if (err) {
                console.log(err);
                return false;
            }
        });//append to a existing file
    }
});

