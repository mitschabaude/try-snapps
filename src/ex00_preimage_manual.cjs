let snarky = require('snarkyjs');
let { Circuit, Poseidon } = snarky;

class Main extends Circuit {
  static main(preimage, hash) {
    Poseidon.hash([preimage]).assertEquals(hash);
  }
}

(async () => {
  await snarky.isReady;

  var { Field, circuitMain, public_, shutdown } = snarky;

  // apply decorators manually!

  // save metadata in some map
  Reflect.metadata('design:returntype', undefined)(Main, 'main');
  Reflect.metadata('design:paramtypes', [Field, Field])(Main, 'main');
  Reflect.metadata('design:type', Function)(Main, 'main');

  // add second parameter to list of public parameters
  public_(Main, 'main', 1);

  // construct actual .snarkyMain function and helper classes describing witness / public inputs
  circuitMain(Main, 'main');

  // console.log('Circuit', Circuit);
  // console.log('Circuit.prototype', Circuit.prototype);
  // console.log('Main', Main);
  // console.log('Main.prototype', Main.prototype);

  const f = new Field(10);
  console.log(f.add(3));

  const kp = Main.generateKeypair();
  // const kp = snarky.Circuit.generateKeypair.apply(Main);
  console.log({ kp });
  shutdown();
  // const preimage = Field.random();
  // const hash = Poseidon.hash([preimage]);
  // const pi = Main.prove([preimage], [hash], kp);
  // console.log('proof', pi);
})();
