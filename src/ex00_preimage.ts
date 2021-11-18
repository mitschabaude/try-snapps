import {
  Circuit,
  Field,
  Poseidon,
  circuitMain,
  public_,
} from '@o1labs/snarkyjs';

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
