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
const events = require('cordova-common').events;
const { deepMerge } = require('./util');

const PLATFORM_MAPPING = {
    linux: 'linux',
    mac: 'darwin',
    windows: 'win32',
    win: 'win32'
};

class ElectronBuilder {
    constructor (buildOptions, api) {
        this.api = api;
        this.isDevelopment = buildOptions.debug;
        this.buildConfig = buildOptions && buildOptions.buildConfig && fs.existsSync(buildOptions.buildConfig) ? require(buildOptions.buildConfig) : false;
    }

    configure () {
        this.buildSettings = this.configureUserBuildSettings()
            .configureBuildSettings();

        // Replace the templated placeholders with the project defined settings into the buildSettings.
        this.injectProjectConfigToBuildSettings();

        return this;
    }

    configureUserBuildSettings () {
        if (this.buildConfig && this.buildConfig.electron) {
            let userBuildSettings = {};

            for (const platform in this.buildConfig.electron) {
                if (platform !== 'mac' && platform !== 'linux' && platform !== 'windows') continue;

                const platformConfigs = this.buildConfig.electron[platform];
                /**
                 * In this scenario, the user has added a valid platform to build for but has not provided any custom build configurations.
                 * This will fetch thew platform's default build configuration.
                 * Each platform's default build configurations are located in the "./build/" directory.
                 */
                if (Object.keys(platformConfigs).length === 0) {
                    userBuildSettings = deepMerge(userBuildSettings, this.fetchPlatformDefaults(PLATFORM_MAPPING[platform]));
                    continue;
                }

                /**
                 * Validate that the platform configuration properties provided are valid.
                 * Any invalid property will be warned and iggnored.
                 * If there is there are no valid properties
                 */
                if (!this.__validateUserPlatformBuildSettings(platformConfigs)) {
                    throw Error(`The platform "${platform}" contains an invalid property. Valid properties are: package, arch, signing`);
                }

                // Electron uses "win" as it's key, not "windows", so we will update here. We use windows in our settings for clarity.
                this.__formatAppendUserSettings(
                    (platform === 'windows' ? 'win' : platform),
                    platformConfigs,
                    userBuildSettings
                );

                this.___overridablePerPlatformOptions(
                    (platform === 'windows' ? 'win' : platform),
                    platformConfigs,
                    userBuildSettings
                );
            }

            this.userBuildSettings = userBuildSettings;
        }

        return this;
    }

    __formatAppendUserSettings (platform, platformConfigs, userBuildSettings) {
        // Add the platform at the root level to trigger build.
        userBuildSettings[platform] = [];

        // Add the config placeholder for build configurations (only add once if missing)
        if (!userBuildSettings.config) userBuildSettings.config = {};

        userBuildSettings.config[platform] = {
            target: []
        };

        // Apply custom app installer icon when the user is using a custom build configuration
        // eslint-disable-next-line no-template-curly-in-string
        userBuildSettings.config[platform].icon = '${APP_INSTALLER_ICON}';

        // Only macOS has a build type distinction. (development or distribution)
        // eslint-disable-next-line no-template-curly-in-string
        if (platform === 'mac') userBuildSettings.config[platform].type = '${BUILD_TYPE}';

        if (platformConfigs.package) {
            platformConfigs.package.forEach((target) => {
                if (target === 'mas') {
                    userBuildSettings.config['mas'] = {};
                }

                if (typeof target === 'object' && Object.keys(target).length !== 0) {
                    const targetKey = Object.keys(target)[0];
                    userBuildSettings.config[targetKey] = target[targetKey];
                    target = targetKey;
                }

                /**
                 * The target of arch values are not validated as electron-builder will handle this.
                 * If the arch value is missing, 64-bit will be defaulted.
                 */
                userBuildSettings.config[platform].target.push({
                    target,
                    arch: platformConfigs.arch || ['x64']
                });
            });
        } else {
            /**
             * We will fetch and use the defaults when a package type is not identified.
             * If the arch value is identified, we will update each default package with the correct arch.
             */
            const platformDefaults = this.fetchPlatformDefaults(PLATFORM_MAPPING[platform]);
            let platformTargetPackages = platformDefaults.config[platform].target;

            if (platformConfigs.arch) {
                platformTargetPackages.forEach((pkg, i) => {
                    platformTargetPackages[i].arch = platformConfigs.arch;
                });
            }

            userBuildSettings.config[platform].target = platformTargetPackages;
        }

        if (platformConfigs.signing) {
            this.__appendUserSigning(platform, platformConfigs.signing, userBuildSettings);
        }
    }

    ___overridablePerPlatformOptions (platform, platformConfigs, userBuildSettings) {
        const PLATFORM_TOP_LEVEL_OPTIONS = {
            allPlatforms: [
                'appId',
                'artifactName',
                'asar',
                'compression',
                'detectUpdateChannel',
                'electronUpdaterCompatibility',
                'extraFiles',
                'extraResources',
                'fileAssociations',
                'files',
                'forceCodeSigning',
                'generateUpdatesFilesForAllChannels',
                'icon',
                'publish'
            ],
            linux: [
                'category',
                'description',
                'desktop',
                'executableName',
                'maintainer',
                'mimeTypes',
                'synopsis',
                'vendor'
            ],
            mac: [
                'binaries',
                'bundleShortVersion',
                'bundleVersion',
                'category',
                'darkModeSupport',
                'electronLanguages',
                'extendInfo',
                'extraDistFiles',
                'helperBundleId',
                'minimumSystemVersion'
            ],
            win: [
                'legalTrademarks',
                'publisherName',
                'requestedExecutionLevel',
                'rfc3161TimeStampServer',
                'signAndEditExecutable',
                'signDlls',
                'timeStampServer',
                'verifyUpdateCodeSignature'
            ]
        };

        for (let option in platformConfigs) {
            if (
                PLATFORM_TOP_LEVEL_OPTIONS['allPlatforms'].includes(option)
                || PLATFORM_TOP_LEVEL_OPTIONS[platform].includes(option)
            ) {
                userBuildSettings.config[platform][option] = platformConfigs[option];
            }
        }
    }

    __appendUserSigning (platform, signingConfigs, userBuildSettings) {
        if (platform === 'linux') {
            events.emit('warn', `The provided signing information for the Linux platform is ignored. Linux does not support signing.`);
            return this;
        }

        const config = this.isDevelopment ? signingConfigs.debug : signingConfigs.release;
        if (platform === 'mac' && config) {
            this.__appendMacUserSigning(config, userBuildSettings.config.mac);
        }

        const masConfig = this.isDevelopment ? null : (signingConfigs.store || null);
        if (platform === 'mac' && masConfig) {
            // Requirements is not available for mas.
            if (masConfig.requirements) delete masConfig.requirements;
            this.__appendMacUserSigning(masConfig, userBuildSettings.config.mas);
        }

        if (platform === 'win' && config) {
            this.__appendWindowsUserSigning(config, userBuildSettings.config.win);
        }
    }

    __validateUserPlatformBuildSettings (platformConfigs) {
        return !!(
            platformConfigs.package
            || platformConfigs.arch
            || platformConfigs.signing
        );
    }

    __appendMacUserSigning (config, buildConfigs) {
        if (config.identity || process.env.CSC_LINK || process.env.CSC_NAME) buildConfigs.identity = config.identity || process.env.CSC_LINK || process.env.CSC_NAME;

        const entitlements = config.entitlements;
        if (entitlements && fs.existsSync(entitlements)) {
            buildConfigs.entitlements = entitlements;
        } else if (entitlements) {
            events.emit('warn', `The provided entitlements file does not exist in the given path => ${entitlements}`);
        }

        const entitlementsInherit = config.entitlementsInherit;
        if (entitlementsInherit && fs.existsSync(entitlementsInherit)) {
            buildConfigs.entitlementsInherit = entitlementsInherit;
        } else if (entitlementsInherit) {
            events.emit('warn', `The provided entitlements inherit file does not exist in the given path => ${entitlementsInherit}`);
        }

        const requirements = config.requirements;
        if (requirements && fs.existsSync(requirements)) {
            buildConfigs.requirements = requirements;
        } else if (requirements) {
            events.emit('warn', `The provided requirements file does not exist in the given path => ${requirements}`);
        }

        const provisioningProfile = config.provisioningProfile;
        if (provisioningProfile && fs.existsSync(provisioningProfile)) {
            buildConfigs.provisioningProfile = provisioningProfile;
        } else if (provisioningProfile) {
            events.emit('warn', `The provided provisioning profile does not exist in the given path => ${provisioningProfile}`);
        }
    }

    __appendWindowsUserSigning (config, buildConfigs) {
        const certificateFile = config.certificateFile;
        if (certificateFile && fs.existsSync(certificateFile)) {
            buildConfigs.certificateFile = certificateFile;

            if (config.certificatePassword || process.env.CSC_KEY_PASSWORD) buildConfigs.certificatePassword = config.certificatePassword || process.env.CSC_KEY_PASSWORD;
        } else if (certificateFile) {
            events.emit('warn', `The provided certificate file does not exist in the given path => ${certificateFile}`);
        }

        if (config.certificateSubjectName) buildConfigs.certificateSubjectName = config.certificateSubjectName;
        if (config.certificateSha1) buildConfigs.certificateSha1 = config.certificateSha1;
        if (config.signingHashAlgorithms) buildConfigs.signingHashAlgorithms = config.signingHashAlgorithms;

        const additionalCertificateFile = config.additionalCertificateFile;
        if (additionalCertificateFile && fs.existsSync(additionalCertificateFile)) {
            buildConfigs.additionalCertificateFile = additionalCertificateFile;
        } else if (additionalCertificateFile) {
            events.emit('warn', `The provided addition certificate file does not exist in the given path => ${additionalCertificateFile}`);
        }
    }

    configureBuildSettings () {
        const baseConfig = require(path.resolve(__dirname, './build/base.json'));
        const platformConfig = this.userBuildSettings || this.fetchPlatformDefaults(process.platform);

        return deepMerge(baseConfig, platformConfig);
    }

    injectProjectConfigToBuildSettings () {
        // const isDevelopment = false;
        const packageJson = require(path.join(this.api.locations.www, 'package.json'));
        const userConfig = {
            APP_ID: packageJson.name,
            APP_TITLE: packageJson.displayName,
            APP_INSTALLER_ICON: 'installer.png',
            APP_BUILD_DIR: this.api.locations.build,
            APP_BUILD_RES_DIR: this.api.locations.buildRes,
            APP_WWW_DIR: this.api.locations.www,
            BUILD_TYPE: this.isDevelopment ? 'development' : 'distribution'
        };

        // convert to string for string replacement
        let buildSettingsString = JSON.stringify(this.buildSettings);

        Object.keys(userConfig).forEach((key) => {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            const value = userConfig[key].replace(/\\/g, `\\\\`);
            buildSettingsString = buildSettingsString.replace(regex, value);
        });

        // update build settings with formated data
        this.buildSettings = JSON.parse(buildSettingsString);

        return this;
    }

    fetchPlatformDefaults (platform) {
        const platformFile = path.resolve(__dirname, `./build/${platform}.json`);

        if (!fs.existsSync(platformFile)) {
            throw Error(`Your platform "${platform}" is not supported as a default target platform for Electron.`);
        }

        return require(platformFile);
    }

    build () {
        return require('electron-builder').build(this.buildSettings);
    }
}

module.exports.run = (buildOptions, api) => require('./check_reqs')
    .run()
    .then(() => (new ElectronBuilder(buildOptions, api))
        .configure()
        .build()
    )
    .catch((error) => {
        console.log(error);
    });

module.exports.help = (argv) => {
    const binPath = path.relative(process.cwd(), argv.binPath);
    console.log(`Usage: ${binPath} [flags]
Flags:
    '--debug': will build project in debug mode (default)
    '--release': will build project for release
    '--nobuild': will skip build process (useful when using run command)`);
};
