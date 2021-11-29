import { useEffect, useState } from "react";
import { FileIcon } from "react-file-icon";
import style from "./Home.module.css";
import Table from "../components/table/Table";
import {
  Icon,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CareRight,
  UploadFolder,
  UploadFile,
  DownloadFile,
} from "./Icon";
import "./Home.css";
import Folder from "../pics/folder.jpg";
import Symlink from "../pics/symlink.png"
import BK from "../pics/bk.jpg";
const { ipcRenderer } = window.require("electron");

export default function Home() {
  const tableHead = [
    {
      id: "file",
      numberic: false,
      label: "Name",
    },
    {
      id: "date",
      numberic: true,
      label: "Date Modified",
    },
    {
      id: "size",
      numberic: true,
      label: "Size",
    },
  ];
  const [fileList, setFileList] = useState([]);
  const [select, setSelect] = useState([]);
  const [history, setHistory] = useState([]);
  const [forward, setForward] = useState([]);
  const [pwd, setPwd] = useState("");
  const [status, setStatus] = useState(false);
  function onConnect() {
    setStatus(true);
    ipcRenderer.send("OpenLoginWindow");
  }
  function onDisconcect() {
    setFileList([]);
    setSelect([]);
    setHistory([]);
    setForward([]);
    setPwd("");
    setStatus(false);
    ipcRenderer.send("Disconnect");
  }
  function getExtension(name) {
    if (name) {
      if (name.lastIndexOf(".") !== -1) {
        return name.slice(name.lastIndexOf(".") + 1);
      } else {
        return "folder";
      }
    } else {
      return "";
    }
  }
  function sizeSimplify(size) {
    if (size < 1024) {
      return size + "B";
    } else if (size > 1024 && size < 1024 * 1024) {
      return (
        parseFloat(Math.round((parseFloat(size) / 1024) * 1000)) / 1000 + "KB"
      );
    } else if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
      return (
        parseFloat(Math.round((parseFloat(size) / (1024 * 1024)) * 1000)) /
          1000 +
        "MB"
      );
    } else if (size > 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024) {
      return (
        parseFloat(
          Math.round((parseFloat(size) / (1024 * 1024 * 1024)) * 1000)
        ) / 1000
      );
    }
  }
  function tableBody(data) {
    return {
      file: {
        value: (
          <div className={style["file-list"]}>
            <span
              className={
                style["icon"] +
                " " +
                (getExtension(data.name) === "folder"
                  ? "folder"
                  : getExtension(data.name))
              }
            >
              {data.type === "d" ? (
                <img src={Folder} alt="Folder" />
              ) : data.type === "l" ?
                <img src= {Symlink} alt= "Symlink"/>
              :(
                <FileIcon
                  extension={getExtension(data.name)}
                  {...Icon[getExtension(data.name)]}
                />
              )}
            </span>
            <span>{data.name}</span>
          </div>
        ),
        key: data.name,
      },
      date: {
        value: data.date.toString().slice(0, 24),
        key: Date.parse(data.date),
      },
      size: { value: sizeSimplify(data.size), key: data.size },
      onDoubleClick: onEnterFolder,
    };
  }
  function onEnterFolder(e, row) {
    if ((fileList[row.index].type === "d")||((fileList[row.index].type === "l"))) {
      ipcRenderer.send("enter", pwd + "/" + row.file.key);
    }
  }
  function onBack() {
    if (history.length > 0) {
      ipcRenderer.send("back", history[history.length - 1]);
    }
  }
  function onForward() {
    if (forward.length > 0) {
      ipcRenderer.send("forward", forward[forward.length - 1]);
    }
  }
  function onUp() {
    if (pwd !== "/") {
      ipcRenderer.send("up");
    }
  }
  function onUrlBar(index) {
    let url = pwd
      .split("/")
      .filter((e, i) => i <= index)
      .join("/");
    ipcRenderer.send("enter", url === "" ? "/" : url);
  }
  function onUploadFile() {
    ipcRenderer.send("upload-file", pwd);
  }
  function onUploadFolder() {
    ipcRenderer.send("upload-folder", pwd);
  }
  function onDrop(e) {
    var file = e.dataTransfer.files;
    console.log(file)
    for (let i = 0; i < file.length; i++) {
      if (file[i].type === "") {
        ipcRenderer.send("drop-folder", file[i].path, pwd);
      } else {
        ipcRenderer.send("drop-file", file[i].path, pwd);
      }
    }
  }
  function onDownload() {
    if (select.length) {
      ipcRenderer.send("Download", {
        cwd: pwd,
        list: select.map((e) => fileList[e.index]),
      });
    }
  }
  useEffect(() => {
    ipcRenderer.on("Server-List", (event, arg) => {
      setStatus(true);
      setFileList(arg.list);
      setPwd(arg.cwd);
      setSelect([]);
    });
    ipcRenderer.on("Server-Enter", (event, arg) => {
      setFileList(arg.list);
      if (arg.cwd !== pwd) {
        setHistory([...history, pwd]);
        setForward([]);
        setPwd(arg.cwd);
        setSelect([]);
      }
    });
    ipcRenderer.on("Server-Back", (event, arg) => {
      setFileList(arg.list);
      let temp = [...history];
      setForward([...forward, pwd]);
      temp.pop();
      setHistory(temp);
      setPwd(arg.cwd);
      setSelect([]);
    });
    ipcRenderer.on("Server-Forward", (event, arg) => {
      setFileList(arg.list);
      let temp = [...forward];
      setHistory([...history, pwd]);
      temp.pop();
      setForward(temp);
      setPwd(arg.cwd);
      setSelect([]);
    });
    ipcRenderer.on("Server-Up", (event, arg) => {
      setFileList(arg.list);
      setHistory([...history, pwd]);
      setForward([]);
      setPwd(arg.cwd);
      setSelect([]);
    });
    return () => {
      ipcRenderer.removeAllListeners(["Server-List"]);
      ipcRenderer.removeAllListeners(["Server-Back"]);
      ipcRenderer.removeAllListeners(["Server-Forward"]);
      ipcRenderer.removeAllListeners(["Server-Up"]);
      ipcRenderer.removeAllListeners(["Server-Enter"]);
    };
  }, [forward, history, pwd]);
  return (
    <div className={style["container"]}>
      <div className={style["tool-bar"]}>
        <div className={style["icon-bar"]}>
          <div className={style["icon"]}>
            <img src={BK} alt="BK" height="40" />
          </div>
          <div onClick={onBack} className={style["icon"]}>
            <ArrowLeft disable={!(history.length > 0)} />
          </div>
          <div onClick={onForward} className={style["icon"]}>
            <ArrowRight disable={!(forward.length > 0)} />
          </div>
          <div onClick={onUp} className={style["icon"]}>
            <ArrowUp disable={pwd === "/"} />
          </div>
        </div>
        <div className={style["url-bar"]}>
          {(pwd === "/") ?
            [
              <div
                onClick={() => onUrlBar(0)}
                key={0}
                className={style["url-element"]}
              >
                /
              </div>,
              <CareRight key={0 + "icon"} />,
            ]
          :
            pwd.split("/").map((e, index) => {
              return [
                <div
                  onClick={() => onUrlBar(index)}
                  key={index}
                  className={style["url-element"]}
                >
                  {e === "" ? "/" : e}
                </div>,
                <CareRight key={index + "icon"} />,
              ];
            })
          }
        </div>
        <div
          className={style["icon-bar"] + " " + style["Download"]}
          style={{ justifyContent: "unset", cursor: "pointer" }}
          onClick={onDownload}
        >
          <div className={style["icon"]}>
            <DownloadFile disable={select.length === 0} />
          </div>
          <div
            className={style["icon"]}
            style={{
              width: "fit-content",
              color: select.length === 0 ? "#999999" : "black",
            }}
          >
            Download
          </div>
        </div>
      </div>
      <div className={style["body"]}>
        <div className={style["left-nav"]}>
          <div>
            <div onClick={onUploadFile} className={style["function-btn"]}>
              <div className={style["icon-holder"]}>
                <UploadFile />
              </div>
              <div>Upload File</div>
            </div>
            <div onClick={onUploadFolder} className={style["function-btn"]}>
              <div className={style["icon-holder"]}>
                <UploadFolder />
              </div>
              <div>Upload Folder</div>
            </div>
          </div>
          <div className={style["connect-button-holder"]}>
            {!status ? (
              <button onClick={onConnect} className={style["connect-button"]}>
                Connect
              </button>
            ) : (
              <button
                onClick={onDisconcect}
                className={style["disconnect-button"]}
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
        <div
          className={style["table-holder"]}
          onDrop={onDrop}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
        >
          <Table
            data={fileList.map((e) => tableBody(e))}
            head={tableHead}
            select={[select, setSelect]}
          />
        </div>
      </div>
    </div>
  );
}
