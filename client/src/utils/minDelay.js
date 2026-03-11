/**
 * Wraps a promise to ensure it takes at least `ms` milliseconds.
 * The loader stays visible for a minimum duration even if the API responds instantly.
 */
export const minDelay = (promise, ms = 1000) => {
  const timer = new Promise((r) => setTimeout(r, ms));
  return promise.then(
    (result) => timer.then(() => result),
    (err) => timer.then(() => { throw err; })
  );
};
