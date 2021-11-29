import style from "./Login.module.css";
import { useState, useEffect } from "react";
import loading from "../pics/loading.gif";

const { ipcRenderer } = window.require("electron");

export default function Login() {
  const [next, setNext] = useState(false);
  const [connect, setConnect] = useState(false);
  function onNext(e) {
    e.preventDefault();
    let { user, password, host, port } =
      e.target.parentNode.parentNode.parentNode;
    const post = {
      user: user.value,
      password: password.value,
      host: host.value,
      port: parseInt(port.value),
    };
    if (post.user === "" || post.password === "" || post.host === "") {
      ipcRenderer.send("Missing Attribute", "");
      return;
    }
    setNext(true);
  }
  function onCancle(e) {
    e.preventDefault();
    ipcRenderer.send("Cancle Connect");
  }
  function onBack(e) {
    e.preventDefault();
    setNext(false);
  }
  function onSubmit(e) {
    e.preventDefault();
    let {
      user,
      password,
      host,
      port,
      connTimeout,
      pasvTimeout,
      keepalive,
      sercure,
    } = e.target;
    const post = {
      user: user.value,
      password: password.value,
      host: host.value,
      port: parseInt(port.value),
      connTimeout: parseFloat(connTimeout.value),
      pasvTimeout: parseFloat(pasvTimeout.value),
      keepalive: parseFloat(keepalive.value),
      sercure: sercure.value === "false" ? false : sercure.value,
    };
    ipcRenderer.send("Connect", post);
    setConnect(true);
  }
  useEffect(() => {
    ipcRenderer.on("Connect", () => {});
    return () => ipcRenderer.removeAllListeners(["Connect"]);
  }, []);
  return (
    <div className={style.container}>
      <form className={style.form} onSubmit={onSubmit} onKeyDown = {(event) => {
            if(event.keyCode === 13) {
              console.log("hehe")
              event.preventDefault();
              return false;
            }
      }}>
          <div
            className={
              style["screen"] +
              (next ? ` ${style["screen-1"]}` : "") +
              (connect ? ` ${style["screen-2"]}` : "")
            }
          >
            <h1>Login</h1>
            <div className={style["column-holder"]}>
              <div>User (*)</div>
              <input
                placeholder="Please enter user"
                name="user"
                defaultValue="testuser"
              />
            </div>
            <div className={style["column-holder"]}>
              <div>Password (*)</div>
              <input
                placeholder="Please enter password"
                type="password"
                name="password"
                defaultValue="1234567890"
              />
            </div>
            <div className={style["column-holder"]}>
              <div>Host (*)</div>
              <input
                placeholder="Please enter host address"
                name="host"
                defaultValue="3.0.102.91"
              />
            </div>
            <div className={style["column-holder"]}>
              <div>Port:</div>
              <input type="number" defaultValue={21} name="port" />
            </div>
            <div className={style.footer} style={{ marginTop: "20px" }}>
              <button onClick={onCancle} className={style["cancle-button"]}>
                Cancle
              </button>
              <button onClick={onNext} className={style["next-button"]}>
                Next
              </button>
            </div>
          </div>
          <div
            className={
              style["screen"] +
              (next ? ` ${style["screen-1"]}` : "") +
              (connect ? ` ${style["screen-2"]}` : "")
            }
          >
            <h1>Advance Setting</h1>

            <div className={style["column-holder"]}>
              <div>Connect Timeout</div>
              <input type="number" name="connTimeout" defaultValue="10000" />
            </div>
            <div className={style["column-holder"]}>
              <div>PASV Timeout</div>
              <input type="number" name="pasvTimeout" defaultValue="100" />
            </div>
            <div className={style["column-holder"]}>
              <div>Keep Alive Timeout</div>
              <input type="number" name="keepalive" defaultValue="10000" />
            </div>
            <div className={style["row-holder"]}>
              <div>Sercure:</div>
              <select name="sercure">
                <option value="control">control</option>
                <option value="implicit">implicit</option>
                <option value="false">false</option>
              </select>
            </div>
            <div className={style.footer} style={{ width: 310 }}>
              <button className={style["back-button"]} onClick={onBack}>
                {" "}
                Back{" "}
              </button>
              <input
                type="submit"
                value="Connect"
                className={style["submit-button"]}
              />
            </div>
          </div>
        </form>
        <div
          className={
            style["screen"] +
            (next ? ` ${style["screen-1"]}` : "") +
            (connect ? ` ${style["screen-2"]}` : "")
          }
          style={{ paddingRight: "0", backgroundColor: "#edeff2" }}
        >
          <img src={loading} alt="loading" width="350" />
      </div>
    </div>
  );
}
