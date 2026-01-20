"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x2) => x2.done ? resolve(x2.value) : Promise.resolve(x2.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/es-errors/type.js
  var require_type = __commonJS({
    "node_modules/es-errors/type.js"(exports, module) {
      "use strict";
      module.exports = TypeError;
    }
  });

  // (disabled):node_modules/object-inspect/util.inspect
  var require_util = __commonJS({
    "(disabled):node_modules/object-inspect/util.inspect"() {
    }
  });

  // node_modules/object-inspect/index.js
  var require_object_inspect = __commonJS({
    "node_modules/object-inspect/index.js"(exports, module) {
      var hasMap = typeof Map === "function" && Map.prototype;
      var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
      var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
      var mapForEach = hasMap && Map.prototype.forEach;
      var hasSet = typeof Set === "function" && Set.prototype;
      var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
      var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
      var setForEach = hasSet && Set.prototype.forEach;
      var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
      var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
      var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
      var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
      var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
      var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
      var booleanValueOf = Boolean.prototype.valueOf;
      var objectToString = Object.prototype.toString;
      var functionToString = Function.prototype.toString;
      var $match = String.prototype.match;
      var $slice = String.prototype.slice;
      var $replace = String.prototype.replace;
      var $toUpperCase = String.prototype.toUpperCase;
      var $toLowerCase = String.prototype.toLowerCase;
      var $test = RegExp.prototype.test;
      var $concat = Array.prototype.concat;
      var $join = Array.prototype.join;
      var $arrSlice = Array.prototype.slice;
      var $floor = Math.floor;
      var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
      var gOPS = Object.getOwnPropertySymbols;
      var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
      var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
      var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
      var isEnumerable = Object.prototype.propertyIsEnumerable;
      var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
        return O.__proto__;
      } : null);
      function addNumericSeparator(num, str) {
        if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
          return str;
        }
        var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
        if (typeof num === "number") {
          var int = num < 0 ? -$floor(-num) : $floor(num);
          if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
          }
        }
        return $replace.call(str, sepRegex, "$&_");
      }
      var utilInspect = require_util();
      var inspectCustom = utilInspect.custom;
      var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
      var quotes = {
        __proto__: null,
        "double": '"',
        single: "'"
      };
      var quoteREs = {
        __proto__: null,
        "double": /(["\\])/g,
        single: /(['\\])/g
      };
      module.exports = function inspect_(obj, options, depth, seen) {
        var opts = options || {};
        if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
          throw new TypeError('option "quoteStyle" must be "single" or "double"');
        }
        if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
          throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
        }
        var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
        if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
          throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
        }
        if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
          throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
        }
        if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
          throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
        }
        var numericSeparator = opts.numericSeparator;
        if (typeof obj === "undefined") {
          return "undefined";
        }
        if (obj === null) {
          return "null";
        }
        if (typeof obj === "boolean") {
          return obj ? "true" : "false";
        }
        if (typeof obj === "string") {
          return inspectString(obj, opts);
        }
        if (typeof obj === "number") {
          if (obj === 0) {
            return Infinity / obj > 0 ? "0" : "-0";
          }
          var str = String(obj);
          return numericSeparator ? addNumericSeparator(obj, str) : str;
        }
        if (typeof obj === "bigint") {
          var bigIntStr = String(obj) + "n";
          return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
        }
        var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
        if (typeof depth === "undefined") {
          depth = 0;
        }
        if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
          return isArray(obj) ? "[Array]" : "[Object]";
        }
        var indent = getIndent(opts, depth);
        if (typeof seen === "undefined") {
          seen = [];
        } else if (indexOf(seen, obj) >= 0) {
          return "[Circular]";
        }
        function inspect(value, from, noIndent) {
          if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
          }
          if (noIndent) {
            var newOpts = {
              depth: opts.depth
            };
            if (has(opts, "quoteStyle")) {
              newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
          }
          return inspect_(value, opts, depth + 1, seen);
        }
        if (typeof obj === "function" && !isRegExp(obj)) {
          var name = nameOf(obj);
          var keys = arrObjKeys(obj, inspect);
          return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
        }
        if (isSymbol(obj)) {
          var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
          return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
        }
        if (isElement(obj)) {
          var s = "<" + $toLowerCase.call(String(obj.nodeName));
          var attrs = obj.attributes || [];
          for (var i = 0; i < attrs.length; i++) {
            s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
          }
          s += ">";
          if (obj.childNodes && obj.childNodes.length) {
            s += "...";
          }
          s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
          return s;
        }
        if (isArray(obj)) {
          if (obj.length === 0) {
            return "[]";
          }
          var xs = arrObjKeys(obj, inspect);
          if (indent && !singleLineValues(xs)) {
            return "[" + indentedJoin(xs, indent) + "]";
          }
          return "[ " + $join.call(xs, ", ") + " ]";
        }
        if (isError(obj)) {
          var parts = arrObjKeys(obj, inspect);
          if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
            return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
          }
          if (parts.length === 0) {
            return "[" + String(obj) + "]";
          }
          return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
        }
        if (typeof obj === "object" && customInspect) {
          if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
          } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
            return obj.inspect();
          }
        }
        if (isMap(obj)) {
          var mapParts = [];
          if (mapForEach) {
            mapForEach.call(obj, function(value, key) {
              mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
            });
          }
          return collectionOf("Map", mapSize.call(obj), mapParts, indent);
        }
        if (isSet(obj)) {
          var setParts = [];
          if (setForEach) {
            setForEach.call(obj, function(value) {
              setParts.push(inspect(value, obj));
            });
          }
          return collectionOf("Set", setSize.call(obj), setParts, indent);
        }
        if (isWeakMap(obj)) {
          return weakCollectionOf("WeakMap");
        }
        if (isWeakSet(obj)) {
          return weakCollectionOf("WeakSet");
        }
        if (isWeakRef(obj)) {
          return weakCollectionOf("WeakRef");
        }
        if (isNumber2(obj)) {
          return markBoxed(inspect(Number(obj)));
        }
        if (isBigInt(obj)) {
          return markBoxed(inspect(bigIntValueOf.call(obj)));
        }
        if (isBoolean(obj)) {
          return markBoxed(booleanValueOf.call(obj));
        }
        if (isString(obj)) {
          return markBoxed(inspect(String(obj)));
        }
        if (typeof window !== "undefined" && obj === window) {
          return "{ [object Window] }";
        }
        if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
          return "{ [object globalThis] }";
        }
        if (!isDate(obj) && !isRegExp(obj)) {
          var ys = arrObjKeys(obj, inspect);
          var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
          var protoTag = obj instanceof Object ? "" : "null prototype";
          var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
          var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
          var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
          if (ys.length === 0) {
            return tag + "{}";
          }
          if (indent) {
            return tag + "{" + indentedJoin(ys, indent) + "}";
          }
          return tag + "{ " + $join.call(ys, ", ") + " }";
        }
        return String(obj);
      };
      function wrapQuotes(s, defaultStyle, opts) {
        var style = opts.quoteStyle || defaultStyle;
        var quoteChar = quotes[style];
        return quoteChar + s + quoteChar;
      }
      function quote(s) {
        return $replace.call(String(s), /"/g, "&quot;");
      }
      function canTrustToString(obj) {
        return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
      }
      function isArray(obj) {
        return toStr(obj) === "[object Array]" && canTrustToString(obj);
      }
      function isDate(obj) {
        return toStr(obj) === "[object Date]" && canTrustToString(obj);
      }
      function isRegExp(obj) {
        return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
      }
      function isError(obj) {
        return toStr(obj) === "[object Error]" && canTrustToString(obj);
      }
      function isString(obj) {
        return toStr(obj) === "[object String]" && canTrustToString(obj);
      }
      function isNumber2(obj) {
        return toStr(obj) === "[object Number]" && canTrustToString(obj);
      }
      function isBoolean(obj) {
        return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
      }
      function isSymbol(obj) {
        if (hasShammedSymbols) {
          return obj && typeof obj === "object" && obj instanceof Symbol;
        }
        if (typeof obj === "symbol") {
          return true;
        }
        if (!obj || typeof obj !== "object" || !symToString) {
          return false;
        }
        try {
          symToString.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isBigInt(obj) {
        if (!obj || typeof obj !== "object" || !bigIntValueOf) {
          return false;
        }
        try {
          bigIntValueOf.call(obj);
          return true;
        } catch (e) {
        }
        return false;
      }
      var hasOwn = Object.prototype.hasOwnProperty || function(key) {
        return key in this;
      };
      function has(obj, key) {
        return hasOwn.call(obj, key);
      }
      function toStr(obj) {
        return objectToString.call(obj);
      }
      function nameOf(f) {
        if (f.name) {
          return f.name;
        }
        var m2 = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
        if (m2) {
          return m2[1];
        }
        return null;
      }
      function indexOf(xs, x2) {
        if (xs.indexOf) {
          return xs.indexOf(x2);
        }
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x2) {
            return i;
          }
        }
        return -1;
      }
      function isMap(x2) {
        if (!mapSize || !x2 || typeof x2 !== "object") {
          return false;
        }
        try {
          mapSize.call(x2);
          try {
            setSize.call(x2);
          } catch (s) {
            return true;
          }
          return x2 instanceof Map;
        } catch (e) {
        }
        return false;
      }
      function isWeakMap(x2) {
        if (!weakMapHas || !x2 || typeof x2 !== "object") {
          return false;
        }
        try {
          weakMapHas.call(x2, weakMapHas);
          try {
            weakSetHas.call(x2, weakSetHas);
          } catch (s) {
            return true;
          }
          return x2 instanceof WeakMap;
        } catch (e) {
        }
        return false;
      }
      function isWeakRef(x2) {
        if (!weakRefDeref || !x2 || typeof x2 !== "object") {
          return false;
        }
        try {
          weakRefDeref.call(x2);
          return true;
        } catch (e) {
        }
        return false;
      }
      function isSet(x2) {
        if (!setSize || !x2 || typeof x2 !== "object") {
          return false;
        }
        try {
          setSize.call(x2);
          try {
            mapSize.call(x2);
          } catch (m2) {
            return true;
          }
          return x2 instanceof Set;
        } catch (e) {
        }
        return false;
      }
      function isWeakSet(x2) {
        if (!weakSetHas || !x2 || typeof x2 !== "object") {
          return false;
        }
        try {
          weakSetHas.call(x2, weakSetHas);
          try {
            weakMapHas.call(x2, weakMapHas);
          } catch (s) {
            return true;
          }
          return x2 instanceof WeakSet;
        } catch (e) {
        }
        return false;
      }
      function isElement(x2) {
        if (!x2 || typeof x2 !== "object") {
          return false;
        }
        if (typeof HTMLElement !== "undefined" && x2 instanceof HTMLElement) {
          return true;
        }
        return typeof x2.nodeName === "string" && typeof x2.getAttribute === "function";
      }
      function inspectString(str, opts) {
        if (str.length > opts.maxStringLength) {
          var remaining = str.length - opts.maxStringLength;
          var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
          return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
        }
        var quoteRE = quoteREs[opts.quoteStyle || "single"];
        quoteRE.lastIndex = 0;
        var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
        return wrapQuotes(s, "single", opts);
      }
      function lowbyte(c) {
        var n = c.charCodeAt(0);
        var x2 = {
          8: "b",
          9: "t",
          10: "n",
          12: "f",
          13: "r"
        }[n];
        if (x2) {
          return "\\" + x2;
        }
        return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
      }
      function markBoxed(str) {
        return "Object(" + str + ")";
      }
      function weakCollectionOf(type) {
        return type + " { ? }";
      }
      function collectionOf(type, size, entries, indent) {
        var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
        return type + " (" + size + ") {" + joinedEntries + "}";
      }
      function singleLineValues(xs) {
        for (var i = 0; i < xs.length; i++) {
          if (indexOf(xs[i], "\n") >= 0) {
            return false;
          }
        }
        return true;
      }
      function getIndent(opts, depth) {
        var baseIndent;
        if (opts.indent === "	") {
          baseIndent = "	";
        } else if (typeof opts.indent === "number" && opts.indent > 0) {
          baseIndent = $join.call(Array(opts.indent + 1), " ");
        } else {
          return null;
        }
        return {
          base: baseIndent,
          prev: $join.call(Array(depth + 1), baseIndent)
        };
      }
      function indentedJoin(xs, indent) {
        if (xs.length === 0) {
          return "";
        }
        var lineJoiner = "\n" + indent.prev + indent.base;
        return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
      }
      function arrObjKeys(obj, inspect) {
        var isArr = isArray(obj);
        var xs = [];
        if (isArr) {
          xs.length = obj.length;
          for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
          }
        }
        var syms = typeof gOPS === "function" ? gOPS(obj) : [];
        var symMap;
        if (hasShammedSymbols) {
          symMap = {};
          for (var k = 0; k < syms.length; k++) {
            symMap["$" + syms[k]] = syms[k];
          }
        }
        for (var key in obj) {
          if (!has(obj, key)) {
            continue;
          }
          if (isArr && String(Number(key)) === key && key < obj.length) {
            continue;
          }
          if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
            continue;
          } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
          } else {
            xs.push(key + ": " + inspect(obj[key], obj));
          }
        }
        if (typeof gOPS === "function") {
          for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
              xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
            }
          }
        }
        return xs;
      }
    }
  });

  // node_modules/side-channel-list/index.js
  var require_side_channel_list = __commonJS({
    "node_modules/side-channel-list/index.js"(exports, module) {
      "use strict";
      var inspect = require_object_inspect();
      var $TypeError = require_type();
      var listGetNode = function(list, key, isDelete) {
        var prev = list;
        var curr;
        for (; (curr = prev.next) != null; prev = curr) {
          if (curr.key === key) {
            prev.next = curr.next;
            if (!isDelete) {
              curr.next = /** @type {NonNullable<typeof list.next>} */
              list.next;
              list.next = curr;
            }
            return curr;
          }
        }
      };
      var listGet = function(objects, key) {
        if (!objects) {
          return void 0;
        }
        var node = listGetNode(objects, key);
        return node && node.value;
      };
      var listSet = function(objects, key, value) {
        var node = listGetNode(objects, key);
        if (node) {
          node.value = value;
        } else {
          objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
          {
            // eslint-disable-line no-param-reassign, no-extra-parens
            key,
            next: objects.next,
            value
          };
        }
      };
      var listHas = function(objects, key) {
        if (!objects) {
          return false;
        }
        return !!listGetNode(objects, key);
      };
      var listDelete = function(objects, key) {
        if (objects) {
          return listGetNode(objects, key, true);
        }
      };
      module.exports = function getSideChannelList() {
        var $o;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            var root = $o && $o.next;
            var deletedNode = listDelete($o, key);
            if (deletedNode && root && root === deletedNode) {
              $o = void 0;
            }
            return !!deletedNode;
          },
          get: function(key) {
            return listGet($o, key);
          },
          has: function(key) {
            return listHas($o, key);
          },
          set: function(key, value) {
            if (!$o) {
              $o = {
                next: void 0
              };
            }
            listSet(
              /** @type {NonNullable<typeof $o>} */
              $o,
              key,
              value
            );
          }
        };
        return channel;
      };
    }
  });

  // node_modules/es-object-atoms/index.js
  var require_es_object_atoms = __commonJS({
    "node_modules/es-object-atoms/index.js"(exports, module) {
      "use strict";
      module.exports = Object;
    }
  });

  // node_modules/es-errors/index.js
  var require_es_errors = __commonJS({
    "node_modules/es-errors/index.js"(exports, module) {
      "use strict";
      module.exports = Error;
    }
  });

  // node_modules/es-errors/eval.js
  var require_eval = __commonJS({
    "node_modules/es-errors/eval.js"(exports, module) {
      "use strict";
      module.exports = EvalError;
    }
  });

  // node_modules/es-errors/range.js
  var require_range = __commonJS({
    "node_modules/es-errors/range.js"(exports, module) {
      "use strict";
      module.exports = RangeError;
    }
  });

  // node_modules/es-errors/ref.js
  var require_ref = __commonJS({
    "node_modules/es-errors/ref.js"(exports, module) {
      "use strict";
      module.exports = ReferenceError;
    }
  });

  // node_modules/es-errors/syntax.js
  var require_syntax = __commonJS({
    "node_modules/es-errors/syntax.js"(exports, module) {
      "use strict";
      module.exports = SyntaxError;
    }
  });

  // node_modules/es-errors/uri.js
  var require_uri = __commonJS({
    "node_modules/es-errors/uri.js"(exports, module) {
      "use strict";
      module.exports = URIError;
    }
  });

  // node_modules/math-intrinsics/abs.js
  var require_abs = __commonJS({
    "node_modules/math-intrinsics/abs.js"(exports, module) {
      "use strict";
      module.exports = Math.abs;
    }
  });

  // node_modules/math-intrinsics/floor.js
  var require_floor = __commonJS({
    "node_modules/math-intrinsics/floor.js"(exports, module) {
      "use strict";
      module.exports = Math.floor;
    }
  });

  // node_modules/math-intrinsics/max.js
  var require_max = __commonJS({
    "node_modules/math-intrinsics/max.js"(exports, module) {
      "use strict";
      module.exports = Math.max;
    }
  });

  // node_modules/math-intrinsics/min.js
  var require_min = __commonJS({
    "node_modules/math-intrinsics/min.js"(exports, module) {
      "use strict";
      module.exports = Math.min;
    }
  });

  // node_modules/math-intrinsics/pow.js
  var require_pow = __commonJS({
    "node_modules/math-intrinsics/pow.js"(exports, module) {
      "use strict";
      module.exports = Math.pow;
    }
  });

  // node_modules/math-intrinsics/round.js
  var require_round = __commonJS({
    "node_modules/math-intrinsics/round.js"(exports, module) {
      "use strict";
      module.exports = Math.round;
    }
  });

  // node_modules/math-intrinsics/isNaN.js
  var require_isNaN = __commonJS({
    "node_modules/math-intrinsics/isNaN.js"(exports, module) {
      "use strict";
      module.exports = Number.isNaN || function isNaN2(a) {
        return a !== a;
      };
    }
  });

  // node_modules/math-intrinsics/sign.js
  var require_sign = __commonJS({
    "node_modules/math-intrinsics/sign.js"(exports, module) {
      "use strict";
      var $isNaN = require_isNaN();
      module.exports = function sign(number) {
        if ($isNaN(number) || number === 0) {
          return number;
        }
        return number < 0 ? -1 : 1;
      };
    }
  });

  // node_modules/gopd/gOPD.js
  var require_gOPD = __commonJS({
    "node_modules/gopd/gOPD.js"(exports, module) {
      "use strict";
      module.exports = Object.getOwnPropertyDescriptor;
    }
  });

  // node_modules/gopd/index.js
  var require_gopd = __commonJS({
    "node_modules/gopd/index.js"(exports, module) {
      "use strict";
      var $gOPD = require_gOPD();
      if ($gOPD) {
        try {
          $gOPD([], "length");
        } catch (e) {
          $gOPD = null;
        }
      }
      module.exports = $gOPD;
    }
  });

  // node_modules/es-define-property/index.js
  var require_es_define_property = __commonJS({
    "node_modules/es-define-property/index.js"(exports, module) {
      "use strict";
      var $defineProperty = Object.defineProperty || false;
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
        } catch (e) {
          $defineProperty = false;
        }
      }
      module.exports = $defineProperty;
    }
  });

  // node_modules/has-symbols/shams.js
  var require_shams = __commonJS({
    "node_modules/has-symbols/shams.js"(exports, module) {
      "use strict";
      module.exports = function hasSymbols() {
        if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
          return false;
        }
        if (typeof Symbol.iterator === "symbol") {
          return true;
        }
        var obj = {};
        var sym = /* @__PURE__ */ Symbol("test");
        var symObj = Object(sym);
        if (typeof sym === "string") {
          return false;
        }
        if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
          return false;
        }
        if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
          return false;
        }
        var symVal = 42;
        obj[sym] = symVal;
        for (var _2 in obj) {
          return false;
        }
        if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
          return false;
        }
        if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
          return false;
        }
        var syms = Object.getOwnPropertySymbols(obj);
        if (syms.length !== 1 || syms[0] !== sym) {
          return false;
        }
        if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          return false;
        }
        if (typeof Object.getOwnPropertyDescriptor === "function") {
          var descriptor = (
            /** @type {PropertyDescriptor} */
            Object.getOwnPropertyDescriptor(obj, sym)
          );
          if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
          }
        }
        return true;
      };
    }
  });

  // node_modules/has-symbols/index.js
  var require_has_symbols = __commonJS({
    "node_modules/has-symbols/index.js"(exports, module) {
      "use strict";
      var origSymbol = typeof Symbol !== "undefined" && Symbol;
      var hasSymbolSham = require_shams();
      module.exports = function hasNativeSymbols() {
        if (typeof origSymbol !== "function") {
          return false;
        }
        if (typeof Symbol !== "function") {
          return false;
        }
        if (typeof origSymbol("foo") !== "symbol") {
          return false;
        }
        if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
          return false;
        }
        return hasSymbolSham();
      };
    }
  });

  // node_modules/get-proto/Reflect.getPrototypeOf.js
  var require_Reflect_getPrototypeOf = __commonJS({
    "node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
    }
  });

  // node_modules/get-proto/Object.getPrototypeOf.js
  var require_Object_getPrototypeOf = __commonJS({
    "node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
      "use strict";
      var $Object = require_es_object_atoms();
      module.exports = $Object.getPrototypeOf || null;
    }
  });

  // node_modules/function-bind/implementation.js
  var require_implementation = __commonJS({
    "node_modules/function-bind/implementation.js"(exports, module) {
      "use strict";
      var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
      var toStr = Object.prototype.toString;
      var max = Math.max;
      var funcType = "[object Function]";
      var concatty = function concatty2(a, b) {
        var arr = [];
        for (var i = 0; i < a.length; i += 1) {
          arr[i] = a[i];
        }
        for (var j = 0; j < b.length; j += 1) {
          arr[j + a.length] = b[j];
        }
        return arr;
      };
      var slicy = function slicy2(arrLike, offset) {
        var arr = [];
        for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
          arr[j] = arrLike[i];
        }
        return arr;
      };
      var joiny = function(arr, joiner) {
        var str = "";
        for (var i = 0; i < arr.length; i += 1) {
          str += arr[i];
          if (i + 1 < arr.length) {
            str += joiner;
          }
        }
        return str;
      };
      module.exports = function bind(that) {
        var target = this;
        if (typeof target !== "function" || toStr.apply(target) !== funcType) {
          throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slicy(arguments, 1);
        var bound;
        var binder = function() {
          if (this instanceof bound) {
            var result = target.apply(
              this,
              concatty(args, arguments)
            );
            if (Object(result) === result) {
              return result;
            }
            return this;
          }
          return target.apply(
            that,
            concatty(args, arguments)
          );
        };
        var boundLength = max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = "$" + i;
        }
        bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
        if (target.prototype) {
          var Empty = function Empty2() {
          };
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      };
    }
  });

  // node_modules/function-bind/index.js
  var require_function_bind = __commonJS({
    "node_modules/function-bind/index.js"(exports, module) {
      "use strict";
      var implementation = require_implementation();
      module.exports = Function.prototype.bind || implementation;
    }
  });

  // node_modules/call-bind-apply-helpers/functionCall.js
  var require_functionCall = __commonJS({
    "node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.call;
    }
  });

  // node_modules/call-bind-apply-helpers/functionApply.js
  var require_functionApply = __commonJS({
    "node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.apply;
    }
  });

  // node_modules/call-bind-apply-helpers/reflectApply.js
  var require_reflectApply = __commonJS({
    "node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
    }
  });

  // node_modules/call-bind-apply-helpers/actualApply.js
  var require_actualApply = __commonJS({
    "node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var $reflectApply = require_reflectApply();
      module.exports = $reflectApply || bind.call($call, $apply);
    }
  });

  // node_modules/call-bind-apply-helpers/index.js
  var require_call_bind_apply_helpers = __commonJS({
    "node_modules/call-bind-apply-helpers/index.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $TypeError = require_type();
      var $call = require_functionCall();
      var $actualApply = require_actualApply();
      module.exports = function callBindBasic(args) {
        if (args.length < 1 || typeof args[0] !== "function") {
          throw new $TypeError("a function is required");
        }
        return $actualApply(bind, $call, args);
      };
    }
  });

  // node_modules/dunder-proto/get.js
  var require_get = __commonJS({
    "node_modules/dunder-proto/get.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind_apply_helpers();
      var gOPD = require_gopd();
      var hasProtoAccessor;
      try {
        hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
        [].__proto__ === Array.prototype;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var desc = !!hasProtoAccessor && gOPD && gOPD(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      var $Object = Object;
      var $getPrototypeOf = $Object.getPrototypeOf;
      module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
        /** @type {import('./get')} */
        function getDunder(value) {
          return $getPrototypeOf(value == null ? value : $Object(value));
        }
      ) : false;
    }
  });

  // node_modules/get-proto/index.js
  var require_get_proto = __commonJS({
    "node_modules/get-proto/index.js"(exports, module) {
      "use strict";
      var reflectGetProto = require_Reflect_getPrototypeOf();
      var originalGetProto = require_Object_getPrototypeOf();
      var getDunderProto = require_get();
      module.exports = reflectGetProto ? function getProto(O) {
        return reflectGetProto(O);
      } : originalGetProto ? function getProto(O) {
        if (!O || typeof O !== "object" && typeof O !== "function") {
          throw new TypeError("getProto: not an object");
        }
        return originalGetProto(O);
      } : getDunderProto ? function getProto(O) {
        return getDunderProto(O);
      } : null;
    }
  });

  // node_modules/hasown/index.js
  var require_hasown = __commonJS({
    "node_modules/hasown/index.js"(exports, module) {
      "use strict";
      var call = Function.prototype.call;
      var $hasOwn = Object.prototype.hasOwnProperty;
      var bind = require_function_bind();
      module.exports = bind.call(call, $hasOwn);
    }
  });

  // node_modules/get-intrinsic/index.js
  var require_get_intrinsic = __commonJS({
    "node_modules/get-intrinsic/index.js"(exports, module) {
      "use strict";
      var undefined2;
      var $Object = require_es_object_atoms();
      var $Error = require_es_errors();
      var $EvalError = require_eval();
      var $RangeError = require_range();
      var $ReferenceError = require_ref();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var $URIError = require_uri();
      var abs = require_abs();
      var floor = require_floor();
      var max = require_max();
      var min = require_min();
      var pow = require_pow();
      var round = require_round();
      var sign = require_sign();
      var $Function = Function;
      var getEvalledConstructor = function(expressionSyntax) {
        try {
          return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
        } catch (e) {
        }
      };
      var $gOPD = require_gopd();
      var $defineProperty = require_es_define_property();
      var throwTypeError = function() {
        throw new $TypeError();
      };
      var ThrowTypeError = $gOPD ? (function() {
        try {
          arguments.callee;
          return throwTypeError;
        } catch (calleeThrows) {
          try {
            return $gOPD(arguments, "callee").get;
          } catch (gOPDthrows) {
            return throwTypeError;
          }
        }
      })() : throwTypeError;
      var hasSymbols = require_has_symbols()();
      var getProto = require_get_proto();
      var $ObjectGPO = require_Object_getPrototypeOf();
      var $ReflectGPO = require_Reflect_getPrototypeOf();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var needsEval = {};
      var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
      var INTRINSICS = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
        "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
        "%AsyncFromSyncIteratorPrototype%": undefined2,
        "%AsyncFunction%": needsEval,
        "%AsyncGenerator%": needsEval,
        "%AsyncGeneratorFunction%": needsEval,
        "%AsyncIteratorPrototype%": needsEval,
        "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
        "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
        "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": $Error,
        "%eval%": eval,
        // eslint-disable-line no-eval
        "%EvalError%": $EvalError,
        "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
        "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
        "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
        "%Function%": $Function,
        "%GeneratorFunction%": needsEval,
        "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
        "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
        "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
        "%JSON%": typeof JSON === "object" ? JSON : undefined2,
        "%Map%": typeof Map === "undefined" ? undefined2 : Map,
        "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": $Object,
        "%Object.getOwnPropertyDescriptor%": $gOPD,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
        "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
        "%RangeError%": $RangeError,
        "%ReferenceError%": $ReferenceError,
        "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set === "undefined" ? undefined2 : Set,
        "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
        "%Symbol%": hasSymbols ? Symbol : undefined2,
        "%SyntaxError%": $SyntaxError,
        "%ThrowTypeError%": ThrowTypeError,
        "%TypedArray%": TypedArray,
        "%TypeError%": $TypeError,
        "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
        "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
        "%URIError%": $URIError,
        "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
        "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
        "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
        "%Function.prototype.call%": $call,
        "%Function.prototype.apply%": $apply,
        "%Object.defineProperty%": $defineProperty,
        "%Object.getPrototypeOf%": $ObjectGPO,
        "%Math.abs%": abs,
        "%Math.floor%": floor,
        "%Math.max%": max,
        "%Math.min%": min,
        "%Math.pow%": pow,
        "%Math.round%": round,
        "%Math.sign%": sign,
        "%Reflect.getPrototypeOf%": $ReflectGPO
      };
      if (getProto) {
        try {
          null.error;
        } catch (e) {
          errorProto = getProto(getProto(e));
          INTRINSICS["%Error.prototype%"] = errorProto;
        }
      }
      var errorProto;
      var doEval = function doEval2(name) {
        var value;
        if (name === "%AsyncFunction%") {
          value = getEvalledConstructor("async function () {}");
        } else if (name === "%GeneratorFunction%") {
          value = getEvalledConstructor("function* () {}");
        } else if (name === "%AsyncGeneratorFunction%") {
          value = getEvalledConstructor("async function* () {}");
        } else if (name === "%AsyncGenerator%") {
          var fn = doEval2("%AsyncGeneratorFunction%");
          if (fn) {
            value = fn.prototype;
          }
        } else if (name === "%AsyncIteratorPrototype%") {
          var gen = doEval2("%AsyncGenerator%");
          if (gen && getProto) {
            value = getProto(gen.prototype);
          }
        }
        INTRINSICS[name] = value;
        return value;
      };
      var LEGACY_ALIASES = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"]
      };
      var bind = require_function_bind();
      var hasOwn = require_hasown();
      var $concat = bind.call($call, Array.prototype.concat);
      var $spliceApply = bind.call($apply, Array.prototype.splice);
      var $replace = bind.call($call, String.prototype.replace);
      var $strSlice = bind.call($call, String.prototype.slice);
      var $exec = bind.call($call, RegExp.prototype.exec);
      var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = function stringToPath2(string) {
        var first = $strSlice(string, 0, 1);
        var last = $strSlice(string, -1);
        if (first === "%" && last !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
        } else if (last === "%" && first !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
        }
        var result = [];
        $replace(string, rePropName, function(match, number, quote, subString) {
          result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
        });
        return result;
      };
      var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
        var intrinsicName = name;
        var alias;
        if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
          alias = LEGACY_ALIASES[intrinsicName];
          intrinsicName = "%" + alias[0] + "%";
        }
        if (hasOwn(INTRINSICS, intrinsicName)) {
          var value = INTRINSICS[intrinsicName];
          if (value === needsEval) {
            value = doEval(intrinsicName);
          }
          if (typeof value === "undefined" && !allowMissing) {
            throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
          }
          return {
            alias,
            name: intrinsicName,
            value
          };
        }
        throw new $SyntaxError("intrinsic " + name + " does not exist!");
      };
      module.exports = function GetIntrinsic(name, allowMissing) {
        if (typeof name !== "string" || name.length === 0) {
          throw new $TypeError("intrinsic name must be a non-empty string");
        }
        if (arguments.length > 1 && typeof allowMissing !== "boolean") {
          throw new $TypeError('"allowMissing" argument must be a boolean');
        }
        if ($exec(/^%?[^%]*%?$/, name) === null) {
          throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        }
        var parts = stringToPath(name);
        var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
        var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
        var intrinsicRealName = intrinsic.name;
        var value = intrinsic.value;
        var skipFurtherCaching = false;
        var alias = intrinsic.alias;
        if (alias) {
          intrinsicBaseName = alias[0];
          $spliceApply(parts, $concat([0, 1], alias));
        }
        for (var i = 1, isOwn = true; i < parts.length; i += 1) {
          var part = parts[i];
          var first = $strSlice(part, 0, 1);
          var last = $strSlice(part, -1);
          if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
            throw new $SyntaxError("property names with quotes must have matching quotes");
          }
          if (part === "constructor" || !isOwn) {
            skipFurtherCaching = true;
          }
          intrinsicBaseName += "." + part;
          intrinsicRealName = "%" + intrinsicBaseName + "%";
          if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
          } else if (value != null) {
            if (!(part in value)) {
              if (!allowMissing) {
                throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
              }
              return void undefined2;
            }
            if ($gOPD && i + 1 >= parts.length) {
              var desc = $gOPD(value, part);
              isOwn = !!desc;
              if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                value = desc.get;
              } else {
                value = value[part];
              }
            } else {
              isOwn = hasOwn(value, part);
              value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
              INTRINSICS[intrinsicRealName] = value;
            }
          }
        }
        return value;
      };
    }
  });

  // node_modules/call-bound/index.js
  var require_call_bound = __commonJS({
    "node_modules/call-bound/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBindBasic = require_call_bind_apply_helpers();
      var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
      module.exports = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = (
          /** @type {(this: unknown, ...args: unknown[]) => unknown} */
          GetIntrinsic(name, !!allowMissing)
        );
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBindBasic(
            /** @type {const} */
            [intrinsic]
          );
        }
        return intrinsic;
      };
    }
  });

  // node_modules/side-channel-map/index.js
  var require_side_channel_map = __commonJS({
    "node_modules/side-channel-map/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBound = require_call_bound();
      var inspect = require_object_inspect();
      var $TypeError = require_type();
      var $Map = GetIntrinsic("%Map%", true);
      var $mapGet = callBound("Map.prototype.get", true);
      var $mapSet = callBound("Map.prototype.set", true);
      var $mapHas = callBound("Map.prototype.has", true);
      var $mapDelete = callBound("Map.prototype.delete", true);
      var $mapSize = callBound("Map.prototype.size", true);
      module.exports = !!$Map && /** @type {Exclude<import('.'), false>} */
      function getSideChannelMap() {
        var $m;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            if ($m) {
              var result = $mapDelete($m, key);
              if ($mapSize($m) === 0) {
                $m = void 0;
              }
              return result;
            }
            return false;
          },
          get: function(key) {
            if ($m) {
              return $mapGet($m, key);
            }
          },
          has: function(key) {
            if ($m) {
              return $mapHas($m, key);
            }
            return false;
          },
          set: function(key, value) {
            if (!$m) {
              $m = new $Map();
            }
            $mapSet($m, key, value);
          }
        };
        return channel;
      };
    }
  });

  // node_modules/side-channel-weakmap/index.js
  var require_side_channel_weakmap = __commonJS({
    "node_modules/side-channel-weakmap/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBound = require_call_bound();
      var inspect = require_object_inspect();
      var getSideChannelMap = require_side_channel_map();
      var $TypeError = require_type();
      var $WeakMap = GetIntrinsic("%WeakMap%", true);
      var $weakMapGet = callBound("WeakMap.prototype.get", true);
      var $weakMapSet = callBound("WeakMap.prototype.set", true);
      var $weakMapHas = callBound("WeakMap.prototype.has", true);
      var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
      module.exports = $WeakMap ? (
        /** @type {Exclude<import('.'), false>} */
        function getSideChannelWeakMap() {
          var $wm;
          var $m;
          var channel = {
            assert: function(key) {
              if (!channel.has(key)) {
                throw new $TypeError("Side channel does not contain " + inspect(key));
              }
            },
            "delete": function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapDelete($wm, key);
                }
              } else if (getSideChannelMap) {
                if ($m) {
                  return $m["delete"](key);
                }
              }
              return false;
            },
            get: function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapGet($wm, key);
                }
              }
              return $m && $m.get(key);
            },
            has: function(key) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if ($wm) {
                  return $weakMapHas($wm, key);
                }
              }
              return !!$m && $m.has(key);
            },
            set: function(key, value) {
              if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                if (!$wm) {
                  $wm = new $WeakMap();
                }
                $weakMapSet($wm, key, value);
              } else if (getSideChannelMap) {
                if (!$m) {
                  $m = getSideChannelMap();
                }
                $m.set(key, value);
              }
            }
          };
          return channel;
        }
      ) : getSideChannelMap;
    }
  });

  // node_modules/side-channel/index.js
  var require_side_channel = __commonJS({
    "node_modules/side-channel/index.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var inspect = require_object_inspect();
      var getSideChannelList = require_side_channel_list();
      var getSideChannelMap = require_side_channel_map();
      var getSideChannelWeakMap = require_side_channel_weakmap();
      var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;
      module.exports = function getSideChannel() {
        var $channelData;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            return !!$channelData && $channelData["delete"](key);
          },
          get: function(key) {
            return $channelData && $channelData.get(key);
          },
          has: function(key) {
            return !!$channelData && $channelData.has(key);
          },
          set: function(key, value) {
            if (!$channelData) {
              $channelData = makeChannel();
            }
            $channelData.set(key, value);
          }
        };
        return channel;
      };
    }
  });

  // node_modules/qs/lib/formats.js
  var require_formats = __commonJS({
    "node_modules/qs/lib/formats.js"(exports, module) {
      "use strict";
      var replace = String.prototype.replace;
      var percentTwenties = /%20/g;
      var Format = {
        RFC1738: "RFC1738",
        RFC3986: "RFC3986"
      };
      module.exports = {
        "default": Format.RFC3986,
        formatters: {
          RFC1738: function(value) {
            return replace.call(value, percentTwenties, "+");
          },
          RFC3986: function(value) {
            return String(value);
          }
        },
        RFC1738: Format.RFC1738,
        RFC3986: Format.RFC3986
      };
    }
  });

  // node_modules/qs/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/qs/lib/utils.js"(exports, module) {
      "use strict";
      var formats = require_formats();
      var getSideChannel = require_side_channel();
      var has = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray;
      var overflowChannel = getSideChannel();
      var markOverflow = function markOverflow2(obj, maxIndex) {
        overflowChannel.set(obj, maxIndex);
        return obj;
      };
      var isOverflow = function isOverflow2(obj) {
        return overflowChannel.has(obj);
      };
      var getMaxIndex = function getMaxIndex2(obj) {
        return overflowChannel.get(obj);
      };
      var setMaxIndex = function setMaxIndex2(obj, maxIndex) {
        overflowChannel.set(obj, maxIndex);
      };
      var hexTable = (function() {
        var array = [];
        for (var i = 0; i < 256; ++i) {
          array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
        }
        return array;
      })();
      var compactQueue = function compactQueue2(queue) {
        while (queue.length > 1) {
          var item = queue.pop();
          var obj = item.obj[item.prop];
          if (isArray(obj)) {
            var compacted = [];
            for (var j = 0; j < obj.length; ++j) {
              if (typeof obj[j] !== "undefined") {
                compacted.push(obj[j]);
              }
            }
            item.obj[item.prop] = compacted;
          }
        }
      };
      var arrayToObject = function arrayToObject2(source, options) {
        var obj = options && options.plainObjects ? { __proto__: null } : {};
        for (var i = 0; i < source.length; ++i) {
          if (typeof source[i] !== "undefined") {
            obj[i] = source[i];
          }
        }
        return obj;
      };
      var merge = function merge2(target, source, options) {
        if (!source) {
          return target;
        }
        if (typeof source !== "object" && typeof source !== "function") {
          if (isArray(target)) {
            target.push(source);
          } else if (target && typeof target === "object") {
            if (isOverflow(target)) {
              var newIndex = getMaxIndex(target) + 1;
              target[newIndex] = source;
              setMaxIndex(target, newIndex);
            } else if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
              target[source] = true;
            }
          } else {
            return [target, source];
          }
          return target;
        }
        if (!target || typeof target !== "object") {
          if (isOverflow(source)) {
            var sourceKeys = Object.keys(source);
            var result = options && options.plainObjects ? { __proto__: null, 0: target } : { 0: target };
            for (var m2 = 0; m2 < sourceKeys.length; m2++) {
              var oldKey = parseInt(sourceKeys[m2], 10);
              result[oldKey + 1] = source[sourceKeys[m2]];
            }
            return markOverflow(result, getMaxIndex(source) + 1);
          }
          return [target].concat(source);
        }
        var mergeTarget = target;
        if (isArray(target) && !isArray(source)) {
          mergeTarget = arrayToObject(target, options);
        }
        if (isArray(target) && isArray(source)) {
          source.forEach(function(item, i) {
            if (has.call(target, i)) {
              var targetItem = target[i];
              if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
                target[i] = merge2(targetItem, item, options);
              } else {
                target.push(item);
              }
            } else {
              target[i] = item;
            }
          });
          return target;
        }
        return Object.keys(source).reduce(function(acc, key) {
          var value = source[key];
          if (has.call(acc, key)) {
            acc[key] = merge2(acc[key], value, options);
          } else {
            acc[key] = value;
          }
          return acc;
        }, mergeTarget);
      };
      var assign = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function(acc, key) {
          acc[key] = source[key];
          return acc;
        }, target);
      };
      var decode = function(str, defaultDecoder, charset) {
        var strWithoutPlus = str.replace(/\+/g, " ");
        if (charset === "iso-8859-1") {
          return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        try {
          return decodeURIComponent(strWithoutPlus);
        } catch (e) {
          return strWithoutPlus;
        }
      };
      var limit = 1024;
      var encode = function encode2(str, defaultEncoder, charset, kind, format) {
        if (str.length === 0) {
          return str;
        }
        var string = str;
        if (typeof str === "symbol") {
          string = Symbol.prototype.toString.call(str);
        } else if (typeof str !== "string") {
          string = String(str);
        }
        if (charset === "iso-8859-1") {
          return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
            return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
          });
        }
        var out = "";
        for (var j = 0; j < string.length; j += limit) {
          var segment = string.length >= limit ? string.slice(j, j + limit) : string;
          var arr = [];
          for (var i = 0; i < segment.length; ++i) {
            var c = segment.charCodeAt(i);
            if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
              arr[arr.length] = segment.charAt(i);
              continue;
            }
            if (c < 128) {
              arr[arr.length] = hexTable[c];
              continue;
            }
            if (c < 2048) {
              arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
              continue;
            }
            if (c < 55296 || c >= 57344) {
              arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
              continue;
            }
            i += 1;
            c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
            arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
          }
          out += arr.join("");
        }
        return out;
      };
      var compact = function compact2(value) {
        var queue = [{ obj: { o: value }, prop: "o" }];
        var refs = [];
        for (var i = 0; i < queue.length; ++i) {
          var item = queue[i];
          var obj = item.obj[item.prop];
          var keys = Object.keys(obj);
          for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
              queue.push({ obj, prop: key });
              refs.push(val);
            }
          }
        }
        compactQueue(queue);
        return value;
      };
      var isRegExp = function isRegExp2(obj) {
        return Object.prototype.toString.call(obj) === "[object RegExp]";
      };
      var isBuffer = function isBuffer2(obj) {
        if (!obj || typeof obj !== "object") {
          return false;
        }
        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
      };
      var combine = function combine2(a, b, arrayLimit, plainObjects) {
        if (isOverflow(a)) {
          var newIndex = getMaxIndex(a) + 1;
          a[newIndex] = b;
          setMaxIndex(a, newIndex);
          return a;
        }
        var result = [].concat(a, b);
        if (result.length > arrayLimit) {
          return markOverflow(arrayToObject(result, { plainObjects }), result.length - 1);
        }
        return result;
      };
      var maybeMap = function maybeMap2(val, fn) {
        if (isArray(val)) {
          var mapped = [];
          for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
          }
          return mapped;
        }
        return fn(val);
      };
      module.exports = {
        arrayToObject,
        assign,
        combine,
        compact,
        decode,
        encode,
        isBuffer,
        isOverflow,
        isRegExp,
        maybeMap,
        merge
      };
    }
  });

  // node_modules/qs/lib/stringify.js
  var require_stringify = __commonJS({
    "node_modules/qs/lib/stringify.js"(exports, module) {
      "use strict";
      var getSideChannel = require_side_channel();
      var utils = require_utils();
      var formats = require_formats();
      var has = Object.prototype.hasOwnProperty;
      var arrayPrefixGenerators = {
        brackets: function brackets(prefix) {
          return prefix + "[]";
        },
        comma: "comma",
        indices: function indices(prefix, key) {
          return prefix + "[" + key + "]";
        },
        repeat: function repeat(prefix) {
          return prefix;
        }
      };
      var isArray = Array.isArray;
      var push = Array.prototype.push;
      var pushToArray = function(arr, valueOrArray) {
        push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
      };
      var toISO = Date.prototype.toISOString;
      var defaultFormat = formats["default"];
      var defaults = {
        addQueryPrefix: false,
        allowDots: false,
        allowEmptyArrays: false,
        arrayFormat: "indices",
        charset: "utf-8",
        charsetSentinel: false,
        commaRoundTrip: false,
        delimiter: "&",
        encode: true,
        encodeDotInKeys: false,
        encoder: utils.encode,
        encodeValuesOnly: false,
        filter: void 0,
        format: defaultFormat,
        formatter: formats.formatters[defaultFormat],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) {
          return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
      };
      var isNonNullishPrimitive = function isNonNullishPrimitive2(v2) {
        return typeof v2 === "string" || typeof v2 === "number" || typeof v2 === "boolean" || typeof v2 === "symbol" || typeof v2 === "bigint";
      };
      var sentinel = {};
      var stringify = function stringify2(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
        var obj = object;
        var tmpSc = sideChannel;
        var step = 0;
        var findFlag = false;
        while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
          var pos = tmpSc.get(object);
          step += 1;
          if (typeof pos !== "undefined") {
            if (pos === step) {
              throw new RangeError("Cyclic object value");
            } else {
              findFlag = true;
            }
          }
          if (typeof tmpSc.get(sentinel) === "undefined") {
            step = 0;
          }
        }
        if (typeof filter === "function") {
          obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
          obj = serializeDate(obj);
        } else if (generateArrayPrefix === "comma" && isArray(obj)) {
          obj = utils.maybeMap(obj, function(value2) {
            if (value2 instanceof Date) {
              return serializeDate(value2);
            }
            return value2;
          });
        }
        if (obj === null) {
          if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
          }
          obj = "";
        }
        if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
          if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
            return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
          }
          return [formatter(prefix) + "=" + formatter(String(obj))];
        }
        var values = [];
        if (typeof obj === "undefined") {
          return values;
        }
        var objKeys;
        if (generateArrayPrefix === "comma" && isArray(obj)) {
          if (encodeValuesOnly && encoder) {
            obj = utils.maybeMap(obj, encoder);
          }
          objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
        } else if (isArray(filter)) {
          objKeys = filter;
        } else {
          var keys = Object.keys(obj);
          objKeys = sort ? keys.sort(sort) : keys;
        }
        var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
        var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
        if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
          return adjustedPrefix + "[]";
        }
        for (var j = 0; j < objKeys.length; ++j) {
          var key = objKeys[j];
          var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
          if (skipNulls && value === null) {
            continue;
          }
          var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
          var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
          sideChannel.set(object, step);
          var valueSideChannel = getSideChannel();
          valueSideChannel.set(sentinel, sideChannel);
          pushToArray(values, stringify2(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            allowEmptyArrays,
            strictNullHandling,
            skipNulls,
            encodeDotInKeys,
            generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
          ));
        }
        return values;
      };
      var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
          throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        }
        if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
          throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
        }
        if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
          throw new TypeError("Encoder has to be a function.");
        }
        var charset = opts.charset || defaults.charset;
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        var format = formats["default"];
        if (typeof opts.format !== "undefined") {
          if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError("Unknown format option provided.");
          }
          format = opts.format;
        }
        var formatter = formats.formatters[format];
        var filter = defaults.filter;
        if (typeof opts.filter === "function" || isArray(opts.filter)) {
          filter = opts.filter;
        }
        var arrayFormat;
        if (opts.arrayFormat in arrayPrefixGenerators) {
          arrayFormat = opts.arrayFormat;
        } else if ("indices" in opts) {
          arrayFormat = opts.indices ? "indices" : "repeat";
        } else {
          arrayFormat = defaults.arrayFormat;
        }
        if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
          throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
        }
        var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
        return {
          addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
          allowDots,
          allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
          arrayFormat,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          commaRoundTrip: !!opts.commaRoundTrip,
          delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
          encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
          encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
          encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
          encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
          filter,
          format,
          formatter,
          serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
          skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
          sort: typeof opts.sort === "function" ? opts.sort : null,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
        };
      };
      module.exports = function(object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);
        var objKeys;
        var filter;
        if (typeof options.filter === "function") {
          filter = options.filter;
          obj = filter("", obj);
        } else if (isArray(options.filter)) {
          filter = options.filter;
          objKeys = filter;
        }
        var keys = [];
        if (typeof obj !== "object" || obj === null) {
          return "";
        }
        var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
        var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
        if (!objKeys) {
          objKeys = Object.keys(obj);
        }
        if (options.sort) {
          objKeys.sort(options.sort);
        }
        var sideChannel = getSideChannel();
        for (var i = 0; i < objKeys.length; ++i) {
          var key = objKeys[i];
          var value = obj[key];
          if (options.skipNulls && value === null) {
            continue;
          }
          pushToArray(keys, stringify(
            value,
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.allowEmptyArrays,
            options.strictNullHandling,
            options.skipNulls,
            options.encodeDotInKeys,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
          ));
        }
        var joined = keys.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? "?" : "";
        if (options.charsetSentinel) {
          if (options.charset === "iso-8859-1") {
            prefix += "utf8=%26%2310003%3B&";
          } else {
            prefix += "utf8=%E2%9C%93&";
          }
        }
        return joined.length > 0 ? prefix + joined : "";
      };
    }
  });

  // node_modules/qs/lib/parse.js
  var require_parse = __commonJS({
    "node_modules/qs/lib/parse.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var has = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray;
      var defaults = {
        allowDots: false,
        allowEmptyArrays: false,
        allowPrototypes: false,
        allowSparse: false,
        arrayLimit: 20,
        charset: "utf-8",
        charsetSentinel: false,
        comma: false,
        decodeDotInKeys: false,
        decoder: utils.decode,
        delimiter: "&",
        depth: 5,
        duplicates: "combine",
        ignoreQueryPrefix: false,
        interpretNumericEntities: false,
        parameterLimit: 1e3,
        parseArrays: true,
        plainObjects: false,
        strictDepth: false,
        strictNullHandling: false,
        throwOnLimitExceeded: false
      };
      var interpretNumericEntities = function(str) {
        return str.replace(/&#(\d+);/g, function($0, numberStr) {
          return String.fromCharCode(parseInt(numberStr, 10));
        });
      };
      var parseArrayValue = function(val, options, currentArrayLength) {
        if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
          return val.split(",");
        }
        if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
          throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
        }
        return val;
      };
      var isoSentinel = "utf8=%26%2310003%3B";
      var charsetSentinel = "utf8=%E2%9C%93";
      var parseValues = function parseQueryStringValues(str, options) {
        var obj = { __proto__: null };
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
        cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
        var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
        var parts = cleanStr.split(
          options.delimiter,
          options.throwOnLimitExceeded ? limit + 1 : limit
        );
        if (options.throwOnLimitExceeded && parts.length > limit) {
          throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
        }
        var skipIndex = -1;
        var i;
        var charset = options.charset;
        if (options.charsetSentinel) {
          for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf("utf8=") === 0) {
              if (parts[i] === charsetSentinel) {
                charset = "utf-8";
              } else if (parts[i] === isoSentinel) {
                charset = "iso-8859-1";
              }
              skipIndex = i;
              i = parts.length;
            }
          }
        }
        for (i = 0; i < parts.length; ++i) {
          if (i === skipIndex) {
            continue;
          }
          var part = parts[i];
          var bracketEqualsPos = part.indexOf("]=");
          var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
          var key;
          var val;
          if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, "key");
            val = options.strictNullHandling ? null : "";
          } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
            if (key !== null) {
              val = utils.maybeMap(
                parseArrayValue(
                  part.slice(pos + 1),
                  options,
                  isArray(obj[key]) ? obj[key].length : 0
                ),
                function(encodedVal) {
                  return options.decoder(encodedVal, defaults.decoder, charset, "value");
                }
              );
            }
          }
          if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
            val = interpretNumericEntities(String(val));
          }
          if (part.indexOf("[]=") > -1) {
            val = isArray(val) ? [val] : val;
          }
          if (key !== null) {
            var existing = has.call(obj, key);
            if (existing && options.duplicates === "combine") {
              obj[key] = utils.combine(
                obj[key],
                val,
                options.arrayLimit,
                options.plainObjects
              );
            } else if (!existing || options.duplicates === "last") {
              obj[key] = val;
            }
          }
        }
        return obj;
      };
      var parseObject = function(chain, val, options, valuesParsed) {
        var currentArrayLength = 0;
        if (chain.length > 0 && chain[chain.length - 1] === "[]") {
          var parentKey = chain.slice(0, -1).join("");
          currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
        }
        var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
        for (var i = chain.length - 1; i >= 0; --i) {
          var obj;
          var root = chain[i];
          if (root === "[]" && options.parseArrays) {
            if (utils.isOverflow(leaf)) {
              obj = leaf;
            } else {
              obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils.combine(
                [],
                leaf,
                options.arrayLimit,
                options.plainObjects
              );
            }
          } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === "") {
              obj = { 0: leaf };
            } else if (!isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && (options.parseArrays && index <= options.arrayLimit)) {
              obj = [];
              obj[index] = leaf;
            } else if (decodedRoot !== "__proto__") {
              obj[decodedRoot] = leaf;
            }
          }
          leaf = obj;
        }
        return leaf;
      };
      var splitKeyIntoSegments = function splitKeyIntoSegments2(givenKey, options) {
        var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
        if (options.depth <= 0) {
          if (!options.plainObjects && has.call(Object.prototype, key)) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          return [key];
        }
        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;
        var segment = brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;
        var keys = [];
        if (parent) {
          if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys.push(parent);
        }
        var i = 0;
        while ((segment = child.exec(key)) !== null && i < options.depth) {
          i += 1;
          var segmentContent = segment[1].slice(1, -1);
          if (!options.plainObjects && has.call(Object.prototype, segmentContent)) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys.push(segment[1]);
        }
        if (segment) {
          if (options.strictDepth === true) {
            throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
          }
          keys.push("[" + key.slice(segment.index) + "]");
        }
        return keys;
      };
      var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
        if (!givenKey) {
          return;
        }
        var keys = splitKeyIntoSegments(givenKey, options);
        if (!keys) {
          return;
        }
        return parseObject(keys, val, options, valuesParsed);
      };
      var normalizeParseOptions = function normalizeParseOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
          throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        }
        if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
          throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
        }
        if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
          throw new TypeError("Decoder has to be a function.");
        }
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
          throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
        }
        var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
        var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
        if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
          throw new TypeError("The duplicates option must be either combine, first, or last");
        }
        var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
        return {
          allowDots,
          allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
          allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
          allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
          arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
          decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
          decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
          delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
          // eslint-disable-next-line no-implicit-coercion, no-extra-parens
          depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
          duplicates,
          ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
          interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
          parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
          parseArrays: opts.parseArrays !== false,
          plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
          strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
          throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
        };
      };
      module.exports = function(str, opts) {
        var options = normalizeParseOptions(opts);
        if (str === "" || str === null || typeof str === "undefined") {
          return options.plainObjects ? { __proto__: null } : {};
        }
        var tempObj = typeof str === "string" ? parseValues(str, options) : str;
        var obj = options.plainObjects ? { __proto__: null } : {};
        var keys = Object.keys(tempObj);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
          obj = utils.merge(obj, newObj, options);
        }
        if (options.allowSparse === true) {
          return obj;
        }
        return utils.compact(obj);
      };
    }
  });

  // node_modules/qs/lib/index.js
  var require_lib = __commonJS({
    "node_modules/qs/lib/index.js"(exports, module) {
      "use strict";
      var stringify = require_stringify();
      var parse2 = require_parse();
      var formats = require_formats();
      module.exports = {
        formats,
        parse: parse2,
        stringify
      };
    }
  });

  // node_modules/requires-port/index.js
  var require_requires_port = __commonJS({
    "node_modules/requires-port/index.js"(exports, module) {
      "use strict";
      module.exports = function required(port, protocol) {
        protocol = protocol.split(":")[0];
        port = +port;
        if (!port) return false;
        switch (protocol) {
          case "http":
          case "ws":
            return port !== 80;
          case "https":
          case "wss":
            return port !== 443;
          case "ftp":
            return port !== 21;
          case "gopher":
            return port !== 70;
          case "file":
            return false;
        }
        return port !== 0;
      };
    }
  });

  // node_modules/querystringify/index.js
  var require_querystringify = __commonJS({
    "node_modules/querystringify/index.js"(exports) {
      "use strict";
      var has = Object.prototype.hasOwnProperty;
      var undef;
      function decode(input) {
        try {
          return decodeURIComponent(input.replace(/\+/g, " "));
        } catch (e) {
          return null;
        }
      }
      function encode(input) {
        try {
          return encodeURIComponent(input);
        } catch (e) {
          return null;
        }
      }
      function querystring(query) {
        var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
        while (part = parser.exec(query)) {
          var key = decode(part[1]), value = decode(part[2]);
          if (key === null || value === null || key in result) continue;
          result[key] = value;
        }
        return result;
      }
      function querystringify(obj, prefix) {
        prefix = prefix || "";
        var pairs = [], value, key;
        if ("string" !== typeof prefix) prefix = "?";
        for (key in obj) {
          if (has.call(obj, key)) {
            value = obj[key];
            if (!value && (value === null || value === undef || isNaN(value))) {
              value = "";
            }
            key = encode(key);
            value = encode(value);
            if (key === null || value === null) continue;
            pairs.push(key + "=" + value);
          }
        }
        return pairs.length ? prefix + pairs.join("&") : "";
      }
      exports.stringify = querystringify;
      exports.parse = querystring;
    }
  });

  // node_modules/url-parse/index.js
  var require_url_parse = __commonJS({
    "node_modules/url-parse/index.js"(exports, module) {
      "use strict";
      var required = require_requires_port();
      var qs2 = require_querystringify();
      var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
      var CRHTLF = /[\n\r\t]/g;
      var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
      var port = /:\d+$/;
      var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
      var windowsDriveLetter = /^[a-zA-Z]:/;
      function trimLeft(str) {
        return (str ? str : "").toString().replace(controlOrWhitespace, "");
      }
      var rules = [
        ["#", "hash"],
        // Extract from the back.
        ["?", "query"],
        // Extract from the back.
        function sanitize(address, url) {
          return isSpecial(url.protocol) ? address.replace(/\\/g, "/") : address;
        },
        ["/", "pathname"],
        // Extract from the back.
        ["@", "auth", 1],
        // Extract from the front.
        [NaN, "host", void 0, 1, 1],
        // Set left over value.
        [/:(\d*)$/, "port", void 0, 1],
        // RegExp the back.
        [NaN, "hostname", void 0, 1, 1]
        // Set left over.
      ];
      var ignore = { hash: 1, query: 1 };
      function lolcation(loc) {
        var globalVar;
        if (typeof window !== "undefined") globalVar = window;
        else if (typeof global !== "undefined") globalVar = global;
        else if (typeof self !== "undefined") globalVar = self;
        else globalVar = {};
        var location = globalVar.location || {};
        loc = loc || location;
        var finaldestination = {}, type = typeof loc, key;
        if ("blob:" === loc.protocol) {
          finaldestination = new Url(unescape(loc.pathname), {});
        } else if ("string" === type) {
          finaldestination = new Url(loc, {});
          for (key in ignore) delete finaldestination[key];
        } else if ("object" === type) {
          for (key in loc) {
            if (key in ignore) continue;
            finaldestination[key] = loc[key];
          }
          if (finaldestination.slashes === void 0) {
            finaldestination.slashes = slashes.test(loc.href);
          }
        }
        return finaldestination;
      }
      function isSpecial(scheme) {
        return scheme === "file:" || scheme === "ftp:" || scheme === "http:" || scheme === "https:" || scheme === "ws:" || scheme === "wss:";
      }
      function extractProtocol(address, location) {
        address = trimLeft(address);
        address = address.replace(CRHTLF, "");
        location = location || {};
        var match = protocolre.exec(address);
        var protocol = match[1] ? match[1].toLowerCase() : "";
        var forwardSlashes = !!match[2];
        var otherSlashes = !!match[3];
        var slashesCount = 0;
        var rest;
        if (forwardSlashes) {
          if (otherSlashes) {
            rest = match[2] + match[3] + match[4];
            slashesCount = match[2].length + match[3].length;
          } else {
            rest = match[2] + match[4];
            slashesCount = match[2].length;
          }
        } else {
          if (otherSlashes) {
            rest = match[3] + match[4];
            slashesCount = match[3].length;
          } else {
            rest = match[4];
          }
        }
        if (protocol === "file:") {
          if (slashesCount >= 2) {
            rest = rest.slice(2);
          }
        } else if (isSpecial(protocol)) {
          rest = match[4];
        } else if (protocol) {
          if (forwardSlashes) {
            rest = rest.slice(2);
          }
        } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
          rest = match[4];
        }
        return {
          protocol,
          slashes: forwardSlashes || isSpecial(protocol),
          slashesCount,
          rest
        };
      }
      function resolve(relative, base2) {
        if (relative === "") return base2;
        var path = (base2 || "/").split("/").slice(0, -1).concat(relative.split("/")), i = path.length, last = path[i - 1], unshift = false, up = 0;
        while (i--) {
          if (path[i] === ".") {
            path.splice(i, 1);
          } else if (path[i] === "..") {
            path.splice(i, 1);
            up++;
          } else if (up) {
            if (i === 0) unshift = true;
            path.splice(i, 1);
            up--;
          }
        }
        if (unshift) path.unshift("");
        if (last === "." || last === "..") path.push("");
        return path.join("/");
      }
      function Url(address, location, parser) {
        address = trimLeft(address);
        address = address.replace(CRHTLF, "");
        if (!(this instanceof Url)) {
          return new Url(address, location, parser);
        }
        var relative, extracted, parse2, instruction, index, key, instructions = rules.slice(), type = typeof location, url = this, i = 0;
        if ("object" !== type && "string" !== type) {
          parser = location;
          location = null;
        }
        if (parser && "function" !== typeof parser) parser = qs2.parse;
        location = lolcation(location);
        extracted = extractProtocol(address || "", location);
        relative = !extracted.protocol && !extracted.slashes;
        url.slashes = extracted.slashes || relative && location.slashes;
        url.protocol = extracted.protocol || location.protocol || "";
        address = extracted.rest;
        if (extracted.protocol === "file:" && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
          instructions[3] = [/(.*)/, "pathname"];
        }
        for (; i < instructions.length; i++) {
          instruction = instructions[i];
          if (typeof instruction === "function") {
            address = instruction(address, url);
            continue;
          }
          parse2 = instruction[0];
          key = instruction[1];
          if (parse2 !== parse2) {
            url[key] = address;
          } else if ("string" === typeof parse2) {
            index = parse2 === "@" ? address.lastIndexOf(parse2) : address.indexOf(parse2);
            if (~index) {
              if ("number" === typeof instruction[2]) {
                url[key] = address.slice(0, index);
                address = address.slice(index + instruction[2]);
              } else {
                url[key] = address.slice(index);
                address = address.slice(0, index);
              }
            }
          } else if (index = parse2.exec(address)) {
            url[key] = index[1];
            address = address.slice(0, index.index);
          }
          url[key] = url[key] || (relative && instruction[3] ? location[key] || "" : "");
          if (instruction[4]) url[key] = url[key].toLowerCase();
        }
        if (parser) url.query = parser(url.query);
        if (relative && location.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location.pathname !== "")) {
          url.pathname = resolve(url.pathname, location.pathname);
        }
        if (url.pathname.charAt(0) !== "/" && isSpecial(url.protocol)) {
          url.pathname = "/" + url.pathname;
        }
        if (!required(url.port, url.protocol)) {
          url.host = url.hostname;
          url.port = "";
        }
        url.username = url.password = "";
        if (url.auth) {
          index = url.auth.indexOf(":");
          if (~index) {
            url.username = url.auth.slice(0, index);
            url.username = encodeURIComponent(decodeURIComponent(url.username));
            url.password = url.auth.slice(index + 1);
            url.password = encodeURIComponent(decodeURIComponent(url.password));
          } else {
            url.username = encodeURIComponent(decodeURIComponent(url.auth));
          }
          url.auth = url.password ? url.username + ":" + url.password : url.username;
        }
        url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
        url.href = url.toString();
      }
      function set(part, value, fn) {
        var url = this;
        switch (part) {
          case "query":
            if ("string" === typeof value && value.length) {
              value = (fn || qs2.parse)(value);
            }
            url[part] = value;
            break;
          case "port":
            url[part] = value;
            if (!required(value, url.protocol)) {
              url.host = url.hostname;
              url[part] = "";
            } else if (value) {
              url.host = url.hostname + ":" + value;
            }
            break;
          case "hostname":
            url[part] = value;
            if (url.port) value += ":" + url.port;
            url.host = value;
            break;
          case "host":
            url[part] = value;
            if (port.test(value)) {
              value = value.split(":");
              url.port = value.pop();
              url.hostname = value.join(":");
            } else {
              url.hostname = value;
              url.port = "";
            }
            break;
          case "protocol":
            url.protocol = value.toLowerCase();
            url.slashes = !fn;
            break;
          case "pathname":
          case "hash":
            if (value) {
              var char = part === "pathname" ? "/" : "#";
              url[part] = value.charAt(0) !== char ? char + value : value;
            } else {
              url[part] = value;
            }
            break;
          case "username":
          case "password":
            url[part] = encodeURIComponent(value);
            break;
          case "auth":
            var index = value.indexOf(":");
            if (~index) {
              url.username = value.slice(0, index);
              url.username = encodeURIComponent(decodeURIComponent(url.username));
              url.password = value.slice(index + 1);
              url.password = encodeURIComponent(decodeURIComponent(url.password));
            } else {
              url.username = encodeURIComponent(decodeURIComponent(value));
            }
        }
        for (var i = 0; i < rules.length; i++) {
          var ins = rules[i];
          if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
        }
        url.auth = url.password ? url.username + ":" + url.password : url.username;
        url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
        url.href = url.toString();
        return url;
      }
      function toString(stringify) {
        if (!stringify || "function" !== typeof stringify) stringify = qs2.stringify;
        var query, url = this, host = url.host, protocol = url.protocol;
        if (protocol && protocol.charAt(protocol.length - 1) !== ":") protocol += ":";
        var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? "//" : "");
        if (url.username) {
          result += url.username;
          if (url.password) result += ":" + url.password;
          result += "@";
        } else if (url.password) {
          result += ":" + url.password;
          result += "@";
        } else if (url.protocol !== "file:" && isSpecial(url.protocol) && !host && url.pathname !== "/") {
          result += "@";
        }
        if (host[host.length - 1] === ":" || port.test(url.hostname) && !url.port) {
          host += ":";
        }
        result += host + url.pathname;
        query = "object" === typeof url.query ? stringify(url.query) : url.query;
        if (query) result += "?" !== query.charAt(0) ? "?" + query : query;
        if (url.hash) result += url.hash;
        return result;
      }
      Url.prototype = { set, toString };
      Url.extractProtocol = extractProtocol;
      Url.location = lolcation;
      Url.trimLeft = trimLeft;
      Url.qs = qs2;
      module.exports = Url;
    }
  });

  // node_modules/dayjs/dayjs.min.js
  var require_dayjs_min = __commonJS({
    "node_modules/dayjs/dayjs.min.js"(exports, module) {
      !(function(t, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
      })(exports, (function() {
        "use strict";
        var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o2 = "week", c = "month", f = "quarter", h2 = "year", d2 = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y2 = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
          var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
          return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
        } }, m2 = function(t2, e2, n2) {
          var r2 = String(t2);
          return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
        }, v2 = { s: m2, z: function(t2) {
          var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
          return (e2 <= 0 ? "+" : "-") + m2(r2, 2, "0") + ":" + m2(i2, 2, "0");
        }, m: function t2(e2, n2) {
          if (e2.date() < n2.date()) return -t2(n2, e2);
          var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
          return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
        }, a: function(t2) {
          return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
        }, p: function(t2) {
          return { M: c, y: h2, w: o2, d: a, D: d2, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
        }, u: function(t2) {
          return void 0 === t2;
        } }, g2 = "en", D2 = {};
        D2[g2] = M;
        var p = "$isDayjsObject", S = function(t2) {
          return t2 instanceof _2 || !(!t2 || !t2[p]);
        }, w = function t2(e2, n2, r2) {
          var i2;
          if (!e2) return g2;
          if ("string" == typeof e2) {
            var s2 = e2.toLowerCase();
            D2[s2] && (i2 = s2), n2 && (D2[s2] = n2, i2 = s2);
            var u2 = e2.split("-");
            if (!i2 && u2.length > 1) return t2(u2[0]);
          } else {
            var a2 = e2.name;
            D2[a2] = e2, i2 = a2;
          }
          return !r2 && i2 && (g2 = i2), i2 || !r2 && g2;
        }, O = function(t2, e2) {
          if (S(t2)) return t2.clone();
          var n2 = "object" == typeof e2 ? e2 : {};
          return n2.date = t2, n2.args = arguments, new _2(n2);
        }, b = v2;
        b.l = w, b.i = S, b.w = function(t2, e2) {
          return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
        };
        var _2 = (function() {
          function M2(t2) {
            this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
          }
          var m3 = M2.prototype;
          return m3.parse = function(t2) {
            this.$d = (function(t3) {
              var e2 = t3.date, n2 = t3.utc;
              if (null === e2) return /* @__PURE__ */ new Date(NaN);
              if (b.u(e2)) return /* @__PURE__ */ new Date();
              if (e2 instanceof Date) return new Date(e2);
              if ("string" == typeof e2 && !/Z$/i.test(e2)) {
                var r2 = e2.match($);
                if (r2) {
                  var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                  return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                }
              }
              return new Date(e2);
            })(t2), this.init();
          }, m3.init = function() {
            var t2 = this.$d;
            this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
          }, m3.$utils = function() {
            return b;
          }, m3.isValid = function() {
            return !(this.$d.toString() === l);
          }, m3.isSame = function(t2, e2) {
            var n2 = O(t2);
            return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
          }, m3.isAfter = function(t2, e2) {
            return O(t2) < this.startOf(e2);
          }, m3.isBefore = function(t2, e2) {
            return this.endOf(e2) < O(t2);
          }, m3.$g = function(t2, e2, n2) {
            return b.u(t2) ? this[e2] : this.set(n2, t2);
          }, m3.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
          }, m3.valueOf = function() {
            return this.$d.getTime();
          }, m3.startOf = function(t2, e2) {
            var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
              var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
              return r2 ? i2 : i2.endOf(a);
            }, $2 = function(t3, e3) {
              return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
            }, y3 = this.$W, M3 = this.$M, m4 = this.$D, v3 = "set" + (this.$u ? "UTC" : "");
            switch (f2) {
              case h2:
                return r2 ? l2(1, 0) : l2(31, 11);
              case c:
                return r2 ? l2(1, M3) : l2(0, M3 + 1);
              case o2:
                var g3 = this.$locale().weekStart || 0, D3 = (y3 < g3 ? y3 + 7 : y3) - g3;
                return l2(r2 ? m4 - D3 : m4 + (6 - D3), M3);
              case a:
              case d2:
                return $2(v3 + "Hours", 0);
              case u:
                return $2(v3 + "Minutes", 1);
              case s:
                return $2(v3 + "Seconds", 2);
              case i:
                return $2(v3 + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }, m3.endOf = function(t2) {
            return this.startOf(t2, false);
          }, m3.$set = function(t2, e2) {
            var n2, o3 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d2] = f2 + "Date", n2[c] = f2 + "Month", n2[h2] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o3], $2 = o3 === a ? this.$D + (e2 - this.$W) : e2;
            if (o3 === c || o3 === h2) {
              var y3 = this.clone().set(d2, 1);
              y3.$d[l2]($2), y3.init(), this.$d = y3.set(d2, Math.min(this.$D, y3.daysInMonth())).$d;
            } else l2 && this.$d[l2]($2);
            return this.init(), this;
          }, m3.set = function(t2, e2) {
            return this.clone().$set(t2, e2);
          }, m3.get = function(t2) {
            return this[b.p(t2)]();
          }, m3.add = function(r2, f2) {
            var d3, l2 = this;
            r2 = Number(r2);
            var $2 = b.p(f2), y3 = function(t2) {
              var e2 = O(l2);
              return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
            };
            if ($2 === c) return this.set(c, this.$M + r2);
            if ($2 === h2) return this.set(h2, this.$y + r2);
            if ($2 === a) return y3(1);
            if ($2 === o2) return y3(7);
            var M3 = (d3 = {}, d3[s] = e, d3[u] = n, d3[i] = t, d3)[$2] || 1, m4 = this.$d.getTime() + r2 * M3;
            return b.w(m4, this);
          }, m3.subtract = function(t2, e2) {
            return this.add(-1 * t2, e2);
          }, m3.format = function(t2) {
            var e2 = this, n2 = this.$locale();
            if (!this.isValid()) return n2.invalidDate || l;
            var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o3 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h3 = function(t3, n3, i3, s3) {
              return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
            }, d3 = function(t3) {
              return b.s(s2 % 12 || 12, t3, "0");
            }, $2 = f2 || function(t3, e3, n3) {
              var r3 = t3 < 12 ? "AM" : "PM";
              return n3 ? r3.toLowerCase() : r3;
            };
            return r2.replace(y2, (function(t3, r3) {
              return r3 || (function(t4) {
                switch (t4) {
                  case "YY":
                    return String(e2.$y).slice(-2);
                  case "YYYY":
                    return b.s(e2.$y, 4, "0");
                  case "M":
                    return a2 + 1;
                  case "MM":
                    return b.s(a2 + 1, 2, "0");
                  case "MMM":
                    return h3(n2.monthsShort, a2, c2, 3);
                  case "MMMM":
                    return h3(c2, a2);
                  case "D":
                    return e2.$D;
                  case "DD":
                    return b.s(e2.$D, 2, "0");
                  case "d":
                    return String(e2.$W);
                  case "dd":
                    return h3(n2.weekdaysMin, e2.$W, o3, 2);
                  case "ddd":
                    return h3(n2.weekdaysShort, e2.$W, o3, 3);
                  case "dddd":
                    return o3[e2.$W];
                  case "H":
                    return String(s2);
                  case "HH":
                    return b.s(s2, 2, "0");
                  case "h":
                    return d3(1);
                  case "hh":
                    return d3(2);
                  case "a":
                    return $2(s2, u2, true);
                  case "A":
                    return $2(s2, u2, false);
                  case "m":
                    return String(u2);
                  case "mm":
                    return b.s(u2, 2, "0");
                  case "s":
                    return String(e2.$s);
                  case "ss":
                    return b.s(e2.$s, 2, "0");
                  case "SSS":
                    return b.s(e2.$ms, 3, "0");
                  case "Z":
                    return i2;
                }
                return null;
              })(t3) || i2.replace(":", "");
            }));
          }, m3.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }, m3.diff = function(r2, d3, l2) {
            var $2, y3 = this, M3 = b.p(d3), m4 = O(r2), v3 = (m4.utcOffset() - this.utcOffset()) * e, g3 = this - m4, D3 = function() {
              return b.m(y3, m4);
            };
            switch (M3) {
              case h2:
                $2 = D3() / 12;
                break;
              case c:
                $2 = D3();
                break;
              case f:
                $2 = D3() / 3;
                break;
              case o2:
                $2 = (g3 - v3) / 6048e5;
                break;
              case a:
                $2 = (g3 - v3) / 864e5;
                break;
              case u:
                $2 = g3 / n;
                break;
              case s:
                $2 = g3 / e;
                break;
              case i:
                $2 = g3 / t;
                break;
              default:
                $2 = g3;
            }
            return l2 ? $2 : b.a($2);
          }, m3.daysInMonth = function() {
            return this.endOf(c).$D;
          }, m3.$locale = function() {
            return D2[this.$L];
          }, m3.locale = function(t2, e2) {
            if (!t2) return this.$L;
            var n2 = this.clone(), r2 = w(t2, e2, true);
            return r2 && (n2.$L = r2), n2;
          }, m3.clone = function() {
            return b.w(this.$d, this);
          }, m3.toDate = function() {
            return new Date(this.valueOf());
          }, m3.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
          }, m3.toISOString = function() {
            return this.$d.toISOString();
          }, m3.toString = function() {
            return this.$d.toUTCString();
          }, M2;
        })(), k = _2.prototype;
        return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h2], ["$D", d2]].forEach((function(t2) {
          k[t2[1]] = function(e2) {
            return this.$g(e2, t2[0], t2[1]);
          };
        })), O.extend = function(t2, e2) {
          return t2.$i || (t2(e2, _2, O), t2.$i = true), O;
        }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
          return O(1e3 * t2);
        }, O.en = D2[g2], O.Ls = D2, O.p = {}, O;
      }));
    }
  });

  // node_modules/dayjs/locale/zh-cn.js
  var require_zh_cn = __commonJS({
    "node_modules/dayjs/locale/zh-cn.js"(exports, module) {
      !(function(e, _2) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = _2(require_dayjs_min()) : "function" == typeof define && define.amd ? define(["dayjs"], _2) : (e = "undefined" != typeof globalThis ? globalThis : e || self).dayjs_locale_zh_cn = _2(e.dayjs);
      })(exports, (function(e) {
        "use strict";
        function _2(e2) {
          return e2 && "object" == typeof e2 && "default" in e2 ? e2 : { default: e2 };
        }
        var t = _2(e), d2 = { name: "zh-cn", weekdays: "\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D".split("_"), weekdaysShort: "\u5468\u65E5_\u5468\u4E00_\u5468\u4E8C_\u5468\u4E09_\u5468\u56DB_\u5468\u4E94_\u5468\u516D".split("_"), weekdaysMin: "\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D".split("_"), months: "\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708".split("_"), monthsShort: "1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708".split("_"), ordinal: function(e2, _3) {
          return "W" === _3 ? e2 + "\u5468" : e2 + "\u65E5";
        }, weekStart: 1, yearStart: 4, formats: { LT: "HH:mm", LTS: "HH:mm:ss", L: "YYYY/MM/DD", LL: "YYYY\u5E74M\u6708D\u65E5", LLL: "YYYY\u5E74M\u6708D\u65E5Ah\u70B9mm\u5206", LLLL: "YYYY\u5E74M\u6708D\u65E5ddddAh\u70B9mm\u5206", l: "YYYY/M/D", ll: "YYYY\u5E74M\u6708D\u65E5", lll: "YYYY\u5E74M\u6708D\u65E5 HH:mm", llll: "YYYY\u5E74M\u6708D\u65E5dddd HH:mm" }, relativeTime: { future: "%s\u5185", past: "%s\u524D", s: "\u51E0\u79D2", m: "1 \u5206\u949F", mm: "%d \u5206\u949F", h: "1 \u5C0F\u65F6", hh: "%d \u5C0F\u65F6", d: "1 \u5929", dd: "%d \u5929", M: "1 \u4E2A\u6708", MM: "%d \u4E2A\u6708", y: "1 \u5E74", yy: "%d \u5E74" }, meridiem: function(e2, _3) {
          var t2 = 100 * e2 + _3;
          return t2 < 600 ? "\u51CC\u6668" : t2 < 900 ? "\u65E9\u4E0A" : t2 < 1100 ? "\u4E0A\u5348" : t2 < 1300 ? "\u4E2D\u5348" : t2 < 1800 ? "\u4E0B\u5348" : "\u665A\u4E0A";
        } };
        return t.default.locale(d2, null, true), d2;
      }));
    }
  });

  // node_modules/dayjs/plugin/relativeTime.js
  var require_relativeTime = __commonJS({
    "node_modules/dayjs/plugin/relativeTime.js"(exports, module) {
      !(function(r, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (r = "undefined" != typeof globalThis ? globalThis : r || self).dayjs_plugin_relativeTime = e();
      })(exports, (function() {
        "use strict";
        return function(r, e, t) {
          r = r || {};
          var n = e.prototype, o2 = { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" };
          function i(r2, e2, t2, o3) {
            return n.fromToBase(r2, e2, t2, o3);
          }
          t.en.relativeTime = o2, n.fromToBase = function(e2, n2, i2, d3, u) {
            for (var f, a, s, l = i2.$locale().relativeTime || o2, h2 = r.thresholds || [{ l: "s", r: 44, d: "second" }, { l: "m", r: 89 }, { l: "mm", r: 44, d: "minute" }, { l: "h", r: 89 }, { l: "hh", r: 21, d: "hour" }, { l: "d", r: 35 }, { l: "dd", r: 25, d: "day" }, { l: "M", r: 45 }, { l: "MM", r: 10, d: "month" }, { l: "y", r: 17 }, { l: "yy", d: "year" }], m2 = h2.length, c = 0; c < m2; c += 1) {
              var y2 = h2[c];
              y2.d && (f = d3 ? t(e2).diff(i2, y2.d, true) : i2.diff(e2, y2.d, true));
              var p = (r.rounding || Math.round)(Math.abs(f));
              if (s = f > 0, p <= y2.r || !y2.r) {
                p <= 1 && c > 0 && (y2 = h2[c - 1]);
                var v2 = l[y2.l];
                u && (p = u("" + p)), a = "string" == typeof v2 ? v2.replace("%d", p) : v2(p, n2, y2.l, s);
                break;
              }
            }
            if (n2) return a;
            var M = s ? l.future : l.past;
            return "function" == typeof M ? M(a) : M.replace("%s", a);
          }, n.to = function(r2, e2) {
            return i(r2, e2, this, true);
          }, n.from = function(r2, e2) {
            return i(r2, e2, this);
          };
          var d2 = function(r2) {
            return r2.$u ? t.utc() : t();
          };
          n.toNow = function(r2) {
            return this.to(d2(this), r2);
          }, n.fromNow = function(r2) {
            return this.from(d2(this), r2);
          };
        };
      }));
    }
  });

  // node_modules/mitt/dist/mitt.mjs
  function mitt_default(n) {
    return { all: n = n || /* @__PURE__ */ new Map(), on: function(t, e) {
      var i = n.get(t);
      i ? i.push(e) : n.set(t, [e]);
    }, off: function(t, e) {
      var i = n.get(t);
      i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));
    }, emit: function(t, e) {
      var i = n.get(t);
      i && i.slice().map(function(n2) {
        n2(e);
      }), (i = n.get("*")) && i.slice().map(function(n2) {
        n2(t, e);
      });
    } };
  }

  // domains/base.ts
  function uid_factory() {
    let _uid = 0;
    return function uid2() {
      _uid += 1;
      return _uid;
    };
  }
  var uid = uid_factory();
  var BaseEvents = /* @__PURE__ */ ((BaseEvents2) => {
    BaseEvents2["Loading"] = "__loading";
    BaseEvents2["Destroy"] = "__destroy";
    return BaseEvents2;
  })(BaseEvents || {});
  function base() {
    const emitter = mitt_default();
    let listeners = [];
    return {
      off(event, handler4) {
        emitter.off(event, handler4);
      },
      on(event, handler4) {
        const unlisten = () => {
          listeners = listeners.filter((l) => l !== unlisten);
          this.off(event, handler4);
        };
        listeners.push(unlisten);
        emitter.on(event, handler4);
        return unlisten;
      },
      uid,
      emit(event, value) {
        emitter.emit(event, value);
      },
      destroy() {
        for (let i = 0; i < listeners.length; i += 1) {
          const off = listeners[i];
          off();
        }
        this.emit("__destroy" /* Destroy */, null);
      }
    };
  }
  var BaseDomain = class {
    constructor(props = {}) {
      /** 用于自己区别同名 Domain 不同实例的标志 */
      __publicField(this, "unique_id", "BaseDomain");
      __publicField(this, "debug", false);
      __publicField(this, "_emitter", mitt_default());
      // event 为键，callback 列表为值的对象
      // @ts-ignore
      __publicField(this, "listeners", {});
      const { unique_id, debug } = props;
      if (unique_id) {
        this.unique_id = unique_id;
      }
    }
    uid() {
      return uid();
    }
    log(...args) {
      if (!this.debug) {
        return [];
      }
      return [
        `%c CORE %c ${this.unique_id} %c`,
        "color:white;background:#dfa639;border-top-left-radius:2px;border-bottom-left-radius:2px;",
        "color:white;background:#19be6b;border-top-right-radius:2px;border-bottom-right-radius:2px;",
        "color:#19be6b;",
        ...args
      ];
    }
    errorTip(...args) {
      if (!this.debug) {
        return;
      }
      console.log(
        `%c CORE %c ${this.unique_id} %c`,
        "color:white;background:red;border-top-left-radius:2px;border-bottom-left-radius:2px;",
        "color:white;background:#19be6b;border-top-right-radius:2px;border-bottom-right-radius:2px;",
        "color:#19be6b;",
        ...args
      );
    }
    off(event, handler4) {
      this._emitter.off(event, handler4);
    }
    offEvent(k) {
      const listeners = this.listeners[k] || [];
      for (let i = 0; i < listeners.length; i += 1) {
        const off = listeners[i];
        off();
      }
    }
    on(event, handler4) {
      const unlisten = () => {
        const listeners2 = this.listeners[event] || [];
        this.listeners[event] = listeners2.filter((l) => l !== unlisten);
        this.off(event, handler4);
      };
      const listeners = this.listeners[event] || [];
      listeners.push(unlisten);
      this.listeners[event] = listeners;
      this._emitter.on(event, handler4);
      return unlisten;
    }
    emit(event, value) {
      this._emitter.emit(event, value);
    }
    /** 主动销毁所有的监听事件 */
    destroy() {
      Object.keys(this.listeners).map((k) => {
        const listeners = this.listeners[k] || [];
        for (let i = 0; i < listeners.length; i += 1) {
          const off = listeners[i];
          off();
        }
      });
      this.emit("__destroy" /* Destroy */);
    }
    onDestroy(handler4) {
      return this.on("__destroy" /* Destroy */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "Domain";
    }
  };
  function applyMixins(derivedCtor, constructors) {
    constructors.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || /* @__PURE__ */ Object.create(null)
        );
      });
    });
  }

  // domains/ui/cur/index.ts
  var RefCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "value", null);
      const { defaultValue, onChange } = options;
      if (defaultValue) {
        this.value = defaultValue;
      }
      if (onChange) {
        this.onStateChange(onChange);
      }
    }
    get state() {
      return this.value;
    }
    /** 暂存一个值 */
    select(value) {
      this.value = value;
      this.emit(0 /* StateChange */, this.value);
    }
    patch(value) {
      this.value = __spreadValues(__spreadValues({}, this.value), value);
      this.emit(0 /* StateChange */, this.value);
    }
    /** 暂存的值是否为空 */
    isEmpty() {
      return this.value === null;
    }
    /** 返回 select 方法保存的 value 并将 value 重置为 null */
    clear() {
      this.value = null;
      this.emit(0 /* StateChange */);
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/ui/button/index.ts
  var ButtonCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "id", this.uid());
      __publicField(this, "cur");
      __publicField(this, "state", {
        text: "Click it",
        loading: false,
        disabled: false
      });
      if (props.disabled !== void 0) {
        this.state.disabled = props.disabled;
      }
      this.cur = new RefCore();
      if (props.onClick) {
        this.onClick(() => {
          var _a4;
          (_a4 = props.onClick) == null ? void 0 : _a4.call(props, this.cur.value);
        });
      }
    }
    /** 触发一次按钮点击事件 */
    click() {
      if (this.state.loading) {
        return;
      }
      if (this.state.disabled) {
        return;
      }
      this.emit(0 /* Click */);
    }
    /** 禁用当前按钮 */
    disable() {
      this.state.disabled = true;
      this.emit(1 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 恢复按钮可用 */
    enable() {
      this.state.disabled = false;
      this.emit(1 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(v2) {
      this.cur.select(v2);
      return this;
    }
    setLoading(loading) {
      if (this.state.loading === loading) {
        return;
      }
      this.state.loading = loading;
      this.emit(1 /* StateChange */, __spreadValues({}, this.state));
    }
    onClick(handler4) {
      this.on(0 /* Click */, handler4);
    }
    onStateChange(handler4) {
      this.on(1 /* StateChange */, handler4);
    }
  };
  var ButtonInListCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      /** 列表中一类多个按钮 */
      __publicField(this, "btns", []);
      /** 按钮点击后，该值被设置为触发点击的那个按钮 */
      __publicField(this, "cur", null);
      const { onClick } = options;
      if (onClick) {
        this.onClick(onClick);
      }
    }
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(v2) {
      const existing = this.btns.find((btn2) => {
        return btn2.cur.value === v2;
      });
      if (existing) {
        return existing;
      }
      const btn = new ButtonCore({
        onClick: (record) => {
          this.cur = btn;
          this.emit(0 /* Click */, record);
        }
      });
      btn.bind(v2);
      this.btns.push(btn);
      return btn;
    }
    /** 清空触发点击事件时保存的按钮 */
    clear() {
      this.cur = null;
    }
    setLoading(loading) {
      if (this.cur === null) {
        for (let i = 0; i < this.btns.length; i += 1) {
          const btn = this.btns[i];
          btn.setLoading(loading);
        }
        return;
      }
      this.cur.setLoading(loading);
    }
    click() {
      if (this.cur === null) {
        return;
      }
      this.cur.click();
    }
    onClick(handler4) {
      this.on(0 /* Click */, handler4);
    }
    onStateChange(handler4) {
      this.on(1 /* StateChange */, handler4);
    }
  };

  // domains/ui/presence/index.ts
  var PresenceCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "name", "PresenceCore");
      __publicField(this, "debug", false);
      __publicField(this, "animationName", "none");
      __publicField(this, "mounted", false);
      __publicField(this, "enter", false);
      __publicField(this, "visible", false);
      __publicField(this, "exit", false);
      const { mounted = false, visible = false } = props;
      this.mounted = mounted;
      this.visible = visible;
      if (visible) {
        this.mounted = true;
      }
    }
    get state() {
      return {
        mounted: this.mounted,
        enter: this.enter,
        visible: this.visible,
        exit: this.exit,
        text: (() => {
          if (this.exit) {
            return "exit";
          }
          if (this.enter) {
            return "enter";
          }
          if (this.visible) {
            return "visible";
          }
          return "unknown";
        })()
      };
    }
    toggle() {
      if (this.visible) {
        this.hide();
        return;
      }
      this.show();
    }
    show() {
      if (this.mounted === false) {
        this.mounted = true;
      }
      this.exit = false;
      this.enter = true;
      this.visible = true;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      setTimeout(() => {
        this.emit(2 /* Show */);
      }, 180);
    }
    hide(options = {}) {
      const { destroy = true } = options;
      if (destroy === false) {
        this.exit = true;
        this.enter = false;
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
        setTimeout(() => {
          this.visible = false;
          this.emit(4 /* Hidden */);
          this.emit(0 /* StateChange */, __spreadValues({}, this.state));
        }, 180);
        return;
      }
      this.exit = true;
      this.enter = false;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      setTimeout(() => {
        this.visible = false;
        this.emit(4 /* Hidden */);
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
        this.unmount();
      }, 180);
    }
    /** 将 DOM 从页面卸载 */
    unmount() {
      this.mounted = false;
      this.enter = false;
      this.visible = false;
      this.exit = false;
      this.emit(6 /* Unmounted */);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    reset() {
      this.mounted = false;
      this.enter = false;
      this.visible = false;
      this.exit = false;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    onTmpShow(handler4) {
      return this.on(3 /* TmpShow */, handler4);
    }
    onTmpHidden(handler4) {
      return this.on(5 /* TmpHidden */, handler4);
    }
    onShow(handler4) {
      return this.on(2 /* Show */, handler4);
    }
    onHidden(handler4) {
      return this.on(4 /* Hidden */, handler4);
    }
    onUnmounted(handler4) {
      return this.on(6 /* Unmounted */, handler4);
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
    onPresentChange(handler4) {
      return this.on(1 /* PresentChange */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "Presence";
    }
  };

  // domains/ui/checkbox/index.ts
  var CheckboxCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "shape", "checkbox");
      __publicField(this, "label");
      __publicField(this, "disabled");
      __publicField(this, "checked");
      // value: boolean;
      __publicField(this, "defaultChecked");
      __publicField(this, "presence");
      __publicField(this, "prev_checked", false);
      const { label = "", disabled = false, checked = false, onChange } = props;
      this.label = label;
      this.disabled = disabled;
      this.checked = checked;
      this.defaultChecked = checked;
      this.presence = new PresenceCore();
      if (onChange) {
        this.onChange(onChange);
      }
    }
    get state() {
      return {
        label: this.label,
        checked: this.checked,
        value: this.checked,
        disabled: this.disabled
      };
    }
    get value() {
      return this.state.value;
    }
    get defaultValue() {
      return this.defaultChecked;
    }
    /** 切换选中状态 */
    toggle() {
      const prev_checked = this.checked;
      (() => {
        if (prev_checked) {
          this.presence.hide();
          return;
        }
        this.presence.show();
      })();
      this.checked = true;
      if (prev_checked) {
        this.checked = false;
      }
      this.prev_checked = prev_checked;
      this.emit(1 /* Change */, this.checked);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    check() {
      if (this.checked === true) {
        return;
      }
      this.presence.show();
      this.prev_checked = this.checked;
      this.checked = true;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    uncheck() {
      if (this.checked === false) {
        return;
      }
      this.presence.hide();
      this.prev_checked = this.checked;
      this.checked = false;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    reset() {
      this.checked = this.defaultChecked;
    }
    setValue(v2) {
      this.checked = v2;
    }
    onChange(handler4) {
      return this.on(1 /* Change */, handler4);
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/ui/popper/index.ts
  var PopperCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "unique_id", "PopperCore");
      __publicField(this, "debug", true);
      // side: Side = "bottom";
      // align: Align = "center";
      __publicField(this, "placement", "bottom");
      __publicField(this, "strategy", "absolute");
      __publicField(this, "middleware", []);
      // sideOffset = 0;
      // alignOffset = 0;
      // arrowPadding = 0;
      // collisionBoundary = [];
      // collisionPadding: collisionPaddingProp = 0;
      // sticky = "partial";
      // hideWhenDetached = false;
      // avoidCollisions = true;
      // onPlaced;
      __publicField(this, "reference", null);
      __publicField(this, "floating", null);
      __publicField(this, "container", null);
      __publicField(this, "arrow", null);
      __publicField(this, "state", {
        strategy: "absolute",
        x: 0,
        y: 0,
        isPlaced: false,
        placedSide: "bottom",
        placedAlign: "center",
        reference: false
      });
      __publicField(this, "_enter", false);
      __publicField(this, "_focus", false);
      const { _name, side = "bottom", align = "center", strategy = "absolute", middleware = [] } = options;
      if (_name) {
        this.unique_id = _name;
      }
      this.strategy = strategy;
      this.placement = side + (align !== "center" ? "-" + align : "");
    }
    /** 基准元素加载完成 */
    setReference(reference, opt = {}) {
      if (this.reference !== null && !opt.force) {
        return;
      }
      this.reference = reference;
      this.state.reference = true;
      this.emit(0 /* ReferenceMounted */, reference);
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 更新基准元素（右键菜单时会用到这个方法） */
    updateReference(reference) {
      this.reference = reference;
    }
    removeReference() {
      if (this.reference === null) {
        return;
      }
      this.state.reference = false;
      this.reference = null;
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 内容元素加载完成 */
    setFloating(floating) {
      if (floating === null) {
        return;
      }
      this.floating = floating;
      this.emit(1 /* FloatingMounted */, floating);
    }
    /** 箭头加载完成 */
    setArrow(arrow) {
      this.arrow = arrow;
    }
    setContainer(container) {
    }
    setConfig(config) {
    }
    setState(v2) {
      this.state.x = v2.x;
      this.state.y = v2.y;
      this.state.isPlaced = true;
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    place2(floating) {
      const reference = this.reference;
      if (!reference) {
        return;
      }
      const ref = reference.getRect();
      const { clientHeight, clientWidth } = window.document.documentElement;
      const position = {
        x: ref.x,
        y: ref.y + ref.height + 4
      };
      if (clientHeight - position.y < floating.height + 24) {
        position.y = ref.y - floating.height - 4;
      }
      if (clientWidth - position.x < floating.width + 24) {
        position.x = ref.x + ref.width - floating.width - 4;
      }
      if (position.y <= 0) {
        position.y = 12;
      }
      this.setState(position);
    }
    /** 计算浮动元素位置 */
    place() {
      return __async(this, null, function* () {
        this.middleware = [
          // arrow({
          //   element: this.floating,
          // }),
          // transformOriginMiddleware({
          //   element: this.arrow,
          // }),
        ];
        if (this.reference === null || this.floating === null) {
          return;
        }
        const coords = yield this.computePosition();
        const { x: x2, y: y2, middlewareData } = coords;
        const [placedSide, placedAlign] = getSideAndAlignFromPlacement(this.placement);
        this.state = {
          x: x2,
          y: y2,
          strategy: this.strategy,
          isPlaced: true,
          placedSide,
          placedAlign,
          reference: true
        };
        this.emit(5 /* StateChange */, __spreadValues({}, this.state));
      });
    }
    computePosition() {
      return __async(this, null, function* () {
        const rtl = true;
        const { placement, strategy } = this;
        let statefulPlacement = placement;
        const reference = this.reference.getRect();
        const floating = this.floating.getRect();
        const rects = {
          reference,
          floating
        };
        let { x: x2, y: y2 } = this.computeCoordsFromPlacement(rects, placement, rtl);
        let middlewareData = {};
        for (let i = 0; i < this.middleware.length; i++) {
          const { name, fn } = this.middleware[i];
          const {
            x: nextX,
            y: nextY,
            data,
            reset
          } = yield fn({
            x: x2,
            y: y2,
            initialPlacement: placement,
            placement: statefulPlacement,
            strategy,
            middlewareData,
            rects,
            elements: { reference, floating }
          });
          x2 = nextX != null ? nextX : x2;
          y2 = nextY != null ? nextY : y2;
          middlewareData = __spreadProps(__spreadValues({}, middlewareData), {
            [name]: __spreadValues(__spreadValues({}, middlewareData[name]), data)
          });
        }
        return {
          x: x2,
          y: y2,
          placement: statefulPlacement,
          strategy,
          middlewareData
        };
      });
    }
    /** 根据放置位置，计算浮动元素坐标 */
    computeCoordsFromPlacement(elms, placement, rtl) {
      const { reference, floating } = elms;
      console.log("computeCoordsFromPlacement", reference, floating);
      const commonX = reference.x + reference.width / 2 - floating.width / 2;
      const commonY = reference.y + reference.height / 2 - floating.height / 2;
      const mainAxis = getMainAxisFromPlacement(placement);
      const length = getLengthFromAxis(mainAxis);
      const commonAlign = reference[length] / 2 - floating[length] / 2;
      const side = getSide(placement);
      const isVertical = mainAxis === "x";
      let coords;
      switch (side) {
        case "top":
          coords = { x: commonX, y: reference.y - floating.height };
          break;
        case "bottom":
          coords = { x: commonX, y: reference.y + reference.height };
          break;
        case "right":
          coords = { x: reference.x + reference.width, y: commonY };
          break;
        case "left":
          coords = { x: reference.x - floating.width, y: commonY };
          break;
        default:
          coords = { x: reference.x, y: reference.y };
      }
      switch (getAlignment(placement)) {
        case "start":
          coords[mainAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
          break;
        case "end":
          coords[mainAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
          break;
        default:
      }
      return coords;
    }
    handleEnter() {
      if (this._enter === true) {
        return;
      }
      this._enter = true;
      this.emit(3 /* Enter */);
    }
    handleLeave() {
      if (this._enter === false) {
        return;
      }
      this._enter = false;
      this.emit(4 /* Leave */);
    }
    reset() {
      this._enter = false;
      this._focus = false;
    }
    onReferenceMounted(handler4) {
      return this.on(0 /* ReferenceMounted */, handler4);
    }
    onFloatingMounted(handler4) {
      return this.on(1 /* FloatingMounted */, handler4);
    }
    onContainerChange(handler4) {
      return this.on(6 /* ContainerChange */, handler4);
    }
    onEnter(handler4) {
      return this.on(3 /* Enter */, handler4);
    }
    onLeave(handler4) {
      return this.on(4 /* Leave */, handler4);
    }
    onPlaced(handler4) {
      return this.on(2 /* Placed */, handler4);
    }
    onStateChange(handler4) {
      return this.on(5 /* StateChange */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "PopperCore";
    }
  };
  function getSideAndAlignFromPlacement(placement) {
    const [side, align = "center"] = placement.split("-");
    return [side, align];
  }
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].includes(getSide(placement)) ? "x" : "y";
  }
  function getLengthFromAxis(axis) {
    return axis === "y" ? "height" : "width";
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }

  // domains/ui/dismissable-layer/index.ts
  var DismissableLayerCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "name", "DismissableLayerCore");
      __publicField(this, "layers", /* @__PURE__ */ new Set());
      __publicField(this, "layersWithOutsidePointerEventsDisabled", /* @__PURE__ */ new Set());
      __publicField(this, "branches", /* @__PURE__ */ new Set());
      __publicField(this, "isPointerInside", false);
      __publicField(this, "state", {});
    }
    handlePointerOutside(branch) {
    }
    /** 响应点击事件 */
    pointerDown() {
      this.isPointerInside = true;
    }
    /** 响应冒泡到最顶层时的点击事件 */
    handlePointerDownOnTop(absNode) {
      if (this.isPointerInside === true) {
        this.isPointerInside = false;
        return;
      }
      this.emit(2 /* PointerDownOutside */);
      this.emit(3 /* InteractOutside */);
      this.emit(0 /* Dismiss */);
    }
    onDismiss(handler4) {
      return this.on(0 /* Dismiss */, handler4);
    }
  };

  // domains/ui/menu/index.ts
  var MenuCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "_name", "MenuCore");
      __publicField(this, "debug", false);
      __publicField(this, "popper");
      __publicField(this, "presence");
      __publicField(this, "layer");
      __publicField(this, "open_timer", null);
      __publicField(this, "state", {
        open: false,
        hover: false,
        items: []
      });
      // subs: MenuCore[] = [];
      __publicField(this, "items", []);
      __publicField(this, "cur_sub", null);
      __publicField(this, "cur_item", null);
      __publicField(this, "inside", false);
      /** 鼠标是否处于子菜单中 */
      __publicField(this, "in_sub_menu", false);
      /** 鼠标离开 item 时，可能要隐藏子菜单，但是如果从有子菜单的 item 离开前往子菜单，就不用隐藏 */
      __publicField(this, "maybe_hide_sub", false);
      __publicField(this, "hide_sub_timer", null);
      const { _name, items = [], side, align, strategy } = options;
      if (_name) {
        this._name = _name;
      }
      this.state.items = items;
      this.items = items;
      this.popper = new PopperCore({
        side,
        align,
        strategy,
        _name: _name ? `${_name}__popper` : "menu__popper"
      });
      this.presence = new PresenceCore();
      this.layer = new DismissableLayerCore();
      this.listen_items(items);
      this.popper.onEnter(() => {
        this.state.hover = true;
        this.emit(4 /* EnterMenu */);
      });
      this.popper.onLeave(() => {
        this.state.hover = false;
        this.emit(5 /* LeaveMenu */);
      });
      this.layer.onDismiss(() => {
        this.hide();
      });
      this.presence.onHidden(() => {
        this.reset();
        if (this.cur_item) {
          this.cur_item.blur();
        }
        if (this.cur_sub) {
          this.cur_sub.hide();
        }
      });
    }
    toggle() {
      const { open } = this.state;
      console.log("[DOMAIN]ui/dropdown-menu - toggle", open);
      if (open) {
        this.hide();
        return;
      }
      this.show();
    }
    show() {
      if (this.state.open) {
        return;
      }
      this.state.open = true;
      this.presence.show();
      this.popper.place();
      this.emit(0 /* Show */);
      this.emit(6 /* StateChange */, __spreadValues({}, this.state));
    }
    hide() {
      if (this.state.open === false) {
        return;
      }
      this.state.open = false;
      this.presence.hide();
      this.emit(1 /* Hidden */);
      this.emit(6 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 处理选项 */
    listen_item(item) {
      item.onEnter(() => {
        var _a4;
        console.log("[DOMAIN]ui/menu/index - item.onEnter", item.label, item.menu, (_a4 = this.cur_item) == null ? void 0 : _a4.label);
        this.emit(2 /* EnterItem */, item);
        if (item.menu) {
          item.menu.show();
        }
        if (this.cur_item && this.cur_item !== item) {
          this.cur_item.blur();
          if (this.cur_item.menu) {
            this.cur_item.menu.hide();
          }
        }
        this.cur_item = item;
      });
      item.onLeave(() => {
        var _a4;
        console.log(
          "[DOMAIN]ui/menu/index - item.onLeave",
          item.label,
          { open: item._open, focused: item._focused },
          (_a4 = item.menu) == null ? void 0 : _a4.state
        );
        this.emit(3 /* LeaveItem */, item);
        item.blur();
        if (item.menu) {
          let timer = setTimeout(() => {
            item.menu.hide();
          }, 0);
          item.menu.onEnter(() => {
            console.log("[DOMAIN]ui/menu/index - item.menu.onEnter");
            if (timer) {
              clearTimeout(timer);
            }
          });
          return;
        }
      });
      if (!item.menu) {
        return;
      }
      const sub_menu = item.menu;
    }
    listen_items(items) {
      for (let i = 0; i < items.length; i += 1) {
        this.listen_item(items[i]);
      }
    }
    setItems(items) {
      console.log("[DOMAIN]ui/menu - set items", items);
      this.state.items = items;
      this.items = items;
      this.listen_items(items);
      this.emit(6 /* StateChange */, __spreadValues({}, this.state));
    }
    checkNeedHideSubMenu(item) {
    }
    reset() {
      this.in_sub_menu = false;
      this.cur_sub = null;
      this.maybe_hide_sub = false;
      this.hide_sub_timer = null;
      this.state.open = false;
      this.presence.reset();
      this.popper.reset();
      for (let i = 0; i < this.items.length; i += 1) {
        this.items[i].reset();
      }
    }
    unmount() {
      super.destroy();
      this.layer.destroy();
      this.popper.destroy();
      this.presence.unmount();
      for (let i = 0; i < this.items.length; i += 1) {
        this.items[i].unmount();
      }
      this.reset();
    }
    onShow(handler4) {
      return this.on(0 /* Show */, handler4);
    }
    onHide(handler4) {
      return this.on(1 /* Hidden */, handler4);
    }
    onEnterItem(handler4) {
      return this.on(2 /* EnterItem */, handler4);
    }
    onLeaveItem(handler4) {
      return this.on(3 /* LeaveItem */, handler4);
    }
    onEnter(handler4) {
      return this.on(4 /* EnterMenu */, handler4);
    }
    onLeave(handler4) {
      return this.on(5 /* LeaveMenu */, handler4);
    }
    onStateChange(handler4) {
      return this.on(6 /* StateChange */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "Menu";
    }
  };
  var SELECTION_KEYS = ["Enter", " "];
  var FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
  var LAST_KEYS = ["ArrowUp", "PageDown", "End"];
  var FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
  var SUB_OPEN_KEYS = {
    ltr: [...SELECTION_KEYS, "ArrowRight"],
    rtl: [...SELECTION_KEYS, "ArrowLeft"]
  };

  // domains/ui/context-menu/index.ts
  var ContextMenuCore = class extends BaseDomain {
    constructor(options) {
      super(options);
      __publicField(this, "menu");
      __publicField(this, "state", {
        items: []
      });
      const { _name, items = [] } = options;
      this.state.items = items;
      this.menu = new MenuCore(__spreadProps(__spreadValues({}, options), {
        _name: _name ? `${_name}__menu` : "menu-in-context-menu",
        side: "right",
        align: "start"
      }));
    }
    show(position = {}) {
      const { x: x2, y: y2 } = position;
      this.updateReference(__spreadProps(__spreadValues({}, this.menu.popper.reference), {
        getRect: () => {
          return {
            width: 5,
            height: 5,
            left: x2,
            top: y2,
            x: x2,
            y: y2
          };
        }
      }));
      this.menu.show();
    }
    hide() {
      console.log("[]ContextMenuCore - hide");
      this.menu.hide();
    }
    setReference(reference) {
      this.menu.popper.setReference(reference);
    }
    updateReference(reference) {
      this.menu.popper.updateReference(reference);
    }
    setItems(items) {
      this.state.items = items;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    onStateChange(handler4) {
      this.on(0 /* StateChange */, handler4);
    }
    onShow(handler4) {
      this.on(1 /* Show */, handler4);
    }
    onHide(handler4) {
      this.on(2 /* Hidden */, handler4);
    }
  };

  // domains/ui/dialog/index.ts
  var DialogCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "open", false);
      __publicField(this, "title", "");
      __publicField(this, "footer", true);
      __publicField(this, "closeable", true);
      __publicField(this, "mask", true);
      __publicField(this, "present", new PresenceCore());
      __publicField(this, "okBtn", new ButtonCore());
      __publicField(this, "cancelBtn", new ButtonCore());
      const { title, footer = true, open = false, mask = true, closeable = true, onOk, onCancel, onUnmounted } = props;
      if (title) {
        this.title = title;
      }
      this.footer = footer;
      this.closeable = closeable;
      this.mask = mask;
      this.open = open;
      if (open) {
        this.present.show();
      }
      if (onOk) {
        this.onOk(onOk);
      }
      if (onCancel) {
        this.onCancel(onCancel);
      }
      if (onUnmounted) {
        this.onUnmounted(onUnmounted);
      }
      this.present.onShow(() => __async(this, null, function* () {
        this.open = true;
        this.emit(5 /* VisibleChange */, true);
        this.emit(1 /* Show */);
        this.emit(10 /* StateChange */, __spreadValues({}, this.state));
      }));
      this.present.onHidden(() => __async(this, null, function* () {
        this.open = false;
        this.emit(6 /* Cancel */);
        this.emit(3 /* Hidden */);
        this.emit(5 /* VisibleChange */, false);
        this.emit(10 /* StateChange */, __spreadValues({}, this.state));
      }));
      this.present.onUnmounted(() => {
        this.emit(4 /* Unmounted */);
      });
      this.present.onStateChange(() => {
        this.emit(10 /* StateChange */, __spreadValues({}, this.state));
      });
      this.okBtn.onClick(() => {
        this.ok();
      });
      this.cancelBtn.onClick(() => {
        this.hide();
      });
    }
    get state() {
      return {
        open: this.open,
        title: this.title,
        footer: this.footer,
        closeable: this.closeable,
        mask: this.mask,
        enter: this.present.state.enter,
        visible: this.present.state.visible,
        exit: this.present.state.exit
      };
    }
    toggle() {
      if (this.open) {
        this.present.hide();
        return;
      }
      this.present.show();
    }
    /** 显示弹窗 */
    show() {
      if (this.open) {
        return;
      }
      this.present.show();
    }
    /** 隐藏弹窗 */
    hide(opt = {}) {
      this.present.hide(opt);
    }
    ok() {
      this.emit(7 /* OK */);
    }
    cancel() {
      this.emit(6 /* Cancel */);
    }
    setTitle(title) {
      this.title = title;
      this.emit(10 /* StateChange */, __spreadValues({}, this.state));
    }
    onShow(handler4) {
      return this.on(1 /* Show */, handler4);
    }
    onHidden(handler4) {
      return this.on(3 /* Hidden */, handler4);
    }
    onUnmounted(handler4) {
      return this.on(4 /* Unmounted */, handler4);
    }
    onVisibleChange(handler4) {
      return this.on(5 /* VisibleChange */, handler4);
    }
    onOk(handler4) {
      return this.on(7 /* OK */, handler4);
    }
    onCancel(handler4) {
      return this.on(6 /* Cancel */, handler4);
    }
    onStateChange(handler4) {
      return this.on(10 /* StateChange */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "Dialog";
    }
  };

  // domains/ui/dropdown-menu/index.ts
  var DropdownMenuCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "open", false);
      __publicField(this, "disabled", false);
      __publicField(this, "menu");
      __publicField(this, "subs", []);
      __publicField(this, "items", []);
      const { _name, side, align, items = [], onHidden } = props;
      this.items = items;
      this.menu = new MenuCore({ side, align, items, _name: _name ? `${_name}__menu` : "menu-in-dropdown" });
      this.menu.onHide(() => {
        this.menu.reset();
        if (onHidden) {
          onHidden();
        }
      });
      this.menu.presence.onStateChange(() => {
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      });
    }
    get state() {
      var _a4, _b, _c;
      return {
        items: this.items,
        open: this.open,
        disabled: this.disabled,
        enter: (_a4 = this.menu.presence) == null ? void 0 : _a4.state.enter,
        visible: (_b = this.menu.presence) == null ? void 0 : _b.state.visible,
        exit: (_c = this.menu.presence) == null ? void 0 : _c.state.exit
      };
    }
    listenItems(items) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
      }
    }
    setItems(items) {
      this.items = items;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    showMenuItem(label) {
      const matched = this.items.find((v2) => v2.label === label);
      if (!matched) {
        return;
      }
      matched.show();
    }
    toggle(position) {
      if (position) {
        const { x: x2, y: y2, width = 8, height = 8 } = position;
        this.menu.popper.updateReference({
          // @ts-ignore
          getRect() {
            return {
              width,
              height,
              x: x2,
              y: y2
            };
          }
        });
      }
      this.menu.toggle();
    }
    hide() {
      this.menu.hide();
    }
    unmount() {
      super.destroy();
      this.menu.unmount();
    }
    onStateChange(handler4) {
      this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/ui/focus-scope/index.ts
  var FocusScopeCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "name", "FocusScopeCore");
      __publicField(this, "state", {
        paused: false
      });
    }
    pause() {
      this.state.paused = true;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    resume() {
      this.state.paused = false;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    focusin() {
      this.emit(1 /* Focusin */);
    }
    focusout() {
      this.emit(2 /* Focusout */);
    }
    onFocusin(handler4) {
      this.on(1 /* Focusin */, handler4);
    }
    onFocusout(handler4) {
      this.on(2 /* Focusout */, handler4);
    }
    onStateChange(handler4) {
      this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/error/index.ts
  var BizError = class extends Error {
    constructor(msg, code, data = null) {
      super(msg.join("\n"));
      __publicField(this, "messages");
      __publicField(this, "code");
      __publicField(this, "data", null);
      this.messages = msg;
      this.code = code;
      this.data = data;
    }
  };

  // domains/result/index.ts
  var Result = {
    /** 构造成功结果 */
    Ok: (value) => {
      const result = {
        data: value,
        error: null
      };
      return result;
    },
    /** 构造失败结果 */
    Err: (message, code, data = null) => {
      const result = {
        data,
        code,
        error: (() => {
          if (Array.isArray(message)) {
            const e = new BizError(message, code, data);
            return e;
          }
          if (typeof message === "string") {
            const e = new BizError([message], code, data);
            return e;
          }
          if (message instanceof BizError) {
            return message;
          }
          if (typeof message === "object") {
            const e = new BizError([message.message], code, data);
            return e;
          }
          if (!message) {
            const e = new BizError(["\u672A\u77E5\u9519\u8BEF"], code, data);
            return e;
          }
          const r = message;
          return r.error;
        })()
      };
      return result;
    }
  };

  // domains/ui/form/index.ts
  function FormCore(props) {
    const { fields } = props;
    let _fields = fields;
    let _values = {};
    let _inline = false;
    const _state = {
      get value() {
        return _values;
      },
      get fields() {
        return Object.values(_fields);
      },
      get inline() {
        return _inline;
      }
    };
    let Events3;
    ((Events4) => {
      Events4[Events4["Input"] = 0] = "Input";
      Events4[Events4["Submit"] = 1] = "Submit";
      Events4[Events4["Change"] = 2] = "Change";
      Events4[Events4["StateChange"] = 3] = "StateChange";
    })(Events3 || (Events3 = {}));
    const bus = base();
    function updateValuesSilence(name, value) {
      _values[name] = value;
    }
    function updateValues(name, value) {
      _values[name] = value;
      bus.emit(2 /* Change */, __spreadValues({}, _state.value));
    }
    const keys = Object.keys(_fields);
    for (let i = 0; i < keys.length; i += 1) {
      const field = _fields[keys[i]];
      updateValuesSilence(field.name, field.$input.value);
      field.$input.onChange((v2) => {
        console.log("[DOMAIN]ui/form/index - updateValues", field.name, v2);
        updateValues(field.name, v2);
      });
      field.onShow(() => {
        updateValues(field.name, field.$input.value);
      });
      field.onHide(() => {
        delete _values[field.name];
        bus.emit(2 /* Change */, __spreadValues({}, _state.value));
      });
    }
    return {
      symbol: "FormCore",
      shape: "form",
      state: _state,
      get value() {
        return _values;
      },
      get fields() {
        return _fields;
      },
      setValue(v2, extra = {}) {
        const keys2 = Object.keys(_fields);
        for (let i = 0; i < keys2.length; i += 1) {
          const field = _fields[keys2[i]];
          field.$input.setValue(v2[keys2[i]], { silence: true });
        }
        _values = v2;
        if (!extra.silence) {
          bus.emit(2 /* Change */, _state.value);
        }
      },
      setInline(v2) {
        _inline = v2;
        bus.emit(3 /* StateChange */, __spreadValues({}, _state));
      },
      // setFieldsValue(nextValues) {}
      input(key, value) {
        _values[key] = value;
        bus.emit(2 /* Change */, _state.value);
      },
      submit() {
        bus.emit(1 /* Submit */, _state.value);
      },
      validate() {
        return Result.Ok(_values);
      },
      onSubmit(handler4) {
        bus.on(1 /* Submit */, handler4);
      },
      onInput(handler4) {
        bus.on(2 /* Change */, handler4);
      },
      onChange(handler4) {
        return bus.on(2 /* Change */, handler4);
      },
      onStateChange(handler4) {
        return bus.on(3 /* StateChange */, handler4);
      }
    };
  }

  // domains/ui/image/index.ts
  var ImageStep = /* @__PURE__ */ ((ImageStep2) => {
    ImageStep2[ImageStep2["Pending"] = 0] = "Pending";
    ImageStep2[ImageStep2["Loading"] = 1] = "Loading";
    ImageStep2[ImageStep2["Loaded"] = 2] = "Loaded";
    ImageStep2[ImageStep2["Failed"] = 3] = "Failed";
    return ImageStep2;
  })(ImageStep || {});
  var _ImageCore = class _ImageCore extends BaseDomain {
    constructor(props) {
      super();
      __publicField(this, "unique_uid");
      __publicField(this, "src");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "scale", null);
      __publicField(this, "fit");
      __publicField(this, "step", 0 /* Pending */);
      __publicField(this, "realSrc");
      const { unique_id, width = 200, height = 200, src, scale, fit = "cover" } = props;
      this.width = width;
      this.height = height;
      this.src = "";
      this.fit = fit;
      this.realSrc = src;
      if (scale) {
        this.scale = scale;
      }
      if (unique_id) {
        this.unique_uid = unique_id;
      }
    }
    static url(url) {
      if (!url) {
        return "";
      }
      if (url.includes("http")) {
        return url;
      }
      if (url.startsWith("data:image")) {
        return url;
      }
      return _ImageCore.prefix + url;
    }
    get state() {
      return {
        src: this.src,
        step: this.step,
        width: this.width,
        height: this.height,
        scale: this.scale
      };
    }
    setURL(src) {
      if (!src) {
        return;
      }
      if (this.realSrc && src !== this.realSrc) {
        this.realSrc = src;
        this.handleShow();
        return;
      }
      this.realSrc = src;
      if (this.step !== 2 /* Loaded */) {
        return;
      }
      this.src = _ImageCore.url(this.realSrc);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    setLoaded() {
      this.step = 2 /* Loaded */;
      this.emit(2 /* Loaded */);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 图片进入可视区域 */
    handleShow() {
      if (!this.realSrc) {
        this.step = 3 /* Failed */;
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
        return;
      }
      this.step = 1 /* Loading */;
      this.src = _ImageCore.url(this.realSrc);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 图片加载完成 */
    handleLoaded() {
      this.setLoaded();
    }
    /** 图片加载失败 */
    handleError() {
      this.step = 3 /* Failed */;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      this.emit(3 /* Error */);
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
    onStartLoad(handler4) {
      return this.on(1 /* StartLoad */, handler4);
    }
    onLoad(handler4) {
      return this.on(2 /* Loaded */, handler4);
    }
    onError(handler4) {
      return this.on(3 /* Error */, handler4);
    }
  };
  __publicField(_ImageCore, "prefix", "");
  var ImageCore = _ImageCore;
  var ImageInListCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      /** 列表中一类多个按钮 */
      __publicField(this, "btns", []);
      /** 按钮点击后，该值被设置为触发点击的那个按钮 */
      __publicField(this, "cur", null);
      __publicField(this, "scale", null);
      const { scale } = props;
      if (scale) {
        this.scale = scale;
      }
    }
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(unique_id) {
      const existing = this.btns.find((btn2) => {
        return btn2.unique_id === unique_id;
      });
      if (existing) {
        return existing;
      }
      const btn = new ImageCore({
        src: unique_id,
        scale: this.scale || void 0
      });
      this.btns.push(btn);
      return btn;
    }
    select(unique_id) {
      const matched = this.btns.find((btn) => btn.unique_id === unique_id);
      if (!matched) {
        return;
      }
      this.cur = matched;
    }
    /** 清空触发点击事件时保存的按钮 */
    clear() {
      this.cur = null;
    }
    onStateChange(handler4) {
      this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/ui/form/input/index.ts
  var InputCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      __publicField(this, "shape", "input");
      __publicField(this, "defaultValue");
      __publicField(this, "value");
      __publicField(this, "placeholder");
      __publicField(this, "disabled");
      __publicField(this, "allowClear", true);
      __publicField(this, "autoComplete", false);
      __publicField(this, "autoFocus", false);
      __publicField(this, "ignoreEnterEvent", false);
      __publicField(this, "isFocus", false);
      __publicField(this, "type");
      __publicField(this, "loading", false);
      /** 被消费过的值，用于做比较判断 input 值是否发生改变 */
      __publicField(this, "valueUsed");
      __publicField(this, "tmpType", "");
      const {
        unique_id,
        defaultValue,
        placeholder = "\u8BF7\u8F93\u5165",
        type = "string",
        disabled = false,
        autoFocus = false,
        autoComplete = false,
        ignoreEnterEvent = false,
        onChange,
        onBlur,
        onEnter,
        onClear,
        onMounted
      } = props;
      if (unique_id) {
        this.unique_id = unique_id;
      }
      this.placeholder = placeholder;
      this.type = type;
      this.disabled = disabled;
      this.autoComplete = autoComplete;
      this.ignoreEnterEvent = ignoreEnterEvent;
      this.autoFocus = autoFocus;
      this.defaultValue = defaultValue;
      this.value = defaultValue;
      if (onChange) {
        this.onChange(onChange);
      }
      if (onEnter) {
        this.onEnter(() => {
          onEnter(this.value);
        });
      }
      if (props.onKeyDown) {
        this.onKeyDown(props.onKeyDown);
      }
      if (onBlur) {
        this.onBlur(onBlur);
      }
      if (onClear) {
        this.onClear(onClear);
      }
      if (onMounted) {
        this.onMounted(onMounted);
      }
    }
    get state() {
      return {
        value: this.value,
        placeholder: this.placeholder,
        disabled: this.disabled,
        focus: this.isFocus,
        loading: this.loading,
        type: this.type,
        tmpType: this.tmpType,
        autoComplete: this.autoComplete,
        autoFocus: this.autoFocus,
        allowClear: this.allowClear
      };
    }
    setMounted() {
      this.emit(12 /* Mounted */);
    }
    handleKeyDown(event) {
      if (!this.ignoreEnterEvent && event.key === "Enter") {
        this.handleEnter();
        return;
      }
      this.emit(16 /* KeyDown */, event);
    }
    handleEnter() {
      this.valueUsed = this.value;
      this.emit(15 /* Enter */, this.value);
    }
    handleFocus() {
      this.isFocus = true;
    }
    handleBlur() {
      if (this.value === this.valueUsed) {
        return;
      }
      this.valueUsed = this.value;
      this.emit(14 /* Blur */, this.value);
    }
    handleClick(event) {
      this.emit(18 /* Click */, event);
    }
    handleChange(event) {
      if (this.type === "file") {
        const { target: target2 } = event;
        const { files: v3 } = target2;
        this.setValue(v3);
        return;
      }
      const { target } = event;
      const { value: v2 } = target;
      this.setValue(v2);
    }
    setValue(value, extra = {}) {
      this.value = value;
      if (this.type === "number") {
        this.value = Number(value);
      }
      if (!extra.silence) {
        this.emit(10 /* Change */, value);
        this.emit(11 /* StateChange */, __spreadValues({}, this.state));
      }
    }
    setPlaceholder(v2) {
      this.placeholder = v2;
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    setLoading(loading) {
      this.loading = loading;
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    setFocus() {
      this.isFocus = true;
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    focus() {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 focus \u65B9\u6CD5");
    }
    enable() {
      this.disabled = true;
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    disable() {
      this.disabled = false;
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    showText() {
      this.tmpType = "text";
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    hideText() {
      this.tmpType = "";
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    clear() {
      this.value = this.defaultValue;
      this.emit(17 /* Clear */);
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    reset() {
      this.value = this.defaultValue;
      this.emit(11 /* StateChange */, __spreadValues({}, this.state));
    }
    enter() {
      this.emit(15 /* Enter */);
    }
    onChange(handler4) {
      return this.on(10 /* Change */, handler4);
    }
    onStateChange(handler4) {
      return this.on(11 /* StateChange */, handler4);
    }
    onMounted(handler4) {
      return this.on(12 /* Mounted */, handler4);
    }
    onFocus(handler4) {
      return this.on(13 /* Focus */, handler4);
    }
    onBlur(handler4) {
      return this.on(14 /* Blur */, handler4);
    }
    onKeyDown(handler4) {
      return this.on(16 /* KeyDown */, handler4);
    }
    onEnter(handler4) {
      return this.on(15 /* Enter */, handler4);
    }
    onClick(handler4) {
      return this.on(18 /* Click */, handler4);
    }
    onClear(handler4) {
      return this.on(17 /* Clear */, handler4);
    }
  };
  var InputInListCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      __publicField(this, "defaultValue");
      __publicField(this, "list", []);
      __publicField(this, "cached", {});
      __publicField(this, "values", /* @__PURE__ */ new Map());
      const { defaultValue } = props;
      this.defaultValue = defaultValue;
    }
    bind(unique_id, options = {}) {
      const { defaultValue = this.defaultValue } = options;
      const existing = this.cached[unique_id];
      if (existing) {
        return existing;
      }
      const select = new InputCore({
        defaultValue,
        onChange: (value) => {
          this.values.set(unique_id, value);
          this.emit(10 /* Change */, [unique_id, value]);
        }
      });
      this.list.push(select);
      this.values.set(unique_id, defaultValue);
      this.cached[unique_id] = select;
      return select;
    }
    getCur(unique_id) {
      const existing = this.cached[unique_id];
      if (existing) {
        return existing;
      }
      return null;
    }
    setValue(v2) {
      for (let i = 0; i < this.list.length; i += 1) {
        const item = this.list[i];
        item.setValue(v2);
      }
    }
    clear() {
      this.list = [];
      this.cached = {};
      this.values = /* @__PURE__ */ new Map();
    }
    getValueByUniqueId(key) {
      var _a4;
      return (_a4 = this.values.get(key)) != null ? _a4 : null;
    }
    toJson(handler4) {
      const result = [];
      for (const [obj, value] of this.values) {
        const r = handler4([obj, value]);
        result.push(r);
      }
      return result;
    }
    /** 清空触发点击事件时保存的按钮 */
    // clear() {
    //   this.cur = null;
    // }
    onChange(handler4) {
      this.on(10 /* Change */, handler4);
    }
    onStateChange(handler4) {
      this.on(11 /* StateChange */, handler4);
    }
  };

  // domains/ui/node/index.ts
  var NodeCore = class extends BaseDomain {
    handleShow() {
      this.emit(3 /* EnterViewport */);
    }
    onVisible(handler4) {
      return this.on(3 /* EnterViewport */, handler4);
    }
    onClick(handler4) {
      return this.on(0 /* Click */, handler4);
    }
  };

  // domains/ui/popover/index.ts
  var PopoverCore = class extends BaseDomain {
    constructor(props = {}) {
      super();
      __publicField(this, "popper");
      __publicField(this, "present");
      __publicField(this, "layer");
      __publicField(this, "_side");
      __publicField(this, "_align");
      __publicField(this, "_closeable");
      __publicField(this, "visible", false);
      __publicField(this, "enter", false);
      __publicField(this, "exit", false);
      const { side = "bottom", align = "end", strategy, closeable = true } = props;
      this._side = side;
      this._align = align;
      this._closeable = closeable;
      this.popper = new PopperCore({
        side,
        align,
        strategy
      });
      this.present = new PresenceCore();
      this.layer = new DismissableLayerCore();
      this.layer.onDismiss(() => {
        console.log("[DOMAIN/ui]popover/index - onDismiss");
        this.hide();
      });
      this.present.onStateChange(() => {
        this.emit(2 /* StateChange */, __spreadValues({}, this.state));
      });
      this.popper.onStateChange(() => {
        this.emit(2 /* StateChange */, __spreadValues({}, this.state));
      });
    }
    get state() {
      return {
        // visible: this.visible,
        // enter: this.enter,
        // exit: this.exit,
        isPlaced: this.popper.state.isPlaced,
        closeable: this._closeable,
        x: this.popper.state.x,
        y: this.popper.state.y,
        enter: this.present.state.enter,
        visible: this.present.state.visible,
        exit: this.present.state.exit
      };
    }
    ready() {
    }
    destroy() {
    }
    toggle(position) {
      console.log("[DOMAIN/ui]popover/index - toggle");
      const { visible } = this;
      if (visible) {
        this.hide();
        return;
      }
      if (position) {
        const { x: x2, y: y2, width = 8, height = 8 } = position;
        this.popper.updateReference({
          // @ts-ignore
          getRect() {
            return {
              width,
              height,
              x: x2,
              y: y2
            };
          }
        });
      }
      this.show();
    }
    show(position) {
      var _a4;
      console.log((_a4 = this.popper.reference) == null ? void 0 : _a4.getRect());
      if (position) {
        this.popper.updateReference({
          getRect() {
            const { x: x2 = 0, y: y2 = 0, width = 0, height = 0, left = 0, top = 0, right = 0, bottom = 0 } = position;
            return {
              width,
              height,
              x: x2,
              y: y2,
              left,
              top,
              right,
              bottom
            };
          }
        });
      }
      this.visible = true;
      this.present.show();
      this.popper.place();
      this.emit(0 /* Show */);
    }
    hide() {
      if (this.visible === false) {
        return;
      }
      this.visible = false;
      this.present.hide();
      this.emit(1 /* Hidden */);
    }
    unmount() {
      super.destroy();
      this.layer.destroy();
      this.popper.destroy();
      this.present.unmount();
    }
    onShow(handler4) {
      return this.on(0 /* Show */, handler4);
    }
    onHide(handler4) {
      return this.on(1 /* Hidden */, handler4);
    }
    onStateChange(handler4) {
      return this.on(2 /* StateChange */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "PopoverCore";
    }
  };

  // domains/ui/progress/index.ts
  var DEFAULT_MAX = 100;
  var ProgressCore = class extends BaseDomain {
    constructor(options) {
      super();
      __publicField(this, "_value");
      __publicField(this, "_label");
      __publicField(this, "_max");
      const { value: valueProp, max: maxProp, getValueLabel = defaultGetValueLabel } = options;
      const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
      this._max = max;
      const value = isValidValueNumber(valueProp, max) ? valueProp : null;
      this._value = value;
      const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
      this._label = valueLabel;
    }
    get state() {
      var _a4;
      return {
        state: getProgressState(this._value, this._max),
        value: (_a4 = this._value) != null ? _a4 : void 0,
        max: this._max,
        label: this._label
      };
    }
    setValue(v2) {
      this._value = v2;
      this.emit(0 /* ValueChange */, v2);
      this.emit(1 /* StateChange */, this.state);
    }
    update(v2) {
      this._value = v2;
      this.emit(0 /* ValueChange */, v2);
      this.emit(1 /* StateChange */, this.state);
    }
    onValueChange(handler4) {
      this.on(0 /* ValueChange */, handler4);
    }
    onStateChange(handler4) {
      this.on(1 /* StateChange */, handler4);
    }
  };
  function defaultGetValueLabel(value, max) {
    return `${Math.round(value / max * 100)}%`;
  }
  function getProgressState(value, maxValue) {
    return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  function isValidMaxNumber(max) {
    return isNumber(max) && !isNaN(max) && max > 0;
  }
  function isValidValueNumber(value, max) {
    return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
  }

  // domains/ui/collection/index.ts
  var CollectionCore = class extends BaseDomain {
    constructor() {
      super(...arguments);
      __publicField(this, "itemMap", /* @__PURE__ */ new Map());
    }
    setWrap(wrap) {
    }
    add(key, v2) {
      this.itemMap.set(key, v2);
    }
    remove(key) {
      this.itemMap.delete(key);
    }
    getItems() {
      const items = Array.from(this.itemMap.values());
      return items;
    }
  };

  // domains/ui/roving-focus/index.ts
  var RovingFocusCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "collection");
      __publicField(this, "state", {
        currentTabStopId: null,
        orientation: "horizontal",
        dir: "ltr"
      });
      const { _name } = options;
      this.collection = new CollectionCore();
    }
    focusItem(id) {
      this.emit(0 /* ItemFocus */, id);
    }
    shiftTab() {
      this.emit(1 /* ItemShiftTab */);
    }
    addFocusableItem() {
      this.emit(2 /* FocusableItemAdd */);
    }
    removeFocusableItem() {
      this.emit(3 /* FocusableItemRemove */);
    }
    onStateChange(handler4) {
      this.on(4 /* StateChange */, handler4);
    }
    onItemFocus(handler4) {
      this.on(0 /* ItemFocus */, handler4);
    }
    onItemShiftTab(handler4) {
      this.on(1 /* ItemShiftTab */, handler4);
    }
    onFocusableItemAdd(handler4) {
      this.on(2 /* FocusableItemAdd */, handler4);
    }
    onFocusableItemRemove(handler4) {
      this.on(3 /* FocusableItemRemove */, handler4);
    }
  };

  // domains/ui/scroll-view/utils.ts
  function getPoint(e) {
    if (e.touches) {
      return {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
    }
    if (e.clientX && e.clientY) {
      return {
        x: e.clientX,
        y: e.clientY
      };
    }
    return {
      x: 0,
      y: 0
    };
  }
  function preventDefault(e) {
    if (e && e.cancelable && !e.defaultPrevented && e.preventDefault) {
      e.preventDefault();
    }
  }
  function damping(x2, max) {
    let y2 = Math.abs(x2);
    y2 = 0.82231 * max / (1 + 4338.47 / Math.pow(y2, 1.14791));
    return Math.round(x2 < 0 ? -y2 : y2);
  }
  function getAngleByPoints(lastPoint, curPoint) {
    const x2 = Math.abs(lastPoint.x - curPoint.x);
    const y2 = Math.abs(lastPoint.y - curPoint.y);
    const z = Math.sqrt(x2 * x2 + y2 * y2);
    if (z !== 0) {
      const angle = Math.asin(y2 / z) / Math.PI * 180;
      return angle;
    }
    return 0;
  }

  // domains/ui/scroll-view/index.ts
  var handler = null;
  function onCreateScrollView(h2) {
    handler = h2;
  }
  var ScrollViewCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "os", {
        android: true,
        ios: false,
        pc: false,
        wechat: false
      });
      /** 尺寸信息 */
      __publicField(this, "rect", {
        width: 0,
        height: 0,
        scrollTop: 0,
        contentHeight: 0
      });
      __publicField(this, "disabled", false);
      __publicField(this, "canPullToRefresh");
      __publicField(this, "canReachBottom", true);
      /** 隐藏下拉刷新指示器 */
      __publicField(this, "needHideIndicator", false);
      __publicField(this, "scrollable", true);
      /** 下拉刷新相关的状态信息 */
      __publicField(this, "pullToRefresh", {
        step: "pending",
        pullStartX: 0,
        pullStartY: 0,
        pullMoveX: 0,
        pullMoveY: 0,
        distX: 0,
        distY: 0,
        distResisted: 0
      });
      /** 滚动到底部的阈值 */
      __publicField(this, "threshold", 120);
      __publicField(this, "options");
      __publicField(this, "pullToRefreshOptions");
      __publicField(this, "isPullToRefreshing", false);
      __publicField(this, "isLoadingMore", false);
      __publicField(this, "startPoint", null);
      __publicField(this, "lastPoint", {
        x: 0,
        y: 0
      });
      __publicField(this, "downHight", 0);
      __publicField(this, "upHight", 0);
      __publicField(this, "maxTouchMoveInstanceY", 0);
      __publicField(this, "inTouchEnd", false);
      __publicField(this, "inTopWhenPointDown", false);
      __publicField(this, "inBottomWhenPointDown", false);
      __publicField(this, "isMoveDown", false);
      __publicField(this, "isMoveUp", false);
      __publicField(this, "isScrollTo", false);
      /**
       * 为了让 StartPullToRefresh、OutOffset 等事件在拖动过程中仅触发一次的标记
       */
      __publicField(this, "movetype", "pending");
      __publicField(this, "preScrollY", 0);
      /** 标记上拉已经自动执行过，避免初始化时多次触发上拉回调 */
      __publicField(this, "isUpAutoLoad", false);
      /** 显示下拉进度布局 */
      __publicField(this, "startPullToRefresh", () => {
        if (this.isPullToRefreshing) {
          return;
        }
        this.isPullToRefreshing = true;
        this.downHight = this.pullToRefreshOptions.offset;
        this.setIndicatorHeightTransition(true);
        this.changeIndicatorHeight(this.downHight);
        this.emit(3 /* PullToRefresh */);
      });
      /** 结束下拉刷新 */
      __publicField(this, "finishPullToRefresh", () => {
        if (!this.isPullToRefreshing) {
          return;
        }
        this.downHight = 0;
        this.changeIndicatorHeight(0);
        this.isPullToRefreshing = false;
        this.emit(4 /* PullToRefreshFinished */);
      });
      __publicField(this, "disablePullToRefresh", () => {
        this.pullToRefreshOptions.isLock = true;
      });
      __publicField(this, "enablePullToRefresh", () => {
        this.pullToRefreshOptions.isLock = false;
      });
      __publicField(this, "handleMouseDown", (event) => {
        this.handlePointDown(event);
      });
      __publicField(this, "handleMouseMove", (event) => {
        this.handlePointMove(event);
      });
      __publicField(this, "handleTouchStart", (event) => {
        this.handlePointDown(event);
      });
      __publicField(this, "handleTouchMove", (event) => {
        this.handlePointMove(event);
      });
      /** 鼠标/手指按下 */
      __publicField(this, "handlePointDown", (e) => {
        if (this.isScrollTo) {
          preventDefault(e);
        }
        const startPoint = getPoint(e);
        if (startPoint.x < 30) {
          this.startPoint = null;
          preventDefault(e);
          return;
        }
        this.startPoint = startPoint;
        this.lastPoint = this.startPoint;
        this.maxTouchMoveInstanceY = this.getBodyHeight() - this.pullToRefreshOptions.bottomOffset;
        this.inTouchEnd = false;
        const scrollTop = this.getScrollTop();
        this.inTopWhenPointDown = scrollTop === 0;
      });
      /** 鼠标/手指移动 */
      __publicField(this, "handlePointMove", (e) => {
        if (!this.startPoint) {
          return;
        }
        const scrollTop = this.getScrollTop();
        if (scrollTop > 0) {
          this.inTopWhenPointDown = false;
        }
        const curPoint = getPoint(e);
        const instanceY = curPoint.y - this.startPoint.y;
        if (instanceY > 0) {
          if (scrollTop <= 0) {
            preventDefault(e);
            if (this.canPullToRefresh && !this.inTouchEnd && !this.isPullToRefreshing) {
              if (!this.inTopWhenPointDown) {
                return;
              }
              const angle = getAngleByPoints(this.lastPoint, curPoint);
              if (angle && angle < this.pullToRefreshOptions.minAngle) {
                return;
              }
              if (this.maxTouchMoveInstanceY > 0 && curPoint.y >= this.maxTouchMoveInstanceY) {
                this.inTouchEnd = true;
                this.handleTouchEnd();
                return;
              }
              if (this.downHight < this.pullToRefreshOptions.offset) {
                if (this.movetype !== "pulling") {
                  if (this.movetype === "pending") {
                    this.setIndicatorHeightTransition(false);
                    if (this.os.ios && !this.inTopWhenPointDown) {
                      this.optimizeScroll(true);
                    }
                  }
                  if (this.movetype === "releasing") {
                  }
                  this.movetype = "pulling";
                  this.emit(0 /* InDownOffset */);
                  this.isMoveDown = true;
                }
              } else {
                if (this.movetype !== "releasing") {
                  this.movetype = "releasing";
                  this.emit(1 /* OutDownOffset */);
                  this.isMoveDown = true;
                }
              }
              this.downHight = damping(curPoint.y - this.startPoint.y, 1e3);
              this.changeIndicatorHeight(this.downHight);
              this.emit(2 /* Pulling */, {
                instance: this.downHight
              });
            }
          }
        }
        if (instanceY < 0) {
          const scrollHeight = this.getScrollHeight();
          const clientHeight = this.getScrollClientHeight();
          const toBottom = scrollHeight - clientHeight - scrollTop;
          if (toBottom <= 0) {
            preventDefault(e);
          }
        }
        this.lastPoint = curPoint;
      });
      __publicField(this, "handleTouchEnd", () => {
        if (!this.canPullToRefresh) {
          return;
        }
        if (!this.isMoveDown) {
          return;
        }
        if (this.downHight >= this.pullToRefreshOptions.offset) {
          this.startPullToRefresh();
        } else {
          this.downHight = 0;
          this.setIndicatorHeightTransition(true);
          this.changeIndicatorHeight(0);
        }
        this.optimizeScroll(false);
        this.movetype = "pending";
        this.isMoveDown = false;
      });
      __publicField(this, "handleScrolling", () => {
        const scrollTop = this.getScrollTop();
        const isUp = scrollTop - this.preScrollY > 0;
        if (!this.isLoadingMore) {
          const toBottom = this.getScrollHeight() - this.getScrollClientHeight() - scrollTop;
          if (toBottom <= this.threshold && isUp) {
            this.isLoadingMore = true;
            this.emit(8 /* ReachBottom */);
          }
        }
        this.emit(7 /* Scrolling */, { scrollTop });
      });
      __publicField(this, "setBounce", (isBounce) => {
        console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 setBounce \u65B9\u6CD5");
      });
      __publicField(this, "hideIndicator", () => {
        console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 hideIndicator \u65B9\u6CD5");
      });
      /**
       * 滑动列表到指定位置
       * 带缓冲效果 (y=0 回到顶部；如果要滚动到底部可以传一个较大的值，比如 99999)
       */
      __publicField(this, "scrollTo", (position, duration = 300) => {
        console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 scrollTo \u65B9\u6CD5");
      });
      /* 销毁mescroll */
      __publicField(this, "destroy", () => {
        console.error("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 destroy \u65B9\u6CD5");
      });
      const { os, offset = 80, disabled = false, onScroll, onReachBottom, onPullToRefresh, onPullToBack } = props;
      this.options = props;
      this.disabled = disabled;
      if (os) {
        this.os = os;
      }
      this.pullToRefreshOptions = {
        isLock: false,
        offset,
        bottomOffset: 20,
        minAngle: 45
      };
      this.canPullToRefresh = !!onPullToRefresh;
      if (!this.canPullToRefresh) {
        this.needHideIndicator = true;
      }
      if (this.needHideIndicator) {
        this.pullToRefreshOptions.offset = 9999;
      }
      if (onScroll) {
        this.onScroll(onScroll);
      }
      if (onReachBottom) {
        this.onReachBottom(onReachBottom);
      }
      if (onPullToRefresh) {
        this.onPullToRefresh(onPullToRefresh);
      }
      if (handler) {
        handler(this);
      }
    }
    get state() {
      return {
        top: 0,
        left: 0,
        step: this.movetype,
        scrollTop: this.downHight,
        pullToRefresh: this.canPullToRefresh,
        scrollable: this.scrollable
      };
    }
    setReady() {
      this.emit(9 /* Mounted */);
    }
    setRect(rect) {
      this.rect = __spreadValues(__spreadValues({}, this.rect), rect);
    }
    finishLoadingMore() {
      this.isLoadingMore = false;
    }
    setMounted() {
      this.emit(9 /* Mounted */);
    }
    refreshRect() {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 refreshRect \u65B9\u6CD5");
    }
    changeIndicatorHeight(height) {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 changeDownIndicatorHeight \u65B9\u6CD5");
    }
    setIndicatorHeightTransition(set) {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 addDownIndicatorHeightTransition \u65B9\u6CD5");
    }
    optimizeScroll(optimize) {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 optimizeScroll \u65B9\u6CD5");
    }
    /* 滚动条到底部的距离 */
    getToBottom() {
      return this.getScrollHeight() - this.getScrollClientHeight() - this.getScrollTop();
    }
    /* 获取元素到 mescroll 滚动列表顶部的距离 */
    getOffsetTop(dom) {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 getScrollHeight \u65B9\u6CD5");
      return 0;
    }
    /* 滚动内容的高度 */
    getScrollHeight() {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 getScrollHeight \u65B9\u6CD5");
      return 0;
    }
    /** 获取滚动容器的高度 */
    getScrollClientHeight() {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 getClientHeight \u65B9\u6CD5");
      return 0;
    }
    /* 滚动条的位置 */
    getScrollTop() {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 getScrollTop \u65B9\u6CD5");
      return 0;
    }
    addScrollTop(difference) {
      this.setScrollTop(this.getScrollTop() + difference);
    }
    /* 设置滚动条的位置 */
    setScrollTop(y2) {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 setScrollTop \u65B9\u6CD5");
    }
    /* body的高度 */
    getBodyHeight() {
      console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 getBodyHeight \u65B9\u6CD5");
      return 0;
    }
    inDownOffset(handler4) {
      return this.on(0 /* InDownOffset */, handler4);
    }
    outDownOffset(handler4) {
      return this.on(1 /* OutDownOffset */, handler4);
    }
    onPulling(handler4) {
      return this.on(2 /* Pulling */, handler4);
    }
    onScroll(handler4) {
      return this.on(7 /* Scrolling */, handler4);
    }
    onReachBottom(handler4) {
      return this.on(8 /* ReachBottom */, handler4);
    }
    onPullToRefresh(handler4) {
      this.canPullToRefresh = true;
      return this.on(3 /* PullToRefresh */, handler4);
    }
    onMounted(handler4) {
      return this.on(9 /* Mounted */, handler4);
    }
  };

  // domains/ui/select/index.ts
  var SelectCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      __publicField(this, "shape", "select");
      __publicField(this, "name", "SelectCore");
      __publicField(this, "debug", true);
      // options: { text: string; store: SelectItemCore<T> }[] = [];
      __publicField(this, "placeholder");
      __publicField(this, "options", []);
      __publicField(this, "defaultValue", null);
      __publicField(this, "value", null);
      __publicField(this, "disabled", false);
      __publicField(this, "open", false);
      __publicField(this, "popper");
      __publicField(this, "popover");
      __publicField(this, "presence", new PresenceCore());
      __publicField(this, "collection");
      __publicField(this, "layer");
      __publicField(this, "position", "popper");
      /** 参考点位置 */
      __publicField(this, "triggerPos", {
        x: 0,
        y: 0
      });
      __publicField(this, "reference", null);
      /** 触发按钮 */
      __publicField(this, "trigger", null);
      __publicField(this, "wrap", null);
      /** 下拉列表 */
      __publicField(this, "content", null);
      /** 下拉列表容器 */
      __publicField(this, "viewport", null);
      /** 选中的 item */
      __publicField(this, "selectedItem", null);
      __publicField(this, "_findFirstValidItem", false);
      const { defaultValue, placeholder = "\u70B9\u51FB\u9009\u62E9", options = [], onChange } = props;
      this.options = options.map((opt) => {
        return {
          label: opt.label,
          value: opt.value,
          selected: opt.value === defaultValue
        };
      });
      this.value = defaultValue;
      this.defaultValue = defaultValue;
      this.placeholder = placeholder;
      const matched = this.options.find((opt) => opt.value === defaultValue);
      if (matched) {
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
        this.emit(1 /* Change */, defaultValue);
      }
      this.popper = new PopperCore();
      this.popover = new PopoverCore();
      this.layer = new DismissableLayerCore();
      this.collection = new CollectionCore();
      this.popper.onReferenceMounted((reference) => {
        const { x: x2, y: y2, width, height } = reference.getRect();
        this.reference = {
          width,
          height,
          x: x2,
          y: y2,
          left: x2,
          right: x2 + width,
          top: y2,
          bottom: y2 + height
        };
      });
      this.layer.onDismiss(() => {
        console.log(...this.log("this.layer.onDismiss"));
        this.hide();
      });
      this.presence.onStateChange(() => this.emit(0 /* StateChange */, __spreadValues({}, this.state)));
      if (onChange) {
        this.onChange(onChange);
      }
    }
    get state() {
      var _a4;
      return {
        options: this.options,
        value: this.value,
        value2: (_a4 = this.options.find((opt) => opt.value === this.value)) != null ? _a4 : null,
        open: this.open,
        disabled: this.disabled,
        placeholder: this.placeholder,
        required: false,
        dir: "ltr",
        styles: {},
        enter: this.presence.state.enter,
        visible: this.presence.state.visible,
        exit: this.presence.state.exit
      };
    }
    mapViewModelWithIndex(index) {
      return this.options[index];
    }
    setTriggerPointerDownPos(pos) {
      this.triggerPos = pos;
    }
    setTrigger(trigger) {
      this.trigger = trigger;
    }
    setWrap(wrap) {
      this.wrap = wrap;
    }
    setContent(content) {
      this.content = content;
    }
    setViewport(viewport) {
      this.viewport = viewport;
    }
    // setValue(value: SelectValueCore) {
    //   this.value = value;
    // }
    setSelectedItem(item) {
      this.selectedItem = item;
    }
    show() {
      return __async(this, null, function* () {
        if (this.disabled) {
          return;
        }
        this.popper.place();
        this.open = true;
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      });
    }
    hide() {
      this.presence.hide();
      if (this.open === false) {
        return;
      }
      this.open = false;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    addNativeOption() {
    }
    removeNativeOption() {
    }
    // appendItem(item: SelectItemCore<T>) {
    //   if (this.options.find((opt) => opt.store === item)) {
    //     return;
    //   }
    //   item.onLeave(() => {
    //     this.focus();
    //   });
    //   item.onUnmounted(() => {
    //     this.options = this.options.filter((opt) => opt.store !== item);
    //   });
    //   const findFirstValidItem = !this._findFirstValidItem && !this.state.disabled;
    //   if (findFirstValidItem) {
    //     this._findFirstValidItem = true;
    //   }
    //   const isSelected = this.state.value === item.state.value;
    //   if (findFirstValidItem || isSelected) {
    //     this.setSelectedItem(item);
    //   }
    //   this.options.push({
    //     text: item.text,
    //     store: item,
    //   });
    // }
    /** 选择 item */
    select(value) {
      if (this.value === value) {
        return;
      }
      this.value = value;
      for (let i = 0; i < this.options.length; i += 1) {
        const it = this.options[i];
        it.selected = false;
        if (it.value === value) {
          it.selected = true;
        }
      }
      this.emit(1 /* Change */, value);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      this.hide();
    }
    focus() {
      this.emit(2 /* Focus */);
    }
    setOptions(options) {
      this.options = options.map((opt) => {
        return {
          label: opt.label,
          value: opt.value,
          selected: opt.value === this.value
        };
      });
      if (this.value === null) {
        return;
      }
      const matched = this.options.find((opt) => opt.value === this.value);
      if (matched) {
        return;
      }
      this.value = null;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      this.emit(1 /* Change */, this.value);
    }
    setValue(v2) {
      if (v2 === null) {
        this.value = null;
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
        this.emit(1 /* Change */, v2);
        return;
      }
      this.value = v2;
      this.options = this.options.map((opt) => {
        return {
          label: opt.label,
          value: opt.value,
          selected: opt.value === this.value
        };
      });
      this.emit(1 /* Change */, v2);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    clear() {
      this.value = null;
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      this.emit(1 /* Change */, this.value);
    }
    setPosition() {
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
    onValueChange(handler4) {
      return this.on(1 /* Change */, handler4);
    }
    onChange(handler4) {
      return this.on(1 /* Change */, handler4);
    }
    onFocus(handler4) {
      return this.on(2 /* Focus */, handler4);
    }
  };
  var SelectInListCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "options", []);
      __publicField(this, "list", []);
      __publicField(this, "cached", /* @__PURE__ */ new Map());
      __publicField(this, "values", /* @__PURE__ */ new Map());
      const { options = [] } = props;
      this.options = options;
    }
    bind(unique_id, extra) {
      const { defaultValue } = extra || { defaultValue: null };
      const existing = this.cached.get(unique_id);
      if (existing) {
        return existing;
      }
      const select = new SelectCore({
        defaultValue,
        options: this.options,
        onChange: (value) => {
          this.values.set(unique_id, value);
          this.emit(1 /* Change */, [unique_id, value]);
        }
      });
      this.list.push(select);
      this.values.set(unique_id, defaultValue);
      this.cached.set(unique_id, select);
      return select;
    }
    setOptions(options) {
      this.options = options;
      if (this.list.length === 0) {
        return;
      }
      for (let i = 0; i < this.list.length; i += 1) {
        const item = this.list[i];
        item.setOptions(options);
      }
    }
    setValue(v2) {
      for (let i = 0; i < this.list.length; i += 1) {
        const item = this.list[i];
        item.setValue(v2);
      }
    }
    getValue(key) {
      var _a4;
      return (_a4 = this.values.get(key)) != null ? _a4 : null;
    }
    clear() {
      this.list = [];
      this.cached = /* @__PURE__ */ new Map();
      this.values = /* @__PURE__ */ new Map();
    }
    toJson(handler4) {
      const result = [];
      for (const [obj, value] of this.values) {
        const r = handler4([obj, value]);
        result.push(r);
      }
      return result;
    }
    /** 清空触发点击事件时保存的按钮 */
    // clear() {
    //   this.cur = null;
    // }
    onChange(handler4) {
      this.on(1 /* Change */, handler4);
    }
    onStateChange(handler4) {
      this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/ui/tabs/index.ts
  var TabsCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "roving");
      __publicField(this, "prevContent", null);
      __publicField(this, "contents", []);
      __publicField(this, "state", {
        curValue: null,
        orientation: "horizontal",
        dir: "ltr"
      });
      this.roving = new RovingFocusCore();
    }
    selectTab(value) {
      const matchedContent = this.contents.find((c) => c.value === value);
      if (!matchedContent) {
        return;
      }
      if (this.prevContent) {
        this.prevContent.presence.hide();
      }
      matchedContent.presence.show();
      this.prevContent = matchedContent;
      this.emit(1 /* ValueChange */, value);
    }
    appendContent(content) {
      if (this.contents.includes(content)) {
        return;
      }
      this.contents.push(content);
    }
    onStateChange(handler4) {
      this.on(0 /* StateChange */, handler4);
    }
    onValueChange(handler4) {
      this.on(1 /* ValueChange */, handler4);
    }
  };

  // domains/ui/toast/index.ts
  var ToastCore = class extends BaseDomain {
    constructor(options = {}) {
      super(options);
      __publicField(this, "name", "ToastCore");
      __publicField(this, "present", new PresenceCore());
      __publicField(this, "delay", 1200);
      __publicField(this, "timer", null);
      __publicField(this, "open", false);
      __publicField(this, "_mask", false);
      __publicField(this, "_icon", null);
      __publicField(this, "_texts", []);
      const { delay } = options;
      if (delay) {
        this.delay = delay;
      }
      this.present.onShow(() => {
        this.open = true;
        this.emit(4 /* OpenChange */, true);
      });
      this.present.onHidden(() => {
        this.open = false;
        this.emit(4 /* OpenChange */, false);
      });
      this.present.onStateChange(() => this.emit(7 /* StateChange */, __spreadValues({}, this.state)));
    }
    get state() {
      return {
        mask: this._mask,
        icon: this._icon,
        texts: this._texts,
        enter: this.present.state.enter,
        visible: this.present.state.visible,
        exit: this.present.state.exit
      };
    }
    /** 显示弹窗 */
    show(params) {
      return __async(this, null, function* () {
        const { mask = false, icon, texts } = params;
        this._mask = mask;
        this._icon = icon;
        this._texts = texts;
        this.emit(7 /* StateChange */, __spreadValues({}, this.state));
        if (this.timer !== null) {
          this.clearTimer();
          if (this._icon === "loading") {
            return;
          }
          this.timer = setTimeout(() => {
            this.hide();
          }, this.delay);
          return;
        }
        this.present.show();
        if (this._icon === "loading") {
          return;
        }
        this.timer = setTimeout(() => {
          this.hide();
        }, this.delay);
      });
    }
    clearTimer() {
      if (this.timer === null) {
        return;
      }
      clearTimeout(this.timer);
      this.timer = null;
    }
    /** 隐藏弹窗 */
    hide() {
      this.present.hide();
      this.clearTimer();
    }
    onShow(handler4) {
      return this.on(1 /* Show */, handler4);
    }
    onHide(handler4) {
      return this.on(3 /* Hidden */, handler4);
    }
    onOpenChange(handler4) {
      return this.on(4 /* OpenChange */, handler4);
    }
    onStateChange(handler4) {
      return this.on(7 /* StateChange */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "ToastCore";
    }
  };

  // domains/ui/tree/utils.ts
  var utils_exports = {};
  __export(utils_exports, {
    calcDropPosition: () => calcDropPosition,
    computeMoveNeededParams: () => computeMoveNeededParams,
    findSourceNodeByKey: () => findSourceNodeByKey,
    formatSourceNodes: () => formatSourceNodes,
    getDraggingNodesKey: () => getDraggingNodesKey,
    getOffset: () => getOffset,
    insertToBottom: () => insertToBottom,
    insertToTop: () => insertToTop,
    isInclude: () => isInclude,
    noop: () => noop,
    traverseTreeNodes: () => traverseTreeNodes
  });
  function noop() {
  }
  var formatSourceNodes = (sourceNodes, level = 1, parentPos) => sourceNodes.map((sourceNode, i) => {
    const _a4 = sourceNode, { key, title } = _a4, restProps = __objRest(_a4, ["key", "title"]);
    const formattedSourceNode = __spreadProps(__spreadValues({}, restProps), {
      key,
      title,
      pos: parentPos === void 0 ? String(i) : `${parentPos}-${i}`
    });
    if (sourceNode.children && sourceNode.children.length) {
      const nextLevel = level + 1;
      formattedSourceNode.children = formatSourceNodes(sourceNode.children, nextLevel, formattedSourceNode.pos);
    }
    return formattedSourceNode;
  });
  function traverseTreeNodes(treeNodes = [], callback) {
    function traverse(subTreeNodes, level, parentsChildrenPos, parentPos) {
      let newSubTreeNodes = subTreeNodes;
      if (subTreeNodes && subTreeNodes.length) {
        newSubTreeNodes = subTreeNodes.filter(Boolean);
      }
      newSubTreeNodes.forEach((treeNode, index) => {
        if (!treeNode.isTreeNode) {
          return;
        }
        const { pos } = treeNode;
        parentsChildrenPos.push(pos);
        const childrenPos = [];
        if (treeNode.$children) {
          traverse(treeNode.$children, pos, childrenPos, pos);
        }
        callback(treeNode, index, pos, treeNode.rckey || pos, childrenPos, parentPos);
      });
    }
    traverse(treeNodes, 0, []);
  }
  function isInclude(smallArray, bigArray) {
    return smallArray.every((item, index) => item === bigArray[index]);
  }
  function getDraggingNodesKey(treeNode) {
    const dragNodesKeys = [];
    const treeNodePosArr = treeNode.pos.split("-");
    traverseTreeNodes(treeNode.$children, (item, index, pos, key) => {
      const childPosArr = pos.split("-");
      if ((treeNode.pos === pos || treeNodePosArr.length < childPosArr.length) && isInclude(treeNodePosArr, childPosArr)) {
        dragNodesKeys.push(key);
      }
    });
    dragNodesKeys.push(treeNode.rckey);
    return dragNodesKeys;
  }
  function getOffset(ele) {
    if (!ele.getClientRects().length) {
      return { top: 0, left: 0 };
    }
    const rect = ele.getBoundingClientRect();
    if (rect.width || rect.height) {
      const doc = ele.ownerDocument;
      const win = doc.defaultView;
      const docElem = doc.documentElement;
      return {
        top: rect.top + win.pageYOffset - docElem.clientTop,
        left: rect.left + win.pageXOffset - docElem.clientLeft
      };
    }
    return rect;
  }
  function calcDropPosition(e, treeNode) {
    const { selectHandle } = treeNode.$refs;
    const offsetTop = getOffset(selectHandle).top;
    const offsetHeight = selectHandle.offsetHeight;
    const pageY = e.pageY;
    const gapHeight = 2;
    if (pageY > offsetTop + offsetHeight - gapHeight) {
      return -1 /* BOTTOM */;
    }
    if (pageY < offsetTop + gapHeight) {
      return 1 /* TOP */;
    }
    return 0 /* CONTENT */;
  }
  var findSourceNodeByKey = (sourceNodes, key, callback) => {
    sourceNodes.forEach((sourceNode, index, arr) => {
      if (sourceNode.key === key) {
        return callback(sourceNode, index, arr);
      }
      if (sourceNode.children) {
        return findSourceNodeByKey(sourceNode.children, key, callback);
      }
      return false;
    });
  };
  function computeMoveNeededParams(sourceNodes, draggingNodeKey, targetNodeKey, targetPosition) {
    const isDropToGap = targetPosition !== 0 /* CONTENT */;
    let draggingSourceNode;
    let hasSameLevelNodesAsDraggingNode;
    let draggingNodeIndexAtSameLevelNodes;
    findSourceNodeByKey(sourceNodes, draggingNodeKey, (sourceNode, index, arr) => {
      hasSameLevelNodesAsDraggingNode = arr;
      draggingNodeIndexAtSameLevelNodes = index;
      draggingSourceNode = sourceNode;
    });
    let hasSameLevelNodesAsTargetNode = null;
    let targetNodeIndexAtSameLevelNodes;
    if (!isDropToGap) {
      let targetSourceNode = null;
      const findSourceNodeCallback2 = (sourceNode) => {
        targetSourceNode = sourceNode;
      };
      findSourceNodeByKey(sourceNodes, targetNodeKey, findSourceNodeCallback2);
      return {
        targetSourceNode,
        originSourceNode: draggingSourceNode,
        originSourceNodeIndex: draggingNodeIndexAtSameLevelNodes,
        originSourceNodes: hasSameLevelNodesAsDraggingNode
      };
    }
    const findSourceNodeCallback = (_2, index, nodes) => {
      hasSameLevelNodesAsTargetNode = nodes;
      targetNodeIndexAtSameLevelNodes = index;
    };
    findSourceNodeByKey(sourceNodes, targetNodeKey, findSourceNodeCallback);
    return {
      targetSourceNodes: hasSameLevelNodesAsTargetNode,
      targetSourceNodeIndex: targetNodeIndexAtSameLevelNodes,
      originSourceNode: draggingSourceNode,
      originSourceNodeIndex: draggingNodeIndexAtSameLevelNodes,
      originSourceNodes: hasSameLevelNodesAsDraggingNode
    };
  }
  function insertToTop(targetSourceNodeIndex, targetSourceNodes, originSourceNode, originSourceNodeIndex, originSourceNodes) {
    if (originSourceNodes !== targetSourceNodes || originSourceNodeIndex > targetSourceNodeIndex) {
      originSourceNodes.splice(originSourceNodeIndex, 1);
      targetSourceNodes.splice(targetSourceNodeIndex, 0, originSourceNode);
      return {
        targetSourceNodes,
        originSourceNodes
      };
    }
    targetSourceNodes.splice(targetSourceNodeIndex, 0, originSourceNode);
    originSourceNodes.splice(originSourceNodeIndex, 1);
    return {
      targetSourceNodes,
      originSourceNodes
    };
  }
  function insertToBottom(targetSourceNodeIndex, targetSourceNodes, originSourceNode, originSourceNodeIndex, originSourceNodes) {
    let newTargetSourceNodeIndex = targetSourceNodeIndex + 1;
    if (originSourceNodes === targetSourceNodes) {
      if (targetSourceNodeIndex > originSourceNodeIndex) {
        newTargetSourceNodeIndex = targetSourceNodeIndex;
      }
    }
    originSourceNodes.splice(originSourceNodeIndex, 1);
    targetSourceNodes.splice(newTargetSourceNodeIndex, 0, originSourceNode);
    return {
      targetSourceNodes,
      originSourceNodes
    };
  }

  // domains/ui/tree/index.ts
  var TreeCore = class extends BaseDomain {
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/ui/menu/item.ts
  var MenuItemCore = class extends BaseDomain {
    constructor(options) {
      super(options);
      __publicField(this, "_name", "MenuItemCore");
      __publicField(this, "debug", true);
      __publicField(this, "label");
      __publicField(this, "tooltip");
      __publicField(this, "icon");
      __publicField(this, "shortcut");
      /** 子菜单 */
      __publicField(this, "menu", null);
      /** 子菜单是否展示 */
      __publicField(this, "_open", false);
      __publicField(this, "_hidden", false);
      __publicField(this, "_enter", false);
      __publicField(this, "_focused", false);
      __publicField(this, "_disabled", false);
      const { _name, tooltip, label, icon, shortcut, disabled = false, hidden = false, menu, onClick } = options;
      this.label = label;
      this.tooltip = tooltip;
      this.icon = icon;
      this.shortcut = shortcut;
      this._hidden = hidden;
      this._disabled = disabled;
      if (_name) {
        this._name = _name;
      }
      if (menu) {
        this.menu = menu;
        menu.onShow(() => {
          this._open = true;
          this.emit(5 /* Change */, __spreadValues({}, this.state));
        });
        menu.onHide(() => {
          this._open = false;
          this.emit(5 /* Change */, __spreadValues({}, this.state));
        });
      }
      if (onClick) {
        this.onClick(onClick.bind(this));
      }
    }
    get state() {
      return {
        label: this.label,
        icon: this.icon,
        shortcut: this.shortcut,
        open: this._open,
        disabled: this._disabled,
        focused: this._focused || this._open
      };
    }
    get hidden() {
      return this._hidden;
    }
    setIcon(icon) {
      this.icon = icon;
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    /** 禁用指定菜单项 */
    disable() {
      this._disabled = true;
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    /** 启用指定菜单项 */
    enable() {
      this._disabled = false;
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    /** 鼠标进入菜单项 */
    handlePointerEnter() {
      if (this._enter) {
        return;
      }
      this._enter = true;
      this._focused = true;
      this.emit(0 /* Enter */);
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    handlePointerMove() {
    }
    /** 鼠标离开菜单项 */
    handlePointerLeave() {
      if (this._enter === false) {
        return;
      }
      this._enter = false;
      this._focused = false;
      this.emit(1 /* Leave */);
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    handleFocus() {
      if (this._focused) {
        return;
      }
      this._focused = true;
      this.emit(2 /* Focus */);
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    handleBlur() {
      if (this._focused === false) {
        return;
      }
      this._enter = false;
      this.blur();
    }
    handleClick() {
      if (this._disabled) {
        return;
      }
      this.emit(4 /* Click */);
    }
    blur() {
      this._focused = false;
      this.emit(3 /* Blur */);
      this.emit(5 /* Change */, __spreadValues({}, this.state));
    }
    reset() {
      this._focused = false;
      this._open = false;
      this._enter = false;
      if (this.menu) {
        this.menu.reset();
      }
    }
    hide() {
      this._hidden = true;
    }
    show() {
      this._hidden = false;
    }
    unmount() {
      super.destroy();
      if (this.menu) {
        this.menu.unmount();
      }
      this.reset();
    }
    onEnter(handler4) {
      return this.on(0 /* Enter */, handler4);
    }
    onLeave(handler4) {
      return this.on(1 /* Leave */, handler4);
    }
    onFocus(handler4) {
      return this.on(2 /* Focus */, handler4);
    }
    onBlur(handler4) {
      return this.on(3 /* Blur */, handler4);
    }
    onClick(handler4) {
      return this.on(4 /* Click */, handler4);
    }
    onStateChange(handler4) {
      return this.on(5 /* Change */, handler4);
    }
    get [Symbol.toStringTag]() {
      return "MenuItem";
    }
  };

  // domains/ui/checkbox/group.ts
  var CheckboxGroupCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "shape", "checkbox-group");
      __publicField(this, "options", []);
      __publicField(this, "disabled");
      __publicField(this, "values", []);
      __publicField(this, "prevChecked", false);
      const { options = [], disabled = false, onChange } = props;
      this.disabled = disabled;
      this.options = options.map((opt) => {
        const { label, value, checked, disabled: disabled2 } = opt;
        const store = new CheckboxCore({
          label,
          checked,
          disabled: disabled2,
          onChange: (checked2) => {
            const existing = this.values.includes(value);
            if (checked2 && !existing) {
              this.checkOption(value);
              return;
            }
            if (!checked2 && existing) {
              this.uncheckOption(value);
            }
          }
        });
        return {
          label,
          value,
          core: store
        };
      });
      if (onChange) {
        this.onChange(onChange);
      }
    }
    get indeterminate() {
      return this.values.length === this.options.length;
    }
    get state() {
      return {
        values: this.values,
        options: this.options,
        disabled: this.disabled,
        indeterminate: this.indeterminate
      };
    }
    checkOption(value) {
      console.log("[DOMAIN]domains/ui/checkbox/group - checkOption", value);
      this.values = this.values.concat(value);
      this.emit(1 /* Change */, [...this.values]);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    uncheckOption(value) {
      console.log("[DOMAIN]domains/ui/checkbox/group - uncheckOption", value);
      this.values = this.values.filter((v2) => {
        return v2 !== value;
      });
      this.emit(1 /* Change */, [...this.values]);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    reset() {
      this.values = [];
      this.emit(1 /* Change */, [...this.values]);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    setOptions(options) {
      for (let i = 0; i < this.options.length; i += 1) {
        const opt = this.options[i];
        opt.core.destroy();
      }
      this.options = options.map((opt) => {
        const { label, value, checked, disabled } = opt;
        const store = new CheckboxCore({
          label,
          checked,
          disabled,
          onChange: (checked2) => {
            const existing = this.values.includes(value);
            if (checked2 && !existing) {
              this.checkOption(value);
              return;
            }
            if (!checked2 && existing) {
              this.uncheckOption(value);
            }
          }
        });
        return {
          label,
          value,
          core: store
        };
      });
      console.log("[DOMAIN]ui/checkbox/group - setOptions", this.options.length);
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    onChange(handler4) {
      return this.on(1 /* Change */, handler4);
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/app/index.ts
  var OrientationTypes = /* @__PURE__ */ ((OrientationTypes2) => {
    OrientationTypes2["Horizontal"] = "horizontal";
    OrientationTypes2["Vertical"] = "vertical";
    return OrientationTypes2;
  })(OrientationTypes || {});
  var mediaSizes = {
    sm: 0,
    /** 中等设备宽度阈值 */
    md: 768,
    /** 大设备宽度阈值 */
    lg: 992,
    /** 特大设备宽度阈值 */
    xl: 1200,
    /** 特大设备宽度阈值 */
    "2xl": 1536
  };
  function getCurrentDeviceSize(width) {
    if (width >= mediaSizes["2xl"]) {
      return "2xl";
    }
    if (width >= mediaSizes.xl) {
      return "xl";
    }
    if (width >= mediaSizes.lg) {
      return "lg";
    }
    if (width >= mediaSizes.md) {
      return "md";
    }
    return "sm";
  }
  var Events = /* @__PURE__ */ ((Events3) => {
    Events3[Events3["Tip"] = 0] = "Tip";
    Events3[Events3["Loading"] = 1] = "Loading";
    Events3[Events3["HideLoading"] = 2] = "HideLoading";
    Events3[Events3["Error"] = 3] = "Error";
    Events3[Events3["Login"] = 4] = "Login";
    Events3[Events3["Logout"] = 5] = "Logout";
    Events3[Events3["ForceUpdate"] = 6] = "ForceUpdate";
    Events3[Events3["DeviceSizeChange"] = 7] = "DeviceSizeChange";
    Events3[Events3["Ready"] = 8] = "Ready";
    Events3[Events3["Show"] = 9] = "Show";
    Events3[Events3["Hidden"] = 10] = "Hidden";
    Events3[Events3["Resize"] = 11] = "Resize";
    Events3[Events3["Blur"] = 12] = "Blur";
    Events3[Events3["Keydown"] = 13] = "Keydown";
    Events3[Events3["OrientationChange"] = 14] = "OrientationChange";
    Events3[Events3["EscapeKeyDown"] = 15] = "EscapeKeyDown";
    Events3[Events3["StateChange"] = 16] = "StateChange";
    return Events3;
  })(Events || {});
  var Application = class extends BaseDomain {
    constructor(props) {
      super();
      /** 用户 */
      __publicField(this, "$user");
      __publicField(this, "$storage");
      __publicField(this, "lifetimes");
      __publicField(this, "ready", false);
      __publicField(this, "screen", {
        width: 0,
        height: 0
      });
      __publicField(this, "env", {
        wechat: false,
        ios: false,
        android: false,
        pc: false,
        weapp: false,
        prod: "develop"
      });
      __publicField(this, "orientation", "vertical" /* Vertical */);
      __publicField(this, "curDeviceSize", "md");
      __publicField(this, "height", 0);
      __publicField(this, "theme", "system");
      __publicField(this, "safeArea", false);
      __publicField(this, "Events", Events);
      const { user, storage, beforeReady, onReady } = props;
      this.$user = user;
      this.$storage = storage;
      this.lifetimes = {
        beforeReady,
        onReady
      };
    }
    // @todo 怎么才能更方便地拓展 Application 类，给其添加许多的额外属性还能有类型提示呢？
    get state() {
      return {
        ready: this.ready,
        theme: this.theme,
        env: this.env,
        deviceSize: this.curDeviceSize,
        height: this.height
      };
    }
    /** 启动应用 */
    start(size) {
      return __async(this, null, function* () {
        const { width, height } = size;
        this.screen = __spreadProps(__spreadValues({}, this.screen), { width, height });
        this.curDeviceSize = getCurrentDeviceSize(width);
        const { beforeReady } = this.lifetimes;
        if (beforeReady) {
          const r = yield beforeReady();
          if (r.error) {
            return Result.Err(r.error);
          }
        }
        this.ready = true;
        this.emit(8 /* Ready */);
        this.emit(16 /* StateChange */, __spreadValues({}, this.state));
        return Result.Ok(null);
      });
    }
    /** 应用指定主题 */
    setTheme(theme) {
      const tip = "\u8BF7\u5728 connect.web \u4E2D\u5B9E\u73B0 setTheme \u65B9\u6CD5";
      console.warn(tip);
      return Result.Err(tip);
    }
    getTheme() {
      const tip = "\u8BF7\u5728 connect.web \u4E2D\u5B9E\u73B0 getTheme \u65B9\u6CD5";
      console.warn(tip);
      return "light";
    }
    // getSystemTheme(e?: any): Result<string> {
    //   const tip = "请在 connect.web 中实现 getSystemTheme 方法";
    //   console.warn(tip);
    //   return Result.Err(tip);
    // }
    // push(...args: Parameters<HistoryCore["push"]>) {
    //   return this.$history.push(...args);
    // }
    // replace(...args: Parameters<HistoryCore["replace"]>) {
    //   return this.$history.replace(...args);
    // }
    // back(...args: Parameters<HistoryCore["back"]>) {
    //   return this.$history.back(...args);
    // }
    tipUpdate() {
      this.emit(6 /* ForceUpdate */);
    }
    tip(arg) {
      this.emit(0 /* Tip */, arg);
      return arg.text.join("\n");
    }
    loading(arg) {
      this.emit(1 /* Loading */, arg);
      return {
        hideLoading: () => {
          this.emit(2 /* HideLoading */);
        }
      };
    }
    hideLoading() {
      this.emit(2 /* HideLoading */);
    }
    /** 手机震动 */
    vibrate() {
    }
    setSize(size) {
      this.screen = size;
    }
    /** 设置页面 title */
    setTitle(title) {
      throw new Error("\u8BF7\u5B9E\u73B0 setTitle \u65B9\u6CD5");
    }
    openWindow(url) {
      throw new Error("\u8BF7\u5B9E\u73B0 openWindow \u65B9\u6CD5");
    }
    setEnv(env) {
      this.env = __spreadValues(__spreadValues({}, this.env), env);
    }
    setHeight(v2) {
      this.height = v2;
      this.emit(16 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 复制文本到粘贴板 */
    copy(text) {
      throw new Error("\u8BF7\u5B9E\u73B0 copy \u65B9\u6CD5");
    }
    getComputedStyle(el) {
      throw new Error("\u8BF7\u5B9E\u73B0 getComputedStyle \u65B9\u6CD5");
    }
    /** 发送推送 */
    notify(msg) {
      console.log("\u8BF7\u5B9E\u73B0 notify \u65B9\u6CD5");
    }
    disablePointer() {
      throw new Error("\u8BF7\u5B9E\u73B0 disablePointer \u65B9\u6CD5");
    }
    enablePointer() {
      throw new Error("\u8BF7\u5B9E\u73B0 enablePointer \u65B9\u6CD5");
    }
    /** 平台相关的全局事件 */
    keydown(event) {
      if (event.code === "Escape") {
        this.escape();
      }
      this.emit(13 /* Keydown */, event);
    }
    escape() {
      this.emit(15 /* EscapeKeyDown */);
    }
    resize(size) {
      this.screen = size;
      this.emit(11 /* Resize */, size);
    }
    blur() {
      this.emit(12 /* Blur */);
    }
    handleScreenOrientationChange(orientation) {
      if (orientation === 0) {
        this.orientation = "vertical" /* Vertical */;
        this.emit(14 /* OrientationChange */, this.orientation);
        return;
      }
      this.orientation = "horizontal" /* Horizontal */;
      this.emit(14 /* OrientationChange */, this.orientation);
    }
    handleResize(size) {
      this.screen = size;
      const mediaStr = getCurrentDeviceSize(size.width);
      if (mediaStr !== this.curDeviceSize) {
        this.curDeviceSize = mediaStr;
        this.emit(7 /* DeviceSizeChange */, this.curDeviceSize);
      }
      this.emit(11 /* Resize */, size);
    }
    /* ----------------
     * Lifetime
     * ----------------
     */
    onReady(handler4) {
      return this.on(8 /* Ready */, handler4);
    }
    onDeviceSizeChange(handler4) {
      return this.on(7 /* DeviceSizeChange */, handler4);
    }
    onUpdate(handler4) {
      return this.on(6 /* ForceUpdate */, handler4);
    }
    /** 平台相关全局事件 */
    onOrientationChange(handler4) {
      return this.on(14 /* OrientationChange */, handler4);
    }
    onResize(handler4) {
      return this.on(11 /* Resize */, handler4);
    }
    onBlur(handler4) {
      return this.on(12 /* Blur */, handler4);
    }
    onShow(handler4) {
      return this.on(9 /* Show */, handler4);
    }
    onHidden(handler4) {
      return this.on(10 /* Hidden */, handler4);
    }
    onKeydown(handler4) {
      return this.on(13 /* Keydown */, handler4);
    }
    onEscapeKeyDown(handler4) {
      return this.on(15 /* EscapeKeyDown */, handler4);
    }
    onTip(handler4) {
      return this.on(0 /* Tip */, handler4);
    }
    onLoading(handler4) {
      return this.on(1 /* Loading */, handler4);
    }
    onHideLoading(handler4) {
      return this.on(2 /* HideLoading */, handler4);
    }
    onStateChange(handler4) {
      return this.on(16 /* StateChange */, handler4);
    }
    /**
     * ----------------
     * Event
     * ----------------
     */
    onError(handler4) {
      return this.on(3 /* Error */, handler4);
    }
  };

  // domains/navigator/index.ts
  var import_qs = __toESM(require_lib());
  var import_url_parse = __toESM(require_url_parse());
  var _NavigatorCore = class _NavigatorCore extends BaseDomain {
    constructor() {
      super(...arguments);
      __publicField(this, "unique_id", "NavigatorCore");
      __publicField(this, "debug", false);
      __publicField(this, "name", "root");
      /** 当前 pathname */
      __publicField(this, "pathname", "/");
      /** 当前路由的 query */
      __publicField(this, "query", {});
      /** 当前路由的 params */
      __publicField(this, "params", {});
      /** 当前 URL */
      __publicField(this, "location", {});
      __publicField(this, "href", "/");
      __publicField(this, "histories", []);
      __publicField(this, "prevHistories", []);
      /** 发生跳转前的 pathname */
      __publicField(this, "prevPathname", null);
      /** router 基础信息 */
      // host: string;
      // protocol: string;
      __publicField(this, "origin", "");
      __publicField(this, "host", "");
      __publicField(this, "_pending", {
        pathname: "/",
        search: "",
        type: "initialize"
      });
    }
    static parse(url) {
      const _a4 = (0, import_url_parse.default)(url), { pathname, query: query_str } = _a4, rest = __objRest(_a4, ["pathname", "query"]);
      const query = import_qs.default.parse(query_str, { ignoreQueryPrefix: true });
      if (_NavigatorCore.prefix && pathname.startsWith(_NavigatorCore.prefix)) {
        return __spreadProps(__spreadValues({}, rest), { query, pathname: pathname.replace(_NavigatorCore.prefix, "") });
      }
      return __spreadProps(__spreadValues({}, rest), {
        query,
        pathname
      });
    }
    get state() {
      return {
        pathname: this.pathname,
        search: this._pending.search,
        params: this.params,
        query: this.query,
        location: this.location
      };
    }
    /** 启动路由监听 */
    prepare(location) {
      return __async(this, null, function* () {
        const { host, pathname, href, search, origin } = location;
        let clean_pathname = pathname;
        if (_NavigatorCore.prefix && _NavigatorCore.prefix.match(/^\/[a-z0-9A-Z]{1,}/)) {
          clean_pathname = pathname.replace(_NavigatorCore.prefix, "");
        }
        this.setPathname(clean_pathname);
        this.origin = origin;
        this.host = host;
        this.location = location;
        const query = buildQuery(href);
        this.query = query;
        this._pending = {
          pathname: clean_pathname,
          search,
          type: "initialize"
        };
      });
    }
    start() {
      const { pathname } = this._pending;
      this.setPathname(pathname);
      this.histories = [
        {
          pathname
        }
      ];
      this.emit(7 /* PathnameChange */, __spreadValues({}, this._pending));
    }
    setPrevPathname(p) {
      this.prevPathname = p;
    }
    setPathname(p) {
      this.pathname = p;
    }
    /** 调用该方法来「改变地址」 */
    pushState(url) {
      const pathname = (_NavigatorCore.prefix + url).replace(/^\/\//, "/");
      const u = `${this.origin}${pathname}`;
      const r = new URL(u);
      const { pathname: realTargetPathname, search } = r;
      const prevPathname = this.pathname;
      this.setPrevPathname(prevPathname);
      this.setPathname(realTargetPathname);
      this.histories.push({ pathname: realTargetPathname });
      this.emit(0 /* PushState */, {
        from: prevPathname,
        to: realTargetPathname,
        path: realTargetPathname + search,
        pathname: realTargetPathname
      });
      this.emit(10 /* HistoriesChange */, [...this.histories]);
    }
    replaceState(url) {
      return __async(this, null, function* () {
        const u = `${this.origin}${_NavigatorCore.prefix}${url}`;
        const r = new URL(u);
        const { pathname: realTargetPathname, search } = r;
        this.setPrevPathname(this.pathname);
        this.setPathname(realTargetPathname);
        this.histories[this.histories.length - 1] = { pathname: realTargetPathname };
        this.emit(1 /* ReplaceState */, {
          from: this.prevPathname,
          path: realTargetPathname + search,
          pathname: realTargetPathname
        });
        this.emit(10 /* HistoriesChange */, [...this.histories]);
      });
    }
    // /** 跳转到指定路由 */
    // async push(targetPathname: string, targetQuery?: Record<string, string>) {
    //   // console.log("[DOMAIN]navigator - push", this.query);
    //   // this.log("push", targetPathname, this.prevPathname);
    //   const url = (() => {
    //     if (targetPathname.startsWith("http")) {
    //       return targetPathname;
    //     }
    //     const p = `${NavigatorCore.prefix}${targetPathname}`;
    //     return `${this.origin}${p}`;
    //   })();
    //   const r = new URL(url);
    //   const { pathname: realTargetPathname, search } = r;
    //   const query = targetQuery || buildQuery(search);
    //   const remainingFields = extractDefinedKeys(this.query, ["token"]);
    //   this.query = {
    //     ...query,
    //     ...remainingFields,
    //   };
    //   if (this.pathname === realTargetPathname) {
    //     console.log("cur pathname has been", targetPathname);
    //     return;
    //   }
    //   const prevPathname = this.pathname;
    //   this.setPrevPathname(prevPathname);
    //   this.setPathname(realTargetPathname);
    //   this.histories.push({ pathname: realTargetPathname });
    //   // this.emit(Events.PushState, {
    //   //   from: this.prevPathname,
    //   //   to: realTargetPathname,
    //   //   // 这里似乎不用 this.origin，只要是 / 开头的，就会拼接在后面
    //   //   path: (() => {
    //   //     let url = `${this.origin}${realTargetPathname}`;
    //   //     url += "?" + query_stringify(this.query);
    //   //     return url;
    //   //   })(),
    //   //   pathname: realTargetPathname,
    //   // });
    //   this._pending = {
    //     pathname: realTargetPathname,
    //     search,
    //     type: "push",
    //   };
    //   this.emit(Events.PathnameChange, { ...this._pending });
    // }
    // back = () => {
    //   // this.emit(Events.Back);
    // };
    // reload = () => {
    //   // this.emit(Events.Reload);
    // };
    // popstate({ type, href, pathname }: { type: string; href: string; pathname: string }) {
    //   this.emit(Events.PopState, { type, href, pathname });
    // }
    /** 外部路由改变（点击浏览器前进、后退），作出响应 */
    handlePopState({ type, pathname, href }) {
      console.log("[DOMAIN]navigator/index - handlePopState", type, this.pathname, this.prevHistories);
      if (type !== "popstate") {
        return;
      }
      const targetPathname = pathname;
      const prevPathname = this.pathname;
      this.setPrevPathname(prevPathname);
      this.setPathname(targetPathname);
      const isForward = (() => {
        if (this.prevHistories.length === 0) {
          return false;
        }
        const lastStackWhenBack = this.prevHistories[this.prevHistories.length - 1];
        if ((lastStackWhenBack == null ? void 0 : lastStackWhenBack.pathname) === targetPathname) {
          return true;
        }
        return false;
      })();
      this._pending = {
        pathname,
        search: "",
        type: (() => {
          if (isForward) {
            return "forward";
          }
          return "back";
        })()
      };
      if (isForward) {
        this.setPrevPathname(this.pathname);
        this.setPathname(targetPathname);
        const lastStackWhenBack = this.prevHistories.pop();
        if (lastStackWhenBack) {
          this.histories = this.histories.concat([lastStackWhenBack]);
        }
        this.emit(4 /* Forward */);
        this.emit(10 /* HistoriesChange */, [...this.histories]);
        this.emit(2 /* PopState */, { type: "forward", pathname, href });
        return;
      }
      this.emit(3 /* Back */);
      const theHistoryDestroy = this.histories[this.histories.length - 1];
      this.prevHistories = this.prevHistories.concat([theHistoryDestroy]).filter(Boolean);
      this.setPrevPathname(this.pathname);
      this.setPathname(targetPathname);
      console.log(
        "[DOMAIN]navigator - before pop",
        this.histories.map((h2) => h2.pathname)
      );
      const cloneStacks = this.histories.slice(0, this.histories.length - 1);
      this.histories = cloneStacks.filter(Boolean);
      this.emit(10 /* HistoriesChange */, [...this.histories]);
      this.emit(2 /* PopState */, { type: "back", pathname, href });
    }
    onStart(handler4) {
      return this.on(6 /* Start */, handler4);
    }
    onHistoryChange(handler4) {
      return this.on(10 /* HistoriesChange */, handler4);
    }
    onPushState(handler4) {
      return this.on(0 /* PushState */, handler4);
    }
    onReplaceState(handler4) {
      return this.on(1 /* ReplaceState */, handler4);
    }
    onPopState(handler4) {
      return this.on(2 /* PopState */, handler4);
    }
    onReload(handler4) {
      return this.on(5 /* Reload */, handler4);
    }
    onPathnameChange(handler4) {
      return this.on(7 /* PathnameChange */, handler4);
    }
    onBack(handler4) {
      return this.on(3 /* Back */, handler4);
    }
    onForward(handler4) {
      return this.on(4 /* Forward */, handler4);
    }
    onRelaunch(handler4) {
      return this.on(8 /* Relaunch */, handler4);
    }
    onHistoriesChange(handler4) {
      return this.on(10 /* HistoriesChange */, handler4);
    }
  };
  __publicField(_NavigatorCore, "prefix", null);
  var NavigatorCore = _NavigatorCore;
  function buildQuery(path) {
    const [, search] = path.split("?");
    if (!search) {
      return {};
    }
    return import_qs.default.parse(search);
  }

  // utils/index.ts
  var import_dayjs = __toESM(require_dayjs_min());
  var import_zh_cn = __toESM(require_zh_cn());
  var import_relativeTime = __toESM(require_relativeTime());
  import_dayjs.default.extend(import_relativeTime.default);
  import_dayjs.default.locale("zh-cn");
  function query_stringify(query) {
    if (query === null) {
      return "";
    }
    if (query === void 0) {
      return "";
    }
    return Object.keys(query).filter((key) => {
      return query[key] !== void 0;
    }).map((key) => {
      return `${key}=${encodeURIComponent(query[key])}`;
    }).join("&");
  }
  function sleep(delay = 1e3) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, delay);
    });
  }

  // domains/route_view/utils.ts
  function buildUrl(key, params, query) {
    const search = (() => {
      if (!query || Object.keys(query).length === 0) {
        return "";
      }
      return "?" + query_stringify(query);
    })();
    const url = (() => {
      if (!key.match(/:[a-z]{1,}/)) {
        return key + search;
      }
      if (!params || Object.keys(params).length === 0) {
        return key + search;
      }
      return key.replace(/:([a-z]{1,})/g, (...args) => {
        const [, field] = args;
        const value = String(params[field] || "");
        return value;
      }) + search;
    })();
    return url;
  }

  // domains/route_view/index.ts
  var RouteViewCore = class extends BaseDomain {
    // get animation() {
    //   return this.options?.animation;
    // }
    constructor(options) {
      super(options);
      __publicField(this, "unique_id", "ViewCore");
      __publicField(this, "debug", false);
      __publicField(this, "id", this.uid());
      /** 一些配置项 */
      __publicField(this, "name");
      __publicField(this, "pathname");
      __publicField(this, "title");
      __publicField(this, "animation", {
        in: "fade-in",
        out: "fade-out"
      });
      /** 当前视图的 query */
      __publicField(this, "query", {});
      /** 当前视图的 params */
      __publicField(this, "params", {});
      // visible = false;
      __publicField(this, "_showed", false);
      __publicField(this, "loaded", false);
      __publicField(this, "mounted", true);
      __publicField(this, "layered", false);
      __publicField(this, "isRoot", false);
      __publicField(this, "parent");
      /** 当前子视图 */
      __publicField(this, "curView", null);
      /** 当前所有的子视图 */
      __publicField(this, "subViews", []);
      __publicField(this, "$presence", new PresenceCore());
      const { name, pathname, title, query = {}, visible = false, animation = {}, parent = null, views = [] } = options;
      this.name = name;
      this.pathname = pathname;
      this.parent = parent;
      this.title = title;
      this.unique_id = title;
      this.animation = animation;
      this.subViews = views;
      if (views.length) {
        this.curView = views[0];
      }
      this.query = query;
      if (visible) {
        this.mounted = true;
      }
      for (let i = 0; i < views.length; i += 1) {
        const view = views[i];
        view.parent = this;
      }
      this.$presence.onStateChange((nextState) => {
        const { visible: visible2, mounted } = nextState;
        const prevVisible = this.state.visible;
        if (prevVisible === false && visible2) {
          this.setShow();
        }
        if (prevVisible && visible2 === false) {
          this.setHidden();
        }
        this.mounted = !!mounted;
        this.emit(13 /* StateChange */, __spreadValues({}, this.state));
      });
      this.$presence.onUnmounted(() => {
        this.emit(9 /* Unmounted */);
      });
      emitViewCreated(this);
    }
    get state() {
      return {
        mounted: this.mounted,
        visible: this.visible,
        layered: this.layered
      };
    }
    get href() {
      return [this.pathname, query_stringify(this.query)].filter(Boolean).join("?");
    }
    get visible() {
      return this.$presence.visible;
    }
    appendView(view) {
      view.parent = this;
      if (this.subViews.length === 0 && view.visible) {
        this.curView = view;
      }
      if (!this.subViews.includes(view)) {
        this.subViews.push(view);
      }
      this.emit(0 /* ViewsChange */, [...this.subViews]);
    }
    replaceViews(views) {
      this.subViews = views;
      this.emit(0 /* ViewsChange */, [...this.subViews]);
    }
    /** 移除（卸载）一个子视图 */
    removeView(view, options = {}) {
      if (!this.subViews.includes(view)) {
        console.warn("the view is not the child view");
        return;
      }
      view.onUnmounted(() => {
        view.destroy();
        this.subViews = this.subViews.filter((v2) => v2 !== view);
        if (options.callback) {
          options.callback();
        }
        this.emit(0 /* ViewsChange */, [...this.subViews]);
      });
      view.hide({
        reason: options.reason,
        destroy: options.destroy
      });
      this.emit(0 /* ViewsChange */, [...this.subViews]);
    }
    findCurView() {
      if (!this.curView) {
        return this;
      }
      return this.curView.findCurView();
    }
    ready() {
      this.emit(3 /* Ready */);
    }
    /** 让自身的一个子视图变为可见 */
    showView(sub_view, options = {}) {
      if (sub_view === this) {
        console.warn("cannot show self");
        return;
      }
      if (sub_view.visible) {
        console.warn("the sub view has been visible", sub_view.name);
        return;
      }
      (() => {
        if (!this.visible) {
          if (!this.parent) {
            if (!this.isRoot) {
              console.warn("no parent");
            }
            return;
          }
          this.parent.showView(this, options);
        }
      })();
      if (options.reason === "show_sibling" && this.curView) {
        this.curView.hide(options);
      }
      this.appendView(sub_view);
      this.emit(5 /* BeforeShow */);
      this.curView = sub_view;
      sub_view.show();
      this.emit(1 /* CurViewChange */, this.curView);
    }
    /** 主动展示视图 */
    show() {
      if (this.visible) {
        this.$presence.state.mounted = true;
        return;
      }
      this.$presence.show();
    }
    /** 主动隐藏自身视图 */
    hide(options = {}) {
      if (this.visible === false) {
        console.warn("has been hide");
        return;
      }
      for (let i = 0; i < this.subViews.length; i += 1) {
        const view = this.subViews[i];
        view.hide(options);
      }
      this.emit(7 /* BeforeHide */);
      this.$presence.hide({
        reason: options.reason,
        destroy: options.destroy
      });
    }
    /** 视图在页面上展示（变为可见） */
    setShow() {
      if (this._showed) {
        return;
      }
      this._showed = true;
      this.emit(6 /* Show */);
    }
    /** 视图在页面上隐藏（变为不可见） */
    setHidden() {
      console.log("[DOMAIN]route_view/index - hidden", this.title, this._showed);
      this._showed = false;
      this.emit(8 /* Hidden */);
    }
    mount() {
      this.setMounted();
    }
    /** 卸载自身 */
    unmount() {
      this.subViews = [];
      this.emit(13 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 视图被装载到页面 */
    setMounted() {
      if (this.mounted) {
        return;
      }
      this.mounted = true;
      this.emit(4 /* Mounted */);
    }
    /** 视图从页面被卸载 */
    setUnmounted() {
      this.mounted = false;
      this.emit(9 /* Unmounted */);
    }
    /** 页面组件已加载 */
    setLoaded() {
      this.loaded = true;
    }
    /** 页面组件未加载 */
    setUnload() {
      this.loaded = false;
    }
    buildUrl(query) {
      const url = buildUrl(this.pathname, this.params, query);
      return url;
    }
    buildUrlWithPrefix(query) {
      const url = buildUrl(this.pathname, this.params, query);
      return [NavigatorCore.prefix, url].join("");
    }
    onStart(handler4) {
      return this.on(12 /* Start */, handler4);
    }
    onReady(handler4) {
      return this.on(3 /* Ready */, handler4);
    }
    onMounted(handler4) {
      return this.on(4 /* Mounted */, handler4);
    }
    onViewShow(handler4) {
      return this.on(2 /* ViewShow */, handler4);
    }
    onBeforeShow(handler4) {
      return this.on(5 /* BeforeShow */, handler4);
    }
    onShow(handler4) {
      return this.on(6 /* Show */, handler4);
    }
    onBeforeHide(handler4) {
      return this.on(7 /* BeforeHide */, handler4);
    }
    onHidden(handler4) {
      return this.on(8 /* Hidden */, handler4);
    }
    onLayered(handler4) {
      return this.on(10 /* Layered */, handler4);
    }
    onUncover(handler4) {
      return this.on(11 /* Uncover */, handler4);
    }
    onUnmounted(handler4) {
      return this.on(9 /* Unmounted */, handler4);
    }
    onSubViewsChange(handler4) {
      return this.on(0 /* ViewsChange */, handler4);
    }
    onCurViewChange(handler4) {
      return this.on(1 /* CurViewChange */, handler4);
    }
    onMatched(handler4) {
      return this.on(14 /* Match */, handler4);
    }
    onNotFound(handler4) {
      return this.on(15 /* NotFound */, handler4);
    }
    onStateChange(handler4) {
      return this.on(13 /* StateChange */, handler4);
    }
  };
  var handler2 = null;
  function onViewCreated(fn) {
    handler2 = fn;
  }
  function emitViewCreated(view) {
    if (!handler2) {
      return;
    }
    handler2(view);
  }
  function RouteMenusModel(props) {
    const methods = {
      refresh() {
        bus.emit(0 /* StateChange */, __spreadValues({}, _state));
      },
      setCurMenu(name) {
        _route_name = name;
        const keys = [
          // "root.home_layout.workout_plan_layout.mine",
          // "root.home_layout.workout_plan_layout.interval",
          // "root.home_layout.workout_plan_layout.single",
        ];
        if (keys.includes(name)) {
        }
        methods.refresh();
      }
    };
    const ui = {};
    let _route_name = props.route;
    let _state = {
      get menus() {
        return props.menus;
      },
      get route_name() {
        return _route_name;
      }
    };
    let Events3;
    ((Events4) => {
      Events4[Events4["StateChange"] = 0] = "StateChange";
      Events4[Events4["Error"] = 1] = "Error";
    })(Events3 || (Events3 = {}));
    const bus = base();
    const unlisten = props.$history.onRouteChange(({ name }) => {
      methods.setCurMenu(name);
    });
    return {
      methods,
      ui,
      state: _state,
      ready() {
      },
      destroy() {
        unlisten();
        bus.destroy();
      },
      onStateChange(handler4) {
        return bus.on(0 /* StateChange */, handler4);
      },
      onError(handler4) {
        return bus.on(1 /* Error */, handler4);
      }
    };
  }

  // domains/history/index.ts
  var HistoryCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      __publicField(this, "virtual", false);
      /** 路由配置 */
      __publicField(this, "routes");
      /** 加载的所有视图 */
      __publicField(this, "views");
      /** 按顺序依次 push 的视图 */
      __publicField(this, "stacks", []);
      /** 栈指针 */
      __publicField(this, "cursor", -1);
      /** 浏览器 url 管理 */
      __publicField(this, "$router");
      /** 根视图 */
      __publicField(this, "$view");
      const { virtual = false, view, router, routes, views } = props;
      this.$view = view;
      this.$router = router;
      this.routes = routes;
      this.views = views;
      this.virtual = virtual;
    }
    get state() {
      return {
        href: this.$router.href,
        stacks: this.stacks.map((view) => {
          const { id, pathname: key, title, query, visible } = view;
          return {
            // id: String(id),
            id: [key, query_stringify(query)].filter(Boolean).join("?"),
            key,
            title,
            query: JSON.stringify(query, null, 2),
            visible
          };
        }),
        cursor: this.cursor
      };
    }
    push(name, query = {}, options = {}) {
      var _a4;
      const { ignore } = options;
      if (this.isLayout(name)) {
        console.log("[DOMAIN]history/index - the target url is layout", name);
        return;
      }
      const route1 = this.routes[name];
      if (!route1) {
        console.log("[DOMAIN]history/index - push 2. no matched route", name);
        return;
      }
      const uniqueKey = [route1.pathname, query_stringify(query)].filter(Boolean).join("?");
      if (uniqueKey === this.$router.href) {
        return;
      }
      const view = this.views[uniqueKey];
      if (view) {
        this.ensureParent(view);
        view.query = query;
        if (!view.parent) {
          console.log("[DOMAIN]history/index - error1");
          return;
        }
        this.$router.href = view.href;
        this.$router.name = view.name;
        this.stacks = this.stacks.slice(0, this.cursor + 1).concat(view);
        this.cursor += 1;
        view.parent.showView(view, { reason: "show_sibling", destroy: false });
        this.emit(1 /* RouteChange */, {
          reason: "push",
          view,
          name,
          href: view.href,
          pathname: view.pathname,
          query: view.query,
          ignore
        });
        this.emit(5 /* StateChange */, __spreadValues({}, this.state));
        return;
      }
      const route = (() => {
        const m2 = this.routes[name];
        if (!m2) {
          return null;
        }
        return m2;
      })();
      if (!route) {
        console.log("[DOMAIN]history/index - push 2. no matched route", uniqueKey);
        return null;
      }
      const created = new RouteViewCore({
        name: route.name,
        pathname: route.pathname,
        title: route.title,
        query,
        animation: (_a4 = route.options) == null ? void 0 : _a4.animation,
        parent: null
      });
      this.views[uniqueKey] = created;
      this.ensureParent(created);
      if (!created.parent) {
        console.log("[DOMAIN]history/index - push 3. ", route.name);
        return;
      }
      this.$router.href = created.href;
      this.$router.name = created.name;
      this.stacks = this.stacks.slice(0, this.cursor + 1).concat(created);
      this.cursor += 1;
      created.parent.showView(created, { reason: "show_sibling", destroy: false });
      this.emit(1 /* RouteChange */, {
        reason: "push",
        view: created,
        name,
        href: created.href,
        pathname: created.pathname,
        query: created.query,
        ignore
      });
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    replace(name, query = {}) {
      var _a4, _b, _c;
      const uniqueKey = [name, query_stringify(query)].filter(Boolean).join("?");
      if (uniqueKey === this.$router.href) {
        console.log("[DOMAIN]history/index - replace target url is", uniqueKey, "and cur href is", this.$router.href);
        return;
      }
      const view = this.views[uniqueKey];
      if (view) {
        this.ensureParent(view);
        view.query = query;
        if (!view.parent) {
          console.log("[DOMAIN]history/index - replace 1");
          return;
        }
        this.$router.href = view.href;
        this.$router.name = view.name;
        const theViewNeedDestroy2 = this.stacks[this.stacks.length - 1];
        if (theViewNeedDestroy2) {
          (_a4 = theViewNeedDestroy2.parent) == null ? void 0 : _a4.removeView(theViewNeedDestroy2);
        }
        this.stacks[this.stacks.length - 1] = view;
        view.parent.showView(view);
        this.emit(1 /* RouteChange */, {
          reason: "replace",
          view,
          name: view.name,
          href: view.href,
          pathname: view.pathname,
          query: view.query
        });
        this.emit(5 /* StateChange */, __spreadValues({}, this.state));
        return;
      }
      const route = (() => {
        const m2 = this.routes[name];
        if (!m2) {
          return null;
        }
        return m2;
      })();
      if (!route) {
        console.log("[DOMAIN]history/index - replace 2. no matched route");
        return null;
      }
      const created = new RouteViewCore({
        name: route.name,
        pathname: route.pathname,
        title: route.title,
        query,
        animation: (_b = route.options) == null ? void 0 : _b.animation,
        parent: null
      });
      this.views[uniqueKey] = created;
      this.ensureParent(created);
      if (!created.parent) {
        console.log("[DOMAIN]history/index - replace 3. ");
        return;
      }
      this.$router.href = created.href;
      this.$router.name = created.name;
      const theViewNeedDestroy = this.stacks[this.stacks.length - 1];
      if (theViewNeedDestroy) {
        (_c = theViewNeedDestroy.parent) == null ? void 0 : _c.removeView(theViewNeedDestroy, {
          reason: "show_sibling",
          callback: () => {
            delete this.views[uniqueKey];
          }
        });
      }
      this.stacks[this.stacks.length - 1] = created;
      created.parent.showView(created);
      this.emit(1 /* RouteChange */, {
        reason: "replace",
        view: created,
        name: created.name,
        href: created.href,
        pathname: created.pathname,
        query: created.query
      });
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    back(opt = {}) {
      var _a4;
      const target_cursor = this.cursor - 1;
      const view_prepare_to_show = this.stacks[target_cursor];
      if (!view_prepare_to_show) {
        return;
      }
      const href = view_prepare_to_show.href;
      if (!view_prepare_to_show.parent) {
        return;
      }
      this.$router.href = href;
      this.$router.name = view_prepare_to_show.name;
      this.cursor = target_cursor;
      const viewsAfter = this.stacks.slice(target_cursor + 1);
      for (let i = 0; i < viewsAfter.length; i += 1) {
        const v2 = viewsAfter[i];
        (_a4 = v2.parent) == null ? void 0 : _a4.removeView(v2, {
          reason: "back",
          destroy: true,
          callback: () => {
            delete this.views[v2.href];
          }
        });
      }
      view_prepare_to_show.parent.showView(view_prepare_to_show, { reason: "back", destroy: true });
      this.emit(1 /* RouteChange */, {
        reason: "back",
        view: view_prepare_to_show,
        name: view_prepare_to_show.name,
        href: view_prepare_to_show.href,
        pathname: view_prepare_to_show.pathname,
        query: view_prepare_to_show.query,
        data: opt.data
      });
      this.emit(3 /* Back */);
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    forward() {
      var _a4;
      const targetCursor = this.cursor + 1;
      const viewPrepareShow = this.stacks[targetCursor];
      if (!viewPrepareShow) {
        return;
      }
      if (!viewPrepareShow.parent) {
        return;
      }
      const href = viewPrepareShow.href;
      this.$router.href = href;
      this.$router.name = viewPrepareShow.name;
      this.cursor = targetCursor;
      const viewsAfter = this.stacks.slice(targetCursor + 1);
      for (let i = 0; i < viewsAfter.length; i += 1) {
        const v2 = viewsAfter[i];
        (_a4 = v2.parent) == null ? void 0 : _a4.removeView(v2, {
          reason: "forward",
          callback: () => {
            delete this.views[v2.href];
          }
        });
      }
      viewPrepareShow.parent.showView(viewPrepareShow);
      this.emit(1 /* RouteChange */, {
        reason: "forward",
        view: viewPrepareShow,
        name: viewPrepareShow.name,
        href: viewPrepareShow.href,
        pathname: viewPrepareShow.pathname,
        query: viewPrepareShow.query
      });
      this.emit(4 /* Forward */);
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    reload() {
    }
    /** 销毁所有页面，然后前往指定路由 */
    destroyAllAndPush(name, query = {}, options = {}) {
      var _a4;
      const { ignore } = options;
      if (this.isLayout(name)) {
        console.log("[DOMAIN]history/index - the target url is layout", name);
        return;
      }
      const route1 = this.routes[name];
      if (!route1) {
        console.log("[DOMAIN]history/index - push 2. no matched route", name);
        return;
      }
      const unique_key = [route1.pathname, query_stringify(query)].filter(Boolean).join("?");
      if (unique_key === this.$router.href) {
        return;
      }
      const v1 = this.views["root"];
      const v2 = this.views["root.home_layout"];
      const kk = Object.keys(this.views);
      for (let i = 0; i < kk.length; i += 1) {
        (() => {
          const v3 = kk[i];
          const view = this.views[v3];
          view.unmount();
        })();
      }
      this.views = {
        ["root"]: v1,
        ["root.home_layout"]: v2
      };
      const route = (() => {
        const m2 = this.routes[name];
        if (!m2) {
          return null;
        }
        return m2;
      })();
      if (!route) {
        console.log("[DOMAIN]history/index - push 2. no matched route", unique_key);
        return null;
      }
      const created = new RouteViewCore({
        name: route.name,
        pathname: route.pathname,
        title: route.title,
        query,
        animation: (_a4 = route.options) == null ? void 0 : _a4.animation,
        parent: null
      });
      this.views[unique_key] = created;
      this.ensureParent(created);
      if (!created.parent) {
        console.log("[DOMAIN]history/index - push 3. ", route.name);
        return;
      }
      this.$router.href = created.href;
      this.$router.name = created.name;
      this.stacks = this.stacks.slice(0, this.cursor + 1).concat(created);
      this.cursor += 1;
      created.parent.showView(created, { reason: "show_sibling", destroy: false });
      this.emit(1 /* RouteChange */, {
        reason: "push",
        view: created,
        name,
        href: created.href,
        pathname: created.pathname,
        query: created.query,
        ignore
      });
      this.emit(5 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 跳转到兄弟页面 */
    // pushSibling() {
    // }
    ensureParent(view) {
      const { name } = view;
      if (view.parent) {
        if (view.parent.pathname === "/") {
          return;
        }
        this.ensureParent(view.parent);
        return;
      }
      const route = this.routes[name];
      if (!route) {
        return;
      }
      const { parent } = route;
      if (this.views[parent.name]) {
        view.parent = this.views[parent.name];
        if (parent.name === "root") {
          return;
        }
        this.ensureParent(this.views[parent.name]);
        return;
      }
      const parent_route = this.routes[parent.name];
      if (!parent_route) {
        return null;
      }
      const created_parent = new RouteViewCore({
        name: parent_route.name,
        pathname: parent_route.pathname,
        title: parent_route.title,
        parent: null
      });
      this.views[parent_route.name] = created_parent;
      view.parent = created_parent;
      this.ensureParent(created_parent);
    }
    buildURL(name, query = {}) {
      const route = (() => {
        const m2 = this.routes[name];
        if (!m2) {
          return null;
        }
        return m2;
      })();
      if (!route) {
        console.log("[DOMAIN]history/index - push 2. no matched route", name);
        return this.routes["root.notfound"].pathname;
      }
      const created = new RouteViewCore({
        name: route.name,
        pathname: route.pathname,
        title: route.title,
        query,
        parent: null
      });
      return created.buildUrl(query);
    }
    buildURLWithPrefix(name, query = {}) {
      const route = (() => {
        const m2 = this.routes[name];
        if (!m2) {
          return null;
        }
        return m2;
      })();
      if (!route) {
        console.log("[DOMAIN]history/index - push 2. no matched route", name);
        return this.routes["root.notfound"].pathname;
      }
      const created = new RouteViewCore({
        name: route.name,
        pathname: route.pathname,
        title: route.title,
        query,
        parent: null
      });
      return created.buildUrlWithPrefix(query);
    }
    isLayout(name) {
      const route = this.routes[name];
      if (!route) {
        return null;
      }
      return route.layout;
    }
    handleClickLink(params) {
      const { href, target } = params;
      this.emit(2 /* ClickLink */, { href, target });
    }
    onTopViewChange(handler4) {
      return this.on(0 /* TopViewChange */, handler4);
    }
    onRouteChange(handler4) {
      return this.on(1 /* RouteChange */, handler4);
    }
    onBack(handler4) {
      return this.on(3 /* Back */, handler4);
    }
    onForward(handler4) {
      return this.on(4 /* Forward */, handler4);
    }
    onClickLink(handler4) {
      return this.on(2 /* ClickLink */, handler4);
    }
    onStateChange(handler4) {
      return this.on(5 /* StateChange */, handler4);
    }
  };

  // domains/http_client/index.ts
  var HttpClientCore = class extends BaseDomain {
    constructor(props = {}) {
      super(props);
      __publicField(this, "hostname", "");
      __publicField(this, "headers", {});
      __publicField(this, "debug", false);
      const { hostname = "", headers = {}, debug = false } = props;
      this.hostname = hostname;
      this.headers = headers;
      this.debug = debug;
    }
    get(_0, _1) {
      return __async(this, arguments, function* (endpoint, query, extra = {}) {
        try {
          const h2 = this.hostname;
          const url = typeof endpoint === "string" ? [h2, endpoint, query ? "?" + query_stringify(query) : ""].join("") : endpoint;
          const payload = {
            url,
            method: "GET",
            id: extra.id,
            headers: __spreadValues(__spreadValues({}, this.headers), extra.headers || {})
          };
          if (this.debug) {
            console.log("[DOMAIN]http_client - before fetch", payload);
          }
          const resp = yield this.fetch(payload);
          return Result.Ok(resp.data);
        } catch (err) {
          const error = err;
          const { message } = error;
          return Result.Err(message);
        }
      });
    }
    post(_0, _1) {
      return __async(this, arguments, function* (endpoint, body, extra = {}) {
        const h2 = this.hostname;
        const url = typeof endpoint === "string" ? [h2, endpoint].join("") : endpoint;
        try {
          const payload = {
            url,
            method: "POST",
            data: body,
            id: extra.id,
            headers: __spreadValues(__spreadValues({}, this.headers), extra.headers || {})
          };
          if (this.debug) {
            console.log("[DOMAIN]http_client - before fetch", payload);
          }
          const resp = yield this.fetch(payload);
          return Result.Ok(resp.data);
        } catch (err) {
          const error = err;
          const { message } = error;
          return Result.Err(message);
        }
      });
    }
    fetch(options) {
      return __async(this, null, function* () {
        console.log("\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 fetch \u65B9\u6CD5");
        return { data: {} };
      });
    }
    cancel(id) {
      const tip = "\u8BF7\u5728 connect \u4E2D\u5B9E\u73B0 cancel \u65B9\u6CD5";
      console.log(tip);
      return Result.Err(tip);
    }
    setHeaders(headers) {
      this.headers = headers;
    }
    appendHeaders(headers) {
      this.headers = __spreadValues(__spreadValues({}, this.headers), headers);
    }
    setDebug(debug) {
      this.debug = debug;
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/request/index.ts
  var handler3 = null;
  function onRequestCreated(h2) {
    handler3 = h2;
  }
  var RequestCore = class extends BaseDomain {
    constructor(fn, props = {}) {
      super({ unique_id: props._name });
      __publicField(this, "_name", "RequestCore");
      __publicField(this, "debug", false);
      __publicField(this, "defaultResponse", null);
      /**
       * 就是
       *
       * ```js
       * function test() {
       *   return request.post('/api/ping');
       * }
       * ```
       *
       * 函数返回 RequestPayload，描述该次请求的地址、参数等
       */
      __publicField(this, "service");
      __publicField(this, "process");
      __publicField(this, "client");
      __publicField(this, "delay", null);
      __publicField(this, "loading", false);
      __publicField(this, "initial", true);
      /** 处于请求中的 promise */
      // pending: Promise<UnpackedRequestPayload<ReturnType<F>>> | null = null;
      __publicField(this, "pending", null);
      /** 调用 run 方法暂存的参数 */
      __publicField(this, "args", []);
      /** 请求的响应 */
      __publicField(this, "response", null);
      /** 请求失败，保存错误信息 */
      __publicField(this, "error", null);
      __publicField(this, "id", String(this.uid()));
      const {
        _name,
        client,
        delay,
        defaultResponse,
        loading,
        // fetch,
        process,
        onSuccess,
        onFailed,
        onCompleted,
        onCanceled,
        onLoading,
        beforeRequest
      } = props;
      this.service = fn;
      this.process = process;
      this.client = client;
      if (delay !== void 0) {
        this.delay = delay;
      }
      if (loading !== void 0) {
        this.loading = loading;
      }
      if (defaultResponse) {
        this.defaultResponse = defaultResponse;
        this.response = defaultResponse;
      }
      if (_name) {
        this._name = _name;
      }
      if (onSuccess) {
        this.onSuccess(onSuccess);
      }
      if (onCompleted) {
        this.onCompleted(onCompleted);
      }
      if (onCanceled) {
        this.onCanceled(onCanceled);
      }
      if (onLoading) {
        this.onLoadingChange(onLoading);
      }
      if (beforeRequest) {
        this.beforeRequest(beforeRequest);
      }
      if (handler3) {
        handler3(this);
      }
      if (onFailed) {
        this.onFailed(onFailed, { override: true });
      }
    }
    get state() {
      return {
        initial: this.initial,
        loading: this.loading,
        error: this.error,
        response: this.response
      };
    }
    /** 执行 service 函数 */
    run(...args) {
      return __async(this, null, function* () {
        if (!this.service) {
          return Result.Err("\u7F3A\u5C11 service");
        }
        if (typeof this.service !== "function") {
          return Result.Err("service \u4E0D\u662F\u51FD\u6570");
        }
        if (!this.client) {
          return Result.Err("\u7F3A\u5C11 client");
        }
        if (this.pending !== null) {
          const r3 = yield this.pending;
          this.loading = false;
          const data2 = r3.data;
          this.pending = null;
          return Result.Ok(data2);
        }
        this.loading = true;
        this.initial = false;
        this.response = this.defaultResponse;
        this.args = args;
        this.error = null;
        this.emit(2 /* LoadingChange */, true);
        this.emit(7 /* StateChange */, __spreadValues({}, this.state));
        this.emit(0 /* BeforeRequest */);
        let payloadProcess = null;
        const r2 = (() => {
          const { hostname = "", url, method, query, body, headers, process } = this.service(...args);
          if (process) {
            payloadProcess = process;
          }
          if (method === "GET") {
            const r3 = this.client.get(url, query, {
              id: this.id,
              headers
            });
            return Result.Ok(r3);
          }
          if (method === "POST") {
            const r3 = this.client.post(url, body, {
              id: this.id,
              headers
            });
            return Result.Ok(r3);
          }
          return Result.Err(`\u672A\u77E5\u7684 method '${method}'`);
        })();
        if (r2.error) {
          return Result.Err(r2.error);
        }
        this.pending = r2.data;
        const [r] = yield Promise.all([this.pending, this.delay === null ? null : sleep(this.delay)]);
        this.loading = false;
        const rr = (() => {
          if (payloadProcess) {
            return payloadProcess(r);
          }
          return r;
        })();
        const resp = this.process ? this.process(rr) : rr;
        this.emit(2 /* LoadingChange */, false);
        this.emit(7 /* StateChange */, __spreadValues({}, this.state));
        this.emit(5 /* Completed */);
        this.pending = null;
        if (resp.error) {
          if (resp.error.code === "CANCEL") {
            this.emit(6 /* Canceled */);
            return Result.Err(resp.error);
          }
          this.error = resp.error;
          this.emit(4 /* Failed */, resp.error);
          this.emit(7 /* StateChange */, __spreadValues({}, this.state));
          return Result.Err(resp.error);
        }
        const data = resp.data;
        this.response = data;
        this.emit(3 /* Success */, data);
        this.emit(7 /* StateChange */, __spreadValues({}, this.state));
        this.emit(8 /* ResponseChange */, data);
        return Result.Ok(data);
      });
    }
    /** 使用当前参数再请求一次 */
    reload() {
      this.run(...this.args);
    }
    cancel() {
      if (!this.client) {
        return Result.Err("\u7F3A\u5C11 client");
      }
      this.client.cancel(this.id);
    }
    clear() {
      this.response = null;
      this.emit(7 /* StateChange */, __spreadValues({}, this.state));
      this.emit(8 /* ResponseChange */, this.response);
    }
    setError(err) {
      this.error = err;
      this.emit(7 /* StateChange */, __spreadValues({}, this.state));
    }
    modifyResponse(fn) {
      if (this.response === null) {
        return;
      }
      const nextResponse = fn(this.response);
      this.response = nextResponse;
      this.emit(7 /* StateChange */, __spreadValues({}, this.state));
      this.emit(8 /* ResponseChange */, this.response);
    }
    onLoadingChange(handler4) {
      return this.on(2 /* LoadingChange */, handler4);
    }
    beforeRequest(handler4) {
      return this.on(0 /* BeforeRequest */, handler4);
    }
    onSuccess(handler4) {
      return this.on(3 /* Success */, handler4);
    }
    onFailed(handler4, opt = {}) {
      if (opt.override) {
        this.offEvent(4 /* Failed */);
      }
      return this.on(4 /* Failed */, handler4);
    }
    onCanceled(handler4) {
      return this.on(6 /* Canceled */, handler4);
    }
    /** 建议使用 onFailed */
    onError(handler4) {
      return this.on(4 /* Failed */, handler4);
    }
    onCompleted(handler4) {
      return this.on(5 /* Completed */, handler4);
    }
    onStateChange(handler4) {
      return this.on(7 /* StateChange */, handler4);
    }
    onResponseChange(handler4) {
      return this.on(8 /* ResponseChange */, handler4);
    }
  };

  // utils/lodash/debounce.ts
  function debounce(wait, func) {
    let timeoutId;
    return function debounced(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, wait);
    };
  }

  // domains/list/constants.ts
  var DEFAULT_PAGE_SIZE = 10;
  var DEFAULT_CURRENT_PAGE = 1;
  var DEFAULT_TOTAL = 0;
  var DEFAULT_RESPONSE = {
    dataSource: [],
    page: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: DEFAULT_TOTAL,
    search: {},
    initial: true,
    noMore: false,
    loading: false,
    refreshing: null,
    empty: false,
    error: null
  };
  var DEFAULT_PARAMS = {
    page: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    next_marker: ""
  };

  // domains/list/utils.ts
  function omit(data, keys) {
    const fake = __spreadValues({}, data);
    keys.forEach((key) => {
      delete fake[key];
    });
    return fake;
  }

  // domains/list/index.ts
  var RESPONSE_PROCESSOR = (originalResponse) => {
    if (originalResponse === null) {
      return {
        dataSource: [],
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: DEFAULT_TOTAL,
        noMore: false,
        empty: false,
        error: new Error(`process response fail, because response is null`)
      };
    }
    try {
      const data = originalResponse;
      const {
        list,
        page = 1,
        pageSize = 10,
        total = 0,
        isEnd
      } = data;
      const result = {
        dataSource: list,
        page,
        pageSize,
        total,
        noMore: false,
        empty: false,
        error: null
      };
      if (total && pageSize && page && total <= pageSize * page) {
        result.noMore = true;
      }
      if (isEnd !== void 0) {
        result.noMore = isEnd;
      }
      if (pageSize && list.length < pageSize) {
        result.noMore = true;
      }
      if (list.length === 0 && page === 1) {
        result.empty = true;
      }
      return result;
    } catch (error) {
      return {
        dataSource: [],
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        total: DEFAULT_TOTAL,
        noMore: false,
        empty: false,
        error: new Error(`process response fail, because ${error.message}`)
      };
    }
  };
  var _ListCore = class _ListCore extends BaseDomain {
    constructor(fetch, options = {}) {
      var _a4;
      super();
      __publicField(this, "debug", false);
      /** 原始请求方法 */
      __publicField(this, "request");
      // private originalFetch: (...args: unknown[]) => Promise<OriginalResponse>;
      /** 支持请求前对参数进行处理（formToBody） */
      __publicField(this, "beforeRequest", (currentParams, prevParams) => {
        return __spreadValues(__spreadValues({}, prevParams), currentParams);
      });
      /** 响应处理器 */
      __publicField(this, "processor");
      /** 初始查询参数 */
      __publicField(this, "initialParams");
      __publicField(this, "extraResponse");
      /** 额外的数据 */
      __publicField(this, "extraDatSource", []);
      __publicField(this, "insertExtraDataSource", false);
      __publicField(this, "params", __spreadValues({}, DEFAULT_PARAMS));
      // 响应数据
      __publicField(this, "response", __spreadValues({}, DEFAULT_RESPONSE));
      __publicField(this, "rowKey");
      __publicField(this, "searchDebounce", debounce(800, (...args) => {
        return this.search(...args);
      }));
      if (!(fetch instanceof RequestCore)) {
        throw new Error("fetch must be a instance of RequestCore");
      }
      const {
        debug,
        rowKey = "id",
        beforeRequest,
        processor,
        extraDefaultResponse,
        extraDataSource,
        onLoadingChange,
        onStateChange,
        beforeSearch,
        afterSearch
      } = options;
      this.debug = !!debug;
      this.rowKey = rowKey;
      this.request = fetch;
      this.processor = (originalResponse) => {
        const nextResponse = __spreadValues(__spreadValues({}, this.response), _ListCore.commonProcessor(originalResponse));
        if (processor) {
          const r = processor(nextResponse, originalResponse);
          if (r !== void 0) {
            return r;
          }
        }
        return nextResponse;
      };
      if (beforeRequest !== void 0) {
        this.beforeRequest = beforeRequest;
      }
      this.initialParams = __spreadValues({}, DEFAULT_PARAMS);
      this.extraResponse = __spreadValues({}, extraDefaultResponse);
      this.extraDatSource = (_a4 = options.extraDataSource) != null ? _a4 : [];
      if (onLoadingChange) {
        this.onLoadingChange(onLoadingChange);
      }
      if (onStateChange) {
        this.onStateChange(onStateChange);
      }
      if (beforeSearch) {
        this.onBeforeSearch(beforeSearch);
      }
      if (afterSearch) {
        this.onAfterSearch(afterSearch);
      }
      this.initialize(options);
    }
    initialize(options) {
      const { search, dataSource, page, pageSize, initial } = options;
      if (search !== void 0) {
        this.initialParams = __spreadValues(__spreadValues({}, this.initialParams), search);
        this.extraResponse.search = search;
      }
      if (dataSource !== void 0) {
        this.extraResponse.dataSource = dataSource;
      }
      if (page !== void 0) {
        this.initialParams.page = page;
        this.extraResponse.page = page;
      }
      if (pageSize !== void 0) {
        this.initialParams.pageSize = pageSize;
        this.extraResponse.pageSize = pageSize;
      }
      if (initial !== void 0) {
        this.extraResponse.initial = initial;
      }
      this.params = __spreadValues({}, this.initialParams);
      this.response = __spreadValues(__spreadValues({}, _ListCore.defaultResponse()), this.extraResponse);
      const _a4 = this.params, { page: p, pageSize: ps } = _a4, restParams = __objRest(_a4, ["page", "pageSize"]);
      const responseFromPlugin = {
        search: restParams
      };
      if (p) {
        responseFromPlugin.page = p;
      }
      if (ps) {
        responseFromPlugin.pageSize = ps;
      }
      this.response = __spreadProps(__spreadValues(__spreadValues({}, this.response), responseFromPlugin), {
        search: __spreadValues({}, this.response.search)
      });
    }
    /**
     * 手动修改当前实例的查询参数
     * @param {import('./typing').FetchParams} nextParams 查询参数或设置函数
     */
    setParams(nextParams) {
      let result = __spreadValues(__spreadValues({}, this.params), nextParams);
      if (typeof nextParams === "function") {
        result = nextParams(this.params);
      }
      this.params = result;
      this.emit(3 /* ParamsChange */, __spreadValues({}, this.params));
    }
    setDataSource(dataSources) {
      this.response.dataSource = dataSources;
      this.emit(6 /* StateChange */, __spreadValues({}, this.response));
    }
    /**
     * 调用接口进行请求
     * 外部不应该直接调用该方法
     * @param {import('./typing').FetchParams} nextParams - 查询参数
     */
    fetch(params, ...restArgs) {
      return __async(this, null, function* () {
        this.response.loading = true;
        this.emit(0 /* LoadingChange */, true);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        const mergedParams = __spreadValues(__spreadValues({}, this.params), params);
        let processedParams = this.beforeRequest(__spreadValues({}, mergedParams), this.params);
        if (processedParams === void 0) {
          processedParams = mergedParams;
        }
        const processedArgs = [processedParams, ...restArgs];
        const res = yield this.request.run(...processedArgs);
        this.response.error = null;
        this.response.loading = false;
        this.response.search = omit(__spreadValues({}, mergedParams), ["page", "pageSize"]);
        if (this.response.initial) {
          this.response.initial = false;
        }
        this.params = __spreadValues({}, processedParams);
        this.emit(0 /* LoadingChange */, false);
        this.emit(3 /* ParamsChange */, __spreadValues({}, this.params));
        this.emit(8 /* Completed */);
        if (res.error) {
          return Result.Err(res.error);
        }
        const originalResponse = res.data;
        let response = this.processor(originalResponse);
        const responseIsEmpty = response.dataSource === void 0;
        if (responseIsEmpty) {
          response.dataSource = [];
        }
        if (this.extraDatSource.length !== 0 && this.insertExtraDataSource === false) {
          this.insertExtraDataSource = true;
          response.dataSource = [...this.extraDatSource, ...response.dataSource];
        }
        if (params.page === 1 && response.dataSource.length === 0) {
          response.empty = true;
        }
        if (response.next_marker) {
          this.params.next_marker = response.next_marker;
        }
        return Result.Ok(response);
      });
    }
    /**
     * 使用初始参数请求一次，初始化时请调用该方法
     */
    init() {
      return __async(this, arguments, function* (params = {}) {
        const res = yield this.fetch(__spreadValues(__spreadValues({}, this.initialParams), params));
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "init"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    /** 无论如何都会触发一次 state change */
    initAny() {
      return __async(this, null, function* () {
        if (!this.response.initial) {
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Ok(this.response);
        }
        return this.init();
      });
    }
    /**
     * 下一页
     */
    next() {
      return __async(this, null, function* () {
        const _a4 = this.params, { page } = _a4, restParams = __objRest(_a4, ["page"]);
        const res = yield this.fetch(__spreadProps(__spreadValues({}, restParams), {
          page: page + 1
        }));
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "next"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    /**
     * 返回上一页
     */
    prev() {
      return __async(this, null, function* () {
        const _a4 = this.params, { page } = _a4, restParams = __objRest(_a4, ["page"]);
        const res = yield this.fetch(__spreadProps(__spreadValues({}, restParams), {
          page: (() => {
            if (page <= DEFAULT_CURRENT_PAGE) {
              return DEFAULT_CURRENT_PAGE;
            }
            return page - 1;
          })()
        }));
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "prev"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    nextWithCursor() {
    }
    /** 强制请求下一页，如果下一页没有数据，page 不改变 */
    loadMoreForce() {
      return __async(this, null, function* () {
        const _a4 = this.params, { page } = _a4, restParams = __objRest(_a4, ["page"]);
        const res = yield this.fetch(__spreadProps(__spreadValues({}, restParams), {
          page: page + 1
        }));
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        if (res.data.dataSource.length === 0) {
          this.params.page -= 1;
        }
        const prevItems = this.response.dataSource;
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.response.dataSource = prevItems.concat(res.data.dataSource);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(5 /* DataSourceAdded */, [...res.data.dataSource]);
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "load_more"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    /**
     * 无限加载时使用的下一页
     */
    loadMore() {
      return __async(this, null, function* () {
        if (this.response.loading || this.response.noMore) {
          return;
        }
        const _a4 = this.params, { page } = _a4, restParams = __objRest(_a4, ["page"]);
        const res = yield this.fetch(__spreadProps(__spreadValues({}, restParams), {
          page: page + 1
        }));
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        const prevItems = this.response.dataSource;
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.response.dataSource = prevItems.concat(res.data.dataSource);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(5 /* DataSourceAdded */, [...res.data.dataSource]);
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "load_more"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    /**
     * 前往指定页码
     * @param {number} page - 要前往的页码
     * @param {number} [pageSize] - 每页数量
     */
    goto(targetPage, targetPageSize) {
      return __async(this, null, function* () {
        const _a4 = this.params, { page, pageSize } = _a4, restParams = __objRest(_a4, ["page", "pageSize"]);
        const res = yield this.fetch(__spreadProps(__spreadValues({}, restParams), {
          page: (() => {
            if (targetPage <= DEFAULT_CURRENT_PAGE) {
              return DEFAULT_CURRENT_PAGE;
            }
            return targetPage;
          })(),
          pageSize: (() => {
            if (targetPageSize !== void 0) {
              return targetPageSize;
            }
            return pageSize;
          })()
        }));
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "goto"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    search(...args) {
      return __async(this, null, function* () {
        this.emit(1 /* BeforeSearch */);
        const res = yield this.fetch(__spreadValues(__spreadValues({}, this.initialParams), args[0]));
        this.emit(2 /* AfterSearch */, { params: args[0] });
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "search"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    /**
     * 使用初始参数请求一次，「重置」操作时调用该方法
     */
    reset() {
      return __async(this, arguments, function* (params = {}) {
        this.params = __spreadValues({}, this.initialParams);
        const res = yield this.fetch(params);
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "reset"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    /**
     * 使用当前参数重新请求一次，PC 端「刷新」操作时调用该方法
     */
    reload() {
      return __async(this, null, function* () {
        const r = yield this.fetch({});
        return r;
      });
    }
    /**
     * 页码置为 1，其他参数保留，重新请求一次。移动端「刷新」操作时调用该方法
     */
    refresh() {
      return __async(this, null, function* () {
        const _a4 = this.params, { page } = _a4, restParams = __objRest(_a4, ["page"]);
        this.response.refreshing = true;
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        const res = yield this.fetch(__spreadProps(__spreadValues({}, restParams), {
          page: 1,
          next_marker: ""
        }));
        this.response.refreshing = false;
        if (res.error) {
          this.response.error = res.error;
          this.emit(7 /* Error */, res.error);
          this.emit(6 /* StateChange */, __spreadValues({}, this.response));
          return Result.Err(res.error);
        }
        this.response = __spreadValues(__spreadValues({}, this.response), res.data);
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "refresh"
        });
        return Result.Ok(__spreadValues({}, this.response));
      });
    }
    clear() {
      this.response = __spreadValues({}, DEFAULT_RESPONSE);
      this.params = __spreadValues({}, DEFAULT_PARAMS);
      this.emit(6 /* StateChange */, __spreadValues({}, this.response));
      this.emit(4 /* DataSourceChange */, {
        dataSource: [...this.response.dataSource],
        reason: "clear"
      });
    }
    deleteItem(fn) {
      const { dataSource } = this.response;
      const nextDataSource = dataSource.filter((item) => {
        return !fn(item);
      });
      this.response.total = nextDataSource.length;
      this.response.dataSource = nextDataSource;
      this.emit(6 /* StateChange */, __spreadValues({}, this.response));
      this.emit(4 /* DataSourceChange */, {
        dataSource: [...this.response.dataSource],
        reason: "manually"
      });
    }
    /**
     * 移除列表中的多项（用在删除场景）
     * @param {T[]} items 要删除的元素列表
     */
    deleteItems(items) {
      return __async(this, null, function* () {
        const { dataSource } = this.response;
        const nextDataSource = dataSource.filter((item) => {
          return !items.includes(item);
        });
        this.response.total = nextDataSource.length;
        this.response.dataSource = nextDataSource;
        this.emit(6 /* StateChange */, __spreadValues({}, this.response));
        this.emit(4 /* DataSourceChange */, {
          dataSource: [...this.response.dataSource],
          reason: "manually"
        });
      });
    }
    modifyItem(fn) {
      const { dataSource } = this.response;
      const nextDataSource = [];
      for (let i = 0; i < dataSource.length; i += 1) {
        const item = dataSource[i];
        let r = fn(item);
        if (!r) {
          r = item;
        }
        nextDataSource.push(r);
      }
      this.response.dataSource = nextDataSource;
      this.emit(6 /* StateChange */, __spreadValues({}, this.response));
      this.emit(4 /* DataSourceChange */, {
        dataSource: [...this.response.dataSource],
        reason: "manually"
      });
    }
    replaceDataSource(dataSource) {
      this.response.dataSource = dataSource;
      this.emit(4 /* DataSourceChange */, {
        dataSource: [...this.response.dataSource],
        reason: "manually"
      });
    }
    /**
     * 手动修改当前 dataSource
     * @param fn
     */
    modifyDataSource(fn) {
      this.response.dataSource = this.response.dataSource.map((item) => {
        return fn(item);
      });
      this.emit(6 /* StateChange */, __spreadValues({}, this.response));
      this.emit(4 /* DataSourceChange */, {
        dataSource: [...this.response.dataSource],
        reason: "manually"
      });
    }
    /**
     * 手动修改当前 response
     * @param fn
     */
    modifyResponse(fn) {
      this.response = fn(__spreadValues({}, this.response));
      this.emit(6 /* StateChange */, __spreadValues({}, this.response));
      this.emit(4 /* DataSourceChange */, {
        dataSource: [...this.response.dataSource],
        reason: "manually"
      });
    }
    /**
     * 手动修改当前 params
     */
    modifyParams(fn) {
      this.params = fn(this.params);
      this.emit(3 /* ParamsChange */, __spreadValues({}, this.params));
    }
    /**
     * 手动修改当前 search
     */
    modifySearch(fn) {
      this.params = __spreadProps(__spreadValues({}, fn(this.params)), {
        page: this.params.page,
        pageSize: this.params.pageSize
      });
      this.emit(3 /* ParamsChange */, __spreadValues({}, this.params));
    }
    onStateChange(handler4) {
      return this.on(6 /* StateChange */, handler4);
    }
    onLoadingChange(handler4) {
      return this.on(0 /* LoadingChange */, handler4);
    }
    onBeforeSearch(handler4) {
      return this.on(1 /* BeforeSearch */, handler4);
    }
    onAfterSearch(handler4) {
      return this.on(2 /* AfterSearch */, handler4);
    }
    onDataSourceChange(handler4) {
      return this.on(4 /* DataSourceChange */, handler4);
    }
    onDataSourceAdded(handler4) {
      return this.on(5 /* DataSourceAdded */, handler4);
    }
    onError(handler4) {
      return this.on(7 /* Error */, handler4);
    }
    onComplete(handler4) {
      return this.on(8 /* Completed */, handler4);
    }
  };
  __publicField(_ListCore, "defaultResponse", () => {
    return __spreadValues({}, DEFAULT_RESPONSE);
  });
  __publicField(_ListCore, "commonProcessor", RESPONSE_PROCESSOR);
  var ListCore = _ListCore;

  // domains/multiple/index.ts
  var MultipleSelectionCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      __publicField(this, "shape", "multiple-select");
      __publicField(this, "value", []);
      __publicField(this, "defaultValue", []);
      __publicField(this, "options", []);
      const { defaultValue, options, onChange } = props;
      this.defaultValue = defaultValue;
      this.value = defaultValue;
      this.options = options;
      if (onChange) {
        this.onChange(onChange);
      }
    }
    get state() {
      return {
        value: this.value,
        options: this.options
      };
    }
    setValue(value) {
      this.value = value;
      this.emit(0 /* Change */, [...this.value]);
    }
    toggle(value) {
      if (this.value.includes(value)) {
        this.remove(value);
        return;
      }
      this.select(value);
    }
    select(value) {
      if (this.value.includes(value)) {
        return;
      }
      this.value.push(value);
      this.emit(0 /* Change */, [...this.value]);
      this.emit(1 /* StateChange */, __spreadValues({}, this.state));
    }
    remove(value) {
      if (!this.value.includes(value)) {
        return;
      }
      this.value = this.value.filter((v2) => v2 !== value);
      this.emit(0 /* Change */, [...this.value]);
      this.emit(1 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 暂存的值是否为空 */
    isEmpty() {
      return this.value.length === 0;
    }
    clear() {
      this.value = [];
      this.emit(0 /* Change */, [...this.value]);
      this.emit(1 /* StateChange */, __spreadValues({}, this.state));
    }
    onChange(handler4) {
      return this.on(0 /* Change */, handler4);
    }
    onStateChange(handler4) {
      return this.on(1 /* StateChange */, handler4);
    }
  };

  // domains/qrcode/core.ts
  var d = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 };
  var m = { L: 1, M: 0, Q: 3, H: 2 };
  var C = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 };
  var h = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1335, G18: 7973, G15_MASK: 21522, getBCHTypeInfo(o2) {
    let t = o2 << 10;
    for (; h.getBCHDigit(t) - h.getBCHDigit(h.G15) >= 0; ) t ^= h.G15 << h.getBCHDigit(t) - h.getBCHDigit(h.G15);
    return (o2 << 10 | t) ^ h.G15_MASK;
  }, getBCHTypeNumber(o2) {
    let t = o2 << 12;
    for (; h.getBCHDigit(t) - h.getBCHDigit(h.G18) >= 0; ) t ^= h.G18 << h.getBCHDigit(t) - h.getBCHDigit(h.G18);
    return o2 << 12 | t;
  }, getBCHDigit(o2) {
    let t = 0;
    for (; o2 != 0; ) t++, o2 >>>= 1;
    return t;
  }, getPatternPosition(o2) {
    return h.PATTERN_POSITION_TABLE[o2 - 1];
  }, getMask(o2, t, r) {
    switch (o2) {
      case C.PATTERN000:
        return (t + r) % 2 == 0;
      case C.PATTERN001:
        return t % 2 == 0;
      case C.PATTERN010:
        return r % 3 == 0;
      case C.PATTERN011:
        return (t + r) % 3 == 0;
      case C.PATTERN100:
        return (Math.floor(t / 2) + Math.floor(r / 3)) % 2 == 0;
      case C.PATTERN101:
        return t * r % 2 + t * r % 3 == 0;
      case C.PATTERN110:
        return (t * r % 2 + t * r % 3) % 2 == 0;
      case C.PATTERN111:
        return (t * r % 3 + (t + r) % 2) % 2 == 0;
      default:
        throw new Error(`bad maskPattern:${o2}`);
    }
  }, getErrorCorrectPolynomial(o2) {
    let t = new E([1], 0);
    for (let r = 0; r < o2; r++) t = t.multiply(new E([1, g.gexp(r)], 0));
    return t;
  }, getLengthInBits(o2, t) {
    if (t >= 1 && t < 10) switch (o2) {
      case d.MODE_NUMBER:
        return 10;
      case d.MODE_ALPHA_NUM:
        return 9;
      case d.MODE_8BIT_BYTE:
        return 8;
      case d.MODE_KANJI:
        return 8;
      default:
        throw new Error(`mode:${o2}`);
    }
    else if (t < 27) switch (o2) {
      case d.MODE_NUMBER:
        return 12;
      case d.MODE_ALPHA_NUM:
        return 11;
      case d.MODE_8BIT_BYTE:
        return 16;
      case d.MODE_KANJI:
        return 10;
      default:
        throw new Error(`mode:${o2}`);
    }
    else if (t < 41) switch (o2) {
      case d.MODE_NUMBER:
        return 14;
      case d.MODE_ALPHA_NUM:
        return 13;
      case d.MODE_8BIT_BYTE:
        return 16;
      case d.MODE_KANJI:
        return 12;
      default:
        throw new Error(`mode:${o2}`);
    }
    else throw new Error(`type:${t}`);
  }, getLostPoint(o2) {
    let t = o2.getModuleCount(), r = 0;
    for (var e = 0; e < t; e++) for (var n = 0; n < t; n++) {
      let a = 0, l = o2.isDark(e, n);
      for (let u = -1; u <= 1; u++) if (!(e + u < 0 || t <= e + u)) for (let f = -1; f <= 1; f++) n + f < 0 || t <= n + f || u == 0 && f == 0 || l == o2.isDark(e + u, n + f) && a++;
      a > 5 && (r += 3 + a - 5);
    }
    for (let a = 0; a < t - 1; a += 1) for (let l = 0; l < t - 1; l += 1) {
      let u = 0;
      o2.isDark(a, l) && u++, o2.isDark(a + 1, l) && u++, o2.isDark(a, l + 1) && u++, o2.isDark(a + 1, l + 1) && u++, (u == 0 || u == 4) && (r += 3);
    }
    for (var e = 0; e < t; e++) for (var n = 0; n < t - 6; n++) o2.isDark(e, n) && !o2.isDark(e, n + 1) && o2.isDark(e, n + 2) && o2.isDark(e, n + 3) && o2.isDark(e, n + 4) && !o2.isDark(e, n + 5) && o2.isDark(e, n + 6) && (r += 40);
    for (var n = 0; n < t; n++) for (var e = 0; e < t - 6; e++) o2.isDark(e, n) && !o2.isDark(e + 1, n) && o2.isDark(e + 2, n) && o2.isDark(e + 3, n) && o2.isDark(e + 4, n) && !o2.isDark(e + 5, n) && o2.isDark(e + 6, n) && (r += 40);
    let s = 0;
    for (var n = 0; n < t; n++) for (var e = 0; e < t; e++) o2.isDark(e, n) && s++;
    let i = Math.abs(100 * s / t / t - 50) / 5;
    return r += i * 10, r;
  } };
  var g = { glog(o2) {
    if (o2 < 1) throw new Error(`glog(${o2})`);
    return g.LOG_TABLE[o2];
  }, gexp(o2) {
    for (; o2 < 0; ) o2 += 255;
    for (; o2 >= 256; ) o2 -= 255;
    return g.EXP_TABLE[o2];
  }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) };
  (() => {
    for (let o2 = 0; o2 < 8; o2 += 1) g.EXP_TABLE[o2] = 1 << o2;
    for (let o2 = 8; o2 < 256; o2 += 1) g.EXP_TABLE[o2] = g.EXP_TABLE[o2 - 4] ^ g.EXP_TABLE[o2 - 5] ^ g.EXP_TABLE[o2 - 6] ^ g.EXP_TABLE[o2 - 8];
    for (let o2 = 0; o2 < 255; o2 += 1) g.LOG_TABLE[g.EXP_TABLE[o2]] = o2;
  })();
  var E = class o {
    constructor(t, r) {
      __publicField(this, "num");
      if (t.length === void 0) throw new Error(`${t.length}/${r}`);
      let e = 0;
      for (; e < t.length && t[e] === 0; ) e++;
      this.num = new Array(t.length - e + r);
      for (let n = 0; n < t.length - e; n += 1) this.num[n] = t[n + e];
    }
    get(t) {
      return this.num[t];
    }
    getLength() {
      return this.num.length;
    }
    multiply(t) {
      let r = new Array(this.getLength() + t.getLength() - 1);
      for (let e = 0; e < this.getLength(); e++) for (let n = 0; n < t.getLength(); n++) r[e + n] ^= g.gexp(g.glog(this.get(e)) + g.glog(t.get(n)));
      return new o(r, 0);
    }
    mod(t) {
      if (this.getLength() - t.getLength() < 0) return this;
      let r = g.glog(this.get(0)) - g.glog(t.get(0)), e = new Array(this.getLength());
      for (let n = 0; n < this.getLength(); n++) e[n] = this.get(n);
      for (let n = 0; n < t.getLength(); n++) e[n] ^= g.gexp(g.glog(t.get(n)) + r);
      return new o(e, 0).mod(t);
    }
  };
  var _ = class {
    constructor(t) {
      __publicField(this, "mode");
      __publicField(this, "parsedData");
      __publicField(this, "data");
      this.mode = d.MODE_8BIT_BYTE, this.data = t, this.parsedData = [];
      for (let r = 0, e = this.data.length; r < e; r++) {
        let n = [], s = this.data.charCodeAt(r);
        s > 65536 ? (n[0] = 240 | (s & 1835008) >>> 18, n[1] = 128 | (s & 258048) >>> 12, n[2] = 128 | (s & 4032) >>> 6, n[3] = 128 | s & 63) : s > 2048 ? (n[0] = 224 | (s & 61440) >>> 12, n[1] = 128 | (s & 4032) >>> 6, n[2] = 128 | s & 63) : s > 128 ? (n[0] = 192 | (s & 1984) >>> 6, n[1] = 128 | s & 63) : n[0] = s, this.parsedData.push(n);
      }
      this.parsedData = Array.prototype.concat.apply([], this.parsedData), this.parsedData.length != this.data.length && (this.parsedData.unshift(191), this.parsedData.unshift(187), this.parsedData.unshift(239));
    }
    getLength() {
      return this.parsedData.length;
    }
    write(t) {
      for (let r = 0, e = this.parsedData.length; r < e; r++) t.put(this.parsedData[r], 8);
    }
  };
  var _a;
  var P = (_a = class {
    constructor(t, r) {
      __publicField(this, "typeNumber");
      __publicField(this, "errorCorrectLevel");
      __publicField(this, "modules", []);
      __publicField(this, "moduleCount");
      __publicField(this, "dataCache");
      __publicField(this, "dataList");
      this.typeNumber = t, this.errorCorrectLevel = r, this.modules = [], this.moduleCount = 0, this.dataCache = null, this.dataList = [];
    }
    addData(t) {
      let r = new _(t);
      this.dataList.push(r), this.dataCache = null;
    }
    isDark(t, r) {
      if (t < 0 || this.moduleCount <= t || r < 0 || this.moduleCount <= r) throw new Error(`${t},${r}`);
      return this.modules[t][r];
    }
    getModuleCount() {
      return this.moduleCount;
    }
    make() {
      this.makeImpl(false, this.getBestMaskPattern());
    }
    makeImpl(t, r) {
      this.moduleCount = this.typeNumber * 4 + 17, this.modules = new Array(this.moduleCount);
      for (let e = 0; e < this.moduleCount; e++) {
        this.modules[e] = new Array(this.moduleCount);
        for (let n = 0; n < this.moduleCount; n++) this.modules[e][n] = null;
      }
      this.setupPositionProbePattern(0, 0), this.setupPositionProbePattern(this.moduleCount - 7, 0), this.setupPositionProbePattern(0, this.moduleCount - 7), this.setupPositionAdjustPattern(), this.setupTimingPattern(), this.setupTypeInfo(t, r), this.typeNumber >= 7 && this.setupTypeNumber(t), this.dataCache == null && (this.dataCache = _a.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)), this.mapData(this.dataCache, r);
    }
    setupPositionProbePattern(t, r) {
      for (let e = -1; e <= 7; e++) if (!(t + e <= -1 || this.moduleCount <= t + e)) for (let n = -1; n <= 7; n++) r + n <= -1 || this.moduleCount <= r + n || (e >= 0 && e <= 6 && (n == 0 || n == 6) || n >= 0 && n <= 6 && (e == 0 || e == 6) || e >= 2 && e <= 4 && n >= 2 && n <= 4 ? this.modules[t + e][r + n] = true : this.modules[t + e][r + n] = false);
    }
    getBestMaskPattern() {
      let t = 0, r = 0;
      for (let e = 0; e < 8; e++) {
        this.makeImpl(true, e);
        let n = h.getLostPoint(this);
        (e == 0 || t > n) && (t = n, r = e);
      }
      return r;
    }
    setupTimingPattern() {
      for (let t = 8; t < this.moduleCount - 8; t++) this.modules[t][6] == null && (this.modules[t][6] = t % 2 == 0);
      for (let t = 8; t < this.moduleCount - 8; t++) this.modules[6][t] == null && (this.modules[6][t] = t % 2 == 0);
    }
    setupPositionAdjustPattern() {
      let t = h.getPatternPosition(this.typeNumber);
      for (let r = 0; r < t.length; r++) for (let e = 0; e < t.length; e++) {
        let n = t[r], s = t[e];
        if (this.modules[n][s] == null) for (let i = -2; i <= 2; i++) for (let a = -2; a <= 2; a++) i == -2 || i == 2 || a == -2 || a == 2 || i == 0 && a == 0 ? this.modules[n + i][s + a] = true : this.modules[n + i][s + a] = false;
      }
    }
    setupTypeNumber(t) {
      let r = h.getBCHTypeNumber(this.typeNumber);
      for (var e = 0; e < 18; e++) {
        var n = !t && (r >> e & 1) == 1;
        this.modules[Math.floor(e / 3)][e % 3 + this.moduleCount - 8 - 3] = n;
      }
      for (var e = 0; e < 18; e++) {
        var n = !t && (r >> e & 1) == 1;
        this.modules[e % 3 + this.moduleCount - 8 - 3][Math.floor(e / 3)] = n;
      }
    }
    setupTypeInfo(t, r) {
      let e = this.errorCorrectLevel << 3 | r, n = h.getBCHTypeInfo(e);
      for (var s = 0; s < 15; s++) {
        var i = !t && (n >> s & 1) == 1;
        s < 6 ? this.modules[s][8] = i : s < 8 ? this.modules[s + 1][8] = i : this.modules[this.moduleCount - 15 + s][8] = i;
      }
      for (var s = 0; s < 15; s++) {
        var i = !t && (n >> s & 1) == 1;
        s < 8 ? this.modules[8][this.moduleCount - s - 1] = i : s < 9 ? this.modules[8][15 - s - 1 + 1] = i : this.modules[8][15 - s - 1] = i;
      }
      this.modules[this.moduleCount - 8][8] = !t;
    }
    mapData(t, r) {
      let e = -1, n = this.moduleCount - 1, s = 7, i = 0;
      for (let a = this.moduleCount - 1; a > 0; a -= 2) for (a == 6 && a--; ; ) {
        for (let l = 0; l < 2; l++) if (this.modules[n][a - l] == null) {
          let u = false;
          i < t.length && (u = (t[i] >>> s & 1) == 1), h.getMask(r, n, a - l) && (u = !u), this.modules[n][a - l] = u, s--, s == -1 && (i++, s = 7);
        }
        if (n += e, n < 0 || this.moduleCount <= n) {
          n -= e, e = -e;
          break;
        }
      }
    }
  }, __publicField(_a, "PAD0", 236), __publicField(_a, "PAD1", 17), __publicField(_a, "createData", function(t, r, e) {
    let n = A.getRSBlocks(t, r), s = new B();
    for (let a = 0; a < e.length; a += 1) {
      let l = e[a];
      s.put(l.mode, 4), s.put(l.getLength(), h.getLengthInBits(l.mode, t)), l.write(s);
    }
    let i = 0;
    for (let a = 0; a < n.length; a += 1) i += n[a].dataCount;
    if (s.getLengthInBits() > i * 8) throw new Error(`code length overflow. (${s.getLengthInBits()}>${i * 8})`);
    for (s.getLengthInBits() + 4 <= i * 8 && s.put(0, 4); s.getLengthInBits() % 8 !== 0; ) s.putBit(false);
    for (; !(s.getLengthInBits() >= i * 8 || (s.put(_a.PAD0, 8), s.getLengthInBits() >= i * 8)); ) s.put(_a.PAD1, 8);
    return _a.createBytes(s, n);
  }), __publicField(_a, "createBytes", function(t, r) {
    let e = 0, n = 0, s = 0, i = new Array(r.length), a = new Array(r.length);
    for (let c = 0; c < r.length; c += 1) {
      let b = r[c].dataCount, M = r[c].totalCount - b;
      n = Math.max(n, b), s = Math.max(s, M), i[c] = new Array(b);
      for (let p = 0; p < i[c].length; p += 1) i[c][p] = 255 & t.buffer[p + e];
      e += b;
      let T = h.getErrorCorrectPolynomial(M), R = new E(i[c], T.getLength() - 1).mod(T);
      a[c] = new Array(T.getLength() - 1);
      for (let p = 0; p < a[c].length; p += 1) {
        let k = p + R.getLength() - a[c].length;
        a[c][p] = k >= 0 ? R.get(k) : 0;
      }
    }
    let l = 0;
    for (let c = 0; c < r.length; c += 1) l += r[c].totalCount;
    let u = new Array(l), f = 0;
    for (let c = 0; c < n; c += 1) for (let b = 0; b < r.length; b += 1) c < i[b].length && (u[f++] = i[b][c]);
    for (var L = 0; L < s; L++) for (var w = 0; w < r.length; w++) L < a[w].length && (u[f++] = a[w][L]);
    return u;
  }), _a);
  var _a2;
  var A = (_a2 = class {
    constructor(t, r) {
      __publicField(this, "totalCount");
      __publicField(this, "dataCount");
      this.totalCount = t, this.dataCount = r;
    }
  }, __publicField(_a2, "RS_BLOCK_TABLE", [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]]), __publicField(_a2, "getRSBlocks", function(t, r) {
    let e = _a2.getRsBlockTable(t, r);
    if (e == null) throw new Error(`bad rs block @ typeNumber:${t}/errorCorrectLevel:${r}`);
    let n = e.length / 3, s = [];
    for (let i = 0; i < n; i++) {
      let a = e[i * 3 + 0], l = e[i * 3 + 1], u = e[i * 3 + 2];
      for (let f = 0; f < a; f++) s.push(new _a2(l, u));
    }
    return s;
  }), __publicField(_a2, "getRsBlockTable", function(t, r) {
    switch (r) {
      case m.L:
        return _a2.RS_BLOCK_TABLE[(t - 1) * 4 + 0];
      case m.M:
        return _a2.RS_BLOCK_TABLE[(t - 1) * 4 + 1];
      case m.Q:
        return _a2.RS_BLOCK_TABLE[(t - 1) * 4 + 2];
      case m.H:
        return _a2.RS_BLOCK_TABLE[(t - 1) * 4 + 3];
      default:
        return;
    }
  }), _a2);
  var B = class {
    constructor() {
      __publicField(this, "length");
      __publicField(this, "buffer");
      this.buffer = [], this.length = 0;
    }
    get(t) {
      let r = Math.floor(t / 8);
      return (this.buffer[r] >>> 7 - t % 8 & 1) == 1;
    }
    put(t, r) {
      for (let e = 0; e < r; e++) this.putBit((t >>> r - e - 1 & 1) == 1);
    }
    getLengthInBits() {
      return this.length;
    }
    putBit(t) {
      let r = Math.floor(this.length / 8);
      this.buffer.length <= r && this.buffer.push(0), t && (this.buffer[r] |= 128 >>> this.length % 8), this.length++;
    }
  };
  var D = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];
  function x(o2, t) {
    let r = 1, e = v(o2);
    for (let n = 0, s = D.length; n <= s; n++) {
      let i = 0;
      switch (t) {
        case m.L:
          i = D[n][0];
          break;
        case m.M:
          i = D[n][1];
          break;
        case m.Q:
          i = D[n][2];
          break;
        case m.H:
          i = D[n][3];
          break;
      }
      if (e <= i) break;
      r++;
    }
    if (r > D.length) throw new Error("Too long data");
    return r;
  }
  function v(o2) {
    let t = encodeURI(o2).toString().replace(/\%[0-9a-fA-F]{2}/g, "a");
    return t.length + (t.length != o2 ? 3 : 0);
  }
  var _a3;
  var y = (_a3 = class {
    constructor(t) {
      __publicField(this, "_htOption");
      __publicField(this, "_oQRCode", null);
      this._htOption = { width: 256, height: 256, typeNumber: 4, colorDark: "#000000", colorLight: "#ffffff", correctLevel: m.H, text: "" };
      let r = typeof t == "string" ? { text: t } : t || {};
      for (let e in r) this._htOption[e] = r[e];
      this._oQRCode = null;
    }
    fetchModel(t, r = {}) {
      return [void 0, null, ""].includes(t) ? (console.error("\u4E8C\u7EF4\u7801\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A"), null) : (this._oQRCode = new P(x(t, this._htOption.correctLevel), this._htOption.correctLevel), this._oQRCode.addData(t), this._oQRCode.make(), this._oQRCode);
    }
  }, __publicField(_a3, "CorrectLevel", m), _a3);

  // domains/qrcode/index.ts
  var CanvasDrawing = class {
    constructor(options) {
      /** canvas 绘制上下文 */
      __publicField(this, "ctx");
      /** 是否绘制完成 */
      __publicField(this, "isPainted", false);
      __publicField(this, "options");
      const { ctx } = options;
      this.options = options;
      this.ctx = ctx;
    }
    /**
     * 绘制 logo
     */
    //   async drawLogo(img) {
    //     const ctx = this.ctx;
    //     return new Promise((resolve, reject) => {
    //       const image = document.createElement("img");
    //       image.src = img;
    //       image.crossOrigin = "anonymous";
    //       image.onload = (event) => {
    //         const { target } = event;
    //         // (256 / 2) - (48 / 2) === 104
    //         const size = 54;
    //         const x = 256 / 2 - size / 2;
    //         ctx.drawImage(image, x, x, size, size);
    //         resolve();
    //       };
    //       image.onerror = () => {
    //         resolve(Result.Err("Logo 加载失败"));
    //       };
    //     });
    //   }
    /**
     * Draw the QRCode
     *
     * @param {QRCode} model
     */
    draw(model) {
      const { ctx } = this;
      const { options } = this;
      const nCount = model.getModuleCount();
      const nWidth = options.width / nCount;
      const nHeight = options.height / nCount;
      const nRoundedWidth = Math.round(nWidth);
      const nRoundedHeight = Math.round(nHeight);
      console.log("count", nCount, nRoundedWidth, nRoundedHeight);
      this.clear();
      for (let row = 0; row < nCount; row++) {
        for (let col = 0; col < nCount; col++) {
          const isDark = model.isDark(row, col);
          const nLeft = col * nWidth;
          const nTop = row * nHeight;
          ctx.strokeStyle = isDark ? "#000000" : "#ffffff";
          ctx.lineWidth = 1;
          ctx.fillStyle = isDark ? "#000000" : "#ffffff";
          ctx.fillRect(nLeft, nTop, nWidth, nHeight);
          ctx.strokeRect(Math.floor(nLeft) + 0.5, Math.floor(nTop) + 0.5, nRoundedWidth, nRoundedHeight);
          ctx.strokeRect(Math.ceil(nLeft) - 0.5, Math.ceil(nTop) - 0.5, nRoundedWidth, nRoundedHeight);
        }
      }
      this.isPainted = true;
    }
    /**
     * Make the image from Canvas if the browser supports Data URI.
     */
    // makeImage() {
    //   if (this._bIsPainted) {
    //     _safeSetDataURI.call(this, _onMakeImage);
    //   }
    // }
    /**
     * Clear the QRCode
     */
    clear() {
      this.ctx.clearRect(0, 0, this.options.width, this.options.height);
      this.isPainted = false;
    }
    /**
     * @private
     * @param {Number} nNumber
     */
    round(nNumber) {
      if (!nNumber) {
        return nNumber;
      }
      return Math.floor(nNumber * 1e3) / 1e3;
    }
  };
  function createQRCode(text, options) {
    return __async(this, null, function* () {
      const { width, height } = options;
      const drawer = new CanvasDrawing(options);
      const model = yield new y({ width, height }).fetchModel(text, options);
      drawer.draw(model);
    });
  }

  // domains/storage/index.ts
  var StorageCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      __publicField(this, "key");
      __publicField(this, "values");
      __publicField(this, "defaultValues");
      __publicField(this, "client");
      __publicField(this, "set", debounce(100, (key, values) => {
        const nextValues = __spreadProps(__spreadValues({}, this.values), {
          [key]: values
        });
        this.values = nextValues;
        this.client.setItem(this.key, JSON.stringify(this.values));
        this.emit(0 /* StateChange */, __spreadValues({}, this.state));
      }));
      __publicField(this, "merge", (key, values, extra = {}) => {
        const prevValues = this.get(key) || {};
        if (Array.isArray(prevValues)) {
          let nextValues = extra.reverse ? [...values, ...prevValues] : [...prevValues, ...values];
          if (extra.limit) {
            nextValues = nextValues.slice(0, extra.limit);
          }
          this.set(key, nextValues);
          return nextValues;
        }
        if (typeof prevValues === "object" && typeof values === "object") {
          const nextValues = __spreadValues(__spreadValues({}, prevValues), values);
          this.set(key, nextValues);
          return nextValues;
        }
        console.warn("the params of merge must be object");
        return prevValues;
      });
      const { key, client, defaultValues, values } = props;
      this.key = key;
      this.values = values;
      this.values = __spreadValues(__spreadValues({}, defaultValues), values);
      this.defaultValues = defaultValues;
      this.client = client;
    }
    get state() {
      return {
        values: this.values
      };
    }
    get(key, defaultValue) {
      const v2 = this.values[key];
      if (v2 === void 0) {
        if (defaultValue) {
          return defaultValue[key];
        }
        throw new Error("the default value no existing");
      }
      return v2;
    }
    clear(key) {
      const v2 = this.values[key];
      if (v2 === void 0) {
        return null;
      }
      this.values = __spreadProps(__spreadValues({}, this.values), {
        [key]: this.defaultValues[key]
      });
      this.client.setItem(this.key, JSON.stringify(this.values));
      this.emit(0 /* StateChange */, __spreadValues({}, this.state));
    }
    remove(key) {
      this.clear(key);
    }
    onStateChange(handler4) {
      return this.on(0 /* StateChange */, handler4);
    }
  };

  // domains/system/index.ts
  var CurSystem = class {
    constructor() {
      __publicField(this, "connection", "unknown");
      if (typeof window === "undefined") {
        return;
      }
      this.connection = this.query_network();
    }
    query_network() {
      if (navigator.connection) {
        return navigator.connection.type;
      }
      const ua = navigator.userAgent;
      const regExp = /NetType\/(\S*)/;
      const matches = ua.match(regExp);
      if (!matches) {
        return "unknown";
      }
      return matches[1];
    }
  };
  var system = new CurSystem();

  // domains/timer/index.ts
  var TimerCore = class {
    constructor() {
      __publicField(this, "timer", null);
    }
    interval(fn, delay) {
      if (this.timer !== null) {
        return;
      }
      setInterval(() => {
        fn();
      }, delay);
    }
    clear() {
      if (this.timer === null) {
        return;
      }
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  // domains/video_player/index.ts
  var Events2 = /* @__PURE__ */ ((Events3) => {
    Events3[Events3["Connected"] = 0] = "Connected";
    Events3[Events3["Mounted"] = 1] = "Mounted";
    Events3[Events3["UrlChange"] = 2] = "UrlChange";
    Events3[Events3["CurrentTimeChange"] = 3] = "CurrentTimeChange";
    Events3[Events3["BeforeAdjustCurrentTime"] = 4] = "BeforeAdjustCurrentTime";
    Events3[Events3["TargetTimeChange"] = 5] = "TargetTimeChange";
    Events3[Events3["AfterAdjustCurrentTime"] = 6] = "AfterAdjustCurrentTime";
    Events3[Events3["ResolutionChange"] = 7] = "ResolutionChange";
    Events3[Events3["VolumeChange"] = 8] = "VolumeChange";
    Events3[Events3["RateChange"] = 9] = "RateChange";
    Events3[Events3["SizeChange"] = 10] = "SizeChange";
    Events3[Events3["Preload"] = 11] = "Preload";
    Events3[Events3["Ready"] = 12] = "Ready";
    Events3[Events3["Loaded"] = 13] = "Loaded";
    Events3[Events3["SourceLoaded"] = 14] = "SourceLoaded";
    Events3[Events3["CanPlay"] = 15] = "CanPlay";
    Events3[Events3["Play"] = 16] = "Play";
    Events3[Events3["Progress"] = 17] = "Progress";
    Events3[Events3["Pause"] = 18] = "Pause";
    Events3[Events3["BeforeLoadStart"] = 19] = "BeforeLoadStart";
    Events3[Events3["BeforeEnded"] = 20] = "BeforeEnded";
    Events3[Events3["CanSetCurrentTime"] = 21] = "CanSetCurrentTime";
    Events3[Events3["End"] = 22] = "End";
    Events3[Events3["Resize"] = 23] = "Resize";
    Events3[Events3["ExitFullscreen"] = 24] = "ExitFullscreen";
    Events3[Events3["Error"] = 25] = "Error";
    Events3[Events3["StateChange"] = 26] = "StateChange";
    return Events3;
  })(Events2 || {});
  var VideoPlayerCore = class extends BaseDomain {
    constructor(props) {
      super(props);
      /** 视频信息 */
      __publicField(this, "metadata", null);
      __publicField(this, "$app");
      __publicField(this, "_timer", null);
      __publicField(this, "_canPlay", false);
      __publicField(this, "_ended", false);
      __publicField(this, "_duration", 0);
      __publicField(this, "_currentTime", 0);
      __publicField(this, "_curVolume", 0.5);
      __publicField(this, "_curRate", 1);
      __publicField(this, "url", "");
      __publicField(this, "playing", false);
      __publicField(this, "paused", false);
      __publicField(this, "poster");
      __publicField(this, "subtitle", null);
      __publicField(this, "_mounted", false);
      __publicField(this, "_connected", false);
      /** 默认是不能播放的，只有用户交互后可以播放 */
      __publicField(this, "_target_current_time", 0);
      __publicField(this, "_subtitleVisible", false);
      __publicField(this, "prepareFullscreen", false);
      __publicField(this, "_progress", 0);
      __publicField(this, "virtualProgress", 0);
      __publicField(this, "errorMsg", "");
      __publicField(this, "_passPoint", false);
      __publicField(this, "_size", { width: 0, height: 0 });
      __publicField(this, "_abstractNode", null);
      /** 手动播放过 */
      __publicField(this, "hasPlayed", false);
      __publicField(this, "pendingRate", null);
      __publicField(this, "exitFullscreen", () => {
        const $video = this._abstractNode;
        if (!$video) {
          return;
        }
        $video.exitFullscreen();
      });
      __publicField(this, "_pending_url", "");
      __publicField(this, "updated", false);
      __publicField(this, "isFullscreen", false);
      __publicField(this, "startLoad", false);
      const { app, volume, rate } = props;
      if (volume) {
        this._curVolume = volume;
      }
      if (rate) {
        this._curRate = rate;
      }
      this.$app = app;
    }
    get currentTime() {
      return this._currentTime;
    }
    get state() {
      return {
        playing: this.playing,
        poster: this.poster,
        width: this._size.width,
        height: this._size.height,
        ready: this._canPlay,
        error: this.errorMsg,
        rate: this._curRate,
        volume: this._curVolume,
        currentTime: this._currentTime,
        subtitle: this.subtitle,
        prepareFullscreen: this.prepareFullscreen
      };
    }
    bindAbstractNode(node) {
      this._abstractNode = node;
      console.log("[DOMAIN]player/index - bindAbstractNode", this.unique_id, node, this.pendingRate);
      if (this._abstractNode) {
        if (this.pendingRate) {
          this.changeRate(this.pendingRate);
          this.pendingRate = null;
        }
        this._abstractNode.setVolume(this._curVolume);
      }
    }
    /** 开始播放 */
    play() {
      return __async(this, null, function* () {
        console.log("[DOMAIN]player/index - play", this._abstractNode, this.playing);
        if (this._abstractNode === null) {
          return;
        }
        if (this.playing) {
          return;
        }
        this._abstractNode.play();
        this.hasPlayed = true;
        this._abstractNode.setRate(this._curRate);
        this.playing = true;
        this.paused = false;
        this.emit(26 /* StateChange */, __spreadValues({}, this.state));
      });
    }
    /** 暂停播放 */
    pause() {
      return __async(this, null, function* () {
        if (this._abstractNode === null) {
          return;
        }
        this._abstractNode.pause();
        this.playing = false;
        this.paused = true;
        this.emit(26 /* StateChange */, __spreadValues({}, this.state));
      });
    }
    /** 改变音量 */
    changeVolume(v2) {
      if (this._abstractNode === null) {
        return;
      }
      this._curVolume = v2;
      this._abstractNode.setVolume(v2);
      this.emit(8 /* VolumeChange */, { volume: v2 });
    }
    changeRate(v2) {
      if (this._abstractNode === null) {
        this.pendingRate = v2;
        return;
      }
      this._curRate = v2;
      console.log("[DOMAIN]player/index - changeRate", v2);
      this._abstractNode.setRate(v2);
      this.emit(9 /* RateChange */, { rate: v2 });
    }
    showAirplay() {
      if (this._abstractNode === null) {
        return;
      }
      this._abstractNode.showAirplay();
    }
    pictureInPicture() {
      if (this._abstractNode === null) {
        return;
      }
      this._abstractNode.pictureInPicture();
    }
    toggleSubtitle() {
      this._subtitleVisible = !this._subtitleVisible;
    }
    setPoster(url) {
      if (url === null) {
        return;
      }
      this.poster = url;
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    /** 改变当前进度 */
    setCurrentTime(currentTime = 0) {
      console.log("[DOMAIN]player/index - setCurrentTime", this._abstractNode, currentTime);
      if (this._abstractNode === null) {
        return;
      }
      this._currentTime = currentTime || 0;
      this._abstractNode.setCurrentTime(currentTime || 0);
    }
    speedUp() {
      let target = this._currentTime + 10;
      if (this._duration && target >= this._duration) {
        target = this._duration;
      }
      this.setCurrentTime(target);
    }
    rewind() {
      let target = this._currentTime - 10;
      if (target <= 0) {
        target = 0;
      }
      this.setCurrentTime(target);
    }
    setSize(size) {
      if (this._size.width !== 0 && this._size.width === size.width && this._size.height !== 0 && this._size.height === size.height) {
        return;
      }
      const app = this.$app;
      const { width, height } = size;
      const h2 = Math.ceil(height / width * app.screen.width);
      console.log("[DOMAIN]player/index - setSize", app.screen.width, h2);
      if (Number.isNaN(h2)) {
        return;
      }
      this._size = {
        width: app.screen.width,
        height: h2 > app.screen.height ? app.screen.height : h2
      };
      this.emit(10 /* SizeChange */, __spreadValues({}, this._size));
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    setResolution(values) {
      this.emit(7 /* ResolutionChange */, values);
    }
    clearSubtitle() {
      this.subtitle = null;
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    showSubtitle(subtitle) {
      this.subtitle = subtitle;
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      setTimeout(() => {
        this._subtitleVisible = true;
        $video.showSubtitle();
      }, 800);
    }
    toggleSubtitleVisible() {
      console.log("[DOMAIN]player/index - toggleSubtitleVisible", this._abstractNode, this._subtitleVisible);
      if (!this._abstractNode) {
        return;
      }
      if (this._subtitleVisible) {
        this._subtitleVisible = false;
        this._abstractNode.hideSubtitle();
        return;
      }
      this._subtitleVisible = true;
      this._abstractNode.showSubtitle();
    }
    requestFullScreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      if (this.$app.env.android) {
        this.play();
        $video.requestFullscreen();
        return;
      }
      this.pause();
      $video.enableFullscreen();
      this.play();
    }
    loadSource(video) {
      this.metadata = video;
      this._canPlay = false;
      this.errorMsg = "";
      this.emit(2 /* UrlChange */, video);
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    preloadSource(url) {
      this.emit(11 /* Preload */, { url });
    }
    canPlayType(type) {
      if (!this._abstractNode) {
        return false;
      }
      return this._abstractNode.canPlayType(type);
    }
    load(url) {
      console.log("[DOMAIN]player - load", this.unique_id, url, this._abstractNode);
      this._canPlay = false;
      if (!this._abstractNode) {
        this._pending_url = url;
        return;
      }
      if (url && url === this.url) {
        return;
      }
      this.url = url;
      this._abstractNode.load(url);
    }
    startAdjustCurrentTime() {
      this.emit(4 /* BeforeAdjustCurrentTime */);
    }
    /** 0.x */
    adjustProgressManually(percent) {
      const targetTime = percent * this._duration;
      this.virtualProgress = percent;
      this.emit(5 /* TargetTimeChange */, targetTime);
    }
    adjustCurrentTime(targetTime) {
      if (this.hasPlayed && !this.playing) {
        this.play();
      }
      let time = targetTime;
      if (time < 0) {
        time = 0;
      }
      if (time > this._duration) {
        time = this._duration;
      }
      this.setCurrentTime(time);
      this.emit(6 /* AfterAdjustCurrentTime */, { time });
    }
    screenshot() {
      return __async(this, null, function* () {
        return Result.Err("\u8BF7\u5B9E\u73B0 screenshot \u65B9\u6CD5");
      });
    }
    node() {
      if (!this._abstractNode) {
        return null;
      }
      return this._abstractNode.$node;
    }
    handleTimeUpdate({ currentTime, duration }) {
      if (this.startLoad && !this.updated) {
        this.emit(21 /* CanSetCurrentTime */);
        this.updated = true;
      }
      if (this._currentTime === currentTime) {
        return;
      }
      this._currentTime = currentTime;
      if (typeof duration === "number" && !Number.isNaN(duration)) {
        this._duration = duration;
      }
      const progress = Math.floor(currentTime / this._duration * 100);
      this._progress = progress;
      this.emit(17 /* Progress */, {
        currentTime: this._currentTime,
        duration: this._duration,
        progress: this._progress
      });
      if (currentTime + 10 >= this._duration) {
        if (this._passPoint) {
          return;
        }
        this.emit(20 /* BeforeEnded */);
        this._passPoint = true;
        return;
      }
      this._passPoint = false;
    }
    enableFullscreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      this.prepareFullscreen = true;
      $video.enableFullscreen();
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    disableFullscreen() {
      const $video = this._abstractNode;
      if (!$video) {
        return;
      }
      this.prepareFullscreen = false;
      $video.disableFullscreen();
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    setMounted() {
      console.log("[DOMAIN]player/index - setMounted - before", this._mounted, this._pending_url);
      this._mounted = true;
      if (this._pending_url && this._abstractNode) {
        const u = this._pending_url;
        this._pending_url = "";
        this.load(u);
      }
      this.emit(1 /* Mounted */);
      this.emit(12 /* Ready */);
    }
    setConnected() {
      console.log("[DOMAIN]player/index - setConnected - before", this._mounted, this._pending_url);
      this._mounted = true;
      if (this._pending_url && this._abstractNode) {
        const u = this._pending_url;
        this._pending_url = "";
        this.load(u);
      }
      this.emit(0 /* Connected */);
    }
    setInvalid(msg) {
      this.errorMsg = msg;
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    /** ------ 平台 video 触发的事件 start -------- */
    handleFullscreenChange(isFullscreen) {
      this.isFullscreen = isFullscreen;
      if (isFullscreen === false) {
        this.emit(24 /* ExitFullscreen */);
      }
    }
    handlePause({ currentTime, duration }) {
      this.emit(18 /* Pause */, { currentTime, duration });
    }
    handleVolumeChange(cur_volume) {
      this._curVolume = cur_volume;
      this.emit(8 /* VolumeChange */, { volume: cur_volume });
    }
    handleResize(size) {
    }
    handleStartLoad() {
      this.startLoad = true;
    }
    /** 视频播放结束 */
    handleEnded() {
      this.playing = false;
      this._ended = true;
      this.emit(22 /* End */, {
        current_time: this._currentTime,
        duration: this._duration
      });
    }
    handleLoadedmetadata(values) {
      const { width, height } = values;
      this.setSize({ width, height });
      this._duration = values.duration;
      this.emit(14 /* SourceLoaded */);
    }
    handleLoad() {
      this.emit(13 /* Loaded */);
    }
    handleCanPlay() {
      if (this._canPlay) {
        return;
      }
      this._canPlay = true;
      this.emit(15 /* CanPlay */);
      this.emit(26 /* StateChange */, __spreadValues({}, this.state));
    }
    handlePlay() {
    }
    handlePlaying() {
      this.hasPlayed = true;
    }
    handleError(msg) {
      this.emit(25 /* Error */, new Error(msg));
    }
    onReady(handler4) {
      return this.on(12 /* Ready */, handler4);
    }
    onBeforeStartLoad(handler4) {
      return this.on(19 /* BeforeLoadStart */, handler4);
    }
    onLoaded(handler4) {
      return this.on(13 /* Loaded */, handler4);
    }
    onProgress(handler4) {
      return this.on(17 /* Progress */, handler4);
    }
    onCanPlay(handler4) {
      return this.on(15 /* CanPlay */, handler4);
    }
    onUrlChange(handler4) {
      return this.on(2 /* UrlChange */, handler4);
    }
    onExitFullscreen(handler4) {
      return this.on(24 /* ExitFullscreen */, handler4);
    }
    onPreload(handler4) {
      return this.on(11 /* Preload */, handler4);
    }
    onBeforeEnded(handler4) {
      return this.on(20 /* BeforeEnded */, handler4);
    }
    onSizeChange(handler4) {
      return this.on(10 /* SizeChange */, handler4);
    }
    onVolumeChange(handler4) {
      return this.on(8 /* VolumeChange */, handler4);
    }
    onRateChange(handler4) {
      return this.on(9 /* RateChange */, handler4);
    }
    onPause(handler4) {
      return this.on(18 /* Pause */, handler4);
    }
    onResolutionChange(handler4) {
      return this.on(7 /* ResolutionChange */, handler4);
    }
    onCanSetCurrentTime(handler4) {
      return this.on(21 /* CanSetCurrentTime */, handler4);
    }
    beforeAdjustCurrentTime(handler4) {
      return this.on(4 /* BeforeAdjustCurrentTime */, handler4);
    }
    afterAdjustCurrentTime(handler4) {
      return this.on(6 /* AfterAdjustCurrentTime */, handler4);
    }
    onPlay(handler4) {
      return this.on(16 /* Play */, handler4);
    }
    onSourceLoaded(handler4) {
      return this.on(14 /* SourceLoaded */, handler4);
    }
    onTargetTimeChange(handler4) {
      return this.on(5 /* TargetTimeChange */, handler4);
    }
    onCurrentTimeChange(handler4) {
      return this.on(3 /* CurrentTimeChange */, handler4);
    }
    onEnd(handler4) {
      return this.on(22 /* End */, handler4);
    }
    onError(handler4) {
      return this.on(25 /* Error */, handler4);
    }
    onStateChange(handler4) {
      return this.on(26 /* StateChange */, handler4);
    }
    onMounted(handler4) {
      return this.on(1 /* Mounted */, handler4);
    }
    onConnected(handler4) {
      return this.on(0 /* Connected */, handler4);
    }
  };
  __publicField(VideoPlayerCore, "Events", Events2);

  // domains/index.ts
  var Timeless = {};
})();
