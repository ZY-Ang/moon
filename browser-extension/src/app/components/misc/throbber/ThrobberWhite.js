/*
 * Copyright (c) 2018 moon
 */
import React from 'react';
import {detect} from 'detect-browser';
import throbber from '../../../../../../assets/icons/throbber_200_white.svg';
import throbber_fallback from '../../../../../../assets/icons/throbber_200_white.gif';
import AppRuntime from "../../../browser/AppRuntime";

const ThrobberWhite = (props) => {
    const currentBrowser = detect();
    const browserMap = {
        chrome: true,
        firefox: true,
        opera: true,
        safari: true
    };
    return !!browserMap[(currentBrowser && currentBrowser.name)]
        ? <img {...props} className="throbber" src={AppRuntime.getURL(throbber)} alt="Loading..."/>
        : <img {...props} className="throbber" src={AppRuntime.getURL(throbber_fallback)} alt="Loading..."/>;
};

export default ThrobberWhite;
