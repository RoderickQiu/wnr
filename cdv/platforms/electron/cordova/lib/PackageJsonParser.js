/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('fs-extra');
const path = require('path');
const { events } = require('cordova-common');

class PackageJsonParser {
    constructor(wwwDir) {
        this.path = path.join(wwwDir, 'package.json');
        this.www = wwwDir;
        this.package = {
            main: 'cdv-electron-main.js'
        };
    }

    configure(config, projectPackageJson) {
        if (config) {
            this.package.name = config.packageName() || 'com.scrisstudio.wnr';
            this.package.displayName = config.name() || 'wnr';
            this.package.version = config.version() || '1.0.0';
            this.package.description = config.description() || 'A sample Apache Cordova application that responds to the deviceready event.';

            const cordovaDependencies = Object.keys(projectPackageJson.dependencies)
                .filter((npmPackage) => /^cordova(?!-plugin)-/.test(npmPackage));

            // If Cordova dependencies are detected in "dependencies" of "package.json" warn for potential app package bloating
            if (cordovaDependencies.length) {
                events.emit('warn', '[Cordova Electron] The built package size may be larger than necessary. Please run with --verbose for more details.');

                events.emit('verbose', `[Cordova Electron] The following Cordova package(s) were detected as "dependencies" in the projects "package.json" file.
\t- ${cordovaDependencies.join('\n\t- ')}

It is recommended that all Cordova packages are defined as "devDependencies" in the "package.json" file. It is safe to move them manually.
Packages defined as a dependency will be bundled with the application and can increase the built application's size.
`);
            }

            this.package.dependencies = projectPackageJson.dependencies;

            this.configureHomepage(config);
            this.configureLicense(config);

            if (config.doc.find('author').attrib.email) {
                this.package.author = {
                    name: config.author() || 'Apache Cordova Team',
                    email: config.doc.find('author').attrib.email
                };
            } else {
                this.package.author = config.author() || 'Apache Cordova Team';
            }
        }

        return this;
    }

    configureHomepage(config) {
        this.package.homepage = (config.doc.find('author') && config.doc.find('author').attrib['href']) || 'https://cordova.io';
    }

    configureLicense(config) {
        this.package.license = (config.doc.find('license') && config.doc.find('license').text && config.doc.find('license').text.trim()) || 'Apache-2.0';
    }

    write() {
        fs.writeFileSync(this.path, JSON.stringify(this.package, null, 2), 'utf8');
    }
}

module.exports = PackageJsonParser;
