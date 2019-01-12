/*
 * Copyright (c) 2019 moon
 */

import "./BrowserExtensionRouter.css";
import React from "react";
import BrowserExtensionOAuthRedirectPage from "./BrowserExtensionOAuthRedirectPage";
import {Route, Switch} from "react-router-dom";
import BrowserExtensionLogoutPage from "./BrowserExtensionLogoutPage";
import BrowserExtensionNotFoundPage from "./BrowserExtensionNotFoundPage";
import BrowserExtensionErrorPage from "./BrowserExtensionErrorPage";
import {ROUTE_ERROR} from "../../constants/routes";
import {ROUTE_LOGOUT, ROUTE_OAUTH_REDIRECT} from "../../constants/routes";

class BrowserExtensionRouter extends React.Component {
    render() {
        return (
            <div className="browser-extension">
                <Switch>
                    <Route path={`${this.props.match.path}${ROUTE_OAUTH_REDIRECT}`} component={BrowserExtensionOAuthRedirectPage} />
                    <Route path={`${this.props.match.path}${ROUTE_LOGOUT}`} component={BrowserExtensionLogoutPage} />
                    <Route path={`${this.props.match.path}${ROUTE_ERROR}`} component={BrowserExtensionErrorPage} />
                    <Route component={BrowserExtensionNotFoundPage}/>
                </Switch>
            </div>
        );
    }
}

export default BrowserExtensionRouter;
