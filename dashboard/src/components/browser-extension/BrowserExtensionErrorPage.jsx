/*
 * Copyright (c) 2019 moon
 */
import React from "react"
import axios from "axios";
import {parse} from "query-string";
import ErrorTicker from "../misc/tickers/error/ErrorTicker";

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
        axios.get("https://paywithmoon.auth0.com/v2/logout");
        axios.get("https://paywithmoon-development.auth0.com/v2/logout");
    }

    render() {
        const {error} = this.state.search;
        const errorResolver = {
            access_denied: (
                <div className="text-center">
                    <ErrorTicker/>
                    <h1>Access Denied!</h1>
                    <pre>Access Denied - You have denied access to your account.</pre>
                </div>
            ),
            unauthorized: this.state.search.error_description && this.state.search.error_description.includes("Invalid email address")
                ? (
                    <div className="text-center">
                        <ErrorTicker/>
                        <h1>Invalid email address!</h1>
                        <pre>You've entered an invalid email address. Please try again.</pre>
                    </div>
                ) : null
        };
        if (!!error && !!errorResolver[error]) {
            return errorResolver[error];
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
