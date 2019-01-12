/*
 * Copyright (c) 2019 moon
 */
import React from "react"
import ErrorTicker from "./misc/tickers/error/ErrorTicker";

class ErrorPage extends React.Component {
    render() {
        return (
            <div className="text-center">
                <ErrorTicker/>
                <h1>Oh No!</h1>
                <p>Something bad happened! Please try again or <a href="https://paywithmoon.com" rel="noopener noreferrer" target="_blank">visit us</a> for support.</p>
            </div>
        );
    }
}

export default ErrorPage;
