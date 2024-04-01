type DOSomeThing = (key: string) => void;

let doSomeThingList: DOSomeThing[] = [];

const changeRemoveItem = (() => {
  let hasExecuted = false;

  return () => {
    if (hasExecuted) return;
    hasExecuted = true;

    const originRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function (key) {
      originRemoveItem.call(localStorage, key);
      doSomeThingList.forEach((doSomeThing) => doSomeThing(key));
    };
  };
})();

const addRemoveItemListener = () => {
  const listener = ({ key, newValue: value }: StorageEvent) => {
    if (key === null || value !== null) return;
    doSomeThingList.forEach((doSomeThing) => doSomeThing(key));
  };
  addEventListener("storage", listener);

  return () => {
    removeEventListener("storage", listener);
  };
};

const afterRemoveItem = (doSomeThing: DOSomeThing) => {
  changeRemoveItem();
  const removeListener = addRemoveItemListener();

  doSomeThingList.push(doSomeThing);

  return () => {
    removeListener();
    doSomeThingList = doSomeThingList.filter((item) => item !== doSomeThing);
  };
};

export default afterRemoveItem;
