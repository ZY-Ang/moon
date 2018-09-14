/*
 * Copyright (c) 2018 moon
 */

const shell = require("shelljs");

const DIR_BUILD = `build/`;
const DIR_SOURCE = `src/`;

const watchBackground = () => {
    console.log(`Watching Background for ${(shell.env.NODE_ENV)} environment`);

    const PATH_BACKGROUND_ENTRY = `${DIR_SOURCE}background/index.js`;
    shell.exec(`parcel watch ${PATH_BACKGROUND_ENTRY} -d ${DIR_BUILD} -o app.js`);
};

module.exports = watchBackground();

watchBackground();
