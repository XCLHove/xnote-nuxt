const ClipboardUtil = {
  copy: (text: string) => {
    let _copy: (text: string) => Promise<void>

    if (navigator.clipboard) {
      _copy = navigator.clipboard.writeText
    } else {
      _copy = (text: string) => {
        return new Promise<void>((resolve, reject) => {
          try {
            const input = document.createElement('input')
            input.value = text
            document.body.appendChild(input)
            input.select()
            document.execCommand('copy')
            document.body.removeChild(input)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      }
    }

    ClipboardUtil.copy = _copy
    return _copy(text)
  },
}

export default ClipboardUtil
