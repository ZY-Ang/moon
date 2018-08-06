/*
 * Copyright (c) 2018 moon
 */

import '../utils/preload.js';
import BrowserAction from "./browser/BrowserAction";
import Runtime from "./browser/Runtime";
import Tabs from "./browser/Tabs";
import Windows from "./browser/Windows";

Runtime.run();
Windows.run();
Tabs.run();
BrowserAction.run();
