/*
 * Copyright (c) 2019 moon
 */

import "./App.css";
import "bootstrap/dist/css/bootstrap-grid.css";
import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import HomePage from "./HomePage";
import BrowserExtensionRouter from "./browser-extension/BrowserExtensionRouter";

const ROUTE_HOME = "/";
export const ROUTE_BROWSER_EXTENSION = "/extension";
export const ROUTE_OAUTH_REDIRECT = "/oauth";
export const ROUTE_LOGOUT = "/logout";
export const ROUTE_ERROR = "/error";
const ROUTE_NOT_FOUND = '/404';

class App extends React.Component {
    render() {
        return (
            <Router>
                <ScrollToTop>
                    <Switch>
                        <Route path={ROUTE_HOME} exact component={HomePage} />
                        <Route path={ROUTE_BROWSER_EXTENSION} component={BrowserExtensionRouter} />
                        <Route path={ROUTE_NOT_FOUND} exact component={HomePage} />
                        <Route path={ROUTE_ERROR} exact component={HomePage} />
                        <Route component={HomePage} />
                    </Switch>
                </ScrollToTop>
            </Router>
        );
    }
}

export default App;
