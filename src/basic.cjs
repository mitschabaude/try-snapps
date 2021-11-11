let snarky = require('@o1labs/snarkyjs');

(async () => {
  await snarky.snarkyReady;
  let { Circuit } = snarky;

  console.log(Circuit);
})();
