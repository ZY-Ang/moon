/*
 * Copyright (c) 2019 moon
 */
import React from "react"
import {parse} from "query-string";
import ErrorTicker from "../misc/tickers/error/ErrorTicker";
import SuccessTicker from "../misc/tickers/success/SuccessTicker";

class BrowserExtensionErrorPage extends React.Component {
    constructor() {
        super();
        this.state = {
            search: {}
        };
    }
    componentDidMount() {
        const search = parse(this.props.location.search);
        this.setState({search});
    }

    render() {
        if (this.state.search.error && this.state.search.error === "access_denied") {
            return (
                <div className="text-center">
                    <ErrorTicker/>
                    <h1>Access Denied!</h1>
                    <pre>Access Denied - You have denied access to your account.</pre>
                </div>
            );
        } else if (
            this.state.search.error &&
            this.state.search.error === "unauthorized" &&
            this.state.search.error_description &&
            this.state.search.error_description.includes("Please verify your email before logging in.")
        ) {
            return (
                <div className="text-center">
                    <SuccessTicker/>
                    <h1>Email Verification Link Sent!</h1>
                    <pre>Please verify your email address via the link we sent you and log in!</pre>
                </div>
            );

        } else {
            return (
                <div className="text-center">
                    <ErrorTicker/>
                    <h1>Oh No!</h1>
                    <p>Something bad happened! Please try again or <a href="https://paywithmoon.com" rel="noopener noreferrer" target="_blank">visit us</a> for support.</p>
                </div>
            );
        }
    }
}

export default BrowserExtensionErrorPage;
