import {
  matrixProp,
  CircuitValue,
  Field,
  shutdown,
  SmartContract,
  PublicKey,
  method,
  PrivateKey,
  Mina,
  Bool,
  state,
  State,
  isReady,
  Poseidon,
} from '@o1labs/snarkyjs';
import { generateRandomSudoku, clone } from './generate-sudoku.js';

await isReady;

function divmod(k: number, n: number) {
  let q = Math.floor(k / n);
  return [q, k - q * n];
}
class Sudoku extends CircuitValue {
  @matrixProp(Field, 9, 9) value: Field[][];

  constructor(value: number[][]) {
    super();
    this.value = value.map((row) => row.map((n) => new Field(n)));
  }

  hash() {
    return Poseidon.hash(this.value.flat());
  }
}

class SudokuSnapp extends SmartContract {
  sudoku: Sudoku;
  @state(Field) sudokuHash: State<Field>;
  @state(Bool) isSolved: State<Bool>;

  constructor(address: PublicKey, sudoku: Sudoku) {
    super(address);
    this.sudoku = sudoku;
    this.sudokuHash = State.init(sudoku.hash());
    this.isSolved = State.init(new Bool(false));
  }

  @method async checkSolution(solutionInstance: Sudoku) {
    let sudoku = this.sudoku.value;
    let solution = solutionInstance.value;

    // first, we check that the passed solution is a valid sudoku
    let False = new Bool(false);
    let range9 = Array.from({ length: 9 }, (_, i) => i);
    let oneTo9 = range9.map((i) => new Field(i + 1));

    function assertHas1To9(array: Field[]) {
      oneTo9
        .map((i) => array.reduce((acc, j) => Bool.or(acc, i.equals(j)), False))
        .reduce((acc, j) => Bool.and(acc, j))
        .assertEquals(true);
    }

    // check all rows
    for (let i = 0; i < 9; i++) {
      assertHas1To9(solution[i]);
    }
    // check all columns
    for (let j = 0; j < 9; j++) {
      assertHas1To9(solution.map((row) => row[j]));
    }
    // check 3x3 squares
    for (let k = 0; k < 9; k++) {
      let [i0, j0] = divmod(k, 3);
      let square = range9.map((m) => {
        let [ii, jj] = divmod(m, 3);
        return solution[3 * i0 + ii][3 * j0 + jj];
      });
      assertHas1To9(square);
    }

    // next, we check that the solution extends the initial sudoku
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let cell = sudoku[i][j];
        let solutionCell = solution[i][j];
        // either the sudoku has nothing in it (indicated by a cell value of 0), or it is equal to the solution
        Bool.or(cell.equals(0), cell.equals(solutionCell)).assertEquals(true);
      }
    }

    // finally, we check that the sudoku is the one that was originally deployed to the smart contract
    let sudokuHash = await this.sudokuHash.get(); // pull the value from the blockchain
    this.sudoku.hash().assertEquals(sudokuHash);

    // update the state to isSolved
    this.isSolved.set(new Bool(true));
  }
}

let [sudoku, solution] = generateRandomSudoku(0.5);

const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);
let account1 = Local.testAccounts[0].privateKey;
let account2 = Local.testAccounts[1].privateKey;

let snappAccount = PrivateKey.random();
let snappAddress = snappAccount.toPublicKey();
Local.addAccount(snappAddress, 100);

let snapp: SudokuSnapp;
let tx = Mina.transaction(account1, async () => {
  console.log('Deploying Sudoku...');
  snapp = new SudokuSnapp(snappAddress, new Sudoku(sudoku));
});
await tx.send().wait();

let snappState = (await Mina.getAccount(snappAddress)).snapp.appState[1];
console.log(`Is the Sudoku solved? ${snappState.toString()}`);

// create a wrong solution by modifying the first cell by 1
let noSolution = clone(solution);
noSolution[0][0] = (noSolution[0][0] % 9) + 1;
tx = Mina.transaction(account2, async () => {
  console.log('Checking wrong solution...');
  await snapp.checkSolution(new Sudoku(noSolution));
});
await tx
  .send()
  .wait()
  .catch(() => console.log('Checking wrong solution failed!'));

snappState = (await Mina.getAccount(snappAddress)).snapp.appState[1];
console.log(`Is the Sudoku solved? ${snappState.toString()}`);

tx = Mina.transaction(account2, async () => {
  console.log('Checking solution...');
  await snapp.checkSolution(new Sudoku(solution));
});
await tx.send().wait();

snappState = (await Mina.getAccount(snappAddress)).snapp.appState[1];
console.log(`Is the Sudoku solved? ${snappState.toString()}`);

if (snappState.equals(true).toBoolean()) {
  console.log(
    '=> Mina contains a proof that someone solved the Sudoku, while the solution remains hidden!'
  );
}

shutdown();
