import generateUUID from "./generateUUID.ts";

export const newSetItemEventType = "newSetItemEvent";

const identifier = "@@";

export interface NewSetItemEvent extends Event {
  key: string;
  newValue: string;
}

/**
 * 发送消息
 * @param name{string} 名称
 * @param value{any} 数据
 */
export function sendMessage(name: string, value: any) {
  localStorage.setItem(
    `${identifier}${name}`,
    JSON.stringify({
      data: value,
      temp: generateUUID(),
    }),
  );
}

/**
 *
 * @param name 名称,与发送消息的名称一致即可监听到消息
 * @param callback 回调函数，接收到消息后调用，参数为数据
 * @param autoRemove 是否自动移除监听的值，默认为true
 * @return {Function} 返回一个移除监听的函数
 */
export function listenMessage(
  name: string,
  callback: (value: any) => void,
  autoRemove = true,
) {
  changeLocalStorageSetItem();

  const handler = (event: any) => {
    const eventKey = event.key;
    if (!eventKey.startsWith(identifier)) return;
    if (eventKey.substring(2) !== name) return;
    const newValue = JSON.parse(event.newValue);
    if (newValue === null || newValue === "") return;
    callback(newValue.data);
    if (autoRemove) localStorage.removeItem(`${identifier}${name}`);
  };

  window.addEventListener(newSetItemEventType, handler);

  return () => {
    window.removeEventListener(newSetItemEventType, handler);
  };
}

/**
 * 重写localStorage.setItem方法，并且抛出自定义事件，方便监听
 */
function changeLocalStorageSetItem() {
  const originSetItem = window.localStorage.setItem;
  window.localStorage.setItem = function (key: string, newValue: string) {
    const newSetItemEvent: NewSetItemEvent = new Event(
      newSetItemEventType,
    ) as NewSetItemEvent;

    newSetItemEvent.key = key;
    newSetItemEvent.newValue = newValue;

    // 抛出自定义事件
    window.dispatchEvent(newSetItemEvent);
    originSetItem.apply(this, [key, newValue]);
  };
}
