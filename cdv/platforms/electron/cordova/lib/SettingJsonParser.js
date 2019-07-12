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
const { deepMerge } = require('./util');

class SettingJsonParser {
    constructor (wwwDir) {
        this.path = path.join(wwwDir, 'cdv-electron-settings.json');
        this.package = require(this.path);
    }

    configure (config, userElectronSettingsPath) {
        // Apply user settings ontop of defaults.
        if (userElectronSettingsPath) {
            const userElectronSettings = require(userElectronSettingsPath);
            this.package = deepMerge(this.package, userElectronSettings);
        }

        if (config) {
            this.package.browserWindow.webPreferences.devTools = !config.release;
        }

        return this;
    }

    write () {
        fs.writeFileSync(this.path, JSON.stringify(this.package, null, 2), 'utf8');
    }
}

module.exports = SettingJsonParser;
