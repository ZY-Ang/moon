/*
 * Copyright (c) 2019 moon
 */
import React from "react";
import {parse, stringify} from "query-string";
import ThrobberWhite from "../misc/throbber/ThrobberWhite";
import {ROUTE_ERROR} from "../App";
import {ROUTE_BROWSER_EXTENSION} from "../App";

class BrowserExtensionOAuthRedirectPage extends React.Component {
    componentDidMount() {
        const search = parse(this.props.location.search);
        if (!search.code) {
            this.props.history.push(`${ROUTE_BROWSER_EXTENSION}${ROUTE_ERROR}?${stringify(search)}`);
        }
    }

    render() {
        return (
            <div className="text-center">
                <ThrobberWhite/>
                <h1>Logging you in...</h1>
                <p>Please do not close this window</p>
            </div>
        );
    }
}

export default BrowserExtensionOAuthRedirectPage;
