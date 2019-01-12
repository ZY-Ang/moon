/*
 * Copyright (c) 2019 moon
 */
import React from "react"
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
    }

    render() {
        return (
            <div className="text-center">
                <ErrorTicker/>
                <h1>Oh No!</h1>
                <p>Something bad happened! Please try again or <a href="https://paywithmoon.com" rel="noopener noreferrer" target="_blank">visit us</a> for support.</p>
                {
                    this.state.search.error &&
                    this.state.search.error === "access_denied" &&
                    <pre>Access Denied - You have denied access to your account.</pre>
                }
                {
                    this.state.search.error &&
                    this.state.search.error !== "access_denied" &&
                    <pre>{this.state.search.error}{this.state.search.error_description && ` - ${this.state.search.error_description}`}</pre>
                }
            </div>
        );
    }
}

export default BrowserExtensionErrorPage;
