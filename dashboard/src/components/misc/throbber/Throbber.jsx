/*
 * Copyright (c) 2019 moon
 */
import React from "react";
import {detect} from "detect-browser";
import throbber from "./throbber_200.svg";
import throbber_fallback from "./throbber_200.gif";

const Throbber = (props) => {
    const currentBrowser = detect();
    const browserMap = {
        chrome: true,
        firefox: true,
        opera: true,
        safari: true
    };
    return !!browserMap[(currentBrowser && currentBrowser.name)]
        ? <img {...props} className="throbber" src={throbber} alt="Loading..."/>
        : <img {...props} className="throbber" src={throbber_fallback} alt="Loading..."/>;
};

export default Throbber;
