/*
 * Copyright (c) 2018 moon
 */

import logo from "../../assets/icons/logo_128.png";
import {version} from "../package.json";

const manifest = {
    manifest_version: 2,

    name: "Moon",
    short_name: "Moon",
    description: "Shop and pay with crypto at the lowest rates. Works on Amazon.com and many more!",
    version: version,
    homepage_url: "https://paywithmoon.com/",

    // Synchronize logo name with other app scripts
    icons: {
        16: logo,
        32: logo,
        128: logo
    },

    web_accessible_resources:[
        "/*"
    ],

    permissions: [
        "identity",
        "storage",
        "unlimitedStorage",
        "http://*/*",
        "https://*/*",
        "activeTab",
        "tabs"
    ],

    browser_action: {
        default_title: "Moon"
    },

    background: {
        scripts: ["background.js"],
        persistent: false
    },

    content_scripts: [
        {
            matches: ["<all_urls>"],
            js: ["app.js"]
        }
    ],

    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAibGrYHLq3cruPQW/vkQxnHeZ+LHcE+UomNUO9QTjjdACnfpt08cBwJ52PwqBflzSre1piBUu4CB//ecW8l5zYUVPLInoGiJSsZJHA2wo2WQ9PVtRw4gJNlBQbE5AiFXTTP0DC57QGIxyfKc1E7B0pi4y3xPueVIRuhRl7cRMVAiNU2OjSKpLuNat/IpG6QTg0P1kS8QMaz9nQM83izi6k4pntisyqUthBUdvzKmP7yhJjZE8FvIozqDHtD/PPsjYA6rt1M5Gzg0a5QYgQ2NLMsKfEAWmYYnaULwtb8jwKzViflIuvnFfsQrcKjq1fqzhLICHkN+3Mb9HSOFwLaSbiwIDAQAB"
};

// Note: You will need to destroy the compiled version of this module in the build process.
module.exports = manifest;
