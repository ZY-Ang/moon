import React from "react";
import "./AmazonSiteLogo.css";
import amazonLogo from "../../../../../../../assets/icons/amazon.png";
import AppRuntime from "../../../../browser/AppRuntime";

const AmazonSiteLogo = () => (
    <img
        className="site-logo"
        src={AppRuntime.getURL(amazonLogo)}
        alt="Amazon"
    />
);

export default AmazonSiteLogo;
