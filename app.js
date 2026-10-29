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
    const el = document.querySelector(`script[data-path="${CSS.escape(path)}"]`);
    if (!el) return null;
    return el.dataset.encoding === "json-string" ? JSON.parse(el.textContent) : el.textContent;
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

  // src/data/records.js
  var COLUMNS = [
    "id",
    "course",
    "unit",
    "topic",
    "kc",
    "theme",
    "tracker",
    "kind",
    "where",
    "lon",
    "lat",
    "start",
    "end",
    "grade",
    "value",
    "certainty",
    "label",
    "source",
    "qc_status",
    "qc_by",
    "qc_note"
  ];
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false, i = 0;
    const src = text.replace(/^﻿/, "");
    while (i < src.length) {
      const c = src[i];
      if (quoted) {
        if (c === '"') {
          if (src[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          quoted = false;
          i++;
          continue;
        }
        field += c;
        i++;
        continue;
      }
      if (c === '"') {
        quoted = true;
        i++;
        continue;
      }
      if (c === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (c === "\r") {
        i++;
        continue;
      }
      if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }
      field += c;
      i++;
    }
    if (field !== "" || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter((r) => r.some((f) => f.trim() !== ""));
  }
  var isInt = (s) => /^-?\d+$/.test(s);
  var isNum = (s) => s !== "" && Number.isFinite(Number(s));
  var isQID = (s) => /^Q\d+$/.test(s);
  function validateRecords(text, vocab) {
    const rows = parseCSV(text);
    const problems = [];
    const records = [];
    let examples = 0;
    if (!rows.length) return { records, problems: [{ line: 1, id: "", message: "records.csv is empty" }], examples, total: 0 };
    const header = rows[0].map((h) => h.trim());
    const missing = COLUMNS.filter((c) => !header.includes(c));
    if (missing.length) {
      problems.push({ line: 1, id: "", message: `header is missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` });
      return { records, problems, examples, total: rows.length - 1 };
    }
    const col = Object.fromEntries(header.map((h, i) => [h, i]));
    const baseUnits = new Set((vocab.base_units ?? []).map((u) => u.id));
    const seen = /* @__PURE__ */ new Set();
    for (let r = 1; r < rows.length; r++) {
      const line = r + 1;
      const cells = rows[r];
      const get3 = (c) => (cells[col[c]] ?? "").trim();
      const rec = Object.fromEntries(COLUMNS.map((c) => [c, get3(c)]));
      const errs = [];
      const bad = (m) => errs.push(m);
      if (cells.length > header.length) bad(`${cells.length} fields for ${header.length} columns (an unquoted comma?)`);
      if (!rec.id) bad("id is blank");
      else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(rec.id)) bad(`id "${rec.id}" is not kebab-case`);
      else if (seen.has(rec.id)) bad(`id "${rec.id}" is used twice`);
      seen.add(rec.id);
      if (!vocab.course.includes(rec.course)) bad(`course "${rec.course}" is not one of ${vocab.course.join(", ")}`);
      if (rec.unit !== "" && !isInt(rec.unit)) bad(`unit "${rec.unit}" is not a whole number`);
      const themes = rec.course === "both" ? [...vocab.theme.apworld, ...vocab.theme.apush] : vocab.theme[rec.course] ?? [];
      if (rec.theme && themes.length && !themes.includes(rec.theme)) bad(`theme "${rec.theme}" is not a ${rec.course} theme (${themes.join(", ")})`);
      const tracker = vocab.trackers[rec.tracker];
      if (!tracker) bad(`tracker "${rec.tracker}" is not one of ${Object.keys(vocab.trackers).join(", ")}`);
      if (!vocab.kind.includes(rec.kind)) bad(`kind "${rec.kind}" is not one of ${vocab.kind.join(", ")}`);
      else if (tracker && !tracker.kinds.includes(rec.kind)) bad(`tracker ${rec.tracker} does not take kind "${rec.kind}" (only ${tracker.kinds.join(", ")})`);
      if (!rec.where) bad("where is blank");
      else if (rec.kind === "point") {
        if (!isQID(rec.where)) bad(`where "${rec.where}" should be a Wikidata QID (like Q193334) for a point`);
      } else if (!baseUnits.has(rec.where) && !isQID(rec.where)) bad(`where "${rec.where}" is not a base-unit id in vocab.json`);
      if (rec.lon !== "" || rec.lat !== "") {
        if (!isNum(rec.lon) || !isNum(rec.lat)) bad("lon/lat must both be numbers (or both blank until geocode.mjs fills them)");
        else if (Math.abs(Number(rec.lon)) > 180 || Math.abs(Number(rec.lat)) > 90) bad(`lon/lat ${rec.lon},${rec.lat} is off the globe`);
      }
      if (!isInt(rec.start)) bad(`start "${rec.start}" is not a year`);
      if (!isInt(rec.end)) bad(`end "${rec.end}" is not a year`);
      if (isInt(rec.start) && isInt(rec.end) && Number(rec.end) < Number(rec.start)) bad(`end ${rec.end} is before start ${rec.start}`);
      if (!vocab.grade.includes(rec.grade)) bad(`grade "${rec.grade}" is not one of ${vocab.grade.join(", ")}`);
      if (tracker) {
        if (rec.kind === "value") {
          if (!isNum(rec.value)) bad(`value "${rec.value}" is not a number`);
        } else if (tracker.values && !tracker.values.includes(rec.value)) bad(`value "${rec.value}" is not a ${rec.tracker} value (${tracker.values.join(", ")})`);
      }
      if (!vocab.certainty.includes(rec.certainty)) bad(`certainty "${rec.certainty}" is not one of ${vocab.certainty.join(", ")}`);
      if (!rec.label) bad("label is blank");
      if (!vocab.qc_status.includes(rec.qc_status)) bad(`qc_status "${rec.qc_status}" is not one of ok, wrong, unsure or blank`);
      if (errs.length) {
        problems.push({ line, id: rec.id, message: errs.join("; ") });
        continue;
      }
      if (rec.id.startsWith("example-")) {
        examples++;
        continue;
      }
      records.push({
        ...rec,
        unit: rec.unit === "" ? null : Number(rec.unit),
        lon: rec.lon === "" ? null : Number(rec.lon),
        lat: rec.lat === "" ? null : Number(rec.lat),
        start: Number(rec.start),
        end: Number(rec.end),
        value: rec.kind === "value" ? Number(rec.value) : rec.value,
        shape: tracker?.shapes?.[rec.value] ?? null,
        line
      });
    }
    return { records, problems, examples, total: rows.length - 1 };
  }
  function yearLabel(rec) {
    const y = rec.start === rec.end ? `${rec.start}` : `${rec.start}\u2013${rec.end}`;
    return rec.grade === "circa" ? `~${y}` : rec.grade === "uncertain" ? `${y}?` : y;
  }
  function recordsFor(records, tracker, year, years = []) {
    const sorted = [...years].sort((a, b) => a - b);
    const home = (r) => sorted.find((y) => y >= r.start);
    return records.filter((r) => r.tracker === tracker && (r.start <= year && year <= r.end || home(r) === year));
  }

  // src/render/marks.js
  function drawMarks(layer, records, projection2) {
    const placed = records.filter((r) => r.lon != null && r.lat != null && r.shape).map((r) => ({ r, xy: projection2([r.lon, r.lat]) })).filter((m) => m.xy && Number.isFinite(m.xy[0]));
    const g = layer.selectAll("g.mark-group").data(placed, (m) => m.r.id).join((enter) => {
      const e = enter.append("g").attr("class", "mark-group");
      e.append("path").attr("class", (m) => `mark ${m.r.shape}`).attr("d", (m) => SHAPES[m.r.shape] ?? SHAPES.circle);
      e.append("title");
      const t = e.append("text").attr("class", "mark-label").attr("x", 11).attr("y", 4);
      t.append("tspan").attr("class", "what");
      t.append("tspan").attr("class", "when").attr("dx", 5);
      return e;
    });
    g.attr("transform", (m) => `translate(${m.xy[0]},${m.xy[1]})`);
    g.select("title").text((m) => `${m.r.label} \xB7 ${yearLabel(m.r)}${m.r.source ? `
${m.r.source}` : ""}`);
    g.select("tspan.what").text((m) => m.r.label);
    g.select("tspan.when").text((m) => yearLabel(m.r));
    return placed.length;
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
    const marksLayer = map2.append("g").attr("class", "marks");
    drawPaperOverlay(root2, W, H);
    root2.append("path").attr("class", "frame").attr("d", `M${x05},${y12}L${x05},${y05}L${x12},${y05}L${x12},${y12}`);
    const legend = createLegend(root2, frame2);
    let currentTracker = tracker;
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
      if (currentTracker) legend.set(currentTracker);
      diffList.hide();
      currentYear = year;
    }
    function showMarks(records) {
      return drawMarks(marksLayer, records, projection2);
    }
    function setTracker(t) {
      currentTracker = t;
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
    return { projection: projection2, path, d, frame: frame2, showSnapshot, showDiff, showMarks, setTracker, setYear, setRange, legend, cartouche, get year() {
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

  // src/trackers/expansion.json
  var expansion_default = {
    _comment: "Expansion tracker (v0). Point records from data/records.csv rendered by shape (grammar \xA75). Empty until content rows exist; the example-* rows never render.",
    id: "expansion",
    title: "Expansion and conflict",
    legend: [
      { swatch: "shape", shape: "rust-diamond", label: "Battle or siege" },
      { swatch: "shape", shape: "moss-circle", label: "Founding or capital" },
      { swatch: "shape", shape: "navy-triangle", label: "Treaty" },
      { swatch: "line", style: "solid", label: "Documented border" },
      { swatch: "line", style: "dashed", label: "Approximate border" }
    ]
  };

  // src/main.js
  var TRACKERS = { extent: { ...extent_default, id: "extent" }, expansion: expansion_default };
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
    const [calendar, ne, bathy, vocab, recordsText] = await Promise.all([
      loadJSON("data/calendar.json"),
      loadJSON("data/base/derived/ne.topojson"),
      loadJSON("data/base/derived/bathymetry.topojson"),
      loadJSON("data/vocab.json"),
      loadText("data/records.csv").catch((err) => {
        console.error(err);
        return null;
      })
    ]);
    const checked = recordsText == null ? { records: [], problems: [{ line: 0, id: "", message: "data/records.csv could not be loaded" }], examples: 0, total: 0 } : validateRecords(recordsText, vocab);
    const records = checked.records;
    const noCoords = records.filter((r) => r.kind === "point" && (r.lon == null || r.lat == null));
    console.log(`records.csv: ${checked.total} rows \xB7 ${records.length} render \xB7 ${checked.examples} examples \xB7 ${checked.problems.length} skipped`);
    showDataProblems(checked, noCoords);
    const years = calendar.snapshots.map((s) => s.year);
    const bySnapshot = new Map(calendar.snapshots.map((s) => [s.year, s]));
    const snapshot = (year) => loadJSON(`data/base/derived/world_${year}.topojson`);
    const state = { mode: "snapshot", scope: params.get("scope") === "all" ? "all" : "tracked", tracker: TRACKERS[params.get("tracker")] ? params.get("tracker") : "extent", year: START_YEAR, from: START_FROM ?? years[Math.max(0, years.indexOf(START_YEAR) - 1)], playing: null };
    const svg = select_default2("#map");
    const atlas = createStage(svg, stage, { ne, bathy }, { tracker: TRACKERS[state.tracker], years, onYear: (y) => setYear(y) });
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
        atlas.setTracker(TRACKERS[state.tracker]);
        atlas.showSnapshot(state.year, topo, state.tracker === "extent" ? classifyExtent : () => ({ status: "muted" }));
        const n = atlas.showMarks(state.tracker === "expansion" ? recordsFor(records, "expansion", state.year, years) : []);
        atlas.setYear(state.year, bySnapshot.get(state.year).source_year);
        document.title = `Parchment \xB7 ${state.year}`;
        console.log(`snapshot ${state.year} (${state.tracker}): ${(performance.now() - t).toFixed(1)} ms${n ? `, ${n} marks` : ""}`);
      }
      if (state.mode === "diff") atlas.showMarks([]);
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
    const trackerSel = tb.append("select").attr("id", "tracker").attr("title", "Tracker").on("change", function() {
      state.tracker = this.value;
      render();
    });
    trackerSel.selectAll("option").data(Object.values(TRACKERS)).join("option").attr("value", (t) => t.id).text((t) => t.title).property("selected", (t) => t.id === state.tracker);
    tb.append("span").attr("class", "sep");
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
    const about = tb.append("span").attr("class", "menu");
    about.append("button").attr("id", "about").attr("title", "About Parchment").text("\u24D8").on("click", () => about.classed("open", !about.classed("open")));
    const ap = about.append("span").attr("class", "popover about");
    ap.append("p").html("<b>Parchment</b> \u2014 a historical timeline atlas for the classroom.<br>Atlas, design and ideas: Wil Cosgrove.");
    ap.append("p").html('Borders: <a href="https://github.com/aourednik/historical-basemaps" target="_blank" rel="noopener">historical-basemaps</a> (GPL-3). Coast, rivers, relief: <a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> (public domain). Place coordinates: Wikidata (CC0). Type: Libre Baskerville (OFL).');
    ap.append("p").html('<a href="https://github.com/wcosgrove123/parchment/blob/main/docs/DATA-LICENSES.md" target="_blank" rel="noopener">Data licences and attribution</a> \xB7 <a href="https://github.com/wcosgrove123/parchment" target="_blank" rel="noopener">Source</a> (MIT)');
    document.addEventListener("click", (e) => {
      if (!exportMenu.node().contains(e.target)) exportMenu.classed("open", false);
      if (!about.node().contains(e.target)) about.classed("open", false);
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
  function showDataProblems({ problems, examples, total }, noCoords) {
    const panel = select_default2("#data-problems");
    if (!problems.length && !noCoords.length) {
      panel.classed("hidden", true);
      return;
    }
    panel.classed("hidden", false).html("");
    const h = panel.append("h2");
    h.append("span").text(`Data problems \xB7 ${problems.length} row${problems.length === 1 ? "" : "s"} skipped`);
    h.append("button").attr("title", "Hide").text("\xD7").on("click", () => panel.classed("hidden", true));
    const ol = panel.append("ol");
    ol.selectAll("li").data(problems).join("li").html((p) => `<b>line ${p.line}</b>${p.id ? ` (${p.id})` : ""}: ${escapeHTML(p.message)}`);
    if (noCoords.length) panel.append("p").attr("class", "note").text(`${noCoords.length} point row${noCoords.length === 1 ? "" : "s"} waiting for coordinates (run node scripts/geocode.mjs): ${noCoords.map((r) => r.id).join(", ")}`);
    panel.append("p").attr("class", "note").text(`records.csv: ${total} rows, ${total - problems.length - examples} drawn, ${examples} examples not drawn.`);
  }
  var escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  main().catch((err) => {
    console.error(err);
    select_default2("#problems").classed("hidden", false).text(`Parchment could not start: ${err.message}`);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9hc2NlbmRpbmcuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXNjZW5kaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYmlzZWN0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9udW1iZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3QuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9mc3VtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9tZXJnZS5qcyIsICJub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3JhbmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9zcmMvZGlzcGF0Y2guanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlcy5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY3JlYXRvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2FycmF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yQWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbWF0Y2hlci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9maWx0ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NwYXJzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvY29uc3RhbnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdGEuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2pvaW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL21lcmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc29ydC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2FsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL25vZGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NpemUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lYWNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hdHRyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc3R5bGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3Byb3BlcnR5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi90ZXh0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9odG1sLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbG93ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2FwcGVuZC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yZW1vdmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Nsb25lLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Rpc3BhdGNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdEFsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2RlZmluZS5qcyIsICJub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2NvbG9yLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9iYXNpc0Nsb3NlZC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbnN0YW50LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29sb3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXJBcnJheS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlci5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3ZhbHVlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL3BhcnNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRpbWVyL3NyYy90aW1lb3V0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NjaGVkdWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbnRlcnJ1cHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0ci5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyVHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZHVyYXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9maWx0ZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vbWVyZ2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vcmVtb3ZlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc2VsZWN0aW9uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0VHdlZW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lbmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vdHJhbnNpdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1icnVzaC9zcmMvYnJ1c2guanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0RGVjaW1hbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9leHBvbmVudC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRHcm91cC5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXROdW1lcmFscy5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRTcGVjaWZpZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0VHJpbS5qcyIsICJub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRQcmVmaXhBdXRvLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdFJvdW5kZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0VHlwZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvaWRlbnRpdHkuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2RlZmF1bHRMb2NhbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uRml4ZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvcHJlY2lzaW9uUHJlZml4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL3ByZWNpc2lvblJvdW5kLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL21hdGguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbm9vcC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9zdHJlYW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvYXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jYXJ0ZXNpYW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY29tcG9zZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9yb3RhdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jaXJjbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9idWZmZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcG9pbnRFcXVhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL3Jlam9pbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wb2x5Z29uQ29udGFpbnMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2FudGltZXJpZGlhbi5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2NpcmNsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9jbGlwL2xpbmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9yZWN0YW5nbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbGVuZ3RoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2Rpc3RhbmNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2dyYXRpY3VsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2FyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9ib3VuZHMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9jZW50cm9pZC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2NvbnRleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9tZWFzdXJlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vZml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vcmVzYW1wbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vY3lsaW5kcmljYWxFcXVhbEFyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVycy5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVyc1VzYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbEVxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2VxdWFsRWFydGguanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9pbml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9udW1iZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb250aW51b3VzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvdGlja0Zvcm1hdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2xpbmVhci5qcyIsICJub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvdHJhbnNmb3JtLmpzIiwgInNyYy9kYXRhL2xvYWRlci5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy90cmFuc2Zvcm0uanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvcmV2ZXJzZS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9mZWF0dXJlLmpzIiwgIm5vZGVfbW9kdWxlcy90b3BvanNvbi1jbGllbnQvc3JjL3N0aXRjaC5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9tZXNoLmpzIiwgInNyYy9yZW5kZXIvcGFwZXIuanMiLCAic3JjL3JlbmRlci9sYWJlbHMuanMiLCAic3JjL3JlbmRlci9jYXJ0b3VjaGUuanMiLCAic3JjL3JlbmRlci9zdHJpcC5qcyIsICJzcmMvcmVuZGVyL2xlZ2VuZC5qcyIsICJzcmMvcmVuZGVyL2RpZmZsaXN0LmpzIiwgInNyYy92aWV3cy9kaWZmLmpzIiwgInNyYy9kYXRhL3JlY29yZHMuanMiLCAic3JjL3JlbmRlci9tYXJrcy5qcyIsICJzcmMvcmVuZGVyL2Jhc2UuanMiLCAic3JjL2V4cG9ydC9leHBvcnQuanMiLCAic3JjL3N0YWdlcy9hZnJvLWV1cmFzaWEuanNvbiIsICJzcmMvc3RhZ2VzL2Fmcm8tZXVyYXNpYS1sYW1iZXJ0Lmpzb24iLCAic3JjL3RyYWNrZXJzL2V4dGVudC5qc29uIiwgInNyYy90cmFja2Vycy9leHBhbnNpb24uanNvbiIsICJzcmMvbWFpbi5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPT0gbnVsbCB8fCBiID09IG51bGwgPyBOYU4gOiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPT0gbnVsbCB8fCBiID09IG51bGwgPyBOYU5cbiAgICA6IGIgPCBhID8gLTFcbiAgICA6IGIgPiBhID8gMVxuICAgIDogYiA+PSBhID8gMFxuICAgIDogTmFOO1xufVxuIiwgImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgZGVzY2VuZGluZyBmcm9tIFwiLi9kZXNjZW5kaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJpc2VjdG9yKGYpIHtcbiAgbGV0IGNvbXBhcmUxLCBjb21wYXJlMiwgZGVsdGE7XG5cbiAgLy8gSWYgYW4gYWNjZXNzb3IgaXMgc3BlY2lmaWVkLCBwcm9tb3RlIGl0IHRvIGEgY29tcGFyYXRvci4gSW4gdGhpcyBjYXNlIHdlXG4gIC8vIGNhbiB0ZXN0IHdoZXRoZXIgdGhlIHNlYXJjaCB2YWx1ZSBpcyAoc2VsZi0pIGNvbXBhcmFibGUuIFdlIGNhblx1MjAxOXQgZG8gdGhpc1xuICAvLyBmb3IgYSBjb21wYXJhdG9yIChleGNlcHQgZm9yIHNwZWNpZmljLCBrbm93biBjb21wYXJhdG9ycykgYmVjYXVzZSB3ZSBjYW5cdTIwMTl0XG4gIC8vIHRlbGwgaWYgdGhlIGNvbXBhcmF0b3IgaXMgc3ltbWV0cmljLCBhbmQgYW4gYXN5bW1ldHJpYyBjb21wYXJhdG9yIGNhblx1MjAxOXQgYmVcbiAgLy8gdXNlZCB0byB0ZXN0IHdoZXRoZXIgYSBzaW5nbGUgdmFsdWUgaXMgY29tcGFyYWJsZS5cbiAgaWYgKGYubGVuZ3RoICE9PSAyKSB7XG4gICAgY29tcGFyZTEgPSBhc2NlbmRpbmc7XG4gICAgY29tcGFyZTIgPSAoZCwgeCkgPT4gYXNjZW5kaW5nKGYoZCksIHgpO1xuICAgIGRlbHRhID0gKGQsIHgpID0+IGYoZCkgLSB4O1xuICB9IGVsc2Uge1xuICAgIGNvbXBhcmUxID0gZiA9PT0gYXNjZW5kaW5nIHx8IGYgPT09IGRlc2NlbmRpbmcgPyBmIDogemVybztcbiAgICBjb21wYXJlMiA9IGY7XG4gICAgZGVsdGEgPSBmO1xuICB9XG5cbiAgZnVuY3Rpb24gbGVmdChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPCAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gcmlnaHQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDw9IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiBjZW50ZXIoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgY29uc3QgaSA9IGxlZnQoYSwgeCwgbG8sIGhpIC0gMSk7XG4gICAgcmV0dXJuIGkgPiBsbyAmJiBkZWx0YShhW2kgLSAxXSwgeCkgPiAtZGVsdGEoYVtpXSwgeCkgPyBpIC0gMSA6IGk7XG4gIH1cblxuICByZXR1cm4ge2xlZnQsIGNlbnRlciwgcmlnaHR9O1xufVxuXG5mdW5jdGlvbiB6ZXJvKCkge1xuICByZXR1cm4gMDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBudW1iZXIoeCkge1xuICByZXR1cm4geCA9PT0gbnVsbCA/IE5hTiA6ICt4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIG51bWJlcnModmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGJpc2VjdG9yIGZyb20gXCIuL2Jpc2VjdG9yLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG5jb25zdCBhc2NlbmRpbmdCaXNlY3QgPSBiaXNlY3Rvcihhc2NlbmRpbmcpO1xuZXhwb3J0IGNvbnN0IGJpc2VjdFJpZ2h0ID0gYXNjZW5kaW5nQmlzZWN0LnJpZ2h0O1xuZXhwb3J0IGNvbnN0IGJpc2VjdExlZnQgPSBhc2NlbmRpbmdCaXNlY3QubGVmdDtcbmV4cG9ydCBjb25zdCBiaXNlY3RDZW50ZXIgPSBiaXNlY3RvcihudW1iZXIpLmNlbnRlcjtcbmV4cG9ydCBkZWZhdWx0IGJpc2VjdFJpZ2h0O1xuIiwgIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9weXRob24vY3B5dGhvbi9ibG9iL2E3NGVlYTIzOGY1YmFiYTE1Nzk3ZTJlOGI1NzBkMTUzYmM4NjkwYTcvTW9kdWxlcy9tYXRobW9kdWxlLmMjTDE0MjNcbmV4cG9ydCBjbGFzcyBBZGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3BhcnRpYWxzID0gbmV3IEZsb2F0NjRBcnJheSgzMik7XG4gICAgdGhpcy5fbiA9IDA7XG4gIH1cbiAgYWRkKHgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGFydGlhbHM7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5fbiAmJiBqIDwgMzI7IGorKykge1xuICAgICAgY29uc3QgeSA9IHBbal0sXG4gICAgICAgIGhpID0geCArIHksXG4gICAgICAgIGxvID0gTWF0aC5hYnMoeCkgPCBNYXRoLmFicyh5KSA/IHggLSAoaGkgLSB5KSA6IHkgLSAoaGkgLSB4KTtcbiAgICAgIGlmIChsbykgcFtpKytdID0gbG87XG4gICAgICB4ID0gaGk7XG4gICAgfVxuICAgIHBbaV0gPSB4O1xuICAgIHRoaXMuX24gPSBpICsgMTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YWx1ZU9mKCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wYXJ0aWFscztcbiAgICBsZXQgbiA9IHRoaXMuX24sIHgsIHksIGxvLCBoaSA9IDA7XG4gICAgaWYgKG4gPiAwKSB7XG4gICAgICBoaSA9IHBbLS1uXTtcbiAgICAgIHdoaWxlIChuID4gMCkge1xuICAgICAgICB4ID0gaGk7XG4gICAgICAgIHkgPSBwWy0tbl07XG4gICAgICAgIGhpID0geCArIHk7XG4gICAgICAgIGxvID0geSAtIChoaSAtIHgpO1xuICAgICAgICBpZiAobG8pIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKG4gPiAwICYmICgobG8gPCAwICYmIHBbbiAtIDFdIDwgMCkgfHwgKGxvID4gMCAmJiBwW24gLSAxXSA+IDApKSkge1xuICAgICAgICB5ID0gbG8gKiAyO1xuICAgICAgICB4ID0gaGkgKyB5O1xuICAgICAgICBpZiAoeSA9PSB4IC0gaGkpIGhpID0geDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmc3VtKHZhbHVlcywgdmFsdWVvZikge1xuICBjb25zdCBhZGRlciA9IG5ldyBBZGRlcigpO1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgPSArdmFsdWUpIHtcbiAgICAgICAgYWRkZXIuYWRkKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgPSArdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkge1xuICAgICAgICBhZGRlci5hZGQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gK2FkZGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmN1bXN1bSh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgY29uc3QgYWRkZXIgPSBuZXcgQWRkZXIoKTtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIHJldHVybiBGbG9hdDY0QXJyYXkuZnJvbSh2YWx1ZXMsIHZhbHVlb2YgPT09IHVuZGVmaW5lZFxuICAgICAgPyB2ID0+IGFkZGVyLmFkZCgrdiB8fCAwKVxuICAgICAgOiB2ID0+IGFkZGVyLmFkZCgrdmFsdWVvZih2LCArK2luZGV4LCB2YWx1ZXMpIHx8IDApXG4gICk7XG59XG4iLCAiY29uc3QgZTEwID0gTWF0aC5zcXJ0KDUwKSxcbiAgICBlNSA9IE1hdGguc3FydCgxMCksXG4gICAgZTIgPSBNYXRoLnNxcnQoMik7XG5cbmZ1bmN0aW9uIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBjb25zdCBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgwLCBjb3VudCksXG4gICAgICBwb3dlciA9IE1hdGguZmxvb3IoTWF0aC5sb2cxMChzdGVwKSksXG4gICAgICBlcnJvciA9IHN0ZXAgLyBNYXRoLnBvdygxMCwgcG93ZXIpLFxuICAgICAgZmFjdG9yID0gZXJyb3IgPj0gZTEwID8gMTAgOiBlcnJvciA+PSBlNSA/IDUgOiBlcnJvciA+PSBlMiA/IDIgOiAxO1xuICBsZXQgaTEsIGkyLCBpbmM7XG4gIGlmIChwb3dlciA8IDApIHtcbiAgICBpbmMgPSBNYXRoLnBvdygxMCwgLXBvd2VyKSAvIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgKiBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wICogaW5jKTtcbiAgICBpZiAoaTEgLyBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgLyBpbmMgPiBzdG9wKSAtLWkyO1xuICAgIGluYyA9IC1pbmM7XG4gIH0gZWxzZSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIHBvd2VyKSAqIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgLyBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wIC8gaW5jKTtcbiAgICBpZiAoaTEgKiBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgKiBpbmMgPiBzdG9wKSAtLWkyO1xuICB9XG4gIGlmIChpMiA8IGkxICYmIDAuNSA8PSBjb3VudCAmJiBjb3VudCA8IDIpIHJldHVybiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQgKiAyKTtcbiAgcmV0dXJuIFtpMSwgaTIsIGluY107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpY2tzKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgaWYgKCEoY291bnQgPiAwKSkgcmV0dXJuIFtdO1xuICBpZiAoc3RhcnQgPT09IHN0b3ApIHJldHVybiBbc3RhcnRdO1xuICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0LCBbaTEsIGkyLCBpbmNdID0gcmV2ZXJzZSA/IHRpY2tTcGVjKHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpO1xuICBpZiAoIShpMiA+PSBpMSkpIHJldHVybiBbXTtcbiAgY29uc3QgbiA9IGkyIC0gaTEgKyAxLCB0aWNrcyA9IG5ldyBBcnJheShuKTtcbiAgaWYgKHJldmVyc2UpIHtcbiAgICBpZiAoaW5jIDwgMCkgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgLyAtaW5jO1xuICAgIGVsc2UgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgKiBpbmM7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpICogaW5jO1xuICB9XG4gIHJldHVybiB0aWNrcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIHN0b3AgPSArc3RvcCwgc3RhcnQgPSArc3RhcnQsIGNvdW50ID0gK2NvdW50O1xuICByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KVsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgaW5jID0gcmV2ZXJzZSA/IHRpY2tJbmNyZW1lbnQoc3RvcCwgc3RhcnQsIGNvdW50KSA6IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgcmV0dXJuIChyZXZlcnNlID8gLTEgOiAxKSAqIChpbmMgPCAwID8gMSAvIC1pbmMgOiBpbmMpO1xufVxuIiwgImZ1bmN0aW9uKiBmbGF0dGVuKGFycmF5cykge1xuICBmb3IgKGNvbnN0IGFycmF5IG9mIGFycmF5cykge1xuICAgIHlpZWxkKiBhcnJheTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZShhcnJheXMpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oZmxhdHRlbihhcnJheXMpKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5nZShzdGFydCwgc3RvcCwgc3RlcCkge1xuICBzdGFydCA9ICtzdGFydCwgc3RvcCA9ICtzdG9wLCBzdGVwID0gKG4gPSBhcmd1bWVudHMubGVuZ3RoKSA8IDIgPyAoc3RvcCA9IHN0YXJ0LCBzdGFydCA9IDAsIDEpIDogbiA8IDMgPyAxIDogK3N0ZXA7XG5cbiAgdmFyIGkgPSAtMSxcbiAgICAgIG4gPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSkgfCAwLFxuICAgICAgcmFuZ2UgPSBuZXcgQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICByYW5nZVtpXSA9IHN0YXJ0ICsgaSAqIHN0ZXA7XG4gIH1cblxuICByZXR1cm4gcmFuZ2U7XG59XG4iLCAidmFyIG5vb3AgPSB7dmFsdWU6ICgpID0+IHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pIHx8IC9bXFxzLl0vLnRlc3QodCkpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGlzcGF0Y2g7XG4iLCAiZXhwb3J0IHZhciB4aHRtbCA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICB4aHRtbDogeGh0bWwsXG4gIHhsaW5rOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgeG1sOiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiLFxuICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiXG59O1xuIiwgImltcG9ydCBuYW1lc3BhY2VzIGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgcHJlZml4ID0gbmFtZSArPSBcIlwiLCBpID0gcHJlZml4LmluZGV4T2YoXCI6XCIpO1xuICBpZiAoaSA+PSAwICYmIChwcmVmaXggPSBuYW1lLnNsaWNlKDAsIGkpKSAhPT0gXCJ4bWxuc1wiKSBuYW1lID0gbmFtZS5zbGljZShpICsgMSk7XG4gIHJldHVybiBuYW1lc3BhY2VzLmhhc093blByb3BlcnR5KHByZWZpeCkgPyB7c3BhY2U6IG5hbWVzcGFjZXNbcHJlZml4XSwgbG9jYWw6IG5hbWV9IDogbmFtZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbn1cbiIsICJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuL25hbWVzcGFjZS5qc1wiO1xuaW1wb3J0IHt4aHRtbH0gZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5mdW5jdGlvbiBjcmVhdG9ySW5oZXJpdChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jdW1lbnQgPSB0aGlzLm93bmVyRG9jdW1lbnQsXG4gICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgIHJldHVybiB1cmkgPT09IHhodG1sICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHhodG1sXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdG9yRml4ZWQoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gKGZ1bGxuYW1lLmxvY2FsXG4gICAgICA/IGNyZWF0b3JGaXhlZFxuICAgICAgOiBjcmVhdG9ySW5oZXJpdCkoZnVsbG5hbWUpO1xufVxuIiwgImZ1bmN0aW9uIG5vbmUoKSB7fVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IG5vbmUgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi4vc2VsZWN0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiLy8gR2l2ZW4gc29tZXRoaW5nIGFycmF5IGxpa2UgKG9yIG51bGwpLCByZXR1cm5zIHNvbWV0aGluZyB0aGF0IGlzIHN0cmljdGx5IGFuXG4vLyBhcnJheS4gVGhpcyBpcyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFycmF5LWxpa2Ugb2JqZWN0cyBwYXNzZWQgdG8gZDMuc2VsZWN0QWxsXG4vLyBvciBzZWxlY3Rpb24uc2VsZWN0QWxsIGFyZSBjb252ZXJ0ZWQgaW50byBwcm9wZXIgYXJyYXlzIHdoZW4gY3JlYXRpbmcgYVxuLy8gc2VsZWN0aW9uOyB3ZSBkb25cdTIwMTl0IGV2ZXIgd2FudCB0byBjcmVhdGUgYSBzZWxlY3Rpb24gYmFja2VkIGJ5IGEgbGl2ZVxuLy8gSFRNTENvbGxlY3Rpb24gb3IgTm9kZUxpc3QuIEhvd2V2ZXIsIG5vdGUgdGhhdCBzZWxlY3Rpb24uc2VsZWN0QWxsIHdpbGwgdXNlIGFcbi8vIHN0YXRpYyBOb2RlTGlzdCBhcyBhIGdyb3VwLCBzaW5jZSBpdCBzYWZlbHkgZGVyaXZlZCBmcm9tIHF1ZXJ5U2VsZWN0b3JBbGwuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhcnJheSh4KSB7XG4gIHJldHVybiB4ID09IG51bGwgPyBbXSA6IEFycmF5LmlzQXJyYXkoeCkgPyB4IDogQXJyYXkuZnJvbSh4KTtcbn1cbiIsICJmdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IGVtcHR5IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgYXJyYXkgZnJvbSBcIi4uL2FycmF5LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3JBbGwgZnJvbSBcIi4uL3NlbGVjdG9yQWxsLmpzXCI7XG5cbmZ1bmN0aW9uIGFycmF5QWxsKHNlbGVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFycmF5KHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0ID09PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IGFycmF5QWxsKHNlbGVjdCk7XG4gIGVsc2Ugc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzdWJncm91cHMucHVzaChzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCBwYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZE1hdGNoZXIoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuIiwgImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kO1xuXG5mdW5jdGlvbiBjaGlsZEZpbmQobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaW5kLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGlsZEZpcnN0KCkge1xuICByZXR1cm4gdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KG1hdGNoID09IG51bGwgPyBjaGlsZEZpcnN0XG4gICAgICA6IGNoaWxkRmluZCh0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwgImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlcjtcblxuZnVuY3Rpb24gY2hpbGRyZW4oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY2hpbGRyZW4pO1xufVxuXG5mdW5jdGlvbiBjaGlsZHJlbkZpbHRlcihtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbHRlci5jYWxsKHRoaXMuY2hpbGRyZW4sIG1hdGNoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0QWxsKG1hdGNoID09IG51bGwgPyBjaGlsZHJlblxuICAgICAgOiBjaGlsZHJlbkZpbHRlcih0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IG1hdGNoZXIgZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLCAiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZW50ZXIgfHwgdGhpcy5fZ3JvdXBzLm1hcChzcGFyc2UpLCB0aGlzLl9wYXJlbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVudGVyTm9kZShwYXJlbnQsIGRhdHVtKSB7XG4gIHRoaXMub3duZXJEb2N1bWVudCA9IHBhcmVudC5vd25lckRvY3VtZW50O1xuICB0aGlzLm5hbWVzcGFjZVVSSSA9IHBhcmVudC5uYW1lc3BhY2VVUkk7XG4gIHRoaXMuX25leHQgPSBudWxsO1xuICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gIHRoaXMuX19kYXRhX18gPSBkYXR1bTtcbn1cblxuRW50ZXJOb2RlLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEVudGVyTm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCB0aGlzLl9uZXh0KTsgfSxcbiAgaW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihjaGlsZCwgbmV4dCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgbmV4dCk7IH0sXG4gIHF1ZXJ5U2VsZWN0b3I6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7IHJldHVybiB0aGlzLl9wYXJlbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7IH0sXG4gIHF1ZXJ5U2VsZWN0b3JBbGw6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7IHJldHVybiB0aGlzLl9wYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7IH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9uXHUyMDE5dCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICBrZXlWYWx1ZXMgPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpLFxuICAgICAga2V5VmFsdWU7XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIG5vZGUuXG4gIC8vIElmIG11bHRpcGxlIG5vZGVzIGhhdmUgdGhlIHNhbWUga2V5LCB0aGUgZHVwbGljYXRlcyBhcmUgYWRkZWQgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBrZXlWYWx1ZXNbaV0gPSBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSArIFwiXCI7XG4gICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIGRhdHVtLlxuICAvLyBJZiB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LCBqb2luIGFuZCBhZGQgaXQgdG8gdXBkYXRlLlxuICAvLyBJZiB0aGVyZSBpcyBub3QgKG9yIHRoZSBrZXkgaXMgYSBkdXBsaWNhdGUpLCBhZGQgaXQgdG8gZW50ZXIuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKHBhcmVudCwgZGF0YVtpXSwgaSwgZGF0YSkgKyBcIlwiO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkge1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgbm9kZUJ5S2V5VmFsdWUuZGVsZXRlKGtleVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSA9PT0gbm9kZSkpIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkYXR1bShub2RlKSB7XG4gIHJldHVybiBub2RlLl9fZGF0YV9fO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIEFycmF5LmZyb20odGhpcywgZGF0dW0pO1xuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IGFycmF5bGlrZSh2YWx1ZS5jYWxsKHBhcmVudCwgcGFyZW50ICYmIHBhcmVudC5fX2RhdGFfXywgaiwgcGFyZW50cykpLFxuICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgIGVudGVyR3JvdXAgPSBlbnRlcltqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgdXBkYXRlR3JvdXAgPSB1cGRhdGVbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIGV4aXRHcm91cCA9IGV4aXRbal0gPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpO1xuXG4gICAgYmluZChwYXJlbnQsIGdyb3VwLCBlbnRlckdyb3VwLCB1cGRhdGVHcm91cCwgZXhpdEdyb3VwLCBkYXRhLCBrZXkpO1xuXG4gICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMCwgcHJldmlvdXMsIG5leHQ7IGkwIDwgZGF0YUxlbmd0aDsgKytpMCkge1xuICAgICAgaWYgKHByZXZpb3VzID0gZW50ZXJHcm91cFtpMF0pIHtcbiAgICAgICAgaWYgKGkwID49IGkxKSBpMSA9IGkwICsgMTtcbiAgICAgICAgd2hpbGUgKCEobmV4dCA9IHVwZGF0ZUdyb3VwW2kxXSkgJiYgKytpMSA8IGRhdGFMZW5ndGgpO1xuICAgICAgICBwcmV2aW91cy5fbmV4dCA9IG5leHQgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUgPSBuZXcgU2VsZWN0aW9uKHVwZGF0ZSwgcGFyZW50cyk7XG4gIHVwZGF0ZS5fZW50ZXIgPSBlbnRlcjtcbiAgdXBkYXRlLl9leGl0ID0gZXhpdDtcbiAgcmV0dXJuIHVwZGF0ZTtcbn1cblxuLy8gR2l2ZW4gc29tZSBkYXRhLCB0aGlzIHJldHVybnMgYW4gYXJyYXktbGlrZSB2aWV3IG9mIGl0OiBhbiBvYmplY3QgdGhhdFxuLy8gZXhwb3NlcyBhIGxlbmd0aCBwcm9wZXJ0eSBhbmQgYWxsb3dzIG51bWVyaWMgaW5kZXhpbmcuIE5vdGUgdGhhdCB1bmxpa2Vcbi8vIHNlbGVjdEFsbCwgdGhpcyBpc25cdTIwMTl0IHdvcnJpZWQgYWJvdXQgXHUyMDFDbGl2ZVx1MjAxRCBjb2xsZWN0aW9ucyBiZWNhdXNlIHRoZSByZXN1bHRpbmdcbi8vIGFycmF5IHdpbGwgb25seSBiZSB1c2VkIGJyaWVmbHkgd2hpbGUgZGF0YSBpcyBiZWluZyBib3VuZC4gKEl0IGlzIHBvc3NpYmxlIHRvXG4vLyBjYXVzZSB0aGUgZGF0YSB0byBjaGFuZ2Ugd2hpbGUgaXRlcmF0aW5nIGJ5IHVzaW5nIGEga2V5IGZ1bmN0aW9uLCBidXQgcGxlYXNlXG4vLyBkb25cdTIwMTl0OyB3ZVx1MjAxOWQgcmF0aGVyIGF2b2lkIGEgZ3JhdHVpdG91cyBjb3B5LilcbmZ1bmN0aW9uIGFycmF5bGlrZShkYXRhKSB7XG4gIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIGRhdGFcbiAgICA/IGRhdGEgLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKGRhdGEpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuIiwgImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2V4aXQgfHwgdGhpcy5fZ3JvdXBzLm1hcChzcGFyc2UpLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvbmVudGVyLCBvbnVwZGF0ZSwgb25leGl0KSB7XG4gIHZhciBlbnRlciA9IHRoaXMuZW50ZXIoKSwgdXBkYXRlID0gdGhpcywgZXhpdCA9IHRoaXMuZXhpdCgpO1xuICBpZiAodHlwZW9mIG9uZW50ZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGVudGVyID0gb25lbnRlcihlbnRlcik7XG4gICAgaWYgKGVudGVyKSBlbnRlciA9IGVudGVyLnNlbGVjdGlvbigpO1xuICB9IGVsc2Uge1xuICAgIGVudGVyID0gZW50ZXIuYXBwZW5kKG9uZW50ZXIgKyBcIlwiKTtcbiAgfVxuICBpZiAob251cGRhdGUgIT0gbnVsbCkge1xuICAgIHVwZGF0ZSA9IG9udXBkYXRlKHVwZGF0ZSk7XG4gICAgaWYgKHVwZGF0ZSkgdXBkYXRlID0gdXBkYXRlLnNlbGVjdGlvbigpO1xuICB9XG4gIGlmIChvbmV4aXQgPT0gbnVsbCkgZXhpdC5yZW1vdmUoKTsgZWxzZSBvbmV4aXQoZXhpdCk7XG4gIHJldHVybiBlbnRlciAmJiB1cGRhdGUgPyBlbnRlci5tZXJnZSh1cGRhdGUpLm9yZGVyKCkgOiB1cGRhdGU7XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHNlbGVjdGlvbiA9IGNvbnRleHQuc2VsZWN0aW9uID8gY29udGV4dC5zZWxlY3Rpb24oKSA6IGNvbnRleHQ7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IC0xLCBtID0gZ3JvdXBzLmxlbmd0aDsgKytqIDwgbTspIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IGdyb3VwLmxlbmd0aCAtIDEsIG5leHQgPSBncm91cFtpXSwgbm9kZTsgLS1pID49IDA7KSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGlmIChuZXh0ICYmIG5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24obmV4dCkgXiA0KSBuZXh0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpO1xuICAgICAgICBuZXh0ID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29tcGFyZSkge1xuICBpZiAoIWNvbXBhcmUpIGNvbXBhcmUgPSBhc2NlbmRpbmc7XG5cbiAgZnVuY3Rpb24gY29tcGFyZU5vZGUoYSwgYikge1xuICAgIHJldHVybiBhICYmIGIgPyBjb21wYXJlKGEuX19kYXRhX18sIGIuX19kYXRhX18pIDogIWEgLSAhYjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHNvcnRncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHNvcnRncm91cCA9IHNvcnRncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNvcnRncm91cFtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRncm91cC5zb3J0KGNvbXBhcmVOb2RlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHNvcnRncm91cHMsIHRoaXMuX3BhcmVudHMpLm9yZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICBhcmd1bWVudHNbMF0gPSB0aGlzO1xuICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIHZhciBub2RlID0gZ3JvdXBbaV07XG4gICAgICBpZiAobm9kZSkgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzaXplID0gMDtcbiAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMpICsrc2l6ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICF0aGlzLm5vZGUoKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaykge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBjYWxsYmFjay5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsICJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuLi9uYW1lc3BhY2UuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgcmV0dXJuIGZ1bGxuYW1lLmxvY2FsXG4gICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpXG4gICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUoZnVsbG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbilcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKSkoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSkge1xuICByZXR1cm4gKG5vZGUub3duZXJEb2N1bWVudCAmJiBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpIC8vIG5vZGUgaXMgYSBOb2RlXG4gICAgICB8fCAobm9kZS5kb2N1bWVudCAmJiBub2RlKSAvLyBub2RlIGlzIGEgV2luZG93XG4gICAgICB8fCBub2RlLmRlZmF1bHRWaWV3OyAvLyBub2RlIGlzIGEgRG9jdW1lbnRcbn1cbiIsICJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgZWxzZSB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHYsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICAgID8gc3R5bGVSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgPyBzdHlsZUZ1bmN0aW9uXG4gICAgICAgICAgICA6IHN0eWxlQ29uc3RhbnQpKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSlcbiAgICAgIDogc3R5bGVWYWx1ZSh0aGlzLm5vZGUoKSwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZVZhbHVlKG5vZGUsIG5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKVxuICAgICAgfHwgZGVmYXVsdFZpZXcobm9kZSkuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xufVxuIiwgImZ1bmN0aW9uIHByb3BlcnR5UmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5RnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICBlbHNlIHRoaXNbbmFtZV0gPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBwcm9wZXJ0eVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBwcm9wZXJ0eUZ1bmN0aW9uXG4gICAgICAgICAgOiBwcm9wZXJ0eUNvbnN0YW50KShuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpW25hbWVdO1xufVxuIiwgImZ1bmN0aW9uIGNsYXNzQXJyYXkoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcudHJpbSgpLnNwbGl0KC9efFxccysvKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NMaXN0KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuY2xhc3NMaXN0IHx8IG5ldyBDbGFzc0xpc3Qobm9kZSk7XG59XG5cbmZ1bmN0aW9uIENsYXNzTGlzdChub2RlKSB7XG4gIHRoaXMuX25vZGUgPSBub2RlO1xuICB0aGlzLl9uYW1lcyA9IGNsYXNzQXJyYXkobm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKTtcbn1cblxuQ2xhc3NMaXN0LnByb3RvdHlwZSA9IHtcbiAgYWRkOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChpIDwgMCkge1xuICAgICAgdGhpcy5fbmFtZXMucHVzaChuYW1lKTtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy5fbmFtZXMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChpID49IDApIHtcbiAgICAgIHRoaXMuX25hbWVzLnNwbGljZShpLCAxKTtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy5fbmFtZXMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgY29udGFpbnM6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKSA+PSAwO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjbGFzc2VkQWRkKG5vZGUsIG5hbWVzKSB7XG4gIHZhciBsaXN0ID0gY2xhc3NMaXN0KG5vZGUpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBuKSBsaXN0LmFkZChuYW1lc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRSZW1vdmUobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QucmVtb3ZlKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFRydWUobmFtZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNsYXNzZWRBZGQodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkRmFsc2UobmFtZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNsYXNzZWRSZW1vdmUodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkRnVuY3Rpb24obmFtZXMsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAodmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA/IGNsYXNzZWRBZGQgOiBjbGFzc2VkUmVtb3ZlKSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBuYW1lcyA9IGNsYXNzQXJyYXkobmFtZSArIFwiXCIpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBsaXN0ID0gY2xhc3NMaXN0KHRoaXMubm9kZSgpKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWxpc3QuY29udGFpbnMobmFtZXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBjbGFzc2VkRnVuY3Rpb24gOiB2YWx1ZVxuICAgICAgPyBjbGFzc2VkVHJ1ZVxuICAgICAgOiBjbGFzc2VkRmFsc2UpKG5hbWVzLCB2YWx1ZSkpO1xufVxuIiwgImZ1bmN0aW9uIHRleHRSZW1vdmUoKSB7XG4gIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gdGV4dFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gdGV4dEZ1bmN0aW9uXG4gICAgICAgICAgOiB0ZXh0Q29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG59XG4iLCAiZnVuY3Rpb24gaHRtbFJlbW92ZSgpIHtcbiAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiBodG1sQ29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWxGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBodG1sUmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBodG1sRnVuY3Rpb25cbiAgICAgICAgICA6IGh0bWxDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG59XG4iLCAiZnVuY3Rpb24gcmFpc2UoKSB7XG4gIGlmICh0aGlzLm5leHRTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJhaXNlKTtcbn1cbiIsICJmdW5jdGlvbiBsb3dlcigpIHtcbiAgaWYgKHRoaXMucHJldmlvdXNTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMsIHRoaXMucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gobG93ZXIpO1xufVxuIiwgImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcbmltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi4vc2VsZWN0b3IuanNcIjtcblxuZnVuY3Rpb24gY29uc3RhbnROdWxsKCkge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgYmVmb3JlKSB7XG4gIHZhciBjcmVhdGUgPSB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZSA6IGNyZWF0b3IobmFtZSksXG4gICAgICBzZWxlY3QgPSBiZWZvcmUgPT0gbnVsbCA/IGNvbnN0YW50TnVsbCA6IHR5cGVvZiBiZWZvcmUgPT09IFwiZnVuY3Rpb25cIiA/IGJlZm9yZSA6IHNlbGVjdG9yKGJlZm9yZSk7XG4gIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNlcnRCZWZvcmUoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IG51bGwpO1xuICB9KTtcbn1cbiIsICJmdW5jdGlvbiByZW1vdmUoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmVtb3ZlKTtcbn1cbiIsICJmdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZShmYWxzZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZURlZXAoKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKHRydWUpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkZWVwKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChkZWVwID8gc2VsZWN0aW9uX2Nsb25lRGVlcCA6IHNlbGVjdGlvbl9jbG9uZVNoYWxsb3cpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMucHJvcGVydHkoXCJfX2RhdGFfX1wiLCB2YWx1ZSlcbiAgICAgIDogdGhpcy5ub2RlKCkuX19kYXRhX187XG59XG4iLCAiZnVuY3Rpb24gY29udGV4dExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQsIHRoaXMuX19kYXRhX18pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvblJlbW92ZSh0eXBlbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uO1xuICAgIGlmICghb24pIHJldHVybjtcbiAgICBmb3IgKHZhciBqID0gMCwgaSA9IC0xLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAobyA9IG9uW2pdLCAoIXR5cGVuYW1lLnR5cGUgfHwgby50eXBlID09PSB0eXBlbmFtZS50eXBlKSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uWysraV0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKytpKSBvbi5sZW5ndGggPSBpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX19vbjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25BZGQodHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb24sIG8sIGxpc3RlbmVyID0gY29udGV4dExpc3RlbmVyKHZhbHVlKTtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAoKG8gPSBvbltqXSkudHlwZSA9PT0gdHlwZW5hbWUudHlwZSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciA9IGxpc3RlbmVyLCBvLm9wdGlvbnMgPSBvcHRpb25zKTtcbiAgICAgICAgby52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlbmFtZS50eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgbyA9IHt0eXBlOiB0eXBlbmFtZS50eXBlLCBuYW1lOiB0eXBlbmFtZS5uYW1lLCB2YWx1ZTogdmFsdWUsIGxpc3RlbmVyOiBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uc307XG4gICAgaWYgKCFvbikgdGhpcy5fX29uID0gW29dO1xuICAgIGVsc2Ugb24ucHVzaChvKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlbmFtZXMgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIpLCBpLCBuID0gdHlwZW5hbWVzLmxlbmd0aCwgdDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgb24gPSB0aGlzLm5vZGUoKS5fX29uO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGZvciAoaSA9IDAsIG8gPSBvbltqXTsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHQgPSB0eXBlbmFtZXNbaV0pLnR5cGUgPT09IG8udHlwZSAmJiB0Lm5hbWUgPT09IG8ubmFtZSkge1xuICAgICAgICAgIHJldHVybiBvLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIG9uID0gdmFsdWUgPyBvbkFkZCA6IG9uUmVtb3ZlO1xuICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB0aGlzLmVhY2gob24odHlwZW5hbWVzW2ldLCB2YWx1ZSwgb3B0aW9ucykpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsICJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG5vZGUsIHR5cGUsIHBhcmFtcykge1xuICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSksXG4gICAgICBldmVudCA9IHdpbmRvdy5DdXN0b21FdmVudDtcblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBldmVudCA9IG5ldyBldmVudCh0eXBlLCBwYXJhbXMpO1xuICB9IGVsc2Uge1xuICAgIGV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgaWYgKHBhcmFtcykgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSksIGV2ZW50LmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgZWxzZSBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgfVxuXG4gIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ29uc3RhbnQodHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGRpc3BhdGNoRnVuY3Rpb25cbiAgICAgIDogZGlzcGF0Y2hDb25zdGFudCkodHlwZSwgcGFyYW1zKSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24qKCkge1xuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgeWllbGQgbm9kZTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgc2VsZWN0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCBmcm9tIFwiLi9zZWxlY3RDaGlsZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiBmcm9tIFwiLi9zZWxlY3RDaGlsZHJlbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdGEgZnJvbSBcIi4vZGF0YS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbnRlciBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9leGl0IGZyb20gXCIuL2V4aXQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fam9pbiBmcm9tIFwiLi9qb2luLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29yZGVyIGZyb20gXCIuL29yZGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NvcnQgZnJvbSBcIi4vc29ydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZXMgZnJvbSBcIi4vbm9kZXMuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZSBmcm9tIFwiLi9ub2RlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NpemUgZnJvbSBcIi4vc2l6ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbXB0eSBmcm9tIFwiLi9lbXB0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lYWNoIGZyb20gXCIuL2VhY2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3Byb3BlcnR5IGZyb20gXCIuL3Byb3BlcnR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NsYXNzZWQgZnJvbSBcIi4vY2xhc3NlZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faHRtbCBmcm9tIFwiLi9odG1sLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JhaXNlIGZyb20gXCIuL3JhaXNlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2xvd2VyIGZyb20gXCIuL2xvd2VyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2FwcGVuZCBmcm9tIFwiLi9hcHBlbmQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faW5zZXJ0IGZyb20gXCIuL2luc2VydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Nsb25lIGZyb20gXCIuL2Nsb25lLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdHVtIGZyb20gXCIuL2RhdHVtLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Rpc3BhdGNoIGZyb20gXCIuL2Rpc3BhdGNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2l0ZXJhdG9yIGZyb20gXCIuL2l0ZXJhdG9yLmpzXCI7XG5cbmV4cG9ydCB2YXIgcm9vdCA9IFtudWxsXTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdGlvbihncm91cHMsIHBhcmVudHMpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF1dLCByb290KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX3NlbGVjdGlvbigpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblNlbGVjdGlvbi5wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2VsZWN0aW9uLFxuICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiBzZWxlY3Rpb25fZmlsdGVyLFxuICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgZXhpdDogc2VsZWN0aW9uX2V4aXQsXG4gIGpvaW46IHNlbGVjdGlvbl9qb2luLFxuICBtZXJnZTogc2VsZWN0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHNlbGVjdGlvbl9zZWxlY3Rpb24sXG4gIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICBjYWxsOiBzZWxlY3Rpb25fY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgYXR0cjogc2VsZWN0aW9uX2F0dHIsXG4gIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzc2VkLFxuICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgaHRtbDogc2VsZWN0aW9uX2h0bWwsXG4gIHJhaXNlOiBzZWxlY3Rpb25fcmFpc2UsXG4gIGxvd2VyOiBzZWxlY3Rpb25fbG93ZXIsXG4gIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgaW5zZXJ0OiBzZWxlY3Rpb25faW5zZXJ0LFxuICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gIGNsb25lOiBzZWxlY3Rpb25fY2xvbmUsXG4gIGRhdHVtOiBzZWxlY3Rpb25fZGF0dW0sXG4gIG9uOiBzZWxlY3Rpb25fb24sXG4gIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2gsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25faXRlcmF0b3Jcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbGVjdGlvbjtcbiIsICJpbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFtbc2VsZWN0b3JdXSwgcm9vdCk7XG59XG4iLCAiaW1wb3J0IGFycmF5IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcildLCBbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XSlcbiAgICAgIDogbmV3IFNlbGVjdGlvbihbYXJyYXkoc2VsZWN0b3IpXSwgcm9vdCk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29uc3RydWN0b3IsIGZhY3RvcnksIHByb3RvdHlwZSkge1xuICBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBmYWN0b3J5LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgcHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY29uc3RydWN0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQocGFyZW50LCBkZWZpbml0aW9uKSB7XG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudC5wcm90b3R5cGUpO1xuICBmb3IgKHZhciBrZXkgaW4gZGVmaW5pdGlvbikgcHJvdG90eXBlW2tleV0gPSBkZWZpbml0aW9uW2tleV07XG4gIHJldHVybiBwcm90b3R5cGU7XG59XG4iLCAiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xvcigpIHt9XG5cbmV4cG9ydCB2YXIgZGFya2VyID0gMC43O1xuZXhwb3J0IHZhciBicmlnaHRlciA9IDEgLyBkYXJrZXI7XG5cbnZhciByZUkgPSBcIlxcXFxzKihbKy1dP1xcXFxkKylcXFxccypcIixcbiAgICByZU4gPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPylcXFxccypcIixcbiAgICByZVAgPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPyklXFxcXHMqXCIsXG4gICAgcmVIZXggPSAvXiMoWzAtOWEtZl17Myw4fSkkLyxcbiAgICByZVJnYkludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfVxcXFwpJGApLFxuICAgIHJlUmdiUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVSZ2JhSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZVJnYmFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlSHNsUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVIc2xhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xhXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKTtcblxudmFyIG5hbWVkID0ge1xuICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICBhbnRpcXVld2hpdGU6IDB4ZmFlYmQ3LFxuICBhcXVhOiAweDAwZmZmZixcbiAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gIGF6dXJlOiAweGYwZmZmZixcbiAgYmVpZ2U6IDB4ZjVmNWRjLFxuICBiaXNxdWU6IDB4ZmZlNGM0LFxuICBibGFjazogMHgwMDAwMDAsXG4gIGJsYW5jaGVkYWxtb25kOiAweGZmZWJjZCxcbiAgYmx1ZTogMHgwMDAwZmYsXG4gIGJsdWV2aW9sZXQ6IDB4OGEyYmUyLFxuICBicm93bjogMHhhNTJhMmEsXG4gIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gIGNhZGV0Ymx1ZTogMHg1ZjllYTAsXG4gIGNoYXJ0cmV1c2U6IDB4N2ZmZjAwLFxuICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICBjb3JhbDogMHhmZjdmNTAsXG4gIGNvcm5mbG93ZXJibHVlOiAweDY0OTVlZCxcbiAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICBjcmltc29uOiAweGRjMTQzYyxcbiAgY3lhbjogMHgwMGZmZmYsXG4gIGRhcmtibHVlOiAweDAwMDA4YixcbiAgZGFya2N5YW46IDB4MDA4YjhiLFxuICBkYXJrZ29sZGVucm9kOiAweGI4ODYwYixcbiAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICBkYXJrZ3JleTogMHhhOWE5YTksXG4gIGRhcmtraGFraTogMHhiZGI3NmIsXG4gIGRhcmttYWdlbnRhOiAweDhiMDA4YixcbiAgZGFya29saXZlZ3JlZW46IDB4NTU2YjJmLFxuICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgZGFya29yY2hpZDogMHg5OTMyY2MsXG4gIGRhcmtyZWQ6IDB4OGIwMDAwLFxuICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgZGFya3NlYWdyZWVuOiAweDhmYmM4ZixcbiAgZGFya3NsYXRlYmx1ZTogMHg0ODNkOGIsXG4gIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICBkYXJrc2xhdGVncmV5OiAweDJmNGY0ZixcbiAgZGFya3R1cnF1b2lzZTogMHgwMGNlZDEsXG4gIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICBkZWVwcGluazogMHhmZjE0OTMsXG4gIGRlZXBza3libHVlOiAweDAwYmZmZixcbiAgZGltZ3JheTogMHg2OTY5NjksXG4gIGRpbWdyZXk6IDB4Njk2OTY5LFxuICBkb2RnZXJibHVlOiAweDFlOTBmZixcbiAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgZmxvcmFsd2hpdGU6IDB4ZmZmYWYwLFxuICBmb3Jlc3RncmVlbjogMHgyMjhiMjIsXG4gIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICBnYWluc2Jvcm86IDB4ZGNkY2RjLFxuICBnaG9zdHdoaXRlOiAweGY4ZjhmZixcbiAgZ29sZDogMHhmZmQ3MDAsXG4gIGdvbGRlbnJvZDogMHhkYWE1MjAsXG4gIGdyYXk6IDB4ODA4MDgwLFxuICBncmVlbjogMHgwMDgwMDAsXG4gIGdyZWVueWVsbG93OiAweGFkZmYyZixcbiAgZ3JleTogMHg4MDgwODAsXG4gIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgaG90cGluazogMHhmZjY5YjQsXG4gIGluZGlhbnJlZDogMHhjZDVjNWMsXG4gIGluZGlnbzogMHg0YjAwODIsXG4gIGl2b3J5OiAweGZmZmZmMCxcbiAga2hha2k6IDB4ZjBlNjhjLFxuICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gIGxhdmVuZGVyYmx1c2g6IDB4ZmZmMGY1LFxuICBsYXduZ3JlZW46IDB4N2NmYzAwLFxuICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICBsaWdodGJsdWU6IDB4YWRkOGU2LFxuICBsaWdodGNvcmFsOiAweGYwODA4MCxcbiAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDB4ZmFmYWQyLFxuICBsaWdodGdyYXk6IDB4ZDNkM2QzLFxuICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgbGlnaHRncmV5OiAweGQzZDNkMyxcbiAgbGlnaHRwaW5rOiAweGZmYjZjMSxcbiAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICBsaWdodHNlYWdyZWVuOiAweDIwYjJhYSxcbiAgbGlnaHRza3libHVlOiAweDg3Y2VmYSxcbiAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICBsaWdodHNsYXRlZ3JleTogMHg3Nzg4OTksXG4gIGxpZ2h0c3RlZWxibHVlOiAweGIwYzRkZSxcbiAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICBsaW1lOiAweDAwZmYwMCxcbiAgbGltZWdyZWVuOiAweDMyY2QzMixcbiAgbGluZW46IDB4ZmFmMGU2LFxuICBtYWdlbnRhOiAweGZmMDBmZixcbiAgbWFyb29uOiAweDgwMDAwMCxcbiAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gIG1lZGl1bWJsdWU6IDB4MDAwMGNkLFxuICBtZWRpdW1vcmNoaWQ6IDB4YmE1NWQzLFxuICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICBtZWRpdW1zZWFncmVlbjogMHgzY2IzNzEsXG4gIG1lZGl1bXNsYXRlYmx1ZTogMHg3YjY4ZWUsXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgbWVkaXVtdHVycXVvaXNlOiAweDQ4ZDFjYyxcbiAgbWVkaXVtdmlvbGV0cmVkOiAweGM3MTU4NSxcbiAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgbWludGNyZWFtOiAweGY1ZmZmYSxcbiAgbWlzdHlyb3NlOiAweGZmZTRlMSxcbiAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICBuYXZham93aGl0ZTogMHhmZmRlYWQsXG4gIG5hdnk6IDB4MDAwMDgwLFxuICBvbGRsYWNlOiAweGZkZjVlNixcbiAgb2xpdmU6IDB4ODA4MDAwLFxuICBvbGl2ZWRyYWI6IDB4NmI4ZTIzLFxuICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICBvcmFuZ2VyZWQ6IDB4ZmY0NTAwLFxuICBvcmNoaWQ6IDB4ZGE3MGQ2LFxuICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgcGFsZWdyZWVuOiAweDk4ZmI5OCxcbiAgcGFsZXR1cnF1b2lzZTogMHhhZmVlZWUsXG4gIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICBwYXBheWF3aGlwOiAweGZmZWZkNSxcbiAgcGVhY2hwdWZmOiAweGZmZGFiOSxcbiAgcGVydTogMHhjZDg1M2YsXG4gIHBpbms6IDB4ZmZjMGNiLFxuICBwbHVtOiAweGRkYTBkZCxcbiAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gIHB1cnBsZTogMHg4MDAwODAsXG4gIHJlYmVjY2FwdXJwbGU6IDB4NjYzMzk5LFxuICByZWQ6IDB4ZmYwMDAwLFxuICByb3N5YnJvd246IDB4YmM4ZjhmLFxuICByb3lhbGJsdWU6IDB4NDE2OWUxLFxuICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gIHNhbG1vbjogMHhmYTgwNzIsXG4gIHNhbmR5YnJvd246IDB4ZjRhNDYwLFxuICBzZWFncmVlbjogMHgyZThiNTcsXG4gIHNlYXNoZWxsOiAweGZmZjVlZSxcbiAgc2llbm5hOiAweGEwNTIyZCxcbiAgc2lsdmVyOiAweGMwYzBjMCxcbiAgc2t5Ymx1ZTogMHg4N2NlZWIsXG4gIHNsYXRlYmx1ZTogMHg2YTVhY2QsXG4gIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gIHNsYXRlZ3JleTogMHg3MDgwOTAsXG4gIHNub3c6IDB4ZmZmYWZhLFxuICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gIHN0ZWVsYmx1ZTogMHg0NjgyYjQsXG4gIHRhbjogMHhkMmI0OGMsXG4gIHRlYWw6IDB4MDA4MDgwLFxuICB0aGlzdGxlOiAweGQ4YmZkOCxcbiAgdG9tYXRvOiAweGZmNjM0NyxcbiAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgdmlvbGV0OiAweGVlODJlZSxcbiAgd2hlYXQ6IDB4ZjVkZWIzLFxuICB3aGl0ZTogMHhmZmZmZmYsXG4gIHdoaXRlc21va2U6IDB4ZjVmNWY1LFxuICB5ZWxsb3c6IDB4ZmZmZjAwLFxuICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbn07XG5cbmRlZmluZShDb2xvciwgY29sb3IsIHtcbiAgY29weShjaGFubmVscykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyB0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLCBjaGFubmVscyk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnJnYigpLmRpc3BsYXlhYmxlKCk7XG4gIH0sXG4gIGhleDogY29sb3JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IGNvbG9yX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogY29sb3JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0SHNsOiBjb2xvcl9mb3JtYXRIc2wsXG4gIGZvcm1hdFJnYjogY29sb3JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogY29sb3JfZm9ybWF0UmdiXG59KTtcblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4OCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIc2woKSB7XG4gIHJldHVybiBoc2xDb252ZXJ0KHRoaXMpLmZvcm1hdEhzbCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRSZ2IoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdFJnYigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvcihmb3JtYXQpIHtcbiAgdmFyIG0sIGw7XG4gIGZvcm1hdCA9IChmb3JtYXQgKyBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIChtID0gcmVIZXguZXhlYyhmb3JtYXQpKSA/IChsID0gbVsxXS5sZW5ndGgsIG0gPSBwYXJzZUludChtWzFdLCAxNiksIGwgPT09IDYgPyByZ2JuKG0pIC8vICNmZjAwMDBcbiAgICAgIDogbCA9PT0gMyA/IG5ldyBSZ2IoKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSwgMSkgLy8gI2YwMFxuICAgICAgOiBsID09PSA4ID8gcmdiYShtID4+IDI0ICYgMHhmZiwgbSA+PiAxNiAmIDB4ZmYsIG0gPj4gOCAmIDB4ZmYsIChtICYgMHhmZikgLyAweGZmKSAvLyAjZmYwMDAwMDBcbiAgICAgIDogbCA9PT0gNCA/IHJnYmEoKG0gPj4gMTIgJiAweGYpIHwgKG0gPj4gOCAmIDB4ZjApLCAobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSkgLyAweGZmKSAvLyAjZjAwMFxuICAgICAgOiBudWxsKSAvLyBpbnZhbGlkIGhleFxuICAgICAgOiAobSA9IHJlUmdiSW50ZWdlci5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdLCBtWzJdLCBtWzNdLCAxKSAvLyByZ2IoMjU1LCAwLCAwKVxuICAgICAgOiAobSA9IHJlUmdiUGVyY2VudC5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCAxKSAvLyByZ2IoMTAwJSwgMCUsIDAlKVxuICAgICAgOiAobSA9IHJlUmdiYUludGVnZXIuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSwgbVsyXSwgbVszXSwgbVs0XSkgLy8gcmdiYSgyNTUsIDAsIDAsIDEpXG4gICAgICA6IChtID0gcmVSZ2JhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCBtWzRdKSAvLyByZ2IoMTAwJSwgMCUsIDAlLCAxKVxuICAgICAgOiAobSA9IHJlSHNsUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCAxKSAvLyBoc2woMTIwLCA1MCUsIDUwJSlcbiAgICAgIDogKG0gPSByZUhzbGFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIG1bNF0pIC8vIGhzbGEoMTIwLCA1MCUsIDUwJSwgMSlcbiAgICAgIDogbmFtZWQuaGFzT3duUHJvcGVydHkoZm9ybWF0KSA/IHJnYm4obmFtZWRbZm9ybWF0XSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgIDogZm9ybWF0ID09PSBcInRyYW5zcGFyZW50XCIgPyBuZXcgUmdiKE5hTiwgTmFOLCBOYU4sIDApXG4gICAgICA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJnYm4obikge1xuICByZXR1cm4gbmV3IFJnYihuID4+IDE2ICYgMHhmZiwgbiA+PiA4ICYgMHhmZiwgbiAmIDB4ZmYsIDEpO1xufVxuXG5mdW5jdGlvbiByZ2JhKHIsIGcsIGIsIGEpIHtcbiAgaWYgKGEgPD0gMCkgciA9IGcgPSBiID0gTmFOO1xuICByZXR1cm4gbmV3IFJnYihyLCBnLCBiLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYkNvbnZlcnQobykge1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBSZ2I7XG4gIG8gPSBvLnJnYigpO1xuICByZXR1cm4gbmV3IFJnYihvLnIsIG8uZywgby5iLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyByZ2JDb252ZXJ0KHIpIDogbmV3IFJnYihyLCBnLCBiLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICB0aGlzLnIgPSArcjtcbiAgdGhpcy5nID0gK2c7XG4gIHRoaXMuYiA9ICtiO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKFJnYiwgcmdiLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBSZ2IoY2xhbXBpKHRoaXMuciksIGNsYW1waSh0aGlzLmcpLCBjbGFtcGkodGhpcy5iKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKC0wLjUgPD0gdGhpcy5yICYmIHRoaXMuciA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmcgJiYgdGhpcy5nIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuYiAmJiB0aGlzLmIgPCAyNTUuNSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgaGV4OiByZ2JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IHJnYl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IHJnYl9mb3JtYXRIZXg4LFxuICBmb3JtYXRSZ2I6IHJnYl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiByZ2JfZm9ybWF0UmdiXG59KSk7XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX0ke2hleCgoaXNOYU4odGhpcy5vcGFjaXR5KSA/IDEgOiB0aGlzLm9wYWNpdHkpICogMjU1KX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0UmdiKCkge1xuICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gIHJldHVybiBgJHthID09PSAxID8gXCJyZ2IoXCIgOiBcInJnYmEoXCJ9JHtjbGFtcGkodGhpcy5yKX0sICR7Y2xhbXBpKHRoaXMuZyl9LCAke2NsYW1waSh0aGlzLmIpfSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG59XG5cbmZ1bmN0aW9uIGNsYW1wYShvcGFjaXR5KSB7XG4gIHJldHVybiBpc05hTihvcGFjaXR5KSA/IDEgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcGFjaXR5KSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1waSh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSB8fCAwKSk7XG59XG5cbmZ1bmN0aW9uIGhleCh2YWx1ZSkge1xuICB2YWx1ZSA9IGNsYW1waSh2YWx1ZSk7XG4gIHJldHVybiAodmFsdWUgPCAxNiA/IFwiMFwiIDogXCJcIikgKyB2YWx1ZS50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIGhzbGEoaCwgcywgbCwgYSkge1xuICBpZiAoYSA8PSAwKSBoID0gcyA9IGwgPSBOYU47XG4gIGVsc2UgaWYgKGwgPD0gMCB8fCBsID49IDEpIGggPSBzID0gTmFOO1xuICBlbHNlIGlmIChzIDw9IDApIGggPSBOYU47XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbmV3IEhzbChvLmgsIG8ucywgby5sLCBvLm9wYWNpdHkpO1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBIc2w7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbztcbiAgbyA9IG8ucmdiKCk7XG4gIHZhciByID0gby5yIC8gMjU1LFxuICAgICAgZyA9IG8uZyAvIDI1NSxcbiAgICAgIGIgPSBvLmIgLyAyNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgaCA9IE5hTixcbiAgICAgIHMgPSBtYXggLSBtaW4sXG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICBpZiAocykge1xuICAgIGlmIChyID09PSBtYXgpIGggPSAoZyAtIGIpIC8gcyArIChnIDwgYikgKiA2O1xuICAgIGVsc2UgaWYgKGcgPT09IG1heCkgaCA9IChiIC0gcikgLyBzICsgMjtcbiAgICBlbHNlIGggPSAociAtIGcpIC8gcyArIDQ7XG4gICAgcyAvPSBsIDwgMC41ID8gbWF4ICsgbWluIDogMiAtIG1heCAtIG1pbjtcbiAgICBoICo9IDYwO1xuICB9IGVsc2Uge1xuICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICB9XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhzbENvbnZlcnQoaCkgOiBuZXcgSHNsKGgsIHMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZnVuY3Rpb24gSHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShIc2wsIGhzbCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IHRoaXMuaCAlIDM2MCArICh0aGlzLmggPCAwKSAqIDM2MCxcbiAgICAgICAgcyA9IGlzTmFOKGgpIHx8IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zLFxuICAgICAgICBsID0gdGhpcy5sLFxuICAgICAgICBtMiA9IGwgKyAobCA8IDAuNSA/IGwgOiAxIC0gbCkgKiBzLFxuICAgICAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgcmV0dXJuIG5ldyBSZ2IoXG4gICAgICBoc2wycmdiKGggPj0gMjQwID8gaCAtIDI0MCA6IGggKyAxMjAsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGgsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGggPCAxMjAgPyBoICsgMjQwIDogaCAtIDEyMCwgbTEsIG0yKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgSHNsKGNsYW1waCh0aGlzLmgpLCBjbGFtcHQodGhpcy5zKSwgY2xhbXB0KHRoaXMubCksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgwIDw9IHRoaXMucyAmJiB0aGlzLnMgPD0gMSB8fCBpc05hTih0aGlzLnMpKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLmwgJiYgdGhpcy5sIDw9IDEpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGZvcm1hdEhzbCgpIHtcbiAgICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gICAgcmV0dXJuIGAke2EgPT09IDEgPyBcImhzbChcIiA6IFwiaHNsYShcIn0ke2NsYW1waCh0aGlzLmgpfSwgJHtjbGFtcHQodGhpcy5zKSAqIDEwMH0lLCAke2NsYW1wdCh0aGlzLmwpICogMTAwfSUke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xuICB9XG59KSk7XG5cbmZ1bmN0aW9uIGNsYW1waCh2YWx1ZSkge1xuICB2YWx1ZSA9ICh2YWx1ZSB8fCAwKSAlIDM2MDtcbiAgcmV0dXJuIHZhbHVlIDwgMCA/IHZhbHVlICsgMzYwIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYW1wdCh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUgfHwgMCkpO1xufVxuXG4vKiBGcm9tIEZ2RCAxMy4zNywgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCAzICovXG5mdW5jdGlvbiBoc2wycmdiKGgsIG0xLCBtMikge1xuICByZXR1cm4gKGggPCA2MCA/IG0xICsgKG0yIC0gbTEpICogaCAvIDYwXG4gICAgICA6IGggPCAxODAgPyBtMlxuICAgICAgOiBoIDwgMjQwID8gbTEgKyAobTIgLSBtMSkgKiAoMjQwIC0gaCkgLyA2MFxuICAgICAgOiBtMSkgKiAyNTU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGJhc2lzKHQxLCB2MCwgdjEsIHYyLCB2Mykge1xuICB2YXIgdDIgPSB0MSAqIHQxLCB0MyA9IHQyICogdDE7XG4gIHJldHVybiAoKDEgLSAzICogdDEgKyAzICogdDIgLSB0MykgKiB2MFxuICAgICAgKyAoNCAtIDYgKiB0MiArIDMgKiB0MykgKiB2MVxuICAgICAgKyAoMSArIDMgKiB0MSArIDMgKiB0MiAtIDMgKiB0MykgKiB2MlxuICAgICAgKyB0MyAqIHYzKSAvIDY7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlcykge1xuICB2YXIgbiA9IHZhbHVlcy5sZW5ndGggLSAxO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gdCA8PSAwID8gKHQgPSAwKSA6IHQgPj0gMSA/ICh0ID0gMSwgbiAtIDEpIDogTWF0aC5mbG9vcih0ICogbiksXG4gICAgICAgIHYxID0gdmFsdWVzW2ldLFxuICAgICAgICB2MiA9IHZhbHVlc1tpICsgMV0sXG4gICAgICAgIHYwID0gaSA+IDAgPyB2YWx1ZXNbaSAtIDFdIDogMiAqIHYxIC0gdjIsXG4gICAgICAgIHYzID0gaSA8IG4gLSAxID8gdmFsdWVzW2kgKyAyXSA6IDIgKiB2MiAtIHYxO1xuICAgIHJldHVybiBiYXNpcygodCAtIGkgLyBuKSAqIG4sIHYwLCB2MSwgdjIsIHYzKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge2Jhc2lzfSBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG4gPSB2YWx1ZXMubGVuZ3RoO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gTWF0aC5mbG9vcigoKHQgJT0gMSkgPCAwID8gKyt0IDogdCkgKiBuKSxcbiAgICAgICAgdjAgPSB2YWx1ZXNbKGkgKyBuIC0gMSkgJSBuXSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaSAlIG5dLFxuICAgICAgICB2MiA9IHZhbHVlc1soaSArIDEpICUgbl0sXG4gICAgICAgIHYzID0gdmFsdWVzWyhpICsgMikgJSBuXTtcbiAgICByZXR1cm4gYmFzaXMoKHQgLSBpIC8gbikgKiBuLCB2MCwgdjEsIHYyLCB2Myk7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwgImltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBsaW5lYXIoYSwgZCkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBhICsgdCAqIGQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4cG9uZW50aWFsKGEsIGIsIHkpIHtcbiAgcmV0dXJuIGEgPSBNYXRoLnBvdyhhLCB5KSwgYiA9IE1hdGgucG93KGIsIHkpIC0gYSwgeSA9IDEgLyB5LCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KGEgKyB0ICogYiwgeSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodWUoYSwgYikge1xuICB2YXIgZCA9IGIgLSBhO1xuICByZXR1cm4gZCA/IGxpbmVhcihhLCBkID4gMTgwIHx8IGQgPCAtMTgwID8gZCAtIDM2MCAqIE1hdGgucm91bmQoZCAvIDM2MCkgOiBkKSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2FtbWEoeSkge1xuICByZXR1cm4gKHkgPSAreSkgPT09IDEgPyBub2dhbW1hIDogZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBiIC0gYSA/IGV4cG9uZW50aWFsKGEsIGIsIHkpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vZ2FtbWEoYSwgYikge1xuICB2YXIgZCA9IGIgLSBhO1xuICByZXR1cm4gZCA/IGxpbmVhcihhLCBkKSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xufVxuIiwgImltcG9ydCB7cmdiIGFzIGNvbG9yUmdifSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBiYXNpcyBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuaW1wb3J0IGJhc2lzQ2xvc2VkIGZyb20gXCIuL2Jhc2lzQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9nYW1tYSwge2dhbW1hfSBmcm9tIFwiLi9jb2xvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gcmdiR2FtbWEoeSkge1xuICB2YXIgY29sb3IgPSBnYW1tYSh5KTtcblxuICBmdW5jdGlvbiByZ2Ioc3RhcnQsIGVuZCkge1xuICAgIHZhciByID0gY29sb3IoKHN0YXJ0ID0gY29sb3JSZ2Ioc3RhcnQpKS5yLCAoZW5kID0gY29sb3JSZ2IoZW5kKSkuciksXG4gICAgICAgIGcgPSBjb2xvcihzdGFydC5nLCBlbmQuZyksXG4gICAgICAgIGIgPSBjb2xvcihzdGFydC5iLCBlbmQuYiksXG4gICAgICAgIG9wYWNpdHkgPSBub2dhbW1hKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuciA9IHIodCk7XG4gICAgICBzdGFydC5nID0gZyh0KTtcbiAgICAgIHN0YXJ0LmIgPSBiKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cblxuICByZ2IuZ2FtbWEgPSByZ2JHYW1tYTtcblxuICByZXR1cm4gcmdiO1xufSkoMSk7XG5cbmZ1bmN0aW9uIHJnYlNwbGluZShzcGxpbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBuID0gY29sb3JzLmxlbmd0aCxcbiAgICAgICAgciA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgaSwgY29sb3I7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY29sb3IgPSBjb2xvclJnYihjb2xvcnNbaV0pO1xuICAgICAgcltpXSA9IGNvbG9yLnIgfHwgMDtcbiAgICAgIGdbaV0gPSBjb2xvci5nIHx8IDA7XG4gICAgICBiW2ldID0gY29sb3IuYiB8fCAwO1xuICAgIH1cbiAgICByID0gc3BsaW5lKHIpO1xuICAgIGcgPSBzcGxpbmUoZyk7XG4gICAgYiA9IHNwbGluZShiKTtcbiAgICBjb2xvci5vcGFjaXR5ID0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgY29sb3IuciA9IHIodCk7XG4gICAgICBjb2xvci5nID0gZyh0KTtcbiAgICAgIGNvbG9yLmIgPSBiKHQpO1xuICAgICAgcmV0dXJuIGNvbG9yICsgXCJcIjtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHJnYkJhc2lzID0gcmdiU3BsaW5lKGJhc2lzKTtcbmV4cG9ydCB2YXIgcmdiQmFzaXNDbG9zZWQgPSByZ2JTcGxpbmUoYmFzaXNDbG9zZWQpO1xuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgaWYgKCFiKSBiID0gW107XG4gIHZhciBuID0gYSA/IE1hdGgubWluKGIubGVuZ3RoLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgYyA9IGIuc2xpY2UoKSxcbiAgICAgIGk7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgY1tpXSA9IGFbaV0gKiAoMSAtIHQpICsgYltpXSAqIHQ7XG4gICAgcmV0dXJuIGM7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlckFycmF5KHgpIHtcbiAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyh4KSAmJiAhKHggaW5zdGFuY2VvZiBEYXRhVmlldyk7XG59XG4iLCAiaW1wb3J0IHZhbHVlIGZyb20gXCIuL3ZhbHVlLmpzXCI7XG5pbXBvcnQgbnVtYmVyQXJyYXksIHtpc051bWJlckFycmF5fSBmcm9tIFwiLi9udW1iZXJBcnJheS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiAoaXNOdW1iZXJBcnJheShiKSA/IG51bWJlckFycmF5IDogZ2VuZXJpY0FycmF5KShhLCBiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyaWNBcnJheShhLCBiKSB7XG4gIHZhciBuYiA9IGIgPyBiLmxlbmd0aCA6IDAsXG4gICAgICBuYSA9IGEgPyBNYXRoLm1pbihuYiwgYS5sZW5ndGgpIDogMCxcbiAgICAgIHggPSBuZXcgQXJyYXkobmEpLFxuICAgICAgYyA9IG5ldyBBcnJheShuYiksXG4gICAgICBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBuYTsgKytpKSB4W2ldID0gdmFsdWUoYVtpXSwgYltpXSk7XG4gIGZvciAoOyBpIDwgbmI7ICsraSkgY1tpXSA9IGJbaV07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbmE7ICsraSkgY1tpXSA9IHhbaV0odCk7XG4gICAgcmV0dXJuIGM7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgZCA9IG5ldyBEYXRlO1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gZC5zZXRUaW1lKGEgKiAoMSAtIHQpICsgYiAqIHQpLCBkO1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKiAoMSAtIHQpICsgYiAqIHQ7XG4gIH07XG59XG4iLCAiaW1wb3J0IHZhbHVlIGZyb20gXCIuL3ZhbHVlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGkgPSB7fSxcbiAgICAgIGMgPSB7fSxcbiAgICAgIGs7XG5cbiAgaWYgKGEgPT09IG51bGwgfHwgdHlwZW9mIGEgIT09IFwib2JqZWN0XCIpIGEgPSB7fTtcbiAgaWYgKGIgPT09IG51bGwgfHwgdHlwZW9mIGIgIT09IFwib2JqZWN0XCIpIGIgPSB7fTtcblxuICBmb3IgKGsgaW4gYikge1xuICAgIGlmIChrIGluIGEpIHtcbiAgICAgIGlba10gPSB2YWx1ZShhW2tdLCBiW2tdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY1trXSA9IGJba107XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKGsgaW4gaSkgY1trXSA9IGlba10odCk7XG4gICAgcmV0dXJuIGM7XG4gIH07XG59XG4iLCAiaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHJlQSA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZyxcbiAgICByZUIgPSBuZXcgUmVnRXhwKHJlQS5zb3VyY2UsIFwiZ1wiKTtcblxuZnVuY3Rpb24gemVybyhiKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25lKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYih0KSArIFwiXCI7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGJpID0gcmVBLmxhc3RJbmRleCA9IHJlQi5sYXN0SW5kZXggPSAwLCAvLyBzY2FuIGluZGV4IGZvciBuZXh0IG51bWJlciBpbiBiXG4gICAgICBhbSwgLy8gY3VycmVudCBtYXRjaCBpbiBhXG4gICAgICBibSwgLy8gY3VycmVudCBtYXRjaCBpbiBiXG4gICAgICBicywgLy8gc3RyaW5nIHByZWNlZGluZyBjdXJyZW50IG51bWJlciBpbiBiLCBpZiBhbnlcbiAgICAgIGkgPSAtMSwgLy8gaW5kZXggaW4gc1xuICAgICAgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcblxuICAvLyBDb2VyY2UgaW5wdXRzIHRvIHN0cmluZ3MuXG4gIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuXG4gIC8vIEludGVycG9sYXRlIHBhaXJzIG9mIG51bWJlcnMgaW4gYSAmIGIuXG4gIHdoaWxlICgoYW0gPSByZUEuZXhlYyhhKSlcbiAgICAgICYmIChibSA9IHJlQi5leGVjKGIpKSkge1xuICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkgeyAvLyBhIHN0cmluZyBwcmVjZWRlcyB0aGUgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYnMgPSBiLnNsaWNlKGJpLCBicyk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIGlmICgoYW0gPSBhbVswXSkgPT09IChibSA9IGJtWzBdKSkgeyAvLyBudW1iZXJzIGluIGEgJiBiIG1hdGNoXG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBibTsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYm07XG4gICAgfSBlbHNlIHsgLy8gaW50ZXJwb2xhdGUgbm9uLW1hdGNoaW5nIG51bWJlcnNcbiAgICAgIHNbKytpXSA9IG51bGw7XG4gICAgICBxLnB1c2goe2k6IGksIHg6IG51bWJlcihhbSwgYm0pfSk7XG4gICAgfVxuICAgIGJpID0gcmVCLmxhc3RJbmRleDtcbiAgfVxuXG4gIC8vIEFkZCByZW1haW5zIG9mIGIuXG4gIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgYnMgPSBiLnNsaWNlKGJpKTtcbiAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICBlbHNlIHNbKytpXSA9IGJzO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBvcHRpbWl6YXRpb24gZm9yIG9ubHkgYSBzaW5nbGUgbWF0Y2guXG4gIC8vIE90aGVyd2lzZSwgaW50ZXJwb2xhdGUgZWFjaCBvZiB0aGUgbnVtYmVycyBhbmQgcmVqb2luIHRoZSBzdHJpbmcuXG4gIHJldHVybiBzLmxlbmd0aCA8IDIgPyAocVswXVxuICAgICAgPyBvbmUocVswXS54KVxuICAgICAgOiB6ZXJvKGIpKVxuICAgICAgOiAoYiA9IHEubGVuZ3RoLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgICAgICB9KTtcbn1cbiIsICJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCByZ2IgZnJvbSBcIi4vcmdiLmpzXCI7XG5pbXBvcnQge2dlbmVyaWNBcnJheX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBkYXRlIGZyb20gXCIuL2RhdGUuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQgb2JqZWN0IGZyb20gXCIuL29iamVjdC5qc1wiO1xuaW1wb3J0IHN0cmluZyBmcm9tIFwiLi9zdHJpbmcuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgdCA9IHR5cGVvZiBiLCBjO1xuICByZXR1cm4gYiA9PSBudWxsIHx8IHQgPT09IFwiYm9vbGVhblwiID8gY29uc3RhbnQoYilcbiAgICAgIDogKHQgPT09IFwibnVtYmVyXCIgPyBudW1iZXJcbiAgICAgIDogdCA9PT0gXCJzdHJpbmdcIiA/ICgoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgcmdiKSA6IHN0cmluZylcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gcmdiXG4gICAgICA6IGIgaW5zdGFuY2VvZiBEYXRlID8gZGF0ZVxuICAgICAgOiBpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXlcbiAgICAgIDogQXJyYXkuaXNBcnJheShiKSA/IGdlbmVyaWNBcnJheVxuICAgICAgOiB0eXBlb2YgYi52YWx1ZU9mICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGIudG9TdHJpbmcgIT09IFwiZnVuY3Rpb25cIiB8fCBpc05hTihiKSA/IG9iamVjdFxuICAgICAgOiBudW1iZXIpKGEsIGIpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoYSAqICgxIC0gdCkgKyBiICogdCk7XG4gIH07XG59XG4iLCAidmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0ge1xuICB0cmFuc2xhdGVYOiAwLFxuICB0cmFuc2xhdGVZOiAwLFxuICByb3RhdGU6IDAsXG4gIHNrZXdYOiAwLFxuICBzY2FsZVg6IDEsXG4gIHNjYWxlWTogMVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgYywgZCwgZSwgZikge1xuICB2YXIgc2NhbGVYLCBzY2FsZVksIHNrZXdYO1xuICBpZiAoc2NhbGVYID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpKSBhIC89IHNjYWxlWCwgYiAvPSBzY2FsZVg7XG4gIGlmIChza2V3WCA9IGEgKiBjICsgYiAqIGQpIGMgLT0gYSAqIHNrZXdYLCBkIC09IGIgKiBza2V3WDtcbiAgaWYgKHNjYWxlWSA9IE1hdGguc3FydChjICogYyArIGQgKiBkKSkgYyAvPSBzY2FsZVksIGQgLz0gc2NhbGVZLCBza2V3WCAvPSBzY2FsZVk7XG4gIGlmIChhICogZCA8IGIgKiBjKSBhID0gLWEsIGIgPSAtYiwgc2tld1ggPSAtc2tld1gsIHNjYWxlWCA9IC1zY2FsZVg7XG4gIHJldHVybiB7XG4gICAgdHJhbnNsYXRlWDogZSxcbiAgICB0cmFuc2xhdGVZOiBmLFxuICAgIHJvdGF0ZTogTWF0aC5hdGFuMihiLCBhKSAqIGRlZ3JlZXMsXG4gICAgc2tld1g6IE1hdGguYXRhbihza2V3WCkgKiBkZWdyZWVzLFxuICAgIHNjYWxlWDogc2NhbGVYLFxuICAgIHNjYWxlWTogc2NhbGVZXG4gIH07XG59XG4iLCAiaW1wb3J0IGRlY29tcG9zZSwge2lkZW50aXR5fSBmcm9tIFwiLi9kZWNvbXBvc2UuanNcIjtcblxudmFyIHN2Z05vZGU7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3ModmFsdWUpIHtcbiAgY29uc3QgbSA9IG5ldyAodHlwZW9mIERPTU1hdHJpeCA9PT0gXCJmdW5jdGlvblwiID8gRE9NTWF0cml4IDogV2ViS2l0Q1NTTWF0cml4KSh2YWx1ZSArIFwiXCIpO1xuICByZXR1cm4gbS5pc0lkZW50aXR5ID8gaWRlbnRpdHkgOiBkZWNvbXBvc2UobS5hLCBtLmIsIG0uYywgbS5kLCBtLmUsIG0uZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN2Zyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICBpZiAoIXN2Z05vZGUpIHN2Z05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImdcIik7XG4gIHN2Z05vZGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHZhbHVlKTtcbiAgaWYgKCEodmFsdWUgPSBzdmdOb2RlLnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCkpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHZhbHVlID0gdmFsdWUubWF0cml4O1xuICByZXR1cm4gZGVjb21wb3NlKHZhbHVlLmEsIHZhbHVlLmIsIHZhbHVlLmMsIHZhbHVlLmQsIHZhbHVlLmUsIHZhbHVlLmYpO1xufVxuIiwgImltcG9ydCBudW1iZXIgZnJvbSBcIi4uL251bWJlci5qc1wiO1xuaW1wb3J0IHtwYXJzZUNzcywgcGFyc2VTdmd9IGZyb20gXCIuL3BhcnNlLmpzXCI7XG5cbmZ1bmN0aW9uIGludGVycG9sYXRlVHJhbnNmb3JtKHBhcnNlLCBweENvbW1hLCBweFBhcmVuLCBkZWdQYXJlbikge1xuXG4gIGZ1bmN0aW9uIHBvcChzKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoID8gcy5wb3AoKSArIFwiIFwiIDogXCJcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZSh4YSwgeWEsIHhiLCB5YiwgcywgcSkge1xuICAgIGlmICh4YSAhPT0geGIgfHwgeWEgIT09IHliKSB7XG4gICAgICB2YXIgaSA9IHMucHVzaChcInRyYW5zbGF0ZShcIiwgbnVsbCwgcHhDb21tYSwgbnVsbCwgcHhQYXJlbik7XG4gICAgICBxLnB1c2goe2k6IGkgLSA0LCB4OiBudW1iZXIoeGEsIHhiKX0sIHtpOiBpIC0gMiwgeDogbnVtYmVyKHlhLCB5Yil9KTtcbiAgICB9IGVsc2UgaWYgKHhiIHx8IHliKSB7XG4gICAgICBzLnB1c2goXCJ0cmFuc2xhdGUoXCIgKyB4YiArIHB4Q29tbWEgKyB5YiArIHB4UGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJvdGF0ZShhLCBiLCBzLCBxKSB7XG4gICAgaWYgKGEgIT09IGIpIHtcbiAgICAgIGlmIChhIC0gYiA+IDE4MCkgYiArPSAzNjA7IGVsc2UgaWYgKGIgLSBhID4gMTgwKSBhICs9IDM2MDsgLy8gc2hvcnRlc3QgcGF0aFxuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIsIG51bGwsIGRlZ1BhcmVuKSAtIDIsIHg6IG51bWJlcihhLCBiKX0pO1xuICAgIH0gZWxzZSBpZiAoYikge1xuICAgICAgcy5wdXNoKHBvcChzKSArIFwicm90YXRlKFwiICsgYiArIGRlZ1BhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBza2V3WChhLCBiLCBzLCBxKSB7XG4gICAgaWYgKGEgIT09IGIpIHtcbiAgICAgIHEucHVzaCh7aTogcy5wdXNoKHBvcChzKSArIFwic2tld1goXCIsIG51bGwsIGRlZ1BhcmVuKSAtIDIsIHg6IG51bWJlcihhLCBiKX0pO1xuICAgIH0gZWxzZSBpZiAoYikge1xuICAgICAgcy5wdXNoKHBvcChzKSArIFwic2tld1goXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjYWxlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKHBvcChzKSArIFwic2NhbGUoXCIsIG51bGwsIFwiLFwiLCBudWxsLCBcIilcIik7XG4gICAgICBxLnB1c2goe2k6IGkgLSA0LCB4OiBudW1iZXIoeGEsIHhiKX0sIHtpOiBpIC0gMiwgeDogbnVtYmVyKHlhLCB5Yil9KTtcbiAgICB9IGVsc2UgaWYgKHhiICE9PSAxIHx8IHliICE9PSAxKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiArIHhiICsgXCIsXCIgKyB5YiArIFwiKVwiKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBzID0gW10sIC8vIHN0cmluZyBjb25zdGFudHMgYW5kIHBsYWNlaG9sZGVyc1xuICAgICAgICBxID0gW107IC8vIG51bWJlciBpbnRlcnBvbGF0b3JzXG4gICAgYSA9IHBhcnNlKGEpLCBiID0gcGFyc2UoYik7XG4gICAgdHJhbnNsYXRlKGEudHJhbnNsYXRlWCwgYS50cmFuc2xhdGVZLCBiLnRyYW5zbGF0ZVgsIGIudHJhbnNsYXRlWSwgcywgcSk7XG4gICAgcm90YXRlKGEucm90YXRlLCBiLnJvdGF0ZSwgcywgcSk7XG4gICAgc2tld1goYS5za2V3WCwgYi5za2V3WCwgcywgcSk7XG4gICAgc2NhbGUoYS5zY2FsZVgsIGEuc2NhbGVZLCBiLnNjYWxlWCwgYi5zY2FsZVksIHMsIHEpO1xuICAgIGEgPSBiID0gbnVsbDsgLy8gZ2NcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgdmFyIGkgPSAtMSwgbiA9IHEubGVuZ3RoLCBvO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgIHJldHVybiBzLmpvaW4oXCJcIik7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciBpbnRlcnBvbGF0ZVRyYW5zZm9ybUNzcyA9IGludGVycG9sYXRlVHJhbnNmb3JtKHBhcnNlQ3NzLCBcInB4LCBcIiwgXCJweClcIiwgXCJkZWcpXCIpO1xuZXhwb3J0IHZhciBpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2ZyA9IGludGVycG9sYXRlVHJhbnNmb3JtKHBhcnNlU3ZnLCBcIiwgXCIsIFwiKVwiLCBcIilcIik7XG4iLCAidmFyIGZyYW1lID0gMCwgLy8gaXMgYW4gYW5pbWF0aW9uIGZyYW1lIHBlbmRpbmc/XG4gICAgdGltZW91dCA9IDAsIC8vIGlzIGEgdGltZW91dCBwZW5kaW5nP1xuICAgIGludGVydmFsID0gMCwgLy8gYXJlIGFueSB0aW1lcnMgYWN0aXZlP1xuICAgIHBva2VEZWxheSA9IDEwMDAsIC8vIGhvdyBmcmVxdWVudGx5IHdlIGNoZWNrIGZvciBjbG9jayBza2V3XG4gICAgdGFza0hlYWQsXG4gICAgdGFza1RhaWwsXG4gICAgY2xvY2tMYXN0ID0gMCxcbiAgICBjbG9ja05vdyA9IDAsXG4gICAgY2xvY2tTa2V3ID0gMCxcbiAgICBjbG9jayA9IHR5cGVvZiBwZXJmb3JtYW5jZSA9PT0gXCJvYmplY3RcIiAmJiBwZXJmb3JtYW5jZS5ub3cgPyBwZXJmb3JtYW5jZSA6IERhdGUsXG4gICAgc2V0RnJhbWUgPSB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KSA6IGZ1bmN0aW9uKGYpIHsgc2V0VGltZW91dChmLCAxNyk7IH07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3coKSB7XG4gIHJldHVybiBjbG9ja05vdyB8fCAoc2V0RnJhbWUoY2xlYXJOb3cpLCBjbG9ja05vdyA9IGNsb2NrLm5vdygpICsgY2xvY2tTa2V3KTtcbn1cblxuZnVuY3Rpb24gY2xlYXJOb3coKSB7XG4gIGNsb2NrTm93ID0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRpbWVyKCkge1xuICB0aGlzLl9jYWxsID1cbiAgdGhpcy5fdGltZSA9XG4gIHRoaXMuX25leHQgPSBudWxsO1xufVxuXG5UaW1lci5wcm90b3R5cGUgPSB0aW1lci5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUaW1lcixcbiAgcmVzdGFydDogZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2FsbGJhY2sgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgdGltZSA9ICh0aW1lID09IG51bGwgPyBub3coKSA6ICt0aW1lKSArIChkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheSk7XG4gICAgaWYgKCF0aGlzLl9uZXh0ICYmIHRhc2tUYWlsICE9PSB0aGlzKSB7XG4gICAgICBpZiAodGFza1RhaWwpIHRhc2tUYWlsLl9uZXh0ID0gdGhpcztcbiAgICAgIGVsc2UgdGFza0hlYWQgPSB0aGlzO1xuICAgICAgdGFza1RhaWwgPSB0aGlzO1xuICAgIH1cbiAgICB0aGlzLl9jYWxsID0gY2FsbGJhY2s7XG4gICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgc2xlZXAoKTtcbiAgfSxcbiAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2NhbGwpIHtcbiAgICAgIHRoaXMuX2NhbGwgPSBudWxsO1xuICAgICAgdGhpcy5fdGltZSA9IEluZmluaXR5O1xuICAgICAgc2xlZXAoKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lcihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIHQucmVzdGFydChjYWxsYmFjaywgZGVsYXksIHRpbWUpO1xuICByZXR1cm4gdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVyRmx1c2goKSB7XG4gIG5vdygpOyAvLyBHZXQgdGhlIGN1cnJlbnQgdGltZSwgaWYgbm90IGFscmVhZHkgc2V0LlxuICArK2ZyYW1lOyAvLyBQcmV0ZW5kIHdlXHUyMDE5dmUgc2V0IGFuIGFsYXJtLCBpZiB3ZSBoYXZlblx1MjAxOXQgYWxyZWFkeS5cbiAgdmFyIHQgPSB0YXNrSGVhZCwgZTtcbiAgd2hpbGUgKHQpIHtcbiAgICBpZiAoKGUgPSBjbG9ja05vdyAtIHQuX3RpbWUpID49IDApIHQuX2NhbGwuY2FsbCh1bmRlZmluZWQsIGUpO1xuICAgIHQgPSB0Ll9uZXh0O1xuICB9XG4gIC0tZnJhbWU7XG59XG5cbmZ1bmN0aW9uIHdha2UoKSB7XG4gIGNsb2NrTm93ID0gKGNsb2NrTGFzdCA9IGNsb2NrLm5vdygpKSArIGNsb2NrU2tldztcbiAgZnJhbWUgPSB0aW1lb3V0ID0gMDtcbiAgdHJ5IHtcbiAgICB0aW1lckZsdXNoKCk7XG4gIH0gZmluYWxseSB7XG4gICAgZnJhbWUgPSAwO1xuICAgIG5hcCgpO1xuICAgIGNsb2NrTm93ID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwb2tlKCkge1xuICB2YXIgbm93ID0gY2xvY2subm93KCksIGRlbGF5ID0gbm93IC0gY2xvY2tMYXN0O1xuICBpZiAoZGVsYXkgPiBwb2tlRGVsYXkpIGNsb2NrU2tldyAtPSBkZWxheSwgY2xvY2tMYXN0ID0gbm93O1xufVxuXG5mdW5jdGlvbiBuYXAoKSB7XG4gIHZhciB0MCwgdDEgPSB0YXNrSGVhZCwgdDIsIHRpbWUgPSBJbmZpbml0eTtcbiAgd2hpbGUgKHQxKSB7XG4gICAgaWYgKHQxLl9jYWxsKSB7XG4gICAgICBpZiAodGltZSA+IHQxLl90aW1lKSB0aW1lID0gdDEuX3RpbWU7XG4gICAgICB0MCA9IHQxLCB0MSA9IHQxLl9uZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0MiA9IHQxLl9uZXh0LCB0MS5fbmV4dCA9IG51bGw7XG4gICAgICB0MSA9IHQwID8gdDAuX25leHQgPSB0MiA6IHRhc2tIZWFkID0gdDI7XG4gICAgfVxuICB9XG4gIHRhc2tUYWlsID0gdDA7XG4gIHNsZWVwKHRpbWUpO1xufVxuXG5mdW5jdGlvbiBzbGVlcCh0aW1lKSB7XG4gIGlmIChmcmFtZSkgcmV0dXJuOyAvLyBTb29uZXN0IGFsYXJtIGFscmVhZHkgc2V0LCBvciB3aWxsIGJlLlxuICBpZiAodGltZW91dCkgdGltZW91dCA9IGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgdmFyIGRlbGF5ID0gdGltZSAtIGNsb2NrTm93OyAvLyBTdHJpY3RseSBsZXNzIHRoYW4gaWYgd2UgcmVjb21wdXRlZCBjbG9ja05vdy5cbiAgaWYgKGRlbGF5ID4gMjQpIHtcbiAgICBpZiAodGltZSA8IEluZmluaXR5KSB0aW1lb3V0ID0gc2V0VGltZW91dCh3YWtlLCB0aW1lIC0gY2xvY2subm93KCkgLSBjbG9ja1NrZXcpO1xuICAgIGlmIChpbnRlcnZhbCkgaW50ZXJ2YWwgPSBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWludGVydmFsKSBjbG9ja0xhc3QgPSBjbG9jay5ub3coKSwgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChwb2tlLCBwb2tlRGVsYXkpO1xuICAgIGZyYW1lID0gMSwgc2V0RnJhbWUod2FrZSk7XG4gIH1cbn1cbiIsICJpbXBvcnQge1RpbWVyfSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIGRlbGF5ID0gZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXk7XG4gIHQucmVzdGFydChlbGFwc2VkID0+IHtcbiAgICB0LnN0b3AoKTtcbiAgICBjYWxsYmFjayhlbGFwc2VkICsgZGVsYXkpO1xuICB9LCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuIiwgImltcG9ydCB7ZGlzcGF0Y2h9IGZyb20gXCJkMy1kaXNwYXRjaFwiO1xuaW1wb3J0IHt0aW1lciwgdGltZW91dH0gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBlbXB0eU9uID0gZGlzcGF0Y2goXCJzdGFydFwiLCBcImVuZFwiLCBcImNhbmNlbFwiLCBcImludGVycnVwdFwiKTtcbnZhciBlbXB0eVR3ZWVuID0gW107XG5cbmV4cG9ydCB2YXIgQ1JFQVRFRCA9IDA7XG5leHBvcnQgdmFyIFNDSEVEVUxFRCA9IDE7XG5leHBvcnQgdmFyIFNUQVJUSU5HID0gMjtcbmV4cG9ydCB2YXIgU1RBUlRFRCA9IDM7XG5leHBvcnQgdmFyIFJVTk5JTkcgPSA0O1xuZXhwb3J0IHZhciBFTkRJTkcgPSA1O1xuZXhwb3J0IHZhciBFTkRFRCA9IDY7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUsIGlkLCBpbmRleCwgZ3JvdXAsIHRpbWluZykge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGVzKSBub2RlLl9fdHJhbnNpdGlvbiA9IHt9O1xuICBlbHNlIGlmIChpZCBpbiBzY2hlZHVsZXMpIHJldHVybjtcbiAgY3JlYXRlKG5vZGUsIGlkLCB7XG4gICAgbmFtZTogbmFtZSxcbiAgICBpbmRleDogaW5kZXgsIC8vIEZvciBjb250ZXh0IGR1cmluZyBjYWxsYmFjay5cbiAgICBncm91cDogZ3JvdXAsIC8vIEZvciBjb250ZXh0IGR1cmluZyBjYWxsYmFjay5cbiAgICBvbjogZW1wdHlPbixcbiAgICB0d2VlbjogZW1wdHlUd2VlbixcbiAgICB0aW1lOiB0aW1pbmcudGltZSxcbiAgICBkZWxheTogdGltaW5nLmRlbGF5LFxuICAgIGR1cmF0aW9uOiB0aW1pbmcuZHVyYXRpb24sXG4gICAgZWFzZTogdGltaW5nLmVhc2UsXG4gICAgdGltZXI6IG51bGwsXG4gICAgc3RhdGU6IENSRUFURURcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IGdldChub2RlLCBpZCk7XG4gIGlmIChzY2hlZHVsZS5zdGF0ZSA+IENSRUFURUQpIHRocm93IG5ldyBFcnJvcihcInRvbyBsYXRlOyBhbHJlYWR5IHNjaGVkdWxlZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IGdldChub2RlLCBpZCk7XG4gIGlmIChzY2hlZHVsZS5zdGF0ZSA+IFNUQVJURUQpIHRocm93IG5ldyBFcnJvcihcInRvbyBsYXRlOyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZSB8fCAhKHNjaGVkdWxlID0gc2NoZWR1bGVbaWRdKSkgdGhyb3cgbmV3IEVycm9yKFwidHJhbnNpdGlvbiBub3QgZm91bmRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlKG5vZGUsIGlkLCBzZWxmKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHR3ZWVuO1xuXG4gIC8vIEluaXRpYWxpemUgdGhlIHNlbGYgdGltZXIgd2hlbiB0aGUgdHJhbnNpdGlvbiBpcyBjcmVhdGVkLlxuICAvLyBOb3RlIHRoZSBhY3R1YWwgZGVsYXkgaXMgbm90IGtub3duIHVudGlsIHRoZSBmaXJzdCBjYWxsYmFjayFcbiAgc2NoZWR1bGVzW2lkXSA9IHNlbGY7XG4gIHNlbGYudGltZXIgPSB0aW1lcihzY2hlZHVsZSwgMCwgc2VsZi50aW1lKTtcblxuICBmdW5jdGlvbiBzY2hlZHVsZShlbGFwc2VkKSB7XG4gICAgc2VsZi5zdGF0ZSA9IFNDSEVEVUxFRDtcbiAgICBzZWxmLnRpbWVyLnJlc3RhcnQoc3RhcnQsIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG5cbiAgICAvLyBJZiB0aGUgZWxhcHNlZCBkZWxheSBpcyBsZXNzIHRoYW4gb3VyIGZpcnN0IHNsZWVwLCBzdGFydCBpbW1lZGlhdGVseS5cbiAgICBpZiAoc2VsZi5kZWxheSA8PSBlbGFwc2VkKSBzdGFydChlbGFwc2VkIC0gc2VsZi5kZWxheSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydChlbGFwc2VkKSB7XG4gICAgdmFyIGksIGosIG4sIG87XG5cbiAgICAvLyBJZiB0aGUgc3RhdGUgaXMgbm90IFNDSEVEVUxFRCwgdGhlbiB3ZSBwcmV2aW91c2x5IGVycm9yZWQgb24gc3RhcnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNDSEVEVUxFRCkgcmV0dXJuIHN0b3AoKTtcblxuICAgIGZvciAoaSBpbiBzY2hlZHVsZXMpIHtcbiAgICAgIG8gPSBzY2hlZHVsZXNbaV07XG4gICAgICBpZiAoby5uYW1lICE9PSBzZWxmLm5hbWUpIGNvbnRpbnVlO1xuXG4gICAgICAvLyBXaGlsZSB0aGlzIGVsZW1lbnQgYWxyZWFkeSBoYXMgYSBzdGFydGluZyB0cmFuc2l0aW9uIGR1cmluZyB0aGlzIGZyYW1lLFxuICAgICAgLy8gZGVmZXIgc3RhcnRpbmcgYW4gaW50ZXJydXB0aW5nIHRyYW5zaXRpb24gdW50aWwgdGhhdCB0cmFuc2l0aW9uIGhhcyBhXG4gICAgICAvLyBjaGFuY2UgdG8gdGljayAoYW5kIHBvc3NpYmx5IGVuZCk7IHNlZSBkMy9kMy10cmFuc2l0aW9uIzU0IVxuICAgICAgaWYgKG8uc3RhdGUgPT09IFNUQVJURUQpIHJldHVybiB0aW1lb3V0KHN0YXJ0KTtcblxuICAgICAgLy8gSW50ZXJydXB0IHRoZSBhY3RpdmUgdHJhbnNpdGlvbiwgaWYgYW55LlxuICAgICAgaWYgKG8uc3RhdGUgPT09IFJVTk5JTkcpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiaW50ZXJydXB0XCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuXG4gICAgICAvLyBDYW5jZWwgYW55IHByZS1lbXB0ZWQgdHJhbnNpdGlvbnMuXG4gICAgICBlbHNlIGlmICgraSA8IGlkKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImNhbmNlbFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZlciB0aGUgZmlyc3QgdGljayB0byBlbmQgb2YgdGhlIGN1cnJlbnQgZnJhbWU7IHNlZSBkMy9kMyMxNTc2LlxuICAgIC8vIE5vdGUgdGhlIHRyYW5zaXRpb24gbWF5IGJlIGNhbmNlbGVkIGFmdGVyIHN0YXJ0IGFuZCBiZWZvcmUgdGhlIGZpcnN0IHRpY2shXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgc2NoZWR1bGVkIGJlZm9yZSB0aGUgc3RhcnQgZXZlbnQ7IHNlZSBkMy9kMy10cmFuc2l0aW9uIzE2IVxuICAgIC8vIEFzc3VtaW5nIHRoaXMgaXMgc3VjY2Vzc2Z1bCwgc3Vic2VxdWVudCBjYWxsYmFja3MgZ28gc3RyYWlnaHQgdG8gdGljay5cbiAgICB0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHNlbGYuc3RhdGUgPT09IFNUQVJURUQpIHtcbiAgICAgICAgc2VsZi5zdGF0ZSA9IFJVTk5JTkc7XG4gICAgICAgIHNlbGYudGltZXIucmVzdGFydCh0aWNrLCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuICAgICAgICB0aWNrKGVsYXBzZWQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRGlzcGF0Y2ggdGhlIHN0YXJ0IGV2ZW50LlxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIGRvbmUgYmVmb3JlIHRoZSB0d2VlbiBhcmUgaW5pdGlhbGl6ZWQuXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJUSU5HO1xuICAgIHNlbGYub24uY2FsbChcInN0YXJ0XCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTVEFSVElORykgcmV0dXJuOyAvLyBpbnRlcnJ1cHRlZFxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVEVEO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgdHdlZW4sIGRlbGV0aW5nIG51bGwgdHdlZW4uXG4gICAgdHdlZW4gPSBuZXcgQXJyYXkobiA9IHNlbGYudHdlZW4ubGVuZ3RoKTtcbiAgICBmb3IgKGkgPSAwLCBqID0gLTE7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChvID0gc2VsZi50d2VlbltpXS52YWx1ZS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApKSB7XG4gICAgICAgIHR3ZWVuWysral0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICB0d2Vlbi5sZW5ndGggPSBqICsgMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpY2soZWxhcHNlZCkge1xuICAgIHZhciB0ID0gZWxhcHNlZCA8IHNlbGYuZHVyYXRpb24gPyBzZWxmLmVhc2UuY2FsbChudWxsLCBlbGFwc2VkIC8gc2VsZi5kdXJhdGlvbikgOiAoc2VsZi50aW1lci5yZXN0YXJ0KHN0b3ApLCBzZWxmLnN0YXRlID0gRU5ESU5HLCAxKSxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gdHdlZW4ubGVuZ3RoO1xuXG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIHR3ZWVuW2ldLmNhbGwobm9kZSwgdCk7XG4gICAgfVxuXG4gICAgLy8gRGlzcGF0Y2ggdGhlIGVuZCBldmVudC5cbiAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gRU5ESU5HKSB7XG4gICAgICBzZWxmLm9uLmNhbGwoXCJlbmRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgICBzdG9wKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICBzZWxmLnN0YXRlID0gRU5ERUQ7XG4gICAgc2VsZi50aW1lci5zdG9wKCk7XG4gICAgZGVsZXRlIHNjaGVkdWxlc1tpZF07XG4gICAgZm9yICh2YXIgaSBpbiBzY2hlZHVsZXMpIHJldHVybjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIGRlbGV0ZSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgfVxufVxuIiwgImltcG9ydCB7U1RBUlRJTkcsIEVORElORywgRU5ERUR9IGZyb20gXCIuL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICBzY2hlZHVsZSxcbiAgICAgIGFjdGl2ZSxcbiAgICAgIGVtcHR5ID0gdHJ1ZSxcbiAgICAgIGk7XG5cbiAgaWYgKCFzY2hlZHVsZXMpIHJldHVybjtcblxuICBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuXG4gIGZvciAoaSBpbiBzY2hlZHVsZXMpIHtcbiAgICBpZiAoKHNjaGVkdWxlID0gc2NoZWR1bGVzW2ldKS5uYW1lICE9PSBuYW1lKSB7IGVtcHR5ID0gZmFsc2U7IGNvbnRpbnVlOyB9XG4gICAgYWN0aXZlID0gc2NoZWR1bGUuc3RhdGUgPiBTVEFSVElORyAmJiBzY2hlZHVsZS5zdGF0ZSA8IEVORElORztcbiAgICBzY2hlZHVsZS5zdGF0ZSA9IEVOREVEO1xuICAgIHNjaGVkdWxlLnRpbWVyLnN0b3AoKTtcbiAgICBzY2hlZHVsZS5vbi5jYWxsKGFjdGl2ZSA/IFwiaW50ZXJydXB0XCIgOiBcImNhbmNlbFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzY2hlZHVsZS5pbmRleCwgc2NoZWR1bGUuZ3JvdXApO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gIH1cblxuICBpZiAoZW1wdHkpIGRlbGV0ZSBub2RlLl9fdHJhbnNpdGlvbjtcbn1cbiIsICJpbXBvcnQgaW50ZXJydXB0IGZyb20gXCIuLi9pbnRlcnJ1cHQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGludGVycnVwdCh0aGlzLCBuYW1lKTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gdHdlZW5SZW1vdmUoaWQsIG5hbWUpIHtcbiAgdmFyIHR3ZWVuMCwgdHdlZW4xO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9IHR3ZWVuMCA9IHR3ZWVuO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMSA9IHR3ZWVuMS5zbGljZSgpO1xuICAgICAgICAgIHR3ZWVuMS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdHdlZW5GdW5jdGlvbihpZCwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHR3ZWVuMCwgdHdlZW4xO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSAodHdlZW4wID0gdHdlZW4pLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciB0ID0ge25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0sIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjFbaV0gPSB0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaSA9PT0gbikgdHdlZW4xLnB1c2godCk7XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIG5hbWUgKz0gXCJcIjtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgdHdlZW4gPSBnZXQodGhpcy5ub2RlKCksIGlkKS50d2VlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuLmxlbmd0aCwgdDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKCh0ID0gdHdlZW5baV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHQudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbCA/IHR3ZWVuUmVtb3ZlIDogdHdlZW5GdW5jdGlvbikoaWQsIG5hbWUsIHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0d2VlblZhbHVlKHRyYW5zaXRpb24sIG5hbWUsIHZhbHVlKSB7XG4gIHZhciBpZCA9IHRyYW5zaXRpb24uX2lkO1xuXG4gIHRyYW5zaXRpb24uZWFjaChmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpO1xuICAgIChzY2hlZHVsZS52YWx1ZSB8fCAoc2NoZWR1bGUudmFsdWUgPSB7fSkpW25hbWVdID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gZ2V0KG5vZGUsIGlkKS52YWx1ZVtuYW1lXTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGVOdW1iZXIsIGludGVycG9sYXRlUmdiLCBpbnRlcnBvbGF0ZVN0cmluZ30gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGM7XG4gIHJldHVybiAodHlwZW9mIGIgPT09IFwibnVtYmVyXCIgPyBpbnRlcnBvbGF0ZU51bWJlclxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyBpbnRlcnBvbGF0ZVJnYlxuICAgICAgOiAoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgaW50ZXJwb2xhdGVSZ2IpXG4gICAgICA6IGludGVycG9sYXRlU3RyaW5nKShhLCBiKTtcbn1cbiIsICJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtU3ZnIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKSwgaSA9IGZ1bGxuYW1lID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHRoaXMuYXR0clR3ZWVuKG5hbWUsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKShmdWxsbmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcImF0dHIuXCIgKyBuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHZhbHVlID09IG51bGwgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKShmdWxsbmFtZSlcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKGZ1bGxuYW1lLCBpLCB2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgaS5jYWxsKHRoaXMsIHQpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlTlMoZnVsbG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgaS5jYWxsKHRoaXMsIHQpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuTlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlTlMoZnVsbG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW4obmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcImF0dHIuXCIgKyBuYW1lO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCAoZnVsbG5hbWUubG9jYWwgPyBhdHRyVHdlZW5OUyA6IGF0dHJUd2VlbikoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCAiaW1wb3J0IHtnZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGRlbGF5RnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9ICt2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkZWxheUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPSArdmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGRlbGF5RnVuY3Rpb25cbiAgICAgICAgICA6IGRlbGF5Q29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmRlbGF5O1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGR1cmF0aW9uRnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGR1cmF0aW9uQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkdXJhdGlvbkZ1bmN0aW9uXG4gICAgICAgICAgOiBkdXJhdGlvbkNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kdXJhdGlvbjtcbn1cbiIsICJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBlYXNlQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaChlYXNlQ29uc3RhbnQoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZWFzZTtcbn1cbiIsICJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZVZhcnlpbmcoaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHR5cGVvZiB2ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMuZWFjaChlYXNlVmFyeWluZyh0aGlzLl9pZCwgdmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge21hdGNoZXJ9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsICJpbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRyYW5zaXRpb24pIHtcbiAgaWYgKHRyYW5zaXRpb24uX2lkICE9PSB0aGlzLl9pZCkgdGhyb3cgbmV3IEVycm9yO1xuXG4gIGZvciAodmFyIGdyb3VwczAgPSB0aGlzLl9ncm91cHMsIGdyb3VwczEgPSB0cmFuc2l0aW9uLl9ncm91cHMsIG0wID0gZ3JvdXBzMC5sZW5ndGgsIG0xID0gZ3JvdXBzMS5sZW5ndGgsIG0gPSBNYXRoLm1pbihtMCwgbTEpLCBtZXJnZXMgPSBuZXcgQXJyYXkobTApLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwMCA9IGdyb3VwczBbal0sIGdyb3VwMSA9IGdyb3VwczFbal0sIG4gPSBncm91cDAubGVuZ3RoLCBtZXJnZSA9IG1lcmdlc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXAwW2ldIHx8IGdyb3VwMVtpXSkge1xuICAgICAgICBtZXJnZVtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IGogPCBtMDsgKytqKSB7XG4gICAgbWVyZ2VzW2pdID0gZ3JvdXBzMFtqXTtcbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsICJpbXBvcnQge2dldCwgc2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBzdGFydChuYW1lKSB7XG4gIHJldHVybiAobmFtZSArIFwiXCIpLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykuZXZlcnkoZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4gIXQgfHwgdCA9PT0gXCJzdGFydFwiO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG9uMCwgb24xLCBzaXQgPSBzdGFydChuYW1lKSA/IGluaXQgOiBzZXQ7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzaXQodGhpcywgaWQpLFxuICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmIChvbiAhPT0gb24wKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKG5hbWUsIGxpc3RlbmVyKTtcblxuICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDJcbiAgICAgID8gZ2V0KHRoaXMubm9kZSgpLCBpZCkub24ub24obmFtZSlcbiAgICAgIDogdGhpcy5lYWNoKG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSk7XG59XG4iLCAiZnVuY3Rpb24gcmVtb3ZlRnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLl9fdHJhbnNpdGlvbikgaWYgKCtpICE9PSBpZCkgcmV0dXJuO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9uKFwiZW5kLnJlbW92ZVwiLCByZW1vdmVGdW5jdGlvbih0aGlzLl9pZCkpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0b3J9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkID0gdGhpcy5faWQ7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICAgIHNjaGVkdWxlKHN1Ymdyb3VwW2ldLCBuYW1lLCBpZCwgaSwgc3ViZ3JvdXAsIGdldChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdG9yQWxsfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgZm9yICh2YXIgY2hpbGRyZW4gPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCksIGNoaWxkLCBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkKSwgayA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGsgPCBsOyArK2spIHtcbiAgICAgICAgICBpZiAoY2hpbGQgPSBjaGlsZHJlbltrXSkge1xuICAgICAgICAgICAgc2NoZWR1bGUoY2hpbGQsIG5hbWUsIGlkLCBrLCBjaGlsZHJlbiwgaW5oZXJpdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKGNoaWxkcmVuKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHBhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG52YXIgU2VsZWN0aW9uID0gc2VsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2dyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiaW1wb3J0IHtpbnRlcnBvbGF0ZVRyYW5zZm9ybUNzcyBhcyBpbnRlcnBvbGF0ZVRyYW5zZm9ybX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge3N0eWxlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCBpbnRlcnBvbGF0ZSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZU51bGwobmFtZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpLFxuICAgICAgICBzdHJpbmcxID0gKHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSksIHN0eWxlKHRoaXMsIG5hbWUpKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgc3RyaW5nMTAgPSBzdHJpbmcxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpLFxuICAgICAgICB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSxcbiAgICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSBzdHJpbmcxID0gdmFsdWUxID0gKHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSksIHN0eWxlKHRoaXMsIG5hbWUpKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlTWF5YmVSZW1vdmUoaWQsIG5hbWUpIHtcbiAgdmFyIG9uMCwgb24xLCBsaXN0ZW5lcjAsIGtleSA9IFwic3R5bGUuXCIgKyBuYW1lLCBldmVudCA9IFwiZW5kLlwiICsga2V5LCByZW1vdmU7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICBvbiA9IHNjaGVkdWxlLm9uLFxuICAgICAgICBsaXN0ZW5lciA9IHNjaGVkdWxlLnZhbHVlW2tleV0gPT0gbnVsbCA/IHJlbW92ZSB8fCAocmVtb3ZlID0gc3R5bGVSZW1vdmUobmFtZSkpIDogdW5kZWZpbmVkO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmIChvbiAhPT0gb24wIHx8IGxpc3RlbmVyMCAhPT0gbGlzdGVuZXIpIChvbjEgPSAob24wID0gb24pLmNvcHkoKSkub24oZXZlbnQsIGxpc3RlbmVyMCA9IGxpc3RlbmVyKTtcblxuICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGkgPSAobmFtZSArPSBcIlwiKSA9PT0gXCJ0cmFuc2Zvcm1cIiA/IGludGVycG9sYXRlVHJhbnNmb3JtIDogaW50ZXJwb2xhdGU7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVOdWxsKG5hbWUsIGkpKVxuICAgICAgLm9uKFwiZW5kLnN0eWxlLlwiICsgbmFtZSwgc3R5bGVSZW1vdmUobmFtZSkpXG4gICAgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlRnVuY3Rpb24obmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcInN0eWxlLlwiICsgbmFtZSwgdmFsdWUpKSlcbiAgICAgIC5lYWNoKHN0eWxlTWF5YmVSZW1vdmUodGhpcy5faWQsIG5hbWUpKVxuICAgIDogdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVDb25zdGFudChuYW1lLCBpLCB2YWx1ZSksIHByaW9yaXR5KVxuICAgICAgLm9uKFwiZW5kLnN0eWxlLlwiICsgbmFtZSwgbnVsbCk7XG59XG4iLCAiZnVuY3Rpb24gc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgaS5jYWxsKHRoaXMsIHQpLCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciB0LCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdCA9IChpMCA9IGkpICYmIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpO1xuICAgIHJldHVybiB0O1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIga2V5ID0gXCJzdHlsZS5cIiArIChuYW1lICs9IFwiXCIpO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpO1xufVxuIiwgImltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlMSA9IHZhbHVlKHRoaXMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTEgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnR3ZWVuKFwidGV4dFwiLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyB0ZXh0RnVuY3Rpb24odHdlZW5WYWx1ZSh0aGlzLCBcInRleHRcIiwgdmFsdWUpKVxuICAgICAgOiB0ZXh0Q29uc3RhbnQodmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSArIFwiXCIpKTtcbn1cbiIsICJmdW5jdGlvbiB0ZXh0SW50ZXJwb2xhdGUoaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSBpLmNhbGwodGhpcywgdCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRUd2Vlbih2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIHRleHRJbnRlcnBvbGF0ZShpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGtleSA9IFwidGV4dFwiO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgdGV4dFR3ZWVuKHZhbHVlKSk7XG59XG4iLCAiaW1wb3J0IHtUcmFuc2l0aW9uLCBuZXdJZH0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkMCA9IHRoaXMuX2lkLFxuICAgICAgaWQxID0gbmV3SWQoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICB2YXIgaW5oZXJpdCA9IGdldChub2RlLCBpZDApO1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZDEsIGksIGdyb3VwLCB7XG4gICAgICAgICAgdGltZTogaW5oZXJpdC50aW1lICsgaW5oZXJpdC5kZWxheSArIGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgICAgZHVyYXRpb246IGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgICAgZWFzZTogaW5oZXJpdC5lYXNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkMSk7XG59XG4iLCAiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgb24wLCBvbjEsIHRoYXQgPSB0aGlzLCBpZCA9IHRoYXQuX2lkLCBzaXplID0gdGhhdC5zaXplKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgY2FuY2VsID0ge3ZhbHVlOiByZWplY3R9LFxuICAgICAgICBlbmQgPSB7dmFsdWU6IGZ1bmN0aW9uKCkgeyBpZiAoLS1zaXplID09PSAwKSByZXNvbHZlKCk7IH19O1xuXG4gICAgdGhhdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgICAgaWYgKG9uICE9PSBvbjApIHtcbiAgICAgICAgb24xID0gKG9uMCA9IG9uKS5jb3B5KCk7XG4gICAgICAgIG9uMS5fLmNhbmNlbC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmludGVycnVwdC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmVuZC5wdXNoKGVuZCk7XG4gICAgICB9XG5cbiAgICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIHNlbGVjdGlvbiB3YXMgZW1wdHksIHJlc29sdmUgZW5kIGltbWVkaWF0ZWx5XG4gICAgaWYgKHNpemUgPT09IDApIHJlc29sdmUoKTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHIgZnJvbSBcIi4vYXR0ci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0clR3ZWVuIGZyb20gXCIuL2F0dHJUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZGVsYXkgZnJvbSBcIi4vZGVsYXkuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2R1cmF0aW9uIGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlIGZyb20gXCIuL2Vhc2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nIGZyb20gXCIuL2Vhc2VWYXJ5aW5nLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fb24gZnJvbSBcIi4vb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3JlbW92ZSBmcm9tIFwiLi9yZW1vdmUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3NlbGVjdEFsbCBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3NlbGVjdGlvbiBmcm9tIFwiLi9zZWxlY3Rpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZVR3ZWVuIGZyb20gXCIuL3N0eWxlVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHQgZnJvbSBcIi4vdGV4dC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dFR3ZWVuIGZyb20gXCIuL3RleHRUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90d2VlbiBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZW5kIGZyb20gXCIuL2VuZC5qc1wiO1xuXG52YXIgaWQgPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gVHJhbnNpdGlvbihncm91cHMsIHBhcmVudHMsIG5hbWUsIGlkKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG4gIHRoaXMuX25hbWUgPSBuYW1lO1xuICB0aGlzLl9pZCA9IGlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2l0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHNlbGVjdGlvbigpLnRyYW5zaXRpb24obmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZXdJZCgpIHtcbiAgcmV0dXJuICsraWQ7XG59XG5cbnZhciBzZWxlY3Rpb25fcHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZTtcblxuVHJhbnNpdGlvbi5wcm90b3R5cGUgPSB0cmFuc2l0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zaXRpb24sXG4gIHNlbGVjdDogdHJhbnNpdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogdHJhbnNpdGlvbl9zZWxlY3RBbGwsXG4gIHNlbGVjdENoaWxkOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkLFxuICBzZWxlY3RDaGlsZHJlbjogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiB0cmFuc2l0aW9uX2ZpbHRlcixcbiAgbWVyZ2U6IHRyYW5zaXRpb25fbWVyZ2UsXG4gIHNlbGVjdGlvbjogdHJhbnNpdGlvbl9zZWxlY3Rpb24sXG4gIHRyYW5zaXRpb246IHRyYW5zaXRpb25fdHJhbnNpdGlvbixcbiAgY2FsbDogc2VsZWN0aW9uX3Byb3RvdHlwZS5jYWxsLFxuICBub2Rlczogc2VsZWN0aW9uX3Byb3RvdHlwZS5ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5ub2RlLFxuICBzaXplOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNpemUsXG4gIGVtcHR5OiBzZWxlY3Rpb25fcHJvdG90eXBlLmVtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fcHJvdG90eXBlLmVhY2gsXG4gIG9uOiB0cmFuc2l0aW9uX29uLFxuICBhdHRyOiB0cmFuc2l0aW9uX2F0dHIsXG4gIGF0dHJUd2VlbjogdHJhbnNpdGlvbl9hdHRyVHdlZW4sXG4gIHN0eWxlOiB0cmFuc2l0aW9uX3N0eWxlLFxuICBzdHlsZVR3ZWVuOiB0cmFuc2l0aW9uX3N0eWxlVHdlZW4sXG4gIHRleHQ6IHRyYW5zaXRpb25fdGV4dCxcbiAgdGV4dFR3ZWVuOiB0cmFuc2l0aW9uX3RleHRUd2VlbixcbiAgcmVtb3ZlOiB0cmFuc2l0aW9uX3JlbW92ZSxcbiAgdHdlZW46IHRyYW5zaXRpb25fdHdlZW4sXG4gIGRlbGF5OiB0cmFuc2l0aW9uX2RlbGF5LFxuICBkdXJhdGlvbjogdHJhbnNpdGlvbl9kdXJhdGlvbixcbiAgZWFzZTogdHJhbnNpdGlvbl9lYXNlLFxuICBlYXNlVmFyeWluZzogdHJhbnNpdGlvbl9lYXNlVmFyeWluZyxcbiAgZW5kOiB0cmFuc2l0aW9uX2VuZCxcbiAgW1N5bWJvbC5pdGVyYXRvcl06IHNlbGVjdGlvbl9wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXVxufTtcbiIsICJleHBvcnQgZnVuY3Rpb24gY3ViaWNJbih0KSB7XG4gIHJldHVybiB0ICogdCAqIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gIHJldHVybiAtLXQgKiB0ICogdCArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY0luT3V0KHQpIHtcbiAgcmV0dXJuICgodCAqPSAyKSA8PSAxID8gdCAqIHQgKiB0IDogKHQgLT0gMikgKiB0ICogdCArIDIpIC8gMjtcbn1cbiIsICJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlIGZyb20gXCIuLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge2Vhc2VDdWJpY0luT3V0fSBmcm9tIFwiZDMtZWFzZVwiO1xuaW1wb3J0IHtub3d9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZGVmYXVsdFRpbWluZyA9IHtcbiAgdGltZTogbnVsbCwgLy8gU2V0IG9uIHVzZS5cbiAgZGVsYXk6IDAsXG4gIGR1cmF0aW9uOiAyNTAsXG4gIGVhc2U6IGVhc2VDdWJpY0luT3V0XG59O1xuXG5mdW5jdGlvbiBpbmhlcml0KG5vZGUsIGlkKSB7XG4gIHZhciB0aW1pbmc7XG4gIHdoaWxlICghKHRpbWluZyA9IG5vZGUuX190cmFuc2l0aW9uKSB8fCAhKHRpbWluZyA9IHRpbWluZ1tpZF0pKSB7XG4gICAgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdHJhbnNpdGlvbiAke2lkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRpbWluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaWQsXG4gICAgICB0aW1pbmc7XG5cbiAgaWYgKG5hbWUgaW5zdGFuY2VvZiBUcmFuc2l0aW9uKSB7XG4gICAgaWQgPSBuYW1lLl9pZCwgbmFtZSA9IG5hbWUuX25hbWU7XG4gIH0gZWxzZSB7XG4gICAgaWQgPSBuZXdJZCgpLCAodGltaW5nID0gZGVmYXVsdFRpbWluZykudGltZSA9IG5vdygpLCBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQsIGksIGdyb3VwLCB0aW1pbmcgfHwgaW5oZXJpdChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHNlbGVjdGlvbl9pbnRlcnJ1cHQgZnJvbSBcIi4vaW50ZXJydXB0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3RyYW5zaXRpb24gZnJvbSBcIi4vdHJhbnNpdGlvbi5qc1wiO1xuXG5zZWxlY3Rpb24ucHJvdG90eXBlLmludGVycnVwdCA9IHNlbGVjdGlvbl9pbnRlcnJ1cHQ7XG5zZWxlY3Rpb24ucHJvdG90eXBlLnRyYW5zaXRpb24gPSBzZWxlY3Rpb25fdHJhbnNpdGlvbjtcbiIsICJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7ZHJhZ0Rpc2FibGUsIGRyYWdFbmFibGV9IGZyb20gXCJkMy1kcmFnXCI7XG5pbXBvcnQge2ludGVycG9sYXRlfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7cG9pbnRlciwgc2VsZWN0fSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge2ludGVycnVwdH0gZnJvbSBcImQzLXRyYW5zaXRpb25cIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IEJydXNoRXZlbnQgZnJvbSBcIi4vZXZlbnQuanNcIjtcbmltcG9ydCBub2V2ZW50LCB7bm9wcm9wYWdhdGlvbn0gZnJvbSBcIi4vbm9ldmVudC5qc1wiO1xuXG52YXIgTU9ERV9EUkFHID0ge25hbWU6IFwiZHJhZ1wifSxcbiAgICBNT0RFX1NQQUNFID0ge25hbWU6IFwic3BhY2VcIn0sXG4gICAgTU9ERV9IQU5ETEUgPSB7bmFtZTogXCJoYW5kbGVcIn0sXG4gICAgTU9ERV9DRU5URVIgPSB7bmFtZTogXCJjZW50ZXJcIn07XG5cbmNvbnN0IHthYnMsIG1heCwgbWlufSA9IE1hdGg7XG5cbmZ1bmN0aW9uIG51bWJlcjEoZSkge1xuICByZXR1cm4gWytlWzBdLCArZVsxXV07XG59XG5cbmZ1bmN0aW9uIG51bWJlcjIoZSkge1xuICByZXR1cm4gW251bWJlcjEoZVswXSksIG51bWJlcjEoZVsxXSldO1xufVxuXG52YXIgWCA9IHtcbiAgbmFtZTogXCJ4XCIsXG4gIGhhbmRsZXM6IFtcIndcIiwgXCJlXCJdLm1hcCh0eXBlKSxcbiAgaW5wdXQ6IGZ1bmN0aW9uKHgsIGUpIHsgcmV0dXJuIHggPT0gbnVsbCA/IG51bGwgOiBbWyt4WzBdLCBlWzBdWzFdXSwgWyt4WzFdLCBlWzFdWzFdXV07IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ICYmIFt4eVswXVswXSwgeHlbMV1bMF1dOyB9XG59O1xuXG52YXIgWSA9IHtcbiAgbmFtZTogXCJ5XCIsXG4gIGhhbmRsZXM6IFtcIm5cIiwgXCJzXCJdLm1hcCh0eXBlKSxcbiAgaW5wdXQ6IGZ1bmN0aW9uKHksIGUpIHsgcmV0dXJuIHkgPT0gbnVsbCA/IG51bGwgOiBbW2VbMF1bMF0sICt5WzBdXSwgW2VbMV1bMF0sICt5WzFdXV07IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ICYmIFt4eVswXVsxXSwgeHlbMV1bMV1dOyB9XG59O1xuXG52YXIgWFkgPSB7XG4gIG5hbWU6IFwieHlcIixcbiAgaGFuZGxlczogW1wiblwiLCBcIndcIiwgXCJlXCIsIFwic1wiLCBcIm53XCIsIFwibmVcIiwgXCJzd1wiLCBcInNlXCJdLm1hcCh0eXBlKSxcbiAgaW5wdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eSA9PSBudWxsID8gbnVsbCA6IG51bWJlcjIoeHkpOyB9LFxuICBvdXRwdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eTsgfVxufTtcblxudmFyIGN1cnNvcnMgPSB7XG4gIG92ZXJsYXk6IFwiY3Jvc3NoYWlyXCIsXG4gIHNlbGVjdGlvbjogXCJtb3ZlXCIsXG4gIG46IFwibnMtcmVzaXplXCIsXG4gIGU6IFwiZXctcmVzaXplXCIsXG4gIHM6IFwibnMtcmVzaXplXCIsXG4gIHc6IFwiZXctcmVzaXplXCIsXG4gIG53OiBcIm53c2UtcmVzaXplXCIsXG4gIG5lOiBcIm5lc3ctcmVzaXplXCIsXG4gIHNlOiBcIm53c2UtcmVzaXplXCIsXG4gIHN3OiBcIm5lc3ctcmVzaXplXCJcbn07XG5cbnZhciBmbGlwWCA9IHtcbiAgZTogXCJ3XCIsXG4gIHc6IFwiZVwiLFxuICBudzogXCJuZVwiLFxuICBuZTogXCJud1wiLFxuICBzZTogXCJzd1wiLFxuICBzdzogXCJzZVwiXG59O1xuXG52YXIgZmxpcFkgPSB7XG4gIG46IFwic1wiLFxuICBzOiBcIm5cIixcbiAgbnc6IFwic3dcIixcbiAgbmU6IFwic2VcIixcbiAgc2U6IFwibmVcIixcbiAgc3c6IFwibndcIlxufTtcblxudmFyIHNpZ25zWCA9IHtcbiAgb3ZlcmxheTogKzEsXG4gIHNlbGVjdGlvbjogKzEsXG4gIG46IG51bGwsXG4gIGU6ICsxLFxuICBzOiBudWxsLFxuICB3OiAtMSxcbiAgbnc6IC0xLFxuICBuZTogKzEsXG4gIHNlOiArMSxcbiAgc3c6IC0xXG59O1xuXG52YXIgc2lnbnNZID0ge1xuICBvdmVybGF5OiArMSxcbiAgc2VsZWN0aW9uOiArMSxcbiAgbjogLTEsXG4gIGU6IG51bGwsXG4gIHM6ICsxLFxuICB3OiBudWxsLFxuICBudzogLTEsXG4gIG5lOiAtMSxcbiAgc2U6ICsxLFxuICBzdzogKzFcbn07XG5cbmZ1bmN0aW9uIHR5cGUodCkge1xuICByZXR1cm4ge3R5cGU6IHR9O1xufVxuXG4vLyBJZ25vcmUgcmlnaHQtY2xpY2ssIHNpbmNlIHRoYXQgc2hvdWxkIG9wZW4gdGhlIGNvbnRleHQgbWVudS5cbmZ1bmN0aW9uIGRlZmF1bHRGaWx0ZXIoZXZlbnQpIHtcbiAgcmV0dXJuICFldmVudC5jdHJsS2V5ICYmICFldmVudC5idXR0b247XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRFeHRlbnQoKSB7XG4gIHZhciBzdmcgPSB0aGlzLm93bmVyU1ZHRWxlbWVudCB8fCB0aGlzO1xuICBpZiAoc3ZnLmhhc0F0dHJpYnV0ZShcInZpZXdCb3hcIikpIHtcbiAgICBzdmcgPSBzdmcudmlld0JveC5iYXNlVmFsO1xuICAgIHJldHVybiBbW3N2Zy54LCBzdmcueV0sIFtzdmcueCArIHN2Zy53aWR0aCwgc3ZnLnkgKyBzdmcuaGVpZ2h0XV07XG4gIH1cbiAgcmV0dXJuIFtbMCwgMF0sIFtzdmcud2lkdGguYmFzZVZhbC52YWx1ZSwgc3ZnLmhlaWdodC5iYXNlVmFsLnZhbHVlXV07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRUb3VjaGFibGUoKSB7XG4gIHJldHVybiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgfHwgKFwib250b3VjaHN0YXJ0XCIgaW4gdGhpcyk7XG59XG5cbi8vIExpa2UgZDMubG9jYWwsIGJ1dCB3aXRoIHRoZSBuYW1lIFx1MjAxQ19fYnJ1c2hcdTIwMUQgcmF0aGVyIHRoYW4gYXV0by1nZW5lcmF0ZWQuXG5mdW5jdGlvbiBsb2NhbChub2RlKSB7XG4gIHdoaWxlICghbm9kZS5fX2JydXNoKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuO1xuICByZXR1cm4gbm9kZS5fX2JydXNoO1xufVxuXG5mdW5jdGlvbiBlbXB0eShleHRlbnQpIHtcbiAgcmV0dXJuIGV4dGVudFswXVswXSA9PT0gZXh0ZW50WzFdWzBdXG4gICAgICB8fCBleHRlbnRbMF1bMV0gPT09IGV4dGVudFsxXVsxXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoU2VsZWN0aW9uKG5vZGUpIHtcbiAgdmFyIHN0YXRlID0gbm9kZS5fX2JydXNoO1xuICByZXR1cm4gc3RhdGUgPyBzdGF0ZS5kaW0ub3V0cHV0KHN0YXRlLnNlbGVjdGlvbikgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hYKCkge1xuICByZXR1cm4gYnJ1c2goWCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFkoKSB7XG4gIHJldHVybiBicnVzaChZKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBicnVzaChYWSk7XG59XG5cbmZ1bmN0aW9uIGJydXNoKGRpbSkge1xuICB2YXIgZXh0ZW50ID0gZGVmYXVsdEV4dGVudCxcbiAgICAgIGZpbHRlciA9IGRlZmF1bHRGaWx0ZXIsXG4gICAgICB0b3VjaGFibGUgPSBkZWZhdWx0VG91Y2hhYmxlLFxuICAgICAga2V5cyA9IHRydWUsXG4gICAgICBsaXN0ZW5lcnMgPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiYnJ1c2hcIiwgXCJlbmRcIiksXG4gICAgICBoYW5kbGVTaXplID0gNixcbiAgICAgIHRvdWNoZW5kaW5nO1xuXG4gIGZ1bmN0aW9uIGJydXNoKGdyb3VwKSB7XG4gICAgdmFyIG92ZXJsYXkgPSBncm91cFxuICAgICAgICAucHJvcGVydHkoXCJfX2JydXNoXCIsIGluaXRpYWxpemUpXG4gICAgICAuc2VsZWN0QWxsKFwiLm92ZXJsYXlcIilcbiAgICAgIC5kYXRhKFt0eXBlKFwib3ZlcmxheVwiKV0pO1xuXG4gICAgb3ZlcmxheS5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcIm92ZXJsYXlcIilcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLm92ZXJsYXkpXG4gICAgICAubWVyZ2Uob3ZlcmxheSlcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGV4dGVudCA9IGxvY2FsKHRoaXMpLmV4dGVudDtcbiAgICAgICAgICBzZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGV4dGVudFswXVswXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIGV4dGVudFswXVsxXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBleHRlbnRbMV1bMF0gLSBleHRlbnRbMF1bMF0pXG4gICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGV4dGVudFsxXVsxXSAtIGV4dGVudFswXVsxXSk7XG4gICAgICAgIH0pO1xuXG4gICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvblwiKVxuICAgICAgLmRhdGEoW3R5cGUoXCJzZWxlY3Rpb25cIildKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic2VsZWN0aW9uXCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMuc2VsZWN0aW9uKVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCIjNzc3XCIpXG4gICAgICAgIC5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIDAuMylcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCIjZmZmXCIpXG4gICAgICAgIC5hdHRyKFwic2hhcGUtcmVuZGVyaW5nXCIsIFwiY3Jpc3BFZGdlc1wiKTtcblxuICAgIHZhciBoYW5kbGUgPSBncm91cC5zZWxlY3RBbGwoXCIuaGFuZGxlXCIpXG4gICAgICAuZGF0YShkaW0uaGFuZGxlcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlOyB9KTtcblxuICAgIGhhbmRsZS5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICBoYW5kbGUuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJoYW5kbGUgaGFuZGxlLS1cIiArIGQudHlwZTsgfSlcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gY3Vyc29yc1tkLnR5cGVdOyB9KTtcblxuICAgIGdyb3VwXG4gICAgICAgIC5lYWNoKHJlZHJhdylcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpXG4gICAgICAgIC5vbihcIm1vdXNlZG93bi5icnVzaFwiLCBzdGFydGVkKVxuICAgICAgLmZpbHRlcih0b3VjaGFibGUpXG4gICAgICAgIC5vbihcInRvdWNoc3RhcnQuYnJ1c2hcIiwgc3RhcnRlZClcbiAgICAgICAgLm9uKFwidG91Y2htb3ZlLmJydXNoXCIsIHRvdWNobW92ZWQpXG4gICAgICAgIC5vbihcInRvdWNoZW5kLmJydXNoIHRvdWNoY2FuY2VsLmJydXNoXCIsIHRvdWNoZW5kZWQpXG4gICAgICAgIC5zdHlsZShcInRvdWNoLWFjdGlvblwiLCBcIm5vbmVcIilcbiAgICAgICAgLnN0eWxlKFwiLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yXCIsIFwicmdiYSgwLDAsMCwwKVwiKTtcbiAgfVxuXG4gIGJydXNoLm1vdmUgPSBmdW5jdGlvbihncm91cCwgc2VsZWN0aW9uLCBldmVudCkge1xuICAgIGlmIChncm91cC50d2Vlbikge1xuICAgICAgZ3JvdXBcbiAgICAgICAgICAub24oXCJzdGFydC5icnVzaFwiLCBmdW5jdGlvbihldmVudCkgeyBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykuYmVmb3Jlc3RhcnQoKS5zdGFydChldmVudCk7IH0pXG4gICAgICAgICAgLm9uKFwiaW50ZXJydXB0LmJydXNoIGVuZC5icnVzaFwiLCBmdW5jdGlvbihldmVudCkgeyBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykuZW5kKGV2ZW50KTsgfSlcbiAgICAgICAgICAudHdlZW4oXCJicnVzaFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHRoYXQuX19icnVzaCxcbiAgICAgICAgICAgICAgICBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjAgPSBzdGF0ZS5zZWxlY3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMSA9IGRpbS5pbnB1dCh0eXBlb2Ygc2VsZWN0aW9uID09PSBcImZ1bmN0aW9uXCIgPyBzZWxlY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHNlbGVjdGlvbiwgc3RhdGUuZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBpID0gaW50ZXJwb2xhdGUoc2VsZWN0aW9uMCwgc2VsZWN0aW9uMSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHR3ZWVuKHQpIHtcbiAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gdCA9PT0gMSAmJiBzZWxlY3Rpb24xID09PSBudWxsID8gbnVsbCA6IGkodCk7XG4gICAgICAgICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICAgICAgICBlbWl0LmJydXNoKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb24wICE9PSBudWxsICYmIHNlbGVjdGlvbjEgIT09IG51bGwgPyB0d2VlbiA6IHR3ZWVuKDEpO1xuICAgICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBncm91cFxuICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB0aGF0Ll9fYnJ1c2gsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMSA9IGRpbS5pbnB1dCh0eXBlb2Ygc2VsZWN0aW9uID09PSBcImZ1bmN0aW9uXCIgPyBzZWxlY3Rpb24uYXBwbHkodGhhdCwgYXJncykgOiBzZWxlY3Rpb24sIHN0YXRlLmV4dGVudCksXG4gICAgICAgICAgICAgICAgZW1pdCA9IGVtaXR0ZXIodGhhdCwgYXJncykuYmVmb3Jlc3RhcnQoKTtcblxuICAgICAgICAgICAgaW50ZXJydXB0KHRoYXQpO1xuICAgICAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gc2VsZWN0aW9uMSA9PT0gbnVsbCA/IG51bGwgOiBzZWxlY3Rpb24xO1xuICAgICAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgICAgICBlbWl0LnN0YXJ0KGV2ZW50KS5icnVzaChldmVudCkuZW5kKGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgYnJ1c2guY2xlYXIgPSBmdW5jdGlvbihncm91cCwgZXZlbnQpIHtcbiAgICBicnVzaC5tb3ZlKGdyb3VwLCBudWxsLCBldmVudCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZhciBncm91cCA9IHNlbGVjdCh0aGlzKSxcbiAgICAgICAgc2VsZWN0aW9uID0gbG9jYWwodGhpcykuc2VsZWN0aW9uO1xuXG4gICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvblwiKVxuICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInhcIiwgc2VsZWN0aW9uWzBdWzBdKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBzZWxlY3Rpb25bMF1bMV0pXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBzZWxlY3Rpb25bMV1bMF0gLSBzZWxlY3Rpb25bMF1bMF0pXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgc2VsZWN0aW9uWzFdWzFdIC0gc2VsZWN0aW9uWzBdWzFdKTtcblxuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLmhhbmRsZVwiKVxuICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlW2QudHlwZS5sZW5ndGggLSAxXSA9PT0gXCJlXCIgPyBzZWxlY3Rpb25bMV1bMF0gLSBoYW5kbGVTaXplIC8gMiA6IHNlbGVjdGlvblswXVswXSAtIGhhbmRsZVNpemUgLyAyOyB9KVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGVbMF0gPT09IFwic1wiID8gc2VsZWN0aW9uWzFdWzFdIC0gaGFuZGxlU2l6ZSAvIDIgOiBzZWxlY3Rpb25bMF1bMV0gLSBoYW5kbGVTaXplIC8gMjsgfSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZSA9PT0gXCJuXCIgfHwgZC50eXBlID09PSBcInNcIiA/IHNlbGVjdGlvblsxXVswXSAtIHNlbGVjdGlvblswXVswXSArIGhhbmRsZVNpemUgOiBoYW5kbGVTaXplOyB9KVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZSA9PT0gXCJlXCIgfHwgZC50eXBlID09PSBcIndcIiA/IHNlbGVjdGlvblsxXVsxXSAtIHNlbGVjdGlvblswXVsxXSArIGhhbmRsZVNpemUgOiBoYW5kbGVTaXplOyB9KTtcbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcIi5zZWxlY3Rpb24sLmhhbmRsZVwiKVxuICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgXCJub25lXCIpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pIHtcbiAgICB2YXIgZW1pdCA9IHRoYXQuX19icnVzaC5lbWl0dGVyO1xuICAgIHJldHVybiBlbWl0ICYmICghY2xlYW4gfHwgIWVtaXQuY2xlYW4pID8gZW1pdCA6IG5ldyBFbWl0dGVyKHRoYXQsIGFyZ3MsIGNsZWFuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pIHtcbiAgICB0aGlzLnRoYXQgPSB0aGF0O1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5zdGF0ZSA9IHRoYXQuX19icnVzaDtcbiAgICB0aGlzLmFjdGl2ZSA9IDA7XG4gICAgdGhpcy5jbGVhbiA9IGNsZWFuO1xuICB9XG5cbiAgRW1pdHRlci5wcm90b3R5cGUgPSB7XG4gICAgYmVmb3Jlc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCsrdGhpcy5hY3RpdmUgPT09IDEpIHRoaXMuc3RhdGUuZW1pdHRlciA9IHRoaXMsIHRoaXMuc3RhcnRpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzdGFydDogZnVuY3Rpb24oZXZlbnQsIG1vZGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXJ0aW5nKSB0aGlzLnN0YXJ0aW5nID0gZmFsc2UsIHRoaXMuZW1pdChcInN0YXJ0XCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIGVsc2UgdGhpcy5lbWl0KFwiYnJ1c2hcIiwgZXZlbnQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBicnVzaDogZnVuY3Rpb24oZXZlbnQsIG1vZGUpIHtcbiAgICAgIHRoaXMuZW1pdChcImJydXNoXCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZW5kOiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgaWYgKC0tdGhpcy5hY3RpdmUgPT09IDApIGRlbGV0ZSB0aGlzLnN0YXRlLmVtaXR0ZXIsIHRoaXMuZW1pdChcImVuZFwiLCBldmVudCwgbW9kZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGVtaXQ6IGZ1bmN0aW9uKHR5cGUsIGV2ZW50LCBtb2RlKSB7XG4gICAgICB2YXIgZCA9IHNlbGVjdCh0aGlzLnRoYXQpLmRhdHVtKCk7XG4gICAgICBsaXN0ZW5lcnMuY2FsbChcbiAgICAgICAgdHlwZSxcbiAgICAgICAgdGhpcy50aGF0LFxuICAgICAgICBuZXcgQnJ1c2hFdmVudCh0eXBlLCB7XG4gICAgICAgICAgc291cmNlRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgIHRhcmdldDogYnJ1c2gsXG4gICAgICAgICAgc2VsZWN0aW9uOiBkaW0ub3V0cHV0KHRoaXMuc3RhdGUuc2VsZWN0aW9uKSxcbiAgICAgICAgICBtb2RlLFxuICAgICAgICAgIGRpc3BhdGNoOiBsaXN0ZW5lcnNcbiAgICAgICAgfSksXG4gICAgICAgIGRcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHN0YXJ0ZWQoZXZlbnQpIHtcbiAgICBpZiAodG91Y2hlbmRpbmcgJiYgIWV2ZW50LnRvdWNoZXMpIHJldHVybjtcbiAgICBpZiAoIWZpbHRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm47XG5cbiAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgIHR5cGUgPSBldmVudC50YXJnZXQuX19kYXRhX18udHlwZSxcbiAgICAgICAgbW9kZSA9IChrZXlzICYmIGV2ZW50Lm1ldGFLZXkgPyB0eXBlID0gXCJvdmVybGF5XCIgOiB0eXBlKSA9PT0gXCJzZWxlY3Rpb25cIiA/IE1PREVfRFJBRyA6IChrZXlzICYmIGV2ZW50LmFsdEtleSA/IE1PREVfQ0VOVEVSIDogTU9ERV9IQU5ETEUpLFxuICAgICAgICBzaWduWCA9IGRpbSA9PT0gWSA/IG51bGwgOiBzaWduc1hbdHlwZV0sXG4gICAgICAgIHNpZ25ZID0gZGltID09PSBYID8gbnVsbCA6IHNpZ25zWVt0eXBlXSxcbiAgICAgICAgc3RhdGUgPSBsb2NhbCh0aGF0KSxcbiAgICAgICAgZXh0ZW50ID0gc3RhdGUuZXh0ZW50LFxuICAgICAgICBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb24sXG4gICAgICAgIFcgPSBleHRlbnRbMF1bMF0sIHcwLCB3MSxcbiAgICAgICAgTiA9IGV4dGVudFswXVsxXSwgbjAsIG4xLFxuICAgICAgICBFID0gZXh0ZW50WzFdWzBdLCBlMCwgZTEsXG4gICAgICAgIFMgPSBleHRlbnRbMV1bMV0sIHMwLCBzMSxcbiAgICAgICAgZHggPSAwLFxuICAgICAgICBkeSA9IDAsXG4gICAgICAgIG1vdmluZyxcbiAgICAgICAgc2hpZnRpbmcgPSBzaWduWCAmJiBzaWduWSAmJiBrZXlzICYmIGV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICBsb2NrWCxcbiAgICAgICAgbG9ja1ksXG4gICAgICAgIHBvaW50cyA9IEFycmF5LmZyb20oZXZlbnQudG91Y2hlcyB8fCBbZXZlbnRdLCB0ID0+IHtcbiAgICAgICAgICBjb25zdCBpID0gdC5pZGVudGlmaWVyO1xuICAgICAgICAgIHQgPSBwb2ludGVyKHQsIHRoYXQpO1xuICAgICAgICAgIHQucG9pbnQwID0gdC5zbGljZSgpO1xuICAgICAgICAgIHQuaWRlbnRpZmllciA9IGk7XG4gICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH0pO1xuXG4gICAgaW50ZXJydXB0KHRoYXQpO1xuICAgIHZhciBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmd1bWVudHMsIHRydWUpLmJlZm9yZXN0YXJ0KCk7XG5cbiAgICBpZiAodHlwZSA9PT0gXCJvdmVybGF5XCIpIHtcbiAgICAgIGlmIChzZWxlY3Rpb24pIG1vdmluZyA9IHRydWU7XG4gICAgICBjb25zdCBwdHMgPSBbcG9pbnRzWzBdLCBwb2ludHNbMV0gfHwgcG9pbnRzWzBdXTtcbiAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IHNlbGVjdGlvbiA9IFtbXG4gICAgICAgICAgdzAgPSBkaW0gPT09IFkgPyBXIDogbWluKHB0c1swXVswXSwgcHRzWzFdWzBdKSxcbiAgICAgICAgICBuMCA9IGRpbSA9PT0gWCA/IE4gOiBtaW4ocHRzWzBdWzFdLCBwdHNbMV1bMV0pXG4gICAgICAgIF0sIFtcbiAgICAgICAgICBlMCA9IGRpbSA9PT0gWSA/IEUgOiBtYXgocHRzWzBdWzBdLCBwdHNbMV1bMF0pLFxuICAgICAgICAgIHMwID0gZGltID09PSBYID8gUyA6IG1heChwdHNbMF1bMV0sIHB0c1sxXVsxXSlcbiAgICAgICAgXV07XG4gICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IDEpIG1vdmUoZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3MCA9IHNlbGVjdGlvblswXVswXTtcbiAgICAgIG4wID0gc2VsZWN0aW9uWzBdWzFdO1xuICAgICAgZTAgPSBzZWxlY3Rpb25bMV1bMF07XG4gICAgICBzMCA9IHNlbGVjdGlvblsxXVsxXTtcbiAgICB9XG5cbiAgICB3MSA9IHcwO1xuICAgIG4xID0gbjA7XG4gICAgZTEgPSBlMDtcbiAgICBzMSA9IHMwO1xuXG4gICAgdmFyIGdyb3VwID0gc2VsZWN0KHRoYXQpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpO1xuXG4gICAgdmFyIG92ZXJsYXkgPSBncm91cC5zZWxlY3RBbGwoXCIub3ZlcmxheVwiKVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGVdKTtcblxuICAgIGlmIChldmVudC50b3VjaGVzKSB7XG4gICAgICBlbWl0Lm1vdmVkID0gbW92ZWQ7XG4gICAgICBlbWl0LmVuZGVkID0gZW5kZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gc2VsZWN0KGV2ZW50LnZpZXcpXG4gICAgICAgICAgLm9uKFwibW91c2Vtb3ZlLmJydXNoXCIsIG1vdmVkLCB0cnVlKVxuICAgICAgICAgIC5vbihcIm1vdXNldXAuYnJ1c2hcIiwgZW5kZWQsIHRydWUpO1xuICAgICAgaWYgKGtleXMpIHZpZXdcbiAgICAgICAgICAub24oXCJrZXlkb3duLmJydXNoXCIsIGtleWRvd25lZCwgdHJ1ZSlcbiAgICAgICAgICAub24oXCJrZXl1cC5icnVzaFwiLCBrZXl1cHBlZCwgdHJ1ZSlcblxuICAgICAgZHJhZ0Rpc2FibGUoZXZlbnQudmlldyk7XG4gICAgfVxuXG4gICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgZW1pdC5zdGFydChldmVudCwgbW9kZS5uYW1lKTtcblxuICAgIGZ1bmN0aW9uIG1vdmVkKGV2ZW50KSB7XG4gICAgICBmb3IgKGNvbnN0IHAgb2YgZXZlbnQuY2hhbmdlZFRvdWNoZXMgfHwgW2V2ZW50XSkge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgcG9pbnRzKVxuICAgICAgICAgIGlmIChkLmlkZW50aWZpZXIgPT09IHAuaWRlbnRpZmllcikgZC5jdXIgPSBwb2ludGVyKHAsIHRoYXQpO1xuICAgICAgfVxuICAgICAgaWYgKHNoaWZ0aW5nICYmICFsb2NrWCAmJiAhbG9ja1kgJiYgcG9pbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBvaW50c1swXTtcbiAgICAgICAgaWYgKGFicyhwb2ludC5jdXJbMF0gLSBwb2ludFswXSkgPiBhYnMocG9pbnQuY3VyWzFdIC0gcG9pbnRbMV0pKVxuICAgICAgICAgIGxvY2tZID0gdHJ1ZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxvY2tYID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgcG9pbnQgb2YgcG9pbnRzKVxuICAgICAgICBpZiAocG9pbnQuY3VyKSBwb2ludFswXSA9IHBvaW50LmN1clswXSwgcG9pbnRbMV0gPSBwb2ludC5jdXJbMV07XG4gICAgICBtb3ZpbmcgPSB0cnVlO1xuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgICBtb3ZlKGV2ZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb3ZlKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludCA9IHBvaW50c1swXSwgcG9pbnQwID0gcG9pbnQucG9pbnQwO1xuICAgICAgdmFyIHQ7XG5cbiAgICAgIGR4ID0gcG9pbnRbMF0gLSBwb2ludDBbMF07XG4gICAgICBkeSA9IHBvaW50WzFdIC0gcG9pbnQwWzFdO1xuXG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBNT0RFX1NQQUNFOlxuICAgICAgICBjYXNlIE1PREVfRFJBRzoge1xuICAgICAgICAgIGlmIChzaWduWCkgZHggPSBtYXgoVyAtIHcwLCBtaW4oRSAtIGUwLCBkeCkpLCB3MSA9IHcwICsgZHgsIGUxID0gZTAgKyBkeDtcbiAgICAgICAgICBpZiAoc2lnblkpIGR5ID0gbWF4KE4gLSBuMCwgbWluKFMgLSBzMCwgZHkpKSwgbjEgPSBuMCArIGR5LCBzMSA9IHMwICsgZHk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBNT0RFX0hBTkRMRToge1xuICAgICAgICAgIGlmIChwb2ludHNbMV0pIHtcbiAgICAgICAgICAgIGlmIChzaWduWCkgdzEgPSBtYXgoVywgbWluKEUsIHBvaW50c1swXVswXSkpLCBlMSA9IG1heChXLCBtaW4oRSwgcG9pbnRzWzFdWzBdKSksIHNpZ25YID0gMTtcbiAgICAgICAgICAgIGlmIChzaWduWSkgbjEgPSBtYXgoTiwgbWluKFMsIHBvaW50c1swXVsxXSkpLCBzMSA9IG1heChOLCBtaW4oUywgcG9pbnRzWzFdWzFdKSksIHNpZ25ZID0gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZHggPSBtYXgoVyAtIHcwLCBtaW4oRSAtIHcwLCBkeCkpLCB3MSA9IHcwICsgZHgsIGUxID0gZTA7XG4gICAgICAgICAgICBlbHNlIGlmIChzaWduWCA+IDApIGR4ID0gbWF4KFcgLSBlMCwgbWluKEUgLSBlMCwgZHgpKSwgdzEgPSB3MCwgZTEgPSBlMCArIGR4O1xuICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgZHkgPSBtYXgoTiAtIG4wLCBtaW4oUyAtIG4wLCBkeSkpLCBuMSA9IG4wICsgZHksIHMxID0gczA7XG4gICAgICAgICAgICBlbHNlIGlmIChzaWduWSA+IDApIGR5ID0gbWF4KE4gLSBzMCwgbWluKFMgLSBzMCwgZHkpKSwgbjEgPSBuMCwgczEgPSBzMCArIGR5O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE1PREVfQ0VOVEVSOiB7XG4gICAgICAgICAgaWYgKHNpZ25YKSB3MSA9IG1heChXLCBtaW4oRSwgdzAgLSBkeCAqIHNpZ25YKSksIGUxID0gbWF4KFcsIG1pbihFLCBlMCArIGR4ICogc2lnblgpKTtcbiAgICAgICAgICBpZiAoc2lnblkpIG4xID0gbWF4KE4sIG1pbihTLCBuMCAtIGR5ICogc2lnblkpKSwgczEgPSBtYXgoTiwgbWluKFMsIHMwICsgZHkgKiBzaWduWSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlMSA8IHcxKSB7XG4gICAgICAgIHNpZ25YICo9IC0xO1xuICAgICAgICB0ID0gdzAsIHcwID0gZTAsIGUwID0gdDtcbiAgICAgICAgdCA9IHcxLCB3MSA9IGUxLCBlMSA9IHQ7XG4gICAgICAgIGlmICh0eXBlIGluIGZsaXBYKSBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlID0gZmxpcFhbdHlwZV1dKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHMxIDwgbjEpIHtcbiAgICAgICAgc2lnblkgKj0gLTE7XG4gICAgICAgIHQgPSBuMCwgbjAgPSBzMCwgczAgPSB0O1xuICAgICAgICB0ID0gbjEsIG4xID0gczEsIHMxID0gdDtcbiAgICAgICAgaWYgKHR5cGUgaW4gZmxpcFkpIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGUgPSBmbGlwWVt0eXBlXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUuc2VsZWN0aW9uKSBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb247IC8vIE1heSBiZSBzZXQgYnkgYnJ1c2gubW92ZSFcbiAgICAgIGlmIChsb2NrWCkgdzEgPSBzZWxlY3Rpb25bMF1bMF0sIGUxID0gc2VsZWN0aW9uWzFdWzBdO1xuICAgICAgaWYgKGxvY2tZKSBuMSA9IHNlbGVjdGlvblswXVsxXSwgczEgPSBzZWxlY3Rpb25bMV1bMV07XG5cbiAgICAgIGlmIChzZWxlY3Rpb25bMF1bMF0gIT09IHcxXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzBdWzFdICE9PSBuMVxuICAgICAgICAgIHx8IHNlbGVjdGlvblsxXVswXSAhPT0gZTFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMV1bMV0gIT09IHMxKSB7XG4gICAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IFtbdzEsIG4xXSwgW2UxLCBzMV1dO1xuICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgZW1pdC5icnVzaChldmVudCwgbW9kZS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmRlZChldmVudCkge1xuICAgICAgbm9wcm9wYWdhdGlvbihldmVudCk7XG4gICAgICBpZiAoZXZlbnQudG91Y2hlcykge1xuICAgICAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgaWYgKHRvdWNoZW5kaW5nKSBjbGVhclRpbWVvdXQodG91Y2hlbmRpbmcpO1xuICAgICAgICB0b3VjaGVuZGluZyA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRvdWNoZW5kaW5nID0gbnVsbDsgfSwgNTAwKTsgLy8gR2hvc3QgY2xpY2tzIGFyZSBkZWxheWVkIVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhZ0VuYWJsZShldmVudC52aWV3LCBtb3ZpbmcpO1xuICAgICAgICB2aWV3Lm9uKFwia2V5ZG93bi5icnVzaCBrZXl1cC5icnVzaCBtb3VzZW1vdmUuYnJ1c2ggbW91c2V1cC5icnVzaFwiLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGdyb3VwLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKTtcbiAgICAgIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLm92ZXJsYXkpO1xuICAgICAgaWYgKHN0YXRlLnNlbGVjdGlvbikgc2VsZWN0aW9uID0gc3RhdGUuc2VsZWN0aW9uOyAvLyBNYXkgYmUgc2V0IGJ5IGJydXNoLm1vdmUgKG9uIHN0YXJ0KSFcbiAgICAgIGlmIChlbXB0eShzZWxlY3Rpb24pKSBzdGF0ZS5zZWxlY3Rpb24gPSBudWxsLCByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgIGVtaXQuZW5kKGV2ZW50LCBtb2RlLm5hbWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleWRvd25lZChldmVudCkge1xuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTY6IHsgLy8gU0hJRlRcbiAgICAgICAgICBzaGlmdGluZyA9IHNpZ25YICYmIHNpZ25ZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMTg6IHsgLy8gQUxUXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfSEFORExFKSB7XG4gICAgICAgICAgICBpZiAoc2lnblgpIGUwID0gZTEgLSBkeCAqIHNpZ25YLCB3MCA9IHcxICsgZHggKiBzaWduWDtcbiAgICAgICAgICAgIGlmIChzaWduWSkgczAgPSBzMSAtIGR5ICogc2lnblksIG4wID0gbjEgKyBkeSAqIHNpZ25ZO1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfQ0VOVEVSO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMzI6IHsgLy8gU1BBQ0U7IHRha2VzIHByaW9yaXR5IG92ZXIgQUxUXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfSEFORExFIHx8IG1vZGUgPT09IE1PREVfQ0VOVEVSKSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxIC0gZHg7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MSAtIGR4O1xuICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgczAgPSBzMSAtIGR5OyBlbHNlIGlmIChzaWduWSA+IDApIG4wID0gbjEgLSBkeTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX1NQQUNFO1xuICAgICAgICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMuc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICB9XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXl1cHBlZChldmVudCkge1xuICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMTY6IHsgLy8gU0hJRlRcbiAgICAgICAgICBpZiAoc2hpZnRpbmcpIHtcbiAgICAgICAgICAgIGxvY2tYID0gbG9ja1kgPSBzaGlmdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMTg6IHsgLy8gQUxUXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfQ0VOVEVSKSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxOyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzE7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxOyBlbHNlIGlmIChzaWduWSA+IDApIG4wID0gbjE7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9IQU5ETEU7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAzMjogeyAvLyBTUEFDRVxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX1NQQUNFKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgIGlmIChzaWduWCkgZTAgPSBlMSAtIGR4ICogc2lnblgsIHcwID0gdzEgKyBkeCAqIHNpZ25YO1xuICAgICAgICAgICAgICBpZiAoc2lnblkpIHMwID0gczEgLSBkeSAqIHNpZ25ZLCBuMCA9IG4xICsgZHkgKiBzaWduWTtcbiAgICAgICAgICAgICAgbW9kZSA9IE1PREVfQ0VOVEVSO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZTAgPSBlMTsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxO1xuICAgICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxOyBlbHNlIGlmIChzaWduWSA+IDApIG4wID0gbjE7XG4gICAgICAgICAgICAgIG1vZGUgPSBNT0RFX0hBTkRMRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGVdKTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICB9XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaG1vdmVkKGV2ZW50KSB7XG4gICAgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLm1vdmVkKGV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNoZW5kZWQoZXZlbnQpIHtcbiAgICBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykuZW5kZWQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLl9fYnJ1c2ggfHwge3NlbGVjdGlvbjogbnVsbH07XG4gICAgc3RhdGUuZXh0ZW50ID0gbnVtYmVyMihleHRlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgc3RhdGUuZGltID0gZGltO1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIGJydXNoLmV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChleHRlbnQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KG51bWJlcjIoXykpLCBicnVzaCkgOiBleHRlbnQ7XG4gIH07XG5cbiAgYnJ1c2guZmlsdGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGZpbHRlciA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgYnJ1c2gpIDogZmlsdGVyO1xuICB9O1xuXG4gIGJydXNoLnRvdWNoYWJsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0b3VjaGFibGUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIGJydXNoKSA6IHRvdWNoYWJsZTtcbiAgfTtcblxuICBicnVzaC5oYW5kbGVTaXplID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGhhbmRsZVNpemUgPSArXywgYnJ1c2gpIDogaGFuZGxlU2l6ZTtcbiAgfTtcblxuICBicnVzaC5rZXlNb2RpZmllcnMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoa2V5cyA9ICEhXywgYnJ1c2gpIDoga2V5cztcbiAgfTtcblxuICBicnVzaC5vbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IGxpc3RlbmVycy5vbi5hcHBseShsaXN0ZW5lcnMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHZhbHVlID09PSBsaXN0ZW5lcnMgPyBicnVzaCA6IHZhbHVlO1xuICB9O1xuXG4gIHJldHVybiBicnVzaDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBNYXRoLmFicyh4ID0gTWF0aC5yb3VuZCh4KSkgPj0gMWUyMVxuICAgICAgPyB4LnRvTG9jYWxlU3RyaW5nKFwiZW5cIikucmVwbGFjZSgvLC9nLCBcIlwiKVxuICAgICAgOiB4LnRvU3RyaW5nKDEwKTtcbn1cblxuLy8gQ29tcHV0ZXMgdGhlIGRlY2ltYWwgY29lZmZpY2llbnQgYW5kIGV4cG9uZW50IG9mIHRoZSBzcGVjaWZpZWQgbnVtYmVyIHggd2l0aFxuLy8gc2lnbmlmaWNhbnQgZGlnaXRzIHAsIHdoZXJlIHggaXMgcG9zaXRpdmUgYW5kIHAgaXMgaW4gWzEsIDIxXSBvciB1bmRlZmluZWQuXG4vLyBGb3IgZXhhbXBsZSwgZm9ybWF0RGVjaW1hbFBhcnRzKDEuMjMpIHJldHVybnMgW1wiMTIzXCIsIDBdLlxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERlY2ltYWxQYXJ0cyh4LCBwKSB7XG4gIGlmICghaXNGaW5pdGUoeCkgfHwgeCA9PT0gMCkgcmV0dXJuIG51bGw7IC8vIE5hTiwgXHUwMEIxSW5maW5pdHksIFx1MDBCMTBcbiAgdmFyIGkgPSAoeCA9IHAgPyB4LnRvRXhwb25lbnRpYWwocCAtIDEpIDogeC50b0V4cG9uZW50aWFsKCkpLmluZGV4T2YoXCJlXCIpLCBjb2VmZmljaWVudCA9IHguc2xpY2UoMCwgaSk7XG5cbiAgLy8gVGhlIHN0cmluZyByZXR1cm5lZCBieSB0b0V4cG9uZW50aWFsIGVpdGhlciBoYXMgdGhlIGZvcm0gXFxkXFwuXFxkK2VbLStdXFxkK1xuICAvLyAoZS5nLiwgMS4yZSszKSBvciB0aGUgZm9ybSBcXGRlWy0rXVxcZCsgKGUuZy4sIDFlKzMpLlxuICByZXR1cm4gW1xuICAgIGNvZWZmaWNpZW50Lmxlbmd0aCA+IDEgPyBjb2VmZmljaWVudFswXSArIGNvZWZmaWNpZW50LnNsaWNlKDIpIDogY29lZmZpY2llbnQsXG4gICAgK3guc2xpY2UoaSArIDEpXG4gIF07XG59XG4iLCAiaW1wb3J0IHtmb3JtYXREZWNpbWFsUGFydHN9IGZyb20gXCIuL2Zvcm1hdERlY2ltYWwuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4geCA9IGZvcm1hdERlY2ltYWxQYXJ0cyhNYXRoLmFicyh4KSksIHggPyB4WzFdIDogTmFOO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGdyb3VwaW5nLCB0aG91c2FuZHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCB3aWR0aCkge1xuICAgIHZhciBpID0gdmFsdWUubGVuZ3RoLFxuICAgICAgICB0ID0gW10sXG4gICAgICAgIGogPSAwLFxuICAgICAgICBnID0gZ3JvdXBpbmdbMF0sXG4gICAgICAgIGxlbmd0aCA9IDA7XG5cbiAgICB3aGlsZSAoaSA+IDAgJiYgZyA+IDApIHtcbiAgICAgIGlmIChsZW5ndGggKyBnICsgMSA+IHdpZHRoKSBnID0gTWF0aC5tYXgoMSwgd2lkdGggLSBsZW5ndGgpO1xuICAgICAgdC5wdXNoKHZhbHVlLnN1YnN0cmluZyhpIC09IGcsIGkgKyBnKSk7XG4gICAgICBpZiAoKGxlbmd0aCArPSBnICsgMSkgPiB3aWR0aCkgYnJlYWs7XG4gICAgICBnID0gZ3JvdXBpbmdbaiA9IChqICsgMSkgJSBncm91cGluZy5sZW5ndGhdO1xuICAgIH1cblxuICAgIHJldHVybiB0LnJldmVyc2UoKS5qb2luKHRob3VzYW5kcyk7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obnVtZXJhbHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1swLTldL2csIGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBudW1lcmFsc1sraV07XG4gICAgfSk7XG4gIH07XG59XG4iLCAiLy8gW1tmaWxsXWFsaWduXVtzaWduXVtzeW1ib2xdWzBdW3dpZHRoXVssXVsucHJlY2lzaW9uXVt+XVt0eXBlXVxudmFyIHJlID0gL14oPzooLik/KFs8Pj1eXSkpPyhbK1xcLSggXSk/KFskI10pPygwKT8oXFxkKyk/KCwpPyhcXC5cXGQrKT8ofik/KFthLXolXSk/JC9pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKSB7XG4gIGlmICghKG1hdGNoID0gcmUuZXhlYyhzcGVjaWZpZXIpKSkgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBmb3JtYXQ6IFwiICsgc3BlY2lmaWVyKTtcbiAgdmFyIG1hdGNoO1xuICByZXR1cm4gbmV3IEZvcm1hdFNwZWNpZmllcih7XG4gICAgZmlsbDogbWF0Y2hbMV0sXG4gICAgYWxpZ246IG1hdGNoWzJdLFxuICAgIHNpZ246IG1hdGNoWzNdLFxuICAgIHN5bWJvbDogbWF0Y2hbNF0sXG4gICAgemVybzogbWF0Y2hbNV0sXG4gICAgd2lkdGg6IG1hdGNoWzZdLFxuICAgIGNvbW1hOiBtYXRjaFs3XSxcbiAgICBwcmVjaXNpb246IG1hdGNoWzhdICYmIG1hdGNoWzhdLnNsaWNlKDEpLFxuICAgIHRyaW06IG1hdGNoWzldLFxuICAgIHR5cGU6IG1hdGNoWzEwXVxuICB9KTtcbn1cblxuZm9ybWF0U3BlY2lmaWVyLnByb3RvdHlwZSA9IEZvcm1hdFNwZWNpZmllci5wcm90b3R5cGU7IC8vIGluc3RhbmNlb2ZcblxuZXhwb3J0IGZ1bmN0aW9uIEZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIpIHtcbiAgdGhpcy5maWxsID0gc3BlY2lmaWVyLmZpbGwgPT09IHVuZGVmaW5lZCA/IFwiIFwiIDogc3BlY2lmaWVyLmZpbGwgKyBcIlwiO1xuICB0aGlzLmFsaWduID0gc3BlY2lmaWVyLmFsaWduID09PSB1bmRlZmluZWQgPyBcIj5cIiA6IHNwZWNpZmllci5hbGlnbiArIFwiXCI7XG4gIHRoaXMuc2lnbiA9IHNwZWNpZmllci5zaWduID09PSB1bmRlZmluZWQgPyBcIi1cIiA6IHNwZWNpZmllci5zaWduICsgXCJcIjtcbiAgdGhpcy5zeW1ib2wgPSBzcGVjaWZpZXIuc3ltYm9sID09PSB1bmRlZmluZWQgPyBcIlwiIDogc3BlY2lmaWVyLnN5bWJvbCArIFwiXCI7XG4gIHRoaXMuemVybyA9ICEhc3BlY2lmaWVyLnplcm87XG4gIHRoaXMud2lkdGggPSBzcGVjaWZpZXIud2lkdGggPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6ICtzcGVjaWZpZXIud2lkdGg7XG4gIHRoaXMuY29tbWEgPSAhIXNwZWNpZmllci5jb21tYTtcbiAgdGhpcy5wcmVjaXNpb24gPSBzcGVjaWZpZXIucHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiArc3BlY2lmaWVyLnByZWNpc2lvbjtcbiAgdGhpcy50cmltID0gISFzcGVjaWZpZXIudHJpbTtcbiAgdGhpcy50eXBlID0gc3BlY2lmaWVyLnR5cGUgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBzcGVjaWZpZXIudHlwZSArIFwiXCI7XG59XG5cbkZvcm1hdFNwZWNpZmllci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZmlsbFxuICAgICAgKyB0aGlzLmFsaWduXG4gICAgICArIHRoaXMuc2lnblxuICAgICAgKyB0aGlzLnN5bWJvbFxuICAgICAgKyAodGhpcy56ZXJvID8gXCIwXCIgOiBcIlwiKVxuICAgICAgKyAodGhpcy53aWR0aCA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IE1hdGgubWF4KDEsIHRoaXMud2lkdGggfCAwKSlcbiAgICAgICsgKHRoaXMuY29tbWEgPyBcIixcIiA6IFwiXCIpXG4gICAgICArICh0aGlzLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IFwiLlwiICsgTWF0aC5tYXgoMCwgdGhpcy5wcmVjaXNpb24gfCAwKSlcbiAgICAgICsgKHRoaXMudHJpbSA/IFwiflwiIDogXCJcIilcbiAgICAgICsgdGhpcy50eXBlO1xufTtcbiIsICIvLyBUcmltcyBpbnNpZ25pZmljYW50IHplcm9zLCBlLmcuLCByZXBsYWNlcyAxLjIwMDBrIHdpdGggMS4yay5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHMpIHtcbiAgb3V0OiBmb3IgKHZhciBuID0gcy5sZW5ndGgsIGkgPSAxLCBpMCA9IC0xLCBpMTsgaSA8IG47ICsraSkge1xuICAgIHN3aXRjaCAoc1tpXSkge1xuICAgICAgY2FzZSBcIi5cIjogaTAgPSBpMSA9IGk7IGJyZWFrO1xuICAgICAgY2FzZSBcIjBcIjogaWYgKGkwID09PSAwKSBpMCA9IGk7IGkxID0gaTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBpZiAoIStzW2ldKSBicmVhayBvdXQ7IGlmIChpMCA+IDApIGkwID0gMDsgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBpMCA+IDAgPyBzLnNsaWNlKDAsIGkwKSArIHMuc2xpY2UoaTEgKyAxKSA6IHM7XG59XG4iLCAiaW1wb3J0IHtmb3JtYXREZWNpbWFsUGFydHN9IGZyb20gXCIuL2Zvcm1hdERlY2ltYWwuanNcIjtcblxuZXhwb3J0IHZhciBwcmVmaXhFeHBvbmVudDtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCwgcCkge1xuICB2YXIgZCA9IGZvcm1hdERlY2ltYWxQYXJ0cyh4LCBwKTtcbiAgaWYgKCFkKSByZXR1cm4gcHJlZml4RXhwb25lbnQgPSB1bmRlZmluZWQsIHgudG9QcmVjaXNpb24ocCk7XG4gIHZhciBjb2VmZmljaWVudCA9IGRbMF0sXG4gICAgICBleHBvbmVudCA9IGRbMV0sXG4gICAgICBpID0gZXhwb25lbnQgLSAocHJlZml4RXhwb25lbnQgPSBNYXRoLm1heCgtOCwgTWF0aC5taW4oOCwgTWF0aC5mbG9vcihleHBvbmVudCAvIDMpKSkgKiAzKSArIDEsXG4gICAgICBuID0gY29lZmZpY2llbnQubGVuZ3RoO1xuICByZXR1cm4gaSA9PT0gbiA/IGNvZWZmaWNpZW50XG4gICAgICA6IGkgPiBuID8gY29lZmZpY2llbnQgKyBuZXcgQXJyYXkoaSAtIG4gKyAxKS5qb2luKFwiMFwiKVxuICAgICAgOiBpID4gMCA/IGNvZWZmaWNpZW50LnNsaWNlKDAsIGkpICsgXCIuXCIgKyBjb2VmZmljaWVudC5zbGljZShpKVxuICAgICAgOiBcIjAuXCIgKyBuZXcgQXJyYXkoMSAtIGkpLmpvaW4oXCIwXCIpICsgZm9ybWF0RGVjaW1hbFBhcnRzKHgsIE1hdGgubWF4KDAsIHAgKyBpIC0gMSkpWzBdOyAvLyBsZXNzIHRoYW4gMXkhXG59XG4iLCAiaW1wb3J0IHtmb3JtYXREZWNpbWFsUGFydHN9IGZyb20gXCIuL2Zvcm1hdERlY2ltYWwuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCwgcCkge1xuICB2YXIgZCA9IGZvcm1hdERlY2ltYWxQYXJ0cyh4LCBwKTtcbiAgaWYgKCFkKSByZXR1cm4geCArIFwiXCI7XG4gIHZhciBjb2VmZmljaWVudCA9IGRbMF0sXG4gICAgICBleHBvbmVudCA9IGRbMV07XG4gIHJldHVybiBleHBvbmVudCA8IDAgPyBcIjAuXCIgKyBuZXcgQXJyYXkoLWV4cG9uZW50KS5qb2luKFwiMFwiKSArIGNvZWZmaWNpZW50XG4gICAgICA6IGNvZWZmaWNpZW50Lmxlbmd0aCA+IGV4cG9uZW50ICsgMSA/IGNvZWZmaWNpZW50LnNsaWNlKDAsIGV4cG9uZW50ICsgMSkgKyBcIi5cIiArIGNvZWZmaWNpZW50LnNsaWNlKGV4cG9uZW50ICsgMSlcbiAgICAgIDogY29lZmZpY2llbnQgKyBuZXcgQXJyYXkoZXhwb25lbnQgLSBjb2VmZmljaWVudC5sZW5ndGggKyAyKS5qb2luKFwiMFwiKTtcbn1cbiIsICJpbXBvcnQgZm9ybWF0RGVjaW1hbCBmcm9tIFwiLi9mb3JtYXREZWNpbWFsLmpzXCI7XG5pbXBvcnQgZm9ybWF0UHJlZml4QXV0byBmcm9tIFwiLi9mb3JtYXRQcmVmaXhBdXRvLmpzXCI7XG5pbXBvcnQgZm9ybWF0Um91bmRlZCBmcm9tIFwiLi9mb3JtYXRSb3VuZGVkLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgXCIlXCI6ICh4LCBwKSA9PiAoeCAqIDEwMCkudG9GaXhlZChwKSxcbiAgXCJiXCI6ICh4KSA9PiBNYXRoLnJvdW5kKHgpLnRvU3RyaW5nKDIpLFxuICBcImNcIjogKHgpID0+IHggKyBcIlwiLFxuICBcImRcIjogZm9ybWF0RGVjaW1hbCxcbiAgXCJlXCI6ICh4LCBwKSA9PiB4LnRvRXhwb25lbnRpYWwocCksXG4gIFwiZlwiOiAoeCwgcCkgPT4geC50b0ZpeGVkKHApLFxuICBcImdcIjogKHgsIHApID0+IHgudG9QcmVjaXNpb24ocCksXG4gIFwib1wiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZyg4KSxcbiAgXCJwXCI6ICh4LCBwKSA9PiBmb3JtYXRSb3VuZGVkKHggKiAxMDAsIHApLFxuICBcInJcIjogZm9ybWF0Um91bmRlZCxcbiAgXCJzXCI6IGZvcm1hdFByZWZpeEF1dG8sXG4gIFwiWFwiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKSxcbiAgXCJ4XCI6ICh4KSA9PiBNYXRoLnJvdW5kKHgpLnRvU3RyaW5nKDE2KVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiB4O1xufVxuIiwgImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuaW1wb3J0IGZvcm1hdEdyb3VwIGZyb20gXCIuL2Zvcm1hdEdyb3VwLmpzXCI7XG5pbXBvcnQgZm9ybWF0TnVtZXJhbHMgZnJvbSBcIi4vZm9ybWF0TnVtZXJhbHMuanNcIjtcbmltcG9ydCBmb3JtYXRTcGVjaWZpZXIgZnJvbSBcIi4vZm9ybWF0U3BlY2lmaWVyLmpzXCI7XG5pbXBvcnQgZm9ybWF0VHJpbSBmcm9tIFwiLi9mb3JtYXRUcmltLmpzXCI7XG5pbXBvcnQgZm9ybWF0VHlwZXMgZnJvbSBcIi4vZm9ybWF0VHlwZXMuanNcIjtcbmltcG9ydCB7cHJlZml4RXhwb25lbnR9IGZyb20gXCIuL2Zvcm1hdFByZWZpeEF1dG8uanNcIjtcbmltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi9pZGVudGl0eS5qc1wiO1xuXG52YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcCxcbiAgICBwcmVmaXhlcyA9IFtcInlcIixcInpcIixcImFcIixcImZcIixcInBcIixcIm5cIixcIlx1MDBCNVwiLFwibVwiLFwiXCIsXCJrXCIsXCJNXCIsXCJHXCIsXCJUXCIsXCJQXCIsXCJFXCIsXCJaXCIsXCJZXCJdO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihsb2NhbGUpIHtcbiAgdmFyIGdyb3VwID0gbG9jYWxlLmdyb3VwaW5nID09PSB1bmRlZmluZWQgfHwgbG9jYWxlLnRob3VzYW5kcyA9PT0gdW5kZWZpbmVkID8gaWRlbnRpdHkgOiBmb3JtYXRHcm91cChtYXAuY2FsbChsb2NhbGUuZ3JvdXBpbmcsIE51bWJlciksIGxvY2FsZS50aG91c2FuZHMgKyBcIlwiKSxcbiAgICAgIGN1cnJlbmN5UHJlZml4ID0gbG9jYWxlLmN1cnJlbmN5ID09PSB1bmRlZmluZWQgPyBcIlwiIDogbG9jYWxlLmN1cnJlbmN5WzBdICsgXCJcIixcbiAgICAgIGN1cnJlbmN5U3VmZml4ID0gbG9jYWxlLmN1cnJlbmN5ID09PSB1bmRlZmluZWQgPyBcIlwiIDogbG9jYWxlLmN1cnJlbmN5WzFdICsgXCJcIixcbiAgICAgIGRlY2ltYWwgPSBsb2NhbGUuZGVjaW1hbCA9PT0gdW5kZWZpbmVkID8gXCIuXCIgOiBsb2NhbGUuZGVjaW1hbCArIFwiXCIsXG4gICAgICBudW1lcmFscyA9IGxvY2FsZS5udW1lcmFscyA9PT0gdW5kZWZpbmVkID8gaWRlbnRpdHkgOiBmb3JtYXROdW1lcmFscyhtYXAuY2FsbChsb2NhbGUubnVtZXJhbHMsIFN0cmluZykpLFxuICAgICAgcGVyY2VudCA9IGxvY2FsZS5wZXJjZW50ID09PSB1bmRlZmluZWQgPyBcIiVcIiA6IGxvY2FsZS5wZXJjZW50ICsgXCJcIixcbiAgICAgIG1pbnVzID0gbG9jYWxlLm1pbnVzID09PSB1bmRlZmluZWQgPyBcIlx1MjIxMlwiIDogbG9jYWxlLm1pbnVzICsgXCJcIixcbiAgICAgIG5hbiA9IGxvY2FsZS5uYW4gPT09IHVuZGVmaW5lZCA/IFwiTmFOXCIgOiBsb2NhbGUubmFuICsgXCJcIjtcblxuICBmdW5jdGlvbiBuZXdGb3JtYXQoc3BlY2lmaWVyLCBvcHRpb25zKSB7XG4gICAgc3BlY2lmaWVyID0gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllcik7XG5cbiAgICB2YXIgZmlsbCA9IHNwZWNpZmllci5maWxsLFxuICAgICAgICBhbGlnbiA9IHNwZWNpZmllci5hbGlnbixcbiAgICAgICAgc2lnbiA9IHNwZWNpZmllci5zaWduLFxuICAgICAgICBzeW1ib2wgPSBzcGVjaWZpZXIuc3ltYm9sLFxuICAgICAgICB6ZXJvID0gc3BlY2lmaWVyLnplcm8sXG4gICAgICAgIHdpZHRoID0gc3BlY2lmaWVyLndpZHRoLFxuICAgICAgICBjb21tYSA9IHNwZWNpZmllci5jb21tYSxcbiAgICAgICAgcHJlY2lzaW9uID0gc3BlY2lmaWVyLnByZWNpc2lvbixcbiAgICAgICAgdHJpbSA9IHNwZWNpZmllci50cmltLFxuICAgICAgICB0eXBlID0gc3BlY2lmaWVyLnR5cGU7XG5cbiAgICAvLyBUaGUgXCJuXCIgdHlwZSBpcyBhbiBhbGlhcyBmb3IgXCIsZ1wiLlxuICAgIGlmICh0eXBlID09PSBcIm5cIikgY29tbWEgPSB0cnVlLCB0eXBlID0gXCJnXCI7XG5cbiAgICAvLyBUaGUgXCJcIiB0eXBlLCBhbmQgYW55IGludmFsaWQgdHlwZSwgaXMgYW4gYWxpYXMgZm9yIFwiLjEyfmdcIi5cbiAgICBlbHNlIGlmICghZm9ybWF0VHlwZXNbdHlwZV0pIHByZWNpc2lvbiA9PT0gdW5kZWZpbmVkICYmIChwcmVjaXNpb24gPSAxMiksIHRyaW0gPSB0cnVlLCB0eXBlID0gXCJnXCI7XG5cbiAgICAvLyBJZiB6ZXJvIGZpbGwgaXMgc3BlY2lmaWVkLCBwYWRkaW5nIGdvZXMgYWZ0ZXIgc2lnbiBhbmQgYmVmb3JlIGRpZ2l0cy5cbiAgICBpZiAoemVybyB8fCAoZmlsbCA9PT0gXCIwXCIgJiYgYWxpZ24gPT09IFwiPVwiKSkgemVybyA9IHRydWUsIGZpbGwgPSBcIjBcIiwgYWxpZ24gPSBcIj1cIjtcblxuICAgIC8vIENvbXB1dGUgdGhlIHByZWZpeCBhbmQgc3VmZml4LlxuICAgIC8vIEZvciBTSS1wcmVmaXgsIHRoZSBzdWZmaXggaXMgbGF6aWx5IGNvbXB1dGVkLlxuICAgIHZhciBwcmVmaXggPSAob3B0aW9ucyAmJiBvcHRpb25zLnByZWZpeCAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5wcmVmaXggOiBcIlwiKSArIChzeW1ib2wgPT09IFwiJFwiID8gY3VycmVuY3lQcmVmaXggOiBzeW1ib2wgPT09IFwiI1wiICYmIC9bYm94WF0vLnRlc3QodHlwZSkgPyBcIjBcIiArIHR5cGUudG9Mb3dlckNhc2UoKSA6IFwiXCIpLFxuICAgICAgICBzdWZmaXggPSAoc3ltYm9sID09PSBcIiRcIiA/IGN1cnJlbmN5U3VmZml4IDogL1slcF0vLnRlc3QodHlwZSkgPyBwZXJjZW50IDogXCJcIikgKyAob3B0aW9ucyAmJiBvcHRpb25zLnN1ZmZpeCAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5zdWZmaXggOiBcIlwiKTtcblxuICAgIC8vIFdoYXQgZm9ybWF0IGZ1bmN0aW9uIHNob3VsZCB3ZSB1c2U/XG4gICAgLy8gSXMgdGhpcyBhbiBpbnRlZ2VyIHR5cGU/XG4gICAgLy8gQ2FuIHRoaXMgdHlwZSBnZW5lcmF0ZSBleHBvbmVudGlhbCBub3RhdGlvbj9cbiAgICB2YXIgZm9ybWF0VHlwZSA9IGZvcm1hdFR5cGVzW3R5cGVdLFxuICAgICAgICBtYXliZVN1ZmZpeCA9IC9bZGVmZ3BycyVdLy50ZXN0KHR5cGUpO1xuXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0IHByZWNpc2lvbiBpZiBub3Qgc3BlY2lmaWVkLFxuICAgIC8vIG9yIGNsYW1wIHRoZSBzcGVjaWZpZWQgcHJlY2lzaW9uIHRvIHRoZSBzdXBwb3J0ZWQgcmFuZ2UuXG4gICAgLy8gRm9yIHNpZ25pZmljYW50IHByZWNpc2lvbiwgaXQgbXVzdCBiZSBpbiBbMSwgMjFdLlxuICAgIC8vIEZvciBmaXhlZCBwcmVjaXNpb24sIGl0IG11c3QgYmUgaW4gWzAsIDIwXS5cbiAgICBwcmVjaXNpb24gPSBwcmVjaXNpb24gPT09IHVuZGVmaW5lZCA/IDZcbiAgICAgICAgOiAvW2dwcnNdLy50ZXN0KHR5cGUpID8gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjEsIHByZWNpc2lvbikpXG4gICAgICAgIDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMjAsIHByZWNpc2lvbikpO1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0KHZhbHVlKSB7XG4gICAgICB2YXIgdmFsdWVQcmVmaXggPSBwcmVmaXgsXG4gICAgICAgICAgdmFsdWVTdWZmaXggPSBzdWZmaXgsXG4gICAgICAgICAgaSwgbiwgYztcblxuICAgICAgaWYgKHR5cGUgPT09IFwiY1wiKSB7XG4gICAgICAgIHZhbHVlU3VmZml4ID0gZm9ybWF0VHlwZSh2YWx1ZSkgKyB2YWx1ZVN1ZmZpeDtcbiAgICAgICAgdmFsdWUgPSBcIlwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSArdmFsdWU7XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBzaWduLiAtMCBpcyBub3QgbGVzcyB0aGFuIDAsIGJ1dCAxIC8gLTAgaXMhXG4gICAgICAgIHZhciB2YWx1ZU5lZ2F0aXZlID0gdmFsdWUgPCAwIHx8IDEgLyB2YWx1ZSA8IDA7XG5cbiAgICAgICAgLy8gUGVyZm9ybSB0aGUgaW5pdGlhbCBmb3JtYXR0aW5nLlxuICAgICAgICB2YWx1ZSA9IGlzTmFOKHZhbHVlKSA/IG5hbiA6IGZvcm1hdFR5cGUoTWF0aC5hYnModmFsdWUpLCBwcmVjaXNpb24pO1xuXG4gICAgICAgIC8vIFRyaW0gaW5zaWduaWZpY2FudCB6ZXJvcy5cbiAgICAgICAgaWYgKHRyaW0pIHZhbHVlID0gZm9ybWF0VHJpbSh2YWx1ZSk7XG5cbiAgICAgICAgLy8gSWYgYSBuZWdhdGl2ZSB2YWx1ZSByb3VuZHMgdG8gemVybyBhZnRlciBmb3JtYXR0aW5nLCBhbmQgbm8gZXhwbGljaXQgcG9zaXRpdmUgc2lnbiBpcyByZXF1ZXN0ZWQsIGhpZGUgdGhlIHNpZ24uXG4gICAgICAgIGlmICh2YWx1ZU5lZ2F0aXZlICYmICt2YWx1ZSA9PT0gMCAmJiBzaWduICE9PSBcIitcIikgdmFsdWVOZWdhdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIHByZWZpeCBhbmQgc3VmZml4LlxuICAgICAgICB2YWx1ZVByZWZpeCA9ICh2YWx1ZU5lZ2F0aXZlID8gKHNpZ24gPT09IFwiKFwiID8gc2lnbiA6IG1pbnVzKSA6IHNpZ24gPT09IFwiLVwiIHx8IHNpZ24gPT09IFwiKFwiID8gXCJcIiA6IHNpZ24pICsgdmFsdWVQcmVmaXg7XG4gICAgICAgIHZhbHVlU3VmZml4ID0gKHR5cGUgPT09IFwic1wiICYmICFpc05hTih2YWx1ZSkgJiYgcHJlZml4RXhwb25lbnQgIT09IHVuZGVmaW5lZCA/IHByZWZpeGVzWzggKyBwcmVmaXhFeHBvbmVudCAvIDNdIDogXCJcIikgKyB2YWx1ZVN1ZmZpeCArICh2YWx1ZU5lZ2F0aXZlICYmIHNpZ24gPT09IFwiKFwiID8gXCIpXCIgOiBcIlwiKTtcblxuICAgICAgICAvLyBCcmVhayB0aGUgZm9ybWF0dGVkIHZhbHVlIGludG8gdGhlIGludGVnZXIgXHUyMDFDdmFsdWVcdTIwMUQgcGFydCB0aGF0IGNhbiBiZVxuICAgICAgICAvLyBncm91cGVkLCBhbmQgZnJhY3Rpb25hbCBvciBleHBvbmVudGlhbCBcdTIwMUNzdWZmaXhcdTIwMUQgcGFydCB0aGF0IGlzIG5vdC5cbiAgICAgICAgaWYgKG1heWJlU3VmZml4KSB7XG4gICAgICAgICAgaSA9IC0xLCBuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAoYyA9IHZhbHVlLmNoYXJDb2RlQXQoaSksIDQ4ID4gYyB8fCBjID4gNTcpIHtcbiAgICAgICAgICAgICAgdmFsdWVTdWZmaXggPSAoYyA9PT0gNDYgPyBkZWNpbWFsICsgdmFsdWUuc2xpY2UoaSArIDEpIDogdmFsdWUuc2xpY2UoaSkpICsgdmFsdWVTdWZmaXg7XG4gICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgZmlsbCBjaGFyYWN0ZXIgaXMgbm90IFwiMFwiLCBncm91cGluZyBpcyBhcHBsaWVkIGJlZm9yZSBwYWRkaW5nLlxuICAgICAgaWYgKGNvbW1hICYmICF6ZXJvKSB2YWx1ZSA9IGdyb3VwKHZhbHVlLCBJbmZpbml0eSk7XG5cbiAgICAgIC8vIENvbXB1dGUgdGhlIHBhZGRpbmcuXG4gICAgICB2YXIgbGVuZ3RoID0gdmFsdWVQcmVmaXgubGVuZ3RoICsgdmFsdWUubGVuZ3RoICsgdmFsdWVTdWZmaXgubGVuZ3RoLFxuICAgICAgICAgIHBhZGRpbmcgPSBsZW5ndGggPCB3aWR0aCA/IG5ldyBBcnJheSh3aWR0aCAtIGxlbmd0aCArIDEpLmpvaW4oZmlsbCkgOiBcIlwiO1xuXG4gICAgICAvLyBJZiB0aGUgZmlsbCBjaGFyYWN0ZXIgaXMgXCIwXCIsIGdyb3VwaW5nIGlzIGFwcGxpZWQgYWZ0ZXIgcGFkZGluZy5cbiAgICAgIGlmIChjb21tYSAmJiB6ZXJvKSB2YWx1ZSA9IGdyb3VwKHBhZGRpbmcgKyB2YWx1ZSwgcGFkZGluZy5sZW5ndGggPyB3aWR0aCAtIHZhbHVlU3VmZml4Lmxlbmd0aCA6IEluZmluaXR5KSwgcGFkZGluZyA9IFwiXCI7XG5cbiAgICAgIC8vIFJlY29uc3RydWN0IHRoZSBmaW5hbCBvdXRwdXQgYmFzZWQgb24gdGhlIGRlc2lyZWQgYWxpZ25tZW50LlxuICAgICAgc3dpdGNoIChhbGlnbikge1xuICAgICAgICBjYXNlIFwiPFwiOiB2YWx1ZSA9IHZhbHVlUHJlZml4ICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeCArIHBhZGRpbmc7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiPVwiOiB2YWx1ZSA9IHZhbHVlUHJlZml4ICsgcGFkZGluZyArIHZhbHVlICsgdmFsdWVTdWZmaXg7IGJyZWFrO1xuICAgICAgICBjYXNlIFwiXlwiOiB2YWx1ZSA9IHBhZGRpbmcuc2xpY2UoMCwgbGVuZ3RoID0gcGFkZGluZy5sZW5ndGggPj4gMSkgKyB2YWx1ZVByZWZpeCArIHZhbHVlICsgdmFsdWVTdWZmaXggKyBwYWRkaW5nLnNsaWNlKGxlbmd0aCk7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB2YWx1ZSA9IHBhZGRpbmcgKyB2YWx1ZVByZWZpeCArIHZhbHVlICsgdmFsdWVTdWZmaXg7IGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVtZXJhbHModmFsdWUpO1xuICAgIH1cblxuICAgIGZvcm1hdC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNwZWNpZmllciArIFwiXCI7XG4gICAgfTtcblxuICAgIHJldHVybiBmb3JtYXQ7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRQcmVmaXgoc3BlY2lmaWVyLCB2YWx1ZSkge1xuICAgIHZhciBlID0gTWF0aC5tYXgoLTgsIE1hdGgubWluKDgsIE1hdGguZmxvb3IoZXhwb25lbnQodmFsdWUpIC8gMykpKSAqIDMsXG4gICAgICAgIGsgPSBNYXRoLnBvdygxMCwgLWUpLFxuICAgICAgICBmID0gbmV3Rm9ybWF0KChzcGVjaWZpZXIgPSBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKSwgc3BlY2lmaWVyLnR5cGUgPSBcImZcIiwgc3BlY2lmaWVyKSwge3N1ZmZpeDogcHJlZml4ZXNbOCArIGUgLyAzXX0pO1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGYoayAqIHZhbHVlKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmb3JtYXQ6IG5ld0Zvcm1hdCxcbiAgICBmb3JtYXRQcmVmaXg6IGZvcm1hdFByZWZpeFxuICB9O1xufVxuIiwgImltcG9ydCBmb3JtYXRMb2NhbGUgZnJvbSBcIi4vbG9jYWxlLmpzXCI7XG5cbnZhciBsb2NhbGU7XG5leHBvcnQgdmFyIGZvcm1hdDtcbmV4cG9ydCB2YXIgZm9ybWF0UHJlZml4O1xuXG5kZWZhdWx0TG9jYWxlKHtcbiAgdGhvdXNhbmRzOiBcIixcIixcbiAgZ3JvdXBpbmc6IFszXSxcbiAgY3VycmVuY3k6IFtcIiRcIiwgXCJcIl1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWZhdWx0TG9jYWxlKGRlZmluaXRpb24pIHtcbiAgbG9jYWxlID0gZm9ybWF0TG9jYWxlKGRlZmluaXRpb24pO1xuICBmb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICBmb3JtYXRQcmVmaXggPSBsb2NhbGUuZm9ybWF0UHJlZml4O1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwgImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGVwKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCAtZXhwb25lbnQoTWF0aC5hYnMoc3RlcCkpKTtcbn1cbiIsICJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RlcCwgdmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWF4KC04LCBNYXRoLm1pbig4LCBNYXRoLmZsb29yKGV4cG9uZW50KHZhbHVlKSAvIDMpKSkgKiAzIC0gZXhwb25lbnQoTWF0aC5hYnMoc3RlcCkpKTtcbn1cbiIsICJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RlcCwgbWF4KSB7XG4gIHN0ZXAgPSBNYXRoLmFicyhzdGVwKSwgbWF4ID0gTWF0aC5hYnMobWF4KSAtIHN0ZXA7XG4gIHJldHVybiBNYXRoLm1heCgwLCBleHBvbmVudChtYXgpIC0gZXhwb25lbnQoc3RlcCkpICsgMTtcbn1cbiIsICJleHBvcnQgdmFyIGVwc2lsb24gPSAxZS02O1xuZXhwb3J0IHZhciBlcHNpbG9uMiA9IDFlLTEyO1xuZXhwb3J0IHZhciBwaSA9IE1hdGguUEk7XG5leHBvcnQgdmFyIGhhbGZQaSA9IHBpIC8gMjtcbmV4cG9ydCB2YXIgcXVhcnRlclBpID0gcGkgLyA0O1xuZXhwb3J0IHZhciB0YXUgPSBwaSAqIDI7XG5cbmV4cG9ydCB2YXIgZGVncmVlcyA9IDE4MCAvIHBpO1xuZXhwb3J0IHZhciByYWRpYW5zID0gcGkgLyAxODA7XG5cbmV4cG9ydCB2YXIgYWJzID0gTWF0aC5hYnM7XG5leHBvcnQgdmFyIGF0YW4gPSBNYXRoLmF0YW47XG5leHBvcnQgdmFyIGF0YW4yID0gTWF0aC5hdGFuMjtcbmV4cG9ydCB2YXIgY29zID0gTWF0aC5jb3M7XG5leHBvcnQgdmFyIGNlaWwgPSBNYXRoLmNlaWw7XG5leHBvcnQgdmFyIGV4cCA9IE1hdGguZXhwO1xuZXhwb3J0IHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5leHBvcnQgdmFyIGh5cG90ID0gTWF0aC5oeXBvdDtcbmV4cG9ydCB2YXIgbG9nID0gTWF0aC5sb2c7XG5leHBvcnQgdmFyIHBvdyA9IE1hdGgucG93O1xuZXhwb3J0IHZhciBzaW4gPSBNYXRoLnNpbjtcbmV4cG9ydCB2YXIgc2lnbiA9IE1hdGguc2lnbiB8fCBmdW5jdGlvbih4KSB7IHJldHVybiB4ID4gMCA/IDEgOiB4IDwgMCA/IC0xIDogMDsgfTtcbmV4cG9ydCB2YXIgc3FydCA9IE1hdGguc3FydDtcbmV4cG9ydCB2YXIgdGFuID0gTWF0aC50YW47XG5cbmV4cG9ydCBmdW5jdGlvbiBhY29zKHgpIHtcbiAgcmV0dXJuIHggPiAxID8gMCA6IHggPCAtMSA/IHBpIDogTWF0aC5hY29zKHgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNpbih4KSB7XG4gIHJldHVybiB4ID4gMSA/IGhhbGZQaSA6IHggPCAtMSA/IC1oYWxmUGkgOiBNYXRoLmFzaW4oeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXZlcnNpbih4KSB7XG4gIHJldHVybiAoeCA9IHNpbih4IC8gMikpICogeDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub29wKCkge31cbiIsICJmdW5jdGlvbiBzdHJlYW1HZW9tZXRyeShnZW9tZXRyeSwgc3RyZWFtKSB7XG4gIGlmIChnZW9tZXRyeSAmJiBzdHJlYW1HZW9tZXRyeVR5cGUuaGFzT3duUHJvcGVydHkoZ2VvbWV0cnkudHlwZSkpIHtcbiAgICBzdHJlYW1HZW9tZXRyeVR5cGVbZ2VvbWV0cnkudHlwZV0oZ2VvbWV0cnksIHN0cmVhbSk7XG4gIH1cbn1cblxudmFyIHN0cmVhbU9iamVjdFR5cGUgPSB7XG4gIEZlYXR1cmU6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtR2VvbWV0cnkob2JqZWN0Lmdlb21ldHJ5LCBzdHJlYW0pO1xuICB9LFxuICBGZWF0dXJlQ29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgZmVhdHVyZXMgPSBvYmplY3QuZmVhdHVyZXMsIGkgPSAtMSwgbiA9IGZlYXR1cmVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtR2VvbWV0cnkoZmVhdHVyZXNbaV0uZ2VvbWV0cnksIHN0cmVhbSk7XG4gIH1cbn07XG5cbnZhciBzdHJlYW1HZW9tZXRyeVR5cGUgPSB7XG4gIFNwaGVyZTogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBzdHJlYW0uc3BoZXJlKCk7XG4gIH0sXG4gIFBvaW50OiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIG9iamVjdCA9IG9iamVjdC5jb29yZGluYXRlcztcbiAgICBzdHJlYW0ucG9pbnQob2JqZWN0WzBdLCBvYmplY3RbMV0sIG9iamVjdFsyXSk7XG4gIH0sXG4gIE11bHRpUG9pbnQ6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIG9iamVjdCA9IGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0ucG9pbnQob2JqZWN0WzBdLCBvYmplY3RbMV0sIG9iamVjdFsyXSk7XG4gIH0sXG4gIExpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtTGluZShvYmplY3QuY29vcmRpbmF0ZXMsIHN0cmVhbSwgMCk7XG4gIH0sXG4gIE11bHRpTGluZVN0cmluZzogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtTGluZShjb29yZGluYXRlc1tpXSwgc3RyZWFtLCAwKTtcbiAgfSxcbiAgUG9seWdvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBzdHJlYW1Qb2x5Z29uKG9iamVjdC5jb29yZGluYXRlcywgc3RyZWFtKTtcbiAgfSxcbiAgTXVsdGlQb2x5Z29uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1Qb2x5Z29uKGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0pO1xuICB9LFxuICBHZW9tZXRyeUNvbGxlY3Rpb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGdlb21ldHJpZXMgPSBvYmplY3QuZ2VvbWV0cmllcywgaSA9IC0xLCBuID0gZ2VvbWV0cmllcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUdlb21ldHJ5KGdlb21ldHJpZXNbaV0sIHN0cmVhbSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXMsIHN0cmVhbSwgY2xvc2VkKSB7XG4gIHZhciBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGggLSBjbG9zZWQsIGNvb3JkaW5hdGU7XG4gIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgd2hpbGUgKCsraSA8IG4pIGNvb3JkaW5hdGUgPSBjb29yZGluYXRlc1tpXSwgc3RyZWFtLnBvaW50KGNvb3JkaW5hdGVbMF0sIGNvb3JkaW5hdGVbMV0sIGNvb3JkaW5hdGVbMl0pO1xuICBzdHJlYW0ubGluZUVuZCgpO1xufVxuXG5mdW5jdGlvbiBzdHJlYW1Qb2x5Z29uKGNvb3JkaW5hdGVzLCBzdHJlYW0pIHtcbiAgdmFyIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgc3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICB3aGlsZSAoKytpIDwgbikgc3RyZWFtTGluZShjb29yZGluYXRlc1tpXSwgc3RyZWFtLCAxKTtcbiAgc3RyZWFtLnBvbHlnb25FbmQoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgaWYgKG9iamVjdCAmJiBzdHJlYW1PYmplY3RUeXBlLmhhc093blByb3BlcnR5KG9iamVjdC50eXBlKSkge1xuICAgIHN0cmVhbU9iamVjdFR5cGVbb2JqZWN0LnR5cGVdKG9iamVjdCwgc3RyZWFtKTtcbiAgfSBlbHNlIHtcbiAgICBzdHJlYW1HZW9tZXRyeShvYmplY3QsIHN0cmVhbSk7XG4gIH1cbn1cbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YXRhbjIsIGNvcywgcXVhcnRlclBpLCByYWRpYW5zLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4vbm9vcC5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcblxuZXhwb3J0IHZhciBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpO1xuXG4vLyBoZWxsbz9cblxudmFyIGFyZWFTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBsYW1iZGEwMCxcbiAgICBwaGkwMCxcbiAgICBsYW1iZGEwLFxuICAgIGNvc1BoaTAsXG4gICAgc2luUGhpMDtcblxuZXhwb3J0IHZhciBhcmVhU3RyZWFtID0ge1xuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBub29wLFxuICBsaW5lRW5kOiBub29wLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFSaW5nU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgYXJlYVN0cmVhbS5saW5lU3RhcnQgPSBhcmVhUmluZ1N0YXJ0O1xuICAgIGFyZWFTdHJlYW0ubGluZUVuZCA9IGFyZWFSaW5nRW5kO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJlYVJpbmcgPSArYXJlYVJpbmdTdW07XG4gICAgYXJlYVN1bS5hZGQoYXJlYVJpbmcgPCAwID8gdGF1ICsgYXJlYVJpbmcgOiBhcmVhUmluZyk7XG4gICAgdGhpcy5saW5lU3RhcnQgPSB0aGlzLmxpbmVFbmQgPSB0aGlzLnBvaW50ID0gbm9vcDtcbiAgfSxcbiAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3VtLmFkZCh0YXUpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBhcmVhUmluZ1N0YXJ0KCkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50Rmlyc3Q7XG59XG5cbmZ1bmN0aW9uIGFyZWFSaW5nRW5kKCkge1xuICBhcmVhUG9pbnQobGFtYmRhMDAsIHBoaTAwKTtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50Rmlyc3QobGFtYmRhLCBwaGkpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludDtcbiAgbGFtYmRhMDAgPSBsYW1iZGEsIHBoaTAwID0gcGhpO1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIGxhbWJkYTAgPSBsYW1iZGEsIGNvc1BoaTAgPSBjb3MocGhpID0gcGhpIC8gMiArIHF1YXJ0ZXJQaSksIHNpblBoaTAgPSBzaW4ocGhpKTtcbn1cblxuZnVuY3Rpb24gYXJlYVBvaW50KGxhbWJkYSwgcGhpKSB7XG4gIGxhbWJkYSAqPSByYWRpYW5zLCBwaGkgKj0gcmFkaWFucztcbiAgcGhpID0gcGhpIC8gMiArIHF1YXJ0ZXJQaTsgLy8gaGFsZiB0aGUgYW5ndWxhciBkaXN0YW5jZSBmcm9tIHNvdXRoIHBvbGVcblxuICAvLyBTcGhlcmljYWwgZXhjZXNzIEUgZm9yIGEgc3BoZXJpY2FsIHRyaWFuZ2xlIHdpdGggdmVydGljZXM6IHNvdXRoIHBvbGUsXG4gIC8vIHByZXZpb3VzIHBvaW50LCBjdXJyZW50IHBvaW50LiAgVXNlcyBhIGZvcm11bGEgZGVyaXZlZCBmcm9tIENhZ25vbGlcdTIwMTlzXG4gIC8vIHRoZW9yZW0uICBTZWUgVG9kaHVudGVyLCBTcGhlcmljYWwgVHJpZy4gKDE4NzEpLCBTZWMuIDEwMywgRXEuICgyKS5cbiAgdmFyIGRMYW1iZGEgPSBsYW1iZGEgLSBsYW1iZGEwLFxuICAgICAgc2RMYW1iZGEgPSBkTGFtYmRhID49IDAgPyAxIDogLTEsXG4gICAgICBhZExhbWJkYSA9IHNkTGFtYmRhICogZExhbWJkYSxcbiAgICAgIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgc2luUGhpID0gc2luKHBoaSksXG4gICAgICBrID0gc2luUGhpMCAqIHNpblBoaSxcbiAgICAgIHUgPSBjb3NQaGkwICogY29zUGhpICsgayAqIGNvcyhhZExhbWJkYSksXG4gICAgICB2ID0gayAqIHNkTGFtYmRhICogc2luKGFkTGFtYmRhKTtcbiAgYXJlYVJpbmdTdW0uYWRkKGF0YW4yKHYsIHUpKTtcblxuICAvLyBBZHZhbmNlIHRoZSBwcmV2aW91cyBwb2ludHMuXG4gIGxhbWJkYTAgPSBsYW1iZGEsIGNvc1BoaTAgPSBjb3NQaGksIHNpblBoaTAgPSBzaW5QaGk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCkge1xuICBhcmVhU3VtID0gbmV3IEFkZGVyKCk7XG4gIHN0cmVhbShvYmplY3QsIGFyZWFTdHJlYW0pO1xuICByZXR1cm4gYXJlYVN1bSAqIDI7XG59XG4iLCAiaW1wb3J0IHthc2luLCBhdGFuMiwgY29zLCBzaW4sIHNxcnR9IGZyb20gXCIuL21hdGguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNwaGVyaWNhbChjYXJ0ZXNpYW4pIHtcbiAgcmV0dXJuIFthdGFuMihjYXJ0ZXNpYW5bMV0sIGNhcnRlc2lhblswXSksIGFzaW4oY2FydGVzaWFuWzJdKV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW4oc3BoZXJpY2FsKSB7XG4gIHZhciBsYW1iZGEgPSBzcGhlcmljYWxbMF0sIHBoaSA9IHNwaGVyaWNhbFsxXSwgY29zUGhpID0gY29zKHBoaSk7XG4gIHJldHVybiBbY29zUGhpICogY29zKGxhbWJkYSksIGNvc1BoaSAqIHNpbihsYW1iZGEpLCBzaW4ocGhpKV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5Eb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuQ3Jvc3MoYSwgYikge1xuICByZXR1cm4gW2FbMV0gKiBiWzJdIC0gYVsyXSAqIGJbMV0sIGFbMl0gKiBiWzBdIC0gYVswXSAqIGJbMl0sIGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF1dO1xufVxuXG4vLyBUT0RPIHJldHVybiBhXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuQWRkSW5QbGFjZShhLCBiKSB7XG4gIGFbMF0gKz0gYlswXSwgYVsxXSArPSBiWzFdLCBhWzJdICs9IGJbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5TY2FsZSh2ZWN0b3IsIGspIHtcbiAgcmV0dXJuIFt2ZWN0b3JbMF0gKiBrLCB2ZWN0b3JbMV0gKiBrLCB2ZWN0b3JbMl0gKiBrXTtcbn1cblxuLy8gVE9ETyByZXR1cm4gZFxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UoZCkge1xuICB2YXIgbCA9IHNxcnQoZFswXSAqIGRbMF0gKyBkWzFdICogZFsxXSArIGRbMl0gKiBkWzJdKTtcbiAgZFswXSAvPSBsLCBkWzFdIC89IGwsIGRbMl0gLz0gbDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG5cbiAgZnVuY3Rpb24gY29tcG9zZSh4LCB5KSB7XG4gICAgcmV0dXJuIHggPSBhKHgsIHkpLCBiKHhbMF0sIHhbMV0pO1xuICB9XG5cbiAgaWYgKGEuaW52ZXJ0ICYmIGIuaW52ZXJ0KSBjb21wb3NlLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4geCA9IGIuaW52ZXJ0KHgsIHkpLCB4ICYmIGEuaW52ZXJ0KHhbMF0sIHhbMV0pO1xuICB9O1xuXG4gIHJldHVybiBjb21wb3NlO1xufVxuIiwgImltcG9ydCBjb21wb3NlIGZyb20gXCIuL2NvbXBvc2UuanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBkZWdyZWVzLCBwaSwgcmFkaWFucywgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gcm90YXRpb25JZGVudGl0eShsYW1iZGEsIHBoaSkge1xuICBpZiAoYWJzKGxhbWJkYSkgPiBwaSkgbGFtYmRhIC09IE1hdGgucm91bmQobGFtYmRhIC8gdGF1KSAqIHRhdTtcbiAgcmV0dXJuIFtsYW1iZGEsIHBoaV07XG59XG5cbnJvdGF0aW9uSWRlbnRpdHkuaW52ZXJ0ID0gcm90YXRpb25JZGVudGl0eTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVJhZGlhbnMoZGVsdGFMYW1iZGEsIGRlbHRhUGhpLCBkZWx0YUdhbW1hKSB7XG4gIHJldHVybiAoZGVsdGFMYW1iZGEgJT0gdGF1KSA/IChkZWx0YVBoaSB8fCBkZWx0YUdhbW1hID8gY29tcG9zZShyb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSksIHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpKVxuICAgIDogcm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpKVxuICAgIDogKGRlbHRhUGhpIHx8IGRlbHRhR2FtbWEgPyByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKVxuICAgIDogcm90YXRpb25JZGVudGl0eSk7XG59XG5cbmZ1bmN0aW9uIGZvcndhcmRSb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSkge1xuICByZXR1cm4gZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICBsYW1iZGEgKz0gZGVsdGFMYW1iZGE7XG4gICAgaWYgKGFicyhsYW1iZGEpID4gcGkpIGxhbWJkYSAtPSBNYXRoLnJvdW5kKGxhbWJkYSAvIHRhdSkgKiB0YXU7XG4gICAgcmV0dXJuIFtsYW1iZGEsIHBoaV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSB7XG4gIHZhciByb3RhdGlvbiA9IGZvcndhcmRSb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSk7XG4gIHJvdGF0aW9uLmludmVydCA9IGZvcndhcmRSb3RhdGlvbkxhbWJkYSgtZGVsdGFMYW1iZGEpO1xuICByZXR1cm4gcm90YXRpb247XG59XG5cbmZ1bmN0aW9uIHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpIHtcbiAgdmFyIGNvc0RlbHRhUGhpID0gY29zKGRlbHRhUGhpKSxcbiAgICAgIHNpbkRlbHRhUGhpID0gc2luKGRlbHRhUGhpKSxcbiAgICAgIGNvc0RlbHRhR2FtbWEgPSBjb3MoZGVsdGFHYW1tYSksXG4gICAgICBzaW5EZWx0YUdhbW1hID0gc2luKGRlbHRhR2FtbWEpO1xuXG4gIGZ1bmN0aW9uIHJvdGF0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgdmFyIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgICB4ID0gY29zKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHkgPSBzaW4obGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeiA9IHNpbihwaGkpLFxuICAgICAgICBrID0geiAqIGNvc0RlbHRhUGhpICsgeCAqIHNpbkRlbHRhUGhpO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih5ICogY29zRGVsdGFHYW1tYSAtIGsgKiBzaW5EZWx0YUdhbW1hLCB4ICogY29zRGVsdGFQaGkgLSB6ICogc2luRGVsdGFQaGkpLFxuICAgICAgYXNpbihrICogY29zRGVsdGFHYW1tYSArIHkgKiBzaW5EZWx0YUdhbW1hKVxuICAgIF07XG4gIH1cblxuICByb3RhdGlvbi5pbnZlcnQgPSBmdW5jdGlvbihsYW1iZGEsIHBoaSkge1xuICAgIHZhciBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgICAgeCA9IGNvcyhsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB5ID0gc2luKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHogPSBzaW4ocGhpKSxcbiAgICAgICAgayA9IHogKiBjb3NEZWx0YUdhbW1hIC0geSAqIHNpbkRlbHRhR2FtbWE7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0YW4yKHkgKiBjb3NEZWx0YUdhbW1hICsgeiAqIHNpbkRlbHRhR2FtbWEsIHggKiBjb3NEZWx0YVBoaSArIGsgKiBzaW5EZWx0YVBoaSksXG4gICAgICBhc2luKGsgKiBjb3NEZWx0YVBoaSAtIHggKiBzaW5EZWx0YVBoaSlcbiAgICBdO1xuICB9O1xuXG4gIHJldHVybiByb3RhdGlvbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocm90YXRlKSB7XG4gIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMocm90YXRlWzBdICogcmFkaWFucywgcm90YXRlWzFdICogcmFkaWFucywgcm90YXRlLmxlbmd0aCA+IDIgPyByb3RhdGVbMl0gKiByYWRpYW5zIDogMCk7XG5cbiAgZnVuY3Rpb24gZm9yd2FyZChjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzID0gcm90YXRlKGNvb3JkaW5hdGVzWzBdICogcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiByYWRpYW5zKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gIH1cblxuICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7XG4gICAgY29vcmRpbmF0ZXMgPSByb3RhdGUuaW52ZXJ0KGNvb3JkaW5hdGVzWzBdICogcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiByYWRpYW5zKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gIH07XG5cbiAgcmV0dXJuIGZvcndhcmQ7XG59XG4iLCAiaW1wb3J0IHtjYXJ0ZXNpYW4sIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UsIHNwaGVyaWNhbH0gZnJvbSBcIi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCB7YWNvcywgY29zLCBkZWdyZWVzLCBlcHNpbG9uLCByYWRpYW5zLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtyb3RhdGVSYWRpYW5zfSBmcm9tIFwiLi9yb3RhdGlvbi5qc1wiO1xuXG4vLyBHZW5lcmF0ZXMgYSBjaXJjbGUgY2VudGVyZWQgYXQgWzBcdTAwQjAsIDBcdTAwQjBdLCB3aXRoIGEgZ2l2ZW4gcmFkaXVzIGFuZCBwcmVjaXNpb24uXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlU3RyZWFtKHN0cmVhbSwgcmFkaXVzLCBkZWx0YSwgZGlyZWN0aW9uLCB0MCwgdDEpIHtcbiAgaWYgKCFkZWx0YSkgcmV0dXJuO1xuICB2YXIgY29zUmFkaXVzID0gY29zKHJhZGl1cyksXG4gICAgICBzaW5SYWRpdXMgPSBzaW4ocmFkaXVzKSxcbiAgICAgIHN0ZXAgPSBkaXJlY3Rpb24gKiBkZWx0YTtcbiAgaWYgKHQwID09IG51bGwpIHtcbiAgICB0MCA9IHJhZGl1cyArIGRpcmVjdGlvbiAqIHRhdTtcbiAgICB0MSA9IHJhZGl1cyAtIHN0ZXAgLyAyO1xuICB9IGVsc2Uge1xuICAgIHQwID0gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgdDApO1xuICAgIHQxID0gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgdDEpO1xuICAgIGlmIChkaXJlY3Rpb24gPiAwID8gdDAgPCB0MSA6IHQwID4gdDEpIHQwICs9IGRpcmVjdGlvbiAqIHRhdTtcbiAgfVxuICBmb3IgKHZhciBwb2ludCwgdCA9IHQwOyBkaXJlY3Rpb24gPiAwID8gdCA+IHQxIDogdCA8IHQxOyB0IC09IHN0ZXApIHtcbiAgICBwb2ludCA9IHNwaGVyaWNhbChbY29zUmFkaXVzLCAtc2luUmFkaXVzICogY29zKHQpLCAtc2luUmFkaXVzICogc2luKHQpXSk7XG4gICAgc3RyZWFtLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gIH1cbn1cblxuLy8gUmV0dXJucyB0aGUgc2lnbmVkIGFuZ2xlIG9mIGEgY2FydGVzaWFuIHBvaW50IHJlbGF0aXZlIHRvIFtjb3NSYWRpdXMsIDAsIDBdLlxuZnVuY3Rpb24gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgcG9pbnQpIHtcbiAgcG9pbnQgPSBjYXJ0ZXNpYW4ocG9pbnQpLCBwb2ludFswXSAtPSBjb3NSYWRpdXM7XG4gIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UocG9pbnQpO1xuICB2YXIgcmFkaXVzID0gYWNvcygtcG9pbnRbMV0pO1xuICByZXR1cm4gKCgtcG9pbnRbMl0gPCAwID8gLXJhZGl1cyA6IHJhZGl1cykgKyB0YXUgLSBlcHNpbG9uKSAlIHRhdTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBjZW50ZXIgPSBjb25zdGFudChbMCwgMF0pLFxuICAgICAgcmFkaXVzID0gY29uc3RhbnQoOTApLFxuICAgICAgcHJlY2lzaW9uID0gY29uc3RhbnQoMiksXG4gICAgICByaW5nLFxuICAgICAgcm90YXRlLFxuICAgICAgc3RyZWFtID0ge3BvaW50OiBwb2ludH07XG5cbiAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgIHJpbmcucHVzaCh4ID0gcm90YXRlKHgsIHkpKTtcbiAgICB4WzBdICo9IGRlZ3JlZXMsIHhbMV0gKj0gZGVncmVlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNpcmNsZSgpIHtcbiAgICB2YXIgYyA9IGNlbnRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICByID0gcmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKiByYWRpYW5zLFxuICAgICAgICBwID0gcHJlY2lzaW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKiByYWRpYW5zO1xuICAgIHJpbmcgPSBbXTtcbiAgICByb3RhdGUgPSByb3RhdGVSYWRpYW5zKC1jWzBdICogcmFkaWFucywgLWNbMV0gKiByYWRpYW5zLCAwKS5pbnZlcnQ7XG4gICAgY2lyY2xlU3RyZWFtKHN0cmVhbSwgciwgcCwgMSk7XG4gICAgYyA9IHt0eXBlOiBcIlBvbHlnb25cIiwgY29vcmRpbmF0ZXM6IFtyaW5nXX07XG4gICAgcmluZyA9IHJvdGF0ZSA9IG51bGw7XG4gICAgcmV0dXJuIGM7XG4gIH1cblxuICBjaXJjbGUuY2VudGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNlbnRlciA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoWytfWzBdLCArX1sxXV0pLCBjaXJjbGUpIDogY2VudGVyO1xuICB9O1xuXG4gIGNpcmNsZS5yYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGNpcmNsZSkgOiByYWRpdXM7XG4gIH07XG5cbiAgY2lyY2xlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjaXNpb24gPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgY2lyY2xlKSA6IHByZWNpc2lvbjtcbiAgfTtcblxuICByZXR1cm4gY2lyY2xlO1xufVxuIiwgImltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbGluZXMgPSBbXSxcbiAgICAgIGxpbmU7XG4gIHJldHVybiB7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHksIG0pIHtcbiAgICAgIGxpbmUucHVzaChbeCwgeSwgbV0pO1xuICAgIH0sXG4gICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGxpbmVzLnB1c2gobGluZSA9IFtdKTtcbiAgICB9LFxuICAgIGxpbmVFbmQ6IG5vb3AsXG4gICAgcmVqb2luOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAxKSBsaW5lcy5wdXNoKGxpbmVzLnBvcCgpLmNvbmNhdChsaW5lcy5zaGlmdCgpKSk7XG4gICAgfSxcbiAgICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IGxpbmVzO1xuICAgICAgbGluZXMgPSBbXTtcbiAgICAgIGxpbmUgPSBudWxsO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG59XG4iLCAiaW1wb3J0IHthYnMsIGVwc2lsb259IGZyb20gXCIuL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYWJzKGFbMF0gLSBiWzBdKSA8IGVwc2lsb24gJiYgYWJzKGFbMV0gLSBiWzFdKSA8IGVwc2lsb247XG59XG4iLCAiaW1wb3J0IHBvaW50RXF1YWwgZnJvbSBcIi4uL3BvaW50RXF1YWwuanNcIjtcbmltcG9ydCB7ZXBzaWxvbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZnVuY3Rpb24gSW50ZXJzZWN0aW9uKHBvaW50LCBwb2ludHMsIG90aGVyLCBlbnRyeSkge1xuICB0aGlzLnggPSBwb2ludDtcbiAgdGhpcy56ID0gcG9pbnRzO1xuICB0aGlzLm8gPSBvdGhlcjsgLy8gYW5vdGhlciBpbnRlcnNlY3Rpb25cbiAgdGhpcy5lID0gZW50cnk7IC8vIGlzIGFuIGVudHJ5P1xuICB0aGlzLnYgPSBmYWxzZTsgLy8gdmlzaXRlZFxuICB0aGlzLm4gPSB0aGlzLnAgPSBudWxsOyAvLyBuZXh0ICYgcHJldmlvdXNcbn1cblxuLy8gQSBnZW5lcmFsaXplZCBwb2x5Z29uIGNsaXBwaW5nIGFsZ29yaXRobTogZ2l2ZW4gYSBwb2x5Z29uIHRoYXQgaGFzIGJlZW4gY3V0XG4vLyBpbnRvIGl0cyB2aXNpYmxlIGxpbmUgc2VnbWVudHMsIGFuZCByZWpvaW5zIHRoZSBzZWdtZW50cyBieSBpbnRlcnBvbGF0aW5nXG4vLyBhbG9uZyB0aGUgY2xpcCBlZGdlLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VnbWVudHMsIGNvbXBhcmVJbnRlcnNlY3Rpb24sIHN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgc3RyZWFtKSB7XG4gIHZhciBzdWJqZWN0ID0gW10sXG4gICAgICBjbGlwID0gW10sXG4gICAgICBpLFxuICAgICAgbjtcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHNlZ21lbnQpIHtcbiAgICBpZiAoKG4gPSBzZWdtZW50Lmxlbmd0aCAtIDEpIDw9IDApIHJldHVybjtcbiAgICB2YXIgbiwgcDAgPSBzZWdtZW50WzBdLCBwMSA9IHNlZ21lbnRbbl0sIHg7XG5cbiAgICBpZiAocG9pbnRFcXVhbChwMCwgcDEpKSB7XG4gICAgICBpZiAoIXAwWzJdICYmICFwMVsyXSkge1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHN0cmVhbS5wb2ludCgocDAgPSBzZWdtZW50W2ldKVswXSwgcDBbMV0pO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcyBieSBtb3ZpbmcgdGhlIHBvaW50XG4gICAgICBwMVswXSArPSAyICogZXBzaWxvbjtcbiAgICB9XG5cbiAgICBzdWJqZWN0LnB1c2goeCA9IG5ldyBJbnRlcnNlY3Rpb24ocDAsIHNlZ21lbnQsIG51bGwsIHRydWUpKTtcbiAgICBjbGlwLnB1c2goeC5vID0gbmV3IEludGVyc2VjdGlvbihwMCwgbnVsbCwgeCwgZmFsc2UpKTtcbiAgICBzdWJqZWN0LnB1c2goeCA9IG5ldyBJbnRlcnNlY3Rpb24ocDEsIHNlZ21lbnQsIG51bGwsIGZhbHNlKSk7XG4gICAgY2xpcC5wdXNoKHgubyA9IG5ldyBJbnRlcnNlY3Rpb24ocDEsIG51bGwsIHgsIHRydWUpKTtcbiAgfSk7XG5cbiAgaWYgKCFzdWJqZWN0Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIGNsaXAuc29ydChjb21wYXJlSW50ZXJzZWN0aW9uKTtcbiAgbGluayhzdWJqZWN0KTtcbiAgbGluayhjbGlwKTtcblxuICBmb3IgKGkgPSAwLCBuID0gY2xpcC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBjbGlwW2ldLmUgPSBzdGFydEluc2lkZSA9ICFzdGFydEluc2lkZTtcbiAgfVxuXG4gIHZhciBzdGFydCA9IHN1YmplY3RbMF0sXG4gICAgICBwb2ludHMsXG4gICAgICBwb2ludDtcblxuICB3aGlsZSAoMSkge1xuICAgIC8vIEZpbmQgZmlyc3QgdW52aXNpdGVkIGludGVyc2VjdGlvbi5cbiAgICB2YXIgY3VycmVudCA9IHN0YXJ0LFxuICAgICAgICBpc1N1YmplY3QgPSB0cnVlO1xuICAgIHdoaWxlIChjdXJyZW50LnYpIGlmICgoY3VycmVudCA9IGN1cnJlbnQubikgPT09IHN0YXJ0KSByZXR1cm47XG4gICAgcG9pbnRzID0gY3VycmVudC56O1xuICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICBkbyB7XG4gICAgICBjdXJyZW50LnYgPSBjdXJyZW50Lm8udiA9IHRydWU7XG4gICAgICBpZiAoY3VycmVudC5lKSB7XG4gICAgICAgIGlmIChpc1N1YmplY3QpIHtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBuID0gcG9pbnRzLmxlbmd0aDsgaSA8IG47ICsraSkgc3RyZWFtLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShjdXJyZW50LngsIGN1cnJlbnQubi54LCAxLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgcG9pbnRzID0gY3VycmVudC5wLno7XG4gICAgICAgICAgZm9yIChpID0gcG9pbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSBzdHJlYW0ucG9pbnQoKHBvaW50ID0gcG9pbnRzW2ldKVswXSwgcG9pbnRbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludGVycG9sYXRlKGN1cnJlbnQueCwgY3VycmVudC5wLngsIC0xLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnA7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5vO1xuICAgICAgcG9pbnRzID0gY3VycmVudC56O1xuICAgICAgaXNTdWJqZWN0ID0gIWlzU3ViamVjdDtcbiAgICB9IHdoaWxlICghY3VycmVudC52KTtcbiAgICBzdHJlYW0ubGluZUVuZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxpbmsoYXJyYXkpIHtcbiAgaWYgKCEobiA9IGFycmF5Lmxlbmd0aCkpIHJldHVybjtcbiAgdmFyIG4sXG4gICAgICBpID0gMCxcbiAgICAgIGEgPSBhcnJheVswXSxcbiAgICAgIGI7XG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgYS5uID0gYiA9IGFycmF5W2ldO1xuICAgIGIucCA9IGE7XG4gICAgYSA9IGI7XG4gIH1cbiAgYS5uID0gYiA9IGFycmF5WzBdO1xuICBiLnAgPSBhO1xufVxuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtjYXJ0ZXNpYW4sIGNhcnRlc2lhbkNyb3NzLCBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlfSBmcm9tIFwiLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBlcHNpbG9uLCBlcHNpbG9uMiwgaGFsZlBpLCBwaSwgcXVhcnRlclBpLCBzaWduLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBsb25naXR1ZGUocG9pbnQpIHtcbiAgcmV0dXJuIGFicyhwb2ludFswXSkgPD0gcGkgPyBwb2ludFswXSA6IHNpZ24ocG9pbnRbMF0pICogKChhYnMocG9pbnRbMF0pICsgcGkpICUgdGF1IC0gcGkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwb2x5Z29uLCBwb2ludCkge1xuICB2YXIgbGFtYmRhID0gbG9uZ2l0dWRlKHBvaW50KSxcbiAgICAgIHBoaSA9IHBvaW50WzFdLFxuICAgICAgc2luUGhpID0gc2luKHBoaSksXG4gICAgICBub3JtYWwgPSBbc2luKGxhbWJkYSksIC1jb3MobGFtYmRhKSwgMF0sXG4gICAgICBhbmdsZSA9IDAsXG4gICAgICB3aW5kaW5nID0gMDtcblxuICB2YXIgc3VtID0gbmV3IEFkZGVyKCk7XG5cbiAgaWYgKHNpblBoaSA9PT0gMSkgcGhpID0gaGFsZlBpICsgZXBzaWxvbjtcbiAgZWxzZSBpZiAoc2luUGhpID09PSAtMSkgcGhpID0gLWhhbGZQaSAtIGVwc2lsb247XG5cbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2x5Z29uLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKG0gPSAocmluZyA9IHBvbHlnb25baV0pLmxlbmd0aCkpIGNvbnRpbnVlO1xuICAgIHZhciByaW5nLFxuICAgICAgICBtLFxuICAgICAgICBwb2ludDAgPSByaW5nW20gLSAxXSxcbiAgICAgICAgbGFtYmRhMCA9IGxvbmdpdHVkZShwb2ludDApLFxuICAgICAgICBwaGkwID0gcG9pbnQwWzFdIC8gMiArIHF1YXJ0ZXJQaSxcbiAgICAgICAgc2luUGhpMCA9IHNpbihwaGkwKSxcbiAgICAgICAgY29zUGhpMCA9IGNvcyhwaGkwKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbTsgKytqLCBsYW1iZGEwID0gbGFtYmRhMSwgc2luUGhpMCA9IHNpblBoaTEsIGNvc1BoaTAgPSBjb3NQaGkxLCBwb2ludDAgPSBwb2ludDEpIHtcbiAgICAgIHZhciBwb2ludDEgPSByaW5nW2pdLFxuICAgICAgICAgIGxhbWJkYTEgPSBsb25naXR1ZGUocG9pbnQxKSxcbiAgICAgICAgICBwaGkxID0gcG9pbnQxWzFdIC8gMiArIHF1YXJ0ZXJQaSxcbiAgICAgICAgICBzaW5QaGkxID0gc2luKHBoaTEpLFxuICAgICAgICAgIGNvc1BoaTEgPSBjb3MocGhpMSksXG4gICAgICAgICAgZGVsdGEgPSBsYW1iZGExIC0gbGFtYmRhMCxcbiAgICAgICAgICBzaWduID0gZGVsdGEgPj0gMCA/IDEgOiAtMSxcbiAgICAgICAgICBhYnNEZWx0YSA9IHNpZ24gKiBkZWx0YSxcbiAgICAgICAgICBhbnRpbWVyaWRpYW4gPSBhYnNEZWx0YSA+IHBpLFxuICAgICAgICAgIGsgPSBzaW5QaGkwICogc2luUGhpMTtcblxuICAgICAgc3VtLmFkZChhdGFuMihrICogc2lnbiAqIHNpbihhYnNEZWx0YSksIGNvc1BoaTAgKiBjb3NQaGkxICsgayAqIGNvcyhhYnNEZWx0YSkpKTtcbiAgICAgIGFuZ2xlICs9IGFudGltZXJpZGlhbiA/IGRlbHRhICsgc2lnbiAqIHRhdSA6IGRlbHRhO1xuXG4gICAgICAvLyBBcmUgdGhlIGxvbmdpdHVkZXMgZWl0aGVyIHNpZGUgb2YgdGhlIHBvaW50XHUyMDE5cyBtZXJpZGlhbiAobGFtYmRhKSxcbiAgICAgIC8vIGFuZCBhcmUgdGhlIGxhdGl0dWRlcyBzbWFsbGVyIHRoYW4gdGhlIHBhcmFsbGVsIChwaGkpP1xuICAgICAgaWYgKGFudGltZXJpZGlhbiBeIGxhbWJkYTAgPj0gbGFtYmRhIF4gbGFtYmRhMSA+PSBsYW1iZGEpIHtcbiAgICAgICAgdmFyIGFyYyA9IGNhcnRlc2lhbkNyb3NzKGNhcnRlc2lhbihwb2ludDApLCBjYXJ0ZXNpYW4ocG9pbnQxKSk7XG4gICAgICAgIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UoYXJjKTtcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbiA9IGNhcnRlc2lhbkNyb3NzKG5vcm1hbCwgYXJjKTtcbiAgICAgICAgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShpbnRlcnNlY3Rpb24pO1xuICAgICAgICB2YXIgcGhpQXJjID0gKGFudGltZXJpZGlhbiBeIGRlbHRhID49IDAgPyAtMSA6IDEpICogYXNpbihpbnRlcnNlY3Rpb25bMl0pO1xuICAgICAgICBpZiAocGhpID4gcGhpQXJjIHx8IHBoaSA9PT0gcGhpQXJjICYmIChhcmNbMF0gfHwgYXJjWzFdKSkge1xuICAgICAgICAgIHdpbmRpbmcgKz0gYW50aW1lcmlkaWFuIF4gZGVsdGEgPj0gMCA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEZpcnN0LCBkZXRlcm1pbmUgd2hldGhlciB0aGUgU291dGggcG9sZSBpcyBpbnNpZGUgb3Igb3V0c2lkZTpcbiAgLy9cbiAgLy8gSXQgaXMgaW5zaWRlIGlmOlxuICAvLyAqIHRoZSBwb2x5Z29uIHdpbmRzIGFyb3VuZCBpdCBpbiBhIGNsb2Nrd2lzZSBkaXJlY3Rpb24uXG4gIC8vICogdGhlIHBvbHlnb24gZG9lcyBub3QgKGN1bXVsYXRpdmVseSkgd2luZCBhcm91bmQgaXQsIGJ1dCBoYXMgYSBuZWdhdGl2ZVxuICAvLyAgIChjb3VudGVyLWNsb2Nrd2lzZSkgYXJlYS5cbiAgLy9cbiAgLy8gU2Vjb25kLCBjb3VudCB0aGUgKHNpZ25lZCkgbnVtYmVyIG9mIHRpbWVzIGEgc2VnbWVudCBjcm9zc2VzIGEgbGFtYmRhXG4gIC8vIGZyb20gdGhlIHBvaW50IHRvIHRoZSBTb3V0aCBwb2xlLiAgSWYgaXQgaXMgemVybywgdGhlbiB0aGUgcG9pbnQgaXMgdGhlXG4gIC8vIHNhbWUgc2lkZSBhcyB0aGUgU291dGggcG9sZS5cblxuICByZXR1cm4gKGFuZ2xlIDwgLWVwc2lsb24gfHwgYW5nbGUgPCBlcHNpbG9uICYmIHN1bSA8IC1lcHNpbG9uMikgXiAod2luZGluZyAmIDEpO1xufVxuIiwgImltcG9ydCBjbGlwQnVmZmVyIGZyb20gXCIuL2J1ZmZlci5qc1wiO1xuaW1wb3J0IGNsaXBSZWpvaW4gZnJvbSBcIi4vcmVqb2luLmpzXCI7XG5pbXBvcnQge2Vwc2lsb24sIGhhbGZQaX0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBwb2x5Z29uQ29udGFpbnMgZnJvbSBcIi4uL3BvbHlnb25Db250YWlucy5qc1wiO1xuaW1wb3J0IHttZXJnZX0gZnJvbSBcImQzLWFycmF5XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHBvaW50VmlzaWJsZSwgY2xpcExpbmUsIGludGVycG9sYXRlLCBzdGFydCkge1xuICByZXR1cm4gZnVuY3Rpb24oc2luaykge1xuICAgIHZhciBsaW5lID0gY2xpcExpbmUoc2luayksXG4gICAgICAgIHJpbmdCdWZmZXIgPSBjbGlwQnVmZmVyKCksXG4gICAgICAgIHJpbmdTaW5rID0gY2xpcExpbmUocmluZ0J1ZmZlciksXG4gICAgICAgIHBvbHlnb25TdGFydGVkID0gZmFsc2UsXG4gICAgICAgIHBvbHlnb24sXG4gICAgICAgIHNlZ21lbnRzLFxuICAgICAgICByaW5nO1xuXG4gICAgdmFyIGNsaXAgPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnRSaW5nO1xuICAgICAgICBjbGlwLmxpbmVTdGFydCA9IHJpbmdTdGFydDtcbiAgICAgICAgY2xpcC5saW5lRW5kID0gcmluZ0VuZDtcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgcG9seWdvbiA9IFtdO1xuICAgICAgfSxcbiAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgIGNsaXAubGluZVN0YXJ0ID0gbGluZVN0YXJ0O1xuICAgICAgICBjbGlwLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgICBzZWdtZW50cyA9IG1lcmdlKHNlZ21lbnRzKTtcbiAgICAgICAgdmFyIHN0YXJ0SW5zaWRlID0gcG9seWdvbkNvbnRhaW5zKHBvbHlnb24sIHN0YXJ0KTtcbiAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBjbGlwUmVqb2luKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHNpbmspO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0SW5zaWRlKSB7XG4gICAgICAgICAgaWYgKCFwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uU3RhcnQoKSwgcG9seWdvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgIHNpbmsubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc2luayk7XG4gICAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25FbmQoKSwgcG9seWdvblN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgc2VnbWVudHMgPSBwb2x5Z29uID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5rLnBvbHlnb25TdGFydCgpO1xuICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBzaW5rKTtcbiAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIHNpbmsucG9seWdvbkVuZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwb2ludChsYW1iZGEsIHBoaSkge1xuICAgICAgaWYgKHBvaW50VmlzaWJsZShsYW1iZGEsIHBoaSkpIHNpbmsucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvaW50TGluZShsYW1iZGEsIHBoaSkge1xuICAgICAgbGluZS5wb2ludChsYW1iZGEsIHBoaSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgY2xpcC5wb2ludCA9IHBvaW50TGluZTtcbiAgICAgIGxpbmUubGluZVN0YXJ0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIGNsaXAucG9pbnQgPSBwb2ludDtcbiAgICAgIGxpbmUubGluZUVuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvaW50UmluZyhsYW1iZGEsIHBoaSkge1xuICAgICAgcmluZy5wdXNoKFtsYW1iZGEsIHBoaV0pO1xuICAgICAgcmluZ1NpbmsucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdTdGFydCgpIHtcbiAgICAgIHJpbmdTaW5rLmxpbmVTdGFydCgpO1xuICAgICAgcmluZyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdFbmQoKSB7XG4gICAgICBwb2ludFJpbmcocmluZ1swXVswXSwgcmluZ1swXVsxXSk7XG4gICAgICByaW5nU2luay5saW5lRW5kKCk7XG5cbiAgICAgIHZhciBjbGVhbiA9IHJpbmdTaW5rLmNsZWFuKCksXG4gICAgICAgICAgcmluZ1NlZ21lbnRzID0gcmluZ0J1ZmZlci5yZXN1bHQoKSxcbiAgICAgICAgICBpLCBuID0gcmluZ1NlZ21lbnRzLmxlbmd0aCwgbSxcbiAgICAgICAgICBzZWdtZW50LFxuICAgICAgICAgIHBvaW50O1xuXG4gICAgICByaW5nLnBvcCgpO1xuICAgICAgcG9seWdvbi5wdXNoKHJpbmcpO1xuICAgICAgcmluZyA9IG51bGw7XG5cbiAgICAgIGlmICghbikgcmV0dXJuO1xuXG4gICAgICAvLyBObyBpbnRlcnNlY3Rpb25zLlxuICAgICAgaWYgKGNsZWFuICYgMSkge1xuICAgICAgICBzZWdtZW50ID0gcmluZ1NlZ21lbnRzWzBdO1xuICAgICAgICBpZiAoKG0gPSBzZWdtZW50Lmxlbmd0aCAtIDEpID4gMCkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIHNpbmsucG9pbnQoKHBvaW50ID0gc2VnbWVudFtpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgICBzaW5rLmxpbmVFbmQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFJlam9pbiBjb25uZWN0ZWQgc2VnbWVudHMuXG4gICAgICAvLyBUT0RPIHJldXNlIHJpbmdCdWZmZXIucmVqb2luKCk/XG4gICAgICBpZiAobiA+IDEgJiYgY2xlYW4gJiAyKSByaW5nU2VnbWVudHMucHVzaChyaW5nU2VnbWVudHMucG9wKCkuY29uY2F0KHJpbmdTZWdtZW50cy5zaGlmdCgpKSk7XG5cbiAgICAgIHNlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLmZpbHRlcih2YWxpZFNlZ21lbnQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xpcDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRTZWdtZW50KHNlZ21lbnQpIHtcbiAgcmV0dXJuIHNlZ21lbnQubGVuZ3RoID4gMTtcbn1cblxuLy8gSW50ZXJzZWN0aW9ucyBhcmUgc29ydGVkIGFsb25nIHRoZSBjbGlwIGVkZ2UuIEZvciBib3RoIGFudGltZXJpZGlhbiBjdXR0aW5nXG4vLyBhbmQgY2lyY2xlIGNsaXBwaW5nLCB0aGUgc2FtZSBjb21wYXJpc29uIGlzIHVzZWQuXG5mdW5jdGlvbiBjb21wYXJlSW50ZXJzZWN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuICgoYSA9IGEueClbMF0gPCAwID8gYVsxXSAtIGhhbGZQaSAtIGVwc2lsb24gOiBoYWxmUGkgLSBhWzFdKVxuICAgICAgIC0gKChiID0gYi54KVswXSA8IDAgPyBiWzFdIC0gaGFsZlBpIC0gZXBzaWxvbiA6IGhhbGZQaSAtIGJbMV0pO1xufVxuIiwgImltcG9ydCBjbGlwIGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge2FicywgYXRhbiwgY29zLCBlcHNpbG9uLCBoYWxmUGksIHBpLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsaXAoXG4gIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgY2xpcEFudGltZXJpZGlhbkxpbmUsXG4gIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnBvbGF0ZSxcbiAgWy1waSwgLWhhbGZQaV1cbik7XG5cbi8vIFRha2VzIGEgbGluZSBhbmQgY3V0cyBpbnRvIHZpc2libGUgc2VnbWVudHMuIFJldHVybiB2YWx1ZXM6IDAgLSB0aGVyZSB3ZXJlXG4vLyBpbnRlcnNlY3Rpb25zIG9yIHRoZSBsaW5lIHdhcyBlbXB0eTsgMSAtIG5vIGludGVyc2VjdGlvbnM7IDIgLSB0aGVyZSB3ZXJlXG4vLyBpbnRlcnNlY3Rpb25zLCBhbmQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzIHNob3VsZCBiZSByZWpvaW5lZC5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5MaW5lKHN0cmVhbSkge1xuICB2YXIgbGFtYmRhMCA9IE5hTixcbiAgICAgIHBoaTAgPSBOYU4sXG4gICAgICBzaWduMCA9IE5hTixcbiAgICAgIGNsZWFuOyAvLyBubyBpbnRlcnNlY3Rpb25zXG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgY2xlYW4gPSAxO1xuICAgIH0sXG4gICAgcG9pbnQ6IGZ1bmN0aW9uKGxhbWJkYTEsIHBoaTEpIHtcbiAgICAgIHZhciBzaWduMSA9IGxhbWJkYTEgPiAwID8gcGkgOiAtcGksXG4gICAgICAgICAgZGVsdGEgPSBhYnMobGFtYmRhMSAtIGxhbWJkYTApO1xuICAgICAgaWYgKGFicyhkZWx0YSAtIHBpKSA8IGVwc2lsb24pIHsgLy8gbGluZSBjcm9zc2VzIGEgcG9sZVxuICAgICAgICBzdHJlYW0ucG9pbnQobGFtYmRhMCwgcGhpMCA9IChwaGkwICsgcGhpMSkgLyAyID4gMCA/IGhhbGZQaSA6IC1oYWxmUGkpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjAsIHBoaTApO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMSwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChsYW1iZGExLCBwaGkwKTtcbiAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgfSBlbHNlIGlmIChzaWduMCAhPT0gc2lnbjEgJiYgZGVsdGEgPj0gcGkpIHsgLy8gbGluZSBjcm9zc2VzIGFudGltZXJpZGlhblxuICAgICAgICBpZiAoYWJzKGxhbWJkYTAgLSBzaWduMCkgPCBlcHNpbG9uKSBsYW1iZGEwIC09IHNpZ24wICogZXBzaWxvbjsgLy8gaGFuZGxlIGRlZ2VuZXJhY2llc1xuICAgICAgICBpZiAoYWJzKGxhbWJkYTEgLSBzaWduMSkgPCBlcHNpbG9uKSBsYW1iZGExIC09IHNpZ24xICogZXBzaWxvbjtcbiAgICAgICAgcGhpMCA9IGNsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QobGFtYmRhMCwgcGhpMCwgbGFtYmRhMSwgcGhpMSk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMCwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24xLCBwaGkwKTtcbiAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgfVxuICAgICAgc3RyZWFtLnBvaW50KGxhbWJkYTAgPSBsYW1iZGExLCBwaGkwID0gcGhpMSk7XG4gICAgICBzaWduMCA9IHNpZ24xO1xuICAgIH0sXG4gICAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgbGFtYmRhMCA9IHBoaTAgPSBOYU47XG4gICAgfSxcbiAgICBjbGVhbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMiAtIGNsZWFuOyAvLyBpZiBpbnRlcnNlY3Rpb25zLCByZWpvaW4gZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QobGFtYmRhMCwgcGhpMCwgbGFtYmRhMSwgcGhpMSkge1xuICB2YXIgY29zUGhpMCxcbiAgICAgIGNvc1BoaTEsXG4gICAgICBzaW5MYW1iZGEwTGFtYmRhMSA9IHNpbihsYW1iZGEwIC0gbGFtYmRhMSk7XG4gIHJldHVybiBhYnMoc2luTGFtYmRhMExhbWJkYTEpID4gZXBzaWxvblxuICAgICAgPyBhdGFuKChzaW4ocGhpMCkgKiAoY29zUGhpMSA9IGNvcyhwaGkxKSkgKiBzaW4obGFtYmRhMSlcbiAgICAgICAgICAtIHNpbihwaGkxKSAqIChjb3NQaGkwID0gY29zKHBoaTApKSAqIHNpbihsYW1iZGEwKSlcbiAgICAgICAgICAvIChjb3NQaGkwICogY29zUGhpMSAqIHNpbkxhbWJkYTBMYW1iZGExKSlcbiAgICAgIDogKHBoaTAgKyBwaGkxKSAvIDI7XG59XG5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnBvbGF0ZShmcm9tLCB0bywgZGlyZWN0aW9uLCBzdHJlYW0pIHtcbiAgdmFyIHBoaTtcbiAgaWYgKGZyb20gPT0gbnVsbCkge1xuICAgIHBoaSA9IGRpcmVjdGlvbiAqIGhhbGZQaTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludChwaSwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIDApO1xuICAgIHN0cmVhbS5wb2ludChwaSwgLXBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIDApO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIHBoaSk7XG4gIH0gZWxzZSBpZiAoYWJzKGZyb21bMF0gLSB0b1swXSkgPiBlcHNpbG9uKSB7XG4gICAgdmFyIGxhbWJkYSA9IGZyb21bMF0gPCB0b1swXSA/IHBpIDogLXBpO1xuICAgIHBoaSA9IGRpcmVjdGlvbiAqIGxhbWJkYSAvIDI7XG4gICAgc3RyZWFtLnBvaW50KC1sYW1iZGEsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgfSBlbHNlIHtcbiAgICBzdHJlYW0ucG9pbnQodG9bMF0sIHRvWzFdKTtcbiAgfVxufVxuIiwgImltcG9ydCB7Y2FydGVzaWFuLCBjYXJ0ZXNpYW5BZGRJblBsYWNlLCBjYXJ0ZXNpYW5Dcm9zcywgY2FydGVzaWFuRG90LCBjYXJ0ZXNpYW5TY2FsZSwgc3BoZXJpY2FsfSBmcm9tIFwiLi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2NpcmNsZVN0cmVhbX0gZnJvbSBcIi4uL2NpcmNsZS5qc1wiO1xuaW1wb3J0IHthYnMsIGNvcywgZXBzaWxvbiwgcGksIHJhZGlhbnMsIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgcG9pbnRFcXVhbCBmcm9tIFwiLi4vcG9pbnRFcXVhbC5qc1wiO1xuaW1wb3J0IGNsaXAgZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocmFkaXVzKSB7XG4gIHZhciBjciA9IGNvcyhyYWRpdXMpLFxuICAgICAgZGVsdGEgPSAyICogcmFkaWFucyxcbiAgICAgIHNtYWxsUmFkaXVzID0gY3IgPiAwLFxuICAgICAgbm90SGVtaXNwaGVyZSA9IGFicyhjcikgPiBlcHNpbG9uOyAvLyBUT0RPIG9wdGltaXNlIGZvciB0aGlzIGNvbW1vbiBjYXNlXG5cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gICAgY2lyY2xlU3RyZWFtKHN0cmVhbSwgcmFkaXVzLCBkZWx0YSwgZGlyZWN0aW9uLCBmcm9tLCB0byk7XG4gIH1cblxuICBmdW5jdGlvbiB2aXNpYmxlKGxhbWJkYSwgcGhpKSB7XG4gICAgcmV0dXJuIGNvcyhsYW1iZGEpICogY29zKHBoaSkgPiBjcjtcbiAgfVxuXG4gIC8vIFRha2VzIGEgbGluZSBhbmQgY3V0cyBpbnRvIHZpc2libGUgc2VnbWVudHMuIFJldHVybiB2YWx1ZXMgdXNlZCBmb3IgcG9seWdvblxuICAvLyBjbGlwcGluZzogMCAtIHRoZXJlIHdlcmUgaW50ZXJzZWN0aW9ucyBvciB0aGUgbGluZSB3YXMgZW1wdHk7IDEgLSBub1xuICAvLyBpbnRlcnNlY3Rpb25zIDIgLSB0aGVyZSB3ZXJlIGludGVyc2VjdGlvbnMsIGFuZCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgLy8gc2hvdWxkIGJlIHJlam9pbmVkLlxuICBmdW5jdGlvbiBjbGlwTGluZShzdHJlYW0pIHtcbiAgICB2YXIgcG9pbnQwLCAvLyBwcmV2aW91cyBwb2ludFxuICAgICAgICBjMCwgLy8gY29kZSBmb3IgcHJldmlvdXMgcG9pbnRcbiAgICAgICAgdjAsIC8vIHZpc2liaWxpdHkgb2YgcHJldmlvdXMgcG9pbnRcbiAgICAgICAgdjAwLCAvLyB2aXNpYmlsaXR5IG9mIGZpcnN0IHBvaW50XG4gICAgICAgIGNsZWFuOyAvLyBubyBpbnRlcnNlY3Rpb25zXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHYwMCA9IHYwID0gZmFsc2U7XG4gICAgICAgIGNsZWFuID0gMTtcbiAgICAgIH0sXG4gICAgICBwb2ludDogZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICAgICAgdmFyIHBvaW50MSA9IFtsYW1iZGEsIHBoaV0sXG4gICAgICAgICAgICBwb2ludDIsXG4gICAgICAgICAgICB2ID0gdmlzaWJsZShsYW1iZGEsIHBoaSksXG4gICAgICAgICAgICBjID0gc21hbGxSYWRpdXNcbiAgICAgICAgICAgICAgPyB2ID8gMCA6IGNvZGUobGFtYmRhLCBwaGkpXG4gICAgICAgICAgICAgIDogdiA/IGNvZGUobGFtYmRhICsgKGxhbWJkYSA8IDAgPyBwaSA6IC1waSksIHBoaSkgOiAwO1xuICAgICAgICBpZiAoIXBvaW50MCAmJiAodjAwID0gdjAgPSB2KSkgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBpZiAodiAhPT0gdjApIHtcbiAgICAgICAgICBwb2ludDIgPSBpbnRlcnNlY3QocG9pbnQwLCBwb2ludDEpO1xuICAgICAgICAgIGlmICghcG9pbnQyIHx8IHBvaW50RXF1YWwocG9pbnQwLCBwb2ludDIpIHx8IHBvaW50RXF1YWwocG9pbnQxLCBwb2ludDIpKVxuICAgICAgICAgICAgcG9pbnQxWzJdID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodiAhPT0gdjApIHtcbiAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIC8vIG91dHNpZGUgZ29pbmcgaW5cbiAgICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDEsIHBvaW50MCk7XG4gICAgICAgICAgICBzdHJlYW0ucG9pbnQocG9pbnQyWzBdLCBwb2ludDJbMV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpbnNpZGUgZ29pbmcgb3V0XG4gICAgICAgICAgICBwb2ludDIgPSBpbnRlcnNlY3QocG9pbnQwLCBwb2ludDEpO1xuICAgICAgICAgICAgc3RyZWFtLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdLCAyKTtcbiAgICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50MCA9IHBvaW50MjtcbiAgICAgICAgfSBlbHNlIGlmIChub3RIZW1pc3BoZXJlICYmIHBvaW50MCAmJiBzbWFsbFJhZGl1cyBeIHYpIHtcbiAgICAgICAgICB2YXIgdDtcbiAgICAgICAgICAvLyBJZiB0aGUgY29kZXMgZm9yIHR3byBwb2ludHMgYXJlIGRpZmZlcmVudCwgb3IgYXJlIGJvdGggemVybyxcbiAgICAgICAgICAvLyBhbmQgdGhlcmUgdGhpcyBzZWdtZW50IGludGVyc2VjdHMgd2l0aCB0aGUgc21hbGwgY2lyY2xlLlxuICAgICAgICAgIGlmICghKGMgJiBjMCkgJiYgKHQgPSBpbnRlcnNlY3QocG9pbnQxLCBwb2ludDAsIHRydWUpKSkge1xuICAgICAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgICAgICAgaWYgKHNtYWxsUmFkaXVzKSB7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMF1bMF0sIHRbMF1bMV0pO1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFsxXVswXSwgdFsxXVsxXSk7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFsxXVswXSwgdFsxXVsxXSk7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMF1bMF0sIHRbMF1bMV0sIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodiAmJiAoIXBvaW50MCB8fCAhcG9pbnRFcXVhbChwb2ludDAsIHBvaW50MSkpKSB7XG4gICAgICAgICAgc3RyZWFtLnBvaW50KHBvaW50MVswXSwgcG9pbnQxWzFdKTtcbiAgICAgICAgfVxuICAgICAgICBwb2ludDAgPSBwb2ludDEsIHYwID0gdiwgYzAgPSBjO1xuICAgICAgfSxcbiAgICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodjApIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHBvaW50MCA9IG51bGw7XG4gICAgICB9LFxuICAgICAgLy8gUmVqb2luIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzIGlmIHRoZXJlIHdlcmUgaW50ZXJzZWN0aW9ucyBhbmQgdGhlIGZpcnN0XG4gICAgICAvLyBhbmQgbGFzdCBwb2ludHMgd2VyZSB2aXNpYmxlLlxuICAgICAgY2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2xlYW4gfCAoKHYwMCAmJiB2MCkgPDwgMSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIEludGVyc2VjdHMgdGhlIGdyZWF0IGNpcmNsZSBiZXR3ZWVuIGEgYW5kIGIgd2l0aCB0aGUgY2xpcCBjaXJjbGUuXG4gIGZ1bmN0aW9uIGludGVyc2VjdChhLCBiLCB0d28pIHtcbiAgICB2YXIgcGEgPSBjYXJ0ZXNpYW4oYSksXG4gICAgICAgIHBiID0gY2FydGVzaWFuKGIpO1xuXG4gICAgLy8gV2UgaGF2ZSB0d28gcGxhbmVzLCBuMS5wID0gZDEgYW5kIG4yLnAgPSBkMi5cbiAgICAvLyBGaW5kIGludGVyc2VjdGlvbiBsaW5lIHAodCkgPSBjMSBuMSArIGMyIG4yICsgdCAobjEgXHUyQTJGIG4yKS5cbiAgICB2YXIgbjEgPSBbMSwgMCwgMF0sIC8vIG5vcm1hbFxuICAgICAgICBuMiA9IGNhcnRlc2lhbkNyb3NzKHBhLCBwYiksXG4gICAgICAgIG4ybjIgPSBjYXJ0ZXNpYW5Eb3QobjIsIG4yKSxcbiAgICAgICAgbjFuMiA9IG4yWzBdLCAvLyBjYXJ0ZXNpYW5Eb3QobjEsIG4yKSxcbiAgICAgICAgZGV0ZXJtaW5hbnQgPSBuMm4yIC0gbjFuMiAqIG4xbjI7XG5cbiAgICAvLyBUd28gcG9sYXIgcG9pbnRzLlxuICAgIGlmICghZGV0ZXJtaW5hbnQpIHJldHVybiAhdHdvICYmIGE7XG5cbiAgICB2YXIgYzEgPSAgY3IgKiBuMm4yIC8gZGV0ZXJtaW5hbnQsXG4gICAgICAgIGMyID0gLWNyICogbjFuMiAvIGRldGVybWluYW50LFxuICAgICAgICBuMXhuMiA9IGNhcnRlc2lhbkNyb3NzKG4xLCBuMiksXG4gICAgICAgIEEgPSBjYXJ0ZXNpYW5TY2FsZShuMSwgYzEpLFxuICAgICAgICBCID0gY2FydGVzaWFuU2NhbGUobjIsIGMyKTtcbiAgICBjYXJ0ZXNpYW5BZGRJblBsYWNlKEEsIEIpO1xuXG4gICAgLy8gU29sdmUgfHAodCl8XjIgPSAxLlxuICAgIHZhciB1ID0gbjF4bjIsXG4gICAgICAgIHcgPSBjYXJ0ZXNpYW5Eb3QoQSwgdSksXG4gICAgICAgIHV1ID0gY2FydGVzaWFuRG90KHUsIHUpLFxuICAgICAgICB0MiA9IHcgKiB3IC0gdXUgKiAoY2FydGVzaWFuRG90KEEsIEEpIC0gMSk7XG5cbiAgICBpZiAodDIgPCAwKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IHNxcnQodDIpLFxuICAgICAgICBxID0gY2FydGVzaWFuU2NhbGUodSwgKC13IC0gdCkgLyB1dSk7XG4gICAgY2FydGVzaWFuQWRkSW5QbGFjZShxLCBBKTtcbiAgICBxID0gc3BoZXJpY2FsKHEpO1xuXG4gICAgaWYgKCF0d28pIHJldHVybiBxO1xuXG4gICAgLy8gVHdvIGludGVyc2VjdGlvbiBwb2ludHMuXG4gICAgdmFyIGxhbWJkYTAgPSBhWzBdLFxuICAgICAgICBsYW1iZGExID0gYlswXSxcbiAgICAgICAgcGhpMCA9IGFbMV0sXG4gICAgICAgIHBoaTEgPSBiWzFdLFxuICAgICAgICB6O1xuXG4gICAgaWYgKGxhbWJkYTEgPCBsYW1iZGEwKSB6ID0gbGFtYmRhMCwgbGFtYmRhMCA9IGxhbWJkYTEsIGxhbWJkYTEgPSB6O1xuXG4gICAgdmFyIGRlbHRhID0gbGFtYmRhMSAtIGxhbWJkYTAsXG4gICAgICAgIHBvbGFyID0gYWJzKGRlbHRhIC0gcGkpIDwgZXBzaWxvbixcbiAgICAgICAgbWVyaWRpYW4gPSBwb2xhciB8fCBkZWx0YSA8IGVwc2lsb247XG5cbiAgICBpZiAoIXBvbGFyICYmIHBoaTEgPCBwaGkwKSB6ID0gcGhpMCwgcGhpMCA9IHBoaTEsIHBoaTEgPSB6O1xuXG4gICAgLy8gQ2hlY2sgdGhhdCB0aGUgZmlyc3QgcG9pbnQgaXMgYmV0d2VlbiBhIGFuZCBiLlxuICAgIGlmIChtZXJpZGlhblxuICAgICAgICA/IHBvbGFyXG4gICAgICAgICAgPyBwaGkwICsgcGhpMSA+IDAgXiBxWzFdIDwgKGFicyhxWzBdIC0gbGFtYmRhMCkgPCBlcHNpbG9uID8gcGhpMCA6IHBoaTEpXG4gICAgICAgICAgOiBwaGkwIDw9IHFbMV0gJiYgcVsxXSA8PSBwaGkxXG4gICAgICAgIDogZGVsdGEgPiBwaSBeIChsYW1iZGEwIDw9IHFbMF0gJiYgcVswXSA8PSBsYW1iZGExKSkge1xuICAgICAgdmFyIHExID0gY2FydGVzaWFuU2NhbGUodSwgKC13ICsgdCkgLyB1dSk7XG4gICAgICBjYXJ0ZXNpYW5BZGRJblBsYWNlKHExLCBBKTtcbiAgICAgIHJldHVybiBbcSwgc3BoZXJpY2FsKHExKV07XG4gICAgfVxuICB9XG5cbiAgLy8gR2VuZXJhdGVzIGEgNC1iaXQgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYXRpb24gb2YgYSBwb2ludCByZWxhdGl2ZSB0b1xuICAvLyB0aGUgc21hbGwgY2lyY2xlJ3MgYm91bmRpbmcgYm94LlxuICBmdW5jdGlvbiBjb2RlKGxhbWJkYSwgcGhpKSB7XG4gICAgdmFyIHIgPSBzbWFsbFJhZGl1cyA/IHJhZGl1cyA6IHBpIC0gcmFkaXVzLFxuICAgICAgICBjb2RlID0gMDtcbiAgICBpZiAobGFtYmRhIDwgLXIpIGNvZGUgfD0gMTsgLy8gbGVmdFxuICAgIGVsc2UgaWYgKGxhbWJkYSA+IHIpIGNvZGUgfD0gMjsgLy8gcmlnaHRcbiAgICBpZiAocGhpIDwgLXIpIGNvZGUgfD0gNDsgLy8gYmVsb3dcbiAgICBlbHNlIGlmIChwaGkgPiByKSBjb2RlIHw9IDg7IC8vIGFib3ZlXG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cblxuICByZXR1cm4gY2xpcCh2aXNpYmxlLCBjbGlwTGluZSwgaW50ZXJwb2xhdGUsIHNtYWxsUmFkaXVzID8gWzAsIC1yYWRpdXNdIDogWy1waSwgcmFkaXVzIC0gcGldKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiLCB4MCwgeTAsIHgxLCB5MSkge1xuICB2YXIgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdLFxuICAgICAgYnggPSBiWzBdLFxuICAgICAgYnkgPSBiWzFdLFxuICAgICAgdDAgPSAwLFxuICAgICAgdDEgPSAxLFxuICAgICAgZHggPSBieCAtIGF4LFxuICAgICAgZHkgPSBieSAtIGF5LFxuICAgICAgcjtcblxuICByID0geDAgLSBheDtcbiAgaWYgKCFkeCAmJiByID4gMCkgcmV0dXJuO1xuICByIC89IGR4O1xuICBpZiAoZHggPCAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfSBlbHNlIGlmIChkeCA+IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9XG5cbiAgciA9IHgxIC0gYXg7XG4gIGlmICghZHggJiYgciA8IDApIHJldHVybjtcbiAgciAvPSBkeDtcbiAgaWYgKGR4IDwgMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfVxuXG4gIHIgPSB5MCAtIGF5O1xuICBpZiAoIWR5ICYmIHIgPiAwKSByZXR1cm47XG4gIHIgLz0gZHk7XG4gIGlmIChkeSA8IDApIHtcbiAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICB9IGVsc2UgaWYgKGR5ID4gMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH1cblxuICByID0geTEgLSBheTtcbiAgaWYgKCFkeSAmJiByIDwgMCkgcmV0dXJuO1xuICByIC89IGR5O1xuICBpZiAoZHkgPCAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfSBlbHNlIGlmIChkeSA+IDApIHtcbiAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICB9XG5cbiAgaWYgKHQwID4gMCkgYVswXSA9IGF4ICsgdDAgKiBkeCwgYVsxXSA9IGF5ICsgdDAgKiBkeTtcbiAgaWYgKHQxIDwgMSkgYlswXSA9IGF4ICsgdDEgKiBkeCwgYlsxXSA9IGF5ICsgdDEgKiBkeTtcbiAgcmV0dXJuIHRydWU7XG59XG4iLCAiaW1wb3J0IHthYnMsIGVwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgY2xpcEJ1ZmZlciBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmltcG9ydCBjbGlwTGluZSBmcm9tIFwiLi9saW5lLmpzXCI7XG5pbXBvcnQgY2xpcFJlam9pbiBmcm9tIFwiLi9yZWpvaW4uanNcIjtcbmltcG9ydCB7bWVyZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuXG52YXIgY2xpcE1heCA9IDFlOSwgY2xpcE1pbiA9IC1jbGlwTWF4O1xuXG4vLyBUT0RPIFVzZSBkMy1wb2x5Z29uXHUyMDE5cyBwb2x5Z29uQ29udGFpbnMgaGVyZSBmb3IgdGhlIHJpbmcgY2hlY2s/XG4vLyBUT0RPIEVsaW1pbmF0ZSBkdXBsaWNhdGUgYnVmZmVyaW5nIGluIGNsaXBCdWZmZXIgYW5kIHBvbHlnb24ucHVzaD9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2xpcFJlY3RhbmdsZSh4MCwgeTAsIHgxLCB5MSkge1xuXG4gIGZ1bmN0aW9uIHZpc2libGUoeCwgeSkge1xuICAgIHJldHVybiB4MCA8PSB4ICYmIHggPD0geDEgJiYgeTAgPD0geSAmJiB5IDw9IHkxO1xuICB9XG5cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gICAgdmFyIGEgPSAwLCBhMSA9IDA7XG4gICAgaWYgKGZyb20gPT0gbnVsbFxuICAgICAgICB8fCAoYSA9IGNvcm5lcihmcm9tLCBkaXJlY3Rpb24pKSAhPT0gKGExID0gY29ybmVyKHRvLCBkaXJlY3Rpb24pKVxuICAgICAgICB8fCBjb21wYXJlUG9pbnQoZnJvbSwgdG8pIDwgMCBeIGRpcmVjdGlvbiA+IDApIHtcbiAgICAgIGRvIHN0cmVhbS5wb2ludChhID09PSAwIHx8IGEgPT09IDMgPyB4MCA6IHgxLCBhID4gMSA/IHkxIDogeTApO1xuICAgICAgd2hpbGUgKChhID0gKGEgKyBkaXJlY3Rpb24gKyA0KSAlIDQpICE9PSBhMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcm5lcihwLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gYWJzKHBbMF0gLSB4MCkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDAgOiAzXG4gICAgICAgIDogYWJzKHBbMF0gLSB4MSkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDIgOiAxXG4gICAgICAgIDogYWJzKHBbMV0gLSB5MCkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDEgOiAwXG4gICAgICAgIDogZGlyZWN0aW9uID4gMCA/IDMgOiAyOyAvLyBhYnMocFsxXSAtIHkxKSA8IGVwc2lsb25cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVJbnRlcnNlY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBjb21wYXJlUG9pbnQoYS54LCBiLngpO1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcGFyZVBvaW50KGEsIGIpIHtcbiAgICB2YXIgY2EgPSBjb3JuZXIoYSwgMSksXG4gICAgICAgIGNiID0gY29ybmVyKGIsIDEpO1xuICAgIHJldHVybiBjYSAhPT0gY2IgPyBjYSAtIGNiXG4gICAgICAgIDogY2EgPT09IDAgPyBiWzFdIC0gYVsxXVxuICAgICAgICA6IGNhID09PSAxID8gYVswXSAtIGJbMF1cbiAgICAgICAgOiBjYSA9PT0gMiA/IGFbMV0gLSBiWzFdXG4gICAgICAgIDogYlswXSAtIGFbMF07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIGFjdGl2ZVN0cmVhbSA9IHN0cmVhbSxcbiAgICAgICAgYnVmZmVyU3RyZWFtID0gY2xpcEJ1ZmZlcigpLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgcG9seWdvbixcbiAgICAgICAgcmluZyxcbiAgICAgICAgeF9fLCB5X18sIHZfXywgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgeF8sIHlfLCB2XywgLy8gcHJldmlvdXMgcG9pbnRcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGNsZWFuO1xuXG4gICAgdmFyIGNsaXBTdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IHBvbHlnb25TdGFydCxcbiAgICAgIHBvbHlnb25FbmQ6IHBvbHlnb25FbmRcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgICAgaWYgKHZpc2libGUoeCwgeSkpIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2x5Z29uSW5zaWRlKCkge1xuICAgICAgdmFyIHdpbmRpbmcgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHBvbHlnb24ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIHJpbmcgPSBwb2x5Z29uW2ldLCBqID0gMSwgbSA9IHJpbmcubGVuZ3RoLCBwb2ludCA9IHJpbmdbMF0sIGEwLCBhMSwgYjAgPSBwb2ludFswXSwgYjEgPSBwb2ludFsxXTsgaiA8IG07ICsraikge1xuICAgICAgICAgIGEwID0gYjAsIGExID0gYjEsIHBvaW50ID0gcmluZ1tqXSwgYjAgPSBwb2ludFswXSwgYjEgPSBwb2ludFsxXTtcbiAgICAgICAgICBpZiAoYTEgPD0geTEpIHsgaWYgKGIxID4geTEgJiYgKGIwIC0gYTApICogKHkxIC0gYTEpID4gKGIxIC0gYTEpICogKHgwIC0gYTApKSArK3dpbmRpbmc7IH1cbiAgICAgICAgICBlbHNlIHsgaWYgKGIxIDw9IHkxICYmIChiMCAtIGEwKSAqICh5MSAtIGExKSA8IChiMSAtIGExKSAqICh4MCAtIGEwKSkgLS13aW5kaW5nOyB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHdpbmRpbmc7XG4gICAgfVxuXG4gICAgLy8gQnVmZmVyIGdlb21ldHJ5IHdpdGhpbiBhIHBvbHlnb24gYW5kIHRoZW4gY2xpcCBpdCBlbiBtYXNzZS5cbiAgICBmdW5jdGlvbiBwb2x5Z29uU3RhcnQoKSB7XG4gICAgICBhY3RpdmVTdHJlYW0gPSBidWZmZXJTdHJlYW0sIHNlZ21lbnRzID0gW10sIHBvbHlnb24gPSBbXSwgY2xlYW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvbHlnb25FbmQoKSB7XG4gICAgICB2YXIgc3RhcnRJbnNpZGUgPSBwb2x5Z29uSW5zaWRlKCksXG4gICAgICAgICAgY2xlYW5JbnNpZGUgPSBjbGVhbiAmJiBzdGFydEluc2lkZSxcbiAgICAgICAgICB2aXNpYmxlID0gKHNlZ21lbnRzID0gbWVyZ2Uoc2VnbWVudHMpKS5sZW5ndGg7XG4gICAgICBpZiAoY2xlYW5JbnNpZGUgfHwgdmlzaWJsZSkge1xuICAgICAgICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICAgIGlmIChjbGVhbkluc2lkZSkge1xuICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBzdHJlYW0pO1xuICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICBjbGlwUmVqb2luKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICAgIGFjdGl2ZVN0cmVhbSA9IHN0cmVhbSwgc2VnbWVudHMgPSBwb2x5Z29uID0gcmluZyA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgY2xpcFN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICAgIGlmIChwb2x5Z29uKSBwb2x5Z29uLnB1c2gocmluZyA9IFtdKTtcbiAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgIHZfID0gZmFsc2U7XG4gICAgICB4XyA9IHlfID0gTmFOO1xuICAgIH1cblxuICAgIC8vIFRPRE8gcmF0aGVyIHRoYW4gc3BlY2lhbC1jYXNlIHBvbHlnb25zLCBzaW1wbHkgaGFuZGxlIHRoZW0gc2VwYXJhdGVseS5cbiAgICAvLyBJZGVhbGx5LCBjb2luY2lkZW50IGludGVyc2VjdGlvbiBwb2ludHMgc2hvdWxkIGJlIGppdHRlcmVkIHRvIGF2b2lkXG4gICAgLy8gY2xpcHBpbmcgaXNzdWVzLlxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBpZiAoc2VnbWVudHMpIHtcbiAgICAgICAgbGluZVBvaW50KHhfXywgeV9fKTtcbiAgICAgICAgaWYgKHZfXyAmJiB2XykgYnVmZmVyU3RyZWFtLnJlam9pbigpO1xuICAgICAgICBzZWdtZW50cy5wdXNoKGJ1ZmZlclN0cmVhbS5yZXN1bHQoKSk7XG4gICAgICB9XG4gICAgICBjbGlwU3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgICBpZiAodl8pIGFjdGl2ZVN0cmVhbS5saW5lRW5kKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVBvaW50KHgsIHkpIHtcbiAgICAgIHZhciB2ID0gdmlzaWJsZSh4LCB5KTtcbiAgICAgIGlmIChwb2x5Z29uKSByaW5nLnB1c2goW3gsIHldKTtcbiAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICB4X18gPSB4LCB5X18gPSB5LCB2X18gPSB2O1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAodikge1xuICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh2ICYmIHZfKSBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBhID0gW3hfID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeF8pKSwgeV8gPSBNYXRoLm1heChjbGlwTWluLCBNYXRoLm1pbihjbGlwTWF4LCB5XykpXSxcbiAgICAgICAgICAgICAgYiA9IFt4ID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeCkpLCB5ID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeSkpXTtcbiAgICAgICAgICBpZiAoY2xpcExpbmUoYSwgYiwgeDAsIHkwLCB4MSwgeTEpKSB7XG4gICAgICAgICAgICBpZiAoIXZfKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KGFbMF0sIGFbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KGJbMF0sIGJbMV0pO1xuICAgICAgICAgICAgaWYgKCF2KSBhY3RpdmVTdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgY2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHYpIHtcbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB4XyA9IHgsIHlfID0geSwgdl8gPSB2O1xuICAgIH1cblxuICAgIHJldHVybiBjbGlwU3RyZWFtO1xuICB9O1xufVxuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnMsIGF0YW4yLCBjb3MsIHJhZGlhbnMsIHNpbiwgc3FydH0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4vbm9vcC5qc1wiO1xuaW1wb3J0IHN0cmVhbSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcblxudmFyIGxlbmd0aFN1bSxcbiAgICBsYW1iZGEwLFxuICAgIHNpblBoaTAsXG4gICAgY29zUGhpMDtcblxudmFyIGxlbmd0aFN0cmVhbSA9IHtcbiAgc3BoZXJlOiBub29wLFxuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBsZW5ndGhMaW5lU3RhcnQsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogbm9vcCxcbiAgcG9seWdvbkVuZDogbm9vcFxufTtcblxuZnVuY3Rpb24gbGVuZ3RoTGluZVN0YXJ0KCkge1xuICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhQb2ludEZpcnN0O1xuICBsZW5ndGhTdHJlYW0ubGluZUVuZCA9IGxlbmd0aExpbmVFbmQ7XG59XG5cbmZ1bmN0aW9uIGxlbmd0aExpbmVFbmQoKSB7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFN0cmVhbS5saW5lRW5kID0gbm9vcDtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnRGaXJzdChsYW1iZGEsIHBoaSkge1xuICBsYW1iZGEgKj0gcmFkaWFucywgcGhpICo9IHJhZGlhbnM7XG4gIGxhbWJkYTAgPSBsYW1iZGEsIHNpblBoaTAgPSBzaW4ocGhpKSwgY29zUGhpMCA9IGNvcyhwaGkpO1xuICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBsZW5ndGhQb2ludDtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgbGFtYmRhICo9IHJhZGlhbnMsIHBoaSAqPSByYWRpYW5zO1xuICB2YXIgc2luUGhpID0gc2luKHBoaSksXG4gICAgICBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgIGRlbHRhID0gYWJzKGxhbWJkYSAtIGxhbWJkYTApLFxuICAgICAgY29zRGVsdGEgPSBjb3MoZGVsdGEpLFxuICAgICAgc2luRGVsdGEgPSBzaW4oZGVsdGEpLFxuICAgICAgeCA9IGNvc1BoaSAqIHNpbkRlbHRhLFxuICAgICAgeSA9IGNvc1BoaTAgKiBzaW5QaGkgLSBzaW5QaGkwICogY29zUGhpICogY29zRGVsdGEsXG4gICAgICB6ID0gc2luUGhpMCAqIHNpblBoaSArIGNvc1BoaTAgKiBjb3NQaGkgKiBjb3NEZWx0YTtcbiAgbGVuZ3RoU3VtLmFkZChhdGFuMihzcXJ0KHggKiB4ICsgeSAqIHkpLCB6KSk7XG4gIGxhbWJkYTAgPSBsYW1iZGEsIHNpblBoaTAgPSBzaW5QaGksIGNvc1BoaTAgPSBjb3NQaGk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCkge1xuICBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKTtcbiAgc3RyZWFtKG9iamVjdCwgbGVuZ3RoU3RyZWFtKTtcbiAgcmV0dXJuICtsZW5ndGhTdW07XG59XG4iLCAiaW1wb3J0IGxlbmd0aCBmcm9tIFwiLi9sZW5ndGguanNcIjtcblxudmFyIGNvb3JkaW5hdGVzID0gW251bGwsIG51bGxdLFxuICAgIG9iamVjdCA9IHt0eXBlOiBcIkxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICBjb29yZGluYXRlc1swXSA9IGE7XG4gIGNvb3JkaW5hdGVzWzFdID0gYjtcbiAgcmV0dXJuIGxlbmd0aChvYmplY3QpO1xufVxuIiwgImltcG9ydCB7cmFuZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnMsIGNlaWwsIGVwc2lsb259IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gZ3JhdGljdWxlWCh5MCwgeTEsIGR5KSB7XG4gIHZhciB5ID0gcmFuZ2UoeTAsIHkxIC0gZXBzaWxvbiwgZHkpLmNvbmNhdCh5MSk7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiB5Lm1hcChmdW5jdGlvbih5KSB7IHJldHVybiBbeCwgeV07IH0pOyB9O1xufVxuXG5mdW5jdGlvbiBncmF0aWN1bGVZKHgwLCB4MSwgZHgpIHtcbiAgdmFyIHggPSByYW5nZSh4MCwgeDEgLSBlcHNpbG9uLCBkeCkuY29uY2F0KHgxKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHkpIHsgcmV0dXJuIHgubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIFt4LCB5XTsgfSk7IH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyYXRpY3VsZSgpIHtcbiAgdmFyIHgxLCB4MCwgWDEsIFgwLFxuICAgICAgeTEsIHkwLCBZMSwgWTAsXG4gICAgICBkeCA9IDEwLCBkeSA9IGR4LCBEWCA9IDkwLCBEWSA9IDM2MCxcbiAgICAgIHgsIHksIFgsIFksXG4gICAgICBwcmVjaXNpb24gPSAyLjU7XG5cbiAgZnVuY3Rpb24gZ3JhdGljdWxlKCkge1xuICAgIHJldHVybiB7dHlwZTogXCJNdWx0aUxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGxpbmVzKCl9O1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZXMoKSB7XG4gICAgcmV0dXJuIHJhbmdlKGNlaWwoWDAgLyBEWCkgKiBEWCwgWDEsIERYKS5tYXAoWClcbiAgICAgICAgLmNvbmNhdChyYW5nZShjZWlsKFkwIC8gRFkpICogRFksIFkxLCBEWSkubWFwKFkpKVxuICAgICAgICAuY29uY2F0KHJhbmdlKGNlaWwoeDAgLyBkeCkgKiBkeCwgeDEsIGR4KS5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4gYWJzKHggJSBEWCkgPiBlcHNpbG9uOyB9KS5tYXAoeCkpXG4gICAgICAgIC5jb25jYXQocmFuZ2UoY2VpbCh5MCAvIGR5KSAqIGR5LCB5MSwgZHkpLmZpbHRlcihmdW5jdGlvbih5KSB7IHJldHVybiBhYnMoeSAlIERZKSA+IGVwc2lsb247IH0pLm1hcCh5KSk7XG4gIH1cblxuICBncmF0aWN1bGUubGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbGluZXMoKS5tYXAoZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHsgcmV0dXJuIHt0eXBlOiBcIkxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTsgfSk7XG4gIH07XG5cbiAgZ3JhdGljdWxlLm91dGxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJQb2x5Z29uXCIsXG4gICAgICBjb29yZGluYXRlczogW1xuICAgICAgICBYKFgwKS5jb25jYXQoXG4gICAgICAgIFkoWTEpLnNsaWNlKDEpLFxuICAgICAgICBYKFgxKS5yZXZlcnNlKCkuc2xpY2UoMSksXG4gICAgICAgIFkoWTApLnJldmVyc2UoKS5zbGljZSgxKSlcbiAgICAgIF1cbiAgICB9O1xuICB9O1xuXG4gIGdyYXRpY3VsZS5leHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLmV4dGVudE1pbm9yKCk7XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5leHRlbnRNYWpvcihfKS5leHRlbnRNaW5vcihfKTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50TWFqb3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW1tYMCwgWTBdLCBbWDEsIFkxXV07XG4gICAgWDAgPSArX1swXVswXSwgWDEgPSArX1sxXVswXTtcbiAgICBZMCA9ICtfWzBdWzFdLCBZMSA9ICtfWzFdWzFdO1xuICAgIGlmIChYMCA+IFgxKSBfID0gWDAsIFgwID0gWDEsIFgxID0gXztcbiAgICBpZiAoWTAgPiBZMSkgXyA9IFkwLCBZMCA9IFkxLCBZMSA9IF87XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50TWlub3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gICAgeDAgPSArX1swXVswXSwgeDEgPSArX1sxXVswXTtcbiAgICB5MCA9ICtfWzBdWzFdLCB5MSA9ICtfWzFdWzFdO1xuICAgIGlmICh4MCA+IHgxKSBfID0geDAsIHgwID0geDEsIHgxID0gXztcbiAgICBpZiAoeTAgPiB5MSkgXyA9IHkwLCB5MCA9IHkxLCB5MSA9IF87XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBncmF0aWN1bGUuc3RlcE1pbm9yKCk7XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5zdGVwTWFqb3IoXykuc3RlcE1pbm9yKF8pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwTWFqb3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW0RYLCBEWV07XG4gICAgRFggPSArX1swXSwgRFkgPSArX1sxXTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwTWlub3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW2R4LCBkeV07XG4gICAgZHggPSArX1swXSwgZHkgPSArX1sxXTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJlY2lzaW9uO1xuICAgIHByZWNpc2lvbiA9ICtfO1xuICAgIHggPSBncmF0aWN1bGVYKHkwLCB5MSwgOTApO1xuICAgIHkgPSBncmF0aWN1bGVZKHgwLCB4MSwgcHJlY2lzaW9uKTtcbiAgICBYID0gZ3JhdGljdWxlWChZMCwgWTEsIDkwKTtcbiAgICBZID0gZ3JhdGljdWxlWShYMCwgWDEsIHByZWNpc2lvbik7XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICByZXR1cm4gZ3JhdGljdWxlXG4gICAgICAuZXh0ZW50TWFqb3IoW1stMTgwLCAtOTAgKyBlcHNpbG9uXSwgWzE4MCwgOTAgLSBlcHNpbG9uXV0pXG4gICAgICAuZXh0ZW50TWlub3IoW1stMTgwLCAtODAgLSBlcHNpbG9uXSwgWzE4MCwgODAgKyBlcHNpbG9uXV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JhdGljdWxlMTAoKSB7XG4gIHJldHVybiBncmF0aWN1bGUoKSgpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IHggPT4geDtcbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YWJzfSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxudmFyIGFyZWFTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBhcmVhU3RyZWFtID0ge1xuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBub29wLFxuICBsaW5lRW5kOiBub29wLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFTdHJlYW0ubGluZVN0YXJ0ID0gYXJlYVJpbmdTdGFydDtcbiAgICBhcmVhU3RyZWFtLmxpbmVFbmQgPSBhcmVhUmluZ0VuZDtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgYXJlYVN0cmVhbS5saW5lU3RhcnQgPSBhcmVhU3RyZWFtLmxpbmVFbmQgPSBhcmVhU3RyZWFtLnBvaW50ID0gbm9vcDtcbiAgICBhcmVhU3VtLmFkZChhYnMoYXJlYVJpbmdTdW0pKTtcbiAgICBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpO1xuICB9LFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmVhID0gYXJlYVN1bSAvIDI7XG4gICAgYXJlYVN1bSA9IG5ldyBBZGRlcigpO1xuICAgIHJldHVybiBhcmVhO1xuICB9XG59O1xuXG5mdW5jdGlvbiBhcmVhUmluZ1N0YXJ0KCkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50Rmlyc3Q7XG59XG5cbmZ1bmN0aW9uIGFyZWFQb2ludEZpcnN0KHgsIHkpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludDtcbiAgeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHk7XG59XG5cbmZ1bmN0aW9uIGFyZWFQb2ludCh4LCB5KSB7XG4gIGFyZWFSaW5nU3VtLmFkZCh5MCAqIHggLSB4MCAqIHkpO1xuICB4MCA9IHgsIHkwID0geTtcbn1cblxuZnVuY3Rpb24gYXJlYVJpbmdFbmQoKSB7XG4gIGFyZWFQb2ludCh4MDAsIHkwMCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFyZWFTdHJlYW07XG4iLCAiaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxudmFyIHgwID0gSW5maW5pdHksXG4gICAgeTAgPSB4MCxcbiAgICB4MSA9IC14MCxcbiAgICB5MSA9IHgxO1xuXG52YXIgYm91bmRzU3RyZWFtID0ge1xuICBwb2ludDogYm91bmRzUG9pbnQsXG4gIGxpbmVTdGFydDogbm9vcCxcbiAgbGluZUVuZDogbm9vcCxcbiAgcG9seWdvblN0YXJ0OiBub29wLFxuICBwb2x5Z29uRW5kOiBub29wLFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZHMgPSBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgICB4MSA9IHkxID0gLSh5MCA9IHgwID0gSW5maW5pdHkpO1xuICAgIHJldHVybiBib3VuZHM7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGJvdW5kc1BvaW50KHgsIHkpIHtcbiAgaWYgKHggPCB4MCkgeDAgPSB4O1xuICBpZiAoeCA+IHgxKSB4MSA9IHg7XG4gIGlmICh5IDwgeTApIHkwID0geTtcbiAgaWYgKHkgPiB5MSkgeTEgPSB5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBib3VuZHNTdHJlYW07XG4iLCAiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG4vLyBUT0RPIEVuZm9yY2UgcG9zaXRpdmUgYXJlYSBmb3IgZXh0ZXJpb3IsIG5lZ2F0aXZlIGFyZWEgZm9yIGludGVyaW9yP1xuXG52YXIgWDAgPSAwLFxuICAgIFkwID0gMCxcbiAgICBaMCA9IDAsXG4gICAgWDEgPSAwLFxuICAgIFkxID0gMCxcbiAgICBaMSA9IDAsXG4gICAgWDIgPSAwLFxuICAgIFkyID0gMCxcbiAgICBaMiA9IDAsXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGNlbnRyb2lkU3RyZWFtID0ge1xuICBwb2ludDogY2VudHJvaWRQb2ludCxcbiAgbGluZVN0YXJ0OiBjZW50cm9pZExpbmVTdGFydCxcbiAgbGluZUVuZDogY2VudHJvaWRMaW5lRW5kLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVTdGFydCA9IGNlbnRyb2lkUmluZ1N0YXJ0O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVFbmQgPSBjZW50cm9pZFJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lU3RhcnQgPSBjZW50cm9pZExpbmVTdGFydDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lRW5kID0gY2VudHJvaWRMaW5lRW5kO1xuICB9LFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjZW50cm9pZCA9IFoyID8gW1gyIC8gWjIsIFkyIC8gWjJdXG4gICAgICAgIDogWjEgPyBbWDEgLyBaMSwgWTEgLyBaMV1cbiAgICAgICAgOiBaMCA/IFtYMCAvIFowLCBZMCAvIFowXVxuICAgICAgICA6IFtOYU4sIE5hTl07XG4gICAgWDAgPSBZMCA9IFowID1cbiAgICBYMSA9IFkxID0gWjEgPVxuICAgIFgyID0gWTIgPSBaMiA9IDA7XG4gICAgcmV0dXJuIGNlbnRyb2lkO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50KHgsIHkpIHtcbiAgWDAgKz0geDtcbiAgWTAgKz0geTtcbiAgKytaMDtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRMaW5lU3RhcnQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludEZpcnN0TGluZTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludEZpcnN0TGluZSh4LCB5KSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludExpbmU7XG4gIGNlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50TGluZSh4LCB5KSB7XG4gIHZhciBkeCA9IHggLSB4MCwgZHkgPSB5IC0geTAsIHogPSBzcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgWDEgKz0geiAqICh4MCArIHgpIC8gMjtcbiAgWTEgKz0geiAqICh5MCArIHkpIC8gMjtcbiAgWjEgKz0gejtcbiAgY2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkTGluZUVuZCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50O1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdTdGFydCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50Rmlyc3RSaW5nO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdFbmQoKSB7XG4gIGNlbnRyb2lkUG9pbnRSaW5nKHgwMCwgeTAwKTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludEZpcnN0UmluZyh4LCB5KSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludFJpbmc7XG4gIGNlbnRyb2lkUG9pbnQoeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50UmluZyh4LCB5KSB7XG4gIHZhciBkeCA9IHggLSB4MCxcbiAgICAgIGR5ID0geSAtIHkwLFxuICAgICAgeiA9IHNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gIFgxICs9IHogKiAoeDAgKyB4KSAvIDI7XG4gIFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gIFoxICs9IHo7XG5cbiAgeiA9IHkwICogeCAtIHgwICogeTtcbiAgWDIgKz0geiAqICh4MCArIHgpO1xuICBZMiArPSB6ICogKHkwICsgeSk7XG4gIFoyICs9IHogKiAzO1xuICBjZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2VudHJvaWRTdHJlYW07XG4iLCAiaW1wb3J0IHt0YXV9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQYXRoQ29udGV4dChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5QYXRoQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gIF9yYWRpdXM6IDQuNSxcbiAgcG9pbnRSYWRpdXM6IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gdGhpcy5fcmFkaXVzID0gXywgdGhpcztcbiAgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9saW5lID09PSAwKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX3BvaW50ID0gTmFOO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgICAgICAgdGhpcy5fcG9pbnQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubW92ZVRvKHggKyB0aGlzLl9yYWRpdXMsIHkpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmFyYyh4LCB5LCB0aGlzLl9yYWRpdXMsIDAsIHRhdSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzdWx0OiBub29wXG59O1xuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxudmFyIGxlbmd0aFN1bSA9IG5ldyBBZGRlcigpLFxuICAgIGxlbmd0aFJpbmcsXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGxlbmd0aFN0cmVhbSA9IHtcbiAgcG9pbnQ6IG5vb3AsXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoUG9pbnRGaXJzdDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxlbmd0aFJpbmcpIGxlbmd0aFBvaW50KHgwMCwgeTAwKTtcbiAgICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBub29wO1xuICB9LFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxlbmd0aFJpbmcgPSB0cnVlO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBsZW5ndGhSaW5nID0gbnVsbDtcbiAgfSxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gK2xlbmd0aFN1bTtcbiAgICBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKTtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9XG59O1xuXG5mdW5jdGlvbiBsZW5ndGhQb2ludEZpcnN0KHgsIHkpIHtcbiAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoUG9pbnQ7XG4gIHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5O1xufVxuXG5mdW5jdGlvbiBsZW5ndGhQb2ludCh4LCB5KSB7XG4gIHgwIC09IHgsIHkwIC09IHk7XG4gIGxlbmd0aFN1bS5hZGQoc3FydCh4MCAqIHgwICsgeTAgKiB5MCkpO1xuICB4MCA9IHgsIHkwID0geTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGVuZ3RoU3RyZWFtO1xuIiwgIi8vIFNpbXBsZSBjYWNoaW5nIGZvciBjb25zdGFudC1yYWRpdXMgcG9pbnRzLlxubGV0IGNhY2hlRGlnaXRzLCBjYWNoZUFwcGVuZCwgY2FjaGVSYWRpdXMsIGNhY2hlQ2lyY2xlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoU3RyaW5nIHtcbiAgY29uc3RydWN0b3IoZGlnaXRzKSB7XG4gICAgdGhpcy5fYXBwZW5kID0gZGlnaXRzID09IG51bGwgPyBhcHBlbmQgOiBhcHBlbmRSb3VuZChkaWdpdHMpO1xuICAgIHRoaXMuX3JhZGl1cyA9IDQuNTtcbiAgICB0aGlzLl8gPSBcIlwiO1xuICB9XG4gIHBvaW50UmFkaXVzKF8pIHtcbiAgICB0aGlzLl9yYWRpdXMgPSArXztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBwb2x5Z29uU3RhcnQoKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH1cbiAgcG9seWdvbkVuZCgpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9XG4gIGxpbmVTdGFydCgpIHtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH1cbiAgbGluZUVuZCgpIHtcbiAgICBpZiAodGhpcy5fbGluZSA9PT0gMCkgdGhpcy5fICs9IFwiWlwiO1xuICAgIHRoaXMuX3BvaW50ID0gTmFOO1xuICB9XG4gIHBvaW50KHgsIHkpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHtcbiAgICAgICAgdGhpcy5fYXBwZW5kYE0ke3h9LCR7eX1gO1xuICAgICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBMJHt4fSwke3l9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBNJHt4fSwke3l9YDtcbiAgICAgICAgaWYgKHRoaXMuX3JhZGl1cyAhPT0gY2FjaGVSYWRpdXMgfHwgdGhpcy5fYXBwZW5kICE9PSBjYWNoZUFwcGVuZCkge1xuICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9yYWRpdXM7XG4gICAgICAgICAgY29uc3QgcyA9IHRoaXMuXztcbiAgICAgICAgICB0aGlzLl8gPSBcIlwiOyAvLyBzdGFzaCB0aGUgb2xkIHN0cmluZyBzbyB3ZSBjYW4gY2FjaGUgdGhlIGNpcmNsZSBwYXRoIGZyYWdtZW50XG4gICAgICAgICAgdGhpcy5fYXBwZW5kYG0wLCR7cn1hJHtyfSwke3J9IDAgMSwxIDAsJHstMiAqIHJ9YSR7cn0sJHtyfSAwIDEsMSAwLCR7MiAqIHJ9emA7XG4gICAgICAgICAgY2FjaGVSYWRpdXMgPSByO1xuICAgICAgICAgIGNhY2hlQXBwZW5kID0gdGhpcy5fYXBwZW5kO1xuICAgICAgICAgIGNhY2hlQ2lyY2xlID0gdGhpcy5fO1xuICAgICAgICAgIHRoaXMuXyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fICs9IGNhY2hlQ2lyY2xlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmVzdWx0KCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuXztcbiAgICB0aGlzLl8gPSBcIlwiO1xuICAgIHJldHVybiByZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICBsZXQgaSA9IDE7XG4gIHRoaXMuXyArPSBzdHJpbmdzWzBdO1xuICBmb3IgKGNvbnN0IGogPSBzdHJpbmdzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgIHRoaXMuXyArPSBhcmd1bWVudHNbaV0gKyBzdHJpbmdzW2ldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFJvdW5kKGRpZ2l0cykge1xuICBjb25zdCBkID0gTWF0aC5mbG9vcihkaWdpdHMpO1xuICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7ZGlnaXRzfWApO1xuICBpZiAoZCA+IDE1KSByZXR1cm4gYXBwZW5kO1xuICBpZiAoZCAhPT0gY2FjaGVEaWdpdHMpIHtcbiAgICBjb25zdCBrID0gMTAgKiogZDtcbiAgICBjYWNoZURpZ2l0cyA9IGQ7XG4gICAgY2FjaGVBcHBlbmQgPSBmdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICAgICAgbGV0IGkgPSAxO1xuICAgICAgdGhpcy5fICs9IHN0cmluZ3NbMF07XG4gICAgICBmb3IgKGNvbnN0IGogPSBzdHJpbmdzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgICAgICB0aGlzLl8gKz0gTWF0aC5yb3VuZChhcmd1bWVudHNbaV0gKiBrKSAvIGsgKyBzdHJpbmdzW2ldO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGNhY2hlQXBwZW5kO1xufVxuIiwgImltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi4vaWRlbnRpdHkuanNcIjtcbmltcG9ydCBzdHJlYW0gZnJvbSBcIi4uL3N0cmVhbS5qc1wiO1xuaW1wb3J0IHBhdGhBcmVhIGZyb20gXCIuL2FyZWEuanNcIjtcbmltcG9ydCBwYXRoQm91bmRzIGZyb20gXCIuL2JvdW5kcy5qc1wiO1xuaW1wb3J0IHBhdGhDZW50cm9pZCBmcm9tIFwiLi9jZW50cm9pZC5qc1wiO1xuaW1wb3J0IFBhdGhDb250ZXh0IGZyb20gXCIuL2NvbnRleHQuanNcIjtcbmltcG9ydCBwYXRoTWVhc3VyZSBmcm9tIFwiLi9tZWFzdXJlLmpzXCI7XG5pbXBvcnQgUGF0aFN0cmluZyBmcm9tIFwiLi9zdHJpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocHJvamVjdGlvbiwgY29udGV4dCkge1xuICBsZXQgZGlnaXRzID0gMyxcbiAgICAgIHBvaW50UmFkaXVzID0gNC41LFxuICAgICAgcHJvamVjdGlvblN0cmVhbSxcbiAgICAgIGNvbnRleHRTdHJlYW07XG5cbiAgZnVuY3Rpb24gcGF0aChvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIHBvaW50UmFkaXVzID09PSBcImZ1bmN0aW9uXCIpIGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMoK3BvaW50UmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShjb250ZXh0U3RyZWFtKSk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0U3RyZWFtLnJlc3VsdCgpO1xuICB9XG5cbiAgcGF0aC5hcmVhID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoQXJlYSkpO1xuICAgIHJldHVybiBwYXRoQXJlYS5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLm1lYXN1cmUgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhNZWFzdXJlKSk7XG4gICAgcmV0dXJuIHBhdGhNZWFzdXJlLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGguYm91bmRzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoQm91bmRzKSk7XG4gICAgcmV0dXJuIHBhdGhCb3VuZHMucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5jZW50cm9pZCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aENlbnRyb2lkKSk7XG4gICAgcmV0dXJuIHBhdGhDZW50cm9pZC5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLnByb2plY3Rpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJvamVjdGlvbjtcbiAgICBwcm9qZWN0aW9uU3RyZWFtID0gXyA9PSBudWxsID8gKHByb2plY3Rpb24gPSBudWxsLCBpZGVudGl0eSkgOiAocHJvamVjdGlvbiA9IF8pLnN0cmVhbTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwYXRoLmNvbnRleHQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29udGV4dDtcbiAgICBjb250ZXh0U3RyZWFtID0gXyA9PSBudWxsID8gKGNvbnRleHQgPSBudWxsLCBuZXcgUGF0aFN0cmluZyhkaWdpdHMpKSA6IG5ldyBQYXRoQ29udGV4dChjb250ZXh0ID0gXyk7XG4gICAgaWYgKHR5cGVvZiBwb2ludFJhZGl1cyAhPT0gXCJmdW5jdGlvblwiKSBjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKHBvaW50UmFkaXVzKTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwYXRoLnBvaW50UmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHBvaW50UmFkaXVzO1xuICAgIHBvaW50UmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiAoY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cygrXyksICtfKTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwYXRoLmRpZ2l0cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkaWdpdHM7XG4gICAgaWYgKF8gPT0gbnVsbCkgZGlnaXRzID0gbnVsbDtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGQgPSBNYXRoLmZsb29yKF8pO1xuICAgICAgaWYgKCEoZCA+PSAwKSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGludmFsaWQgZGlnaXRzOiAke199YCk7XG4gICAgICBkaWdpdHMgPSBkO1xuICAgIH1cbiAgICBpZiAoY29udGV4dCA9PT0gbnVsbCkgY29udGV4dFN0cmVhbSA9IG5ldyBQYXRoU3RyaW5nKGRpZ2l0cyk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcmV0dXJuIHBhdGgucHJvamVjdGlvbihwcm9qZWN0aW9uKS5kaWdpdHMoZGlnaXRzKS5jb250ZXh0KGNvbnRleHQpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1ldGhvZHMpIHtcbiAgcmV0dXJuIHtcbiAgICBzdHJlYW06IHRyYW5zZm9ybWVyKG1ldGhvZHMpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1lcihtZXRob2RzKSB7XG4gIHJldHVybiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgcyA9IG5ldyBUcmFuc2Zvcm1TdHJlYW07XG4gICAgZm9yICh2YXIga2V5IGluIG1ldGhvZHMpIHNba2V5XSA9IG1ldGhvZHNba2V5XTtcbiAgICBzLnN0cmVhbSA9IHN0cmVhbTtcbiAgICByZXR1cm4gcztcbiAgfTtcbn1cblxuZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtKCkge31cblxuVHJhbnNmb3JtU3RyZWFtLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zZm9ybVN0cmVhbSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgdGhpcy5zdHJlYW0ucG9pbnQoeCwgeSk7IH0sXG4gIHNwaGVyZTogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLnNwaGVyZSgpOyB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5saW5lU3RhcnQoKTsgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLmxpbmVFbmQoKTsgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ucG9seWdvblN0YXJ0KCk7IH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5wb2x5Z29uRW5kKCk7IH1cbn07XG4iLCAiaW1wb3J0IHtkZWZhdWx0IGFzIGdlb1N0cmVhbX0gZnJvbSBcIi4uL3N0cmVhbS5qc1wiO1xuaW1wb3J0IGJvdW5kc1N0cmVhbSBmcm9tIFwiLi4vcGF0aC9ib3VuZHMuanNcIjtcblxuZnVuY3Rpb24gZml0KHByb2plY3Rpb24sIGZpdEJvdW5kcywgb2JqZWN0KSB7XG4gIHZhciBjbGlwID0gcHJvamVjdGlvbi5jbGlwRXh0ZW50ICYmIHByb2plY3Rpb24uY2xpcEV4dGVudCgpO1xuICBwcm9qZWN0aW9uLnNjYWxlKDE1MCkudHJhbnNsYXRlKFswLCAwXSk7XG4gIGlmIChjbGlwICE9IG51bGwpIHByb2plY3Rpb24uY2xpcEV4dGVudChudWxsKTtcbiAgZ2VvU3RyZWFtKG9iamVjdCwgcHJvamVjdGlvbi5zdHJlYW0oYm91bmRzU3RyZWFtKSk7XG4gIGZpdEJvdW5kcyhib3VuZHNTdHJlYW0ucmVzdWx0KCkpO1xuICBpZiAoY2xpcCAhPSBudWxsKSBwcm9qZWN0aW9uLmNsaXBFeHRlbnQoY2xpcCk7XG4gIHJldHVybiBwcm9qZWN0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0RXh0ZW50KHByb2plY3Rpb24sIGV4dGVudCwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXQocHJvamVjdGlvbiwgZnVuY3Rpb24oYikge1xuICAgIHZhciB3ID0gZXh0ZW50WzFdWzBdIC0gZXh0ZW50WzBdWzBdLFxuICAgICAgICBoID0gZXh0ZW50WzFdWzFdIC0gZXh0ZW50WzBdWzFdLFxuICAgICAgICBrID0gTWF0aC5taW4odyAvIChiWzFdWzBdIC0gYlswXVswXSksIGggLyAoYlsxXVsxXSAtIGJbMF1bMV0pKSxcbiAgICAgICAgeCA9ICtleHRlbnRbMF1bMF0gKyAodyAtIGsgKiAoYlsxXVswXSArIGJbMF1bMF0pKSAvIDIsXG4gICAgICAgIHkgPSArZXh0ZW50WzBdWzFdICsgKGggLSBrICogKGJbMV1bMV0gKyBiWzBdWzFdKSkgLyAyO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCkge1xuICByZXR1cm4gZml0RXh0ZW50KHByb2plY3Rpb24sIFtbMCwgMF0sIHNpemVdLCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0V2lkdGgocHJvamVjdGlvbiwgd2lkdGgsIG9iamVjdCkge1xuICByZXR1cm4gZml0KHByb2plY3Rpb24sIGZ1bmN0aW9uKGIpIHtcbiAgICB2YXIgdyA9ICt3aWR0aCxcbiAgICAgICAgayA9IHcgLyAoYlsxXVswXSAtIGJbMF1bMF0pLFxuICAgICAgICB4ID0gKHcgLSBrICogKGJbMV1bMF0gKyBiWzBdWzBdKSkgLyAyLFxuICAgICAgICB5ID0gLWsgKiBiWzBdWzFdO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRIZWlnaHQocHJvamVjdGlvbiwgaGVpZ2h0LCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdChwcm9qZWN0aW9uLCBmdW5jdGlvbihiKSB7XG4gICAgdmFyIGggPSAraGVpZ2h0LFxuICAgICAgICBrID0gaCAvIChiWzFdWzFdIC0gYlswXVsxXSksXG4gICAgICAgIHggPSAtayAqIGJbMF1bMF0sXG4gICAgICAgIHkgPSAoaCAtIGsgKiAoYlsxXVsxXSArIGJbMF1bMV0pKSAvIDI7XG4gICAgcHJvamVjdGlvbi5zY2FsZSgxNTAgKiBrKS50cmFuc2xhdGUoW3gsIHldKTtcbiAgfSwgb2JqZWN0KTtcbn1cbiIsICJpbXBvcnQge2NhcnRlc2lhbn0gZnJvbSBcIi4uL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIHJhZGlhbnMsIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3RyYW5zZm9ybWVyfSBmcm9tIFwiLi4vdHJhbnNmb3JtLmpzXCI7XG5cbnZhciBtYXhEZXB0aCA9IDE2LCAvLyBtYXhpbXVtIGRlcHRoIG9mIHN1YmRpdmlzaW9uXG4gICAgY29zTWluRGlzdGFuY2UgPSBjb3MoMzAgKiByYWRpYW5zKTsgLy8gY29zKG1pbmltdW0gYW5ndWxhciBkaXN0YW5jZSlcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocHJvamVjdCwgZGVsdGEyKSB7XG4gIHJldHVybiArZGVsdGEyID8gcmVzYW1wbGUocHJvamVjdCwgZGVsdGEyKSA6IHJlc2FtcGxlTm9uZShwcm9qZWN0KTtcbn1cblxuZnVuY3Rpb24gcmVzYW1wbGVOb25lKHByb2plY3QpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgeCA9IHByb2plY3QoeCwgeSk7XG4gICAgICB0aGlzLnN0cmVhbS5wb2ludCh4WzBdLCB4WzFdKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNhbXBsZShwcm9qZWN0LCBkZWx0YTIpIHtcblxuICBmdW5jdGlvbiByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgxLCB5MSwgbGFtYmRhMSwgYTEsIGIxLCBjMSwgZGVwdGgsIHN0cmVhbSkge1xuICAgIHZhciBkeCA9IHgxIC0geDAsXG4gICAgICAgIGR5ID0geTEgLSB5MCxcbiAgICAgICAgZDIgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICBpZiAoZDIgPiA0ICogZGVsdGEyICYmIGRlcHRoLS0pIHtcbiAgICAgIHZhciBhID0gYTAgKyBhMSxcbiAgICAgICAgICBiID0gYjAgKyBiMSxcbiAgICAgICAgICBjID0gYzAgKyBjMSxcbiAgICAgICAgICBtID0gc3FydChhICogYSArIGIgKiBiICsgYyAqIGMpLFxuICAgICAgICAgIHBoaTIgPSBhc2luKGMgLz0gbSksXG4gICAgICAgICAgbGFtYmRhMiA9IGFicyhhYnMoYykgLSAxKSA8IGVwc2lsb24gfHwgYWJzKGxhbWJkYTAgLSBsYW1iZGExKSA8IGVwc2lsb24gPyAobGFtYmRhMCArIGxhbWJkYTEpIC8gMiA6IGF0YW4yKGIsIGEpLFxuICAgICAgICAgIHAgPSBwcm9qZWN0KGxhbWJkYTIsIHBoaTIpLFxuICAgICAgICAgIHgyID0gcFswXSxcbiAgICAgICAgICB5MiA9IHBbMV0sXG4gICAgICAgICAgZHgyID0geDIgLSB4MCxcbiAgICAgICAgICBkeTIgPSB5MiAtIHkwLFxuICAgICAgICAgIGR6ID0gZHkgKiBkeDIgLSBkeCAqIGR5MjtcbiAgICAgIGlmIChkeiAqIGR6IC8gZDIgPiBkZWx0YTIgLy8gcGVycGVuZGljdWxhciBwcm9qZWN0ZWQgZGlzdGFuY2VcbiAgICAgICAgICB8fCBhYnMoKGR4ICogZHgyICsgZHkgKiBkeTIpIC8gZDIgLSAwLjUpID4gMC4zIC8vIG1pZHBvaW50IGNsb3NlIHRvIGFuIGVuZFxuICAgICAgICAgIHx8IGEwICogYTEgKyBiMCAqIGIxICsgYzAgKiBjMSA8IGNvc01pbkRpc3RhbmNlKSB7IC8vIGFuZ3VsYXIgZGlzdGFuY2VcbiAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MiwgeTIsIGxhbWJkYTIsIGEgLz0gbSwgYiAvPSBtLCBjLCBkZXB0aCwgc3RyZWFtKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHgyLCB5Mik7XG4gICAgICAgIHJlc2FtcGxlTGluZVRvKHgyLCB5MiwgbGFtYmRhMiwgYSwgYiwgYywgeDEsIHkxLCBsYW1iZGExLCBhMSwgYjEsIGMxLCBkZXB0aCwgc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBsYW1iZGEwMCwgeDAwLCB5MDAsIGEwMCwgYjAwLCBjMDAsIC8vIGZpcnN0IHBvaW50XG4gICAgICAgIGxhbWJkYTAsIHgwLCB5MCwgYTAsIGIwLCBjMDsgLy8gcHJldmlvdXMgcG9pbnRcblxuICAgIHZhciByZXNhbXBsZVN0cmVhbSA9IHtcbiAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgbGluZUVuZDogbGluZUVuZCxcbiAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHN0cmVhbS5wb2x5Z29uU3RhcnQoKTsgcmVzYW1wbGVTdHJlYW0ubGluZVN0YXJ0ID0gcmluZ1N0YXJ0OyB9LFxuICAgICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7IHN0cmVhbS5wb2x5Z29uRW5kKCk7IHJlc2FtcGxlU3RyZWFtLmxpbmVTdGFydCA9IGxpbmVTdGFydDsgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgICB4ID0gcHJvamVjdCh4LCB5KTtcbiAgICAgIHN0cmVhbS5wb2ludCh4WzBdLCB4WzFdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICB4MCA9IE5hTjtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVQb2ludChsYW1iZGEsIHBoaSkge1xuICAgICAgdmFyIGMgPSBjYXJ0ZXNpYW4oW2xhbWJkYSwgcGhpXSksIHAgPSBwcm9qZWN0KGxhbWJkYSwgcGhpKTtcbiAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDAgPSBwWzBdLCB5MCA9IHBbMV0sIGxhbWJkYTAgPSBsYW1iZGEsIGEwID0gY1swXSwgYjAgPSBjWzFdLCBjMCA9IGNbMl0sIG1heERlcHRoLCBzdHJlYW0pO1xuICAgICAgc3RyZWFtLnBvaW50KHgwLCB5MCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdTdGFydCgpIHtcbiAgICAgIGxpbmVTdGFydCgpO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSByaW5nUG9pbnQ7XG4gICAgICByZXNhbXBsZVN0cmVhbS5saW5lRW5kID0gcmluZ0VuZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIGxpbmVQb2ludChsYW1iZGEwMCA9IGxhbWJkYSwgcGhpKSwgeDAwID0geDAsIHkwMCA9IHkwLCBhMDAgPSBhMCwgYjAwID0gYjAsIGMwMCA9IGMwO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDAwLCB5MDAsIGxhbWJkYTAwLCBhMDAsIGIwMCwgYzAwLCBtYXhEZXB0aCwgc3RyZWFtKTtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgbGluZUVuZCgpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNhbXBsZVN0cmVhbTtcbiAgfTtcbn1cbiIsICJpbXBvcnQgY2xpcEFudGltZXJpZGlhbiBmcm9tIFwiLi4vY2xpcC9hbnRpbWVyaWRpYW4uanNcIjtcbmltcG9ydCBjbGlwQ2lyY2xlIGZyb20gXCIuLi9jbGlwL2NpcmNsZS5qc1wiO1xuaW1wb3J0IGNsaXBSZWN0YW5nbGUgZnJvbSBcIi4uL2NsaXAvcmVjdGFuZ2xlLmpzXCI7XG5pbXBvcnQgY29tcG9zZSBmcm9tIFwiLi4vY29tcG9zZS5qc1wiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuLi9pZGVudGl0eS5qc1wiO1xuaW1wb3J0IHtjb3MsIGRlZ3JlZXMsIHJhZGlhbnMsIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7cm90YXRlUmFkaWFuc30gZnJvbSBcIi4uL3JvdGF0aW9uLmpzXCI7XG5pbXBvcnQge3RyYW5zZm9ybWVyfSBmcm9tIFwiLi4vdHJhbnNmb3JtLmpzXCI7XG5pbXBvcnQge2ZpdEV4dGVudCwgZml0U2l6ZSwgZml0V2lkdGgsIGZpdEhlaWdodH0gZnJvbSBcIi4vZml0LmpzXCI7XG5pbXBvcnQgcmVzYW1wbGUgZnJvbSBcIi4vcmVzYW1wbGUuanNcIjtcblxudmFyIHRyYW5zZm9ybVJhZGlhbnMgPSB0cmFuc2Zvcm1lcih7XG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdGhpcy5zdHJlYW0ucG9pbnQoeCAqIHJhZGlhbnMsIHkgKiByYWRpYW5zKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVJvdGF0ZShyb3RhdGUpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIHIgPSByb3RhdGUoeCwgeSk7XG4gICAgICByZXR1cm4gdGhpcy5zdHJlYW0ucG9pbnQoclswXSwgclsxXSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2NhbGVUcmFuc2xhdGUoaywgZHgsIGR5LCBzeCwgc3kpIHtcbiAgZnVuY3Rpb24gdHJhbnNmb3JtKHgsIHkpIHtcbiAgICB4ICo9IHN4OyB5ICo9IHN5O1xuICAgIHJldHVybiBbZHggKyBrICogeCwgZHkgLSBrICogeV07XG4gIH1cbiAgdHJhbnNmb3JtLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gWyh4IC0gZHgpIC8gayAqIHN4LCAoZHkgLSB5KSAvIGsgKiBzeV07XG4gIH07XG4gIHJldHVybiB0cmFuc2Zvcm07XG59XG5cbmZ1bmN0aW9uIHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIGR4LCBkeSwgc3gsIHN5LCBhbHBoYSkge1xuICBpZiAoIWFscGhhKSByZXR1cm4gc2NhbGVUcmFuc2xhdGUoaywgZHgsIGR5LCBzeCwgc3kpO1xuICB2YXIgY29zQWxwaGEgPSBjb3MoYWxwaGEpLFxuICAgICAgc2luQWxwaGEgPSBzaW4oYWxwaGEpLFxuICAgICAgYSA9IGNvc0FscGhhICogayxcbiAgICAgIGIgPSBzaW5BbHBoYSAqIGssXG4gICAgICBhaSA9IGNvc0FscGhhIC8gayxcbiAgICAgIGJpID0gc2luQWxwaGEgLyBrLFxuICAgICAgY2kgPSAoc2luQWxwaGEgKiBkeSAtIGNvc0FscGhhICogZHgpIC8gayxcbiAgICAgIGZpID0gKHNpbkFscGhhICogZHggKyBjb3NBbHBoYSAqIGR5KSAvIGs7XG4gIGZ1bmN0aW9uIHRyYW5zZm9ybSh4LCB5KSB7XG4gICAgeCAqPSBzeDsgeSAqPSBzeTtcbiAgICByZXR1cm4gW2EgKiB4IC0gYiAqIHkgKyBkeCwgZHkgLSBiICogeCAtIGEgKiB5XTtcbiAgfVxuICB0cmFuc2Zvcm0uaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiBbc3ggKiAoYWkgKiB4IC0gYmkgKiB5ICsgY2kpLCBzeSAqIChmaSAtIGJpICogeCAtIGFpICogeSldO1xuICB9O1xuICByZXR1cm4gdHJhbnNmb3JtO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm9qZWN0aW9uKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Rpb25NdXRhdG9yKGZ1bmN0aW9uKCkgeyByZXR1cm4gcHJvamVjdDsgfSkoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb25NdXRhdG9yKHByb2plY3RBdCkge1xuICB2YXIgcHJvamVjdCxcbiAgICAgIGsgPSAxNTAsIC8vIHNjYWxlXG4gICAgICB4ID0gNDgwLCB5ID0gMjUwLCAvLyB0cmFuc2xhdGVcbiAgICAgIGxhbWJkYSA9IDAsIHBoaSA9IDAsIC8vIGNlbnRlclxuICAgICAgZGVsdGFMYW1iZGEgPSAwLCBkZWx0YVBoaSA9IDAsIGRlbHRhR2FtbWEgPSAwLCByb3RhdGUsIC8vIHByZS1yb3RhdGVcbiAgICAgIGFscGhhID0gMCwgLy8gcG9zdC1yb3RhdGUgYW5nbGVcbiAgICAgIHN4ID0gMSwgLy8gcmVmbGVjdFhcbiAgICAgIHN5ID0gMSwgLy8gcmVmbGVjdFhcbiAgICAgIHRoZXRhID0gbnVsbCwgcHJlY2xpcCA9IGNsaXBBbnRpbWVyaWRpYW4sIC8vIHByZS1jbGlwIGFuZ2xlXG4gICAgICB4MCA9IG51bGwsIHkwLCB4MSwgeTEsIHBvc3RjbGlwID0gaWRlbnRpdHksIC8vIHBvc3QtY2xpcCBleHRlbnRcbiAgICAgIGRlbHRhMiA9IDAuNSwgLy8gcHJlY2lzaW9uXG4gICAgICBwcm9qZWN0UmVzYW1wbGUsXG4gICAgICBwcm9qZWN0VHJhbnNmb3JtLFxuICAgICAgcHJvamVjdFJvdGF0ZVRyYW5zZm9ybSxcbiAgICAgIGNhY2hlLFxuICAgICAgY2FjaGVTdHJlYW07XG5cbiAgZnVuY3Rpb24gcHJvamVjdGlvbihwb2ludCkge1xuICAgIHJldHVybiBwcm9qZWN0Um90YXRlVHJhbnNmb3JtKHBvaW50WzBdICogcmFkaWFucywgcG9pbnRbMV0gKiByYWRpYW5zKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmVydChwb2ludCkge1xuICAgIHBvaW50ID0gcHJvamVjdFJvdGF0ZVRyYW5zZm9ybS5pbnZlcnQocG9pbnRbMF0sIHBvaW50WzFdKTtcbiAgICByZXR1cm4gcG9pbnQgJiYgW3BvaW50WzBdICogZGVncmVlcywgcG9pbnRbMV0gKiBkZWdyZWVzXTtcbiAgfVxuXG4gIHByb2plY3Rpb24uc3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgcmV0dXJuIGNhY2hlICYmIGNhY2hlU3RyZWFtID09PSBzdHJlYW0gPyBjYWNoZSA6IGNhY2hlID0gdHJhbnNmb3JtUmFkaWFucyh0cmFuc2Zvcm1Sb3RhdGUocm90YXRlKShwcmVjbGlwKHByb2plY3RSZXNhbXBsZShwb3N0Y2xpcChjYWNoZVN0cmVhbSA9IHN0cmVhbSkpKSkpO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucHJlY2xpcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjbGlwID0gXywgdGhldGEgPSB1bmRlZmluZWQsIHJlc2V0KCkpIDogcHJlY2xpcDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnBvc3RjbGlwID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBvc3RjbGlwID0gXywgeDAgPSB5MCA9IHgxID0geTEgPSBudWxsLCByZXNldCgpKSA6IHBvc3RjbGlwO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2xpcEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByZWNsaXAgPSArXyA/IGNsaXBDaXJjbGUodGhldGEgPSBfICogcmFkaWFucykgOiAodGhldGEgPSBudWxsLCBjbGlwQW50aW1lcmlkaWFuKSwgcmVzZXQoKSkgOiB0aGV0YSAqIGRlZ3JlZXM7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5jbGlwRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBvc3RjbGlwID0gXyA9PSBudWxsID8gKHgwID0geTAgPSB4MSA9IHkxID0gbnVsbCwgaWRlbnRpdHkpIDogY2xpcFJlY3RhbmdsZSh4MCA9ICtfWzBdWzBdLCB5MCA9ICtfWzBdWzFdLCB4MSA9ICtfWzFdWzBdLCB5MSA9ICtfWzFdWzFdKSwgcmVzZXQoKSkgOiB4MCA9PSBudWxsID8gbnVsbCA6IFtbeDAsIHkwXSwgW3gxLCB5MV1dO1xuICB9O1xuXG4gIHByb2plY3Rpb24uc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoayA9ICtfLCByZWNlbnRlcigpKSA6IGs7XG4gIH07XG5cbiAgcHJvamVjdGlvbi50cmFuc2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeCA9ICtfWzBdLCB5ID0gK19bMV0sIHJlY2VudGVyKCkpIDogW3gsIHldO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2VudGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGxhbWJkYSA9IF9bMF0gJSAzNjAgKiByYWRpYW5zLCBwaGkgPSBfWzFdICUgMzYwICogcmFkaWFucywgcmVjZW50ZXIoKSkgOiBbbGFtYmRhICogZGVncmVlcywgcGhpICogZGVncmVlc107XG4gIH07XG5cbiAgcHJvamVjdGlvbi5yb3RhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZGVsdGFMYW1iZGEgPSBfWzBdICUgMzYwICogcmFkaWFucywgZGVsdGFQaGkgPSBfWzFdICUgMzYwICogcmFkaWFucywgZGVsdGFHYW1tYSA9IF8ubGVuZ3RoID4gMiA/IF9bMl0gJSAzNjAgKiByYWRpYW5zIDogMCwgcmVjZW50ZXIoKSkgOiBbZGVsdGFMYW1iZGEgKiBkZWdyZWVzLCBkZWx0YVBoaSAqIGRlZ3JlZXMsIGRlbHRhR2FtbWEgKiBkZWdyZWVzXTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFscGhhID0gXyAlIDM2MCAqIHJhZGlhbnMsIHJlY2VudGVyKCkpIDogYWxwaGEgKiBkZWdyZWVzO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucmVmbGVjdFggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3ggPSBfID8gLTEgOiAxLCByZWNlbnRlcigpKSA6IHN4IDwgMDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnJlZmxlY3RZID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN5ID0gXyA/IC0xIDogMSwgcmVjZW50ZXIoKSkgOiBzeSA8IDA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJvamVjdFJlc2FtcGxlID0gcmVzYW1wbGUocHJvamVjdFRyYW5zZm9ybSwgZGVsdGEyID0gXyAqIF8pLCByZXNldCgpKSA6IHNxcnQoZGVsdGEyKTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdEV4dGVudCA9IGZ1bmN0aW9uKGV4dGVudCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEV4dGVudChwcm9qZWN0aW9uLCBleHRlbnQsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRTaXplID0gZnVuY3Rpb24oc2l6ZSwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFNpemUocHJvamVjdGlvbiwgc2l6ZSwgb2JqZWN0KTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdFdpZHRoID0gZnVuY3Rpb24od2lkdGgsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRXaWR0aChwcm9qZWN0aW9uLCB3aWR0aCwgb2JqZWN0KTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdEhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEhlaWdodChwcm9qZWN0aW9uLCBoZWlnaHQsIG9iamVjdCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVjZW50ZXIoKSB7XG4gICAgdmFyIGNlbnRlciA9IHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIDAsIDAsIHN4LCBzeSwgYWxwaGEpLmFwcGx5KG51bGwsIHByb2plY3QobGFtYmRhLCBwaGkpKSxcbiAgICAgICAgdHJhbnNmb3JtID0gc2NhbGVUcmFuc2xhdGVSb3RhdGUoaywgeCAtIGNlbnRlclswXSwgeSAtIGNlbnRlclsxXSwgc3gsIHN5LCBhbHBoYSk7XG4gICAgcm90YXRlID0gcm90YXRlUmFkaWFucyhkZWx0YUxhbWJkYSwgZGVsdGFQaGksIGRlbHRhR2FtbWEpO1xuICAgIHByb2plY3RUcmFuc2Zvcm0gPSBjb21wb3NlKHByb2plY3QsIHRyYW5zZm9ybSk7XG4gICAgcHJvamVjdFJvdGF0ZVRyYW5zZm9ybSA9IGNvbXBvc2Uocm90YXRlLCBwcm9qZWN0VHJhbnNmb3JtKTtcbiAgICBwcm9qZWN0UmVzYW1wbGUgPSByZXNhbXBsZShwcm9qZWN0VHJhbnNmb3JtLCBkZWx0YTIpO1xuICAgIHJldHVybiByZXNldCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgY2FjaGUgPSBjYWNoZVN0cmVhbSA9IG51bGw7XG4gICAgcmV0dXJuIHByb2plY3Rpb247XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcHJvamVjdCA9IHByb2plY3RBdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHByb2plY3Rpb24uaW52ZXJ0ID0gcHJvamVjdC5pbnZlcnQgJiYgaW52ZXJ0O1xuICAgIHJldHVybiByZWNlbnRlcigpO1xuICB9O1xufVxuIiwgImltcG9ydCB7ZGVncmVlcywgcGksIHJhZGlhbnN9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3Byb2plY3Rpb25NdXRhdG9yfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uaWNQcm9qZWN0aW9uKHByb2plY3RBdCkge1xuICB2YXIgcGhpMCA9IDAsXG4gICAgICBwaGkxID0gcGkgLyAzLFxuICAgICAgbSA9IHByb2plY3Rpb25NdXRhdG9yKHByb2plY3RBdCksXG4gICAgICBwID0gbShwaGkwLCBwaGkxKTtcblxuICBwLnBhcmFsbGVscyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IG0ocGhpMCA9IF9bMF0gKiByYWRpYW5zLCBwaGkxID0gX1sxXSAqIHJhZGlhbnMpIDogW3BoaTAgKiBkZWdyZWVzLCBwaGkxICogZGVncmVlc107XG4gIH07XG5cbiAgcmV0dXJuIHA7XG59XG4iLCAiaW1wb3J0IHthc2luLCBjb3MsIHNpbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGN5bGluZHJpY2FsRXF1YWxBcmVhUmF3KHBoaTApIHtcbiAgdmFyIGNvc1BoaTAgPSBjb3MocGhpMCk7XG5cbiAgZnVuY3Rpb24gZm9yd2FyZChsYW1iZGEsIHBoaSkge1xuICAgIHJldHVybiBbbGFtYmRhICogY29zUGhpMCwgc2luKHBoaSkgLyBjb3NQaGkwXTtcbiAgfVxuXG4gIGZvcndhcmQuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiBbeCAvIGNvc1BoaTAsIGFzaW4oeSAqIGNvc1BoaTApXTtcbiAgfTtcblxuICByZXR1cm4gZm9yd2FyZDtcbn1cbiIsICJpbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgcGksIHNpZ24sIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7Y29uaWNQcm9qZWN0aW9ufSBmcm9tIFwiLi9jb25pYy5qc1wiO1xuaW1wb3J0IHtjeWxpbmRyaWNhbEVxdWFsQXJlYVJhd30gZnJvbSBcIi4vY3lsaW5kcmljYWxFcXVhbEFyZWEuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmljRXF1YWxBcmVhUmF3KHkwLCB5MSkge1xuICB2YXIgc3kwID0gc2luKHkwKSwgbiA9IChzeTAgKyBzaW4oeTEpKSAvIDI7XG5cbiAgLy8gQXJlIHRoZSBwYXJhbGxlbHMgc3ltbWV0cmljYWwgYXJvdW5kIHRoZSBFcXVhdG9yP1xuICBpZiAoYWJzKG4pIDwgZXBzaWxvbikgcmV0dXJuIGN5bGluZHJpY2FsRXF1YWxBcmVhUmF3KHkwKTtcblxuICB2YXIgYyA9IDEgKyBzeTAgKiAoMiAqIG4gLSBzeTApLCByMCA9IHNxcnQoYykgLyBuO1xuXG4gIGZ1bmN0aW9uIHByb2plY3QoeCwgeSkge1xuICAgIHZhciByID0gc3FydChjIC0gMiAqIG4gKiBzaW4oeSkpIC8gbjtcbiAgICByZXR1cm4gW3IgKiBzaW4oeCAqPSBuKSwgcjAgLSByICogY29zKHgpXTtcbiAgfVxuXG4gIHByb2plY3QuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciByMHkgPSByMCAtIHksXG4gICAgICAgIGwgPSBhdGFuMih4LCBhYnMocjB5KSkgKiBzaWduKHIweSk7XG4gICAgaWYgKHIweSAqIG4gPCAwKVxuICAgICAgbCAtPSBwaSAqIHNpZ24oeCkgKiBzaWduKHIweSk7XG4gICAgcmV0dXJuIFtsIC8gbiwgYXNpbigoYyAtICh4ICogeCArIHIweSAqIHIweSkgKiBuICogbikgLyAoMiAqIG4pKV07XG4gIH07XG5cbiAgcmV0dXJuIHByb2plY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNQcm9qZWN0aW9uKGNvbmljRXF1YWxBcmVhUmF3KVxuICAgICAgLnNjYWxlKDE1NS40MjQpXG4gICAgICAuY2VudGVyKFswLCAzMy42NDQyXSk7XG59XG4iLCAiaW1wb3J0IGNvbmljRXF1YWxBcmVhIGZyb20gXCIuL2NvbmljRXF1YWxBcmVhLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNFcXVhbEFyZWEoKVxuICAgICAgLnBhcmFsbGVscyhbMjkuNSwgNDUuNV0pXG4gICAgICAuc2NhbGUoMTA3MClcbiAgICAgIC50cmFuc2xhdGUoWzQ4MCwgMjUwXSlcbiAgICAgIC5yb3RhdGUoWzk2LCAwXSlcbiAgICAgIC5jZW50ZXIoWy0wLjYsIDM4LjddKTtcbn1cbiIsICJpbXBvcnQge2Vwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgYWxiZXJzIGZyb20gXCIuL2FsYmVycy5qc1wiO1xuaW1wb3J0IGNvbmljRXF1YWxBcmVhIGZyb20gXCIuL2NvbmljRXF1YWxBcmVhLmpzXCI7XG5pbXBvcnQge2ZpdEV4dGVudCwgZml0U2l6ZSwgZml0V2lkdGgsIGZpdEhlaWdodH0gZnJvbSBcIi4vZml0LmpzXCI7XG5cbi8vIFRoZSBwcm9qZWN0aW9ucyBtdXN0IGhhdmUgbXV0dWFsbHkgZXhjbHVzaXZlIGNsaXAgcmVnaW9ucyBvbiB0aGUgc3BoZXJlLFxuLy8gYXMgdGhpcyB3aWxsIGF2b2lkIGVtaXR0aW5nIGludGVybGVhdmluZyBsaW5lcyBhbmQgcG9seWdvbnMuXG5mdW5jdGlvbiBtdWx0aXBsZXgoc3RyZWFtcykge1xuICB2YXIgbiA9IHN0cmVhbXMubGVuZ3RoO1xuICByZXR1cm4ge1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnBvaW50KHgsIHkpOyB9LFxuICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnNwaGVyZSgpOyB9LFxuICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLmxpbmVTdGFydCgpOyB9LFxuICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5saW5lRW5kKCk7IH0sXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ucG9seWdvblN0YXJ0KCk7IH0sXG4gICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnBvbHlnb25FbmQoKTsgfVxuICB9O1xufVxuXG4vLyBBIGNvbXBvc2l0ZSBwcm9qZWN0aW9uIGZvciB0aGUgVW5pdGVkIFN0YXRlcywgY29uZmlndXJlZCBieSBkZWZhdWx0IGZvclxuLy8gOTYwXHUwMEQ3NTAwLiBUaGUgcHJvamVjdGlvbiBhbHNvIHdvcmtzIHF1aXRlIHdlbGwgYXQgOTYwXHUwMEQ3NjAwIGlmIHlvdSBjaGFuZ2UgdGhlXG4vLyBzY2FsZSB0byAxMjg1IGFuZCBhZGp1c3QgdGhlIHRyYW5zbGF0ZSBhY2NvcmRpbmdseS4gVGhlIHNldCBvZiBzdGFuZGFyZFxuLy8gcGFyYWxsZWxzIGZvciBlYWNoIHJlZ2lvbiBjb21lcyBmcm9tIFVTR1MsIHdoaWNoIGlzIHB1Ymxpc2hlZCBoZXJlOlxuLy8gaHR0cDovL2Vnc2MudXNncy5nb3YvaXNiL3B1YnMvTWFwUHJvamVjdGlvbnMvcHJvamVjdGlvbnMuaHRtbCNhbGJlcnNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FjaGUsXG4gICAgICBjYWNoZVN0cmVhbSxcbiAgICAgIGxvd2VyNDggPSBhbGJlcnMoKSwgbG93ZXI0OFBvaW50LFxuICAgICAgYWxhc2thID0gY29uaWNFcXVhbEFyZWEoKS5yb3RhdGUoWzE1NCwgMF0pLmNlbnRlcihbLTIsIDU4LjVdKS5wYXJhbGxlbHMoWzU1LCA2NV0pLCBhbGFza2FQb2ludCwgLy8gRVBTRzozMzM4XG4gICAgICBoYXdhaWkgPSBjb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbMTU3LCAwXSkuY2VudGVyKFstMywgMTkuOV0pLnBhcmFsbGVscyhbOCwgMThdKSwgaGF3YWlpUG9pbnQsIC8vIEVTUkk6MTAyMDA3XG4gICAgICBwb2ludCwgcG9pbnRTdHJlYW0gPSB7cG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgcG9pbnQgPSBbeCwgeV07IH19O1xuXG4gIGZ1bmN0aW9uIGFsYmVyc1VzYShjb29yZGluYXRlcykge1xuICAgIHZhciB4ID0gY29vcmRpbmF0ZXNbMF0sIHkgPSBjb29yZGluYXRlc1sxXTtcbiAgICByZXR1cm4gcG9pbnQgPSBudWxsLFxuICAgICAgICAobG93ZXI0OFBvaW50LnBvaW50KHgsIHkpLCBwb2ludClcbiAgICAgICAgfHwgKGFsYXNrYVBvaW50LnBvaW50KHgsIHkpLCBwb2ludClcbiAgICAgICAgfHwgKGhhd2FpaVBvaW50LnBvaW50KHgsIHkpLCBwb2ludCk7XG4gIH1cblxuICBhbGJlcnNVc2EuaW52ZXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgayA9IGxvd2VyNDguc2NhbGUoKSxcbiAgICAgICAgdCA9IGxvd2VyNDgudHJhbnNsYXRlKCksXG4gICAgICAgIHggPSAoY29vcmRpbmF0ZXNbMF0gLSB0WzBdKSAvIGssXG4gICAgICAgIHkgPSAoY29vcmRpbmF0ZXNbMV0gLSB0WzFdKSAvIGs7XG4gICAgcmV0dXJuICh5ID49IDAuMTIwICYmIHkgPCAwLjIzNCAmJiB4ID49IC0wLjQyNSAmJiB4IDwgLTAuMjE0ID8gYWxhc2thXG4gICAgICAgIDogeSA+PSAwLjE2NiAmJiB5IDwgMC4yMzQgJiYgeCA+PSAtMC4yMTQgJiYgeCA8IC0wLjExNSA/IGhhd2FpaVxuICAgICAgICA6IGxvd2VyNDgpLmludmVydChjb29yZGluYXRlcyk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IG11bHRpcGxleChbbG93ZXI0OC5zdHJlYW0oY2FjaGVTdHJlYW0gPSBzdHJlYW0pLCBhbGFza2Euc3RyZWFtKHN0cmVhbSksIGhhd2FpaS5zdHJlYW0oc3RyZWFtKV0pO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5wcmVjaXNpb24oKTtcbiAgICBsb3dlcjQ4LnByZWNpc2lvbihfKSwgYWxhc2thLnByZWNpc2lvbihfKSwgaGF3YWlpLnByZWNpc2lvbihfKTtcbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfTtcblxuICBhbGJlcnNVc2Euc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5zY2FsZSgpO1xuICAgIGxvd2VyNDguc2NhbGUoXyksIGFsYXNrYS5zY2FsZShfICogMC4zNSksIGhhd2FpaS5zY2FsZShfKTtcbiAgICByZXR1cm4gYWxiZXJzVXNhLnRyYW5zbGF0ZShsb3dlcjQ4LnRyYW5zbGF0ZSgpKTtcbiAgfTtcblxuICBhbGJlcnNVc2EudHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDgudHJhbnNsYXRlKCk7XG4gICAgdmFyIGsgPSBsb3dlcjQ4LnNjYWxlKCksIHggPSArX1swXSwgeSA9ICtfWzFdO1xuXG4gICAgbG93ZXI0OFBvaW50ID0gbG93ZXI0OFxuICAgICAgICAudHJhbnNsYXRlKF8pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuNDU1ICogaywgeSAtIDAuMjM4ICoga10sIFt4ICsgMC40NTUgKiBrLCB5ICsgMC4yMzggKiBrXV0pXG4gICAgICAgIC5zdHJlYW0ocG9pbnRTdHJlYW0pO1xuXG4gICAgYWxhc2thUG9pbnQgPSBhbGFza2FcbiAgICAgICAgLnRyYW5zbGF0ZShbeCAtIDAuMzA3ICogaywgeSArIDAuMjAxICoga10pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuNDI1ICogayArIGVwc2lsb24sIHkgKyAwLjEyMCAqIGsgKyBlcHNpbG9uXSwgW3ggLSAwLjIxNCAqIGsgLSBlcHNpbG9uLCB5ICsgMC4yMzQgKiBrIC0gZXBzaWxvbl1dKVxuICAgICAgICAuc3RyZWFtKHBvaW50U3RyZWFtKTtcblxuICAgIGhhd2FpaVBvaW50ID0gaGF3YWlpXG4gICAgICAgIC50cmFuc2xhdGUoW3ggLSAwLjIwNSAqIGssIHkgKyAwLjIxMiAqIGtdKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjIxNCAqIGsgKyBlcHNpbG9uLCB5ICsgMC4xNjYgKiBrICsgZXBzaWxvbl0sIFt4IC0gMC4xMTUgKiBrIC0gZXBzaWxvbiwgeSArIDAuMjM0ICogayAtIGVwc2lsb25dXSlcbiAgICAgICAgLnN0cmVhbShwb2ludFN0cmVhbSk7XG5cbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0RXh0ZW50ID0gZnVuY3Rpb24oZXh0ZW50LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0RXh0ZW50KGFsYmVyc1VzYSwgZXh0ZW50LCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRTaXplID0gZnVuY3Rpb24oc2l6ZSwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFNpemUoYWxiZXJzVXNhLCBzaXplLCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0V2lkdGgoYWxiZXJzVXNhLCB3aWR0aCwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0SGVpZ2h0ID0gZnVuY3Rpb24oaGVpZ2h0LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0SGVpZ2h0KGFsYmVyc1VzYSwgaGVpZ2h0LCBvYmplY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgIHJldHVybiBhbGJlcnNVc2E7XG4gIH1cblxuICByZXR1cm4gYWxiZXJzVXNhLnNjYWxlKDEwNzApO1xufVxuIiwgImltcG9ydCB7YXNpbiwgYXRhbjIsIGNvcywgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gYXppbXV0aGFsUmF3KHNjYWxlKSB7XG4gIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGN4ID0gY29zKHgpLFxuICAgICAgICBjeSA9IGNvcyh5KSxcbiAgICAgICAgayA9IHNjYWxlKGN4ICogY3kpO1xuICAgICAgICBpZiAoayA9PT0gSW5maW5pdHkpIHJldHVybiBbMiwgMF07XG4gICAgcmV0dXJuIFtcbiAgICAgIGsgKiBjeSAqIHNpbih4KSxcbiAgICAgIGsgKiBzaW4oeSlcbiAgICBdO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhemltdXRoYWxJbnZlcnQoYW5nbGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgeiA9IHNxcnQoeCAqIHggKyB5ICogeSksXG4gICAgICAgIGMgPSBhbmdsZSh6KSxcbiAgICAgICAgc2MgPSBzaW4oYyksXG4gICAgICAgIGNjID0gY29zKGMpO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih4ICogc2MsIHogKiBjYyksXG4gICAgICBhc2luKHogJiYgeSAqIHNjIC8geilcbiAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHthc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHthemltdXRoYWxSYXcsIGF6aW11dGhhbEludmVydH0gZnJvbSBcIi4vYXppbXV0aGFsLmpzXCI7XG5pbXBvcnQgcHJvamVjdGlvbiBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgdmFyIGF6aW11dGhhbEVxdWFsQXJlYVJhdyA9IGF6aW11dGhhbFJhdyhmdW5jdGlvbihjeGN5KSB7XG4gIHJldHVybiBzcXJ0KDIgLyAoMSArIGN4Y3kpKTtcbn0pO1xuXG5hemltdXRoYWxFcXVhbEFyZWFSYXcuaW52ZXJ0ID0gYXppbXV0aGFsSW52ZXJ0KGZ1bmN0aW9uKHopIHtcbiAgcmV0dXJuIDIgKiBhc2luKHogLyAyKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHByb2plY3Rpb24oYXppbXV0aGFsRXF1YWxBcmVhUmF3KVxuICAgICAgLnNjYWxlKDEyNC43NSlcbiAgICAgIC5jbGlwQW5nbGUoMTgwIC0gMWUtMyk7XG59XG4iLCAiaW1wb3J0IHByb2plY3Rpb24gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBjb3MsIGVwc2lsb24yLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbnZhciBBMSA9IDEuMzQwMjY0LFxuICAgIEEyID0gLTAuMDgxMTA2LFxuICAgIEEzID0gMC4wMDA4OTMsXG4gICAgQTQgPSAwLjAwMzc5NixcbiAgICBNID0gc3FydCgzKSAvIDIsXG4gICAgaXRlcmF0aW9ucyA9IDEyO1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxFYXJ0aFJhdyhsYW1iZGEsIHBoaSkge1xuICB2YXIgbCA9IGFzaW4oTSAqIHNpbihwaGkpKSwgbDIgPSBsICogbCwgbDYgPSBsMiAqIGwyICogbDI7XG4gIHJldHVybiBbXG4gICAgbGFtYmRhICogY29zKGwpIC8gKE0gKiAoQTEgKyAzICogQTIgKiBsMiArIGw2ICogKDcgKiBBMyArIDkgKiBBNCAqIGwyKSkpLFxuICAgIGwgKiAoQTEgKyBBMiAqIGwyICsgbDYgKiAoQTMgKyBBNCAqIGwyKSlcbiAgXTtcbn1cblxuZXF1YWxFYXJ0aFJhdy5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gIHZhciBsID0geSwgbDIgPSBsICogbCwgbDYgPSBsMiAqIGwyICogbDI7XG4gIGZvciAodmFyIGkgPSAwLCBkZWx0YSwgZnksIGZweTsgaSA8IGl0ZXJhdGlvbnM7ICsraSkge1xuICAgIGZ5ID0gbCAqIChBMSArIEEyICogbDIgKyBsNiAqIChBMyArIEE0ICogbDIpKSAtIHk7XG4gICAgZnB5ID0gQTEgKyAzICogQTIgKiBsMiArIGw2ICogKDcgKiBBMyArIDkgKiBBNCAqIGwyKTtcbiAgICBsIC09IGRlbHRhID0gZnkgLyBmcHksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICAgIGlmIChhYnMoZGVsdGEpIDwgZXBzaWxvbjIpIGJyZWFrO1xuICB9XG4gIHJldHVybiBbXG4gICAgTSAqIHggKiAoQTEgKyAzICogQTIgKiBsMiArIGw2ICogKDcgKiBBMyArIDkgKiBBNCAqIGwyKSkgLyBjb3MobCksXG4gICAgYXNpbihzaW4obCkgLyBNKVxuICBdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKGVxdWFsRWFydGhSYXcpXG4gICAgICAuc2NhbGUoMTc3LjE1OCk7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGluaXRSYW5nZShkb21haW4sIHJhbmdlKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogYnJlYWs7XG4gICAgY2FzZSAxOiB0aGlzLnJhbmdlKGRvbWFpbik7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRoaXMucmFuZ2UocmFuZ2UpLmRvbWFpbihkb21haW4pOyBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRJbnRlcnBvbGF0b3IoZG9tYWluLCBpbnRlcnBvbGF0b3IpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHtcbiAgICAgIGlmICh0eXBlb2YgZG9tYWluID09PSBcImZ1bmN0aW9uXCIpIHRoaXMuaW50ZXJwb2xhdG9yKGRvbWFpbik7XG4gICAgICBlbHNlIHRoaXMucmFuZ2UoZG9tYWluKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB0aGlzLmRvbWFpbihkb21haW4pO1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnBvbGF0b3IgPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoaW50ZXJwb2xhdG9yKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShpbnRlcnBvbGF0b3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnN0YW50cyh4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBudW1iZXIoeCkge1xuICByZXR1cm4gK3g7XG59XG4iLCAiaW1wb3J0IHtiaXNlY3R9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZSBhcyBpbnRlcnBvbGF0ZVZhbHVlLCBpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciB1bml0ID0gWzAsIDFdO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKGEsIGIpIHtcbiAgcmV0dXJuIChiIC09IChhID0gK2EpKVxuICAgICAgPyBmdW5jdGlvbih4KSB7IHJldHVybiAoeCAtIGEpIC8gYjsgfVxuICAgICAgOiBjb25zdGFudChpc05hTihiKSA/IE5hTiA6IDAuNSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wZXIoYSwgYikge1xuICB2YXIgdDtcbiAgaWYgKGEgPiBiKSB0ID0gYSwgYSA9IGIsIGIgPSB0O1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gTWF0aC5tYXgoYSwgTWF0aC5taW4oYiwgeCkpOyB9O1xufVxuXG4vLyBub3JtYWxpemUoYSwgYikoeCkgdGFrZXMgYSBkb21haW4gdmFsdWUgeCBpbiBbYSxiXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXIgdCBpbiBbMCwxXS5cbi8vIGludGVycG9sYXRlKGEsIGIpKHQpIHRha2VzIGEgcGFyYW1ldGVyIHQgaW4gWzAsMV0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcmFuZ2UgdmFsdWUgeCBpbiBbYSxiXS5cbmZ1bmN0aW9uIGJpbWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBkMCA9IGRvbWFpblswXSwgZDEgPSBkb21haW5bMV0sIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV07XG4gIGlmIChkMSA8IGQwKSBkMCA9IG5vcm1hbGl6ZShkMSwgZDApLCByMCA9IGludGVycG9sYXRlKHIxLCByMCk7XG4gIGVsc2UgZDAgPSBub3JtYWxpemUoZDAsIGQxKSwgcjAgPSBpbnRlcnBvbGF0ZShyMCwgcjEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gcjAoZDAoeCkpOyB9O1xufVxuXG5mdW5jdGlvbiBwb2x5bWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBqID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDEsXG4gICAgICBkID0gbmV3IEFycmF5KGopLFxuICAgICAgciA9IG5ldyBBcnJheShqKSxcbiAgICAgIGkgPSAtMTtcblxuICAvLyBSZXZlcnNlIGRlc2NlbmRpbmcgZG9tYWlucy5cbiAgaWYgKGRvbWFpbltqXSA8IGRvbWFpblswXSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zbGljZSgpLnJldmVyc2UoKTtcbiAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgd2hpbGUgKCsraSA8IGopIHtcbiAgICBkW2ldID0gbm9ybWFsaXplKGRvbWFpbltpXSwgZG9tYWluW2kgKyAxXSk7XG4gICAgcltpXSA9IGludGVycG9sYXRlKHJhbmdlW2ldLCByYW5nZVtpICsgMV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgaSA9IGJpc2VjdChkb21haW4sIHgsIDEsIGopIC0gMTtcbiAgICByZXR1cm4gcltpXShkW2ldKHgpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAucmFuZ2Uoc291cmNlLnJhbmdlKCkpXG4gICAgICAuaW50ZXJwb2xhdGUoc291cmNlLmludGVycG9sYXRlKCkpXG4gICAgICAuY2xhbXAoc291cmNlLmNsYW1wKCkpXG4gICAgICAudW5rbm93bihzb3VyY2UudW5rbm93bigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgZG9tYWluID0gdW5pdCxcbiAgICAgIHJhbmdlID0gdW5pdCxcbiAgICAgIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIHVudHJhbnNmb3JtLFxuICAgICAgdW5rbm93bixcbiAgICAgIGNsYW1wID0gaWRlbnRpdHksXG4gICAgICBwaWVjZXdpc2UsXG4gICAgICBvdXRwdXQsXG4gICAgICBpbnB1dDtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKTtcbiAgICBpZiAoY2xhbXAgIT09IGlkZW50aXR5KSBjbGFtcCA9IGNsYW1wZXIoZG9tYWluWzBdLCBkb21haW5bbiAtIDFdKTtcbiAgICBwaWVjZXdpc2UgPSBuID4gMiA/IHBvbHltYXAgOiBiaW1hcDtcbiAgICBvdXRwdXQgPSBpbnB1dCA9IG51bGw7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiAob3V0cHV0IHx8IChvdXRwdXQgPSBwaWVjZXdpc2UoZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCByYW5nZSwgaW50ZXJwb2xhdGUpKSkodHJhbnNmb3JtKGNsYW1wKHgpKSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIGNsYW1wKHVudHJhbnNmb3JtKChpbnB1dCB8fCAoaW5wdXQgPSBwaWVjZXdpc2UocmFuZ2UsIGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgaW50ZXJwb2xhdGVOdW1iZXIpKSkoeSkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCByZXNjYWxlKCkpIDogZG9tYWluLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiByYW5nZSA9IEFycmF5LmZyb20oXyksIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVSb3VuZCwgcmVzY2FsZSgpO1xuICB9O1xuXG4gIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNsYW1wID0gXyA/IHRydWUgOiBpZGVudGl0eSwgcmVzY2FsZSgpKSA6IGNsYW1wICE9PSBpZGVudGl0eTtcbiAgfTtcblxuICBzY2FsZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbnRlcnBvbGF0ZSA9IF8sIHJlc2NhbGUoKSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0LCB1KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdW50cmFuc2Zvcm0gPSB1O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnRpbnVvdXMoKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcigpKGlkZW50aXR5LCBpZGVudGl0eSk7XG59XG4iLCAiaW1wb3J0IHt0aWNrU3RlcH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2Zvcm1hdCwgZm9ybWF0UHJlZml4LCBmb3JtYXRTcGVjaWZpZXIsIHByZWNpc2lvbkZpeGVkLCBwcmVjaXNpb25QcmVmaXgsIHByZWNpc2lvblJvdW5kfSBmcm9tIFwiZDMtZm9ybWF0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpY2tGb3JtYXQoc3RhcnQsIHN0b3AsIGNvdW50LCBzcGVjaWZpZXIpIHtcbiAgdmFyIHN0ZXAgPSB0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpLFxuICAgICAgcHJlY2lzaW9uO1xuICBzcGVjaWZpZXIgPSBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyID09IG51bGwgPyBcIixmXCIgOiBzcGVjaWZpZXIpO1xuICBzd2l0Y2ggKHNwZWNpZmllci50eXBlKSB7XG4gICAgY2FzZSBcInNcIjoge1xuICAgICAgdmFyIHZhbHVlID0gTWF0aC5tYXgoTWF0aC5hYnMoc3RhcnQpLCBNYXRoLmFicyhzdG9wKSk7XG4gICAgICBpZiAoc3BlY2lmaWVyLnByZWNpc2lvbiA9PSBudWxsICYmICFpc05hTihwcmVjaXNpb24gPSBwcmVjaXNpb25QcmVmaXgoc3RlcCwgdmFsdWUpKSkgc3BlY2lmaWVyLnByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICAgIHJldHVybiBmb3JtYXRQcmVmaXgoc3BlY2lmaWVyLCB2YWx1ZSk7XG4gICAgfVxuICAgIGNhc2UgXCJcIjpcbiAgICBjYXNlIFwiZVwiOlxuICAgIGNhc2UgXCJnXCI6XG4gICAgY2FzZSBcInBcIjpcbiAgICBjYXNlIFwiclwiOiB7XG4gICAgICBpZiAoc3BlY2lmaWVyLnByZWNpc2lvbiA9PSBudWxsICYmICFpc05hTihwcmVjaXNpb24gPSBwcmVjaXNpb25Sb3VuZChzdGVwLCBNYXRoLm1heChNYXRoLmFicyhzdGFydCksIE1hdGguYWJzKHN0b3ApKSkpKSBzcGVjaWZpZXIucHJlY2lzaW9uID0gcHJlY2lzaW9uIC0gKHNwZWNpZmllci50eXBlID09PSBcImVcIik7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSBcImZcIjpcbiAgICBjYXNlIFwiJVwiOiB7XG4gICAgICBpZiAoc3BlY2lmaWVyLnByZWNpc2lvbiA9PSBudWxsICYmICFpc05hTihwcmVjaXNpb24gPSBwcmVjaXNpb25GaXhlZChzdGVwKSkpIHNwZWNpZmllci5wcmVjaXNpb24gPSBwcmVjaXNpb24gLSAoc3BlY2lmaWVyLnR5cGUgPT09IFwiJVwiKSAqIDI7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZvcm1hdChzcGVjaWZpZXIpO1xufVxuIiwgImltcG9ydCB7dGlja3MsIHRpY2tJbmNyZW1lbnR9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IGNvbnRpbnVvdXMsIHtjb3B5fSBmcm9tIFwiLi9jb250aW51b3VzLmpzXCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IHRpY2tGb3JtYXQgZnJvbSBcIi4vdGlja0Zvcm1hdC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyaXNoKHNjYWxlKSB7XG4gIHZhciBkb21haW4gPSBzY2FsZS5kb21haW47XG5cbiAgc2NhbGUudGlja3MgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgcmV0dXJuIHRpY2tzKGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgY291bnQgPT0gbnVsbCA/IDEwIDogY291bnQpO1xuICB9O1xuXG4gIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihjb3VudCwgc3BlY2lmaWVyKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICByZXR1cm4gdGlja0Zvcm1hdChkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGNvdW50ID09IG51bGwgPyAxMCA6IGNvdW50LCBzcGVjaWZpZXIpO1xuICB9O1xuXG4gIHNjYWxlLm5pY2UgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIGlmIChjb3VudCA9PSBudWxsKSBjb3VudCA9IDEwO1xuXG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICB2YXIgaTAgPSAwO1xuICAgIHZhciBpMSA9IGQubGVuZ3RoIC0gMTtcbiAgICB2YXIgc3RhcnQgPSBkW2kwXTtcbiAgICB2YXIgc3RvcCA9IGRbaTFdO1xuICAgIHZhciBwcmVzdGVwO1xuICAgIHZhciBzdGVwO1xuICAgIHZhciBtYXhJdGVyID0gMTA7XG5cbiAgICBpZiAoc3RvcCA8IHN0YXJ0KSB7XG4gICAgICBzdGVwID0gc3RhcnQsIHN0YXJ0ID0gc3RvcCwgc3RvcCA9IHN0ZXA7XG4gICAgICBzdGVwID0gaTAsIGkwID0gaTEsIGkxID0gc3RlcDtcbiAgICB9XG4gICAgXG4gICAgd2hpbGUgKG1heEl0ZXItLSA+IDApIHtcbiAgICAgIHN0ZXAgPSB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gICAgICBpZiAoc3RlcCA9PT0gcHJlc3RlcCkge1xuICAgICAgICBkW2kwXSA9IHN0YXJ0XG4gICAgICAgIGRbaTFdID0gc3RvcFxuICAgICAgICByZXR1cm4gZG9tYWluKGQpO1xuICAgICAgfSBlbHNlIGlmIChzdGVwID4gMCkge1xuICAgICAgICBzdGFydCA9IE1hdGguZmxvb3Ioc3RhcnQgLyBzdGVwKSAqIHN0ZXA7XG4gICAgICAgIHN0b3AgPSBNYXRoLmNlaWwoc3RvcCAvIHN0ZXApICogc3RlcDtcbiAgICAgIH0gZWxzZSBpZiAoc3RlcCA8IDApIHtcbiAgICAgICAgc3RhcnQgPSBNYXRoLmNlaWwoc3RhcnQgKiBzdGVwKSAvIHN0ZXA7XG4gICAgICAgIHN0b3AgPSBNYXRoLmZsb29yKHN0b3AgKiBzdGVwKSAvIHN0ZXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHByZXN0ZXAgPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiBzY2FsZTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxpbmVhcigpIHtcbiAgdmFyIHNjYWxlID0gY29udGludW91cygpO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgbGluZWFyKCkpO1xuICB9O1xuXG4gIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcblxuICByZXR1cm4gbGluZWFyaXNoKHNjYWxlKTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gVHJhbnNmb3JtKGssIHgsIHkpIHtcbiAgdGhpcy5rID0gaztcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zZm9ybSxcbiAgc2NhbGU6IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gayA9PT0gMSA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuayAqIGssIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcbiAgdHJhbnNsYXRlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPT09IDAgJiB5ID09PSAwID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rLCB0aGlzLnggKyB0aGlzLmsgKiB4LCB0aGlzLnkgKyB0aGlzLmsgKiB5KTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIFtwb2ludFswXSAqIHRoaXMuayArIHRoaXMueCwgcG9pbnRbMV0gKiB0aGlzLmsgKyB0aGlzLnldO1xuICB9LFxuICBhcHBseVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMuayArIHRoaXMueDtcbiAgfSxcbiAgYXBwbHlZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLmsgKyB0aGlzLnk7XG4gIH0sXG4gIGludmVydDogZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICByZXR1cm4gWyhsb2NhdGlvblswXSAtIHRoaXMueCkgLyB0aGlzLmssIChsb2NhdGlvblsxXSAtIHRoaXMueSkgLyB0aGlzLmtdO1xuICB9LFxuICBpbnZlcnRYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICh4IC0gdGhpcy54KSAvIHRoaXMuaztcbiAgfSxcbiAgaW52ZXJ0WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiAoeSAtIHRoaXMueSkgLyB0aGlzLms7XG4gIH0sXG4gIHJlc2NhbGVYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHguY29weSgpLmRvbWFpbih4LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WCwgdGhpcykubWFwKHguaW52ZXJ0LCB4KSk7XG4gIH0sXG4gIHJlc2NhbGVZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkuY29weSgpLmRvbWFpbih5LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WSwgdGhpcykubWFwKHkuaW52ZXJ0LCB5KSk7XG4gIH0sXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnggKyBcIixcIiArIHRoaXMueSArIFwiKSBzY2FsZShcIiArIHRoaXMuayArIFwiKVwiO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0gbmV3IFRyYW5zZm9ybSgxLCAwLCAwKTtcblxudHJhbnNmb3JtLnByb3RvdHlwZSA9IFRyYW5zZm9ybS5wcm90b3R5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zZm9ybShub2RlKSB7XG4gIHdoaWxlICghbm9kZS5fX3pvb20pIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHJldHVybiBub2RlLl9fem9vbTtcbn1cbiIsICIvLyBQYXJjaG1lbnQgXHUyMDE0IGRhdGEgbG9hZGVyXG4vLyBMb2FkcyBKU09OIGFuZCB0ZXh0IGVpdGhlciBmcm9tIGFuIGlubGluZWQgPHNjcmlwdCB0eXBlPVwiYXBwbGljYXRpb24vanNvblwiIGRhdGEtcGF0aD1cIlx1MjAyNlwiPiBibG9ja1xuLy8gKHRoZSBvZmZsaW5lIHNpbmdsZS1maWxlIGJ1aWxkKSBvciBieSBmZXRjaGluZyBpdCByZWxhdGl2ZSB0byB0aGUgcGFnZSAoR2l0SHViIFBhZ2VzIC8gZGV2IHNlcnZlcikuXG5cbmNvbnN0IGNhY2hlID0gbmV3IE1hcCgpO1xuXG4vLyBKU09OIGZpbGVzIGFyZSBpbmxpbmVkIGFzIHRoZXkgYXJlOyBvdGhlciB0ZXh0IChyZWNvcmRzLmNzdikgaXMgaW5saW5lZCBhcyBhIEpTT04gc3RyaW5nIHNvIHRoYXQgbm90aGluZyBhblxuLy8gZWRpdG9yIHR5cGVzLCBub3QgZXZlbiBcIjwvc2NyaXB0PlwiLCBjYW4gZW5kIHRoZSBibG9jayBlYXJseS5cbmZ1bmN0aW9uIGlubGluZWQocGF0aCkge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXBhdGg9XCIke0NTUy5lc2NhcGUocGF0aCl9XCJdYCk7XG4gIGlmICghZWwpIHJldHVybiBudWxsO1xuICByZXR1cm4gZWwuZGF0YXNldC5lbmNvZGluZyA9PT0gJ2pzb24tc3RyaW5nJyA/IEpTT04ucGFyc2UoZWwudGV4dENvbnRlbnQpIDogZWwudGV4dENvbnRlbnQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dChwYXRoKSB7XG4gIGNvbnN0IGlubCA9IGlubGluZWQocGF0aCk7XG4gIGlmIChpbmwgIT09IG51bGwpIHJldHVybiBpbmw7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHBhdGgpO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgbG9hZCAke3BhdGh9IChIVFRQICR7cmVzLnN0YXR1c30pYCk7XG4gIHJldHVybiByZXMudGV4dCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEpTT04ocGF0aCkge1xuICBpZiAoIWNhY2hlLmhhcyhwYXRoKSkgY2FjaGUuc2V0KHBhdGgsIGxvYWRUZXh0KHBhdGgpLnRoZW4oKHQpID0+IEpTT04ucGFyc2UodCkpKTtcbiAgcmV0dXJuIGNhY2hlLmdldChwYXRoKTtcbn1cblxuLy8gVVJMIGZvciBhbiBhc3NldCAoaW1hZ2UpLiBUaGUgb2ZmbGluZSBidWlsZCByZWdpc3RlcnMgZGF0YTogVVJMcyBpbiB3aW5kb3cuX19QQVJDSE1FTlRfQVNTRVRTX18uXG5leHBvcnQgZnVuY3Rpb24gYXNzZXRVUkwocGF0aCkge1xuICBjb25zdCBhc3NldHMgPSBnbG9iYWxUaGlzLl9fUEFSQ0hNRU5UX0FTU0VUU19fO1xuICByZXR1cm4gKGFzc2V0cyAmJiBhc3NldHNbcGF0aF0pIHx8IHBhdGg7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4geDtcbn1cbiIsICJpbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNmb3JtKSB7XG4gIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICB2YXIgeDAsXG4gICAgICB5MCxcbiAgICAgIGt4ID0gdHJhbnNmb3JtLnNjYWxlWzBdLFxuICAgICAga3kgPSB0cmFuc2Zvcm0uc2NhbGVbMV0sXG4gICAgICBkeCA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMF0sXG4gICAgICBkeSA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCwgaSkge1xuICAgIGlmICghaSkgeDAgPSB5MCA9IDA7XG4gICAgdmFyIGogPSAyLCBuID0gaW5wdXQubGVuZ3RoLCBvdXRwdXQgPSBuZXcgQXJyYXkobik7XG4gICAgb3V0cHV0WzBdID0gKHgwICs9IGlucHV0WzBdKSAqIGt4ICsgZHg7XG4gICAgb3V0cHV0WzFdID0gKHkwICs9IGlucHV0WzFdKSAqIGt5ICsgZHk7XG4gICAgd2hpbGUgKGogPCBuKSBvdXRwdXRbal0gPSBpbnB1dFtqXSwgKytqO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYXJyYXksIG4pIHtcbiAgdmFyIHQsIGogPSBhcnJheS5sZW5ndGgsIGkgPSBqIC0gbjtcbiAgd2hpbGUgKGkgPCAtLWopIHQgPSBhcnJheVtpXSwgYXJyYXlbaSsrXSA9IGFycmF5W2pdLCBhcnJheVtqXSA9IHQ7XG59XG4iLCAiaW1wb3J0IHJldmVyc2UgZnJvbSBcIi4vcmV2ZXJzZS5qc1wiO1xuaW1wb3J0IHRyYW5zZm9ybSBmcm9tIFwiLi90cmFuc2Zvcm0uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odG9wb2xvZ3ksIG8pIHtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSBvID0gdG9wb2xvZ3kub2JqZWN0c1tvXTtcbiAgcmV0dXJuIG8udHlwZSA9PT0gXCJHZW9tZXRyeUNvbGxlY3Rpb25cIlxuICAgICAgPyB7dHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLCBmZWF0dXJlczogby5nZW9tZXRyaWVzLm1hcChmdW5jdGlvbihvKSB7IHJldHVybiBmZWF0dXJlKHRvcG9sb2d5LCBvKTsgfSl9XG4gICAgICA6IGZlYXR1cmUodG9wb2xvZ3ksIG8pO1xufVxuXG5mdW5jdGlvbiBmZWF0dXJlKHRvcG9sb2d5LCBvKSB7XG4gIHZhciBpZCA9IG8uaWQsXG4gICAgICBiYm94ID0gby5iYm94LFxuICAgICAgcHJvcGVydGllcyA9IG8ucHJvcGVydGllcyA9PSBudWxsID8ge30gOiBvLnByb3BlcnRpZXMsXG4gICAgICBnZW9tZXRyeSA9IG9iamVjdCh0b3BvbG9neSwgbyk7XG4gIHJldHVybiBpZCA9PSBudWxsICYmIGJib3ggPT0gbnVsbCA/IHt0eXBlOiBcIkZlYXR1cmVcIiwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fVxuICAgICAgOiBiYm94ID09IG51bGwgPyB7dHlwZTogXCJGZWF0dXJlXCIsIGlkOiBpZCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fVxuICAgICAgOiB7dHlwZTogXCJGZWF0dXJlXCIsIGlkOiBpZCwgYmJveDogYmJveCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdCh0b3BvbG9neSwgbykge1xuICB2YXIgdHJhbnNmb3JtUG9pbnQgPSB0cmFuc2Zvcm0odG9wb2xvZ3kudHJhbnNmb3JtKSxcbiAgICAgIGFyY3MgPSB0b3BvbG9neS5hcmNzO1xuXG4gIGZ1bmN0aW9uIGFyYyhpLCBwb2ludHMpIHtcbiAgICBpZiAocG9pbnRzLmxlbmd0aCkgcG9pbnRzLnBvcCgpO1xuICAgIGZvciAodmFyIGEgPSBhcmNzW2kgPCAwID8gfmkgOiBpXSwgayA9IDAsIG4gPSBhLmxlbmd0aDsgayA8IG47ICsraykge1xuICAgICAgcG9pbnRzLnB1c2godHJhbnNmb3JtUG9pbnQoYVtrXSwgaykpO1xuICAgIH1cbiAgICBpZiAoaSA8IDApIHJldmVyc2UocG9pbnRzLCBuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvaW50KHApIHtcbiAgICByZXR1cm4gdHJhbnNmb3JtUG9pbnQocCk7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lKGFyY3MpIHtcbiAgICB2YXIgcG9pbnRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmNzLmxlbmd0aDsgaSA8IG47ICsraSkgYXJjKGFyY3NbaV0sIHBvaW50cyk7XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPCAyKSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gcGVyIHRoZSBzcGVjaWZpY2F0aW9uLlxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cblxuICBmdW5jdGlvbiByaW5nKGFyY3MpIHtcbiAgICB2YXIgcG9pbnRzID0gbGluZShhcmNzKTtcbiAgICB3aGlsZSAocG9pbnRzLmxlbmd0aCA8IDQpIHBvaW50cy5wdXNoKHBvaW50c1swXSk7IC8vIFRoaXMgbWF5IGhhcHBlbiBpZiBhbiBhcmMgaGFzIG9ubHkgdHdvIHBvaW50cy5cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9seWdvbihhcmNzKSB7XG4gICAgcmV0dXJuIGFyY3MubWFwKHJpbmcpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VvbWV0cnkobykge1xuICAgIHZhciB0eXBlID0gby50eXBlLCBjb29yZGluYXRlcztcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJHZW9tZXRyeUNvbGxlY3Rpb25cIjogcmV0dXJuIHt0eXBlOiB0eXBlLCBnZW9tZXRyaWVzOiBvLmdlb21ldHJpZXMubWFwKGdlb21ldHJ5KX07XG4gICAgICBjYXNlIFwiUG9pbnRcIjogY29vcmRpbmF0ZXMgPSBwb2ludChvLmNvb3JkaW5hdGVzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2ludFwiOiBjb29yZGluYXRlcyA9IG8uY29vcmRpbmF0ZXMubWFwKHBvaW50KTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTGluZVN0cmluZ1wiOiBjb29yZGluYXRlcyA9IGxpbmUoby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlMaW5lU3RyaW5nXCI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChsaW5lKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiUG9seWdvblwiOiBjb29yZGluYXRlcyA9IHBvbHlnb24oby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2x5Z29uXCI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChwb2x5Z29uKTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9O1xuICB9XG5cbiAgcmV0dXJuIGdlb21ldHJ5KG8pO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRvcG9sb2d5LCBhcmNzKSB7XG4gIHZhciBzdGl0Y2hlZEFyY3MgPSB7fSxcbiAgICAgIGZyYWdtZW50QnlTdGFydCA9IHt9LFxuICAgICAgZnJhZ21lbnRCeUVuZCA9IHt9LFxuICAgICAgZnJhZ21lbnRzID0gW10sXG4gICAgICBlbXB0eUluZGV4ID0gLTE7XG5cbiAgLy8gU3RpdGNoIGVtcHR5IGFyY3MgZmlyc3QsIHNpbmNlIHRoZXkgbWF5IGJlIHN1YnN1bWVkIGJ5IG90aGVyIGFyY3MuXG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpLCBqKSB7XG4gICAgdmFyIGFyYyA9IHRvcG9sb2d5LmFyY3NbaSA8IDAgPyB+aSA6IGldLCB0O1xuICAgIGlmIChhcmMubGVuZ3RoIDwgMyAmJiAhYXJjWzFdWzBdICYmICFhcmNbMV1bMV0pIHtcbiAgICAgIHQgPSBhcmNzWysrZW1wdHlJbmRleF0sIGFyY3NbZW1wdHlJbmRleF0gPSBpLCBhcmNzW2pdID0gdDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpKSB7XG4gICAgdmFyIGUgPSBlbmRzKGkpLFxuICAgICAgICBzdGFydCA9IGVbMF0sXG4gICAgICAgIGVuZCA9IGVbMV0sXG4gICAgICAgIGYsIGc7XG5cbiAgICBpZiAoZiA9IGZyYWdtZW50QnlFbmRbc3RhcnRdKSB7XG4gICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtmLmVuZF07XG4gICAgICBmLnB1c2goaSk7XG4gICAgICBmLmVuZCA9IGVuZDtcbiAgICAgIGlmIChnID0gZnJhZ21lbnRCeVN0YXJ0W2VuZF0pIHtcbiAgICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtnLnN0YXJ0XTtcbiAgICAgICAgdmFyIGZnID0gZyA9PT0gZiA/IGYgOiBmLmNvbmNhdChnKTtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W2ZnLnN0YXJ0ID0gZi5zdGFydF0gPSBmcmFnbWVudEJ5RW5kW2ZnLmVuZCA9IGcuZW5kXSA9IGZnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmLmVuZF0gPSBmO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZiA9IGZyYWdtZW50QnlTdGFydFtlbmRdKSB7XG4gICAgICBkZWxldGUgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdO1xuICAgICAgZi51bnNoaWZ0KGkpO1xuICAgICAgZi5zdGFydCA9IHN0YXJ0O1xuICAgICAgaWYgKGcgPSBmcmFnbWVudEJ5RW5kW3N0YXJ0XSkge1xuICAgICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtnLmVuZF07XG4gICAgICAgIHZhciBnZiA9IGcgPT09IGYgPyBmIDogZy5jb25jYXQoZik7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtnZi5zdGFydCA9IGcuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtnZi5lbmQgPSBmLmVuZF0gPSBnZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmRdID0gZjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZiA9IFtpXTtcbiAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0ID0gc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmLmVuZCA9IGVuZF0gPSBmO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gZW5kcyhpKSB7XG4gICAgdmFyIGFyYyA9IHRvcG9sb2d5LmFyY3NbaSA8IDAgPyB+aSA6IGldLCBwMCA9IGFyY1swXSwgcDE7XG4gICAgaWYgKHRvcG9sb2d5LnRyYW5zZm9ybSkgcDEgPSBbMCwgMF0sIGFyYy5mb3JFYWNoKGZ1bmN0aW9uKGRwKSB7IHAxWzBdICs9IGRwWzBdLCBwMVsxXSArPSBkcFsxXTsgfSk7XG4gICAgZWxzZSBwMSA9IGFyY1thcmMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIGkgPCAwID8gW3AxLCBwMF0gOiBbcDAsIHAxXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKGZyYWdtZW50QnlFbmQsIGZyYWdtZW50QnlTdGFydCkge1xuICAgIGZvciAodmFyIGsgaW4gZnJhZ21lbnRCeUVuZCkge1xuICAgICAgdmFyIGYgPSBmcmFnbWVudEJ5RW5kW2tdO1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XTtcbiAgICAgIGRlbGV0ZSBmLnN0YXJ0O1xuICAgICAgZGVsZXRlIGYuZW5kO1xuICAgICAgZi5mb3JFYWNoKGZ1bmN0aW9uKGkpIHsgc3RpdGNoZWRBcmNzW2kgPCAwID8gfmkgOiBpXSA9IDE7IH0pO1xuICAgICAgZnJhZ21lbnRzLnB1c2goZik7XG4gICAgfVxuICB9XG5cbiAgZmx1c2goZnJhZ21lbnRCeUVuZCwgZnJhZ21lbnRCeVN0YXJ0KTtcbiAgZmx1c2goZnJhZ21lbnRCeVN0YXJ0LCBmcmFnbWVudEJ5RW5kKTtcbiAgYXJjcy5mb3JFYWNoKGZ1bmN0aW9uKGkpIHsgaWYgKCFzdGl0Y2hlZEFyY3NbaSA8IDAgPyB+aSA6IGldKSBmcmFnbWVudHMucHVzaChbaV0pOyB9KTtcblxuICByZXR1cm4gZnJhZ21lbnRzO1xufVxuIiwgImltcG9ydCB7b2JqZWN0fSBmcm9tIFwiLi9mZWF0dXJlLmpzXCI7XG5pbXBvcnQgc3RpdGNoIGZyb20gXCIuL3N0aXRjaC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0b3BvbG9neSkge1xuICByZXR1cm4gb2JqZWN0KHRvcG9sb2d5LCBtZXNoQXJjcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc2hBcmNzKHRvcG9sb2d5LCBvYmplY3QsIGZpbHRlcikge1xuICB2YXIgYXJjcywgaSwgbjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcmNzID0gZXh0cmFjdEFyY3ModG9wb2xvZ3ksIG9iamVjdCwgZmlsdGVyKTtcbiAgZWxzZSBmb3IgKGkgPSAwLCBhcmNzID0gbmV3IEFycmF5KG4gPSB0b3BvbG9neS5hcmNzLmxlbmd0aCk7IGkgPCBuOyArK2kpIGFyY3NbaV0gPSBpO1xuICByZXR1cm4ge3R5cGU6IFwiTXVsdGlMaW5lU3RyaW5nXCIsIGFyY3M6IHN0aXRjaCh0b3BvbG9neSwgYXJjcyl9O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0QXJjcyh0b3BvbG9neSwgb2JqZWN0LCBmaWx0ZXIpIHtcbiAgdmFyIGFyY3MgPSBbXSxcbiAgICAgIGdlb21zQnlBcmMgPSBbXSxcbiAgICAgIGdlb207XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDAoaSkge1xuICAgIHZhciBqID0gaSA8IDAgPyB+aSA6IGk7XG4gICAgKGdlb21zQnlBcmNbal0gfHwgKGdlb21zQnlBcmNbal0gPSBbXSkpLnB1c2goe2k6IGksIGc6IGdlb219KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3QxKGFyY3MpIHtcbiAgICBhcmNzLmZvckVhY2goZXh0cmFjdDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDIoYXJjcykge1xuICAgIGFyY3MuZm9yRWFjaChleHRyYWN0MSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0MyhhcmNzKSB7XG4gICAgYXJjcy5mb3JFYWNoKGV4dHJhY3QyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlb21ldHJ5KG8pIHtcbiAgICBzd2l0Y2ggKGdlb20gPSBvLCBvLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJHZW9tZXRyeUNvbGxlY3Rpb25cIjogby5nZW9tZXRyaWVzLmZvckVhY2goZ2VvbWV0cnkpOyBicmVhaztcbiAgICAgIGNhc2UgXCJMaW5lU3RyaW5nXCI6IGV4dHJhY3QxKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpTGluZVN0cmluZ1wiOiBjYXNlIFwiUG9seWdvblwiOiBleHRyYWN0MihvLmFyY3MpOyBicmVhaztcbiAgICAgIGNhc2UgXCJNdWx0aVBvbHlnb25cIjogZXh0cmFjdDMoby5hcmNzKTsgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZ2VvbWV0cnkob2JqZWN0KTtcblxuICBnZW9tc0J5QXJjLmZvckVhY2goZmlsdGVyID09IG51bGxcbiAgICAgID8gZnVuY3Rpb24oZ2VvbXMpIHsgYXJjcy5wdXNoKGdlb21zWzBdLmkpOyB9XG4gICAgICA6IGZ1bmN0aW9uKGdlb21zKSB7IGlmIChmaWx0ZXIoZ2VvbXNbMF0uZywgZ2VvbXNbZ2VvbXMubGVuZ3RoIC0gMV0uZykpIGFyY3MucHVzaChnZW9tc1swXS5pKTsgfSk7XG5cbiAgcmV0dXJuIGFyY3M7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBwYXBlclxuLy8gUHJvY2VkdXJhbCBwYXJjaG1lbnQgZ3JvdW5kOiBmaWJyZSBhbmQgZ3JhaW4gZnJvbSBTVkcgdHVyYnVsZW5jZSAobm8gc3RvY2sgdGV4dHVyZXMpLCBwbHVzIGEgc29mdCB2aWduZXR0ZS5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcGVyRGVmcyhkZWZzKSB7XG4gIGNvbnN0IGdyYWluID0gZGVmcy5hcHBlbmQoJ2ZpbHRlcicpLmF0dHIoJ2lkJywgJ3BhcGVyLWdyYWluJylcbiAgICAuYXR0cigneCcsICcwJScpLmF0dHIoJ3knLCAnMCUnKS5hdHRyKCd3aWR0aCcsICcxMDAlJykuYXR0cignaGVpZ2h0JywgJzEwMCUnKVxuICAgIC5hdHRyKCdjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnMnLCAnc1JHQicpO1xuICAvLyBmaW5lIGdyYWluXG4gIGdyYWluLmFwcGVuZCgnZmVUdXJidWxlbmNlJykuYXR0cigndHlwZScsICdmcmFjdGFsTm9pc2UnKS5hdHRyKCdiYXNlRnJlcXVlbmN5JywgJzAuOScpLmF0dHIoJ251bU9jdGF2ZXMnLCAyKS5hdHRyKCdzZWVkJywgMTEpLmF0dHIoJ3N0aXRjaFRpbGVzJywgJ3N0aXRjaCcpLmF0dHIoJ3Jlc3VsdCcsICdmaW5lJyk7XG4gIC8vIGZhaW50LCBsb25nIGZpYnJlcyAoZ2VudGxlOiBwYXJjaG1lbnQsIG5vdCB3b29kKVxuICBncmFpbi5hcHBlbmQoJ2ZlVHVyYnVsZW5jZScpLmF0dHIoJ3R5cGUnLCAnZnJhY3RhbE5vaXNlJykuYXR0cignYmFzZUZyZXF1ZW5jeScsICcwLjAwNiAwLjA1JykuYXR0cignbnVtT2N0YXZlcycsIDIpLmF0dHIoJ3NlZWQnLCA0KS5hdHRyKCdzdGl0Y2hUaWxlcycsICdzdGl0Y2gnKS5hdHRyKCdyZXN1bHQnLCAnZmlicmUnKTtcbiAgZ3JhaW4uYXBwZW5kKCdmZUJsZW5kJykuYXR0cignaW4nLCAnZmluZScpLmF0dHIoJ2luMicsICdmaWJyZScpLmF0dHIoJ21vZGUnLCAnc2NyZWVuJykuYXR0cigncmVzdWx0JywgJ25vaXNlJyk7XG4gIGdyYWluLmFwcGVuZCgnZmVDb2xvck1hdHJpeCcpLmF0dHIoJ2luJywgJ25vaXNlJykuYXR0cigndHlwZScsICdzYXR1cmF0ZScpLmF0dHIoJ3ZhbHVlcycsICcwJykuYXR0cigncmVzdWx0JywgJ2dyYXknKTtcbiAgLy8gbGlmdCB0aGUgZ3JheSBjbG9zZSB0byB3aGl0ZSBzbyB0aGUgbXVsdGlwbHkgb25seSBkYXJrZW5zIGEgZmV3IHBlcmNlbnQsIGFuZCBmbGF0dGVuIGFscGhhXG4gIGNvbnN0IGN0ID0gZ3JhaW4uYXBwZW5kKCdmZUNvbXBvbmVudFRyYW5zZmVyJykuYXR0cignaW4nLCAnZ3JheScpLmF0dHIoJ3Jlc3VsdCcsICd0ZXgnKTtcbiAgY3QuYXBwZW5kKCdmZUZ1bmNSJykuYXR0cigndHlwZScsICdsaW5lYXInKS5hdHRyKCdzbG9wZScsIDAuMjIpLmF0dHIoJ2ludGVyY2VwdCcsIDAuOCk7XG4gIGN0LmFwcGVuZCgnZmVGdW5jRycpLmF0dHIoJ3R5cGUnLCAnbGluZWFyJykuYXR0cignc2xvcGUnLCAwLjIyKS5hdHRyKCdpbnRlcmNlcHQnLCAwLjgpO1xuICBjdC5hcHBlbmQoJ2ZlRnVuY0InKS5hdHRyKCd0eXBlJywgJ2xpbmVhcicpLmF0dHIoJ3Nsb3BlJywgMC4yMikuYXR0cignaW50ZXJjZXB0JywgMC44KTtcbiAgY3QuYXBwZW5kKCdmZUZ1bmNBJykuYXR0cigndHlwZScsICd0YWJsZScpLmF0dHIoJ3RhYmxlVmFsdWVzJywgJzEgMScpO1xuICBncmFpbi5hcHBlbmQoJ2ZlQmxlbmQnKS5hdHRyKCdpbicsICdTb3VyY2VHcmFwaGljJykuYXR0cignaW4yJywgJ3RleCcpLmF0dHIoJ21vZGUnLCAnbXVsdGlwbHknKTtcblxuICBjb25zdCB2aWduZXR0ZSA9IGRlZnMuYXBwZW5kKCdyYWRpYWxHcmFkaWVudCcpLmF0dHIoJ2lkJywgJ3BhcGVyLXZpZ25ldHRlJykuYXR0cignY3gnLCAnNTAlJykuYXR0cignY3knLCAnNTAlJykuYXR0cigncicsICc3MiUnKTtcbiAgdmlnbmV0dGUuYXBwZW5kKCdzdG9wJykuYXR0cignb2Zmc2V0JywgJzU1JScpLmF0dHIoJ3N0b3AtY29sb3InLCAnIzAwMCcpLmF0dHIoJ3N0b3Atb3BhY2l0eScsIDApO1xuICB2aWduZXR0ZS5hcHBlbmQoJ3N0b3AnKS5hdHRyKCdvZmZzZXQnLCAnMTAwJScpLmF0dHIoJ3N0b3AtY29sb3InLCAnIzRhM2ExYycpLmF0dHIoJ3N0b3Atb3BhY2l0eScsIDAuMjIpO1xufVxuXG4vLyBUaGUgcGFwZXIgaXRzZWxmOiBmdWxsLWJsZWVkIHBhcmNobWVudCB3aXRoIGdyYWluLlxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdQYXBlcihyb290LCBXLCBIKSB7XG4gIHJvb3QuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAncGFwZXInKS5hdHRyKCd3aWR0aCcsIFcpLmF0dHIoJ2hlaWdodCcsIEgpLmF0dHIoJ2ZpbHRlcicsICd1cmwoI3BhcGVyLWdyYWluKScpO1xufVxuXG4vLyBHcmFpbiBhbmQgdmlnbmV0dGUgbGFpZCBvdmVyIHRoZSBmaW5pc2hlZCBtYXAgc28gbGFuZCBhbmQgc2VhIHNoYXJlIHRoZSBzaGVldC5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3UGFwZXJPdmVybGF5KHJvb3QsIFcsIEgpIHtcbiAgcm9vdC5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdwYXBlci1vdmVybGF5JykuYXR0cignd2lkdGgnLCBXKS5hdHRyKCdoZWlnaHQnLCBIKS5hdHRyKCdmaWx0ZXInLCAndXJsKCNwYXBlci1ncmFpbiknKTtcbiAgcm9vdC5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdwYXBlci12aWduZXR0ZScpLmF0dHIoJ3dpZHRoJywgVykuYXR0cignaGVpZ2h0JywgSCkuYXR0cignZmlsbCcsICd1cmwoI3BhcGVyLXZpZ25ldHRlKScpO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgbGFiZWxzXG4vLyBTdGFnZSBsYWJlbHMgKHJlZ2lvbnMgaW4gc3BhY2VkIHNtYWxsIGNhcHMsIHdhdGVyIGluIGl0YWxpYykgc2V0IGFsb25nIHRoZWlyIHBhcmFsbGVsIHNvIHRoZXkgZm9sbG93IHRoZVxuLy8gcHJvamVjdGlvbidzIGN1cnZlOyBwb2xpdHkgbGFiZWxzIGZvciBoaWdobGlnaHRlZCBzdGF0ZXMgYXQgdGhlIGxhcmdlc3QgcG9seWdvbidzIGNlbnRyZS5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZHJhd1N0YWdlTGFiZWxzKGxheWVyLCBkZWZzLCBzdGFnZSwgcGF0aCkge1xuICAoc3RhZ2UubGFiZWxzID8/IFtdKS5mb3JFYWNoKChsLCBpKSA9PiB7XG4gICAgLy8gVGhlIGFyYyBpcyBvbmx5IGEgZ3VpZGUgZm9yIHRoZSB0ZXh0LCBzbyBpdCBjYW4gYmUgbXVjaCBsb25nZXIgdGhhbiB0aGUgbmFtZTsgYSBzaG9ydCBvbmUgY2xpcHMgdGhlIGVuZHMuXG4gICAgY29uc3Qgc3BhbiA9IGwuc3BhbiA/PyAobC5raW5kID09PSAnd2F0ZXInID8gNTAgOiA3MCk7XG4gICAgY29uc3QgYXJjID0geyB0eXBlOiAnTGluZVN0cmluZycsIGNvb3JkaW5hdGVzOiBkMy5yYW5nZShsLmxvbiAtIHNwYW4gLyAyLCBsLmxvbiArIHNwYW4gLyAyICsgMWUtNiwgMC41KS5tYXAoKHgpID0+IFt4LCBsLmxhdF0pIH07XG4gICAgY29uc3QgaWQgPSBgc3RhZ2UtbGFiZWwtJHtzdGFnZS5pZH0tJHtpfWA7XG4gICAgZGVmcy5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdpZCcsIGlkKS5hdHRyKCdkJywgcGF0aChhcmMpKTtcbiAgICBsYXllci5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsIGBsYWJlbCAke2wua2luZH1gKVxuICAgICAgLmFwcGVuZCgndGV4dFBhdGgnKS5hdHRyKCdocmVmJywgYCMke2lkfWApLmF0dHIoJ3N0YXJ0T2Zmc2V0JywgJzUwJScpLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAudGV4dChsLnRleHQpO1xuICB9KTtcbn1cblxuLy8gTGFyZ2VzdCBwb2x5Z29uIG9mIGEgKE11bHRpKVBvbHlnb24gZmVhdHVyZSwgYnkgc3BoZXJpY2FsIGFyZWEuXG5mdW5jdGlvbiBsYXJnZXN0UG9seWdvbihmKSB7XG4gIGNvbnN0IGcgPSBmLmdlb21ldHJ5O1xuICBpZiAoZy50eXBlID09PSAnUG9seWdvbicpIHJldHVybiBnO1xuICBsZXQgYmVzdCA9IG51bGwsIGJlc3RBcmVhID0gLTE7XG4gIGZvciAoY29uc3QgY29vcmRzIG9mIGcuY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBwb2x5ID0geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBjb29yZHMgfTtcbiAgICBjb25zdCBhID0gZDMuZ2VvQXJlYShwb2x5KTtcbiAgICBpZiAoYSA+IGJlc3RBcmVhKSB7IGJlc3RBcmVhID0gYTsgYmVzdCA9IHBvbHk7IH1cbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvbGl0eUxhYmVsRGF0YShmZWF0dXJlcywgcGF0aCkge1xuICAvLyBPbmUgbGFiZWwgcGVyIG5hbWU6IHNvbWUgYmFzZSBtYXBzIHNwbGl0IGEgc3RhdGUgaW50byBzZXZlcmFsIHNhbWUtbmFtZWQgcG9seWdvbnM7IGxhYmVsIHRoZSBsYXJnZXN0LlxuICBjb25zdCBiZXN0ID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGYgb2YgZmVhdHVyZXMpIHtcbiAgICBjb25zdCBwb2x5ID0gbGFyZ2VzdFBvbHlnb24oZik7XG4gICAgaWYgKCFwb2x5KSBjb250aW51ZTtcbiAgICBjb25zdCBbW2J4MCwgYnkwXSwgW2J4MSwgYnkxXV0gPSBwYXRoLmJvdW5kcyhwb2x5KTtcbiAgICBjb25zdCB3ID0gYngxIC0gYngwLCBoID0gYnkxIC0gYnkwO1xuICAgIGlmICghKHcgPiA3MCAmJiBoID4gMjQpKSBjb250aW51ZTsgLy8gdG9vIHNtYWxsIHRvIGNhcnJ5IGEgbmFtZSBhdCB0aGlzIHNjYWxlXG4gICAgY29uc3QgW2N4LCBjeV0gPSBwYXRoLmNlbnRyb2lkKHBvbHkpO1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGN4KSkgY29udGludWU7XG4gICAgY29uc3QgdGV4dCA9IGYucHJvcGVydGllcy5jbHM/LmxhYmVsID8/IGYucHJvcGVydGllcy5uYW1lO1xuICAgIGNvbnN0IGFyZWEgPSB3ICogaDtcbiAgICBjb25zdCBwcmV2ID0gYmVzdC5nZXQodGV4dCk7XG4gICAgaWYgKHByZXYgJiYgcHJldi5hcmVhID49IGFyZWEpIGNvbnRpbnVlO1xuICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCgxMywgTWF0aC5taW4oMjQsIE1hdGguc3FydChhcmVhKSAvIDE2KSk7XG4gICAgYmVzdC5zZXQodGV4dCwgeyBpZDogdGV4dCwgdGV4dCwgeDogY3gsIHk6IGN5LCBzaXplLCBhcmVhIH0pO1xuICB9XG4gIHJldHVybiBbLi4uYmVzdC52YWx1ZXMoKV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3UG9saXR5TGFiZWxzKGxheWVyLCBkYXRhKSB7XG4gIGxheWVyLnNlbGVjdEFsbCgndGV4dCcpLmRhdGEoZGF0YSwgKGQpID0+IGQuaWQpLmpvaW4oJ3RleHQnKVxuICAgIC5hdHRyKCdjbGFzcycsICdsYWJlbCBwb2xpdHknKVxuICAgIC5hdHRyKCd4JywgKGQpID0+IGQueCkuYXR0cigneScsIChkKSA9PiBkLnkpXG4gICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIChkKSA9PiBkLnNpemUpXG4gICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpLmF0dHIoJ2RvbWluYW50LWJhc2VsaW5lJywgJ21pZGRsZScpXG4gICAgLnRleHQoKGQpID0+IGQudGV4dCk7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBjYXJ0b3VjaGVcbi8vIEJvdHRvbS1sZWZ0IGJyYWNrZXRlZCBib3g6IFBBUkNITUVOVCB3b3JkbWFyayBcdTAwQjcgbWFwIHRpdGxlIFx1MDBCNyB5ZWFyIHNob3duIFx1MDBCNyBzY2FsZSBiYXIuIE5vdGhpbmcgZWxzZS5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5mdW5jdGlvbiBzY2FsZUJhcihwcm9qZWN0aW9uLCBjZW50ZXIsIHRhcmdldFB4ID0gMTcwKSB7XG4gIGNvbnN0IFtsb24sIGxhdF0gPSBjZW50ZXI7XG4gIGNvbnN0IHAxID0gcHJvamVjdGlvbihbbG9uLCBsYXRdKSwgcDIgPSBwcm9qZWN0aW9uKFtsb24gKyAxLCBsYXRdKTtcbiAgaWYgKCFwMSB8fCAhcDIpIHJldHVybiB7IGttOiAxMDAwLCBweDogdGFyZ2V0UHggfTtcbiAgY29uc3Qga21QZXJEZWcgPSBkMy5nZW9EaXN0YW5jZShbbG9uLCBsYXRdLCBbbG9uICsgMSwgbGF0XSkgKiA2MzcxO1xuICBjb25zdCBweFBlckttID0gTWF0aC5oeXBvdChwMlswXSAtIHAxWzBdLCBwMlsxXSAtIHAxWzFdKSAvIGttUGVyRGVnO1xuICBjb25zdCBrbSA9IFsxMDAsIDIwMCwgMjUwLCA1MDAsIDEwMDAsIDIwMDAsIDMwMDAsIDUwMDBdLnJlZHVjZSgoYiwgaykgPT4gKE1hdGguYWJzKGsgKiBweFBlckttIC0gdGFyZ2V0UHgpIDwgTWF0aC5hYnMoYiAqIHB4UGVyS20gLSB0YXJnZXRQeCkgPyBrIDogYikpO1xuICByZXR1cm4geyBrbSwgcHg6IGttICogcHhQZXJLbSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FydG91Y2hlKHJvb3QsIHsgeDAsIHkxIH0sIHN0YWdlLCBwcm9qZWN0aW9uKSB7XG4gIGNvbnN0IFcgPSAzODAsIEggPSAxMjgsIFBBRCA9IDE2O1xuICBjb25zdCB4ID0geDAgKyAyMiwgeSA9IHkxIC0gMjIgLSBIO1xuICBjb25zdCBnID0gcm9vdC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdjYXJ0b3VjaGUnKS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgKTtcbiAgZy5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdjYXJ0b3VjaGUtYm94JykuYXR0cignd2lkdGgnLCBXKS5hdHRyKCdoZWlnaHQnLCBIKTtcbiAgLy8gY29ybmVyIGJyYWNrZXRzXG4gIGNvbnN0IGIgPSAxMiwgbyA9IDU7XG4gIGNvbnN0IGNvcm5lcnMgPSBbWy1vLCAtbywgMSwgMV0sIFtXICsgbywgLW8sIC0xLCAxXSwgWy1vLCBIICsgbywgMSwgLTFdLCBbVyArIG8sIEggKyBvLCAtMSwgLTFdXTtcbiAgZy5zZWxlY3RBbGwoJ3BhdGguYnJhY2tldCcpLmRhdGEoY29ybmVycykuam9pbigncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2JyYWNrZXQnKVxuICAgIC5hdHRyKCdkJywgKFtjeCwgY3ksIHN4LCBzeV0pID0+IGBNJHtjeCArIHN4ICogYn0sJHtjeX1MJHtjeH0sJHtjeX1MJHtjeH0sJHtjeSArIHN5ICogYn1gKTtcblxuICBnLmFwcGVuZCgndGV4dCcpLmF0dHIoJ2NsYXNzJywgJ3dvcmRtYXJrJykuYXR0cigneCcsIFBBRCkuYXR0cigneScsIFBBRCArIDEyKS50ZXh0KCdQQVJDSE1FTlQnKTtcbiAgZy5hcHBlbmQoJ2xpbmUnKS5hdHRyKCdjbGFzcycsICdydWxlJykuYXR0cigneDEnLCBQQUQpLmF0dHIoJ3gyJywgVyAtIFBBRCkuYXR0cigneTEnLCBQQUQgKyAyMCkuYXR0cigneTInLCBQQUQgKyAyMCk7XG4gIGNvbnN0IHRpdGxlID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICdtYXAtdGl0bGUnKS5hdHRyKCd4JywgUEFEKS5hdHRyKCd5JywgUEFEICsgNDYpLnRleHQoc3RhZ2UudGl0bGUpO1xuICBjb25zdCB5ZWFyID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICd5ZWFyJykuYXR0cigneCcsIFcgLSBQQUQpLmF0dHIoJ3knLCBQQUQgKyA0OCkuYXR0cigndGV4dC1hbmNob3InLCAnZW5kJyk7XG4gIGNvbnN0IGJhc2VOb3RlID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICdiYXNlLW5vdGUnKS5hdHRyKCd4JywgVyAtIFBBRCkuYXR0cigneScsIFBBRCArIDY0KS5hdHRyKCd0ZXh0LWFuY2hvcicsICdlbmQnKTtcblxuICAvLyBzY2FsZSBiYXJcbiAgY29uc3QgZSA9IHN0YWdlLmV4dGVudDtcbiAgY29uc3QgeyBrbSwgcHggfSA9IHNjYWxlQmFyKHByb2plY3Rpb24sIFsoZS53ZXN0ICsgZS5lYXN0KSAvIDIsIChlLnNvdXRoICsgZS5ub3J0aCkgLyAyXSk7XG4gIGNvbnN0IHNiID0gZy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzY2FsZWJhcicpLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHtQQUR9LCR7SCAtIFBBRCAtIDEwfSlgKTtcbiAgc2IuYXBwZW5kKCdsaW5lJykuYXR0cigneDEnLCAwKS5hdHRyKCd4MicsIHB4KS5hdHRyKCd5MScsIDApLmF0dHIoJ3kyJywgMCk7XG4gIHNiLnNlbGVjdEFsbCgnbGluZS50aWNrJykuZGF0YShbMCwgcHggLyAyLCBweF0pLmpvaW4oJ2xpbmUnKS5hdHRyKCdjbGFzcycsICd0aWNrJylcbiAgICAuYXR0cigneDEnLCAoZCkgPT4gZCkuYXR0cigneDInLCAoZCkgPT4gZCkuYXR0cigneTEnLCAtNSkuYXR0cigneTInLCAwKTtcbiAgc2IuYXBwZW5kKCdyZWN0JykuYXR0cigneCcsIDApLmF0dHIoJ3knLCAtMykuYXR0cignd2lkdGgnLCBweCAvIDIpLmF0dHIoJ2hlaWdodCcsIDMpO1xuICBzYi5hcHBlbmQoJ3RleHQnKS5hdHRyKCd4JywgcHggKyA4KS5hdHRyKCd5JywgMSkudGV4dChgJHtrbS50b0xvY2FsZVN0cmluZygnZW4tVVMnKX0ga21gKTtcblxuICByZXR1cm4ge1xuICAgIHNldFRpdGxlKHRleHQpIHsgdGl0bGUudGV4dCh0ZXh0KTsgfSxcbiAgICBzZXRZZWFyKHksIHNvdXJjZVllYXIpIHtcbiAgICAgIHllYXIuY2xhc3NlZCgncmFuZ2UnLCBmYWxzZSkudGV4dCh5IDwgMCA/IGAkey15fSBCQ0VgIDogeSk7XG4gICAgICBiYXNlTm90ZS50ZXh0KHNvdXJjZVllYXIgIT0gbnVsbCAmJiBzb3VyY2VZZWFyICE9PSB5ID8gYGJhc2UgbWFwICR7c291cmNlWWVhcn1gIDogJycpO1xuICAgIH0sXG4gICAgLy8gRGlmZjogXCIxNDUwIFx1MjE5MiAxNzUwXCIgd2l0aCB0aGUgYmFzZSBtYXBzIHRoYXQgc3Rvb2QgaW4gZm9yIGVpdGhlciB5ZWFyLlxuICAgIHNldFJhbmdlKGEsIGIpIHtcbiAgICAgIHllYXIuY2xhc3NlZCgncmFuZ2UnLCB0cnVlKS50ZXh0KGAke2EueWVhcn0gXHUyMTkyICR7Yi55ZWFyfWApO1xuICAgICAgY29uc3Qgbm90ZXMgPSBbXTtcbiAgICAgIGlmIChhLnNvdXJjZVllYXIgIT0gbnVsbCAmJiBhLnNvdXJjZVllYXIgIT09IGEueWVhcikgbm90ZXMucHVzaChgJHthLnllYXJ9IGZyb20gJHthLnNvdXJjZVllYXJ9YCk7XG4gICAgICBpZiAoYi5zb3VyY2VZZWFyICE9IG51bGwgJiYgYi5zb3VyY2VZZWFyICE9PSBiLnllYXIpIG5vdGVzLnB1c2goYCR7Yi55ZWFyfSBmcm9tICR7Yi5zb3VyY2VZZWFyfWApO1xuICAgICAgYmFzZU5vdGUudGV4dChub3Rlcy5sZW5ndGggPyBgYmFzZSBtYXBzOiAke25vdGVzLmpvaW4oJyBcdTAwQjcgJyl9YCA6ICcnKTtcbiAgICB9LFxuICB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgdGltZWxpbmUgc3RyaXBcbi8vIFRoZSBib3R0b20gZWRnZSBvZiB0aGUgZnJhbWU6IHRoZSBzdGFnZSdzIGZ1bGwgc3BhbiB3aXRoIHllYXIgdGlja3MsIHNuYXBzaG90IHllYXJzIGFzIGRvdHMsIHRoZSBzaG93biB5ZWFyIG1hcmtlZC5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RyaXAocm9vdCwgeyB4MCwgeDEsIHkxIH0sIHN0YWdlLCB5ZWFycywgb25ZZWFyKSB7XG4gIGNvbnN0IFthLCBiXSA9IHN0YWdlLnNwYW47XG4gIGNvbnN0IHggPSBkMy5zY2FsZUxpbmVhcigpLmRvbWFpbihbYSwgYl0pLnJhbmdlKFt4MCwgeDFdKTtcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc3RyaXAnKTtcblxuICBnLmFwcGVuZCgnbGluZScpLmF0dHIoJ2NsYXNzJywgJ2Jhc2VsaW5lJykuYXR0cigneDEnLCB4MCkuYXR0cigneDInLCB4MSkuYXR0cigneTEnLCB5MSkuYXR0cigneTInLCB5MSk7XG5cbiAgY29uc3QgbWlub3IgPSBkMy5yYW5nZShNYXRoLmNlaWwoYSAvIDUwKSAqIDUwLCBiICsgMSwgNTApO1xuICBnLnNlbGVjdEFsbCgnbGluZS50aWNrJykuZGF0YShtaW5vcikuam9pbignbGluZScpXG4gICAgLmF0dHIoJ2NsYXNzJywgKGQpID0+IGB0aWNrICR7ZCAlIDEwMCA9PT0gMCA/ICdtYWpvcicgOiAnbWlub3InfWApXG4gICAgLmF0dHIoJ3gxJywgKGQpID0+IHgoZCkpLmF0dHIoJ3gyJywgKGQpID0+IHgoZCkpLmF0dHIoJ3kxJywgeTEpLmF0dHIoJ3kyJywgKGQpID0+IHkxICsgKGQgJSAxMDAgPT09IDAgPyAxMCA6IDUpKTtcbiAgY29uc3QgdGlja0xhYmVscyA9IGcuc2VsZWN0QWxsKCd0ZXh0LnRpY2stbGFiZWwnKS5kYXRhKG1pbm9yLmZpbHRlcigoZCkgPT4gZCAlIDEwMCA9PT0gMCkpLmpvaW4oJ3RleHQnKVxuICAgIC5hdHRyKCdjbGFzcycsICd0aWNrLWxhYmVsJykuYXR0cigneCcsIChkKSA9PiB4KGQpKS5hdHRyKCd5JywgeTEgKyAyNikuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAudGV4dCgoZCkgPT4gKGQgPCAwID8gYCR7LWR9IEJDRWAgOiBkKSk7XG5cbiAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5zbmFwc2hvdCcpLmRhdGEoeWVhcnMpLmpvaW4oJ2NpcmNsZScpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3NuYXBzaG90JykuYXR0cignY3gnLCAoZCkgPT4geChkKSkuYXR0cignY3knLCB5MSkuYXR0cigncicsIDUpXG4gICAgLm9uKCdjbGljaycsIChfLCBkKSA9PiBvblllYXIgJiYgb25ZZWFyKGQpKVxuICAgIC5hcHBlbmQoJ3RpdGxlJykudGV4dCgoZCkgPT4gYFNob3cgJHtkfWApO1xuXG4gIC8vIERpZmYgcmFuZ2U6IGEgYm9sZCBzZWdtZW50IGJldHdlZW4gdGhlIHR3byB5ZWFycywgd2l0aCBhIGhvbGxvdyBtYXJrZXIgYXQgdGhlIHN0YXJ0LlxuICBjb25zdCByYW5nZSA9IGcuYXBwZW5kKCdsaW5lJykuYXR0cignY2xhc3MnLCAncmFuZ2UgaGlkZGVuJykuYXR0cigneTEnLCB5MSkuYXR0cigneTInLCB5MSk7XG4gIGNvbnN0IG1hcmtlckEgPSBnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ21hcmtlciBzdGFydCBoaWRkZW4nKTtcbiAgbWFya2VyQS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00wLC05TDgsMEwwLDlMLTgsMFonKTtcbiAgY29uc3QgbWFya2VyQUxhYmVsID0gbWFya2VyQS5hcHBlbmQoJ3RleHQnKS5hdHRyKCd5JywgMzApLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpO1xuXG4gIGNvbnN0IG1hcmtlciA9IGcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VyJyk7XG4gIG1hcmtlci5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00wLC05TDgsMEwwLDlMLTgsMFonKTtcbiAgY29uc3QgbWFya2VyTGFiZWwgPSBtYXJrZXIuYXBwZW5kKCd0ZXh0JykuYXR0cigneScsIDMwKS5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKTtcblxuICBjb25zdCBoaWRlTmVhciA9ICguLi55cykgPT4gdGlja0xhYmVscy5jbGFzc2VkKCdoaWRkZW4nLCAoZCkgPT4geXMuc29tZSgoeSkgPT4gTWF0aC5hYnMoeChkKSAtIHgoeSkpIDwgMzQpKTtcblxuICByZXR1cm4ge1xuICAgIHNldFllYXIoeWVhcikge1xuICAgICAgbWFya2VyLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4KHllYXIpfSwke3kxfSlgKTtcbiAgICAgIG1hcmtlckxhYmVsLnRleHQoeWVhcik7XG4gICAgICByYW5nZS5jbGFzc2VkKCdoaWRkZW4nLCB0cnVlKTtcbiAgICAgIG1hcmtlckEuY2xhc3NlZCgnaGlkZGVuJywgdHJ1ZSk7XG4gICAgICBoaWRlTmVhcih5ZWFyKTtcbiAgICB9LFxuICAgIHNldFJhbmdlKGEsIGIpIHtcbiAgICAgIG1hcmtlci5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eChiKX0sJHt5MX0pYCk7XG4gICAgICBtYXJrZXJMYWJlbC50ZXh0KGIpO1xuICAgICAgbWFya2VyQS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eChhKX0sJHt5MX0pYCkuY2xhc3NlZCgnaGlkZGVuJywgZmFsc2UpO1xuICAgICAgbWFya2VyQUxhYmVsLnRleHQoYSk7XG4gICAgICByYW5nZS5hdHRyKCd4MScsIHgoTWF0aC5taW4oYSwgYikpKS5hdHRyKCd4MicsIHgoTWF0aC5tYXgoYSwgYikpKS5jbGFzc2VkKCdoaWRkZW4nLCBmYWxzZSk7XG4gICAgICBoaWRlTmVhcihhLCBiKTtcbiAgICB9LFxuICB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgbGVnZW5kXG4vLyBUb3AtcmlnaHQgaW5zaWRlIHRoZSBmcmFtZS4gRW50cmllcyBjb21lIGZyb20gdGhlIGFjdGl2ZSB0cmFja2VyOyB0aGUgdmlzdWFsIGdyYW1tYXIgbmV2ZXIgY2hhbmdlcy5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlZ2VuZChyb290LCB7IHgxLCB5MCB9KSB7XG4gIGNvbnN0IFcgPSAyMzYsIFBBRCA9IDE0LCBST1cgPSAyMjtcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbGVnZW5kJyk7XG4gIGNvbnN0IGJveCA9IGcuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnbGVnZW5kLWJveCcpLmF0dHIoJ3dpZHRoJywgVyk7XG4gIGNvbnN0IHRpdGxlID0gZy5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsICdsZWdlbmQtdGl0bGUnKS5hdHRyKCd4JywgUEFEKS5hdHRyKCd5JywgUEFEICsgMTApO1xuICBjb25zdCByb3dzID0gZy5hcHBlbmQoJ2cnKS5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7UEFEfSwke1BBRCArIDI2fSlgKTtcblxuICBsZXQgaGVpZ2h0ID0gMDtcbiAgZnVuY3Rpb24gc2V0KHRyYWNrZXIpIHtcbiAgICBjb25zdCBlbnRyaWVzID0gdHJhY2tlci5sZWdlbmQgPz8gW107XG4gICAgdGl0bGUudGV4dCh0cmFja2VyLnRpdGxlID8/IHRyYWNrZXIuaWQpO1xuICAgIGNvbnN0IEggPSBQQUQgKiAyICsgMjYgKyBlbnRyaWVzLmxlbmd0aCAqIFJPVztcbiAgICBoZWlnaHQgPSBIO1xuICAgIGJveC5hdHRyKCdoZWlnaHQnLCBIKTtcbiAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4MSAtIDIyIC0gV30sJHt5MCArIDIyfSlgKTtcbiAgICBjb25zdCByID0gcm93cy5zZWxlY3RBbGwoJ2cucm93JykuZGF0YShlbnRyaWVzKS5qb2luKCdnJykuYXR0cignY2xhc3MnLCAncm93JykuYXR0cigndHJhbnNmb3JtJywgKF8sIGkpID0+IGB0cmFuc2xhdGUoMCwke2kgKiBST1d9KWApO1xuICAgIHIuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG4gICAgci5lYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICBjb25zdCByb3cgPSBkM1NlbGVjdCh0aGlzKTtcbiAgICAgIGlmIChlLnN3YXRjaCA9PT0gJ2ZpbGwnKSB7XG4gICAgICAgIHJvdy5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsIGBzd2F0Y2ggZmlsbC0ke2Uua2V5fWApLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgMCkuYXR0cignd2lkdGgnLCAyMikuYXR0cignaGVpZ2h0JywgMTQpO1xuICAgICAgfSBlbHNlIGlmIChlLnN3YXRjaCA9PT0gJ2hhdGNoJykge1xuICAgICAgICByb3cuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnc3dhdGNoIGhhdGNoJykuYXR0cigneCcsIDApLmF0dHIoJ3knLCAwKS5hdHRyKCd3aWR0aCcsIDIyKS5hdHRyKCdoZWlnaHQnLCAxNCk7XG4gICAgICB9IGVsc2UgaWYgKGUuc3dhdGNoID09PSAnbGluZScpIHtcbiAgICAgICAgcm93LmFwcGVuZCgnbGluZScpLmF0dHIoJ2NsYXNzJywgYHN3YXRjaC1saW5lICR7ZS5zdHlsZX1gKS5hdHRyKCd4MScsIDApLmF0dHIoJ3gyJywgMjIpLmF0dHIoJ3kxJywgNykuYXR0cigneTInLCA3KTtcbiAgICAgIH0gZWxzZSBpZiAoZS5zd2F0Y2ggPT09ICdzaGFwZScpIHtcbiAgICAgICAgcm93LmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgYG1hcmsgJHtlLnNoYXBlfWApLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTEsNyknKS5hdHRyKCdkJywgU0hBUEVTW2Uuc2hhcGVdID8/IFNIQVBFUy5jaXJjbGUpO1xuICAgICAgfVxuICAgICAgcm93LmFwcGVuZCgndGV4dCcpLmF0dHIoJ3gnLCAzMikuYXR0cigneScsIDExKS50ZXh0KGUubGFiZWwpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB7IHNldCwgaGVpZ2h0OiAoKSA9PiBoZWlnaHQgfTtcbn1cblxuLy8gUG9pbnQgbWFya3MgKGJyaWVmIFx1MDBBNzUpOiBiYXR0bGUvc2llZ2UgPSBydXN0IGRpYW1vbmQ7IGZvdW5kaW5nL2NhcGl0YWwgPSBtb3NzIGNpcmNsZTsgbW9udW1lbnQgPSBuYXZ5IHNxdWFyZTsgdHJlYXR5ID0gbmF2eSB0cmlhbmdsZS5cbmV4cG9ydCBjb25zdCBTSEFQRVMgPSB7XG4gICdydXN0LWRpYW1vbmQnOiAnTTAsLTdMNywwTDAsN0wtNywwWicsXG4gICdtb3NzLWNpcmNsZSc6ICdNMCwtNkE2LDYgMCAxLDEgMCw2QTYsNiAwIDEsMSAwLC02WicsXG4gICduYXZ5LXNxdWFyZSc6ICdNLTYsLTZINlY2SC02WicsXG4gICduYXZ5LXRyaWFuZ2xlJzogJ00wLC03TDcsNkgtN1onLFxuICBjaXJjbGU6ICdNMCwtNkE2LDYgMCAxLDEgMCw2QTYsNiAwIDEsMSAwLC02WicsXG59O1xuXG4vLyB0aW55IGxvY2FsIGFsaWFzIHRvIGF2b2lkIGltcG9ydGluZyBhbGwgb2YgZDMgaGVyZVxuaW1wb3J0IHsgc2VsZWN0IGFzIGQzU2VsZWN0IH0gZnJvbSAnZDMnO1xuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZGlmZiBsaXN0XG4vLyBUaGUgYXV0by1nZW5lcmF0ZWQgYXBwZWFyZWQgLyB2YW5pc2hlZCAvIHBlcnNpc3RlZCBsaXN0LCBkcmF3biBpbnNpZGUgdGhlIGZyYW1lIHVuZGVyIHRoZSBsZWdlbmQuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaWZmTGlzdChyb290LCB7IHgxLCB5MCB9KSB7XG4gIGNvbnN0IFcgPSAyMzYsIFBBRCA9IDE0LCBST1cgPSAxNywgTUFYID0gNztcbiAgY29uc3QgZyA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnZGlmZmxpc3QgaGlkZGVuJyk7XG4gIGNvbnN0IGJveCA9IGcuYXBwZW5kKCdyZWN0JykuYXR0cignY2xhc3MnLCAnZGlmZmxpc3QtYm94JykuYXR0cignd2lkdGgnLCBXKTtcbiAgY29uc3QgYm9keSA9IGcuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke1BBRH0sJHtQQUR9KWApO1xuXG4gIGZ1bmN0aW9uIHNlY3Rpb24oeSwgdGl0bGUsIGl0ZW1zLCBzbWFsbCwgY2xzKSB7XG4gICAgYm9keS5hcHBlbmQoJ3RleHQnKS5hdHRyKCdjbGFzcycsIGBkaWZmbGlzdC1oZWFkICR7Y2xzfWApLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgeSArIDEwKS50ZXh0KGAke3RpdGxlfSBcdTAwQjcgJHtpdGVtcy5sZW5ndGggKyBzbWFsbH1gKTtcbiAgICB5ICs9IFJPVyArIDI7XG4gICAgY29uc3Qgc2hvd24gPSBpdGVtcy5zbGljZSgwLCBNQVgpO1xuICAgIGZvciAoY29uc3QgaXQgb2Ygc2hvd24pIHtcbiAgICAgIGJvZHkuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCBgZGlmZmxpc3QtaXRlbSAke2Nsc31gKS5hdHRyKCd4JywgMTApLmF0dHIoJ3knLCB5ICsgMTApLnRleHQoaXQubGFiZWwpO1xuICAgICAgeSArPSBST1c7XG4gICAgfVxuICAgIGNvbnN0IHJlc3QgPSBpdGVtcy5sZW5ndGggLSBzaG93bi5sZW5ndGggKyBzbWFsbDtcbiAgICBpZiAocmVzdCA+IDApIHtcbiAgICAgIGJvZHkuYXBwZW5kKCd0ZXh0JykuYXR0cignY2xhc3MnLCAnZGlmZmxpc3QtbW9yZScpLmF0dHIoJ3gnLCAxMCkuYXR0cigneScsIHkgKyAxMCkudGV4dChgYW5kICR7cmVzdH0gc21hbGxlcmApO1xuICAgICAgeSArPSBST1c7XG4gICAgfVxuICAgIHJldHVybiB5ICsgODtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2V0KGRpZmYsIHRvcCkge1xuICAgICAgYm9keS5zZWxlY3RBbGwoJyonKS5yZW1vdmUoKTtcbiAgICAgIGxldCB5ID0gMDtcbiAgICAgIHkgPSBzZWN0aW9uKHksICdBcHBlYXJlZCcsIGRpZmYuYXBwZWFyZWQsIGRpZmYuc21hbGwuYXBwZWFyZWQsICdhcHBlYXJlZCcpO1xuICAgICAgeSA9IHNlY3Rpb24oeSwgJ1ZhbmlzaGVkJywgZGlmZi52YW5pc2hlZCwgZGlmZi5zbWFsbC52YW5pc2hlZCwgJ3ZhbmlzaGVkJyk7XG4gICAgICB5ID0gc2VjdGlvbih5LCAnUGVyc2lzdGVkJywgZGlmZi5wZXJzaXN0ZWQsIGRpZmYuc21hbGwucGVyc2lzdGVkLCAncGVyc2lzdGVkJyk7XG4gICAgICBib3guYXR0cignaGVpZ2h0JywgeSArIFBBRCk7XG4gICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4MSAtIDIyIC0gV30sJHt0b3B9KWApLmNsYXNzZWQoJ2hpZGRlbicsIGZhbHNlKTtcbiAgICB9LFxuICAgIGhpZGUoKSB7IGcuY2xhc3NlZCgnaGlkZGVuJywgdHJ1ZSk7IH0sXG4gIH07XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBkaWZmXG4vLyBDb250aW51aXR5IGFuZCBjaGFuZ2UgYmV0d2VlbiB0d28gc25hcHNob3RzLCBjb21wdXRlZCBmcm9tIHdoYXQgZWFjaCBiYXNlIG1hcCBuYW1lcyBhbmQgZnJvbSB0aGVcbi8vIHRyYWNrZXIncyB0aW1lLWJvdW5kZWQgaWRlbnRpdGllcy4gTm90aGluZyBoZXJlIGRyYXdzOyBzZWUgcmVuZGVyL2Jhc2UuanMgc2hvd0RpZmYuXG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcblxuY29uc3QgS00yX1BFUl9TUiA9IDYzNzEgKiA2MzcxO1xuXG5mdW5jdGlvbiBib3VuZHNJbnRlcnNlY3QoW1theDAsIGF5MF0sIFtheDEsIGF5MV1dLCB7IHgwLCB5MCwgeDEsIHkxIH0pIHtcbiAgcmV0dXJuIGF4MSA+PSB4MCAmJiBheDAgPD0geDEgJiYgYXkxID49IHkwICYmIGF5MCA8PSB5MTtcbn1cblxuLy8gU3BoZXJpY2FsIGFyZWEgYW5kIHByb2plY3RlZCBib3VuZHMgYXJlIGNhY2hlZCBwZXIgZmVhdHVyZSBvYmplY3Q7IHNuYXBzaG90cyBhcmUgY2FjaGVkLCBzbyB0aGlzIHBheXMgb25jZS5cbmNvbnN0IGFyZWFDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBib3VuZHNDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBhcmVhT2YgPSAoZikgPT4geyBsZXQgYSA9IGFyZWFDYWNoZS5nZXQoZik7IGlmIChhID09PSB1bmRlZmluZWQpIHsgYSA9IGQzLmdlb0FyZWEoZik7IGFyZWFDYWNoZS5zZXQoZiwgYSk7IH0gcmV0dXJuIGE7IH07XG5jb25zdCBib3VuZHNPZiA9IChmLCBwYXRoKSA9PiB7IGxldCBiID0gYm91bmRzQ2FjaGUuZ2V0KGYpOyBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7IGIgPSBwYXRoLmJvdW5kcyhmKTsgYm91bmRzQ2FjaGUuc2V0KGYsIGIpOyB9IHJldHVybiBiOyB9O1xuXG4vLyBHcm91cCBhIHNuYXBzaG90J3MgbmFtZWQgZmVhdHVyZXMgYnkgaWRlbnRpdHkuXG4vLyBpZGVudGlmeShmZWF0dXJlLCB5ZWFyKSBcdTIxOTIgeyBrZXksIGxhYmVsIH0gfCBudWxsOiBhIHRyYWNrZXIgaWRlbnRpdHkgd2hlbiB0aGUgbmFtZSBtYXRjaGVzIG9uZSBhbGl2ZSB0aGF0XG4vLyB5ZWFyIChzbyBhIHJlbmFtZWQgc3RhdGUgcGVyc2lzdHMpLCBvdGhlcndpc2UgdGhlIGJhc2UgbWFwJ3Mgb3duIG5hbWU7IG51bGwgbWVhbnMgXCJub3QgcGFydCBvZiB0aGlzIGRpZmZcIi5cbmZ1bmN0aW9uIGdyb3VwQnlJZGVudGl0eShmZWF0dXJlcywgeWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lKSB7XG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCBmIG9mIGZlYXR1cmVzKSB7XG4gICAgY29uc3QgaWQgPSBpZGVudGlmeShmLCB5ZWFyKTtcbiAgICBpZiAoIWlkKSBjb250aW51ZTtcbiAgICBjb25zdCB7IGtleSwgbGFiZWwgfSA9IGlkO1xuICAgIGxldCBnID0gZ3JvdXBzLmdldChrZXkpO1xuICAgIGlmICghZykgeyBnID0geyBrZXksIGxhYmVsLCBhcmVhOiAwLCBmZWF0dXJlczogW10sIHZpc2libGU6IGZhbHNlIH07IGdyb3Vwcy5zZXQoa2V5LCBnKTsgfVxuICAgIGcuYXJlYSArPSBhcmVhT2YoZik7XG4gICAgZy5mZWF0dXJlcy5wdXNoKGYpO1xuICAgIGlmICghZy52aXNpYmxlICYmIGJvdW5kc0ludGVyc2VjdChib3VuZHNPZihmLCBwYXRoKSwgZnJhbWUpKSBnLnZpc2libGUgPSB0cnVlO1xuICB9XG4gIHJldHVybiBncm91cHM7XG59XG5cbi8vIFJldHVybnMgeyBhcHBlYXJlZCwgdmFuaXNoZWQsIHBlcnNpc3RlZCwgc21hbGw6IHthcHBlYXJlZCwgdmFuaXNoZWQsIHBlcnNpc3RlZH0gfS5cbi8vIEVhY2ggbGlzdCBob2xkcyB7IGtleSwgbGFiZWwsIGFyZWEsIGttMiwgYT86IGZlYXR1cmVzIGluIEEsIGI/OiBmZWF0dXJlcyBpbiBCIH0gc29ydGVkIGJ5IGFyZWEsIGxhcmdlc3QgZmlyc3QuXG4vLyBHcm91cHMgc21hbGxlciB0aGFuIG1pbkttMiBhcmUgY291bnRlZCBpbiBgc21hbGxgIGJ1dCBub3QgbGlzdGVkOyBncm91cHMgd2hvbGx5IG91dHNpZGUgdGhlIGZyYW1lIGFyZSBkcm9wcGVkLlxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVEaWZmKHsgYUZlYXR1cmVzLCBhWWVhciwgYkZlYXR1cmVzLCBiWWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lLCBtaW5LbTIgPSAxMjAwMDAgfSkge1xuICBjb25zdCBBID0gZ3JvdXBCeUlkZW50aXR5KGFGZWF0dXJlcywgYVllYXIsIGlkZW50aWZ5LCBwYXRoLCBmcmFtZSk7XG4gIGNvbnN0IEIgPSBncm91cEJ5SWRlbnRpdHkoYkZlYXR1cmVzLCBiWWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lKTtcbiAgY29uc3QgbWluU3IgPSBtaW5LbTIgLyBLTTJfUEVSX1NSO1xuICBjb25zdCBvdXQgPSB7IGFwcGVhcmVkOiBbXSwgdmFuaXNoZWQ6IFtdLCBwZXJzaXN0ZWQ6IFtdLCBzbWFsbDogeyBhcHBlYXJlZDogMCwgdmFuaXNoZWQ6IDAsIHBlcnNpc3RlZDogMCB9IH07XG4gIGNvbnN0IHB1c2ggPSAoYnVja2V0LCBpdGVtKSA9PiB7XG4gICAgaWYgKCFpdGVtLnZpc2libGUpIHJldHVybjtcbiAgICBpdGVtLmttMiA9IE1hdGgucm91bmQoaXRlbS5hcmVhICogS00yX1BFUl9TUik7XG4gICAgaWYgKGl0ZW0uYXJlYSA8IG1pblNyKSB7IG91dC5zbWFsbFtidWNrZXRdKys7IHJldHVybjsgfVxuICAgIG91dFtidWNrZXRdLnB1c2goaXRlbSk7XG4gIH07XG4gIGZvciAoY29uc3QgW2tleSwgZ2JdIG9mIEIpIHtcbiAgICBjb25zdCBnYSA9IEEuZ2V0KGtleSk7XG4gICAgaWYgKGdhKSBwdXNoKCdwZXJzaXN0ZWQnLCB7IGtleSwgbGFiZWw6IGdiLmxhYmVsLCBhcmVhOiBNYXRoLm1heChnYS5hcmVhLCBnYi5hcmVhKSwgdmlzaWJsZTogZ2EudmlzaWJsZSB8fCBnYi52aXNpYmxlLCBhOiBnYS5mZWF0dXJlcywgYjogZ2IuZmVhdHVyZXMgfSk7XG4gICAgZWxzZSBwdXNoKCdhcHBlYXJlZCcsIHsga2V5LCBsYWJlbDogZ2IubGFiZWwsIGFyZWE6IGdiLmFyZWEsIHZpc2libGU6IGdiLnZpc2libGUsIGI6IGdiLmZlYXR1cmVzIH0pO1xuICB9XG4gIGZvciAoY29uc3QgW2tleSwgZ2FdIG9mIEEpIHtcbiAgICBpZiAoIUIuaGFzKGtleSkpIHB1c2goJ3ZhbmlzaGVkJywgeyBrZXksIGxhYmVsOiBnYS5sYWJlbCwgYXJlYTogZ2EuYXJlYSwgdmlzaWJsZTogZ2EudmlzaWJsZSwgYTogZ2EuZmVhdHVyZXMgfSk7XG4gIH1cbiAgZm9yIChjb25zdCBrIG9mIFsnYXBwZWFyZWQnLCAndmFuaXNoZWQnLCAncGVyc2lzdGVkJ10pIG91dFtrXS5zb3J0KChwLCBxKSA9PiBxLmFyZWEgLSBwLmFyZWEpO1xuICByZXR1cm4gb3V0O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgcmVjb3Jkc1xuLy8gUmVhZHMgZGF0YS9yZWNvcmRzLmNzdiAodGhlIG9ubHkgaGFuZC1lZGl0ZWQgZGF0YSBmaWxlKSBhbmQgY2hlY2tzIGV2ZXJ5IHJvdyBhZ2FpbnN0IGRhdGEvdm9jYWIuanNvbi5cbi8vIFJvd3MgdGhhdCBmYWlsIGFyZSBza2lwcGVkIGFuZCBsaXN0ZWQsIG5ldmVyIGZhdGFsOiBub3RoaW5nIGEgY29udGVudCBlZGl0b3IgdHlwZXMgY2FuIGJyZWFrIHRoZSBtYXAuXG4vLyBSb3dzIHdob3NlIGlkIHN0YXJ0cyB3aXRoIFwiZXhhbXBsZS1cIiBhcmUgdGVtcGxhdGVzIGFuZCBhcmUgbmV2ZXIgcmVuZGVyZWQuXG5cbmV4cG9ydCBjb25zdCBDT0xVTU5TID0gWydpZCcsICdjb3Vyc2UnLCAndW5pdCcsICd0b3BpYycsICdrYycsICd0aGVtZScsICd0cmFja2VyJywgJ2tpbmQnLCAnd2hlcmUnLCAnbG9uJywgJ2xhdCcsXG4gICdzdGFydCcsICdlbmQnLCAnZ3JhZGUnLCAndmFsdWUnLCAnY2VydGFpbnR5JywgJ2xhYmVsJywgJ3NvdXJjZScsICdxY19zdGF0dXMnLCAncWNfYnknLCAncWNfbm90ZSddO1xuXG4vLyBSRkMgNDE4MC1zdHlsZSBDU1Y6IHF1b3RlZCBmaWVsZHMgbWF5IGhvbGQgY29tbWFzLCBxdW90ZXMgKFwiXCIpIGFuZCBuZXdsaW5lcy4gUmV0dXJucyByb3dzIG9mIHN0cmluZ3MuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDU1YodGV4dCkge1xuICBjb25zdCByb3dzID0gW107XG4gIGxldCByb3cgPSBbXSwgZmllbGQgPSAnJywgcXVvdGVkID0gZmFsc2UsIGkgPSAwO1xuICBjb25zdCBzcmMgPSB0ZXh0LnJlcGxhY2UoL15cdUZFRkYvLCAnJyk7XG4gIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgIGNvbnN0IGMgPSBzcmNbaV07XG4gICAgaWYgKHF1b3RlZCkge1xuICAgICAgaWYgKGMgPT09ICdcIicpIHtcbiAgICAgICAgaWYgKHNyY1tpICsgMV0gPT09ICdcIicpIHsgZmllbGQgKz0gJ1wiJzsgaSArPSAyOyBjb250aW51ZTsgfVxuICAgICAgICBxdW90ZWQgPSBmYWxzZTsgaSsrOyBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGZpZWxkICs9IGM7IGkrKzsgY29udGludWU7XG4gICAgfVxuICAgIGlmIChjID09PSAnXCInKSB7IHF1b3RlZCA9IHRydWU7IGkrKzsgY29udGludWU7IH1cbiAgICBpZiAoYyA9PT0gJywnKSB7IHJvdy5wdXNoKGZpZWxkKTsgZmllbGQgPSAnJzsgaSsrOyBjb250aW51ZTsgfVxuICAgIGlmIChjID09PSAnXFxyJykgeyBpKys7IGNvbnRpbnVlOyB9XG4gICAgaWYgKGMgPT09ICdcXG4nKSB7IHJvdy5wdXNoKGZpZWxkKTsgcm93cy5wdXNoKHJvdyk7IHJvdyA9IFtdOyBmaWVsZCA9ICcnOyBpKys7IGNvbnRpbnVlOyB9XG4gICAgZmllbGQgKz0gYzsgaSsrO1xuICB9XG4gIGlmIChmaWVsZCAhPT0gJycgfHwgcm93Lmxlbmd0aCkgeyByb3cucHVzaChmaWVsZCk7IHJvd3MucHVzaChyb3cpOyB9XG4gIHJldHVybiByb3dzLmZpbHRlcigocikgPT4gci5zb21lKChmKSA9PiBmLnRyaW0oKSAhPT0gJycpKTtcbn1cblxuY29uc3QgaXNJbnQgPSAocykgPT4gL14tP1xcZCskLy50ZXN0KHMpO1xuY29uc3QgaXNOdW0gPSAocykgPT4gcyAhPT0gJycgJiYgTnVtYmVyLmlzRmluaXRlKE51bWJlcihzKSk7XG5jb25zdCBpc1FJRCA9IChzKSA9PiAvXlFcXGQrJC8udGVzdChzKTtcblxuLy8gXHUyMTkyIHsgcmVjb3JkczogWy4uLnZhbGlkLCBwYXJzZWQgcm93c10sIHByb2JsZW1zOiBbeyBsaW5lLCBpZCwgbWVzc2FnZSB9XSwgZXhhbXBsZXM6IG4sIHRvdGFsOiBuIH1cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVJlY29yZHModGV4dCwgdm9jYWIpIHtcbiAgY29uc3Qgcm93cyA9IHBhcnNlQ1NWKHRleHQpO1xuICBjb25zdCBwcm9ibGVtcyA9IFtdO1xuICBjb25zdCByZWNvcmRzID0gW107XG4gIGxldCBleGFtcGxlcyA9IDA7XG4gIGlmICghcm93cy5sZW5ndGgpIHJldHVybiB7IHJlY29yZHMsIHByb2JsZW1zOiBbeyBsaW5lOiAxLCBpZDogJycsIG1lc3NhZ2U6ICdyZWNvcmRzLmNzdiBpcyBlbXB0eScgfV0sIGV4YW1wbGVzLCB0b3RhbDogMCB9O1xuXG4gIGNvbnN0IGhlYWRlciA9IHJvd3NbMF0ubWFwKChoKSA9PiBoLnRyaW0oKSk7XG4gIGNvbnN0IG1pc3NpbmcgPSBDT0xVTU5TLmZpbHRlcigoYykgPT4gIWhlYWRlci5pbmNsdWRlcyhjKSk7XG4gIGlmIChtaXNzaW5nLmxlbmd0aCkge1xuICAgIHByb2JsZW1zLnB1c2goeyBsaW5lOiAxLCBpZDogJycsIG1lc3NhZ2U6IGBoZWFkZXIgaXMgbWlzc2luZyBjb2x1bW4ke21pc3NpbmcubGVuZ3RoID4gMSA/ICdzJyA6ICcnfTogJHttaXNzaW5nLmpvaW4oJywgJyl9YCB9KTtcbiAgICByZXR1cm4geyByZWNvcmRzLCBwcm9ibGVtcywgZXhhbXBsZXMsIHRvdGFsOiByb3dzLmxlbmd0aCAtIDEgfTtcbiAgfVxuICBjb25zdCBjb2wgPSBPYmplY3QuZnJvbUVudHJpZXMoaGVhZGVyLm1hcCgoaCwgaSkgPT4gW2gsIGldKSk7XG4gIGNvbnN0IGJhc2VVbml0cyA9IG5ldyBTZXQoKHZvY2FiLmJhc2VfdW5pdHMgPz8gW10pLm1hcCgodSkgPT4gdS5pZCkpO1xuICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuXG4gIGZvciAobGV0IHIgPSAxOyByIDwgcm93cy5sZW5ndGg7IHIrKykge1xuICAgIGNvbnN0IGxpbmUgPSByICsgMTtcbiAgICBjb25zdCBjZWxscyA9IHJvd3Nbcl07XG4gICAgY29uc3QgZ2V0ID0gKGMpID0+IChjZWxsc1tjb2xbY11dID8/ICcnKS50cmltKCk7XG4gICAgY29uc3QgcmVjID0gT2JqZWN0LmZyb21FbnRyaWVzKENPTFVNTlMubWFwKChjKSA9PiBbYywgZ2V0KGMpXSkpO1xuICAgIGNvbnN0IGVycnMgPSBbXTtcbiAgICBjb25zdCBiYWQgPSAobSkgPT4gZXJycy5wdXNoKG0pO1xuXG4gICAgaWYgKGNlbGxzLmxlbmd0aCA+IGhlYWRlci5sZW5ndGgpIGJhZChgJHtjZWxscy5sZW5ndGh9IGZpZWxkcyBmb3IgJHtoZWFkZXIubGVuZ3RofSBjb2x1bW5zIChhbiB1bnF1b3RlZCBjb21tYT8pYCk7XG4gICAgaWYgKCFyZWMuaWQpIGJhZCgnaWQgaXMgYmxhbmsnKTtcbiAgICBlbHNlIGlmICghL15bYS16MC05XSsoLVthLXowLTldKykqJC8udGVzdChyZWMuaWQpKSBiYWQoYGlkIFwiJHtyZWMuaWR9XCIgaXMgbm90IGtlYmFiLWNhc2VgKTtcbiAgICBlbHNlIGlmIChzZWVuLmhhcyhyZWMuaWQpKSBiYWQoYGlkIFwiJHtyZWMuaWR9XCIgaXMgdXNlZCB0d2ljZWApO1xuICAgIHNlZW4uYWRkKHJlYy5pZCk7XG5cbiAgICBpZiAoIXZvY2FiLmNvdXJzZS5pbmNsdWRlcyhyZWMuY291cnNlKSkgYmFkKGBjb3Vyc2UgXCIke3JlYy5jb3Vyc2V9XCIgaXMgbm90IG9uZSBvZiAke3ZvY2FiLmNvdXJzZS5qb2luKCcsICcpfWApO1xuICAgIGlmIChyZWMudW5pdCAhPT0gJycgJiYgIWlzSW50KHJlYy51bml0KSkgYmFkKGB1bml0IFwiJHtyZWMudW5pdH1cIiBpcyBub3QgYSB3aG9sZSBudW1iZXJgKTtcbiAgICBjb25zdCB0aGVtZXMgPSByZWMuY291cnNlID09PSAnYm90aCcgPyBbLi4udm9jYWIudGhlbWUuYXB3b3JsZCwgLi4udm9jYWIudGhlbWUuYXB1c2hdIDogKHZvY2FiLnRoZW1lW3JlYy5jb3Vyc2VdID8/IFtdKTtcbiAgICBpZiAocmVjLnRoZW1lICYmIHRoZW1lcy5sZW5ndGggJiYgIXRoZW1lcy5pbmNsdWRlcyhyZWMudGhlbWUpKSBiYWQoYHRoZW1lIFwiJHtyZWMudGhlbWV9XCIgaXMgbm90IGEgJHtyZWMuY291cnNlfSB0aGVtZSAoJHt0aGVtZXMuam9pbignLCAnKX0pYCk7XG5cbiAgICBjb25zdCB0cmFja2VyID0gdm9jYWIudHJhY2tlcnNbcmVjLnRyYWNrZXJdO1xuICAgIGlmICghdHJhY2tlcikgYmFkKGB0cmFja2VyIFwiJHtyZWMudHJhY2tlcn1cIiBpcyBub3Qgb25lIG9mICR7T2JqZWN0LmtleXModm9jYWIudHJhY2tlcnMpLmpvaW4oJywgJyl9YCk7XG4gICAgaWYgKCF2b2NhYi5raW5kLmluY2x1ZGVzKHJlYy5raW5kKSkgYmFkKGBraW5kIFwiJHtyZWMua2luZH1cIiBpcyBub3Qgb25lIG9mICR7dm9jYWIua2luZC5qb2luKCcsICcpfWApO1xuICAgIGVsc2UgaWYgKHRyYWNrZXIgJiYgIXRyYWNrZXIua2luZHMuaW5jbHVkZXMocmVjLmtpbmQpKSBiYWQoYHRyYWNrZXIgJHtyZWMudHJhY2tlcn0gZG9lcyBub3QgdGFrZSBraW5kIFwiJHtyZWMua2luZH1cIiAob25seSAke3RyYWNrZXIua2luZHMuam9pbignLCAnKX0pYCk7XG5cbiAgICBpZiAoIXJlYy53aGVyZSkgYmFkKCd3aGVyZSBpcyBibGFuaycpO1xuICAgIGVsc2UgaWYgKHJlYy5raW5kID09PSAncG9pbnQnKSB7IGlmICghaXNRSUQocmVjLndoZXJlKSkgYmFkKGB3aGVyZSBcIiR7cmVjLndoZXJlfVwiIHNob3VsZCBiZSBhIFdpa2lkYXRhIFFJRCAobGlrZSBRMTkzMzM0KSBmb3IgYSBwb2ludGApOyB9XG4gICAgZWxzZSBpZiAoIWJhc2VVbml0cy5oYXMocmVjLndoZXJlKSAmJiAhaXNRSUQocmVjLndoZXJlKSkgYmFkKGB3aGVyZSBcIiR7cmVjLndoZXJlfVwiIGlzIG5vdCBhIGJhc2UtdW5pdCBpZCBpbiB2b2NhYi5qc29uYCk7XG5cbiAgICBpZiAocmVjLmxvbiAhPT0gJycgfHwgcmVjLmxhdCAhPT0gJycpIHtcbiAgICAgIGlmICghaXNOdW0ocmVjLmxvbikgfHwgIWlzTnVtKHJlYy5sYXQpKSBiYWQoJ2xvbi9sYXQgbXVzdCBib3RoIGJlIG51bWJlcnMgKG9yIGJvdGggYmxhbmsgdW50aWwgZ2VvY29kZS5tanMgZmlsbHMgdGhlbSknKTtcbiAgICAgIGVsc2UgaWYgKE1hdGguYWJzKE51bWJlcihyZWMubG9uKSkgPiAxODAgfHwgTWF0aC5hYnMoTnVtYmVyKHJlYy5sYXQpKSA+IDkwKSBiYWQoYGxvbi9sYXQgJHtyZWMubG9ufSwke3JlYy5sYXR9IGlzIG9mZiB0aGUgZ2xvYmVgKTtcbiAgICB9XG4gICAgaWYgKCFpc0ludChyZWMuc3RhcnQpKSBiYWQoYHN0YXJ0IFwiJHtyZWMuc3RhcnR9XCIgaXMgbm90IGEgeWVhcmApO1xuICAgIGlmICghaXNJbnQocmVjLmVuZCkpIGJhZChgZW5kIFwiJHtyZWMuZW5kfVwiIGlzIG5vdCBhIHllYXJgKTtcbiAgICBpZiAoaXNJbnQocmVjLnN0YXJ0KSAmJiBpc0ludChyZWMuZW5kKSAmJiBOdW1iZXIocmVjLmVuZCkgPCBOdW1iZXIocmVjLnN0YXJ0KSkgYmFkKGBlbmQgJHtyZWMuZW5kfSBpcyBiZWZvcmUgc3RhcnQgJHtyZWMuc3RhcnR9YCk7XG4gICAgaWYgKCF2b2NhYi5ncmFkZS5pbmNsdWRlcyhyZWMuZ3JhZGUpKSBiYWQoYGdyYWRlIFwiJHtyZWMuZ3JhZGV9XCIgaXMgbm90IG9uZSBvZiAke3ZvY2FiLmdyYWRlLmpvaW4oJywgJyl9YCk7XG4gICAgaWYgKHRyYWNrZXIpIHtcbiAgICAgIGlmIChyZWMua2luZCA9PT0gJ3ZhbHVlJykgeyBpZiAoIWlzTnVtKHJlYy52YWx1ZSkpIGJhZChgdmFsdWUgXCIke3JlYy52YWx1ZX1cIiBpcyBub3QgYSBudW1iZXJgKTsgfVxuICAgICAgZWxzZSBpZiAodHJhY2tlci52YWx1ZXMgJiYgIXRyYWNrZXIudmFsdWVzLmluY2x1ZGVzKHJlYy52YWx1ZSkpIGJhZChgdmFsdWUgXCIke3JlYy52YWx1ZX1cIiBpcyBub3QgYSAke3JlYy50cmFja2VyfSB2YWx1ZSAoJHt0cmFja2VyLnZhbHVlcy5qb2luKCcsICcpfSlgKTtcbiAgICB9XG4gICAgaWYgKCF2b2NhYi5jZXJ0YWludHkuaW5jbHVkZXMocmVjLmNlcnRhaW50eSkpIGJhZChgY2VydGFpbnR5IFwiJHtyZWMuY2VydGFpbnR5fVwiIGlzIG5vdCBvbmUgb2YgJHt2b2NhYi5jZXJ0YWludHkuam9pbignLCAnKX1gKTtcbiAgICBpZiAoIXJlYy5sYWJlbCkgYmFkKCdsYWJlbCBpcyBibGFuaycpO1xuICAgIGlmICghdm9jYWIucWNfc3RhdHVzLmluY2x1ZGVzKHJlYy5xY19zdGF0dXMpKSBiYWQoYHFjX3N0YXR1cyBcIiR7cmVjLnFjX3N0YXR1c31cIiBpcyBub3Qgb25lIG9mIG9rLCB3cm9uZywgdW5zdXJlIG9yIGJsYW5rYCk7XG5cbiAgICBpZiAoZXJycy5sZW5ndGgpIHsgcHJvYmxlbXMucHVzaCh7IGxpbmUsIGlkOiByZWMuaWQsIG1lc3NhZ2U6IGVycnMuam9pbignOyAnKSB9KTsgY29udGludWU7IH1cbiAgICBpZiAocmVjLmlkLnN0YXJ0c1dpdGgoJ2V4YW1wbGUtJykpIHsgZXhhbXBsZXMrKzsgY29udGludWU7IH1cbiAgICByZWNvcmRzLnB1c2goe1xuICAgICAgLi4ucmVjLFxuICAgICAgdW5pdDogcmVjLnVuaXQgPT09ICcnID8gbnVsbCA6IE51bWJlcihyZWMudW5pdCksXG4gICAgICBsb246IHJlYy5sb24gPT09ICcnID8gbnVsbCA6IE51bWJlcihyZWMubG9uKSxcbiAgICAgIGxhdDogcmVjLmxhdCA9PT0gJycgPyBudWxsIDogTnVtYmVyKHJlYy5sYXQpLFxuICAgICAgc3RhcnQ6IE51bWJlcihyZWMuc3RhcnQpLFxuICAgICAgZW5kOiBOdW1iZXIocmVjLmVuZCksXG4gICAgICB2YWx1ZTogcmVjLmtpbmQgPT09ICd2YWx1ZScgPyBOdW1iZXIocmVjLnZhbHVlKSA6IHJlYy52YWx1ZSxcbiAgICAgIHNoYXBlOiB0cmFja2VyPy5zaGFwZXM/LltyZWMudmFsdWVdID8/IG51bGwsXG4gICAgICBsaW5lLFxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7IHJlY29yZHMsIHByb2JsZW1zLCBleGFtcGxlcywgdG90YWw6IHJvd3MubGVuZ3RoIC0gMSB9O1xufVxuXG4vLyBUaGUgeWVhciBsYWJlbCBhIHJlY29yZCBzaG93cywgYnkgZ3JhZGU6IDE1MjYgXHUwMEI3IH4xNTI2IFx1MDBCNyAxNTI2P1xuZXhwb3J0IGZ1bmN0aW9uIHllYXJMYWJlbChyZWMpIHtcbiAgY29uc3QgeSA9IHJlYy5zdGFydCA9PT0gcmVjLmVuZCA/IGAke3JlYy5zdGFydH1gIDogYCR7cmVjLnN0YXJ0fVx1MjAxMyR7cmVjLmVuZH1gO1xuICByZXR1cm4gcmVjLmdyYWRlID09PSAnY2lyY2EnID8gYH4ke3l9YCA6IHJlYy5ncmFkZSA9PT0gJ3VuY2VydGFpbicgPyBgJHt5fT9gIDogeTtcbn1cblxuLy8gUmVjb3JkcyBzaG93biBpbiBhIHNuYXBzaG90IHllYXIsIGZvciBvbmUgdHJhY2tlcjogdGhvc2UgYWxpdmUgaW4gdGhhdCB5ZWFyIChzdGFydCBcdTIyNjQgeWVhciBcdTIyNjQgZW5kKSwgcGx1c1xuLy8gdGhvc2Ugd2hvc2UgaG9tZSBzbmFwc2hvdCBpdCBpcy4gVGhlIGhvbWUgc25hcHNob3QgaXMgdGhlIGZpcnN0IGNhbGVuZGFyIHllYXIgYXQgb3IgYWZ0ZXIgYSByZWNvcmQncyBzdGFydCxcbi8vIHNvIGEgb25lLXllYXIgZXZlbnQgc3VjaCBhcyBhIGJhdHRsZSBpbiAxNTI2IGxhbmRzIG9uIHRoZSAxNjAwIG1hcCwgcmVhZCBhcyBcInNpbmNlIHRoZSBsYXN0IHNuYXBzaG90XCIuXG5leHBvcnQgZnVuY3Rpb24gcmVjb3Jkc0ZvcihyZWNvcmRzLCB0cmFja2VyLCB5ZWFyLCB5ZWFycyA9IFtdKSB7XG4gIGNvbnN0IHNvcnRlZCA9IFsuLi55ZWFyc10uc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICBjb25zdCBob21lID0gKHIpID0+IHNvcnRlZC5maW5kKCh5KSA9PiB5ID49IHIuc3RhcnQpO1xuICByZXR1cm4gcmVjb3Jkcy5maWx0ZXIoKHIpID0+IHIudHJhY2tlciA9PT0gdHJhY2tlciAmJiAoKHIuc3RhcnQgPD0geWVhciAmJiB5ZWFyIDw9IHIuZW5kKSB8fCBob21lKHIpID09PSB5ZWFyKSk7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBwb2ludCBtYXJrc1xuLy8gUmVjb3JkcyBvZiBraW5kIFwicG9pbnRcIiBkcmF3biBhdCB0aGVpciBnYXpldHRlZXIgY29vcmRpbmF0ZXMsIHNoYXBlZCBieSBldmVudCB0eXBlIChncmFtbWFyIFx1MDBBNzUpLlxuLy8gQ29vcmRpbmF0ZXMgY29tZSBmcm9tIGRhdGEvcmVjb3Jkcy5jc3YsIGZpbGxlZCBieSBzY3JpcHRzL2dlb2NvZGUubWpzIGZyb20gV2lraWRhdGE7IG5ldmVyIHR5cGVkIGJ5IGhhbmQuXG5cbmltcG9ydCB7IFNIQVBFUyB9IGZyb20gJy4vbGVnZW5kLmpzJztcbmltcG9ydCB7IHllYXJMYWJlbCB9IGZyb20gJy4uL2RhdGEvcmVjb3Jkcy5qcyc7XG5cbi8vIHJlY29yZHM6IHZhbGlkYXRlZCByb3dzIHdpdGggbG9uL2xhdDsgcHJvamVjdGlvbjogdGhlIHN0YWdlIHByb2plY3Rpb24uIFJvd3Mgd2l0aG91dCBjb29yZGluYXRlcyBhcmUgc2tpcHBlZC5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3TWFya3MobGF5ZXIsIHJlY29yZHMsIHByb2plY3Rpb24pIHtcbiAgY29uc3QgcGxhY2VkID0gcmVjb3Jkc1xuICAgIC5maWx0ZXIoKHIpID0+IHIubG9uICE9IG51bGwgJiYgci5sYXQgIT0gbnVsbCAmJiByLnNoYXBlKVxuICAgIC5tYXAoKHIpID0+ICh7IHIsIHh5OiBwcm9qZWN0aW9uKFtyLmxvbiwgci5sYXRdKSB9KSlcbiAgICAuZmlsdGVyKChtKSA9PiBtLnh5ICYmIE51bWJlci5pc0Zpbml0ZShtLnh5WzBdKSk7XG4gIGNvbnN0IGcgPSBsYXllci5zZWxlY3RBbGwoJ2cubWFyay1ncm91cCcpLmRhdGEocGxhY2VkLCAobSkgPT4gbS5yLmlkKS5qb2luKChlbnRlcikgPT4ge1xuICAgIGNvbnN0IGUgPSBlbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdtYXJrLWdyb3VwJyk7XG4gICAgZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsIChtKSA9PiBgbWFyayAke20uci5zaGFwZX1gKS5hdHRyKCdkJywgKG0pID0+IFNIQVBFU1ttLnIuc2hhcGVdID8/IFNIQVBFUy5jaXJjbGUpO1xuICAgIGUuYXBwZW5kKCd0aXRsZScpO1xuICAgIGNvbnN0IHQgPSBlLmFwcGVuZCgndGV4dCcpLmF0dHIoJ2NsYXNzJywgJ21hcmstbGFiZWwnKS5hdHRyKCd4JywgMTEpLmF0dHIoJ3knLCA0KTtcbiAgICB0LmFwcGVuZCgndHNwYW4nKS5hdHRyKCdjbGFzcycsICd3aGF0Jyk7XG4gICAgdC5hcHBlbmQoJ3RzcGFuJykuYXR0cignY2xhc3MnLCAnd2hlbicpLmF0dHIoJ2R4JywgNSk7XG4gICAgcmV0dXJuIGU7XG4gIH0pO1xuICBnLmF0dHIoJ3RyYW5zZm9ybScsIChtKSA9PiBgdHJhbnNsYXRlKCR7bS54eVswXX0sJHttLnh5WzFdfSlgKTtcbiAgZy5zZWxlY3QoJ3RpdGxlJykudGV4dCgobSkgPT4gYCR7bS5yLmxhYmVsfSBcdTAwQjcgJHt5ZWFyTGFiZWwobS5yKX0ke20uci5zb3VyY2UgPyBgXFxuJHttLnIuc291cmNlfWAgOiAnJ31gKTtcbiAgZy5zZWxlY3QoJ3RzcGFuLndoYXQnKS50ZXh0KChtKSA9PiBtLnIubGFiZWwpO1xuICBnLnNlbGVjdCgndHNwYW4ud2hlbicpLnRleHQoKG0pID0+IHllYXJMYWJlbChtLnIpKTtcbiAgcmV0dXJuIHBsYWNlZC5sZW5ndGg7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBiYXNlIHJlbmRlcmVyXG4vLyBCdWlsZHMgdGhlIHN0YWdlOiBwcm9qZWN0aW9uLCBwYXBlciwgb2NlYW4sIGJhdGh5bWV0cnksIHJlbGllZiwgbGFuZCwgcG9saXRpZXMsIHdhdGVyIGxpbmVzLCBjb2FzdCwgZ3JhdGljdWxlLFxuLy8gbGFiZWxzLCBsZWdlbmQsIGNhcnRvdWNoZSwgdGltZWxpbmUgc3RyaXAuIEFsbCBnZW9tZXRyeSBjb21lcyBmcm9tIHRoZSBkb3dubG9hZGVkIGxheWVyczsgdGhpcyBmaWxlIG9ubHlcbi8vIHByb2plY3RzIGFuZCBzdHlsZXMgaXQuXG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUsIG1lc2ggfSBmcm9tICd0b3BvanNvbi1jbGllbnQnO1xuaW1wb3J0IHsgYXNzZXRVUkwgfSBmcm9tICcuLi9kYXRhL2xvYWRlci5qcyc7XG5pbXBvcnQgeyBwYXBlckRlZnMsIGRyYXdQYXBlciwgZHJhd1BhcGVyT3ZlcmxheSB9IGZyb20gJy4vcGFwZXIuanMnO1xuaW1wb3J0IHsgZHJhd1N0YWdlTGFiZWxzLCBwb2xpdHlMYWJlbERhdGEsIGRyYXdQb2xpdHlMYWJlbHMgfSBmcm9tICcuL2xhYmVscy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVDYXJ0b3VjaGUgfSBmcm9tICcuL2NhcnRvdWNoZS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTdHJpcCB9IGZyb20gJy4vc3RyaXAuanMnO1xuaW1wb3J0IHsgY3JlYXRlTGVnZW5kIH0gZnJvbSAnLi9sZWdlbmQuanMnO1xuaW1wb3J0IHsgY3JlYXRlRGlmZkxpc3QgfSBmcm9tICcuL2RpZmZsaXN0LmpzJztcbmltcG9ydCB7IGNvbXB1dGVEaWZmIH0gZnJvbSAnLi4vdmlld3MvZGlmZi5qcyc7XG5pbXBvcnQgeyBkcmF3TWFya3MgfSBmcm9tICcuL21hcmtzLmpzJztcblxuZXhwb3J0IGNvbnN0IENST1NTRkFERV9NUyA9IDMwMDtcblxuZXhwb3J0IGNvbnN0IERJRkZfTEVHRU5EID0ge1xuICB0aXRsZTogJ0NvbnRpbnVpdHkgYW5kIGNoYW5nZScsXG4gIGxlZ2VuZDogW1xuICAgIHsgc3dhdGNoOiAnZmlsbCcsIGtleTogJ2ZvY3VzJywgbGFiZWw6ICdBcHBlYXJlZCcgfSxcbiAgICB7IHN3YXRjaDogJ2hhdGNoJywgbGFiZWw6ICdWYW5pc2hlZCcgfSxcbiAgICB7IHN3YXRjaDogJ2xpbmUnLCBzdHlsZTogJ3NvbGlkJywgbGFiZWw6ICdQZXJzaXN0ZWQgKGJvcmRlciknIH0sXG4gIF0sXG59O1xuXG5leHBvcnQgY29uc3QgVyA9IDE5MjA7XG5leHBvcnQgY29uc3QgSCA9IDEwODA7XG4vLyBUaGUgZ29sZCByaW5nLiBUaGUgYm90dG9tIGlzIGRlZXBlciBiZWNhdXNlIGl0IGNhcnJpZXMgdGhlIHRpbWVsaW5lIHN0cmlwLlxuZXhwb3J0IGNvbnN0IEZSQU1FID0geyBsZWZ0OiAzMiwgcmlnaHQ6IDMyLCB0b3A6IDMyLCBib3R0b206IDY0IH07XG5cbmNvbnN0IFBST0pFQ1RJT05TID0ge1xuICBlcXVhbEVhcnRoOiAoKSA9PiBkMy5nZW9FcXVhbEVhcnRoKCksXG4gIGxhbWJlcnRBemltdXRoYWxFcXVhbEFyZWE6ICgpID0+IGQzLmdlb0F6aW11dGhhbEVxdWFsQXJlYSgpLFxuICBhbGJlcnNVc2E6ICgpID0+IGQzLmdlb0FsYmVyc1VzYSgpLFxufTtcblxuLy8gQSBsb24vbGF0IGJveCB3aXRoIGl0cyBlZGdlcyBkZW5zaWZpZWQgc28gZml0RXh0ZW50IHNlZXMgdGhlIGJveCdzIGN1cnZlZCBvdXRsaW5lIGluIHRoZSBwcm9qZWN0aW9uLlxuLy8gZDMtZ2VvIHRyZWF0cyBzcGhlcmljYWwgcG9seWdvbnMgYnkgd2luZGluZyBvcmRlcjogdGhlIGV4dGVyaW9yIHJpbmcgbXVzdCBydW4gY2xvY2t3aXNlXG4vLyAod2VzdFx1MjE5MmVhc3QgYWxvbmcgdGhlIG5vcnRoIGVkZ2UgZmlyc3QpLCBvciB0aGUgXCJpbnNpZGVcIiBiZWNvbWVzIHRoZSByZXN0IG9mIHRoZSBnbG9iZS5cbmZ1bmN0aW9uIGV4dGVudFBvbHlnb24oeyB3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGggfSwgc3RlcCA9IDEpIHtcbiAgY29uc3QgcmluZyA9IFtdO1xuICBmb3IgKGxldCB4ID0gd2VzdDsgeCA8IGVhc3Q7IHggKz0gc3RlcCkgcmluZy5wdXNoKFt4LCBub3J0aF0pO1xuICBmb3IgKGxldCB5ID0gbm9ydGg7IHkgPiBzb3V0aDsgeSAtPSBzdGVwKSByaW5nLnB1c2goW2Vhc3QsIHldKTtcbiAgZm9yIChsZXQgeCA9IGVhc3Q7IHggPiB3ZXN0OyB4IC09IHN0ZXApIHJpbmcucHVzaChbeCwgc291dGhdKTtcbiAgZm9yIChsZXQgeSA9IHNvdXRoOyB5IDwgbm9ydGg7IHkgKz0gc3RlcCkgcmluZy5wdXNoKFt3ZXN0LCB5XSk7XG4gIHJpbmcucHVzaChyaW5nWzBdKTtcbiAgcmV0dXJuIHsgdHlwZTogJ1BvbHlnb24nLCBjb29yZGluYXRlczogW3JpbmddIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUHJvamVjdGlvbihzdGFnZSwgaW5uZXIpIHtcbiAgY29uc3QgbWFrZSA9IFBST0pFQ1RJT05TW3N0YWdlLnByb2plY3Rpb25dO1xuICBpZiAoIW1ha2UpIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwcm9qZWN0aW9uICR7c3RhZ2UucHJvamVjdGlvbn1gKTtcbiAgY29uc3QgcHJvaiA9IG1ha2UoKTtcbiAgaWYgKHN0YWdlLnJvdGF0ZSAmJiBwcm9qLnJvdGF0ZSkgcHJvai5yb3RhdGUoc3RhZ2Uucm90YXRlKTtcbiAgcHJvai5maXRFeHRlbnQoaW5uZXIsIGV4dGVudFBvbHlnb24oc3RhZ2UuZXh0ZW50KSk7XG4gIHJldHVybiBwcm9qO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhZ2Uoc3ZnLCBzdGFnZSwgbGF5ZXJzLCB7IHRyYWNrZXIsIHllYXJzID0gW10sIG9uWWVhciB9ID0ge30pIHtcbiAgY29uc3QgaW5uZXIgPSBbW0ZSQU1FLmxlZnQsIEZSQU1FLnRvcF0sIFtXIC0gRlJBTUUucmlnaHQsIEggLSBGUkFNRS5ib3R0b21dXTtcbiAgY29uc3QgW1t4MCwgeTBdLCBbeDEsIHkxXV0gPSBpbm5lcjtcbiAgY29uc3QgZnJhbWUgPSB7IHgwLCB5MCwgeDEsIHkxIH07XG4gIGNvbnN0IHByb2plY3Rpb24gPSBtYWtlUHJvamVjdGlvbihzdGFnZSwgaW5uZXIpO1xuICBjb25zdCBwYXRoID0gZDMuZ2VvUGF0aChwcm9qZWN0aW9uKTtcblxuICAvLyBQcm9qZWN0ZWQgcGF0aCBzdHJpbmdzIGFyZSBjYWNoZWQgcGVyIGZlYXR1cmUgb2JqZWN0OiBhIHNuYXBzaG90IHN3aXRjaCBvbmx5IHJlLWJpbmRzIGNhY2hlZCBzdHJpbmdzLlxuICBjb25zdCBjYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG4gIGNvbnN0IGQgPSAoZikgPT4ge1xuICAgIGxldCBzID0gY2FjaGUuZ2V0KGYpO1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHsgcyA9IHBhdGgoZikgfHwgJyc7IGNhY2hlLnNldChmLCBzKTsgfVxuICAgIHJldHVybiBzO1xuICB9O1xuXG4gIHN2Zy5hdHRyKCd2aWV3Qm94JywgYDAgMCAke1d9ICR7SH1gKS5hdHRyKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgJ3hNaWRZTWlkIG1lZXQnKTtcbiAgc3ZnLnNlbGVjdEFsbCgnKicpLnJlbW92ZSgpO1xuXG4gIGNvbnN0IGRlZnMgPSBzdmcuYXBwZW5kKCdkZWZzJyk7XG4gIHBhcGVyRGVmcyhkZWZzKTtcbiAgZGVmcy5hcHBlbmQoJ2NsaXBQYXRoJykuYXR0cignaWQnLCAnZnJhbWUtY2xpcCcpLmFwcGVuZCgncmVjdCcpXG4gICAgLmF0dHIoJ3gnLCB4MCkuYXR0cigneScsIHkwKS5hdHRyKCd3aWR0aCcsIHgxIC0geDApLmF0dHIoJ2hlaWdodCcsIHkxIC0geTApO1xuXG4gIGNvbnN0IHJvb3QgPSBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc3RhZ2UnKTtcbiAgZHJhd1BhcGVyKHJvb3QsIFcsIEgpO1xuXG4gIGNvbnN0IG1hcCA9IHJvb3QuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFwJykuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjZnJhbWUtY2xpcCknKTtcbiAgLy8gVGhlIG9jZWFuIGlzIHRoZSBnbG9iZSBpdHNlbGY7IGFueXRoaW5nIGJleW9uZCBpdHMgZWRnZSBzdGF5cyBwYXBlci5cbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ29jZWFuJykuYXR0cignZCcsIGQoeyB0eXBlOiAnU3BoZXJlJyB9KSk7XG5cbiAgLy8gQmF0aHltZXRyeTogaGFpcmxpbmUgY29udG91cnMgaW4gdGhlIG9jZWFuIHRvbmUuXG4gIGNvbnN0IGJhdGh5ID0gZmVhdHVyZShsYXllcnMuYmF0aHksIGxheWVycy5iYXRoeS5vYmplY3RzLmJhdGh5bWV0cnkpO1xuICBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnYmF0aHltZXRyeScpXG4gICAgLnNlbGVjdEFsbCgncGF0aCcpLmRhdGEoYmF0aHkuZmVhdHVyZXMpLmpvaW4oJ3BhdGgnKS5hdHRyKCdkJywgZCk7XG5cbiAgLy8gTGFuZCBhdCByZXN0IChjcmVhbSksIHRoZW4gcmVsaWVmIChwcmUtcmVuZGVyZWQgZm9yIHRoaXMgc3RhZ2UsIHdoZW4gcHJlc2VudCksIG1hc2tlZCB0byBsYW5kLlxuICBjb25zdCBuZSA9IGxheWVycy5uZTtcbiAgY29uc3QgbGFuZCA9IGZlYXR1cmUobmUsIG5lLm9iamVjdHMubGFuZCk7XG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdsYW5kJykuYXR0cignZCcsIGQobGFuZCkpO1xuICBpZiAoc3RhZ2UucmVsaWVmKSB7XG4gICAgZGVmcy5hcHBlbmQoJ2NsaXBQYXRoJykuYXR0cignaWQnLCAnbGFuZC1jbGlwJykuYXBwZW5kKCdwYXRoJykuYXR0cignZCcsIGQobGFuZCkpO1xuICAgIG1hcC5hcHBlbmQoJ2ltYWdlJykuYXR0cignY2xhc3MnLCAncmVsaWVmJylcbiAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNsYW5kLWNsaXApJylcbiAgICAgIC5hdHRyKCd4JywgeDApLmF0dHIoJ3knLCB5MCkuYXR0cignd2lkdGgnLCB4MSAtIHgwKS5hdHRyKCdoZWlnaHQnLCB5MSAtIHkwKVxuICAgICAgLmF0dHIoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAnbm9uZScpXG4gICAgICAuYXR0cignaHJlZicsIGFzc2V0VVJMKGBhc3NldHMvJHtzdGFnZS5yZWxpZWZ9YCkpO1xuICB9XG5cbiAgLy8gSGF0Y2ggZm9yIHZhbmlzaGVkIC8gZGlzcHV0ZWQgKGdyYW1tYXIgXHUwMEE3NSk6IHJ1c3QgZGlhZ29uYWxzLlxuICBkZWZzLmFwcGVuZCgncGF0dGVybicpLmF0dHIoJ2lkJywgJ2hhdGNoLXJ1c3QnKS5hdHRyKCdwYXR0ZXJuVW5pdHMnLCAndXNlclNwYWNlT25Vc2UnKS5hdHRyKCd3aWR0aCcsIDkpLmF0dHIoJ2hlaWdodCcsIDkpLmF0dHIoJ3BhdHRlcm5UcmFuc2Zvcm0nLCAncm90YXRlKDQ1KScpXG4gICAgLmFwcGVuZCgnbGluZScpLmF0dHIoJ3gxJywgMCkuYXR0cigneTEnLCAwKS5hdHRyKCd4MicsIDApLmF0dHIoJ3kyJywgOSkuYXR0cignY2xhc3MnLCAnaGF0Y2gtbGluZScpO1xuXG4gIC8vIFNuYXBzaG90IGxheWVycyAocG9saXRpZXMsIGJvcmRlcnMsIGxhYmVscykgbGl2ZSBoZXJlOyBlYWNoIHNob3coKSBjcmVhdGVzIGEgbmV3IGdyb3VwIGFuZCBjcm9zc2ZhZGVzLlxuICBjb25zdCBzbmFwc2hvdHMgPSBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc25hcHNob3RzJyk7XG5cbiAgLy8gV2F0ZXIgbGluZXMgYW5kIGNvYXN0LlxuICBjb25zdCByaXZlcnMgPSBmZWF0dXJlKG5lLCBuZS5vYmplY3RzLnJpdmVycyk7XG4gIG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdyaXZlcnMnKVxuICAgIC5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKHJpdmVycy5mZWF0dXJlcy5maWx0ZXIoKGYpID0+IChmLnByb3BlcnRpZXMuc2NhbGVyYW5rID8/IDApIDw9IDcpKS5qb2luKCdwYXRoJykuYXR0cignZCcsIGQpO1xuICBjb25zdCBsYWtlcyA9IGZlYXR1cmUobmUsIG5lLm9iamVjdHMubGFrZXMpO1xuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGFrZXMnKS5hdHRyKCdkJywgZChsYWtlcykpO1xuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnY29hc3RsaW5lJykuYXR0cignZCcsIGQoZmVhdHVyZShuZSwgbmUub2JqZWN0cy5jb2FzdGxpbmUpKSk7XG5cbiAgLy8gR3JhdGljdWxlOiBoYWlybGluZSBnb2xkLCBldmVyeSAxMFx1MDBCMC5cbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2dyYXRpY3VsZScpLmF0dHIoJ2QnLCBkKGQzLmdlb0dyYXRpY3VsZTEwKCkpKTtcblxuICAvLyBTdGFnZSBsYWJlbHMgYWxvbmcgdGhlaXIgcGFyYWxsZWxzLiBQb2xpdHkgbGFiZWxzIGFyZSBkcmF3biBwZXIgc25hcHNob3QsIGFib3ZlIHRoZSB3YXRlciBsaW5lcy5cbiAgZHJhd1N0YWdlTGFiZWxzKG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzdGFnZS1sYWJlbHMnKSwgZGVmcywgc3RhZ2UsIHBhdGgpO1xuICBjb25zdCBsYWJlbExheWVycyA9IG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdwb2xpdHktbGFiZWxzJyk7XG4gIC8vIFBvaW50IG1hcmtzIGZyb20gcmVjb3Jkcy5jc3Ygc2l0IGFib3ZlIGV2ZXJ5IGxhYmVsLlxuICBjb25zdCBtYXJrc0xheWVyID0gbWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ21hcmtzJyk7XG5cbiAgLy8gR3JhaW4gYW5kIHZpZ25ldHRlIG92ZXIgdGhlIHNoZWV0LCB0aGVuIHRoZSBhcHBhcmF0dXMgb24gdG9wLlxuICBkcmF3UGFwZXJPdmVybGF5KHJvb3QsIFcsIEgpO1xuXG4gIC8vIEZyYW1lOiBnb2xkIG9uIHRocmVlIHNpZGVzOyB0aGUgYm90dG9tIGVkZ2UgaXMgdGhlIHRpbWVsaW5lIHN0cmlwJ3MgYmFzZWxpbmUuXG4gIHJvb3QuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnZnJhbWUnKS5hdHRyKCdkJywgYE0ke3gwfSwke3kxfUwke3gwfSwke3kwfUwke3gxfSwke3kwfUwke3gxfSwke3kxfWApO1xuXG4gIGNvbnN0IGxlZ2VuZCA9IGNyZWF0ZUxlZ2VuZChyb290LCBmcmFtZSk7XG4gIGxldCBjdXJyZW50VHJhY2tlciA9IHRyYWNrZXI7XG4gIGlmICh0cmFja2VyKSBsZWdlbmQuc2V0KHRyYWNrZXIpO1xuICBjb25zdCBkaWZmTGlzdCA9IGNyZWF0ZURpZmZMaXN0KHJvb3QsIGZyYW1lKTtcbiAgY29uc3QgY2FydG91Y2hlID0gY3JlYXRlQ2FydG91Y2hlKHJvb3QsIGZyYW1lLCBzdGFnZSwgcHJvamVjdGlvbik7XG4gIGNvbnN0IHN0cmlwID0gY3JlYXRlU3RyaXAocm9vdCwgZnJhbWUsIHN0YWdlLCB5ZWFycywgb25ZZWFyKTtcblxuICBsZXQgY3VycmVudFllYXIgPSBudWxsO1xuXG4gIC8vIENyb3NzZmFkZTogYnVpbGQgdGhlIG5ldyBsYXllciBhdCBvcGFjaXR5IDAsIGZhZGUgaXQgaW4gd2hpbGUgZXZlcnkgb2xkZXIgbGF5ZXIgZmFkZXMgb3V0IGFuZCBpcyByZW1vdmVkLlxuICBmdW5jdGlvbiBjcm9zc2ZhZGUoYnVpbGQpIHtcbiAgICBjb25zdCBnID0gc25hcHNob3RzLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3NuYXAnKS5zdHlsZSgnb3BhY2l0eScsIDApO1xuICAgIGNvbnN0IGxnID0gbGFiZWxMYXllcnMuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc25hcC1sYWJlbHMnKS5zdHlsZSgnb3BhY2l0eScsIDApO1xuICAgIGJ1aWxkKGcsIGxnKTtcbiAgICBzbmFwc2hvdHMuc2VsZWN0QWxsKCdnLnNuYXAnKS5maWx0ZXIoZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcyAhPT0gZy5ub2RlKCk7IH0pXG4gICAgICAudHJhbnNpdGlvbigpLmR1cmF0aW9uKENST1NTRkFERV9NUykuc3R5bGUoJ29wYWNpdHknLCAwKS5yZW1vdmUoKTtcbiAgICBsYWJlbExheWVycy5zZWxlY3RBbGwoJ2cuc25hcC1sYWJlbHMnKS5maWx0ZXIoZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcyAhPT0gbGcubm9kZSgpOyB9KVxuICAgICAgLnRyYW5zaXRpb24oKS5kdXJhdGlvbihDUk9TU0ZBREVfTVMpLnN0eWxlKCdvcGFjaXR5JywgMCkucmVtb3ZlKCk7XG4gICAgZy50cmFuc2l0aW9uKCkuZHVyYXRpb24oQ1JPU1NGQURFX01TKS5zdHlsZSgnb3BhY2l0eScsIDEpO1xuICAgIGxnLnRyYW5zaXRpb24oKS5kdXJhdGlvbihDUk9TU0ZBREVfTVMpLnN0eWxlKCdvcGFjaXR5JywgMSk7XG4gIH1cblxuICAvLyBGZWF0dXJlcyBhbmQgbWVzaGVzIGFyZSBkZWNvZGVkIG9uY2UgcGVyIHNuYXBzaG90IHRvcG9sb2d5LCBzbyB0aGUgcHJvamVjdGVkLXBhdGggY2FjaGUgaGl0cyBvbiBldmVyeSBsYXRlciBzaG93LlxuICBjb25zdCBuYW1lZENhY2hlID0gbmV3IFdlYWtNYXAoKSwgaW50ZXJpb3JDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG4gIGNvbnN0IG5hbWVkT2YgPSAodG9wbykgPT4ge1xuICAgIGxldCB2ID0gbmFtZWRDYWNoZS5nZXQodG9wbyk7XG4gICAgaWYgKCF2KSB7IHYgPSBmZWF0dXJlKHRvcG8sIHRvcG8ub2JqZWN0cy5wb2xpdGllcykuZmVhdHVyZXMuZmlsdGVyKChmKSA9PiBmLnByb3BlcnRpZXMuaWQpOyBuYW1lZENhY2hlLnNldCh0b3BvLCB2KTsgfVxuICAgIHJldHVybiB2O1xuICB9O1xuICBjb25zdCBpbnRlcmlvck9mID0gKHRvcG8pID0+IHtcbiAgICBsZXQgdiA9IGludGVyaW9yQ2FjaGUuZ2V0KHRvcG8pO1xuICAgIGlmICghdikgeyB2ID0gbWVzaCh0b3BvLCB0b3BvLm9iamVjdHMucG9saXRpZXMsIChhLCBiKSA9PiBhICE9PSBiKTsgaW50ZXJpb3JDYWNoZS5zZXQodG9wbywgdik7IH1cbiAgICByZXR1cm4gdjtcbiAgfTtcblxuICAvLyBjbGFzc2lmeShmZWF0dXJlLCB5ZWFyKSBcdTIxOTIgeyBzdGF0dXM6ICdoaWdobGlnaHQnIHwgJ211dGVkJywga2V5PywgbGFiZWw/IH1cbiAgZnVuY3Rpb24gc2hvd1NuYXBzaG90KHllYXIsIHRvcG8sIGNsYXNzaWZ5ID0gKCkgPT4gKHsgc3RhdHVzOiAnbXV0ZWQnIH0pKSB7XG4gICAgY29uc3QgbmFtZWQgPSBuYW1lZE9mKHRvcG8pO1xuICAgIGZvciAoY29uc3QgZiBvZiBuYW1lZCkgZi5wcm9wZXJ0aWVzLmNscyA9IGNsYXNzaWZ5KGYsIHllYXIpO1xuICAgIGNvbnN0IGNlcnRhaW50eSA9IG5hbWVkWzBdPy5wcm9wZXJ0aWVzLmNlcnRhaW50eSA/PyAnYXBwcm94aW1hdGUnO1xuICAgIGNyb3NzZmFkZSgoZywgbGcpID0+IHtcbiAgICAgIGcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9saXRpZXMnKS5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKG5hbWVkKS5qb2luKCdwYXRoJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgKGYpID0+IGBwb2xpdHkgJHtmLnByb3BlcnRpZXMuY2VydGFpbnR5fSAke2YucHJvcGVydGllcy5jbHMuc3RhdHVzfWApXG4gICAgICAgIC5hdHRyKCdkJywgZClcbiAgICAgICAgLmFwcGVuZCgndGl0bGUnKS50ZXh0KChmKSA9PiBmLnByb3BlcnRpZXMuY2xzLmxhYmVsID8/IGYucHJvcGVydGllcy5uYW1lKTtcbiAgICAgIGcuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCBgYm9yZGVyICR7Y2VydGFpbnR5fWApLmF0dHIoJ2QnLCBkKGludGVyaW9yT2YodG9wbykpKTtcbiAgICAgIGRyYXdQb2xpdHlMYWJlbHMobGcsIHBvbGl0eUxhYmVsRGF0YShuYW1lZC5maWx0ZXIoKGYpID0+IGYucHJvcGVydGllcy5jbHMuc3RhdHVzID09PSAnaGlnaGxpZ2h0JyksIHBhdGgpKTtcbiAgICB9KTtcbiAgICBpZiAoY3VycmVudFRyYWNrZXIpIGxlZ2VuZC5zZXQoY3VycmVudFRyYWNrZXIpO1xuICAgIGRpZmZMaXN0LmhpZGUoKTtcbiAgICBjdXJyZW50WWVhciA9IHllYXI7XG4gIH1cblxuICAvLyBNYXJrczogdmFsaWRhdGVkIHBvaW50IHJlY29yZHMgKGFscmVhZHkgZmlsdGVyZWQgdG8gdGhlIHllYXIgYW5kIHRyYWNrZXIpLiBQYXNzIFtdIHRvIGNsZWFyLlxuICBmdW5jdGlvbiBzaG93TWFya3MocmVjb3Jkcykge1xuICAgIHJldHVybiBkcmF3TWFya3MobWFya3NMYXllciwgcmVjb3JkcywgcHJvamVjdGlvbik7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRUcmFja2VyKHQpIHsgY3VycmVudFRyYWNrZXIgPSB0OyB9XG5cbiAgLy8gRGlmZjogQiBpcyB0aGUgZ3JvdW5kIChtdXRlZCwgaXRzIGJvcmRlcnMpOyBhcHBlYXJlZCA9IEIgZmVhdHVyZXMgaW4gdGhlIGZvY3VzIGNvbG91cjtcbiAgLy8gdmFuaXNoZWQgPSBBIGZlYXR1cmVzIGhhdGNoZWQgYW5kIG91dGxpbmVkIGluIHJ1c3Q7IHBlcnNpc3RlZCA9IG11dGVkLlxuICBmdW5jdGlvbiBzaG93RGlmZihhLCBiLCBpZGVudGlmeSkge1xuICAgIGNvbnN0IGFOYW1lZCA9IG5hbWVkT2YoYS50b3BvKSwgYk5hbWVkID0gbmFtZWRPZihiLnRvcG8pO1xuICAgIGNvbnN0IGRpZmYgPSBjb21wdXRlRGlmZih7IGFGZWF0dXJlczogYU5hbWVkLCBhWWVhcjogYS55ZWFyLCBiRmVhdHVyZXM6IGJOYW1lZCwgYlllYXI6IGIueWVhciwgaWRlbnRpZnksIHBhdGgsIGZyYW1lLCBtaW5LbTI6IHN0YWdlLmRpZmZfbWluX2ttMiA/PyAxMjAwMDAgfSk7XG4gICAgY29uc3QgYXBwZWFyZWQgPSBkaWZmLmFwcGVhcmVkLmZsYXRNYXAoKGl0KSA9PiBpdC5iLm1hcCgoZikgPT4gKHsgZiwgbGFiZWw6IGl0LmxhYmVsLCBrZXk6IGl0LmtleSB9KSkpO1xuICAgIGNvbnN0IHZhbmlzaGVkID0gZGlmZi52YW5pc2hlZC5mbGF0TWFwKChpdCkgPT4gaXQuYS5tYXAoKGYpID0+ICh7IGYsIGxhYmVsOiBpdC5sYWJlbCwga2V5OiBpdC5rZXkgfSkpKTtcbiAgICBjb25zdCBjZXJ0YWludHkgPSBiTmFtZWRbMF0/LnByb3BlcnRpZXMuY2VydGFpbnR5ID8/ICdhcHByb3hpbWF0ZSc7XG4gICAgY3Jvc3NmYWRlKChnLCBsZykgPT4ge1xuICAgICAgZy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdwb2xpdGllcycpLnNlbGVjdEFsbCgncGF0aCcpLmRhdGEoYk5hbWVkKS5qb2luKCdwYXRoJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgKGYpID0+IGBwb2xpdHkgJHtmLnByb3BlcnRpZXMuY2VydGFpbnR5fSBtdXRlZGApLmF0dHIoJ2QnLCBkKVxuICAgICAgICAuYXBwZW5kKCd0aXRsZScpLnRleHQoKGYpID0+IGYucHJvcGVydGllcy5uYW1lKTtcbiAgICAgIGcuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCBgYm9yZGVyICR7Y2VydGFpbnR5fWApLmF0dHIoJ2QnLCBkKGludGVyaW9yT2YoYi50b3BvKSkpO1xuICAgICAgZy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdhcHBlYXJlZCcpLnNlbGVjdEFsbCgncGF0aCcpLmRhdGEoYXBwZWFyZWQpLmpvaW4oJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAncG9saXR5IGFwcGVhcmVkJykuYXR0cignZCcsICh4KSA9PiBkKHguZikpLmFwcGVuZCgndGl0bGUnKS50ZXh0KCh4KSA9PiBgJHt4LmxhYmVsfSBcdTIwMTQgYXBwZWFyZWQgYnkgJHtiLnllYXJ9YCk7XG4gICAgICBnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ZhbmlzaGVkJykuc2VsZWN0QWxsKCdwYXRoJykuZGF0YSh2YW5pc2hlZCkuam9pbigncGF0aCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdwb2xpdHkgdmFuaXNoZWQnKS5hdHRyKCdkJywgKHgpID0+IGQoeC5mKSkuYXBwZW5kKCd0aXRsZScpLnRleHQoKHgpID0+IGAke3gubGFiZWx9IFx1MjAxNCBnb25lIGJ5ICR7Yi55ZWFyfWApO1xuICAgICAgY29uc3QgbGFiZWxsZWQgPSAoaXRlbXMsIGNscykgPT4gcG9saXR5TGFiZWxEYXRhKGl0ZW1zLm1hcCgoeCkgPT4geyB4LmYucHJvcGVydGllcy5jbHMgPSB7IGxhYmVsOiB4LmxhYmVsIH07IHJldHVybiB4LmY7IH0pLCBwYXRoKS5tYXAoKGwpID0+ICh7IC4uLmwsIGNscyB9KSk7XG4gICAgICBkcmF3UG9saXR5TGFiZWxzKGxnLCBbLi4ubGFiZWxsZWQoYXBwZWFyZWQsICdhcHBlYXJlZCcpLCAuLi5sYWJlbGxlZCh2YW5pc2hlZCwgJ3ZhbmlzaGVkJyldKTtcbiAgICAgIGxnLnNlbGVjdEFsbCgndGV4dCcpLmF0dHIoJ2NsYXNzJywgKGwpID0+IGBsYWJlbCBwb2xpdHkgJHtsLmNscyA/PyAnJ31gKTtcbiAgICB9KTtcbiAgICBsZWdlbmQuc2V0KHsgLi4uRElGRl9MRUdFTkQsIHRpdGxlOiBgQ2hhbmdlICR7YS55ZWFyfSBcdTIxOTIgJHtiLnllYXJ9YCB9KTtcbiAgICBkaWZmTGlzdC5zZXQoZGlmZiwgeTAgKyAyMiArIGxlZ2VuZC5oZWlnaHQoKSArIDE0KTtcbiAgICBjdXJyZW50WWVhciA9IGIueWVhcjtcbiAgICByZXR1cm4gZGlmZjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFllYXIoeWVhciwgc291cmNlWWVhcikge1xuICAgIGNhcnRvdWNoZS5zZXRZZWFyKHllYXIsIHNvdXJjZVllYXIpO1xuICAgIHN0cmlwLnNldFllYXIoeWVhcik7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRSYW5nZShhLCBiKSB7XG4gICAgY2FydG91Y2hlLnNldFJhbmdlKGEsIGIpO1xuICAgIHN0cmlwLnNldFJhbmdlKGEueWVhciwgYi55ZWFyKTtcbiAgfVxuXG4gIHJldHVybiB7IHByb2plY3Rpb24sIHBhdGgsIGQsIGZyYW1lLCBzaG93U25hcHNob3QsIHNob3dEaWZmLCBzaG93TWFya3MsIHNldFRyYWNrZXIsIHNldFllYXIsIHNldFJhbmdlLCBsZWdlbmQsIGNhcnRvdWNoZSwgZ2V0IHllYXIoKSB7IHJldHVybiBjdXJyZW50WWVhcjsgfSB9O1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZXhwb3J0XG4vLyBCYWtlcyB0aGUgY3VycmVudCB2aWV3IChtYXAsIGxlZ2VuZCwgY2FydG91Y2hlLCB0aW1lbGluZSBzdHJpcCkgaW50byBhIFBORyBvciBhbiBTVkcgdGhhdCBzdGFuZHMgYWxvbmU6XG4vLyB0aGUgcGFnZSBzdHlsZXMsIHRoZSBMaWJyZSBCYXNrZXJ2aWxsZSBmb250cyBhbmQgdGhlIHJlbGllZiBpbWFnZSBhcmUgZW1iZWRkZWQsIHNvIG5vdGhpbmcgcG9pbnRzIGJhY2tcbi8vIGF0IHRoZSBzaXRlLiBUaGUgdG9vbGJhciBsaXZlcyBvdXRzaWRlIHRoZSA8c3ZnPiwgc28gaXQgaXMgbmV2ZXIgcGFydCBvZiBhbiBleHBvcnQuXG5cbmltcG9ydCB7IFcsIEggfSBmcm9tICcuLi9yZW5kZXIvYmFzZS5qcyc7XG5cbmNvbnN0IFNWR19OUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5jb25zdCBkYXRhVVJMcyA9IG5ldyBNYXAoKTtcblxuLy8gRmV0Y2ggYSBVUkwgb25jZSBhbmQga2VlcCBpdCBhcyBhIGRhdGE6IFVSTCAoZm9udHMsIHJlbGllZikuXG5mdW5jdGlvbiB0b0RhdGFVUkwodXJsKSB7XG4gIGlmICh1cmwuc3RhcnRzV2l0aCgnZGF0YTonKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1cmwpO1xuICBpZiAoIWRhdGFVUkxzLmhhcyh1cmwpKSB7XG4gICAgZGF0YVVSTHMuc2V0KHVybCwgZmV0Y2godXJsKS50aGVuKGFzeW5jIChyZXMpID0+IHtcbiAgICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmZXRjaCAke3VybH0gKEhUVFAgJHtyZXMuc3RhdHVzfSlgKTtcbiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXMuYmxvYigpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHIub25sb2FkID0gKCkgPT4gcmVzb2x2ZShyLnJlc3VsdCk7XG4gICAgICAgIHIub25lcnJvciA9ICgpID0+IHJlamVjdChyLmVycm9yKTtcbiAgICAgICAgci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuICAgICAgfSk7XG4gICAgfSkpO1xuICB9XG4gIHJldHVybiBkYXRhVVJMcy5nZXQodXJsKTtcbn1cblxuLy8gUmV3cml0ZSBldmVyeSB1cmwoLi4uKSBpbiBhIENTUyBydWxlIHRvIGEgZGF0YTogVVJMLCByZXNvbHZlZCBhZ2FpbnN0IHRoZSBzdHlsZXNoZWV0IGl0IGNhbWUgZnJvbS5cbmFzeW5jIGZ1bmN0aW9uIGlubGluZVVybHMoY3NzVGV4dCwgYmFzZSkge1xuICBjb25zdCBwYXJ0cyA9IFtdO1xuICBjb25zdCByZSA9IC91cmxcXCgoWydcIl0/KShbXidcIildKylcXDFcXCkvZztcbiAgbGV0IGxhc3QgPSAwLCBtO1xuICB3aGlsZSAoKG0gPSByZS5leGVjKGNzc1RleHQpKSkge1xuICAgIHBhcnRzLnB1c2goY3NzVGV4dC5zbGljZShsYXN0LCBtLmluZGV4KSk7XG4gICAgY29uc3QgYWJzID0gbmV3IFVSTChtWzJdLCBiYXNlKS5ocmVmO1xuICAgIHBhcnRzLnB1c2goYHVybChcIiR7YXdhaXQgdG9EYXRhVVJMKGFicyl9XCIpYCk7XG4gICAgbGFzdCA9IG0uaW5kZXggKyBtWzBdLmxlbmd0aDtcbiAgfVxuICBwYXJ0cy5wdXNoKGNzc1RleHQuc2xpY2UobGFzdCkpO1xuICByZXR1cm4gcGFydHMuam9pbignJyk7XG59XG5cbi8vIEV2ZXJ5IHNhbWUtb3JpZ2luIHN0eWxlc2hlZXQgcnVsZSBvbiB0aGUgcGFnZSwgd2l0aCBAZm9udC1mYWNlIHNvdXJjZXMgZW1iZWRkZWQuIFJ1bGVzIHRoYXQgb25seSBtYXR0ZXJcbi8vIHRvIHRoZSBwYWdlIChib2R5LCB0b29sYmFyKSBhcmUgaGFybWxlc3MgaW5zaWRlIGFuIFNWRyBkb2N1bWVudC5cbmFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RDU1MoKSB7XG4gIGNvbnN0IG91dCA9IFtdO1xuICBmb3IgKGNvbnN0IHNoZWV0IG9mIGRvY3VtZW50LnN0eWxlU2hlZXRzKSB7XG4gICAgbGV0IHJ1bGVzO1xuICAgIHRyeSB7IHJ1bGVzID0gc2hlZXQuY3NzUnVsZXM7IH0gY2F0Y2ggeyBjb250aW51ZTsgfVxuICAgIGNvbnN0IGJhc2UgPSBzaGVldC5ocmVmIHx8IGxvY2F0aW9uLmhyZWY7XG4gICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICBvdXQucHVzaChydWxlIGluc3RhbmNlb2YgQ1NTRm9udEZhY2VSdWxlID8gYXdhaXQgaW5saW5lVXJscyhydWxlLmNzc1RleHQsIGJhc2UpIDogcnVsZS5jc3NUZXh0KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dC5qb2luKCdcXG4nKTtcbn1cblxuLy8gQSBzZWxmLWNvbnRhaW5lZCBjb3B5IG9mIHRoZSBtYXAgYXMgU1ZHIHRleHQuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc25hcHNob3RTVkcoc3ZnTm9kZSwgeyB0cmFuc3BhcmVudCA9IGZhbHNlIH0gPSB7fSkge1xuICBjb25zdCBjbG9uZSA9IHN2Z05vZGUuY2xvbmVOb2RlKHRydWUpO1xuICBjbG9uZS5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgU1ZHX05TKTtcbiAgY2xvbmUuc2V0QXR0cmlidXRlKCd4bWxuczp4bGluaycsICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyk7XG4gIGNsb25lLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBXKTtcbiAgY2xvbmUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBIKTtcbiAgY2xvbmUucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXG4gIC8vIEEgY3Jvc3NmYWRlIG1heSBiZSBtaWQtZmxpZ2h0OiBrZWVwIG9ubHkgdGhlIG5ld2VzdCBzbmFwc2hvdCBsYXllciwgZnVsbHkgb3BhcXVlLlxuICBmb3IgKGNvbnN0IHNlbCBvZiBbJ2cuc25hcHNob3RzID4gZy5zbmFwJywgJ2cucG9saXR5LWxhYmVscyA+IGcuc25hcC1sYWJlbHMnXSkge1xuICAgIGNvbnN0IGxheWVycyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKTtcbiAgICBsYXllcnMuZm9yRWFjaCgoZywgaSkgPT4geyBpZiAoaSA8IGxheWVycy5sZW5ndGggLSAxKSBnLnJlbW92ZSgpOyBlbHNlIGcuc3R5bGUub3BhY2l0eSA9IDE7IH0pO1xuICB9XG4gIC8vIFRyYW5zcGFyZW50IGJhY2tncm91bmQ6IG5vIHNoZWV0LCBubyBncmFpbiwgbm8gdmlnbmV0dGUuIE9mZiBieSBkZWZhdWx0LlxuICBpZiAodHJhbnNwYXJlbnQpIGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoJy5wYXBlciwgLnBhcGVyLW92ZXJsYXksIC5wYXBlci12aWduZXR0ZScpLmZvckVhY2goKGUpID0+IGUucmVtb3ZlKCkpO1xuXG4gIGZvciAoY29uc3QgaW1nIG9mIGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltYWdlJykpIHtcbiAgICBjb25zdCBocmVmID0gaW1nLmdldEF0dHJpYnV0ZSgnaHJlZicpIHx8IGltZy5nZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdocmVmJyk7XG4gICAgaWYgKGhyZWYpIGltZy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBhd2FpdCB0b0RhdGFVUkwobmV3IFVSTChocmVmLCBsb2NhdGlvbi5ocmVmKS5ocmVmKSk7XG4gIH1cblxuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdzdHlsZScpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IGF3YWl0IGNvbGxlY3RDU1MoKTtcbiAgY2xvbmUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBjbG9uZS5maXJzdENoaWxkKTtcblxuICByZXR1cm4gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCI/PlxcbicgKyBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKGNsb25lKTtcbn1cblxuZnVuY3Rpb24gbG9hZEltYWdlKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgaW1nLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCdUaGUgbWFwIGltYWdlIGNvdWxkIG5vdCBiZSByZW5kZXJlZCBmb3IgZXhwb3J0LicpKTtcbiAgICBpbWcuc3JjID0gdXJsO1xuICB9KTtcbn1cblxuLy8gUmVuZGVyIHRoZSBjdXJyZW50IHZpZXcgdG8gYSBQTkcgYmxvYiBhdCB0aGUgZ2l2ZW4gcGl4ZWwgc2l6ZSAodGhlIHNoZWV0IGlzIDE2Ojk7IG90aGVyIHNpemVzIGxldHRlcmJveCkuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVuZGVyUE5HKHN2Z05vZGUsIHsgd2lkdGggPSAxOTIwLCBoZWlnaHQgPSAxMDgwLCB0cmFuc3BhcmVudCA9IGZhbHNlIH0gPSB7fSkge1xuICBjb25zdCB4bWwgPSBhd2FpdCBzbmFwc2hvdFNWRyhzdmdOb2RlLCB7IHRyYW5zcGFyZW50IH0pO1xuICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFt4bWxdLCB7IHR5cGU6ICdpbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgnIH0pKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBpbWcgPSBhd2FpdCBsb2FkSW1hZ2UodXJsKTtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnN0IHMgPSBNYXRoLm1pbih3aWR0aCAvIFcsIGhlaWdodCAvIEgpO1xuICAgIGNvbnN0IGR3ID0gVyAqIHMsIGRoID0gSCAqIHM7XG4gICAgY3R4LmRyYXdJbWFnZShpbWcsICh3aWR0aCAtIGR3KSAvIDIsIChoZWlnaHQgLSBkaCkgLyAyLCBkdywgZGgpO1xuICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gY2FudmFzLnRvQmxvYihyZXNvbHZlLCAnaW1hZ2UvcG5nJykpO1xuICAgIGlmICghYmxvYikgdGhyb3cgbmV3IEVycm9yKCdUaGUgYnJvd3NlciBjb3VsZCBub3QgZW5jb2RlIHRoZSBQTkcuJyk7XG4gICAgcmV0dXJuIGJsb2I7XG4gIH0gZmluYWxseSB7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZW5kZXJTVkcoc3ZnTm9kZSwgeyB0cmFuc3BhcmVudCA9IGZhbHNlIH0gPSB7fSkge1xuICBjb25zdCB4bWwgPSBhd2FpdCBzbmFwc2hvdFNWRyhzdmdOb2RlLCB7IHRyYW5zcGFyZW50IH0pO1xuICByZXR1cm4gbmV3IEJsb2IoW3htbF0sIHsgdHlwZTogJ2ltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCcgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb3dubG9hZChibG9iLCBmaWxlbmFtZSkge1xuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICBhLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gIGEuY2xpY2soKTtcbiAgYS5yZW1vdmUoKTtcbiAgc2V0VGltZW91dCgoKSA9PiBVUkwucmV2b2tlT2JqZWN0VVJMKGEuaHJlZiksIDEwMDAwKTtcbn1cblxuLy8gRXhwb3J0IGZpbGVuYW1lczogcGFyY2htZW50LTxzdGFnZT4tPHllYXI+Wy08dG8+XVstNGtdLjxleHQ+LiBCcmFuZGVkIFBhcmNobWVudCBvbmx5LlxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydE5hbWUoeyBzdGFnZSwgeWVhciwgZnJvbSA9IG51bGwsIHNpemUgPSAnJywgZXh0IH0pIHtcbiAgY29uc3Qgc3BhbiA9IGZyb20gIT0gbnVsbCA/IGAke2Zyb219LSR7eWVhcn1gIDogYCR7eWVhcn1gO1xuICByZXR1cm4gYHBhcmNobWVudC0ke3N0YWdlfS0ke3NwYW59JHtzaXplID8gYC0ke3NpemV9YCA6ICcnfS4ke2V4dH1gO1xufVxuIiwgIntcbiAgXCJpZFwiOiBcImFmcm8tZXVyYXNpYVwiLFxuICBcInRpdGxlXCI6IFwiQWZyby1FdXJhc2lhXCIsXG4gIFwicHJvamVjdGlvblwiOiBcImVxdWFsRWFydGhcIixcbiAgXCJyb3RhdGVcIjogW1xuICAgIC02MCxcbiAgICAwXG4gIF0sXG4gIFwiZXh0ZW50XCI6IHtcbiAgICBcIndlc3RcIjogLTIwLFxuICAgIFwic291dGhcIjogNixcbiAgICBcImVhc3RcIjogMTUwLFxuICAgIFwibm9ydGhcIjogNzZcbiAgfSxcbiAgXCJzcGFuXCI6IFtcbiAgICAxMjAwLFxuICAgIDIwMDBcbiAgXSxcbiAgXCJyZWxpZWZcIjogXCJyZWxpZWYvYWZyby1ldXJhc2lhLnBuZ1wiLFxuICBcImxhYmVsc1wiOiBbXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiRXVyb3BlXCIsXG4gICAgICBcImxvblwiOiAxNCxcbiAgICAgIFwibGF0XCI6IDUyLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk5vcnRoIEFmcmljYVwiLFxuICAgICAgXCJsb25cIjogMTIsXG4gICAgICBcImxhdFwiOiAyNixcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJXZXN0IEFmcmljYVwiLFxuICAgICAgXCJsb25cIjogMTcsXG4gICAgICBcImxhdFwiOiAxMSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJNaWRkbGUgRWFzdFwiLFxuICAgICAgXCJsb25cIjogNDMsXG4gICAgICBcImxhdFwiOiAyNi41LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNlbnRyYWwgQXNpYVwiLFxuICAgICAgXCJsb25cIjogNjYsXG4gICAgICBcImxhdFwiOiA0NSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aCBBc2lhXCIsXG4gICAgICBcImxvblwiOiA3NyxcbiAgICAgIFwibGF0XCI6IDE3LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkVhc3QgQXNpYVwiLFxuICAgICAgXCJsb25cIjogMTIwLFxuICAgICAgXCJsYXRcIjogNDQsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGhlYXN0IEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDExMSxcbiAgICAgIFwibGF0XCI6IDksXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU2liZXJpYVwiLFxuICAgICAgXCJsb25cIjogOTIsXG4gICAgICBcImxhdFwiOiA2OSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJNZWRpdGVycmFuZWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTgsXG4gICAgICBcImxhdFwiOiAzNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkluZGlhbiBPY2VhblwiLFxuICAgICAgXCJsb25cIjogNzUsXG4gICAgICBcImxhdFwiOiAzLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJBcmFiaWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogNjQsXG4gICAgICBcImxhdFwiOiAxMixcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkJheSBvZiBCZW5nYWxcIixcbiAgICAgIFwibG9uXCI6IDg5LFxuICAgICAgXCJsYXRcIjogMTEuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoIENoaW5hIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTE1LFxuICAgICAgXCJsYXRcIjogMTYsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJCbGFjayBTZWFcIixcbiAgICAgIFwibG9uXCI6IDM0LFxuICAgICAgXCJsYXRcIjogNDMuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNhc3BpYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiA1MSxcbiAgICAgIFwibGF0XCI6IDQxLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJSZWQgU2VhXCIsXG4gICAgICBcImxvblwiOiAzOCxcbiAgICAgIFwibGF0XCI6IDIwLFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQXRsYW50aWMgT2NlYW5cIixcbiAgICAgIFwibG9uXCI6IC0xNixcbiAgICAgIFwibGF0XCI6IDM2LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH1cbiAgXSxcbiAgXCJkaWZmX21pbl9rbTJcIjogMTIwMDAwXG59XG4iLCAie1xuICBcImlkXCI6IFwiYWZyby1ldXJhc2lhLWxhbWJlcnRcIixcbiAgXCJ0aXRsZVwiOiBcIkFmcm8tRXVyYXNpYSAoYXppbXV0aGFsKVwiLFxuICBcInByb2plY3Rpb25cIjogXCJsYW1iZXJ0QXppbXV0aGFsRXF1YWxBcmVhXCIsXG4gIFwicm90YXRlXCI6IFtcbiAgICAtNjAsXG4gICAgLTQ1XG4gIF0sXG4gIFwiZXh0ZW50XCI6IHtcbiAgICBcIndlc3RcIjogLTIwLFxuICAgIFwic291dGhcIjogNixcbiAgICBcImVhc3RcIjogMTUwLFxuICAgIFwibm9ydGhcIjogNzZcbiAgfSxcbiAgXCJzcGFuXCI6IFtcbiAgICAxMjAwLFxuICAgIDIwMDBcbiAgXSxcbiAgXCJyZWxpZWZcIjogXCJyZWxpZWYvYWZyby1ldXJhc2lhLWxhbWJlcnQucG5nXCIsXG4gIFwibGFiZWxzXCI6IFtcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJFdXJvcGVcIixcbiAgICAgIFwibG9uXCI6IDE1LFxuICAgICAgXCJsYXRcIjogNTAsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiTm9ydGggQWZyaWNhXCIsXG4gICAgICBcImxvblwiOiAxMCxcbiAgICAgIFwibGF0XCI6IDI3LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIldlc3QgQWZyaWNhXCIsXG4gICAgICBcImxvblwiOiAtMixcbiAgICAgIFwibGF0XCI6IDEzLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk1pZGRsZSBFYXN0XCIsXG4gICAgICBcImxvblwiOiA0NCxcbiAgICAgIFwibGF0XCI6IDI5LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNlbnRyYWwgQXNpYVwiLFxuICAgICAgXCJsb25cIjogNjYsXG4gICAgICBcImxhdFwiOiA0NCxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aCBBc2lhXCIsXG4gICAgICBcImxvblwiOiA3OCxcbiAgICAgIFwibGF0XCI6IDIyLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkVhc3QgQXNpYVwiLFxuICAgICAgXCJsb25cIjogMTEyLFxuICAgICAgXCJsYXRcIjogMzYsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGhlYXN0IEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDEwNCxcbiAgICAgIFwibGF0XCI6IDEyLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNpYmVyaWFcIixcbiAgICAgIFwibG9uXCI6IDEwMCxcbiAgICAgIFwibGF0XCI6IDY0LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk1lZGl0ZXJyYW5lYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiAxNyxcbiAgICAgIFwibGF0XCI6IDM1LjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJJbmRpYW4gT2NlYW5cIixcbiAgICAgIFwibG9uXCI6IDc1LFxuICAgICAgXCJsYXRcIjogNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkFyYWJpYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiA2MyxcbiAgICAgIFwibGF0XCI6IDE1LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQmF5IG9mIEJlbmdhbFwiLFxuICAgICAgXCJsb25cIjogODgsXG4gICAgICBcImxhdFwiOiAxMyxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoIENoaW5hIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTE0LFxuICAgICAgXCJsYXRcIjogMTUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJCbGFjayBTZWFcIixcbiAgICAgIFwibG9uXCI6IDM0LFxuICAgICAgXCJsYXRcIjogNDMuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkNhc3BpYW4gU2VhXCIsXG4gICAgICBcImxvblwiOiA1MC41LFxuICAgICAgXCJsYXRcIjogNDEuNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlJlZCBTZWFcIixcbiAgICAgIFwibG9uXCI6IDM4LFxuICAgICAgXCJsYXRcIjogMjAsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJBdGxhbnRpYyBPY2VhblwiLFxuICAgICAgXCJsb25cIjogLTE0LFxuICAgICAgXCJsYXRcIjogMzgsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfVxuICBdLFxuICBcImRpZmZfbWluX2ttMlwiOiAxMjAwMDBcbn1cbiIsICJ7XG4gIFwiX2NvbW1lbnRcIjogXCJFeHRlbnQgdHJhY2tlciAodjApLiBXaGljaCBkb3dubG9hZGVkIGJhc2UgcG9seWdvbnMgYXJlIGhpZ2hsaWdodGVkLCBieSB0aGUgTkFNRSB0aGUgYmFzZSBtYXAgZ2l2ZXMgdGhlbSBpbiBlYWNoIGVyYSwgYm91bmRlZCBieSBzdGFydC9lbmQgeWVhcnMuIFRoZSBwb2x5Z29ucyB0aGVtc2VsdmVzIGFyZSBuZXZlciBlZGl0ZWQuIFJvd3MgaW4gZGF0YS9yZWNvcmRzLmNzdiB3aXRoIHRyYWNrZXI9ZXh0ZW50IGNhbiBhZGQgdG8gb3Igb3ZlcnJpZGUgdGhpcyBsaXN0LlwiLFxuICBcInRpdGxlXCI6IFwiRXh0ZW50IG9mIHN0YXRlc1wiLFxuICBcImZpbGxfa2V5XCI6IFwiUFwiLFxuICBcImxlZ2VuZFwiOiBbXG4gICAge1xuICAgICAgXCJzd2F0Y2hcIjogXCJmaWxsXCIsXG4gICAgICBcImtleVwiOiBcIlBcIixcbiAgICAgIFwibGFiZWxcIjogXCJIaWdobGlnaHRlZCBzdGF0ZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInN3YXRjaFwiOiBcImxpbmVcIixcbiAgICAgIFwic3R5bGVcIjogXCJzb2xpZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIkRvY3VtZW50ZWQgYm9yZGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3dhdGNoXCI6IFwibGluZVwiLFxuICAgICAgXCJzdHlsZVwiOiBcImRhc2hlZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIkFwcHJveGltYXRlIGJvcmRlclwiXG4gICAgfVxuICBdLFxuICBcImhpZ2hsaWdodHNcIjogW1xuICAgIHtcbiAgICAgIFwiaWRcIjogXCJvdHRvbWFuXCIsXG4gICAgICBcImxhYmVsXCI6IFwiT3R0b21hbiBFbXBpcmVcIixcbiAgICAgIFwic3RhcnRcIjogMTI5OSxcbiAgICAgIFwiZW5kXCI6IDE5MjIsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJPdHRvbWFuIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwic2FmYXZpZFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIlNhZmF2aWQgRW1waXJlXCIsXG4gICAgICBcInN0YXJ0XCI6IDE1MDEsXG4gICAgICBcImVuZFwiOiAxNzM2LFxuICAgICAgXCJuYW1lc1wiOiBbXG4gICAgICAgIFwiU2FmYXZpZCBFbXBpcmVcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiBcIm11Z2hhbFwiLFxuICAgICAgXCJsYWJlbFwiOiBcIk11Z2hhbCBFbXBpcmVcIixcbiAgICAgIFwic3RhcnRcIjogMTUyNixcbiAgICAgIFwiZW5kXCI6IDE4NTcsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNdWdoYWwgRW1waXJlXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJtaW5nXCIsXG4gICAgICBcImxhYmVsXCI6IFwiTWluZyBDaGluYVwiLFxuICAgICAgXCJzdGFydFwiOiAxMzY4LFxuICAgICAgXCJlbmRcIjogMTY0NCxcbiAgICAgIFwibmFtZXNcIjogW1xuICAgICAgICBcIk1pbmcgRW1waXJlXCIsXG4gICAgICAgIFwiTWluZyBDaGluZXNlIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwicWluZ1wiLFxuICAgICAgXCJsYWJlbFwiOiBcIlFpbmcgQ2hpbmFcIixcbiAgICAgIFwic3RhcnRcIjogMTY0NCxcbiAgICAgIFwiZW5kXCI6IDE5MTIsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNYW5jaHUgRW1waXJlXCIsXG4gICAgICAgIFwiUWluZyBFbXBpcmVcIixcbiAgICAgICAgXCJRaW5nIER5bmFzdHlcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJpZFwiOiBcInNvbmdoYWlcIixcbiAgICAgIFwibGFiZWxcIjogXCJTb25naGFpIEVtcGlyZVwiLFxuICAgICAgXCJzdGFydFwiOiAxNDY0LFxuICAgICAgXCJlbmRcIjogMTU5MSxcbiAgICAgIFwibmFtZXNcIjogW1xuICAgICAgICBcIlNvbmdoYWlcIixcbiAgICAgICAgXCJTb25naGFpIEVtcGlyZVwiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImlkXCI6IFwibW9yb2Njb1wiLFxuICAgICAgXCJsYWJlbFwiOiBcIk1vcm9jY29cIixcbiAgICAgIFwic3RhcnRcIjogMTQ1MCxcbiAgICAgIFwiZW5kXCI6IDIwMDAsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJNb3JvY2NvXCIsXG4gICAgICAgIFwiV2F0dGFzaWQgQ2FsaXBoYXRlXCIsXG4gICAgICAgIFwiV2F0YXNzaWQgTW9yb2Njb1wiLFxuICAgICAgICBcIlNhYWRpIE1vcm9jY29cIixcbiAgICAgICAgXCJTYWFkaSBTdWx0YW5hdGVcIixcbiAgICAgICAgXCJBbGFvdWl0ZSBNb3JvY2NvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJydXNzaWFcIixcbiAgICAgIFwibGFiZWxcIjogXCJSdXNzaWFcIixcbiAgICAgIFwic3RhcnRcIjogMTQ1MCxcbiAgICAgIFwiZW5kXCI6IDIwMDAsXG4gICAgICBcIm5hbWVzXCI6IFtcbiAgICAgICAgXCJHcmFuZCBEdWNoeSBvZiBNb3Njb3dcIixcbiAgICAgICAgXCJUc2FyZG9tIG9mIE11c2NvdnlcIixcbiAgICAgICAgXCJUc2FyZG9tIG9mIFJ1c3NpYVwiLFxuICAgICAgICBcIlJ1c3NpYW4gRW1waXJlXCIsXG4gICAgICAgIFwiUnVzc2lhXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiaWRcIjogXCJ0b2t1Z2F3YVwiLFxuICAgICAgXCJsYWJlbFwiOiBcIlRva3VnYXdhIEphcGFuXCIsXG4gICAgICBcInN0YXJ0XCI6IDE2MDMsXG4gICAgICBcImVuZFwiOiAxODY4LFxuICAgICAgXCJuYW1lc1wiOiBbXG4gICAgICAgIFwiVG9rdWdhd2Egc2hvZ3VuYXRlXCIsXG4gICAgICAgIFwiVG9rdWdhd2EgU2hvZ3VuYXRlXCJcbiAgICAgIF1cbiAgICB9XG4gIF1cbn1cbiIsICJ7XG4gIFwiX2NvbW1lbnRcIjogXCJFeHBhbnNpb24gdHJhY2tlciAodjApLiBQb2ludCByZWNvcmRzIGZyb20gZGF0YS9yZWNvcmRzLmNzdiByZW5kZXJlZCBieSBzaGFwZSAoZ3JhbW1hciBcdTAwQTc1KS4gRW1wdHkgdW50aWwgY29udGVudCByb3dzIGV4aXN0OyB0aGUgZXhhbXBsZS0qIHJvd3MgbmV2ZXIgcmVuZGVyLlwiLFxuICBcImlkXCI6IFwiZXhwYW5zaW9uXCIsXG4gIFwidGl0bGVcIjogXCJFeHBhbnNpb24gYW5kIGNvbmZsaWN0XCIsXG4gIFwibGVnZW5kXCI6IFtcbiAgICB7IFwic3dhdGNoXCI6IFwic2hhcGVcIiwgXCJzaGFwZVwiOiBcInJ1c3QtZGlhbW9uZFwiLCBcImxhYmVsXCI6IFwiQmF0dGxlIG9yIHNpZWdlXCIgfSxcbiAgICB7IFwic3dhdGNoXCI6IFwic2hhcGVcIiwgXCJzaGFwZVwiOiBcIm1vc3MtY2lyY2xlXCIsIFwibGFiZWxcIjogXCJGb3VuZGluZyBvciBjYXBpdGFsXCIgfSxcbiAgICB7IFwic3dhdGNoXCI6IFwic2hhcGVcIiwgXCJzaGFwZVwiOiBcIm5hdnktdHJpYW5nbGVcIiwgXCJsYWJlbFwiOiBcIlRyZWF0eVwiIH0sXG4gICAgeyBcInN3YXRjaFwiOiBcImxpbmVcIiwgXCJzdHlsZVwiOiBcInNvbGlkXCIsIFwibGFiZWxcIjogXCJEb2N1bWVudGVkIGJvcmRlclwiIH0sXG4gICAgeyBcInN3YXRjaFwiOiBcImxpbmVcIiwgXCJzdHlsZVwiOiBcImRhc2hlZFwiLCBcImxhYmVsXCI6IFwiQXBwcm94aW1hdGUgYm9yZGVyXCIgfVxuICBdXG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBlbnRyeSBwb2ludFxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IHsgbG9hZEpTT04sIGxvYWRUZXh0IH0gZnJvbSAnLi9kYXRhL2xvYWRlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTdGFnZSB9IGZyb20gJy4vcmVuZGVyL2Jhc2UuanMnO1xuaW1wb3J0IHsgcmVuZGVyUE5HLCByZW5kZXJTVkcsIGRvd25sb2FkLCBleHBvcnROYW1lIH0gZnJvbSAnLi9leHBvcnQvZXhwb3J0LmpzJztcbmltcG9ydCB7IHZhbGlkYXRlUmVjb3JkcywgcmVjb3Jkc0ZvciB9IGZyb20gJy4vZGF0YS9yZWNvcmRzLmpzJztcbmltcG9ydCBzdGFnZUVxdWFsRWFydGggZnJvbSAnLi9zdGFnZXMvYWZyby1ldXJhc2lhLmpzb24nO1xuaW1wb3J0IHN0YWdlTGFtYmVydCBmcm9tICcuL3N0YWdlcy9hZnJvLWV1cmFzaWEtbGFtYmVydC5qc29uJztcbmltcG9ydCBleHRlbnQgZnJvbSAnLi90cmFja2Vycy9leHRlbnQuanNvbic7XG5pbXBvcnQgZXhwYW5zaW9uIGZyb20gJy4vdHJhY2tlcnMvZXhwYW5zaW9uLmpzb24nO1xuXG4vLyB2MCB0cmFja2Vycy4gRXh0ZW50IGhpZ2hsaWdodHMgYmFzZSBwb2x5Z29uczsgZXhwYW5zaW9uIGRyYXdzIHBvaW50IHJlY29yZHMgYnkgc2hhcGUuXG5jb25zdCBUUkFDS0VSUyA9IHsgZXh0ZW50OiB7IC4uLmV4dGVudCwgaWQ6ICdleHRlbnQnIH0sIGV4cGFuc2lvbiB9O1xuXG5jb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCk7XG5jb25zdCBTVEFSVF9ZRUFSID0gTnVtYmVyKHBhcmFtcy5nZXQoJ3llYXInKSkgfHwgMTQ1MDtcbmNvbnN0IFNUQVJUX0ZST00gPSBOdW1iZXIocGFyYW1zLmdldCgnZnJvbScpKSB8fCBudWxsOyAvLyA/ZnJvbT0xNDUwJnllYXI9MTc1MCBvcGVucyB0aGUgRGlmZiB2aWV3XG5jb25zdCBQTEFZX0hPTERfTVMgPSAxNTAwO1xuXG4vLyA/c3RhZ2U9YWZyby1ldXJhc2lhLWxhbWJlcnQgc2hvd3MgdGhlIGFsdGVybmF0aXZlIHByb2plY3Rpb24gZm9yIGNvbXBhcmlzb24uXG5jb25zdCBTVEFHRVMgPSB7IFtzdGFnZUVxdWFsRWFydGguaWRdOiBzdGFnZUVxdWFsRWFydGgsIFtzdGFnZUxhbWJlcnQuaWRdOiBzdGFnZUxhbWJlcnQgfTtcbmNvbnN0IHN0YWdlID0gU1RBR0VTW3BhcmFtcy5nZXQoJ3N0YWdlJyldID8/IHN0YWdlRXF1YWxFYXJ0aDtcblxuLy8gRXh0ZW50IHRyYWNrZXI6IGEgYmFzZSBwb2x5Z29uIGlzIGhpZ2hsaWdodGVkIHdoZW4gaXRzIE5BTUUgbWF0Y2hlcyBhIGhpZ2hsaWdodCBlbnRyeSBhbGl2ZSBpbiB0aGF0IHllYXIuXG5jb25zdCBieU5hbWUgPSBuZXcgTWFwKCk7XG5mb3IgKGNvbnN0IGggb2YgZXh0ZW50LmhpZ2hsaWdodHMpIGZvciAoY29uc3QgbiBvZiBoLm5hbWVzKSBieU5hbWUuc2V0KG4sIGgpO1xuZnVuY3Rpb24gbWF0Y2hIaWdobGlnaHQoZiwgeWVhcikge1xuICBjb25zdCBoID0gYnlOYW1lLmdldChmLnByb3BlcnRpZXMubmFtZSk7XG4gIHJldHVybiBoICYmIHllYXIgPj0gaC5zdGFydCAmJiB5ZWFyIDw9IGguZW5kID8gaCA6IG51bGw7XG59XG5mdW5jdGlvbiBjbGFzc2lmeUV4dGVudChmLCB5ZWFyKSB7XG4gIGNvbnN0IGggPSBtYXRjaEhpZ2hsaWdodChmLCB5ZWFyKTtcbiAgcmV0dXJuIGggPyB7IHN0YXR1czogJ2hpZ2hsaWdodCcsIGtleTogaC5pZCwgbGFiZWw6IGgubGFiZWwgfSA6IHsgc3RhdHVzOiAnbXV0ZWQnIH07XG59XG4vLyBEaWZmIGlkZW50aXR5OiBhIHRyYWNrZWQgc3RhdGUga2VlcHMgaXRzIGlkZW50aXR5IGFjcm9zcyByZW5hbWVzIChNdXNjb3Z5IFx1MjE5MiBSdXNzaWEpLiBXaXRoIHNjb3BlICd0cmFja2VkJ1xuLy8gKHRoZSBkZWZhdWx0KSBvbmx5IHRyYWNrZWQgc3RhdGVzIHRha2UgcGFydDsgd2l0aCBzY29wZSAnYWxsJyBldmVyeSBuYW1lZCBwb2x5Z29uIGRvZXMsIGJ5IGl0cyBuYW1lLlxuZnVuY3Rpb24gaWRlbnRpZnlGb3Ioc2NvcGUpIHtcbiAgcmV0dXJuIChmLCB5ZWFyKSA9PiB7XG4gICAgY29uc3QgaCA9IG1hdGNoSGlnaGxpZ2h0KGYsIHllYXIpO1xuICAgIGlmIChoKSByZXR1cm4geyBrZXk6IGBoOiR7aC5pZH1gLCBsYWJlbDogaC5sYWJlbCB9O1xuICAgIHJldHVybiBzY29wZSA9PT0gJ2FsbCcgPyB7IGtleTogYG46JHtmLnByb3BlcnRpZXMubmFtZX1gLCBsYWJlbDogZi5wcm9wZXJ0aWVzLm5hbWUgfSA6IG51bGw7XG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIGNvbnN0IHQwID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IFtjYWxlbmRhciwgbmUsIGJhdGh5LCB2b2NhYiwgcmVjb3Jkc1RleHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIGxvYWRKU09OKCdkYXRhL2NhbGVuZGFyLmpzb24nKSxcbiAgICBsb2FkSlNPTignZGF0YS9iYXNlL2Rlcml2ZWQvbmUudG9wb2pzb24nKSxcbiAgICBsb2FkSlNPTignZGF0YS9iYXNlL2Rlcml2ZWQvYmF0aHltZXRyeS50b3BvanNvbicpLFxuICAgIGxvYWRKU09OKCdkYXRhL3ZvY2FiLmpzb24nKSxcbiAgICBsb2FkVGV4dCgnZGF0YS9yZWNvcmRzLmNzdicpLmNhdGNoKChlcnIpID0+IHsgY29uc29sZS5lcnJvcihlcnIpOyByZXR1cm4gbnVsbDsgfSksXG4gIF0pO1xuXG4gIC8vIFJlY29yZHM6IHZhbGlkYXRlZCBhZ2FpbnN0IHZvY2FiLmpzb247IGJhZCByb3dzIGFyZSBza2lwcGVkIGFuZCBsaXN0ZWQsIG5ldmVyIGZhdGFsLlxuICBjb25zdCBjaGVja2VkID0gcmVjb3Jkc1RleHQgPT0gbnVsbFxuICAgID8geyByZWNvcmRzOiBbXSwgcHJvYmxlbXM6IFt7IGxpbmU6IDAsIGlkOiAnJywgbWVzc2FnZTogJ2RhdGEvcmVjb3Jkcy5jc3YgY291bGQgbm90IGJlIGxvYWRlZCcgfV0sIGV4YW1wbGVzOiAwLCB0b3RhbDogMCB9XG4gICAgOiB2YWxpZGF0ZVJlY29yZHMocmVjb3Jkc1RleHQsIHZvY2FiKTtcbiAgY29uc3QgcmVjb3JkcyA9IGNoZWNrZWQucmVjb3JkcztcbiAgY29uc3Qgbm9Db29yZHMgPSByZWNvcmRzLmZpbHRlcigocikgPT4gci5raW5kID09PSAncG9pbnQnICYmIChyLmxvbiA9PSBudWxsIHx8IHIubGF0ID09IG51bGwpKTtcbiAgY29uc29sZS5sb2coYHJlY29yZHMuY3N2OiAke2NoZWNrZWQudG90YWx9IHJvd3MgXHUwMEI3ICR7cmVjb3Jkcy5sZW5ndGh9IHJlbmRlciBcdTAwQjcgJHtjaGVja2VkLmV4YW1wbGVzfSBleGFtcGxlcyBcdTAwQjcgJHtjaGVja2VkLnByb2JsZW1zLmxlbmd0aH0gc2tpcHBlZGApO1xuICBzaG93RGF0YVByb2JsZW1zKGNoZWNrZWQsIG5vQ29vcmRzKTtcbiAgY29uc3QgeWVhcnMgPSBjYWxlbmRhci5zbmFwc2hvdHMubWFwKChzKSA9PiBzLnllYXIpO1xuICBjb25zdCBieVNuYXBzaG90ID0gbmV3IE1hcChjYWxlbmRhci5zbmFwc2hvdHMubWFwKChzKSA9PiBbcy55ZWFyLCBzXSkpO1xuICBjb25zdCBzbmFwc2hvdCA9ICh5ZWFyKSA9PiBsb2FkSlNPTihgZGF0YS9iYXNlL2Rlcml2ZWQvd29ybGRfJHt5ZWFyfS50b3BvanNvbmApO1xuXG4gIGNvbnN0IHN0YXRlID0geyBtb2RlOiAnc25hcHNob3QnLCBzY29wZTogcGFyYW1zLmdldCgnc2NvcGUnKSA9PT0gJ2FsbCcgPyAnYWxsJyA6ICd0cmFja2VkJywgdHJhY2tlcjogVFJBQ0tFUlNbcGFyYW1zLmdldCgndHJhY2tlcicpXSA/IHBhcmFtcy5nZXQoJ3RyYWNrZXInKSA6ICdleHRlbnQnLCB5ZWFyOiBTVEFSVF9ZRUFSLCBmcm9tOiBTVEFSVF9GUk9NID8/IHllYXJzW01hdGgubWF4KDAsIHllYXJzLmluZGV4T2YoU1RBUlRfWUVBUikgLSAxKV0sIHBsYXlpbmc6IG51bGwgfTtcblxuICBjb25zdCBzdmcgPSBkMy5zZWxlY3QoJyNtYXAnKTtcbiAgY29uc3QgYXRsYXMgPSBjcmVhdGVTdGFnZShzdmcsIHN0YWdlLCB7IG5lLCBiYXRoeSB9LCB7IHRyYWNrZXI6IFRSQUNLRVJTW3N0YXRlLnRyYWNrZXJdLCB5ZWFycywgb25ZZWFyOiAoeSkgPT4gc2V0WWVhcih5KSB9KTtcbiAgY29uc29sZS5sb2coYHN0YWdlIGJ1aWx0IGluICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdDApLnRvRml4ZWQoMCl9IG1zYCk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGNvbnN0IHQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBpZiAoc3RhdGUubW9kZSA9PT0gJ2RpZmYnKSB7XG4gICAgICBjb25zdCBbYSwgYl0gPSBhd2FpdCBQcm9taXNlLmFsbChbc25hcHNob3Qoc3RhdGUuZnJvbSksIHNuYXBzaG90KHN0YXRlLnllYXIpXSk7XG4gICAgICBjb25zdCBkaWZmID0gYXRsYXMuc2hvd0RpZmYoeyB5ZWFyOiBzdGF0ZS5mcm9tLCB0b3BvOiBhIH0sIHsgeWVhcjogc3RhdGUueWVhciwgdG9wbzogYiB9LCBpZGVudGlmeUZvcihzdGF0ZS5zY29wZSkpO1xuICAgICAgYXRsYXMuc2V0UmFuZ2UoeyB5ZWFyOiBzdGF0ZS5mcm9tLCBzb3VyY2VZZWFyOiBieVNuYXBzaG90LmdldChzdGF0ZS5mcm9tKS5zb3VyY2VfeWVhciB9LCB7IHllYXI6IHN0YXRlLnllYXIsIHNvdXJjZVllYXI6IGJ5U25hcHNob3QuZ2V0KHN0YXRlLnllYXIpLnNvdXJjZV95ZWFyIH0pO1xuICAgICAgZG9jdW1lbnQudGl0bGUgPSBgUGFyY2htZW50IFx1MDBCNyAke3N0YXRlLmZyb219IFx1MjE5MiAke3N0YXRlLnllYXJ9YDtcbiAgICAgIGNvbnNvbGUubG9nKGBkaWZmICR7c3RhdGUuZnJvbX0gXHUyMTkyICR7c3RhdGUueWVhcn06ICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdCkudG9GaXhlZCgxKX0gbXM7IGFwcGVhcmVkICR7ZGlmZi5hcHBlYXJlZC5sZW5ndGh9LCB2YW5pc2hlZCAke2RpZmYudmFuaXNoZWQubGVuZ3RofSwgcGVyc2lzdGVkICR7ZGlmZi5wZXJzaXN0ZWQubGVuZ3RofWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0b3BvID0gYXdhaXQgc25hcHNob3Qoc3RhdGUueWVhcik7XG4gICAgICBhdGxhcy5zZXRUcmFja2VyKFRSQUNLRVJTW3N0YXRlLnRyYWNrZXJdKTtcbiAgICAgIC8vIEV4dGVudCBoaWdobGlnaHRzIHRoZSB0cmFja2VkIHN0YXRlczsgZXhwYW5zaW9uIHNob3dzIGV2ZXJ5IHBvbGl0eSBtdXRlZCBhbmQgdGhlIHBvaW50IHJlY29yZHMgb24gdG9wLlxuICAgICAgYXRsYXMuc2hvd1NuYXBzaG90KHN0YXRlLnllYXIsIHRvcG8sIHN0YXRlLnRyYWNrZXIgPT09ICdleHRlbnQnID8gY2xhc3NpZnlFeHRlbnQgOiAoKSA9PiAoeyBzdGF0dXM6ICdtdXRlZCcgfSkpO1xuICAgICAgY29uc3QgbiA9IGF0bGFzLnNob3dNYXJrcyhzdGF0ZS50cmFja2VyID09PSAnZXhwYW5zaW9uJyA/IHJlY29yZHNGb3IocmVjb3JkcywgJ2V4cGFuc2lvbicsIHN0YXRlLnllYXIsIHllYXJzKSA6IFtdKTtcbiAgICAgIGF0bGFzLnNldFllYXIoc3RhdGUueWVhciwgYnlTbmFwc2hvdC5nZXQoc3RhdGUueWVhcikuc291cmNlX3llYXIpO1xuICAgICAgZG9jdW1lbnQudGl0bGUgPSBgUGFyY2htZW50IFx1MDBCNyAke3N0YXRlLnllYXJ9YDtcbiAgICAgIGNvbnNvbGUubG9nKGBzbmFwc2hvdCAke3N0YXRlLnllYXJ9ICgke3N0YXRlLnRyYWNrZXJ9KTogJHsocGVyZm9ybWFuY2Uubm93KCkgLSB0KS50b0ZpeGVkKDEpfSBtcyR7biA/IGAsICR7bn0gbWFya3NgIDogJyd9YCk7XG4gICAgfVxuICAgIGlmIChzdGF0ZS5tb2RlID09PSAnZGlmZicpIGF0bGFzLnNob3dNYXJrcyhbXSk7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdtb2RlLWRpZmYnLCBzdGF0ZS5tb2RlID09PSAnZGlmZicpO1xuICAgIGQzLnNlbGVjdEFsbCgnI3Rvb2xiYXIgW2RhdGEtbW9kZV0nKS5jbGFzc2VkKCdhY3RpdmUnLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmRhdGFzZXQubW9kZSA9PT0gc3RhdGUubW9kZTsgfSk7XG4gICAgZDMuc2VsZWN0QWxsKCcjeWVhcnMgYnV0dG9uJykuY2xhc3NlZCgnYWN0aXZlJywgZnVuY3Rpb24gKCkgeyByZXR1cm4gTnVtYmVyKHRoaXMuZGF0YXNldC55ZWFyKSA9PT0gc3RhdGUueWVhcjsgfSk7XG4gICAgZDMuc2VsZWN0QWxsKCcjeWVhcnMtYSBidXR0b24nKS5jbGFzc2VkKCdhY3RpdmUnLCBmdW5jdGlvbiAoKSB7IHJldHVybiBOdW1iZXIodGhpcy5kYXRhc2V0LnllYXIpID09PSBzdGF0ZS5mcm9tOyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFllYXIoeSkgeyBpZiAoeWVhcnMuaW5jbHVkZXMoeSkpIHsgc3RhdGUueWVhciA9IHk7IHJlbmRlcigpOyB9IH1cbiAgZnVuY3Rpb24gc2V0RnJvbSh5KSB7IGlmICh5ZWFycy5pbmNsdWRlcyh5KSkgeyBzdGF0ZS5mcm9tID0geTsgcmVuZGVyKCk7IH0gfVxuICBmdW5jdGlvbiBzZXRNb2RlKG0pIHsgc3RhdGUubW9kZSA9IG07IGlmIChtID09PSAnZGlmZicgJiYgc3RhdGUuZnJvbSA9PT0gc3RhdGUueWVhcikgc3RhdGUuZnJvbSA9IHllYXJzW01hdGgubWF4KDAsIHllYXJzLmluZGV4T2Yoc3RhdGUueWVhcikgLSAxKV07IHJlbmRlcigpOyB9XG4gIGZ1bmN0aW9uIHN0ZXAoZGVsdGEpIHtcbiAgICBjb25zdCBpID0geWVhcnMuaW5kZXhPZihzdGF0ZS55ZWFyKTtcbiAgICBjb25zdCBqID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeWVhcnMubGVuZ3RoIC0gMSwgaSArIGRlbHRhKSk7XG4gICAgaWYgKGogIT09IGkpIHNldFllYXIoeWVhcnNbal0pO1xuICAgIHJldHVybiBqICE9PSBpO1xuICB9XG4gIGZ1bmN0aW9uIHRvZ2dsZVBsYXkoKSB7XG4gICAgaWYgKHN0YXRlLnBsYXlpbmcpIHsgY2xlYXJJbnRlcnZhbChzdGF0ZS5wbGF5aW5nKTsgc3RhdGUucGxheWluZyA9IG51bGw7IH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICh5ZWFycy5pbmRleE9mKHN0YXRlLnllYXIpID09PSB5ZWFycy5sZW5ndGggLSAxKSBzZXRZZWFyKHllYXJzWzBdKTtcbiAgICAgIHN0YXRlLnBsYXlpbmcgPSBzZXRJbnRlcnZhbCgoKSA9PiB7IGlmICghc3RlcCgxKSkgdG9nZ2xlUGxheSgpOyB9LCBQTEFZX0hPTERfTVMpO1xuICAgIH1cbiAgICBkMy5zZWxlY3QoJyNwbGF5JykuY2xhc3NlZCgnYWN0aXZlJywgISFzdGF0ZS5wbGF5aW5nKS50ZXh0KHN0YXRlLnBsYXlpbmcgPyAnXHUyNzVBXHUyNzVBJyA6ICdcdTI1QjYnKTtcbiAgfVxuXG4gIC8vIFRvb2xiYXIuXG4gIGNvbnN0IHRiID0gZDMuc2VsZWN0KCcjdG9vbGJhcicpLmh0bWwoJycpO1xuICBjb25zdCB0cmFja2VyU2VsID0gdGIuYXBwZW5kKCdzZWxlY3QnKS5hdHRyKCdpZCcsICd0cmFja2VyJykuYXR0cigndGl0bGUnLCAnVHJhY2tlcicpXG4gICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7IHN0YXRlLnRyYWNrZXIgPSB0aGlzLnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gIHRyYWNrZXJTZWwuc2VsZWN0QWxsKCdvcHRpb24nKS5kYXRhKE9iamVjdC52YWx1ZXMoVFJBQ0tFUlMpKS5qb2luKCdvcHRpb24nKS5hdHRyKCd2YWx1ZScsICh0KSA9PiB0LmlkKS50ZXh0KCh0KSA9PiB0LnRpdGxlKS5wcm9wZXJ0eSgnc2VsZWN0ZWQnLCAodCkgPT4gdC5pZCA9PT0gc3RhdGUudHJhY2tlcik7XG4gIHRiLmFwcGVuZCgnc3BhbicpLmF0dHIoJ2NsYXNzJywgJ3NlcCcpO1xuICBjb25zdCBzZWcgPSB0Yi5hcHBlbmQoJ3NwYW4nKS5hdHRyKCdjbGFzcycsICdzZWcnKTtcbiAgc2VnLmFwcGVuZCgnYnV0dG9uJykuYXR0cignZGF0YS1tb2RlJywgJ3NuYXBzaG90JykudGV4dCgnU25hcHNob3QnKS5vbignY2xpY2snLCAoKSA9PiBzZXRNb2RlKCdzbmFwc2hvdCcpKTtcbiAgc2VnLmFwcGVuZCgnYnV0dG9uJykuYXR0cignZGF0YS1tb2RlJywgJ2RpZmYnKS50ZXh0KCdEaWZmJykub24oJ2NsaWNrJywgKCkgPT4gc2V0TW9kZSgnZGlmZicpKTtcbiAgY29uc3QgeWEgPSB0Yi5hcHBlbmQoJ3NwYW4nKS5hdHRyKCdpZCcsICd5ZWFycy1hJykuYXR0cignY2xhc3MnLCAneWVhcnMnKTtcbiAgeWEuYXBwZW5kKCdsYWJlbCcpLnRleHQoJ2Zyb20nKTtcbiAgeWEuc2VsZWN0QWxsKCdidXR0b24nKS5kYXRhKHllYXJzKS5qb2luKCdidXR0b24nKS5hdHRyKCdkYXRhLXllYXInLCAoeSkgPT4geSkudGV4dCgoeSkgPT4geSkub24oJ2NsaWNrJywgKF8sIHkpID0+IHNldEZyb20oeSkpO1xuICBjb25zdCB5YiA9IHRiLmFwcGVuZCgnc3BhbicpLmF0dHIoJ2lkJywgJ3llYXJzJykuYXR0cignY2xhc3MnLCAneWVhcnMnKTtcbiAgeWIuYXBwZW5kKCdsYWJlbCcpLnRleHQoJ3RvJyk7XG4gIHliLnNlbGVjdEFsbCgnYnV0dG9uJykuZGF0YSh5ZWFycykuam9pbignYnV0dG9uJykuYXR0cignZGF0YS15ZWFyJywgKHkpID0+IHkpLnRleHQoKHkpID0+IHkpLm9uKCdjbGljaycsIChfLCB5KSA9PiBzZXRZZWFyKHkpKTtcbiAgY29uc3Qgc2NvcGVMYWJlbCA9IHRiLmFwcGVuZCgnbGFiZWwnKS5hdHRyKCdpZCcsICdzY29wZScpLmF0dHIoJ3RpdGxlJywgJ0NvbXBhcmUgZXZlcnkgbmFtZWQgcG9seWdvbiwgbm90IGp1c3QgdGhlIHRyYWNrZWQgc3RhdGVzJyk7XG4gIHNjb3BlTGFiZWwuYXBwZW5kKCdpbnB1dCcpLmF0dHIoJ3R5cGUnLCAnY2hlY2tib3gnKS5wcm9wZXJ0eSgnY2hlY2tlZCcsIHN0YXRlLnNjb3BlID09PSAnYWxsJylcbiAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHsgc3RhdGUuc2NvcGUgPSB0aGlzLmNoZWNrZWQgPyAnYWxsJyA6ICd0cmFja2VkJzsgcmVuZGVyKCk7IH0pO1xuICBzY29wZUxhYmVsLmFwcGVuZCgnc3BhbicpLnRleHQoJ2FsbCBzdGF0ZXMnKTtcbiAgdGIuYXBwZW5kKCdzcGFuJykuYXR0cignY2xhc3MnLCAnc2VwJyk7XG4gIHRiLmFwcGVuZCgnYnV0dG9uJykuYXR0cignaWQnLCAncGxheScpLmF0dHIoJ3RpdGxlJywgJ1BsYXkgKHNwYWNlKScpLnRleHQoJ1x1MjVCNicpLm9uKCdjbGljaycsIHRvZ2dsZVBsYXkpO1xuXG4gIC8vIEV4cG9ydDogUE5HIGF0IDE5MjBcdTAwRDcxMDgwIG9yIDM4NDBcdTAwRDcyMTYwLCBvciBTVkcsIG9mIGV4YWN0bHkgd2hhdCBpcyBvbiB0aGUgc2hlZXQuIFRyYW5zcGFyZW50IGJhY2tncm91bmQgaXMgb2ZmIGJ5IGRlZmF1bHQuXG4gIHRiLmFwcGVuZCgnc3BhbicpLmF0dHIoJ2NsYXNzJywgJ3NlcCcpO1xuICBjb25zdCBleHBvcnRNZW51ID0gdGIuYXBwZW5kKCdzcGFuJykuYXR0cignY2xhc3MnLCAnbWVudScpO1xuICBjb25zdCBleHBvcnRCdG4gPSBleHBvcnRNZW51LmFwcGVuZCgnYnV0dG9uJykuYXR0cignaWQnLCAnZXhwb3J0JykuYXR0cigndGl0bGUnLCAnRXhwb3J0IHRoZSBjdXJyZW50IHZpZXcgKEUpJykudGV4dCgnRXhwb3J0IFx1MjVCRScpXG4gICAgLm9uKCdjbGljaycsICgpID0+IGV4cG9ydE1lbnUuY2xhc3NlZCgnb3BlbicsICFleHBvcnRNZW51LmNsYXNzZWQoJ29wZW4nKSkpO1xuICBjb25zdCBwb3AgPSBleHBvcnRNZW51LmFwcGVuZCgnc3BhbicpLmF0dHIoJ2NsYXNzJywgJ3BvcG92ZXInKTtcbiAgY29uc3QgZXhwb3J0T3B0cyA9IHsgdHJhbnNwYXJlbnQ6IGZhbHNlIH07XG4gIGNvbnN0IGRlc2NyaWJlID0gKCkgPT4gKHsgc3RhZ2U6IHN0YWdlLmlkLCB5ZWFyOiBzdGF0ZS55ZWFyLCBmcm9tOiBzdGF0ZS5tb2RlID09PSAnZGlmZicgPyBzdGF0ZS5mcm9tIDogbnVsbCB9KTtcbiAgbGV0IGV4cG9ydGluZyA9IGZhbHNlO1xuICBhc3luYyBmdW5jdGlvbiBkb0V4cG9ydChraW5kKSB7XG4gICAgaWYgKGV4cG9ydGluZykgcmV0dXJuO1xuICAgIGV4cG9ydGluZyA9IHRydWU7XG4gICAgZXhwb3J0TWVudS5jbGFzc2VkKCdvcGVuJywgZmFsc2UpO1xuICAgIGV4cG9ydEJ0bi50ZXh0KCdFeHBvcnRpbmdcdTIwMjYnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzdmdOb2RlID0gc3ZnLm5vZGUoKTtcbiAgICAgIGNvbnN0IGluZm8gPSBkZXNjcmliZSgpO1xuICAgICAgaWYgKGtpbmQgPT09ICdzdmcnKSBkb3dubG9hZChhd2FpdCByZW5kZXJTVkcoc3ZnTm9kZSwgZXhwb3J0T3B0cyksIGV4cG9ydE5hbWUoeyAuLi5pbmZvLCBleHQ6ICdzdmcnIH0pKTtcbiAgICAgIGVsc2UgaWYgKGtpbmQgPT09ICc0aycpIGRvd25sb2FkKGF3YWl0IHJlbmRlclBORyhzdmdOb2RlLCB7IHdpZHRoOiAzODQwLCBoZWlnaHQ6IDIxNjAsIC4uLmV4cG9ydE9wdHMgfSksIGV4cG9ydE5hbWUoeyAuLi5pbmZvLCBzaXplOiAnNGsnLCBleHQ6ICdwbmcnIH0pKTtcbiAgICAgIGVsc2UgZG93bmxvYWQoYXdhaXQgcmVuZGVyUE5HKHN2Z05vZGUsIHsgd2lkdGg6IDE5MjAsIGhlaWdodDogMTA4MCwgLi4uZXhwb3J0T3B0cyB9KSwgZXhwb3J0TmFtZSh7IC4uLmluZm8sIGV4dDogJ3BuZycgfSkpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgZDMuc2VsZWN0KCcjcHJvYmxlbXMnKS5jbGFzc2VkKCdoaWRkZW4nLCBmYWxzZSkudGV4dChgRXhwb3J0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZXhwb3J0aW5nID0gZmFsc2U7XG4gICAgICBleHBvcnRCdG4udGV4dCgnRXhwb3J0IFx1MjVCRScpLmF0dHIoJ2Rpc2FibGVkJywgbnVsbCk7XG4gICAgfVxuICB9XG4gIHBvcC5hcHBlbmQoJ2J1dHRvbicpLnRleHQoJ1BORyBcdTAwQjcgMTkyMCBcdTAwRDcgMTA4MCcpLm9uKCdjbGljaycsICgpID0+IGRvRXhwb3J0KCdwbmcnKSk7XG4gIHBvcC5hcHBlbmQoJ2J1dHRvbicpLnRleHQoJ1BORyBcdTAwQjcgMzg0MCBcdTAwRDcgMjE2MCcpLm9uKCdjbGljaycsICgpID0+IGRvRXhwb3J0KCc0aycpKTtcbiAgcG9wLmFwcGVuZCgnYnV0dG9uJykudGV4dCgnU1ZHJykub24oJ2NsaWNrJywgKCkgPT4gZG9FeHBvcnQoJ3N2ZycpKTtcbiAgY29uc3QgdHIgPSBwb3AuYXBwZW5kKCdsYWJlbCcpO1xuICB0ci5hcHBlbmQoJ2lucHV0JykuYXR0cigndHlwZScsICdjaGVja2JveCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7IGV4cG9ydE9wdHMudHJhbnNwYXJlbnQgPSB0aGlzLmNoZWNrZWQ7IH0pO1xuICB0ci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCd0cmFuc3BhcmVudCBiYWNrZ3JvdW5kJyk7XG4gIC8vIENyZWRpdHM6IHdobyBtYWRlIHRoZSBhdGxhcyBhbmQgd2hlcmUgdGhlIGRhdGEgY29tZXMgZnJvbSwgd2l0aCB0aGUgbGljZW5jZSBmaWxlLiBTaXRlIGNocm9tZSBvbmx5LlxuICBjb25zdCBhYm91dCA9IHRiLmFwcGVuZCgnc3BhbicpLmF0dHIoJ2NsYXNzJywgJ21lbnUnKTtcbiAgYWJvdXQuYXBwZW5kKCdidXR0b24nKS5hdHRyKCdpZCcsICdhYm91dCcpLmF0dHIoJ3RpdGxlJywgJ0Fib3V0IFBhcmNobWVudCcpLnRleHQoJ1x1MjREOCcpXG4gICAgLm9uKCdjbGljaycsICgpID0+IGFib3V0LmNsYXNzZWQoJ29wZW4nLCAhYWJvdXQuY2xhc3NlZCgnb3BlbicpKSk7XG4gIGNvbnN0IGFwID0gYWJvdXQuYXBwZW5kKCdzcGFuJykuYXR0cignY2xhc3MnLCAncG9wb3ZlciBhYm91dCcpO1xuICBhcC5hcHBlbmQoJ3AnKS5odG1sKCc8Yj5QYXJjaG1lbnQ8L2I+IFx1MjAxNCBhIGhpc3RvcmljYWwgdGltZWxpbmUgYXRsYXMgZm9yIHRoZSBjbGFzc3Jvb20uPGJyPkF0bGFzLCBkZXNpZ24gYW5kIGlkZWFzOiBXaWwgQ29zZ3JvdmUuJyk7XG4gIGFwLmFwcGVuZCgncCcpLmh0bWwoJ0JvcmRlcnM6IDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vYW91cmVkbmlrL2hpc3RvcmljYWwtYmFzZW1hcHNcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiPmhpc3RvcmljYWwtYmFzZW1hcHM8L2E+IChHUEwtMykuIENvYXN0LCByaXZlcnMsIHJlbGllZjogPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm5hdHVyYWxlYXJ0aGRhdGEuY29tXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXJcIj5OYXR1cmFsIEVhcnRoPC9hPiAocHVibGljIGRvbWFpbikuIFBsYWNlIGNvb3JkaW5hdGVzOiBXaWtpZGF0YSAoQ0MwKS4gVHlwZTogTGlicmUgQmFza2VydmlsbGUgKE9GTCkuJyk7XG4gIGFwLmFwcGVuZCgncCcpLmh0bWwoJzxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vd2Nvc2dyb3ZlMTIzL3BhcmNobWVudC9ibG9iL21haW4vZG9jcy9EQVRBLUxJQ0VOU0VTLm1kXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXJcIj5EYXRhIGxpY2VuY2VzIGFuZCBhdHRyaWJ1dGlvbjwvYT4gXHUwMEI3IDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vd2Nvc2dyb3ZlMTIzL3BhcmNobWVudFwiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+U291cmNlPC9hPiAoTUlUKScpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgaWYgKCFleHBvcnRNZW51Lm5vZGUoKS5jb250YWlucyhlLnRhcmdldCkpIGV4cG9ydE1lbnUuY2xhc3NlZCgnb3BlbicsIGZhbHNlKTtcbiAgICBpZiAoIWFib3V0Lm5vZGUoKS5jb250YWlucyhlLnRhcmdldCkpIGFib3V0LmNsYXNzZWQoJ29wZW4nLCBmYWxzZSk7XG4gIH0pO1xuXG4gIC8vIEZvciBzY3JpcHRzIGFuZCBjaGVja3M6IHdpbmRvdy5wYXJjaG1lbnQucmVuZGVye1BORyxTVkd9KCkgcmV0dXJuIGJsb2JzIG9mIHRoZSBjdXJyZW50IHZpZXcuXG4gIHdpbmRvdy5wYXJjaG1lbnQgPSB7XG4gICAgcmVuZGVyUE5HOiAob3B0cykgPT4gcmVuZGVyUE5HKHN2Zy5ub2RlKCksIG9wdHMpLFxuICAgIHJlbmRlclNWRzogKG9wdHMpID0+IHJlbmRlclNWRyhzdmcubm9kZSgpLCBvcHRzKSxcbiAgICBleHBvcnROYW1lOiAob3B0cykgPT4gZXhwb3J0TmFtZSh7IC4uLmRlc2NyaWJlKCksIC4uLm9wdHMgfSksXG4gICAgZ2V0IHN0YXRlKCkgeyByZXR1cm4geyAuLi5zdGF0ZSB9OyB9LFxuICB9O1xuXG4gIC8vIEtleWJvYXJkOiBcdTIxOTAgXHUyMTkyIHN0ZXAgdGhyb3VnaCB0aGUgY2FsZW5kYXI7IHNwYWNlIHBsYXlzOyBEIHRvZ2dsZXMgdGhlIERpZmYgdmlldy5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgIGlmIChlLnRhcmdldCAmJiAvSU5QVVR8VEVYVEFSRUF8U0VMRUNULy50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpKSByZXR1cm47XG4gICAgaWYgKGUua2V5ID09PSAnQXJyb3dSaWdodCcpIHN0ZXAoMSk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09ICdBcnJvd0xlZnQnKSBzdGVwKC0xKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gJyAnKSB7IGUucHJldmVudERlZmF1bHQoKTsgdG9nZ2xlUGxheSgpOyB9XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09ICdkJyB8fCBlLmtleSA9PT0gJ0QnKSBzZXRNb2RlKHN0YXRlLm1vZGUgPT09ICdkaWZmJyA/ICdzbmFwc2hvdCcgOiAnZGlmZicpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSAnZScgfHwgZS5rZXkgPT09ICdFJykgZG9FeHBvcnQoZS5zaGlmdEtleSA/ICc0aycgOiAncG5nJyk7XG4gIH0pO1xuXG4gIGlmIChTVEFSVF9GUk9NKSBzdGF0ZS5tb2RlID0gJ2RpZmYnO1xuICBhd2FpdCByZW5kZXIoKTtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdyZWFkeScpO1xuICAvLyBQcmVmZXRjaCB0aGUgcmVzdCBzbyBzd2l0Y2hpbmcgaXMgaW5zdGFudC5cbiAgZm9yIChjb25zdCB5IG9mIHllYXJzKSBzbmFwc2hvdCh5KTtcbn1cblxuLy8gVGhlIGRhdGEtcHJvYmxlbXMgcGFuZWw6IGV2ZXJ5IHNraXBwZWQgcm93IHdpdGggaXRzIGxpbmUgbnVtYmVyIGFuZCByZWFzb24sIHBsdXMgcG9pbnQgcm93cyBzdGlsbCB3YWl0aW5nXG4vLyBmb3IgY29vcmRpbmF0ZXMuIENocm9tZSBvbmx5OyBoaWRkZW4gaW4gc2hvdHMgYW5kIG5ldmVyIHBhcnQgb2YgYW4gZXhwb3J0LlxuZnVuY3Rpb24gc2hvd0RhdGFQcm9ibGVtcyh7IHByb2JsZW1zLCBleGFtcGxlcywgdG90YWwgfSwgbm9Db29yZHMpIHtcbiAgY29uc3QgcGFuZWwgPSBkMy5zZWxlY3QoJyNkYXRhLXByb2JsZW1zJyk7XG4gIGlmICghcHJvYmxlbXMubGVuZ3RoICYmICFub0Nvb3Jkcy5sZW5ndGgpIHsgcGFuZWwuY2xhc3NlZCgnaGlkZGVuJywgdHJ1ZSk7IHJldHVybjsgfVxuICBwYW5lbC5jbGFzc2VkKCdoaWRkZW4nLCBmYWxzZSkuaHRtbCgnJyk7XG4gIGNvbnN0IGggPSBwYW5lbC5hcHBlbmQoJ2gyJyk7XG4gIGguYXBwZW5kKCdzcGFuJykudGV4dChgRGF0YSBwcm9ibGVtcyBcdTAwQjcgJHtwcm9ibGVtcy5sZW5ndGh9IHJvdyR7cHJvYmxlbXMubGVuZ3RoID09PSAxID8gJycgOiAncyd9IHNraXBwZWRgKTtcbiAgaC5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoJ3RpdGxlJywgJ0hpZGUnKS50ZXh0KCdcdTAwRDcnKS5vbignY2xpY2snLCAoKSA9PiBwYW5lbC5jbGFzc2VkKCdoaWRkZW4nLCB0cnVlKSk7XG4gIGNvbnN0IG9sID0gcGFuZWwuYXBwZW5kKCdvbCcpO1xuICBvbC5zZWxlY3RBbGwoJ2xpJykuZGF0YShwcm9ibGVtcykuam9pbignbGknKS5odG1sKChwKSA9PiBgPGI+bGluZSAke3AubGluZX08L2I+JHtwLmlkID8gYCAoJHtwLmlkfSlgIDogJyd9OiAke2VzY2FwZUhUTUwocC5tZXNzYWdlKX1gKTtcbiAgaWYgKG5vQ29vcmRzLmxlbmd0aCkgcGFuZWwuYXBwZW5kKCdwJykuYXR0cignY2xhc3MnLCAnbm90ZScpLnRleHQoYCR7bm9Db29yZHMubGVuZ3RofSBwb2ludCByb3cke25vQ29vcmRzLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnfSB3YWl0aW5nIGZvciBjb29yZGluYXRlcyAocnVuIG5vZGUgc2NyaXB0cy9nZW9jb2RlLm1qcyk6ICR7bm9Db29yZHMubWFwKChyKSA9PiByLmlkKS5qb2luKCcsICcpfWApO1xuICBwYW5lbC5hcHBlbmQoJ3AnKS5hdHRyKCdjbGFzcycsICdub3RlJykudGV4dChgcmVjb3Jkcy5jc3Y6ICR7dG90YWx9IHJvd3MsICR7dG90YWwgLSBwcm9ibGVtcy5sZW5ndGggLSBleGFtcGxlc30gZHJhd24sICR7ZXhhbXBsZXN9IGV4YW1wbGVzIG5vdCBkcmF3bi5gKTtcbn1cbmNvbnN0IGVzY2FwZUhUTUwgPSAocykgPT4gcy5yZXBsYWNlKC9bJjw+XCJdL2csIChjKSA9PiAoeyAnJic6ICcmYW1wOycsICc8JzogJyZsdDsnLCAnPic6ICcmZ3Q7JywgJ1wiJzogJyZxdW90OycgfVtjXSkpO1xuXG5tYWluKCkuY2F0Y2goKGVycikgPT4ge1xuICBjb25zb2xlLmVycm9yKGVycik7XG4gIGQzLnNlbGVjdCgnI3Byb2JsZW1zJykuY2xhc3NlZCgnaGlkZGVuJywgZmFsc2UpLnRleHQoYFBhcmNobWVudCBjb3VsZCBub3Qgc3RhcnQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBQWUsV0FBUixVQUEyQixHQUFHLEdBQUc7QUFDdEMsV0FBTyxLQUFLLFFBQVEs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QSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWdCO0FBQUEsRUFDbEI7OztBQ2xJQTtBQUFBLElBQ0UsSUFBTTtBQUFBLElBQ04sT0FBUztBQUFBLElBQ1QsWUFBYztBQUFBLElBQ2QsUUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBVTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLE1BQ1QsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLE1BQVE7QUFBQSxNQUNOO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVU7QUFBQSxJQUNWLFFBQVU7QUFBQSxNQUNSO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFnQjtBQUFBLEVBQ2xCOzs7QUNsSUE7QUFBQSxJQUNFLFVBQVk7QUFBQSxJQUNaLE9BQVM7QUFBQSxJQUNULFVBQVk7QUFBQSxJQUNaLFFBQVU7QUFBQSxNQUNSO0FBQUEsUUFDRSxRQUFVO0FBQUEsUUFDVixLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxRQUNFLFFBQVU7QUFBQSxRQUNWLE9BQVM7QUFBQSxRQUNULE9BQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQ0UsUUFBVTtBQUFBLFFBQ1YsT0FBUztBQUFBLFFBQ1QsT0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsSUFDQSxZQUFjO0FBQUEsTUFDWjtBQUFBLFFBQ0UsSUFBTTtBQUFBLFFBQ04sT0FBUztBQUFBLFFBQ1QsT0FBUztBQUFBLFFBQ1QsS0FBTztBQUFBLFFBQ1AsT0FBUztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQU07QUFBQSxRQUNOLE9BQVM7QUFBQSxRQUNULE9BQVM7QUFBQSxRQUNULEtBQU87QUFBQSxRQUNQLE9BQVM7QUFBQSxVQUNQO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFNO0FBQUEsUUFDTixPQUFTO0FBQUEsUUFDVCxPQUFTO0FBQUEsUUFDVCxLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsVUFDUDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBTTtBQUFBLFFBQ04sT0FBUztBQUFBLFFBQ1QsT0FBUztBQUFBLFFBQ1QsS0FBTztBQUFBLFFBQ1AsT0FBUztBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFNO0FBQUEsUUFDTixPQUFTO0FBQUEsUUFDVCxPQUFTO0FBQUEsUUFDVCxLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFNO0FBQUEsUUFDTixPQUFTO0FBQUEsUUFDVCxPQUFTO0FBQUEsUUFDVCxLQUFPO0FBQUEsUUFDUCxPQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQU07QUFBQSxRQUNOLE9BQVM7QUFBQSxRQUNULE9BQVM7QUFBQSxRQUNULEtBQU87QUFBQSxRQUNQLE9BQVM7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQU07QUFBQSxRQUNOLE9BQVM7QUFBQSxRQUNULE9BQVM7QUFBQSxRQUNULEtBQU87QUFBQSxRQUNQLE9BQVM7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFB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QUssSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLFdBQVcsRUFBRSxJQUFJLE9BQU8sRUFBRSxLQUFLLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUNySSxRQUFJLFNBQVMsT0FBUSxPQUFNLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxNQUFNLEVBQUUsS0FBSyxHQUFHLFNBQVMsTUFBTSxhQUFhLFNBQVMsV0FBVyxJQUFJLEtBQUssR0FBRyw0REFBNEQsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ25PLFVBQU0sT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLE1BQU0sRUFBRSxLQUFLLGdCQUFnQixLQUFLLFVBQVUsUUFBUSxTQUFTLFNBQVMsUUFBUSxXQUFXLFFBQVEsc0JBQXNCO0FBQUEsRUFDeko7QUFDQSxNQUFNLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssU0FBUyxLQUFLLFFBQVEsS0FBSyxRQUFRLEtBQUssU0FBUyxHQUFFLENBQUMsQ0FBRTtBQUVwSCxPQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDcEIsWUFBUSxNQUFNLEdBQUc7QUFDakIsSUFBR0EsZ0JBQU8sV0FBVyxFQUFFLFFBQVEsVUFBVSxLQUFLLEVBQUUsS0FBSyw4QkFBOEIsSUFBSSxPQUFPLEVBQUU7QUFBQSxFQUNsRyxDQUFDOyIsCiAgIm5hbWVzIjogWyJzdGFydCIsICJ0aWNrcyIsICJhcnJheSIsICJzdGFydCIsICJyYW5nZSIsICJjb3B5IiwgInR5cGUiLCAiZG9jdW1lbnQiLCAiZGF0dW0iLCAic2VsZWN0aW9uIiwgIm1lcmdlIiwgImFzY2VuZGluZyIsICJjcmVhdGUiLCAiY3JlYXRlIiwgInBhcnNlVHlwZW5hbWVzIiwgInR5cGUiLCAicGFyYW1zIiwgIndpbmRvdyIsICJkaXNwYXRjaF9kZWZhdWx0IiwgImRpc3BhdGNoX2RlZmF1bHQiLCAic2VsZWN0X2RlZmF1bHQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAiZm9ybWF0IiwgIm1pbiIsICJtYXgiLCAiY29uc3RhbnRfZGVmYXVsdCIsICJjb25zdGFudF9kZWZhdWx0IiwgImNvbG9yIiwgInJnYiIsICJzdGFydCIsICJ6ZXJvIiwgImkiLCAiY29uc3RhbnRfZGVmYXVsdCIsICJub3ciLCAiaWQiLCAiZ2V0IiwgInNldCIsICJzdGFydCIsICJlbXB0eSIsICJpbnRlcnJ1cHRfZGVmYXVsdCIsICJpZCIsICJzZXQiLCAiZ2V0IiwgInRyYW5zaXRpb24iLCAiYXR0clJlbW92ZSIsICJhdHRyUmVtb3ZlTlMiLCAiYXR0ckNvbnN0YW50IiwgImF0dHJDb25zdGFudE5TIiwgImF0dHJGdW5jdGlvbiIsICJhdHRyRnVuY3Rpb25OUyIsICJhdHRyX2RlZmF1bHQiLCAiaWQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImdldCIsICJpZCIsICJzZXQiLCAiZmlsdGVyX2RlZmF1bHQiLCAibWVyZ2VfZGVmYXVsdCIsICJ0cmFuc2l0aW9uIiwgIm1lcmdlIiwgImlkIiwgInNldCIsICJvbl9kZWZhdWx0IiwgImdldCIsICJpZCIsICJyZW1vdmVfZGVmYXVsdCIsICJzZWxlY3RfZGVmYXVsdCIsICJpZCIsICJnZXQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAiaWQiLCAiY2hpbGRyZW4iLCAiaW5oZXJpdCIsICJnZXQiLCAiU2VsZWN0aW9uIiwgInNlbGVjdGlvbl9kZWZhdWx0IiwgInN0eWxlUmVtb3ZlIiwgInN0eWxlQ29uc3RhbnQiLCAic3R5bGVGdW5jdGlvbiIsICJpZCIsICJyZW1vdmUiLCAic2V0IiwgInN0eWxlX2RlZmF1bHQiLCAidGV4dENvbnN0YW50IiwgInRleHRGdW5jdGlvbiIsICJ0ZXh0X2RlZmF1bHQiLCAiaW5oZXJpdCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImlkIiwgInNlbGVjdF9kZWZhdWx0IiwgInNlbGVjdEFsbF9kZWZhdWx0IiwgImZpbHRlcl9kZWZhdWx0IiwgIm1lcmdlX2RlZmF1bHQiLCAic2VsZWN0aW9uX2RlZmF1bHQiLCAib25fZGVmYXVsdCIsICJhdHRyX2RlZmF1bHQiLCAic3R5bGVfZGVmYXVsdCIsICJ0ZXh0X2RlZmF1bHQiLCAicmVtb3ZlX2RlZmF1bHQiLCAiaWQiLCAidHJhbnNpdGlvbl9kZWZhdWx0IiwgImludGVycnVwdF9kZWZhdWx0IiwgInRyYW5zaXRpb25fZGVmYXVsdCIsICJsb2NhbGUiLCAic2lnbiIsICJ6ZXJvIiwgInR5cGUiLCAiZm9ybWF0IiwgImZvcm1hdFByZWZpeCIsICJ2YWx1ZSIsICJtYXgiLCAiZGVncmVlcyIsICJhYnMiLCAibm9vcCIsICJvYmplY3QiLCAiY29vcmRpbmF0ZXMiLCAibm9vcCIsICJvYmplY3QiLCAiY2FydGVzaWFuIiwgInNwaGVyaWNhbCIsICJhYnMiLCAibm9vcCIsICJhYnMiLCAiY29tcGFyZUludGVyc2VjdGlvbiIsICJuIiwgInN0YXJ0IiwgImFycmF5IiwgImFicyIsICJsYW1iZGEwIiwgInNpblBoaTAiLCAiY29zUGhpMCIsICJzaWduIiwgInN0YXJ0IiwgInBvaW50IiwgImxhbWJkYTAiLCAiYWJzIiwgImNvc1BoaTAiLCAiYWJzIiwgImxhbWJkYTAiLCAiZGVsdGEiLCAiY29kZSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJhYnMiLCAiY29tcGFyZUludGVyc2VjdGlvbiIsICJyaW5nIiwgInBvaW50IiwgInZpc2libGUiLCAibGFtYmRhMCIsICJzaW5QaGkwIiwgImNvc1BoaTAiLCAibm9vcCIsICJhYnMiLCAib2JqZWN0IiwgInkwIiwgInkxIiwgInkiLCAieDAiLCAieDEiLCAieCIsICJYMSIsICJYMCIsICJZMSIsICJZMCIsICJYIiwgIlkiLCAiZ3JhdGljdWxlIiwgImFicyIsICJjb29yZGluYXRlcyIsICJpZGVudGl0eV9kZWZhdWx0IiwgImFyZWFTdW0iLCAiYXJlYVJpbmdTdW0iLCAiYXJlYVN0cmVhbSIsICJub29wIiwgImFyZWFSaW5nU3RhcnQiLCAiYXJlYVJpbmdFbmQiLCAiYWJzIiwgImFyZWFQb2ludEZpcnN0IiwgImFyZWFQb2ludCIsICJhcmVhX2RlZmF1bHQiLCAieDAiLCAieTAiLCAibm9vcCIsICJ4MDAiLCAieTAwIiwgIngwIiwgInkwIiwgIm5vb3AiLCAibGVuZ3RoU3VtIiwgIngwMCIsICJ5MDAiLCAieDAiLCAieTAiLCAibGVuZ3RoU3RyZWFtIiwgIm5vb3AiLCAibGVuZ3RoUG9pbnRGaXJzdCIsICJsZW5ndGhQb2ludCIsICJhcHBlbmQiLCAicHJvamVjdGlvbiIsICJvYmplY3QiLCAiYXJlYV9kZWZhdWx0IiwgImlkZW50aXR5X2RlZmF1bHQiLCAicHJvamVjdGlvbiIsICJvYmplY3QiLCAieDAiLCAieTAiLCAibGFtYmRhMCIsICJ4MSIsICJ5MSIsICJhYnMiLCAibGFtYmRhMDAiLCAieDAwIiwgInkwMCIsICJ0cmFuc2Zvcm0iLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJjYWNoZSIsICJwcm9qZWN0aW9uIiwgImRlZ3JlZXMiLCAib2JqZWN0IiwgImRlZ3JlZXMiLCAiY29zUGhpMCIsICJ5MCIsICJ5MSIsICJhYnMiLCAiY2FjaGUiLCAiY29vcmRpbmF0ZXMiLCAib2JqZWN0IiwgImFicyIsICJyYW5nZSIsICJudW1iZXIiLCAiaWRlbnRpdHkiLCAicmFuZ2UiLCAiaSIsICJ0cmFuc2Zvcm1lciIsICJ0cmFuc2Zvcm0iLCAibnVtYmVyIiwgInN0YXJ0IiwgInN0YXJ0IiwgImxpbmVhciIsICJsb2NhdGlvbiIsICJpZGVudGl0eSIsICJpZGVudGl0eV9kZWZhdWx0IiwgInRyYW5zZm9ybSIsICJpZGVudGl0eV9kZWZhdWx0IiwgIngwIiwgInkwIiwgImFycmF5IiwgIm8iLCAiaWQiLCAib2JqZWN0IiwgImFyY3MiLCAidHlwZSIsICJjb29yZGluYXRlcyIsICJzdGFydCIsICJmcmFnbWVudEJ5RW5kIiwgImZyYWdtZW50QnlTdGFydCIsICJvYmplY3QiLCAiZmlsdGVyIiwgImFyY3MiLCAicm9vdCIsICJXIiwgIkgiLCAic3RhZ2UiLCAiaWQiLCAicHJvamVjdGlvbiIsICJyb290IiwgIngwIiwgInkxIiwgInN0YWdlIiwgIlciLCAiSCIsICJ5IiwgImIiLCAicm9vdCIsICJ4MCIsICJ4MSIsICJ5MSIsICJzdGFnZSIsICJsaW5lYXIiLCAicmFuZ2UiLCAiYSIsICJiIiwgInJvb3QiLCAieDEiLCAieTAiLCAiVyIsICJzZXQiLCAiSCIsICJzZWxlY3RfZGVmYXVsdCIsICJyb290IiwgIngxIiwgInkwIiwgIlciLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiZnJhbWUiLCAiaWQiLCAiZ2V0IiwgInByb2plY3Rpb24iLCAic3RhZ2UiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiZnJhbWUiLCAicHJvamVjdGlvbiIsICJjYWNoZSIsICJyb290IiwgIm1hcCIsICJuYW1lZCIsICJyZSIsICJhYnMiLCAic3ZnTm9kZSIsICJzdGFnZSIsICJzZWxlY3RfZGVmYXVsdCIsICJzZWxlY3RBbGxfZGVmYXVsdCIsICJzdmdOb2RlIl0KfQo=
