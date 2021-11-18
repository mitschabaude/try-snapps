let snarky = require('@o1labs/snarkyjs');
let { Circuit, Poseidon } = snarky;

class Main extends Circuit {
  static main(preimage, hash) {
    Poseidon.hash([preimage]).assertEquals(hash);
  }
}

(async () => {
  await snarky.snarkyReady;

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

  const kp = Main.generateKeypair();
  // const kp = snarky.Circuit.generateKeypair.apply(Main);
  console.log({ kp });
  shutdown();
  // const preimage = Field.random();
  // const hash = Poseidon.hash([preimage]);
  // const pi = Main.prove([preimage], [hash], kp);
  // console.log('proof', pi);
})();

// everything down below was for manual / ES5 class extension, to peek closer into what's going on

// function Main() {
//   return _super.apply(this, arguments);
// }
// _inherits(Main, Circuit);
// var _super = _createSuper(Main);
// _createClass(Main, null, [
//   {
//     key: 'main',
//     value: function main(preimage, hash) {
//       Poseidon.hash([preimage]).assertEquals(hash);
//     },
//   },
// ]);

// function _typeof(obj) {
//   '@babel/helpers - typeof';
//   if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
//     _typeof = function _typeof(obj) {
//       return typeof obj;
//     };
//   } else {
//     _typeof = function _typeof(obj) {
//       return obj &&
//         typeof Symbol === 'function' &&
//         obj.constructor === Symbol &&
//         obj !== Symbol.prototype
//         ? 'symbol'
//         : typeof obj;
//     };
//   }
//   return _typeof(obj);
// }

// function _classCallCheck(instance, Constructor) {
//   if (!(instance instanceof Constructor)) {
//     throw new TypeError('Cannot call a class as a function');
//   }
// }

// function _defineProperties(target, props) {
//   for (var i = 0; i < props.length; i++) {
//     var descriptor = props[i];
//     descriptor.enumerable = descriptor.enumerable || false;
//     descriptor.configurable = true;
//     if ('value' in descriptor) descriptor.writable = true;
//     Object.defineProperty(target, descriptor.key, descriptor);
//   }
// }

// function _createClass(Constructor, protoProps, staticProps) {
//   if (protoProps) _defineProperties(Constructor.prototype, protoProps);
//   if (staticProps) _defineProperties(Constructor, staticProps);
//   return Constructor;
// }

// function _inherits(subClass, superClass) {
//   if (typeof superClass !== 'function' && superClass !== null) {
//     throw new TypeError('Super expression must either be null or a function');
//   }
//   subClass.prototype = Object.create(superClass && superClass.prototype, {
//     constructor: { value: subClass, writable: true, configurable: true },
//   });
//   if (superClass) _setPrototypeOf(subClass, superClass);
// }

// function _setPrototypeOf(o, p) {
//   _setPrototypeOf =
//     Object.setPrototypeOf ||
//     function _setPrototypeOf(o, p) {
//       o.__proto__ = p;
//       return o;
//     };
//   return _setPrototypeOf(o, p);
// }

// function _createSuper(Derived) {
//   var hasNativeReflectConstruct = true; //_isNativeReflectConstruct();
//   return function _createSuperInternal() {
//     var Super = _getPrototypeOf(Derived),
//       result;
//     // if (hasNativeReflectConstruct) {
//     var NewTarget = _getPrototypeOf(this).constructor;
//     result = Reflect.construct(Super, arguments, NewTarget);
//     // } else {
//     //   result = Super.apply(this, arguments);
//     // }
//     return _possibleConstructorReturn(this, result);
//   };
// }

// function _possibleConstructorReturn(self, call) {
//   if (call && (_typeof(call) === 'object' || typeof call === 'function')) {
//     return call;
//   } else if (call !== void 0) {
//     throw new TypeError(
//       'Derived constructors may only return object or undefined'
//     );
//   }
//   return _assertThisInitialized(self);
// }

// function _assertThisInitialized(self) {
//   if (self === void 0) {
//     throw new ReferenceError(
//       "this hasn't been initialised - super() hasn't been called"
//     );
//   }
//   return self;
// }

// function _isNativeReflectConstruct() {
//   if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
//   if (Reflect.construct.sham) return false;
//   if (typeof Proxy === 'function') return true;
//   try {
//     Boolean.prototype.valueOf.call(
//       Reflect.construct(Boolean, [], function () {})
//     );
//     return true;
//   } catch (e) {
//     return false;
//   }
// }

// function _getPrototypeOf(o) {
//   _getPrototypeOf = Object.setPrototypeOf
//     ? Object.getPrototypeOf
//     : function _getPrototypeOf(o) {
//         return o.__proto__ || Object.getPrototypeOf(o);
//       };
//   return _getPrototypeOf(o);
// }
