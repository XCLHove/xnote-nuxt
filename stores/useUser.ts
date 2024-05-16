import type { User } from "@/interfaces/entity/User";
import LocalStorageKey from "@/enums/LocalStorageKey";
import { getUserSelfInfo, userLogout } from "~/api/UserApi";
import type { Ref } from "vue";

export const useUser = defineStore("user", () => {
  const value: Ref<User | null | undefined> = ref();

  const getUserInfo = () => {
    if (!process.client) return;

    const token = localStorage.getItem(LocalStorageKey.TOKEN);
    if (!token) return;
    getUserSelfInfo().then((result) => {
      value.value = result.data;
    });
  };

  process.client &&
    onMounted(() => {
      getUserInfo();

      const removeLoginListener = onLogin(() => {
        getUserInfo();
      });
      const removeLogoutListener = onLogout(() => {
        value.value = null;
      });
      onUnmounted(() => {
        removeLoginListener();
        removeLogoutListener();
      });
    });

  const logout = () => {
    userLogout().then(() => {
      localStorage.removeItem(LocalStorageKey.TOKEN);
      elPrompt.success("注销成功！");
      useShowUserLogin().hide();
    });
  };

  return {
    value,
    logout,
  };
});
