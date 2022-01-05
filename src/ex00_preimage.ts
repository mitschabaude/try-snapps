import {
  Circuit,
  Field,
  Poseidon,
  circuitMain,
  public_,
  isReady,
} from 'snarkyjs';

await isReady;

class Main extends Circuit {
  @circuitMain
  static main(preimage: Field, @public_ hash: Field) {
    Poseidon.hash([preimage]).assertEquals(hash);
  }
}

const kp = Main.generateKeypair();

const preimage = Field.random();
const hash = Poseidon.hash([preimage]);
const pi = Main.prove([preimage], [hash], kp);
console.log('proof', pi);
