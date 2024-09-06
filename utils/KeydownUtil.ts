const keydownUtil = {
  ifCtrlS: (ke: KeyboardEvent, callback: () => void) => {
    if (ke.ctrlKey && ke.key === 's') {
      ke.preventDefault()
      callback()
    }
  },
}

export default keydownUtil
