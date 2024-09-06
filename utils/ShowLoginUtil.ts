type Callback = () => void
let showCallback: Callback | null = null
let afterCloseCallbacks: Callback[] = []

const ShowLoginUtil = {
  registerShow: (callback: typeof showCallback) => {
    showCallback = callback

    return () => {
      showCallback = null
    }
  },
  show: () => {
    showCallback?.()
  },
  invokeCloseCallbacks: () => {
    afterCloseCallbacks.forEach((callback) => callback())
  },
  /**
   * @return removeCallback: () => void
   */
  afterClose: (callback: Callback, onlyExecuteOnce?: boolean) => {
    let removeCallbackWrapper: Callback
    const callbackWrapper = () => {
      if (onlyExecuteOnce) {
        removeCallbackWrapper()
      }
      callback()
    }
    removeCallbackWrapper = () => {
      removeCallbackWrapper = () => {}
      afterCloseCallbacks.splice(
        afterCloseCallbacks.indexOf(callbackWrapper),
        1,
      )
    }
    afterCloseCallbacks.push(callback)
    return removeCallbackWrapper
  },
  clearCallbacks: () => {
    afterCloseCallbacks = []
  },
}

export default ShowLoginUtil
