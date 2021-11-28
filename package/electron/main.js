const fs = require("fs");
const path = require("path");
const ftp = require("@icetee/ftp");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
// const isDev = require("electron-is-dev");
const os = require("os");
function mainwindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.removeMenu();
  win.loadURL(`file://${path.join(__dirname, "../build/index.html")}`
  );
  return win;
}
function loginwindow(parent) {
  const win = new BrowserWindow({
    titleBarStyle: "hidden",
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: parent,
    width: 350,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.removeMenu();
  win.loadURL(`file://${[__dirname, "../build/index.html#/login"].join("/")}`);
  return win;
}
let MainWindow;
let LoginWindow;
let LoginInfor;
app.whenReady().then(() => {
  MainWindow = mainwindow();
  LoginWindow = loginwindow(MainWindow);
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    MainWindow = mainwindow();
  }
});
ipcMain.on("Missing Attribute", (event, arg) => {
  console.log("Missing Attribute", "Please Enter All * Information");
});
ipcMain.on("Cancle Connect", (event, arg) => {
  LoginWindow.close();
});
ipcMain.on("OpenLoginWindow", () => {
  LoginWindow = loginwindow(MainWindow);
});
let client = new ftp();
ipcMain.on("Connect", (event, arg) => {
  LoginInfor = arg;
  client.connect(arg);
});
ipcMain.on("enter", (event, arg) => {
  client.cwd(arg, (err, string) => {
    if (err) {
      console.log("Error", err);
    } else {
      client.pwd((err, cwd) => {
        if (err) {
          console.log("Error", err);
        } else {
          client.list((err, list) => {
            if (err) {
              console.log("Error", err);
            } else {
              event.reply("Server-Enter", { list, cwd });
            }
          });
        }
      });
    }
  });
});
ipcMain.on("back", (event, arg) => {
  client.cwd(arg, (err, string) => {
    if (err) {
      console.log("Error", err);
    } else {
      client.pwd((err, cwd) => {
        if (err) {
          console.log("Error", err);
        } else {
          client.list((err, list) => {
            if (err) {
              console.log("Error", err);
            } else {
              event.reply("Server-Back", { list, cwd });
            }
          });
        }
      });
    }
  });
});
ipcMain.on("forward", (event, arg) => {
  client.cwd(arg, (err, string) => {
    if (err) {
      console.log("Error", err);
    } else {
      client.pwd((err, cwd) => {
        if (err) {
          console.log("Error", err);
        } else {
          client.list((err, list) => {
            if (err) {
              console.log("Error", err);
            } else {
              event.reply("Server-Forward", { list, cwd });
            }
          });
        }
      });
    }
  });
});
ipcMain.on("up", (event, arg) => {
  client.cdup((err) => {
    if (err) {
      console.log("Error", err);
    } else {
      client.pwd((err, cwd) => {
        if (err) {
          console.log("Error", err);
        } else {
          client.list((err, list) => {
            if (err) {
              console.log("Error", err);
            } else {
              event.reply("Server-Up", { list, cwd });
            }
          });
        }
      });
    }
  });
});
function getFiles(dir, files_) {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}
function getDir(dir, files_) {
  files_ = files_ || [];
  files_.push(dir);
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getDir(name, files_);
    }
  }
  return files_;
}
ipcMain.on("upload-folder", (event, cwd) => {
  dialog
    .showOpenDialog({ properties: ["openDirectory", "multiSelections"] })
    .then((result) => {
      result.filePaths.forEach((dir) => {
        getDir(dir).forEach((folder) => {
          client.mkdir(
            path.basename(dir) +
              "/" +
              path.relative(dir, folder).split(path.sep).join("/"),
            true,
            (err) => {
              if (err) {
                console.log("Error", err);
              }
            }
          );
        });
        getFiles(dir).forEach((file) => {
          client.put(
            path.basename(file),
            cwd +
              "/" +
              path.basename(dir) +
              "/" +
              path.relative(dir, file).split(path.sep).join("/"),
            function (err) {
              if (err) {
                console.log("Error", err);
              }
              client.list(cwd, (err, list) => {
                if (err) {
                  console.log("Error", err);
                } else {
                  MainWindow.webContents.send("Server-List", { list, cwd });
                }
              });
            }
          );
        });
      });
    });
});
ipcMain.on("upload-file", (event, cwd) => {
  dialog
    .showOpenDialog({ properties: ["openFile", "multiSelections"] })
    .then((result) => {
      result.filePaths.forEach((e) => {
        client.put(e, path.basename(e), function (err) {
          if (err) {
            console.log("Error", err);
          }
          client.list(cwd, (err, list) => {
            if (err) {
              console.log("Error", err);
            } else {
              MainWindow.webContents.send("Server-List", { list, cwd });
            }
          });
        });
      });
    });
});
ipcMain.on("drop-file", (event, url, cwd) => {
  client.put(url, path.basename(url), function (err) {
    if (err) {
      console.log("Error", err);
    }
    client.list(cwd, (err, list) => {
      if (err) {
        console.log("Error", err);
      } else {
        MainWindow.webContents.send("Server-List", { list, cwd });
      }
    });
  });
});
ipcMain.on("drop-folder", (event, dir, cwd) => {
  getDir(dir).forEach((folder) => {
    client.mkdir(
      path.basename(dir) +
        "/" +
        path.relative(dir, folder).split(path.sep).join("/"),
      true,
      (err) => {
        if (err) {
          console.log("Error", err);
        }
      }
    );
  });
  getFiles(dir).forEach((file) => {
    client.put(
      path.basename(file),
      cwd +
        "/" +
        path.basename(dir) +
        "/" +
        path.relative(dir, file).split(path.sep).join("/"),
      function (err) {
        if (err) {
          console.log("Error", err);
        }
        client.list(cwd, (err, list) => {
          if (err) {
            console.log("Error", err);
          } else {
            MainWindow.webContents.send("Server-List", { list, cwd });
          }
        });
      }
    );
  });
});
ipcMain.on("Download", (event, { cwd, list }) => {
  let Download = path.join(os.homedir(), "Documents", "Ftp-files");
  if (!fs.existsSync(path)) {
    fs.mkdirSync(Download, { recursive: true });
  }
  function get_dir(dir) {
    client.list(dir, (err, list) => {
      if (err) {
        console.log("Error", err);
      } else {
        list.forEach((e) => {
          if (e.type === "-") {
            client.get([dir, e.name].join("/"), function (err, stream) {
              if (err) {
                console.log("Error", err);
              } else {
                stream.pipe(
                  fs.createWriteStream(
                    path.join(Download, path.relative(cwd, dir), e.name)
                  )
                );
              }
            });
          } else if (e.type === "d") {
            fs.mkdirSync(path.join(Download, path.relative(cwd, dir), e.name), {
              recursive: true,
            });
            get_dir([dir, e.name].join("/"));
          }
        });
      }
    });
  }
  list.forEach((e) => {
    if (e.type === "-") {
      client.get([cwd, e.name].join("/"), function (err, stream) {
        if (err) {
          console.log("Error", err);
        } else {
          stream.pipe(fs.createWriteStream(path.join(Download, e.name)));
        }
      });
    } else if (e.type === "d") {
      fs.mkdirSync(path.join(Download, e.name), { recursive: true });
      get_dir([cwd, e.name].join("/"));
    }
  });
});
client.on("ready", function () {
  setTimeout(() => {
    LoginWindow.close();
  }, 1000);
  client.pwd((err, cwd) => {
    if (err) {
      console.log("Error", err);
    } else {
      client.list(cwd, (err, list) => {
        if (err) {
          console.log("Error", err);
        } else {
          MainWindow.webContents.send("Server-List", { list, cwd });
        }
      });
    }
  });
});
client.on("error", (err) => {
  client.destroy();
  client.connect(LoginInfor);
});
