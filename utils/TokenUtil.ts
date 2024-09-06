type OnSetCallback = (token: string) => void
type OnRemoveCallback = () => void
type Callback = () => void

const onSetCallbacks: OnSetCallback[] = []
const onRemoveCallbacks: OnRemoveCallback[] = []

const TokenUtil = {
  get: () => LocalStorageUtil.get(LocalStorageKey.TOKEN),
  set: (token: string) => {
    LocalStorageUtil.set(LocalStorageKey.TOKEN, token)
    onSetCallbacks.forEach((callback) => callback(token))
  },
  remove: () => {
    LocalStorageUtil.remove(LocalStorageKey.TOKEN)
    onRemoveCallbacks.forEach((callback) => callback())
  },
  /**
   * @return removeCallback: () => void
   */
  onSet: (callback: OnSetCallback, onlyExecuteOnce?: boolean) => {
    let removeCallback: Callback

    const callbackWrapper: typeof callback = (token: string) => {
      if (onlyExecuteOnce) {
        removeCallback()
      }

      callback(token)
    }

    removeCallback = () => {
      removeCallback = () => {}
      onSetCallbacks.splice(onSetCallbacks.indexOf(callbackWrapper), 1)
    }

    onSetCallbacks.push(callbackWrapper)

    return removeCallback
  },
  /**
   * @return removeCallback: () => void
   */
  onRemove: (callback: OnRemoveCallback, onlyExecuteOnce?: boolean) => {
    let removeCallback: Callback

    const callbackWrapper: typeof callback = () => {
      if (onlyExecuteOnce) {
        removeCallback()
      }

      callback()
    }

    onRemoveCallbacks.push(callbackWrapper)

    removeCallback = () => {
      removeCallback = () => {}
      onRemoveCallbacks.splice(onRemoveCallbacks.indexOf(callback), 1)
    }
    return removeCallback
  },
}

export default TokenUtil
