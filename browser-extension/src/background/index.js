/*
 * Copyright (c) 2018 moon
 */

import '../utils/preload.js';
import BrowserAction from "./browser/BrowserAction";
import BackgroundRuntime from "./browser/BackgroundRuntime";
import Tabs from "./browser/Tabs";
import Windows from "./browser/Windows";

BackgroundRuntime.run();
Windows.run();
Tabs.run();
BrowserAction.run();
