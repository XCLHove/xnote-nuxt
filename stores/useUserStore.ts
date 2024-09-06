import { getUserSelfInfoApi } from '~/apis/userApi'
import type { UserVO } from '~/types/vo/UserVO'

type AfterRefreshCallback = (userInfo: UserVO) => void
type Callback = () => void

export const useUserStore = defineStore('useUserStore', () => {
  const userInfo = ref<UserVO | null>(null)

  const onRefresh = ref(false)
  const refreshUserInfo = async () => {
    if (!TokenUtil.get()) {
      return
    }
    onRefresh.value = true
    await getUserSelfInfoApi()
      .then(({ data }) => {
        userInfo.value = data

        afterRefreshCallbacks.forEach((callback) => callback(data))
      })
      .catch(() => {
        userInfo.value = null
      })
      .finally(() => {
        onRefresh.value = false
      })
  }

  const afterRefreshCallbacks: AfterRefreshCallback[] = []
  /**
   * @return removeCallback: () => void
   */
  const afterRefresh = (
    callback: AfterRefreshCallback,
    onlyExecuteOnce?: boolean,
  ) => {
    let removeCallback: Callback
    const callbackWrapper: AfterRefreshCallback = (userInfo: UserVO) => {
      if (onlyExecuteOnce) {
        removeCallback()
      }
      callback(userInfo)
    }

    afterRefreshCallbacks.push(callbackWrapper)
    removeCallback = () => {
      removeCallback = () => {}
      afterRefreshCallbacks.splice(
        afterRefreshCallbacks.indexOf(callbackWrapper),
        1,
      )
    }
    return removeCallback
  }

  onMounted(() => {
    refreshUserInfo()

    const removeOnSetListener = TokenUtil.onSet(refreshUserInfo)
    onUnmounted(() => {
      removeOnSetListener()
    })

    const removeOnRemoveListener = TokenUtil.onRemove(() => {
      userInfo.value = null
    })
    onUnmounted(() => {
      removeOnRemoveListener()
    })
  })

  return {
    userInfo,
    onRefresh,
    refreshUserInfo,
    afterRefresh,
  }
})
