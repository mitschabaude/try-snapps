function foo(x: number) {
  return function (this: any, target: any, key: string) {
    console.log('is A', target.constructor === A);
    console.log('this', this);
    console.log('t', target);
    Object.defineProperty(target, key, {
      set: (x) => {
        console.log('setter');
      },
      get: () => 'correct',
    });
  };
}
abstract class B {}

class A extends B {
  @foo(10)
  x: string;

  constructor() {
    super();
    this.x = 'wrong';
  }
}
const a = new A();

console.log(a.x);
