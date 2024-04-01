import { defineStore } from "pinia";
import { ref, watch } from "vue";

type Task = () => void;

const storeSetup = () => {
  const value = ref(false);
  watch(
    () => value.value,
    (show) => {
      if (show) {
        onShowTasks.forEach((task) => task());
        return;
      }
      onHideTasks.forEach((task) => task());
    },
  );
  let onShowTasks: Task[] = [];
  let onHideTasks: Task[] = [];
  const onShow = (onShowTask: Task) => {
    onShowTasks.push(onShowTask);

    return () => {
      removeOnShowTask(onShowTask);
    };
  };
  const onHide = (onHideTask: Task) => {
    onHideTasks.push(onHideTask);

    return () => {
      removeOnHideTask(onHideTask);
    };
  };

  const show = () => {
    value.value = true;
  };
  const hide = () => {
    value.value = false;
  };
  const removeOnShowTask = (removeTask: Task) => {
    onShowTasks = onShowTasks.filter((task) => task !== removeTask);
  };
  const removeOnHideTask = (removeTask: Task) => {
    onHideTasks = onHideTasks.filter((task) => task !== removeTask);
  };

  return {
    value,
    show,
    hide,
    onShow,
    onHide,
  };
};

export const useShowUserLogin = defineStore("showUserLogin", storeSetup);
