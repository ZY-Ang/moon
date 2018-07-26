/*
 * Copyright (c) 2018 moon
 */

const fs = require("fs");
const shell = require("shelljs");

const build = () => {
    const DIR_BUILD = `build/`;
    const DIR_SOURCE = `src/`;

    console.log(`Building for ${shell.env.BUILD_ENV} environment`);

// 1. Delete all build files in the build folder of the browser extension
    console.log("Clearing build folder...");
    shell.rm('-f', `${DIR_BUILD}*`);
    console.log("Force recreating build folder...");
    shell.mkdir('-p', DIR_BUILD);

    // TODO: Disable source maps --no-sourcemaps on prod
// 2. Build react app content script
    console.log("Building content-script...");
    const PATH_CONTENT_ENTRY = `${DIR_SOURCE}app/index.js`;

    if (shell.exec(`parcel build ${PATH_CONTENT_ENTRY} -d ${DIR_BUILD} -o app.js`).code !== 0) {
        shell.echo('Error: build failed - unable to build chrome content script');
        shell.exit(1);
    }

// 3. Build background script
    console.log("Building background-script...");
    const PATH_BACKGROUND_ENTRY = `${DIR_SOURCE}background/index.js`;

    if (shell.exec(`parcel build ${PATH_BACKGROUND_ENTRY} -d ${DIR_BUILD} -o background.js`).code !== 0) {
        shell.echo('Error: build failed - unable to build chrome background script');
        shell.exit(1);
    }

// 4. Modify and build manifest.json
    console.log("Searching for logo_128 imported file in build dir...");
    const logo_128_png_arr = shell.find(DIR_BUILD).filter(file => file.match(/logo_128.*\.png/));

    if (logo_128_png_arr.length !== 1) {
        shell.echo('Error: build failed - unable to find exactly one logo_128.png in build directory');
        shell.exit(1);
    }

    console.log("Reading manifest.json for replacements...");
    const PATH_MANIFEST_ENTRY = "manifest.json";
    const PATH_MANIFEST_BUILD = `${DIR_BUILD}manifest.json`;

    fs.readFile(PATH_MANIFEST_ENTRY, 'utf8', (err, data) => {
        if (err) {
            shell.echo('Error: build failed - unable to read from manifest.json');
            shell.exit(1);
            return console.error(err);
        }
        console.log("Replacing and saving manifest.json with replacements into build dir...");
        const result = data.replace(/logo_128\.png/g, logo_128_png_arr[0].replace(DIR_BUILD, ""));
        fs.writeFile(PATH_MANIFEST_BUILD, result, 'utf8', (err) => {
            if (err) {
                shell.echo('Error: build failed - unable to write amended manifest.json');
                shell.exit(1);
            }
        })
    });
};

module.exports = build;

build();
