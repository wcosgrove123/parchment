(() => {
  // node_modules/d3-array/src/ascending.js
  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-array/src/descending.js
  function descending(a, b) {
    return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  // node_modules/d3-array/src/bisector.js
  function bisector(f) {
    let compare1, compare2, delta;
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x) => ascending(f(d), x);
      delta = (d, x) => f(d) - x;
    } else {
      compare1 = f === ascending || f === descending ? f : zero;
      compare2 = f;
      delta = f;
    }
    function left(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0) return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function right(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0) return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) <= 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function center(a, x, lo = 0, hi = a.length) {
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }
    return { left, center, right };
  }
  function zero() {
    return 0;
  }

  // node_modules/d3-array/src/number.js
  function number(x) {
    return x === null ? NaN : +x;
  }

  // node_modules/d3-array/src/bisect.js
  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;
  var bisectLeft = ascendingBisect.left;
  var bisectCenter = bisector(number).center;
  var bisect_default = bisectRight;

  // node_modules/d3-array/src/fsum.js
  var Adder = class {
    constructor() {
      this._partials = new Float64Array(32);
      this._n = 0;
    }
    add(x) {
      const p = this._partials;
      let i = 0;
      for (let j = 0; j < this._n && j < 32; j++) {
        const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
        if (lo) p[i++] = lo;
        x = hi;
      }
      p[i] = x;
      this._n = i + 1;
      return this;
    }
    valueOf() {
      const p = this._partials;
      let n = this._n, x, y, lo, hi = 0;
      if (n > 0) {
        hi = p[--n];
        while (n > 0) {
          x = hi;
          y = p[--n];
          hi = x + y;
          lo = y - (hi - x);
          if (lo) break;
        }
        if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
          y = lo * 2;
          x = hi + y;
          if (y == x - hi) hi = x;
        }
      }
      return hi;
    }
  };

  // node_modules/d3-array/src/ticks.js
  var e10 = Math.sqrt(50);
  var e5 = Math.sqrt(10);
  var e2 = Math.sqrt(2);
  function tickSpec(start2, stop, count) {
    const step = (stop - start2) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start2 * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start2) ++i1;
      if (i2 / inc > stop) --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start2 / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start2) ++i1;
      if (i2 * inc > stop) --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start2, stop, count * 2);
    return [i1, i2, inc];
  }
  function ticks(start2, stop, count) {
    stop = +stop, start2 = +start2, count = +count;
    if (!(count > 0)) return [];
    if (start2 === stop) return [start2];
    const reverse = stop < start2, [i1, i2, inc] = reverse ? tickSpec(stop, start2, count) : tickSpec(start2, stop, count);
    if (!(i2 >= i1)) return [];
    const n = i2 - i1 + 1, ticks2 = new Array(n);
    if (reverse) {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) / -inc;
      else for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) * inc;
    } else {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) / -inc;
      else for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) * inc;
    }
    return ticks2;
  }
  function tickIncrement(start2, stop, count) {
    stop = +stop, start2 = +start2, count = +count;
    return tickSpec(start2, stop, count)[2];
  }
  function tickStep(start2, stop, count) {
    stop = +stop, start2 = +start2, count = +count;
    const reverse = stop < start2, inc = reverse ? tickIncrement(stop, start2, count) : tickIncrement(start2, stop, count);
    return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
  }

  // node_modules/d3-array/src/merge.js
  function* flatten(arrays) {
    for (const array2 of arrays) {
      yield* array2;
    }
  }
  function merge(arrays) {
    return Array.from(flatten(arrays));
  }

  // node_modules/d3-array/src/range.js
  function range(start2, stop, step) {
    start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
    var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
    while (++i < n) {
      range2[i] = start2 + i * step;
    }
    return range2;
  }

  // node_modules/d3-dispatch/src/dispatch.js
  var noop = { value: () => {
  } };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return { type: t, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy2 = {}, _ = this._;
      for (var t in _) copy2[t] = _[t].slice();
      return new Dispatch(copy2);
    },
    call: function(type2, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
      for (t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type2, that, args) {
      if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
      for (var t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };
  function get(type2, name) {
    for (var i = 0, n = type2.length, c; i < n; ++i) {
      if ((c = type2[i]).name === name) {
        return c.value;
      }
    }
  }
  function set(type2, name, callback) {
    for (var i = 0, n = type2.length; i < n; ++i) {
      if (type2[i].name === name) {
        type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
        break;
      }
    }
    if (callback != null) type2.push({ name, value: callback });
    return type2;
  }
  var dispatch_default = dispatch;

  // node_modules/d3-selection/src/namespaces.js
  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces_default = {
    svg: "http://www.w3.org/2000/svg",
    xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  // node_modules/d3-selection/src/namespace.js
  function namespace_default(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
  }

  // node_modules/d3-selection/src/creator.js
  function creatorInherit(name) {
    return function() {
      var document2 = this.ownerDocument, uri = this.namespaceURI;
      return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator_default(name) {
    var fullname = namespace_default(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  // node_modules/d3-selection/src/selector.js
  function none() {
  }
  function selector_default(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  // node_modules/d3-selection/src/selection/select.js
  function select_default(select) {
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/array.js
  function array(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  // node_modules/d3-selection/src/selectorAll.js
  function empty() {
    return [];
  }
  function selectorAll_default(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectAll.js
  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }
  function selectAll_default(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  // node_modules/d3-selection/src/matcher.js
  function matcher_default(selector) {
    return function() {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectChild.js
  var find = Array.prototype.find;
  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selectChild_default(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/selectChildren.js
  var filter = Array.prototype.filter;
  function children() {
    return Array.from(this.children);
  }
  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }
  function selectChildren_default(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/filter.js
  function filter_default(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/selection/sparse.js
  function sparse_default(update) {
    return new Array(update.length);
  }

  // node_modules/d3-selection/src/selection/enter.js
  function enter_default() {
    return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
  }
  function EnterNode(parent, datum2) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum2;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  // node_modules/d3-selection/src/constant.js
  function constant_default(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-selection/src/selection/data.js
  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0, node, groupLength = group.length, dataLength = data.length;
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }
  function bindKey(parent, group, enter, update, exit, data, key) {
    var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function data_default(value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
    if (typeof value !== "function") value = constant_default(value);
    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }
  function arraylike(data) {
    return typeof data === "object" && "length" in data ? data : Array.from(data);
  }

  // node_modules/d3-selection/src/selection/exit.js
  function exit_default() {
    return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
  }

  // node_modules/d3-selection/src/selection/join.js
  function join_default(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter) enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit.remove();
    else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  // node_modules/d3-selection/src/selection/merge.js
  function merge_default(context) {
    var selection2 = context.selection ? context.selection() : context;
    for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge2[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  // node_modules/d3-selection/src/selection/order.js
  function order_default() {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/sort.js
  function sort_default(compare) {
    if (!compare) compare = ascending2;
    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }
    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending2(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-selection/src/selection/call.js
  function call_default() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  // node_modules/d3-selection/src/selection/nodes.js
  function nodes_default() {
    return Array.from(this);
  }

  // node_modules/d3-selection/src/selection/node.js
  function node_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  }

  // node_modules/d3-selection/src/selection/size.js
  function size_default() {
    let size = 0;
    for (const node of this) ++size;
    return size;
  }

  // node_modules/d3-selection/src/selection/empty.js
  function empty_default() {
    return !this.node();
  }

  // node_modules/d3-selection/src/selection/each.js
  function each_default(callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/attr.js
  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function attr_default(name, value) {
    var fullname = namespace_default(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  // node_modules/d3-selection/src/window.js
  function window_default(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
  }

  // node_modules/d3-selection/src/selection/style.js
  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }
  function style_default(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  // node_modules/d3-selection/src/selection/property.js
  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }
  function property_default(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  // node_modules/d3-selection/src/selection/classed.js
  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }
  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function classed_default(name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  // node_modules/d3-selection/src/selection/text.js
  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function text_default(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  // node_modules/d3-selection/src/selection/html.js
  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function html_default(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  // node_modules/d3-selection/src/selection/raise.js
  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }
  function raise_default() {
    return this.each(raise);
  }

  // node_modules/d3-selection/src/selection/lower.js
  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function lower_default() {
    return this.each(lower);
  }

  // node_modules/d3-selection/src/selection/append.js
  function append_default(name) {
    var create2 = typeof name === "function" ? name : creator_default(name);
    return this.select(function() {
      return this.appendChild(create2.apply(this, arguments));
    });
  }

  // node_modules/d3-selection/src/selection/insert.js
  function constantNull() {
    return null;
  }
  function insert_default(name, before) {
    var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    return this.select(function() {
      return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  // node_modules/d3-selection/src/selection/remove.js
  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  function remove_default() {
    return this.each(remove);
  }

  // node_modules/d3-selection/src/selection/clone.js
  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function clone_default(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  // node_modules/d3-selection/src/selection/datum.js
  function datum_default(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  // node_modules/d3-selection/src/selection/on.js
  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames2(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return { type: t, name };
    });
  }
  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = { type: typename.type, name: typename.name, value, listener, options };
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }
  function on_default(typename, value, options) {
    var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  // node_modules/d3-selection/src/selection/dispatch.js
  function dispatchEvent(node, type2, params2) {
    var window2 = window_default(node), event = window2.CustomEvent;
    if (typeof event === "function") {
      event = new event(type2, params2);
    } else {
      event = window2.document.createEvent("Event");
      if (params2) event.initEvent(type2, params2.bubbles, params2.cancelable), event.detail = params2.detail;
      else event.initEvent(type2, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type2, params2) {
    return function() {
      return dispatchEvent(this, type2, params2);
    };
  }
  function dispatchFunction(type2, params2) {
    return function() {
      return dispatchEvent(this, type2, params2.apply(this, arguments));
    };
  }
  function dispatch_default2(type2, params2) {
    return this.each((typeof params2 === "function" ? dispatchFunction : dispatchConstant)(type2, params2));
  }

  // node_modules/d3-selection/src/selection/iterator.js
  function* iterator_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  // node_modules/d3-selection/src/selection/index.js
  var root = [null];
  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }
  function selection() {
    return new Selection([[document.documentElement]], root);
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: select_default,
    selectAll: selectAll_default,
    selectChild: selectChild_default,
    selectChildren: selectChildren_default,
    filter: filter_default,
    data: data_default,
    enter: enter_default,
    exit: exit_default,
    join: join_default,
    merge: merge_default,
    selection: selection_selection,
    order: order_default,
    sort: sort_default,
    call: call_default,
    nodes: nodes_default,
    node: node_default,
    size: size_default,
    empty: empty_default,
    each: each_default,
    attr: attr_default,
    style: style_default,
    property: property_default,
    classed: classed_default,
    text: text_default,
    html: html_default,
    raise: raise_default,
    lower: lower_default,
    append: append_default,
    insert: insert_default,
    remove: remove_default,
    clone: clone_default,
    datum: datum_default,
    on: on_default,
    dispatch: dispatch_default2,
    [Symbol.iterator]: iterator_default
  };
  var selection_default = selection;

  // node_modules/d3-selection/src/select.js
  function select_default2(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }

  // node_modules/d3-selection/src/selectAll.js
  function selectAll_default2(selector) {
    return typeof selector === "string" ? new Selection([document.querySelectorAll(selector)], [document.documentElement]) : new Selection([array(selector)], root);
  }

  // node_modules/d3-color/src/define.js
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format2) {
    var m, l;
    format2 = (format2 + "").trim().toLowerCase();
    return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
    if (s) {
      if (r === max2) h = (g - b) / s + (g < b) * 6;
      else if (g === max2) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // node_modules/d3-interpolate/src/basis.js
  function basis(t1, v0, v1, v2, v3) {
    var t2 = t1 * t1, t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  function basisClosed_default(values) {
    var n = values.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/constant.js
  var constant_default2 = (x) => () => x;

  // node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = (function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb2(start2, end) {
      var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
      return function(t) {
        start2.r = r(t);
        start2.g = g(t);
        start2.b = b(t);
        start2.opacity = opacity(t);
        return start2 + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  })(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r[i] = color2.r || 0;
        g[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r = spline(r);
      g = spline(g);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r(t);
        color2.g = g(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/numberArray.js
  function numberArray_default(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }
  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  // node_modules/d3-interpolate/src/array.js
  function genericArray(a, b) {
    var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
    for (i = 0; i < na; ++i) x[i] = value_default(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  // node_modules/d3-interpolate/src/date.js
  function date_default(a, b) {
    var d = /* @__PURE__ */ new Date();
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  // node_modules/d3-interpolate/src/number.js
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/object.js
  function object_default(a, b) {
    var i = {}, c = {}, k;
    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};
    for (k in b) {
      if (k in a) {
        i[k] = value_default(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero2(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/value.js
  function value_default(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant_default2(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
  }

  // node_modules/d3-interpolate/src/round.js
  function round_default(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  // node_modules/d3-interpolate/src/transform/decompose.js
  var degrees = 180 / Math.PI;
  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };
  function decompose_default(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX,
      scaleY
    };
  }

  // node_modules/d3-interpolate/src/transform/parse.js
  var svgNode;
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
  }
  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  // node_modules/d3-interpolate/src/transform/index.js
  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }
    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }
    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360;
        else if (b - a > 180) a += 360;
        q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }
    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }
    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }
    return function(a, b) {
      var s = [], q = [];
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null;
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }
  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  // node_modules/d3-timer/src/timer.js
  var frame = 0;
  var timeout = 0;
  var interval = 0;
  var pokeDelay = 1e3;
  var taskHead;
  var taskTail;
  var clockLast = 0;
  var clockNow = 0;
  var clockSkew = 0;
  var clock = typeof performance === "object" && performance.now ? performance : Date;
  var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time) {
    var t = new Timer();
    t.restart(callback, delay, time);
    return t;
  }
  function timerFlush() {
    now();
    ++frame;
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
      t = t._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now2 = clock.now(), delay = now2 - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
  }
  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }
  function sleep(time) {
    if (frame) return;
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow;
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  // node_modules/d3-timer/src/timeout.js
  function timeout_default(callback, delay, time) {
    var t = new Timer();
    delay = delay == null ? 0 : +delay;
    t.restart((elapsed) => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  // node_modules/d3-transition/src/transition/schedule.js
  var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;
  function schedule_default(node, name, id2, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id2 in schedules) return;
    create(node, id2, {
      name,
      index,
      // For context during callback.
      group,
      // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }
  function init(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }
  function set2(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }
  function get2(node, id2) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
    return schedule;
  }
  function create(node, id2, self) {
    var schedules = node.__transition, tween;
    schedules[id2] = self;
    self.timer = timer(schedule, 0, self.time);
    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start2, self.delay, self.time);
      if (self.delay <= elapsed) start2(elapsed - self.delay);
    }
    function start2(elapsed) {
      var i, j, n, o;
      if (self.state !== SCHEDULED) return stop();
      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;
        if (o.state === STARTED) return timeout_default(start2);
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } else if (+i < id2) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }
      timeout_default(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return;
      self.state = STARTED;
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }
    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
      while (++i < n) {
        tween[i].call(node, t);
      }
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }
    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id2];
      for (var i in schedules) return;
      delete node.__transition;
    }
  }

  // node_modules/d3-transition/src/interrupt.js
  function interrupt_default(node, name) {
    var schedules = node.__transition, schedule, active, empty2 = true, i;
    if (!schedules) return;
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty2 = false;
        continue;
      }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }
    if (empty2) delete node.__transition;
  }

  // node_modules/d3-transition/src/selection/interrupt.js
  function interrupt_default2(name) {
    return this.each(function() {
      interrupt_default(this, name);
    });
  }

  // node_modules/d3-transition/src/transition/tween.js
  function tweenRemove(id2, name) {
    var tween0, tween1;
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }
      schedule.tween = tween1;
    };
  }
  function tweenFunction(id2, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error();
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }
      schedule.tween = tween1;
    };
  }
  function tween_default(name, value) {
    var id2 = this._id;
    name += "";
    if (arguments.length < 2) {
      var tween = get2(this.node(), id2).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }
    return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
  }
  function tweenValue(transition2, name, value) {
    var id2 = transition2._id;
    transition2.each(function() {
      var schedule = set2(this, id2);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function(node) {
      return get2(node, id2).value[name];
    };
  }

  // node_modules/d3-transition/src/transition/interpolate.js
  function interpolate_default(a, b) {
    var c;
    return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
  }

  // node_modules/d3-transition/src/transition/attr.js
  function attrRemove2(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS2(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrConstantNS2(fullname, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attrFunctionNS2(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attr_default2(name, value) {
    var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
  }

  // node_modules/d3-transition/src/transition/attrTween.js
  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }
  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }
  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween_default(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    var fullname = namespace_default(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  // node_modules/d3-transition/src/transition/delay.js
  function delayFunction(id2, value) {
    return function() {
      init(this, id2).delay = +value.apply(this, arguments);
    };
  }
  function delayConstant(id2, value) {
    return value = +value, function() {
      init(this, id2).delay = value;
    };
  }
  function delay_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
  }

  // node_modules/d3-transition/src/transition/duration.js
  function durationFunction(id2, value) {
    return function() {
      set2(this, id2).duration = +value.apply(this, arguments);
    };
  }
  function durationConstant(id2, value) {
    return value = +value, function() {
      set2(this, id2).duration = value;
    };
  }
  function duration_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
  }

  // node_modules/d3-transition/src/transition/ease.js
  function easeConstant(id2, value) {
    if (typeof value !== "function") throw new Error();
    return function() {
      set2(this, id2).ease = value;
    };
  }
  function ease_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
  }

  // node_modules/d3-transition/src/transition/easeVarying.js
  function easeVarying(id2, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error();
      set2(this, id2).ease = v;
    };
  }
  function easeVarying_default(value) {
    if (typeof value !== "function") throw new Error();
    return this.each(easeVarying(this._id, value));
  }

  // node_modules/d3-transition/src/transition/filter.js
  function filter_default2(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/merge.js
  function merge_default2(transition2) {
    if (transition2._id !== this._id) throw new Error();
    for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge2[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Transition(merges, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/on.js
  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }
  function onFunction(id2, name, listener) {
    var on0, on1, sit = start(name) ? init : set2;
    return function() {
      var schedule = sit(this, id2), on = schedule.on;
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }
  function on_default2(name, listener) {
    var id2 = this._id;
    return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
  }

  // node_modules/d3-transition/src/transition/remove.js
  function removeFunction(id2) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id2) return;
      if (parent) parent.removeChild(this);
    };
  }
  function remove_default2() {
    return this.on("end.remove", removeFunction(this._id));
  }

  // node_modules/d3-transition/src/transition/select.js
  function select_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
        }
      }
    }
    return new Transition(subgroups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selectAll.js
  function selectAll_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
            if (child = children2[k]) {
              schedule_default(child, name, id2, k, children2, inherit2);
            }
          }
          subgroups.push(children2);
          parents.push(node);
        }
      }
    }
    return new Transition(subgroups, parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selection.js
  var Selection2 = selection_default.prototype.constructor;
  function selection_default2() {
    return new Selection2(this._groups, this._parents);
  }

  // node_modules/d3-transition/src/transition/style.js
  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }
  function styleRemove2(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function styleFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function styleMaybeRemove(id2, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
    return function() {
      var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }
  function style_default2(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
  }

  // node_modules/d3-transition/src/transition/styleTween.js
  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }
  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }
  function styleTween_default(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  // node_modules/d3-transition/src/transition/text.js
  function textConstant2(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction2(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }
  function text_default2(value) {
    return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
  }

  // node_modules/d3-transition/src/transition/textTween.js
  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }
  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function textTween_default(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, textTween(value));
  }

  // node_modules/d3-transition/src/transition/transition.js
  function transition_default() {
    var name = this._name, id0 = this._id, id1 = newId();
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit2 = get2(node, id0);
          schedule_default(node, name, id1, i, group, {
            time: inherit2.time + inherit2.delay + inherit2.duration,
            delay: 0,
            duration: inherit2.duration,
            ease: inherit2.ease
          });
        }
      }
    }
    return new Transition(groups, this._parents, name, id1);
  }

  // node_modules/d3-transition/src/transition/end.js
  function end_default() {
    var on0, on1, that = this, id2 = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = { value: reject }, end = { value: function() {
        if (--size === 0) resolve();
      } };
      that.each(function() {
        var schedule = set2(this, id2), on = schedule.on;
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }
        schedule.on = on1;
      });
      if (size === 0) resolve();
    });
  }

  // node_modules/d3-transition/src/transition/index.js
  var id = 0;
  function Transition(groups, parents, name, id2) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id2;
  }
  function transition(name) {
    return selection_default().transition(name);
  }
  function newId() {
    return ++id;
  }
  var selection_prototype = selection_default.prototype;
  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: select_default3,
    selectAll: selectAll_default3,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: filter_default2,
    merge: merge_default2,
    selection: selection_default2,
    transition: transition_default,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: on_default2,
    attr: attr_default2,
    attrTween: attrTween_default,
    style: style_default2,
    styleTween: styleTween_default,
    text: text_default2,
    textTween: textTween_default,
    remove: remove_default2,
    tween: tween_default,
    delay: delay_default,
    duration: duration_default,
    ease: ease_default,
    easeVarying: easeVarying_default,
    end: end_default,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  // node_modules/d3-ease/src/cubic.js
  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  // node_modules/d3-transition/src/selection/transition.js
  var defaultTiming = {
    time: null,
    // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };
  function inherit(node, id2) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id2])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id2} not found`);
      }
    }
    return timing;
  }
  function transition_default2(name) {
    var id2, timing;
    if (name instanceof Transition) {
      id2 = name._id, name = name._name;
    } else {
      id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
        }
      }
    }
    return new Transition(groups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/selection/index.js
  selection_default.prototype.interrupt = interrupt_default2;
  selection_default.prototype.transition = transition_default2;

  // node_modules/d3-brush/src/brush.js
  var { abs, max, min } = Math;
  function number1(e) {
    return [+e[0], +e[1]];
  }
  function number2(e) {
    return [number1(e[0]), number1(e[1])];
  }
  var X = {
    name: "x",
    handles: ["w", "e"].map(type),
    input: function(x, e) {
      return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]];
    },
    output: function(xy) {
      return xy && [xy[0][0], xy[1][0]];
    }
  };
  var Y = {
    name: "y",
    handles: ["n", "s"].map(type),
    input: function(y, e) {
      return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]];
    },
    output: function(xy) {
      return xy && [xy[0][1], xy[1][1]];
    }
  };
  var XY = {
    name: "xy",
    handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
    input: function(xy) {
      return xy == null ? null : number2(xy);
    },
    output: function(xy) {
      return xy;
    }
  };
  function type(t) {
    return { type: t };
  }

  // node_modules/d3-format/src/formatDecimal.js
  function formatDecimal_default(x) {
    return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
  }
  function formatDecimalParts(x, p) {
    if (!isFinite(x) || x === 0) return null;
    var i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e"), coefficient = x.slice(0, i);
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  // node_modules/d3-format/src/exponent.js
  function exponent_default(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  // node_modules/d3-format/src/formatGroup.js
  function formatGroup_default(grouping, thousands) {
    return function(value, width) {
      var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }
      return t.reverse().join(thousands);
    };
  }

  // node_modules/d3-format/src/formatNumerals.js
  function formatNumerals_default(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // node_modules/d3-format/src/formatSpecifier.js
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }
  formatSpecifier.prototype = FormatSpecifier.prototype;
  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
    this.align = specifier.align === void 0 ? ">" : specifier.align + "";
    this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === void 0 ? void 0 : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === void 0 ? "" : specifier.type + "";
  }
  FormatSpecifier.prototype.toString = function() {
    return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
  };

  // node_modules/d3-format/src/formatTrim.js
  function formatTrim_default(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0) i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i]) break out;
          if (i0 > 0) i0 = 0;
          break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  // node_modules/d3-format/src/formatPrefixAuto.js
  var prefixExponent;
  function formatPrefixAuto_default(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return prefixExponent = void 0, x.toPrecision(p);
    var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
    return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
  }

  // node_modules/d3-format/src/formatRounded.js
  function formatRounded_default(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0], exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  // node_modules/d3-format/src/formatTypes.js
  var formatTypes_default = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": (x) => Math.round(x).toString(2),
    "c": (x) => x + "",
    "d": formatDecimal_default,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": (x) => Math.round(x).toString(8),
    "p": (x, p) => formatRounded_default(x * 100, p),
    "r": formatRounded_default,
    "s": formatPrefixAuto_default,
    "X": (x) => Math.round(x).toString(16).toUpperCase(),
    "x": (x) => Math.round(x).toString(16)
  };

  // node_modules/d3-format/src/identity.js
  function identity_default(x) {
    return x;
  }

  // node_modules/d3-format/src/locale.js
  var map = Array.prototype.map;
  var prefixes = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  function locale_default(locale2) {
    var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "\u2212" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
    function newFormat(specifier, options) {
      specifier = formatSpecifier(specifier);
      var fill = specifier.fill, align = specifier.align, sign2 = specifier.sign, symbol = specifier.symbol, zero3 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type2 = specifier.type;
      if (type2 === "n") comma = true, type2 = "g";
      else if (!formatTypes_default[type2]) precision === void 0 && (precision = 12), trim = true, type2 = "g";
      if (zero3 || fill === "0" && align === "=") zero3 = true, fill = "0", align = "=";
      var prefix = (options && options.prefix !== void 0 ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type2) ? "0" + type2.toLowerCase() : ""), suffix = (symbol === "$" ? currencySuffix : /[%p]/.test(type2) ? percent : "") + (options && options.suffix !== void 0 ? options.suffix : "");
      var formatType = formatTypes_default[type2], maybeSuffix = /[defgprs%]/.test(type2);
      precision = precision === void 0 ? 6 : /[gprs]/.test(type2) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
      function format2(value) {
        var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
        if (type2 === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;
          var valueNegative = value < 0 || 1 / value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
          if (trim) value = formatTrim_default(value);
          if (valueNegative && +value === 0 && sign2 !== "+") valueNegative = false;
          valuePrefix = (valueNegative ? sign2 === "(" ? sign2 : minus : sign2 === "-" || sign2 === "(" ? "" : sign2) + valuePrefix;
          valueSuffix = (type2 === "s" && !isNaN(value) && prefixExponent !== void 0 ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign2 === "(" ? ")" : "");
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }
        if (comma && !zero3) value = group(value, Infinity);
        var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
        if (comma && zero3) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
            break;
          default:
            value = padding + valuePrefix + value + valueSuffix;
            break;
        }
        return numerals(value);
      }
      format2.toString = function() {
        return specifier + "";
      };
      return format2;
    }
    function formatPrefix2(specifier, value) {
      var e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e / 3] });
      return function(value2) {
        return f(k * value2);
      };
    }
    return {
      format: newFormat,
      formatPrefix: formatPrefix2
    };
  }

  // node_modules/d3-format/src/defaultLocale.js
  var locale;
  var format;
  var formatPrefix;
  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });
  function defaultLocale(definition) {
    locale = locale_default(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  // node_modules/d3-format/src/precisionFixed.js
  function precisionFixed_default(step) {
    return Math.max(0, -exponent_default(Math.abs(step)));
  }

  // node_modules/d3-format/src/precisionPrefix.js
  function precisionPrefix_default(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
  }

  // node_modules/d3-format/src/precisionRound.js
  function precisionRound_default(step, max2) {
    step = Math.abs(step), max2 = Math.abs(max2) - step;
    return Math.max(0, exponent_default(max2) - exponent_default(step)) + 1;
  }

  // node_modules/d3-geo/src/math.js
  var epsilon = 1e-6;
  var epsilon2 = 1e-12;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var quarterPi = pi / 4;
  var tau = pi * 2;
  var degrees2 = 180 / pi;
  var radians = pi / 180;
  var abs2 = Math.abs;
  var atan = Math.atan;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var ceil = Math.ceil;
  var sin = Math.sin;
  var sign = Math.sign || function(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  };
  var sqrt = Math.sqrt;
  function acos(x) {
    return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
  }
  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  // node_modules/d3-geo/src/noop.js
  function noop2() {
  }

  // node_modules/d3-geo/src/stream.js
  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }
  var streamObjectType = {
    Feature: function(object3, stream) {
      streamGeometry(object3.geometry, stream);
    },
    FeatureCollection: function(object3, stream) {
      var features = object3.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };
  var streamGeometryType = {
    Sphere: function(object3, stream) {
      stream.sphere();
    },
    Point: function(object3, stream) {
      object3 = object3.coordinates;
      stream.point(object3[0], object3[1], object3[2]);
    },
    MultiPoint: function(object3, stream) {
      var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
      while (++i < n) object3 = coordinates2[i], stream.point(object3[0], object3[1], object3[2]);
    },
    LineString: function(object3, stream) {
      streamLine(object3.coordinates, stream, 0);
    },
    MultiLineString: function(object3, stream) {
      var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
      while (++i < n) streamLine(coordinates2[i], stream, 0);
    },
    Polygon: function(object3, stream) {
      streamPolygon(object3.coordinates, stream);
    },
    MultiPolygon: function(object3, stream) {
      var coordinates2 = object3.coordinates, i = -1, n = coordinates2.length;
      while (++i < n) streamPolygon(coordinates2[i], stream);
    },
    GeometryCollection: function(object3, stream) {
      var geometries = object3.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };
  function streamLine(coordinates2, stream, closed) {
    var i = -1, n = coordinates2.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates2[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }
  function streamPolygon(coordinates2, stream) {
    var i = -1, n = coordinates2.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates2[i], stream, 1);
    stream.polygonEnd();
  }
  function stream_default(object3, stream) {
    if (object3 && streamObjectType.hasOwnProperty(object3.type)) {
      streamObjectType[object3.type](object3, stream);
    } else {
      streamGeometry(object3, stream);
    }
  }

  // node_modules/d3-geo/src/area.js
  var areaRingSum = new Adder();
  var areaSum = new Adder();
  var lambda00;
  var phi00;
  var lambda0;
  var cosPhi0;
  var sinPhi0;
  var areaStream = {
    point: noop2,
    lineStart: noop2,
    lineEnd: noop2,
    polygonStart: function() {
      areaRingSum = new Adder();
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      var areaRing = +areaRingSum;
      areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
      this.lineStart = this.lineEnd = this.point = noop2;
    },
    sphere: function() {
      areaSum.add(tau);
    }
  };
  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }
  function areaRingEnd() {
    areaPoint(lambda00, phi00);
  }
  function areaPointFirst(lambda, phi) {
    areaStream.point = areaPoint;
    lambda00 = lambda, phi00 = phi;
    lambda *= radians, phi *= radians;
    lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
  }
  function areaPoint(lambda, phi) {
    lambda *= radians, phi *= radians;
    phi = phi / 2 + quarterPi;
    var dLambda = lambda - lambda0, sdLambda = dLambda >= 0 ? 1 : -1, adLambda = sdLambda * dLambda, cosPhi = cos(phi), sinPhi = sin(phi), k = sinPhi0 * sinPhi, u = cosPhi0 * cosPhi + k * cos(adLambda), v = k * sdLambda * sin(adLambda);
    areaRingSum.add(atan2(v, u));
    lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
  }
  function area_default(object3) {
    areaSum = new Adder();
    stream_default(object3, areaStream);
    return areaSum * 2;
  }

  // node_modules/d3-geo/src/cartesian.js
  function spherical(cartesian2) {
    return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
  }
  function cartesian(spherical2) {
    var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }
  function cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function cartesianCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function cartesianAddInPlace(a, b) {
    a[0] += b[0], a[1] += b[1], a[2] += b[2];
  }
  function cartesianScale(vector, k) {
    return [vector[0] * k, vector[1] * k, vector[2] * k];
  }
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  // node_modules/d3-geo/src/compose.js
  function compose_default(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }

  // node_modules/d3-geo/src/rotation.js
  function rotationIdentity(lambda, phi) {
    if (abs2(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
    return [lambda, phi];
  }
  rotationIdentity.invert = rotationIdentity;
  function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
    return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose_default(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
  }
  function forwardRotationLambda(deltaLambda) {
    return function(lambda, phi) {
      lambda += deltaLambda;
      if (abs2(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
      return [lambda, phi];
    };
  }
  function rotationLambda(deltaLambda) {
    var rotation = forwardRotationLambda(deltaLambda);
    rotation.invert = forwardRotationLambda(-deltaLambda);
    return rotation;
  }
  function rotationPhiGamma(deltaPhi, deltaGamma) {
    var cosDeltaPhi = cos(deltaPhi), sinDeltaPhi = sin(deltaPhi), cosDeltaGamma = cos(deltaGamma), sinDeltaGamma = sin(deltaGamma);
    function rotation(lambda, phi) {
      var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
        asin(k * cosDeltaGamma + y * sinDeltaGamma)
      ];
    }
    rotation.invert = function(lambda, phi) {
      var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k = z * cosDeltaGamma - y * sinDeltaGamma;
      return [
        atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
        asin(k * cosDeltaPhi - x * sinDeltaPhi)
      ];
    };
    return rotation;
  }

  // node_modules/d3-geo/src/circle.js
  function circleStream(stream, radius, delta, direction, t0, t1) {
    if (!delta) return;
    var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
    if (t0 == null) {
      t0 = radius + direction * tau;
      t1 = radius - step / 2;
    } else {
      t0 = circleRadius(cosRadius, t0);
      t1 = circleRadius(cosRadius, t1);
      if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
    }
    for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
      point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
      stream.point(point[0], point[1]);
    }
  }
  function circleRadius(cosRadius, point) {
    point = cartesian(point), point[0] -= cosRadius;
    cartesianNormalizeInPlace(point);
    var radius = acos(-point[1]);
    return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
  }

  // node_modules/d3-geo/src/clip/buffer.js
  function buffer_default() {
    var lines = [], line;
    return {
      point: function(x, y, m) {
        line.push([x, y, m]);
      },
      lineStart: function() {
        lines.push(line = []);
      },
      lineEnd: noop2,
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      },
      result: function() {
        var result = lines;
        lines = [];
        line = null;
        return result;
      }
    };
  }

  // node_modules/d3-geo/src/pointEqual.js
  function pointEqual_default(a, b) {
    return abs2(a[0] - b[0]) < epsilon && abs2(a[1] - b[1]) < epsilon;
  }

  // node_modules/d3-geo/src/clip/rejoin.js
  function Intersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function rejoin_default(segments, compareIntersection2, startInside, interpolate, stream) {
    var subject = [], clip = [], i, n;
    segments.forEach(function(segment) {
      if ((n2 = segment.length - 1) <= 0) return;
      var n2, p0 = segment[0], p1 = segment[n2], x;
      if (pointEqual_default(p0, p1)) {
        if (!p0[2] && !p1[2]) {
          stream.lineStart();
          for (i = 0; i < n2; ++i) stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }
        p1[0] += 2 * epsilon;
      }
      subject.push(x = new Intersection(p0, segment, null, true));
      clip.push(x.o = new Intersection(p0, null, x, false));
      subject.push(x = new Intersection(p1, segment, null, false));
      clip.push(x.o = new Intersection(p1, null, x, true));
    });
    if (!subject.length) return;
    clip.sort(compareIntersection2);
    link(subject);
    link(clip);
    for (i = 0, n = clip.length; i < n; ++i) {
      clip[i].e = startInside = !startInside;
    }
    var start2 = subject[0], points, point;
    while (1) {
      var current = start2, isSubject = true;
      while (current.v) if ((current = current.n) === start2) return;
      points = current.z;
      stream.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, stream);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, stream);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      stream.lineEnd();
    }
  }
  function link(array2) {
    if (!(n = array2.length)) return;
    var n, i = 0, a = array2[0], b;
    while (++i < n) {
      a.n = b = array2[i];
      b.p = a;
      a = b;
    }
    a.n = b = array2[0];
    b.p = a;
  }

  // node_modules/d3-geo/src/polygonContains.js
  function longitude(point) {
    return abs2(point[0]) <= pi ? point[0] : sign(point[0]) * ((abs2(point[0]) + pi) % tau - pi);
  }
  function polygonContains_default(polygon, point) {
    var lambda = longitude(point), phi = point[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle = 0, winding = 0;
    var sum = new Adder();
    if (sinPhi === 1) phi = halfPi + epsilon;
    else if (sinPhi === -1) phi = -halfPi - epsilon;
    for (var i = 0, n = polygon.length; i < n; ++i) {
      if (!(m = (ring = polygon[i]).length)) continue;
      var ring, m, point0 = ring[m - 1], lambda03 = longitude(point0), phi0 = point0[1] / 2 + quarterPi, sinPhi03 = sin(phi0), cosPhi03 = cos(phi0);
      for (var j = 0; j < m; ++j, lambda03 = lambda1, sinPhi03 = sinPhi1, cosPhi03 = cosPhi1, point0 = point1) {
        var point1 = ring[j], lambda1 = longitude(point1), phi1 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi1), cosPhi1 = cos(phi1), delta = lambda1 - lambda03, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k = sinPhi03 * sinPhi1;
        sum.add(atan2(k * sign2 * sin(absDelta), cosPhi03 * cosPhi1 + k * cos(absDelta)));
        angle += antimeridian ? delta + sign2 * tau : delta;
        if (antimeridian ^ lambda03 >= lambda ^ lambda1 >= lambda) {
          var arc = cartesianCross(cartesian(point0), cartesian(point1));
          cartesianNormalizeInPlace(arc);
          var intersection = cartesianCross(normal, arc);
          cartesianNormalizeInPlace(intersection);
          var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
          if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
            winding += antimeridian ^ delta >= 0 ? 1 : -1;
          }
        }
      }
    }
    return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ winding & 1;
  }

  // node_modules/d3-geo/src/clip/index.js
  function clip_default(pointVisible, clipLine, interpolate, start2) {
    return function(sink) {
      var line = clipLine(sink), ringBuffer = buffer_default(), ringSink = clipLine(ringBuffer), polygonStarted = false, polygon, segments, ring;
      var clip = {
        point,
        lineStart,
        lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = merge(segments);
          var startInside = polygonContains_default(polygon, start2);
          if (segments.length) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            rejoin_default(segments, compareIntersection, startInside, interpolate, sink);
          } else if (startInside) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
          }
          if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          sink.polygonStart();
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
          sink.polygonEnd();
        }
      };
      function point(lambda, phi) {
        if (pointVisible(lambda, phi)) sink.point(lambda, phi);
      }
      function pointLine(lambda, phi) {
        line.point(lambda, phi);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      function pointRing(lambda, phi) {
        ring.push([lambda, phi]);
        ringSink.point(lambda, phi);
      }
      function ringStart() {
        ringSink.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringSink.lineEnd();
        var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point2;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          if ((m = segment.length - 1) > 0) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            for (i = 0; i < m; ++i) sink.point((point2 = segment[i])[0], point2[1]);
            sink.lineEnd();
          }
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(validSegment));
      }
      return clip;
    };
  }
  function validSegment(segment) {
    return segment.length > 1;
  }
  function compareIntersection(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
  }

  // node_modules/d3-geo/src/clip/antimeridian.js
  var antimeridian_default = clip_default(
    function() {
      return true;
    },
    clipAntimeridianLine,
    clipAntimeridianInterpolate,
    [-pi, -halfPi]
  );
  function clipAntimeridianLine(stream) {
    var lambda03 = NaN, phi0 = NaN, sign0 = NaN, clean;
    return {
      lineStart: function() {
        stream.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var sign1 = lambda1 > 0 ? pi : -pi, delta = abs2(lambda1 - lambda03);
        if (abs2(delta - pi) < epsilon) {
          stream.point(lambda03, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          stream.point(lambda1, phi0);
          clean = 0;
        } else if (sign0 !== sign1 && delta >= pi) {
          if (abs2(lambda03 - sign0) < epsilon) lambda03 -= sign0 * epsilon;
          if (abs2(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
          phi0 = clipAntimeridianIntersect(lambda03, phi0, lambda1, phi1);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          clean = 0;
        }
        stream.point(lambda03 = lambda1, phi0 = phi1);
        sign0 = sign1;
      },
      lineEnd: function() {
        stream.lineEnd();
        lambda03 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function clipAntimeridianIntersect(lambda03, phi0, lambda1, phi1) {
    var cosPhi03, cosPhi1, sinLambda0Lambda1 = sin(lambda03 - lambda1);
    return abs2(sinLambda0Lambda1) > epsilon ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1) - sin(phi1) * (cosPhi03 = cos(phi0)) * sin(lambda03)) / (cosPhi03 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
  }
  function clipAntimeridianInterpolate(from, to, direction, stream) {
    var phi;
    if (from == null) {
      phi = direction * halfPi;
      stream.point(-pi, phi);
      stream.point(0, phi);
      stream.point(pi, phi);
      stream.point(pi, 0);
      stream.point(pi, -phi);
      stream.point(0, -phi);
      stream.point(-pi, -phi);
      stream.point(-pi, 0);
      stream.point(-pi, phi);
    } else if (abs2(from[0] - to[0]) > epsilon) {
      var lambda = from[0] < to[0] ? pi : -pi;
      phi = direction * lambda / 2;
      stream.point(-lambda, phi);
      stream.point(0, phi);
      stream.point(lambda, phi);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  // node_modules/d3-geo/src/clip/circle.js
  function circle_default(radius) {
    var cr = cos(radius), delta = 2 * radians, smallRadius = cr > 0, notHemisphere = abs2(cr) > epsilon;
    function interpolate(from, to, direction, stream) {
      circleStream(stream, radius, delta, direction, from, to);
    }
    function visible(lambda, phi) {
      return cos(lambda) * cos(phi) > cr;
    }
    function clipLine(stream) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(lambda, phi) {
          var point1 = [lambda, phi], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
          if (!point0 && (v00 = v0 = v)) stream.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (!point2 || pointEqual_default(point0, point2) || pointEqual_default(point1, point2))
              point1[2] = 1;
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              stream.lineStart();
              point2 = intersect(point1, point0);
              stream.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              stream.point(point2[0], point2[1], 2);
              stream.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                stream.lineStart();
                stream.point(t[0][0], t[0][1]);
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
              } else {
                stream.point(t[1][0], t[1][1]);
                stream.lineEnd();
                stream.lineStart();
                stream.point(t[0][0], t[0][1], 3);
              }
            }
          }
          if (v && (!point0 || !pointEqual_default(point0, point1))) {
            stream.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) stream.lineEnd();
          point0 = null;
        },
        // Rejoin first and last segments if there were intersections and the first
        // and last points were visible.
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = cartesian(a), pb = cartesian(b);
      var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A = cartesianScale(n1, c1), B = cartesianScale(n2, c2);
      cartesianAddInPlace(A, B);
      var u = n1xn2, w = cartesianDot(A, u), uu = cartesianDot(u, u), t2 = w * w - uu * (cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t = sqrt(t2), q = cartesianScale(u, (-w - t) / uu);
      cartesianAddInPlace(q, A);
      q = spherical(q);
      if (!two) return q;
      var lambda03 = a[0], lambda1 = b[0], phi0 = a[1], phi1 = b[1], z;
      if (lambda1 < lambda03) z = lambda03, lambda03 = lambda1, lambda1 = z;
      var delta2 = lambda1 - lambda03, polar = abs2(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;
      if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs2(q[0] - lambda03) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta2 > pi ^ (lambda03 <= q[0] && q[0] <= lambda1)) {
        var q1 = cartesianScale(u, (-w + t) / uu);
        cartesianAddInPlace(q1, A);
        return [q, spherical(q1)];
      }
    }
    function code(lambda, phi) {
      var r = smallRadius ? radius : pi - radius, code2 = 0;
      if (lambda < -r) code2 |= 1;
      else if (lambda > r) code2 |= 2;
      if (phi < -r) code2 |= 4;
      else if (phi > r) code2 |= 8;
      return code2;
    }
    return clip_default(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
  }

  // node_modules/d3-geo/src/clip/line.js
  function line_default(a, b, x05, y05, x12, y12) {
    var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
    r = x05 - ax;
    if (!dx && r > 0) return;
    r /= dx;
    if (dx < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }
    r = x12 - ax;
    if (!dx && r < 0) return;
    r /= dx;
    if (dx < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dx > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }
    r = y05 - ay;
    if (!dy && r > 0) return;
    r /= dy;
    if (dy < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dy > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }
    r = y12 - ay;
    if (!dy && r < 0) return;
    r /= dy;
    if (dy < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dy > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }
    if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
    if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
    return true;
  }

  // node_modules/d3-geo/src/clip/rectangle.js
  var clipMax = 1e9;
  var clipMin = -clipMax;
  function clipRectangle(x05, y05, x12, y12) {
    function visible(x, y) {
      return x05 <= x && x <= x12 && y05 <= y && y <= y12;
    }
    function interpolate(from, to, direction, stream) {
      var a = 0, a1 = 0;
      if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
        do
          stream.point(a === 0 || a === 3 ? x05 : x12, a > 1 ? y12 : y05);
        while ((a = (a + direction + 4) % 4) !== a1);
      } else {
        stream.point(to[0], to[1]);
      }
    }
    function corner(p, direction) {
      return abs2(p[0] - x05) < epsilon ? direction > 0 ? 0 : 3 : abs2(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs2(p[1] - y05) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compareIntersection2(a, b) {
      return comparePoint(a.x, b.x);
    }
    function comparePoint(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
    return function(stream) {
      var activeStream = stream, bufferStream = buffer_default(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
      var clipStream = {
        point,
        lineStart,
        lineEnd,
        polygonStart,
        polygonEnd
      };
      function point(x, y) {
        if (visible(x, y)) activeStream.point(x, y);
      }
      function polygonInside() {
        var winding = 0;
        for (var i = 0, n = polygon.length; i < n; ++i) {
          for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
            a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
            if (a1 <= y12) {
              if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x05 - a0)) ++winding;
            } else {
              if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x05 - a0)) --winding;
            }
          }
        }
        return winding;
      }
      function polygonStart() {
        activeStream = bufferStream, segments = [], polygon = [], clean = true;
      }
      function polygonEnd() {
        var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
        if (cleanInside || visible2) {
          stream.polygonStart();
          if (cleanInside) {
            stream.lineStart();
            interpolate(null, null, 1, stream);
            stream.lineEnd();
          }
          if (visible2) {
            rejoin_default(segments, compareIntersection2, startInside, interpolate, stream);
          }
          stream.polygonEnd();
        }
        activeStream = stream, segments = polygon = ring = null;
      }
      function lineStart() {
        clipStream.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferStream.rejoin();
          segments.push(bufferStream.result());
        }
        clipStream.point = point;
        if (v_) activeStream.lineEnd();
      }
      function linePoint(x, y) {
        var v = visible(x, y);
        if (polygon) ring.push([x, y]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
          }
        } else {
          if (v && v_) activeStream.point(x, y);
          else {
            var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
            if (line_default(a, b, x05, y05, x12, y12)) {
              if (!v_) {
                activeStream.lineStart();
                activeStream.point(a[0], a[1]);
              }
              activeStream.point(b[0], b[1]);
              if (!v) activeStream.lineEnd();
              clean = false;
            } else if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clipStream;
    };
  }

  // node_modules/d3-geo/src/length.js
  var lengthSum;
  var lambda02;
  var sinPhi02;
  var cosPhi02;
  var lengthStream = {
    sphere: noop2,
    point: noop2,
    lineStart: lengthLineStart,
    lineEnd: noop2,
    polygonStart: noop2,
    polygonEnd: noop2
  };
  function lengthLineStart() {
    lengthStream.point = lengthPointFirst;
    lengthStream.lineEnd = lengthLineEnd;
  }
  function lengthLineEnd() {
    lengthStream.point = lengthStream.lineEnd = noop2;
  }
  function lengthPointFirst(lambda, phi) {
    lambda *= radians, phi *= radians;
    lambda02 = lambda, sinPhi02 = sin(phi), cosPhi02 = cos(phi);
    lengthStream.point = lengthPoint;
  }
  function lengthPoint(lambda, phi) {
    lambda *= radians, phi *= radians;
    var sinPhi = sin(phi), cosPhi = cos(phi), delta = abs2(lambda - lambda02), cosDelta = cos(delta), sinDelta = sin(delta), x = cosPhi * sinDelta, y = cosPhi02 * sinPhi - sinPhi02 * cosPhi * cosDelta, z = sinPhi02 * sinPhi + cosPhi02 * cosPhi * cosDelta;
    lengthSum.add(atan2(sqrt(x * x + y * y), z));
    lambda02 = lambda, sinPhi02 = sinPhi, cosPhi02 = cosPhi;
  }
  function length_default(object3) {
    lengthSum = new Adder();
    stream_default(object3, lengthStream);
    return +lengthSum;
  }

  // node_modules/d3-geo/src/distance.js
  var coordinates = [null, null];
  var object = { type: "LineString", coordinates };
  function distance_default(a, b) {
    coordinates[0] = a;
    coordinates[1] = b;
    return length_default(object);
  }

  // node_modules/d3-geo/src/graticule.js
  function graticuleX(y05, y12, dy) {
    var y = range(y05, y12 - epsilon, dy).concat(y12);
    return function(x) {
      return y.map(function(y2) {
        return [x, y2];
      });
    };
  }
  function graticuleY(x05, x12, dx) {
    var x = range(x05, x12 - epsilon, dx).concat(x12);
    return function(y) {
      return x.map(function(x2) {
        return [x2, y];
      });
    };
  }
  function graticule() {
    var x12, x05, X12, X02, y12, y05, Y12, Y02, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X3, Y3, precision = 2.5;
    function graticule2() {
      return { type: "MultiLineString", coordinates: lines() };
    }
    function lines() {
      return range(ceil(X02 / DX) * DX, X12, DX).map(X3).concat(range(ceil(Y02 / DY) * DY, Y12, DY).map(Y3)).concat(range(ceil(x05 / dx) * dx, x12, dx).filter(function(x2) {
        return abs2(x2 % DX) > epsilon;
      }).map(x)).concat(range(ceil(y05 / dy) * dy, y12, dy).filter(function(y2) {
        return abs2(y2 % DY) > epsilon;
      }).map(y));
    }
    graticule2.lines = function() {
      return lines().map(function(coordinates2) {
        return { type: "LineString", coordinates: coordinates2 };
      });
    };
    graticule2.outline = function() {
      return {
        type: "Polygon",
        coordinates: [
          X3(X02).concat(
            Y3(Y12).slice(1),
            X3(X12).reverse().slice(1),
            Y3(Y02).reverse().slice(1)
          )
        ]
      };
    };
    graticule2.extent = function(_) {
      if (!arguments.length) return graticule2.extentMinor();
      return graticule2.extentMajor(_).extentMinor(_);
    };
    graticule2.extentMajor = function(_) {
      if (!arguments.length) return [[X02, Y02], [X12, Y12]];
      X02 = +_[0][0], X12 = +_[1][0];
      Y02 = +_[0][1], Y12 = +_[1][1];
      if (X02 > X12) _ = X02, X02 = X12, X12 = _;
      if (Y02 > Y12) _ = Y02, Y02 = Y12, Y12 = _;
      return graticule2.precision(precision);
    };
    graticule2.extentMinor = function(_) {
      if (!arguments.length) return [[x05, y05], [x12, y12]];
      x05 = +_[0][0], x12 = +_[1][0];
      y05 = +_[0][1], y12 = +_[1][1];
      if (x05 > x12) _ = x05, x05 = x12, x12 = _;
      if (y05 > y12) _ = y05, y05 = y12, y12 = _;
      return graticule2.precision(precision);
    };
    graticule2.step = function(_) {
      if (!arguments.length) return graticule2.stepMinor();
      return graticule2.stepMajor(_).stepMinor(_);
    };
    graticule2.stepMajor = function(_) {
      if (!arguments.length) return [DX, DY];
      DX = +_[0], DY = +_[1];
      return graticule2;
    };
    graticule2.stepMinor = function(_) {
      if (!arguments.length) return [dx, dy];
      dx = +_[0], dy = +_[1];
      return graticule2;
    };
    graticule2.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = graticuleX(y05, y12, 90);
      y = graticuleY(x05, x12, precision);
      X3 = graticuleX(Y02, Y12, 90);
      Y3 = graticuleY(X02, X12, precision);
      return graticule2;
    };
    return graticule2.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
  }
  function graticule10() {
    return graticule()();
  }

  // node_modules/d3-geo/src/identity.js
  var identity_default2 = (x) => x;

  // node_modules/d3-geo/src/path/area.js
  var areaSum2 = new Adder();
  var areaRingSum2 = new Adder();
  var x00;
  var y00;
  var x0;
  var y0;
  var areaStream2 = {
    point: noop2,
    lineStart: noop2,
    lineEnd: noop2,
    polygonStart: function() {
      areaStream2.lineStart = areaRingStart2;
      areaStream2.lineEnd = areaRingEnd2;
    },
    polygonEnd: function() {
      areaStream2.lineStart = areaStream2.lineEnd = areaStream2.point = noop2;
      areaSum2.add(abs2(areaRingSum2));
      areaRingSum2 = new Adder();
    },
    result: function() {
      var area = areaSum2 / 2;
      areaSum2 = new Adder();
      return area;
    }
  };
  function areaRingStart2() {
    areaStream2.point = areaPointFirst2;
  }
  function areaPointFirst2(x, y) {
    areaStream2.point = areaPoint2;
    x00 = x0 = x, y00 = y0 = y;
  }
  function areaPoint2(x, y) {
    areaRingSum2.add(y0 * x - x0 * y);
    x0 = x, y0 = y;
  }
  function areaRingEnd2() {
    areaPoint2(x00, y00);
  }
  var area_default2 = areaStream2;

  // node_modules/d3-geo/src/path/bounds.js
  var x02 = Infinity;
  var y02 = x02;
  var x1 = -x02;
  var y1 = x1;
  var boundsStream = {
    point: boundsPoint,
    lineStart: noop2,
    lineEnd: noop2,
    polygonStart: noop2,
    polygonEnd: noop2,
    result: function() {
      var bounds = [[x02, y02], [x1, y1]];
      x1 = y1 = -(y02 = x02 = Infinity);
      return bounds;
    }
  };
  function boundsPoint(x, y) {
    if (x < x02) x02 = x;
    if (x > x1) x1 = x;
    if (y < y02) y02 = y;
    if (y > y1) y1 = y;
  }
  var bounds_default = boundsStream;

  // node_modules/d3-geo/src/path/centroid.js
  var X0 = 0;
  var Y0 = 0;
  var Z0 = 0;
  var X1 = 0;
  var Y1 = 0;
  var Z1 = 0;
  var X2 = 0;
  var Y2 = 0;
  var Z2 = 0;
  var x002;
  var y002;
  var x03;
  var y03;
  var centroidStream = {
    point: centroidPoint,
    lineStart: centroidLineStart,
    lineEnd: centroidLineEnd,
    polygonStart: function() {
      centroidStream.lineStart = centroidRingStart;
      centroidStream.lineEnd = centroidRingEnd;
    },
    polygonEnd: function() {
      centroidStream.point = centroidPoint;
      centroidStream.lineStart = centroidLineStart;
      centroidStream.lineEnd = centroidLineEnd;
    },
    result: function() {
      var centroid = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
      X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
      return centroid;
    }
  };
  function centroidPoint(x, y) {
    X0 += x;
    Y0 += y;
    ++Z0;
  }
  function centroidLineStart() {
    centroidStream.point = centroidPointFirstLine;
  }
  function centroidPointFirstLine(x, y) {
    centroidStream.point = centroidPointLine;
    centroidPoint(x03 = x, y03 = y);
  }
  function centroidPointLine(x, y) {
    var dx = x - x03, dy = y - y03, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x03 + x) / 2;
    Y1 += z * (y03 + y) / 2;
    Z1 += z;
    centroidPoint(x03 = x, y03 = y);
  }
  function centroidLineEnd() {
    centroidStream.point = centroidPoint;
  }
  function centroidRingStart() {
    centroidStream.point = centroidPointFirstRing;
  }
  function centroidRingEnd() {
    centroidPointRing(x002, y002);
  }
  function centroidPointFirstRing(x, y) {
    centroidStream.point = centroidPointRing;
    centroidPoint(x002 = x03 = x, y002 = y03 = y);
  }
  function centroidPointRing(x, y) {
    var dx = x - x03, dy = y - y03, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x03 + x) / 2;
    Y1 += z * (y03 + y) / 2;
    Z1 += z;
    z = y03 * x - x03 * y;
    X2 += z * (x03 + x);
    Y2 += z * (y03 + y);
    Z2 += z * 3;
    centroidPoint(x03 = x, y03 = y);
  }
  var centroid_default = centroidStream;

  // node_modules/d3-geo/src/path/context.js
  function PathContext(context) {
    this._context = context;
  }
  PathContext.prototype = {
    _radius: 4.5,
    pointRadius: function(_) {
      return this._radius = _, this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._context.closePath();
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._context.moveTo(x, y);
          this._point = 1;
          break;
        }
        case 1: {
          this._context.lineTo(x, y);
          break;
        }
        default: {
          this._context.moveTo(x + this._radius, y);
          this._context.arc(x, y, this._radius, 0, tau);
          break;
        }
      }
    },
    result: noop2
  };

  // node_modules/d3-geo/src/path/measure.js
  var lengthSum2 = new Adder();
  var lengthRing;
  var x003;
  var y003;
  var x04;
  var y04;
  var lengthStream2 = {
    point: noop2,
    lineStart: function() {
      lengthStream2.point = lengthPointFirst2;
    },
    lineEnd: function() {
      if (lengthRing) lengthPoint2(x003, y003);
      lengthStream2.point = noop2;
    },
    polygonStart: function() {
      lengthRing = true;
    },
    polygonEnd: function() {
      lengthRing = null;
    },
    result: function() {
      var length = +lengthSum2;
      lengthSum2 = new Adder();
      return length;
    }
  };
  function lengthPointFirst2(x, y) {
    lengthStream2.point = lengthPoint2;
    x003 = x04 = x, y003 = y04 = y;
  }
  function lengthPoint2(x, y) {
    x04 -= x, y04 -= y;
    lengthSum2.add(sqrt(x04 * x04 + y04 * y04));
    x04 = x, y04 = y;
  }
  var measure_default = lengthStream2;

  // node_modules/d3-geo/src/path/string.js
  var cacheDigits;
  var cacheAppend;
  var cacheRadius;
  var cacheCircle;
  var PathString = class {
    constructor(digits) {
      this._append = digits == null ? append : appendRound(digits);
      this._radius = 4.5;
      this._ = "";
    }
    pointRadius(_) {
      this._radius = +_;
      return this;
    }
    polygonStart() {
      this._line = 0;
    }
    polygonEnd() {
      this._line = NaN;
    }
    lineStart() {
      this._point = 0;
    }
    lineEnd() {
      if (this._line === 0) this._ += "Z";
      this._point = NaN;
    }
    point(x, y) {
      switch (this._point) {
        case 0: {
          this._append`M${x},${y}`;
          this._point = 1;
          break;
        }
        case 1: {
          this._append`L${x},${y}`;
          break;
        }
        default: {
          this._append`M${x},${y}`;
          if (this._radius !== cacheRadius || this._append !== cacheAppend) {
            const r = this._radius;
            const s = this._;
            this._ = "";
            this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
            cacheRadius = r;
            cacheAppend = this._append;
            cacheCircle = this._;
            this._ = s;
          }
          this._ += cacheCircle;
          break;
        }
      }
    }
    result() {
      const result = this._;
      this._ = "";
      return result.length ? result : null;
    }
  };
  function append(strings) {
    let i = 1;
    this._ += strings[0];
    for (const j = strings.length; i < j; ++i) {
      this._ += arguments[i] + strings[i];
    }
  }
  function appendRound(digits) {
    const d = Math.floor(digits);
    if (!(d >= 0)) throw new RangeError(`invalid digits: ${digits}`);
    if (d > 15) return append;
    if (d !== cacheDigits) {
      const k = 10 ** d;
      cacheDigits = d;
      cacheAppend = function append2(strings) {
        let i = 1;
        this._ += strings[0];
        for (const j = strings.length; i < j; ++i) {
          this._ += Math.round(arguments[i] * k) / k + strings[i];
        }
      };
    }
    return cacheAppend;
  }

  // node_modules/d3-geo/src/path/index.js
  function path_default(projection2, context) {
    let digits = 3, pointRadius = 4.5, projectionStream, contextStream;
    function path(object3) {
      if (object3) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        stream_default(object3, projectionStream(contextStream));
      }
      return contextStream.result();
    }
    path.area = function(object3) {
      stream_default(object3, projectionStream(area_default2));
      return area_default2.result();
    };
    path.measure = function(object3) {
      stream_default(object3, projectionStream(measure_default));
      return measure_default.result();
    };
    path.bounds = function(object3) {
      stream_default(object3, projectionStream(bounds_default));
      return bounds_default.result();
    };
    path.centroid = function(object3) {
      stream_default(object3, projectionStream(centroid_default));
      return centroid_default.result();
    };
    path.projection = function(_) {
      if (!arguments.length) return projection2;
      projectionStream = _ == null ? (projection2 = null, identity_default2) : (projection2 = _).stream;
      return path;
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return path;
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };
    path.digits = function(_) {
      if (!arguments.length) return digits;
      if (_ == null) digits = null;
      else {
        const d = Math.floor(_);
        if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
        digits = d;
      }
      if (context === null) contextStream = new PathString(digits);
      return path;
    };
    return path.projection(projection2).digits(digits).context(context);
  }

  // node_modules/d3-geo/src/transform.js
  function transformer(methods) {
    return function(stream) {
      var s = new TransformStream();
      for (var key in methods) s[key] = methods[key];
      s.stream = stream;
      return s;
    };
  }
  function TransformStream() {
  }
  TransformStream.prototype = {
    constructor: TransformStream,
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };

  // node_modules/d3-geo/src/projection/fit.js
  function fit(projection2, fitBounds, object3) {
    var clip = projection2.clipExtent && projection2.clipExtent();
    projection2.scale(150).translate([0, 0]);
    if (clip != null) projection2.clipExtent(null);
    stream_default(object3, projection2.stream(bounds_default));
    fitBounds(bounds_default.result());
    if (clip != null) projection2.clipExtent(clip);
    return projection2;
  }
  function fitExtent(projection2, extent, object3) {
    return fit(projection2, function(b) {
      var w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      projection2.scale(150 * k).translate([x, y]);
    }, object3);
  }
  function fitSize(projection2, size, object3) {
    return fitExtent(projection2, [[0, 0], size], object3);
  }
  function fitWidth(projection2, width, object3) {
    return fit(projection2, function(b) {
      var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
      projection2.scale(150 * k).translate([x, y]);
    }, object3);
  }
  function fitHeight(projection2, height, object3) {
    return fit(projection2, function(b) {
      var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
      projection2.scale(150 * k).translate([x, y]);
    }, object3);
  }

  // node_modules/d3-geo/src/projection/resample.js
  var maxDepth = 16;
  var cosMinDistance = cos(30 * radians);
  function resample_default(project, delta2) {
    return +delta2 ? resample(project, delta2) : resampleNone(project);
  }
  function resampleNone(project) {
    return transformer({
      point: function(x, y) {
        x = project(x, y);
        this.stream.point(x[0], x[1]);
      }
    });
  }
  function resample(project, delta2) {
    function resampleLineTo(x05, y05, lambda03, a0, b0, c0, x12, y12, lambda1, a1, b1, c1, depth, stream) {
      var dx = x12 - x05, dy = y12 - y05, d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda2 = abs2(abs2(c) - 1) < epsilon || abs2(lambda03 - lambda1) < epsilon ? (lambda03 + lambda1) / 2 : atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x05, dy2 = y2 - y05, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 || abs2((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x05, y05, lambda03, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x12, y12, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    return function(stream) {
      var lambda002, x004, y004, a00, b00, c00, lambda03, x05, y05, a0, b0, c0;
      var resampleStream = {
        point,
        lineStart,
        lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resampleStream.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resampleStream.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x05 = NaN;
        resampleStream.point = linePoint;
        stream.lineStart();
      }
      function linePoint(lambda, phi) {
        var c = cartesian([lambda, phi]), p = project(lambda, phi);
        resampleLineTo(x05, y05, lambda03, a0, b0, c0, x05 = p[0], y05 = p[1], lambda03 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x05, y05);
      }
      function lineEnd() {
        resampleStream.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resampleStream.point = ringPoint;
        resampleStream.lineEnd = ringEnd;
      }
      function ringPoint(lambda, phi) {
        linePoint(lambda002 = lambda, phi), x004 = x05, y004 = y05, a00 = a0, b00 = b0, c00 = c0;
        resampleStream.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x05, y05, lambda03, a0, b0, c0, x004, y004, lambda002, a00, b00, c00, maxDepth, stream);
        resampleStream.lineEnd = lineEnd;
        lineEnd();
      }
      return resampleStream;
    };
  }

  // node_modules/d3-geo/src/projection/index.js
  var transformRadians = transformer({
    point: function(x, y) {
      this.stream.point(x * radians, y * radians);
    }
  });
  function transformRotate(rotate) {
    return transformer({
      point: function(x, y) {
        var r = rotate(x, y);
        return this.stream.point(r[0], r[1]);
      }
    });
  }
  function scaleTranslate(k, dx, dy, sx, sy) {
    function transform2(x, y) {
      x *= sx;
      y *= sy;
      return [dx + k * x, dy - k * y];
    }
    transform2.invert = function(x, y) {
      return [(x - dx) / k * sx, (dy - y) / k * sy];
    };
    return transform2;
  }
  function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
    if (!alpha) return scaleTranslate(k, dx, dy, sx, sy);
    var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k, b = sinAlpha * k, ai = cosAlpha / k, bi = sinAlpha / k, ci = (sinAlpha * dy - cosAlpha * dx) / k, fi = (sinAlpha * dx + cosAlpha * dy) / k;
    function transform2(x, y) {
      x *= sx;
      y *= sy;
      return [a * x - b * y + dx, dy - b * x - a * y];
    }
    transform2.invert = function(x, y) {
      return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
    };
    return transform2;
  }
  function projection(project) {
    return projectionMutator(function() {
      return project;
    })();
  }
  function projectionMutator(projectAt) {
    var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = antimeridian_default, x05 = null, y05, x12, y12, postclip = identity_default2, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache2, cacheStream;
    function projection2(point) {
      return projectRotateTransform(point[0] * radians, point[1] * radians);
    }
    function invert(point) {
      point = projectRotateTransform.invert(point[0], point[1]);
      return point && [point[0] * degrees2, point[1] * degrees2];
    }
    projection2.stream = function(stream) {
      return cache2 && cacheStream === stream ? cache2 : cache2 = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
    };
    projection2.preclip = function(_) {
      return arguments.length ? (preclip = _, theta = void 0, reset()) : preclip;
    };
    projection2.postclip = function(_) {
      return arguments.length ? (postclip = _, x05 = y05 = x12 = y12 = null, reset()) : postclip;
    };
    projection2.clipAngle = function(_) {
      return arguments.length ? (preclip = +_ ? circle_default(theta = _ * radians) : (theta = null, antimeridian_default), reset()) : theta * degrees2;
    };
    projection2.clipExtent = function(_) {
      return arguments.length ? (postclip = _ == null ? (x05 = y05 = x12 = y12 = null, identity_default2) : clipRectangle(x05 = +_[0][0], y05 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x05 == null ? null : [[x05, y05], [x12, y12]];
    };
    projection2.scale = function(_) {
      return arguments.length ? (k = +_, recenter()) : k;
    };
    projection2.translate = function(_) {
      return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
    };
    projection2.center = function(_) {
      return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees2, phi * degrees2];
    };
    projection2.rotate = function(_) {
      return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees2, deltaPhi * degrees2, deltaGamma * degrees2];
    };
    projection2.angle = function(_) {
      return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees2;
    };
    projection2.reflectX = function(_) {
      return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
    };
    projection2.reflectY = function(_) {
      return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
    };
    projection2.precision = function(_) {
      return arguments.length ? (projectResample = resample_default(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
    };
    projection2.fitExtent = function(extent, object3) {
      return fitExtent(projection2, extent, object3);
    };
    projection2.fitSize = function(size, object3) {
      return fitSize(projection2, size, object3);
    };
    projection2.fitWidth = function(width, object3) {
      return fitWidth(projection2, width, object3);
    };
    projection2.fitHeight = function(height, object3) {
      return fitHeight(projection2, height, object3);
    };
    function recenter() {
      var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform2 = scaleTranslateRotate(k, x - center[0], y - center[1], sx, sy, alpha);
      rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
      projectTransform = compose_default(project, transform2);
      projectRotateTransform = compose_default(rotate, projectTransform);
      projectResample = resample_default(projectTransform, delta2);
      return reset();
    }
    function reset() {
      cache2 = cacheStream = null;
      return projection2;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection2.invert = project.invert && invert;
      return recenter();
    };
  }

  // node_modules/d3-geo/src/projection/conic.js
  function conicProjection(projectAt) {
    var phi0 = 0, phi1 = pi / 3, m = projectionMutator(projectAt), p = m(phi0, phi1);
    p.parallels = function(_) {
      return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees2, phi1 * degrees2];
    };
    return p;
  }

  // node_modules/d3-geo/src/projection/cylindricalEqualArea.js
  function cylindricalEqualAreaRaw(phi0) {
    var cosPhi03 = cos(phi0);
    function forward(lambda, phi) {
      return [lambda * cosPhi03, sin(phi) / cosPhi03];
    }
    forward.invert = function(x, y) {
      return [x / cosPhi03, asin(y * cosPhi03)];
    };
    return forward;
  }

  // node_modules/d3-geo/src/projection/conicEqualArea.js
  function conicEqualAreaRaw(y05, y12) {
    var sy0 = sin(y05), n = (sy0 + sin(y12)) / 2;
    if (abs2(n) < epsilon) return cylindricalEqualAreaRaw(y05);
    var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;
    function project(x, y) {
      var r = sqrt(c - 2 * n * sin(y)) / n;
      return [r * sin(x *= n), r0 - r * cos(x)];
    }
    project.invert = function(x, y) {
      var r0y = r0 - y, l = atan2(x, abs2(r0y)) * sign(r0y);
      if (r0y * n < 0)
        l -= pi * sign(x) * sign(r0y);
      return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
    };
    return project;
  }
  function conicEqualArea_default() {
    return conicProjection(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
  }

  // node_modules/d3-geo/src/projection/albers.js
  function albers_default() {
    return conicEqualArea_default().parallels([29.5, 45.5]).scale(1070).translate([480, 250]).rotate([96, 0]).center([-0.6, 38.7]);
  }

  // node_modules/d3-geo/src/projection/albersUsa.js
  function multiplex(streams) {
    var n = streams.length;
    return {
      point: function(x, y) {
        var i = -1;
        while (++i < n) streams[i].point(x, y);
      },
      sphere: function() {
        var i = -1;
        while (++i < n) streams[i].sphere();
      },
      lineStart: function() {
        var i = -1;
        while (++i < n) streams[i].lineStart();
      },
      lineEnd: function() {
        var i = -1;
        while (++i < n) streams[i].lineEnd();
      },
      polygonStart: function() {
        var i = -1;
        while (++i < n) streams[i].polygonStart();
      },
      polygonEnd: function() {
        var i = -1;
        while (++i < n) streams[i].polygonEnd();
      }
    };
  }
  function albersUsa_default() {
    var cache2, cacheStream, lower48 = albers_default(), lower48Point, alaska = conicEqualArea_default().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, hawaii = conicEqualArea_default().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, point, pointStream = { point: function(x, y) {
      point = [x, y];
    } };
    function albersUsa(coordinates2) {
      var x = coordinates2[0], y = coordinates2[1];
      return point = null, (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point);
    }
    albersUsa.invert = function(coordinates2) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates2[0] - t[0]) / k, y = (coordinates2[1] - t[1]) / k;
      return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates2);
    };
    albersUsa.stream = function(stream) {
      return cache2 && cacheStream === stream ? cache2 : cache2 = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
    };
    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_), alaska.precision(_), hawaii.precision(_);
      return reset();
    };
    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];
      lower48Point = lower48.translate(_).clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]]).stream(pointStream);
      alaskaPoint = alaska.translate([x - 0.307 * k, y + 0.201 * k]).clipExtent([[x - 0.425 * k + epsilon, y + 0.12 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
      hawaiiPoint = hawaii.translate([x - 0.205 * k, y + 0.212 * k]).clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]]).stream(pointStream);
      return reset();
    };
    albersUsa.fitExtent = function(extent, object3) {
      return fitExtent(albersUsa, extent, object3);
    };
    albersUsa.fitSize = function(size, object3) {
      return fitSize(albersUsa, size, object3);
    };
    albersUsa.fitWidth = function(width, object3) {
      return fitWidth(albersUsa, width, object3);
    };
    albersUsa.fitHeight = function(height, object3) {
      return fitHeight(albersUsa, height, object3);
    };
    function reset() {
      cache2 = cacheStream = null;
      return albersUsa;
    }
    return albersUsa.scale(1070);
  }

  // node_modules/d3-geo/src/projection/azimuthal.js
  function azimuthalRaw(scale) {
    return function(x, y) {
      var cx = cos(x), cy = cos(y), k = scale(cx * cy);
      if (k === Infinity) return [2, 0];
      return [
        k * cy * sin(x),
        k * sin(y)
      ];
    };
  }
  function azimuthalInvert(angle) {
    return function(x, y) {
      var z = sqrt(x * x + y * y), c = angle(z), sc = sin(c), cc = cos(c);
      return [
        atan2(x * sc, z * cc),
        asin(z && y * sc / z)
      ];
    };
  }

  // node_modules/d3-geo/src/projection/azimuthalEqualArea.js
  var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
    return sqrt(2 / (1 + cxcy));
  });
  azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
    return 2 * asin(z / 2);
  });
  function azimuthalEqualArea_default() {
    return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
  }

  // node_modules/d3-geo/src/projection/equalEarth.js
  var A1 = 1.340264;
  var A2 = -0.081106;
  var A3 = 893e-6;
  var A4 = 3796e-6;
  var M = sqrt(3) / 2;
  var iterations = 12;
  function equalEarthRaw(lambda, phi) {
    var l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2;
    return [
      lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
      l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
    ];
  }
  equalEarthRaw.invert = function(x, y) {
    var l = y, l2 = l * l, l6 = l2 * l2 * l2;
    for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
      fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
      fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
      l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
      if (abs2(delta) < epsilon2) break;
    }
    return [
      M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
      asin(sin(l) / M)
    ];
  };
  function equalEarth_default() {
    return projection(equalEarthRaw).scale(177.158);
  }

  // node_modules/d3-scale/src/init.js
  function initRange(domain, range2) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range2).domain(domain);
        break;
    }
    return this;
  }

  // node_modules/d3-scale/src/constant.js
  function constants(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-scale/src/number.js
  function number3(x) {
    return +x;
  }

  // node_modules/d3-scale/src/continuous.js
  var unit = [0, 1];
  function identity2(x) {
    return x;
  }
  function normalize(a, b) {
    return (b -= a = +a) ? function(x) {
      return (x - a) / b;
    } : constants(isNaN(b) ? NaN : 0.5);
  }
  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) {
      return Math.max(a, Math.min(b, x));
    };
  }
  function bimap(domain, range2, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) {
      return r0(d0(x));
    };
  }
  function polymap(domain, range2, interpolate) {
    var j = Math.min(domain.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range2 = range2.slice().reverse();
    }
    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range2[i], range2[i + 1]);
    }
    return function(x) {
      var i2 = bisect_default(domain, x, 1, j) - 1;
      return r[i2](d[i2](x));
    };
  }
  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer2() {
    var domain = unit, range2 = unit, interpolate = value_default, transform2, untransform, unknown, clamp = identity2, piecewise, output, input;
    function rescale() {
      var n = Math.min(domain.length, range2.length);
      if (clamp !== identity2) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform2), range2, interpolate)))(transform2(clamp(x)));
    }
    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range2, domain.map(transform2), number_default)))(y)));
    };
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number3), rescale()) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
    };
    scale.rangeRound = function(_) {
      return range2 = Array.from(_), interpolate = round_default, rescale();
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity2, rescale()) : clamp !== identity2;
    };
    scale.interpolate = function(_) {
      return arguments.length ? (interpolate = _, rescale()) : interpolate;
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t, u) {
      transform2 = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer2()(identity2, identity2);
  }

  // node_modules/d3-scale/src/tickFormat.js
  function tickFormat(start2, stop, count, specifier) {
    var step = tickStep(start2, stop, count), precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start2), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start2), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  // node_modules/d3-scale/src/linear.js
  function linearish(scale) {
    var domain = scale.domain;
    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };
    scale.nice = function(count) {
      if (count == null) count = 10;
      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start2 = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;
      if (stop < start2) {
        step = start2, start2 = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      while (maxIter-- > 0) {
        step = tickIncrement(start2, stop, count);
        if (step === prestep) {
          d[i0] = start2;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start2 = Math.floor(start2 / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start2 = Math.ceil(start2 * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }
      return scale;
    };
    return scale;
  }
  function linear2() {
    var scale = continuous();
    scale.copy = function() {
      return copy(scale, linear2());
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  // node_modules/d3-zoom/src/transform.js
  function Transform(k, x, y) {
    this.k = k;
    this.x = x;
    this.y = y;
  }
  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x, y) {
      return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x) {
      return x * this.k + this.x;
    },
    applyY: function(y) {
      return y * this.k + this.y;
    },
    invert: function(location2) {
      return [(location2[0] - this.x) / this.k, (location2[1] - this.y) / this.k];
    },
    invertX: function(x) {
      return (x - this.x) / this.k;
    },
    invertY: function(y) {
      return (y - this.y) / this.k;
    },
    rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    },
    rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };
  var identity3 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity3;
    return node.__zoom;
  }

  // src/data/loader.js
  var cache = /* @__PURE__ */ new Map();
  function inlined(path) {
    const sel = `script[type="application/json"][data-path="${CSS.escape(path)}"]`;
    const el = document.querySelector(sel);
    return el ? el.textContent : null;
  }
  async function loadText(path) {
    const inl = inlined(path);
    if (inl !== null) return inl;
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Could not load ${path} (HTTP ${res.status})`);
    return res.text();
  }
  function loadJSON(path) {
    if (!cache.has(path)) cache.set(path, loadText(path).then((t) => JSON.parse(t)));
    return cache.get(path);
  }
  function assetURL(path) {
    const assets = globalThis.__PARCHMENT_ASSETS__;
    return assets && assets[path] || path;
  }

  // node_modules/topojson-client/src/identity.js
  function identity_default3(x) {
    return x;
  }

  // node_modules/topojson-client/src/transform.js
  function transform_default(transform2) {
    if (transform2 == null) return identity_default3;
    var x05, y05, kx = transform2.scale[0], ky = transform2.scale[1], dx = transform2.translate[0], dy = transform2.translate[1];
    return function(input, i) {
      if (!i) x05 = y05 = 0;
      var j = 2, n = input.length, output = new Array(n);
      output[0] = (x05 += input[0]) * kx + dx;
      output[1] = (y05 += input[1]) * ky + dy;
      while (j < n) output[j] = input[j], ++j;
      return output;
    };
  }

  // node_modules/topojson-client/src/reverse.js
  function reverse_default(array2, n) {
    var t, j = array2.length, i = j - n;
    while (i < --j) t = array2[i], array2[i++] = array2[j], array2[j] = t;
  }

  // node_modules/topojson-client/src/feature.js
  function feature_default(topology, o) {
    if (typeof o === "string") o = topology.objects[o];
    return o.type === "GeometryCollection" ? { type: "FeatureCollection", features: o.geometries.map(function(o2) {
      return feature(topology, o2);
    }) } : feature(topology, o);
  }
  function feature(topology, o) {
    var id2 = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object2(topology, o);
    return id2 == null && bbox == null ? { type: "Feature", properties, geometry } : bbox == null ? { type: "Feature", id: id2, properties, geometry } : { type: "Feature", id: id2, bbox, properties, geometry };
  }
  function object2(topology, o) {
    var transformPoint = transform_default(topology.transform), arcs = topology.arcs;
    function arc(i, points) {
      if (points.length) points.pop();
      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
        points.push(transformPoint(a[k], k));
      }
      if (i < 0) reverse_default(points, n);
    }
    function point(p) {
      return transformPoint(p);
    }
    function line(arcs2) {
      var points = [];
      for (var i = 0, n = arcs2.length; i < n; ++i) arc(arcs2[i], points);
      if (points.length < 2) points.push(points[0]);
      return points;
    }
    function ring(arcs2) {
      var points = line(arcs2);
      while (points.length < 4) points.push(points[0]);
      return points;
    }
    function polygon(arcs2) {
      return arcs2.map(ring);
    }
    function geometry(o2) {
      var type2 = o2.type, coordinates2;
      switch (type2) {
        case "GeometryCollection":
          return { type: type2, geometries: o2.geometries.map(geometry) };
        case "Point":
          coordinates2 = point(o2.coordinates);
          break;
        case "MultiPoint":
          coordinates2 = o2.coordinates.map(point);
          break;
        case "LineString":
          coordinates2 = line(o2.arcs);
          break;
        case "MultiLineString":
          coordinates2 = o2.arcs.map(line);
          break;
        case "Polygon":
          coordinates2 = polygon(o2.arcs);
          break;
        case "MultiPolygon":
          coordinates2 = o2.arcs.map(polygon);
          break;
        default:
          return null;
      }
      return { type: type2, coordinates: coordinates2 };
    }
    return geometry(o);
  }

  // node_modules/topojson-client/src/stitch.js
  function stitch_default(topology, arcs) {
    var stitchedArcs = {}, fragmentByStart = {}, fragmentByEnd = {}, fragments = [], emptyIndex = -1;
    arcs.forEach(function(i, j) {
      var arc = topology.arcs[i < 0 ? ~i : i], t;
      if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
        t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
      }
    });
    arcs.forEach(function(i) {
      var e = ends(i), start2 = e[0], end = e[1], f, g;
      if (f = fragmentByEnd[start2]) {
        delete fragmentByEnd[f.end];
        f.push(i);
        f.end = end;
        if (g = fragmentByStart[end]) {
          delete fragmentByStart[g.start];
          var fg = g === f ? f : f.concat(g);
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else if (f = fragmentByStart[end]) {
        delete fragmentByStart[f.start];
        f.unshift(i);
        f.start = start2;
        if (g = fragmentByEnd[start2]) {
          delete fragmentByEnd[g.end];
          var gf = g === f ? f : g.concat(f);
          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else {
        f = [i];
        fragmentByStart[f.start = start2] = fragmentByEnd[f.end = end] = f;
      }
    });
    function ends(i) {
      var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
      if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) {
        p1[0] += dp[0], p1[1] += dp[1];
      });
      else p1 = arc[arc.length - 1];
      return i < 0 ? [p1, p0] : [p0, p1];
    }
    function flush(fragmentByEnd2, fragmentByStart2) {
      for (var k in fragmentByEnd2) {
        var f = fragmentByEnd2[k];
        delete fragmentByStart2[f.start];
        delete f.start;
        delete f.end;
        f.forEach(function(i) {
          stitchedArcs[i < 0 ? ~i : i] = 1;
        });
        fragments.push(f);
      }
    }
    flush(fragmentByEnd, fragmentByStart);
    flush(fragmentByStart, fragmentByEnd);
    arcs.forEach(function(i) {
      if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]);
    });
    return fragments;
  }

  // node_modules/topojson-client/src/mesh.js
  function mesh_default(topology) {
    return object2(topology, meshArcs.apply(this, arguments));
  }
  function meshArcs(topology, object3, filter2) {
    var arcs, i, n;
    if (arguments.length > 1) arcs = extractArcs(topology, object3, filter2);
    else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
    return { type: "MultiLineString", arcs: stitch_default(topology, arcs) };
  }
  function extractArcs(topology, object3, filter2) {
    var arcs = [], geomsByArc = [], geom;
    function extract0(i) {
      var j = i < 0 ? ~i : i;
      (geomsByArc[j] || (geomsByArc[j] = [])).push({ i, g: geom });
    }
    function extract1(arcs2) {
      arcs2.forEach(extract0);
    }
    function extract2(arcs2) {
      arcs2.forEach(extract1);
    }
    function extract3(arcs2) {
      arcs2.forEach(extract2);
    }
    function geometry(o) {
      switch (geom = o, o.type) {
        case "GeometryCollection":
          o.geometries.forEach(geometry);
          break;
        case "LineString":
          extract1(o.arcs);
          break;
        case "MultiLineString":
        case "Polygon":
          extract2(o.arcs);
          break;
        case "MultiPolygon":
          extract3(o.arcs);
          break;
      }
    }
    geometry(object3);
    geomsByArc.forEach(filter2 == null ? function(geoms) {
      arcs.push(geoms[0].i);
    } : function(geoms) {
      if (filter2(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i);
    });
    return arcs;
  }

  // src/render/paper.js
  function paperDefs(defs) {
    const grain = defs.append("filter").attr("id", "paper-grain").attr("x", "0%").attr("y", "0%").attr("width", "100%").attr("height", "100%").attr("color-interpolation-filters", "sRGB");
    grain.append("feTurbulence").attr("type", "fractalNoise").attr("baseFrequency", "0.9").attr("numOctaves", 2).attr("seed", 11).attr("stitchTiles", "stitch").attr("result", "fine");
    grain.append("feTurbulence").attr("type", "fractalNoise").attr("baseFrequency", "0.006 0.05").attr("numOctaves", 2).attr("seed", 4).attr("stitchTiles", "stitch").attr("result", "fibre");
    grain.append("feBlend").attr("in", "fine").attr("in2", "fibre").attr("mode", "screen").attr("result", "noise");
    grain.append("feColorMatrix").attr("in", "noise").attr("type", "saturate").attr("values", "0").attr("result", "gray");
    const ct = grain.append("feComponentTransfer").attr("in", "gray").attr("result", "tex");
    ct.append("feFuncR").attr("type", "linear").attr("slope", 0.22).attr("intercept", 0.8);
    ct.append("feFuncG").attr("type", "linear").attr("slope", 0.22).attr("intercept", 0.8);
    ct.append("feFuncB").attr("type", "linear").attr("slope", 0.22).attr("intercept", 0.8);
    ct.append("feFuncA").attr("type", "table").attr("tableValues", "1 1");
    grain.append("feBlend").attr("in", "SourceGraphic").attr("in2", "tex").attr("mode", "multiply");
    const vignette = defs.append("radialGradient").attr("id", "paper-vignette").attr("cx", "50%").attr("cy", "50%").attr("r", "72%");
    vignette.append("stop").attr("offset", "55%").attr("stop-color", "#000").attr("stop-opacity", 0);
    vignette.append("stop").attr("offset", "100%").attr("stop-color", "#4a3a1c").attr("stop-opacity", 0.22);
  }
  function drawPaper(root2, W2, H2) {
    root2.append("rect").attr("class", "paper").attr("width", W2).attr("height", H2).attr("filter", "url(#paper-grain)");
  }
  function drawPaperOverlay(root2, W2, H2) {
    root2.append("rect").attr("class", "paper-overlay").attr("width", W2).attr("height", H2).attr("filter", "url(#paper-grain)");
    root2.append("rect").attr("class", "paper-vignette").attr("width", W2).attr("height", H2).attr("fill", "url(#paper-vignette)");
  }

  // src/render/labels.js
  function drawStageLabels(layer, defs, stage2, path) {
    (stage2.labels ?? []).forEach((l, i) => {
      const span = l.span ?? (l.kind === "water" ? 50 : 70);
      const arc = { type: "LineString", coordinates: range(l.lon - span / 2, l.lon + span / 2 + 1e-6, 0.5).map((x) => [x, l.lat]) };
      const id2 = `stage-label-${stage2.id}-${i}`;
      defs.append("path").attr("id", id2).attr("d", path(arc));
      layer.append("text").attr("class", `label ${l.kind}`).append("textPath").attr("href", `#${id2}`).attr("startOffset", "50%").attr("text-anchor", "middle").text(l.text);
    });
  }
  function largestPolygon(f) {
    const g = f.geometry;
    if (g.type === "Polygon") return g;
    let best = null, bestArea = -1;
    for (const coords of g.coordinates) {
      const poly = { type: "Polygon", coordinates: coords };
      const a = area_default(poly);
      if (a > bestArea) {
        bestArea = a;
        best = poly;
      }
    }
    return best;
  }
  function polityLabelData(features, path) {
    const best = /* @__PURE__ */ new Map();
    for (const f of features) {
      const poly = largestPolygon(f);
      if (!poly) continue;
      const [[bx0, by0], [bx1, by1]] = path.bounds(poly);
      const w = bx1 - bx0, h = by1 - by0;
      if (!(w > 70 && h > 24)) continue;
      const [cx, cy] = path.centroid(poly);
      if (!Number.isFinite(cx)) continue;
      const text = f.properties.cls?.label ?? f.properties.name;
      const area = w * h;
      const prev = best.get(text);
      if (prev && prev.area >= area) continue;
      const size = Math.max(13, Math.min(24, Math.sqrt(area) / 16));
      best.set(text, { id: text, text, x: cx, y: cy, size, area });
    }
    return [...best.values()];
  }
  function drawPolityLabels(layer, data) {
    layer.selectAll("text").data(data, (d) => d.id).join("text").attr("class", "label polity").attr("x", (d) => d.x).attr("y", (d) => d.y).attr("font-size", (d) => d.size).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text((d) => d.text);
  }

  // src/render/cartouche.js
  function scaleBar(projection2, center, targetPx = 170) {
    const [lon, lat] = center;
    const p1 = projection2([lon, lat]), p2 = projection2([lon + 1, lat]);
    if (!p1 || !p2) return { km: 1e3, px: targetPx };
    const kmPerDeg = distance_default([lon, lat], [lon + 1, lat]) * 6371;
    const pxPerKm = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / kmPerDeg;
    const km = [100, 200, 250, 500, 1e3, 2e3, 3e3, 5e3].reduce((b, k) => Math.abs(k * pxPerKm - targetPx) < Math.abs(b * pxPerKm - targetPx) ? k : b);
    return { km, px: km * pxPerKm };
  }
  function createCartouche(root2, { x0: x05, y1: y12 }, stage2, projection2) {
    const W2 = 380, H2 = 128, PAD = 16;
    const x = x05 + 22, y = y12 - 22 - H2;
    const g = root2.append("g").attr("class", "cartouche").attr("transform", `translate(${x},${y})`);
    g.append("rect").attr("class", "cartouche-box").attr("width", W2).attr("height", H2);
    const b = 12, o = 5;
    const corners = [[-o, -o, 1, 1], [W2 + o, -o, -1, 1], [-o, H2 + o, 1, -1], [W2 + o, H2 + o, -1, -1]];
    g.selectAll("path.bracket").data(corners).join("path").attr("class", "bracket").attr("d", ([cx, cy, sx, sy]) => `M${cx + sx * b},${cy}L${cx},${cy}L${cx},${cy + sy * b}`);
    g.append("text").attr("class", "wordmark").attr("x", PAD).attr("y", PAD + 12).text("PARCHMENT");
    g.append("line").attr("class", "rule").attr("x1", PAD).attr("x2", W2 - PAD).attr("y1", PAD + 20).attr("y2", PAD + 20);
    const title = g.append("text").attr("class", "map-title").attr("x", PAD).attr("y", PAD + 46).text(stage2.title);
    const year = g.append("text").attr("class", "year").attr("x", W2 - PAD).attr("y", PAD + 48).attr("text-anchor", "end");
    const baseNote = g.append("text").attr("class", "base-note").attr("x", W2 - PAD).attr("y", PAD + 64).attr("text-anchor", "end");
    const e = stage2.extent;
    const { km, px } = scaleBar(projection2, [(e.west + e.east) / 2, (e.south + e.north) / 2]);
    const sb = g.append("g").attr("class", "scalebar").attr("transform", `translate(${PAD},${H2 - PAD - 10})`);
    sb.append("line").attr("x1", 0).attr("x2", px).attr("y1", 0).attr("y2", 0);
    sb.selectAll("line.tick").data([0, px / 2, px]).join("line").attr("class", "tick").attr("x1", (d) => d).attr("x2", (d) => d).attr("y1", -5).attr("y2", 0);
    sb.append("rect").attr("x", 0).attr("y", -3).attr("width", px / 2).attr("height", 3);
    sb.append("text").attr("x", px + 8).attr("y", 1).text(`${km.toLocaleString("en-US")} km`);
    return {
      setTitle(text) {
        title.text(text);
      },
      setYear(y2, sourceYear) {
        year.classed("range", false).text(y2 < 0 ? `${-y2} BCE` : y2);
        baseNote.text(sourceYear != null && sourceYear !== y2 ? `base map ${sourceYear}` : "");
      },
      // Diff: "1450 → 1750" with the base maps that stood in for either year.
      setRange(a, b2) {
        year.classed("range", true).text(`${a.year} \u2192 ${b2.year}`);
        const notes = [];
        if (a.sourceYear != null && a.sourceYear !== a.year) notes.push(`${a.year} from ${a.sourceYear}`);
        if (b2.sourceYear != null && b2.sourceYear !== b2.year) notes.push(`${b2.year} from ${b2.sourceYear}`);
        baseNote.text(notes.length ? `base maps: ${notes.join(" \xB7 ")}` : "");
      }
    };
  }

  // src/render/strip.js
  function createStrip(root2, { x0: x05, x1: x12, y1: y12 }, stage2, years, onYear) {
    const [a, b] = stage2.span;
    const x = linear2().domain([a, b]).range([x05, x12]);
    const g = root2.append("g").attr("class", "strip");
    g.append("line").attr("class", "baseline").attr("x1", x05).attr("x2", x12).attr("y1", y12).attr("y2", y12);
    const minor = range(Math.ceil(a / 50) * 50, b + 1, 50);
    g.selectAll("line.tick").data(minor).join("line").attr("class", (d) => `tick ${d % 100 === 0 ? "major" : "minor"}`).attr("x1", (d) => x(d)).attr("x2", (d) => x(d)).attr("y1", y12).attr("y2", (d) => y12 + (d % 100 === 0 ? 10 : 5));
    const tickLabels = g.selectAll("text.tick-label").data(minor.filter((d) => d % 100 === 0)).join("text").attr("class", "tick-label").attr("x", (d) => x(d)).attr("y", y12 + 26).attr("text-anchor", "middle").text((d) => d < 0 ? `${-d} BCE` : d);
    g.selectAll("circle.snapshot").data(years).join("circle").attr("class", "snapshot").attr("cx", (d) => x(d)).attr("cy", y12).attr("r", 5).on("click", (_, d) => onYear && onYear(d)).append("title").text((d) => `Show ${d}`);
    const range2 = g.append("line").attr("class", "range hidden").attr("y1", y12).attr("y2", y12);
    const markerA = g.append("g").attr("class", "marker start hidden");
    markerA.append("path").attr("d", "M0,-9L8,0L0,9L-8,0Z");
    const markerALabel = markerA.append("text").attr("y", 30).attr("text-anchor", "middle");
    const marker = g.append("g").attr("class", "marker");
    marker.append("path").attr("d", "M0,-9L8,0L0,9L-8,0Z");
    const markerLabel = marker.append("text").attr("y", 30).attr("text-anchor", "middle");
    const hideNear = (...ys) => tickLabels.classed("hidden", (d) => ys.some((y) => Math.abs(x(d) - x(y)) < 34));
    return {
      setYear(year) {
        marker.attr("transform", `translate(${x(year)},${y12})`);
        markerLabel.text(year);
        range2.classed("hidden", true);
        markerA.classed("hidden", true);
        hideNear(year);
      },
      setRange(a2, b2) {
        marker.attr("transform", `translate(${x(b2)},${y12})`);
        markerLabel.text(b2);
        markerA.attr("transform", `translate(${x(a2)},${y12})`).classed("hidden", false);
        markerALabel.text(a2);
        range2.attr("x1", x(Math.min(a2, b2))).attr("x2", x(Math.max(a2, b2))).classed("hidden", false);
        hideNear(a2, b2);
      }
    };
  }

  // src/render/legend.js
  function createLegend(root2, { x1: x12, y0: y05 }) {
    const W2 = 236, PAD = 14, ROW = 22;
    const g = root2.append("g").attr("class", "legend");
    const box = g.append("rect").attr("class", "legend-box").attr("width", W2);
    const title = g.append("text").attr("class", "legend-title").attr("x", PAD).attr("y", PAD + 10);
    const rows = g.append("g").attr("transform", `translate(${PAD},${PAD + 26})`);
    let height = 0;
    function set3(tracker) {
      const entries = tracker.legend ?? [];
      title.text(tracker.title ?? tracker.id);
      const H2 = PAD * 2 + 26 + entries.length * ROW;
      height = H2;
      box.attr("height", H2);
      g.attr("transform", `translate(${x12 - 22 - W2},${y05 + 22})`);
      const r = rows.selectAll("g.row").data(entries).join("g").attr("class", "row").attr("transform", (_, i) => `translate(0,${i * ROW})`);
      r.selectAll("*").remove();
      r.each(function(e) {
        const row = select_default2(this);
        if (e.swatch === "fill") {
          row.append("rect").attr("class", `swatch fill-${e.key}`).attr("x", 0).attr("y", 0).attr("width", 22).attr("height", 14);
        } else if (e.swatch === "hatch") {
          row.append("rect").attr("class", "swatch hatch").attr("x", 0).attr("y", 0).attr("width", 22).attr("height", 14);
        } else if (e.swatch === "line") {
          row.append("line").attr("class", `swatch-line ${e.style}`).attr("x1", 0).attr("x2", 22).attr("y1", 7).attr("y2", 7);
        } else if (e.swatch === "shape") {
          row.append("path").attr("class", `mark ${e.shape}`).attr("transform", "translate(11,7)").attr("d", SHAPES[e.shape] ?? SHAPES.circle);
        }
        row.append("text").attr("x", 32).attr("y", 11).text(e.label);
      });
    }
    return { set: set3, height: () => height };
  }
  var SHAPES = {
    "rust-diamond": "M0,-7L7,0L0,7L-7,0Z",
    "moss-circle": "M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z",
    "navy-square": "M-6,-6H6V6H-6Z",
    "navy-triangle": "M0,-7L7,6H-7Z",
    circle: "M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z"
  };

  // src/render/difflist.js
  function createDiffList(root2, { x1: x12, y0: y05 }) {
    const W2 = 236, PAD = 14, ROW = 17, MAX = 7;
    const g = root2.append("g").attr("class", "difflist hidden");
    const box = g.append("rect").attr("class", "difflist-box").attr("width", W2);
    const body = g.append("g").attr("transform", `translate(${PAD},${PAD})`);
    function section(y, title, items, small, cls) {
      body.append("text").attr("class", `difflist-head ${cls}`).attr("x", 0).attr("y", y + 10).text(`${title} \xB7 ${items.length + small}`);
      y += ROW + 2;
      const shown = items.slice(0, MAX);
      for (const it of shown) {
        body.append("text").attr("class", `difflist-item ${cls}`).attr("x", 10).attr("y", y + 10).text(it.label);
        y += ROW;
      }
      const rest = items.length - shown.length + small;
      if (rest > 0) {
        body.append("text").attr("class", "difflist-more").attr("x", 10).attr("y", y + 10).text(`and ${rest} smaller`);
        y += ROW;
      }
      return y + 8;
    }
    return {
      set(diff, top) {
        body.selectAll("*").remove();
        let y = 0;
        y = section(y, "Appeared", diff.appeared, diff.small.appeared, "appeared");
        y = section(y, "Vanished", diff.vanished, diff.small.vanished, "vanished");
        y = section(y, "Persisted", diff.persisted, diff.small.persisted, "persisted");
        box.attr("height", y + PAD);
        g.attr("transform", `translate(${x12 - 22 - W2},${top})`).classed("hidden", false);
      },
      hide() {
        g.classed("hidden", true);
      }
    };
  }

  // src/views/diff.js
  var KM2_PER_SR = 6371 * 6371;
  function boundsIntersect([[ax0, ay0], [ax1, ay1]], { x0: x05, y0: y05, x1: x12, y1: y12 }) {
    return ax1 >= x05 && ax0 <= x12 && ay1 >= y05 && ay0 <= y12;
  }
  var areaCache = /* @__PURE__ */ new WeakMap();
  var boundsCache = /* @__PURE__ */ new WeakMap();
  var areaOf = (f) => {
    let a = areaCache.get(f);
    if (a === void 0) {
      a = area_default(f);
      areaCache.set(f, a);
    }
    return a;
  };
  var boundsOf = (f, path) => {
    let b = boundsCache.get(f);
    if (b === void 0) {
      b = path.bounds(f);
      boundsCache.set(f, b);
    }
    return b;
  };
  function groupByIdentity(features, year, identify, path, frame2) {
    const groups = /* @__PURE__ */ new Map();
    for (const f of features) {
      const id2 = identify(f, year);
      if (!id2) continue;
      const { key, label } = id2;
      let g = groups.get(key);
      if (!g) {
        g = { key, label, area: 0, features: [], visible: false };
        groups.set(key, g);
      }
      g.area += areaOf(f);
      g.features.push(f);
      if (!g.visible && boundsIntersect(boundsOf(f, path), frame2)) g.visible = true;
    }
    return groups;
  }
  function computeDiff({ aFeatures, aYear, bFeatures, bYear, identify, path, frame: frame2, minKm2 = 12e4 }) {
    const A = groupByIdentity(aFeatures, aYear, identify, path, frame2);
    const B = groupByIdentity(bFeatures, bYear, identify, path, frame2);
    const minSr = minKm2 / KM2_PER_SR;
    const out = { appeared: [], vanished: [], persisted: [], small: { appeared: 0, vanished: 0, persisted: 0 } };
    const push = (bucket, item) => {
      if (!item.visible) return;
      item.km2 = Math.round(item.area * KM2_PER_SR);
      if (item.area < minSr) {
        out.small[bucket]++;
        return;
      }
      out[bucket].push(item);
    };
    for (const [key, gb] of B) {
      const ga = A.get(key);
      if (ga) push("persisted", { key, label: gb.label, area: Math.max(ga.area, gb.area), visible: ga.visible || gb.visible, a: ga.features, b: gb.features });
      else push("appeared", { key, label: gb.label, area: gb.area, visible: gb.visible, b: gb.features });
    }
    for (const [key, ga] of A) {
      if (!B.has(key)) push("vanished", { key, label: ga.label, area: ga.area, visible: ga.visible, a: ga.features });
    }
    for (const k of ["appeared", "vanished", "persisted"]) out[k].sort((p, q) => q.area - p.area);
    return out;
  }

  // src/render/base.js
  var CROSSFADE_MS = 300;
  var DIFF_LEGEND = {
    title: "Continuity and change",
    legend: [
      { swatch: "fill", key: "focus", label: "Appeared" },
      { swatch: "hatch", label: "Vanished" },
      { swatch: "line", style: "solid", label: "Persisted (border)" }
    ]
  };
  var W = 1920;
  var H = 1080;
  var FRAME = { left: 32, right: 32, top: 32, bottom: 64 };
  var PROJECTIONS = {
    equalEarth: () => equalEarth_default(),
    lambertAzimuthalEqualArea: () => azimuthalEqualArea_default(),
    albersUsa: () => albersUsa_default()
  };
  function extentPolygon({ west, south, east, north }, step = 1) {
    const ring = [];
    for (let x = west; x < east; x += step) ring.push([x, north]);
    for (let y = north; y > south; y -= step) ring.push([east, y]);
    for (let x = east; x > west; x -= step) ring.push([x, south]);
    for (let y = south; y < north; y += step) ring.push([west, y]);
    ring.push(ring[0]);
    return { type: "Polygon", coordinates: [ring] };
  }
  function makeProjection(stage2, inner) {
    const make = PROJECTIONS[stage2.projection];
    if (!make) throw new Error(`Unknown projection ${stage2.projection}`);
    const proj = make();
    if (stage2.rotate && proj.rotate) proj.rotate(stage2.rotate);
    proj.fitExtent(inner, extentPolygon(stage2.extent));
    return proj;
  }
  function createStage(svg, stage2, layers, { tracker, years = [], onYear } = {}) {
    const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
    const [[x05, y05], [x12, y12]] = inner;
    const frame2 = { x0: x05, y0: y05, x1: x12, y1: y12 };
    const projection2 = makeProjection(stage2, inner);
    const path = path_default(projection2);
    const cache2 = /* @__PURE__ */ new WeakMap();
    const d = (f) => {
      let s = cache2.get(f);
      if (s === void 0) {
        s = path(f) || "";
        cache2.set(f, s);
      }
      return s;
    };
    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");
    svg.selectAll("*").remove();
    const defs = svg.append("defs");
    paperDefs(defs);
    defs.append("clipPath").attr("id", "frame-clip").append("rect").attr("x", x05).attr("y", y05).attr("width", x12 - x05).attr("height", y12 - y05);
    const root2 = svg.append("g").attr("class", "stage");
    drawPaper(root2, W, H);
    const map2 = root2.append("g").attr("class", "map").attr("clip-path", "url(#frame-clip)");
    map2.append("path").attr("class", "ocean").attr("d", d({ type: "Sphere" }));
    const bathy = feature_default(layers.bathy, layers.bathy.objects.bathymetry);
    map2.append("g").attr("class", "bathymetry").selectAll("path").data(bathy.features).join("path").attr("d", d);
    const ne = layers.ne;
    const land = feature_default(ne, ne.objects.land);
    map2.append("path").attr("class", "land").attr("d", d(land));
    if (stage2.relief) {
      defs.append("clipPath").attr("id", "land-clip").append("path").attr("d", d(land));
      map2.append("image").attr("class", "relief").attr("clip-path", "url(#land-clip)").attr("x", x05).attr("y", y05).attr("width", x12 - x05).attr("height", y12 - y05).attr("preserveAspectRatio", "none").attr("href", assetURL(`assets/${stage2.relief}`));
    }
    defs.append("pattern").attr("id", "hatch-rust").attr("patternUnits", "userSpaceOnUse").attr("width", 9).attr("height", 9).attr("patternTransform", "rotate(45)").append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 9).attr("class", "hatch-line");
    const snapshots = map2.append("g").attr("class", "snapshots");
    const rivers = feature_default(ne, ne.objects.rivers);
    map2.append("g").attr("class", "rivers").selectAll("path").data(rivers.features.filter((f) => (f.properties.scalerank ?? 0) <= 7)).join("path").attr("d", d);
    const lakes = feature_default(ne, ne.objects.lakes);
    map2.append("path").attr("class", "lakes").attr("d", d(lakes));
    map2.append("path").attr("class", "coastline").attr("d", d(feature_default(ne, ne.objects.coastline)));
    map2.append("path").attr("class", "graticule").attr("d", d(graticule10()));
    drawStageLabels(map2.append("g").attr("class", "stage-labels"), defs, stage2, path);
    const labelLayers = map2.append("g").attr("class", "polity-labels");
    drawPaperOverlay(root2, W, H);
    root2.append("path").attr("class", "frame").attr("d", `M${x05},${y12}L${x05},${y05}L${x12},${y05}L${x12},${y12}`);
    const legend = createLegend(root2, frame2);
    if (tracker) legend.set(tracker);
    const diffList = createDiffList(root2, frame2);
    const cartouche = createCartouche(root2, frame2, stage2, projection2);
    const strip = createStrip(root2, frame2, stage2, years, onYear);
    let currentYear = null;
    function crossfade(build) {
      const g = snapshots.append("g").attr("class", "snap").style("opacity", 0);
      const lg = labelLayers.append("g").attr("class", "snap-labels").style("opacity", 0);
      build(g, lg);
      snapshots.selectAll("g.snap").filter(function() {
        return this !== g.node();
      }).transition().duration(CROSSFADE_MS).style("opacity", 0).remove();
      labelLayers.selectAll("g.snap-labels").filter(function() {
        return this !== lg.node();
      }).transition().duration(CROSSFADE_MS).style("opacity", 0).remove();
      g.transition().duration(CROSSFADE_MS).style("opacity", 1);
      lg.transition().duration(CROSSFADE_MS).style("opacity", 1);
    }
    const namedCache = /* @__PURE__ */ new WeakMap(), interiorCache = /* @__PURE__ */ new WeakMap();
    const namedOf = (topo) => {
      let v = namedCache.get(topo);
      if (!v) {
        v = feature_default(topo, topo.objects.polities).features.filter((f) => f.properties.id);
        namedCache.set(topo, v);
      }
      return v;
    };
    const interiorOf = (topo) => {
      let v = interiorCache.get(topo);
      if (!v) {
        v = mesh_default(topo, topo.objects.polities, (a, b) => a !== b);
        interiorCache.set(topo, v);
      }
      return v;
    };
    function showSnapshot(year, topo, classify = () => ({ status: "muted" })) {
      const named2 = namedOf(topo);
      for (const f of named2) f.properties.cls = classify(f, year);
      const certainty = named2[0]?.properties.certainty ?? "approximate";
      crossfade((g, lg) => {
        g.append("g").attr("class", "polities").selectAll("path").data(named2).join("path").attr("class", (f) => `polity ${f.properties.certainty} ${f.properties.cls.status}`).attr("d", d).append("title").text((f) => f.properties.cls.label ?? f.properties.name);
        g.append("path").attr("class", `border ${certainty}`).attr("d", d(interiorOf(topo)));
        drawPolityLabels(lg, polityLabelData(named2.filter((f) => f.properties.cls.status === "highlight"), path));
      });
      if (tracker) legend.set(tracker);
      diffList.hide();
      currentYear = year;
    }
    function showDiff(a, b, identify) {
      const aNamed = namedOf(a.topo), bNamed = namedOf(b.topo);
      const diff = computeDiff({ aFeatures: aNamed, aYear: a.year, bFeatures: bNamed, bYear: b.year, identify, path, frame: frame2, minKm2: stage2.diff_min_km2 ?? 12e4 });
      const appeared = diff.appeared.flatMap((it) => it.b.map((f) => ({ f, label: it.label, key: it.key })));
      const vanished = diff.vanished.flatMap((it) => it.a.map((f) => ({ f, label: it.label, key: it.key })));
      const certainty = bNamed[0]?.properties.certainty ?? "approximate";
      crossfade((g, lg) => {
        g.append("g").attr("class", "polities").selectAll("path").data(bNamed).join("path").attr("class", (f) => `polity ${f.properties.certainty} muted`).attr("d", d).append("title").text((f) => f.properties.name);
        g.append("path").attr("class", `border ${certainty}`).attr("d", d(interiorOf(b.topo)));
        g.append("g").attr("class", "appeared").selectAll("path").data(appeared).join("path").attr("class", "polity appeared").attr("d", (x) => d(x.f)).append("title").text((x) => `${x.label} \u2014 appeared by ${b.year}`);
        g.append("g").attr("class", "vanished").selectAll("path").data(vanished).join("path").attr("class", "polity vanished").attr("d", (x) => d(x.f)).append("title").text((x) => `${x.label} \u2014 gone by ${b.year}`);
        const labelled = (items, cls) => polityLabelData(items.map((x) => {
          x.f.properties.cls = { label: x.label };
          return x.f;
        }), path).map((l) => ({ ...l, cls }));
        drawPolityLabels(lg, [...labelled(appeared, "appeared"), ...labelled(vanished, "vanished")]);
        lg.selectAll("text").attr("class", (l) => `label polity ${l.cls ?? ""}`);
      });
      legend.set({ ...DIFF_LEGEND, title: `Change ${a.year} \u2192 ${b.year}` });
      diffList.set(diff, y05 + 22 + legend.height() + 14);
      currentYear = b.year;
      return diff;
    }
    function setYear(year, sourceYear) {
      cartouche.setYear(year, sourceYear);
      strip.setYear(year);
    }
    function setRange(a, b) {
      cartouche.setRange(a, b);
      strip.setRange(a.year, b.year);
    }
    return { projection: projection2, path, d, frame: frame2, showSnapshot, showDiff, setYear, setRange, legend, cartouche, get year() {
      return currentYear;
    } };
  }

  // src/export/export.js
  var SVG_NS = "http://www.w3.org/2000/svg";
  var dataURLs = /* @__PURE__ */ new Map();
  function toDataURL(url) {
    if (url.startsWith("data:")) return Promise.resolve(url);
    if (!dataURLs.has(url)) {
      dataURLs.set(url, fetch(url).then(async (res) => {
        if (!res.ok) throw new Error(`Could not fetch ${url} (HTTP ${res.status})`);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = () => reject(r.error);
          r.readAsDataURL(blob);
        });
      }));
    }
    return dataURLs.get(url);
  }
  async function inlineUrls(cssText, base) {
    const parts = [];
    const re2 = /url\((['"]?)([^'")]+)\1\)/g;
    let last = 0, m;
    while (m = re2.exec(cssText)) {
      parts.push(cssText.slice(last, m.index));
      const abs3 = new URL(m[2], base).href;
      parts.push(`url("${await toDataURL(abs3)}")`);
      last = m.index + m[0].length;
    }
    parts.push(cssText.slice(last));
    return parts.join("");
  }
  async function collectCSS() {
    const out = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      const base = sheet.href || location.href;
      for (const rule of rules) {
        out.push(rule instanceof CSSFontFaceRule ? await inlineUrls(rule.cssText, base) : rule.cssText);
      }
    }
    return out.join("\n");
  }
  async function snapshotSVG(svgNode2, { transparent = false } = {}) {
    const clone = svgNode2.cloneNode(true);
    clone.setAttribute("xmlns", SVG_NS);
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", W);
    clone.setAttribute("height", H);
    clone.removeAttribute("style");
    for (const sel of ["g.snapshots > g.snap", "g.polity-labels > g.snap-labels"]) {
      const layers = clone.querySelectorAll(sel);
      layers.forEach((g, i) => {
        if (i < layers.length - 1) g.remove();
        else g.style.opacity = 1;
      });
    }
    if (transparent) clone.querySelectorAll(".paper, .paper-overlay, .paper-vignette").forEach((e) => e.remove());
    for (const img of clone.querySelectorAll("image")) {
      const href = img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (href) img.setAttribute("href", await toDataURL(new URL(href, location.href).href));
    }
    const style = document.createElementNS(SVG_NS, "style");
    style.textContent = await collectCSS();
    clone.insertBefore(style, clone.firstChild);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("The map image could not be rendered for export."));
      img.src = url;
    });
  }
  async function renderPNG(svgNode2, { width = 1920, height = 1080, transparent = false } = {}) {
    const xml = await snapshotSVG(svgNode2, { transparent });
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const s = Math.min(width / W, height / H);
      const dw = W * s, dh = H * s;
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("The browser could not encode the PNG.");
      return blob;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  async function renderSVG(svgNode2, { transparent = false } = {}) {
    const xml = await snapshotSVG(svgNode2, { transparent });
    return new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  }
  function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1e4);
  }
  function exportName({ stage: stage2, year, from = null, size = "", ext }) {
    const span = from != null ? `${from}-${year}` : `${year}`;
    return `parchment-${stage2}-${span}${size ? `-${size}` : ""}.${ext}`;
  }

  // src/stages/afro-eurasia.json
  var afro_eurasia_default = {
    id: "afro-eurasia",
    title: "Afro-Eurasia",
    projection: "equalEarth",
    rotate: [
      -60,
      0
    ],
    extent: {
      west: -20,
      south: 6,
      east: 150,
      north: 76
    },
    span: [
      1200,
      2e3
    ],
    relief: "relief/afro-eurasia.png",
    labels: [
      {
        text: "Europe",
        lon: 14,
        lat: 52,
        kind: "region"
      },
      {
        text: "North Africa",
        lon: 12,
        lat: 26,
        kind: "region"
      },
      {
        text: "West Africa",
        lon: 17,
        lat: 11,
        kind: "region"
      },
      {
        text: "Middle East",
        lon: 43,
        lat: 26.5,
        kind: "region"
      },
      {
        text: "Central Asia",
        lon: 66,
        lat: 45,
        kind: "region"
      },
      {
        text: "South Asia",
        lon: 77,
        lat: 17,
        kind: "region"
      },
      {
        text: "East Asia",
        lon: 120,
        lat: 44,
        kind: "region"
      },
      {
        text: "Southeast Asia",
        lon: 111,
        lat: 9,
        kind: "region"
      },
      {
        text: "Siberia",
        lon: 92,
        lat: 69,
        kind: "region"
      },
      {
        text: "Mediterranean Sea",
        lon: 18,
        lat: 35,
        kind: "water"
      },
      {
        text: "Indian Ocean",
        lon: 75,
        lat: 3.5,
        kind: "water"
      },
      {
        text: "Arabian Sea",
        lon: 64,
        lat: 12,
        kind: "water"
      },
      {
        text: "Bay of Bengal",
        lon: 89,
        lat: 11.5,
        kind: "water"
      },
      {
        text: "South China Sea",
        lon: 115,
        lat: 16,
        kind: "water"
      },
      {
        text: "Black Sea",
        lon: 34,
        lat: 43.5,
        kind: "water"
      },
      {
        text: "Caspian Sea",
        lon: 51,
        lat: 41.5,
        kind: "water"
      },
      {
        text: "Red Sea",
        lon: 38,
        lat: 20,
        kind: "water"
      },
      {
        text: "Atlantic Ocean",
        lon: -16,
        lat: 36,
        kind: "water"
      }
    ],
    diff_min_km2: 12e4
  };

  // src/stages/afro-eurasia-lambert.json
  var afro_eurasia_lambert_default = {
    id: "afro-eurasia-lambert",
    title: "Afro-Eurasia (azimuthal)",
    projection: "lambertAzimuthalEqualArea",
    rotate: [
      -60,
      -45
    ],
    extent: {
      west: -20,
      south: 6,
      east: 150,
      north: 76
    },
    span: [
      1200,
      2e3
    ],
    relief: "relief/afro-eurasia-lambert.png",
    labels: [
      {
        text: "Europe",
        lon: 15,
        lat: 50,
        kind: "region"
      },
      {
        text: "North Africa",
        lon: 10,
        lat: 27,
        kind: "region"
      },
      {
        text: "West Africa",
        lon: -2,
        lat: 13,
        kind: "region"
      },
      {
        text: "Middle East",
        lon: 44,
        lat: 29,
        kind: "region"
      },
      {
        text: "Central Asia",
        lon: 66,
        lat: 44,
        kind: "region"
      },
      {
        text: "South Asia",
        lon: 78,
        lat: 22,
        kind: "region"
      },
      {
        text: "East Asia",
        lon: 112,
        lat: 36,
        kind: "region"
      },
      {
        text: "Southeast Asia",
        lon: 104,
        lat: 12,
        kind: "region"
      },
      {
        text: "Siberia",
        lon: 100,
        lat: 64,
        kind: "region"
      },
      {
        text: "Mediterranean Sea",
        lon: 17,
        lat: 35.5,
        kind: "water"
      },
      {
        text: "Indian Ocean",
        lon: 75,
        lat: 5,
        kind: "water"
      },
      {
        text: "Arabian Sea",
        lon: 63,
        lat: 15,
        kind: "water"
      },
      {
        text: "Bay of Bengal",
        lon: 88,
        lat: 13,
        kind: "water"
      },
      {
        text: "South China Sea",
        lon: 114,
        lat: 15,
        kind: "water"
      },
      {
        text: "Black Sea",
        lon: 34,
        lat: 43.5,
        kind: "water"
      },
      {
        text: "Caspian Sea",
        lon: 50.5,
        lat: 41.5,
        kind: "water"
      },
      {
        text: "Red Sea",
        lon: 38,
        lat: 20,
        kind: "water"
      },
      {
        text: "Atlantic Ocean",
        lon: -14,
        lat: 38,
        kind: "water"
      }
    ],
    diff_min_km2: 12e4
  };

  // src/trackers/extent.json
  var extent_default = {
    _comment: "Extent tracker (v0). Which downloaded base polygons are highlighted, by the NAME the base map gives them in each era, bounded by start/end years. The polygons themselves are never edited. Rows in data/records.csv with tracker=extent can add to or override this list.",
    title: "Extent of states",
    fill_key: "P",
    legend: [
      {
        swatch: "fill",
        key: "P",
        label: "Highlighted state"
      },
      {
        swatch: "line",
        style: "solid",
        label: "Documented border"
      },
      {
        swatch: "line",
        style: "dashed",
        label: "Approximate border"
      }
    ],
    highlights: [
      {
        id: "ottoman",
        label: "Ottoman Empire",
        start: 1299,
        end: 1922,
        names: [
          "Ottoman Empire"
        ]
      },
      {
        id: "safavid",
        label: "Safavid Empire",
        start: 1501,
        end: 1736,
        names: [
          "Safavid Empire"
        ]
      },
      {
        id: "mughal",
        label: "Mughal Empire",
        start: 1526,
        end: 1857,
        names: [
          "Mughal Empire"
        ]
      },
      {
        id: "ming",
        label: "Ming China",
        start: 1368,
        end: 1644,
        names: [
          "Ming Empire",
          "Ming Chinese Empire"
        ]
      },
      {
        id: "qing",
        label: "Qing China",
        start: 1644,
        end: 1912,
        names: [
          "Manchu Empire",
          "Qing Empire",
          "Qing Dynasty"
        ]
      },
      {
        id: "songhai",
        label: "Songhai Empire",
        start: 1464,
        end: 1591,
        names: [
          "Songhai",
          "Songhai Empire"
        ]
      },
      {
        id: "morocco",
        label: "Morocco",
        start: 1450,
        end: 2e3,
        names: [
          "Morocco",
          "Wattasid Caliphate",
          "Watassid Morocco",
          "Saadi Morocco",
          "Saadi Sultanate",
          "Alaouite Morocco"
        ]
      },
      {
        id: "russia",
        label: "Russia",
        start: 1450,
        end: 2e3,
        names: [
          "Grand Duchy of Moscow",
          "Tsardom of Muscovy",
          "Tsardom of Russia",
          "Russian Empire",
          "Russia"
        ]
      },
      {
        id: "tokugawa",
        label: "Tokugawa Japan",
        start: 1603,
        end: 1868,
        names: [
          "Tokugawa shogunate",
          "Tokugawa Shogunate"
        ]
      }
    ]
  };

  // src/main.js
  var params = new URLSearchParams(location.search);
  var START_YEAR = Number(params.get("year")) || 1450;
  var START_FROM = Number(params.get("from")) || null;
  var PLAY_HOLD_MS = 1500;
  var STAGES = { [afro_eurasia_default.id]: afro_eurasia_default, [afro_eurasia_lambert_default.id]: afro_eurasia_lambert_default };
  var stage = STAGES[params.get("stage")] ?? afro_eurasia_default;
  var byName = /* @__PURE__ */ new Map();
  for (const h of extent_default.highlights) for (const n of h.names) byName.set(n, h);
  function matchHighlight(f, year) {
    const h = byName.get(f.properties.name);
    return h && year >= h.start && year <= h.end ? h : null;
  }
  function classifyExtent(f, year) {
    const h = matchHighlight(f, year);
    return h ? { status: "highlight", key: h.id, label: h.label } : { status: "muted" };
  }
  function identifyFor(scope) {
    return (f, year) => {
      const h = matchHighlight(f, year);
      if (h) return { key: `h:${h.id}`, label: h.label };
      return scope === "all" ? { key: `n:${f.properties.name}`, label: f.properties.name } : null;
    };
  }
  async function main() {
    const t0 = performance.now();
    const [calendar, ne, bathy] = await Promise.all([
      loadJSON("data/calendar.json"),
      loadJSON("data/base/derived/ne.topojson"),
      loadJSON("data/base/derived/bathymetry.topojson")
    ]);
    const years = calendar.snapshots.map((s) => s.year);
    const bySnapshot = new Map(calendar.snapshots.map((s) => [s.year, s]));
    const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);
    const state = { mode: "snapshot", scope: params.get("scope") === "all" ? "all" : "tracked", year: START_YEAR, from: START_FROM ?? years[Math.max(0, years.indexOf(START_YEAR) - 1)], playing: null };
    const svg = select_default2("#map");
    const atlas = createStage(svg, stage, { ne, bathy }, { tracker: extent_default, years, onYear: (y) => setYear(y) });
    console.log(`stage built in ${(performance.now() - t0).toFixed(0)} ms`);
    async function render() {
      const t = performance.now();
      if (state.mode === "diff") {
        const [a, b] = await Promise.all([snapshot(state.from), snapshot(state.year)]);
        const diff = atlas.showDiff({ year: state.from, topo: a }, { year: state.year, topo: b }, identifyFor(state.scope));
        atlas.setRange({ year: state.from, sourceYear: bySnapshot.get(state.from).source_year }, { year: state.year, sourceYear: bySnapshot.get(state.year).source_year });
        document.title = `Parchment \xB7 ${state.from} \u2192 ${state.year}`;
        console.log(`diff ${state.from} \u2192 ${state.year}: ${(performance.now() - t).toFixed(1)} ms; appeared ${diff.appeared.length}, vanished ${diff.vanished.length}, persisted ${diff.persisted.length}`);
      } else {
        const topo = await snapshot(state.year);
        atlas.showSnapshot(state.year, topo, classifyExtent);
        atlas.setYear(state.year, bySnapshot.get(state.year).source_year);
        document.title = `Parchment \xB7 ${state.year}`;
        console.log(`snapshot ${state.year}: ${(performance.now() - t).toFixed(1)} ms`);
      }
      document.body.classList.toggle("mode-diff", state.mode === "diff");
      selectAll_default2("#toolbar [data-mode]").classed("active", function() {
        return this.dataset.mode === state.mode;
      });
      selectAll_default2("#years button").classed("active", function() {
        return Number(this.dataset.year) === state.year;
      });
      selectAll_default2("#years-a button").classed("active", function() {
        return Number(this.dataset.year) === state.from;
      });
    }
    function setYear(y) {
      if (years.includes(y)) {
        state.year = y;
        render();
      }
    }
    function setFrom(y) {
      if (years.includes(y)) {
        state.from = y;
        render();
      }
    }
    function setMode(m) {
      state.mode = m;
      if (m === "diff" && state.from === state.year) state.from = years[Math.max(0, years.indexOf(state.year) - 1)];
      render();
    }
    function step(delta) {
      const i = years.indexOf(state.year);
      const j = Math.max(0, Math.min(years.length - 1, i + delta));
      if (j !== i) setYear(years[j]);
      return j !== i;
    }
    function togglePlay() {
      if (state.playing) {
        clearInterval(state.playing);
        state.playing = null;
      } else {
        if (years.indexOf(state.year) === years.length - 1) setYear(years[0]);
        state.playing = setInterval(() => {
          if (!step(1)) togglePlay();
        }, PLAY_HOLD_MS);
      }
      select_default2("#play").classed("active", !!state.playing).text(state.playing ? "\u275A\u275A" : "\u25B6");
    }
    const tb = select_default2("#toolbar").html("");
    const seg = tb.append("span").attr("class", "seg");
    seg.append("button").attr("data-mode", "snapshot").text("Snapshot").on("click", () => setMode("snapshot"));
    seg.append("button").attr("data-mode", "diff").text("Diff").on("click", () => setMode("diff"));
    const ya = tb.append("span").attr("id", "years-a").attr("class", "years");
    ya.append("label").text("from");
    ya.selectAll("button").data(years).join("button").attr("data-year", (y) => y).text((y) => y).on("click", (_, y) => setFrom(y));
    const yb = tb.append("span").attr("id", "years").attr("class", "years");
    yb.append("label").text("to");
    yb.selectAll("button").data(years).join("button").attr("data-year", (y) => y).text((y) => y).on("click", (_, y) => setYear(y));
    const scopeLabel = tb.append("label").attr("id", "scope").attr("title", "Compare every named polygon, not just the tracked states");
    scopeLabel.append("input").attr("type", "checkbox").property("checked", state.scope === "all").on("change", function() {
      state.scope = this.checked ? "all" : "tracked";
      render();
    });
    scopeLabel.append("span").text("all states");
    tb.append("span").attr("class", "sep");
    tb.append("button").attr("id", "play").attr("title", "Play (space)").text("\u25B6").on("click", togglePlay);
    tb.append("span").attr("class", "sep");
    const exportMenu = tb.append("span").attr("class", "menu");
    const exportBtn = exportMenu.append("button").attr("id", "export").attr("title", "Export the current view (E)").text("Export \u25BE").on("click", () => exportMenu.classed("open", !exportMenu.classed("open")));
    const pop = exportMenu.append("span").attr("class", "popover");
    const exportOpts = { transparent: false };
    const describe = () => ({ stage: stage.id, year: state.year, from: state.mode === "diff" ? state.from : null });
    let exporting = false;
    async function doExport(kind) {
      if (exporting) return;
      exporting = true;
      exportMenu.classed("open", false);
      exportBtn.text("Exporting\u2026").attr("disabled", true);
      try {
        const svgNode2 = svg.node();
        const info = describe();
        if (kind === "svg") download(await renderSVG(svgNode2, exportOpts), exportName({ ...info, ext: "svg" }));
        else if (kind === "4k") download(await renderPNG(svgNode2, { width: 3840, height: 2160, ...exportOpts }), exportName({ ...info, size: "4k", ext: "png" }));
        else download(await renderPNG(svgNode2, { width: 1920, height: 1080, ...exportOpts }), exportName({ ...info, ext: "png" }));
      } catch (err) {
        console.error(err);
        select_default2("#problems").classed("hidden", false).text(`Export failed: ${err.message}`);
      } finally {
        exporting = false;
        exportBtn.text("Export \u25BE").attr("disabled", null);
      }
    }
    pop.append("button").text("PNG \xB7 1920 \xD7 1080").on("click", () => doExport("png"));
    pop.append("button").text("PNG \xB7 3840 \xD7 2160").on("click", () => doExport("4k"));
    pop.append("button").text("SVG").on("click", () => doExport("svg"));
    const tr = pop.append("label");
    tr.append("input").attr("type", "checkbox").on("change", function() {
      exportOpts.transparent = this.checked;
    });
    tr.append("span").text("transparent background");
    document.addEventListener("click", (e) => {
      if (!exportMenu.node().contains(e.target)) exportMenu.classed("open", false);
    });
    window.parchment = {
      renderPNG: (opts) => renderPNG(svg.node(), opts),
      renderSVG: (opts) => renderSVG(svg.node(), opts),
      exportName: (opts) => exportName({ ...describe(), ...opts }),
      get state() {
        return { ...state };
      }
    };
    window.addEventListener("keydown", (e) => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "d" || e.key === "D") setMode(state.mode === "diff" ? "snapshot" : "diff");
      else if (e.key === "e" || e.key === "E") doExport(e.shiftKey ? "4k" : "png");
    });
    if (START_FROM) state.mode = "diff";
    await render();
    document.body.classList.add("ready");
    for (const y of years) snapshot(y);
  }
  main().catch((err) => {
    console.error(err);
    select_default2("#problems").classed("hidden", false).text(`Parchment could not start: ${err.message}`);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9hc2NlbmRpbmcuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXNjZW5kaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYmlzZWN0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9udW1iZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3QuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9mc3VtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9tZXJnZS5qcyIsICJub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3JhbmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9zcmMvZGlzcGF0Y2guanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlcy5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY3JlYXRvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2FycmF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yQWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbWF0Y2hlci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9maWx0ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NwYXJzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY29uc3RhbnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdGEuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2pvaW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL21lcmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc29ydC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2FsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL25vZGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NpemUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lYWNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hdHRyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc3R5bGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3Byb3BlcnR5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi90ZXh0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9odG1sLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbG93ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2FwcGVuZC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yZW1vdmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Nsb25lLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Rpc3BhdGNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdEFsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2RlZmluZS5qcyIsICJub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2NvbG9yLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9iYXNpc0Nsb3NlZC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbnN0YW50LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29sb3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXJBcnJheS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlci5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3ZhbHVlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL3BhcnNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRpbWVyL3NyYy90aW1lb3V0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NjaGVkdWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbnRlcnJ1cHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0ci5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyVHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZHVyYXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9maWx0ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vbWVyZ2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vcmVtb3ZlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc2VsZWN0aW9uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0VHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lbmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vdHJhbnNpdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1icnVzaC9zcmMvYnJ1c2guanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0RGVjaW1hbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9leHBvbmVudC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRHcm91cC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXROdW1lcmFscy5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRTcGVjaWZpZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0VHJpbS5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRQcmVmaXhBdXRvLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdFJvdW5kZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0VHlwZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvaWRlbnRpdHkuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2RlZmF1bHRMb2NhbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uRml4ZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uUHJlZml4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL3ByZWNpc2lvblJvdW5kLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL21hdGguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbm9vcC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9zdHJlYW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvYXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jYXJ0ZXNpYW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY29tcG9zZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9yb3RhdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jaXJjbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9idWZmZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcG9pbnRFcXVhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL3Jlam9pbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wb2x5Z29uQ29udGFpbnMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2FudGltZXJpZGlhbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2NpcmNsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2xpbmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9yZWN0YW5nbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbGVuZ3RoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2Rpc3RhbmNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2dyYXRpY3VsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2FyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9ib3VuZHMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9jZW50cm9pZC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2NvbnRleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9tZWFzdXJlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vZml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vcmVzYW1wbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vY3lsaW5kcmljYWxFcXVhbEFyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVycy5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVyc1VzYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbEVxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2VxdWFsRWFydGguanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9pbml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9udW1iZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb250aW51b3VzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvdGlja0Zvcm1hdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2xpbmVhci5qcyIsICJub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvdHJhbnNmb3JtLmpzIiwgInNyYy9kYXRhL2xvYWRlci5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy90cmFuc2Zvcm0uanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvcmV2ZXJzZS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9mZWF0dXJlLmpzIiwgIm5vZGVfbW9kdWxlcy90b3BvanNvbi1jbGllbnQvc3JjL3N0aXRjaC5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9tZXNoLmpzIiwgInNyYy9yZW5kZXIvcGFwZXIuanMiLCAic3JjL3JlbmRlci9sYWJlbHMuanMiLCAic3JjL3JlbmRlci9jYXJ0b3VjaGUuanMiLCAic3JjL3JlbmRlci9zdHJpcC5qcyIsICJzcmMvcmVuZGVyL2xlZ2VuZC5qcyIsICJzcmMvcmVuZGVyL2RpZmZsaXN0LmpzIiwgInNyYy92aWV3cy9kaWZmLmpzIiwgInNyYy9yZW5kZXIvYmFzZS5qcyIsICJzcmMvZXhwb3J0L2V4cG9ydC5qcyIsICJzcmMvc3RhZ2VzL2Fmcm8tZXVyYXNpYS5qc29uIiwgInNyYy9zdGFnZXMvYWZyby1ldXJhc2lhLWxhbWJlcnQuanNvbiIsICJzcmMvdHJhY2tlcnMvZXh0ZW50Lmpzb24iLCAic3JjL21haW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOIDogYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOXG4gICAgOiBiIDwgYSA/IC0xXG4gICAgOiBiID4gYSA/IDFcbiAgICA6IGIgPj0gYSA/IDBcbiAgICA6IE5hTjtcbn1cbiIsICJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGRlc2NlbmRpbmcgZnJvbSBcIi4vZGVzY2VuZGluZy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiaXNlY3RvcihmKSB7XG4gIGxldCBjb21wYXJlMSwgY29tcGFyZTIsIGRlbHRhO1xuXG4gIC8vIElmIGFuIGFjY2Vzc29yIGlzIHNwZWNpZmllZCwgcHJvbW90ZSBpdCB0byBhIGNvbXBhcmF0b3IuIEluIHRoaXMgY2FzZSB3ZVxuICAvLyBjYW4gdGVzdCB3aGV0aGVyIHRoZSBzZWFyY2ggdmFsdWUgaXMgKHNlbGYtKSBjb21wYXJhYmxlLiBXZSBjYW5cdTIwMTl0IGRvIHRoaXNcbiAgLy8gZm9yIGEgY29tcGFyYXRvciAoZXhjZXB0IGZvciBzcGVjaWZpYywga25vd24gY29tcGFyYXRvcnMpIGJlY2F1c2Ugd2UgY2FuXHUyMDE5dFxuICAvLyB0ZWxsIGlmIHRoZSBjb21wYXJhdG9yIGlzIHN5bW1ldHJpYywgYW5kIGFuIGFzeW1tZXRyaWMgY29tcGFyYXRvciBjYW5cdTIwMTl0IGJlXG4gIC8vIHVzZWQgdG8gdGVzdCB3aGV0aGVyIGEgc2luZ2xlIHZhbHVlIGlzIGNvbXBhcmFibGUuXG4gIGlmIChmLmxlbmd0aCAhPT0gMikge1xuICAgIGNvbXBhcmUxID0gYXNjZW5kaW5nO1xuICAgIGNvbXBhcmUyID0gKGQsIHgpID0+IGFzY2VuZGluZyhmKGQpLCB4KTtcbiAgICBkZWx0YSA9IChkLCB4KSA9PiBmKGQpIC0geDtcbiAgfSBlbHNlIHtcbiAgICBjb21wYXJlMSA9IGYgPT09IGFzY2VuZGluZyB8fCBmID09PSBkZXNjZW5kaW5nID8gZiA6IHplcm87XG4gICAgY29tcGFyZTIgPSBmO1xuICAgIGRlbHRhID0gZjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlZnQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDwgMCkgbG8gPSBtaWQgKyAxO1xuICAgICAgICBlbHNlIGhpID0gbWlkO1xuICAgICAgfSB3aGlsZSAobG8gPCBoaSk7XG4gICAgfVxuICAgIHJldHVybiBsbztcbiAgfVxuXG4gIGZ1bmN0aW9uIHJpZ2h0KGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGlmIChsbyA8IGhpKSB7XG4gICAgICBpZiAoY29tcGFyZTEoeCwgeCkgIT09IDApIHJldHVybiBoaTtcbiAgICAgIGRvIHtcbiAgICAgICAgY29uc3QgbWlkID0gKGxvICsgaGkpID4+PiAxO1xuICAgICAgICBpZiAoY29tcGFyZTIoYVttaWRdLCB4KSA8PSAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gY2VudGVyKGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGNvbnN0IGkgPSBsZWZ0KGEsIHgsIGxvLCBoaSAtIDEpO1xuICAgIHJldHVybiBpID4gbG8gJiYgZGVsdGEoYVtpIC0gMV0sIHgpID4gLWRlbHRhKGFbaV0sIHgpID8gaSAtIDEgOiBpO1xuICB9XG5cbiAgcmV0dXJuIHtsZWZ0LCBjZW50ZXIsIHJpZ2h0fTtcbn1cblxuZnVuY3Rpb24gemVybygpIHtcbiAgcmV0dXJuIDA7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuIHggPT09IG51bGwgPyBOYU4gOiAreDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBudW1iZXJzKHZhbHVlcywgdmFsdWVvZikge1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBiaXNlY3RvciBmcm9tIFwiLi9iaXNlY3Rvci5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxuY29uc3QgYXNjZW5kaW5nQmlzZWN0ID0gYmlzZWN0b3IoYXNjZW5kaW5nKTtcbmV4cG9ydCBjb25zdCBiaXNlY3RSaWdodCA9IGFzY2VuZGluZ0Jpc2VjdC5yaWdodDtcbmV4cG9ydCBjb25zdCBiaXNlY3RMZWZ0ID0gYXNjZW5kaW5nQmlzZWN0LmxlZnQ7XG5leHBvcnQgY29uc3QgYmlzZWN0Q2VudGVyID0gYmlzZWN0b3IobnVtYmVyKS5jZW50ZXI7XG5leHBvcnQgZGVmYXVsdCBiaXNlY3RSaWdodDtcbiIsICIvLyBodHRwczovL2dpdGh1Yi5jb20vcHl0aG9uL2NweXRob24vYmxvYi9hNzRlZWEyMzhmNWJhYmExNTc5N2UyZThiNTcwZDE1M2JjODY5MGE3L01vZHVsZXMvbWF0aG1vZHVsZS5jI0wxNDIzXG5leHBvcnQgY2xhc3MgQWRkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wYXJ0aWFscyA9IG5ldyBGbG9hdDY0QXJyYXkoMzIpO1xuICAgIHRoaXMuX24gPSAwO1xuICB9XG4gIGFkZCh4KSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BhcnRpYWxzO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuX24gJiYgaiA8IDMyOyBqKyspIHtcbiAgICAgIGNvbnN0IHkgPSBwW2pdLFxuICAgICAgICBoaSA9IHggKyB5LFxuICAgICAgICBsbyA9IE1hdGguYWJzKHgpIDwgTWF0aC5hYnMoeSkgPyB4IC0gKGhpIC0geSkgOiB5IC0gKGhpIC0geCk7XG4gICAgICBpZiAobG8pIHBbaSsrXSA9IGxvO1xuICAgICAgeCA9IGhpO1xuICAgIH1cbiAgICBwW2ldID0geDtcbiAgICB0aGlzLl9uID0gaSArIDE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFsdWVPZigpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGFydGlhbHM7XG4gICAgbGV0IG4gPSB0aGlzLl9uLCB4LCB5LCBsbywgaGkgPSAwO1xuICAgIGlmIChuID4gMCkge1xuICAgICAgaGkgPSBwWy0tbl07XG4gICAgICB3aGlsZSAobiA+IDApIHtcbiAgICAgICAgeCA9IGhpO1xuICAgICAgICB5ID0gcFstLW5dO1xuICAgICAgICBoaSA9IHggKyB5O1xuICAgICAgICBsbyA9IHkgLSAoaGkgLSB4KTtcbiAgICAgICAgaWYgKGxvKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChuID4gMCAmJiAoKGxvIDwgMCAmJiBwW24gLSAxXSA8IDApIHx8IChsbyA+IDAgJiYgcFtuIC0gMV0gPiAwKSkpIHtcbiAgICAgICAgeSA9IGxvICogMjtcbiAgICAgICAgeCA9IGhpICsgeTtcbiAgICAgICAgaWYgKHkgPT0geCAtIGhpKSBoaSA9IHg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoaTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZnN1bSh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgY29uc3QgYWRkZXIgPSBuZXcgQWRkZXIoKTtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlID0gK3ZhbHVlKSB7XG4gICAgICAgIGFkZGVyLmFkZCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlID0gK3ZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpIHtcbiAgICAgICAgYWRkZXIuYWRkKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuICthZGRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZjdW1zdW0odmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGNvbnN0IGFkZGVyID0gbmV3IEFkZGVyKCk7XG4gIGxldCBpbmRleCA9IC0xO1xuICByZXR1cm4gRmxvYXQ2NEFycmF5LmZyb20odmFsdWVzLCB2YWx1ZW9mID09PSB1bmRlZmluZWRcbiAgICAgID8gdiA9PiBhZGRlci5hZGQoK3YgfHwgMClcbiAgICAgIDogdiA9PiBhZGRlci5hZGQoK3ZhbHVlb2YodiwgKytpbmRleCwgdmFsdWVzKSB8fCAwKVxuICApO1xufVxuIiwgImNvbnN0IGUxMCA9IE1hdGguc3FydCg1MCksXG4gICAgZTUgPSBNYXRoLnNxcnQoMTApLFxuICAgIGUyID0gTWF0aC5zcXJ0KDIpO1xuXG5mdW5jdGlvbiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgY29uc3Qgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gTWF0aC5tYXgoMCwgY291bnQpLFxuICAgICAgcG93ZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nMTAoc3RlcCkpLFxuICAgICAgZXJyb3IgPSBzdGVwIC8gTWF0aC5wb3coMTAsIHBvd2VyKSxcbiAgICAgIGZhY3RvciA9IGVycm9yID49IGUxMCA/IDEwIDogZXJyb3IgPj0gZTUgPyA1IDogZXJyb3IgPj0gZTIgPyAyIDogMTtcbiAgbGV0IGkxLCBpMiwgaW5jO1xuICBpZiAocG93ZXIgPCAwKSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIC1wb3dlcikgLyBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0ICogaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAqIGluYyk7XG4gICAgaWYgKGkxIC8gaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyIC8gaW5jID4gc3RvcCkgLS1pMjtcbiAgICBpbmMgPSAtaW5jO1xuICB9IGVsc2Uge1xuICAgIGluYyA9IE1hdGgucG93KDEwLCBwb3dlcikgKiBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0IC8gaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAvIGluYyk7XG4gICAgaWYgKGkxICogaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyICogaW5jID4gc3RvcCkgLS1pMjtcbiAgfVxuICBpZiAoaTIgPCBpMSAmJiAwLjUgPD0gY291bnQgJiYgY291bnQgPCAyKSByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50ICogMik7XG4gIHJldHVybiBbaTEsIGkyLCBpbmNdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGlmICghKGNvdW50ID4gMCkpIHJldHVybiBbXTtcbiAgaWYgKHN0YXJ0ID09PSBzdG9wKSByZXR1cm4gW3N0YXJ0XTtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgW2kxLCBpMiwgaW5jXSA9IHJldmVyc2UgPyB0aWNrU3BlYyhzdG9wLCBzdGFydCwgY291bnQpIDogdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgaWYgKCEoaTIgPj0gaTEpKSByZXR1cm4gW107XG4gIGNvbnN0IG4gPSBpMiAtIGkxICsgMSwgdGlja3MgPSBuZXcgQXJyYXkobik7XG4gIGlmIChyZXZlcnNlKSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpICogaW5jO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbmMgPCAwKSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAvIC1pbmM7XG4gICAgZWxzZSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAqIGluYztcbiAgfVxuICByZXR1cm4gdGlja3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgcmV0dXJuIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudClbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQsIGluYyA9IHJldmVyc2UgPyB0aWNrSW5jcmVtZW50KHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gIHJldHVybiAocmV2ZXJzZSA/IC0xIDogMSkgKiAoaW5jIDwgMCA/IDEgLyAtaW5jIDogaW5jKTtcbn1cbiIsICJmdW5jdGlvbiogZmxhdHRlbihhcnJheXMpIHtcbiAgZm9yIChjb25zdCBhcnJheSBvZiBhcnJheXMpIHtcbiAgICB5aWVsZCogYXJyYXk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2UoYXJyYXlzKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGZsYXR0ZW4oYXJyYXlzKSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgc3RhcnQgPSArc3RhcnQsIHN0b3AgPSArc3RvcCwgc3RlcCA9IChuID0gYXJndW1lbnRzLmxlbmd0aCkgPCAyID8gKHN0b3AgPSBzdGFydCwgc3RhcnQgPSAwLCAxKSA6IG4gPCAzID8gMSA6ICtzdGVwO1xuXG4gIHZhciBpID0gLTEsXG4gICAgICBuID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCkpIHwgMCxcbiAgICAgIHJhbmdlID0gbmV3IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgcmFuZ2VbaV0gPSBzdGFydCArIGkgKiBzdGVwO1xuICB9XG5cbiAgcmV0dXJuIHJhbmdlO1xufVxuIiwgInZhciBub29wID0ge3ZhbHVlOiAoKSA9PiB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSB8fCAvW1xccy5dLy50ZXN0KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BhdGNoO1xuIiwgImV4cG9ydCB2YXIgeGh0bWwgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzdmc6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcbiAgeGh0bWw6IHhodG1sLFxuICB4bGluazogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXG4gIHhtbDogXCJodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2VcIixcbiAgeG1sbnM6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy9cIlxufTtcbiIsICJpbXBvcnQgbmFtZXNwYWNlcyBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIHByZWZpeCA9IG5hbWUgKz0gXCJcIiwgaSA9IHByZWZpeC5pbmRleE9mKFwiOlwiKTtcbiAgaWYgKGkgPj0gMCAmJiAocHJlZml4ID0gbmFtZS5zbGljZSgwLCBpKSkgIT09IFwieG1sbnNcIikgbmFtZSA9IG5hbWUuc2xpY2UoaSArIDEpO1xuICByZXR1cm4gbmFtZXNwYWNlcy5oYXNPd25Qcm9wZXJ0eShwcmVmaXgpID8ge3NwYWNlOiBuYW1lc3BhY2VzW3ByZWZpeF0sIGxvY2FsOiBuYW1lfSA6IG5hbWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG59XG4iLCAiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi9uYW1lc3BhY2UuanNcIjtcbmltcG9ydCB7eGh0bWx9IGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZnVuY3Rpb24gY3JlYXRvckluaGVyaXQobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvY3VtZW50ID0gdGhpcy5vd25lckRvY3VtZW50LFxuICAgICAgICB1cmkgPSB0aGlzLm5hbWVzcGFjZVVSSTtcbiAgICByZXR1cm4gdXJpID09PSB4aHRtbCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubmFtZXNwYWNlVVJJID09PSB4aHRtbFxuICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSlcbiAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModXJpLCBuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRvckZpeGVkKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcbiAgcmV0dXJuIChmdWxsbmFtZS5sb2NhbFxuICAgICAgPyBjcmVhdG9yRml4ZWRcbiAgICAgIDogY3JlYXRvckluaGVyaXQpKGZ1bGxuYW1lKTtcbn1cbiIsICJmdW5jdGlvbiBub25lKCkge31cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNlbGVjdG9yID09IG51bGwgPyBub25lIDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgIi8vIEdpdmVuIHNvbWV0aGluZyBhcnJheSBsaWtlIChvciBudWxsKSwgcmV0dXJucyBzb21ldGhpbmcgdGhhdCBpcyBzdHJpY3RseSBhblxuLy8gYXJyYXkuIFRoaXMgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCBhcnJheS1saWtlIG9iamVjdHMgcGFzc2VkIHRvIGQzLnNlbGVjdEFsbFxuLy8gb3Igc2VsZWN0aW9uLnNlbGVjdEFsbCBhcmUgY29udmVydGVkIGludG8gcHJvcGVyIGFycmF5cyB3aGVuIGNyZWF0aW5nIGFcbi8vIHNlbGVjdGlvbjsgd2UgZG9uXHUyMDE5dCBldmVyIHdhbnQgdG8gY3JlYXRlIGEgc2VsZWN0aW9uIGJhY2tlZCBieSBhIGxpdmVcbi8vIEhUTUxDb2xsZWN0aW9uIG9yIE5vZGVMaXN0LiBIb3dldmVyLCBub3RlIHRoYXQgc2VsZWN0aW9uLnNlbGVjdEFsbCB3aWxsIHVzZSBhXG4vLyBzdGF0aWMgTm9kZUxpc3QgYXMgYSBncm91cCwgc2luY2UgaXQgc2FmZWx5IGRlcml2ZWQgZnJvbSBxdWVyeVNlbGVjdG9yQWxsLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXJyYXkoeCkge1xuICByZXR1cm4geCA9PSBudWxsID8gW10gOiBBcnJheS5pc0FycmF5KHgpID8geCA6IEFycmF5LmZyb20oeCk7XG59XG4iLCAiZnVuY3Rpb24gZW1wdHkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHNlbGVjdG9yID09IG51bGwgPyBlbXB0eSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICB9O1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IGFycmF5IGZyb20gXCIuLi9hcnJheS5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yQWxsIGZyb20gXCIuLi9zZWxlY3RvckFsbC5qc1wiO1xuXG5mdW5jdGlvbiBhcnJheUFsbChzZWxlY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhcnJheShzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCA9PT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBhcnJheUFsbChzZWxlY3QpO1xuICBlbHNlIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgcGFyZW50cyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRNYXRjaGVyKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbiIsICJpbXBvcnQge2NoaWxkTWF0Y2hlcn0gZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxudmFyIGZpbmQgPSBBcnJheS5wcm90b3R5cGUuZmluZDtcblxuZnVuY3Rpb24gY2hpbGRGaW5kKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmluZC5jYWxsKHRoaXMuY2hpbGRyZW4sIG1hdGNoKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2hpbGRGaXJzdCgpIHtcbiAgcmV0dXJuIHRoaXMuZmlyc3RFbGVtZW50Q2hpbGQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChtYXRjaCA9PSBudWxsID8gY2hpbGRGaXJzdFxuICAgICAgOiBjaGlsZEZpbmQodHlwZW9mIG1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBtYXRjaCA6IGNoaWxkTWF0Y2hlcihtYXRjaCkpKTtcbn1cbiIsICJpbXBvcnQge2NoaWxkTWF0Y2hlcn0gZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXI7XG5cbmZ1bmN0aW9uIGNoaWxkcmVuKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRyZW5GaWx0ZXIobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaWx0ZXIuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdEFsbChtYXRjaCA9PSBudWxsID8gY2hpbGRyZW5cbiAgICAgIDogY2hpbGRyZW5GaWx0ZXIodHlwZW9mIG1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBtYXRjaCA6IGNoaWxkTWF0Y2hlcihtYXRjaCkpKTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBtYXRjaGVyIGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHVwZGF0ZSkge1xuICByZXR1cm4gbmV3IEFycmF5KHVwZGF0ZS5sZW5ndGgpO1xufVxuIiwgImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2VudGVyIHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbnRlck5vZGUocGFyZW50LCBkYXR1bSkge1xuICB0aGlzLm93bmVyRG9jdW1lbnQgPSBwYXJlbnQub3duZXJEb2N1bWVudDtcbiAgdGhpcy5uYW1lc3BhY2VVUkkgPSBwYXJlbnQubmFtZXNwYWNlVVJJO1xuICB0aGlzLl9uZXh0ID0gbnVsbDtcbiAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9fZGF0YV9fID0gZGF0dW07XG59XG5cbkVudGVyTm9kZS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBFbnRlck5vZGUsXG4gIGFwcGVuZENoaWxkOiBmdW5jdGlvbihjaGlsZCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgdGhpcy5fbmV4dCk7IH0sXG4gIGluc2VydEJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIG5leHQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQpOyB9LFxuICBxdWVyeVNlbGVjdG9yOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyB9LFxuICBxdWVyeVNlbGVjdG9yQWxsOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpOyB9XG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHtFbnRlck5vZGV9IGZyb20gXCIuL2VudGVyLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4uL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGJpbmRJbmRleChwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhKSB7XG4gIHZhciBpID0gMCxcbiAgICAgIG5vZGUsXG4gICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aDtcblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZml0IGludG8gdXBkYXRlLlxuICAvLyBQdXQgYW55IG51bGwgbm9kZXMgaW50byBlbnRlci5cbiAgLy8gUHV0IGFueSByZW1haW5pbmcgZGF0YSBpbnRvIGVudGVyLlxuICBmb3IgKDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHV0IGFueSBub24tbnVsbCBub2RlcyB0aGF0IGRvblx1MjAxOXQgZml0IGludG8gZXhpdC5cbiAgZm9yICg7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGJpbmRLZXkocGFyZW50LCBncm91cCwgZW50ZXIsIHVwZGF0ZSwgZXhpdCwgZGF0YSwga2V5KSB7XG4gIHZhciBpLFxuICAgICAgbm9kZSxcbiAgICAgIG5vZGVCeUtleVZhbHVlID0gbmV3IE1hcCxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAga2V5VmFsdWVzID0gbmV3IEFycmF5KGdyb3VwTGVuZ3RoKSxcbiAgICAgIGtleVZhbHVlO1xuXG4gIC8vIENvbXB1dGUgdGhlIGtleSBmb3IgZWFjaCBub2RlLlxuICAvLyBJZiBtdWx0aXBsZSBub2RlcyBoYXZlIHRoZSBzYW1lIGtleSwgdGhlIGR1cGxpY2F0ZXMgYXJlIGFkZGVkIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAga2V5VmFsdWVzW2ldID0ga2V5VmFsdWUgPSBrZXkuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkgKyBcIlwiO1xuICAgICAgaWYgKG5vZGVCeUtleVZhbHVlLmhhcyhrZXlWYWx1ZSkpIHtcbiAgICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlQnlLZXlWYWx1ZS5zZXQoa2V5VmFsdWUsIG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENvbXB1dGUgdGhlIGtleSBmb3IgZWFjaCBkYXR1bS5cbiAgLy8gSWYgdGhlcmUgYSBub2RlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleSwgam9pbiBhbmQgYWRkIGl0IHRvIHVwZGF0ZS5cbiAgLy8gSWYgdGhlcmUgaXMgbm90IChvciB0aGUga2V5IGlzIGEgZHVwbGljYXRlKSwgYWRkIGl0IHRvIGVudGVyLlxuICBmb3IgKGkgPSAwOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAga2V5VmFsdWUgPSBrZXkuY2FsbChwYXJlbnQsIGRhdGFbaV0sIGksIGRhdGEpICsgXCJcIjtcbiAgICBpZiAobm9kZSA9IG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZSkpIHtcbiAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgIG5vZGVCeUtleVZhbHVlLmRlbGV0ZShrZXlWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZShwYXJlbnQsIGRhdGFbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZCBhbnkgcmVtYWluaW5nIG5vZGVzIHRoYXQgd2VyZSBub3QgYm91bmQgdG8gZGF0YSB0byBleGl0LlxuICBmb3IgKGkgPSAwOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAobm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlc1tpXSkgPT09IG5vZGUpKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGF0dW0obm9kZSkge1xuICByZXR1cm4gbm9kZS5fX2RhdGFfXztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBBcnJheS5mcm9tKHRoaXMsIGRhdHVtKTtcblxuICB2YXIgYmluZCA9IGtleSA/IGJpbmRLZXkgOiBiaW5kSW5kZXgsXG4gICAgICBwYXJlbnRzID0gdGhpcy5fcGFyZW50cyxcbiAgICAgIGdyb3VwcyA9IHRoaXMuX2dyb3VwcztcblxuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHZhbHVlID0gY29uc3RhbnQodmFsdWUpO1xuXG4gIGZvciAodmFyIG0gPSBncm91cHMubGVuZ3RoLCB1cGRhdGUgPSBuZXcgQXJyYXkobSksIGVudGVyID0gbmV3IEFycmF5KG0pLCBleGl0ID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIHZhciBwYXJlbnQgPSBwYXJlbnRzW2pdLFxuICAgICAgICBncm91cCA9IGdyb3Vwc1tqXSxcbiAgICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICAgIGRhdGEgPSBhcnJheWxpa2UodmFsdWUuY2FsbChwYXJlbnQsIHBhcmVudCAmJiBwYXJlbnQuX19kYXRhX18sIGosIHBhcmVudHMpKSxcbiAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAgICBlbnRlckdyb3VwID0gZW50ZXJbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIHVwZGF0ZUdyb3VwID0gdXBkYXRlW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICBleGl0R3JvdXAgPSBleGl0W2pdID0gbmV3IEFycmF5KGdyb3VwTGVuZ3RoKTtcblxuICAgIGJpbmQocGFyZW50LCBncm91cCwgZW50ZXJHcm91cCwgdXBkYXRlR3JvdXAsIGV4aXRHcm91cCwgZGF0YSwga2V5KTtcblxuICAgIC8vIE5vdyBjb25uZWN0IHRoZSBlbnRlciBub2RlcyB0byB0aGVpciBmb2xsb3dpbmcgdXBkYXRlIG5vZGUsIHN1Y2ggdGhhdFxuICAgIC8vIGFwcGVuZENoaWxkIGNhbiBpbnNlcnQgdGhlIG1hdGVyaWFsaXplZCBlbnRlciBub2RlIGJlZm9yZSB0aGlzIG5vZGUsXG4gICAgLy8gcmF0aGVyIHRoYW4gYXQgdGhlIGVuZCBvZiB0aGUgcGFyZW50IG5vZGUuXG4gICAgZm9yICh2YXIgaTAgPSAwLCBpMSA9IDAsIHByZXZpb3VzLCBuZXh0OyBpMCA8IGRhdGFMZW5ndGg7ICsraTApIHtcbiAgICAgIGlmIChwcmV2aW91cyA9IGVudGVyR3JvdXBbaTBdKSB7XG4gICAgICAgIGlmIChpMCA+PSBpMSkgaTEgPSBpMCArIDE7XG4gICAgICAgIHdoaWxlICghKG5leHQgPSB1cGRhdGVHcm91cFtpMV0pICYmICsraTEgPCBkYXRhTGVuZ3RoKTtcbiAgICAgICAgcHJldmlvdXMuX25leHQgPSBuZXh0IHx8IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlID0gbmV3IFNlbGVjdGlvbih1cGRhdGUsIHBhcmVudHMpO1xuICB1cGRhdGUuX2VudGVyID0gZW50ZXI7XG4gIHVwZGF0ZS5fZXhpdCA9IGV4aXQ7XG4gIHJldHVybiB1cGRhdGU7XG59XG5cbi8vIEdpdmVuIHNvbWUgZGF0YSwgdGhpcyByZXR1cm5zIGFuIGFycmF5LWxpa2UgdmlldyBvZiBpdDogYW4gb2JqZWN0IHRoYXRcbi8vIGV4cG9zZXMgYSBsZW5ndGggcHJvcGVydHkgYW5kIGFsbG93cyBudW1lcmljIGluZGV4aW5nLiBOb3RlIHRoYXQgdW5saWtlXG4vLyBzZWxlY3RBbGwsIHRoaXMgaXNuXHUyMDE5dCB3b3JyaWVkIGFib3V0IFx1MjAxQ2xpdmVcdTIwMUQgY29sbGVjdGlvbnMgYmVjYXVzZSB0aGUgcmVzdWx0aW5nXG4vLyBhcnJheSB3aWxsIG9ubHkgYmUgdXNlZCBicmllZmx5IHdoaWxlIGRhdGEgaXMgYmVpbmcgYm91bmQuIChJdCBpcyBwb3NzaWJsZSB0b1xuLy8gY2F1c2UgdGhlIGRhdGEgdG8gY2hhbmdlIHdoaWxlIGl0ZXJhdGluZyBieSB1c2luZyBhIGtleSBmdW5jdGlvbiwgYnV0IHBsZWFzZVxuLy8gZG9uXHUyMDE5dDsgd2VcdTIwMTlkIHJhdGhlciBhdm9pZCBhIGdyYXR1aXRvdXMgY29weS4pXG5mdW5jdGlvbiBhcnJheWxpa2UoZGF0YSkge1xuICByZXR1cm4gdHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIgJiYgXCJsZW5ndGhcIiBpbiBkYXRhXG4gICAgPyBkYXRhIC8vIEFycmF5LCBUeXBlZEFycmF5LCBOb2RlTGlzdCwgYXJyYXktbGlrZVxuICAgIDogQXJyYXkuZnJvbShkYXRhKTsgLy8gTWFwLCBTZXQsIGl0ZXJhYmxlLCBzdHJpbmcsIG9yIGFueXRoaW5nIGVsc2Vcbn1cbiIsICJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9leGl0IHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob25lbnRlciwgb251cGRhdGUsIG9uZXhpdCkge1xuICB2YXIgZW50ZXIgPSB0aGlzLmVudGVyKCksIHVwZGF0ZSA9IHRoaXMsIGV4aXQgPSB0aGlzLmV4aXQoKTtcbiAgaWYgKHR5cGVvZiBvbmVudGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlbnRlciA9IG9uZW50ZXIoZW50ZXIpO1xuICAgIGlmIChlbnRlcikgZW50ZXIgPSBlbnRlci5zZWxlY3Rpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBlbnRlciA9IGVudGVyLmFwcGVuZChvbmVudGVyICsgXCJcIik7XG4gIH1cbiAgaWYgKG9udXBkYXRlICE9IG51bGwpIHtcbiAgICB1cGRhdGUgPSBvbnVwZGF0ZSh1cGRhdGUpO1xuICAgIGlmICh1cGRhdGUpIHVwZGF0ZSA9IHVwZGF0ZS5zZWxlY3Rpb24oKTtcbiAgfVxuICBpZiAob25leGl0ID09IG51bGwpIGV4aXQucmVtb3ZlKCk7IGVsc2Ugb25leGl0KGV4aXQpO1xuICByZXR1cm4gZW50ZXIgJiYgdXBkYXRlID8gZW50ZXIubWVyZ2UodXBkYXRlKS5vcmRlcigpIDogdXBkYXRlO1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb250ZXh0KSB7XG4gIHZhciBzZWxlY3Rpb24gPSBjb250ZXh0LnNlbGVjdGlvbiA/IGNvbnRleHQuc2VsZWN0aW9uKCkgOiBjb250ZXh0O1xuXG4gIGZvciAodmFyIGdyb3VwczAgPSB0aGlzLl9ncm91cHMsIGdyb3VwczEgPSBzZWxlY3Rpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAtMSwgbSA9IGdyb3Vwcy5sZW5ndGg7ICsraiA8IG07KSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSBncm91cC5sZW5ndGggLSAxLCBuZXh0ID0gZ3JvdXBbaV0sIG5vZGU7IC0taSA+PSAwOykge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBpZiAobmV4dCAmJiBub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG5leHQpIF4gNCkgbmV4dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBuZXh0KTtcbiAgICAgICAgbmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbXBhcmUpIHtcbiAgaWYgKCFjb21wYXJlKSBjb21wYXJlID0gYXNjZW5kaW5nO1xuXG4gIGZ1bmN0aW9uIGNvbXBhcmVOb2RlKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gY29tcGFyZShhLl9fZGF0YV9fLCBiLl9fZGF0YV9fKSA6ICFhIC0gIWI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzb3J0Z3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzb3J0Z3JvdXAgPSBzb3J0Z3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzb3J0Z3JvdXBbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0Z3JvdXAuc29ydChjb21wYXJlTm9kZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzb3J0Z3JvdXBzLCB0aGlzLl9wYXJlbnRzKS5vcmRlcigpO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1swXTtcbiAgYXJndW1lbnRzWzBdID0gdGhpcztcbiAgY2FsbGJhY2suYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgaWYgKG5vZGUpIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICBsZXQgc2l6ZSA9IDA7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzKSArK3NpemU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgcmV0dXJuIHNpemU7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAhdGhpcy5ub2RlKCk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgY2FsbGJhY2suY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCAiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi4vbmFtZXNwYWNlLmpzXCI7XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmVOUyhmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHYpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb25OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgdik7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMubm9kZSgpO1xuICAgIHJldHVybiBmdWxsbmFtZS5sb2NhbFxuICAgICAgICA/IG5vZGUuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKVxuICAgICAgICA6IG5vZGUuZ2V0QXR0cmlidXRlKGZ1bGxuYW1lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0clJlbW92ZU5TIDogYXR0clJlbW92ZSkgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pXG4gICAgICA6IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50KSkpKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUpIHtcbiAgcmV0dXJuIChub2RlLm93bmVyRG9jdW1lbnQgJiYgbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KSAvLyBub2RlIGlzIGEgTm9kZVxuICAgICAgfHwgKG5vZGUuZG9jdW1lbnQgJiYgbm9kZSkgLy8gbm9kZSBpcyBhIFdpbmRvd1xuICAgICAgfHwgbm9kZS5kZWZhdWx0VmlldzsgLy8gbm9kZSBpcyBhIERvY3VtZW50XG59XG4iLCAiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2LCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgICA/IHN0eWxlUmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gc3R5bGVGdW5jdGlvblxuICAgICAgICAgICAgOiBzdHlsZUNvbnN0YW50KShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpXG4gICAgICA6IHN0eWxlVmFsdWUodGhpcy5ub2RlKCksIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVWYWx1ZShub2RlLCBuYW1lKSB7XG4gIHJldHVybiBub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSlcbiAgICAgIHx8IGRlZmF1bHRWaWV3KG5vZGUpLmdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbn1cbiIsICJmdW5jdGlvbiBwcm9wZXJ0eVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgZGVsZXRlIHRoaXNbbmFtZV07XG4gICAgZWxzZSB0aGlzW25hbWVdID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICA/IHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gcHJvcGVydHlSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gcHJvcGVydHlGdW5jdGlvblxuICAgICAgICAgIDogcHJvcGVydHlDb25zdGFudCkobmFtZSwgdmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKVtuYW1lXTtcbn1cbiIsICJmdW5jdGlvbiBjbGFzc0FycmF5KHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnRyaW0oKS5zcGxpdCgvXnxcXHMrLyk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzTGlzdChub2RlKSB7XG4gIHJldHVybiBub2RlLmNsYXNzTGlzdCB8fCBuZXcgQ2xhc3NMaXN0KG5vZGUpO1xufVxuXG5mdW5jdGlvbiBDbGFzc0xpc3Qobm9kZSkge1xuICB0aGlzLl9ub2RlID0gbm9kZTtcbiAgdGhpcy5fbmFtZXMgPSBjbGFzc0FycmF5KG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIik7XG59XG5cbkNsYXNzTGlzdC5wcm90b3R5cGUgPSB7XG4gIGFkZDogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoaSA8IDApIHtcbiAgICAgIHRoaXMuX25hbWVzLnB1c2gobmFtZSk7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMuX25hbWVzLmpvaW4oXCIgXCIpKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5zcGxpY2UoaSwgMSk7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMuX25hbWVzLmpvaW4oXCIgXCIpKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRhaW5zOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSkgPj0gMDtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2xhc3NlZEFkZChub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5hZGQobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkUmVtb3ZlKG5vZGUsIG5hbWVzKSB7XG4gIHZhciBsaXN0ID0gY2xhc3NMaXN0KG5vZGUpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBuKSBsaXN0LnJlbW92ZShuYW1lc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRUcnVlKG5hbWVzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjbGFzc2VkQWRkKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZEZhbHNlKG5hbWVzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjbGFzc2VkUmVtb3ZlKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZEZ1bmN0aW9uKG5hbWVzLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgKHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgPyBjbGFzc2VkQWRkIDogY2xhc3NlZFJlbW92ZSkodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgbmFtZXMgPSBjbGFzc0FycmF5KG5hbWUgKyBcIlwiKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgbGlzdCA9IGNsYXNzTGlzdCh0aGlzLm5vZGUoKSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgaWYgKCFsaXN0LmNvbnRhaW5zKG5hbWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gY2xhc3NlZEZ1bmN0aW9uIDogdmFsdWVcbiAgICAgID8gY2xhc3NlZFRydWVcbiAgICAgIDogY2xhc3NlZEZhbHNlKShuYW1lcywgdmFsdWUpKTtcbn1cbiIsICJmdW5jdGlvbiB0ZXh0UmVtb3ZlKCkge1xuICB0aGlzLnRleHRDb250ZW50ID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHRleHRSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHRleHRGdW5jdGlvblxuICAgICAgICAgIDogdGV4dENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLnRleHRDb250ZW50O1xufVxuIiwgImZ1bmN0aW9uIGh0bWxSZW1vdmUoKSB7XG4gIHRoaXMuaW5uZXJIVE1MID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gaHRtbENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlubmVySFRNTCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBodG1sRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmlubmVySFRNTCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gaHRtbFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gaHRtbEZ1bmN0aW9uXG4gICAgICAgICAgOiBodG1sQ29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkuaW5uZXJIVE1MO1xufVxuIiwgImZ1bmN0aW9uIHJhaXNlKCkge1xuICBpZiAodGhpcy5uZXh0U2libGluZykgdGhpcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChyYWlzZSk7XG59XG4iLCAiZnVuY3Rpb24gbG93ZXIoKSB7XG4gIGlmICh0aGlzLnByZXZpb3VzU2libGluZykgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGxvd2VyKTtcbn1cbiIsICJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBjcmVhdGUgPSB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZSA6IGNyZWF0b3IobmFtZSk7XG4gIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRDaGlsZChjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH0pO1xufVxuIiwgImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGNvbnN0YW50TnVsbCgpIHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGJlZm9yZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpLFxuICAgICAgc2VsZWN0ID0gYmVmb3JlID09IG51bGwgPyBjb25zdGFudE51bGwgOiB0eXBlb2YgYmVmb3JlID09PSBcImZ1bmN0aW9uXCIgPyBiZWZvcmUgOiBzZWxlY3RvcihiZWZvcmUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0QmVmb3JlKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCBzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCBudWxsKTtcbiAgfSk7XG59XG4iLCAiZnVuY3Rpb24gcmVtb3ZlKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJlbW92ZSk7XG59XG4iLCAiZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lU2hhbGxvdygpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUoZmFsc2UpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVEZWVwKCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZSh0cnVlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZGVlcCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZGVlcCA/IHNlbGVjdGlvbl9jbG9uZURlZXAgOiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIiwgdmFsdWUpXG4gICAgICA6IHRoaXMubm9kZSgpLl9fZGF0YV9fO1xufVxuIiwgImZ1bmN0aW9uIGNvbnRleHRMaXN0ZW5lcihsaXN0ZW5lcikge1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50LCB0aGlzLl9fZGF0YV9fKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25SZW1vdmUodHlwZW5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbjtcbiAgICBpZiAoIW9uKSByZXR1cm47XG4gICAgZm9yICh2YXIgaiA9IDAsIGkgPSAtMSwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgaWYgKG8gPSBvbltqXSwgKCF0eXBlbmFtZS50eXBlIHx8IG8udHlwZSA9PT0gdHlwZW5hbWUudHlwZSkgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblsrK2ldID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCsraSkgb24ubGVuZ3RoID0gaTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9fb247XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uQWRkKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uLCBvLCBsaXN0ZW5lciA9IGNvbnRleHRMaXN0ZW5lcih2YWx1ZSk7XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgICAgaWYgKChvID0gb25bal0pLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIgPSBsaXN0ZW5lciwgby5vcHRpb25zID0gb3B0aW9ucyk7XG4gICAgICAgIG8udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZW5hbWUudHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIG8gPSB7dHlwZTogdHlwZW5hbWUudHlwZSwgbmFtZTogdHlwZW5hbWUubmFtZSwgdmFsdWU6IHZhbHVlLCBsaXN0ZW5lcjogbGlzdGVuZXIsIG9wdGlvbnM6IG9wdGlvbnN9O1xuICAgIGlmICghb24pIHRoaXMuX19vbiA9IFtvXTtcbiAgICBlbHNlIG9uLnB1c2gobyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdHlwZW5hbWVzID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiKSwgaSwgbiA9IHR5cGVuYW1lcy5sZW5ndGgsIHQ7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG9uID0gdGhpcy5ub2RlKCkuX19vbjtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBmb3IgKGkgPSAwLCBvID0gb25bal07IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKCh0ID0gdHlwZW5hbWVzW2ldKS50eXBlID09PSBvLnR5cGUgJiYgdC5uYW1lID09PSBvLm5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gby52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBvbiA9IHZhbHVlID8gb25BZGQgOiBvblJlbW92ZTtcbiAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgdGhpcy5lYWNoKG9uKHR5cGVuYW1lc1tpXSwgdmFsdWUsIG9wdGlvbnMpKTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCAiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChub2RlLCB0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIHdpbmRvdyA9IGRlZmF1bHRWaWV3KG5vZGUpLFxuICAgICAgZXZlbnQgPSB3aW5kb3cuQ3VzdG9tRXZlbnQ7XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZXZlbnQgPSBuZXcgZXZlbnQodHlwZSwgcGFyYW1zKTtcbiAgfSBlbHNlIHtcbiAgICBldmVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO1xuICAgIGlmIChwYXJhbXMpIGV2ZW50LmluaXRFdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUpLCBldmVudC5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICAgIGVsc2UgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSk7XG4gIH1cblxuICBub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaENvbnN0YW50KHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hGdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBkaXNwYXRjaEZ1bmN0aW9uXG4gICAgICA6IGRpc3BhdGNoQ29uc3RhbnQpKHR5cGUsIHBhcmFtcykpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKigpIHtcbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHlpZWxkIG5vZGU7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdEFsbCBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQgZnJvbSBcIi4vc2VsZWN0Q2hpbGQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4gZnJvbSBcIi4vc2VsZWN0Q2hpbGRyZW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXRhIGZyb20gXCIuL2RhdGEuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW50ZXIgZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZXhpdCBmcm9tIFwiLi9leGl0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2pvaW4gZnJvbSBcIi4vam9pbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vcmRlciBmcm9tIFwiLi9vcmRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zb3J0IGZyb20gXCIuL3NvcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGVzIGZyb20gXCIuL25vZGVzLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGUgZnJvbSBcIi4vbm9kZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zaXplIGZyb20gXCIuL3NpemUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW1wdHkgZnJvbSBcIi4vZW1wdHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZWFjaCBmcm9tIFwiLi9lYWNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2F0dHIgZnJvbSBcIi4vYXR0ci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9wcm9wZXJ0eSBmcm9tIFwiLi9wcm9wZXJ0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbGFzc2VkIGZyb20gXCIuL2NsYXNzZWQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2h0bWwgZnJvbSBcIi4vaHRtbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yYWlzZSBmcm9tIFwiLi9yYWlzZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9sb3dlciBmcm9tIFwiLi9sb3dlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hcHBlbmQgZnJvbSBcIi4vYXBwZW5kLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2luc2VydCBmcm9tIFwiLi9pbnNlcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbG9uZSBmcm9tIFwiLi9jbG9uZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXR1bSBmcm9tIFwiLi9kYXR1bS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kaXNwYXRjaCBmcm9tIFwiLi9kaXNwYXRjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pdGVyYXRvciBmcm9tIFwiLi9pdGVyYXRvci5qc1wiO1xuXG5leHBvcnQgdmFyIHJvb3QgPSBbbnVsbF07XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3Rpb24oZ3JvdXBzLCBwYXJlbnRzKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdXSwgcm9vdCk7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9zZWxlY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzO1xufVxuXG5TZWxlY3Rpb24ucHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNlbGVjdGlvbixcbiAgc2VsZWN0OiBzZWxlY3Rpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHNlbGVjdGlvbl9zZWxlY3RBbGwsXG4gIHNlbGVjdENoaWxkOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogc2VsZWN0aW9uX2ZpbHRlcixcbiAgZGF0YTogc2VsZWN0aW9uX2RhdGEsXG4gIGVudGVyOiBzZWxlY3Rpb25fZW50ZXIsXG4gIGV4aXQ6IHNlbGVjdGlvbl9leGl0LFxuICBqb2luOiBzZWxlY3Rpb25fam9pbixcbiAgbWVyZ2U6IHNlbGVjdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiBzZWxlY3Rpb25fc2VsZWN0aW9uLFxuICBvcmRlcjogc2VsZWN0aW9uX29yZGVyLFxuICBzb3J0OiBzZWxlY3Rpb25fc29ydCxcbiAgY2FsbDogc2VsZWN0aW9uX2NhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fbm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9ub2RlLFxuICBzaXplOiBzZWxlY3Rpb25fc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX2VhY2gsXG4gIGF0dHI6IHNlbGVjdGlvbl9hdHRyLFxuICBzdHlsZTogc2VsZWN0aW9uX3N0eWxlLFxuICBwcm9wZXJ0eTogc2VsZWN0aW9uX3Byb3BlcnR5LFxuICBjbGFzc2VkOiBzZWxlY3Rpb25fY2xhc3NlZCxcbiAgdGV4dDogc2VsZWN0aW9uX3RleHQsXG4gIGh0bWw6IHNlbGVjdGlvbl9odG1sLFxuICByYWlzZTogc2VsZWN0aW9uX3JhaXNlLFxuICBsb3dlcjogc2VsZWN0aW9uX2xvd2VyLFxuICBhcHBlbmQ6IHNlbGVjdGlvbl9hcHBlbmQsXG4gIGluc2VydDogc2VsZWN0aW9uX2luc2VydCxcbiAgcmVtb3ZlOiBzZWxlY3Rpb25fcmVtb3ZlLFxuICBjbG9uZTogc2VsZWN0aW9uX2Nsb25lLFxuICBkYXR1bTogc2VsZWN0aW9uX2RhdHVtLFxuICBvbjogc2VsZWN0aW9uX29uLFxuICBkaXNwYXRjaDogc2VsZWN0aW9uX2Rpc3BhdGNoLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX2l0ZXJhdG9yXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZWxlY3Rpb247XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb24sIHJvb3R9IGZyb20gXCIuL3NlbGVjdGlvbi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiXG4gICAgICA/IG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKV1dLCBbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XSlcbiAgICAgIDogbmV3IFNlbGVjdGlvbihbW3NlbGVjdG9yXV0sIHJvb3QpO1xufVxuIiwgImltcG9ydCBhcnJheSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb24sIHJvb3R9IGZyb20gXCIuL3NlbGVjdGlvbi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiXG4gICAgICA/IG5ldyBTZWxlY3Rpb24oW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXSwgW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF0pXG4gICAgICA6IG5ldyBTZWxlY3Rpb24oW2FycmF5KHNlbGVjdG9yKV0sIHJvb3QpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnN0cnVjdG9yLCBmYWN0b3J5LCBwcm90b3R5cGUpIHtcbiAgY29uc3RydWN0b3IucHJvdG90eXBlID0gZmFjdG9yeS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gIHByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKHBhcmVudCwgZGVmaW5pdGlvbikge1xuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcbiAgZm9yICh2YXIga2V5IGluIGRlZmluaXRpb24pIHByb3RvdHlwZVtrZXldID0gZGVmaW5pdGlvbltrZXldO1xuICByZXR1cm4gcHJvdG90eXBlO1xufVxuIiwgImltcG9ydCBkZWZpbmUsIHtleHRlbmR9IGZyb20gXCIuL2RlZmluZS5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29sb3IoKSB7fVxuXG5leHBvcnQgdmFyIGRhcmtlciA9IDAuNztcbmV4cG9ydCB2YXIgYnJpZ2h0ZXIgPSAxIC8gZGFya2VyO1xuXG52YXIgcmVJID0gXCJcXFxccyooWystXT9cXFxcZCspXFxcXHMqXCIsXG4gICAgcmVOID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pXFxcXHMqXCIsXG4gICAgcmVQID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pJVxcXFxzKlwiLFxuICAgIHJlSGV4ID0gL14jKFswLTlhLWZdezMsOH0pJC8sXG4gICAgcmVSZ2JJbnRlZ2VyID0gbmV3IFJlZ0V4cChgXnJnYlxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX1cXFxcKSRgKSxcbiAgICByZVJnYlBlcmNlbnQgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlUmdiYUludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiYVxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX0sJHtyZU59XFxcXCkkYCksXG4gICAgcmVSZ2JhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZUhzbFBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlSHNsYVBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsYVxcXFwoJHtyZU59LCR7cmVQfSwke3JlUH0sJHtyZU59XFxcXCkkYCk7XG5cbnZhciBuYW1lZCA9IHtcbiAgYWxpY2VibHVlOiAweGYwZjhmZixcbiAgYW50aXF1ZXdoaXRlOiAweGZhZWJkNyxcbiAgYXF1YTogMHgwMGZmZmYsXG4gIGFxdWFtYXJpbmU6IDB4N2ZmZmQ0LFxuICBhenVyZTogMHhmMGZmZmYsXG4gIGJlaWdlOiAweGY1ZjVkYyxcbiAgYmlzcXVlOiAweGZmZTRjNCxcbiAgYmxhY2s6IDB4MDAwMDAwLFxuICBibGFuY2hlZGFsbW9uZDogMHhmZmViY2QsXG4gIGJsdWU6IDB4MDAwMGZmLFxuICBibHVldmlvbGV0OiAweDhhMmJlMixcbiAgYnJvd246IDB4YTUyYTJhLFxuICBidXJseXdvb2Q6IDB4ZGViODg3LFxuICBjYWRldGJsdWU6IDB4NWY5ZWEwLFxuICBjaGFydHJldXNlOiAweDdmZmYwMCxcbiAgY2hvY29sYXRlOiAweGQyNjkxZSxcbiAgY29yYWw6IDB4ZmY3ZjUwLFxuICBjb3JuZmxvd2VyYmx1ZTogMHg2NDk1ZWQsXG4gIGNvcm5zaWxrOiAweGZmZjhkYyxcbiAgY3JpbXNvbjogMHhkYzE0M2MsXG4gIGN5YW46IDB4MDBmZmZmLFxuICBkYXJrYmx1ZTogMHgwMDAwOGIsXG4gIGRhcmtjeWFuOiAweDAwOGI4YixcbiAgZGFya2dvbGRlbnJvZDogMHhiODg2MGIsXG4gIGRhcmtncmF5OiAweGE5YTlhOSxcbiAgZGFya2dyZWVuOiAweDAwNjQwMCxcbiAgZGFya2dyZXk6IDB4YTlhOWE5LFxuICBkYXJra2hha2k6IDB4YmRiNzZiLFxuICBkYXJrbWFnZW50YTogMHg4YjAwOGIsXG4gIGRhcmtvbGl2ZWdyZWVuOiAweDU1NmIyZixcbiAgZGFya29yYW5nZTogMHhmZjhjMDAsXG4gIGRhcmtvcmNoaWQ6IDB4OTkzMmNjLFxuICBkYXJrcmVkOiAweDhiMDAwMCxcbiAgZGFya3NhbG1vbjogMHhlOTk2N2EsXG4gIGRhcmtzZWFncmVlbjogMHg4ZmJjOGYsXG4gIGRhcmtzbGF0ZWJsdWU6IDB4NDgzZDhiLFxuICBkYXJrc2xhdGVncmF5OiAweDJmNGY0ZixcbiAgZGFya3NsYXRlZ3JleTogMHgyZjRmNGYsXG4gIGRhcmt0dXJxdW9pc2U6IDB4MDBjZWQxLFxuICBkYXJrdmlvbGV0OiAweDk0MDBkMyxcbiAgZGVlcHBpbms6IDB4ZmYxNDkzLFxuICBkZWVwc2t5Ymx1ZTogMHgwMGJmZmYsXG4gIGRpbWdyYXk6IDB4Njk2OTY5LFxuICBkaW1ncmV5OiAweDY5Njk2OSxcbiAgZG9kZ2VyYmx1ZTogMHgxZTkwZmYsXG4gIGZpcmVicmljazogMHhiMjIyMjIsXG4gIGZsb3JhbHdoaXRlOiAweGZmZmFmMCxcbiAgZm9yZXN0Z3JlZW46IDB4MjI4YjIyLFxuICBmdWNoc2lhOiAweGZmMDBmZixcbiAgZ2FpbnNib3JvOiAweGRjZGNkYyxcbiAgZ2hvc3R3aGl0ZTogMHhmOGY4ZmYsXG4gIGdvbGQ6IDB4ZmZkNzAwLFxuICBnb2xkZW5yb2Q6IDB4ZGFhNTIwLFxuICBncmF5OiAweDgwODA4MCxcbiAgZ3JlZW46IDB4MDA4MDAwLFxuICBncmVlbnllbGxvdzogMHhhZGZmMmYsXG4gIGdyZXk6IDB4ODA4MDgwLFxuICBob25leWRldzogMHhmMGZmZjAsXG4gIGhvdHBpbms6IDB4ZmY2OWI0LFxuICBpbmRpYW5yZWQ6IDB4Y2Q1YzVjLFxuICBpbmRpZ286IDB4NGIwMDgyLFxuICBpdm9yeTogMHhmZmZmZjAsXG4gIGtoYWtpOiAweGYwZTY4YyxcbiAgbGF2ZW5kZXI6IDB4ZTZlNmZhLFxuICBsYXZlbmRlcmJsdXNoOiAweGZmZjBmNSxcbiAgbGF3bmdyZWVuOiAweDdjZmMwMCxcbiAgbGVtb25jaGlmZm9uOiAweGZmZmFjZCxcbiAgbGlnaHRibHVlOiAweGFkZDhlNixcbiAgbGlnaHRjb3JhbDogMHhmMDgwODAsXG4gIGxpZ2h0Y3lhbjogMHhlMGZmZmYsXG4gIGxpZ2h0Z29sZGVucm9keWVsbG93OiAweGZhZmFkMixcbiAgbGlnaHRncmF5OiAweGQzZDNkMyxcbiAgbGlnaHRncmVlbjogMHg5MGVlOTAsXG4gIGxpZ2h0Z3JleTogMHhkM2QzZDMsXG4gIGxpZ2h0cGluazogMHhmZmI2YzEsXG4gIGxpZ2h0c2FsbW9uOiAweGZmYTA3YSxcbiAgbGlnaHRzZWFncmVlbjogMHgyMGIyYWEsXG4gIGxpZ2h0c2t5Ymx1ZTogMHg4N2NlZmEsXG4gIGxpZ2h0c2xhdGVncmF5OiAweDc3ODg5OSxcbiAgbGlnaHRzbGF0ZWdyZXk6IDB4Nzc4ODk5LFxuICBsaWdodHN0ZWVsYmx1ZTogMHhiMGM0ZGUsXG4gIGxpZ2h0eWVsbG93OiAweGZmZmZlMCxcbiAgbGltZTogMHgwMGZmMDAsXG4gIGxpbWVncmVlbjogMHgzMmNkMzIsXG4gIGxpbmVuOiAweGZhZjBlNixcbiAgbWFnZW50YTogMHhmZjAwZmYsXG4gIG1hcm9vbjogMHg4MDAwMDAsXG4gIG1lZGl1bWFxdWFtYXJpbmU6IDB4NjZjZGFhLFxuICBtZWRpdW1ibHVlOiAweDAwMDBjZCxcbiAgbWVkaXVtb3JjaGlkOiAweGJhNTVkMyxcbiAgbWVkaXVtcHVycGxlOiAweDkzNzBkYixcbiAgbWVkaXVtc2VhZ3JlZW46IDB4M2NiMzcxLFxuICBtZWRpdW1zbGF0ZWJsdWU6IDB4N2I2OGVlLFxuICBtZWRpdW1zcHJpbmdncmVlbjogMHgwMGZhOWEsXG4gIG1lZGl1bXR1cnF1b2lzZTogMHg0OGQxY2MsXG4gIG1lZGl1bXZpb2xldHJlZDogMHhjNzE1ODUsXG4gIG1pZG5pZ2h0Ymx1ZTogMHgxOTE5NzAsXG4gIG1pbnRjcmVhbTogMHhmNWZmZmEsXG4gIG1pc3R5cm9zZTogMHhmZmU0ZTEsXG4gIG1vY2Nhc2luOiAweGZmZTRiNSxcbiAgbmF2YWpvd2hpdGU6IDB4ZmZkZWFkLFxuICBuYXZ5OiAweDAwMDA4MCxcbiAgb2xkbGFjZTogMHhmZGY1ZTYsXG4gIG9saXZlOiAweDgwODAwMCxcbiAgb2xpdmVkcmFiOiAweDZiOGUyMyxcbiAgb3JhbmdlOiAweGZmYTUwMCxcbiAgb3JhbmdlcmVkOiAweGZmNDUwMCxcbiAgb3JjaGlkOiAweGRhNzBkNixcbiAgcGFsZWdvbGRlbnJvZDogMHhlZWU4YWEsXG4gIHBhbGVncmVlbjogMHg5OGZiOTgsXG4gIHBhbGV0dXJxdW9pc2U6IDB4YWZlZWVlLFxuICBwYWxldmlvbGV0cmVkOiAweGRiNzA5MyxcbiAgcGFwYXlhd2hpcDogMHhmZmVmZDUsXG4gIHBlYWNocHVmZjogMHhmZmRhYjksXG4gIHBlcnU6IDB4Y2Q4NTNmLFxuICBwaW5rOiAweGZmYzBjYixcbiAgcGx1bTogMHhkZGEwZGQsXG4gIHBvd2RlcmJsdWU6IDB4YjBlMGU2LFxuICBwdXJwbGU6IDB4ODAwMDgwLFxuICByZWJlY2NhcHVycGxlOiAweDY2MzM5OSxcbiAgcmVkOiAweGZmMDAwMCxcbiAgcm9zeWJyb3duOiAweGJjOGY4ZixcbiAgcm95YWxibHVlOiAweDQxNjllMSxcbiAgc2FkZGxlYnJvd246IDB4OGI0NTEzLFxuICBzYWxtb246IDB4ZmE4MDcyLFxuICBzYW5keWJyb3duOiAweGY0YTQ2MCxcbiAgc2VhZ3JlZW46IDB4MmU4YjU3LFxuICBzZWFzaGVsbDogMHhmZmY1ZWUsXG4gIHNpZW5uYTogMHhhMDUyMmQsXG4gIHNpbHZlcjogMHhjMGMwYzAsXG4gIHNreWJsdWU6IDB4ODdjZWViLFxuICBzbGF0ZWJsdWU6IDB4NmE1YWNkLFxuICBzbGF0ZWdyYXk6IDB4NzA4MDkwLFxuICBzbGF0ZWdyZXk6IDB4NzA4MDkwLFxuICBzbm93OiAweGZmZmFmYSxcbiAgc3ByaW5nZ3JlZW46IDB4MDBmZjdmLFxuICBzdGVlbGJsdWU6IDB4NDY4MmI0LFxuICB0YW46IDB4ZDJiNDhjLFxuICB0ZWFsOiAweDAwODA4MCxcbiAgdGhpc3RsZTogMHhkOGJmZDgsXG4gIHRvbWF0bzogMHhmZjYzNDcsXG4gIHR1cnF1b2lzZTogMHg0MGUwZDAsXG4gIHZpb2xldDogMHhlZTgyZWUsXG4gIHdoZWF0OiAweGY1ZGViMyxcbiAgd2hpdGU6IDB4ZmZmZmZmLFxuICB3aGl0ZXNtb2tlOiAweGY1ZjVmNSxcbiAgeWVsbG93OiAweGZmZmYwMCxcbiAgeWVsbG93Z3JlZW46IDB4OWFjZDMyXG59O1xuXG5kZWZpbmUoQ29sb3IsIGNvbG9yLCB7XG4gIGNvcHkoY2hhbm5lbHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgdGhpcy5jb25zdHJ1Y3RvciwgdGhpcywgY2hhbm5lbHMpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZ2IoKS5kaXNwbGF5YWJsZSgpO1xuICB9LFxuICBoZXg6IGNvbG9yX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiBjb2xvcl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IGNvbG9yX2Zvcm1hdEhleDgsXG4gIGZvcm1hdEhzbDogY29sb3JfZm9ybWF0SHNsLFxuICBmb3JtYXRSZ2I6IGNvbG9yX2Zvcm1hdFJnYixcbiAgdG9TdHJpbmc6IGNvbG9yX2Zvcm1hdFJnYlxufSk7XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4KCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleDgoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdEhleDgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SHNsKCkge1xuICByZXR1cm4gaHNsQ29udmVydCh0aGlzKS5mb3JtYXRIc2woKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0UmdiKCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRSZ2IoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3IoZm9ybWF0KSB7XG4gIHZhciBtLCBsO1xuICBmb3JtYXQgPSAoZm9ybWF0ICsgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiAobSA9IHJlSGV4LmV4ZWMoZm9ybWF0KSkgPyAobCA9IG1bMV0ubGVuZ3RoLCBtID0gcGFyc2VJbnQobVsxXSwgMTYpLCBsID09PSA2ID8gcmdibihtKSAvLyAjZmYwMDAwXG4gICAgICA6IGwgPT09IDMgPyBuZXcgUmdiKChtID4+IDggJiAweGYpIHwgKG0gPj4gNCAmIDB4ZjApLCAobSA+PiA0ICYgMHhmKSB8IChtICYgMHhmMCksICgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZiksIDEpIC8vICNmMDBcbiAgICAgIDogbCA9PT0gOCA/IHJnYmEobSA+PiAyNCAmIDB4ZmYsIG0gPj4gMTYgJiAweGZmLCBtID4+IDggJiAweGZmLCAobSAmIDB4ZmYpIC8gMHhmZikgLy8gI2ZmMDAwMDAwXG4gICAgICA6IGwgPT09IDQgPyByZ2JhKChtID4+IDEyICYgMHhmKSB8IChtID4+IDggJiAweGYwKSwgKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKCgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZikpIC8gMHhmZikgLy8gI2YwMDBcbiAgICAgIDogbnVsbCkgLy8gaW52YWxpZCBoZXhcbiAgICAgIDogKG0gPSByZVJnYkludGVnZXIuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSwgbVsyXSwgbVszXSwgMSkgLy8gcmdiKDI1NSwgMCwgMClcbiAgICAgIDogKG0gPSByZVJnYlBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgMSkgLy8gcmdiKDEwMCUsIDAlLCAwJSlcbiAgICAgIDogKG0gPSByZVJnYmFJbnRlZ2VyLmV4ZWMoZm9ybWF0KSkgPyByZ2JhKG1bMV0sIG1bMl0sIG1bM10sIG1bNF0pIC8vIHJnYmEoMjU1LCAwLCAwLCAxKVxuICAgICAgOiAobSA9IHJlUmdiYVBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgbVs0XSkgLy8gcmdiKDEwMCUsIDAlLCAwJSwgMSlcbiAgICAgIDogKG0gPSByZUhzbFBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IGhzbGEobVsxXSwgbVsyXSAvIDEwMCwgbVszXSAvIDEwMCwgMSkgLy8gaHNsKDEyMCwgNTAlLCA1MCUpXG4gICAgICA6IChtID0gcmVIc2xhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCBtWzRdKSAvLyBoc2xhKDEyMCwgNTAlLCA1MCUsIDEpXG4gICAgICA6IG5hbWVkLmhhc093blByb3BlcnR5KGZvcm1hdCkgPyByZ2JuKG5hbWVkW2Zvcm1hdF0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICA6IGZvcm1hdCA9PT0gXCJ0cmFuc3BhcmVudFwiID8gbmV3IFJnYihOYU4sIE5hTiwgTmFOLCAwKVxuICAgICAgOiBudWxsO1xufVxuXG5mdW5jdGlvbiByZ2JuKG4pIHtcbiAgcmV0dXJuIG5ldyBSZ2IobiA+PiAxNiAmIDB4ZmYsIG4gPj4gOCAmIDB4ZmYsIG4gJiAweGZmLCAxKTtcbn1cblxuZnVuY3Rpb24gcmdiYShyLCBnLCBiLCBhKSB7XG4gIGlmIChhIDw9IDApIHIgPSBnID0gYiA9IE5hTjtcbiAgcmV0dXJuIG5ldyBSZ2IociwgZywgYiwgYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JDb252ZXJ0KG8pIHtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgUmdiO1xuICBvID0gby5yZ2IoKTtcbiAgcmV0dXJuIG5ldyBSZ2Ioby5yLCBvLmcsIG8uYiwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYihyLCBnLCBiLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gcmdiQ29udmVydChyKSA6IG5ldyBSZ2IociwgZywgYiwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgdGhpcy5yID0gK3I7XG4gIHRoaXMuZyA9ICtnO1xuICB0aGlzLmIgPSArYjtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShSZ2IsIHJnYiwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBSZ2IodGhpcy5yICogaywgdGhpcy5nICogaywgdGhpcy5iICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gZGFya2VyIDogTWF0aC5wb3coZGFya2VyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgUmdiKGNsYW1waSh0aGlzLnIpLCBjbGFtcGkodGhpcy5nKSwgY2xhbXBpKHRoaXMuYiksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgtMC41IDw9IHRoaXMuciAmJiB0aGlzLnIgPCAyNTUuNSlcbiAgICAgICAgJiYgKC0wLjUgPD0gdGhpcy5nICYmIHRoaXMuZyA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmIgJiYgdGhpcy5iIDwgMjU1LjUpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGhleDogcmdiX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiByZ2JfZm9ybWF0SGV4LFxuICBmb3JtYXRIZXg4OiByZ2JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0UmdiOiByZ2JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogcmdiX2Zvcm1hdFJnYlxufSkpO1xuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIGAjJHtoZXgodGhpcy5yKX0ke2hleCh0aGlzLmcpfSR7aGV4KHRoaXMuYil9JHtoZXgoKGlzTmFOKHRoaXMub3BhY2l0eSkgPyAxIDogdGhpcy5vcGFjaXR5KSAqIDI1NSl9YDtcbn1cblxuZnVuY3Rpb24gcmdiX2Zvcm1hdFJnYigpIHtcbiAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICByZXR1cm4gYCR7YSA9PT0gMSA/IFwicmdiKFwiIDogXCJyZ2JhKFwifSR7Y2xhbXBpKHRoaXMucil9LCAke2NsYW1waSh0aGlzLmcpfSwgJHtjbGFtcGkodGhpcy5iKX0ke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xufVxuXG5mdW5jdGlvbiBjbGFtcGEob3BhY2l0eSkge1xuICByZXR1cm4gaXNOYU4ob3BhY2l0eSkgPyAxIDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgb3BhY2l0eSkpO1xufVxuXG5mdW5jdGlvbiBjbGFtcGkodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZCh2YWx1ZSkgfHwgMCkpO1xufVxuXG5mdW5jdGlvbiBoZXgodmFsdWUpIHtcbiAgdmFsdWUgPSBjbGFtcGkodmFsdWUpO1xuICByZXR1cm4gKHZhbHVlIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgdmFsdWUudG9TdHJpbmcoMTYpO1xufVxuXG5mdW5jdGlvbiBoc2xhKGgsIHMsIGwsIGEpIHtcbiAgaWYgKGEgPD0gMCkgaCA9IHMgPSBsID0gTmFOO1xuICBlbHNlIGlmIChsIDw9IDAgfHwgbCA+PSAxKSBoID0gcyA9IE5hTjtcbiAgZWxzZSBpZiAocyA8PSAwKSBoID0gTmFOO1xuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhzbENvbnZlcnQobykge1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG5ldyBIc2woby5oLCBvLnMsIG8ubCwgby5vcGFjaXR5KTtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgSHNsO1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG87XG4gIG8gPSBvLnJnYigpO1xuICB2YXIgciA9IG8uciAvIDI1NSxcbiAgICAgIGcgPSBvLmcgLyAyNTUsXG4gICAgICBiID0gby5iIC8gMjU1LFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGggPSBOYU4sXG4gICAgICBzID0gbWF4IC0gbWluLFxuICAgICAgbCA9IChtYXggKyBtaW4pIC8gMjtcbiAgaWYgKHMpIHtcbiAgICBpZiAociA9PT0gbWF4KSBoID0gKGcgLSBiKSAvIHMgKyAoZyA8IGIpICogNjtcbiAgICBlbHNlIGlmIChnID09PSBtYXgpIGggPSAoYiAtIHIpIC8gcyArIDI7XG4gICAgZWxzZSBoID0gKHIgLSBnKSAvIHMgKyA0O1xuICAgIHMgLz0gbCA8IDAuNSA/IG1heCArIG1pbiA6IDIgLSBtYXggLSBtaW47XG4gICAgaCAqPSA2MDtcbiAgfSBlbHNlIHtcbiAgICBzID0gbCA+IDAgJiYgbCA8IDEgPyAwIDogaDtcbiAgfVxuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBoc2xDb252ZXJ0KGgpIDogbmV3IEhzbChoLCBzLCBsLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmZ1bmN0aW9uIEhzbChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHRoaXMuaCA9ICtoO1xuICB0aGlzLnMgPSArcztcbiAgdGhpcy5sID0gK2w7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoSHNsLCBoc2wsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGJyaWdodGVyIDogTWF0aC5wb3coYnJpZ2h0ZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgdmFyIGggPSB0aGlzLmggJSAzNjAgKyAodGhpcy5oIDwgMCkgKiAzNjAsXG4gICAgICAgIHMgPSBpc05hTihoKSB8fCBpc05hTih0aGlzLnMpID8gMCA6IHRoaXMucyxcbiAgICAgICAgbCA9IHRoaXMubCxcbiAgICAgICAgbTIgPSBsICsgKGwgPCAwLjUgPyBsIDogMSAtIGwpICogcyxcbiAgICAgICAgbTEgPSAyICogbCAtIG0yO1xuICAgIHJldHVybiBuZXcgUmdiKFxuICAgICAgaHNsMnJnYihoID49IDI0MCA/IGggLSAyNDAgOiBoICsgMTIwLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoIDwgMTIwID8gaCArIDI0MCA6IGggLSAxMjAsIG0xLCBtMiksXG4gICAgICB0aGlzLm9wYWNpdHlcbiAgICApO1xuICB9LFxuICBjbGFtcCgpIHtcbiAgICByZXR1cm4gbmV3IEhzbChjbGFtcGgodGhpcy5oKSwgY2xhbXB0KHRoaXMucyksIGNsYW1wdCh0aGlzLmwpLCBjbGFtcGEodGhpcy5vcGFjaXR5KSk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiAoMCA8PSB0aGlzLnMgJiYgdGhpcy5zIDw9IDEgfHwgaXNOYU4odGhpcy5zKSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5sICYmIHRoaXMubCA8PSAxKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLm9wYWNpdHkgJiYgdGhpcy5vcGFjaXR5IDw9IDEpO1xuICB9LFxuICBmb3JtYXRIc2woKSB7XG4gICAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICAgIHJldHVybiBgJHthID09PSAxID8gXCJoc2woXCIgOiBcImhzbGEoXCJ9JHtjbGFtcGgodGhpcy5oKX0sICR7Y2xhbXB0KHRoaXMucykgKiAxMDB9JSwgJHtjbGFtcHQodGhpcy5sKSAqIDEwMH0lJHthID09PSAxID8gXCIpXCIgOiBgLCAke2F9KWB9YDtcbiAgfVxufSkpO1xuXG5mdW5jdGlvbiBjbGFtcGgodmFsdWUpIHtcbiAgdmFsdWUgPSAodmFsdWUgfHwgMCkgJSAzNjA7XG4gIHJldHVybiB2YWx1ZSA8IDAgPyB2YWx1ZSArIDM2MCA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbGFtcHQodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbHVlIHx8IDApKTtcbn1cblxuLyogRnJvbSBGdkQgMTMuMzcsIENTUyBDb2xvciBNb2R1bGUgTGV2ZWwgMyAqL1xuZnVuY3Rpb24gaHNsMnJnYihoLCBtMSwgbTIpIHtcbiAgcmV0dXJuIChoIDwgNjAgPyBtMSArIChtMiAtIG0xKSAqIGggLyA2MFxuICAgICAgOiBoIDwgMTgwID8gbTJcbiAgICAgIDogaCA8IDI0MCA/IG0xICsgKG0yIC0gbTEpICogKDI0MCAtIGgpIC8gNjBcbiAgICAgIDogbTEpICogMjU1O1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBiYXNpcyh0MSwgdjAsIHYxLCB2MiwgdjMpIHtcbiAgdmFyIHQyID0gdDEgKiB0MSwgdDMgPSB0MiAqIHQxO1xuICByZXR1cm4gKCgxIC0gMyAqIHQxICsgMyAqIHQyIC0gdDMpICogdjBcbiAgICAgICsgKDQgLSA2ICogdDIgKyAzICogdDMpICogdjFcbiAgICAgICsgKDEgKyAzICogdDEgKyAzICogdDIgLSAzICogdDMpICogdjJcbiAgICAgICsgdDMgKiB2MykgLyA2O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG4gPSB2YWx1ZXMubGVuZ3RoIC0gMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQgPD0gMCA/ICh0ID0gMCkgOiB0ID49IDEgPyAodCA9IDEsIG4gLSAxKSA6IE1hdGguZmxvb3IodCAqIG4pLFxuICAgICAgICB2MSA9IHZhbHVlc1tpXSxcbiAgICAgICAgdjIgPSB2YWx1ZXNbaSArIDFdLFxuICAgICAgICB2MCA9IGkgPiAwID8gdmFsdWVzW2kgLSAxXSA6IDIgKiB2MSAtIHYyLFxuICAgICAgICB2MyA9IGkgPCBuIC0gMSA/IHZhbHVlc1tpICsgMl0gOiAyICogdjIgLSB2MTtcbiAgICByZXR1cm4gYmFzaXMoKHQgLSBpIC8gbikgKiBuLCB2MCwgdjEsIHYyLCB2Myk7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtiYXNpc30gZnJvbSBcIi4vYmFzaXMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWVzKSB7XG4gIHZhciBuID0gdmFsdWVzLmxlbmd0aDtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IE1hdGguZmxvb3IoKCh0ICU9IDEpIDwgMCA/ICsrdCA6IHQpICogbiksXG4gICAgICAgIHYwID0gdmFsdWVzWyhpICsgbiAtIDEpICUgbl0sXG4gICAgICAgIHYxID0gdmFsdWVzW2kgJSBuXSxcbiAgICAgICAgdjIgPSB2YWx1ZXNbKGkgKyAxKSAlIG5dLFxuICAgICAgICB2MyA9IHZhbHVlc1soaSArIDIpICUgbl07XG4gICAgcmV0dXJuIGJhc2lzKCh0IC0gaSAvIG4pICogbiwgdjAsIHYxLCB2MiwgdjMpO1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IHggPT4gKCkgPT4geDtcbiIsICJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gbGluZWFyKGEsIGQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSArIHQgKiBkO1xuICB9O1xufVxuXG5mdW5jdGlvbiBleHBvbmVudGlhbChhLCBiLCB5KSB7XG4gIHJldHVybiBhID0gTWF0aC5wb3coYSwgeSksIGIgPSBNYXRoLnBvdyhiLCB5KSAtIGEsIHkgPSAxIC8geSwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyhhICsgdCAqIGIsIHkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVlKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCA+IDE4MCB8fCBkIDwgLTE4MCA/IGQgLSAzNjAgKiBNYXRoLnJvdW5kKGQgLyAzNjApIDogZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdhbW1hKHkpIHtcbiAgcmV0dXJuICh5ID0gK3kpID09PSAxID8gbm9nYW1tYSA6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYiAtIGEgPyBleHBvbmVudGlhbChhLCBiLCB5KSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub2dhbW1hKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cbiIsICJpbXBvcnQge3JnYiBhcyBjb2xvclJnYn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgYmFzaXMgZnJvbSBcIi4vYmFzaXMuanNcIjtcbmltcG9ydCBiYXNpc0Nsb3NlZCBmcm9tIFwiLi9iYXNpc0Nsb3NlZC5qc1wiO1xuaW1wb3J0IG5vZ2FtbWEsIHtnYW1tYX0gZnJvbSBcIi4vY29sb3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIHJnYkdhbW1hKHkpIHtcbiAgdmFyIGNvbG9yID0gZ2FtbWEoeSk7XG5cbiAgZnVuY3Rpb24gcmdiKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgciA9IGNvbG9yKChzdGFydCA9IGNvbG9yUmdiKHN0YXJ0KSkuciwgKGVuZCA9IGNvbG9yUmdiKGVuZCkpLnIpLFxuICAgICAgICBnID0gY29sb3Ioc3RhcnQuZywgZW5kLmcpLFxuICAgICAgICBiID0gY29sb3Ioc3RhcnQuYiwgZW5kLmIpLFxuICAgICAgICBvcGFjaXR5ID0gbm9nYW1tYShzdGFydC5vcGFjaXR5LCBlbmQub3BhY2l0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHN0YXJ0LnIgPSByKHQpO1xuICAgICAgc3RhcnQuZyA9IGcodCk7XG4gICAgICBzdGFydC5iID0gYih0KTtcbiAgICAgIHN0YXJ0Lm9wYWNpdHkgPSBvcGFjaXR5KHQpO1xuICAgICAgcmV0dXJuIHN0YXJ0ICsgXCJcIjtcbiAgICB9O1xuICB9XG5cbiAgcmdiLmdhbW1hID0gcmdiR2FtbWE7XG5cbiAgcmV0dXJuIHJnYjtcbn0pKDEpO1xuXG5mdW5jdGlvbiByZ2JTcGxpbmUoc3BsaW5lKSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xvcnMpIHtcbiAgICB2YXIgbiA9IGNvbG9ycy5sZW5ndGgsXG4gICAgICAgIHIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGcgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGksIGNvbG9yO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGNvbG9yID0gY29sb3JSZ2IoY29sb3JzW2ldKTtcbiAgICAgIHJbaV0gPSBjb2xvci5yIHx8IDA7XG4gICAgICBnW2ldID0gY29sb3IuZyB8fCAwO1xuICAgICAgYltpXSA9IGNvbG9yLmIgfHwgMDtcbiAgICB9XG4gICAgciA9IHNwbGluZShyKTtcbiAgICBnID0gc3BsaW5lKGcpO1xuICAgIGIgPSBzcGxpbmUoYik7XG4gICAgY29sb3Iub3BhY2l0eSA9IDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGNvbG9yLnIgPSByKHQpO1xuICAgICAgY29sb3IuZyA9IGcodCk7XG4gICAgICBjb2xvci5iID0gYih0KTtcbiAgICAgIHJldHVybiBjb2xvciArIFwiXCI7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciByZ2JCYXNpcyA9IHJnYlNwbGluZShiYXNpcyk7XG5leHBvcnQgdmFyIHJnYkJhc2lzQ2xvc2VkID0gcmdiU3BsaW5lKGJhc2lzQ2xvc2VkKTtcbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIGlmICghYikgYiA9IFtdO1xuICB2YXIgbiA9IGEgPyBNYXRoLm1pbihiLmxlbmd0aCwgYS5sZW5ndGgpIDogMCxcbiAgICAgIGMgPSBiLnNsaWNlKCksXG4gICAgICBpO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIGNbaV0gPSBhW2ldICogKDEgLSB0KSArIGJbaV0gKiB0O1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXJBcnJheSh4KSB7XG4gIHJldHVybiBBcnJheUJ1ZmZlci5pc1ZpZXcoeCkgJiYgISh4IGluc3RhbmNlb2YgRGF0YVZpZXcpO1xufVxuIiwgImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gKGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheSA6IGdlbmVyaWNBcnJheSkoYSwgYik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmljQXJyYXkoYSwgYikge1xuICB2YXIgbmIgPSBiID8gYi5sZW5ndGggOiAwLFxuICAgICAgbmEgPSBhID8gTWF0aC5taW4obmIsIGEubGVuZ3RoKSA6IDAsXG4gICAgICB4ID0gbmV3IEFycmF5KG5hKSxcbiAgICAgIGMgPSBuZXcgQXJyYXkobmIpLFxuICAgICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbmE7ICsraSkgeFtpXSA9IHZhbHVlKGFbaV0sIGJbaV0pO1xuICBmb3IgKDsgaSA8IG5iOyArK2kpIGNbaV0gPSBiW2ldO1xuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIGNbaV0gPSB4W2ldKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZTtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGQuc2V0VGltZShhICogKDEgLSB0KSArIGIgKiB0KSwgZDtcbiAgfTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhID0gK2EsIGIgPSArYiwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBhICogKDEgLSB0KSArIGIgKiB0O1xuICB9O1xufVxuIiwgImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBpID0ge30sXG4gICAgICBjID0ge30sXG4gICAgICBrO1xuXG4gIGlmIChhID09PSBudWxsIHx8IHR5cGVvZiBhICE9PSBcIm9iamVjdFwiKSBhID0ge307XG4gIGlmIChiID09PSBudWxsIHx8IHR5cGVvZiBiICE9PSBcIm9iamVjdFwiKSBiID0ge307XG5cbiAgZm9yIChrIGluIGIpIHtcbiAgICBpZiAoayBpbiBhKSB7XG4gICAgICBpW2tdID0gdmFsdWUoYVtrXSwgYltrXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNba10gPSBiW2tdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChrIGluIGkpIGNba10gPSBpW2tdKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwgImltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciByZUEgPSAvWy0rXT8oPzpcXGQrXFwuP1xcZCp8XFwuP1xcZCspKD86W2VFXVstK10/XFxkKyk/L2csXG4gICAgcmVCID0gbmV3IFJlZ0V4cChyZUEuc291cmNlLCBcImdcIik7XG5cbmZ1bmN0aW9uIHplcm8oYikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGI7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uZShiKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGIodCkgKyBcIlwiO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBiaSA9IHJlQS5sYXN0SW5kZXggPSByZUIubGFzdEluZGV4ID0gMCwgLy8gc2NhbiBpbmRleCBmb3IgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYW0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYVxuICAgICAgYm0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYlxuICAgICAgYnMsIC8vIHN0cmluZyBwcmVjZWRpbmcgY3VycmVudCBudW1iZXIgaW4gYiwgaWYgYW55XG4gICAgICBpID0gLTEsIC8vIGluZGV4IGluIHNcbiAgICAgIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICBxID0gW107IC8vIG51bWJlciBpbnRlcnBvbGF0b3JzXG5cbiAgLy8gQ29lcmNlIGlucHV0cyB0byBzdHJpbmdzLlxuICBhID0gYSArIFwiXCIsIGIgPSBiICsgXCJcIjtcblxuICAvLyBJbnRlcnBvbGF0ZSBwYWlycyBvZiBudW1iZXJzIGluIGEgJiBiLlxuICB3aGlsZSAoKGFtID0gcmVBLmV4ZWMoYSkpXG4gICAgICAmJiAoYm0gPSByZUIuZXhlYyhiKSkpIHtcbiAgICBpZiAoKGJzID0gYm0uaW5kZXgpID4gYmkpIHsgLy8gYSBzdHJpbmcgcHJlY2VkZXMgdGhlIG5leHQgbnVtYmVyIGluIGJcbiAgICAgIGJzID0gYi5zbGljZShiaSwgYnMpO1xuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJzO1xuICAgIH1cbiAgICBpZiAoKGFtID0gYW1bMF0pID09PSAoYm0gPSBibVswXSkpIHsgLy8gbnVtYmVycyBpbiBhICYgYiBtYXRjaFxuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYm07IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJtO1xuICAgIH0gZWxzZSB7IC8vIGludGVycG9sYXRlIG5vbi1tYXRjaGluZyBudW1iZXJzXG4gICAgICBzWysraV0gPSBudWxsO1xuICAgICAgcS5wdXNoKHtpOiBpLCB4OiBudW1iZXIoYW0sIGJtKX0pO1xuICAgIH1cbiAgICBiaSA9IHJlQi5sYXN0SW5kZXg7XG4gIH1cblxuICAvLyBBZGQgcmVtYWlucyBvZiBiLlxuICBpZiAoYmkgPCBiLmxlbmd0aCkge1xuICAgIGJzID0gYi5zbGljZShiaSk7XG4gICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgZWxzZSBzWysraV0gPSBicztcbiAgfVxuXG4gIC8vIFNwZWNpYWwgb3B0aW1pemF0aW9uIGZvciBvbmx5IGEgc2luZ2xlIG1hdGNoLlxuICAvLyBPdGhlcndpc2UsIGludGVycG9sYXRlIGVhY2ggb2YgdGhlIG51bWJlcnMgYW5kIHJlam9pbiB0aGUgc3RyaW5nLlxuICByZXR1cm4gcy5sZW5ndGggPCAyID8gKHFbMF1cbiAgICAgID8gb25lKHFbMF0ueClcbiAgICAgIDogemVybyhiKSlcbiAgICAgIDogKGIgPSBxLmxlbmd0aCwgZnVuY3Rpb24odCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBvOyBpIDwgYjsgKytpKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICAgICAgfSk7XG59XG4iLCAiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgcmdiIGZyb20gXCIuL3JnYi5qc1wiO1xuaW1wb3J0IHtnZW5lcmljQXJyYXl9IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQgZGF0ZSBmcm9tIFwiLi9kYXRlLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuaW1wb3J0IG9iamVjdCBmcm9tIFwiLi9vYmplY3QuanNcIjtcbmltcG9ydCBzdHJpbmcgZnJvbSBcIi4vc3RyaW5nLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIHQgPSB0eXBlb2YgYiwgYztcbiAgcmV0dXJuIGIgPT0gbnVsbCB8fCB0ID09PSBcImJvb2xlYW5cIiA/IGNvbnN0YW50KGIpXG4gICAgICA6ICh0ID09PSBcIm51bWJlclwiID8gbnVtYmVyXG4gICAgICA6IHQgPT09IFwic3RyaW5nXCIgPyAoKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIHJnYikgOiBzdHJpbmcpXG4gICAgICA6IGIgaW5zdGFuY2VvZiBjb2xvciA/IHJnYlxuICAgICAgOiBiIGluc3RhbmNlb2YgRGF0ZSA/IGRhdGVcbiAgICAgIDogaXNOdW1iZXJBcnJheShiKSA/IG51bWJlckFycmF5XG4gICAgICA6IEFycmF5LmlzQXJyYXkoYikgPyBnZW5lcmljQXJyYXlcbiAgICAgIDogdHlwZW9mIGIudmFsdWVPZiAhPT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBiLnRvU3RyaW5nICE9PSBcImZ1bmN0aW9uXCIgfHwgaXNOYU4oYikgPyBvYmplY3RcbiAgICAgIDogbnVtYmVyKShhLCBiKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhID0gK2EsIGIgPSArYiwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKGEgKiAoMSAtIHQpICsgYiAqIHQpO1xuICB9O1xufVxuIiwgInZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IHtcbiAgdHJhbnNsYXRlWDogMCxcbiAgdHJhbnNsYXRlWTogMCxcbiAgcm90YXRlOiAwLFxuICBza2V3WDogMCxcbiAgc2NhbGVYOiAxLFxuICBzY2FsZVk6IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgdmFyIHNjYWxlWCwgc2NhbGVZLCBza2V3WDtcbiAgaWYgKHNjYWxlWCA9IE1hdGguc3FydChhICogYSArIGIgKiBiKSkgYSAvPSBzY2FsZVgsIGIgLz0gc2NhbGVYO1xuICBpZiAoc2tld1ggPSBhICogYyArIGIgKiBkKSBjIC09IGEgKiBza2V3WCwgZCAtPSBiICogc2tld1g7XG4gIGlmIChzY2FsZVkgPSBNYXRoLnNxcnQoYyAqIGMgKyBkICogZCkpIGMgLz0gc2NhbGVZLCBkIC89IHNjYWxlWSwgc2tld1ggLz0gc2NhbGVZO1xuICBpZiAoYSAqIGQgPCBiICogYykgYSA9IC1hLCBiID0gLWIsIHNrZXdYID0gLXNrZXdYLCBzY2FsZVggPSAtc2NhbGVYO1xuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IGUsXG4gICAgdHJhbnNsYXRlWTogZixcbiAgICByb3RhdGU6IE1hdGguYXRhbjIoYiwgYSkgKiBkZWdyZWVzLFxuICAgIHNrZXdYOiBNYXRoLmF0YW4oc2tld1gpICogZGVncmVlcyxcbiAgICBzY2FsZVg6IHNjYWxlWCxcbiAgICBzY2FsZVk6IHNjYWxlWVxuICB9O1xufVxuIiwgImltcG9ydCBkZWNvbXBvc2UsIHtpZGVudGl0eX0gZnJvbSBcIi4vZGVjb21wb3NlLmpzXCI7XG5cbnZhciBzdmdOb2RlO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ3NzKHZhbHVlKSB7XG4gIGNvbnN0IG0gPSBuZXcgKHR5cGVvZiBET01NYXRyaXggPT09IFwiZnVuY3Rpb25cIiA/IERPTU1hdHJpeCA6IFdlYktpdENTU01hdHJpeCkodmFsdWUgKyBcIlwiKTtcbiAgcmV0dXJuIG0uaXNJZGVudGl0eSA/IGlkZW50aXR5IDogZGVjb21wb3NlKG0uYSwgbS5iLCBtLmMsIG0uZCwgbS5lLCBtLmYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdmcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBpZGVudGl0eTtcbiAgaWYgKCFzdmdOb2RlKSBzdmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJnXCIpO1xuICBzdmdOb2RlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB2YWx1ZSk7XG4gIGlmICghKHZhbHVlID0gc3ZnTm9kZS50cmFuc2Zvcm0uYmFzZVZhbC5jb25zb2xpZGF0ZSgpKSkgcmV0dXJuIGlkZW50aXR5O1xuICB2YWx1ZSA9IHZhbHVlLm1hdHJpeDtcbiAgcmV0dXJuIGRlY29tcG9zZSh2YWx1ZS5hLCB2YWx1ZS5iLCB2YWx1ZS5jLCB2YWx1ZS5kLCB2YWx1ZS5lLCB2YWx1ZS5mKTtcbn1cbiIsICJpbXBvcnQgbnVtYmVyIGZyb20gXCIuLi9udW1iZXIuanNcIjtcbmltcG9ydCB7cGFyc2VDc3MsIHBhcnNlU3ZnfSBmcm9tIFwiLi9wYXJzZS5qc1wiO1xuXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZSwgcHhDb21tYSwgcHhQYXJlbiwgZGVnUGFyZW4pIHtcblxuICBmdW5jdGlvbiBwb3Aocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA/IHMucG9wKCkgKyBcIiBcIiA6IFwiXCI7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2xhdGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2goXCJ0cmFuc2xhdGUoXCIsIG51bGwsIHB4Q29tbWEsIG51bGwsIHB4UGFyZW4pO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiB8fCB5Yikge1xuICAgICAgcy5wdXNoKFwidHJhbnNsYXRlKFwiICsgeGIgKyBweENvbW1hICsgeWIgKyBweFBhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByb3RhdGUoYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBpZiAoYSAtIGIgPiAxODApIGIgKz0gMzYwOyBlbHNlIGlmIChiIC0gYSA+IDE4MCkgYSArPSAzNjA7IC8vIHNob3J0ZXN0IHBhdGhcbiAgICAgIHEucHVzaCh7aTogcy5wdXNoKHBvcChzKSArIFwicm90YXRlKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2tld1goYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiICsgYiArIGRlZ1BhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4YSwgeWEsIHhiLCB5YiwgcywgcSkge1xuICAgIGlmICh4YSAhPT0geGIgfHwgeWEgIT09IHliKSB7XG4gICAgICB2YXIgaSA9IHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiLCBudWxsLCBcIixcIiwgbnVsbCwgXCIpXCIpO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiAhPT0gMSB8fCB5YiAhPT0gMSkge1xuICAgICAgcy5wdXNoKHBvcChzKSArIFwic2NhbGUoXCIgKyB4YiArIFwiLFwiICsgeWIgKyBcIilcIik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgICAgcSA9IFtdOyAvLyBudW1iZXIgaW50ZXJwb2xhdG9yc1xuICAgIGEgPSBwYXJzZShhKSwgYiA9IHBhcnNlKGIpO1xuICAgIHRyYW5zbGF0ZShhLnRyYW5zbGF0ZVgsIGEudHJhbnNsYXRlWSwgYi50cmFuc2xhdGVYLCBiLnRyYW5zbGF0ZVksIHMsIHEpO1xuICAgIHJvdGF0ZShhLnJvdGF0ZSwgYi5yb3RhdGUsIHMsIHEpO1xuICAgIHNrZXdYKGEuc2tld1gsIGIuc2tld1gsIHMsIHEpO1xuICAgIHNjYWxlKGEuc2NhbGVYLCBhLnNjYWxlWSwgYi5zY2FsZVgsIGIuc2NhbGVZLCBzLCBxKTtcbiAgICBhID0gYiA9IG51bGw7IC8vIGdjXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBxLmxlbmd0aCwgbztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZUNzcywgXCJweCwgXCIsIFwicHgpXCIsIFwiZGVnKVwiKTtcbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZVN2ZywgXCIsIFwiLCBcIilcIiwgXCIpXCIpO1xuIiwgInZhciBmcmFtZSA9IDAsIC8vIGlzIGFuIGFuaW1hdGlvbiBmcmFtZSBwZW5kaW5nP1xuICAgIHRpbWVvdXQgPSAwLCAvLyBpcyBhIHRpbWVvdXQgcGVuZGluZz9cbiAgICBpbnRlcnZhbCA9IDAsIC8vIGFyZSBhbnkgdGltZXJzIGFjdGl2ZT9cbiAgICBwb2tlRGVsYXkgPSAxMDAwLCAvLyBob3cgZnJlcXVlbnRseSB3ZSBjaGVjayBmb3IgY2xvY2sgc2tld1xuICAgIHRhc2tIZWFkLFxuICAgIHRhc2tUYWlsLFxuICAgIGNsb2NrTGFzdCA9IDAsXG4gICAgY2xvY2tOb3cgPSAwLFxuICAgIGNsb2NrU2tldyA9IDAsXG4gICAgY2xvY2sgPSB0eXBlb2YgcGVyZm9ybWFuY2UgPT09IFwib2JqZWN0XCIgJiYgcGVyZm9ybWFuY2Uubm93ID8gcGVyZm9ybWFuY2UgOiBEYXRlLFxuICAgIHNldEZyYW1lID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBmdW5jdGlvbihmKSB7IHNldFRpbWVvdXQoZiwgMTcpOyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gY2xvY2tOb3cgfHwgKHNldEZyYW1lKGNsZWFyTm93KSwgY2xvY2tOb3cgPSBjbG9jay5ub3coKSArIGNsb2NrU2tldyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyTm93KCkge1xuICBjbG9ja05vdyA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUaW1lcigpIHtcbiAgdGhpcy5fY2FsbCA9XG4gIHRoaXMuX3RpbWUgPVxuICB0aGlzLl9uZXh0ID0gbnVsbDtcbn1cblxuVGltZXIucHJvdG90eXBlID0gdGltZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVGltZXIsXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbGxiYWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIHRpbWUgPSAodGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZSkgKyAoZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXkpO1xuICAgIGlmICghdGhpcy5fbmV4dCAmJiB0YXNrVGFpbCAhPT0gdGhpcykge1xuICAgICAgaWYgKHRhc2tUYWlsKSB0YXNrVGFpbC5fbmV4dCA9IHRoaXM7XG4gICAgICBlbHNlIHRhc2tIZWFkID0gdGhpcztcbiAgICAgIHRhc2tUYWlsID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5fY2FsbCA9IGNhbGxiYWNrO1xuICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIHNsZWVwKCk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jYWxsKSB7XG4gICAgICB0aGlzLl9jYWxsID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWUgPSBJbmZpbml0eTtcbiAgICAgIHNsZWVwKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZXIoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICB0LnJlc3RhcnQoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lckZsdXNoKCkge1xuICBub3coKTsgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWUsIGlmIG5vdCBhbHJlYWR5IHNldC5cbiAgKytmcmFtZTsgLy8gUHJldGVuZCB3ZVx1MjAxOXZlIHNldCBhbiBhbGFybSwgaWYgd2UgaGF2ZW5cdTIwMTl0IGFscmVhZHkuXG4gIHZhciB0ID0gdGFza0hlYWQsIGU7XG4gIHdoaWxlICh0KSB7XG4gICAgaWYgKChlID0gY2xvY2tOb3cgLSB0Ll90aW1lKSA+PSAwKSB0Ll9jYWxsLmNhbGwodW5kZWZpbmVkLCBlKTtcbiAgICB0ID0gdC5fbmV4dDtcbiAgfVxuICAtLWZyYW1lO1xufVxuXG5mdW5jdGlvbiB3YWtlKCkge1xuICBjbG9ja05vdyA9IChjbG9ja0xhc3QgPSBjbG9jay5ub3coKSkgKyBjbG9ja1NrZXc7XG4gIGZyYW1lID0gdGltZW91dCA9IDA7XG4gIHRyeSB7XG4gICAgdGltZXJGbHVzaCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGZyYW1lID0gMDtcbiAgICBuYXAoKTtcbiAgICBjbG9ja05vdyA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9rZSgpIHtcbiAgdmFyIG5vdyA9IGNsb2NrLm5vdygpLCBkZWxheSA9IG5vdyAtIGNsb2NrTGFzdDtcbiAgaWYgKGRlbGF5ID4gcG9rZURlbGF5KSBjbG9ja1NrZXcgLT0gZGVsYXksIGNsb2NrTGFzdCA9IG5vdztcbn1cblxuZnVuY3Rpb24gbmFwKCkge1xuICB2YXIgdDAsIHQxID0gdGFza0hlYWQsIHQyLCB0aW1lID0gSW5maW5pdHk7XG4gIHdoaWxlICh0MSkge1xuICAgIGlmICh0MS5fY2FsbCkge1xuICAgICAgaWYgKHRpbWUgPiB0MS5fdGltZSkgdGltZSA9IHQxLl90aW1lO1xuICAgICAgdDAgPSB0MSwgdDEgPSB0MS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdDIgPSB0MS5fbmV4dCwgdDEuX25leHQgPSBudWxsO1xuICAgICAgdDEgPSB0MCA/IHQwLl9uZXh0ID0gdDIgOiB0YXNrSGVhZCA9IHQyO1xuICAgIH1cbiAgfVxuICB0YXNrVGFpbCA9IHQwO1xuICBzbGVlcCh0aW1lKTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSkge1xuICBpZiAoZnJhbWUpIHJldHVybjsgLy8gU29vbmVzdCBhbGFybSBhbHJlYWR5IHNldCwgb3Igd2lsbCBiZS5cbiAgaWYgKHRpbWVvdXQpIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gIHZhciBkZWxheSA9IHRpbWUgLSBjbG9ja05vdzsgLy8gU3RyaWN0bHkgbGVzcyB0aGFuIGlmIHdlIHJlY29tcHV0ZWQgY2xvY2tOb3cuXG4gIGlmIChkZWxheSA+IDI0KSB7XG4gICAgaWYgKHRpbWUgPCBJbmZpbml0eSkgdGltZW91dCA9IHNldFRpbWVvdXQod2FrZSwgdGltZSAtIGNsb2NrLm5vdygpIC0gY2xvY2tTa2V3KTtcbiAgICBpZiAoaW50ZXJ2YWwpIGludGVydmFsID0gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpbnRlcnZhbCkgY2xvY2tMYXN0ID0gY2xvY2subm93KCksIGludGVydmFsID0gc2V0SW50ZXJ2YWwocG9rZSwgcG9rZURlbGF5KTtcbiAgICBmcmFtZSA9IDEsIHNldEZyYW1lKHdha2UpO1xuICB9XG59XG4iLCAiaW1wb3J0IHtUaW1lcn0gZnJvbSBcIi4vdGltZXIuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICBkZWxheSA9IGRlbGF5ID09IG51bGwgPyAwIDogK2RlbGF5O1xuICB0LnJlc3RhcnQoZWxhcHNlZCA9PiB7XG4gICAgdC5zdG9wKCk7XG4gICAgY2FsbGJhY2soZWxhcHNlZCArIGRlbGF5KTtcbiAgfSwgZGVsYXksIHRpbWUpO1xuICByZXR1cm4gdDtcbn1cbiIsICJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7dGltZXIsIHRpbWVvdXR9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZW1wdHlPbiA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIiwgXCJjYW5jZWxcIiwgXCJpbnRlcnJ1cHRcIik7XG52YXIgZW1wdHlUd2VlbiA9IFtdO1xuXG5leHBvcnQgdmFyIENSRUFURUQgPSAwO1xuZXhwb3J0IHZhciBTQ0hFRFVMRUQgPSAxO1xuZXhwb3J0IHZhciBTVEFSVElORyA9IDI7XG5leHBvcnQgdmFyIFNUQVJURUQgPSAzO1xuZXhwb3J0IHZhciBSVU5OSU5HID0gNDtcbmV4cG9ydCB2YXIgRU5ESU5HID0gNTtcbmV4cG9ydCB2YXIgRU5ERUQgPSA2O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lLCBpZCwgaW5kZXgsIGdyb3VwLCB0aW1pbmcpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlcykgbm9kZS5fX3RyYW5zaXRpb24gPSB7fTtcbiAgZWxzZSBpZiAoaWQgaW4gc2NoZWR1bGVzKSByZXR1cm47XG4gIGNyZWF0ZShub2RlLCBpZCwge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgaW5kZXg6IGluZGV4LCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgZ3JvdXA6IGdyb3VwLCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgb246IGVtcHR5T24sXG4gICAgdHdlZW46IGVtcHR5VHdlZW4sXG4gICAgdGltZTogdGltaW5nLnRpbWUsXG4gICAgZGVsYXk6IHRpbWluZy5kZWxheSxcbiAgICBkdXJhdGlvbjogdGltaW5nLmR1cmF0aW9uLFxuICAgIGVhc2U6IHRpbWluZy5lYXNlLFxuICAgIHRpbWVyOiBudWxsLFxuICAgIHN0YXRlOiBDUkVBVEVEXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBDUkVBVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBzY2hlZHVsZWRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBTVEFSVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBydW5uaW5nXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGUgfHwgIShzY2hlZHVsZSA9IHNjaGVkdWxlW2lkXSkpIHRocm93IG5ldyBFcnJvcihcInRyYW5zaXRpb24gbm90IGZvdW5kXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShub2RlLCBpZCwgc2VsZikge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICB0d2VlbjtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzZWxmIHRpbWVyIHdoZW4gdGhlIHRyYW5zaXRpb24gaXMgY3JlYXRlZC5cbiAgLy8gTm90ZSB0aGUgYWN0dWFsIGRlbGF5IGlzIG5vdCBrbm93biB1bnRpbCB0aGUgZmlyc3QgY2FsbGJhY2shXG4gIHNjaGVkdWxlc1tpZF0gPSBzZWxmO1xuICBzZWxmLnRpbWVyID0gdGltZXIoc2NoZWR1bGUsIDAsIHNlbGYudGltZSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoZWxhcHNlZCkge1xuICAgIHNlbGYuc3RhdGUgPSBTQ0hFRFVMRUQ7XG4gICAgc2VsZi50aW1lci5yZXN0YXJ0KHN0YXJ0LCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuXG4gICAgLy8gSWYgdGhlIGVsYXBzZWQgZGVsYXkgaXMgbGVzcyB0aGFuIG91ciBmaXJzdCBzbGVlcCwgc3RhcnQgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHNlbGYuZGVsYXkgPD0gZWxhcHNlZCkgc3RhcnQoZWxhcHNlZCAtIHNlbGYuZGVsYXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQoZWxhcHNlZCkge1xuICAgIHZhciBpLCBqLCBuLCBvO1xuXG4gICAgLy8gSWYgdGhlIHN0YXRlIGlzIG5vdCBTQ0hFRFVMRUQsIHRoZW4gd2UgcHJldmlvdXNseSBlcnJvcmVkIG9uIHN0YXJ0LlxuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTQ0hFRFVMRUQpIHJldHVybiBzdG9wKCk7XG5cbiAgICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgICBvID0gc2NoZWR1bGVzW2ldO1xuICAgICAgaWYgKG8ubmFtZSAhPT0gc2VsZi5uYW1lKSBjb250aW51ZTtcblxuICAgICAgLy8gV2hpbGUgdGhpcyBlbGVtZW50IGFscmVhZHkgaGFzIGEgc3RhcnRpbmcgdHJhbnNpdGlvbiBkdXJpbmcgdGhpcyBmcmFtZSxcbiAgICAgIC8vIGRlZmVyIHN0YXJ0aW5nIGFuIGludGVycnVwdGluZyB0cmFuc2l0aW9uIHVudGlsIHRoYXQgdHJhbnNpdGlvbiBoYXMgYVxuICAgICAgLy8gY2hhbmNlIHRvIHRpY2sgKGFuZCBwb3NzaWJseSBlbmQpOyBzZWUgZDMvZDMtdHJhbnNpdGlvbiM1NCFcbiAgICAgIGlmIChvLnN0YXRlID09PSBTVEFSVEVEKSByZXR1cm4gdGltZW91dChzdGFydCk7XG5cbiAgICAgIC8vIEludGVycnVwdCB0aGUgYWN0aXZlIHRyYW5zaXRpb24sIGlmIGFueS5cbiAgICAgIGlmIChvLnN0YXRlID09PSBSVU5OSU5HKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImludGVycnVwdFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FuY2VsIGFueSBwcmUtZW1wdGVkIHRyYW5zaXRpb25zLlxuICAgICAgZWxzZSBpZiAoK2kgPCBpZCkge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmZXIgdGhlIGZpcnN0IHRpY2sgdG8gZW5kIG9mIHRoZSBjdXJyZW50IGZyYW1lOyBzZWUgZDMvZDMjMTU3Ni5cbiAgICAvLyBOb3RlIHRoZSB0cmFuc2l0aW9uIG1heSBiZSBjYW5jZWxlZCBhZnRlciBzdGFydCBhbmQgYmVmb3JlIHRoZSBmaXJzdCB0aWNrIVxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIHNjaGVkdWxlZCBiZWZvcmUgdGhlIHN0YXJ0IGV2ZW50OyBzZWUgZDMvZDMtdHJhbnNpdGlvbiMxNiFcbiAgICAvLyBBc3N1bWluZyB0aGlzIGlzIHN1Y2Nlc3NmdWwsIHN1YnNlcXVlbnQgY2FsbGJhY2tzIGdvIHN0cmFpZ2h0IHRvIHRpY2suXG4gICAgdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLnN0YXRlID09PSBTVEFSVEVEKSB7XG4gICAgICAgIHNlbGYuc3RhdGUgPSBSVU5OSU5HO1xuICAgICAgICBzZWxmLnRpbWVyLnJlc3RhcnQodGljaywgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcbiAgICAgICAgdGljayhlbGFwc2VkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBzdGFydCBldmVudC5cbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZSB0aGUgdHdlZW4gYXJlIGluaXRpYWxpemVkLlxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVElORztcbiAgICBzZWxmLm9uLmNhbGwoXCJzdGFydFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU1RBUlRJTkcpIHJldHVybjsgLy8gaW50ZXJydXB0ZWRcbiAgICBzZWxmLnN0YXRlID0gU1RBUlRFRDtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHR3ZWVuLCBkZWxldGluZyBudWxsIHR3ZWVuLlxuICAgIHR3ZWVuID0gbmV3IEFycmF5KG4gPSBzZWxmLnR3ZWVuLmxlbmd0aCk7XG4gICAgZm9yIChpID0gMCwgaiA9IC0xOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobyA9IHNlbGYudHdlZW5baV0udmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKSkge1xuICAgICAgICB0d2VlblsrK2pdID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgdHdlZW4ubGVuZ3RoID0gaiArIDE7XG4gIH1cblxuICBmdW5jdGlvbiB0aWNrKGVsYXBzZWQpIHtcbiAgICB2YXIgdCA9IGVsYXBzZWQgPCBzZWxmLmR1cmF0aW9uID8gc2VsZi5lYXNlLmNhbGwobnVsbCwgZWxhcHNlZCAvIHNlbGYuZHVyYXRpb24pIDogKHNlbGYudGltZXIucmVzdGFydChzdG9wKSwgc2VsZi5zdGF0ZSA9IEVORElORywgMSksXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IHR3ZWVuLmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICB0d2VlbltpXS5jYWxsKG5vZGUsIHQpO1xuICAgIH1cblxuICAgIC8vIERpc3BhdGNoIHRoZSBlbmQgZXZlbnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgPT09IEVORElORykge1xuICAgICAgc2VsZi5vbi5jYWxsKFwiZW5kXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgICAgc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgc2VsZi5zdGF0ZSA9IEVOREVEO1xuICAgIHNlbGYudGltZXIuc3RvcCgpO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaWRdO1xuICAgIGZvciAodmFyIGkgaW4gc2NoZWR1bGVzKSByZXR1cm47IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG4gIH1cbn1cbiIsICJpbXBvcnQge1NUQVJUSU5HLCBFTkRJTkcsIEVOREVEfSBmcm9tIFwiLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgc2NoZWR1bGUsXG4gICAgICBhY3RpdmUsXG4gICAgICBlbXB0eSA9IHRydWUsXG4gICAgICBpO1xuXG4gIGlmICghc2NoZWR1bGVzKSByZXR1cm47XG5cbiAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcblxuICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgaWYgKChzY2hlZHVsZSA9IHNjaGVkdWxlc1tpXSkubmFtZSAhPT0gbmFtZSkgeyBlbXB0eSA9IGZhbHNlOyBjb250aW51ZTsgfVxuICAgIGFjdGl2ZSA9IHNjaGVkdWxlLnN0YXRlID4gU1RBUlRJTkcgJiYgc2NoZWR1bGUuc3RhdGUgPCBFTkRJTkc7XG4gICAgc2NoZWR1bGUuc3RhdGUgPSBFTkRFRDtcbiAgICBzY2hlZHVsZS50aW1lci5zdG9wKCk7XG4gICAgc2NoZWR1bGUub24uY2FsbChhY3RpdmUgPyBcImludGVycnVwdFwiIDogXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2NoZWR1bGUuaW5kZXgsIHNjaGVkdWxlLmdyb3VwKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICB9XG5cbiAgaWYgKGVtcHR5KSBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG59XG4iLCAiaW1wb3J0IGludGVycnVwdCBmcm9tIFwiLi4vaW50ZXJydXB0LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICBpbnRlcnJ1cHQodGhpcywgbmFtZSk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHR3ZWVuUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSB0d2VlbjAgPSB0d2VlbjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjEgPSB0d2VlbjEuc2xpY2UoKTtcbiAgICAgICAgICB0d2VlbjEuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHR3ZWVuRnVuY3Rpb24oaWQsIG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gKHR3ZWVuMCA9IHR3ZWVuKS5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgdCA9IHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9LCBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xW2ldID0gdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGkgPT09IG4pIHR3ZWVuMS5wdXNoKHQpO1xuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICBuYW1lICs9IFwiXCI7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIHR3ZWVuID0gZ2V0KHRoaXMubm9kZSgpLCBpZCkudHdlZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2Vlbi5sZW5ndGgsIHQ7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodCA9IHR3ZWVuW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGwgPyB0d2VlblJlbW92ZSA6IHR3ZWVuRnVuY3Rpb24pKGlkLCBuYW1lLCB2YWx1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHdlZW5WYWx1ZSh0cmFuc2l0aW9uLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0cmFuc2l0aW9uLl9pZDtcblxuICB0cmFuc2l0aW9uLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKTtcbiAgICAoc2NoZWR1bGUudmFsdWUgfHwgKHNjaGVkdWxlLnZhbHVlID0ge30pKVtuYW1lXSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIGdldChub2RlLCBpZCkudmFsdWVbbmFtZV07XG4gIH07XG59XG4iLCAiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQge2ludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJnYiwgaW50ZXJwb2xhdGVTdHJpbmd9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBjO1xuICByZXR1cm4gKHR5cGVvZiBiID09PSBcIm51bWJlclwiID8gaW50ZXJwb2xhdGVOdW1iZXJcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gaW50ZXJwb2xhdGVSZ2JcbiAgICAgIDogKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIGludGVycG9sYXRlUmdiKVxuICAgICAgOiBpbnRlcnBvbGF0ZVN0cmluZykoYSwgYik7XG59XG4iLCAiaW1wb3J0IHtpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2ZyBhcyBpbnRlcnBvbGF0ZVRyYW5zZm9ybX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmVOUyhmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb25OUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSksIGkgPSBmdWxsbmFtZSA9PT0gXCJ0cmFuc2Zvcm1cIiA/IGludGVycG9sYXRlVHJhbnNmb3JtIDogaW50ZXJwb2xhdGU7XG4gIHJldHVybiB0aGlzLmF0dHJUd2VlbihuYW1lLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbikoZnVsbG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJhdHRyLlwiICsgbmFtZSwgdmFsdWUpKVxuICAgICAgOiB2YWx1ZSA9PSBudWxsID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0clJlbW92ZU5TIDogYXR0clJlbW92ZSkoZnVsbG5hbWUpXG4gICAgICA6IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50KShmdWxsbmFtZSwgaSwgdmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuKG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlKG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJhdHRyLlwiICsgbmFtZTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgKGZ1bGxuYW1lLmxvY2FsID8gYXR0clR3ZWVuTlMgOiBhdHRyVHdlZW4pKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7Z2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkZWxheUZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVsYXlDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkZWxheUZ1bmN0aW9uXG4gICAgICAgICAgOiBkZWxheUNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kZWxheTtcbn1cbiIsICJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkdXJhdGlvbkZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9ICt2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkdXJhdGlvbkNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPSArdmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZHVyYXRpb25GdW5jdGlvblxuICAgICAgICAgIDogZHVyYXRpb25Db25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZHVyYXRpb247XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmVhc2U7XG59XG4iLCAiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VWYXJ5aW5nKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgdiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLmVhY2goZWFzZVZhcnlpbmcodGhpcy5faWQsIHZhbHVlKSk7XG59XG4iLCAiaW1wb3J0IHttYXRjaGVyfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCAiaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG4gIGlmICh0cmFuc2l0aW9uLl9pZCAhPT0gdGhpcy5faWQpIHRocm93IG5ldyBFcnJvcjtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gdHJhbnNpdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gc3RhcnQobmFtZSkge1xuICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pLmV2ZXJ5KGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuICF0IHx8IHQgPT09IFwic3RhcnRcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBvbjAsIG9uMSwgc2l0ID0gc3RhcnQobmFtZSkgPyBpbml0IDogc2V0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2l0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCkgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihuYW1lLCBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyXG4gICAgICA/IGdldCh0aGlzLm5vZGUoKSwgaWQpLm9uLm9uKG5hbWUpXG4gICAgICA6IHRoaXMuZWFjaChvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikpO1xufVxuIiwgImZ1bmN0aW9uIHJlbW92ZUZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5fX3RyYW5zaXRpb24pIGlmICgraSAhPT0gaWQpIHJldHVybjtcbiAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vbihcImVuZC5yZW1vdmVcIiwgcmVtb3ZlRnVuY3Rpb24odGhpcy5faWQpKTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdG9yfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgICBzY2hlZHVsZShzdWJncm91cFtpXSwgbmFtZSwgaWQsIGksIHN1Ymdyb3VwLCBnZXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3RvckFsbH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGZvciAodmFyIGNoaWxkcmVuID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApLCBjaGlsZCwgaW5oZXJpdCA9IGdldChub2RlLCBpZCksIGsgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBrIDwgbDsgKytrKSB7XG4gICAgICAgICAgaWYgKGNoaWxkID0gY2hpbGRyZW5ba10pIHtcbiAgICAgICAgICAgIHNjaGVkdWxlKGNoaWxkLCBuYW1lLCBpZCwgaywgY2hpbGRyZW4sIGluaGVyaXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdWJncm91cHMucHVzaChjaGlsZHJlbik7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxudmFyIFNlbGVjdGlvbiA9IHNlbGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3I7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9ncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtzdHlsZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVOdWxsKG5hbWUsIGludGVycG9sYXRlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgc3RyaW5nMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHN0cmluZzEwID0gc3RyaW5nMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgdmFsdWUxID0gdmFsdWUodGhpcyksXG4gICAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgc3RyaW5nMSA9IHZhbHVlMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZU1heWJlUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciBvbjAsIG9uMSwgbGlzdGVuZXIwLCBrZXkgPSBcInN0eWxlLlwiICsgbmFtZSwgZXZlbnQgPSBcImVuZC5cIiArIGtleSwgcmVtb3ZlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbixcbiAgICAgICAgbGlzdGVuZXIgPSBzY2hlZHVsZS52YWx1ZVtrZXldID09IG51bGwgPyByZW1vdmUgfHwgKHJlbW92ZSA9IHN0eWxlUmVtb3ZlKG5hbWUpKSA6IHVuZGVmaW5lZDtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCB8fCBsaXN0ZW5lcjAgIT09IGxpc3RlbmVyKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKGV2ZW50LCBsaXN0ZW5lcjAgPSBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBpID0gKG5hbWUgKz0gXCJcIikgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlTnVsbChuYW1lLCBpKSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIHN0eWxlUmVtb3ZlKG5hbWUpKVxuICAgIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUZ1bmN0aW9uKG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlKSkpXG4gICAgICAuZWFjaChzdHlsZU1heWJlUmVtb3ZlKHRoaXMuX2lkLCBuYW1lKSlcbiAgICA6IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlQ29uc3RhbnQobmFtZSwgaSwgdmFsdWUpLCBwcmlvcml0eSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIG51bGwpO1xufVxuIiwgImZ1bmN0aW9uIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkuY2FsbCh0aGlzLCB0KSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgdCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQgPSAoaTAgPSBpKSAmJiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KTtcbiAgICByZXR1cm4gdDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGtleSA9IFwic3R5bGUuXCIgKyAobmFtZSArPSBcIlwiKTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKTtcbn1cbiIsICJpbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5cbmZ1bmN0aW9uIHRleHRDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZTEgPSB2YWx1ZSh0aGlzKTtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWUxID09IG51bGwgPyBcIlwiIDogdmFsdWUxO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdGhpcy50d2VlbihcInRleHRcIiwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gdGV4dEZ1bmN0aW9uKHR3ZWVuVmFsdWUodGhpcywgXCJ0ZXh0XCIsIHZhbHVlKSlcbiAgICAgIDogdGV4dENvbnN0YW50KHZhbHVlID09IG51bGwgPyBcIlwiIDogdmFsdWUgKyBcIlwiKSk7XG59XG4iLCAiZnVuY3Rpb24gdGV4dEludGVycG9sYXRlKGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gaS5jYWxsKHRoaXMsIHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0VHdlZW4odmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiB0ZXh0SW50ZXJwb2xhdGUoaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcInRleHRcIjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHRleHRUd2Vlbih2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZDAgPSB0aGlzLl9pZCxcbiAgICAgIGlkMSA9IG5ld0lkKCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgdmFyIGluaGVyaXQgPSBnZXQobm9kZSwgaWQwKTtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQxLCBpLCBncm91cCwge1xuICAgICAgICAgIHRpbWU6IGluaGVyaXQudGltZSArIGluaGVyaXQuZGVsYXkgKyBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgIGR1cmF0aW9uOiBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGVhc2U6IGluaGVyaXQuZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZDEpO1xufVxuIiwgImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG9uMCwgb24xLCB0aGF0ID0gdGhpcywgaWQgPSB0aGF0Ll9pZCwgc2l6ZSA9IHRoYXQuc2l6ZSgpO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGNhbmNlbCA9IHt2YWx1ZTogcmVqZWN0fSxcbiAgICAgICAgZW5kID0ge3ZhbHVlOiBmdW5jdGlvbigpIHsgaWYgKC0tc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpOyB9fTtcblxuICAgIHRoYXQuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICAgIGlmIChvbiAhPT0gb24wKSB7XG4gICAgICAgIG9uMSA9IChvbjAgPSBvbikuY29weSgpO1xuICAgICAgICBvbjEuXy5jYW5jZWwucHVzaChjYW5jZWwpO1xuICAgICAgICBvbjEuXy5pbnRlcnJ1cHQucHVzaChjYW5jZWwpO1xuICAgICAgICBvbjEuXy5lbmQucHVzaChlbmQpO1xuICAgICAgfVxuXG4gICAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBzZWxlY3Rpb24gd2FzIGVtcHR5LCByZXNvbHZlIGVuZCBpbW1lZGlhdGVseVxuICAgIGlmIChzaXplID09PSAwKSByZXNvbHZlKCk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHJUd2VlbiBmcm9tIFwiLi9hdHRyVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2RlbGF5IGZyb20gXCIuL2RlbGF5LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kdXJhdGlvbiBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZSBmcm9tIFwiLi9lYXNlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlVmFyeWluZyBmcm9tIFwiLi9lYXNlVmFyeWluZy5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3Rpb24gZnJvbSBcIi4vc2VsZWN0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGVUd2VlbiBmcm9tIFwiLi9zdHlsZVR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHRUd2VlbiBmcm9tIFwiLi90ZXh0VHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RyYW5zaXRpb24gZnJvbSBcIi4vdHJhbnNpdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHdlZW4gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2VuZCBmcm9tIFwiLi9lbmQuanNcIjtcblxudmFyIGlkID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zaXRpb24oZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCkge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgdGhpcy5faWQgPSBpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNpdGlvbihuYW1lKSB7XG4gIHJldHVybiBzZWxlY3Rpb24oKS50cmFuc2l0aW9uKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3SWQoKSB7XG4gIHJldHVybiArK2lkO1xufVxuXG52YXIgc2VsZWN0aW9uX3Byb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGU7XG5cblRyYW5zaXRpb24ucHJvdG90eXBlID0gdHJhbnNpdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2l0aW9uLFxuICBzZWxlY3Q6IHRyYW5zaXRpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHRyYW5zaXRpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogdHJhbnNpdGlvbl9maWx0ZXIsXG4gIG1lcmdlOiB0cmFuc2l0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHRyYW5zaXRpb25fc2VsZWN0aW9uLFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uX3RyYW5zaXRpb24sXG4gIGNhbGw6IHNlbGVjdGlvbl9wcm90b3R5cGUuY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX3Byb3RvdHlwZS5lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX3Byb3RvdHlwZS5lYWNoLFxuICBvbjogdHJhbnNpdGlvbl9vbixcbiAgYXR0cjogdHJhbnNpdGlvbl9hdHRyLFxuICBhdHRyVHdlZW46IHRyYW5zaXRpb25fYXR0clR3ZWVuLFxuICBzdHlsZTogdHJhbnNpdGlvbl9zdHlsZSxcbiAgc3R5bGVUd2VlbjogdHJhbnNpdGlvbl9zdHlsZVR3ZWVuLFxuICB0ZXh0OiB0cmFuc2l0aW9uX3RleHQsXG4gIHRleHRUd2VlbjogdHJhbnNpdGlvbl90ZXh0VHdlZW4sXG4gIHJlbW92ZTogdHJhbnNpdGlvbl9yZW1vdmUsXG4gIHR3ZWVuOiB0cmFuc2l0aW9uX3R3ZWVuLFxuICBkZWxheTogdHJhbnNpdGlvbl9kZWxheSxcbiAgZHVyYXRpb246IHRyYW5zaXRpb25fZHVyYXRpb24sXG4gIGVhc2U6IHRyYW5zaXRpb25fZWFzZSxcbiAgZWFzZVZhcnlpbmc6IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcsXG4gIGVuZDogdHJhbnNpdGlvbl9lbmQsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25fcHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl1cbn07XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW4odCkge1xuICByZXR1cm4gdCAqIHQgKiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNPdXQodCkge1xuICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gIHJldHVybiAoKHQgKj0gMikgPD0gMSA/IHQgKiB0ICogdCA6ICh0IC09IDIpICogdCAqIHQgKyAyKSAvIDI7XG59XG4iLCAiaW1wb3J0IHtUcmFuc2l0aW9uLCBuZXdJZH0gZnJvbSBcIi4uL3RyYW5zaXRpb24vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHtlYXNlQ3ViaWNJbk91dH0gZnJvbSBcImQzLWVhc2VcIjtcbmltcG9ydCB7bm93fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGRlZmF1bHRUaW1pbmcgPSB7XG4gIHRpbWU6IG51bGwsIC8vIFNldCBvbiB1c2UuXG4gIGRlbGF5OiAwLFxuICBkdXJhdGlvbjogMjUwLFxuICBlYXNlOiBlYXNlQ3ViaWNJbk91dFxufTtcblxuZnVuY3Rpb24gaW5oZXJpdChub2RlLCBpZCkge1xuICB2YXIgdGltaW5nO1xuICB3aGlsZSAoISh0aW1pbmcgPSBub2RlLl9fdHJhbnNpdGlvbikgfHwgISh0aW1pbmcgPSB0aW1pbmdbaWRdKSkge1xuICAgIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHRyYW5zaXRpb24gJHtpZH0gbm90IGZvdW5kYCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aW1pbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGlkLFxuICAgICAgdGltaW5nO1xuXG4gIGlmIChuYW1lIGluc3RhbmNlb2YgVHJhbnNpdGlvbikge1xuICAgIGlkID0gbmFtZS5faWQsIG5hbWUgPSBuYW1lLl9uYW1lO1xuICB9IGVsc2Uge1xuICAgIGlkID0gbmV3SWQoKSwgKHRpbWluZyA9IGRlZmF1bHRUaW1pbmcpLnRpbWUgPSBub3coKSwgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNjaGVkdWxlKG5vZGUsIG5hbWUsIGlkLCBpLCBncm91cCwgdGltaW5nIHx8IGluaGVyaXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBzZWxlY3Rpb25faW50ZXJydXB0IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcblxuc2VsZWN0aW9uLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBzZWxlY3Rpb25faW50ZXJydXB0O1xuc2VsZWN0aW9uLnByb3RvdHlwZS50cmFuc2l0aW9uID0gc2VsZWN0aW9uX3RyYW5zaXRpb247XG4iLCAiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge2RyYWdEaXNhYmxlLCBkcmFnRW5hYmxlfSBmcm9tIFwiZDMtZHJhZ1wiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge3BvaW50ZXIsIHNlbGVjdH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtpbnRlcnJ1cHR9IGZyb20gXCJkMy10cmFuc2l0aW9uXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBCcnVzaEV2ZW50IGZyb20gXCIuL2V2ZW50LmpzXCI7XG5pbXBvcnQgbm9ldmVudCwge25vcHJvcGFnYXRpb259IGZyb20gXCIuL25vZXZlbnQuanNcIjtcblxudmFyIE1PREVfRFJBRyA9IHtuYW1lOiBcImRyYWdcIn0sXG4gICAgTU9ERV9TUEFDRSA9IHtuYW1lOiBcInNwYWNlXCJ9LFxuICAgIE1PREVfSEFORExFID0ge25hbWU6IFwiaGFuZGxlXCJ9LFxuICAgIE1PREVfQ0VOVEVSID0ge25hbWU6IFwiY2VudGVyXCJ9O1xuXG5jb25zdCB7YWJzLCBtYXgsIG1pbn0gPSBNYXRoO1xuXG5mdW5jdGlvbiBudW1iZXIxKGUpIHtcbiAgcmV0dXJuIFsrZVswXSwgK2VbMV1dO1xufVxuXG5mdW5jdGlvbiBudW1iZXIyKGUpIHtcbiAgcmV0dXJuIFtudW1iZXIxKGVbMF0pLCBudW1iZXIxKGVbMV0pXTtcbn1cblxudmFyIFggPSB7XG4gIG5hbWU6IFwieFwiLFxuICBoYW5kbGVzOiBbXCJ3XCIsIFwiZVwiXS5tYXAodHlwZSksXG4gIGlucHV0OiBmdW5jdGlvbih4LCBlKSB7IHJldHVybiB4ID09IG51bGwgPyBudWxsIDogW1sreFswXSwgZVswXVsxXV0sIFsreFsxXSwgZVsxXVsxXV1dOyB9LFxuICBvdXRwdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eSAmJiBbeHlbMF1bMF0sIHh5WzFdWzBdXTsgfVxufTtcblxudmFyIFkgPSB7XG4gIG5hbWU6IFwieVwiLFxuICBoYW5kbGVzOiBbXCJuXCIsIFwic1wiXS5tYXAodHlwZSksXG4gIGlucHV0OiBmdW5jdGlvbih5LCBlKSB7IHJldHVybiB5ID09IG51bGwgPyBudWxsIDogW1tlWzBdWzBdLCAreVswXV0sIFtlWzFdWzBdLCAreVsxXV1dOyB9LFxuICBvdXRwdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eSAmJiBbeHlbMF1bMV0sIHh5WzFdWzFdXTsgfVxufTtcblxudmFyIFhZID0ge1xuICBuYW1lOiBcInh5XCIsXG4gIGhhbmRsZXM6IFtcIm5cIiwgXCJ3XCIsIFwiZVwiLCBcInNcIiwgXCJud1wiLCBcIm5lXCIsIFwic3dcIiwgXCJzZVwiXS5tYXAodHlwZSksXG4gIGlucHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgPT0gbnVsbCA/IG51bGwgOiBudW1iZXIyKHh5KTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHk7IH1cbn07XG5cbnZhciBjdXJzb3JzID0ge1xuICBvdmVybGF5OiBcImNyb3NzaGFpclwiLFxuICBzZWxlY3Rpb246IFwibW92ZVwiLFxuICBuOiBcIm5zLXJlc2l6ZVwiLFxuICBlOiBcImV3LXJlc2l6ZVwiLFxuICBzOiBcIm5zLXJlc2l6ZVwiLFxuICB3OiBcImV3LXJlc2l6ZVwiLFxuICBudzogXCJud3NlLXJlc2l6ZVwiLFxuICBuZTogXCJuZXN3LXJlc2l6ZVwiLFxuICBzZTogXCJud3NlLXJlc2l6ZVwiLFxuICBzdzogXCJuZXN3LXJlc2l6ZVwiXG59O1xuXG52YXIgZmxpcFggPSB7XG4gIGU6IFwid1wiLFxuICB3OiBcImVcIixcbiAgbnc6IFwibmVcIixcbiAgbmU6IFwibndcIixcbiAgc2U6IFwic3dcIixcbiAgc3c6IFwic2VcIlxufTtcblxudmFyIGZsaXBZID0ge1xuICBuOiBcInNcIixcbiAgczogXCJuXCIsXG4gIG53OiBcInN3XCIsXG4gIG5lOiBcInNlXCIsXG4gIHNlOiBcIm5lXCIsXG4gIHN3OiBcIm53XCJcbn07XG5cbnZhciBzaWduc1ggPSB7XG4gIG92ZXJsYXk6ICsxLFxuICBzZWxlY3Rpb246ICsxLFxuICBuOiBudWxsLFxuICBlOiArMSxcbiAgczogbnVsbCxcbiAgdzogLTEsXG4gIG53OiAtMSxcbiAgbmU6ICsxLFxuICBzZTogKzEsXG4gIHN3OiAtMVxufTtcblxudmFyIHNpZ25zWSA9IHtcbiAgb3ZlcmxheTogKzEsXG4gIHNlbGVjdGlvbjogKzEsXG4gIG46IC0xLFxuICBlOiBudWxsLFxuICBzOiArMSxcbiAgdzogbnVsbCxcbiAgbnc6IC0xLFxuICBuZTogLTEsXG4gIHNlOiArMSxcbiAgc3c6ICsxXG59O1xuXG5mdW5jdGlvbiB0eXBlKHQpIHtcbiAgcmV0dXJuIHt0eXBlOiB0fTtcbn1cblxuLy8gSWdub3JlIHJpZ2h0LWNsaWNrLCBzaW5jZSB0aGF0IHNob3VsZCBvcGVuIHRoZSBjb250ZXh0IG1lbnUuXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyKGV2ZW50KSB7XG4gIHJldHVybiAhZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0RXh0ZW50KCkge1xuICB2YXIgc3ZnID0gdGhpcy5vd25lclNWR0VsZW1lbnQgfHwgdGhpcztcbiAgaWYgKHN2Zy5oYXNBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpKSB7XG4gICAgc3ZnID0gc3ZnLnZpZXdCb3guYmFzZVZhbDtcbiAgICByZXR1cm4gW1tzdmcueCwgc3ZnLnldLCBbc3ZnLnggKyBzdmcud2lkdGgsIHN2Zy55ICsgc3ZnLmhlaWdodF1dO1xuICB9XG4gIHJldHVybiBbWzAsIDBdLCBbc3ZnLndpZHRoLmJhc2VWYWwudmFsdWUsIHN2Zy5oZWlnaHQuYmFzZVZhbC52YWx1ZV1dO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0VG91Y2hhYmxlKCkge1xuICByZXR1cm4gbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzIHx8IChcIm9udG91Y2hzdGFydFwiIGluIHRoaXMpO1xufVxuXG4vLyBMaWtlIGQzLmxvY2FsLCBidXQgd2l0aCB0aGUgbmFtZSBcdTIwMUNfX2JydXNoXHUyMDFEIHJhdGhlciB0aGFuIGF1dG8tZ2VuZXJhdGVkLlxuZnVuY3Rpb24gbG9jYWwobm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX19icnVzaCkgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHJldHVybjtcbiAgcmV0dXJuIG5vZGUuX19icnVzaDtcbn1cblxuZnVuY3Rpb24gZW1wdHkoZXh0ZW50KSB7XG4gIHJldHVybiBleHRlbnRbMF1bMF0gPT09IGV4dGVudFsxXVswXVxuICAgICAgfHwgZXh0ZW50WzBdWzFdID09PSBleHRlbnRbMV1bMV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFNlbGVjdGlvbihub2RlKSB7XG4gIHZhciBzdGF0ZSA9IG5vZGUuX19icnVzaDtcbiAgcmV0dXJuIHN0YXRlID8gc3RhdGUuZGltLm91dHB1dChzdGF0ZS5zZWxlY3Rpb24pIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoWCgpIHtcbiAgcmV0dXJuIGJydXNoKFgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hZKCkge1xuICByZXR1cm4gYnJ1c2goWSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gYnJ1c2goWFkpO1xufVxuXG5mdW5jdGlvbiBicnVzaChkaW0pIHtcbiAgdmFyIGV4dGVudCA9IGRlZmF1bHRFeHRlbnQsXG4gICAgICBmaWx0ZXIgPSBkZWZhdWx0RmlsdGVyLFxuICAgICAgdG91Y2hhYmxlID0gZGVmYXVsdFRvdWNoYWJsZSxcbiAgICAgIGtleXMgPSB0cnVlLFxuICAgICAgbGlzdGVuZXJzID0gZGlzcGF0Y2goXCJzdGFydFwiLCBcImJydXNoXCIsIFwiZW5kXCIpLFxuICAgICAgaGFuZGxlU2l6ZSA9IDYsXG4gICAgICB0b3VjaGVuZGluZztcblxuICBmdW5jdGlvbiBicnVzaChncm91cCkge1xuICAgIHZhciBvdmVybGF5ID0gZ3JvdXBcbiAgICAgICAgLnByb3BlcnR5KFwiX19icnVzaFwiLCBpbml0aWFsaXplKVxuICAgICAgLnNlbGVjdEFsbChcIi5vdmVybGF5XCIpXG4gICAgICAuZGF0YShbdHlwZShcIm92ZXJsYXlcIildKTtcblxuICAgIG92ZXJsYXkuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJvdmVybGF5XCIpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5vdmVybGF5KVxuICAgICAgLm1lcmdlKG92ZXJsYXkpXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBleHRlbnQgPSBsb2NhbCh0aGlzKS5leHRlbnQ7XG4gICAgICAgICAgc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBleHRlbnRbMF1bMF0pXG4gICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBleHRlbnRbMF1bMV0pXG4gICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZXh0ZW50WzFdWzBdIC0gZXh0ZW50WzBdWzBdKVxuICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBleHRlbnRbMV1bMV0gLSBleHRlbnRbMF1bMV0pO1xuICAgICAgICB9KTtcblxuICAgIGdyb3VwLnNlbGVjdEFsbChcIi5zZWxlY3Rpb25cIilcbiAgICAgIC5kYXRhKFt0eXBlKFwic2VsZWN0aW9uXCIpXSlcbiAgICAgIC5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInNlbGVjdGlvblwiKVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLnNlbGVjdGlvbilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiIzc3N1wiKVxuICAgICAgICAuYXR0cihcImZpbGwtb3BhY2l0eVwiLCAwLjMpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiI2ZmZlwiKVxuICAgICAgICAuYXR0cihcInNoYXBlLXJlbmRlcmluZ1wiLCBcImNyaXNwRWRnZXNcIik7XG5cbiAgICB2YXIgaGFuZGxlID0gZ3JvdXAuc2VsZWN0QWxsKFwiLmhhbmRsZVwiKVxuICAgICAgLmRhdGEoZGltLmhhbmRsZXMsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZTsgfSk7XG5cbiAgICBoYW5kbGUuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgaGFuZGxlLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwiaGFuZGxlIGhhbmRsZS0tXCIgKyBkLnR5cGU7IH0pXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGN1cnNvcnNbZC50eXBlXTsgfSk7XG5cbiAgICBncm91cFxuICAgICAgICAuZWFjaChyZWRyYXcpXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKVxuICAgICAgICAub24oXCJtb3VzZWRvd24uYnJ1c2hcIiwgc3RhcnRlZClcbiAgICAgIC5maWx0ZXIodG91Y2hhYmxlKVxuICAgICAgICAub24oXCJ0b3VjaHN0YXJ0LmJydXNoXCIsIHN0YXJ0ZWQpXG4gICAgICAgIC5vbihcInRvdWNobW92ZS5icnVzaFwiLCB0b3VjaG1vdmVkKVxuICAgICAgICAub24oXCJ0b3VjaGVuZC5icnVzaCB0b3VjaGNhbmNlbC5icnVzaFwiLCB0b3VjaGVuZGVkKVxuICAgICAgICAuc3R5bGUoXCJ0b3VjaC1hY3Rpb25cIiwgXCJub25lXCIpXG4gICAgICAgIC5zdHlsZShcIi13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvclwiLCBcInJnYmEoMCwwLDAsMClcIik7XG4gIH1cblxuICBicnVzaC5tb3ZlID0gZnVuY3Rpb24oZ3JvdXAsIHNlbGVjdGlvbiwgZXZlbnQpIHtcbiAgICBpZiAoZ3JvdXAudHdlZW4pIHtcbiAgICAgIGdyb3VwXG4gICAgICAgICAgLm9uKFwic3RhcnQuYnJ1c2hcIiwgZnVuY3Rpb24oZXZlbnQpIHsgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLmJlZm9yZXN0YXJ0KCkuc3RhcnQoZXZlbnQpOyB9KVxuICAgICAgICAgIC5vbihcImludGVycnVwdC5icnVzaCBlbmQuYnJ1c2hcIiwgZnVuY3Rpb24oZXZlbnQpIHsgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLmVuZChldmVudCk7IH0pXG4gICAgICAgICAgLnR3ZWVuKFwiYnJ1c2hcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB0aGF0Ll9fYnJ1c2gsXG4gICAgICAgICAgICAgICAgZW1pdCA9IGVtaXR0ZXIodGhhdCwgYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24wID0gc3RhdGUuc2VsZWN0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjEgPSBkaW0uaW5wdXQodHlwZW9mIHNlbGVjdGlvbiA9PT0gXCJmdW5jdGlvblwiID8gc2VsZWN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBzZWxlY3Rpb24sIHN0YXRlLmV4dGVudCksXG4gICAgICAgICAgICAgICAgaSA9IGludGVycG9sYXRlKHNlbGVjdGlvbjAsIHNlbGVjdGlvbjEpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB0d2Vlbih0KSB7XG4gICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IHQgPT09IDEgJiYgc2VsZWN0aW9uMSA9PT0gbnVsbCA/IG51bGwgOiBpKHQpO1xuICAgICAgICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgICAgICAgZW1pdC5icnVzaCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uMCAhPT0gbnVsbCAmJiBzZWxlY3Rpb24xICE9PSBudWxsID8gdHdlZW4gOiB0d2VlbigxKTtcbiAgICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ3JvdXBcbiAgICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gdGhhdC5fX2JydXNoLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjEgPSBkaW0uaW5wdXQodHlwZW9mIHNlbGVjdGlvbiA9PT0gXCJmdW5jdGlvblwiID8gc2VsZWN0aW9uLmFwcGx5KHRoYXQsIGFyZ3MpIDogc2VsZWN0aW9uLCBzdGF0ZS5leHRlbnQpLFxuICAgICAgICAgICAgICAgIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3MpLmJlZm9yZXN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGludGVycnVwdCh0aGF0KTtcbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IHNlbGVjdGlvbjEgPT09IG51bGwgPyBudWxsIDogc2VsZWN0aW9uMTtcbiAgICAgICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICAgICAgZW1pdC5zdGFydChldmVudCkuYnJ1c2goZXZlbnQpLmVuZChldmVudCk7XG4gICAgICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGJydXNoLmNsZWFyID0gZnVuY3Rpb24oZ3JvdXAsIGV2ZW50KSB7XG4gICAgYnJ1c2gubW92ZShncm91cCwgbnVsbCwgZXZlbnQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICB2YXIgZ3JvdXAgPSBzZWxlY3QodGhpcyksXG4gICAgICAgIHNlbGVjdGlvbiA9IGxvY2FsKHRoaXMpLnNlbGVjdGlvbjtcblxuICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcIi5zZWxlY3Rpb25cIilcbiAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIHNlbGVjdGlvblswXVswXSlcbiAgICAgICAgICAuYXR0cihcInlcIiwgc2VsZWN0aW9uWzBdWzFdKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgc2VsZWN0aW9uWzFdWzBdIC0gc2VsZWN0aW9uWzBdWzBdKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHNlbGVjdGlvblsxXVsxXSAtIHNlbGVjdGlvblswXVsxXSk7XG5cbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcIi5oYW5kbGVcIilcbiAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZVtkLnR5cGUubGVuZ3RoIC0gMV0gPT09IFwiZVwiID8gc2VsZWN0aW9uWzFdWzBdIC0gaGFuZGxlU2l6ZSAvIDIgOiBzZWxlY3Rpb25bMF1bMF0gLSBoYW5kbGVTaXplIC8gMjsgfSlcbiAgICAgICAgICAuYXR0cihcInlcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlWzBdID09PSBcInNcIiA/IHNlbGVjdGlvblsxXVsxXSAtIGhhbmRsZVNpemUgLyAyIDogc2VsZWN0aW9uWzBdWzFdIC0gaGFuZGxlU2l6ZSAvIDI7IH0pXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGUgPT09IFwiblwiIHx8IGQudHlwZSA9PT0gXCJzXCIgPyBzZWxlY3Rpb25bMV1bMF0gLSBzZWxlY3Rpb25bMF1bMF0gKyBoYW5kbGVTaXplIDogaGFuZGxlU2l6ZTsgfSlcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGUgPT09IFwiZVwiIHx8IGQudHlwZSA9PT0gXCJ3XCIgPyBzZWxlY3Rpb25bMV1bMV0gLSBzZWxlY3Rpb25bMF1bMV0gKyBoYW5kbGVTaXplIDogaGFuZGxlU2l6ZTsgfSk7XG4gICAgfVxuXG4gICAgZWxzZSB7XG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uLC5oYW5kbGVcIilcbiAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIFwibm9uZVwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0dGVyKHRoYXQsIGFyZ3MsIGNsZWFuKSB7XG4gICAgdmFyIGVtaXQgPSB0aGF0Ll9fYnJ1c2guZW1pdHRlcjtcbiAgICByZXR1cm4gZW1pdCAmJiAoIWNsZWFuIHx8ICFlbWl0LmNsZWFuKSA/IGVtaXQgOiBuZXcgRW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbik7XG4gIH1cblxuICBmdW5jdGlvbiBFbWl0dGVyKHRoYXQsIGFyZ3MsIGNsZWFuKSB7XG4gICAgdGhpcy50aGF0ID0gdGhhdDtcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuICAgIHRoaXMuc3RhdGUgPSB0aGF0Ll9fYnJ1c2g7XG4gICAgdGhpcy5hY3RpdmUgPSAwO1xuICAgIHRoaXMuY2xlYW4gPSBjbGVhbjtcbiAgfVxuXG4gIEVtaXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGJlZm9yZXN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgrK3RoaXMuYWN0aXZlID09PSAxKSB0aGlzLnN0YXRlLmVtaXR0ZXIgPSB0aGlzLCB0aGlzLnN0YXJ0aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICBpZiAodGhpcy5zdGFydGluZykgdGhpcy5zdGFydGluZyA9IGZhbHNlLCB0aGlzLmVtaXQoXCJzdGFydFwiLCBldmVudCwgbW9kZSk7XG4gICAgICBlbHNlIHRoaXMuZW1pdChcImJydXNoXCIsIGV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYnJ1c2g6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICB0aGlzLmVtaXQoXCJicnVzaFwiLCBldmVudCwgbW9kZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24oZXZlbnQsIG1vZGUpIHtcbiAgICAgIGlmICgtLXRoaXMuYWN0aXZlID09PSAwKSBkZWxldGUgdGhpcy5zdGF0ZS5lbWl0dGVyLCB0aGlzLmVtaXQoXCJlbmRcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBlbWl0OiBmdW5jdGlvbih0eXBlLCBldmVudCwgbW9kZSkge1xuICAgICAgdmFyIGQgPSBzZWxlY3QodGhpcy50aGF0KS5kYXR1bSgpO1xuICAgICAgbGlzdGVuZXJzLmNhbGwoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHRoaXMudGhhdCxcbiAgICAgICAgbmV3IEJydXNoRXZlbnQodHlwZSwge1xuICAgICAgICAgIHNvdXJjZUV2ZW50OiBldmVudCxcbiAgICAgICAgICB0YXJnZXQ6IGJydXNoLFxuICAgICAgICAgIHNlbGVjdGlvbjogZGltLm91dHB1dCh0aGlzLnN0YXRlLnNlbGVjdGlvbiksXG4gICAgICAgICAgbW9kZSxcbiAgICAgICAgICBkaXNwYXRjaDogbGlzdGVuZXJzXG4gICAgICAgIH0pLFxuICAgICAgICBkXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBzdGFydGVkKGV2ZW50KSB7XG4gICAgaWYgKHRvdWNoZW5kaW5nICYmICFldmVudC50b3VjaGVzKSByZXR1cm47XG4gICAgaWYgKCFmaWx0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSkgcmV0dXJuO1xuXG4gICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICB0eXBlID0gZXZlbnQudGFyZ2V0Ll9fZGF0YV9fLnR5cGUsXG4gICAgICAgIG1vZGUgPSAoa2V5cyAmJiBldmVudC5tZXRhS2V5ID8gdHlwZSA9IFwib3ZlcmxheVwiIDogdHlwZSkgPT09IFwic2VsZWN0aW9uXCIgPyBNT0RFX0RSQUcgOiAoa2V5cyAmJiBldmVudC5hbHRLZXkgPyBNT0RFX0NFTlRFUiA6IE1PREVfSEFORExFKSxcbiAgICAgICAgc2lnblggPSBkaW0gPT09IFkgPyBudWxsIDogc2lnbnNYW3R5cGVdLFxuICAgICAgICBzaWduWSA9IGRpbSA9PT0gWCA/IG51bGwgOiBzaWduc1lbdHlwZV0sXG4gICAgICAgIHN0YXRlID0gbG9jYWwodGhhdCksXG4gICAgICAgIGV4dGVudCA9IHN0YXRlLmV4dGVudCxcbiAgICAgICAgc2VsZWN0aW9uID0gc3RhdGUuc2VsZWN0aW9uLFxuICAgICAgICBXID0gZXh0ZW50WzBdWzBdLCB3MCwgdzEsXG4gICAgICAgIE4gPSBleHRlbnRbMF1bMV0sIG4wLCBuMSxcbiAgICAgICAgRSA9IGV4dGVudFsxXVswXSwgZTAsIGUxLFxuICAgICAgICBTID0gZXh0ZW50WzFdWzFdLCBzMCwgczEsXG4gICAgICAgIGR4ID0gMCxcbiAgICAgICAgZHkgPSAwLFxuICAgICAgICBtb3ZpbmcsXG4gICAgICAgIHNoaWZ0aW5nID0gc2lnblggJiYgc2lnblkgJiYga2V5cyAmJiBldmVudC5zaGlmdEtleSxcbiAgICAgICAgbG9ja1gsXG4gICAgICAgIGxvY2tZLFxuICAgICAgICBwb2ludHMgPSBBcnJheS5mcm9tKGV2ZW50LnRvdWNoZXMgfHwgW2V2ZW50XSwgdCA9PiB7XG4gICAgICAgICAgY29uc3QgaSA9IHQuaWRlbnRpZmllcjtcbiAgICAgICAgICB0ID0gcG9pbnRlcih0LCB0aGF0KTtcbiAgICAgICAgICB0LnBvaW50MCA9IHQuc2xpY2UoKTtcbiAgICAgICAgICB0LmlkZW50aWZpZXIgPSBpO1xuICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9KTtcblxuICAgIGludGVycnVwdCh0aGF0KTtcbiAgICB2YXIgZW1pdCA9IGVtaXR0ZXIodGhhdCwgYXJndW1lbnRzLCB0cnVlKS5iZWZvcmVzdGFydCgpO1xuXG4gICAgaWYgKHR5cGUgPT09IFwib3ZlcmxheVwiKSB7XG4gICAgICBpZiAoc2VsZWN0aW9uKSBtb3ZpbmcgPSB0cnVlO1xuICAgICAgY29uc3QgcHRzID0gW3BvaW50c1swXSwgcG9pbnRzWzFdIHx8IHBvaW50c1swXV07XG4gICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBzZWxlY3Rpb24gPSBbW1xuICAgICAgICAgIHcwID0gZGltID09PSBZID8gVyA6IG1pbihwdHNbMF1bMF0sIHB0c1sxXVswXSksXG4gICAgICAgICAgbjAgPSBkaW0gPT09IFggPyBOIDogbWluKHB0c1swXVsxXSwgcHRzWzFdWzFdKVxuICAgICAgICBdLCBbXG4gICAgICAgICAgZTAgPSBkaW0gPT09IFkgPyBFIDogbWF4KHB0c1swXVswXSwgcHRzWzFdWzBdKSxcbiAgICAgICAgICBzMCA9IGRpbSA9PT0gWCA/IFMgOiBtYXgocHRzWzBdWzFdLCBwdHNbMV1bMV0pXG4gICAgICAgIF1dO1xuICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSBtb3ZlKGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdzAgPSBzZWxlY3Rpb25bMF1bMF07XG4gICAgICBuMCA9IHNlbGVjdGlvblswXVsxXTtcbiAgICAgIGUwID0gc2VsZWN0aW9uWzFdWzBdO1xuICAgICAgczAgPSBzZWxlY3Rpb25bMV1bMV07XG4gICAgfVxuXG4gICAgdzEgPSB3MDtcbiAgICBuMSA9IG4wO1xuICAgIGUxID0gZTA7XG4gICAgczEgPSBzMDtcblxuICAgIHZhciBncm91cCA9IHNlbGVjdCh0aGF0KVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKTtcblxuICAgIHZhciBvdmVybGF5ID0gZ3JvdXAuc2VsZWN0QWxsKFwiLm92ZXJsYXlcIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlXSk7XG5cbiAgICBpZiAoZXZlbnQudG91Y2hlcykge1xuICAgICAgZW1pdC5tb3ZlZCA9IG1vdmVkO1xuICAgICAgZW1pdC5lbmRlZCA9IGVuZGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IHNlbGVjdChldmVudC52aWV3KVxuICAgICAgICAgIC5vbihcIm1vdXNlbW92ZS5icnVzaFwiLCBtb3ZlZCwgdHJ1ZSlcbiAgICAgICAgICAub24oXCJtb3VzZXVwLmJydXNoXCIsIGVuZGVkLCB0cnVlKTtcbiAgICAgIGlmIChrZXlzKSB2aWV3XG4gICAgICAgICAgLm9uKFwia2V5ZG93bi5icnVzaFwiLCBrZXlkb3duZWQsIHRydWUpXG4gICAgICAgICAgLm9uKFwia2V5dXAuYnJ1c2hcIiwga2V5dXBwZWQsIHRydWUpXG5cbiAgICAgIGRyYWdEaXNhYmxlKGV2ZW50LnZpZXcpO1xuICAgIH1cblxuICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgIGVtaXQuc3RhcnQoZXZlbnQsIG1vZGUubmFtZSk7XG5cbiAgICBmdW5jdGlvbiBtb3ZlZChldmVudCkge1xuICAgICAgZm9yIChjb25zdCBwIG9mIGV2ZW50LmNoYW5nZWRUb3VjaGVzIHx8IFtldmVudF0pIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIHBvaW50cylcbiAgICAgICAgICBpZiAoZC5pZGVudGlmaWVyID09PSBwLmlkZW50aWZpZXIpIGQuY3VyID0gcG9pbnRlcihwLCB0aGF0KTtcbiAgICAgIH1cbiAgICAgIGlmIChzaGlmdGluZyAmJiAhbG9ja1ggJiYgIWxvY2tZICYmIHBvaW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBwb2ludHNbMF07XG4gICAgICAgIGlmIChhYnMocG9pbnQuY3VyWzBdIC0gcG9pbnRbMF0pID4gYWJzKHBvaW50LmN1clsxXSAtIHBvaW50WzFdKSlcbiAgICAgICAgICBsb2NrWSA9IHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsb2NrWCA9IHRydWU7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHBvaW50cylcbiAgICAgICAgaWYgKHBvaW50LmN1cikgcG9pbnRbMF0gPSBwb2ludC5jdXJbMF0sIHBvaW50WzFdID0gcG9pbnQuY3VyWzFdO1xuICAgICAgbW92aW5nID0gdHJ1ZTtcbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgICAgbW92ZShldmVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW92ZShldmVudCkge1xuICAgICAgY29uc3QgcG9pbnQgPSBwb2ludHNbMF0sIHBvaW50MCA9IHBvaW50LnBvaW50MDtcbiAgICAgIHZhciB0O1xuXG4gICAgICBkeCA9IHBvaW50WzBdIC0gcG9pbnQwWzBdO1xuICAgICAgZHkgPSBwb2ludFsxXSAtIHBvaW50MFsxXTtcblxuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgTU9ERV9TUEFDRTpcbiAgICAgICAgY2FzZSBNT0RFX0RSQUc6IHtcbiAgICAgICAgICBpZiAoc2lnblgpIGR4ID0gbWF4KFcgLSB3MCwgbWluKEUgLSBlMCwgZHgpKSwgdzEgPSB3MCArIGR4LCBlMSA9IGUwICsgZHg7XG4gICAgICAgICAgaWYgKHNpZ25ZKSBkeSA9IG1heChOIC0gbjAsIG1pbihTIC0gczAsIGR5KSksIG4xID0gbjAgKyBkeSwgczEgPSBzMCArIGR5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTU9ERV9IQU5ETEU6IHtcbiAgICAgICAgICBpZiAocG9pbnRzWzFdKSB7XG4gICAgICAgICAgICBpZiAoc2lnblgpIHcxID0gbWF4KFcsIG1pbihFLCBwb2ludHNbMF1bMF0pKSwgZTEgPSBtYXgoVywgbWluKEUsIHBvaW50c1sxXVswXSkpLCBzaWduWCA9IDE7XG4gICAgICAgICAgICBpZiAoc2lnblkpIG4xID0gbWF4KE4sIG1pbihTLCBwb2ludHNbMF1bMV0pKSwgczEgPSBtYXgoTiwgbWluKFMsIHBvaW50c1sxXVsxXSkpLCBzaWduWSA9IDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGR4ID0gbWF4KFcgLSB3MCwgbWluKEUgLSB3MCwgZHgpKSwgdzEgPSB3MCArIGR4LCBlMSA9IGUwO1xuICAgICAgICAgICAgZWxzZSBpZiAoc2lnblggPiAwKSBkeCA9IG1heChXIC0gZTAsIG1pbihFIC0gZTAsIGR4KSksIHcxID0gdzAsIGUxID0gZTAgKyBkeDtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIGR5ID0gbWF4KE4gLSBuMCwgbWluKFMgLSBuMCwgZHkpKSwgbjEgPSBuMCArIGR5LCBzMSA9IHMwO1xuICAgICAgICAgICAgZWxzZSBpZiAoc2lnblkgPiAwKSBkeSA9IG1heChOIC0gczAsIG1pbihTIC0gczAsIGR5KSksIG4xID0gbjAsIHMxID0gczAgKyBkeTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBNT0RFX0NFTlRFUjoge1xuICAgICAgICAgIGlmIChzaWduWCkgdzEgPSBtYXgoVywgbWluKEUsIHcwIC0gZHggKiBzaWduWCkpLCBlMSA9IG1heChXLCBtaW4oRSwgZTAgKyBkeCAqIHNpZ25YKSk7XG4gICAgICAgICAgaWYgKHNpZ25ZKSBuMSA9IG1heChOLCBtaW4oUywgbjAgLSBkeSAqIHNpZ25ZKSksIHMxID0gbWF4KE4sIG1pbihTLCBzMCArIGR5ICogc2lnblkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZTEgPCB3MSkge1xuICAgICAgICBzaWduWCAqPSAtMTtcbiAgICAgICAgdCA9IHcwLCB3MCA9IGUwLCBlMCA9IHQ7XG4gICAgICAgIHQgPSB3MSwgdzEgPSBlMSwgZTEgPSB0O1xuICAgICAgICBpZiAodHlwZSBpbiBmbGlwWCkgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZSA9IGZsaXBYW3R5cGVdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzMSA8IG4xKSB7XG4gICAgICAgIHNpZ25ZICo9IC0xO1xuICAgICAgICB0ID0gbjAsIG4wID0gczAsIHMwID0gdDtcbiAgICAgICAgdCA9IG4xLCBuMSA9IHMxLCBzMSA9IHQ7XG4gICAgICAgIGlmICh0eXBlIGluIGZsaXBZKSBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlID0gZmxpcFlbdHlwZV1dKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLnNlbGVjdGlvbikgc2VsZWN0aW9uID0gc3RhdGUuc2VsZWN0aW9uOyAvLyBNYXkgYmUgc2V0IGJ5IGJydXNoLm1vdmUhXG4gICAgICBpZiAobG9ja1gpIHcxID0gc2VsZWN0aW9uWzBdWzBdLCBlMSA9IHNlbGVjdGlvblsxXVswXTtcbiAgICAgIGlmIChsb2NrWSkgbjEgPSBzZWxlY3Rpb25bMF1bMV0sIHMxID0gc2VsZWN0aW9uWzFdWzFdO1xuXG4gICAgICBpZiAoc2VsZWN0aW9uWzBdWzBdICE9PSB3MVxuICAgICAgICAgIHx8IHNlbGVjdGlvblswXVsxXSAhPT0gbjFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMV1bMF0gIT09IGUxXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzFdWzFdICE9PSBzMSkge1xuICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBbW3cxLCBuMV0sIFtlMSwgczFdXTtcbiAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgIGVtaXQuYnJ1c2goZXZlbnQsIG1vZGUubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kZWQoZXZlbnQpIHtcbiAgICAgIG5vcHJvcGFnYXRpb24oZXZlbnQpO1xuICAgICAgaWYgKGV2ZW50LnRvdWNoZXMpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGlmICh0b3VjaGVuZGluZykgY2xlYXJUaW1lb3V0KHRvdWNoZW5kaW5nKTtcbiAgICAgICAgdG91Y2hlbmRpbmcgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0b3VjaGVuZGluZyA9IG51bGw7IH0sIDUwMCk7IC8vIEdob3N0IGNsaWNrcyBhcmUgZGVsYXllZCFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYWdFbmFibGUoZXZlbnQudmlldywgbW92aW5nKTtcbiAgICAgICAgdmlldy5vbihcImtleWRvd24uYnJ1c2gga2V5dXAuYnJ1c2ggbW91c2Vtb3ZlLmJydXNoIG1vdXNldXAuYnJ1c2hcIiwgbnVsbCk7XG4gICAgICB9XG4gICAgICBncm91cC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIik7XG4gICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5vdmVybGF5KTtcbiAgICAgIGlmIChzdGF0ZS5zZWxlY3Rpb24pIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbjsgLy8gTWF5IGJlIHNldCBieSBicnVzaC5tb3ZlIChvbiBzdGFydCkhXG4gICAgICBpZiAoZW1wdHkoc2VsZWN0aW9uKSkgc3RhdGUuc2VsZWN0aW9uID0gbnVsbCwgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICBlbWl0LmVuZChldmVudCwgbW9kZS5uYW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXlkb3duZWQoZXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIDE2OiB7IC8vIFNISUZUXG4gICAgICAgICAgc2hpZnRpbmcgPSBzaWduWCAmJiBzaWduWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDE4OiB7IC8vIEFMVFxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX0hBTkRMRSkge1xuICAgICAgICAgICAgaWYgKHNpZ25YKSBlMCA9IGUxIC0gZHggKiBzaWduWCwgdzAgPSB3MSArIGR4ICogc2lnblg7XG4gICAgICAgICAgICBpZiAoc2lnblkpIHMwID0gczEgLSBkeSAqIHNpZ25ZLCBuMCA9IG4xICsgZHkgKiBzaWduWTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX0NFTlRFUjtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDMyOiB7IC8vIFNQQUNFOyB0YWtlcyBwcmlvcml0eSBvdmVyIEFMVFxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX0hBTkRMRSB8fCBtb2RlID09PSBNT0RFX0NFTlRFUikge1xuICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZTAgPSBlMSAtIGR4OyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzEgLSBkeDtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczEgLSBkeTsgZWxzZSBpZiAoc2lnblkgPiAwKSBuMCA9IG4xIC0gZHk7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9TUEFDRTtcbiAgICAgICAgICAgIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLnNlbGVjdGlvbik7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgICAgfVxuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5dXBwZWQoZXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIDE2OiB7IC8vIFNISUZUXG4gICAgICAgICAgaWYgKHNoaWZ0aW5nKSB7XG4gICAgICAgICAgICBsb2NrWCA9IGxvY2tZID0gc2hpZnRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDE4OiB7IC8vIEFMVFxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX0NFTlRFUikge1xuICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZTAgPSBlMTsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxO1xuICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgczAgPSBzMTsgZWxzZSBpZiAoc2lnblkgPiAwKSBuMCA9IG4xO1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfSEFORExFO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMzI6IHsgLy8gU1BBQ0VcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9TUEFDRSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICBpZiAoc2lnblgpIGUwID0gZTEgLSBkeCAqIHNpZ25YLCB3MCA9IHcxICsgZHggKiBzaWduWDtcbiAgICAgICAgICAgICAgaWYgKHNpZ25ZKSBzMCA9IHMxIC0gZHkgKiBzaWduWSwgbjAgPSBuMSArIGR5ICogc2lnblk7XG4gICAgICAgICAgICAgIG1vZGUgPSBNT0RFX0NFTlRFUjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTE7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MTtcbiAgICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgczAgPSBzMTsgZWxzZSBpZiAoc2lnblkgPiAwKSBuMCA9IG4xO1xuICAgICAgICAgICAgICBtb2RlID0gTU9ERV9IQU5ETEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlXSk7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgICAgfVxuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2htb3ZlZChldmVudCkge1xuICAgIGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5tb3ZlZChldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaGVuZGVkKGV2ZW50KSB7XG4gICAgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLmVuZGVkKGV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fX2JydXNoIHx8IHtzZWxlY3Rpb246IG51bGx9O1xuICAgIHN0YXRlLmV4dGVudCA9IG51bWJlcjIoZXh0ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIHN0YXRlLmRpbSA9IGRpbTtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBicnVzaC5leHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZXh0ZW50ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChudW1iZXIyKF8pKSwgYnJ1c2gpIDogZXh0ZW50O1xuICB9O1xuXG4gIGJydXNoLmZpbHRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChmaWx0ZXIgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIGJydXNoKSA6IGZpbHRlcjtcbiAgfTtcblxuICBicnVzaC50b3VjaGFibGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodG91Y2hhYmxlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCBicnVzaCkgOiB0b3VjaGFibGU7XG4gIH07XG5cbiAgYnJ1c2guaGFuZGxlU2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChoYW5kbGVTaXplID0gK18sIGJydXNoKSA6IGhhbmRsZVNpemU7XG4gIH07XG5cbiAgYnJ1c2gua2V5TW9kaWZpZXJzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGtleXMgPSAhIV8sIGJydXNoKSA6IGtleXM7XG4gIH07XG5cbiAgYnJ1c2gub24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSBsaXN0ZW5lcnMub24uYXBwbHkobGlzdGVuZXJzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbGlzdGVuZXJzID8gYnJ1c2ggOiB2YWx1ZTtcbiAgfTtcblxuICByZXR1cm4gYnJ1c2g7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gTWF0aC5hYnMoeCA9IE1hdGgucm91bmQoeCkpID49IDFlMjFcbiAgICAgID8geC50b0xvY2FsZVN0cmluZyhcImVuXCIpLnJlcGxhY2UoLywvZywgXCJcIilcbiAgICAgIDogeC50b1N0cmluZygxMCk7XG59XG5cbi8vIENvbXB1dGVzIHRoZSBkZWNpbWFsIGNvZWZmaWNpZW50IGFuZCBleHBvbmVudCBvZiB0aGUgc3BlY2lmaWVkIG51bWJlciB4IHdpdGhcbi8vIHNpZ25pZmljYW50IGRpZ2l0cyBwLCB3aGVyZSB4IGlzIHBvc2l0aXZlIGFuZCBwIGlzIGluIFsxLCAyMV0gb3IgdW5kZWZpbmVkLlxuLy8gRm9yIGV4YW1wbGUsIGZvcm1hdERlY2ltYWxQYXJ0cygxLjIzKSByZXR1cm5zIFtcIjEyM1wiLCAwXS5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREZWNpbWFsUGFydHMoeCwgcCkge1xuICBpZiAoIWlzRmluaXRlKHgpIHx8IHggPT09IDApIHJldHVybiBudWxsOyAvLyBOYU4sIFx1MDBCMUluZmluaXR5LCBcdTAwQjEwXG4gIHZhciBpID0gKHggPSBwID8geC50b0V4cG9uZW50aWFsKHAgLSAxKSA6IHgudG9FeHBvbmVudGlhbCgpKS5pbmRleE9mKFwiZVwiKSwgY29lZmZpY2llbnQgPSB4LnNsaWNlKDAsIGkpO1xuXG4gIC8vIFRoZSBzdHJpbmcgcmV0dXJuZWQgYnkgdG9FeHBvbmVudGlhbCBlaXRoZXIgaGFzIHRoZSBmb3JtIFxcZFxcLlxcZCtlWy0rXVxcZCtcbiAgLy8gKGUuZy4sIDEuMmUrMykgb3IgdGhlIGZvcm0gXFxkZVstK11cXGQrIChlLmcuLCAxZSszKS5cbiAgcmV0dXJuIFtcbiAgICBjb2VmZmljaWVudC5sZW5ndGggPiAxID8gY29lZmZpY2llbnRbMF0gKyBjb2VmZmljaWVudC5zbGljZSgyKSA6IGNvZWZmaWNpZW50LFxuICAgICt4LnNsaWNlKGkgKyAxKVxuICBdO1xufVxuIiwgImltcG9ydCB7Zm9ybWF0RGVjaW1hbFBhcnRzfSBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHggPSBmb3JtYXREZWNpbWFsUGFydHMoTWF0aC5hYnMoeCkpLCB4ID8geFsxXSA6IE5hTjtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihncm91cGluZywgdGhvdXNhbmRzKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgd2lkdGgpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmxlbmd0aCxcbiAgICAgICAgdCA9IFtdLFxuICAgICAgICBqID0gMCxcbiAgICAgICAgZyA9IGdyb3VwaW5nWzBdLFxuICAgICAgICBsZW5ndGggPSAwO1xuXG4gICAgd2hpbGUgKGkgPiAwICYmIGcgPiAwKSB7XG4gICAgICBpZiAobGVuZ3RoICsgZyArIDEgPiB3aWR0aCkgZyA9IE1hdGgubWF4KDEsIHdpZHRoIC0gbGVuZ3RoKTtcbiAgICAgIHQucHVzaCh2YWx1ZS5zdWJzdHJpbmcoaSAtPSBnLCBpICsgZykpO1xuICAgICAgaWYgKChsZW5ndGggKz0gZyArIDEpID4gd2lkdGgpIGJyZWFrO1xuICAgICAgZyA9IGdyb3VwaW5nW2ogPSAoaiArIDEpICUgZ3JvdXBpbmcubGVuZ3RoXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdC5yZXZlcnNlKCkuam9pbih0aG91c2FuZHMpO1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG51bWVyYWxzKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bMC05XS9nLCBmdW5jdGlvbihpKSB7XG4gICAgICByZXR1cm4gbnVtZXJhbHNbK2ldO1xuICAgIH0pO1xuICB9O1xufVxuIiwgIi8vIFtbZmlsbF1hbGlnbl1bc2lnbl1bc3ltYm9sXVswXVt3aWR0aF1bLF1bLnByZWNpc2lvbl1bfl1bdHlwZV1cbnZhciByZSA9IC9eKD86KC4pPyhbPD49Xl0pKT8oWytcXC0oIF0pPyhbJCNdKT8oMCk/KFxcZCspPygsKT8oXFwuXFxkKyk/KH4pPyhbYS16JV0pPyQvaTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllcikge1xuICBpZiAoIShtYXRjaCA9IHJlLmV4ZWMoc3BlY2lmaWVyKSkpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgZm9ybWF0OiBcIiArIHNwZWNpZmllcik7XG4gIHZhciBtYXRjaDtcbiAgcmV0dXJuIG5ldyBGb3JtYXRTcGVjaWZpZXIoe1xuICAgIGZpbGw6IG1hdGNoWzFdLFxuICAgIGFsaWduOiBtYXRjaFsyXSxcbiAgICBzaWduOiBtYXRjaFszXSxcbiAgICBzeW1ib2w6IG1hdGNoWzRdLFxuICAgIHplcm86IG1hdGNoWzVdLFxuICAgIHdpZHRoOiBtYXRjaFs2XSxcbiAgICBjb21tYTogbWF0Y2hbN10sXG4gICAgcHJlY2lzaW9uOiBtYXRjaFs4XSAmJiBtYXRjaFs4XS5zbGljZSgxKSxcbiAgICB0cmltOiBtYXRjaFs5XSxcbiAgICB0eXBlOiBtYXRjaFsxMF1cbiAgfSk7XG59XG5cbmZvcm1hdFNwZWNpZmllci5wcm90b3R5cGUgPSBGb3JtYXRTcGVjaWZpZXIucHJvdG90eXBlOyAvLyBpbnN0YW5jZW9mXG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKSB7XG4gIHRoaXMuZmlsbCA9IHNwZWNpZmllci5maWxsID09PSB1bmRlZmluZWQgPyBcIiBcIiA6IHNwZWNpZmllci5maWxsICsgXCJcIjtcbiAgdGhpcy5hbGlnbiA9IHNwZWNpZmllci5hbGlnbiA9PT0gdW5kZWZpbmVkID8gXCI+XCIgOiBzcGVjaWZpZXIuYWxpZ24gKyBcIlwiO1xuICB0aGlzLnNpZ24gPSBzcGVjaWZpZXIuc2lnbiA9PT0gdW5kZWZpbmVkID8gXCItXCIgOiBzcGVjaWZpZXIuc2lnbiArIFwiXCI7XG4gIHRoaXMuc3ltYm9sID0gc3BlY2lmaWVyLnN5bWJvbCA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IHNwZWNpZmllci5zeW1ib2wgKyBcIlwiO1xuICB0aGlzLnplcm8gPSAhIXNwZWNpZmllci56ZXJvO1xuICB0aGlzLndpZHRoID0gc3BlY2lmaWVyLndpZHRoID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiArc3BlY2lmaWVyLndpZHRoO1xuICB0aGlzLmNvbW1hID0gISFzcGVjaWZpZXIuY29tbWE7XG4gIHRoaXMucHJlY2lzaW9uID0gc3BlY2lmaWVyLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogK3NwZWNpZmllci5wcmVjaXNpb247XG4gIHRoaXMudHJpbSA9ICEhc3BlY2lmaWVyLnRyaW07XG4gIHRoaXMudHlwZSA9IHNwZWNpZmllci50eXBlID09PSB1bmRlZmluZWQgPyBcIlwiIDogc3BlY2lmaWVyLnR5cGUgKyBcIlwiO1xufVxuXG5Gb3JtYXRTcGVjaWZpZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmZpbGxcbiAgICAgICsgdGhpcy5hbGlnblxuICAgICAgKyB0aGlzLnNpZ25cbiAgICAgICsgdGhpcy5zeW1ib2xcbiAgICAgICsgKHRoaXMuemVybyA/IFwiMFwiIDogXCJcIilcbiAgICAgICsgKHRoaXMud2lkdGggPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBNYXRoLm1heCgxLCB0aGlzLndpZHRoIHwgMCkpXG4gICAgICArICh0aGlzLmNvbW1hID8gXCIsXCIgOiBcIlwiKVxuICAgICAgKyAodGhpcy5wcmVjaXNpb24gPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBcIi5cIiArIE1hdGgubWF4KDAsIHRoaXMucHJlY2lzaW9uIHwgMCkpXG4gICAgICArICh0aGlzLnRyaW0gPyBcIn5cIiA6IFwiXCIpXG4gICAgICArIHRoaXMudHlwZTtcbn07XG4iLCAiLy8gVHJpbXMgaW5zaWduaWZpY2FudCB6ZXJvcywgZS5nLiwgcmVwbGFjZXMgMS4yMDAwayB3aXRoIDEuMmsuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzKSB7XG4gIG91dDogZm9yICh2YXIgbiA9IHMubGVuZ3RoLCBpID0gMSwgaTAgPSAtMSwgaTE7IGkgPCBuOyArK2kpIHtcbiAgICBzd2l0Y2ggKHNbaV0pIHtcbiAgICAgIGNhc2UgXCIuXCI6IGkwID0gaTEgPSBpOyBicmVhaztcbiAgICAgIGNhc2UgXCIwXCI6IGlmIChpMCA9PT0gMCkgaTAgPSBpOyBpMSA9IGk7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogaWYgKCErc1tpXSkgYnJlYWsgb3V0OyBpZiAoaTAgPiAwKSBpMCA9IDA7IGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaTAgPiAwID8gcy5zbGljZSgwLCBpMCkgKyBzLnNsaWNlKGkxICsgMSkgOiBzO1xufVxuIiwgImltcG9ydCB7Zm9ybWF0RGVjaW1hbFBhcnRzfSBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5cbmV4cG9ydCB2YXIgcHJlZml4RXhwb25lbnQ7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgsIHApIHtcbiAgdmFyIGQgPSBmb3JtYXREZWNpbWFsUGFydHMoeCwgcCk7XG4gIGlmICghZCkgcmV0dXJuIHByZWZpeEV4cG9uZW50ID0gdW5kZWZpbmVkLCB4LnRvUHJlY2lzaW9uKHApO1xuICB2YXIgY29lZmZpY2llbnQgPSBkWzBdLFxuICAgICAgZXhwb25lbnQgPSBkWzFdLFxuICAgICAgaSA9IGV4cG9uZW50IC0gKHByZWZpeEV4cG9uZW50ID0gTWF0aC5tYXgoLTgsIE1hdGgubWluKDgsIE1hdGguZmxvb3IoZXhwb25lbnQgLyAzKSkpICogMykgKyAxLFxuICAgICAgbiA9IGNvZWZmaWNpZW50Lmxlbmd0aDtcbiAgcmV0dXJuIGkgPT09IG4gPyBjb2VmZmljaWVudFxuICAgICAgOiBpID4gbiA/IGNvZWZmaWNpZW50ICsgbmV3IEFycmF5KGkgLSBuICsgMSkuam9pbihcIjBcIilcbiAgICAgIDogaSA+IDAgPyBjb2VmZmljaWVudC5zbGljZSgwLCBpKSArIFwiLlwiICsgY29lZmZpY2llbnQuc2xpY2UoaSlcbiAgICAgIDogXCIwLlwiICsgbmV3IEFycmF5KDEgLSBpKS5qb2luKFwiMFwiKSArIGZvcm1hdERlY2ltYWxQYXJ0cyh4LCBNYXRoLm1heCgwLCBwICsgaSAtIDEpKVswXTsgLy8gbGVzcyB0aGFuIDF5IVxufVxuIiwgImltcG9ydCB7Zm9ybWF0RGVjaW1hbFBhcnRzfSBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgsIHApIHtcbiAgdmFyIGQgPSBmb3JtYXREZWNpbWFsUGFydHMoeCwgcCk7XG4gIGlmICghZCkgcmV0dXJuIHggKyBcIlwiO1xuICB2YXIgY29lZmZpY2llbnQgPSBkWzBdLFxuICAgICAgZXhwb25lbnQgPSBkWzFdO1xuICByZXR1cm4gZXhwb25lbnQgPCAwID8gXCIwLlwiICsgbmV3IEFycmF5KC1leHBvbmVudCkuam9pbihcIjBcIikgKyBjb2VmZmljaWVudFxuICAgICAgOiBjb2VmZmljaWVudC5sZW5ndGggPiBleHBvbmVudCArIDEgPyBjb2VmZmljaWVudC5zbGljZSgwLCBleHBvbmVudCArIDEpICsgXCIuXCIgKyBjb2VmZmljaWVudC5zbGljZShleHBvbmVudCArIDEpXG4gICAgICA6IGNvZWZmaWNpZW50ICsgbmV3IEFycmF5KGV4cG9uZW50IC0gY29lZmZpY2llbnQubGVuZ3RoICsgMikuam9pbihcIjBcIik7XG59XG4iLCAiaW1wb3J0IGZvcm1hdERlY2ltYWwgZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuaW1wb3J0IGZvcm1hdFByZWZpeEF1dG8gZnJvbSBcIi4vZm9ybWF0UHJlZml4QXV0by5qc1wiO1xuaW1wb3J0IGZvcm1hdFJvdW5kZWQgZnJvbSBcIi4vZm9ybWF0Um91bmRlZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIFwiJVwiOiAoeCwgcCkgPT4gKHggKiAxMDApLnRvRml4ZWQocCksXG4gIFwiYlwiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZygyKSxcbiAgXCJjXCI6ICh4KSA9PiB4ICsgXCJcIixcbiAgXCJkXCI6IGZvcm1hdERlY2ltYWwsXG4gIFwiZVwiOiAoeCwgcCkgPT4geC50b0V4cG9uZW50aWFsKHApLFxuICBcImZcIjogKHgsIHApID0+IHgudG9GaXhlZChwKSxcbiAgXCJnXCI6ICh4LCBwKSA9PiB4LnRvUHJlY2lzaW9uKHApLFxuICBcIm9cIjogKHgpID0+IE1hdGgucm91bmQoeCkudG9TdHJpbmcoOCksXG4gIFwicFwiOiAoeCwgcCkgPT4gZm9ybWF0Um91bmRlZCh4ICogMTAwLCBwKSxcbiAgXCJyXCI6IGZvcm1hdFJvdW5kZWQsXG4gIFwic1wiOiBmb3JtYXRQcmVmaXhBdXRvLFxuICBcIlhcIjogKHgpID0+IE1hdGgucm91bmQoeCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCksXG4gIFwieFwiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZygxNilcbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4geDtcbn1cbiIsICJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcbmltcG9ydCBmb3JtYXRHcm91cCBmcm9tIFwiLi9mb3JtYXRHcm91cC5qc1wiO1xuaW1wb3J0IGZvcm1hdE51bWVyYWxzIGZyb20gXCIuL2Zvcm1hdE51bWVyYWxzLmpzXCI7XG5pbXBvcnQgZm9ybWF0U3BlY2lmaWVyIGZyb20gXCIuL2Zvcm1hdFNwZWNpZmllci5qc1wiO1xuaW1wb3J0IGZvcm1hdFRyaW0gZnJvbSBcIi4vZm9ybWF0VHJpbS5qc1wiO1xuaW1wb3J0IGZvcm1hdFR5cGVzIGZyb20gXCIuL2Zvcm1hdFR5cGVzLmpzXCI7XG5pbXBvcnQge3ByZWZpeEV4cG9uZW50fSBmcm9tIFwiLi9mb3JtYXRQcmVmaXhBdXRvLmpzXCI7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxudmFyIG1hcCA9IEFycmF5LnByb3RvdHlwZS5tYXAsXG4gICAgcHJlZml4ZXMgPSBbXCJ5XCIsXCJ6XCIsXCJhXCIsXCJmXCIsXCJwXCIsXCJuXCIsXCJcdTAwQjVcIixcIm1cIixcIlwiLFwia1wiLFwiTVwiLFwiR1wiLFwiVFwiLFwiUFwiLFwiRVwiLFwiWlwiLFwiWVwiXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obG9jYWxlKSB7XG4gIHZhciBncm91cCA9IGxvY2FsZS5ncm91cGluZyA9PT0gdW5kZWZpbmVkIHx8IGxvY2FsZS50aG91c2FuZHMgPT09IHVuZGVmaW5lZCA/IGlkZW50aXR5IDogZm9ybWF0R3JvdXAobWFwLmNhbGwobG9jYWxlLmdyb3VwaW5nLCBOdW1iZXIpLCBsb2NhbGUudGhvdXNhbmRzICsgXCJcIiksXG4gICAgICBjdXJyZW5jeVByZWZpeCA9IGxvY2FsZS5jdXJyZW5jeSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IGxvY2FsZS5jdXJyZW5jeVswXSArIFwiXCIsXG4gICAgICBjdXJyZW5jeVN1ZmZpeCA9IGxvY2FsZS5jdXJyZW5jeSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IGxvY2FsZS5jdXJyZW5jeVsxXSArIFwiXCIsXG4gICAgICBkZWNpbWFsID0gbG9jYWxlLmRlY2ltYWwgPT09IHVuZGVmaW5lZCA/IFwiLlwiIDogbG9jYWxlLmRlY2ltYWwgKyBcIlwiLFxuICAgICAgbnVtZXJhbHMgPSBsb2NhbGUubnVtZXJhbHMgPT09IHVuZGVmaW5lZCA/IGlkZW50aXR5IDogZm9ybWF0TnVtZXJhbHMobWFwLmNhbGwobG9jYWxlLm51bWVyYWxzLCBTdHJpbmcpKSxcbiAgICAgIHBlcmNlbnQgPSBsb2NhbGUucGVyY2VudCA9PT0gdW5kZWZpbmVkID8gXCIlXCIgOiBsb2NhbGUucGVyY2VudCArIFwiXCIsXG4gICAgICBtaW51cyA9IGxvY2FsZS5taW51cyA9PT0gdW5kZWZpbmVkID8gXCJcdTIyMTJcIiA6IGxvY2FsZS5taW51cyArIFwiXCIsXG4gICAgICBuYW4gPSBsb2NhbGUubmFuID09PSB1bmRlZmluZWQgPyBcIk5hTlwiIDogbG9jYWxlLm5hbiArIFwiXCI7XG5cbiAgZnVuY3Rpb24gbmV3Rm9ybWF0KHNwZWNpZmllciwgb3B0aW9ucykge1xuICAgIHNwZWNpZmllciA9IGZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIpO1xuXG4gICAgdmFyIGZpbGwgPSBzcGVjaWZpZXIuZmlsbCxcbiAgICAgICAgYWxpZ24gPSBzcGVjaWZpZXIuYWxpZ24sXG4gICAgICAgIHNpZ24gPSBzcGVjaWZpZXIuc2lnbixcbiAgICAgICAgc3ltYm9sID0gc3BlY2lmaWVyLnN5bWJvbCxcbiAgICAgICAgemVybyA9IHNwZWNpZmllci56ZXJvLFxuICAgICAgICB3aWR0aCA9IHNwZWNpZmllci53aWR0aCxcbiAgICAgICAgY29tbWEgPSBzcGVjaWZpZXIuY29tbWEsXG4gICAgICAgIHByZWNpc2lvbiA9IHNwZWNpZmllci5wcmVjaXNpb24sXG4gICAgICAgIHRyaW0gPSBzcGVjaWZpZXIudHJpbSxcbiAgICAgICAgdHlwZSA9IHNwZWNpZmllci50eXBlO1xuXG4gICAgLy8gVGhlIFwiblwiIHR5cGUgaXMgYW4gYWxpYXMgZm9yIFwiLGdcIi5cbiAgICBpZiAodHlwZSA9PT0gXCJuXCIpIGNvbW1hID0gdHJ1ZSwgdHlwZSA9IFwiZ1wiO1xuXG4gICAgLy8gVGhlIFwiXCIgdHlwZSwgYW5kIGFueSBpbnZhbGlkIHR5cGUsIGlzIGFuIGFsaWFzIGZvciBcIi4xMn5nXCIuXG4gICAgZWxzZSBpZiAoIWZvcm1hdFR5cGVzW3R5cGVdKSBwcmVjaXNpb24gPT09IHVuZGVmaW5lZCAmJiAocHJlY2lzaW9uID0gMTIpLCB0cmltID0gdHJ1ZSwgdHlwZSA9IFwiZ1wiO1xuXG4gICAgLy8gSWYgemVybyBmaWxsIGlzIHNwZWNpZmllZCwgcGFkZGluZyBnb2VzIGFmdGVyIHNpZ24gYW5kIGJlZm9yZSBkaWdpdHMuXG4gICAgaWYgKHplcm8gfHwgKGZpbGwgPT09IFwiMFwiICYmIGFsaWduID09PSBcIj1cIikpIHplcm8gPSB0cnVlLCBmaWxsID0gXCIwXCIsIGFsaWduID0gXCI9XCI7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBwcmVmaXggYW5kIHN1ZmZpeC5cbiAgICAvLyBGb3IgU0ktcHJlZml4LCB0aGUgc3VmZml4IGlzIGxhemlseSBjb21wdXRlZC5cbiAgICB2YXIgcHJlZml4ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVmaXggIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMucHJlZml4IDogXCJcIikgKyAoc3ltYm9sID09PSBcIiRcIiA/IGN1cnJlbmN5UHJlZml4IDogc3ltYm9sID09PSBcIiNcIiAmJiAvW2JveFhdLy50ZXN0KHR5cGUpID8gXCIwXCIgKyB0eXBlLnRvTG93ZXJDYXNlKCkgOiBcIlwiKSxcbiAgICAgICAgc3VmZml4ID0gKHN5bWJvbCA9PT0gXCIkXCIgPyBjdXJyZW5jeVN1ZmZpeCA6IC9bJXBdLy50ZXN0KHR5cGUpID8gcGVyY2VudCA6IFwiXCIpICsgKG9wdGlvbnMgJiYgb3B0aW9ucy5zdWZmaXggIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuc3VmZml4IDogXCJcIik7XG5cbiAgICAvLyBXaGF0IGZvcm1hdCBmdW5jdGlvbiBzaG91bGQgd2UgdXNlP1xuICAgIC8vIElzIHRoaXMgYW4gaW50ZWdlciB0eXBlP1xuICAgIC8vIENhbiB0aGlzIHR5cGUgZ2VuZXJhdGUgZXhwb25lbnRpYWwgbm90YXRpb24/XG4gICAgdmFyIGZvcm1hdFR5cGUgPSBmb3JtYXRUeXBlc1t0eXBlXSxcbiAgICAgICAgbWF5YmVTdWZmaXggPSAvW2RlZmdwcnMlXS8udGVzdCh0eXBlKTtcblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdCBwcmVjaXNpb24gaWYgbm90IHNwZWNpZmllZCxcbiAgICAvLyBvciBjbGFtcCB0aGUgc3BlY2lmaWVkIHByZWNpc2lvbiB0byB0aGUgc3VwcG9ydGVkIHJhbmdlLlxuICAgIC8vIEZvciBzaWduaWZpY2FudCBwcmVjaXNpb24sIGl0IG11c3QgYmUgaW4gWzEsIDIxXS5cbiAgICAvLyBGb3IgZml4ZWQgcHJlY2lzaW9uLCBpdCBtdXN0IGJlIGluIFswLCAyMF0uXG4gICAgcHJlY2lzaW9uID0gcHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyA2XG4gICAgICAgIDogL1tncHJzXS8udGVzdCh0eXBlKSA/IE1hdGgubWF4KDEsIE1hdGgubWluKDIxLCBwcmVjaXNpb24pKVxuICAgICAgICA6IE1hdGgubWF4KDAsIE1hdGgubWluKDIwLCBwcmVjaXNpb24pKTtcblxuICAgIGZ1bmN0aW9uIGZvcm1hdCh2YWx1ZSkge1xuICAgICAgdmFyIHZhbHVlUHJlZml4ID0gcHJlZml4LFxuICAgICAgICAgIHZhbHVlU3VmZml4ID0gc3VmZml4LFxuICAgICAgICAgIGksIG4sIGM7XG5cbiAgICAgIGlmICh0eXBlID09PSBcImNcIikge1xuICAgICAgICB2YWx1ZVN1ZmZpeCA9IGZvcm1hdFR5cGUodmFsdWUpICsgdmFsdWVTdWZmaXg7XG4gICAgICAgIHZhbHVlID0gXCJcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gK3ZhbHVlO1xuXG4gICAgICAgIC8vIERldGVybWluZSB0aGUgc2lnbi4gLTAgaXMgbm90IGxlc3MgdGhhbiAwLCBidXQgMSAvIC0wIGlzIVxuICAgICAgICB2YXIgdmFsdWVOZWdhdGl2ZSA9IHZhbHVlIDwgMCB8fCAxIC8gdmFsdWUgPCAwO1xuXG4gICAgICAgIC8vIFBlcmZvcm0gdGhlIGluaXRpYWwgZm9ybWF0dGluZy5cbiAgICAgICAgdmFsdWUgPSBpc05hTih2YWx1ZSkgPyBuYW4gOiBmb3JtYXRUeXBlKE1hdGguYWJzKHZhbHVlKSwgcHJlY2lzaW9uKTtcblxuICAgICAgICAvLyBUcmltIGluc2lnbmlmaWNhbnQgemVyb3MuXG4gICAgICAgIGlmICh0cmltKSB2YWx1ZSA9IGZvcm1hdFRyaW0odmFsdWUpO1xuXG4gICAgICAgIC8vIElmIGEgbmVnYXRpdmUgdmFsdWUgcm91bmRzIHRvIHplcm8gYWZ0ZXIgZm9ybWF0dGluZywgYW5kIG5vIGV4cGxpY2l0IHBvc2l0aXZlIHNpZ24gaXMgcmVxdWVzdGVkLCBoaWRlIHRoZSBzaWduLlxuICAgICAgICBpZiAodmFsdWVOZWdhdGl2ZSAmJiArdmFsdWUgPT09IDAgJiYgc2lnbiAhPT0gXCIrXCIpIHZhbHVlTmVnYXRpdmUgPSBmYWxzZTtcblxuICAgICAgICAvLyBDb21wdXRlIHRoZSBwcmVmaXggYW5kIHN1ZmZpeC5cbiAgICAgICAgdmFsdWVQcmVmaXggPSAodmFsdWVOZWdhdGl2ZSA/IChzaWduID09PSBcIihcIiA/IHNpZ24gOiBtaW51cykgOiBzaWduID09PSBcIi1cIiB8fCBzaWduID09PSBcIihcIiA/IFwiXCIgOiBzaWduKSArIHZhbHVlUHJlZml4O1xuICAgICAgICB2YWx1ZVN1ZmZpeCA9ICh0eXBlID09PSBcInNcIiAmJiAhaXNOYU4odmFsdWUpICYmIHByZWZpeEV4cG9uZW50ICE9PSB1bmRlZmluZWQgPyBwcmVmaXhlc1s4ICsgcHJlZml4RXhwb25lbnQgLyAzXSA6IFwiXCIpICsgdmFsdWVTdWZmaXggKyAodmFsdWVOZWdhdGl2ZSAmJiBzaWduID09PSBcIihcIiA/IFwiKVwiIDogXCJcIik7XG5cbiAgICAgICAgLy8gQnJlYWsgdGhlIGZvcm1hdHRlZCB2YWx1ZSBpbnRvIHRoZSBpbnRlZ2VyIFx1MjAxQ3ZhbHVlXHUyMDFEIHBhcnQgdGhhdCBjYW4gYmVcbiAgICAgICAgLy8gZ3JvdXBlZCwgYW5kIGZyYWN0aW9uYWwgb3IgZXhwb25lbnRpYWwgXHUyMDFDc3VmZml4XHUyMDFEIHBhcnQgdGhhdCBpcyBub3QuXG4gICAgICAgIGlmIChtYXliZVN1ZmZpeCkge1xuICAgICAgICAgIGkgPSAtMSwgbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKGMgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpLCA0OCA+IGMgfHwgYyA+IDU3KSB7XG4gICAgICAgICAgICAgIHZhbHVlU3VmZml4ID0gKGMgPT09IDQ2ID8gZGVjaW1hbCArIHZhbHVlLnNsaWNlKGkgKyAxKSA6IHZhbHVlLnNsaWNlKGkpKSArIHZhbHVlU3VmZml4O1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGZpbGwgY2hhcmFjdGVyIGlzIG5vdCBcIjBcIiwgZ3JvdXBpbmcgaXMgYXBwbGllZCBiZWZvcmUgcGFkZGluZy5cbiAgICAgIGlmIChjb21tYSAmJiAhemVybykgdmFsdWUgPSBncm91cCh2YWx1ZSwgSW5maW5pdHkpO1xuXG4gICAgICAvLyBDb21wdXRlIHRoZSBwYWRkaW5nLlxuICAgICAgdmFyIGxlbmd0aCA9IHZhbHVlUHJlZml4Lmxlbmd0aCArIHZhbHVlLmxlbmd0aCArIHZhbHVlU3VmZml4Lmxlbmd0aCxcbiAgICAgICAgICBwYWRkaW5nID0gbGVuZ3RoIDwgd2lkdGggPyBuZXcgQXJyYXkod2lkdGggLSBsZW5ndGggKyAxKS5qb2luKGZpbGwpIDogXCJcIjtcblxuICAgICAgLy8gSWYgdGhlIGZpbGwgY2hhcmFjdGVyIGlzIFwiMFwiLCBncm91cGluZyBpcyBhcHBsaWVkIGFmdGVyIHBhZGRpbmcuXG4gICAgICBpZiAoY29tbWEgJiYgemVybykgdmFsdWUgPSBncm91cChwYWRkaW5nICsgdmFsdWUsIHBhZGRpbmcubGVuZ3RoID8gd2lkdGggLSB2YWx1ZVN1ZmZpeC5sZW5ndGggOiBJbmZpbml0eSksIHBhZGRpbmcgPSBcIlwiO1xuXG4gICAgICAvLyBSZWNvbnN0cnVjdCB0aGUgZmluYWwgb3V0cHV0IGJhc2VkIG9uIHRoZSBkZXNpcmVkIGFsaWdubWVudC5cbiAgICAgIHN3aXRjaCAoYWxpZ24pIHtcbiAgICAgICAgY2FzZSBcIjxcIjogdmFsdWUgPSB2YWx1ZVByZWZpeCArIHZhbHVlICsgdmFsdWVTdWZmaXggKyBwYWRkaW5nOyBicmVhaztcbiAgICAgICAgY2FzZSBcIj1cIjogdmFsdWUgPSB2YWx1ZVByZWZpeCArIHBhZGRpbmcgKyB2YWx1ZSArIHZhbHVlU3VmZml4OyBicmVhaztcbiAgICAgICAgY2FzZSBcIl5cIjogdmFsdWUgPSBwYWRkaW5nLnNsaWNlKDAsIGxlbmd0aCA9IHBhZGRpbmcubGVuZ3RoID4+IDEpICsgdmFsdWVQcmVmaXggKyB2YWx1ZSArIHZhbHVlU3VmZml4ICsgcGFkZGluZy5zbGljZShsZW5ndGgpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDogdmFsdWUgPSBwYWRkaW5nICsgdmFsdWVQcmVmaXggKyB2YWx1ZSArIHZhbHVlU3VmZml4OyBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bWVyYWxzKHZhbHVlKTtcbiAgICB9XG5cbiAgICBmb3JtYXQudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzcGVjaWZpZXIgKyBcIlwiO1xuICAgIH07XG5cbiAgICByZXR1cm4gZm9ybWF0O1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0UHJlZml4KHNwZWNpZmllciwgdmFsdWUpIHtcbiAgICB2YXIgZSA9IE1hdGgubWF4KC04LCBNYXRoLm1pbig4LCBNYXRoLmZsb29yKGV4cG9uZW50KHZhbHVlKSAvIDMpKSkgKiAzLFxuICAgICAgICBrID0gTWF0aC5wb3coMTAsIC1lKSxcbiAgICAgICAgZiA9IG5ld0Zvcm1hdCgoc3BlY2lmaWVyID0gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllciksIHNwZWNpZmllci50eXBlID0gXCJmXCIsIHNwZWNpZmllciksIHtzdWZmaXg6IHByZWZpeGVzWzggKyBlIC8gM119KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBmKGsgKiB2YWx1ZSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZm9ybWF0OiBuZXdGb3JtYXQsXG4gICAgZm9ybWF0UHJlZml4OiBmb3JtYXRQcmVmaXhcbiAgfTtcbn1cbiIsICJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciBmb3JtYXQ7XG5leHBvcnQgdmFyIGZvcm1hdFByZWZpeDtcblxuZGVmYXVsdExvY2FsZSh7XG4gIHRob3VzYW5kczogXCIsXCIsXG4gIGdyb3VwaW5nOiBbM10sXG4gIGN1cnJlbmN5OiBbXCIkXCIsIFwiXCJdXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVmYXVsdExvY2FsZShkZWZpbml0aW9uKSB7XG4gIGxvY2FsZSA9IGZvcm1hdExvY2FsZShkZWZpbml0aW9uKTtcbiAgZm9ybWF0ID0gbG9jYWxlLmZvcm1hdDtcbiAgZm9ybWF0UHJlZml4ID0gbG9jYWxlLmZvcm1hdFByZWZpeDtcbiAgcmV0dXJuIGxvY2FsZTtcbn1cbiIsICJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RlcCkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgLWV4cG9uZW50KE1hdGguYWJzKHN0ZXApKSk7XG59XG4iLCAiaW1wb3J0IGV4cG9uZW50IGZyb20gXCIuL2V4cG9uZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0ZXAsIHZhbHVlKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1heCgtOCwgTWF0aC5taW4oOCwgTWF0aC5mbG9vcihleHBvbmVudCh2YWx1ZSkgLyAzKSkpICogMyAtIGV4cG9uZW50KE1hdGguYWJzKHN0ZXApKSk7XG59XG4iLCAiaW1wb3J0IGV4cG9uZW50IGZyb20gXCIuL2V4cG9uZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0ZXAsIG1heCkge1xuICBzdGVwID0gTWF0aC5hYnMoc3RlcCksIG1heCA9IE1hdGguYWJzKG1heCkgLSBzdGVwO1xuICByZXR1cm4gTWF0aC5tYXgoMCwgZXhwb25lbnQobWF4KSAtIGV4cG9uZW50KHN0ZXApKSArIDE7XG59XG4iLCAiZXhwb3J0IHZhciBlcHNpbG9uID0gMWUtNjtcbmV4cG9ydCB2YXIgZXBzaWxvbjIgPSAxZS0xMjtcbmV4cG9ydCB2YXIgcGkgPSBNYXRoLlBJO1xuZXhwb3J0IHZhciBoYWxmUGkgPSBwaSAvIDI7XG5leHBvcnQgdmFyIHF1YXJ0ZXJQaSA9IHBpIC8gNDtcbmV4cG9ydCB2YXIgdGF1ID0gcGkgKiAyO1xuXG5leHBvcnQgdmFyIGRlZ3JlZXMgPSAxODAgLyBwaTtcbmV4cG9ydCB2YXIgcmFkaWFucyA9IHBpIC8gMTgwO1xuXG5leHBvcnQgdmFyIGFicyA9IE1hdGguYWJzO1xuZXhwb3J0IHZhciBhdGFuID0gTWF0aC5hdGFuO1xuZXhwb3J0IHZhciBhdGFuMiA9IE1hdGguYXRhbjI7XG5leHBvcnQgdmFyIGNvcyA9IE1hdGguY29zO1xuZXhwb3J0IHZhciBjZWlsID0gTWF0aC5jZWlsO1xuZXhwb3J0IHZhciBleHAgPSBNYXRoLmV4cDtcbmV4cG9ydCB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuZXhwb3J0IHZhciBoeXBvdCA9IE1hdGguaHlwb3Q7XG5leHBvcnQgdmFyIGxvZyA9IE1hdGgubG9nO1xuZXhwb3J0IHZhciBwb3cgPSBNYXRoLnBvdztcbmV4cG9ydCB2YXIgc2luID0gTWF0aC5zaW47XG5leHBvcnQgdmFyIHNpZ24gPSBNYXRoLnNpZ24gfHwgZnVuY3Rpb24oeCkgeyByZXR1cm4geCA+IDAgPyAxIDogeCA8IDAgPyAtMSA6IDA7IH07XG5leHBvcnQgdmFyIHNxcnQgPSBNYXRoLnNxcnQ7XG5leHBvcnQgdmFyIHRhbiA9IE1hdGgudGFuO1xuXG5leHBvcnQgZnVuY3Rpb24gYWNvcyh4KSB7XG4gIHJldHVybiB4ID4gMSA/IDAgOiB4IDwgLTEgPyBwaSA6IE1hdGguYWNvcyh4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzaW4oeCkge1xuICByZXR1cm4geCA+IDEgPyBoYWxmUGkgOiB4IDwgLTEgPyAtaGFsZlBpIDogTWF0aC5hc2luKHgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGF2ZXJzaW4oeCkge1xuICByZXR1cm4gKHggPSBzaW4oeCAvIDIpKSAqIHg7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9vcCgpIHt9XG4iLCAiZnVuY3Rpb24gc3RyZWFtR2VvbWV0cnkoZ2VvbWV0cnksIHN0cmVhbSkge1xuICBpZiAoZ2VvbWV0cnkgJiYgc3RyZWFtR2VvbWV0cnlUeXBlLmhhc093blByb3BlcnR5KGdlb21ldHJ5LnR5cGUpKSB7XG4gICAgc3RyZWFtR2VvbWV0cnlUeXBlW2dlb21ldHJ5LnR5cGVdKGdlb21ldHJ5LCBzdHJlYW0pO1xuICB9XG59XG5cbnZhciBzdHJlYW1PYmplY3RUeXBlID0ge1xuICBGZWF0dXJlOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbUdlb21ldHJ5KG9iamVjdC5nZW9tZXRyeSwgc3RyZWFtKTtcbiAgfSxcbiAgRmVhdHVyZUNvbGxlY3Rpb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGZlYXR1cmVzID0gb2JqZWN0LmZlYXR1cmVzLCBpID0gLTEsIG4gPSBmZWF0dXJlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUdlb21ldHJ5KGZlYXR1cmVzW2ldLmdlb21ldHJ5LCBzdHJlYW0pO1xuICB9XG59O1xuXG52YXIgc3RyZWFtR2VvbWV0cnlUeXBlID0ge1xuICBTcGhlcmU6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtLnNwaGVyZSgpO1xuICB9LFxuICBQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBvYmplY3QgPSBvYmplY3QuY29vcmRpbmF0ZXM7XG4gICAgc3RyZWFtLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICB9LFxuICBNdWx0aVBvaW50OiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBvYmplY3QgPSBjb29yZGluYXRlc1tpXSwgc3RyZWFtLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICB9LFxuICBMaW5lU3RyaW5nOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbUxpbmUob2JqZWN0LmNvb3JkaW5hdGVzLCBzdHJlYW0sIDApO1xuICB9LFxuICBNdWx0aUxpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSwgMCk7XG4gIH0sXG4gIFBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtUG9seWdvbihvYmplY3QuY29vcmRpbmF0ZXMsIHN0cmVhbSk7XG4gIH0sXG4gIE11bHRpUG9seWdvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtUG9seWdvbihjb29yZGluYXRlc1tpXSwgc3RyZWFtKTtcbiAgfSxcbiAgR2VvbWV0cnlDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBnZW9tZXRyaWVzID0gb2JqZWN0Lmdlb21ldHJpZXMsIGkgPSAtMSwgbiA9IGdlb21ldHJpZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1HZW9tZXRyeShnZW9tZXRyaWVzW2ldLCBzdHJlYW0pO1xuICB9XG59O1xuXG5mdW5jdGlvbiBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzLCBzdHJlYW0sIGNsb3NlZCkge1xuICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoIC0gY2xvc2VkLCBjb29yZGluYXRlO1xuICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gIHdoaWxlICgrK2kgPCBuKSBjb29yZGluYXRlID0gY29vcmRpbmF0ZXNbaV0sIHN0cmVhbS5wb2ludChjb29yZGluYXRlWzBdLCBjb29yZGluYXRlWzFdLCBjb29yZGluYXRlWzJdKTtcbiAgc3RyZWFtLmxpbmVFbmQoKTtcbn1cblxuZnVuY3Rpb24gc3RyZWFtUG9seWdvbihjb29yZGluYXRlcywgc3RyZWFtKSB7XG4gIHZhciBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gIHN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSwgMSk7XG4gIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gIGlmIChvYmplY3QgJiYgc3RyZWFtT2JqZWN0VHlwZS5oYXNPd25Qcm9wZXJ0eShvYmplY3QudHlwZSkpIHtcbiAgICBzdHJlYW1PYmplY3RUeXBlW29iamVjdC50eXBlXShvYmplY3QsIHN0cmVhbSk7XG4gIH0gZWxzZSB7XG4gICAgc3RyZWFtR2VvbWV0cnkob2JqZWN0LCBzdHJlYW0pO1xuICB9XG59XG4iLCAiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2F0YW4yLCBjb3MsIHF1YXJ0ZXJQaSwgcmFkaWFucywgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuL25vb3AuanNcIjtcbmltcG9ydCBzdHJlYW0gZnJvbSBcIi4vc3RyZWFtLmpzXCI7XG5cbmV4cG9ydCB2YXIgYXJlYVJpbmdTdW0gPSBuZXcgQWRkZXIoKTtcblxuLy8gaGVsbG8/XG5cbnZhciBhcmVhU3VtID0gbmV3IEFkZGVyKCksXG4gICAgbGFtYmRhMDAsXG4gICAgcGhpMDAsXG4gICAgbGFtYmRhMCxcbiAgICBjb3NQaGkwLFxuICAgIHNpblBoaTA7XG5cbmV4cG9ydCB2YXIgYXJlYVN0cmVhbSA9IHtcbiAgcG9pbnQ6IG5vb3AsXG4gIGxpbmVTdGFydDogbm9vcCxcbiAgbGluZUVuZDogbm9vcCxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpO1xuICAgIGFyZWFTdHJlYW0ubGluZVN0YXJ0ID0gYXJlYVJpbmdTdGFydDtcbiAgICBhcmVhU3RyZWFtLmxpbmVFbmQgPSBhcmVhUmluZ0VuZDtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZWFSaW5nID0gK2FyZWFSaW5nU3VtO1xuICAgIGFyZWFTdW0uYWRkKGFyZWFSaW5nIDwgMCA/IHRhdSArIGFyZWFSaW5nIDogYXJlYVJpbmcpO1xuICAgIHRoaXMubGluZVN0YXJ0ID0gdGhpcy5saW5lRW5kID0gdGhpcy5wb2ludCA9IG5vb3A7XG4gIH0sXG4gIHNwaGVyZTogZnVuY3Rpb24oKSB7XG4gICAgYXJlYVN1bS5hZGQodGF1KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gYXJlYVJpbmdTdGFydCgpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludEZpcnN0O1xufVxuXG5mdW5jdGlvbiBhcmVhUmluZ0VuZCgpIHtcbiAgYXJlYVBvaW50KGxhbWJkYTAwLCBwaGkwMCk7XG59XG5cbmZ1bmN0aW9uIGFyZWFQb2ludEZpcnN0KGxhbWJkYSwgcGhpKSB7XG4gIGFyZWFTdHJlYW0ucG9pbnQgPSBhcmVhUG9pbnQ7XG4gIGxhbWJkYTAwID0gbGFtYmRhLCBwaGkwMCA9IHBoaTtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICBsYW1iZGEwID0gbGFtYmRhLCBjb3NQaGkwID0gY29zKHBoaSA9IHBoaSAvIDIgKyBxdWFydGVyUGkpLCBzaW5QaGkwID0gc2luKHBoaSk7XG59XG5cbmZ1bmN0aW9uIGFyZWFQb2ludChsYW1iZGEsIHBoaSkge1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIHBoaSA9IHBoaSAvIDIgKyBxdWFydGVyUGk7IC8vIGhhbGYgdGhlIGFuZ3VsYXIgZGlzdGFuY2UgZnJvbSBzb3V0aCBwb2xlXG5cbiAgLy8gU3BoZXJpY2FsIGV4Y2VzcyBFIGZvciBhIHNwaGVyaWNhbCB0cmlhbmdsZSB3aXRoIHZlcnRpY2VzOiBzb3V0aCBwb2xlLFxuICAvLyBwcmV2aW91cyBwb2ludCwgY3VycmVudCBwb2ludC4gIFVzZXMgYSBmb3JtdWxhIGRlcml2ZWQgZnJvbSBDYWdub2xpXHUyMDE5c1xuICAvLyB0aGVvcmVtLiAgU2VlIFRvZGh1bnRlciwgU3BoZXJpY2FsIFRyaWcuICgxODcxKSwgU2VjLiAxMDMsIEVxLiAoMikuXG4gIHZhciBkTGFtYmRhID0gbGFtYmRhIC0gbGFtYmRhMCxcbiAgICAgIHNkTGFtYmRhID0gZExhbWJkYSA+PSAwID8gMSA6IC0xLFxuICAgICAgYWRMYW1iZGEgPSBzZExhbWJkYSAqIGRMYW1iZGEsXG4gICAgICBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgIHNpblBoaSA9IHNpbihwaGkpLFxuICAgICAgayA9IHNpblBoaTAgKiBzaW5QaGksXG4gICAgICB1ID0gY29zUGhpMCAqIGNvc1BoaSArIGsgKiBjb3MoYWRMYW1iZGEpLFxuICAgICAgdiA9IGsgKiBzZExhbWJkYSAqIHNpbihhZExhbWJkYSk7XG4gIGFyZWFSaW5nU3VtLmFkZChhdGFuMih2LCB1KSk7XG5cbiAgLy8gQWR2YW5jZSB0aGUgcHJldmlvdXMgcG9pbnRzLlxuICBsYW1iZGEwID0gbGFtYmRhLCBjb3NQaGkwID0gY29zUGhpLCBzaW5QaGkwID0gc2luUGhpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmplY3QpIHtcbiAgYXJlYVN1bSA9IG5ldyBBZGRlcigpO1xuICBzdHJlYW0ob2JqZWN0LCBhcmVhU3RyZWFtKTtcbiAgcmV0dXJuIGFyZWFTdW0gKiAyO1xufVxuIiwgImltcG9ydCB7YXNpbiwgYXRhbjIsIGNvcywgc2luLCBzcXJ0fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGhlcmljYWwoY2FydGVzaWFuKSB7XG4gIHJldHVybiBbYXRhbjIoY2FydGVzaWFuWzFdLCBjYXJ0ZXNpYW5bMF0pLCBhc2luKGNhcnRlc2lhblsyXSldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuKHNwaGVyaWNhbCkge1xuICB2YXIgbGFtYmRhID0gc3BoZXJpY2FsWzBdLCBwaGkgPSBzcGhlcmljYWxbMV0sIGNvc1BoaSA9IGNvcyhwaGkpO1xuICByZXR1cm4gW2Nvc1BoaSAqIGNvcyhsYW1iZGEpLCBjb3NQaGkgKiBzaW4obGFtYmRhKSwgc2luKHBoaSldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuRG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbkNyb3NzKGEsIGIpIHtcbiAgcmV0dXJuIFthWzFdICogYlsyXSAtIGFbMl0gKiBiWzFdLCBhWzJdICogYlswXSAtIGFbMF0gKiBiWzJdLCBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdXTtcbn1cblxuLy8gVE9ETyByZXR1cm4gYVxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbkFkZEluUGxhY2UoYSwgYikge1xuICBhWzBdICs9IGJbMF0sIGFbMV0gKz0gYlsxXSwgYVsyXSArPSBiWzJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuU2NhbGUodmVjdG9yLCBrKSB7XG4gIHJldHVybiBbdmVjdG9yWzBdICogaywgdmVjdG9yWzFdICogaywgdmVjdG9yWzJdICoga107XG59XG5cbi8vIFRPRE8gcmV0dXJuIGRcbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKGQpIHtcbiAgdmFyIGwgPSBzcXJ0KGRbMF0gKiBkWzBdICsgZFsxXSAqIGRbMV0gKyBkWzJdICogZFsyXSk7XG4gIGRbMF0gLz0gbCwgZFsxXSAvPSBsLCBkWzJdIC89IGw7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuXG4gIGZ1bmN0aW9uIGNvbXBvc2UoeCwgeSkge1xuICAgIHJldHVybiB4ID0gYSh4LCB5KSwgYih4WzBdLCB4WzFdKTtcbiAgfVxuXG4gIGlmIChhLmludmVydCAmJiBiLmludmVydCkgY29tcG9zZS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPSBiLmludmVydCh4LCB5KSwgeCAmJiBhLmludmVydCh4WzBdLCB4WzFdKTtcbiAgfTtcblxuICByZXR1cm4gY29tcG9zZTtcbn1cbiIsICJpbXBvcnQgY29tcG9zZSBmcm9tIFwiLi9jb21wb3NlLmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZGVncmVlcywgcGksIHJhZGlhbnMsIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIHJvdGF0aW9uSWRlbnRpdHkobGFtYmRhLCBwaGkpIHtcbiAgaWYgKGFicyhsYW1iZGEpID4gcGkpIGxhbWJkYSAtPSBNYXRoLnJvdW5kKGxhbWJkYSAvIHRhdSkgKiB0YXU7XG4gIHJldHVybiBbbGFtYmRhLCBwaGldO1xufVxuXG5yb3RhdGlvbklkZW50aXR5LmludmVydCA9IHJvdGF0aW9uSWRlbnRpdHk7XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVSYWRpYW5zKGRlbHRhTGFtYmRhLCBkZWx0YVBoaSwgZGVsdGFHYW1tYSkge1xuICByZXR1cm4gKGRlbHRhTGFtYmRhICU9IHRhdSkgPyAoZGVsdGFQaGkgfHwgZGVsdGFHYW1tYSA/IGNvbXBvc2Uocm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpLCByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKSlcbiAgICA6IHJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSlcbiAgICA6IChkZWx0YVBoaSB8fCBkZWx0YUdhbW1hID8gcm90YXRpb25QaGlHYW1tYShkZWx0YVBoaSwgZGVsdGFHYW1tYSlcbiAgICA6IHJvdGF0aW9uSWRlbnRpdHkpO1xufVxuXG5mdW5jdGlvbiBmb3J3YXJkUm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgbGFtYmRhICs9IGRlbHRhTGFtYmRhO1xuICAgIGlmIChhYnMobGFtYmRhKSA+IHBpKSBsYW1iZGEgLT0gTWF0aC5yb3VuZChsYW1iZGEgLyB0YXUpICogdGF1O1xuICAgIHJldHVybiBbbGFtYmRhLCBwaGldO1xuICB9O1xufVxuXG5mdW5jdGlvbiByb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSkge1xuICB2YXIgcm90YXRpb24gPSBmb3J3YXJkUm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpO1xuICByb3RhdGlvbi5pbnZlcnQgPSBmb3J3YXJkUm90YXRpb25MYW1iZGEoLWRlbHRhTGFtYmRhKTtcbiAgcmV0dXJuIHJvdGF0aW9uO1xufVxuXG5mdW5jdGlvbiByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKSB7XG4gIHZhciBjb3NEZWx0YVBoaSA9IGNvcyhkZWx0YVBoaSksXG4gICAgICBzaW5EZWx0YVBoaSA9IHNpbihkZWx0YVBoaSksXG4gICAgICBjb3NEZWx0YUdhbW1hID0gY29zKGRlbHRhR2FtbWEpLFxuICAgICAgc2luRGVsdGFHYW1tYSA9IHNpbihkZWx0YUdhbW1hKTtcblxuICBmdW5jdGlvbiByb3RhdGlvbihsYW1iZGEsIHBoaSkge1xuICAgIHZhciBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgICAgeCA9IGNvcyhsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB5ID0gc2luKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHogPSBzaW4ocGhpKSxcbiAgICAgICAgayA9IHogKiBjb3NEZWx0YVBoaSArIHggKiBzaW5EZWx0YVBoaTtcbiAgICByZXR1cm4gW1xuICAgICAgYXRhbjIoeSAqIGNvc0RlbHRhR2FtbWEgLSBrICogc2luRGVsdGFHYW1tYSwgeCAqIGNvc0RlbHRhUGhpIC0geiAqIHNpbkRlbHRhUGhpKSxcbiAgICAgIGFzaW4oayAqIGNvc0RlbHRhR2FtbWEgKyB5ICogc2luRGVsdGFHYW1tYSlcbiAgICBdO1xuICB9XG5cbiAgcm90YXRpb24uaW52ZXJ0ID0gZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICB2YXIgY29zUGhpID0gY29zKHBoaSksXG4gICAgICAgIHggPSBjb3MobGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeSA9IHNpbihsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB6ID0gc2luKHBoaSksXG4gICAgICAgIGsgPSB6ICogY29zRGVsdGFHYW1tYSAtIHkgKiBzaW5EZWx0YUdhbW1hO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih5ICogY29zRGVsdGFHYW1tYSArIHogKiBzaW5EZWx0YUdhbW1hLCB4ICogY29zRGVsdGFQaGkgKyBrICogc2luRGVsdGFQaGkpLFxuICAgICAgYXNpbihrICogY29zRGVsdGFQaGkgLSB4ICogc2luRGVsdGFQaGkpXG4gICAgXTtcbiAgfTtcblxuICByZXR1cm4gcm90YXRpb247XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHJvdGF0ZSkge1xuICByb3RhdGUgPSByb3RhdGVSYWRpYW5zKHJvdGF0ZVswXSAqIHJhZGlhbnMsIHJvdGF0ZVsxXSAqIHJhZGlhbnMsIHJvdGF0ZS5sZW5ndGggPiAyID8gcm90YXRlWzJdICogcmFkaWFucyA6IDApO1xuXG4gIGZ1bmN0aW9uIGZvcndhcmQoY29vcmRpbmF0ZXMpIHtcbiAgICBjb29yZGluYXRlcyA9IHJvdGF0ZShjb29yZGluYXRlc1swXSAqIHJhZGlhbnMsIGNvb3JkaW5hdGVzWzFdICogcmFkaWFucyk7XG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzWzBdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzWzFdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzO1xuICB9XG5cbiAgZm9yd2FyZC5pbnZlcnQgPSBmdW5jdGlvbihjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzID0gcm90YXRlLmludmVydChjb29yZGluYXRlc1swXSAqIHJhZGlhbnMsIGNvb3JkaW5hdGVzWzFdICogcmFkaWFucyk7XG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzWzBdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzWzFdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzO1xuICB9O1xuXG4gIHJldHVybiBmb3J3YXJkO1xufVxuIiwgImltcG9ydCB7Y2FydGVzaWFuLCBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlLCBzcGhlcmljYWx9IGZyb20gXCIuL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQge2Fjb3MsIGNvcywgZGVncmVlcywgZXBzaWxvbiwgcmFkaWFucywgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcbmltcG9ydCB7cm90YXRlUmFkaWFuc30gZnJvbSBcIi4vcm90YXRpb24uanNcIjtcblxuLy8gR2VuZXJhdGVzIGEgY2lyY2xlIGNlbnRlcmVkIGF0IFswXHUwMEIwLCAwXHUwMEIwXSwgd2l0aCBhIGdpdmVuIHJhZGl1cyBhbmQgcHJlY2lzaW9uLlxuZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZVN0cmVhbShzdHJlYW0sIHJhZGl1cywgZGVsdGEsIGRpcmVjdGlvbiwgdDAsIHQxKSB7XG4gIGlmICghZGVsdGEpIHJldHVybjtcbiAgdmFyIGNvc1JhZGl1cyA9IGNvcyhyYWRpdXMpLFxuICAgICAgc2luUmFkaXVzID0gc2luKHJhZGl1cyksXG4gICAgICBzdGVwID0gZGlyZWN0aW9uICogZGVsdGE7XG4gIGlmICh0MCA9PSBudWxsKSB7XG4gICAgdDAgPSByYWRpdXMgKyBkaXJlY3Rpb24gKiB0YXU7XG4gICAgdDEgPSByYWRpdXMgLSBzdGVwIC8gMjtcbiAgfSBlbHNlIHtcbiAgICB0MCA9IGNpcmNsZVJhZGl1cyhjb3NSYWRpdXMsIHQwKTtcbiAgICB0MSA9IGNpcmNsZVJhZGl1cyhjb3NSYWRpdXMsIHQxKTtcbiAgICBpZiAoZGlyZWN0aW9uID4gMCA/IHQwIDwgdDEgOiB0MCA+IHQxKSB0MCArPSBkaXJlY3Rpb24gKiB0YXU7XG4gIH1cbiAgZm9yICh2YXIgcG9pbnQsIHQgPSB0MDsgZGlyZWN0aW9uID4gMCA/IHQgPiB0MSA6IHQgPCB0MTsgdCAtPSBzdGVwKSB7XG4gICAgcG9pbnQgPSBzcGhlcmljYWwoW2Nvc1JhZGl1cywgLXNpblJhZGl1cyAqIGNvcyh0KSwgLXNpblJhZGl1cyAqIHNpbih0KV0pO1xuICAgIHN0cmVhbS5wb2ludChwb2ludFswXSwgcG9pbnRbMV0pO1xuICB9XG59XG5cbi8vIFJldHVybnMgdGhlIHNpZ25lZCBhbmdsZSBvZiBhIGNhcnRlc2lhbiBwb2ludCByZWxhdGl2ZSB0byBbY29zUmFkaXVzLCAwLCAwXS5cbmZ1bmN0aW9uIGNpcmNsZVJhZGl1cyhjb3NSYWRpdXMsIHBvaW50KSB7XG4gIHBvaW50ID0gY2FydGVzaWFuKHBvaW50KSwgcG9pbnRbMF0gLT0gY29zUmFkaXVzO1xuICBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKHBvaW50KTtcbiAgdmFyIHJhZGl1cyA9IGFjb3MoLXBvaW50WzFdKTtcbiAgcmV0dXJuICgoLXBvaW50WzJdIDwgMCA/IC1yYWRpdXMgOiByYWRpdXMpICsgdGF1IC0gZXBzaWxvbikgJSB0YXU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2VudGVyID0gY29uc3RhbnQoWzAsIDBdKSxcbiAgICAgIHJhZGl1cyA9IGNvbnN0YW50KDkwKSxcbiAgICAgIHByZWNpc2lvbiA9IGNvbnN0YW50KDIpLFxuICAgICAgcmluZyxcbiAgICAgIHJvdGF0ZSxcbiAgICAgIHN0cmVhbSA9IHtwb2ludDogcG9pbnR9O1xuXG4gIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICByaW5nLnB1c2goeCA9IHJvdGF0ZSh4LCB5KSk7XG4gICAgeFswXSAqPSBkZWdyZWVzLCB4WzFdICo9IGRlZ3JlZXM7XG4gIH1cblxuICBmdW5jdGlvbiBjaXJjbGUoKSB7XG4gICAgdmFyIGMgPSBjZW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSxcbiAgICAgICAgciA9IHJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpICogcmFkaWFucyxcbiAgICAgICAgcCA9IHByZWNpc2lvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpICogcmFkaWFucztcbiAgICByaW5nID0gW107XG4gICAgcm90YXRlID0gcm90YXRlUmFkaWFucygtY1swXSAqIHJhZGlhbnMsIC1jWzFdICogcmFkaWFucywgMCkuaW52ZXJ0O1xuICAgIGNpcmNsZVN0cmVhbShzdHJlYW0sIHIsIHAsIDEpO1xuICAgIGMgPSB7dHlwZTogXCJQb2x5Z29uXCIsIGNvb3JkaW5hdGVzOiBbcmluZ119O1xuICAgIHJpbmcgPSByb3RhdGUgPSBudWxsO1xuICAgIHJldHVybiBjO1xuICB9XG5cbiAgY2lyY2xlLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChjZW50ZXIgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KFsrX1swXSwgK19bMV1dKSwgY2lyY2xlKSA6IGNlbnRlcjtcbiAgfTtcblxuICBjaXJjbGUucmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBjaXJjbGUpIDogcmFkaXVzO1xuICB9O1xuXG4gIGNpcmNsZS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJlY2lzaW9uID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGNpcmNsZSkgOiBwcmVjaXNpb247XG4gIH07XG5cbiAgcmV0dXJuIGNpcmNsZTtcbn1cbiIsICJpbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGxpbmVzID0gW10sXG4gICAgICBsaW5lO1xuICByZXR1cm4ge1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5LCBtKSB7XG4gICAgICBsaW5lLnB1c2goW3gsIHksIG1dKTtcbiAgICB9LFxuICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBsaW5lcy5wdXNoKGxpbmUgPSBbXSk7XG4gICAgfSxcbiAgICBsaW5lRW5kOiBub29wLFxuICAgIHJlam9pbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAobGluZXMubGVuZ3RoID4gMSkgbGluZXMucHVzaChsaW5lcy5wb3AoKS5jb25jYXQobGluZXMuc2hpZnQoKSkpO1xuICAgIH0sXG4gICAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXN1bHQgPSBsaW5lcztcbiAgICAgIGxpbmVzID0gW107XG4gICAgICBsaW5lID0gbnVsbDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9O1xufVxuIiwgImltcG9ydCB7YWJzLCBlcHNpbG9ufSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGFicyhhWzBdIC0gYlswXSkgPCBlcHNpbG9uICYmIGFicyhhWzFdIC0gYlsxXSkgPCBlcHNpbG9uO1xufVxuIiwgImltcG9ydCBwb2ludEVxdWFsIGZyb20gXCIuLi9wb2ludEVxdWFsLmpzXCI7XG5pbXBvcnQge2Vwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIEludGVyc2VjdGlvbihwb2ludCwgcG9pbnRzLCBvdGhlciwgZW50cnkpIHtcbiAgdGhpcy54ID0gcG9pbnQ7XG4gIHRoaXMueiA9IHBvaW50cztcbiAgdGhpcy5vID0gb3RoZXI7IC8vIGFub3RoZXIgaW50ZXJzZWN0aW9uXG4gIHRoaXMuZSA9IGVudHJ5OyAvLyBpcyBhbiBlbnRyeT9cbiAgdGhpcy52ID0gZmFsc2U7IC8vIHZpc2l0ZWRcbiAgdGhpcy5uID0gdGhpcy5wID0gbnVsbDsgLy8gbmV4dCAmIHByZXZpb3VzXG59XG5cbi8vIEEgZ2VuZXJhbGl6ZWQgcG9seWdvbiBjbGlwcGluZyBhbGdvcml0aG06IGdpdmVuIGEgcG9seWdvbiB0aGF0IGhhcyBiZWVuIGN1dFxuLy8gaW50byBpdHMgdmlzaWJsZSBsaW5lIHNlZ21lbnRzLCBhbmQgcmVqb2lucyB0aGUgc2VnbWVudHMgYnkgaW50ZXJwb2xhdGluZ1xuLy8gYWxvbmcgdGhlIGNsaXAgZWRnZS5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHN0cmVhbSkge1xuICB2YXIgc3ViamVjdCA9IFtdLFxuICAgICAgY2xpcCA9IFtdLFxuICAgICAgaSxcbiAgICAgIG47XG5cbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbihzZWdtZW50KSB7XG4gICAgaWYgKChuID0gc2VnbWVudC5sZW5ndGggLSAxKSA8PSAwKSByZXR1cm47XG4gICAgdmFyIG4sIHAwID0gc2VnbWVudFswXSwgcDEgPSBzZWdtZW50W25dLCB4O1xuXG4gICAgaWYgKHBvaW50RXF1YWwocDAsIHAxKSkge1xuICAgICAgaWYgKCFwMFsyXSAmJiAhcDFbMl0pIHtcbiAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBzdHJlYW0ucG9pbnQoKHAwID0gc2VnbWVudFtpXSlbMF0sIHAwWzFdKTtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gaGFuZGxlIGRlZ2VuZXJhdGUgY2FzZXMgYnkgbW92aW5nIHRoZSBwb2ludFxuICAgICAgcDFbMF0gKz0gMiAqIGVwc2lsb247XG4gICAgfVxuXG4gICAgc3ViamVjdC5wdXNoKHggPSBuZXcgSW50ZXJzZWN0aW9uKHAwLCBzZWdtZW50LCBudWxsLCB0cnVlKSk7XG4gICAgY2xpcC5wdXNoKHgubyA9IG5ldyBJbnRlcnNlY3Rpb24ocDAsIG51bGwsIHgsIGZhbHNlKSk7XG4gICAgc3ViamVjdC5wdXNoKHggPSBuZXcgSW50ZXJzZWN0aW9uKHAxLCBzZWdtZW50LCBudWxsLCBmYWxzZSkpO1xuICAgIGNsaXAucHVzaCh4Lm8gPSBuZXcgSW50ZXJzZWN0aW9uKHAxLCBudWxsLCB4LCB0cnVlKSk7XG4gIH0pO1xuXG4gIGlmICghc3ViamVjdC5sZW5ndGgpIHJldHVybjtcblxuICBjbGlwLnNvcnQoY29tcGFyZUludGVyc2VjdGlvbik7XG4gIGxpbmsoc3ViamVjdCk7XG4gIGxpbmsoY2xpcCk7XG5cbiAgZm9yIChpID0gMCwgbiA9IGNsaXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgY2xpcFtpXS5lID0gc3RhcnRJbnNpZGUgPSAhc3RhcnRJbnNpZGU7XG4gIH1cblxuICB2YXIgc3RhcnQgPSBzdWJqZWN0WzBdLFxuICAgICAgcG9pbnRzLFxuICAgICAgcG9pbnQ7XG5cbiAgd2hpbGUgKDEpIHtcbiAgICAvLyBGaW5kIGZpcnN0IHVudmlzaXRlZCBpbnRlcnNlY3Rpb24uXG4gICAgdmFyIGN1cnJlbnQgPSBzdGFydCxcbiAgICAgICAgaXNTdWJqZWN0ID0gdHJ1ZTtcbiAgICB3aGlsZSAoY3VycmVudC52KSBpZiAoKGN1cnJlbnQgPSBjdXJyZW50Lm4pID09PSBzdGFydCkgcmV0dXJuO1xuICAgIHBvaW50cyA9IGN1cnJlbnQuejtcbiAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgZG8ge1xuICAgICAgY3VycmVudC52ID0gY3VycmVudC5vLnYgPSB0cnVlO1xuICAgICAgaWYgKGN1cnJlbnQuZSkge1xuICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgZm9yIChpID0gMCwgbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBuOyArK2kpIHN0cmVhbS5wb2ludCgocG9pbnQgPSBwb2ludHNbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW50ZXJwb2xhdGUoY3VycmVudC54LCBjdXJyZW50Lm4ueCwgMSwgc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzU3ViamVjdCkge1xuICAgICAgICAgIHBvaW50cyA9IGN1cnJlbnQucC56O1xuICAgICAgICAgIGZvciAoaSA9IHBvaW50cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkgc3RyZWFtLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShjdXJyZW50LngsIGN1cnJlbnQucC54LCAtMSwgc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wO1xuICAgICAgfVxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubztcbiAgICAgIHBvaW50cyA9IGN1cnJlbnQuejtcbiAgICAgIGlzU3ViamVjdCA9ICFpc1N1YmplY3Q7XG4gICAgfSB3aGlsZSAoIWN1cnJlbnQudik7XG4gICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsaW5rKGFycmF5KSB7XG4gIGlmICghKG4gPSBhcnJheS5sZW5ndGgpKSByZXR1cm47XG4gIHZhciBuLFxuICAgICAgaSA9IDAsXG4gICAgICBhID0gYXJyYXlbMF0sXG4gICAgICBiO1xuICB3aGlsZSAoKytpIDwgbikge1xuICAgIGEubiA9IGIgPSBhcnJheVtpXTtcbiAgICBiLnAgPSBhO1xuICAgIGEgPSBiO1xuICB9XG4gIGEubiA9IGIgPSBhcnJheVswXTtcbiAgYi5wID0gYTtcbn1cbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7Y2FydGVzaWFuLCBjYXJ0ZXNpYW5Dcm9zcywgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZX0gZnJvbSBcIi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgZXBzaWxvbjIsIGhhbGZQaSwgcGksIHF1YXJ0ZXJQaSwgc2lnbiwgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gbG9uZ2l0dWRlKHBvaW50KSB7XG4gIHJldHVybiBhYnMocG9pbnRbMF0pIDw9IHBpID8gcG9pbnRbMF0gOiBzaWduKHBvaW50WzBdKSAqICgoYWJzKHBvaW50WzBdKSArIHBpKSAlIHRhdSAtIHBpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocG9seWdvbiwgcG9pbnQpIHtcbiAgdmFyIGxhbWJkYSA9IGxvbmdpdHVkZShwb2ludCksXG4gICAgICBwaGkgPSBwb2ludFsxXSxcbiAgICAgIHNpblBoaSA9IHNpbihwaGkpLFxuICAgICAgbm9ybWFsID0gW3NpbihsYW1iZGEpLCAtY29zKGxhbWJkYSksIDBdLFxuICAgICAgYW5nbGUgPSAwLFxuICAgICAgd2luZGluZyA9IDA7XG5cbiAgdmFyIHN1bSA9IG5ldyBBZGRlcigpO1xuXG4gIGlmIChzaW5QaGkgPT09IDEpIHBoaSA9IGhhbGZQaSArIGVwc2lsb247XG4gIGVsc2UgaWYgKHNpblBoaSA9PT0gLTEpIHBoaSA9IC1oYWxmUGkgLSBlcHNpbG9uO1xuXG4gIGZvciAodmFyIGkgPSAwLCBuID0gcG9seWdvbi5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoIShtID0gKHJpbmcgPSBwb2x5Z29uW2ldKS5sZW5ndGgpKSBjb250aW51ZTtcbiAgICB2YXIgcmluZyxcbiAgICAgICAgbSxcbiAgICAgICAgcG9pbnQwID0gcmluZ1ttIC0gMV0sXG4gICAgICAgIGxhbWJkYTAgPSBsb25naXR1ZGUocG9pbnQwKSxcbiAgICAgICAgcGhpMCA9IHBvaW50MFsxXSAvIDIgKyBxdWFydGVyUGksXG4gICAgICAgIHNpblBoaTAgPSBzaW4ocGhpMCksXG4gICAgICAgIGNvc1BoaTAgPSBjb3MocGhpMCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG07ICsraiwgbGFtYmRhMCA9IGxhbWJkYTEsIHNpblBoaTAgPSBzaW5QaGkxLCBjb3NQaGkwID0gY29zUGhpMSwgcG9pbnQwID0gcG9pbnQxKSB7XG4gICAgICB2YXIgcG9pbnQxID0gcmluZ1tqXSxcbiAgICAgICAgICBsYW1iZGExID0gbG9uZ2l0dWRlKHBvaW50MSksXG4gICAgICAgICAgcGhpMSA9IHBvaW50MVsxXSAvIDIgKyBxdWFydGVyUGksXG4gICAgICAgICAgc2luUGhpMSA9IHNpbihwaGkxKSxcbiAgICAgICAgICBjb3NQaGkxID0gY29zKHBoaTEpLFxuICAgICAgICAgIGRlbHRhID0gbGFtYmRhMSAtIGxhbWJkYTAsXG4gICAgICAgICAgc2lnbiA9IGRlbHRhID49IDAgPyAxIDogLTEsXG4gICAgICAgICAgYWJzRGVsdGEgPSBzaWduICogZGVsdGEsXG4gICAgICAgICAgYW50aW1lcmlkaWFuID0gYWJzRGVsdGEgPiBwaSxcbiAgICAgICAgICBrID0gc2luUGhpMCAqIHNpblBoaTE7XG5cbiAgICAgIHN1bS5hZGQoYXRhbjIoayAqIHNpZ24gKiBzaW4oYWJzRGVsdGEpLCBjb3NQaGkwICogY29zUGhpMSArIGsgKiBjb3MoYWJzRGVsdGEpKSk7XG4gICAgICBhbmdsZSArPSBhbnRpbWVyaWRpYW4gPyBkZWx0YSArIHNpZ24gKiB0YXUgOiBkZWx0YTtcblxuICAgICAgLy8gQXJlIHRoZSBsb25naXR1ZGVzIGVpdGhlciBzaWRlIG9mIHRoZSBwb2ludFx1MjAxOXMgbWVyaWRpYW4gKGxhbWJkYSksXG4gICAgICAvLyBhbmQgYXJlIHRoZSBsYXRpdHVkZXMgc21hbGxlciB0aGFuIHRoZSBwYXJhbGxlbCAocGhpKT9cbiAgICAgIGlmIChhbnRpbWVyaWRpYW4gXiBsYW1iZGEwID49IGxhbWJkYSBeIGxhbWJkYTEgPj0gbGFtYmRhKSB7XG4gICAgICAgIHZhciBhcmMgPSBjYXJ0ZXNpYW5Dcm9zcyhjYXJ0ZXNpYW4ocG9pbnQwKSwgY2FydGVzaWFuKHBvaW50MSkpO1xuICAgICAgICBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKGFyYyk7XG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBjYXJ0ZXNpYW5Dcm9zcyhub3JtYWwsIGFyYyk7XG4gICAgICAgIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgdmFyIHBoaUFyYyA9IChhbnRpbWVyaWRpYW4gXiBkZWx0YSA+PSAwID8gLTEgOiAxKSAqIGFzaW4oaW50ZXJzZWN0aW9uWzJdKTtcbiAgICAgICAgaWYgKHBoaSA+IHBoaUFyYyB8fCBwaGkgPT09IHBoaUFyYyAmJiAoYXJjWzBdIHx8IGFyY1sxXSkpIHtcbiAgICAgICAgICB3aW5kaW5nICs9IGFudGltZXJpZGlhbiBeIGRlbHRhID49IDAgPyAxIDogLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBGaXJzdCwgZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIFNvdXRoIHBvbGUgaXMgaW5zaWRlIG9yIG91dHNpZGU6XG4gIC8vXG4gIC8vIEl0IGlzIGluc2lkZSBpZjpcbiAgLy8gKiB0aGUgcG9seWdvbiB3aW5kcyBhcm91bmQgaXQgaW4gYSBjbG9ja3dpc2UgZGlyZWN0aW9uLlxuICAvLyAqIHRoZSBwb2x5Z29uIGRvZXMgbm90IChjdW11bGF0aXZlbHkpIHdpbmQgYXJvdW5kIGl0LCBidXQgaGFzIGEgbmVnYXRpdmVcbiAgLy8gICAoY291bnRlci1jbG9ja3dpc2UpIGFyZWEuXG4gIC8vXG4gIC8vIFNlY29uZCwgY291bnQgdGhlIChzaWduZWQpIG51bWJlciBvZiB0aW1lcyBhIHNlZ21lbnQgY3Jvc3NlcyBhIGxhbWJkYVxuICAvLyBmcm9tIHRoZSBwb2ludCB0byB0aGUgU291dGggcG9sZS4gIElmIGl0IGlzIHplcm8sIHRoZW4gdGhlIHBvaW50IGlzIHRoZVxuICAvLyBzYW1lIHNpZGUgYXMgdGhlIFNvdXRoIHBvbGUuXG5cbiAgcmV0dXJuIChhbmdsZSA8IC1lcHNpbG9uIHx8IGFuZ2xlIDwgZXBzaWxvbiAmJiBzdW0gPCAtZXBzaWxvbjIpIF4gKHdpbmRpbmcgJiAxKTtcbn1cbiIsICJpbXBvcnQgY2xpcEJ1ZmZlciBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmltcG9ydCBjbGlwUmVqb2luIGZyb20gXCIuL3Jlam9pbi5qc1wiO1xuaW1wb3J0IHtlcHNpbG9uLCBoYWxmUGl9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgcG9seWdvbkNvbnRhaW5zIGZyb20gXCIuLi9wb2x5Z29uQ29udGFpbnMuanNcIjtcbmltcG9ydCB7bWVyZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwb2ludFZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc3RhcnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNpbmspIHtcbiAgICB2YXIgbGluZSA9IGNsaXBMaW5lKHNpbmspLFxuICAgICAgICByaW5nQnVmZmVyID0gY2xpcEJ1ZmZlcigpLFxuICAgICAgICByaW5nU2luayA9IGNsaXBMaW5lKHJpbmdCdWZmZXIpLFxuICAgICAgICBwb2x5Z29uU3RhcnRlZCA9IGZhbHNlLFxuICAgICAgICBwb2x5Z29uLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgcmluZztcblxuICAgIHZhciBjbGlwID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50UmluZztcbiAgICAgICAgY2xpcC5saW5lU3RhcnQgPSByaW5nU3RhcnQ7XG4gICAgICAgIGNsaXAubGluZUVuZCA9IHJpbmdFbmQ7XG4gICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgIHBvbHlnb24gPSBbXTtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50O1xuICAgICAgICBjbGlwLmxpbmVTdGFydCA9IGxpbmVTdGFydDtcbiAgICAgICAgY2xpcC5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgc2VnbWVudHMgPSBtZXJnZShzZWdtZW50cyk7XG4gICAgICAgIHZhciBzdGFydEluc2lkZSA9IHBvbHlnb25Db250YWlucyhwb2x5Z29uLCBzdGFydCk7XG4gICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgY2xpcFJlam9pbihzZWdtZW50cywgY29tcGFyZUludGVyc2VjdGlvbiwgc3RhcnRJbnNpZGUsIGludGVycG9sYXRlLCBzaW5rKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydEluc2lkZSkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGludGVycG9sYXRlKG51bGwsIG51bGwsIDEsIHNpbmspO1xuICAgICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uRW5kKCksIHBvbHlnb25TdGFydGVkID0gZmFsc2U7XG4gICAgICAgIHNlZ21lbnRzID0gcG9seWdvbiA9IG51bGw7XG4gICAgICB9LFxuICAgICAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luay5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc2luayk7XG4gICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICBzaW5rLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIGlmIChwb2ludFZpc2libGUobGFtYmRhLCBwaGkpKSBzaW5rLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludExpbmUobGFtYmRhLCBwaGkpIHtcbiAgICAgIGxpbmUucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIGNsaXAucG9pbnQgPSBwb2ludExpbmU7XG4gICAgICBsaW5lLmxpbmVTdGFydCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICBsaW5lLmxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludFJpbmcobGFtYmRhLCBwaGkpIHtcbiAgICAgIHJpbmcucHVzaChbbGFtYmRhLCBwaGldKTtcbiAgICAgIHJpbmdTaW5rLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICByaW5nU2luay5saW5lU3RhcnQoKTtcbiAgICAgIHJpbmcgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nRW5kKCkge1xuICAgICAgcG9pbnRSaW5nKHJpbmdbMF1bMF0sIHJpbmdbMF1bMV0pO1xuICAgICAgcmluZ1NpbmsubGluZUVuZCgpO1xuXG4gICAgICB2YXIgY2xlYW4gPSByaW5nU2luay5jbGVhbigpLFxuICAgICAgICAgIHJpbmdTZWdtZW50cyA9IHJpbmdCdWZmZXIucmVzdWx0KCksXG4gICAgICAgICAgaSwgbiA9IHJpbmdTZWdtZW50cy5sZW5ndGgsIG0sXG4gICAgICAgICAgc2VnbWVudCxcbiAgICAgICAgICBwb2ludDtcblxuICAgICAgcmluZy5wb3AoKTtcbiAgICAgIHBvbHlnb24ucHVzaChyaW5nKTtcbiAgICAgIHJpbmcgPSBudWxsO1xuXG4gICAgICBpZiAoIW4pIHJldHVybjtcblxuICAgICAgLy8gTm8gaW50ZXJzZWN0aW9ucy5cbiAgICAgIGlmIChjbGVhbiAmIDEpIHtcbiAgICAgICAgc2VnbWVudCA9IHJpbmdTZWdtZW50c1swXTtcbiAgICAgICAgaWYgKChtID0gc2VnbWVudC5sZW5ndGggLSAxKSA+IDApIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSBzaW5rLnBvaW50KChwb2ludCA9IHNlZ21lbnRbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWpvaW4gY29ubmVjdGVkIHNlZ21lbnRzLlxuICAgICAgLy8gVE9ETyByZXVzZSByaW5nQnVmZmVyLnJlam9pbigpP1xuICAgICAgaWYgKG4gPiAxICYmIGNsZWFuICYgMikgcmluZ1NlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLnBvcCgpLmNvbmNhdChyaW5nU2VnbWVudHMuc2hpZnQoKSkpO1xuXG4gICAgICBzZWdtZW50cy5wdXNoKHJpbmdTZWdtZW50cy5maWx0ZXIodmFsaWRTZWdtZW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsaXA7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkU2VnbWVudChzZWdtZW50KSB7XG4gIHJldHVybiBzZWdtZW50Lmxlbmd0aCA+IDE7XG59XG5cbi8vIEludGVyc2VjdGlvbnMgYXJlIHNvcnRlZCBhbG9uZyB0aGUgY2xpcCBlZGdlLiBGb3IgYm90aCBhbnRpbWVyaWRpYW4gY3V0dGluZ1xuLy8gYW5kIGNpcmNsZSBjbGlwcGluZywgdGhlIHNhbWUgY29tcGFyaXNvbiBpcyB1c2VkLlxuZnVuY3Rpb24gY29tcGFyZUludGVyc2VjdGlvbihhLCBiKSB7XG4gIHJldHVybiAoKGEgPSBhLngpWzBdIDwgMCA/IGFbMV0gLSBoYWxmUGkgLSBlcHNpbG9uIDogaGFsZlBpIC0gYVsxXSlcbiAgICAgICAtICgoYiA9IGIueClbMF0gPCAwID8gYlsxXSAtIGhhbGZQaSAtIGVwc2lsb24gOiBoYWxmUGkgLSBiWzFdKTtcbn1cbiIsICJpbXBvcnQgY2xpcCBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHthYnMsIGF0YW4sIGNvcywgZXBzaWxvbiwgaGFsZlBpLCBwaSwgc2lufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGlwKFxuICBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG4gIGNsaXBBbnRpbWVyaWRpYW5MaW5lLFxuICBjbGlwQW50aW1lcmlkaWFuSW50ZXJwb2xhdGUsXG4gIFstcGksIC1oYWxmUGldXG4pO1xuXG4vLyBUYWtlcyBhIGxpbmUgYW5kIGN1dHMgaW50byB2aXNpYmxlIHNlZ21lbnRzLiBSZXR1cm4gdmFsdWVzOiAwIC0gdGhlcmUgd2VyZVxuLy8gaW50ZXJzZWN0aW9ucyBvciB0aGUgbGluZSB3YXMgZW1wdHk7IDEgLSBubyBpbnRlcnNlY3Rpb25zOyAyIC0gdGhlcmUgd2VyZVxuLy8gaW50ZXJzZWN0aW9ucywgYW5kIHRoZSBmaXJzdCBhbmQgbGFzdCBzZWdtZW50cyBzaG91bGQgYmUgcmVqb2luZWQuXG5mdW5jdGlvbiBjbGlwQW50aW1lcmlkaWFuTGluZShzdHJlYW0pIHtcbiAgdmFyIGxhbWJkYTAgPSBOYU4sXG4gICAgICBwaGkwID0gTmFOLFxuICAgICAgc2lnbjAgPSBOYU4sXG4gICAgICBjbGVhbjsgLy8gbm8gaW50ZXJzZWN0aW9uc1xuXG4gIHJldHVybiB7XG4gICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgIGNsZWFuID0gMTtcbiAgICB9LFxuICAgIHBvaW50OiBmdW5jdGlvbihsYW1iZGExLCBwaGkxKSB7XG4gICAgICB2YXIgc2lnbjEgPSBsYW1iZGExID4gMCA/IHBpIDogLXBpLFxuICAgICAgICAgIGRlbHRhID0gYWJzKGxhbWJkYTEgLSBsYW1iZGEwKTtcbiAgICAgIGlmIChhYnMoZGVsdGEgLSBwaSkgPCBlcHNpbG9uKSB7IC8vIGxpbmUgY3Jvc3NlcyBhIHBvbGVcbiAgICAgICAgc3RyZWFtLnBvaW50KGxhbWJkYTAsIHBoaTAgPSAocGhpMCArIHBoaTEpIC8gMiA+IDAgPyBoYWxmUGkgOiAtaGFsZlBpKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24wLCBwaGkwKTtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjEsIHBoaTApO1xuICAgICAgICBzdHJlYW0ucG9pbnQobGFtYmRhMSwgcGhpMCk7XG4gICAgICAgIGNsZWFuID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoc2lnbjAgIT09IHNpZ24xICYmIGRlbHRhID49IHBpKSB7IC8vIGxpbmUgY3Jvc3NlcyBhbnRpbWVyaWRpYW5cbiAgICAgICAgaWYgKGFicyhsYW1iZGEwIC0gc2lnbjApIDwgZXBzaWxvbikgbGFtYmRhMCAtPSBzaWduMCAqIGVwc2lsb247IC8vIGhhbmRsZSBkZWdlbmVyYWNpZXNcbiAgICAgICAgaWYgKGFicyhsYW1iZGExIC0gc2lnbjEpIDwgZXBzaWxvbikgbGFtYmRhMSAtPSBzaWduMSAqIGVwc2lsb247XG4gICAgICAgIHBoaTAgPSBjbGlwQW50aW1lcmlkaWFuSW50ZXJzZWN0KGxhbWJkYTAsIHBoaTAsIGxhbWJkYTEsIHBoaTEpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjAsIHBoaTApO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMSwgcGhpMCk7XG4gICAgICAgIGNsZWFuID0gMDtcbiAgICAgIH1cbiAgICAgIHN0cmVhbS5wb2ludChsYW1iZGEwID0gbGFtYmRhMSwgcGhpMCA9IHBoaTEpO1xuICAgICAgc2lnbjAgPSBzaWduMTtcbiAgICB9LFxuICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgIGxhbWJkYTAgPSBwaGkwID0gTmFOO1xuICAgIH0sXG4gICAgY2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIDIgLSBjbGVhbjsgLy8gaWYgaW50ZXJzZWN0aW9ucywgcmVqb2luIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbGlwQW50aW1lcmlkaWFuSW50ZXJzZWN0KGxhbWJkYTAsIHBoaTAsIGxhbWJkYTEsIHBoaTEpIHtcbiAgdmFyIGNvc1BoaTAsXG4gICAgICBjb3NQaGkxLFxuICAgICAgc2luTGFtYmRhMExhbWJkYTEgPSBzaW4obGFtYmRhMCAtIGxhbWJkYTEpO1xuICByZXR1cm4gYWJzKHNpbkxhbWJkYTBMYW1iZGExKSA+IGVwc2lsb25cbiAgICAgID8gYXRhbigoc2luKHBoaTApICogKGNvc1BoaTEgPSBjb3MocGhpMSkpICogc2luKGxhbWJkYTEpXG4gICAgICAgICAgLSBzaW4ocGhpMSkgKiAoY29zUGhpMCA9IGNvcyhwaGkwKSkgKiBzaW4obGFtYmRhMCkpXG4gICAgICAgICAgLyAoY29zUGhpMCAqIGNvc1BoaTEgKiBzaW5MYW1iZGEwTGFtYmRhMSkpXG4gICAgICA6IChwaGkwICsgcGhpMSkgLyAyO1xufVxuXG5mdW5jdGlvbiBjbGlwQW50aW1lcmlkaWFuSW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gIHZhciBwaGk7XG4gIGlmIChmcm9tID09IG51bGwpIHtcbiAgICBwaGkgPSBkaXJlY3Rpb24gKiBoYWxmUGk7XG4gICAgc3RyZWFtLnBvaW50KC1waSwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoMCwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KHBpLCAwKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCAtcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCAtcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCAwKTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCBwaGkpO1xuICB9IGVsc2UgaWYgKGFicyhmcm9tWzBdIC0gdG9bMF0pID4gZXBzaWxvbikge1xuICAgIHZhciBsYW1iZGEgPSBmcm9tWzBdIDwgdG9bMF0gPyBwaSA6IC1waTtcbiAgICBwaGkgPSBkaXJlY3Rpb24gKiBsYW1iZGEgLyAyO1xuICAgIHN0cmVhbS5wb2ludCgtbGFtYmRhLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludChsYW1iZGEsIHBoaSk7XG4gIH0gZWxzZSB7XG4gICAgc3RyZWFtLnBvaW50KHRvWzBdLCB0b1sxXSk7XG4gIH1cbn1cbiIsICJpbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuQWRkSW5QbGFjZSwgY2FydGVzaWFuQ3Jvc3MsIGNhcnRlc2lhbkRvdCwgY2FydGVzaWFuU2NhbGUsIHNwaGVyaWNhbH0gZnJvbSBcIi4uL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IHtjaXJjbGVTdHJlYW19IGZyb20gXCIuLi9jaXJjbGUuanNcIjtcbmltcG9ydCB7YWJzLCBjb3MsIGVwc2lsb24sIHBpLCByYWRpYW5zLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHBvaW50RXF1YWwgZnJvbSBcIi4uL3BvaW50RXF1YWwuanNcIjtcbmltcG9ydCBjbGlwIGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHJhZGl1cykge1xuICB2YXIgY3IgPSBjb3MocmFkaXVzKSxcbiAgICAgIGRlbHRhID0gMiAqIHJhZGlhbnMsXG4gICAgICBzbWFsbFJhZGl1cyA9IGNyID4gMCxcbiAgICAgIG5vdEhlbWlzcGhlcmUgPSBhYnMoY3IpID4gZXBzaWxvbjsgLy8gVE9ETyBvcHRpbWlzZSBmb3IgdGhpcyBjb21tb24gY2FzZVxuXG4gIGZ1bmN0aW9uIGludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIHN0cmVhbSkge1xuICAgIGNpcmNsZVN0cmVhbShzdHJlYW0sIHJhZGl1cywgZGVsdGEsIGRpcmVjdGlvbiwgZnJvbSwgdG8pO1xuICB9XG5cbiAgZnVuY3Rpb24gdmlzaWJsZShsYW1iZGEsIHBoaSkge1xuICAgIHJldHVybiBjb3MobGFtYmRhKSAqIGNvcyhwaGkpID4gY3I7XG4gIH1cblxuICAvLyBUYWtlcyBhIGxpbmUgYW5kIGN1dHMgaW50byB2aXNpYmxlIHNlZ21lbnRzLiBSZXR1cm4gdmFsdWVzIHVzZWQgZm9yIHBvbHlnb25cbiAgLy8gY2xpcHBpbmc6IDAgLSB0aGVyZSB3ZXJlIGludGVyc2VjdGlvbnMgb3IgdGhlIGxpbmUgd2FzIGVtcHR5OyAxIC0gbm9cbiAgLy8gaW50ZXJzZWN0aW9ucyAyIC0gdGhlcmUgd2VyZSBpbnRlcnNlY3Rpb25zLCBhbmQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gIC8vIHNob3VsZCBiZSByZWpvaW5lZC5cbiAgZnVuY3Rpb24gY2xpcExpbmUoc3RyZWFtKSB7XG4gICAgdmFyIHBvaW50MCwgLy8gcHJldmlvdXMgcG9pbnRcbiAgICAgICAgYzAsIC8vIGNvZGUgZm9yIHByZXZpb3VzIHBvaW50XG4gICAgICAgIHYwLCAvLyB2aXNpYmlsaXR5IG9mIHByZXZpb3VzIHBvaW50XG4gICAgICAgIHYwMCwgLy8gdmlzaWJpbGl0eSBvZiBmaXJzdCBwb2ludFxuICAgICAgICBjbGVhbjsgLy8gbm8gaW50ZXJzZWN0aW9uc1xuICAgIHJldHVybiB7XG4gICAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2MDAgPSB2MCA9IGZhbHNlO1xuICAgICAgICBjbGVhbiA9IDE7XG4gICAgICB9LFxuICAgICAgcG9pbnQ6IGZ1bmN0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgICAgIHZhciBwb2ludDEgPSBbbGFtYmRhLCBwaGldLFxuICAgICAgICAgICAgcG9pbnQyLFxuICAgICAgICAgICAgdiA9IHZpc2libGUobGFtYmRhLCBwaGkpLFxuICAgICAgICAgICAgYyA9IHNtYWxsUmFkaXVzXG4gICAgICAgICAgICAgID8gdiA/IDAgOiBjb2RlKGxhbWJkYSwgcGhpKVxuICAgICAgICAgICAgICA6IHYgPyBjb2RlKGxhbWJkYSArIChsYW1iZGEgPCAwID8gcGkgOiAtcGkpLCBwaGkpIDogMDtcbiAgICAgICAgaWYgKCFwb2ludDAgJiYgKHYwMCA9IHYwID0gdikpIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgaWYgKHYgIT09IHYwKSB7XG4gICAgICAgICAgcG9pbnQyID0gaW50ZXJzZWN0KHBvaW50MCwgcG9pbnQxKTtcbiAgICAgICAgICBpZiAoIXBvaW50MiB8fCBwb2ludEVxdWFsKHBvaW50MCwgcG9pbnQyKSB8fCBwb2ludEVxdWFsKHBvaW50MSwgcG9pbnQyKSlcbiAgICAgICAgICAgIHBvaW50MVsyXSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHYgIT09IHYwKSB7XG4gICAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAvLyBvdXRzaWRlIGdvaW5nIGluXG4gICAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBwb2ludDIgPSBpbnRlcnNlY3QocG9pbnQxLCBwb2ludDApO1xuICAgICAgICAgICAgc3RyZWFtLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaW5zaWRlIGdvaW5nIG91dFxuICAgICAgICAgICAgcG9pbnQyID0gaW50ZXJzZWN0KHBvaW50MCwgcG9pbnQxKTtcbiAgICAgICAgICAgIHN0cmVhbS5wb2ludChwb2ludDJbMF0sIHBvaW50MlsxXSwgMik7XG4gICAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb2ludDAgPSBwb2ludDI7XG4gICAgICAgIH0gZWxzZSBpZiAobm90SGVtaXNwaGVyZSAmJiBwb2ludDAgJiYgc21hbGxSYWRpdXMgXiB2KSB7XG4gICAgICAgICAgdmFyIHQ7XG4gICAgICAgICAgLy8gSWYgdGhlIGNvZGVzIGZvciB0d28gcG9pbnRzIGFyZSBkaWZmZXJlbnQsIG9yIGFyZSBib3RoIHplcm8sXG4gICAgICAgICAgLy8gYW5kIHRoZXJlIHRoaXMgc2VnbWVudCBpbnRlcnNlY3RzIHdpdGggdGhlIHNtYWxsIGNpcmNsZS5cbiAgICAgICAgICBpZiAoIShjICYgYzApICYmICh0ID0gaW50ZXJzZWN0KHBvaW50MSwgcG9pbnQwLCB0cnVlKSkpIHtcbiAgICAgICAgICAgIGNsZWFuID0gMDtcbiAgICAgICAgICAgIGlmIChzbWFsbFJhZGl1cykge1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzBdWzBdLCB0WzBdWzFdKTtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMV1bMF0sIHRbMV1bMV0pO1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMV1bMF0sIHRbMV1bMV0pO1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzBdWzBdLCB0WzBdWzFdLCAzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHYgJiYgKCFwb2ludDAgfHwgIXBvaW50RXF1YWwocG9pbnQwLCBwb2ludDEpKSkge1xuICAgICAgICAgIHN0cmVhbS5wb2ludChwb2ludDFbMF0sIHBvaW50MVsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgcG9pbnQwID0gcG9pbnQxLCB2MCA9IHYsIGMwID0gYztcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHYwKSBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBwb2ludDAgPSBudWxsO1xuICAgICAgfSxcbiAgICAgIC8vIFJlam9pbiBmaXJzdCBhbmQgbGFzdCBzZWdtZW50cyBpZiB0aGVyZSB3ZXJlIGludGVyc2VjdGlvbnMgYW5kIHRoZSBmaXJzdFxuICAgICAgLy8gYW5kIGxhc3QgcG9pbnRzIHdlcmUgdmlzaWJsZS5cbiAgICAgIGNsZWFuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNsZWFuIHwgKCh2MDAgJiYgdjApIDw8IDEpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBJbnRlcnNlY3RzIHRoZSBncmVhdCBjaXJjbGUgYmV0d2VlbiBhIGFuZCBiIHdpdGggdGhlIGNsaXAgY2lyY2xlLlxuICBmdW5jdGlvbiBpbnRlcnNlY3QoYSwgYiwgdHdvKSB7XG4gICAgdmFyIHBhID0gY2FydGVzaWFuKGEpLFxuICAgICAgICBwYiA9IGNhcnRlc2lhbihiKTtcblxuICAgIC8vIFdlIGhhdmUgdHdvIHBsYW5lcywgbjEucCA9IGQxIGFuZCBuMi5wID0gZDIuXG4gICAgLy8gRmluZCBpbnRlcnNlY3Rpb24gbGluZSBwKHQpID0gYzEgbjEgKyBjMiBuMiArIHQgKG4xIFx1MkEyRiBuMikuXG4gICAgdmFyIG4xID0gWzEsIDAsIDBdLCAvLyBub3JtYWxcbiAgICAgICAgbjIgPSBjYXJ0ZXNpYW5Dcm9zcyhwYSwgcGIpLFxuICAgICAgICBuMm4yID0gY2FydGVzaWFuRG90KG4yLCBuMiksXG4gICAgICAgIG4xbjIgPSBuMlswXSwgLy8gY2FydGVzaWFuRG90KG4xLCBuMiksXG4gICAgICAgIGRldGVybWluYW50ID0gbjJuMiAtIG4xbjIgKiBuMW4yO1xuXG4gICAgLy8gVHdvIHBvbGFyIHBvaW50cy5cbiAgICBpZiAoIWRldGVybWluYW50KSByZXR1cm4gIXR3byAmJiBhO1xuXG4gICAgdmFyIGMxID0gIGNyICogbjJuMiAvIGRldGVybWluYW50LFxuICAgICAgICBjMiA9IC1jciAqIG4xbjIgLyBkZXRlcm1pbmFudCxcbiAgICAgICAgbjF4bjIgPSBjYXJ0ZXNpYW5Dcm9zcyhuMSwgbjIpLFxuICAgICAgICBBID0gY2FydGVzaWFuU2NhbGUobjEsIGMxKSxcbiAgICAgICAgQiA9IGNhcnRlc2lhblNjYWxlKG4yLCBjMik7XG4gICAgY2FydGVzaWFuQWRkSW5QbGFjZShBLCBCKTtcblxuICAgIC8vIFNvbHZlIHxwKHQpfF4yID0gMS5cbiAgICB2YXIgdSA9IG4xeG4yLFxuICAgICAgICB3ID0gY2FydGVzaWFuRG90KEEsIHUpLFxuICAgICAgICB1dSA9IGNhcnRlc2lhbkRvdCh1LCB1KSxcbiAgICAgICAgdDIgPSB3ICogdyAtIHV1ICogKGNhcnRlc2lhbkRvdChBLCBBKSAtIDEpO1xuXG4gICAgaWYgKHQyIDwgMCkgcmV0dXJuO1xuXG4gICAgdmFyIHQgPSBzcXJ0KHQyKSxcbiAgICAgICAgcSA9IGNhcnRlc2lhblNjYWxlKHUsICgtdyAtIHQpIC8gdXUpO1xuICAgIGNhcnRlc2lhbkFkZEluUGxhY2UocSwgQSk7XG4gICAgcSA9IHNwaGVyaWNhbChxKTtcblxuICAgIGlmICghdHdvKSByZXR1cm4gcTtcblxuICAgIC8vIFR3byBpbnRlcnNlY3Rpb24gcG9pbnRzLlxuICAgIHZhciBsYW1iZGEwID0gYVswXSxcbiAgICAgICAgbGFtYmRhMSA9IGJbMF0sXG4gICAgICAgIHBoaTAgPSBhWzFdLFxuICAgICAgICBwaGkxID0gYlsxXSxcbiAgICAgICAgejtcblxuICAgIGlmIChsYW1iZGExIDwgbGFtYmRhMCkgeiA9IGxhbWJkYTAsIGxhbWJkYTAgPSBsYW1iZGExLCBsYW1iZGExID0gejtcblxuICAgIHZhciBkZWx0YSA9IGxhbWJkYTEgLSBsYW1iZGEwLFxuICAgICAgICBwb2xhciA9IGFicyhkZWx0YSAtIHBpKSA8IGVwc2lsb24sXG4gICAgICAgIG1lcmlkaWFuID0gcG9sYXIgfHwgZGVsdGEgPCBlcHNpbG9uO1xuXG4gICAgaWYgKCFwb2xhciAmJiBwaGkxIDwgcGhpMCkgeiA9IHBoaTAsIHBoaTAgPSBwaGkxLCBwaGkxID0gejtcblxuICAgIC8vIENoZWNrIHRoYXQgdGhlIGZpcnN0IHBvaW50IGlzIGJldHdlZW4gYSBhbmQgYi5cbiAgICBpZiAobWVyaWRpYW5cbiAgICAgICAgPyBwb2xhclxuICAgICAgICAgID8gcGhpMCArIHBoaTEgPiAwIF4gcVsxXSA8IChhYnMocVswXSAtIGxhbWJkYTApIDwgZXBzaWxvbiA/IHBoaTAgOiBwaGkxKVxuICAgICAgICAgIDogcGhpMCA8PSBxWzFdICYmIHFbMV0gPD0gcGhpMVxuICAgICAgICA6IGRlbHRhID4gcGkgXiAobGFtYmRhMCA8PSBxWzBdICYmIHFbMF0gPD0gbGFtYmRhMSkpIHtcbiAgICAgIHZhciBxMSA9IGNhcnRlc2lhblNjYWxlKHUsICgtdyArIHQpIC8gdXUpO1xuICAgICAgY2FydGVzaWFuQWRkSW5QbGFjZShxMSwgQSk7XG4gICAgICByZXR1cm4gW3EsIHNwaGVyaWNhbChxMSldO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdlbmVyYXRlcyBhIDQtYml0IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2F0aW9uIG9mIGEgcG9pbnQgcmVsYXRpdmUgdG9cbiAgLy8gdGhlIHNtYWxsIGNpcmNsZSdzIGJvdW5kaW5nIGJveC5cbiAgZnVuY3Rpb24gY29kZShsYW1iZGEsIHBoaSkge1xuICAgIHZhciByID0gc21hbGxSYWRpdXMgPyByYWRpdXMgOiBwaSAtIHJhZGl1cyxcbiAgICAgICAgY29kZSA9IDA7XG4gICAgaWYgKGxhbWJkYSA8IC1yKSBjb2RlIHw9IDE7IC8vIGxlZnRcbiAgICBlbHNlIGlmIChsYW1iZGEgPiByKSBjb2RlIHw9IDI7IC8vIHJpZ2h0XG4gICAgaWYgKHBoaSA8IC1yKSBjb2RlIHw9IDQ7IC8vIGJlbG93XG4gICAgZWxzZSBpZiAocGhpID4gcikgY29kZSB8PSA4OyAvLyBhYm92ZVxuICAgIHJldHVybiBjb2RlO1xuICB9XG5cbiAgcmV0dXJuIGNsaXAodmlzaWJsZSwgY2xpcExpbmUsIGludGVycG9sYXRlLCBzbWFsbFJhZGl1cyA/IFswLCAtcmFkaXVzXSA6IFstcGksIHJhZGl1cyAtIHBpXSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGJ4ID0gYlswXSxcbiAgICAgIGJ5ID0gYlsxXSxcbiAgICAgIHQwID0gMCxcbiAgICAgIHQxID0gMSxcbiAgICAgIGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIHI7XG5cbiAgciA9IHgwIC0gYXg7XG4gIGlmICghZHggJiYgciA+IDApIHJldHVybjtcbiAgciAvPSBkeDtcbiAgaWYgKGR4IDwgMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfVxuXG4gIHIgPSB4MSAtIGF4O1xuICBpZiAoIWR4ICYmIHIgPCAwKSByZXR1cm47XG4gIHIgLz0gZHg7XG4gIGlmIChkeCA8IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9IGVsc2UgaWYgKGR4ID4gMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH1cblxuICByID0geTAgLSBheTtcbiAgaWYgKCFkeSAmJiByID4gMCkgcmV0dXJuO1xuICByIC89IGR5O1xuICBpZiAoZHkgPCAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfSBlbHNlIGlmIChkeSA+IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9XG5cbiAgciA9IHkxIC0gYXk7XG4gIGlmICghZHkgJiYgciA8IDApIHJldHVybjtcbiAgciAvPSBkeTtcbiAgaWYgKGR5IDwgMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfVxuXG4gIGlmICh0MCA+IDApIGFbMF0gPSBheCArIHQwICogZHgsIGFbMV0gPSBheSArIHQwICogZHk7XG4gIGlmICh0MSA8IDEpIGJbMF0gPSBheCArIHQxICogZHgsIGJbMV0gPSBheSArIHQxICogZHk7XG4gIHJldHVybiB0cnVlO1xufVxuIiwgImltcG9ydCB7YWJzLCBlcHNpbG9ufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IGNsaXBCdWZmZXIgZnJvbSBcIi4vYnVmZmVyLmpzXCI7XG5pbXBvcnQgY2xpcExpbmUgZnJvbSBcIi4vbGluZS5qc1wiO1xuaW1wb3J0IGNsaXBSZWpvaW4gZnJvbSBcIi4vcmVqb2luLmpzXCI7XG5pbXBvcnQge21lcmdlfSBmcm9tIFwiZDMtYXJyYXlcIjtcblxudmFyIGNsaXBNYXggPSAxZTksIGNsaXBNaW4gPSAtY2xpcE1heDtcblxuLy8gVE9ETyBVc2UgZDMtcG9seWdvblx1MjAxOXMgcG9seWdvbkNvbnRhaW5zIGhlcmUgZm9yIHRoZSByaW5nIGNoZWNrP1xuLy8gVE9ETyBFbGltaW5hdGUgZHVwbGljYXRlIGJ1ZmZlcmluZyBpbiBjbGlwQnVmZmVyIGFuZCBwb2x5Z29uLnB1c2g/XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNsaXBSZWN0YW5nbGUoeDAsIHkwLCB4MSwgeTEpIHtcblxuICBmdW5jdGlvbiB2aXNpYmxlKHgsIHkpIHtcbiAgICByZXR1cm4geDAgPD0geCAmJiB4IDw9IHgxICYmIHkwIDw9IHkgJiYgeSA8PSB5MTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIHN0cmVhbSkge1xuICAgIHZhciBhID0gMCwgYTEgPSAwO1xuICAgIGlmIChmcm9tID09IG51bGxcbiAgICAgICAgfHwgKGEgPSBjb3JuZXIoZnJvbSwgZGlyZWN0aW9uKSkgIT09IChhMSA9IGNvcm5lcih0bywgZGlyZWN0aW9uKSlcbiAgICAgICAgfHwgY29tcGFyZVBvaW50KGZyb20sIHRvKSA8IDAgXiBkaXJlY3Rpb24gPiAwKSB7XG4gICAgICBkbyBzdHJlYW0ucG9pbnQoYSA9PT0gMCB8fCBhID09PSAzID8geDAgOiB4MSwgYSA+IDEgPyB5MSA6IHkwKTtcbiAgICAgIHdoaWxlICgoYSA9IChhICsgZGlyZWN0aW9uICsgNCkgJSA0KSAhPT0gYTEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0ucG9pbnQodG9bMF0sIHRvWzFdKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb3JuZXIocCwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIGFicyhwWzBdIC0geDApIDwgZXBzaWxvbiA/IGRpcmVjdGlvbiA+IDAgPyAwIDogM1xuICAgICAgICA6IGFicyhwWzBdIC0geDEpIDwgZXBzaWxvbiA/IGRpcmVjdGlvbiA+IDAgPyAyIDogMVxuICAgICAgICA6IGFicyhwWzFdIC0geTApIDwgZXBzaWxvbiA/IGRpcmVjdGlvbiA+IDAgPyAxIDogMFxuICAgICAgICA6IGRpcmVjdGlvbiA+IDAgPyAzIDogMjsgLy8gYWJzKHBbMV0gLSB5MSkgPCBlcHNpbG9uXG4gIH1cblxuICBmdW5jdGlvbiBjb21wYXJlSW50ZXJzZWN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gY29tcGFyZVBvaW50KGEueCwgYi54KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVQb2ludChhLCBiKSB7XG4gICAgdmFyIGNhID0gY29ybmVyKGEsIDEpLFxuICAgICAgICBjYiA9IGNvcm5lcihiLCAxKTtcbiAgICByZXR1cm4gY2EgIT09IGNiID8gY2EgLSBjYlxuICAgICAgICA6IGNhID09PSAwID8gYlsxXSAtIGFbMV1cbiAgICAgICAgOiBjYSA9PT0gMSA/IGFbMF0gLSBiWzBdXG4gICAgICAgIDogY2EgPT09IDIgPyBhWzFdIC0gYlsxXVxuICAgICAgICA6IGJbMF0gLSBhWzBdO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBhY3RpdmVTdHJlYW0gPSBzdHJlYW0sXG4gICAgICAgIGJ1ZmZlclN0cmVhbSA9IGNsaXBCdWZmZXIoKSxcbiAgICAgICAgc2VnbWVudHMsXG4gICAgICAgIHBvbHlnb24sXG4gICAgICAgIHJpbmcsXG4gICAgICAgIHhfXywgeV9fLCB2X18sIC8vIGZpcnN0IHBvaW50XG4gICAgICAgIHhfLCB5Xywgdl8sIC8vIHByZXZpb3VzIHBvaW50XG4gICAgICAgIGZpcnN0LFxuICAgICAgICBjbGVhbjtcblxuICAgIHZhciBjbGlwU3RyZWFtID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBwb2x5Z29uU3RhcnQsXG4gICAgICBwb2x5Z29uRW5kOiBwb2x5Z29uRW5kXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgIGlmICh2aXNpYmxlKHgsIHkpKSBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9seWdvbkluc2lkZSgpIHtcbiAgICAgIHZhciB3aW5kaW5nID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2x5Z29uLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBmb3IgKHZhciByaW5nID0gcG9seWdvbltpXSwgaiA9IDEsIG0gPSByaW5nLmxlbmd0aCwgcG9pbnQgPSByaW5nWzBdLCBhMCwgYTEsIGIwID0gcG9pbnRbMF0sIGIxID0gcG9pbnRbMV07IGogPCBtOyArK2opIHtcbiAgICAgICAgICBhMCA9IGIwLCBhMSA9IGIxLCBwb2ludCA9IHJpbmdbal0sIGIwID0gcG9pbnRbMF0sIGIxID0gcG9pbnRbMV07XG4gICAgICAgICAgaWYgKGExIDw9IHkxKSB7IGlmIChiMSA+IHkxICYmIChiMCAtIGEwKSAqICh5MSAtIGExKSA+IChiMSAtIGExKSAqICh4MCAtIGEwKSkgKyt3aW5kaW5nOyB9XG4gICAgICAgICAgZWxzZSB7IGlmIChiMSA8PSB5MSAmJiAoYjAgLSBhMCkgKiAoeTEgLSBhMSkgPCAoYjEgLSBhMSkgKiAoeDAgLSBhMCkpIC0td2luZGluZzsgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB3aW5kaW5nO1xuICAgIH1cblxuICAgIC8vIEJ1ZmZlciBnZW9tZXRyeSB3aXRoaW4gYSBwb2x5Z29uIGFuZCB0aGVuIGNsaXAgaXQgZW4gbWFzc2UuXG4gICAgZnVuY3Rpb24gcG9seWdvblN0YXJ0KCkge1xuICAgICAgYWN0aXZlU3RyZWFtID0gYnVmZmVyU3RyZWFtLCBzZWdtZW50cyA9IFtdLCBwb2x5Z29uID0gW10sIGNsZWFuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2x5Z29uRW5kKCkge1xuICAgICAgdmFyIHN0YXJ0SW5zaWRlID0gcG9seWdvbkluc2lkZSgpLFxuICAgICAgICAgIGNsZWFuSW5zaWRlID0gY2xlYW4gJiYgc3RhcnRJbnNpZGUsXG4gICAgICAgICAgdmlzaWJsZSA9IChzZWdtZW50cyA9IG1lcmdlKHNlZ21lbnRzKSkubGVuZ3RoO1xuICAgICAgaWYgKGNsZWFuSW5zaWRlIHx8IHZpc2libGUpIHtcbiAgICAgICAgc3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICAgICAgICBpZiAoY2xlYW5JbnNpZGUpIHtcbiAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc3RyZWFtKTtcbiAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgY2xpcFJlam9pbihzZWdtZW50cywgY29tcGFyZUludGVyc2VjdGlvbiwgc3RhcnRJbnNpZGUsIGludGVycG9sYXRlLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgICB9XG4gICAgICBhY3RpdmVTdHJlYW0gPSBzdHJlYW0sIHNlZ21lbnRzID0gcG9seWdvbiA9IHJpbmcgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIGNsaXBTdHJlYW0ucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgICBpZiAocG9seWdvbikgcG9seWdvbi5wdXNoKHJpbmcgPSBbXSk7XG4gICAgICBmaXJzdCA9IHRydWU7XG4gICAgICB2XyA9IGZhbHNlO1xuICAgICAgeF8gPSB5XyA9IE5hTjtcbiAgICB9XG5cbiAgICAvLyBUT0RPIHJhdGhlciB0aGFuIHNwZWNpYWwtY2FzZSBwb2x5Z29ucywgc2ltcGx5IGhhbmRsZSB0aGVtIHNlcGFyYXRlbHkuXG4gICAgLy8gSWRlYWxseSwgY29pbmNpZGVudCBpbnRlcnNlY3Rpb24gcG9pbnRzIHNob3VsZCBiZSBqaXR0ZXJlZCB0byBhdm9pZFxuICAgIC8vIGNsaXBwaW5nIGlzc3Vlcy5cbiAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgaWYgKHNlZ21lbnRzKSB7XG4gICAgICAgIGxpbmVQb2ludCh4X18sIHlfXyk7XG4gICAgICAgIGlmICh2X18gJiYgdl8pIGJ1ZmZlclN0cmVhbS5yZWpvaW4oKTtcbiAgICAgICAgc2VnbWVudHMucHVzaChidWZmZXJTdHJlYW0ucmVzdWx0KCkpO1xuICAgICAgfVxuICAgICAgY2xpcFN0cmVhbS5wb2ludCA9IHBvaW50O1xuICAgICAgaWYgKHZfKSBhY3RpdmVTdHJlYW0ubGluZUVuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVQb2ludCh4LCB5KSB7XG4gICAgICB2YXIgdiA9IHZpc2libGUoeCwgeSk7XG4gICAgICBpZiAocG9seWdvbikgcmluZy5wdXNoKFt4LCB5XSk7XG4gICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgeF9fID0geCwgeV9fID0geSwgdl9fID0gdjtcbiAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICBhY3RpdmVTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodiAmJiB2XykgYWN0aXZlU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgYSA9IFt4XyA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHhfKSksIHlfID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeV8pKV0sXG4gICAgICAgICAgICAgIGIgPSBbeCA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHgpKSwgeSA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHkpKV07XG4gICAgICAgICAgaWYgKGNsaXBMaW5lKGEsIGIsIHgwLCB5MCwgeDEsIHkxKSkge1xuICAgICAgICAgICAgaWYgKCF2Xykge1xuICAgICAgICAgICAgICBhY3RpdmVTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludChhWzBdLCBhWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludChiWzBdLCBiWzFdKTtcbiAgICAgICAgICAgIGlmICghdikgYWN0aXZlU3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIGlmICh2KSB7XG4gICAgICAgICAgICBhY3RpdmVTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgICAgICBjbGVhbiA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgeF8gPSB4LCB5XyA9IHksIHZfID0gdjtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xpcFN0cmVhbTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YWJzLCBhdGFuMiwgY29zLCByYWRpYW5zLCBzaW4sIHNxcnR9IGZyb20gXCIuL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuL25vb3AuanNcIjtcbmltcG9ydCBzdHJlYW0gZnJvbSBcIi4vc3RyZWFtLmpzXCI7XG5cbnZhciBsZW5ndGhTdW0sXG4gICAgbGFtYmRhMCxcbiAgICBzaW5QaGkwLFxuICAgIGNvc1BoaTA7XG5cbnZhciBsZW5ndGhTdHJlYW0gPSB7XG4gIHNwaGVyZTogbm9vcCxcbiAgcG9pbnQ6IG5vb3AsXG4gIGxpbmVTdGFydDogbGVuZ3RoTGluZVN0YXJ0LFxuICBsaW5lRW5kOiBub29wLFxuICBwb2x5Z29uU3RhcnQ6IG5vb3AsXG4gIHBvbHlnb25FbmQ6IG5vb3Bcbn07XG5cbmZ1bmN0aW9uIGxlbmd0aExpbmVTdGFydCgpIHtcbiAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoUG9pbnRGaXJzdDtcbiAgbGVuZ3RoU3RyZWFtLmxpbmVFbmQgPSBsZW5ndGhMaW5lRW5kO1xufVxuXG5mdW5jdGlvbiBsZW5ndGhMaW5lRW5kKCkge1xuICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhTdHJlYW0ubGluZUVuZCA9IG5vb3A7XG59XG5cbmZ1bmN0aW9uIGxlbmd0aFBvaW50Rmlyc3QobGFtYmRhLCBwaGkpIHtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICBsYW1iZGEwID0gbGFtYmRhLCBzaW5QaGkwID0gc2luKHBoaSksIGNvc1BoaTAgPSBjb3MocGhpKTtcbiAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoUG9pbnQ7XG59XG5cbmZ1bmN0aW9uIGxlbmd0aFBvaW50KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgdmFyIHNpblBoaSA9IHNpbihwaGkpLFxuICAgICAgY29zUGhpID0gY29zKHBoaSksXG4gICAgICBkZWx0YSA9IGFicyhsYW1iZGEgLSBsYW1iZGEwKSxcbiAgICAgIGNvc0RlbHRhID0gY29zKGRlbHRhKSxcbiAgICAgIHNpbkRlbHRhID0gc2luKGRlbHRhKSxcbiAgICAgIHggPSBjb3NQaGkgKiBzaW5EZWx0YSxcbiAgICAgIHkgPSBjb3NQaGkwICogc2luUGhpIC0gc2luUGhpMCAqIGNvc1BoaSAqIGNvc0RlbHRhLFxuICAgICAgeiA9IHNpblBoaTAgKiBzaW5QaGkgKyBjb3NQaGkwICogY29zUGhpICogY29zRGVsdGE7XG4gIGxlbmd0aFN1bS5hZGQoYXRhbjIoc3FydCh4ICogeCArIHkgKiB5KSwgeikpO1xuICBsYW1iZGEwID0gbGFtYmRhLCBzaW5QaGkwID0gc2luUGhpLCBjb3NQaGkwID0gY29zUGhpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmplY3QpIHtcbiAgbGVuZ3RoU3VtID0gbmV3IEFkZGVyKCk7XG4gIHN0cmVhbShvYmplY3QsIGxlbmd0aFN0cmVhbSk7XG4gIHJldHVybiArbGVuZ3RoU3VtO1xufVxuIiwgImltcG9ydCBsZW5ndGggZnJvbSBcIi4vbGVuZ3RoLmpzXCI7XG5cbnZhciBjb29yZGluYXRlcyA9IFtudWxsLCBudWxsXSxcbiAgICBvYmplY3QgPSB7dHlwZTogXCJMaW5lU3RyaW5nXCIsIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc307XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgY29vcmRpbmF0ZXNbMF0gPSBhO1xuICBjb29yZGluYXRlc1sxXSA9IGI7XG4gIHJldHVybiBsZW5ndGgob2JqZWN0KTtcbn1cbiIsICJpbXBvcnQge3JhbmdlfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YWJzLCBjZWlsLCBlcHNpbG9ufSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIGdyYXRpY3VsZVgoeTAsIHkxLCBkeSkge1xuICB2YXIgeSA9IHJhbmdlKHkwLCB5MSAtIGVwc2lsb24sIGR5KS5jb25jYXQoeTEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4geS5tYXAoZnVuY3Rpb24oeSkgeyByZXR1cm4gW3gsIHldOyB9KTsgfTtcbn1cblxuZnVuY3Rpb24gZ3JhdGljdWxlWSh4MCwgeDEsIGR4KSB7XG4gIHZhciB4ID0gcmFuZ2UoeDAsIHgxIC0gZXBzaWxvbiwgZHgpLmNvbmNhdCh4MSk7XG4gIHJldHVybiBmdW5jdGlvbih5KSB7IHJldHVybiB4Lm1hcChmdW5jdGlvbih4KSB7IHJldHVybiBbeCwgeV07IH0pOyB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBncmF0aWN1bGUoKSB7XG4gIHZhciB4MSwgeDAsIFgxLCBYMCxcbiAgICAgIHkxLCB5MCwgWTEsIFkwLFxuICAgICAgZHggPSAxMCwgZHkgPSBkeCwgRFggPSA5MCwgRFkgPSAzNjAsXG4gICAgICB4LCB5LCBYLCBZLFxuICAgICAgcHJlY2lzaW9uID0gMi41O1xuXG4gIGZ1bmN0aW9uIGdyYXRpY3VsZSgpIHtcbiAgICByZXR1cm4ge3R5cGU6IFwiTXVsdGlMaW5lU3RyaW5nXCIsIGNvb3JkaW5hdGVzOiBsaW5lcygpfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmVzKCkge1xuICAgIHJldHVybiByYW5nZShjZWlsKFgwIC8gRFgpICogRFgsIFgxLCBEWCkubWFwKFgpXG4gICAgICAgIC5jb25jYXQocmFuZ2UoY2VpbChZMCAvIERZKSAqIERZLCBZMSwgRFkpLm1hcChZKSlcbiAgICAgICAgLmNvbmNhdChyYW5nZShjZWlsKHgwIC8gZHgpICogZHgsIHgxLCBkeCkuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIGFicyh4ICUgRFgpID4gZXBzaWxvbjsgfSkubWFwKHgpKVxuICAgICAgICAuY29uY2F0KHJhbmdlKGNlaWwoeTAgLyBkeSkgKiBkeSwgeTEsIGR5KS5maWx0ZXIoZnVuY3Rpb24oeSkgeyByZXR1cm4gYWJzKHkgJSBEWSkgPiBlcHNpbG9uOyB9KS5tYXAoeSkpO1xuICB9XG5cbiAgZ3JhdGljdWxlLmxpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGxpbmVzKCkubWFwKGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7IHJldHVybiB7dHlwZTogXCJMaW5lU3RyaW5nXCIsIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc307IH0pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5vdXRsaW5lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiUG9seWdvblwiLFxuICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgWChYMCkuY29uY2F0KFxuICAgICAgICBZKFkxKS5zbGljZSgxKSxcbiAgICAgICAgWChYMSkucmV2ZXJzZSgpLnNsaWNlKDEpLFxuICAgICAgICBZKFkwKS5yZXZlcnNlKCkuc2xpY2UoMSkpXG4gICAgICBdXG4gICAgfTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGdyYXRpY3VsZS5leHRlbnRNaW5vcigpO1xuICAgIHJldHVybiBncmF0aWN1bGUuZXh0ZW50TWFqb3IoXykuZXh0ZW50TWlub3IoXyk7XG4gIH07XG5cbiAgZ3JhdGljdWxlLmV4dGVudE1ham9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtbWDAsIFkwXSwgW1gxLCBZMV1dO1xuICAgIFgwID0gK19bMF1bMF0sIFgxID0gK19bMV1bMF07XG4gICAgWTAgPSArX1swXVsxXSwgWTEgPSArX1sxXVsxXTtcbiAgICBpZiAoWDAgPiBYMSkgXyA9IFgwLCBYMCA9IFgxLCBYMSA9IF87XG4gICAgaWYgKFkwID4gWTEpIF8gPSBZMCwgWTAgPSBZMSwgWTEgPSBfO1xuICAgIHJldHVybiBncmF0aWN1bGUucHJlY2lzaW9uKHByZWNpc2lvbik7XG4gIH07XG5cbiAgZ3JhdGljdWxlLmV4dGVudE1pbm9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtbeDAsIHkwXSwgW3gxLCB5MV1dO1xuICAgIHgwID0gK19bMF1bMF0sIHgxID0gK19bMV1bMF07XG4gICAgeTAgPSArX1swXVsxXSwgeTEgPSArX1sxXVsxXTtcbiAgICBpZiAoeDAgPiB4MSkgXyA9IHgwLCB4MCA9IHgxLCB4MSA9IF87XG4gICAgaWYgKHkwID4geTEpIF8gPSB5MCwgeTAgPSB5MSwgeTEgPSBfO1xuICAgIHJldHVybiBncmF0aWN1bGUucHJlY2lzaW9uKHByZWNpc2lvbik7XG4gIH07XG5cbiAgZ3JhdGljdWxlLnN0ZXAgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLnN0ZXBNaW5vcigpO1xuICAgIHJldHVybiBncmF0aWN1bGUuc3RlcE1ham9yKF8pLnN0ZXBNaW5vcihfKTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcE1ham9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtEWCwgRFldO1xuICAgIERYID0gK19bMF0sIERZID0gK19bMV07XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcE1pbm9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtkeCwgZHldO1xuICAgIGR4ID0gK19bMF0sIGR5ID0gK19bMV07XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICBncmF0aWN1bGUucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHByZWNpc2lvbjtcbiAgICBwcmVjaXNpb24gPSArXztcbiAgICB4ID0gZ3JhdGljdWxlWCh5MCwgeTEsIDkwKTtcbiAgICB5ID0gZ3JhdGljdWxlWSh4MCwgeDEsIHByZWNpc2lvbik7XG4gICAgWCA9IGdyYXRpY3VsZVgoWTAsIFkxLCA5MCk7XG4gICAgWSA9IGdyYXRpY3VsZVkoWDAsIFgxLCBwcmVjaXNpb24pO1xuICAgIHJldHVybiBncmF0aWN1bGU7XG4gIH07XG5cbiAgcmV0dXJuIGdyYXRpY3VsZVxuICAgICAgLmV4dGVudE1ham9yKFtbLTE4MCwgLTkwICsgZXBzaWxvbl0sIFsxODAsIDkwIC0gZXBzaWxvbl1dKVxuICAgICAgLmV4dGVudE1pbm9yKFtbLTE4MCwgLTgwIC0gZXBzaWxvbl0sIFsxODAsIDgwICsgZXBzaWxvbl1dKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdyYXRpY3VsZTEwKCkge1xuICByZXR1cm4gZ3JhdGljdWxlKCkoKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCB4ID0+IHg7XG4iLCAiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2Fic30gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciBhcmVhU3VtID0gbmV3IEFkZGVyKCksXG4gICAgYXJlYVJpbmdTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICB4MDAsXG4gICAgeTAwLFxuICAgIHgwLFxuICAgIHkwO1xuXG52YXIgYXJlYVN0cmVhbSA9IHtcbiAgcG9pbnQ6IG5vb3AsXG4gIGxpbmVTdGFydDogbm9vcCxcbiAgbGluZUVuZDogbm9vcCxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3RyZWFtLmxpbmVTdGFydCA9IGFyZWFSaW5nU3RhcnQ7XG4gICAgYXJlYVN0cmVhbS5saW5lRW5kID0gYXJlYVJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFTdHJlYW0ubGluZVN0YXJ0ID0gYXJlYVN0cmVhbS5saW5lRW5kID0gYXJlYVN0cmVhbS5wb2ludCA9IG5vb3A7XG4gICAgYXJlYVN1bS5hZGQoYWJzKGFyZWFSaW5nU3VtKSk7XG4gICAgYXJlYVJpbmdTdW0gPSBuZXcgQWRkZXIoKTtcbiAgfSxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJlYSA9IGFyZWFTdW0gLyAyO1xuICAgIGFyZWFTdW0gPSBuZXcgQWRkZXIoKTtcbiAgICByZXR1cm4gYXJlYTtcbiAgfVxufTtcblxuZnVuY3Rpb24gYXJlYVJpbmdTdGFydCgpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludEZpcnN0O1xufVxuXG5mdW5jdGlvbiBhcmVhUG9pbnRGaXJzdCh4LCB5KSB7XG4gIGFyZWFTdHJlYW0ucG9pbnQgPSBhcmVhUG9pbnQ7XG4gIHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5O1xufVxuXG5mdW5jdGlvbiBhcmVhUG9pbnQoeCwgeSkge1xuICBhcmVhUmluZ1N1bS5hZGQoeTAgKiB4IC0geDAgKiB5KTtcbiAgeDAgPSB4LCB5MCA9IHk7XG59XG5cbmZ1bmN0aW9uIGFyZWFSaW5nRW5kKCkge1xuICBhcmVhUG9pbnQoeDAwLCB5MDApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcmVhU3RyZWFtO1xuIiwgImltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciB4MCA9IEluZmluaXR5LFxuICAgIHkwID0geDAsXG4gICAgeDEgPSAteDAsXG4gICAgeTEgPSB4MTtcblxudmFyIGJvdW5kc1N0cmVhbSA9IHtcbiAgcG9pbnQ6IGJvdW5kc1BvaW50LFxuICBsaW5lU3RhcnQ6IG5vb3AsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogbm9vcCxcbiAgcG9seWdvbkVuZDogbm9vcCxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYm91bmRzID0gW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gICAgeDEgPSB5MSA9IC0oeTAgPSB4MCA9IEluZmluaXR5KTtcbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG59O1xuXG5mdW5jdGlvbiBib3VuZHNQb2ludCh4LCB5KSB7XG4gIGlmICh4IDwgeDApIHgwID0geDtcbiAgaWYgKHggPiB4MSkgeDEgPSB4O1xuICBpZiAoeSA8IHkwKSB5MCA9IHk7XG4gIGlmICh5ID4geTEpIHkxID0geTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYm91bmRzU3RyZWFtO1xuIiwgImltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuLy8gVE9ETyBFbmZvcmNlIHBvc2l0aXZlIGFyZWEgZm9yIGV4dGVyaW9yLCBuZWdhdGl2ZSBhcmVhIGZvciBpbnRlcmlvcj9cblxudmFyIFgwID0gMCxcbiAgICBZMCA9IDAsXG4gICAgWjAgPSAwLFxuICAgIFgxID0gMCxcbiAgICBZMSA9IDAsXG4gICAgWjEgPSAwLFxuICAgIFgyID0gMCxcbiAgICBZMiA9IDAsXG4gICAgWjIgPSAwLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBjZW50cm9pZFN0cmVhbSA9IHtcbiAgcG9pbnQ6IGNlbnRyb2lkUG9pbnQsXG4gIGxpbmVTdGFydDogY2VudHJvaWRMaW5lU3RhcnQsXG4gIGxpbmVFbmQ6IGNlbnRyb2lkTGluZUVuZCxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lU3RhcnQgPSBjZW50cm9pZFJpbmdTdGFydDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lRW5kID0gY2VudHJvaWRSaW5nRW5kO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnQ7XG4gICAgY2VudHJvaWRTdHJlYW0ubGluZVN0YXJ0ID0gY2VudHJvaWRMaW5lU3RhcnQ7XG4gICAgY2VudHJvaWRTdHJlYW0ubGluZUVuZCA9IGNlbnRyb2lkTGluZUVuZDtcbiAgfSxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2VudHJvaWQgPSBaMiA/IFtYMiAvIFoyLCBZMiAvIFoyXVxuICAgICAgICA6IFoxID8gW1gxIC8gWjEsIFkxIC8gWjFdXG4gICAgICAgIDogWjAgPyBbWDAgLyBaMCwgWTAgLyBaMF1cbiAgICAgICAgOiBbTmFOLCBOYU5dO1xuICAgIFgwID0gWTAgPSBaMCA9XG4gICAgWDEgPSBZMSA9IFoxID1cbiAgICBYMiA9IFkyID0gWjIgPSAwO1xuICAgIHJldHVybiBjZW50cm9pZDtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludCh4LCB5KSB7XG4gIFgwICs9IHg7XG4gIFkwICs9IHk7XG4gICsrWjA7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkTGluZVN0YXJ0KCkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRGaXJzdExpbmU7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRGaXJzdExpbmUoeCwgeSkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRMaW5lO1xuICBjZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludExpbmUoeCwgeSkge1xuICB2YXIgZHggPSB4IC0geDAsIGR5ID0geSAtIHkwLCB6ID0gc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gIFgxICs9IHogKiAoeDAgKyB4KSAvIDI7XG4gIFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gIFoxICs9IHo7XG4gIGNlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZExpbmVFbmQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludDtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRSaW5nU3RhcnQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludEZpcnN0UmluZztcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRSaW5nRW5kKCkge1xuICBjZW50cm9pZFBvaW50UmluZyh4MDAsIHkwMCk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRGaXJzdFJpbmcoeCwgeSkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRSaW5nO1xuICBjZW50cm9pZFBvaW50KHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5KTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludFJpbmcoeCwgeSkge1xuICB2YXIgZHggPSB4IC0geDAsXG4gICAgICBkeSA9IHkgLSB5MCxcbiAgICAgIHogPSBzcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblxuICBYMSArPSB6ICogKHgwICsgeCkgLyAyO1xuICBZMSArPSB6ICogKHkwICsgeSkgLyAyO1xuICBaMSArPSB6O1xuXG4gIHogPSB5MCAqIHggLSB4MCAqIHk7XG4gIFgyICs9IHogKiAoeDAgKyB4KTtcbiAgWTIgKz0geiAqICh5MCArIHkpO1xuICBaMiArPSB6ICogMztcbiAgY2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNlbnRyb2lkU3RyZWFtO1xuIiwgImltcG9ydCB7dGF1fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGF0aENvbnRleHQoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuUGF0aENvbnRleHQucHJvdG90eXBlID0ge1xuICBfcmFkaXVzOiA0LjUsXG4gIHBvaW50UmFkaXVzOiBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhZGl1cyA9IF8sIHRoaXM7XG4gIH0sXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbGluZSA9PT0gMCkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9wb2ludCA9IE5hTjtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8oeCwgeSk7XG4gICAgICAgIHRoaXMuX3BvaW50ID0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4ICsgdGhpcy5fcmFkaXVzLCB5KTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5hcmMoeCwgeSwgdGhpcy5fcmFkaXVzLCAwLCB0YXUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3VsdDogbm9vcFxufTtcbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBsZW5ndGhSaW5nLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBsZW5ndGhTdHJlYW0gPSB7XG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50Rmlyc3Q7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChsZW5ndGhSaW5nKSBsZW5ndGhQb2ludCh4MDAsIHkwMCk7XG4gICAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbm9vcDtcbiAgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBsZW5ndGhSaW5nID0gdHJ1ZTtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgbGVuZ3RoUmluZyA9IG51bGw7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9ICtsZW5ndGhTdW07XG4gICAgbGVuZ3RoU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfVxufTtcblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnRGaXJzdCh4LCB5KSB7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50O1xuICB4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geTtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnQoeCwgeSkge1xuICB4MCAtPSB4LCB5MCAtPSB5O1xuICBsZW5ndGhTdW0uYWRkKHNxcnQoeDAgKiB4MCArIHkwICogeTApKTtcbiAgeDAgPSB4LCB5MCA9IHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxlbmd0aFN0cmVhbTtcbiIsICIvLyBTaW1wbGUgY2FjaGluZyBmb3IgY29uc3RhbnQtcmFkaXVzIHBvaW50cy5cbmxldCBjYWNoZURpZ2l0cywgY2FjaGVBcHBlbmQsIGNhY2hlUmFkaXVzLCBjYWNoZUNpcmNsZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aFN0cmluZyB7XG4gIGNvbnN0cnVjdG9yKGRpZ2l0cykge1xuICAgIHRoaXMuX2FwcGVuZCA9IGRpZ2l0cyA9PSBudWxsID8gYXBwZW5kIDogYXBwZW5kUm91bmQoZGlnaXRzKTtcbiAgICB0aGlzLl9yYWRpdXMgPSA0LjU7XG4gICAgdGhpcy5fID0gXCJcIjtcbiAgfVxuICBwb2ludFJhZGl1cyhfKSB7XG4gICAgdGhpcy5fcmFkaXVzID0gK187XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcG9seWdvblN0YXJ0KCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9XG4gIHBvbHlnb25FbmQoKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfVxuICBsaW5lU3RhcnQoKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9XG4gIGxpbmVFbmQoKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgPT09IDApIHRoaXMuXyArPSBcIlpcIjtcbiAgICB0aGlzLl9wb2ludCA9IE5hTjtcbiAgfVxuICBwb2ludCh4LCB5KSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBNJHt4fSwke3l9YDtcbiAgICAgICAgdGhpcy5fcG9pbnQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9hcHBlbmRgTCR7eH0sJHt5fWA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aGlzLl9hcHBlbmRgTSR7eH0sJHt5fWA7XG4gICAgICAgIGlmICh0aGlzLl9yYWRpdXMgIT09IGNhY2hlUmFkaXVzIHx8IHRoaXMuX2FwcGVuZCAhPT0gY2FjaGVBcHBlbmQpIHtcbiAgICAgICAgICBjb25zdCByID0gdGhpcy5fcmFkaXVzO1xuICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLl87XG4gICAgICAgICAgdGhpcy5fID0gXCJcIjsgLy8gc3Rhc2ggdGhlIG9sZCBzdHJpbmcgc28gd2UgY2FuIGNhY2hlIHRoZSBjaXJjbGUgcGF0aCBmcmFnbWVudFxuICAgICAgICAgIHRoaXMuX2FwcGVuZGBtMCwke3J9YSR7cn0sJHtyfSAwIDEsMSAwLCR7LTIgKiByfWEke3J9LCR7cn0gMCAxLDEgMCwkezIgKiByfXpgO1xuICAgICAgICAgIGNhY2hlUmFkaXVzID0gcjtcbiAgICAgICAgICBjYWNoZUFwcGVuZCA9IHRoaXMuX2FwcGVuZDtcbiAgICAgICAgICBjYWNoZUNpcmNsZSA9IHRoaXMuXztcbiAgICAgICAgICB0aGlzLl8gPSBzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyArPSBjYWNoZUNpcmNsZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJlc3VsdCgpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl87XG4gICAgdGhpcy5fID0gXCJcIjtcbiAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwZW5kKHN0cmluZ3MpIHtcbiAgbGV0IGkgPSAxO1xuICB0aGlzLl8gKz0gc3RyaW5nc1swXTtcbiAgZm9yIChjb25zdCBqID0gc3RyaW5ncy5sZW5ndGg7IGkgPCBqOyArK2kpIHtcbiAgICB0aGlzLl8gKz0gYXJndW1lbnRzW2ldICsgc3RyaW5nc1tpXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmRSb3VuZChkaWdpdHMpIHtcbiAgY29uc3QgZCA9IE1hdGguZmxvb3IoZGlnaXRzKTtcbiAgaWYgKCEoZCA+PSAwKSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGludmFsaWQgZGlnaXRzOiAke2RpZ2l0c31gKTtcbiAgaWYgKGQgPiAxNSkgcmV0dXJuIGFwcGVuZDtcbiAgaWYgKGQgIT09IGNhY2hlRGlnaXRzKSB7XG4gICAgY29uc3QgayA9IDEwICoqIGQ7XG4gICAgY2FjaGVEaWdpdHMgPSBkO1xuICAgIGNhY2hlQXBwZW5kID0gZnVuY3Rpb24gYXBwZW5kKHN0cmluZ3MpIHtcbiAgICAgIGxldCBpID0gMTtcbiAgICAgIHRoaXMuXyArPSBzdHJpbmdzWzBdO1xuICAgICAgZm9yIChjb25zdCBqID0gc3RyaW5ncy5sZW5ndGg7IGkgPCBqOyArK2kpIHtcbiAgICAgICAgdGhpcy5fICs9IE1hdGgucm91bmQoYXJndW1lbnRzW2ldICogaykgLyBrICsgc3RyaW5nc1tpXTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBjYWNoZUFwcGVuZDtcbn1cbiIsICJpbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4uL2lkZW50aXR5LmpzXCI7XG5pbXBvcnQgc3RyZWFtIGZyb20gXCIuLi9zdHJlYW0uanNcIjtcbmltcG9ydCBwYXRoQXJlYSBmcm9tIFwiLi9hcmVhLmpzXCI7XG5pbXBvcnQgcGF0aEJvdW5kcyBmcm9tIFwiLi9ib3VuZHMuanNcIjtcbmltcG9ydCBwYXRoQ2VudHJvaWQgZnJvbSBcIi4vY2VudHJvaWQuanNcIjtcbmltcG9ydCBQYXRoQ29udGV4dCBmcm9tIFwiLi9jb250ZXh0LmpzXCI7XG5pbXBvcnQgcGF0aE1lYXN1cmUgZnJvbSBcIi4vbWVhc3VyZS5qc1wiO1xuaW1wb3J0IFBhdGhTdHJpbmcgZnJvbSBcIi4vc3RyaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHByb2plY3Rpb24sIGNvbnRleHQpIHtcbiAgbGV0IGRpZ2l0cyA9IDMsXG4gICAgICBwb2ludFJhZGl1cyA9IDQuNSxcbiAgICAgIHByb2plY3Rpb25TdHJlYW0sXG4gICAgICBjb250ZXh0U3RyZWFtO1xuXG4gIGZ1bmN0aW9uIHBhdGgob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiBwb2ludFJhZGl1cyA9PT0gXCJmdW5jdGlvblwiKSBjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKCtwb2ludFJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0oY29udGV4dFN0cmVhbSkpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dFN0cmVhbS5yZXN1bHQoKTtcbiAgfVxuXG4gIHBhdGguYXJlYSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aEFyZWEpKTtcbiAgICByZXR1cm4gcGF0aEFyZWEucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5tZWFzdXJlID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoTWVhc3VyZSkpO1xuICAgIHJldHVybiBwYXRoTWVhc3VyZS5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLmJvdW5kcyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aEJvdW5kcykpO1xuICAgIHJldHVybiBwYXRoQm91bmRzLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGguY2VudHJvaWQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhDZW50cm9pZCkpO1xuICAgIHJldHVybiBwYXRoQ2VudHJvaWQucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5wcm9qZWN0aW9uID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHByb2plY3Rpb247XG4gICAgcHJvamVjdGlvblN0cmVhbSA9IF8gPT0gbnVsbCA/IChwcm9qZWN0aW9uID0gbnVsbCwgaWRlbnRpdHkpIDogKHByb2plY3Rpb24gPSBfKS5zdHJlYW07XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcGF0aC5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbnRleHQ7XG4gICAgY29udGV4dFN0cmVhbSA9IF8gPT0gbnVsbCA/IChjb250ZXh0ID0gbnVsbCwgbmV3IFBhdGhTdHJpbmcoZGlnaXRzKSkgOiBuZXcgUGF0aENvbnRleHQoY29udGV4dCA9IF8pO1xuICAgIGlmICh0eXBlb2YgcG9pbnRSYWRpdXMgIT09IFwiZnVuY3Rpb25cIikgY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cyhwb2ludFJhZGl1cyk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcGF0aC5wb2ludFJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwb2ludFJhZGl1cztcbiAgICBwb2ludFJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogKGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMoK18pLCArXyk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcGF0aC5kaWdpdHMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZGlnaXRzO1xuICAgIGlmIChfID09IG51bGwpIGRpZ2l0cyA9IG51bGw7XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBkID0gTWF0aC5mbG9vcihfKTtcbiAgICAgIGlmICghKGQgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbnZhbGlkIGRpZ2l0czogJHtffWApO1xuICAgICAgZGlnaXRzID0gZDtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQgPT09IG51bGwpIGNvbnRleHRTdHJlYW0gPSBuZXcgUGF0aFN0cmluZyhkaWdpdHMpO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHJldHVybiBwYXRoLnByb2plY3Rpb24ocHJvamVjdGlvbikuZGlnaXRzKGRpZ2l0cykuY29udGV4dChjb250ZXh0KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtZXRob2RzKSB7XG4gIHJldHVybiB7XG4gICAgc3RyZWFtOiB0cmFuc2Zvcm1lcihtZXRob2RzKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtZXIobWV0aG9kcykge1xuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIHMgPSBuZXcgVHJhbnNmb3JtU3RyZWFtO1xuICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSBzW2tleV0gPSBtZXRob2RzW2tleV07XG4gICAgcy5zdHJlYW0gPSBzdHJlYW07XG4gICAgcmV0dXJuIHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybVN0cmVhbSgpIHt9XG5cblRyYW5zZm9ybVN0cmVhbS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm1TdHJlYW0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7IHRoaXMuc3RyZWFtLnBvaW50KHgsIHkpOyB9LFxuICBzcGhlcmU6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5zcGhlcmUoKTsgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ubGluZVN0YXJ0KCk7IH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5saW5lRW5kKCk7IH0sXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLnBvbHlnb25TdGFydCgpOyB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ucG9seWdvbkVuZCgpOyB9XG59O1xuIiwgImltcG9ydCB7ZGVmYXVsdCBhcyBnZW9TdHJlYW19IGZyb20gXCIuLi9zdHJlYW0uanNcIjtcbmltcG9ydCBib3VuZHNTdHJlYW0gZnJvbSBcIi4uL3BhdGgvYm91bmRzLmpzXCI7XG5cbmZ1bmN0aW9uIGZpdChwcm9qZWN0aW9uLCBmaXRCb3VuZHMsIG9iamVjdCkge1xuICB2YXIgY2xpcCA9IHByb2plY3Rpb24uY2xpcEV4dGVudCAmJiBwcm9qZWN0aW9uLmNsaXBFeHRlbnQoKTtcbiAgcHJvamVjdGlvbi5zY2FsZSgxNTApLnRyYW5zbGF0ZShbMCwgMF0pO1xuICBpZiAoY2xpcCAhPSBudWxsKSBwcm9qZWN0aW9uLmNsaXBFeHRlbnQobnVsbCk7XG4gIGdlb1N0cmVhbShvYmplY3QsIHByb2plY3Rpb24uc3RyZWFtKGJvdW5kc1N0cmVhbSkpO1xuICBmaXRCb3VuZHMoYm91bmRzU3RyZWFtLnJlc3VsdCgpKTtcbiAgaWYgKGNsaXAgIT0gbnVsbCkgcHJvamVjdGlvbi5jbGlwRXh0ZW50KGNsaXApO1xuICByZXR1cm4gcHJvamVjdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdEV4dGVudChwcm9qZWN0aW9uLCBleHRlbnQsIG9iamVjdCkge1xuICByZXR1cm4gZml0KHByb2plY3Rpb24sIGZ1bmN0aW9uKGIpIHtcbiAgICB2YXIgdyA9IGV4dGVudFsxXVswXSAtIGV4dGVudFswXVswXSxcbiAgICAgICAgaCA9IGV4dGVudFsxXVsxXSAtIGV4dGVudFswXVsxXSxcbiAgICAgICAgayA9IE1hdGgubWluKHcgLyAoYlsxXVswXSAtIGJbMF1bMF0pLCBoIC8gKGJbMV1bMV0gLSBiWzBdWzFdKSksXG4gICAgICAgIHggPSArZXh0ZW50WzBdWzBdICsgKHcgLSBrICogKGJbMV1bMF0gKyBiWzBdWzBdKSkgLyAyLFxuICAgICAgICB5ID0gK2V4dGVudFswXVsxXSArIChoIC0gayAqIChiWzFdWzFdICsgYlswXVsxXSkpIC8gMjtcbiAgICBwcm9qZWN0aW9uLnNjYWxlKDE1MCAqIGspLnRyYW5zbGF0ZShbeCwgeV0pO1xuICB9LCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0U2l6ZShwcm9qZWN0aW9uLCBzaXplLCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdEV4dGVudChwcm9qZWN0aW9uLCBbWzAsIDBdLCBzaXplXSwgb2JqZWN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdFdpZHRoKHByb2plY3Rpb24sIHdpZHRoLCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdChwcm9qZWN0aW9uLCBmdW5jdGlvbihiKSB7XG4gICAgdmFyIHcgPSArd2lkdGgsXG4gICAgICAgIGsgPSB3IC8gKGJbMV1bMF0gLSBiWzBdWzBdKSxcbiAgICAgICAgeCA9ICh3IC0gayAqIChiWzFdWzBdICsgYlswXVswXSkpIC8gMixcbiAgICAgICAgeSA9IC1rICogYlswXVsxXTtcbiAgICBwcm9qZWN0aW9uLnNjYWxlKDE1MCAqIGspLnRyYW5zbGF0ZShbeCwgeV0pO1xuICB9LCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0SGVpZ2h0KHByb2plY3Rpb24sIGhlaWdodCwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXQocHJvamVjdGlvbiwgZnVuY3Rpb24oYikge1xuICAgIHZhciBoID0gK2hlaWdodCxcbiAgICAgICAgayA9IGggLyAoYlsxXVsxXSAtIGJbMF1bMV0pLFxuICAgICAgICB4ID0gLWsgKiBiWzBdWzBdLFxuICAgICAgICB5ID0gKGggLSBrICogKGJbMV1bMV0gKyBiWzBdWzFdKSkgLyAyO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG4iLCAiaW1wb3J0IHtjYXJ0ZXNpYW59IGZyb20gXCIuLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBlcHNpbG9uLCByYWRpYW5zLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHt0cmFuc2Zvcm1lcn0gZnJvbSBcIi4uL3RyYW5zZm9ybS5qc1wiO1xuXG52YXIgbWF4RGVwdGggPSAxNiwgLy8gbWF4aW11bSBkZXB0aCBvZiBzdWJkaXZpc2lvblxuICAgIGNvc01pbkRpc3RhbmNlID0gY29zKDMwICogcmFkaWFucyk7IC8vIGNvcyhtaW5pbXVtIGFuZ3VsYXIgZGlzdGFuY2UpXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHByb2plY3QsIGRlbHRhMikge1xuICByZXR1cm4gK2RlbHRhMiA/IHJlc2FtcGxlKHByb2plY3QsIGRlbHRhMikgOiByZXNhbXBsZU5vbmUocHJvamVjdCk7XG59XG5cbmZ1bmN0aW9uIHJlc2FtcGxlTm9uZShwcm9qZWN0KSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcih7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHggPSBwcm9qZWN0KHgsIHkpO1xuICAgICAgdGhpcy5zdHJlYW0ucG9pbnQoeFswXSwgeFsxXSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVzYW1wbGUocHJvamVjdCwgZGVsdGEyKSB7XG5cbiAgZnVuY3Rpb24gcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MSwgeTEsIGxhbWJkYTEsIGExLCBiMSwgYzEsIGRlcHRoLCBzdHJlYW0pIHtcbiAgICB2YXIgZHggPSB4MSAtIHgwLFxuICAgICAgICBkeSA9IHkxIC0geTAsXG4gICAgICAgIGQyID0gZHggKiBkeCArIGR5ICogZHk7XG4gICAgaWYgKGQyID4gNCAqIGRlbHRhMiAmJiBkZXB0aC0tKSB7XG4gICAgICB2YXIgYSA9IGEwICsgYTEsXG4gICAgICAgICAgYiA9IGIwICsgYjEsXG4gICAgICAgICAgYyA9IGMwICsgYzEsXG4gICAgICAgICAgbSA9IHNxcnQoYSAqIGEgKyBiICogYiArIGMgKiBjKSxcbiAgICAgICAgICBwaGkyID0gYXNpbihjIC89IG0pLFxuICAgICAgICAgIGxhbWJkYTIgPSBhYnMoYWJzKGMpIC0gMSkgPCBlcHNpbG9uIHx8IGFicyhsYW1iZGEwIC0gbGFtYmRhMSkgPCBlcHNpbG9uID8gKGxhbWJkYTAgKyBsYW1iZGExKSAvIDIgOiBhdGFuMihiLCBhKSxcbiAgICAgICAgICBwID0gcHJvamVjdChsYW1iZGEyLCBwaGkyKSxcbiAgICAgICAgICB4MiA9IHBbMF0sXG4gICAgICAgICAgeTIgPSBwWzFdLFxuICAgICAgICAgIGR4MiA9IHgyIC0geDAsXG4gICAgICAgICAgZHkyID0geTIgLSB5MCxcbiAgICAgICAgICBkeiA9IGR5ICogZHgyIC0gZHggKiBkeTI7XG4gICAgICBpZiAoZHogKiBkeiAvIGQyID4gZGVsdGEyIC8vIHBlcnBlbmRpY3VsYXIgcHJvamVjdGVkIGRpc3RhbmNlXG4gICAgICAgICAgfHwgYWJzKChkeCAqIGR4MiArIGR5ICogZHkyKSAvIGQyIC0gMC41KSA+IDAuMyAvLyBtaWRwb2ludCBjbG9zZSB0byBhbiBlbmRcbiAgICAgICAgICB8fCBhMCAqIGExICsgYjAgKiBiMSArIGMwICogYzEgPCBjb3NNaW5EaXN0YW5jZSkgeyAvLyBhbmd1bGFyIGRpc3RhbmNlXG4gICAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDIsIHkyLCBsYW1iZGEyLCBhIC89IG0sIGIgLz0gbSwgYywgZGVwdGgsIHN0cmVhbSk7XG4gICAgICAgIHN0cmVhbS5wb2ludCh4MiwgeTIpO1xuICAgICAgICByZXNhbXBsZUxpbmVUbyh4MiwgeTIsIGxhbWJkYTIsIGEsIGIsIGMsIHgxLCB5MSwgbGFtYmRhMSwgYTEsIGIxLCBjMSwgZGVwdGgsIHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgbGFtYmRhMDAsIHgwMCwgeTAwLCBhMDAsIGIwMCwgYzAwLCAvLyBmaXJzdCBwb2ludFxuICAgICAgICBsYW1iZGEwLCB4MCwgeTAsIGEwLCBiMCwgYzA7IC8vIHByZXZpb3VzIHBvaW50XG5cbiAgICB2YXIgcmVzYW1wbGVTdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkgeyBzdHJlYW0ucG9seWdvblN0YXJ0KCk7IHJlc2FtcGxlU3RyZWFtLmxpbmVTdGFydCA9IHJpbmdTdGFydDsgfSxcbiAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkgeyBzdHJlYW0ucG9seWdvbkVuZCgpOyByZXNhbXBsZVN0cmVhbS5saW5lU3RhcnQgPSBsaW5lU3RhcnQ7IH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgICAgeCA9IHByb2plY3QoeCwgeSk7XG4gICAgICBzdHJlYW0ucG9pbnQoeFswXSwgeFsxXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgeDAgPSBOYU47XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIHZhciBjID0gY2FydGVzaWFuKFtsYW1iZGEsIHBoaV0pLCBwID0gcHJvamVjdChsYW1iZGEsIHBoaSk7XG4gICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgwID0gcFswXSwgeTAgPSBwWzFdLCBsYW1iZGEwID0gbGFtYmRhLCBhMCA9IGNbMF0sIGIwID0gY1sxXSwgYzAgPSBjWzJdLCBtYXhEZXB0aCwgc3RyZWFtKTtcbiAgICAgIHN0cmVhbS5wb2ludCh4MCwgeTApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IHBvaW50O1xuICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICBsaW5lU3RhcnQoKTtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gcmluZ1BvaW50O1xuICAgICAgcmVzYW1wbGVTdHJlYW0ubGluZUVuZCA9IHJpbmdFbmQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ1BvaW50KGxhbWJkYSwgcGhpKSB7XG4gICAgICBsaW5lUG9pbnQobGFtYmRhMDAgPSBsYW1iZGEsIHBoaSksIHgwMCA9IHgwLCB5MDAgPSB5MCwgYTAwID0gYTAsIGIwMCA9IGIwLCBjMDAgPSBjMDtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gbGluZVBvaW50O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdFbmQoKSB7XG4gICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgwMCwgeTAwLCBsYW1iZGEwMCwgYTAwLCBiMDAsIGMwMCwgbWF4RGVwdGgsIHN0cmVhbSk7XG4gICAgICByZXNhbXBsZVN0cmVhbS5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgIGxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzYW1wbGVTdHJlYW07XG4gIH07XG59XG4iLCAiaW1wb3J0IGNsaXBBbnRpbWVyaWRpYW4gZnJvbSBcIi4uL2NsaXAvYW50aW1lcmlkaWFuLmpzXCI7XG5pbXBvcnQgY2xpcENpcmNsZSBmcm9tIFwiLi4vY2xpcC9jaXJjbGUuanNcIjtcbmltcG9ydCBjbGlwUmVjdGFuZ2xlIGZyb20gXCIuLi9jbGlwL3JlY3RhbmdsZS5qc1wiO1xuaW1wb3J0IGNvbXBvc2UgZnJvbSBcIi4uL2NvbXBvc2UuanNcIjtcbmltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi4vaWRlbnRpdHkuanNcIjtcbmltcG9ydCB7Y29zLCBkZWdyZWVzLCByYWRpYW5zLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3JvdGF0ZVJhZGlhbnN9IGZyb20gXCIuLi9yb3RhdGlvbi5qc1wiO1xuaW1wb3J0IHt0cmFuc2Zvcm1lcn0gZnJvbSBcIi4uL3RyYW5zZm9ybS5qc1wiO1xuaW1wb3J0IHtmaXRFeHRlbnQsIGZpdFNpemUsIGZpdFdpZHRoLCBmaXRIZWlnaHR9IGZyb20gXCIuL2ZpdC5qc1wiO1xuaW1wb3J0IHJlc2FtcGxlIGZyb20gXCIuL3Jlc2FtcGxlLmpzXCI7XG5cbnZhciB0cmFuc2Zvcm1SYWRpYW5zID0gdHJhbnNmb3JtZXIoe1xuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMuc3RyZWFtLnBvaW50KHggKiByYWRpYW5zLCB5ICogcmFkaWFucyk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Sb3RhdGUocm90YXRlKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcih7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciByID0gcm90YXRlKHgsIHkpO1xuICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtLnBvaW50KHJbMF0sIHJbMV0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNjYWxlVHJhbnNsYXRlKGssIGR4LCBkeSwgc3gsIHN5KSB7XG4gIGZ1bmN0aW9uIHRyYW5zZm9ybSh4LCB5KSB7XG4gICAgeCAqPSBzeDsgeSAqPSBzeTtcbiAgICByZXR1cm4gW2R4ICsgayAqIHgsIGR5IC0gayAqIHldO1xuICB9XG4gIHRyYW5zZm9ybS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFsoeCAtIGR4KSAvIGsgKiBzeCwgKGR5IC0geSkgLyBrICogc3ldO1xuICB9O1xuICByZXR1cm4gdHJhbnNmb3JtO1xufVxuXG5mdW5jdGlvbiBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCBkeCwgZHksIHN4LCBzeSwgYWxwaGEpIHtcbiAgaWYgKCFhbHBoYSkgcmV0dXJuIHNjYWxlVHJhbnNsYXRlKGssIGR4LCBkeSwgc3gsIHN5KTtcbiAgdmFyIGNvc0FscGhhID0gY29zKGFscGhhKSxcbiAgICAgIHNpbkFscGhhID0gc2luKGFscGhhKSxcbiAgICAgIGEgPSBjb3NBbHBoYSAqIGssXG4gICAgICBiID0gc2luQWxwaGEgKiBrLFxuICAgICAgYWkgPSBjb3NBbHBoYSAvIGssXG4gICAgICBiaSA9IHNpbkFscGhhIC8gayxcbiAgICAgIGNpID0gKHNpbkFscGhhICogZHkgLSBjb3NBbHBoYSAqIGR4KSAvIGssXG4gICAgICBmaSA9IChzaW5BbHBoYSAqIGR4ICsgY29zQWxwaGEgKiBkeSkgLyBrO1xuICBmdW5jdGlvbiB0cmFuc2Zvcm0oeCwgeSkge1xuICAgIHggKj0gc3g7IHkgKj0gc3k7XG4gICAgcmV0dXJuIFthICogeCAtIGIgKiB5ICsgZHgsIGR5IC0gYiAqIHggLSBhICogeV07XG4gIH1cbiAgdHJhbnNmb3JtLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gW3N4ICogKGFpICogeCAtIGJpICogeSArIGNpKSwgc3kgKiAoZmkgLSBiaSAqIHggLSBhaSAqIHkpXTtcbiAgfTtcbiAgcmV0dXJuIHRyYW5zZm9ybTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJvamVjdGlvbihwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0aW9uTXV0YXRvcihmdW5jdGlvbigpIHsgcmV0dXJuIHByb2plY3Q7IH0pKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uTXV0YXRvcihwcm9qZWN0QXQpIHtcbiAgdmFyIHByb2plY3QsXG4gICAgICBrID0gMTUwLCAvLyBzY2FsZVxuICAgICAgeCA9IDQ4MCwgeSA9IDI1MCwgLy8gdHJhbnNsYXRlXG4gICAgICBsYW1iZGEgPSAwLCBwaGkgPSAwLCAvLyBjZW50ZXJcbiAgICAgIGRlbHRhTGFtYmRhID0gMCwgZGVsdGFQaGkgPSAwLCBkZWx0YUdhbW1hID0gMCwgcm90YXRlLCAvLyBwcmUtcm90YXRlXG4gICAgICBhbHBoYSA9IDAsIC8vIHBvc3Qtcm90YXRlIGFuZ2xlXG4gICAgICBzeCA9IDEsIC8vIHJlZmxlY3RYXG4gICAgICBzeSA9IDEsIC8vIHJlZmxlY3RYXG4gICAgICB0aGV0YSA9IG51bGwsIHByZWNsaXAgPSBjbGlwQW50aW1lcmlkaWFuLCAvLyBwcmUtY2xpcCBhbmdsZVxuICAgICAgeDAgPSBudWxsLCB5MCwgeDEsIHkxLCBwb3N0Y2xpcCA9IGlkZW50aXR5LCAvLyBwb3N0LWNsaXAgZXh0ZW50XG4gICAgICBkZWx0YTIgPSAwLjUsIC8vIHByZWNpc2lvblxuICAgICAgcHJvamVjdFJlc2FtcGxlLFxuICAgICAgcHJvamVjdFRyYW5zZm9ybSxcbiAgICAgIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0sXG4gICAgICBjYWNoZSxcbiAgICAgIGNhY2hlU3RyZWFtO1xuXG4gIGZ1bmN0aW9uIHByb2plY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gcHJvamVjdFJvdGF0ZVRyYW5zZm9ybShwb2ludFswXSAqIHJhZGlhbnMsIHBvaW50WzFdICogcmFkaWFucyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZlcnQocG9pbnQpIHtcbiAgICBwb2ludCA9IHByb2plY3RSb3RhdGVUcmFuc2Zvcm0uaW52ZXJ0KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgcmV0dXJuIHBvaW50ICYmIFtwb2ludFswXSAqIGRlZ3JlZXMsIHBvaW50WzFdICogZGVncmVlc107XG4gIH1cblxuICBwcm9qZWN0aW9uLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IHRyYW5zZm9ybVJhZGlhbnModHJhbnNmb3JtUm90YXRlKHJvdGF0ZSkocHJlY2xpcChwcm9qZWN0UmVzYW1wbGUocG9zdGNsaXAoY2FjaGVTdHJlYW0gPSBzdHJlYW0pKSkpKTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnByZWNsaXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJlY2xpcCA9IF8sIHRoZXRhID0gdW5kZWZpbmVkLCByZXNldCgpKSA6IHByZWNsaXA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5wb3N0Y2xpcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwb3N0Y2xpcCA9IF8sIHgwID0geTAgPSB4MSA9IHkxID0gbnVsbCwgcmVzZXQoKSkgOiBwb3N0Y2xpcDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNsaXBBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjbGlwID0gK18gPyBjbGlwQ2lyY2xlKHRoZXRhID0gXyAqIHJhZGlhbnMpIDogKHRoZXRhID0gbnVsbCwgY2xpcEFudGltZXJpZGlhbiksIHJlc2V0KCkpIDogdGhldGEgKiBkZWdyZWVzO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2xpcEV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwb3N0Y2xpcCA9IF8gPT0gbnVsbCA/ICh4MCA9IHkwID0geDEgPSB5MSA9IG51bGwsIGlkZW50aXR5KSA6IGNsaXBSZWN0YW5nbGUoeDAgPSArX1swXVswXSwgeTAgPSArX1swXVsxXSwgeDEgPSArX1sxXVswXSwgeTEgPSArX1sxXVsxXSksIHJlc2V0KCkpIDogeDAgPT0gbnVsbCA/IG51bGwgOiBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGsgPSArXywgcmVjZW50ZXIoKSkgOiBrO1xuICB9O1xuXG4gIHByb2plY3Rpb24udHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSArX1swXSwgeSA9ICtfWzFdLCByZWNlbnRlcigpKSA6IFt4LCB5XTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChsYW1iZGEgPSBfWzBdICUgMzYwICogcmFkaWFucywgcGhpID0gX1sxXSAlIDM2MCAqIHJhZGlhbnMsIHJlY2VudGVyKCkpIDogW2xhbWJkYSAqIGRlZ3JlZXMsIHBoaSAqIGRlZ3JlZXNdO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucm90YXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRlbHRhTGFtYmRhID0gX1swXSAlIDM2MCAqIHJhZGlhbnMsIGRlbHRhUGhpID0gX1sxXSAlIDM2MCAqIHJhZGlhbnMsIGRlbHRhR2FtbWEgPSBfLmxlbmd0aCA+IDIgPyBfWzJdICUgMzYwICogcmFkaWFucyA6IDAsIHJlY2VudGVyKCkpIDogW2RlbHRhTGFtYmRhICogZGVncmVlcywgZGVsdGFQaGkgKiBkZWdyZWVzLCBkZWx0YUdhbW1hICogZGVncmVlc107XG4gIH07XG5cbiAgcHJvamVjdGlvbi5hbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYSA9IF8gJSAzNjAgKiByYWRpYW5zLCByZWNlbnRlcigpKSA6IGFscGhhICogZGVncmVlcztcbiAgfTtcblxuICBwcm9qZWN0aW9uLnJlZmxlY3RYID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN4ID0gXyA/IC0xIDogMSwgcmVjZW50ZXIoKSkgOiBzeCA8IDA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5yZWZsZWN0WSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzeSA9IF8gPyAtMSA6IDEsIHJlY2VudGVyKCkpIDogc3kgPCAwO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByb2plY3RSZXNhbXBsZSA9IHJlc2FtcGxlKHByb2plY3RUcmFuc2Zvcm0sIGRlbHRhMiA9IF8gKiBfKSwgcmVzZXQoKSkgOiBzcXJ0KGRlbHRhMik7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRFeHRlbnQgPSBmdW5jdGlvbihleHRlbnQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRFeHRlbnQocHJvamVjdGlvbiwgZXh0ZW50LCBvYmplY3QpO1xuICB9O1xuXG4gIHByb2plY3Rpb24uZml0U2l6ZSA9IGZ1bmN0aW9uKHNpemUsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0V2lkdGgocHJvamVjdGlvbiwgd2lkdGgsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRIZWlnaHQgPSBmdW5jdGlvbihoZWlnaHQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRIZWlnaHQocHJvamVjdGlvbiwgaGVpZ2h0LCBvYmplY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlY2VudGVyKCkge1xuICAgIHZhciBjZW50ZXIgPSBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCAwLCAwLCBzeCwgc3ksIGFscGhhKS5hcHBseShudWxsLCBwcm9qZWN0KGxhbWJkYSwgcGhpKSksXG4gICAgICAgIHRyYW5zZm9ybSA9IHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIHggLSBjZW50ZXJbMF0sIHkgLSBjZW50ZXJbMV0sIHN4LCBzeSwgYWxwaGEpO1xuICAgIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMoZGVsdGFMYW1iZGEsIGRlbHRhUGhpLCBkZWx0YUdhbW1hKTtcbiAgICBwcm9qZWN0VHJhbnNmb3JtID0gY29tcG9zZShwcm9qZWN0LCB0cmFuc2Zvcm0pO1xuICAgIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0gPSBjb21wb3NlKHJvdGF0ZSwgcHJvamVjdFRyYW5zZm9ybSk7XG4gICAgcHJvamVjdFJlc2FtcGxlID0gcmVzYW1wbGUocHJvamVjdFRyYW5zZm9ybSwgZGVsdGEyKTtcbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgIHJldHVybiBwcm9qZWN0aW9uO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHByb2plY3QgPSBwcm9qZWN0QXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBwcm9qZWN0aW9uLmludmVydCA9IHByb2plY3QuaW52ZXJ0ICYmIGludmVydDtcbiAgICByZXR1cm4gcmVjZW50ZXIoKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge2RlZ3JlZXMsIHBpLCByYWRpYW5zfSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtwcm9qZWN0aW9uTXV0YXRvcn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmljUHJvamVjdGlvbihwcm9qZWN0QXQpIHtcbiAgdmFyIHBoaTAgPSAwLFxuICAgICAgcGhpMSA9IHBpIC8gMyxcbiAgICAgIG0gPSBwcm9qZWN0aW9uTXV0YXRvcihwcm9qZWN0QXQpLFxuICAgICAgcCA9IG0ocGhpMCwgcGhpMSk7XG5cbiAgcC5wYXJhbGxlbHMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBtKHBoaTAgPSBfWzBdICogcmFkaWFucywgcGhpMSA9IF9bMV0gKiByYWRpYW5zKSA6IFtwaGkwICogZGVncmVlcywgcGhpMSAqIGRlZ3JlZXNdO1xuICB9O1xuXG4gIHJldHVybiBwO1xufVxuIiwgImltcG9ydCB7YXNpbiwgY29zLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjeWxpbmRyaWNhbEVxdWFsQXJlYVJhdyhwaGkwKSB7XG4gIHZhciBjb3NQaGkwID0gY29zKHBoaTApO1xuXG4gIGZ1bmN0aW9uIGZvcndhcmQobGFtYmRhLCBwaGkpIHtcbiAgICByZXR1cm4gW2xhbWJkYSAqIGNvc1BoaTAsIHNpbihwaGkpIC8gY29zUGhpMF07XG4gIH1cblxuICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gW3ggLyBjb3NQaGkwLCBhc2luKHkgKiBjb3NQaGkwKV07XG4gIH07XG5cbiAgcmV0dXJuIGZvcndhcmQ7XG59XG4iLCAiaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIHBpLCBzaWduLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge2NvbmljUHJvamVjdGlvbn0gZnJvbSBcIi4vY29uaWMuanNcIjtcbmltcG9ydCB7Y3lsaW5kcmljYWxFcXVhbEFyZWFSYXd9IGZyb20gXCIuL2N5bGluZHJpY2FsRXF1YWxBcmVhLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25pY0VxdWFsQXJlYVJhdyh5MCwgeTEpIHtcbiAgdmFyIHN5MCA9IHNpbih5MCksIG4gPSAoc3kwICsgc2luKHkxKSkgLyAyO1xuXG4gIC8vIEFyZSB0aGUgcGFyYWxsZWxzIHN5bW1ldHJpY2FsIGFyb3VuZCB0aGUgRXF1YXRvcj9cbiAgaWYgKGFicyhuKSA8IGVwc2lsb24pIHJldHVybiBjeWxpbmRyaWNhbEVxdWFsQXJlYVJhdyh5MCk7XG5cbiAgdmFyIGMgPSAxICsgc3kwICogKDIgKiBuIC0gc3kwKSwgcjAgPSBzcXJ0KGMpIC8gbjtcblxuICBmdW5jdGlvbiBwcm9qZWN0KHgsIHkpIHtcbiAgICB2YXIgciA9IHNxcnQoYyAtIDIgKiBuICogc2luKHkpKSAvIG47XG4gICAgcmV0dXJuIFtyICogc2luKHggKj0gbiksIHIwIC0gciAqIGNvcyh4KV07XG4gIH1cblxuICBwcm9qZWN0LmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgcjB5ID0gcjAgLSB5LFxuICAgICAgICBsID0gYXRhbjIoeCwgYWJzKHIweSkpICogc2lnbihyMHkpO1xuICAgIGlmIChyMHkgKiBuIDwgMClcbiAgICAgIGwgLT0gcGkgKiBzaWduKHgpICogc2lnbihyMHkpO1xuICAgIHJldHVybiBbbCAvIG4sIGFzaW4oKGMgLSAoeCAqIHggKyByMHkgKiByMHkpICogbiAqIG4pIC8gKDIgKiBuKSldO1xuICB9O1xuXG4gIHJldHVybiBwcm9qZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvbmljUHJvamVjdGlvbihjb25pY0VxdWFsQXJlYVJhdylcbiAgICAgIC5zY2FsZSgxNTUuNDI0KVxuICAgICAgLmNlbnRlcihbMCwgMzMuNjQ0Ml0pO1xufVxuIiwgImltcG9ydCBjb25pY0VxdWFsQXJlYSBmcm9tIFwiLi9jb25pY0VxdWFsQXJlYS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvbmljRXF1YWxBcmVhKClcbiAgICAgIC5wYXJhbGxlbHMoWzI5LjUsIDQ1LjVdKVxuICAgICAgLnNjYWxlKDEwNzApXG4gICAgICAudHJhbnNsYXRlKFs0ODAsIDI1MF0pXG4gICAgICAucm90YXRlKFs5NiwgMF0pXG4gICAgICAuY2VudGVyKFstMC42LCAzOC43XSk7XG59XG4iLCAiaW1wb3J0IHtlcHNpbG9ufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IGFsYmVycyBmcm9tIFwiLi9hbGJlcnMuanNcIjtcbmltcG9ydCBjb25pY0VxdWFsQXJlYSBmcm9tIFwiLi9jb25pY0VxdWFsQXJlYS5qc1wiO1xuaW1wb3J0IHtmaXRFeHRlbnQsIGZpdFNpemUsIGZpdFdpZHRoLCBmaXRIZWlnaHR9IGZyb20gXCIuL2ZpdC5qc1wiO1xuXG4vLyBUaGUgcHJvamVjdGlvbnMgbXVzdCBoYXZlIG11dHVhbGx5IGV4Y2x1c2l2ZSBjbGlwIHJlZ2lvbnMgb24gdGhlIHNwaGVyZSxcbi8vIGFzIHRoaXMgd2lsbCBhdm9pZCBlbWl0dGluZyBpbnRlcmxlYXZpbmcgbGluZXMgYW5kIHBvbHlnb25zLlxuZnVuY3Rpb24gbXVsdGlwbGV4KHN0cmVhbXMpIHtcbiAgdmFyIG4gPSBzdHJlYW1zLmxlbmd0aDtcbiAgcmV0dXJuIHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5wb2ludCh4LCB5KTsgfSxcbiAgICBzcGhlcmU6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5zcGhlcmUoKTsgfSxcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5saW5lU3RhcnQoKTsgfSxcbiAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ubGluZUVuZCgpOyB9LFxuICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnBvbHlnb25TdGFydCgpOyB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5wb2x5Z29uRW5kKCk7IH1cbiAgfTtcbn1cblxuLy8gQSBjb21wb3NpdGUgcHJvamVjdGlvbiBmb3IgdGhlIFVuaXRlZCBTdGF0ZXMsIGNvbmZpZ3VyZWQgYnkgZGVmYXVsdCBmb3Jcbi8vIDk2MFx1MDBENzUwMC4gVGhlIHByb2plY3Rpb24gYWxzbyB3b3JrcyBxdWl0ZSB3ZWxsIGF0IDk2MFx1MDBENzYwMCBpZiB5b3UgY2hhbmdlIHRoZVxuLy8gc2NhbGUgdG8gMTI4NSBhbmQgYWRqdXN0IHRoZSB0cmFuc2xhdGUgYWNjb3JkaW5nbHkuIFRoZSBzZXQgb2Ygc3RhbmRhcmRcbi8vIHBhcmFsbGVscyBmb3IgZWFjaCByZWdpb24gY29tZXMgZnJvbSBVU0dTLCB3aGljaCBpcyBwdWJsaXNoZWQgaGVyZTpcbi8vIGh0dHA6Ly9lZ3NjLnVzZ3MuZ292L2lzYi9wdWJzL01hcFByb2plY3Rpb25zL3Byb2plY3Rpb25zLmh0bWwjYWxiZXJzXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhY2hlLFxuICAgICAgY2FjaGVTdHJlYW0sXG4gICAgICBsb3dlcjQ4ID0gYWxiZXJzKCksIGxvd2VyNDhQb2ludCxcbiAgICAgIGFsYXNrYSA9IGNvbmljRXF1YWxBcmVhKCkucm90YXRlKFsxNTQsIDBdKS5jZW50ZXIoWy0yLCA1OC41XSkucGFyYWxsZWxzKFs1NSwgNjVdKSwgYWxhc2thUG9pbnQsIC8vIEVQU0c6MzMzOFxuICAgICAgaGF3YWlpID0gY29uaWNFcXVhbEFyZWEoKS5yb3RhdGUoWzE1NywgMF0pLmNlbnRlcihbLTMsIDE5LjldKS5wYXJhbGxlbHMoWzgsIDE4XSksIGhhd2FpaVBvaW50LCAvLyBFU1JJOjEwMjAwN1xuICAgICAgcG9pbnQsIHBvaW50U3RyZWFtID0ge3BvaW50OiBmdW5jdGlvbih4LCB5KSB7IHBvaW50ID0gW3gsIHldOyB9fTtcblxuICBmdW5jdGlvbiBhbGJlcnNVc2EoY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgeCA9IGNvb3JkaW5hdGVzWzBdLCB5ID0gY29vcmRpbmF0ZXNbMV07XG4gICAgcmV0dXJuIHBvaW50ID0gbnVsbCxcbiAgICAgICAgKGxvd2VyNDhQb2ludC5wb2ludCh4LCB5KSwgcG9pbnQpXG4gICAgICAgIHx8IChhbGFza2FQb2ludC5wb2ludCh4LCB5KSwgcG9pbnQpXG4gICAgICAgIHx8IChoYXdhaWlQb2ludC5wb2ludCh4LCB5KSwgcG9pbnQpO1xuICB9XG5cbiAgYWxiZXJzVXNhLmludmVydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7XG4gICAgdmFyIGsgPSBsb3dlcjQ4LnNjYWxlKCksXG4gICAgICAgIHQgPSBsb3dlcjQ4LnRyYW5zbGF0ZSgpLFxuICAgICAgICB4ID0gKGNvb3JkaW5hdGVzWzBdIC0gdFswXSkgLyBrLFxuICAgICAgICB5ID0gKGNvb3JkaW5hdGVzWzFdIC0gdFsxXSkgLyBrO1xuICAgIHJldHVybiAoeSA+PSAwLjEyMCAmJiB5IDwgMC4yMzQgJiYgeCA+PSAtMC40MjUgJiYgeCA8IC0wLjIxNCA/IGFsYXNrYVxuICAgICAgICA6IHkgPj0gMC4xNjYgJiYgeSA8IDAuMjM0ICYmIHggPj0gLTAuMjE0ICYmIHggPCAtMC4xMTUgPyBoYXdhaWlcbiAgICAgICAgOiBsb3dlcjQ4KS5pbnZlcnQoY29vcmRpbmF0ZXMpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5zdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICByZXR1cm4gY2FjaGUgJiYgY2FjaGVTdHJlYW0gPT09IHN0cmVhbSA/IGNhY2hlIDogY2FjaGUgPSBtdWx0aXBsZXgoW2xvd2VyNDguc3RyZWFtKGNhY2hlU3RyZWFtID0gc3RyZWFtKSwgYWxhc2thLnN0cmVhbShzdHJlYW0pLCBoYXdhaWkuc3RyZWFtKHN0cmVhbSldKTtcbiAgfTtcblxuICBhbGJlcnNVc2EucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDgucHJlY2lzaW9uKCk7XG4gICAgbG93ZXI0OC5wcmVjaXNpb24oXyksIGFsYXNrYS5wcmVjaXNpb24oXyksIGhhd2FpaS5wcmVjaXNpb24oXyk7XG4gICAgcmV0dXJuIHJlc2V0KCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDguc2NhbGUoKTtcbiAgICBsb3dlcjQ4LnNjYWxlKF8pLCBhbGFza2Euc2NhbGUoXyAqIDAuMzUpLCBoYXdhaWkuc2NhbGUoXyk7XG4gICAgcmV0dXJuIGFsYmVyc1VzYS50cmFuc2xhdGUobG93ZXI0OC50cmFuc2xhdGUoKSk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsb3dlcjQ4LnRyYW5zbGF0ZSgpO1xuICAgIHZhciBrID0gbG93ZXI0OC5zY2FsZSgpLCB4ID0gK19bMF0sIHkgPSArX1sxXTtcblxuICAgIGxvd2VyNDhQb2ludCA9IGxvd2VyNDhcbiAgICAgICAgLnRyYW5zbGF0ZShfKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjQ1NSAqIGssIHkgLSAwLjIzOCAqIGtdLCBbeCArIDAuNDU1ICogaywgeSArIDAuMjM4ICoga11dKVxuICAgICAgICAuc3RyZWFtKHBvaW50U3RyZWFtKTtcblxuICAgIGFsYXNrYVBvaW50ID0gYWxhc2thXG4gICAgICAgIC50cmFuc2xhdGUoW3ggLSAwLjMwNyAqIGssIHkgKyAwLjIwMSAqIGtdKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjQyNSAqIGsgKyBlcHNpbG9uLCB5ICsgMC4xMjAgKiBrICsgZXBzaWxvbl0sIFt4IC0gMC4yMTQgKiBrIC0gZXBzaWxvbiwgeSArIDAuMjM0ICogayAtIGVwc2lsb25dXSlcbiAgICAgICAgLnN0cmVhbShwb2ludFN0cmVhbSk7XG5cbiAgICBoYXdhaWlQb2ludCA9IGhhd2FpaVxuICAgICAgICAudHJhbnNsYXRlKFt4IC0gMC4yMDUgKiBrLCB5ICsgMC4yMTIgKiBrXSlcbiAgICAgICAgLmNsaXBFeHRlbnQoW1t4IC0gMC4yMTQgKiBrICsgZXBzaWxvbiwgeSArIDAuMTY2ICogayArIGVwc2lsb25dLCBbeCAtIDAuMTE1ICogayAtIGVwc2lsb24sIHkgKyAwLjIzNCAqIGsgLSBlcHNpbG9uXV0pXG4gICAgICAgIC5zdHJlYW0ocG9pbnRTdHJlYW0pO1xuXG4gICAgcmV0dXJuIHJlc2V0KCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLmZpdEV4dGVudCA9IGZ1bmN0aW9uKGV4dGVudCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEV4dGVudChhbGJlcnNVc2EsIGV4dGVudCwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0U2l6ZSA9IGZ1bmN0aW9uKHNpemUsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRTaXplKGFsYmVyc1VzYSwgc2l6ZSwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0V2lkdGggPSBmdW5jdGlvbih3aWR0aCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFdpZHRoKGFsYmVyc1VzYSwgd2lkdGgsIG9iamVjdCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLmZpdEhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEhlaWdodChhbGJlcnNVc2EsIGhlaWdodCwgb2JqZWN0KTtcbiAgfTtcblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBjYWNoZSA9IGNhY2hlU3RyZWFtID0gbnVsbDtcbiAgICByZXR1cm4gYWxiZXJzVXNhO1xuICB9XG5cbiAgcmV0dXJuIGFsYmVyc1VzYS5zY2FsZSgxMDcwKTtcbn1cbiIsICJpbXBvcnQge2FzaW4sIGF0YW4yLCBjb3MsIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGF6aW11dGhhbFJhdyhzY2FsZSkge1xuICByZXR1cm4gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBjeCA9IGNvcyh4KSxcbiAgICAgICAgY3kgPSBjb3MoeSksXG4gICAgICAgIGsgPSBzY2FsZShjeCAqIGN5KTtcbiAgICAgICAgaWYgKGsgPT09IEluZmluaXR5KSByZXR1cm4gWzIsIDBdO1xuICAgIHJldHVybiBbXG4gICAgICBrICogY3kgKiBzaW4oeCksXG4gICAgICBrICogc2luKHkpXG4gICAgXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXppbXV0aGFsSW52ZXJ0KGFuZ2xlKSB7XG4gIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIHogPSBzcXJ0KHggKiB4ICsgeSAqIHkpLFxuICAgICAgICBjID0gYW5nbGUoeiksXG4gICAgICAgIHNjID0gc2luKGMpLFxuICAgICAgICBjYyA9IGNvcyhjKTtcbiAgICByZXR1cm4gW1xuICAgICAgYXRhbjIoeCAqIHNjLCB6ICogY2MpLFxuICAgICAgYXNpbih6ICYmIHkgKiBzYyAvIHopXG4gICAgXTtcbiAgfVxufVxuIiwgImltcG9ydCB7YXNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7YXppbXV0aGFsUmF3LCBhemltdXRoYWxJbnZlcnR9IGZyb20gXCIuL2F6aW11dGhhbC5qc1wiO1xuaW1wb3J0IHByb2plY3Rpb24gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IHZhciBhemltdXRoYWxFcXVhbEFyZWFSYXcgPSBhemltdXRoYWxSYXcoZnVuY3Rpb24oY3hjeSkge1xuICByZXR1cm4gc3FydCgyIC8gKDEgKyBjeGN5KSk7XG59KTtcblxuYXppbXV0aGFsRXF1YWxBcmVhUmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChmdW5jdGlvbih6KSB7XG4gIHJldHVybiAyICogYXNpbih6IC8gMik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKGF6aW11dGhhbEVxdWFsQXJlYVJhdylcbiAgICAgIC5zY2FsZSgxMjQuNzUpXG4gICAgICAuY2xpcEFuZ2xlKDE4MCAtIDFlLTMpO1xufVxuIiwgImltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgY29zLCBlcHNpbG9uMiwgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG52YXIgQTEgPSAxLjM0MDI2NCxcbiAgICBBMiA9IC0wLjA4MTEwNixcbiAgICBBMyA9IDAuMDAwODkzLFxuICAgIEE0ID0gMC4wMDM3OTYsXG4gICAgTSA9IHNxcnQoMykgLyAyLFxuICAgIGl0ZXJhdGlvbnMgPSAxMjtcblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsRWFydGhSYXcobGFtYmRhLCBwaGkpIHtcbiAgdmFyIGwgPSBhc2luKE0gKiBzaW4ocGhpKSksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICByZXR1cm4gW1xuICAgIGxhbWJkYSAqIGNvcyhsKSAvIChNICogKEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMikpKSxcbiAgICBsICogKEExICsgQTIgKiBsMiArIGw2ICogKEEzICsgQTQgKiBsMikpXG4gIF07XG59XG5cbmVxdWFsRWFydGhSYXcuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgbCA9IHksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICBmb3IgKHZhciBpID0gMCwgZGVsdGEsIGZ5LCBmcHk7IGkgPCBpdGVyYXRpb25zOyArK2kpIHtcbiAgICBmeSA9IGwgKiAoQTEgKyBBMiAqIGwyICsgbDYgKiAoQTMgKyBBNCAqIGwyKSkgLSB5O1xuICAgIGZweSA9IEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMik7XG4gICAgbCAtPSBkZWx0YSA9IGZ5IC8gZnB5LCBsMiA9IGwgKiBsLCBsNiA9IGwyICogbDIgKiBsMjtcbiAgICBpZiAoYWJzKGRlbHRhKSA8IGVwc2lsb24yKSBicmVhaztcbiAgfVxuICByZXR1cm4gW1xuICAgIE0gKiB4ICogKEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMikpIC8gY29zKGwpLFxuICAgIGFzaW4oc2luKGwpIC8gTSlcbiAgXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcHJvamVjdGlvbihlcXVhbEVhcnRoUmF3KVxuICAgICAgLnNjYWxlKDE3Ny4xNTgpO1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBpbml0UmFuZ2UoZG9tYWluLCByYW5nZSkge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IGJyZWFrO1xuICAgIGNhc2UgMTogdGhpcy5yYW5nZShkb21haW4pOyBicmVhaztcbiAgICBkZWZhdWx0OiB0aGlzLnJhbmdlKHJhbmdlKS5kb21haW4oZG9tYWluKTsgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0SW50ZXJwb2xhdG9yKGRvbWFpbiwgaW50ZXJwb2xhdG9yKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogYnJlYWs7XG4gICAgY2FzZSAxOiB7XG4gICAgICBpZiAodHlwZW9mIGRvbWFpbiA9PT0gXCJmdW5jdGlvblwiKSB0aGlzLmludGVycG9sYXRvcihkb21haW4pO1xuICAgICAgZWxzZSB0aGlzLnJhbmdlKGRvbWFpbik7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGVmYXVsdDoge1xuICAgICAgdGhpcy5kb21haW4oZG9tYWluKTtcbiAgICAgIGlmICh0eXBlb2YgaW50ZXJwb2xhdG9yID09PSBcImZ1bmN0aW9uXCIpIHRoaXMuaW50ZXJwb2xhdG9yKGludGVycG9sYXRvcik7XG4gICAgICBlbHNlIHRoaXMucmFuZ2UoaW50ZXJwb2xhdG9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zdGFudHMoeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuICt4O1xufVxuIiwgImltcG9ydCB7YmlzZWN0fSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGUgYXMgaW50ZXJwb2xhdGVWYWx1ZSwgaW50ZXJwb2xhdGVOdW1iZXIsIGludGVycG9sYXRlUm91bmR9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG52YXIgdW5pdCA9IFswLCAxXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShhLCBiKSB7XG4gIHJldHVybiAoYiAtPSAoYSA9ICthKSlcbiAgICAgID8gZnVuY3Rpb24oeCkgeyByZXR1cm4gKHggLSBhKSAvIGI7IH1cbiAgICAgIDogY29uc3RhbnQoaXNOYU4oYikgPyBOYU4gOiAwLjUpO1xufVxuXG5mdW5jdGlvbiBjbGFtcGVyKGEsIGIpIHtcbiAgdmFyIHQ7XG4gIGlmIChhID4gYikgdCA9IGEsIGEgPSBiLCBiID0gdDtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHsgcmV0dXJuIE1hdGgubWF4KGEsIE1hdGgubWluKGIsIHgpKTsgfTtcbn1cblxuLy8gbm9ybWFsaXplKGEsIGIpKHgpIHRha2VzIGEgZG9tYWluIHZhbHVlIHggaW4gW2EsYl0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcGFyYW1ldGVyIHQgaW4gWzAsMV0uXG4vLyBpbnRlcnBvbGF0ZShhLCBiKSh0KSB0YWtlcyBhIHBhcmFtZXRlciB0IGluIFswLDFdIGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHJhbmdlIHZhbHVlIHggaW4gW2EsYl0uXG5mdW5jdGlvbiBiaW1hcChkb21haW4sIHJhbmdlLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgZDAgPSBkb21haW5bMF0sIGQxID0gZG9tYWluWzFdLCByMCA9IHJhbmdlWzBdLCByMSA9IHJhbmdlWzFdO1xuICBpZiAoZDEgPCBkMCkgZDAgPSBub3JtYWxpemUoZDEsIGQwKSwgcjAgPSBpbnRlcnBvbGF0ZShyMSwgcjApO1xuICBlbHNlIGQwID0gbm9ybWFsaXplKGQwLCBkMSksIHIwID0gaW50ZXJwb2xhdGUocjAsIHIxKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHIwKGQwKHgpKTsgfTtcbn1cblxuZnVuY3Rpb24gcG9seW1hcChkb21haW4sIHJhbmdlLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgaiA9IE1hdGgubWluKGRvbWFpbi5sZW5ndGgsIHJhbmdlLmxlbmd0aCkgLSAxLFxuICAgICAgZCA9IG5ldyBBcnJheShqKSxcbiAgICAgIHIgPSBuZXcgQXJyYXkoaiksXG4gICAgICBpID0gLTE7XG5cbiAgLy8gUmV2ZXJzZSBkZXNjZW5kaW5nIGRvbWFpbnMuXG4gIGlmIChkb21haW5bal0gPCBkb21haW5bMF0pIHtcbiAgICBkb21haW4gPSBkb21haW4uc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgcmFuZ2UgPSByYW5nZS5zbGljZSgpLnJldmVyc2UoKTtcbiAgfVxuXG4gIHdoaWxlICgrK2kgPCBqKSB7XG4gICAgZFtpXSA9IG5vcm1hbGl6ZShkb21haW5baV0sIGRvbWFpbltpICsgMV0pO1xuICAgIHJbaV0gPSBpbnRlcnBvbGF0ZShyYW5nZVtpXSwgcmFuZ2VbaSArIDFdKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgdmFyIGkgPSBiaXNlY3QoZG9tYWluLCB4LCAxLCBqKSAtIDE7XG4gICAgcmV0dXJuIHJbaV0oZFtpXSh4KSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHJldHVybiB0YXJnZXRcbiAgICAgIC5kb21haW4oc291cmNlLmRvbWFpbigpKVxuICAgICAgLnJhbmdlKHNvdXJjZS5yYW5nZSgpKVxuICAgICAgLmludGVycG9sYXRlKHNvdXJjZS5pbnRlcnBvbGF0ZSgpKVxuICAgICAgLmNsYW1wKHNvdXJjZS5jbGFtcCgpKVxuICAgICAgLnVua25vd24oc291cmNlLnVua25vd24oKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1lcigpIHtcbiAgdmFyIGRvbWFpbiA9IHVuaXQsXG4gICAgICByYW5nZSA9IHVuaXQsXG4gICAgICBpbnRlcnBvbGF0ZSA9IGludGVycG9sYXRlVmFsdWUsXG4gICAgICB0cmFuc2Zvcm0sXG4gICAgICB1bnRyYW5zZm9ybSxcbiAgICAgIHVua25vd24sXG4gICAgICBjbGFtcCA9IGlkZW50aXR5LFxuICAgICAgcGllY2V3aXNlLFxuICAgICAgb3V0cHV0LFxuICAgICAgaW5wdXQ7XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICB2YXIgbiA9IE1hdGgubWluKGRvbWFpbi5sZW5ndGgsIHJhbmdlLmxlbmd0aCk7XG4gICAgaWYgKGNsYW1wICE9PSBpZGVudGl0eSkgY2xhbXAgPSBjbGFtcGVyKGRvbWFpblswXSwgZG9tYWluW24gLSAxXSk7XG4gICAgcGllY2V3aXNlID0gbiA+IDIgPyBwb2x5bWFwIDogYmltYXA7XG4gICAgb3V0cHV0ID0gaW5wdXQgPSBudWxsO1xuICAgIHJldHVybiBzY2FsZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNjYWxlKHgpIHtcbiAgICByZXR1cm4geCA9PSBudWxsIHx8IGlzTmFOKHggPSAreCkgPyB1bmtub3duIDogKG91dHB1dCB8fCAob3V0cHV0ID0gcGllY2V3aXNlKGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgcmFuZ2UsIGludGVycG9sYXRlKSkpKHRyYW5zZm9ybShjbGFtcCh4KSkpO1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiBjbGFtcCh1bnRyYW5zZm9ybSgoaW5wdXQgfHwgKGlucHV0ID0gcGllY2V3aXNlKHJhbmdlLCBkb21haW4ubWFwKHRyYW5zZm9ybSksIGludGVycG9sYXRlTnVtYmVyKSkpKHkpKSk7XG4gIH07XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRvbWFpbiA9IEFycmF5LmZyb20oXywgbnVtYmVyKSwgcmVzY2FsZSgpKSA6IGRvbWFpbi5zbGljZSgpO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhbmdlID0gQXJyYXkuZnJvbShfKSwgcmVzY2FsZSgpKSA6IHJhbmdlLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2VSb3VuZCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gcmFuZ2UgPSBBcnJheS5mcm9tKF8pLCBpbnRlcnBvbGF0ZSA9IGludGVycG9sYXRlUm91bmQsIHJlc2NhbGUoKTtcbiAgfTtcblxuICBzY2FsZS5jbGFtcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChjbGFtcCA9IF8gPyB0cnVlIDogaWRlbnRpdHksIHJlc2NhbGUoKSkgOiBjbGFtcCAhPT0gaWRlbnRpdHk7XG4gIH07XG5cbiAgc2NhbGUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaW50ZXJwb2xhdGUgPSBfLCByZXNjYWxlKCkpIDogaW50ZXJwb2xhdGU7XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24odCwgdSkge1xuICAgIHRyYW5zZm9ybSA9IHQsIHVudHJhbnNmb3JtID0gdTtcbiAgICByZXR1cm4gcmVzY2FsZSgpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb250aW51b3VzKCkge1xuICByZXR1cm4gdHJhbnNmb3JtZXIoKShpZGVudGl0eSwgaWRlbnRpdHkpO1xufVxuIiwgImltcG9ydCB7dGlja1N0ZXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtmb3JtYXQsIGZvcm1hdFByZWZpeCwgZm9ybWF0U3BlY2lmaWVyLCBwcmVjaXNpb25GaXhlZCwgcHJlY2lzaW9uUHJlZml4LCBwcmVjaXNpb25Sb3VuZH0gZnJvbSBcImQzLWZvcm1hdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrRm9ybWF0KHN0YXJ0LCBzdG9wLCBjb3VudCwgc3BlY2lmaWVyKSB7XG4gIHZhciBzdGVwID0gdGlja1N0ZXAoc3RhcnQsIHN0b3AsIGNvdW50KSxcbiAgICAgIHByZWNpc2lvbjtcbiAgc3BlY2lmaWVyID0gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllciA9PSBudWxsID8gXCIsZlwiIDogc3BlY2lmaWVyKTtcbiAgc3dpdGNoIChzcGVjaWZpZXIudHlwZSkge1xuICAgIGNhc2UgXCJzXCI6IHtcbiAgICAgIHZhciB2YWx1ZSA9IE1hdGgubWF4KE1hdGguYWJzKHN0YXJ0KSwgTWF0aC5hYnMoc3RvcCkpO1xuICAgICAgaWYgKHNwZWNpZmllci5wcmVjaXNpb24gPT0gbnVsbCAmJiAhaXNOYU4ocHJlY2lzaW9uID0gcHJlY2lzaW9uUHJlZml4KHN0ZXAsIHZhbHVlKSkpIHNwZWNpZmllci5wcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgICByZXR1cm4gZm9ybWF0UHJlZml4KHNwZWNpZmllciwgdmFsdWUpO1xuICAgIH1cbiAgICBjYXNlIFwiXCI6XG4gICAgY2FzZSBcImVcIjpcbiAgICBjYXNlIFwiZ1wiOlxuICAgIGNhc2UgXCJwXCI6XG4gICAgY2FzZSBcInJcIjoge1xuICAgICAgaWYgKHNwZWNpZmllci5wcmVjaXNpb24gPT0gbnVsbCAmJiAhaXNOYU4ocHJlY2lzaW9uID0gcHJlY2lzaW9uUm91bmQoc3RlcCwgTWF0aC5tYXgoTWF0aC5hYnMoc3RhcnQpLCBNYXRoLmFicyhzdG9wKSkpKSkgc3BlY2lmaWVyLnByZWNpc2lvbiA9IHByZWNpc2lvbiAtIChzcGVjaWZpZXIudHlwZSA9PT0gXCJlXCIpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgXCJmXCI6XG4gICAgY2FzZSBcIiVcIjoge1xuICAgICAgaWYgKHNwZWNpZmllci5wcmVjaXNpb24gPT0gbnVsbCAmJiAhaXNOYU4ocHJlY2lzaW9uID0gcHJlY2lzaW9uRml4ZWQoc3RlcCkpKSBzcGVjaWZpZXIucHJlY2lzaW9uID0gcHJlY2lzaW9uIC0gKHNwZWNpZmllci50eXBlID09PSBcIiVcIikgKiAyO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBmb3JtYXQoc3BlY2lmaWVyKTtcbn1cbiIsICJpbXBvcnQge3RpY2tzLCB0aWNrSW5jcmVtZW50fSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCBjb250aW51b3VzLCB7Y29weX0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcbmltcG9ydCB0aWNrRm9ybWF0IGZyb20gXCIuL3RpY2tGb3JtYXQuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhcmlzaChzY2FsZSkge1xuICB2YXIgZG9tYWluID0gc2NhbGUuZG9tYWluO1xuXG4gIHNjYWxlLnRpY2tzID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHJldHVybiB0aWNrcyhkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGNvdW50ID09IG51bGwgPyAxMCA6IGNvdW50KTtcbiAgfTtcblxuICBzY2FsZS50aWNrRm9ybWF0ID0gZnVuY3Rpb24oY291bnQsIHNwZWNpZmllcikge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgcmV0dXJuIHRpY2tGb3JtYXQoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBjb3VudCA9PSBudWxsID8gMTAgOiBjb3VudCwgc3BlY2lmaWVyKTtcbiAgfTtcblxuICBzY2FsZS5uaWNlID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICBpZiAoY291bnQgPT0gbnVsbCkgY291bnQgPSAxMDtcblxuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgdmFyIGkwID0gMDtcbiAgICB2YXIgaTEgPSBkLmxlbmd0aCAtIDE7XG4gICAgdmFyIHN0YXJ0ID0gZFtpMF07XG4gICAgdmFyIHN0b3AgPSBkW2kxXTtcbiAgICB2YXIgcHJlc3RlcDtcbiAgICB2YXIgc3RlcDtcbiAgICB2YXIgbWF4SXRlciA9IDEwO1xuXG4gICAgaWYgKHN0b3AgPCBzdGFydCkge1xuICAgICAgc3RlcCA9IHN0YXJ0LCBzdGFydCA9IHN0b3AsIHN0b3AgPSBzdGVwO1xuICAgICAgc3RlcCA9IGkwLCBpMCA9IGkxLCBpMSA9IHN0ZXA7XG4gICAgfVxuICAgIFxuICAgIHdoaWxlIChtYXhJdGVyLS0gPiAwKSB7XG4gICAgICBzdGVwID0gdGlja0luY3JlbWVudChzdGFydCwgc3RvcCwgY291bnQpO1xuICAgICAgaWYgKHN0ZXAgPT09IHByZXN0ZXApIHtcbiAgICAgICAgZFtpMF0gPSBzdGFydFxuICAgICAgICBkW2kxXSA9IHN0b3BcbiAgICAgICAgcmV0dXJuIGRvbWFpbihkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RlcCA+IDApIHtcbiAgICAgICAgc3RhcnQgPSBNYXRoLmZsb29yKHN0YXJ0IC8gc3RlcCkgKiBzdGVwO1xuICAgICAgICBzdG9wID0gTWF0aC5jZWlsKHN0b3AgLyBzdGVwKSAqIHN0ZXA7XG4gICAgICB9IGVsc2UgaWYgKHN0ZXAgPCAwKSB7XG4gICAgICAgIHN0YXJ0ID0gTWF0aC5jZWlsKHN0YXJ0ICogc3RlcCkgLyBzdGVwO1xuICAgICAgICBzdG9wID0gTWF0aC5mbG9vcihzdG9wICogc3RlcCkgLyBzdGVwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBwcmVzdGVwID0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2NhbGU7XG4gIH07XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsaW5lYXIoKSB7XG4gIHZhciBzY2FsZSA9IGNvbnRpbnVvdXMoKTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvcHkoc2NhbGUsIGxpbmVhcigpKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIGxpbmVhcmlzaChzY2FsZSk7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZm9ybShrLCB4LCB5KSB7XG4gIHRoaXMuayA9IGs7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm0sXG4gIHNjYWxlOiBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIGsgPT09IDEgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmsgKiBrLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB4ID09PSAwICYgeSA9PT0gMCA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuaywgdGhpcy54ICsgdGhpcy5rICogeCwgdGhpcy55ICsgdGhpcy5rICogeSk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBbcG9pbnRbMF0gKiB0aGlzLmsgKyB0aGlzLngsIHBvaW50WzFdICogdGhpcy5rICsgdGhpcy55XTtcbiAgfSxcbiAgYXBwbHlYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLmsgKyB0aGlzLng7XG4gIH0sXG4gIGFwcGx5WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5rICsgdGhpcy55O1xuICB9LFxuICBpbnZlcnQ6IGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIFsobG9jYXRpb25bMF0gLSB0aGlzLngpIC8gdGhpcy5rLCAobG9jYXRpb25bMV0gLSB0aGlzLnkpIC8gdGhpcy5rXTtcbiAgfSxcbiAgaW52ZXJ0WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAtIHRoaXMueCkgLyB0aGlzLms7XG4gIH0sXG4gIGludmVydFk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gKHkgLSB0aGlzLnkpIC8gdGhpcy5rO1xuICB9LFxuICByZXNjYWxlWDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4LmNvcHkoKS5kb21haW4oeC5yYW5nZSgpLm1hcCh0aGlzLmludmVydFgsIHRoaXMpLm1hcCh4LmludmVydCwgeCkpO1xuICB9LFxuICByZXNjYWxlWTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5LmNvcHkoKS5kb21haW4oeS5yYW5nZSgpLm1hcCh0aGlzLmludmVydFksIHRoaXMpLm1hcCh5LmludmVydCwgeSkpO1xuICB9LFxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnkgKyBcIikgc2NhbGUoXCIgKyB0aGlzLmsgKyBcIilcIjtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IG5ldyBUcmFuc2Zvcm0oMSwgMCwgMCk7XG5cbnRyYW5zZm9ybS5wcm90b3R5cGUgPSBUcmFuc2Zvcm0ucHJvdG90eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2Zvcm0obm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX196b29tKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuIGlkZW50aXR5O1xuICByZXR1cm4gbm9kZS5fX3pvb207XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBkYXRhIGxvYWRlclxuLy8gTG9hZHMgSlNPTiBhbmQgdGV4dCBlaXRoZXIgZnJvbSBhbiBpbmxpbmVkIDxzY3JpcHQgdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIiBkYXRhLXBhdGg9XCJcdTIwMjZcIj4gYmxvY2tcbi8vICh0aGUgb2ZmbGluZSBzaW5nbGUtZmlsZSBidWlsZCkgb3IgYnkgZmV0Y2hpbmcgaXQgcmVsYXRpdmUgdG8gdGhlIHBhZ2UgKEdpdEh1YiBQYWdlcyAvIGRldiBzZXJ2ZXIpLlxuXG5jb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblxuZnVuY3Rpb24gaW5saW5lZChwYXRoKSB7XG4gIGNvbnN0IHNlbCA9IGBzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIl1bZGF0YS1wYXRoPVwiJHtDU1MuZXNjYXBlKHBhdGgpfVwiXWA7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuICByZXR1cm4gZWwgPyBlbC50ZXh0Q29udGVudCA6IG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dChwYXRoKSB7XG4gIGNvbnN0IGlubCA9IGlubGluZWQocGF0aCk7XG4gIGlmIChpbmwgIT09IG51bGwpIHJldHVybiBpbmw7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHBhdGgpO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgbG9hZCAke3BhdGh9IChIVFRQICR7cmVzLnN0YXR1c30pYCk7XG4gIHJldHVybiByZXMudGV4dCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEpTT04ocGF0aCkge1xuICBpZiAoIWNhY2hlLmhhcyhwYXRoKSkgY2FjaGUuc2V0KHBhdGgsIGxvYWRUZXh0KHBhdGgpLnRoZW4oKHQpID0+IEpTT04ucGFyc2UodCkpKTtcbiAgcmV0dXJuIGNhY2hlLmdldChwYXRoKTtcbn1cblxuLy8gVVJMIGZvciBhbiBhc3NldCAoaW1hZ2UpLiBUaGUgb2ZmbGluZSBidWlsZCByZWdpc3RlcnMgZGF0YTogVVJMcyBpbiB3aW5kb3cuX19QQVJDSE1FTlRfQVNTRVRTX18uXG5leHBvcnQgZnVuY3Rpb24gYXNzZXRVUkwocGF0aCkge1xuICBjb25zdCBhc3NldHMgPSBnbG9iYWxUaGlzLl9fUEFSQ0hNRU5UX0FTU0VUU19fO1xuICByZXR1cm4gKGFzc2V0cyAmJiBhc3NldHNbcGF0aF0pIHx8IHBhdGg7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4geDtcbn1cbiIsICJpbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNmb3JtKSB7XG4gIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICB2YXIgeDAsXG4gICAgICB5MCxcbiAgICAgIGt4ID0gdHJhbnNmb3JtLnNjYWxlWzBdLFxuICAgICAga3kgPSB0cmFuc2Zvcm0uc2NhbGVbMV0sXG4gICAgICBkeCA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMF0sXG4gICAgICBkeSA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCwgaSkge1xuICAgIGlmICghaSkgeDAgPSB5MCA9IDA7XG4gICAgdmFyIGogPSAyLCBuID0gaW5wdXQubGVuZ3RoLCBvdXRwdXQgPSBuZXcgQXJyYXkobik7XG4gICAgb3V0cHV0WzBdID0gKHgwICs9IGlucHV0WzBdKSAqIGt4ICsgZHg7XG4gICAgb3V0cHV0WzFdID0gKHkwICs9IGlucHV0WzFdKSAqIGt5ICsgZHk7XG4gICAgd2hpbGUgKGogPCBuKSBvdXRwdXRbal0gPSBpbnB1dFtqXSwgKytqO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYXJyYXksIG4pIHtcbiAgdmFyIHQsIGogPSBhcnJheS5sZW5ndGgsIGkgPSBqIC0gbjtcbiAgd2hpbGUgKGkgPCAtLWopIHQgPSBhcnJheVtpXSwgYXJyYXlbaSsrXSA9IGFycmF5W2pdLCBhcnJheVtqXSA9IHQ7XG59XG4iLCAiaW1wb3J0IHJldmVyc2UgZnJvbSBcIi4vcmV2ZXJzZS5qc1wiO1xuaW1wb3J0IHRyYW5zZm9ybSBmcm9tIFwiLi90cmFuc2Zvcm0uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odG9wb2xvZ3ksIG8pIHtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSBvID0gdG9wb2xvZ3kub2JqZWN0c1tvXTtcbiAgcmV0dXJuIG8udHlwZSA9PT0gXCJHZW9tZXRyeUNvbGxlY3Rpb25cIlxuICAgICAgPyB7dHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLCBmZWF0dXJlczogby5nZW9tZXRyaWVzLm1hcChmdW5jdGlvbihvKSB7IHJldHVybiBmZWF0dXJlKHRvcG9sb2d5LCBvKTsgfSl9XG4gICAgICA6IGZlYXR1cmUodG9wb2xvZ3ksIG8pO1xufVxuXG5mdW5jdGlvbiBmZWF0dXJlKHRvcG9sb2d5LCBvKSB7XG4gIHZhciBpZCA9IG8uaWQsXG4gICAgICBiYm94ID0gby5iYm94LFxuICAgICAgcHJvcGVydGllcyA9IG8ucHJvcGVydGllcyA9PSBudWxsID8ge30gOiBvLnByb3BlcnRpZXMsXG4gICAgICBnZW9tZXRyeSA9IG9iamVjdCh0b3BvbG9neSwgbyk7XG4gIHJldHVybiBpZCA9PSBudWxsICYmIGJib3ggPT0gbnVsbCA/IHt0eXBlOiBcIkZlYXR1cmVcIiwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fVxuICAgICAgOiBiYm94ID09IG51bGwgPyB7dHlwZTogXCJGZWF0dXJlXCIsIGlkOiBpZCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fVxuICAgICAgOiB7dHlwZTogXCJGZWF0dXJlXCIsIGlkOiBpZCwgYmJveDogYmJveCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdCh0b3BvbG9neSwgbykge1xuICB2YXIgdHJhbnNmb3JtUG9pbnQgPSB0cmFuc2Zvcm0odG9wb2xvZ3kudHJhbnNmb3JtKSxcbiAgICAgIGFyY3MgPSB0b3BvbG9neS5hcmNzO1xuXG4gIGZ1bmN0aW9uIGFyYyhpLCBwb2ludHMpIHtcbiAgICBpZiAocG9pbnRzLmxlbmd0aCkgcG9pbnRzLnBvcCgpO1xuICAgIGZvciAodmFyIGEgPSBhcmNzW2kgPCAwID8gfmkgOiBpXSwgayA9IDAsIG4gPSBhLmxlbmd0aDsgayA8IG47ICsraykge1xuICAgICAgcG9pbnRzLnB1c2godHJhbnNmb3JtUG9pbnQoYVtrXSwgaykpO1xuICAgIH1cbiAgICBpZiAoaSA8IDApIHJldmVyc2UocG9pbnRzLCBuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvaW50KHApIHtcbiAgICByZXR1cm4gdHJhbnNmb3JtUG9pbnQocCk7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lKGFyY3MpIHtcbiAgICB2YXIgcG9pbnRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmNzLmxlbmd0aDsgaSA8IG47ICsraSkgYXJjKGFyY3NbaV0sIHBvaW50cyk7XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPCAyKSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gcGVyIHRoZSBzcGVjaWZpY2F0aW9uLlxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cblxuICBmdW5jdGlvbiByaW5nKGFyY3MpIHtcbiAgICB2YXIgcG9pbnRzID0gbGluZShhcmNzKTtcbiAgICB3aGlsZSAocG9pbnRzLmxlbmd0aCA8IDQpIHBvaW50cy5wdXNoKHBvaW50c1swXSk7IC8vIFRoaXMgbWF5IGhhcHBlbiBpZiBhbiBhcmMgaGFzIG9ubHkgdHdvIHBvaW50cy5cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9seWdvbihhcmNzKSB7XG4gICAgcmV0dXJuIGFyY3MubWFwKHJpbmcpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VvbWV0cnkobykge1xuICAgIHZhciB0eXBlID0gby50eXBlLCBjb29yZGluYXRlcztcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJHZW9tZXRyeUNvbGxlY3Rpb25cIjogcmV0dXJuIHt0eXBlOiB0eXBlLCBnZW9tZXRyaWVzOiBvLmdlb21ldHJpZXMubWFwKGdlb21ldHJ5KX07XG4gICAgICBjYXNlIFwiUG9pbnRcIjogY29vcmRpbmF0ZXMgPSBwb2ludChvLmNvb3JkaW5hdGVzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2ludFwiOiBjb29yZGluYXRlcyA9IG8uY29vcmRpbmF0ZXMubWFwKHBvaW50KTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTGluZVN0cmluZ1wiOiBjb29yZGluYXRlcyA9IGxpbmUoby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlMaW5lU3RyaW5nXCI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChsaW5lKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiUG9seWdvblwiOiBjb29yZGluYXRlcyA9IHBvbHlnb24oby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2x5Z29uXCI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChwb2x5Z29uKTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9O1xuICB9XG5cbiAgcmV0dXJuIGdlb21ldHJ5KG8pO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRvcG9sb2d5LCBhcmNzKSB7XG4gIHZhciBzdGl0Y2hlZEFyY3MgPSB7fSxcbiAgICAgIGZyYWdtZW50QnlTdGFydCA9IHt9LFxuICAgICAgZnJhZ21lbnRCeUVuZCA9IHt9LFxuICAgICAgZnJhZ21lbnRzID0gW10sXG4gICAgICBlbXB0eUluZGV4ID0gLTE7XG5cbiAgLy8gU3RpdGNoIGVtcHR5IGFyY3MgZmlyc3QsIHNpbmNlIHRoZXkgbWF5IGJlIHN1YnN1bWVkIGJ5IG90aGVyIGFyY3MuXG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpLCBqKSB7XG4gICAgdmFyIGFyYyA9IHRvcG9sb2d5LmFyY3NbaSA8IDAgPyB+aSA6IGldLCB0O1xuICAgIGlmIChhcmMubGVuZ3RoIDwgMyAmJiAhYXJjWzFdWzBdICYmICFhcmNbMV1bMV0pIHtcbiAgICAgIHQgPSBhcmNzWysrZW1wdHlJbmRleF0sIGFyY3NbZW1wdHlJbmRleF0gPSBpLCBhcmNzW2pdID0gdDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpKSB7XG4gICAgdmFyIGUgPSBlbmRzKGkpLFxuICAgICAgICBzdGFydCA9IGVbMF0sXG4gICAgICAgIGVuZCA9IGVbMV0sXG4gICAgICAgIGYsIGc7XG5cbiAgICBpZiAoZiA9IGZyYWdtZW50QnlFbmRbc3RhcnRdKSB7XG4gICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtmLmVuZF07XG4gICAgICBmLnB1c2goaSk7XG4gICAgICBmLmVuZCA9IGVuZDtcbiAgICAgIGlmIChnID0gZnJhZ21lbnRCeVN0YXJ0W2VuZF0pIHtcbiAgICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtnLnN0YXJ0XTtcbiAgICAgICAgdmFyIGZnID0gZyA9PT0gZiA/IGYgOiBmLmNvbmNhdChnKTtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W2ZnLnN0YXJ0ID0gZi5zdGFydF0gPSBmcmFnbWVudEJ5RW5kW2ZnLmVuZCA9IGcuZW5kXSA9IGZnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmLmVuZF0gPSBmO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZiA9IGZyYWdtZW50QnlTdGFydFtlbmRdKSB7XG4gICAgICBkZWxldGUgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdO1xuICAgICAgZi51bnNoaWZ0KGkpO1xuICAgICAgZi5zdGFydCA9IHN0YXJ0O1xuICAgICAgaWYgKGcgPSBmcmFnbWVudEJ5RW5kW3N0YXJ0XSkge1xuICAgICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtnLmVuZF07XG4gICAgICAgIHZhciBnZiA9IGcgPT09IGYgPyBmIDogZy5jb25jYXQoZik7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtnZi5zdGFydCA9IGcuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtnZi5lbmQgPSBmLmVuZF0gPSBnZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmRdID0gZjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZiA9IFtpXTtcbiAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0ID0gc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmLmVuZCA9IGVuZF0gPSBmO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gZW5kcyhpKSB7XG4gICAgdmFyIGFyYyA9IHRvcG9sb2d5LmFyY3NbaSA8IDAgPyB+aSA6IGldLCBwMCA9IGFyY1swXSwgcDE7XG4gICAgaWYgKHRvcG9sb2d5LnRyYW5zZm9ybSkgcDEgPSBbMCwgMF0sIGFyYy5mb3JFYWNoKGZ1bmN0aW9uKGRwKSB7IHAxWzBdICs9IGRwWzBdLCBwMVsxXSArPSBkcFsxXTsgfSk7XG4gICAgZWxzZSBwMSA9IGFyY1thcmMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIGkgPCAwID8gW3AxLCBwMF0gOiBbcDAsIHAxXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKGZyYWdtZW50QnlFbmQsIGZyYWdtZW50QnlTdGFydCkge1xuICAgIGZvciAodmFyIGsgaW4gZnJhZ21lbnRCeUVuZCkge1xuICAgICAgdmFyIGYgPSBmcmFnbWVudEJ5RW5kW2tdO1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XTtcbiAgICAgIGRlbGV0ZSBmLnN0YXJ0O1xuICAgICAgZGVsZXRlIGYuZW5kO1xuICAgICAgZi5mb3JFYWNoKGZ1bmN0aW9uKGkpIHsgc3RpdGNoZWRBcmNzW2kgPCAwID8gfmkgOiBpXSA9IDE7IH0pO1xuICAgICAgZnJhZ21lbnRzLnB1c2goZik7XG4gICAgfVxuICB9XG5cbiAgZmx1c2goZnJhZ21lbnRCeUVuZCwgZnJhZ21lbnRCeVN0YXJ0KTtcbiAgZmx1c2goZnJhZ21lbnRCeVN0YXJ0LCBmcmFnbWVudEJ5RW5kKTtcbiAgYXJjcy5mb3JFYWNoKGZ1bmN0aW9uKGkpIHsgaWYgKCFzdGl0Y2hlZEFyY3NbaSA8IDAgPyB+aSA6IGldKSBmcmFnbWVudHMucHVzaChbaV0pOyB9KTtcblxuICByZXR1cm4gZnJhZ21lbnRzO1xufVxuIiwgImltcG9ydCB7b2JqZWN0fSBmcm9tIFwiLi9mZWF0dXJlLmpzXCI7XG5pbXBvcnQgc3RpdGNoIGZyb20gXCIuL3N0aXRjaC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0b3BvbG9neSkge1xuICByZXR1cm4gb2JqZWN0KHRvcG9sb2d5LCBtZXNoQXJjcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc2hBcmNzKHRvcG9sb2d5LCBvYmplY3QsIGZpbHRlcikge1xuICB2YXIgYXJjcywgaSwgbjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcmNzID0gZXh0cmFjdEFyY3ModG9wb2xvZ3ksIG9iamVjdCwgZmlsdGVyKTtcbiAgZWxzZSBmb3IgKGkgPSAwLCBhcmNzID0gbmV3IEFycmF5KG4gPSB0b3BvbG9neS5hcmNzLmxlbmd0aCk7IGkgPCBuOyArK2kpIGFyY3NbaV0gPSBpO1xuICByZXR1cm4ge3R5cGU6IFwiTXVsdGlMaW5lU3RyaW5nXCIsIGFyY3M6IHN0aXRjaCh0b3BvbG9neSwgYXJjcyl9O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0QXJjcyh0b3BvbG9neSwgb2JqZWN0LCBmaWx0ZXIpIHtcbiAgdmFyIGFyY3MgPSBbXSxcbiAgICAgIGdlb21zQnlBcmMgPSBbXSxcbiAgICAgIGdlb207XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDAoaSkge1xuICAgIHZhciBqID0gaSA8IDAgPyB+aSA6IGk7XG4gICAgKGdlb21zQnlBcmNbal0gfHwgKGdlb21zQnlBcmNbal0gPSBbXSkpLnB1c2goe2k6IGksIGc6IGdlb219KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3QxKGFyY3MpIHtcbiAgICBhcmNzLmZvckVhY2goZXh0cmFjdDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDIoYXJjcykge1xuICAgIGFyY3MuZm9yRWFjaChleHRyYWN0MSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0MyhhcmNzKSB7XG4gICAgYXJjcy5mb3JFYWNoKGV4dHJhY3QyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlb21ldHJ5KG8pIHtcbiAgICBzd2l0Y2ggKGdlb20gPSBvLCBvLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJHZW9tZXRyeUNvbGxlY3Rpb25cIjogby5nZW9tZXRyaWVzLmZvckVhY2goZ2VvbWV0cnkpOyBicmVhaztcbiAgICAgIGNhc2UgXCJMaW5lU3RyaW5nXCI6IGV4dHJhY3QxKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpTGluZVN0cmluZ1wiOiBjYXNlIFwiUG9seWdvblwiOiBleHRyYWN0MihvLmFyY3MpOyBicmVhaztcbiAgICAgIGNhc2UgXCJNdWx0aVBvbHlnb25cIjogZXh0cmFjdDMoby5hcmNzKTsgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZ2VvbWV0cnkob2JqZWN0KTtcblxuICBnZW9tc0J5QXJjLmZvckVhY2goZmlsdGVyID09IG51bGxcbiAgICAgID8gZnVuY3Rpb24oZ2VvbXMpIHsgYXJjcy5wdXNoKGdlb21zWzBdLmkpOyB9XG4gICAgICA6IGZ1bmN0aW9uKGdlb21zKSB7IGlmIChmaWx0ZXIoZ2VvbXNbMF0uZywgZ2VvbXNbZ2VvbXMubGVuZ3RoIC0gMV0uZykpIGFyY3MucHVzaChnZW9tc1swXS5pKTsgfSk7XG5cbiAgcmV0dXJuIGFyY3M7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBwYXBlclxuLy8gUHJvY2VkdXJhbCBwYXJjaG1lbnQgZ3JvdW5kOiBmaWJyZSBhbmQgZ3JhaW4gZnJvbSBTVkcgdHVyYnVsZW5jZSAobm8gc3RvY2sgdGV4dHVyZXMpLCBwbHVzIGEgc29mdCB2aWduZXR0ZS5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcGVyRGVmcyhkZWZzKSB7XG4gIGNvbnN0IGdyYWluID0gZGVmcy5hcHBlbmQoJ2ZpbHRlcicpLmF0dHIoJ2lkJywgJ3BhcGVyLWdyYWluJylcbiAgICAuYXR0cigneCcsICcwJScpLmF0dHIoJ3knLCAnMCUnKS5hdHRyKCd3aWR0aCcsICcxMDAlJykuYXR0cignaGVpZ2h0JywgJzEwMCUnKVxuICAgIC5hdHRyKCdjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnMnLCAnc1JHQicpO1xuICAvLyBmaW5lIGdyYWluXG4gIGdyYWluLmFwcGVuZCgnZmVUdXJidWxlbmNlJykuYXR0cigndHlwZScsICdmcmFjdGFsTm9pc2UnKS5hdHRyKCdiYXNlRnJlcXVlbmN5JywgJzAuOScpLmF0dHIoJ251bU9jdGF2ZXMnLCAyKS5hdHRyKCdzZWVkJywgMTEpLmF0dHIoJ3N0aXRjaFRpbGVzJywgJ3N0aXRjaCcpLmF0dHIoJ3Jlc3VsdCcsICdmaW5lJyk7XG4gIC8vIGZhaW50LCBsb25nIGZpYnJlcyAoZ2VudGxlOiBwYXJjaG1lbnQsIG5vdCB3b29kKVxuICBncmFpbi5hcHBlbmQoJ2ZlVHVyYnVsZW5jZScpLmF0dHIoJ3R5cGUnLCAnZnJhY3RhbE5vaXNlJykuYXR0cignYmFzZUZyZXF1ZW5jeScsICcwLjAwNiAwLjA1JykuYXR0cignbnVtT2N0YXZlcycsIDIpLmF0dHIoJ3NlZWQnLCA0KS5hdHRyKCdzdGl0Y2hUaWxlcycsICdzdGl0Y2gnKS5hdHRyKCdyZXN1bHQnLCAnZmlicmUnKTtcbiAgZ3JhaW4uYXBwZW5kKCdmZUJsZW5kJykuYXR0cignaW4nLCAnZmluZScpLmF0dHIoJ2luMicsICdmaWJyZScpLmF0dHIoJ21vZGUnLCAnc2NyZWVuJykuYXR0cigncmVzdWx0JywgJ25vaXNlJyk7XG4gIGdyYWluLmFwcGVuZCgnZmVDb2xvck1hdHJpeCcpLmF0dHIoJ2luJywgJ25vaXNlJykuYXR0cigndHlwZScsICdzYXR1cmF0ZScpLmF0dHIoJ3ZhbHVlcycsICcwJykuYXR0cigncmVzdWx0JywgJ2dyYXknKTtcbiAgLy8gbGlmdCB0aGUgZ3JheSBjbG9zZSB0byB3aGl0ZSBzbyB0aGUgbXVsdGlwbHkgb25seSBkYXJrZW5zIGEgZmV3IHBlcmNlbnQsIGFuZCBmbGF0dGVuIGFscGhhXG4gIGNvbnN0IGN0ID0gZ3JhaW4uYXBwZW5kKCdmZUNvbXBvbmVudFRyYW5zZmVyJykuYXR0cignaW4nLCAnZ3JheScpLmF0dHIoJ3Jlc3VsdCcsICd0ZXgnKTtcbiAgY3QuYXBwZW5kKCdmZUZ1bmNSJykuYXR0cigndHlwZScsICdsaW5lYXInKS5hdHRyKCdzbG9wZScsIDAuMjIpLmF0dHIoJ2ludGVyY2VwdCcsIDAuOCk7XG4gIGN0LmFwcGVuZCgnZmVGdW5jRycpLmF0dHIoJ3R5cGUnLCAnbGluZWFyJykuYXR0cignc2xvcGUnLCAwLjIyKS5hdHRyKCdpbnRlcmNlcHQnLCAwLjgpO1xuICBjdC5hcHBlbmQoJ2ZlRnVuY0InKS5hdHRyKCd0eXBlJywgJ2xpbmVhcicpLmF0dHIoJ3Nsb3BlJywgMC4yMikuYXR0cignaW50ZXJjZXB0JywgMC44KTtcbiAgY3QuYXBwZW5kKCdmZUZ1bmNBJykuYXR0cigndHlwZScsICd0YWJsZScpLmF0dHIoJ3RhYmxlVmFsdWVzJywgJzEgMScpO1xuICBncmFpbi5hcHBlbmQoJ2ZlQmxlbmQnKS5hdHRyKCdpbicsICdTb3VyY2VHcmFwaGljJykuYXR0cignaW4yJywgJ3RleCcpLmF0dHIoJ21vZGUnLCAnbXVsdGlwbHknKTtcblxuICBjb25zdCB2aWduZXR0ZSA9IGRlZnMuYXBwZW5kKCdyYWRpYWxHcmFkaWVudCcpLmF0dHIoJ2lkJywgJ3BhcGVyLXZpZ25ldHRlJykuYXR0cignY3gnLCAnNTAlJykuYXR0cignY3knLCAnNTAlJykuYXR0cigncicsICc3MiUnKTtcbiAgdmlnbmV0dGUuYXBwZW5kKCdzdG9wJykuYXR0cignb2Zmc2V0JywgJzU1JScpLmF0dHIoJ3N0b3AtY29sb3InLCAnIzAwMCcpLmF0dHIoJ3N0b3Atb3BhY2l0eScsIDApO1xuICB2aWduZXR0ZS5hcHBlbmQoJ3N0b3AnKS5hdHRyKCdvZmZzZXQnLCAnMTAwJScpLmF0dHIoJ3N0b3AtY29sb3InLCAnIzRhM2ExYycpLmF0dHIoJ3N0b3Atb3BhY2l0eScsIDAuMjIpO1xufVxuXG4vLyBUaGUgcGFwZXIgaXRzZWxmOiBmdWxsLWJsZWVkIHBhcmNobWVudCB3aXRoIGdyYWluLlxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdQYXBlcihyb290LCBXLCBIKSB7XG4gIHJvb3QuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAncGFwZXInKS5hdHRyKCd3aWR0aCcsIFcpLmF0dHIoJ2hlaWdodCcsIEgpLmF0dHIoJ2ZpbHRlcicsICd1cmwoI3BhcGVyLWdyYWluKScpO1xufVxuXG4vLyBHcmFpbiBhbmQgdmlnbmV0dGUgbGFpZCBvdmVyIHRoZSBmaW5pc2hlZCBtYXAgc28gbGFuZCBhbmQgc2VhIHNoYXJlIHRoZSBzaGVldC5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3UGFwZXJPdmVybGF5KHJvb3QsIFcsIEgpIHtcbiAgcm9vdC5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdwYXBlci1vdmVybGF5JykuYXR0cignd2lkdGgnLCBXKS5hdHRyKCdoZWlnaHQnLCBIKS5hdHRyKCdmaWx0ZXInLCAndXJsKCNwYXBlci1ncmFpbiknKTtcbiAgcm9vdC5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdwYXBlci12aWduZXR0ZScpLmF0dHIoJ3dpZHRoJywgVykuYXR0cignaGVpZ2h0JywgSCkuYXR0cignZmlsbCcsICd1cmwoI3BhcGVyLXZpZ25ldHRlKScpO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgbGFiZWxzXG4vLyBTdGFnZSBsYWJlbHMgKHJlZ2lvbnMgaW4gc3BhY2VkIHNtYWxsIGNhcHMsIHdhdGVyIGluIGl0YWxpYykgc2V0IGFsb25nIHRoZWlyIHBhcmFsbGVsIHNvIHRoZXkgZm9sbG93IHRoZVxuLy8gcHJvamVjdGlvbidzIGN1cnZlOyBwb2xpdHkgbGFiZWxzIGZvciBoaWdobGlnaHRlZCBzdGF0ZXMgYXQgdGhlIGxhcmdlc3QgcG9seWdvbidzIGNlbnRyZS5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZHJhd1N0YWdlTGFiZWxzKGxheWVyLCBkZWZzLCBzdGFnZSwgcGF0aCkge1xuICAoc3RhZ2UubGFiZWxzID8/IFtdKS5mb3JFYWNoKChsLCBpKSA9PiB7XG4gICAgLy8gVGhlIGFyYyBpcyBvbmx5IGEgZ3VpZGUgZm9yIHRoZSB0ZXh0LCBzbyBpdCBjYW4gYmUgbXVjaCBsb25nZXIgdGhhbiB0aGUgbmFtZTsgYSBzaG9ydCBvbmUgY2xpcHMgdGhlIGVuZHMuXG4gICAgY29uc3Qgc3BhbiA9IGwuc3BhbiA/PyAobC5raW5kID09PSAnd2F0ZXInID8gNTAgOiA3MCk7XG4gICAgY29uc3QgYXJjID0geyB0eXBlOiAnTGluZVN0cmluZycsIGNvb3JkaW5hdGVzOiBkMy5yYW5nZShsLmxvbiAtIHNwYW4gLyAyLCBsLmxvbiArIHNwYW4gLyAyICsgMWUtNiwgMC41KS5tYXAoKHgpID0+IFt4LCBsLmxhdF0pIH07XG4gICAgY29uc3QgaWQgPSBgc3RhZ2UtbGFiZWwtJHtzdGFnZS5pZH0tJHtpfWA7XG4gICAgZGVmcy5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdpZCcsIGlkKS5hdHRyKCdkJywgcGF0aChhcmMpKTtcbiAgICBsYXllci5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsIGBsYWJlbCAke2wua2luZH1gKVxuICAgICAgLmFwcGVuZCgndGV4dFBhdGgnKS5hdHRyKCdocmVmJywgYCMke2lkfWApLmF0dHIoJ3N0YXJ0T2Zmc2V0JywgJzUwJScpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAudGV4dChsLnRleHQpO1xuICB9KTtcbn1cblxuLy8gTGFyZ2VzdCBwb2x5Z29uIG9mIGEgKE11bHRpKVBvbHlnb24gZmVhdHVyZSwgYnkgc3BoZXJpY2FsIGFyZWEuXG5mdW5jdGlvbiBsYXJnZXN0UG9seWdvbihmKSB7XG4gIGNvbnN0IGcgPSBmLmdlb21ldHJ5O1xuICBpZiAoZy50eXBlID09PSAnUG9seWdvbicpIHJldHVybiBnO1xuICBsZXQgYmVzdCA9IG51bGwsIGJlc3RBcmVhID0gLTE7XG4gIGZvciAoY29uc3QgY29vcmRzIG9mIGcuY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBwb2x5ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBjb29yZHMgfTtcbiAgICBjb25zdCBhID0gZDMuZ2VvQXJlYShwb2x5KTtcbiAgICBpZiAoYSA+IGJlc3RBcmVhKSB7IGJlc3RBcmVhID0gYTsgYmVzdCA9IHBvbHk7IH1cbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvbGl0eUxhYmVsRGF0YShmZWF0dXJlcywgcGF0aCkge1xuICAvLyBPbmUgbGFiZWwgcGVyIG5hbWU6IHNvbWUgYmFzZSBtYXBzIHNwbGl0IGEgc3RhdGUgaW50byBzZXZlcmFsIHNhbWUtbmFtZWQgcG9seWdvbnM7IGxhYmVsIHRoZSBsYXJnZXN0LlxuICBjb25zdCBiZXN0ID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGYgb2YgZmVhdHVyZXMpIHtcbiAgICBjb25zdCBwb2x5ID0gbGFyZ2VzdFBvbHlnb24oZik7XG4gICAgaWYgKCFwb2x5KSBjb250aW51ZTtcbiAgICBjb25zdCBbW2J4MCwgYnkwXSwgW2J4MSwgYnkxXV0gPSBwYXRoLmJvdW5kcyhwb2x5KTtcbiAgICBjb25zdCB3ID0gYngxIC0gYngwLCBoID0gYnkxIC0gYnkwO1xuICAgIGlmICghKHcgPiA3MCAmJiBoID4gMjQpKSBjb250aW51ZTsgLy8gdG9vIHNtYWxsIHRvIGNhcnJ5IGEgbmFtZSBhdCB0aGlzIHNjYWxlXG4gICAgY29uc3QgW2N4LCBjeV0gPSBwYXRoLmNlbnRyb2lkKHBvbHkpO1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGN4KSkgY29udGludWU7XG4gICAgY29uc3QgdGV4dCA9IGYucHJvcGVydGllcy5jbHM/LmxhYmVsID8/IGYucHJvcGVydGllcy5uYW1lO1xuICAgIGNvbnN0IGFyZWEgPSB3ICogaDtcbiAgICBjb25zdCBwcmV2ID0gYmVzdC5nZXQodGV4dCk7XG4gICAgaWYgKHByZXYgJiYgcHJldi5hcmVhID49IGFyZWEpIGNvbnRpbnVlO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCgxMywgTWF0aC5taW4oMjQsIE1hdGguc3FydChhcmVhKSAvIDE2KSk7XG4gICAgYmVzdC5zZXQodGV4dCwgeyBpZDogdGV4dCwgdGV4dCwgeDogY3gsIHk6IGN5LCBzaXplLCBhcmVhIH0pO1xuICB9XG4gIHJldHVybiBbLi4uYmVzdC52YWx1ZXMoKV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3UG9saXR5TGFiZWxzKGxheWVyLCBkYXRhKSB7XG4gIGxheWVyLnNlbGVjdEFsbCgndGV4dCcpLmRhdGEoZGF0YSwgKGQpID0+IGQuaWQpLmpvaW4oJ3RleHQnKVxuICAgIC5hdHRyKCdjbGFzcycsICdsYWJlbCBwb2xpdHknKVxuICAgIC5hdHRyKCd4JywgKGQpID0+IGQueCkuYXR0cigneScsIChkKSA9PiBkLnkpXG4gICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIChkKSA9PiBkLnNpemUpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpLmF0dHIoJ2RvbWluYW50LWJhc2VsaW5lJywgJ21pZGRsZScpXG4gICAgLnRleHQoKGQpID0+IGQudGV4dCk7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBjYXJ0b3VjaGVcbi8vIEJvdHRvbS1sZWZ0IGJyYWNrZXRlZCBib3g6IFBBUkNITUVOVCB3b3JkbWFyayBcdTAwQjcgbWFwIHRpdGxlIFx1MDBCNyB5ZWFyIHNob3duIFx1MDBCNyBzY2FsZSBiYXIuIE5vdGhpbmcgZWxzZS5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5mdW5jdGlvbiBzY2FsZUJhcihwcm9qZWN0aW9uLCBjZW50ZXIsIHRhcmdldFB4ID0gMTcwKSB7XG4gIGNvbnN0IFtsb24sIGxhdF0gPSBjZW50ZXI7XG4gIGNvbnN0IHAxID0gcHJvamVjdGlvbihbbG9uLCBsYXRdKSwgcDIgPSBwcm9qZWN0aW9uKFtsb24gKyAxLCBsYXRdKTtcbiAgaWYgKCFwMSB8fCAhcDIpIHJldHVybiB7IGttOiAxMDAwLCBweDogdGFyZ2V0UHggfTtcbiAgY29uc3Qga21QZXJEZWcgPSBkMy5nZW9EaXN0YW5jZShbbG9uLCBsYXRdLCBbbG9uICsgMSwgbGF0XSkgKiA2MzcxO1xuICBjb25zdCBweFBlckttID0gTWF0aC5oeXBvdChwMlswXSAtIHAxWzBdLCBwMlsxXSAtIHAxWzFdKSAvIGttUGVyRGVnO1xuICBjb25zdCBrbSA9IFsxMDAsIDIwMCwgMjUwLCA1MDAsIDEwMDAsIDIwMDAsIDMwMDAsIDUwMDBdLnJlZHVjZSgoYiwgaykgPT4gKE1hdGguYWJzKGsgKiBweFBlckttIC0gdGFyZ2V0UHgpIDwgTWF0aC5hYnMoYiAqIHB4UGVyS20gLSB0YXJnZXRQeCkgPyBrIDogYikpO1xuICByZXR1cm4geyBrbSwgcHg6IGttICogcHhQZXJLbSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FydG91Y2hlKHJvb3QsIHsgeDAsIHkxIH0sIHN0YWdlLCBwcm9qZWN0aW9uKSB7XG4gIGNvbnN0IFcgPSAzODAsIEggPSAxMjgsIFBBRCA9IDE2O1xuICBjb25zdCB4ID0geDAgKyAyMiwgeSA9IHkxIC0gMjIgLSBIO1xuICBjb25zdCBnID0gcm9vdC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdjYXJ0b3VjaGUnKS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgKTtcbiAgZy5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdjYXJ0b3VjaGUtYm94JykuYXR0cignd2lkdGgnLCBXKS5hdHRyKCdoZWlnaHQnLCBIKTtcbiAgLy8gY29ybmVyIGJyYWNrZXRzXG4gIGNvbnN0IGIgPSAxMiwgbyA9IDU7XG4gIGNvbnN0IGNvcm5lcnMgPSBbWy1vLCAtbywgMSwgMV0sIFtXICsgbywgLW8sIC0xLCAxXSwgWy1vLCBIICsgbywgMSwgLTFdLCBbVyArIG8sIEggKyBvLCAtMSwgLTFdXTtcbiAgZy5zZWxlY3RBbGwoJ3BhdGguYnJhY2tldCcpLmRhdGEoY29ybmVycykuam9pbigncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2JyYWNrZXQnKVxuICAgIC5hdHRyKCdkJywgKFtjeCwgY3ksIHN4LCBzeV0pID0+IGBNJHtjeCArIHN4ICogYn0sJHtjeX1MJHtjeH0sJHtjeX1MJHtjeH0sJHtjeSArIHN5ICogYn1gKTtcblxuICBnLmFwcGVuZCgndGV4dCcpLmF0dHIoJ2NsYXNzJywgJ3dvcmRtYXJrJykuYXR0cigneCcsIFBBRCkuYXR0cigneScsIFBBRCArIDEyKS50ZXh0KCdQQVJDSE1FTlQnKTtcbiAgZy5hcHBlbmQoJ2xpbmUnKS5hdHRyKCdjbGFzcycsICdydWxlJykuYXR0cigneDEnLCBQQUQpLmF0dHIoJ3gyJywgVyAtIFBBRCkuYXR0cigneTEnLCBQQUQgKyAyMCkuYXR0cigneTInLCBQQUQgKyAyMCk7XG4gIGNvbnN0IHRpdGxlID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICdtYXAtdGl0bGUnKS5hdHRyKCd4JywgUEFEKS5hdHRyKCd5JywgUEFEICsgNDYpLnRleHQoc3RhZ2UudGl0bGUpO1xuICBjb25zdCB5ZWFyID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICd5ZWFyJykuYXR0cigneCcsIFcgLSBQQUQpLmF0dHIoJ3knLCBQQUQgKyA0OCkuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJyk7XG4gIGNvbnN0IGJhc2VOb3RlID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICdiYXNlLW5vdGUnKS5hdHRyKCd4JywgVyAtIFBBRCkuYXR0cigneScsIFBBRCArIDY0KS5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKTtcblxuICAvLyBzY2FsZSBiYXJcbiAgY29uc3QgZSA9IHN0YWdlLmV4dGVudDtcbiAgY29uc3QgeyBrbSwgcHggfSA9IHNjYWxlQmFyKHByb2plY3Rpb24sIFsoZS53ZXN0ICsgZS5lYXN0KSAvIDIsIChlLnNvdXRoICsgZS5ub3J0aCkgLyAyXSk7XG4gIGNvbnN0IHNiID0gZy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzY2FsZWJhcicpLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHtQQUR9LCR7SCAtIFBBRCAtIDEwfSlgKTtcbiAgc2IuYXBwZW5kKCdsaW5lJykuYXR0cigneDEnLCAwKS5hdHRyKCd4MicsIHB4KS5hdHRyKCd5MScsIDApLmF0dHIoJ3kyJywgMCk7XG4gIHNiLnNlbGVjdEFsbCgnbGluZS50aWNrJykuZGF0YShbMCwgcHggLyAyLCBweF0pLmpvaW4oJ2xpbmUnKS5hdHRyKCdjbGFzcycsICd0aWNrJylcbiAgICAuYXR0cigneDEnLCAoZCkgPT4gZCkuYXR0cigneDInLCAoZCkgPT4gZCkuYXR0cigneTEnLCAtNSkuYXR0cigneTInLCAwKTtcbiAgc2IuYXBwZW5kKCdyZWN0JykuYXR0cigneCcsIDApLmF0dHIoJ3knLCAtMykuYXR0cignd2lkdGgnLCBweCAvIDIpLmF0dHIoJ2hlaWdodCcsIDMpO1xuICBzYi5hcHBlbmQoJ3RleHQnKS5hdHRyKCd4JywgcHggKyA4KS5hdHRyKCd5JywgMSkudGV4dChgJHtrbS50b0xvY2FsZVN0cmluZygnZW4tVVMnKX0ga21gKTtcblxuICByZXR1cm4ge1xuICAgIHNldFRpdGxlKHRleHQpIHsgdGl0bGUudGV4dCh0ZXh0KTsgfSxcbiAgICBzZXRZZWFyKHksIHNvdXJjZVllYXIpIHtcbiAgICAgIHllYXIuY2xhc3NlZCgncmFuZ2UnLCBmYWxzZSkudGV4dCh5IDwgMCA/IGAkey15fSBCQ0VgIDogeSk7XG4gICAgICBiYXNlTm90ZS50ZXh0KHNvdXJjZVllYXIgIT0gbnVsbCAmJiBzb3VyY2VZZWFyICE9PSB5ID8gYGJhc2UgbWFwICR7c291cmNlWWVhcn1gIDogJycpO1xuICAgIH0sXG4gICAgLy8gRGlmZjogXCIxNDUwIFx1MjE5MiAxNzUwXCIgd2l0aCB0aGUgYmFzZSBtYXBzIHRoYXQgc3Rvb2QgaW4gZm9yIGVpdGhlciB5ZWFyLlxuICAgIHNldFJhbmdlKGEsIGIpIHtcbiAgICAgIHllYXIuY2xhc3NlZCgncmFuZ2UnLCB0cnVlKS50ZXh0KGAke2EueWVhcn0gXHUyMTkyICR7Yi55ZWFyfWApO1xuICAgICAgY29uc3Qgbm90ZXMgPSBbXTtcbiAgICAgIGlmIChhLnNvdXJjZVllYXIgIT0gbnVsbCAmJiBhLnNvdXJjZVllYXIgIT09IGEueWVhcikgbm90ZXMucHVzaChgJHthLnllYXJ9IGZyb20gJHthLnNvdXJjZVllYXJ9YCk7XG4gICAgICBpZiAoYi5zb3VyY2VZZWFyICE9IG51bGwgJiYgYi5zb3VyY2VZZWFyICE9PSBiLnllYXIpIG5vdGVzLnB1c2goYCR7Yi55ZWFyfSBmcm9tICR7Yi5zb3VyY2VZZWFyfWApO1xuICAgICAgYmFzZU5vdGUudGV4dChub3Rlcy5sZW5ndGggPyBgYmFzZSBtYXBzOiAke25vdGVzLmpvaW4oJyBcdTAwQjcgJyl9YCA6ICcnKTtcbiAgICB9LFxuICB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgdGltZWxpbmUgc3RyaXBcbi8vIFRoZSBib3R0b20gZWRnZSBvZiB0aGUgZnJhbWU6IHRoZSBzdGFnZSdzIGZ1bGwgc3BhbiB3aXRoIHllYXIgdGlja3MsIHNuYXBzaG90IHllYXJzIGFzIGRvdHMsIHRoZSBzaG93biB5ZWFyIG1hcmtlZC5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RyaXAocm9vdCwgeyB4MCwgeDEsIHkxIH0sIHN0YWdlLCB5ZWFycywgb25ZZWFyKSB7XG4gIGNvbnN0IFthLCBiXSA9IHN0YWdlLnNwYW47XG4gIGNvbnN0IHggPSBkMy5zY2FsZUxpbmVhcigpLmRvbWFpbihbYSwgYl0pLnJhbmdlKFt4MCwgeDFdKTtcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc3RyaXAnKTtcblxuICBnLmFwcGVuZCgnbGluZScpLmF0dHIoJ2NsYXNzJywgJ2Jhc2VsaW5lJykuYXR0cigneDEnLCB4MCkuYXR0cigneDInLCB4MSkuYXR0cigneTEnLCB5MSkuYXR0cigneTInLCB5MSk7XG5cbiAgY29uc3QgbWlub3IgPSBkMy5yYW5nZShNYXRoLmNlaWwoYSAvIDUwKSAqIDUwLCBiICsgMSwgNTApO1xuICBnLnNlbGVjdEFsbCgnbGluZS50aWNrJykuZGF0YShtaW5vcikuam9pbignbGluZScpXG4gICAgLmF0dHIoJ2NsYXNzJywgKGQpID0+IGB0aWNrICR7ZCAlIDEwMCA9PT0gMCA/ICdtYWpvcicgOiAnbWlub3InfWApXG4gICAgLmF0dHIoJ3gxJywgKGQpID0+IHgoZCkpLmF0dHIoJ3gyJywgKGQpID0+IHgoZCkpLmF0dHIoJ3kxJywgeTEpLmF0dHIoJ3kyJywgKGQpID0+IHkxICsgKGQgJSAxMDAgPT09IDAgPyAxMCA6IDUpKTtcbiAgY29uc3QgdGlja0xhYmVscyA9IGcuc2VsZWN0QWxsKCd0ZXh0LnRpY2stbGFiZWwnKS5kYXRhKG1pbm9yLmZpbHRlcigoZCkgPT4gZCAlIDEwMCA9PT0gMCkpLmpvaW4oJ3RleHQnKVxuICAgIC5hdHRyKCdjbGFzcycsICd0aWNrLWxhYmVsJykuYXR0cigneCcsIChkKSA9PiB4KGQpKS5hdHRyKCd5JywgeTEgKyAyNikuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAudGV4dCgoZCkgPT4gKGQgPCAwID8gYCR7LWR9IEJDRWAgOiBkKSk7XG5cbiAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5zbmFwc2hvdCcpLmRhdGEoeWVhcnMpLmpvaW4oJ2NpcmNsZScpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3NuYXBzaG90JykuYXR0cignY3gnLCAoZCkgPT4geChkKSkuYXR0cignY3knLCB5MSkuYXR0cigncicsIDUpXG4gICAgLm9uKCdjbGljaycsIChfLCBkKSA9PiBvblllYXIgJiYgb25ZZWFyKGQpKVxuICAgIC5hcHBlbmQoJ3RpdGxlJykudGV4dCgoZCkgPT4gYFNob3cgJHtkfWApO1xuXG4gIC8vIERpZmYgcmFuZ2U6IGEgYm9sZCBzZWdtZW50IGJldHdlZW4gdGhlIHR3byB5ZWFycywgd2l0aCBhIGhvbGxvdyBtYXJrZXIgYXQgdGhlIHN0YXJ0LlxuICBjb25zdCByYW5nZSA9IGcuYXBwZW5kKCdsaW5lJykuYXR0cignY2xhc3MnLCAncmFuZ2UgaGlkZGVuJykuYXR0cigneTEnLCB5MSkuYXR0cigneTInLCB5MSk7XG4gIGNvbnN0IG1hcmtlckEgPSBnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ21hcmtlciBzdGFydCBoaWRkZW4nKTtcbiAgbWFya2VyQS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00wLC05TDgsMEwwLDlMLTgsMFonKTtcbiAgY29uc3QgbWFya2VyQUxhYmVsID0gbWFya2VyQS5hcHBlbmQoJ3RleHQnKS5hdHRyKCd5JywgMzApLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpO1xuXG4gIGNvbnN0IG1hcmtlciA9IGcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VyJyk7XG4gIG1hcmtlci5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00wLC05TDgsMEwwLDlMLTgsMFonKTtcbiAgY29uc3QgbWFya2VyTGFiZWwgPSBtYXJrZXIuYXBwZW5kKCd0ZXh0JykuYXR0cigneScsIDMwKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKTtcblxuICBjb25zdCBoaWRlTmVhciA9ICguLi55cykgPT4gdGlja0xhYmVscy5jbGFzc2VkKCdoaWRkZW4nLCAoZCkgPT4geXMuc29tZSgoeSkgPT4gTWF0aC5hYnMoeChkKSAtIHgoeSkpIDwgMzQpKTtcblxuICByZXR1cm4ge1xuICAgIHNldFllYXIoeWVhcikge1xuICAgICAgbWFya2VyLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4KHllYXIpfSwke3kxfSlgKTtcbiAgICAgIG1hcmtlckxhYmVsLnRleHQoeWVhcik7XG4gICAgICByYW5nZS5jbGFzc2VkKCdoaWRkZW4nLCB0cnVlKTtcbiAgICAgIG1hcmtlckEuY2xhc3NlZCgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBoaWRlTmVhcih5ZWFyKTtcbiAgICB9LFxuICAgIHNldFJhbmdlKGEsIGIpIHtcbiAgICAgIG1hcmtlci5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eChiKX0sJHt5MX0pYCk7XG4gICAgICBtYXJrZXJMYWJlbC50ZXh0KGIpO1xuICAgICAgbWFya2VyQS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eChhKX0sJHt5MX0pYCkuY2xhc3NlZCgnaGlkZGVuJywgZmFsc2UpO1xuICAgICAgbWFya2VyQUxhYmVsLnRleHQoYSk7XG4gICAgICByYW5nZS5hdHRyKCd4MScsIHgoTWF0aC5taW4oYSwgYikpKS5hdHRyKCd4MicsIHgoTWF0aC5tYXgoYSwgYikpKS5jbGFzc2VkKCdoaWRkZW4nLCBmYWxzZSk7XG4gICAgICBoaWRlTmVhcihhLCBiKTtcbiAgICB9LFxuICB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgbGVnZW5kXG4vLyBUb3AtcmlnaHQgaW5zaWRlIHRoZSBmcmFtZS4gRW50cmllcyBjb21lIGZyb20gdGhlIGFjdGl2ZSB0cmFja2VyOyB0aGUgdmlzdWFsIGdyYW1tYXIgbmV2ZXIgY2hhbmdlcy5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlZ2VuZChyb290LCB7IHgxLCB5MCB9KSB7XG4gIGNvbnN0IFcgPSAyMzYsIFBBRCA9IDE0LCBST1cgPSAyMjtcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbGVnZW5kJyk7XG4gIGNvbnN0IGJveCA9IGcuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnbGVnZW5kLWJveCcpLmF0dHIoJ3dpZHRoJywgVyk7XG4gIGNvbnN0IHRpdGxlID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICdsZWdlbmQtdGl0bGUnKS5hdHRyKCd4JywgUEFEKS5hdHRyKCd5JywgUEFEICsgMTApO1xuICBjb25zdCByb3dzID0gZy5hcHBlbmQoJ2cnKS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7UEFEfSwke1BBRCArIDI2fSlgKTtcblxuICBsZXQgaGVpZ2h0ID0gMDtcbiAgZnVuY3Rpb24gc2V0KHRyYWNrZXIpIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdHJhY2tlci5sZWdlbmQgPz8gW107XG4gICAgdGl0bGUudGV4dCh0cmFja2VyLnRpdGxlID8/IHRyYWNrZXIuaWQpO1xuICAgIGNvbnN0IEggPSBQQUQgKiAyICsgMjYgKyBlbnRyaWVzLmxlbmd0aCAqIFJPVztcbiAgICBoZWlnaHQgPSBIO1xuICAgIGJveC5hdHRyKCdoZWlnaHQnLCBIKTtcbiAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4MSAtIDIyIC0gV30sJHt5MCArIDIyfSlgKTtcbiAgICBjb25zdCByID0gcm93cy5zZWxlY3RBbGwoJ2cucm93JykuZGF0YShlbnRyaWVzKS5qb2luKCdnJykuYXR0cignY2xhc3MnLCAncm93JykuYXR0cigndHJhbnNmb3JtJywgKF8sIGkpID0+IGB0cmFuc2xhdGUoMCwke2kgKiBST1d9KWApO1xuICAgIHIuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG4gICAgci5lYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICBjb25zdCByb3cgPSBkM1NlbGVjdCh0aGlzKTtcbiAgICAgIGlmIChlLnN3YXRjaCA9PT0gJ2ZpbGwnKSB7XG4gICAgICAgIHJvdy5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsIGBzd2F0Y2ggZmlsbC0ke2Uua2V5fWApLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgMCkuYXR0cignd2lkdGgnLCAyMikuYXR0cignaGVpZ2h0JywgMTQpO1xuICAgICAgfSBlbHNlIGlmIChlLnN3YXRjaCA9PT0gJ2hhdGNoJykge1xuICAgICAgICByb3cuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnc3dhdGNoIGhhdGNoJykuYXR0cigneCcsIDApLmF0dHIoJ3knLCAwKS5hdHRyKCd3aWR0aCcsIDIyKS5hdHRyKCdoZWlnaHQnLCAxNCk7XG4gICAgICB9IGVsc2UgaWYgKGUuc3dhdGNoID09PSAnbGluZScpIHtcbiAgICAgICAgcm93LmFwcGVuZCgnbGluZScpLmF0dHIoJ2NsYXNzJywgYHN3YXRjaC1saW5lICR7ZS5zdHlsZX1gKS5hdHRyKCd4MScsIDApLmF0dHIoJ3gyJywgMjIpLmF0dHIoJ3kxJywgNykuYXR0cigneTInLCA3KTtcbiAgICAgIH0gZWxzZSBpZiAoZS5zd2F0Y2ggPT09ICdzaGFwZScpIHtcbiAgICAgICAgcm93LmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgYG1hcmsgJHtlLnNoYXBlfWApLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTEsNyknKS5hdHRyKCdkJywgU0hBUEVTW2Uuc2hhcGVdID8/IFNIQVBFUy5jaXJjbGUpO1xuICAgICAgfVxuICAgICAgcm93LmFwcGVuZCgndGV4dCcpLmF0dHIoJ3gnLCAzMikuYXR0cigneScsIDExKS50ZXh0KGUubGFiZWwpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB7IHNldCwgaGVpZ2h0OiAoKSA9PiBoZWlnaHQgfTtcbn1cblxuLy8gUG9pbnQgbWFya3MgKGJyaWVmIFx1MDBBNzUpOiBiYXR0bGUvc2llZ2UgPSBydXN0IGRpYW1vbmQ7IGZvdW5kaW5nL2NhcGl0YWwgPSBtb3NzIGNpcmNsZTsgbW9udW1lbnQgPSBuYXZ5IHNxdWFyZTsgdHJlYXR5ID0gbmF2eSB0cmlhbmdsZS5cbmV4cG9ydCBjb25zdCBTSEFQRVMgPSB7XG4gICdydXN0LWRpYW1vbmQnOiAnTTAsLTdMNywwTDAsN0wtNywwWicsXG4gICdtb3NzLWNpcmNsZSc6ICdNMCwtNkE2LDYgMCAxLDEgMCw2QTYsNiAwIDEsMSAwLC02WicsXG4gICduYXZ5LXNxdWFyZSc6ICdNLTYsLTZINlY2SC02WicsXG4gICduYXZ5LXRyaWFuZ2xlJzogJ00wLC03TDcsNkgtN1onLFxuICBjaXJjbGU6ICdNMCwtNkE2LDYgMCAxLDEgMCw2QTYsNiAwIDEsMSAwLC02WicsXG59O1xuXG4vLyB0aW55IGxvY2FsIGFsaWFzIHRvIGF2b2lkIGltcG9ydGluZyBhbGwgb2YgZDMgaGVyZVxuaW1wb3J0IHsgc2VsZWN0IGFzIGQzU2VsZWN0IH0gZnJvbSAnZDMnO1xuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZGlmZiBsaXN0XG4vLyBUaGUgYXV0by1nZW5lcmF0ZWQgYXBwZWFyZWQgLyB2YW5pc2hlZCAvIHBlcnNpc3RlZCBsaXN0LCBkcmF3biBpbnNpZGUgdGhlIGZyYW1lIHVuZGVyIHRoZSBsZWdlbmQuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaWZmTGlzdChyb290LCB7IHgxLCB5MCB9KSB7XG4gIGNvbnN0IFcgPSAyMzYsIFBBRCA9IDE0LCBST1cgPSAxNywgTUFYID0gNztcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnZGlmZmxpc3QgaGlkZGVuJyk7XG4gIGNvbnN0IGJveCA9IGcuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnZGlmZmxpc3QtYm94JykuYXR0cignd2lkdGgnLCBXKTtcbiAgY29uc3QgYm9keSA9IGcuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke1BBRH0sJHtQQUR9KWApO1xuXG4gIGZ1bmN0aW9uIHNlY3Rpb24oeSwgdGl0bGUsIGl0ZW1zLCBzbWFsbCwgY2xzKSB7XG4gICAgYm9keS5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsIGBkaWZmbGlzdC1oZWFkICR7Y2xzfWApLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgeSArIDEwKS50ZXh0KGAke3RpdGxlfSBcdTAwQjcgJHtpdGVtcy5sZW5ndGggKyBzbWFsbH1gKTtcbiAgICB5ICs9IFJPVyArIDI7XG4gICAgY29uc3Qgc2hvd24gPSBpdGVtcy5zbGljZSgwLCBNQVgpO1xuICAgIGZvciAoY29uc3QgaXQgb2Ygc2hvd24pIHtcbiAgICAgIGJvZHkuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCBgZGlmZmxpc3QtaXRlbSAke2Nsc31gKS5hdHRyKCd4JywgMTApLmF0dHIoJ3knLCB5ICsgMTApLnRleHQoaXQubGFiZWwpO1xuICAgICAgeSArPSBST1c7XG4gICAgfVxuICAgIGNvbnN0IHJlc3QgPSBpdGVtcy5sZW5ndGggLSBzaG93bi5sZW5ndGggKyBzbWFsbDtcbiAgICBpZiAocmVzdCA+IDApIHtcbiAgICAgIGJvZHkuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCAnZGlmZmxpc3QtbW9yZScpLmF0dHIoJ3gnLCAxMCkuYXR0cigneScsIHkgKyAxMCkudGV4dChgYW5kICR7cmVzdH0gc21hbGxlcmApO1xuICAgICAgeSArPSBST1c7XG4gICAgfVxuICAgIHJldHVybiB5ICsgODtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2V0KGRpZmYsIHRvcCkge1xuICAgICAgYm9keS5zZWxlY3RBbGwoJyonKS5yZW1vdmUoKTtcbiAgICAgIGxldCB5ID0gMDtcbiAgICAgIHkgPSBzZWN0aW9uKHksICdBcHBlYXJlZCcsIGRpZmYuYXBwZWFyZWQsIGRpZmYuc21hbGwuYXBwZWFyZWQsICdhcHBlYXJlZCcpO1xuICAgICAgeSA9IHNlY3Rpb24oeSwgJ1ZhbmlzaGVkJywgZGlmZi52YW5pc2hlZCwgZGlmZi5zbWFsbC52YW5pc2hlZCwgJ3ZhbmlzaGVkJyk7XG4gICAgICB5ID0gc2VjdGlvbih5LCAnUGVyc2lzdGVkJywgZGlmZi5wZXJzaXN0ZWQsIGRpZmYuc21hbGwucGVyc2lzdGVkLCAncGVyc2lzdGVkJyk7XG4gICAgICBib3guYXR0cignaGVpZ2h0JywgeSArIFBBRCk7XG4gICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4MSAtIDIyIC0gV30sJHt0b3B9KWApLmNsYXNzZWQoJ2hpZGRlbicsIGZhbHNlKTtcbiAgICB9LFxuICAgIGhpZGUoKSB7IGcuY2xhc3NlZCgnaGlkZGVuJywgdHJ1ZSk7IH0sXG4gIH07XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBkaWZmXG4vLyBDb250aW51aXR5IGFuZCBjaGFuZ2UgYmV0d2VlbiB0d28gc25hcHNob3RzLCBjb21wdXRlZCBmcm9tIHdoYXQgZWFjaCBiYXNlIG1hcCBuYW1lcyBhbmQgZnJvbSB0aGVcbi8vIHRyYWNrZXIncyB0aW1lLWJvdW5kZWQgaWRlbnRpdGllcy4gTm90aGluZyBoZXJlIGRyYXdzOyBzZWUgcmVuZGVyL2Jhc2UuanMgc2hvd0RpZmYuXG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcblxuY29uc3QgS00yX1BFUl9TUiA9IDYzNzEgKiA2MzcxO1xuXG5mdW5jdGlvbiBib3VuZHNJbnRlcnNlY3QoW1theDAsIGF5MF0sIFtheDEsIGF5MV1dLCB7IHgwLCB5MCwgeDEsIHkxIH0pIHtcbiAgcmV0dXJuIGF4MSA+PSB4MCAmJiBheDAgPD0geDEgJiYgYXkxID49IHkwICYmIGF5MCA8PSB5MTtcbn1cblxuLy8gU3BoZXJpY2FsIGFyZWEgYW5kIHByb2plY3RlZCBib3VuZHMgYXJlIGNhY2hlZCBwZXIgZmVhdHVyZSBvYmplY3Q7IHNuYXBzaG90cyBhcmUgY2FjaGVkLCBzbyB0aGlzIHBheXMgb25jZS5cbmNvbnN0IGFyZWFDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBib3VuZHNDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBhcmVhT2YgPSAoZikgPT4geyBsZXQgYSA9IGFyZWFDYWNoZS5nZXQoZik7IGlmIChhID09PSB1bmRlZmluZWQpIHsgYSA9IGQzLmdlb0FyZWEoZik7IGFyZWFDYWNoZS5zZXQoZiwgYSk7IH0gcmV0dXJuIGE7IH07XG5jb25zdCBib3VuZHNPZiA9IChmLCBwYXRoKSA9PiB7IGxldCBiID0gYm91bmRzQ2FjaGUuZ2V0KGYpOyBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7IGIgPSBwYXRoLmJvdW5kcyhmKTsgYm91bmRzQ2FjaGUuc2V0KGYsIGIpOyB9IHJldHVybiBiOyB9O1xuXG4vLyBHcm91cCBhIHNuYXBzaG90J3MgbmFtZWQgZmVhdHVyZXMgYnkgaWRlbnRpdHkuXG4vLyBpZGVudGlmeShmZWF0dXJlLCB5ZWFyKSBcdTIxOTIgeyBrZXksIGxhYmVsIH0gfCBudWxsOiBhIHRyYWNrZXIgaWRlbnRpdHkgd2hlbiB0aGUgbmFtZSBtYXRjaGVzIG9uZSBhbGl2ZSB0aGF0XG4vLyB5ZWFyIChzbyBhIHJlbmFtZWQgc3RhdGUgcGVyc2lzdHMpLCBvdGhlcndpc2UgdGhlIGJhc2UgbWFwJ3Mgb3duIG5hbWU7IG51bGwgbWVhbnMgXCJub3QgcGFydCBvZiB0aGlzIGRpZmZcIi5cbmZ1bmN0aW9uIGdyb3VwQnlJZGVudGl0eShmZWF0dXJlcywgeWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lKSB7XG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCBmIG9mIGZlYXR1cmVzKSB7XG4gICAgY29uc3QgaWQgPSBpZGVudGlmeShmLCB5ZWFyKTtcbiAgICBpZiAoIWlkKSBjb250aW51ZTtcbiAgICBjb25zdCB7IGtleSwgbGFiZWwgfSA9IGlkO1xuICAgIGxldCBnID0gZ3JvdXBzLmdldChrZXkpO1xuICAgIGlmICghZykgeyBnID0geyBrZXksIGxhYmVsLCBhcmVhOiAwLCBmZWF0dXJlczogW10sIHZpc2libGU6IGZhbHNlIH07IGdyb3Vwcy5zZXQoa2V5LCBnKTsgfVxuICAgIGcuYXJlYSArPSBhcmVhT2YoZik7XG4gICAgZy5mZWF0dXJlcy5wdXNoKGYpO1xuICAgIGlmICghZy52aXNpYmxlICYmIGJvdW5kc0ludGVyc2VjdChib3VuZHNPZihmLCBwYXRoKSwgZnJhbWUpKSBnLnZpc2libGUgPSB0cnVlO1xuICB9XG4gIHJldHVybiBncm91cHM7XG59XG5cbi8vIFJldHVybnMgeyBhcHBlYXJlZCwgdmFuaXNoZWQsIHBlcnNpc3RlZCwgc21hbGw6IHthcHBlYXJlZCwgdmFuaXNoZWQsIHBlcnNpc3RlZH0gfS5cbi8vIEVhY2ggbGlzdCBob2xkcyB7IGtleSwgbGFiZWwsIGFyZWEsIGttMiwgYT86IGZlYXR1cmVzIGluIEEsIGI/OiBmZWF0dXJlcyBpbiBCIH0gc29ydGVkIGJ5IGFyZWEsIGxhcmdlc3QgZmlyc3QuXG4vLyBHcm91cHMgc21hbGxlciB0aGFuIG1pbkttMiBhcmUgY291bnRlZCBpbiBgc21hbGxgIGJ1dCBub3QgbGlzdGVkOyBncm91cHMgd2hvbGx5IG91dHNpZGUgdGhlIGZyYW1lIGFyZSBkcm9wcGVkLlxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVEaWZmKHsgYUZlYXR1cmVzLCBhWWVhciwgYkZlYXR1cmVzLCBiWWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lLCBtaW5LbTIgPSAxMjAwMDAgfSkge1xuICBjb25zdCBBID0gZ3JvdXBCeUlkZW50aXR5KGFGZWF0dXJlcywgYVllYXIsIGlkZW50aWZ5LCBwYXRoLCBmcmFtZSk7XG4gIGNvbnN0IEIgPSBncm91cEJ5SWRlbnRpdHkoYkZlYXR1cmVzLCBiWWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lKTtcbiAgY29uc3QgbWluU3IgPSBtaW5LbTIgLyBLTTJfUEVSX1NSO1xuICBjb25zdCBvdXQgPSB7IGFwcGVhcmVkOiBbXSwgdmFuaXNoZWQ6IFtdLCBwZXJzaXN0ZWQ6IFtdLCBzbWFsbDogeyBhcHBlYXJlZDogMCwgdmFuaXNoZWQ6IDAsIHBlcnNpc3RlZDogMCB9IH07XG4gIGNvbnN0IHB1c2ggPSAoYnVja2V0LCBpdGVtKSA9PiB7XG4gICAgaWYgKCFpdGVtLnZpc2libGUpIHJldHVybjtcbiAgICBpdGVtLmttMiA9IE1hdGgucm91bmQoaXRlbS5hcmVhICogS00yX1BFUl9TUik7XG4gICAgaWYgKGl0ZW0uYXJlYSA8IG1pblNyKSB7IG91dC5zbWFsbFtidWNrZXRdKys7IHJldHVybjsgfVxuICAgIG91dFtidWNrZXRdLnB1c2goaXRlbSk7XG4gIH07XG4gIGZvciAoY29uc3QgW2tleSwgZ2JdIG9mIEIpIHtcbiAgICBjb25zdCBnYSA9IEEuZ2V0KGtleSk7XG4gICAgaWYgKGdhKSBwdXNoKCdwZXJzaXN0ZWQnLCB7IGtleSwgbGFiZWw6IGdiLmxhYmVsLCBhcmVhOiBNYXRoLm1heChnYS5hcmVhLCBnYi5hcmVhKSwgdmlzaWJsZTogZ2EudmlzaWJsZSB8fCBnYi52aXNpYmxlLCBhOiBnYS5mZWF0dXJlcywgYjogZ2IuZmVhdHVyZXMgfSk7XG4gICAgZWxzZSBwdXNoKCdhcHBlYXJlZCcsIHsga2V5LCBsYWJlbDogZ2IubGFiZWwsIGFyZWE6IGdiLmFyZWEsIHZpc2libGU6IGdiLnZpc2libGUsIGI6IGdiLmZlYXR1cmVzIH0pO1xuICB9XG4gIGZvciAoY29uc3QgW2tleSwgZ2FdIG9mIEEpIHtcbiAgICBpZiAoIUIuaGFzKGtleSkpIHB1c2goJ3ZhbmlzaGVkJywgeyBrZXksIGxhYmVsOiBnYS5sYWJlbCwgYXJlYTogZ2EuYXJlYSwgdmlzaWJsZTogZ2EudmlzaWJsZSwgYTogZ2EuZmVhdHVyZXMgfSk7XG4gIH1cbiAgZm9yIChjb25zdCBrIG9mIFsnYXBwZWFyZWQnLCAndmFuaXNoZWQnLCAncGVyc2lzdGVkJ10pIG91dFtrXS5zb3J0KChwLCBxKSA9PiBxLmFyZWEgLSBwLmFyZWEpO1xuICByZXR1cm4gb3V0O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgYmFzZSByZW5kZXJlclxuLy8gQnVpbGRzIHRoZSBzdGFnZTogcHJvamVjdGlvbiwgcGFwZXIsIG9jZWFuLCBiYXRoeW1ldHJ5LCByZWxpZWYsIGxhbmQsIHBvbGl0aWVzLCB3YXRlciBsaW5lcywgY29hc3QsIGdyYXRpY3VsZSxcbi8vIGxhYmVscywgbGVnZW5kLCBjYXJ0b3VjaGUsIHRpbWVsaW5lIHN0cmlwLiBBbGwgZ2VvbWV0cnkgY29tZXMgZnJvbSB0aGUgZG93bmxvYWRlZCBsYXllcnM7IHRoaXMgZmlsZSBvbmx5XG4vLyBwcm9qZWN0cyBhbmQgc3R5bGVzIGl0LlxuXG5pbXBvcnQgKiBhcyBkMyBmcm9tICdkMyc7XG5pbXBvcnQgeyBmZWF0dXJlLCBtZXNoIH0gZnJvbSAndG9wb2pzb24tY2xpZW50JztcbmltcG9ydCB7IGFzc2V0VVJMIH0gZnJvbSAnLi4vZGF0YS9sb2FkZXIuanMnO1xuaW1wb3J0IHsgcGFwZXJEZWZzLCBkcmF3UGFwZXIsIGRyYXdQYXBlck92ZXJsYXkgfSBmcm9tICcuL3BhcGVyLmpzJztcbmltcG9ydCB7IGRyYXdTdGFnZUxhYmVscywgcG9saXR5TGFiZWxEYXRhLCBkcmF3UG9saXR5TGFiZWxzIH0gZnJvbSAnLi9sYWJlbHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlQ2FydG91Y2hlIH0gZnJvbSAnLi9jYXJ0b3VjaGUuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RyaXAgfSBmcm9tICcuL3N0cmlwLmpzJztcbmltcG9ydCB7IGNyZWF0ZUxlZ2VuZCB9IGZyb20gJy4vbGVnZW5kLmpzJztcbmltcG9ydCB7IGNyZWF0ZURpZmZMaXN0IH0gZnJvbSAnLi9kaWZmbGlzdC5qcyc7XG5pbXBvcnQgeyBjb21wdXRlRGlmZiB9IGZyb20gJy4uL3ZpZXdzL2RpZmYuanMnO1xuXG5leHBvcnQgY29uc3QgQ1JPU1NGQURFX01TID0gMzAwO1xuXG5leHBvcnQgY29uc3QgRElGRl9MRUdFTkQgPSB7XG4gIHRpdGxlOiAnQ29udGludWl0eSBhbmQgY2hhbmdlJyxcbiAgbGVnZW5kOiBbXG4gICAgeyBzd2F0Y2g6ICdmaWxsJywga2V5OiAnZm9jdXMnLCBsYWJlbDogJ0FwcGVhcmVkJyB9LFxuICAgIHsgc3dhdGNoOiAnaGF0Y2gnLCBsYWJlbDogJ1ZhbmlzaGVkJyB9LFxuICAgIHsgc3dhdGNoOiAnbGluZScsIHN0eWxlOiAnc29saWQnLCBsYWJlbDogJ1BlcnNpc3RlZCAoYm9yZGVyKScgfSxcbiAgXSxcbn07XG5cbmV4cG9ydCBjb25zdCBXID0gMTkyMDtcbmV4cG9ydCBjb25zdCBIID0gMTA4MDtcbi8vIFRoZSBnb2xkIHJpbmcuIFRoZSBib3R0b20gaXMgZGVlcGVyIGJlY2F1c2UgaXQgY2FycmllcyB0aGUgdGltZWxpbmUgc3RyaXAuXG5leHBvcnQgY29uc3QgRlJBTUUgPSB7IGxlZnQ6IDMyLCByaWdodDogMzIsIHRvcDogMzIsIGJvdHRvbTogNjQgfTtcblxuY29uc3QgUFJPSkVDVElPTlMgPSB7XG4gIGVxdWFsRWFydGg6ICgpID0+IGQzLmdlb0VxdWFsRWFydGgoKSxcbiAgbGFtYmVydEF6aW11dGhhbEVxdWFsQXJlYTogKCkgPT4gZDMuZ2VvQXppbXV0aGFsRXF1YWxBcmVhKCksXG4gIGFsYmVyc1VzYTogKCkgPT4gZDMuZ2VvQWxiZXJzVXNhKCksXG59O1xuXG4vLyBBIGxvbi9sYXQgYm94IHdpdGggaXRzIGVkZ2VzIGRlbnNpZmllZCBzbyBmaXRFeHRlbnQgc2VlcyB0aGUgYm94J3MgY3VydmVkIG91dGxpbmUgaW4gdGhlIHByb2plY3Rpb24uXG4vLyBkMy1nZW8gdHJlYXRzIHNwaGVyaWNhbCBwb2x5Z29ucyBieSB3aW5kaW5nIG9yZGVyOiB0aGUgZXh0ZXJpb3IgcmluZyBtdXN0IHJ1biBjbG9ja3dpc2Vcbi8vICh3ZXN0XHUyMTkyZWFzdCBhbG9uZyB0aGUgbm9ydGggZWRnZSBmaXJzdCksIG9yIHRoZSBcImluc2lkZVwiIGJlY29tZXMgdGhlIHJlc3Qgb2YgdGhlIGdsb2JlLlxuZnVuY3Rpb24gZXh0ZW50UG9seWdvbih7IHdlc3QsIHNvdXRoLCBlYXN0LCBub3J0aCB9LCBzdGVwID0gMSkge1xuICBjb25zdCByaW5nID0gW107XG4gIGZvciAobGV0IHggPSB3ZXN0OyB4IDwgZWFzdDsgeCArPSBzdGVwKSByaW5nLnB1c2goW3gsIG5vcnRoXSk7XG4gIGZvciAobGV0IHkgPSBub3J0aDsgeSA+IHNvdXRoOyB5IC09IHN0ZXApIHJpbmcucHVzaChbZWFzdCwgeV0pO1xuICBmb3IgKGxldCB4ID0gZWFzdDsgeCA+IHdlc3Q7IHggLT0gc3RlcCkgcmluZy5wdXNoKFt4LCBzb3V0aF0pO1xuICBmb3IgKGxldCB5ID0gc291dGg7IHkgPCBub3J0aDsgeSArPSBzdGVwKSByaW5nLnB1c2goW3dlc3QsIHldKTtcbiAgcmluZy5wdXNoKHJpbmdbMF0pO1xuICByZXR1cm4geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbcmluZ10gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQcm9qZWN0aW9uKHN0YWdlLCBpbm5lcikge1xuICBjb25zdCBtYWtlID0gUFJPSkVDVElPTlNbc3RhZ2UucHJvamVjdGlvbl07XG4gIGlmICghbWFrZSkgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb2plY3Rpb24gJHtzdGFnZS5wcm9qZWN0aW9ufWApO1xuICBjb25zdCBwcm9qID0gbWFrZSgpO1xuICBpZiAoc3RhZ2Uucm90YXRlICYmIHByb2oucm90YXRlKSBwcm9qLnJvdGF0ZShzdGFnZS5yb3RhdGUpO1xuICBwcm9qLmZpdEV4dGVudChpbm5lciwgZXh0ZW50UG9seWdvbihzdGFnZS5leHRlbnQpKTtcbiAgcmV0dXJuIHByb2o7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZShzdmcsIHN0YWdlLCBsYXllcnMsIHsgdHJhY2tlciwgeWVhcnMgPSBbXSwgb25ZZWFyIH0gPSB7fSkge1xuICBjb25zdCBpbm5lciA9IFtbRlJBTUUubGVmdCwgRlJBTUUudG9wXSwgW1cgLSBGUkFNRS5yaWdodCwgSCAtIEZSQU1FLmJvdHRvbV1dO1xuICBjb25zdCBbW3gwLCB5MF0sIFt4MSwgeTFdXSA9IGlubmVyO1xuICBjb25zdCBmcmFtZSA9IHsgeDAsIHkwLCB4MSwgeTEgfTtcbiAgY29uc3QgcHJvamVjdGlvbiA9IG1ha2VQcm9qZWN0aW9uKHN0YWdlLCBpbm5lcik7XG4gIGNvbnN0IHBhdGggPSBkMy5nZW9QYXRoKHByb2plY3Rpb24pO1xuXG4gIC8vIFByb2plY3RlZCBwYXRoIHN0cmluZ3MgYXJlIGNhY2hlZCBwZXIgZmVhdHVyZSBvYmplY3Q6IGEgc25hcHNob3Qgc3dpdGNoIG9ubHkgcmUtYmluZHMgY2FjaGVkIHN0cmluZ3MuXG4gIGNvbnN0IGNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbiAgY29uc3QgZCA9IChmKSA9PiB7XG4gICAgbGV0IHMgPSBjYWNoZS5nZXQoZik7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkgeyBzID0gcGF0aChmKSB8fCAnJzsgY2FjaGUuc2V0KGYsIHMpOyB9XG4gICAgcmV0dXJuIHM7XG4gIH07XG5cbiAgc3ZnLmF0dHIoJ3ZpZXdCb3gnLCBgMCAwICR7V30gJHtIfWApLmF0dHIoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAneE1pZFlNaWQgbWVldCcpO1xuICBzdmcuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG5cbiAgY29uc3QgZGVmcyA9IHN2Zy5hcHBlbmQoJ2RlZnMnKTtcbiAgcGFwZXJEZWZzKGRlZnMpO1xuICBkZWZzLmFwcGVuZCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsICdmcmFtZS1jbGlwJykuYXBwZW5kKCdyZWN0JylcbiAgICAuYXR0cigneCcsIHgwKS5hdHRyKCd5JywgeTApLmF0dHIoJ3dpZHRoJywgeDEgLSB4MCkuYXR0cignaGVpZ2h0JywgeTEgLSB5MCk7XG5cbiAgY29uc3Qgcm9vdCA9IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzdGFnZScpO1xuICBkcmF3UGFwZXIocm9vdCwgVywgSCk7XG5cbiAgY29uc3QgbWFwID0gcm9vdC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdtYXAnKS5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNmcmFtZS1jbGlwKScpO1xuICAvLyBUaGUgb2NlYW4gaXMgdGhlIGdsb2JlIGl0c2VsZjsgYW55dGhpbmcgYmV5b25kIGl0cyBlZGdlIHN0YXlzIHBhcGVyLlxuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnb2NlYW4nKS5hdHRyKCdkJywgZCh7IHR5cGU6ICdTcGhlcmUnIH0pKTtcblxuICAvLyBCYXRoeW1ldHJ5OiBoYWlybGluZSBjb250b3VycyBpbiB0aGUgb2NlYW4gdG9uZS5cbiAgY29uc3QgYmF0aHkgPSBmZWF0dXJlKGxheWVycy5iYXRoeSwgbGF5ZXJzLmJhdGh5Lm9iamVjdHMuYmF0aHltZXRyeSk7XG4gIG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdiYXRoeW1ldHJ5JylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShiYXRoeS5mZWF0dXJlcykuam9pbigncGF0aCcpLmF0dHIoJ2QnLCBkKTtcblxuICAvLyBMYW5kIGF0IHJlc3QgKGNyZWFtKSwgdGhlbiByZWxpZWYgKHByZS1yZW5kZXJlZCBmb3IgdGhpcyBzdGFnZSwgd2hlbiBwcmVzZW50KSwgbWFza2VkIHRvIGxhbmQuXG4gIGNvbnN0IG5lID0gbGF5ZXJzLm5lO1xuICBjb25zdCBsYW5kID0gZmVhdHVyZShuZSwgbmUub2JqZWN0cy5sYW5kKTtcbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xhbmQnKS5hdHRyKCdkJywgZChsYW5kKSk7XG4gIGlmIChzdGFnZS5yZWxpZWYpIHtcbiAgICBkZWZzLmFwcGVuZCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsICdsYW5kLWNsaXAnKS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgZChsYW5kKSk7XG4gICAgbWFwLmFwcGVuZCgnaW1hZ2UnKS5hdHRyKCdjbGFzcycsICdyZWxpZWYnKVxuICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2xhbmQtY2xpcCknKVxuICAgICAgLmF0dHIoJ3gnLCB4MCkuYXR0cigneScsIHkwKS5hdHRyKCd3aWR0aCcsIHgxIC0geDApLmF0dHIoJ2hlaWdodCcsIHkxIC0geTApXG4gICAgICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJylcbiAgICAgIC5hdHRyKCdocmVmJywgYXNzZXRVUkwoYGFzc2V0cy8ke3N0YWdlLnJlbGllZn1gKSk7XG4gIH1cblxuICAvLyBIYXRjaCBmb3IgdmFuaXNoZWQgLyBkaXNwdXRlZCAoZ3JhbW1hciBcdTAwQTc1KTogcnVzdCBkaWFnb25hbHMuXG4gIGRlZnMuYXBwZW5kKCdwYXR0ZXJuJykuYXR0cignaWQnLCAnaGF0Y2gtcnVzdCcpLmF0dHIoJ3BhdHRlcm5Vbml0cycsICd1c2VyU3BhY2VPblVzZScpLmF0dHIoJ3dpZHRoJywgOSkuYXR0cignaGVpZ2h0JywgOSkuYXR0cigncGF0dGVyblRyYW5zZm9ybScsICdyb3RhdGUoNDUpJylcbiAgICAuYXBwZW5kKCdsaW5lJykuYXR0cigneDEnLCAwKS5hdHRyKCd5MScsIDApLmF0dHIoJ3gyJywgMCkuYXR0cigneTInLCA5KS5hdHRyKCdjbGFzcycsICdoYXRjaC1saW5lJyk7XG5cbiAgLy8gU25hcHNob3QgbGF5ZXJzIChwb2xpdGllcywgYm9yZGVycywgbGFiZWxzKSBsaXZlIGhlcmU7IGVhY2ggc2hvdygpIGNyZWF0ZXMgYSBuZXcgZ3JvdXAgYW5kIGNyb3NzZmFkZXMuXG4gIGNvbnN0IHNuYXBzaG90cyA9IG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzbmFwc2hvdHMnKTtcblxuICAvLyBXYXRlciBsaW5lcyBhbmQgY29hc3QuXG4gIGNvbnN0IHJpdmVycyA9IGZlYXR1cmUobmUsIG5lLm9iamVjdHMucml2ZXJzKTtcbiAgbWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3JpdmVycycpXG4gICAgLnNlbGVjdEFsbCgncGF0aCcpLmRhdGEocml2ZXJzLmZlYXR1cmVzLmZpbHRlcigoZikgPT4gKGYucHJvcGVydGllcy5zY2FsZXJhbmsgPz8gMCkgPD0gNykpLmpvaW4oJ3BhdGgnKS5hdHRyKCdkJywgZCk7XG4gIGNvbnN0IGxha2VzID0gZmVhdHVyZShuZSwgbmUub2JqZWN0cy5sYWtlcyk7XG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdsYWtlcycpLmF0dHIoJ2QnLCBkKGxha2VzKSk7XG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdjb2FzdGxpbmUnKS5hdHRyKCdkJywgZChmZWF0dXJlKG5lLCBuZS5vYmplY3RzLmNvYXN0bGluZSkpKTtcblxuICAvLyBHcmF0aWN1bGU6IGhhaXJsaW5lIGdvbGQsIGV2ZXJ5IDEwXHUwMEIwLlxuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnZ3JhdGljdWxlJykuYXR0cignZCcsIGQoZDMuZ2VvR3JhdGljdWxlMTAoKSkpO1xuXG4gIC8vIFN0YWdlIGxhYmVscyBhbG9uZyB0aGVpciBwYXJhbGxlbHMuIFBvbGl0eSBsYWJlbHMgYXJlIGRyYXduIHBlciBzbmFwc2hvdCwgYWJvdmUgdGhlIHdhdGVyIGxpbmVzLlxuICBkcmF3U3RhZ2VMYWJlbHMobWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3N0YWdlLWxhYmVscycpLCBkZWZzLCBzdGFnZSwgcGF0aCk7XG4gIGNvbnN0IGxhYmVsTGF5ZXJzID0gbWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvbGl0eS1sYWJlbHMnKTtcblxuICAvLyBHcmFpbiBhbmQgdmlnbmV0dGUgb3ZlciB0aGUgc2hlZXQsIHRoZW4gdGhlIGFwcGFyYXR1cyBvbiB0b3AuXG4gIGRyYXdQYXBlck92ZXJsYXkocm9vdCwgVywgSCk7XG5cbiAgLy8gRnJhbWU6IGdvbGQgb24gdGhyZWUgc2lkZXM7IHRoZSBib3R0b20gZWRnZSBpcyB0aGUgdGltZWxpbmUgc3RyaXAncyBiYXNlbGluZS5cbiAgcm9vdC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdmcmFtZScpLmF0dHIoJ2QnLCBgTSR7eDB9LCR7eTF9TCR7eDB9LCR7eTB9TCR7eDF9LCR7eTB9TCR7eDF9LCR7eTF9YCk7XG5cbiAgY29uc3QgbGVnZW5kID0gY3JlYXRlTGVnZW5kKHJvb3QsIGZyYW1lKTtcbiAgaWYgKHRyYWNrZXIpIGxlZ2VuZC5zZXQodHJhY2tlcik7XG4gIGNvbnN0IGRpZmZMaXN0ID0gY3JlYXRlRGlmZkxpc3Qocm9vdCwgZnJhbWUpO1xuICBjb25zdCBjYXJ0b3VjaGUgPSBjcmVhdGVDYXJ0b3VjaGUocm9vdCwgZnJhbWUsIHN0YWdlLCBwcm9qZWN0aW9uKTtcbiAgY29uc3Qgc3RyaXAgPSBjcmVhdGVTdHJpcChyb290LCBmcmFtZSwgc3RhZ2UsIHllYXJzLCBvblllYXIpO1xuXG4gIGxldCBjdXJyZW50WWVhciA9IG51bGw7XG5cbiAgLy8gQ3Jvc3NmYWRlOiBidWlsZCB0aGUgbmV3IGxheWVyIGF0IG9wYWNpdHkgMCwgZmFkZSBpdCBpbiB3aGlsZSBldmVyeSBvbGRlciBsYXllciBmYWRlcyBvdXQgYW5kIGlzIHJlbW92ZWQuXG4gIGZ1bmN0aW9uIGNyb3NzZmFkZShidWlsZCkge1xuICAgIGNvbnN0IGcgPSBzbmFwc2hvdHMuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc25hcCcpLnN0eWxlKCdvcGFjaXR5JywgMCk7XG4gICAgY29uc3QgbGcgPSBsYWJlbExheWVycy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzbmFwLWxhYmVscycpLnN0eWxlKCdvcGFjaXR5JywgMCk7XG4gICAgYnVpbGQoZywgbGcpO1xuICAgIHNuYXBzaG90cy5zZWxlY3RBbGwoJ2cuc25hcCcpLmZpbHRlcihmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzICE9PSBnLm5vZGUoKTsgfSlcbiAgICAgIC50cmFuc2l0aW9uKCkuZHVyYXRpb24oQ1JPU1NGQURFX01TKS5zdHlsZSgnb3BhY2l0eScsIDApLnJlbW92ZSgpO1xuICAgIGxhYmVsTGF5ZXJzLnNlbGVjdEFsbCgnZy5zbmFwLWxhYmVscycpLmZpbHRlcihmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzICE9PSBsZy5ub2RlKCk7IH0pXG4gICAgICAudHJhbnNpdGlvbigpLmR1cmF0aW9uKENST1NTRkFERV9NUykuc3R5bGUoJ29wYWNpdHknLCAwKS5yZW1vdmUoKTtcbiAgICBnLnRyYW5zaXRpb24oKS5kdXJhdGlvbihDUk9TU0ZBREVfTVMpLnN0eWxlKCdvcGFjaXR5JywgMSk7XG4gICAgbGcudHJhbnNpdGlvbigpLmR1cmF0aW9uKENST1NTRkFERV9NUykuc3R5bGUoJ29wYWNpdHknLCAxKTtcbiAgfVxuXG4gIC8vIEZlYXR1cmVzIGFuZCBtZXNoZXMgYXJlIGRlY29kZWQgb25jZSBwZXIgc25hcHNob3QgdG9wb2xvZ3ksIHNvIHRoZSBwcm9qZWN0ZWQtcGF0aCBjYWNoZSBoaXRzIG9uIGV2ZXJ5IGxhdGVyIHNob3cuXG4gIGNvbnN0IG5hbWVkQ2FjaGUgPSBuZXcgV2Vha01hcCgpLCBpbnRlcmlvckNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbiAgY29uc3QgbmFtZWRPZiA9ICh0b3BvKSA9PiB7XG4gICAgbGV0IHYgPSBuYW1lZENhY2hlLmdldCh0b3BvKTtcbiAgICBpZiAoIXYpIHsgdiA9IGZlYXR1cmUodG9wbywgdG9wby5vYmplY3RzLnBvbGl0aWVzKS5mZWF0dXJlcy5maWx0ZXIoKGYpID0+IGYucHJvcGVydGllcy5pZCk7IG5hbWVkQ2FjaGUuc2V0KHRvcG8sIHYpOyB9XG4gICAgcmV0dXJuIHY7XG4gIH07XG4gIGNvbnN0IGludGVyaW9yT2YgPSAodG9wbykgPT4ge1xuICAgIGxldCB2ID0gaW50ZXJpb3JDYWNoZS5nZXQodG9wbyk7XG4gICAgaWYgKCF2KSB7IHYgPSBtZXNoKHRvcG8sIHRvcG8ub2JqZWN0cy5wb2xpdGllcywgKGEsIGIpID0+IGEgIT09IGIpOyBpbnRlcmlvckNhY2hlLnNldCh0b3BvLCB2KTsgfVxuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIC8vIGNsYXNzaWZ5KGZlYXR1cmUsIHllYXIpIFx1MjE5MiB7IHN0YXR1czogJ2hpZ2hsaWdodCcgfCAnbXV0ZWQnLCBrZXk/LCBsYWJlbD8gfVxuICBmdW5jdGlvbiBzaG93U25hcHNob3QoeWVhciwgdG9wbywgY2xhc3NpZnkgPSAoKSA9PiAoeyBzdGF0dXM6ICdtdXRlZCcgfSkpIHtcbiAgICBjb25zdCBuYW1lZCA9IG5hbWVkT2YodG9wbyk7XG4gICAgZm9yIChjb25zdCBmIG9mIG5hbWVkKSBmLnByb3BlcnRpZXMuY2xzID0gY2xhc3NpZnkoZiwgeWVhcik7XG4gICAgY29uc3QgY2VydGFpbnR5ID0gbmFtZWRbMF0/LnByb3BlcnRpZXMuY2VydGFpbnR5ID8/ICdhcHByb3hpbWF0ZSc7XG4gICAgY3Jvc3NmYWRlKChnLCBsZykgPT4ge1xuICAgICAgZy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdwb2xpdGllcycpLnNlbGVjdEFsbCgncGF0aCcpLmRhdGEobmFtZWQpLmpvaW4oJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAoZikgPT4gYHBvbGl0eSAke2YucHJvcGVydGllcy5jZXJ0YWludHl9ICR7Zi5wcm9wZXJ0aWVzLmNscy5zdGF0dXN9YClcbiAgICAgICAgLmF0dHIoJ2QnLCBkKVxuICAgICAgICAuYXBwZW5kKCd0aXRsZScpLnRleHQoKGYpID0+IGYucHJvcGVydGllcy5jbHMubGFiZWwgPz8gZi5wcm9wZXJ0aWVzLm5hbWUpO1xuICAgICAgZy5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsIGBib3JkZXIgJHtjZXJ0YWludHl9YCkuYXR0cignZCcsIGQoaW50ZXJpb3JPZih0b3BvKSkpO1xuICAgICAgZHJhd1BvbGl0eUxhYmVscyhsZywgcG9saXR5TGFiZWxEYXRhKG5hbWVkLmZpbHRlcigoZikgPT4gZi5wcm9wZXJ0aWVzLmNscy5zdGF0dXMgPT09ICdoaWdobGlnaHQnKSwgcGF0aCkpO1xuICAgIH0pO1xuICAgIGlmICh0cmFja2VyKSBsZWdlbmQuc2V0KHRyYWNrZXIpO1xuICAgIGRpZmZMaXN0LmhpZGUoKTtcbiAgICBjdXJyZW50WWVhciA9IHllYXI7XG4gIH1cblxuICAvLyBEaWZmOiBCIGlzIHRoZSBncm91bmQgKG11dGVkLCBpdHMgYm9yZGVycyk7IGFwcGVhcmVkID0gQiBmZWF0dXJlcyBpbiB0aGUgZm9jdXMgY29sb3VyO1xuICAvLyB2YW5pc2hlZCA9IEEgZmVhdHVyZXMgaGF0Y2hlZCBhbmQgb3V0bGluZWQgaW4gcnVzdDsgcGVyc2lzdGVkID0gbXV0ZWQuXG4gIGZ1bmN0aW9uIHNob3dEaWZmKGEsIGIsIGlkZW50aWZ5KSB7XG4gICAgY29uc3QgYU5hbWVkID0gbmFtZWRPZihhLnRvcG8pLCBiTmFtZWQgPSBuYW1lZE9mKGIudG9wbyk7XG4gICAgY29uc3QgZGlmZiA9IGNvbXB1dGVEaWZmKHsgYUZlYXR1cmVzOiBhTmFtZWQsIGFZZWFyOiBhLnllYXIsIGJGZWF0dXJlczogYk5hbWVkLCBiWWVhcjogYi55ZWFyLCBpZGVudGlmeSwgcGF0aCwgZnJhbWUsIG1pbkttMjogc3RhZ2UuZGlmZl9taW5fa20yID8/IDEyMDAwMCB9KTtcbiAgICBjb25zdCBhcHBlYXJlZCA9IGRpZmYuYXBwZWFyZWQuZmxhdE1hcCgoaXQpID0+IGl0LmIubWFwKChmKSA9PiAoeyBmLCBsYWJlbDogaXQubGFiZWwsIGtleTogaXQua2V5IH0pKSk7XG4gICAgY29uc3QgdmFuaXNoZWQgPSBkaWZmLnZhbmlzaGVkLmZsYXRNYXAoKGl0KSA9PiBpdC5hLm1hcCgoZikgPT4gKHsgZiwgbGFiZWw6IGl0LmxhYmVsLCBrZXk6IGl0LmtleSB9KSkpO1xuICAgIGNvbnN0IGNlcnRhaW50eSA9IGJOYW1lZFswXT8ucHJvcGVydGllcy5jZXJ0YWludHkgPz8gJ2FwcHJveGltYXRlJztcbiAgICBjcm9zc2ZhZGUoKGcsIGxnKSA9PiB7XG4gICAgICBnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvbGl0aWVzJykuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShiTmFtZWQpLmpvaW4oJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAoZikgPT4gYHBvbGl0eSAke2YucHJvcGVydGllcy5jZXJ0YWludHl9IG11dGVkYCkuYXR0cignZCcsIGQpXG4gICAgICAgIC5hcHBlbmQoJ3RpdGxlJykudGV4dCgoZikgPT4gZi5wcm9wZXJ0aWVzLm5hbWUpO1xuICAgICAgZy5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsIGBib3JkZXIgJHtjZXJ0YWludHl9YCkuYXR0cignZCcsIGQoaW50ZXJpb3JPZihiLnRvcG8pKSk7XG4gICAgICBnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ2FwcGVhcmVkJykuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShhcHBlYXJlZCkuam9pbigncGF0aCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdwb2xpdHkgYXBwZWFyZWQnKS5hdHRyKCdkJywgKHgpID0+IGQoeC5mKSkuYXBwZW5kKCd0aXRsZScpLnRleHQoKHgpID0+IGAke3gubGFiZWx9IFx1MjAxNCBhcHBlYXJlZCBieSAke2IueWVhcn1gKTtcbiAgICAgIGcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAndmFuaXNoZWQnKS5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKHZhbmlzaGVkKS5qb2luKCdwYXRoJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3BvbGl0eSB2YW5pc2hlZCcpLmF0dHIoJ2QnLCAoeCkgPT4gZCh4LmYpKS5hcHBlbmQoJ3RpdGxlJykudGV4dCgoeCkgPT4gYCR7eC5sYWJlbH0gXHUyMDE0IGdvbmUgYnkgJHtiLnllYXJ9YCk7XG4gICAgICBjb25zdCBsYWJlbGxlZCA9IChpdGVtcywgY2xzKSA9PiBwb2xpdHlMYWJlbERhdGEoaXRlbXMubWFwKCh4KSA9PiB7IHguZi5wcm9wZXJ0aWVzLmNscyA9IHsgbGFiZWw6IHgubGFiZWwgfTsgcmV0dXJuIHguZjsgfSksIHBhdGgpLm1hcCgobCkgPT4gKHsgLi4ubCwgY2xzIH0pKTtcbiAgICAgIGRyYXdQb2xpdHlMYWJlbHMobGcsIFsuLi5sYWJlbGxlZChhcHBlYXJlZCwgJ2FwcGVhcmVkJyksIC4uLmxhYmVsbGVkKHZhbmlzaGVkLCAndmFuaXNoZWQnKV0pO1xuICAgICAgbGcuc2VsZWN0QWxsKCd0ZXh0JykuYXR0cignY2xhc3MnLCAobCkgPT4gYGxhYmVsIHBvbGl0eSAke2wuY2xzID8/ICcnfWApO1xuICAgIH0pO1xuICAgIGxlZ2VuZC5zZXQoeyAuLi5ESUZGX0xFR0VORCwgdGl0bGU6IGBDaGFuZ2UgJHthLnllYXJ9IFx1MjE5MiAke2IueWVhcn1gIH0pO1xuICAgIGRpZmZMaXN0LnNldChkaWZmLCB5MCArIDIyICsgbGVnZW5kLmhlaWdodCgpICsgMTQpO1xuICAgIGN1cnJlbnRZZWFyID0gYi55ZWFyO1xuICAgIHJldHVybiBkaWZmO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0WWVhcih5ZWFyLCBzb3VyY2VZZWFyKSB7XG4gICAgY2FydG91Y2hlLnNldFllYXIoeWVhciwgc291cmNlWWVhcik7XG4gICAgc3RyaXAuc2V0WWVhcih5ZWFyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFJhbmdlKGEsIGIpIHtcbiAgICBjYXJ0b3VjaGUuc2V0UmFuZ2UoYSwgYik7XG4gICAgc3RyaXAuc2V0UmFuZ2UoYS55ZWFyLCBiLnllYXIpO1xuICB9XG5cbiAgcmV0dXJuIHsgcHJvamVjdGlvbiwgcGF0aCwgZCwgZnJhbWUsIHNob3dTbmFwc2hvdCwgc2hvd0RpZmYsIHNldFllYXIsIHNldFJhbmdlLCBsZWdlbmQsIGNhcnRvdWNoZSwgZ2V0IHllYXIoKSB7IHJldHVybiBjdXJyZW50WWVhcjsgfSB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZXhwb3J0XG4vLyBCYWtlcyB0aGUgY3VycmVudCB2aWV3IChtYXAsIGxlZ2VuZCwgY2FydG91Y2hlLCB0aW1lbGluZSBzdHJpcCkgaW50byBhIFBORyBvciBhbiBTVkcgdGhhdCBzdGFuZHMgYWxvbmU6XG4vLyB0aGUgcGFnZSBzdHlsZXMsIHRoZSBMaWJyZSBCYXNrZXJ2aWxsZSBmb250cyBhbmQgdGhlIHJlbGllZiBpbWFnZSBhcmUgZW1iZWRkZWQsIHNvIG5vdGhpbmcgcG9pbnRzIGJhY2tcbi8vIGF0IHRoZSBzaXRlLiBUaGUgdG9vbGJhciBsaXZlcyBvdXRzaWRlIHRoZSA8c3ZnPiwgc28gaXQgaXMgbmV2ZXIgcGFydCBvZiBhbiBleHBvcnQuXG5cbmltcG9ydCB7IFcsIEggfSBmcm9tICcuLi9yZW5kZXIvYmFzZS5qcyc7XG5cbmNvbnN0IFNWR19OUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5jb25zdCBkYXRhVVJMcyA9IG5ldyBNYXAoKTtcblxuLy8gRmV0Y2ggYSBVUkwgb25jZSBhbmQga2VlcCBpdCBhcyBhIGRhdGE6IFVSTCAoZm9udHMsIHJlbGllZikuXG5mdW5jdGlvbiB0b0RhdGFVUkwodXJsKSB7XG4gIGlmICh1cmwuc3RhcnRzV2l0aCgnZGF0YTonKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1cmwpO1xuICBpZiAoIWRhdGFVUkxzLmhhcyh1cmwpKSB7XG4gICAgZGF0YVVSTHMuc2V0KHVybCwgZmV0Y2godXJsKS50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmZXRjaCAke3VybH0gKEhUVFAgJHtyZXMuc3RhdHVzfSlgKTtcbiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXMuYmxvYigpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHIub25sb2FkID0gKCkgPT4gcmVzb2x2ZShyLnJlc3VsdCk7XG4gICAgICAgIHIub25lcnJvciA9ICgpID0+IHJlamVjdChyLmVycm9yKTtcbiAgICAgICAgci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuICAgICAgfSk7XG4gICAgfSkpO1xuICB9XG4gIHJldHVybiBkYXRhVVJMcy5nZXQodXJsKTtcbn1cblxuLy8gUmV3cml0ZSBldmVyeSB1cmwoLi4uKSBpbiBhIENTUyBydWxlIHRvIGEgZGF0YTogVVJMLCByZXNvbHZlZCBhZ2FpbnN0IHRoZSBzdHlsZXNoZWV0IGl0IGNhbWUgZnJvbS5cbmFzeW5jIGZ1bmN0aW9uIGlubGluZVVybHMoY3NzVGV4dCwgYmFzZSkge1xuICBjb25zdCBwYXJ0cyA9IFtdO1xuICBjb25zdCByZSA9IC91cmxcXCgoWydcIl0/KShbXidcIildKylcXDFcXCkvZztcbiAgbGV0IGxhc3QgPSAwLCBtO1xuICB3aGlsZSAoKG0gPSByZS5leGVjKGNzc1RleHQpKSkge1xuICAgIHBhcnRzLnB1c2goY3NzVGV4dC5zbGljZShsYXN0LCBtLmluZGV4KSk7XG4gICAgY29uc3QgYWJzID0gbmV3IFVSTChtWzJdLCBiYXNlKS5ocmVmO1xuICAgIHBhcnRzLnB1c2goYHVybChcIiR7YXdhaXQgdG9EYXRhVVJMKGFicyl9XCIpYCk7XG4gICAgbGFzdCA9IG0uaW5kZXggKyBtWzBdLmxlbmd0aDtcbiAgfVxuICBwYXJ0cy5wdXNoKGNzc1RleHQuc2xpY2UobGFzdCkpO1xuICByZXR1cm4gcGFydHMuam9pbignJyk7XG59XG5cbi8vIEV2ZXJ5IHNhbWUtb3JpZ2luIHN0eWxlc2hlZXQgcnVsZSBvbiB0aGUgcGFnZSwgd2l0aCBAZm9udC1mYWNlIHNvdXJjZXMgZW1iZWRkZWQuIFJ1bGVzIHRoYXQgb25seSBtYXR0ZXJcbi8vIHRvIHRoZSBwYWdlIChib2R5LCB0b29sYmFyKSBhcmUgaGFybWxlc3MgaW5zaWRlIGFuIFNWRyBkb2N1bWVudC5cbmFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RDU1MoKSB7XG4gIGNvbnN0IG91dCA9IFtdO1xuICBmb3IgKGNvbnN0IHNoZWV0IG9mIGRvY3VtZW50LnN0eWxlU2hlZXRzKSB7XG4gICAgbGV0IHJ1bGVzO1xuICAgIHRyeSB7IHJ1bGVzID0gc2hlZXQuY3NzUnVsZXM7IH0gY2F0Y2ggeyBjb250aW51ZTsgfVxuICAgIGNvbnN0IGJhc2UgPSBzaGVldC5ocmVmIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICBvdXQucHVzaChydWxlIGluc3RhbmNlb2YgQ1NTRm9udEZhY2VSdWxlID8gYXdhaXQgaW5saW5lVXJscyhydWxlLmNzc1RleHQsIGJhc2UpIDogcnVsZS5jc3NUZXh0KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dC5qb2luKCdcXG4nKTtcbn1cblxuLy8gQSBzZWxmLWNvbnRhaW5lZCBjb3B5IG9mIHRoZSBtYXAgYXMgU1ZHIHRleHQuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc25hcHNob3RTVkcoc3ZnTm9kZSwgeyB0cmFuc3BhcmVudCA9IGZhbHNlIH0gPSB7fSkge1xuICBjb25zdCBjbG9uZSA9IHN2Z05vZGUuY2xvbmVOb2RlKHRydWUpO1xuICBjbG9uZS5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgU1ZHX05TKTtcbiAgY2xvbmUuc2V0QXR0cmlidXRlKCd4bWxuczp4bGluaycsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyk7XG4gIGNsb25lLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBXKTtcbiAgY2xvbmUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBIKTtcbiAgY2xvbmUucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXG4gIC8vIEEgY3Jvc3NmYWRlIG1heSBiZSBtaWQtZmxpZ2h0OiBrZWVwIG9ubHkgdGhlIG5ld2VzdCBzbmFwc2hvdCBsYXllciwgZnVsbHkgb3BhcXVlLlxuICBmb3IgKGNvbnN0IHNlbCBvZiBbJ2cuc25hcHNob3RzID4gZy5zbmFwJywgJ2cucG9saXR5LWxhYmVscyA+IGcuc25hcC1sYWJlbHMnXSkge1xuICAgIGNvbnN0IGxheWVycyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKTtcbiAgICBsYXllcnMuZm9yRWFjaCgoZywgaSkgPT4geyBpZiAoaSA8IGxheWVycy5sZW5ndGggLSAxKSBnLnJlbW92ZSgpOyBlbHNlIGcuc3R5bGUub3BhY2l0eSA9IDE7IH0pO1xuICB9XG4gIC8vIFRyYW5zcGFyZW50IGJhY2tncm91bmQ6IG5vIHNoZWV0LCBubyBncmFpbiwgbm8gdmlnbmV0dGUuIE9mZiBieSBkZWZhdWx0LlxuICBpZiAodHJhbnNwYXJlbnQpIGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoJy5wYXBlciwgLnBhcGVyLW92ZXJsYXksIC5wYXBlci12aWduZXR0ZScpLmZvckVhY2goKGUpID0+IGUucmVtb3ZlKCkpO1xuXG4gIGZvciAoY29uc3QgaW1nIG9mIGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltYWdlJykpIHtcbiAgICBjb25zdCBocmVmID0gaW1nLmdldEF0dHJpYnV0ZSgnaHJlZicpIHx8IGltZy5nZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdocmVmJyk7XG4gICAgaWYgKGhyZWYpIGltZy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBhd2FpdCB0b0RhdGFVUkwobmV3IFVSTChocmVmLCBsb2NhdGlvbi5ocmVmKS5ocmVmKSk7XG4gIH1cblxuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdzdHlsZScpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGF3YWl0IGNvbGxlY3RDU1MoKTtcbiAgY2xvbmUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBjbG9uZS5maXJzdENoaWxkKTtcblxuICByZXR1cm4gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCI/PlxcbicgKyBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKGNsb25lKTtcbn1cblxuZnVuY3Rpb24gbG9hZEltYWdlKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgaW1nLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCdUaGUgbWFwIGltYWdlIGNvdWxkIG5vdCBiZSByZW5kZXJlZCBmb3IgZXhwb3J0LicpKTtcbiAgICBpbWcuc3JjID0gdXJsO1xuICB9KTtcbn1cblxuLy8gUmVuZGVyIHRoZSBjdXJyZW50IHZpZXcgdG8gYSBQTkcgYmxvYiBhdCB0aGUgZ2l2ZW4gcGl4ZWwgc2l6ZSAodGhlIHNoZWV0IGlzIDE2Ojk7IG90aGVyIHNpemVzIGxldHRlcmJveCkuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVuZGVyUE5HKHN2Z05vZGUsIHsgd2lkdGggPSAxOTIwLCBoZWlnaHQgPSAxMDgwLCB0cmFuc3BhcmVudCA9IGZhbHNlIH0gPSB7fSkge1xuICBjb25zdCB4bWwgPSBhd2FpdCBzbmFwc2hvdFNWRyhzdmdOb2RlLCB7IHRyYW5zcGFyZW50IH0pO1xuICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFt4bWxdLCB7IHR5cGU6ICdpbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgnIH0pKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBpbWcgPSBhd2FpdCBsb2FkSW1hZ2UodXJsKTtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnN0IHMgPSBNYXRoLm1pbih3aWR0aCAvIFcsIGhlaWdodCAvIEgpO1xuICAgIGNvbnN0IGR3ID0gVyAqIHMsIGRoID0gSCAqIHM7XG4gICAgY3R4LmRyYXdJbWFnZShpbWcsICh3aWR0aCAtIGR3KSAvIDIsIChoZWlnaHQgLSBkaCkgLyAyLCBkdywgZGgpO1xuICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gY2FudmFzLnRvQmxvYihyZXNvbHZlLCAnaW1hZ2UvcG5nJykpO1xuICAgIGlmICghYmxvYikgdGhyb3cgbmV3IEVycm9yKCdUaGUgYnJvd3NlciBjb3VsZCBub3QgZW5jb2RlIHRoZSBQTkcuJyk7XG4gICAgcmV0dXJuIGJsb2I7XG4gIH0gZmluYWxseSB7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW5kZXJTVkcoc3ZnTm9kZSwgeyB0cmFuc3BhcmVudCA9IGZhbHNlIH0gPSB7fSkge1xuICBjb25zdCB4bWwgPSBhd2FpdCBzbmFwc2hvdFNWRyhzdmdOb2RlLCB7IHRyYW5zcGFyZW50IH0pO1xuICByZXR1cm4gbmV3IEJsb2IoW3htbF0sIHsgdHlwZTogJ2ltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCcgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZChibG9iLCBmaWxlbmFtZSkge1xuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gIGEuY2xpY2soKTtcbiAgYS5yZW1vdmUoKTtcbiAgc2V0VGltZW91dCgoKSA9PiBVUkwucmV2b2tlT2JqZWN0VVJMKGEuaHJlZiksIDEwMDAwKTtcbn1cblxuLy8gRXhwb3J0IGZpbGVuYW1lczogcGFyY2htZW50LTxzdGFnZT4tPHllYXI+Wy08dG8+XVstNGtdLjxleHQ+LiBCcmFuZGVkIFBhcmNobWVudCBvbmx5LlxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydE5hbWUoeyBzdGFnZSwgeWVhciwgZnJvbSA9IG51bGwsIHNpemUgPSAnJywgZXh0IH0pIHtcbiAgY29uc3Qgc3BhbiA9IGZyb20gIT0gbnVsbCA/IGAke2Zyb219LSR7eWVhcn1gIDogYCR7eWVhcn1gO1xuICByZXR1cm4gYHBhcmNobWVudC0ke3N0YWdlfS0ke3NwYW59JHtzaXplID8gYC0ke3NpemV9YCA6ICcnfS4ke2V4dH1gO1xufVxuIiwgIntcbiAgXCJpZFwiOiBcImFmcm8tZXVyYXNpYVwiLFxuICBcInRpdGxlXCI6IFwiQWZyby1FdXJhc2lhXCIsXG4gIFwicHJvamVjdGlvblwiOiBcImVxdWFsRWFydGhcIixcbiAgXCJyb3RhdGVcIjogW1xuICAgIC02MCxcbiAgICAwXG4gIF0sXG4gIFwiZXh0ZW50XCI6IHtcbiAgICBcIndlc3RcIjogLTIwLFxuICAgIFwic291dGhcIjogNixcbiAgICBcImVhc3RcIjogMTUwLFxuICAgIFwibm9ydGhcIjogNzZcbiAgfSxcbiAgXCJzcGFuXCI6IFtcbiAgICAxMjAwLFxuICAgIDIwMDBcbiAgXSxcbiAgXCJyZWxpZWZcIjogXCJyZWxpZWYvYWZyby1ldXJhc2lhLnBuZ1wiLFxuICBcImxhYmVsc1wiOiBbXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiRXVyb3BlXCIsXG4gICAgICBcImxvblwiOiAxNCxcbiAgICAgIFwibGF0XCI6IDUyLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk5vcnRoIEFmcmljYVwiLFxuICAgICAgXCJsb25cIjogMTIsXG4gICAgICBcImxhdFwiOiAyNixcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJXZXN0IEFmcmljYVwiLFxuICAgICAgXCJsb25cIjogMTcsXG4gICAgICBcImxhdFwiOiAxMSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJNaWRkbGUgRWFzdFwiLFxuICAgICAgXCJsb25cIjogNDMsXG4gICAgICBcImxhdFwiOiAyNi41LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNlbnRyYWwgQXNpYVwiLFxuICAgICAgXCJsb25cIjogNjYsXG4gICAgICBcImxhdFwiOiA0NSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aCBBc2lhXCIsXG4gICAgICBcImxvblwiOiA3NyxcbiAgICAgIFwibGF0XCI6IDE3LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkVhc3QgQXNpYVwiLFxuICAgICAgXCJsb25cIjogMTIwLFxuICAgICAgXCJsYXRcIjogNDQsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGhlYXN0IEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDExMSxcbiAgICAgIFwibGF0XCI6IDksXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU2liZXJpYVwiLFxuICAgICAgXCJsb25cIjogOTIsXG4gICAgICBcImxhdFwiOiA2OSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJNZWRpdGVycmFuZWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTgsXG4gICAgICBcImxhdFwiOiAzNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkluZGlhbiBPY2VhblwiLFxuICAgICAgXCJsb25cIjogNzUsXG4gICAgICBcImxhdFwiOiAzLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJBcmFiaWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogNjQsXG4gICAgICBcImxhdFwiOiAxMixcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkJheSBvZiBCZW5nYWxcIixcbiAgICAgIFwibG9uXCI6IDg5LFxuICAgICAgXCJsYXRcIjogMTEuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoIENoaW5hIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTE1LFxuICAgICAgXCJsYXRcIjogMTYsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJCbGFjayBTZWFcIixcbiAgICAgIFwibG9uXCI6IDM0LFxuICAgICAgXCJsYXRcIjogNDMuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNhc3BpYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiA1MSxcbiAgICAgIFwibGF0XCI6IDQxLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJSZWQgU2VhXCIsXG4gICAgICBcImxvblwiOiAzOCxcbiAgICAgIFwibGF0XCI6IDIwLFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQXRsYW50aWMgT2NlYW5cIixcbiAgICAgIFwibG9uXCI6IC0xNixcbiAgICAgIFwibGF0XCI6IDM2LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH1cbiAgXSxcbiAgXCJkaWZmX21pbl9rbTJcIjogMTIwMDAwXG59XG4iLCAie1xuICBcImlkXCI6IFwiYWZyby1ldXJhc2lhLWxhbWJlcnRcIixcbiAgXCJ0aXRsZVwiOiBcIkFmcm8tRXVyYXNpYSAoYXppbXV0aGFsKVwiLFxuICBcInByb2plY3Rpb25cIjogXCJsYW1iZXJ0QXppbXV0aGFsRXF1YWxBcmVhXCIsXG4gIFwicm90YXRlXCI6IFtcbiAgICAtNjAsXG4gICAgLTQ1XG4gIF0sXG4gIFwiZXh0ZW50XCI6IHtcbiAgICBcIndlc3RcIjogLTIwLFxuICAgIFwic291dGhcIjogNixcbiAgICBcImVhc3RcIjogMTUwLFxuICAgIFwibm9ydGhcIjogNzZcbiAgfSxcbiAgXCJzcGFuXCI6IFtcbiAgICAxMjAwLFxuICAgIDIwMDBcbiAgXSxcbiAgXCJyZWxpZWZcIjogXCJyZWxpZWYvYWZyby1ldXJhc2lhLWxhbWJlcnQucG5nXCIsXG4gIFwibGFiZWxzXCI6IFtcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJFdXJvcGVcIixcbiAgICAgIFwibG9uXCI6IDE1LFxuICAgICAgXCJsYXRcIjogNTAsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiTm9ydGggQWZyaWNhXCIsXG4gICAgICBcImxvblwiOiAxMCxcbiAgICAgIFwibGF0XCI6IDI3LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIldlc3QgQWZyaWNhXCIsXG4gICAgICBcImxvblwiOiAtMixcbiAgICAgIFwibGF0XCI6IDEzLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk1pZGRsZSBFYXN0XCIsXG4gICAgICBcImxvblwiOiA0NCxcbiAgICAgIFwibGF0XCI6IDI5LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNlbnRyYWwgQXNpYVwiLFxuICAgICAgXCJsb25cIjogNjYsXG4gICAgICBcImxhdFwiOiA0NCxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aCBBc2lhXCIsXG4gICAgICBcImxvblwiOiA3OCxcbiAgICAgIFwibGF0XCI6IDIyLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkVhc3QgQXNpYVwiLFxuICAgICAgXCJsb25cIjogMTEyLFxuICAgICAgXCJsYXRcIjogMzYsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGhlYXN0IEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDEwNCxcbiAgICAgIFwibGF0XCI6IDEyLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNpYmVyaWFcIixcbiAgICAgIFwibG9uXCI6IDEwMCxcbiAgICAgIFwibGF0XCI6IDY0LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk1lZGl0ZXJyYW5lYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiAxNyxcbiAgICAgIFwibGF0XCI6IDM1LjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJJbmRpYW4gT2NlYW5cIixcbiAgICAgIFwibG9uXCI6IDc1LFxuICAgICAgXCJsYXRcIjogNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkFyYWJpYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiA2MyxcbiAgICAgIFwibGF0XCI6IDE1LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQmF5IG9mIEJlbmdhbFwiLFxuICAgICAgXCJsb25cIjogODgsXG4gICAgICBcImxhdFwiOiAxMyxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoIENoaW5hIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTE0LFxuICAgICAgXCJsYXRcIjogMTUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJCbGFjayBTZWFcIixcbiAgICAgIFwibG9uXCI6IDM0LFxuICAgICAgXCJsYXRcIjogNDMuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNhc3BpYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiA1MC41LFxuICAgICAgXCJsYXRcIjogNDEuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlJlZCBTZWFcIixcbiAgICAgIFwibG9uXCI6IDM4LFxuICAgICAgXCJsYXRcIjogMjAsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJBdGxhbnRpYyBPY2VhblwiLFxuICAgICAgXCJsb25cIjogLTE0LFxuICAgICAgXCJsYXRcIjogMzgsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfVxuICBdLFxuICBcImRpZmZfbWluX2ttMlwiOiAxMjAwMDBcbn1cbiIsICJ7XG4gIFwiX2NvbW1lbnRcIjogXCJFeHRlbnQgdHJhY2tlciAodjApLiBXaGljaCBkb3dubG9hZGVkIGJhc2UgcG9seWdvbnMgYXJlIGhpZ2hsaWdodGVkLCBieSB0aGUgTkFNRSB0aGUgYmFzZSBtYXAgZ2l2ZXMgdGhlbSBpbiBlYWNoIGVyYSwgYm91bmRlZCBieSBzdGFydC9lbmQgeWVhcnMuIFRoZSBwb2x5Z29ucyB0aGVtc2VsdmVzIGFyZSBuZXZlciBlZGl0ZWQuIFJvd3MgaW4gZGF0YS9yZWNvcmRzLmNzdiB3aXRoIHRyYWNrZXI9ZXh0ZW50IGNhbiBhZGQgdG8gb3Igb3ZlcnJpZGUgdGhpcyBsaXN0LlwiLFxuICBcInRpdGxlXCI6IFwiRXh0ZW50IG9mIHN0YXRlc1wiLFxuICBcImZpbGxfa2V5XCI6IFwiUFwiLFxuICBcImxlZ2VuZFwiOiBbXG4gICAge1xuICAgICAgXCJzd2F0Y2hcIjogXCJmaWxsXCIsXG4gICAgICBcImtleVwiOiBcIlBcIixcbiAgICAgIFwibGFiZWxcIjogXCJIaWdobGlnaHRlZCBzdGF0ZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInN3YXRjaFwiOiBcImxpbmVcIixcbiAgICAgIFwic3R5bGVcIjogXCJzb2xpZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIkRvY3VtZW50ZWQgYm9yZGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3dhdGNoXCI6IFwibGluZVwiLFxuICAgICAgXCJzdHlsZVwiOiBcImRhc2hlZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIkFwcHJveGltYXRlIGJvcmRlclwiXG4gICAgfVxuICBdLFxuICBcImhpZ2hsaWdodHNcIjogW1xuICAgIHtcbiAgICAgIFwiaWRcIjogXCJvdHRvbWFuXCIsXG4gICAgICBcImxhYmVsXCI6IFwiT3R0b21hbiBFbXBpcmVcIixcbiAgICAgIFwic3RhcnRcIjogMTI5OSxcbiAgICAgIFwiZW5kXCI6IDE5MjIsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJPdHRvbWFuIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwic2FmYXZpZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIlNhZmF2aWQgRW1waXJlXCIsXG4gICAgICBcInN0YXJ0XCI6IDE1MDEsXG4gICAgICBcImVuZFwiOiAxNzM2LFxuICAgICAgXCJuYW1lc1wiOiBbXG4gICAgICAgIFwiU2FmYXZpZCBFbXBpcmVcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiBcIm11Z2hhbFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIk11Z2hhbCBFbXBpcmVcIixcbiAgICAgIFwic3RhcnRcIjogMTUyNixcbiAgICAgIFwiZW5kXCI6IDE4NTcsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNdWdoYWwgRW1waXJlXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJtaW5nXCIsXG4gICAgICBcImxhYmVsXCI6IFwiTWluZyBDaGluYVwiLFxuICAgICAgXCJzdGFydFwiOiAxMzY4LFxuICAgICAgXCJlbmRcIjogMTY0NCxcbiAgICAgIFwibmFtZXNcIjogW1xuICAgICAgICBcIk1pbmcgRW1waXJlXCIsXG4gICAgICAgIFwiTWluZyBDaGluZXNlIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwicWluZ1wiLFxuICAgICAgXCJsYWJlbFwiOiBcIlFpbmcgQ2hpbmFcIixcbiAgICAgIFwic3RhcnRcIjogMTY0NCxcbiAgICAgIFwiZW5kXCI6IDE5MTIsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNYW5jaHUgRW1waXJlXCIsXG4gICAgICAgIFwiUWluZyBFbXBpcmVcIixcbiAgICAgICAgXCJRaW5nIER5bmFzdHlcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiBcInNvbmdoYWlcIixcbiAgICAgIFwibGFiZWxcIjogXCJTb25naGFpIEVtcGlyZVwiLFxuICAgICAgXCJzdGFydFwiOiAxNDY0LFxuICAgICAgXCJlbmRcIjogMTU5MSxcbiAgICAgIFwibmFtZXNcIjogW1xuICAgICAgICBcIlNvbmdoYWlcIixcbiAgICAgICAgXCJTb25naGFpIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwibW9yb2Njb1wiLFxuICAgICAgXCJsYWJlbFwiOiBcIk1vcm9jY29cIixcbiAgICAgIFwic3RhcnRcIjogMTQ1MCxcbiAgICAgIFwiZW5kXCI6IDIwMDAsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNb3JvY2NvXCIsXG4gICAgICAgIFwiV2F0dGFzaWQgQ2FsaXBoYXRlXCIsXG4gICAgICAgIFwiV2F0YXNzaWQgTW9yb2Njb1wiLFxuICAgICAgICBcIlNhYWRpIE1vcm9jY29cIixcbiAgICAgICAgXCJTYWFkaSBTdWx0YW5hdGVcIixcbiAgICAgICAgXCJBbGFvdWl0ZSBNb3JvY2NvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJydXNzaWFcIixcbiAgICAgIFwibGFiZWxcIjogXCJSdXNzaWFcIixcbiAgICAgIFwic3RhcnRcIjogMTQ1MCxcbiAgICAgIFwiZW5kXCI6IDIwMDAsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJHcmFuZCBEdWNoeSBvZiBNb3Njb3dcIixcbiAgICAgICAgXCJUc2FyZG9tIG9mIE11c2NvdnlcIixcbiAgICAgICAgXCJUc2FyZG9tIG9mIFJ1c3NpYVwiLFxuICAgICAgICBcIlJ1c3NpYW4gRW1waXJlXCIsXG4gICAgICAgIFwiUnVzc2lhXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJ0b2t1Z2F3YVwiLFxuICAgICAgXCJsYWJlbFwiOiBcIlRva3VnYXdhIEphcGFuXCIsXG4gICAgICBcInN0YXJ0XCI6IDE2MDMsXG4gICAgICBcImVuZFwiOiAxODY4LFxuICAgICAgXCJuYW1lc1wiOiBbXG4gICAgICAgIFwiVG9rdWdhd2Egc2hvZ3VuYXRlXCIsXG4gICAgICAgIFwiVG9rdWdhd2EgU2hvZ3VuYXRlXCJcbiAgICAgIF1cbiAgICB9XG4gIF1cbn1cbiIsICIvLyBQYXJjaG1lbnQgXHUyMDE0IGVudHJ5IHBvaW50XG5pbXBvcnQgKiBhcyBkMyBmcm9tICdkMyc7XG5pbXBvcnQgeyBsb2FkSlNPTiB9IGZyb20gJy4vZGF0YS9sb2FkZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RhZ2UgfSBmcm9tICcuL3JlbmRlci9iYXNlLmpzJztcbmltcG9ydCB7IHJlbmRlclBORywgcmVuZGVyU1ZHLCBkb3dubG9hZCwgZXhwb3J0TmFtZSB9IGZyb20gJy4vZXhwb3J0L2V4cG9ydC5qcyc7XG5pbXBvcnQgc3RhZ2VFcXVhbEVhcnRoIGZyb20gJy4vc3RhZ2VzL2Fmcm8tZXVyYXNpYS5qc29uJztcbmltcG9ydCBzdGFnZUxhbWJlcnQgZnJvbSAnLi9zdGFnZXMvYWZyby1ldXJhc2lhLWxhbWJlcnQuanNvbic7XG5pbXBvcnQgZXh0ZW50IGZyb20gJy4vdHJhY2tlcnMvZXh0ZW50Lmpzb24nO1xuXG5jb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCk7XG5jb25zdCBTVEFSVF9ZRUFSID0gTnVtYmVyKHBhcmFtcy5nZXQoJ3llYXInKSkgfHwgMTQ1MDtcbmNvbnN0IFNUQVJUX0ZST00gPSBOdW1iZXIocGFyYW1zLmdldCgnZnJvbScpKSB8fCBudWxsOyAvLyA/ZnJvbT0xNDUwJnllYXI9MTc1MCBvcGVucyB0aGUgRGlmZiB2aWV3XG5jb25zdCBQTEFZX0hPTERfTVMgPSAxNTAwO1xuXG4vLyA/c3RhZ2U9YWZyby1ldXJhc2lhLWxhbWJlcnQgc2hvd3MgdGhlIGFsdGVybmF0aXZlIHByb2plY3Rpb24gZm9yIGNvbXBhcmlzb24uXG5jb25zdCBTVEFHRVMgPSB7IFtzdGFnZUVxdWFsRWFydGguaWRdOiBzdGFnZUVxdWFsRWFydGgsIFtzdGFnZUxhbWJlcnQuaWRdOiBzdGFnZUxhbWJlcnQgfTtcbmNvbnN0IHN0YWdlID0gU1RBR0VTW3BhcmFtcy5nZXQoJ3N0YWdlJyldID8/IHN0YWdlRXF1YWxFYXJ0aDtcblxuLy8gRXh0ZW50IHRyYWNrZXI6IGEgYmFzZSBwb2x5Z29uIGlzIGhpZ2hsaWdodGVkIHdoZW4gaXRzIE5BTUUgbWF0Y2hlcyBhIGhpZ2hsaWdodCBlbnRyeSBhbGl2ZSBpbiB0aGF0IHllYXIuXG5jb25zdCBieU5hbWUgPSBuZXcgTWFwKCk7XG5mb3IgKGNvbnN0IGggb2YgZXh0ZW50LmhpZ2hsaWdodHMpIGZvciAoY29uc3QgbiBvZiBoLm5hbWVzKSBieU5hbWUuc2V0KG4sIGgpO1xuZnVuY3Rpb24gbWF0Y2hIaWdobGlnaHQoZiwgeWVhcikge1xuICBjb25zdCBoID0gYnlOYW1lLmdldChmLnByb3BlcnRpZXMubmFtZSk7XG4gIHJldHVybiBoICYmIHllYXIgPj0gaC5zdGFydCAmJiB5ZWFyIDw9IGguZW5kID8gaCA6IG51bGw7XG59XG5mdW5jdGlvbiBjbGFzc2lmeUV4dGVudChmLCB5ZWFyKSB7XG4gIGNvbnN0IGggPSBtYXRjaEhpZ2hsaWdodChmLCB5ZWFyKTtcbiAgcmV0dXJuIGggPyB7IHN0YXR1czogJ2hpZ2hsaWdodCcsIGtleTogaC5pZCwgbGFiZWw6IGgubGFiZWwgfSA6IHsgc3RhdHVzOiAnbXV0ZWQnIH07XG59XG4vLyBEaWZmIGlkZW50aXR5OiBhIHRyYWNrZWQgc3RhdGUga2VlcHMgaXRzIGlkZW50aXR5IGFjcm9zcyByZW5hbWVzIChNdXNjb3Z5IFx1MjE5MiBSdXNzaWEpLiBXaXRoIHNjb3BlICd0cmFja2VkJ1xuLy8gKHRoZSBkZWZhdWx0KSBvbmx5IHRyYWNrZWQgc3RhdGVzIHRha2UgcGFydDsgd2l0aCBzY29wZSAnYWxsJyBldmVyeSBuYW1lZCBwb2x5Z29uIGRvZXMsIGJ5IGl0cyBuYW1lLlxuZnVuY3Rpb24gaWRlbnRpZnlGb3Ioc2NvcGUpIHtcbiAgcmV0dXJuIChmLCB5ZWFyKSA9PiB7XG4gICAgY29uc3QgaCA9IG1hdGNoSGlnaGxpZ2h0KGYsIHllYXIpO1xuICAgIGlmIChoKSByZXR1cm4geyBrZXk6IGBoOiR7aC5pZH1gLCBsYWJlbDogaC5sYWJlbCB9O1xuICAgIHJldHVybiBzY29wZSA9PT0gJ2FsbCcgPyB7IGtleTogYG46JHtmLnByb3BlcnRpZXMubmFtZX1gLCBsYWJlbDogZi5wcm9wZXJ0aWVzLm5hbWUgfSA6IG51bGw7XG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIGNvbnN0IHQwID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IFtjYWxlbmRhciwgbmUsIGJhdGh5XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICBsb2FkSlNPTignZGF0YS9jYWxlbmRhci5qc29uJyksXG4gICAgbG9hZEpTT04oJ2RhdGEvYmFzZS9kZXJpdmVkL25lLnRvcG9qc29uJyksXG4gICAgbG9hZEpTT04oJ2RhdGEvYmFzZS9kZXJpdmVkL2JhdGh5bWV0cnkudG9wb2pzb24nKSxcbiAgXSk7XG4gIGNvbnN0IHllYXJzID0gY2FsZW5kYXIuc25hcHNob3RzLm1hcCgocykgPT4gcy55ZWFyKTtcbiAgY29uc3QgYnlTbmFwc2hvdCA9IG5ldyBNYXAoY2FsZW5kYXIuc25hcHNob3RzLm1hcCgocykgPT4gW3MueWVhciwgc10pKTtcbiAgY29uc3Qgc25hcHNob3QgPSAoeWVhcikgPT4gbG9hZEpTT04oYGRhdGEvYmFzZS9kZXJpdmVkL3dvcmxkXyR7eWVhcn0udG9wb2pzb25gKTtcblxuICBjb25zdCBzdGF0ZSA9IHsgbW9kZTogJ3NuYXBzaG90Jywgc2NvcGU6IHBhcmFtcy5nZXQoJ3Njb3BlJykgPT09ICdhbGwnID8gJ2FsbCcgOiAndHJhY2tlZCcsIHllYXI6IFNUQVJUX1lFQVIsIGZyb206IFNUQVJUX0ZST00gPz8geWVhcnNbTWF0aC5tYXgoMCwgeWVhcnMuaW5kZXhPZihTVEFSVF9ZRUFSKSAtIDEpXSwgcGxheWluZzogbnVsbCB9O1xuXG4gIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdCgnI21hcCcpO1xuICBjb25zdCBhdGxhcyA9IGNyZWF0ZVN0YWdlKHN2Zywgc3RhZ2UsIHsgbmUsIGJhdGh5IH0sIHsgdHJhY2tlcjogZXh0ZW50LCB5ZWFycywgb25ZZWFyOiAoeSkgPT4gc2V0WWVhcih5KSB9KTtcbiAgY29uc29sZS5sb2coYHN0YWdlIGJ1aWx0IGluICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdDApLnRvRml4ZWQoMCl9IG1zYCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGNvbnN0IHQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBpZiAoc3RhdGUubW9kZSA9PT0gJ2RpZmYnKSB7XG4gICAgICBjb25zdCBbYSwgYl0gPSBhd2FpdCBQcm9taXNlLmFsbChbc25hcHNob3Qoc3RhdGUuZnJvbSksIHNuYXBzaG90KHN0YXRlLnllYXIpXSk7XG4gICAgICBjb25zdCBkaWZmID0gYXRsYXMuc2hvd0RpZmYoeyB5ZWFyOiBzdGF0ZS5mcm9tLCB0b3BvOiBhIH0sIHsgeWVhcjogc3RhdGUueWVhciwgdG9wbzogYiB9LCBpZGVudGlmeUZvcihzdGF0ZS5zY29wZSkpO1xuICAgICAgYXRsYXMuc2V0UmFuZ2UoeyB5ZWFyOiBzdGF0ZS5mcm9tLCBzb3VyY2VZZWFyOiBieVNuYXBzaG90LmdldChzdGF0ZS5mcm9tKS5zb3VyY2VfeWVhciB9LCB7IHllYXI6IHN0YXRlLnllYXIsIHNvdXJjZVllYXI6IGJ5U25hcHNob3QuZ2V0KHN0YXRlLnllYXIpLnNvdXJjZV95ZWFyIH0pO1xuICAgICAgZG9jdW1lbnQudGl0bGUgPSBgUGFyY2htZW50IFx1MDBCNyAke3N0YXRlLmZyb219IFx1MjE5MiAke3N0YXRlLnllYXJ9YDtcbiAgICAgIGNvbnNvbGUubG9nKGBkaWZmICR7c3RhdGUuZnJvbX0gXHUyMTkyICR7c3RhdGUueWVhcn06ICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdCkudG9GaXhlZCgxKX0gbXM7IGFwcGVhcmVkICR7ZGlmZi5hcHBlYXJlZC5sZW5ndGh9LCB2YW5pc2hlZCAke2RpZmYudmFuaXNoZWQubGVuZ3RofSwgcGVyc2lzdGVkICR7ZGlmZi5wZXJzaXN0ZWQubGVuZ3RofWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0b3BvID0gYXdhaXQgc25hcHNob3Qoc3RhdGUueWVhcik7XG4gICAgICBhdGxhcy5zaG93U25hcHNob3Qoc3RhdGUueWVhciwgdG9wbywgY2xhc3NpZnlFeHRlbnQpO1xuICAgICAgYXRsYXMuc2V0WWVhcihzdGF0ZS55ZWFyLCBieVNuYXBzaG90LmdldChzdGF0ZS55ZWFyKS5zb3VyY2VfeWVhcik7XG4gICAgICBkb2N1bWVudC50aXRsZSA9IGBQYXJjaG1lbnQgXHUwMEI3ICR7c3RhdGUueWVhcn1gO1xuICAgICAgY29uc29sZS5sb2coYHNuYXBzaG90ICR7c3RhdGUueWVhcn06ICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdCkudG9GaXhlZCgxKX0gbXNgKTtcbiAgICB9XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdtb2RlLWRpZmYnLCBzdGF0ZS5tb2RlID09PSAnZGlmZicpO1xuICAgIGQzLnNlbGVjdEFsbCgnI3Rvb2xiYXIgW2RhdGEtbW9kZV0nKS5jbGFzc2VkKCdhY3RpdmUnLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmRhdGFzZXQubW9kZSA9PT0gc3RhdGUubW9kZTsgfSk7XG4gICAgZDMuc2VsZWN0QWxsKCcjeWVhcnMgYnV0dG9uJykuY2xhc3NlZCgnYWN0aXZlJywgZnVuY3Rpb24gKCkgeyByZXR1cm4gTnVtYmVyKHRoaXMuZGF0YXNldC55ZWFyKSA9PT0gc3RhdGUueWVhcjsgfSk7XG4gICAgZDMuc2VsZWN0QWxsKCcjeWVhcnMtYSBidXR0b24nKS5jbGFzc2VkKCdhY3RpdmUnLCBmdW5jdGlvbiAoKSB7IHJldHVybiBOdW1iZXIodGhpcy5kYXRhc2V0LnllYXIpID09PSBzdGF0ZS5mcm9tOyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFllYXIoeSkgeyBpZiAoeWVhcnMuaW5jbHVkZXMoeSkpIHsgc3RhdGUueWVhciA9IHk7IHJlbmRlcigpOyB9IH1cbiAgZnVuY3Rpb24gc2V0RnJvbSh5KSB7IGlmICh5ZWFycy5pbmNsdWRlcyh5KSkgeyBzdGF0ZS5mcm9tID0geTsgcmVuZGVyKCk7IH0gfVxuICBmdW5jdGlvbiBzZXRNb2RlKG0pIHsgc3RhdGUubW9kZSA9IG07IGlmIChtID09PSAnZGlmZicgJiYgc3RhdGUuZnJvbSA9PT0gc3RhdGUueWVhcikgc3RhdGUuZnJvbSA9IHllYXJzW01hdGgubWF4KDAsIHllYXJzLmluZGV4T2Yoc3RhdGUueWVhcikgLSAxKV07IHJlbmRlcigpOyB9XG4gIGZ1bmN0aW9uIHN0ZXAoZGVsdGEpIHtcbiAgICBjb25zdCBpID0geWVhcnMuaW5kZXhPZihzdGF0ZS55ZWFyKTtcbiAgICBjb25zdCBqID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeWVhcnMubGVuZ3RoIC0gMSwgaSArIGRlbHRhKSk7XG4gICAgaWYgKGogIT09IGkpIHNldFllYXIoeWVhcnNbal0pO1xuICAgIHJldHVybiBqICE9PSBpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZVBsYXkoKSB7XG4gICAgaWYgKHN0YXRlLnBsYXlpbmcpIHsgY2xlYXJJbnRlcnZhbChzdGF0ZS5wbGF5aW5nKTsgc3RhdGUucGxheWluZyA9IG51bGw7IH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICh5ZWFycy5pbmRleE9mKHN0YXRlLnllYXIpID09PSB5ZWFycy5sZW5ndGggLSAxKSBzZXRZZWFyKHllYXJzWzBdKTtcbiAgICAgIHN0YXRlLnBsYXlpbmcgPSBzZXRJbnRlcnZhbCgoKSA9PiB7IGlmICghc3RlcCgxKSkgdG9nZ2xlUGxheSgpOyB9LCBQTEFZX0hPTERfTVMpO1xuICAgIH1cbiAgICBkMy5zZWxlY3QoJyNwbGF5JykuY2xhc3NlZCgnYWN0aXZlJywgISFzdGF0ZS5wbGF5aW5nKS50ZXh0KHN0YXRlLnBsYXlpbmcgPyAnXHUyNzVBXHUyNzVBJyA6ICdcdTI1QjYnKTtcbiAgfVxuXG4gIC8vIFRvb2xiYXIuXG4gIGNvbnN0IHRiID0gZDMuc2VsZWN0KCcjdG9vbGJhcicpLmh0bWwoJycpO1xuICBjb25zdCBzZWcgPSB0Yi5hcHBlbmQoJ3NwYW4nKS5hdHRyKCdjbGFzcycsICdzZWcnKTtcbiAgc2VnLmFwcGVuZCgnYnV0dG9uJykuYXR0cignZGF0YS1tb2RlJywgJ3NuYXBzaG90JykudGV4dCgnU25hcHNob3QnKS5vbignY2xpY2snLCAoKSA9PiBzZXRNb2RlKCdzbmFwc2hvdCcpKTtcbiAgc2VnLmFwcGVuZCgnYnV0dG9uJykuYXR0cignZGF0YS1tb2RlJywgJ2RpZmYnKS50ZXh0KCdEaWZmJykub24oJ2NsaWNrJywgKCkgPT4gc2V0TW9kZSgnZGlmZicpKTtcbiAgY29uc3QgeWEgPSB0Yi5hcHBlbmQoJ3NwYW4nKS5hdHRyKCdpZCcsICd5ZWFycy1hJykuYXR0cignY2xhc3MnLCAneWVhcnMnKTtcbiAgeWEuYXBwZW5kKCdsYWJlbCcpLnRleHQoJ2Zyb20nKTtcbiAgeWEuc2VsZWN0QWxsKCdidXR0b24nKS5kYXRhKHllYXJzKS5qb2luKCdidXR0b24nKS5hdHRyKCdkYXRhLXllYXInLCAoeSkgPT4geSkudGV4dCgoeSkgPT4geSkub24oJ2NsaWNrJywgKF8sIHkpID0+IHNldEZyb20oeSkpO1xuICBjb25zdCB5YiA9IHRiLmFwcGVuZCgnc3BhbicpLmF0dHIoJ2lkJywgJ3llYXJzJykuYXR0cignY2xhc3MnLCAneWVhcnMnKTtcbiAgeWIuYXBwZW5kKCdsYWJlbCcpLnRleHQoJ3RvJyk7XG4gIHliLnNlbGVjdEFsbCgnYnV0dG9uJykuZGF0YSh5ZWFycykuam9pbignYnV0dG9uJykuYXR0cignZGF0YS15ZWFyJywgKHkpID0+IHkpLnRleHQoKHkpID0+IHkpLm9uKCdjbGljaycsIChfLCB5KSA9PiBzZXRZZWFyKHkpKTtcbiAgY29uc3Qgc2NvcGVMYWJlbCA9IHRiLmFwcGVuZCgnbGFiZWwnKS5hdHRyKCdpZCcsICdzY29wZScpLmF0dHIoJ3RpdGxlJywgJ0NvbXBhcmUgZXZlcnkgbmFtZWQgcG9seWdvbiwgbm90IGp1c3QgdGhlIHRyYWNrZWQgc3RhdGVzJyk7XG4gIHNjb3BlTGFiZWwuYXBwZW5kKCdpbnB1dCcpLmF0dHIoJ3R5cGUnLCAnY2hlY2tib3gnKS5wcm9wZXJ0eSgnY2hlY2tlZCcsIHN0YXRlLnNjb3BlID09PSAnYWxsJylcbiAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHsgc3RhdGUuc2NvcGUgPSB0aGlzLmNoZWNrZWQgPyAnYWxsJyA6ICd0cmFja2VkJzsgcmVuZGVyKCk7IH0pO1xuICBzY29wZUxhYmVsLmFwcGVuZCgnc3BhbicpLnRleHQoJ2FsbCBzdGF0ZXMnKTtcbiAgdGIuYXBwZW5kKCdzcGFuJykuYXR0cignY2xhc3MnLCAnc2VwJyk7XG4gIHRiLmFwcGVuZCgnYnV0dG9uJykuYXR0cignaWQnLCAncGxheScpLmF0dHIoJ3RpdGxlJywgJ1BsYXkgKHNwYWNlKScpLnRleHQoJ1x1MjVCNicpLm9uKCdjbGljaycsIHRvZ2dsZVBsYXkpO1xuXG4gIC8vIEV4cG9ydDogUE5HIGF0IDE5MjBcdTAwRDcxMDgwIG9yIDM4NDBcdTAwRDcyMTYwLCBvciBTVkcsIG9mIGV4YWN0bHkgd2hhdCBpcyBvbiB0aGUgc2hlZXQuIFRyYW5zcGFyZW50IGJhY2tncm91bmQgaXMgb2ZmIGJ5IGRlZmF1bHQuXG4gIHRiLmFwcGVuZCgnc3BhbicpLmF0dHIoJ2NsYXNzJywgJ3NlcCcpO1xuICBjb25zdCBleHBvcnRNZW51ID0gdGIuYXBwZW5kKCdzcGFuJykuYXR0cignY2xhc3MnLCAnbWVudScpO1xuICBjb25zdCBleHBvcnRCdG4gPSBleHBvcnRNZW51LmFwcGVuZCgnYnV0dG9uJykuYXR0cignaWQnLCAnZXhwb3J0JykuYXR0cigndGl0bGUnLCAnRXhwb3J0IHRoZSBjdXJyZW50IHZpZXcgKEUpJykudGV4dCgnRXhwb3J0IFx1MjVCRScpXG4gICAgLm9uKCdjbGljaycsICgpID0+IGV4cG9ydE1lbnUuY2xhc3NlZCgnb3BlbicsICFleHBvcnRNZW51LmNsYXNzZWQoJ29wZW4nKSkpO1xuICBjb25zdCBwb3AgPSBleHBvcnRNZW51LmFwcGVuZCgnc3BhbicpLmF0dHIoJ2NsYXNzJywgJ3BvcG92ZXInKTtcbiAgY29uc3QgZXhwb3J0T3B0cyA9IHsgdHJhbnNwYXJlbnQ6IGZhbHNlIH07XG4gIGNvbnN0IGRlc2NyaWJlID0gKCkgPT4gKHsgc3RhZ2U6IHN0YWdlLmlkLCB5ZWFyOiBzdGF0ZS55ZWFyLCBmcm9tOiBzdGF0ZS5tb2RlID09PSAnZGlmZicgPyBzdGF0ZS5mcm9tIDogbnVsbCB9KTtcbiAgbGV0IGV4cG9ydGluZyA9IGZhbHNlO1xuICBhc3luYyBmdW5jdGlvbiBkb0V4cG9ydChraW5kKSB7XG4gICAgaWYgKGV4cG9ydGluZykgcmV0dXJuO1xuICAgIGV4cG9ydGluZyA9IHRydWU7XG4gICAgZXhwb3J0TWVudS5jbGFzc2VkKCdvcGVuJywgZmFsc2UpO1xuICAgIGV4cG9ydEJ0bi50ZXh0KCdFeHBvcnRpbmdcdTIwMjYnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdmdOb2RlID0gc3ZnLm5vZGUoKTtcbiAgICAgIGNvbnN0IGluZm8gPSBkZXNjcmliZSgpO1xuICAgICAgaWYgKGtpbmQgPT09ICdzdmcnKSBkb3dubG9hZChhd2FpdCByZW5kZXJTVkcoc3ZnTm9kZSwgZXhwb3J0T3B0cyksIGV4cG9ydE5hbWUoeyAuLi5pbmZvLCBleHQ6ICdzdmcnIH0pKTtcbiAgICAgIGVsc2UgaWYgKGtpbmQgPT09ICc0aycpIGRvd25sb2FkKGF3YWl0IHJlbmRlclBORyhzdmdOb2RlLCB7IHdpZHRoOiAzODQwLCBoZWlnaHQ6IDIxNjAsIC4uLmV4cG9ydE9wdHMgfSksIGV4cG9ydE5hbWUoeyAuLi5pbmZvLCBzaXplOiAnNGsnLCBleHQ6ICdwbmcnIH0pKTtcbiAgICAgIGVsc2UgZG93bmxvYWQoYXdhaXQgcmVuZGVyUE5HKHN2Z05vZGUsIHsgd2lkdGg6IDE5MjAsIGhlaWdodDogMTA4MCwgLi4uZXhwb3J0T3B0cyB9KSwgZXhwb3J0TmFtZSh7IC4uLmluZm8sIGV4dDogJ3BuZycgfSkpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgZDMuc2VsZWN0KCcjcHJvYmxlbXMnKS5jbGFzc2VkKCdoaWRkZW4nLCBmYWxzZSkudGV4dChgRXhwb3J0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZXhwb3J0aW5nID0gZmFsc2U7XG4gICAgICBleHBvcnRCdG4udGV4dCgnRXhwb3J0IFx1MjVCRScpLmF0dHIoJ2Rpc2FibGVkJywgbnVsbCk7XG4gICAgfVxuICB9XG4gIHBvcC5hcHBlbmQoJ2J1dHRvbicpLnRleHQoJ1BORyBcdTAwQjcgMTkyMCBcdTAwRDcgMTA4MCcpLm9uKCdjbGljaycsICgpID0+IGRvRXhwb3J0KCdwbmcnKSk7XG4gIHBvcC5hcHBlbmQoJ2J1dHRvbicpLnRleHQoJ1BORyBcdTAwQjcgMzg0MCBcdTAwRDcgMjE2MCcpLm9uKCdjbGljaycsICgpID0+IGRvRXhwb3J0KCc0aycpKTtcbiAgcG9wLmFwcGVuZCgnYnV0dG9uJykudGV4dCgnU1ZHJykub24oJ2NsaWNrJywgKCkgPT4gZG9FeHBvcnQoJ3N2ZycpKTtcbiAgY29uc3QgdHIgPSBwb3AuYXBwZW5kKCdsYWJlbCcpO1xuICB0ci5hcHBlbmQoJ2lucHV0JykuYXR0cigndHlwZScsICdjaGVja2JveCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7IGV4cG9ydE9wdHMudHJhbnNwYXJlbnQgPSB0aGlzLmNoZWNrZWQ7IH0pO1xuICB0ci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCd0cmFuc3BhcmVudCBiYWNrZ3JvdW5kJyk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHsgaWYgKCFleHBvcnRNZW51Lm5vZGUoKS5jb250YWlucyhlLnRhcmdldCkpIGV4cG9ydE1lbnUuY2xhc3NlZCgnb3BlbicsIGZhbHNlKTsgfSk7XG5cbiAgLy8gRm9yIHNjcmlwdHMgYW5kIGNoZWNrczogd2luZG93LnBhcmNobWVudC5yZW5kZXJ7UE5HLFNWR30oKSByZXR1cm4gYmxvYnMgb2YgdGhlIGN1cnJlbnQgdmlldy5cbiAgd2luZG93LnBhcmNobWVudCA9IHtcbiAgICByZW5kZXJQTkc6IChvcHRzKSA9PiByZW5kZXJQTkcoc3ZnLm5vZGUoKSwgb3B0cyksXG4gICAgcmVuZGVyU1ZHOiAob3B0cykgPT4gcmVuZGVyU1ZHKHN2Zy5ub2RlKCksIG9wdHMpLFxuICAgIGV4cG9ydE5hbWU6IChvcHRzKSA9PiBleHBvcnROYW1lKHsgLi4uZGVzY3JpYmUoKSwgLi4ub3B0cyB9KSxcbiAgICBnZXQgc3RhdGUoKSB7IHJldHVybiB7IC4uLnN0YXRlIH07IH0sXG4gIH07XG5cbiAgLy8gS2V5Ym9hcmQ6IFx1MjE5MCBcdTIxOTIgc3RlcCB0aHJvdWdoIHRoZSBjYWxlbmRhcjsgc3BhY2UgcGxheXM7IEQgdG9nZ2xlcyB0aGUgRGlmZiB2aWV3LlxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgaWYgKGUudGFyZ2V0ICYmIC9JTlBVVHxURVhUQVJFQXxTRUxFQ1QvLnRlc3QoZS50YXJnZXQudGFnTmFtZSkpIHJldHVybjtcbiAgICBpZiAoZS5rZXkgPT09ICdBcnJvd1JpZ2h0Jykgc3RlcCgxKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gJ0Fycm93TGVmdCcpIHN0ZXAoLTEpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSAnICcpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB0b2dnbGVQbGF5KCk7IH1cbiAgICBlbHNlIGlmIChlLmtleSA9PT0gJ2QnIHx8IGUua2V5ID09PSAnRCcpIHNldE1vZGUoc3RhdGUubW9kZSA9PT0gJ2RpZmYnID8gJ3NuYXBzaG90JyA6ICdkaWZmJyk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09ICdlJyB8fCBlLmtleSA9PT0gJ0UnKSBkb0V4cG9ydChlLnNoaWZ0S2V5ID8gJzRrJyA6ICdwbmcnKTtcbiAgfSk7XG5cbiAgaWYgKFNUQVJUX0ZST00pIHN0YXRlLm1vZGUgPSAnZGlmZic7XG4gIGF3YWl0IHJlbmRlcigpO1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3JlYWR5Jyk7XG4gIC8vIFByZWZldGNoIHRoZSByZXN0IHNvIHN3aXRjaGluZyBpcyBpbnN0YW50LlxuICBmb3IgKGNvbnN0IHkgb2YgeWVhcnMpIHNuYXBzaG90KHkpO1xufVxuXG5tYWluKCkuY2F0Y2goKGVycikgPT4ge1xuICBjb25zb2xlLmVycm9yKGVycik7XG4gIGQzLnNlbGVjdCgnI3Byb2JsZW1zJykuY2xhc3NlZCgnaGlkZGVuJywgZmFsc2UpLnRleHQoYFBhcmNobWVudCBjb3VsZCBub3Qgc3RhcnQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBQWUsV0FBUixVQUEyQixHQUFHLEdBQUc7QUFDdEMsV0FBTyxLQUFLLFFBQVEsS0FBSyxPQUFPLE1BQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUk7QUFBQSxFQUM5RTs7O0FDRmUsV0FBUixXQUE0QixHQUFHLEdBQUc7QUFDdkMsV0FBTyxLQUFLLFFBQVEsS0FBSyxPQUFPLE1BQzVCLElBQUksSUFBSSxLQUNSLElBQUksSUFBSSxJQUNSLEtBQUssSUFBSSxJQUNUO0FBQUEsRUFDTjs7O0FDSGUsV0FBUixTQUEwQixHQUFHO0FBQ2xDLFFBQUksVUFBVSxVQUFVO0FBT3hCLFFBQUksRUFBRSxXQUFXLEdBQUc7QUFDbEIsaUJBQVc7QUFDWCxpQkFBVyxDQUFDLEdBQUcsTUFBTSxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDdEMsY0FBUSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSTtBQUFBLElBQzNCLE9BQU87QUFDTCxpQkFBVyxNQUFNLGFBQWEsTUFBTSxhQUFhLElBQUk7QUFDckQsaUJBQVc7QUFDWCxjQUFRO0FBQUEsSUFDVjtBQUVBLGFBQVMsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssRUFBRSxRQUFRO0FBQ3pDLFVBQUksS0FBSyxJQUFJO0FBQ1gsWUFBSSxTQUFTLEdBQUcsQ0FBQyxNQUFNLEVBQUcsUUFBTztBQUNqQyxXQUFHO0FBQ0QsZ0JBQU0sTUFBTyxLQUFLLE9BQVE7QUFDMUIs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VixXQUFXO0FBQUEsSUFDWCxVQUFVO0FBQUEsSUFDVixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixnQkFBZ0I7QUFBQSxJQUNoQixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxZQUFZO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCxlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEsSUFDZixXQUFXO0FBQUEsSUFDWCxjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxzQkFBc0I7QUFBQSxJQUN0QixXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsSUFDZixjQUFjO0FBQUEsSUFDZCxnQkFBZ0I7QUFBQSxJQUNoQixnQkFBZ0I7QUFBQSxJQUNoQixnQkFBZ0I7QUFBQSxJQUNoQixhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixrQkFBa0I7QUFBQSxJQUNsQixZQUFZO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCxjQUFjO0FBQUEsSUFDZCxnQkFBZ0I7QUFBQSxJQUNoQixpQkFBaUI7QUFBQSxJQUNqQixtQkFBbUI7QUFBQSxJQUNuQixpQkFBaUI7QUFBQSxJQUNqQixpQkFBaUI7QUFBQSxJQUNqQixjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixLQUFLO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxZQUFZO0FBQUEsSUFDWixRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZjtBQUVBLGlCQUFPLE9BQU8sT0FBTztBQUFBLElBQ25CLEtBQUssVUFBVTtBQUNiLGFBQU8sT0FBTyxPQUFPLElBQUksS0FBSyxlQUFhLE1BQU0sUUFBUTtBQUFBLElBQzNEO0FBQUEsSUFDQSxjQUFjO0FBQ1osYUFBTyxLQUFLLElBQUksRUFBRSxZQUFZO0FBQUEsSUFDaEM7QUFBQSxJQUNBLEtBQUs7QUFBQTtBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLEVBQ1osQ0FBQztBQUVELFdBQVMsa0JBQWtCO0FBQ3pCLFdBQU8sS0FBSyxJQUFJLEVBQUUsVUFBVTtBQUFBLEVBQzlCO0FBRUEsV0FBUyxtQkFBbUI7QUFDMUIsV0FBTyxLQUFLLElBQUksRUFBRSxXQUFXO0FBQUEsRUFDL0I7QUFFQSxXQUFTLGtCQUFrQjtBQUN6QixXQUFPLFdBQVcsSUFBSSxFQUFFLFVBQVU7QUFBQSxFQUNwQztBQUVBLFdBQVMsa0JBQWtCO0FBQ3pCLFdBQU8sS0FBSyxJQUFJLEVBQUUsVUFBVTtBQUFBLEVBQzlCO0FBRWUsV0FBUixNQUF1QkMsU0FBUTtBQUNwQyxRQUFJLEdBQUc7QUFDUCxJQUFBQSxXQUFVQSxVQUFTLElBQUksS0FBSyxFQUFFLFlBQVk7QUFDMUMsWUFBUSxJQUFJLE1BQU0sS0FBS0EsT0FBTSxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUUsUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFDdEYsTUFBTSxJQUFJLElBQUksSUFBSyxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxJQUFJLE1BQVMsSUFBSSxPQUFRLElBQU0sSUFBSSxJQUFNLENBQUMsSUFDaEgsTUFBTSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQU0sS0FBSyxLQUFLLEtBQU0sS0FBSyxJQUFJLE1BQU8sSUFBSSxPQUFRLEdBQUksSUFDL0UsTUFBTSxJQUFJLEtBQU0sS0FBSyxLQUFLLEtBQVEsS0FBSyxJQUFJLEtBQVEsS0FBSyxJQUFJLEtBQVEsS0FBSyxJQUFJLEtBQVEsS0FBSyxJQUFJLEtBQVEsSUFBSSxPQUFVLElBQUksT0FBUSxJQUFNLElBQUksTUFBUSxHQUFJLElBQ3RKLFNBQ0MsSUFBSSxhQUFhLEtBQUtBLE9BQU0sS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUM1RCxJQUFJLGFBQWEsS0FBS0EsT0FBTSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLElBQUksTUFBTSxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLEtBQ2hHLElBQUksY0FBYyxLQUFLQSxPQUFNLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUM3RCxJQUFJLGNBQWMsS0FBS0EsT0FBTSxLQUFLLEtBQUssRUFBRSxDQUFDLElBQUksTUFBTSxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BQU0sS0FBSyxFQUFFLENBQUMsSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUMsS0FDakcsSUFBSSxhQUFhLEtBQUtBLE9BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQ3JFLElBQUksY0FBYyxLQUFLQSxPQUFNLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsSUFDMUUsTUFBTSxlQUFlQSxPQUFNLElBQUksS0FBSyxNQUFNQSxPQUFNLENBQUMs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SUMsTUFBSyxLQUFLRztBQUNqQyxVQUFNLElBQUlMLE1BQUssT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLFdBQVcsRUFBRSxLQUFLLGFBQWEsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHO0FBQzlGLE1BQUUsT0FBTyxNQUFNLEVBQUUsS0FBSyxTQUFTLGVBQWUsRUFBRSxLQUFLLFNBQVNJLEVBQUMsRUFBRSxLQUFLLFVBQVVDLEVBQUM7QUFFakYsVUFBTSxJQUFJLElBQUksSUFBSTtBQUNsQixVQUFNLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQ0QsS0FBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBR0MsS0FBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUNELEtBQUksR0FBR0MsS0FBSSxHQUFHLElBQUksRUFBRSxDQUFDO0FBQy9GLE1BQUUsVUFBVSxjQUFjLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBSyxNQUFNLEVBQUUsS0FBSyxTQUFTLFNBQVMsRUFDM0UsS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBRTNGLE1BQUUsT0FBTyxNQUFNLEVBQUUsS0FBSyxTQUFTLFVBQVUsRUFBRSxLQUFLLEtBQUssR0FBRyxFQUFFLEtBQUssS0FBSyxNQUFNLEVBQUUsRUFBRSxLQUFLLFdBQVc7QUFDOUYsTUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLFNBQVMsTUFBTSxFQUFFLEtBQUssTUFBTSxHQUFHLEVBQUUsS0FBSyxNQUFNRCxLQUFJLEdBQUcsRUFBRSxLQUFLLE1BQU0sTUFBTSxFQUFFLEVBQUUsS0FBSyxNQUFNLE1BQU0sRUFBRTtBQUNuSCxVQUFNLFFBQVEsRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLFNBQVMsV0FBVyxFQUFF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QUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBZ0I7QUFBQSxFQUNsQjs7O0FDbElBO0FBQUEsSUFDRSxJQUFNO0FBQUEsSUFDTixPQUFTO0FBQUEsSUFDVCxZQUFjO0FBQUEsSUFDZCxRQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFVO0FBQUEsTUFDUixNQUFRO0FBQUEsTUFDUixPQUFTO0FBQUEsTUFDVCxNQUFRO0FBQUEsTUFDUixPQUFTO0FBQUEsSUFDWDtBQUFBLElBQ0EsTUFBUTtBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBVTtBQUFBLElBQ1YsUUFBVTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtB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LCAic3RhcnQiLCAicmFuZ2UiLCAiY29weSIsICJ0eXBlIiwgImRvY3VtZW50IiwgImRhdHVtIiwgInNlbGVjdGlvbiIsICJtZXJnZSIsICJhc2NlbmRpbmciLCAiY3JlYXRlIiwgImNyZWF0ZSIsICJwYXJzZVR5cGVuYW1lcyIsICJ0eXBlIiwgInBhcmFtcyIsICJ3aW5kb3ciLCAiZGlzcGF0Y2hfZGVmYXVsdCIsICJkaXNwYXRjaF9kZWZhdWx0IiwgInNlbGVjdF9kZWZhdWx0IiwgInNlbGVjdEFsbF9kZWZhdWx0IiwgImZvcm1hdCIsICJtaW4iLCAibWF4IiwgImNvbnN0YW50X2RlZmF1bHQiLCAiY29uc3RhbnRfZGVmYXVsdCIsICJjb2xvciIsICJyZ2IiLCAic3RhcnQiLCAiemVybyIsICJpIiwgImNvbnN0YW50X2RlZmF1bHQiLCAibm93IiwgImlkIiwgImdldCIsICJzZXQiLCAic3RhcnQiLCAiZW1wdHkiLCAiaW50ZXJydXB0X2RlZmF1bHQiLCAiaWQiLCAic2V0IiwgImdldCIsICJ0cmFuc2l0aW9uIiwgImF0dHJSZW1vdmUiLCAiYXR0clJlbW92ZU5TIiwgImF0dHJDb25zdGFudCIsICJhdHRyQ29uc3RhbnROUyIsICJhdHRyRnVuY3Rpb24iLCAiYXR0ckZ1bmN0aW9uTlMiLCAiYXR0cl9kZWZhdWx0IiwgImlkIiwgImdldCIsICJpZCIsICJzZXQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImZpbHRlcl9kZWZhdWx0IiwgIm1lcmdlX2RlZmF1bHQiLCAidHJhbnNpdGlvbiIsICJtZXJnZSIsICJpZCIsICJzZXQiLCAib25fZGVmYXVsdCIsICJnZXQiLCAiaWQiLCAicmVtb3ZlX2RlZmF1bHQiLCAic2VsZWN0X2RlZmF1bHQiLCAiaWQiLCAiZ2V0IiwgInNlbGVjdEFsbF9kZWZhdWx0IiwgImlkIiwgImNoaWxkcmVuIiwgImluaGVyaXQiLCAiZ2V0IiwgIlNlbGVjdGlvbiIsICJzZWxlY3Rpb25fZGVmYXVsdCIsICJzdHlsZVJlbW92ZSIsICJzdHlsZUNvbnN0YW50IiwgInN0eWxlRnVuY3Rpb24iLCAiaWQiLCAicmVtb3ZlIiwgInNldCIsICJzdHlsZV9kZWZhdWx0IiwgInRleHRDb25zdGFudCIsICJ0ZXh0RnVuY3Rpb24iLCAidGV4dF9kZWZhdWx0IiwgImluaGVyaXQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJpZCIsICJzZWxlY3RfZGVmYXVsdCIsICJzZWxlY3RBbGxfZGVmYXVsdCIsICJmaWx0ZXJfZGVmYXVsdCIsICJtZXJnZV9kZWZhdWx0IiwgInNlbGVjdGlvbl9kZWZhdWx0IiwgIm9uX2RlZmF1bHQiLCAiYXR0cl9kZWZhdWx0IiwgInN0eWxlX2RlZmF1bHQiLCAidGV4dF9kZWZhdWx0IiwgInJlbW92ZV9kZWZhdWx0IiwgImlkIiwgInRyYW5zaXRpb25fZGVmYXVsdCIsICJpbnRlcnJ1cHRfZGVmYXVsdCIsICJ0cmFuc2l0aW9uX2RlZmF1bHQiLCAibG9jYWxlIiwgInNpZ24iLCAiemVybyIsICJ0eXBlIiwgImZvcm1hdCIsICJmb3JtYXRQcmVmaXgiLCAidmFsdWUiLCAibWF4IiwgImRlZ3JlZXMiLCAiYWJzIiwgIm5vb3AiLCAib2JqZWN0IiwgImNvb3JkaW5hdGVzIiwgIm5vb3AiLCAib2JqZWN0IiwgImNhcnRlc2lhbiIsICJzcGhlcmljYWwiLCAiYWJzIiwgIm5vb3AiLCAiYWJzIiwgImNvbXBhcmVJbnRlcnNlY3Rpb24iLCAibiIsICJzdGFydCIsICJhcnJheSIsICJhYnMiLCAibGFtYmRhMCIsICJzaW5QaGkwIiwgImNvc1BoaTAiLCAic2lnbiIsICJzdGFydCIsICJwb2ludCIsICJsYW1iZGEwIiwgImFicyIsICJjb3NQaGkwIiwgImFicyIsICJsYW1iZGEwIiwgImRlbHRhIiwgImNvZGUiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiYWJzIiwgImNvbXBhcmVJbnRlcnNlY3Rpb24iLCAicmluZyIsICJwb2ludCIsICJ2aXNpYmxlIiwgImxhbWJkYTAiLCAic2luUGhpMCIsICJjb3NQaGkwIiwgIm5vb3AiLCAiYWJzIiwgIm9iamVjdCIsICJ5MCIsICJ5MSIsICJ5IiwgIngwIiwgIngxIiwgIngiLCAiWDEiLCAiWDAiLCAiWTEiLCAiWTAiLCAiWCIsICJZIiwgImdyYXRpY3VsZSIsICJhYnMiLCAiY29vcmRpbmF0ZXMiLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJhcmVhU3VtIiwgImFyZWFSaW5nU3VtIiwgImFyZWFTdHJlYW0iLCAibm9vcCIsICJhcmVhUmluZ1N0YXJ0IiwgImFyZWFSaW5nRW5kIiwgImFicyIsICJhcmVhUG9pbnRGaXJzdCIsICJhcmVhUG9pbnQiLCAiYXJlYV9kZWZhdWx0IiwgIngwIiwgInkwIiwgIm5vb3AiLCAieDAwIiwgInkwMCIsICJ4MCIsICJ5MCIsICJub29wIiwgImxlbmd0aFN1bSIsICJ4MDAiLCAieTAwIiwgIngwIiwgInkwIiwgImxlbmd0aFN0cmVhbSIsICJub29wIiwgImxlbmd0aFBvaW50Rmlyc3QiLCAibGVuZ3RoUG9pbnQiLCAiYXBwZW5kIiwgInByb2plY3Rpb24iLCAib2JqZWN0IiwgImFyZWFfZGVmYXVsdCIsICJpZGVudGl0eV9kZWZhdWx0IiwgInByb2plY3Rpb24iLCAib2JqZWN0IiwgIngwIiwgInkwIiwgImxhbWJkYTAiLCAieDEiLCAieTEiLCAiYWJzIiwgImxhbWJkYTAwIiwgIngwMCIsICJ5MDAiLCAidHJhbnNmb3JtIiwgIngwIiwgInkwIiwgIngxIiwgInkxIiwgImlkZW50aXR5X2RlZmF1bHQiLCAiY2FjaGUiLCAicHJvamVjdGlvbiIsICJkZWdyZWVzIiwgIm9iamVjdCIsICJkZWdyZWVzIiwgImNvc1BoaTAiLCAieTAiLCAieTEiLCAiYWJzIiwgImNhY2hlIiwgImNvb3JkaW5hdGVzIiwgIm9iamVjdCIsICJhYnMiLCAicmFuZ2UiLCAibnVtYmVyIiwgImlkZW50aXR5IiwgInJhbmdlIiwgImkiLCAidHJhbnNmb3JtZXIiLCAidHJhbnNmb3JtIiwgIm51bWJlciIsICJzdGFydCIsICJzdGFydCIsICJsaW5lYXIiLCAibG9jYXRpb24iLCAiaWRlbnRpdHkiLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJ0cmFuc2Zvcm0iLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJ4MCIsICJ5MCIsICJhcnJheSIsICJvIiwgImlkIiwgIm9iamVjdCIsICJhcmNzIiwgInR5cGUiLCAiY29vcmRpbmF0ZXMiLCAic3RhcnQiLCAiZnJhZ21lbnRCeUVuZCIsICJmcmFnbWVudEJ5U3RhcnQiLCAib2JqZWN0IiwgImZpbHRlciIsICJhcmNzIiwgInJvb3QiLCAiVyIsICJIIiwgInN0YWdlIiwgImlkIiwgInByb2plY3Rpb24iLCAicm9vdCIsICJ4MCIsICJ5MSIsICJzdGFnZSIsICJXIiwgIkgiLCAieSIsICJiIiwgInJvb3QiLCAieDAiLCAieDEiLCAieTEiLCAic3RhZ2UiLCAibGluZWFyIiwgInJhbmdlIiwgImEiLCAiYiIsICJyb290IiwgIngxIiwgInkwIiwgIlciLCAic2V0IiwgIkgiLCAic2VsZWN0X2RlZmF1bHQiLCAicm9vdCIsICJ4MSIsICJ5MCIsICJXIiwgIngwIiwgInkwIiwgIngxIiwgInkxIiwgImZyYW1lIiwgImlkIiwgInN0YWdlIiwgIngwIiwgInkwIiwgIngxIiwgInkxIiwgImZyYW1lIiwgInByb2plY3Rpb24iLCAiY2FjaGUiLCAicm9vdCIsICJtYXAiLCAibmFtZWQiLCAicmUiLCAiYWJzIiwgInN2Z05vZGUiLCAic3RhZ2UiLCAic2VsZWN0X2RlZmF1bHQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAic3ZnTm9kZSJdCn0K
