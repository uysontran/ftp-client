import style from "./Table.module.css";
import { DownArrow, UpArrow } from "./icon";
import { useEffect, useState } from "react";

export default function Table({
  head,
  data,
  classes,
  checkbox = true,
  select,
}) {
  const [sortMethod, setSortMethod] = useState({ id: null, state: null });
  const [changedData, setData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selected, setSelected] = select ? select : [null, null];
  function ClassDestruction(classes, name) {
    if (classes) {
      if (classes[name]) {
        if (classes[name].default) {
          return `${style.container} ${classes[name].name}`;
        } else {
          return `${classes[name].name}`;
        }
      } else {
        return `${style[name]}`;
      }
    } else {
      return `${style[name]}`;
    }
  }
  function onSort(id) {
    if (sortMethod?.id !== id) {
      setSortMethod({ id: id, state: "down" });
    } else {
      setSortMethod({
        id: sortMethod.state === "up" ? null : id,
        state:
          sortMethod.state === null
            ? "down"
            : sortMethod.state === "down"
            ? "up"
            : null,
      });
    }
  }
  function onCheckHead(e) {
    let temp = changedData.map((el) => {
      el.checked = e.target.checked;
      return { ...el };
    });
    setData(temp);
    let temp1 = temp
      .filter((e) => e.checked)
      .map((e) => {
        return { ...e };
      });
    setSelected(temp1);
  }
  function onSelect(e, row) {
    let temp = changedData.map((e) => {
      return { ...e };
    });
    temp[temp.findIndex((e) => e.index === row.index)].checked =
      e.target.checked;
    setData(temp);
    let temp1 = temp
      .filter((e) => e.checked)
      .map((e) => {
        return { ...e };
      });
    setSelected(temp1);
  }
  function Sort(data, method, head) {
    let temp = [...data];
    if (temp) {
      if (method.state === "down") {
        if (head.find((e) => e.id === method.id).numberic) {
          return temp.sort((a, b) => {
            return a[method.id].key - b[method.id].key;
          });
        } else {
          return temp.sort((a, b) => {
            return (
              a[method.id].key.toLowerCase().charCodeAt() -
              b[method.id].key.toLowerCase().charCodeAt()
            );
          });
        }
      } else if (method.state === "up") {
        if (head.find((e) => e.id === method.id).numberic) {
          return temp.sort((b, a) => {
            return a[method.id].key - b[method.id].key;
          });
        } else {
          return temp.sort((b, a) => {
            return (
              a[method.id].key.toLowerCase().charCodeAt() -
              b[method.id].key.toLowerCase().charCodeAt()
            );
          });
        }
      } else {
        return temp;
      }
    } else {
      return temp;
    }
  }
  useEffect(() => {
    setData(
      data.map((e, index) => {
        let a = { ...e };

        a.index = index;
        a.checked =
          selected[selected.findIndex((e) => e.index === index)]?.checked ===
          undefined
            ? false
            : selected[selected.findIndex((e) => e.index === index)]?.checked;
        return a;
      })
    );
  }, [data, selected]);
  return (
    <table className={ClassDestruction(classes, "container")}>
      <tbody className={ClassDestruction(classes, "body")}>
        <tr
          className={
            ClassDestruction(classes, "head") +
            (head.classes ? " " + head.classes : "")
          }
        >
          {checkbox && (
            <td className={style.checkbox}>
              <input type="checkbox" onClick={(e) => onCheckHead(e)} />
            </td>
          )}
          {head.map((e) => (
            <td onClick={() => onSort(e.id)} key={e.id}>
              {e.label}{" "}
              <span
                style={{ visibility: e.id === sortMethod.id ? "" : "hidden" }}
              >
                {sortMethod.state !== "down" ? UpArrow : DownArrow}
              </span>
            </td>
          ))}
        </tr>
        {Sort(changedData, sortMethod, head).map((row, id) => (
          <tr
            className={
              ClassDestruction(classes, "row") +
              (row.classes ? " " + row.classes : "") +
              (row.checked
                ? " " + ClassDestruction(classes, "row-selected")
                : "")
            }
            onClick={(e) => {
              if (row.onClick) {
                row.onClick(e, row);
              } else {
              }
            }}
            key={row.id + "" + id}
            onDoubleClick={(e) => row.onDoubleClick(e, row)}
          >
            {checkbox && (
              <td className={style.checkbox}>
                <input
                  type="checkbox"
                  checked={row.checked}
                  onClick={(e) => onSelect(e, row)}
                  onChange={() => {}}
                />
              </td>
            )}
            {head.map((e) => (
              <td key={row.id + e.id + "" + id}>{row[e.id].value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
