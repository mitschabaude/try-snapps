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
} from '@o1labs/snarkyjs';
import { generateRandomSudoku } from './generate-sudoku.js';

export { main };

async function main() {
  let [sudoku, solution] = generateRandomSudoku(0.5);
  let account = PrivateKey.random();
  let address = account.toPublicKey();

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);

  Local.addAccount(address, 1);

  let snapp: SudokuSnapp;

  let tx = Mina.transaction(account, async () => {
    console.log('Deploying Sudoku...');
    snapp = new SudokuSnapp(new Sudoku(sudoku), address);
  });
  await tx.send().wait();

  let snappState = (await Mina.getAccount(address)).snapp.appState[0];
  console.log(`Is the Sudoku solved? ${snappState.toString()}`);

  tx = Mina.transaction(account, async () => {
    console.log('Checking solution...');
    snapp.checkSolution(new Sudoku(solution));
  });
  await tx.send().wait();

  snappState = (await Mina.getAccount(address)).snapp.appState[0];
  console.log(`Is the Sudoku solved? ${snappState.toString()}`);

  if (snappState.equals(true)) {
    console.log(
      '=> Mina contains a proof that someone solved the Sudoku, while the solution remains hidden!'
    );
  }

  shutdown();
}

class Sudoku extends CircuitValue {
  @matrixProp(Field, 9, 9) value: Field[][];

  constructor(value: number[][]) {
    super();
    this.value = value.map((row) => row.map((n) => new Field(n)));
  }
}

class SudokuSnapp extends SmartContract {
  sudoku: Sudoku;
  @state(Bool) isSolved: State<Bool>;

  constructor(sudoku: Sudoku, address: PublicKey) {
    super(address);
    this.isSolved = State.init(new Bool(false));
    this.sudoku = sudoku;
  }

  @method checkSolution(solutionInstance: Sudoku) {
    let sudoku = this.sudoku.value;
    let solution = solutionInstance.value;

    // first, we check that the passed solution is a valid sudoku
    let False = new Bool(false);
    let True = new Bool(true);
    let range9 = Array.from({ length: 9 }, (_, i) => i);
    let oneTo9 = range9.map((i) => new Field(i + 1));

    function has1To9(array: Field[]) {
      return oneTo9
        .map((i) => array.reduce((acc, j) => Bool.or(acc, i.equals(j)), False))
        .reduce((acc, j) => Bool.and(acc, j), True);
    }

    // check all rows
    for (let i = 0; i < 9; i++) {
      has1To9(solution[i]).assertEquals(true);
    }
    // check all columns
    for (let j = 0; j < 9; j++) {
      has1To9(solution.map((row) => row[j])).assertEquals(true);
    }
    // check 3x3 squares
    for (let k = 0; k < 9; k++) {
      let [i0, j0] = divmod(k, 3);
      let square = range9.map((m) => {
        let [ii, jj] = divmod(m, 3);
        return solution[3 * i0 + ii][3 * j0 + jj];
      });
      has1To9(square).assertEquals(true);
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

    // update the state to isSolved
    this.isSolved.set(new Bool(true));
  }
}

function divmod(k: number, n: number) {
  let q = Math.floor(k / n);
  return [q, k - q * n];
}

main();
