/*
 * Copyright (c) 2019 moon
 */
import React from "react";
import SuccessTicker from "../misc/tickers/success/SuccessTicker";

class BrowserExtensionLogoutPage extends React.Component {
    render() {
        return (
            <div className="text-center">
                <SuccessTicker/>
                <h1>You have successfully logged out</h1>
                <p>Closing window automatically...</p>
            </div>
        );
    }
}

export default BrowserExtensionLogoutPage;
