export const Log = (...rest: any[]) => {
  if (process.env.WEBROUTE_DEBUG === "1") {
    console.debug(...rest);
  }
};
