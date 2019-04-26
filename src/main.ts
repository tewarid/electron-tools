// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu } from "electron";
import * as path from "path";

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    icon: __dirname + "/app.ico",
    webPreferences: {
      nodeIntegration: true,
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
const isMac = process.platform === "darwin";
const template = [
  // { role: "appMenu" }
  ...(isMac ? [{
    label: app.getName(),
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideothers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  }] : []),
  // { role: "fileMenu" }
  {
    label: "File",
    submenu: [
      isMac ? { role: "close" } : { role: "quit" },
    ],
  },
  // { role: "editMenu" }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac ? [
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Speech",
          submenu: [
            { role: "startspeaking" },
            { role: "stopspeaking" },
          ],
        },
      ] : [
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ]),
    ],
  },
  // { role: "viewMenu" }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { role: "toggledevtools" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  // { role: "windowMenu" }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(isMac ? [
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "window" },
      ] : [
        { role: "close" },
      ]),
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click() { require("electron").shell.openExternal("https://github.com/tewarid/net-tools-electron"); },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template as any);
Menu.setApplicationMenu(menu);
