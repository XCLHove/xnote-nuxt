import LocalStorageKey from "../enums/LocalStorageKey.ts";
import { elPrompt } from "@/utils/elPrompt.ts";
import afterRemoveItem from "@/utils/afterRemoveItem.ts";

type Task = () => void;
let onLogoutTask: Task[] = [];
let running = false;

process.client &&
  afterRemoveItem((key) => {
    if (key !== LocalStorageKey.TOKEN) {
      return;
    }

    if (running) {
      const message = "onLogin：出现递归！";
      elPrompt.error(message, 3);
      running = false;
      throw new Error(message);
    }

    running = true;
    onLogoutTask.forEach((task) => task());
    running = false;
  });

export const onLogout = (doSomething: () => void) => {
  onLogoutTask.push(doSomething);
  return () => {
    onLogoutTask = onLogoutTask.filter((task) => task != doSomething);
  };
};
