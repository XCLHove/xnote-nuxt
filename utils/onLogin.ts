import LocalStorageKey from "../enums/LocalStorageKey";
import { elPrompt } from "@/utils/elPrompt";
import afterSetItem from "@/utils/afterSetItem";

type Task = () => void;
let onLoginTask: Task[] = [];
let running = false;

process.client &&
  afterSetItem((key) => {
    if (key !== LocalStorageKey.TOKEN) {
      return;
    }

    if (running) {
      running = false;
      const message = "onLogin：出现递归！";
      elPrompt.error(message, 3);
      throw new Error(message);
    }

    running = true;
    onLoginTask.forEach((task) => task());
    running = false;
  });

export const onLogin = (doSomething: () => void) => {
  onLoginTask.push(doSomething);
  return () => {
    onLoginTask = onLoginTask.filter((task) => task !== doSomething);
  };
};
