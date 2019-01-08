/*
 * Copyright (c) 2019 moon
 */

import {URL_EXTENSION_INSTALLED} from "../constants/url";

export const isSuccessfullyInstalledPage = (url) =>
    url.startsWith(URL_EXTENSION_INSTALLED);
