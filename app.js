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
    const W2 = 330, H2 = 128, PAD = 16;
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
        year.text(y2 < 0 ? `${-y2} BCE` : y2);
        baseNote.text(sourceYear != null && sourceYear !== y2 ? `base map ${sourceYear}` : "");
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
    const marker = g.append("g").attr("class", "marker");
    marker.append("path").attr("d", "M0,-9L8,0L0,9L-8,0Z");
    const markerLabel = marker.append("text").attr("y", 30).attr("text-anchor", "middle");
    return {
      setYear(year) {
        marker.attr("transform", `translate(${x(year)},${y12})`);
        markerLabel.text(year);
        tickLabels.classed("hidden", (d) => Math.abs(x(d) - x(year)) < 34);
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
    function set3(tracker) {
      const entries = tracker.legend ?? [];
      title.text(tracker.title ?? tracker.id);
      const H2 = PAD * 2 + 26 + entries.length * ROW;
      box.attr("height", H2);
      g.attr("transform", `translate(${x12 - 22 - W2},${y05 + 22})`);
      const r = rows.selectAll("g.row").data(entries).join("g").attr("class", "row").attr("transform", (_, i) => `translate(0,${i * ROW})`);
      r.selectAll("*").remove();
      r.each(function(e) {
        const row = select_default2(this);
        if (e.swatch === "fill") {
          row.append("rect").attr("class", `swatch fill-${e.key}`).attr("x", 0).attr("y", 0).attr("width", 22).attr("height", 14);
        } else if (e.swatch === "line") {
          row.append("line").attr("class", `swatch-line ${e.style}`).attr("x1", 0).attr("x2", 22).attr("y1", 7).attr("y2", 7);
        } else if (e.swatch === "shape") {
          row.append("path").attr("class", `mark ${e.shape}`).attr("transform", "translate(11,7)").attr("d", SHAPES[e.shape] ?? SHAPES.circle);
        }
        row.append("text").attr("x", 32).attr("y", 11).text(e.label);
      });
    }
    return { set: set3 };
  }
  var SHAPES = {
    "rust-diamond": "M0,-7L7,0L0,7L-7,0Z",
    "moss-circle": "M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z",
    "navy-square": "M-6,-6H6V6H-6Z",
    "navy-triangle": "M0,-7L7,6H-7Z",
    circle: "M0,-6A6,6 0 1,1 0,6A6,6 0 1,1 0,-6Z"
  };

  // src/render/base.js
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
    const polities = map2.append("g").attr("class", "polities");
    const borders = map2.append("g").attr("class", "borders");
    const rivers = feature_default(ne, ne.objects.rivers);
    map2.append("g").attr("class", "rivers").selectAll("path").data(rivers.features.filter((f) => (f.properties.scalerank ?? 0) <= 7)).join("path").attr("d", d);
    const lakes = feature_default(ne, ne.objects.lakes);
    map2.append("path").attr("class", "lakes").attr("d", d(lakes));
    map2.append("path").attr("class", "coastline").attr("d", d(feature_default(ne, ne.objects.coastline)));
    map2.append("path").attr("class", "graticule").attr("d", d(graticule10()));
    drawStageLabels(map2.append("g").attr("class", "stage-labels"), defs, stage2, path);
    const polityLabels = map2.append("g").attr("class", "polity-labels");
    drawPaperOverlay(root2, W, H);
    root2.append("path").attr("class", "frame").attr("d", `M${x05},${y12}L${x05},${y05}L${x12},${y05}L${x12},${y12}`);
    const legend = createLegend(root2, frame2);
    if (tracker) legend.set(tracker);
    const cartouche = createCartouche(root2, frame2, stage2, projection2);
    const strip = createStrip(root2, frame2, stage2, years, onYear);
    let currentYear = null;
    function showSnapshot(year, topo, classify = () => ({ status: "muted" })) {
      const fc = feature_default(topo, topo.objects.polities);
      const named2 = fc.features.filter((f) => f.properties.id);
      for (const f of named2) f.properties.cls = classify(f, year);
      polities.selectAll("path").data(named2, (f) => f.properties.id).join("path").attr("class", (f) => `polity ${f.properties.certainty} ${f.properties.cls.status}`).attr("d", d).append("title").text((f) => f.properties.cls.label ?? f.properties.name);
      const interior = mesh_default(topo, topo.objects.polities, (a, b) => a !== b);
      const certainty = named2[0]?.properties.certainty ?? "approximate";
      borders.selectAll("path").data([interior]).join("path").attr("class", `border ${certainty}`).attr("d", d);
      drawPolityLabels(polityLabels, polityLabelData(named2.filter((f) => f.properties.cls.status === "highlight"), path));
      currentYear = year;
    }
    function setYear(year, sourceYear) {
      cartouche.setYear(year, sourceYear);
      strip.setYear(year);
    }
    return { projection: projection2, path, d, frame: frame2, showSnapshot, setYear, legend, cartouche, get year() {
      return currentYear;
    } };
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
    ]
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
    ]
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
  var STAGES = { [afro_eurasia_default.id]: afro_eurasia_default, [afro_eurasia_lambert_default.id]: afro_eurasia_lambert_default };
  var stage = STAGES[params.get("stage")] ?? afro_eurasia_default;
  var byName = /* @__PURE__ */ new Map();
  for (const h of extent_default.highlights) for (const n of h.names) byName.set(n, h);
  function classifyExtent(f, year) {
    const h = byName.get(f.properties.name);
    if (h && year >= h.start && year <= h.end) return { status: "highlight", key: h.id, label: h.label };
    return { status: "muted" };
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
    const svg = select_default2("#map");
    const atlas = createStage(svg, stage, { ne, bathy }, { tracker: extent_default, years, onYear: (y) => show(y) });
    console.log(`stage built in ${(performance.now() - t0).toFixed(0)} ms`);
    const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);
    let current = null;
    async function show(year) {
      if (!years.includes(year)) return;
      const topo = await snapshot(year);
      const t = performance.now();
      atlas.showSnapshot(year, topo, classifyExtent);
      current = year;
      const meta = bySnapshot.get(year);
      document.title = `Parchment \xB7 ${year}`;
      atlas.setYear(year, meta.source_year);
      selectAll_default2("#years button").classed("active", function() {
        return Number(this.dataset.year) === year;
      });
      console.log(`snapshot ${year}: ${(performance.now() - t).toFixed(1)} ms`);
    }
    select_default2("#years").selectAll("button").data(years).join("button").attr("data-year", (y) => y).text((y) => y).on("click", (_, y) => show(y));
    window.addEventListener("keydown", (e) => {
      const i = years.indexOf(current);
      if (e.key === "ArrowRight") show(years[Math.min(i + 1, years.length - 1)]);
      if (e.key === "ArrowLeft") show(years[Math.max(i - 1, 0)]);
    });
    await show(START_YEAR);
    document.body.classList.add("ready");
    for (const y of years) snapshot(y);
  }
  main().catch((err) => {
    console.error(err);
    select_default2("#problems").classed("hidden", false).text(`Parchment could not start: ${err.message}`);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9hc2NlbmRpbmcuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXNjZW5kaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYmlzZWN0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9udW1iZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3QuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9mc3VtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9tZXJnZS5qcyIsICJub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3JhbmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9zcmMvZGlzcGF0Y2guanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlcy5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY3JlYXRvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2FycmF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yQWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbWF0Y2hlci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9maWx0ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NwYXJzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY29uc3RhbnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdGEuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2pvaW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL21lcmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc29ydC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2FsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL25vZGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NpemUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lYWNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hdHRyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc3R5bGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3Byb3BlcnR5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi90ZXh0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9odG1sLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbG93ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2FwcGVuZC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yZW1vdmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Nsb25lLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Rpc3BhdGNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdEFsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2RlZmluZS5qcyIsICJub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2NvbG9yLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9iYXNpc0Nsb3NlZC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbnN0YW50LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29sb3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXJBcnJheS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlci5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3ZhbHVlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL3BhcnNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRpbWVyL3NyYy90aW1lb3V0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NjaGVkdWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbnRlcnJ1cHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0ci5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyVHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZHVyYXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9maWx0ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vbWVyZ2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vcmVtb3ZlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc2VsZWN0aW9uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0VHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lbmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vdHJhbnNpdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1icnVzaC9zcmMvYnJ1c2guanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0RGVjaW1hbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9leHBvbmVudC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRHcm91cC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXROdW1lcmFscy5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRTcGVjaWZpZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0VHJpbS5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRQcmVmaXhBdXRvLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdFJvdW5kZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0VHlwZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvaWRlbnRpdHkuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2RlZmF1bHRMb2NhbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uRml4ZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uUHJlZml4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL3ByZWNpc2lvblJvdW5kLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL21hdGguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbm9vcC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9zdHJlYW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvYXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jYXJ0ZXNpYW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY29tcG9zZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9yb3RhdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jaXJjbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9idWZmZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcG9pbnRFcXVhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL3Jlam9pbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wb2x5Z29uQ29udGFpbnMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2FudGltZXJpZGlhbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2NpcmNsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2xpbmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9yZWN0YW5nbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbGVuZ3RoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2Rpc3RhbmNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2dyYXRpY3VsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2FyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9ib3VuZHMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9jZW50cm9pZC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2NvbnRleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9tZWFzdXJlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vZml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vcmVzYW1wbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vY3lsaW5kcmljYWxFcXVhbEFyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVycy5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVyc1VzYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbEVxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2VxdWFsRWFydGguanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9pbml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9udW1iZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb250aW51b3VzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvdGlja0Zvcm1hdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2xpbmVhci5qcyIsICJub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvdHJhbnNmb3JtLmpzIiwgInNyYy9kYXRhL2xvYWRlci5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy90cmFuc2Zvcm0uanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvcmV2ZXJzZS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9mZWF0dXJlLmpzIiwgIm5vZGVfbW9kdWxlcy90b3BvanNvbi1jbGllbnQvc3JjL3N0aXRjaC5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9tZXNoLmpzIiwgInNyYy9yZW5kZXIvcGFwZXIuanMiLCAic3JjL3JlbmRlci9sYWJlbHMuanMiLCAic3JjL3JlbmRlci9jYXJ0b3VjaGUuanMiLCAic3JjL3JlbmRlci9zdHJpcC5qcyIsICJzcmMvcmVuZGVyL2xlZ2VuZC5qcyIsICJzcmMvcmVuZGVyL2Jhc2UuanMiLCAic3JjL3N0YWdlcy9hZnJvLWV1cmFzaWEuanNvbiIsICJzcmMvc3RhZ2VzL2Fmcm8tZXVyYXNpYS1sYW1iZXJ0Lmpzb24iLCAic3JjL3RyYWNrZXJzL2V4dGVudC5qc29uIiwgInNyYy9tYWluLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTiA6IGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTlxuICAgIDogYiA8IGEgPyAtMVxuICAgIDogYiA+IGEgPyAxXG4gICAgOiBiID49IGEgPyAwXG4gICAgOiBOYU47XG59XG4iLCAiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBkZXNjZW5kaW5nIGZyb20gXCIuL2Rlc2NlbmRpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYmlzZWN0b3IoZikge1xuICBsZXQgY29tcGFyZTEsIGNvbXBhcmUyLCBkZWx0YTtcblxuICAvLyBJZiBhbiBhY2Nlc3NvciBpcyBzcGVjaWZpZWQsIHByb21vdGUgaXQgdG8gYSBjb21wYXJhdG9yLiBJbiB0aGlzIGNhc2Ugd2VcbiAgLy8gY2FuIHRlc3Qgd2hldGhlciB0aGUgc2VhcmNoIHZhbHVlIGlzIChzZWxmLSkgY29tcGFyYWJsZS4gV2UgY2FuXHUyMDE5dCBkbyB0aGlzXG4gIC8vIGZvciBhIGNvbXBhcmF0b3IgKGV4Y2VwdCBmb3Igc3BlY2lmaWMsIGtub3duIGNvbXBhcmF0b3JzKSBiZWNhdXNlIHdlIGNhblx1MjAxOXRcbiAgLy8gdGVsbCBpZiB0aGUgY29tcGFyYXRvciBpcyBzeW1tZXRyaWMsIGFuZCBhbiBhc3ltbWV0cmljIGNvbXBhcmF0b3IgY2FuXHUyMDE5dCBiZVxuICAvLyB1c2VkIHRvIHRlc3Qgd2hldGhlciBhIHNpbmdsZSB2YWx1ZSBpcyBjb21wYXJhYmxlLlxuICBpZiAoZi5sZW5ndGggIT09IDIpIHtcbiAgICBjb21wYXJlMSA9IGFzY2VuZGluZztcbiAgICBjb21wYXJlMiA9IChkLCB4KSA9PiBhc2NlbmRpbmcoZihkKSwgeCk7XG4gICAgZGVsdGEgPSAoZCwgeCkgPT4gZihkKSAtIHg7XG4gIH0gZWxzZSB7XG4gICAgY29tcGFyZTEgPSBmID09PSBhc2NlbmRpbmcgfHwgZiA9PT0gZGVzY2VuZGluZyA/IGYgOiB6ZXJvO1xuICAgIGNvbXBhcmUyID0gZjtcbiAgICBkZWx0YSA9IGY7XG4gIH1cblxuICBmdW5jdGlvbiBsZWZ0KGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGlmIChsbyA8IGhpKSB7XG4gICAgICBpZiAoY29tcGFyZTEoeCwgeCkgIT09IDApIHJldHVybiBoaTtcbiAgICAgIGRvIHtcbiAgICAgICAgY29uc3QgbWlkID0gKGxvICsgaGkpID4+PiAxO1xuICAgICAgICBpZiAoY29tcGFyZTIoYVttaWRdLCB4KSA8IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiByaWdodChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPD0gMCkgbG8gPSBtaWQgKyAxO1xuICAgICAgICBlbHNlIGhpID0gbWlkO1xuICAgICAgfSB3aGlsZSAobG8gPCBoaSk7XG4gICAgfVxuICAgIHJldHVybiBsbztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNlbnRlcihhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBjb25zdCBpID0gbGVmdChhLCB4LCBsbywgaGkgLSAxKTtcbiAgICByZXR1cm4gaSA+IGxvICYmIGRlbHRhKGFbaSAtIDFdLCB4KSA+IC1kZWx0YShhW2ldLCB4KSA/IGkgLSAxIDogaTtcbiAgfVxuXG4gIHJldHVybiB7bGVmdCwgY2VudGVyLCByaWdodH07XG59XG5cbmZ1bmN0aW9uIHplcm8oKSB7XG4gIHJldHVybiAwO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG51bWJlcih4KSB7XG4gIHJldHVybiB4ID09PSBudWxsID8gTmFOIDogK3g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiogbnVtYmVycyh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoKHZhbHVlID0gdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgYmlzZWN0b3IgZnJvbSBcIi4vYmlzZWN0b3IuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbmNvbnN0IGFzY2VuZGluZ0Jpc2VjdCA9IGJpc2VjdG9yKGFzY2VuZGluZyk7XG5leHBvcnQgY29uc3QgYmlzZWN0UmlnaHQgPSBhc2NlbmRpbmdCaXNlY3QucmlnaHQ7XG5leHBvcnQgY29uc3QgYmlzZWN0TGVmdCA9IGFzY2VuZGluZ0Jpc2VjdC5sZWZ0O1xuZXhwb3J0IGNvbnN0IGJpc2VjdENlbnRlciA9IGJpc2VjdG9yKG51bWJlcikuY2VudGVyO1xuZXhwb3J0IGRlZmF1bHQgYmlzZWN0UmlnaHQ7XG4iLCAiLy8gaHR0cHM6Ly9naXRodWIuY29tL3B5dGhvbi9jcHl0aG9uL2Jsb2IvYTc0ZWVhMjM4ZjViYWJhMTU3OTdlMmU4YjU3MGQxNTNiYzg2OTBhNy9Nb2R1bGVzL21hdGhtb2R1bGUuYyNMMTQyM1xuZXhwb3J0IGNsYXNzIEFkZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcGFydGlhbHMgPSBuZXcgRmxvYXQ2NEFycmF5KDMyKTtcbiAgICB0aGlzLl9uID0gMDtcbiAgfVxuICBhZGQoeCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wYXJ0aWFscztcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLl9uICYmIGogPCAzMjsgaisrKSB7XG4gICAgICBjb25zdCB5ID0gcFtqXSxcbiAgICAgICAgaGkgPSB4ICsgeSxcbiAgICAgICAgbG8gPSBNYXRoLmFicyh4KSA8IE1hdGguYWJzKHkpID8geCAtIChoaSAtIHkpIDogeSAtIChoaSAtIHgpO1xuICAgICAgaWYgKGxvKSBwW2krK10gPSBsbztcbiAgICAgIHggPSBoaTtcbiAgICB9XG4gICAgcFtpXSA9IHg7XG4gICAgdGhpcy5fbiA9IGkgKyAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHZhbHVlT2YoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BhcnRpYWxzO1xuICAgIGxldCBuID0gdGhpcy5fbiwgeCwgeSwgbG8sIGhpID0gMDtcbiAgICBpZiAobiA+IDApIHtcbiAgICAgIGhpID0gcFstLW5dO1xuICAgICAgd2hpbGUgKG4gPiAwKSB7XG4gICAgICAgIHggPSBoaTtcbiAgICAgICAgeSA9IHBbLS1uXTtcbiAgICAgICAgaGkgPSB4ICsgeTtcbiAgICAgICAgbG8gPSB5IC0gKGhpIC0geCk7XG4gICAgICAgIGlmIChsbykgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAobiA+IDAgJiYgKChsbyA8IDAgJiYgcFtuIC0gMV0gPCAwKSB8fCAobG8gPiAwICYmIHBbbiAtIDFdID4gMCkpKSB7XG4gICAgICAgIHkgPSBsbyAqIDI7XG4gICAgICAgIHggPSBoaSArIHk7XG4gICAgICAgIGlmICh5ID09IHggLSBoaSkgaGkgPSB4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZzdW0odmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGNvbnN0IGFkZGVyID0gbmV3IEFkZGVyKCk7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSA9ICt2YWx1ZSkge1xuICAgICAgICBhZGRlci5hZGQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSA9ICt2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSB7XG4gICAgICAgIGFkZGVyLmFkZCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiArYWRkZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmY3Vtc3VtKHZhbHVlcywgdmFsdWVvZikge1xuICBjb25zdCBhZGRlciA9IG5ldyBBZGRlcigpO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgcmV0dXJuIEZsb2F0NjRBcnJheS5mcm9tKHZhbHVlcywgdmFsdWVvZiA9PT0gdW5kZWZpbmVkXG4gICAgICA/IHYgPT4gYWRkZXIuYWRkKCt2IHx8IDApXG4gICAgICA6IHYgPT4gYWRkZXIuYWRkKCt2YWx1ZW9mKHYsICsraW5kZXgsIHZhbHVlcykgfHwgMClcbiAgKTtcbn1cbiIsICJjb25zdCBlMTAgPSBNYXRoLnNxcnQoNTApLFxuICAgIGU1ID0gTWF0aC5zcXJ0KDEwKSxcbiAgICBlMiA9IE1hdGguc3FydCgyKTtcblxuZnVuY3Rpb24gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIGNvbnN0IHN0ZXAgPSAoc3RvcCAtIHN0YXJ0KSAvIE1hdGgubWF4KDAsIGNvdW50KSxcbiAgICAgIHBvd2VyID0gTWF0aC5mbG9vcihNYXRoLmxvZzEwKHN0ZXApKSxcbiAgICAgIGVycm9yID0gc3RlcCAvIE1hdGgucG93KDEwLCBwb3dlciksXG4gICAgICBmYWN0b3IgPSBlcnJvciA+PSBlMTAgPyAxMCA6IGVycm9yID49IGU1ID8gNSA6IGVycm9yID49IGUyID8gMiA6IDE7XG4gIGxldCBpMSwgaTIsIGluYztcbiAgaWYgKHBvd2VyIDwgMCkge1xuICAgIGluYyA9IE1hdGgucG93KDEwLCAtcG93ZXIpIC8gZmFjdG9yO1xuICAgIGkxID0gTWF0aC5yb3VuZChzdGFydCAqIGluYyk7XG4gICAgaTIgPSBNYXRoLnJvdW5kKHN0b3AgKiBpbmMpO1xuICAgIGlmIChpMSAvIGluYyA8IHN0YXJ0KSArK2kxO1xuICAgIGlmIChpMiAvIGluYyA+IHN0b3ApIC0taTI7XG4gICAgaW5jID0gLWluYztcbiAgfSBlbHNlIHtcbiAgICBpbmMgPSBNYXRoLnBvdygxMCwgcG93ZXIpICogZmFjdG9yO1xuICAgIGkxID0gTWF0aC5yb3VuZChzdGFydCAvIGluYyk7XG4gICAgaTIgPSBNYXRoLnJvdW5kKHN0b3AgLyBpbmMpO1xuICAgIGlmIChpMSAqIGluYyA8IHN0YXJ0KSArK2kxO1xuICAgIGlmIChpMiAqIGluYyA+IHN0b3ApIC0taTI7XG4gIH1cbiAgaWYgKGkyIDwgaTEgJiYgMC41IDw9IGNvdW50ICYmIGNvdW50IDwgMikgcmV0dXJuIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudCAqIDIpO1xuICByZXR1cm4gW2kxLCBpMiwgaW5jXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGlja3Moc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIHN0b3AgPSArc3RvcCwgc3RhcnQgPSArc3RhcnQsIGNvdW50ID0gK2NvdW50O1xuICBpZiAoIShjb3VudCA+IDApKSByZXR1cm4gW107XG4gIGlmIChzdGFydCA9PT0gc3RvcCkgcmV0dXJuIFtzdGFydF07XG4gIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQsIFtpMSwgaTIsIGluY10gPSByZXZlcnNlID8gdGlja1NwZWMoc3RvcCwgc3RhcnQsIGNvdW50KSA6IHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gIGlmICghKGkyID49IGkxKSkgcmV0dXJuIFtdO1xuICBjb25zdCBuID0gaTIgLSBpMSArIDEsIHRpY2tzID0gbmV3IEFycmF5KG4pO1xuICBpZiAocmV2ZXJzZSkge1xuICAgIGlmIChpbmMgPCAwKSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTIgLSBpKSAvIC1pbmM7XG4gICAgZWxzZSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTIgLSBpKSAqIGluYztcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW5jIDwgMCkgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkxICsgaSkgLyAtaW5jO1xuICAgIGVsc2UgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkxICsgaSkgKiBpbmM7XG4gIH1cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGlja0luY3JlbWVudChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIHJldHVybiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpWzJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGlja1N0ZXAoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIHN0b3AgPSArc3RvcCwgc3RhcnQgPSArc3RhcnQsIGNvdW50ID0gK2NvdW50O1xuICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0LCBpbmMgPSByZXZlcnNlID8gdGlja0luY3JlbWVudChzdG9wLCBzdGFydCwgY291bnQpIDogdGlja0luY3JlbWVudChzdGFydCwgc3RvcCwgY291bnQpO1xuICByZXR1cm4gKHJldmVyc2UgPyAtMSA6IDEpICogKGluYyA8IDAgPyAxIC8gLWluYyA6IGluYyk7XG59XG4iLCAiZnVuY3Rpb24qIGZsYXR0ZW4oYXJyYXlzKSB7XG4gIGZvciAoY29uc3QgYXJyYXkgb2YgYXJyYXlzKSB7XG4gICAgeWllbGQqIGFycmF5O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlKGFycmF5cykge1xuICByZXR1cm4gQXJyYXkuZnJvbShmbGF0dGVuKGFycmF5cykpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIHN0YXJ0ID0gK3N0YXJ0LCBzdG9wID0gK3N0b3AsIHN0ZXAgPSAobiA9IGFyZ3VtZW50cy5sZW5ndGgpIDwgMiA/IChzdG9wID0gc3RhcnQsIHN0YXJ0ID0gMCwgMSkgOiBuIDwgMyA/IDEgOiArc3RlcDtcblxuICB2YXIgaSA9IC0xLFxuICAgICAgbiA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApKSB8IDAsXG4gICAgICByYW5nZSA9IG5ldyBBcnJheShuKTtcblxuICB3aGlsZSAoKytpIDwgbikge1xuICAgIHJhbmdlW2ldID0gc3RhcnQgKyBpICogc3RlcDtcbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cbiIsICJ2YXIgbm9vcCA9IHt2YWx1ZTogKCkgPT4ge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykgfHwgL1tcXHMuXS8udGVzdCh0KSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkaXNwYXRjaDtcbiIsICJleHBvcnQgdmFyIHhodG1sID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gIHhodG1sOiB4aHRtbCxcbiAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICB4bWw6IFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsXG4gIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbn07XG4iLCAiaW1wb3J0IG5hbWVzcGFjZXMgZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBwcmVmaXggPSBuYW1lICs9IFwiXCIsIGkgPSBwcmVmaXguaW5kZXhPZihcIjpcIik7XG4gIGlmIChpID49IDAgJiYgKHByZWZpeCA9IG5hbWUuc2xpY2UoMCwgaSkpICE9PSBcInhtbG5zXCIpIG5hbWUgPSBuYW1lLnNsaWNlKGkgKyAxKTtcbiAgcmV0dXJuIG5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkocHJlZml4KSA/IHtzcGFjZTogbmFtZXNwYWNlc1twcmVmaXhdLCBsb2NhbDogbmFtZX0gOiBuYW1lOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xufVxuIiwgImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4vbmFtZXNwYWNlLmpzXCI7XG5pbXBvcnQge3hodG1sfSBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5cbmZ1bmN0aW9uIGNyZWF0b3JJbmhlcml0KG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2N1bWVudCA9IHRoaXMub3duZXJEb2N1bWVudCxcbiAgICAgICAgdXJpID0gdGhpcy5uYW1lc3BhY2VVUkk7XG4gICAgcmV0dXJuIHVyaSA9PT0geGh0bWwgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm5hbWVzcGFjZVVSSSA9PT0geGh0bWxcbiAgICAgICAgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpXG4gICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHVyaSwgbmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0b3JGaXhlZChmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiAoZnVsbG5hbWUubG9jYWxcbiAgICAgID8gY3JlYXRvckZpeGVkXG4gICAgICA6IGNyZWF0b3JJbmhlcml0KShmdWxsbmFtZSk7XG59XG4iLCAiZnVuY3Rpb24gbm9uZSgpIHt9XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gbm9uZSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9O1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICIvLyBHaXZlbiBzb21ldGhpbmcgYXJyYXkgbGlrZSAob3IgbnVsbCksIHJldHVybnMgc29tZXRoaW5nIHRoYXQgaXMgc3RyaWN0bHkgYW5cbi8vIGFycmF5LiBUaGlzIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgYXJyYXktbGlrZSBvYmplY3RzIHBhc3NlZCB0byBkMy5zZWxlY3RBbGxcbi8vIG9yIHNlbGVjdGlvbi5zZWxlY3RBbGwgYXJlIGNvbnZlcnRlZCBpbnRvIHByb3BlciBhcnJheXMgd2hlbiBjcmVhdGluZyBhXG4vLyBzZWxlY3Rpb247IHdlIGRvblx1MjAxOXQgZXZlciB3YW50IHRvIGNyZWF0ZSBhIHNlbGVjdGlvbiBiYWNrZWQgYnkgYSBsaXZlXG4vLyBIVE1MQ29sbGVjdGlvbiBvciBOb2RlTGlzdC4gSG93ZXZlciwgbm90ZSB0aGF0IHNlbGVjdGlvbi5zZWxlY3RBbGwgd2lsbCB1c2UgYVxuLy8gc3RhdGljIE5vZGVMaXN0IGFzIGEgZ3JvdXAsIHNpbmNlIGl0IHNhZmVseSBkZXJpdmVkIGZyb20gcXVlcnlTZWxlY3RvckFsbC5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFycmF5KHgpIHtcbiAgcmV0dXJuIHggPT0gbnVsbCA/IFtdIDogQXJyYXkuaXNBcnJheSh4KSA/IHggOiBBcnJheS5mcm9tKHgpO1xufVxuIiwgImZ1bmN0aW9uIGVtcHR5KCkge1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gZW1wdHkgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBhcnJheSBmcm9tIFwiLi4vYXJyYXkuanNcIjtcbmltcG9ydCBzZWxlY3RvckFsbCBmcm9tIFwiLi4vc2VsZWN0b3JBbGwuanNcIjtcblxuZnVuY3Rpb24gYXJyYXlBbGwoc2VsZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJyYXkoc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgPT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gYXJyYXlBbGwoc2VsZWN0KTtcbiAgZWxzZSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSk7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHBhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkTWF0Y2hlcihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBub2RlLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG4iLCAiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmQ7XG5cbmZ1bmN0aW9uIGNoaWxkRmluZChtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbmQuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNoaWxkRmlyc3QoKSB7XG4gIHJldHVybiB0aGlzLmZpcnN0RWxlbWVudENoaWxkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QobWF0Y2ggPT0gbnVsbCA/IGNoaWxkRmlyc3RcbiAgICAgIDogY2hpbGRGaW5kKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCAiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyO1xuXG5mdW5jdGlvbiBjaGlsZHJlbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jaGlsZHJlbik7XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuRmlsdGVyKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmlsdGVyLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3RBbGwobWF0Y2ggPT0gbnVsbCA/IGNoaWxkcmVuXG4gICAgICA6IGNoaWxkcmVuRmlsdGVyKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgbWF0Y2hlciBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cGRhdGUpIHtcbiAgcmV0dXJuIG5ldyBBcnJheSh1cGRhdGUubGVuZ3RoKTtcbn1cbiIsICJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9lbnRlciB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gIHRoaXMubmFtZXNwYWNlVVJJID0gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbiAgdGhpcy5fbmV4dCA9IG51bGw7XG4gIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fX2RhdGFfXyA9IGRhdHVtO1xufVxuXG5FbnRlck5vZGUucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRW50ZXJOb2RlLFxuICBhcHBlbmRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHRoaXMuX25leHQpOyB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTsgfSxcbiAgcXVlcnlTZWxlY3RvcjogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgfSxcbiAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7RW50ZXJOb2RlfSBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBiaW5kSW5kZXgocGFyZW50LCBncm91cCwgZW50ZXIsIHVwZGF0ZSwgZXhpdCwgZGF0YSkge1xuICB2YXIgaSA9IDAsXG4gICAgICBub2RlLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgLy8gUHV0IGFueSBub24tbnVsbCBub2RlcyB0aGF0IGZpdCBpbnRvIHVwZGF0ZS5cbiAgLy8gUHV0IGFueSBudWxsIG5vZGVzIGludG8gZW50ZXIuXG4gIC8vIFB1dCBhbnkgcmVtYWluaW5nIGRhdGEgaW50byBlbnRlci5cbiAgZm9yICg7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZShwYXJlbnQsIGRhdGFbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBkb25cdTIwMTl0IGZpdCBpbnRvIGV4aXQuXG4gIGZvciAoOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBiaW5kS2V5KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEsIGtleSkge1xuICB2YXIgaSxcbiAgICAgIG5vZGUsXG4gICAgICBub2RlQnlLZXlWYWx1ZSA9IG5ldyBNYXAsXG4gICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgIGtleVZhbHVlcyA9IG5ldyBBcnJheShncm91cExlbmd0aCksXG4gICAgICBrZXlWYWx1ZTtcblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggbm9kZS5cbiAgLy8gSWYgbXVsdGlwbGUgbm9kZXMgaGF2ZSB0aGUgc2FtZSBrZXksIHRoZSBkdXBsaWNhdGVzIGFyZSBhZGRlZCB0byBleGl0LlxuICBmb3IgKGkgPSAwOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGtleVZhbHVlc1tpXSA9IGtleVZhbHVlID0ga2V5LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApICsgXCJcIjtcbiAgICAgIGlmIChub2RlQnlLZXlWYWx1ZS5oYXMoa2V5VmFsdWUpKSB7XG4gICAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggZGF0dW0uXG4gIC8vIElmIHRoZXJlIGEgbm9kZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXksIGpvaW4gYW5kIGFkZCBpdCB0byB1cGRhdGUuXG4gIC8vIElmIHRoZXJlIGlzIG5vdCAob3IgdGhlIGtleSBpcyBhIGR1cGxpY2F0ZSksIGFkZCBpdCB0byBlbnRlci5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgIGtleVZhbHVlID0ga2V5LmNhbGwocGFyZW50LCBkYXRhW2ldLCBpLCBkYXRhKSArIFwiXCI7XG4gICAgaWYgKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWUpKSB7XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICBub2RlQnlLZXlWYWx1ZS5kZWxldGUoa2V5VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgYW55IHJlbWFpbmluZyBub2RlcyB0aGF0IHdlcmUgbm90IGJvdW5kIHRvIGRhdGEgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZXNbaV0pID09PSBub2RlKSkge1xuICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRhdHVtKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuX19kYXRhX187XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLCBkYXR1bSk7XG5cbiAgdmFyIGJpbmQgPSBrZXkgPyBiaW5kS2V5IDogYmluZEluZGV4LFxuICAgICAgcGFyZW50cyA9IHRoaXMuX3BhcmVudHMsXG4gICAgICBncm91cHMgPSB0aGlzLl9ncm91cHM7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB2YWx1ZSA9IGNvbnN0YW50KHZhbHVlKTtcblxuICBmb3IgKHZhciBtID0gZ3JvdXBzLmxlbmd0aCwgdXBkYXRlID0gbmV3IEFycmF5KG0pLCBlbnRlciA9IG5ldyBBcnJheShtKSwgZXhpdCA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICB2YXIgcGFyZW50ID0gcGFyZW50c1tqXSxcbiAgICAgICAgZ3JvdXAgPSBncm91cHNbal0sXG4gICAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgICBkYXRhID0gYXJyYXlsaWtlKHZhbHVlLmNhbGwocGFyZW50LCBwYXJlbnQgJiYgcGFyZW50Ll9fZGF0YV9fLCBqLCBwYXJlbnRzKSksXG4gICAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgICAgZW50ZXJHcm91cCA9IGVudGVyW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICB1cGRhdGVHcm91cCA9IHVwZGF0ZVtqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgZXhpdEdyb3VwID0gZXhpdFtqXSA9IG5ldyBBcnJheShncm91cExlbmd0aCk7XG5cbiAgICBiaW5kKHBhcmVudCwgZ3JvdXAsIGVudGVyR3JvdXAsIHVwZGF0ZUdyb3VwLCBleGl0R3JvdXAsIGRhdGEsIGtleSk7XG5cbiAgICAvLyBOb3cgY29ubmVjdCB0aGUgZW50ZXIgbm9kZXMgdG8gdGhlaXIgZm9sbG93aW5nIHVwZGF0ZSBub2RlLCBzdWNoIHRoYXRcbiAgICAvLyBhcHBlbmRDaGlsZCBjYW4gaW5zZXJ0IHRoZSBtYXRlcmlhbGl6ZWQgZW50ZXIgbm9kZSBiZWZvcmUgdGhpcyBub2RlLFxuICAgIC8vIHJhdGhlciB0aGFuIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmVudCBub2RlLlxuICAgIGZvciAodmFyIGkwID0gMCwgaTEgPSAwLCBwcmV2aW91cywgbmV4dDsgaTAgPCBkYXRhTGVuZ3RoOyArK2kwKSB7XG4gICAgICBpZiAocHJldmlvdXMgPSBlbnRlckdyb3VwW2kwXSkge1xuICAgICAgICBpZiAoaTAgPj0gaTEpIGkxID0gaTAgKyAxO1xuICAgICAgICB3aGlsZSAoIShuZXh0ID0gdXBkYXRlR3JvdXBbaTFdKSAmJiArK2kxIDwgZGF0YUxlbmd0aCk7XG4gICAgICAgIHByZXZpb3VzLl9uZXh0ID0gbmV4dCB8fCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSA9IG5ldyBTZWxlY3Rpb24odXBkYXRlLCBwYXJlbnRzKTtcbiAgdXBkYXRlLl9lbnRlciA9IGVudGVyO1xuICB1cGRhdGUuX2V4aXQgPSBleGl0O1xuICByZXR1cm4gdXBkYXRlO1xufVxuXG4vLyBHaXZlbiBzb21lIGRhdGEsIHRoaXMgcmV0dXJucyBhbiBhcnJheS1saWtlIHZpZXcgb2YgaXQ6IGFuIG9iamVjdCB0aGF0XG4vLyBleHBvc2VzIGEgbGVuZ3RoIHByb3BlcnR5IGFuZCBhbGxvd3MgbnVtZXJpYyBpbmRleGluZy4gTm90ZSB0aGF0IHVubGlrZVxuLy8gc2VsZWN0QWxsLCB0aGlzIGlzblx1MjAxOXQgd29ycmllZCBhYm91dCBcdTIwMUNsaXZlXHUyMDFEIGNvbGxlY3Rpb25zIGJlY2F1c2UgdGhlIHJlc3VsdGluZ1xuLy8gYXJyYXkgd2lsbCBvbmx5IGJlIHVzZWQgYnJpZWZseSB3aGlsZSBkYXRhIGlzIGJlaW5nIGJvdW5kLiAoSXQgaXMgcG9zc2libGUgdG9cbi8vIGNhdXNlIHRoZSBkYXRhIHRvIGNoYW5nZSB3aGlsZSBpdGVyYXRpbmcgYnkgdXNpbmcgYSBrZXkgZnVuY3Rpb24sIGJ1dCBwbGVhc2Vcbi8vIGRvblx1MjAxOXQ7IHdlXHUyMDE5ZCByYXRoZXIgYXZvaWQgYSBncmF0dWl0b3VzIGNvcHkuKVxuZnVuY3Rpb24gYXJyYXlsaWtlKGRhdGEpIHtcbiAgcmV0dXJuIHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiICYmIFwibGVuZ3RoXCIgaW4gZGF0YVxuICAgID8gZGF0YSAvLyBBcnJheSwgVHlwZWRBcnJheSwgTm9kZUxpc3QsIGFycmF5LWxpa2VcbiAgICA6IEFycmF5LmZyb20oZGF0YSk7IC8vIE1hcCwgU2V0LCBpdGVyYWJsZSwgc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG59XG4iLCAiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZXhpdCB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9uZW50ZXIsIG9udXBkYXRlLCBvbmV4aXQpIHtcbiAgdmFyIGVudGVyID0gdGhpcy5lbnRlcigpLCB1cGRhdGUgPSB0aGlzLCBleGl0ID0gdGhpcy5leGl0KCk7XG4gIGlmICh0eXBlb2Ygb25lbnRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZW50ZXIgPSBvbmVudGVyKGVudGVyKTtcbiAgICBpZiAoZW50ZXIpIGVudGVyID0gZW50ZXIuc2VsZWN0aW9uKCk7XG4gIH0gZWxzZSB7XG4gICAgZW50ZXIgPSBlbnRlci5hcHBlbmQob25lbnRlciArIFwiXCIpO1xuICB9XG4gIGlmIChvbnVwZGF0ZSAhPSBudWxsKSB7XG4gICAgdXBkYXRlID0gb251cGRhdGUodXBkYXRlKTtcbiAgICBpZiAodXBkYXRlKSB1cGRhdGUgPSB1cGRhdGUuc2VsZWN0aW9uKCk7XG4gIH1cbiAgaWYgKG9uZXhpdCA9PSBudWxsKSBleGl0LnJlbW92ZSgpOyBlbHNlIG9uZXhpdChleGl0KTtcbiAgcmV0dXJuIGVudGVyICYmIHVwZGF0ZSA/IGVudGVyLm1lcmdlKHVwZGF0ZSkub3JkZXIoKSA6IHVwZGF0ZTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICB2YXIgc2VsZWN0aW9uID0gY29udGV4dC5zZWxlY3Rpb24gPyBjb250ZXh0LnNlbGVjdGlvbigpIDogY29udGV4dDtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gc2VsZWN0aW9uLl9ncm91cHMsIG0wID0gZ3JvdXBzMC5sZW5ndGgsIG0xID0gZ3JvdXBzMS5sZW5ndGgsIG0gPSBNYXRoLm1pbihtMCwgbTEpLCBtZXJnZXMgPSBuZXcgQXJyYXkobTApLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwMCA9IGdyb3VwczBbal0sIGdyb3VwMSA9IGdyb3VwczFbal0sIG4gPSBncm91cDAubGVuZ3RoLCBtZXJnZSA9IG1lcmdlc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXAwW2ldIHx8IGdyb3VwMVtpXSkge1xuICAgICAgICBtZXJnZVtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IGogPCBtMDsgKytqKSB7XG4gICAgbWVyZ2VzW2pdID0gZ3JvdXBzMFtqXTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gLTEsIG0gPSBncm91cHMubGVuZ3RoOyArK2ogPCBtOykge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDspIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgaWYgKG5leHQgJiYgbm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuZXh0KSBeIDQpIG5leHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbmV4dCk7XG4gICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb21wYXJlKSB7XG4gIGlmICghY29tcGFyZSkgY29tcGFyZSA9IGFzY2VuZGluZztcblxuICBmdW5jdGlvbiBjb21wYXJlTm9kZShhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiA/IGNvbXBhcmUoYS5fX2RhdGFfXywgYi5fX2RhdGFfXykgOiAhYSAtICFiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc29ydGdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc29ydGdyb3VwID0gc29ydGdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc29ydGdyb3VwW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydGdyb3VwLnNvcnQoY29tcGFyZU5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc29ydGdyb3VwcywgdGhpcy5fcGFyZW50cykub3JkZXIoKTtcbn1cblxuZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gIGFyZ3VtZW50c1swXSA9IHRoaXM7XG4gIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIG5vZGUgPSBncm91cFtpXTtcbiAgICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgbGV0IHNpemUgPSAwO1xuICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcykgKytzaXplOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiBzaXplO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMubm9kZSgpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIGNhbGxiYWNrLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwgImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4uL25hbWVzcGFjZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHYpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLm5vZGUoKTtcbiAgICByZXR1cm4gZnVsbG5hbWUubG9jYWxcbiAgICAgICAgPyBub2RlLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbClcbiAgICAgICAgOiBub2RlLmdldEF0dHJpYnV0ZShmdWxsbmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkpKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwgImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlLCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICBlbHNlIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdiwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICA/IHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgICAgICAgPyBzdHlsZVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICA/IHN0eWxlRnVuY3Rpb25cbiAgICAgICAgICAgIDogc3R5bGVDb25zdGFudCkobmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKVxuICAgICAgOiBzdHlsZVZhbHVlKHRoaXMubm9kZSgpLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlVmFsdWUobm9kZSwgbmFtZSkge1xuICByZXR1cm4gbm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpXG4gICAgICB8fCBkZWZhdWx0Vmlldyhub2RlKS5nZXRDb21wdXRlZFN0eWxlKG5vZGUsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG59XG4iLCAiZnVuY3Rpb24gcHJvcGVydHlSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXNbbmFtZV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5Q29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgIGVsc2UgdGhpc1tuYW1lXSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHByb3BlcnR5UmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHByb3BlcnR5RnVuY3Rpb25cbiAgICAgICAgICA6IHByb3BlcnR5Q29uc3RhbnQpKG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKClbbmFtZV07XG59XG4iLCAiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLCAiZnVuY3Rpb24gdGV4dFJlbW92ZSgpIHtcbiAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIHRleHRDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyB0ZXh0UmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyB0ZXh0RnVuY3Rpb25cbiAgICAgICAgICA6IHRleHRDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS50ZXh0Q29udGVudDtcbn1cbiIsICJmdW5jdGlvbiBodG1sUmVtb3ZlKCkge1xuICB0aGlzLmlubmVySFRNTCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGh0bWxDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaHRtbEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IGh0bWxSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGh0bWxGdW5jdGlvblxuICAgICAgICAgIDogaHRtbENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLmlubmVySFRNTDtcbn1cbiIsICJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwgImZ1bmN0aW9uIGxvd2VyKCkge1xuICBpZiAodGhpcy5wcmV2aW91c1NpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcywgdGhpcy5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChsb3dlcik7XG59XG4iLCAiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kQ2hpbGQoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9KTtcbn1cbiIsICJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwgImZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChyZW1vdmUpO1xufVxuIiwgImZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZVNoYWxsb3coKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKGZhbHNlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lRGVlcCgpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUodHJ1ZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGRlZXApIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGRlZXAgPyBzZWxlY3Rpb25fY2xvbmVEZWVwIDogc2VsZWN0aW9uX2Nsb25lU2hhbGxvdyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKVxuICAgICAgOiB0aGlzLm5vZGUoKS5fX2RhdGFfXztcbn1cbiIsICJmdW5jdGlvbiBjb250ZXh0TGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCwgdGhpcy5fX2RhdGFfXyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uUmVtb3ZlKHR5cGVuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb247XG4gICAgaWYgKCFvbikgcmV0dXJuO1xuICAgIGZvciAodmFyIGogPSAwLCBpID0gLTEsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGlmIChvID0gb25bal0sICghdHlwZW5hbWUudHlwZSB8fCBvLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUpICYmIG8ubmFtZSA9PT0gdHlwZW5hbWUubmFtZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyLCBvLm9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25bKytpXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgrK2kpIG9uLmxlbmd0aCA9IGk7XG4gICAgZWxzZSBkZWxldGUgdGhpcy5fX29uO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbkFkZCh0eXBlbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbiwgbywgbGlzdGVuZXIgPSBjb250ZXh0TGlzdGVuZXIodmFsdWUpO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICAgIGlmICgobyA9IG9uW2pdKS50eXBlID09PSB0eXBlbmFtZS50eXBlICYmIG8ubmFtZSA9PT0gdHlwZW5hbWUubmFtZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyLCBvLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyID0gbGlzdGVuZXIsIG8ub3B0aW9ucyA9IG9wdGlvbnMpO1xuICAgICAgICBvLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGVuYW1lLnR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKTtcbiAgICBvID0ge3R5cGU6IHR5cGVuYW1lLnR5cGUsIG5hbWU6IHR5cGVuYW1lLm5hbWUsIHZhbHVlOiB2YWx1ZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCBvcHRpb25zOiBvcHRpb25zfTtcbiAgICBpZiAoIW9uKSB0aGlzLl9fb24gPSBbb107XG4gICAgZWxzZSBvbi5wdXNoKG8pO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGVuYW1lcyA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiksIGksIG4gPSB0eXBlbmFtZXMubGVuZ3RoLCB0O1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBvbiA9IHRoaXMubm9kZSgpLl9fb247XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgZm9yIChpID0gMCwgbyA9IG9uW2pdOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICgodCA9IHR5cGVuYW1lc1tpXSkudHlwZSA9PT0gby50eXBlICYmIHQubmFtZSA9PT0gby5uYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIG8udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb24gPSB2YWx1ZSA/IG9uQWRkIDogb25SZW1vdmU7XG4gIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHRoaXMuZWFjaChvbih0eXBlbmFtZXNbaV0sIHZhbHVlLCBvcHRpb25zKSk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwgImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobm9kZSwgdHlwZSwgcGFyYW1zKSB7XG4gIHZhciB3aW5kb3cgPSBkZWZhdWx0Vmlldyhub2RlKSxcbiAgICAgIGV2ZW50ID0gd2luZG93LkN1c3RvbUV2ZW50O1xuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGV2ZW50ID0gbmV3IGV2ZW50KHR5cGUsIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgZXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICBpZiAocGFyYW1zKSBldmVudC5pbml0RXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlKSwgZXZlbnQuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgICBlbHNlIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICB9XG5cbiAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDb25zdGFudCh0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gZGlzcGF0Y2hGdW5jdGlvblxuICAgICAgOiBkaXNwYXRjaENvbnN0YW50KSh0eXBlLCBwYXJhbXMpKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB5aWVsZCBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCBzZWxlY3Rpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdENoaWxkIGZyb20gXCIuL3NlbGVjdENoaWxkLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuIGZyb20gXCIuL3NlbGVjdENoaWxkcmVuLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0YSBmcm9tIFwiLi9kYXRhLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VudGVyIGZyb20gXCIuL2VudGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2V4aXQgZnJvbSBcIi4vZXhpdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9qb2luIGZyb20gXCIuL2pvaW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fb3JkZXIgZnJvbSBcIi4vb3JkZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc29ydCBmcm9tIFwiLi9zb3J0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NhbGwgZnJvbSBcIi4vY2FsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9ub2RlcyBmcm9tIFwiLi9ub2Rlcy5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9ub2RlIGZyb20gXCIuL25vZGUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2l6ZSBmcm9tIFwiLi9zaXplLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VtcHR5IGZyb20gXCIuL2VtcHR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VhY2ggZnJvbSBcIi4vZWFjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcHJvcGVydHkgZnJvbSBcIi4vcHJvcGVydHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2xhc3NlZCBmcm9tIFwiLi9jbGFzc2VkLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3RleHQgZnJvbSBcIi4vdGV4dC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9odG1sIGZyb20gXCIuL2h0bWwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmFpc2UgZnJvbSBcIi4vcmFpc2UuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbG93ZXIgZnJvbSBcIi4vbG93ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXBwZW5kIGZyb20gXCIuL2FwcGVuZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pbnNlcnQgZnJvbSBcIi4vaW5zZXJ0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JlbW92ZSBmcm9tIFwiLi9yZW1vdmUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2xvbmUgZnJvbSBcIi4vY2xvbmUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0dW0gZnJvbSBcIi4vZGF0dW0uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fb24gZnJvbSBcIi4vb24uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGlzcGF0Y2ggZnJvbSBcIi4vZGlzcGF0Y2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faXRlcmF0b3IgZnJvbSBcIi4vaXRlcmF0b3IuanNcIjtcblxuZXhwb3J0IHZhciByb290ID0gW251bGxdO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0aW9uKGdyb3VwcywgcGFyZW50cykge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XV0sIHJvb3QpO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fc2VsZWN0aW9uKCkge1xuICByZXR1cm4gdGhpcztcbn1cblxuU2VsZWN0aW9uLnByb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZWxlY3Rpb24sXG4gIHNlbGVjdDogc2VsZWN0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiBzZWxlY3Rpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3NlbGVjdENoaWxkLFxuICBzZWxlY3RDaGlsZHJlbjogc2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHNlbGVjdGlvbl9maWx0ZXIsXG4gIGRhdGE6IHNlbGVjdGlvbl9kYXRhLFxuICBlbnRlcjogc2VsZWN0aW9uX2VudGVyLFxuICBleGl0OiBzZWxlY3Rpb25fZXhpdCxcbiAgam9pbjogc2VsZWN0aW9uX2pvaW4sXG4gIG1lcmdlOiBzZWxlY3Rpb25fbWVyZ2UsXG4gIHNlbGVjdGlvbjogc2VsZWN0aW9uX3NlbGVjdGlvbixcbiAgb3JkZXI6IHNlbGVjdGlvbl9vcmRlcixcbiAgc29ydDogc2VsZWN0aW9uX3NvcnQsXG4gIGNhbGw6IHNlbGVjdGlvbl9jYWxsLFxuICBub2Rlczogc2VsZWN0aW9uX25vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fbm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3NpemUsXG4gIGVtcHR5OiBzZWxlY3Rpb25fZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9lYWNoLFxuICBhdHRyOiBzZWxlY3Rpb25fYXR0cixcbiAgc3R5bGU6IHNlbGVjdGlvbl9zdHlsZSxcbiAgcHJvcGVydHk6IHNlbGVjdGlvbl9wcm9wZXJ0eSxcbiAgY2xhc3NlZDogc2VsZWN0aW9uX2NsYXNzZWQsXG4gIHRleHQ6IHNlbGVjdGlvbl90ZXh0LFxuICBodG1sOiBzZWxlY3Rpb25faHRtbCxcbiAgcmFpc2U6IHNlbGVjdGlvbl9yYWlzZSxcbiAgbG93ZXI6IHNlbGVjdGlvbl9sb3dlcixcbiAgYXBwZW5kOiBzZWxlY3Rpb25fYXBwZW5kLFxuICBpbnNlcnQ6IHNlbGVjdGlvbl9pbnNlcnQsXG4gIHJlbW92ZTogc2VsZWN0aW9uX3JlbW92ZSxcbiAgY2xvbmU6IHNlbGVjdGlvbl9jbG9uZSxcbiAgZGF0dW06IHNlbGVjdGlvbl9kYXR1bSxcbiAgb246IHNlbGVjdGlvbl9vbixcbiAgZGlzcGF0Y2g6IHNlbGVjdGlvbl9kaXNwYXRjaCxcbiAgW1N5bWJvbC5pdGVyYXRvcl06IHNlbGVjdGlvbl9pdGVyYXRvclxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VsZWN0aW9uO1xuIiwgImltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcildXSwgW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF0pXG4gICAgICA6IG5ldyBTZWxlY3Rpb24oW1tzZWxlY3Rvcl1dLCByb290KTtcbn1cbiIsICJpbXBvcnQgYXJyYXkgZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFthcnJheShzZWxlY3RvcildLCByb290KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZmFjdG9yeSwgcHJvdG90eXBlKSB7XG4gIGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZhY3RvcnkucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICBwcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChwYXJlbnQsIGRlZmluaXRpb24pIHtcbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSBwcm90b3R5cGVba2V5XSA9IGRlZmluaXRpb25ba2V5XTtcbiAgcmV0dXJuIHByb3RvdHlwZTtcbn1cbiIsICJpbXBvcnQgZGVmaW5lLCB7ZXh0ZW5kfSBmcm9tIFwiLi9kZWZpbmUuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIENvbG9yKCkge31cblxuZXhwb3J0IHZhciBkYXJrZXIgPSAwLjc7XG5leHBvcnQgdmFyIGJyaWdodGVyID0gMSAvIGRhcmtlcjtcblxudmFyIHJlSSA9IFwiXFxcXHMqKFsrLV0/XFxcXGQrKVxcXFxzKlwiLFxuICAgIHJlTiA9IFwiXFxcXHMqKFsrLV0/KD86XFxcXGQqXFxcXC4pP1xcXFxkKyg/OltlRV1bKy1dP1xcXFxkKyk/KVxcXFxzKlwiLFxuICAgIHJlUCA9IFwiXFxcXHMqKFsrLV0/KD86XFxcXGQqXFxcXC4pP1xcXFxkKyg/OltlRV1bKy1dP1xcXFxkKyk/KSVcXFxccypcIixcbiAgICByZUhleCA9IC9eIyhbMC05YS1mXXszLDh9KSQvLFxuICAgIHJlUmdiSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVJfSwke3JlSX0sJHtyZUl9XFxcXCkkYCksXG4gICAgcmVSZ2JQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYlxcXFwoJHtyZVB9LCR7cmVQfSwke3JlUH1cXFxcKSRgKSxcbiAgICByZVJnYmFJbnRlZ2VyID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVJfSwke3JlSX0sJHtyZUl9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlUmdiYVBlcmNlbnQgPSBuZXcgUmVnRXhwKGBecmdiYVxcXFwoJHtyZVB9LCR7cmVQfSwke3JlUH0sJHtyZU59XFxcXCkkYCksXG4gICAgcmVIc2xQZXJjZW50ID0gbmV3IFJlZ0V4cChgXmhzbFxcXFwoJHtyZU59LCR7cmVQfSwke3JlUH1cXFxcKSRgKSxcbiAgICByZUhzbGFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXmhzbGFcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApO1xuXG52YXIgbmFtZWQgPSB7XG4gIGFsaWNlYmx1ZTogMHhmMGY4ZmYsXG4gIGFudGlxdWV3aGl0ZTogMHhmYWViZDcsXG4gIGFxdWE6IDB4MDBmZmZmLFxuICBhcXVhbWFyaW5lOiAweDdmZmZkNCxcbiAgYXp1cmU6IDB4ZjBmZmZmLFxuICBiZWlnZTogMHhmNWY1ZGMsXG4gIGJpc3F1ZTogMHhmZmU0YzQsXG4gIGJsYWNrOiAweDAwMDAwMCxcbiAgYmxhbmNoZWRhbG1vbmQ6IDB4ZmZlYmNkLFxuICBibHVlOiAweDAwMDBmZixcbiAgYmx1ZXZpb2xldDogMHg4YTJiZTIsXG4gIGJyb3duOiAweGE1MmEyYSxcbiAgYnVybHl3b29kOiAweGRlYjg4NyxcbiAgY2FkZXRibHVlOiAweDVmOWVhMCxcbiAgY2hhcnRyZXVzZTogMHg3ZmZmMDAsXG4gIGNob2NvbGF0ZTogMHhkMjY5MWUsXG4gIGNvcmFsOiAweGZmN2Y1MCxcbiAgY29ybmZsb3dlcmJsdWU6IDB4NjQ5NWVkLFxuICBjb3Juc2lsazogMHhmZmY4ZGMsXG4gIGNyaW1zb246IDB4ZGMxNDNjLFxuICBjeWFuOiAweDAwZmZmZixcbiAgZGFya2JsdWU6IDB4MDAwMDhiLFxuICBkYXJrY3lhbjogMHgwMDhiOGIsXG4gIGRhcmtnb2xkZW5yb2Q6IDB4Yjg4NjBiLFxuICBkYXJrZ3JheTogMHhhOWE5YTksXG4gIGRhcmtncmVlbjogMHgwMDY0MDAsXG4gIGRhcmtncmV5OiAweGE5YTlhOSxcbiAgZGFya2toYWtpOiAweGJkYjc2YixcbiAgZGFya21hZ2VudGE6IDB4OGIwMDhiLFxuICBkYXJrb2xpdmVncmVlbjogMHg1NTZiMmYsXG4gIGRhcmtvcmFuZ2U6IDB4ZmY4YzAwLFxuICBkYXJrb3JjaGlkOiAweDk5MzJjYyxcbiAgZGFya3JlZDogMHg4YjAwMDAsXG4gIGRhcmtzYWxtb246IDB4ZTk5NjdhLFxuICBkYXJrc2VhZ3JlZW46IDB4OGZiYzhmLFxuICBkYXJrc2xhdGVibHVlOiAweDQ4M2Q4YixcbiAgZGFya3NsYXRlZ3JheTogMHgyZjRmNGYsXG4gIGRhcmtzbGF0ZWdyZXk6IDB4MmY0ZjRmLFxuICBkYXJrdHVycXVvaXNlOiAweDAwY2VkMSxcbiAgZGFya3Zpb2xldDogMHg5NDAwZDMsXG4gIGRlZXBwaW5rOiAweGZmMTQ5MyxcbiAgZGVlcHNreWJsdWU6IDB4MDBiZmZmLFxuICBkaW1ncmF5OiAweDY5Njk2OSxcbiAgZGltZ3JleTogMHg2OTY5NjksXG4gIGRvZGdlcmJsdWU6IDB4MWU5MGZmLFxuICBmaXJlYnJpY2s6IDB4YjIyMjIyLFxuICBmbG9yYWx3aGl0ZTogMHhmZmZhZjAsXG4gIGZvcmVzdGdyZWVuOiAweDIyOGIyMixcbiAgZnVjaHNpYTogMHhmZjAwZmYsXG4gIGdhaW5zYm9ybzogMHhkY2RjZGMsXG4gIGdob3N0d2hpdGU6IDB4ZjhmOGZmLFxuICBnb2xkOiAweGZmZDcwMCxcbiAgZ29sZGVucm9kOiAweGRhYTUyMCxcbiAgZ3JheTogMHg4MDgwODAsXG4gIGdyZWVuOiAweDAwODAwMCxcbiAgZ3JlZW55ZWxsb3c6IDB4YWRmZjJmLFxuICBncmV5OiAweDgwODA4MCxcbiAgaG9uZXlkZXc6IDB4ZjBmZmYwLFxuICBob3RwaW5rOiAweGZmNjliNCxcbiAgaW5kaWFucmVkOiAweGNkNWM1YyxcbiAgaW5kaWdvOiAweDRiMDA4MixcbiAgaXZvcnk6IDB4ZmZmZmYwLFxuICBraGFraTogMHhmMGU2OGMsXG4gIGxhdmVuZGVyOiAweGU2ZTZmYSxcbiAgbGF2ZW5kZXJibHVzaDogMHhmZmYwZjUsXG4gIGxhd25ncmVlbjogMHg3Y2ZjMDAsXG4gIGxlbW9uY2hpZmZvbjogMHhmZmZhY2QsXG4gIGxpZ2h0Ymx1ZTogMHhhZGQ4ZTYsXG4gIGxpZ2h0Y29yYWw6IDB4ZjA4MDgwLFxuICBsaWdodGN5YW46IDB4ZTBmZmZmLFxuICBsaWdodGdvbGRlbnJvZHllbGxvdzogMHhmYWZhZDIsXG4gIGxpZ2h0Z3JheTogMHhkM2QzZDMsXG4gIGxpZ2h0Z3JlZW46IDB4OTBlZTkwLFxuICBsaWdodGdyZXk6IDB4ZDNkM2QzLFxuICBsaWdodHBpbms6IDB4ZmZiNmMxLFxuICBsaWdodHNhbG1vbjogMHhmZmEwN2EsXG4gIGxpZ2h0c2VhZ3JlZW46IDB4MjBiMmFhLFxuICBsaWdodHNreWJsdWU6IDB4ODdjZWZhLFxuICBsaWdodHNsYXRlZ3JheTogMHg3Nzg4OTksXG4gIGxpZ2h0c2xhdGVncmV5OiAweDc3ODg5OSxcbiAgbGlnaHRzdGVlbGJsdWU6IDB4YjBjNGRlLFxuICBsaWdodHllbGxvdzogMHhmZmZmZTAsXG4gIGxpbWU6IDB4MDBmZjAwLFxuICBsaW1lZ3JlZW46IDB4MzJjZDMyLFxuICBsaW5lbjogMHhmYWYwZTYsXG4gIG1hZ2VudGE6IDB4ZmYwMGZmLFxuICBtYXJvb246IDB4ODAwMDAwLFxuICBtZWRpdW1hcXVhbWFyaW5lOiAweDY2Y2RhYSxcbiAgbWVkaXVtYmx1ZTogMHgwMDAwY2QsXG4gIG1lZGl1bW9yY2hpZDogMHhiYTU1ZDMsXG4gIG1lZGl1bXB1cnBsZTogMHg5MzcwZGIsXG4gIG1lZGl1bXNlYWdyZWVuOiAweDNjYjM3MSxcbiAgbWVkaXVtc2xhdGVibHVlOiAweDdiNjhlZSxcbiAgbWVkaXVtc3ByaW5nZ3JlZW46IDB4MDBmYTlhLFxuICBtZWRpdW10dXJxdW9pc2U6IDB4NDhkMWNjLFxuICBtZWRpdW12aW9sZXRyZWQ6IDB4YzcxNTg1LFxuICBtaWRuaWdodGJsdWU6IDB4MTkxOTcwLFxuICBtaW50Y3JlYW06IDB4ZjVmZmZhLFxuICBtaXN0eXJvc2U6IDB4ZmZlNGUxLFxuICBtb2NjYXNpbjogMHhmZmU0YjUsXG4gIG5hdmFqb3doaXRlOiAweGZmZGVhZCxcbiAgbmF2eTogMHgwMDAwODAsXG4gIG9sZGxhY2U6IDB4ZmRmNWU2LFxuICBvbGl2ZTogMHg4MDgwMDAsXG4gIG9saXZlZHJhYjogMHg2YjhlMjMsXG4gIG9yYW5nZTogMHhmZmE1MDAsXG4gIG9yYW5nZXJlZDogMHhmZjQ1MDAsXG4gIG9yY2hpZDogMHhkYTcwZDYsXG4gIHBhbGVnb2xkZW5yb2Q6IDB4ZWVlOGFhLFxuICBwYWxlZ3JlZW46IDB4OThmYjk4LFxuICBwYWxldHVycXVvaXNlOiAweGFmZWVlZSxcbiAgcGFsZXZpb2xldHJlZDogMHhkYjcwOTMsXG4gIHBhcGF5YXdoaXA6IDB4ZmZlZmQ1LFxuICBwZWFjaHB1ZmY6IDB4ZmZkYWI5LFxuICBwZXJ1OiAweGNkODUzZixcbiAgcGluazogMHhmZmMwY2IsXG4gIHBsdW06IDB4ZGRhMGRkLFxuICBwb3dkZXJibHVlOiAweGIwZTBlNixcbiAgcHVycGxlOiAweDgwMDA4MCxcbiAgcmViZWNjYXB1cnBsZTogMHg2NjMzOTksXG4gIHJlZDogMHhmZjAwMDAsXG4gIHJvc3licm93bjogMHhiYzhmOGYsXG4gIHJveWFsYmx1ZTogMHg0MTY5ZTEsXG4gIHNhZGRsZWJyb3duOiAweDhiNDUxMyxcbiAgc2FsbW9uOiAweGZhODA3MixcbiAgc2FuZHlicm93bjogMHhmNGE0NjAsXG4gIHNlYWdyZWVuOiAweDJlOGI1NyxcbiAgc2Vhc2hlbGw6IDB4ZmZmNWVlLFxuICBzaWVubmE6IDB4YTA1MjJkLFxuICBzaWx2ZXI6IDB4YzBjMGMwLFxuICBza3libHVlOiAweDg3Y2VlYixcbiAgc2xhdGVibHVlOiAweDZhNWFjZCxcbiAgc2xhdGVncmF5OiAweDcwODA5MCxcbiAgc2xhdGVncmV5OiAweDcwODA5MCxcbiAgc25vdzogMHhmZmZhZmEsXG4gIHNwcmluZ2dyZWVuOiAweDAwZmY3ZixcbiAgc3RlZWxibHVlOiAweDQ2ODJiNCxcbiAgdGFuOiAweGQyYjQ4YyxcbiAgdGVhbDogMHgwMDgwODAsXG4gIHRoaXN0bGU6IDB4ZDhiZmQ4LFxuICB0b21hdG86IDB4ZmY2MzQ3LFxuICB0dXJxdW9pc2U6IDB4NDBlMGQwLFxuICB2aW9sZXQ6IDB4ZWU4MmVlLFxuICB3aGVhdDogMHhmNWRlYjMsXG4gIHdoaXRlOiAweGZmZmZmZixcbiAgd2hpdGVzbW9rZTogMHhmNWY1ZjUsXG4gIHllbGxvdzogMHhmZmZmMDAsXG4gIHllbGxvd2dyZWVuOiAweDlhY2QzMlxufTtcblxuZGVmaW5lKENvbG9yLCBjb2xvciwge1xuICBjb3B5KGNoYW5uZWxzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IHRoaXMuY29uc3RydWN0b3IsIHRoaXMsIGNoYW5uZWxzKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucmdiKCkuZGlzcGxheWFibGUoKTtcbiAgfSxcbiAgaGV4OiBjb2xvcl9mb3JtYXRIZXgsIC8vIERlcHJlY2F0ZWQhIFVzZSBjb2xvci5mb3JtYXRIZXguXG4gIGZvcm1hdEhleDogY29sb3JfZm9ybWF0SGV4LFxuICBmb3JtYXRIZXg4OiBjb2xvcl9mb3JtYXRIZXg4LFxuICBmb3JtYXRIc2w6IGNvbG9yX2Zvcm1hdEhzbCxcbiAgZm9ybWF0UmdiOiBjb2xvcl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiBjb2xvcl9mb3JtYXRSZ2Jcbn0pO1xuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdEhleCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXg4KCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhzbCgpIHtcbiAgcmV0dXJuIGhzbENvbnZlcnQodGhpcykuZm9ybWF0SHNsKCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdFJnYigpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0UmdiKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbG9yKGZvcm1hdCkge1xuICB2YXIgbSwgbDtcbiAgZm9ybWF0ID0gKGZvcm1hdCArIFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gKG0gPSByZUhleC5leGVjKGZvcm1hdCkpID8gKGwgPSBtWzFdLmxlbmd0aCwgbSA9IHBhcnNlSW50KG1bMV0sIDE2KSwgbCA9PT0gNiA/IHJnYm4obSkgLy8gI2ZmMDAwMFxuICAgICAgOiBsID09PSAzID8gbmV3IFJnYigobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKG0gJiAweGYpIDw8IDQpIHwgKG0gJiAweGYpLCAxKSAvLyAjZjAwXG4gICAgICA6IGwgPT09IDggPyByZ2JhKG0gPj4gMjQgJiAweGZmLCBtID4+IDE2ICYgMHhmZiwgbSA+PiA4ICYgMHhmZiwgKG0gJiAweGZmKSAvIDB4ZmYpIC8vICNmZjAwMDAwMFxuICAgICAgOiBsID09PSA0ID8gcmdiYSgobSA+PiAxMiAmIDB4ZikgfCAobSA+PiA4ICYgMHhmMCksIChtID4+IDggJiAweGYpIHwgKG0gPj4gNCAmIDB4ZjApLCAobSA+PiA0ICYgMHhmKSB8IChtICYgMHhmMCksICgoKG0gJiAweGYpIDw8IDQpIHwgKG0gJiAweGYpKSAvIDB4ZmYpIC8vICNmMDAwXG4gICAgICA6IG51bGwpIC8vIGludmFsaWQgaGV4XG4gICAgICA6IChtID0gcmVSZ2JJbnRlZ2VyLmV4ZWMoZm9ybWF0KSkgPyBuZXcgUmdiKG1bMV0sIG1bMl0sIG1bM10sIDEpIC8vIHJnYigyNTUsIDAsIDApXG4gICAgICA6IChtID0gcmVSZ2JQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBuZXcgUmdiKG1bMV0gKiAyNTUgLyAxMDAsIG1bMl0gKiAyNTUgLyAxMDAsIG1bM10gKiAyNTUgLyAxMDAsIDEpIC8vIHJnYigxMDAlLCAwJSwgMCUpXG4gICAgICA6IChtID0gcmVSZ2JhSW50ZWdlci5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdLCBtWzJdLCBtWzNdLCBtWzRdKSAvLyByZ2JhKDI1NSwgMCwgMCwgMSlcbiAgICAgIDogKG0gPSByZVJnYmFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyByZ2JhKG1bMV0gKiAyNTUgLyAxMDAsIG1bMl0gKiAyNTUgLyAxMDAsIG1bM10gKiAyNTUgLyAxMDAsIG1bNF0pIC8vIHJnYigxMDAlLCAwJSwgMCUsIDEpXG4gICAgICA6IChtID0gcmVIc2xQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIDEpIC8vIGhzbCgxMjAsIDUwJSwgNTAlKVxuICAgICAgOiAobSA9IHJlSHNsYVBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IGhzbGEobVsxXSwgbVsyXSAvIDEwMCwgbVszXSAvIDEwMCwgbVs0XSkgLy8gaHNsYSgxMjAsIDUwJSwgNTAlLCAxKVxuICAgICAgOiBuYW1lZC5oYXNPd25Qcm9wZXJ0eShmb3JtYXQpID8gcmdibihuYW1lZFtmb3JtYXRdKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICAgICAgOiBmb3JtYXQgPT09IFwidHJhbnNwYXJlbnRcIiA/IG5ldyBSZ2IoTmFOLCBOYU4sIE5hTiwgMClcbiAgICAgIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gcmdibihuKSB7XG4gIHJldHVybiBuZXcgUmdiKG4gPj4gMTYgJiAweGZmLCBuID4+IDggJiAweGZmLCBuICYgMHhmZiwgMSk7XG59XG5cbmZ1bmN0aW9uIHJnYmEociwgZywgYiwgYSkge1xuICBpZiAoYSA8PSAwKSByID0gZyA9IGIgPSBOYU47XG4gIHJldHVybiBuZXcgUmdiKHIsIGcsIGIsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiQ29udmVydChvKSB7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBDb2xvcikpIG8gPSBjb2xvcihvKTtcbiAgaWYgKCFvKSByZXR1cm4gbmV3IFJnYjtcbiAgbyA9IG8ucmdiKCk7XG4gIHJldHVybiBuZXcgUmdiKG8uciwgby5nLCBvLmIsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IHJnYkNvbnZlcnQocikgOiBuZXcgUmdiKHIsIGcsIGIsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJnYihyLCBnLCBiLCBvcGFjaXR5KSB7XG4gIHRoaXMuciA9ICtyO1xuICB0aGlzLmcgPSArZztcbiAgdGhpcy5iID0gK2I7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoUmdiLCByZ2IsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGJyaWdodGVyIDogTWF0aC5wb3coYnJpZ2h0ZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBSZ2IodGhpcy5yICogaywgdGhpcy5nICogaywgdGhpcy5iICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgcmdiKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjbGFtcCgpIHtcbiAgICByZXR1cm4gbmV3IFJnYihjbGFtcGkodGhpcy5yKSwgY2xhbXBpKHRoaXMuZyksIGNsYW1waSh0aGlzLmIpLCBjbGFtcGEodGhpcy5vcGFjaXR5KSk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiAoLTAuNSA8PSB0aGlzLnIgJiYgdGhpcy5yIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuZyAmJiB0aGlzLmcgPCAyNTUuNSlcbiAgICAgICAgJiYgKC0wLjUgPD0gdGhpcy5iICYmIHRoaXMuYiA8IDI1NS41KVxuICAgICAgICAmJiAoMCA8PSB0aGlzLm9wYWNpdHkgJiYgdGhpcy5vcGFjaXR5IDw9IDEpO1xuICB9LFxuICBoZXg6IHJnYl9mb3JtYXRIZXgsIC8vIERlcHJlY2F0ZWQhIFVzZSBjb2xvci5mb3JtYXRIZXguXG4gIGZvcm1hdEhleDogcmdiX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogcmdiX2Zvcm1hdEhleDgsXG4gIGZvcm1hdFJnYjogcmdiX2Zvcm1hdFJnYixcbiAgdG9TdHJpbmc6IHJnYl9mb3JtYXRSZ2Jcbn0pKTtcblxuZnVuY3Rpb24gcmdiX2Zvcm1hdEhleCgpIHtcbiAgcmV0dXJuIGAjJHtoZXgodGhpcy5yKX0ke2hleCh0aGlzLmcpfSR7aGV4KHRoaXMuYil9YDtcbn1cblxuZnVuY3Rpb24gcmdiX2Zvcm1hdEhleDgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfSR7aGV4KChpc05hTih0aGlzLm9wYWNpdHkpID8gMSA6IHRoaXMub3BhY2l0eSkgKiAyNTUpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRSZ2IoKSB7XG4gIGNvbnN0IGEgPSBjbGFtcGEodGhpcy5vcGFjaXR5KTtcbiAgcmV0dXJuIGAke2EgPT09IDEgPyBcInJnYihcIiA6IFwicmdiYShcIn0ke2NsYW1waSh0aGlzLnIpfSwgJHtjbGFtcGkodGhpcy5nKX0sICR7Y2xhbXBpKHRoaXMuYil9JHthID09PSAxID8gXCIpXCIgOiBgLCAke2F9KWB9YDtcbn1cblxuZnVuY3Rpb24gY2xhbXBhKG9wYWNpdHkpIHtcbiAgcmV0dXJuIGlzTmFOKG9wYWNpdHkpID8gMSA6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIG9wYWNpdHkpKTtcbn1cblxuZnVuY3Rpb24gY2xhbXBpKHZhbHVlKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQodmFsdWUpIHx8IDApKTtcbn1cblxuZnVuY3Rpb24gaGV4KHZhbHVlKSB7XG4gIHZhbHVlID0gY2xhbXBpKHZhbHVlKTtcbiAgcmV0dXJuICh2YWx1ZSA8IDE2ID8gXCIwXCIgOiBcIlwiKSArIHZhbHVlLnRvU3RyaW5nKDE2KTtcbn1cblxuZnVuY3Rpb24gaHNsYShoLCBzLCBsLCBhKSB7XG4gIGlmIChhIDw9IDApIGggPSBzID0gbCA9IE5hTjtcbiAgZWxzZSBpZiAobCA8PSAwIHx8IGwgPj0gMSkgaCA9IHMgPSBOYU47XG4gIGVsc2UgaWYgKHMgPD0gMCkgaCA9IE5hTjtcbiAgcmV0dXJuIG5ldyBIc2woaCwgcywgbCwgYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2xDb252ZXJ0KG8pIHtcbiAgaWYgKG8gaW5zdGFuY2VvZiBIc2wpIHJldHVybiBuZXcgSHNsKG8uaCwgby5zLCBvLmwsIG8ub3BhY2l0eSk7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBDb2xvcikpIG8gPSBjb2xvcihvKTtcbiAgaWYgKCFvKSByZXR1cm4gbmV3IEhzbDtcbiAgaWYgKG8gaW5zdGFuY2VvZiBIc2wpIHJldHVybiBvO1xuICBvID0gby5yZ2IoKTtcbiAgdmFyIHIgPSBvLnIgLyAyNTUsXG4gICAgICBnID0gby5nIC8gMjU1LFxuICAgICAgYiA9IG8uYiAvIDI1NSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBoID0gTmFOLFxuICAgICAgcyA9IG1heCAtIG1pbixcbiAgICAgIGwgPSAobWF4ICsgbWluKSAvIDI7XG4gIGlmIChzKSB7XG4gICAgaWYgKHIgPT09IG1heCkgaCA9IChnIC0gYikgLyBzICsgKGcgPCBiKSAqIDY7XG4gICAgZWxzZSBpZiAoZyA9PT0gbWF4KSBoID0gKGIgLSByKSAvIHMgKyAyO1xuICAgIGVsc2UgaCA9IChyIC0gZykgLyBzICsgNDtcbiAgICBzIC89IGwgPCAwLjUgPyBtYXggKyBtaW4gOiAyIC0gbWF4IC0gbWluO1xuICAgIGggKj0gNjA7XG4gIH0gZWxzZSB7XG4gICAgcyA9IGwgPiAwICYmIGwgPCAxID8gMCA6IGg7XG4gIH1cbiAgcmV0dXJuIG5ldyBIc2woaCwgcywgbCwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhzbChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gaHNsQ29udmVydChoKSA6IG5ldyBIc2woaCwgcywgbCwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5mdW5jdGlvbiBIc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICB0aGlzLmggPSAraDtcbiAgdGhpcy5zID0gK3M7XG4gIHRoaXMubCA9ICtsO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKEhzbCwgaHNsLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IEhzbCh0aGlzLmgsIHRoaXMucywgdGhpcy5sICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gZGFya2VyIDogTWF0aC5wb3coZGFya2VyLCBrKTtcbiAgICByZXR1cm4gbmV3IEhzbCh0aGlzLmgsIHRoaXMucywgdGhpcy5sICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgcmdiKCkge1xuICAgIHZhciBoID0gdGhpcy5oICUgMzYwICsgKHRoaXMuaCA8IDApICogMzYwLFxuICAgICAgICBzID0gaXNOYU4oaCkgfHwgaXNOYU4odGhpcy5zKSA/IDAgOiB0aGlzLnMsXG4gICAgICAgIGwgPSB0aGlzLmwsXG4gICAgICAgIG0yID0gbCArIChsIDwgMC41ID8gbCA6IDEgLSBsKSAqIHMsXG4gICAgICAgIG0xID0gMiAqIGwgLSBtMjtcbiAgICByZXR1cm4gbmV3IFJnYihcbiAgICAgIGhzbDJyZ2IoaCA+PSAyNDAgPyBoIC0gMjQwIDogaCArIDEyMCwgbTEsIG0yKSxcbiAgICAgIGhzbDJyZ2IoaCwgbTEsIG0yKSxcbiAgICAgIGhzbDJyZ2IoaCA8IDEyMCA/IGggKyAyNDAgOiBoIC0gMTIwLCBtMSwgbTIpLFxuICAgICAgdGhpcy5vcGFjaXR5XG4gICAgKTtcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBIc2woY2xhbXBoKHRoaXMuaCksIGNsYW1wdCh0aGlzLnMpLCBjbGFtcHQodGhpcy5sKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKDAgPD0gdGhpcy5zICYmIHRoaXMucyA8PSAxIHx8IGlzTmFOKHRoaXMucykpXG4gICAgICAgICYmICgwIDw9IHRoaXMubCAmJiB0aGlzLmwgPD0gMSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgZm9ybWF0SHNsKCkge1xuICAgIGNvbnN0IGEgPSBjbGFtcGEodGhpcy5vcGFjaXR5KTtcbiAgICByZXR1cm4gYCR7YSA9PT0gMSA/IFwiaHNsKFwiIDogXCJoc2xhKFwifSR7Y2xhbXBoKHRoaXMuaCl9LCAke2NsYW1wdCh0aGlzLnMpICogMTAwfSUsICR7Y2xhbXB0KHRoaXMubCkgKiAxMDB9JSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG4gIH1cbn0pKTtcblxuZnVuY3Rpb24gY2xhbXBoKHZhbHVlKSB7XG4gIHZhbHVlID0gKHZhbHVlIHx8IDApICUgMzYwO1xuICByZXR1cm4gdmFsdWUgPCAwID8gdmFsdWUgKyAzNjAgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY2xhbXB0KHZhbHVlKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB2YWx1ZSB8fCAwKSk7XG59XG5cbi8qIEZyb20gRnZEIDEzLjM3LCBDU1MgQ29sb3IgTW9kdWxlIExldmVsIDMgKi9cbmZ1bmN0aW9uIGhzbDJyZ2IoaCwgbTEsIG0yKSB7XG4gIHJldHVybiAoaCA8IDYwID8gbTEgKyAobTIgLSBtMSkgKiBoIC8gNjBcbiAgICAgIDogaCA8IDE4MCA/IG0yXG4gICAgICA6IGggPCAyNDAgPyBtMSArIChtMiAtIG0xKSAqICgyNDAgLSBoKSAvIDYwXG4gICAgICA6IG0xKSAqIDI1NTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gYmFzaXModDEsIHYwLCB2MSwgdjIsIHYzKSB7XG4gIHZhciB0MiA9IHQxICogdDEsIHQzID0gdDIgKiB0MTtcbiAgcmV0dXJuICgoMSAtIDMgKiB0MSArIDMgKiB0MiAtIHQzKSAqIHYwXG4gICAgICArICg0IC0gNiAqIHQyICsgMyAqIHQzKSAqIHYxXG4gICAgICArICgxICsgMyAqIHQxICsgMyAqIHQyIC0gMyAqIHQzKSAqIHYyXG4gICAgICArIHQzICogdjMpIC8gNjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWVzKSB7XG4gIHZhciBuID0gdmFsdWVzLmxlbmd0aCAtIDE7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0IDw9IDAgPyAodCA9IDApIDogdCA+PSAxID8gKHQgPSAxLCBuIC0gMSkgOiBNYXRoLmZsb29yKHQgKiBuKSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaV0sXG4gICAgICAgIHYyID0gdmFsdWVzW2kgKyAxXSxcbiAgICAgICAgdjAgPSBpID4gMCA/IHZhbHVlc1tpIC0gMV0gOiAyICogdjEgLSB2MixcbiAgICAgICAgdjMgPSBpIDwgbiAtIDEgPyB2YWx1ZXNbaSArIDJdIDogMiAqIHYyIC0gdjE7XG4gICAgcmV0dXJuIGJhc2lzKCh0IC0gaSAvIG4pICogbiwgdjAsIHYxLCB2MiwgdjMpO1xuICB9O1xufVxuIiwgImltcG9ydCB7YmFzaXN9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlcykge1xuICB2YXIgbiA9IHZhbHVlcy5sZW5ndGg7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSBNYXRoLmZsb29yKCgodCAlPSAxKSA8IDAgPyArK3QgOiB0KSAqIG4pLFxuICAgICAgICB2MCA9IHZhbHVlc1soaSArIG4gLSAxKSAlIG5dLFxuICAgICAgICB2MSA9IHZhbHVlc1tpICUgbl0sXG4gICAgICAgIHYyID0gdmFsdWVzWyhpICsgMSkgJSBuXSxcbiAgICAgICAgdjMgPSB2YWx1ZXNbKGkgKyAyKSAlIG5dO1xuICAgIHJldHVybiBiYXNpcygodCAtIGkgLyBuKSAqIG4sIHYwLCB2MSwgdjIsIHYzKTtcbiAgfTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLCAiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGxpbmVhcihhLCBkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKyB0ICogZDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZXhwb25lbnRpYWwoYSwgYiwgeSkge1xuICByZXR1cm4gYSA9IE1hdGgucG93KGEsIHkpLCBiID0gTWF0aC5wb3coYiwgeSkgLSBhLCB5ID0gMSAvIHksIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coYSArIHQgKiBiLCB5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1ZShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQgPiAxODAgfHwgZCA8IC0xODAgPyBkIC0gMzYwICogTWF0aC5yb3VuZChkIC8gMzYwKSA6IGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1tYSh5KSB7XG4gIHJldHVybiAoeSA9ICt5KSA9PT0gMSA/IG5vZ2FtbWEgOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGIgLSBhID8gZXhwb25lbnRpYWwoYSwgYiwgeSkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9nYW1tYShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG4iLCAiaW1wb3J0IHtyZ2IgYXMgY29sb3JSZ2J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IGJhc2lzIGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5pbXBvcnQgYmFzaXNDbG9zZWQgZnJvbSBcIi4vYmFzaXNDbG9zZWQuanNcIjtcbmltcG9ydCBub2dhbW1hLCB7Z2FtbWF9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiByZ2JHYW1tYSh5KSB7XG4gIHZhciBjb2xvciA9IGdhbW1hKHkpO1xuXG4gIGZ1bmN0aW9uIHJnYihzdGFydCwgZW5kKSB7XG4gICAgdmFyIHIgPSBjb2xvcigoc3RhcnQgPSBjb2xvclJnYihzdGFydCkpLnIsIChlbmQgPSBjb2xvclJnYihlbmQpKS5yKSxcbiAgICAgICAgZyA9IGNvbG9yKHN0YXJ0LmcsIGVuZC5nKSxcbiAgICAgICAgYiA9IGNvbG9yKHN0YXJ0LmIsIGVuZC5iKSxcbiAgICAgICAgb3BhY2l0eSA9IG5vZ2FtbWEoc3RhcnQub3BhY2l0eSwgZW5kLm9wYWNpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICBzdGFydC5yID0gcih0KTtcbiAgICAgIHN0YXJ0LmcgPSBnKHQpO1xuICAgICAgc3RhcnQuYiA9IGIodCk7XG4gICAgICBzdGFydC5vcGFjaXR5ID0gb3BhY2l0eSh0KTtcbiAgICAgIHJldHVybiBzdGFydCArIFwiXCI7XG4gICAgfTtcbiAgfVxuXG4gIHJnYi5nYW1tYSA9IHJnYkdhbW1hO1xuXG4gIHJldHVybiByZ2I7XG59KSgxKTtcblxuZnVuY3Rpb24gcmdiU3BsaW5lKHNwbGluZSkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgdmFyIG4gPSBjb2xvcnMubGVuZ3RoLFxuICAgICAgICByID0gbmV3IEFycmF5KG4pLFxuICAgICAgICBnID0gbmV3IEFycmF5KG4pLFxuICAgICAgICBiID0gbmV3IEFycmF5KG4pLFxuICAgICAgICBpLCBjb2xvcjtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBjb2xvciA9IGNvbG9yUmdiKGNvbG9yc1tpXSk7XG4gICAgICByW2ldID0gY29sb3IuciB8fCAwO1xuICAgICAgZ1tpXSA9IGNvbG9yLmcgfHwgMDtcbiAgICAgIGJbaV0gPSBjb2xvci5iIHx8IDA7XG4gICAgfVxuICAgIHIgPSBzcGxpbmUocik7XG4gICAgZyA9IHNwbGluZShnKTtcbiAgICBiID0gc3BsaW5lKGIpO1xuICAgIGNvbG9yLm9wYWNpdHkgPSAxO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICBjb2xvci5yID0gcih0KTtcbiAgICAgIGNvbG9yLmcgPSBnKHQpO1xuICAgICAgY29sb3IuYiA9IGIodCk7XG4gICAgICByZXR1cm4gY29sb3IgKyBcIlwiO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB2YXIgcmdiQmFzaXMgPSByZ2JTcGxpbmUoYmFzaXMpO1xuZXhwb3J0IHZhciByZ2JCYXNpc0Nsb3NlZCA9IHJnYlNwbGluZShiYXNpc0Nsb3NlZCk7XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICBpZiAoIWIpIGIgPSBbXTtcbiAgdmFyIG4gPSBhID8gTWF0aC5taW4oYi5sZW5ndGgsIGEubGVuZ3RoKSA6IDAsXG4gICAgICBjID0gYi5zbGljZSgpLFxuICAgICAgaTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBjW2ldID0gYVtpXSAqICgxIC0gdCkgKyBiW2ldICogdDtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyQXJyYXkoeCkge1xuICByZXR1cm4gQXJyYXlCdWZmZXIuaXNWaWV3KHgpICYmICEoeCBpbnN0YW5jZW9mIERhdGFWaWV3KTtcbn1cbiIsICJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIChpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXkgOiBnZW5lcmljQXJyYXkpKGEsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJpY0FycmF5KGEsIGIpIHtcbiAgdmFyIG5iID0gYiA/IGIubGVuZ3RoIDogMCxcbiAgICAgIG5hID0gYSA/IE1hdGgubWluKG5iLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgeCA9IG5ldyBBcnJheShuYSksXG4gICAgICBjID0gbmV3IEFycmF5KG5iKSxcbiAgICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIHhbaV0gPSB2YWx1ZShhW2ldLCBiW2ldKTtcbiAgZm9yICg7IGkgPCBuYjsgKytpKSBjW2ldID0gYltpXTtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuYTsgKytpKSBjW2ldID0geFtpXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBkID0gbmV3IERhdGU7XG4gIHJldHVybiBhID0gK2EsIGIgPSArYiwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBkLnNldFRpbWUoYSAqICgxIC0gdCkgKyBiICogdCksIGQ7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSAqICgxIC0gdCkgKyBiICogdDtcbiAgfTtcbn1cbiIsICJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgaSA9IHt9LFxuICAgICAgYyA9IHt9LFxuICAgICAgaztcblxuICBpZiAoYSA9PT0gbnVsbCB8fCB0eXBlb2YgYSAhPT0gXCJvYmplY3RcIikgYSA9IHt9O1xuICBpZiAoYiA9PT0gbnVsbCB8fCB0eXBlb2YgYiAhPT0gXCJvYmplY3RcIikgYiA9IHt9O1xuXG4gIGZvciAoayBpbiBiKSB7XG4gICAgaWYgKGsgaW4gYSkge1xuICAgICAgaVtrXSA9IHZhbHVlKGFba10sIGJba10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjW2tdID0gYltrXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoayBpbiBpKSBjW2tdID0gaVtrXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsICJpbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG52YXIgcmVBID0gL1stK10/KD86XFxkK1xcLj9cXGQqfFxcLj9cXGQrKSg/OltlRV1bLStdP1xcZCspPy9nLFxuICAgIHJlQiA9IG5ldyBSZWdFeHAocmVBLnNvdXJjZSwgXCJnXCIpO1xuXG5mdW5jdGlvbiB6ZXJvKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbmUoYikge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBiKHQpICsgXCJcIjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYmkgPSByZUEubGFzdEluZGV4ID0gcmVCLmxhc3RJbmRleCA9IDAsIC8vIHNjYW4gaW5kZXggZm9yIG5leHQgbnVtYmVyIGluIGJcbiAgICAgIGFtLCAvLyBjdXJyZW50IG1hdGNoIGluIGFcbiAgICAgIGJtLCAvLyBjdXJyZW50IG1hdGNoIGluIGJcbiAgICAgIGJzLCAvLyBzdHJpbmcgcHJlY2VkaW5nIGN1cnJlbnQgbnVtYmVyIGluIGIsIGlmIGFueVxuICAgICAgaSA9IC0xLCAvLyBpbmRleCBpbiBzXG4gICAgICBzID0gW10sIC8vIHN0cmluZyBjb25zdGFudHMgYW5kIHBsYWNlaG9sZGVyc1xuICAgICAgcSA9IFtdOyAvLyBudW1iZXIgaW50ZXJwb2xhdG9yc1xuXG4gIC8vIENvZXJjZSBpbnB1dHMgdG8gc3RyaW5ncy5cbiAgYSA9IGEgKyBcIlwiLCBiID0gYiArIFwiXCI7XG5cbiAgLy8gSW50ZXJwb2xhdGUgcGFpcnMgb2YgbnVtYmVycyBpbiBhICYgYi5cbiAgd2hpbGUgKChhbSA9IHJlQS5leGVjKGEpKVxuICAgICAgJiYgKGJtID0gcmVCLmV4ZWMoYikpKSB7XG4gICAgaWYgKChicyA9IGJtLmluZGV4KSA+IGJpKSB7IC8vIGEgc3RyaW5nIHByZWNlZGVzIHRoZSBuZXh0IG51bWJlciBpbiBiXG4gICAgICBicyA9IGIuc2xpY2UoYmksIGJzKTtcbiAgICAgIGlmIChzW2ldKSBzW2ldICs9IGJzOyAvLyBjb2FsZXNjZSB3aXRoIHByZXZpb3VzIHN0cmluZ1xuICAgICAgZWxzZSBzWysraV0gPSBicztcbiAgICB9XG4gICAgaWYgKChhbSA9IGFtWzBdKSA9PT0gKGJtID0gYm1bMF0pKSB7IC8vIG51bWJlcnMgaW4gYSAmIGIgbWF0Y2hcbiAgICAgIGlmIChzW2ldKSBzW2ldICs9IGJtOyAvLyBjb2FsZXNjZSB3aXRoIHByZXZpb3VzIHN0cmluZ1xuICAgICAgZWxzZSBzWysraV0gPSBibTtcbiAgICB9IGVsc2UgeyAvLyBpbnRlcnBvbGF0ZSBub24tbWF0Y2hpbmcgbnVtYmVyc1xuICAgICAgc1srK2ldID0gbnVsbDtcbiAgICAgIHEucHVzaCh7aTogaSwgeDogbnVtYmVyKGFtLCBibSl9KTtcbiAgICB9XG4gICAgYmkgPSByZUIubGFzdEluZGV4O1xuICB9XG5cbiAgLy8gQWRkIHJlbWFpbnMgb2YgYi5cbiAgaWYgKGJpIDwgYi5sZW5ndGgpIHtcbiAgICBicyA9IGIuc2xpY2UoYmkpO1xuICAgIGlmIChzW2ldKSBzW2ldICs9IGJzOyAvLyBjb2FsZXNjZSB3aXRoIHByZXZpb3VzIHN0cmluZ1xuICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gIH1cblxuICAvLyBTcGVjaWFsIG9wdGltaXphdGlvbiBmb3Igb25seSBhIHNpbmdsZSBtYXRjaC5cbiAgLy8gT3RoZXJ3aXNlLCBpbnRlcnBvbGF0ZSBlYWNoIG9mIHRoZSBudW1iZXJzIGFuZCByZWpvaW4gdGhlIHN0cmluZy5cbiAgcmV0dXJuIHMubGVuZ3RoIDwgMiA/IChxWzBdXG4gICAgICA/IG9uZShxWzBdLngpXG4gICAgICA6IHplcm8oYikpXG4gICAgICA6IChiID0gcS5sZW5ndGgsIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbzsgaSA8IGI7ICsraSkgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgICAgIHJldHVybiBzLmpvaW4oXCJcIik7XG4gICAgICAgIH0pO1xufVxuIiwgImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHJnYiBmcm9tIFwiLi9yZ2IuanNcIjtcbmltcG9ydCB7Z2VuZXJpY0FycmF5fSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGRhdGUgZnJvbSBcIi4vZGF0ZS5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcbmltcG9ydCBvYmplY3QgZnJvbSBcIi4vb2JqZWN0LmpzXCI7XG5pbXBvcnQgc3RyaW5nIGZyb20gXCIuL3N0cmluZy5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgbnVtYmVyQXJyYXksIHtpc051bWJlckFycmF5fSBmcm9tIFwiLi9udW1iZXJBcnJheS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciB0ID0gdHlwZW9mIGIsIGM7XG4gIHJldHVybiBiID09IG51bGwgfHwgdCA9PT0gXCJib29sZWFuXCIgPyBjb25zdGFudChiKVxuICAgICAgOiAodCA9PT0gXCJudW1iZXJcIiA/IG51bWJlclxuICAgICAgOiB0ID09PSBcInN0cmluZ1wiID8gKChjID0gY29sb3IoYikpID8gKGIgPSBjLCByZ2IpIDogc3RyaW5nKVxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyByZ2JcbiAgICAgIDogYiBpbnN0YW5jZW9mIERhdGUgPyBkYXRlXG4gICAgICA6IGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheVxuICAgICAgOiBBcnJheS5pc0FycmF5KGIpID8gZ2VuZXJpY0FycmF5XG4gICAgICA6IHR5cGVvZiBiLnZhbHVlT2YgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYi50b1N0cmluZyAhPT0gXCJmdW5jdGlvblwiIHx8IGlzTmFOKGIpID8gb2JqZWN0XG4gICAgICA6IG51bWJlcikoYSwgYik7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChhICogKDEgLSB0KSArIGIgKiB0KTtcbiAgfTtcbn1cbiIsICJ2YXIgZGVncmVlcyA9IDE4MCAvIE1hdGguUEk7XG5cbmV4cG9ydCB2YXIgaWRlbnRpdHkgPSB7XG4gIHRyYW5zbGF0ZVg6IDAsXG4gIHRyYW5zbGF0ZVk6IDAsXG4gIHJvdGF0ZTogMCxcbiAgc2tld1g6IDAsXG4gIHNjYWxlWDogMSxcbiAgc2NhbGVZOiAxXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIHZhciBzY2FsZVgsIHNjYWxlWSwgc2tld1g7XG4gIGlmIChzY2FsZVggPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYikpIGEgLz0gc2NhbGVYLCBiIC89IHNjYWxlWDtcbiAgaWYgKHNrZXdYID0gYSAqIGMgKyBiICogZCkgYyAtPSBhICogc2tld1gsIGQgLT0gYiAqIHNrZXdYO1xuICBpZiAoc2NhbGVZID0gTWF0aC5zcXJ0KGMgKiBjICsgZCAqIGQpKSBjIC89IHNjYWxlWSwgZCAvPSBzY2FsZVksIHNrZXdYIC89IHNjYWxlWTtcbiAgaWYgKGEgKiBkIDwgYiAqIGMpIGEgPSAtYSwgYiA9IC1iLCBza2V3WCA9IC1za2V3WCwgc2NhbGVYID0gLXNjYWxlWDtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2xhdGVYOiBlLFxuICAgIHRyYW5zbGF0ZVk6IGYsXG4gICAgcm90YXRlOiBNYXRoLmF0YW4yKGIsIGEpICogZGVncmVlcyxcbiAgICBza2V3WDogTWF0aC5hdGFuKHNrZXdYKSAqIGRlZ3JlZXMsXG4gICAgc2NhbGVYOiBzY2FsZVgsXG4gICAgc2NhbGVZOiBzY2FsZVlcbiAgfTtcbn1cbiIsICJpbXBvcnQgZGVjb21wb3NlLCB7aWRlbnRpdHl9IGZyb20gXCIuL2RlY29tcG9zZS5qc1wiO1xuXG52YXIgc3ZnTm9kZTtcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNzcyh2YWx1ZSkge1xuICBjb25zdCBtID0gbmV3ICh0eXBlb2YgRE9NTWF0cml4ID09PSBcImZ1bmN0aW9uXCIgPyBET01NYXRyaXggOiBXZWJLaXRDU1NNYXRyaXgpKHZhbHVlICsgXCJcIik7XG4gIHJldHVybiBtLmlzSWRlbnRpdHkgPyBpZGVudGl0eSA6IGRlY29tcG9zZShtLmEsIG0uYiwgbS5jLCBtLmQsIG0uZSwgbS5mKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3ZnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gaWRlbnRpdHk7XG4gIGlmICghc3ZnTm9kZSkgc3ZnTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZ1wiKTtcbiAgc3ZnTm9kZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdmFsdWUpO1xuICBpZiAoISh2YWx1ZSA9IHN2Z05vZGUudHJhbnNmb3JtLmJhc2VWYWwuY29uc29saWRhdGUoKSkpIHJldHVybiBpZGVudGl0eTtcbiAgdmFsdWUgPSB2YWx1ZS5tYXRyaXg7XG4gIHJldHVybiBkZWNvbXBvc2UodmFsdWUuYSwgdmFsdWUuYiwgdmFsdWUuYywgdmFsdWUuZCwgdmFsdWUuZSwgdmFsdWUuZik7XG59XG4iLCAiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsICJ2YXIgZnJhbWUgPSAwLCAvLyBpcyBhbiBhbmltYXRpb24gZnJhbWUgcGVuZGluZz9cbiAgICB0aW1lb3V0ID0gMCwgLy8gaXMgYSB0aW1lb3V0IHBlbmRpbmc/XG4gICAgaW50ZXJ2YWwgPSAwLCAvLyBhcmUgYW55IHRpbWVycyBhY3RpdmU/XG4gICAgcG9rZURlbGF5ID0gMTAwMCwgLy8gaG93IGZyZXF1ZW50bHkgd2UgY2hlY2sgZm9yIGNsb2NrIHNrZXdcbiAgICB0YXNrSGVhZCxcbiAgICB0YXNrVGFpbCxcbiAgICBjbG9ja0xhc3QgPSAwLFxuICAgIGNsb2NrTm93ID0gMCxcbiAgICBjbG9ja1NrZXcgPSAwLFxuICAgIGNsb2NrID0gdHlwZW9mIHBlcmZvcm1hbmNlID09PSBcIm9iamVjdFwiICYmIHBlcmZvcm1hbmNlLm5vdyA/IHBlcmZvcm1hbmNlIDogRGF0ZSxcbiAgICBzZXRGcmFtZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpIDogZnVuY3Rpb24oZikgeyBzZXRUaW1lb3V0KGYsIDE3KTsgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdygpIHtcbiAgcmV0dXJuIGNsb2NrTm93IHx8IChzZXRGcmFtZShjbGVhck5vdyksIGNsb2NrTm93ID0gY2xvY2subm93KCkgKyBjbG9ja1NrZXcpO1xufVxuXG5mdW5jdGlvbiBjbGVhck5vdygpIHtcbiAgY2xvY2tOb3cgPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVGltZXIoKSB7XG4gIHRoaXMuX2NhbGwgPVxuICB0aGlzLl90aW1lID1cbiAgdGhpcy5fbmV4dCA9IG51bGw7XG59XG5cblRpbWVyLnByb3RvdHlwZSA9IHRpbWVyLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRpbWVyLFxuICByZXN0YXJ0OiBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYWxsYmFjayBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICB0aW1lID0gKHRpbWUgPT0gbnVsbCA/IG5vdygpIDogK3RpbWUpICsgKGRlbGF5ID09IG51bGwgPyAwIDogK2RlbGF5KTtcbiAgICBpZiAoIXRoaXMuX25leHQgJiYgdGFza1RhaWwgIT09IHRoaXMpIHtcbiAgICAgIGlmICh0YXNrVGFpbCkgdGFza1RhaWwuX25leHQgPSB0aGlzO1xuICAgICAgZWxzZSB0YXNrSGVhZCA9IHRoaXM7XG4gICAgICB0YXNrVGFpbCA9IHRoaXM7XG4gICAgfVxuICAgIHRoaXMuX2NhbGwgPSBjYWxsYmFjaztcbiAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICBzbGVlcCgpO1xuICB9LFxuICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fY2FsbCkge1xuICAgICAgdGhpcy5fY2FsbCA9IG51bGw7XG4gICAgICB0aGlzLl90aW1lID0gSW5maW5pdHk7XG4gICAgICBzbGVlcCgpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVyKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgdC5yZXN0YXJ0KGNhbGxiYWNrLCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGltZXJGbHVzaCgpIHtcbiAgbm93KCk7IC8vIEdldCB0aGUgY3VycmVudCB0aW1lLCBpZiBub3QgYWxyZWFkeSBzZXQuXG4gICsrZnJhbWU7IC8vIFByZXRlbmQgd2VcdTIwMTl2ZSBzZXQgYW4gYWxhcm0sIGlmIHdlIGhhdmVuXHUyMDE5dCBhbHJlYWR5LlxuICB2YXIgdCA9IHRhc2tIZWFkLCBlO1xuICB3aGlsZSAodCkge1xuICAgIGlmICgoZSA9IGNsb2NrTm93IC0gdC5fdGltZSkgPj0gMCkgdC5fY2FsbC5jYWxsKHVuZGVmaW5lZCwgZSk7XG4gICAgdCA9IHQuX25leHQ7XG4gIH1cbiAgLS1mcmFtZTtcbn1cblxuZnVuY3Rpb24gd2FrZSgpIHtcbiAgY2xvY2tOb3cgPSAoY2xvY2tMYXN0ID0gY2xvY2subm93KCkpICsgY2xvY2tTa2V3O1xuICBmcmFtZSA9IHRpbWVvdXQgPSAwO1xuICB0cnkge1xuICAgIHRpbWVyRmx1c2goKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBmcmFtZSA9IDA7XG4gICAgbmFwKCk7XG4gICAgY2xvY2tOb3cgPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBva2UoKSB7XG4gIHZhciBub3cgPSBjbG9jay5ub3coKSwgZGVsYXkgPSBub3cgLSBjbG9ja0xhc3Q7XG4gIGlmIChkZWxheSA+IHBva2VEZWxheSkgY2xvY2tTa2V3IC09IGRlbGF5LCBjbG9ja0xhc3QgPSBub3c7XG59XG5cbmZ1bmN0aW9uIG5hcCgpIHtcbiAgdmFyIHQwLCB0MSA9IHRhc2tIZWFkLCB0MiwgdGltZSA9IEluZmluaXR5O1xuICB3aGlsZSAodDEpIHtcbiAgICBpZiAodDEuX2NhbGwpIHtcbiAgICAgIGlmICh0aW1lID4gdDEuX3RpbWUpIHRpbWUgPSB0MS5fdGltZTtcbiAgICAgIHQwID0gdDEsIHQxID0gdDEuX25leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHQyID0gdDEuX25leHQsIHQxLl9uZXh0ID0gbnVsbDtcbiAgICAgIHQxID0gdDAgPyB0MC5fbmV4dCA9IHQyIDogdGFza0hlYWQgPSB0MjtcbiAgICB9XG4gIH1cbiAgdGFza1RhaWwgPSB0MDtcbiAgc2xlZXAodGltZSk7XG59XG5cbmZ1bmN0aW9uIHNsZWVwKHRpbWUpIHtcbiAgaWYgKGZyYW1lKSByZXR1cm47IC8vIFNvb25lc3QgYWxhcm0gYWxyZWFkeSBzZXQsIG9yIHdpbGwgYmUuXG4gIGlmICh0aW1lb3V0KSB0aW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICB2YXIgZGVsYXkgPSB0aW1lIC0gY2xvY2tOb3c7IC8vIFN0cmljdGx5IGxlc3MgdGhhbiBpZiB3ZSByZWNvbXB1dGVkIGNsb2NrTm93LlxuICBpZiAoZGVsYXkgPiAyNCkge1xuICAgIGlmICh0aW1lIDwgSW5maW5pdHkpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KHdha2UsIHRpbWUgLSBjbG9jay5ub3coKSAtIGNsb2NrU2tldyk7XG4gICAgaWYgKGludGVydmFsKSBpbnRlcnZhbCA9IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICB9IGVsc2Uge1xuICAgIGlmICghaW50ZXJ2YWwpIGNsb2NrTGFzdCA9IGNsb2NrLm5vdygpLCBpbnRlcnZhbCA9IHNldEludGVydmFsKHBva2UsIHBva2VEZWxheSk7XG4gICAgZnJhbWUgPSAxLCBzZXRGcmFtZSh3YWtlKTtcbiAgfVxufVxuIiwgImltcG9ydCB7VGltZXJ9IGZyb20gXCIuL3RpbWVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgZGVsYXkgPSBkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheTtcbiAgdC5yZXN0YXJ0KGVsYXBzZWQgPT4ge1xuICAgIHQuc3RvcCgpO1xuICAgIGNhbGxiYWNrKGVsYXBzZWQgKyBkZWxheSk7XG4gIH0sIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG4iLCAiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge3RpbWVyLCB0aW1lb3V0fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGVtcHR5T24gPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiZW5kXCIsIFwiY2FuY2VsXCIsIFwiaW50ZXJydXB0XCIpO1xudmFyIGVtcHR5VHdlZW4gPSBbXTtcblxuZXhwb3J0IHZhciBDUkVBVEVEID0gMDtcbmV4cG9ydCB2YXIgU0NIRURVTEVEID0gMTtcbmV4cG9ydCB2YXIgU1RBUlRJTkcgPSAyO1xuZXhwb3J0IHZhciBTVEFSVEVEID0gMztcbmV4cG9ydCB2YXIgUlVOTklORyA9IDQ7XG5leHBvcnQgdmFyIEVORElORyA9IDU7XG5leHBvcnQgdmFyIEVOREVEID0gNjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSwgaWQsIGluZGV4LCBncm91cCwgdGltaW5nKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZXMpIG5vZGUuX190cmFuc2l0aW9uID0ge307XG4gIGVsc2UgaWYgKGlkIGluIHNjaGVkdWxlcykgcmV0dXJuO1xuICBjcmVhdGUobm9kZSwgaWQsIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGluZGV4OiBpbmRleCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIGdyb3VwOiBncm91cCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIG9uOiBlbXB0eU9uLFxuICAgIHR3ZWVuOiBlbXB0eVR3ZWVuLFxuICAgIHRpbWU6IHRpbWluZy50aW1lLFxuICAgIGRlbGF5OiB0aW1pbmcuZGVsYXksXG4gICAgZHVyYXRpb246IHRpbWluZy5kdXJhdGlvbixcbiAgICBlYXNlOiB0aW1pbmcuZWFzZSxcbiAgICB0aW1lcjogbnVsbCxcbiAgICBzdGF0ZTogQ1JFQVRFRFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gQ1JFQVRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgc2NoZWR1bGVkXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gU1RBUlRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgcnVubmluZ1wiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlIHx8ICEoc2NoZWR1bGUgPSBzY2hlZHVsZVtpZF0pKSB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2l0aW9uIG5vdCBmb3VuZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUobm9kZSwgaWQsIHNlbGYpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgdHdlZW47XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZiB0aW1lciB3aGVuIHRoZSB0cmFuc2l0aW9uIGlzIGNyZWF0ZWQuXG4gIC8vIE5vdGUgdGhlIGFjdHVhbCBkZWxheSBpcyBub3Qga25vd24gdW50aWwgdGhlIGZpcnN0IGNhbGxiYWNrIVxuICBzY2hlZHVsZXNbaWRdID0gc2VsZjtcbiAgc2VsZi50aW1lciA9IHRpbWVyKHNjaGVkdWxlLCAwLCBzZWxmLnRpbWUpO1xuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlKGVsYXBzZWQpIHtcbiAgICBzZWxmLnN0YXRlID0gU0NIRURVTEVEO1xuICAgIHNlbGYudGltZXIucmVzdGFydChzdGFydCwgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcblxuICAgIC8vIElmIHRoZSBlbGFwc2VkIGRlbGF5IGlzIGxlc3MgdGhhbiBvdXIgZmlyc3Qgc2xlZXAsIHN0YXJ0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzZWxmLmRlbGF5IDw9IGVsYXBzZWQpIHN0YXJ0KGVsYXBzZWQgLSBzZWxmLmRlbGF5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0KGVsYXBzZWQpIHtcbiAgICB2YXIgaSwgaiwgbiwgbztcblxuICAgIC8vIElmIHRoZSBzdGF0ZSBpcyBub3QgU0NIRURVTEVELCB0aGVuIHdlIHByZXZpb3VzbHkgZXJyb3JlZCBvbiBzdGFydC5cbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU0NIRURVTEVEKSByZXR1cm4gc3RvcCgpO1xuXG4gICAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgICAgbyA9IHNjaGVkdWxlc1tpXTtcbiAgICAgIGlmIChvLm5hbWUgIT09IHNlbGYubmFtZSkgY29udGludWU7XG5cbiAgICAgIC8vIFdoaWxlIHRoaXMgZWxlbWVudCBhbHJlYWR5IGhhcyBhIHN0YXJ0aW5nIHRyYW5zaXRpb24gZHVyaW5nIHRoaXMgZnJhbWUsXG4gICAgICAvLyBkZWZlciBzdGFydGluZyBhbiBpbnRlcnJ1cHRpbmcgdHJhbnNpdGlvbiB1bnRpbCB0aGF0IHRyYW5zaXRpb24gaGFzIGFcbiAgICAgIC8vIGNoYW5jZSB0byB0aWNrIChhbmQgcG9zc2libHkgZW5kKTsgc2VlIGQzL2QzLXRyYW5zaXRpb24jNTQhXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gU1RBUlRFRCkgcmV0dXJuIHRpbWVvdXQoc3RhcnQpO1xuXG4gICAgICAvLyBJbnRlcnJ1cHQgdGhlIGFjdGl2ZSB0cmFuc2l0aW9uLCBpZiBhbnkuXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gUlVOTklORykge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJpbnRlcnJ1cHRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG5cbiAgICAgIC8vIENhbmNlbCBhbnkgcHJlLWVtcHRlZCB0cmFuc2l0aW9ucy5cbiAgICAgIGVsc2UgaWYgKCtpIDwgaWQpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmVyIHRoZSBmaXJzdCB0aWNrIHRvIGVuZCBvZiB0aGUgY3VycmVudCBmcmFtZTsgc2VlIGQzL2QzIzE1NzYuXG4gICAgLy8gTm90ZSB0aGUgdHJhbnNpdGlvbiBtYXkgYmUgY2FuY2VsZWQgYWZ0ZXIgc3RhcnQgYW5kIGJlZm9yZSB0aGUgZmlyc3QgdGljayFcbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBzY2hlZHVsZWQgYmVmb3JlIHRoZSBzdGFydCBldmVudDsgc2VlIGQzL2QzLXRyYW5zaXRpb24jMTYhXG4gICAgLy8gQXNzdW1pbmcgdGhpcyBpcyBzdWNjZXNzZnVsLCBzdWJzZXF1ZW50IGNhbGxiYWNrcyBnbyBzdHJhaWdodCB0byB0aWNrLlxuICAgIHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gU1RBUlRFRCkge1xuICAgICAgICBzZWxmLnN0YXRlID0gUlVOTklORztcbiAgICAgICAgc2VsZi50aW1lci5yZXN0YXJ0KHRpY2ssIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG4gICAgICAgIHRpY2soZWxhcHNlZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgc3RhcnQgZXZlbnQuXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgZG9uZSBiZWZvcmUgdGhlIHR3ZWVuIGFyZSBpbml0aWFsaXplZC5cbiAgICBzZWxmLnN0YXRlID0gU1RBUlRJTkc7XG4gICAgc2VsZi5vbi5jYWxsKFwic3RhcnRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNUQVJUSU5HKSByZXR1cm47IC8vIGludGVycnVwdGVkXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJURUQ7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSB0d2VlbiwgZGVsZXRpbmcgbnVsbCB0d2Vlbi5cbiAgICB0d2VlbiA9IG5ldyBBcnJheShuID0gc2VsZi50d2Vlbi5sZW5ndGgpO1xuICAgIGZvciAoaSA9IDAsIGogPSAtMTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG8gPSBzZWxmLnR3ZWVuW2ldLnZhbHVlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCkpIHtcbiAgICAgICAgdHdlZW5bKytqXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIHR3ZWVuLmxlbmd0aCA9IGogKyAxO1xuICB9XG5cbiAgZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XG4gICAgdmFyIHQgPSBlbGFwc2VkIDwgc2VsZi5kdXJhdGlvbiA/IHNlbGYuZWFzZS5jYWxsKG51bGwsIGVsYXBzZWQgLyBzZWxmLmR1cmF0aW9uKSA6IChzZWxmLnRpbWVyLnJlc3RhcnQoc3RvcCksIHNlbGYuc3RhdGUgPSBFTkRJTkcsIDEpLFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSB0d2Vlbi5sZW5ndGg7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgdHdlZW5baV0uY2FsbChub2RlLCB0KTtcbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgZW5kIGV2ZW50LlxuICAgIGlmIChzZWxmLnN0YXRlID09PSBFTkRJTkcpIHtcbiAgICAgIHNlbGYub24uY2FsbChcImVuZFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICAgIHN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wKCkge1xuICAgIHNlbGYuc3RhdGUgPSBFTkRFRDtcbiAgICBzZWxmLnRpbWVyLnN0b3AoKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2lkXTtcbiAgICBmb3IgKHZhciBpIGluIHNjaGVkdWxlcykgcmV0dXJuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xuICB9XG59XG4iLCAiaW1wb3J0IHtTVEFSVElORywgRU5ESU5HLCBFTkRFRH0gZnJvbSBcIi4vdHJhbnNpdGlvbi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHNjaGVkdWxlLFxuICAgICAgYWN0aXZlLFxuICAgICAgZW1wdHkgPSB0cnVlLFxuICAgICAgaTtcblxuICBpZiAoIXNjaGVkdWxlcykgcmV0dXJuO1xuXG4gIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG5cbiAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgIGlmICgoc2NoZWR1bGUgPSBzY2hlZHVsZXNbaV0pLm5hbWUgIT09IG5hbWUpIHsgZW1wdHkgPSBmYWxzZTsgY29udGludWU7IH1cbiAgICBhY3RpdmUgPSBzY2hlZHVsZS5zdGF0ZSA+IFNUQVJUSU5HICYmIHNjaGVkdWxlLnN0YXRlIDwgRU5ESU5HO1xuICAgIHNjaGVkdWxlLnN0YXRlID0gRU5ERUQ7XG4gICAgc2NoZWR1bGUudGltZXIuc3RvcCgpO1xuICAgIHNjaGVkdWxlLm9uLmNhbGwoYWN0aXZlID8gXCJpbnRlcnJ1cHRcIiA6IFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNjaGVkdWxlLmluZGV4LCBzY2hlZHVsZS5ncm91cCk7XG4gICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgfVxuXG4gIGlmIChlbXB0eSkgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xufVxuIiwgImltcG9ydCBpbnRlcnJ1cHQgZnJvbSBcIi4uL2ludGVycnVwdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgaW50ZXJydXB0KHRoaXMsIG5hbWUpO1xuICB9KTtcbn1cbiIsICJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiB0d2VlblJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gdHdlZW4wID0gdHdlZW47XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xID0gdHdlZW4xLnNsaWNlKCk7XG4gICAgICAgICAgdHdlZW4xLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0d2VlbkZ1bmN0aW9uKGlkLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9ICh0d2VlbjAgPSB0d2Vlbikuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIHQgPSB7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSwgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMVtpXSA9IHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBuKSB0d2VlbjEucHVzaCh0KTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgbmFtZSArPSBcIlwiO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciB0d2VlbiA9IGdldCh0aGlzLm5vZGUoKSwgaWQpLnR3ZWVuO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4ubGVuZ3RoLCB0OyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKHQgPSB0d2VlbltpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsID8gdHdlZW5SZW1vdmUgOiB0d2VlbkZ1bmN0aW9uKShpZCwgbmFtZSwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR3ZWVuVmFsdWUodHJhbnNpdGlvbiwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdHJhbnNpdGlvbi5faWQ7XG5cbiAgdHJhbnNpdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCk7XG4gICAgKHNjaGVkdWxlLnZhbHVlIHx8IChzY2hlZHVsZS52YWx1ZSA9IHt9KSlbbmFtZV0gPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBnZXQobm9kZSwgaWQpLnZhbHVlW25hbWVdO1xuICB9O1xufVxuIiwgImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSZ2IsIGludGVycG9sYXRlU3RyaW5nfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYztcbiAgcmV0dXJuICh0eXBlb2YgYiA9PT0gXCJudW1iZXJcIiA/IGludGVycG9sYXRlTnVtYmVyXG4gICAgICA6IGIgaW5zdGFuY2VvZiBjb2xvciA/IGludGVycG9sYXRlUmdiXG4gICAgICA6IChjID0gY29sb3IoYikpID8gKGIgPSBjLCBpbnRlcnBvbGF0ZVJnYilcbiAgICAgIDogaW50ZXJwb2xhdGVTdHJpbmcpKGEsIGIpO1xufVxuIiwgImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCBpbnRlcnBvbGF0ZSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpLCBpID0gZnVsbG5hbWUgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdGhpcy5hdHRyVHdlZW4obmFtZSwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pKGZ1bGxuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwiYXR0ci5cIiArIG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdmFsdWUgPT0gbnVsbCA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpKGZ1bGxuYW1lKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkoZnVsbG5hbWUsIGksIHZhbHVlKSk7XG59XG4iLCAiaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlKG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW5OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2VlbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGtleSA9IFwiYXR0ci5cIiArIG5hbWU7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIChmdWxsbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge2dldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZGVsYXlGdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlbGF5Q29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZGVsYXlGdW5jdGlvblxuICAgICAgICAgIDogZGVsYXlDb25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZGVsYXk7XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZHVyYXRpb25GdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHVyYXRpb25Db25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGR1cmF0aW9uRnVuY3Rpb25cbiAgICAgICAgICA6IGR1cmF0aW9uQ29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmR1cmF0aW9uO1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKGVhc2VDb25zdGFudChpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5lYXNlO1xufVxuIiwgImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBlYXNlVmFyeWluZyhpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIHYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy5lYWNoKGVhc2VWYXJ5aW5nKHRoaXMuX2lkLCB2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7bWF0Y2hlcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwgImltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNpdGlvbikge1xuICBpZiAodHJhbnNpdGlvbi5faWQgIT09IHRoaXMuX2lkKSB0aHJvdyBuZXcgRXJyb3I7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHRyYW5zaXRpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0YXJ0KG5hbWUpIHtcbiAgcmV0dXJuIChuYW1lICsgXCJcIikudHJpbSgpLnNwbGl0KC9efFxccysvKS5ldmVyeShmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiAhdCB8fCB0ID09PSBcInN0YXJ0XCI7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgb24wLCBvbjEsIHNpdCA9IHN0YXJ0KG5hbWUpID8gaW5pdCA6IHNldDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNpdCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjApIChvbjEgPSAob24wID0gb24pLmNvcHkoKSkub24obmFtZSwgbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMlxuICAgICAgPyBnZXQodGhpcy5ub2RlKCksIGlkKS5vbi5vbihuYW1lKVxuICAgICAgOiB0aGlzLmVhY2gob25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpKTtcbn1cbiIsICJmdW5jdGlvbiByZW1vdmVGdW5jdGlvbihpZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX190cmFuc2l0aW9uKSBpZiAoK2kgIT09IGlkKSByZXR1cm47XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub24oXCJlbmQucmVtb3ZlXCIsIHJlbW92ZUZ1bmN0aW9uKHRoaXMuX2lkKSk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rvcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgICAgc2NoZWR1bGUoc3ViZ3JvdXBbaV0sIG5hbWUsIGlkLCBpLCBzdWJncm91cCwgZ2V0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0b3JBbGx9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkID0gdGhpcy5faWQ7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBmb3IgKHZhciBjaGlsZHJlbiA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSwgY2hpbGQsIGluaGVyaXQgPSBnZXQobm9kZSwgaWQpLCBrID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgayA8IGw7ICsraykge1xuICAgICAgICAgIGlmIChjaGlsZCA9IGNoaWxkcmVuW2tdKSB7XG4gICAgICAgICAgICBzY2hlZHVsZShjaGlsZCwgbmFtZSwgaWQsIGssIGNoaWxkcmVuLCBpbmhlcml0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goY2hpbGRyZW4pO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbnZhciBTZWxlY3Rpb24gPSBzZWxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtQ3NzIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7c3R5bGV9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlTnVsbChuYW1lLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHN0cmluZzEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCBzdHJpbmcxMCA9IHN0cmluZzEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHZhbHVlMSA9IHZhbHVlKHRoaXMpLFxuICAgICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHN0cmluZzEgPSB2YWx1ZTEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVNYXliZVJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgb24wLCBvbjEsIGxpc3RlbmVyMCwga2V5ID0gXCJzdHlsZS5cIiArIG5hbWUsIGV2ZW50ID0gXCJlbmQuXCIgKyBrZXksIHJlbW92ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub24sXG4gICAgICAgIGxpc3RlbmVyID0gc2NoZWR1bGUudmFsdWVba2V5XSA9PSBudWxsID8gcmVtb3ZlIHx8IChyZW1vdmUgPSBzdHlsZVJlbW92ZShuYW1lKSkgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjAgfHwgbGlzdGVuZXIwICE9PSBsaXN0ZW5lcikgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihldmVudCwgbGlzdGVuZXIwID0gbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgaSA9IChuYW1lICs9IFwiXCIpID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZU51bGwobmFtZSwgaSkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBzdHlsZVJlbW92ZShuYW1lKSlcbiAgICA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVGdW5jdGlvbihuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwic3R5bGUuXCIgKyBuYW1lLCB2YWx1ZSkpKVxuICAgICAgLmVhY2goc3R5bGVNYXliZVJlbW92ZSh0aGlzLl9pZCwgbmFtZSkpXG4gICAgOiB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUNvbnN0YW50KG5hbWUsIGksIHZhbHVlKSwgcHJpb3JpdHkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBudWxsKTtcbn1cbiIsICJmdW5jdGlvbiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCBpLmNhbGwodGhpcywgdCksIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIHQsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0ID0gKGkwID0gaSkgJiYgc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSk7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBrZXkgPSBcInN0eWxlLlwiICsgKG5hbWUgKz0gXCJcIik7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSk7XG59XG4iLCAiaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUxID0gdmFsdWUodGhpcyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlMSA9PSBudWxsID8gXCJcIiA6IHZhbHVlMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMudHdlZW4oXCJ0ZXh0XCIsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHRleHRGdW5jdGlvbih0d2VlblZhbHVlKHRoaXMsIFwidGV4dFwiLCB2YWx1ZSkpXG4gICAgICA6IHRleHRDb25zdGFudCh2YWx1ZSA9PSBudWxsID8gXCJcIiA6IHZhbHVlICsgXCJcIikpO1xufVxuIiwgImZ1bmN0aW9uIHRleHRJbnRlcnBvbGF0ZShpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IGkuY2FsbCh0aGlzLCB0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dFR3ZWVuKHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgdGV4dEludGVycG9sYXRlKGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJ0ZXh0XCI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCB0ZXh0VHdlZW4odmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQwID0gdGhpcy5faWQsXG4gICAgICBpZDEgPSBuZXdJZCgpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHZhciBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkMCk7XG4gICAgICAgIHNjaGVkdWxlKG5vZGUsIG5hbWUsIGlkMSwgaSwgZ3JvdXAsIHtcbiAgICAgICAgICB0aW1lOiBpbmhlcml0LnRpbWUgKyBpbmhlcml0LmRlbGF5ICsgaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgICBkdXJhdGlvbjogaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBlYXNlOiBpbmhlcml0LmVhc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQxKTtcbn1cbiIsICJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBvbjAsIG9uMSwgdGhhdCA9IHRoaXMsIGlkID0gdGhhdC5faWQsIHNpemUgPSB0aGF0LnNpemUoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBjYW5jZWwgPSB7dmFsdWU6IHJlamVjdH0sXG4gICAgICAgIGVuZCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7IGlmICgtLXNpemUgPT09IDApIHJlc29sdmUoKTsgfX07XG5cbiAgICB0aGF0LmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgICBpZiAob24gIT09IG9uMCkge1xuICAgICAgICBvbjEgPSAob24wID0gb24pLmNvcHkoKTtcbiAgICAgICAgb24xLl8uY2FuY2VsLnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uaW50ZXJydXB0LnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uZW5kLnB1c2goZW5kKTtcbiAgICAgIH1cblxuICAgICAgc2NoZWR1bGUub24gPSBvbjE7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgc2VsZWN0aW9uIHdhcyBlbXB0eSwgcmVzb2x2ZSBlbmQgaW1tZWRpYXRlbHlcbiAgICBpZiAoc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpO1xuICB9KTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyVHdlZW4gZnJvbSBcIi4vYXR0clR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kZWxheSBmcm9tIFwiLi9kZWxheS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZHVyYXRpb24gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2UgZnJvbSBcIi4vZWFzZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcgZnJvbSBcIi4vZWFzZVZhcnlpbmcuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0aW9uIGZyb20gXCIuL3NlbGVjdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlVHdlZW4gZnJvbSBcIi4vc3R5bGVUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0VHdlZW4gZnJvbSBcIi4vdGV4dFR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3R3ZWVuIGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lbmQgZnJvbSBcIi4vZW5kLmpzXCI7XG5cbnZhciBpZCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBUcmFuc2l0aW9uKGdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbiAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gIHRoaXMuX2lkID0gaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zaXRpb24obmFtZSkge1xuICByZXR1cm4gc2VsZWN0aW9uKCkudHJhbnNpdGlvbihuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld0lkKCkge1xuICByZXR1cm4gKytpZDtcbn1cblxudmFyIHNlbGVjdGlvbl9wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlO1xuXG5UcmFuc2l0aW9uLnByb3RvdHlwZSA9IHRyYW5zaXRpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNpdGlvbixcbiAgc2VsZWN0OiB0cmFuc2l0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiB0cmFuc2l0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHRyYW5zaXRpb25fZmlsdGVyLFxuICBtZXJnZTogdHJhbnNpdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiB0cmFuc2l0aW9uX3NlbGVjdGlvbixcbiAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbl90cmFuc2l0aW9uLFxuICBjYWxsOiBzZWxlY3Rpb25fcHJvdG90eXBlLmNhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9wcm90b3R5cGUuZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9wcm90b3R5cGUuZWFjaCxcbiAgb246IHRyYW5zaXRpb25fb24sXG4gIGF0dHI6IHRyYW5zaXRpb25fYXR0cixcbiAgYXR0clR3ZWVuOiB0cmFuc2l0aW9uX2F0dHJUd2VlbixcbiAgc3R5bGU6IHRyYW5zaXRpb25fc3R5bGUsXG4gIHN0eWxlVHdlZW46IHRyYW5zaXRpb25fc3R5bGVUd2VlbixcbiAgdGV4dDogdHJhbnNpdGlvbl90ZXh0LFxuICB0ZXh0VHdlZW46IHRyYW5zaXRpb25fdGV4dFR3ZWVuLFxuICByZW1vdmU6IHRyYW5zaXRpb25fcmVtb3ZlLFxuICB0d2VlbjogdHJhbnNpdGlvbl90d2VlbixcbiAgZGVsYXk6IHRyYW5zaXRpb25fZGVsYXksXG4gIGR1cmF0aW9uOiB0cmFuc2l0aW9uX2R1cmF0aW9uLFxuICBlYXNlOiB0cmFuc2l0aW9uX2Vhc2UsXG4gIGVhc2VWYXJ5aW5nOiB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nLFxuICBlbmQ6IHRyYW5zaXRpb25fZW5kLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX3Byb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdXG59O1xuIiwgImV4cG9ydCBmdW5jdGlvbiBjdWJpY0luKHQpIHtcbiAgcmV0dXJuIHQgKiB0ICogdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1YmljT3V0KHQpIHtcbiAgcmV0dXJuIC0tdCAqIHQgKiB0ICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyB0ICogdCAqIHQgOiAodCAtPSAyKSAqIHQgKiB0ICsgMikgLyAyO1xufVxuIiwgImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuLi90cmFuc2l0aW9uL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUgZnJvbSBcIi4uL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7ZWFzZUN1YmljSW5PdXR9IGZyb20gXCJkMy1lYXNlXCI7XG5pbXBvcnQge25vd30gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBkZWZhdWx0VGltaW5nID0ge1xuICB0aW1lOiBudWxsLCAvLyBTZXQgb24gdXNlLlxuICBkZWxheTogMCxcbiAgZHVyYXRpb246IDI1MCxcbiAgZWFzZTogZWFzZUN1YmljSW5PdXRcbn07XG5cbmZ1bmN0aW9uIGluaGVyaXQobm9kZSwgaWQpIHtcbiAgdmFyIHRpbWluZztcbiAgd2hpbGUgKCEodGltaW5nID0gbm9kZS5fX3RyYW5zaXRpb24pIHx8ICEodGltaW5nID0gdGltaW5nW2lkXSkpIHtcbiAgICBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0cmFuc2l0aW9uICR7aWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGltaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBpZCxcbiAgICAgIHRpbWluZztcblxuICBpZiAobmFtZSBpbnN0YW5jZW9mIFRyYW5zaXRpb24pIHtcbiAgICBpZCA9IG5hbWUuX2lkLCBuYW1lID0gbmFtZS5fbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZCA9IG5ld0lkKCksICh0aW1pbmcgPSBkZWZhdWx0VGltaW5nKS50aW1lID0gbm93KCksIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZCwgaSwgZ3JvdXAsIHRpbWluZyB8fCBpbmhlcml0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ludGVycnVwdCBmcm9tIFwiLi9pbnRlcnJ1cHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5cbnNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJydXB0ID0gc2VsZWN0aW9uX2ludGVycnVwdDtcbnNlbGVjdGlvbi5wcm90b3R5cGUudHJhbnNpdGlvbiA9IHNlbGVjdGlvbl90cmFuc2l0aW9uO1xuIiwgImltcG9ydCB7ZGlzcGF0Y2h9IGZyb20gXCJkMy1kaXNwYXRjaFwiO1xuaW1wb3J0IHtkcmFnRGlzYWJsZSwgZHJhZ0VuYWJsZX0gZnJvbSBcImQzLWRyYWdcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGV9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtwb2ludGVyLCBzZWxlY3R9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7aW50ZXJydXB0fSBmcm9tIFwiZDMtdHJhbnNpdGlvblwiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgQnJ1c2hFdmVudCBmcm9tIFwiLi9ldmVudC5qc1wiO1xuaW1wb3J0IG5vZXZlbnQsIHtub3Byb3BhZ2F0aW9ufSBmcm9tIFwiLi9ub2V2ZW50LmpzXCI7XG5cbnZhciBNT0RFX0RSQUcgPSB7bmFtZTogXCJkcmFnXCJ9LFxuICAgIE1PREVfU1BBQ0UgPSB7bmFtZTogXCJzcGFjZVwifSxcbiAgICBNT0RFX0hBTkRMRSA9IHtuYW1lOiBcImhhbmRsZVwifSxcbiAgICBNT0RFX0NFTlRFUiA9IHtuYW1lOiBcImNlbnRlclwifTtcblxuY29uc3Qge2FicywgbWF4LCBtaW59ID0gTWF0aDtcblxuZnVuY3Rpb24gbnVtYmVyMShlKSB7XG4gIHJldHVybiBbK2VbMF0sICtlWzFdXTtcbn1cblxuZnVuY3Rpb24gbnVtYmVyMihlKSB7XG4gIHJldHVybiBbbnVtYmVyMShlWzBdKSwgbnVtYmVyMShlWzFdKV07XG59XG5cbnZhciBYID0ge1xuICBuYW1lOiBcInhcIixcbiAgaGFuZGxlczogW1wid1wiLCBcImVcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeCwgZSkgeyByZXR1cm4geCA9PSBudWxsID8gbnVsbCA6IFtbK3hbMF0sIGVbMF1bMV1dLCBbK3hbMV0sIGVbMV1bMV1dXTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgJiYgW3h5WzBdWzBdLCB4eVsxXVswXV07IH1cbn07XG5cbnZhciBZID0ge1xuICBuYW1lOiBcInlcIixcbiAgaGFuZGxlczogW1wiblwiLCBcInNcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeSwgZSkgeyByZXR1cm4geSA9PSBudWxsID8gbnVsbCA6IFtbZVswXVswXSwgK3lbMF1dLCBbZVsxXVswXSwgK3lbMV1dXTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgJiYgW3h5WzBdWzFdLCB4eVsxXVsxXV07IH1cbn07XG5cbnZhciBYWSA9IHtcbiAgbmFtZTogXCJ4eVwiLFxuICBoYW5kbGVzOiBbXCJuXCIsIFwid1wiLCBcImVcIiwgXCJzXCIsIFwibndcIiwgXCJuZVwiLCBcInN3XCIsIFwic2VcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ID09IG51bGwgPyBudWxsIDogbnVtYmVyMih4eSk7IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5OyB9XG59O1xuXG52YXIgY3Vyc29ycyA9IHtcbiAgb3ZlcmxheTogXCJjcm9zc2hhaXJcIixcbiAgc2VsZWN0aW9uOiBcIm1vdmVcIixcbiAgbjogXCJucy1yZXNpemVcIixcbiAgZTogXCJldy1yZXNpemVcIixcbiAgczogXCJucy1yZXNpemVcIixcbiAgdzogXCJldy1yZXNpemVcIixcbiAgbnc6IFwibndzZS1yZXNpemVcIixcbiAgbmU6IFwibmVzdy1yZXNpemVcIixcbiAgc2U6IFwibndzZS1yZXNpemVcIixcbiAgc3c6IFwibmVzdy1yZXNpemVcIlxufTtcblxudmFyIGZsaXBYID0ge1xuICBlOiBcIndcIixcbiAgdzogXCJlXCIsXG4gIG53OiBcIm5lXCIsXG4gIG5lOiBcIm53XCIsXG4gIHNlOiBcInN3XCIsXG4gIHN3OiBcInNlXCJcbn07XG5cbnZhciBmbGlwWSA9IHtcbiAgbjogXCJzXCIsXG4gIHM6IFwiblwiLFxuICBudzogXCJzd1wiLFxuICBuZTogXCJzZVwiLFxuICBzZTogXCJuZVwiLFxuICBzdzogXCJud1wiXG59O1xuXG52YXIgc2lnbnNYID0ge1xuICBvdmVybGF5OiArMSxcbiAgc2VsZWN0aW9uOiArMSxcbiAgbjogbnVsbCxcbiAgZTogKzEsXG4gIHM6IG51bGwsXG4gIHc6IC0xLFxuICBudzogLTEsXG4gIG5lOiArMSxcbiAgc2U6ICsxLFxuICBzdzogLTFcbn07XG5cbnZhciBzaWduc1kgPSB7XG4gIG92ZXJsYXk6ICsxLFxuICBzZWxlY3Rpb246ICsxLFxuICBuOiAtMSxcbiAgZTogbnVsbCxcbiAgczogKzEsXG4gIHc6IG51bGwsXG4gIG53OiAtMSxcbiAgbmU6IC0xLFxuICBzZTogKzEsXG4gIHN3OiArMVxufTtcblxuZnVuY3Rpb24gdHlwZSh0KSB7XG4gIHJldHVybiB7dHlwZTogdH07XG59XG5cbi8vIElnbm9yZSByaWdodC1jbGljaywgc2luY2UgdGhhdCBzaG91bGQgb3BlbiB0aGUgY29udGV4dCBtZW51LlxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlcihldmVudCkge1xuICByZXR1cm4gIWV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LmJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdEV4dGVudCgpIHtcbiAgdmFyIHN2ZyA9IHRoaXMub3duZXJTVkdFbGVtZW50IHx8IHRoaXM7XG4gIGlmIChzdmcuaGFzQXR0cmlidXRlKFwidmlld0JveFwiKSkge1xuICAgIHN2ZyA9IHN2Zy52aWV3Qm94LmJhc2VWYWw7XG4gICAgcmV0dXJuIFtbc3ZnLngsIHN2Zy55XSwgW3N2Zy54ICsgc3ZnLndpZHRoLCBzdmcueSArIHN2Zy5oZWlnaHRdXTtcbiAgfVxuICByZXR1cm4gW1swLCAwXSwgW3N2Zy53aWR0aC5iYXNlVmFsLnZhbHVlLCBzdmcuaGVpZ2h0LmJhc2VWYWwudmFsdWVdXTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFRvdWNoYWJsZSgpIHtcbiAgcmV0dXJuIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyB8fCAoXCJvbnRvdWNoc3RhcnRcIiBpbiB0aGlzKTtcbn1cblxuLy8gTGlrZSBkMy5sb2NhbCwgYnV0IHdpdGggdGhlIG5hbWUgXHUyMDFDX19icnVzaFx1MjAxRCByYXRoZXIgdGhhbiBhdXRvLWdlbmVyYXRlZC5cbmZ1bmN0aW9uIGxvY2FsKG5vZGUpIHtcbiAgd2hpbGUgKCFub2RlLl9fYnJ1c2gpIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm47XG4gIHJldHVybiBub2RlLl9fYnJ1c2g7XG59XG5cbmZ1bmN0aW9uIGVtcHR5KGV4dGVudCkge1xuICByZXR1cm4gZXh0ZW50WzBdWzBdID09PSBleHRlbnRbMV1bMF1cbiAgICAgIHx8IGV4dGVudFswXVsxXSA9PT0gZXh0ZW50WzFdWzFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hTZWxlY3Rpb24obm9kZSkge1xuICB2YXIgc3RhdGUgPSBub2RlLl9fYnJ1c2g7XG4gIHJldHVybiBzdGF0ZSA/IHN0YXRlLmRpbS5vdXRwdXQoc3RhdGUuc2VsZWN0aW9uKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFgoKSB7XG4gIHJldHVybiBicnVzaChYKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoWSgpIHtcbiAgcmV0dXJuIGJydXNoKFkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGJydXNoKFhZKTtcbn1cblxuZnVuY3Rpb24gYnJ1c2goZGltKSB7XG4gIHZhciBleHRlbnQgPSBkZWZhdWx0RXh0ZW50LFxuICAgICAgZmlsdGVyID0gZGVmYXVsdEZpbHRlcixcbiAgICAgIHRvdWNoYWJsZSA9IGRlZmF1bHRUb3VjaGFibGUsXG4gICAgICBrZXlzID0gdHJ1ZSxcbiAgICAgIGxpc3RlbmVycyA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJicnVzaFwiLCBcImVuZFwiKSxcbiAgICAgIGhhbmRsZVNpemUgPSA2LFxuICAgICAgdG91Y2hlbmRpbmc7XG5cbiAgZnVuY3Rpb24gYnJ1c2goZ3JvdXApIHtcbiAgICB2YXIgb3ZlcmxheSA9IGdyb3VwXG4gICAgICAgIC5wcm9wZXJ0eShcIl9fYnJ1c2hcIiwgaW5pdGlhbGl6ZSlcbiAgICAgIC5zZWxlY3RBbGwoXCIub3ZlcmxheVwiKVxuICAgICAgLmRhdGEoW3R5cGUoXCJvdmVybGF5XCIpXSk7XG5cbiAgICBvdmVybGF5LmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwib3ZlcmxheVwiKVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMub3ZlcmxheSlcbiAgICAgIC5tZXJnZShvdmVybGF5KVxuICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXh0ZW50ID0gbG9jYWwodGhpcykuZXh0ZW50O1xuICAgICAgICAgIHNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAuYXR0cihcInhcIiwgZXh0ZW50WzBdWzBdKVxuICAgICAgICAgICAgICAuYXR0cihcInlcIiwgZXh0ZW50WzBdWzFdKVxuICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGV4dGVudFsxXVswXSAtIGV4dGVudFswXVswXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZXh0ZW50WzFdWzFdIC0gZXh0ZW50WzBdWzFdKTtcbiAgICAgICAgfSk7XG5cbiAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uXCIpXG4gICAgICAuZGF0YShbdHlwZShcInNlbGVjdGlvblwiKV0pXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJzZWxlY3Rpb25cIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5zZWxlY3Rpb24pXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM3NzdcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsLW9wYWNpdHlcIiwgMC4zKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIiNmZmZcIilcbiAgICAgICAgLmF0dHIoXCJzaGFwZS1yZW5kZXJpbmdcIiwgXCJjcmlzcEVkZ2VzXCIpO1xuXG4gICAgdmFyIGhhbmRsZSA9IGdyb3VwLnNlbGVjdEFsbChcIi5oYW5kbGVcIilcbiAgICAgIC5kYXRhKGRpbS5oYW5kbGVzLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGU7IH0pO1xuXG4gICAgaGFuZGxlLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgIGhhbmRsZS5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcImhhbmRsZSBoYW5kbGUtLVwiICsgZC50eXBlOyB9KVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBjdXJzb3JzW2QudHlwZV07IH0pO1xuXG4gICAgZ3JvdXBcbiAgICAgICAgLmVhY2gocmVkcmF3KVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIilcbiAgICAgICAgLm9uKFwibW91c2Vkb3duLmJydXNoXCIsIHN0YXJ0ZWQpXG4gICAgICAuZmlsdGVyKHRvdWNoYWJsZSlcbiAgICAgICAgLm9uKFwidG91Y2hzdGFydC5icnVzaFwiLCBzdGFydGVkKVxuICAgICAgICAub24oXCJ0b3VjaG1vdmUuYnJ1c2hcIiwgdG91Y2htb3ZlZClcbiAgICAgICAgLm9uKFwidG91Y2hlbmQuYnJ1c2ggdG91Y2hjYW5jZWwuYnJ1c2hcIiwgdG91Y2hlbmRlZClcbiAgICAgICAgLnN0eWxlKFwidG91Y2gtYWN0aW9uXCIsIFwibm9uZVwiKVxuICAgICAgICAuc3R5bGUoXCItd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3JcIiwgXCJyZ2JhKDAsMCwwLDApXCIpO1xuICB9XG5cbiAgYnJ1c2gubW92ZSA9IGZ1bmN0aW9uKGdyb3VwLCBzZWxlY3Rpb24sIGV2ZW50KSB7XG4gICAgaWYgKGdyb3VwLnR3ZWVuKSB7XG4gICAgICBncm91cFxuICAgICAgICAgIC5vbihcInN0YXJ0LmJydXNoXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5iZWZvcmVzdGFydCgpLnN0YXJ0KGV2ZW50KTsgfSlcbiAgICAgICAgICAub24oXCJpbnRlcnJ1cHQuYnJ1c2ggZW5kLmJydXNoXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5lbmQoZXZlbnQpOyB9KVxuICAgICAgICAgIC50d2VlbihcImJydXNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gdGhhdC5fX2JydXNoLFxuICAgICAgICAgICAgICAgIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMCA9IHN0YXRlLnNlbGVjdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24xID0gZGltLmlucHV0KHR5cGVvZiBzZWxlY3Rpb24gPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc2VsZWN0aW9uLCBzdGF0ZS5leHRlbnQpLFxuICAgICAgICAgICAgICAgIGkgPSBpbnRlcnBvbGF0ZShzZWxlY3Rpb24wLCBzZWxlY3Rpb24xKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdHdlZW4odCkge1xuICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSB0ID09PSAxICYmIHNlbGVjdGlvbjEgPT09IG51bGwgPyBudWxsIDogaSh0KTtcbiAgICAgICAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgICAgICAgIGVtaXQuYnJ1c2goKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjAgIT09IG51bGwgJiYgc2VsZWN0aW9uMSAhPT0gbnVsbCA/IHR3ZWVuIDogdHdlZW4oMSk7XG4gICAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwXG4gICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHRoYXQuX19icnVzaCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24xID0gZGltLmlucHV0KHR5cGVvZiBzZWxlY3Rpb24gPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdGlvbi5hcHBseSh0aGF0LCBhcmdzKSA6IHNlbGVjdGlvbiwgc3RhdGUuZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmdzKS5iZWZvcmVzdGFydCgpO1xuXG4gICAgICAgICAgICBpbnRlcnJ1cHQodGhhdCk7XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBzZWxlY3Rpb24xID09PSBudWxsID8gbnVsbCA6IHNlbGVjdGlvbjE7XG4gICAgICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgICAgIGVtaXQuc3RhcnQoZXZlbnQpLmJydXNoKGV2ZW50KS5lbmQoZXZlbnQpO1xuICAgICAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBicnVzaC5jbGVhciA9IGZ1bmN0aW9uKGdyb3VwLCBldmVudCkge1xuICAgIGJydXNoLm1vdmUoZ3JvdXAsIG51bGwsIGV2ZW50KTtcbiAgfTtcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdmFyIGdyb3VwID0gc2VsZWN0KHRoaXMpLFxuICAgICAgICBzZWxlY3Rpb24gPSBsb2NhbCh0aGlzKS5zZWxlY3Rpb247XG5cbiAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBzZWxlY3Rpb25bMF1bMF0pXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIHNlbGVjdGlvblswXVsxXSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHNlbGVjdGlvblsxXVswXSAtIHNlbGVjdGlvblswXVswXSlcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBzZWxlY3Rpb25bMV1bMV0gLSBzZWxlY3Rpb25bMF1bMV0pO1xuXG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuaGFuZGxlXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGVbZC50eXBlLmxlbmd0aCAtIDFdID09PSBcImVcIiA/IHNlbGVjdGlvblsxXVswXSAtIGhhbmRsZVNpemUgLyAyIDogc2VsZWN0aW9uWzBdWzBdIC0gaGFuZGxlU2l6ZSAvIDI7IH0pXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZVswXSA9PT0gXCJzXCIgPyBzZWxlY3Rpb25bMV1bMV0gLSBoYW5kbGVTaXplIC8gMiA6IHNlbGVjdGlvblswXVsxXSAtIGhhbmRsZVNpemUgLyAyOyB9KVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlID09PSBcIm5cIiB8fCBkLnR5cGUgPT09IFwic1wiID8gc2VsZWN0aW9uWzFdWzBdIC0gc2VsZWN0aW9uWzBdWzBdICsgaGFuZGxlU2l6ZSA6IGhhbmRsZVNpemU7IH0pXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlID09PSBcImVcIiB8fCBkLnR5cGUgPT09IFwid1wiID8gc2VsZWN0aW9uWzFdWzFdIC0gc2VsZWN0aW9uWzBdWzFdICsgaGFuZGxlU2l6ZSA6IGhhbmRsZVNpemU7IH0pO1xuICAgIH1cblxuICAgIGVsc2Uge1xuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvbiwuaGFuZGxlXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHZhciBlbWl0ID0gdGhhdC5fX2JydXNoLmVtaXR0ZXI7XG4gICAgcmV0dXJuIGVtaXQgJiYgKCFjbGVhbiB8fCAhZW1pdC5jbGVhbikgPyBlbWl0IDogbmV3IEVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gRW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHRoaXMudGhhdCA9IHRoYXQ7XG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICB0aGlzLnN0YXRlID0gdGhhdC5fX2JydXNoO1xuICAgIHRoaXMuYWN0aXZlID0gMDtcbiAgICB0aGlzLmNsZWFuID0gY2xlYW47XG4gIH1cblxuICBFbWl0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBiZWZvcmVzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoKyt0aGlzLmFjdGl2ZSA9PT0gMSkgdGhpcy5zdGF0ZS5lbWl0dGVyID0gdGhpcywgdGhpcy5zdGFydGluZyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgaWYgKHRoaXMuc3RhcnRpbmcpIHRoaXMuc3RhcnRpbmcgPSBmYWxzZSwgdGhpcy5lbWl0KFwic3RhcnRcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgZWxzZSB0aGlzLmVtaXQoXCJicnVzaFwiLCBldmVudCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGJydXNoOiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgdGhpcy5lbWl0KFwiYnJ1c2hcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICBpZiAoLS10aGlzLmFjdGl2ZSA9PT0gMCkgZGVsZXRlIHRoaXMuc3RhdGUuZW1pdHRlciwgdGhpcy5lbWl0KFwiZW5kXCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZW1pdDogZnVuY3Rpb24odHlwZSwgZXZlbnQsIG1vZGUpIHtcbiAgICAgIHZhciBkID0gc2VsZWN0KHRoaXMudGhhdCkuZGF0dW0oKTtcbiAgICAgIGxpc3RlbmVycy5jYWxsKFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aGlzLnRoYXQsXG4gICAgICAgIG5ldyBCcnVzaEV2ZW50KHR5cGUsIHtcbiAgICAgICAgICBzb3VyY2VFdmVudDogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiBicnVzaCxcbiAgICAgICAgICBzZWxlY3Rpb246IGRpbS5vdXRwdXQodGhpcy5zdGF0ZS5zZWxlY3Rpb24pLFxuICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgZGlzcGF0Y2g6IGxpc3RlbmVyc1xuICAgICAgICB9KSxcbiAgICAgICAgZFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gc3RhcnRlZChldmVudCkge1xuICAgIGlmICh0b3VjaGVuZGluZyAmJiAhZXZlbnQudG91Y2hlcykgcmV0dXJuO1xuICAgIGlmICghZmlsdGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIHJldHVybjtcblxuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgdHlwZSA9IGV2ZW50LnRhcmdldC5fX2RhdGFfXy50eXBlLFxuICAgICAgICBtb2RlID0gKGtleXMgJiYgZXZlbnQubWV0YUtleSA/IHR5cGUgPSBcIm92ZXJsYXlcIiA6IHR5cGUpID09PSBcInNlbGVjdGlvblwiID8gTU9ERV9EUkFHIDogKGtleXMgJiYgZXZlbnQuYWx0S2V5ID8gTU9ERV9DRU5URVIgOiBNT0RFX0hBTkRMRSksXG4gICAgICAgIHNpZ25YID0gZGltID09PSBZID8gbnVsbCA6IHNpZ25zWFt0eXBlXSxcbiAgICAgICAgc2lnblkgPSBkaW0gPT09IFggPyBudWxsIDogc2lnbnNZW3R5cGVdLFxuICAgICAgICBzdGF0ZSA9IGxvY2FsKHRoYXQpLFxuICAgICAgICBleHRlbnQgPSBzdGF0ZS5leHRlbnQsXG4gICAgICAgIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbixcbiAgICAgICAgVyA9IGV4dGVudFswXVswXSwgdzAsIHcxLFxuICAgICAgICBOID0gZXh0ZW50WzBdWzFdLCBuMCwgbjEsXG4gICAgICAgIEUgPSBleHRlbnRbMV1bMF0sIGUwLCBlMSxcbiAgICAgICAgUyA9IGV4dGVudFsxXVsxXSwgczAsIHMxLFxuICAgICAgICBkeCA9IDAsXG4gICAgICAgIGR5ID0gMCxcbiAgICAgICAgbW92aW5nLFxuICAgICAgICBzaGlmdGluZyA9IHNpZ25YICYmIHNpZ25ZICYmIGtleXMgJiYgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgIGxvY2tYLFxuICAgICAgICBsb2NrWSxcbiAgICAgICAgcG9pbnRzID0gQXJyYXkuZnJvbShldmVudC50b3VjaGVzIHx8IFtldmVudF0sIHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGkgPSB0LmlkZW50aWZpZXI7XG4gICAgICAgICAgdCA9IHBvaW50ZXIodCwgdGhhdCk7XG4gICAgICAgICAgdC5wb2ludDAgPSB0LnNsaWNlKCk7XG4gICAgICAgICAgdC5pZGVudGlmaWVyID0gaTtcbiAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgfSk7XG5cbiAgICBpbnRlcnJ1cHQodGhhdCk7XG4gICAgdmFyIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3VtZW50cywgdHJ1ZSkuYmVmb3Jlc3RhcnQoKTtcblxuICAgIGlmICh0eXBlID09PSBcIm92ZXJsYXlcIikge1xuICAgICAgaWYgKHNlbGVjdGlvbikgbW92aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHB0cyA9IFtwb2ludHNbMF0sIHBvaW50c1sxXSB8fCBwb2ludHNbMF1dO1xuICAgICAgc3RhdGUuc2VsZWN0aW9uID0gc2VsZWN0aW9uID0gW1tcbiAgICAgICAgICB3MCA9IGRpbSA9PT0gWSA/IFcgOiBtaW4ocHRzWzBdWzBdLCBwdHNbMV1bMF0pLFxuICAgICAgICAgIG4wID0gZGltID09PSBYID8gTiA6IG1pbihwdHNbMF1bMV0sIHB0c1sxXVsxXSlcbiAgICAgICAgXSwgW1xuICAgICAgICAgIGUwID0gZGltID09PSBZID8gRSA6IG1heChwdHNbMF1bMF0sIHB0c1sxXVswXSksXG4gICAgICAgICAgczAgPSBkaW0gPT09IFggPyBTIDogbWF4KHB0c1swXVsxXSwgcHRzWzFdWzFdKVxuICAgICAgICBdXTtcbiAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkgbW92ZShldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHcwID0gc2VsZWN0aW9uWzBdWzBdO1xuICAgICAgbjAgPSBzZWxlY3Rpb25bMF1bMV07XG4gICAgICBlMCA9IHNlbGVjdGlvblsxXVswXTtcbiAgICAgIHMwID0gc2VsZWN0aW9uWzFdWzFdO1xuICAgIH1cblxuICAgIHcxID0gdzA7XG4gICAgbjEgPSBuMDtcbiAgICBlMSA9IGUwO1xuICAgIHMxID0gczA7XG5cbiAgICB2YXIgZ3JvdXAgPSBzZWxlY3QodGhhdClcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIik7XG5cbiAgICB2YXIgb3ZlcmxheSA9IGdyb3VwLnNlbGVjdEFsbChcIi5vdmVybGF5XCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZV0pO1xuXG4gICAgaWYgKGV2ZW50LnRvdWNoZXMpIHtcbiAgICAgIGVtaXQubW92ZWQgPSBtb3ZlZDtcbiAgICAgIGVtaXQuZW5kZWQgPSBlbmRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBzZWxlY3QoZXZlbnQudmlldylcbiAgICAgICAgICAub24oXCJtb3VzZW1vdmUuYnJ1c2hcIiwgbW92ZWQsIHRydWUpXG4gICAgICAgICAgLm9uKFwibW91c2V1cC5icnVzaFwiLCBlbmRlZCwgdHJ1ZSk7XG4gICAgICBpZiAoa2V5cykgdmlld1xuICAgICAgICAgIC5vbihcImtleWRvd24uYnJ1c2hcIiwga2V5ZG93bmVkLCB0cnVlKVxuICAgICAgICAgIC5vbihcImtleXVwLmJydXNoXCIsIGtleXVwcGVkLCB0cnVlKVxuXG4gICAgICBkcmFnRGlzYWJsZShldmVudC52aWV3KTtcbiAgICB9XG5cbiAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICBlbWl0LnN0YXJ0KGV2ZW50LCBtb2RlLm5hbWUpO1xuXG4gICAgZnVuY3Rpb24gbW92ZWQoZXZlbnQpIHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBldmVudC5jaGFuZ2VkVG91Y2hlcyB8fCBbZXZlbnRdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBwb2ludHMpXG4gICAgICAgICAgaWYgKGQuaWRlbnRpZmllciA9PT0gcC5pZGVudGlmaWVyKSBkLmN1ciA9IHBvaW50ZXIocCwgdGhhdCk7XG4gICAgICB9XG4gICAgICBpZiAoc2hpZnRpbmcgJiYgIWxvY2tYICYmICFsb2NrWSAmJiBwb2ludHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWzBdO1xuICAgICAgICBpZiAoYWJzKHBvaW50LmN1clswXSAtIHBvaW50WzBdKSA+IGFicyhwb2ludC5jdXJbMV0gLSBwb2ludFsxXSkpXG4gICAgICAgICAgbG9ja1kgPSB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbG9ja1ggPSB0cnVlO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBwb2ludCBvZiBwb2ludHMpXG4gICAgICAgIGlmIChwb2ludC5jdXIpIHBvaW50WzBdID0gcG9pbnQuY3VyWzBdLCBwb2ludFsxXSA9IHBvaW50LmN1clsxXTtcbiAgICAgIG1vdmluZyA9IHRydWU7XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICAgIG1vdmUoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWzBdLCBwb2ludDAgPSBwb2ludC5wb2ludDA7XG4gICAgICB2YXIgdDtcblxuICAgICAgZHggPSBwb2ludFswXSAtIHBvaW50MFswXTtcbiAgICAgIGR5ID0gcG9pbnRbMV0gLSBwb2ludDBbMV07XG5cbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIE1PREVfU1BBQ0U6XG4gICAgICAgIGNhc2UgTU9ERV9EUkFHOiB7XG4gICAgICAgICAgaWYgKHNpZ25YKSBkeCA9IG1heChXIC0gdzAsIG1pbihFIC0gZTAsIGR4KSksIHcxID0gdzAgKyBkeCwgZTEgPSBlMCArIGR4O1xuICAgICAgICAgIGlmIChzaWduWSkgZHkgPSBtYXgoTiAtIG4wLCBtaW4oUyAtIHMwLCBkeSkpLCBuMSA9IG4wICsgZHksIHMxID0gczAgKyBkeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE1PREVfSEFORExFOiB7XG4gICAgICAgICAgaWYgKHBvaW50c1sxXSkge1xuICAgICAgICAgICAgaWYgKHNpZ25YKSB3MSA9IG1heChXLCBtaW4oRSwgcG9pbnRzWzBdWzBdKSksIGUxID0gbWF4KFcsIG1pbihFLCBwb2ludHNbMV1bMF0pKSwgc2lnblggPSAxO1xuICAgICAgICAgICAgaWYgKHNpZ25ZKSBuMSA9IG1heChOLCBtaW4oUywgcG9pbnRzWzBdWzFdKSksIHMxID0gbWF4KE4sIG1pbihTLCBwb2ludHNbMV1bMV0pKSwgc2lnblkgPSAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBkeCA9IG1heChXIC0gdzAsIG1pbihFIC0gdzAsIGR4KSksIHcxID0gdzAgKyBkeCwgZTEgPSBlMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNpZ25YID4gMCkgZHggPSBtYXgoVyAtIGUwLCBtaW4oRSAtIGUwLCBkeCkpLCB3MSA9IHcwLCBlMSA9IGUwICsgZHg7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBkeSA9IG1heChOIC0gbjAsIG1pbihTIC0gbjAsIGR5KSksIG4xID0gbjAgKyBkeSwgczEgPSBzMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNpZ25ZID4gMCkgZHkgPSBtYXgoTiAtIHMwLCBtaW4oUyAtIHMwLCBkeSkpLCBuMSA9IG4wLCBzMSA9IHMwICsgZHk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTU9ERV9DRU5URVI6IHtcbiAgICAgICAgICBpZiAoc2lnblgpIHcxID0gbWF4KFcsIG1pbihFLCB3MCAtIGR4ICogc2lnblgpKSwgZTEgPSBtYXgoVywgbWluKEUsIGUwICsgZHggKiBzaWduWCkpO1xuICAgICAgICAgIGlmIChzaWduWSkgbjEgPSBtYXgoTiwgbWluKFMsIG4wIC0gZHkgKiBzaWduWSkpLCBzMSA9IG1heChOLCBtaW4oUywgczAgKyBkeSAqIHNpZ25ZKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGUxIDwgdzEpIHtcbiAgICAgICAgc2lnblggKj0gLTE7XG4gICAgICAgIHQgPSB3MCwgdzAgPSBlMCwgZTAgPSB0O1xuICAgICAgICB0ID0gdzEsIHcxID0gZTEsIGUxID0gdDtcbiAgICAgICAgaWYgKHR5cGUgaW4gZmxpcFgpIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGUgPSBmbGlwWFt0eXBlXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoczEgPCBuMSkge1xuICAgICAgICBzaWduWSAqPSAtMTtcbiAgICAgICAgdCA9IG4wLCBuMCA9IHMwLCBzMCA9IHQ7XG4gICAgICAgIHQgPSBuMSwgbjEgPSBzMSwgczEgPSB0O1xuICAgICAgICBpZiAodHlwZSBpbiBmbGlwWSkgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZSA9IGZsaXBZW3R5cGVdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZS5zZWxlY3Rpb24pIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbjsgLy8gTWF5IGJlIHNldCBieSBicnVzaC5tb3ZlIVxuICAgICAgaWYgKGxvY2tYKSB3MSA9IHNlbGVjdGlvblswXVswXSwgZTEgPSBzZWxlY3Rpb25bMV1bMF07XG4gICAgICBpZiAobG9ja1kpIG4xID0gc2VsZWN0aW9uWzBdWzFdLCBzMSA9IHNlbGVjdGlvblsxXVsxXTtcblxuICAgICAgaWYgKHNlbGVjdGlvblswXVswXSAhPT0gdzFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMF1bMV0gIT09IG4xXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzFdWzBdICE9PSBlMVxuICAgICAgICAgIHx8IHNlbGVjdGlvblsxXVsxXSAhPT0gczEpIHtcbiAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gW1t3MSwgbjFdLCBbZTEsIHMxXV07XG4gICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICBlbWl0LmJydXNoKGV2ZW50LCBtb2RlLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZGVkKGV2ZW50KSB7XG4gICAgICBub3Byb3BhZ2F0aW9uKGV2ZW50KTtcbiAgICAgIGlmIChldmVudC50b3VjaGVzKSB7XG4gICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBpZiAodG91Y2hlbmRpbmcpIGNsZWFyVGltZW91dCh0b3VjaGVuZGluZyk7XG4gICAgICAgIHRvdWNoZW5kaW5nID0gc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG91Y2hlbmRpbmcgPSBudWxsOyB9LCA1MDApOyAvLyBHaG9zdCBjbGlja3MgYXJlIGRlbGF5ZWQhXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcmFnRW5hYmxlKGV2ZW50LnZpZXcsIG1vdmluZyk7XG4gICAgICAgIHZpZXcub24oXCJrZXlkb3duLmJydXNoIGtleXVwLmJydXNoIG1vdXNlbW92ZS5icnVzaCBtb3VzZXVwLmJydXNoXCIsIG51bGwpO1xuICAgICAgfVxuICAgICAgZ3JvdXAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpO1xuICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMub3ZlcmxheSk7XG4gICAgICBpZiAoc3RhdGUuc2VsZWN0aW9uKSBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb247IC8vIE1heSBiZSBzZXQgYnkgYnJ1c2gubW92ZSAob24gc3RhcnQpIVxuICAgICAgaWYgKGVtcHR5KHNlbGVjdGlvbikpIHN0YXRlLnNlbGVjdGlvbiA9IG51bGwsIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgZW1pdC5lbmQoZXZlbnQsIG1vZGUubmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5ZG93bmVkKGV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogeyAvLyBTSElGVFxuICAgICAgICAgIHNoaWZ0aW5nID0gc2lnblggJiYgc2lnblk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAxODogeyAvLyBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9IQU5ETEUpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCkgZTAgPSBlMSAtIGR4ICogc2lnblgsIHcwID0gdzEgKyBkeCAqIHNpZ25YO1xuICAgICAgICAgICAgaWYgKHNpZ25ZKSBzMCA9IHMxIC0gZHkgKiBzaWduWSwgbjAgPSBuMSArIGR5ICogc2lnblk7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9DRU5URVI7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAzMjogeyAvLyBTUEFDRTsgdGFrZXMgcHJpb3JpdHkgb3ZlciBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9IQU5ETEUgfHwgbW9kZSA9PT0gTU9ERV9DRU5URVIpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTEgLSBkeDsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxIC0gZHg7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxIC0gZHk7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMSAtIGR5O1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfU1BBQ0U7XG4gICAgICAgICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5zZWxlY3Rpb24pO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleXVwcGVkKGV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogeyAvLyBTSElGVFxuICAgICAgICAgIGlmIChzaGlmdGluZykge1xuICAgICAgICAgICAgbG9ja1ggPSBsb2NrWSA9IHNoaWZ0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAxODogeyAvLyBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9DRU5URVIpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTE7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MTtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczE7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX0hBTkRMRTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDMyOiB7IC8vIFNQQUNFXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfU1BBQ0UpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25YKSBlMCA9IGUxIC0gZHggKiBzaWduWCwgdzAgPSB3MSArIGR4ICogc2lnblg7XG4gICAgICAgICAgICAgIGlmIChzaWduWSkgczAgPSBzMSAtIGR5ICogc2lnblksIG4wID0gbjEgKyBkeSAqIHNpZ25ZO1xuICAgICAgICAgICAgICBtb2RlID0gTU9ERV9DRU5URVI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxOyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzE7XG4gICAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczE7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMTtcbiAgICAgICAgICAgICAgbW9kZSA9IE1PREVfSEFORExFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZV0pO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNobW92ZWQoZXZlbnQpIHtcbiAgICBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykubW92ZWQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2hlbmRlZChldmVudCkge1xuICAgIGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5lbmRlZChldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX19icnVzaCB8fCB7c2VsZWN0aW9uOiBudWxsfTtcbiAgICBzdGF0ZS5leHRlbnQgPSBudW1iZXIyKGV4dGVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICBzdGF0ZS5kaW0gPSBkaW07XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgYnJ1c2guZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGV4dGVudCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQobnVtYmVyMihfKSksIGJydXNoKSA6IGV4dGVudDtcbiAgfTtcblxuICBicnVzaC5maWx0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZmlsdGVyID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCBicnVzaCkgOiBmaWx0ZXI7XG4gIH07XG5cbiAgYnJ1c2gudG91Y2hhYmxlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRvdWNoYWJsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgYnJ1c2gpIDogdG91Y2hhYmxlO1xuICB9O1xuXG4gIGJydXNoLmhhbmRsZVNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaGFuZGxlU2l6ZSA9ICtfLCBicnVzaCkgOiBoYW5kbGVTaXplO1xuICB9O1xuXG4gIGJydXNoLmtleU1vZGlmaWVycyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChrZXlzID0gISFfLCBicnVzaCkgOiBrZXlzO1xuICB9O1xuXG4gIGJydXNoLm9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gbGlzdGVuZXJzLm9uLmFwcGx5KGxpc3RlbmVycywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdmFsdWUgPT09IGxpc3RlbmVycyA/IGJydXNoIDogdmFsdWU7XG4gIH07XG5cbiAgcmV0dXJuIGJydXNoO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIE1hdGguYWJzKHggPSBNYXRoLnJvdW5kKHgpKSA+PSAxZTIxXG4gICAgICA/IHgudG9Mb2NhbGVTdHJpbmcoXCJlblwiKS5yZXBsYWNlKC8sL2csIFwiXCIpXG4gICAgICA6IHgudG9TdHJpbmcoMTApO1xufVxuXG4vLyBDb21wdXRlcyB0aGUgZGVjaW1hbCBjb2VmZmljaWVudCBhbmQgZXhwb25lbnQgb2YgdGhlIHNwZWNpZmllZCBudW1iZXIgeCB3aXRoXG4vLyBzaWduaWZpY2FudCBkaWdpdHMgcCwgd2hlcmUgeCBpcyBwb3NpdGl2ZSBhbmQgcCBpcyBpbiBbMSwgMjFdIG9yIHVuZGVmaW5lZC5cbi8vIEZvciBleGFtcGxlLCBmb3JtYXREZWNpbWFsUGFydHMoMS4yMykgcmV0dXJucyBbXCIxMjNcIiwgMF0uXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGVjaW1hbFBhcnRzKHgsIHApIHtcbiAgaWYgKCFpc0Zpbml0ZSh4KSB8fCB4ID09PSAwKSByZXR1cm4gbnVsbDsgLy8gTmFOLCBcdTAwQjFJbmZpbml0eSwgXHUwMEIxMFxuICB2YXIgaSA9ICh4ID0gcCA/IHgudG9FeHBvbmVudGlhbChwIC0gMSkgOiB4LnRvRXhwb25lbnRpYWwoKSkuaW5kZXhPZihcImVcIiksIGNvZWZmaWNpZW50ID0geC5zbGljZSgwLCBpKTtcblxuICAvLyBUaGUgc3RyaW5nIHJldHVybmVkIGJ5IHRvRXhwb25lbnRpYWwgZWl0aGVyIGhhcyB0aGUgZm9ybSBcXGRcXC5cXGQrZVstK11cXGQrXG4gIC8vIChlLmcuLCAxLjJlKzMpIG9yIHRoZSBmb3JtIFxcZGVbLStdXFxkKyAoZS5nLiwgMWUrMykuXG4gIHJldHVybiBbXG4gICAgY29lZmZpY2llbnQubGVuZ3RoID4gMSA/IGNvZWZmaWNpZW50WzBdICsgY29lZmZpY2llbnQuc2xpY2UoMikgOiBjb2VmZmljaWVudCxcbiAgICAreC5zbGljZShpICsgMSlcbiAgXTtcbn1cbiIsICJpbXBvcnQge2Zvcm1hdERlY2ltYWxQYXJ0c30gZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiB4ID0gZm9ybWF0RGVjaW1hbFBhcnRzKE1hdGguYWJzKHgpKSwgeCA/IHhbMV0gOiBOYU47XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZ3JvdXBpbmcsIHRob3VzYW5kcykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIHdpZHRoKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5sZW5ndGgsXG4gICAgICAgIHQgPSBbXSxcbiAgICAgICAgaiA9IDAsXG4gICAgICAgIGcgPSBncm91cGluZ1swXSxcbiAgICAgICAgbGVuZ3RoID0gMDtcblxuICAgIHdoaWxlIChpID4gMCAmJiBnID4gMCkge1xuICAgICAgaWYgKGxlbmd0aCArIGcgKyAxID4gd2lkdGgpIGcgPSBNYXRoLm1heCgxLCB3aWR0aCAtIGxlbmd0aCk7XG4gICAgICB0LnB1c2godmFsdWUuc3Vic3RyaW5nKGkgLT0gZywgaSArIGcpKTtcbiAgICAgIGlmICgobGVuZ3RoICs9IGcgKyAxKSA+IHdpZHRoKSBicmVhaztcbiAgICAgIGcgPSBncm91cGluZ1tqID0gKGogKyAxKSAlIGdyb3VwaW5nLmxlbmd0aF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHQucmV2ZXJzZSgpLmpvaW4odGhvdXNhbmRzKTtcbiAgfTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihudW1lcmFscykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvWzAtOV0vZywgZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuIG51bWVyYWxzWytpXTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsICIvLyBbW2ZpbGxdYWxpZ25dW3NpZ25dW3N5bWJvbF1bMF1bd2lkdGhdWyxdWy5wcmVjaXNpb25dW35dW3R5cGVdXG52YXIgcmUgPSAvXig/OiguKT8oWzw+PV5dKSk/KFsrXFwtKCBdKT8oWyQjXSk/KDApPyhcXGQrKT8oLCk/KFxcLlxcZCspPyh+KT8oW2EteiVdKT8kL2k7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIpIHtcbiAgaWYgKCEobWF0Y2ggPSByZS5leGVjKHNwZWNpZmllcikpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGZvcm1hdDogXCIgKyBzcGVjaWZpZXIpO1xuICB2YXIgbWF0Y2g7XG4gIHJldHVybiBuZXcgRm9ybWF0U3BlY2lmaWVyKHtcbiAgICBmaWxsOiBtYXRjaFsxXSxcbiAgICBhbGlnbjogbWF0Y2hbMl0sXG4gICAgc2lnbjogbWF0Y2hbM10sXG4gICAgc3ltYm9sOiBtYXRjaFs0XSxcbiAgICB6ZXJvOiBtYXRjaFs1XSxcbiAgICB3aWR0aDogbWF0Y2hbNl0sXG4gICAgY29tbWE6IG1hdGNoWzddLFxuICAgIHByZWNpc2lvbjogbWF0Y2hbOF0gJiYgbWF0Y2hbOF0uc2xpY2UoMSksXG4gICAgdHJpbTogbWF0Y2hbOV0sXG4gICAgdHlwZTogbWF0Y2hbMTBdXG4gIH0pO1xufVxuXG5mb3JtYXRTcGVjaWZpZXIucHJvdG90eXBlID0gRm9ybWF0U3BlY2lmaWVyLnByb3RvdHlwZTsgLy8gaW5zdGFuY2VvZlxuXG5leHBvcnQgZnVuY3Rpb24gRm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllcikge1xuICB0aGlzLmZpbGwgPSBzcGVjaWZpZXIuZmlsbCA9PT0gdW5kZWZpbmVkID8gXCIgXCIgOiBzcGVjaWZpZXIuZmlsbCArIFwiXCI7XG4gIHRoaXMuYWxpZ24gPSBzcGVjaWZpZXIuYWxpZ24gPT09IHVuZGVmaW5lZCA/IFwiPlwiIDogc3BlY2lmaWVyLmFsaWduICsgXCJcIjtcbiAgdGhpcy5zaWduID0gc3BlY2lmaWVyLnNpZ24gPT09IHVuZGVmaW5lZCA/IFwiLVwiIDogc3BlY2lmaWVyLnNpZ24gKyBcIlwiO1xuICB0aGlzLnN5bWJvbCA9IHNwZWNpZmllci5zeW1ib2wgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBzcGVjaWZpZXIuc3ltYm9sICsgXCJcIjtcbiAgdGhpcy56ZXJvID0gISFzcGVjaWZpZXIuemVybztcbiAgdGhpcy53aWR0aCA9IHNwZWNpZmllci53aWR0aCA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogK3NwZWNpZmllci53aWR0aDtcbiAgdGhpcy5jb21tYSA9ICEhc3BlY2lmaWVyLmNvbW1hO1xuICB0aGlzLnByZWNpc2lvbiA9IHNwZWNpZmllci5wcmVjaXNpb24gPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6ICtzcGVjaWZpZXIucHJlY2lzaW9uO1xuICB0aGlzLnRyaW0gPSAhIXNwZWNpZmllci50cmltO1xuICB0aGlzLnR5cGUgPSBzcGVjaWZpZXIudHlwZSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IHNwZWNpZmllci50eXBlICsgXCJcIjtcbn1cblxuRm9ybWF0U3BlY2lmaWVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5maWxsXG4gICAgICArIHRoaXMuYWxpZ25cbiAgICAgICsgdGhpcy5zaWduXG4gICAgICArIHRoaXMuc3ltYm9sXG4gICAgICArICh0aGlzLnplcm8gPyBcIjBcIiA6IFwiXCIpXG4gICAgICArICh0aGlzLndpZHRoID09PSB1bmRlZmluZWQgPyBcIlwiIDogTWF0aC5tYXgoMSwgdGhpcy53aWR0aCB8IDApKVxuICAgICAgKyAodGhpcy5jb21tYSA/IFwiLFwiIDogXCJcIilcbiAgICAgICsgKHRoaXMucHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyBcIlwiIDogXCIuXCIgKyBNYXRoLm1heCgwLCB0aGlzLnByZWNpc2lvbiB8IDApKVxuICAgICAgKyAodGhpcy50cmltID8gXCJ+XCIgOiBcIlwiKVxuICAgICAgKyB0aGlzLnR5cGU7XG59O1xuIiwgIi8vIFRyaW1zIGluc2lnbmlmaWNhbnQgemVyb3MsIGUuZy4sIHJlcGxhY2VzIDEuMjAwMGsgd2l0aCAxLjJrLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocykge1xuICBvdXQ6IGZvciAodmFyIG4gPSBzLmxlbmd0aCwgaSA9IDEsIGkwID0gLTEsIGkxOyBpIDwgbjsgKytpKSB7XG4gICAgc3dpdGNoIChzW2ldKSB7XG4gICAgICBjYXNlIFwiLlwiOiBpMCA9IGkxID0gaTsgYnJlYWs7XG4gICAgICBjYXNlIFwiMFwiOiBpZiAoaTAgPT09IDApIGkwID0gaTsgaTEgPSBpOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IGlmICghK3NbaV0pIGJyZWFrIG91dDsgaWYgKGkwID4gMCkgaTAgPSAwOyBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGkwID4gMCA/IHMuc2xpY2UoMCwgaTApICsgcy5zbGljZShpMSArIDEpIDogcztcbn1cbiIsICJpbXBvcnQge2Zvcm1hdERlY2ltYWxQYXJ0c30gZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuXG5leHBvcnQgdmFyIHByZWZpeEV4cG9uZW50O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4LCBwKSB7XG4gIHZhciBkID0gZm9ybWF0RGVjaW1hbFBhcnRzKHgsIHApO1xuICBpZiAoIWQpIHJldHVybiBwcmVmaXhFeHBvbmVudCA9IHVuZGVmaW5lZCwgeC50b1ByZWNpc2lvbihwKTtcbiAgdmFyIGNvZWZmaWNpZW50ID0gZFswXSxcbiAgICAgIGV4cG9uZW50ID0gZFsxXSxcbiAgICAgIGkgPSBleHBvbmVudCAtIChwcmVmaXhFeHBvbmVudCA9IE1hdGgubWF4KC04LCBNYXRoLm1pbig4LCBNYXRoLmZsb29yKGV4cG9uZW50IC8gMykpKSAqIDMpICsgMSxcbiAgICAgIG4gPSBjb2VmZmljaWVudC5sZW5ndGg7XG4gIHJldHVybiBpID09PSBuID8gY29lZmZpY2llbnRcbiAgICAgIDogaSA+IG4gPyBjb2VmZmljaWVudCArIG5ldyBBcnJheShpIC0gbiArIDEpLmpvaW4oXCIwXCIpXG4gICAgICA6IGkgPiAwID8gY29lZmZpY2llbnQuc2xpY2UoMCwgaSkgKyBcIi5cIiArIGNvZWZmaWNpZW50LnNsaWNlKGkpXG4gICAgICA6IFwiMC5cIiArIG5ldyBBcnJheSgxIC0gaSkuam9pbihcIjBcIikgKyBmb3JtYXREZWNpbWFsUGFydHMoeCwgTWF0aC5tYXgoMCwgcCArIGkgLSAxKSlbMF07IC8vIGxlc3MgdGhhbiAxeSFcbn1cbiIsICJpbXBvcnQge2Zvcm1hdERlY2ltYWxQYXJ0c30gZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4LCBwKSB7XG4gIHZhciBkID0gZm9ybWF0RGVjaW1hbFBhcnRzKHgsIHApO1xuICBpZiAoIWQpIHJldHVybiB4ICsgXCJcIjtcbiAgdmFyIGNvZWZmaWNpZW50ID0gZFswXSxcbiAgICAgIGV4cG9uZW50ID0gZFsxXTtcbiAgcmV0dXJuIGV4cG9uZW50IDwgMCA/IFwiMC5cIiArIG5ldyBBcnJheSgtZXhwb25lbnQpLmpvaW4oXCIwXCIpICsgY29lZmZpY2llbnRcbiAgICAgIDogY29lZmZpY2llbnQubGVuZ3RoID4gZXhwb25lbnQgKyAxID8gY29lZmZpY2llbnQuc2xpY2UoMCwgZXhwb25lbnQgKyAxKSArIFwiLlwiICsgY29lZmZpY2llbnQuc2xpY2UoZXhwb25lbnQgKyAxKVxuICAgICAgOiBjb2VmZmljaWVudCArIG5ldyBBcnJheShleHBvbmVudCAtIGNvZWZmaWNpZW50Lmxlbmd0aCArIDIpLmpvaW4oXCIwXCIpO1xufVxuIiwgImltcG9ydCBmb3JtYXREZWNpbWFsIGZyb20gXCIuL2Zvcm1hdERlY2ltYWwuanNcIjtcbmltcG9ydCBmb3JtYXRQcmVmaXhBdXRvIGZyb20gXCIuL2Zvcm1hdFByZWZpeEF1dG8uanNcIjtcbmltcG9ydCBmb3JtYXRSb3VuZGVkIGZyb20gXCIuL2Zvcm1hdFJvdW5kZWQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBcIiVcIjogKHgsIHApID0+ICh4ICogMTAwKS50b0ZpeGVkKHApLFxuICBcImJcIjogKHgpID0+IE1hdGgucm91bmQoeCkudG9TdHJpbmcoMiksXG4gIFwiY1wiOiAoeCkgPT4geCArIFwiXCIsXG4gIFwiZFwiOiBmb3JtYXREZWNpbWFsLFxuICBcImVcIjogKHgsIHApID0+IHgudG9FeHBvbmVudGlhbChwKSxcbiAgXCJmXCI6ICh4LCBwKSA9PiB4LnRvRml4ZWQocCksXG4gIFwiZ1wiOiAoeCwgcCkgPT4geC50b1ByZWNpc2lvbihwKSxcbiAgXCJvXCI6ICh4KSA9PiBNYXRoLnJvdW5kKHgpLnRvU3RyaW5nKDgpLFxuICBcInBcIjogKHgsIHApID0+IGZvcm1hdFJvdW5kZWQoeCAqIDEwMCwgcCksXG4gIFwiclwiOiBmb3JtYXRSb3VuZGVkLFxuICBcInNcIjogZm9ybWF0UHJlZml4QXV0byxcbiAgXCJYXCI6ICh4KSA9PiBNYXRoLnJvdW5kKHgpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpLFxuICBcInhcIjogKHgpID0+IE1hdGgucm91bmQoeCkudG9TdHJpbmcoMTYpXG59O1xuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLCAiaW1wb3J0IGV4cG9uZW50IGZyb20gXCIuL2V4cG9uZW50LmpzXCI7XG5pbXBvcnQgZm9ybWF0R3JvdXAgZnJvbSBcIi4vZm9ybWF0R3JvdXAuanNcIjtcbmltcG9ydCBmb3JtYXROdW1lcmFscyBmcm9tIFwiLi9mb3JtYXROdW1lcmFscy5qc1wiO1xuaW1wb3J0IGZvcm1hdFNwZWNpZmllciBmcm9tIFwiLi9mb3JtYXRTcGVjaWZpZXIuanNcIjtcbmltcG9ydCBmb3JtYXRUcmltIGZyb20gXCIuL2Zvcm1hdFRyaW0uanNcIjtcbmltcG9ydCBmb3JtYXRUeXBlcyBmcm9tIFwiLi9mb3JtYXRUeXBlcy5qc1wiO1xuaW1wb3J0IHtwcmVmaXhFeHBvbmVudH0gZnJvbSBcIi4vZm9ybWF0UHJlZml4QXV0by5qc1wiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuL2lkZW50aXR5LmpzXCI7XG5cbnZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwLFxuICAgIHByZWZpeGVzID0gW1wieVwiLFwielwiLFwiYVwiLFwiZlwiLFwicFwiLFwiblwiLFwiXHUwMEI1XCIsXCJtXCIsXCJcIixcImtcIixcIk1cIixcIkdcIixcIlRcIixcIlBcIixcIkVcIixcIlpcIixcIllcIl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGxvY2FsZSkge1xuICB2YXIgZ3JvdXAgPSBsb2NhbGUuZ3JvdXBpbmcgPT09IHVuZGVmaW5lZCB8fCBsb2NhbGUudGhvdXNhbmRzID09PSB1bmRlZmluZWQgPyBpZGVudGl0eSA6IGZvcm1hdEdyb3VwKG1hcC5jYWxsKGxvY2FsZS5ncm91cGluZywgTnVtYmVyKSwgbG9jYWxlLnRob3VzYW5kcyArIFwiXCIpLFxuICAgICAgY3VycmVuY3lQcmVmaXggPSBsb2NhbGUuY3VycmVuY3kgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBsb2NhbGUuY3VycmVuY3lbMF0gKyBcIlwiLFxuICAgICAgY3VycmVuY3lTdWZmaXggPSBsb2NhbGUuY3VycmVuY3kgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBsb2NhbGUuY3VycmVuY3lbMV0gKyBcIlwiLFxuICAgICAgZGVjaW1hbCA9IGxvY2FsZS5kZWNpbWFsID09PSB1bmRlZmluZWQgPyBcIi5cIiA6IGxvY2FsZS5kZWNpbWFsICsgXCJcIixcbiAgICAgIG51bWVyYWxzID0gbG9jYWxlLm51bWVyYWxzID09PSB1bmRlZmluZWQgPyBpZGVudGl0eSA6IGZvcm1hdE51bWVyYWxzKG1hcC5jYWxsKGxvY2FsZS5udW1lcmFscywgU3RyaW5nKSksXG4gICAgICBwZXJjZW50ID0gbG9jYWxlLnBlcmNlbnQgPT09IHVuZGVmaW5lZCA/IFwiJVwiIDogbG9jYWxlLnBlcmNlbnQgKyBcIlwiLFxuICAgICAgbWludXMgPSBsb2NhbGUubWludXMgPT09IHVuZGVmaW5lZCA/IFwiXHUyMjEyXCIgOiBsb2NhbGUubWludXMgKyBcIlwiLFxuICAgICAgbmFuID0gbG9jYWxlLm5hbiA9PT0gdW5kZWZpbmVkID8gXCJOYU5cIiA6IGxvY2FsZS5uYW4gKyBcIlwiO1xuXG4gIGZ1bmN0aW9uIG5ld0Zvcm1hdChzcGVjaWZpZXIsIG9wdGlvbnMpIHtcbiAgICBzcGVjaWZpZXIgPSBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKTtcblxuICAgIHZhciBmaWxsID0gc3BlY2lmaWVyLmZpbGwsXG4gICAgICAgIGFsaWduID0gc3BlY2lmaWVyLmFsaWduLFxuICAgICAgICBzaWduID0gc3BlY2lmaWVyLnNpZ24sXG4gICAgICAgIHN5bWJvbCA9IHNwZWNpZmllci5zeW1ib2wsXG4gICAgICAgIHplcm8gPSBzcGVjaWZpZXIuemVybyxcbiAgICAgICAgd2lkdGggPSBzcGVjaWZpZXIud2lkdGgsXG4gICAgICAgIGNvbW1hID0gc3BlY2lmaWVyLmNvbW1hLFxuICAgICAgICBwcmVjaXNpb24gPSBzcGVjaWZpZXIucHJlY2lzaW9uLFxuICAgICAgICB0cmltID0gc3BlY2lmaWVyLnRyaW0sXG4gICAgICAgIHR5cGUgPSBzcGVjaWZpZXIudHlwZTtcblxuICAgIC8vIFRoZSBcIm5cIiB0eXBlIGlzIGFuIGFsaWFzIGZvciBcIixnXCIuXG4gICAgaWYgKHR5cGUgPT09IFwiblwiKSBjb21tYSA9IHRydWUsIHR5cGUgPSBcImdcIjtcblxuICAgIC8vIFRoZSBcIlwiIHR5cGUsIGFuZCBhbnkgaW52YWxpZCB0eXBlLCBpcyBhbiBhbGlhcyBmb3IgXCIuMTJ+Z1wiLlxuICAgIGVsc2UgaWYgKCFmb3JtYXRUeXBlc1t0eXBlXSkgcHJlY2lzaW9uID09PSB1bmRlZmluZWQgJiYgKHByZWNpc2lvbiA9IDEyKSwgdHJpbSA9IHRydWUsIHR5cGUgPSBcImdcIjtcblxuICAgIC8vIElmIHplcm8gZmlsbCBpcyBzcGVjaWZpZWQsIHBhZGRpbmcgZ29lcyBhZnRlciBzaWduIGFuZCBiZWZvcmUgZGlnaXRzLlxuICAgIGlmICh6ZXJvIHx8IChmaWxsID09PSBcIjBcIiAmJiBhbGlnbiA9PT0gXCI9XCIpKSB6ZXJvID0gdHJ1ZSwgZmlsbCA9IFwiMFwiLCBhbGlnbiA9IFwiPVwiO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gICAgLy8gRm9yIFNJLXByZWZpeCwgdGhlIHN1ZmZpeCBpcyBsYXppbHkgY29tcHV0ZWQuXG4gICAgdmFyIHByZWZpeCA9IChvcHRpb25zICYmIG9wdGlvbnMucHJlZml4ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnByZWZpeCA6IFwiXCIpICsgKHN5bWJvbCA9PT0gXCIkXCIgPyBjdXJyZW5jeVByZWZpeCA6IHN5bWJvbCA9PT0gXCIjXCIgJiYgL1tib3hYXS8udGVzdCh0eXBlKSA/IFwiMFwiICsgdHlwZS50b0xvd2VyQ2FzZSgpIDogXCJcIiksXG4gICAgICAgIHN1ZmZpeCA9IChzeW1ib2wgPT09IFwiJFwiID8gY3VycmVuY3lTdWZmaXggOiAvWyVwXS8udGVzdCh0eXBlKSA/IHBlcmNlbnQgOiBcIlwiKSArIChvcHRpb25zICYmIG9wdGlvbnMuc3VmZml4ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnN1ZmZpeCA6IFwiXCIpO1xuXG4gICAgLy8gV2hhdCBmb3JtYXQgZnVuY3Rpb24gc2hvdWxkIHdlIHVzZT9cbiAgICAvLyBJcyB0aGlzIGFuIGludGVnZXIgdHlwZT9cbiAgICAvLyBDYW4gdGhpcyB0eXBlIGdlbmVyYXRlIGV4cG9uZW50aWFsIG5vdGF0aW9uP1xuICAgIHZhciBmb3JtYXRUeXBlID0gZm9ybWF0VHlwZXNbdHlwZV0sXG4gICAgICAgIG1heWJlU3VmZml4ID0gL1tkZWZncHJzJV0vLnRlc3QodHlwZSk7XG5cbiAgICAvLyBTZXQgdGhlIGRlZmF1bHQgcHJlY2lzaW9uIGlmIG5vdCBzcGVjaWZpZWQsXG4gICAgLy8gb3IgY2xhbXAgdGhlIHNwZWNpZmllZCBwcmVjaXNpb24gdG8gdGhlIHN1cHBvcnRlZCByYW5nZS5cbiAgICAvLyBGb3Igc2lnbmlmaWNhbnQgcHJlY2lzaW9uLCBpdCBtdXN0IGJlIGluIFsxLCAyMV0uXG4gICAgLy8gRm9yIGZpeGVkIHByZWNpc2lvbiwgaXQgbXVzdCBiZSBpbiBbMCwgMjBdLlxuICAgIHByZWNpc2lvbiA9IHByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gNlxuICAgICAgICA6IC9bZ3Byc10vLnRlc3QodHlwZSkgPyBNYXRoLm1heCgxLCBNYXRoLm1pbigyMSwgcHJlY2lzaW9uKSlcbiAgICAgICAgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigyMCwgcHJlY2lzaW9uKSk7XG5cbiAgICBmdW5jdGlvbiBmb3JtYXQodmFsdWUpIHtcbiAgICAgIHZhciB2YWx1ZVByZWZpeCA9IHByZWZpeCxcbiAgICAgICAgICB2YWx1ZVN1ZmZpeCA9IHN1ZmZpeCxcbiAgICAgICAgICBpLCBuLCBjO1xuXG4gICAgICBpZiAodHlwZSA9PT0gXCJjXCIpIHtcbiAgICAgICAgdmFsdWVTdWZmaXggPSBmb3JtYXRUeXBlKHZhbHVlKSArIHZhbHVlU3VmZml4O1xuICAgICAgICB2YWx1ZSA9IFwiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9ICt2YWx1ZTtcblxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIHNpZ24uIC0wIGlzIG5vdCBsZXNzIHRoYW4gMCwgYnV0IDEgLyAtMCBpcyFcbiAgICAgICAgdmFyIHZhbHVlTmVnYXRpdmUgPSB2YWx1ZSA8IDAgfHwgMSAvIHZhbHVlIDwgMDtcblxuICAgICAgICAvLyBQZXJmb3JtIHRoZSBpbml0aWFsIGZvcm1hdHRpbmcuXG4gICAgICAgIHZhbHVlID0gaXNOYU4odmFsdWUpID8gbmFuIDogZm9ybWF0VHlwZShNYXRoLmFicyh2YWx1ZSksIHByZWNpc2lvbik7XG5cbiAgICAgICAgLy8gVHJpbSBpbnNpZ25pZmljYW50IHplcm9zLlxuICAgICAgICBpZiAodHJpbSkgdmFsdWUgPSBmb3JtYXRUcmltKHZhbHVlKTtcblxuICAgICAgICAvLyBJZiBhIG5lZ2F0aXZlIHZhbHVlIHJvdW5kcyB0byB6ZXJvIGFmdGVyIGZvcm1hdHRpbmcsIGFuZCBubyBleHBsaWNpdCBwb3NpdGl2ZSBzaWduIGlzIHJlcXVlc3RlZCwgaGlkZSB0aGUgc2lnbi5cbiAgICAgICAgaWYgKHZhbHVlTmVnYXRpdmUgJiYgK3ZhbHVlID09PSAwICYmIHNpZ24gIT09IFwiK1wiKSB2YWx1ZU5lZ2F0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gICAgICAgIHZhbHVlUHJlZml4ID0gKHZhbHVlTmVnYXRpdmUgPyAoc2lnbiA9PT0gXCIoXCIgPyBzaWduIDogbWludXMpIDogc2lnbiA9PT0gXCItXCIgfHwgc2lnbiA9PT0gXCIoXCIgPyBcIlwiIDogc2lnbikgKyB2YWx1ZVByZWZpeDtcbiAgICAgICAgdmFsdWVTdWZmaXggPSAodHlwZSA9PT0gXCJzXCIgJiYgIWlzTmFOKHZhbHVlKSAmJiBwcmVmaXhFeHBvbmVudCAhPT0gdW5kZWZpbmVkID8gcHJlZml4ZXNbOCArIHByZWZpeEV4cG9uZW50IC8gM10gOiBcIlwiKSArIHZhbHVlU3VmZml4ICsgKHZhbHVlTmVnYXRpdmUgJiYgc2lnbiA9PT0gXCIoXCIgPyBcIilcIiA6IFwiXCIpO1xuXG4gICAgICAgIC8vIEJyZWFrIHRoZSBmb3JtYXR0ZWQgdmFsdWUgaW50byB0aGUgaW50ZWdlciBcdTIwMUN2YWx1ZVx1MjAxRCBwYXJ0IHRoYXQgY2FuIGJlXG4gICAgICAgIC8vIGdyb3VwZWQsIGFuZCBmcmFjdGlvbmFsIG9yIGV4cG9uZW50aWFsIFx1MjAxQ3N1ZmZpeFx1MjAxRCBwYXJ0IHRoYXQgaXMgbm90LlxuICAgICAgICBpZiAobWF5YmVTdWZmaXgpIHtcbiAgICAgICAgICBpID0gLTEsIG4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICAgIGlmIChjID0gdmFsdWUuY2hhckNvZGVBdChpKSwgNDggPiBjIHx8IGMgPiA1Nykge1xuICAgICAgICAgICAgICB2YWx1ZVN1ZmZpeCA9IChjID09PSA0NiA/IGRlY2ltYWwgKyB2YWx1ZS5zbGljZShpICsgMSkgOiB2YWx1ZS5zbGljZShpKSkgKyB2YWx1ZVN1ZmZpeDtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBmaWxsIGNoYXJhY3RlciBpcyBub3QgXCIwXCIsIGdyb3VwaW5nIGlzIGFwcGxpZWQgYmVmb3JlIHBhZGRpbmcuXG4gICAgICBpZiAoY29tbWEgJiYgIXplcm8pIHZhbHVlID0gZ3JvdXAodmFsdWUsIEluZmluaXR5KTtcblxuICAgICAgLy8gQ29tcHV0ZSB0aGUgcGFkZGluZy5cbiAgICAgIHZhciBsZW5ndGggPSB2YWx1ZVByZWZpeC5sZW5ndGggKyB2YWx1ZS5sZW5ndGggKyB2YWx1ZVN1ZmZpeC5sZW5ndGgsXG4gICAgICAgICAgcGFkZGluZyA9IGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbihmaWxsKSA6IFwiXCI7XG5cbiAgICAgIC8vIElmIHRoZSBmaWxsIGNoYXJhY3RlciBpcyBcIjBcIiwgZ3JvdXBpbmcgaXMgYXBwbGllZCBhZnRlciBwYWRkaW5nLlxuICAgICAgaWYgKGNvbW1hICYmIHplcm8pIHZhbHVlID0gZ3JvdXAocGFkZGluZyArIHZhbHVlLCBwYWRkaW5nLmxlbmd0aCA/IHdpZHRoIC0gdmFsdWVTdWZmaXgubGVuZ3RoIDogSW5maW5pdHkpLCBwYWRkaW5nID0gXCJcIjtcblxuICAgICAgLy8gUmVjb25zdHJ1Y3QgdGhlIGZpbmFsIG91dHB1dCBiYXNlZCBvbiB0aGUgZGVzaXJlZCBhbGlnbm1lbnQuXG4gICAgICBzd2l0Y2ggKGFsaWduKSB7XG4gICAgICAgIGNhc2UgXCI8XCI6IHZhbHVlID0gdmFsdWVQcmVmaXggKyB2YWx1ZSArIHZhbHVlU3VmZml4ICsgcGFkZGluZzsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCI9XCI6IHZhbHVlID0gdmFsdWVQcmVmaXggKyBwYWRkaW5nICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeDsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJeXCI6IHZhbHVlID0gcGFkZGluZy5zbGljZSgwLCBsZW5ndGggPSBwYWRkaW5nLmxlbmd0aCA+PiAxKSArIHZhbHVlUHJlZml4ICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeCArIHBhZGRpbmcuc2xpY2UobGVuZ3RoKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHZhbHVlID0gcGFkZGluZyArIHZhbHVlUHJlZml4ICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeDsgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudW1lcmFscyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgZm9ybWF0LnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3BlY2lmaWVyICsgXCJcIjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZvcm1hdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFByZWZpeChzcGVjaWZpZXIsIHZhbHVlKSB7XG4gICAgdmFyIGUgPSBNYXRoLm1heCgtOCwgTWF0aC5taW4oOCwgTWF0aC5mbG9vcihleHBvbmVudCh2YWx1ZSkgLyAzKSkpICogMyxcbiAgICAgICAgayA9IE1hdGgucG93KDEwLCAtZSksXG4gICAgICAgIGYgPSBuZXdGb3JtYXQoKHNwZWNpZmllciA9IGZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIpLCBzcGVjaWZpZXIudHlwZSA9IFwiZlwiLCBzcGVjaWZpZXIpLCB7c3VmZml4OiBwcmVmaXhlc1s4ICsgZSAvIDNdfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZihrICogdmFsdWUpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogbmV3Rm9ybWF0LFxuICAgIGZvcm1hdFByZWZpeDogZm9ybWF0UHJlZml4XG4gIH07XG59XG4iLCAiaW1wb3J0IGZvcm1hdExvY2FsZSBmcm9tIFwiLi9sb2NhbGUuanNcIjtcblxudmFyIGxvY2FsZTtcbmV4cG9ydCB2YXIgZm9ybWF0O1xuZXhwb3J0IHZhciBmb3JtYXRQcmVmaXg7XG5cbmRlZmF1bHRMb2NhbGUoe1xuICB0aG91c2FuZHM6IFwiLFwiLFxuICBncm91cGluZzogWzNdLFxuICBjdXJyZW5jeTogW1wiJFwiLCBcIlwiXVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmF1bHRMb2NhbGUoZGVmaW5pdGlvbikge1xuICBsb2NhbGUgPSBmb3JtYXRMb2NhbGUoZGVmaW5pdGlvbik7XG4gIGZvcm1hdCA9IGxvY2FsZS5mb3JtYXQ7XG4gIGZvcm1hdFByZWZpeCA9IGxvY2FsZS5mb3JtYXRQcmVmaXg7XG4gIHJldHVybiBsb2NhbGU7XG59XG4iLCAiaW1wb3J0IGV4cG9uZW50IGZyb20gXCIuL2V4cG9uZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0ZXApIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIC1leHBvbmVudChNYXRoLmFicyhzdGVwKSkpO1xufVxuIiwgImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGVwLCB2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5tYXgoLTgsIE1hdGgubWluKDgsIE1hdGguZmxvb3IoZXhwb25lbnQodmFsdWUpIC8gMykpKSAqIDMgLSBleHBvbmVudChNYXRoLmFicyhzdGVwKSkpO1xufVxuIiwgImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGVwLCBtYXgpIHtcbiAgc3RlcCA9IE1hdGguYWJzKHN0ZXApLCBtYXggPSBNYXRoLmFicyhtYXgpIC0gc3RlcDtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIGV4cG9uZW50KG1heCkgLSBleHBvbmVudChzdGVwKSkgKyAxO1xufVxuIiwgImV4cG9ydCB2YXIgZXBzaWxvbiA9IDFlLTY7XG5leHBvcnQgdmFyIGVwc2lsb24yID0gMWUtMTI7XG5leHBvcnQgdmFyIHBpID0gTWF0aC5QSTtcbmV4cG9ydCB2YXIgaGFsZlBpID0gcGkgLyAyO1xuZXhwb3J0IHZhciBxdWFydGVyUGkgPSBwaSAvIDQ7XG5leHBvcnQgdmFyIHRhdSA9IHBpICogMjtcblxuZXhwb3J0IHZhciBkZWdyZWVzID0gMTgwIC8gcGk7XG5leHBvcnQgdmFyIHJhZGlhbnMgPSBwaSAvIDE4MDtcblxuZXhwb3J0IHZhciBhYnMgPSBNYXRoLmFicztcbmV4cG9ydCB2YXIgYXRhbiA9IE1hdGguYXRhbjtcbmV4cG9ydCB2YXIgYXRhbjIgPSBNYXRoLmF0YW4yO1xuZXhwb3J0IHZhciBjb3MgPSBNYXRoLmNvcztcbmV4cG9ydCB2YXIgY2VpbCA9IE1hdGguY2VpbDtcbmV4cG9ydCB2YXIgZXhwID0gTWF0aC5leHA7XG5leHBvcnQgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbmV4cG9ydCB2YXIgaHlwb3QgPSBNYXRoLmh5cG90O1xuZXhwb3J0IHZhciBsb2cgPSBNYXRoLmxvZztcbmV4cG9ydCB2YXIgcG93ID0gTWF0aC5wb3c7XG5leHBvcnQgdmFyIHNpbiA9IE1hdGguc2luO1xuZXhwb3J0IHZhciBzaWduID0gTWF0aC5zaWduIHx8IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggPiAwID8gMSA6IHggPCAwID8gLTEgOiAwOyB9O1xuZXhwb3J0IHZhciBzcXJ0ID0gTWF0aC5zcXJ0O1xuZXhwb3J0IHZhciB0YW4gPSBNYXRoLnRhbjtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjb3MoeCkge1xuICByZXR1cm4geCA+IDEgPyAwIDogeCA8IC0xID8gcGkgOiBNYXRoLmFjb3MoeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc2luKHgpIHtcbiAgcmV0dXJuIHggPiAxID8gaGFsZlBpIDogeCA8IC0xID8gLWhhbGZQaSA6IE1hdGguYXNpbih4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhdmVyc2luKHgpIHtcbiAgcmV0dXJuICh4ID0gc2luKHggLyAyKSkgKiB4O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AoKSB7fVxuIiwgImZ1bmN0aW9uIHN0cmVhbUdlb21ldHJ5KGdlb21ldHJ5LCBzdHJlYW0pIHtcbiAgaWYgKGdlb21ldHJ5ICYmIHN0cmVhbUdlb21ldHJ5VHlwZS5oYXNPd25Qcm9wZXJ0eShnZW9tZXRyeS50eXBlKSkge1xuICAgIHN0cmVhbUdlb21ldHJ5VHlwZVtnZW9tZXRyeS50eXBlXShnZW9tZXRyeSwgc3RyZWFtKTtcbiAgfVxufVxuXG52YXIgc3RyZWFtT2JqZWN0VHlwZSA9IHtcbiAgRmVhdHVyZTogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBzdHJlYW1HZW9tZXRyeShvYmplY3QuZ2VvbWV0cnksIHN0cmVhbSk7XG4gIH0sXG4gIEZlYXR1cmVDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBmZWF0dXJlcyA9IG9iamVjdC5mZWF0dXJlcywgaSA9IC0xLCBuID0gZmVhdHVyZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1HZW9tZXRyeShmZWF0dXJlc1tpXS5nZW9tZXRyeSwgc3RyZWFtKTtcbiAgfVxufTtcblxudmFyIHN0cmVhbUdlb21ldHJ5VHlwZSA9IHtcbiAgU3BoZXJlOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbS5zcGhlcmUoKTtcbiAgfSxcbiAgUG9pbnQ6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0LmNvb3JkaW5hdGVzO1xuICAgIHN0cmVhbS5wb2ludChvYmplY3RbMF0sIG9iamVjdFsxXSwgb2JqZWN0WzJdKTtcbiAgfSxcbiAgTXVsdGlQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgb2JqZWN0ID0gY29vcmRpbmF0ZXNbaV0sIHN0cmVhbS5wb2ludChvYmplY3RbMF0sIG9iamVjdFsxXSwgb2JqZWN0WzJdKTtcbiAgfSxcbiAgTGluZVN0cmluZzogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBzdHJlYW1MaW5lKG9iamVjdC5jb29yZGluYXRlcywgc3RyZWFtLCAwKTtcbiAgfSxcbiAgTXVsdGlMaW5lU3RyaW5nOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0sIDApO1xuICB9LFxuICBQb2x5Z29uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbVBvbHlnb24ob2JqZWN0LmNvb3JkaW5hdGVzLCBzdHJlYW0pO1xuICB9LFxuICBNdWx0aVBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbVBvbHlnb24oY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSk7XG4gIH0sXG4gIEdlb21ldHJ5Q29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgZ2VvbWV0cmllcyA9IG9iamVjdC5nZW9tZXRyaWVzLCBpID0gLTEsIG4gPSBnZW9tZXRyaWVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtR2VvbWV0cnkoZ2VvbWV0cmllc1tpXSwgc3RyZWFtKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc3RyZWFtTGluZShjb29yZGluYXRlcywgc3RyZWFtLCBjbG9zZWQpIHtcbiAgdmFyIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aCAtIGNsb3NlZCwgY29vcmRpbmF0ZTtcbiAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICB3aGlsZSAoKytpIDwgbikgY29vcmRpbmF0ZSA9IGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0ucG9pbnQoY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgY29vcmRpbmF0ZVsyXSk7XG4gIHN0cmVhbS5saW5lRW5kKCk7XG59XG5cbmZ1bmN0aW9uIHN0cmVhbVBvbHlnb24oY29vcmRpbmF0ZXMsIHN0cmVhbSkge1xuICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0sIDEpO1xuICBzdHJlYW0ucG9seWdvbkVuZCgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICBpZiAob2JqZWN0ICYmIHN0cmVhbU9iamVjdFR5cGUuaGFzT3duUHJvcGVydHkob2JqZWN0LnR5cGUpKSB7XG4gICAgc3RyZWFtT2JqZWN0VHlwZVtvYmplY3QudHlwZV0ob2JqZWN0LCBzdHJlYW0pO1xuICB9IGVsc2Uge1xuICAgIHN0cmVhbUdlb21ldHJ5KG9iamVjdCwgc3RyZWFtKTtcbiAgfVxufVxuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthdGFuMiwgY29zLCBxdWFydGVyUGksIHJhZGlhbnMsIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi9ub29wLmpzXCI7XG5pbXBvcnQgc3RyZWFtIGZyb20gXCIuL3N0cmVhbS5qc1wiO1xuXG5leHBvcnQgdmFyIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCk7XG5cbi8vIGhlbGxvP1xuXG52YXIgYXJlYVN1bSA9IG5ldyBBZGRlcigpLFxuICAgIGxhbWJkYTAwLFxuICAgIHBoaTAwLFxuICAgIGxhbWJkYTAsXG4gICAgY29zUGhpMCxcbiAgICBzaW5QaGkwO1xuXG5leHBvcnQgdmFyIGFyZWFTdHJlYW0gPSB7XG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IG5vb3AsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgYXJlYVJpbmdTdW0gPSBuZXcgQWRkZXIoKTtcbiAgICBhcmVhU3RyZWFtLmxpbmVTdGFydCA9IGFyZWFSaW5nU3RhcnQ7XG4gICAgYXJlYVN0cmVhbS5saW5lRW5kID0gYXJlYVJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmVhUmluZyA9ICthcmVhUmluZ1N1bTtcbiAgICBhcmVhU3VtLmFkZChhcmVhUmluZyA8IDAgPyB0YXUgKyBhcmVhUmluZyA6IGFyZWFSaW5nKTtcbiAgICB0aGlzLmxpbmVTdGFydCA9IHRoaXMubGluZUVuZCA9IHRoaXMucG9pbnQgPSBub29wO1xuICB9LFxuICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFTdW0uYWRkKHRhdSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGFyZWFSaW5nU3RhcnQoKSB7XG4gIGFyZWFTdHJlYW0ucG9pbnQgPSBhcmVhUG9pbnRGaXJzdDtcbn1cblxuZnVuY3Rpb24gYXJlYVJpbmdFbmQoKSB7XG4gIGFyZWFQb2ludChsYW1iZGEwMCwgcGhpMDApO1xufVxuXG5mdW5jdGlvbiBhcmVhUG9pbnRGaXJzdChsYW1iZGEsIHBoaSkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50O1xuICBsYW1iZGEwMCA9IGxhbWJkYSwgcGhpMDAgPSBwaGk7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgbGFtYmRhMCA9IGxhbWJkYSwgY29zUGhpMCA9IGNvcyhwaGkgPSBwaGkgLyAyICsgcXVhcnRlclBpKSwgc2luUGhpMCA9IHNpbihwaGkpO1xufVxuXG5mdW5jdGlvbiBhcmVhUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICBwaGkgPSBwaGkgLyAyICsgcXVhcnRlclBpOyAvLyBoYWxmIHRoZSBhbmd1bGFyIGRpc3RhbmNlIGZyb20gc291dGggcG9sZVxuXG4gIC8vIFNwaGVyaWNhbCBleGNlc3MgRSBmb3IgYSBzcGhlcmljYWwgdHJpYW5nbGUgd2l0aCB2ZXJ0aWNlczogc291dGggcG9sZSxcbiAgLy8gcHJldmlvdXMgcG9pbnQsIGN1cnJlbnQgcG9pbnQuICBVc2VzIGEgZm9ybXVsYSBkZXJpdmVkIGZyb20gQ2Fnbm9saVx1MjAxOXNcbiAgLy8gdGhlb3JlbS4gIFNlZSBUb2RodW50ZXIsIFNwaGVyaWNhbCBUcmlnLiAoMTg3MSksIFNlYy4gMTAzLCBFcS4gKDIpLlxuICB2YXIgZExhbWJkYSA9IGxhbWJkYSAtIGxhbWJkYTAsXG4gICAgICBzZExhbWJkYSA9IGRMYW1iZGEgPj0gMCA/IDEgOiAtMSxcbiAgICAgIGFkTGFtYmRhID0gc2RMYW1iZGEgKiBkTGFtYmRhLFxuICAgICAgY29zUGhpID0gY29zKHBoaSksXG4gICAgICBzaW5QaGkgPSBzaW4ocGhpKSxcbiAgICAgIGsgPSBzaW5QaGkwICogc2luUGhpLFxuICAgICAgdSA9IGNvc1BoaTAgKiBjb3NQaGkgKyBrICogY29zKGFkTGFtYmRhKSxcbiAgICAgIHYgPSBrICogc2RMYW1iZGEgKiBzaW4oYWRMYW1iZGEpO1xuICBhcmVhUmluZ1N1bS5hZGQoYXRhbjIodiwgdSkpO1xuXG4gIC8vIEFkdmFuY2UgdGhlIHByZXZpb3VzIHBvaW50cy5cbiAgbGFtYmRhMCA9IGxhbWJkYSwgY29zUGhpMCA9IGNvc1BoaSwgc2luUGhpMCA9IHNpblBoaTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGFyZWFTdW0gPSBuZXcgQWRkZXIoKTtcbiAgc3RyZWFtKG9iamVjdCwgYXJlYVN0cmVhbSk7XG4gIHJldHVybiBhcmVhU3VtICogMjtcbn1cbiIsICJpbXBvcnQge2FzaW4sIGF0YW4yLCBjb3MsIHNpbiwgc3FydH0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gc3BoZXJpY2FsKGNhcnRlc2lhbikge1xuICByZXR1cm4gW2F0YW4yKGNhcnRlc2lhblsxXSwgY2FydGVzaWFuWzBdKSwgYXNpbihjYXJ0ZXNpYW5bMl0pXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbihzcGhlcmljYWwpIHtcbiAgdmFyIGxhbWJkYSA9IHNwaGVyaWNhbFswXSwgcGhpID0gc3BoZXJpY2FsWzFdLCBjb3NQaGkgPSBjb3MocGhpKTtcbiAgcmV0dXJuIFtjb3NQaGkgKiBjb3MobGFtYmRhKSwgY29zUGhpICogc2luKGxhbWJkYSksIHNpbihwaGkpXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbkRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5Dcm9zcyhhLCBiKSB7XG4gIHJldHVybiBbYVsxXSAqIGJbMl0gLSBhWzJdICogYlsxXSwgYVsyXSAqIGJbMF0gLSBhWzBdICogYlsyXSwgYVswXSAqIGJbMV0gLSBhWzFdICogYlswXV07XG59XG5cbi8vIFRPRE8gcmV0dXJuIGFcbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5BZGRJblBsYWNlKGEsIGIpIHtcbiAgYVswXSArPSBiWzBdLCBhWzFdICs9IGJbMV0sIGFbMl0gKz0gYlsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhblNjYWxlKHZlY3Rvciwgaykge1xuICByZXR1cm4gW3ZlY3RvclswXSAqIGssIHZlY3RvclsxXSAqIGssIHZlY3RvclsyXSAqIGtdO1xufVxuXG4vLyBUT0RPIHJldHVybiBkXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShkKSB7XG4gIHZhciBsID0gc3FydChkWzBdICogZFswXSArIGRbMV0gKiBkWzFdICsgZFsyXSAqIGRbMl0pO1xuICBkWzBdIC89IGwsIGRbMV0gLz0gbCwgZFsyXSAvPSBsO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcblxuICBmdW5jdGlvbiBjb21wb3NlKHgsIHkpIHtcbiAgICByZXR1cm4geCA9IGEoeCwgeSksIGIoeFswXSwgeFsxXSk7XG4gIH1cblxuICBpZiAoYS5pbnZlcnQgJiYgYi5pbnZlcnQpIGNvbXBvc2UuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB4ID0gYi5pbnZlcnQoeCwgeSksIHggJiYgYS5pbnZlcnQoeFswXSwgeFsxXSk7XG4gIH07XG5cbiAgcmV0dXJuIGNvbXBvc2U7XG59XG4iLCAiaW1wb3J0IGNvbXBvc2UgZnJvbSBcIi4vY29tcG9zZS5qc1wiO1xuaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGRlZ3JlZXMsIHBpLCByYWRpYW5zLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiByb3RhdGlvbklkZW50aXR5KGxhbWJkYSwgcGhpKSB7XG4gIGlmIChhYnMobGFtYmRhKSA+IHBpKSBsYW1iZGEgLT0gTWF0aC5yb3VuZChsYW1iZGEgLyB0YXUpICogdGF1O1xuICByZXR1cm4gW2xhbWJkYSwgcGhpXTtcbn1cblxucm90YXRpb25JZGVudGl0eS5pbnZlcnQgPSByb3RhdGlvbklkZW50aXR5O1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlUmFkaWFucyhkZWx0YUxhbWJkYSwgZGVsdGFQaGksIGRlbHRhR2FtbWEpIHtcbiAgcmV0dXJuIChkZWx0YUxhbWJkYSAlPSB0YXUpID8gKGRlbHRhUGhpIHx8IGRlbHRhR2FtbWEgPyBjb21wb3NlKHJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSwgcm90YXRpb25QaGlHYW1tYShkZWx0YVBoaSwgZGVsdGFHYW1tYSkpXG4gICAgOiByb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSkpXG4gICAgOiAoZGVsdGFQaGkgfHwgZGVsdGFHYW1tYSA/IHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpXG4gICAgOiByb3RhdGlvbklkZW50aXR5KTtcbn1cblxuZnVuY3Rpb24gZm9yd2FyZFJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSB7XG4gIHJldHVybiBmdW5jdGlvbihsYW1iZGEsIHBoaSkge1xuICAgIGxhbWJkYSArPSBkZWx0YUxhbWJkYTtcbiAgICBpZiAoYWJzKGxhbWJkYSkgPiBwaSkgbGFtYmRhIC09IE1hdGgucm91bmQobGFtYmRhIC8gdGF1KSAqIHRhdTtcbiAgICByZXR1cm4gW2xhbWJkYSwgcGhpXTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpIHtcbiAgdmFyIHJvdGF0aW9uID0gZm9yd2FyZFJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKTtcbiAgcm90YXRpb24uaW52ZXJ0ID0gZm9yd2FyZFJvdGF0aW9uTGFtYmRhKC1kZWx0YUxhbWJkYSk7XG4gIHJldHVybiByb3RhdGlvbjtcbn1cblxuZnVuY3Rpb24gcm90YXRpb25QaGlHYW1tYShkZWx0YVBoaSwgZGVsdGFHYW1tYSkge1xuICB2YXIgY29zRGVsdGFQaGkgPSBjb3MoZGVsdGFQaGkpLFxuICAgICAgc2luRGVsdGFQaGkgPSBzaW4oZGVsdGFQaGkpLFxuICAgICAgY29zRGVsdGFHYW1tYSA9IGNvcyhkZWx0YUdhbW1hKSxcbiAgICAgIHNpbkRlbHRhR2FtbWEgPSBzaW4oZGVsdGFHYW1tYSk7XG5cbiAgZnVuY3Rpb24gcm90YXRpb24obGFtYmRhLCBwaGkpIHtcbiAgICB2YXIgY29zUGhpID0gY29zKHBoaSksXG4gICAgICAgIHggPSBjb3MobGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeSA9IHNpbihsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB6ID0gc2luKHBoaSksXG4gICAgICAgIGsgPSB6ICogY29zRGVsdGFQaGkgKyB4ICogc2luRGVsdGFQaGk7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0YW4yKHkgKiBjb3NEZWx0YUdhbW1hIC0gayAqIHNpbkRlbHRhR2FtbWEsIHggKiBjb3NEZWx0YVBoaSAtIHogKiBzaW5EZWx0YVBoaSksXG4gICAgICBhc2luKGsgKiBjb3NEZWx0YUdhbW1hICsgeSAqIHNpbkRlbHRhR2FtbWEpXG4gICAgXTtcbiAgfVxuXG4gIHJvdGF0aW9uLmludmVydCA9IGZ1bmN0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgdmFyIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgICB4ID0gY29zKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHkgPSBzaW4obGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeiA9IHNpbihwaGkpLFxuICAgICAgICBrID0geiAqIGNvc0RlbHRhR2FtbWEgLSB5ICogc2luRGVsdGFHYW1tYTtcbiAgICByZXR1cm4gW1xuICAgICAgYXRhbjIoeSAqIGNvc0RlbHRhR2FtbWEgKyB6ICogc2luRGVsdGFHYW1tYSwgeCAqIGNvc0RlbHRhUGhpICsgayAqIHNpbkRlbHRhUGhpKSxcbiAgICAgIGFzaW4oayAqIGNvc0RlbHRhUGhpIC0geCAqIHNpbkRlbHRhUGhpKVxuICAgIF07XG4gIH07XG5cbiAgcmV0dXJuIHJvdGF0aW9uO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihyb3RhdGUpIHtcbiAgcm90YXRlID0gcm90YXRlUmFkaWFucyhyb3RhdGVbMF0gKiByYWRpYW5zLCByb3RhdGVbMV0gKiByYWRpYW5zLCByb3RhdGUubGVuZ3RoID4gMiA/IHJvdGF0ZVsyXSAqIHJhZGlhbnMgOiAwKTtcblxuICBmdW5jdGlvbiBmb3J3YXJkKGNvb3JkaW5hdGVzKSB7XG4gICAgY29vcmRpbmF0ZXMgPSByb3RhdGUoY29vcmRpbmF0ZXNbMF0gKiByYWRpYW5zLCBjb29yZGluYXRlc1sxXSAqIHJhZGlhbnMpO1xuICAgIHJldHVybiBjb29yZGluYXRlc1swXSAqPSBkZWdyZWVzLCBjb29yZGluYXRlc1sxXSAqPSBkZWdyZWVzLCBjb29yZGluYXRlcztcbiAgfVxuXG4gIGZvcndhcmQuaW52ZXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICBjb29yZGluYXRlcyA9IHJvdGF0ZS5pbnZlcnQoY29vcmRpbmF0ZXNbMF0gKiByYWRpYW5zLCBjb29yZGluYXRlc1sxXSAqIHJhZGlhbnMpO1xuICAgIHJldHVybiBjb29yZGluYXRlc1swXSAqPSBkZWdyZWVzLCBjb29yZGluYXRlc1sxXSAqPSBkZWdyZWVzLCBjb29yZGluYXRlcztcbiAgfTtcblxuICByZXR1cm4gZm9yd2FyZDtcbn1cbiIsICJpbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZSwgc3BoZXJpY2FsfSBmcm9tIFwiLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IHthY29zLCBjb3MsIGRlZ3JlZXMsIGVwc2lsb24sIHJhZGlhbnMsIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5pbXBvcnQge3JvdGF0ZVJhZGlhbnN9IGZyb20gXCIuL3JvdGF0aW9uLmpzXCI7XG5cbi8vIEdlbmVyYXRlcyBhIGNpcmNsZSBjZW50ZXJlZCBhdCBbMFx1MDBCMCwgMFx1MDBCMF0sIHdpdGggYSBnaXZlbiByYWRpdXMgYW5kIHByZWNpc2lvbi5cbmV4cG9ydCBmdW5jdGlvbiBjaXJjbGVTdHJlYW0oc3RyZWFtLCByYWRpdXMsIGRlbHRhLCBkaXJlY3Rpb24sIHQwLCB0MSkge1xuICBpZiAoIWRlbHRhKSByZXR1cm47XG4gIHZhciBjb3NSYWRpdXMgPSBjb3MocmFkaXVzKSxcbiAgICAgIHNpblJhZGl1cyA9IHNpbihyYWRpdXMpLFxuICAgICAgc3RlcCA9IGRpcmVjdGlvbiAqIGRlbHRhO1xuICBpZiAodDAgPT0gbnVsbCkge1xuICAgIHQwID0gcmFkaXVzICsgZGlyZWN0aW9uICogdGF1O1xuICAgIHQxID0gcmFkaXVzIC0gc3RlcCAvIDI7XG4gIH0gZWxzZSB7XG4gICAgdDAgPSBjaXJjbGVSYWRpdXMoY29zUmFkaXVzLCB0MCk7XG4gICAgdDEgPSBjaXJjbGVSYWRpdXMoY29zUmFkaXVzLCB0MSk7XG4gICAgaWYgKGRpcmVjdGlvbiA+IDAgPyB0MCA8IHQxIDogdDAgPiB0MSkgdDAgKz0gZGlyZWN0aW9uICogdGF1O1xuICB9XG4gIGZvciAodmFyIHBvaW50LCB0ID0gdDA7IGRpcmVjdGlvbiA+IDAgPyB0ID4gdDEgOiB0IDwgdDE7IHQgLT0gc3RlcCkge1xuICAgIHBvaW50ID0gc3BoZXJpY2FsKFtjb3NSYWRpdXMsIC1zaW5SYWRpdXMgKiBjb3ModCksIC1zaW5SYWRpdXMgKiBzaW4odCldKTtcbiAgICBzdHJlYW0ucG9pbnQocG9pbnRbMF0sIHBvaW50WzFdKTtcbiAgfVxufVxuXG4vLyBSZXR1cm5zIHRoZSBzaWduZWQgYW5nbGUgb2YgYSBjYXJ0ZXNpYW4gcG9pbnQgcmVsYXRpdmUgdG8gW2Nvc1JhZGl1cywgMCwgMF0uXG5mdW5jdGlvbiBjaXJjbGVSYWRpdXMoY29zUmFkaXVzLCBwb2ludCkge1xuICBwb2ludCA9IGNhcnRlc2lhbihwb2ludCksIHBvaW50WzBdIC09IGNvc1JhZGl1cztcbiAgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShwb2ludCk7XG4gIHZhciByYWRpdXMgPSBhY29zKC1wb2ludFsxXSk7XG4gIHJldHVybiAoKC1wb2ludFsyXSA8IDAgPyAtcmFkaXVzIDogcmFkaXVzKSArIHRhdSAtIGVwc2lsb24pICUgdGF1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNlbnRlciA9IGNvbnN0YW50KFswLCAwXSksXG4gICAgICByYWRpdXMgPSBjb25zdGFudCg5MCksXG4gICAgICBwcmVjaXNpb24gPSBjb25zdGFudCgyKSxcbiAgICAgIHJpbmcsXG4gICAgICByb3RhdGUsXG4gICAgICBzdHJlYW0gPSB7cG9pbnQ6IHBvaW50fTtcblxuICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgcmluZy5wdXNoKHggPSByb3RhdGUoeCwgeSkpO1xuICAgIHhbMF0gKj0gZGVncmVlcywgeFsxXSAqPSBkZWdyZWVzO1xuICB9XG5cbiAgZnVuY3Rpb24gY2lyY2xlKCkge1xuICAgIHZhciBjID0gY2VudGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIHIgPSByYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSAqIHJhZGlhbnMsXG4gICAgICAgIHAgPSBwcmVjaXNpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKSAqIHJhZGlhbnM7XG4gICAgcmluZyA9IFtdO1xuICAgIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMoLWNbMF0gKiByYWRpYW5zLCAtY1sxXSAqIHJhZGlhbnMsIDApLmludmVydDtcbiAgICBjaXJjbGVTdHJlYW0oc3RyZWFtLCByLCBwLCAxKTtcbiAgICBjID0ge3R5cGU6IFwiUG9seWdvblwiLCBjb29yZGluYXRlczogW3JpbmddfTtcbiAgICByaW5nID0gcm90YXRlID0gbnVsbDtcbiAgICByZXR1cm4gYztcbiAgfVxuXG4gIGNpcmNsZS5jZW50ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY2VudGVyID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChbK19bMF0sICtfWzFdXSksIGNpcmNsZSkgOiBjZW50ZXI7XG4gIH07XG5cbiAgY2lyY2xlLnJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgY2lyY2xlKSA6IHJhZGl1cztcbiAgfTtcblxuICBjaXJjbGUucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByZWNpc2lvbiA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBjaXJjbGUpIDogcHJlY2lzaW9uO1xuICB9O1xuXG4gIHJldHVybiBjaXJjbGU7XG59XG4iLCAiaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBsaW5lcyA9IFtdLFxuICAgICAgbGluZTtcbiAgcmV0dXJuIHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSwgbSkge1xuICAgICAgbGluZS5wdXNoKFt4LCB5LCBtXSk7XG4gICAgfSxcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgbGluZXMucHVzaChsaW5lID0gW10pO1xuICAgIH0sXG4gICAgbGluZUVuZDogbm9vcCxcbiAgICByZWpvaW46IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDEpIGxpbmVzLnB1c2gobGluZXMucG9wKCkuY29uY2F0KGxpbmVzLnNoaWZ0KCkpKTtcbiAgICB9LFxuICAgIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gbGluZXM7XG4gICAgICBsaW5lcyA9IFtdO1xuICAgICAgbGluZSA9IG51bGw7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcbn1cbiIsICJpbXBvcnQge2FicywgZXBzaWxvbn0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhYnMoYVswXSAtIGJbMF0pIDwgZXBzaWxvbiAmJiBhYnMoYVsxXSAtIGJbMV0pIDwgZXBzaWxvbjtcbn1cbiIsICJpbXBvcnQgcG9pbnRFcXVhbCBmcm9tIFwiLi4vcG9pbnRFcXVhbC5qc1wiO1xuaW1wb3J0IHtlcHNpbG9ufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBJbnRlcnNlY3Rpb24ocG9pbnQsIHBvaW50cywgb3RoZXIsIGVudHJ5KSB7XG4gIHRoaXMueCA9IHBvaW50O1xuICB0aGlzLnogPSBwb2ludHM7XG4gIHRoaXMubyA9IG90aGVyOyAvLyBhbm90aGVyIGludGVyc2VjdGlvblxuICB0aGlzLmUgPSBlbnRyeTsgLy8gaXMgYW4gZW50cnk/XG4gIHRoaXMudiA9IGZhbHNlOyAvLyB2aXNpdGVkXG4gIHRoaXMubiA9IHRoaXMucCA9IG51bGw7IC8vIG5leHQgJiBwcmV2aW91c1xufVxuXG4vLyBBIGdlbmVyYWxpemVkIHBvbHlnb24gY2xpcHBpbmcgYWxnb3JpdGhtOiBnaXZlbiBhIHBvbHlnb24gdGhhdCBoYXMgYmVlbiBjdXRcbi8vIGludG8gaXRzIHZpc2libGUgbGluZSBzZWdtZW50cywgYW5kIHJlam9pbnMgdGhlIHNlZ21lbnRzIGJ5IGludGVycG9sYXRpbmdcbi8vIGFsb25nIHRoZSBjbGlwIGVkZ2UuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWdtZW50cywgY29tcGFyZUludGVyc2VjdGlvbiwgc3RhcnRJbnNpZGUsIGludGVycG9sYXRlLCBzdHJlYW0pIHtcbiAgdmFyIHN1YmplY3QgPSBbXSxcbiAgICAgIGNsaXAgPSBbXSxcbiAgICAgIGksXG4gICAgICBuO1xuXG4gIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oc2VnbWVudCkge1xuICAgIGlmICgobiA9IHNlZ21lbnQubGVuZ3RoIC0gMSkgPD0gMCkgcmV0dXJuO1xuICAgIHZhciBuLCBwMCA9IHNlZ21lbnRbMF0sIHAxID0gc2VnbWVudFtuXSwgeDtcblxuICAgIGlmIChwb2ludEVxdWFsKHAwLCBwMSkpIHtcbiAgICAgIGlmICghcDBbMl0gJiYgIXAxWzJdKSB7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgc3RyZWFtLnBvaW50KChwMCA9IHNlZ21lbnRbaV0pWzBdLCBwMFsxXSk7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGhhbmRsZSBkZWdlbmVyYXRlIGNhc2VzIGJ5IG1vdmluZyB0aGUgcG9pbnRcbiAgICAgIHAxWzBdICs9IDIgKiBlcHNpbG9uO1xuICAgIH1cblxuICAgIHN1YmplY3QucHVzaCh4ID0gbmV3IEludGVyc2VjdGlvbihwMCwgc2VnbWVudCwgbnVsbCwgdHJ1ZSkpO1xuICAgIGNsaXAucHVzaCh4Lm8gPSBuZXcgSW50ZXJzZWN0aW9uKHAwLCBudWxsLCB4LCBmYWxzZSkpO1xuICAgIHN1YmplY3QucHVzaCh4ID0gbmV3IEludGVyc2VjdGlvbihwMSwgc2VnbWVudCwgbnVsbCwgZmFsc2UpKTtcbiAgICBjbGlwLnB1c2goeC5vID0gbmV3IEludGVyc2VjdGlvbihwMSwgbnVsbCwgeCwgdHJ1ZSkpO1xuICB9KTtcblxuICBpZiAoIXN1YmplY3QubGVuZ3RoKSByZXR1cm47XG5cbiAgY2xpcC5zb3J0KGNvbXBhcmVJbnRlcnNlY3Rpb24pO1xuICBsaW5rKHN1YmplY3QpO1xuICBsaW5rKGNsaXApO1xuXG4gIGZvciAoaSA9IDAsIG4gPSBjbGlwLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGNsaXBbaV0uZSA9IHN0YXJ0SW5zaWRlID0gIXN0YXJ0SW5zaWRlO1xuICB9XG5cbiAgdmFyIHN0YXJ0ID0gc3ViamVjdFswXSxcbiAgICAgIHBvaW50cyxcbiAgICAgIHBvaW50O1xuXG4gIHdoaWxlICgxKSB7XG4gICAgLy8gRmluZCBmaXJzdCB1bnZpc2l0ZWQgaW50ZXJzZWN0aW9uLlxuICAgIHZhciBjdXJyZW50ID0gc3RhcnQsXG4gICAgICAgIGlzU3ViamVjdCA9IHRydWU7XG4gICAgd2hpbGUgKGN1cnJlbnQudikgaWYgKChjdXJyZW50ID0gY3VycmVudC5uKSA9PT0gc3RhcnQpIHJldHVybjtcbiAgICBwb2ludHMgPSBjdXJyZW50Lno7XG4gICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgIGRvIHtcbiAgICAgIGN1cnJlbnQudiA9IGN1cnJlbnQuby52ID0gdHJ1ZTtcbiAgICAgIGlmIChjdXJyZW50LmUpIHtcbiAgICAgICAgaWYgKGlzU3ViamVjdCkge1xuICAgICAgICAgIGZvciAoaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbjsgKytpKSBzdHJlYW0ucG9pbnQoKHBvaW50ID0gcG9pbnRzW2ldKVswXSwgcG9pbnRbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludGVycG9sYXRlKGN1cnJlbnQueCwgY3VycmVudC5uLngsIDEsIHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1N1YmplY3QpIHtcbiAgICAgICAgICBwb2ludHMgPSBjdXJyZW50LnAuejtcbiAgICAgICAgICBmb3IgKGkgPSBwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHN0cmVhbS5wb2ludCgocG9pbnQgPSBwb2ludHNbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW50ZXJwb2xhdGUoY3VycmVudC54LCBjdXJyZW50LnAueCwgLTEsIHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucDtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm87XG4gICAgICBwb2ludHMgPSBjdXJyZW50Lno7XG4gICAgICBpc1N1YmplY3QgPSAhaXNTdWJqZWN0O1xuICAgIH0gd2hpbGUgKCFjdXJyZW50LnYpO1xuICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbGluayhhcnJheSkge1xuICBpZiAoIShuID0gYXJyYXkubGVuZ3RoKSkgcmV0dXJuO1xuICB2YXIgbixcbiAgICAgIGkgPSAwLFxuICAgICAgYSA9IGFycmF5WzBdLFxuICAgICAgYjtcbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICBhLm4gPSBiID0gYXJyYXlbaV07XG4gICAgYi5wID0gYTtcbiAgICBhID0gYjtcbiAgfVxuICBhLm4gPSBiID0gYXJyYXlbMF07XG4gIGIucCA9IGE7XG59XG4iLCAiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuQ3Jvc3MsIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2V9IGZyb20gXCIuL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIGVwc2lsb24yLCBoYWxmUGksIHBpLCBxdWFydGVyUGksIHNpZ24sIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIGxvbmdpdHVkZShwb2ludCkge1xuICByZXR1cm4gYWJzKHBvaW50WzBdKSA8PSBwaSA/IHBvaW50WzBdIDogc2lnbihwb2ludFswXSkgKiAoKGFicyhwb2ludFswXSkgKyBwaSkgJSB0YXUgLSBwaSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHBvbHlnb24sIHBvaW50KSB7XG4gIHZhciBsYW1iZGEgPSBsb25naXR1ZGUocG9pbnQpLFxuICAgICAgcGhpID0gcG9pbnRbMV0sXG4gICAgICBzaW5QaGkgPSBzaW4ocGhpKSxcbiAgICAgIG5vcm1hbCA9IFtzaW4obGFtYmRhKSwgLWNvcyhsYW1iZGEpLCAwXSxcbiAgICAgIGFuZ2xlID0gMCxcbiAgICAgIHdpbmRpbmcgPSAwO1xuXG4gIHZhciBzdW0gPSBuZXcgQWRkZXIoKTtcblxuICBpZiAoc2luUGhpID09PSAxKSBwaGkgPSBoYWxmUGkgKyBlcHNpbG9uO1xuICBlbHNlIGlmIChzaW5QaGkgPT09IC0xKSBwaGkgPSAtaGFsZlBpIC0gZXBzaWxvbjtcblxuICBmb3IgKHZhciBpID0gMCwgbiA9IHBvbHlnb24ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEobSA9IChyaW5nID0gcG9seWdvbltpXSkubGVuZ3RoKSkgY29udGludWU7XG4gICAgdmFyIHJpbmcsXG4gICAgICAgIG0sXG4gICAgICAgIHBvaW50MCA9IHJpbmdbbSAtIDFdLFxuICAgICAgICBsYW1iZGEwID0gbG9uZ2l0dWRlKHBvaW50MCksXG4gICAgICAgIHBoaTAgPSBwb2ludDBbMV0gLyAyICsgcXVhcnRlclBpLFxuICAgICAgICBzaW5QaGkwID0gc2luKHBoaTApLFxuICAgICAgICBjb3NQaGkwID0gY29zKHBoaTApO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBtOyArK2osIGxhbWJkYTAgPSBsYW1iZGExLCBzaW5QaGkwID0gc2luUGhpMSwgY29zUGhpMCA9IGNvc1BoaTEsIHBvaW50MCA9IHBvaW50MSkge1xuICAgICAgdmFyIHBvaW50MSA9IHJpbmdbal0sXG4gICAgICAgICAgbGFtYmRhMSA9IGxvbmdpdHVkZShwb2ludDEpLFxuICAgICAgICAgIHBoaTEgPSBwb2ludDFbMV0gLyAyICsgcXVhcnRlclBpLFxuICAgICAgICAgIHNpblBoaTEgPSBzaW4ocGhpMSksXG4gICAgICAgICAgY29zUGhpMSA9IGNvcyhwaGkxKSxcbiAgICAgICAgICBkZWx0YSA9IGxhbWJkYTEgLSBsYW1iZGEwLFxuICAgICAgICAgIHNpZ24gPSBkZWx0YSA+PSAwID8gMSA6IC0xLFxuICAgICAgICAgIGFic0RlbHRhID0gc2lnbiAqIGRlbHRhLFxuICAgICAgICAgIGFudGltZXJpZGlhbiA9IGFic0RlbHRhID4gcGksXG4gICAgICAgICAgayA9IHNpblBoaTAgKiBzaW5QaGkxO1xuXG4gICAgICBzdW0uYWRkKGF0YW4yKGsgKiBzaWduICogc2luKGFic0RlbHRhKSwgY29zUGhpMCAqIGNvc1BoaTEgKyBrICogY29zKGFic0RlbHRhKSkpO1xuICAgICAgYW5nbGUgKz0gYW50aW1lcmlkaWFuID8gZGVsdGEgKyBzaWduICogdGF1IDogZGVsdGE7XG5cbiAgICAgIC8vIEFyZSB0aGUgbG9uZ2l0dWRlcyBlaXRoZXIgc2lkZSBvZiB0aGUgcG9pbnRcdTIwMTlzIG1lcmlkaWFuIChsYW1iZGEpLFxuICAgICAgLy8gYW5kIGFyZSB0aGUgbGF0aXR1ZGVzIHNtYWxsZXIgdGhhbiB0aGUgcGFyYWxsZWwgKHBoaSk/XG4gICAgICBpZiAoYW50aW1lcmlkaWFuIF4gbGFtYmRhMCA+PSBsYW1iZGEgXiBsYW1iZGExID49IGxhbWJkYSkge1xuICAgICAgICB2YXIgYXJjID0gY2FydGVzaWFuQ3Jvc3MoY2FydGVzaWFuKHBvaW50MCksIGNhcnRlc2lhbihwb2ludDEpKTtcbiAgICAgICAgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShhcmMpO1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gY2FydGVzaWFuQ3Jvc3Mobm9ybWFsLCBhcmMpO1xuICAgICAgICBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKGludGVyc2VjdGlvbik7XG4gICAgICAgIHZhciBwaGlBcmMgPSAoYW50aW1lcmlkaWFuIF4gZGVsdGEgPj0gMCA/IC0xIDogMSkgKiBhc2luKGludGVyc2VjdGlvblsyXSk7XG4gICAgICAgIGlmIChwaGkgPiBwaGlBcmMgfHwgcGhpID09PSBwaGlBcmMgJiYgKGFyY1swXSB8fCBhcmNbMV0pKSB7XG4gICAgICAgICAgd2luZGluZyArPSBhbnRpbWVyaWRpYW4gXiBkZWx0YSA+PSAwID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRmlyc3QsIGRldGVybWluZSB3aGV0aGVyIHRoZSBTb3V0aCBwb2xlIGlzIGluc2lkZSBvciBvdXRzaWRlOlxuICAvL1xuICAvLyBJdCBpcyBpbnNpZGUgaWY6XG4gIC8vICogdGhlIHBvbHlnb24gd2luZHMgYXJvdW5kIGl0IGluIGEgY2xvY2t3aXNlIGRpcmVjdGlvbi5cbiAgLy8gKiB0aGUgcG9seWdvbiBkb2VzIG5vdCAoY3VtdWxhdGl2ZWx5KSB3aW5kIGFyb3VuZCBpdCwgYnV0IGhhcyBhIG5lZ2F0aXZlXG4gIC8vICAgKGNvdW50ZXItY2xvY2t3aXNlKSBhcmVhLlxuICAvL1xuICAvLyBTZWNvbmQsIGNvdW50IHRoZSAoc2lnbmVkKSBudW1iZXIgb2YgdGltZXMgYSBzZWdtZW50IGNyb3NzZXMgYSBsYW1iZGFcbiAgLy8gZnJvbSB0aGUgcG9pbnQgdG8gdGhlIFNvdXRoIHBvbGUuICBJZiBpdCBpcyB6ZXJvLCB0aGVuIHRoZSBwb2ludCBpcyB0aGVcbiAgLy8gc2FtZSBzaWRlIGFzIHRoZSBTb3V0aCBwb2xlLlxuXG4gIHJldHVybiAoYW5nbGUgPCAtZXBzaWxvbiB8fCBhbmdsZSA8IGVwc2lsb24gJiYgc3VtIDwgLWVwc2lsb24yKSBeICh3aW5kaW5nICYgMSk7XG59XG4iLCAiaW1wb3J0IGNsaXBCdWZmZXIgZnJvbSBcIi4vYnVmZmVyLmpzXCI7XG5pbXBvcnQgY2xpcFJlam9pbiBmcm9tIFwiLi9yZWpvaW4uanNcIjtcbmltcG9ydCB7ZXBzaWxvbiwgaGFsZlBpfSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHBvbHlnb25Db250YWlucyBmcm9tIFwiLi4vcG9seWdvbkNvbnRhaW5zLmpzXCI7XG5pbXBvcnQge21lcmdlfSBmcm9tIFwiZDMtYXJyYXlcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocG9pbnRWaXNpYmxlLCBjbGlwTGluZSwgaW50ZXJwb2xhdGUsIHN0YXJ0KSB7XG4gIHJldHVybiBmdW5jdGlvbihzaW5rKSB7XG4gICAgdmFyIGxpbmUgPSBjbGlwTGluZShzaW5rKSxcbiAgICAgICAgcmluZ0J1ZmZlciA9IGNsaXBCdWZmZXIoKSxcbiAgICAgICAgcmluZ1NpbmsgPSBjbGlwTGluZShyaW5nQnVmZmVyKSxcbiAgICAgICAgcG9seWdvblN0YXJ0ZWQgPSBmYWxzZSxcbiAgICAgICAgcG9seWdvbixcbiAgICAgICAgc2VnbWVudHMsXG4gICAgICAgIHJpbmc7XG5cbiAgICB2YXIgY2xpcCA9IHtcbiAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgbGluZUVuZDogbGluZUVuZCxcbiAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsaXAucG9pbnQgPSBwb2ludFJpbmc7XG4gICAgICAgIGNsaXAubGluZVN0YXJ0ID0gcmluZ1N0YXJ0O1xuICAgICAgICBjbGlwLmxpbmVFbmQgPSByaW5nRW5kO1xuICAgICAgICBzZWdtZW50cyA9IFtdO1xuICAgICAgICBwb2x5Z29uID0gW107XG4gICAgICB9LFxuICAgICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsaXAucG9pbnQgPSBwb2ludDtcbiAgICAgICAgY2xpcC5saW5lU3RhcnQgPSBsaW5lU3RhcnQ7XG4gICAgICAgIGNsaXAubGluZUVuZCA9IGxpbmVFbmQ7XG4gICAgICAgIHNlZ21lbnRzID0gbWVyZ2Uoc2VnbWVudHMpO1xuICAgICAgICB2YXIgc3RhcnRJbnNpZGUgPSBwb2x5Z29uQ29udGFpbnMocG9seWdvbiwgc3RhcnQpO1xuICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKCFwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uU3RhcnQoKSwgcG9seWdvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgIGNsaXBSZWpvaW4oc2VnbWVudHMsIGNvbXBhcmVJbnRlcnNlY3Rpb24sIHN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgc2luayk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnRJbnNpZGUpIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBzaW5rKTtcbiAgICAgICAgICBzaW5rLmxpbmVFbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvbkVuZCgpLCBwb2x5Z29uU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICBzZWdtZW50cyA9IHBvbHlnb24gPSBudWxsO1xuICAgICAgfSxcbiAgICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHNpbmsucG9seWdvblN0YXJ0KCk7XG4gICAgICAgIHNpbmsubGluZVN0YXJ0KCk7XG4gICAgICAgIGludGVycG9sYXRlKG51bGwsIG51bGwsIDEsIHNpbmspO1xuICAgICAgICBzaW5rLmxpbmVFbmQoKTtcbiAgICAgICAgc2luay5wb2x5Z29uRW5kKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHBvaW50KGxhbWJkYSwgcGhpKSB7XG4gICAgICBpZiAocG9pbnRWaXNpYmxlKGxhbWJkYSwgcGhpKSkgc2luay5wb2ludChsYW1iZGEsIHBoaSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9pbnRMaW5lKGxhbWJkYSwgcGhpKSB7XG4gICAgICBsaW5lLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICBjbGlwLnBvaW50ID0gcG9pbnRMaW5lO1xuICAgICAgbGluZS5saW5lU3RhcnQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgY2xpcC5wb2ludCA9IHBvaW50O1xuICAgICAgbGluZS5saW5lRW5kKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9pbnRSaW5nKGxhbWJkYSwgcGhpKSB7XG4gICAgICByaW5nLnB1c2goW2xhbWJkYSwgcGhpXSk7XG4gICAgICByaW5nU2luay5wb2ludChsYW1iZGEsIHBoaSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ1N0YXJ0KCkge1xuICAgICAgcmluZ1NpbmsubGluZVN0YXJ0KCk7XG4gICAgICByaW5nID0gW107XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgIHBvaW50UmluZyhyaW5nWzBdWzBdLCByaW5nWzBdWzFdKTtcbiAgICAgIHJpbmdTaW5rLmxpbmVFbmQoKTtcblxuICAgICAgdmFyIGNsZWFuID0gcmluZ1NpbmsuY2xlYW4oKSxcbiAgICAgICAgICByaW5nU2VnbWVudHMgPSByaW5nQnVmZmVyLnJlc3VsdCgpLFxuICAgICAgICAgIGksIG4gPSByaW5nU2VnbWVudHMubGVuZ3RoLCBtLFxuICAgICAgICAgIHNlZ21lbnQsXG4gICAgICAgICAgcG9pbnQ7XG5cbiAgICAgIHJpbmcucG9wKCk7XG4gICAgICBwb2x5Z29uLnB1c2gocmluZyk7XG4gICAgICByaW5nID0gbnVsbDtcblxuICAgICAgaWYgKCFuKSByZXR1cm47XG5cbiAgICAgIC8vIE5vIGludGVyc2VjdGlvbnMuXG4gICAgICBpZiAoY2xlYW4gJiAxKSB7XG4gICAgICAgIHNlZ21lbnQgPSByaW5nU2VnbWVudHNbMF07XG4gICAgICAgIGlmICgobSA9IHNlZ21lbnQubGVuZ3RoIC0gMSkgPiAwKSB7XG4gICAgICAgICAgaWYgKCFwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uU3RhcnQoKSwgcG9seWdvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgIHNpbmsubGluZVN0YXJ0KCk7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IG07ICsraSkgc2luay5wb2ludCgocG9pbnQgPSBzZWdtZW50W2ldKVswXSwgcG9pbnRbMV0pO1xuICAgICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqb2luIGNvbm5lY3RlZCBzZWdtZW50cy5cbiAgICAgIC8vIFRPRE8gcmV1c2UgcmluZ0J1ZmZlci5yZWpvaW4oKT9cbiAgICAgIGlmIChuID4gMSAmJiBjbGVhbiAmIDIpIHJpbmdTZWdtZW50cy5wdXNoKHJpbmdTZWdtZW50cy5wb3AoKS5jb25jYXQocmluZ1NlZ21lbnRzLnNoaWZ0KCkpKTtcblxuICAgICAgc2VnbWVudHMucHVzaChyaW5nU2VnbWVudHMuZmlsdGVyKHZhbGlkU2VnbWVudCkpO1xuICAgIH1cblxuICAgIHJldHVybiBjbGlwO1xuICB9O1xufVxuXG5mdW5jdGlvbiB2YWxpZFNlZ21lbnQoc2VnbWVudCkge1xuICByZXR1cm4gc2VnbWVudC5sZW5ndGggPiAxO1xufVxuXG4vLyBJbnRlcnNlY3Rpb25zIGFyZSBzb3J0ZWQgYWxvbmcgdGhlIGNsaXAgZWRnZS4gRm9yIGJvdGggYW50aW1lcmlkaWFuIGN1dHRpbmdcbi8vIGFuZCBjaXJjbGUgY2xpcHBpbmcsIHRoZSBzYW1lIGNvbXBhcmlzb24gaXMgdXNlZC5cbmZ1bmN0aW9uIGNvbXBhcmVJbnRlcnNlY3Rpb24oYSwgYikge1xuICByZXR1cm4gKChhID0gYS54KVswXSA8IDAgPyBhWzFdIC0gaGFsZlBpIC0gZXBzaWxvbiA6IGhhbGZQaSAtIGFbMV0pXG4gICAgICAgLSAoKGIgPSBiLngpWzBdIDwgMCA/IGJbMV0gLSBoYWxmUGkgLSBlcHNpbG9uIDogaGFsZlBpIC0gYlsxXSk7XG59XG4iLCAiaW1wb3J0IGNsaXAgZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7YWJzLCBhdGFuLCBjb3MsIGVwc2lsb24sIGhhbGZQaSwgcGksIHNpbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xpcChcbiAgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlOyB9LFxuICBjbGlwQW50aW1lcmlkaWFuTGluZSxcbiAgY2xpcEFudGltZXJpZGlhbkludGVycG9sYXRlLFxuICBbLXBpLCAtaGFsZlBpXVxuKTtcblxuLy8gVGFrZXMgYSBsaW5lIGFuZCBjdXRzIGludG8gdmlzaWJsZSBzZWdtZW50cy4gUmV0dXJuIHZhbHVlczogMCAtIHRoZXJlIHdlcmVcbi8vIGludGVyc2VjdGlvbnMgb3IgdGhlIGxpbmUgd2FzIGVtcHR5OyAxIC0gbm8gaW50ZXJzZWN0aW9uczsgMiAtIHRoZXJlIHdlcmVcbi8vIGludGVyc2VjdGlvbnMsIGFuZCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHMgc2hvdWxkIGJlIHJlam9pbmVkLlxuZnVuY3Rpb24gY2xpcEFudGltZXJpZGlhbkxpbmUoc3RyZWFtKSB7XG4gIHZhciBsYW1iZGEwID0gTmFOLFxuICAgICAgcGhpMCA9IE5hTixcbiAgICAgIHNpZ24wID0gTmFOLFxuICAgICAgY2xlYW47IC8vIG5vIGludGVyc2VjdGlvbnNcblxuICByZXR1cm4ge1xuICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICBjbGVhbiA9IDE7XG4gICAgfSxcbiAgICBwb2ludDogZnVuY3Rpb24obGFtYmRhMSwgcGhpMSkge1xuICAgICAgdmFyIHNpZ24xID0gbGFtYmRhMSA+IDAgPyBwaSA6IC1waSxcbiAgICAgICAgICBkZWx0YSA9IGFicyhsYW1iZGExIC0gbGFtYmRhMCk7XG4gICAgICBpZiAoYWJzKGRlbHRhIC0gcGkpIDwgZXBzaWxvbikgeyAvLyBsaW5lIGNyb3NzZXMgYSBwb2xlXG4gICAgICAgIHN0cmVhbS5wb2ludChsYW1iZGEwLCBwaGkwID0gKHBoaTAgKyBwaGkxKSAvIDIgPiAwID8gaGFsZlBpIDogLWhhbGZQaSk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMCwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24xLCBwaGkwKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KGxhbWJkYTEsIHBoaTApO1xuICAgICAgICBjbGVhbiA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHNpZ24wICE9PSBzaWduMSAmJiBkZWx0YSA+PSBwaSkgeyAvLyBsaW5lIGNyb3NzZXMgYW50aW1lcmlkaWFuXG4gICAgICAgIGlmIChhYnMobGFtYmRhMCAtIHNpZ24wKSA8IGVwc2lsb24pIGxhbWJkYTAgLT0gc2lnbjAgKiBlcHNpbG9uOyAvLyBoYW5kbGUgZGVnZW5lcmFjaWVzXG4gICAgICAgIGlmIChhYnMobGFtYmRhMSAtIHNpZ24xKSA8IGVwc2lsb24pIGxhbWJkYTEgLT0gc2lnbjEgKiBlcHNpbG9uO1xuICAgICAgICBwaGkwID0gY2xpcEFudGltZXJpZGlhbkludGVyc2VjdChsYW1iZGEwLCBwaGkwLCBsYW1iZGExLCBwaGkxKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24wLCBwaGkwKTtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjEsIHBoaTApO1xuICAgICAgICBjbGVhbiA9IDA7XG4gICAgICB9XG4gICAgICBzdHJlYW0ucG9pbnQobGFtYmRhMCA9IGxhbWJkYTEsIHBoaTAgPSBwaGkxKTtcbiAgICAgIHNpZ24wID0gc2lnbjE7XG4gICAgfSxcbiAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICBsYW1iZGEwID0gcGhpMCA9IE5hTjtcbiAgICB9LFxuICAgIGNsZWFuOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAyIC0gY2xlYW47IC8vIGlmIGludGVyc2VjdGlvbnMsIHJlam9pbiBmaXJzdCBhbmQgbGFzdCBzZWdtZW50c1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xpcEFudGltZXJpZGlhbkludGVyc2VjdChsYW1iZGEwLCBwaGkwLCBsYW1iZGExLCBwaGkxKSB7XG4gIHZhciBjb3NQaGkwLFxuICAgICAgY29zUGhpMSxcbiAgICAgIHNpbkxhbWJkYTBMYW1iZGExID0gc2luKGxhbWJkYTAgLSBsYW1iZGExKTtcbiAgcmV0dXJuIGFicyhzaW5MYW1iZGEwTGFtYmRhMSkgPiBlcHNpbG9uXG4gICAgICA/IGF0YW4oKHNpbihwaGkwKSAqIChjb3NQaGkxID0gY29zKHBoaTEpKSAqIHNpbihsYW1iZGExKVxuICAgICAgICAgIC0gc2luKHBoaTEpICogKGNvc1BoaTAgPSBjb3MocGhpMCkpICogc2luKGxhbWJkYTApKVxuICAgICAgICAgIC8gKGNvc1BoaTAgKiBjb3NQaGkxICogc2luTGFtYmRhMExhbWJkYTEpKVxuICAgICAgOiAocGhpMCArIHBoaTEpIC8gMjtcbn1cblxuZnVuY3Rpb24gY2xpcEFudGltZXJpZGlhbkludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIHN0cmVhbSkge1xuICB2YXIgcGhpO1xuICBpZiAoZnJvbSA9PSBudWxsKSB7XG4gICAgcGhpID0gZGlyZWN0aW9uICogaGFsZlBpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KHBpLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludChwaSwgMCk7XG4gICAgc3RyZWFtLnBvaW50KHBpLCAtcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoMCwgLXBoaSk7XG4gICAgc3RyZWFtLnBvaW50KC1waSwgLXBoaSk7XG4gICAgc3RyZWFtLnBvaW50KC1waSwgMCk7XG4gICAgc3RyZWFtLnBvaW50KC1waSwgcGhpKTtcbiAgfSBlbHNlIGlmIChhYnMoZnJvbVswXSAtIHRvWzBdKSA+IGVwc2lsb24pIHtcbiAgICB2YXIgbGFtYmRhID0gZnJvbVswXSA8IHRvWzBdID8gcGkgOiAtcGk7XG4gICAgcGhpID0gZGlyZWN0aW9uICogbGFtYmRhIC8gMjtcbiAgICBzdHJlYW0ucG9pbnQoLWxhbWJkYSwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoMCwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQobGFtYmRhLCBwaGkpO1xuICB9IGVsc2Uge1xuICAgIHN0cmVhbS5wb2ludCh0b1swXSwgdG9bMV0pO1xuICB9XG59XG4iLCAiaW1wb3J0IHtjYXJ0ZXNpYW4sIGNhcnRlc2lhbkFkZEluUGxhY2UsIGNhcnRlc2lhbkNyb3NzLCBjYXJ0ZXNpYW5Eb3QsIGNhcnRlc2lhblNjYWxlLCBzcGhlcmljYWx9IGZyb20gXCIuLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCB7Y2lyY2xlU3RyZWFtfSBmcm9tIFwiLi4vY2lyY2xlLmpzXCI7XG5pbXBvcnQge2FicywgY29zLCBlcHNpbG9uLCBwaSwgcmFkaWFucywgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBwb2ludEVxdWFsIGZyb20gXCIuLi9wb2ludEVxdWFsLmpzXCI7XG5pbXBvcnQgY2xpcCBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihyYWRpdXMpIHtcbiAgdmFyIGNyID0gY29zKHJhZGl1cyksXG4gICAgICBkZWx0YSA9IDIgKiByYWRpYW5zLFxuICAgICAgc21hbGxSYWRpdXMgPSBjciA+IDAsXG4gICAgICBub3RIZW1pc3BoZXJlID0gYWJzKGNyKSA+IGVwc2lsb247IC8vIFRPRE8gb3B0aW1pc2UgZm9yIHRoaXMgY29tbW9uIGNhc2VcblxuICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShmcm9tLCB0bywgZGlyZWN0aW9uLCBzdHJlYW0pIHtcbiAgICBjaXJjbGVTdHJlYW0oc3RyZWFtLCByYWRpdXMsIGRlbHRhLCBkaXJlY3Rpb24sIGZyb20sIHRvKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZpc2libGUobGFtYmRhLCBwaGkpIHtcbiAgICByZXR1cm4gY29zKGxhbWJkYSkgKiBjb3MocGhpKSA+IGNyO1xuICB9XG5cbiAgLy8gVGFrZXMgYSBsaW5lIGFuZCBjdXRzIGludG8gdmlzaWJsZSBzZWdtZW50cy4gUmV0dXJuIHZhbHVlcyB1c2VkIGZvciBwb2x5Z29uXG4gIC8vIGNsaXBwaW5nOiAwIC0gdGhlcmUgd2VyZSBpbnRlcnNlY3Rpb25zIG9yIHRoZSBsaW5lIHdhcyBlbXB0eTsgMSAtIG5vXG4gIC8vIGludGVyc2VjdGlvbnMgMiAtIHRoZXJlIHdlcmUgaW50ZXJzZWN0aW9ucywgYW5kIHRoZSBmaXJzdCBhbmQgbGFzdCBzZWdtZW50c1xuICAvLyBzaG91bGQgYmUgcmVqb2luZWQuXG4gIGZ1bmN0aW9uIGNsaXBMaW5lKHN0cmVhbSkge1xuICAgIHZhciBwb2ludDAsIC8vIHByZXZpb3VzIHBvaW50XG4gICAgICAgIGMwLCAvLyBjb2RlIGZvciBwcmV2aW91cyBwb2ludFxuICAgICAgICB2MCwgLy8gdmlzaWJpbGl0eSBvZiBwcmV2aW91cyBwb2ludFxuICAgICAgICB2MDAsIC8vIHZpc2liaWxpdHkgb2YgZmlyc3QgcG9pbnRcbiAgICAgICAgY2xlYW47IC8vIG5vIGludGVyc2VjdGlvbnNcbiAgICByZXR1cm4ge1xuICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdjAwID0gdjAgPSBmYWxzZTtcbiAgICAgICAgY2xlYW4gPSAxO1xuICAgICAgfSxcbiAgICAgIHBvaW50OiBmdW5jdGlvbihsYW1iZGEsIHBoaSkge1xuICAgICAgICB2YXIgcG9pbnQxID0gW2xhbWJkYSwgcGhpXSxcbiAgICAgICAgICAgIHBvaW50MixcbiAgICAgICAgICAgIHYgPSB2aXNpYmxlKGxhbWJkYSwgcGhpKSxcbiAgICAgICAgICAgIGMgPSBzbWFsbFJhZGl1c1xuICAgICAgICAgICAgICA/IHYgPyAwIDogY29kZShsYW1iZGEsIHBoaSlcbiAgICAgICAgICAgICAgOiB2ID8gY29kZShsYW1iZGEgKyAobGFtYmRhIDwgMCA/IHBpIDogLXBpKSwgcGhpKSA6IDA7XG4gICAgICAgIGlmICghcG9pbnQwICYmICh2MDAgPSB2MCA9IHYpKSBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIGlmICh2ICE9PSB2MCkge1xuICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgaWYgKCFwb2ludDIgfHwgcG9pbnRFcXVhbChwb2ludDAsIHBvaW50MikgfHwgcG9pbnRFcXVhbChwb2ludDEsIHBvaW50MikpXG4gICAgICAgICAgICBwb2ludDFbMl0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2ICE9PSB2MCkge1xuICAgICAgICAgIGNsZWFuID0gMDtcbiAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgLy8gb3V0c2lkZSBnb2luZyBpblxuICAgICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgcG9pbnQyID0gaW50ZXJzZWN0KHBvaW50MSwgcG9pbnQwKTtcbiAgICAgICAgICAgIHN0cmVhbS5wb2ludChwb2ludDJbMF0sIHBvaW50MlsxXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGluc2lkZSBnb2luZyBvdXRcbiAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgICBzdHJlYW0ucG9pbnQocG9pbnQyWzBdLCBwb2ludDJbMV0sIDIpO1xuICAgICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9pbnQwID0gcG9pbnQyO1xuICAgICAgICB9IGVsc2UgaWYgKG5vdEhlbWlzcGhlcmUgJiYgcG9pbnQwICYmIHNtYWxsUmFkaXVzIF4gdikge1xuICAgICAgICAgIHZhciB0O1xuICAgICAgICAgIC8vIElmIHRoZSBjb2RlcyBmb3IgdHdvIHBvaW50cyBhcmUgZGlmZmVyZW50LCBvciBhcmUgYm90aCB6ZXJvLFxuICAgICAgICAgIC8vIGFuZCB0aGVyZSB0aGlzIHNlZ21lbnQgaW50ZXJzZWN0cyB3aXRoIHRoZSBzbWFsbCBjaXJjbGUuXG4gICAgICAgICAgaWYgKCEoYyAmIGMwKSAmJiAodCA9IGludGVyc2VjdChwb2ludDEsIHBvaW50MCwgdHJ1ZSkpKSB7XG4gICAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgICAgICBpZiAoc21hbGxSYWRpdXMpIHtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFswXVswXSwgdFswXVsxXSk7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzFdWzBdLCB0WzFdWzFdKTtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzFdWzBdLCB0WzFdWzFdKTtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFswXVswXSwgdFswXVsxXSwgMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2ICYmICghcG9pbnQwIHx8ICFwb2ludEVxdWFsKHBvaW50MCwgcG9pbnQxKSkpIHtcbiAgICAgICAgICBzdHJlYW0ucG9pbnQocG9pbnQxWzBdLCBwb2ludDFbMV0pO1xuICAgICAgICB9XG4gICAgICAgIHBvaW50MCA9IHBvaW50MSwgdjAgPSB2LCBjMCA9IGM7XG4gICAgICB9LFxuICAgICAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh2MCkgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgcG9pbnQwID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICAvLyBSZWpvaW4gZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHMgaWYgdGhlcmUgd2VyZSBpbnRlcnNlY3Rpb25zIGFuZCB0aGUgZmlyc3RcbiAgICAgIC8vIGFuZCBsYXN0IHBvaW50cyB3ZXJlIHZpc2libGUuXG4gICAgICBjbGVhbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjbGVhbiB8ICgodjAwICYmIHYwKSA8PCAxKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gSW50ZXJzZWN0cyB0aGUgZ3JlYXQgY2lyY2xlIGJldHdlZW4gYSBhbmQgYiB3aXRoIHRoZSBjbGlwIGNpcmNsZS5cbiAgZnVuY3Rpb24gaW50ZXJzZWN0KGEsIGIsIHR3bykge1xuICAgIHZhciBwYSA9IGNhcnRlc2lhbihhKSxcbiAgICAgICAgcGIgPSBjYXJ0ZXNpYW4oYik7XG5cbiAgICAvLyBXZSBoYXZlIHR3byBwbGFuZXMsIG4xLnAgPSBkMSBhbmQgbjIucCA9IGQyLlxuICAgIC8vIEZpbmQgaW50ZXJzZWN0aW9uIGxpbmUgcCh0KSA9IGMxIG4xICsgYzIgbjIgKyB0IChuMSBcdTJBMkYgbjIpLlxuICAgIHZhciBuMSA9IFsxLCAwLCAwXSwgLy8gbm9ybWFsXG4gICAgICAgIG4yID0gY2FydGVzaWFuQ3Jvc3MocGEsIHBiKSxcbiAgICAgICAgbjJuMiA9IGNhcnRlc2lhbkRvdChuMiwgbjIpLFxuICAgICAgICBuMW4yID0gbjJbMF0sIC8vIGNhcnRlc2lhbkRvdChuMSwgbjIpLFxuICAgICAgICBkZXRlcm1pbmFudCA9IG4ybjIgLSBuMW4yICogbjFuMjtcblxuICAgIC8vIFR3byBwb2xhciBwb2ludHMuXG4gICAgaWYgKCFkZXRlcm1pbmFudCkgcmV0dXJuICF0d28gJiYgYTtcblxuICAgIHZhciBjMSA9ICBjciAqIG4ybjIgLyBkZXRlcm1pbmFudCxcbiAgICAgICAgYzIgPSAtY3IgKiBuMW4yIC8gZGV0ZXJtaW5hbnQsXG4gICAgICAgIG4xeG4yID0gY2FydGVzaWFuQ3Jvc3MobjEsIG4yKSxcbiAgICAgICAgQSA9IGNhcnRlc2lhblNjYWxlKG4xLCBjMSksXG4gICAgICAgIEIgPSBjYXJ0ZXNpYW5TY2FsZShuMiwgYzIpO1xuICAgIGNhcnRlc2lhbkFkZEluUGxhY2UoQSwgQik7XG5cbiAgICAvLyBTb2x2ZSB8cCh0KXxeMiA9IDEuXG4gICAgdmFyIHUgPSBuMXhuMixcbiAgICAgICAgdyA9IGNhcnRlc2lhbkRvdChBLCB1KSxcbiAgICAgICAgdXUgPSBjYXJ0ZXNpYW5Eb3QodSwgdSksXG4gICAgICAgIHQyID0gdyAqIHcgLSB1dSAqIChjYXJ0ZXNpYW5Eb3QoQSwgQSkgLSAxKTtcblxuICAgIGlmICh0MiA8IDApIHJldHVybjtcblxuICAgIHZhciB0ID0gc3FydCh0MiksXG4gICAgICAgIHEgPSBjYXJ0ZXNpYW5TY2FsZSh1LCAoLXcgLSB0KSAvIHV1KTtcbiAgICBjYXJ0ZXNpYW5BZGRJblBsYWNlKHEsIEEpO1xuICAgIHEgPSBzcGhlcmljYWwocSk7XG5cbiAgICBpZiAoIXR3bykgcmV0dXJuIHE7XG5cbiAgICAvLyBUd28gaW50ZXJzZWN0aW9uIHBvaW50cy5cbiAgICB2YXIgbGFtYmRhMCA9IGFbMF0sXG4gICAgICAgIGxhbWJkYTEgPSBiWzBdLFxuICAgICAgICBwaGkwID0gYVsxXSxcbiAgICAgICAgcGhpMSA9IGJbMV0sXG4gICAgICAgIHo7XG5cbiAgICBpZiAobGFtYmRhMSA8IGxhbWJkYTApIHogPSBsYW1iZGEwLCBsYW1iZGEwID0gbGFtYmRhMSwgbGFtYmRhMSA9IHo7XG5cbiAgICB2YXIgZGVsdGEgPSBsYW1iZGExIC0gbGFtYmRhMCxcbiAgICAgICAgcG9sYXIgPSBhYnMoZGVsdGEgLSBwaSkgPCBlcHNpbG9uLFxuICAgICAgICBtZXJpZGlhbiA9IHBvbGFyIHx8IGRlbHRhIDwgZXBzaWxvbjtcblxuICAgIGlmICghcG9sYXIgJiYgcGhpMSA8IHBoaTApIHogPSBwaGkwLCBwaGkwID0gcGhpMSwgcGhpMSA9IHo7XG5cbiAgICAvLyBDaGVjayB0aGF0IHRoZSBmaXJzdCBwb2ludCBpcyBiZXR3ZWVuIGEgYW5kIGIuXG4gICAgaWYgKG1lcmlkaWFuXG4gICAgICAgID8gcG9sYXJcbiAgICAgICAgICA/IHBoaTAgKyBwaGkxID4gMCBeIHFbMV0gPCAoYWJzKHFbMF0gLSBsYW1iZGEwKSA8IGVwc2lsb24gPyBwaGkwIDogcGhpMSlcbiAgICAgICAgICA6IHBoaTAgPD0gcVsxXSAmJiBxWzFdIDw9IHBoaTFcbiAgICAgICAgOiBkZWx0YSA+IHBpIF4gKGxhbWJkYTAgPD0gcVswXSAmJiBxWzBdIDw9IGxhbWJkYTEpKSB7XG4gICAgICB2YXIgcTEgPSBjYXJ0ZXNpYW5TY2FsZSh1LCAoLXcgKyB0KSAvIHV1KTtcbiAgICAgIGNhcnRlc2lhbkFkZEluUGxhY2UocTEsIEEpO1xuICAgICAgcmV0dXJuIFtxLCBzcGhlcmljYWwocTEpXTtcbiAgICB9XG4gIH1cblxuICAvLyBHZW5lcmF0ZXMgYSA0LWJpdCB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhdGlvbiBvZiBhIHBvaW50IHJlbGF0aXZlIHRvXG4gIC8vIHRoZSBzbWFsbCBjaXJjbGUncyBib3VuZGluZyBib3guXG4gIGZ1bmN0aW9uIGNvZGUobGFtYmRhLCBwaGkpIHtcbiAgICB2YXIgciA9IHNtYWxsUmFkaXVzID8gcmFkaXVzIDogcGkgLSByYWRpdXMsXG4gICAgICAgIGNvZGUgPSAwO1xuICAgIGlmIChsYW1iZGEgPCAtcikgY29kZSB8PSAxOyAvLyBsZWZ0XG4gICAgZWxzZSBpZiAobGFtYmRhID4gcikgY29kZSB8PSAyOyAvLyByaWdodFxuICAgIGlmIChwaGkgPCAtcikgY29kZSB8PSA0OyAvLyBiZWxvd1xuICAgIGVsc2UgaWYgKHBoaSA+IHIpIGNvZGUgfD0gODsgLy8gYWJvdmVcbiAgICByZXR1cm4gY29kZTtcbiAgfVxuXG4gIHJldHVybiBjbGlwKHZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc21hbGxSYWRpdXMgPyBbMCwgLXJhZGl1c10gOiBbLXBpLCByYWRpdXMgLSBwaV0pO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIHgwLCB5MCwgeDEsIHkxKSB7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBieCA9IGJbMF0sXG4gICAgICBieSA9IGJbMV0sXG4gICAgICB0MCA9IDAsXG4gICAgICB0MSA9IDEsXG4gICAgICBkeCA9IGJ4IC0gYXgsXG4gICAgICBkeSA9IGJ5IC0gYXksXG4gICAgICByO1xuXG4gIHIgPSB4MCAtIGF4O1xuICBpZiAoIWR4ICYmIHIgPiAwKSByZXR1cm47XG4gIHIgLz0gZHg7XG4gIGlmIChkeCA8IDApIHtcbiAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICB9IGVsc2UgaWYgKGR4ID4gMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH1cblxuICByID0geDEgLSBheDtcbiAgaWYgKCFkeCAmJiByIDwgMCkgcmV0dXJuO1xuICByIC89IGR4O1xuICBpZiAoZHggPCAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfSBlbHNlIGlmIChkeCA+IDApIHtcbiAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICB9XG5cbiAgciA9IHkwIC0gYXk7XG4gIGlmICghZHkgJiYgciA+IDApIHJldHVybjtcbiAgciAvPSBkeTtcbiAgaWYgKGR5IDwgMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfVxuXG4gIHIgPSB5MSAtIGF5O1xuICBpZiAoIWR5ICYmIHIgPCAwKSByZXR1cm47XG4gIHIgLz0gZHk7XG4gIGlmIChkeSA8IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9IGVsc2UgaWYgKGR5ID4gMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH1cblxuICBpZiAodDAgPiAwKSBhWzBdID0gYXggKyB0MCAqIGR4LCBhWzFdID0gYXkgKyB0MCAqIGR5O1xuICBpZiAodDEgPCAxKSBiWzBdID0gYXggKyB0MSAqIGR4LCBiWzFdID0gYXkgKyB0MSAqIGR5O1xuICByZXR1cm4gdHJ1ZTtcbn1cbiIsICJpbXBvcnQge2FicywgZXBzaWxvbn0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBjbGlwQnVmZmVyIGZyb20gXCIuL2J1ZmZlci5qc1wiO1xuaW1wb3J0IGNsaXBMaW5lIGZyb20gXCIuL2xpbmUuanNcIjtcbmltcG9ydCBjbGlwUmVqb2luIGZyb20gXCIuL3Jlam9pbi5qc1wiO1xuaW1wb3J0IHttZXJnZX0gZnJvbSBcImQzLWFycmF5XCI7XG5cbnZhciBjbGlwTWF4ID0gMWU5LCBjbGlwTWluID0gLWNsaXBNYXg7XG5cbi8vIFRPRE8gVXNlIGQzLXBvbHlnb25cdTIwMTlzIHBvbHlnb25Db250YWlucyBoZXJlIGZvciB0aGUgcmluZyBjaGVjaz9cbi8vIFRPRE8gRWxpbWluYXRlIGR1cGxpY2F0ZSBidWZmZXJpbmcgaW4gY2xpcEJ1ZmZlciBhbmQgcG9seWdvbi5wdXNoP1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbGlwUmVjdGFuZ2xlKHgwLCB5MCwgeDEsIHkxKSB7XG5cbiAgZnVuY3Rpb24gdmlzaWJsZSh4LCB5KSB7XG4gICAgcmV0dXJuIHgwIDw9IHggJiYgeCA8PSB4MSAmJiB5MCA8PSB5ICYmIHkgPD0geTE7XG4gIH1cblxuICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShmcm9tLCB0bywgZGlyZWN0aW9uLCBzdHJlYW0pIHtcbiAgICB2YXIgYSA9IDAsIGExID0gMDtcbiAgICBpZiAoZnJvbSA9PSBudWxsXG4gICAgICAgIHx8IChhID0gY29ybmVyKGZyb20sIGRpcmVjdGlvbikpICE9PSAoYTEgPSBjb3JuZXIodG8sIGRpcmVjdGlvbikpXG4gICAgICAgIHx8IGNvbXBhcmVQb2ludChmcm9tLCB0bykgPCAwIF4gZGlyZWN0aW9uID4gMCkge1xuICAgICAgZG8gc3RyZWFtLnBvaW50KGEgPT09IDAgfHwgYSA9PT0gMyA/IHgwIDogeDEsIGEgPiAxID8geTEgOiB5MCk7XG4gICAgICB3aGlsZSAoKGEgPSAoYSArIGRpcmVjdGlvbiArIDQpICUgNCkgIT09IGExKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyZWFtLnBvaW50KHRvWzBdLCB0b1sxXSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29ybmVyKHAsIGRpcmVjdGlvbikge1xuICAgIHJldHVybiBhYnMocFswXSAtIHgwKSA8IGVwc2lsb24gPyBkaXJlY3Rpb24gPiAwID8gMCA6IDNcbiAgICAgICAgOiBhYnMocFswXSAtIHgxKSA8IGVwc2lsb24gPyBkaXJlY3Rpb24gPiAwID8gMiA6IDFcbiAgICAgICAgOiBhYnMocFsxXSAtIHkwKSA8IGVwc2lsb24gPyBkaXJlY3Rpb24gPiAwID8gMSA6IDBcbiAgICAgICAgOiBkaXJlY3Rpb24gPiAwID8gMyA6IDI7IC8vIGFicyhwWzFdIC0geTEpIDwgZXBzaWxvblxuICB9XG5cbiAgZnVuY3Rpb24gY29tcGFyZUludGVyc2VjdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGNvbXBhcmVQb2ludChhLngsIGIueCk7XG4gIH1cblxuICBmdW5jdGlvbiBjb21wYXJlUG9pbnQoYSwgYikge1xuICAgIHZhciBjYSA9IGNvcm5lcihhLCAxKSxcbiAgICAgICAgY2IgPSBjb3JuZXIoYiwgMSk7XG4gICAgcmV0dXJuIGNhICE9PSBjYiA/IGNhIC0gY2JcbiAgICAgICAgOiBjYSA9PT0gMCA/IGJbMV0gLSBhWzFdXG4gICAgICAgIDogY2EgPT09IDEgPyBhWzBdIC0gYlswXVxuICAgICAgICA6IGNhID09PSAyID8gYVsxXSAtIGJbMV1cbiAgICAgICAgOiBiWzBdIC0gYVswXTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgYWN0aXZlU3RyZWFtID0gc3RyZWFtLFxuICAgICAgICBidWZmZXJTdHJlYW0gPSBjbGlwQnVmZmVyKCksXG4gICAgICAgIHNlZ21lbnRzLFxuICAgICAgICBwb2x5Z29uLFxuICAgICAgICByaW5nLFxuICAgICAgICB4X18sIHlfXywgdl9fLCAvLyBmaXJzdCBwb2ludFxuICAgICAgICB4XywgeV8sIHZfLCAvLyBwcmV2aW91cyBwb2ludFxuICAgICAgICBmaXJzdCxcbiAgICAgICAgY2xlYW47XG5cbiAgICB2YXIgY2xpcFN0cmVhbSA9IHtcbiAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgbGluZUVuZDogbGluZUVuZCxcbiAgICAgIHBvbHlnb25TdGFydDogcG9seWdvblN0YXJ0LFxuICAgICAgcG9seWdvbkVuZDogcG9seWdvbkVuZFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgICBpZiAodmlzaWJsZSh4LCB5KSkgYWN0aXZlU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvbHlnb25JbnNpZGUoKSB7XG4gICAgICB2YXIgd2luZGluZyA9IDA7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gcG9seWdvbi5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgZm9yICh2YXIgcmluZyA9IHBvbHlnb25baV0sIGogPSAxLCBtID0gcmluZy5sZW5ndGgsIHBvaW50ID0gcmluZ1swXSwgYTAsIGExLCBiMCA9IHBvaW50WzBdLCBiMSA9IHBvaW50WzFdOyBqIDwgbTsgKytqKSB7XG4gICAgICAgICAgYTAgPSBiMCwgYTEgPSBiMSwgcG9pbnQgPSByaW5nW2pdLCBiMCA9IHBvaW50WzBdLCBiMSA9IHBvaW50WzFdO1xuICAgICAgICAgIGlmIChhMSA8PSB5MSkgeyBpZiAoYjEgPiB5MSAmJiAoYjAgLSBhMCkgKiAoeTEgLSBhMSkgPiAoYjEgLSBhMSkgKiAoeDAgLSBhMCkpICsrd2luZGluZzsgfVxuICAgICAgICAgIGVsc2UgeyBpZiAoYjEgPD0geTEgJiYgKGIwIC0gYTApICogKHkxIC0gYTEpIDwgKGIxIC0gYTEpICogKHgwIC0gYTApKSAtLXdpbmRpbmc7IH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gd2luZGluZztcbiAgICB9XG5cbiAgICAvLyBCdWZmZXIgZ2VvbWV0cnkgd2l0aGluIGEgcG9seWdvbiBhbmQgdGhlbiBjbGlwIGl0IGVuIG1hc3NlLlxuICAgIGZ1bmN0aW9uIHBvbHlnb25TdGFydCgpIHtcbiAgICAgIGFjdGl2ZVN0cmVhbSA9IGJ1ZmZlclN0cmVhbSwgc2VnbWVudHMgPSBbXSwgcG9seWdvbiA9IFtdLCBjbGVhbiA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9seWdvbkVuZCgpIHtcbiAgICAgIHZhciBzdGFydEluc2lkZSA9IHBvbHlnb25JbnNpZGUoKSxcbiAgICAgICAgICBjbGVhbkluc2lkZSA9IGNsZWFuICYmIHN0YXJ0SW5zaWRlLFxuICAgICAgICAgIHZpc2libGUgPSAoc2VnbWVudHMgPSBtZXJnZShzZWdtZW50cykpLmxlbmd0aDtcbiAgICAgIGlmIChjbGVhbkluc2lkZSB8fCB2aXNpYmxlKSB7XG4gICAgICAgIHN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgaWYgKGNsZWFuSW5zaWRlKSB7XG4gICAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGludGVycG9sYXRlKG51bGwsIG51bGwsIDEsIHN0cmVhbSk7XG4gICAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlzaWJsZSkge1xuICAgICAgICAgIGNsaXBSZWpvaW4oc2VnbWVudHMsIGNvbXBhcmVJbnRlcnNlY3Rpb24sIHN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0ucG9seWdvbkVuZCgpO1xuICAgICAgfVxuICAgICAgYWN0aXZlU3RyZWFtID0gc3RyZWFtLCBzZWdtZW50cyA9IHBvbHlnb24gPSByaW5nID0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICBjbGlwU3RyZWFtLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgaWYgKHBvbHlnb24pIHBvbHlnb24ucHVzaChyaW5nID0gW10pO1xuICAgICAgZmlyc3QgPSB0cnVlO1xuICAgICAgdl8gPSBmYWxzZTtcbiAgICAgIHhfID0geV8gPSBOYU47XG4gICAgfVxuXG4gICAgLy8gVE9ETyByYXRoZXIgdGhhbiBzcGVjaWFsLWNhc2UgcG9seWdvbnMsIHNpbXBseSBoYW5kbGUgdGhlbSBzZXBhcmF0ZWx5LlxuICAgIC8vIElkZWFsbHksIGNvaW5jaWRlbnQgaW50ZXJzZWN0aW9uIHBvaW50cyBzaG91bGQgYmUgaml0dGVyZWQgdG8gYXZvaWRcbiAgICAvLyBjbGlwcGluZyBpc3N1ZXMuXG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIGlmIChzZWdtZW50cykge1xuICAgICAgICBsaW5lUG9pbnQoeF9fLCB5X18pO1xuICAgICAgICBpZiAodl9fICYmIHZfKSBidWZmZXJTdHJlYW0ucmVqb2luKCk7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goYnVmZmVyU3RyZWFtLnJlc3VsdCgpKTtcbiAgICAgIH1cbiAgICAgIGNsaXBTdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICAgIGlmICh2XykgYWN0aXZlU3RyZWFtLmxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lUG9pbnQoeCwgeSkge1xuICAgICAgdmFyIHYgPSB2aXNpYmxlKHgsIHkpO1xuICAgICAgaWYgKHBvbHlnb24pIHJpbmcucHVzaChbeCwgeV0pO1xuICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgIHhfXyA9IHgsIHlfXyA9IHksIHZfXyA9IHY7XG4gICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgYWN0aXZlU3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHYgJiYgdl8pIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdmFyIGEgPSBbeF8gPSBNYXRoLm1heChjbGlwTWluLCBNYXRoLm1pbihjbGlwTWF4LCB4XykpLCB5XyA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHlfKSldLFxuICAgICAgICAgICAgICBiID0gW3ggPSBNYXRoLm1heChjbGlwTWluLCBNYXRoLm1pbihjbGlwTWF4LCB4KSksIHkgPSBNYXRoLm1heChjbGlwTWluLCBNYXRoLm1pbihjbGlwTWF4LCB5KSldO1xuICAgICAgICAgIGlmIChjbGlwTGluZShhLCBiLCB4MCwgeTAsIHgxLCB5MSkpIHtcbiAgICAgICAgICAgIGlmICghdl8pIHtcbiAgICAgICAgICAgICAgYWN0aXZlU3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoYVswXSwgYVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoYlswXSwgYlsxXSk7XG4gICAgICAgICAgICBpZiAoIXYpIGFjdGl2ZVN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgICBjbGVhbiA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAodikge1xuICAgICAgICAgICAgYWN0aXZlU3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICAgICAgY2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHhfID0geCwgeV8gPSB5LCB2XyA9IHY7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsaXBTdHJlYW07XG4gIH07XG59XG4iLCAiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2FicywgYXRhbjIsIGNvcywgcmFkaWFucywgc2luLCBzcXJ0fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi9ub29wLmpzXCI7XG5pbXBvcnQgc3RyZWFtIGZyb20gXCIuL3N0cmVhbS5qc1wiO1xuXG52YXIgbGVuZ3RoU3VtLFxuICAgIGxhbWJkYTAsXG4gICAgc2luUGhpMCxcbiAgICBjb3NQaGkwO1xuXG52YXIgbGVuZ3RoU3RyZWFtID0ge1xuICBzcGhlcmU6IG5vb3AsXG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IGxlbmd0aExpbmVTdGFydCxcbiAgbGluZUVuZDogbm9vcCxcbiAgcG9seWdvblN0YXJ0OiBub29wLFxuICBwb2x5Z29uRW5kOiBub29wXG59O1xuXG5mdW5jdGlvbiBsZW5ndGhMaW5lU3RhcnQoKSB7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50Rmlyc3Q7XG4gIGxlbmd0aFN0cmVhbS5saW5lRW5kID0gbGVuZ3RoTGluZUVuZDtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoTGluZUVuZCgpIHtcbiAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoU3RyZWFtLmxpbmVFbmQgPSBub29wO1xufVxuXG5mdW5jdGlvbiBsZW5ndGhQb2ludEZpcnN0KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgbGFtYmRhMCA9IGxhbWJkYSwgc2luUGhpMCA9IHNpbihwaGkpLCBjb3NQaGkwID0gY29zKHBoaSk7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50O1xufVxuXG5mdW5jdGlvbiBsZW5ndGhQb2ludChsYW1iZGEsIHBoaSkge1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIHZhciBzaW5QaGkgPSBzaW4ocGhpKSxcbiAgICAgIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgZGVsdGEgPSBhYnMobGFtYmRhIC0gbGFtYmRhMCksXG4gICAgICBjb3NEZWx0YSA9IGNvcyhkZWx0YSksXG4gICAgICBzaW5EZWx0YSA9IHNpbihkZWx0YSksXG4gICAgICB4ID0gY29zUGhpICogc2luRGVsdGEsXG4gICAgICB5ID0gY29zUGhpMCAqIHNpblBoaSAtIHNpblBoaTAgKiBjb3NQaGkgKiBjb3NEZWx0YSxcbiAgICAgIHogPSBzaW5QaGkwICogc2luUGhpICsgY29zUGhpMCAqIGNvc1BoaSAqIGNvc0RlbHRhO1xuICBsZW5ndGhTdW0uYWRkKGF0YW4yKHNxcnQoeCAqIHggKyB5ICogeSksIHopKTtcbiAgbGFtYmRhMCA9IGxhbWJkYSwgc2luUGhpMCA9IHNpblBoaSwgY29zUGhpMCA9IGNvc1BoaTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGxlbmd0aFN1bSA9IG5ldyBBZGRlcigpO1xuICBzdHJlYW0ob2JqZWN0LCBsZW5ndGhTdHJlYW0pO1xuICByZXR1cm4gK2xlbmd0aFN1bTtcbn1cbiIsICJpbXBvcnQgbGVuZ3RoIGZyb20gXCIuL2xlbmd0aC5qc1wiO1xuXG52YXIgY29vcmRpbmF0ZXMgPSBbbnVsbCwgbnVsbF0sXG4gICAgb2JqZWN0ID0ge3R5cGU6IFwiTGluZVN0cmluZ1wiLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIGNvb3JkaW5hdGVzWzBdID0gYTtcbiAgY29vcmRpbmF0ZXNbMV0gPSBiO1xuICByZXR1cm4gbGVuZ3RoKG9iamVjdCk7XG59XG4iLCAiaW1wb3J0IHtyYW5nZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2FicywgY2VpbCwgZXBzaWxvbn0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBncmF0aWN1bGVYKHkwLCB5MSwgZHkpIHtcbiAgdmFyIHkgPSByYW5nZSh5MCwgeTEgLSBlcHNpbG9uLCBkeSkuY29uY2F0KHkxKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHkubWFwKGZ1bmN0aW9uKHkpIHsgcmV0dXJuIFt4LCB5XTsgfSk7IH07XG59XG5cbmZ1bmN0aW9uIGdyYXRpY3VsZVkoeDAsIHgxLCBkeCkge1xuICB2YXIgeCA9IHJhbmdlKHgwLCB4MSAtIGVwc2lsb24sIGR4KS5jb25jYXQoeDEpO1xuICByZXR1cm4gZnVuY3Rpb24oeSkgeyByZXR1cm4geC5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4gW3gsIHldOyB9KTsgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ3JhdGljdWxlKCkge1xuICB2YXIgeDEsIHgwLCBYMSwgWDAsXG4gICAgICB5MSwgeTAsIFkxLCBZMCxcbiAgICAgIGR4ID0gMTAsIGR5ID0gZHgsIERYID0gOTAsIERZID0gMzYwLFxuICAgICAgeCwgeSwgWCwgWSxcbiAgICAgIHByZWNpc2lvbiA9IDIuNTtcblxuICBmdW5jdGlvbiBncmF0aWN1bGUoKSB7XG4gICAgcmV0dXJuIHt0eXBlOiBcIk11bHRpTGluZVN0cmluZ1wiLCBjb29yZGluYXRlczogbGluZXMoKX07XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lcygpIHtcbiAgICByZXR1cm4gcmFuZ2UoY2VpbChYMCAvIERYKSAqIERYLCBYMSwgRFgpLm1hcChYKVxuICAgICAgICAuY29uY2F0KHJhbmdlKGNlaWwoWTAgLyBEWSkgKiBEWSwgWTEsIERZKS5tYXAoWSkpXG4gICAgICAgIC5jb25jYXQocmFuZ2UoY2VpbCh4MCAvIGR4KSAqIGR4LCB4MSwgZHgpLmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiBhYnMoeCAlIERYKSA+IGVwc2lsb247IH0pLm1hcCh4KSlcbiAgICAgICAgLmNvbmNhdChyYW5nZShjZWlsKHkwIC8gZHkpICogZHksIHkxLCBkeSkuZmlsdGVyKGZ1bmN0aW9uKHkpIHsgcmV0dXJuIGFicyh5ICUgRFkpID4gZXBzaWxvbjsgfSkubWFwKHkpKTtcbiAgfVxuXG4gIGdyYXRpY3VsZS5saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBsaW5lcygpLm1hcChmdW5jdGlvbihjb29yZGluYXRlcykgeyByZXR1cm4ge3R5cGU6IFwiTGluZVN0cmluZ1wiLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9OyB9KTtcbiAgfTtcblxuICBncmF0aWN1bGUub3V0bGluZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcIlBvbHlnb25cIixcbiAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgIFgoWDApLmNvbmNhdChcbiAgICAgICAgWShZMSkuc2xpY2UoMSksXG4gICAgICAgIFgoWDEpLnJldmVyc2UoKS5zbGljZSgxKSxcbiAgICAgICAgWShZMCkucmV2ZXJzZSgpLnNsaWNlKDEpKVxuICAgICAgXVxuICAgIH07XG4gIH07XG5cbiAgZ3JhdGljdWxlLmV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBncmF0aWN1bGUuZXh0ZW50TWlub3IoKTtcbiAgICByZXR1cm4gZ3JhdGljdWxlLmV4dGVudE1ham9yKF8pLmV4dGVudE1pbm9yKF8pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5leHRlbnRNYWpvciA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbW1gwLCBZMF0sIFtYMSwgWTFdXTtcbiAgICBYMCA9ICtfWzBdWzBdLCBYMSA9ICtfWzFdWzBdO1xuICAgIFkwID0gK19bMF1bMV0sIFkxID0gK19bMV1bMV07XG4gICAgaWYgKFgwID4gWDEpIF8gPSBYMCwgWDAgPSBYMSwgWDEgPSBfO1xuICAgIGlmIChZMCA+IFkxKSBfID0gWTAsIFkwID0gWTEsIFkxID0gXztcbiAgICByZXR1cm4gZ3JhdGljdWxlLnByZWNpc2lvbihwcmVjaXNpb24pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5leHRlbnRNaW5vciA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgICB4MCA9ICtfWzBdWzBdLCB4MSA9ICtfWzFdWzBdO1xuICAgIHkwID0gK19bMF1bMV0sIHkxID0gK19bMV1bMV07XG4gICAgaWYgKHgwID4geDEpIF8gPSB4MCwgeDAgPSB4MSwgeDEgPSBfO1xuICAgIGlmICh5MCA+IHkxKSBfID0geTAsIHkwID0geTEsIHkxID0gXztcbiAgICByZXR1cm4gZ3JhdGljdWxlLnByZWNpc2lvbihwcmVjaXNpb24pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGdyYXRpY3VsZS5zdGVwTWlub3IoKTtcbiAgICByZXR1cm4gZ3JhdGljdWxlLnN0ZXBNYWpvcihfKS5zdGVwTWlub3IoXyk7XG4gIH07XG5cbiAgZ3JhdGljdWxlLnN0ZXBNYWpvciA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbRFgsIERZXTtcbiAgICBEWCA9ICtfWzBdLCBEWSA9ICtfWzFdO1xuICAgIHJldHVybiBncmF0aWN1bGU7XG4gIH07XG5cbiAgZ3JhdGljdWxlLnN0ZXBNaW5vciA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbZHgsIGR5XTtcbiAgICBkeCA9ICtfWzBdLCBkeSA9ICtfWzFdO1xuICAgIHJldHVybiBncmF0aWN1bGU7XG4gIH07XG5cbiAgZ3JhdGljdWxlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwcmVjaXNpb247XG4gICAgcHJlY2lzaW9uID0gK187XG4gICAgeCA9IGdyYXRpY3VsZVgoeTAsIHkxLCA5MCk7XG4gICAgeSA9IGdyYXRpY3VsZVkoeDAsIHgxLCBwcmVjaXNpb24pO1xuICAgIFggPSBncmF0aWN1bGVYKFkwLCBZMSwgOTApO1xuICAgIFkgPSBncmF0aWN1bGVZKFgwLCBYMSwgcHJlY2lzaW9uKTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIHJldHVybiBncmF0aWN1bGVcbiAgICAgIC5leHRlbnRNYWpvcihbWy0xODAsIC05MCArIGVwc2lsb25dLCBbMTgwLCA5MCAtIGVwc2lsb25dXSlcbiAgICAgIC5leHRlbnRNaW5vcihbWy0xODAsIC04MCAtIGVwc2lsb25dLCBbMTgwLCA4MCArIGVwc2lsb25dXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBncmF0aWN1bGUxMCgpIHtcbiAgcmV0dXJuIGdyYXRpY3VsZSgpKCk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgeCA9PiB4O1xuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnN9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG52YXIgYXJlYVN1bSA9IG5ldyBBZGRlcigpLFxuICAgIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCksXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGFyZWFTdHJlYW0gPSB7XG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IG5vb3AsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgYXJlYVN0cmVhbS5saW5lU3RhcnQgPSBhcmVhUmluZ1N0YXJ0O1xuICAgIGFyZWFTdHJlYW0ubGluZUVuZCA9IGFyZWFSaW5nRW5kO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3RyZWFtLmxpbmVTdGFydCA9IGFyZWFTdHJlYW0ubGluZUVuZCA9IGFyZWFTdHJlYW0ucG9pbnQgPSBub29wO1xuICAgIGFyZWFTdW0uYWRkKGFicyhhcmVhUmluZ1N1bSkpO1xuICAgIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCk7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZWEgPSBhcmVhU3VtIC8gMjtcbiAgICBhcmVhU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgcmV0dXJuIGFyZWE7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGFyZWFSaW5nU3RhcnQoKSB7XG4gIGFyZWFTdHJlYW0ucG9pbnQgPSBhcmVhUG9pbnRGaXJzdDtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50Rmlyc3QoeCwgeSkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50O1xuICB4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geTtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50KHgsIHkpIHtcbiAgYXJlYVJpbmdTdW0uYWRkKHkwICogeCAtIHgwICogeSk7XG4gIHgwID0geCwgeTAgPSB5O1xufVxuXG5mdW5jdGlvbiBhcmVhUmluZ0VuZCgpIHtcbiAgYXJlYVBvaW50KHgwMCwgeTAwKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJlYVN0cmVhbTtcbiIsICJpbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG52YXIgeDAgPSBJbmZpbml0eSxcbiAgICB5MCA9IHgwLFxuICAgIHgxID0gLXgwLFxuICAgIHkxID0geDE7XG5cbnZhciBib3VuZHNTdHJlYW0gPSB7XG4gIHBvaW50OiBib3VuZHNQb2ludCxcbiAgbGluZVN0YXJ0OiBub29wLFxuICBsaW5lRW5kOiBub29wLFxuICBwb2x5Z29uU3RhcnQ6IG5vb3AsXG4gIHBvbHlnb25FbmQ6IG5vb3AsXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvdW5kcyA9IFtbeDAsIHkwXSwgW3gxLCB5MV1dO1xuICAgIHgxID0geTEgPSAtKHkwID0geDAgPSBJbmZpbml0eSk7XG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfVxufTtcblxuZnVuY3Rpb24gYm91bmRzUG9pbnQoeCwgeSkge1xuICBpZiAoeCA8IHgwKSB4MCA9IHg7XG4gIGlmICh4ID4geDEpIHgxID0geDtcbiAgaWYgKHkgPCB5MCkgeTAgPSB5O1xuICBpZiAoeSA+IHkxKSB5MSA9IHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJvdW5kc1N0cmVhbTtcbiIsICJpbXBvcnQge3NxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbi8vIFRPRE8gRW5mb3JjZSBwb3NpdGl2ZSBhcmVhIGZvciBleHRlcmlvciwgbmVnYXRpdmUgYXJlYSBmb3IgaW50ZXJpb3I/XG5cbnZhciBYMCA9IDAsXG4gICAgWTAgPSAwLFxuICAgIFowID0gMCxcbiAgICBYMSA9IDAsXG4gICAgWTEgPSAwLFxuICAgIFoxID0gMCxcbiAgICBYMiA9IDAsXG4gICAgWTIgPSAwLFxuICAgIFoyID0gMCxcbiAgICB4MDAsXG4gICAgeTAwLFxuICAgIHgwLFxuICAgIHkwO1xuXG52YXIgY2VudHJvaWRTdHJlYW0gPSB7XG4gIHBvaW50OiBjZW50cm9pZFBvaW50LFxuICBsaW5lU3RhcnQ6IGNlbnRyb2lkTGluZVN0YXJ0LFxuICBsaW5lRW5kOiBjZW50cm9pZExpbmVFbmQsXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgY2VudHJvaWRTdHJlYW0ubGluZVN0YXJ0ID0gY2VudHJvaWRSaW5nU3RhcnQ7XG4gICAgY2VudHJvaWRTdHJlYW0ubGluZUVuZCA9IGNlbnRyb2lkUmluZ0VuZDtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVTdGFydCA9IGNlbnRyb2lkTGluZVN0YXJ0O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVFbmQgPSBjZW50cm9pZExpbmVFbmQ7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNlbnRyb2lkID0gWjIgPyBbWDIgLyBaMiwgWTIgLyBaMl1cbiAgICAgICAgOiBaMSA/IFtYMSAvIFoxLCBZMSAvIFoxXVxuICAgICAgICA6IFowID8gW1gwIC8gWjAsIFkwIC8gWjBdXG4gICAgICAgIDogW05hTiwgTmFOXTtcbiAgICBYMCA9IFkwID0gWjAgPVxuICAgIFgxID0gWTEgPSBaMSA9XG4gICAgWDIgPSBZMiA9IFoyID0gMDtcbiAgICByZXR1cm4gY2VudHJvaWQ7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnQoeCwgeSkge1xuICBYMCArPSB4O1xuICBZMCArPSB5O1xuICArK1owO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZExpbmVTdGFydCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50Rmlyc3RMaW5lO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50Rmlyc3RMaW5lKHgsIHkpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50TGluZTtcbiAgY2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRMaW5lKHgsIHkpIHtcbiAgdmFyIGR4ID0geCAtIHgwLCBkeSA9IHkgLSB5MCwgeiA9IHNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICBYMSArPSB6ICogKHgwICsgeCkgLyAyO1xuICBZMSArPSB6ICogKHkwICsgeSkgLyAyO1xuICBaMSArPSB6O1xuICBjZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRMaW5lRW5kKCkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnQ7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUmluZ1N0YXJ0KCkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRGaXJzdFJpbmc7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUmluZ0VuZCgpIHtcbiAgY2VudHJvaWRQb2ludFJpbmcoeDAwLCB5MDApO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50Rmlyc3RSaW5nKHgsIHkpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50UmluZztcbiAgY2VudHJvaWRQb2ludCh4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geSk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRSaW5nKHgsIHkpIHtcbiAgdmFyIGR4ID0geCAtIHgwLFxuICAgICAgZHkgPSB5IC0geTAsXG4gICAgICB6ID0gc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgWDEgKz0geiAqICh4MCArIHgpIC8gMjtcbiAgWTEgKz0geiAqICh5MCArIHkpIC8gMjtcbiAgWjEgKz0gejtcblxuICB6ID0geTAgKiB4IC0geDAgKiB5O1xuICBYMiArPSB6ICogKHgwICsgeCk7XG4gIFkyICs9IHogKiAoeTAgKyB5KTtcbiAgWjIgKz0geiAqIDM7XG4gIGNlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjZW50cm9pZFN0cmVhbTtcbiIsICJpbXBvcnQge3RhdX0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBhdGhDb250ZXh0KGNvbnRleHQpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59XG5cblBhdGhDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgX3JhZGl1czogNC41LFxuICBwb2ludFJhZGl1czogZnVuY3Rpb24oXykge1xuICAgIHJldHVybiB0aGlzLl9yYWRpdXMgPSBfLCB0aGlzO1xuICB9LFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgPT09IDApIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fcG9pbnQgPSBOYU47XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8oeCArIHRoaXMuX3JhZGl1cywgeSk7XG4gICAgICAgIHRoaXMuX2NvbnRleHQuYXJjKHgsIHksIHRoaXMuX3JhZGl1cywgMCwgdGF1KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXN1bHQ6IG5vb3Bcbn07XG4iLCAiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge3NxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG52YXIgbGVuZ3RoU3VtID0gbmV3IEFkZGVyKCksXG4gICAgbGVuZ3RoUmluZyxcbiAgICB4MDAsXG4gICAgeTAwLFxuICAgIHgwLFxuICAgIHkwO1xuXG52YXIgbGVuZ3RoU3RyZWFtID0ge1xuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhQb2ludEZpcnN0O1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAobGVuZ3RoUmluZykgbGVuZ3RoUG9pbnQoeDAwLCB5MDApO1xuICAgIGxlbmd0aFN0cmVhbS5wb2ludCA9IG5vb3A7XG4gIH0sXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgbGVuZ3RoUmluZyA9IHRydWU7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGxlbmd0aFJpbmcgPSBudWxsO1xuICB9LFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSArbGVuZ3RoU3VtO1xuICAgIGxlbmd0aFN1bSA9IG5ldyBBZGRlcigpO1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGxlbmd0aFBvaW50Rmlyc3QoeCwgeSkge1xuICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhQb2ludDtcbiAgeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHk7XG59XG5cbmZ1bmN0aW9uIGxlbmd0aFBvaW50KHgsIHkpIHtcbiAgeDAgLT0geCwgeTAgLT0geTtcbiAgbGVuZ3RoU3VtLmFkZChzcXJ0KHgwICogeDAgKyB5MCAqIHkwKSk7XG4gIHgwID0geCwgeTAgPSB5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBsZW5ndGhTdHJlYW07XG4iLCAiLy8gU2ltcGxlIGNhY2hpbmcgZm9yIGNvbnN0YW50LXJhZGl1cyBwb2ludHMuXG5sZXQgY2FjaGVEaWdpdHMsIGNhY2hlQXBwZW5kLCBjYWNoZVJhZGl1cywgY2FjaGVDaXJjbGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhTdHJpbmcge1xuICBjb25zdHJ1Y3RvcihkaWdpdHMpIHtcbiAgICB0aGlzLl9hcHBlbmQgPSBkaWdpdHMgPT0gbnVsbCA/IGFwcGVuZCA6IGFwcGVuZFJvdW5kKGRpZ2l0cyk7XG4gICAgdGhpcy5fcmFkaXVzID0gNC41O1xuICAgIHRoaXMuXyA9IFwiXCI7XG4gIH1cbiAgcG9pbnRSYWRpdXMoXykge1xuICAgIHRoaXMuX3JhZGl1cyA9ICtfO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHBvbHlnb25TdGFydCgpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfVxuICBwb2x5Z29uRW5kKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH1cbiAgbGluZVN0YXJ0KCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfVxuICBsaW5lRW5kKCkge1xuICAgIGlmICh0aGlzLl9saW5lID09PSAwKSB0aGlzLl8gKz0gXCJaXCI7XG4gICAgdGhpcy5fcG9pbnQgPSBOYU47XG4gIH1cbiAgcG9pbnQoeCwgeSkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICB0aGlzLl9hcHBlbmRgTSR7eH0sJHt5fWA7XG4gICAgICAgIHRoaXMuX3BvaW50ID0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgdGhpcy5fYXBwZW5kYEwke3h9LCR7eX1gO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgdGhpcy5fYXBwZW5kYE0ke3h9LCR7eX1gO1xuICAgICAgICBpZiAodGhpcy5fcmFkaXVzICE9PSBjYWNoZVJhZGl1cyB8fCB0aGlzLl9hcHBlbmQgIT09IGNhY2hlQXBwZW5kKSB7XG4gICAgICAgICAgY29uc3QgciA9IHRoaXMuX3JhZGl1cztcbiAgICAgICAgICBjb25zdCBzID0gdGhpcy5fO1xuICAgICAgICAgIHRoaXMuXyA9IFwiXCI7IC8vIHN0YXNoIHRoZSBvbGQgc3RyaW5nIHNvIHdlIGNhbiBjYWNoZSB0aGUgY2lyY2xlIHBhdGggZnJhZ21lbnRcbiAgICAgICAgICB0aGlzLl9hcHBlbmRgbTAsJHtyfWEke3J9LCR7cn0gMCAxLDEgMCwkey0yICogcn1hJHtyfSwke3J9IDAgMSwxIDAsJHsyICogcn16YDtcbiAgICAgICAgICBjYWNoZVJhZGl1cyA9IHI7XG4gICAgICAgICAgY2FjaGVBcHBlbmQgPSB0aGlzLl9hcHBlbmQ7XG4gICAgICAgICAgY2FjaGVDaXJjbGUgPSB0aGlzLl87XG4gICAgICAgICAgdGhpcy5fID0gcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8gKz0gY2FjaGVDaXJjbGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXN1bHQoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fO1xuICAgIHRoaXMuXyA9IFwiXCI7XG4gICAgcmV0dXJuIHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZChzdHJpbmdzKSB7XG4gIGxldCBpID0gMTtcbiAgdGhpcy5fICs9IHN0cmluZ3NbMF07XG4gIGZvciAoY29uc3QgaiA9IHN0cmluZ3MubGVuZ3RoOyBpIDwgajsgKytpKSB7XG4gICAgdGhpcy5fICs9IGFyZ3VtZW50c1tpXSArIHN0cmluZ3NbaV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwZW5kUm91bmQoZGlnaXRzKSB7XG4gIGNvbnN0IGQgPSBNYXRoLmZsb29yKGRpZ2l0cyk7XG4gIGlmICghKGQgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbnZhbGlkIGRpZ2l0czogJHtkaWdpdHN9YCk7XG4gIGlmIChkID4gMTUpIHJldHVybiBhcHBlbmQ7XG4gIGlmIChkICE9PSBjYWNoZURpZ2l0cykge1xuICAgIGNvbnN0IGsgPSAxMCAqKiBkO1xuICAgIGNhY2hlRGlnaXRzID0gZDtcbiAgICBjYWNoZUFwcGVuZCA9IGZ1bmN0aW9uIGFwcGVuZChzdHJpbmdzKSB7XG4gICAgICBsZXQgaSA9IDE7XG4gICAgICB0aGlzLl8gKz0gc3RyaW5nc1swXTtcbiAgICAgIGZvciAoY29uc3QgaiA9IHN0cmluZ3MubGVuZ3RoOyBpIDwgajsgKytpKSB7XG4gICAgICAgIHRoaXMuXyArPSBNYXRoLnJvdW5kKGFyZ3VtZW50c1tpXSAqIGspIC8gayArIHN0cmluZ3NbaV07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gY2FjaGVBcHBlbmQ7XG59XG4iLCAiaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuLi9pZGVudGl0eS5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi4vc3RyZWFtLmpzXCI7XG5pbXBvcnQgcGF0aEFyZWEgZnJvbSBcIi4vYXJlYS5qc1wiO1xuaW1wb3J0IHBhdGhCb3VuZHMgZnJvbSBcIi4vYm91bmRzLmpzXCI7XG5pbXBvcnQgcGF0aENlbnRyb2lkIGZyb20gXCIuL2NlbnRyb2lkLmpzXCI7XG5pbXBvcnQgUGF0aENvbnRleHQgZnJvbSBcIi4vY29udGV4dC5qc1wiO1xuaW1wb3J0IHBhdGhNZWFzdXJlIGZyb20gXCIuL21lYXN1cmUuanNcIjtcbmltcG9ydCBQYXRoU3RyaW5nIGZyb20gXCIuL3N0cmluZy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwcm9qZWN0aW9uLCBjb250ZXh0KSB7XG4gIGxldCBkaWdpdHMgPSAzLFxuICAgICAgcG9pbnRSYWRpdXMgPSA0LjUsXG4gICAgICBwcm9qZWN0aW9uU3RyZWFtLFxuICAgICAgY29udGV4dFN0cmVhbTtcblxuICBmdW5jdGlvbiBwYXRoKG9iamVjdCkge1xuICAgIGlmIChvYmplY3QpIHtcbiAgICAgIGlmICh0eXBlb2YgcG9pbnRSYWRpdXMgPT09IFwiZnVuY3Rpb25cIikgY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cygrcG9pbnRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKGNvbnRleHRTdHJlYW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHRTdHJlYW0ucmVzdWx0KCk7XG4gIH1cblxuICBwYXRoLmFyZWEgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhBcmVhKSk7XG4gICAgcmV0dXJuIHBhdGhBcmVhLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGgubWVhc3VyZSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aE1lYXN1cmUpKTtcbiAgICByZXR1cm4gcGF0aE1lYXN1cmUucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5ib3VuZHMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhCb3VuZHMpKTtcbiAgICByZXR1cm4gcGF0aEJvdW5kcy5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLmNlbnRyb2lkID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoQ2VudHJvaWQpKTtcbiAgICByZXR1cm4gcGF0aENlbnRyb2lkLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGgucHJvamVjdGlvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwcm9qZWN0aW9uO1xuICAgIHByb2plY3Rpb25TdHJlYW0gPSBfID09IG51bGwgPyAocHJvamVjdGlvbiA9IG51bGwsIGlkZW50aXR5KSA6IChwcm9qZWN0aW9uID0gXykuc3RyZWFtO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHBhdGguY29udGV4dCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb250ZXh0O1xuICAgIGNvbnRleHRTdHJlYW0gPSBfID09IG51bGwgPyAoY29udGV4dCA9IG51bGwsIG5ldyBQYXRoU3RyaW5nKGRpZ2l0cykpIDogbmV3IFBhdGhDb250ZXh0KGNvbnRleHQgPSBfKTtcbiAgICBpZiAodHlwZW9mIHBvaW50UmFkaXVzICE9PSBcImZ1bmN0aW9uXCIpIGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMocG9pbnRSYWRpdXMpO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHBhdGgucG9pbnRSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcG9pbnRSYWRpdXM7XG4gICAgcG9pbnRSYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IChjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKCtfKSwgK18pO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHBhdGguZGlnaXRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRpZ2l0cztcbiAgICBpZiAoXyA9PSBudWxsKSBkaWdpdHMgPSBudWxsO1xuICAgIGVsc2Uge1xuICAgICAgY29uc3QgZCA9IE1hdGguZmxvb3IoXyk7XG4gICAgICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7X31gKTtcbiAgICAgIGRpZ2l0cyA9IGQ7XG4gICAgfVxuICAgIGlmIChjb250ZXh0ID09PSBudWxsKSBjb250ZXh0U3RyZWFtID0gbmV3IFBhdGhTdHJpbmcoZGlnaXRzKTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICByZXR1cm4gcGF0aC5wcm9qZWN0aW9uKHByb2plY3Rpb24pLmRpZ2l0cyhkaWdpdHMpLmNvbnRleHQoY29udGV4dCk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWV0aG9kcykge1xuICByZXR1cm4ge1xuICAgIHN0cmVhbTogdHJhbnNmb3JtZXIobWV0aG9kcylcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKG1ldGhvZHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBzID0gbmV3IFRyYW5zZm9ybVN0cmVhbTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWV0aG9kcykgc1trZXldID0gbWV0aG9kc1trZXldO1xuICAgIHMuc3RyZWFtID0gc3RyZWFtO1xuICAgIHJldHVybiBzO1xuICB9O1xufVxuXG5mdW5jdGlvbiBUcmFuc2Zvcm1TdHJlYW0oKSB7fVxuXG5UcmFuc2Zvcm1TdHJlYW0ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNmb3JtU3RyZWFtLFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkgeyB0aGlzLnN0cmVhbS5wb2ludCh4LCB5KTsgfSxcbiAgc3BoZXJlOiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0uc3BoZXJlKCk7IH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLmxpbmVTdGFydCgpOyB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ubGluZUVuZCgpOyB9LFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5wb2x5Z29uU3RhcnQoKTsgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLnBvbHlnb25FbmQoKTsgfVxufTtcbiIsICJpbXBvcnQge2RlZmF1bHQgYXMgZ2VvU3RyZWFtfSBmcm9tIFwiLi4vc3RyZWFtLmpzXCI7XG5pbXBvcnQgYm91bmRzU3RyZWFtIGZyb20gXCIuLi9wYXRoL2JvdW5kcy5qc1wiO1xuXG5mdW5jdGlvbiBmaXQocHJvamVjdGlvbiwgZml0Qm91bmRzLCBvYmplY3QpIHtcbiAgdmFyIGNsaXAgPSBwcm9qZWN0aW9uLmNsaXBFeHRlbnQgJiYgcHJvamVjdGlvbi5jbGlwRXh0ZW50KCk7XG4gIHByb2plY3Rpb24uc2NhbGUoMTUwKS50cmFuc2xhdGUoWzAsIDBdKTtcbiAgaWYgKGNsaXAgIT0gbnVsbCkgcHJvamVjdGlvbi5jbGlwRXh0ZW50KG51bGwpO1xuICBnZW9TdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uLnN0cmVhbShib3VuZHNTdHJlYW0pKTtcbiAgZml0Qm91bmRzKGJvdW5kc1N0cmVhbS5yZXN1bHQoKSk7XG4gIGlmIChjbGlwICE9IG51bGwpIHByb2plY3Rpb24uY2xpcEV4dGVudChjbGlwKTtcbiAgcmV0dXJuIHByb2plY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRFeHRlbnQocHJvamVjdGlvbiwgZXh0ZW50LCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdChwcm9qZWN0aW9uLCBmdW5jdGlvbihiKSB7XG4gICAgdmFyIHcgPSBleHRlbnRbMV1bMF0gLSBleHRlbnRbMF1bMF0sXG4gICAgICAgIGggPSBleHRlbnRbMV1bMV0gLSBleHRlbnRbMF1bMV0sXG4gICAgICAgIGsgPSBNYXRoLm1pbih3IC8gKGJbMV1bMF0gLSBiWzBdWzBdKSwgaCAvIChiWzFdWzFdIC0gYlswXVsxXSkpLFxuICAgICAgICB4ID0gK2V4dGVudFswXVswXSArICh3IC0gayAqIChiWzFdWzBdICsgYlswXVswXSkpIC8gMixcbiAgICAgICAgeSA9ICtleHRlbnRbMF1bMV0gKyAoaCAtIGsgKiAoYlsxXVsxXSArIGJbMF1bMV0pKSAvIDI7XG4gICAgcHJvamVjdGlvbi5zY2FsZSgxNTAgKiBrKS50cmFuc2xhdGUoW3gsIHldKTtcbiAgfSwgb2JqZWN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdFNpemUocHJvamVjdGlvbiwgc2l6ZSwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXRFeHRlbnQocHJvamVjdGlvbiwgW1swLCAwXSwgc2l6ZV0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRXaWR0aChwcm9qZWN0aW9uLCB3aWR0aCwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXQocHJvamVjdGlvbiwgZnVuY3Rpb24oYikge1xuICAgIHZhciB3ID0gK3dpZHRoLFxuICAgICAgICBrID0gdyAvIChiWzFdWzBdIC0gYlswXVswXSksXG4gICAgICAgIHggPSAodyAtIGsgKiAoYlsxXVswXSArIGJbMF1bMF0pKSAvIDIsXG4gICAgICAgIHkgPSAtayAqIGJbMF1bMV07XG4gICAgcHJvamVjdGlvbi5zY2FsZSgxNTAgKiBrKS50cmFuc2xhdGUoW3gsIHldKTtcbiAgfSwgb2JqZWN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdEhlaWdodChwcm9qZWN0aW9uLCBoZWlnaHQsIG9iamVjdCkge1xuICByZXR1cm4gZml0KHByb2plY3Rpb24sIGZ1bmN0aW9uKGIpIHtcbiAgICB2YXIgaCA9ICtoZWlnaHQsXG4gICAgICAgIGsgPSBoIC8gKGJbMV1bMV0gLSBiWzBdWzFdKSxcbiAgICAgICAgeCA9IC1rICogYlswXVswXSxcbiAgICAgICAgeSA9IChoIC0gayAqIChiWzFdWzFdICsgYlswXVsxXSkpIC8gMjtcbiAgICBwcm9qZWN0aW9uLnNjYWxlKDE1MCAqIGspLnRyYW5zbGF0ZShbeCwgeV0pO1xuICB9LCBvYmplY3QpO1xufVxuIiwgImltcG9ydCB7Y2FydGVzaWFufSBmcm9tIFwiLi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgcmFkaWFucywgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7dHJhbnNmb3JtZXJ9IGZyb20gXCIuLi90cmFuc2Zvcm0uanNcIjtcblxudmFyIG1heERlcHRoID0gMTYsIC8vIG1heGltdW0gZGVwdGggb2Ygc3ViZGl2aXNpb25cbiAgICBjb3NNaW5EaXN0YW5jZSA9IGNvcygzMCAqIHJhZGlhbnMpOyAvLyBjb3MobWluaW11bSBhbmd1bGFyIGRpc3RhbmNlKVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwcm9qZWN0LCBkZWx0YTIpIHtcbiAgcmV0dXJuICtkZWx0YTIgPyByZXNhbXBsZShwcm9qZWN0LCBkZWx0YTIpIDogcmVzYW1wbGVOb25lKHByb2plY3QpO1xufVxuXG5mdW5jdGlvbiByZXNhbXBsZU5vbmUocHJvamVjdCkge1xuICByZXR1cm4gdHJhbnNmb3JtZXIoe1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB4ID0gcHJvamVjdCh4LCB5KTtcbiAgICAgIHRoaXMuc3RyZWFtLnBvaW50KHhbMF0sIHhbMV0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlc2FtcGxlKHByb2plY3QsIGRlbHRhMikge1xuXG4gIGZ1bmN0aW9uIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDEsIHkxLCBsYW1iZGExLCBhMSwgYjEsIGMxLCBkZXB0aCwgc3RyZWFtKSB7XG4gICAgdmFyIGR4ID0geDEgLSB4MCxcbiAgICAgICAgZHkgPSB5MSAtIHkwLFxuICAgICAgICBkMiA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgIGlmIChkMiA+IDQgKiBkZWx0YTIgJiYgZGVwdGgtLSkge1xuICAgICAgdmFyIGEgPSBhMCArIGExLFxuICAgICAgICAgIGIgPSBiMCArIGIxLFxuICAgICAgICAgIGMgPSBjMCArIGMxLFxuICAgICAgICAgIG0gPSBzcXJ0KGEgKiBhICsgYiAqIGIgKyBjICogYyksXG4gICAgICAgICAgcGhpMiA9IGFzaW4oYyAvPSBtKSxcbiAgICAgICAgICBsYW1iZGEyID0gYWJzKGFicyhjKSAtIDEpIDwgZXBzaWxvbiB8fCBhYnMobGFtYmRhMCAtIGxhbWJkYTEpIDwgZXBzaWxvbiA/IChsYW1iZGEwICsgbGFtYmRhMSkgLyAyIDogYXRhbjIoYiwgYSksXG4gICAgICAgICAgcCA9IHByb2plY3QobGFtYmRhMiwgcGhpMiksXG4gICAgICAgICAgeDIgPSBwWzBdLFxuICAgICAgICAgIHkyID0gcFsxXSxcbiAgICAgICAgICBkeDIgPSB4MiAtIHgwLFxuICAgICAgICAgIGR5MiA9IHkyIC0geTAsXG4gICAgICAgICAgZHogPSBkeSAqIGR4MiAtIGR4ICogZHkyO1xuICAgICAgaWYgKGR6ICogZHogLyBkMiA+IGRlbHRhMiAvLyBwZXJwZW5kaWN1bGFyIHByb2plY3RlZCBkaXN0YW5jZVxuICAgICAgICAgIHx8IGFicygoZHggKiBkeDIgKyBkeSAqIGR5MikgLyBkMiAtIDAuNSkgPiAwLjMgLy8gbWlkcG9pbnQgY2xvc2UgdG8gYW4gZW5kXG4gICAgICAgICAgfHwgYTAgKiBhMSArIGIwICogYjEgKyBjMCAqIGMxIDwgY29zTWluRGlzdGFuY2UpIHsgLy8gYW5ndWxhciBkaXN0YW5jZVxuICAgICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgyLCB5MiwgbGFtYmRhMiwgYSAvPSBtLCBiIC89IG0sIGMsIGRlcHRoLCBzdHJlYW0pO1xuICAgICAgICBzdHJlYW0ucG9pbnQoeDIsIHkyKTtcbiAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDIsIHkyLCBsYW1iZGEyLCBhLCBiLCBjLCB4MSwgeTEsIGxhbWJkYTEsIGExLCBiMSwgYzEsIGRlcHRoLCBzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIGxhbWJkYTAwLCB4MDAsIHkwMCwgYTAwLCBiMDAsIGMwMCwgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgbGFtYmRhMCwgeDAsIHkwLCBhMCwgYjAsIGMwOyAvLyBwcmV2aW91cyBwb2ludFxuXG4gICAgdmFyIHJlc2FtcGxlU3RyZWFtID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHsgc3RyZWFtLnBvbHlnb25TdGFydCgpOyByZXNhbXBsZVN0cmVhbS5saW5lU3RhcnQgPSByaW5nU3RhcnQ7IH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgc3RyZWFtLnBvbHlnb25FbmQoKTsgcmVzYW1wbGVTdHJlYW0ubGluZVN0YXJ0ID0gbGluZVN0YXJ0OyB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgIHggPSBwcm9qZWN0KHgsIHkpO1xuICAgICAgc3RyZWFtLnBvaW50KHhbMF0sIHhbMV0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIHgwID0gTmFOO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVBvaW50KGxhbWJkYSwgcGhpKSB7XG4gICAgICB2YXIgYyA9IGNhcnRlc2lhbihbbGFtYmRhLCBwaGldKSwgcCA9IHByb2plY3QobGFtYmRhLCBwaGkpO1xuICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MCA9IHBbMF0sIHkwID0gcFsxXSwgbGFtYmRhMCA9IGxhbWJkYSwgYTAgPSBjWzBdLCBiMCA9IGNbMV0sIGMwID0gY1syXSwgbWF4RGVwdGgsIHN0cmVhbSk7XG4gICAgICBzdHJlYW0ucG9pbnQoeDAsIHkwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ1N0YXJ0KCkge1xuICAgICAgbGluZVN0YXJ0KCk7XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IHJpbmdQb2ludDtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLmxpbmVFbmQgPSByaW5nRW5kO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdQb2ludChsYW1iZGEsIHBoaSkge1xuICAgICAgbGluZVBvaW50KGxhbWJkYTAwID0gbGFtYmRhLCBwaGkpLCB4MDAgPSB4MCwgeTAwID0geTAsIGEwMCA9IGEwLCBiMDAgPSBiMCwgYzAwID0gYzA7XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nRW5kKCkge1xuICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MDAsIHkwMCwgbGFtYmRhMDAsIGEwMCwgYjAwLCBjMDAsIG1heERlcHRoLCBzdHJlYW0pO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ubGluZUVuZCA9IGxpbmVFbmQ7XG4gICAgICBsaW5lRW5kKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc2FtcGxlU3RyZWFtO1xuICB9O1xufVxuIiwgImltcG9ydCBjbGlwQW50aW1lcmlkaWFuIGZyb20gXCIuLi9jbGlwL2FudGltZXJpZGlhbi5qc1wiO1xuaW1wb3J0IGNsaXBDaXJjbGUgZnJvbSBcIi4uL2NsaXAvY2lyY2xlLmpzXCI7XG5pbXBvcnQgY2xpcFJlY3RhbmdsZSBmcm9tIFwiLi4vY2xpcC9yZWN0YW5nbGUuanNcIjtcbmltcG9ydCBjb21wb3NlIGZyb20gXCIuLi9jb21wb3NlLmpzXCI7XG5pbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4uL2lkZW50aXR5LmpzXCI7XG5pbXBvcnQge2NvcywgZGVncmVlcywgcmFkaWFucywgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtyb3RhdGVSYWRpYW5zfSBmcm9tIFwiLi4vcm90YXRpb24uanNcIjtcbmltcG9ydCB7dHJhbnNmb3JtZXJ9IGZyb20gXCIuLi90cmFuc2Zvcm0uanNcIjtcbmltcG9ydCB7Zml0RXh0ZW50LCBmaXRTaXplLCBmaXRXaWR0aCwgZml0SGVpZ2h0fSBmcm9tIFwiLi9maXQuanNcIjtcbmltcG9ydCByZXNhbXBsZSBmcm9tIFwiLi9yZXNhbXBsZS5qc1wiO1xuXG52YXIgdHJhbnNmb3JtUmFkaWFucyA9IHRyYW5zZm9ybWVyKHtcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB0aGlzLnN0cmVhbS5wb2ludCh4ICogcmFkaWFucywgeSAqIHJhZGlhbnMpO1xuICB9XG59KTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtUm90YXRlKHJvdGF0ZSkge1xuICByZXR1cm4gdHJhbnNmb3JtZXIoe1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgciA9IHJvdGF0ZSh4LCB5KTtcbiAgICAgIHJldHVybiB0aGlzLnN0cmVhbS5wb2ludChyWzBdLCByWzFdKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzY2FsZVRyYW5zbGF0ZShrLCBkeCwgZHksIHN4LCBzeSkge1xuICBmdW5jdGlvbiB0cmFuc2Zvcm0oeCwgeSkge1xuICAgIHggKj0gc3g7IHkgKj0gc3k7XG4gICAgcmV0dXJuIFtkeCArIGsgKiB4LCBkeSAtIGsgKiB5XTtcbiAgfVxuICB0cmFuc2Zvcm0uaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiBbKHggLSBkeCkgLyBrICogc3gsIChkeSAtIHkpIC8gayAqIHN5XTtcbiAgfTtcbiAgcmV0dXJuIHRyYW5zZm9ybTtcbn1cblxuZnVuY3Rpb24gc2NhbGVUcmFuc2xhdGVSb3RhdGUoaywgZHgsIGR5LCBzeCwgc3ksIGFscGhhKSB7XG4gIGlmICghYWxwaGEpIHJldHVybiBzY2FsZVRyYW5zbGF0ZShrLCBkeCwgZHksIHN4LCBzeSk7XG4gIHZhciBjb3NBbHBoYSA9IGNvcyhhbHBoYSksXG4gICAgICBzaW5BbHBoYSA9IHNpbihhbHBoYSksXG4gICAgICBhID0gY29zQWxwaGEgKiBrLFxuICAgICAgYiA9IHNpbkFscGhhICogayxcbiAgICAgIGFpID0gY29zQWxwaGEgLyBrLFxuICAgICAgYmkgPSBzaW5BbHBoYSAvIGssXG4gICAgICBjaSA9IChzaW5BbHBoYSAqIGR5IC0gY29zQWxwaGEgKiBkeCkgLyBrLFxuICAgICAgZmkgPSAoc2luQWxwaGEgKiBkeCArIGNvc0FscGhhICogZHkpIC8gaztcbiAgZnVuY3Rpb24gdHJhbnNmb3JtKHgsIHkpIHtcbiAgICB4ICo9IHN4OyB5ICo9IHN5O1xuICAgIHJldHVybiBbYSAqIHggLSBiICogeSArIGR4LCBkeSAtIGIgKiB4IC0gYSAqIHldO1xuICB9XG4gIHRyYW5zZm9ybS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFtzeCAqIChhaSAqIHggLSBiaSAqIHkgKyBjaSksIHN5ICogKGZpIC0gYmkgKiB4IC0gYWkgKiB5KV07XG4gIH07XG4gIHJldHVybiB0cmFuc2Zvcm07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByb2plY3Rpb24ocHJvamVjdCkge1xuICByZXR1cm4gcHJvamVjdGlvbk11dGF0b3IoZnVuY3Rpb24oKSB7IHJldHVybiBwcm9qZWN0OyB9KSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdGlvbk11dGF0b3IocHJvamVjdEF0KSB7XG4gIHZhciBwcm9qZWN0LFxuICAgICAgayA9IDE1MCwgLy8gc2NhbGVcbiAgICAgIHggPSA0ODAsIHkgPSAyNTAsIC8vIHRyYW5zbGF0ZVxuICAgICAgbGFtYmRhID0gMCwgcGhpID0gMCwgLy8gY2VudGVyXG4gICAgICBkZWx0YUxhbWJkYSA9IDAsIGRlbHRhUGhpID0gMCwgZGVsdGFHYW1tYSA9IDAsIHJvdGF0ZSwgLy8gcHJlLXJvdGF0ZVxuICAgICAgYWxwaGEgPSAwLCAvLyBwb3N0LXJvdGF0ZSBhbmdsZVxuICAgICAgc3ggPSAxLCAvLyByZWZsZWN0WFxuICAgICAgc3kgPSAxLCAvLyByZWZsZWN0WFxuICAgICAgdGhldGEgPSBudWxsLCBwcmVjbGlwID0gY2xpcEFudGltZXJpZGlhbiwgLy8gcHJlLWNsaXAgYW5nbGVcbiAgICAgIHgwID0gbnVsbCwgeTAsIHgxLCB5MSwgcG9zdGNsaXAgPSBpZGVudGl0eSwgLy8gcG9zdC1jbGlwIGV4dGVudFxuICAgICAgZGVsdGEyID0gMC41LCAvLyBwcmVjaXNpb25cbiAgICAgIHByb2plY3RSZXNhbXBsZSxcbiAgICAgIHByb2plY3RUcmFuc2Zvcm0sXG4gICAgICBwcm9qZWN0Um90YXRlVHJhbnNmb3JtLFxuICAgICAgY2FjaGUsXG4gICAgICBjYWNoZVN0cmVhbTtcblxuICBmdW5jdGlvbiBwcm9qZWN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0ocG9pbnRbMF0gKiByYWRpYW5zLCBwb2ludFsxXSAqIHJhZGlhbnMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52ZXJ0KHBvaW50KSB7XG4gICAgcG9pbnQgPSBwcm9qZWN0Um90YXRlVHJhbnNmb3JtLmludmVydChwb2ludFswXSwgcG9pbnRbMV0pO1xuICAgIHJldHVybiBwb2ludCAmJiBbcG9pbnRbMF0gKiBkZWdyZWVzLCBwb2ludFsxXSAqIGRlZ3JlZXNdO1xuICB9XG5cbiAgcHJvamVjdGlvbi5zdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICByZXR1cm4gY2FjaGUgJiYgY2FjaGVTdHJlYW0gPT09IHN0cmVhbSA/IGNhY2hlIDogY2FjaGUgPSB0cmFuc2Zvcm1SYWRpYW5zKHRyYW5zZm9ybVJvdGF0ZShyb3RhdGUpKHByZWNsaXAocHJvamVjdFJlc2FtcGxlKHBvc3RjbGlwKGNhY2hlU3RyZWFtID0gc3RyZWFtKSkpKSk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5wcmVjbGlwID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByZWNsaXAgPSBfLCB0aGV0YSA9IHVuZGVmaW5lZCwgcmVzZXQoKSkgOiBwcmVjbGlwO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucG9zdGNsaXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocG9zdGNsaXAgPSBfLCB4MCA9IHkwID0geDEgPSB5MSA9IG51bGwsIHJlc2V0KCkpIDogcG9zdGNsaXA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5jbGlwQW5nbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJlY2xpcCA9ICtfID8gY2xpcENpcmNsZSh0aGV0YSA9IF8gKiByYWRpYW5zKSA6ICh0aGV0YSA9IG51bGwsIGNsaXBBbnRpbWVyaWRpYW4pLCByZXNldCgpKSA6IHRoZXRhICogZGVncmVlcztcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNsaXBFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocG9zdGNsaXAgPSBfID09IG51bGwgPyAoeDAgPSB5MCA9IHgxID0geTEgPSBudWxsLCBpZGVudGl0eSkgOiBjbGlwUmVjdGFuZ2xlKHgwID0gK19bMF1bMF0sIHkwID0gK19bMF1bMV0sIHgxID0gK19bMV1bMF0sIHkxID0gK19bMV1bMV0pLCByZXNldCgpKSA6IHgwID09IG51bGwgPyBudWxsIDogW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gIH07XG5cbiAgcHJvamVjdGlvbi5zY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChrID0gK18sIHJlY2VudGVyKCkpIDogaztcbiAgfTtcblxuICBwcm9qZWN0aW9uLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh4ID0gK19bMF0sIHkgPSArX1sxXSwgcmVjZW50ZXIoKSkgOiBbeCwgeV07XG4gIH07XG5cbiAgcHJvamVjdGlvbi5jZW50ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAobGFtYmRhID0gX1swXSAlIDM2MCAqIHJhZGlhbnMsIHBoaSA9IF9bMV0gJSAzNjAgKiByYWRpYW5zLCByZWNlbnRlcigpKSA6IFtsYW1iZGEgKiBkZWdyZWVzLCBwaGkgKiBkZWdyZWVzXTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnJvdGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkZWx0YUxhbWJkYSA9IF9bMF0gJSAzNjAgKiByYWRpYW5zLCBkZWx0YVBoaSA9IF9bMV0gJSAzNjAgKiByYWRpYW5zLCBkZWx0YUdhbW1hID0gXy5sZW5ndGggPiAyID8gX1syXSAlIDM2MCAqIHJhZGlhbnMgOiAwLCByZWNlbnRlcigpKSA6IFtkZWx0YUxhbWJkYSAqIGRlZ3JlZXMsIGRlbHRhUGhpICogZGVncmVlcywgZGVsdGFHYW1tYSAqIGRlZ3JlZXNdO1xuICB9O1xuXG4gIHByb2plY3Rpb24uYW5nbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoYWxwaGEgPSBfICUgMzYwICogcmFkaWFucywgcmVjZW50ZXIoKSkgOiBhbHBoYSAqIGRlZ3JlZXM7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5yZWZsZWN0WCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzeCA9IF8gPyAtMSA6IDEsIHJlY2VudGVyKCkpIDogc3ggPCAwO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucmVmbGVjdFkgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3kgPSBfID8gLTEgOiAxLCByZWNlbnRlcigpKSA6IHN5IDwgMDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcm9qZWN0UmVzYW1wbGUgPSByZXNhbXBsZShwcm9qZWN0VHJhbnNmb3JtLCBkZWx0YTIgPSBfICogXyksIHJlc2V0KCkpIDogc3FydChkZWx0YTIpO1xuICB9O1xuXG4gIHByb2plY3Rpb24uZml0RXh0ZW50ID0gZnVuY3Rpb24oZXh0ZW50LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0RXh0ZW50KHByb2plY3Rpb24sIGV4dGVudCwgb2JqZWN0KTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdFNpemUgPSBmdW5jdGlvbihzaXplLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0U2l6ZShwcm9qZWN0aW9uLCBzaXplLCBvYmplY3QpO1xuICB9O1xuXG4gIHByb2plY3Rpb24uZml0V2lkdGggPSBmdW5jdGlvbih3aWR0aCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFdpZHRoKHByb2plY3Rpb24sIHdpZHRoLCBvYmplY3QpO1xuICB9O1xuXG4gIHByb2plY3Rpb24uZml0SGVpZ2h0ID0gZnVuY3Rpb24oaGVpZ2h0LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0SGVpZ2h0KHByb2plY3Rpb24sIGhlaWdodCwgb2JqZWN0KTtcbiAgfTtcblxuICBmdW5jdGlvbiByZWNlbnRlcigpIHtcbiAgICB2YXIgY2VudGVyID0gc2NhbGVUcmFuc2xhdGVSb3RhdGUoaywgMCwgMCwgc3gsIHN5LCBhbHBoYSkuYXBwbHkobnVsbCwgcHJvamVjdChsYW1iZGEsIHBoaSkpLFxuICAgICAgICB0cmFuc2Zvcm0gPSBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCB4IC0gY2VudGVyWzBdLCB5IC0gY2VudGVyWzFdLCBzeCwgc3ksIGFscGhhKTtcbiAgICByb3RhdGUgPSByb3RhdGVSYWRpYW5zKGRlbHRhTGFtYmRhLCBkZWx0YVBoaSwgZGVsdGFHYW1tYSk7XG4gICAgcHJvamVjdFRyYW5zZm9ybSA9IGNvbXBvc2UocHJvamVjdCwgdHJhbnNmb3JtKTtcbiAgICBwcm9qZWN0Um90YXRlVHJhbnNmb3JtID0gY29tcG9zZShyb3RhdGUsIHByb2plY3RUcmFuc2Zvcm0pO1xuICAgIHByb2plY3RSZXNhbXBsZSA9IHJlc2FtcGxlKHByb2plY3RUcmFuc2Zvcm0sIGRlbHRhMik7XG4gICAgcmV0dXJuIHJlc2V0KCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBjYWNoZSA9IGNhY2hlU3RyZWFtID0gbnVsbDtcbiAgICByZXR1cm4gcHJvamVjdGlvbjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBwcm9qZWN0ID0gcHJvamVjdEF0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcHJvamVjdGlvbi5pbnZlcnQgPSBwcm9qZWN0LmludmVydCAmJiBpbnZlcnQ7XG4gICAgcmV0dXJuIHJlY2VudGVyKCk7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtkZWdyZWVzLCBwaSwgcmFkaWFuc30gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7cHJvamVjdGlvbk11dGF0b3J9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25pY1Byb2plY3Rpb24ocHJvamVjdEF0KSB7XG4gIHZhciBwaGkwID0gMCxcbiAgICAgIHBoaTEgPSBwaSAvIDMsXG4gICAgICBtID0gcHJvamVjdGlvbk11dGF0b3IocHJvamVjdEF0KSxcbiAgICAgIHAgPSBtKHBoaTAsIHBoaTEpO1xuXG4gIHAucGFyYWxsZWxzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gbShwaGkwID0gX1swXSAqIHJhZGlhbnMsIHBoaTEgPSBfWzFdICogcmFkaWFucykgOiBbcGhpMCAqIGRlZ3JlZXMsIHBoaTEgKiBkZWdyZWVzXTtcbiAgfTtcblxuICByZXR1cm4gcDtcbn1cbiIsICJpbXBvcnQge2FzaW4sIGNvcywgc2lufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3lsaW5kcmljYWxFcXVhbEFyZWFSYXcocGhpMCkge1xuICB2YXIgY29zUGhpMCA9IGNvcyhwaGkwKTtcblxuICBmdW5jdGlvbiBmb3J3YXJkKGxhbWJkYSwgcGhpKSB7XG4gICAgcmV0dXJuIFtsYW1iZGEgKiBjb3NQaGkwLCBzaW4ocGhpKSAvIGNvc1BoaTBdO1xuICB9XG5cbiAgZm9yd2FyZC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFt4IC8gY29zUGhpMCwgYXNpbih5ICogY29zUGhpMCldO1xuICB9O1xuXG4gIHJldHVybiBmb3J3YXJkO1xufVxuIiwgImltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBlcHNpbG9uLCBwaSwgc2lnbiwgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtjb25pY1Byb2plY3Rpb259IGZyb20gXCIuL2NvbmljLmpzXCI7XG5pbXBvcnQge2N5bGluZHJpY2FsRXF1YWxBcmVhUmF3fSBmcm9tIFwiLi9jeWxpbmRyaWNhbEVxdWFsQXJlYS5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uaWNFcXVhbEFyZWFSYXcoeTAsIHkxKSB7XG4gIHZhciBzeTAgPSBzaW4oeTApLCBuID0gKHN5MCArIHNpbih5MSkpIC8gMjtcblxuICAvLyBBcmUgdGhlIHBhcmFsbGVscyBzeW1tZXRyaWNhbCBhcm91bmQgdGhlIEVxdWF0b3I/XG4gIGlmIChhYnMobikgPCBlcHNpbG9uKSByZXR1cm4gY3lsaW5kcmljYWxFcXVhbEFyZWFSYXcoeTApO1xuXG4gIHZhciBjID0gMSArIHN5MCAqICgyICogbiAtIHN5MCksIHIwID0gc3FydChjKSAvIG47XG5cbiAgZnVuY3Rpb24gcHJvamVjdCh4LCB5KSB7XG4gICAgdmFyIHIgPSBzcXJ0KGMgLSAyICogbiAqIHNpbih5KSkgLyBuO1xuICAgIHJldHVybiBbciAqIHNpbih4ICo9IG4pLCByMCAtIHIgKiBjb3MoeCldO1xuICB9XG5cbiAgcHJvamVjdC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIHIweSA9IHIwIC0geSxcbiAgICAgICAgbCA9IGF0YW4yKHgsIGFicyhyMHkpKSAqIHNpZ24ocjB5KTtcbiAgICBpZiAocjB5ICogbiA8IDApXG4gICAgICBsIC09IHBpICogc2lnbih4KSAqIHNpZ24ocjB5KTtcbiAgICByZXR1cm4gW2wgLyBuLCBhc2luKChjIC0gKHggKiB4ICsgcjB5ICogcjB5KSAqIG4gKiBuKSAvICgyICogbikpXTtcbiAgfTtcblxuICByZXR1cm4gcHJvamVjdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBjb25pY1Byb2plY3Rpb24oY29uaWNFcXVhbEFyZWFSYXcpXG4gICAgICAuc2NhbGUoMTU1LjQyNClcbiAgICAgIC5jZW50ZXIoWzAsIDMzLjY0NDJdKTtcbn1cbiIsICJpbXBvcnQgY29uaWNFcXVhbEFyZWEgZnJvbSBcIi4vY29uaWNFcXVhbEFyZWEuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBjb25pY0VxdWFsQXJlYSgpXG4gICAgICAucGFyYWxsZWxzKFsyOS41LCA0NS41XSlcbiAgICAgIC5zY2FsZSgxMDcwKVxuICAgICAgLnRyYW5zbGF0ZShbNDgwLCAyNTBdKVxuICAgICAgLnJvdGF0ZShbOTYsIDBdKVxuICAgICAgLmNlbnRlcihbLTAuNiwgMzguN10pO1xufVxuIiwgImltcG9ydCB7ZXBzaWxvbn0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBhbGJlcnMgZnJvbSBcIi4vYWxiZXJzLmpzXCI7XG5pbXBvcnQgY29uaWNFcXVhbEFyZWEgZnJvbSBcIi4vY29uaWNFcXVhbEFyZWEuanNcIjtcbmltcG9ydCB7Zml0RXh0ZW50LCBmaXRTaXplLCBmaXRXaWR0aCwgZml0SGVpZ2h0fSBmcm9tIFwiLi9maXQuanNcIjtcblxuLy8gVGhlIHByb2plY3Rpb25zIG11c3QgaGF2ZSBtdXR1YWxseSBleGNsdXNpdmUgY2xpcCByZWdpb25zIG9uIHRoZSBzcGhlcmUsXG4vLyBhcyB0aGlzIHdpbGwgYXZvaWQgZW1pdHRpbmcgaW50ZXJsZWF2aW5nIGxpbmVzIGFuZCBwb2x5Z29ucy5cbmZ1bmN0aW9uIG11bHRpcGxleChzdHJlYW1zKSB7XG4gIHZhciBuID0gc3RyZWFtcy5sZW5ndGg7XG4gIHJldHVybiB7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ucG9pbnQoeCwgeSk7IH0sXG4gICAgc3BoZXJlOiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0uc3BoZXJlKCk7IH0sXG4gICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ubGluZVN0YXJ0KCk7IH0sXG4gICAgbGluZUVuZDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLmxpbmVFbmQoKTsgfSxcbiAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5wb2x5Z29uU3RhcnQoKTsgfSxcbiAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ucG9seWdvbkVuZCgpOyB9XG4gIH07XG59XG5cbi8vIEEgY29tcG9zaXRlIHByb2plY3Rpb24gZm9yIHRoZSBVbml0ZWQgU3RhdGVzLCBjb25maWd1cmVkIGJ5IGRlZmF1bHQgZm9yXG4vLyA5NjBcdTAwRDc1MDAuIFRoZSBwcm9qZWN0aW9uIGFsc28gd29ya3MgcXVpdGUgd2VsbCBhdCA5NjBcdTAwRDc2MDAgaWYgeW91IGNoYW5nZSB0aGVcbi8vIHNjYWxlIHRvIDEyODUgYW5kIGFkanVzdCB0aGUgdHJhbnNsYXRlIGFjY29yZGluZ2x5LiBUaGUgc2V0IG9mIHN0YW5kYXJkXG4vLyBwYXJhbGxlbHMgZm9yIGVhY2ggcmVnaW9uIGNvbWVzIGZyb20gVVNHUywgd2hpY2ggaXMgcHVibGlzaGVkIGhlcmU6XG4vLyBodHRwOi8vZWdzYy51c2dzLmdvdi9pc2IvcHVicy9NYXBQcm9qZWN0aW9ucy9wcm9qZWN0aW9ucy5odG1sI2FsYmVyc1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBjYWNoZSxcbiAgICAgIGNhY2hlU3RyZWFtLFxuICAgICAgbG93ZXI0OCA9IGFsYmVycygpLCBsb3dlcjQ4UG9pbnQsXG4gICAgICBhbGFza2EgPSBjb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbMTU0LCAwXSkuY2VudGVyKFstMiwgNTguNV0pLnBhcmFsbGVscyhbNTUsIDY1XSksIGFsYXNrYVBvaW50LCAvLyBFUFNHOjMzMzhcbiAgICAgIGhhd2FpaSA9IGNvbmljRXF1YWxBcmVhKCkucm90YXRlKFsxNTcsIDBdKS5jZW50ZXIoWy0zLCAxOS45XSkucGFyYWxsZWxzKFs4LCAxOF0pLCBoYXdhaWlQb2ludCwgLy8gRVNSSToxMDIwMDdcbiAgICAgIHBvaW50LCBwb2ludFN0cmVhbSA9IHtwb2ludDogZnVuY3Rpb24oeCwgeSkgeyBwb2ludCA9IFt4LCB5XTsgfX07XG5cbiAgZnVuY3Rpb24gYWxiZXJzVXNhKGNvb3JkaW5hdGVzKSB7XG4gICAgdmFyIHggPSBjb29yZGluYXRlc1swXSwgeSA9IGNvb3JkaW5hdGVzWzFdO1xuICAgIHJldHVybiBwb2ludCA9IG51bGwsXG4gICAgICAgIChsb3dlcjQ4UG9pbnQucG9pbnQoeCwgeSksIHBvaW50KVxuICAgICAgICB8fCAoYWxhc2thUG9pbnQucG9pbnQoeCwgeSksIHBvaW50KVxuICAgICAgICB8fCAoaGF3YWlpUG9pbnQucG9pbnQoeCwgeSksIHBvaW50KTtcbiAgfVxuXG4gIGFsYmVyc1VzYS5pbnZlcnQgPSBmdW5jdGlvbihjb29yZGluYXRlcykge1xuICAgIHZhciBrID0gbG93ZXI0OC5zY2FsZSgpLFxuICAgICAgICB0ID0gbG93ZXI0OC50cmFuc2xhdGUoKSxcbiAgICAgICAgeCA9IChjb29yZGluYXRlc1swXSAtIHRbMF0pIC8gayxcbiAgICAgICAgeSA9IChjb29yZGluYXRlc1sxXSAtIHRbMV0pIC8gaztcbiAgICByZXR1cm4gKHkgPj0gMC4xMjAgJiYgeSA8IDAuMjM0ICYmIHggPj0gLTAuNDI1ICYmIHggPCAtMC4yMTQgPyBhbGFza2FcbiAgICAgICAgOiB5ID49IDAuMTY2ICYmIHkgPCAwLjIzNCAmJiB4ID49IC0wLjIxNCAmJiB4IDwgLTAuMTE1ID8gaGF3YWlpXG4gICAgICAgIDogbG93ZXI0OCkuaW52ZXJ0KGNvb3JkaW5hdGVzKTtcbiAgfTtcblxuICBhbGJlcnNVc2Euc3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgcmV0dXJuIGNhY2hlICYmIGNhY2hlU3RyZWFtID09PSBzdHJlYW0gPyBjYWNoZSA6IGNhY2hlID0gbXVsdGlwbGV4KFtsb3dlcjQ4LnN0cmVhbShjYWNoZVN0cmVhbSA9IHN0cmVhbSksIGFsYXNrYS5zdHJlYW0oc3RyZWFtKSwgaGF3YWlpLnN0cmVhbShzdHJlYW0pXSk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsb3dlcjQ4LnByZWNpc2lvbigpO1xuICAgIGxvd2VyNDgucHJlY2lzaW9uKF8pLCBhbGFza2EucHJlY2lzaW9uKF8pLCBoYXdhaWkucHJlY2lzaW9uKF8pO1xuICAgIHJldHVybiByZXNldCgpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5zY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsb3dlcjQ4LnNjYWxlKCk7XG4gICAgbG93ZXI0OC5zY2FsZShfKSwgYWxhc2thLnNjYWxlKF8gKiAwLjM1KSwgaGF3YWlpLnNjYWxlKF8pO1xuICAgIHJldHVybiBhbGJlcnNVc2EudHJhbnNsYXRlKGxvd2VyNDgudHJhbnNsYXRlKCkpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS50cmFuc2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC50cmFuc2xhdGUoKTtcbiAgICB2YXIgayA9IGxvd2VyNDguc2NhbGUoKSwgeCA9ICtfWzBdLCB5ID0gK19bMV07XG5cbiAgICBsb3dlcjQ4UG9pbnQgPSBsb3dlcjQ4XG4gICAgICAgIC50cmFuc2xhdGUoXylcbiAgICAgICAgLmNsaXBFeHRlbnQoW1t4IC0gMC40NTUgKiBrLCB5IC0gMC4yMzggKiBrXSwgW3ggKyAwLjQ1NSAqIGssIHkgKyAwLjIzOCAqIGtdXSlcbiAgICAgICAgLnN0cmVhbShwb2ludFN0cmVhbSk7XG5cbiAgICBhbGFza2FQb2ludCA9IGFsYXNrYVxuICAgICAgICAudHJhbnNsYXRlKFt4IC0gMC4zMDcgKiBrLCB5ICsgMC4yMDEgKiBrXSlcbiAgICAgICAgLmNsaXBFeHRlbnQoW1t4IC0gMC40MjUgKiBrICsgZXBzaWxvbiwgeSArIDAuMTIwICogayArIGVwc2lsb25dLCBbeCAtIDAuMjE0ICogayAtIGVwc2lsb24sIHkgKyAwLjIzNCAqIGsgLSBlcHNpbG9uXV0pXG4gICAgICAgIC5zdHJlYW0ocG9pbnRTdHJlYW0pO1xuXG4gICAgaGF3YWlpUG9pbnQgPSBoYXdhaWlcbiAgICAgICAgLnRyYW5zbGF0ZShbeCAtIDAuMjA1ICogaywgeSArIDAuMjEyICoga10pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuMjE0ICogayArIGVwc2lsb24sIHkgKyAwLjE2NiAqIGsgKyBlcHNpbG9uXSwgW3ggLSAwLjExNSAqIGsgLSBlcHNpbG9uLCB5ICsgMC4yMzQgKiBrIC0gZXBzaWxvbl1dKVxuICAgICAgICAuc3RyZWFtKHBvaW50U3RyZWFtKTtcblxuICAgIHJldHVybiByZXNldCgpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRFeHRlbnQgPSBmdW5jdGlvbihleHRlbnQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRFeHRlbnQoYWxiZXJzVXNhLCBleHRlbnQsIG9iamVjdCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLmZpdFNpemUgPSBmdW5jdGlvbihzaXplLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0U2l6ZShhbGJlcnNVc2EsIHNpemUsIG9iamVjdCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLmZpdFdpZHRoID0gZnVuY3Rpb24od2lkdGgsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRXaWR0aChhbGJlcnNVc2EsIHdpZHRoLCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRIZWlnaHQgPSBmdW5jdGlvbihoZWlnaHQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRIZWlnaHQoYWxiZXJzVXNhLCBoZWlnaHQsIG9iamVjdCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgY2FjaGUgPSBjYWNoZVN0cmVhbSA9IG51bGw7XG4gICAgcmV0dXJuIGFsYmVyc1VzYTtcbiAgfVxuXG4gIHJldHVybiBhbGJlcnNVc2Euc2NhbGUoMTA3MCk7XG59XG4iLCAiaW1wb3J0IHthc2luLCBhdGFuMiwgY29zLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhemltdXRoYWxSYXcoc2NhbGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgY3ggPSBjb3MoeCksXG4gICAgICAgIGN5ID0gY29zKHkpLFxuICAgICAgICBrID0gc2NhbGUoY3ggKiBjeSk7XG4gICAgICAgIGlmIChrID09PSBJbmZpbml0eSkgcmV0dXJuIFsyLCAwXTtcbiAgICByZXR1cm4gW1xuICAgICAgayAqIGN5ICogc2luKHgpLFxuICAgICAgayAqIHNpbih5KVxuICAgIF07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF6aW11dGhhbEludmVydChhbmdsZSkge1xuICByZXR1cm4gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciB6ID0gc3FydCh4ICogeCArIHkgKiB5KSxcbiAgICAgICAgYyA9IGFuZ2xlKHopLFxuICAgICAgICBzYyA9IHNpbihjKSxcbiAgICAgICAgY2MgPSBjb3MoYyk7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0YW4yKHggKiBzYywgeiAqIGNjKSxcbiAgICAgIGFzaW4oeiAmJiB5ICogc2MgLyB6KVxuICAgIF07XG4gIH1cbn1cbiIsICJpbXBvcnQge2FzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge2F6aW11dGhhbFJhdywgYXppbXV0aGFsSW52ZXJ0fSBmcm9tIFwiLi9hemltdXRoYWwuanNcIjtcbmltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCB2YXIgYXppbXV0aGFsRXF1YWxBcmVhUmF3ID0gYXppbXV0aGFsUmF3KGZ1bmN0aW9uKGN4Y3kpIHtcbiAgcmV0dXJuIHNxcnQoMiAvICgxICsgY3hjeSkpO1xufSk7XG5cbmF6aW11dGhhbEVxdWFsQXJlYVJhdy5pbnZlcnQgPSBhemltdXRoYWxJbnZlcnQoZnVuY3Rpb24oeikge1xuICByZXR1cm4gMiAqIGFzaW4oeiAvIDIpO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcHJvamVjdGlvbihhemltdXRoYWxFcXVhbEFyZWFSYXcpXG4gICAgICAuc2NhbGUoMTI0Ljc1KVxuICAgICAgLmNsaXBBbmdsZSgxODAgLSAxZS0zKTtcbn1cbiIsICJpbXBvcnQgcHJvamVjdGlvbiBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHthYnMsIGFzaW4sIGNvcywgZXBzaWxvbjIsIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxudmFyIEExID0gMS4zNDAyNjQsXG4gICAgQTIgPSAtMC4wODExMDYsXG4gICAgQTMgPSAwLjAwMDg5MyxcbiAgICBBNCA9IDAuMDAzNzk2LFxuICAgIE0gPSBzcXJ0KDMpIC8gMixcbiAgICBpdGVyYXRpb25zID0gMTI7XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbEVhcnRoUmF3KGxhbWJkYSwgcGhpKSB7XG4gIHZhciBsID0gYXNpbihNICogc2luKHBoaSkpLCBsMiA9IGwgKiBsLCBsNiA9IGwyICogbDIgKiBsMjtcbiAgcmV0dXJuIFtcbiAgICBsYW1iZGEgKiBjb3MobCkgLyAoTSAqIChBMSArIDMgKiBBMiAqIGwyICsgbDYgKiAoNyAqIEEzICsgOSAqIEE0ICogbDIpKSksXG4gICAgbCAqIChBMSArIEEyICogbDIgKyBsNiAqIChBMyArIEE0ICogbDIpKVxuICBdO1xufVxuXG5lcXVhbEVhcnRoUmF3LmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgdmFyIGwgPSB5LCBsMiA9IGwgKiBsLCBsNiA9IGwyICogbDIgKiBsMjtcbiAgZm9yICh2YXIgaSA9IDAsIGRlbHRhLCBmeSwgZnB5OyBpIDwgaXRlcmF0aW9uczsgKytpKSB7XG4gICAgZnkgPSBsICogKEExICsgQTIgKiBsMiArIGw2ICogKEEzICsgQTQgKiBsMikpIC0geTtcbiAgICBmcHkgPSBBMSArIDMgKiBBMiAqIGwyICsgbDYgKiAoNyAqIEEzICsgOSAqIEE0ICogbDIpO1xuICAgIGwgLT0gZGVsdGEgPSBmeSAvIGZweSwgbDIgPSBsICogbCwgbDYgPSBsMiAqIGwyICogbDI7XG4gICAgaWYgKGFicyhkZWx0YSkgPCBlcHNpbG9uMikgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIFtcbiAgICBNICogeCAqIChBMSArIDMgKiBBMiAqIGwyICsgbDYgKiAoNyAqIEEzICsgOSAqIEE0ICogbDIpKSAvIGNvcyhsKSxcbiAgICBhc2luKHNpbihsKSAvIE0pXG4gIF07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHByb2plY3Rpb24oZXF1YWxFYXJ0aFJhdylcbiAgICAgIC5zY2FsZSgxNzcuMTU4KTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gaW5pdFJhbmdlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHRoaXMucmFuZ2UoZG9tYWluKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhpcy5yYW5nZShyYW5nZSkuZG9tYWluKGRvbWFpbik7IGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEludGVycG9sYXRvcihkb21haW4sIGludGVycG9sYXRvcikge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IGJyZWFrO1xuICAgIGNhc2UgMToge1xuICAgICAgaWYgKHR5cGVvZiBkb21haW4gPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoZG9tYWluKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShkb21haW4pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHRoaXMuZG9tYWluKGRvbWFpbik7XG4gICAgICBpZiAodHlwZW9mIGludGVycG9sYXRvciA9PT0gXCJmdW5jdGlvblwiKSB0aGlzLmludGVycG9sYXRvcihpbnRlcnBvbGF0b3IpO1xuICAgICAgZWxzZSB0aGlzLnJhbmdlKGludGVycG9sYXRvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uc3RhbnRzKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG51bWJlcih4KSB7XG4gIHJldHVybiAreDtcbn1cbiIsICJpbXBvcnQge2Jpc2VjdH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2ludGVycG9sYXRlIGFzIGludGVycG9sYXRlVmFsdWUsIGludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJvdW5kfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHVuaXQgPSBbMCwgMV07XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gIHJldHVybiB4O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemUoYSwgYikge1xuICByZXR1cm4gKGIgLT0gKGEgPSArYSkpXG4gICAgICA/IGZ1bmN0aW9uKHgpIHsgcmV0dXJuICh4IC0gYSkgLyBiOyB9XG4gICAgICA6IGNvbnN0YW50KGlzTmFOKGIpID8gTmFOIDogMC41KTtcbn1cblxuZnVuY3Rpb24gY2xhbXBlcihhLCBiKSB7XG4gIHZhciB0O1xuICBpZiAoYSA+IGIpIHQgPSBhLCBhID0gYiwgYiA9IHQ7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiBNYXRoLm1heChhLCBNYXRoLm1pbihiLCB4KSk7IH07XG59XG5cbi8vIG5vcm1hbGl6ZShhLCBiKSh4KSB0YWtlcyBhIGRvbWFpbiB2YWx1ZSB4IGluIFthLGJdIGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHBhcmFtZXRlciB0IGluIFswLDFdLlxuLy8gaW50ZXJwb2xhdGUoYSwgYikodCkgdGFrZXMgYSBwYXJhbWV0ZXIgdCBpbiBbMCwxXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyByYW5nZSB2YWx1ZSB4IGluIFthLGJdLlxuZnVuY3Rpb24gYmltYXAoZG9tYWluLCByYW5nZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIGQwID0gZG9tYWluWzBdLCBkMSA9IGRvbWFpblsxXSwgcjAgPSByYW5nZVswXSwgcjEgPSByYW5nZVsxXTtcbiAgaWYgKGQxIDwgZDApIGQwID0gbm9ybWFsaXplKGQxLCBkMCksIHIwID0gaW50ZXJwb2xhdGUocjEsIHIwKTtcbiAgZWxzZSBkMCA9IG5vcm1hbGl6ZShkMCwgZDEpLCByMCA9IGludGVycG9sYXRlKHIwLCByMSk7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiByMChkMCh4KSk7IH07XG59XG5cbmZ1bmN0aW9uIHBvbHltYXAoZG9tYWluLCByYW5nZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIGogPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpIC0gMSxcbiAgICAgIGQgPSBuZXcgQXJyYXkoaiksXG4gICAgICByID0gbmV3IEFycmF5KGopLFxuICAgICAgaSA9IC0xO1xuXG4gIC8vIFJldmVyc2UgZGVzY2VuZGluZyBkb21haW5zLlxuICBpZiAoZG9tYWluW2pdIDwgZG9tYWluWzBdKSB7XG4gICAgZG9tYWluID0gZG9tYWluLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIHJhbmdlID0gcmFuZ2Uuc2xpY2UoKS5yZXZlcnNlKCk7XG4gIH1cblxuICB3aGlsZSAoKytpIDwgaikge1xuICAgIGRbaV0gPSBub3JtYWxpemUoZG9tYWluW2ldLCBkb21haW5baSArIDFdKTtcbiAgICByW2ldID0gaW50ZXJwb2xhdGUocmFuZ2VbaV0sIHJhbmdlW2kgKyAxXSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgIHZhciBpID0gYmlzZWN0KGRvbWFpbiwgeCwgMSwgaikgLSAxO1xuICAgIHJldHVybiByW2ldKGRbaV0oeCkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCkge1xuICByZXR1cm4gdGFyZ2V0XG4gICAgICAuZG9tYWluKHNvdXJjZS5kb21haW4oKSlcbiAgICAgIC5yYW5nZShzb3VyY2UucmFuZ2UoKSlcbiAgICAgIC5pbnRlcnBvbGF0ZShzb3VyY2UuaW50ZXJwb2xhdGUoKSlcbiAgICAgIC5jbGFtcChzb3VyY2UuY2xhbXAoKSlcbiAgICAgIC51bmtub3duKHNvdXJjZS51bmtub3duKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtZXIoKSB7XG4gIHZhciBkb21haW4gPSB1bml0LFxuICAgICAgcmFuZ2UgPSB1bml0LFxuICAgICAgaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZVZhbHVlLFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgdW50cmFuc2Zvcm0sXG4gICAgICB1bmtub3duLFxuICAgICAgY2xhbXAgPSBpZGVudGl0eSxcbiAgICAgIHBpZWNld2lzZSxcbiAgICAgIG91dHB1dCxcbiAgICAgIGlucHV0O1xuXG4gIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgdmFyIG4gPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpO1xuICAgIGlmIChjbGFtcCAhPT0gaWRlbnRpdHkpIGNsYW1wID0gY2xhbXBlcihkb21haW5bMF0sIGRvbWFpbltuIC0gMV0pO1xuICAgIHBpZWNld2lzZSA9IG4gPiAyID8gcG9seW1hcCA6IGJpbWFwO1xuICAgIG91dHB1dCA9IGlucHV0ID0gbnVsbDtcbiAgICByZXR1cm4gc2NhbGU7XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgcmV0dXJuIHggPT0gbnVsbCB8fCBpc05hTih4ID0gK3gpID8gdW5rbm93biA6IChvdXRwdXQgfHwgKG91dHB1dCA9IHBpZWNld2lzZShkb21haW4ubWFwKHRyYW5zZm9ybSksIHJhbmdlLCBpbnRlcnBvbGF0ZSkpKSh0cmFuc2Zvcm0oY2xhbXAoeCkpKTtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gY2xhbXAodW50cmFuc2Zvcm0oKGlucHV0IHx8IChpbnB1dCA9IHBpZWNld2lzZShyYW5nZSwgZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCBpbnRlcnBvbGF0ZU51bWJlcikpKSh5KSkpO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4gPSBBcnJheS5mcm9tKF8sIG51bWJlciksIHJlc2NhbGUoKSkgOiBkb21haW4uc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHJlc2NhbGUoKSkgOiByYW5nZS5zbGljZSgpO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIHJhbmdlID0gQXJyYXkuZnJvbShfKSwgaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZVJvdW5kLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuY2xhbXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY2xhbXAgPSBfID8gdHJ1ZSA6IGlkZW50aXR5LCByZXNjYWxlKCkpIDogY2xhbXAgIT09IGlkZW50aXR5O1xuICB9O1xuXG4gIHNjYWxlLmludGVycG9sYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRlID0gXywgcmVzY2FsZSgpKSA6IGludGVycG9sYXRlO1xuICB9O1xuXG4gIHNjYWxlLnVua25vd24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodW5rbm93biA9IF8sIHNjYWxlKSA6IHVua25vd247XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHQsIHUpIHtcbiAgICB0cmFuc2Zvcm0gPSB0LCB1bnRyYW5zZm9ybSA9IHU7XG4gICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29udGludW91cygpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKCkoaWRlbnRpdHksIGlkZW50aXR5KTtcbn1cbiIsICJpbXBvcnQge3RpY2tTdGVwfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7Zm9ybWF0LCBmb3JtYXRQcmVmaXgsIGZvcm1hdFNwZWNpZmllciwgcHJlY2lzaW9uRml4ZWQsIHByZWNpc2lvblByZWZpeCwgcHJlY2lzaW9uUm91bmR9IGZyb20gXCJkMy1mb3JtYXRcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGlja0Zvcm1hdChzdGFydCwgc3RvcCwgY291bnQsIHNwZWNpZmllcikge1xuICB2YXIgc3RlcCA9IHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCksXG4gICAgICBwcmVjaXNpb247XG4gIHNwZWNpZmllciA9IGZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIgPT0gbnVsbCA/IFwiLGZcIiA6IHNwZWNpZmllcik7XG4gIHN3aXRjaCAoc3BlY2lmaWVyLnR5cGUpIHtcbiAgICBjYXNlIFwic1wiOiB7XG4gICAgICB2YXIgdmFsdWUgPSBNYXRoLm1heChNYXRoLmFicyhzdGFydCksIE1hdGguYWJzKHN0b3ApKTtcbiAgICAgIGlmIChzcGVjaWZpZXIucHJlY2lzaW9uID09IG51bGwgJiYgIWlzTmFOKHByZWNpc2lvbiA9IHByZWNpc2lvblByZWZpeChzdGVwLCB2YWx1ZSkpKSBzcGVjaWZpZXIucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICAgICAgcmV0dXJuIGZvcm1hdFByZWZpeChzcGVjaWZpZXIsIHZhbHVlKTtcbiAgICB9XG4gICAgY2FzZSBcIlwiOlxuICAgIGNhc2UgXCJlXCI6XG4gICAgY2FzZSBcImdcIjpcbiAgICBjYXNlIFwicFwiOlxuICAgIGNhc2UgXCJyXCI6IHtcbiAgICAgIGlmIChzcGVjaWZpZXIucHJlY2lzaW9uID09IG51bGwgJiYgIWlzTmFOKHByZWNpc2lvbiA9IHByZWNpc2lvblJvdW5kKHN0ZXAsIE1hdGgubWF4KE1hdGguYWJzKHN0YXJ0KSwgTWF0aC5hYnMoc3RvcCkpKSkpIHNwZWNpZmllci5wcmVjaXNpb24gPSBwcmVjaXNpb24gLSAoc3BlY2lmaWVyLnR5cGUgPT09IFwiZVwiKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlIFwiZlwiOlxuICAgIGNhc2UgXCIlXCI6IHtcbiAgICAgIGlmIChzcGVjaWZpZXIucHJlY2lzaW9uID09IG51bGwgJiYgIWlzTmFOKHByZWNpc2lvbiA9IHByZWNpc2lvbkZpeGVkKHN0ZXApKSkgc3BlY2lmaWVyLnByZWNpc2lvbiA9IHByZWNpc2lvbiAtIChzcGVjaWZpZXIudHlwZSA9PT0gXCIlXCIpICogMjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZm9ybWF0KHNwZWNpZmllcik7XG59XG4iLCAiaW1wb3J0IHt0aWNrcywgdGlja0luY3JlbWVudH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQgY29udGludW91cywge2NvcHl9IGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgdGlja0Zvcm1hdCBmcm9tIFwiLi90aWNrRm9ybWF0LmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJpc2goc2NhbGUpIHtcbiAgdmFyIGRvbWFpbiA9IHNjYWxlLmRvbWFpbjtcblxuICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICByZXR1cm4gdGlja3MoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBjb3VudCA9PSBudWxsID8gMTAgOiBjb3VudCk7XG4gIH07XG5cbiAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKGNvdW50LCBzcGVjaWZpZXIpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHJldHVybiB0aWNrRm9ybWF0KGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgY291bnQgPT0gbnVsbCA/IDEwIDogY291bnQsIHNwZWNpZmllcik7XG4gIH07XG5cbiAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID09IG51bGwpIGNvdW50ID0gMTA7XG5cbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHZhciBpMCA9IDA7XG4gICAgdmFyIGkxID0gZC5sZW5ndGggLSAxO1xuICAgIHZhciBzdGFydCA9IGRbaTBdO1xuICAgIHZhciBzdG9wID0gZFtpMV07XG4gICAgdmFyIHByZXN0ZXA7XG4gICAgdmFyIHN0ZXA7XG4gICAgdmFyIG1heEl0ZXIgPSAxMDtcblxuICAgIGlmIChzdG9wIDwgc3RhcnQpIHtcbiAgICAgIHN0ZXAgPSBzdGFydCwgc3RhcnQgPSBzdG9wLCBzdG9wID0gc3RlcDtcbiAgICAgIHN0ZXAgPSBpMCwgaTAgPSBpMSwgaTEgPSBzdGVwO1xuICAgIH1cbiAgICBcbiAgICB3aGlsZSAobWF4SXRlci0tID4gMCkge1xuICAgICAgc3RlcCA9IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgICAgIGlmIChzdGVwID09PSBwcmVzdGVwKSB7XG4gICAgICAgIGRbaTBdID0gc3RhcnRcbiAgICAgICAgZFtpMV0gPSBzdG9wXG4gICAgICAgIHJldHVybiBkb21haW4oZCk7XG4gICAgICB9IGVsc2UgaWYgKHN0ZXAgPiAwKSB7XG4gICAgICAgIHN0YXJ0ID0gTWF0aC5mbG9vcihzdGFydCAvIHN0ZXApICogc3RlcDtcbiAgICAgICAgc3RvcCA9IE1hdGguY2VpbChzdG9wIC8gc3RlcCkgKiBzdGVwO1xuICAgICAgfSBlbHNlIGlmIChzdGVwIDwgMCkge1xuICAgICAgICBzdGFydCA9IE1hdGguY2VpbChzdGFydCAqIHN0ZXApIC8gc3RlcDtcbiAgICAgICAgc3RvcCA9IE1hdGguZmxvb3Ioc3RvcCAqIHN0ZXApIC8gc3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcHJlc3RlcCA9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjYWxlO1xuICB9O1xuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGluZWFyKCkge1xuICB2YXIgc2NhbGUgPSBjb250aW51b3VzKCk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBsaW5lYXIoKSk7XG4gIH07XG5cbiAgaW5pdFJhbmdlLmFwcGx5KHNjYWxlLCBhcmd1bWVudHMpO1xuXG4gIHJldHVybiBsaW5lYXJpc2goc2NhbGUpO1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBUcmFuc2Zvcm0oaywgeCwgeSkge1xuICB0aGlzLmsgPSBrO1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNmb3JtLFxuICBzY2FsZTogZnVuY3Rpb24oaykge1xuICAgIHJldHVybiBrID09PSAxID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rICogaywgdGhpcy54LCB0aGlzLnkpO1xuICB9LFxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4geCA9PT0gMCAmIHkgPT09IDAgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmssIHRoaXMueCArIHRoaXMuayAqIHgsIHRoaXMueSArIHRoaXMuayAqIHkpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gW3BvaW50WzBdICogdGhpcy5rICsgdGhpcy54LCBwb2ludFsxXSAqIHRoaXMuayArIHRoaXMueV07XG4gIH0sXG4gIGFwcGx5WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4ICogdGhpcy5rICsgdGhpcy54O1xuICB9LFxuICBhcHBseVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMuayArIHRoaXMueTtcbiAgfSxcbiAgaW52ZXJ0OiBmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIHJldHVybiBbKGxvY2F0aW9uWzBdIC0gdGhpcy54KSAvIHRoaXMuaywgKGxvY2F0aW9uWzFdIC0gdGhpcy55KSAvIHRoaXMua107XG4gIH0sXG4gIGludmVydFg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gKHggLSB0aGlzLngpIC8gdGhpcy5rO1xuICB9LFxuICBpbnZlcnRZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuICh5IC0gdGhpcy55KSAvIHRoaXMuaztcbiAgfSxcbiAgcmVzY2FsZVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geC5jb3B5KCkuZG9tYWluKHgucmFuZ2UoKS5tYXAodGhpcy5pbnZlcnRYLCB0aGlzKS5tYXAoeC5pbnZlcnQsIHgpKTtcbiAgfSxcbiAgcmVzY2FsZVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4geS5jb3B5KCkuZG9tYWluKHkucmFuZ2UoKS5tYXAodGhpcy5pbnZlcnRZLCB0aGlzKS5tYXAoeS5pbnZlcnQsIHkpKTtcbiAgfSxcbiAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIHRoaXMueCArIFwiLFwiICsgdGhpcy55ICsgXCIpIHNjYWxlKFwiICsgdGhpcy5rICsgXCIpXCI7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgaWRlbnRpdHkgPSBuZXcgVHJhbnNmb3JtKDEsIDAsIDApO1xuXG50cmFuc2Zvcm0ucHJvdG90eXBlID0gVHJhbnNmb3JtLnByb3RvdHlwZTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNmb3JtKG5vZGUpIHtcbiAgd2hpbGUgKCFub2RlLl9fem9vbSkgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHJldHVybiBpZGVudGl0eTtcbiAgcmV0dXJuIG5vZGUuX196b29tO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZGF0YSBsb2FkZXJcbi8vIExvYWRzIEpTT04gYW5kIHRleHQgZWl0aGVyIGZyb20gYW4gaW5saW5lZCA8c2NyaXB0IHR5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCIgZGF0YS1wYXRoPVwiXHUyMDI2XCI+IGJsb2NrXG4vLyAodGhlIG9mZmxpbmUgc2luZ2xlLWZpbGUgYnVpbGQpIG9yIGJ5IGZldGNoaW5nIGl0IHJlbGF0aXZlIHRvIHRoZSBwYWdlIChHaXRIdWIgUGFnZXMgLyBkZXYgc2VydmVyKS5cblxuY29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGlubGluZWQocGF0aCkge1xuICBjb25zdCBzZWwgPSBgc2NyaXB0W3R5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCJdW2RhdGEtcGF0aD1cIiR7Q1NTLmVzY2FwZShwYXRoKX1cIl1gO1xuICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsKTtcbiAgcmV0dXJuIGVsID8gZWwudGV4dENvbnRlbnQgOiBudWxsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRleHQocGF0aCkge1xuICBjb25zdCBpbmwgPSBpbmxpbmVkKHBhdGgpO1xuICBpZiAoaW5sICE9PSBudWxsKSByZXR1cm4gaW5sO1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChwYXRoKTtcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGxvYWQgJHtwYXRofSAoSFRUUCAke3Jlcy5zdGF0dXN9KWApO1xuICByZXR1cm4gcmVzLnRleHQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRKU09OKHBhdGgpIHtcbiAgaWYgKCFjYWNoZS5oYXMocGF0aCkpIGNhY2hlLnNldChwYXRoLCBsb2FkVGV4dChwYXRoKS50aGVuKCh0KSA9PiBKU09OLnBhcnNlKHQpKSk7XG4gIHJldHVybiBjYWNoZS5nZXQocGF0aCk7XG59XG5cbi8vIFVSTCBmb3IgYW4gYXNzZXQgKGltYWdlKS4gVGhlIG9mZmxpbmUgYnVpbGQgcmVnaXN0ZXJzIGRhdGE6IFVSTHMgaW4gd2luZG93Ll9fUEFSQ0hNRU5UX0FTU0VUU19fLlxuZXhwb3J0IGZ1bmN0aW9uIGFzc2V0VVJMKHBhdGgpIHtcbiAgY29uc3QgYXNzZXRzID0gZ2xvYmFsVGhpcy5fX1BBUkNITUVOVF9BU1NFVFNfXztcbiAgcmV0dXJuIChhc3NldHMgJiYgYXNzZXRzW3BhdGhdKSB8fCBwYXRoO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLCAiaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuL2lkZW50aXR5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRyYW5zZm9ybSkge1xuICBpZiAodHJhbnNmb3JtID09IG51bGwpIHJldHVybiBpZGVudGl0eTtcbiAgdmFyIHgwLFxuICAgICAgeTAsXG4gICAgICBreCA9IHRyYW5zZm9ybS5zY2FsZVswXSxcbiAgICAgIGt5ID0gdHJhbnNmb3JtLnNjYWxlWzFdLFxuICAgICAgZHggPSB0cmFuc2Zvcm0udHJhbnNsYXRlWzBdLFxuICAgICAgZHkgPSB0cmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIGkpIHtcbiAgICBpZiAoIWkpIHgwID0geTAgPSAwO1xuICAgIHZhciBqID0gMiwgbiA9IGlucHV0Lmxlbmd0aCwgb3V0cHV0ID0gbmV3IEFycmF5KG4pO1xuICAgIG91dHB1dFswXSA9ICh4MCArPSBpbnB1dFswXSkgKiBreCArIGR4O1xuICAgIG91dHB1dFsxXSA9ICh5MCArPSBpbnB1dFsxXSkgKiBreSArIGR5O1xuICAgIHdoaWxlIChqIDwgbikgb3V0cHV0W2pdID0gaW5wdXRbal0sICsrajtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGFycmF5LCBuKSB7XG4gIHZhciB0LCBqID0gYXJyYXkubGVuZ3RoLCBpID0gaiAtIG47XG4gIHdoaWxlIChpIDwgLS1qKSB0ID0gYXJyYXlbaV0sIGFycmF5W2krK10gPSBhcnJheVtqXSwgYXJyYXlbal0gPSB0O1xufVxuIiwgImltcG9ydCByZXZlcnNlIGZyb20gXCIuL3JldmVyc2UuanNcIjtcbmltcG9ydCB0cmFuc2Zvcm0gZnJvbSBcIi4vdHJhbnNmb3JtLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRvcG9sb2d5LCBvKSB7XG4gIGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgbyA9IHRvcG9sb2d5Lm9iamVjdHNbb107XG4gIHJldHVybiBvLnR5cGUgPT09IFwiR2VvbWV0cnlDb2xsZWN0aW9uXCJcbiAgICAgID8ge3R5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIiwgZmVhdHVyZXM6IG8uZ2VvbWV0cmllcy5tYXAoZnVuY3Rpb24obykgeyByZXR1cm4gZmVhdHVyZSh0b3BvbG9neSwgbyk7IH0pfVxuICAgICAgOiBmZWF0dXJlKHRvcG9sb2d5LCBvKTtcbn1cblxuZnVuY3Rpb24gZmVhdHVyZSh0b3BvbG9neSwgbykge1xuICB2YXIgaWQgPSBvLmlkLFxuICAgICAgYmJveCA9IG8uYmJveCxcbiAgICAgIHByb3BlcnRpZXMgPSBvLnByb3BlcnRpZXMgPT0gbnVsbCA/IHt9IDogby5wcm9wZXJ0aWVzLFxuICAgICAgZ2VvbWV0cnkgPSBvYmplY3QodG9wb2xvZ3ksIG8pO1xuICByZXR1cm4gaWQgPT0gbnVsbCAmJiBiYm94ID09IG51bGwgPyB7dHlwZTogXCJGZWF0dXJlXCIsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX1cbiAgICAgIDogYmJveCA9PSBudWxsID8ge3R5cGU6IFwiRmVhdHVyZVwiLCBpZDogaWQsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX1cbiAgICAgIDoge3R5cGU6IFwiRmVhdHVyZVwiLCBpZDogaWQsIGJib3g6IGJib3gsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3QodG9wb2xvZ3ksIG8pIHtcbiAgdmFyIHRyYW5zZm9ybVBvaW50ID0gdHJhbnNmb3JtKHRvcG9sb2d5LnRyYW5zZm9ybSksXG4gICAgICBhcmNzID0gdG9wb2xvZ3kuYXJjcztcblxuICBmdW5jdGlvbiBhcmMoaSwgcG9pbnRzKSB7XG4gICAgaWYgKHBvaW50cy5sZW5ndGgpIHBvaW50cy5wb3AoKTtcbiAgICBmb3IgKHZhciBhID0gYXJjc1tpIDwgMCA/IH5pIDogaV0sIGsgPSAwLCBuID0gYS5sZW5ndGg7IGsgPCBuOyArK2spIHtcbiAgICAgIHBvaW50cy5wdXNoKHRyYW5zZm9ybVBvaW50KGFba10sIGspKTtcbiAgICB9XG4gICAgaWYgKGkgPCAwKSByZXZlcnNlKHBvaW50cywgbik7XG4gIH1cblxuICBmdW5jdGlvbiBwb2ludChwKSB7XG4gICAgcmV0dXJuIHRyYW5zZm9ybVBvaW50KHApO1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZShhcmNzKSB7XG4gICAgdmFyIHBvaW50cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJjcy5sZW5ndGg7IGkgPCBuOyArK2kpIGFyYyhhcmNzW2ldLCBwb2ludHMpO1xuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgMikgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTsgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIHBlciB0aGUgc3BlY2lmaWNhdGlvbi5cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgZnVuY3Rpb24gcmluZyhhcmNzKSB7XG4gICAgdmFyIHBvaW50cyA9IGxpbmUoYXJjcyk7XG4gICAgd2hpbGUgKHBvaW50cy5sZW5ndGggPCA0KSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIG1heSBoYXBwZW4gaWYgYW4gYXJjIGhhcyBvbmx5IHR3byBwb2ludHMuXG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvbHlnb24oYXJjcykge1xuICAgIHJldHVybiBhcmNzLm1hcChyaW5nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlb21ldHJ5KG8pIHtcbiAgICB2YXIgdHlwZSA9IG8udHlwZSwgY29vcmRpbmF0ZXM7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiR2VvbWV0cnlDb2xsZWN0aW9uXCI6IHJldHVybiB7dHlwZTogdHlwZSwgZ2VvbWV0cmllczogby5nZW9tZXRyaWVzLm1hcChnZW9tZXRyeSl9O1xuICAgICAgY2FzZSBcIlBvaW50XCI6IGNvb3JkaW5hdGVzID0gcG9pbnQoby5jb29yZGluYXRlcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpUG9pbnRcIjogY29vcmRpbmF0ZXMgPSBvLmNvb3JkaW5hdGVzLm1hcChwb2ludCk7IGJyZWFrO1xuICAgICAgY2FzZSBcIkxpbmVTdHJpbmdcIjogY29vcmRpbmF0ZXMgPSBsaW5lKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpTGluZVN0cmluZ1wiOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAobGluZSk7IGJyZWFrO1xuICAgICAgY2FzZSBcIlBvbHlnb25cIjogY29vcmRpbmF0ZXMgPSBwb2x5Z29uKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpUG9seWdvblwiOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAocG9seWdvbik7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7dHlwZTogdHlwZSwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTtcbiAgfVxuXG4gIHJldHVybiBnZW9tZXRyeShvKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0b3BvbG9neSwgYXJjcykge1xuICB2YXIgc3RpdGNoZWRBcmNzID0ge30sXG4gICAgICBmcmFnbWVudEJ5U3RhcnQgPSB7fSxcbiAgICAgIGZyYWdtZW50QnlFbmQgPSB7fSxcbiAgICAgIGZyYWdtZW50cyA9IFtdLFxuICAgICAgZW1wdHlJbmRleCA9IC0xO1xuXG4gIC8vIFN0aXRjaCBlbXB0eSBhcmNzIGZpcnN0LCBzaW5jZSB0aGV5IG1heSBiZSBzdWJzdW1lZCBieSBvdGhlciBhcmNzLlxuICBhcmNzLmZvckVhY2goZnVuY3Rpb24oaSwgaikge1xuICAgIHZhciBhcmMgPSB0b3BvbG9neS5hcmNzW2kgPCAwID8gfmkgOiBpXSwgdDtcbiAgICBpZiAoYXJjLmxlbmd0aCA8IDMgJiYgIWFyY1sxXVswXSAmJiAhYXJjWzFdWzFdKSB7XG4gICAgICB0ID0gYXJjc1srK2VtcHR5SW5kZXhdLCBhcmNzW2VtcHR5SW5kZXhdID0gaSwgYXJjc1tqXSA9IHQ7XG4gICAgfVxuICB9KTtcblxuICBhcmNzLmZvckVhY2goZnVuY3Rpb24oaSkge1xuICAgIHZhciBlID0gZW5kcyhpKSxcbiAgICAgICAgc3RhcnQgPSBlWzBdLFxuICAgICAgICBlbmQgPSBlWzFdLFxuICAgICAgICBmLCBnO1xuXG4gICAgaWYgKGYgPSBmcmFnbWVudEJ5RW5kW3N0YXJ0XSkge1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlFbmRbZi5lbmRdO1xuICAgICAgZi5wdXNoKGkpO1xuICAgICAgZi5lbmQgPSBlbmQ7XG4gICAgICBpZiAoZyA9IGZyYWdtZW50QnlTdGFydFtlbmRdKSB7XG4gICAgICAgIGRlbGV0ZSBmcmFnbWVudEJ5U3RhcnRbZy5zdGFydF07XG4gICAgICAgIHZhciBmZyA9IGcgPT09IGYgPyBmIDogZi5jb25jYXQoZyk7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmZy5zdGFydCA9IGYuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmZy5lbmQgPSBnLmVuZF0gPSBmZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmRdID0gZjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGYgPSBmcmFnbWVudEJ5U3RhcnRbZW5kXSkge1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XTtcbiAgICAgIGYudW5zaGlmdChpKTtcbiAgICAgIGYuc3RhcnQgPSBzdGFydDtcbiAgICAgIGlmIChnID0gZnJhZ21lbnRCeUVuZFtzdGFydF0pIHtcbiAgICAgICAgZGVsZXRlIGZyYWdtZW50QnlFbmRbZy5lbmRdO1xuICAgICAgICB2YXIgZ2YgPSBnID09PSBmID8gZiA6IGcuY29uY2F0KGYpO1xuICAgICAgICBmcmFnbWVudEJ5U3RhcnRbZ2Yuc3RhcnQgPSBnLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZ2YuZW5kID0gZi5lbmRdID0gZ2Y7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydF0gPSBmcmFnbWVudEJ5RW5kW2YuZW5kXSA9IGY7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGYgPSBbaV07XG4gICAgICBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydCA9IHN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmQgPSBlbmRdID0gZjtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGVuZHMoaSkge1xuICAgIHZhciBhcmMgPSB0b3BvbG9neS5hcmNzW2kgPCAwID8gfmkgOiBpXSwgcDAgPSBhcmNbMF0sIHAxO1xuICAgIGlmICh0b3BvbG9neS50cmFuc2Zvcm0pIHAxID0gWzAsIDBdLCBhcmMuZm9yRWFjaChmdW5jdGlvbihkcCkgeyBwMVswXSArPSBkcFswXSwgcDFbMV0gKz0gZHBbMV07IH0pO1xuICAgIGVsc2UgcDEgPSBhcmNbYXJjLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBpIDwgMCA/IFtwMSwgcDBdIDogW3AwLCBwMV07XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaChmcmFnbWVudEJ5RW5kLCBmcmFnbWVudEJ5U3RhcnQpIHtcbiAgICBmb3IgKHZhciBrIGluIGZyYWdtZW50QnlFbmQpIHtcbiAgICAgIHZhciBmID0gZnJhZ21lbnRCeUVuZFtrXTtcbiAgICAgIGRlbGV0ZSBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydF07XG4gICAgICBkZWxldGUgZi5zdGFydDtcbiAgICAgIGRlbGV0ZSBmLmVuZDtcbiAgICAgIGYuZm9yRWFjaChmdW5jdGlvbihpKSB7IHN0aXRjaGVkQXJjc1tpIDwgMCA/IH5pIDogaV0gPSAxOyB9KTtcbiAgICAgIGZyYWdtZW50cy5wdXNoKGYpO1xuICAgIH1cbiAgfVxuXG4gIGZsdXNoKGZyYWdtZW50QnlFbmQsIGZyYWdtZW50QnlTdGFydCk7XG4gIGZsdXNoKGZyYWdtZW50QnlTdGFydCwgZnJhZ21lbnRCeUVuZCk7XG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpKSB7IGlmICghc3RpdGNoZWRBcmNzW2kgPCAwID8gfmkgOiBpXSkgZnJhZ21lbnRzLnB1c2goW2ldKTsgfSk7XG5cbiAgcmV0dXJuIGZyYWdtZW50cztcbn1cbiIsICJpbXBvcnQge29iamVjdH0gZnJvbSBcIi4vZmVhdHVyZS5qc1wiO1xuaW1wb3J0IHN0aXRjaCBmcm9tIFwiLi9zdGl0Y2guanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odG9wb2xvZ3kpIHtcbiAgcmV0dXJuIG9iamVjdCh0b3BvbG9neSwgbWVzaEFyY3MuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXNoQXJjcyh0b3BvbG9neSwgb2JqZWN0LCBmaWx0ZXIpIHtcbiAgdmFyIGFyY3MsIGksIG47XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJjcyA9IGV4dHJhY3RBcmNzKHRvcG9sb2d5LCBvYmplY3QsIGZpbHRlcik7XG4gIGVsc2UgZm9yIChpID0gMCwgYXJjcyA9IG5ldyBBcnJheShuID0gdG9wb2xvZ3kuYXJjcy5sZW5ndGgpOyBpIDwgbjsgKytpKSBhcmNzW2ldID0gaTtcbiAgcmV0dXJuIHt0eXBlOiBcIk11bHRpTGluZVN0cmluZ1wiLCBhcmNzOiBzdGl0Y2godG9wb2xvZ3ksIGFyY3MpfTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEFyY3ModG9wb2xvZ3ksIG9iamVjdCwgZmlsdGVyKSB7XG4gIHZhciBhcmNzID0gW10sXG4gICAgICBnZW9tc0J5QXJjID0gW10sXG4gICAgICBnZW9tO1xuXG4gIGZ1bmN0aW9uIGV4dHJhY3QwKGkpIHtcbiAgICB2YXIgaiA9IGkgPCAwID8gfmkgOiBpO1xuICAgIChnZW9tc0J5QXJjW2pdIHx8IChnZW9tc0J5QXJjW2pdID0gW10pKS5wdXNoKHtpOiBpLCBnOiBnZW9tfSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0MShhcmNzKSB7XG4gICAgYXJjcy5mb3JFYWNoKGV4dHJhY3QwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3QyKGFyY3MpIHtcbiAgICBhcmNzLmZvckVhY2goZXh0cmFjdDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDMoYXJjcykge1xuICAgIGFyY3MuZm9yRWFjaChleHRyYWN0Mik7XG4gIH1cblxuICBmdW5jdGlvbiBnZW9tZXRyeShvKSB7XG4gICAgc3dpdGNoIChnZW9tID0gbywgby50eXBlKSB7XG4gICAgICBjYXNlIFwiR2VvbWV0cnlDb2xsZWN0aW9uXCI6IG8uZ2VvbWV0cmllcy5mb3JFYWNoKGdlb21ldHJ5KTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTGluZVN0cmluZ1wiOiBleHRyYWN0MShvLmFyY3MpOyBicmVhaztcbiAgICAgIGNhc2UgXCJNdWx0aUxpbmVTdHJpbmdcIjogY2FzZSBcIlBvbHlnb25cIjogZXh0cmFjdDIoby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2x5Z29uXCI6IGV4dHJhY3QzKG8uYXJjcyk7IGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGdlb21ldHJ5KG9iamVjdCk7XG5cbiAgZ2VvbXNCeUFyYy5mb3JFYWNoKGZpbHRlciA9PSBudWxsXG4gICAgICA/IGZ1bmN0aW9uKGdlb21zKSB7IGFyY3MucHVzaChnZW9tc1swXS5pKTsgfVxuICAgICAgOiBmdW5jdGlvbihnZW9tcykgeyBpZiAoZmlsdGVyKGdlb21zWzBdLmcsIGdlb21zW2dlb21zLmxlbmd0aCAtIDFdLmcpKSBhcmNzLnB1c2goZ2VvbXNbMF0uaSk7IH0pO1xuXG4gIHJldHVybiBhcmNzO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgcGFwZXJcbi8vIFByb2NlZHVyYWwgcGFyY2htZW50IGdyb3VuZDogZmlicmUgYW5kIGdyYWluIGZyb20gU1ZHIHR1cmJ1bGVuY2UgKG5vIHN0b2NrIHRleHR1cmVzKSwgcGx1cyBhIHNvZnQgdmlnbmV0dGUuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXBlckRlZnMoZGVmcykge1xuICBjb25zdCBncmFpbiA9IGRlZnMuYXBwZW5kKCdmaWx0ZXInKS5hdHRyKCdpZCcsICdwYXBlci1ncmFpbicpXG4gICAgLmF0dHIoJ3gnLCAnMCUnKS5hdHRyKCd5JywgJzAlJykuYXR0cignd2lkdGgnLCAnMTAwJScpLmF0dHIoJ2hlaWdodCcsICcxMDAlJylcbiAgICAuYXR0cignY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzJywgJ3NSR0InKTtcbiAgLy8gZmluZSBncmFpblxuICBncmFpbi5hcHBlbmQoJ2ZlVHVyYnVsZW5jZScpLmF0dHIoJ3R5cGUnLCAnZnJhY3RhbE5vaXNlJykuYXR0cignYmFzZUZyZXF1ZW5jeScsICcwLjknKS5hdHRyKCdudW1PY3RhdmVzJywgMikuYXR0cignc2VlZCcsIDExKS5hdHRyKCdzdGl0Y2hUaWxlcycsICdzdGl0Y2gnKS5hdHRyKCdyZXN1bHQnLCAnZmluZScpO1xuICAvLyBmYWludCwgbG9uZyBmaWJyZXMgKGdlbnRsZTogcGFyY2htZW50LCBub3Qgd29vZClcbiAgZ3JhaW4uYXBwZW5kKCdmZVR1cmJ1bGVuY2UnKS5hdHRyKCd0eXBlJywgJ2ZyYWN0YWxOb2lzZScpLmF0dHIoJ2Jhc2VGcmVxdWVuY3knLCAnMC4wMDYgMC4wNScpLmF0dHIoJ251bU9jdGF2ZXMnLCAyKS5hdHRyKCdzZWVkJywgNCkuYXR0cignc3RpdGNoVGlsZXMnLCAnc3RpdGNoJykuYXR0cigncmVzdWx0JywgJ2ZpYnJlJyk7XG4gIGdyYWluLmFwcGVuZCgnZmVCbGVuZCcpLmF0dHIoJ2luJywgJ2ZpbmUnKS5hdHRyKCdpbjInLCAnZmlicmUnKS5hdHRyKCdtb2RlJywgJ3NjcmVlbicpLmF0dHIoJ3Jlc3VsdCcsICdub2lzZScpO1xuICBncmFpbi5hcHBlbmQoJ2ZlQ29sb3JNYXRyaXgnKS5hdHRyKCdpbicsICdub2lzZScpLmF0dHIoJ3R5cGUnLCAnc2F0dXJhdGUnKS5hdHRyKCd2YWx1ZXMnLCAnMCcpLmF0dHIoJ3Jlc3VsdCcsICdncmF5Jyk7XG4gIC8vIGxpZnQgdGhlIGdyYXkgY2xvc2UgdG8gd2hpdGUgc28gdGhlIG11bHRpcGx5IG9ubHkgZGFya2VucyBhIGZldyBwZXJjZW50LCBhbmQgZmxhdHRlbiBhbHBoYVxuICBjb25zdCBjdCA9IGdyYWluLmFwcGVuZCgnZmVDb21wb25lbnRUcmFuc2ZlcicpLmF0dHIoJ2luJywgJ2dyYXknKS5hdHRyKCdyZXN1bHQnLCAndGV4Jyk7XG4gIGN0LmFwcGVuZCgnZmVGdW5jUicpLmF0dHIoJ3R5cGUnLCAnbGluZWFyJykuYXR0cignc2xvcGUnLCAwLjIyKS5hdHRyKCdpbnRlcmNlcHQnLCAwLjgpO1xuICBjdC5hcHBlbmQoJ2ZlRnVuY0cnKS5hdHRyKCd0eXBlJywgJ2xpbmVhcicpLmF0dHIoJ3Nsb3BlJywgMC4yMikuYXR0cignaW50ZXJjZXB0JywgMC44KTtcbiAgY3QuYXBwZW5kKCdmZUZ1bmNCJykuYXR0cigndHlwZScsICdsaW5lYXInKS5hdHRyKCdzbG9wZScsIDAuMjIpLmF0dHIoJ2ludGVyY2VwdCcsIDAuOCk7XG4gIGN0LmFwcGVuZCgnZmVGdW5jQScpLmF0dHIoJ3R5cGUnLCAndGFibGUnKS5hdHRyKCd0YWJsZVZhbHVlcycsICcxIDEnKTtcbiAgZ3JhaW4uYXBwZW5kKCdmZUJsZW5kJykuYXR0cignaW4nLCAnU291cmNlR3JhcGhpYycpLmF0dHIoJ2luMicsICd0ZXgnKS5hdHRyKCdtb2RlJywgJ211bHRpcGx5Jyk7XG5cbiAgY29uc3QgdmlnbmV0dGUgPSBkZWZzLmFwcGVuZCgncmFkaWFsR3JhZGllbnQnKS5hdHRyKCdpZCcsICdwYXBlci12aWduZXR0ZScpLmF0dHIoJ2N4JywgJzUwJScpLmF0dHIoJ2N5JywgJzUwJScpLmF0dHIoJ3InLCAnNzIlJyk7XG4gIHZpZ25ldHRlLmFwcGVuZCgnc3RvcCcpLmF0dHIoJ29mZnNldCcsICc1NSUnKS5hdHRyKCdzdG9wLWNvbG9yJywgJyMwMDAnKS5hdHRyKCdzdG9wLW9wYWNpdHknLCAwKTtcbiAgdmlnbmV0dGUuYXBwZW5kKCdzdG9wJykuYXR0cignb2Zmc2V0JywgJzEwMCUnKS5hdHRyKCdzdG9wLWNvbG9yJywgJyM0YTNhMWMnKS5hdHRyKCdzdG9wLW9wYWNpdHknLCAwLjIyKTtcbn1cblxuLy8gVGhlIHBhcGVyIGl0c2VsZjogZnVsbC1ibGVlZCBwYXJjaG1lbnQgd2l0aCBncmFpbi5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3UGFwZXIocm9vdCwgVywgSCkge1xuICByb290LmFwcGVuZCgncmVjdCcpLmF0dHIoJ2NsYXNzJywgJ3BhcGVyJykuYXR0cignd2lkdGgnLCBXKS5hdHRyKCdoZWlnaHQnLCBIKS5hdHRyKCdmaWx0ZXInLCAndXJsKCNwYXBlci1ncmFpbiknKTtcbn1cblxuLy8gR3JhaW4gYW5kIHZpZ25ldHRlIGxhaWQgb3ZlciB0aGUgZmluaXNoZWQgbWFwIHNvIGxhbmQgYW5kIHNlYSBzaGFyZSB0aGUgc2hlZXQuXG5leHBvcnQgZnVuY3Rpb24gZHJhd1BhcGVyT3ZlcmxheShyb290LCBXLCBIKSB7XG4gIHJvb3QuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAncGFwZXItb3ZlcmxheScpLmF0dHIoJ3dpZHRoJywgVykuYXR0cignaGVpZ2h0JywgSCkuYXR0cignZmlsdGVyJywgJ3VybCgjcGFwZXItZ3JhaW4pJyk7XG4gIHJvb3QuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAncGFwZXItdmlnbmV0dGUnKS5hdHRyKCd3aWR0aCcsIFcpLmF0dHIoJ2hlaWdodCcsIEgpLmF0dHIoJ2ZpbGwnLCAndXJsKCNwYXBlci12aWduZXR0ZSknKTtcbn1cbiIsICIvLyBQYXJjaG1lbnQgXHUyMDE0IGxhYmVsc1xuLy8gU3RhZ2UgbGFiZWxzIChyZWdpb25zIGluIHNwYWNlZCBzbWFsbCBjYXBzLCB3YXRlciBpbiBpdGFsaWMpIHNldCBhbG9uZyB0aGVpciBwYXJhbGxlbCBzbyB0aGV5IGZvbGxvdyB0aGVcbi8vIHByb2plY3Rpb24ncyBjdXJ2ZTsgcG9saXR5IGxhYmVscyBmb3IgaGlnaGxpZ2h0ZWQgc3RhdGVzIGF0IHRoZSBsYXJnZXN0IHBvbHlnb24ncyBjZW50cmUuXG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdTdGFnZUxhYmVscyhsYXllciwgZGVmcywgc3RhZ2UsIHBhdGgpIHtcbiAgKHN0YWdlLmxhYmVscyA/PyBbXSkuZm9yRWFjaCgobCwgaSkgPT4ge1xuICAgIC8vIFRoZSBhcmMgaXMgb25seSBhIGd1aWRlIGZvciB0aGUgdGV4dCwgc28gaXQgY2FuIGJlIG11Y2ggbG9uZ2VyIHRoYW4gdGhlIG5hbWU7IGEgc2hvcnQgb25lIGNsaXBzIHRoZSBlbmRzLlxuICAgIGNvbnN0IHNwYW4gPSBsLnNwYW4gPz8gKGwua2luZCA9PT0gJ3dhdGVyJyA/IDUwIDogNzApO1xuICAgIGNvbnN0IGFyYyA9IHsgdHlwZTogJ0xpbmVTdHJpbmcnLCBjb29yZGluYXRlczogZDMucmFuZ2UobC5sb24gLSBzcGFuIC8gMiwgbC5sb24gKyBzcGFuIC8gMiArIDFlLTYsIDAuNSkubWFwKCh4KSA9PiBbeCwgbC5sYXRdKSB9O1xuICAgIGNvbnN0IGlkID0gYHN0YWdlLWxhYmVsLSR7c3RhZ2UuaWR9LSR7aX1gO1xuICAgIGRlZnMuYXBwZW5kKCdwYXRoJykuYXR0cignaWQnLCBpZCkuYXR0cignZCcsIHBhdGgoYXJjKSk7XG4gICAgbGF5ZXIuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCBgbGFiZWwgJHtsLmtpbmR9YClcbiAgICAgIC5hcHBlbmQoJ3RleHRQYXRoJykuYXR0cignaHJlZicsIGAjJHtpZH1gKS5hdHRyKCdzdGFydE9mZnNldCcsICc1MCUnKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgLnRleHQobC50ZXh0KTtcbiAgfSk7XG59XG5cbi8vIExhcmdlc3QgcG9seWdvbiBvZiBhIChNdWx0aSlQb2x5Z29uIGZlYXR1cmUsIGJ5IHNwaGVyaWNhbCBhcmVhLlxuZnVuY3Rpb24gbGFyZ2VzdFBvbHlnb24oZikge1xuICBjb25zdCBnID0gZi5nZW9tZXRyeTtcbiAgaWYgKGcudHlwZSA9PT0gJ1BvbHlnb24nKSByZXR1cm4gZztcbiAgbGV0IGJlc3QgPSBudWxsLCBiZXN0QXJlYSA9IC0xO1xuICBmb3IgKGNvbnN0IGNvb3JkcyBvZiBnLmNvb3JkaW5hdGVzKSB7XG4gICAgY29uc3QgcG9seSA9IHsgdHlwZTogJ1BvbHlnb24nLCBjb29yZGluYXRlczogY29vcmRzIH07XG4gICAgY29uc3QgYSA9IGQzLmdlb0FyZWEocG9seSk7XG4gICAgaWYgKGEgPiBiZXN0QXJlYSkgeyBiZXN0QXJlYSA9IGE7IGJlc3QgPSBwb2x5OyB9XG4gIH1cbiAgcmV0dXJuIGJlc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2xpdHlMYWJlbERhdGEoZmVhdHVyZXMsIHBhdGgpIHtcbiAgLy8gT25lIGxhYmVsIHBlciBuYW1lOiBzb21lIGJhc2UgbWFwcyBzcGxpdCBhIHN0YXRlIGludG8gc2V2ZXJhbCBzYW1lLW5hbWVkIHBvbHlnb25zOyBsYWJlbCB0aGUgbGFyZ2VzdC5cbiAgY29uc3QgYmVzdCA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCBmIG9mIGZlYXR1cmVzKSB7XG4gICAgY29uc3QgcG9seSA9IGxhcmdlc3RQb2x5Z29uKGYpO1xuICAgIGlmICghcG9seSkgY29udGludWU7XG4gICAgY29uc3QgW1tieDAsIGJ5MF0sIFtieDEsIGJ5MV1dID0gcGF0aC5ib3VuZHMocG9seSk7XG4gICAgY29uc3QgdyA9IGJ4MSAtIGJ4MCwgaCA9IGJ5MSAtIGJ5MDtcbiAgICBpZiAoISh3ID4gNzAgJiYgaCA+IDI0KSkgY29udGludWU7IC8vIHRvbyBzbWFsbCB0byBjYXJyeSBhIG5hbWUgYXQgdGhpcyBzY2FsZVxuICAgIGNvbnN0IFtjeCwgY3ldID0gcGF0aC5jZW50cm9pZChwb2x5KTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShjeCkpIGNvbnRpbnVlO1xuICAgIGNvbnN0IHRleHQgPSBmLnByb3BlcnRpZXMuY2xzPy5sYWJlbCA/PyBmLnByb3BlcnRpZXMubmFtZTtcbiAgICBjb25zdCBhcmVhID0gdyAqIGg7XG4gICAgY29uc3QgcHJldiA9IGJlc3QuZ2V0KHRleHQpO1xuICAgIGlmIChwcmV2ICYmIHByZXYuYXJlYSA+PSBhcmVhKSBjb250aW51ZTtcbiAgICBjb25zdCBzaXplID0gTWF0aC5tYXgoMTMsIE1hdGgubWluKDI0LCBNYXRoLnNxcnQoYXJlYSkgLyAxNikpO1xuICAgIGJlc3Quc2V0KHRleHQsIHsgaWQ6IHRleHQsIHRleHQsIHg6IGN4LCB5OiBjeSwgc2l6ZSwgYXJlYSB9KTtcbiAgfVxuICByZXR1cm4gWy4uLmJlc3QudmFsdWVzKCldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd1BvbGl0eUxhYmVscyhsYXllciwgZGF0YSkge1xuICBsYXllci5zZWxlY3RBbGwoJ3RleHQnKS5kYXRhKGRhdGEsIChkKSA9PiBkLmlkKS5qb2luKCd0ZXh0JylcbiAgICAuYXR0cignY2xhc3MnLCAnbGFiZWwgcG9saXR5JylcbiAgICAuYXR0cigneCcsIChkKSA9PiBkLngpLmF0dHIoJ3knLCAoZCkgPT4gZC55KVxuICAgIC5hdHRyKCdmb250LXNpemUnLCAoZCkgPT4gZC5zaXplKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKS5hdHRyKCdkb21pbmFudC1iYXNlbGluZScsICdtaWRkbGUnKVxuICAgIC50ZXh0KChkKSA9PiBkLnRleHQpO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgY2FydG91Y2hlXG4vLyBCb3R0b20tbGVmdCBicmFja2V0ZWQgYm94OiBQQVJDSE1FTlQgd29yZG1hcmsgXHUwMEI3IG1hcCB0aXRsZSBcdTAwQjcgeWVhciBzaG93biBcdTAwQjcgc2NhbGUgYmFyLiBOb3RoaW5nIGVsc2UuXG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcblxuZnVuY3Rpb24gc2NhbGVCYXIocHJvamVjdGlvbiwgY2VudGVyLCB0YXJnZXRQeCA9IDE3MCkge1xuICBjb25zdCBbbG9uLCBsYXRdID0gY2VudGVyO1xuICBjb25zdCBwMSA9IHByb2plY3Rpb24oW2xvbiwgbGF0XSksIHAyID0gcHJvamVjdGlvbihbbG9uICsgMSwgbGF0XSk7XG4gIGlmICghcDEgfHwgIXAyKSByZXR1cm4geyBrbTogMTAwMCwgcHg6IHRhcmdldFB4IH07XG4gIGNvbnN0IGttUGVyRGVnID0gZDMuZ2VvRGlzdGFuY2UoW2xvbiwgbGF0XSwgW2xvbiArIDEsIGxhdF0pICogNjM3MTtcbiAgY29uc3QgcHhQZXJLbSA9IE1hdGguaHlwb3QocDJbMF0gLSBwMVswXSwgcDJbMV0gLSBwMVsxXSkgLyBrbVBlckRlZztcbiAgY29uc3Qga20gPSBbMTAwLCAyMDAsIDI1MCwgNTAwLCAxMDAwLCAyMDAwLCAzMDAwLCA1MDAwXS5yZWR1Y2UoKGIsIGspID0+IChNYXRoLmFicyhrICogcHhQZXJLbSAtIHRhcmdldFB4KSA8IE1hdGguYWJzKGIgKiBweFBlckttIC0gdGFyZ2V0UHgpID8gayA6IGIpKTtcbiAgcmV0dXJuIHsga20sIHB4OiBrbSAqIHB4UGVyS20gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhcnRvdWNoZShyb290LCB7IHgwLCB5MSB9LCBzdGFnZSwgcHJvamVjdGlvbikge1xuICBjb25zdCBXID0gMzMwLCBIID0gMTI4LCBQQUQgPSAxNjtcbiAgY29uc3QgeCA9IHgwICsgMjIsIHkgPSB5MSAtIDIyIC0gSDtcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnY2FydG91Y2hlJykuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCR7eX0pYCk7XG4gIGcuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnY2FydG91Y2hlLWJveCcpLmF0dHIoJ3dpZHRoJywgVykuYXR0cignaGVpZ2h0JywgSCk7XG4gIC8vIGNvcm5lciBicmFja2V0c1xuICBjb25zdCBiID0gMTIsIG8gPSA1O1xuICBjb25zdCBjb3JuZXJzID0gW1stbywgLW8sIDEsIDFdLCBbVyArIG8sIC1vLCAtMSwgMV0sIFstbywgSCArIG8sIDEsIC0xXSwgW1cgKyBvLCBIICsgbywgLTEsIC0xXV07XG4gIGcuc2VsZWN0QWxsKCdwYXRoLmJyYWNrZXQnKS5kYXRhKGNvcm5lcnMpLmpvaW4oJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdicmFja2V0JylcbiAgICAuYXR0cignZCcsIChbY3gsIGN5LCBzeCwgc3ldKSA9PiBgTSR7Y3ggKyBzeCAqIGJ9LCR7Y3l9TCR7Y3h9LCR7Y3l9TCR7Y3h9LCR7Y3kgKyBzeSAqIGJ9YCk7XG5cbiAgZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICd3b3JkbWFyaycpLmF0dHIoJ3gnLCBQQUQpLmF0dHIoJ3knLCBQQUQgKyAxMikudGV4dCgnUEFSQ0hNRU5UJyk7XG4gIGcuYXBwZW5kKCdsaW5lJykuYXR0cignY2xhc3MnLCAncnVsZScpLmF0dHIoJ3gxJywgUEFEKS5hdHRyKCd4MicsIFcgLSBQQUQpLmF0dHIoJ3kxJywgUEFEICsgMjApLmF0dHIoJ3kyJywgUEFEICsgMjApO1xuICBjb25zdCB0aXRsZSA9IGcuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCAnbWFwLXRpdGxlJykuYXR0cigneCcsIFBBRCkuYXR0cigneScsIFBBRCArIDQ2KS50ZXh0KHN0YWdlLnRpdGxlKTtcbiAgY29uc3QgeWVhciA9IGcuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCAneWVhcicpLmF0dHIoJ3gnLCBXIC0gUEFEKS5hdHRyKCd5JywgUEFEICsgNDgpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ2VuZCcpO1xuICBjb25zdCBiYXNlTm90ZSA9IGcuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCAnYmFzZS1ub3RlJykuYXR0cigneCcsIFcgLSBQQUQpLmF0dHIoJ3knLCBQQUQgKyA2NCkuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJyk7XG5cbiAgLy8gc2NhbGUgYmFyXG4gIGNvbnN0IGUgPSBzdGFnZS5leHRlbnQ7XG4gIGNvbnN0IHsga20sIHB4IH0gPSBzY2FsZUJhcihwcm9qZWN0aW9uLCBbKGUud2VzdCArIGUuZWFzdCkgLyAyLCAoZS5zb3V0aCArIGUubm9ydGgpIC8gMl0pO1xuICBjb25zdCBzYiA9IGcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2NhbGViYXInKS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7UEFEfSwke0ggLSBQQUQgLSAxMH0pYCk7XG4gIHNiLmFwcGVuZCgnbGluZScpLmF0dHIoJ3gxJywgMCkuYXR0cigneDInLCBweCkuYXR0cigneTEnLCAwKS5hdHRyKCd5MicsIDApO1xuICBzYi5zZWxlY3RBbGwoJ2xpbmUudGljaycpLmRhdGEoWzAsIHB4IC8gMiwgcHhdKS5qb2luKCdsaW5lJykuYXR0cignY2xhc3MnLCAndGljaycpXG4gICAgLmF0dHIoJ3gxJywgKGQpID0+IGQpLmF0dHIoJ3gyJywgKGQpID0+IGQpLmF0dHIoJ3kxJywgLTUpLmF0dHIoJ3kyJywgMCk7XG4gIHNiLmFwcGVuZCgncmVjdCcpLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgLTMpLmF0dHIoJ3dpZHRoJywgcHggLyAyKS5hdHRyKCdoZWlnaHQnLCAzKTtcbiAgc2IuYXBwZW5kKCd0ZXh0JykuYXR0cigneCcsIHB4ICsgOCkuYXR0cigneScsIDEpLnRleHQoYCR7a20udG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJyl9IGttYCk7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXRUaXRsZSh0ZXh0KSB7IHRpdGxlLnRleHQodGV4dCk7IH0sXG4gICAgc2V0WWVhcih5LCBzb3VyY2VZZWFyKSB7XG4gICAgICB5ZWFyLnRleHQoeSA8IDAgPyBgJHsteX0gQkNFYCA6IHkpO1xuICAgICAgYmFzZU5vdGUudGV4dChzb3VyY2VZZWFyICE9IG51bGwgJiYgc291cmNlWWVhciAhPT0geSA/IGBiYXNlIG1hcCAke3NvdXJjZVllYXJ9YCA6ICcnKTtcbiAgICB9LFxuICB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgdGltZWxpbmUgc3RyaXBcbi8vIFRoZSBib3R0b20gZWRnZSBvZiB0aGUgZnJhbWU6IHRoZSBzdGFnZSdzIGZ1bGwgc3BhbiB3aXRoIHllYXIgdGlja3MsIHNuYXBzaG90IHllYXJzIGFzIGRvdHMsIHRoZSBzaG93biB5ZWFyIG1hcmtlZC5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RyaXAocm9vdCwgeyB4MCwgeDEsIHkxIH0sIHN0YWdlLCB5ZWFycywgb25ZZWFyKSB7XG4gIGNvbnN0IFthLCBiXSA9IHN0YWdlLnNwYW47XG4gIGNvbnN0IHggPSBkMy5zY2FsZUxpbmVhcigpLmRvbWFpbihbYSwgYl0pLnJhbmdlKFt4MCwgeDFdKTtcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc3RyaXAnKTtcblxuICBnLmFwcGVuZCgnbGluZScpLmF0dHIoJ2NsYXNzJywgJ2Jhc2VsaW5lJykuYXR0cigneDEnLCB4MCkuYXR0cigneDInLCB4MSkuYXR0cigneTEnLCB5MSkuYXR0cigneTInLCB5MSk7XG5cbiAgY29uc3QgbWlub3IgPSBkMy5yYW5nZShNYXRoLmNlaWwoYSAvIDUwKSAqIDUwLCBiICsgMSwgNTApO1xuICBnLnNlbGVjdEFsbCgnbGluZS50aWNrJykuZGF0YShtaW5vcikuam9pbignbGluZScpXG4gICAgLmF0dHIoJ2NsYXNzJywgKGQpID0+IGB0aWNrICR7ZCAlIDEwMCA9PT0gMCA/ICdtYWpvcicgOiAnbWlub3InfWApXG4gICAgLmF0dHIoJ3gxJywgKGQpID0+IHgoZCkpLmF0dHIoJ3gyJywgKGQpID0+IHgoZCkpLmF0dHIoJ3kxJywgeTEpLmF0dHIoJ3kyJywgKGQpID0+IHkxICsgKGQgJSAxMDAgPT09IDAgPyAxMCA6IDUpKTtcbiAgY29uc3QgdGlja0xhYmVscyA9IGcuc2VsZWN0QWxsKCd0ZXh0LnRpY2stbGFiZWwnKS5kYXRhKG1pbm9yLmZpbHRlcigoZCkgPT4gZCAlIDEwMCA9PT0gMCkpLmpvaW4oJ3RleHQnKVxuICAgIC5hdHRyKCdjbGFzcycsICd0aWNrLWxhYmVsJykuYXR0cigneCcsIChkKSA9PiB4KGQpKS5hdHRyKCd5JywgeTEgKyAyNikuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAudGV4dCgoZCkgPT4gKGQgPCAwID8gYCR7LWR9IEJDRWAgOiBkKSk7XG5cbiAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5zbmFwc2hvdCcpLmRhdGEoeWVhcnMpLmpvaW4oJ2NpcmNsZScpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3NuYXBzaG90JykuYXR0cignY3gnLCAoZCkgPT4geChkKSkuYXR0cignY3knLCB5MSkuYXR0cigncicsIDUpXG4gICAgLm9uKCdjbGljaycsIChfLCBkKSA9PiBvblllYXIgJiYgb25ZZWFyKGQpKVxuICAgIC5hcHBlbmQoJ3RpdGxlJykudGV4dCgoZCkgPT4gYFNob3cgJHtkfWApO1xuXG4gIGNvbnN0IG1hcmtlciA9IGcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VyJyk7XG4gIG1hcmtlci5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00wLC05TDgsMEwwLDlMLTgsMFonKTtcbiAgY29uc3QgbWFya2VyTGFiZWwgPSBtYXJrZXIuYXBwZW5kKCd0ZXh0JykuYXR0cigneScsIDMwKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKTtcblxuICByZXR1cm4ge1xuICAgIHNldFllYXIoeWVhcikge1xuICAgICAgbWFya2VyLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4KHllYXIpfSwke3kxfSlgKTtcbiAgICAgIG1hcmtlckxhYmVsLnRleHQoeWVhcik7XG4gICAgICB0aWNrTGFiZWxzLmNsYXNzZWQoJ2hpZGRlbicsIChkKSA9PiBNYXRoLmFicyh4KGQpIC0geCh5ZWFyKSkgPCAzNCk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICIvLyBQYXJjaG1lbnQgXHUyMDE0IGxlZ2VuZFxuLy8gVG9wLXJpZ2h0IGluc2lkZSB0aGUgZnJhbWUuIEVudHJpZXMgY29tZSBmcm9tIHRoZSBhY3RpdmUgdHJhY2tlcjsgdGhlIHZpc3VhbCBncmFtbWFyIG5ldmVyIGNoYW5nZXMuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMZWdlbmQocm9vdCwgeyB4MSwgeTAgfSkge1xuICBjb25zdCBXID0gMjM2LCBQQUQgPSAxNCwgUk9XID0gMjI7XG4gIGNvbnN0IGcgPSByb290LmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ2xlZ2VuZCcpO1xuICBjb25zdCBib3ggPSBnLmFwcGVuZCgncmVjdCcpLmF0dHIoJ2NsYXNzJywgJ2xlZ2VuZC1ib3gnKS5hdHRyKCd3aWR0aCcsIFcpO1xuICBjb25zdCB0aXRsZSA9IGcuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCAnbGVnZW5kLXRpdGxlJykuYXR0cigneCcsIFBBRCkuYXR0cigneScsIFBBRCArIDEwKTtcbiAgY29uc3Qgcm93cyA9IGcuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke1BBRH0sJHtQQUQgKyAyNn0pYCk7XG5cbiAgZnVuY3Rpb24gc2V0KHRyYWNrZXIpIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdHJhY2tlci5sZWdlbmQgPz8gW107XG4gICAgdGl0bGUudGV4dCh0cmFja2VyLnRpdGxlID8/IHRyYWNrZXIuaWQpO1xuICAgIGNvbnN0IEggPSBQQUQgKiAyICsgMjYgKyBlbnRyaWVzLmxlbmd0aCAqIFJPVztcbiAgICBib3guYXR0cignaGVpZ2h0JywgSCk7XG4gICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eDEgLSAyMiAtIFd9LCR7eTAgKyAyMn0pYCk7XG4gICAgY29uc3QgciA9IHJvd3Muc2VsZWN0QWxsKCdnLnJvdycpLmRhdGEoZW50cmllcykuam9pbignZycpLmF0dHIoJ2NsYXNzJywgJ3JvdycpLmF0dHIoJ3RyYW5zZm9ybScsIChfLCBpKSA9PiBgdHJhbnNsYXRlKDAsJHtpICogUk9XfSlgKTtcbiAgICByLnNlbGVjdEFsbCgnKicpLnJlbW92ZSgpO1xuICAgIHIuZWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgY29uc3Qgcm93ID0gZDNTZWxlY3QodGhpcyk7XG4gICAgICBpZiAoZS5zd2F0Y2ggPT09ICdmaWxsJykge1xuICAgICAgICByb3cuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCBgc3dhdGNoIGZpbGwtJHtlLmtleX1gKS5hdHRyKCd4JywgMCkuYXR0cigneScsIDApLmF0dHIoJ3dpZHRoJywgMjIpLmF0dHIoJ2hlaWdodCcsIDE0KTtcbiAgICAgIH0gZWxzZSBpZiAoZS5zd2F0Y2ggPT09ICdsaW5lJykge1xuICAgICAgICByb3cuYXBwZW5kKCdsaW5lJykuYXR0cignY2xhc3MnLCBgc3dhdGNoLWxpbmUgJHtlLnN0eWxlfWApLmF0dHIoJ3gxJywgMCkuYXR0cigneDInLCAyMikuYXR0cigneTEnLCA3KS5hdHRyKCd5MicsIDcpO1xuICAgICAgfSBlbHNlIGlmIChlLnN3YXRjaCA9PT0gJ3NoYXBlJykge1xuICAgICAgICByb3cuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCBgbWFyayAke2Uuc2hhcGV9YCkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgxMSw3KScpLmF0dHIoJ2QnLCBTSEFQRVNbZS5zaGFwZV0gPz8gU0hBUEVTLmNpcmNsZSk7XG4gICAgICB9XG4gICAgICByb3cuYXBwZW5kKCd0ZXh0JykuYXR0cigneCcsIDMyKS5hdHRyKCd5JywgMTEpLnRleHQoZS5sYWJlbCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHsgc2V0IH07XG59XG5cbi8vIFBvaW50IG1hcmtzIChicmllZiBcdTAwQTc1KTogYmF0dGxlL3NpZWdlID0gcnVzdCBkaWFtb25kOyBmb3VuZGluZy9jYXBpdGFsID0gbW9zcyBjaXJjbGU7IG1vbnVtZW50ID0gbmF2eSBzcXVhcmU7IHRyZWF0eSA9IG5hdnkgdHJpYW5nbGUuXG5leHBvcnQgY29uc3QgU0hBUEVTID0ge1xuICAncnVzdC1kaWFtb25kJzogJ00wLC03TDcsMEwwLDdMLTcsMFonLFxuICAnbW9zcy1jaXJjbGUnOiAnTTAsLTZBNiw2IDAgMSwxIDAsNkE2LDYgMCAxLDEgMCwtNlonLFxuICAnbmF2eS1zcXVhcmUnOiAnTS02LC02SDZWNkgtNlonLFxuICAnbmF2eS10cmlhbmdsZSc6ICdNMCwtN0w3LDZILTdaJyxcbiAgY2lyY2xlOiAnTTAsLTZBNiw2IDAgMSwxIDAsNkE2LDYgMCAxLDEgMCwtNlonLFxufTtcblxuLy8gdGlueSBsb2NhbCBhbGlhcyB0byBhdm9pZCBpbXBvcnRpbmcgYWxsIG9mIGQzIGhlcmVcbmltcG9ydCB7IHNlbGVjdCBhcyBkM1NlbGVjdCB9IGZyb20gJ2QzJztcbiIsICIvLyBQYXJjaG1lbnQgXHUyMDE0IGJhc2UgcmVuZGVyZXJcbi8vIEJ1aWxkcyB0aGUgc3RhZ2U6IHByb2plY3Rpb24sIHBhcGVyLCBvY2VhbiwgYmF0aHltZXRyeSwgcmVsaWVmLCBsYW5kLCBwb2xpdGllcywgd2F0ZXIgbGluZXMsIGNvYXN0LCBncmF0aWN1bGUsXG4vLyBsYWJlbHMsIGxlZ2VuZCwgY2FydG91Y2hlLCB0aW1lbGluZSBzdHJpcC4gQWxsIGdlb21ldHJ5IGNvbWVzIGZyb20gdGhlIGRvd25sb2FkZWQgbGF5ZXJzOyB0aGlzIGZpbGUgb25seVxuLy8gcHJvamVjdHMgYW5kIHN0eWxlcyBpdC5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IHsgZmVhdHVyZSwgbWVzaCB9IGZyb20gJ3RvcG9qc29uLWNsaWVudCc7XG5pbXBvcnQgeyBhc3NldFVSTCB9IGZyb20gJy4uL2RhdGEvbG9hZGVyLmpzJztcbmltcG9ydCB7IHBhcGVyRGVmcywgZHJhd1BhcGVyLCBkcmF3UGFwZXJPdmVybGF5IH0gZnJvbSAnLi9wYXBlci5qcyc7XG5pbXBvcnQgeyBkcmF3U3RhZ2VMYWJlbHMsIHBvbGl0eUxhYmVsRGF0YSwgZHJhd1BvbGl0eUxhYmVscyB9IGZyb20gJy4vbGFiZWxzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUNhcnRvdWNoZSB9IGZyb20gJy4vY2FydG91Y2hlLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0cmlwIH0gZnJvbSAnLi9zdHJpcC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVMZWdlbmQgfSBmcm9tICcuL2xlZ2VuZC5qcyc7XG5cbmV4cG9ydCBjb25zdCBXID0gMTkyMDtcbmV4cG9ydCBjb25zdCBIID0gMTA4MDtcbi8vIFRoZSBnb2xkIHJpbmcuIFRoZSBib3R0b20gaXMgZGVlcGVyIGJlY2F1c2UgaXQgY2FycmllcyB0aGUgdGltZWxpbmUgc3RyaXAuXG5leHBvcnQgY29uc3QgRlJBTUUgPSB7IGxlZnQ6IDMyLCByaWdodDogMzIsIHRvcDogMzIsIGJvdHRvbTogNjQgfTtcblxuY29uc3QgUFJPSkVDVElPTlMgPSB7XG4gIGVxdWFsRWFydGg6ICgpID0+IGQzLmdlb0VxdWFsRWFydGgoKSxcbiAgbGFtYmVydEF6aW11dGhhbEVxdWFsQXJlYTogKCkgPT4gZDMuZ2VvQXppbXV0aGFsRXF1YWxBcmVhKCksXG4gIGFsYmVyc1VzYTogKCkgPT4gZDMuZ2VvQWxiZXJzVXNhKCksXG59O1xuXG4vLyBBIGxvbi9sYXQgYm94IHdpdGggaXRzIGVkZ2VzIGRlbnNpZmllZCBzbyBmaXRFeHRlbnQgc2VlcyB0aGUgYm94J3MgY3VydmVkIG91dGxpbmUgaW4gdGhlIHByb2plY3Rpb24uXG4vLyBkMy1nZW8gdHJlYXRzIHNwaGVyaWNhbCBwb2x5Z29ucyBieSB3aW5kaW5nIG9yZGVyOiB0aGUgZXh0ZXJpb3IgcmluZyBtdXN0IHJ1biBjbG9ja3dpc2Vcbi8vICh3ZXN0XHUyMTkyZWFzdCBhbG9uZyB0aGUgbm9ydGggZWRnZSBmaXJzdCksIG9yIHRoZSBcImluc2lkZVwiIGJlY29tZXMgdGhlIHJlc3Qgb2YgdGhlIGdsb2JlLlxuZnVuY3Rpb24gZXh0ZW50UG9seWdvbih7IHdlc3QsIHNvdXRoLCBlYXN0LCBub3J0aCB9LCBzdGVwID0gMSkge1xuICBjb25zdCByaW5nID0gW107XG4gIGZvciAobGV0IHggPSB3ZXN0OyB4IDwgZWFzdDsgeCArPSBzdGVwKSByaW5nLnB1c2goW3gsIG5vcnRoXSk7XG4gIGZvciAobGV0IHkgPSBub3J0aDsgeSA+IHNvdXRoOyB5IC09IHN0ZXApIHJpbmcucHVzaChbZWFzdCwgeV0pO1xuICBmb3IgKGxldCB4ID0gZWFzdDsgeCA+IHdlc3Q7IHggLT0gc3RlcCkgcmluZy5wdXNoKFt4LCBzb3V0aF0pO1xuICBmb3IgKGxldCB5ID0gc291dGg7IHkgPCBub3J0aDsgeSArPSBzdGVwKSByaW5nLnB1c2goW3dlc3QsIHldKTtcbiAgcmluZy5wdXNoKHJpbmdbMF0pO1xuICByZXR1cm4geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbcmluZ10gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQcm9qZWN0aW9uKHN0YWdlLCBpbm5lcikge1xuICBjb25zdCBtYWtlID0gUFJPSkVDVElPTlNbc3RhZ2UucHJvamVjdGlvbl07XG4gIGlmICghbWFrZSkgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb2plY3Rpb24gJHtzdGFnZS5wcm9qZWN0aW9ufWApO1xuICBjb25zdCBwcm9qID0gbWFrZSgpO1xuICBpZiAoc3RhZ2Uucm90YXRlICYmIHByb2oucm90YXRlKSBwcm9qLnJvdGF0ZShzdGFnZS5yb3RhdGUpO1xuICBwcm9qLmZpdEV4dGVudChpbm5lciwgZXh0ZW50UG9seWdvbihzdGFnZS5leHRlbnQpKTtcbiAgcmV0dXJuIHByb2o7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZShzdmcsIHN0YWdlLCBsYXllcnMsIHsgdHJhY2tlciwgeWVhcnMgPSBbXSwgb25ZZWFyIH0gPSB7fSkge1xuICBjb25zdCBpbm5lciA9IFtbRlJBTUUubGVmdCwgRlJBTUUudG9wXSwgW1cgLSBGUkFNRS5yaWdodCwgSCAtIEZSQU1FLmJvdHRvbV1dO1xuICBjb25zdCBbW3gwLCB5MF0sIFt4MSwgeTFdXSA9IGlubmVyO1xuICBjb25zdCBmcmFtZSA9IHsgeDAsIHkwLCB4MSwgeTEgfTtcbiAgY29uc3QgcHJvamVjdGlvbiA9IG1ha2VQcm9qZWN0aW9uKHN0YWdlLCBpbm5lcik7XG4gIGNvbnN0IHBhdGggPSBkMy5nZW9QYXRoKHByb2plY3Rpb24pO1xuXG4gIC8vIFByb2plY3RlZCBwYXRoIHN0cmluZ3MgYXJlIGNhY2hlZCBwZXIgZmVhdHVyZSBvYmplY3Q6IGEgc25hcHNob3Qgc3dpdGNoIG9ubHkgcmUtYmluZHMgY2FjaGVkIHN0cmluZ3MuXG4gIGNvbnN0IGNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbiAgY29uc3QgZCA9IChmKSA9PiB7XG4gICAgbGV0IHMgPSBjYWNoZS5nZXQoZik7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkgeyBzID0gcGF0aChmKSB8fCAnJzsgY2FjaGUuc2V0KGYsIHMpOyB9XG4gICAgcmV0dXJuIHM7XG4gIH07XG5cbiAgc3ZnLmF0dHIoJ3ZpZXdCb3gnLCBgMCAwICR7V30gJHtIfWApLmF0dHIoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAneE1pZFlNaWQgbWVldCcpO1xuICBzdmcuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG5cbiAgY29uc3QgZGVmcyA9IHN2Zy5hcHBlbmQoJ2RlZnMnKTtcbiAgcGFwZXJEZWZzKGRlZnMpO1xuICBkZWZzLmFwcGVuZCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsICdmcmFtZS1jbGlwJykuYXBwZW5kKCdyZWN0JylcbiAgICAuYXR0cigneCcsIHgwKS5hdHRyKCd5JywgeTApLmF0dHIoJ3dpZHRoJywgeDEgLSB4MCkuYXR0cignaGVpZ2h0JywgeTEgLSB5MCk7XG5cbiAgY29uc3Qgcm9vdCA9IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzdGFnZScpO1xuICBkcmF3UGFwZXIocm9vdCwgVywgSCk7XG5cbiAgY29uc3QgbWFwID0gcm9vdC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdtYXAnKS5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNmcmFtZS1jbGlwKScpO1xuICAvLyBUaGUgb2NlYW4gaXMgdGhlIGdsb2JlIGl0c2VsZjsgYW55dGhpbmcgYmV5b25kIGl0cyBlZGdlIHN0YXlzIHBhcGVyLlxuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnb2NlYW4nKS5hdHRyKCdkJywgZCh7IHR5cGU6ICdTcGhlcmUnIH0pKTtcblxuICAvLyBCYXRoeW1ldHJ5OiBoYWlybGluZSBjb250b3VycyBpbiB0aGUgb2NlYW4gdG9uZS5cbiAgY29uc3QgYmF0aHkgPSBmZWF0dXJlKGxheWVycy5iYXRoeSwgbGF5ZXJzLmJhdGh5Lm9iamVjdHMuYmF0aHltZXRyeSk7XG4gIG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdiYXRoeW1ldHJ5JylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShiYXRoeS5mZWF0dXJlcykuam9pbigncGF0aCcpLmF0dHIoJ2QnLCBkKTtcblxuICAvLyBMYW5kIGF0IHJlc3QgKGNyZWFtKSwgdGhlbiByZWxpZWYgKHByZS1yZW5kZXJlZCBmb3IgdGhpcyBzdGFnZSwgd2hlbiBwcmVzZW50KSwgbWFza2VkIHRvIGxhbmQuXG4gIGNvbnN0IG5lID0gbGF5ZXJzLm5lO1xuICBjb25zdCBsYW5kID0gZmVhdHVyZShuZSwgbmUub2JqZWN0cy5sYW5kKTtcbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xhbmQnKS5hdHRyKCdkJywgZChsYW5kKSk7XG4gIGlmIChzdGFnZS5yZWxpZWYpIHtcbiAgICBkZWZzLmFwcGVuZCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsICdsYW5kLWNsaXAnKS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgZChsYW5kKSk7XG4gICAgbWFwLmFwcGVuZCgnaW1hZ2UnKS5hdHRyKCdjbGFzcycsICdyZWxpZWYnKVxuICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2xhbmQtY2xpcCknKVxuICAgICAgLmF0dHIoJ3gnLCB4MCkuYXR0cigneScsIHkwKS5hdHRyKCd3aWR0aCcsIHgxIC0geDApLmF0dHIoJ2hlaWdodCcsIHkxIC0geTApXG4gICAgICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJylcbiAgICAgIC5hdHRyKCdocmVmJywgYXNzZXRVUkwoYGFzc2V0cy8ke3N0YWdlLnJlbGllZn1gKSk7XG4gIH1cblxuICAvLyBQb2xpdGllcyAoZmlsbGVkIHBlciBzbmFwc2hvdCkgYW5kIHRoZWlyIGludGVyaW9yIGJvcmRlcnMuXG4gIGNvbnN0IHBvbGl0aWVzID0gbWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvbGl0aWVzJyk7XG4gIGNvbnN0IGJvcmRlcnMgPSBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnYm9yZGVycycpO1xuXG4gIC8vIFdhdGVyIGxpbmVzIGFuZCBjb2FzdC5cbiAgY29uc3Qgcml2ZXJzID0gZmVhdHVyZShuZSwgbmUub2JqZWN0cy5yaXZlcnMpO1xuICBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncml2ZXJzJylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShyaXZlcnMuZmVhdHVyZXMuZmlsdGVyKChmKSA9PiAoZi5wcm9wZXJ0aWVzLnNjYWxlcmFuayA/PyAwKSA8PSA3KSkuam9pbigncGF0aCcpLmF0dHIoJ2QnLCBkKTtcbiAgY29uc3QgbGFrZXMgPSBmZWF0dXJlKG5lLCBuZS5vYmplY3RzLmxha2VzKTtcbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xha2VzJykuYXR0cignZCcsIGQobGFrZXMpKTtcbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2NvYXN0bGluZScpLmF0dHIoJ2QnLCBkKGZlYXR1cmUobmUsIG5lLm9iamVjdHMuY29hc3RsaW5lKSkpO1xuXG4gIC8vIEdyYXRpY3VsZTogaGFpcmxpbmUgZ29sZCwgZXZlcnkgMTBcdTAwQjAuXG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdncmF0aWN1bGUnKS5hdHRyKCdkJywgZChkMy5nZW9HcmF0aWN1bGUxMCgpKSk7XG5cbiAgLy8gTGFiZWxzOiBzdGFnZSBsYWJlbHMgYWxvbmcgdGhlaXIgcGFyYWxsZWxzLCBwb2xpdHkgbGFiZWxzIHBlciBzbmFwc2hvdC5cbiAgZHJhd1N0YWdlTGFiZWxzKG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzdGFnZS1sYWJlbHMnKSwgZGVmcywgc3RhZ2UsIHBhdGgpO1xuICBjb25zdCBwb2xpdHlMYWJlbHMgPSBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9saXR5LWxhYmVscycpO1xuXG4gIC8vIEdyYWluIGFuZCB2aWduZXR0ZSBvdmVyIHRoZSBzaGVldCwgdGhlbiB0aGUgYXBwYXJhdHVzIG9uIHRvcC5cbiAgZHJhd1BhcGVyT3ZlcmxheShyb290LCBXLCBIKTtcblxuICAvLyBGcmFtZTogZ29sZCBvbiB0aHJlZSBzaWRlczsgdGhlIGJvdHRvbSBlZGdlIGlzIHRoZSB0aW1lbGluZSBzdHJpcCdzIGJhc2VsaW5lLlxuICByb290LmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2ZyYW1lJykuYXR0cignZCcsIGBNJHt4MH0sJHt5MX1MJHt4MH0sJHt5MH1MJHt4MX0sJHt5MH1MJHt4MX0sJHt5MX1gKTtcblxuICBjb25zdCBsZWdlbmQgPSBjcmVhdGVMZWdlbmQocm9vdCwgZnJhbWUpO1xuICBpZiAodHJhY2tlcikgbGVnZW5kLnNldCh0cmFja2VyKTtcbiAgY29uc3QgY2FydG91Y2hlID0gY3JlYXRlQ2FydG91Y2hlKHJvb3QsIGZyYW1lLCBzdGFnZSwgcHJvamVjdGlvbik7XG4gIGNvbnN0IHN0cmlwID0gY3JlYXRlU3RyaXAocm9vdCwgZnJhbWUsIHN0YWdlLCB5ZWFycywgb25ZZWFyKTtcblxuICBsZXQgY3VycmVudFllYXIgPSBudWxsO1xuXG4gIC8vIGNsYXNzaWZ5KGZlYXR1cmUsIHllYXIpIFx1MjE5MiB7IHN0YXR1czogJ2hpZ2hsaWdodCcgfCAnbXV0ZWQnLCBrZXk/LCBsYWJlbD8gfVxuICBmdW5jdGlvbiBzaG93U25hcHNob3QoeWVhciwgdG9wbywgY2xhc3NpZnkgPSAoKSA9PiAoeyBzdGF0dXM6ICdtdXRlZCcgfSkpIHtcbiAgICBjb25zdCBmYyA9IGZlYXR1cmUodG9wbywgdG9wby5vYmplY3RzLnBvbGl0aWVzKTtcbiAgICBjb25zdCBuYW1lZCA9IGZjLmZlYXR1cmVzLmZpbHRlcigoZikgPT4gZi5wcm9wZXJ0aWVzLmlkKTtcbiAgICBmb3IgKGNvbnN0IGYgb2YgbmFtZWQpIGYucHJvcGVydGllcy5jbHMgPSBjbGFzc2lmeShmLCB5ZWFyKTtcbiAgICBwb2xpdGllcy5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgLmRhdGEobmFtZWQsIChmKSA9PiBmLnByb3BlcnRpZXMuaWQpXG4gICAgICAuam9pbigncGF0aCcpXG4gICAgICAuYXR0cignY2xhc3MnLCAoZikgPT4gYHBvbGl0eSAke2YucHJvcGVydGllcy5jZXJ0YWludHl9ICR7Zi5wcm9wZXJ0aWVzLmNscy5zdGF0dXN9YClcbiAgICAgIC5hdHRyKCdkJywgZClcbiAgICAgIC5hcHBlbmQoJ3RpdGxlJykudGV4dCgoZikgPT4gZi5wcm9wZXJ0aWVzLmNscy5sYWJlbCA/PyBmLnByb3BlcnRpZXMubmFtZSk7XG4gICAgY29uc3QgaW50ZXJpb3IgPSBtZXNoKHRvcG8sIHRvcG8ub2JqZWN0cy5wb2xpdGllcywgKGEsIGIpID0+IGEgIT09IGIpO1xuICAgIGNvbnN0IGNlcnRhaW50eSA9IG5hbWVkWzBdPy5wcm9wZXJ0aWVzLmNlcnRhaW50eSA/PyAnYXBwcm94aW1hdGUnO1xuICAgIGJvcmRlcnMuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShbaW50ZXJpb3JdKS5qb2luKCdwYXRoJylcbiAgICAgIC5hdHRyKCdjbGFzcycsIGBib3JkZXIgJHtjZXJ0YWludHl9YClcbiAgICAgIC5hdHRyKCdkJywgZCk7XG4gICAgZHJhd1BvbGl0eUxhYmVscyhwb2xpdHlMYWJlbHMsIHBvbGl0eUxhYmVsRGF0YShuYW1lZC5maWx0ZXIoKGYpID0+IGYucHJvcGVydGllcy5jbHMuc3RhdHVzID09PSAnaGlnaGxpZ2h0JyksIHBhdGgpKTtcbiAgICBjdXJyZW50WWVhciA9IHllYXI7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRZZWFyKHllYXIsIHNvdXJjZVllYXIpIHtcbiAgICBjYXJ0b3VjaGUuc2V0WWVhcih5ZWFyLCBzb3VyY2VZZWFyKTtcbiAgICBzdHJpcC5zZXRZZWFyKHllYXIpO1xuICB9XG5cbiAgcmV0dXJuIHsgcHJvamVjdGlvbiwgcGF0aCwgZCwgZnJhbWUsIHNob3dTbmFwc2hvdCwgc2V0WWVhciwgbGVnZW5kLCBjYXJ0b3VjaGUsIGdldCB5ZWFyKCkgeyByZXR1cm4gY3VycmVudFllYXI7IH0gfTtcbn1cbiIsICJ7XG4gIFwiaWRcIjogXCJhZnJvLWV1cmFzaWFcIixcbiAgXCJ0aXRsZVwiOiBcIkFmcm8tRXVyYXNpYVwiLFxuICBcInByb2plY3Rpb25cIjogXCJlcXVhbEVhcnRoXCIsXG4gIFwicm90YXRlXCI6IFtcbiAgICAtNjAsXG4gICAgMFxuICBdLFxuICBcImV4dGVudFwiOiB7XG4gICAgXCJ3ZXN0XCI6IC0yMCxcbiAgICBcInNvdXRoXCI6IDYsXG4gICAgXCJlYXN0XCI6IDE1MCxcbiAgICBcIm5vcnRoXCI6IDc2XG4gIH0sXG4gIFwic3BhblwiOiBbXG4gICAgMTIwMCxcbiAgICAyMDAwXG4gIF0sXG4gIFwicmVsaWVmXCI6IFwicmVsaWVmL2Fmcm8tZXVyYXNpYS5wbmdcIixcbiAgXCJsYWJlbHNcIjogW1xuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkV1cm9wZVwiLFxuICAgICAgXCJsb25cIjogMTQsXG4gICAgICBcImxhdFwiOiA1MixcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJOb3J0aCBBZnJpY2FcIixcbiAgICAgIFwibG9uXCI6IDEyLFxuICAgICAgXCJsYXRcIjogMjYsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiV2VzdCBBZnJpY2FcIixcbiAgICAgIFwibG9uXCI6IDE3LFxuICAgICAgXCJsYXRcIjogMTEsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiTWlkZGxlIEVhc3RcIixcbiAgICAgIFwibG9uXCI6IDQzLFxuICAgICAgXCJsYXRcIjogMjYuNSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJDZW50cmFsIEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDY2LFxuICAgICAgXCJsYXRcIjogNDUsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGggQXNpYVwiLFxuICAgICAgXCJsb25cIjogNzcsXG4gICAgICBcImxhdFwiOiAxNyxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJFYXN0IEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDEyMCxcbiAgICAgIFwibGF0XCI6IDQ0LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoZWFzdCBBc2lhXCIsXG4gICAgICBcImxvblwiOiAxMTEsXG4gICAgICBcImxhdFwiOiA5LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNpYmVyaWFcIixcbiAgICAgIFwibG9uXCI6IDkyLFxuICAgICAgXCJsYXRcIjogNjksXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiTWVkaXRlcnJhbmVhbiBTZWFcIixcbiAgICAgIFwibG9uXCI6IDE4LFxuICAgICAgXCJsYXRcIjogMzUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJJbmRpYW4gT2NlYW5cIixcbiAgICAgIFwibG9uXCI6IDc1LFxuICAgICAgXCJsYXRcIjogMy41LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQXJhYmlhbiBTZWFcIixcbiAgICAgIFwibG9uXCI6IDY0LFxuICAgICAgXCJsYXRcIjogMTIsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJCYXkgb2YgQmVuZ2FsXCIsXG4gICAgICBcImxvblwiOiA4OSxcbiAgICAgIFwibGF0XCI6IDExLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aCBDaGluYSBTZWFcIixcbiAgICAgIFwibG9uXCI6IDExNSxcbiAgICAgIFwibGF0XCI6IDE2LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQmxhY2sgU2VhXCIsXG4gICAgICBcImxvblwiOiAzNCxcbiAgICAgIFwibGF0XCI6IDQzLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJDYXNwaWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogNTEsXG4gICAgICBcImxhdFwiOiA0MS41LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiUmVkIFNlYVwiLFxuICAgICAgXCJsb25cIjogMzgsXG4gICAgICBcImxhdFwiOiAyMCxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkF0bGFudGljIE9jZWFuXCIsXG4gICAgICBcImxvblwiOiAtMTYsXG4gICAgICBcImxhdFwiOiAzNixcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9XG4gIF1cbn1cbiIsICJ7XG4gIFwiaWRcIjogXCJhZnJvLWV1cmFzaWEtbGFtYmVydFwiLFxuICBcInRpdGxlXCI6IFwiQWZyby1FdXJhc2lhIChhemltdXRoYWwpXCIsXG4gIFwicHJvamVjdGlvblwiOiBcImxhbWJlcnRBemltdXRoYWxFcXVhbEFyZWFcIixcbiAgXCJyb3RhdGVcIjogW1xuICAgIC02MCxcbiAgICAtNDVcbiAgXSxcbiAgXCJleHRlbnRcIjoge1xuICAgIFwid2VzdFwiOiAtMjAsXG4gICAgXCJzb3V0aFwiOiA2LFxuICAgIFwiZWFzdFwiOiAxNTAsXG4gICAgXCJub3J0aFwiOiA3NlxuICB9LFxuICBcInNwYW5cIjogW1xuICAgIDEyMDAsXG4gICAgMjAwMFxuICBdLFxuICBcInJlbGllZlwiOiBcInJlbGllZi9hZnJvLWV1cmFzaWEtbGFtYmVydC5wbmdcIixcbiAgXCJsYWJlbHNcIjogW1xuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkV1cm9wZVwiLFxuICAgICAgXCJsb25cIjogMTUsXG4gICAgICBcImxhdFwiOiA1MCxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJOb3J0aCBBZnJpY2FcIixcbiAgICAgIFwibG9uXCI6IDEwLFxuICAgICAgXCJsYXRcIjogMjcsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiV2VzdCBBZnJpY2FcIixcbiAgICAgIFwibG9uXCI6IC0yLFxuICAgICAgXCJsYXRcIjogMTMsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiTWlkZGxlIEVhc3RcIixcbiAgICAgIFwibG9uXCI6IDQ0LFxuICAgICAgXCJsYXRcIjogMjksXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQ2VudHJhbCBBc2lhXCIsXG4gICAgICBcImxvblwiOiA2NixcbiAgICAgIFwibGF0XCI6IDQ0LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoIEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDc4LFxuICAgICAgXCJsYXRcIjogMjIsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiRWFzdCBBc2lhXCIsXG4gICAgICBcImxvblwiOiAxMTIsXG4gICAgICBcImxhdFwiOiAzNixcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aGVhc3QgQXNpYVwiLFxuICAgICAgXCJsb25cIjogMTA0LFxuICAgICAgXCJsYXRcIjogMTIsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU2liZXJpYVwiLFxuICAgICAgXCJsb25cIjogMTAwLFxuICAgICAgXCJsYXRcIjogNjQsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiTWVkaXRlcnJhbmVhbiBTZWFcIixcbiAgICAgIFwibG9uXCI6IDE3LFxuICAgICAgXCJsYXRcIjogMzUuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkluZGlhbiBPY2VhblwiLFxuICAgICAgXCJsb25cIjogNzUsXG4gICAgICBcImxhdFwiOiA1LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQXJhYmlhbiBTZWFcIixcbiAgICAgIFwibG9uXCI6IDYzLFxuICAgICAgXCJsYXRcIjogMTUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJCYXkgb2YgQmVuZ2FsXCIsXG4gICAgICBcImxvblwiOiA4OCxcbiAgICAgIFwibGF0XCI6IDEzLFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGggQ2hpbmEgU2VhXCIsXG4gICAgICBcImxvblwiOiAxMTQsXG4gICAgICBcImxhdFwiOiAxNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkJsYWNrIFNlYVwiLFxuICAgICAgXCJsb25cIjogMzQsXG4gICAgICBcImxhdFwiOiA0My41LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQ2FzcGlhbiBTZWFcIixcbiAgICAgIFwibG9uXCI6IDUwLjUsXG4gICAgICBcImxhdFwiOiA0MS41LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiUmVkIFNlYVwiLFxuICAgICAgXCJsb25cIjogMzgsXG4gICAgICBcImxhdFwiOiAyMCxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkF0bGFudGljIE9jZWFuXCIsXG4gICAgICBcImxvblwiOiAtMTQsXG4gICAgICBcImxhdFwiOiAzOCxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9XG4gIF1cbn1cbiIsICJ7XG4gIFwiX2NvbW1lbnRcIjogXCJFeHRlbnQgdHJhY2tlciAodjApLiBXaGljaCBkb3dubG9hZGVkIGJhc2UgcG9seWdvbnMgYXJlIGhpZ2hsaWdodGVkLCBieSB0aGUgTkFNRSB0aGUgYmFzZSBtYXAgZ2l2ZXMgdGhlbSBpbiBlYWNoIGVyYSwgYm91bmRlZCBieSBzdGFydC9lbmQgeWVhcnMuIFRoZSBwb2x5Z29ucyB0aGVtc2VsdmVzIGFyZSBuZXZlciBlZGl0ZWQuIFJvd3MgaW4gZGF0YS9yZWNvcmRzLmNzdiB3aXRoIHRyYWNrZXI9ZXh0ZW50IGNhbiBhZGQgdG8gb3Igb3ZlcnJpZGUgdGhpcyBsaXN0LlwiLFxuICBcInRpdGxlXCI6IFwiRXh0ZW50IG9mIHN0YXRlc1wiLFxuICBcImZpbGxfa2V5XCI6IFwiUFwiLFxuICBcImxlZ2VuZFwiOiBbXG4gICAge1xuICAgICAgXCJzd2F0Y2hcIjogXCJmaWxsXCIsXG4gICAgICBcImtleVwiOiBcIlBcIixcbiAgICAgIFwibGFiZWxcIjogXCJIaWdobGlnaHRlZCBzdGF0ZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInN3YXRjaFwiOiBcImxpbmVcIixcbiAgICAgIFwic3R5bGVcIjogXCJzb2xpZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIkRvY3VtZW50ZWQgYm9yZGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3dhdGNoXCI6IFwibGluZVwiLFxuICAgICAgXCJzdHlsZVwiOiBcImRhc2hlZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIkFwcHJveGltYXRlIGJvcmRlclwiXG4gICAgfVxuICBdLFxuICBcImhpZ2hsaWdodHNcIjogW1xuICAgIHtcbiAgICAgIFwiaWRcIjogXCJvdHRvbWFuXCIsXG4gICAgICBcImxhYmVsXCI6IFwiT3R0b21hbiBFbXBpcmVcIixcbiAgICAgIFwic3RhcnRcIjogMTI5OSxcbiAgICAgIFwiZW5kXCI6IDE5MjIsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJPdHRvbWFuIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwic2FmYXZpZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIlNhZmF2aWQgRW1waXJlXCIsXG4gICAgICBcInN0YXJ0XCI6IDE1MDEsXG4gICAgICBcImVuZFwiOiAxNzM2LFxuICAgICAgXCJuYW1lc1wiOiBbXG4gICAgICAgIFwiU2FmYXZpZCBFbXBpcmVcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiBcIm11Z2hhbFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIk11Z2hhbCBFbXBpcmVcIixcbiAgICAgIFwic3RhcnRcIjogMTUyNixcbiAgICAgIFwiZW5kXCI6IDE4NTcsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNdWdoYWwgRW1waXJlXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJtaW5nXCIsXG4gICAgICBcImxhYmVsXCI6IFwiTWluZyBDaGluYVwiLFxuICAgICAgXCJzdGFydFwiOiAxMzY4LFxuICAgICAgXCJlbmRcIjogMTY0NCxcbiAgICAgIFwibmFtZXNcIjogW1xuICAgICAgICBcIk1pbmcgRW1waXJlXCIsXG4gICAgICAgIFwiTWluZyBDaGluZXNlIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwicWluZ1wiLFxuICAgICAgXCJsYWJlbFwiOiBcIlFpbmcgQ2hpbmFcIixcbiAgICAgIFwic3RhcnRcIjogMTY0NCxcbiAgICAgIFwiZW5kXCI6IDE5MTIsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNYW5jaHUgRW1waXJlXCIsXG4gICAgICAgIFwiUWluZyBFbXBpcmVcIixcbiAgICAgICAgXCJRaW5nIER5bmFzdHlcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiBcInNvbmdoYWlcIixcbiAgICAgIFwibGFiZWxcIjogXCJTb25naGFpIEVtcGlyZVwiLFxuICAgICAgXCJzdGFydFwiOiAxNDY0LFxuICAgICAgXCJlbmRcIjogMTU5MSxcbiAgICAgIFwibmFtZXNcIjogW1xuICAgICAgICBcIlNvbmdoYWlcIixcbiAgICAgICAgXCJTb25naGFpIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwibW9yb2Njb1wiLFxuICAgICAgXCJsYWJlbFwiOiBcIk1vcm9jY29cIixcbiAgICAgIFwic3RhcnRcIjogMTQ1MCxcbiAgICAgIFwiZW5kXCI6IDIwMDAsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNb3JvY2NvXCIsXG4gICAgICAgIFwiV2F0dGFzaWQgQ2FsaXBoYXRlXCIsXG4gICAgICAgIFwiV2F0YXNzaWQgTW9yb2Njb1wiLFxuICAgICAgICBcIlNhYWRpIE1vcm9jY29cIixcbiAgICAgICAgXCJTYWFkaSBTdWx0YW5hdGVcIixcbiAgICAgICAgXCJBbGFvdWl0ZSBNb3JvY2NvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJydXNzaWFcIixcbiAgICAgIFwibGFiZWxcIjogXCJSdXNzaWFcIixcbiAgICAgIFwic3RhcnRcIjogMTQ1MCxcbiAgICAgIFwiZW5kXCI6IDIwMDAsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJHcmFuZCBEdWNoeSBvZiBNb3Njb3dcIixcbiAgICAgICAgXCJUc2FyZG9tIG9mIE11c2NvdnlcIixcbiAgICAgICAgXCJUc2FyZG9tIG9mIFJ1c3NpYVwiLFxuICAgICAgICBcIlJ1c3NpYW4gRW1waXJlXCIsXG4gICAgICAgIFwiUnVzc2lhXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJ0b2t1Z2F3YVwiLFxuICAgICAgXCJsYWJlbFwiOiBcIlRva3VnYXdhIEphcGFuXCIsXG4gICAgICBcInN0YXJ0XCI6IDE2MDMsXG4gICAgICBcImVuZFwiOiAxODY4LFxuICAgICAgXCJuYW1lc1wiOiBbXG4gICAgICAgIFwiVG9rdWdhd2Egc2hvZ3VuYXRlXCIsXG4gICAgICAgIFwiVG9rdWdhd2EgU2hvZ3VuYXRlXCJcbiAgICAgIF1cbiAgICB9XG4gIF1cbn1cbiIsICIvLyBQYXJjaG1lbnQgXHUyMDE0IGVudHJ5IHBvaW50XG5pbXBvcnQgKiBhcyBkMyBmcm9tICdkMyc7XG5pbXBvcnQgeyBsb2FkSlNPTiB9IGZyb20gJy4vZGF0YS9sb2FkZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlU3RhZ2UgfSBmcm9tICcuL3JlbmRlci9iYXNlLmpzJztcbmltcG9ydCBzdGFnZUVxdWFsRWFydGggZnJvbSAnLi9zdGFnZXMvYWZyby1ldXJhc2lhLmpzb24nO1xuaW1wb3J0IHN0YWdlTGFtYmVydCBmcm9tICcuL3N0YWdlcy9hZnJvLWV1cmFzaWEtbGFtYmVydC5qc29uJztcbmltcG9ydCBleHRlbnQgZnJvbSAnLi90cmFja2Vycy9leHRlbnQuanNvbic7XG5cbmNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKTtcbmNvbnN0IFNUQVJUX1lFQVIgPSBOdW1iZXIocGFyYW1zLmdldCgneWVhcicpKSB8fCAxNDUwO1xuLy8gP3N0YWdlPWFmcm8tZXVyYXNpYS1sYW1iZXJ0IHNob3dzIHRoZSBhbHRlcm5hdGl2ZSBwcm9qZWN0aW9uIGZvciBjb21wYXJpc29uLlxuY29uc3QgU1RBR0VTID0geyBbc3RhZ2VFcXVhbEVhcnRoLmlkXTogc3RhZ2VFcXVhbEVhcnRoLCBbc3RhZ2VMYW1iZXJ0LmlkXTogc3RhZ2VMYW1iZXJ0IH07XG5jb25zdCBzdGFnZSA9IFNUQUdFU1twYXJhbXMuZ2V0KCdzdGFnZScpXSA/PyBzdGFnZUVxdWFsRWFydGg7XG5cbi8vIEV4dGVudCB0cmFja2VyOiBhIGJhc2UgcG9seWdvbiBpcyBoaWdobGlnaHRlZCB3aGVuIGl0cyBOQU1FIG1hdGNoZXMgYSBoaWdobGlnaHQgZW50cnkgYWxpdmUgaW4gdGhhdCB5ZWFyLlxuY29uc3QgYnlOYW1lID0gbmV3IE1hcCgpO1xuZm9yIChjb25zdCBoIG9mIGV4dGVudC5oaWdobGlnaHRzKSBmb3IgKGNvbnN0IG4gb2YgaC5uYW1lcykgYnlOYW1lLnNldChuLCBoKTtcbmZ1bmN0aW9uIGNsYXNzaWZ5RXh0ZW50KGYsIHllYXIpIHtcbiAgY29uc3QgaCA9IGJ5TmFtZS5nZXQoZi5wcm9wZXJ0aWVzLm5hbWUpO1xuICBpZiAoaCAmJiB5ZWFyID49IGguc3RhcnQgJiYgeWVhciA8PSBoLmVuZCkgcmV0dXJuIHsgc3RhdHVzOiAnaGlnaGxpZ2h0Jywga2V5OiBoLmlkLCBsYWJlbDogaC5sYWJlbCB9O1xuICByZXR1cm4geyBzdGF0dXM6ICdtdXRlZCcgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgY29uc3QgdDAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgY29uc3QgW2NhbGVuZGFyLCBuZSwgYmF0aHldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIGxvYWRKU09OKCdkYXRhL2NhbGVuZGFyLmpzb24nKSxcbiAgICBsb2FkSlNPTignZGF0YS9iYXNlL2Rlcml2ZWQvbmUudG9wb2pzb24nKSxcbiAgICBsb2FkSlNPTignZGF0YS9iYXNlL2Rlcml2ZWQvYmF0aHltZXRyeS50b3BvanNvbicpLFxuICBdKTtcbiAgY29uc3QgeWVhcnMgPSBjYWxlbmRhci5zbmFwc2hvdHMubWFwKChzKSA9PiBzLnllYXIpO1xuICBjb25zdCBieVNuYXBzaG90ID0gbmV3IE1hcChjYWxlbmRhci5zbmFwc2hvdHMubWFwKChzKSA9PiBbcy55ZWFyLCBzXSkpO1xuXG4gIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdCgnI21hcCcpO1xuICBjb25zdCBhdGxhcyA9IGNyZWF0ZVN0YWdlKHN2Zywgc3RhZ2UsIHsgbmUsIGJhdGh5IH0sIHsgdHJhY2tlcjogZXh0ZW50LCB5ZWFycywgb25ZZWFyOiAoeSkgPT4gc2hvdyh5KSB9KTtcbiAgY29uc29sZS5sb2coYHN0YWdlIGJ1aWx0IGluICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdDApLnRvRml4ZWQoMCl9IG1zYCk7XG5cbiAgY29uc3Qgc25hcHNob3QgPSAoeWVhcikgPT4gbG9hZEpTT04oYGRhdGEvYmFzZS9kZXJpdmVkL3dvcmxkXyR7eWVhcn0udG9wb2pzb25gKTtcblxuICBsZXQgY3VycmVudCA9IG51bGw7XG4gIGFzeW5jIGZ1bmN0aW9uIHNob3coeWVhcikge1xuICAgIGlmICgheWVhcnMuaW5jbHVkZXMoeWVhcikpIHJldHVybjtcbiAgICBjb25zdCB0b3BvID0gYXdhaXQgc25hcHNob3QoeWVhcik7XG4gICAgY29uc3QgdCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGF0bGFzLnNob3dTbmFwc2hvdCh5ZWFyLCB0b3BvLCBjbGFzc2lmeUV4dGVudCk7XG4gICAgY3VycmVudCA9IHllYXI7XG4gICAgY29uc3QgbWV0YSA9IGJ5U25hcHNob3QuZ2V0KHllYXIpO1xuICAgIGRvY3VtZW50LnRpdGxlID0gYFBhcmNobWVudCBcdTAwQjcgJHt5ZWFyfWA7XG4gICAgYXRsYXMuc2V0WWVhcih5ZWFyLCBtZXRhLnNvdXJjZV95ZWFyKTtcbiAgICBkMy5zZWxlY3RBbGwoJyN5ZWFycyBidXR0b24nKS5jbGFzc2VkKCdhY3RpdmUnLCBmdW5jdGlvbiAoKSB7IHJldHVybiBOdW1iZXIodGhpcy5kYXRhc2V0LnllYXIpID09PSB5ZWFyOyB9KTtcbiAgICBjb25zb2xlLmxvZyhgc25hcHNob3QgJHt5ZWFyfTogJHsocGVyZm9ybWFuY2Uubm93KCkgLSB0KS50b0ZpeGVkKDEpfSBtc2ApO1xuICB9XG5cbiAgLy8gWWVhciBidXR0b25zLlxuICBkMy5zZWxlY3QoJyN5ZWFycycpLnNlbGVjdEFsbCgnYnV0dG9uJykuZGF0YSh5ZWFycykuam9pbignYnV0dG9uJylcbiAgICAuYXR0cignZGF0YS15ZWFyJywgKHkpID0+IHkpLnRleHQoKHkpID0+IHkpXG4gICAgLm9uKCdjbGljaycsIChfLCB5KSA9PiBzaG93KHkpKTtcblxuICAvLyBLZXlib2FyZDogXHUyMTkwIFx1MjE5MiBzdGVwIHRocm91Z2ggdGhlIGNhbGVuZGFyLlxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgY29uc3QgaSA9IHllYXJzLmluZGV4T2YoY3VycmVudCk7XG4gICAgaWYgKGUua2V5ID09PSAnQXJyb3dSaWdodCcpIHNob3coeWVhcnNbTWF0aC5taW4oaSArIDEsIHllYXJzLmxlbmd0aCAtIDEpXSk7XG4gICAgaWYgKGUua2V5ID09PSAnQXJyb3dMZWZ0Jykgc2hvdyh5ZWFyc1tNYXRoLm1heChpIC0gMSwgMCldKTtcbiAgfSk7XG5cbiAgYXdhaXQgc2hvdyhTVEFSVF9ZRUFSKTtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdyZWFkeScpO1xuICAvLyBQcmVmZXRjaCB0aGUgcmVzdCBzbyBzd2l0Y2hpbmcgaXMgaW5zdGFudC5cbiAgZm9yIChjb25zdCB5IG9mIHllYXJzKSBzbmFwc2hvdCh5KTtcbn1cblxubWFpbigpLmNhdGNoKChlcnIpID0+IHtcbiAgY29uc29sZS5lcnJvcihlcnIpO1xuICBkMy5zZWxlY3QoJyNwcm9ibGVtcycpLmNsYXNzZWQoJ2hpZGRlbicsIGZhbHNlKS50ZXh0KGBQYXJjaG1lbnQgY291bGQgbm90IHN0YXJ0OiAke2Vyci5tZXNzYWdlfWApO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUFlLFdBQVIsVUFBMkIsR0FBRyxHQUFHO0FBQ3RDLFdBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxNQUFNLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJO0FBQUEsRUFDOUU7OztBQ0ZlLFdBQVIsV0FBNEIsR0FBRyxHQUFHO0FBQ3ZDLFdBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxNQUM1QixJQUFJLElBQUksS0FDUixJQUFJLElBQUksSUFDUixLQUFLLElBQUksSUFDVDtBQUFBLEVBQ047OztBQ0hlLFdBQVIsU0FBMEIsR0FBRztBQUNsQyxRQUFJLFVBQVUsVUFBVTtBQU94QixRQUFJLEVBQUUsV0FBVyxHQUFHO0FBQ2xCLGlCQUFXO0FBQ1gsaUJBQVcsQ0FBQyxHQUFHLE1BQU0sVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3RDLGNBQVEsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUk7QUFBQSxJQUMzQixPQUFPO0FBQ0wsaUJBQVcsTUFBTSxhQUFhLE1BQU0sYUFBYSxJQUFJO0FBQ3JELGlCQUFXO0FBQ1gsY0FBUTtBQUFBLElBQ1Y7QUFFQSxhQUFTLEtBQUssR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLEVBQUUsUUFBUTtBQUN6QyxVQUFJLEtBQUssSUFBSTtBQUNYLFlBQUksU0FBUyxHQUFHLENBQUMsTUFBTSxFQUFHLFFBQU87QUFDakMsV0FBRztBQUNELGdCQUFNLE1BQU8sS0FBSyxPQUFRO0FBQzFCLGNBQUksU0FBUyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRyxNQUFLLE1BQU07QUFBQSxjQUNuQyxNQUFLO0FBQUEsUUFDWixTQUFTLEtBQUs7QUFBQSxNQUNoQjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBRUEsYUFBUyxNQUFNLEdBQUcsR0FB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Y0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLElBQ1gsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLElBQ2YsV0FBVztBQUFBLElBQ1gsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsc0JBQXNCO0FBQUEsSUFDdEIsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsZ0JBQWdCO0FBQUEsSUFDaEIsZ0JBQWdCO0FBQUEsSUFDaEIsZ0JBQWdCO0FBQUEsSUFDaEIsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLElBQ1gsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1Isa0JBQWtCO0FBQUEsSUFDbEIsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QsZ0JBQWdCO0FBQUEsSUFDaEIsaUJBQWlCO0FBQUEs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Q0FBQyxDQUFDLENBQUM7QUFBQSxFQUN0QztBQUVBLE1BQUksSUFBSTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sU0FBUyxDQUFDLEtBQUssR0FBRyxFQUFFLElBQUksSUFBSTtBQUFBLElBQzVCLE9BQU8sU0FBUyxHQUFHLEdBQUc7QUFBRSxhQUFPLEtBQUssT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUFBLElBQUc7QUFBQSxJQUN4RixRQUFRLFNBQVMsSUFBSTtBQUFFLGFBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQSxJQUFHO0FBQUEsRUFDNUQ7QUFFQSxNQUFJLElBQUk7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFNBQVMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLElBQUk7QUFBQSxJQUM1QixPQUFPLFNBQVMsR0FBRyxHQUFHO0FBQUUsYUFBTyxLQUFLLE9BQU8sT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFBQSxJQUFHO0FBQUEsSUFDeEYsUUFBUSxTQUFTLElBQUk7QUFBRSxhQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUEsSUFBRztBQUFBLEVBQzVEO0FBRUEsTUFBSSxLQUFLO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLE1BQU0sTUFBTSxJQUFJLEVBQUUsSUFBSSxJQUFJO0FBQUEsSUFDOUQsT0FBTyxTQUFTLElB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LE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDaklBO0FBQUEsSUFDRSxJQUFNO0FBQUEsSUFDTixPQUFTO0FBQUEsSUFDVCxZQUFjO0FBQUEsSUFDZCxRQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFVO0FBQUEsTUFDUixNQUFRO0FBQUEsTUFDUixPQUFTO0FBQUEsTUFDVCxNQUFRO0FBQUEsTUFDUixPQUFTO0FBQUEsSUFDWDtBQUFBLElBQ0EsTUFBUTtBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBVTtBQUFBLElBQ1YsUUFBVTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUNqSUE7QUFBQSxJQUNFLFVBQVk7QUFBQSxJQUNaLE9BQVM7QUFBQSxJQUNULFVBQVk7QUFBQSxJQUNaLFFBQVU7QUFBQSxNQUNSO0FBQUEsUUFDRSxRQUFVO0FBQUEsUUFDVixLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLFFBQVU7QUFBQSxRQUNWLE9BQVM7QUFBQSxRQUNULE9BQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsUUFBVTtBQUFBLFFBQ1YsT0FBUztBQUFBLFFBQ1QsT0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsSUFDQSxZQUFjO0FBQUEsTUFDWjtBQUFBLFFBQ0UsSUFBTTtBQUFBLFFBQ04sT0FBUztBQUFBLFFBQ1QsT0FBUztBQUFBLFFBQ1QsS0FBTztBQUFBLFFBQ1AsT0FBUztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQU07QUFBQSxRQUNOLE9BQVM7QUFBQSxRQUNULE9BQVM7QUFBQSxRQUNULEtBQU87QUFBQSxRQUNQLE9BQVM7QUFBQSxVQUNQO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFNO0FBQUEsUUFDTixPQUFTO0FBQUEsUUFDVCxPQUFTO0FBQUEsUUFDVCxLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsVUFDUDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBTTtBQUFBLFFBQ04sT0FBUztBQUFBLFFBQ1QsT0FBUztBQUFBLFFBQ1QsS0FBTztBQUFBLFFBQ1AsT0FBUztBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFNO0FBQUEsUUFDTixPQUFTO0FBQUEsUUFDVCxPQUFTO0FBQUEsUUFDVCxLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFNO0FBQUEsUUFDTixPQUFTO0FBQUEsUUFDVCxPQUFTO0FBQUEsUUFDVCxLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFB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QUFDcEMsTUFBR0MsbUJBQVUsZUFBZSxFQUFFLFFBQVEsVUFBVSxXQUFZO0FBQUUsZUFBTyxPQUFPLEtBQUssUUFBUSxJQUFJLE1BQU07QUFBQSxNQUFNLENBQUM7QUFDMUcsY0FBUSxJQUFJLFlBQVksSUFBSSxNQUFNLFlBQVksSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsS0FBSztBQUFBLElBQzFFO0FBR0EsSUFBR0QsZ0JBQU8sUUFBUSxFQUFFLFVBQVUsUUFBUSxFQUFFLEtBQUssS0FBSyxFQUFFLEtBQUssUUFBUSxFQUM5RCxLQUFLLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQ3pDLEdBQUcsU0FBUyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUdoQyxXQUFPLGlCQUFpQixXQUFXLENBQUMsTUFBTTtBQUN4QyxZQUFNLElBQUksTUFBTSxRQUFRLE9BQU87QUFDL0IsVUFBSSxFQUFFLFFBQVEsYUFBYyxNQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksR0FBRyxNQUFNLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDekUsVUFBSSxFQUFFLFFBQVEsWUFBYSxNQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUFBLElBQzNELENBQUM7QUFFRCxVQUFNLEtBQUssVUFBVTtBQUNyQixhQUFTLEtBQUssVUFBVSxJQUFJLE9BQU87QUFFbkMsZUFBVyxLQUFLLE1BQU8sVUFBUyxDQUFDO0FBQUEsRUFDbkM7QUFFQSxPQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDcEIsWUFBUSxNQUFNLEdBQUc7QUFDakIsSUFBR0EsZ0JBQU8sV0FBVyxFQUFFLFFBQVEsVUFBVSxLQUFLLEVBQUUsS0FBSyw4QkFBOEIsSUFBSSxPQUFPLEVBQUU7QUFBQSxFQUNsRyxDQUFDOyIsCiAgIm5hbWVzIjogWyJzdGFydCIsICJ0aWNrcyIsICJhcnJheSIsICJzdGFydCIsICJyYW5nZSIsICJjb3B5IiwgInR5cGUiLCAiZG9jdW1lbnQiLCAiZGF0dW0iLCAic2VsZWN0aW9uIiwgIm1lcmdlIiwgImFzY2VuZGluZyIsICJjcmVhdGUiLCAiY3JlYXRlIiwgInBhcnNlVHlwZW5hbWVzIiwgInR5cGUiLCAicGFyYW1zIiwgIndpbmRvdyIsICJkaXNwYXRjaF9kZWZhdWx0IiwgImRpc3BhdGNoX2RlZmF1bHQiLCAic2VsZWN0X2RlZmF1bHQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAiZm9ybWF0IiwgIm1pbiIsICJtYXgiLCAiY29uc3RhbnRfZGVmYXVsdCIsICJjb25zdGFudF9kZWZhdWx0IiwgImNvbG9yIiwgInJnYiIsICJzdGFydCIsICJ6ZXJvIiwgImkiLCAiY29uc3RhbnRfZGVmYXVsdCIsICJub3ciLCAiaWQiLCAiZ2V0IiwgInNldCIsICJzdGFydCIsICJlbXB0eSIsICJpbnRlcnJ1cHRfZGVmYXVsdCIsICJpZCIsICJzZXQiLCAiZ2V0IiwgInRyYW5zaXRpb24iLCAiYXR0clJlbW92ZSIsICJhdHRyUmVtb3ZlTlMiLCAiYXR0ckNvbnN0YW50IiwgImF0dHJDb25zdGFudE5TIiwgImF0dHJGdW5jdGlvbiIsICJhdHRyRnVuY3Rpb25OUyIsICJhdHRyX2RlZmF1bHQiLCAiaWQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImdldCIsICJpZCIsICJzZXQiLCAiZmlsdGVyX2RlZmF1bHQiLCAibWVyZ2VfZGVmYXVsdCIsICJ0cmFuc2l0aW9uIiwgIm1lcmdlIiwgImlkIiwgInNldCIsICJvbl9kZWZhdWx0IiwgImdldCIsICJpZCIsICJyZW1vdmVfZGVmYXVsdCIsICJzZWxlY3RfZGVmYXVsdCIsICJpZCIsICJnZXQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAiaWQiLCAiY2hpbGRyZW4iLCAiaW5oZXJpdCIsICJnZXQiLCAiU2VsZWN0aW9uIiwgInNlbGVjdGlvbl9kZWZhdWx0IiwgInN0eWxlUmVtb3ZlIiwgInN0eWxlQ29uc3RhbnQiLCAic3R5bGVGdW5jdGlvbiIsICJpZCIsICJyZW1vdmUiLCAic2V0IiwgInN0eWxlX2RlZmF1bHQiLCAidGV4dENvbnN0YW50IiwgInRleHRGdW5jdGlvbiIsICJ0ZXh0X2RlZmF1bHQiLCAiaW5oZXJpdCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImlkIiwgInNlbGVjdF9kZWZhdWx0IiwgInNlbGVjdEFsbF9kZWZhdWx0IiwgImZpbHRlcl9kZWZhdWx0IiwgIm1lcmdlX2RlZmF1bHQiLCAic2VsZWN0aW9uX2RlZmF1bHQiLCAib25fZGVmYXVsdCIsICJhdHRyX2RlZmF1bHQiLCAic3R5bGVfZGVmYXVsdCIsICJ0ZXh0X2RlZmF1bHQiLCAicmVtb3ZlX2RlZmF1bHQiLCAiaWQiLCAidHJhbnNpdGlvbl9kZWZhdWx0IiwgImludGVycnVwdF9kZWZhdWx0IiwgInRyYW5zaXRpb25fZGVmYXVsdCIsICJsb2NhbGUiLCAic2lnbiIsICJ6ZXJvIiwgInR5cGUiLCAiZm9ybWF0IiwgImZvcm1hdFByZWZpeCIsICJ2YWx1ZSIsICJtYXgiLCAiZGVncmVlcyIsICJhYnMiLCAibm9vcCIsICJvYmplY3QiLCAiY29vcmRpbmF0ZXMiLCAibm9vcCIsICJvYmplY3QiLCAiY2FydGVzaWFuIiwgInNwaGVyaWNhbCIsICJhYnMiLCAibm9vcCIsICJhYnMiLCAiY29tcGFyZUludGVyc2VjdGlvbiIsICJuIiwgInN0YXJ0IiwgImFycmF5IiwgImFicyIsICJsYW1iZGEwIiwgInNpblBoaTAiLCAiY29zUGhpMCIsICJzaWduIiwgInN0YXJ0IiwgInBvaW50IiwgImxhbWJkYTAiLCAiYWJzIiwgImNvc1BoaTAiLCAiYWJzIiwgImxhbWJkYTAiLCAiZGVsdGEiLCAiY29kZSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJhYnMiLCAiY29tcGFyZUludGVyc2VjdGlvbiIsICJyaW5nIiwgInBvaW50IiwgInZpc2libGUiLCAibGFtYmRhMCIsICJzaW5QaGkwIiwgImNvc1BoaTAiLCAibm9vcCIsICJhYnMiLCAib2JqZWN0IiwgInkwIiwgInkxIiwgInkiLCAieDAiLCAieDEiLCAieCIsICJYMSIsICJYMCIsICJZMSIsICJZMCIsICJYIiwgIlkiLCAiZ3JhdGljdWxlIiwgImFicyIsICJjb29yZGluYXRlcyIsICJpZGVudGl0eV9kZWZhdWx0IiwgImFyZWFTdW0iLCAiYXJlYVJpbmdTdW0iLCAiYXJlYVN0cmVhbSIsICJub29wIiwgImFyZWFSaW5nU3RhcnQiLCAiYXJlYVJpbmdFbmQiLCAiYWJzIiwgImFyZWFQb2ludEZpcnN0IiwgImFyZWFQb2ludCIsICJhcmVhX2RlZmF1bHQiLCAieDAiLCAieTAiLCAibm9vcCIsICJ4MDAiLCAieTAwIiwgIngwIiwgInkwIiwgIm5vb3AiLCAibGVuZ3RoU3VtIiwgIngwMCIsICJ5MDAiLCAieDAiLCAieTAiLCAibGVuZ3RoU3RyZWFtIiwgIm5vb3AiLCAibGVuZ3RoUG9pbnRGaXJzdCIsICJsZW5ndGhQb2ludCIsICJhcHBlbmQiLCAicHJvamVjdGlvbiIsICJvYmplY3QiLCAiYXJlYV9kZWZhdWx0IiwgImlkZW50aXR5X2RlZmF1bHQiLCAicHJvamVjdGlvbiIsICJvYmplY3QiLCAieDAiLCAieTAiLCAibGFtYmRhMCIsICJ4MSIsICJ5MSIsICJhYnMiLCAibGFtYmRhMDAiLCAieDAwIiwgInkwMCIsICJ0cmFuc2Zvcm0iLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJjYWNoZSIsICJwcm9qZWN0aW9uIiwgImRlZ3JlZXMiLCAib2JqZWN0IiwgImRlZ3JlZXMiLCAiY29zUGhpMCIsICJ5MCIsICJ5MSIsICJhYnMiLCAiY2FjaGUiLCAiY29vcmRpbmF0ZXMiLCAib2JqZWN0IiwgImFicyIsICJyYW5nZSIsICJudW1iZXIiLCAiaWRlbnRpdHkiLCAicmFuZ2UiLCAiaSIsICJ0cmFuc2Zvcm1lciIsICJ0cmFuc2Zvcm0iLCAibnVtYmVyIiwgInN0YXJ0IiwgInN0YXJ0IiwgImxpbmVhciIsICJsb2NhdGlvbiIsICJpZGVudGl0eSIsICJpZGVudGl0eV9kZWZhdWx0IiwgInRyYW5zZm9ybSIsICJpZGVudGl0eV9kZWZhdWx0IiwgIngwIiwgInkwIiwgImFycmF5IiwgIm8iLCAiaWQiLCAib2JqZWN0IiwgImFyY3MiLCAidHlwZSIsICJjb29yZGluYXRlcyIsICJzdGFydCIsICJmcmFnbWVudEJ5RW5kIiwgImZyYWdtZW50QnlTdGFydCIsICJvYmplY3QiLCAiZmlsdGVyIiwgImFyY3MiLCAicm9vdCIsICJXIiwgIkgiLCAic3RhZ2UiLCAiaWQiLCAicHJvamVjdGlvbiIsICJyb290IiwgIngwIiwgInkxIiwgInN0YWdlIiwgIlciLCAiSCIsICJ5IiwgInJvb3QiLCAieDAiLCAieDEiLCAieTEiLCAic3RhZ2UiLCAibGluZWFyIiwgInJvb3QiLCAieDEiLCAieTAiLCAiVyIsICJzZXQiLCAiSCIsICJzZWxlY3RfZGVmYXVsdCIsICJzdGFnZSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJmcmFtZSIsICJwcm9qZWN0aW9uIiwgImNhY2hlIiwgInJvb3QiLCAibWFwIiwgIm5hbWVkIiwgInNlbGVjdF9kZWZhdWx0IiwgInNlbGVjdEFsbF9kZWZhdWx0Il0KfQo=
