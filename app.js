(() => {
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
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
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
    if (!compare) compare = ascending;
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
  function ascending(a, b) {
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
  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
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

  // node_modules/d3-interpolate/src/number.js
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero(b) {
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
    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
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
    Feature: function(object2, stream) {
      streamGeometry(object2.geometry, stream);
    },
    FeatureCollection: function(object2, stream) {
      var features = object2.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };
  var streamGeometryType = {
    Sphere: function(object2, stream) {
      stream.sphere();
    },
    Point: function(object2, stream) {
      object2 = object2.coordinates;
      stream.point(object2[0], object2[1], object2[2]);
    },
    MultiPoint: function(object2, stream) {
      var coordinates = object2.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object2 = coordinates[i], stream.point(object2[0], object2[1], object2[2]);
    },
    LineString: function(object2, stream) {
      streamLine(object2.coordinates, stream, 0);
    },
    MultiLineString: function(object2, stream) {
      var coordinates = object2.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamLine(coordinates[i], stream, 0);
    },
    Polygon: function(object2, stream) {
      streamPolygon(object2.coordinates, stream);
    },
    MultiPolygon: function(object2, stream) {
      var coordinates = object2.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamPolygon(coordinates[i], stream);
    },
    GeometryCollection: function(object2, stream) {
      var geometries = object2.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };
  function streamLine(coordinates, stream, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }
  function streamPolygon(coordinates, stream) {
    var i = -1, n = coordinates.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates[i], stream, 1);
    stream.polygonEnd();
  }
  function stream_default(object2, stream) {
    if (object2 && streamObjectType.hasOwnProperty(object2.type)) {
      streamObjectType[object2.type](object2, stream);
    } else {
      streamGeometry(object2, stream);
    }
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
      var ring, m, point0 = ring[m - 1], lambda0 = longitude(point0), phi0 = point0[1] / 2 + quarterPi, sinPhi0 = sin(phi0), cosPhi0 = cos(phi0);
      for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
        var point1 = ring[j], lambda1 = longitude(point1), phi1 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi1), cosPhi1 = cos(phi1), delta = lambda1 - lambda0, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k = sinPhi0 * sinPhi1;
        sum.add(atan2(k * sign2 * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
        angle += antimeridian ? delta + sign2 * tau : delta;
        if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
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
    var lambda0 = NaN, phi0 = NaN, sign0 = NaN, clean;
    return {
      lineStart: function() {
        stream.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var sign1 = lambda1 > 0 ? pi : -pi, delta = abs2(lambda1 - lambda0);
        if (abs2(delta - pi) < epsilon) {
          stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          stream.point(lambda1, phi0);
          clean = 0;
        } else if (sign0 !== sign1 && delta >= pi) {
          if (abs2(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon;
          if (abs2(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
          phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          clean = 0;
        }
        stream.point(lambda0 = lambda1, phi0 = phi1);
        sign0 = sign1;
      },
      lineEnd: function() {
        stream.lineEnd();
        lambda0 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
    var cosPhi0, cosPhi1, sinLambda0Lambda1 = sin(lambda0 - lambda1);
    return abs2(sinLambda0Lambda1) > epsilon ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1) - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0)) / (cosPhi0 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
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
      var lambda0 = a[0], lambda1 = b[0], phi0 = a[1], phi1 = b[1], z;
      if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;
      var delta2 = lambda1 - lambda0, polar = abs2(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;
      if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs2(q[0] - lambda0) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta2 > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
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
      return lines().map(function(coordinates) {
        return { type: "LineString", coordinates };
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
  var identity_default = (x) => x;

  // node_modules/d3-geo/src/path/area.js
  var areaSum = new Adder();
  var areaRingSum = new Adder();
  var x00;
  var y00;
  var x0;
  var y0;
  var areaStream = {
    point: noop2,
    lineStart: noop2,
    lineEnd: noop2,
    polygonStart: function() {
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop2;
      areaSum.add(abs2(areaRingSum));
      areaRingSum = new Adder();
    },
    result: function() {
      var area = areaSum / 2;
      areaSum = new Adder();
      return area;
    }
  };
  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }
  function areaPointFirst(x, y) {
    areaStream.point = areaPoint;
    x00 = x0 = x, y00 = y0 = y;
  }
  function areaPoint(x, y) {
    areaRingSum.add(y0 * x - x0 * y);
    x0 = x, y0 = y;
  }
  function areaRingEnd() {
    areaPoint(x00, y00);
  }
  var area_default = areaStream;

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
  var lengthSum = new Adder();
  var lengthRing;
  var x003;
  var y003;
  var x04;
  var y04;
  var lengthStream = {
    point: noop2,
    lineStart: function() {
      lengthStream.point = lengthPointFirst;
    },
    lineEnd: function() {
      if (lengthRing) lengthPoint(x003, y003);
      lengthStream.point = noop2;
    },
    polygonStart: function() {
      lengthRing = true;
    },
    polygonEnd: function() {
      lengthRing = null;
    },
    result: function() {
      var length = +lengthSum;
      lengthSum = new Adder();
      return length;
    }
  };
  function lengthPointFirst(x, y) {
    lengthStream.point = lengthPoint;
    x003 = x04 = x, y003 = y04 = y;
  }
  function lengthPoint(x, y) {
    x04 -= x, y04 -= y;
    lengthSum.add(sqrt(x04 * x04 + y04 * y04));
    x04 = x, y04 = y;
  }
  var measure_default = lengthStream;

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
    function path(object2) {
      if (object2) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        stream_default(object2, projectionStream(contextStream));
      }
      return contextStream.result();
    }
    path.area = function(object2) {
      stream_default(object2, projectionStream(area_default));
      return area_default.result();
    };
    path.measure = function(object2) {
      stream_default(object2, projectionStream(measure_default));
      return measure_default.result();
    };
    path.bounds = function(object2) {
      stream_default(object2, projectionStream(bounds_default));
      return bounds_default.result();
    };
    path.centroid = function(object2) {
      stream_default(object2, projectionStream(centroid_default));
      return centroid_default.result();
    };
    path.projection = function(_) {
      if (!arguments.length) return projection2;
      projectionStream = _ == null ? (projection2 = null, identity_default) : (projection2 = _).stream;
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
  function fit(projection2, fitBounds, object2) {
    var clip = projection2.clipExtent && projection2.clipExtent();
    projection2.scale(150).translate([0, 0]);
    if (clip != null) projection2.clipExtent(null);
    stream_default(object2, projection2.stream(bounds_default));
    fitBounds(bounds_default.result());
    if (clip != null) projection2.clipExtent(clip);
    return projection2;
  }
  function fitExtent(projection2, extent, object2) {
    return fit(projection2, function(b) {
      var w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      projection2.scale(150 * k).translate([x, y]);
    }, object2);
  }
  function fitSize(projection2, size, object2) {
    return fitExtent(projection2, [[0, 0], size], object2);
  }
  function fitWidth(projection2, width, object2) {
    return fit(projection2, function(b) {
      var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
      projection2.scale(150 * k).translate([x, y]);
    }, object2);
  }
  function fitHeight(projection2, height, object2) {
    return fit(projection2, function(b) {
      var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
      projection2.scale(150 * k).translate([x, y]);
    }, object2);
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
    function resampleLineTo(x05, y05, lambda0, a0, b0, c0, x12, y12, lambda1, a1, b1, c1, depth, stream) {
      var dx = x12 - x05, dy = y12 - y05, d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda2 = abs2(abs2(c) - 1) < epsilon || abs2(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x05, dy2 = y2 - y05, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 || abs2((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x05, y05, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x12, y12, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    return function(stream) {
      var lambda00, x004, y004, a00, b00, c00, lambda0, x05, y05, a0, b0, c0;
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
        resampleLineTo(x05, y05, lambda0, a0, b0, c0, x05 = p[0], y05 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
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
        linePoint(lambda00 = lambda, phi), x004 = x05, y004 = y05, a00 = a0, b00 = b0, c00 = c0;
        resampleStream.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x05, y05, lambda0, a0, b0, c0, x004, y004, lambda00, a00, b00, c00, maxDepth, stream);
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
    var project, k = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = antimeridian_default, x05 = null, y05, x12, y12, postclip = identity_default, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache2, cacheStream;
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
      return arguments.length ? (postclip = _ == null ? (x05 = y05 = x12 = y12 = null, identity_default) : clipRectangle(x05 = +_[0][0], y05 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x05 == null ? null : [[x05, y05], [x12, y12]];
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
    projection2.fitExtent = function(extent, object2) {
      return fitExtent(projection2, extent, object2);
    };
    projection2.fitSize = function(size, object2) {
      return fitSize(projection2, size, object2);
    };
    projection2.fitWidth = function(width, object2) {
      return fitWidth(projection2, width, object2);
    };
    projection2.fitHeight = function(height, object2) {
      return fitHeight(projection2, height, object2);
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
    var cosPhi0 = cos(phi0);
    function forward(lambda, phi) {
      return [lambda * cosPhi0, sin(phi) / cosPhi0];
    }
    forward.invert = function(x, y) {
      return [x / cosPhi0, asin(y * cosPhi0)];
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
    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      return point = null, (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point);
    }
    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
      return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates);
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
    albersUsa.fitExtent = function(extent, object2) {
      return fitExtent(albersUsa, extent, object2);
    };
    albersUsa.fitSize = function(size, object2) {
      return fitSize(albersUsa, size, object2);
    };
    albersUsa.fitWidth = function(width, object2) {
      return fitWidth(albersUsa, width, object2);
    };
    albersUsa.fitHeight = function(height, object2) {
      return fitHeight(albersUsa, height, object2);
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
  var identity2 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
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
  function identity_default2(x) {
    return x;
  }

  // node_modules/topojson-client/src/transform.js
  function transform_default(transform2) {
    if (transform2 == null) return identity_default2;
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
    var id2 = o.id, bbox = o.bbox, properties = o.properties == null ? {} : o.properties, geometry = object(topology, o);
    return id2 == null && bbox == null ? { type: "Feature", properties, geometry } : bbox == null ? { type: "Feature", id: id2, properties, geometry } : { type: "Feature", id: id2, bbox, properties, geometry };
  }
  function object(topology, o) {
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
      var type2 = o2.type, coordinates;
      switch (type2) {
        case "GeometryCollection":
          return { type: type2, geometries: o2.geometries.map(geometry) };
        case "Point":
          coordinates = point(o2.coordinates);
          break;
        case "MultiPoint":
          coordinates = o2.coordinates.map(point);
          break;
        case "LineString":
          coordinates = line(o2.arcs);
          break;
        case "MultiLineString":
          coordinates = o2.arcs.map(line);
          break;
        case "Polygon":
          coordinates = polygon(o2.arcs);
          break;
        case "MultiPolygon":
          coordinates = o2.arcs.map(polygon);
          break;
        default:
          return null;
      }
      return { type: type2, coordinates };
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
    return object(topology, meshArcs.apply(this, arguments));
  }
  function meshArcs(topology, object2, filter2) {
    var arcs, i, n;
    if (arguments.length > 1) arcs = extractArcs(topology, object2, filter2);
    else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
    return { type: "MultiLineString", arcs: stitch_default(topology, arcs) };
  }
  function extractArcs(topology, object2, filter2) {
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
    geometry(object2);
    geomsByArc.forEach(filter2 == null ? function(geoms) {
      arcs.push(geoms[0].i);
    } : function(geoms) {
      if (filter2(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i);
    });
    return arcs;
  }

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
  function makeProjection(stage, inner) {
    const make = PROJECTIONS[stage.projection];
    if (!make) throw new Error(`Unknown projection ${stage.projection}`);
    const proj = make();
    if (stage.rotate && proj.rotate) proj.rotate(stage.rotate);
    proj.fitExtent(inner, extentPolygon(stage.extent));
    return proj;
  }
  function createStage(svg, stage, layers) {
    const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
    const [[x05, y05], [x12, y12]] = inner;
    const projection2 = makeProjection(stage, inner);
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
    defs.append("clipPath").attr("id", "frame-clip").append("rect").attr("x", x05).attr("y", y05).attr("width", x12 - x05).attr("height", y12 - y05);
    const root2 = svg.append("g").attr("class", "stage");
    root2.append("rect").attr("class", "paper").attr("width", W).attr("height", H);
    const map = root2.append("g").attr("class", "map").attr("clip-path", "url(#frame-clip)");
    map.append("path").attr("class", "ocean").attr("d", d({ type: "Sphere" }));
    const bathy = feature_default(layers.bathy, layers.bathy.objects.bathymetry);
    map.append("g").attr("class", "bathymetry").selectAll("path").data(bathy.features).join("path").attr("d", d);
    const ne = layers.ne;
    const land = feature_default(ne, ne.objects.land);
    map.append("path").attr("class", "land").attr("d", d(land));
    if (stage.relief) {
      defs.append("clipPath").attr("id", "land-clip").append("path").attr("d", d(land));
      map.append("image").attr("class", "relief").attr("clip-path", "url(#land-clip)").attr("x", x05).attr("y", y05).attr("width", x12 - x05).attr("height", y12 - y05).attr("preserveAspectRatio", "none").attr("href", assetURL(`assets/${stage.relief}`));
    }
    const polities = map.append("g").attr("class", "polities");
    const borders = map.append("g").attr("class", "borders");
    const rivers = feature_default(ne, ne.objects.rivers);
    map.append("g").attr("class", "rivers").selectAll("path").data(rivers.features.filter((f) => (f.properties.scalerank ?? 0) <= 7)).join("path").attr("d", d);
    const lakes = feature_default(ne, ne.objects.lakes);
    map.append("path").attr("class", "lakes").attr("d", d(lakes));
    map.append("path").attr("class", "coastline").attr("d", d(feature_default(ne, ne.objects.coastline)));
    map.append("path").attr("class", "graticule").attr("d", d(graticule10()));
    root2.append("rect").attr("class", "frame").attr("x", x05).attr("y", y05).attr("width", x12 - x05).attr("height", y12 - y05);
    let currentYear = null;
    function showSnapshot(year, topo, classify = () => ({ status: "muted" })) {
      const fc = feature_default(topo, topo.objects.polities);
      const named2 = fc.features.filter((f) => f.properties.id);
      for (const f of named2) f.properties.cls = classify(f, year);
      polities.selectAll("path").data(named2, (f) => f.properties.id).join("path").attr("class", (f) => `polity ${f.properties.certainty} ${f.properties.cls.status}`).attr("d", d).append("title").text((f) => f.properties.cls.label ?? f.properties.name);
      const interior = mesh_default(topo, topo.objects.polities, (a, b) => a !== b);
      const certainty = named2[0]?.properties.certainty ?? "approximate";
      borders.selectAll("path").data([interior]).join("path").attr("class", `border ${certainty}`).attr("d", d);
      currentYear = year;
    }
    return { projection: projection2, path, d, showSnapshot, inner, get year() {
      return currentYear;
    } };
  }

  // src/stages/afro-eurasia.json
  var afro_eurasia_default = {
    id: "afro-eurasia",
    title: "Afro-Eurasia",
    projection: "equalEarth",
    rotate: [-60, 0],
    extent: { west: -20, south: 6, east: 150, north: 76 },
    span: [1200, 2e3],
    relief: "relief/afro-eurasia.png",
    labels: [
      { text: "Europe", lon: 15, lat: 50, kind: "region" },
      { text: "North Africa", lon: 10, lat: 27, kind: "region" },
      { text: "West Africa", lon: -2, lat: 13, kind: "region" },
      { text: "Middle East", lon: 44, lat: 29, kind: "region" },
      { text: "Central Asia", lon: 66, lat: 44, kind: "region" },
      { text: "South Asia", lon: 78, lat: 22, kind: "region" },
      { text: "East Asia", lon: 112, lat: 36, kind: "region" },
      { text: "Southeast Asia", lon: 104, lat: 12, kind: "region" },
      { text: "Siberia", lon: 100, lat: 64, kind: "region" },
      { text: "Mediterranean Sea", lon: 17, lat: 35.5, kind: "water" },
      { text: "Indian Ocean", lon: 75, lat: 5, kind: "water" },
      { text: "Arabian Sea", lon: 63, lat: 15, kind: "water" },
      { text: "Bay of Bengal", lon: 88, lat: 13, kind: "water" },
      { text: "South China Sea", lon: 114, lat: 15, kind: "water" },
      { text: "Black Sea", lon: 34, lat: 43.5, kind: "water" },
      { text: "Caspian Sea", lon: 50.5, lat: 41.5, kind: "water" },
      { text: "Red Sea", lon: 38, lat: 20, kind: "water" },
      { text: "Atlantic Ocean", lon: -14, lat: 38, kind: "water" }
    ]
  };

  // src/trackers/extent.json
  var extent_default = {
    _comment: "Extent tracker (v0). Which downloaded base polygons are highlighted, by the NAME the base map gives them in each era, bounded by start/end years. The polygons themselves are never edited. Rows in data/records.csv with tracker=extent can add to or override this list.",
    fill_key: "P",
    highlights: [
      { id: "ottoman", label: "Ottoman Empire", start: 1299, end: 1922, names: ["Ottoman Empire"] },
      { id: "safavid", label: "Safavid Empire", start: 1501, end: 1736, names: ["Safavid Empire"] },
      { id: "mughal", label: "Mughal Empire", start: 1526, end: 1857, names: ["Mughal Empire"] },
      { id: "ming", label: "Ming China", start: 1368, end: 1644, names: ["Ming Empire", "Ming Chinese Empire"] },
      { id: "qing", label: "Qing China", start: 1644, end: 1912, names: ["Manchu Empire", "Qing Empire", "Qing Dynasty"] },
      { id: "songhai", label: "Songhai Empire", start: 1464, end: 1591, names: ["Songhai", "Songhai Empire"] },
      { id: "morocco", label: "Morocco", start: 1450, end: 2e3, names: ["Morocco", "Wattasid Caliphate", "Watassid Morocco", "Saadi Morocco", "Saadi Sultanate", "Alaouite Morocco"] },
      { id: "russia", label: "Russia", start: 1450, end: 2e3, names: ["Grand Duchy of Moscow", "Tsardom of Muscovy", "Tsardom of Russia", "Russian Empire", "Russia"] },
      { id: "tokugawa", label: "Tokugawa Japan", start: 1603, end: 1868, names: ["Tokugawa shogunate", "Tokugawa Shogunate"] }
    ]
  };

  // src/main.js
  var params = new URLSearchParams(location.search);
  var START_YEAR = Number(params.get("year")) || 1450;
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
    const atlas = createStage(svg, afro_eurasia_default, { ne, bathy });
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
      select_default2("#year-readout").text(meta.source_year !== year ? `${year} \xB7 base map ${meta.source_year}` : `${year}`);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9mc3VtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWVyZ2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9yYW5nZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvc3JjL2Rpc3BhdGNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NyZWF0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9hcnJheS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0QWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL21hdGNoZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RDaGlsZHJlbi5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZmlsdGVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VudGVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NvbnN0YW50LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9leGl0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9qb2luLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb3JkZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NvcnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL25vZGVzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2RlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lbXB0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZWFjaC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy93aW5kb3cuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3N0eWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2xhc3NlZC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vdGV4dC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmFpc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2xvd2VyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2luc2VydC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmVtb3ZlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZGF0dW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL29uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaXRlcmF0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9kZWZpbmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9jb2xvci5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2Jhc2lzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXNDbG9zZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jb25zdGFudC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbG9yLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcmdiLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2RlY29tcG9zZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9wYXJzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZW91dC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvaW50ZXJydXB0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vaW50ZXJydXB0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ludGVycG9sYXRlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2F0dHIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2RlbGF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2R1cmF0aW9uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZVZhcnlpbmcuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZmlsdGVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL29uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3JlbW92ZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc2VsZWN0QWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZVR3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RyYW5zaXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZW5kLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1lYXNlL3NyYy9jdWJpYy5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL3RyYW5zaXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtYnJ1c2gvc3JjL2JydXNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL21hdGguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbm9vcC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9zdHJlYW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2FydGVzaWFuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NvbXBvc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcm90YXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2lyY2xlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvYnVmZmVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BvaW50RXF1YWwuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9yZWpvaW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcG9seWdvbkNvbnRhaW5zLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9hbnRpbWVyaWRpYW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9jaXJjbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9saW5lLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvcmVjdGFuZ2xlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2dyYXRpY3VsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2FyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9ib3VuZHMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9jZW50cm9pZC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2NvbnRleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9tZWFzdXJlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vZml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vcmVzYW1wbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vY3lsaW5kcmljYWxFcXVhbEFyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVycy5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVyc1VzYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbEVxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2VxdWFsRWFydGguanMiLCAibm9kZV9tb2R1bGVzL2QzLXpvb20vc3JjL3RyYW5zZm9ybS5qcyIsICJzcmMvZGF0YS9sb2FkZXIuanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvaWRlbnRpdHkuanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy90b3BvanNvbi1jbGllbnQvc3JjL3JldmVyc2UuanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvZmVhdHVyZS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9zdGl0Y2guanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvbWVzaC5qcyIsICJzcmMvcmVuZGVyL2Jhc2UuanMiLCAic3JjL3N0YWdlcy9hZnJvLWV1cmFzaWEuanNvbiIsICJzcmMvdHJhY2tlcnMvZXh0ZW50Lmpzb24iLCAic3JjL21haW4uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9weXRob24vY3B5dGhvbi9ibG9iL2E3NGVlYTIzOGY1YmFiYTE1Nzk3ZTJlOGI1NzBkMTUzYmM4NjkwYTcvTW9kdWxlcy9tYXRobW9kdWxlLmMjTDE0MjNcbmV4cG9ydCBjbGFzcyBBZGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3BhcnRpYWxzID0gbmV3IEZsb2F0NjRBcnJheSgzMik7XG4gICAgdGhpcy5fbiA9IDA7XG4gIH1cbiAgYWRkKHgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGFydGlhbHM7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5fbiAmJiBqIDwgMzI7IGorKykge1xuICAgICAgY29uc3QgeSA9IHBbal0sXG4gICAgICAgIGhpID0geCArIHksXG4gICAgICAgIGxvID0gTWF0aC5hYnMoeCkgPCBNYXRoLmFicyh5KSA/IHggLSAoaGkgLSB5KSA6IHkgLSAoaGkgLSB4KTtcbiAgICAgIGlmIChsbykgcFtpKytdID0gbG87XG4gICAgICB4ID0gaGk7XG4gICAgfVxuICAgIHBbaV0gPSB4O1xuICAgIHRoaXMuX24gPSBpICsgMTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YWx1ZU9mKCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLl9wYXJ0aWFscztcbiAgICBsZXQgbiA9IHRoaXMuX24sIHgsIHksIGxvLCBoaSA9IDA7XG4gICAgaWYgKG4gPiAwKSB7XG4gICAgICBoaSA9IHBbLS1uXTtcbiAgICAgIHdoaWxlIChuID4gMCkge1xuICAgICAgICB4ID0gaGk7XG4gICAgICAgIHkgPSBwWy0tbl07XG4gICAgICAgIGhpID0geCArIHk7XG4gICAgICAgIGxvID0geSAtIChoaSAtIHgpO1xuICAgICAgICBpZiAobG8pIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKG4gPiAwICYmICgobG8gPCAwICYmIHBbbiAtIDFdIDwgMCkgfHwgKGxvID4gMCAmJiBwW24gLSAxXSA+IDApKSkge1xuICAgICAgICB5ID0gbG8gKiAyO1xuICAgICAgICB4ID0gaGkgKyB5O1xuICAgICAgICBpZiAoeSA9PSB4IC0gaGkpIGhpID0geDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmc3VtKHZhbHVlcywgdmFsdWVvZikge1xuICBjb25zdCBhZGRlciA9IG5ldyBBZGRlcigpO1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgPSArdmFsdWUpIHtcbiAgICAgICAgYWRkZXIuYWRkKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgPSArdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkge1xuICAgICAgICBhZGRlci5hZGQodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gK2FkZGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmN1bXN1bSh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgY29uc3QgYWRkZXIgPSBuZXcgQWRkZXIoKTtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIHJldHVybiBGbG9hdDY0QXJyYXkuZnJvbSh2YWx1ZXMsIHZhbHVlb2YgPT09IHVuZGVmaW5lZFxuICAgICAgPyB2ID0+IGFkZGVyLmFkZCgrdiB8fCAwKVxuICAgICAgOiB2ID0+IGFkZGVyLmFkZCgrdmFsdWVvZih2LCArK2luZGV4LCB2YWx1ZXMpIHx8IDApXG4gICk7XG59XG4iLCAiZnVuY3Rpb24qIGZsYXR0ZW4oYXJyYXlzKSB7XG4gIGZvciAoY29uc3QgYXJyYXkgb2YgYXJyYXlzKSB7XG4gICAgeWllbGQqIGFycmF5O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlKGFycmF5cykge1xuICByZXR1cm4gQXJyYXkuZnJvbShmbGF0dGVuKGFycmF5cykpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIHN0YXJ0ID0gK3N0YXJ0LCBzdG9wID0gK3N0b3AsIHN0ZXAgPSAobiA9IGFyZ3VtZW50cy5sZW5ndGgpIDwgMiA/IChzdG9wID0gc3RhcnQsIHN0YXJ0ID0gMCwgMSkgOiBuIDwgMyA/IDEgOiArc3RlcDtcblxuICB2YXIgaSA9IC0xLFxuICAgICAgbiA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApKSB8IDAsXG4gICAgICByYW5nZSA9IG5ldyBBcnJheShuKTtcblxuICB3aGlsZSAoKytpIDwgbikge1xuICAgIHJhbmdlW2ldID0gc3RhcnQgKyBpICogc3RlcDtcbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cbiIsICJ2YXIgbm9vcCA9IHt2YWx1ZTogKCkgPT4ge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykgfHwgL1tcXHMuXS8udGVzdCh0KSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkaXNwYXRjaDtcbiIsICJleHBvcnQgdmFyIHhodG1sID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gIHhodG1sOiB4aHRtbCxcbiAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICB4bWw6IFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsXG4gIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbn07XG4iLCAiaW1wb3J0IG5hbWVzcGFjZXMgZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBwcmVmaXggPSBuYW1lICs9IFwiXCIsIGkgPSBwcmVmaXguaW5kZXhPZihcIjpcIik7XG4gIGlmIChpID49IDAgJiYgKHByZWZpeCA9IG5hbWUuc2xpY2UoMCwgaSkpICE9PSBcInhtbG5zXCIpIG5hbWUgPSBuYW1lLnNsaWNlKGkgKyAxKTtcbiAgcmV0dXJuIG5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkocHJlZml4KSA/IHtzcGFjZTogbmFtZXNwYWNlc1twcmVmaXhdLCBsb2NhbDogbmFtZX0gOiBuYW1lOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xufVxuIiwgImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4vbmFtZXNwYWNlLmpzXCI7XG5pbXBvcnQge3hodG1sfSBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5cbmZ1bmN0aW9uIGNyZWF0b3JJbmhlcml0KG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2N1bWVudCA9IHRoaXMub3duZXJEb2N1bWVudCxcbiAgICAgICAgdXJpID0gdGhpcy5uYW1lc3BhY2VVUkk7XG4gICAgcmV0dXJuIHVyaSA9PT0geGh0bWwgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm5hbWVzcGFjZVVSSSA9PT0geGh0bWxcbiAgICAgICAgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpXG4gICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHVyaSwgbmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0b3JGaXhlZChmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiAoZnVsbG5hbWUubG9jYWxcbiAgICAgID8gY3JlYXRvckZpeGVkXG4gICAgICA6IGNyZWF0b3JJbmhlcml0KShmdWxsbmFtZSk7XG59XG4iLCAiZnVuY3Rpb24gbm9uZSgpIHt9XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gbm9uZSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9O1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICIvLyBHaXZlbiBzb21ldGhpbmcgYXJyYXkgbGlrZSAob3IgbnVsbCksIHJldHVybnMgc29tZXRoaW5nIHRoYXQgaXMgc3RyaWN0bHkgYW5cbi8vIGFycmF5LiBUaGlzIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgYXJyYXktbGlrZSBvYmplY3RzIHBhc3NlZCB0byBkMy5zZWxlY3RBbGxcbi8vIG9yIHNlbGVjdGlvbi5zZWxlY3RBbGwgYXJlIGNvbnZlcnRlZCBpbnRvIHByb3BlciBhcnJheXMgd2hlbiBjcmVhdGluZyBhXG4vLyBzZWxlY3Rpb247IHdlIGRvblx1MjAxOXQgZXZlciB3YW50IHRvIGNyZWF0ZSBhIHNlbGVjdGlvbiBiYWNrZWQgYnkgYSBsaXZlXG4vLyBIVE1MQ29sbGVjdGlvbiBvciBOb2RlTGlzdC4gSG93ZXZlciwgbm90ZSB0aGF0IHNlbGVjdGlvbi5zZWxlY3RBbGwgd2lsbCB1c2UgYVxuLy8gc3RhdGljIE5vZGVMaXN0IGFzIGEgZ3JvdXAsIHNpbmNlIGl0IHNhZmVseSBkZXJpdmVkIGZyb20gcXVlcnlTZWxlY3RvckFsbC5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFycmF5KHgpIHtcbiAgcmV0dXJuIHggPT0gbnVsbCA/IFtdIDogQXJyYXkuaXNBcnJheSh4KSA/IHggOiBBcnJheS5mcm9tKHgpO1xufVxuIiwgImZ1bmN0aW9uIGVtcHR5KCkge1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gZW1wdHkgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBhcnJheSBmcm9tIFwiLi4vYXJyYXkuanNcIjtcbmltcG9ydCBzZWxlY3RvckFsbCBmcm9tIFwiLi4vc2VsZWN0b3JBbGwuanNcIjtcblxuZnVuY3Rpb24gYXJyYXlBbGwoc2VsZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJyYXkoc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgPT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gYXJyYXlBbGwoc2VsZWN0KTtcbiAgZWxzZSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSk7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHBhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkTWF0Y2hlcihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBub2RlLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG4iLCAiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmQ7XG5cbmZ1bmN0aW9uIGNoaWxkRmluZChtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbmQuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNoaWxkRmlyc3QoKSB7XG4gIHJldHVybiB0aGlzLmZpcnN0RWxlbWVudENoaWxkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QobWF0Y2ggPT0gbnVsbCA/IGNoaWxkRmlyc3RcbiAgICAgIDogY2hpbGRGaW5kKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCAiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyO1xuXG5mdW5jdGlvbiBjaGlsZHJlbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jaGlsZHJlbik7XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuRmlsdGVyKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmlsdGVyLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3RBbGwobWF0Y2ggPT0gbnVsbCA/IGNoaWxkcmVuXG4gICAgICA6IGNoaWxkcmVuRmlsdGVyKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgbWF0Y2hlciBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cGRhdGUpIHtcbiAgcmV0dXJuIG5ldyBBcnJheSh1cGRhdGUubGVuZ3RoKTtcbn1cbiIsICJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9lbnRlciB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gIHRoaXMubmFtZXNwYWNlVVJJID0gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbiAgdGhpcy5fbmV4dCA9IG51bGw7XG4gIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fX2RhdGFfXyA9IGRhdHVtO1xufVxuXG5FbnRlck5vZGUucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRW50ZXJOb2RlLFxuICBhcHBlbmRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHRoaXMuX25leHQpOyB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTsgfSxcbiAgcXVlcnlTZWxlY3RvcjogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgfSxcbiAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxufTtcbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7RW50ZXJOb2RlfSBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBiaW5kSW5kZXgocGFyZW50LCBncm91cCwgZW50ZXIsIHVwZGF0ZSwgZXhpdCwgZGF0YSkge1xuICB2YXIgaSA9IDAsXG4gICAgICBub2RlLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgLy8gUHV0IGFueSBub24tbnVsbCBub2RlcyB0aGF0IGZpdCBpbnRvIHVwZGF0ZS5cbiAgLy8gUHV0IGFueSBudWxsIG5vZGVzIGludG8gZW50ZXIuXG4gIC8vIFB1dCBhbnkgcmVtYWluaW5nIGRhdGEgaW50byBlbnRlci5cbiAgZm9yICg7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZShwYXJlbnQsIGRhdGFbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBkb25cdTIwMTl0IGZpdCBpbnRvIGV4aXQuXG4gIGZvciAoOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBiaW5kS2V5KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEsIGtleSkge1xuICB2YXIgaSxcbiAgICAgIG5vZGUsXG4gICAgICBub2RlQnlLZXlWYWx1ZSA9IG5ldyBNYXAsXG4gICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgIGtleVZhbHVlcyA9IG5ldyBBcnJheShncm91cExlbmd0aCksXG4gICAgICBrZXlWYWx1ZTtcblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggbm9kZS5cbiAgLy8gSWYgbXVsdGlwbGUgbm9kZXMgaGF2ZSB0aGUgc2FtZSBrZXksIHRoZSBkdXBsaWNhdGVzIGFyZSBhZGRlZCB0byBleGl0LlxuICBmb3IgKGkgPSAwOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGtleVZhbHVlc1tpXSA9IGtleVZhbHVlID0ga2V5LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApICsgXCJcIjtcbiAgICAgIGlmIChub2RlQnlLZXlWYWx1ZS5oYXMoa2V5VmFsdWUpKSB7XG4gICAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggZGF0dW0uXG4gIC8vIElmIHRoZXJlIGEgbm9kZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXksIGpvaW4gYW5kIGFkZCBpdCB0byB1cGRhdGUuXG4gIC8vIElmIHRoZXJlIGlzIG5vdCAob3IgdGhlIGtleSBpcyBhIGR1cGxpY2F0ZSksIGFkZCBpdCB0byBlbnRlci5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgIGtleVZhbHVlID0ga2V5LmNhbGwocGFyZW50LCBkYXRhW2ldLCBpLCBkYXRhKSArIFwiXCI7XG4gICAgaWYgKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWUpKSB7XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICBub2RlQnlLZXlWYWx1ZS5kZWxldGUoa2V5VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgYW55IHJlbWFpbmluZyBub2RlcyB0aGF0IHdlcmUgbm90IGJvdW5kIHRvIGRhdGEgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZXNbaV0pID09PSBub2RlKSkge1xuICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRhdHVtKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuX19kYXRhX187XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLCBkYXR1bSk7XG5cbiAgdmFyIGJpbmQgPSBrZXkgPyBiaW5kS2V5IDogYmluZEluZGV4LFxuICAgICAgcGFyZW50cyA9IHRoaXMuX3BhcmVudHMsXG4gICAgICBncm91cHMgPSB0aGlzLl9ncm91cHM7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB2YWx1ZSA9IGNvbnN0YW50KHZhbHVlKTtcblxuICBmb3IgKHZhciBtID0gZ3JvdXBzLmxlbmd0aCwgdXBkYXRlID0gbmV3IEFycmF5KG0pLCBlbnRlciA9IG5ldyBBcnJheShtKSwgZXhpdCA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICB2YXIgcGFyZW50ID0gcGFyZW50c1tqXSxcbiAgICAgICAgZ3JvdXAgPSBncm91cHNbal0sXG4gICAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgICBkYXRhID0gYXJyYXlsaWtlKHZhbHVlLmNhbGwocGFyZW50LCBwYXJlbnQgJiYgcGFyZW50Ll9fZGF0YV9fLCBqLCBwYXJlbnRzKSksXG4gICAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgICAgZW50ZXJHcm91cCA9IGVudGVyW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICB1cGRhdGVHcm91cCA9IHVwZGF0ZVtqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgZXhpdEdyb3VwID0gZXhpdFtqXSA9IG5ldyBBcnJheShncm91cExlbmd0aCk7XG5cbiAgICBiaW5kKHBhcmVudCwgZ3JvdXAsIGVudGVyR3JvdXAsIHVwZGF0ZUdyb3VwLCBleGl0R3JvdXAsIGRhdGEsIGtleSk7XG5cbiAgICAvLyBOb3cgY29ubmVjdCB0aGUgZW50ZXIgbm9kZXMgdG8gdGhlaXIgZm9sbG93aW5nIHVwZGF0ZSBub2RlLCBzdWNoIHRoYXRcbiAgICAvLyBhcHBlbmRDaGlsZCBjYW4gaW5zZXJ0IHRoZSBtYXRlcmlhbGl6ZWQgZW50ZXIgbm9kZSBiZWZvcmUgdGhpcyBub2RlLFxuICAgIC8vIHJhdGhlciB0aGFuIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmVudCBub2RlLlxuICAgIGZvciAodmFyIGkwID0gMCwgaTEgPSAwLCBwcmV2aW91cywgbmV4dDsgaTAgPCBkYXRhTGVuZ3RoOyArK2kwKSB7XG4gICAgICBpZiAocHJldmlvdXMgPSBlbnRlckdyb3VwW2kwXSkge1xuICAgICAgICBpZiAoaTAgPj0gaTEpIGkxID0gaTAgKyAxO1xuICAgICAgICB3aGlsZSAoIShuZXh0ID0gdXBkYXRlR3JvdXBbaTFdKSAmJiArK2kxIDwgZGF0YUxlbmd0aCk7XG4gICAgICAgIHByZXZpb3VzLl9uZXh0ID0gbmV4dCB8fCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSA9IG5ldyBTZWxlY3Rpb24odXBkYXRlLCBwYXJlbnRzKTtcbiAgdXBkYXRlLl9lbnRlciA9IGVudGVyO1xuICB1cGRhdGUuX2V4aXQgPSBleGl0O1xuICByZXR1cm4gdXBkYXRlO1xufVxuXG4vLyBHaXZlbiBzb21lIGRhdGEsIHRoaXMgcmV0dXJucyBhbiBhcnJheS1saWtlIHZpZXcgb2YgaXQ6IGFuIG9iamVjdCB0aGF0XG4vLyBleHBvc2VzIGEgbGVuZ3RoIHByb3BlcnR5IGFuZCBhbGxvd3MgbnVtZXJpYyBpbmRleGluZy4gTm90ZSB0aGF0IHVubGlrZVxuLy8gc2VsZWN0QWxsLCB0aGlzIGlzblx1MjAxOXQgd29ycmllZCBhYm91dCBcdTIwMUNsaXZlXHUyMDFEIGNvbGxlY3Rpb25zIGJlY2F1c2UgdGhlIHJlc3VsdGluZ1xuLy8gYXJyYXkgd2lsbCBvbmx5IGJlIHVzZWQgYnJpZWZseSB3aGlsZSBkYXRhIGlzIGJlaW5nIGJvdW5kLiAoSXQgaXMgcG9zc2libGUgdG9cbi8vIGNhdXNlIHRoZSBkYXRhIHRvIGNoYW5nZSB3aGlsZSBpdGVyYXRpbmcgYnkgdXNpbmcgYSBrZXkgZnVuY3Rpb24sIGJ1dCBwbGVhc2Vcbi8vIGRvblx1MjAxOXQ7IHdlXHUyMDE5ZCByYXRoZXIgYXZvaWQgYSBncmF0dWl0b3VzIGNvcHkuKVxuZnVuY3Rpb24gYXJyYXlsaWtlKGRhdGEpIHtcbiAgcmV0dXJuIHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiICYmIFwibGVuZ3RoXCIgaW4gZGF0YVxuICAgID8gZGF0YSAvLyBBcnJheSwgVHlwZWRBcnJheSwgTm9kZUxpc3QsIGFycmF5LWxpa2VcbiAgICA6IEFycmF5LmZyb20oZGF0YSk7IC8vIE1hcCwgU2V0LCBpdGVyYWJsZSwgc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG59XG4iLCAiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZXhpdCB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9uZW50ZXIsIG9udXBkYXRlLCBvbmV4aXQpIHtcbiAgdmFyIGVudGVyID0gdGhpcy5lbnRlcigpLCB1cGRhdGUgPSB0aGlzLCBleGl0ID0gdGhpcy5leGl0KCk7XG4gIGlmICh0eXBlb2Ygb25lbnRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZW50ZXIgPSBvbmVudGVyKGVudGVyKTtcbiAgICBpZiAoZW50ZXIpIGVudGVyID0gZW50ZXIuc2VsZWN0aW9uKCk7XG4gIH0gZWxzZSB7XG4gICAgZW50ZXIgPSBlbnRlci5hcHBlbmQob25lbnRlciArIFwiXCIpO1xuICB9XG4gIGlmIChvbnVwZGF0ZSAhPSBudWxsKSB7XG4gICAgdXBkYXRlID0gb251cGRhdGUodXBkYXRlKTtcbiAgICBpZiAodXBkYXRlKSB1cGRhdGUgPSB1cGRhdGUuc2VsZWN0aW9uKCk7XG4gIH1cbiAgaWYgKG9uZXhpdCA9PSBudWxsKSBleGl0LnJlbW92ZSgpOyBlbHNlIG9uZXhpdChleGl0KTtcbiAgcmV0dXJuIGVudGVyICYmIHVwZGF0ZSA/IGVudGVyLm1lcmdlKHVwZGF0ZSkub3JkZXIoKSA6IHVwZGF0ZTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICB2YXIgc2VsZWN0aW9uID0gY29udGV4dC5zZWxlY3Rpb24gPyBjb250ZXh0LnNlbGVjdGlvbigpIDogY29udGV4dDtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gc2VsZWN0aW9uLl9ncm91cHMsIG0wID0gZ3JvdXBzMC5sZW5ndGgsIG0xID0gZ3JvdXBzMS5sZW5ndGgsIG0gPSBNYXRoLm1pbihtMCwgbTEpLCBtZXJnZXMgPSBuZXcgQXJyYXkobTApLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwMCA9IGdyb3VwczBbal0sIGdyb3VwMSA9IGdyb3VwczFbal0sIG4gPSBncm91cDAubGVuZ3RoLCBtZXJnZSA9IG1lcmdlc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXAwW2ldIHx8IGdyb3VwMVtpXSkge1xuICAgICAgICBtZXJnZVtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IGogPCBtMDsgKytqKSB7XG4gICAgbWVyZ2VzW2pdID0gZ3JvdXBzMFtqXTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gLTEsIG0gPSBncm91cHMubGVuZ3RoOyArK2ogPCBtOykge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDspIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgaWYgKG5leHQgJiYgbm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuZXh0KSBeIDQpIG5leHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbmV4dCk7XG4gICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb21wYXJlKSB7XG4gIGlmICghY29tcGFyZSkgY29tcGFyZSA9IGFzY2VuZGluZztcblxuICBmdW5jdGlvbiBjb21wYXJlTm9kZShhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiA/IGNvbXBhcmUoYS5fX2RhdGFfXywgYi5fX2RhdGFfXykgOiAhYSAtICFiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc29ydGdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc29ydGdyb3VwID0gc29ydGdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc29ydGdyb3VwW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydGdyb3VwLnNvcnQoY29tcGFyZU5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc29ydGdyb3VwcywgdGhpcy5fcGFyZW50cykub3JkZXIoKTtcbn1cblxuZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gIGFyZ3VtZW50c1swXSA9IHRoaXM7XG4gIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIG5vZGUgPSBncm91cFtpXTtcbiAgICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgbGV0IHNpemUgPSAwO1xuICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcykgKytzaXplOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiBzaXplO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMubm9kZSgpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIGNhbGxiYWNrLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwgImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4uL25hbWVzcGFjZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHYpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLm5vZGUoKTtcbiAgICByZXR1cm4gZnVsbG5hbWUubG9jYWxcbiAgICAgICAgPyBub2RlLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbClcbiAgICAgICAgOiBub2RlLmdldEF0dHJpYnV0ZShmdWxsbmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkpKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwgImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlLCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICBlbHNlIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdiwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICA/IHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgICAgICAgPyBzdHlsZVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICA/IHN0eWxlRnVuY3Rpb25cbiAgICAgICAgICAgIDogc3R5bGVDb25zdGFudCkobmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKVxuICAgICAgOiBzdHlsZVZhbHVlKHRoaXMubm9kZSgpLCBuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0eWxlVmFsdWUobm9kZSwgbmFtZSkge1xuICByZXR1cm4gbm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpXG4gICAgICB8fCBkZWZhdWx0Vmlldyhub2RlKS5nZXRDb21wdXRlZFN0eWxlKG5vZGUsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG59XG4iLCAiZnVuY3Rpb24gcHJvcGVydHlSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXNbbmFtZV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5Q29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgIGVsc2UgdGhpc1tuYW1lXSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHByb3BlcnR5UmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHByb3BlcnR5RnVuY3Rpb25cbiAgICAgICAgICA6IHByb3BlcnR5Q29uc3RhbnQpKG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKClbbmFtZV07XG59XG4iLCAiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLCAiZnVuY3Rpb24gdGV4dFJlbW92ZSgpIHtcbiAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIHRleHRDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyB0ZXh0UmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyB0ZXh0RnVuY3Rpb25cbiAgICAgICAgICA6IHRleHRDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS50ZXh0Q29udGVudDtcbn1cbiIsICJmdW5jdGlvbiBodG1sUmVtb3ZlKCkge1xuICB0aGlzLmlubmVySFRNTCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGh0bWxDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaHRtbEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IGh0bWxSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGh0bWxGdW5jdGlvblxuICAgICAgICAgIDogaHRtbENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLmlubmVySFRNTDtcbn1cbiIsICJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwgImZ1bmN0aW9uIGxvd2VyKCkge1xuICBpZiAodGhpcy5wcmV2aW91c1NpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcywgdGhpcy5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChsb3dlcik7XG59XG4iLCAiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kQ2hpbGQoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9KTtcbn1cbiIsICJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwgImZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChyZW1vdmUpO1xufVxuIiwgImZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZVNoYWxsb3coKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKGZhbHNlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lRGVlcCgpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUodHJ1ZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGRlZXApIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGRlZXAgPyBzZWxlY3Rpb25fY2xvbmVEZWVwIDogc2VsZWN0aW9uX2Nsb25lU2hhbGxvdyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKVxuICAgICAgOiB0aGlzLm5vZGUoKS5fX2RhdGFfXztcbn1cbiIsICJmdW5jdGlvbiBjb250ZXh0TGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCwgdGhpcy5fX2RhdGFfXyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uUmVtb3ZlKHR5cGVuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb247XG4gICAgaWYgKCFvbikgcmV0dXJuO1xuICAgIGZvciAodmFyIGogPSAwLCBpID0gLTEsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGlmIChvID0gb25bal0sICghdHlwZW5hbWUudHlwZSB8fCBvLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUpICYmIG8ubmFtZSA9PT0gdHlwZW5hbWUubmFtZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyLCBvLm9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb25bKytpXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgrK2kpIG9uLmxlbmd0aCA9IGk7XG4gICAgZWxzZSBkZWxldGUgdGhpcy5fX29uO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbkFkZCh0eXBlbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbiwgbywgbGlzdGVuZXIgPSBjb250ZXh0TGlzdGVuZXIodmFsdWUpO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICAgIGlmICgobyA9IG9uW2pdKS50eXBlID09PSB0eXBlbmFtZS50eXBlICYmIG8ubmFtZSA9PT0gdHlwZW5hbWUubmFtZSkge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyLCBvLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoby50eXBlLCBvLmxpc3RlbmVyID0gbGlzdGVuZXIsIG8ub3B0aW9ucyA9IG9wdGlvbnMpO1xuICAgICAgICBvLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGVuYW1lLnR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKTtcbiAgICBvID0ge3R5cGU6IHR5cGVuYW1lLnR5cGUsIG5hbWU6IHR5cGVuYW1lLm5hbWUsIHZhbHVlOiB2YWx1ZSwgbGlzdGVuZXI6IGxpc3RlbmVyLCBvcHRpb25zOiBvcHRpb25zfTtcbiAgICBpZiAoIW9uKSB0aGlzLl9fb24gPSBbb107XG4gICAgZWxzZSBvbi5wdXNoKG8pO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGVuYW1lcyA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiksIGksIG4gPSB0eXBlbmFtZXMubGVuZ3RoLCB0O1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBvbiA9IHRoaXMubm9kZSgpLl9fb247XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgZm9yIChpID0gMCwgbyA9IG9uW2pdOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICgodCA9IHR5cGVuYW1lc1tpXSkudHlwZSA9PT0gby50eXBlICYmIHQubmFtZSA9PT0gby5uYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIG8udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb24gPSB2YWx1ZSA/IG9uQWRkIDogb25SZW1vdmU7XG4gIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHRoaXMuZWFjaChvbih0eXBlbmFtZXNbaV0sIHZhbHVlLCBvcHRpb25zKSk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwgImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobm9kZSwgdHlwZSwgcGFyYW1zKSB7XG4gIHZhciB3aW5kb3cgPSBkZWZhdWx0Vmlldyhub2RlKSxcbiAgICAgIGV2ZW50ID0gd2luZG93LkN1c3RvbUV2ZW50O1xuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGV2ZW50ID0gbmV3IGV2ZW50KHR5cGUsIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgZXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICBpZiAocGFyYW1zKSBldmVudC5pbml0RXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlKSwgZXZlbnQuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgICBlbHNlIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICB9XG5cbiAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDb25zdGFudCh0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gZGlzcGF0Y2hGdW5jdGlvblxuICAgICAgOiBkaXNwYXRjaENvbnN0YW50KSh0eXBlLCBwYXJhbXMpKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB5aWVsZCBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCBzZWxlY3Rpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdENoaWxkIGZyb20gXCIuL3NlbGVjdENoaWxkLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuIGZyb20gXCIuL3NlbGVjdENoaWxkcmVuLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0YSBmcm9tIFwiLi9kYXRhLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VudGVyIGZyb20gXCIuL2VudGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2V4aXQgZnJvbSBcIi4vZXhpdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9qb2luIGZyb20gXCIuL2pvaW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fb3JkZXIgZnJvbSBcIi4vb3JkZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc29ydCBmcm9tIFwiLi9zb3J0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NhbGwgZnJvbSBcIi4vY2FsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9ub2RlcyBmcm9tIFwiLi9ub2Rlcy5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9ub2RlIGZyb20gXCIuL25vZGUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2l6ZSBmcm9tIFwiLi9zaXplLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VtcHR5IGZyb20gXCIuL2VtcHR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2VhY2ggZnJvbSBcIi4vZWFjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcHJvcGVydHkgZnJvbSBcIi4vcHJvcGVydHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2xhc3NlZCBmcm9tIFwiLi9jbGFzc2VkLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3RleHQgZnJvbSBcIi4vdGV4dC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9odG1sIGZyb20gXCIuL2h0bWwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmFpc2UgZnJvbSBcIi4vcmFpc2UuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbG93ZXIgZnJvbSBcIi4vbG93ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXBwZW5kIGZyb20gXCIuL2FwcGVuZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pbnNlcnQgZnJvbSBcIi4vaW5zZXJ0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JlbW92ZSBmcm9tIFwiLi9yZW1vdmUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2xvbmUgZnJvbSBcIi4vY2xvbmUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGF0dW0gZnJvbSBcIi4vZGF0dW0uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fb24gZnJvbSBcIi4vb24uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZGlzcGF0Y2ggZnJvbSBcIi4vZGlzcGF0Y2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faXRlcmF0b3IgZnJvbSBcIi4vaXRlcmF0b3IuanNcIjtcblxuZXhwb3J0IHZhciByb290ID0gW251bGxdO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0aW9uKGdyb3VwcywgcGFyZW50cykge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XV0sIHJvb3QpO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fc2VsZWN0aW9uKCkge1xuICByZXR1cm4gdGhpcztcbn1cblxuU2VsZWN0aW9uLnByb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZWxlY3Rpb24sXG4gIHNlbGVjdDogc2VsZWN0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiBzZWxlY3Rpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3NlbGVjdENoaWxkLFxuICBzZWxlY3RDaGlsZHJlbjogc2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHNlbGVjdGlvbl9maWx0ZXIsXG4gIGRhdGE6IHNlbGVjdGlvbl9kYXRhLFxuICBlbnRlcjogc2VsZWN0aW9uX2VudGVyLFxuICBleGl0OiBzZWxlY3Rpb25fZXhpdCxcbiAgam9pbjogc2VsZWN0aW9uX2pvaW4sXG4gIG1lcmdlOiBzZWxlY3Rpb25fbWVyZ2UsXG4gIHNlbGVjdGlvbjogc2VsZWN0aW9uX3NlbGVjdGlvbixcbiAgb3JkZXI6IHNlbGVjdGlvbl9vcmRlcixcbiAgc29ydDogc2VsZWN0aW9uX3NvcnQsXG4gIGNhbGw6IHNlbGVjdGlvbl9jYWxsLFxuICBub2Rlczogc2VsZWN0aW9uX25vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fbm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3NpemUsXG4gIGVtcHR5OiBzZWxlY3Rpb25fZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9lYWNoLFxuICBhdHRyOiBzZWxlY3Rpb25fYXR0cixcbiAgc3R5bGU6IHNlbGVjdGlvbl9zdHlsZSxcbiAgcHJvcGVydHk6IHNlbGVjdGlvbl9wcm9wZXJ0eSxcbiAgY2xhc3NlZDogc2VsZWN0aW9uX2NsYXNzZWQsXG4gIHRleHQ6IHNlbGVjdGlvbl90ZXh0LFxuICBodG1sOiBzZWxlY3Rpb25faHRtbCxcbiAgcmFpc2U6IHNlbGVjdGlvbl9yYWlzZSxcbiAgbG93ZXI6IHNlbGVjdGlvbl9sb3dlcixcbiAgYXBwZW5kOiBzZWxlY3Rpb25fYXBwZW5kLFxuICBpbnNlcnQ6IHNlbGVjdGlvbl9pbnNlcnQsXG4gIHJlbW92ZTogc2VsZWN0aW9uX3JlbW92ZSxcbiAgY2xvbmU6IHNlbGVjdGlvbl9jbG9uZSxcbiAgZGF0dW06IHNlbGVjdGlvbl9kYXR1bSxcbiAgb246IHNlbGVjdGlvbl9vbixcbiAgZGlzcGF0Y2g6IHNlbGVjdGlvbl9kaXNwYXRjaCxcbiAgW1N5bWJvbC5pdGVyYXRvcl06IHNlbGVjdGlvbl9pdGVyYXRvclxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VsZWN0aW9uO1xuIiwgImltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcildXSwgW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF0pXG4gICAgICA6IG5ldyBTZWxlY3Rpb24oW1tzZWxlY3Rvcl1dLCByb290KTtcbn1cbiIsICJpbXBvcnQgYXJyYXkgZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFthcnJheShzZWxlY3RvcildLCByb290KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZmFjdG9yeSwgcHJvdG90eXBlKSB7XG4gIGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZhY3RvcnkucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICBwcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChwYXJlbnQsIGRlZmluaXRpb24pIHtcbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSBwcm90b3R5cGVba2V5XSA9IGRlZmluaXRpb25ba2V5XTtcbiAgcmV0dXJuIHByb3RvdHlwZTtcbn1cbiIsICJpbXBvcnQgZGVmaW5lLCB7ZXh0ZW5kfSBmcm9tIFwiLi9kZWZpbmUuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIENvbG9yKCkge31cblxuZXhwb3J0IHZhciBkYXJrZXIgPSAwLjc7XG5leHBvcnQgdmFyIGJyaWdodGVyID0gMSAvIGRhcmtlcjtcblxudmFyIHJlSSA9IFwiXFxcXHMqKFsrLV0/XFxcXGQrKVxcXFxzKlwiLFxuICAgIHJlTiA9IFwiXFxcXHMqKFsrLV0/KD86XFxcXGQqXFxcXC4pP1xcXFxkKyg/OltlRV1bKy1dP1xcXFxkKyk/KVxcXFxzKlwiLFxuICAgIHJlUCA9IFwiXFxcXHMqKFsrLV0/KD86XFxcXGQqXFxcXC4pP1xcXFxkKyg/OltlRV1bKy1dP1xcXFxkKyk/KSVcXFxccypcIixcbiAgICByZUhleCA9IC9eIyhbMC05YS1mXXszLDh9KSQvLFxuICAgIHJlUmdiSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVJfSwke3JlSX0sJHtyZUl9XFxcXCkkYCksXG4gICAgcmVSZ2JQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYlxcXFwoJHtyZVB9LCR7cmVQfSwke3JlUH1cXFxcKSRgKSxcbiAgICByZVJnYmFJbnRlZ2VyID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVJfSwke3JlSX0sJHtyZUl9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlUmdiYVBlcmNlbnQgPSBuZXcgUmVnRXhwKGBecmdiYVxcXFwoJHtyZVB9LCR7cmVQfSwke3JlUH0sJHtyZU59XFxcXCkkYCksXG4gICAgcmVIc2xQZXJjZW50ID0gbmV3IFJlZ0V4cChgXmhzbFxcXFwoJHtyZU59LCR7cmVQfSwke3JlUH1cXFxcKSRgKSxcbiAgICByZUhzbGFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXmhzbGFcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApO1xuXG52YXIgbmFtZWQgPSB7XG4gIGFsaWNlYmx1ZTogMHhmMGY4ZmYsXG4gIGFudGlxdWV3aGl0ZTogMHhmYWViZDcsXG4gIGFxdWE6IDB4MDBmZmZmLFxuICBhcXVhbWFyaW5lOiAweDdmZmZkNCxcbiAgYXp1cmU6IDB4ZjBmZmZmLFxuICBiZWlnZTogMHhmNWY1ZGMsXG4gIGJpc3F1ZTogMHhmZmU0YzQsXG4gIGJsYWNrOiAweDAwMDAwMCxcbiAgYmxhbmNoZWRhbG1vbmQ6IDB4ZmZlYmNkLFxuICBibHVlOiAweDAwMDBmZixcbiAgYmx1ZXZpb2xldDogMHg4YTJiZTIsXG4gIGJyb3duOiAweGE1MmEyYSxcbiAgYnVybHl3b29kOiAweGRlYjg4NyxcbiAgY2FkZXRibHVlOiAweDVmOWVhMCxcbiAgY2hhcnRyZXVzZTogMHg3ZmZmMDAsXG4gIGNob2NvbGF0ZTogMHhkMjY5MWUsXG4gIGNvcmFsOiAweGZmN2Y1MCxcbiAgY29ybmZsb3dlcmJsdWU6IDB4NjQ5NWVkLFxuICBjb3Juc2lsazogMHhmZmY4ZGMsXG4gIGNyaW1zb246IDB4ZGMxNDNjLFxuICBjeWFuOiAweDAwZmZmZixcbiAgZGFya2JsdWU6IDB4MDAwMDhiLFxuICBkYXJrY3lhbjogMHgwMDhiOGIsXG4gIGRhcmtnb2xkZW5yb2Q6IDB4Yjg4NjBiLFxuICBkYXJrZ3JheTogMHhhOWE5YTksXG4gIGRhcmtncmVlbjogMHgwMDY0MDAsXG4gIGRhcmtncmV5OiAweGE5YTlhOSxcbiAgZGFya2toYWtpOiAweGJkYjc2YixcbiAgZGFya21hZ2VudGE6IDB4OGIwMDhiLFxuICBkYXJrb2xpdmVncmVlbjogMHg1NTZiMmYsXG4gIGRhcmtvcmFuZ2U6IDB4ZmY4YzAwLFxuICBkYXJrb3JjaGlkOiAweDk5MzJjYyxcbiAgZGFya3JlZDogMHg4YjAwMDAsXG4gIGRhcmtzYWxtb246IDB4ZTk5NjdhLFxuICBkYXJrc2VhZ3JlZW46IDB4OGZiYzhmLFxuICBkYXJrc2xhdGVibHVlOiAweDQ4M2Q4YixcbiAgZGFya3NsYXRlZ3JheTogMHgyZjRmNGYsXG4gIGRhcmtzbGF0ZWdyZXk6IDB4MmY0ZjRmLFxuICBkYXJrdHVycXVvaXNlOiAweDAwY2VkMSxcbiAgZGFya3Zpb2xldDogMHg5NDAwZDMsXG4gIGRlZXBwaW5rOiAweGZmMTQ5MyxcbiAgZGVlcHNreWJsdWU6IDB4MDBiZmZmLFxuICBkaW1ncmF5OiAweDY5Njk2OSxcbiAgZGltZ3JleTogMHg2OTY5NjksXG4gIGRvZGdlcmJsdWU6IDB4MWU5MGZmLFxuICBmaXJlYnJpY2s6IDB4YjIyMjIyLFxuICBmbG9yYWx3aGl0ZTogMHhmZmZhZjAsXG4gIGZvcmVzdGdyZWVuOiAweDIyOGIyMixcbiAgZnVjaHNpYTogMHhmZjAwZmYsXG4gIGdhaW5zYm9ybzogMHhkY2RjZGMsXG4gIGdob3N0d2hpdGU6IDB4ZjhmOGZmLFxuICBnb2xkOiAweGZmZDcwMCxcbiAgZ29sZGVucm9kOiAweGRhYTUyMCxcbiAgZ3JheTogMHg4MDgwODAsXG4gIGdyZWVuOiAweDAwODAwMCxcbiAgZ3JlZW55ZWxsb3c6IDB4YWRmZjJmLFxuICBncmV5OiAweDgwODA4MCxcbiAgaG9uZXlkZXc6IDB4ZjBmZmYwLFxuICBob3RwaW5rOiAweGZmNjliNCxcbiAgaW5kaWFucmVkOiAweGNkNWM1YyxcbiAgaW5kaWdvOiAweDRiMDA4MixcbiAgaXZvcnk6IDB4ZmZmZmYwLFxuICBraGFraTogMHhmMGU2OGMsXG4gIGxhdmVuZGVyOiAweGU2ZTZmYSxcbiAgbGF2ZW5kZXJibHVzaDogMHhmZmYwZjUsXG4gIGxhd25ncmVlbjogMHg3Y2ZjMDAsXG4gIGxlbW9uY2hpZmZvbjogMHhmZmZhY2QsXG4gIGxpZ2h0Ymx1ZTogMHhhZGQ4ZTYsXG4gIGxpZ2h0Y29yYWw6IDB4ZjA4MDgwLFxuICBsaWdodGN5YW46IDB4ZTBmZmZmLFxuICBsaWdodGdvbGRlbnJvZHllbGxvdzogMHhmYWZhZDIsXG4gIGxpZ2h0Z3JheTogMHhkM2QzZDMsXG4gIGxpZ2h0Z3JlZW46IDB4OTBlZTkwLFxuICBsaWdodGdyZXk6IDB4ZDNkM2QzLFxuICBsaWdodHBpbms6IDB4ZmZiNmMxLFxuICBsaWdodHNhbG1vbjogMHhmZmEwN2EsXG4gIGxpZ2h0c2VhZ3JlZW46IDB4MjBiMmFhLFxuICBsaWdodHNreWJsdWU6IDB4ODdjZWZhLFxuICBsaWdodHNsYXRlZ3JheTogMHg3Nzg4OTksXG4gIGxpZ2h0c2xhdGVncmV5OiAweDc3ODg5OSxcbiAgbGlnaHRzdGVlbGJsdWU6IDB4YjBjNGRlLFxuICBsaWdodHllbGxvdzogMHhmZmZmZTAsXG4gIGxpbWU6IDB4MDBmZjAwLFxuICBsaW1lZ3JlZW46IDB4MzJjZDMyLFxuICBsaW5lbjogMHhmYWYwZTYsXG4gIG1hZ2VudGE6IDB4ZmYwMGZmLFxuICBtYXJvb246IDB4ODAwMDAwLFxuICBtZWRpdW1hcXVhbWFyaW5lOiAweDY2Y2RhYSxcbiAgbWVkaXVtYmx1ZTogMHgwMDAwY2QsXG4gIG1lZGl1bW9yY2hpZDogMHhiYTU1ZDMsXG4gIG1lZGl1bXB1cnBsZTogMHg5MzcwZGIsXG4gIG1lZGl1bXNlYWdyZWVuOiAweDNjYjM3MSxcbiAgbWVkaXVtc2xhdGVibHVlOiAweDdiNjhlZSxcbiAgbWVkaXVtc3ByaW5nZ3JlZW46IDB4MDBmYTlhLFxuICBtZWRpdW10dXJxdW9pc2U6IDB4NDhkMWNjLFxuICBtZWRpdW12aW9sZXRyZWQ6IDB4YzcxNTg1LFxuICBtaWRuaWdodGJsdWU6IDB4MTkxOTcwLFxuICBtaW50Y3JlYW06IDB4ZjVmZmZhLFxuICBtaXN0eXJvc2U6IDB4ZmZlNGUxLFxuICBtb2NjYXNpbjogMHhmZmU0YjUsXG4gIG5hdmFqb3doaXRlOiAweGZmZGVhZCxcbiAgbmF2eTogMHgwMDAwODAsXG4gIG9sZGxhY2U6IDB4ZmRmNWU2LFxuICBvbGl2ZTogMHg4MDgwMDAsXG4gIG9saXZlZHJhYjogMHg2YjhlMjMsXG4gIG9yYW5nZTogMHhmZmE1MDAsXG4gIG9yYW5nZXJlZDogMHhmZjQ1MDAsXG4gIG9yY2hpZDogMHhkYTcwZDYsXG4gIHBhbGVnb2xkZW5yb2Q6IDB4ZWVlOGFhLFxuICBwYWxlZ3JlZW46IDB4OThmYjk4LFxuICBwYWxldHVycXVvaXNlOiAweGFmZWVlZSxcbiAgcGFsZXZpb2xldHJlZDogMHhkYjcwOTMsXG4gIHBhcGF5YXdoaXA6IDB4ZmZlZmQ1LFxuICBwZWFjaHB1ZmY6IDB4ZmZkYWI5LFxuICBwZXJ1OiAweGNkODUzZixcbiAgcGluazogMHhmZmMwY2IsXG4gIHBsdW06IDB4ZGRhMGRkLFxuICBwb3dkZXJibHVlOiAweGIwZTBlNixcbiAgcHVycGxlOiAweDgwMDA4MCxcbiAgcmViZWNjYXB1cnBsZTogMHg2NjMzOTksXG4gIHJlZDogMHhmZjAwMDAsXG4gIHJvc3licm93bjogMHhiYzhmOGYsXG4gIHJveWFsYmx1ZTogMHg0MTY5ZTEsXG4gIHNhZGRsZWJyb3duOiAweDhiNDUxMyxcbiAgc2FsbW9uOiAweGZhODA3MixcbiAgc2FuZHlicm93bjogMHhmNGE0NjAsXG4gIHNlYWdyZWVuOiAweDJlOGI1NyxcbiAgc2Vhc2hlbGw6IDB4ZmZmNWVlLFxuICBzaWVubmE6IDB4YTA1MjJkLFxuICBzaWx2ZXI6IDB4YzBjMGMwLFxuICBza3libHVlOiAweDg3Y2VlYixcbiAgc2xhdGVibHVlOiAweDZhNWFjZCxcbiAgc2xhdGVncmF5OiAweDcwODA5MCxcbiAgc2xhdGVncmV5OiAweDcwODA5MCxcbiAgc25vdzogMHhmZmZhZmEsXG4gIHNwcmluZ2dyZWVuOiAweDAwZmY3ZixcbiAgc3RlZWxibHVlOiAweDQ2ODJiNCxcbiAgdGFuOiAweGQyYjQ4YyxcbiAgdGVhbDogMHgwMDgwODAsXG4gIHRoaXN0bGU6IDB4ZDhiZmQ4LFxuICB0b21hdG86IDB4ZmY2MzQ3LFxuICB0dXJxdW9pc2U6IDB4NDBlMGQwLFxuICB2aW9sZXQ6IDB4ZWU4MmVlLFxuICB3aGVhdDogMHhmNWRlYjMsXG4gIHdoaXRlOiAweGZmZmZmZixcbiAgd2hpdGVzbW9rZTogMHhmNWY1ZjUsXG4gIHllbGxvdzogMHhmZmZmMDAsXG4gIHllbGxvd2dyZWVuOiAweDlhY2QzMlxufTtcblxuZGVmaW5lKENvbG9yLCBjb2xvciwge1xuICBjb3B5KGNoYW5uZWxzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IHRoaXMuY29uc3RydWN0b3IsIHRoaXMsIGNoYW5uZWxzKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucmdiKCkuZGlzcGxheWFibGUoKTtcbiAgfSxcbiAgaGV4OiBjb2xvcl9mb3JtYXRIZXgsIC8vIERlcHJlY2F0ZWQhIFVzZSBjb2xvci5mb3JtYXRIZXguXG4gIGZvcm1hdEhleDogY29sb3JfZm9ybWF0SGV4LFxuICBmb3JtYXRIZXg4OiBjb2xvcl9mb3JtYXRIZXg4LFxuICBmb3JtYXRIc2w6IGNvbG9yX2Zvcm1hdEhzbCxcbiAgZm9ybWF0UmdiOiBjb2xvcl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiBjb2xvcl9mb3JtYXRSZ2Jcbn0pO1xuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdEhleCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXg4KCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhzbCgpIHtcbiAgcmV0dXJuIGhzbENvbnZlcnQodGhpcykuZm9ybWF0SHNsKCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdFJnYigpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0UmdiKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbG9yKGZvcm1hdCkge1xuICB2YXIgbSwgbDtcbiAgZm9ybWF0ID0gKGZvcm1hdCArIFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gKG0gPSByZUhleC5leGVjKGZvcm1hdCkpID8gKGwgPSBtWzFdLmxlbmd0aCwgbSA9IHBhcnNlSW50KG1bMV0sIDE2KSwgbCA9PT0gNiA/IHJnYm4obSkgLy8gI2ZmMDAwMFxuICAgICAgOiBsID09PSAzID8gbmV3IFJnYigobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKG0gJiAweGYpIDw8IDQpIHwgKG0gJiAweGYpLCAxKSAvLyAjZjAwXG4gICAgICA6IGwgPT09IDggPyByZ2JhKG0gPj4gMjQgJiAweGZmLCBtID4+IDE2ICYgMHhmZiwgbSA+PiA4ICYgMHhmZiwgKG0gJiAweGZmKSAvIDB4ZmYpIC8vICNmZjAwMDAwMFxuICAgICAgOiBsID09PSA0ID8gcmdiYSgobSA+PiAxMiAmIDB4ZikgfCAobSA+PiA4ICYgMHhmMCksIChtID4+IDggJiAweGYpIHwgKG0gPj4gNCAmIDB4ZjApLCAobSA+PiA0ICYgMHhmKSB8IChtICYgMHhmMCksICgoKG0gJiAweGYpIDw8IDQpIHwgKG0gJiAweGYpKSAvIDB4ZmYpIC8vICNmMDAwXG4gICAgICA6IG51bGwpIC8vIGludmFsaWQgaGV4XG4gICAgICA6IChtID0gcmVSZ2JJbnRlZ2VyLmV4ZWMoZm9ybWF0KSkgPyBuZXcgUmdiKG1bMV0sIG1bMl0sIG1bM10sIDEpIC8vIHJnYigyNTUsIDAsIDApXG4gICAgICA6IChtID0gcmVSZ2JQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBuZXcgUmdiKG1bMV0gKiAyNTUgLyAxMDAsIG1bMl0gKiAyNTUgLyAxMDAsIG1bM10gKiAyNTUgLyAxMDAsIDEpIC8vIHJnYigxMDAlLCAwJSwgMCUpXG4gICAgICA6IChtID0gcmVSZ2JhSW50ZWdlci5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdLCBtWzJdLCBtWzNdLCBtWzRdKSAvLyByZ2JhKDI1NSwgMCwgMCwgMSlcbiAgICAgIDogKG0gPSByZVJnYmFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyByZ2JhKG1bMV0gKiAyNTUgLyAxMDAsIG1bMl0gKiAyNTUgLyAxMDAsIG1bM10gKiAyNTUgLyAxMDAsIG1bNF0pIC8vIHJnYigxMDAlLCAwJSwgMCUsIDEpXG4gICAgICA6IChtID0gcmVIc2xQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIDEpIC8vIGhzbCgxMjAsIDUwJSwgNTAlKVxuICAgICAgOiAobSA9IHJlSHNsYVBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IGhzbGEobVsxXSwgbVsyXSAvIDEwMCwgbVszXSAvIDEwMCwgbVs0XSkgLy8gaHNsYSgxMjAsIDUwJSwgNTAlLCAxKVxuICAgICAgOiBuYW1lZC5oYXNPd25Qcm9wZXJ0eShmb3JtYXQpID8gcmdibihuYW1lZFtmb3JtYXRdKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICAgICAgOiBmb3JtYXQgPT09IFwidHJhbnNwYXJlbnRcIiA/IG5ldyBSZ2IoTmFOLCBOYU4sIE5hTiwgMClcbiAgICAgIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gcmdibihuKSB7XG4gIHJldHVybiBuZXcgUmdiKG4gPj4gMTYgJiAweGZmLCBuID4+IDggJiAweGZmLCBuICYgMHhmZiwgMSk7XG59XG5cbmZ1bmN0aW9uIHJnYmEociwgZywgYiwgYSkge1xuICBpZiAoYSA8PSAwKSByID0gZyA9IGIgPSBOYU47XG4gIHJldHVybiBuZXcgUmdiKHIsIGcsIGIsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiQ29udmVydChvKSB7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBDb2xvcikpIG8gPSBjb2xvcihvKTtcbiAgaWYgKCFvKSByZXR1cm4gbmV3IFJnYjtcbiAgbyA9IG8ucmdiKCk7XG4gIHJldHVybiBuZXcgUmdiKG8uciwgby5nLCBvLmIsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IHJnYkNvbnZlcnQocikgOiBuZXcgUmdiKHIsIGcsIGIsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJnYihyLCBnLCBiLCBvcGFjaXR5KSB7XG4gIHRoaXMuciA9ICtyO1xuICB0aGlzLmcgPSArZztcbiAgdGhpcy5iID0gK2I7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoUmdiLCByZ2IsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGJyaWdodGVyIDogTWF0aC5wb3coYnJpZ2h0ZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBSZ2IodGhpcy5yICogaywgdGhpcy5nICogaywgdGhpcy5iICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgcmdiKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjbGFtcCgpIHtcbiAgICByZXR1cm4gbmV3IFJnYihjbGFtcGkodGhpcy5yKSwgY2xhbXBpKHRoaXMuZyksIGNsYW1waSh0aGlzLmIpLCBjbGFtcGEodGhpcy5vcGFjaXR5KSk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiAoLTAuNSA8PSB0aGlzLnIgJiYgdGhpcy5yIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuZyAmJiB0aGlzLmcgPCAyNTUuNSlcbiAgICAgICAgJiYgKC0wLjUgPD0gdGhpcy5iICYmIHRoaXMuYiA8IDI1NS41KVxuICAgICAgICAmJiAoMCA8PSB0aGlzLm9wYWNpdHkgJiYgdGhpcy5vcGFjaXR5IDw9IDEpO1xuICB9LFxuICBoZXg6IHJnYl9mb3JtYXRIZXgsIC8vIERlcHJlY2F0ZWQhIFVzZSBjb2xvci5mb3JtYXRIZXguXG4gIGZvcm1hdEhleDogcmdiX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogcmdiX2Zvcm1hdEhleDgsXG4gIGZvcm1hdFJnYjogcmdiX2Zvcm1hdFJnYixcbiAgdG9TdHJpbmc6IHJnYl9mb3JtYXRSZ2Jcbn0pKTtcblxuZnVuY3Rpb24gcmdiX2Zvcm1hdEhleCgpIHtcbiAgcmV0dXJuIGAjJHtoZXgodGhpcy5yKX0ke2hleCh0aGlzLmcpfSR7aGV4KHRoaXMuYil9YDtcbn1cblxuZnVuY3Rpb24gcmdiX2Zvcm1hdEhleDgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfSR7aGV4KChpc05hTih0aGlzLm9wYWNpdHkpID8gMSA6IHRoaXMub3BhY2l0eSkgKiAyNTUpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRSZ2IoKSB7XG4gIGNvbnN0IGEgPSBjbGFtcGEodGhpcy5vcGFjaXR5KTtcbiAgcmV0dXJuIGAke2EgPT09IDEgPyBcInJnYihcIiA6IFwicmdiYShcIn0ke2NsYW1waSh0aGlzLnIpfSwgJHtjbGFtcGkodGhpcy5nKX0sICR7Y2xhbXBpKHRoaXMuYil9JHthID09PSAxID8gXCIpXCIgOiBgLCAke2F9KWB9YDtcbn1cblxuZnVuY3Rpb24gY2xhbXBhKG9wYWNpdHkpIHtcbiAgcmV0dXJuIGlzTmFOKG9wYWNpdHkpID8gMSA6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIG9wYWNpdHkpKTtcbn1cblxuZnVuY3Rpb24gY2xhbXBpKHZhbHVlKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQodmFsdWUpIHx8IDApKTtcbn1cblxuZnVuY3Rpb24gaGV4KHZhbHVlKSB7XG4gIHZhbHVlID0gY2xhbXBpKHZhbHVlKTtcbiAgcmV0dXJuICh2YWx1ZSA8IDE2ID8gXCIwXCIgOiBcIlwiKSArIHZhbHVlLnRvU3RyaW5nKDE2KTtcbn1cblxuZnVuY3Rpb24gaHNsYShoLCBzLCBsLCBhKSB7XG4gIGlmIChhIDw9IDApIGggPSBzID0gbCA9IE5hTjtcbiAgZWxzZSBpZiAobCA8PSAwIHx8IGwgPj0gMSkgaCA9IHMgPSBOYU47XG4gIGVsc2UgaWYgKHMgPD0gMCkgaCA9IE5hTjtcbiAgcmV0dXJuIG5ldyBIc2woaCwgcywgbCwgYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2xDb252ZXJ0KG8pIHtcbiAgaWYgKG8gaW5zdGFuY2VvZiBIc2wpIHJldHVybiBuZXcgSHNsKG8uaCwgby5zLCBvLmwsIG8ub3BhY2l0eSk7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBDb2xvcikpIG8gPSBjb2xvcihvKTtcbiAgaWYgKCFvKSByZXR1cm4gbmV3IEhzbDtcbiAgaWYgKG8gaW5zdGFuY2VvZiBIc2wpIHJldHVybiBvO1xuICBvID0gby5yZ2IoKTtcbiAgdmFyIHIgPSBvLnIgLyAyNTUsXG4gICAgICBnID0gby5nIC8gMjU1LFxuICAgICAgYiA9IG8uYiAvIDI1NSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBoID0gTmFOLFxuICAgICAgcyA9IG1heCAtIG1pbixcbiAgICAgIGwgPSAobWF4ICsgbWluKSAvIDI7XG4gIGlmIChzKSB7XG4gICAgaWYgKHIgPT09IG1heCkgaCA9IChnIC0gYikgLyBzICsgKGcgPCBiKSAqIDY7XG4gICAgZWxzZSBpZiAoZyA9PT0gbWF4KSBoID0gKGIgLSByKSAvIHMgKyAyO1xuICAgIGVsc2UgaCA9IChyIC0gZykgLyBzICsgNDtcbiAgICBzIC89IGwgPCAwLjUgPyBtYXggKyBtaW4gOiAyIC0gbWF4IC0gbWluO1xuICAgIGggKj0gNjA7XG4gIH0gZWxzZSB7XG4gICAgcyA9IGwgPiAwICYmIGwgPCAxID8gMCA6IGg7XG4gIH1cbiAgcmV0dXJuIG5ldyBIc2woaCwgcywgbCwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhzbChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gaHNsQ29udmVydChoKSA6IG5ldyBIc2woaCwgcywgbCwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5mdW5jdGlvbiBIc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICB0aGlzLmggPSAraDtcbiAgdGhpcy5zID0gK3M7XG4gIHRoaXMubCA9ICtsO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKEhzbCwgaHNsLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IEhzbCh0aGlzLmgsIHRoaXMucywgdGhpcy5sICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gZGFya2VyIDogTWF0aC5wb3coZGFya2VyLCBrKTtcbiAgICByZXR1cm4gbmV3IEhzbCh0aGlzLmgsIHRoaXMucywgdGhpcy5sICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgcmdiKCkge1xuICAgIHZhciBoID0gdGhpcy5oICUgMzYwICsgKHRoaXMuaCA8IDApICogMzYwLFxuICAgICAgICBzID0gaXNOYU4oaCkgfHwgaXNOYU4odGhpcy5zKSA/IDAgOiB0aGlzLnMsXG4gICAgICAgIGwgPSB0aGlzLmwsXG4gICAgICAgIG0yID0gbCArIChsIDwgMC41ID8gbCA6IDEgLSBsKSAqIHMsXG4gICAgICAgIG0xID0gMiAqIGwgLSBtMjtcbiAgICByZXR1cm4gbmV3IFJnYihcbiAgICAgIGhzbDJyZ2IoaCA+PSAyNDAgPyBoIC0gMjQwIDogaCArIDEyMCwgbTEsIG0yKSxcbiAgICAgIGhzbDJyZ2IoaCwgbTEsIG0yKSxcbiAgICAgIGhzbDJyZ2IoaCA8IDEyMCA/IGggKyAyNDAgOiBoIC0gMTIwLCBtMSwgbTIpLFxuICAgICAgdGhpcy5vcGFjaXR5XG4gICAgKTtcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBIc2woY2xhbXBoKHRoaXMuaCksIGNsYW1wdCh0aGlzLnMpLCBjbGFtcHQodGhpcy5sKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKDAgPD0gdGhpcy5zICYmIHRoaXMucyA8PSAxIHx8IGlzTmFOKHRoaXMucykpXG4gICAgICAgICYmICgwIDw9IHRoaXMubCAmJiB0aGlzLmwgPD0gMSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgZm9ybWF0SHNsKCkge1xuICAgIGNvbnN0IGEgPSBjbGFtcGEodGhpcy5vcGFjaXR5KTtcbiAgICByZXR1cm4gYCR7YSA9PT0gMSA/IFwiaHNsKFwiIDogXCJoc2xhKFwifSR7Y2xhbXBoKHRoaXMuaCl9LCAke2NsYW1wdCh0aGlzLnMpICogMTAwfSUsICR7Y2xhbXB0KHRoaXMubCkgKiAxMDB9JSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG4gIH1cbn0pKTtcblxuZnVuY3Rpb24gY2xhbXBoKHZhbHVlKSB7XG4gIHZhbHVlID0gKHZhbHVlIHx8IDApICUgMzYwO1xuICByZXR1cm4gdmFsdWUgPCAwID8gdmFsdWUgKyAzNjAgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY2xhbXB0KHZhbHVlKSB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB2YWx1ZSB8fCAwKSk7XG59XG5cbi8qIEZyb20gRnZEIDEzLjM3LCBDU1MgQ29sb3IgTW9kdWxlIExldmVsIDMgKi9cbmZ1bmN0aW9uIGhzbDJyZ2IoaCwgbTEsIG0yKSB7XG4gIHJldHVybiAoaCA8IDYwID8gbTEgKyAobTIgLSBtMSkgKiBoIC8gNjBcbiAgICAgIDogaCA8IDE4MCA/IG0yXG4gICAgICA6IGggPCAyNDAgPyBtMSArIChtMiAtIG0xKSAqICgyNDAgLSBoKSAvIDYwXG4gICAgICA6IG0xKSAqIDI1NTtcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gYmFzaXModDEsIHYwLCB2MSwgdjIsIHYzKSB7XG4gIHZhciB0MiA9IHQxICogdDEsIHQzID0gdDIgKiB0MTtcbiAgcmV0dXJuICgoMSAtIDMgKiB0MSArIDMgKiB0MiAtIHQzKSAqIHYwXG4gICAgICArICg0IC0gNiAqIHQyICsgMyAqIHQzKSAqIHYxXG4gICAgICArICgxICsgMyAqIHQxICsgMyAqIHQyIC0gMyAqIHQzKSAqIHYyXG4gICAgICArIHQzICogdjMpIC8gNjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWVzKSB7XG4gIHZhciBuID0gdmFsdWVzLmxlbmd0aCAtIDE7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0IDw9IDAgPyAodCA9IDApIDogdCA+PSAxID8gKHQgPSAxLCBuIC0gMSkgOiBNYXRoLmZsb29yKHQgKiBuKSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaV0sXG4gICAgICAgIHYyID0gdmFsdWVzW2kgKyAxXSxcbiAgICAgICAgdjAgPSBpID4gMCA/IHZhbHVlc1tpIC0gMV0gOiAyICogdjEgLSB2MixcbiAgICAgICAgdjMgPSBpIDwgbiAtIDEgPyB2YWx1ZXNbaSArIDJdIDogMiAqIHYyIC0gdjE7XG4gICAgcmV0dXJuIGJhc2lzKCh0IC0gaSAvIG4pICogbiwgdjAsIHYxLCB2MiwgdjMpO1xuICB9O1xufVxuIiwgImltcG9ydCB7YmFzaXN9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlcykge1xuICB2YXIgbiA9IHZhbHVlcy5sZW5ndGg7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSBNYXRoLmZsb29yKCgodCAlPSAxKSA8IDAgPyArK3QgOiB0KSAqIG4pLFxuICAgICAgICB2MCA9IHZhbHVlc1soaSArIG4gLSAxKSAlIG5dLFxuICAgICAgICB2MSA9IHZhbHVlc1tpICUgbl0sXG4gICAgICAgIHYyID0gdmFsdWVzWyhpICsgMSkgJSBuXSxcbiAgICAgICAgdjMgPSB2YWx1ZXNbKGkgKyAyKSAlIG5dO1xuICAgIHJldHVybiBiYXNpcygodCAtIGkgLyBuKSAqIG4sIHYwLCB2MSwgdjIsIHYzKTtcbiAgfTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLCAiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGxpbmVhcihhLCBkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKyB0ICogZDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZXhwb25lbnRpYWwoYSwgYiwgeSkge1xuICByZXR1cm4gYSA9IE1hdGgucG93KGEsIHkpLCBiID0gTWF0aC5wb3coYiwgeSkgLSBhLCB5ID0gMSAvIHksIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coYSArIHQgKiBiLCB5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1ZShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQgPiAxODAgfHwgZCA8IC0xODAgPyBkIC0gMzYwICogTWF0aC5yb3VuZChkIC8gMzYwKSA6IGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1tYSh5KSB7XG4gIHJldHVybiAoeSA9ICt5KSA9PT0gMSA/IG5vZ2FtbWEgOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGIgLSBhID8gZXhwb25lbnRpYWwoYSwgYiwgeSkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9nYW1tYShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG4iLCAiaW1wb3J0IHtyZ2IgYXMgY29sb3JSZ2J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IGJhc2lzIGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5pbXBvcnQgYmFzaXNDbG9zZWQgZnJvbSBcIi4vYmFzaXNDbG9zZWQuanNcIjtcbmltcG9ydCBub2dhbW1hLCB7Z2FtbWF9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiByZ2JHYW1tYSh5KSB7XG4gIHZhciBjb2xvciA9IGdhbW1hKHkpO1xuXG4gIGZ1bmN0aW9uIHJnYihzdGFydCwgZW5kKSB7XG4gICAgdmFyIHIgPSBjb2xvcigoc3RhcnQgPSBjb2xvclJnYihzdGFydCkpLnIsIChlbmQgPSBjb2xvclJnYihlbmQpKS5yKSxcbiAgICAgICAgZyA9IGNvbG9yKHN0YXJ0LmcsIGVuZC5nKSxcbiAgICAgICAgYiA9IGNvbG9yKHN0YXJ0LmIsIGVuZC5iKSxcbiAgICAgICAgb3BhY2l0eSA9IG5vZ2FtbWEoc3RhcnQub3BhY2l0eSwgZW5kLm9wYWNpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICBzdGFydC5yID0gcih0KTtcbiAgICAgIHN0YXJ0LmcgPSBnKHQpO1xuICAgICAgc3RhcnQuYiA9IGIodCk7XG4gICAgICBzdGFydC5vcGFjaXR5ID0gb3BhY2l0eSh0KTtcbiAgICAgIHJldHVybiBzdGFydCArIFwiXCI7XG4gICAgfTtcbiAgfVxuXG4gIHJnYi5nYW1tYSA9IHJnYkdhbW1hO1xuXG4gIHJldHVybiByZ2I7XG59KSgxKTtcblxuZnVuY3Rpb24gcmdiU3BsaW5lKHNwbGluZSkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgdmFyIG4gPSBjb2xvcnMubGVuZ3RoLFxuICAgICAgICByID0gbmV3IEFycmF5KG4pLFxuICAgICAgICBnID0gbmV3IEFycmF5KG4pLFxuICAgICAgICBiID0gbmV3IEFycmF5KG4pLFxuICAgICAgICBpLCBjb2xvcjtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBjb2xvciA9IGNvbG9yUmdiKGNvbG9yc1tpXSk7XG4gICAgICByW2ldID0gY29sb3IuciB8fCAwO1xuICAgICAgZ1tpXSA9IGNvbG9yLmcgfHwgMDtcbiAgICAgIGJbaV0gPSBjb2xvci5iIHx8IDA7XG4gICAgfVxuICAgIHIgPSBzcGxpbmUocik7XG4gICAgZyA9IHNwbGluZShnKTtcbiAgICBiID0gc3BsaW5lKGIpO1xuICAgIGNvbG9yLm9wYWNpdHkgPSAxO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICBjb2xvci5yID0gcih0KTtcbiAgICAgIGNvbG9yLmcgPSBnKHQpO1xuICAgICAgY29sb3IuYiA9IGIodCk7XG4gICAgICByZXR1cm4gY29sb3IgKyBcIlwiO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB2YXIgcmdiQmFzaXMgPSByZ2JTcGxpbmUoYmFzaXMpO1xuZXhwb3J0IHZhciByZ2JCYXNpc0Nsb3NlZCA9IHJnYlNwbGluZShiYXNpc0Nsb3NlZCk7XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSAqICgxIC0gdCkgKyBiICogdDtcbiAgfTtcbn1cbiIsICJpbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG52YXIgcmVBID0gL1stK10/KD86XFxkK1xcLj9cXGQqfFxcLj9cXGQrKSg/OltlRV1bLStdP1xcZCspPy9nLFxuICAgIHJlQiA9IG5ldyBSZWdFeHAocmVBLnNvdXJjZSwgXCJnXCIpO1xuXG5mdW5jdGlvbiB6ZXJvKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiO1xuICB9O1xufVxuXG5mdW5jdGlvbiBvbmUoYikge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBiKHQpICsgXCJcIjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYmkgPSByZUEubGFzdEluZGV4ID0gcmVCLmxhc3RJbmRleCA9IDAsIC8vIHNjYW4gaW5kZXggZm9yIG5leHQgbnVtYmVyIGluIGJcbiAgICAgIGFtLCAvLyBjdXJyZW50IG1hdGNoIGluIGFcbiAgICAgIGJtLCAvLyBjdXJyZW50IG1hdGNoIGluIGJcbiAgICAgIGJzLCAvLyBzdHJpbmcgcHJlY2VkaW5nIGN1cnJlbnQgbnVtYmVyIGluIGIsIGlmIGFueVxuICAgICAgaSA9IC0xLCAvLyBpbmRleCBpbiBzXG4gICAgICBzID0gW10sIC8vIHN0cmluZyBjb25zdGFudHMgYW5kIHBsYWNlaG9sZGVyc1xuICAgICAgcSA9IFtdOyAvLyBudW1iZXIgaW50ZXJwb2xhdG9yc1xuXG4gIC8vIENvZXJjZSBpbnB1dHMgdG8gc3RyaW5ncy5cbiAgYSA9IGEgKyBcIlwiLCBiID0gYiArIFwiXCI7XG5cbiAgLy8gSW50ZXJwb2xhdGUgcGFpcnMgb2YgbnVtYmVycyBpbiBhICYgYi5cbiAgd2hpbGUgKChhbSA9IHJlQS5leGVjKGEpKVxuICAgICAgJiYgKGJtID0gcmVCLmV4ZWMoYikpKSB7XG4gICAgaWYgKChicyA9IGJtLmluZGV4KSA+IGJpKSB7IC8vIGEgc3RyaW5nIHByZWNlZGVzIHRoZSBuZXh0IG51bWJlciBpbiBiXG4gICAgICBicyA9IGIuc2xpY2UoYmksIGJzKTtcbiAgICAgIGlmIChzW2ldKSBzW2ldICs9IGJzOyAvLyBjb2FsZXNjZSB3aXRoIHByZXZpb3VzIHN0cmluZ1xuICAgICAgZWxzZSBzWysraV0gPSBicztcbiAgICB9XG4gICAgaWYgKChhbSA9IGFtWzBdKSA9PT0gKGJtID0gYm1bMF0pKSB7IC8vIG51bWJlcnMgaW4gYSAmIGIgbWF0Y2hcbiAgICAgIGlmIChzW2ldKSBzW2ldICs9IGJtOyAvLyBjb2FsZXNjZSB3aXRoIHByZXZpb3VzIHN0cmluZ1xuICAgICAgZWxzZSBzWysraV0gPSBibTtcbiAgICB9IGVsc2UgeyAvLyBpbnRlcnBvbGF0ZSBub24tbWF0Y2hpbmcgbnVtYmVyc1xuICAgICAgc1srK2ldID0gbnVsbDtcbiAgICAgIHEucHVzaCh7aTogaSwgeDogbnVtYmVyKGFtLCBibSl9KTtcbiAgICB9XG4gICAgYmkgPSByZUIubGFzdEluZGV4O1xuICB9XG5cbiAgLy8gQWRkIHJlbWFpbnMgb2YgYi5cbiAgaWYgKGJpIDwgYi5sZW5ndGgpIHtcbiAgICBicyA9IGIuc2xpY2UoYmkpO1xuICAgIGlmIChzW2ldKSBzW2ldICs9IGJzOyAvLyBjb2FsZXNjZSB3aXRoIHByZXZpb3VzIHN0cmluZ1xuICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gIH1cblxuICAvLyBTcGVjaWFsIG9wdGltaXphdGlvbiBmb3Igb25seSBhIHNpbmdsZSBtYXRjaC5cbiAgLy8gT3RoZXJ3aXNlLCBpbnRlcnBvbGF0ZSBlYWNoIG9mIHRoZSBudW1iZXJzIGFuZCByZWpvaW4gdGhlIHN0cmluZy5cbiAgcmV0dXJuIHMubGVuZ3RoIDwgMiA/IChxWzBdXG4gICAgICA/IG9uZShxWzBdLngpXG4gICAgICA6IHplcm8oYikpXG4gICAgICA6IChiID0gcS5sZW5ndGgsIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbzsgaSA8IGI7ICsraSkgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgICAgIHJldHVybiBzLmpvaW4oXCJcIik7XG4gICAgICAgIH0pO1xufVxuIiwgInZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IHtcbiAgdHJhbnNsYXRlWDogMCxcbiAgdHJhbnNsYXRlWTogMCxcbiAgcm90YXRlOiAwLFxuICBza2V3WDogMCxcbiAgc2NhbGVYOiAxLFxuICBzY2FsZVk6IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgdmFyIHNjYWxlWCwgc2NhbGVZLCBza2V3WDtcbiAgaWYgKHNjYWxlWCA9IE1hdGguc3FydChhICogYSArIGIgKiBiKSkgYSAvPSBzY2FsZVgsIGIgLz0gc2NhbGVYO1xuICBpZiAoc2tld1ggPSBhICogYyArIGIgKiBkKSBjIC09IGEgKiBza2V3WCwgZCAtPSBiICogc2tld1g7XG4gIGlmIChzY2FsZVkgPSBNYXRoLnNxcnQoYyAqIGMgKyBkICogZCkpIGMgLz0gc2NhbGVZLCBkIC89IHNjYWxlWSwgc2tld1ggLz0gc2NhbGVZO1xuICBpZiAoYSAqIGQgPCBiICogYykgYSA9IC1hLCBiID0gLWIsIHNrZXdYID0gLXNrZXdYLCBzY2FsZVggPSAtc2NhbGVYO1xuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IGUsXG4gICAgdHJhbnNsYXRlWTogZixcbiAgICByb3RhdGU6IE1hdGguYXRhbjIoYiwgYSkgKiBkZWdyZWVzLFxuICAgIHNrZXdYOiBNYXRoLmF0YW4oc2tld1gpICogZGVncmVlcyxcbiAgICBzY2FsZVg6IHNjYWxlWCxcbiAgICBzY2FsZVk6IHNjYWxlWVxuICB9O1xufVxuIiwgImltcG9ydCBkZWNvbXBvc2UsIHtpZGVudGl0eX0gZnJvbSBcIi4vZGVjb21wb3NlLmpzXCI7XG5cbnZhciBzdmdOb2RlO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ3NzKHZhbHVlKSB7XG4gIGNvbnN0IG0gPSBuZXcgKHR5cGVvZiBET01NYXRyaXggPT09IFwiZnVuY3Rpb25cIiA/IERPTU1hdHJpeCA6IFdlYktpdENTU01hdHJpeCkodmFsdWUgKyBcIlwiKTtcbiAgcmV0dXJuIG0uaXNJZGVudGl0eSA/IGlkZW50aXR5IDogZGVjb21wb3NlKG0uYSwgbS5iLCBtLmMsIG0uZCwgbS5lLCBtLmYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdmcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBpZGVudGl0eTtcbiAgaWYgKCFzdmdOb2RlKSBzdmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJnXCIpO1xuICBzdmdOb2RlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB2YWx1ZSk7XG4gIGlmICghKHZhbHVlID0gc3ZnTm9kZS50cmFuc2Zvcm0uYmFzZVZhbC5jb25zb2xpZGF0ZSgpKSkgcmV0dXJuIGlkZW50aXR5O1xuICB2YWx1ZSA9IHZhbHVlLm1hdHJpeDtcbiAgcmV0dXJuIGRlY29tcG9zZSh2YWx1ZS5hLCB2YWx1ZS5iLCB2YWx1ZS5jLCB2YWx1ZS5kLCB2YWx1ZS5lLCB2YWx1ZS5mKTtcbn1cbiIsICJpbXBvcnQgbnVtYmVyIGZyb20gXCIuLi9udW1iZXIuanNcIjtcbmltcG9ydCB7cGFyc2VDc3MsIHBhcnNlU3ZnfSBmcm9tIFwiLi9wYXJzZS5qc1wiO1xuXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZSwgcHhDb21tYSwgcHhQYXJlbiwgZGVnUGFyZW4pIHtcblxuICBmdW5jdGlvbiBwb3Aocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA/IHMucG9wKCkgKyBcIiBcIiA6IFwiXCI7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2xhdGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2goXCJ0cmFuc2xhdGUoXCIsIG51bGwsIHB4Q29tbWEsIG51bGwsIHB4UGFyZW4pO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiB8fCB5Yikge1xuICAgICAgcy5wdXNoKFwidHJhbnNsYXRlKFwiICsgeGIgKyBweENvbW1hICsgeWIgKyBweFBhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByb3RhdGUoYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBpZiAoYSAtIGIgPiAxODApIGIgKz0gMzYwOyBlbHNlIGlmIChiIC0gYSA+IDE4MCkgYSArPSAzNjA7IC8vIHNob3J0ZXN0IHBhdGhcbiAgICAgIHEucHVzaCh7aTogcy5wdXNoKHBvcChzKSArIFwicm90YXRlKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2tld1goYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiICsgYiArIGRlZ1BhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4YSwgeWEsIHhiLCB5YiwgcywgcSkge1xuICAgIGlmICh4YSAhPT0geGIgfHwgeWEgIT09IHliKSB7XG4gICAgICB2YXIgaSA9IHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiLCBudWxsLCBcIixcIiwgbnVsbCwgXCIpXCIpO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiAhPT0gMSB8fCB5YiAhPT0gMSkge1xuICAgICAgcy5wdXNoKHBvcChzKSArIFwic2NhbGUoXCIgKyB4YiArIFwiLFwiICsgeWIgKyBcIilcIik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgICAgcSA9IFtdOyAvLyBudW1iZXIgaW50ZXJwb2xhdG9yc1xuICAgIGEgPSBwYXJzZShhKSwgYiA9IHBhcnNlKGIpO1xuICAgIHRyYW5zbGF0ZShhLnRyYW5zbGF0ZVgsIGEudHJhbnNsYXRlWSwgYi50cmFuc2xhdGVYLCBiLnRyYW5zbGF0ZVksIHMsIHEpO1xuICAgIHJvdGF0ZShhLnJvdGF0ZSwgYi5yb3RhdGUsIHMsIHEpO1xuICAgIHNrZXdYKGEuc2tld1gsIGIuc2tld1gsIHMsIHEpO1xuICAgIHNjYWxlKGEuc2NhbGVYLCBhLnNjYWxlWSwgYi5zY2FsZVgsIGIuc2NhbGVZLCBzLCBxKTtcbiAgICBhID0gYiA9IG51bGw7IC8vIGdjXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBxLmxlbmd0aCwgbztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZUNzcywgXCJweCwgXCIsIFwicHgpXCIsIFwiZGVnKVwiKTtcbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZVN2ZywgXCIsIFwiLCBcIilcIiwgXCIpXCIpO1xuIiwgInZhciBmcmFtZSA9IDAsIC8vIGlzIGFuIGFuaW1hdGlvbiBmcmFtZSBwZW5kaW5nP1xuICAgIHRpbWVvdXQgPSAwLCAvLyBpcyBhIHRpbWVvdXQgcGVuZGluZz9cbiAgICBpbnRlcnZhbCA9IDAsIC8vIGFyZSBhbnkgdGltZXJzIGFjdGl2ZT9cbiAgICBwb2tlRGVsYXkgPSAxMDAwLCAvLyBob3cgZnJlcXVlbnRseSB3ZSBjaGVjayBmb3IgY2xvY2sgc2tld1xuICAgIHRhc2tIZWFkLFxuICAgIHRhc2tUYWlsLFxuICAgIGNsb2NrTGFzdCA9IDAsXG4gICAgY2xvY2tOb3cgPSAwLFxuICAgIGNsb2NrU2tldyA9IDAsXG4gICAgY2xvY2sgPSB0eXBlb2YgcGVyZm9ybWFuY2UgPT09IFwib2JqZWN0XCIgJiYgcGVyZm9ybWFuY2Uubm93ID8gcGVyZm9ybWFuY2UgOiBEYXRlLFxuICAgIHNldEZyYW1lID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBmdW5jdGlvbihmKSB7IHNldFRpbWVvdXQoZiwgMTcpOyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gY2xvY2tOb3cgfHwgKHNldEZyYW1lKGNsZWFyTm93KSwgY2xvY2tOb3cgPSBjbG9jay5ub3coKSArIGNsb2NrU2tldyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyTm93KCkge1xuICBjbG9ja05vdyA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUaW1lcigpIHtcbiAgdGhpcy5fY2FsbCA9XG4gIHRoaXMuX3RpbWUgPVxuICB0aGlzLl9uZXh0ID0gbnVsbDtcbn1cblxuVGltZXIucHJvdG90eXBlID0gdGltZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVGltZXIsXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbGxiYWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIHRpbWUgPSAodGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZSkgKyAoZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXkpO1xuICAgIGlmICghdGhpcy5fbmV4dCAmJiB0YXNrVGFpbCAhPT0gdGhpcykge1xuICAgICAgaWYgKHRhc2tUYWlsKSB0YXNrVGFpbC5fbmV4dCA9IHRoaXM7XG4gICAgICBlbHNlIHRhc2tIZWFkID0gdGhpcztcbiAgICAgIHRhc2tUYWlsID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5fY2FsbCA9IGNhbGxiYWNrO1xuICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIHNsZWVwKCk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jYWxsKSB7XG4gICAgICB0aGlzLl9jYWxsID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWUgPSBJbmZpbml0eTtcbiAgICAgIHNsZWVwKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZXIoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICB0LnJlc3RhcnQoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lckZsdXNoKCkge1xuICBub3coKTsgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWUsIGlmIG5vdCBhbHJlYWR5IHNldC5cbiAgKytmcmFtZTsgLy8gUHJldGVuZCB3ZVx1MjAxOXZlIHNldCBhbiBhbGFybSwgaWYgd2UgaGF2ZW5cdTIwMTl0IGFscmVhZHkuXG4gIHZhciB0ID0gdGFza0hlYWQsIGU7XG4gIHdoaWxlICh0KSB7XG4gICAgaWYgKChlID0gY2xvY2tOb3cgLSB0Ll90aW1lKSA+PSAwKSB0Ll9jYWxsLmNhbGwodW5kZWZpbmVkLCBlKTtcbiAgICB0ID0gdC5fbmV4dDtcbiAgfVxuICAtLWZyYW1lO1xufVxuXG5mdW5jdGlvbiB3YWtlKCkge1xuICBjbG9ja05vdyA9IChjbG9ja0xhc3QgPSBjbG9jay5ub3coKSkgKyBjbG9ja1NrZXc7XG4gIGZyYW1lID0gdGltZW91dCA9IDA7XG4gIHRyeSB7XG4gICAgdGltZXJGbHVzaCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGZyYW1lID0gMDtcbiAgICBuYXAoKTtcbiAgICBjbG9ja05vdyA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9rZSgpIHtcbiAgdmFyIG5vdyA9IGNsb2NrLm5vdygpLCBkZWxheSA9IG5vdyAtIGNsb2NrTGFzdDtcbiAgaWYgKGRlbGF5ID4gcG9rZURlbGF5KSBjbG9ja1NrZXcgLT0gZGVsYXksIGNsb2NrTGFzdCA9IG5vdztcbn1cblxuZnVuY3Rpb24gbmFwKCkge1xuICB2YXIgdDAsIHQxID0gdGFza0hlYWQsIHQyLCB0aW1lID0gSW5maW5pdHk7XG4gIHdoaWxlICh0MSkge1xuICAgIGlmICh0MS5fY2FsbCkge1xuICAgICAgaWYgKHRpbWUgPiB0MS5fdGltZSkgdGltZSA9IHQxLl90aW1lO1xuICAgICAgdDAgPSB0MSwgdDEgPSB0MS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdDIgPSB0MS5fbmV4dCwgdDEuX25leHQgPSBudWxsO1xuICAgICAgdDEgPSB0MCA/IHQwLl9uZXh0ID0gdDIgOiB0YXNrSGVhZCA9IHQyO1xuICAgIH1cbiAgfVxuICB0YXNrVGFpbCA9IHQwO1xuICBzbGVlcCh0aW1lKTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSkge1xuICBpZiAoZnJhbWUpIHJldHVybjsgLy8gU29vbmVzdCBhbGFybSBhbHJlYWR5IHNldCwgb3Igd2lsbCBiZS5cbiAgaWYgKHRpbWVvdXQpIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gIHZhciBkZWxheSA9IHRpbWUgLSBjbG9ja05vdzsgLy8gU3RyaWN0bHkgbGVzcyB0aGFuIGlmIHdlIHJlY29tcHV0ZWQgY2xvY2tOb3cuXG4gIGlmIChkZWxheSA+IDI0KSB7XG4gICAgaWYgKHRpbWUgPCBJbmZpbml0eSkgdGltZW91dCA9IHNldFRpbWVvdXQod2FrZSwgdGltZSAtIGNsb2NrLm5vdygpIC0gY2xvY2tTa2V3KTtcbiAgICBpZiAoaW50ZXJ2YWwpIGludGVydmFsID0gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpbnRlcnZhbCkgY2xvY2tMYXN0ID0gY2xvY2subm93KCksIGludGVydmFsID0gc2V0SW50ZXJ2YWwocG9rZSwgcG9rZURlbGF5KTtcbiAgICBmcmFtZSA9IDEsIHNldEZyYW1lKHdha2UpO1xuICB9XG59XG4iLCAiaW1wb3J0IHtUaW1lcn0gZnJvbSBcIi4vdGltZXIuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICBkZWxheSA9IGRlbGF5ID09IG51bGwgPyAwIDogK2RlbGF5O1xuICB0LnJlc3RhcnQoZWxhcHNlZCA9PiB7XG4gICAgdC5zdG9wKCk7XG4gICAgY2FsbGJhY2soZWxhcHNlZCArIGRlbGF5KTtcbiAgfSwgZGVsYXksIHRpbWUpO1xuICByZXR1cm4gdDtcbn1cbiIsICJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7dGltZXIsIHRpbWVvdXR9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZW1wdHlPbiA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIiwgXCJjYW5jZWxcIiwgXCJpbnRlcnJ1cHRcIik7XG52YXIgZW1wdHlUd2VlbiA9IFtdO1xuXG5leHBvcnQgdmFyIENSRUFURUQgPSAwO1xuZXhwb3J0IHZhciBTQ0hFRFVMRUQgPSAxO1xuZXhwb3J0IHZhciBTVEFSVElORyA9IDI7XG5leHBvcnQgdmFyIFNUQVJURUQgPSAzO1xuZXhwb3J0IHZhciBSVU5OSU5HID0gNDtcbmV4cG9ydCB2YXIgRU5ESU5HID0gNTtcbmV4cG9ydCB2YXIgRU5ERUQgPSA2O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lLCBpZCwgaW5kZXgsIGdyb3VwLCB0aW1pbmcpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlcykgbm9kZS5fX3RyYW5zaXRpb24gPSB7fTtcbiAgZWxzZSBpZiAoaWQgaW4gc2NoZWR1bGVzKSByZXR1cm47XG4gIGNyZWF0ZShub2RlLCBpZCwge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgaW5kZXg6IGluZGV4LCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgZ3JvdXA6IGdyb3VwLCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgb246IGVtcHR5T24sXG4gICAgdHdlZW46IGVtcHR5VHdlZW4sXG4gICAgdGltZTogdGltaW5nLnRpbWUsXG4gICAgZGVsYXk6IHRpbWluZy5kZWxheSxcbiAgICBkdXJhdGlvbjogdGltaW5nLmR1cmF0aW9uLFxuICAgIGVhc2U6IHRpbWluZy5lYXNlLFxuICAgIHRpbWVyOiBudWxsLFxuICAgIHN0YXRlOiBDUkVBVEVEXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBDUkVBVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBzY2hlZHVsZWRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBTVEFSVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBydW5uaW5nXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGUgfHwgIShzY2hlZHVsZSA9IHNjaGVkdWxlW2lkXSkpIHRocm93IG5ldyBFcnJvcihcInRyYW5zaXRpb24gbm90IGZvdW5kXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShub2RlLCBpZCwgc2VsZikge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICB0d2VlbjtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzZWxmIHRpbWVyIHdoZW4gdGhlIHRyYW5zaXRpb24gaXMgY3JlYXRlZC5cbiAgLy8gTm90ZSB0aGUgYWN0dWFsIGRlbGF5IGlzIG5vdCBrbm93biB1bnRpbCB0aGUgZmlyc3QgY2FsbGJhY2shXG4gIHNjaGVkdWxlc1tpZF0gPSBzZWxmO1xuICBzZWxmLnRpbWVyID0gdGltZXIoc2NoZWR1bGUsIDAsIHNlbGYudGltZSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoZWxhcHNlZCkge1xuICAgIHNlbGYuc3RhdGUgPSBTQ0hFRFVMRUQ7XG4gICAgc2VsZi50aW1lci5yZXN0YXJ0KHN0YXJ0LCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuXG4gICAgLy8gSWYgdGhlIGVsYXBzZWQgZGVsYXkgaXMgbGVzcyB0aGFuIG91ciBmaXJzdCBzbGVlcCwgc3RhcnQgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHNlbGYuZGVsYXkgPD0gZWxhcHNlZCkgc3RhcnQoZWxhcHNlZCAtIHNlbGYuZGVsYXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQoZWxhcHNlZCkge1xuICAgIHZhciBpLCBqLCBuLCBvO1xuXG4gICAgLy8gSWYgdGhlIHN0YXRlIGlzIG5vdCBTQ0hFRFVMRUQsIHRoZW4gd2UgcHJldmlvdXNseSBlcnJvcmVkIG9uIHN0YXJ0LlxuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTQ0hFRFVMRUQpIHJldHVybiBzdG9wKCk7XG5cbiAgICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgICBvID0gc2NoZWR1bGVzW2ldO1xuICAgICAgaWYgKG8ubmFtZSAhPT0gc2VsZi5uYW1lKSBjb250aW51ZTtcblxuICAgICAgLy8gV2hpbGUgdGhpcyBlbGVtZW50IGFscmVhZHkgaGFzIGEgc3RhcnRpbmcgdHJhbnNpdGlvbiBkdXJpbmcgdGhpcyBmcmFtZSxcbiAgICAgIC8vIGRlZmVyIHN0YXJ0aW5nIGFuIGludGVycnVwdGluZyB0cmFuc2l0aW9uIHVudGlsIHRoYXQgdHJhbnNpdGlvbiBoYXMgYVxuICAgICAgLy8gY2hhbmNlIHRvIHRpY2sgKGFuZCBwb3NzaWJseSBlbmQpOyBzZWUgZDMvZDMtdHJhbnNpdGlvbiM1NCFcbiAgICAgIGlmIChvLnN0YXRlID09PSBTVEFSVEVEKSByZXR1cm4gdGltZW91dChzdGFydCk7XG5cbiAgICAgIC8vIEludGVycnVwdCB0aGUgYWN0aXZlIHRyYW5zaXRpb24sIGlmIGFueS5cbiAgICAgIGlmIChvLnN0YXRlID09PSBSVU5OSU5HKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImludGVycnVwdFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FuY2VsIGFueSBwcmUtZW1wdGVkIHRyYW5zaXRpb25zLlxuICAgICAgZWxzZSBpZiAoK2kgPCBpZCkge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmZXIgdGhlIGZpcnN0IHRpY2sgdG8gZW5kIG9mIHRoZSBjdXJyZW50IGZyYW1lOyBzZWUgZDMvZDMjMTU3Ni5cbiAgICAvLyBOb3RlIHRoZSB0cmFuc2l0aW9uIG1heSBiZSBjYW5jZWxlZCBhZnRlciBzdGFydCBhbmQgYmVmb3JlIHRoZSBmaXJzdCB0aWNrIVxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIHNjaGVkdWxlZCBiZWZvcmUgdGhlIHN0YXJ0IGV2ZW50OyBzZWUgZDMvZDMtdHJhbnNpdGlvbiMxNiFcbiAgICAvLyBBc3N1bWluZyB0aGlzIGlzIHN1Y2Nlc3NmdWwsIHN1YnNlcXVlbnQgY2FsbGJhY2tzIGdvIHN0cmFpZ2h0IHRvIHRpY2suXG4gICAgdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLnN0YXRlID09PSBTVEFSVEVEKSB7XG4gICAgICAgIHNlbGYuc3RhdGUgPSBSVU5OSU5HO1xuICAgICAgICBzZWxmLnRpbWVyLnJlc3RhcnQodGljaywgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcbiAgICAgICAgdGljayhlbGFwc2VkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBzdGFydCBldmVudC5cbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZSB0aGUgdHdlZW4gYXJlIGluaXRpYWxpemVkLlxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVElORztcbiAgICBzZWxmLm9uLmNhbGwoXCJzdGFydFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU1RBUlRJTkcpIHJldHVybjsgLy8gaW50ZXJydXB0ZWRcbiAgICBzZWxmLnN0YXRlID0gU1RBUlRFRDtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHR3ZWVuLCBkZWxldGluZyBudWxsIHR3ZWVuLlxuICAgIHR3ZWVuID0gbmV3IEFycmF5KG4gPSBzZWxmLnR3ZWVuLmxlbmd0aCk7XG4gICAgZm9yIChpID0gMCwgaiA9IC0xOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobyA9IHNlbGYudHdlZW5baV0udmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKSkge1xuICAgICAgICB0d2VlblsrK2pdID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgdHdlZW4ubGVuZ3RoID0gaiArIDE7XG4gIH1cblxuICBmdW5jdGlvbiB0aWNrKGVsYXBzZWQpIHtcbiAgICB2YXIgdCA9IGVsYXBzZWQgPCBzZWxmLmR1cmF0aW9uID8gc2VsZi5lYXNlLmNhbGwobnVsbCwgZWxhcHNlZCAvIHNlbGYuZHVyYXRpb24pIDogKHNlbGYudGltZXIucmVzdGFydChzdG9wKSwgc2VsZi5zdGF0ZSA9IEVORElORywgMSksXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IHR3ZWVuLmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICB0d2VlbltpXS5jYWxsKG5vZGUsIHQpO1xuICAgIH1cblxuICAgIC8vIERpc3BhdGNoIHRoZSBlbmQgZXZlbnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgPT09IEVORElORykge1xuICAgICAgc2VsZi5vbi5jYWxsKFwiZW5kXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgICAgc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgc2VsZi5zdGF0ZSA9IEVOREVEO1xuICAgIHNlbGYudGltZXIuc3RvcCgpO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaWRdO1xuICAgIGZvciAodmFyIGkgaW4gc2NoZWR1bGVzKSByZXR1cm47IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG4gIH1cbn1cbiIsICJpbXBvcnQge1NUQVJUSU5HLCBFTkRJTkcsIEVOREVEfSBmcm9tIFwiLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgc2NoZWR1bGUsXG4gICAgICBhY3RpdmUsXG4gICAgICBlbXB0eSA9IHRydWUsXG4gICAgICBpO1xuXG4gIGlmICghc2NoZWR1bGVzKSByZXR1cm47XG5cbiAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcblxuICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgaWYgKChzY2hlZHVsZSA9IHNjaGVkdWxlc1tpXSkubmFtZSAhPT0gbmFtZSkgeyBlbXB0eSA9IGZhbHNlOyBjb250aW51ZTsgfVxuICAgIGFjdGl2ZSA9IHNjaGVkdWxlLnN0YXRlID4gU1RBUlRJTkcgJiYgc2NoZWR1bGUuc3RhdGUgPCBFTkRJTkc7XG4gICAgc2NoZWR1bGUuc3RhdGUgPSBFTkRFRDtcbiAgICBzY2hlZHVsZS50aW1lci5zdG9wKCk7XG4gICAgc2NoZWR1bGUub24uY2FsbChhY3RpdmUgPyBcImludGVycnVwdFwiIDogXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2NoZWR1bGUuaW5kZXgsIHNjaGVkdWxlLmdyb3VwKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICB9XG5cbiAgaWYgKGVtcHR5KSBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG59XG4iLCAiaW1wb3J0IGludGVycnVwdCBmcm9tIFwiLi4vaW50ZXJydXB0LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICBpbnRlcnJ1cHQodGhpcywgbmFtZSk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHR3ZWVuUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSB0d2VlbjAgPSB0d2VlbjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjEgPSB0d2VlbjEuc2xpY2UoKTtcbiAgICAgICAgICB0d2VlbjEuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHR3ZWVuRnVuY3Rpb24oaWQsIG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gKHR3ZWVuMCA9IHR3ZWVuKS5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgdCA9IHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9LCBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xW2ldID0gdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGkgPT09IG4pIHR3ZWVuMS5wdXNoKHQpO1xuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICBuYW1lICs9IFwiXCI7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIHR3ZWVuID0gZ2V0KHRoaXMubm9kZSgpLCBpZCkudHdlZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2Vlbi5sZW5ndGgsIHQ7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodCA9IHR3ZWVuW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGwgPyB0d2VlblJlbW92ZSA6IHR3ZWVuRnVuY3Rpb24pKGlkLCBuYW1lLCB2YWx1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHdlZW5WYWx1ZSh0cmFuc2l0aW9uLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0cmFuc2l0aW9uLl9pZDtcblxuICB0cmFuc2l0aW9uLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKTtcbiAgICAoc2NoZWR1bGUudmFsdWUgfHwgKHNjaGVkdWxlLnZhbHVlID0ge30pKVtuYW1lXSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIGdldChub2RlLCBpZCkudmFsdWVbbmFtZV07XG4gIH07XG59XG4iLCAiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQge2ludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJnYiwgaW50ZXJwb2xhdGVTdHJpbmd9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBjO1xuICByZXR1cm4gKHR5cGVvZiBiID09PSBcIm51bWJlclwiID8gaW50ZXJwb2xhdGVOdW1iZXJcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gaW50ZXJwb2xhdGVSZ2JcbiAgICAgIDogKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIGludGVycG9sYXRlUmdiKVxuICAgICAgOiBpbnRlcnBvbGF0ZVN0cmluZykoYSwgYik7XG59XG4iLCAiaW1wb3J0IHtpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2ZyBhcyBpbnRlcnBvbGF0ZVRyYW5zZm9ybX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmVOUyhmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb25OUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCI7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSksIGkgPSBmdWxsbmFtZSA9PT0gXCJ0cmFuc2Zvcm1cIiA/IGludGVycG9sYXRlVHJhbnNmb3JtIDogaW50ZXJwb2xhdGU7XG4gIHJldHVybiB0aGlzLmF0dHJUd2VlbihuYW1lLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbikoZnVsbG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJhdHRyLlwiICsgbmFtZSwgdmFsdWUpKVxuICAgICAgOiB2YWx1ZSA9PSBudWxsID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0clJlbW92ZU5TIDogYXR0clJlbW92ZSkoZnVsbG5hbWUpXG4gICAgICA6IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50KShmdWxsbmFtZSwgaSwgdmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuKG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlKG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJhdHRyLlwiICsgbmFtZTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgKGZ1bGxuYW1lLmxvY2FsID8gYXR0clR3ZWVuTlMgOiBhdHRyVHdlZW4pKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7Z2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkZWxheUZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVsYXlDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkZWxheUZ1bmN0aW9uXG4gICAgICAgICAgOiBkZWxheUNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kZWxheTtcbn1cbiIsICJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkdXJhdGlvbkZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9ICt2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkdXJhdGlvbkNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPSArdmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZHVyYXRpb25GdW5jdGlvblxuICAgICAgICAgIDogZHVyYXRpb25Db25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZHVyYXRpb247XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmVhc2U7XG59XG4iLCAiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VWYXJ5aW5nKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgdiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLmVhY2goZWFzZVZhcnlpbmcodGhpcy5faWQsIHZhbHVlKSk7XG59XG4iLCAiaW1wb3J0IHttYXRjaGVyfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCAiaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG4gIGlmICh0cmFuc2l0aW9uLl9pZCAhPT0gdGhpcy5faWQpIHRocm93IG5ldyBFcnJvcjtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gdHJhbnNpdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gc3RhcnQobmFtZSkge1xuICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pLmV2ZXJ5KGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuICF0IHx8IHQgPT09IFwic3RhcnRcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBvbjAsIG9uMSwgc2l0ID0gc3RhcnQobmFtZSkgPyBpbml0IDogc2V0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2l0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCkgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihuYW1lLCBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyXG4gICAgICA/IGdldCh0aGlzLm5vZGUoKSwgaWQpLm9uLm9uKG5hbWUpXG4gICAgICA6IHRoaXMuZWFjaChvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikpO1xufVxuIiwgImZ1bmN0aW9uIHJlbW92ZUZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5fX3RyYW5zaXRpb24pIGlmICgraSAhPT0gaWQpIHJldHVybjtcbiAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vbihcImVuZC5yZW1vdmVcIiwgcmVtb3ZlRnVuY3Rpb24odGhpcy5faWQpKTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdG9yfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgICBzY2hlZHVsZShzdWJncm91cFtpXSwgbmFtZSwgaWQsIGksIHN1Ymdyb3VwLCBnZXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3RvckFsbH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGZvciAodmFyIGNoaWxkcmVuID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApLCBjaGlsZCwgaW5oZXJpdCA9IGdldChub2RlLCBpZCksIGsgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBrIDwgbDsgKytrKSB7XG4gICAgICAgICAgaWYgKGNoaWxkID0gY2hpbGRyZW5ba10pIHtcbiAgICAgICAgICAgIHNjaGVkdWxlKGNoaWxkLCBuYW1lLCBpZCwgaywgY2hpbGRyZW4sIGluaGVyaXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdWJncm91cHMucHVzaChjaGlsZHJlbik7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxudmFyIFNlbGVjdGlvbiA9IHNlbGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3I7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9ncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtzdHlsZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVOdWxsKG5hbWUsIGludGVycG9sYXRlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgc3RyaW5nMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHN0cmluZzEwID0gc3RyaW5nMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgdmFsdWUxID0gdmFsdWUodGhpcyksXG4gICAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgc3RyaW5nMSA9IHZhbHVlMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZU1heWJlUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciBvbjAsIG9uMSwgbGlzdGVuZXIwLCBrZXkgPSBcInN0eWxlLlwiICsgbmFtZSwgZXZlbnQgPSBcImVuZC5cIiArIGtleSwgcmVtb3ZlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbixcbiAgICAgICAgbGlzdGVuZXIgPSBzY2hlZHVsZS52YWx1ZVtrZXldID09IG51bGwgPyByZW1vdmUgfHwgKHJlbW92ZSA9IHN0eWxlUmVtb3ZlKG5hbWUpKSA6IHVuZGVmaW5lZDtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCB8fCBsaXN0ZW5lcjAgIT09IGxpc3RlbmVyKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKGV2ZW50LCBsaXN0ZW5lcjAgPSBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBpID0gKG5hbWUgKz0gXCJcIikgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlTnVsbChuYW1lLCBpKSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIHN0eWxlUmVtb3ZlKG5hbWUpKVxuICAgIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUZ1bmN0aW9uKG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlKSkpXG4gICAgICAuZWFjaChzdHlsZU1heWJlUmVtb3ZlKHRoaXMuX2lkLCBuYW1lKSlcbiAgICA6IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlQ29uc3RhbnQobmFtZSwgaSwgdmFsdWUpLCBwcmlvcml0eSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIG51bGwpO1xufVxuIiwgImZ1bmN0aW9uIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkuY2FsbCh0aGlzLCB0KSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgdCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQgPSAoaTAgPSBpKSAmJiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KTtcbiAgICByZXR1cm4gdDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGtleSA9IFwic3R5bGUuXCIgKyAobmFtZSArPSBcIlwiKTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKTtcbn1cbiIsICJpbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5cbmZ1bmN0aW9uIHRleHRDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZTEgPSB2YWx1ZSh0aGlzKTtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWUxID09IG51bGwgPyBcIlwiIDogdmFsdWUxO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdGhpcy50d2VlbihcInRleHRcIiwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gdGV4dEZ1bmN0aW9uKHR3ZWVuVmFsdWUodGhpcywgXCJ0ZXh0XCIsIHZhbHVlKSlcbiAgICAgIDogdGV4dENvbnN0YW50KHZhbHVlID09IG51bGwgPyBcIlwiIDogdmFsdWUgKyBcIlwiKSk7XG59XG4iLCAiZnVuY3Rpb24gdGV4dEludGVycG9sYXRlKGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gaS5jYWxsKHRoaXMsIHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0VHdlZW4odmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiB0ZXh0SW50ZXJwb2xhdGUoaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcInRleHRcIjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHRleHRUd2Vlbih2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZDAgPSB0aGlzLl9pZCxcbiAgICAgIGlkMSA9IG5ld0lkKCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgdmFyIGluaGVyaXQgPSBnZXQobm9kZSwgaWQwKTtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQxLCBpLCBncm91cCwge1xuICAgICAgICAgIHRpbWU6IGluaGVyaXQudGltZSArIGluaGVyaXQuZGVsYXkgKyBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgIGR1cmF0aW9uOiBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGVhc2U6IGluaGVyaXQuZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZDEpO1xufVxuIiwgImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG9uMCwgb24xLCB0aGF0ID0gdGhpcywgaWQgPSB0aGF0Ll9pZCwgc2l6ZSA9IHRoYXQuc2l6ZSgpO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIGNhbmNlbCA9IHt2YWx1ZTogcmVqZWN0fSxcbiAgICAgICAgZW5kID0ge3ZhbHVlOiBmdW5jdGlvbigpIHsgaWYgKC0tc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpOyB9fTtcblxuICAgIHRoYXQuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICAgIGlmIChvbiAhPT0gb24wKSB7XG4gICAgICAgIG9uMSA9IChvbjAgPSBvbikuY29weSgpO1xuICAgICAgICBvbjEuXy5jYW5jZWwucHVzaChjYW5jZWwpO1xuICAgICAgICBvbjEuXy5pbnRlcnJ1cHQucHVzaChjYW5jZWwpO1xuICAgICAgICBvbjEuXy5lbmQucHVzaChlbmQpO1xuICAgICAgfVxuXG4gICAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgICB9KTtcblxuICAgIC8vIFRoZSBzZWxlY3Rpb24gd2FzIGVtcHR5LCByZXNvbHZlIGVuZCBpbW1lZGlhdGVseVxuICAgIGlmIChzaXplID09PSAwKSByZXNvbHZlKCk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHJUd2VlbiBmcm9tIFwiLi9hdHRyVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2RlbGF5IGZyb20gXCIuL2RlbGF5LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kdXJhdGlvbiBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZSBmcm9tIFwiLi9lYXNlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlVmFyeWluZyBmcm9tIFwiLi9lYXNlVmFyeWluZy5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3Rpb24gZnJvbSBcIi4vc2VsZWN0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGVUd2VlbiBmcm9tIFwiLi9zdHlsZVR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHRUd2VlbiBmcm9tIFwiLi90ZXh0VHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RyYW5zaXRpb24gZnJvbSBcIi4vdHJhbnNpdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHdlZW4gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2VuZCBmcm9tIFwiLi9lbmQuanNcIjtcblxudmFyIGlkID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zaXRpb24oZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCkge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgdGhpcy5faWQgPSBpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNpdGlvbihuYW1lKSB7XG4gIHJldHVybiBzZWxlY3Rpb24oKS50cmFuc2l0aW9uKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3SWQoKSB7XG4gIHJldHVybiArK2lkO1xufVxuXG52YXIgc2VsZWN0aW9uX3Byb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGU7XG5cblRyYW5zaXRpb24ucHJvdG90eXBlID0gdHJhbnNpdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2l0aW9uLFxuICBzZWxlY3Q6IHRyYW5zaXRpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHRyYW5zaXRpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogdHJhbnNpdGlvbl9maWx0ZXIsXG4gIG1lcmdlOiB0cmFuc2l0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHRyYW5zaXRpb25fc2VsZWN0aW9uLFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uX3RyYW5zaXRpb24sXG4gIGNhbGw6IHNlbGVjdGlvbl9wcm90b3R5cGUuY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX3Byb3RvdHlwZS5lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX3Byb3RvdHlwZS5lYWNoLFxuICBvbjogdHJhbnNpdGlvbl9vbixcbiAgYXR0cjogdHJhbnNpdGlvbl9hdHRyLFxuICBhdHRyVHdlZW46IHRyYW5zaXRpb25fYXR0clR3ZWVuLFxuICBzdHlsZTogdHJhbnNpdGlvbl9zdHlsZSxcbiAgc3R5bGVUd2VlbjogdHJhbnNpdGlvbl9zdHlsZVR3ZWVuLFxuICB0ZXh0OiB0cmFuc2l0aW9uX3RleHQsXG4gIHRleHRUd2VlbjogdHJhbnNpdGlvbl90ZXh0VHdlZW4sXG4gIHJlbW92ZTogdHJhbnNpdGlvbl9yZW1vdmUsXG4gIHR3ZWVuOiB0cmFuc2l0aW9uX3R3ZWVuLFxuICBkZWxheTogdHJhbnNpdGlvbl9kZWxheSxcbiAgZHVyYXRpb246IHRyYW5zaXRpb25fZHVyYXRpb24sXG4gIGVhc2U6IHRyYW5zaXRpb25fZWFzZSxcbiAgZWFzZVZhcnlpbmc6IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcsXG4gIGVuZDogdHJhbnNpdGlvbl9lbmQsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25fcHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl1cbn07XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW4odCkge1xuICByZXR1cm4gdCAqIHQgKiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNPdXQodCkge1xuICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gIHJldHVybiAoKHQgKj0gMikgPD0gMSA/IHQgKiB0ICogdCA6ICh0IC09IDIpICogdCAqIHQgKyAyKSAvIDI7XG59XG4iLCAiaW1wb3J0IHtUcmFuc2l0aW9uLCBuZXdJZH0gZnJvbSBcIi4uL3RyYW5zaXRpb24vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHtlYXNlQ3ViaWNJbk91dH0gZnJvbSBcImQzLWVhc2VcIjtcbmltcG9ydCB7bm93fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGRlZmF1bHRUaW1pbmcgPSB7XG4gIHRpbWU6IG51bGwsIC8vIFNldCBvbiB1c2UuXG4gIGRlbGF5OiAwLFxuICBkdXJhdGlvbjogMjUwLFxuICBlYXNlOiBlYXNlQ3ViaWNJbk91dFxufTtcblxuZnVuY3Rpb24gaW5oZXJpdChub2RlLCBpZCkge1xuICB2YXIgdGltaW5nO1xuICB3aGlsZSAoISh0aW1pbmcgPSBub2RlLl9fdHJhbnNpdGlvbikgfHwgISh0aW1pbmcgPSB0aW1pbmdbaWRdKSkge1xuICAgIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHRyYW5zaXRpb24gJHtpZH0gbm90IGZvdW5kYCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aW1pbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGlkLFxuICAgICAgdGltaW5nO1xuXG4gIGlmIChuYW1lIGluc3RhbmNlb2YgVHJhbnNpdGlvbikge1xuICAgIGlkID0gbmFtZS5faWQsIG5hbWUgPSBuYW1lLl9uYW1lO1xuICB9IGVsc2Uge1xuICAgIGlkID0gbmV3SWQoKSwgKHRpbWluZyA9IGRlZmF1bHRUaW1pbmcpLnRpbWUgPSBub3coKSwgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNjaGVkdWxlKG5vZGUsIG5hbWUsIGlkLCBpLCBncm91cCwgdGltaW5nIHx8IGluaGVyaXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBzZWxlY3Rpb25faW50ZXJydXB0IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcblxuc2VsZWN0aW9uLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBzZWxlY3Rpb25faW50ZXJydXB0O1xuc2VsZWN0aW9uLnByb3RvdHlwZS50cmFuc2l0aW9uID0gc2VsZWN0aW9uX3RyYW5zaXRpb247XG4iLCAiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge2RyYWdEaXNhYmxlLCBkcmFnRW5hYmxlfSBmcm9tIFwiZDMtZHJhZ1wiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZX0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQge3BvaW50ZXIsIHNlbGVjdH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtpbnRlcnJ1cHR9IGZyb20gXCJkMy10cmFuc2l0aW9uXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBCcnVzaEV2ZW50IGZyb20gXCIuL2V2ZW50LmpzXCI7XG5pbXBvcnQgbm9ldmVudCwge25vcHJvcGFnYXRpb259IGZyb20gXCIuL25vZXZlbnQuanNcIjtcblxudmFyIE1PREVfRFJBRyA9IHtuYW1lOiBcImRyYWdcIn0sXG4gICAgTU9ERV9TUEFDRSA9IHtuYW1lOiBcInNwYWNlXCJ9LFxuICAgIE1PREVfSEFORExFID0ge25hbWU6IFwiaGFuZGxlXCJ9LFxuICAgIE1PREVfQ0VOVEVSID0ge25hbWU6IFwiY2VudGVyXCJ9O1xuXG5jb25zdCB7YWJzLCBtYXgsIG1pbn0gPSBNYXRoO1xuXG5mdW5jdGlvbiBudW1iZXIxKGUpIHtcbiAgcmV0dXJuIFsrZVswXSwgK2VbMV1dO1xufVxuXG5mdW5jdGlvbiBudW1iZXIyKGUpIHtcbiAgcmV0dXJuIFtudW1iZXIxKGVbMF0pLCBudW1iZXIxKGVbMV0pXTtcbn1cblxudmFyIFggPSB7XG4gIG5hbWU6IFwieFwiLFxuICBoYW5kbGVzOiBbXCJ3XCIsIFwiZVwiXS5tYXAodHlwZSksXG4gIGlucHV0OiBmdW5jdGlvbih4LCBlKSB7IHJldHVybiB4ID09IG51bGwgPyBudWxsIDogW1sreFswXSwgZVswXVsxXV0sIFsreFsxXSwgZVsxXVsxXV1dOyB9LFxuICBvdXRwdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eSAmJiBbeHlbMF1bMF0sIHh5WzFdWzBdXTsgfVxufTtcblxudmFyIFkgPSB7XG4gIG5hbWU6IFwieVwiLFxuICBoYW5kbGVzOiBbXCJuXCIsIFwic1wiXS5tYXAodHlwZSksXG4gIGlucHV0OiBmdW5jdGlvbih5LCBlKSB7IHJldHVybiB5ID09IG51bGwgPyBudWxsIDogW1tlWzBdWzBdLCAreVswXV0sIFtlWzFdWzBdLCAreVsxXV1dOyB9LFxuICBvdXRwdXQ6IGZ1bmN0aW9uKHh5KSB7IHJldHVybiB4eSAmJiBbeHlbMF1bMV0sIHh5WzFdWzFdXTsgfVxufTtcblxudmFyIFhZID0ge1xuICBuYW1lOiBcInh5XCIsXG4gIGhhbmRsZXM6IFtcIm5cIiwgXCJ3XCIsIFwiZVwiLCBcInNcIiwgXCJud1wiLCBcIm5lXCIsIFwic3dcIiwgXCJzZVwiXS5tYXAodHlwZSksXG4gIGlucHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgPT0gbnVsbCA/IG51bGwgOiBudW1iZXIyKHh5KTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHk7IH1cbn07XG5cbnZhciBjdXJzb3JzID0ge1xuICBvdmVybGF5OiBcImNyb3NzaGFpclwiLFxuICBzZWxlY3Rpb246IFwibW92ZVwiLFxuICBuOiBcIm5zLXJlc2l6ZVwiLFxuICBlOiBcImV3LXJlc2l6ZVwiLFxuICBzOiBcIm5zLXJlc2l6ZVwiLFxuICB3OiBcImV3LXJlc2l6ZVwiLFxuICBudzogXCJud3NlLXJlc2l6ZVwiLFxuICBuZTogXCJuZXN3LXJlc2l6ZVwiLFxuICBzZTogXCJud3NlLXJlc2l6ZVwiLFxuICBzdzogXCJuZXN3LXJlc2l6ZVwiXG59O1xuXG52YXIgZmxpcFggPSB7XG4gIGU6IFwid1wiLFxuICB3OiBcImVcIixcbiAgbnc6IFwibmVcIixcbiAgbmU6IFwibndcIixcbiAgc2U6IFwic3dcIixcbiAgc3c6IFwic2VcIlxufTtcblxudmFyIGZsaXBZID0ge1xuICBuOiBcInNcIixcbiAgczogXCJuXCIsXG4gIG53OiBcInN3XCIsXG4gIG5lOiBcInNlXCIsXG4gIHNlOiBcIm5lXCIsXG4gIHN3OiBcIm53XCJcbn07XG5cbnZhciBzaWduc1ggPSB7XG4gIG92ZXJsYXk6ICsxLFxuICBzZWxlY3Rpb246ICsxLFxuICBuOiBudWxsLFxuICBlOiArMSxcbiAgczogbnVsbCxcbiAgdzogLTEsXG4gIG53OiAtMSxcbiAgbmU6ICsxLFxuICBzZTogKzEsXG4gIHN3OiAtMVxufTtcblxudmFyIHNpZ25zWSA9IHtcbiAgb3ZlcmxheTogKzEsXG4gIHNlbGVjdGlvbjogKzEsXG4gIG46IC0xLFxuICBlOiBudWxsLFxuICBzOiArMSxcbiAgdzogbnVsbCxcbiAgbnc6IC0xLFxuICBuZTogLTEsXG4gIHNlOiArMSxcbiAgc3c6ICsxXG59O1xuXG5mdW5jdGlvbiB0eXBlKHQpIHtcbiAgcmV0dXJuIHt0eXBlOiB0fTtcbn1cblxuLy8gSWdub3JlIHJpZ2h0LWNsaWNrLCBzaW5jZSB0aGF0IHNob3VsZCBvcGVuIHRoZSBjb250ZXh0IG1lbnUuXG5mdW5jdGlvbiBkZWZhdWx0RmlsdGVyKGV2ZW50KSB7XG4gIHJldHVybiAhZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuYnV0dG9uO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0RXh0ZW50KCkge1xuICB2YXIgc3ZnID0gdGhpcy5vd25lclNWR0VsZW1lbnQgfHwgdGhpcztcbiAgaWYgKHN2Zy5oYXNBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIpKSB7XG4gICAgc3ZnID0gc3ZnLnZpZXdCb3guYmFzZVZhbDtcbiAgICByZXR1cm4gW1tzdmcueCwgc3ZnLnldLCBbc3ZnLnggKyBzdmcud2lkdGgsIHN2Zy55ICsgc3ZnLmhlaWdodF1dO1xuICB9XG4gIHJldHVybiBbWzAsIDBdLCBbc3ZnLndpZHRoLmJhc2VWYWwudmFsdWUsIHN2Zy5oZWlnaHQuYmFzZVZhbC52YWx1ZV1dO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0VG91Y2hhYmxlKCkge1xuICByZXR1cm4gbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzIHx8IChcIm9udG91Y2hzdGFydFwiIGluIHRoaXMpO1xufVxuXG4vLyBMaWtlIGQzLmxvY2FsLCBidXQgd2l0aCB0aGUgbmFtZSBcdTIwMUNfX2JydXNoXHUyMDFEIHJhdGhlciB0aGFuIGF1dG8tZ2VuZXJhdGVkLlxuZnVuY3Rpb24gbG9jYWwobm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX19icnVzaCkgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHJldHVybjtcbiAgcmV0dXJuIG5vZGUuX19icnVzaDtcbn1cblxuZnVuY3Rpb24gZW1wdHkoZXh0ZW50KSB7XG4gIHJldHVybiBleHRlbnRbMF1bMF0gPT09IGV4dGVudFsxXVswXVxuICAgICAgfHwgZXh0ZW50WzBdWzFdID09PSBleHRlbnRbMV1bMV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFNlbGVjdGlvbihub2RlKSB7XG4gIHZhciBzdGF0ZSA9IG5vZGUuX19icnVzaDtcbiAgcmV0dXJuIHN0YXRlID8gc3RhdGUuZGltLm91dHB1dChzdGF0ZS5zZWxlY3Rpb24pIDogbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoWCgpIHtcbiAgcmV0dXJuIGJydXNoKFgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hZKCkge1xuICByZXR1cm4gYnJ1c2goWSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gYnJ1c2goWFkpO1xufVxuXG5mdW5jdGlvbiBicnVzaChkaW0pIHtcbiAgdmFyIGV4dGVudCA9IGRlZmF1bHRFeHRlbnQsXG4gICAgICBmaWx0ZXIgPSBkZWZhdWx0RmlsdGVyLFxuICAgICAgdG91Y2hhYmxlID0gZGVmYXVsdFRvdWNoYWJsZSxcbiAgICAgIGtleXMgPSB0cnVlLFxuICAgICAgbGlzdGVuZXJzID0gZGlzcGF0Y2goXCJzdGFydFwiLCBcImJydXNoXCIsIFwiZW5kXCIpLFxuICAgICAgaGFuZGxlU2l6ZSA9IDYsXG4gICAgICB0b3VjaGVuZGluZztcblxuICBmdW5jdGlvbiBicnVzaChncm91cCkge1xuICAgIHZhciBvdmVybGF5ID0gZ3JvdXBcbiAgICAgICAgLnByb3BlcnR5KFwiX19icnVzaFwiLCBpbml0aWFsaXplKVxuICAgICAgLnNlbGVjdEFsbChcIi5vdmVybGF5XCIpXG4gICAgICAuZGF0YShbdHlwZShcIm92ZXJsYXlcIildKTtcblxuICAgIG92ZXJsYXkuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJvdmVybGF5XCIpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5vdmVybGF5KVxuICAgICAgLm1lcmdlKG92ZXJsYXkpXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBleHRlbnQgPSBsb2NhbCh0aGlzKS5leHRlbnQ7XG4gICAgICAgICAgc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBleHRlbnRbMF1bMF0pXG4gICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBleHRlbnRbMF1bMV0pXG4gICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZXh0ZW50WzFdWzBdIC0gZXh0ZW50WzBdWzBdKVxuICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBleHRlbnRbMV1bMV0gLSBleHRlbnRbMF1bMV0pO1xuICAgICAgICB9KTtcblxuICAgIGdyb3VwLnNlbGVjdEFsbChcIi5zZWxlY3Rpb25cIilcbiAgICAgIC5kYXRhKFt0eXBlKFwic2VsZWN0aW9uXCIpXSlcbiAgICAgIC5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInNlbGVjdGlvblwiKVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLnNlbGVjdGlvbilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiIzc3N1wiKVxuICAgICAgICAuYXR0cihcImZpbGwtb3BhY2l0eVwiLCAwLjMpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiI2ZmZlwiKVxuICAgICAgICAuYXR0cihcInNoYXBlLXJlbmRlcmluZ1wiLCBcImNyaXNwRWRnZXNcIik7XG5cbiAgICB2YXIgaGFuZGxlID0gZ3JvdXAuc2VsZWN0QWxsKFwiLmhhbmRsZVwiKVxuICAgICAgLmRhdGEoZGltLmhhbmRsZXMsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZTsgfSk7XG5cbiAgICBoYW5kbGUuZXhpdCgpLnJlbW92ZSgpO1xuXG4gICAgaGFuZGxlLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwiaGFuZGxlIGhhbmRsZS0tXCIgKyBkLnR5cGU7IH0pXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGN1cnNvcnNbZC50eXBlXTsgfSk7XG5cbiAgICBncm91cFxuICAgICAgICAuZWFjaChyZWRyYXcpXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIilcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKVxuICAgICAgICAub24oXCJtb3VzZWRvd24uYnJ1c2hcIiwgc3RhcnRlZClcbiAgICAgIC5maWx0ZXIodG91Y2hhYmxlKVxuICAgICAgICAub24oXCJ0b3VjaHN0YXJ0LmJydXNoXCIsIHN0YXJ0ZWQpXG4gICAgICAgIC5vbihcInRvdWNobW92ZS5icnVzaFwiLCB0b3VjaG1vdmVkKVxuICAgICAgICAub24oXCJ0b3VjaGVuZC5icnVzaCB0b3VjaGNhbmNlbC5icnVzaFwiLCB0b3VjaGVuZGVkKVxuICAgICAgICAuc3R5bGUoXCJ0b3VjaC1hY3Rpb25cIiwgXCJub25lXCIpXG4gICAgICAgIC5zdHlsZShcIi13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvclwiLCBcInJnYmEoMCwwLDAsMClcIik7XG4gIH1cblxuICBicnVzaC5tb3ZlID0gZnVuY3Rpb24oZ3JvdXAsIHNlbGVjdGlvbiwgZXZlbnQpIHtcbiAgICBpZiAoZ3JvdXAudHdlZW4pIHtcbiAgICAgIGdyb3VwXG4gICAgICAgICAgLm9uKFwic3RhcnQuYnJ1c2hcIiwgZnVuY3Rpb24oZXZlbnQpIHsgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLmJlZm9yZXN0YXJ0KCkuc3RhcnQoZXZlbnQpOyB9KVxuICAgICAgICAgIC5vbihcImludGVycnVwdC5icnVzaCBlbmQuYnJ1c2hcIiwgZnVuY3Rpb24oZXZlbnQpIHsgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLmVuZChldmVudCk7IH0pXG4gICAgICAgICAgLnR3ZWVuKFwiYnJ1c2hcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB0aGF0Ll9fYnJ1c2gsXG4gICAgICAgICAgICAgICAgZW1pdCA9IGVtaXR0ZXIodGhhdCwgYXJndW1lbnRzKSxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24wID0gc3RhdGUuc2VsZWN0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjEgPSBkaW0uaW5wdXQodHlwZW9mIHNlbGVjdGlvbiA9PT0gXCJmdW5jdGlvblwiID8gc2VsZWN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBzZWxlY3Rpb24sIHN0YXRlLmV4dGVudCksXG4gICAgICAgICAgICAgICAgaSA9IGludGVycG9sYXRlKHNlbGVjdGlvbjAsIHNlbGVjdGlvbjEpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB0d2Vlbih0KSB7XG4gICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IHQgPT09IDEgJiYgc2VsZWN0aW9uMSA9PT0gbnVsbCA/IG51bGwgOiBpKHQpO1xuICAgICAgICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgICAgICAgZW1pdC5icnVzaCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uMCAhPT0gbnVsbCAmJiBzZWxlY3Rpb24xICE9PSBudWxsID8gdHdlZW4gOiB0d2VlbigxKTtcbiAgICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ3JvdXBcbiAgICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gdGhhdC5fX2JydXNoLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjEgPSBkaW0uaW5wdXQodHlwZW9mIHNlbGVjdGlvbiA9PT0gXCJmdW5jdGlvblwiID8gc2VsZWN0aW9uLmFwcGx5KHRoYXQsIGFyZ3MpIDogc2VsZWN0aW9uLCBzdGF0ZS5leHRlbnQpLFxuICAgICAgICAgICAgICAgIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3MpLmJlZm9yZXN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGludGVycnVwdCh0aGF0KTtcbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGlvbiA9IHNlbGVjdGlvbjEgPT09IG51bGwgPyBudWxsIDogc2VsZWN0aW9uMTtcbiAgICAgICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICAgICAgZW1pdC5zdGFydChldmVudCkuYnJ1c2goZXZlbnQpLmVuZChldmVudCk7XG4gICAgICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGJydXNoLmNsZWFyID0gZnVuY3Rpb24oZ3JvdXAsIGV2ZW50KSB7XG4gICAgYnJ1c2gubW92ZShncm91cCwgbnVsbCwgZXZlbnQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICB2YXIgZ3JvdXAgPSBzZWxlY3QodGhpcyksXG4gICAgICAgIHNlbGVjdGlvbiA9IGxvY2FsKHRoaXMpLnNlbGVjdGlvbjtcblxuICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcIi5zZWxlY3Rpb25cIilcbiAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIHNlbGVjdGlvblswXVswXSlcbiAgICAgICAgICAuYXR0cihcInlcIiwgc2VsZWN0aW9uWzBdWzFdKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgc2VsZWN0aW9uWzFdWzBdIC0gc2VsZWN0aW9uWzBdWzBdKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHNlbGVjdGlvblsxXVsxXSAtIHNlbGVjdGlvblswXVsxXSk7XG5cbiAgICAgIGdyb3VwLnNlbGVjdEFsbChcIi5oYW5kbGVcIilcbiAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZVtkLnR5cGUubGVuZ3RoIC0gMV0gPT09IFwiZVwiID8gc2VsZWN0aW9uWzFdWzBdIC0gaGFuZGxlU2l6ZSAvIDIgOiBzZWxlY3Rpb25bMF1bMF0gLSBoYW5kbGVTaXplIC8gMjsgfSlcbiAgICAgICAgICAuYXR0cihcInlcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlWzBdID09PSBcInNcIiA/IHNlbGVjdGlvblsxXVsxXSAtIGhhbmRsZVNpemUgLyAyIDogc2VsZWN0aW9uWzBdWzFdIC0gaGFuZGxlU2l6ZSAvIDI7IH0pXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGUgPT09IFwiblwiIHx8IGQudHlwZSA9PT0gXCJzXCIgPyBzZWxlY3Rpb25bMV1bMF0gLSBzZWxlY3Rpb25bMF1bMF0gKyBoYW5kbGVTaXplIDogaGFuZGxlU2l6ZTsgfSlcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGUgPT09IFwiZVwiIHx8IGQudHlwZSA9PT0gXCJ3XCIgPyBzZWxlY3Rpb25bMV1bMV0gLSBzZWxlY3Rpb25bMF1bMV0gKyBoYW5kbGVTaXplIDogaGFuZGxlU2l6ZTsgfSk7XG4gICAgfVxuXG4gICAgZWxzZSB7XG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uLC5oYW5kbGVcIilcbiAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIFwibm9uZVwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0dGVyKHRoYXQsIGFyZ3MsIGNsZWFuKSB7XG4gICAgdmFyIGVtaXQgPSB0aGF0Ll9fYnJ1c2guZW1pdHRlcjtcbiAgICByZXR1cm4gZW1pdCAmJiAoIWNsZWFuIHx8ICFlbWl0LmNsZWFuKSA/IGVtaXQgOiBuZXcgRW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbik7XG4gIH1cblxuICBmdW5jdGlvbiBFbWl0dGVyKHRoYXQsIGFyZ3MsIGNsZWFuKSB7XG4gICAgdGhpcy50aGF0ID0gdGhhdDtcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xuICAgIHRoaXMuc3RhdGUgPSB0aGF0Ll9fYnJ1c2g7XG4gICAgdGhpcy5hY3RpdmUgPSAwO1xuICAgIHRoaXMuY2xlYW4gPSBjbGVhbjtcbiAgfVxuXG4gIEVtaXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGJlZm9yZXN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgrK3RoaXMuYWN0aXZlID09PSAxKSB0aGlzLnN0YXRlLmVtaXR0ZXIgPSB0aGlzLCB0aGlzLnN0YXJ0aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICBpZiAodGhpcy5zdGFydGluZykgdGhpcy5zdGFydGluZyA9IGZhbHNlLCB0aGlzLmVtaXQoXCJzdGFydFwiLCBldmVudCwgbW9kZSk7XG4gICAgICBlbHNlIHRoaXMuZW1pdChcImJydXNoXCIsIGV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYnJ1c2g6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICB0aGlzLmVtaXQoXCJicnVzaFwiLCBldmVudCwgbW9kZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24oZXZlbnQsIG1vZGUpIHtcbiAgICAgIGlmICgtLXRoaXMuYWN0aXZlID09PSAwKSBkZWxldGUgdGhpcy5zdGF0ZS5lbWl0dGVyLCB0aGlzLmVtaXQoXCJlbmRcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBlbWl0OiBmdW5jdGlvbih0eXBlLCBldmVudCwgbW9kZSkge1xuICAgICAgdmFyIGQgPSBzZWxlY3QodGhpcy50aGF0KS5kYXR1bSgpO1xuICAgICAgbGlzdGVuZXJzLmNhbGwoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHRoaXMudGhhdCxcbiAgICAgICAgbmV3IEJydXNoRXZlbnQodHlwZSwge1xuICAgICAgICAgIHNvdXJjZUV2ZW50OiBldmVudCxcbiAgICAgICAgICB0YXJnZXQ6IGJydXNoLFxuICAgICAgICAgIHNlbGVjdGlvbjogZGltLm91dHB1dCh0aGlzLnN0YXRlLnNlbGVjdGlvbiksXG4gICAgICAgICAgbW9kZSxcbiAgICAgICAgICBkaXNwYXRjaDogbGlzdGVuZXJzXG4gICAgICAgIH0pLFxuICAgICAgICBkXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBzdGFydGVkKGV2ZW50KSB7XG4gICAgaWYgKHRvdWNoZW5kaW5nICYmICFldmVudC50b3VjaGVzKSByZXR1cm47XG4gICAgaWYgKCFmaWx0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSkgcmV0dXJuO1xuXG4gICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICB0eXBlID0gZXZlbnQudGFyZ2V0Ll9fZGF0YV9fLnR5cGUsXG4gICAgICAgIG1vZGUgPSAoa2V5cyAmJiBldmVudC5tZXRhS2V5ID8gdHlwZSA9IFwib3ZlcmxheVwiIDogdHlwZSkgPT09IFwic2VsZWN0aW9uXCIgPyBNT0RFX0RSQUcgOiAoa2V5cyAmJiBldmVudC5hbHRLZXkgPyBNT0RFX0NFTlRFUiA6IE1PREVfSEFORExFKSxcbiAgICAgICAgc2lnblggPSBkaW0gPT09IFkgPyBudWxsIDogc2lnbnNYW3R5cGVdLFxuICAgICAgICBzaWduWSA9IGRpbSA9PT0gWCA/IG51bGwgOiBzaWduc1lbdHlwZV0sXG4gICAgICAgIHN0YXRlID0gbG9jYWwodGhhdCksXG4gICAgICAgIGV4dGVudCA9IHN0YXRlLmV4dGVudCxcbiAgICAgICAgc2VsZWN0aW9uID0gc3RhdGUuc2VsZWN0aW9uLFxuICAgICAgICBXID0gZXh0ZW50WzBdWzBdLCB3MCwgdzEsXG4gICAgICAgIE4gPSBleHRlbnRbMF1bMV0sIG4wLCBuMSxcbiAgICAgICAgRSA9IGV4dGVudFsxXVswXSwgZTAsIGUxLFxuICAgICAgICBTID0gZXh0ZW50WzFdWzFdLCBzMCwgczEsXG4gICAgICAgIGR4ID0gMCxcbiAgICAgICAgZHkgPSAwLFxuICAgICAgICBtb3ZpbmcsXG4gICAgICAgIHNoaWZ0aW5nID0gc2lnblggJiYgc2lnblkgJiYga2V5cyAmJiBldmVudC5zaGlmdEtleSxcbiAgICAgICAgbG9ja1gsXG4gICAgICAgIGxvY2tZLFxuICAgICAgICBwb2ludHMgPSBBcnJheS5mcm9tKGV2ZW50LnRvdWNoZXMgfHwgW2V2ZW50XSwgdCA9PiB7XG4gICAgICAgICAgY29uc3QgaSA9IHQuaWRlbnRpZmllcjtcbiAgICAgICAgICB0ID0gcG9pbnRlcih0LCB0aGF0KTtcbiAgICAgICAgICB0LnBvaW50MCA9IHQuc2xpY2UoKTtcbiAgICAgICAgICB0LmlkZW50aWZpZXIgPSBpO1xuICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9KTtcblxuICAgIGludGVycnVwdCh0aGF0KTtcbiAgICB2YXIgZW1pdCA9IGVtaXR0ZXIodGhhdCwgYXJndW1lbnRzLCB0cnVlKS5iZWZvcmVzdGFydCgpO1xuXG4gICAgaWYgKHR5cGUgPT09IFwib3ZlcmxheVwiKSB7XG4gICAgICBpZiAoc2VsZWN0aW9uKSBtb3ZpbmcgPSB0cnVlO1xuICAgICAgY29uc3QgcHRzID0gW3BvaW50c1swXSwgcG9pbnRzWzFdIHx8IHBvaW50c1swXV07XG4gICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBzZWxlY3Rpb24gPSBbW1xuICAgICAgICAgIHcwID0gZGltID09PSBZID8gVyA6IG1pbihwdHNbMF1bMF0sIHB0c1sxXVswXSksXG4gICAgICAgICAgbjAgPSBkaW0gPT09IFggPyBOIDogbWluKHB0c1swXVsxXSwgcHRzWzFdWzFdKVxuICAgICAgICBdLCBbXG4gICAgICAgICAgZTAgPSBkaW0gPT09IFkgPyBFIDogbWF4KHB0c1swXVswXSwgcHRzWzFdWzBdKSxcbiAgICAgICAgICBzMCA9IGRpbSA9PT0gWCA/IFMgOiBtYXgocHRzWzBdWzFdLCBwdHNbMV1bMV0pXG4gICAgICAgIF1dO1xuICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiAxKSBtb3ZlKGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdzAgPSBzZWxlY3Rpb25bMF1bMF07XG4gICAgICBuMCA9IHNlbGVjdGlvblswXVsxXTtcbiAgICAgIGUwID0gc2VsZWN0aW9uWzFdWzBdO1xuICAgICAgczAgPSBzZWxlY3Rpb25bMV1bMV07XG4gICAgfVxuXG4gICAgdzEgPSB3MDtcbiAgICBuMSA9IG4wO1xuICAgIGUxID0gZTA7XG4gICAgczEgPSBzMDtcblxuICAgIHZhciBncm91cCA9IHNlbGVjdCh0aGF0KVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwibm9uZVwiKTtcblxuICAgIHZhciBvdmVybGF5ID0gZ3JvdXAuc2VsZWN0QWxsKFwiLm92ZXJsYXlcIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlXSk7XG5cbiAgICBpZiAoZXZlbnQudG91Y2hlcykge1xuICAgICAgZW1pdC5tb3ZlZCA9IG1vdmVkO1xuICAgICAgZW1pdC5lbmRlZCA9IGVuZGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IHNlbGVjdChldmVudC52aWV3KVxuICAgICAgICAgIC5vbihcIm1vdXNlbW92ZS5icnVzaFwiLCBtb3ZlZCwgdHJ1ZSlcbiAgICAgICAgICAub24oXCJtb3VzZXVwLmJydXNoXCIsIGVuZGVkLCB0cnVlKTtcbiAgICAgIGlmIChrZXlzKSB2aWV3XG4gICAgICAgICAgLm9uKFwia2V5ZG93bi5icnVzaFwiLCBrZXlkb3duZWQsIHRydWUpXG4gICAgICAgICAgLm9uKFwia2V5dXAuYnJ1c2hcIiwga2V5dXBwZWQsIHRydWUpXG5cbiAgICAgIGRyYWdEaXNhYmxlKGV2ZW50LnZpZXcpO1xuICAgIH1cblxuICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgIGVtaXQuc3RhcnQoZXZlbnQsIG1vZGUubmFtZSk7XG5cbiAgICBmdW5jdGlvbiBtb3ZlZChldmVudCkge1xuICAgICAgZm9yIChjb25zdCBwIG9mIGV2ZW50LmNoYW5nZWRUb3VjaGVzIHx8IFtldmVudF0pIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIHBvaW50cylcbiAgICAgICAgICBpZiAoZC5pZGVudGlmaWVyID09PSBwLmlkZW50aWZpZXIpIGQuY3VyID0gcG9pbnRlcihwLCB0aGF0KTtcbiAgICAgIH1cbiAgICAgIGlmIChzaGlmdGluZyAmJiAhbG9ja1ggJiYgIWxvY2tZICYmIHBvaW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBwb2ludHNbMF07XG4gICAgICAgIGlmIChhYnMocG9pbnQuY3VyWzBdIC0gcG9pbnRbMF0pID4gYWJzKHBvaW50LmN1clsxXSAtIHBvaW50WzFdKSlcbiAgICAgICAgICBsb2NrWSA9IHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsb2NrWCA9IHRydWU7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHBvaW50cylcbiAgICAgICAgaWYgKHBvaW50LmN1cikgcG9pbnRbMF0gPSBwb2ludC5jdXJbMF0sIHBvaW50WzFdID0gcG9pbnQuY3VyWzFdO1xuICAgICAgbW92aW5nID0gdHJ1ZTtcbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgICAgbW92ZShldmVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW92ZShldmVudCkge1xuICAgICAgY29uc3QgcG9pbnQgPSBwb2ludHNbMF0sIHBvaW50MCA9IHBvaW50LnBvaW50MDtcbiAgICAgIHZhciB0O1xuXG4gICAgICBkeCA9IHBvaW50WzBdIC0gcG9pbnQwWzBdO1xuICAgICAgZHkgPSBwb2ludFsxXSAtIHBvaW50MFsxXTtcblxuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgTU9ERV9TUEFDRTpcbiAgICAgICAgY2FzZSBNT0RFX0RSQUc6IHtcbiAgICAgICAgICBpZiAoc2lnblgpIGR4ID0gbWF4KFcgLSB3MCwgbWluKEUgLSBlMCwgZHgpKSwgdzEgPSB3MCArIGR4LCBlMSA9IGUwICsgZHg7XG4gICAgICAgICAgaWYgKHNpZ25ZKSBkeSA9IG1heChOIC0gbjAsIG1pbihTIC0gczAsIGR5KSksIG4xID0gbjAgKyBkeSwgczEgPSBzMCArIGR5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTU9ERV9IQU5ETEU6IHtcbiAgICAgICAgICBpZiAocG9pbnRzWzFdKSB7XG4gICAgICAgICAgICBpZiAoc2lnblgpIHcxID0gbWF4KFcsIG1pbihFLCBwb2ludHNbMF1bMF0pKSwgZTEgPSBtYXgoVywgbWluKEUsIHBvaW50c1sxXVswXSkpLCBzaWduWCA9IDE7XG4gICAgICAgICAgICBpZiAoc2lnblkpIG4xID0gbWF4KE4sIG1pbihTLCBwb2ludHNbMF1bMV0pKSwgczEgPSBtYXgoTiwgbWluKFMsIHBvaW50c1sxXVsxXSkpLCBzaWduWSA9IDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGR4ID0gbWF4KFcgLSB3MCwgbWluKEUgLSB3MCwgZHgpKSwgdzEgPSB3MCArIGR4LCBlMSA9IGUwO1xuICAgICAgICAgICAgZWxzZSBpZiAoc2lnblggPiAwKSBkeCA9IG1heChXIC0gZTAsIG1pbihFIC0gZTAsIGR4KSksIHcxID0gdzAsIGUxID0gZTAgKyBkeDtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIGR5ID0gbWF4KE4gLSBuMCwgbWluKFMgLSBuMCwgZHkpKSwgbjEgPSBuMCArIGR5LCBzMSA9IHMwO1xuICAgICAgICAgICAgZWxzZSBpZiAoc2lnblkgPiAwKSBkeSA9IG1heChOIC0gczAsIG1pbihTIC0gczAsIGR5KSksIG4xID0gbjAsIHMxID0gczAgKyBkeTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBNT0RFX0NFTlRFUjoge1xuICAgICAgICAgIGlmIChzaWduWCkgdzEgPSBtYXgoVywgbWluKEUsIHcwIC0gZHggKiBzaWduWCkpLCBlMSA9IG1heChXLCBtaW4oRSwgZTAgKyBkeCAqIHNpZ25YKSk7XG4gICAgICAgICAgaWYgKHNpZ25ZKSBuMSA9IG1heChOLCBtaW4oUywgbjAgLSBkeSAqIHNpZ25ZKSksIHMxID0gbWF4KE4sIG1pbihTLCBzMCArIGR5ICogc2lnblkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZTEgPCB3MSkge1xuICAgICAgICBzaWduWCAqPSAtMTtcbiAgICAgICAgdCA9IHcwLCB3MCA9IGUwLCBlMCA9IHQ7XG4gICAgICAgIHQgPSB3MSwgdzEgPSBlMSwgZTEgPSB0O1xuICAgICAgICBpZiAodHlwZSBpbiBmbGlwWCkgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZSA9IGZsaXBYW3R5cGVdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzMSA8IG4xKSB7XG4gICAgICAgIHNpZ25ZICo9IC0xO1xuICAgICAgICB0ID0gbjAsIG4wID0gczAsIHMwID0gdDtcbiAgICAgICAgdCA9IG4xLCBuMSA9IHMxLCBzMSA9IHQ7XG4gICAgICAgIGlmICh0eXBlIGluIGZsaXBZKSBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlID0gZmxpcFlbdHlwZV1dKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLnNlbGVjdGlvbikgc2VsZWN0aW9uID0gc3RhdGUuc2VsZWN0aW9uOyAvLyBNYXkgYmUgc2V0IGJ5IGJydXNoLm1vdmUhXG4gICAgICBpZiAobG9ja1gpIHcxID0gc2VsZWN0aW9uWzBdWzBdLCBlMSA9IHNlbGVjdGlvblsxXVswXTtcbiAgICAgIGlmIChsb2NrWSkgbjEgPSBzZWxlY3Rpb25bMF1bMV0sIHMxID0gc2VsZWN0aW9uWzFdWzFdO1xuXG4gICAgICBpZiAoc2VsZWN0aW9uWzBdWzBdICE9PSB3MVxuICAgICAgICAgIHx8IHNlbGVjdGlvblswXVsxXSAhPT0gbjFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMV1bMF0gIT09IGUxXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzFdWzFdICE9PSBzMSkge1xuICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBbW3cxLCBuMV0sIFtlMSwgczFdXTtcbiAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgIGVtaXQuYnJ1c2goZXZlbnQsIG1vZGUubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kZWQoZXZlbnQpIHtcbiAgICAgIG5vcHJvcGFnYXRpb24oZXZlbnQpO1xuICAgICAgaWYgKGV2ZW50LnRvdWNoZXMpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGlmICh0b3VjaGVuZGluZykgY2xlYXJUaW1lb3V0KHRvdWNoZW5kaW5nKTtcbiAgICAgICAgdG91Y2hlbmRpbmcgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0b3VjaGVuZGluZyA9IG51bGw7IH0sIDUwMCk7IC8vIEdob3N0IGNsaWNrcyBhcmUgZGVsYXllZCFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYWdFbmFibGUoZXZlbnQudmlldywgbW92aW5nKTtcbiAgICAgICAgdmlldy5vbihcImtleWRvd24uYnJ1c2gga2V5dXAuYnJ1c2ggbW91c2Vtb3ZlLmJydXNoIG1vdXNldXAuYnJ1c2hcIiwgbnVsbCk7XG4gICAgICB9XG4gICAgICBncm91cC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIik7XG4gICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5vdmVybGF5KTtcbiAgICAgIGlmIChzdGF0ZS5zZWxlY3Rpb24pIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbjsgLy8gTWF5IGJlIHNldCBieSBicnVzaC5tb3ZlIChvbiBzdGFydCkhXG4gICAgICBpZiAoZW1wdHkoc2VsZWN0aW9uKSkgc3RhdGUuc2VsZWN0aW9uID0gbnVsbCwgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICBlbWl0LmVuZChldmVudCwgbW9kZS5uYW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXlkb3duZWQoZXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIDE2OiB7IC8vIFNISUZUXG4gICAgICAgICAgc2hpZnRpbmcgPSBzaWduWCAmJiBzaWduWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDE4OiB7IC8vIEFMVFxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX0hBTkRMRSkge1xuICAgICAgICAgICAgaWYgKHNpZ25YKSBlMCA9IGUxIC0gZHggKiBzaWduWCwgdzAgPSB3MSArIGR4ICogc2lnblg7XG4gICAgICAgICAgICBpZiAoc2lnblkpIHMwID0gczEgLSBkeSAqIHNpZ25ZLCBuMCA9IG4xICsgZHkgKiBzaWduWTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX0NFTlRFUjtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDMyOiB7IC8vIFNQQUNFOyB0YWtlcyBwcmlvcml0eSBvdmVyIEFMVFxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX0hBTkRMRSB8fCBtb2RlID09PSBNT0RFX0NFTlRFUikge1xuICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZTAgPSBlMSAtIGR4OyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzEgLSBkeDtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczEgLSBkeTsgZWxzZSBpZiAoc2lnblkgPiAwKSBuMCA9IG4xIC0gZHk7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9TUEFDRTtcbiAgICAgICAgICAgIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzLnNlbGVjdGlvbik7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgICAgfVxuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5dXBwZWQoZXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIDE2OiB7IC8vIFNISUZUXG4gICAgICAgICAgaWYgKHNoaWZ0aW5nKSB7XG4gICAgICAgICAgICBsb2NrWCA9IGxvY2tZID0gc2hpZnRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDE4OiB7IC8vIEFMVFxuICAgICAgICAgIGlmIChtb2RlID09PSBNT0RFX0NFTlRFUikge1xuICAgICAgICAgICAgaWYgKHNpZ25YIDwgMCkgZTAgPSBlMTsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxO1xuICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgczAgPSBzMTsgZWxzZSBpZiAoc2lnblkgPiAwKSBuMCA9IG4xO1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfSEFORExFO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMzI6IHsgLy8gU1BBQ0VcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9TUEFDRSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICBpZiAoc2lnblgpIGUwID0gZTEgLSBkeCAqIHNpZ25YLCB3MCA9IHcxICsgZHggKiBzaWduWDtcbiAgICAgICAgICAgICAgaWYgKHNpZ25ZKSBzMCA9IHMxIC0gZHkgKiBzaWduWSwgbjAgPSBuMSArIGR5ICogc2lnblk7XG4gICAgICAgICAgICAgIG1vZGUgPSBNT0RFX0NFTlRFUjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTE7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MTtcbiAgICAgICAgICAgICAgaWYgKHNpZ25ZIDwgMCkgczAgPSBzMTsgZWxzZSBpZiAoc2lnblkgPiAwKSBuMCA9IG4xO1xuICAgICAgICAgICAgICBtb2RlID0gTU9ERV9IQU5ETEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29yc1t0eXBlXSk7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgICAgfVxuICAgICAgbm9ldmVudChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2htb3ZlZChldmVudCkge1xuICAgIGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5tb3ZlZChldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaGVuZGVkKGV2ZW50KSB7XG4gICAgZW1pdHRlcih0aGlzLCBhcmd1bWVudHMpLmVuZGVkKGV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fX2JydXNoIHx8IHtzZWxlY3Rpb246IG51bGx9O1xuICAgIHN0YXRlLmV4dGVudCA9IG51bWJlcjIoZXh0ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIHN0YXRlLmRpbSA9IGRpbTtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICBicnVzaC5leHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZXh0ZW50ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChudW1iZXIyKF8pKSwgYnJ1c2gpIDogZXh0ZW50O1xuICB9O1xuXG4gIGJydXNoLmZpbHRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChmaWx0ZXIgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIGJydXNoKSA6IGZpbHRlcjtcbiAgfTtcblxuICBicnVzaC50b3VjaGFibGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodG91Y2hhYmxlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCBicnVzaCkgOiB0b3VjaGFibGU7XG4gIH07XG5cbiAgYnJ1c2guaGFuZGxlU2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChoYW5kbGVTaXplID0gK18sIGJydXNoKSA6IGhhbmRsZVNpemU7XG4gIH07XG5cbiAgYnJ1c2gua2V5TW9kaWZpZXJzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGtleXMgPSAhIV8sIGJydXNoKSA6IGtleXM7XG4gIH07XG5cbiAgYnJ1c2gub24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSBsaXN0ZW5lcnMub24uYXBwbHkobGlzdGVuZXJzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbGlzdGVuZXJzID8gYnJ1c2ggOiB2YWx1ZTtcbiAgfTtcblxuICByZXR1cm4gYnJ1c2g7XG59XG4iLCAiZXhwb3J0IHZhciBlcHNpbG9uID0gMWUtNjtcbmV4cG9ydCB2YXIgZXBzaWxvbjIgPSAxZS0xMjtcbmV4cG9ydCB2YXIgcGkgPSBNYXRoLlBJO1xuZXhwb3J0IHZhciBoYWxmUGkgPSBwaSAvIDI7XG5leHBvcnQgdmFyIHF1YXJ0ZXJQaSA9IHBpIC8gNDtcbmV4cG9ydCB2YXIgdGF1ID0gcGkgKiAyO1xuXG5leHBvcnQgdmFyIGRlZ3JlZXMgPSAxODAgLyBwaTtcbmV4cG9ydCB2YXIgcmFkaWFucyA9IHBpIC8gMTgwO1xuXG5leHBvcnQgdmFyIGFicyA9IE1hdGguYWJzO1xuZXhwb3J0IHZhciBhdGFuID0gTWF0aC5hdGFuO1xuZXhwb3J0IHZhciBhdGFuMiA9IE1hdGguYXRhbjI7XG5leHBvcnQgdmFyIGNvcyA9IE1hdGguY29zO1xuZXhwb3J0IHZhciBjZWlsID0gTWF0aC5jZWlsO1xuZXhwb3J0IHZhciBleHAgPSBNYXRoLmV4cDtcbmV4cG9ydCB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuZXhwb3J0IHZhciBoeXBvdCA9IE1hdGguaHlwb3Q7XG5leHBvcnQgdmFyIGxvZyA9IE1hdGgubG9nO1xuZXhwb3J0IHZhciBwb3cgPSBNYXRoLnBvdztcbmV4cG9ydCB2YXIgc2luID0gTWF0aC5zaW47XG5leHBvcnQgdmFyIHNpZ24gPSBNYXRoLnNpZ24gfHwgZnVuY3Rpb24oeCkgeyByZXR1cm4geCA+IDAgPyAxIDogeCA8IDAgPyAtMSA6IDA7IH07XG5leHBvcnQgdmFyIHNxcnQgPSBNYXRoLnNxcnQ7XG5leHBvcnQgdmFyIHRhbiA9IE1hdGgudGFuO1xuXG5leHBvcnQgZnVuY3Rpb24gYWNvcyh4KSB7XG4gIHJldHVybiB4ID4gMSA/IDAgOiB4IDwgLTEgPyBwaSA6IE1hdGguYWNvcyh4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzaW4oeCkge1xuICByZXR1cm4geCA+IDEgPyBoYWxmUGkgOiB4IDwgLTEgPyAtaGFsZlBpIDogTWF0aC5hc2luKHgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGF2ZXJzaW4oeCkge1xuICByZXR1cm4gKHggPSBzaW4oeCAvIDIpKSAqIHg7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9vcCgpIHt9XG4iLCAiZnVuY3Rpb24gc3RyZWFtR2VvbWV0cnkoZ2VvbWV0cnksIHN0cmVhbSkge1xuICBpZiAoZ2VvbWV0cnkgJiYgc3RyZWFtR2VvbWV0cnlUeXBlLmhhc093blByb3BlcnR5KGdlb21ldHJ5LnR5cGUpKSB7XG4gICAgc3RyZWFtR2VvbWV0cnlUeXBlW2dlb21ldHJ5LnR5cGVdKGdlb21ldHJ5LCBzdHJlYW0pO1xuICB9XG59XG5cbnZhciBzdHJlYW1PYmplY3RUeXBlID0ge1xuICBGZWF0dXJlOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbUdlb21ldHJ5KG9iamVjdC5nZW9tZXRyeSwgc3RyZWFtKTtcbiAgfSxcbiAgRmVhdHVyZUNvbGxlY3Rpb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGZlYXR1cmVzID0gb2JqZWN0LmZlYXR1cmVzLCBpID0gLTEsIG4gPSBmZWF0dXJlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUdlb21ldHJ5KGZlYXR1cmVzW2ldLmdlb21ldHJ5LCBzdHJlYW0pO1xuICB9XG59O1xuXG52YXIgc3RyZWFtR2VvbWV0cnlUeXBlID0ge1xuICBTcGhlcmU6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtLnNwaGVyZSgpO1xuICB9LFxuICBQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBvYmplY3QgPSBvYmplY3QuY29vcmRpbmF0ZXM7XG4gICAgc3RyZWFtLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICB9LFxuICBNdWx0aVBvaW50OiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBvYmplY3QgPSBjb29yZGluYXRlc1tpXSwgc3RyZWFtLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICB9LFxuICBMaW5lU3RyaW5nOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbUxpbmUob2JqZWN0LmNvb3JkaW5hdGVzLCBzdHJlYW0sIDApO1xuICB9LFxuICBNdWx0aUxpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSwgMCk7XG4gIH0sXG4gIFBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgc3RyZWFtUG9seWdvbihvYmplY3QuY29vcmRpbmF0ZXMsIHN0cmVhbSk7XG4gIH0sXG4gIE11bHRpUG9seWdvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtUG9seWdvbihjb29yZGluYXRlc1tpXSwgc3RyZWFtKTtcbiAgfSxcbiAgR2VvbWV0cnlDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBnZW9tZXRyaWVzID0gb2JqZWN0Lmdlb21ldHJpZXMsIGkgPSAtMSwgbiA9IGdlb21ldHJpZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1HZW9tZXRyeShnZW9tZXRyaWVzW2ldLCBzdHJlYW0pO1xuICB9XG59O1xuXG5mdW5jdGlvbiBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzLCBzdHJlYW0sIGNsb3NlZCkge1xuICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoIC0gY2xvc2VkLCBjb29yZGluYXRlO1xuICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gIHdoaWxlICgrK2kgPCBuKSBjb29yZGluYXRlID0gY29vcmRpbmF0ZXNbaV0sIHN0cmVhbS5wb2ludChjb29yZGluYXRlWzBdLCBjb29yZGluYXRlWzFdLCBjb29yZGluYXRlWzJdKTtcbiAgc3RyZWFtLmxpbmVFbmQoKTtcbn1cblxuZnVuY3Rpb24gc3RyZWFtUG9seWdvbihjb29yZGluYXRlcywgc3RyZWFtKSB7XG4gIHZhciBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gIHN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSwgMSk7XG4gIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gIGlmIChvYmplY3QgJiYgc3RyZWFtT2JqZWN0VHlwZS5oYXNPd25Qcm9wZXJ0eShvYmplY3QudHlwZSkpIHtcbiAgICBzdHJlYW1PYmplY3RUeXBlW29iamVjdC50eXBlXShvYmplY3QsIHN0cmVhbSk7XG4gIH0gZWxzZSB7XG4gICAgc3RyZWFtR2VvbWV0cnkob2JqZWN0LCBzdHJlYW0pO1xuICB9XG59XG4iLCAiaW1wb3J0IHthc2luLCBhdGFuMiwgY29zLCBzaW4sIHNxcnR9IGZyb20gXCIuL21hdGguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNwaGVyaWNhbChjYXJ0ZXNpYW4pIHtcbiAgcmV0dXJuIFthdGFuMihjYXJ0ZXNpYW5bMV0sIGNhcnRlc2lhblswXSksIGFzaW4oY2FydGVzaWFuWzJdKV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW4oc3BoZXJpY2FsKSB7XG4gIHZhciBsYW1iZGEgPSBzcGhlcmljYWxbMF0sIHBoaSA9IHNwaGVyaWNhbFsxXSwgY29zUGhpID0gY29zKHBoaSk7XG4gIHJldHVybiBbY29zUGhpICogY29zKGxhbWJkYSksIGNvc1BoaSAqIHNpbihsYW1iZGEpLCBzaW4ocGhpKV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5Eb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuQ3Jvc3MoYSwgYikge1xuICByZXR1cm4gW2FbMV0gKiBiWzJdIC0gYVsyXSAqIGJbMV0sIGFbMl0gKiBiWzBdIC0gYVswXSAqIGJbMl0sIGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF1dO1xufVxuXG4vLyBUT0RPIHJldHVybiBhXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuQWRkSW5QbGFjZShhLCBiKSB7XG4gIGFbMF0gKz0gYlswXSwgYVsxXSArPSBiWzFdLCBhWzJdICs9IGJbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5TY2FsZSh2ZWN0b3IsIGspIHtcbiAgcmV0dXJuIFt2ZWN0b3JbMF0gKiBrLCB2ZWN0b3JbMV0gKiBrLCB2ZWN0b3JbMl0gKiBrXTtcbn1cblxuLy8gVE9ETyByZXR1cm4gZFxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UoZCkge1xuICB2YXIgbCA9IHNxcnQoZFswXSAqIGRbMF0gKyBkWzFdICogZFsxXSArIGRbMl0gKiBkWzJdKTtcbiAgZFswXSAvPSBsLCBkWzFdIC89IGwsIGRbMl0gLz0gbDtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG5cbiAgZnVuY3Rpb24gY29tcG9zZSh4LCB5KSB7XG4gICAgcmV0dXJuIHggPSBhKHgsIHkpLCBiKHhbMF0sIHhbMV0pO1xuICB9XG5cbiAgaWYgKGEuaW52ZXJ0ICYmIGIuaW52ZXJ0KSBjb21wb3NlLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4geCA9IGIuaW52ZXJ0KHgsIHkpLCB4ICYmIGEuaW52ZXJ0KHhbMF0sIHhbMV0pO1xuICB9O1xuXG4gIHJldHVybiBjb21wb3NlO1xufVxuIiwgImltcG9ydCBjb21wb3NlIGZyb20gXCIuL2NvbXBvc2UuanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBkZWdyZWVzLCBwaSwgcmFkaWFucywgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gcm90YXRpb25JZGVudGl0eShsYW1iZGEsIHBoaSkge1xuICBpZiAoYWJzKGxhbWJkYSkgPiBwaSkgbGFtYmRhIC09IE1hdGgucm91bmQobGFtYmRhIC8gdGF1KSAqIHRhdTtcbiAgcmV0dXJuIFtsYW1iZGEsIHBoaV07XG59XG5cbnJvdGF0aW9uSWRlbnRpdHkuaW52ZXJ0ID0gcm90YXRpb25JZGVudGl0eTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVJhZGlhbnMoZGVsdGFMYW1iZGEsIGRlbHRhUGhpLCBkZWx0YUdhbW1hKSB7XG4gIHJldHVybiAoZGVsdGFMYW1iZGEgJT0gdGF1KSA/IChkZWx0YVBoaSB8fCBkZWx0YUdhbW1hID8gY29tcG9zZShyb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSksIHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpKVxuICAgIDogcm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpKVxuICAgIDogKGRlbHRhUGhpIHx8IGRlbHRhR2FtbWEgPyByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKVxuICAgIDogcm90YXRpb25JZGVudGl0eSk7XG59XG5cbmZ1bmN0aW9uIGZvcndhcmRSb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSkge1xuICByZXR1cm4gZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICBsYW1iZGEgKz0gZGVsdGFMYW1iZGE7XG4gICAgaWYgKGFicyhsYW1iZGEpID4gcGkpIGxhbWJkYSAtPSBNYXRoLnJvdW5kKGxhbWJkYSAvIHRhdSkgKiB0YXU7XG4gICAgcmV0dXJuIFtsYW1iZGEsIHBoaV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSB7XG4gIHZhciByb3RhdGlvbiA9IGZvcndhcmRSb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSk7XG4gIHJvdGF0aW9uLmludmVydCA9IGZvcndhcmRSb3RhdGlvbkxhbWJkYSgtZGVsdGFMYW1iZGEpO1xuICByZXR1cm4gcm90YXRpb247XG59XG5cbmZ1bmN0aW9uIHJvdGF0aW9uUGhpR2FtbWEoZGVsdGFQaGksIGRlbHRhR2FtbWEpIHtcbiAgdmFyIGNvc0RlbHRhUGhpID0gY29zKGRlbHRhUGhpKSxcbiAgICAgIHNpbkRlbHRhUGhpID0gc2luKGRlbHRhUGhpKSxcbiAgICAgIGNvc0RlbHRhR2FtbWEgPSBjb3MoZGVsdGFHYW1tYSksXG4gICAgICBzaW5EZWx0YUdhbW1hID0gc2luKGRlbHRhR2FtbWEpO1xuXG4gIGZ1bmN0aW9uIHJvdGF0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgdmFyIGNvc1BoaSA9IGNvcyhwaGkpLFxuICAgICAgICB4ID0gY29zKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHkgPSBzaW4obGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeiA9IHNpbihwaGkpLFxuICAgICAgICBrID0geiAqIGNvc0RlbHRhUGhpICsgeCAqIHNpbkRlbHRhUGhpO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih5ICogY29zRGVsdGFHYW1tYSAtIGsgKiBzaW5EZWx0YUdhbW1hLCB4ICogY29zRGVsdGFQaGkgLSB6ICogc2luRGVsdGFQaGkpLFxuICAgICAgYXNpbihrICogY29zRGVsdGFHYW1tYSArIHkgKiBzaW5EZWx0YUdhbW1hKVxuICAgIF07XG4gIH1cblxuICByb3RhdGlvbi5pbnZlcnQgPSBmdW5jdGlvbihsYW1iZGEsIHBoaSkge1xuICAgIHZhciBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgICAgeCA9IGNvcyhsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB5ID0gc2luKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHogPSBzaW4ocGhpKSxcbiAgICAgICAgayA9IHogKiBjb3NEZWx0YUdhbW1hIC0geSAqIHNpbkRlbHRhR2FtbWE7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0YW4yKHkgKiBjb3NEZWx0YUdhbW1hICsgeiAqIHNpbkRlbHRhR2FtbWEsIHggKiBjb3NEZWx0YVBoaSArIGsgKiBzaW5EZWx0YVBoaSksXG4gICAgICBhc2luKGsgKiBjb3NEZWx0YVBoaSAtIHggKiBzaW5EZWx0YVBoaSlcbiAgICBdO1xuICB9O1xuXG4gIHJldHVybiByb3RhdGlvbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocm90YXRlKSB7XG4gIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMocm90YXRlWzBdICogcmFkaWFucywgcm90YXRlWzFdICogcmFkaWFucywgcm90YXRlLmxlbmd0aCA+IDIgPyByb3RhdGVbMl0gKiByYWRpYW5zIDogMCk7XG5cbiAgZnVuY3Rpb24gZm9yd2FyZChjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzID0gcm90YXRlKGNvb3JkaW5hdGVzWzBdICogcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiByYWRpYW5zKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gIH1cblxuICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7XG4gICAgY29vcmRpbmF0ZXMgPSByb3RhdGUuaW52ZXJ0KGNvb3JkaW5hdGVzWzBdICogcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiByYWRpYW5zKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gIH07XG5cbiAgcmV0dXJuIGZvcndhcmQ7XG59XG4iLCAiaW1wb3J0IHtjYXJ0ZXNpYW4sIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UsIHNwaGVyaWNhbH0gZnJvbSBcIi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCB7YWNvcywgY29zLCBkZWdyZWVzLCBlcHNpbG9uLCByYWRpYW5zLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtyb3RhdGVSYWRpYW5zfSBmcm9tIFwiLi9yb3RhdGlvbi5qc1wiO1xuXG4vLyBHZW5lcmF0ZXMgYSBjaXJjbGUgY2VudGVyZWQgYXQgWzBcdTAwQjAsIDBcdTAwQjBdLCB3aXRoIGEgZ2l2ZW4gcmFkaXVzIGFuZCBwcmVjaXNpb24uXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlU3RyZWFtKHN0cmVhbSwgcmFkaXVzLCBkZWx0YSwgZGlyZWN0aW9uLCB0MCwgdDEpIHtcbiAgaWYgKCFkZWx0YSkgcmV0dXJuO1xuICB2YXIgY29zUmFkaXVzID0gY29zKHJhZGl1cyksXG4gICAgICBzaW5SYWRpdXMgPSBzaW4ocmFkaXVzKSxcbiAgICAgIHN0ZXAgPSBkaXJlY3Rpb24gKiBkZWx0YTtcbiAgaWYgKHQwID09IG51bGwpIHtcbiAgICB0MCA9IHJhZGl1cyArIGRpcmVjdGlvbiAqIHRhdTtcbiAgICB0MSA9IHJhZGl1cyAtIHN0ZXAgLyAyO1xuICB9IGVsc2Uge1xuICAgIHQwID0gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgdDApO1xuICAgIHQxID0gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgdDEpO1xuICAgIGlmIChkaXJlY3Rpb24gPiAwID8gdDAgPCB0MSA6IHQwID4gdDEpIHQwICs9IGRpcmVjdGlvbiAqIHRhdTtcbiAgfVxuICBmb3IgKHZhciBwb2ludCwgdCA9IHQwOyBkaXJlY3Rpb24gPiAwID8gdCA+IHQxIDogdCA8IHQxOyB0IC09IHN0ZXApIHtcbiAgICBwb2ludCA9IHNwaGVyaWNhbChbY29zUmFkaXVzLCAtc2luUmFkaXVzICogY29zKHQpLCAtc2luUmFkaXVzICogc2luKHQpXSk7XG4gICAgc3RyZWFtLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gIH1cbn1cblxuLy8gUmV0dXJucyB0aGUgc2lnbmVkIGFuZ2xlIG9mIGEgY2FydGVzaWFuIHBvaW50IHJlbGF0aXZlIHRvIFtjb3NSYWRpdXMsIDAsIDBdLlxuZnVuY3Rpb24gY2lyY2xlUmFkaXVzKGNvc1JhZGl1cywgcG9pbnQpIHtcbiAgcG9pbnQgPSBjYXJ0ZXNpYW4ocG9pbnQpLCBwb2ludFswXSAtPSBjb3NSYWRpdXM7XG4gIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UocG9pbnQpO1xuICB2YXIgcmFkaXVzID0gYWNvcygtcG9pbnRbMV0pO1xuICByZXR1cm4gKCgtcG9pbnRbMl0gPCAwID8gLXJhZGl1cyA6IHJhZGl1cykgKyB0YXUgLSBlcHNpbG9uKSAlIHRhdTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBjZW50ZXIgPSBjb25zdGFudChbMCwgMF0pLFxuICAgICAgcmFkaXVzID0gY29uc3RhbnQoOTApLFxuICAgICAgcHJlY2lzaW9uID0gY29uc3RhbnQoMiksXG4gICAgICByaW5nLFxuICAgICAgcm90YXRlLFxuICAgICAgc3RyZWFtID0ge3BvaW50OiBwb2ludH07XG5cbiAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgIHJpbmcucHVzaCh4ID0gcm90YXRlKHgsIHkpKTtcbiAgICB4WzBdICo9IGRlZ3JlZXMsIHhbMV0gKj0gZGVncmVlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNpcmNsZSgpIHtcbiAgICB2YXIgYyA9IGNlbnRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICByID0gcmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKiByYWRpYW5zLFxuICAgICAgICBwID0gcHJlY2lzaW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKiByYWRpYW5zO1xuICAgIHJpbmcgPSBbXTtcbiAgICByb3RhdGUgPSByb3RhdGVSYWRpYW5zKC1jWzBdICogcmFkaWFucywgLWNbMV0gKiByYWRpYW5zLCAwKS5pbnZlcnQ7XG4gICAgY2lyY2xlU3RyZWFtKHN0cmVhbSwgciwgcCwgMSk7XG4gICAgYyA9IHt0eXBlOiBcIlBvbHlnb25cIiwgY29vcmRpbmF0ZXM6IFtyaW5nXX07XG4gICAgcmluZyA9IHJvdGF0ZSA9IG51bGw7XG4gICAgcmV0dXJuIGM7XG4gIH1cblxuICBjaXJjbGUuY2VudGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNlbnRlciA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoWytfWzBdLCArX1sxXV0pLCBjaXJjbGUpIDogY2VudGVyO1xuICB9O1xuXG4gIGNpcmNsZS5yYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGNpcmNsZSkgOiByYWRpdXM7XG4gIH07XG5cbiAgY2lyY2xlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjaXNpb24gPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgY2lyY2xlKSA6IHByZWNpc2lvbjtcbiAgfTtcblxuICByZXR1cm4gY2lyY2xlO1xufVxuIiwgImltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbGluZXMgPSBbXSxcbiAgICAgIGxpbmU7XG4gIHJldHVybiB7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHksIG0pIHtcbiAgICAgIGxpbmUucHVzaChbeCwgeSwgbV0pO1xuICAgIH0sXG4gICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGxpbmVzLnB1c2gobGluZSA9IFtdKTtcbiAgICB9LFxuICAgIGxpbmVFbmQ6IG5vb3AsXG4gICAgcmVqb2luOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAxKSBsaW5lcy5wdXNoKGxpbmVzLnBvcCgpLmNvbmNhdChsaW5lcy5zaGlmdCgpKSk7XG4gICAgfSxcbiAgICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IGxpbmVzO1xuICAgICAgbGluZXMgPSBbXTtcbiAgICAgIGxpbmUgPSBudWxsO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG59XG4iLCAiaW1wb3J0IHthYnMsIGVwc2lsb259IGZyb20gXCIuL21hdGguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYWJzKGFbMF0gLSBiWzBdKSA8IGVwc2lsb24gJiYgYWJzKGFbMV0gLSBiWzFdKSA8IGVwc2lsb247XG59XG4iLCAiaW1wb3J0IHBvaW50RXF1YWwgZnJvbSBcIi4uL3BvaW50RXF1YWwuanNcIjtcbmltcG9ydCB7ZXBzaWxvbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZnVuY3Rpb24gSW50ZXJzZWN0aW9uKHBvaW50LCBwb2ludHMsIG90aGVyLCBlbnRyeSkge1xuICB0aGlzLnggPSBwb2ludDtcbiAgdGhpcy56ID0gcG9pbnRzO1xuICB0aGlzLm8gPSBvdGhlcjsgLy8gYW5vdGhlciBpbnRlcnNlY3Rpb25cbiAgdGhpcy5lID0gZW50cnk7IC8vIGlzIGFuIGVudHJ5P1xuICB0aGlzLnYgPSBmYWxzZTsgLy8gdmlzaXRlZFxuICB0aGlzLm4gPSB0aGlzLnAgPSBudWxsOyAvLyBuZXh0ICYgcHJldmlvdXNcbn1cblxuLy8gQSBnZW5lcmFsaXplZCBwb2x5Z29uIGNsaXBwaW5nIGFsZ29yaXRobTogZ2l2ZW4gYSBwb2x5Z29uIHRoYXQgaGFzIGJlZW4gY3V0XG4vLyBpbnRvIGl0cyB2aXNpYmxlIGxpbmUgc2VnbWVudHMsIGFuZCByZWpvaW5zIHRoZSBzZWdtZW50cyBieSBpbnRlcnBvbGF0aW5nXG4vLyBhbG9uZyB0aGUgY2xpcCBlZGdlLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VnbWVudHMsIGNvbXBhcmVJbnRlcnNlY3Rpb24sIHN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgc3RyZWFtKSB7XG4gIHZhciBzdWJqZWN0ID0gW10sXG4gICAgICBjbGlwID0gW10sXG4gICAgICBpLFxuICAgICAgbjtcblxuICBzZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHNlZ21lbnQpIHtcbiAgICBpZiAoKG4gPSBzZWdtZW50Lmxlbmd0aCAtIDEpIDw9IDApIHJldHVybjtcbiAgICB2YXIgbiwgcDAgPSBzZWdtZW50WzBdLCBwMSA9IHNlZ21lbnRbbl0sIHg7XG5cbiAgICBpZiAocG9pbnRFcXVhbChwMCwgcDEpKSB7XG4gICAgICBpZiAoIXAwWzJdICYmICFwMVsyXSkge1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHN0cmVhbS5wb2ludCgocDAgPSBzZWdtZW50W2ldKVswXSwgcDBbMV0pO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBoYW5kbGUgZGVnZW5lcmF0ZSBjYXNlcyBieSBtb3ZpbmcgdGhlIHBvaW50XG4gICAgICBwMVswXSArPSAyICogZXBzaWxvbjtcbiAgICB9XG5cbiAgICBzdWJqZWN0LnB1c2goeCA9IG5ldyBJbnRlcnNlY3Rpb24ocDAsIHNlZ21lbnQsIG51bGwsIHRydWUpKTtcbiAgICBjbGlwLnB1c2goeC5vID0gbmV3IEludGVyc2VjdGlvbihwMCwgbnVsbCwgeCwgZmFsc2UpKTtcbiAgICBzdWJqZWN0LnB1c2goeCA9IG5ldyBJbnRlcnNlY3Rpb24ocDEsIHNlZ21lbnQsIG51bGwsIGZhbHNlKSk7XG4gICAgY2xpcC5wdXNoKHgubyA9IG5ldyBJbnRlcnNlY3Rpb24ocDEsIG51bGwsIHgsIHRydWUpKTtcbiAgfSk7XG5cbiAgaWYgKCFzdWJqZWN0Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIGNsaXAuc29ydChjb21wYXJlSW50ZXJzZWN0aW9uKTtcbiAgbGluayhzdWJqZWN0KTtcbiAgbGluayhjbGlwKTtcblxuICBmb3IgKGkgPSAwLCBuID0gY2xpcC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBjbGlwW2ldLmUgPSBzdGFydEluc2lkZSA9ICFzdGFydEluc2lkZTtcbiAgfVxuXG4gIHZhciBzdGFydCA9IHN1YmplY3RbMF0sXG4gICAgICBwb2ludHMsXG4gICAgICBwb2ludDtcblxuICB3aGlsZSAoMSkge1xuICAgIC8vIEZpbmQgZmlyc3QgdW52aXNpdGVkIGludGVyc2VjdGlvbi5cbiAgICB2YXIgY3VycmVudCA9IHN0YXJ0LFxuICAgICAgICBpc1N1YmplY3QgPSB0cnVlO1xuICAgIHdoaWxlIChjdXJyZW50LnYpIGlmICgoY3VycmVudCA9IGN1cnJlbnQubikgPT09IHN0YXJ0KSByZXR1cm47XG4gICAgcG9pbnRzID0gY3VycmVudC56O1xuICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICBkbyB7XG4gICAgICBjdXJyZW50LnYgPSBjdXJyZW50Lm8udiA9IHRydWU7XG4gICAgICBpZiAoY3VycmVudC5lKSB7XG4gICAgICAgIGlmIChpc1N1YmplY3QpIHtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBuID0gcG9pbnRzLmxlbmd0aDsgaSA8IG47ICsraSkgc3RyZWFtLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShjdXJyZW50LngsIGN1cnJlbnQubi54LCAxLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgcG9pbnRzID0gY3VycmVudC5wLno7XG4gICAgICAgICAgZm9yIChpID0gcG9pbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSBzdHJlYW0ucG9pbnQoKHBvaW50ID0gcG9pbnRzW2ldKVswXSwgcG9pbnRbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGludGVycG9sYXRlKGN1cnJlbnQueCwgY3VycmVudC5wLngsIC0xLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnA7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5vO1xuICAgICAgcG9pbnRzID0gY3VycmVudC56O1xuICAgICAgaXNTdWJqZWN0ID0gIWlzU3ViamVjdDtcbiAgICB9IHdoaWxlICghY3VycmVudC52KTtcbiAgICBzdHJlYW0ubGluZUVuZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxpbmsoYXJyYXkpIHtcbiAgaWYgKCEobiA9IGFycmF5Lmxlbmd0aCkpIHJldHVybjtcbiAgdmFyIG4sXG4gICAgICBpID0gMCxcbiAgICAgIGEgPSBhcnJheVswXSxcbiAgICAgIGI7XG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgYS5uID0gYiA9IGFycmF5W2ldO1xuICAgIGIucCA9IGE7XG4gICAgYSA9IGI7XG4gIH1cbiAgYS5uID0gYiA9IGFycmF5WzBdO1xuICBiLnAgPSBhO1xufVxuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtjYXJ0ZXNpYW4sIGNhcnRlc2lhbkNyb3NzLCBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlfSBmcm9tIFwiLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBlcHNpbG9uLCBlcHNpbG9uMiwgaGFsZlBpLCBwaSwgcXVhcnRlclBpLCBzaWduLCBzaW4sIHRhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBsb25naXR1ZGUocG9pbnQpIHtcbiAgcmV0dXJuIGFicyhwb2ludFswXSkgPD0gcGkgPyBwb2ludFswXSA6IHNpZ24ocG9pbnRbMF0pICogKChhYnMocG9pbnRbMF0pICsgcGkpICUgdGF1IC0gcGkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwb2x5Z29uLCBwb2ludCkge1xuICB2YXIgbGFtYmRhID0gbG9uZ2l0dWRlKHBvaW50KSxcbiAgICAgIHBoaSA9IHBvaW50WzFdLFxuICAgICAgc2luUGhpID0gc2luKHBoaSksXG4gICAgICBub3JtYWwgPSBbc2luKGxhbWJkYSksIC1jb3MobGFtYmRhKSwgMF0sXG4gICAgICBhbmdsZSA9IDAsXG4gICAgICB3aW5kaW5nID0gMDtcblxuICB2YXIgc3VtID0gbmV3IEFkZGVyKCk7XG5cbiAgaWYgKHNpblBoaSA9PT0gMSkgcGhpID0gaGFsZlBpICsgZXBzaWxvbjtcbiAgZWxzZSBpZiAoc2luUGhpID09PSAtMSkgcGhpID0gLWhhbGZQaSAtIGVwc2lsb247XG5cbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2x5Z29uLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKG0gPSAocmluZyA9IHBvbHlnb25baV0pLmxlbmd0aCkpIGNvbnRpbnVlO1xuICAgIHZhciByaW5nLFxuICAgICAgICBtLFxuICAgICAgICBwb2ludDAgPSByaW5nW20gLSAxXSxcbiAgICAgICAgbGFtYmRhMCA9IGxvbmdpdHVkZShwb2ludDApLFxuICAgICAgICBwaGkwID0gcG9pbnQwWzFdIC8gMiArIHF1YXJ0ZXJQaSxcbiAgICAgICAgc2luUGhpMCA9IHNpbihwaGkwKSxcbiAgICAgICAgY29zUGhpMCA9IGNvcyhwaGkwKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbTsgKytqLCBsYW1iZGEwID0gbGFtYmRhMSwgc2luUGhpMCA9IHNpblBoaTEsIGNvc1BoaTAgPSBjb3NQaGkxLCBwb2ludDAgPSBwb2ludDEpIHtcbiAgICAgIHZhciBwb2ludDEgPSByaW5nW2pdLFxuICAgICAgICAgIGxhbWJkYTEgPSBsb25naXR1ZGUocG9pbnQxKSxcbiAgICAgICAgICBwaGkxID0gcG9pbnQxWzFdIC8gMiArIHF1YXJ0ZXJQaSxcbiAgICAgICAgICBzaW5QaGkxID0gc2luKHBoaTEpLFxuICAgICAgICAgIGNvc1BoaTEgPSBjb3MocGhpMSksXG4gICAgICAgICAgZGVsdGEgPSBsYW1iZGExIC0gbGFtYmRhMCxcbiAgICAgICAgICBzaWduID0gZGVsdGEgPj0gMCA/IDEgOiAtMSxcbiAgICAgICAgICBhYnNEZWx0YSA9IHNpZ24gKiBkZWx0YSxcbiAgICAgICAgICBhbnRpbWVyaWRpYW4gPSBhYnNEZWx0YSA+IHBpLFxuICAgICAgICAgIGsgPSBzaW5QaGkwICogc2luUGhpMTtcblxuICAgICAgc3VtLmFkZChhdGFuMihrICogc2lnbiAqIHNpbihhYnNEZWx0YSksIGNvc1BoaTAgKiBjb3NQaGkxICsgayAqIGNvcyhhYnNEZWx0YSkpKTtcbiAgICAgIGFuZ2xlICs9IGFudGltZXJpZGlhbiA/IGRlbHRhICsgc2lnbiAqIHRhdSA6IGRlbHRhO1xuXG4gICAgICAvLyBBcmUgdGhlIGxvbmdpdHVkZXMgZWl0aGVyIHNpZGUgb2YgdGhlIHBvaW50XHUyMDE5cyBtZXJpZGlhbiAobGFtYmRhKSxcbiAgICAgIC8vIGFuZCBhcmUgdGhlIGxhdGl0dWRlcyBzbWFsbGVyIHRoYW4gdGhlIHBhcmFsbGVsIChwaGkpP1xuICAgICAgaWYgKGFudGltZXJpZGlhbiBeIGxhbWJkYTAgPj0gbGFtYmRhIF4gbGFtYmRhMSA+PSBsYW1iZGEpIHtcbiAgICAgICAgdmFyIGFyYyA9IGNhcnRlc2lhbkNyb3NzKGNhcnRlc2lhbihwb2ludDApLCBjYXJ0ZXNpYW4ocG9pbnQxKSk7XG4gICAgICAgIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UoYXJjKTtcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbiA9IGNhcnRlc2lhbkNyb3NzKG5vcm1hbCwgYXJjKTtcbiAgICAgICAgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZShpbnRlcnNlY3Rpb24pO1xuICAgICAgICB2YXIgcGhpQXJjID0gKGFudGltZXJpZGlhbiBeIGRlbHRhID49IDAgPyAtMSA6IDEpICogYXNpbihpbnRlcnNlY3Rpb25bMl0pO1xuICAgICAgICBpZiAocGhpID4gcGhpQXJjIHx8IHBoaSA9PT0gcGhpQXJjICYmIChhcmNbMF0gfHwgYXJjWzFdKSkge1xuICAgICAgICAgIHdpbmRpbmcgKz0gYW50aW1lcmlkaWFuIF4gZGVsdGEgPj0gMCA/IDEgOiAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEZpcnN0LCBkZXRlcm1pbmUgd2hldGhlciB0aGUgU291dGggcG9sZSBpcyBpbnNpZGUgb3Igb3V0c2lkZTpcbiAgLy9cbiAgLy8gSXQgaXMgaW5zaWRlIGlmOlxuICAvLyAqIHRoZSBwb2x5Z29uIHdpbmRzIGFyb3VuZCBpdCBpbiBhIGNsb2Nrd2lzZSBkaXJlY3Rpb24uXG4gIC8vICogdGhlIHBvbHlnb24gZG9lcyBub3QgKGN1bXVsYXRpdmVseSkgd2luZCBhcm91bmQgaXQsIGJ1dCBoYXMgYSBuZWdhdGl2ZVxuICAvLyAgIChjb3VudGVyLWNsb2Nrd2lzZSkgYXJlYS5cbiAgLy9cbiAgLy8gU2Vjb25kLCBjb3VudCB0aGUgKHNpZ25lZCkgbnVtYmVyIG9mIHRpbWVzIGEgc2VnbWVudCBjcm9zc2VzIGEgbGFtYmRhXG4gIC8vIGZyb20gdGhlIHBvaW50IHRvIHRoZSBTb3V0aCBwb2xlLiAgSWYgaXQgaXMgemVybywgdGhlbiB0aGUgcG9pbnQgaXMgdGhlXG4gIC8vIHNhbWUgc2lkZSBhcyB0aGUgU291dGggcG9sZS5cblxuICByZXR1cm4gKGFuZ2xlIDwgLWVwc2lsb24gfHwgYW5nbGUgPCBlcHNpbG9uICYmIHN1bSA8IC1lcHNpbG9uMikgXiAod2luZGluZyAmIDEpO1xufVxuIiwgImltcG9ydCBjbGlwQnVmZmVyIGZyb20gXCIuL2J1ZmZlci5qc1wiO1xuaW1wb3J0IGNsaXBSZWpvaW4gZnJvbSBcIi4vcmVqb2luLmpzXCI7XG5pbXBvcnQge2Vwc2lsb24sIGhhbGZQaX0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBwb2x5Z29uQ29udGFpbnMgZnJvbSBcIi4uL3BvbHlnb25Db250YWlucy5qc1wiO1xuaW1wb3J0IHttZXJnZX0gZnJvbSBcImQzLWFycmF5XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHBvaW50VmlzaWJsZSwgY2xpcExpbmUsIGludGVycG9sYXRlLCBzdGFydCkge1xuICByZXR1cm4gZnVuY3Rpb24oc2luaykge1xuICAgIHZhciBsaW5lID0gY2xpcExpbmUoc2luayksXG4gICAgICAgIHJpbmdCdWZmZXIgPSBjbGlwQnVmZmVyKCksXG4gICAgICAgIHJpbmdTaW5rID0gY2xpcExpbmUocmluZ0J1ZmZlciksXG4gICAgICAgIHBvbHlnb25TdGFydGVkID0gZmFsc2UsXG4gICAgICAgIHBvbHlnb24sXG4gICAgICAgIHNlZ21lbnRzLFxuICAgICAgICByaW5nO1xuXG4gICAgdmFyIGNsaXAgPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnRSaW5nO1xuICAgICAgICBjbGlwLmxpbmVTdGFydCA9IHJpbmdTdGFydDtcbiAgICAgICAgY2xpcC5saW5lRW5kID0gcmluZ0VuZDtcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgcG9seWdvbiA9IFtdO1xuICAgICAgfSxcbiAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgIGNsaXAubGluZVN0YXJ0ID0gbGluZVN0YXJ0O1xuICAgICAgICBjbGlwLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgICBzZWdtZW50cyA9IG1lcmdlKHNlZ21lbnRzKTtcbiAgICAgICAgdmFyIHN0YXJ0SW5zaWRlID0gcG9seWdvbkNvbnRhaW5zKHBvbHlnb24sIHN0YXJ0KTtcbiAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBjbGlwUmVqb2luKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHNpbmspO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0SW5zaWRlKSB7XG4gICAgICAgICAgaWYgKCFwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uU3RhcnQoKSwgcG9seWdvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgIHNpbmsubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc2luayk7XG4gICAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25FbmQoKSwgcG9seWdvblN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgc2VnbWVudHMgPSBwb2x5Z29uID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5rLnBvbHlnb25TdGFydCgpO1xuICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBzaW5rKTtcbiAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIHNpbmsucG9seWdvbkVuZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwb2ludChsYW1iZGEsIHBoaSkge1xuICAgICAgaWYgKHBvaW50VmlzaWJsZShsYW1iZGEsIHBoaSkpIHNpbmsucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvaW50TGluZShsYW1iZGEsIHBoaSkge1xuICAgICAgbGluZS5wb2ludChsYW1iZGEsIHBoaSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgY2xpcC5wb2ludCA9IHBvaW50TGluZTtcbiAgICAgIGxpbmUubGluZVN0YXJ0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIGNsaXAucG9pbnQgPSBwb2ludDtcbiAgICAgIGxpbmUubGluZUVuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvaW50UmluZyhsYW1iZGEsIHBoaSkge1xuICAgICAgcmluZy5wdXNoKFtsYW1iZGEsIHBoaV0pO1xuICAgICAgcmluZ1NpbmsucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdTdGFydCgpIHtcbiAgICAgIHJpbmdTaW5rLmxpbmVTdGFydCgpO1xuICAgICAgcmluZyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdFbmQoKSB7XG4gICAgICBwb2ludFJpbmcocmluZ1swXVswXSwgcmluZ1swXVsxXSk7XG4gICAgICByaW5nU2luay5saW5lRW5kKCk7XG5cbiAgICAgIHZhciBjbGVhbiA9IHJpbmdTaW5rLmNsZWFuKCksXG4gICAgICAgICAgcmluZ1NlZ21lbnRzID0gcmluZ0J1ZmZlci5yZXN1bHQoKSxcbiAgICAgICAgICBpLCBuID0gcmluZ1NlZ21lbnRzLmxlbmd0aCwgbSxcbiAgICAgICAgICBzZWdtZW50LFxuICAgICAgICAgIHBvaW50O1xuXG4gICAgICByaW5nLnBvcCgpO1xuICAgICAgcG9seWdvbi5wdXNoKHJpbmcpO1xuICAgICAgcmluZyA9IG51bGw7XG5cbiAgICAgIGlmICghbikgcmV0dXJuO1xuXG4gICAgICAvLyBObyBpbnRlcnNlY3Rpb25zLlxuICAgICAgaWYgKGNsZWFuICYgMSkge1xuICAgICAgICBzZWdtZW50ID0gcmluZ1NlZ21lbnRzWzBdO1xuICAgICAgICBpZiAoKG0gPSBzZWdtZW50Lmxlbmd0aCAtIDEpID4gMCkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIHNpbmsucG9pbnQoKHBvaW50ID0gc2VnbWVudFtpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgICBzaW5rLmxpbmVFbmQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFJlam9pbiBjb25uZWN0ZWQgc2VnbWVudHMuXG4gICAgICAvLyBUT0RPIHJldXNlIHJpbmdCdWZmZXIucmVqb2luKCk/XG4gICAgICBpZiAobiA+IDEgJiYgY2xlYW4gJiAyKSByaW5nU2VnbWVudHMucHVzaChyaW5nU2VnbWVudHMucG9wKCkuY29uY2F0KHJpbmdTZWdtZW50cy5zaGlmdCgpKSk7XG5cbiAgICAgIHNlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLmZpbHRlcih2YWxpZFNlZ21lbnQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xpcDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRTZWdtZW50KHNlZ21lbnQpIHtcbiAgcmV0dXJuIHNlZ21lbnQubGVuZ3RoID4gMTtcbn1cblxuLy8gSW50ZXJzZWN0aW9ucyBhcmUgc29ydGVkIGFsb25nIHRoZSBjbGlwIGVkZ2UuIEZvciBib3RoIGFudGltZXJpZGlhbiBjdXR0aW5nXG4vLyBhbmQgY2lyY2xlIGNsaXBwaW5nLCB0aGUgc2FtZSBjb21wYXJpc29uIGlzIHVzZWQuXG5mdW5jdGlvbiBjb21wYXJlSW50ZXJzZWN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuICgoYSA9IGEueClbMF0gPCAwID8gYVsxXSAtIGhhbGZQaSAtIGVwc2lsb24gOiBoYWxmUGkgLSBhWzFdKVxuICAgICAgIC0gKChiID0gYi54KVswXSA8IDAgPyBiWzFdIC0gaGFsZlBpIC0gZXBzaWxvbiA6IGhhbGZQaSAtIGJbMV0pO1xufVxuIiwgImltcG9ydCBjbGlwIGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge2FicywgYXRhbiwgY29zLCBlcHNpbG9uLCBoYWxmUGksIHBpLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsaXAoXG4gIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgY2xpcEFudGltZXJpZGlhbkxpbmUsXG4gIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnBvbGF0ZSxcbiAgWy1waSwgLWhhbGZQaV1cbik7XG5cbi8vIFRha2VzIGEgbGluZSBhbmQgY3V0cyBpbnRvIHZpc2libGUgc2VnbWVudHMuIFJldHVybiB2YWx1ZXM6IDAgLSB0aGVyZSB3ZXJlXG4vLyBpbnRlcnNlY3Rpb25zIG9yIHRoZSBsaW5lIHdhcyBlbXB0eTsgMSAtIG5vIGludGVyc2VjdGlvbnM7IDIgLSB0aGVyZSB3ZXJlXG4vLyBpbnRlcnNlY3Rpb25zLCBhbmQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzIHNob3VsZCBiZSByZWpvaW5lZC5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5MaW5lKHN0cmVhbSkge1xuICB2YXIgbGFtYmRhMCA9IE5hTixcbiAgICAgIHBoaTAgPSBOYU4sXG4gICAgICBzaWduMCA9IE5hTixcbiAgICAgIGNsZWFuOyAvLyBubyBpbnRlcnNlY3Rpb25zXG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgY2xlYW4gPSAxO1xuICAgIH0sXG4gICAgcG9pbnQ6IGZ1bmN0aW9uKGxhbWJkYTEsIHBoaTEpIHtcbiAgICAgIHZhciBzaWduMSA9IGxhbWJkYTEgPiAwID8gcGkgOiAtcGksXG4gICAgICAgICAgZGVsdGEgPSBhYnMobGFtYmRhMSAtIGxhbWJkYTApO1xuICAgICAgaWYgKGFicyhkZWx0YSAtIHBpKSA8IGVwc2lsb24pIHsgLy8gbGluZSBjcm9zc2VzIGEgcG9sZVxuICAgICAgICBzdHJlYW0ucG9pbnQobGFtYmRhMCwgcGhpMCA9IChwaGkwICsgcGhpMSkgLyAyID4gMCA/IGhhbGZQaSA6IC1oYWxmUGkpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjAsIHBoaTApO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMSwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChsYW1iZGExLCBwaGkwKTtcbiAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgfSBlbHNlIGlmIChzaWduMCAhPT0gc2lnbjEgJiYgZGVsdGEgPj0gcGkpIHsgLy8gbGluZSBjcm9zc2VzIGFudGltZXJpZGlhblxuICAgICAgICBpZiAoYWJzKGxhbWJkYTAgLSBzaWduMCkgPCBlcHNpbG9uKSBsYW1iZGEwIC09IHNpZ24wICogZXBzaWxvbjsgLy8gaGFuZGxlIGRlZ2VuZXJhY2llc1xuICAgICAgICBpZiAoYWJzKGxhbWJkYTEgLSBzaWduMSkgPCBlcHNpbG9uKSBsYW1iZGExIC09IHNpZ24xICogZXBzaWxvbjtcbiAgICAgICAgcGhpMCA9IGNsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QobGFtYmRhMCwgcGhpMCwgbGFtYmRhMSwgcGhpMSk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMCwgcGhpMCk7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24xLCBwaGkwKTtcbiAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgfVxuICAgICAgc3RyZWFtLnBvaW50KGxhbWJkYTAgPSBsYW1iZGExLCBwaGkwID0gcGhpMSk7XG4gICAgICBzaWduMCA9IHNpZ24xO1xuICAgIH0sXG4gICAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgbGFtYmRhMCA9IHBoaTAgPSBOYU47XG4gICAgfSxcbiAgICBjbGVhbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMiAtIGNsZWFuOyAvLyBpZiBpbnRlcnNlY3Rpb25zLCByZWpvaW4gZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QobGFtYmRhMCwgcGhpMCwgbGFtYmRhMSwgcGhpMSkge1xuICB2YXIgY29zUGhpMCxcbiAgICAgIGNvc1BoaTEsXG4gICAgICBzaW5MYW1iZGEwTGFtYmRhMSA9IHNpbihsYW1iZGEwIC0gbGFtYmRhMSk7XG4gIHJldHVybiBhYnMoc2luTGFtYmRhMExhbWJkYTEpID4gZXBzaWxvblxuICAgICAgPyBhdGFuKChzaW4ocGhpMCkgKiAoY29zUGhpMSA9IGNvcyhwaGkxKSkgKiBzaW4obGFtYmRhMSlcbiAgICAgICAgICAtIHNpbihwaGkxKSAqIChjb3NQaGkwID0gY29zKHBoaTApKSAqIHNpbihsYW1iZGEwKSlcbiAgICAgICAgICAvIChjb3NQaGkwICogY29zUGhpMSAqIHNpbkxhbWJkYTBMYW1iZGExKSlcbiAgICAgIDogKHBoaTAgKyBwaGkxKSAvIDI7XG59XG5cbmZ1bmN0aW9uIGNsaXBBbnRpbWVyaWRpYW5JbnRlcnBvbGF0ZShmcm9tLCB0bywgZGlyZWN0aW9uLCBzdHJlYW0pIHtcbiAgdmFyIHBoaTtcbiAgaWYgKGZyb20gPT0gbnVsbCkge1xuICAgIHBoaSA9IGRpcmVjdGlvbiAqIGhhbGZQaTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludChwaSwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIDApO1xuICAgIHN0cmVhbS5wb2ludChwaSwgLXBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIDApO1xuICAgIHN0cmVhbS5wb2ludCgtcGksIHBoaSk7XG4gIH0gZWxzZSBpZiAoYWJzKGZyb21bMF0gLSB0b1swXSkgPiBlcHNpbG9uKSB7XG4gICAgdmFyIGxhbWJkYSA9IGZyb21bMF0gPCB0b1swXSA/IHBpIDogLXBpO1xuICAgIHBoaSA9IGRpcmVjdGlvbiAqIGxhbWJkYSAvIDI7XG4gICAgc3RyZWFtLnBvaW50KC1sYW1iZGEsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KDAsIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgfSBlbHNlIHtcbiAgICBzdHJlYW0ucG9pbnQodG9bMF0sIHRvWzFdKTtcbiAgfVxufVxuIiwgImltcG9ydCB7Y2FydGVzaWFuLCBjYXJ0ZXNpYW5BZGRJblBsYWNlLCBjYXJ0ZXNpYW5Dcm9zcywgY2FydGVzaWFuRG90LCBjYXJ0ZXNpYW5TY2FsZSwgc3BoZXJpY2FsfSBmcm9tIFwiLi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2NpcmNsZVN0cmVhbX0gZnJvbSBcIi4uL2NpcmNsZS5qc1wiO1xuaW1wb3J0IHthYnMsIGNvcywgZXBzaWxvbiwgcGksIHJhZGlhbnMsIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgcG9pbnRFcXVhbCBmcm9tIFwiLi4vcG9pbnRFcXVhbC5qc1wiO1xuaW1wb3J0IGNsaXAgZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocmFkaXVzKSB7XG4gIHZhciBjciA9IGNvcyhyYWRpdXMpLFxuICAgICAgZGVsdGEgPSAyICogcmFkaWFucyxcbiAgICAgIHNtYWxsUmFkaXVzID0gY3IgPiAwLFxuICAgICAgbm90SGVtaXNwaGVyZSA9IGFicyhjcikgPiBlcHNpbG9uOyAvLyBUT0RPIG9wdGltaXNlIGZvciB0aGlzIGNvbW1vbiBjYXNlXG5cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gICAgY2lyY2xlU3RyZWFtKHN0cmVhbSwgcmFkaXVzLCBkZWx0YSwgZGlyZWN0aW9uLCBmcm9tLCB0byk7XG4gIH1cblxuICBmdW5jdGlvbiB2aXNpYmxlKGxhbWJkYSwgcGhpKSB7XG4gICAgcmV0dXJuIGNvcyhsYW1iZGEpICogY29zKHBoaSkgPiBjcjtcbiAgfVxuXG4gIC8vIFRha2VzIGEgbGluZSBhbmQgY3V0cyBpbnRvIHZpc2libGUgc2VnbWVudHMuIFJldHVybiB2YWx1ZXMgdXNlZCBmb3IgcG9seWdvblxuICAvLyBjbGlwcGluZzogMCAtIHRoZXJlIHdlcmUgaW50ZXJzZWN0aW9ucyBvciB0aGUgbGluZSB3YXMgZW1wdHk7IDEgLSBub1xuICAvLyBpbnRlcnNlY3Rpb25zIDIgLSB0aGVyZSB3ZXJlIGludGVyc2VjdGlvbnMsIGFuZCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgLy8gc2hvdWxkIGJlIHJlam9pbmVkLlxuICBmdW5jdGlvbiBjbGlwTGluZShzdHJlYW0pIHtcbiAgICB2YXIgcG9pbnQwLCAvLyBwcmV2aW91cyBwb2ludFxuICAgICAgICBjMCwgLy8gY29kZSBmb3IgcHJldmlvdXMgcG9pbnRcbiAgICAgICAgdjAsIC8vIHZpc2liaWxpdHkgb2YgcHJldmlvdXMgcG9pbnRcbiAgICAgICAgdjAwLCAvLyB2aXNpYmlsaXR5IG9mIGZpcnN0IHBvaW50XG4gICAgICAgIGNsZWFuOyAvLyBubyBpbnRlcnNlY3Rpb25zXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHYwMCA9IHYwID0gZmFsc2U7XG4gICAgICAgIGNsZWFuID0gMTtcbiAgICAgIH0sXG4gICAgICBwb2ludDogZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICAgICAgdmFyIHBvaW50MSA9IFtsYW1iZGEsIHBoaV0sXG4gICAgICAgICAgICBwb2ludDIsXG4gICAgICAgICAgICB2ID0gdmlzaWJsZShsYW1iZGEsIHBoaSksXG4gICAgICAgICAgICBjID0gc21hbGxSYWRpdXNcbiAgICAgICAgICAgICAgPyB2ID8gMCA6IGNvZGUobGFtYmRhLCBwaGkpXG4gICAgICAgICAgICAgIDogdiA/IGNvZGUobGFtYmRhICsgKGxhbWJkYSA8IDAgPyBwaSA6IC1waSksIHBoaSkgOiAwO1xuICAgICAgICBpZiAoIXBvaW50MCAmJiAodjAwID0gdjAgPSB2KSkgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBpZiAodiAhPT0gdjApIHtcbiAgICAgICAgICBwb2ludDIgPSBpbnRlcnNlY3QocG9pbnQwLCBwb2ludDEpO1xuICAgICAgICAgIGlmICghcG9pbnQyIHx8IHBvaW50RXF1YWwocG9pbnQwLCBwb2ludDIpIHx8IHBvaW50RXF1YWwocG9pbnQxLCBwb2ludDIpKVxuICAgICAgICAgICAgcG9pbnQxWzJdID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodiAhPT0gdjApIHtcbiAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIC8vIG91dHNpZGUgZ29pbmcgaW5cbiAgICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDEsIHBvaW50MCk7XG4gICAgICAgICAgICBzdHJlYW0ucG9pbnQocG9pbnQyWzBdLCBwb2ludDJbMV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpbnNpZGUgZ29pbmcgb3V0XG4gICAgICAgICAgICBwb2ludDIgPSBpbnRlcnNlY3QocG9pbnQwLCBwb2ludDEpO1xuICAgICAgICAgICAgc3RyZWFtLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdLCAyKTtcbiAgICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50MCA9IHBvaW50MjtcbiAgICAgICAgfSBlbHNlIGlmIChub3RIZW1pc3BoZXJlICYmIHBvaW50MCAmJiBzbWFsbFJhZGl1cyBeIHYpIHtcbiAgICAgICAgICB2YXIgdDtcbiAgICAgICAgICAvLyBJZiB0aGUgY29kZXMgZm9yIHR3byBwb2ludHMgYXJlIGRpZmZlcmVudCwgb3IgYXJlIGJvdGggemVybyxcbiAgICAgICAgICAvLyBhbmQgdGhlcmUgdGhpcyBzZWdtZW50IGludGVyc2VjdHMgd2l0aCB0aGUgc21hbGwgY2lyY2xlLlxuICAgICAgICAgIGlmICghKGMgJiBjMCkgJiYgKHQgPSBpbnRlcnNlY3QocG9pbnQxLCBwb2ludDAsIHRydWUpKSkge1xuICAgICAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgICAgICAgaWYgKHNtYWxsUmFkaXVzKSB7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMF1bMF0sIHRbMF1bMV0pO1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFsxXVswXSwgdFsxXVsxXSk7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHJlYW0ucG9pbnQodFsxXVswXSwgdFsxXVsxXSk7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMF1bMF0sIHRbMF1bMV0sIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodiAmJiAoIXBvaW50MCB8fCAhcG9pbnRFcXVhbChwb2ludDAsIHBvaW50MSkpKSB7XG4gICAgICAgICAgc3RyZWFtLnBvaW50KHBvaW50MVswXSwgcG9pbnQxWzFdKTtcbiAgICAgICAgfVxuICAgICAgICBwb2ludDAgPSBwb2ludDEsIHYwID0gdiwgYzAgPSBjO1xuICAgICAgfSxcbiAgICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodjApIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIHBvaW50MCA9IG51bGw7XG4gICAgICB9LFxuICAgICAgLy8gUmVqb2luIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzIGlmIHRoZXJlIHdlcmUgaW50ZXJzZWN0aW9ucyBhbmQgdGhlIGZpcnN0XG4gICAgICAvLyBhbmQgbGFzdCBwb2ludHMgd2VyZSB2aXNpYmxlLlxuICAgICAgY2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2xlYW4gfCAoKHYwMCAmJiB2MCkgPDwgMSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIEludGVyc2VjdHMgdGhlIGdyZWF0IGNpcmNsZSBiZXR3ZWVuIGEgYW5kIGIgd2l0aCB0aGUgY2xpcCBjaXJjbGUuXG4gIGZ1bmN0aW9uIGludGVyc2VjdChhLCBiLCB0d28pIHtcbiAgICB2YXIgcGEgPSBjYXJ0ZXNpYW4oYSksXG4gICAgICAgIHBiID0gY2FydGVzaWFuKGIpO1xuXG4gICAgLy8gV2UgaGF2ZSB0d28gcGxhbmVzLCBuMS5wID0gZDEgYW5kIG4yLnAgPSBkMi5cbiAgICAvLyBGaW5kIGludGVyc2VjdGlvbiBsaW5lIHAodCkgPSBjMSBuMSArIGMyIG4yICsgdCAobjEgXHUyQTJGIG4yKS5cbiAgICB2YXIgbjEgPSBbMSwgMCwgMF0sIC8vIG5vcm1hbFxuICAgICAgICBuMiA9IGNhcnRlc2lhbkNyb3NzKHBhLCBwYiksXG4gICAgICAgIG4ybjIgPSBjYXJ0ZXNpYW5Eb3QobjIsIG4yKSxcbiAgICAgICAgbjFuMiA9IG4yWzBdLCAvLyBjYXJ0ZXNpYW5Eb3QobjEsIG4yKSxcbiAgICAgICAgZGV0ZXJtaW5hbnQgPSBuMm4yIC0gbjFuMiAqIG4xbjI7XG5cbiAgICAvLyBUd28gcG9sYXIgcG9pbnRzLlxuICAgIGlmICghZGV0ZXJtaW5hbnQpIHJldHVybiAhdHdvICYmIGE7XG5cbiAgICB2YXIgYzEgPSAgY3IgKiBuMm4yIC8gZGV0ZXJtaW5hbnQsXG4gICAgICAgIGMyID0gLWNyICogbjFuMiAvIGRldGVybWluYW50LFxuICAgICAgICBuMXhuMiA9IGNhcnRlc2lhbkNyb3NzKG4xLCBuMiksXG4gICAgICAgIEEgPSBjYXJ0ZXNpYW5TY2FsZShuMSwgYzEpLFxuICAgICAgICBCID0gY2FydGVzaWFuU2NhbGUobjIsIGMyKTtcbiAgICBjYXJ0ZXNpYW5BZGRJblBsYWNlKEEsIEIpO1xuXG4gICAgLy8gU29sdmUgfHAodCl8XjIgPSAxLlxuICAgIHZhciB1ID0gbjF4bjIsXG4gICAgICAgIHcgPSBjYXJ0ZXNpYW5Eb3QoQSwgdSksXG4gICAgICAgIHV1ID0gY2FydGVzaWFuRG90KHUsIHUpLFxuICAgICAgICB0MiA9IHcgKiB3IC0gdXUgKiAoY2FydGVzaWFuRG90KEEsIEEpIC0gMSk7XG5cbiAgICBpZiAodDIgPCAwKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IHNxcnQodDIpLFxuICAgICAgICBxID0gY2FydGVzaWFuU2NhbGUodSwgKC13IC0gdCkgLyB1dSk7XG4gICAgY2FydGVzaWFuQWRkSW5QbGFjZShxLCBBKTtcbiAgICBxID0gc3BoZXJpY2FsKHEpO1xuXG4gICAgaWYgKCF0d28pIHJldHVybiBxO1xuXG4gICAgLy8gVHdvIGludGVyc2VjdGlvbiBwb2ludHMuXG4gICAgdmFyIGxhbWJkYTAgPSBhWzBdLFxuICAgICAgICBsYW1iZGExID0gYlswXSxcbiAgICAgICAgcGhpMCA9IGFbMV0sXG4gICAgICAgIHBoaTEgPSBiWzFdLFxuICAgICAgICB6O1xuXG4gICAgaWYgKGxhbWJkYTEgPCBsYW1iZGEwKSB6ID0gbGFtYmRhMCwgbGFtYmRhMCA9IGxhbWJkYTEsIGxhbWJkYTEgPSB6O1xuXG4gICAgdmFyIGRlbHRhID0gbGFtYmRhMSAtIGxhbWJkYTAsXG4gICAgICAgIHBvbGFyID0gYWJzKGRlbHRhIC0gcGkpIDwgZXBzaWxvbixcbiAgICAgICAgbWVyaWRpYW4gPSBwb2xhciB8fCBkZWx0YSA8IGVwc2lsb247XG5cbiAgICBpZiAoIXBvbGFyICYmIHBoaTEgPCBwaGkwKSB6ID0gcGhpMCwgcGhpMCA9IHBoaTEsIHBoaTEgPSB6O1xuXG4gICAgLy8gQ2hlY2sgdGhhdCB0aGUgZmlyc3QgcG9pbnQgaXMgYmV0d2VlbiBhIGFuZCBiLlxuICAgIGlmIChtZXJpZGlhblxuICAgICAgICA/IHBvbGFyXG4gICAgICAgICAgPyBwaGkwICsgcGhpMSA+IDAgXiBxWzFdIDwgKGFicyhxWzBdIC0gbGFtYmRhMCkgPCBlcHNpbG9uID8gcGhpMCA6IHBoaTEpXG4gICAgICAgICAgOiBwaGkwIDw9IHFbMV0gJiYgcVsxXSA8PSBwaGkxXG4gICAgICAgIDogZGVsdGEgPiBwaSBeIChsYW1iZGEwIDw9IHFbMF0gJiYgcVswXSA8PSBsYW1iZGExKSkge1xuICAgICAgdmFyIHExID0gY2FydGVzaWFuU2NhbGUodSwgKC13ICsgdCkgLyB1dSk7XG4gICAgICBjYXJ0ZXNpYW5BZGRJblBsYWNlKHExLCBBKTtcbiAgICAgIHJldHVybiBbcSwgc3BoZXJpY2FsKHExKV07XG4gICAgfVxuICB9XG5cbiAgLy8gR2VuZXJhdGVzIGEgNC1iaXQgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYXRpb24gb2YgYSBwb2ludCByZWxhdGl2ZSB0b1xuICAvLyB0aGUgc21hbGwgY2lyY2xlJ3MgYm91bmRpbmcgYm94LlxuICBmdW5jdGlvbiBjb2RlKGxhbWJkYSwgcGhpKSB7XG4gICAgdmFyIHIgPSBzbWFsbFJhZGl1cyA/IHJhZGl1cyA6IHBpIC0gcmFkaXVzLFxuICAgICAgICBjb2RlID0gMDtcbiAgICBpZiAobGFtYmRhIDwgLXIpIGNvZGUgfD0gMTsgLy8gbGVmdFxuICAgIGVsc2UgaWYgKGxhbWJkYSA+IHIpIGNvZGUgfD0gMjsgLy8gcmlnaHRcbiAgICBpZiAocGhpIDwgLXIpIGNvZGUgfD0gNDsgLy8gYmVsb3dcbiAgICBlbHNlIGlmIChwaGkgPiByKSBjb2RlIHw9IDg7IC8vIGFib3ZlXG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cblxuICByZXR1cm4gY2xpcCh2aXNpYmxlLCBjbGlwTGluZSwgaW50ZXJwb2xhdGUsIHNtYWxsUmFkaXVzID8gWzAsIC1yYWRpdXNdIDogWy1waSwgcmFkaXVzIC0gcGldKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiLCB4MCwgeTAsIHgxLCB5MSkge1xuICB2YXIgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdLFxuICAgICAgYnggPSBiWzBdLFxuICAgICAgYnkgPSBiWzFdLFxuICAgICAgdDAgPSAwLFxuICAgICAgdDEgPSAxLFxuICAgICAgZHggPSBieCAtIGF4LFxuICAgICAgZHkgPSBieSAtIGF5LFxuICAgICAgcjtcblxuICByID0geDAgLSBheDtcbiAgaWYgKCFkeCAmJiByID4gMCkgcmV0dXJuO1xuICByIC89IGR4O1xuICBpZiAoZHggPCAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfSBlbHNlIGlmIChkeCA+IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9XG5cbiAgciA9IHgxIC0gYXg7XG4gIGlmICghZHggJiYgciA8IDApIHJldHVybjtcbiAgciAvPSBkeDtcbiAgaWYgKGR4IDwgMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfVxuXG4gIHIgPSB5MCAtIGF5O1xuICBpZiAoIWR5ICYmIHIgPiAwKSByZXR1cm47XG4gIHIgLz0gZHk7XG4gIGlmIChkeSA8IDApIHtcbiAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICB9IGVsc2UgaWYgKGR5ID4gMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH1cblxuICByID0geTEgLSBheTtcbiAgaWYgKCFkeSAmJiByIDwgMCkgcmV0dXJuO1xuICByIC89IGR5O1xuICBpZiAoZHkgPCAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfSBlbHNlIGlmIChkeSA+IDApIHtcbiAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICB9XG5cbiAgaWYgKHQwID4gMCkgYVswXSA9IGF4ICsgdDAgKiBkeCwgYVsxXSA9IGF5ICsgdDAgKiBkeTtcbiAgaWYgKHQxIDwgMSkgYlswXSA9IGF4ICsgdDEgKiBkeCwgYlsxXSA9IGF5ICsgdDEgKiBkeTtcbiAgcmV0dXJuIHRydWU7XG59XG4iLCAiaW1wb3J0IHthYnMsIGVwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgY2xpcEJ1ZmZlciBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmltcG9ydCBjbGlwTGluZSBmcm9tIFwiLi9saW5lLmpzXCI7XG5pbXBvcnQgY2xpcFJlam9pbiBmcm9tIFwiLi9yZWpvaW4uanNcIjtcbmltcG9ydCB7bWVyZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuXG52YXIgY2xpcE1heCA9IDFlOSwgY2xpcE1pbiA9IC1jbGlwTWF4O1xuXG4vLyBUT0RPIFVzZSBkMy1wb2x5Z29uXHUyMDE5cyBwb2x5Z29uQ29udGFpbnMgaGVyZSBmb3IgdGhlIHJpbmcgY2hlY2s/XG4vLyBUT0RPIEVsaW1pbmF0ZSBkdXBsaWNhdGUgYnVmZmVyaW5nIGluIGNsaXBCdWZmZXIgYW5kIHBvbHlnb24ucHVzaD9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2xpcFJlY3RhbmdsZSh4MCwgeTAsIHgxLCB5MSkge1xuXG4gIGZ1bmN0aW9uIHZpc2libGUoeCwgeSkge1xuICAgIHJldHVybiB4MCA8PSB4ICYmIHggPD0geDEgJiYgeTAgPD0geSAmJiB5IDw9IHkxO1xuICB9XG5cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gICAgdmFyIGEgPSAwLCBhMSA9IDA7XG4gICAgaWYgKGZyb20gPT0gbnVsbFxuICAgICAgICB8fCAoYSA9IGNvcm5lcihmcm9tLCBkaXJlY3Rpb24pKSAhPT0gKGExID0gY29ybmVyKHRvLCBkaXJlY3Rpb24pKVxuICAgICAgICB8fCBjb21wYXJlUG9pbnQoZnJvbSwgdG8pIDwgMCBeIGRpcmVjdGlvbiA+IDApIHtcbiAgICAgIGRvIHN0cmVhbS5wb2ludChhID09PSAwIHx8IGEgPT09IDMgPyB4MCA6IHgxLCBhID4gMSA/IHkxIDogeTApO1xuICAgICAgd2hpbGUgKChhID0gKGEgKyBkaXJlY3Rpb24gKyA0KSAlIDQpICE9PSBhMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcm5lcihwLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gYWJzKHBbMF0gLSB4MCkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDAgOiAzXG4gICAgICAgIDogYWJzKHBbMF0gLSB4MSkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDIgOiAxXG4gICAgICAgIDogYWJzKHBbMV0gLSB5MCkgPCBlcHNpbG9uID8gZGlyZWN0aW9uID4gMCA/IDEgOiAwXG4gICAgICAgIDogZGlyZWN0aW9uID4gMCA/IDMgOiAyOyAvLyBhYnMocFsxXSAtIHkxKSA8IGVwc2lsb25cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVJbnRlcnNlY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBjb21wYXJlUG9pbnQoYS54LCBiLngpO1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcGFyZVBvaW50KGEsIGIpIHtcbiAgICB2YXIgY2EgPSBjb3JuZXIoYSwgMSksXG4gICAgICAgIGNiID0gY29ybmVyKGIsIDEpO1xuICAgIHJldHVybiBjYSAhPT0gY2IgPyBjYSAtIGNiXG4gICAgICAgIDogY2EgPT09IDAgPyBiWzFdIC0gYVsxXVxuICAgICAgICA6IGNhID09PSAxID8gYVswXSAtIGJbMF1cbiAgICAgICAgOiBjYSA9PT0gMiA/IGFbMV0gLSBiWzFdXG4gICAgICAgIDogYlswXSAtIGFbMF07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIGFjdGl2ZVN0cmVhbSA9IHN0cmVhbSxcbiAgICAgICAgYnVmZmVyU3RyZWFtID0gY2xpcEJ1ZmZlcigpLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgcG9seWdvbixcbiAgICAgICAgcmluZyxcbiAgICAgICAgeF9fLCB5X18sIHZfXywgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgeF8sIHlfLCB2XywgLy8gcHJldmlvdXMgcG9pbnRcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGNsZWFuO1xuXG4gICAgdmFyIGNsaXBTdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IHBvbHlnb25TdGFydCxcbiAgICAgIHBvbHlnb25FbmQ6IHBvbHlnb25FbmRcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgICAgaWYgKHZpc2libGUoeCwgeSkpIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2x5Z29uSW5zaWRlKCkge1xuICAgICAgdmFyIHdpbmRpbmcgPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHBvbHlnb24ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIHJpbmcgPSBwb2x5Z29uW2ldLCBqID0gMSwgbSA9IHJpbmcubGVuZ3RoLCBwb2ludCA9IHJpbmdbMF0sIGEwLCBhMSwgYjAgPSBwb2ludFswXSwgYjEgPSBwb2ludFsxXTsgaiA8IG07ICsraikge1xuICAgICAgICAgIGEwID0gYjAsIGExID0gYjEsIHBvaW50ID0gcmluZ1tqXSwgYjAgPSBwb2ludFswXSwgYjEgPSBwb2ludFsxXTtcbiAgICAgICAgICBpZiAoYTEgPD0geTEpIHsgaWYgKGIxID4geTEgJiYgKGIwIC0gYTApICogKHkxIC0gYTEpID4gKGIxIC0gYTEpICogKHgwIC0gYTApKSArK3dpbmRpbmc7IH1cbiAgICAgICAgICBlbHNlIHsgaWYgKGIxIDw9IHkxICYmIChiMCAtIGEwKSAqICh5MSAtIGExKSA8IChiMSAtIGExKSAqICh4MCAtIGEwKSkgLS13aW5kaW5nOyB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHdpbmRpbmc7XG4gICAgfVxuXG4gICAgLy8gQnVmZmVyIGdlb21ldHJ5IHdpdGhpbiBhIHBvbHlnb24gYW5kIHRoZW4gY2xpcCBpdCBlbiBtYXNzZS5cbiAgICBmdW5jdGlvbiBwb2x5Z29uU3RhcnQoKSB7XG4gICAgICBhY3RpdmVTdHJlYW0gPSBidWZmZXJTdHJlYW0sIHNlZ21lbnRzID0gW10sIHBvbHlnb24gPSBbXSwgY2xlYW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvbHlnb25FbmQoKSB7XG4gICAgICB2YXIgc3RhcnRJbnNpZGUgPSBwb2x5Z29uSW5zaWRlKCksXG4gICAgICAgICAgY2xlYW5JbnNpZGUgPSBjbGVhbiAmJiBzdGFydEluc2lkZSxcbiAgICAgICAgICB2aXNpYmxlID0gKHNlZ21lbnRzID0gbWVyZ2Uoc2VnbWVudHMpKS5sZW5ndGg7XG4gICAgICBpZiAoY2xlYW5JbnNpZGUgfHwgdmlzaWJsZSkge1xuICAgICAgICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICAgIGlmIChjbGVhbkluc2lkZSkge1xuICAgICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBzdHJlYW0pO1xuICAgICAgICAgIHN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICBjbGlwUmVqb2luKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICAgIGFjdGl2ZVN0cmVhbSA9IHN0cmVhbSwgc2VnbWVudHMgPSBwb2x5Z29uID0gcmluZyA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgY2xpcFN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICAgIGlmIChwb2x5Z29uKSBwb2x5Z29uLnB1c2gocmluZyA9IFtdKTtcbiAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgIHZfID0gZmFsc2U7XG4gICAgICB4XyA9IHlfID0gTmFOO1xuICAgIH1cblxuICAgIC8vIFRPRE8gcmF0aGVyIHRoYW4gc3BlY2lhbC1jYXNlIHBvbHlnb25zLCBzaW1wbHkgaGFuZGxlIHRoZW0gc2VwYXJhdGVseS5cbiAgICAvLyBJZGVhbGx5LCBjb2luY2lkZW50IGludGVyc2VjdGlvbiBwb2ludHMgc2hvdWxkIGJlIGppdHRlcmVkIHRvIGF2b2lkXG4gICAgLy8gY2xpcHBpbmcgaXNzdWVzLlxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBpZiAoc2VnbWVudHMpIHtcbiAgICAgICAgbGluZVBvaW50KHhfXywgeV9fKTtcbiAgICAgICAgaWYgKHZfXyAmJiB2XykgYnVmZmVyU3RyZWFtLnJlam9pbigpO1xuICAgICAgICBzZWdtZW50cy5wdXNoKGJ1ZmZlclN0cmVhbS5yZXN1bHQoKSk7XG4gICAgICB9XG4gICAgICBjbGlwU3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgICBpZiAodl8pIGFjdGl2ZVN0cmVhbS5saW5lRW5kKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVBvaW50KHgsIHkpIHtcbiAgICAgIHZhciB2ID0gdmlzaWJsZSh4LCB5KTtcbiAgICAgIGlmIChwb2x5Z29uKSByaW5nLnB1c2goW3gsIHldKTtcbiAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICB4X18gPSB4LCB5X18gPSB5LCB2X18gPSB2O1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAodikge1xuICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh2ICYmIHZfKSBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBhID0gW3hfID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeF8pKSwgeV8gPSBNYXRoLm1heChjbGlwTWluLCBNYXRoLm1pbihjbGlwTWF4LCB5XykpXSxcbiAgICAgICAgICAgICAgYiA9IFt4ID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeCkpLCB5ID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeSkpXTtcbiAgICAgICAgICBpZiAoY2xpcExpbmUoYSwgYiwgeDAsIHkwLCB4MSwgeTEpKSB7XG4gICAgICAgICAgICBpZiAoIXZfKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KGFbMF0sIGFbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KGJbMF0sIGJbMV0pO1xuICAgICAgICAgICAgaWYgKCF2KSBhY3RpdmVTdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgY2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHYpIHtcbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB4XyA9IHgsIHlfID0geSwgdl8gPSB2O1xuICAgIH1cblxuICAgIHJldHVybiBjbGlwU3RyZWFtO1xuICB9O1xufVxuIiwgImltcG9ydCB7cmFuZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHthYnMsIGNlaWwsIGVwc2lsb259IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gZ3JhdGljdWxlWCh5MCwgeTEsIGR5KSB7XG4gIHZhciB5ID0gcmFuZ2UoeTAsIHkxIC0gZXBzaWxvbiwgZHkpLmNvbmNhdCh5MSk7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiB5Lm1hcChmdW5jdGlvbih5KSB7IHJldHVybiBbeCwgeV07IH0pOyB9O1xufVxuXG5mdW5jdGlvbiBncmF0aWN1bGVZKHgwLCB4MSwgZHgpIHtcbiAgdmFyIHggPSByYW5nZSh4MCwgeDEgLSBlcHNpbG9uLCBkeCkuY29uY2F0KHgxKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHkpIHsgcmV0dXJuIHgubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIFt4LCB5XTsgfSk7IH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdyYXRpY3VsZSgpIHtcbiAgdmFyIHgxLCB4MCwgWDEsIFgwLFxuICAgICAgeTEsIHkwLCBZMSwgWTAsXG4gICAgICBkeCA9IDEwLCBkeSA9IGR4LCBEWCA9IDkwLCBEWSA9IDM2MCxcbiAgICAgIHgsIHksIFgsIFksXG4gICAgICBwcmVjaXNpb24gPSAyLjU7XG5cbiAgZnVuY3Rpb24gZ3JhdGljdWxlKCkge1xuICAgIHJldHVybiB7dHlwZTogXCJNdWx0aUxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGxpbmVzKCl9O1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZXMoKSB7XG4gICAgcmV0dXJuIHJhbmdlKGNlaWwoWDAgLyBEWCkgKiBEWCwgWDEsIERYKS5tYXAoWClcbiAgICAgICAgLmNvbmNhdChyYW5nZShjZWlsKFkwIC8gRFkpICogRFksIFkxLCBEWSkubWFwKFkpKVxuICAgICAgICAuY29uY2F0KHJhbmdlKGNlaWwoeDAgLyBkeCkgKiBkeCwgeDEsIGR4KS5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4gYWJzKHggJSBEWCkgPiBlcHNpbG9uOyB9KS5tYXAoeCkpXG4gICAgICAgIC5jb25jYXQocmFuZ2UoY2VpbCh5MCAvIGR5KSAqIGR5LCB5MSwgZHkpLmZpbHRlcihmdW5jdGlvbih5KSB7IHJldHVybiBhYnMoeSAlIERZKSA+IGVwc2lsb247IH0pLm1hcCh5KSk7XG4gIH1cblxuICBncmF0aWN1bGUubGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbGluZXMoKS5tYXAoZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHsgcmV0dXJuIHt0eXBlOiBcIkxpbmVTdHJpbmdcIiwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTsgfSk7XG4gIH07XG5cbiAgZ3JhdGljdWxlLm91dGxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJQb2x5Z29uXCIsXG4gICAgICBjb29yZGluYXRlczogW1xuICAgICAgICBYKFgwKS5jb25jYXQoXG4gICAgICAgIFkoWTEpLnNsaWNlKDEpLFxuICAgICAgICBYKFgxKS5yZXZlcnNlKCkuc2xpY2UoMSksXG4gICAgICAgIFkoWTApLnJldmVyc2UoKS5zbGljZSgxKSlcbiAgICAgIF1cbiAgICB9O1xuICB9O1xuXG4gIGdyYXRpY3VsZS5leHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLmV4dGVudE1pbm9yKCk7XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5leHRlbnRNYWpvcihfKS5leHRlbnRNaW5vcihfKTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50TWFqb3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW1tYMCwgWTBdLCBbWDEsIFkxXV07XG4gICAgWDAgPSArX1swXVswXSwgWDEgPSArX1sxXVswXTtcbiAgICBZMCA9ICtfWzBdWzFdLCBZMSA9ICtfWzFdWzFdO1xuICAgIGlmIChYMCA+IFgxKSBfID0gWDAsIFgwID0gWDEsIFgxID0gXztcbiAgICBpZiAoWTAgPiBZMSkgXyA9IFkwLCBZMCA9IFkxLCBZMSA9IF87XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50TWlub3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gICAgeDAgPSArX1swXVswXSwgeDEgPSArX1sxXVswXTtcbiAgICB5MCA9ICtfWzBdWzFdLCB5MSA9ICtfWzFdWzFdO1xuICAgIGlmICh4MCA+IHgxKSBfID0geDAsIHgwID0geDEsIHgxID0gXztcbiAgICBpZiAoeTAgPiB5MSkgXyA9IHkwLCB5MCA9IHkxLCB5MSA9IF87XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBncmF0aWN1bGUuc3RlcE1pbm9yKCk7XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5zdGVwTWFqb3IoXykuc3RlcE1pbm9yKF8pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwTWFqb3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW0RYLCBEWV07XG4gICAgRFggPSArX1swXSwgRFkgPSArX1sxXTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5zdGVwTWlub3IgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gW2R4LCBkeV07XG4gICAgZHggPSArX1swXSwgZHkgPSArX1sxXTtcbiAgICByZXR1cm4gZ3JhdGljdWxlO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJlY2lzaW9uO1xuICAgIHByZWNpc2lvbiA9ICtfO1xuICAgIHggPSBncmF0aWN1bGVYKHkwLCB5MSwgOTApO1xuICAgIHkgPSBncmF0aWN1bGVZKHgwLCB4MSwgcHJlY2lzaW9uKTtcbiAgICBYID0gZ3JhdGljdWxlWChZMCwgWTEsIDkwKTtcbiAgICBZID0gZ3JhdGljdWxlWShYMCwgWDEsIHByZWNpc2lvbik7XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICByZXR1cm4gZ3JhdGljdWxlXG4gICAgICAuZXh0ZW50TWFqb3IoW1stMTgwLCAtOTAgKyBlcHNpbG9uXSwgWzE4MCwgOTAgLSBlcHNpbG9uXV0pXG4gICAgICAuZXh0ZW50TWlub3IoW1stMTgwLCAtODAgLSBlcHNpbG9uXSwgWzE4MCwgODAgKyBlcHNpbG9uXV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JhdGljdWxlMTAoKSB7XG4gIHJldHVybiBncmF0aWN1bGUoKSgpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IHggPT4geDtcbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YWJzfSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxudmFyIGFyZWFTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBhcmVhU3RyZWFtID0ge1xuICBwb2ludDogbm9vcCxcbiAgbGluZVN0YXJ0OiBub29wLFxuICBsaW5lRW5kOiBub29wLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFTdHJlYW0ubGluZVN0YXJ0ID0gYXJlYVJpbmdTdGFydDtcbiAgICBhcmVhU3RyZWFtLmxpbmVFbmQgPSBhcmVhUmluZ0VuZDtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgYXJlYVN0cmVhbS5saW5lU3RhcnQgPSBhcmVhU3RyZWFtLmxpbmVFbmQgPSBhcmVhU3RyZWFtLnBvaW50ID0gbm9vcDtcbiAgICBhcmVhU3VtLmFkZChhYnMoYXJlYVJpbmdTdW0pKTtcbiAgICBhcmVhUmluZ1N1bSA9IG5ldyBBZGRlcigpO1xuICB9LFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmVhID0gYXJlYVN1bSAvIDI7XG4gICAgYXJlYVN1bSA9IG5ldyBBZGRlcigpO1xuICAgIHJldHVybiBhcmVhO1xuICB9XG59O1xuXG5mdW5jdGlvbiBhcmVhUmluZ1N0YXJ0KCkge1xuICBhcmVhU3RyZWFtLnBvaW50ID0gYXJlYVBvaW50Rmlyc3Q7XG59XG5cbmZ1bmN0aW9uIGFyZWFQb2ludEZpcnN0KHgsIHkpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludDtcbiAgeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHk7XG59XG5cbmZ1bmN0aW9uIGFyZWFQb2ludCh4LCB5KSB7XG4gIGFyZWFSaW5nU3VtLmFkZCh5MCAqIHggLSB4MCAqIHkpO1xuICB4MCA9IHgsIHkwID0geTtcbn1cblxuZnVuY3Rpb24gYXJlYVJpbmdFbmQoKSB7XG4gIGFyZWFQb2ludCh4MDAsIHkwMCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFyZWFTdHJlYW07XG4iLCAiaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxudmFyIHgwID0gSW5maW5pdHksXG4gICAgeTAgPSB4MCxcbiAgICB4MSA9IC14MCxcbiAgICB5MSA9IHgxO1xuXG52YXIgYm91bmRzU3RyZWFtID0ge1xuICBwb2ludDogYm91bmRzUG9pbnQsXG4gIGxpbmVTdGFydDogbm9vcCxcbiAgbGluZUVuZDogbm9vcCxcbiAgcG9seWdvblN0YXJ0OiBub29wLFxuICBwb2x5Z29uRW5kOiBub29wLFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZHMgPSBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgICB4MSA9IHkxID0gLSh5MCA9IHgwID0gSW5maW5pdHkpO1xuICAgIHJldHVybiBib3VuZHM7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGJvdW5kc1BvaW50KHgsIHkpIHtcbiAgaWYgKHggPCB4MCkgeDAgPSB4O1xuICBpZiAoeCA+IHgxKSB4MSA9IHg7XG4gIGlmICh5IDwgeTApIHkwID0geTtcbiAgaWYgKHkgPiB5MSkgeTEgPSB5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBib3VuZHNTdHJlYW07XG4iLCAiaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG4vLyBUT0RPIEVuZm9yY2UgcG9zaXRpdmUgYXJlYSBmb3IgZXh0ZXJpb3IsIG5lZ2F0aXZlIGFyZWEgZm9yIGludGVyaW9yP1xuXG52YXIgWDAgPSAwLFxuICAgIFkwID0gMCxcbiAgICBaMCA9IDAsXG4gICAgWDEgPSAwLFxuICAgIFkxID0gMCxcbiAgICBaMSA9IDAsXG4gICAgWDIgPSAwLFxuICAgIFkyID0gMCxcbiAgICBaMiA9IDAsXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGNlbnRyb2lkU3RyZWFtID0ge1xuICBwb2ludDogY2VudHJvaWRQb2ludCxcbiAgbGluZVN0YXJ0OiBjZW50cm9pZExpbmVTdGFydCxcbiAgbGluZUVuZDogY2VudHJvaWRMaW5lRW5kLFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVTdGFydCA9IGNlbnRyb2lkUmluZ1N0YXJ0O1xuICAgIGNlbnRyb2lkU3RyZWFtLmxpbmVFbmQgPSBjZW50cm9pZFJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lU3RhcnQgPSBjZW50cm9pZExpbmVTdGFydDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lRW5kID0gY2VudHJvaWRMaW5lRW5kO1xuICB9LFxuICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjZW50cm9pZCA9IFoyID8gW1gyIC8gWjIsIFkyIC8gWjJdXG4gICAgICAgIDogWjEgPyBbWDEgLyBaMSwgWTEgLyBaMV1cbiAgICAgICAgOiBaMCA/IFtYMCAvIFowLCBZMCAvIFowXVxuICAgICAgICA6IFtOYU4sIE5hTl07XG4gICAgWDAgPSBZMCA9IFowID1cbiAgICBYMSA9IFkxID0gWjEgPVxuICAgIFgyID0gWTIgPSBaMiA9IDA7XG4gICAgcmV0dXJuIGNlbnRyb2lkO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50KHgsIHkpIHtcbiAgWDAgKz0geDtcbiAgWTAgKz0geTtcbiAgKytaMDtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRMaW5lU3RhcnQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludEZpcnN0TGluZTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludEZpcnN0TGluZSh4LCB5KSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludExpbmU7XG4gIGNlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50TGluZSh4LCB5KSB7XG4gIHZhciBkeCA9IHggLSB4MCwgZHkgPSB5IC0geTAsIHogPSBzcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgWDEgKz0geiAqICh4MCArIHgpIC8gMjtcbiAgWTEgKz0geiAqICh5MCArIHkpIC8gMjtcbiAgWjEgKz0gejtcbiAgY2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkTGluZUVuZCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50O1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdTdGFydCgpIHtcbiAgY2VudHJvaWRTdHJlYW0ucG9pbnQgPSBjZW50cm9pZFBvaW50Rmlyc3RSaW5nO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFJpbmdFbmQoKSB7XG4gIGNlbnRyb2lkUG9pbnRSaW5nKHgwMCwgeTAwKTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludEZpcnN0UmluZyh4LCB5KSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludFJpbmc7XG4gIGNlbnRyb2lkUG9pbnQoeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZFBvaW50UmluZyh4LCB5KSB7XG4gIHZhciBkeCA9IHggLSB4MCxcbiAgICAgIGR5ID0geSAtIHkwLFxuICAgICAgeiA9IHNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gIFgxICs9IHogKiAoeDAgKyB4KSAvIDI7XG4gIFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gIFoxICs9IHo7XG5cbiAgeiA9IHkwICogeCAtIHgwICogeTtcbiAgWDIgKz0geiAqICh4MCArIHgpO1xuICBZMiArPSB6ICogKHkwICsgeSk7XG4gIFoyICs9IHogKiAzO1xuICBjZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2VudHJvaWRTdHJlYW07XG4iLCAiaW1wb3J0IHt0YXV9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQYXRoQ29udGV4dChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5QYXRoQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gIF9yYWRpdXM6IDQuNSxcbiAgcG9pbnRSYWRpdXM6IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gdGhpcy5fcmFkaXVzID0gXywgdGhpcztcbiAgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9saW5lID09PSAwKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX3BvaW50ID0gTmFOO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgICAgICAgdGhpcy5fcG9pbnQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubW92ZVRvKHggKyB0aGlzLl9yYWRpdXMsIHkpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmFyYyh4LCB5LCB0aGlzLl9yYWRpdXMsIDAsIHRhdSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzdWx0OiBub29wXG59O1xuIiwgImltcG9ydCB7QWRkZXJ9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxudmFyIGxlbmd0aFN1bSA9IG5ldyBBZGRlcigpLFxuICAgIGxlbmd0aFJpbmcsXG4gICAgeDAwLFxuICAgIHkwMCxcbiAgICB4MCxcbiAgICB5MDtcblxudmFyIGxlbmd0aFN0cmVhbSA9IHtcbiAgcG9pbnQ6IG5vb3AsXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoUG9pbnRGaXJzdDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxlbmd0aFJpbmcpIGxlbmd0aFBvaW50KHgwMCwgeTAwKTtcbiAgICBsZW5ndGhTdHJlYW0ucG9pbnQgPSBub29wO1xuICB9LFxuICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxlbmd0aFJpbmcgPSB0cnVlO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBsZW5ndGhSaW5nID0gbnVsbDtcbiAgfSxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gK2xlbmd0aFN1bTtcbiAgICBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKTtcbiAgICByZXR1cm4gbGVuZ3RoO1xuICB9XG59O1xuXG5mdW5jdGlvbiBsZW5ndGhQb2ludEZpcnN0KHgsIHkpIHtcbiAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbGVuZ3RoUG9pbnQ7XG4gIHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5O1xufVxuXG5mdW5jdGlvbiBsZW5ndGhQb2ludCh4LCB5KSB7XG4gIHgwIC09IHgsIHkwIC09IHk7XG4gIGxlbmd0aFN1bS5hZGQoc3FydCh4MCAqIHgwICsgeTAgKiB5MCkpO1xuICB4MCA9IHgsIHkwID0geTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGVuZ3RoU3RyZWFtO1xuIiwgIi8vIFNpbXBsZSBjYWNoaW5nIGZvciBjb25zdGFudC1yYWRpdXMgcG9pbnRzLlxubGV0IGNhY2hlRGlnaXRzLCBjYWNoZUFwcGVuZCwgY2FjaGVSYWRpdXMsIGNhY2hlQ2lyY2xlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoU3RyaW5nIHtcbiAgY29uc3RydWN0b3IoZGlnaXRzKSB7XG4gICAgdGhpcy5fYXBwZW5kID0gZGlnaXRzID09IG51bGwgPyBhcHBlbmQgOiBhcHBlbmRSb3VuZChkaWdpdHMpO1xuICAgIHRoaXMuX3JhZGl1cyA9IDQuNTtcbiAgICB0aGlzLl8gPSBcIlwiO1xuICB9XG4gIHBvaW50UmFkaXVzKF8pIHtcbiAgICB0aGlzLl9yYWRpdXMgPSArXztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBwb2x5Z29uU3RhcnQoKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH1cbiAgcG9seWdvbkVuZCgpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9XG4gIGxpbmVTdGFydCgpIHtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH1cbiAgbGluZUVuZCgpIHtcbiAgICBpZiAodGhpcy5fbGluZSA9PT0gMCkgdGhpcy5fICs9IFwiWlwiO1xuICAgIHRoaXMuX3BvaW50ID0gTmFOO1xuICB9XG4gIHBvaW50KHgsIHkpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHtcbiAgICAgICAgdGhpcy5fYXBwZW5kYE0ke3h9LCR7eX1gO1xuICAgICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBMJHt4fSwke3l9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBNJHt4fSwke3l9YDtcbiAgICAgICAgaWYgKHRoaXMuX3JhZGl1cyAhPT0gY2FjaGVSYWRpdXMgfHwgdGhpcy5fYXBwZW5kICE9PSBjYWNoZUFwcGVuZCkge1xuICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9yYWRpdXM7XG4gICAgICAgICAgY29uc3QgcyA9IHRoaXMuXztcbiAgICAgICAgICB0aGlzLl8gPSBcIlwiOyAvLyBzdGFzaCB0aGUgb2xkIHN0cmluZyBzbyB3ZSBjYW4gY2FjaGUgdGhlIGNpcmNsZSBwYXRoIGZyYWdtZW50XG4gICAgICAgICAgdGhpcy5fYXBwZW5kYG0wLCR7cn1hJHtyfSwke3J9IDAgMSwxIDAsJHstMiAqIHJ9YSR7cn0sJHtyfSAwIDEsMSAwLCR7MiAqIHJ9emA7XG4gICAgICAgICAgY2FjaGVSYWRpdXMgPSByO1xuICAgICAgICAgIGNhY2hlQXBwZW5kID0gdGhpcy5fYXBwZW5kO1xuICAgICAgICAgIGNhY2hlQ2lyY2xlID0gdGhpcy5fO1xuICAgICAgICAgIHRoaXMuXyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fICs9IGNhY2hlQ2lyY2xlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmVzdWx0KCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuXztcbiAgICB0aGlzLl8gPSBcIlwiO1xuICAgIHJldHVybiByZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICBsZXQgaSA9IDE7XG4gIHRoaXMuXyArPSBzdHJpbmdzWzBdO1xuICBmb3IgKGNvbnN0IGogPSBzdHJpbmdzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgIHRoaXMuXyArPSBhcmd1bWVudHNbaV0gKyBzdHJpbmdzW2ldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFJvdW5kKGRpZ2l0cykge1xuICBjb25zdCBkID0gTWF0aC5mbG9vcihkaWdpdHMpO1xuICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7ZGlnaXRzfWApO1xuICBpZiAoZCA+IDE1KSByZXR1cm4gYXBwZW5kO1xuICBpZiAoZCAhPT0gY2FjaGVEaWdpdHMpIHtcbiAgICBjb25zdCBrID0gMTAgKiogZDtcbiAgICBjYWNoZURpZ2l0cyA9IGQ7XG4gICAgY2FjaGVBcHBlbmQgPSBmdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICAgICAgbGV0IGkgPSAxO1xuICAgICAgdGhpcy5fICs9IHN0cmluZ3NbMF07XG4gICAgICBmb3IgKGNvbnN0IGogPSBzdHJpbmdzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgICAgICB0aGlzLl8gKz0gTWF0aC5yb3VuZChhcmd1bWVudHNbaV0gKiBrKSAvIGsgKyBzdHJpbmdzW2ldO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGNhY2hlQXBwZW5kO1xufVxuIiwgImltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi4vaWRlbnRpdHkuanNcIjtcbmltcG9ydCBzdHJlYW0gZnJvbSBcIi4uL3N0cmVhbS5qc1wiO1xuaW1wb3J0IHBhdGhBcmVhIGZyb20gXCIuL2FyZWEuanNcIjtcbmltcG9ydCBwYXRoQm91bmRzIGZyb20gXCIuL2JvdW5kcy5qc1wiO1xuaW1wb3J0IHBhdGhDZW50cm9pZCBmcm9tIFwiLi9jZW50cm9pZC5qc1wiO1xuaW1wb3J0IFBhdGhDb250ZXh0IGZyb20gXCIuL2NvbnRleHQuanNcIjtcbmltcG9ydCBwYXRoTWVhc3VyZSBmcm9tIFwiLi9tZWFzdXJlLmpzXCI7XG5pbXBvcnQgUGF0aFN0cmluZyBmcm9tIFwiLi9zdHJpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocHJvamVjdGlvbiwgY29udGV4dCkge1xuICBsZXQgZGlnaXRzID0gMyxcbiAgICAgIHBvaW50UmFkaXVzID0gNC41LFxuICAgICAgcHJvamVjdGlvblN0cmVhbSxcbiAgICAgIGNvbnRleHRTdHJlYW07XG5cbiAgZnVuY3Rpb24gcGF0aChvYmplY3QpIHtcbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIHBvaW50UmFkaXVzID09PSBcImZ1bmN0aW9uXCIpIGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMoK3BvaW50UmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShjb250ZXh0U3RyZWFtKSk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0U3RyZWFtLnJlc3VsdCgpO1xuICB9XG5cbiAgcGF0aC5hcmVhID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoQXJlYSkpO1xuICAgIHJldHVybiBwYXRoQXJlYS5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLm1lYXN1cmUgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhNZWFzdXJlKSk7XG4gICAgcmV0dXJuIHBhdGhNZWFzdXJlLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGguYm91bmRzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoQm91bmRzKSk7XG4gICAgcmV0dXJuIHBhdGhCb3VuZHMucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5jZW50cm9pZCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aENlbnRyb2lkKSk7XG4gICAgcmV0dXJuIHBhdGhDZW50cm9pZC5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLnByb2plY3Rpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJvamVjdGlvbjtcbiAgICBwcm9qZWN0aW9uU3RyZWFtID0gXyA9PSBudWxsID8gKHByb2plY3Rpb24gPSBudWxsLCBpZGVudGl0eSkgOiAocHJvamVjdGlvbiA9IF8pLnN0cmVhbTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwYXRoLmNvbnRleHQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29udGV4dDtcbiAgICBjb250ZXh0U3RyZWFtID0gXyA9PSBudWxsID8gKGNvbnRleHQgPSBudWxsLCBuZXcgUGF0aFN0cmluZyhkaWdpdHMpKSA6IG5ldyBQYXRoQ29udGV4dChjb250ZXh0ID0gXyk7XG4gICAgaWYgKHR5cGVvZiBwb2ludFJhZGl1cyAhPT0gXCJmdW5jdGlvblwiKSBjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKHBvaW50UmFkaXVzKTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwYXRoLnBvaW50UmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHBvaW50UmFkaXVzO1xuICAgIHBvaW50UmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiAoY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cygrXyksICtfKTtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwYXRoLmRpZ2l0cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkaWdpdHM7XG4gICAgaWYgKF8gPT0gbnVsbCkgZGlnaXRzID0gbnVsbDtcbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGQgPSBNYXRoLmZsb29yKF8pO1xuICAgICAgaWYgKCEoZCA+PSAwKSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGludmFsaWQgZGlnaXRzOiAke199YCk7XG4gICAgICBkaWdpdHMgPSBkO1xuICAgIH1cbiAgICBpZiAoY29udGV4dCA9PT0gbnVsbCkgY29udGV4dFN0cmVhbSA9IG5ldyBQYXRoU3RyaW5nKGRpZ2l0cyk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcmV0dXJuIHBhdGgucHJvamVjdGlvbihwcm9qZWN0aW9uKS5kaWdpdHMoZGlnaXRzKS5jb250ZXh0KGNvbnRleHQpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1ldGhvZHMpIHtcbiAgcmV0dXJuIHtcbiAgICBzdHJlYW06IHRyYW5zZm9ybWVyKG1ldGhvZHMpXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1lcihtZXRob2RzKSB7XG4gIHJldHVybiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgcyA9IG5ldyBUcmFuc2Zvcm1TdHJlYW07XG4gICAgZm9yICh2YXIga2V5IGluIG1ldGhvZHMpIHNba2V5XSA9IG1ldGhvZHNba2V5XTtcbiAgICBzLnN0cmVhbSA9IHN0cmVhbTtcbiAgICByZXR1cm4gcztcbiAgfTtcbn1cblxuZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtKCkge31cblxuVHJhbnNmb3JtU3RyZWFtLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zZm9ybVN0cmVhbSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgdGhpcy5zdHJlYW0ucG9pbnQoeCwgeSk7IH0sXG4gIHNwaGVyZTogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLnNwaGVyZSgpOyB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5saW5lU3RhcnQoKTsgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLmxpbmVFbmQoKTsgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ucG9seWdvblN0YXJ0KCk7IH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5wb2x5Z29uRW5kKCk7IH1cbn07XG4iLCAiaW1wb3J0IHtkZWZhdWx0IGFzIGdlb1N0cmVhbX0gZnJvbSBcIi4uL3N0cmVhbS5qc1wiO1xuaW1wb3J0IGJvdW5kc1N0cmVhbSBmcm9tIFwiLi4vcGF0aC9ib3VuZHMuanNcIjtcblxuZnVuY3Rpb24gZml0KHByb2plY3Rpb24sIGZpdEJvdW5kcywgb2JqZWN0KSB7XG4gIHZhciBjbGlwID0gcHJvamVjdGlvbi5jbGlwRXh0ZW50ICYmIHByb2plY3Rpb24uY2xpcEV4dGVudCgpO1xuICBwcm9qZWN0aW9uLnNjYWxlKDE1MCkudHJhbnNsYXRlKFswLCAwXSk7XG4gIGlmIChjbGlwICE9IG51bGwpIHByb2plY3Rpb24uY2xpcEV4dGVudChudWxsKTtcbiAgZ2VvU3RyZWFtKG9iamVjdCwgcHJvamVjdGlvbi5zdHJlYW0oYm91bmRzU3RyZWFtKSk7XG4gIGZpdEJvdW5kcyhib3VuZHNTdHJlYW0ucmVzdWx0KCkpO1xuICBpZiAoY2xpcCAhPSBudWxsKSBwcm9qZWN0aW9uLmNsaXBFeHRlbnQoY2xpcCk7XG4gIHJldHVybiBwcm9qZWN0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0RXh0ZW50KHByb2plY3Rpb24sIGV4dGVudCwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXQocHJvamVjdGlvbiwgZnVuY3Rpb24oYikge1xuICAgIHZhciB3ID0gZXh0ZW50WzFdWzBdIC0gZXh0ZW50WzBdWzBdLFxuICAgICAgICBoID0gZXh0ZW50WzFdWzFdIC0gZXh0ZW50WzBdWzFdLFxuICAgICAgICBrID0gTWF0aC5taW4odyAvIChiWzFdWzBdIC0gYlswXVswXSksIGggLyAoYlsxXVsxXSAtIGJbMF1bMV0pKSxcbiAgICAgICAgeCA9ICtleHRlbnRbMF1bMF0gKyAodyAtIGsgKiAoYlsxXVswXSArIGJbMF1bMF0pKSAvIDIsXG4gICAgICAgIHkgPSArZXh0ZW50WzBdWzFdICsgKGggLSBrICogKGJbMV1bMV0gKyBiWzBdWzFdKSkgLyAyO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCkge1xuICByZXR1cm4gZml0RXh0ZW50KHByb2plY3Rpb24sIFtbMCwgMF0sIHNpemVdLCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0V2lkdGgocHJvamVjdGlvbiwgd2lkdGgsIG9iamVjdCkge1xuICByZXR1cm4gZml0KHByb2plY3Rpb24sIGZ1bmN0aW9uKGIpIHtcbiAgICB2YXIgdyA9ICt3aWR0aCxcbiAgICAgICAgayA9IHcgLyAoYlsxXVswXSAtIGJbMF1bMF0pLFxuICAgICAgICB4ID0gKHcgLSBrICogKGJbMV1bMF0gKyBiWzBdWzBdKSkgLyAyLFxuICAgICAgICB5ID0gLWsgKiBiWzBdWzFdO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaXRIZWlnaHQocHJvamVjdGlvbiwgaGVpZ2h0LCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdChwcm9qZWN0aW9uLCBmdW5jdGlvbihiKSB7XG4gICAgdmFyIGggPSAraGVpZ2h0LFxuICAgICAgICBrID0gaCAvIChiWzFdWzFdIC0gYlswXVsxXSksXG4gICAgICAgIHggPSAtayAqIGJbMF1bMF0sXG4gICAgICAgIHkgPSAoaCAtIGsgKiAoYlsxXVsxXSArIGJbMF1bMV0pKSAvIDI7XG4gICAgcHJvamVjdGlvbi5zY2FsZSgxNTAgKiBrKS50cmFuc2xhdGUoW3gsIHldKTtcbiAgfSwgb2JqZWN0KTtcbn1cbiIsICJpbXBvcnQge2NhcnRlc2lhbn0gZnJvbSBcIi4uL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIHJhZGlhbnMsIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3RyYW5zZm9ybWVyfSBmcm9tIFwiLi4vdHJhbnNmb3JtLmpzXCI7XG5cbnZhciBtYXhEZXB0aCA9IDE2LCAvLyBtYXhpbXVtIGRlcHRoIG9mIHN1YmRpdmlzaW9uXG4gICAgY29zTWluRGlzdGFuY2UgPSBjb3MoMzAgKiByYWRpYW5zKTsgLy8gY29zKG1pbmltdW0gYW5ndWxhciBkaXN0YW5jZSlcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocHJvamVjdCwgZGVsdGEyKSB7XG4gIHJldHVybiArZGVsdGEyID8gcmVzYW1wbGUocHJvamVjdCwgZGVsdGEyKSA6IHJlc2FtcGxlTm9uZShwcm9qZWN0KTtcbn1cblxuZnVuY3Rpb24gcmVzYW1wbGVOb25lKHByb2plY3QpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgeCA9IHByb2plY3QoeCwgeSk7XG4gICAgICB0aGlzLnN0cmVhbS5wb2ludCh4WzBdLCB4WzFdKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNhbXBsZShwcm9qZWN0LCBkZWx0YTIpIHtcblxuICBmdW5jdGlvbiByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgxLCB5MSwgbGFtYmRhMSwgYTEsIGIxLCBjMSwgZGVwdGgsIHN0cmVhbSkge1xuICAgIHZhciBkeCA9IHgxIC0geDAsXG4gICAgICAgIGR5ID0geTEgLSB5MCxcbiAgICAgICAgZDIgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICBpZiAoZDIgPiA0ICogZGVsdGEyICYmIGRlcHRoLS0pIHtcbiAgICAgIHZhciBhID0gYTAgKyBhMSxcbiAgICAgICAgICBiID0gYjAgKyBiMSxcbiAgICAgICAgICBjID0gYzAgKyBjMSxcbiAgICAgICAgICBtID0gc3FydChhICogYSArIGIgKiBiICsgYyAqIGMpLFxuICAgICAgICAgIHBoaTIgPSBhc2luKGMgLz0gbSksXG4gICAgICAgICAgbGFtYmRhMiA9IGFicyhhYnMoYykgLSAxKSA8IGVwc2lsb24gfHwgYWJzKGxhbWJkYTAgLSBsYW1iZGExKSA8IGVwc2lsb24gPyAobGFtYmRhMCArIGxhbWJkYTEpIC8gMiA6IGF0YW4yKGIsIGEpLFxuICAgICAgICAgIHAgPSBwcm9qZWN0KGxhbWJkYTIsIHBoaTIpLFxuICAgICAgICAgIHgyID0gcFswXSxcbiAgICAgICAgICB5MiA9IHBbMV0sXG4gICAgICAgICAgZHgyID0geDIgLSB4MCxcbiAgICAgICAgICBkeTIgPSB5MiAtIHkwLFxuICAgICAgICAgIGR6ID0gZHkgKiBkeDIgLSBkeCAqIGR5MjtcbiAgICAgIGlmIChkeiAqIGR6IC8gZDIgPiBkZWx0YTIgLy8gcGVycGVuZGljdWxhciBwcm9qZWN0ZWQgZGlzdGFuY2VcbiAgICAgICAgICB8fCBhYnMoKGR4ICogZHgyICsgZHkgKiBkeTIpIC8gZDIgLSAwLjUpID4gMC4zIC8vIG1pZHBvaW50IGNsb3NlIHRvIGFuIGVuZFxuICAgICAgICAgIHx8IGEwICogYTEgKyBiMCAqIGIxICsgYzAgKiBjMSA8IGNvc01pbkRpc3RhbmNlKSB7IC8vIGFuZ3VsYXIgZGlzdGFuY2VcbiAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MiwgeTIsIGxhbWJkYTIsIGEgLz0gbSwgYiAvPSBtLCBjLCBkZXB0aCwgc3RyZWFtKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHgyLCB5Mik7XG4gICAgICAgIHJlc2FtcGxlTGluZVRvKHgyLCB5MiwgbGFtYmRhMiwgYSwgYiwgYywgeDEsIHkxLCBsYW1iZGExLCBhMSwgYjEsIGMxLCBkZXB0aCwgc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBsYW1iZGEwMCwgeDAwLCB5MDAsIGEwMCwgYjAwLCBjMDAsIC8vIGZpcnN0IHBvaW50XG4gICAgICAgIGxhbWJkYTAsIHgwLCB5MCwgYTAsIGIwLCBjMDsgLy8gcHJldmlvdXMgcG9pbnRcblxuICAgIHZhciByZXNhbXBsZVN0cmVhbSA9IHtcbiAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgbGluZUVuZDogbGluZUVuZCxcbiAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHN0cmVhbS5wb2x5Z29uU3RhcnQoKTsgcmVzYW1wbGVTdHJlYW0ubGluZVN0YXJ0ID0gcmluZ1N0YXJ0OyB9LFxuICAgICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7IHN0cmVhbS5wb2x5Z29uRW5kKCk7IHJlc2FtcGxlU3RyZWFtLmxpbmVTdGFydCA9IGxpbmVTdGFydDsgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgICB4ID0gcHJvamVjdCh4LCB5KTtcbiAgICAgIHN0cmVhbS5wb2ludCh4WzBdLCB4WzFdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICB4MCA9IE5hTjtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVQb2ludChsYW1iZGEsIHBoaSkge1xuICAgICAgdmFyIGMgPSBjYXJ0ZXNpYW4oW2xhbWJkYSwgcGhpXSksIHAgPSBwcm9qZWN0KGxhbWJkYSwgcGhpKTtcbiAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDAgPSBwWzBdLCB5MCA9IHBbMV0sIGxhbWJkYTAgPSBsYW1iZGEsIGEwID0gY1swXSwgYjAgPSBjWzFdLCBjMCA9IGNbMl0sIG1heERlcHRoLCBzdHJlYW0pO1xuICAgICAgc3RyZWFtLnBvaW50KHgwLCB5MCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdTdGFydCgpIHtcbiAgICAgIGxpbmVTdGFydCgpO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSByaW5nUG9pbnQ7XG4gICAgICByZXNhbXBsZVN0cmVhbS5saW5lRW5kID0gcmluZ0VuZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIGxpbmVQb2ludChsYW1iZGEwMCA9IGxhbWJkYSwgcGhpKSwgeDAwID0geDAsIHkwMCA9IHkwLCBhMDAgPSBhMCwgYjAwID0gYjAsIGMwMCA9IGMwO1xuICAgICAgcmVzYW1wbGVTdHJlYW0ucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDAwLCB5MDAsIGxhbWJkYTAwLCBhMDAsIGIwMCwgYzAwLCBtYXhEZXB0aCwgc3RyZWFtKTtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgbGluZUVuZCgpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNhbXBsZVN0cmVhbTtcbiAgfTtcbn1cbiIsICJpbXBvcnQgY2xpcEFudGltZXJpZGlhbiBmcm9tIFwiLi4vY2xpcC9hbnRpbWVyaWRpYW4uanNcIjtcbmltcG9ydCBjbGlwQ2lyY2xlIGZyb20gXCIuLi9jbGlwL2NpcmNsZS5qc1wiO1xuaW1wb3J0IGNsaXBSZWN0YW5nbGUgZnJvbSBcIi4uL2NsaXAvcmVjdGFuZ2xlLmpzXCI7XG5pbXBvcnQgY29tcG9zZSBmcm9tIFwiLi4vY29tcG9zZS5qc1wiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuLi9pZGVudGl0eS5qc1wiO1xuaW1wb3J0IHtjb3MsIGRlZ3JlZXMsIHJhZGlhbnMsIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7cm90YXRlUmFkaWFuc30gZnJvbSBcIi4uL3JvdGF0aW9uLmpzXCI7XG5pbXBvcnQge3RyYW5zZm9ybWVyfSBmcm9tIFwiLi4vdHJhbnNmb3JtLmpzXCI7XG5pbXBvcnQge2ZpdEV4dGVudCwgZml0U2l6ZSwgZml0V2lkdGgsIGZpdEhlaWdodH0gZnJvbSBcIi4vZml0LmpzXCI7XG5pbXBvcnQgcmVzYW1wbGUgZnJvbSBcIi4vcmVzYW1wbGUuanNcIjtcblxudmFyIHRyYW5zZm9ybVJhZGlhbnMgPSB0cmFuc2Zvcm1lcih7XG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdGhpcy5zdHJlYW0ucG9pbnQoeCAqIHJhZGlhbnMsIHkgKiByYWRpYW5zKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVJvdGF0ZShyb3RhdGUpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIHIgPSByb3RhdGUoeCwgeSk7XG4gICAgICByZXR1cm4gdGhpcy5zdHJlYW0ucG9pbnQoclswXSwgclsxXSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2NhbGVUcmFuc2xhdGUoaywgZHgsIGR5LCBzeCwgc3kpIHtcbiAgZnVuY3Rpb24gdHJhbnNmb3JtKHgsIHkpIHtcbiAgICB4ICo9IHN4OyB5ICo9IHN5O1xuICAgIHJldHVybiBbZHggKyBrICogeCwgZHkgLSBrICogeV07XG4gIH1cbiAgdHJhbnNmb3JtLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gWyh4IC0gZHgpIC8gayAqIHN4LCAoZHkgLSB5KSAvIGsgKiBzeV07XG4gIH07XG4gIHJldHVybiB0cmFuc2Zvcm07XG59XG5cbmZ1bmN0aW9uIHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIGR4LCBkeSwgc3gsIHN5LCBhbHBoYSkge1xuICBpZiAoIWFscGhhKSByZXR1cm4gc2NhbGVUcmFuc2xhdGUoaywgZHgsIGR5LCBzeCwgc3kpO1xuICB2YXIgY29zQWxwaGEgPSBjb3MoYWxwaGEpLFxuICAgICAgc2luQWxwaGEgPSBzaW4oYWxwaGEpLFxuICAgICAgYSA9IGNvc0FscGhhICogayxcbiAgICAgIGIgPSBzaW5BbHBoYSAqIGssXG4gICAgICBhaSA9IGNvc0FscGhhIC8gayxcbiAgICAgIGJpID0gc2luQWxwaGEgLyBrLFxuICAgICAgY2kgPSAoc2luQWxwaGEgKiBkeSAtIGNvc0FscGhhICogZHgpIC8gayxcbiAgICAgIGZpID0gKHNpbkFscGhhICogZHggKyBjb3NBbHBoYSAqIGR5KSAvIGs7XG4gIGZ1bmN0aW9uIHRyYW5zZm9ybSh4LCB5KSB7XG4gICAgeCAqPSBzeDsgeSAqPSBzeTtcbiAgICByZXR1cm4gW2EgKiB4IC0gYiAqIHkgKyBkeCwgZHkgLSBiICogeCAtIGEgKiB5XTtcbiAgfVxuICB0cmFuc2Zvcm0uaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiBbc3ggKiAoYWkgKiB4IC0gYmkgKiB5ICsgY2kpLCBzeSAqIChmaSAtIGJpICogeCAtIGFpICogeSldO1xuICB9O1xuICByZXR1cm4gdHJhbnNmb3JtO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm9qZWN0aW9uKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Rpb25NdXRhdG9yKGZ1bmN0aW9uKCkgeyByZXR1cm4gcHJvamVjdDsgfSkoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb25NdXRhdG9yKHByb2plY3RBdCkge1xuICB2YXIgcHJvamVjdCxcbiAgICAgIGsgPSAxNTAsIC8vIHNjYWxlXG4gICAgICB4ID0gNDgwLCB5ID0gMjUwLCAvLyB0cmFuc2xhdGVcbiAgICAgIGxhbWJkYSA9IDAsIHBoaSA9IDAsIC8vIGNlbnRlclxuICAgICAgZGVsdGFMYW1iZGEgPSAwLCBkZWx0YVBoaSA9IDAsIGRlbHRhR2FtbWEgPSAwLCByb3RhdGUsIC8vIHByZS1yb3RhdGVcbiAgICAgIGFscGhhID0gMCwgLy8gcG9zdC1yb3RhdGUgYW5nbGVcbiAgICAgIHN4ID0gMSwgLy8gcmVmbGVjdFhcbiAgICAgIHN5ID0gMSwgLy8gcmVmbGVjdFhcbiAgICAgIHRoZXRhID0gbnVsbCwgcHJlY2xpcCA9IGNsaXBBbnRpbWVyaWRpYW4sIC8vIHByZS1jbGlwIGFuZ2xlXG4gICAgICB4MCA9IG51bGwsIHkwLCB4MSwgeTEsIHBvc3RjbGlwID0gaWRlbnRpdHksIC8vIHBvc3QtY2xpcCBleHRlbnRcbiAgICAgIGRlbHRhMiA9IDAuNSwgLy8gcHJlY2lzaW9uXG4gICAgICBwcm9qZWN0UmVzYW1wbGUsXG4gICAgICBwcm9qZWN0VHJhbnNmb3JtLFxuICAgICAgcHJvamVjdFJvdGF0ZVRyYW5zZm9ybSxcbiAgICAgIGNhY2hlLFxuICAgICAgY2FjaGVTdHJlYW07XG5cbiAgZnVuY3Rpb24gcHJvamVjdGlvbihwb2ludCkge1xuICAgIHJldHVybiBwcm9qZWN0Um90YXRlVHJhbnNmb3JtKHBvaW50WzBdICogcmFkaWFucywgcG9pbnRbMV0gKiByYWRpYW5zKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmVydChwb2ludCkge1xuICAgIHBvaW50ID0gcHJvamVjdFJvdGF0ZVRyYW5zZm9ybS5pbnZlcnQocG9pbnRbMF0sIHBvaW50WzFdKTtcbiAgICByZXR1cm4gcG9pbnQgJiYgW3BvaW50WzBdICogZGVncmVlcywgcG9pbnRbMV0gKiBkZWdyZWVzXTtcbiAgfVxuXG4gIHByb2plY3Rpb24uc3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgcmV0dXJuIGNhY2hlICYmIGNhY2hlU3RyZWFtID09PSBzdHJlYW0gPyBjYWNoZSA6IGNhY2hlID0gdHJhbnNmb3JtUmFkaWFucyh0cmFuc2Zvcm1Sb3RhdGUocm90YXRlKShwcmVjbGlwKHByb2plY3RSZXNhbXBsZShwb3N0Y2xpcChjYWNoZVN0cmVhbSA9IHN0cmVhbSkpKSkpO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucHJlY2xpcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjbGlwID0gXywgdGhldGEgPSB1bmRlZmluZWQsIHJlc2V0KCkpIDogcHJlY2xpcDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnBvc3RjbGlwID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBvc3RjbGlwID0gXywgeDAgPSB5MCA9IHgxID0geTEgPSBudWxsLCByZXNldCgpKSA6IHBvc3RjbGlwO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2xpcEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByZWNsaXAgPSArXyA/IGNsaXBDaXJjbGUodGhldGEgPSBfICogcmFkaWFucykgOiAodGhldGEgPSBudWxsLCBjbGlwQW50aW1lcmlkaWFuKSwgcmVzZXQoKSkgOiB0aGV0YSAqIGRlZ3JlZXM7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5jbGlwRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBvc3RjbGlwID0gXyA9PSBudWxsID8gKHgwID0geTAgPSB4MSA9IHkxID0gbnVsbCwgaWRlbnRpdHkpIDogY2xpcFJlY3RhbmdsZSh4MCA9ICtfWzBdWzBdLCB5MCA9ICtfWzBdWzFdLCB4MSA9ICtfWzFdWzBdLCB5MSA9ICtfWzFdWzFdKSwgcmVzZXQoKSkgOiB4MCA9PSBudWxsID8gbnVsbCA6IFtbeDAsIHkwXSwgW3gxLCB5MV1dO1xuICB9O1xuXG4gIHByb2plY3Rpb24uc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoayA9ICtfLCByZWNlbnRlcigpKSA6IGs7XG4gIH07XG5cbiAgcHJvamVjdGlvbi50cmFuc2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeCA9ICtfWzBdLCB5ID0gK19bMV0sIHJlY2VudGVyKCkpIDogW3gsIHldO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2VudGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGxhbWJkYSA9IF9bMF0gJSAzNjAgKiByYWRpYW5zLCBwaGkgPSBfWzFdICUgMzYwICogcmFkaWFucywgcmVjZW50ZXIoKSkgOiBbbGFtYmRhICogZGVncmVlcywgcGhpICogZGVncmVlc107XG4gIH07XG5cbiAgcHJvamVjdGlvbi5yb3RhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZGVsdGFMYW1iZGEgPSBfWzBdICUgMzYwICogcmFkaWFucywgZGVsdGFQaGkgPSBfWzFdICUgMzYwICogcmFkaWFucywgZGVsdGFHYW1tYSA9IF8ubGVuZ3RoID4gMiA/IF9bMl0gJSAzNjAgKiByYWRpYW5zIDogMCwgcmVjZW50ZXIoKSkgOiBbZGVsdGFMYW1iZGEgKiBkZWdyZWVzLCBkZWx0YVBoaSAqIGRlZ3JlZXMsIGRlbHRhR2FtbWEgKiBkZWdyZWVzXTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFscGhhID0gXyAlIDM2MCAqIHJhZGlhbnMsIHJlY2VudGVyKCkpIDogYWxwaGEgKiBkZWdyZWVzO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucmVmbGVjdFggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3ggPSBfID8gLTEgOiAxLCByZWNlbnRlcigpKSA6IHN4IDwgMDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnJlZmxlY3RZID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN5ID0gXyA/IC0xIDogMSwgcmVjZW50ZXIoKSkgOiBzeSA8IDA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJvamVjdFJlc2FtcGxlID0gcmVzYW1wbGUocHJvamVjdFRyYW5zZm9ybSwgZGVsdGEyID0gXyAqIF8pLCByZXNldCgpKSA6IHNxcnQoZGVsdGEyKTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdEV4dGVudCA9IGZ1bmN0aW9uKGV4dGVudCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEV4dGVudChwcm9qZWN0aW9uLCBleHRlbnQsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRTaXplID0gZnVuY3Rpb24oc2l6ZSwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFNpemUocHJvamVjdGlvbiwgc2l6ZSwgb2JqZWN0KTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdFdpZHRoID0gZnVuY3Rpb24od2lkdGgsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRXaWR0aChwcm9qZWN0aW9uLCB3aWR0aCwgb2JqZWN0KTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmZpdEhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEhlaWdodChwcm9qZWN0aW9uLCBoZWlnaHQsIG9iamVjdCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVjZW50ZXIoKSB7XG4gICAgdmFyIGNlbnRlciA9IHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIDAsIDAsIHN4LCBzeSwgYWxwaGEpLmFwcGx5KG51bGwsIHByb2plY3QobGFtYmRhLCBwaGkpKSxcbiAgICAgICAgdHJhbnNmb3JtID0gc2NhbGVUcmFuc2xhdGVSb3RhdGUoaywgeCAtIGNlbnRlclswXSwgeSAtIGNlbnRlclsxXSwgc3gsIHN5LCBhbHBoYSk7XG4gICAgcm90YXRlID0gcm90YXRlUmFkaWFucyhkZWx0YUxhbWJkYSwgZGVsdGFQaGksIGRlbHRhR2FtbWEpO1xuICAgIHByb2plY3RUcmFuc2Zvcm0gPSBjb21wb3NlKHByb2plY3QsIHRyYW5zZm9ybSk7XG4gICAgcHJvamVjdFJvdGF0ZVRyYW5zZm9ybSA9IGNvbXBvc2Uocm90YXRlLCBwcm9qZWN0VHJhbnNmb3JtKTtcbiAgICBwcm9qZWN0UmVzYW1wbGUgPSByZXNhbXBsZShwcm9qZWN0VHJhbnNmb3JtLCBkZWx0YTIpO1xuICAgIHJldHVybiByZXNldCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgY2FjaGUgPSBjYWNoZVN0cmVhbSA9IG51bGw7XG4gICAgcmV0dXJuIHByb2plY3Rpb247XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcHJvamVjdCA9IHByb2plY3RBdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHByb2plY3Rpb24uaW52ZXJ0ID0gcHJvamVjdC5pbnZlcnQgJiYgaW52ZXJ0O1xuICAgIHJldHVybiByZWNlbnRlcigpO1xuICB9O1xufVxuIiwgImltcG9ydCB7ZGVncmVlcywgcGksIHJhZGlhbnN9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3Byb2plY3Rpb25NdXRhdG9yfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uaWNQcm9qZWN0aW9uKHByb2plY3RBdCkge1xuICB2YXIgcGhpMCA9IDAsXG4gICAgICBwaGkxID0gcGkgLyAzLFxuICAgICAgbSA9IHByb2plY3Rpb25NdXRhdG9yKHByb2plY3RBdCksXG4gICAgICBwID0gbShwaGkwLCBwaGkxKTtcblxuICBwLnBhcmFsbGVscyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IG0ocGhpMCA9IF9bMF0gKiByYWRpYW5zLCBwaGkxID0gX1sxXSAqIHJhZGlhbnMpIDogW3BoaTAgKiBkZWdyZWVzLCBwaGkxICogZGVncmVlc107XG4gIH07XG5cbiAgcmV0dXJuIHA7XG59XG4iLCAiaW1wb3J0IHthc2luLCBjb3MsIHNpbn0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGN5bGluZHJpY2FsRXF1YWxBcmVhUmF3KHBoaTApIHtcbiAgdmFyIGNvc1BoaTAgPSBjb3MocGhpMCk7XG5cbiAgZnVuY3Rpb24gZm9yd2FyZChsYW1iZGEsIHBoaSkge1xuICAgIHJldHVybiBbbGFtYmRhICogY29zUGhpMCwgc2luKHBoaSkgLyBjb3NQaGkwXTtcbiAgfVxuXG4gIGZvcndhcmQuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiBbeCAvIGNvc1BoaTAsIGFzaW4oeSAqIGNvc1BoaTApXTtcbiAgfTtcblxuICByZXR1cm4gZm9yd2FyZDtcbn1cbiIsICJpbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgcGksIHNpZ24sIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7Y29uaWNQcm9qZWN0aW9ufSBmcm9tIFwiLi9jb25pYy5qc1wiO1xuaW1wb3J0IHtjeWxpbmRyaWNhbEVxdWFsQXJlYVJhd30gZnJvbSBcIi4vY3lsaW5kcmljYWxFcXVhbEFyZWEuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmljRXF1YWxBcmVhUmF3KHkwLCB5MSkge1xuICB2YXIgc3kwID0gc2luKHkwKSwgbiA9IChzeTAgKyBzaW4oeTEpKSAvIDI7XG5cbiAgLy8gQXJlIHRoZSBwYXJhbGxlbHMgc3ltbWV0cmljYWwgYXJvdW5kIHRoZSBFcXVhdG9yP1xuICBpZiAoYWJzKG4pIDwgZXBzaWxvbikgcmV0dXJuIGN5bGluZHJpY2FsRXF1YWxBcmVhUmF3KHkwKTtcblxuICB2YXIgYyA9IDEgKyBzeTAgKiAoMiAqIG4gLSBzeTApLCByMCA9IHNxcnQoYykgLyBuO1xuXG4gIGZ1bmN0aW9uIHByb2plY3QoeCwgeSkge1xuICAgIHZhciByID0gc3FydChjIC0gMiAqIG4gKiBzaW4oeSkpIC8gbjtcbiAgICByZXR1cm4gW3IgKiBzaW4oeCAqPSBuKSwgcjAgLSByICogY29zKHgpXTtcbiAgfVxuXG4gIHByb2plY3QuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciByMHkgPSByMCAtIHksXG4gICAgICAgIGwgPSBhdGFuMih4LCBhYnMocjB5KSkgKiBzaWduKHIweSk7XG4gICAgaWYgKHIweSAqIG4gPCAwKVxuICAgICAgbCAtPSBwaSAqIHNpZ24oeCkgKiBzaWduKHIweSk7XG4gICAgcmV0dXJuIFtsIC8gbiwgYXNpbigoYyAtICh4ICogeCArIHIweSAqIHIweSkgKiBuICogbikgLyAoMiAqIG4pKV07XG4gIH07XG5cbiAgcmV0dXJuIHByb2plY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNQcm9qZWN0aW9uKGNvbmljRXF1YWxBcmVhUmF3KVxuICAgICAgLnNjYWxlKDE1NS40MjQpXG4gICAgICAuY2VudGVyKFswLCAzMy42NDQyXSk7XG59XG4iLCAiaW1wb3J0IGNvbmljRXF1YWxBcmVhIGZyb20gXCIuL2NvbmljRXF1YWxBcmVhLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gY29uaWNFcXVhbEFyZWEoKVxuICAgICAgLnBhcmFsbGVscyhbMjkuNSwgNDUuNV0pXG4gICAgICAuc2NhbGUoMTA3MClcbiAgICAgIC50cmFuc2xhdGUoWzQ4MCwgMjUwXSlcbiAgICAgIC5yb3RhdGUoWzk2LCAwXSlcbiAgICAgIC5jZW50ZXIoWy0wLjYsIDM4LjddKTtcbn1cbiIsICJpbXBvcnQge2Vwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgYWxiZXJzIGZyb20gXCIuL2FsYmVycy5qc1wiO1xuaW1wb3J0IGNvbmljRXF1YWxBcmVhIGZyb20gXCIuL2NvbmljRXF1YWxBcmVhLmpzXCI7XG5pbXBvcnQge2ZpdEV4dGVudCwgZml0U2l6ZSwgZml0V2lkdGgsIGZpdEhlaWdodH0gZnJvbSBcIi4vZml0LmpzXCI7XG5cbi8vIFRoZSBwcm9qZWN0aW9ucyBtdXN0IGhhdmUgbXV0dWFsbHkgZXhjbHVzaXZlIGNsaXAgcmVnaW9ucyBvbiB0aGUgc3BoZXJlLFxuLy8gYXMgdGhpcyB3aWxsIGF2b2lkIGVtaXR0aW5nIGludGVybGVhdmluZyBsaW5lcyBhbmQgcG9seWdvbnMuXG5mdW5jdGlvbiBtdWx0aXBsZXgoc3RyZWFtcykge1xuICB2YXIgbiA9IHN0cmVhbXMubGVuZ3RoO1xuICByZXR1cm4ge1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnBvaW50KHgsIHkpOyB9LFxuICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnNwaGVyZSgpOyB9LFxuICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLmxpbmVTdGFydCgpOyB9LFxuICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5saW5lRW5kKCk7IH0sXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ucG9seWdvblN0YXJ0KCk7IH0sXG4gICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnBvbHlnb25FbmQoKTsgfVxuICB9O1xufVxuXG4vLyBBIGNvbXBvc2l0ZSBwcm9qZWN0aW9uIGZvciB0aGUgVW5pdGVkIFN0YXRlcywgY29uZmlndXJlZCBieSBkZWZhdWx0IGZvclxuLy8gOTYwXHUwMEQ3NTAwLiBUaGUgcHJvamVjdGlvbiBhbHNvIHdvcmtzIHF1aXRlIHdlbGwgYXQgOTYwXHUwMEQ3NjAwIGlmIHlvdSBjaGFuZ2UgdGhlXG4vLyBzY2FsZSB0byAxMjg1IGFuZCBhZGp1c3QgdGhlIHRyYW5zbGF0ZSBhY2NvcmRpbmdseS4gVGhlIHNldCBvZiBzdGFuZGFyZFxuLy8gcGFyYWxsZWxzIGZvciBlYWNoIHJlZ2lvbiBjb21lcyBmcm9tIFVTR1MsIHdoaWNoIGlzIHB1Ymxpc2hlZCBoZXJlOlxuLy8gaHR0cDovL2Vnc2MudXNncy5nb3YvaXNiL3B1YnMvTWFwUHJvamVjdGlvbnMvcHJvamVjdGlvbnMuaHRtbCNhbGJlcnNcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FjaGUsXG4gICAgICBjYWNoZVN0cmVhbSxcbiAgICAgIGxvd2VyNDggPSBhbGJlcnMoKSwgbG93ZXI0OFBvaW50LFxuICAgICAgYWxhc2thID0gY29uaWNFcXVhbEFyZWEoKS5yb3RhdGUoWzE1NCwgMF0pLmNlbnRlcihbLTIsIDU4LjVdKS5wYXJhbGxlbHMoWzU1LCA2NV0pLCBhbGFza2FQb2ludCwgLy8gRVBTRzozMzM4XG4gICAgICBoYXdhaWkgPSBjb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbMTU3LCAwXSkuY2VudGVyKFstMywgMTkuOV0pLnBhcmFsbGVscyhbOCwgMThdKSwgaGF3YWlpUG9pbnQsIC8vIEVTUkk6MTAyMDA3XG4gICAgICBwb2ludCwgcG9pbnRTdHJlYW0gPSB7cG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHsgcG9pbnQgPSBbeCwgeV07IH19O1xuXG4gIGZ1bmN0aW9uIGFsYmVyc1VzYShjb29yZGluYXRlcykge1xuICAgIHZhciB4ID0gY29vcmRpbmF0ZXNbMF0sIHkgPSBjb29yZGluYXRlc1sxXTtcbiAgICByZXR1cm4gcG9pbnQgPSBudWxsLFxuICAgICAgICAobG93ZXI0OFBvaW50LnBvaW50KHgsIHkpLCBwb2ludClcbiAgICAgICAgfHwgKGFsYXNrYVBvaW50LnBvaW50KHgsIHkpLCBwb2ludClcbiAgICAgICAgfHwgKGhhd2FpaVBvaW50LnBvaW50KHgsIHkpLCBwb2ludCk7XG4gIH1cblxuICBhbGJlcnNVc2EuaW52ZXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgayA9IGxvd2VyNDguc2NhbGUoKSxcbiAgICAgICAgdCA9IGxvd2VyNDgudHJhbnNsYXRlKCksXG4gICAgICAgIHggPSAoY29vcmRpbmF0ZXNbMF0gLSB0WzBdKSAvIGssXG4gICAgICAgIHkgPSAoY29vcmRpbmF0ZXNbMV0gLSB0WzFdKSAvIGs7XG4gICAgcmV0dXJuICh5ID49IDAuMTIwICYmIHkgPCAwLjIzNCAmJiB4ID49IC0wLjQyNSAmJiB4IDwgLTAuMjE0ID8gYWxhc2thXG4gICAgICAgIDogeSA+PSAwLjE2NiAmJiB5IDwgMC4yMzQgJiYgeCA+PSAtMC4yMTQgJiYgeCA8IC0wLjExNSA/IGhhd2FpaVxuICAgICAgICA6IGxvd2VyNDgpLmludmVydChjb29yZGluYXRlcyk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IG11bHRpcGxleChbbG93ZXI0OC5zdHJlYW0oY2FjaGVTdHJlYW0gPSBzdHJlYW0pLCBhbGFza2Euc3RyZWFtKHN0cmVhbSksIGhhd2FpaS5zdHJlYW0oc3RyZWFtKV0pO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5wcmVjaXNpb24oKTtcbiAgICBsb3dlcjQ4LnByZWNpc2lvbihfKSwgYWxhc2thLnByZWNpc2lvbihfKSwgaGF3YWlpLnByZWNpc2lvbihfKTtcbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfTtcblxuICBhbGJlcnNVc2Euc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5zY2FsZSgpO1xuICAgIGxvd2VyNDguc2NhbGUoXyksIGFsYXNrYS5zY2FsZShfICogMC4zNSksIGhhd2FpaS5zY2FsZShfKTtcbiAgICByZXR1cm4gYWxiZXJzVXNhLnRyYW5zbGF0ZShsb3dlcjQ4LnRyYW5zbGF0ZSgpKTtcbiAgfTtcblxuICBhbGJlcnNVc2EudHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDgudHJhbnNsYXRlKCk7XG4gICAgdmFyIGsgPSBsb3dlcjQ4LnNjYWxlKCksIHggPSArX1swXSwgeSA9ICtfWzFdO1xuXG4gICAgbG93ZXI0OFBvaW50ID0gbG93ZXI0OFxuICAgICAgICAudHJhbnNsYXRlKF8pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuNDU1ICogaywgeSAtIDAuMjM4ICoga10sIFt4ICsgMC40NTUgKiBrLCB5ICsgMC4yMzggKiBrXV0pXG4gICAgICAgIC5zdHJlYW0ocG9pbnRTdHJlYW0pO1xuXG4gICAgYWxhc2thUG9pbnQgPSBhbGFza2FcbiAgICAgICAgLnRyYW5zbGF0ZShbeCAtIDAuMzA3ICogaywgeSArIDAuMjAxICoga10pXG4gICAgICAgIC5jbGlwRXh0ZW50KFtbeCAtIDAuNDI1ICogayArIGVwc2lsb24sIHkgKyAwLjEyMCAqIGsgKyBlcHNpbG9uXSwgW3ggLSAwLjIxNCAqIGsgLSBlcHNpbG9uLCB5ICsgMC4yMzQgKiBrIC0gZXBzaWxvbl1dKVxuICAgICAgICAuc3RyZWFtKHBvaW50U3RyZWFtKTtcblxuICAgIGhhd2FpaVBvaW50ID0gaGF3YWlpXG4gICAgICAgIC50cmFuc2xhdGUoW3ggLSAwLjIwNSAqIGssIHkgKyAwLjIxMiAqIGtdKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjIxNCAqIGsgKyBlcHNpbG9uLCB5ICsgMC4xNjYgKiBrICsgZXBzaWxvbl0sIFt4IC0gMC4xMTUgKiBrIC0gZXBzaWxvbiwgeSArIDAuMjM0ICogayAtIGVwc2lsb25dXSlcbiAgICAgICAgLnN0cmVhbShwb2ludFN0cmVhbSk7XG5cbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0RXh0ZW50ID0gZnVuY3Rpb24oZXh0ZW50LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0RXh0ZW50KGFsYmVyc1VzYSwgZXh0ZW50LCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRTaXplID0gZnVuY3Rpb24oc2l6ZSwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFNpemUoYWxiZXJzVXNhLCBzaXplLCBvYmplY3QpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5maXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0V2lkdGgoYWxiZXJzVXNhLCB3aWR0aCwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0SGVpZ2h0ID0gZnVuY3Rpb24oaGVpZ2h0LCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0SGVpZ2h0KGFsYmVyc1VzYSwgaGVpZ2h0LCBvYmplY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgIHJldHVybiBhbGJlcnNVc2E7XG4gIH1cblxuICByZXR1cm4gYWxiZXJzVXNhLnNjYWxlKDEwNzApO1xufVxuIiwgImltcG9ydCB7YXNpbiwgYXRhbjIsIGNvcywgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gYXppbXV0aGFsUmF3KHNjYWxlKSB7XG4gIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIGN4ID0gY29zKHgpLFxuICAgICAgICBjeSA9IGNvcyh5KSxcbiAgICAgICAgayA9IHNjYWxlKGN4ICogY3kpO1xuICAgICAgICBpZiAoayA9PT0gSW5maW5pdHkpIHJldHVybiBbMiwgMF07XG4gICAgcmV0dXJuIFtcbiAgICAgIGsgKiBjeSAqIHNpbih4KSxcbiAgICAgIGsgKiBzaW4oeSlcbiAgICBdO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhemltdXRoYWxJbnZlcnQoYW5nbGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgeiA9IHNxcnQoeCAqIHggKyB5ICogeSksXG4gICAgICAgIGMgPSBhbmdsZSh6KSxcbiAgICAgICAgc2MgPSBzaW4oYyksXG4gICAgICAgIGNjID0gY29zKGMpO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih4ICogc2MsIHogKiBjYyksXG4gICAgICBhc2luKHogJiYgeSAqIHNjIC8geilcbiAgICBdO1xuICB9XG59XG4iLCAiaW1wb3J0IHthc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHthemltdXRoYWxSYXcsIGF6aW11dGhhbEludmVydH0gZnJvbSBcIi4vYXppbXV0aGFsLmpzXCI7XG5pbXBvcnQgcHJvamVjdGlvbiBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgdmFyIGF6aW11dGhhbEVxdWFsQXJlYVJhdyA9IGF6aW11dGhhbFJhdyhmdW5jdGlvbihjeGN5KSB7XG4gIHJldHVybiBzcXJ0KDIgLyAoMSArIGN4Y3kpKTtcbn0pO1xuXG5hemltdXRoYWxFcXVhbEFyZWFSYXcuaW52ZXJ0ID0gYXppbXV0aGFsSW52ZXJ0KGZ1bmN0aW9uKHopIHtcbiAgcmV0dXJuIDIgKiBhc2luKHogLyAyKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHByb2plY3Rpb24oYXppbXV0aGFsRXF1YWxBcmVhUmF3KVxuICAgICAgLnNjYWxlKDEyNC43NSlcbiAgICAgIC5jbGlwQW5nbGUoMTgwIC0gMWUtMyk7XG59XG4iLCAiaW1wb3J0IHByb2plY3Rpb24gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBjb3MsIGVwc2lsb24yLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbnZhciBBMSA9IDEuMzQwMjY0LFxuICAgIEEyID0gLTAuMDgxMTA2LFxuICAgIEEzID0gMC4wMDA4OTMsXG4gICAgQTQgPSAwLjAwMzc5NixcbiAgICBNID0gc3FydCgzKSAvIDIsXG4gICAgaXRlcmF0aW9ucyA9IDEyO1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxFYXJ0aFJhdyhsYW1iZGEsIHBoaSkge1xuICB2YXIgbCA9IGFzaW4oTSAqIHNpbihwaGkpKSwgbDIgPSBsICogbCwgbDYgPSBsMiAqIGwyICogbDI7XG4gIHJldHVybiBbXG4gICAgbGFtYmRhICogY29zKGwpIC8gKE0gKiAoQTEgKyAzICogQTIgKiBsMiArIGw2ICogKDcgKiBBMyArIDkgKiBBNCAqIGwyKSkpLFxuICAgIGwgKiAoQTEgKyBBMiAqIGwyICsgbDYgKiAoQTMgKyBBNCAqIGwyKSlcbiAgXTtcbn1cblxuZXF1YWxFYXJ0aFJhdy5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gIHZhciBsID0geSwgbDIgPSBsICogbCwgbDYgPSBsMiAqIGwyICogbDI7XG4gIGZvciAodmFyIGkgPSAwLCBkZWx0YSwgZnksIGZweTsgaSA8IGl0ZXJhdGlvbnM7ICsraSkge1xuICAgIGZ5ID0gbCAqIChBMSArIEEyICogbDIgKyBsNiAqIChBMyArIEE0ICogbDIpKSAtIHk7XG4gICAgZnB5ID0gQTEgKyAzICogQTIgKiBsMiArIGw2ICogKDcgKiBBMyArIDkgKiBBNCAqIGwyKTtcbiAgICBsIC09IGRlbHRhID0gZnkgLyBmcHksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICAgIGlmIChhYnMoZGVsdGEpIDwgZXBzaWxvbjIpIGJyZWFrO1xuICB9XG4gIHJldHVybiBbXG4gICAgTSAqIHggKiAoQTEgKyAzICogQTIgKiBsMiArIGw2ICogKDcgKiBBMyArIDkgKiBBNCAqIGwyKSkgLyBjb3MobCksXG4gICAgYXNpbihzaW4obCkgLyBNKVxuICBdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKGVxdWFsRWFydGhSYXcpXG4gICAgICAuc2NhbGUoMTc3LjE1OCk7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZm9ybShrLCB4LCB5KSB7XG4gIHRoaXMuayA9IGs7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm0sXG4gIHNjYWxlOiBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIGsgPT09IDEgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmsgKiBrLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB4ID09PSAwICYgeSA9PT0gMCA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuaywgdGhpcy54ICsgdGhpcy5rICogeCwgdGhpcy55ICsgdGhpcy5rICogeSk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBbcG9pbnRbMF0gKiB0aGlzLmsgKyB0aGlzLngsIHBvaW50WzFdICogdGhpcy5rICsgdGhpcy55XTtcbiAgfSxcbiAgYXBwbHlYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLmsgKyB0aGlzLng7XG4gIH0sXG4gIGFwcGx5WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5rICsgdGhpcy55O1xuICB9LFxuICBpbnZlcnQ6IGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIFsobG9jYXRpb25bMF0gLSB0aGlzLngpIC8gdGhpcy5rLCAobG9jYXRpb25bMV0gLSB0aGlzLnkpIC8gdGhpcy5rXTtcbiAgfSxcbiAgaW52ZXJ0WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAtIHRoaXMueCkgLyB0aGlzLms7XG4gIH0sXG4gIGludmVydFk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gKHkgLSB0aGlzLnkpIC8gdGhpcy5rO1xuICB9LFxuICByZXNjYWxlWDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4LmNvcHkoKS5kb21haW4oeC5yYW5nZSgpLm1hcCh0aGlzLmludmVydFgsIHRoaXMpLm1hcCh4LmludmVydCwgeCkpO1xuICB9LFxuICByZXNjYWxlWTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5LmNvcHkoKS5kb21haW4oeS5yYW5nZSgpLm1hcCh0aGlzLmludmVydFksIHRoaXMpLm1hcCh5LmludmVydCwgeSkpO1xuICB9LFxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnkgKyBcIikgc2NhbGUoXCIgKyB0aGlzLmsgKyBcIilcIjtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IG5ldyBUcmFuc2Zvcm0oMSwgMCwgMCk7XG5cbnRyYW5zZm9ybS5wcm90b3R5cGUgPSBUcmFuc2Zvcm0ucHJvdG90eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2Zvcm0obm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX196b29tKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuIGlkZW50aXR5O1xuICByZXR1cm4gbm9kZS5fX3pvb207XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBkYXRhIGxvYWRlclxuLy8gTG9hZHMgSlNPTiBhbmQgdGV4dCBlaXRoZXIgZnJvbSBhbiBpbmxpbmVkIDxzY3JpcHQgdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIiBkYXRhLXBhdGg9XCJcdTIwMjZcIj4gYmxvY2tcbi8vICh0aGUgb2ZmbGluZSBzaW5nbGUtZmlsZSBidWlsZCkgb3IgYnkgZmV0Y2hpbmcgaXQgcmVsYXRpdmUgdG8gdGhlIHBhZ2UgKEdpdEh1YiBQYWdlcyAvIGRldiBzZXJ2ZXIpLlxuXG5jb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblxuZnVuY3Rpb24gaW5saW5lZChwYXRoKSB7XG4gIGNvbnN0IHNlbCA9IGBzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIl1bZGF0YS1wYXRoPVwiJHtDU1MuZXNjYXBlKHBhdGgpfVwiXWA7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuICByZXR1cm4gZWwgPyBlbC50ZXh0Q29udGVudCA6IG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dChwYXRoKSB7XG4gIGNvbnN0IGlubCA9IGlubGluZWQocGF0aCk7XG4gIGlmIChpbmwgIT09IG51bGwpIHJldHVybiBpbmw7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHBhdGgpO1xuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgbG9hZCAke3BhdGh9IChIVFRQICR7cmVzLnN0YXR1c30pYCk7XG4gIHJldHVybiByZXMudGV4dCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEpTT04ocGF0aCkge1xuICBpZiAoIWNhY2hlLmhhcyhwYXRoKSkgY2FjaGUuc2V0KHBhdGgsIGxvYWRUZXh0KHBhdGgpLnRoZW4oKHQpID0+IEpTT04ucGFyc2UodCkpKTtcbiAgcmV0dXJuIGNhY2hlLmdldChwYXRoKTtcbn1cblxuLy8gVVJMIGZvciBhbiBhc3NldCAoaW1hZ2UpLiBUaGUgb2ZmbGluZSBidWlsZCByZWdpc3RlcnMgZGF0YTogVVJMcyBpbiB3aW5kb3cuX19QQVJDSE1FTlRfQVNTRVRTX18uXG5leHBvcnQgZnVuY3Rpb24gYXNzZXRVUkwocGF0aCkge1xuICBjb25zdCBhc3NldHMgPSBnbG9iYWxUaGlzLl9fUEFSQ0hNRU5UX0FTU0VUU19fO1xuICByZXR1cm4gKGFzc2V0cyAmJiBhc3NldHNbcGF0aF0pIHx8IHBhdGg7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4geDtcbn1cbiIsICJpbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4vaWRlbnRpdHkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNmb3JtKSB7XG4gIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICB2YXIgeDAsXG4gICAgICB5MCxcbiAgICAgIGt4ID0gdHJhbnNmb3JtLnNjYWxlWzBdLFxuICAgICAga3kgPSB0cmFuc2Zvcm0uc2NhbGVbMV0sXG4gICAgICBkeCA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMF0sXG4gICAgICBkeSA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCwgaSkge1xuICAgIGlmICghaSkgeDAgPSB5MCA9IDA7XG4gICAgdmFyIGogPSAyLCBuID0gaW5wdXQubGVuZ3RoLCBvdXRwdXQgPSBuZXcgQXJyYXkobik7XG4gICAgb3V0cHV0WzBdID0gKHgwICs9IGlucHV0WzBdKSAqIGt4ICsgZHg7XG4gICAgb3V0cHV0WzFdID0gKHkwICs9IGlucHV0WzFdKSAqIGt5ICsgZHk7XG4gICAgd2hpbGUgKGogPCBuKSBvdXRwdXRbal0gPSBpbnB1dFtqXSwgKytqO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYXJyYXksIG4pIHtcbiAgdmFyIHQsIGogPSBhcnJheS5sZW5ndGgsIGkgPSBqIC0gbjtcbiAgd2hpbGUgKGkgPCAtLWopIHQgPSBhcnJheVtpXSwgYXJyYXlbaSsrXSA9IGFycmF5W2pdLCBhcnJheVtqXSA9IHQ7XG59XG4iLCAiaW1wb3J0IHJldmVyc2UgZnJvbSBcIi4vcmV2ZXJzZS5qc1wiO1xuaW1wb3J0IHRyYW5zZm9ybSBmcm9tIFwiLi90cmFuc2Zvcm0uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odG9wb2xvZ3ksIG8pIHtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSBvID0gdG9wb2xvZ3kub2JqZWN0c1tvXTtcbiAgcmV0dXJuIG8udHlwZSA9PT0gXCJHZW9tZXRyeUNvbGxlY3Rpb25cIlxuICAgICAgPyB7dHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLCBmZWF0dXJlczogby5nZW9tZXRyaWVzLm1hcChmdW5jdGlvbihvKSB7IHJldHVybiBmZWF0dXJlKHRvcG9sb2d5LCBvKTsgfSl9XG4gICAgICA6IGZlYXR1cmUodG9wb2xvZ3ksIG8pO1xufVxuXG5mdW5jdGlvbiBmZWF0dXJlKHRvcG9sb2d5LCBvKSB7XG4gIHZhciBpZCA9IG8uaWQsXG4gICAgICBiYm94ID0gby5iYm94LFxuICAgICAgcHJvcGVydGllcyA9IG8ucHJvcGVydGllcyA9PSBudWxsID8ge30gOiBvLnByb3BlcnRpZXMsXG4gICAgICBnZW9tZXRyeSA9IG9iamVjdCh0b3BvbG9neSwgbyk7XG4gIHJldHVybiBpZCA9PSBudWxsICYmIGJib3ggPT0gbnVsbCA/IHt0eXBlOiBcIkZlYXR1cmVcIiwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fVxuICAgICAgOiBiYm94ID09IG51bGwgPyB7dHlwZTogXCJGZWF0dXJlXCIsIGlkOiBpZCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fVxuICAgICAgOiB7dHlwZTogXCJGZWF0dXJlXCIsIGlkOiBpZCwgYmJveDogYmJveCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdCh0b3BvbG9neSwgbykge1xuICB2YXIgdHJhbnNmb3JtUG9pbnQgPSB0cmFuc2Zvcm0odG9wb2xvZ3kudHJhbnNmb3JtKSxcbiAgICAgIGFyY3MgPSB0b3BvbG9neS5hcmNzO1xuXG4gIGZ1bmN0aW9uIGFyYyhpLCBwb2ludHMpIHtcbiAgICBpZiAocG9pbnRzLmxlbmd0aCkgcG9pbnRzLnBvcCgpO1xuICAgIGZvciAodmFyIGEgPSBhcmNzW2kgPCAwID8gfmkgOiBpXSwgayA9IDAsIG4gPSBhLmxlbmd0aDsgayA8IG47ICsraykge1xuICAgICAgcG9pbnRzLnB1c2godHJhbnNmb3JtUG9pbnQoYVtrXSwgaykpO1xuICAgIH1cbiAgICBpZiAoaSA8IDApIHJldmVyc2UocG9pbnRzLCBuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvaW50KHApIHtcbiAgICByZXR1cm4gdHJhbnNmb3JtUG9pbnQocCk7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lKGFyY3MpIHtcbiAgICB2YXIgcG9pbnRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmNzLmxlbmd0aDsgaSA8IG47ICsraSkgYXJjKGFyY3NbaV0sIHBvaW50cyk7XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPCAyKSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gcGVyIHRoZSBzcGVjaWZpY2F0aW9uLlxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cblxuICBmdW5jdGlvbiByaW5nKGFyY3MpIHtcbiAgICB2YXIgcG9pbnRzID0gbGluZShhcmNzKTtcbiAgICB3aGlsZSAocG9pbnRzLmxlbmd0aCA8IDQpIHBvaW50cy5wdXNoKHBvaW50c1swXSk7IC8vIFRoaXMgbWF5IGhhcHBlbiBpZiBhbiBhcmMgaGFzIG9ubHkgdHdvIHBvaW50cy5cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9seWdvbihhcmNzKSB7XG4gICAgcmV0dXJuIGFyY3MubWFwKHJpbmcpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VvbWV0cnkobykge1xuICAgIHZhciB0eXBlID0gby50eXBlLCBjb29yZGluYXRlcztcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJHZW9tZXRyeUNvbGxlY3Rpb25cIjogcmV0dXJuIHt0eXBlOiB0eXBlLCBnZW9tZXRyaWVzOiBvLmdlb21ldHJpZXMubWFwKGdlb21ldHJ5KX07XG4gICAgICBjYXNlIFwiUG9pbnRcIjogY29vcmRpbmF0ZXMgPSBwb2ludChvLmNvb3JkaW5hdGVzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2ludFwiOiBjb29yZGluYXRlcyA9IG8uY29vcmRpbmF0ZXMubWFwKHBvaW50KTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTGluZVN0cmluZ1wiOiBjb29yZGluYXRlcyA9IGxpbmUoby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlMaW5lU3RyaW5nXCI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChsaW5lKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiUG9seWdvblwiOiBjb29yZGluYXRlcyA9IHBvbHlnb24oby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2x5Z29uXCI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChwb2x5Z29uKTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9O1xuICB9XG5cbiAgcmV0dXJuIGdlb21ldHJ5KG8pO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRvcG9sb2d5LCBhcmNzKSB7XG4gIHZhciBzdGl0Y2hlZEFyY3MgPSB7fSxcbiAgICAgIGZyYWdtZW50QnlTdGFydCA9IHt9LFxuICAgICAgZnJhZ21lbnRCeUVuZCA9IHt9LFxuICAgICAgZnJhZ21lbnRzID0gW10sXG4gICAgICBlbXB0eUluZGV4ID0gLTE7XG5cbiAgLy8gU3RpdGNoIGVtcHR5IGFyY3MgZmlyc3QsIHNpbmNlIHRoZXkgbWF5IGJlIHN1YnN1bWVkIGJ5IG90aGVyIGFyY3MuXG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpLCBqKSB7XG4gICAgdmFyIGFyYyA9IHRvcG9sb2d5LmFyY3NbaSA8IDAgPyB+aSA6IGldLCB0O1xuICAgIGlmIChhcmMubGVuZ3RoIDwgMyAmJiAhYXJjWzFdWzBdICYmICFhcmNbMV1bMV0pIHtcbiAgICAgIHQgPSBhcmNzWysrZW1wdHlJbmRleF0sIGFyY3NbZW1wdHlJbmRleF0gPSBpLCBhcmNzW2pdID0gdDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpKSB7XG4gICAgdmFyIGUgPSBlbmRzKGkpLFxuICAgICAgICBzdGFydCA9IGVbMF0sXG4gICAgICAgIGVuZCA9IGVbMV0sXG4gICAgICAgIGYsIGc7XG5cbiAgICBpZiAoZiA9IGZyYWdtZW50QnlFbmRbc3RhcnRdKSB7XG4gICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtmLmVuZF07XG4gICAgICBmLnB1c2goaSk7XG4gICAgICBmLmVuZCA9IGVuZDtcbiAgICAgIGlmIChnID0gZnJhZ21lbnRCeVN0YXJ0W2VuZF0pIHtcbiAgICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtnLnN0YXJ0XTtcbiAgICAgICAgdmFyIGZnID0gZyA9PT0gZiA/IGYgOiBmLmNvbmNhdChnKTtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W2ZnLnN0YXJ0ID0gZi5zdGFydF0gPSBmcmFnbWVudEJ5RW5kW2ZnLmVuZCA9IGcuZW5kXSA9IGZnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmLmVuZF0gPSBmO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZiA9IGZyYWdtZW50QnlTdGFydFtlbmRdKSB7XG4gICAgICBkZWxldGUgZnJhZ21lbnRCeVN0YXJ0W2Yuc3RhcnRdO1xuICAgICAgZi51bnNoaWZ0KGkpO1xuICAgICAgZi5zdGFydCA9IHN0YXJ0O1xuICAgICAgaWYgKGcgPSBmcmFnbWVudEJ5RW5kW3N0YXJ0XSkge1xuICAgICAgICBkZWxldGUgZnJhZ21lbnRCeUVuZFtnLmVuZF07XG4gICAgICAgIHZhciBnZiA9IGcgPT09IGYgPyBmIDogZy5jb25jYXQoZik7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtnZi5zdGFydCA9IGcuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtnZi5lbmQgPSBmLmVuZF0gPSBnZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmRdID0gZjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZiA9IFtpXTtcbiAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0ID0gc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmLmVuZCA9IGVuZF0gPSBmO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gZW5kcyhpKSB7XG4gICAgdmFyIGFyYyA9IHRvcG9sb2d5LmFyY3NbaSA8IDAgPyB+aSA6IGldLCBwMCA9IGFyY1swXSwgcDE7XG4gICAgaWYgKHRvcG9sb2d5LnRyYW5zZm9ybSkgcDEgPSBbMCwgMF0sIGFyYy5mb3JFYWNoKGZ1bmN0aW9uKGRwKSB7IHAxWzBdICs9IGRwWzBdLCBwMVsxXSArPSBkcFsxXTsgfSk7XG4gICAgZWxzZSBwMSA9IGFyY1thcmMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIGkgPCAwID8gW3AxLCBwMF0gOiBbcDAsIHAxXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKGZyYWdtZW50QnlFbmQsIGZyYWdtZW50QnlTdGFydCkge1xuICAgIGZvciAodmFyIGsgaW4gZnJhZ21lbnRCeUVuZCkge1xuICAgICAgdmFyIGYgPSBmcmFnbWVudEJ5RW5kW2tdO1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XTtcbiAgICAgIGRlbGV0ZSBmLnN0YXJ0O1xuICAgICAgZGVsZXRlIGYuZW5kO1xuICAgICAgZi5mb3JFYWNoKGZ1bmN0aW9uKGkpIHsgc3RpdGNoZWRBcmNzW2kgPCAwID8gfmkgOiBpXSA9IDE7IH0pO1xuICAgICAgZnJhZ21lbnRzLnB1c2goZik7XG4gICAgfVxuICB9XG5cbiAgZmx1c2goZnJhZ21lbnRCeUVuZCwgZnJhZ21lbnRCeVN0YXJ0KTtcbiAgZmx1c2goZnJhZ21lbnRCeVN0YXJ0LCBmcmFnbWVudEJ5RW5kKTtcbiAgYXJjcy5mb3JFYWNoKGZ1bmN0aW9uKGkpIHsgaWYgKCFzdGl0Y2hlZEFyY3NbaSA8IDAgPyB+aSA6IGldKSBmcmFnbWVudHMucHVzaChbaV0pOyB9KTtcblxuICByZXR1cm4gZnJhZ21lbnRzO1xufVxuIiwgImltcG9ydCB7b2JqZWN0fSBmcm9tIFwiLi9mZWF0dXJlLmpzXCI7XG5pbXBvcnQgc3RpdGNoIGZyb20gXCIuL3N0aXRjaC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0b3BvbG9neSkge1xuICByZXR1cm4gb2JqZWN0KHRvcG9sb2d5LCBtZXNoQXJjcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc2hBcmNzKHRvcG9sb2d5LCBvYmplY3QsIGZpbHRlcikge1xuICB2YXIgYXJjcywgaSwgbjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcmNzID0gZXh0cmFjdEFyY3ModG9wb2xvZ3ksIG9iamVjdCwgZmlsdGVyKTtcbiAgZWxzZSBmb3IgKGkgPSAwLCBhcmNzID0gbmV3IEFycmF5KG4gPSB0b3BvbG9neS5hcmNzLmxlbmd0aCk7IGkgPCBuOyArK2kpIGFyY3NbaV0gPSBpO1xuICByZXR1cm4ge3R5cGU6IFwiTXVsdGlMaW5lU3RyaW5nXCIsIGFyY3M6IHN0aXRjaCh0b3BvbG9neSwgYXJjcyl9O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0QXJjcyh0b3BvbG9neSwgb2JqZWN0LCBmaWx0ZXIpIHtcbiAgdmFyIGFyY3MgPSBbXSxcbiAgICAgIGdlb21zQnlBcmMgPSBbXSxcbiAgICAgIGdlb207XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDAoaSkge1xuICAgIHZhciBqID0gaSA8IDAgPyB+aSA6IGk7XG4gICAgKGdlb21zQnlBcmNbal0gfHwgKGdlb21zQnlBcmNbal0gPSBbXSkpLnB1c2goe2k6IGksIGc6IGdlb219KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3QxKGFyY3MpIHtcbiAgICBhcmNzLmZvckVhY2goZXh0cmFjdDApO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDIoYXJjcykge1xuICAgIGFyY3MuZm9yRWFjaChleHRyYWN0MSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0MyhhcmNzKSB7XG4gICAgYXJjcy5mb3JFYWNoKGV4dHJhY3QyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlb21ldHJ5KG8pIHtcbiAgICBzd2l0Y2ggKGdlb20gPSBvLCBvLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJHZW9tZXRyeUNvbGxlY3Rpb25cIjogby5nZW9tZXRyaWVzLmZvckVhY2goZ2VvbWV0cnkpOyBicmVhaztcbiAgICAgIGNhc2UgXCJMaW5lU3RyaW5nXCI6IGV4dHJhY3QxKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpTGluZVN0cmluZ1wiOiBjYXNlIFwiUG9seWdvblwiOiBleHRyYWN0MihvLmFyY3MpOyBicmVhaztcbiAgICAgIGNhc2UgXCJNdWx0aVBvbHlnb25cIjogZXh0cmFjdDMoby5hcmNzKTsgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZ2VvbWV0cnkob2JqZWN0KTtcblxuICBnZW9tc0J5QXJjLmZvckVhY2goZmlsdGVyID09IG51bGxcbiAgICAgID8gZnVuY3Rpb24oZ2VvbXMpIHsgYXJjcy5wdXNoKGdlb21zWzBdLmkpOyB9XG4gICAgICA6IGZ1bmN0aW9uKGdlb21zKSB7IGlmIChmaWx0ZXIoZ2VvbXNbMF0uZywgZ2VvbXNbZ2VvbXMubGVuZ3RoIC0gMV0uZykpIGFyY3MucHVzaChnZW9tc1swXS5pKTsgfSk7XG5cbiAgcmV0dXJuIGFyY3M7XG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBiYXNlIHJlbmRlcmVyXG4vLyBCdWlsZHMgdGhlIHN0YWdlOiBwcm9qZWN0aW9uLCBwYXBlciwgb2NlYW4sIGJhdGh5bWV0cnksIHJlbGllZiwgbGFuZCwgcG9saXRpZXMsIHdhdGVyIGxpbmVzLCBjb2FzdCwgZ3JhdGljdWxlLCBmcmFtZS5cbi8vIEFsbCBnZW9tZXRyeSBjb21lcyBmcm9tIHRoZSBkb3dubG9hZGVkIGxheWVyczsgdGhpcyBmaWxlIG9ubHkgcHJvamVjdHMgYW5kIHN0eWxlcyBpdC5cblxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IHsgZmVhdHVyZSwgbWVzaCB9IGZyb20gJ3RvcG9qc29uLWNsaWVudCc7XG5pbXBvcnQgeyBhc3NldFVSTCB9IGZyb20gJy4uL2RhdGEvbG9hZGVyLmpzJztcblxuZXhwb3J0IGNvbnN0IFcgPSAxOTIwO1xuZXhwb3J0IGNvbnN0IEggPSAxMDgwO1xuLy8gVGhlIGdvbGQgcmluZy4gVGhlIGJvdHRvbSBpcyBkZWVwZXIgYmVjYXVzZSBpdCBjYXJyaWVzIHRoZSB0aW1lbGluZSBzdHJpcC5cbmV4cG9ydCBjb25zdCBGUkFNRSA9IHsgbGVmdDogMzIsIHJpZ2h0OiAzMiwgdG9wOiAzMiwgYm90dG9tOiA2NCB9O1xuXG5jb25zdCBQUk9KRUNUSU9OUyA9IHtcbiAgZXF1YWxFYXJ0aDogKCkgPT4gZDMuZ2VvRXF1YWxFYXJ0aCgpLFxuICBsYW1iZXJ0QXppbXV0aGFsRXF1YWxBcmVhOiAoKSA9PiBkMy5nZW9BemltdXRoYWxFcXVhbEFyZWEoKSxcbiAgYWxiZXJzVXNhOiAoKSA9PiBkMy5nZW9BbGJlcnNVc2EoKSxcbn07XG5cbi8vIEEgbG9uL2xhdCBib3ggd2l0aCBpdHMgZWRnZXMgZGVuc2lmaWVkIHNvIGZpdEV4dGVudCBzZWVzIHRoZSBib3gncyBjdXJ2ZWQgb3V0bGluZSBpbiB0aGUgcHJvamVjdGlvbi5cbi8vIGQzLWdlbyB0cmVhdHMgc3BoZXJpY2FsIHBvbHlnb25zIGJ5IHdpbmRpbmcgb3JkZXI6IHRoZSBleHRlcmlvciByaW5nIG11c3QgcnVuIGNsb2Nrd2lzZVxuLy8gKHdlc3RcdTIxOTJlYXN0IGFsb25nIHRoZSBub3J0aCBlZGdlIGZpcnN0KSwgb3IgdGhlIFwiaW5zaWRlXCIgYmVjb21lcyB0aGUgcmVzdCBvZiB0aGUgZ2xvYmUuXG5mdW5jdGlvbiBleHRlbnRQb2x5Z29uKHsgd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoIH0sIHN0ZXAgPSAxKSB7XG4gIGNvbnN0IHJpbmcgPSBbXTtcbiAgZm9yIChsZXQgeCA9IHdlc3Q7IHggPCBlYXN0OyB4ICs9IHN0ZXApIHJpbmcucHVzaChbeCwgbm9ydGhdKTtcbiAgZm9yIChsZXQgeSA9IG5vcnRoOyB5ID4gc291dGg7IHkgLT0gc3RlcCkgcmluZy5wdXNoKFtlYXN0LCB5XSk7XG4gIGZvciAobGV0IHggPSBlYXN0OyB4ID4gd2VzdDsgeCAtPSBzdGVwKSByaW5nLnB1c2goW3gsIHNvdXRoXSk7XG4gIGZvciAobGV0IHkgPSBzb3V0aDsgeSA8IG5vcnRoOyB5ICs9IHN0ZXApIHJpbmcucHVzaChbd2VzdCwgeV0pO1xuICByaW5nLnB1c2gocmluZ1swXSk7XG4gIHJldHVybiB7IHR5cGU6ICdQb2x5Z29uJywgY29vcmRpbmF0ZXM6IFtyaW5nXSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVByb2plY3Rpb24oc3RhZ2UsIGlubmVyKSB7XG4gIGNvbnN0IG1ha2UgPSBQUk9KRUNUSU9OU1tzdGFnZS5wcm9qZWN0aW9uXTtcbiAgaWYgKCFtYWtlKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvamVjdGlvbiAke3N0YWdlLnByb2plY3Rpb259YCk7XG4gIGNvbnN0IHByb2ogPSBtYWtlKCk7XG4gIGlmIChzdGFnZS5yb3RhdGUgJiYgcHJvai5yb3RhdGUpIHByb2oucm90YXRlKHN0YWdlLnJvdGF0ZSk7XG4gIHByb2ouZml0RXh0ZW50KGlubmVyLCBleHRlbnRQb2x5Z29uKHN0YWdlLmV4dGVudCkpO1xuICByZXR1cm4gcHJvajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YWdlKHN2Zywgc3RhZ2UsIGxheWVycykge1xuICBjb25zdCBpbm5lciA9IFtbRlJBTUUubGVmdCwgRlJBTUUudG9wXSwgW1cgLSBGUkFNRS5yaWdodCwgSCAtIEZSQU1FLmJvdHRvbV1dO1xuICBjb25zdCBbW3gwLCB5MF0sIFt4MSwgeTFdXSA9IGlubmVyO1xuICBjb25zdCBwcm9qZWN0aW9uID0gbWFrZVByb2plY3Rpb24oc3RhZ2UsIGlubmVyKTtcbiAgY29uc3QgcGF0aCA9IGQzLmdlb1BhdGgocHJvamVjdGlvbik7XG5cbiAgLy8gUHJvamVjdGVkIHBhdGggc3RyaW5ncyBhcmUgY2FjaGVkIHBlciBmZWF0dXJlIG9iamVjdDogYSBzbmFwc2hvdCBzd2l0Y2ggb25seSByZS1iaW5kcyBjYWNoZWQgc3RyaW5ncy5cbiAgY29uc3QgY2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuICBjb25zdCBkID0gKGYpID0+IHtcbiAgICBsZXQgcyA9IGNhY2hlLmdldChmKTtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7IHMgPSBwYXRoKGYpIHx8ICcnOyBjYWNoZS5zZXQoZiwgcyk7IH1cbiAgICByZXR1cm4gcztcbiAgfTtcblxuICBzdmcuYXR0cigndmlld0JveCcsIGAwIDAgJHtXfSAke0h9YCkuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCBtZWV0Jyk7XG4gIHN2Zy5zZWxlY3RBbGwoJyonKS5yZW1vdmUoKTtcblxuICBjb25zdCBkZWZzID0gc3ZnLmFwcGVuZCgnZGVmcycpO1xuICBkZWZzLmFwcGVuZCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsICdmcmFtZS1jbGlwJykuYXBwZW5kKCdyZWN0JylcbiAgICAuYXR0cigneCcsIHgwKS5hdHRyKCd5JywgeTApLmF0dHIoJ3dpZHRoJywgeDEgLSB4MCkuYXR0cignaGVpZ2h0JywgeTEgLSB5MCk7XG5cbiAgY29uc3Qgcm9vdCA9IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzdGFnZScpO1xuICByb290LmFwcGVuZCgncmVjdCcpLmF0dHIoJ2NsYXNzJywgJ3BhcGVyJykuYXR0cignd2lkdGgnLCBXKS5hdHRyKCdoZWlnaHQnLCBIKTtcblxuICBjb25zdCBtYXAgPSByb290LmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ21hcCcpLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2ZyYW1lLWNsaXApJyk7XG4gIC8vIFRoZSBvY2VhbiBpcyB0aGUgZ2xvYmUgaXRzZWxmOyBhbnl0aGluZyBiZXlvbmQgaXRzIGVkZ2Ugc3RheXMgcGFwZXIuXG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdvY2VhbicpLmF0dHIoJ2QnLCBkKHsgdHlwZTogJ1NwaGVyZScgfSkpO1xuXG4gIC8vIEJhdGh5bWV0cnk6IGhhaXJsaW5lIGNvbnRvdXJzIGluIHRoZSBvY2VhbiB0b25lLlxuICBjb25zdCBiYXRoeSA9IGZlYXR1cmUobGF5ZXJzLmJhdGh5LCBsYXllcnMuYmF0aHkub2JqZWN0cy5iYXRoeW1ldHJ5KTtcbiAgbWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ2JhdGh5bWV0cnknKVxuICAgIC5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKGJhdGh5LmZlYXR1cmVzKS5qb2luKCdwYXRoJykuYXR0cignZCcsIGQpO1xuXG4gIC8vIExhbmQgYXQgcmVzdCAoY3JlYW0pLCB0aGVuIHJlbGllZiAocHJlLXJlbmRlcmVkIGZvciB0aGlzIHN0YWdlLCB3aGVuIHByZXNlbnQpLlxuICBjb25zdCBuZSA9IGxheWVycy5uZTtcbiAgY29uc3QgbGFuZCA9IGZlYXR1cmUobmUsIG5lLm9iamVjdHMubGFuZCk7XG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdsYW5kJykuYXR0cignZCcsIGQobGFuZCkpO1xuICBpZiAoc3RhZ2UucmVsaWVmKSB7XG4gICAgLy8gVGhlIHJlbGllZiByYXN0ZXIgY292ZXJzIHRoZSB3aG9sZSBmcmFtZTsgbWFzayBpdCB0byBsYW5kIHNvIHRoZSBvY2VhbiBzdGF5cyBmbGF0IHBhcGVyLlxuICAgIGRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpLmF0dHIoJ2lkJywgJ2xhbmQtY2xpcCcpLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCBkKGxhbmQpKTtcbiAgICBtYXAuYXBwZW5kKCdpbWFnZScpLmF0dHIoJ2NsYXNzJywgJ3JlbGllZicpXG4gICAgICAuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjbGFuZC1jbGlwKScpXG4gICAgICAuYXR0cigneCcsIHgwKS5hdHRyKCd5JywgeTApLmF0dHIoJ3dpZHRoJywgeDEgLSB4MCkuYXR0cignaGVpZ2h0JywgeTEgLSB5MClcbiAgICAgIC5hdHRyKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgJ25vbmUnKVxuICAgICAgLmF0dHIoJ2hyZWYnLCBhc3NldFVSTChgYXNzZXRzLyR7c3RhZ2UucmVsaWVmfWApKTtcbiAgfVxuXG4gIC8vIFBvbGl0aWVzIChmaWxsZWQgcGVyIHNuYXBzaG90KSBhbmQgdGhlaXIgaW50ZXJpb3IgYm9yZGVycy5cbiAgY29uc3QgcG9saXRpZXMgPSBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9saXRpZXMnKTtcbiAgY29uc3QgYm9yZGVycyA9IG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdib3JkZXJzJyk7XG5cbiAgLy8gV2F0ZXIgbGluZXMgYW5kIGNvYXN0LlxuICBjb25zdCByaXZlcnMgPSBmZWF0dXJlKG5lLCBuZS5vYmplY3RzLnJpdmVycyk7XG4gIG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdyaXZlcnMnKVxuICAgIC5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKHJpdmVycy5mZWF0dXJlcy5maWx0ZXIoKGYpID0+IChmLnByb3BlcnRpZXMuc2NhbGVyYW5rID8/IDApIDw9IDcpKS5qb2luKCdwYXRoJykuYXR0cignZCcsIGQpO1xuICBjb25zdCBsYWtlcyA9IGZlYXR1cmUobmUsIG5lLm9iamVjdHMubGFrZXMpO1xuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGFrZXMnKS5hdHRyKCdkJywgZChsYWtlcykpO1xuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnY29hc3RsaW5lJykuYXR0cignZCcsIGQoZmVhdHVyZShuZSwgbmUub2JqZWN0cy5jb2FzdGxpbmUpKSk7XG5cbiAgLy8gR3JhdGljdWxlOiBoYWlybGluZSBnb2xkLCBldmVyeSAxMFx1MDBCMC5cbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2dyYXRpY3VsZScpLmF0dHIoJ2QnLCBkKGQzLmdlb0dyYXRpY3VsZTEwKCkpKTtcblxuICAvLyBGcmFtZSByaW5nLlxuICByb290LmFwcGVuZCgncmVjdCcpLmF0dHIoJ2NsYXNzJywgJ2ZyYW1lJylcbiAgICAuYXR0cigneCcsIHgwKS5hdHRyKCd5JywgeTApLmF0dHIoJ3dpZHRoJywgeDEgLSB4MCkuYXR0cignaGVpZ2h0JywgeTEgLSB5MCk7XG5cbiAgbGV0IGN1cnJlbnRZZWFyID0gbnVsbDtcblxuICAvLyBjbGFzc2lmeShmZWF0dXJlLCB5ZWFyKSBcdTIxOTIgeyBzdGF0dXM6ICdoaWdobGlnaHQnIHwgJ211dGVkJywga2V5PywgbGFiZWw/IH1cbiAgZnVuY3Rpb24gc2hvd1NuYXBzaG90KHllYXIsIHRvcG8sIGNsYXNzaWZ5ID0gKCkgPT4gKHsgc3RhdHVzOiAnbXV0ZWQnIH0pKSB7XG4gICAgY29uc3QgZmMgPSBmZWF0dXJlKHRvcG8sIHRvcG8ub2JqZWN0cy5wb2xpdGllcyk7XG4gICAgY29uc3QgbmFtZWQgPSBmYy5mZWF0dXJlcy5maWx0ZXIoKGYpID0+IGYucHJvcGVydGllcy5pZCk7XG4gICAgZm9yIChjb25zdCBmIG9mIG5hbWVkKSBmLnByb3BlcnRpZXMuY2xzID0gY2xhc3NpZnkoZiwgeWVhcik7XG4gICAgcG9saXRpZXMuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAgIC5kYXRhKG5hbWVkLCAoZikgPT4gZi5wcm9wZXJ0aWVzLmlkKVxuICAgICAgLmpvaW4oJ3BhdGgnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgKGYpID0+IGBwb2xpdHkgJHtmLnByb3BlcnRpZXMuY2VydGFpbnR5fSAke2YucHJvcGVydGllcy5jbHMuc3RhdHVzfWApXG4gICAgICAuYXR0cignZCcsIGQpXG4gICAgICAuYXBwZW5kKCd0aXRsZScpLnRleHQoKGYpID0+IGYucHJvcGVydGllcy5jbHMubGFiZWwgPz8gZi5wcm9wZXJ0aWVzLm5hbWUpO1xuICAgIGNvbnN0IGludGVyaW9yID0gbWVzaCh0b3BvLCB0b3BvLm9iamVjdHMucG9saXRpZXMsIChhLCBiKSA9PiBhICE9PSBiKTtcbiAgICBjb25zdCBjZXJ0YWludHkgPSBuYW1lZFswXT8ucHJvcGVydGllcy5jZXJ0YWludHkgPz8gJ2FwcHJveGltYXRlJztcbiAgICBib3JkZXJzLnNlbGVjdEFsbCgncGF0aCcpLmRhdGEoW2ludGVyaW9yXSkuam9pbigncGF0aCcpXG4gICAgICAuYXR0cignY2xhc3MnLCBgYm9yZGVyICR7Y2VydGFpbnR5fWApXG4gICAgICAuYXR0cignZCcsIGQpO1xuICAgIGN1cnJlbnRZZWFyID0geWVhcjtcbiAgfVxuXG4gIHJldHVybiB7IHByb2plY3Rpb24sIHBhdGgsIGQsIHNob3dTbmFwc2hvdCwgaW5uZXIsIGdldCB5ZWFyKCkgeyByZXR1cm4gY3VycmVudFllYXI7IH0gfTtcbn1cbiIsICJ7XG4gIFwiaWRcIjogXCJhZnJvLWV1cmFzaWFcIixcbiAgXCJ0aXRsZVwiOiBcIkFmcm8tRXVyYXNpYVwiLFxuICBcInByb2plY3Rpb25cIjogXCJlcXVhbEVhcnRoXCIsXG4gIFwicm90YXRlXCI6IFstNjAsIDBdLFxuICBcImV4dGVudFwiOiB7IFwid2VzdFwiOiAtMjAsIFwic291dGhcIjogNiwgXCJlYXN0XCI6IDE1MCwgXCJub3J0aFwiOiA3NiB9LFxuICBcInNwYW5cIjogWzEyMDAsIDIwMDBdLFxuICBcInJlbGllZlwiOiBcInJlbGllZi9hZnJvLWV1cmFzaWEucG5nXCIsXG4gIFwibGFiZWxzXCI6IFtcbiAgICB7IFwidGV4dFwiOiBcIkV1cm9wZVwiLCBcImxvblwiOiAxNSwgXCJsYXRcIjogNTAsIFwia2luZFwiOiBcInJlZ2lvblwiIH0sXG4gICAgeyBcInRleHRcIjogXCJOb3J0aCBBZnJpY2FcIiwgXCJsb25cIjogMTAsIFwibGF0XCI6IDI3LCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiV2VzdCBBZnJpY2FcIiwgXCJsb25cIjogLTIsIFwibGF0XCI6IDEzLCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiTWlkZGxlIEVhc3RcIiwgXCJsb25cIjogNDQsIFwibGF0XCI6IDI5LCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiQ2VudHJhbCBBc2lhXCIsIFwibG9uXCI6IDY2LCBcImxhdFwiOiA0NCwgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIlNvdXRoIEFzaWFcIiwgXCJsb25cIjogNzgsIFwibGF0XCI6IDIyLCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiRWFzdCBBc2lhXCIsIFwibG9uXCI6IDExMiwgXCJsYXRcIjogMzYsIFwia2luZFwiOiBcInJlZ2lvblwiIH0sXG4gICAgeyBcInRleHRcIjogXCJTb3V0aGVhc3QgQXNpYVwiLCBcImxvblwiOiAxMDQsIFwibGF0XCI6IDEyLCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiU2liZXJpYVwiLCBcImxvblwiOiAxMDAsIFwibGF0XCI6IDY0LCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiTWVkaXRlcnJhbmVhbiBTZWFcIiwgXCJsb25cIjogMTcsIFwibGF0XCI6IDM1LjUsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkluZGlhbiBPY2VhblwiLCBcImxvblwiOiA3NSwgXCJsYXRcIjogNSwgXCJraW5kXCI6IFwid2F0ZXJcIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiQXJhYmlhbiBTZWFcIiwgXCJsb25cIjogNjMsIFwibGF0XCI6IDE1LCBcImtpbmRcIjogXCJ3YXRlclwiIH0sXG4gICAgeyBcInRleHRcIjogXCJCYXkgb2YgQmVuZ2FsXCIsIFwibG9uXCI6IDg4LCBcImxhdFwiOiAxMywgXCJraW5kXCI6IFwid2F0ZXJcIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiU291dGggQ2hpbmEgU2VhXCIsIFwibG9uXCI6IDExNCwgXCJsYXRcIjogMTUsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkJsYWNrIFNlYVwiLCBcImxvblwiOiAzNCwgXCJsYXRcIjogNDMuNSwgXCJraW5kXCI6IFwid2F0ZXJcIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiQ2FzcGlhbiBTZWFcIiwgXCJsb25cIjogNTAuNSwgXCJsYXRcIjogNDEuNSwgXCJraW5kXCI6IFwid2F0ZXJcIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiUmVkIFNlYVwiLCBcImxvblwiOiAzOCwgXCJsYXRcIjogMjAsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkF0bGFudGljIE9jZWFuXCIsIFwibG9uXCI6IC0xNCwgXCJsYXRcIjogMzgsIFwia2luZFwiOiBcIndhdGVyXCIgfVxuICBdXG59XG4iLCAie1xuICBcIl9jb21tZW50XCI6IFwiRXh0ZW50IHRyYWNrZXIgKHYwKS4gV2hpY2ggZG93bmxvYWRlZCBiYXNlIHBvbHlnb25zIGFyZSBoaWdobGlnaHRlZCwgYnkgdGhlIE5BTUUgdGhlIGJhc2UgbWFwIGdpdmVzIHRoZW0gaW4gZWFjaCBlcmEsIGJvdW5kZWQgYnkgc3RhcnQvZW5kIHllYXJzLiBUaGUgcG9seWdvbnMgdGhlbXNlbHZlcyBhcmUgbmV2ZXIgZWRpdGVkLiBSb3dzIGluIGRhdGEvcmVjb3Jkcy5jc3Ygd2l0aCB0cmFja2VyPWV4dGVudCBjYW4gYWRkIHRvIG9yIG92ZXJyaWRlIHRoaXMgbGlzdC5cIixcbiAgXCJmaWxsX2tleVwiOiBcIlBcIixcbiAgXCJoaWdobGlnaHRzXCI6IFtcbiAgICB7IFwiaWRcIjogXCJvdHRvbWFuXCIsIFwibGFiZWxcIjogXCJPdHRvbWFuIEVtcGlyZVwiLCBcInN0YXJ0XCI6IDEyOTksIFwiZW5kXCI6IDE5MjIsIFwibmFtZXNcIjogW1wiT3R0b21hbiBFbXBpcmVcIl0gfSxcbiAgICB7IFwiaWRcIjogXCJzYWZhdmlkXCIsIFwibGFiZWxcIjogXCJTYWZhdmlkIEVtcGlyZVwiLCBcInN0YXJ0XCI6IDE1MDEsIFwiZW5kXCI6IDE3MzYsIFwibmFtZXNcIjogW1wiU2FmYXZpZCBFbXBpcmVcIl0gfSxcbiAgICB7IFwiaWRcIjogXCJtdWdoYWxcIiwgXCJsYWJlbFwiOiBcIk11Z2hhbCBFbXBpcmVcIiwgXCJzdGFydFwiOiAxNTI2LCBcImVuZFwiOiAxODU3LCBcIm5hbWVzXCI6IFtcIk11Z2hhbCBFbXBpcmVcIl0gfSxcbiAgICB7IFwiaWRcIjogXCJtaW5nXCIsIFwibGFiZWxcIjogXCJNaW5nIENoaW5hXCIsIFwic3RhcnRcIjogMTM2OCwgXCJlbmRcIjogMTY0NCwgXCJuYW1lc1wiOiBbXCJNaW5nIEVtcGlyZVwiLCBcIk1pbmcgQ2hpbmVzZSBFbXBpcmVcIl0gfSxcbiAgICB7IFwiaWRcIjogXCJxaW5nXCIsIFwibGFiZWxcIjogXCJRaW5nIENoaW5hXCIsIFwic3RhcnRcIjogMTY0NCwgXCJlbmRcIjogMTkxMiwgXCJuYW1lc1wiOiBbXCJNYW5jaHUgRW1waXJlXCIsIFwiUWluZyBFbXBpcmVcIiwgXCJRaW5nIER5bmFzdHlcIl0gfSxcbiAgICB7IFwiaWRcIjogXCJzb25naGFpXCIsIFwibGFiZWxcIjogXCJTb25naGFpIEVtcGlyZVwiLCBcInN0YXJ0XCI6IDE0NjQsIFwiZW5kXCI6IDE1OTEsIFwibmFtZXNcIjogW1wiU29uZ2hhaVwiLCBcIlNvbmdoYWkgRW1waXJlXCJdIH0sXG4gICAgeyBcImlkXCI6IFwibW9yb2Njb1wiLCBcImxhYmVsXCI6IFwiTW9yb2Njb1wiLCBcInN0YXJ0XCI6IDE0NTAsIFwiZW5kXCI6IDIwMDAsIFwibmFtZXNcIjogW1wiTW9yb2Njb1wiLCBcIldhdHRhc2lkIENhbGlwaGF0ZVwiLCBcIldhdGFzc2lkIE1vcm9jY29cIiwgXCJTYWFkaSBNb3JvY2NvXCIsIFwiU2FhZGkgU3VsdGFuYXRlXCIsIFwiQWxhb3VpdGUgTW9yb2Njb1wiXSB9LFxuICAgIHsgXCJpZFwiOiBcInJ1c3NpYVwiLCBcImxhYmVsXCI6IFwiUnVzc2lhXCIsIFwic3RhcnRcIjogMTQ1MCwgXCJlbmRcIjogMjAwMCwgXCJuYW1lc1wiOiBbXCJHcmFuZCBEdWNoeSBvZiBNb3Njb3dcIiwgXCJUc2FyZG9tIG9mIE11c2NvdnlcIiwgXCJUc2FyZG9tIG9mIFJ1c3NpYVwiLCBcIlJ1c3NpYW4gRW1waXJlXCIsIFwiUnVzc2lhXCJdIH0sXG4gICAgeyBcImlkXCI6IFwidG9rdWdhd2FcIiwgXCJsYWJlbFwiOiBcIlRva3VnYXdhIEphcGFuXCIsIFwic3RhcnRcIjogMTYwMywgXCJlbmRcIjogMTg2OCwgXCJuYW1lc1wiOiBbXCJUb2t1Z2F3YSBzaG9ndW5hdGVcIiwgXCJUb2t1Z2F3YSBTaG9ndW5hdGVcIl0gfVxuICBdXG59XG4iLCAiLy8gUGFyY2htZW50IFx1MjAxNCBlbnRyeSBwb2ludFxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IHsgbG9hZEpTT04gfSBmcm9tICcuL2RhdGEvbG9hZGVyLmpzJztcbmltcG9ydCB7IGNyZWF0ZVN0YWdlIH0gZnJvbSAnLi9yZW5kZXIvYmFzZS5qcyc7XG5pbXBvcnQgc3RhZ2UgZnJvbSAnLi9zdGFnZXMvYWZyby1ldXJhc2lhLmpzb24nO1xuaW1wb3J0IGV4dGVudCBmcm9tICcuL3RyYWNrZXJzL2V4dGVudC5qc29uJztcblxuY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpO1xuY29uc3QgU1RBUlRfWUVBUiA9IE51bWJlcihwYXJhbXMuZ2V0KCd5ZWFyJykpIHx8IDE0NTA7XG5cbi8vIEV4dGVudCB0cmFja2VyOiBhIGJhc2UgcG9seWdvbiBpcyBoaWdobGlnaHRlZCB3aGVuIGl0cyBOQU1FIG1hdGNoZXMgYSBoaWdobGlnaHQgZW50cnkgYWxpdmUgaW4gdGhhdCB5ZWFyLlxuY29uc3QgYnlOYW1lID0gbmV3IE1hcCgpO1xuZm9yIChjb25zdCBoIG9mIGV4dGVudC5oaWdobGlnaHRzKSBmb3IgKGNvbnN0IG4gb2YgaC5uYW1lcykgYnlOYW1lLnNldChuLCBoKTtcbmZ1bmN0aW9uIGNsYXNzaWZ5RXh0ZW50KGYsIHllYXIpIHtcbiAgY29uc3QgaCA9IGJ5TmFtZS5nZXQoZi5wcm9wZXJ0aWVzLm5hbWUpO1xuICBpZiAoaCAmJiB5ZWFyID49IGguc3RhcnQgJiYgeWVhciA8PSBoLmVuZCkgcmV0dXJuIHsgc3RhdHVzOiAnaGlnaGxpZ2h0Jywga2V5OiBoLmlkLCBsYWJlbDogaC5sYWJlbCB9O1xuICByZXR1cm4geyBzdGF0dXM6ICdtdXRlZCcgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgY29uc3QgdDAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgY29uc3QgW2NhbGVuZGFyLCBuZSwgYmF0aHldID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIGxvYWRKU09OKCdkYXRhL2NhbGVuZGFyLmpzb24nKSxcbiAgICBsb2FkSlNPTignZGF0YS9iYXNlL2Rlcml2ZWQvbmUudG9wb2pzb24nKSxcbiAgICBsb2FkSlNPTignZGF0YS9iYXNlL2Rlcml2ZWQvYmF0aHltZXRyeS50b3BvanNvbicpLFxuICBdKTtcbiAgY29uc3QgeWVhcnMgPSBjYWxlbmRhci5zbmFwc2hvdHMubWFwKChzKSA9PiBzLnllYXIpO1xuICBjb25zdCBieVNuYXBzaG90ID0gbmV3IE1hcChjYWxlbmRhci5zbmFwc2hvdHMubWFwKChzKSA9PiBbcy55ZWFyLCBzXSkpO1xuXG4gIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdCgnI21hcCcpO1xuICBjb25zdCBhdGxhcyA9IGNyZWF0ZVN0YWdlKHN2Zywgc3RhZ2UsIHsgbmUsIGJhdGh5IH0pO1xuICBjb25zb2xlLmxvZyhgc3RhZ2UgYnVpbHQgaW4gJHsocGVyZm9ybWFuY2Uubm93KCkgLSB0MCkudG9GaXhlZCgwKX0gbXNgKTtcblxuICBjb25zdCBzbmFwc2hvdCA9ICh5ZWFyKSA9PiBsb2FkSlNPTihgZGF0YS9iYXNlL2Rlcml2ZWQvd29ybGRfJHt5ZWFyfS50b3BvanNvbmApO1xuXG4gIGxldCBjdXJyZW50ID0gbnVsbDtcbiAgYXN5bmMgZnVuY3Rpb24gc2hvdyh5ZWFyKSB7XG4gICAgaWYgKCF5ZWFycy5pbmNsdWRlcyh5ZWFyKSkgcmV0dXJuO1xuICAgIGNvbnN0IHRvcG8gPSBhd2FpdCBzbmFwc2hvdCh5ZWFyKTtcbiAgICBjb25zdCB0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgYXRsYXMuc2hvd1NuYXBzaG90KHllYXIsIHRvcG8sIGNsYXNzaWZ5RXh0ZW50KTtcbiAgICBjdXJyZW50ID0geWVhcjtcbiAgICBjb25zdCBtZXRhID0gYnlTbmFwc2hvdC5nZXQoeWVhcik7XG4gICAgZG9jdW1lbnQudGl0bGUgPSBgUGFyY2htZW50IFx1MDBCNyAke3llYXJ9YDtcbiAgICBkMy5zZWxlY3QoJyN5ZWFyLXJlYWRvdXQnKS50ZXh0KG1ldGEuc291cmNlX3llYXIgIT09IHllYXIgPyBgJHt5ZWFyfSBcdTAwQjcgYmFzZSBtYXAgJHttZXRhLnNvdXJjZV95ZWFyfWAgOiBgJHt5ZWFyfWApO1xuICAgIGQzLnNlbGVjdEFsbCgnI3llYXJzIGJ1dHRvbicpLmNsYXNzZWQoJ2FjdGl2ZScsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIE51bWJlcih0aGlzLmRhdGFzZXQueWVhcikgPT09IHllYXI7IH0pO1xuICAgIGNvbnNvbGUubG9nKGBzbmFwc2hvdCAke3llYXJ9OiAkeyhwZXJmb3JtYW5jZS5ub3coKSAtIHQpLnRvRml4ZWQoMSl9IG1zYCk7XG4gIH1cblxuICAvLyBZZWFyIGJ1dHRvbnMuXG4gIGQzLnNlbGVjdCgnI3llYXJzJykuc2VsZWN0QWxsKCdidXR0b24nKS5kYXRhKHllYXJzKS5qb2luKCdidXR0b24nKVxuICAgIC5hdHRyKCdkYXRhLXllYXInLCAoeSkgPT4geSkudGV4dCgoeSkgPT4geSlcbiAgICAub24oJ2NsaWNrJywgKF8sIHkpID0+IHNob3coeSkpO1xuXG4gIC8vIEtleWJvYXJkOiBcdTIxOTAgXHUyMTkyIHN0ZXAgdGhyb3VnaCB0aGUgY2FsZW5kYXIuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICBjb25zdCBpID0geWVhcnMuaW5kZXhPZihjdXJyZW50KTtcbiAgICBpZiAoZS5rZXkgPT09ICdBcnJvd1JpZ2h0Jykgc2hvdyh5ZWFyc1tNYXRoLm1pbihpICsgMSwgeWVhcnMubGVuZ3RoIC0gMSldKTtcbiAgICBpZiAoZS5rZXkgPT09ICdBcnJvd0xlZnQnKSBzaG93KHllYXJzW01hdGgubWF4KGkgLSAxLCAwKV0pO1xuICB9KTtcblxuICBhd2FpdCBzaG93KFNUQVJUX1lFQVIpO1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3JlYWR5Jyk7XG4gIC8vIFByZWZldGNoIHRoZSByZXN0IHNvIHN3aXRjaGluZyBpcyBpbnN0YW50LlxuICBmb3IgKGNvbnN0IHkgb2YgeWVhcnMpIHNuYXBzaG90KHkpO1xufVxuXG5tYWluKCkuY2F0Y2goKGVycikgPT4ge1xuICBjb25zb2xlLmVycm9yKGVycik7XG4gIGQzLnNlbGVjdCgnI3Byb2JsZW1zJykuY2xhc3NlZCgnaGlkZGVuJywgZmFsc2UpLnRleHQoYFBhcmNobWVudCBjb3VsZCBub3Qgc3RhcnQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBQ08sTUFBTSxRQUFOLE1BQVk7QUFBQSxJQUNqQixjQUFjO0FBQ1osV0FBSyxZQUFZLElBQUksYUFBYSxFQUFFO0FBQ3BDLFdBQUssS0FBSztBQUFBLElBQ1o7QUFBQSxJQUNBLElBQUksR0FBRztBQUNMLFlBQU0sSUFBSSxLQUFLO0FBQ2YsVUFBSSxJQUFJO0FBQ1IsZUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUs7QUFDMUMsY0FBTSxJQUFJLEVBQUUsQ0FBQyxHQUNYLEtBQUssSUFBSSxHQUNULEtBQUssS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSztBQUM1RCxZQUFJLEdBQUksR0FBRSxHQUFHLElBQUk7QUFDakIsWUFBSTtBQUFBLE1BQ047QUFDQSxRQUFFLENBQUMsSUFBSTtBQUNQLFdBQUssS0FBSyxJQUFJO0FBQ2QsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLFVBQVU7QUFDUixZQUFNLElBQUksS0FBSztBQUNmLFVBQUksSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLElBQUksS0FBSztBQUNoQyxVQUFJLElBQUksR0FBRztBQUNULGFBQUssRUFBRSxFQUFFLENBQUM7QUFDVixlQUFPLElBQUksR0FBRztBQUNaLGNBQUk7QUFDSixjQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ1QsZUFBSyxJQUFJO0FBQ1QsZUFBSyxLQUFLLEtBQUs7QUFDZixjQUFJLEdBQUk7QUFBQSxRQUNWO0FBQ0EsWUFBSSxJQUFJLE1BQU8sS0FBSyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBTyxLQUFLLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFLO0FBQ25FLGNB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VixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixXQUFXO0FBQUEsSUFDWCxVQUFVO0FBQUEsSUFDVixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixnQkFBZ0I7QUFBQSxJQUNoQixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxZQUFZO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCxlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEsSUFDZixXQUFXO0FBQUEsSUFDWCxjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxzQkFBc0I7QUFBQSxJQUN0QixXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsSUFDZixjQUFjO0FBQUEsSUFDZCxnQkFBZ0I7QUFBQSxJQUNoQixnQkFBZ0I7QUFBQSxJQUNoQixnQkFBZ0I7QUFBQSxJQUNoQixhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixrQkFBa0I7QUFBQSxJQUNsQixZQUFZO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCxjQUFjO0FBQUEsSUFDZCxnQkFBZ0I7QUFBQSxJQUNoQixpQkFBaUI7QUFBQSxJQUNqQixtQkFBbUI7QUFBQSxJQUNuQixpQkFBaUI7QUFBQSxJQUNqQixpQkFBaUI7QUFBQSxJQUNqQixjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsSUFDZixZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixLQUFLO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxZQUFZO0FBQUEsSUFDWixRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZjtBQUVBLGlCQUFPLE9BQU8sT0FBTztBQUFBLElBQ25CLEtBQUssVUFBVTtBQUNiLGFBQU8sT0FBTyxPQUFPLElBQUksS0FBSyxlQUFhLE1BQU0sUUFBUTtBQUFBLElBQzNEO0FBQUEsSUFDQSxjQUFjO0FBQ1osYUFBTyxLQUFLLElBQUksRUFBRSxZQUFZO0FBQUEsSUFDaEM7QUFBQSxJQUNBLEtBQUs7QUFBQTtBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLEVBQ1osQ0FBQztBQUVELFdBQVMsa0JBQWtCO0FBQ3pCLFdBQU8sS0FBSyxJQUFJLEVBQUUsVUFBVTtBQUFBLEVBQzlCO0FBRUEsV0FBUyxtQkFBbUI7QUFDMUIsV0FBTyxLQUFLLElBQUksRUFBRSxXQUFXO0FBQUEsRUFDL0I7QUFFQSxXQUFTLGtCQUFrQjtBQUN6QixXQUFPLFdBQVcsSUFBSSxFQUFFLFVBQVU7QUFBQSxFQUNwQztBQUVBLFdBQVMsa0JBQWtCO0FBQ3pCLFdBQU8sS0FBSyxJQUFJLEVBQUUsVUFBVTtBQUFBLEVBQzlCO0FBRWUsV0FBUixNQUF1QixRQUFRO0FBQ3BDLFFBQUksR0FBRztBQUNQLGNBQVUsU0FBUyxJQUFJLEtBQUssRUFBRSxZQUFZO0FBQzFDLFlBQVEsSUFBSSxNQUFNLEtBQUssTUFBTSxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUUsUUFBUSxJQUFJLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFDdEYsTUFBTSxJQUFJLElBQUksSUFBSyxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxJQUFJLE1BQVMsSUFBSSxPQUFRLElBQU0sSUFBSSxJQUFNLENBQUMsSUFDaEgsTUFBTSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQU0sS0FBSyxLQUFLLEtBQU0sS0FBSyxJQUFJLE1BQU8sSUFBSSxPQUFRLEdBQUksSUFDL0UsTUFBTSxJQUFJLEtBQU0sS0FBSyxLQUFLLEtBQVEsS0FBSyxJQUFJLEtBQVEsS0FBSyxJQUFJLEtBQVEsS0FBSyxJQUFJLEtBQVEsS0FBSyxJQUFJLEtBQVEsSUFBSSxPQUFVLElBQUksT0FBUSxJQUFNLElBQUksTUFBUSxHQUFJLElBQ3RKLFNBQ0MsSUFBSSxhQUFhLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQzVELElBQUksYUFBYSxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksTUFBTSxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BQU0sS0FBSyxFQUFFLENBQUMsSUFBSSxNQUFNLEtBQUssQ0FBQyxLQUNoRyxJQUFJLGNBQWMsS0FBSyxNQUFNLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUM3RCxJQUFJLGNBQWMsS0FBSyxNQUFNLEtBQUssS0FBSyxFQUFFLENBQUMsSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLElBQUksTUFBTSxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BQU0sS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUNqRyxJQUFJLGFBQWEsS0FBSyxNQUFNLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUNyRSxJQUFJLGNBQWMsS0FBSyxNQUFNLEtBQUssS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsSUFDMUUsTUFBTSxlQUFlLE1BQU0sSUFBSSxLQUFLLE1B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ImRhdHVtIiwgInNlbGVjdGlvbiIsICJtZXJnZSIsICJjcmVhdGUiLCAiY3JlYXRlIiwgInBhcnNlVHlwZW5hbWVzIiwgInR5cGUiLCAicGFyYW1zIiwgIndpbmRvdyIsICJkaXNwYXRjaF9kZWZhdWx0IiwgImRpc3BhdGNoX2RlZmF1bHQiLCAic2VsZWN0X2RlZmF1bHQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAibWluIiwgIm1heCIsICJjb25zdGFudF9kZWZhdWx0IiwgImNvbnN0YW50X2RlZmF1bHQiLCAiY29sb3IiLCAicmdiIiwgInN0YXJ0IiwgImkiLCAibm93IiwgImlkIiwgImdldCIsICJzZXQiLCAic3RhcnQiLCAiZW1wdHkiLCAiaW50ZXJydXB0X2RlZmF1bHQiLCAiaWQiLCAic2V0IiwgImdldCIsICJ0cmFuc2l0aW9uIiwgImF0dHJSZW1vdmUiLCAiYXR0clJlbW92ZU5TIiwgImF0dHJDb25zdGFudCIsICJhdHRyQ29uc3RhbnROUyIsICJhdHRyRnVuY3Rpb24iLCAiYXR0ckZ1bmN0aW9uTlMiLCAiYXR0cl9kZWZhdWx0IiwgImlkIiwgImdldCIsICJpZCIsICJzZXQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImZpbHRlcl9kZWZhdWx0IiwgIm1lcmdlX2RlZmF1bHQiLCAidHJhbnNpdGlvbiIsICJtZXJnZSIsICJpZCIsICJzZXQiLCAib25fZGVmYXVsdCIsICJnZXQiLCAiaWQiLCAicmVtb3ZlX2RlZmF1bHQiLCAic2VsZWN0X2RlZmF1bHQiLCAiaWQiLCAiZ2V0IiwgInNlbGVjdEFsbF9kZWZhdWx0IiwgImlkIiwgImNoaWxkcmVuIiwgImluaGVyaXQiLCAiZ2V0IiwgIlNlbGVjdGlvbiIsICJzZWxlY3Rpb25fZGVmYXVsdCIsICJzdHlsZVJlbW92ZSIsICJzdHlsZUNvbnN0YW50IiwgInN0eWxlRnVuY3Rpb24iLCAiaWQiLCAicmVtb3ZlIiwgInNldCIsICJzdHlsZV9kZWZhdWx0IiwgInRleHRDb25zdGFudCIsICJ0ZXh0RnVuY3Rpb24iLCAidGV4dF9kZWZhdWx0IiwgImluaGVyaXQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJpZCIsICJzZWxlY3RfZGVmYXVsdCIsICJzZWxlY3RBbGxfZGVmYXVsdCIsICJmaWx0ZXJfZGVmYXVsdCIsICJtZXJnZV9kZWZhdWx0IiwgInNlbGVjdGlvbl9kZWZhdWx0IiwgIm9uX2RlZmF1bHQiLCAiYXR0cl9kZWZhdWx0IiwgInN0eWxlX2RlZmF1bHQiLCAidGV4dF9kZWZhdWx0IiwgInJlbW92ZV9kZWZhdWx0IiwgImlkIiwgInRyYW5zaXRpb25fZGVmYXVsdCIsICJpbnRlcnJ1cHRfZGVmYXVsdCIsICJ0cmFuc2l0aW9uX2RlZmF1bHQiLCAiZGVncmVlcyIsICJhYnMiLCAibm9vcCIsICJvYmplY3QiLCAiY2FydGVzaWFuIiwgInNwaGVyaWNhbCIsICJhYnMiLCAibm9vcCIsICJhYnMiLCAiY29tcGFyZUludGVyc2VjdGlvbiIsICJuIiwgInN0YXJ0IiwgImFycmF5IiwgImFicyIsICJzaWduIiwgInN0YXJ0IiwgInBvaW50IiwgImFicyIsICJhYnMiLCAiZGVsdGEiLCAiY29kZSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJhYnMiLCAiY29tcGFyZUludGVyc2VjdGlvbiIsICJyaW5nIiwgInBvaW50IiwgInZpc2libGUiLCAieTAiLCAieTEiLCAieSIsICJ4MCIsICJ4MSIsICJ4IiwgIlgxIiwgIlgwIiwgIlkxIiwgIlkwIiwgIlgiLCAiWSIsICJncmF0aWN1bGUiLCAiYWJzIiwgIm5vb3AiLCAiYWJzIiwgIngwIiwgInkwIiwgIm5vb3AiLCAieDAwIiwgInkwMCIsICJ4MCIsICJ5MCIsICJub29wIiwgIngwMCIsICJ5MDAiLCAieDAiLCAieTAiLCAibm9vcCIsICJhcHBlbmQiLCAicHJvamVjdGlvbiIsICJvYmplY3QiLCAicHJvamVjdGlvbiIsICJvYmplY3QiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiYWJzIiwgIngwMCIsICJ5MDAiLCAidHJhbnNmb3JtIiwgIngwIiwgInkwIiwgIngxIiwgInkxIiwgImNhY2hlIiwgInByb2plY3Rpb24iLCAiZGVncmVlcyIsICJvYmplY3QiLCAiZGVncmVlcyIsICJ5MCIsICJ5MSIsICJhYnMiLCAiY2FjaGUiLCAib2JqZWN0IiwgImFicyIsICJsb2NhdGlvbiIsICJpZGVudGl0eSIsICJpZGVudGl0eV9kZWZhdWx0IiwgInRyYW5zZm9ybSIsICJpZGVudGl0eV9kZWZhdWx0IiwgIngwIiwgInkwIiwgImFycmF5IiwgIm8iLCAiaWQiLCAiYXJjcyIsICJ0eXBlIiwgInN0YXJ0IiwgImZyYWdtZW50QnlFbmQiLCAiZnJhZ21lbnRCeVN0YXJ0IiwgIm9iamVjdCIsICJmaWx0ZXIiLCAiYXJjcyIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJwcm9qZWN0aW9uIiwgImNhY2hlIiwgInJvb3QiLCAibmFtZWQiLCAic2VsZWN0X2RlZmF1bHQiLCAic2VsZWN0QWxsX2RlZmF1bHQiXQp9Cg==
