export default function generateUUID() {
  const cryptoObj = window.crypto; // 兼容不同浏览器
  if (cryptoObj && cryptoObj.getRandomValues) {
    const uuid = new Uint8Array(16);
    cryptoObj.getRandomValues(uuid);
    uuid[6] = (uuid[6] & 0x0f) | 0x40; // Version 4
    uuid[8] = (uuid[8] & 0x3f) | 0x80; // Variant 1 (10*)
    return Array.from(uuid, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  } else {
    // 如果不支持 crypto.getRandomValues，则退回到简单的生成方法
    return generateFallbackUUID();
  }
}

function generateFallbackUUID() {
  const timestamp = new Date().getTime().toString(16);
  const randomStr = Math.random().toString(16).substring(2, 6);
  return timestamp + randomStr;
}
