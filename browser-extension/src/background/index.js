/*
 * Copyright (c) 2018 moon
 */

import Logger from "../utils/Logger";
import "./services/BackgroundMixPanel";
import BrowserAction from "./browser/BrowserAction";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import Tabs from "./browser/Tabs";
import Windows from "./browser/Windows";

window.logger = new Logger("Background");
BackgroundRuntime.run();
Windows.run();
Tabs.run();
BrowserAction.run();
