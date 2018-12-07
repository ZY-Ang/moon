import React from "react";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";

class AmazonAddressSelectScreen extends React.Component {
    render() {
        return (
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <ul className="sequence">
                    <li>To Shop With Moon,</li>
                    <li className="highlighted">Select a Delivery Address</li>
                    <li>Choose a Payment Method</li>
                </ul>
            </div>
        );
    }
}

export default AmazonAddressSelectScreen;
