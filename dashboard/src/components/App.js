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
import {ROUTE_BROWSER_EXTENSION, ROUTE_ERROR, ROUTE_HOME, ROUTE_NOT_FOUND} from "../constants/routes";


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
