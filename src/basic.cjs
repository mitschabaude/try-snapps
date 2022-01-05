let snarky = require('snarkyjs');

(async () => {
  await snarky.isReady;
  let { Circuit } = snarky;

  console.log(Circuit);
})();
