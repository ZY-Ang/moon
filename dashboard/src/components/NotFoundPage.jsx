/*
 * Copyright (c) 2019 moon
 */
import React from "react"
import ErrorTicker from "./misc/tickers/error/ErrorTicker";

class NotFoundPage extends React.Component {
    render() {
        return (
            <div className="text-center">
                <ErrorTicker/>
                <h1>404</h1>
                <p>Why hello there, it's time to go <a href="https://paywithmoon.com">home</a>. You're drunk.</p>
            </div>
        );
    }
}

export default NotFoundPage;
