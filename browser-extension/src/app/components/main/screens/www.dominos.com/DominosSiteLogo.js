import React from "react";
import AppRuntime from "../../../../browser/AppRuntime";
import dominosLogo from "../../../../../../../assets/icons/dominos.png";

const DominosSiteLogo = () => (
    <img
        className="site-logo"
        src={AppRuntime.getURL(dominosLogo)}
        alt="Domino's"
    />
);

export default DominosSiteLogo;
