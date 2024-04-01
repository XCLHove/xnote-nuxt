type DOSomeThing = (key: string, value: string) => void;

let doSomeThingList: DOSomeThing[] = [];

const changeSetItem = (() => {
  let hasExecuted = false;

  return () => {
    if (!process.client) return;

    if (hasExecuted) return;
    hasExecuted = true;

    const originSetItem = window.localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originSetItem.call(localStorage, key, value);
      doSomeThingList.forEach((doSomeThing) => doSomeThing(key, value));
    };
  };
})();

const addSetItemListener = () => {
  const listener = ({ key, newValue: value }: StorageEvent) => {
    if (key === null || value === null) return;
    doSomeThingList.forEach((doSomeThing) => doSomeThing(key, value));
  };
  addEventListener("storage", listener);

  return () => {
    removeEventListener("storage", listener);
  };
};

const afterSetItem = (doSomeThing: DOSomeThing) => {
  changeSetItem();
  const removeListener = addSetItemListener();

  doSomeThingList.push(doSomeThing);

  return () => {
    removeListener();
    doSomeThingList = doSomeThingList.filter((item) => item !== doSomeThing);
  };
};

export default afterSetItem;
