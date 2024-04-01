/**
 * Copy text to clipboard
 * 将文本复制到剪贴板
 * @param text
 * @param onFinish 复制完成后执行的操作
 */
export function copyTextToClipboard(text: string, onFinish?: Function) {
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  onFinish?.();
}
