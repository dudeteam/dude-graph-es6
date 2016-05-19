(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.dudeGraph = global.dudeGraph || {})));
}(this, function (exports) { 'use strict';

    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /**
     * Gets the index at which the first occurrence of `NaN` is found in `array`.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched `NaN`, else `-1`.
     */
    function indexOfNaN(array, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 0 : -1);

      while (fromRight ? index-- : ++index < length) {
        var other = array[index];
        if (other !== other) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return indexOfNaN(array, fromIndex);
      }
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This function is like `baseIndexOf` except that it accepts a comparator.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @param {Function} comparator The comparator invoked per element.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOfWith(array, value, fromIndex, comparator) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (comparator(array[index], value)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.unary` without support for storing wrapper metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function (value) {
        return func(value);
      };
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * The base implementation of `_.pullAllBy` without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns `array`.
     */
    function basePullAll(array, values, iteratee, comparator) {
      var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
          index = -1,
          length = values.length,
          seen = array;

      if (iteratee) {
        seen = arrayMap(array, baseUnary(iteratee));
      }
      while (++index < length) {
        var fromIndex = 0,
            value = values[index],
            computed = iteratee ? iteratee(value) : value;

        while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
          if (seen !== array) {
            splice.call(seen, fromIndex, 1);
          }
          splice.call(array, fromIndex, 1);
        }
      }
      return array;
    }

    /**
     * This method is like `_.pull` except that it accepts an array of values to remove.
     *
     * **Note:** Unlike `_.difference`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     *
     * _.pullAll(array, [2, 3]);
     * console.log(array);
     * // => [1, 1]
     */
    function pullAll(array, values) {
      return array && array.length && values && values.length ? basePullAll(array, values) : array;
    }

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      var length = args.length;
      switch (length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
      return !!value && (type == 'object' || type == 'function');
    }

    var funcTag = '[object Function]';
    var genTag = '[object GeneratorFunction]';
    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8 which returns 'object' for typed array and weak map constructors,
      // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) == 'object';
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$1 = objectProto$1.toString;

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) == 'symbol' || isObjectLike(value) && objectToString$1.call(value) == symbolTag;
    }

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = isFunction(value.valueOf) ? value.valueOf() : value;
        value = isObject(other) ? other + '' : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }

    var INFINITY = 1 / 0;
    var MAX_INTEGER = 1.7976931348623157e+308;
    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This function is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;

      return result === result ? remainder ? result - remainder : result : 0;
    }

    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as
     * an array.
     *
     * **Note:** This method is based on the
     * [rest parameter](https://mdn.io/rest_parameters).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.rest(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
     *
     * say('hello', 'fred', 'barney', 'pebbles');
     * // => 'hello fred, barney, & pebbles'
     */
    function rest(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = nativeMax(start === undefined ? func.length - 1 : toInteger(start), 0);
      return function () {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        switch (start) {
          case 0:
            return func.call(this, array);
          case 1:
            return func.call(this, args[0], array);
          case 2:
            return func.call(this, args[0], args[1], array);
        }
        var otherArgs = Array(start + 1);
        index = -1;
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = array;
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Removes all given values from `array` using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
     * to remove elements from an array by predicate.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...*} [values] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     *
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    var pull = rest(pullAll);

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function (object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetPrototype = Object.getPrototypeOf;

    /**
     * Gets the `[[Prototype]]` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {null|Object} Returns the `[[Prototype]]`.
     */
    function getPrototype(value) {
      return nativeGetPrototype(Object(value));
    }

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto$2.hasOwnProperty;

    /**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHas(object, key) {
      // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
      // that are composed entirely of index properties, return `false` for
      // `hasOwnProperty` checks of them.
      return hasOwnProperty.call(object, key) || (typeof object === 'undefined' ? 'undefined' : babelHelpers.typeof(object)) == 'object' && key in object && getPrototype(object) === null;
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = Object.keys;

    /**
     * The base implementation of `_.keys` which doesn't skip the constructor
     * property of prototypes or treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      return nativeKeys(Object(object));
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function (object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * Gets the "length" property value of `object`.
     *
     * **Note:** This function is used to avoid a
     * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
     * Safari on at least iOS 8.1-8.3 ARM64.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {*} Returns the "length" value.
     */
    var getLength = baseProperty('length');

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This function is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length,
     *  else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(getLength(value)) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$3.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$2 = objectProto$3.toString;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty$1.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString$2.call(value) == argsTag);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @type {Function}
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /** `Object#toString` result references. */
    var stringTag = '[object String]';

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$3 = objectProto$4.toString;

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' || !isArray(value) && isObjectLike(value) && objectToString$3.call(value) == stringTag;
    }

    /**
     * Creates an array of index keys for `object` values of arrays,
     * `arguments` objects, and strings, otherwise `null` is returned.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array|null} Returns index keys, else `null`.
     */
    function indexKeys(object) {
      var length = object ? object.length : undefined;
      if (isLength(length) && (isArray(object) || isString(object) || isArguments(object))) {
        return baseTimes(length, String);
      }
      return null;
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER$1 : length;
      return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
    }

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$5;

      return value === proto;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      var isProto = isPrototype(object);
      if (!(isProto || isArrayLike(object))) {
        return baseKeys(object);
      }
      var indexes = indexKeys(object),
          skipIndexes = !!indexes,
          result = indexes || [],
          length = result.length;

      for (var key in object) {
        if (baseHas(object, key) && !(skipIndexes && (key == 'length' || isIndex(key, length))) && !(isProto && key == 'constructor')) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function (collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while (fromRight ? index-- : ++index < length) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * The base implementation of methods like `_.find` and `_.findKey`, without
     * support for iteratee shorthands, which iterates over `collection` using
     * `eachFunc`.
     *
     * @private
     * @param {Array|Object} collection The collection to search.
     * @param {Function} predicate The function invoked per iteration.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @param {boolean} [retKey] Specify returning the key of the found element
     *  instead of the element itself.
     * @returns {*} Returns the found element or its key, else `undefined`.
     */
    function baseFind(collection, predicate, eachFunc, retKey) {
      var result;
      eachFunc(collection, function (value, key, collection) {
        if (predicate(value, key, collection)) {
          result = retKey ? key : value;
          return false;
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {Function} predicate The function invoked per iteration.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromRight) {
      var length = array.length,
          index = fromRight ? length : -1;

      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'fred' };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto$1 = Array.prototype;

    /** Built-in value references. */
    var splice$1 = arrayProto$1.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice$1.call(data, index, 1);
      }
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache();
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      return this.__data__['delete'](key);
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Checks if `value` is a host object in IE < 9.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
     */
    function isHostObject(value) {
      // Many host objects are `Object` objects that can coerce to strings
      // despite having improperly defined `toString` methods.
      var result = false;
      if (value != null && typeof value.toString != 'function') {
        try {
          result = !!(value + '');
        } catch (e) {}
      }
      return result;
    }

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = Function.prototype.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return func + '';
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = Function.prototype.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$6.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

    /**
     * Checks if `value` is a native function.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     * @example
     *
     * _.isNative(Array.prototype.push);
     * // => true
     *
     * _.isNative(_);
     * // => false
     */
    function isNative(value) {
      if (!isObject(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = object[key];
      return isNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$7.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$8.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty$4.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Checks if `value` is a global object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {null|Object} Returns `value` if it's a global object, else `null`.
     */
    function checkGlobal(value) {
      return value && value.Object === Object ? value : null;
    }

    /** Used to determine if values are of the language type `Object`. */
    var objectTypes = {
      'function': true,
      'object': true
    };

    /** Detect free variable `exports`. */
    var freeExports = objectTypes[typeof exports === 'undefined' ? 'undefined' : babelHelpers.typeof(exports)] && exports && !exports.nodeType ? exports : undefined;

    /** Detect free variable `module`. */
    var freeModule = objectTypes[typeof module === 'undefined' ? 'undefined' : babelHelpers.typeof(module)] && module && !module.nodeType ? module : undefined;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = checkGlobal(freeExports && freeModule && (typeof global === 'undefined' ? 'undefined' : babelHelpers.typeof(global)) == 'object' && global);

    /** Detect free variable `self`. */
    var freeSelf = checkGlobal(objectTypes[typeof self === 'undefined' ? 'undefined' : babelHelpers.typeof(self)] && self);

    /** Detect free variable `window`. */
    var freeWindow = checkGlobal(objectTypes[typeof window === 'undefined' ? 'undefined' : babelHelpers.typeof(window)] && window);

    /** Detect `this` as the global object. */
    var thisGlobal = checkGlobal(objectTypes[babelHelpers.typeof(this)] && this);

    /**
     * Used as a reference to the global object.
     *
     * The `this` value is used if it's the global object to avoid Greasemonkey's
     * restricted `window` object, otherwise the `window` object is used.
     */
    var root = freeGlobal || freeWindow !== (thisGlobal && thisGlobal.window) && freeWindow || freeSelf || thisGlobal || Function('return this')();

    /* Built-in method references that are verified to be native. */
    var Map = getNative(root, 'Map');

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.__data__ = {
        'hash': new Hash(),
        'map': new (Map || ListCache)(),
        'string': new Hash()
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
      return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      return getMapData(this, key)['delete'](key);
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
        cache = this.__data__ = new MapCache(cache.__data__);
      }
      cache.set(key, value);
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values ? values.length : 0;

      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    var UNORDERED_COMPARE_FLAG$1 = 1;
    var PARTIAL_COMPARE_FLAG$2 = 2;
    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG$2,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = bitmask & UNORDERED_COMPARE_FLAG$1 ? new SetCache() : undefined;

      stack.set(array, other);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function (othValue, othIndex) {
            if (!seen.has(othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      return result;
    }

    /** Built-in value references. */
    var _Symbol = root.Symbol;

    /** Built-in value references. */
    var Uint8Array = root.Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function (value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function (value) {
        result[++index] = value;
      });
      return result;
    }

    var UNORDERED_COMPARE_FLAG$2 = 1;
    var PARTIAL_COMPARE_FLAG$3 = 2;
    var boolTag = '[object Boolean]';
    var dateTag = '[object Date]';
    var errorTag = '[object Error]';
    var mapTag = '[object Map]';
    var numberTag = '[object Number]';
    var regexpTag = '[object RegExp]';
    var setTag = '[object Set]';
    var stringTag$1 = '[object String]';
    var symbolTag$1 = '[object Symbol]';
    var arrayBufferTag = '[object ArrayBuffer]';
    var dataViewTag = '[object DataView]';
    var symbolProto = _Symbol ? _Symbol.prototype : undefined;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
          // Coerce dates and booleans to numbers, dates to milliseconds and
          // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
          // not equal.
          return +object == +other;

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case numberTag:
          // Treat `NaN` vs. `NaN` as equal.
          return object != +object ? other != +other : object == +other;

        case regexpTag:
        case stringTag$1:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == other + '';

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & PARTIAL_COMPARE_FLAG$3;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= UNORDERED_COMPARE_FLAG$2;
          stack.set(object, other);

          // Recursively compare objects (susceptible to call stack limits).
          return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

        case symbolTag$1:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /** Used to compose bitmasks for comparison styles. */
    var PARTIAL_COMPARE_FLAG$4 = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG$4,
          objProps = keys(object),
          objLength = objProps.length,
          othProps = keys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : baseHas(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      return result;
    }

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set = getNative(root, 'Set');

    /* Built-in method references that are verified to be native. */
    var WeakMap = getNative(root, 'WeakMap');

    var mapTag$1 = '[object Map]';
    var objectTag$1 = '[object Object]';
    var promiseTag = '[object Promise]';
    var setTag$1 = '[object Set]';
    var weakMapTag = '[object WeakMap]';
    var dataViewTag$1 = '[object DataView]';

    /** Used for built-in method references. */
    var objectProto$10 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$4 = objectProto$10.toString;

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map);
    var promiseCtorString = toSource(Promise);
    var setCtorString = toSource(Set);
    var weakMapCtorString = toSource(WeakMap);
    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function getTag(value) {
      return objectToString$4.call(value);
    }

    // Fallback for data views, maps, sets, and weak maps in IE 11,
    // for data views in Edge, and promises in Node.js.
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1 || Map && getTag(new Map()) != mapTag$1 || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag$1 || WeakMap && getTag(new WeakMap()) != weakMapTag) {
      getTag = function getTag(value) {
        var result = objectToString$4.call(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : undefined;

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag$1;
            case mapCtorString:
              return mapTag$1;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag$1;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    var argsTag$2 = '[object Arguments]';
    var arrayTag$1 = '[object Array]';
    var boolTag$1 = '[object Boolean]';
    var dateTag$1 = '[object Date]';
    var errorTag$1 = '[object Error]';
    var funcTag$1 = '[object Function]';
    var mapTag$2 = '[object Map]';
    var numberTag$1 = '[object Number]';
    var objectTag$2 = '[object Object]';
    var regexpTag$1 = '[object RegExp]';
    var setTag$2 = '[object Set]';
    var stringTag$2 = '[object String]';
    var weakMapTag$1 = '[object WeakMap]';
    var arrayBufferTag$1 = '[object ArrayBuffer]';
    var dataViewTag$2 = '[object DataView]';
    var float32Tag = '[object Float32Array]';
    var float64Tag = '[object Float64Array]';
    var int8Tag = '[object Int8Array]';
    var int16Tag = '[object Int16Array]';
    var int32Tag = '[object Int32Array]';
    var uint8Tag = '[object Uint8Array]';
    var uint8ClampedTag = '[object Uint8ClampedArray]';
    var uint16Tag = '[object Uint16Array]';
    var uint32Tag = '[object Uint32Array]';
    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$2] = typedArrayTags[weakMapTag$1] = false;

    /** Used for built-in method references. */
    var objectProto$11 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$5 = objectProto$11.toString;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    function isTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString$5.call(value)];
    }

    /** Used to compose bitmasks for comparison styles. */
    var PARTIAL_COMPARE_FLAG$1 = 2;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]';
    var arrayTag = '[object Array]';
    var objectTag = '[object Object]';
    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$9.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = arrayTag,
          othTag = arrayTag;

      if (!objIsArr) {
        objTag = getTag$1(object);
        objTag = objTag == argsTag$1 ? objectTag : objTag;
      }
      if (!othIsArr) {
        othTag = getTag$1(other);
        othTag = othTag == argsTag$1 ? objectTag : othTag;
      }
      var objIsObj = objTag == objectTag && !isHostObject(object),
          othIsObj = othTag == objectTag && !isHostObject(other),
          isSameTag = objTag == othTag;

      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
      }
      if (!(bitmask & PARTIAL_COMPARE_FLAG$1)) {
        var objIsWrapped = objIsObj && hasOwnProperty$5.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$5.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {boolean} [bitmask] The bitmask of comparison flags.
     *  The bitmask may be composed of the following flags:
     *     1 - Unordered comparison
     *     2 - Partial comparison
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, customizer, bitmask, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
    }

    var UNORDERED_COMPARE_FLAG = 1;
    var PARTIAL_COMPARE_FLAG = 2;
    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack();
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack) : result)) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }

    /**
     * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
     * of key-value pairs for `object` corresponding to the property names of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the key-value pairs.
     */
    function baseToPairs(object, props) {
      return arrayMap(props, function (key) {
        return [key, object[key]];
      });
    }

    /**
     * Converts `set` to its value-value pairs.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the value-value pairs.
     */
    function setToPairs(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function (value) {
        result[++index] = [value, value];
      });
      return result;
    }

    var mapTag$3 = '[object Map]';
    var setTag$3 = '[object Set]';
    /**
     * Creates a `_.toPairs` or `_.toPairsIn` function.
     *
     * @private
     * @param {Function} keysFunc The function to get the keys of a given object.
     * @returns {Function} Returns the new pairs function.
     */
    function createToPairs(keysFunc) {
      return function (object) {
        var tag = getTag$1(object);
        if (tag == mapTag$3) {
          return mapToArray(object);
        }
        if (tag == setTag$3) {
          return setToPairs(object);
        }
        return baseToPairs(object, keysFunc(object));
      };
    }

    /**
     * Creates an array of own enumerable string keyed-value pairs for `object`
     * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
     * entries are returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias entries
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the key-value pairs.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.toPairs(new Foo);
     * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
     */
    var toPairs = createToPairs(keys);

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = toPairs(object),
          length = result.length;

      while (length--) {
        result[length][2] = isStrictComparable(result[length][1]);
      }
      return result;
    }

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function (object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
      };
    }

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function (object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT$1 = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || resolver && typeof resolver != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT$1);
      }
      var memoized = function memoized() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }

    // Assign cache to `_.memoize`.
    memoize.Cache = MapCache;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined;
    var symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = value + '';
      return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoize(function (string) {
      var result = [];
      toString(string).replace(rePropName, function (match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
      });
      return result;
    });

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }

    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
      if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = value + '';
      return result == '0' && 1 / value == -INFINITY$2 ? '-0' : result;
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return index && index == length ? object : undefined;
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is used in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return key in Object(object);
    }

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = isKey(path, object) ? [path] : castPath(path);

      var result,
          index = -1,
          length = path.length;

      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result) {
        return result;
      }
      var length = object ? object.length : 0;
      return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isString(object) || isArguments(object));
    }

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    var UNORDERED_COMPARE_FLAG$3 = 1;
    var PARTIAL_COMPARE_FLAG$5 = 2;
    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function (object) {
        var objValue = get(object, path);
        return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG$3 | PARTIAL_COMPARE_FLAG$5);
      };
    }

    /**
     * This method returns the first argument given to it.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function (object) {
        return baseGet(object, path);
      };
    }

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) == 'object') {
        return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
      }
      return property(value);
    }

    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to search.
     * @param {Array|Function|Object|string} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.find(users, function(o) { return o.age < 40; });
     * // => object for 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.find(users, { 'age': 1, 'active': true });
     * // => object for 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.find(users, ['active', false]);
     * // => object for 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.find(users, 'active');
     * // => object for 'barney'
     */
    function find(collection, predicate) {
      predicate = baseIteratee(predicate, 3);
      if (isArray(collection)) {
        var index = baseFindIndex(collection, predicate);
        return index > -1 ? collection[index] : undefined;
      }
      return baseFind(collection, predicate, baseEach);
    }

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.filter` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function (value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [predicate=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.reject
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, { 'age': 36, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.filter(users, 'active');
     * // => objects for ['barney']
     */
    function filter(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, baseIteratee(predicate, 3));
    }

    /**
     * Iterates over own enumerable string keyed properties of an object and
     * invokes `iteratee` for each property. The iteratee is invoked with three
     * arguments: (value, key, object). Iteratee functions may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 0.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forOwnRight
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forOwn(object, iteratee) {
      return object && baseForOwn(object, baseIteratee(iteratee, 3));
    }

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return arrayMap(props, function (key) {
        return object[key];
      });
    }

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object ? baseValues(object, keys(object)) : [];
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax$1 = Math.max;

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.includes('pebbles', 'eb');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax$1(length + fromIndex, 0);
      }
      return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
    }

    var _listeners = Symbol("listeners");

    var EventClass = function () {
        function EventClass() {
            babelHelpers.classCallCheck(this, EventClass);

            this[_listeners] = {};
        }

        /**
         * Adds a listener for the given event
         * @param {string} event - the event to listen to
         * @param {function} listener - the callback called when the given event is emitted
         * @returns {function} - event.off(event, listener);
         */


        babelHelpers.createClass(EventClass, [{
            key: "on",
            value: function on(event, listener) {
                if (typeof this[_listeners][event] === "undefined") {
                    this[_listeners][event] = [];
                }
                this[_listeners][event].push(listener);
                return listener;
            }

            /**
             * Adds an one-shot listener for the given event
             * @param {string} event - the event to listen to
             * @param {function} listener - the callback called once when the given event is emitted
             */

        }, {
            key: "once",
            value: function once(event, listener) {
                var _this = this;

                var onceListener = function onceListener() {
                    listener();
                    _this.off(event, onceListener);
                };
                this.on(event, onceListener);
            }

            /**
             * Removes the listener for the given event, or removes all listeners for the given event if listener is undefined
             * @param {string} event
             * @param {function} [listener]
             */

        }, {
            key: "off",
            value: function off(event, listener) {
                if (typeof this[_listeners][event] !== "undefined") {
                    if (typeof listener === "undefined") {
                        this[_listeners][event] = [];
                    } else {
                        var listenerIndex = this[_listeners][event].lastIndexOf(listener);
                        if (listenerIndex !== -1) {
                            this[_listeners][event].splice(listenerIndex, 1);
                        }
                    }
                }
            }

            /**
             * Emits an event
             * @param {string} event - all listeners to this event will be notified
             * @param {...*} arguments - all listeners to this event will be notified with the given arguments
             */

        }, {
            key: "emit",
            value: function emit(event) {
                var listeners = this[_listeners][event];
                if (typeof listeners !== "undefined") {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].apply(this, Array.prototype.slice.call(arguments, 1));
                    }
                }
            }
        }]);
        return EventClass;
    }();

    /** `Object#toString` result references. */
    var numberTag$2 = '[object Number]';

    /** Used for built-in method references. */
    var objectProto$12 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$6 = objectProto$12.toString;

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
     * classified as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isNumber(3);
     * // => true
     *
     * _.isNumber(Number.MIN_VALUE);
     * // => true
     *
     * _.isNumber(Infinity);
     * // => true
     *
     * _.isNumber('3');
     * // => false
     */
    function isNumber(value) {
      return typeof value == 'number' || isObjectLike(value) && objectToString$6.call(value) == numberTag$2;
    }

    /** `Object#toString` result references. */
    var boolTag$2 = '[object Boolean]';

    /** Used for built-in method references. */
    var objectProto$13 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$7 = objectProto$13.toString;

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isBoolean(false);
     * // => true
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false || isObjectLike(value) && objectToString$7.call(value) == boolTag$2;
    }

    var valueTypes = {
        "Stream": {
            "convert": function convert() {
                return undefined;
            },
            "typeCompatibles": []
        },
        "String": {
            "typeConvert": function typeConvert(value) {
                if (isString(value)) {
                    return value;
                }
                if (isNumber(value) || isBoolean(value)) {
                    return toString(value);
                }
                return undefined;
            },
            "typeCompatibles": ["Text", "Number", "Boolean"]
        },
        "Text": {
            "typeConvert": function typeConvert(value) {
                if (isString(value)) {
                    return value;
                }
                if (isNumber(value) || isBoolean(value)) {
                    return toString(value);
                }
                return undefined;
            },
            "typeCompatibles": ["String", "Number", "Boolean"]
        },
        "Number": {
            "typeConvert": function typeConvert(value) {
                if (isNumber(value)) {
                    return value;
                }
                if (/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value)) {
                    return toNumber(value);
                }
                if (value === "true" || value === true) {
                    return 1;
                }
                if (value === "false" || value === false) {
                    return 0;
                }
                return undefined;
            },
            "typeCompatibles": ["Boolean"]
        },
        "Boolean": {
            "typeConvert": function typeConvert(value) {
                if (isBoolean(value)) {
                    return value;
                }
                if (value === 1 || value === "true") {
                    return true;
                }
                if (value === 0 || value === "false") {
                    return false;
                }
                return undefined;
            },
            "typeCompatibles": ["Number"]
        },
        "Object": {
            "typeConvert": function typeConvert(value) {
                if (isObject(value)) {
                    return value;
                }
                return undefined;
            },
            "typeCompatibles": []
        },
        "Array": {
            "typeConvert": function typeConvert(value) {
                if (isArray(value)) {
                    return value;
                }
                return undefined;
            },
            "typeCompatibles": []
        },
        "Resource": {
            "typeConvert": function typeConvert(value) {
                if (isObject(value)) {
                    return value;
                }
                return undefined;
            },
            "typeCompatibles": []
        }
    };

    var _connectionOutputPoint = Symbol("outputPoint");
    var _connectionInputPoint = Symbol("inputPoint");

    var Connection = function (_EventClass) {
        babelHelpers.inherits(Connection, _EventClass);


        /**
         * Creates a connection between the two specified points
         * @param {Point} outputPoint - specifies the output point
         * @param {Point} inputPoint - specifies the input point
         */

        function Connection(outputPoint, inputPoint) {
            babelHelpers.classCallCheck(this, Connection);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Connection).call(this));

            _this[_connectionOutputPoint] = outputPoint;
            _this[_connectionInputPoint] = inputPoint;
            return _this;
        }

        /**
         * Returns this connection fancy name
         * @returns {string}
         */


        babelHelpers.createClass(Connection, [{
            key: "other",


            /**
             * Returns the corresponding point connected to the specified point
             * @param {Point} point - specifies the point
             * @returns {Point}
             */
            value: function other(point) {
                if (point === this[_connectionOutputPoint]) {
                    return this[_connectionInputPoint];
                }
                if (point === this[_connectionInputPoint]) {
                    return this[_connectionOutputPoint];
                }
                throw new Error(this.fancyName);
            }
        }, {
            key: "fancyName",
            get: function get() {
                return this[_connectionOutputPoint].fancyName + " => " + this[_connectionInputPoint].fancyName;
            }
            /**
             * Returns this connection output point
             * @returns {Point}
             */

        }, {
            key: "connectionOutputPoint",
            get: function get() {
                return this[_connectionOutputPoint];
            }
            /**
             * Returns this connection input point
             * @returns {Point}
             */

        }, {
            key: "connectionInputPoint",
            get: function get() {
                return this[_connectionInputPoint];
            }
        }]);
        return Connection;
    }(EventClass);

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _([1, 2]).forEach(function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, baseIteratee(iteratee, 3));
    }

    var PolicyLabels = {
        "VALUE": 1,
        "SINGLE_CONNECTION": 2,
        "MULTIPLE_CONNECTIONS": 4,
        "CONVERSION": 8
    };

    var PointPolicy = function () {
        function PointPolicy() {
            babelHelpers.classCallCheck(this, PointPolicy);
        }

        babelHelpers.createClass(PointPolicy, null, [{
            key: "serialize",


            /**
             * Serializes the specified policy to the corresponding policy labels
             * @param {number} policy - specifies the policy
             * @returns {Array<string>}
             */
            value: function serialize(policy) {
                var labels = [];
                forOwn(PolicyLabels, function (policyLabelValue, policyLabel) {
                    if ((policyLabelValue & policy) !== 0) {
                        labels.push(policyLabel);
                    }
                });
                return labels;
            }

            /**
             * Deserializes the specified policy labels to the corresponding policy
             * @param {Array<string>} policyLabels - specifies the policy labels
             * @returns {number}
             */

        }, {
            key: "deserialize",
            value: function deserialize(policyLabels) {
                var policy = 0;
                forEach(policyLabels, function (policyLabel) {
                    var labelPolicyValue = PolicyLabels[policyLabel];
                    if (typeof labelPolicyValue === "undefined") {
                        throw new Error("`" + policyLabel + "` is not a valid point policy");
                    }
                    policy |= labelPolicyValue;
                });
                return policy;
            }

            /**
             * Returns whether the specified policy corresponds to the specified check policy
             * @param {number} policy - specifies the policy
             * @param {number} checkPolicy - specifies the check policy
             * @returns {boolean}
             */

        }, {
            key: "has",
            value: function has(policy, checkPolicy) {
                return (policy & checkPolicy) !== 0;
            }
        }, {
            key: "NONE",


            /**
             * @returns {number}
             */
            get: function get() {
                return 0;
            }
            /**
             * @returns {number}
             */

        }, {
            key: "VALUE",
            get: function get() {
                return PolicyLabels.VALUE;
            }
            /**
             * @returns {number}
             */

        }, {
            key: "SINGLE_CONNECTION",
            get: function get() {
                return PolicyLabels.SINGLE_CONNECTION;
            }
            /**
             * @returns {number}
             */

        }, {
            key: "MULTIPLE_CONNECTIONS",
            get: function get() {
                return PolicyLabels.MULTIPLE_CONNECTIONS;
            }
            /**
             * @returns {number}
             */

        }, {
            key: "CONVERSION",
            get: function get() {
                return PolicyLabels.CONVERSION;
            }
            /**
             * @returns {number}
             */

        }, {
            key: "DEFAULT",
            get: function get() {
                return PointPolicy.VALUE | PointPolicy.SINGLE_CONNECTION | PointPolicy.CONVERSION;
            }
        }]);
        return PointPolicy;
    }();

    var _graphErrno = Symbol("graphErrno");
    var _graphBlocks = Symbol("graphBlocks");
    var _graphBlockIds = Symbol("graphBlockIds");
    var _graphVariables = Symbol("graphVariables");
    var _graphValueTypes = Symbol("graphValueTypes");
    var _graphConnections = Symbol("graphConnections");

    var Graph = function (_EventClass) {
        babelHelpers.inherits(Graph, _EventClass);

        function Graph() {
            babelHelpers.classCallCheck(this, Graph);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Graph).call(this));

            _this[_graphErrno] = null;
            _this[_graphBlocks] = [];
            _this[_graphBlockIds] = {};
            _this[_graphVariables] = [];
            _this[_graphValueTypes] = {};
            _this[_graphConnections] = [];

            _this.create();
            return _this;
        }

        babelHelpers.createClass(Graph, [{
            key: "create",
            value: function create() {
                this[_graphValueTypes] = valueTypes;
            }

            /**
             * Returns this graph fancy name
             * @returns {string}
             */

        }, {
            key: "addBlock",


            /**
             * Adds the specified block to this graph
             * @param {Block} block - the block to add
             */
            value: function addBlock(block) {
                if (block.blockGraph !== null) {
                    throw new Error("`" + block.fancyName + "` cannot redefine `blockGraph`");
                }
                if (block.blockId !== null && typeof this[_graphBlockIds][block.blockId] === "undefined") {
                    throw new Error("`" + this.fancyName + "` cannot redefine id `" + block.blockId + "`");
                }
                block.blockGraph = this;
                if (block.blockId === null) {
                    block.blockId = this.nextBlockId();
                }
                forOwn(block.blockTemplates, function (template, templateId) {
                    block.changeTemplate(templateId, template.valueType, true);
                });
                this[_graphBlocks].push(block);
                this[_graphBlockIds][block.blockId] = block;
                this.emit("block-add", block);
                block.added();
            }
            /**
             * Removes the specified block from this graph
             * @param {Block} block - the block to remove
             */

        }, {
            key: "removeBlock",
            value: function removeBlock(block) {
                if (block.blockGraph !== this || !includes(this[_graphBlocks], block)) {
                    throw new Error("`" + this.fancyName + "` has no block `" + block.fancyName + "`");
                }
                block.removePoints();
                pull(this[_graphBlocks], block);
                delete this[_graphBlockIds][block.blockId];
                this.emit("block-remove", block);
                block.removed();
            }
            /**
             * Returns the next unique block id
             * @returns {string}
             */

        }, {
            key: "nextBlockId",
            value: function nextBlockId() {
                return Math.random() * 9999 + this;
            }
            /**
             * Returns the block corresponding to the specified block id
             * @param {string} blockId - specifies the block id
             * @returns {Block|null}
             */

        }, {
            key: "blockById",
            value: function blockById(blockId) {
                return this[_graphBlockIds][blockId] || null;
            }
            /**
             * Returns the blocks corresponding to the specified block name
             * @param {string} blockName - specifies the block name
             * @returns {Array<Block>}
             */

        }, {
            key: "blocksByName",
            value: function blocksByName(blockName) {
                return filter(this[_graphBlocks], function (block) {
                    return block.blockName === blockName;
                });
            }
            /**
             * Returns the blocks corresponding to the specified block type
             * @param {string} blockType - specifies the block type
             * @returns {Array<Block>}
             */

        }, {
            key: "blocksByType",
            value: function blocksByType(blockType) {
                return filter(this[_graphBlocks], function (block) {
                    return block.blockType === blockType || block instanceof blockType;
                });
            }

            /**
             * Adds the specified variable to this graph
             * @param {Variable} variable - specifies the variable
             */

        }, {
            key: "addVariable",
            value: function addVariable(variable) {
                if (variable.variableGraph !== null) {
                    throw new Error("`" + variable.fancyName + "` cannot redefine `variableGraph`");
                }
                if (this.variableByName(variable.variableName) !== null) {
                    throw new Error("`" + this.fancyName + "` cannot redefine variable name `" + variable.variableName + "`");
                }
                variable.variableGraph = this;
                variable.added();
                this[_graphVariables].push(variable);
                this.emit("variable-add", variable);
            }
            /**
             * Removes the specified variable from this graph
             * @param {Variable} variable - specifies the variable
             */

        }, {
            key: "removeVariable",
            value: function removeVariable(variable) {
                if (variable.variableGraph !== this || this.variableByName(variable.variableName) === null) {
                    throw new Error("`" + this.fancyName + "` has no variable `" + variable.fancyName + "`");
                }
                if (variable.variableBlock !== null) {
                    this.removeBlock(variable.variableBlock);
                }
                pull(this[_graphVariables], variable);
                this.emit("variable-remove", variable);
            }
            /**
             * Returns the variable corresponding to the specified variable name
             * @param {string} variableName - specifies the variable name
             * @returns {Variable|null}
             */

        }, {
            key: "variableByName",
            value: function variableByName(variableName) {
                return find(this[_graphVariables], function (variable) {
                    return variable.variableName === variableName;
                }) || null;
            }

            /**
             * Converts the specified value to the corresponding value type
             * @param {Graph.valueTypeTypedef} valueType - specifies the value type
             * @param {*|null} value - specifies the value
             * @returns {*|undefined} - returns undefined on failure
             */

        }, {
            key: "convertValue",
            value: function convertValue(valueType, value) {
                if (value === null) {
                    return null;
                }
                var valueTypeInfo = this.valueTypeByName(valueType);
                if (valueTypeInfo === null) {
                    throw new Error("`" + this.fancyName + "` has no valueType `" + valueType + "`");
                }
                if (typeof valueTypeInfo.typeConvert === "undefined") {
                    throw new Error("`" + this.fancyName + "` has no valueType `" + valueType + "` converter");
                }
                return valueTypeInfo.typeConvert(value);
            }
            /**
             * Returns whether the connection can be converted from the specified output point to the specified input point
             * @param {Point|Graph.modelPointTypedef} outputPoint - specifies the output point
             * @param {Point|Graph.modelPointTypedef} inputPoint - specifies the input point
             * @returns {boolean}
             */

        }, {
            key: "convertConnection",
            value: function convertConnection(outputPoint, inputPoint) {
                var inputValueType = this.valueTypeByName(inputPoint.pointValueType);

                if (inputValueType === null) {
                    throw new Error("`" + this.fancyName + "` cannot find compatible type to convert connection from `" + outputPoint.pointValueType + "` to `" + inputPoint.pointValueType + "`");
                }

                if (typeof outputPoint.pointOutput !== "undefined" && !outputPoint.pointOutput) {
                    this.errno(Error("`" + outputPoint.fancyName + "` is not an output"));
                    return false;
                }
                if (typeof inputPoint.pointOutput !== "undefined" && inputPoint.pointOutput) {
                    this.errno(Error("`" + inputPoint.fancyName + "` is not an input"));
                    return false;
                }

                if (typeof outputPoint.pointValue !== "undefined" && outputPoint.pointValue !== null) {
                    this.errno(new Error("`" + outputPoint.fancyName + "` have a non-null `pointValue` and cannot be connected"));
                    return false;
                }
                if (typeof inputPoint.pointValue !== "undefined" && inputPoint.pointValue !== null) {
                    this.errno(new Error("`" + inputPoint.fancyName + "` have a non-null `pointValue` and cannot be connected"));
                    return false;
                }

                if (typeof outputPoint.hasPolicy !== "undefined" && outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.emptyConnection()) {
                    this.errno(new Error("`" + outputPoint.fancyName + "` cannot have multiple connections"));
                    return false;
                }
                if (typeof inputPoint.hasPolicy !== "undefined" && inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.emptyConnection()) {
                    this.errno(new Error("`" + inputPoint.fancyName + "` cannot have multiple connections"));
                    return false;
                }

                if (typeof outputPoint.hasPolicy !== "undefined" && !outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !outputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
                    this.errno(new Error("`" + outputPoint.fancyName + "` cannot have connections"));
                    return false;
                }
                if (typeof inputPoint.hasPolicy !== "undefined" && !inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION) && !inputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
                    this.errno(new Error("`" + inputPoint.fancyName + "` cannot have connections"));
                    return false;
                }

                if (outputPoint.pointValueType === inputPoint.pointValueType) {
                    return true;
                }

                if (typeof outputPoint.hasPolicy !== "undefined" && !outputPoint.hasPolicy(PointPolicy.CONVERSION)) {
                    this.errno(new Error("`" + outputPoint.fancyName + "` cannot be converted"));
                    return false;
                }
                if (typeof inputPoint.hasPolicy !== "undefined" && !inputPoint.hasPolicy(PointPolicy.CONVERSION)) {
                    this.errno(new Error("`" + inputPoint.fancyName + "` cannot be converted"));
                    return false;
                }

                if (!includes(inputValueType.typeCompatibles, outputPoint.pointValueType)) {
                    this.errno(new Error("`" + inputPoint.pointValueType + "` is not compatible with `" + outputPoint.pointValueType + "`"));
                    return false;
                }

                var previousErrno = this[_graphErrno];
                if (typeof outputPoint.acceptConnect !== "undefined" && !outputPoint.acceptConnect(inputPoint)) {
                    if (this[_graphErrno] !== null && this[_graphErrno] !== previousErrno) {
                        this.errno(new Error("`" + outputPoint.fancyName + "` cannot accept to connect to `" + inputPoint.fancyName + "`: " + this[_graphErrno].message));
                    } else {
                        this.errno(new Error("`" + outputPoint.fancyName + "` cannot accept to connect to `" + inputPoint.fancyName + "`"));
                    }
                    return false;
                }
                previousErrno = this[_graphErrno];
                if (typeof inputPoint.acceptConnect !== "undefined" && !inputPoint.acceptConnect(outputPoint)) {
                    if (this[_graphErrno] !== null && this[_graphErrno] !== previousErrno) {
                        this.errno(new Error("`" + outputPoint.fancyName + "` cannot accept to connect to `" + inputPoint.fancyName + "`: " + this[_graphErrno].message));
                    } else {
                        this.errno(new Error("`" + outputPoint.fancyName + "` cannot accept to connect to `" + inputPoint.fancyName + "`"));
                    }
                    return false;
                }

                return true;
            }

            /**
             * Connects the specified points
             * @param {Point} outputPoint - specifies the output point
             * @param {Point} inputPoint - specifies the input point
             * @returns {Connection}
             */

        }, {
            key: "connect",
            value: function connect(outputPoint, inputPoint) {
                if (outputPoint.pointBlock === null) {
                    throw new Error("`" + outputPoint.fancyName + "` cannot connect to another point when not bound to a block");
                }
                if (inputPoint.pointBlock === null) {
                    throw new Error("`" + inputPoint.fancyName + "` cannot connect to another point when not bound to a block");
                }
                if (outputPoint === inputPoint) {
                    throw new Error("`" + this.fancyName + "` cannot connect `" + outputPoint.fancyName + "` to itself");
                }
                if (!outputPoint.pointOutput) {
                    throw new Error("`" + outputPoint.fancyName + "` is not an output");
                }
                if (inputPoint.pointOutput) {
                    throw new Error("`" + outputPoint.fancyName + "` is not an input");
                }
                if (!this.convertConnection(outputPoint, inputPoint)) {
                    var connectionError = this[_graphErrno] || {};
                    if (outputPoint.pointTemplate !== null || inputPoint.pointTemplate !== null) {
                        try {
                            outputPoint.pointBlock.changeTemplate(outputPoint.pointTemplate, inputPoint.pointValueType);
                        } catch (ex) {
                            if (inputPoint.pointTemplate !== null) {
                                inputPoint.pointBlock.changeTemplate(inputPoint.pointTemplate, outputPoint.pointValueType);
                            }
                        }
                    } else {
                        throw new Error("`" + this.fancyName + "` cannot connect `" + outputPoint.fancyName + "` to `" + inputPoint.fancyName + ": " + connectionError.message);
                    }
                }
                var connectionFound = find(this[_graphConnections], function (connection) {
                    return connection.connectionOutputPoint === outputPoint && connection.connectionInputPoint === inputPoint;
                }) || null;
                if (connectionFound !== null) {
                    throw new Error("`" + connectionFound.fancyName + "` already exists");
                }
                var connection = new Connection(outputPoint, inputPoint);
                if (!outputPoint.pointBlock.acceptConnect(outputPoint, inputPoint)) {
                    throw new Error(this[_graphErrno]);
                }
                if (!inputPoint.pointBlock.acceptConnect(inputPoint, outputPoint)) {
                    throw new Error(this[_graphErrno]);
                }
                this._addConnection(connection);
                outputPoint.pointBlock.pointConnected(outputPoint, inputPoint);
                inputPoint.pointBlock.pointConnected(inputPoint, outputPoint);
                outputPoint.emit("connect", connection);
                inputPoint.emit("connect", connection);
                this.emit("point-connect", outputPoint, connection);
                this.emit("point-connect", inputPoint, connection);
                return connection;
            }
            /**
             * Disconnects the specified points
             * @param {Point} outputPoint - specifies the output point
             * @param {Point} inputPoint - specifies the input point
             * @returns {Connection}
             */

        }, {
            key: "disconnect",
            value: function disconnect(outputPoint, inputPoint) {
                if (outputPoint.pointBlock === null) {
                    throw new Error("`" + outputPoint.fancyName + "` cannot disconnect from another point when not bound to a block");
                }
                if (inputPoint.pointBlock === null) {
                    throw new Error("`" + inputPoint.fancyName + "` cannot disconnect from another point when not bound to a block");
                }
                var connectionFound = find(this[_graphConnections], function (connection) {
                    return connection.connectionOutputPoint === outputPoint && connection.connectionInputPoint === inputPoint;
                }) || null;
                if (connectionFound === null) {
                    throw new Error("`" + this.fancyName + "` cannot find a connection between `" + outputPoint.fancyName + "` and `" + inputPoint.fancyName + "`");
                }
                this._removeConnection(connectionFound);
                outputPoint.pointBlock.pointDisconnected(outputPoint, inputPoint);
                inputPoint.pointBlock.pointDisconnected(inputPoint, outputPoint);
                outputPoint.emit("disconnect", connectionFound);
                inputPoint.emit("disconnect", connectionFound);
                this.emit("point-disconnect", outputPoint, connectionFound);
                this.emit("point-disconnect", inputPoint, connectionFound);
                return connectionFound;
            }
            /**
             * Adds the specified connection
             * @param {Connection} connection - specifies the connection
             * @private
             */

        }, {
            key: "_addConnection",
            value: function _addConnection(connection) {
                var outputPoint = connection.connectionOutputPoint;
                var inputPoint = connection.connectionInputPoint;
                if (includes(outputPoint.pointConnections, connection)) {
                    throw new Error("`" + outputPoint.fancyName + "` cannot redefine `" + connection.fancyName + "`");
                }
                if (includes(inputPoint.pointConnections, connection)) {
                    throw new Error("`" + inputPoint.fancyName + "` cannot redefine `" + connection.fancyName + "`");
                }
                outputPoint.pointConnections.push(connection);
                inputPoint.pointConnections.push(connection);
                this[_graphConnections].push(connection);
            }
            /**
             * Removes the specified connection
             * @param {Connection} connection - specifies the connection
             * @private
             */

        }, {
            key: "_removeConnection",
            value: function _removeConnection(connection) {
                var outputPoint = connection.connectionOutputPoint;
                var inputPoint = connection.connectionInputPoint;
                if (!includes(outputPoint.pointConnections, connection)) {
                    throw new Error("`" + outputPoint.fancyName + "` has no connection `" + connection.fancyName + "`");
                }
                if (!includes(inputPoint.pointConnections, connection)) {
                    throw new Error("`" + inputPoint.fancyName + "` has no connection `" + connection.fancyName + "`");
                }
                pull(connection.connectionOutputPoint.pointConnections, connection);
                pull(connection.connectionInputPoint.pointConnections, connection);
                pull(this[_graphConnections], connection);
            }

            /**
             * Adds the specified value type to this graph
             * @param {Graph.valueTypeInfoTypedef} valueTypeInfo - specifies the value type
             */

        }, {
            key: "addValueType",
            value: function addValueType(valueTypeInfo) {
                if (this.valueTypeByName(valueTypeInfo.typeName) !== null) {
                    throw new Error("`" + this.fancyName + "` cannot redefine value type`" + valueTypeInfo.typeName + "`");
                }
                this[_graphValueTypes][valueTypeInfo.typeName] = valueTypeInfo;
            }
            /**
             * Returns the value type corresponding to the specified value type name
             * @param {Graph.valueTypeTypedef} typeName - specifies the value type name
             * @returns {Graph.valueTypeInfoTypedef|null}
             */

        }, {
            key: "valueTypeByName",
            value: function valueTypeByName(typeName) {
                return this[_graphValueTypes][typeName] || null;
            }

            /**
             * Sets the last error
             * @param {Error} errno - specifies the last error
             */

        }, {
            key: "errno",
            value: function errno(_errno) {
                this[_graphErrno] = _errno;
            }
        }, {
            key: "fancyName",
            get: function get() {
                return "graph (" + this[_graphBlocks].length + " blocks)";
            }
            /**
             * Returns this graph blocks
             * @returns {Array<Block>}
             */

        }, {
            key: "graphBlocks",
            get: function get() {
                return this[_graphBlocks];
            }
            /**
             * Returns this graph variables
             * @returns {Array<Variable>}
             */

        }, {
            key: "graphVariables",
            get: function get() {
                return this[_graphVariables];
            }
            /**
             * Returns this graph connections
             * @returns {Array<Connection>}
             */

        }, {
            key: "graphConnections",
            get: function get() {
                return this[_graphConnections];
            }
        }]);
        return Graph;
    }(EventClass);

    /**
     * Returns the given value or the given defaultValue if value is undefined
     * @param {*|undefined} value - the value returned if not undefined
     * @param {*} [defaultValue=value] - the value returned if value is undefined
     * @returns {*}
     */
    var defaultValue = function defaultValue(value, _defaultValue) {
        if (typeof value === "undefined") {
            return _defaultValue;
        }
        return value;
    };

    /**
     * The base implementation of `_.map` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function (value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in `collection` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [iteratee=_.identity]
     *  The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * _.map([4, 8], square);
     * // => [16, 64]
     *
     * _.map({ 'a': 4, 'b': 8 }, square);
     * // => [16, 64] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee) {
      var func = isArray(collection) ? arrayMap : baseMap;
      return func(collection, baseIteratee(iteratee, 3));
    }

    /**
     * A specialized version of `_.forEachRight` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEachRight(array, iteratee) {
      var length = array.length;

      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * This function is like `baseFor` except that it iterates over properties
     * in the opposite order.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseForRight = createBaseFor(true);

    /**
     * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwnRight(object, iteratee) {
      return object && baseForRight(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.forEachRight` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEachRight = createBaseEach(baseForOwnRight, true);

    /**
     * This method is like `_.forEach` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @alias eachRight
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEach
     * @example
     *
     * _.forEachRight([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `2` then `1`.
     */
    function forEachRight(collection, iteratee) {
      var func = isArray(collection) ? arrayEachRight : baseEachRight;
      return func(collection, baseIteratee(iteratee, 3));
    }

    var _blockId = Symbol("blockId");
    var _blockName = Symbol("blockName");
    var _blockInputs = Symbol("blockInputs");
    var _blockOutputs = Symbol("blockOutputs");
    var _blockTemplates = Symbol("blockTemplate");
    var _blockGraph = Symbol("blockGraph");

    var Block = function (_EventClass) {
        babelHelpers.inherits(Block, _EventClass);


        /**
         * @param {Block.blockDataTypedef} blockData - the block configuration data
         */

        function Block(blockData) {
            babelHelpers.classCallCheck(this, Block);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Block).call(this));

            _this[_blockId] = null;
            _this[_blockName] = null;
            _this[_blockOutputs] = [];
            _this[_blockInputs] = [];
            _this[_blockTemplates] = null;
            _this[_blockGraph] = null;
            _this.create(blockData || {});
            return _this;
        }

        /**
         * Creates the block corresponding to the specified block data
         * @param {Block.blockDataTypedef} blockData - specifies the block data
         */


        babelHelpers.createClass(Block, [{
            key: "create",
            value: function create(blockData) {
                this[_blockId] = defaultValue(blockData.blockId, null);
                this[_blockName] = defaultValue(blockData.blockName, this.blockType);
                this[_blockTemplates] = defaultValue(blockData.blockTemplates, {});
            }

            /**
             * Returns this block fancy name
             * @returns {string}
             */

        }, {
            key: "added",
            value: function added() {}
        }, {
            key: "pointAdded",
            value: function pointAdded() {}
        }, {
            key: "pointConnected",
            value: function pointConnected() {}
        }, {
            key: "pointValueChanged",
            value: function pointValueChanged() {}
        }, {
            key: "pointDisconnected",
            value: function pointDisconnected() {}
        }, {
            key: "pointRemoved",
            value: function pointRemoved() {}
        }, {
            key: "removed",
            value: function removed() {}

            /**
             * Called when the static points are created
             */

        }, {
            key: "validatePoints",
            value: function validatePoints() {}

            /**
             * Changes this template value type corresponding to the specified template name to the specified value type
             * @param {string} templateName - specifies the template name
             * @param {string} valueType - specifies the value type
             * @param {boolean} [ignoreEmit=false] - whether to emit events
             */

        }, {
            key: "changeTemplate",
            value: function changeTemplate(templateName, valueType, ignoreEmit) {
                if (this[_blockGraph] === null) {
                    throw new Error("`" + this.fancyName + "` cannot manipulate templates when not bound to a graph");
                }
                if (this[_blockGraph].valueTypeByName(valueType) === null) {
                    throw new Error("`" + this.fancyName + "` has no value type `" + valueType + "`");
                }
                var template = this.templateByName(templateName);
                if (template === null) {
                    throw new Error("`" + this.fancyName + "` has no template `" + templateName + "`");
                }
                if (!includes(template.templates, valueType)) {
                    throw new Error("`" + this.fancyName + "` has no value type `" + valueType + "` is its templates: ` " + template.templates.join(", ") + "`");
                }
                if (template.valueType === valueType) {
                    return; // Already the same type
                }
                var oldValueType = template.valueType;
                var outputValueSaves = map(this[_blockOutputs], function (point) {
                    if (point.pointTemplate === templateName) {
                        return point.pointValue;
                    }
                    return undefined;
                });
                var inputValueSaves = map(this[_blockInputs], function (point) {
                    if (point.pointTemplate === templateName) {
                        return point.pointValue;
                    }
                    return undefined;
                });
                try {
                    forEach(this[_blockOutputs], function (point) {
                        if (point.pointTemplate === templateName) {
                            point.changeValueType(valueType, ignoreEmit);
                        }
                    });
                    forEach(this[_blockInputs], function (point) {
                        if (point.pointTemplate === templateName) {
                            point.changeValueType(valueType, ignoreEmit);
                        }
                    });
                } catch (exception) {
                    forEach(this[_blockOutputs], function (point, i) {
                        if (point.pointTemplate === templateName) {
                            point.changeVariableValue(null);
                            point.changeValueType(oldValueType, true);
                            point.changeVariableValue(outputValueSaves[i]);
                        }
                    });
                    forEach(this[_blockInputs], function (point, i) {
                        if (point.pointTemplate === templateName) {
                            point.changeVariableValue(null);
                            point.changeValueType(oldValueType, true);
                            point.changeVariableValue(inputValueSaves[i]);
                        }
                    });
                    throw exception;
                }
                template.valueType = valueType;
                if (!ignoreEmit) {
                    this[_blockGraph].emit("block-template-update", this, templateName, template.valueType, oldValueType);
                    this.emit("template-update", templateName, template.valueType, oldValueType);
                }
            }
            /**
             * Returns the template corresponding to the specified template name
             * @param {string} templateName - specifies the template name
             * @returns {Graph.templateTypedef|null}
             */

        }, {
            key: "templateByName",
            value: function templateByName(templateName) {
                if (this[_blockGraph] === null) {
                    throw new Error("`" + this.fancyName + "` cannot manipulate templates when not bound to a graph");
                }
                return this[_blockTemplates][templateName] || null;
            }

            /**
             * Adds the specified point to this block
             * @param {Point} point - specifies the point
             * @param {number} [position] - the position of the point in the block
             */

        }, {
            key: "addPoint",
            value: function addPoint(point, position) {
                if (this[_blockGraph] === null) {
                    throw new Error("`" + this.fancyName + "` cannot add point when not bound to a graph");
                }
                if (point.pointOutput && this.outputByName(point.pointName) !== null) {
                    throw new Error("`" + this.fancyName + "` cannot redefine `" + point.pointName + "`");
                }
                if (!point.pointOutput && this.inputByName(point.pointName) !== null) {
                    throw new Error("`" + this.fancyName + "` cannot redefine `" + point.pointName + "`");
                }
                point.pointBlock = this;
                try {
                    if (point.pointTemplate === null) {
                        point.changeValueType(point.pointValueType, true);
                    } else {
                        var template = this.templateByName(point.pointTemplate);
                        if (template === null) {
                            //noinspection ExceptionCaughtLocallyJS
                            throw new Error("`" + this.fancyName + "` has no template `" + point.pointTemplate + "`");
                        }
                        point.changeValueType(template.valueType, true);
                    }
                    point.changeValue(point.pointValue, true);
                } catch (ex) {
                    point.pointBlock = null;
                    throw ex;
                }
                point.added();
                if (typeof position === "undefined") {
                    position = point.pointOutput ? this[_blockOutputs].length : this[_blockInputs].length;
                }
                if (point.pointOutput) {
                    this[_blockOutputs].splice(position, 0, point);
                } else {
                    this[_blockInputs].splice(position, 0, point);
                }
                this.emit("point-add", point);
                this[_blockGraph].emit("block-point-add", this, point);
            }
            /**
             * Removes the specified point from this block
             * @param {Point} point - specifies the point
             */

        }, {
            key: "removePoint",
            value: function removePoint(point) {
                if (point.pointOutput && this.outputByName(point.pointName) === null) {
                    throw new Error("`" + this.fancyName + "` has not output `" + point.pointName + "`");
                }
                if (!point.pointOutput && this.inputByName(point.pointName) === null) {
                    throw new Error("`" + this.fancyName + "` has no input `" + point.pointName + "`");
                }
                point.disconnectAll();
                point.removed();
                point.pointBlock = null;
                if (point.pointOutput) {
                    pull(this[_blockOutputs], point);
                } else {
                    pull(this[_blockInputs], point);
                }
                this.emit("point-remove", point);
                this[_blockGraph].emit("block-point-remove", this, point);
            }
            /**
             * Removes all block points
             */

        }, {
            key: "removePoints",
            value: function removePoints() {
                var block = this;
                forEachRight(this[_blockOutputs], function (point) {
                    block.removePoint(point);
                });
                forEachRight(this[_blockInputs], function (point) {
                    block.removePoint(point);
                });
            }
            /**
             * Returns the corresponding output point for the specified point name
             * @param {string} pointName - specifies the point name
             * @returns {Point}
             */

        }, {
            key: "outputByName",
            value: function outputByName(pointName) {
                return find(this[_blockOutputs], function (point) {
                    return point.pointName === pointName;
                }) || null;
            }
            /**
             * Returns the corresponding input point for the specified point name
             * @param {string} pointName - specifies the point name
             * @returns {Point}
             */

        }, {
            key: "inputByName",
            value: function inputByName(pointName) {
                return find(this[_blockInputs], function (point) {
                    return point.pointName === pointName;
                }) || null;
            }

            /**
             * Returns whether this block allows the connection between the specified block point and the other point
             * @param {Point} blockPoint - specifies this block point
             * @param {Point} otherPoint - specifies the other point
             * @returns {boolean}
             */

        }, {
            key: "acceptConnect",
            value: function acceptConnect(blockPoint, otherPoint) {
                if (blockPoint.pointBlock !== this) {
                    throw new Error("`" + this.fancyName + "` has no `" + blockPoint.pointName + "`");
                }
                return otherPoint === otherPoint;
            }
        }, {
            key: "fancyName",
            get: function get() {
                return this[_blockName];
            }
            /**
             * Returns this block type
             * @returns {string}
             */

        }, {
            key: "blockType",
            get: function get() {
                return this.constructor.name;
            }
            /**
             * Returns this block id
             * @returns {string|null}
             */

        }, {
            key: "blockId",
            get: function get() {
                return this[_blockId];
            }
            /**
             * Sets this block id
             * @param {string|null} blockId - the block id to set
             */
            ,
            set: function set(blockId) {
                this[_blockId] = blockId;
            }
            /**
             * Returns this block name
             * @returns {string}
             */

        }, {
            key: "blockName",
            get: function get() {
                return this[_blockName];
            }
            /**
             * Returns this block output points
             * @returns {Array<Point>}
             */

        }, {
            key: "blockOutputs",
            get: function get() {
                return this[_blockOutputs];
            }
            /**
             * Returns this block input points
             * @returns {Array<Point>}
             */

        }, {
            key: "blockInputs",
            get: function get() {
                return this[_blockInputs];
            }
            /**
             * Returns this block templates
             * @returns {Object<string, Block.templateTypedef>}
             */

        }, {
            key: "blockTemplates",
            get: function get() {
                return this[_blockTemplates];
            }
            /**
             * Returns this block graph
             * @returns {Graph|null}
             */

        }, {
            key: "blockGraph",
            get: function get() {
                return this[_blockGraph];
            }
            /**
             * Sets this block graph to the specified block graph
             * @param {Graph|null} blockGraph - specifies the block graph
             */
            ,
            set: function set(blockGraph) {
                this[_blockGraph] = blockGraph;
            }
        }]);
        return Block;
    }(EventClass);

    var _graphVariable = Symbol("_graphVariable");

    var VariableBlock = function (_Block) {
        babelHelpers.inherits(VariableBlock, _Block);


        /**
         * @param {Block.blockDataTypedef} blockData - the block configuration data
         */

        function VariableBlock(blockData) {
            babelHelpers.classCallCheck(this, VariableBlock);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(VariableBlock).call(this, blockData));

            _this[_graphVariable] = null;
            return _this;
        }

        /**
         * Called when the block is added to the graph
         * @override
         */


        babelHelpers.createClass(VariableBlock, [{
            key: "added",
            value: function added() {
                this[_graphVariable] = this.blockGraph.variableByName(this.blockName);
                if (this[_graphVariable] === null) {
                    this.blockGraph.removeBlock(this);
                    throw new Error("VariableBlock `" + this.fancyName + "` must be linked to a graph variable");
                }
                if (this[_graphVariable].variableBlock !== null && this[_graphVariable].variableBlock !== this) {
                    this.blockGraph.removeBlock(this);
                    throw new Error("`" + this[_graphVariable].fancyName + "` cannot redefine variableBlock");
                }
                this[_graphVariable].variableBlock = this;
            }

            /**
             * Called when the block is removed from the graph
             * @override
             */

        }, {
            key: "removed",
            value: function removed() {
                this[_graphVariable].variableBlock = null;
            }
        }]);
        return VariableBlock;
    }(Block);

    var _variableName = Symbol("variableName");
    var _variableValueType = Symbol("variableValueType");
    var _variableValue = Symbol("variableValue");
    var _variableBlock = Symbol("variableBlock");
    var _variableGraph = Symbol("variableGraph");

    var Variable = function (_EventClass) {
        babelHelpers.inherits(Variable, _EventClass);


        /**
         * @param {Variable.variableDataTypedef} variableData - the variable configuration data
         */

        function Variable(variableData) {
            babelHelpers.classCallCheck(this, Variable);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Variable).call(this));

            _this[_variableName] = null;
            _this[_variableValueType] = null;
            _this[_variableValue] = null;
            _this[_variableBlock] = null;
            _this[_variableGraph] = null;
            _this.create(variableData);
            return _this;
        }

        /**
         * Creates the variable from the given variable data
         * @param {Variable.variableDataTypedef} variableData - the variable configuration data
         */


        babelHelpers.createClass(Variable, [{
            key: "create",
            value: function create(variableData) {
                this[_variableName] = defaultValue(variableData.variableName);
                this[_variableValueType] = defaultValue(variableData.variableValueType);
                this[_variableValue] = defaultValue(variableData.variableValue);
                this[_variableBlock] = defaultValue(variableData.variableBlock, null);
                if (!isString(this[_variableName])) {
                    throw new Error("`" + this.fancyName + "` `variableName` must be a non-null String");
                }
                if (!isString(this[_variableValueType])) {
                    throw new Error("`" + this.fancyName + "` `_variableValueType` must be a non-null String");
                }
                if (this[_variableBlock] !== null && !(this[_variableBlock] instanceof VariableBlock)) {
                    throw new Error("`" + this.fancyName + "` `variableBlock` must be of type `VariableBlock`");
                }
            }

            /**
             * Returns the variable fancy name
             * @returns {string}
             */

        }, {
            key: "added",
            value: function added() {}
        }, {
            key: "removed",
            value: function removed() {}

            /**
             * Changes this variable value to the specified value
             * @param {*|null} value - specifies the value
             * @param {boolean} [ignoreEmit=false] - whether to emit events
             */

        }, {
            key: "changeVariableValue",
            value: function changeVariableValue(value, ignoreEmit) {
                var assignValue = this[_variableGraph].convertValue(this[_variableValueType], value);
                if (typeof assignValue === "undefined") {
                    throw new Error("`" + this.fancyName + "` " + value + "` is not compatible with type `" + this[_variableValueType] + "`");
                }
                var oldValue = this[_variableValue];
                this[_variableValue] = assignValue;
                if (!ignoreEmit) {
                    this.emit("value-change", assignValue, oldValue);
                    this[_variableGraph].emit("variable-value-change", this, assignValue, oldValue);
                }
            }
        }, {
            key: "fancyName",
            get: function get() {
                return this.toString();
            }
            /**
             * Returns the variable name
             * @returns {string}
             */

        }, {
            key: "variableName",
            get: function get() {
                return this[_variableName];
            }
            /**
             * Returns the variable value type
             * @returns {string}
             */

        }, {
            key: "variableValueType",
            get: function get() {
                return this[_variableValueType];
            }
            /**
             * Returns the variable value
             * @returns {*|null}
             */

        }, {
            key: "variableValue",
            get: function get() {
                return this[_variableValue];
            }
            /**
             * Sets this variable value to the specified variable value
             * @param {*|null} variableValue - specifies the variable value
             */
            ,
            set: function set(variableValue) {
                this.changeVariableValue(variableValue);
            }
            /**
             * Returns this variable block
             * @returns {Block}
             */

        }, {
            key: "variableBlock",
            get: function get() {
                return this[_variableBlock];
            }
            /**
             * Sets this variable block to the specified variable block
             * @param {Block} variableBlock - specifies the variable block
             */
            ,
            set: function set(variableBlock) {
                this[_variableBlock] = variableBlock;
            }
            /**
             * Returns this variable graph
             * @returns {Graph}
             */

        }, {
            key: "variableGraph",
            get: function get() {
                return this[_variableGraph];
            }
            /**
             * Sets this variable graph to the specified variable graph
             * @param {Graph} variableGraph - specifies the variable graph
             */
            ,
            set: function set(variableGraph) {
                this[_variableGraph] = variableGraph;
            }
        }]);
        return Variable;
    }(EventClass);

    var _pointOutput = Symbol("pointOutput");
    var _pointName = Symbol("pointName");
    var _pointTemplate = Symbol("pointTemplate");
    var _pointValueType = Symbol("pointValueType");
    var _pointValue = Symbol("pointValue");
    var _pointPolicy = Symbol("pointPolicy");
    var _pointBlock = Symbol("pointBlock");
    var _pointConnections = Symbol("pointConnections");

    var Point = function (_EventClass) {
        babelHelpers.inherits(Point, _EventClass);


        /**
         * @param {boolean} pointOutput - whether this point is an output or an input
         * @param {Point.pointDataTypedef} pointData - The point configuration data
         */

        function Point(pointOutput, pointData) {
            babelHelpers.classCallCheck(this, Point);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Point).call(this));

            _this[_pointOutput] = pointOutput;
            _this[_pointName] = null;
            _this[_pointTemplate] = null;
            _this[_pointValueType] = null;
            _this[_pointValue] = null;
            _this[_pointPolicy] = PointPolicy.NONE;
            _this[_pointBlock] = null;
            _this[_pointConnections] = [];
            _this.create(pointData);
            return _this;
        }

        /**
         * Creates the point corresponding to the specified point data
         * @param {Point.pointDataTypedef} pointData - specifies the point data
         */


        babelHelpers.createClass(Point, [{
            key: "create",
            value: function create(pointData) {
                this[_pointName] = defaultValue(pointData.pointName, null);
                this[_pointTemplate] = defaultValue(pointData.pointTemplate, null);
                this[_pointValueType] = defaultValue(pointData.pointValueType, null);
                this[_pointValue] = defaultValue(pointData.pointValue, null);
                if (typeof pointData.pointPolicy !== "undefined") {
                    this[_pointPolicy] = PointPolicy.deserialize(pointData.pointPolicy);
                } else {
                    this[_pointPolicy] = PointPolicy.DEFAULT;
                }
                if (!isString(this[_pointName])) {
                    throw new Error("`" + this.fancyName + "` must have a non-null `pointName`");
                }
                if (this[_pointTemplate] === null && !isString(this[_pointValueType])) {
                    throw new Error("`" + this.fancyName + "` " + "`pointValueType` must be a non-null String if no `pointTemplate` is provided");
                }
                if (this.hasPolicy(PointPolicy.SINGLE_CONNECTION) && this.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)) {
                    throw new Error("`" + this.fancyName + "` `pointPolicy` cannot mix " + "`SINGLE_CONNECTION` and `MULTIPLE_CONNECTIONS`");
                }
            }

            /**
             * Returns this point fancy name
             * @returns {string}
             */

        }, {
            key: "hasPolicy",


            /**
             * Returns whether this point has the specified policy
             * @param {number} policy - specifies the policy
             * @returns {boolean}
             */
            value: function hasPolicy(policy) {
                return PointPolicy.has(this[_pointPolicy], policy);
            }
        }, {
            key: "added",
            value: function added() {}
        }, {
            key: "accept",
            value: function accept() {}
        }, {
            key: "removed",
            value: function removed() {}

            /**
             * Changes this point value to the specified value
             * @param {*|null} value - specifies the value
             * @param {boolean} [ignoreEmit=false] - whether to emit events
             */

        }, {
            key: "changeValue",
            value: function changeValue(value, ignoreEmit) {
                if (this[_pointBlock] === null) {
                    throw new Error("`" + this.fancyName + "` cannot change value when not bound to a block");
                }
                if (value !== null && !this.emptyConnection()) {
                    throw new Error("`" + this.fancyName + "` cannot change value when connected to another point");
                }
                if (value !== null && !this.hasPolicy(PointPolicy.VALUE)) {
                    throw new Error("`" + this.fancyName + "` cannot change value when the policy `VALUE` is disabled");
                }
                var oldValue = this[_pointValue];
                var assignValue = this[_pointBlock].blockGraph.convertValue(this[_pointValueType], value);
                if (typeof assignValue === "undefined") {
                    throw new Error("`" + this[_pointBlock].blockGraph.fancyName + "` " + value + "` is not compatible with type `" + this[_pointValueType] + "`");
                }
                this[_pointValue] = assignValue;
                if (!ignoreEmit) {
                    this.emit("value-change", assignValue, oldValue);
                    this[_pointBlock].blockGraph.emit("point-value-change", this, assignValue, oldValue);
                    this[_pointBlock].pointValueChanged(this, assignValue, oldValue);
                }
            }
            /**
             * Changes this point value type to the specified value type
             * @param {*|null} pointValueType - specifies the value type
             * @param {boolean} [ignoreEmit=false] - whether to emit events
             */

        }, {
            key: "changeValueType",
            value: function changeValueType(pointValueType, ignoreEmit) {
                if (this[_pointBlock] === null) {
                    throw new Error("`" + this.fancyName + "` cannot change value type when not bound to a block");
                }
                if (this[_pointBlock].blockGraph.valueTypeByName(pointValueType) === null) {
                    throw new Error("`" + this[_pointBlock].blockGraph.fancyName + "` has no value type `" + pointValueType + "`");
                }
                if (typeof this[_pointBlock].blockGraph.convertValue(pointValueType, this[_pointValue]) === "undefined") {
                    throw new Error("`" + this[_pointValue] + "` is not compatible with value type `" + pointValueType + "`");
                }
                var oldValueType = this[_pointValueType];
                this[_pointValueType] = pointValueType;
                if (!ignoreEmit) {
                    this.emit("value-type-change", pointValueType, oldValueType);
                    this[_pointBlock].blockGraph.emit("point-value-type-change", this, pointValueType, oldValueType);
                }
                this.changeValue(this[_pointValue], !!ignoreEmit);
            }

            /**
             * Returns whether this point is empty
             * @returns {boolean}
             */

        }, {
            key: "empty",
            value: function empty() {
                return this.emptyValue() && this.emptyConnection();
            }
            /**
             * Returns whether this point has a null value
             * @returns {boolean}
             */

        }, {
            key: "emptyValue",
            value: function emptyValue() {
                return this[_pointValue] === null;
            }
            /**
             * Returns whether this point has no connections
             * @returns {boolean}
             */

        }, {
            key: "emptyConnection",
            value: function emptyConnection() {
                return this[_pointConnections].length === 0;
            }

            /**
             * Connects the specified other point to this point
             * @param {Point} otherPoint - specifies the other point
             * @returns {Connection}
             */

        }, {
            key: "connect",
            value: function connect(otherPoint) {
                if (this[_pointBlock] === null) {
                    throw new Error("`" + this.fancyName + "`");
                }
                if (this[_pointOutput]) {
                    return this[_pointBlock].blockGraph.connect(this, otherPoint);
                }
                return this[_pointBlock].blockGraph.connect(otherPoint, this);
            }
            /**
             * Disconnects the specified other point from this point
             * @param {Point} otherPoint - specifies the other point
             * @returns {Connection}
             */

        }, {
            key: "disconnect",
            value: function disconnect(otherPoint) {
                if (this[_pointBlock] === null) {
                    throw new Error("`" + this.fancyName + "`");
                }
                if (this[_pointOutput]) {
                    return this[_pointBlock].blockGraph.disconnect(this, otherPoint);
                }
                return this[_pointBlock].blockGraph.disconnect(otherPoint, this);
            }
            /**
             * Disconnects all points from this point
             */

        }, {
            key: "disconnectAll",
            value: function disconnectAll() {
                var point = this;
                forEachRight(this[_pointConnections], function (connection) {
                    point.disconnect(connection.other(point));
                });
            }
        }, {
            key: "connected",
            value: function connected() {}
        }, {
            key: "acceptConnect",
            value: function acceptConnect() {
                return true;
            }
        }, {
            key: "fancyName",
            get: function get() {
                return this[_pointName];
            }
            /**
             * Returns this point type
             * @returns {string}
             */

        }, {
            key: "pointType",
            get: function get() {
                return this.constructor.name;
            }
            /**
             * Returns the name of this point
             * @returns {string}
             */

        }, {
            key: "pointName",
            get: function get() {
                return this[_pointName];
            }
            /**
             * Returns whether this point is an output or an input
             * @returns {boolean}
             */

        }, {
            key: "pointOutput",
            get: function get() {
                return this[_pointOutput];
            }
            /**
             * Returns this point template
             * @returns {string|null}
             */

        }, {
            key: "pointTemplate",
            get: function get() {
                return this[_pointTemplate];
            }
            /**
             * Returns this point value type
             * @returns {string}
             */

        }, {
            key: "pointValueType",
            get: function get() {
                return this[_pointValueType];
            }
            /**
             * Sets this point value type
             * @param {string} pointValueType - the point value type to set
             */
            ,
            set: function set(pointValueType) {
                this.changeValueType(pointValueType);
            }
            /**
             * Returns this point value
             * @returns {*|null}
             */

        }, {
            key: "pointValue",
            get: function get() {
                return this[_pointValue];
            }
            /**
             * Sets this point value to the specified point value
             * @param {*|null} pointValue - specifies the point value
             */
            ,
            set: function set(pointValue) {
                this.changeValue(pointValue);
            }
            /**
             * Returns this point policy
             * @returns {number}
             */

        }, {
            key: "pointPolicy",
            get: function get() {
                return this[_pointPolicy];
            }
            /**
             * Returns this point's block
             * @returns {Block|null}
             */

        }, {
            key: "pointBlock",
            get: function get() {
                return this[_pointBlock];
            }
            /**
             * Sets this point block to the specified point block
             * @param {Block|null} pointBlock - specifies the point block
             */
            ,
            set: function set(pointBlock) {
                this[_pointBlock] = pointBlock;
            }
            /**
             * Returns this point connections
             * @returns {Array<Connection>}
             */

        }, {
            key: "pointConnections",
            get: function get() {
                return this[_pointConnections];
            }
        }]);
        return Point;
    }(EventClass);

    var StreamPoint = function (_Point) {
      babelHelpers.inherits(StreamPoint, _Point);

      function StreamPoint() {
        babelHelpers.classCallCheck(this, StreamPoint);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(StreamPoint).apply(this, arguments));
      }

      return StreamPoint;
    }(Point);

    var AssignationBlock = function (_Block) {
        babelHelpers.inherits(AssignationBlock, _Block);

        function AssignationBlock() {
            babelHelpers.classCallCheck(this, AssignationBlock);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AssignationBlock).apply(this, arguments));
        }

        babelHelpers.createClass(AssignationBlock, [{
            key: "validatePoints",


            /**
             * Called when the static points are created
             * @override
             */
            value: function validatePoints() {
                if (!(this.inputByName("in") instanceof StreamPoint)) {
                    throw new Error("`" + this.fancyName + "` must have an input `in` of type `Stream`");
                }
                if (!(this.inputByName("variable") instanceof Point)) {
                    throw new Error("`" + this.fancyName + "` must have an input `variable` of type `Point`");
                }
                if (!(this.inputByName("value") instanceof Point)) {
                    throw new Error("`" + this.fancyName + "` must have an input `value` of type `Point`");
                }
                if (this.inputByName("variable").pointValueType !== this.inputByName("value").pointValueType) {
                    throw new Error("`" + this.fancyName + "` inputs `variable` and `value` must have the same pointValueType");
                }
                if (!(this.outputByName("out") instanceof StreamPoint)) {
                    throw new Error("`" + this.fancyName + "` must have an output `out` of type `Stream`");
                }
            }
        }]);
        return AssignationBlock;
    }(Block);

    exports.Graph = Graph;
    exports.Variable = Variable;
    exports.Block = Block;
    exports.Point = Point;
    exports.PointPolicy = PointPolicy;
    exports.Connection = Connection;
    exports.VariableBlock = VariableBlock;
    exports.AssignationBlock = AssignationBlock;
    exports.StreamPoint = StreamPoint;

}));
//# sourceMappingURL=dude-graph.js.map
