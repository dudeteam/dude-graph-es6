(function (exports) {
    'use strict';

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
    var stringTag = '[object String]';

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

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
      return typeof value == 'string' || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }

    /** `Object#toString` result references. */
    var numberTag = '[object Number]';

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$1 = objectProto$1.toString;

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
      return typeof value == 'number' || isObjectLike(value) && objectToString$1.call(value) == numberTag;
    }

    /** `Object#toString` result references. */
    var boolTag = '[object Boolean]';

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$2 = objectProto$2.toString;

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
      return value === true || value === false || isObjectLike(value) && objectToString$2.call(value) == boolTag;
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

    /** Built-in value references. */
    var _Symbol = root.Symbol;

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$3 = objectProto$3.toString;

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
      return (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) == 'symbol' || isObjectLike(value) && objectToString$3.call(value) == symbolTag;
    }

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined;
    var symbolToString = symbolProto ? symbolProto.toString : undefined;
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
      return result == '0' && 1 / value == -INFINITY ? '-0' : result;
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

    var funcTag = '[object Function]';
    var genTag = '[object GeneratorFunction]';
    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$4 = objectProto$4.toString;

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
      var tag = isObject(value) ? objectToString$4.call(value) : '';
      return tag == funcTag || tag == genTag;
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

    var multiChannelSep = /(?:,|\s)+/g;
    var channelSep = /:+/g;

    var EventClass = function () {
        function EventClass() {
            babelHelpers.classCallCheck(this, EventClass);

            this._channels = {};
        }

        babelHelpers.createClass(EventClass, [{
            key: "_getChannels",
            value: function _getChannels(channelString) {
                return channelString.trim().split(multiChannelSep);
            }
        }, {
            key: "_getNameSpaces",
            value: function _getNameSpaces(channel) {
                var namespaces = [];
                var splittedChannels = channel.trim().split(channelSep);

                for (var i = splittedChannels.length; i >= 1; i--) {
                    namespaces.push(splittedChannels.slice(0, i).join(":"));
                }

                return namespaces;
            }
        }, {
            key: "trigger",
            value: function trigger(event, data) {
                var channels = this._getChannels(event);

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = channels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var channel = _step.value;

                        var namespaces = this._getNameSpaces(channel);
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = namespaces[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var namespace = _step2.value;

                                if (!this._channels[namespace]) {
                                    continue;
                                }

                                var _iteratorNormalCompletion3 = true;
                                var _didIteratorError3 = false;
                                var _iteratorError3 = undefined;

                                try {
                                    for (var _iterator3 = this._channels[namespace][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                        var callback = _step3.value;

                                        callback.call(this, data);
                                    }
                                } catch (err) {
                                    _didIteratorError3 = true;
                                    _iteratorError3 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                            _iterator3.return();
                                        }
                                    } finally {
                                        if (_didIteratorError3) {
                                            throw _iteratorError3;
                                        }
                                    }
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }, {
            key: "on",
            value: function on(event, callback) {
                var channels = this._getChannels(event);

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = channels[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var channel = _step4.value;

                        if (!this._channels[channel]) {
                            this._channels[channel] = [];
                        }

                        this._channels[channel].push(callback);
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
        }, {
            key: "off",
            value: function off(event, callback) {
                var channels = this._getChannels(event);

                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = channels[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var channel = _step5.value;

                        if (!this._channels[channel]) {
                            return;
                        }

                        var index = this._channels[channel].indexOf(callback);

                        if (index > -1) {
                            this._channels[channel].splice(index, 1);
                        }
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }
            }
        }, {
            key: "once",
            value: function once(event, callback) {
                function offCallback() {
                    this.off(event, callback);
                    this.off(event, offCallback);
                }

                this.on(event, callback);
                this.on(event, offCallback);
            }
        }]);
        return EventClass;
    }();

    var Graph = function (_EventClass) {
        babelHelpers.inherits(Graph, _EventClass);

        function Graph() {
            babelHelpers.classCallCheck(this, Graph);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Graph).call(this));

            _this._valueTypes = {
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
            return _this;
        }

        babelHelpers.createClass(Graph, [{
            key: "query",
            value: function query() {}
        }, {
            key: "addBlock",
            value: function addBlock() {}
        }, {
            key: "removeBlock",
            value: function removeBlock() {}
        }, {
            key: "blockById",
            value: function blockById() {}
        }, {
            key: "blocksByName",
            value: function blocksByName() {}
        }, {
            key: "blocksByType",
            value: function blocksByType() {}
        }, {
            key: "addVariable",
            value: function addVariable() {}
        }, {
            key: "removeVariable",
            value: function removeVariable() {}
        }, {
            key: "variableById",
            value: function variableById() {}
        }, {
            key: "variablesByType",
            value: function variablesByType() {}
        }, {
            key: "connect",
            value: function connect() {}
        }, {
            key: "disconnect",
            value: function disconnect() {}
        }, {
            key: "models",
            get: function get() {}
        }, {
            key: "blocks",
            get: function get() {}
        }, {
            key: "variables",
            get: function get() {}
        }, {
            key: "connections",
            get: function get() {}
        }]);
        return Graph;
    }(EventClass);

    var Variable = function (_EventClass) {
        babelHelpers.inherits(Variable, _EventClass);

        function Variable() {
            babelHelpers.classCallCheck(this, Variable);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Variable).apply(this, arguments));
        }

        babelHelpers.createClass(Variable, [{
            key: "added",
            value: function added() {}
        }, {
            key: "removed",
            value: function removed() {}
        }, {
            key: "changeValue",
            value: function changeValue() {}
        }]);
        return Variable;
    }(EventClass);

    var Block = function (_EventClass) {
        babelHelpers.inherits(Block, _EventClass);

        function Block() {
            babelHelpers.classCallCheck(this, Block);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Block).call(this));
        }

        babelHelpers.createClass(Block, [{
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
        }, {
            key: "changeTemplate",
            value: function changeTemplate() {}
        }, {
            key: "templateById",
            value: function templateById() {}
        }, {
            key: "addPoint",
            value: function addPoint() {}
        }, {
            key: "removePoint",
            value: function removePoint() {}
        }, {
            key: "removePoints",
            value: function removePoints() {}
        }, {
            key: "inputByName",
            value: function inputByName() {}
        }, {
            key: "outputByName",
            value: function outputByName() {}
        }, {
            key: "id",
            get: function get() {}
        }, {
            key: "name",
            get: function get() {}
        }, {
            key: "inputs",
            get: function get() {}
        }, {
            key: "outputs",
            get: function get() {}
        }], [{
            key: "create",
            value: function create() {}
        }]);
        return Block;
    }(EventClass);

    var Point = function (_EventClass) {
        babelHelpers.inherits(Point, _EventClass);

        function Point() {
            babelHelpers.classCallCheck(this, Point);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Point).call(this));
        }

        babelHelpers.createClass(Point, [{
            key: "added",
            value: function added() {}
        }, {
            key: "accept",
            value: function accept() {}
        }, {
            key: "removed",
            value: function removed() {}
        }, {
            key: "changeValue",
            value: function changeValue() {}
        }, {
            key: "changeValueType",
            value: function changeValueType() {}
        }, {
            key: "empty",
            value: function empty() {}
        }, {
            key: "emptyValue",
            value: function emptyValue() {}
        }, {
            key: "emptyConnection",
            value: function emptyConnection() {}
        }, {
            key: "connect",
            value: function connect() {}
        }, {
            key: "disconnect",
            value: function disconnect() {}
        }, {
            key: "disconnectAll",
            value: function disconnectAll() {}
        }, {
            key: "connected",
            value: function connected() {}
        }, {
            key: "name",
            get: function get() {}
        }, {
            key: "valueType",
            get: function get() {}
        }, {
            key: "value",
            get: function get() {}
        }], [{
            key: "create",
            value: function create() {}
        }]);
        return Point;
    }(EventClass);

    var Connection = function (_EventClass) {
        babelHelpers.inherits(Connection, _EventClass);

        function Connection() {
            babelHelpers.classCallCheck(this, Connection);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Connection).apply(this, arguments));
        }

        babelHelpers.createClass(Connection, [{
            key: "other",
            value: function other() {}
        }, {
            key: "remove",
            value: function remove() {}
        }]);
        return Connection;
    }(EventClass);

    exports.Graph = Graph;
    exports.Variable = Variable;
    exports.Block = Block;
    exports.Point = Point;
    exports.Connection = Connection;

}((this.dudeGraph = this.dudeGraph || {})));
//# sourceMappingURL=dude-graph-web.js.map
