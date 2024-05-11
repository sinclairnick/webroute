export const Log = (...rest: any[]) => {
  if (process.env.HARISSA_DEBUG === "1") {
    console.debug(...rest);
  }
};
