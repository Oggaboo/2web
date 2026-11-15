// A dependency graph that contains any wasm must be imported asynchronously.
// Errors are rethrown so the 2Web SDK can show them instead of a blank box.
import("./index.js").catch((e) => {
  setTimeout(() => {
    throw e;
  });
});
