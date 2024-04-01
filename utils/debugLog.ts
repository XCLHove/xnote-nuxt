export const debugLog = (title = "", message?: any, ...optionalParams: any) => {
  console.log(`----------${title}----------`);
  console.log(message, ...optionalParams);
  console.log(`----------${title}----------`);
};
