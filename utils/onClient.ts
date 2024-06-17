export default (callback: () => void) => {
  if (!process.client) return;
  callback();
};
