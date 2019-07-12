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
const shell = require('shelljs');
const { ConfigParser, xmlHelpers, events, CordovaError } = require('cordova-common');
const ManifestJsonParser = require('./ManifestJsonParser');
const PackageJsonParser = require('./PackageJsonParser');
const SettingJsonParser = require('./SettingJsonParser');

module.exports.prepare = function (cordovaProject, options) {
    // First cleanup current config and merge project's one into own
    const defaultConfigPath = path.join(this.locations.platformRootDir, 'cordova', 'defaults.xml');
    const ownConfigPath = this.locations.configXml;
    const sourceCfg = cordovaProject.projectConfig;

    // If defaults.xml is present, overwrite platform config.xml with it.
    // Otherwise save whatever is there as defaults so it can be
    // restored or copy project config into platform if none exists.
    if (fs.existsSync(defaultConfigPath)) {
        this.events.emit('verbose', `Generating config.xml from defaults for platform "${this.platform}"`);
        fs.copySync(defaultConfigPath, ownConfigPath);
    } else if (fs.existsSync(ownConfigPath)) {
        this.events.emit('verbose', `Generating defaults.xml from own config.xml for platform "${this.platform}"`);
        fs.copySync(ownConfigPath, defaultConfigPath);
    } else {
        this.events.emit('verbose', `case 3 "${this.platform}"`);
        fs.copySync(sourceCfg.path, ownConfigPath);
    }

    // merge our configs
    this.config = new ConfigParser(ownConfigPath);
    xmlHelpers.mergeXml(sourceCfg.doc.getroot(), this.config.doc.getroot(), this.platform, true);
    this.config.write();

    // Update own www dir with project's www assets and plugins' assets and js-files
    this.parser.update_www(cordovaProject, this.locations);
    // Update icons
    updateIcons(cordovaProject, this.locations);
    // Update splash screens
    updateSplashScreens(cordovaProject, this.config, this.locations);

    // Copy or Create manifest.json
    const srcManifestPath = path.join(cordovaProject.locations.www, 'manifest.json');
    if (fs.existsSync(srcManifestPath)) {
        // just blindly copy it to our output/www
        // todo: validate it? ensure all properties we expect exist?
        const manifestPath = path.join(this.locations.www, 'manifest.json');
        this.events.emit('verbose', `Copying ${srcManifestPath} => ${manifestPath}`);
        fs.copySync(srcManifestPath, manifestPath);
    } else {
        this.events.emit('verbose', `Creating new manifest file in => ${this.path}`);

        (new ManifestJsonParser(this.locations.www))
            .configure(this.config)
            .write();
    }

    const projectPackageJson = JSON.parse(fs.readFileSync(path.join(cordovaProject.root, 'package.json'), 'utf8'));

    (new PackageJsonParser(this.locations.www))
        .configure(this.config, projectPackageJson)
        .write();

    const userElectronSettings = cordovaProject.projectConfig.getPlatformPreference('ElectronSettingsFilePath', 'electron');
    const userElectronSettingsPath = userElectronSettings && fs.existsSync(path.resolve(cordovaProject.root, userElectronSettings))
        ? path.resolve(cordovaProject.root, userElectronSettings)
        : undefined;

    // update Electron settings in .json file
    (new SettingJsonParser(this.locations.www))
        .configure(options.options, userElectronSettingsPath)
        .write();

    // update project according to config.xml changes.
    return this.parser.update_project(this.config, options);
};

/**
 * Update Electron Splash Screen image.
 */
function updateSplashScreens (cordovaProject, config, locations) {
    const splashScreens = cordovaProject.projectConfig.getSplashScreens('electron');

    // Skip if there are no splash screens defined in config.xml
    if (!splashScreens.length) {
        events.emit('verbose', 'This app does not have splash screens defined.');
        return;
    }

    const splashScreen = prepareSplashScreens(splashScreens);
    const resourceMap = createResourceMap(cordovaProject, locations, splashScreen);

    updatePathToSplashScreen(config, locations, resourceMap);

    events.emit('verbose', 'Updating splash screens');
    copyResources(cordovaProject.root, resourceMap);
}

/**
 *  Get splashScreen image. Choose only one image, if the user provided multiple.
 */
function prepareSplashScreens (splashScreens) {
    let splashScreen;
    // choose one icon for a target
    const chooseOne = (defaultSplash, splash) => {
        events.emit('verbose', `Found extra splash screen image: ${defaultSplash.src} and ignoring in favor of ${splash.src}.`);

        defaultSplash = splash;

        return defaultSplash;
    };

    // iterate over remaining icon elements to find the icons for the app and installer
    for (let i = 0; i < splashScreens.length; i++) {
        let image = splashScreens[i];
        image.extension = path.extname(image.src);

        splashScreen = splashScreen ? chooseOne(splashScreen, image) : image;
    }

    return { splashScreen };
}

/**
 *  Update path to Splash Screen in the config.xml
 */
function updatePathToSplashScreen (config, locations, resourceMap) {
    const elementKeys = Object.keys(resourceMap[0]);
    const splashScreenPath = resourceMap[0][elementKeys];

    const splash = config.doc.find('splash');
    const preferences = config.doc.findall('preference');

    splash.attrib.src = path.relative(locations.www, splashScreenPath);
    for (let i = 0; i < preferences.length; i++) {
        if (preferences[i].attrib.name === 'SplashScreen') {
            preferences[i].attrib.value = splash.attrib.src;
        }
    }
    config.write();
}

/**
 * Update Electron App and Installer icons.
 */
function updateIcons (cordovaProject, locations) {
    const icons = cordovaProject.projectConfig.getIcons('electron');

    // Skip if there are no app defined icons in config.xml
    if (!icons.length) {
        events.emit('verbose', 'This app does not have icons defined');
        return;
    }

    checkIconsAttributes(icons);

    const choosenIcons = prepareIcons(icons);
    const resourceMap = createResourceMap(cordovaProject, locations, choosenIcons);

    events.emit('verbose', 'Updating icons');
    copyResources(cordovaProject.root, resourceMap);
}

/**
 * Check if all required attributes are set.
 */
function checkIconsAttributes (icons) {
    let errorMissingAttributes = [];
    let errorWrongSize = [];
    let errorMessage = [];
    icons.forEach(icon => {
        if (!icon.src) {
            errorMissingAttributes.push(icon.target ? icon.target : 'size=' + (icon.height || icon.width));
        }
        if ((icon.height && icon.width) < 512 && (icon.height && icon.width) !== undefined) {
            errorWrongSize.push(icon.target === 'installer' ? `for target: ${icon.target}` : `given: width=${icon.width} height=${icon.height}`);
        }
    });
    if (errorMissingAttributes.length > 0) {
        errorMessage.push(`One of the following attributes are set but missing the other for the target: ${errorMissingAttributes}. Please ensure that all required attributes are defined.`);
    }
    if (errorWrongSize.length > 0) {
        errorMessage.push(`Size of icon does not match required size ${errorWrongSize}. Please ensure that .png icon for is at least 512x512.`);
    }
    if (errorMessage.length > 0) {
        throw new CordovaError(errorMessage);
    }
}

/**
 *  Find and select icons for the app and installer.
 *  Also, set high resolution icons, if provided by a user.
 */
function prepareIcons (icons) {
    let customIcon;
    let appIcon;
    let installerIcon;

    // choose one icon for a target
    const chooseOne = (defaultIcon, icon) => {
        events.emit('verbose', `Found extra icon for target ${icon.target}: ${defaultIcon.src} and ignoring in favor of ${icon.src}.`);

        defaultIcon = icon;

        return defaultIcon;
    };

    // find if there is high resolution images that has DPI suffix
    const highResAndRemainingIcons = findHighResIcons(icons);

    const highResIcons = highResAndRemainingIcons.highResIcons;
    const remainingIcons = highResAndRemainingIcons.remainingIcons;

    // iterate over remaining icon elements to find the icons for the app and installer
    for (let i = 0; i < remainingIcons.length; i++) {
        // if (fs.existsSync(icons[i].src)) {
        let icon = remainingIcons[i];
        const size = icon.width || icon.height;
        icon.extension = path.extname(icon.src);

        switch (icon.target) {
        case 'app':
            appIcon = appIcon ? chooseOne(appIcon, icon) : icon;
            break;
        case 'installer':
            installerIcon = installerIcon ? chooseOne(installerIcon, icon) : icon;
            break;
        case undefined:
            if ((size >= 512 || size === undefined) && !Object.keys(highResIcons).length) {
                customIcon = customIcon ? chooseOne(customIcon, icon) : icon;
            }
            break;
        }
    }

    return { customIcon, appIcon, installerIcon, highResIcons };
}

/**
 *  Find and high resolution icons and return remaining icons,
 *  unless an icon has a specified target.
 */
function findHighResIcons (icons) {
    // find icons that are not in the highResIcons, unless they have a target set
    const findRemainingIcons = (icons, highResIcons) => icons.filter(
        (icon) => (icon.target || (!icon.target && !highResIcons.includes(icon)))
            ? Object.assign(icon)
            : false
    );

    let highResIcons = icons.filter(icon => {
        if (icon.src.includes('@')) {
            const extension = path.extname(icon.src);
            const suffix = icon.src.split('@').pop().slice(0, -extension.length);

            return Object.assign(icon, { suffix, extension });
        }
    });

    let remainingIcons = findRemainingIcons(icons, highResIcons);
    // set normal image that has standard resolution
    const has1x = highResIcons.find(obj => obj.suffix === '1x');
    if (!has1x && Object.keys(highResIcons).length) {
        const highResIcon = highResIcons[Object.keys(highResIcons)[0]];
        let baseIcon = remainingIcons.find(obj => obj.src === highResIcon.src.split('@')[0] + highResIcon.extension);

        if (!baseIcon) {
            throw new CordovaError('Base icon for high resolution images was not found.');
        }

        const extension = path.extname(baseIcon.src);
        const suffix = '1x';

        baseIcon = Object.assign(baseIcon, { suffix, extension });

        highResIcons.push(baseIcon);

        remainingIcons = findRemainingIcons(icons, highResIcons);
    }

    return { highResIcons, remainingIcons };
}

/**
 * Map resources to the appropriate target directory and name.
 */
function createResourceMap (cordovaProject, locations, resources) {
    let resourceMap = [];

    for (const key in resources) {
        const resource = resources[key];

        if (!resource) {
            continue;
        }

        let targetPath;
        switch (key) {
        case 'customIcon':
            // Copy icon for the App
            targetPath = path.join(locations.www, 'img', `app${resource.extension}`);
            resourceMap.push(mapResources(cordovaProject.root, resource.src, targetPath));
            // Copy icon for the Installer
            targetPath = path.join(locations.buildRes, `installer${resource.extension}`);
            resourceMap.push(mapResources(cordovaProject.root, resource.src, targetPath));
            break;
        case 'appIcon':
            targetPath = path.join(locations.www, 'img', `app${resource.extension}`);
            resourceMap.push(mapResources(cordovaProject.root, resource.src, targetPath));
            break;
        case 'installerIcon':
            targetPath = path.join(locations.buildRes, `installer${resource.extension}`);
            resourceMap.push(mapResources(cordovaProject.root, resource.src, targetPath));
            break;
        case 'highResIcons':
            for (const key in resource) {
                const highResIcon = resource[key];
                targetPath = path.join(locations.www, 'img', 'icon');
                targetPath += highResIcon.suffix === '1x' ? highResIcon.extension : `@${highResIcon.suffix}${highResIcon.extension}`;
                resourceMap.push(mapResources(cordovaProject.root, highResIcon.src, targetPath));
            }
            break;
        case 'splashScreen':
            targetPath = path.join(locations.www, `.cdv`, `splashScreen${resource.extension}`);
            resourceMap.push(mapResources(cordovaProject.root, resource.src, targetPath));
            break;
        }
    }
    return resourceMap;
}

/**
 * Get a map containing resources of a specified name (or directory) to the target directory.
 */
function mapResources (rootDir, sourcePath, targetPath) {
    let pathMap = {};
    shell.ls(path.join(rootDir, sourcePath)).forEach(() => {
        pathMap[sourcePath] = targetPath;
    });
    return pathMap;
}

/**
 * Copy resources to the target destination according to the resource map.
 */
function copyResources (rootDir, resourceMap) {
    resourceMap.forEach(element => {
        const elementKeys = Object.keys(element);

        if (elementKeys.length) {
            const value = elementKeys.map((e) => element[e])[0];
            fs.copySync(path.join(rootDir, elementKeys[0]), value);
        }
    });
}
