import React from "react";
import Coinbase from "../../../../../../assets/icons/coinbase.svg";
import AppRuntime from "../../../browser/AppRuntime";

const walletMap = {
    COINBASE: Coinbase
};

const WalletIcon = (props) => {
    const walletSvg = walletMap[props.wallet] || Coinbase;
    return <img {...props} src={AppRuntime.getURL(walletSvg)} className="wallet-icon" alt={props.wallet || "Coinbase"}/>;
};

export default WalletIcon;
