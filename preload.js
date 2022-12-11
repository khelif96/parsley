// import { remote } from "electron";

const { app } = require("electron");

console.log("ADDING PRELOAD SWITCH");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");
