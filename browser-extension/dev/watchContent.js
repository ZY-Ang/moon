/*
 * Copyright (c) 2018 moon
 */

const shell = require("shelljs");

const DIR_BUILD = `build/`;
const DIR_SOURCE = `src/`;

const watchContent = () => {
    console.log(`Watching Content for ${(shell.env.BUILD_ENV || 'development')} environment`);

    const PATH_CONTENT_ENTRY = `${DIR_SOURCE}app/index.js`;
    shell.exec(`parcel watch ${PATH_CONTENT_ENTRY} -d ${DIR_BUILD} -o app.js`);
};

module.exports = watchContent();

watchContent();
