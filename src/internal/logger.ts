export const Log = (...rest: any[]) => {
  if (process.env.EXPRESS_X_DEBUG === "1") {
    console.debug(...rest);
  }
};
