const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');
const csso = require('@node-minify/csso');
const htmlMinifier = require('@node-minify/html-minifier');
const jsonMinify = require('@node-minify/jsonminify');
const fs = require('fs');
const path = require('path');

const originUrl = path.join(__dirname, '/../../');
const outputUrl = path.join(__dirname, '/../../output');

if (fs.existsSync(outputUrl)) {//if the folder already exists
    removePromise(outputUrl).then(() => {//remove the former folder
        minifier();//copy and minify
    })
} else {
    minifier();//copy and minify
}

function minifier() {
    copyDir(originUrl, outputUrl, {});//copy original files to the temp directory

    fs.readdirSync(outputUrl).forEach(function (fileName) {
        try {
            if (fileName.indexOf(".js") != -1)
                minify({
                    compressor: terser,
                    input: path.join(originUrl, fileName),
                    output: path.join(outputUrl, fileName),
                    callback: function (err, min) { }
                });
            else if (fileName.indexOf(".css") != -1)
                minify({
                    compressor: csso,
                    input: path.join(originUrl, fileName),
                    output: path.join(outputUrl, fileName),
                    callback: function (err, min) { }
                });
            /*else if (fileName.indexOf(".html") != -1)
                minify({
                    compressor: htmlMinifier,
                    input: path.join(originUrl, fileName),
                    output: path.join(outputUrl, fileName),
                    callback: function (err, min) { }
                });*///disabled because it's sometimes buggy
        } catch (e) {
            console.log(e);
        }
    });//change files with minified ones

    fs.readdirSync(path.join(originUrl, 'locales')).forEach(function (fileName) {
        try {
            if (fileName.indexOf(".json") != -1)
                minify({
                    compressor: jsonMinify,
                    input: path.join(path.join(originUrl, 'locales'), fileName),
                    output: path.join(path.join(outputUrl, 'locales'), fileName),
                    callback: function (err, min) { }
                });
        } catch (e) {
            console.log(e);
        }
    });//change locale jsons with minified ones

    setTimeout(function () {
        console.log("\nMinification finished. If you saw some warnings, just ignore them - in most cases, wnr will be fine. ");
    }, 500);
}

function removePromise(dir) {
    return new Promise(function (resolve, reject) {
        fs.stat(dir, function (err, stat) {
            if (stat.isDirectory()) {
                fs.readdir(dir, function (err, files) {
                    files = files.map(file => path.join(dir, file));
                    files = files.map(file => removePromise(file));
                    Promise.all(files).then(function () {
                        fs.rmdir(dir, resolve);
                    })
                })
            } else {
                fs.unlink(dir, resolve);
            }
        })

    })
}


function copyDir(f, t, c = {}) {
    let _f = f, _t = t;
    if (c.relative) {
        let _f = path.resolve(process.cwd(), f);
        let _t = path.join(process.cwd(), t);
    }
    _copydir(_f, _t);
}
function _copydir(f, t) {
    try {
        fs.accessSync(t);
    } catch (e) {
        fs.mkdirSync(t);
    }
    try {
        fs.readdirSync(f).forEach(function (p) {
            let _f = f + '/' + p;
            let _t = t + '/' + p;
            try {
                let stat = fs.statSync(_f);
                if (stat.isFile()) {
                    fs.writeFileSync(_t, fs.readFileSync(_f));
                } else if (stat.isDirectory()) {
                    if (p != "designs" && p != "packaged" && p != ".git" && p != "output")
                        _copydir(_f, _t);
                }
            } catch (e) {
                console.log(e);
            }
        })
    } catch (e) {
        console.log(e);
    }
}