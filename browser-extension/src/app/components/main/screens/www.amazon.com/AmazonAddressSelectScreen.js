import React from "react";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";

class AmazonAddressSelectScreen extends React.Component {
    render() {
        return (
            <div className="moon-tab text-center">
                <div className="settings-icon-parent">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                Select Address!!
            </div>
        );
    }
}

export default AmazonAddressSelectScreen;
