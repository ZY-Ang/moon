/*
 * Copyright (c) 2018 moon
 */

const AdmZip = require("adm-zip");
const fs = require("fs");
const shell = require("shelljs");

const build = () => {
    const DIR_BUILD = `build/`;
    const DIR_DEV = `dev/`;
    const DIR_SOURCE = `src/`;
    const DIR_FILES = `files/`;
    const SOURCE_MAPS_FLAG = (shell.env.BUILD_ENV === 'production') ? '--no-source-maps' : '';

    console.log(`Building for ${(shell.env.BUILD_ENV || 'development')} environment`);

// 1. Delete all build files in the build folder of the browser extension
    console.log("Clearing build folder...");
    shell.rm('-f', `${DIR_BUILD}*`);
    console.log("Force recreating build folder...");
    shell.mkdir('-p', DIR_BUILD);

// 2. Build react app content script
    console.log("Building content-script...");
    const PATH_CONTENT_ENTRY = `${DIR_SOURCE}app/index.js`;

    if (shell.exec(`parcel build ${PATH_CONTENT_ENTRY} -d ${DIR_BUILD} -o app.js ${SOURCE_MAPS_FLAG}`).code !== 0) {
        shell.echo('Error: build failed - unable to build chrome content script');
        shell.exit(1);
    }

// 3. Build background script
    console.log("Building background-script...");
    const PATH_BACKGROUND_ENTRY = `${DIR_SOURCE}background/index.js`;

    if (shell.exec(`parcel build ${PATH_BACKGROUND_ENTRY} -d ${DIR_BUILD} -o background.js ${SOURCE_MAPS_FLAG}`).code !== 0) {
        shell.echo('Error: build failed - unable to build chrome background script');
        shell.exit(1);
    }

// 4. Build manifest.json
    // 4i. Build the manifest builder to sync asset imports
    console.log("Building manifestBuilder.js...");
    const FILE_MANIFEST_BUILDER = 'manifestBuilder.js';
    const PATH_MANIFEST_BUILDER_ENTRY = `${DIR_DEV}${FILE_MANIFEST_BUILDER}`;
    const PATH_MANIFEST_BUILDER_EXIT = `${DIR_BUILD}${FILE_MANIFEST_BUILDER}`;

    if (shell.exec(`parcel build ${PATH_MANIFEST_BUILDER_ENTRY} -d ${DIR_BUILD} -o ${FILE_MANIFEST_BUILDER} --no-source-maps`).code !== 0) {
        shell.echo('Error: build failed - unable to build manifest builder');
        shell.exit(1);
    }

    // 4ii. Run the built manifest builder to build manifest.json
    console.log("Building manifest.json...");
    const manifestJs = require("../build/manifestBuilder");
    const PATH_MANIFEST_BUILD = `${DIR_BUILD}manifest.json`;
    try {
        fs.writeFileSync(PATH_MANIFEST_BUILD, JSON.stringify(manifestJs, null, 2), 'utf8');
    } catch (error) {
        shell.echo('Error: build failed - unable to build manifest.json via the manifest builder');
        shell.exit(1);
    }

    // 4iii. Remove the compiled manifest builder
    console.log("Removing manifestBuilder.js...");
    shell.rm('-f', PATH_MANIFEST_BUILDER_EXIT);

// 5. Copy all other unhashed assets
    console.log("Copying unhashed assets...");
    shell.cp('-r', `${DIR_FILES}.`, DIR_BUILD);

// 6. Zip folder on production to prepare for WebStore deployments
    if (shell.env.BUILD_ENV === 'production') {
        console.log("Zipping up folder...");

        const PATH_ZIP_EXIT = `${DIR_BUILD}moon-extension.zip`;
        const zip = new AdmZip();
        zip.addLocalFolder(DIR_BUILD);
        zip.writeZip(PATH_ZIP_EXIT, err => {
            if (err) {
                shell.echo('Error: build failed - unable to zip build');
                shell.exit(1);
            }
        });
    }

// TODO: Implement publishing to chrome webstore via {@link https://developer.chrome.com/webstore/using_webstore_api}
};

module.exports = build;

build();
