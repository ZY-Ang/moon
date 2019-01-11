/*
 * Copyright (c) 2018 moon
 */

import {backgroundLogger} from "./utils/BackgroundLogger";
import "./services/BackgroundMixpanel";
import BrowserAction from "./browser/BrowserAction";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import Tabs from "./browser/Tabs";
import Windows from "./browser/Windows";

window.logger = backgroundLogger;
BackgroundRuntime.run();
Windows.run();
Tabs.run();
BrowserAction.run();
