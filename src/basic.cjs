let snarky = require('@o1labs/snarkyjs');

(async () => {
  await snarky.isReady;
  let { Circuit } = snarky;

  console.log(Circuit);
})();
