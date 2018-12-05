/**
 * @author https://github.com/paywithmoon/cryptocurrency-icons for crypto
 * @author https://www.iconfinder.com/iconsets/ensign-11 for countries
 */

import React from "react";
import USA from "../../../../../../assets/flags/usa.svg";
import BTC from "../../../../../../assets/flags/btc.svg";
import ETH from "../../../../../../assets/flags/eth.svg";
import LTC from "../../../../../../assets/flags/ltc.svg";
import BCH from "../../../../../../assets/flags/bch.svg";
import ETC from "../../../../../../assets/flags/etc.svg";
import AppRuntime from "../../../browser/AppRuntime";

const currencyMap = {
    USD: USA,
    BTC: BTC,
    ETH: ETH,
    LTC: LTC,
    BCH: BCH,
    ETC: ETC
};

const CurrencyIcon = (props) => {
    const flagSvg = currencyMap[props.currency] || USA;
    return <img {...props} src={AppRuntime.getURL(flagSvg)} alt={props.currency || "USA"}/>;
};

export default CurrencyIcon;
