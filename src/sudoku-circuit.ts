import {
  matrixProp,
  CircuitValue,
  Field,
  Bool,
  isReady,
  Circuit,
  circuitMain,
  public_,
  shutdown,
  Poseidon,
} from 'snarkyjs';
import { generateSudoku, solveSudoku } from './sudoku-lib.js';

await isReady;

class Sudoku extends CircuitValue {
  @matrixProp(Field, 9, 9) value: Field[][];
  constructor(value: number[][]) {
    super();
    this.value = value.map((row) => row.map(Field));
  }
  hash() {
    return Poseidon.hash(this.value.flat());
  }
}

class SudokuCircuit extends Circuit {
  @circuitMain
  static checkSolution(
    solutionInstance: Sudoku,
    @public_ sudokuInstance: Sudoku
  ) {
    let sudoku = sudokuInstance.value;
    let solution = solutionInstance.value;

    // first, we check that the passed solution is a valid sudoku

    // define helpers
    let range9 = Array.from({ length: 9 }, (_, i) => i);
    let oneTo9 = range9.map((i) => Field(i + 1));

    function assertHas1To9(array: Field[]) {
      oneTo9
        .map((k) => range9.map((i) => array[i].equals(k)).reduce(Bool.or))
        .reduce(Bool.and)
        .assertEquals(true);
    }

    // check all rows
    for (let i = 0; i < 9; i++) {
      let row = solution[i];
      assertHas1To9(row);
    }
    // check all columns
    for (let j = 0; j < 9; j++) {
      let column = solution.map((row) => row[j]);
      assertHas1To9(column);
    }
    // check 3x3 squares
    for (let k = 0; k < 9; k++) {
      let [i0, j0] = divmod(k, 3);
      let square = range9.map((m) => {
        let [i1, j1] = divmod(m, 3);
        return solution[3 * i0 + i1][3 * j0 + j1];
      });
      assertHas1To9(square);
    }

    // next, we check that the solution extends the initial sudoku
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let cell = sudoku[i][j];
        let solutionCell = solution[i][j];
        // either the sudoku has nothing in it (indicated by a cell value of 0),
        // or it is equal to the solution
        Bool.or(cell.equals(0), cell.equals(solutionCell)).assertEquals(true);
      }
    }

    // TODO: fix poseidon
    // finally, we check that the sudoku is the one that was originally deployed
    // let sudokuHash = await this.sudokuHash.get(); // get the hash from the blockchain
    // this.sudoku.hash().assertEquals(sudokuHash);

    // all checks passed => the sudoku is solved!
  }
}

let sudoku = generateSudoku(0.5);
let solution = solveSudoku(sudoku);
let sudokuInstance = new Sudoku(sudoku);
let solutionInstance = new Sudoku(solution);

console.log('generating keypair...');
console.time('generating keypair...');
const kp = SudokuCircuit.generateKeypair();
console.timeEnd('generating keypair...');

console.log('prove...');
console.time('prove...');
const proof = SudokuCircuit.prove([solutionInstance], [sudokuInstance], kp);
console.timeEnd('prove...');

console.log('verify...');
console.time('verify...');
let vk = kp.verificationKey();
let ok = vk.verify([sudokuInstance], proof);
console.timeEnd('verify...');

console.log('ok?', ok);

shutdown();

// helpers
function divmod(k: number, n: number) {
  let q = Math.floor(k / n);
  return [q, k - q * n];
}
