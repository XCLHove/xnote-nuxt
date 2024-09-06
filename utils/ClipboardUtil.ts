const ClipboardUtil = {
  copy: (text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(resolve).catch(reject)
        return
      }

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
  },
}

export default ClipboardUtil
