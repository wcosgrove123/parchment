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
  function makeProjection(stage2, inner) {
    const make = PROJECTIONS[stage2.projection];
    if (!make) throw new Error(`Unknown projection ${stage2.projection}`);
    const proj = make();
    if (stage2.rotate && proj.rotate) proj.rotate(stage2.rotate);
    proj.fitExtent(inner, extentPolygon(stage2.extent));
    return proj;
  }
  function createStage(svg, stage2, layers) {
    const inner = [[FRAME.left, FRAME.top], [W - FRAME.right, H - FRAME.bottom]];
    const [[x05, y05], [x12, y12]] = inner;
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
    if (stage2.relief) {
      defs.append("clipPath").attr("id", "land-clip").append("path").attr("d", d(land));
      map.append("image").attr("class", "relief").attr("clip-path", "url(#land-clip)").attr("x", x05).attr("y", y05).attr("width", x12 - x05).attr("height", y12 - y05).attr("preserveAspectRatio", "none").attr("href", assetURL(`assets/${stage2.relief}`));
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
    const atlas = createStage(svg, stage, { ne, bathy });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9mc3VtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWVyZ2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9yYW5nZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvc3JjL2Rpc3BhdGNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZXMuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NyZWF0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9hcnJheS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0QWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL21hdGNoZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RDaGlsZHJlbi5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZmlsdGVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VudGVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NvbnN0YW50LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9leGl0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9qb2luLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb3JkZXIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NvcnQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL25vZGVzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2RlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lbXB0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZWFjaC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy93aW5kb3cuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3N0eWxlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2xhc3NlZC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vdGV4dC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmFpc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2xvd2VyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2luc2VydC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmVtb3ZlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZGF0dW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL29uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaXRlcmF0b3IuanMiLCAibm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsICJub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RBbGwuanMiLCAibm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9kZWZpbmUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9jb2xvci5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2Jhc2lzLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXNDbG9zZWQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jb25zdGFudC5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbG9yLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcmdiLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2RlY29tcG9zZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9wYXJzZS5qcyIsICJub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZW91dC5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvaW50ZXJydXB0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vaW50ZXJydXB0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ludGVycG9sYXRlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2F0dHIuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2RlbGF5LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2R1cmF0aW9uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZVZhcnlpbmcuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZmlsdGVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL29uLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3JlbW92ZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc2VsZWN0QWxsLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdGlvbi5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZVR3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RyYW5zaXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZW5kLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1lYXNlL3NyYy9jdWJpYy5qcyIsICJub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL3RyYW5zaXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtYnJ1c2gvc3JjL2JydXNoLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL21hdGguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvbm9vcC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9zdHJlYW0uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2FydGVzaWFuLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NvbXBvc2UuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcm90YXRpb24uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2lyY2xlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvYnVmZmVyLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BvaW50RXF1YWwuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9yZWpvaW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcG9seWdvbkNvbnRhaW5zLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9hbnRpbWVyaWRpYW4uanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9jaXJjbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvY2xpcC9saW5lLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2NsaXAvcmVjdGFuZ2xlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL2dyYXRpY3VsZS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9pZGVudGl0eS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2FyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9ib3VuZHMuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9jZW50cm9pZC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wYXRoL2NvbnRleHQuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcGF0aC9tZWFzdXJlLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvc3RyaW5nLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3BhdGgvaW5kZXguanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vZml0LmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vcmVzYW1wbGUuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9pbmRleC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2NvbmljLmpzIiwgIm5vZGVfbW9kdWxlcy9kMy1nZW8vc3JjL3Byb2plY3Rpb24vY3lsaW5kcmljYWxFcXVhbEFyZWEuanMiLCAibm9kZV9tb2R1bGVzL2QzLWdlby9zcmMvcHJvamVjdGlvbi9jb25pY0VxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVycy5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2FsYmVyc1VzYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbC5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2F6aW11dGhhbEVxdWFsQXJlYS5qcyIsICJub2RlX21vZHVsZXMvZDMtZ2VvL3NyYy9wcm9qZWN0aW9uL2VxdWFsRWFydGguanMiLCAibm9kZV9tb2R1bGVzL2QzLXpvb20vc3JjL3RyYW5zZm9ybS5qcyIsICJzcmMvZGF0YS9sb2FkZXIuanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvaWRlbnRpdHkuanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvdHJhbnNmb3JtLmpzIiwgIm5vZGVfbW9kdWxlcy90b3BvanNvbi1jbGllbnQvc3JjL3JldmVyc2UuanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvZmVhdHVyZS5qcyIsICJub2RlX21vZHVsZXMvdG9wb2pzb24tY2xpZW50L3NyYy9zdGl0Y2guanMiLCAibm9kZV9tb2R1bGVzL3RvcG9qc29uLWNsaWVudC9zcmMvbWVzaC5qcyIsICJzcmMvcmVuZGVyL2Jhc2UuanMiLCAic3JjL3N0YWdlcy9hZnJvLWV1cmFzaWEuanNvbiIsICJzcmMvc3RhZ2VzL2Fmcm8tZXVyYXNpYS1sYW1iZXJ0Lmpzb24iLCAic3JjL3RyYWNrZXJzL2V4dGVudC5qc29uIiwgInNyYy9tYWluLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBodHRwczovL2dpdGh1Yi5jb20vcHl0aG9uL2NweXRob24vYmxvYi9hNzRlZWEyMzhmNWJhYmExNTc5N2UyZThiNTcwZDE1M2JjODY5MGE3L01vZHVsZXMvbWF0aG1vZHVsZS5jI0wxNDIzXG5leHBvcnQgY2xhc3MgQWRkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wYXJ0aWFscyA9IG5ldyBGbG9hdDY0QXJyYXkoMzIpO1xuICAgIHRoaXMuX24gPSAwO1xuICB9XG4gIGFkZCh4KSB7XG4gICAgY29uc3QgcCA9IHRoaXMuX3BhcnRpYWxzO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuX24gJiYgaiA8IDMyOyBqKyspIHtcbiAgICAgIGNvbnN0IHkgPSBwW2pdLFxuICAgICAgICBoaSA9IHggKyB5LFxuICAgICAgICBsbyA9IE1hdGguYWJzKHgpIDwgTWF0aC5hYnMoeSkgPyB4IC0gKGhpIC0geSkgOiB5IC0gKGhpIC0geCk7XG4gICAgICBpZiAobG8pIHBbaSsrXSA9IGxvO1xuICAgICAgeCA9IGhpO1xuICAgIH1cbiAgICBwW2ldID0geDtcbiAgICB0aGlzLl9uID0gaSArIDE7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFsdWVPZigpIHtcbiAgICBjb25zdCBwID0gdGhpcy5fcGFydGlhbHM7XG4gICAgbGV0IG4gPSB0aGlzLl9uLCB4LCB5LCBsbywgaGkgPSAwO1xuICAgIGlmIChuID4gMCkge1xuICAgICAgaGkgPSBwWy0tbl07XG4gICAgICB3aGlsZSAobiA+IDApIHtcbiAgICAgICAgeCA9IGhpO1xuICAgICAgICB5ID0gcFstLW5dO1xuICAgICAgICBoaSA9IHggKyB5O1xuICAgICAgICBsbyA9IHkgLSAoaGkgLSB4KTtcbiAgICAgICAgaWYgKGxvKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChuID4gMCAmJiAoKGxvIDwgMCAmJiBwW24gLSAxXSA8IDApIHx8IChsbyA+IDAgJiYgcFtuIC0gMV0gPiAwKSkpIHtcbiAgICAgICAgeSA9IGxvICogMjtcbiAgICAgICAgeCA9IGhpICsgeTtcbiAgICAgICAgaWYgKHkgPT0geCAtIGhpKSBoaSA9IHg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoaTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZnN1bSh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgY29uc3QgYWRkZXIgPSBuZXcgQWRkZXIoKTtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlID0gK3ZhbHVlKSB7XG4gICAgICAgIGFkZGVyLmFkZCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlID0gK3ZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpIHtcbiAgICAgICAgYWRkZXIuYWRkKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuICthZGRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZjdW1zdW0odmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGNvbnN0IGFkZGVyID0gbmV3IEFkZGVyKCk7XG4gIGxldCBpbmRleCA9IC0xO1xuICByZXR1cm4gRmxvYXQ2NEFycmF5LmZyb20odmFsdWVzLCB2YWx1ZW9mID09PSB1bmRlZmluZWRcbiAgICAgID8gdiA9PiBhZGRlci5hZGQoK3YgfHwgMClcbiAgICAgIDogdiA9PiBhZGRlci5hZGQoK3ZhbHVlb2YodiwgKytpbmRleCwgdmFsdWVzKSB8fCAwKVxuICApO1xufVxuIiwgImZ1bmN0aW9uKiBmbGF0dGVuKGFycmF5cykge1xuICBmb3IgKGNvbnN0IGFycmF5IG9mIGFycmF5cykge1xuICAgIHlpZWxkKiBhcnJheTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZShhcnJheXMpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oZmxhdHRlbihhcnJheXMpKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5nZShzdGFydCwgc3RvcCwgc3RlcCkge1xuICBzdGFydCA9ICtzdGFydCwgc3RvcCA9ICtzdG9wLCBzdGVwID0gKG4gPSBhcmd1bWVudHMubGVuZ3RoKSA8IDIgPyAoc3RvcCA9IHN0YXJ0LCBzdGFydCA9IDAsIDEpIDogbiA8IDMgPyAxIDogK3N0ZXA7XG5cbiAgdmFyIGkgPSAtMSxcbiAgICAgIG4gPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSkgfCAwLFxuICAgICAgcmFuZ2UgPSBuZXcgQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICByYW5nZVtpXSA9IHN0YXJ0ICsgaSAqIHN0ZXA7XG4gIH1cblxuICByZXR1cm4gcmFuZ2U7XG59XG4iLCAidmFyIG5vb3AgPSB7dmFsdWU6ICgpID0+IHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pIHx8IC9bXFxzLl0vLnRlc3QodCkpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGlzcGF0Y2g7XG4iLCAiZXhwb3J0IHZhciB4aHRtbCA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICB4aHRtbDogeGh0bWwsXG4gIHhsaW5rOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgeG1sOiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiLFxuICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiXG59O1xuIiwgImltcG9ydCBuYW1lc3BhY2VzIGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgcHJlZml4ID0gbmFtZSArPSBcIlwiLCBpID0gcHJlZml4LmluZGV4T2YoXCI6XCIpO1xuICBpZiAoaSA+PSAwICYmIChwcmVmaXggPSBuYW1lLnNsaWNlKDAsIGkpKSAhPT0gXCJ4bWxuc1wiKSBuYW1lID0gbmFtZS5zbGljZShpICsgMSk7XG4gIHJldHVybiBuYW1lc3BhY2VzLmhhc093blByb3BlcnR5KHByZWZpeCkgPyB7c3BhY2U6IG5hbWVzcGFjZXNbcHJlZml4XSwgbG9jYWw6IG5hbWV9IDogbmFtZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbn1cbiIsICJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuL25hbWVzcGFjZS5qc1wiO1xuaW1wb3J0IHt4aHRtbH0gZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5mdW5jdGlvbiBjcmVhdG9ySW5oZXJpdChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jdW1lbnQgPSB0aGlzLm93bmVyRG9jdW1lbnQsXG4gICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgIHJldHVybiB1cmkgPT09IHhodG1sICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHhodG1sXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdG9yRml4ZWQoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gKGZ1bGxuYW1lLmxvY2FsXG4gICAgICA/IGNyZWF0b3JGaXhlZFxuICAgICAgOiBjcmVhdG9ySW5oZXJpdCkoZnVsbG5hbWUpO1xufVxuIiwgImZ1bmN0aW9uIG5vbmUoKSB7fVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IG5vbmUgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi4vc2VsZWN0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiLy8gR2l2ZW4gc29tZXRoaW5nIGFycmF5IGxpa2UgKG9yIG51bGwpLCByZXR1cm5zIHNvbWV0aGluZyB0aGF0IGlzIHN0cmljdGx5IGFuXG4vLyBhcnJheS4gVGhpcyBpcyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFycmF5LWxpa2Ugb2JqZWN0cyBwYXNzZWQgdG8gZDMuc2VsZWN0QWxsXG4vLyBvciBzZWxlY3Rpb24uc2VsZWN0QWxsIGFyZSBjb252ZXJ0ZWQgaW50byBwcm9wZXIgYXJyYXlzIHdoZW4gY3JlYXRpbmcgYVxuLy8gc2VsZWN0aW9uOyB3ZSBkb25cdTIwMTl0IGV2ZXIgd2FudCB0byBjcmVhdGUgYSBzZWxlY3Rpb24gYmFja2VkIGJ5IGEgbGl2ZVxuLy8gSFRNTENvbGxlY3Rpb24gb3IgTm9kZUxpc3QuIEhvd2V2ZXIsIG5vdGUgdGhhdCBzZWxlY3Rpb24uc2VsZWN0QWxsIHdpbGwgdXNlIGFcbi8vIHN0YXRpYyBOb2RlTGlzdCBhcyBhIGdyb3VwLCBzaW5jZSBpdCBzYWZlbHkgZGVyaXZlZCBmcm9tIHF1ZXJ5U2VsZWN0b3JBbGwuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhcnJheSh4KSB7XG4gIHJldHVybiB4ID09IG51bGwgPyBbXSA6IEFycmF5LmlzQXJyYXkoeCkgPyB4IDogQXJyYXkuZnJvbSh4KTtcbn1cbiIsICJmdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IGVtcHR5IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgYXJyYXkgZnJvbSBcIi4uL2FycmF5LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3JBbGwgZnJvbSBcIi4uL3NlbGVjdG9yQWxsLmpzXCI7XG5cbmZ1bmN0aW9uIGFycmF5QWxsKHNlbGVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFycmF5KHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0ID09PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IGFycmF5QWxsKHNlbGVjdCk7XG4gIGVsc2Ugc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzdWJncm91cHMucHVzaChzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCBwYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZE1hdGNoZXIoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuIiwgImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kO1xuXG5mdW5jdGlvbiBjaGlsZEZpbmQobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaW5kLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGlsZEZpcnN0KCkge1xuICByZXR1cm4gdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KG1hdGNoID09IG51bGwgPyBjaGlsZEZpcnN0XG4gICAgICA6IGNoaWxkRmluZCh0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwgImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlcjtcblxuZnVuY3Rpb24gY2hpbGRyZW4oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY2hpbGRyZW4pO1xufVxuXG5mdW5jdGlvbiBjaGlsZHJlbkZpbHRlcihtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbHRlci5jYWxsKHRoaXMuY2hpbGRyZW4sIG1hdGNoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0QWxsKG1hdGNoID09IG51bGwgPyBjaGlsZHJlblxuICAgICAgOiBjaGlsZHJlbkZpbHRlcih0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IG1hdGNoZXIgZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLCAiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZW50ZXIgfHwgdGhpcy5fZ3JvdXBzLm1hcChzcGFyc2UpLCB0aGlzLl9wYXJlbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVudGVyTm9kZShwYXJlbnQsIGRhdHVtKSB7XG4gIHRoaXMub3duZXJEb2N1bWVudCA9IHBhcmVudC5vd25lckRvY3VtZW50O1xuICB0aGlzLm5hbWVzcGFjZVVSSSA9IHBhcmVudC5uYW1lc3BhY2VVUkk7XG4gIHRoaXMuX25leHQgPSBudWxsO1xuICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gIHRoaXMuX19kYXRhX18gPSBkYXR1bTtcbn1cblxuRW50ZXJOb2RlLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEVudGVyTm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCB0aGlzLl9uZXh0KTsgfSxcbiAgaW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihjaGlsZCwgbmV4dCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgbmV4dCk7IH0sXG4gIHF1ZXJ5U2VsZWN0b3I6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7IHJldHVybiB0aGlzLl9wYXJlbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7IH0sXG4gIHF1ZXJ5U2VsZWN0b3JBbGw6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7IHJldHVybiB0aGlzLl9wYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7IH1cbn07XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9uXHUyMDE5dCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICBrZXlWYWx1ZXMgPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpLFxuICAgICAga2V5VmFsdWU7XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIG5vZGUuXG4gIC8vIElmIG11bHRpcGxlIG5vZGVzIGhhdmUgdGhlIHNhbWUga2V5LCB0aGUgZHVwbGljYXRlcyBhcmUgYWRkZWQgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBrZXlWYWx1ZXNbaV0gPSBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSArIFwiXCI7XG4gICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIGRhdHVtLlxuICAvLyBJZiB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LCBqb2luIGFuZCBhZGQgaXQgdG8gdXBkYXRlLlxuICAvLyBJZiB0aGVyZSBpcyBub3QgKG9yIHRoZSBrZXkgaXMgYSBkdXBsaWNhdGUpLCBhZGQgaXQgdG8gZW50ZXIuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKHBhcmVudCwgZGF0YVtpXSwgaSwgZGF0YSkgKyBcIlwiO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkge1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgbm9kZUJ5S2V5VmFsdWUuZGVsZXRlKGtleVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSA9PT0gbm9kZSkpIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkYXR1bShub2RlKSB7XG4gIHJldHVybiBub2RlLl9fZGF0YV9fO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIEFycmF5LmZyb20odGhpcywgZGF0dW0pO1xuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IGFycmF5bGlrZSh2YWx1ZS5jYWxsKHBhcmVudCwgcGFyZW50ICYmIHBhcmVudC5fX2RhdGFfXywgaiwgcGFyZW50cykpLFxuICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgIGVudGVyR3JvdXAgPSBlbnRlcltqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgdXBkYXRlR3JvdXAgPSB1cGRhdGVbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIGV4aXRHcm91cCA9IGV4aXRbal0gPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpO1xuXG4gICAgYmluZChwYXJlbnQsIGdyb3VwLCBlbnRlckdyb3VwLCB1cGRhdGVHcm91cCwgZXhpdEdyb3VwLCBkYXRhLCBrZXkpO1xuXG4gICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMCwgcHJldmlvdXMsIG5leHQ7IGkwIDwgZGF0YUxlbmd0aDsgKytpMCkge1xuICAgICAgaWYgKHByZXZpb3VzID0gZW50ZXJHcm91cFtpMF0pIHtcbiAgICAgICAgaWYgKGkwID49IGkxKSBpMSA9IGkwICsgMTtcbiAgICAgICAgd2hpbGUgKCEobmV4dCA9IHVwZGF0ZUdyb3VwW2kxXSkgJiYgKytpMSA8IGRhdGFMZW5ndGgpO1xuICAgICAgICBwcmV2aW91cy5fbmV4dCA9IG5leHQgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUgPSBuZXcgU2VsZWN0aW9uKHVwZGF0ZSwgcGFyZW50cyk7XG4gIHVwZGF0ZS5fZW50ZXIgPSBlbnRlcjtcbiAgdXBkYXRlLl9leGl0ID0gZXhpdDtcbiAgcmV0dXJuIHVwZGF0ZTtcbn1cblxuLy8gR2l2ZW4gc29tZSBkYXRhLCB0aGlzIHJldHVybnMgYW4gYXJyYXktbGlrZSB2aWV3IG9mIGl0OiBhbiBvYmplY3QgdGhhdFxuLy8gZXhwb3NlcyBhIGxlbmd0aCBwcm9wZXJ0eSBhbmQgYWxsb3dzIG51bWVyaWMgaW5kZXhpbmcuIE5vdGUgdGhhdCB1bmxpa2Vcbi8vIHNlbGVjdEFsbCwgdGhpcyBpc25cdTIwMTl0IHdvcnJpZWQgYWJvdXQgXHUyMDFDbGl2ZVx1MjAxRCBjb2xsZWN0aW9ucyBiZWNhdXNlIHRoZSByZXN1bHRpbmdcbi8vIGFycmF5IHdpbGwgb25seSBiZSB1c2VkIGJyaWVmbHkgd2hpbGUgZGF0YSBpcyBiZWluZyBib3VuZC4gKEl0IGlzIHBvc3NpYmxlIHRvXG4vLyBjYXVzZSB0aGUgZGF0YSB0byBjaGFuZ2Ugd2hpbGUgaXRlcmF0aW5nIGJ5IHVzaW5nIGEga2V5IGZ1bmN0aW9uLCBidXQgcGxlYXNlXG4vLyBkb25cdTIwMTl0OyB3ZVx1MjAxOWQgcmF0aGVyIGF2b2lkIGEgZ3JhdHVpdG91cyBjb3B5LilcbmZ1bmN0aW9uIGFycmF5bGlrZShkYXRhKSB7XG4gIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIGRhdGFcbiAgICA/IGRhdGEgLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKGRhdGEpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuIiwgImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2V4aXQgfHwgdGhpcy5fZ3JvdXBzLm1hcChzcGFyc2UpLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvbmVudGVyLCBvbnVwZGF0ZSwgb25leGl0KSB7XG4gIHZhciBlbnRlciA9IHRoaXMuZW50ZXIoKSwgdXBkYXRlID0gdGhpcywgZXhpdCA9IHRoaXMuZXhpdCgpO1xuICBpZiAodHlwZW9mIG9uZW50ZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGVudGVyID0gb25lbnRlcihlbnRlcik7XG4gICAgaWYgKGVudGVyKSBlbnRlciA9IGVudGVyLnNlbGVjdGlvbigpO1xuICB9IGVsc2Uge1xuICAgIGVudGVyID0gZW50ZXIuYXBwZW5kKG9uZW50ZXIgKyBcIlwiKTtcbiAgfVxuICBpZiAob251cGRhdGUgIT0gbnVsbCkge1xuICAgIHVwZGF0ZSA9IG9udXBkYXRlKHVwZGF0ZSk7XG4gICAgaWYgKHVwZGF0ZSkgdXBkYXRlID0gdXBkYXRlLnNlbGVjdGlvbigpO1xuICB9XG4gIGlmIChvbmV4aXQgPT0gbnVsbCkgZXhpdC5yZW1vdmUoKTsgZWxzZSBvbmV4aXQoZXhpdCk7XG4gIHJldHVybiBlbnRlciAmJiB1cGRhdGUgPyBlbnRlci5tZXJnZSh1cGRhdGUpLm9yZGVyKCkgOiB1cGRhdGU7XG59XG4iLCAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHNlbGVjdGlvbiA9IGNvbnRleHQuc2VsZWN0aW9uID8gY29udGV4dC5zZWxlY3Rpb24oKSA6IGNvbnRleHQ7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IC0xLCBtID0gZ3JvdXBzLmxlbmd0aDsgKytqIDwgbTspIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IGdyb3VwLmxlbmd0aCAtIDEsIG5leHQgPSBncm91cFtpXSwgbm9kZTsgLS1pID49IDA7KSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGlmIChuZXh0ICYmIG5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24obmV4dCkgXiA0KSBuZXh0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpO1xuICAgICAgICBuZXh0ID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsICJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29tcGFyZSkge1xuICBpZiAoIWNvbXBhcmUpIGNvbXBhcmUgPSBhc2NlbmRpbmc7XG5cbiAgZnVuY3Rpb24gY29tcGFyZU5vZGUoYSwgYikge1xuICAgIHJldHVybiBhICYmIGIgPyBjb21wYXJlKGEuX19kYXRhX18sIGIuX19kYXRhX18pIDogIWEgLSAhYjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHNvcnRncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHNvcnRncm91cCA9IHNvcnRncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNvcnRncm91cFtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRncm91cC5zb3J0KGNvbXBhcmVOb2RlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHNvcnRncm91cHMsIHRoaXMuX3BhcmVudHMpLm9yZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICBhcmd1bWVudHNbMF0gPSB0aGlzO1xuICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcyk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIHZhciBub2RlID0gZ3JvdXBbaV07XG4gICAgICBpZiAobm9kZSkgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzaXplID0gMDtcbiAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMpICsrc2l6ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICF0aGlzLm5vZGUoKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaykge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBjYWxsYmFjay5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsICJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuLi9uYW1lc3BhY2UuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgcmV0dXJuIGZ1bGxuYW1lLmxvY2FsXG4gICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpXG4gICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUoZnVsbG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbilcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKSkoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSkge1xuICByZXR1cm4gKG5vZGUub3duZXJEb2N1bWVudCAmJiBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpIC8vIG5vZGUgaXMgYSBOb2RlXG4gICAgICB8fCAobm9kZS5kb2N1bWVudCAmJiBub2RlKSAvLyBub2RlIGlzIGEgV2luZG93XG4gICAgICB8fCBub2RlLmRlZmF1bHRWaWV3OyAvLyBub2RlIGlzIGEgRG9jdW1lbnRcbn1cbiIsICJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgZWxzZSB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHYsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICAgID8gc3R5bGVSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgPyBzdHlsZUZ1bmN0aW9uXG4gICAgICAgICAgICA6IHN0eWxlQ29uc3RhbnQpKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSlcbiAgICAgIDogc3R5bGVWYWx1ZSh0aGlzLm5vZGUoKSwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZVZhbHVlKG5vZGUsIG5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKVxuICAgICAgfHwgZGVmYXVsdFZpZXcobm9kZSkuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xufVxuIiwgImZ1bmN0aW9uIHByb3BlcnR5UmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5RnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICBlbHNlIHRoaXNbbmFtZV0gPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBwcm9wZXJ0eVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBwcm9wZXJ0eUZ1bmN0aW9uXG4gICAgICAgICAgOiBwcm9wZXJ0eUNvbnN0YW50KShuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpW25hbWVdO1xufVxuIiwgImZ1bmN0aW9uIGNsYXNzQXJyYXkoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcudHJpbSgpLnNwbGl0KC9efFxccysvKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NMaXN0KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuY2xhc3NMaXN0IHx8IG5ldyBDbGFzc0xpc3Qobm9kZSk7XG59XG5cbmZ1bmN0aW9uIENsYXNzTGlzdChub2RlKSB7XG4gIHRoaXMuX25vZGUgPSBub2RlO1xuICB0aGlzLl9uYW1lcyA9IGNsYXNzQXJyYXkobm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKTtcbn1cblxuQ2xhc3NMaXN0LnByb3RvdHlwZSA9IHtcbiAgYWRkOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChpIDwgMCkge1xuICAgICAgdGhpcy5fbmFtZXMucHVzaChuYW1lKTtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy5fbmFtZXMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChpID49IDApIHtcbiAgICAgIHRoaXMuX25hbWVzLnNwbGljZShpLCAxKTtcbiAgICAgIHRoaXMuX25vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy5fbmFtZXMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgY29udGFpbnM6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKSA+PSAwO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjbGFzc2VkQWRkKG5vZGUsIG5hbWVzKSB7XG4gIHZhciBsaXN0ID0gY2xhc3NMaXN0KG5vZGUpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBuKSBsaXN0LmFkZChuYW1lc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRSZW1vdmUobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QucmVtb3ZlKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFRydWUobmFtZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNsYXNzZWRBZGQodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkRmFsc2UobmFtZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNsYXNzZWRSZW1vdmUodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkRnVuY3Rpb24obmFtZXMsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAodmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA/IGNsYXNzZWRBZGQgOiBjbGFzc2VkUmVtb3ZlKSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBuYW1lcyA9IGNsYXNzQXJyYXkobmFtZSArIFwiXCIpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBsaXN0ID0gY2xhc3NMaXN0KHRoaXMubm9kZSgpKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWxpc3QuY29udGFpbnMobmFtZXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBjbGFzc2VkRnVuY3Rpb24gOiB2YWx1ZVxuICAgICAgPyBjbGFzc2VkVHJ1ZVxuICAgICAgOiBjbGFzc2VkRmFsc2UpKG5hbWVzLCB2YWx1ZSkpO1xufVxuIiwgImZ1bmN0aW9uIHRleHRSZW1vdmUoKSB7XG4gIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gdGV4dFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gdGV4dEZ1bmN0aW9uXG4gICAgICAgICAgOiB0ZXh0Q29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG59XG4iLCAiZnVuY3Rpb24gaHRtbFJlbW92ZSgpIHtcbiAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiBodG1sQ29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWxGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBodG1sUmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBodG1sRnVuY3Rpb25cbiAgICAgICAgICA6IGh0bWxDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG59XG4iLCAiZnVuY3Rpb24gcmFpc2UoKSB7XG4gIGlmICh0aGlzLm5leHRTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJhaXNlKTtcbn1cbiIsICJmdW5jdGlvbiBsb3dlcigpIHtcbiAgaWYgKHRoaXMucHJldmlvdXNTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMsIHRoaXMucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gobG93ZXIpO1xufVxuIiwgImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcbmltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi4vc2VsZWN0b3IuanNcIjtcblxuZnVuY3Rpb24gY29uc3RhbnROdWxsKCkge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgYmVmb3JlKSB7XG4gIHZhciBjcmVhdGUgPSB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZSA6IGNyZWF0b3IobmFtZSksXG4gICAgICBzZWxlY3QgPSBiZWZvcmUgPT0gbnVsbCA/IGNvbnN0YW50TnVsbCA6IHR5cGVvZiBiZWZvcmUgPT09IFwiZnVuY3Rpb25cIiA/IGJlZm9yZSA6IHNlbGVjdG9yKGJlZm9yZSk7XG4gIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNlcnRCZWZvcmUoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IG51bGwpO1xuICB9KTtcbn1cbiIsICJmdW5jdGlvbiByZW1vdmUoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmVtb3ZlKTtcbn1cbiIsICJmdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZShmYWxzZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZURlZXAoKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKHRydWUpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkZWVwKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChkZWVwID8gc2VsZWN0aW9uX2Nsb25lRGVlcCA6IHNlbGVjdGlvbl9jbG9uZVNoYWxsb3cpO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMucHJvcGVydHkoXCJfX2RhdGFfX1wiLCB2YWx1ZSlcbiAgICAgIDogdGhpcy5ub2RlKCkuX19kYXRhX187XG59XG4iLCAiZnVuY3Rpb24gY29udGV4dExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQsIHRoaXMuX19kYXRhX18pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvblJlbW92ZSh0eXBlbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uO1xuICAgIGlmICghb24pIHJldHVybjtcbiAgICBmb3IgKHZhciBqID0gMCwgaSA9IC0xLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAobyA9IG9uW2pdLCAoIXR5cGVuYW1lLnR5cGUgfHwgby50eXBlID09PSB0eXBlbmFtZS50eXBlKSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uWysraV0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKytpKSBvbi5sZW5ndGggPSBpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX19vbjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25BZGQodHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb24sIG8sIGxpc3RlbmVyID0gY29udGV4dExpc3RlbmVyKHZhbHVlKTtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAoKG8gPSBvbltqXSkudHlwZSA9PT0gdHlwZW5hbWUudHlwZSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciA9IGxpc3RlbmVyLCBvLm9wdGlvbnMgPSBvcHRpb25zKTtcbiAgICAgICAgby52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlbmFtZS50eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgbyA9IHt0eXBlOiB0eXBlbmFtZS50eXBlLCBuYW1lOiB0eXBlbmFtZS5uYW1lLCB2YWx1ZTogdmFsdWUsIGxpc3RlbmVyOiBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uc307XG4gICAgaWYgKCFvbikgdGhpcy5fX29uID0gW29dO1xuICAgIGVsc2Ugb24ucHVzaChvKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlbmFtZXMgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIpLCBpLCBuID0gdHlwZW5hbWVzLmxlbmd0aCwgdDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgb24gPSB0aGlzLm5vZGUoKS5fX29uO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGZvciAoaSA9IDAsIG8gPSBvbltqXTsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHQgPSB0eXBlbmFtZXNbaV0pLnR5cGUgPT09IG8udHlwZSAmJiB0Lm5hbWUgPT09IG8ubmFtZSkge1xuICAgICAgICAgIHJldHVybiBvLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIG9uID0gdmFsdWUgPyBvbkFkZCA6IG9uUmVtb3ZlO1xuICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB0aGlzLmVhY2gob24odHlwZW5hbWVzW2ldLCB2YWx1ZSwgb3B0aW9ucykpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsICJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG5vZGUsIHR5cGUsIHBhcmFtcykge1xuICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSksXG4gICAgICBldmVudCA9IHdpbmRvdy5DdXN0b21FdmVudDtcblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBldmVudCA9IG5ldyBldmVudCh0eXBlLCBwYXJhbXMpO1xuICB9IGVsc2Uge1xuICAgIGV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgaWYgKHBhcmFtcykgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSksIGV2ZW50LmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgZWxzZSBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgfVxuXG4gIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ29uc3RhbnQodHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGRpc3BhdGNoRnVuY3Rpb25cbiAgICAgIDogZGlzcGF0Y2hDb25zdGFudCkodHlwZSwgcGFyYW1zKSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24qKCkge1xuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgeWllbGQgbm9kZTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgc2VsZWN0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCBmcm9tIFwiLi9zZWxlY3RDaGlsZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiBmcm9tIFwiLi9zZWxlY3RDaGlsZHJlbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdGEgZnJvbSBcIi4vZGF0YS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbnRlciBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9leGl0IGZyb20gXCIuL2V4aXQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fam9pbiBmcm9tIFwiLi9qb2luLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29yZGVyIGZyb20gXCIuL29yZGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NvcnQgZnJvbSBcIi4vc29ydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZXMgZnJvbSBcIi4vbm9kZXMuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZSBmcm9tIFwiLi9ub2RlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NpemUgZnJvbSBcIi4vc2l6ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbXB0eSBmcm9tIFwiLi9lbXB0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lYWNoIGZyb20gXCIuL2VhY2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3Byb3BlcnR5IGZyb20gXCIuL3Byb3BlcnR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NsYXNzZWQgZnJvbSBcIi4vY2xhc3NlZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faHRtbCBmcm9tIFwiLi9odG1sLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JhaXNlIGZyb20gXCIuL3JhaXNlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2xvd2VyIGZyb20gXCIuL2xvd2VyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2FwcGVuZCBmcm9tIFwiLi9hcHBlbmQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faW5zZXJ0IGZyb20gXCIuL2luc2VydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Nsb25lIGZyb20gXCIuL2Nsb25lLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdHVtIGZyb20gXCIuL2RhdHVtLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Rpc3BhdGNoIGZyb20gXCIuL2Rpc3BhdGNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2l0ZXJhdG9yIGZyb20gXCIuL2l0ZXJhdG9yLmpzXCI7XG5cbmV4cG9ydCB2YXIgcm9vdCA9IFtudWxsXTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdGlvbihncm91cHMsIHBhcmVudHMpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF1dLCByb290KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX3NlbGVjdGlvbigpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblNlbGVjdGlvbi5wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2VsZWN0aW9uLFxuICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiBzZWxlY3Rpb25fZmlsdGVyLFxuICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgZXhpdDogc2VsZWN0aW9uX2V4aXQsXG4gIGpvaW46IHNlbGVjdGlvbl9qb2luLFxuICBtZXJnZTogc2VsZWN0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHNlbGVjdGlvbl9zZWxlY3Rpb24sXG4gIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICBjYWxsOiBzZWxlY3Rpb25fY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgYXR0cjogc2VsZWN0aW9uX2F0dHIsXG4gIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzc2VkLFxuICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgaHRtbDogc2VsZWN0aW9uX2h0bWwsXG4gIHJhaXNlOiBzZWxlY3Rpb25fcmFpc2UsXG4gIGxvd2VyOiBzZWxlY3Rpb25fbG93ZXIsXG4gIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgaW5zZXJ0OiBzZWxlY3Rpb25faW5zZXJ0LFxuICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gIGNsb25lOiBzZWxlY3Rpb25fY2xvbmUsXG4gIGRhdHVtOiBzZWxlY3Rpb25fZGF0dW0sXG4gIG9uOiBzZWxlY3Rpb25fb24sXG4gIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2gsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25faXRlcmF0b3Jcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbGVjdGlvbjtcbiIsICJpbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFtbc2VsZWN0b3JdXSwgcm9vdCk7XG59XG4iLCAiaW1wb3J0IGFycmF5IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcildLCBbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XSlcbiAgICAgIDogbmV3IFNlbGVjdGlvbihbYXJyYXkoc2VsZWN0b3IpXSwgcm9vdCk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29uc3RydWN0b3IsIGZhY3RvcnksIHByb3RvdHlwZSkge1xuICBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBmYWN0b3J5LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgcHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY29uc3RydWN0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQocGFyZW50LCBkZWZpbml0aW9uKSB7XG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudC5wcm90b3R5cGUpO1xuICBmb3IgKHZhciBrZXkgaW4gZGVmaW5pdGlvbikgcHJvdG90eXBlW2tleV0gPSBkZWZpbml0aW9uW2tleV07XG4gIHJldHVybiBwcm90b3R5cGU7XG59XG4iLCAiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xvcigpIHt9XG5cbmV4cG9ydCB2YXIgZGFya2VyID0gMC43O1xuZXhwb3J0IHZhciBicmlnaHRlciA9IDEgLyBkYXJrZXI7XG5cbnZhciByZUkgPSBcIlxcXFxzKihbKy1dP1xcXFxkKylcXFxccypcIixcbiAgICByZU4gPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPylcXFxccypcIixcbiAgICByZVAgPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPyklXFxcXHMqXCIsXG4gICAgcmVIZXggPSAvXiMoWzAtOWEtZl17Myw4fSkkLyxcbiAgICByZVJnYkludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfVxcXFwpJGApLFxuICAgIHJlUmdiUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVSZ2JhSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZVJnYmFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlSHNsUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVIc2xhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xhXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKTtcblxudmFyIG5hbWVkID0ge1xuICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICBhbnRpcXVld2hpdGU6IDB4ZmFlYmQ3LFxuICBhcXVhOiAweDAwZmZmZixcbiAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gIGF6dXJlOiAweGYwZmZmZixcbiAgYmVpZ2U6IDB4ZjVmNWRjLFxuICBiaXNxdWU6IDB4ZmZlNGM0LFxuICBibGFjazogMHgwMDAwMDAsXG4gIGJsYW5jaGVkYWxtb25kOiAweGZmZWJjZCxcbiAgYmx1ZTogMHgwMDAwZmYsXG4gIGJsdWV2aW9sZXQ6IDB4OGEyYmUyLFxuICBicm93bjogMHhhNTJhMmEsXG4gIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gIGNhZGV0Ymx1ZTogMHg1ZjllYTAsXG4gIGNoYXJ0cmV1c2U6IDB4N2ZmZjAwLFxuICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICBjb3JhbDogMHhmZjdmNTAsXG4gIGNvcm5mbG93ZXJibHVlOiAweDY0OTVlZCxcbiAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICBjcmltc29uOiAweGRjMTQzYyxcbiAgY3lhbjogMHgwMGZmZmYsXG4gIGRhcmtibHVlOiAweDAwMDA4YixcbiAgZGFya2N5YW46IDB4MDA4YjhiLFxuICBkYXJrZ29sZGVucm9kOiAweGI4ODYwYixcbiAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICBkYXJrZ3JleTogMHhhOWE5YTksXG4gIGRhcmtraGFraTogMHhiZGI3NmIsXG4gIGRhcmttYWdlbnRhOiAweDhiMDA4YixcbiAgZGFya29saXZlZ3JlZW46IDB4NTU2YjJmLFxuICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgZGFya29yY2hpZDogMHg5OTMyY2MsXG4gIGRhcmtyZWQ6IDB4OGIwMDAwLFxuICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgZGFya3NlYWdyZWVuOiAweDhmYmM4ZixcbiAgZGFya3NsYXRlYmx1ZTogMHg0ODNkOGIsXG4gIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICBkYXJrc2xhdGVncmV5OiAweDJmNGY0ZixcbiAgZGFya3R1cnF1b2lzZTogMHgwMGNlZDEsXG4gIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICBkZWVwcGluazogMHhmZjE0OTMsXG4gIGRlZXBza3libHVlOiAweDAwYmZmZixcbiAgZGltZ3JheTogMHg2OTY5NjksXG4gIGRpbWdyZXk6IDB4Njk2OTY5LFxuICBkb2RnZXJibHVlOiAweDFlOTBmZixcbiAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgZmxvcmFsd2hpdGU6IDB4ZmZmYWYwLFxuICBmb3Jlc3RncmVlbjogMHgyMjhiMjIsXG4gIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICBnYWluc2Jvcm86IDB4ZGNkY2RjLFxuICBnaG9zdHdoaXRlOiAweGY4ZjhmZixcbiAgZ29sZDogMHhmZmQ3MDAsXG4gIGdvbGRlbnJvZDogMHhkYWE1MjAsXG4gIGdyYXk6IDB4ODA4MDgwLFxuICBncmVlbjogMHgwMDgwMDAsXG4gIGdyZWVueWVsbG93OiAweGFkZmYyZixcbiAgZ3JleTogMHg4MDgwODAsXG4gIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgaG90cGluazogMHhmZjY5YjQsXG4gIGluZGlhbnJlZDogMHhjZDVjNWMsXG4gIGluZGlnbzogMHg0YjAwODIsXG4gIGl2b3J5OiAweGZmZmZmMCxcbiAga2hha2k6IDB4ZjBlNjhjLFxuICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gIGxhdmVuZGVyYmx1c2g6IDB4ZmZmMGY1LFxuICBsYXduZ3JlZW46IDB4N2NmYzAwLFxuICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICBsaWdodGJsdWU6IDB4YWRkOGU2LFxuICBsaWdodGNvcmFsOiAweGYwODA4MCxcbiAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDB4ZmFmYWQyLFxuICBsaWdodGdyYXk6IDB4ZDNkM2QzLFxuICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgbGlnaHRncmV5OiAweGQzZDNkMyxcbiAgbGlnaHRwaW5rOiAweGZmYjZjMSxcbiAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICBsaWdodHNlYWdyZWVuOiAweDIwYjJhYSxcbiAgbGlnaHRza3libHVlOiAweDg3Y2VmYSxcbiAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICBsaWdodHNsYXRlZ3JleTogMHg3Nzg4OTksXG4gIGxpZ2h0c3RlZWxibHVlOiAweGIwYzRkZSxcbiAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICBsaW1lOiAweDAwZmYwMCxcbiAgbGltZWdyZWVuOiAweDMyY2QzMixcbiAgbGluZW46IDB4ZmFmMGU2LFxuICBtYWdlbnRhOiAweGZmMDBmZixcbiAgbWFyb29uOiAweDgwMDAwMCxcbiAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gIG1lZGl1bWJsdWU6IDB4MDAwMGNkLFxuICBtZWRpdW1vcmNoaWQ6IDB4YmE1NWQzLFxuICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICBtZWRpdW1zZWFncmVlbjogMHgzY2IzNzEsXG4gIG1lZGl1bXNsYXRlYmx1ZTogMHg3YjY4ZWUsXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgbWVkaXVtdHVycXVvaXNlOiAweDQ4ZDFjYyxcbiAgbWVkaXVtdmlvbGV0cmVkOiAweGM3MTU4NSxcbiAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgbWludGNyZWFtOiAweGY1ZmZmYSxcbiAgbWlzdHlyb3NlOiAweGZmZTRlMSxcbiAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICBuYXZham93aGl0ZTogMHhmZmRlYWQsXG4gIG5hdnk6IDB4MDAwMDgwLFxuICBvbGRsYWNlOiAweGZkZjVlNixcbiAgb2xpdmU6IDB4ODA4MDAwLFxuICBvbGl2ZWRyYWI6IDB4NmI4ZTIzLFxuICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICBvcmFuZ2VyZWQ6IDB4ZmY0NTAwLFxuICBvcmNoaWQ6IDB4ZGE3MGQ2LFxuICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgcGFsZWdyZWVuOiAweDk4ZmI5OCxcbiAgcGFsZXR1cnF1b2lzZTogMHhhZmVlZWUsXG4gIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICBwYXBheWF3aGlwOiAweGZmZWZkNSxcbiAgcGVhY2hwdWZmOiAweGZmZGFiOSxcbiAgcGVydTogMHhjZDg1M2YsXG4gIHBpbms6IDB4ZmZjMGNiLFxuICBwbHVtOiAweGRkYTBkZCxcbiAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gIHB1cnBsZTogMHg4MDAwODAsXG4gIHJlYmVjY2FwdXJwbGU6IDB4NjYzMzk5LFxuICByZWQ6IDB4ZmYwMDAwLFxuICByb3N5YnJvd246IDB4YmM4ZjhmLFxuICByb3lhbGJsdWU6IDB4NDE2OWUxLFxuICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gIHNhbG1vbjogMHhmYTgwNzIsXG4gIHNhbmR5YnJvd246IDB4ZjRhNDYwLFxuICBzZWFncmVlbjogMHgyZThiNTcsXG4gIHNlYXNoZWxsOiAweGZmZjVlZSxcbiAgc2llbm5hOiAweGEwNTIyZCxcbiAgc2lsdmVyOiAweGMwYzBjMCxcbiAgc2t5Ymx1ZTogMHg4N2NlZWIsXG4gIHNsYXRlYmx1ZTogMHg2YTVhY2QsXG4gIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gIHNsYXRlZ3JleTogMHg3MDgwOTAsXG4gIHNub3c6IDB4ZmZmYWZhLFxuICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gIHN0ZWVsYmx1ZTogMHg0NjgyYjQsXG4gIHRhbjogMHhkMmI0OGMsXG4gIHRlYWw6IDB4MDA4MDgwLFxuICB0aGlzdGxlOiAweGQ4YmZkOCxcbiAgdG9tYXRvOiAweGZmNjM0NyxcbiAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgdmlvbGV0OiAweGVlODJlZSxcbiAgd2hlYXQ6IDB4ZjVkZWIzLFxuICB3aGl0ZTogMHhmZmZmZmYsXG4gIHdoaXRlc21va2U6IDB4ZjVmNWY1LFxuICB5ZWxsb3c6IDB4ZmZmZjAwLFxuICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbn07XG5cbmRlZmluZShDb2xvciwgY29sb3IsIHtcbiAgY29weShjaGFubmVscykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyB0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLCBjaGFubmVscyk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnJnYigpLmRpc3BsYXlhYmxlKCk7XG4gIH0sXG4gIGhleDogY29sb3JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IGNvbG9yX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogY29sb3JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0SHNsOiBjb2xvcl9mb3JtYXRIc2wsXG4gIGZvcm1hdFJnYjogY29sb3JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogY29sb3JfZm9ybWF0UmdiXG59KTtcblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4OCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIc2woKSB7XG4gIHJldHVybiBoc2xDb252ZXJ0KHRoaXMpLmZvcm1hdEhzbCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRSZ2IoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdFJnYigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvcihmb3JtYXQpIHtcbiAgdmFyIG0sIGw7XG4gIGZvcm1hdCA9IChmb3JtYXQgKyBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIChtID0gcmVIZXguZXhlYyhmb3JtYXQpKSA/IChsID0gbVsxXS5sZW5ndGgsIG0gPSBwYXJzZUludChtWzFdLCAxNiksIGwgPT09IDYgPyByZ2JuKG0pIC8vICNmZjAwMDBcbiAgICAgIDogbCA9PT0gMyA/IG5ldyBSZ2IoKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSwgMSkgLy8gI2YwMFxuICAgICAgOiBsID09PSA4ID8gcmdiYShtID4+IDI0ICYgMHhmZiwgbSA+PiAxNiAmIDB4ZmYsIG0gPj4gOCAmIDB4ZmYsIChtICYgMHhmZikgLyAweGZmKSAvLyAjZmYwMDAwMDBcbiAgICAgIDogbCA9PT0gNCA/IHJnYmEoKG0gPj4gMTIgJiAweGYpIHwgKG0gPj4gOCAmIDB4ZjApLCAobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSkgLyAweGZmKSAvLyAjZjAwMFxuICAgICAgOiBudWxsKSAvLyBpbnZhbGlkIGhleFxuICAgICAgOiAobSA9IHJlUmdiSW50ZWdlci5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdLCBtWzJdLCBtWzNdLCAxKSAvLyByZ2IoMjU1LCAwLCAwKVxuICAgICAgOiAobSA9IHJlUmdiUGVyY2VudC5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCAxKSAvLyByZ2IoMTAwJSwgMCUsIDAlKVxuICAgICAgOiAobSA9IHJlUmdiYUludGVnZXIuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSwgbVsyXSwgbVszXSwgbVs0XSkgLy8gcmdiYSgyNTUsIDAsIDAsIDEpXG4gICAgICA6IChtID0gcmVSZ2JhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCBtWzRdKSAvLyByZ2IoMTAwJSwgMCUsIDAlLCAxKVxuICAgICAgOiAobSA9IHJlSHNsUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCAxKSAvLyBoc2woMTIwLCA1MCUsIDUwJSlcbiAgICAgIDogKG0gPSByZUhzbGFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIG1bNF0pIC8vIGhzbGEoMTIwLCA1MCUsIDUwJSwgMSlcbiAgICAgIDogbmFtZWQuaGFzT3duUHJvcGVydHkoZm9ybWF0KSA/IHJnYm4obmFtZWRbZm9ybWF0XSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgIDogZm9ybWF0ID09PSBcInRyYW5zcGFyZW50XCIgPyBuZXcgUmdiKE5hTiwgTmFOLCBOYU4sIDApXG4gICAgICA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJnYm4obikge1xuICByZXR1cm4gbmV3IFJnYihuID4+IDE2ICYgMHhmZiwgbiA+PiA4ICYgMHhmZiwgbiAmIDB4ZmYsIDEpO1xufVxuXG5mdW5jdGlvbiByZ2JhKHIsIGcsIGIsIGEpIHtcbiAgaWYgKGEgPD0gMCkgciA9IGcgPSBiID0gTmFOO1xuICByZXR1cm4gbmV3IFJnYihyLCBnLCBiLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYkNvbnZlcnQobykge1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBSZ2I7XG4gIG8gPSBvLnJnYigpO1xuICByZXR1cm4gbmV3IFJnYihvLnIsIG8uZywgby5iLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyByZ2JDb252ZXJ0KHIpIDogbmV3IFJnYihyLCBnLCBiLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICB0aGlzLnIgPSArcjtcbiAgdGhpcy5nID0gK2c7XG4gIHRoaXMuYiA9ICtiO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKFJnYiwgcmdiLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBSZ2IoY2xhbXBpKHRoaXMuciksIGNsYW1waSh0aGlzLmcpLCBjbGFtcGkodGhpcy5iKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKC0wLjUgPD0gdGhpcy5yICYmIHRoaXMuciA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmcgJiYgdGhpcy5nIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuYiAmJiB0aGlzLmIgPCAyNTUuNSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgaGV4OiByZ2JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IHJnYl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IHJnYl9mb3JtYXRIZXg4LFxuICBmb3JtYXRSZ2I6IHJnYl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiByZ2JfZm9ybWF0UmdiXG59KSk7XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX0ke2hleCgoaXNOYU4odGhpcy5vcGFjaXR5KSA/IDEgOiB0aGlzLm9wYWNpdHkpICogMjU1KX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0UmdiKCkge1xuICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gIHJldHVybiBgJHthID09PSAxID8gXCJyZ2IoXCIgOiBcInJnYmEoXCJ9JHtjbGFtcGkodGhpcy5yKX0sICR7Y2xhbXBpKHRoaXMuZyl9LCAke2NsYW1waSh0aGlzLmIpfSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG59XG5cbmZ1bmN0aW9uIGNsYW1wYShvcGFjaXR5KSB7XG4gIHJldHVybiBpc05hTihvcGFjaXR5KSA/IDEgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcGFjaXR5KSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1waSh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSB8fCAwKSk7XG59XG5cbmZ1bmN0aW9uIGhleCh2YWx1ZSkge1xuICB2YWx1ZSA9IGNsYW1waSh2YWx1ZSk7XG4gIHJldHVybiAodmFsdWUgPCAxNiA/IFwiMFwiIDogXCJcIikgKyB2YWx1ZS50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIGhzbGEoaCwgcywgbCwgYSkge1xuICBpZiAoYSA8PSAwKSBoID0gcyA9IGwgPSBOYU47XG4gIGVsc2UgaWYgKGwgPD0gMCB8fCBsID49IDEpIGggPSBzID0gTmFOO1xuICBlbHNlIGlmIChzIDw9IDApIGggPSBOYU47XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbmV3IEhzbChvLmgsIG8ucywgby5sLCBvLm9wYWNpdHkpO1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBIc2w7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbztcbiAgbyA9IG8ucmdiKCk7XG4gIHZhciByID0gby5yIC8gMjU1LFxuICAgICAgZyA9IG8uZyAvIDI1NSxcbiAgICAgIGIgPSBvLmIgLyAyNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgaCA9IE5hTixcbiAgICAgIHMgPSBtYXggLSBtaW4sXG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICBpZiAocykge1xuICAgIGlmIChyID09PSBtYXgpIGggPSAoZyAtIGIpIC8gcyArIChnIDwgYikgKiA2O1xuICAgIGVsc2UgaWYgKGcgPT09IG1heCkgaCA9IChiIC0gcikgLyBzICsgMjtcbiAgICBlbHNlIGggPSAociAtIGcpIC8gcyArIDQ7XG4gICAgcyAvPSBsIDwgMC41ID8gbWF4ICsgbWluIDogMiAtIG1heCAtIG1pbjtcbiAgICBoICo9IDYwO1xuICB9IGVsc2Uge1xuICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICB9XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhzbENvbnZlcnQoaCkgOiBuZXcgSHNsKGgsIHMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZnVuY3Rpb24gSHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShIc2wsIGhzbCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IHRoaXMuaCAlIDM2MCArICh0aGlzLmggPCAwKSAqIDM2MCxcbiAgICAgICAgcyA9IGlzTmFOKGgpIHx8IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zLFxuICAgICAgICBsID0gdGhpcy5sLFxuICAgICAgICBtMiA9IGwgKyAobCA8IDAuNSA/IGwgOiAxIC0gbCkgKiBzLFxuICAgICAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgcmV0dXJuIG5ldyBSZ2IoXG4gICAgICBoc2wycmdiKGggPj0gMjQwID8gaCAtIDI0MCA6IGggKyAxMjAsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGgsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGggPCAxMjAgPyBoICsgMjQwIDogaCAtIDEyMCwgbTEsIG0yKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgSHNsKGNsYW1waCh0aGlzLmgpLCBjbGFtcHQodGhpcy5zKSwgY2xhbXB0KHRoaXMubCksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgwIDw9IHRoaXMucyAmJiB0aGlzLnMgPD0gMSB8fCBpc05hTih0aGlzLnMpKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLmwgJiYgdGhpcy5sIDw9IDEpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGZvcm1hdEhzbCgpIHtcbiAgICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gICAgcmV0dXJuIGAke2EgPT09IDEgPyBcImhzbChcIiA6IFwiaHNsYShcIn0ke2NsYW1waCh0aGlzLmgpfSwgJHtjbGFtcHQodGhpcy5zKSAqIDEwMH0lLCAke2NsYW1wdCh0aGlzLmwpICogMTAwfSUke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xuICB9XG59KSk7XG5cbmZ1bmN0aW9uIGNsYW1waCh2YWx1ZSkge1xuICB2YWx1ZSA9ICh2YWx1ZSB8fCAwKSAlIDM2MDtcbiAgcmV0dXJuIHZhbHVlIDwgMCA/IHZhbHVlICsgMzYwIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYW1wdCh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUgfHwgMCkpO1xufVxuXG4vKiBGcm9tIEZ2RCAxMy4zNywgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCAzICovXG5mdW5jdGlvbiBoc2wycmdiKGgsIG0xLCBtMikge1xuICByZXR1cm4gKGggPCA2MCA/IG0xICsgKG0yIC0gbTEpICogaCAvIDYwXG4gICAgICA6IGggPCAxODAgPyBtMlxuICAgICAgOiBoIDwgMjQwID8gbTEgKyAobTIgLSBtMSkgKiAoMjQwIC0gaCkgLyA2MFxuICAgICAgOiBtMSkgKiAyNTU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGJhc2lzKHQxLCB2MCwgdjEsIHYyLCB2Mykge1xuICB2YXIgdDIgPSB0MSAqIHQxLCB0MyA9IHQyICogdDE7XG4gIHJldHVybiAoKDEgLSAzICogdDEgKyAzICogdDIgLSB0MykgKiB2MFxuICAgICAgKyAoNCAtIDYgKiB0MiArIDMgKiB0MykgKiB2MVxuICAgICAgKyAoMSArIDMgKiB0MSArIDMgKiB0MiAtIDMgKiB0MykgKiB2MlxuICAgICAgKyB0MyAqIHYzKSAvIDY7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlcykge1xuICB2YXIgbiA9IHZhbHVlcy5sZW5ndGggLSAxO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gdCA8PSAwID8gKHQgPSAwKSA6IHQgPj0gMSA/ICh0ID0gMSwgbiAtIDEpIDogTWF0aC5mbG9vcih0ICogbiksXG4gICAgICAgIHYxID0gdmFsdWVzW2ldLFxuICAgICAgICB2MiA9IHZhbHVlc1tpICsgMV0sXG4gICAgICAgIHYwID0gaSA+IDAgPyB2YWx1ZXNbaSAtIDFdIDogMiAqIHYxIC0gdjIsXG4gICAgICAgIHYzID0gaSA8IG4gLSAxID8gdmFsdWVzW2kgKyAyXSA6IDIgKiB2MiAtIHYxO1xuICAgIHJldHVybiBiYXNpcygodCAtIGkgLyBuKSAqIG4sIHYwLCB2MSwgdjIsIHYzKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge2Jhc2lzfSBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG4gPSB2YWx1ZXMubGVuZ3RoO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gTWF0aC5mbG9vcigoKHQgJT0gMSkgPCAwID8gKyt0IDogdCkgKiBuKSxcbiAgICAgICAgdjAgPSB2YWx1ZXNbKGkgKyBuIC0gMSkgJSBuXSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaSAlIG5dLFxuICAgICAgICB2MiA9IHZhbHVlc1soaSArIDEpICUgbl0sXG4gICAgICAgIHYzID0gdmFsdWVzWyhpICsgMikgJSBuXTtcbiAgICByZXR1cm4gYmFzaXMoKHQgLSBpIC8gbikgKiBuLCB2MCwgdjEsIHYyLCB2Myk7XG4gIH07XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwgImltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBsaW5lYXIoYSwgZCkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBhICsgdCAqIGQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4cG9uZW50aWFsKGEsIGIsIHkpIHtcbiAgcmV0dXJuIGEgPSBNYXRoLnBvdyhhLCB5KSwgYiA9IE1hdGgucG93KGIsIHkpIC0gYSwgeSA9IDEgLyB5LCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KGEgKyB0ICogYiwgeSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodWUoYSwgYikge1xuICB2YXIgZCA9IGIgLSBhO1xuICByZXR1cm4gZCA/IGxpbmVhcihhLCBkID4gMTgwIHx8IGQgPCAtMTgwID8gZCAtIDM2MCAqIE1hdGgucm91bmQoZCAvIDM2MCkgOiBkKSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2FtbWEoeSkge1xuICByZXR1cm4gKHkgPSAreSkgPT09IDEgPyBub2dhbW1hIDogZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBiIC0gYSA/IGV4cG9uZW50aWFsKGEsIGIsIHkpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vZ2FtbWEoYSwgYikge1xuICB2YXIgZCA9IGIgLSBhO1xuICByZXR1cm4gZCA/IGxpbmVhcihhLCBkKSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xufVxuIiwgImltcG9ydCB7cmdiIGFzIGNvbG9yUmdifSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBiYXNpcyBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuaW1wb3J0IGJhc2lzQ2xvc2VkIGZyb20gXCIuL2Jhc2lzQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9nYW1tYSwge2dhbW1hfSBmcm9tIFwiLi9jb2xvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gcmdiR2FtbWEoeSkge1xuICB2YXIgY29sb3IgPSBnYW1tYSh5KTtcblxuICBmdW5jdGlvbiByZ2Ioc3RhcnQsIGVuZCkge1xuICAgIHZhciByID0gY29sb3IoKHN0YXJ0ID0gY29sb3JSZ2Ioc3RhcnQpKS5yLCAoZW5kID0gY29sb3JSZ2IoZW5kKSkuciksXG4gICAgICAgIGcgPSBjb2xvcihzdGFydC5nLCBlbmQuZyksXG4gICAgICAgIGIgPSBjb2xvcihzdGFydC5iLCBlbmQuYiksXG4gICAgICAgIG9wYWNpdHkgPSBub2dhbW1hKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuciA9IHIodCk7XG4gICAgICBzdGFydC5nID0gZyh0KTtcbiAgICAgIHN0YXJ0LmIgPSBiKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cblxuICByZ2IuZ2FtbWEgPSByZ2JHYW1tYTtcblxuICByZXR1cm4gcmdiO1xufSkoMSk7XG5cbmZ1bmN0aW9uIHJnYlNwbGluZShzcGxpbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBuID0gY29sb3JzLmxlbmd0aCxcbiAgICAgICAgciA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgaSwgY29sb3I7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY29sb3IgPSBjb2xvclJnYihjb2xvcnNbaV0pO1xuICAgICAgcltpXSA9IGNvbG9yLnIgfHwgMDtcbiAgICAgIGdbaV0gPSBjb2xvci5nIHx8IDA7XG4gICAgICBiW2ldID0gY29sb3IuYiB8fCAwO1xuICAgIH1cbiAgICByID0gc3BsaW5lKHIpO1xuICAgIGcgPSBzcGxpbmUoZyk7XG4gICAgYiA9IHNwbGluZShiKTtcbiAgICBjb2xvci5vcGFjaXR5ID0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgY29sb3IuciA9IHIodCk7XG4gICAgICBjb2xvci5nID0gZyh0KTtcbiAgICAgIGNvbG9yLmIgPSBiKHQpO1xuICAgICAgcmV0dXJuIGNvbG9yICsgXCJcIjtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHJnYkJhc2lzID0gcmdiU3BsaW5lKGJhc2lzKTtcbmV4cG9ydCB2YXIgcmdiQmFzaXNDbG9zZWQgPSByZ2JTcGxpbmUoYmFzaXNDbG9zZWQpO1xuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKiAoMSAtIHQpICsgYiAqIHQ7XG4gIH07XG59XG4iLCAiaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHJlQSA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZyxcbiAgICByZUIgPSBuZXcgUmVnRXhwKHJlQS5zb3VyY2UsIFwiZ1wiKTtcblxuZnVuY3Rpb24gemVybyhiKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25lKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYih0KSArIFwiXCI7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGJpID0gcmVBLmxhc3RJbmRleCA9IHJlQi5sYXN0SW5kZXggPSAwLCAvLyBzY2FuIGluZGV4IGZvciBuZXh0IG51bWJlciBpbiBiXG4gICAgICBhbSwgLy8gY3VycmVudCBtYXRjaCBpbiBhXG4gICAgICBibSwgLy8gY3VycmVudCBtYXRjaCBpbiBiXG4gICAgICBicywgLy8gc3RyaW5nIHByZWNlZGluZyBjdXJyZW50IG51bWJlciBpbiBiLCBpZiBhbnlcbiAgICAgIGkgPSAtMSwgLy8gaW5kZXggaW4gc1xuICAgICAgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcblxuICAvLyBDb2VyY2UgaW5wdXRzIHRvIHN0cmluZ3MuXG4gIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuXG4gIC8vIEludGVycG9sYXRlIHBhaXJzIG9mIG51bWJlcnMgaW4gYSAmIGIuXG4gIHdoaWxlICgoYW0gPSByZUEuZXhlYyhhKSlcbiAgICAgICYmIChibSA9IHJlQi5leGVjKGIpKSkge1xuICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkgeyAvLyBhIHN0cmluZyBwcmVjZWRlcyB0aGUgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYnMgPSBiLnNsaWNlKGJpLCBicyk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIGlmICgoYW0gPSBhbVswXSkgPT09IChibSA9IGJtWzBdKSkgeyAvLyBudW1iZXJzIGluIGEgJiBiIG1hdGNoXG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBibTsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYm07XG4gICAgfSBlbHNlIHsgLy8gaW50ZXJwb2xhdGUgbm9uLW1hdGNoaW5nIG51bWJlcnNcbiAgICAgIHNbKytpXSA9IG51bGw7XG4gICAgICBxLnB1c2goe2k6IGksIHg6IG51bWJlcihhbSwgYm0pfSk7XG4gICAgfVxuICAgIGJpID0gcmVCLmxhc3RJbmRleDtcbiAgfVxuXG4gIC8vIEFkZCByZW1haW5zIG9mIGIuXG4gIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgYnMgPSBiLnNsaWNlKGJpKTtcbiAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICBlbHNlIHNbKytpXSA9IGJzO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBvcHRpbWl6YXRpb24gZm9yIG9ubHkgYSBzaW5nbGUgbWF0Y2guXG4gIC8vIE90aGVyd2lzZSwgaW50ZXJwb2xhdGUgZWFjaCBvZiB0aGUgbnVtYmVycyBhbmQgcmVqb2luIHRoZSBzdHJpbmcuXG4gIHJldHVybiBzLmxlbmd0aCA8IDIgPyAocVswXVxuICAgICAgPyBvbmUocVswXS54KVxuICAgICAgOiB6ZXJvKGIpKVxuICAgICAgOiAoYiA9IHEubGVuZ3RoLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgICAgICB9KTtcbn1cbiIsICJ2YXIgZGVncmVlcyA9IDE4MCAvIE1hdGguUEk7XG5cbmV4cG9ydCB2YXIgaWRlbnRpdHkgPSB7XG4gIHRyYW5zbGF0ZVg6IDAsXG4gIHRyYW5zbGF0ZVk6IDAsXG4gIHJvdGF0ZTogMCxcbiAgc2tld1g6IDAsXG4gIHNjYWxlWDogMSxcbiAgc2NhbGVZOiAxXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIHZhciBzY2FsZVgsIHNjYWxlWSwgc2tld1g7XG4gIGlmIChzY2FsZVggPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYikpIGEgLz0gc2NhbGVYLCBiIC89IHNjYWxlWDtcbiAgaWYgKHNrZXdYID0gYSAqIGMgKyBiICogZCkgYyAtPSBhICogc2tld1gsIGQgLT0gYiAqIHNrZXdYO1xuICBpZiAoc2NhbGVZID0gTWF0aC5zcXJ0KGMgKiBjICsgZCAqIGQpKSBjIC89IHNjYWxlWSwgZCAvPSBzY2FsZVksIHNrZXdYIC89IHNjYWxlWTtcbiAgaWYgKGEgKiBkIDwgYiAqIGMpIGEgPSAtYSwgYiA9IC1iLCBza2V3WCA9IC1za2V3WCwgc2NhbGVYID0gLXNjYWxlWDtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2xhdGVYOiBlLFxuICAgIHRyYW5zbGF0ZVk6IGYsXG4gICAgcm90YXRlOiBNYXRoLmF0YW4yKGIsIGEpICogZGVncmVlcyxcbiAgICBza2V3WDogTWF0aC5hdGFuKHNrZXdYKSAqIGRlZ3JlZXMsXG4gICAgc2NhbGVYOiBzY2FsZVgsXG4gICAgc2NhbGVZOiBzY2FsZVlcbiAgfTtcbn1cbiIsICJpbXBvcnQgZGVjb21wb3NlLCB7aWRlbnRpdHl9IGZyb20gXCIuL2RlY29tcG9zZS5qc1wiO1xuXG52YXIgc3ZnTm9kZTtcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNzcyh2YWx1ZSkge1xuICBjb25zdCBtID0gbmV3ICh0eXBlb2YgRE9NTWF0cml4ID09PSBcImZ1bmN0aW9uXCIgPyBET01NYXRyaXggOiBXZWJLaXRDU1NNYXRyaXgpKHZhbHVlICsgXCJcIik7XG4gIHJldHVybiBtLmlzSWRlbnRpdHkgPyBpZGVudGl0eSA6IGRlY29tcG9zZShtLmEsIG0uYiwgbS5jLCBtLmQsIG0uZSwgbS5mKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3ZnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gaWRlbnRpdHk7XG4gIGlmICghc3ZnTm9kZSkgc3ZnTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZ1wiKTtcbiAgc3ZnTm9kZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdmFsdWUpO1xuICBpZiAoISh2YWx1ZSA9IHN2Z05vZGUudHJhbnNmb3JtLmJhc2VWYWwuY29uc29saWRhdGUoKSkpIHJldHVybiBpZGVudGl0eTtcbiAgdmFsdWUgPSB2YWx1ZS5tYXRyaXg7XG4gIHJldHVybiBkZWNvbXBvc2UodmFsdWUuYSwgdmFsdWUuYiwgdmFsdWUuYywgdmFsdWUuZCwgdmFsdWUuZSwgdmFsdWUuZik7XG59XG4iLCAiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsICJ2YXIgZnJhbWUgPSAwLCAvLyBpcyBhbiBhbmltYXRpb24gZnJhbWUgcGVuZGluZz9cbiAgICB0aW1lb3V0ID0gMCwgLy8gaXMgYSB0aW1lb3V0IHBlbmRpbmc/XG4gICAgaW50ZXJ2YWwgPSAwLCAvLyBhcmUgYW55IHRpbWVycyBhY3RpdmU/XG4gICAgcG9rZURlbGF5ID0gMTAwMCwgLy8gaG93IGZyZXF1ZW50bHkgd2UgY2hlY2sgZm9yIGNsb2NrIHNrZXdcbiAgICB0YXNrSGVhZCxcbiAgICB0YXNrVGFpbCxcbiAgICBjbG9ja0xhc3QgPSAwLFxuICAgIGNsb2NrTm93ID0gMCxcbiAgICBjbG9ja1NrZXcgPSAwLFxuICAgIGNsb2NrID0gdHlwZW9mIHBlcmZvcm1hbmNlID09PSBcIm9iamVjdFwiICYmIHBlcmZvcm1hbmNlLm5vdyA/IHBlcmZvcm1hbmNlIDogRGF0ZSxcbiAgICBzZXRGcmFtZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpIDogZnVuY3Rpb24oZikgeyBzZXRUaW1lb3V0KGYsIDE3KTsgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdygpIHtcbiAgcmV0dXJuIGNsb2NrTm93IHx8IChzZXRGcmFtZShjbGVhck5vdyksIGNsb2NrTm93ID0gY2xvY2subm93KCkgKyBjbG9ja1NrZXcpO1xufVxuXG5mdW5jdGlvbiBjbGVhck5vdygpIHtcbiAgY2xvY2tOb3cgPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVGltZXIoKSB7XG4gIHRoaXMuX2NhbGwgPVxuICB0aGlzLl90aW1lID1cbiAgdGhpcy5fbmV4dCA9IG51bGw7XG59XG5cblRpbWVyLnByb3RvdHlwZSA9IHRpbWVyLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRpbWVyLFxuICByZXN0YXJ0OiBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYWxsYmFjayBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICB0aW1lID0gKHRpbWUgPT0gbnVsbCA/IG5vdygpIDogK3RpbWUpICsgKGRlbGF5ID09IG51bGwgPyAwIDogK2RlbGF5KTtcbiAgICBpZiAoIXRoaXMuX25leHQgJiYgdGFza1RhaWwgIT09IHRoaXMpIHtcbiAgICAgIGlmICh0YXNrVGFpbCkgdGFza1RhaWwuX25leHQgPSB0aGlzO1xuICAgICAgZWxzZSB0YXNrSGVhZCA9IHRoaXM7XG4gICAgICB0YXNrVGFpbCA9IHRoaXM7XG4gICAgfVxuICAgIHRoaXMuX2NhbGwgPSBjYWxsYmFjaztcbiAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICBzbGVlcCgpO1xuICB9LFxuICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fY2FsbCkge1xuICAgICAgdGhpcy5fY2FsbCA9IG51bGw7XG4gICAgICB0aGlzLl90aW1lID0gSW5maW5pdHk7XG4gICAgICBzbGVlcCgpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVyKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgdC5yZXN0YXJ0KGNhbGxiYWNrLCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGltZXJGbHVzaCgpIHtcbiAgbm93KCk7IC8vIEdldCB0aGUgY3VycmVudCB0aW1lLCBpZiBub3QgYWxyZWFkeSBzZXQuXG4gICsrZnJhbWU7IC8vIFByZXRlbmQgd2VcdTIwMTl2ZSBzZXQgYW4gYWxhcm0sIGlmIHdlIGhhdmVuXHUyMDE5dCBhbHJlYWR5LlxuICB2YXIgdCA9IHRhc2tIZWFkLCBlO1xuICB3aGlsZSAodCkge1xuICAgIGlmICgoZSA9IGNsb2NrTm93IC0gdC5fdGltZSkgPj0gMCkgdC5fY2FsbC5jYWxsKHVuZGVmaW5lZCwgZSk7XG4gICAgdCA9IHQuX25leHQ7XG4gIH1cbiAgLS1mcmFtZTtcbn1cblxuZnVuY3Rpb24gd2FrZSgpIHtcbiAgY2xvY2tOb3cgPSAoY2xvY2tMYXN0ID0gY2xvY2subm93KCkpICsgY2xvY2tTa2V3O1xuICBmcmFtZSA9IHRpbWVvdXQgPSAwO1xuICB0cnkge1xuICAgIHRpbWVyRmx1c2goKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBmcmFtZSA9IDA7XG4gICAgbmFwKCk7XG4gICAgY2xvY2tOb3cgPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBva2UoKSB7XG4gIHZhciBub3cgPSBjbG9jay5ub3coKSwgZGVsYXkgPSBub3cgLSBjbG9ja0xhc3Q7XG4gIGlmIChkZWxheSA+IHBva2VEZWxheSkgY2xvY2tTa2V3IC09IGRlbGF5LCBjbG9ja0xhc3QgPSBub3c7XG59XG5cbmZ1bmN0aW9uIG5hcCgpIHtcbiAgdmFyIHQwLCB0MSA9IHRhc2tIZWFkLCB0MiwgdGltZSA9IEluZmluaXR5O1xuICB3aGlsZSAodDEpIHtcbiAgICBpZiAodDEuX2NhbGwpIHtcbiAgICAgIGlmICh0aW1lID4gdDEuX3RpbWUpIHRpbWUgPSB0MS5fdGltZTtcbiAgICAgIHQwID0gdDEsIHQxID0gdDEuX25leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHQyID0gdDEuX25leHQsIHQxLl9uZXh0ID0gbnVsbDtcbiAgICAgIHQxID0gdDAgPyB0MC5fbmV4dCA9IHQyIDogdGFza0hlYWQgPSB0MjtcbiAgICB9XG4gIH1cbiAgdGFza1RhaWwgPSB0MDtcbiAgc2xlZXAodGltZSk7XG59XG5cbmZ1bmN0aW9uIHNsZWVwKHRpbWUpIHtcbiAgaWYgKGZyYW1lKSByZXR1cm47IC8vIFNvb25lc3QgYWxhcm0gYWxyZWFkeSBzZXQsIG9yIHdpbGwgYmUuXG4gIGlmICh0aW1lb3V0KSB0aW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICB2YXIgZGVsYXkgPSB0aW1lIC0gY2xvY2tOb3c7IC8vIFN0cmljdGx5IGxlc3MgdGhhbiBpZiB3ZSByZWNvbXB1dGVkIGNsb2NrTm93LlxuICBpZiAoZGVsYXkgPiAyNCkge1xuICAgIGlmICh0aW1lIDwgSW5maW5pdHkpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KHdha2UsIHRpbWUgLSBjbG9jay5ub3coKSAtIGNsb2NrU2tldyk7XG4gICAgaWYgKGludGVydmFsKSBpbnRlcnZhbCA9IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICB9IGVsc2Uge1xuICAgIGlmICghaW50ZXJ2YWwpIGNsb2NrTGFzdCA9IGNsb2NrLm5vdygpLCBpbnRlcnZhbCA9IHNldEludGVydmFsKHBva2UsIHBva2VEZWxheSk7XG4gICAgZnJhbWUgPSAxLCBzZXRGcmFtZSh3YWtlKTtcbiAgfVxufVxuIiwgImltcG9ydCB7VGltZXJ9IGZyb20gXCIuL3RpbWVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgZGVsYXkgPSBkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheTtcbiAgdC5yZXN0YXJ0KGVsYXBzZWQgPT4ge1xuICAgIHQuc3RvcCgpO1xuICAgIGNhbGxiYWNrKGVsYXBzZWQgKyBkZWxheSk7XG4gIH0sIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG4iLCAiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge3RpbWVyLCB0aW1lb3V0fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGVtcHR5T24gPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiZW5kXCIsIFwiY2FuY2VsXCIsIFwiaW50ZXJydXB0XCIpO1xudmFyIGVtcHR5VHdlZW4gPSBbXTtcblxuZXhwb3J0IHZhciBDUkVBVEVEID0gMDtcbmV4cG9ydCB2YXIgU0NIRURVTEVEID0gMTtcbmV4cG9ydCB2YXIgU1RBUlRJTkcgPSAyO1xuZXhwb3J0IHZhciBTVEFSVEVEID0gMztcbmV4cG9ydCB2YXIgUlVOTklORyA9IDQ7XG5leHBvcnQgdmFyIEVORElORyA9IDU7XG5leHBvcnQgdmFyIEVOREVEID0gNjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSwgaWQsIGluZGV4LCBncm91cCwgdGltaW5nKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZXMpIG5vZGUuX190cmFuc2l0aW9uID0ge307XG4gIGVsc2UgaWYgKGlkIGluIHNjaGVkdWxlcykgcmV0dXJuO1xuICBjcmVhdGUobm9kZSwgaWQsIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGluZGV4OiBpbmRleCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIGdyb3VwOiBncm91cCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIG9uOiBlbXB0eU9uLFxuICAgIHR3ZWVuOiBlbXB0eVR3ZWVuLFxuICAgIHRpbWU6IHRpbWluZy50aW1lLFxuICAgIGRlbGF5OiB0aW1pbmcuZGVsYXksXG4gICAgZHVyYXRpb246IHRpbWluZy5kdXJhdGlvbixcbiAgICBlYXNlOiB0aW1pbmcuZWFzZSxcbiAgICB0aW1lcjogbnVsbCxcbiAgICBzdGF0ZTogQ1JFQVRFRFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gQ1JFQVRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgc2NoZWR1bGVkXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gU1RBUlRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgcnVubmluZ1wiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlIHx8ICEoc2NoZWR1bGUgPSBzY2hlZHVsZVtpZF0pKSB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2l0aW9uIG5vdCBmb3VuZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUobm9kZSwgaWQsIHNlbGYpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgdHdlZW47XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZiB0aW1lciB3aGVuIHRoZSB0cmFuc2l0aW9uIGlzIGNyZWF0ZWQuXG4gIC8vIE5vdGUgdGhlIGFjdHVhbCBkZWxheSBpcyBub3Qga25vd24gdW50aWwgdGhlIGZpcnN0IGNhbGxiYWNrIVxuICBzY2hlZHVsZXNbaWRdID0gc2VsZjtcbiAgc2VsZi50aW1lciA9IHRpbWVyKHNjaGVkdWxlLCAwLCBzZWxmLnRpbWUpO1xuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlKGVsYXBzZWQpIHtcbiAgICBzZWxmLnN0YXRlID0gU0NIRURVTEVEO1xuICAgIHNlbGYudGltZXIucmVzdGFydChzdGFydCwgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcblxuICAgIC8vIElmIHRoZSBlbGFwc2VkIGRlbGF5IGlzIGxlc3MgdGhhbiBvdXIgZmlyc3Qgc2xlZXAsIHN0YXJ0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzZWxmLmRlbGF5IDw9IGVsYXBzZWQpIHN0YXJ0KGVsYXBzZWQgLSBzZWxmLmRlbGF5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0KGVsYXBzZWQpIHtcbiAgICB2YXIgaSwgaiwgbiwgbztcblxuICAgIC8vIElmIHRoZSBzdGF0ZSBpcyBub3QgU0NIRURVTEVELCB0aGVuIHdlIHByZXZpb3VzbHkgZXJyb3JlZCBvbiBzdGFydC5cbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU0NIRURVTEVEKSByZXR1cm4gc3RvcCgpO1xuXG4gICAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgICAgbyA9IHNjaGVkdWxlc1tpXTtcbiAgICAgIGlmIChvLm5hbWUgIT09IHNlbGYubmFtZSkgY29udGludWU7XG5cbiAgICAgIC8vIFdoaWxlIHRoaXMgZWxlbWVudCBhbHJlYWR5IGhhcyBhIHN0YXJ0aW5nIHRyYW5zaXRpb24gZHVyaW5nIHRoaXMgZnJhbWUsXG4gICAgICAvLyBkZWZlciBzdGFydGluZyBhbiBpbnRlcnJ1cHRpbmcgdHJhbnNpdGlvbiB1bnRpbCB0aGF0IHRyYW5zaXRpb24gaGFzIGFcbiAgICAgIC8vIGNoYW5jZSB0byB0aWNrIChhbmQgcG9zc2libHkgZW5kKTsgc2VlIGQzL2QzLXRyYW5zaXRpb24jNTQhXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gU1RBUlRFRCkgcmV0dXJuIHRpbWVvdXQoc3RhcnQpO1xuXG4gICAgICAvLyBJbnRlcnJ1cHQgdGhlIGFjdGl2ZSB0cmFuc2l0aW9uLCBpZiBhbnkuXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gUlVOTklORykge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJpbnRlcnJ1cHRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG5cbiAgICAgIC8vIENhbmNlbCBhbnkgcHJlLWVtcHRlZCB0cmFuc2l0aW9ucy5cbiAgICAgIGVsc2UgaWYgKCtpIDwgaWQpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmVyIHRoZSBmaXJzdCB0aWNrIHRvIGVuZCBvZiB0aGUgY3VycmVudCBmcmFtZTsgc2VlIGQzL2QzIzE1NzYuXG4gICAgLy8gTm90ZSB0aGUgdHJhbnNpdGlvbiBtYXkgYmUgY2FuY2VsZWQgYWZ0ZXIgc3RhcnQgYW5kIGJlZm9yZSB0aGUgZmlyc3QgdGljayFcbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBzY2hlZHVsZWQgYmVmb3JlIHRoZSBzdGFydCBldmVudDsgc2VlIGQzL2QzLXRyYW5zaXRpb24jMTYhXG4gICAgLy8gQXNzdW1pbmcgdGhpcyBpcyBzdWNjZXNzZnVsLCBzdWJzZXF1ZW50IGNhbGxiYWNrcyBnbyBzdHJhaWdodCB0byB0aWNrLlxuICAgIHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gU1RBUlRFRCkge1xuICAgICAgICBzZWxmLnN0YXRlID0gUlVOTklORztcbiAgICAgICAgc2VsZi50aW1lci5yZXN0YXJ0KHRpY2ssIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG4gICAgICAgIHRpY2soZWxhcHNlZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgc3RhcnQgZXZlbnQuXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgZG9uZSBiZWZvcmUgdGhlIHR3ZWVuIGFyZSBpbml0aWFsaXplZC5cbiAgICBzZWxmLnN0YXRlID0gU1RBUlRJTkc7XG4gICAgc2VsZi5vbi5jYWxsKFwic3RhcnRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNUQVJUSU5HKSByZXR1cm47IC8vIGludGVycnVwdGVkXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJURUQ7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSB0d2VlbiwgZGVsZXRpbmcgbnVsbCB0d2Vlbi5cbiAgICB0d2VlbiA9IG5ldyBBcnJheShuID0gc2VsZi50d2Vlbi5sZW5ndGgpO1xuICAgIGZvciAoaSA9IDAsIGogPSAtMTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG8gPSBzZWxmLnR3ZWVuW2ldLnZhbHVlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCkpIHtcbiAgICAgICAgdHdlZW5bKytqXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIHR3ZWVuLmxlbmd0aCA9IGogKyAxO1xuICB9XG5cbiAgZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XG4gICAgdmFyIHQgPSBlbGFwc2VkIDwgc2VsZi5kdXJhdGlvbiA/IHNlbGYuZWFzZS5jYWxsKG51bGwsIGVsYXBzZWQgLyBzZWxmLmR1cmF0aW9uKSA6IChzZWxmLnRpbWVyLnJlc3RhcnQoc3RvcCksIHNlbGYuc3RhdGUgPSBFTkRJTkcsIDEpLFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSB0d2Vlbi5sZW5ndGg7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgdHdlZW5baV0uY2FsbChub2RlLCB0KTtcbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgZW5kIGV2ZW50LlxuICAgIGlmIChzZWxmLnN0YXRlID09PSBFTkRJTkcpIHtcbiAgICAgIHNlbGYub24uY2FsbChcImVuZFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICAgIHN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wKCkge1xuICAgIHNlbGYuc3RhdGUgPSBFTkRFRDtcbiAgICBzZWxmLnRpbWVyLnN0b3AoKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2lkXTtcbiAgICBmb3IgKHZhciBpIGluIHNjaGVkdWxlcykgcmV0dXJuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xuICB9XG59XG4iLCAiaW1wb3J0IHtTVEFSVElORywgRU5ESU5HLCBFTkRFRH0gZnJvbSBcIi4vdHJhbnNpdGlvbi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHNjaGVkdWxlLFxuICAgICAgYWN0aXZlLFxuICAgICAgZW1wdHkgPSB0cnVlLFxuICAgICAgaTtcblxuICBpZiAoIXNjaGVkdWxlcykgcmV0dXJuO1xuXG4gIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG5cbiAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgIGlmICgoc2NoZWR1bGUgPSBzY2hlZHVsZXNbaV0pLm5hbWUgIT09IG5hbWUpIHsgZW1wdHkgPSBmYWxzZTsgY29udGludWU7IH1cbiAgICBhY3RpdmUgPSBzY2hlZHVsZS5zdGF0ZSA+IFNUQVJUSU5HICYmIHNjaGVkdWxlLnN0YXRlIDwgRU5ESU5HO1xuICAgIHNjaGVkdWxlLnN0YXRlID0gRU5ERUQ7XG4gICAgc2NoZWR1bGUudGltZXIuc3RvcCgpO1xuICAgIHNjaGVkdWxlLm9uLmNhbGwoYWN0aXZlID8gXCJpbnRlcnJ1cHRcIiA6IFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNjaGVkdWxlLmluZGV4LCBzY2hlZHVsZS5ncm91cCk7XG4gICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgfVxuXG4gIGlmIChlbXB0eSkgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xufVxuIiwgImltcG9ydCBpbnRlcnJ1cHQgZnJvbSBcIi4uL2ludGVycnVwdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgaW50ZXJydXB0KHRoaXMsIG5hbWUpO1xuICB9KTtcbn1cbiIsICJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiB0d2VlblJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2VcdTIwMTlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gdHdlZW4wID0gdHdlZW47XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xID0gdHdlZW4xLnNsaWNlKCk7XG4gICAgICAgICAgdHdlZW4xLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0d2VlbkZ1bmN0aW9uKGlkLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9ICh0d2VlbjAgPSB0d2Vlbikuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIHQgPSB7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSwgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMVtpXSA9IHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBuKSB0d2VlbjEucHVzaCh0KTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgbmFtZSArPSBcIlwiO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciB0d2VlbiA9IGdldCh0aGlzLm5vZGUoKSwgaWQpLnR3ZWVuO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4ubGVuZ3RoLCB0OyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKHQgPSB0d2VlbltpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsID8gdHdlZW5SZW1vdmUgOiB0d2VlbkZ1bmN0aW9uKShpZCwgbmFtZSwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR3ZWVuVmFsdWUodHJhbnNpdGlvbiwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdHJhbnNpdGlvbi5faWQ7XG5cbiAgdHJhbnNpdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCk7XG4gICAgKHNjaGVkdWxlLnZhbHVlIHx8IChzY2hlZHVsZS52YWx1ZSA9IHt9KSlbbmFtZV0gPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBnZXQobm9kZSwgaWQpLnZhbHVlW25hbWVdO1xuICB9O1xufVxuIiwgImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSZ2IsIGludGVycG9sYXRlU3RyaW5nfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYztcbiAgcmV0dXJuICh0eXBlb2YgYiA9PT0gXCJudW1iZXJcIiA/IGludGVycG9sYXRlTnVtYmVyXG4gICAgICA6IGIgaW5zdGFuY2VvZiBjb2xvciA/IGludGVycG9sYXRlUmdiXG4gICAgICA6IChjID0gY29sb3IoYikpID8gKGIgPSBjLCBpbnRlcnBvbGF0ZVJnYilcbiAgICAgIDogaW50ZXJwb2xhdGVTdHJpbmcpKGEsIGIpO1xufVxuIiwgImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCBpbnRlcnBvbGF0ZSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpLCBpID0gZnVsbG5hbWUgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdGhpcy5hdHRyVHdlZW4obmFtZSwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pKGZ1bGxuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwiYXR0ci5cIiArIG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdmFsdWUgPT0gbnVsbCA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpKGZ1bGxuYW1lKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkoZnVsbG5hbWUsIGksIHZhbHVlKSk7XG59XG4iLCAiaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlKG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW5OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2VlbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGtleSA9IFwiYXR0ci5cIiArIG5hbWU7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIChmdWxsbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge2dldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZGVsYXlGdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlbGF5Q29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZGVsYXlGdW5jdGlvblxuICAgICAgICAgIDogZGVsYXlDb25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZGVsYXk7XG59XG4iLCAiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZHVyYXRpb25GdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHVyYXRpb25Db25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGR1cmF0aW9uRnVuY3Rpb25cbiAgICAgICAgICA6IGR1cmF0aW9uQ29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmR1cmF0aW9uO1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKGVhc2VDb25zdGFudChpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5lYXNlO1xufVxuIiwgImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBlYXNlVmFyeWluZyhpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIHYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy5lYWNoKGVhc2VWYXJ5aW5nKHRoaXMuX2lkLCB2YWx1ZSkpO1xufVxuIiwgImltcG9ydCB7bWF0Y2hlcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwgImltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNpdGlvbikge1xuICBpZiAodHJhbnNpdGlvbi5faWQgIT09IHRoaXMuX2lkKSB0aHJvdyBuZXcgRXJyb3I7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHRyYW5zaXRpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwgImltcG9ydCB7Z2V0LCBzZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0YXJ0KG5hbWUpIHtcbiAgcmV0dXJuIChuYW1lICsgXCJcIikudHJpbSgpLnNwbGl0KC9efFxccysvKS5ldmVyeShmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiAhdCB8fCB0ID09PSBcInN0YXJ0XCI7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgb24wLCBvbjEsIHNpdCA9IHN0YXJ0KG5hbWUpID8gaW5pdCA6IHNldDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNpdCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjApIChvbjEgPSAob24wID0gb24pLmNvcHkoKSkub24obmFtZSwgbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMlxuICAgICAgPyBnZXQodGhpcy5ub2RlKCksIGlkKS5vbi5vbihuYW1lKVxuICAgICAgOiB0aGlzLmVhY2gob25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpKTtcbn1cbiIsICJmdW5jdGlvbiByZW1vdmVGdW5jdGlvbihpZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX190cmFuc2l0aW9uKSBpZiAoK2kgIT09IGlkKSByZXR1cm47XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub24oXCJlbmQucmVtb3ZlXCIsIHJlbW92ZUZ1bmN0aW9uKHRoaXMuX2lkKSk7XG59XG4iLCAiaW1wb3J0IHtzZWxlY3Rvcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgICAgc2NoZWR1bGUoc3ViZ3JvdXBbaV0sIG5hbWUsIGlkLCBpLCBzdWJncm91cCwgZ2V0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0b3JBbGx9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkID0gdGhpcy5faWQ7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBmb3IgKHZhciBjaGlsZHJlbiA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSwgY2hpbGQsIGluaGVyaXQgPSBnZXQobm9kZSwgaWQpLCBrID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgayA8IGw7ICsraykge1xuICAgICAgICAgIGlmIChjaGlsZCA9IGNoaWxkcmVuW2tdKSB7XG4gICAgICAgICAgICBzY2hlZHVsZShjaGlsZCwgbmFtZSwgaWQsIGssIGNoaWxkcmVuLCBpbmhlcml0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goY2hpbGRyZW4pO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbnZhciBTZWxlY3Rpb24gPSBzZWxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsICJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtQ3NzIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7c3R5bGV9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlTnVsbChuYW1lLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHN0cmluZzEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCBzdHJpbmcxMCA9IHN0cmluZzEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHZhbHVlMSA9IHZhbHVlKHRoaXMpLFxuICAgICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHN0cmluZzEgPSB2YWx1ZTEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVNYXliZVJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgb24wLCBvbjEsIGxpc3RlbmVyMCwga2V5ID0gXCJzdHlsZS5cIiArIG5hbWUsIGV2ZW50ID0gXCJlbmQuXCIgKyBrZXksIHJlbW92ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub24sXG4gICAgICAgIGxpc3RlbmVyID0gc2NoZWR1bGUudmFsdWVba2V5XSA9PSBudWxsID8gcmVtb3ZlIHx8IChyZW1vdmUgPSBzdHlsZVJlbW92ZShuYW1lKSkgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdlXHUyMDE5cmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjAgfHwgbGlzdGVuZXIwICE9PSBsaXN0ZW5lcikgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihldmVudCwgbGlzdGVuZXIwID0gbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgaSA9IChuYW1lICs9IFwiXCIpID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZU51bGwobmFtZSwgaSkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBzdHlsZVJlbW92ZShuYW1lKSlcbiAgICA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVGdW5jdGlvbihuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwic3R5bGUuXCIgKyBuYW1lLCB2YWx1ZSkpKVxuICAgICAgLmVhY2goc3R5bGVNYXliZVJlbW92ZSh0aGlzLl9pZCwgbmFtZSkpXG4gICAgOiB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUNvbnN0YW50KG5hbWUsIGksIHZhbHVlKSwgcHJpb3JpdHkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBudWxsKTtcbn1cbiIsICJmdW5jdGlvbiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCBpLmNhbGwodGhpcywgdCksIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIHQsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0ID0gKGkwID0gaSkgJiYgc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSk7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBrZXkgPSBcInN0eWxlLlwiICsgKG5hbWUgKz0gXCJcIik7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSk7XG59XG4iLCAiaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUxID0gdmFsdWUodGhpcyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlMSA9PSBudWxsID8gXCJcIiA6IHZhbHVlMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMudHdlZW4oXCJ0ZXh0XCIsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHRleHRGdW5jdGlvbih0d2VlblZhbHVlKHRoaXMsIFwidGV4dFwiLCB2YWx1ZSkpXG4gICAgICA6IHRleHRDb25zdGFudCh2YWx1ZSA9PSBudWxsID8gXCJcIiA6IHZhbHVlICsgXCJcIikpO1xufVxuIiwgImZ1bmN0aW9uIHRleHRJbnRlcnBvbGF0ZShpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IGkuY2FsbCh0aGlzLCB0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dFR3ZWVuKHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgdGV4dEludGVycG9sYXRlKGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJ0ZXh0XCI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCB0ZXh0VHdlZW4odmFsdWUpKTtcbn1cbiIsICJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQwID0gdGhpcy5faWQsXG4gICAgICBpZDEgPSBuZXdJZCgpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHZhciBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkMCk7XG4gICAgICAgIHNjaGVkdWxlKG5vZGUsIG5hbWUsIGlkMSwgaSwgZ3JvdXAsIHtcbiAgICAgICAgICB0aW1lOiBpbmhlcml0LnRpbWUgKyBpbmhlcml0LmRlbGF5ICsgaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgICBkdXJhdGlvbjogaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBlYXNlOiBpbmhlcml0LmVhc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQxKTtcbn1cbiIsICJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBvbjAsIG9uMSwgdGhhdCA9IHRoaXMsIGlkID0gdGhhdC5faWQsIHNpemUgPSB0aGF0LnNpemUoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBjYW5jZWwgPSB7dmFsdWU6IHJlamVjdH0sXG4gICAgICAgIGVuZCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7IGlmICgtLXNpemUgPT09IDApIHJlc29sdmUoKTsgfX07XG5cbiAgICB0aGF0LmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZVx1MjAxOXJlIGRvbmUhXG4gICAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgICBpZiAob24gIT09IG9uMCkge1xuICAgICAgICBvbjEgPSAob24wID0gb24pLmNvcHkoKTtcbiAgICAgICAgb24xLl8uY2FuY2VsLnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uaW50ZXJydXB0LnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uZW5kLnB1c2goZW5kKTtcbiAgICAgIH1cblxuICAgICAgc2NoZWR1bGUub24gPSBvbjE7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgc2VsZWN0aW9uIHdhcyBlbXB0eSwgcmVzb2x2ZSBlbmQgaW1tZWRpYXRlbHlcbiAgICBpZiAoc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpO1xuICB9KTtcbn1cbiIsICJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyVHdlZW4gZnJvbSBcIi4vYXR0clR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kZWxheSBmcm9tIFwiLi9kZWxheS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZHVyYXRpb24gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2UgZnJvbSBcIi4vZWFzZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcgZnJvbSBcIi4vZWFzZVZhcnlpbmcuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0aW9uIGZyb20gXCIuL3NlbGVjdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlVHdlZW4gZnJvbSBcIi4vc3R5bGVUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0VHdlZW4gZnJvbSBcIi4vdGV4dFR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3R3ZWVuIGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lbmQgZnJvbSBcIi4vZW5kLmpzXCI7XG5cbnZhciBpZCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBUcmFuc2l0aW9uKGdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbiAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gIHRoaXMuX2lkID0gaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zaXRpb24obmFtZSkge1xuICByZXR1cm4gc2VsZWN0aW9uKCkudHJhbnNpdGlvbihuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld0lkKCkge1xuICByZXR1cm4gKytpZDtcbn1cblxudmFyIHNlbGVjdGlvbl9wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlO1xuXG5UcmFuc2l0aW9uLnByb3RvdHlwZSA9IHRyYW5zaXRpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNpdGlvbixcbiAgc2VsZWN0OiB0cmFuc2l0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiB0cmFuc2l0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHRyYW5zaXRpb25fZmlsdGVyLFxuICBtZXJnZTogdHJhbnNpdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiB0cmFuc2l0aW9uX3NlbGVjdGlvbixcbiAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbl90cmFuc2l0aW9uLFxuICBjYWxsOiBzZWxlY3Rpb25fcHJvdG90eXBlLmNhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9wcm90b3R5cGUuZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9wcm90b3R5cGUuZWFjaCxcbiAgb246IHRyYW5zaXRpb25fb24sXG4gIGF0dHI6IHRyYW5zaXRpb25fYXR0cixcbiAgYXR0clR3ZWVuOiB0cmFuc2l0aW9uX2F0dHJUd2VlbixcbiAgc3R5bGU6IHRyYW5zaXRpb25fc3R5bGUsXG4gIHN0eWxlVHdlZW46IHRyYW5zaXRpb25fc3R5bGVUd2VlbixcbiAgdGV4dDogdHJhbnNpdGlvbl90ZXh0LFxuICB0ZXh0VHdlZW46IHRyYW5zaXRpb25fdGV4dFR3ZWVuLFxuICByZW1vdmU6IHRyYW5zaXRpb25fcmVtb3ZlLFxuICB0d2VlbjogdHJhbnNpdGlvbl90d2VlbixcbiAgZGVsYXk6IHRyYW5zaXRpb25fZGVsYXksXG4gIGR1cmF0aW9uOiB0cmFuc2l0aW9uX2R1cmF0aW9uLFxuICBlYXNlOiB0cmFuc2l0aW9uX2Vhc2UsXG4gIGVhc2VWYXJ5aW5nOiB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nLFxuICBlbmQ6IHRyYW5zaXRpb25fZW5kLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX3Byb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdXG59O1xuIiwgImV4cG9ydCBmdW5jdGlvbiBjdWJpY0luKHQpIHtcbiAgcmV0dXJuIHQgKiB0ICogdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1YmljT3V0KHQpIHtcbiAgcmV0dXJuIC0tdCAqIHQgKiB0ICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyB0ICogdCAqIHQgOiAodCAtPSAyKSAqIHQgKiB0ICsgMikgLyAyO1xufVxuIiwgImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuLi90cmFuc2l0aW9uL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUgZnJvbSBcIi4uL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7ZWFzZUN1YmljSW5PdXR9IGZyb20gXCJkMy1lYXNlXCI7XG5pbXBvcnQge25vd30gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBkZWZhdWx0VGltaW5nID0ge1xuICB0aW1lOiBudWxsLCAvLyBTZXQgb24gdXNlLlxuICBkZWxheTogMCxcbiAgZHVyYXRpb246IDI1MCxcbiAgZWFzZTogZWFzZUN1YmljSW5PdXRcbn07XG5cbmZ1bmN0aW9uIGluaGVyaXQobm9kZSwgaWQpIHtcbiAgdmFyIHRpbWluZztcbiAgd2hpbGUgKCEodGltaW5nID0gbm9kZS5fX3RyYW5zaXRpb24pIHx8ICEodGltaW5nID0gdGltaW5nW2lkXSkpIHtcbiAgICBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0cmFuc2l0aW9uICR7aWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGltaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBpZCxcbiAgICAgIHRpbWluZztcblxuICBpZiAobmFtZSBpbnN0YW5jZW9mIFRyYW5zaXRpb24pIHtcbiAgICBpZCA9IG5hbWUuX2lkLCBuYW1lID0gbmFtZS5fbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZCA9IG5ld0lkKCksICh0aW1pbmcgPSBkZWZhdWx0VGltaW5nKS50aW1lID0gbm93KCksIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZCwgaSwgZ3JvdXAsIHRpbWluZyB8fCBpbmhlcml0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ludGVycnVwdCBmcm9tIFwiLi9pbnRlcnJ1cHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5cbnNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJydXB0ID0gc2VsZWN0aW9uX2ludGVycnVwdDtcbnNlbGVjdGlvbi5wcm90b3R5cGUudHJhbnNpdGlvbiA9IHNlbGVjdGlvbl90cmFuc2l0aW9uO1xuIiwgImltcG9ydCB7ZGlzcGF0Y2h9IGZyb20gXCJkMy1kaXNwYXRjaFwiO1xuaW1wb3J0IHtkcmFnRGlzYWJsZSwgZHJhZ0VuYWJsZX0gZnJvbSBcImQzLWRyYWdcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGV9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtwb2ludGVyLCBzZWxlY3R9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7aW50ZXJydXB0fSBmcm9tIFwiZDMtdHJhbnNpdGlvblwiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgQnJ1c2hFdmVudCBmcm9tIFwiLi9ldmVudC5qc1wiO1xuaW1wb3J0IG5vZXZlbnQsIHtub3Byb3BhZ2F0aW9ufSBmcm9tIFwiLi9ub2V2ZW50LmpzXCI7XG5cbnZhciBNT0RFX0RSQUcgPSB7bmFtZTogXCJkcmFnXCJ9LFxuICAgIE1PREVfU1BBQ0UgPSB7bmFtZTogXCJzcGFjZVwifSxcbiAgICBNT0RFX0hBTkRMRSA9IHtuYW1lOiBcImhhbmRsZVwifSxcbiAgICBNT0RFX0NFTlRFUiA9IHtuYW1lOiBcImNlbnRlclwifTtcblxuY29uc3Qge2FicywgbWF4LCBtaW59ID0gTWF0aDtcblxuZnVuY3Rpb24gbnVtYmVyMShlKSB7XG4gIHJldHVybiBbK2VbMF0sICtlWzFdXTtcbn1cblxuZnVuY3Rpb24gbnVtYmVyMihlKSB7XG4gIHJldHVybiBbbnVtYmVyMShlWzBdKSwgbnVtYmVyMShlWzFdKV07XG59XG5cbnZhciBYID0ge1xuICBuYW1lOiBcInhcIixcbiAgaGFuZGxlczogW1wid1wiLCBcImVcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeCwgZSkgeyByZXR1cm4geCA9PSBudWxsID8gbnVsbCA6IFtbK3hbMF0sIGVbMF1bMV1dLCBbK3hbMV0sIGVbMV1bMV1dXTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgJiYgW3h5WzBdWzBdLCB4eVsxXVswXV07IH1cbn07XG5cbnZhciBZID0ge1xuICBuYW1lOiBcInlcIixcbiAgaGFuZGxlczogW1wiblwiLCBcInNcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeSwgZSkgeyByZXR1cm4geSA9PSBudWxsID8gbnVsbCA6IFtbZVswXVswXSwgK3lbMF1dLCBbZVsxXVswXSwgK3lbMV1dXTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgJiYgW3h5WzBdWzFdLCB4eVsxXVsxXV07IH1cbn07XG5cbnZhciBYWSA9IHtcbiAgbmFtZTogXCJ4eVwiLFxuICBoYW5kbGVzOiBbXCJuXCIsIFwid1wiLCBcImVcIiwgXCJzXCIsIFwibndcIiwgXCJuZVwiLCBcInN3XCIsIFwic2VcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ID09IG51bGwgPyBudWxsIDogbnVtYmVyMih4eSk7IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5OyB9XG59O1xuXG52YXIgY3Vyc29ycyA9IHtcbiAgb3ZlcmxheTogXCJjcm9zc2hhaXJcIixcbiAgc2VsZWN0aW9uOiBcIm1vdmVcIixcbiAgbjogXCJucy1yZXNpemVcIixcbiAgZTogXCJldy1yZXNpemVcIixcbiAgczogXCJucy1yZXNpemVcIixcbiAgdzogXCJldy1yZXNpemVcIixcbiAgbnc6IFwibndzZS1yZXNpemVcIixcbiAgbmU6IFwibmVzdy1yZXNpemVcIixcbiAgc2U6IFwibndzZS1yZXNpemVcIixcbiAgc3c6IFwibmVzdy1yZXNpemVcIlxufTtcblxudmFyIGZsaXBYID0ge1xuICBlOiBcIndcIixcbiAgdzogXCJlXCIsXG4gIG53OiBcIm5lXCIsXG4gIG5lOiBcIm53XCIsXG4gIHNlOiBcInN3XCIsXG4gIHN3OiBcInNlXCJcbn07XG5cbnZhciBmbGlwWSA9IHtcbiAgbjogXCJzXCIsXG4gIHM6IFwiblwiLFxuICBudzogXCJzd1wiLFxuICBuZTogXCJzZVwiLFxuICBzZTogXCJuZVwiLFxuICBzdzogXCJud1wiXG59O1xuXG52YXIgc2lnbnNYID0ge1xuICBvdmVybGF5OiArMSxcbiAgc2VsZWN0aW9uOiArMSxcbiAgbjogbnVsbCxcbiAgZTogKzEsXG4gIHM6IG51bGwsXG4gIHc6IC0xLFxuICBudzogLTEsXG4gIG5lOiArMSxcbiAgc2U6ICsxLFxuICBzdzogLTFcbn07XG5cbnZhciBzaWduc1kgPSB7XG4gIG92ZXJsYXk6ICsxLFxuICBzZWxlY3Rpb246ICsxLFxuICBuOiAtMSxcbiAgZTogbnVsbCxcbiAgczogKzEsXG4gIHc6IG51bGwsXG4gIG53OiAtMSxcbiAgbmU6IC0xLFxuICBzZTogKzEsXG4gIHN3OiArMVxufTtcblxuZnVuY3Rpb24gdHlwZSh0KSB7XG4gIHJldHVybiB7dHlwZTogdH07XG59XG5cbi8vIElnbm9yZSByaWdodC1jbGljaywgc2luY2UgdGhhdCBzaG91bGQgb3BlbiB0aGUgY29udGV4dCBtZW51LlxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlcihldmVudCkge1xuICByZXR1cm4gIWV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LmJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdEV4dGVudCgpIHtcbiAgdmFyIHN2ZyA9IHRoaXMub3duZXJTVkdFbGVtZW50IHx8IHRoaXM7XG4gIGlmIChzdmcuaGFzQXR0cmlidXRlKFwidmlld0JveFwiKSkge1xuICAgIHN2ZyA9IHN2Zy52aWV3Qm94LmJhc2VWYWw7XG4gICAgcmV0dXJuIFtbc3ZnLngsIHN2Zy55XSwgW3N2Zy54ICsgc3ZnLndpZHRoLCBzdmcueSArIHN2Zy5oZWlnaHRdXTtcbiAgfVxuICByZXR1cm4gW1swLCAwXSwgW3N2Zy53aWR0aC5iYXNlVmFsLnZhbHVlLCBzdmcuaGVpZ2h0LmJhc2VWYWwudmFsdWVdXTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFRvdWNoYWJsZSgpIHtcbiAgcmV0dXJuIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyB8fCAoXCJvbnRvdWNoc3RhcnRcIiBpbiB0aGlzKTtcbn1cblxuLy8gTGlrZSBkMy5sb2NhbCwgYnV0IHdpdGggdGhlIG5hbWUgXHUyMDFDX19icnVzaFx1MjAxRCByYXRoZXIgdGhhbiBhdXRvLWdlbmVyYXRlZC5cbmZ1bmN0aW9uIGxvY2FsKG5vZGUpIHtcbiAgd2hpbGUgKCFub2RlLl9fYnJ1c2gpIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm47XG4gIHJldHVybiBub2RlLl9fYnJ1c2g7XG59XG5cbmZ1bmN0aW9uIGVtcHR5KGV4dGVudCkge1xuICByZXR1cm4gZXh0ZW50WzBdWzBdID09PSBleHRlbnRbMV1bMF1cbiAgICAgIHx8IGV4dGVudFswXVsxXSA9PT0gZXh0ZW50WzFdWzFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hTZWxlY3Rpb24obm9kZSkge1xuICB2YXIgc3RhdGUgPSBub2RlLl9fYnJ1c2g7XG4gIHJldHVybiBzdGF0ZSA/IHN0YXRlLmRpbS5vdXRwdXQoc3RhdGUuc2VsZWN0aW9uKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFgoKSB7XG4gIHJldHVybiBicnVzaChYKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoWSgpIHtcbiAgcmV0dXJuIGJydXNoKFkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGJydXNoKFhZKTtcbn1cblxuZnVuY3Rpb24gYnJ1c2goZGltKSB7XG4gIHZhciBleHRlbnQgPSBkZWZhdWx0RXh0ZW50LFxuICAgICAgZmlsdGVyID0gZGVmYXVsdEZpbHRlcixcbiAgICAgIHRvdWNoYWJsZSA9IGRlZmF1bHRUb3VjaGFibGUsXG4gICAgICBrZXlzID0gdHJ1ZSxcbiAgICAgIGxpc3RlbmVycyA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJicnVzaFwiLCBcImVuZFwiKSxcbiAgICAgIGhhbmRsZVNpemUgPSA2LFxuICAgICAgdG91Y2hlbmRpbmc7XG5cbiAgZnVuY3Rpb24gYnJ1c2goZ3JvdXApIHtcbiAgICB2YXIgb3ZlcmxheSA9IGdyb3VwXG4gICAgICAgIC5wcm9wZXJ0eShcIl9fYnJ1c2hcIiwgaW5pdGlhbGl6ZSlcbiAgICAgIC5zZWxlY3RBbGwoXCIub3ZlcmxheVwiKVxuICAgICAgLmRhdGEoW3R5cGUoXCJvdmVybGF5XCIpXSk7XG5cbiAgICBvdmVybGF5LmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwib3ZlcmxheVwiKVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMub3ZlcmxheSlcbiAgICAgIC5tZXJnZShvdmVybGF5KVxuICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXh0ZW50ID0gbG9jYWwodGhpcykuZXh0ZW50O1xuICAgICAgICAgIHNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAuYXR0cihcInhcIiwgZXh0ZW50WzBdWzBdKVxuICAgICAgICAgICAgICAuYXR0cihcInlcIiwgZXh0ZW50WzBdWzFdKVxuICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGV4dGVudFsxXVswXSAtIGV4dGVudFswXVswXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZXh0ZW50WzFdWzFdIC0gZXh0ZW50WzBdWzFdKTtcbiAgICAgICAgfSk7XG5cbiAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uXCIpXG4gICAgICAuZGF0YShbdHlwZShcInNlbGVjdGlvblwiKV0pXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJzZWxlY3Rpb25cIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5zZWxlY3Rpb24pXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM3NzdcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsLW9wYWNpdHlcIiwgMC4zKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIiNmZmZcIilcbiAgICAgICAgLmF0dHIoXCJzaGFwZS1yZW5kZXJpbmdcIiwgXCJjcmlzcEVkZ2VzXCIpO1xuXG4gICAgdmFyIGhhbmRsZSA9IGdyb3VwLnNlbGVjdEFsbChcIi5oYW5kbGVcIilcbiAgICAgIC5kYXRhKGRpbS5oYW5kbGVzLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGU7IH0pO1xuXG4gICAgaGFuZGxlLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgIGhhbmRsZS5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcImhhbmRsZSBoYW5kbGUtLVwiICsgZC50eXBlOyB9KVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBjdXJzb3JzW2QudHlwZV07IH0pO1xuXG4gICAgZ3JvdXBcbiAgICAgICAgLmVhY2gocmVkcmF3KVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIilcbiAgICAgICAgLm9uKFwibW91c2Vkb3duLmJydXNoXCIsIHN0YXJ0ZWQpXG4gICAgICAuZmlsdGVyKHRvdWNoYWJsZSlcbiAgICAgICAgLm9uKFwidG91Y2hzdGFydC5icnVzaFwiLCBzdGFydGVkKVxuICAgICAgICAub24oXCJ0b3VjaG1vdmUuYnJ1c2hcIiwgdG91Y2htb3ZlZClcbiAgICAgICAgLm9uKFwidG91Y2hlbmQuYnJ1c2ggdG91Y2hjYW5jZWwuYnJ1c2hcIiwgdG91Y2hlbmRlZClcbiAgICAgICAgLnN0eWxlKFwidG91Y2gtYWN0aW9uXCIsIFwibm9uZVwiKVxuICAgICAgICAuc3R5bGUoXCItd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3JcIiwgXCJyZ2JhKDAsMCwwLDApXCIpO1xuICB9XG5cbiAgYnJ1c2gubW92ZSA9IGZ1bmN0aW9uKGdyb3VwLCBzZWxlY3Rpb24sIGV2ZW50KSB7XG4gICAgaWYgKGdyb3VwLnR3ZWVuKSB7XG4gICAgICBncm91cFxuICAgICAgICAgIC5vbihcInN0YXJ0LmJydXNoXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5iZWZvcmVzdGFydCgpLnN0YXJ0KGV2ZW50KTsgfSlcbiAgICAgICAgICAub24oXCJpbnRlcnJ1cHQuYnJ1c2ggZW5kLmJydXNoXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5lbmQoZXZlbnQpOyB9KVxuICAgICAgICAgIC50d2VlbihcImJydXNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gdGhhdC5fX2JydXNoLFxuICAgICAgICAgICAgICAgIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMCA9IHN0YXRlLnNlbGVjdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24xID0gZGltLmlucHV0KHR5cGVvZiBzZWxlY3Rpb24gPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc2VsZWN0aW9uLCBzdGF0ZS5leHRlbnQpLFxuICAgICAgICAgICAgICAgIGkgPSBpbnRlcnBvbGF0ZShzZWxlY3Rpb24wLCBzZWxlY3Rpb24xKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdHdlZW4odCkge1xuICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSB0ID09PSAxICYmIHNlbGVjdGlvbjEgPT09IG51bGwgPyBudWxsIDogaSh0KTtcbiAgICAgICAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgICAgICAgIGVtaXQuYnJ1c2goKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjAgIT09IG51bGwgJiYgc2VsZWN0aW9uMSAhPT0gbnVsbCA/IHR3ZWVuIDogdHdlZW4oMSk7XG4gICAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwXG4gICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHRoYXQuX19icnVzaCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24xID0gZGltLmlucHV0KHR5cGVvZiBzZWxlY3Rpb24gPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdGlvbi5hcHBseSh0aGF0LCBhcmdzKSA6IHNlbGVjdGlvbiwgc3RhdGUuZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmdzKS5iZWZvcmVzdGFydCgpO1xuXG4gICAgICAgICAgICBpbnRlcnJ1cHQodGhhdCk7XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBzZWxlY3Rpb24xID09PSBudWxsID8gbnVsbCA6IHNlbGVjdGlvbjE7XG4gICAgICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgICAgIGVtaXQuc3RhcnQoZXZlbnQpLmJydXNoKGV2ZW50KS5lbmQoZXZlbnQpO1xuICAgICAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBicnVzaC5jbGVhciA9IGZ1bmN0aW9uKGdyb3VwLCBldmVudCkge1xuICAgIGJydXNoLm1vdmUoZ3JvdXAsIG51bGwsIGV2ZW50KTtcbiAgfTtcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdmFyIGdyb3VwID0gc2VsZWN0KHRoaXMpLFxuICAgICAgICBzZWxlY3Rpb24gPSBsb2NhbCh0aGlzKS5zZWxlY3Rpb247XG5cbiAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBzZWxlY3Rpb25bMF1bMF0pXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIHNlbGVjdGlvblswXVsxXSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHNlbGVjdGlvblsxXVswXSAtIHNlbGVjdGlvblswXVswXSlcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBzZWxlY3Rpb25bMV1bMV0gLSBzZWxlY3Rpb25bMF1bMV0pO1xuXG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuaGFuZGxlXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGVbZC50eXBlLmxlbmd0aCAtIDFdID09PSBcImVcIiA/IHNlbGVjdGlvblsxXVswXSAtIGhhbmRsZVNpemUgLyAyIDogc2VsZWN0aW9uWzBdWzBdIC0gaGFuZGxlU2l6ZSAvIDI7IH0pXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZVswXSA9PT0gXCJzXCIgPyBzZWxlY3Rpb25bMV1bMV0gLSBoYW5kbGVTaXplIC8gMiA6IHNlbGVjdGlvblswXVsxXSAtIGhhbmRsZVNpemUgLyAyOyB9KVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlID09PSBcIm5cIiB8fCBkLnR5cGUgPT09IFwic1wiID8gc2VsZWN0aW9uWzFdWzBdIC0gc2VsZWN0aW9uWzBdWzBdICsgaGFuZGxlU2l6ZSA6IGhhbmRsZVNpemU7IH0pXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlID09PSBcImVcIiB8fCBkLnR5cGUgPT09IFwid1wiID8gc2VsZWN0aW9uWzFdWzFdIC0gc2VsZWN0aW9uWzBdWzFdICsgaGFuZGxlU2l6ZSA6IGhhbmRsZVNpemU7IH0pO1xuICAgIH1cblxuICAgIGVsc2Uge1xuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvbiwuaGFuZGxlXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHZhciBlbWl0ID0gdGhhdC5fX2JydXNoLmVtaXR0ZXI7XG4gICAgcmV0dXJuIGVtaXQgJiYgKCFjbGVhbiB8fCAhZW1pdC5jbGVhbikgPyBlbWl0IDogbmV3IEVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gRW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHRoaXMudGhhdCA9IHRoYXQ7XG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICB0aGlzLnN0YXRlID0gdGhhdC5fX2JydXNoO1xuICAgIHRoaXMuYWN0aXZlID0gMDtcbiAgICB0aGlzLmNsZWFuID0gY2xlYW47XG4gIH1cblxuICBFbWl0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBiZWZvcmVzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoKyt0aGlzLmFjdGl2ZSA9PT0gMSkgdGhpcy5zdGF0ZS5lbWl0dGVyID0gdGhpcywgdGhpcy5zdGFydGluZyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgaWYgKHRoaXMuc3RhcnRpbmcpIHRoaXMuc3RhcnRpbmcgPSBmYWxzZSwgdGhpcy5lbWl0KFwic3RhcnRcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgZWxzZSB0aGlzLmVtaXQoXCJicnVzaFwiLCBldmVudCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGJydXNoOiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgdGhpcy5lbWl0KFwiYnJ1c2hcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICBpZiAoLS10aGlzLmFjdGl2ZSA9PT0gMCkgZGVsZXRlIHRoaXMuc3RhdGUuZW1pdHRlciwgdGhpcy5lbWl0KFwiZW5kXCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZW1pdDogZnVuY3Rpb24odHlwZSwgZXZlbnQsIG1vZGUpIHtcbiAgICAgIHZhciBkID0gc2VsZWN0KHRoaXMudGhhdCkuZGF0dW0oKTtcbiAgICAgIGxpc3RlbmVycy5jYWxsKFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aGlzLnRoYXQsXG4gICAgICAgIG5ldyBCcnVzaEV2ZW50KHR5cGUsIHtcbiAgICAgICAgICBzb3VyY2VFdmVudDogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiBicnVzaCxcbiAgICAgICAgICBzZWxlY3Rpb246IGRpbS5vdXRwdXQodGhpcy5zdGF0ZS5zZWxlY3Rpb24pLFxuICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgZGlzcGF0Y2g6IGxpc3RlbmVyc1xuICAgICAgICB9KSxcbiAgICAgICAgZFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gc3RhcnRlZChldmVudCkge1xuICAgIGlmICh0b3VjaGVuZGluZyAmJiAhZXZlbnQudG91Y2hlcykgcmV0dXJuO1xuICAgIGlmICghZmlsdGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIHJldHVybjtcblxuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgdHlwZSA9IGV2ZW50LnRhcmdldC5fX2RhdGFfXy50eXBlLFxuICAgICAgICBtb2RlID0gKGtleXMgJiYgZXZlbnQubWV0YUtleSA/IHR5cGUgPSBcIm92ZXJsYXlcIiA6IHR5cGUpID09PSBcInNlbGVjdGlvblwiID8gTU9ERV9EUkFHIDogKGtleXMgJiYgZXZlbnQuYWx0S2V5ID8gTU9ERV9DRU5URVIgOiBNT0RFX0hBTkRMRSksXG4gICAgICAgIHNpZ25YID0gZGltID09PSBZID8gbnVsbCA6IHNpZ25zWFt0eXBlXSxcbiAgICAgICAgc2lnblkgPSBkaW0gPT09IFggPyBudWxsIDogc2lnbnNZW3R5cGVdLFxuICAgICAgICBzdGF0ZSA9IGxvY2FsKHRoYXQpLFxuICAgICAgICBleHRlbnQgPSBzdGF0ZS5leHRlbnQsXG4gICAgICAgIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbixcbiAgICAgICAgVyA9IGV4dGVudFswXVswXSwgdzAsIHcxLFxuICAgICAgICBOID0gZXh0ZW50WzBdWzFdLCBuMCwgbjEsXG4gICAgICAgIEUgPSBleHRlbnRbMV1bMF0sIGUwLCBlMSxcbiAgICAgICAgUyA9IGV4dGVudFsxXVsxXSwgczAsIHMxLFxuICAgICAgICBkeCA9IDAsXG4gICAgICAgIGR5ID0gMCxcbiAgICAgICAgbW92aW5nLFxuICAgICAgICBzaGlmdGluZyA9IHNpZ25YICYmIHNpZ25ZICYmIGtleXMgJiYgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgIGxvY2tYLFxuICAgICAgICBsb2NrWSxcbiAgICAgICAgcG9pbnRzID0gQXJyYXkuZnJvbShldmVudC50b3VjaGVzIHx8IFtldmVudF0sIHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGkgPSB0LmlkZW50aWZpZXI7XG4gICAgICAgICAgdCA9IHBvaW50ZXIodCwgdGhhdCk7XG4gICAgICAgICAgdC5wb2ludDAgPSB0LnNsaWNlKCk7XG4gICAgICAgICAgdC5pZGVudGlmaWVyID0gaTtcbiAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgfSk7XG5cbiAgICBpbnRlcnJ1cHQodGhhdCk7XG4gICAgdmFyIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3VtZW50cywgdHJ1ZSkuYmVmb3Jlc3RhcnQoKTtcblxuICAgIGlmICh0eXBlID09PSBcIm92ZXJsYXlcIikge1xuICAgICAgaWYgKHNlbGVjdGlvbikgbW92aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHB0cyA9IFtwb2ludHNbMF0sIHBvaW50c1sxXSB8fCBwb2ludHNbMF1dO1xuICAgICAgc3RhdGUuc2VsZWN0aW9uID0gc2VsZWN0aW9uID0gW1tcbiAgICAgICAgICB3MCA9IGRpbSA9PT0gWSA/IFcgOiBtaW4ocHRzWzBdWzBdLCBwdHNbMV1bMF0pLFxuICAgICAgICAgIG4wID0gZGltID09PSBYID8gTiA6IG1pbihwdHNbMF1bMV0sIHB0c1sxXVsxXSlcbiAgICAgICAgXSwgW1xuICAgICAgICAgIGUwID0gZGltID09PSBZID8gRSA6IG1heChwdHNbMF1bMF0sIHB0c1sxXVswXSksXG4gICAgICAgICAgczAgPSBkaW0gPT09IFggPyBTIDogbWF4KHB0c1swXVsxXSwgcHRzWzFdWzFdKVxuICAgICAgICBdXTtcbiAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkgbW92ZShldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHcwID0gc2VsZWN0aW9uWzBdWzBdO1xuICAgICAgbjAgPSBzZWxlY3Rpb25bMF1bMV07XG4gICAgICBlMCA9IHNlbGVjdGlvblsxXVswXTtcbiAgICAgIHMwID0gc2VsZWN0aW9uWzFdWzFdO1xuICAgIH1cblxuICAgIHcxID0gdzA7XG4gICAgbjEgPSBuMDtcbiAgICBlMSA9IGUwO1xuICAgIHMxID0gczA7XG5cbiAgICB2YXIgZ3JvdXAgPSBzZWxlY3QodGhhdClcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIik7XG5cbiAgICB2YXIgb3ZlcmxheSA9IGdyb3VwLnNlbGVjdEFsbChcIi5vdmVybGF5XCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZV0pO1xuXG4gICAgaWYgKGV2ZW50LnRvdWNoZXMpIHtcbiAgICAgIGVtaXQubW92ZWQgPSBtb3ZlZDtcbiAgICAgIGVtaXQuZW5kZWQgPSBlbmRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBzZWxlY3QoZXZlbnQudmlldylcbiAgICAgICAgICAub24oXCJtb3VzZW1vdmUuYnJ1c2hcIiwgbW92ZWQsIHRydWUpXG4gICAgICAgICAgLm9uKFwibW91c2V1cC5icnVzaFwiLCBlbmRlZCwgdHJ1ZSk7XG4gICAgICBpZiAoa2V5cykgdmlld1xuICAgICAgICAgIC5vbihcImtleWRvd24uYnJ1c2hcIiwga2V5ZG93bmVkLCB0cnVlKVxuICAgICAgICAgIC5vbihcImtleXVwLmJydXNoXCIsIGtleXVwcGVkLCB0cnVlKVxuXG4gICAgICBkcmFnRGlzYWJsZShldmVudC52aWV3KTtcbiAgICB9XG5cbiAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICBlbWl0LnN0YXJ0KGV2ZW50LCBtb2RlLm5hbWUpO1xuXG4gICAgZnVuY3Rpb24gbW92ZWQoZXZlbnQpIHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBldmVudC5jaGFuZ2VkVG91Y2hlcyB8fCBbZXZlbnRdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBwb2ludHMpXG4gICAgICAgICAgaWYgKGQuaWRlbnRpZmllciA9PT0gcC5pZGVudGlmaWVyKSBkLmN1ciA9IHBvaW50ZXIocCwgdGhhdCk7XG4gICAgICB9XG4gICAgICBpZiAoc2hpZnRpbmcgJiYgIWxvY2tYICYmICFsb2NrWSAmJiBwb2ludHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWzBdO1xuICAgICAgICBpZiAoYWJzKHBvaW50LmN1clswXSAtIHBvaW50WzBdKSA+IGFicyhwb2ludC5jdXJbMV0gLSBwb2ludFsxXSkpXG4gICAgICAgICAgbG9ja1kgPSB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbG9ja1ggPSB0cnVlO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBwb2ludCBvZiBwb2ludHMpXG4gICAgICAgIGlmIChwb2ludC5jdXIpIHBvaW50WzBdID0gcG9pbnQuY3VyWzBdLCBwb2ludFsxXSA9IHBvaW50LmN1clsxXTtcbiAgICAgIG1vdmluZyA9IHRydWU7XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICAgIG1vdmUoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWzBdLCBwb2ludDAgPSBwb2ludC5wb2ludDA7XG4gICAgICB2YXIgdDtcblxuICAgICAgZHggPSBwb2ludFswXSAtIHBvaW50MFswXTtcbiAgICAgIGR5ID0gcG9pbnRbMV0gLSBwb2ludDBbMV07XG5cbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIE1PREVfU1BBQ0U6XG4gICAgICAgIGNhc2UgTU9ERV9EUkFHOiB7XG4gICAgICAgICAgaWYgKHNpZ25YKSBkeCA9IG1heChXIC0gdzAsIG1pbihFIC0gZTAsIGR4KSksIHcxID0gdzAgKyBkeCwgZTEgPSBlMCArIGR4O1xuICAgICAgICAgIGlmIChzaWduWSkgZHkgPSBtYXgoTiAtIG4wLCBtaW4oUyAtIHMwLCBkeSkpLCBuMSA9IG4wICsgZHksIHMxID0gczAgKyBkeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE1PREVfSEFORExFOiB7XG4gICAgICAgICAgaWYgKHBvaW50c1sxXSkge1xuICAgICAgICAgICAgaWYgKHNpZ25YKSB3MSA9IG1heChXLCBtaW4oRSwgcG9pbnRzWzBdWzBdKSksIGUxID0gbWF4KFcsIG1pbihFLCBwb2ludHNbMV1bMF0pKSwgc2lnblggPSAxO1xuICAgICAgICAgICAgaWYgKHNpZ25ZKSBuMSA9IG1heChOLCBtaW4oUywgcG9pbnRzWzBdWzFdKSksIHMxID0gbWF4KE4sIG1pbihTLCBwb2ludHNbMV1bMV0pKSwgc2lnblkgPSAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBkeCA9IG1heChXIC0gdzAsIG1pbihFIC0gdzAsIGR4KSksIHcxID0gdzAgKyBkeCwgZTEgPSBlMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNpZ25YID4gMCkgZHggPSBtYXgoVyAtIGUwLCBtaW4oRSAtIGUwLCBkeCkpLCB3MSA9IHcwLCBlMSA9IGUwICsgZHg7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBkeSA9IG1heChOIC0gbjAsIG1pbihTIC0gbjAsIGR5KSksIG4xID0gbjAgKyBkeSwgczEgPSBzMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNpZ25ZID4gMCkgZHkgPSBtYXgoTiAtIHMwLCBtaW4oUyAtIHMwLCBkeSkpLCBuMSA9IG4wLCBzMSA9IHMwICsgZHk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTU9ERV9DRU5URVI6IHtcbiAgICAgICAgICBpZiAoc2lnblgpIHcxID0gbWF4KFcsIG1pbihFLCB3MCAtIGR4ICogc2lnblgpKSwgZTEgPSBtYXgoVywgbWluKEUsIGUwICsgZHggKiBzaWduWCkpO1xuICAgICAgICAgIGlmIChzaWduWSkgbjEgPSBtYXgoTiwgbWluKFMsIG4wIC0gZHkgKiBzaWduWSkpLCBzMSA9IG1heChOLCBtaW4oUywgczAgKyBkeSAqIHNpZ25ZKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGUxIDwgdzEpIHtcbiAgICAgICAgc2lnblggKj0gLTE7XG4gICAgICAgIHQgPSB3MCwgdzAgPSBlMCwgZTAgPSB0O1xuICAgICAgICB0ID0gdzEsIHcxID0gZTEsIGUxID0gdDtcbiAgICAgICAgaWYgKHR5cGUgaW4gZmxpcFgpIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGUgPSBmbGlwWFt0eXBlXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoczEgPCBuMSkge1xuICAgICAgICBzaWduWSAqPSAtMTtcbiAgICAgICAgdCA9IG4wLCBuMCA9IHMwLCBzMCA9IHQ7XG4gICAgICAgIHQgPSBuMSwgbjEgPSBzMSwgczEgPSB0O1xuICAgICAgICBpZiAodHlwZSBpbiBmbGlwWSkgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZSA9IGZsaXBZW3R5cGVdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZS5zZWxlY3Rpb24pIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbjsgLy8gTWF5IGJlIHNldCBieSBicnVzaC5tb3ZlIVxuICAgICAgaWYgKGxvY2tYKSB3MSA9IHNlbGVjdGlvblswXVswXSwgZTEgPSBzZWxlY3Rpb25bMV1bMF07XG4gICAgICBpZiAobG9ja1kpIG4xID0gc2VsZWN0aW9uWzBdWzFdLCBzMSA9IHNlbGVjdGlvblsxXVsxXTtcblxuICAgICAgaWYgKHNlbGVjdGlvblswXVswXSAhPT0gdzFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMF1bMV0gIT09IG4xXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzFdWzBdICE9PSBlMVxuICAgICAgICAgIHx8IHNlbGVjdGlvblsxXVsxXSAhPT0gczEpIHtcbiAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gW1t3MSwgbjFdLCBbZTEsIHMxXV07XG4gICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICBlbWl0LmJydXNoKGV2ZW50LCBtb2RlLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZGVkKGV2ZW50KSB7XG4gICAgICBub3Byb3BhZ2F0aW9uKGV2ZW50KTtcbiAgICAgIGlmIChldmVudC50b3VjaGVzKSB7XG4gICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBpZiAodG91Y2hlbmRpbmcpIGNsZWFyVGltZW91dCh0b3VjaGVuZGluZyk7XG4gICAgICAgIHRvdWNoZW5kaW5nID0gc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG91Y2hlbmRpbmcgPSBudWxsOyB9LCA1MDApOyAvLyBHaG9zdCBjbGlja3MgYXJlIGRlbGF5ZWQhXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcmFnRW5hYmxlKGV2ZW50LnZpZXcsIG1vdmluZyk7XG4gICAgICAgIHZpZXcub24oXCJrZXlkb3duLmJydXNoIGtleXVwLmJydXNoIG1vdXNlbW92ZS5icnVzaCBtb3VzZXVwLmJydXNoXCIsIG51bGwpO1xuICAgICAgfVxuICAgICAgZ3JvdXAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpO1xuICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMub3ZlcmxheSk7XG4gICAgICBpZiAoc3RhdGUuc2VsZWN0aW9uKSBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb247IC8vIE1heSBiZSBzZXQgYnkgYnJ1c2gubW92ZSAob24gc3RhcnQpIVxuICAgICAgaWYgKGVtcHR5KHNlbGVjdGlvbikpIHN0YXRlLnNlbGVjdGlvbiA9IG51bGwsIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgZW1pdC5lbmQoZXZlbnQsIG1vZGUubmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5ZG93bmVkKGV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogeyAvLyBTSElGVFxuICAgICAgICAgIHNoaWZ0aW5nID0gc2lnblggJiYgc2lnblk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAxODogeyAvLyBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9IQU5ETEUpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCkgZTAgPSBlMSAtIGR4ICogc2lnblgsIHcwID0gdzEgKyBkeCAqIHNpZ25YO1xuICAgICAgICAgICAgaWYgKHNpZ25ZKSBzMCA9IHMxIC0gZHkgKiBzaWduWSwgbjAgPSBuMSArIGR5ICogc2lnblk7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9DRU5URVI7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAzMjogeyAvLyBTUEFDRTsgdGFrZXMgcHJpb3JpdHkgb3ZlciBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9IQU5ETEUgfHwgbW9kZSA9PT0gTU9ERV9DRU5URVIpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTEgLSBkeDsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxIC0gZHg7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxIC0gZHk7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMSAtIGR5O1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfU1BBQ0U7XG4gICAgICAgICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5zZWxlY3Rpb24pO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleXVwcGVkKGV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogeyAvLyBTSElGVFxuICAgICAgICAgIGlmIChzaGlmdGluZykge1xuICAgICAgICAgICAgbG9ja1ggPSBsb2NrWSA9IHNoaWZ0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAxODogeyAvLyBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9DRU5URVIpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTE7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MTtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczE7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX0hBTkRMRTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDMyOiB7IC8vIFNQQUNFXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfU1BBQ0UpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25YKSBlMCA9IGUxIC0gZHggKiBzaWduWCwgdzAgPSB3MSArIGR4ICogc2lnblg7XG4gICAgICAgICAgICAgIGlmIChzaWduWSkgczAgPSBzMSAtIGR5ICogc2lnblksIG4wID0gbjEgKyBkeSAqIHNpZ25ZO1xuICAgICAgICAgICAgICBtb2RlID0gTU9ERV9DRU5URVI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxOyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzE7XG4gICAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczE7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMTtcbiAgICAgICAgICAgICAgbW9kZSA9IE1PREVfSEFORExFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZV0pO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNobW92ZWQoZXZlbnQpIHtcbiAgICBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykubW92ZWQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2hlbmRlZChldmVudCkge1xuICAgIGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5lbmRlZChldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX19icnVzaCB8fCB7c2VsZWN0aW9uOiBudWxsfTtcbiAgICBzdGF0ZS5leHRlbnQgPSBudW1iZXIyKGV4dGVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICBzdGF0ZS5kaW0gPSBkaW07XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgYnJ1c2guZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGV4dGVudCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQobnVtYmVyMihfKSksIGJydXNoKSA6IGV4dGVudDtcbiAgfTtcblxuICBicnVzaC5maWx0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZmlsdGVyID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCBicnVzaCkgOiBmaWx0ZXI7XG4gIH07XG5cbiAgYnJ1c2gudG91Y2hhYmxlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRvdWNoYWJsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgYnJ1c2gpIDogdG91Y2hhYmxlO1xuICB9O1xuXG4gIGJydXNoLmhhbmRsZVNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaGFuZGxlU2l6ZSA9ICtfLCBicnVzaCkgOiBoYW5kbGVTaXplO1xuICB9O1xuXG4gIGJydXNoLmtleU1vZGlmaWVycyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChrZXlzID0gISFfLCBicnVzaCkgOiBrZXlzO1xuICB9O1xuXG4gIGJydXNoLm9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gbGlzdGVuZXJzLm9uLmFwcGx5KGxpc3RlbmVycywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdmFsdWUgPT09IGxpc3RlbmVycyA/IGJydXNoIDogdmFsdWU7XG4gIH07XG5cbiAgcmV0dXJuIGJydXNoO1xufVxuIiwgImV4cG9ydCB2YXIgZXBzaWxvbiA9IDFlLTY7XG5leHBvcnQgdmFyIGVwc2lsb24yID0gMWUtMTI7XG5leHBvcnQgdmFyIHBpID0gTWF0aC5QSTtcbmV4cG9ydCB2YXIgaGFsZlBpID0gcGkgLyAyO1xuZXhwb3J0IHZhciBxdWFydGVyUGkgPSBwaSAvIDQ7XG5leHBvcnQgdmFyIHRhdSA9IHBpICogMjtcblxuZXhwb3J0IHZhciBkZWdyZWVzID0gMTgwIC8gcGk7XG5leHBvcnQgdmFyIHJhZGlhbnMgPSBwaSAvIDE4MDtcblxuZXhwb3J0IHZhciBhYnMgPSBNYXRoLmFicztcbmV4cG9ydCB2YXIgYXRhbiA9IE1hdGguYXRhbjtcbmV4cG9ydCB2YXIgYXRhbjIgPSBNYXRoLmF0YW4yO1xuZXhwb3J0IHZhciBjb3MgPSBNYXRoLmNvcztcbmV4cG9ydCB2YXIgY2VpbCA9IE1hdGguY2VpbDtcbmV4cG9ydCB2YXIgZXhwID0gTWF0aC5leHA7XG5leHBvcnQgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbmV4cG9ydCB2YXIgaHlwb3QgPSBNYXRoLmh5cG90O1xuZXhwb3J0IHZhciBsb2cgPSBNYXRoLmxvZztcbmV4cG9ydCB2YXIgcG93ID0gTWF0aC5wb3c7XG5leHBvcnQgdmFyIHNpbiA9IE1hdGguc2luO1xuZXhwb3J0IHZhciBzaWduID0gTWF0aC5zaWduIHx8IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggPiAwID8gMSA6IHggPCAwID8gLTEgOiAwOyB9O1xuZXhwb3J0IHZhciBzcXJ0ID0gTWF0aC5zcXJ0O1xuZXhwb3J0IHZhciB0YW4gPSBNYXRoLnRhbjtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjb3MoeCkge1xuICByZXR1cm4geCA+IDEgPyAwIDogeCA8IC0xID8gcGkgOiBNYXRoLmFjb3MoeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc2luKHgpIHtcbiAgcmV0dXJuIHggPiAxID8gaGFsZlBpIDogeCA8IC0xID8gLWhhbGZQaSA6IE1hdGguYXNpbih4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhdmVyc2luKHgpIHtcbiAgcmV0dXJuICh4ID0gc2luKHggLyAyKSkgKiB4O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vb3AoKSB7fVxuIiwgImZ1bmN0aW9uIHN0cmVhbUdlb21ldHJ5KGdlb21ldHJ5LCBzdHJlYW0pIHtcbiAgaWYgKGdlb21ldHJ5ICYmIHN0cmVhbUdlb21ldHJ5VHlwZS5oYXNPd25Qcm9wZXJ0eShnZW9tZXRyeS50eXBlKSkge1xuICAgIHN0cmVhbUdlb21ldHJ5VHlwZVtnZW9tZXRyeS50eXBlXShnZW9tZXRyeSwgc3RyZWFtKTtcbiAgfVxufVxuXG52YXIgc3RyZWFtT2JqZWN0VHlwZSA9IHtcbiAgRmVhdHVyZTogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBzdHJlYW1HZW9tZXRyeShvYmplY3QuZ2VvbWV0cnksIHN0cmVhbSk7XG4gIH0sXG4gIEZlYXR1cmVDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBmZWF0dXJlcyA9IG9iamVjdC5mZWF0dXJlcywgaSA9IC0xLCBuID0gZmVhdHVyZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1HZW9tZXRyeShmZWF0dXJlc1tpXS5nZW9tZXRyeSwgc3RyZWFtKTtcbiAgfVxufTtcblxudmFyIHN0cmVhbUdlb21ldHJ5VHlwZSA9IHtcbiAgU3BoZXJlOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbS5zcGhlcmUoKTtcbiAgfSxcbiAgUG9pbnQ6IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0LmNvb3JkaW5hdGVzO1xuICAgIHN0cmVhbS5wb2ludChvYmplY3RbMF0sIG9iamVjdFsxXSwgb2JqZWN0WzJdKTtcbiAgfSxcbiAgTXVsdGlQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgb2JqZWN0ID0gY29vcmRpbmF0ZXNbaV0sIHN0cmVhbS5wb2ludChvYmplY3RbMF0sIG9iamVjdFsxXSwgb2JqZWN0WzJdKTtcbiAgfSxcbiAgTGluZVN0cmluZzogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICBzdHJlYW1MaW5lKG9iamVjdC5jb29yZGluYXRlcywgc3RyZWFtLCAwKTtcbiAgfSxcbiAgTXVsdGlMaW5lU3RyaW5nOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0sIDApO1xuICB9LFxuICBQb2x5Z29uOiBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICAgIHN0cmVhbVBvbHlnb24ob2JqZWN0LmNvb3JkaW5hdGVzLCBzdHJlYW0pO1xuICB9LFxuICBNdWx0aVBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgc3RyZWFtKSB7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIHN0cmVhbVBvbHlnb24oY29vcmRpbmF0ZXNbaV0sIHN0cmVhbSk7XG4gIH0sXG4gIEdlb21ldHJ5Q29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBzdHJlYW0pIHtcbiAgICB2YXIgZ2VvbWV0cmllcyA9IG9iamVjdC5nZW9tZXRyaWVzLCBpID0gLTEsIG4gPSBnZW9tZXRyaWVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgc3RyZWFtR2VvbWV0cnkoZ2VvbWV0cmllc1tpXSwgc3RyZWFtKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc3RyZWFtTGluZShjb29yZGluYXRlcywgc3RyZWFtLCBjbG9zZWQpIHtcbiAgdmFyIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aCAtIGNsb3NlZCwgY29vcmRpbmF0ZTtcbiAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICB3aGlsZSAoKytpIDwgbikgY29vcmRpbmF0ZSA9IGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0ucG9pbnQoY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgY29vcmRpbmF0ZVsyXSk7XG4gIHN0cmVhbS5saW5lRW5kKCk7XG59XG5cbmZ1bmN0aW9uIHN0cmVhbVBvbHlnb24oY29vcmRpbmF0ZXMsIHN0cmVhbSkge1xuICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gIHdoaWxlICgrK2kgPCBuKSBzdHJlYW1MaW5lKGNvb3JkaW5hdGVzW2ldLCBzdHJlYW0sIDEpO1xuICBzdHJlYW0ucG9seWdvbkVuZCgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvYmplY3QsIHN0cmVhbSkge1xuICBpZiAob2JqZWN0ICYmIHN0cmVhbU9iamVjdFR5cGUuaGFzT3duUHJvcGVydHkob2JqZWN0LnR5cGUpKSB7XG4gICAgc3RyZWFtT2JqZWN0VHlwZVtvYmplY3QudHlwZV0ob2JqZWN0LCBzdHJlYW0pO1xuICB9IGVsc2Uge1xuICAgIHN0cmVhbUdlb21ldHJ5KG9iamVjdCwgc3RyZWFtKTtcbiAgfVxufVxuIiwgImltcG9ydCB7YXNpbiwgYXRhbjIsIGNvcywgc2luLCBzcXJ0fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGhlcmljYWwoY2FydGVzaWFuKSB7XG4gIHJldHVybiBbYXRhbjIoY2FydGVzaWFuWzFdLCBjYXJ0ZXNpYW5bMF0pLCBhc2luKGNhcnRlc2lhblsyXSldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuKHNwaGVyaWNhbCkge1xuICB2YXIgbGFtYmRhID0gc3BoZXJpY2FsWzBdLCBwaGkgPSBzcGhlcmljYWxbMV0sIGNvc1BoaSA9IGNvcyhwaGkpO1xuICByZXR1cm4gW2Nvc1BoaSAqIGNvcyhsYW1iZGEpLCBjb3NQaGkgKiBzaW4obGFtYmRhKSwgc2luKHBoaSldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuRG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbkNyb3NzKGEsIGIpIHtcbiAgcmV0dXJuIFthWzFdICogYlsyXSAtIGFbMl0gKiBiWzFdLCBhWzJdICogYlswXSAtIGFbMF0gKiBiWzJdLCBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdXTtcbn1cblxuLy8gVE9ETyByZXR1cm4gYVxuZXhwb3J0IGZ1bmN0aW9uIGNhcnRlc2lhbkFkZEluUGxhY2UoYSwgYikge1xuICBhWzBdICs9IGJbMF0sIGFbMV0gKz0gYlsxXSwgYVsyXSArPSBiWzJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FydGVzaWFuU2NhbGUodmVjdG9yLCBrKSB7XG4gIHJldHVybiBbdmVjdG9yWzBdICogaywgdmVjdG9yWzFdICogaywgdmVjdG9yWzJdICoga107XG59XG5cbi8vIFRPRE8gcmV0dXJuIGRcbmV4cG9ydCBmdW5jdGlvbiBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKGQpIHtcbiAgdmFyIGwgPSBzcXJ0KGRbMF0gKiBkWzBdICsgZFsxXSAqIGRbMV0gKyBkWzJdICogZFsyXSk7XG4gIGRbMF0gLz0gbCwgZFsxXSAvPSBsLCBkWzJdIC89IGw7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuXG4gIGZ1bmN0aW9uIGNvbXBvc2UoeCwgeSkge1xuICAgIHJldHVybiB4ID0gYSh4LCB5KSwgYih4WzBdLCB4WzFdKTtcbiAgfVxuXG4gIGlmIChhLmludmVydCAmJiBiLmludmVydCkgY29tcG9zZS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPSBiLmludmVydCh4LCB5KSwgeCAmJiBhLmludmVydCh4WzBdLCB4WzFdKTtcbiAgfTtcblxuICByZXR1cm4gY29tcG9zZTtcbn1cbiIsICJpbXBvcnQgY29tcG9zZSBmcm9tIFwiLi9jb21wb3NlLmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZGVncmVlcywgcGksIHJhZGlhbnMsIHNpbiwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIHJvdGF0aW9uSWRlbnRpdHkobGFtYmRhLCBwaGkpIHtcbiAgaWYgKGFicyhsYW1iZGEpID4gcGkpIGxhbWJkYSAtPSBNYXRoLnJvdW5kKGxhbWJkYSAvIHRhdSkgKiB0YXU7XG4gIHJldHVybiBbbGFtYmRhLCBwaGldO1xufVxuXG5yb3RhdGlvbklkZW50aXR5LmludmVydCA9IHJvdGF0aW9uSWRlbnRpdHk7XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVSYWRpYW5zKGRlbHRhTGFtYmRhLCBkZWx0YVBoaSwgZGVsdGFHYW1tYSkge1xuICByZXR1cm4gKGRlbHRhTGFtYmRhICU9IHRhdSkgPyAoZGVsdGFQaGkgfHwgZGVsdGFHYW1tYSA/IGNvbXBvc2Uocm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpLCByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKSlcbiAgICA6IHJvdGF0aW9uTGFtYmRhKGRlbHRhTGFtYmRhKSlcbiAgICA6IChkZWx0YVBoaSB8fCBkZWx0YUdhbW1hID8gcm90YXRpb25QaGlHYW1tYShkZWx0YVBoaSwgZGVsdGFHYW1tYSlcbiAgICA6IHJvdGF0aW9uSWRlbnRpdHkpO1xufVxuXG5mdW5jdGlvbiBmb3J3YXJkUm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgbGFtYmRhICs9IGRlbHRhTGFtYmRhO1xuICAgIGlmIChhYnMobGFtYmRhKSA+IHBpKSBsYW1iZGEgLT0gTWF0aC5yb3VuZChsYW1iZGEgLyB0YXUpICogdGF1O1xuICAgIHJldHVybiBbbGFtYmRhLCBwaGldO1xuICB9O1xufVxuXG5mdW5jdGlvbiByb3RhdGlvbkxhbWJkYShkZWx0YUxhbWJkYSkge1xuICB2YXIgcm90YXRpb24gPSBmb3J3YXJkUm90YXRpb25MYW1iZGEoZGVsdGFMYW1iZGEpO1xuICByb3RhdGlvbi5pbnZlcnQgPSBmb3J3YXJkUm90YXRpb25MYW1iZGEoLWRlbHRhTGFtYmRhKTtcbiAgcmV0dXJuIHJvdGF0aW9uO1xufVxuXG5mdW5jdGlvbiByb3RhdGlvblBoaUdhbW1hKGRlbHRhUGhpLCBkZWx0YUdhbW1hKSB7XG4gIHZhciBjb3NEZWx0YVBoaSA9IGNvcyhkZWx0YVBoaSksXG4gICAgICBzaW5EZWx0YVBoaSA9IHNpbihkZWx0YVBoaSksXG4gICAgICBjb3NEZWx0YUdhbW1hID0gY29zKGRlbHRhR2FtbWEpLFxuICAgICAgc2luRGVsdGFHYW1tYSA9IHNpbihkZWx0YUdhbW1hKTtcblxuICBmdW5jdGlvbiByb3RhdGlvbihsYW1iZGEsIHBoaSkge1xuICAgIHZhciBjb3NQaGkgPSBjb3MocGhpKSxcbiAgICAgICAgeCA9IGNvcyhsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB5ID0gc2luKGxhbWJkYSkgKiBjb3NQaGksXG4gICAgICAgIHogPSBzaW4ocGhpKSxcbiAgICAgICAgayA9IHogKiBjb3NEZWx0YVBoaSArIHggKiBzaW5EZWx0YVBoaTtcbiAgICByZXR1cm4gW1xuICAgICAgYXRhbjIoeSAqIGNvc0RlbHRhR2FtbWEgLSBrICogc2luRGVsdGFHYW1tYSwgeCAqIGNvc0RlbHRhUGhpIC0geiAqIHNpbkRlbHRhUGhpKSxcbiAgICAgIGFzaW4oayAqIGNvc0RlbHRhR2FtbWEgKyB5ICogc2luRGVsdGFHYW1tYSlcbiAgICBdO1xuICB9XG5cbiAgcm90YXRpb24uaW52ZXJ0ID0gZnVuY3Rpb24obGFtYmRhLCBwaGkpIHtcbiAgICB2YXIgY29zUGhpID0gY29zKHBoaSksXG4gICAgICAgIHggPSBjb3MobGFtYmRhKSAqIGNvc1BoaSxcbiAgICAgICAgeSA9IHNpbihsYW1iZGEpICogY29zUGhpLFxuICAgICAgICB6ID0gc2luKHBoaSksXG4gICAgICAgIGsgPSB6ICogY29zRGVsdGFHYW1tYSAtIHkgKiBzaW5EZWx0YUdhbW1hO1xuICAgIHJldHVybiBbXG4gICAgICBhdGFuMih5ICogY29zRGVsdGFHYW1tYSArIHogKiBzaW5EZWx0YUdhbW1hLCB4ICogY29zRGVsdGFQaGkgKyBrICogc2luRGVsdGFQaGkpLFxuICAgICAgYXNpbihrICogY29zRGVsdGFQaGkgLSB4ICogc2luRGVsdGFQaGkpXG4gICAgXTtcbiAgfTtcblxuICByZXR1cm4gcm90YXRpb247XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHJvdGF0ZSkge1xuICByb3RhdGUgPSByb3RhdGVSYWRpYW5zKHJvdGF0ZVswXSAqIHJhZGlhbnMsIHJvdGF0ZVsxXSAqIHJhZGlhbnMsIHJvdGF0ZS5sZW5ndGggPiAyID8gcm90YXRlWzJdICogcmFkaWFucyA6IDApO1xuXG4gIGZ1bmN0aW9uIGZvcndhcmQoY29vcmRpbmF0ZXMpIHtcbiAgICBjb29yZGluYXRlcyA9IHJvdGF0ZShjb29yZGluYXRlc1swXSAqIHJhZGlhbnMsIGNvb3JkaW5hdGVzWzFdICogcmFkaWFucyk7XG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzWzBdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzWzFdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzO1xuICB9XG5cbiAgZm9yd2FyZC5pbnZlcnQgPSBmdW5jdGlvbihjb29yZGluYXRlcykge1xuICAgIGNvb3JkaW5hdGVzID0gcm90YXRlLmludmVydChjb29yZGluYXRlc1swXSAqIHJhZGlhbnMsIGNvb3JkaW5hdGVzWzFdICogcmFkaWFucyk7XG4gICAgcmV0dXJuIGNvb3JkaW5hdGVzWzBdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzWzFdICo9IGRlZ3JlZXMsIGNvb3JkaW5hdGVzO1xuICB9O1xuXG4gIHJldHVybiBmb3J3YXJkO1xufVxuIiwgImltcG9ydCB7Y2FydGVzaWFuLCBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlLCBzcGhlcmljYWx9IGZyb20gXCIuL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQge2Fjb3MsIGNvcywgZGVncmVlcywgZXBzaWxvbiwgcmFkaWFucywgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcbmltcG9ydCB7cm90YXRlUmFkaWFuc30gZnJvbSBcIi4vcm90YXRpb24uanNcIjtcblxuLy8gR2VuZXJhdGVzIGEgY2lyY2xlIGNlbnRlcmVkIGF0IFswXHUwMEIwLCAwXHUwMEIwXSwgd2l0aCBhIGdpdmVuIHJhZGl1cyBhbmQgcHJlY2lzaW9uLlxuZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZVN0cmVhbShzdHJlYW0sIHJhZGl1cywgZGVsdGEsIGRpcmVjdGlvbiwgdDAsIHQxKSB7XG4gIGlmICghZGVsdGEpIHJldHVybjtcbiAgdmFyIGNvc1JhZGl1cyA9IGNvcyhyYWRpdXMpLFxuICAgICAgc2luUmFkaXVzID0gc2luKHJhZGl1cyksXG4gICAgICBzdGVwID0gZGlyZWN0aW9uICogZGVsdGE7XG4gIGlmICh0MCA9PSBudWxsKSB7XG4gICAgdDAgPSByYWRpdXMgKyBkaXJlY3Rpb24gKiB0YXU7XG4gICAgdDEgPSByYWRpdXMgLSBzdGVwIC8gMjtcbiAgfSBlbHNlIHtcbiAgICB0MCA9IGNpcmNsZVJhZGl1cyhjb3NSYWRpdXMsIHQwKTtcbiAgICB0MSA9IGNpcmNsZVJhZGl1cyhjb3NSYWRpdXMsIHQxKTtcbiAgICBpZiAoZGlyZWN0aW9uID4gMCA/IHQwIDwgdDEgOiB0MCA+IHQxKSB0MCArPSBkaXJlY3Rpb24gKiB0YXU7XG4gIH1cbiAgZm9yICh2YXIgcG9pbnQsIHQgPSB0MDsgZGlyZWN0aW9uID4gMCA/IHQgPiB0MSA6IHQgPCB0MTsgdCAtPSBzdGVwKSB7XG4gICAgcG9pbnQgPSBzcGhlcmljYWwoW2Nvc1JhZGl1cywgLXNpblJhZGl1cyAqIGNvcyh0KSwgLXNpblJhZGl1cyAqIHNpbih0KV0pO1xuICAgIHN0cmVhbS5wb2ludChwb2ludFswXSwgcG9pbnRbMV0pO1xuICB9XG59XG5cbi8vIFJldHVybnMgdGhlIHNpZ25lZCBhbmdsZSBvZiBhIGNhcnRlc2lhbiBwb2ludCByZWxhdGl2ZSB0byBbY29zUmFkaXVzLCAwLCAwXS5cbmZ1bmN0aW9uIGNpcmNsZVJhZGl1cyhjb3NSYWRpdXMsIHBvaW50KSB7XG4gIHBvaW50ID0gY2FydGVzaWFuKHBvaW50KSwgcG9pbnRbMF0gLT0gY29zUmFkaXVzO1xuICBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKHBvaW50KTtcbiAgdmFyIHJhZGl1cyA9IGFjb3MoLXBvaW50WzFdKTtcbiAgcmV0dXJuICgoLXBvaW50WzJdIDwgMCA/IC1yYWRpdXMgOiByYWRpdXMpICsgdGF1IC0gZXBzaWxvbikgJSB0YXU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2VudGVyID0gY29uc3RhbnQoWzAsIDBdKSxcbiAgICAgIHJhZGl1cyA9IGNvbnN0YW50KDkwKSxcbiAgICAgIHByZWNpc2lvbiA9IGNvbnN0YW50KDIpLFxuICAgICAgcmluZyxcbiAgICAgIHJvdGF0ZSxcbiAgICAgIHN0cmVhbSA9IHtwb2ludDogcG9pbnR9O1xuXG4gIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICByaW5nLnB1c2goeCA9IHJvdGF0ZSh4LCB5KSk7XG4gICAgeFswXSAqPSBkZWdyZWVzLCB4WzFdICo9IGRlZ3JlZXM7XG4gIH1cblxuICBmdW5jdGlvbiBjaXJjbGUoKSB7XG4gICAgdmFyIGMgPSBjZW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSxcbiAgICAgICAgciA9IHJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpICogcmFkaWFucyxcbiAgICAgICAgcCA9IHByZWNpc2lvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpICogcmFkaWFucztcbiAgICByaW5nID0gW107XG4gICAgcm90YXRlID0gcm90YXRlUmFkaWFucygtY1swXSAqIHJhZGlhbnMsIC1jWzFdICogcmFkaWFucywgMCkuaW52ZXJ0O1xuICAgIGNpcmNsZVN0cmVhbShzdHJlYW0sIHIsIHAsIDEpO1xuICAgIGMgPSB7dHlwZTogXCJQb2x5Z29uXCIsIGNvb3JkaW5hdGVzOiBbcmluZ119O1xuICAgIHJpbmcgPSByb3RhdGUgPSBudWxsO1xuICAgIHJldHVybiBjO1xuICB9XG5cbiAgY2lyY2xlLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChjZW50ZXIgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KFsrX1swXSwgK19bMV1dKSwgY2lyY2xlKSA6IGNlbnRlcjtcbiAgfTtcblxuICBjaXJjbGUucmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBjaXJjbGUpIDogcmFkaXVzO1xuICB9O1xuXG4gIGNpcmNsZS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJlY2lzaW9uID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGNpcmNsZSkgOiBwcmVjaXNpb247XG4gIH07XG5cbiAgcmV0dXJuIGNpcmNsZTtcbn1cbiIsICJpbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGxpbmVzID0gW10sXG4gICAgICBsaW5lO1xuICByZXR1cm4ge1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5LCBtKSB7XG4gICAgICBsaW5lLnB1c2goW3gsIHksIG1dKTtcbiAgICB9LFxuICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBsaW5lcy5wdXNoKGxpbmUgPSBbXSk7XG4gICAgfSxcbiAgICBsaW5lRW5kOiBub29wLFxuICAgIHJlam9pbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAobGluZXMubGVuZ3RoID4gMSkgbGluZXMucHVzaChsaW5lcy5wb3AoKS5jb25jYXQobGluZXMuc2hpZnQoKSkpO1xuICAgIH0sXG4gICAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXN1bHQgPSBsaW5lcztcbiAgICAgIGxpbmVzID0gW107XG4gICAgICBsaW5lID0gbnVsbDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9O1xufVxuIiwgImltcG9ydCB7YWJzLCBlcHNpbG9ufSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGFicyhhWzBdIC0gYlswXSkgPCBlcHNpbG9uICYmIGFicyhhWzFdIC0gYlsxXSkgPCBlcHNpbG9uO1xufVxuIiwgImltcG9ydCBwb2ludEVxdWFsIGZyb20gXCIuLi9wb2ludEVxdWFsLmpzXCI7XG5pbXBvcnQge2Vwc2lsb259IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIEludGVyc2VjdGlvbihwb2ludCwgcG9pbnRzLCBvdGhlciwgZW50cnkpIHtcbiAgdGhpcy54ID0gcG9pbnQ7XG4gIHRoaXMueiA9IHBvaW50cztcbiAgdGhpcy5vID0gb3RoZXI7IC8vIGFub3RoZXIgaW50ZXJzZWN0aW9uXG4gIHRoaXMuZSA9IGVudHJ5OyAvLyBpcyBhbiBlbnRyeT9cbiAgdGhpcy52ID0gZmFsc2U7IC8vIHZpc2l0ZWRcbiAgdGhpcy5uID0gdGhpcy5wID0gbnVsbDsgLy8gbmV4dCAmIHByZXZpb3VzXG59XG5cbi8vIEEgZ2VuZXJhbGl6ZWQgcG9seWdvbiBjbGlwcGluZyBhbGdvcml0aG06IGdpdmVuIGEgcG9seWdvbiB0aGF0IGhhcyBiZWVuIGN1dFxuLy8gaW50byBpdHMgdmlzaWJsZSBsaW5lIHNlZ21lbnRzLCBhbmQgcmVqb2lucyB0aGUgc2VnbWVudHMgYnkgaW50ZXJwb2xhdGluZ1xuLy8gYWxvbmcgdGhlIGNsaXAgZWRnZS5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlZ21lbnRzLCBjb21wYXJlSW50ZXJzZWN0aW9uLCBzdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIHN0cmVhbSkge1xuICB2YXIgc3ViamVjdCA9IFtdLFxuICAgICAgY2xpcCA9IFtdLFxuICAgICAgaSxcbiAgICAgIG47XG5cbiAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbihzZWdtZW50KSB7XG4gICAgaWYgKChuID0gc2VnbWVudC5sZW5ndGggLSAxKSA8PSAwKSByZXR1cm47XG4gICAgdmFyIG4sIHAwID0gc2VnbWVudFswXSwgcDEgPSBzZWdtZW50W25dLCB4O1xuXG4gICAgaWYgKHBvaW50RXF1YWwocDAsIHAxKSkge1xuICAgICAgaWYgKCFwMFsyXSAmJiAhcDFbMl0pIHtcbiAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBzdHJlYW0ucG9pbnQoKHAwID0gc2VnbWVudFtpXSlbMF0sIHAwWzFdKTtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gaGFuZGxlIGRlZ2VuZXJhdGUgY2FzZXMgYnkgbW92aW5nIHRoZSBwb2ludFxuICAgICAgcDFbMF0gKz0gMiAqIGVwc2lsb247XG4gICAgfVxuXG4gICAgc3ViamVjdC5wdXNoKHggPSBuZXcgSW50ZXJzZWN0aW9uKHAwLCBzZWdtZW50LCBudWxsLCB0cnVlKSk7XG4gICAgY2xpcC5wdXNoKHgubyA9IG5ldyBJbnRlcnNlY3Rpb24ocDAsIG51bGwsIHgsIGZhbHNlKSk7XG4gICAgc3ViamVjdC5wdXNoKHggPSBuZXcgSW50ZXJzZWN0aW9uKHAxLCBzZWdtZW50LCBudWxsLCBmYWxzZSkpO1xuICAgIGNsaXAucHVzaCh4Lm8gPSBuZXcgSW50ZXJzZWN0aW9uKHAxLCBudWxsLCB4LCB0cnVlKSk7XG4gIH0pO1xuXG4gIGlmICghc3ViamVjdC5sZW5ndGgpIHJldHVybjtcblxuICBjbGlwLnNvcnQoY29tcGFyZUludGVyc2VjdGlvbik7XG4gIGxpbmsoc3ViamVjdCk7XG4gIGxpbmsoY2xpcCk7XG5cbiAgZm9yIChpID0gMCwgbiA9IGNsaXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgY2xpcFtpXS5lID0gc3RhcnRJbnNpZGUgPSAhc3RhcnRJbnNpZGU7XG4gIH1cblxuICB2YXIgc3RhcnQgPSBzdWJqZWN0WzBdLFxuICAgICAgcG9pbnRzLFxuICAgICAgcG9pbnQ7XG5cbiAgd2hpbGUgKDEpIHtcbiAgICAvLyBGaW5kIGZpcnN0IHVudmlzaXRlZCBpbnRlcnNlY3Rpb24uXG4gICAgdmFyIGN1cnJlbnQgPSBzdGFydCxcbiAgICAgICAgaXNTdWJqZWN0ID0gdHJ1ZTtcbiAgICB3aGlsZSAoY3VycmVudC52KSBpZiAoKGN1cnJlbnQgPSBjdXJyZW50Lm4pID09PSBzdGFydCkgcmV0dXJuO1xuICAgIHBvaW50cyA9IGN1cnJlbnQuejtcbiAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgZG8ge1xuICAgICAgY3VycmVudC52ID0gY3VycmVudC5vLnYgPSB0cnVlO1xuICAgICAgaWYgKGN1cnJlbnQuZSkge1xuICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgZm9yIChpID0gMCwgbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBuOyArK2kpIHN0cmVhbS5wb2ludCgocG9pbnQgPSBwb2ludHNbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW50ZXJwb2xhdGUoY3VycmVudC54LCBjdXJyZW50Lm4ueCwgMSwgc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzU3ViamVjdCkge1xuICAgICAgICAgIHBvaW50cyA9IGN1cnJlbnQucC56O1xuICAgICAgICAgIGZvciAoaSA9IHBvaW50cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkgc3RyZWFtLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnRlcnBvbGF0ZShjdXJyZW50LngsIGN1cnJlbnQucC54LCAtMSwgc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wO1xuICAgICAgfVxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubztcbiAgICAgIHBvaW50cyA9IGN1cnJlbnQuejtcbiAgICAgIGlzU3ViamVjdCA9ICFpc1N1YmplY3Q7XG4gICAgfSB3aGlsZSAoIWN1cnJlbnQudik7XG4gICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsaW5rKGFycmF5KSB7XG4gIGlmICghKG4gPSBhcnJheS5sZW5ndGgpKSByZXR1cm47XG4gIHZhciBuLFxuICAgICAgaSA9IDAsXG4gICAgICBhID0gYXJyYXlbMF0sXG4gICAgICBiO1xuICB3aGlsZSAoKytpIDwgbikge1xuICAgIGEubiA9IGIgPSBhcnJheVtpXTtcbiAgICBiLnAgPSBhO1xuICAgIGEgPSBiO1xuICB9XG4gIGEubiA9IGIgPSBhcnJheVswXTtcbiAgYi5wID0gYTtcbn1cbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7Y2FydGVzaWFuLCBjYXJ0ZXNpYW5Dcm9zcywgY2FydGVzaWFuTm9ybWFsaXplSW5QbGFjZX0gZnJvbSBcIi4vY2FydGVzaWFuLmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgZXBzaWxvbjIsIGhhbGZQaSwgcGksIHF1YXJ0ZXJQaSwgc2lnbiwgc2luLCB0YXV9IGZyb20gXCIuL21hdGguanNcIjtcblxuZnVuY3Rpb24gbG9uZ2l0dWRlKHBvaW50KSB7XG4gIHJldHVybiBhYnMocG9pbnRbMF0pIDw9IHBpID8gcG9pbnRbMF0gOiBzaWduKHBvaW50WzBdKSAqICgoYWJzKHBvaW50WzBdKSArIHBpKSAlIHRhdSAtIHBpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocG9seWdvbiwgcG9pbnQpIHtcbiAgdmFyIGxhbWJkYSA9IGxvbmdpdHVkZShwb2ludCksXG4gICAgICBwaGkgPSBwb2ludFsxXSxcbiAgICAgIHNpblBoaSA9IHNpbihwaGkpLFxuICAgICAgbm9ybWFsID0gW3NpbihsYW1iZGEpLCAtY29zKGxhbWJkYSksIDBdLFxuICAgICAgYW5nbGUgPSAwLFxuICAgICAgd2luZGluZyA9IDA7XG5cbiAgdmFyIHN1bSA9IG5ldyBBZGRlcigpO1xuXG4gIGlmIChzaW5QaGkgPT09IDEpIHBoaSA9IGhhbGZQaSArIGVwc2lsb247XG4gIGVsc2UgaWYgKHNpblBoaSA9PT0gLTEpIHBoaSA9IC1oYWxmUGkgLSBlcHNpbG9uO1xuXG4gIGZvciAodmFyIGkgPSAwLCBuID0gcG9seWdvbi5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoIShtID0gKHJpbmcgPSBwb2x5Z29uW2ldKS5sZW5ndGgpKSBjb250aW51ZTtcbiAgICB2YXIgcmluZyxcbiAgICAgICAgbSxcbiAgICAgICAgcG9pbnQwID0gcmluZ1ttIC0gMV0sXG4gICAgICAgIGxhbWJkYTAgPSBsb25naXR1ZGUocG9pbnQwKSxcbiAgICAgICAgcGhpMCA9IHBvaW50MFsxXSAvIDIgKyBxdWFydGVyUGksXG4gICAgICAgIHNpblBoaTAgPSBzaW4ocGhpMCksXG4gICAgICAgIGNvc1BoaTAgPSBjb3MocGhpMCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG07ICsraiwgbGFtYmRhMCA9IGxhbWJkYTEsIHNpblBoaTAgPSBzaW5QaGkxLCBjb3NQaGkwID0gY29zUGhpMSwgcG9pbnQwID0gcG9pbnQxKSB7XG4gICAgICB2YXIgcG9pbnQxID0gcmluZ1tqXSxcbiAgICAgICAgICBsYW1iZGExID0gbG9uZ2l0dWRlKHBvaW50MSksXG4gICAgICAgICAgcGhpMSA9IHBvaW50MVsxXSAvIDIgKyBxdWFydGVyUGksXG4gICAgICAgICAgc2luUGhpMSA9IHNpbihwaGkxKSxcbiAgICAgICAgICBjb3NQaGkxID0gY29zKHBoaTEpLFxuICAgICAgICAgIGRlbHRhID0gbGFtYmRhMSAtIGxhbWJkYTAsXG4gICAgICAgICAgc2lnbiA9IGRlbHRhID49IDAgPyAxIDogLTEsXG4gICAgICAgICAgYWJzRGVsdGEgPSBzaWduICogZGVsdGEsXG4gICAgICAgICAgYW50aW1lcmlkaWFuID0gYWJzRGVsdGEgPiBwaSxcbiAgICAgICAgICBrID0gc2luUGhpMCAqIHNpblBoaTE7XG5cbiAgICAgIHN1bS5hZGQoYXRhbjIoayAqIHNpZ24gKiBzaW4oYWJzRGVsdGEpLCBjb3NQaGkwICogY29zUGhpMSArIGsgKiBjb3MoYWJzRGVsdGEpKSk7XG4gICAgICBhbmdsZSArPSBhbnRpbWVyaWRpYW4gPyBkZWx0YSArIHNpZ24gKiB0YXUgOiBkZWx0YTtcblxuICAgICAgLy8gQXJlIHRoZSBsb25naXR1ZGVzIGVpdGhlciBzaWRlIG9mIHRoZSBwb2ludFx1MjAxOXMgbWVyaWRpYW4gKGxhbWJkYSksXG4gICAgICAvLyBhbmQgYXJlIHRoZSBsYXRpdHVkZXMgc21hbGxlciB0aGFuIHRoZSBwYXJhbGxlbCAocGhpKT9cbiAgICAgIGlmIChhbnRpbWVyaWRpYW4gXiBsYW1iZGEwID49IGxhbWJkYSBeIGxhbWJkYTEgPj0gbGFtYmRhKSB7XG4gICAgICAgIHZhciBhcmMgPSBjYXJ0ZXNpYW5Dcm9zcyhjYXJ0ZXNpYW4ocG9pbnQwKSwgY2FydGVzaWFuKHBvaW50MSkpO1xuICAgICAgICBjYXJ0ZXNpYW5Ob3JtYWxpemVJblBsYWNlKGFyYyk7XG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBjYXJ0ZXNpYW5Dcm9zcyhub3JtYWwsIGFyYyk7XG4gICAgICAgIGNhcnRlc2lhbk5vcm1hbGl6ZUluUGxhY2UoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgdmFyIHBoaUFyYyA9IChhbnRpbWVyaWRpYW4gXiBkZWx0YSA+PSAwID8gLTEgOiAxKSAqIGFzaW4oaW50ZXJzZWN0aW9uWzJdKTtcbiAgICAgICAgaWYgKHBoaSA+IHBoaUFyYyB8fCBwaGkgPT09IHBoaUFyYyAmJiAoYXJjWzBdIHx8IGFyY1sxXSkpIHtcbiAgICAgICAgICB3aW5kaW5nICs9IGFudGltZXJpZGlhbiBeIGRlbHRhID49IDAgPyAxIDogLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBGaXJzdCwgZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIFNvdXRoIHBvbGUgaXMgaW5zaWRlIG9yIG91dHNpZGU6XG4gIC8vXG4gIC8vIEl0IGlzIGluc2lkZSBpZjpcbiAgLy8gKiB0aGUgcG9seWdvbiB3aW5kcyBhcm91bmQgaXQgaW4gYSBjbG9ja3dpc2UgZGlyZWN0aW9uLlxuICAvLyAqIHRoZSBwb2x5Z29uIGRvZXMgbm90IChjdW11bGF0aXZlbHkpIHdpbmQgYXJvdW5kIGl0LCBidXQgaGFzIGEgbmVnYXRpdmVcbiAgLy8gICAoY291bnRlci1jbG9ja3dpc2UpIGFyZWEuXG4gIC8vXG4gIC8vIFNlY29uZCwgY291bnQgdGhlIChzaWduZWQpIG51bWJlciBvZiB0aW1lcyBhIHNlZ21lbnQgY3Jvc3NlcyBhIGxhbWJkYVxuICAvLyBmcm9tIHRoZSBwb2ludCB0byB0aGUgU291dGggcG9sZS4gIElmIGl0IGlzIHplcm8sIHRoZW4gdGhlIHBvaW50IGlzIHRoZVxuICAvLyBzYW1lIHNpZGUgYXMgdGhlIFNvdXRoIHBvbGUuXG5cbiAgcmV0dXJuIChhbmdsZSA8IC1lcHNpbG9uIHx8IGFuZ2xlIDwgZXBzaWxvbiAmJiBzdW0gPCAtZXBzaWxvbjIpIF4gKHdpbmRpbmcgJiAxKTtcbn1cbiIsICJpbXBvcnQgY2xpcEJ1ZmZlciBmcm9tIFwiLi9idWZmZXIuanNcIjtcbmltcG9ydCBjbGlwUmVqb2luIGZyb20gXCIuL3Jlam9pbi5qc1wiO1xuaW1wb3J0IHtlcHNpbG9uLCBoYWxmUGl9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQgcG9seWdvbkNvbnRhaW5zIGZyb20gXCIuLi9wb2x5Z29uQ29udGFpbnMuanNcIjtcbmltcG9ydCB7bWVyZ2V9IGZyb20gXCJkMy1hcnJheVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwb2ludFZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc3RhcnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHNpbmspIHtcbiAgICB2YXIgbGluZSA9IGNsaXBMaW5lKHNpbmspLFxuICAgICAgICByaW5nQnVmZmVyID0gY2xpcEJ1ZmZlcigpLFxuICAgICAgICByaW5nU2luayA9IGNsaXBMaW5lKHJpbmdCdWZmZXIpLFxuICAgICAgICBwb2x5Z29uU3RhcnRlZCA9IGZhbHNlLFxuICAgICAgICBwb2x5Z29uLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgcmluZztcblxuICAgIHZhciBjbGlwID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50UmluZztcbiAgICAgICAgY2xpcC5saW5lU3RhcnQgPSByaW5nU3RhcnQ7XG4gICAgICAgIGNsaXAubGluZUVuZCA9IHJpbmdFbmQ7XG4gICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgIHBvbHlnb24gPSBbXTtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50O1xuICAgICAgICBjbGlwLmxpbmVTdGFydCA9IGxpbmVTdGFydDtcbiAgICAgICAgY2xpcC5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgc2VnbWVudHMgPSBtZXJnZShzZWdtZW50cyk7XG4gICAgICAgIHZhciBzdGFydEluc2lkZSA9IHBvbHlnb25Db250YWlucyhwb2x5Z29uLCBzdGFydCk7XG4gICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgY2xpcFJlam9pbihzZWdtZW50cywgY29tcGFyZUludGVyc2VjdGlvbiwgc3RhcnRJbnNpZGUsIGludGVycG9sYXRlLCBzaW5rKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydEluc2lkZSkge1xuICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIHNpbmsucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICBzaW5rLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGludGVycG9sYXRlKG51bGwsIG51bGwsIDEsIHNpbmspO1xuICAgICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb2x5Z29uU3RhcnRlZCkgc2luay5wb2x5Z29uRW5kKCksIHBvbHlnb25TdGFydGVkID0gZmFsc2U7XG4gICAgICAgIHNlZ21lbnRzID0gcG9seWdvbiA9IG51bGw7XG4gICAgICB9LFxuICAgICAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luay5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc2luayk7XG4gICAgICAgIHNpbmsubGluZUVuZCgpO1xuICAgICAgICBzaW5rLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIGlmIChwb2ludFZpc2libGUobGFtYmRhLCBwaGkpKSBzaW5rLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludExpbmUobGFtYmRhLCBwaGkpIHtcbiAgICAgIGxpbmUucG9pbnQobGFtYmRhLCBwaGkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIGNsaXAucG9pbnQgPSBwb2ludExpbmU7XG4gICAgICBsaW5lLmxpbmVTdGFydCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICBsaW5lLmxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2ludFJpbmcobGFtYmRhLCBwaGkpIHtcbiAgICAgIHJpbmcucHVzaChbbGFtYmRhLCBwaGldKTtcbiAgICAgIHJpbmdTaW5rLnBvaW50KGxhbWJkYSwgcGhpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICByaW5nU2luay5saW5lU3RhcnQoKTtcbiAgICAgIHJpbmcgPSBbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nRW5kKCkge1xuICAgICAgcG9pbnRSaW5nKHJpbmdbMF1bMF0sIHJpbmdbMF1bMV0pO1xuICAgICAgcmluZ1NpbmsubGluZUVuZCgpO1xuXG4gICAgICB2YXIgY2xlYW4gPSByaW5nU2luay5jbGVhbigpLFxuICAgICAgICAgIHJpbmdTZWdtZW50cyA9IHJpbmdCdWZmZXIucmVzdWx0KCksXG4gICAgICAgICAgaSwgbiA9IHJpbmdTZWdtZW50cy5sZW5ndGgsIG0sXG4gICAgICAgICAgc2VnbWVudCxcbiAgICAgICAgICBwb2ludDtcblxuICAgICAgcmluZy5wb3AoKTtcbiAgICAgIHBvbHlnb24ucHVzaChyaW5nKTtcbiAgICAgIHJpbmcgPSBudWxsO1xuXG4gICAgICBpZiAoIW4pIHJldHVybjtcblxuICAgICAgLy8gTm8gaW50ZXJzZWN0aW9ucy5cbiAgICAgIGlmIChjbGVhbiAmIDEpIHtcbiAgICAgICAgc2VnbWVudCA9IHJpbmdTZWdtZW50c1swXTtcbiAgICAgICAgaWYgKChtID0gc2VnbWVudC5sZW5ndGggLSAxKSA+IDApIHtcbiAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBzaW5rLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgc2luay5saW5lU3RhcnQoKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSBzaW5rLnBvaW50KChwb2ludCA9IHNlZ21lbnRbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgc2luay5saW5lRW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWpvaW4gY29ubmVjdGVkIHNlZ21lbnRzLlxuICAgICAgLy8gVE9ETyByZXVzZSByaW5nQnVmZmVyLnJlam9pbigpP1xuICAgICAgaWYgKG4gPiAxICYmIGNsZWFuICYgMikgcmluZ1NlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLnBvcCgpLmNvbmNhdChyaW5nU2VnbWVudHMuc2hpZnQoKSkpO1xuXG4gICAgICBzZWdtZW50cy5wdXNoKHJpbmdTZWdtZW50cy5maWx0ZXIodmFsaWRTZWdtZW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsaXA7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkU2VnbWVudChzZWdtZW50KSB7XG4gIHJldHVybiBzZWdtZW50Lmxlbmd0aCA+IDE7XG59XG5cbi8vIEludGVyc2VjdGlvbnMgYXJlIHNvcnRlZCBhbG9uZyB0aGUgY2xpcCBlZGdlLiBGb3IgYm90aCBhbnRpbWVyaWRpYW4gY3V0dGluZ1xuLy8gYW5kIGNpcmNsZSBjbGlwcGluZywgdGhlIHNhbWUgY29tcGFyaXNvbiBpcyB1c2VkLlxuZnVuY3Rpb24gY29tcGFyZUludGVyc2VjdGlvbihhLCBiKSB7XG4gIHJldHVybiAoKGEgPSBhLngpWzBdIDwgMCA/IGFbMV0gLSBoYWxmUGkgLSBlcHNpbG9uIDogaGFsZlBpIC0gYVsxXSlcbiAgICAgICAtICgoYiA9IGIueClbMF0gPCAwID8gYlsxXSAtIGhhbGZQaSAtIGVwc2lsb24gOiBoYWxmUGkgLSBiWzFdKTtcbn1cbiIsICJpbXBvcnQgY2xpcCBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHthYnMsIGF0YW4sIGNvcywgZXBzaWxvbiwgaGFsZlBpLCBwaSwgc2lufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGlwKFxuICBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG4gIGNsaXBBbnRpbWVyaWRpYW5MaW5lLFxuICBjbGlwQW50aW1lcmlkaWFuSW50ZXJwb2xhdGUsXG4gIFstcGksIC1oYWxmUGldXG4pO1xuXG4vLyBUYWtlcyBhIGxpbmUgYW5kIGN1dHMgaW50byB2aXNpYmxlIHNlZ21lbnRzLiBSZXR1cm4gdmFsdWVzOiAwIC0gdGhlcmUgd2VyZVxuLy8gaW50ZXJzZWN0aW9ucyBvciB0aGUgbGluZSB3YXMgZW1wdHk7IDEgLSBubyBpbnRlcnNlY3Rpb25zOyAyIC0gdGhlcmUgd2VyZVxuLy8gaW50ZXJzZWN0aW9ucywgYW5kIHRoZSBmaXJzdCBhbmQgbGFzdCBzZWdtZW50cyBzaG91bGQgYmUgcmVqb2luZWQuXG5mdW5jdGlvbiBjbGlwQW50aW1lcmlkaWFuTGluZShzdHJlYW0pIHtcbiAgdmFyIGxhbWJkYTAgPSBOYU4sXG4gICAgICBwaGkwID0gTmFOLFxuICAgICAgc2lnbjAgPSBOYU4sXG4gICAgICBjbGVhbjsgLy8gbm8gaW50ZXJzZWN0aW9uc1xuXG4gIHJldHVybiB7XG4gICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgIGNsZWFuID0gMTtcbiAgICB9LFxuICAgIHBvaW50OiBmdW5jdGlvbihsYW1iZGExLCBwaGkxKSB7XG4gICAgICB2YXIgc2lnbjEgPSBsYW1iZGExID4gMCA/IHBpIDogLXBpLFxuICAgICAgICAgIGRlbHRhID0gYWJzKGxhbWJkYTEgLSBsYW1iZGEwKTtcbiAgICAgIGlmIChhYnMoZGVsdGEgLSBwaSkgPCBlcHNpbG9uKSB7IC8vIGxpbmUgY3Jvc3NlcyBhIHBvbGVcbiAgICAgICAgc3RyZWFtLnBvaW50KGxhbWJkYTAsIHBoaTAgPSAocGhpMCArIHBoaTEpIC8gMiA+IDAgPyBoYWxmUGkgOiAtaGFsZlBpKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHNpZ24wLCBwaGkwKTtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjEsIHBoaTApO1xuICAgICAgICBzdHJlYW0ucG9pbnQobGFtYmRhMSwgcGhpMCk7XG4gICAgICAgIGNsZWFuID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoc2lnbjAgIT09IHNpZ24xICYmIGRlbHRhID49IHBpKSB7IC8vIGxpbmUgY3Jvc3NlcyBhbnRpbWVyaWRpYW5cbiAgICAgICAgaWYgKGFicyhsYW1iZGEwIC0gc2lnbjApIDwgZXBzaWxvbikgbGFtYmRhMCAtPSBzaWduMCAqIGVwc2lsb247IC8vIGhhbmRsZSBkZWdlbmVyYWNpZXNcbiAgICAgICAgaWYgKGFicyhsYW1iZGExIC0gc2lnbjEpIDwgZXBzaWxvbikgbGFtYmRhMSAtPSBzaWduMSAqIGVwc2lsb247XG4gICAgICAgIHBoaTAgPSBjbGlwQW50aW1lcmlkaWFuSW50ZXJzZWN0KGxhbWJkYTAsIHBoaTAsIGxhbWJkYTEsIHBoaTEpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoc2lnbjAsIHBoaTApO1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIHN0cmVhbS5wb2ludChzaWduMSwgcGhpMCk7XG4gICAgICAgIGNsZWFuID0gMDtcbiAgICAgIH1cbiAgICAgIHN0cmVhbS5wb2ludChsYW1iZGEwID0gbGFtYmRhMSwgcGhpMCA9IHBoaTEpO1xuICAgICAgc2lnbjAgPSBzaWduMTtcbiAgICB9LFxuICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgIGxhbWJkYTAgPSBwaGkwID0gTmFOO1xuICAgIH0sXG4gICAgY2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIDIgLSBjbGVhbjsgLy8gaWYgaW50ZXJzZWN0aW9ucywgcmVqb2luIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbGlwQW50aW1lcmlkaWFuSW50ZXJzZWN0KGxhbWJkYTAsIHBoaTAsIGxhbWJkYTEsIHBoaTEpIHtcbiAgdmFyIGNvc1BoaTAsXG4gICAgICBjb3NQaGkxLFxuICAgICAgc2luTGFtYmRhMExhbWJkYTEgPSBzaW4obGFtYmRhMCAtIGxhbWJkYTEpO1xuICByZXR1cm4gYWJzKHNpbkxhbWJkYTBMYW1iZGExKSA+IGVwc2lsb25cbiAgICAgID8gYXRhbigoc2luKHBoaTApICogKGNvc1BoaTEgPSBjb3MocGhpMSkpICogc2luKGxhbWJkYTEpXG4gICAgICAgICAgLSBzaW4ocGhpMSkgKiAoY29zUGhpMCA9IGNvcyhwaGkwKSkgKiBzaW4obGFtYmRhMCkpXG4gICAgICAgICAgLyAoY29zUGhpMCAqIGNvc1BoaTEgKiBzaW5MYW1iZGEwTGFtYmRhMSkpXG4gICAgICA6IChwaGkwICsgcGhpMSkgLyAyO1xufVxuXG5mdW5jdGlvbiBjbGlwQW50aW1lcmlkaWFuSW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgc3RyZWFtKSB7XG4gIHZhciBwaGk7XG4gIGlmIChmcm9tID09IG51bGwpIHtcbiAgICBwaGkgPSBkaXJlY3Rpb24gKiBoYWxmUGk7XG4gICAgc3RyZWFtLnBvaW50KC1waSwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoMCwgcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIHBoaSk7XG4gICAgc3RyZWFtLnBvaW50KHBpLCAwKTtcbiAgICBzdHJlYW0ucG9pbnQocGksIC1waGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCAtcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCAtcGhpKTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCAwKTtcbiAgICBzdHJlYW0ucG9pbnQoLXBpLCBwaGkpO1xuICB9IGVsc2UgaWYgKGFicyhmcm9tWzBdIC0gdG9bMF0pID4gZXBzaWxvbikge1xuICAgIHZhciBsYW1iZGEgPSBmcm9tWzBdIDwgdG9bMF0gPyBwaSA6IC1waTtcbiAgICBwaGkgPSBkaXJlY3Rpb24gKiBsYW1iZGEgLyAyO1xuICAgIHN0cmVhbS5wb2ludCgtbGFtYmRhLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludCgwLCBwaGkpO1xuICAgIHN0cmVhbS5wb2ludChsYW1iZGEsIHBoaSk7XG4gIH0gZWxzZSB7XG4gICAgc3RyZWFtLnBvaW50KHRvWzBdLCB0b1sxXSk7XG4gIH1cbn1cbiIsICJpbXBvcnQge2NhcnRlc2lhbiwgY2FydGVzaWFuQWRkSW5QbGFjZSwgY2FydGVzaWFuQ3Jvc3MsIGNhcnRlc2lhbkRvdCwgY2FydGVzaWFuU2NhbGUsIHNwaGVyaWNhbH0gZnJvbSBcIi4uL2NhcnRlc2lhbi5qc1wiO1xuaW1wb3J0IHtjaXJjbGVTdHJlYW19IGZyb20gXCIuLi9jaXJjbGUuanNcIjtcbmltcG9ydCB7YWJzLCBjb3MsIGVwc2lsb24sIHBpLCByYWRpYW5zLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHBvaW50RXF1YWwgZnJvbSBcIi4uL3BvaW50RXF1YWwuanNcIjtcbmltcG9ydCBjbGlwIGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHJhZGl1cykge1xuICB2YXIgY3IgPSBjb3MocmFkaXVzKSxcbiAgICAgIGRlbHRhID0gMiAqIHJhZGlhbnMsXG4gICAgICBzbWFsbFJhZGl1cyA9IGNyID4gMCxcbiAgICAgIG5vdEhlbWlzcGhlcmUgPSBhYnMoY3IpID4gZXBzaWxvbjsgLy8gVE9ETyBvcHRpbWlzZSBmb3IgdGhpcyBjb21tb24gY2FzZVxuXG4gIGZ1bmN0aW9uIGludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIHN0cmVhbSkge1xuICAgIGNpcmNsZVN0cmVhbShzdHJlYW0sIHJhZGl1cywgZGVsdGEsIGRpcmVjdGlvbiwgZnJvbSwgdG8pO1xuICB9XG5cbiAgZnVuY3Rpb24gdmlzaWJsZShsYW1iZGEsIHBoaSkge1xuICAgIHJldHVybiBjb3MobGFtYmRhKSAqIGNvcyhwaGkpID4gY3I7XG4gIH1cblxuICAvLyBUYWtlcyBhIGxpbmUgYW5kIGN1dHMgaW50byB2aXNpYmxlIHNlZ21lbnRzLiBSZXR1cm4gdmFsdWVzIHVzZWQgZm9yIHBvbHlnb25cbiAgLy8gY2xpcHBpbmc6IDAgLSB0aGVyZSB3ZXJlIGludGVyc2VjdGlvbnMgb3IgdGhlIGxpbmUgd2FzIGVtcHR5OyAxIC0gbm9cbiAgLy8gaW50ZXJzZWN0aW9ucyAyIC0gdGhlcmUgd2VyZSBpbnRlcnNlY3Rpb25zLCBhbmQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gIC8vIHNob3VsZCBiZSByZWpvaW5lZC5cbiAgZnVuY3Rpb24gY2xpcExpbmUoc3RyZWFtKSB7XG4gICAgdmFyIHBvaW50MCwgLy8gcHJldmlvdXMgcG9pbnRcbiAgICAgICAgYzAsIC8vIGNvZGUgZm9yIHByZXZpb3VzIHBvaW50XG4gICAgICAgIHYwLCAvLyB2aXNpYmlsaXR5IG9mIHByZXZpb3VzIHBvaW50XG4gICAgICAgIHYwMCwgLy8gdmlzaWJpbGl0eSBvZiBmaXJzdCBwb2ludFxuICAgICAgICBjbGVhbjsgLy8gbm8gaW50ZXJzZWN0aW9uc1xuICAgIHJldHVybiB7XG4gICAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2MDAgPSB2MCA9IGZhbHNlO1xuICAgICAgICBjbGVhbiA9IDE7XG4gICAgICB9LFxuICAgICAgcG9pbnQ6IGZ1bmN0aW9uKGxhbWJkYSwgcGhpKSB7XG4gICAgICAgIHZhciBwb2ludDEgPSBbbGFtYmRhLCBwaGldLFxuICAgICAgICAgICAgcG9pbnQyLFxuICAgICAgICAgICAgdiA9IHZpc2libGUobGFtYmRhLCBwaGkpLFxuICAgICAgICAgICAgYyA9IHNtYWxsUmFkaXVzXG4gICAgICAgICAgICAgID8gdiA/IDAgOiBjb2RlKGxhbWJkYSwgcGhpKVxuICAgICAgICAgICAgICA6IHYgPyBjb2RlKGxhbWJkYSArIChsYW1iZGEgPCAwID8gcGkgOiAtcGkpLCBwaGkpIDogMDtcbiAgICAgICAgaWYgKCFwb2ludDAgJiYgKHYwMCA9IHYwID0gdikpIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgaWYgKHYgIT09IHYwKSB7XG4gICAgICAgICAgcG9pbnQyID0gaW50ZXJzZWN0KHBvaW50MCwgcG9pbnQxKTtcbiAgICAgICAgICBpZiAoIXBvaW50MiB8fCBwb2ludEVxdWFsKHBvaW50MCwgcG9pbnQyKSB8fCBwb2ludEVxdWFsKHBvaW50MSwgcG9pbnQyKSlcbiAgICAgICAgICAgIHBvaW50MVsyXSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHYgIT09IHYwKSB7XG4gICAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAvLyBvdXRzaWRlIGdvaW5nIGluXG4gICAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBwb2ludDIgPSBpbnRlcnNlY3QocG9pbnQxLCBwb2ludDApO1xuICAgICAgICAgICAgc3RyZWFtLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaW5zaWRlIGdvaW5nIG91dFxuICAgICAgICAgICAgcG9pbnQyID0gaW50ZXJzZWN0KHBvaW50MCwgcG9pbnQxKTtcbiAgICAgICAgICAgIHN0cmVhbS5wb2ludChwb2ludDJbMF0sIHBvaW50MlsxXSwgMik7XG4gICAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb2ludDAgPSBwb2ludDI7XG4gICAgICAgIH0gZWxzZSBpZiAobm90SGVtaXNwaGVyZSAmJiBwb2ludDAgJiYgc21hbGxSYWRpdXMgXiB2KSB7XG4gICAgICAgICAgdmFyIHQ7XG4gICAgICAgICAgLy8gSWYgdGhlIGNvZGVzIGZvciB0d28gcG9pbnRzIGFyZSBkaWZmZXJlbnQsIG9yIGFyZSBib3RoIHplcm8sXG4gICAgICAgICAgLy8gYW5kIHRoZXJlIHRoaXMgc2VnbWVudCBpbnRlcnNlY3RzIHdpdGggdGhlIHNtYWxsIGNpcmNsZS5cbiAgICAgICAgICBpZiAoIShjICYgYzApICYmICh0ID0gaW50ZXJzZWN0KHBvaW50MSwgcG9pbnQwLCB0cnVlKSkpIHtcbiAgICAgICAgICAgIGNsZWFuID0gMDtcbiAgICAgICAgICAgIGlmIChzbWFsbFJhZGl1cykge1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzBdWzBdLCB0WzBdWzFdKTtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMV1bMF0sIHRbMV1bMV0pO1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RyZWFtLnBvaW50KHRbMV1bMF0sIHRbMV1bMV0pO1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIHN0cmVhbS5wb2ludCh0WzBdWzBdLCB0WzBdWzFdLCAzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHYgJiYgKCFwb2ludDAgfHwgIXBvaW50RXF1YWwocG9pbnQwLCBwb2ludDEpKSkge1xuICAgICAgICAgIHN0cmVhbS5wb2ludChwb2ludDFbMF0sIHBvaW50MVsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgcG9pbnQwID0gcG9pbnQxLCB2MCA9IHYsIGMwID0gYztcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHYwKSBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICBwb2ludDAgPSBudWxsO1xuICAgICAgfSxcbiAgICAgIC8vIFJlam9pbiBmaXJzdCBhbmQgbGFzdCBzZWdtZW50cyBpZiB0aGVyZSB3ZXJlIGludGVyc2VjdGlvbnMgYW5kIHRoZSBmaXJzdFxuICAgICAgLy8gYW5kIGxhc3QgcG9pbnRzIHdlcmUgdmlzaWJsZS5cbiAgICAgIGNsZWFuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNsZWFuIHwgKCh2MDAgJiYgdjApIDw8IDEpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBJbnRlcnNlY3RzIHRoZSBncmVhdCBjaXJjbGUgYmV0d2VlbiBhIGFuZCBiIHdpdGggdGhlIGNsaXAgY2lyY2xlLlxuICBmdW5jdGlvbiBpbnRlcnNlY3QoYSwgYiwgdHdvKSB7XG4gICAgdmFyIHBhID0gY2FydGVzaWFuKGEpLFxuICAgICAgICBwYiA9IGNhcnRlc2lhbihiKTtcblxuICAgIC8vIFdlIGhhdmUgdHdvIHBsYW5lcywgbjEucCA9IGQxIGFuZCBuMi5wID0gZDIuXG4gICAgLy8gRmluZCBpbnRlcnNlY3Rpb24gbGluZSBwKHQpID0gYzEgbjEgKyBjMiBuMiArIHQgKG4xIFx1MkEyRiBuMikuXG4gICAgdmFyIG4xID0gWzEsIDAsIDBdLCAvLyBub3JtYWxcbiAgICAgICAgbjIgPSBjYXJ0ZXNpYW5Dcm9zcyhwYSwgcGIpLFxuICAgICAgICBuMm4yID0gY2FydGVzaWFuRG90KG4yLCBuMiksXG4gICAgICAgIG4xbjIgPSBuMlswXSwgLy8gY2FydGVzaWFuRG90KG4xLCBuMiksXG4gICAgICAgIGRldGVybWluYW50ID0gbjJuMiAtIG4xbjIgKiBuMW4yO1xuXG4gICAgLy8gVHdvIHBvbGFyIHBvaW50cy5cbiAgICBpZiAoIWRldGVybWluYW50KSByZXR1cm4gIXR3byAmJiBhO1xuXG4gICAgdmFyIGMxID0gIGNyICogbjJuMiAvIGRldGVybWluYW50LFxuICAgICAgICBjMiA9IC1jciAqIG4xbjIgLyBkZXRlcm1pbmFudCxcbiAgICAgICAgbjF4bjIgPSBjYXJ0ZXNpYW5Dcm9zcyhuMSwgbjIpLFxuICAgICAgICBBID0gY2FydGVzaWFuU2NhbGUobjEsIGMxKSxcbiAgICAgICAgQiA9IGNhcnRlc2lhblNjYWxlKG4yLCBjMik7XG4gICAgY2FydGVzaWFuQWRkSW5QbGFjZShBLCBCKTtcblxuICAgIC8vIFNvbHZlIHxwKHQpfF4yID0gMS5cbiAgICB2YXIgdSA9IG4xeG4yLFxuICAgICAgICB3ID0gY2FydGVzaWFuRG90KEEsIHUpLFxuICAgICAgICB1dSA9IGNhcnRlc2lhbkRvdCh1LCB1KSxcbiAgICAgICAgdDIgPSB3ICogdyAtIHV1ICogKGNhcnRlc2lhbkRvdChBLCBBKSAtIDEpO1xuXG4gICAgaWYgKHQyIDwgMCkgcmV0dXJuO1xuXG4gICAgdmFyIHQgPSBzcXJ0KHQyKSxcbiAgICAgICAgcSA9IGNhcnRlc2lhblNjYWxlKHUsICgtdyAtIHQpIC8gdXUpO1xuICAgIGNhcnRlc2lhbkFkZEluUGxhY2UocSwgQSk7XG4gICAgcSA9IHNwaGVyaWNhbChxKTtcblxuICAgIGlmICghdHdvKSByZXR1cm4gcTtcblxuICAgIC8vIFR3byBpbnRlcnNlY3Rpb24gcG9pbnRzLlxuICAgIHZhciBsYW1iZGEwID0gYVswXSxcbiAgICAgICAgbGFtYmRhMSA9IGJbMF0sXG4gICAgICAgIHBoaTAgPSBhWzFdLFxuICAgICAgICBwaGkxID0gYlsxXSxcbiAgICAgICAgejtcblxuICAgIGlmIChsYW1iZGExIDwgbGFtYmRhMCkgeiA9IGxhbWJkYTAsIGxhbWJkYTAgPSBsYW1iZGExLCBsYW1iZGExID0gejtcblxuICAgIHZhciBkZWx0YSA9IGxhbWJkYTEgLSBsYW1iZGEwLFxuICAgICAgICBwb2xhciA9IGFicyhkZWx0YSAtIHBpKSA8IGVwc2lsb24sXG4gICAgICAgIG1lcmlkaWFuID0gcG9sYXIgfHwgZGVsdGEgPCBlcHNpbG9uO1xuXG4gICAgaWYgKCFwb2xhciAmJiBwaGkxIDwgcGhpMCkgeiA9IHBoaTAsIHBoaTAgPSBwaGkxLCBwaGkxID0gejtcblxuICAgIC8vIENoZWNrIHRoYXQgdGhlIGZpcnN0IHBvaW50IGlzIGJldHdlZW4gYSBhbmQgYi5cbiAgICBpZiAobWVyaWRpYW5cbiAgICAgICAgPyBwb2xhclxuICAgICAgICAgID8gcGhpMCArIHBoaTEgPiAwIF4gcVsxXSA8IChhYnMocVswXSAtIGxhbWJkYTApIDwgZXBzaWxvbiA/IHBoaTAgOiBwaGkxKVxuICAgICAgICAgIDogcGhpMCA8PSBxWzFdICYmIHFbMV0gPD0gcGhpMVxuICAgICAgICA6IGRlbHRhID4gcGkgXiAobGFtYmRhMCA8PSBxWzBdICYmIHFbMF0gPD0gbGFtYmRhMSkpIHtcbiAgICAgIHZhciBxMSA9IGNhcnRlc2lhblNjYWxlKHUsICgtdyArIHQpIC8gdXUpO1xuICAgICAgY2FydGVzaWFuQWRkSW5QbGFjZShxMSwgQSk7XG4gICAgICByZXR1cm4gW3EsIHNwaGVyaWNhbChxMSldO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdlbmVyYXRlcyBhIDQtYml0IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2F0aW9uIG9mIGEgcG9pbnQgcmVsYXRpdmUgdG9cbiAgLy8gdGhlIHNtYWxsIGNpcmNsZSdzIGJvdW5kaW5nIGJveC5cbiAgZnVuY3Rpb24gY29kZShsYW1iZGEsIHBoaSkge1xuICAgIHZhciByID0gc21hbGxSYWRpdXMgPyByYWRpdXMgOiBwaSAtIHJhZGl1cyxcbiAgICAgICAgY29kZSA9IDA7XG4gICAgaWYgKGxhbWJkYSA8IC1yKSBjb2RlIHw9IDE7IC8vIGxlZnRcbiAgICBlbHNlIGlmIChsYW1iZGEgPiByKSBjb2RlIHw9IDI7IC8vIHJpZ2h0XG4gICAgaWYgKHBoaSA8IC1yKSBjb2RlIHw9IDQ7IC8vIGJlbG93XG4gICAgZWxzZSBpZiAocGhpID4gcikgY29kZSB8PSA4OyAvLyBhYm92ZVxuICAgIHJldHVybiBjb2RlO1xuICB9XG5cbiAgcmV0dXJuIGNsaXAodmlzaWJsZSwgY2xpcExpbmUsIGludGVycG9sYXRlLCBzbWFsbFJhZGl1cyA/IFswLCAtcmFkaXVzXSA6IFstcGksIHJhZGl1cyAtIHBpXSk7XG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGJ4ID0gYlswXSxcbiAgICAgIGJ5ID0gYlsxXSxcbiAgICAgIHQwID0gMCxcbiAgICAgIHQxID0gMSxcbiAgICAgIGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIHI7XG5cbiAgciA9IHgwIC0gYXg7XG4gIGlmICghZHggJiYgciA+IDApIHJldHVybjtcbiAgciAvPSBkeDtcbiAgaWYgKGR4IDwgMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgaWYgKHIgPiB0MSkgcmV0dXJuO1xuICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgfVxuXG4gIHIgPSB4MSAtIGF4O1xuICBpZiAoIWR4ICYmIHIgPCAwKSByZXR1cm47XG4gIHIgLz0gZHg7XG4gIGlmIChkeCA8IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9IGVsc2UgaWYgKGR4ID4gMCkge1xuICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICBpZiAociA8IHQxKSB0MSA9IHI7XG4gIH1cblxuICByID0geTAgLSBheTtcbiAgaWYgKCFkeSAmJiByID4gMCkgcmV0dXJuO1xuICByIC89IGR5O1xuICBpZiAoZHkgPCAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfSBlbHNlIGlmIChkeSA+IDApIHtcbiAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICB9XG5cbiAgciA9IHkxIC0gYXk7XG4gIGlmICghZHkgJiYgciA8IDApIHJldHVybjtcbiAgciAvPSBkeTtcbiAgaWYgKGR5IDwgMCkge1xuICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICBpZiAociA+IHQwKSB0MCA9IHI7XG4gIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgaWYgKHIgPCB0MCkgcmV0dXJuO1xuICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgfVxuXG4gIGlmICh0MCA+IDApIGFbMF0gPSBheCArIHQwICogZHgsIGFbMV0gPSBheSArIHQwICogZHk7XG4gIGlmICh0MSA8IDEpIGJbMF0gPSBheCArIHQxICogZHgsIGJbMV0gPSBheSArIHQxICogZHk7XG4gIHJldHVybiB0cnVlO1xufVxuIiwgImltcG9ydCB7YWJzLCBlcHNpbG9ufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IGNsaXBCdWZmZXIgZnJvbSBcIi4vYnVmZmVyLmpzXCI7XG5pbXBvcnQgY2xpcExpbmUgZnJvbSBcIi4vbGluZS5qc1wiO1xuaW1wb3J0IGNsaXBSZWpvaW4gZnJvbSBcIi4vcmVqb2luLmpzXCI7XG5pbXBvcnQge21lcmdlfSBmcm9tIFwiZDMtYXJyYXlcIjtcblxudmFyIGNsaXBNYXggPSAxZTksIGNsaXBNaW4gPSAtY2xpcE1heDtcblxuLy8gVE9ETyBVc2UgZDMtcG9seWdvblx1MjAxOXMgcG9seWdvbkNvbnRhaW5zIGhlcmUgZm9yIHRoZSByaW5nIGNoZWNrP1xuLy8gVE9ETyBFbGltaW5hdGUgZHVwbGljYXRlIGJ1ZmZlcmluZyBpbiBjbGlwQnVmZmVyIGFuZCBwb2x5Z29uLnB1c2g/XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNsaXBSZWN0YW5nbGUoeDAsIHkwLCB4MSwgeTEpIHtcblxuICBmdW5jdGlvbiB2aXNpYmxlKHgsIHkpIHtcbiAgICByZXR1cm4geDAgPD0geCAmJiB4IDw9IHgxICYmIHkwIDw9IHkgJiYgeSA8PSB5MTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIHN0cmVhbSkge1xuICAgIHZhciBhID0gMCwgYTEgPSAwO1xuICAgIGlmIChmcm9tID09IG51bGxcbiAgICAgICAgfHwgKGEgPSBjb3JuZXIoZnJvbSwgZGlyZWN0aW9uKSkgIT09IChhMSA9IGNvcm5lcih0bywgZGlyZWN0aW9uKSlcbiAgICAgICAgfHwgY29tcGFyZVBvaW50KGZyb20sIHRvKSA8IDAgXiBkaXJlY3Rpb24gPiAwKSB7XG4gICAgICBkbyBzdHJlYW0ucG9pbnQoYSA9PT0gMCB8fCBhID09PSAzID8geDAgOiB4MSwgYSA+IDEgPyB5MSA6IHkwKTtcbiAgICAgIHdoaWxlICgoYSA9IChhICsgZGlyZWN0aW9uICsgNCkgJSA0KSAhPT0gYTEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0ucG9pbnQodG9bMF0sIHRvWzFdKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb3JuZXIocCwgZGlyZWN0aW9uKSB7XG4gICAgcmV0dXJuIGFicyhwWzBdIC0geDApIDwgZXBzaWxvbiA/IGRpcmVjdGlvbiA+IDAgPyAwIDogM1xuICAgICAgICA6IGFicyhwWzBdIC0geDEpIDwgZXBzaWxvbiA/IGRpcmVjdGlvbiA+IDAgPyAyIDogMVxuICAgICAgICA6IGFicyhwWzFdIC0geTApIDwgZXBzaWxvbiA/IGRpcmVjdGlvbiA+IDAgPyAxIDogMFxuICAgICAgICA6IGRpcmVjdGlvbiA+IDAgPyAzIDogMjsgLy8gYWJzKHBbMV0gLSB5MSkgPCBlcHNpbG9uXG4gIH1cblxuICBmdW5jdGlvbiBjb21wYXJlSW50ZXJzZWN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gY29tcGFyZVBvaW50KGEueCwgYi54KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVQb2ludChhLCBiKSB7XG4gICAgdmFyIGNhID0gY29ybmVyKGEsIDEpLFxuICAgICAgICBjYiA9IGNvcm5lcihiLCAxKTtcbiAgICByZXR1cm4gY2EgIT09IGNiID8gY2EgLSBjYlxuICAgICAgICA6IGNhID09PSAwID8gYlsxXSAtIGFbMV1cbiAgICAgICAgOiBjYSA9PT0gMSA/IGFbMF0gLSBiWzBdXG4gICAgICAgIDogY2EgPT09IDIgPyBhWzFdIC0gYlsxXVxuICAgICAgICA6IGJbMF0gLSBhWzBdO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBhY3RpdmVTdHJlYW0gPSBzdHJlYW0sXG4gICAgICAgIGJ1ZmZlclN0cmVhbSA9IGNsaXBCdWZmZXIoKSxcbiAgICAgICAgc2VnbWVudHMsXG4gICAgICAgIHBvbHlnb24sXG4gICAgICAgIHJpbmcsXG4gICAgICAgIHhfXywgeV9fLCB2X18sIC8vIGZpcnN0IHBvaW50XG4gICAgICAgIHhfLCB5Xywgdl8sIC8vIHByZXZpb3VzIHBvaW50XG4gICAgICAgIGZpcnN0LFxuICAgICAgICBjbGVhbjtcblxuICAgIHZhciBjbGlwU3RyZWFtID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBwb2x5Z29uU3RhcnQsXG4gICAgICBwb2x5Z29uRW5kOiBwb2x5Z29uRW5kXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgIGlmICh2aXNpYmxlKHgsIHkpKSBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9seWdvbkluc2lkZSgpIHtcbiAgICAgIHZhciB3aW5kaW5nID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2x5Z29uLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBmb3IgKHZhciByaW5nID0gcG9seWdvbltpXSwgaiA9IDEsIG0gPSByaW5nLmxlbmd0aCwgcG9pbnQgPSByaW5nWzBdLCBhMCwgYTEsIGIwID0gcG9pbnRbMF0sIGIxID0gcG9pbnRbMV07IGogPCBtOyArK2opIHtcbiAgICAgICAgICBhMCA9IGIwLCBhMSA9IGIxLCBwb2ludCA9IHJpbmdbal0sIGIwID0gcG9pbnRbMF0sIGIxID0gcG9pbnRbMV07XG4gICAgICAgICAgaWYgKGExIDw9IHkxKSB7IGlmIChiMSA+IHkxICYmIChiMCAtIGEwKSAqICh5MSAtIGExKSA+IChiMSAtIGExKSAqICh4MCAtIGEwKSkgKyt3aW5kaW5nOyB9XG4gICAgICAgICAgZWxzZSB7IGlmIChiMSA8PSB5MSAmJiAoYjAgLSBhMCkgKiAoeTEgLSBhMSkgPCAoYjEgLSBhMSkgKiAoeDAgLSBhMCkpIC0td2luZGluZzsgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB3aW5kaW5nO1xuICAgIH1cblxuICAgIC8vIEJ1ZmZlciBnZW9tZXRyeSB3aXRoaW4gYSBwb2x5Z29uIGFuZCB0aGVuIGNsaXAgaXQgZW4gbWFzc2UuXG4gICAgZnVuY3Rpb24gcG9seWdvblN0YXJ0KCkge1xuICAgICAgYWN0aXZlU3RyZWFtID0gYnVmZmVyU3RyZWFtLCBzZWdtZW50cyA9IFtdLCBwb2x5Z29uID0gW10sIGNsZWFuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb2x5Z29uRW5kKCkge1xuICAgICAgdmFyIHN0YXJ0SW5zaWRlID0gcG9seWdvbkluc2lkZSgpLFxuICAgICAgICAgIGNsZWFuSW5zaWRlID0gY2xlYW4gJiYgc3RhcnRJbnNpZGUsXG4gICAgICAgICAgdmlzaWJsZSA9IChzZWdtZW50cyA9IG1lcmdlKHNlZ21lbnRzKSkubGVuZ3RoO1xuICAgICAgaWYgKGNsZWFuSW5zaWRlIHx8IHZpc2libGUpIHtcbiAgICAgICAgc3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICAgICAgICBpZiAoY2xlYW5JbnNpZGUpIHtcbiAgICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgc3RyZWFtKTtcbiAgICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgY2xpcFJlam9pbihzZWdtZW50cywgY29tcGFyZUludGVyc2VjdGlvbiwgc3RhcnRJbnNpZGUsIGludGVycG9sYXRlLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgICB9XG4gICAgICBhY3RpdmVTdHJlYW0gPSBzdHJlYW0sIHNlZ21lbnRzID0gcG9seWdvbiA9IHJpbmcgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgIGNsaXBTdHJlYW0ucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgICBpZiAocG9seWdvbikgcG9seWdvbi5wdXNoKHJpbmcgPSBbXSk7XG4gICAgICBmaXJzdCA9IHRydWU7XG4gICAgICB2XyA9IGZhbHNlO1xuICAgICAgeF8gPSB5XyA9IE5hTjtcbiAgICB9XG5cbiAgICAvLyBUT0RPIHJhdGhlciB0aGFuIHNwZWNpYWwtY2FzZSBwb2x5Z29ucywgc2ltcGx5IGhhbmRsZSB0aGVtIHNlcGFyYXRlbHkuXG4gICAgLy8gSWRlYWxseSwgY29pbmNpZGVudCBpbnRlcnNlY3Rpb24gcG9pbnRzIHNob3VsZCBiZSBqaXR0ZXJlZCB0byBhdm9pZFxuICAgIC8vIGNsaXBwaW5nIGlzc3Vlcy5cbiAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgaWYgKHNlZ21lbnRzKSB7XG4gICAgICAgIGxpbmVQb2ludCh4X18sIHlfXyk7XG4gICAgICAgIGlmICh2X18gJiYgdl8pIGJ1ZmZlclN0cmVhbS5yZWpvaW4oKTtcbiAgICAgICAgc2VnbWVudHMucHVzaChidWZmZXJTdHJlYW0ucmVzdWx0KCkpO1xuICAgICAgfVxuICAgICAgY2xpcFN0cmVhbS5wb2ludCA9IHBvaW50O1xuICAgICAgaWYgKHZfKSBhY3RpdmVTdHJlYW0ubGluZUVuZCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVQb2ludCh4LCB5KSB7XG4gICAgICB2YXIgdiA9IHZpc2libGUoeCwgeSk7XG4gICAgICBpZiAocG9seWdvbikgcmluZy5wdXNoKFt4LCB5XSk7XG4gICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgeF9fID0geCwgeV9fID0geSwgdl9fID0gdjtcbiAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICBhY3RpdmVTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgYWN0aXZlU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodiAmJiB2XykgYWN0aXZlU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgYSA9IFt4XyA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHhfKSksIHlfID0gTWF0aC5tYXgoY2xpcE1pbiwgTWF0aC5taW4oY2xpcE1heCwgeV8pKV0sXG4gICAgICAgICAgICAgIGIgPSBbeCA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHgpKSwgeSA9IE1hdGgubWF4KGNsaXBNaW4sIE1hdGgubWluKGNsaXBNYXgsIHkpKV07XG4gICAgICAgICAgaWYgKGNsaXBMaW5lKGEsIGIsIHgwLCB5MCwgeDEsIHkxKSkge1xuICAgICAgICAgICAgaWYgKCF2Xykge1xuICAgICAgICAgICAgICBhY3RpdmVTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludChhWzBdLCBhWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdGl2ZVN0cmVhbS5wb2ludChiWzBdLCBiWzFdKTtcbiAgICAgICAgICAgIGlmICghdikgYWN0aXZlU3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIGlmICh2KSB7XG4gICAgICAgICAgICBhY3RpdmVTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBhY3RpdmVTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgICAgICBjbGVhbiA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgeF8gPSB4LCB5XyA9IHksIHZfID0gdjtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xpcFN0cmVhbTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge3JhbmdlfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7YWJzLCBjZWlsLCBlcHNpbG9ufSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIGdyYXRpY3VsZVgoeTAsIHkxLCBkeSkge1xuICB2YXIgeSA9IHJhbmdlKHkwLCB5MSAtIGVwc2lsb24sIGR5KS5jb25jYXQoeTEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4geS5tYXAoZnVuY3Rpb24oeSkgeyByZXR1cm4gW3gsIHldOyB9KTsgfTtcbn1cblxuZnVuY3Rpb24gZ3JhdGljdWxlWSh4MCwgeDEsIGR4KSB7XG4gIHZhciB4ID0gcmFuZ2UoeDAsIHgxIC0gZXBzaWxvbiwgZHgpLmNvbmNhdCh4MSk7XG4gIHJldHVybiBmdW5jdGlvbih5KSB7IHJldHVybiB4Lm1hcChmdW5jdGlvbih4KSB7IHJldHVybiBbeCwgeV07IH0pOyB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBncmF0aWN1bGUoKSB7XG4gIHZhciB4MSwgeDAsIFgxLCBYMCxcbiAgICAgIHkxLCB5MCwgWTEsIFkwLFxuICAgICAgZHggPSAxMCwgZHkgPSBkeCwgRFggPSA5MCwgRFkgPSAzNjAsXG4gICAgICB4LCB5LCBYLCBZLFxuICAgICAgcHJlY2lzaW9uID0gMi41O1xuXG4gIGZ1bmN0aW9uIGdyYXRpY3VsZSgpIHtcbiAgICByZXR1cm4ge3R5cGU6IFwiTXVsdGlMaW5lU3RyaW5nXCIsIGNvb3JkaW5hdGVzOiBsaW5lcygpfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmVzKCkge1xuICAgIHJldHVybiByYW5nZShjZWlsKFgwIC8gRFgpICogRFgsIFgxLCBEWCkubWFwKFgpXG4gICAgICAgIC5jb25jYXQocmFuZ2UoY2VpbChZMCAvIERZKSAqIERZLCBZMSwgRFkpLm1hcChZKSlcbiAgICAgICAgLmNvbmNhdChyYW5nZShjZWlsKHgwIC8gZHgpICogZHgsIHgxLCBkeCkuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIGFicyh4ICUgRFgpID4gZXBzaWxvbjsgfSkubWFwKHgpKVxuICAgICAgICAuY29uY2F0KHJhbmdlKGNlaWwoeTAgLyBkeSkgKiBkeSwgeTEsIGR5KS5maWx0ZXIoZnVuY3Rpb24oeSkgeyByZXR1cm4gYWJzKHkgJSBEWSkgPiBlcHNpbG9uOyB9KS5tYXAoeSkpO1xuICB9XG5cbiAgZ3JhdGljdWxlLmxpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGxpbmVzKCkubWFwKGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7IHJldHVybiB7dHlwZTogXCJMaW5lU3RyaW5nXCIsIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc307IH0pO1xuICB9O1xuXG4gIGdyYXRpY3VsZS5vdXRsaW5lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiUG9seWdvblwiLFxuICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgWChYMCkuY29uY2F0KFxuICAgICAgICBZKFkxKS5zbGljZSgxKSxcbiAgICAgICAgWChYMSkucmV2ZXJzZSgpLnNsaWNlKDEpLFxuICAgICAgICBZKFkwKS5yZXZlcnNlKCkuc2xpY2UoMSkpXG4gICAgICBdXG4gICAgfTtcbiAgfTtcblxuICBncmF0aWN1bGUuZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGdyYXRpY3VsZS5leHRlbnRNaW5vcigpO1xuICAgIHJldHVybiBncmF0aWN1bGUuZXh0ZW50TWFqb3IoXykuZXh0ZW50TWlub3IoXyk7XG4gIH07XG5cbiAgZ3JhdGljdWxlLmV4dGVudE1ham9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtbWDAsIFkwXSwgW1gxLCBZMV1dO1xuICAgIFgwID0gK19bMF1bMF0sIFgxID0gK19bMV1bMF07XG4gICAgWTAgPSArX1swXVsxXSwgWTEgPSArX1sxXVsxXTtcbiAgICBpZiAoWDAgPiBYMSkgXyA9IFgwLCBYMCA9IFgxLCBYMSA9IF87XG4gICAgaWYgKFkwID4gWTEpIF8gPSBZMCwgWTAgPSBZMSwgWTEgPSBfO1xuICAgIHJldHVybiBncmF0aWN1bGUucHJlY2lzaW9uKHByZWNpc2lvbik7XG4gIH07XG5cbiAgZ3JhdGljdWxlLmV4dGVudE1pbm9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtbeDAsIHkwXSwgW3gxLCB5MV1dO1xuICAgIHgwID0gK19bMF1bMF0sIHgxID0gK19bMV1bMF07XG4gICAgeTAgPSArX1swXVsxXSwgeTEgPSArX1sxXVsxXTtcbiAgICBpZiAoeDAgPiB4MSkgXyA9IHgwLCB4MCA9IHgxLCB4MSA9IF87XG4gICAgaWYgKHkwID4geTEpIF8gPSB5MCwgeTAgPSB5MSwgeTEgPSBfO1xuICAgIHJldHVybiBncmF0aWN1bGUucHJlY2lzaW9uKHByZWNpc2lvbik7XG4gIH07XG5cbiAgZ3JhdGljdWxlLnN0ZXAgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLnN0ZXBNaW5vcigpO1xuICAgIHJldHVybiBncmF0aWN1bGUuc3RlcE1ham9yKF8pLnN0ZXBNaW5vcihfKTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcE1ham9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtEWCwgRFldO1xuICAgIERYID0gK19bMF0sIERZID0gK19bMV07XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICBncmF0aWN1bGUuc3RlcE1pbm9yID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFtkeCwgZHldO1xuICAgIGR4ID0gK19bMF0sIGR5ID0gK19bMV07XG4gICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgfTtcblxuICBncmF0aWN1bGUucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHByZWNpc2lvbjtcbiAgICBwcmVjaXNpb24gPSArXztcbiAgICB4ID0gZ3JhdGljdWxlWCh5MCwgeTEsIDkwKTtcbiAgICB5ID0gZ3JhdGljdWxlWSh4MCwgeDEsIHByZWNpc2lvbik7XG4gICAgWCA9IGdyYXRpY3VsZVgoWTAsIFkxLCA5MCk7XG4gICAgWSA9IGdyYXRpY3VsZVkoWDAsIFgxLCBwcmVjaXNpb24pO1xuICAgIHJldHVybiBncmF0aWN1bGU7XG4gIH07XG5cbiAgcmV0dXJuIGdyYXRpY3VsZVxuICAgICAgLmV4dGVudE1ham9yKFtbLTE4MCwgLTkwICsgZXBzaWxvbl0sIFsxODAsIDkwIC0gZXBzaWxvbl1dKVxuICAgICAgLmV4dGVudE1pbm9yKFtbLTE4MCwgLTgwIC0gZXBzaWxvbl0sIFsxODAsIDgwICsgZXBzaWxvbl1dKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdyYXRpY3VsZTEwKCkge1xuICByZXR1cm4gZ3JhdGljdWxlKCkoKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCB4ID0+IHg7XG4iLCAiaW1wb3J0IHtBZGRlcn0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2Fic30gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciBhcmVhU3VtID0gbmV3IEFkZGVyKCksXG4gICAgYXJlYVJpbmdTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICB4MDAsXG4gICAgeTAwLFxuICAgIHgwLFxuICAgIHkwO1xuXG52YXIgYXJlYVN0cmVhbSA9IHtcbiAgcG9pbnQ6IG5vb3AsXG4gIGxpbmVTdGFydDogbm9vcCxcbiAgbGluZUVuZDogbm9vcCxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBhcmVhU3RyZWFtLmxpbmVTdGFydCA9IGFyZWFSaW5nU3RhcnQ7XG4gICAgYXJlYVN0cmVhbS5saW5lRW5kID0gYXJlYVJpbmdFbmQ7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGFyZWFTdHJlYW0ubGluZVN0YXJ0ID0gYXJlYVN0cmVhbS5saW5lRW5kID0gYXJlYVN0cmVhbS5wb2ludCA9IG5vb3A7XG4gICAgYXJlYVN1bS5hZGQoYWJzKGFyZWFSaW5nU3VtKSk7XG4gICAgYXJlYVJpbmdTdW0gPSBuZXcgQWRkZXIoKTtcbiAgfSxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJlYSA9IGFyZWFTdW0gLyAyO1xuICAgIGFyZWFTdW0gPSBuZXcgQWRkZXIoKTtcbiAgICByZXR1cm4gYXJlYTtcbiAgfVxufTtcblxuZnVuY3Rpb24gYXJlYVJpbmdTdGFydCgpIHtcbiAgYXJlYVN0cmVhbS5wb2ludCA9IGFyZWFQb2ludEZpcnN0O1xufVxuXG5mdW5jdGlvbiBhcmVhUG9pbnRGaXJzdCh4LCB5KSB7XG4gIGFyZWFTdHJlYW0ucG9pbnQgPSBhcmVhUG9pbnQ7XG4gIHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5O1xufVxuXG5mdW5jdGlvbiBhcmVhUG9pbnQoeCwgeSkge1xuICBhcmVhUmluZ1N1bS5hZGQoeTAgKiB4IC0geDAgKiB5KTtcbiAgeDAgPSB4LCB5MCA9IHk7XG59XG5cbmZ1bmN0aW9uIGFyZWFSaW5nRW5kKCkge1xuICBhcmVhUG9pbnQoeDAwLCB5MDApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcmVhU3RyZWFtO1xuIiwgImltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciB4MCA9IEluZmluaXR5LFxuICAgIHkwID0geDAsXG4gICAgeDEgPSAteDAsXG4gICAgeTEgPSB4MTtcblxudmFyIGJvdW5kc1N0cmVhbSA9IHtcbiAgcG9pbnQ6IGJvdW5kc1BvaW50LFxuICBsaW5lU3RhcnQ6IG5vb3AsXG4gIGxpbmVFbmQ6IG5vb3AsXG4gIHBvbHlnb25TdGFydDogbm9vcCxcbiAgcG9seWdvbkVuZDogbm9vcCxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYm91bmRzID0gW1t4MCwgeTBdLCBbeDEsIHkxXV07XG4gICAgeDEgPSB5MSA9IC0oeTAgPSB4MCA9IEluZmluaXR5KTtcbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG59O1xuXG5mdW5jdGlvbiBib3VuZHNQb2ludCh4LCB5KSB7XG4gIGlmICh4IDwgeDApIHgwID0geDtcbiAgaWYgKHggPiB4MSkgeDEgPSB4O1xuICBpZiAoeSA8IHkwKSB5MCA9IHk7XG4gIGlmICh5ID4geTEpIHkxID0geTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYm91bmRzU3RyZWFtO1xuIiwgImltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuLy8gVE9ETyBFbmZvcmNlIHBvc2l0aXZlIGFyZWEgZm9yIGV4dGVyaW9yLCBuZWdhdGl2ZSBhcmVhIGZvciBpbnRlcmlvcj9cblxudmFyIFgwID0gMCxcbiAgICBZMCA9IDAsXG4gICAgWjAgPSAwLFxuICAgIFgxID0gMCxcbiAgICBZMSA9IDAsXG4gICAgWjEgPSAwLFxuICAgIFgyID0gMCxcbiAgICBZMiA9IDAsXG4gICAgWjIgPSAwLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBjZW50cm9pZFN0cmVhbSA9IHtcbiAgcG9pbnQ6IGNlbnRyb2lkUG9pbnQsXG4gIGxpbmVTdGFydDogY2VudHJvaWRMaW5lU3RhcnQsXG4gIGxpbmVFbmQ6IGNlbnRyb2lkTGluZUVuZCxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lU3RhcnQgPSBjZW50cm9pZFJpbmdTdGFydDtcbiAgICBjZW50cm9pZFN0cmVhbS5saW5lRW5kID0gY2VudHJvaWRSaW5nRW5kO1xuICB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnQ7XG4gICAgY2VudHJvaWRTdHJlYW0ubGluZVN0YXJ0ID0gY2VudHJvaWRMaW5lU3RhcnQ7XG4gICAgY2VudHJvaWRTdHJlYW0ubGluZUVuZCA9IGNlbnRyb2lkTGluZUVuZDtcbiAgfSxcbiAgcmVzdWx0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2VudHJvaWQgPSBaMiA/IFtYMiAvIFoyLCBZMiAvIFoyXVxuICAgICAgICA6IFoxID8gW1gxIC8gWjEsIFkxIC8gWjFdXG4gICAgICAgIDogWjAgPyBbWDAgLyBaMCwgWTAgLyBaMF1cbiAgICAgICAgOiBbTmFOLCBOYU5dO1xuICAgIFgwID0gWTAgPSBaMCA9XG4gICAgWDEgPSBZMSA9IFoxID1cbiAgICBYMiA9IFkyID0gWjIgPSAwO1xuICAgIHJldHVybiBjZW50cm9pZDtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludCh4LCB5KSB7XG4gIFgwICs9IHg7XG4gIFkwICs9IHk7XG4gICsrWjA7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkTGluZVN0YXJ0KCkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRGaXJzdExpbmU7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRGaXJzdExpbmUoeCwgeSkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRMaW5lO1xuICBjZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludExpbmUoeCwgeSkge1xuICB2YXIgZHggPSB4IC0geDAsIGR5ID0geSAtIHkwLCB6ID0gc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gIFgxICs9IHogKiAoeDAgKyB4KSAvIDI7XG4gIFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gIFoxICs9IHo7XG4gIGNlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xufVxuXG5mdW5jdGlvbiBjZW50cm9pZExpbmVFbmQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludDtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRSaW5nU3RhcnQoKSB7XG4gIGNlbnRyb2lkU3RyZWFtLnBvaW50ID0gY2VudHJvaWRQb2ludEZpcnN0UmluZztcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRSaW5nRW5kKCkge1xuICBjZW50cm9pZFBvaW50UmluZyh4MDAsIHkwMCk7XG59XG5cbmZ1bmN0aW9uIGNlbnRyb2lkUG9pbnRGaXJzdFJpbmcoeCwgeSkge1xuICBjZW50cm9pZFN0cmVhbS5wb2ludCA9IGNlbnRyb2lkUG9pbnRSaW5nO1xuICBjZW50cm9pZFBvaW50KHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5KTtcbn1cblxuZnVuY3Rpb24gY2VudHJvaWRQb2ludFJpbmcoeCwgeSkge1xuICB2YXIgZHggPSB4IC0geDAsXG4gICAgICBkeSA9IHkgLSB5MCxcbiAgICAgIHogPSBzcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblxuICBYMSArPSB6ICogKHgwICsgeCkgLyAyO1xuICBZMSArPSB6ICogKHkwICsgeSkgLyAyO1xuICBaMSArPSB6O1xuXG4gIHogPSB5MCAqIHggLSB4MCAqIHk7XG4gIFgyICs9IHogKiAoeDAgKyB4KTtcbiAgWTIgKz0geiAqICh5MCArIHkpO1xuICBaMiArPSB6ICogMztcbiAgY2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNlbnRyb2lkU3RyZWFtO1xuIiwgImltcG9ydCB7dGF1fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGF0aENvbnRleHQoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuUGF0aENvbnRleHQucHJvdG90eXBlID0ge1xuICBfcmFkaXVzOiA0LjUsXG4gIHBvaW50UmFkaXVzOiBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JhZGl1cyA9IF8sIHRoaXM7XG4gIH0sXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH0sXG4gIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbGluZSA9PT0gMCkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9wb2ludCA9IE5hTjtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8oeCwgeSk7XG4gICAgICAgIHRoaXMuX3BvaW50ID0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4ICsgdGhpcy5fcmFkaXVzLCB5KTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5hcmMoeCwgeSwgdGhpcy5fcmFkaXVzLCAwLCB0YXUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc3VsdDogbm9vcFxufTtcbiIsICJpbXBvcnQge0FkZGVyfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7c3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbnZhciBsZW5ndGhTdW0gPSBuZXcgQWRkZXIoKSxcbiAgICBsZW5ndGhSaW5nLFxuICAgIHgwMCxcbiAgICB5MDAsXG4gICAgeDAsXG4gICAgeTA7XG5cbnZhciBsZW5ndGhTdHJlYW0gPSB7XG4gIHBvaW50OiBub29wLFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50Rmlyc3Q7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChsZW5ndGhSaW5nKSBsZW5ndGhQb2ludCh4MDAsIHkwMCk7XG4gICAgbGVuZ3RoU3RyZWFtLnBvaW50ID0gbm9vcDtcbiAgfSxcbiAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICBsZW5ndGhSaW5nID0gdHJ1ZTtcbiAgfSxcbiAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgbGVuZ3RoUmluZyA9IG51bGw7XG4gIH0sXG4gIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9ICtsZW5ndGhTdW07XG4gICAgbGVuZ3RoU3VtID0gbmV3IEFkZGVyKCk7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfVxufTtcblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnRGaXJzdCh4LCB5KSB7XG4gIGxlbmd0aFN0cmVhbS5wb2ludCA9IGxlbmd0aFBvaW50O1xuICB4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geTtcbn1cblxuZnVuY3Rpb24gbGVuZ3RoUG9pbnQoeCwgeSkge1xuICB4MCAtPSB4LCB5MCAtPSB5O1xuICBsZW5ndGhTdW0uYWRkKHNxcnQoeDAgKiB4MCArIHkwICogeTApKTtcbiAgeDAgPSB4LCB5MCA9IHk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxlbmd0aFN0cmVhbTtcbiIsICIvLyBTaW1wbGUgY2FjaGluZyBmb3IgY29uc3RhbnQtcmFkaXVzIHBvaW50cy5cbmxldCBjYWNoZURpZ2l0cywgY2FjaGVBcHBlbmQsIGNhY2hlUmFkaXVzLCBjYWNoZUNpcmNsZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aFN0cmluZyB7XG4gIGNvbnN0cnVjdG9yKGRpZ2l0cykge1xuICAgIHRoaXMuX2FwcGVuZCA9IGRpZ2l0cyA9PSBudWxsID8gYXBwZW5kIDogYXBwZW5kUm91bmQoZGlnaXRzKTtcbiAgICB0aGlzLl9yYWRpdXMgPSA0LjU7XG4gICAgdGhpcy5fID0gXCJcIjtcbiAgfVxuICBwb2ludFJhZGl1cyhfKSB7XG4gICAgdGhpcy5fcmFkaXVzID0gK187XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcG9seWdvblN0YXJ0KCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9XG4gIHBvbHlnb25FbmQoKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfVxuICBsaW5lU3RhcnQoKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9XG4gIGxpbmVFbmQoKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgPT09IDApIHRoaXMuXyArPSBcIlpcIjtcbiAgICB0aGlzLl9wb2ludCA9IE5hTjtcbiAgfVxuICBwb2ludCh4LCB5KSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB7XG4gICAgICAgIHRoaXMuX2FwcGVuZGBNJHt4fSwke3l9YDtcbiAgICAgICAgdGhpcy5fcG9pbnQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9hcHBlbmRgTCR7eH0sJHt5fWA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aGlzLl9hcHBlbmRgTSR7eH0sJHt5fWA7XG4gICAgICAgIGlmICh0aGlzLl9yYWRpdXMgIT09IGNhY2hlUmFkaXVzIHx8IHRoaXMuX2FwcGVuZCAhPT0gY2FjaGVBcHBlbmQpIHtcbiAgICAgICAgICBjb25zdCByID0gdGhpcy5fcmFkaXVzO1xuICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLl87XG4gICAgICAgICAgdGhpcy5fID0gXCJcIjsgLy8gc3Rhc2ggdGhlIG9sZCBzdHJpbmcgc28gd2UgY2FuIGNhY2hlIHRoZSBjaXJjbGUgcGF0aCBmcmFnbWVudFxuICAgICAgICAgIHRoaXMuX2FwcGVuZGBtMCwke3J9YSR7cn0sJHtyfSAwIDEsMSAwLCR7LTIgKiByfWEke3J9LCR7cn0gMCAxLDEgMCwkezIgKiByfXpgO1xuICAgICAgICAgIGNhY2hlUmFkaXVzID0gcjtcbiAgICAgICAgICBjYWNoZUFwcGVuZCA9IHRoaXMuX2FwcGVuZDtcbiAgICAgICAgICBjYWNoZUNpcmNsZSA9IHRoaXMuXztcbiAgICAgICAgICB0aGlzLl8gPSBzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyArPSBjYWNoZUNpcmNsZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJlc3VsdCgpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl87XG4gICAgdGhpcy5fID0gXCJcIjtcbiAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwZW5kKHN0cmluZ3MpIHtcbiAgbGV0IGkgPSAxO1xuICB0aGlzLl8gKz0gc3RyaW5nc1swXTtcbiAgZm9yIChjb25zdCBqID0gc3RyaW5ncy5sZW5ndGg7IGkgPCBqOyArK2kpIHtcbiAgICB0aGlzLl8gKz0gYXJndW1lbnRzW2ldICsgc3RyaW5nc1tpXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmRSb3VuZChkaWdpdHMpIHtcbiAgY29uc3QgZCA9IE1hdGguZmxvb3IoZGlnaXRzKTtcbiAgaWYgKCEoZCA+PSAwKSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGludmFsaWQgZGlnaXRzOiAke2RpZ2l0c31gKTtcbiAgaWYgKGQgPiAxNSkgcmV0dXJuIGFwcGVuZDtcbiAgaWYgKGQgIT09IGNhY2hlRGlnaXRzKSB7XG4gICAgY29uc3QgayA9IDEwICoqIGQ7XG4gICAgY2FjaGVEaWdpdHMgPSBkO1xuICAgIGNhY2hlQXBwZW5kID0gZnVuY3Rpb24gYXBwZW5kKHN0cmluZ3MpIHtcbiAgICAgIGxldCBpID0gMTtcbiAgICAgIHRoaXMuXyArPSBzdHJpbmdzWzBdO1xuICAgICAgZm9yIChjb25zdCBqID0gc3RyaW5ncy5sZW5ndGg7IGkgPCBqOyArK2kpIHtcbiAgICAgICAgdGhpcy5fICs9IE1hdGgucm91bmQoYXJndW1lbnRzW2ldICogaykgLyBrICsgc3RyaW5nc1tpXTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBjYWNoZUFwcGVuZDtcbn1cbiIsICJpbXBvcnQgaWRlbnRpdHkgZnJvbSBcIi4uL2lkZW50aXR5LmpzXCI7XG5pbXBvcnQgc3RyZWFtIGZyb20gXCIuLi9zdHJlYW0uanNcIjtcbmltcG9ydCBwYXRoQXJlYSBmcm9tIFwiLi9hcmVhLmpzXCI7XG5pbXBvcnQgcGF0aEJvdW5kcyBmcm9tIFwiLi9ib3VuZHMuanNcIjtcbmltcG9ydCBwYXRoQ2VudHJvaWQgZnJvbSBcIi4vY2VudHJvaWQuanNcIjtcbmltcG9ydCBQYXRoQ29udGV4dCBmcm9tIFwiLi9jb250ZXh0LmpzXCI7XG5pbXBvcnQgcGF0aE1lYXN1cmUgZnJvbSBcIi4vbWVhc3VyZS5qc1wiO1xuaW1wb3J0IFBhdGhTdHJpbmcgZnJvbSBcIi4vc3RyaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHByb2plY3Rpb24sIGNvbnRleHQpIHtcbiAgbGV0IGRpZ2l0cyA9IDMsXG4gICAgICBwb2ludFJhZGl1cyA9IDQuNSxcbiAgICAgIHByb2plY3Rpb25TdHJlYW0sXG4gICAgICBjb250ZXh0U3RyZWFtO1xuXG4gIGZ1bmN0aW9uIHBhdGgob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiBwb2ludFJhZGl1cyA9PT0gXCJmdW5jdGlvblwiKSBjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKCtwb2ludFJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0oY29udGV4dFN0cmVhbSkpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dFN0cmVhbS5yZXN1bHQoKTtcbiAgfVxuXG4gIHBhdGguYXJlYSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aEFyZWEpKTtcbiAgICByZXR1cm4gcGF0aEFyZWEucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5tZWFzdXJlID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgc3RyZWFtKG9iamVjdCwgcHJvamVjdGlvblN0cmVhbShwYXRoTWVhc3VyZSkpO1xuICAgIHJldHVybiBwYXRoTWVhc3VyZS5yZXN1bHQoKTtcbiAgfTtcblxuICBwYXRoLmJvdW5kcyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHN0cmVhbShvYmplY3QsIHByb2plY3Rpb25TdHJlYW0ocGF0aEJvdW5kcykpO1xuICAgIHJldHVybiBwYXRoQm91bmRzLnJlc3VsdCgpO1xuICB9O1xuXG4gIHBhdGguY2VudHJvaWQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBzdHJlYW0ob2JqZWN0LCBwcm9qZWN0aW9uU3RyZWFtKHBhdGhDZW50cm9pZCkpO1xuICAgIHJldHVybiBwYXRoQ2VudHJvaWQucmVzdWx0KCk7XG4gIH07XG5cbiAgcGF0aC5wcm9qZWN0aW9uID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHByb2plY3Rpb247XG4gICAgcHJvamVjdGlvblN0cmVhbSA9IF8gPT0gbnVsbCA/IChwcm9qZWN0aW9uID0gbnVsbCwgaWRlbnRpdHkpIDogKHByb2plY3Rpb24gPSBfKS5zdHJlYW07XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcGF0aC5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbnRleHQ7XG4gICAgY29udGV4dFN0cmVhbSA9IF8gPT0gbnVsbCA/IChjb250ZXh0ID0gbnVsbCwgbmV3IFBhdGhTdHJpbmcoZGlnaXRzKSkgOiBuZXcgUGF0aENvbnRleHQoY29udGV4dCA9IF8pO1xuICAgIGlmICh0eXBlb2YgcG9pbnRSYWRpdXMgIT09IFwiZnVuY3Rpb25cIikgY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cyhwb2ludFJhZGl1cyk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcGF0aC5wb2ludFJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwb2ludFJhZGl1cztcbiAgICBwb2ludFJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogKGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMoK18pLCArXyk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgcGF0aC5kaWdpdHMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZGlnaXRzO1xuICAgIGlmIChfID09IG51bGwpIGRpZ2l0cyA9IG51bGw7XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBkID0gTWF0aC5mbG9vcihfKTtcbiAgICAgIGlmICghKGQgPj0gMCkpIHRocm93IG5ldyBSYW5nZUVycm9yKGBpbnZhbGlkIGRpZ2l0czogJHtffWApO1xuICAgICAgZGlnaXRzID0gZDtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQgPT09IG51bGwpIGNvbnRleHRTdHJlYW0gPSBuZXcgUGF0aFN0cmluZyhkaWdpdHMpO1xuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHJldHVybiBwYXRoLnByb2plY3Rpb24ocHJvamVjdGlvbikuZGlnaXRzKGRpZ2l0cykuY29udGV4dChjb250ZXh0KTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtZXRob2RzKSB7XG4gIHJldHVybiB7XG4gICAgc3RyZWFtOiB0cmFuc2Zvcm1lcihtZXRob2RzKVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtZXIobWV0aG9kcykge1xuICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgdmFyIHMgPSBuZXcgVHJhbnNmb3JtU3RyZWFtO1xuICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSBzW2tleV0gPSBtZXRob2RzW2tleV07XG4gICAgcy5zdHJlYW0gPSBzdHJlYW07XG4gICAgcmV0dXJuIHM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybVN0cmVhbSgpIHt9XG5cblRyYW5zZm9ybVN0cmVhbS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm1TdHJlYW0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7IHRoaXMuc3RyZWFtLnBvaW50KHgsIHkpOyB9LFxuICBzcGhlcmU6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5zcGhlcmUoKTsgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ubGluZVN0YXJ0KCk7IH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkgeyB0aGlzLnN0cmVhbS5saW5lRW5kKCk7IH0sXG4gIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHRoaXMuc3RyZWFtLnBvbHlnb25TdGFydCgpOyB9LFxuICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHsgdGhpcy5zdHJlYW0ucG9seWdvbkVuZCgpOyB9XG59O1xuIiwgImltcG9ydCB7ZGVmYXVsdCBhcyBnZW9TdHJlYW19IGZyb20gXCIuLi9zdHJlYW0uanNcIjtcbmltcG9ydCBib3VuZHNTdHJlYW0gZnJvbSBcIi4uL3BhdGgvYm91bmRzLmpzXCI7XG5cbmZ1bmN0aW9uIGZpdChwcm9qZWN0aW9uLCBmaXRCb3VuZHMsIG9iamVjdCkge1xuICB2YXIgY2xpcCA9IHByb2plY3Rpb24uY2xpcEV4dGVudCAmJiBwcm9qZWN0aW9uLmNsaXBFeHRlbnQoKTtcbiAgcHJvamVjdGlvbi5zY2FsZSgxNTApLnRyYW5zbGF0ZShbMCwgMF0pO1xuICBpZiAoY2xpcCAhPSBudWxsKSBwcm9qZWN0aW9uLmNsaXBFeHRlbnQobnVsbCk7XG4gIGdlb1N0cmVhbShvYmplY3QsIHByb2plY3Rpb24uc3RyZWFtKGJvdW5kc1N0cmVhbSkpO1xuICBmaXRCb3VuZHMoYm91bmRzU3RyZWFtLnJlc3VsdCgpKTtcbiAgaWYgKGNsaXAgIT0gbnVsbCkgcHJvamVjdGlvbi5jbGlwRXh0ZW50KGNsaXApO1xuICByZXR1cm4gcHJvamVjdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdEV4dGVudChwcm9qZWN0aW9uLCBleHRlbnQsIG9iamVjdCkge1xuICByZXR1cm4gZml0KHByb2plY3Rpb24sIGZ1bmN0aW9uKGIpIHtcbiAgICB2YXIgdyA9IGV4dGVudFsxXVswXSAtIGV4dGVudFswXVswXSxcbiAgICAgICAgaCA9IGV4dGVudFsxXVsxXSAtIGV4dGVudFswXVsxXSxcbiAgICAgICAgayA9IE1hdGgubWluKHcgLyAoYlsxXVswXSAtIGJbMF1bMF0pLCBoIC8gKGJbMV1bMV0gLSBiWzBdWzFdKSksXG4gICAgICAgIHggPSArZXh0ZW50WzBdWzBdICsgKHcgLSBrICogKGJbMV1bMF0gKyBiWzBdWzBdKSkgLyAyLFxuICAgICAgICB5ID0gK2V4dGVudFswXVsxXSArIChoIC0gayAqIChiWzFdWzFdICsgYlswXVsxXSkpIC8gMjtcbiAgICBwcm9qZWN0aW9uLnNjYWxlKDE1MCAqIGspLnRyYW5zbGF0ZShbeCwgeV0pO1xuICB9LCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0U2l6ZShwcm9qZWN0aW9uLCBzaXplLCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdEV4dGVudChwcm9qZWN0aW9uLCBbWzAsIDBdLCBzaXplXSwgb2JqZWN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpdFdpZHRoKHByb2plY3Rpb24sIHdpZHRoLCBvYmplY3QpIHtcbiAgcmV0dXJuIGZpdChwcm9qZWN0aW9uLCBmdW5jdGlvbihiKSB7XG4gICAgdmFyIHcgPSArd2lkdGgsXG4gICAgICAgIGsgPSB3IC8gKGJbMV1bMF0gLSBiWzBdWzBdKSxcbiAgICAgICAgeCA9ICh3IC0gayAqIChiWzFdWzBdICsgYlswXVswXSkpIC8gMixcbiAgICAgICAgeSA9IC1rICogYlswXVsxXTtcbiAgICBwcm9qZWN0aW9uLnNjYWxlKDE1MCAqIGspLnRyYW5zbGF0ZShbeCwgeV0pO1xuICB9LCBvYmplY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZml0SGVpZ2h0KHByb2plY3Rpb24sIGhlaWdodCwgb2JqZWN0KSB7XG4gIHJldHVybiBmaXQocHJvamVjdGlvbiwgZnVuY3Rpb24oYikge1xuICAgIHZhciBoID0gK2hlaWdodCxcbiAgICAgICAgayA9IGggLyAoYlsxXVsxXSAtIGJbMF1bMV0pLFxuICAgICAgICB4ID0gLWsgKiBiWzBdWzBdLFxuICAgICAgICB5ID0gKGggLSBrICogKGJbMV1bMV0gKyBiWzBdWzFdKSkgLyAyO1xuICAgIHByb2plY3Rpb24uc2NhbGUoMTUwICogaykudHJhbnNsYXRlKFt4LCB5XSk7XG4gIH0sIG9iamVjdCk7XG59XG4iLCAiaW1wb3J0IHtjYXJ0ZXNpYW59IGZyb20gXCIuLi9jYXJ0ZXNpYW4uanNcIjtcbmltcG9ydCB7YWJzLCBhc2luLCBhdGFuMiwgY29zLCBlcHNpbG9uLCByYWRpYW5zLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHt0cmFuc2Zvcm1lcn0gZnJvbSBcIi4uL3RyYW5zZm9ybS5qc1wiO1xuXG52YXIgbWF4RGVwdGggPSAxNiwgLy8gbWF4aW11bSBkZXB0aCBvZiBzdWJkaXZpc2lvblxuICAgIGNvc01pbkRpc3RhbmNlID0gY29zKDMwICogcmFkaWFucyk7IC8vIGNvcyhtaW5pbXVtIGFuZ3VsYXIgZGlzdGFuY2UpXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHByb2plY3QsIGRlbHRhMikge1xuICByZXR1cm4gK2RlbHRhMiA/IHJlc2FtcGxlKHByb2plY3QsIGRlbHRhMikgOiByZXNhbXBsZU5vbmUocHJvamVjdCk7XG59XG5cbmZ1bmN0aW9uIHJlc2FtcGxlTm9uZShwcm9qZWN0KSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcih7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHggPSBwcm9qZWN0KHgsIHkpO1xuICAgICAgdGhpcy5zdHJlYW0ucG9pbnQoeFswXSwgeFsxXSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVzYW1wbGUocHJvamVjdCwgZGVsdGEyKSB7XG5cbiAgZnVuY3Rpb24gcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCBsYW1iZGEwLCBhMCwgYjAsIGMwLCB4MSwgeTEsIGxhbWJkYTEsIGExLCBiMSwgYzEsIGRlcHRoLCBzdHJlYW0pIHtcbiAgICB2YXIgZHggPSB4MSAtIHgwLFxuICAgICAgICBkeSA9IHkxIC0geTAsXG4gICAgICAgIGQyID0gZHggKiBkeCArIGR5ICogZHk7XG4gICAgaWYgKGQyID4gNCAqIGRlbHRhMiAmJiBkZXB0aC0tKSB7XG4gICAgICB2YXIgYSA9IGEwICsgYTEsXG4gICAgICAgICAgYiA9IGIwICsgYjEsXG4gICAgICAgICAgYyA9IGMwICsgYzEsXG4gICAgICAgICAgbSA9IHNxcnQoYSAqIGEgKyBiICogYiArIGMgKiBjKSxcbiAgICAgICAgICBwaGkyID0gYXNpbihjIC89IG0pLFxuICAgICAgICAgIGxhbWJkYTIgPSBhYnMoYWJzKGMpIC0gMSkgPCBlcHNpbG9uIHx8IGFicyhsYW1iZGEwIC0gbGFtYmRhMSkgPCBlcHNpbG9uID8gKGxhbWJkYTAgKyBsYW1iZGExKSAvIDIgOiBhdGFuMihiLCBhKSxcbiAgICAgICAgICBwID0gcHJvamVjdChsYW1iZGEyLCBwaGkyKSxcbiAgICAgICAgICB4MiA9IHBbMF0sXG4gICAgICAgICAgeTIgPSBwWzFdLFxuICAgICAgICAgIGR4MiA9IHgyIC0geDAsXG4gICAgICAgICAgZHkyID0geTIgLSB5MCxcbiAgICAgICAgICBkeiA9IGR5ICogZHgyIC0gZHggKiBkeTI7XG4gICAgICBpZiAoZHogKiBkeiAvIGQyID4gZGVsdGEyIC8vIHBlcnBlbmRpY3VsYXIgcHJvamVjdGVkIGRpc3RhbmNlXG4gICAgICAgICAgfHwgYWJzKChkeCAqIGR4MiArIGR5ICogZHkyKSAvIGQyIC0gMC41KSA+IDAuMyAvLyBtaWRwb2ludCBjbG9zZSB0byBhbiBlbmRcbiAgICAgICAgICB8fCBhMCAqIGExICsgYjAgKiBiMSArIGMwICogYzEgPCBjb3NNaW5EaXN0YW5jZSkgeyAvLyBhbmd1bGFyIGRpc3RhbmNlXG4gICAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgbGFtYmRhMCwgYTAsIGIwLCBjMCwgeDIsIHkyLCBsYW1iZGEyLCBhIC89IG0sIGIgLz0gbSwgYywgZGVwdGgsIHN0cmVhbSk7XG4gICAgICAgIHN0cmVhbS5wb2ludCh4MiwgeTIpO1xuICAgICAgICByZXNhbXBsZUxpbmVUbyh4MiwgeTIsIGxhbWJkYTIsIGEsIGIsIGMsIHgxLCB5MSwgbGFtYmRhMSwgYTEsIGIxLCBjMSwgZGVwdGgsIHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgbGFtYmRhMDAsIHgwMCwgeTAwLCBhMDAsIGIwMCwgYzAwLCAvLyBmaXJzdCBwb2ludFxuICAgICAgICBsYW1iZGEwLCB4MCwgeTAsIGEwLCBiMCwgYzA7IC8vIHByZXZpb3VzIHBvaW50XG5cbiAgICB2YXIgcmVzYW1wbGVTdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkgeyBzdHJlYW0ucG9seWdvblN0YXJ0KCk7IHJlc2FtcGxlU3RyZWFtLmxpbmVTdGFydCA9IHJpbmdTdGFydDsgfSxcbiAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkgeyBzdHJlYW0ucG9seWdvbkVuZCgpOyByZXNhbXBsZVN0cmVhbS5saW5lU3RhcnQgPSBsaW5lU3RhcnQ7IH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgICAgeCA9IHByb2plY3QoeCwgeSk7XG4gICAgICBzdHJlYW0ucG9pbnQoeFswXSwgeFsxXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgeDAgPSBOYU47XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lUG9pbnQobGFtYmRhLCBwaGkpIHtcbiAgICAgIHZhciBjID0gY2FydGVzaWFuKFtsYW1iZGEsIHBoaV0pLCBwID0gcHJvamVjdChsYW1iZGEsIHBoaSk7XG4gICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgwID0gcFswXSwgeTAgPSBwWzFdLCBsYW1iZGEwID0gbGFtYmRhLCBhMCA9IGNbMF0sIGIwID0gY1sxXSwgYzAgPSBjWzJdLCBtYXhEZXB0aCwgc3RyZWFtKTtcbiAgICAgIHN0cmVhbS5wb2ludCh4MCwgeTApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICByZXNhbXBsZVN0cmVhbS5wb2ludCA9IHBvaW50O1xuICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICBsaW5lU3RhcnQoKTtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gcmluZ1BvaW50O1xuICAgICAgcmVzYW1wbGVTdHJlYW0ubGluZUVuZCA9IHJpbmdFbmQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmluZ1BvaW50KGxhbWJkYSwgcGhpKSB7XG4gICAgICBsaW5lUG9pbnQobGFtYmRhMDAgPSBsYW1iZGEsIHBoaSksIHgwMCA9IHgwLCB5MDAgPSB5MCwgYTAwID0gYTAsIGIwMCA9IGIwLCBjMDAgPSBjMDtcbiAgICAgIHJlc2FtcGxlU3RyZWFtLnBvaW50ID0gbGluZVBvaW50O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJpbmdFbmQoKSB7XG4gICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIGxhbWJkYTAsIGEwLCBiMCwgYzAsIHgwMCwgeTAwLCBsYW1iZGEwMCwgYTAwLCBiMDAsIGMwMCwgbWF4RGVwdGgsIHN0cmVhbSk7XG4gICAgICByZXNhbXBsZVN0cmVhbS5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgIGxpbmVFbmQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzYW1wbGVTdHJlYW07XG4gIH07XG59XG4iLCAiaW1wb3J0IGNsaXBBbnRpbWVyaWRpYW4gZnJvbSBcIi4uL2NsaXAvYW50aW1lcmlkaWFuLmpzXCI7XG5pbXBvcnQgY2xpcENpcmNsZSBmcm9tIFwiLi4vY2xpcC9jaXJjbGUuanNcIjtcbmltcG9ydCBjbGlwUmVjdGFuZ2xlIGZyb20gXCIuLi9jbGlwL3JlY3RhbmdsZS5qc1wiO1xuaW1wb3J0IGNvbXBvc2UgZnJvbSBcIi4uL2NvbXBvc2UuanNcIjtcbmltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi4vaWRlbnRpdHkuanNcIjtcbmltcG9ydCB7Y29zLCBkZWdyZWVzLCByYWRpYW5zLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge3JvdGF0ZVJhZGlhbnN9IGZyb20gXCIuLi9yb3RhdGlvbi5qc1wiO1xuaW1wb3J0IHt0cmFuc2Zvcm1lcn0gZnJvbSBcIi4uL3RyYW5zZm9ybS5qc1wiO1xuaW1wb3J0IHtmaXRFeHRlbnQsIGZpdFNpemUsIGZpdFdpZHRoLCBmaXRIZWlnaHR9IGZyb20gXCIuL2ZpdC5qc1wiO1xuaW1wb3J0IHJlc2FtcGxlIGZyb20gXCIuL3Jlc2FtcGxlLmpzXCI7XG5cbnZhciB0cmFuc2Zvcm1SYWRpYW5zID0gdHJhbnNmb3JtZXIoe1xuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMuc3RyZWFtLnBvaW50KHggKiByYWRpYW5zLCB5ICogcmFkaWFucyk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Sb3RhdGUocm90YXRlKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcih7XG4gICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciByID0gcm90YXRlKHgsIHkpO1xuICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtLnBvaW50KHJbMF0sIHJbMV0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNjYWxlVHJhbnNsYXRlKGssIGR4LCBkeSwgc3gsIHN5KSB7XG4gIGZ1bmN0aW9uIHRyYW5zZm9ybSh4LCB5KSB7XG4gICAgeCAqPSBzeDsgeSAqPSBzeTtcbiAgICByZXR1cm4gW2R4ICsgayAqIHgsIGR5IC0gayAqIHldO1xuICB9XG4gIHRyYW5zZm9ybS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFsoeCAtIGR4KSAvIGsgKiBzeCwgKGR5IC0geSkgLyBrICogc3ldO1xuICB9O1xuICByZXR1cm4gdHJhbnNmb3JtO1xufVxuXG5mdW5jdGlvbiBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCBkeCwgZHksIHN4LCBzeSwgYWxwaGEpIHtcbiAgaWYgKCFhbHBoYSkgcmV0dXJuIHNjYWxlVHJhbnNsYXRlKGssIGR4LCBkeSwgc3gsIHN5KTtcbiAgdmFyIGNvc0FscGhhID0gY29zKGFscGhhKSxcbiAgICAgIHNpbkFscGhhID0gc2luKGFscGhhKSxcbiAgICAgIGEgPSBjb3NBbHBoYSAqIGssXG4gICAgICBiID0gc2luQWxwaGEgKiBrLFxuICAgICAgYWkgPSBjb3NBbHBoYSAvIGssXG4gICAgICBiaSA9IHNpbkFscGhhIC8gayxcbiAgICAgIGNpID0gKHNpbkFscGhhICogZHkgLSBjb3NBbHBoYSAqIGR4KSAvIGssXG4gICAgICBmaSA9IChzaW5BbHBoYSAqIGR4ICsgY29zQWxwaGEgKiBkeSkgLyBrO1xuICBmdW5jdGlvbiB0cmFuc2Zvcm0oeCwgeSkge1xuICAgIHggKj0gc3g7IHkgKj0gc3k7XG4gICAgcmV0dXJuIFthICogeCAtIGIgKiB5ICsgZHgsIGR5IC0gYiAqIHggLSBhICogeV07XG4gIH1cbiAgdHJhbnNmb3JtLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gW3N4ICogKGFpICogeCAtIGJpICogeSArIGNpKSwgc3kgKiAoZmkgLSBiaSAqIHggLSBhaSAqIHkpXTtcbiAgfTtcbiAgcmV0dXJuIHRyYW5zZm9ybTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJvamVjdGlvbihwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0aW9uTXV0YXRvcihmdW5jdGlvbigpIHsgcmV0dXJuIHByb2plY3Q7IH0pKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uTXV0YXRvcihwcm9qZWN0QXQpIHtcbiAgdmFyIHByb2plY3QsXG4gICAgICBrID0gMTUwLCAvLyBzY2FsZVxuICAgICAgeCA9IDQ4MCwgeSA9IDI1MCwgLy8gdHJhbnNsYXRlXG4gICAgICBsYW1iZGEgPSAwLCBwaGkgPSAwLCAvLyBjZW50ZXJcbiAgICAgIGRlbHRhTGFtYmRhID0gMCwgZGVsdGFQaGkgPSAwLCBkZWx0YUdhbW1hID0gMCwgcm90YXRlLCAvLyBwcmUtcm90YXRlXG4gICAgICBhbHBoYSA9IDAsIC8vIHBvc3Qtcm90YXRlIGFuZ2xlXG4gICAgICBzeCA9IDEsIC8vIHJlZmxlY3RYXG4gICAgICBzeSA9IDEsIC8vIHJlZmxlY3RYXG4gICAgICB0aGV0YSA9IG51bGwsIHByZWNsaXAgPSBjbGlwQW50aW1lcmlkaWFuLCAvLyBwcmUtY2xpcCBhbmdsZVxuICAgICAgeDAgPSBudWxsLCB5MCwgeDEsIHkxLCBwb3N0Y2xpcCA9IGlkZW50aXR5LCAvLyBwb3N0LWNsaXAgZXh0ZW50XG4gICAgICBkZWx0YTIgPSAwLjUsIC8vIHByZWNpc2lvblxuICAgICAgcHJvamVjdFJlc2FtcGxlLFxuICAgICAgcHJvamVjdFRyYW5zZm9ybSxcbiAgICAgIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0sXG4gICAgICBjYWNoZSxcbiAgICAgIGNhY2hlU3RyZWFtO1xuXG4gIGZ1bmN0aW9uIHByb2plY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gcHJvamVjdFJvdGF0ZVRyYW5zZm9ybShwb2ludFswXSAqIHJhZGlhbnMsIHBvaW50WzFdICogcmFkaWFucyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZlcnQocG9pbnQpIHtcbiAgICBwb2ludCA9IHByb2plY3RSb3RhdGVUcmFuc2Zvcm0uaW52ZXJ0KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgcmV0dXJuIHBvaW50ICYmIFtwb2ludFswXSAqIGRlZ3JlZXMsIHBvaW50WzFdICogZGVncmVlc107XG4gIH1cblxuICBwcm9qZWN0aW9uLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHJldHVybiBjYWNoZSAmJiBjYWNoZVN0cmVhbSA9PT0gc3RyZWFtID8gY2FjaGUgOiBjYWNoZSA9IHRyYW5zZm9ybVJhZGlhbnModHJhbnNmb3JtUm90YXRlKHJvdGF0ZSkocHJlY2xpcChwcm9qZWN0UmVzYW1wbGUocG9zdGNsaXAoY2FjaGVTdHJlYW0gPSBzdHJlYW0pKSkpKTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnByZWNsaXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocHJlY2xpcCA9IF8sIHRoZXRhID0gdW5kZWZpbmVkLCByZXNldCgpKSA6IHByZWNsaXA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5wb3N0Y2xpcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwb3N0Y2xpcCA9IF8sIHgwID0geTAgPSB4MSA9IHkxID0gbnVsbCwgcmVzZXQoKSkgOiBwb3N0Y2xpcDtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNsaXBBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwcmVjbGlwID0gK18gPyBjbGlwQ2lyY2xlKHRoZXRhID0gXyAqIHJhZGlhbnMpIDogKHRoZXRhID0gbnVsbCwgY2xpcEFudGltZXJpZGlhbiksIHJlc2V0KCkpIDogdGhldGEgKiBkZWdyZWVzO1xuICB9O1xuXG4gIHByb2plY3Rpb24uY2xpcEV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwb3N0Y2xpcCA9IF8gPT0gbnVsbCA/ICh4MCA9IHkwID0geDEgPSB5MSA9IG51bGwsIGlkZW50aXR5KSA6IGNsaXBSZWN0YW5nbGUoeDAgPSArX1swXVswXSwgeTAgPSArX1swXVsxXSwgeDEgPSArX1sxXVswXSwgeTEgPSArX1sxXVsxXSksIHJlc2V0KCkpIDogeDAgPT0gbnVsbCA/IG51bGwgOiBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGsgPSArXywgcmVjZW50ZXIoKSkgOiBrO1xuICB9O1xuXG4gIHByb2plY3Rpb24udHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSArX1swXSwgeSA9ICtfWzFdLCByZWNlbnRlcigpKSA6IFt4LCB5XTtcbiAgfTtcblxuICBwcm9qZWN0aW9uLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChsYW1iZGEgPSBfWzBdICUgMzYwICogcmFkaWFucywgcGhpID0gX1sxXSAlIDM2MCAqIHJhZGlhbnMsIHJlY2VudGVyKCkpIDogW2xhbWJkYSAqIGRlZ3JlZXMsIHBoaSAqIGRlZ3JlZXNdO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucm90YXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRlbHRhTGFtYmRhID0gX1swXSAlIDM2MCAqIHJhZGlhbnMsIGRlbHRhUGhpID0gX1sxXSAlIDM2MCAqIHJhZGlhbnMsIGRlbHRhR2FtbWEgPSBfLmxlbmd0aCA+IDIgPyBfWzJdICUgMzYwICogcmFkaWFucyA6IDAsIHJlY2VudGVyKCkpIDogW2RlbHRhTGFtYmRhICogZGVncmVlcywgZGVsdGFQaGkgKiBkZWdyZWVzLCBkZWx0YUdhbW1hICogZGVncmVlc107XG4gIH07XG5cbiAgcHJvamVjdGlvbi5hbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbHBoYSA9IF8gJSAzNjAgKiByYWRpYW5zLCByZWNlbnRlcigpKSA6IGFscGhhICogZGVncmVlcztcbiAgfTtcblxuICBwcm9qZWN0aW9uLnJlZmxlY3RYID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHN4ID0gXyA/IC0xIDogMSwgcmVjZW50ZXIoKSkgOiBzeCA8IDA7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5yZWZsZWN0WSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzeSA9IF8gPyAtMSA6IDEsIHJlY2VudGVyKCkpIDogc3kgPCAwO1xuICB9O1xuXG4gIHByb2plY3Rpb24ucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHByb2plY3RSZXNhbXBsZSA9IHJlc2FtcGxlKHByb2plY3RUcmFuc2Zvcm0sIGRlbHRhMiA9IF8gKiBfKSwgcmVzZXQoKSkgOiBzcXJ0KGRlbHRhMik7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRFeHRlbnQgPSBmdW5jdGlvbihleHRlbnQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRFeHRlbnQocHJvamVjdGlvbiwgZXh0ZW50LCBvYmplY3QpO1xuICB9O1xuXG4gIHByb2plY3Rpb24uZml0U2l6ZSA9IGZ1bmN0aW9uKHNpemUsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRTaXplKHByb2plY3Rpb24sIHNpemUsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRXaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBvYmplY3QpIHtcbiAgICByZXR1cm4gZml0V2lkdGgocHJvamVjdGlvbiwgd2lkdGgsIG9iamVjdCk7XG4gIH07XG5cbiAgcHJvamVjdGlvbi5maXRIZWlnaHQgPSBmdW5jdGlvbihoZWlnaHQsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRIZWlnaHQocHJvamVjdGlvbiwgaGVpZ2h0LCBvYmplY3QpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlY2VudGVyKCkge1xuICAgIHZhciBjZW50ZXIgPSBzY2FsZVRyYW5zbGF0ZVJvdGF0ZShrLCAwLCAwLCBzeCwgc3ksIGFscGhhKS5hcHBseShudWxsLCBwcm9qZWN0KGxhbWJkYSwgcGhpKSksXG4gICAgICAgIHRyYW5zZm9ybSA9IHNjYWxlVHJhbnNsYXRlUm90YXRlKGssIHggLSBjZW50ZXJbMF0sIHkgLSBjZW50ZXJbMV0sIHN4LCBzeSwgYWxwaGEpO1xuICAgIHJvdGF0ZSA9IHJvdGF0ZVJhZGlhbnMoZGVsdGFMYW1iZGEsIGRlbHRhUGhpLCBkZWx0YUdhbW1hKTtcbiAgICBwcm9qZWN0VHJhbnNmb3JtID0gY29tcG9zZShwcm9qZWN0LCB0cmFuc2Zvcm0pO1xuICAgIHByb2plY3RSb3RhdGVUcmFuc2Zvcm0gPSBjb21wb3NlKHJvdGF0ZSwgcHJvamVjdFRyYW5zZm9ybSk7XG4gICAgcHJvamVjdFJlc2FtcGxlID0gcmVzYW1wbGUocHJvamVjdFRyYW5zZm9ybSwgZGVsdGEyKTtcbiAgICByZXR1cm4gcmVzZXQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGNhY2hlID0gY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgIHJldHVybiBwcm9qZWN0aW9uO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHByb2plY3QgPSBwcm9qZWN0QXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBwcm9qZWN0aW9uLmludmVydCA9IHByb2plY3QuaW52ZXJ0ICYmIGludmVydDtcbiAgICByZXR1cm4gcmVjZW50ZXIoKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQge2RlZ3JlZXMsIHBpLCByYWRpYW5zfSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtwcm9qZWN0aW9uTXV0YXRvcn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmljUHJvamVjdGlvbihwcm9qZWN0QXQpIHtcbiAgdmFyIHBoaTAgPSAwLFxuICAgICAgcGhpMSA9IHBpIC8gMyxcbiAgICAgIG0gPSBwcm9qZWN0aW9uTXV0YXRvcihwcm9qZWN0QXQpLFxuICAgICAgcCA9IG0ocGhpMCwgcGhpMSk7XG5cbiAgcC5wYXJhbGxlbHMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBtKHBoaTAgPSBfWzBdICogcmFkaWFucywgcGhpMSA9IF9bMV0gKiByYWRpYW5zKSA6IFtwaGkwICogZGVncmVlcywgcGhpMSAqIGRlZ3JlZXNdO1xuICB9O1xuXG4gIHJldHVybiBwO1xufVxuIiwgImltcG9ydCB7YXNpbiwgY29zLCBzaW59IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjeWxpbmRyaWNhbEVxdWFsQXJlYVJhdyhwaGkwKSB7XG4gIHZhciBjb3NQaGkwID0gY29zKHBoaTApO1xuXG4gIGZ1bmN0aW9uIGZvcndhcmQobGFtYmRhLCBwaGkpIHtcbiAgICByZXR1cm4gW2xhbWJkYSAqIGNvc1BoaTAsIHNpbihwaGkpIC8gY29zUGhpMF07XG4gIH1cblxuICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gW3ggLyBjb3NQaGkwLCBhc2luKHkgKiBjb3NQaGkwKV07XG4gIH07XG5cbiAgcmV0dXJuIGZvcndhcmQ7XG59XG4iLCAiaW1wb3J0IHthYnMsIGFzaW4sIGF0YW4yLCBjb3MsIGVwc2lsb24sIHBpLCBzaWduLCBzaW4sIHNxcnR9IGZyb20gXCIuLi9tYXRoLmpzXCI7XG5pbXBvcnQge2NvbmljUHJvamVjdGlvbn0gZnJvbSBcIi4vY29uaWMuanNcIjtcbmltcG9ydCB7Y3lsaW5kcmljYWxFcXVhbEFyZWFSYXd9IGZyb20gXCIuL2N5bGluZHJpY2FsRXF1YWxBcmVhLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25pY0VxdWFsQXJlYVJhdyh5MCwgeTEpIHtcbiAgdmFyIHN5MCA9IHNpbih5MCksIG4gPSAoc3kwICsgc2luKHkxKSkgLyAyO1xuXG4gIC8vIEFyZSB0aGUgcGFyYWxsZWxzIHN5bW1ldHJpY2FsIGFyb3VuZCB0aGUgRXF1YXRvcj9cbiAgaWYgKGFicyhuKSA8IGVwc2lsb24pIHJldHVybiBjeWxpbmRyaWNhbEVxdWFsQXJlYVJhdyh5MCk7XG5cbiAgdmFyIGMgPSAxICsgc3kwICogKDIgKiBuIC0gc3kwKSwgcjAgPSBzcXJ0KGMpIC8gbjtcblxuICBmdW5jdGlvbiBwcm9qZWN0KHgsIHkpIHtcbiAgICB2YXIgciA9IHNxcnQoYyAtIDIgKiBuICogc2luKHkpKSAvIG47XG4gICAgcmV0dXJuIFtyICogc2luKHggKj0gbiksIHIwIC0gciAqIGNvcyh4KV07XG4gIH1cblxuICBwcm9qZWN0LmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgcjB5ID0gcjAgLSB5LFxuICAgICAgICBsID0gYXRhbjIoeCwgYWJzKHIweSkpICogc2lnbihyMHkpO1xuICAgIGlmIChyMHkgKiBuIDwgMClcbiAgICAgIGwgLT0gcGkgKiBzaWduKHgpICogc2lnbihyMHkpO1xuICAgIHJldHVybiBbbCAvIG4sIGFzaW4oKGMgLSAoeCAqIHggKyByMHkgKiByMHkpICogbiAqIG4pIC8gKDIgKiBuKSldO1xuICB9O1xuXG4gIHJldHVybiBwcm9qZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvbmljUHJvamVjdGlvbihjb25pY0VxdWFsQXJlYVJhdylcbiAgICAgIC5zY2FsZSgxNTUuNDI0KVxuICAgICAgLmNlbnRlcihbMCwgMzMuNjQ0Ml0pO1xufVxuIiwgImltcG9ydCBjb25pY0VxdWFsQXJlYSBmcm9tIFwiLi9jb25pY0VxdWFsQXJlYS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNvbmljRXF1YWxBcmVhKClcbiAgICAgIC5wYXJhbGxlbHMoWzI5LjUsIDQ1LjVdKVxuICAgICAgLnNjYWxlKDEwNzApXG4gICAgICAudHJhbnNsYXRlKFs0ODAsIDI1MF0pXG4gICAgICAucm90YXRlKFs5NiwgMF0pXG4gICAgICAuY2VudGVyKFstMC42LCAzOC43XSk7XG59XG4iLCAiaW1wb3J0IHtlcHNpbG9ufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IGFsYmVycyBmcm9tIFwiLi9hbGJlcnMuanNcIjtcbmltcG9ydCBjb25pY0VxdWFsQXJlYSBmcm9tIFwiLi9jb25pY0VxdWFsQXJlYS5qc1wiO1xuaW1wb3J0IHtmaXRFeHRlbnQsIGZpdFNpemUsIGZpdFdpZHRoLCBmaXRIZWlnaHR9IGZyb20gXCIuL2ZpdC5qc1wiO1xuXG4vLyBUaGUgcHJvamVjdGlvbnMgbXVzdCBoYXZlIG11dHVhbGx5IGV4Y2x1c2l2ZSBjbGlwIHJlZ2lvbnMgb24gdGhlIHNwaGVyZSxcbi8vIGFzIHRoaXMgd2lsbCBhdm9pZCBlbWl0dGluZyBpbnRlcmxlYXZpbmcgbGluZXMgYW5kIHBvbHlnb25zLlxuZnVuY3Rpb24gbXVsdGlwbGV4KHN0cmVhbXMpIHtcbiAgdmFyIG4gPSBzdHJlYW1zLmxlbmd0aDtcbiAgcmV0dXJuIHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5wb2ludCh4LCB5KTsgfSxcbiAgICBzcGhlcmU6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5zcGhlcmUoKTsgfSxcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5saW5lU3RhcnQoKTsgfSxcbiAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHsgdmFyIGkgPSAtMTsgd2hpbGUgKCsraSA8IG4pIHN0cmVhbXNbaV0ubGluZUVuZCgpOyB9LFxuICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7IHZhciBpID0gLTE7IHdoaWxlICgrK2kgPCBuKSBzdHJlYW1zW2ldLnBvbHlnb25TdGFydCgpOyB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkgeyB2YXIgaSA9IC0xOyB3aGlsZSAoKytpIDwgbikgc3RyZWFtc1tpXS5wb2x5Z29uRW5kKCk7IH1cbiAgfTtcbn1cblxuLy8gQSBjb21wb3NpdGUgcHJvamVjdGlvbiBmb3IgdGhlIFVuaXRlZCBTdGF0ZXMsIGNvbmZpZ3VyZWQgYnkgZGVmYXVsdCBmb3Jcbi8vIDk2MFx1MDBENzUwMC4gVGhlIHByb2plY3Rpb24gYWxzbyB3b3JrcyBxdWl0ZSB3ZWxsIGF0IDk2MFx1MDBENzYwMCBpZiB5b3UgY2hhbmdlIHRoZVxuLy8gc2NhbGUgdG8gMTI4NSBhbmQgYWRqdXN0IHRoZSB0cmFuc2xhdGUgYWNjb3JkaW5nbHkuIFRoZSBzZXQgb2Ygc3RhbmRhcmRcbi8vIHBhcmFsbGVscyBmb3IgZWFjaCByZWdpb24gY29tZXMgZnJvbSBVU0dTLCB3aGljaCBpcyBwdWJsaXNoZWQgaGVyZTpcbi8vIGh0dHA6Ly9lZ3NjLnVzZ3MuZ292L2lzYi9wdWJzL01hcFByb2plY3Rpb25zL3Byb2plY3Rpb25zLmh0bWwjYWxiZXJzXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhY2hlLFxuICAgICAgY2FjaGVTdHJlYW0sXG4gICAgICBsb3dlcjQ4ID0gYWxiZXJzKCksIGxvd2VyNDhQb2ludCxcbiAgICAgIGFsYXNrYSA9IGNvbmljRXF1YWxBcmVhKCkucm90YXRlKFsxNTQsIDBdKS5jZW50ZXIoWy0yLCA1OC41XSkucGFyYWxsZWxzKFs1NSwgNjVdKSwgYWxhc2thUG9pbnQsIC8vIEVQU0c6MzMzOFxuICAgICAgaGF3YWlpID0gY29uaWNFcXVhbEFyZWEoKS5yb3RhdGUoWzE1NywgMF0pLmNlbnRlcihbLTMsIDE5LjldKS5wYXJhbGxlbHMoWzgsIDE4XSksIGhhd2FpaVBvaW50LCAvLyBFU1JJOjEwMjAwN1xuICAgICAgcG9pbnQsIHBvaW50U3RyZWFtID0ge3BvaW50OiBmdW5jdGlvbih4LCB5KSB7IHBvaW50ID0gW3gsIHldOyB9fTtcblxuICBmdW5jdGlvbiBhbGJlcnNVc2EoY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgeCA9IGNvb3JkaW5hdGVzWzBdLCB5ID0gY29vcmRpbmF0ZXNbMV07XG4gICAgcmV0dXJuIHBvaW50ID0gbnVsbCxcbiAgICAgICAgKGxvd2VyNDhQb2ludC5wb2ludCh4LCB5KSwgcG9pbnQpXG4gICAgICAgIHx8IChhbGFza2FQb2ludC5wb2ludCh4LCB5KSwgcG9pbnQpXG4gICAgICAgIHx8IChoYXdhaWlQb2ludC5wb2ludCh4LCB5KSwgcG9pbnQpO1xuICB9XG5cbiAgYWxiZXJzVXNhLmludmVydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7XG4gICAgdmFyIGsgPSBsb3dlcjQ4LnNjYWxlKCksXG4gICAgICAgIHQgPSBsb3dlcjQ4LnRyYW5zbGF0ZSgpLFxuICAgICAgICB4ID0gKGNvb3JkaW5hdGVzWzBdIC0gdFswXSkgLyBrLFxuICAgICAgICB5ID0gKGNvb3JkaW5hdGVzWzFdIC0gdFsxXSkgLyBrO1xuICAgIHJldHVybiAoeSA+PSAwLjEyMCAmJiB5IDwgMC4yMzQgJiYgeCA+PSAtMC40MjUgJiYgeCA8IC0wLjIxNCA/IGFsYXNrYVxuICAgICAgICA6IHkgPj0gMC4xNjYgJiYgeSA8IDAuMjM0ICYmIHggPj0gLTAuMjE0ICYmIHggPCAtMC4xMTUgPyBoYXdhaWlcbiAgICAgICAgOiBsb3dlcjQ4KS5pbnZlcnQoY29vcmRpbmF0ZXMpO1xuICB9O1xuXG4gIGFsYmVyc1VzYS5zdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICByZXR1cm4gY2FjaGUgJiYgY2FjaGVTdHJlYW0gPT09IHN0cmVhbSA/IGNhY2hlIDogY2FjaGUgPSBtdWx0aXBsZXgoW2xvd2VyNDguc3RyZWFtKGNhY2hlU3RyZWFtID0gc3RyZWFtKSwgYWxhc2thLnN0cmVhbShzdHJlYW0pLCBoYXdhaWkuc3RyZWFtKHN0cmVhbSldKTtcbiAgfTtcblxuICBhbGJlcnNVc2EucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDgucHJlY2lzaW9uKCk7XG4gICAgbG93ZXI0OC5wcmVjaXNpb24oXyksIGFsYXNrYS5wcmVjaXNpb24oXyksIGhhd2FpaS5wcmVjaXNpb24oXyk7XG4gICAgcmV0dXJuIHJlc2V0KCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDguc2NhbGUoKTtcbiAgICBsb3dlcjQ4LnNjYWxlKF8pLCBhbGFza2Euc2NhbGUoXyAqIDAuMzUpLCBoYXdhaWkuc2NhbGUoXyk7XG4gICAgcmV0dXJuIGFsYmVyc1VzYS50cmFuc2xhdGUobG93ZXI0OC50cmFuc2xhdGUoKSk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsb3dlcjQ4LnRyYW5zbGF0ZSgpO1xuICAgIHZhciBrID0gbG93ZXI0OC5zY2FsZSgpLCB4ID0gK19bMF0sIHkgPSArX1sxXTtcblxuICAgIGxvd2VyNDhQb2ludCA9IGxvd2VyNDhcbiAgICAgICAgLnRyYW5zbGF0ZShfKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjQ1NSAqIGssIHkgLSAwLjIzOCAqIGtdLCBbeCArIDAuNDU1ICogaywgeSArIDAuMjM4ICoga11dKVxuICAgICAgICAuc3RyZWFtKHBvaW50U3RyZWFtKTtcblxuICAgIGFsYXNrYVBvaW50ID0gYWxhc2thXG4gICAgICAgIC50cmFuc2xhdGUoW3ggLSAwLjMwNyAqIGssIHkgKyAwLjIwMSAqIGtdKVxuICAgICAgICAuY2xpcEV4dGVudChbW3ggLSAwLjQyNSAqIGsgKyBlcHNpbG9uLCB5ICsgMC4xMjAgKiBrICsgZXBzaWxvbl0sIFt4IC0gMC4yMTQgKiBrIC0gZXBzaWxvbiwgeSArIDAuMjM0ICogayAtIGVwc2lsb25dXSlcbiAgICAgICAgLnN0cmVhbShwb2ludFN0cmVhbSk7XG5cbiAgICBoYXdhaWlQb2ludCA9IGhhd2FpaVxuICAgICAgICAudHJhbnNsYXRlKFt4IC0gMC4yMDUgKiBrLCB5ICsgMC4yMTIgKiBrXSlcbiAgICAgICAgLmNsaXBFeHRlbnQoW1t4IC0gMC4yMTQgKiBrICsgZXBzaWxvbiwgeSArIDAuMTY2ICogayArIGVwc2lsb25dLCBbeCAtIDAuMTE1ICogayAtIGVwc2lsb24sIHkgKyAwLjIzNCAqIGsgLSBlcHNpbG9uXV0pXG4gICAgICAgIC5zdHJlYW0ocG9pbnRTdHJlYW0pO1xuXG4gICAgcmV0dXJuIHJlc2V0KCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLmZpdEV4dGVudCA9IGZ1bmN0aW9uKGV4dGVudCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEV4dGVudChhbGJlcnNVc2EsIGV4dGVudCwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0U2l6ZSA9IGZ1bmN0aW9uKHNpemUsIG9iamVjdCkge1xuICAgIHJldHVybiBmaXRTaXplKGFsYmVyc1VzYSwgc2l6ZSwgb2JqZWN0KTtcbiAgfTtcblxuICBhbGJlcnNVc2EuZml0V2lkdGggPSBmdW5jdGlvbih3aWR0aCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdFdpZHRoKGFsYmVyc1VzYSwgd2lkdGgsIG9iamVjdCk7XG4gIH07XG5cbiAgYWxiZXJzVXNhLmZpdEhlaWdodCA9IGZ1bmN0aW9uKGhlaWdodCwgb2JqZWN0KSB7XG4gICAgcmV0dXJuIGZpdEhlaWdodChhbGJlcnNVc2EsIGhlaWdodCwgb2JqZWN0KTtcbiAgfTtcblxuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBjYWNoZSA9IGNhY2hlU3RyZWFtID0gbnVsbDtcbiAgICByZXR1cm4gYWxiZXJzVXNhO1xuICB9XG5cbiAgcmV0dXJuIGFsYmVyc1VzYS5zY2FsZSgxMDcwKTtcbn1cbiIsICJpbXBvcnQge2FzaW4sIGF0YW4yLCBjb3MsIHNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGF6aW11dGhhbFJhdyhzY2FsZSkge1xuICByZXR1cm4gZnVuY3Rpb24oeCwgeSkge1xuICAgIHZhciBjeCA9IGNvcyh4KSxcbiAgICAgICAgY3kgPSBjb3MoeSksXG4gICAgICAgIGsgPSBzY2FsZShjeCAqIGN5KTtcbiAgICAgICAgaWYgKGsgPT09IEluZmluaXR5KSByZXR1cm4gWzIsIDBdO1xuICAgIHJldHVybiBbXG4gICAgICBrICogY3kgKiBzaW4oeCksXG4gICAgICBrICogc2luKHkpXG4gICAgXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXppbXV0aGFsSW52ZXJ0KGFuZ2xlKSB7XG4gIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdmFyIHogPSBzcXJ0KHggKiB4ICsgeSAqIHkpLFxuICAgICAgICBjID0gYW5nbGUoeiksXG4gICAgICAgIHNjID0gc2luKGMpLFxuICAgICAgICBjYyA9IGNvcyhjKTtcbiAgICByZXR1cm4gW1xuICAgICAgYXRhbjIoeCAqIHNjLCB6ICogY2MpLFxuICAgICAgYXNpbih6ICYmIHkgKiBzYyAvIHopXG4gICAgXTtcbiAgfVxufVxuIiwgImltcG9ydCB7YXNpbiwgc3FydH0gZnJvbSBcIi4uL21hdGguanNcIjtcbmltcG9ydCB7YXppbXV0aGFsUmF3LCBhemltdXRoYWxJbnZlcnR9IGZyb20gXCIuL2F6aW11dGhhbC5qc1wiO1xuaW1wb3J0IHByb2plY3Rpb24gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IHZhciBhemltdXRoYWxFcXVhbEFyZWFSYXcgPSBhemltdXRoYWxSYXcoZnVuY3Rpb24oY3hjeSkge1xuICByZXR1cm4gc3FydCgyIC8gKDEgKyBjeGN5KSk7XG59KTtcblxuYXppbXV0aGFsRXF1YWxBcmVhUmF3LmludmVydCA9IGF6aW11dGhhbEludmVydChmdW5jdGlvbih6KSB7XG4gIHJldHVybiAyICogYXNpbih6IC8gMik7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uKGF6aW11dGhhbEVxdWFsQXJlYVJhdylcbiAgICAgIC5zY2FsZSgxMjQuNzUpXG4gICAgICAuY2xpcEFuZ2xlKDE4MCAtIDFlLTMpO1xufVxuIiwgImltcG9ydCBwcm9qZWN0aW9uIGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge2FicywgYXNpbiwgY29zLCBlcHNpbG9uMiwgc2luLCBzcXJ0fSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuXG52YXIgQTEgPSAxLjM0MDI2NCxcbiAgICBBMiA9IC0wLjA4MTEwNixcbiAgICBBMyA9IDAuMDAwODkzLFxuICAgIEE0ID0gMC4wMDM3OTYsXG4gICAgTSA9IHNxcnQoMykgLyAyLFxuICAgIGl0ZXJhdGlvbnMgPSAxMjtcblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsRWFydGhSYXcobGFtYmRhLCBwaGkpIHtcbiAgdmFyIGwgPSBhc2luKE0gKiBzaW4ocGhpKSksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICByZXR1cm4gW1xuICAgIGxhbWJkYSAqIGNvcyhsKSAvIChNICogKEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMikpKSxcbiAgICBsICogKEExICsgQTIgKiBsMiArIGw2ICogKEEzICsgQTQgKiBsMikpXG4gIF07XG59XG5cbmVxdWFsRWFydGhSYXcuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgbCA9IHksIGwyID0gbCAqIGwsIGw2ID0gbDIgKiBsMiAqIGwyO1xuICBmb3IgKHZhciBpID0gMCwgZGVsdGEsIGZ5LCBmcHk7IGkgPCBpdGVyYXRpb25zOyArK2kpIHtcbiAgICBmeSA9IGwgKiAoQTEgKyBBMiAqIGwyICsgbDYgKiAoQTMgKyBBNCAqIGwyKSkgLSB5O1xuICAgIGZweSA9IEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMik7XG4gICAgbCAtPSBkZWx0YSA9IGZ5IC8gZnB5LCBsMiA9IGwgKiBsLCBsNiA9IGwyICogbDIgKiBsMjtcbiAgICBpZiAoYWJzKGRlbHRhKSA8IGVwc2lsb24yKSBicmVhaztcbiAgfVxuICByZXR1cm4gW1xuICAgIE0gKiB4ICogKEExICsgMyAqIEEyICogbDIgKyBsNiAqICg3ICogQTMgKyA5ICogQTQgKiBsMikpIC8gY29zKGwpLFxuICAgIGFzaW4oc2luKGwpIC8gTSlcbiAgXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcHJvamVjdGlvbihlcXVhbEVhcnRoUmF3KVxuICAgICAgLnNjYWxlKDE3Ny4xNTgpO1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBUcmFuc2Zvcm0oaywgeCwgeSkge1xuICB0aGlzLmsgPSBrO1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xufVxuXG5UcmFuc2Zvcm0ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNmb3JtLFxuICBzY2FsZTogZnVuY3Rpb24oaykge1xuICAgIHJldHVybiBrID09PSAxID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rICogaywgdGhpcy54LCB0aGlzLnkpO1xuICB9LFxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4geCA9PT0gMCAmIHkgPT09IDAgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmssIHRoaXMueCArIHRoaXMuayAqIHgsIHRoaXMueSArIHRoaXMuayAqIHkpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gW3BvaW50WzBdICogdGhpcy5rICsgdGhpcy54LCBwb2ludFsxXSAqIHRoaXMuayArIHRoaXMueV07XG4gIH0sXG4gIGFwcGx5WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4ICogdGhpcy5rICsgdGhpcy54O1xuICB9LFxuICBhcHBseVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4geSAqIHRoaXMuayArIHRoaXMueTtcbiAgfSxcbiAgaW52ZXJ0OiBmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIHJldHVybiBbKGxvY2F0aW9uWzBdIC0gdGhpcy54KSAvIHRoaXMuaywgKGxvY2F0aW9uWzFdIC0gdGhpcy55KSAvIHRoaXMua107XG4gIH0sXG4gIGludmVydFg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gKHggLSB0aGlzLngpIC8gdGhpcy5rO1xuICB9LFxuICBpbnZlcnRZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuICh5IC0gdGhpcy55KSAvIHRoaXMuaztcbiAgfSxcbiAgcmVzY2FsZVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geC5jb3B5KCkuZG9tYWluKHgucmFuZ2UoKS5tYXAodGhpcy5pbnZlcnRYLCB0aGlzKS5tYXAoeC5pbnZlcnQsIHgpKTtcbiAgfSxcbiAgcmVzY2FsZVk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4geS5jb3B5KCkuZG9tYWluKHkucmFuZ2UoKS5tYXAodGhpcy5pbnZlcnRZLCB0aGlzKS5tYXAoeS5pbnZlcnQsIHkpKTtcbiAgfSxcbiAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIHRoaXMueCArIFwiLFwiICsgdGhpcy55ICsgXCIpIHNjYWxlKFwiICsgdGhpcy5rICsgXCIpXCI7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgaWRlbnRpdHkgPSBuZXcgVHJhbnNmb3JtKDEsIDAsIDApO1xuXG50cmFuc2Zvcm0ucHJvdG90eXBlID0gVHJhbnNmb3JtLnByb3RvdHlwZTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNmb3JtKG5vZGUpIHtcbiAgd2hpbGUgKCFub2RlLl9fem9vbSkgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHJldHVybiBpZGVudGl0eTtcbiAgcmV0dXJuIG5vZGUuX196b29tO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZGF0YSBsb2FkZXJcbi8vIExvYWRzIEpTT04gYW5kIHRleHQgZWl0aGVyIGZyb20gYW4gaW5saW5lZCA8c2NyaXB0IHR5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCIgZGF0YS1wYXRoPVwiXHUyMDI2XCI+IGJsb2NrXG4vLyAodGhlIG9mZmxpbmUgc2luZ2xlLWZpbGUgYnVpbGQpIG9yIGJ5IGZldGNoaW5nIGl0IHJlbGF0aXZlIHRvIHRoZSBwYWdlIChHaXRIdWIgUGFnZXMgLyBkZXYgc2VydmVyKS5cblxuY29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGlubGluZWQocGF0aCkge1xuICBjb25zdCBzZWwgPSBgc2NyaXB0W3R5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCJdW2RhdGEtcGF0aD1cIiR7Q1NTLmVzY2FwZShwYXRoKX1cIl1gO1xuICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsKTtcbiAgcmV0dXJuIGVsID8gZWwudGV4dENvbnRlbnQgOiBudWxsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRleHQocGF0aCkge1xuICBjb25zdCBpbmwgPSBpbmxpbmVkKHBhdGgpO1xuICBpZiAoaW5sICE9PSBudWxsKSByZXR1cm4gaW5sO1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChwYXRoKTtcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGxvYWQgJHtwYXRofSAoSFRUUCAke3Jlcy5zdGF0dXN9KWApO1xuICByZXR1cm4gcmVzLnRleHQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRKU09OKHBhdGgpIHtcbiAgaWYgKCFjYWNoZS5oYXMocGF0aCkpIGNhY2hlLnNldChwYXRoLCBsb2FkVGV4dChwYXRoKS50aGVuKCh0KSA9PiBKU09OLnBhcnNlKHQpKSk7XG4gIHJldHVybiBjYWNoZS5nZXQocGF0aCk7XG59XG5cbi8vIFVSTCBmb3IgYW4gYXNzZXQgKGltYWdlKS4gVGhlIG9mZmxpbmUgYnVpbGQgcmVnaXN0ZXJzIGRhdGE6IFVSTHMgaW4gd2luZG93Ll9fUEFSQ0hNRU5UX0FTU0VUU19fLlxuZXhwb3J0IGZ1bmN0aW9uIGFzc2V0VVJMKHBhdGgpIHtcbiAgY29uc3QgYXNzZXRzID0gZ2xvYmFsVGhpcy5fX1BBUkNITUVOVF9BU1NFVFNfXztcbiAgcmV0dXJuIChhc3NldHMgJiYgYXNzZXRzW3BhdGhdKSB8fCBwYXRoO1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLCAiaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuL2lkZW50aXR5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRyYW5zZm9ybSkge1xuICBpZiAodHJhbnNmb3JtID09IG51bGwpIHJldHVybiBpZGVudGl0eTtcbiAgdmFyIHgwLFxuICAgICAgeTAsXG4gICAgICBreCA9IHRyYW5zZm9ybS5zY2FsZVswXSxcbiAgICAgIGt5ID0gdHJhbnNmb3JtLnNjYWxlWzFdLFxuICAgICAgZHggPSB0cmFuc2Zvcm0udHJhbnNsYXRlWzBdLFxuICAgICAgZHkgPSB0cmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIGkpIHtcbiAgICBpZiAoIWkpIHgwID0geTAgPSAwO1xuICAgIHZhciBqID0gMiwgbiA9IGlucHV0Lmxlbmd0aCwgb3V0cHV0ID0gbmV3IEFycmF5KG4pO1xuICAgIG91dHB1dFswXSA9ICh4MCArPSBpbnB1dFswXSkgKiBreCArIGR4O1xuICAgIG91dHB1dFsxXSA9ICh5MCArPSBpbnB1dFsxXSkgKiBreSArIGR5O1xuICAgIHdoaWxlIChqIDwgbikgb3V0cHV0W2pdID0gaW5wdXRbal0sICsrajtcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xufVxuIiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGFycmF5LCBuKSB7XG4gIHZhciB0LCBqID0gYXJyYXkubGVuZ3RoLCBpID0gaiAtIG47XG4gIHdoaWxlIChpIDwgLS1qKSB0ID0gYXJyYXlbaV0sIGFycmF5W2krK10gPSBhcnJheVtqXSwgYXJyYXlbal0gPSB0O1xufVxuIiwgImltcG9ydCByZXZlcnNlIGZyb20gXCIuL3JldmVyc2UuanNcIjtcbmltcG9ydCB0cmFuc2Zvcm0gZnJvbSBcIi4vdHJhbnNmb3JtLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHRvcG9sb2d5LCBvKSB7XG4gIGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgbyA9IHRvcG9sb2d5Lm9iamVjdHNbb107XG4gIHJldHVybiBvLnR5cGUgPT09IFwiR2VvbWV0cnlDb2xsZWN0aW9uXCJcbiAgICAgID8ge3R5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIiwgZmVhdHVyZXM6IG8uZ2VvbWV0cmllcy5tYXAoZnVuY3Rpb24obykgeyByZXR1cm4gZmVhdHVyZSh0b3BvbG9neSwgbyk7IH0pfVxuICAgICAgOiBmZWF0dXJlKHRvcG9sb2d5LCBvKTtcbn1cblxuZnVuY3Rpb24gZmVhdHVyZSh0b3BvbG9neSwgbykge1xuICB2YXIgaWQgPSBvLmlkLFxuICAgICAgYmJveCA9IG8uYmJveCxcbiAgICAgIHByb3BlcnRpZXMgPSBvLnByb3BlcnRpZXMgPT0gbnVsbCA/IHt9IDogby5wcm9wZXJ0aWVzLFxuICAgICAgZ2VvbWV0cnkgPSBvYmplY3QodG9wb2xvZ3ksIG8pO1xuICByZXR1cm4gaWQgPT0gbnVsbCAmJiBiYm94ID09IG51bGwgPyB7dHlwZTogXCJGZWF0dXJlXCIsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX1cbiAgICAgIDogYmJveCA9PSBudWxsID8ge3R5cGU6IFwiRmVhdHVyZVwiLCBpZDogaWQsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX1cbiAgICAgIDoge3R5cGU6IFwiRmVhdHVyZVwiLCBpZDogaWQsIGJib3g6IGJib3gsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3QodG9wb2xvZ3ksIG8pIHtcbiAgdmFyIHRyYW5zZm9ybVBvaW50ID0gdHJhbnNmb3JtKHRvcG9sb2d5LnRyYW5zZm9ybSksXG4gICAgICBhcmNzID0gdG9wb2xvZ3kuYXJjcztcblxuICBmdW5jdGlvbiBhcmMoaSwgcG9pbnRzKSB7XG4gICAgaWYgKHBvaW50cy5sZW5ndGgpIHBvaW50cy5wb3AoKTtcbiAgICBmb3IgKHZhciBhID0gYXJjc1tpIDwgMCA/IH5pIDogaV0sIGsgPSAwLCBuID0gYS5sZW5ndGg7IGsgPCBuOyArK2spIHtcbiAgICAgIHBvaW50cy5wdXNoKHRyYW5zZm9ybVBvaW50KGFba10sIGspKTtcbiAgICB9XG4gICAgaWYgKGkgPCAwKSByZXZlcnNlKHBvaW50cywgbik7XG4gIH1cblxuICBmdW5jdGlvbiBwb2ludChwKSB7XG4gICAgcmV0dXJuIHRyYW5zZm9ybVBvaW50KHApO1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZShhcmNzKSB7XG4gICAgdmFyIHBvaW50cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gYXJjcy5sZW5ndGg7IGkgPCBuOyArK2kpIGFyYyhhcmNzW2ldLCBwb2ludHMpO1xuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgMikgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTsgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIHBlciB0aGUgc3BlY2lmaWNhdGlvbi5cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgZnVuY3Rpb24gcmluZyhhcmNzKSB7XG4gICAgdmFyIHBvaW50cyA9IGxpbmUoYXJjcyk7XG4gICAgd2hpbGUgKHBvaW50cy5sZW5ndGggPCA0KSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIG1heSBoYXBwZW4gaWYgYW4gYXJjIGhhcyBvbmx5IHR3byBwb2ludHMuXG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvbHlnb24oYXJjcykge1xuICAgIHJldHVybiBhcmNzLm1hcChyaW5nKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlb21ldHJ5KG8pIHtcbiAgICB2YXIgdHlwZSA9IG8udHlwZSwgY29vcmRpbmF0ZXM7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFwiR2VvbWV0cnlDb2xsZWN0aW9uXCI6IHJldHVybiB7dHlwZTogdHlwZSwgZ2VvbWV0cmllczogby5nZW9tZXRyaWVzLm1hcChnZW9tZXRyeSl9O1xuICAgICAgY2FzZSBcIlBvaW50XCI6IGNvb3JkaW5hdGVzID0gcG9pbnQoby5jb29yZGluYXRlcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpUG9pbnRcIjogY29vcmRpbmF0ZXMgPSBvLmNvb3JkaW5hdGVzLm1hcChwb2ludCk7IGJyZWFrO1xuICAgICAgY2FzZSBcIkxpbmVTdHJpbmdcIjogY29vcmRpbmF0ZXMgPSBsaW5lKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpTGluZVN0cmluZ1wiOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAobGluZSk7IGJyZWFrO1xuICAgICAgY2FzZSBcIlBvbHlnb25cIjogY29vcmRpbmF0ZXMgPSBwb2x5Z29uKG8uYXJjcyk7IGJyZWFrO1xuICAgICAgY2FzZSBcIk11bHRpUG9seWdvblwiOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAocG9seWdvbik7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7dHlwZTogdHlwZSwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTtcbiAgfVxuXG4gIHJldHVybiBnZW9tZXRyeShvKTtcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0b3BvbG9neSwgYXJjcykge1xuICB2YXIgc3RpdGNoZWRBcmNzID0ge30sXG4gICAgICBmcmFnbWVudEJ5U3RhcnQgPSB7fSxcbiAgICAgIGZyYWdtZW50QnlFbmQgPSB7fSxcbiAgICAgIGZyYWdtZW50cyA9IFtdLFxuICAgICAgZW1wdHlJbmRleCA9IC0xO1xuXG4gIC8vIFN0aXRjaCBlbXB0eSBhcmNzIGZpcnN0LCBzaW5jZSB0aGV5IG1heSBiZSBzdWJzdW1lZCBieSBvdGhlciBhcmNzLlxuICBhcmNzLmZvckVhY2goZnVuY3Rpb24oaSwgaikge1xuICAgIHZhciBhcmMgPSB0b3BvbG9neS5hcmNzW2kgPCAwID8gfmkgOiBpXSwgdDtcbiAgICBpZiAoYXJjLmxlbmd0aCA8IDMgJiYgIWFyY1sxXVswXSAmJiAhYXJjWzFdWzFdKSB7XG4gICAgICB0ID0gYXJjc1srK2VtcHR5SW5kZXhdLCBhcmNzW2VtcHR5SW5kZXhdID0gaSwgYXJjc1tqXSA9IHQ7XG4gICAgfVxuICB9KTtcblxuICBhcmNzLmZvckVhY2goZnVuY3Rpb24oaSkge1xuICAgIHZhciBlID0gZW5kcyhpKSxcbiAgICAgICAgc3RhcnQgPSBlWzBdLFxuICAgICAgICBlbmQgPSBlWzFdLFxuICAgICAgICBmLCBnO1xuXG4gICAgaWYgKGYgPSBmcmFnbWVudEJ5RW5kW3N0YXJ0XSkge1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlFbmRbZi5lbmRdO1xuICAgICAgZi5wdXNoKGkpO1xuICAgICAgZi5lbmQgPSBlbmQ7XG4gICAgICBpZiAoZyA9IGZyYWdtZW50QnlTdGFydFtlbmRdKSB7XG4gICAgICAgIGRlbGV0ZSBmcmFnbWVudEJ5U3RhcnRbZy5zdGFydF07XG4gICAgICAgIHZhciBmZyA9IGcgPT09IGYgPyBmIDogZi5jb25jYXQoZyk7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmZy5zdGFydCA9IGYuc3RhcnRdID0gZnJhZ21lbnRCeUVuZFtmZy5lbmQgPSBnLmVuZF0gPSBmZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmRdID0gZjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGYgPSBmcmFnbWVudEJ5U3RhcnRbZW5kXSkge1xuICAgICAgZGVsZXRlIGZyYWdtZW50QnlTdGFydFtmLnN0YXJ0XTtcbiAgICAgIGYudW5zaGlmdChpKTtcbiAgICAgIGYuc3RhcnQgPSBzdGFydDtcbiAgICAgIGlmIChnID0gZnJhZ21lbnRCeUVuZFtzdGFydF0pIHtcbiAgICAgICAgZGVsZXRlIGZyYWdtZW50QnlFbmRbZy5lbmRdO1xuICAgICAgICB2YXIgZ2YgPSBnID09PSBmID8gZiA6IGcuY29uY2F0KGYpO1xuICAgICAgICBmcmFnbWVudEJ5U3RhcnRbZ2Yuc3RhcnQgPSBnLnN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZ2YuZW5kID0gZi5lbmRdID0gZ2Y7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydF0gPSBmcmFnbWVudEJ5RW5kW2YuZW5kXSA9IGY7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGYgPSBbaV07XG4gICAgICBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydCA9IHN0YXJ0XSA9IGZyYWdtZW50QnlFbmRbZi5lbmQgPSBlbmRdID0gZjtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGVuZHMoaSkge1xuICAgIHZhciBhcmMgPSB0b3BvbG9neS5hcmNzW2kgPCAwID8gfmkgOiBpXSwgcDAgPSBhcmNbMF0sIHAxO1xuICAgIGlmICh0b3BvbG9neS50cmFuc2Zvcm0pIHAxID0gWzAsIDBdLCBhcmMuZm9yRWFjaChmdW5jdGlvbihkcCkgeyBwMVswXSArPSBkcFswXSwgcDFbMV0gKz0gZHBbMV07IH0pO1xuICAgIGVsc2UgcDEgPSBhcmNbYXJjLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBpIDwgMCA/IFtwMSwgcDBdIDogW3AwLCBwMV07XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaChmcmFnbWVudEJ5RW5kLCBmcmFnbWVudEJ5U3RhcnQpIHtcbiAgICBmb3IgKHZhciBrIGluIGZyYWdtZW50QnlFbmQpIHtcbiAgICAgIHZhciBmID0gZnJhZ21lbnRCeUVuZFtrXTtcbiAgICAgIGRlbGV0ZSBmcmFnbWVudEJ5U3RhcnRbZi5zdGFydF07XG4gICAgICBkZWxldGUgZi5zdGFydDtcbiAgICAgIGRlbGV0ZSBmLmVuZDtcbiAgICAgIGYuZm9yRWFjaChmdW5jdGlvbihpKSB7IHN0aXRjaGVkQXJjc1tpIDwgMCA/IH5pIDogaV0gPSAxOyB9KTtcbiAgICAgIGZyYWdtZW50cy5wdXNoKGYpO1xuICAgIH1cbiAgfVxuXG4gIGZsdXNoKGZyYWdtZW50QnlFbmQsIGZyYWdtZW50QnlTdGFydCk7XG4gIGZsdXNoKGZyYWdtZW50QnlTdGFydCwgZnJhZ21lbnRCeUVuZCk7XG4gIGFyY3MuZm9yRWFjaChmdW5jdGlvbihpKSB7IGlmICghc3RpdGNoZWRBcmNzW2kgPCAwID8gfmkgOiBpXSkgZnJhZ21lbnRzLnB1c2goW2ldKTsgfSk7XG5cbiAgcmV0dXJuIGZyYWdtZW50cztcbn1cbiIsICJpbXBvcnQge29iamVjdH0gZnJvbSBcIi4vZmVhdHVyZS5qc1wiO1xuaW1wb3J0IHN0aXRjaCBmcm9tIFwiLi9zdGl0Y2guanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odG9wb2xvZ3kpIHtcbiAgcmV0dXJuIG9iamVjdCh0b3BvbG9neSwgbWVzaEFyY3MuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXNoQXJjcyh0b3BvbG9neSwgb2JqZWN0LCBmaWx0ZXIpIHtcbiAgdmFyIGFyY3MsIGksIG47XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJjcyA9IGV4dHJhY3RBcmNzKHRvcG9sb2d5LCBvYmplY3QsIGZpbHRlcik7XG4gIGVsc2UgZm9yIChpID0gMCwgYXJjcyA9IG5ldyBBcnJheShuID0gdG9wb2xvZ3kuYXJjcy5sZW5ndGgpOyBpIDwgbjsgKytpKSBhcmNzW2ldID0gaTtcbiAgcmV0dXJuIHt0eXBlOiBcIk11bHRpTGluZVN0cmluZ1wiLCBhcmNzOiBzdGl0Y2godG9wb2xvZ3ksIGFyY3MpfTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdEFyY3ModG9wb2xvZ3ksIG9iamVjdCwgZmlsdGVyKSB7XG4gIHZhciBhcmNzID0gW10sXG4gICAgICBnZW9tc0J5QXJjID0gW10sXG4gICAgICBnZW9tO1xuXG4gIGZ1bmN0aW9uIGV4dHJhY3QwKGkpIHtcbiAgICB2YXIgaiA9IGkgPCAwID8gfmkgOiBpO1xuICAgIChnZW9tc0J5QXJjW2pdIHx8IChnZW9tc0J5QXJjW2pdID0gW10pKS5wdXNoKHtpOiBpLCBnOiBnZW9tfSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0MShhcmNzKSB7XG4gICAgYXJjcy5mb3JFYWNoKGV4dHJhY3QwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3QyKGFyY3MpIHtcbiAgICBhcmNzLmZvckVhY2goZXh0cmFjdDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0cmFjdDMoYXJjcykge1xuICAgIGFyY3MuZm9yRWFjaChleHRyYWN0Mik7XG4gIH1cblxuICBmdW5jdGlvbiBnZW9tZXRyeShvKSB7XG4gICAgc3dpdGNoIChnZW9tID0gbywgby50eXBlKSB7XG4gICAgICBjYXNlIFwiR2VvbWV0cnlDb2xsZWN0aW9uXCI6IG8uZ2VvbWV0cmllcy5mb3JFYWNoKGdlb21ldHJ5KTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTGluZVN0cmluZ1wiOiBleHRyYWN0MShvLmFyY3MpOyBicmVhaztcbiAgICAgIGNhc2UgXCJNdWx0aUxpbmVTdHJpbmdcIjogY2FzZSBcIlBvbHlnb25cIjogZXh0cmFjdDIoby5hcmNzKTsgYnJlYWs7XG4gICAgICBjYXNlIFwiTXVsdGlQb2x5Z29uXCI6IGV4dHJhY3QzKG8uYXJjcyk7IGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGdlb21ldHJ5KG9iamVjdCk7XG5cbiAgZ2VvbXNCeUFyYy5mb3JFYWNoKGZpbHRlciA9PSBudWxsXG4gICAgICA/IGZ1bmN0aW9uKGdlb21zKSB7IGFyY3MucHVzaChnZW9tc1swXS5pKTsgfVxuICAgICAgOiBmdW5jdGlvbihnZW9tcykgeyBpZiAoZmlsdGVyKGdlb21zWzBdLmcsIGdlb21zW2dlb21zLmxlbmd0aCAtIDFdLmcpKSBhcmNzLnB1c2goZ2VvbXNbMF0uaSk7IH0pO1xuXG4gIHJldHVybiBhcmNzO1xufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgYmFzZSByZW5kZXJlclxuLy8gQnVpbGRzIHRoZSBzdGFnZTogcHJvamVjdGlvbiwgcGFwZXIsIG9jZWFuLCBiYXRoeW1ldHJ5LCByZWxpZWYsIGxhbmQsIHBvbGl0aWVzLCB3YXRlciBsaW5lcywgY29hc3QsIGdyYXRpY3VsZSwgZnJhbWUuXG4vLyBBbGwgZ2VvbWV0cnkgY29tZXMgZnJvbSB0aGUgZG93bmxvYWRlZCBsYXllcnM7IHRoaXMgZmlsZSBvbmx5IHByb2plY3RzIGFuZCBzdHlsZXMgaXQuXG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUsIG1lc2ggfSBmcm9tICd0b3BvanNvbi1jbGllbnQnO1xuaW1wb3J0IHsgYXNzZXRVUkwgfSBmcm9tICcuLi9kYXRhL2xvYWRlci5qcyc7XG5cbmV4cG9ydCBjb25zdCBXID0gMTkyMDtcbmV4cG9ydCBjb25zdCBIID0gMTA4MDtcbi8vIFRoZSBnb2xkIHJpbmcuIFRoZSBib3R0b20gaXMgZGVlcGVyIGJlY2F1c2UgaXQgY2FycmllcyB0aGUgdGltZWxpbmUgc3RyaXAuXG5leHBvcnQgY29uc3QgRlJBTUUgPSB7IGxlZnQ6IDMyLCByaWdodDogMzIsIHRvcDogMzIsIGJvdHRvbTogNjQgfTtcblxuY29uc3QgUFJPSkVDVElPTlMgPSB7XG4gIGVxdWFsRWFydGg6ICgpID0+IGQzLmdlb0VxdWFsRWFydGgoKSxcbiAgbGFtYmVydEF6aW11dGhhbEVxdWFsQXJlYTogKCkgPT4gZDMuZ2VvQXppbXV0aGFsRXF1YWxBcmVhKCksXG4gIGFsYmVyc1VzYTogKCkgPT4gZDMuZ2VvQWxiZXJzVXNhKCksXG59O1xuXG4vLyBBIGxvbi9sYXQgYm94IHdpdGggaXRzIGVkZ2VzIGRlbnNpZmllZCBzbyBmaXRFeHRlbnQgc2VlcyB0aGUgYm94J3MgY3VydmVkIG91dGxpbmUgaW4gdGhlIHByb2plY3Rpb24uXG4vLyBkMy1nZW8gdHJlYXRzIHNwaGVyaWNhbCBwb2x5Z29ucyBieSB3aW5kaW5nIG9yZGVyOiB0aGUgZXh0ZXJpb3IgcmluZyBtdXN0IHJ1biBjbG9ja3dpc2Vcbi8vICh3ZXN0XHUyMTkyZWFzdCBhbG9uZyB0aGUgbm9ydGggZWRnZSBmaXJzdCksIG9yIHRoZSBcImluc2lkZVwiIGJlY29tZXMgdGhlIHJlc3Qgb2YgdGhlIGdsb2JlLlxuZnVuY3Rpb24gZXh0ZW50UG9seWdvbih7IHdlc3QsIHNvdXRoLCBlYXN0LCBub3J0aCB9LCBzdGVwID0gMSkge1xuICBjb25zdCByaW5nID0gW107XG4gIGZvciAobGV0IHggPSB3ZXN0OyB4IDwgZWFzdDsgeCArPSBzdGVwKSByaW5nLnB1c2goW3gsIG5vcnRoXSk7XG4gIGZvciAobGV0IHkgPSBub3J0aDsgeSA+IHNvdXRoOyB5IC09IHN0ZXApIHJpbmcucHVzaChbZWFzdCwgeV0pO1xuICBmb3IgKGxldCB4ID0gZWFzdDsgeCA+IHdlc3Q7IHggLT0gc3RlcCkgcmluZy5wdXNoKFt4LCBzb3V0aF0pO1xuICBmb3IgKGxldCB5ID0gc291dGg7IHkgPCBub3J0aDsgeSArPSBzdGVwKSByaW5nLnB1c2goW3dlc3QsIHldKTtcbiAgcmluZy5wdXNoKHJpbmdbMF0pO1xuICByZXR1cm4geyB0eXBlOiAnUG9seWdvbicsIGNvb3JkaW5hdGVzOiBbcmluZ10gfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQcm9qZWN0aW9uKHN0YWdlLCBpbm5lcikge1xuICBjb25zdCBtYWtlID0gUFJPSkVDVElPTlNbc3RhZ2UucHJvamVjdGlvbl07XG4gIGlmICghbWFrZSkgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb2plY3Rpb24gJHtzdGFnZS5wcm9qZWN0aW9ufWApO1xuICBjb25zdCBwcm9qID0gbWFrZSgpO1xuICBpZiAoc3RhZ2Uucm90YXRlICYmIHByb2oucm90YXRlKSBwcm9qLnJvdGF0ZShzdGFnZS5yb3RhdGUpO1xuICBwcm9qLmZpdEV4dGVudChpbm5lciwgZXh0ZW50UG9seWdvbihzdGFnZS5leHRlbnQpKTtcbiAgcmV0dXJuIHByb2o7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFnZShzdmcsIHN0YWdlLCBsYXllcnMpIHtcbiAgY29uc3QgaW5uZXIgPSBbW0ZSQU1FLmxlZnQsIEZSQU1FLnRvcF0sIFtXIC0gRlJBTUUucmlnaHQsIEggLSBGUkFNRS5ib3R0b21dXTtcbiAgY29uc3QgW1t4MCwgeTBdLCBbeDEsIHkxXV0gPSBpbm5lcjtcbiAgY29uc3QgcHJvamVjdGlvbiA9IG1ha2VQcm9qZWN0aW9uKHN0YWdlLCBpbm5lcik7XG4gIGNvbnN0IHBhdGggPSBkMy5nZW9QYXRoKHByb2plY3Rpb24pO1xuXG4gIC8vIFByb2plY3RlZCBwYXRoIHN0cmluZ3MgYXJlIGNhY2hlZCBwZXIgZmVhdHVyZSBvYmplY3Q6IGEgc25hcHNob3Qgc3dpdGNoIG9ubHkgcmUtYmluZHMgY2FjaGVkIHN0cmluZ3MuXG4gIGNvbnN0IGNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbiAgY29uc3QgZCA9IChmKSA9PiB7XG4gICAgbGV0IHMgPSBjYWNoZS5nZXQoZik7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkgeyBzID0gcGF0aChmKSB8fCAnJzsgY2FjaGUuc2V0KGYsIHMpOyB9XG4gICAgcmV0dXJuIHM7XG4gIH07XG5cbiAgc3ZnLmF0dHIoJ3ZpZXdCb3gnLCBgMCAwICR7V30gJHtIfWApLmF0dHIoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAneE1pZFlNaWQgbWVldCcpO1xuICBzdmcuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG5cbiAgY29uc3QgZGVmcyA9IHN2Zy5hcHBlbmQoJ2RlZnMnKTtcbiAgZGVmcy5hcHBlbmQoJ2NsaXBQYXRoJykuYXR0cignaWQnLCAnZnJhbWUtY2xpcCcpLmFwcGVuZCgncmVjdCcpXG4gICAgLmF0dHIoJ3gnLCB4MCkuYXR0cigneScsIHkwKS5hdHRyKCd3aWR0aCcsIHgxIC0geDApLmF0dHIoJ2hlaWdodCcsIHkxIC0geTApO1xuXG4gIGNvbnN0IHJvb3QgPSBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc3RhZ2UnKTtcbiAgcm9vdC5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdwYXBlcicpLmF0dHIoJ3dpZHRoJywgVykuYXR0cignaGVpZ2h0JywgSCk7XG5cbiAgY29uc3QgbWFwID0gcm9vdC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdtYXAnKS5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNmcmFtZS1jbGlwKScpO1xuICAvLyBUaGUgb2NlYW4gaXMgdGhlIGdsb2JlIGl0c2VsZjsgYW55dGhpbmcgYmV5b25kIGl0cyBlZGdlIHN0YXlzIHBhcGVyLlxuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnb2NlYW4nKS5hdHRyKCdkJywgZCh7IHR5cGU6ICdTcGhlcmUnIH0pKTtcblxuICAvLyBCYXRoeW1ldHJ5OiBoYWlybGluZSBjb250b3VycyBpbiB0aGUgb2NlYW4gdG9uZS5cbiAgY29uc3QgYmF0aHkgPSBmZWF0dXJlKGxheWVycy5iYXRoeSwgbGF5ZXJzLmJhdGh5Lm9iamVjdHMuYmF0aHltZXRyeSk7XG4gIG1hcC5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdiYXRoeW1ldHJ5JylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShiYXRoeS5mZWF0dXJlcykuam9pbigncGF0aCcpLmF0dHIoJ2QnLCBkKTtcblxuICAvLyBMYW5kIGF0IHJlc3QgKGNyZWFtKSwgdGhlbiByZWxpZWYgKHByZS1yZW5kZXJlZCBmb3IgdGhpcyBzdGFnZSwgd2hlbiBwcmVzZW50KS5cbiAgY29uc3QgbmUgPSBsYXllcnMubmU7XG4gIGNvbnN0IGxhbmQgPSBmZWF0dXJlKG5lLCBuZS5vYmplY3RzLmxhbmQpO1xuICBtYXAuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGFuZCcpLmF0dHIoJ2QnLCBkKGxhbmQpKTtcbiAgaWYgKHN0YWdlLnJlbGllZikge1xuICAgIC8vIFRoZSByZWxpZWYgcmFzdGVyIGNvdmVycyB0aGUgd2hvbGUgZnJhbWU7IG1hc2sgaXQgdG8gbGFuZCBzbyB0aGUgb2NlYW4gc3RheXMgZmxhdCBwYXBlci5cbiAgICBkZWZzLmFwcGVuZCgnY2xpcFBhdGgnKS5hdHRyKCdpZCcsICdsYW5kLWNsaXAnKS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgZChsYW5kKSk7XG4gICAgbWFwLmFwcGVuZCgnaW1hZ2UnKS5hdHRyKCdjbGFzcycsICdyZWxpZWYnKVxuICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2xhbmQtY2xpcCknKVxuICAgICAgLmF0dHIoJ3gnLCB4MCkuYXR0cigneScsIHkwKS5hdHRyKCd3aWR0aCcsIHgxIC0geDApLmF0dHIoJ2hlaWdodCcsIHkxIC0geTApXG4gICAgICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJylcbiAgICAgIC5hdHRyKCdocmVmJywgYXNzZXRVUkwoYGFzc2V0cy8ke3N0YWdlLnJlbGllZn1gKSk7XG4gIH1cblxuICAvLyBQb2xpdGllcyAoZmlsbGVkIHBlciBzbmFwc2hvdCkgYW5kIHRoZWlyIGludGVyaW9yIGJvcmRlcnMuXG4gIGNvbnN0IHBvbGl0aWVzID0gbWFwLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvbGl0aWVzJyk7XG4gIGNvbnN0IGJvcmRlcnMgPSBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnYm9yZGVycycpO1xuXG4gIC8vIFdhdGVyIGxpbmVzIGFuZCBjb2FzdC5cbiAgY29uc3Qgcml2ZXJzID0gZmVhdHVyZShuZSwgbmUub2JqZWN0cy5yaXZlcnMpO1xuICBtYXAuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncml2ZXJzJylcbiAgICAuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShyaXZlcnMuZmVhdHVyZXMuZmlsdGVyKChmKSA9PiAoZi5wcm9wZXJ0aWVzLnNjYWxlcmFuayA/PyAwKSA8PSA3KSkuam9pbigncGF0aCcpLmF0dHIoJ2QnLCBkKTtcbiAgY29uc3QgbGFrZXMgPSBmZWF0dXJlKG5lLCBuZS5vYmplY3RzLmxha2VzKTtcbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xha2VzJykuYXR0cignZCcsIGQobGFrZXMpKTtcbiAgbWFwLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2NvYXN0bGluZScpLmF0dHIoJ2QnLCBkKGZlYXR1cmUobmUsIG5lLm9iamVjdHMuY29hc3RsaW5lKSkpO1xuXG4gIC8vIEdyYXRpY3VsZTogaGFpcmxpbmUgZ29sZCwgZXZlcnkgMTBcdTAwQjAuXG4gIG1hcC5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdncmF0aWN1bGUnKS5hdHRyKCdkJywgZChkMy5nZW9HcmF0aWN1bGUxMCgpKSk7XG5cbiAgLy8gRnJhbWUgcmluZy5cbiAgcm9vdC5hcHBlbmQoJ3JlY3QnKS5hdHRyKCdjbGFzcycsICdmcmFtZScpXG4gICAgLmF0dHIoJ3gnLCB4MCkuYXR0cigneScsIHkwKS5hdHRyKCd3aWR0aCcsIHgxIC0geDApLmF0dHIoJ2hlaWdodCcsIHkxIC0geTApO1xuXG4gIGxldCBjdXJyZW50WWVhciA9IG51bGw7XG5cbiAgLy8gY2xhc3NpZnkoZmVhdHVyZSwgeWVhcikgXHUyMTkyIHsgc3RhdHVzOiAnaGlnaGxpZ2h0JyB8ICdtdXRlZCcsIGtleT8sIGxhYmVsPyB9XG4gIGZ1bmN0aW9uIHNob3dTbmFwc2hvdCh5ZWFyLCB0b3BvLCBjbGFzc2lmeSA9ICgpID0+ICh7IHN0YXR1czogJ211dGVkJyB9KSkge1xuICAgIGNvbnN0IGZjID0gZmVhdHVyZSh0b3BvLCB0b3BvLm9iamVjdHMucG9saXRpZXMpO1xuICAgIGNvbnN0IG5hbWVkID0gZmMuZmVhdHVyZXMuZmlsdGVyKChmKSA9PiBmLnByb3BlcnRpZXMuaWQpO1xuICAgIGZvciAoY29uc3QgZiBvZiBuYW1lZCkgZi5wcm9wZXJ0aWVzLmNscyA9IGNsYXNzaWZ5KGYsIHllYXIpO1xuICAgIHBvbGl0aWVzLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAuZGF0YShuYW1lZCwgKGYpID0+IGYucHJvcGVydGllcy5pZClcbiAgICAgIC5qb2luKCdwYXRoJylcbiAgICAgIC5hdHRyKCdjbGFzcycsIChmKSA9PiBgcG9saXR5ICR7Zi5wcm9wZXJ0aWVzLmNlcnRhaW50eX0gJHtmLnByb3BlcnRpZXMuY2xzLnN0YXR1c31gKVxuICAgICAgLmF0dHIoJ2QnLCBkKVxuICAgICAgLmFwcGVuZCgndGl0bGUnKS50ZXh0KChmKSA9PiBmLnByb3BlcnRpZXMuY2xzLmxhYmVsID8/IGYucHJvcGVydGllcy5uYW1lKTtcbiAgICBjb25zdCBpbnRlcmlvciA9IG1lc2godG9wbywgdG9wby5vYmplY3RzLnBvbGl0aWVzLCAoYSwgYikgPT4gYSAhPT0gYik7XG4gICAgY29uc3QgY2VydGFpbnR5ID0gbmFtZWRbMF0/LnByb3BlcnRpZXMuY2VydGFpbnR5ID8/ICdhcHByb3hpbWF0ZSc7XG4gICAgYm9yZGVycy5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKFtpbnRlcmlvcl0pLmpvaW4oJ3BhdGgnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgYGJvcmRlciAke2NlcnRhaW50eX1gKVxuICAgICAgLmF0dHIoJ2QnLCBkKTtcbiAgICBjdXJyZW50WWVhciA9IHllYXI7XG4gIH1cblxuICByZXR1cm4geyBwcm9qZWN0aW9uLCBwYXRoLCBkLCBzaG93U25hcHNob3QsIGlubmVyLCBnZXQgeWVhcigpIHsgcmV0dXJuIGN1cnJlbnRZZWFyOyB9IH07XG59XG4iLCAie1xuICBcImlkXCI6IFwiYWZyby1ldXJhc2lhXCIsXG4gIFwidGl0bGVcIjogXCJBZnJvLUV1cmFzaWFcIixcbiAgXCJwcm9qZWN0aW9uXCI6IFwiZXF1YWxFYXJ0aFwiLFxuICBcInJvdGF0ZVwiOiBbLTYwLCAwXSxcbiAgXCJleHRlbnRcIjogeyBcIndlc3RcIjogLTIwLCBcInNvdXRoXCI6IDYsIFwiZWFzdFwiOiAxNTAsIFwibm9ydGhcIjogNzYgfSxcbiAgXCJzcGFuXCI6IFsxMjAwLCAyMDAwXSxcbiAgXCJyZWxpZWZcIjogXCJyZWxpZWYvYWZyby1ldXJhc2lhLnBuZ1wiLFxuICBcImxhYmVsc1wiOiBbXG4gICAgeyBcInRleHRcIjogXCJFdXJvcGVcIiwgXCJsb25cIjogMTUsIFwibGF0XCI6IDUwLCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiTm9ydGggQWZyaWNhXCIsIFwibG9uXCI6IDEwLCBcImxhdFwiOiAyNywgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIldlc3QgQWZyaWNhXCIsIFwibG9uXCI6IC0yLCBcImxhdFwiOiAxMywgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIk1pZGRsZSBFYXN0XCIsIFwibG9uXCI6IDQ0LCBcImxhdFwiOiAyOSwgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkNlbnRyYWwgQXNpYVwiLCBcImxvblwiOiA2NiwgXCJsYXRcIjogNDQsIFwia2luZFwiOiBcInJlZ2lvblwiIH0sXG4gICAgeyBcInRleHRcIjogXCJTb3V0aCBBc2lhXCIsIFwibG9uXCI6IDc4LCBcImxhdFwiOiAyMiwgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkVhc3QgQXNpYVwiLCBcImxvblwiOiAxMTIsIFwibGF0XCI6IDM2LCBcImtpbmRcIjogXCJyZWdpb25cIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiU291dGhlYXN0IEFzaWFcIiwgXCJsb25cIjogMTA0LCBcImxhdFwiOiAxMiwgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIlNpYmVyaWFcIiwgXCJsb25cIjogMTAwLCBcImxhdFwiOiA2NCwgXCJraW5kXCI6IFwicmVnaW9uXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIk1lZGl0ZXJyYW5lYW4gU2VhXCIsIFwibG9uXCI6IDE3LCBcImxhdFwiOiAzNS41LCBcImtpbmRcIjogXCJ3YXRlclwiIH0sXG4gICAgeyBcInRleHRcIjogXCJJbmRpYW4gT2NlYW5cIiwgXCJsb25cIjogNzUsIFwibGF0XCI6IDUsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkFyYWJpYW4gU2VhXCIsIFwibG9uXCI6IDYzLCBcImxhdFwiOiAxNSwgXCJraW5kXCI6IFwid2F0ZXJcIiB9LFxuICAgIHsgXCJ0ZXh0XCI6IFwiQmF5IG9mIEJlbmdhbFwiLCBcImxvblwiOiA4OCwgXCJsYXRcIjogMTMsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIlNvdXRoIENoaW5hIFNlYVwiLCBcImxvblwiOiAxMTQsIFwibGF0XCI6IDE1LCBcImtpbmRcIjogXCJ3YXRlclwiIH0sXG4gICAgeyBcInRleHRcIjogXCJCbGFjayBTZWFcIiwgXCJsb25cIjogMzQsIFwibGF0XCI6IDQzLjUsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIkNhc3BpYW4gU2VhXCIsIFwibG9uXCI6IDUwLjUsIFwibGF0XCI6IDQxLjUsIFwia2luZFwiOiBcIndhdGVyXCIgfSxcbiAgICB7IFwidGV4dFwiOiBcIlJlZCBTZWFcIiwgXCJsb25cIjogMzgsIFwibGF0XCI6IDIwLCBcImtpbmRcIjogXCJ3YXRlclwiIH0sXG4gICAgeyBcInRleHRcIjogXCJBdGxhbnRpYyBPY2VhblwiLCBcImxvblwiOiAtMTQsIFwibGF0XCI6IDM4LCBcImtpbmRcIjogXCJ3YXRlclwiIH1cbiAgXVxufVxuIiwgIntcbiAgXCJpZFwiOiBcImFmcm8tZXVyYXNpYS1sYW1iZXJ0XCIsXG4gIFwidGl0bGVcIjogXCJBZnJvLUV1cmFzaWEgKGF6aW11dGhhbClcIixcbiAgXCJwcm9qZWN0aW9uXCI6IFwibGFtYmVydEF6aW11dGhhbEVxdWFsQXJlYVwiLFxuICBcInJvdGF0ZVwiOiBbXG4gICAgLTYwLFxuICAgIC00NVxuICBdLFxuICBcImV4dGVudFwiOiB7XG4gICAgXCJ3ZXN0XCI6IC0yMCxcbiAgICBcInNvdXRoXCI6IDYsXG4gICAgXCJlYXN0XCI6IDE1MCxcbiAgICBcIm5vcnRoXCI6IDc2XG4gIH0sXG4gIFwic3BhblwiOiBbXG4gICAgMTIwMCxcbiAgICAyMDAwXG4gIF0sXG4gIFwicmVsaWVmXCI6IFwicmVsaWVmL2Fmcm8tZXVyYXNpYS1sYW1iZXJ0LnBuZ1wiLFxuICBcImxhYmVsc1wiOiBbXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiRXVyb3BlXCIsXG4gICAgICBcImxvblwiOiAxNSxcbiAgICAgIFwibGF0XCI6IDUwLFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIk5vcnRoIEFmcmljYVwiLFxuICAgICAgXCJsb25cIjogMTAsXG4gICAgICBcImxhdFwiOiAyNyxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJXZXN0IEFmcmljYVwiLFxuICAgICAgXCJsb25cIjogLTIsXG4gICAgICBcImxhdFwiOiAxMyxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJNaWRkbGUgRWFzdFwiLFxuICAgICAgXCJsb25cIjogNDQsXG4gICAgICBcImxhdFwiOiAyOSxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJDZW50cmFsIEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDY2LFxuICAgICAgXCJsYXRcIjogNDQsXG4gICAgICBcImtpbmRcIjogXCJyZWdpb25cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiU291dGggQXNpYVwiLFxuICAgICAgXCJsb25cIjogNzgsXG4gICAgICBcImxhdFwiOiAyMixcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJFYXN0IEFzaWFcIixcbiAgICAgIFwibG9uXCI6IDExMixcbiAgICAgIFwibGF0XCI6IDM2LFxuICAgICAgXCJraW5kXCI6IFwicmVnaW9uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIlNvdXRoZWFzdCBBc2lhXCIsXG4gICAgICBcImxvblwiOiAxMDQsXG4gICAgICBcImxhdFwiOiAxMixcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTaWJlcmlhXCIsXG4gICAgICBcImxvblwiOiAxMDAsXG4gICAgICBcImxhdFwiOiA2NCxcbiAgICAgIFwia2luZFwiOiBcInJlZ2lvblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJNZWRpdGVycmFuZWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogMTcsXG4gICAgICBcImxhdFwiOiAzNS41LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiSW5kaWFuIE9jZWFuXCIsXG4gICAgICBcImxvblwiOiA3NSxcbiAgICAgIFwibGF0XCI6IDUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJBcmFiaWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogNjMsXG4gICAgICBcImxhdFwiOiAxNSxcbiAgICAgIFwia2luZFwiOiBcIndhdGVyXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGV4dFwiOiBcIkJheSBvZiBCZW5nYWxcIixcbiAgICAgIFwibG9uXCI6IDg4LFxuICAgICAgXCJsYXRcIjogMTMsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJTb3V0aCBDaGluYSBTZWFcIixcbiAgICAgIFwibG9uXCI6IDExNCxcbiAgICAgIFwibGF0XCI6IDE1LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQmxhY2sgU2VhXCIsXG4gICAgICBcImxvblwiOiAzNCxcbiAgICAgIFwibGF0XCI6IDQzLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJDYXNwaWFuIFNlYVwiLFxuICAgICAgXCJsb25cIjogNTAuNSxcbiAgICAgIFwibGF0XCI6IDQxLjUsXG4gICAgICBcImtpbmRcIjogXCJ3YXRlclwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInRleHRcIjogXCJSZWQgU2VhXCIsXG4gICAgICBcImxvblwiOiAzOCxcbiAgICAgIFwibGF0XCI6IDIwLFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0ZXh0XCI6IFwiQXRsYW50aWMgT2NlYW5cIixcbiAgICAgIFwibG9uXCI6IC0xNCxcbiAgICAgIFwibGF0XCI6IDM4LFxuICAgICAgXCJraW5kXCI6IFwid2F0ZXJcIlxuICAgIH1cbiAgXVxufVxuIiwgIntcbiAgXCJfY29tbWVudFwiOiBcIkV4dGVudCB0cmFja2VyICh2MCkuIFdoaWNoIGRvd25sb2FkZWQgYmFzZSBwb2x5Z29ucyBhcmUgaGlnaGxpZ2h0ZWQsIGJ5IHRoZSBOQU1FIHRoZSBiYXNlIG1hcCBnaXZlcyB0aGVtIGluIGVhY2ggZXJhLCBib3VuZGVkIGJ5IHN0YXJ0L2VuZCB5ZWFycy4gVGhlIHBvbHlnb25zIHRoZW1zZWx2ZXMgYXJlIG5ldmVyIGVkaXRlZC4gUm93cyBpbiBkYXRhL3JlY29yZHMuY3N2IHdpdGggdHJhY2tlcj1leHRlbnQgY2FuIGFkZCB0byBvciBvdmVycmlkZSB0aGlzIGxpc3QuXCIsXG4gIFwiZmlsbF9rZXlcIjogXCJQXCIsXG4gIFwiaGlnaGxpZ2h0c1wiOiBbXG4gICAgeyBcImlkXCI6IFwib3R0b21hblwiLCBcImxhYmVsXCI6IFwiT3R0b21hbiBFbXBpcmVcIiwgXCJzdGFydFwiOiAxMjk5LCBcImVuZFwiOiAxOTIyLCBcIm5hbWVzXCI6IFtcIk90dG9tYW4gRW1waXJlXCJdIH0sXG4gICAgeyBcImlkXCI6IFwic2FmYXZpZFwiLCBcImxhYmVsXCI6IFwiU2FmYXZpZCBFbXBpcmVcIiwgXCJzdGFydFwiOiAxNTAxLCBcImVuZFwiOiAxNzM2LCBcIm5hbWVzXCI6IFtcIlNhZmF2aWQgRW1waXJlXCJdIH0sXG4gICAgeyBcImlkXCI6IFwibXVnaGFsXCIsIFwibGFiZWxcIjogXCJNdWdoYWwgRW1waXJlXCIsIFwic3RhcnRcIjogMTUyNiwgXCJlbmRcIjogMTg1NywgXCJuYW1lc1wiOiBbXCJNdWdoYWwgRW1waXJlXCJdIH0sXG4gICAgeyBcImlkXCI6IFwibWluZ1wiLCBcImxhYmVsXCI6IFwiTWluZyBDaGluYVwiLCBcInN0YXJ0XCI6IDEzNjgsIFwiZW5kXCI6IDE2NDQsIFwibmFtZXNcIjogW1wiTWluZyBFbXBpcmVcIiwgXCJNaW5nIENoaW5lc2UgRW1waXJlXCJdIH0sXG4gICAgeyBcImlkXCI6IFwicWluZ1wiLCBcImxhYmVsXCI6IFwiUWluZyBDaGluYVwiLCBcInN0YXJ0XCI6IDE2NDQsIFwiZW5kXCI6IDE5MTIsIFwibmFtZXNcIjogW1wiTWFuY2h1IEVtcGlyZVwiLCBcIlFpbmcgRW1waXJlXCIsIFwiUWluZyBEeW5hc3R5XCJdIH0sXG4gICAgeyBcImlkXCI6IFwic29uZ2hhaVwiLCBcImxhYmVsXCI6IFwiU29uZ2hhaSBFbXBpcmVcIiwgXCJzdGFydFwiOiAxNDY0LCBcImVuZFwiOiAxNTkxLCBcIm5hbWVzXCI6IFtcIlNvbmdoYWlcIiwgXCJTb25naGFpIEVtcGlyZVwiXSB9LFxuICAgIHsgXCJpZFwiOiBcIm1vcm9jY29cIiwgXCJsYWJlbFwiOiBcIk1vcm9jY29cIiwgXCJzdGFydFwiOiAxNDUwLCBcImVuZFwiOiAyMDAwLCBcIm5hbWVzXCI6IFtcIk1vcm9jY29cIiwgXCJXYXR0YXNpZCBDYWxpcGhhdGVcIiwgXCJXYXRhc3NpZCBNb3JvY2NvXCIsIFwiU2FhZGkgTW9yb2Njb1wiLCBcIlNhYWRpIFN1bHRhbmF0ZVwiLCBcIkFsYW91aXRlIE1vcm9jY29cIl0gfSxcbiAgICB7IFwiaWRcIjogXCJydXNzaWFcIiwgXCJsYWJlbFwiOiBcIlJ1c3NpYVwiLCBcInN0YXJ0XCI6IDE0NTAsIFwiZW5kXCI6IDIwMDAsIFwibmFtZXNcIjogW1wiR3JhbmQgRHVjaHkgb2YgTW9zY293XCIsIFwiVHNhcmRvbSBvZiBNdXNjb3Z5XCIsIFwiVHNhcmRvbSBvZiBSdXNzaWFcIiwgXCJSdXNzaWFuIEVtcGlyZVwiLCBcIlJ1c3NpYVwiXSB9LFxuICAgIHsgXCJpZFwiOiBcInRva3VnYXdhXCIsIFwibGFiZWxcIjogXCJUb2t1Z2F3YSBKYXBhblwiLCBcInN0YXJ0XCI6IDE2MDMsIFwiZW5kXCI6IDE4NjgsIFwibmFtZXNcIjogW1wiVG9rdWdhd2Egc2hvZ3VuYXRlXCIsIFwiVG9rdWdhd2EgU2hvZ3VuYXRlXCJdIH1cbiAgXVxufVxuIiwgIi8vIFBhcmNobWVudCBcdTIwMTQgZW50cnkgcG9pbnRcbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcbmltcG9ydCB7IGxvYWRKU09OIH0gZnJvbSAnLi9kYXRhL2xvYWRlci5qcyc7XG5pbXBvcnQgeyBjcmVhdGVTdGFnZSB9IGZyb20gJy4vcmVuZGVyL2Jhc2UuanMnO1xuaW1wb3J0IHN0YWdlRXF1YWxFYXJ0aCBmcm9tICcuL3N0YWdlcy9hZnJvLWV1cmFzaWEuanNvbic7XG5pbXBvcnQgc3RhZ2VMYW1iZXJ0IGZyb20gJy4vc3RhZ2VzL2Fmcm8tZXVyYXNpYS1sYW1iZXJ0Lmpzb24nO1xuaW1wb3J0IGV4dGVudCBmcm9tICcuL3RyYWNrZXJzL2V4dGVudC5qc29uJztcblxuY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpO1xuY29uc3QgU1RBUlRfWUVBUiA9IE51bWJlcihwYXJhbXMuZ2V0KCd5ZWFyJykpIHx8IDE0NTA7XG4vLyA/c3RhZ2U9YWZyby1ldXJhc2lhLWxhbWJlcnQgc2hvd3MgdGhlIGFsdGVybmF0aXZlIHByb2plY3Rpb24gZm9yIGNvbXBhcmlzb24uXG5jb25zdCBTVEFHRVMgPSB7IFtzdGFnZUVxdWFsRWFydGguaWRdOiBzdGFnZUVxdWFsRWFydGgsIFtzdGFnZUxhbWJlcnQuaWRdOiBzdGFnZUxhbWJlcnQgfTtcbmNvbnN0IHN0YWdlID0gU1RBR0VTW3BhcmFtcy5nZXQoJ3N0YWdlJyldID8/IHN0YWdlRXF1YWxFYXJ0aDtcblxuLy8gRXh0ZW50IHRyYWNrZXI6IGEgYmFzZSBwb2x5Z29uIGlzIGhpZ2hsaWdodGVkIHdoZW4gaXRzIE5BTUUgbWF0Y2hlcyBhIGhpZ2hsaWdodCBlbnRyeSBhbGl2ZSBpbiB0aGF0IHllYXIuXG5jb25zdCBieU5hbWUgPSBuZXcgTWFwKCk7XG5mb3IgKGNvbnN0IGggb2YgZXh0ZW50LmhpZ2hsaWdodHMpIGZvciAoY29uc3QgbiBvZiBoLm5hbWVzKSBieU5hbWUuc2V0KG4sIGgpO1xuZnVuY3Rpb24gY2xhc3NpZnlFeHRlbnQoZiwgeWVhcikge1xuICBjb25zdCBoID0gYnlOYW1lLmdldChmLnByb3BlcnRpZXMubmFtZSk7XG4gIGlmIChoICYmIHllYXIgPj0gaC5zdGFydCAmJiB5ZWFyIDw9IGguZW5kKSByZXR1cm4geyBzdGF0dXM6ICdoaWdobGlnaHQnLCBrZXk6IGguaWQsIGxhYmVsOiBoLmxhYmVsIH07XG4gIHJldHVybiB7IHN0YXR1czogJ211dGVkJyB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCB0MCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICBjb25zdCBbY2FsZW5kYXIsIG5lLCBiYXRoeV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgbG9hZEpTT04oJ2RhdGEvY2FsZW5kYXIuanNvbicpLFxuICAgIGxvYWRKU09OKCdkYXRhL2Jhc2UvZGVyaXZlZC9uZS50b3BvanNvbicpLFxuICAgIGxvYWRKU09OKCdkYXRhL2Jhc2UvZGVyaXZlZC9iYXRoeW1ldHJ5LnRvcG9qc29uJyksXG4gIF0pO1xuICBjb25zdCB5ZWFycyA9IGNhbGVuZGFyLnNuYXBzaG90cy5tYXAoKHMpID0+IHMueWVhcik7XG4gIGNvbnN0IGJ5U25hcHNob3QgPSBuZXcgTWFwKGNhbGVuZGFyLnNuYXBzaG90cy5tYXAoKHMpID0+IFtzLnllYXIsIHNdKSk7XG5cbiAgY29uc3Qgc3ZnID0gZDMuc2VsZWN0KCcjbWFwJyk7XG4gIGNvbnN0IGF0bGFzID0gY3JlYXRlU3RhZ2Uoc3ZnLCBzdGFnZSwgeyBuZSwgYmF0aHkgfSk7XG4gIGNvbnNvbGUubG9nKGBzdGFnZSBidWlsdCBpbiAkeyhwZXJmb3JtYW5jZS5ub3coKSAtIHQwKS50b0ZpeGVkKDApfSBtc2ApO1xuXG4gIGNvbnN0IHNuYXBzaG90ID0gKHllYXIpID0+IGxvYWRKU09OKGBkYXRhL2Jhc2UvZGVyaXZlZC93b3JsZF8ke3llYXJ9LnRvcG9qc29uYCk7XG5cbiAgbGV0IGN1cnJlbnQgPSBudWxsO1xuICBhc3luYyBmdW5jdGlvbiBzaG93KHllYXIpIHtcbiAgICBpZiAoIXllYXJzLmluY2x1ZGVzKHllYXIpKSByZXR1cm47XG4gICAgY29uc3QgdG9wbyA9IGF3YWl0IHNuYXBzaG90KHllYXIpO1xuICAgIGNvbnN0IHQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBhdGxhcy5zaG93U25hcHNob3QoeWVhciwgdG9wbywgY2xhc3NpZnlFeHRlbnQpO1xuICAgIGN1cnJlbnQgPSB5ZWFyO1xuICAgIGNvbnN0IG1ldGEgPSBieVNuYXBzaG90LmdldCh5ZWFyKTtcbiAgICBkb2N1bWVudC50aXRsZSA9IGBQYXJjaG1lbnQgXHUwMEI3ICR7eWVhcn1gO1xuICAgIGQzLnNlbGVjdCgnI3llYXItcmVhZG91dCcpLnRleHQobWV0YS5zb3VyY2VfeWVhciAhPT0geWVhciA/IGAke3llYXJ9IFx1MDBCNyBiYXNlIG1hcCAke21ldGEuc291cmNlX3llYXJ9YCA6IGAke3llYXJ9YCk7XG4gICAgZDMuc2VsZWN0QWxsKCcjeWVhcnMgYnV0dG9uJykuY2xhc3NlZCgnYWN0aXZlJywgZnVuY3Rpb24gKCkgeyByZXR1cm4gTnVtYmVyKHRoaXMuZGF0YXNldC55ZWFyKSA9PT0geWVhcjsgfSk7XG4gICAgY29uc29sZS5sb2coYHNuYXBzaG90ICR7eWVhcn06ICR7KHBlcmZvcm1hbmNlLm5vdygpIC0gdCkudG9GaXhlZCgxKX0gbXNgKTtcbiAgfVxuXG4gIC8vIFllYXIgYnV0dG9ucy5cbiAgZDMuc2VsZWN0KCcjeWVhcnMnKS5zZWxlY3RBbGwoJ2J1dHRvbicpLmRhdGEoeWVhcnMpLmpvaW4oJ2J1dHRvbicpXG4gICAgLmF0dHIoJ2RhdGEteWVhcicsICh5KSA9PiB5KS50ZXh0KCh5KSA9PiB5KVxuICAgIC5vbignY2xpY2snLCAoXywgeSkgPT4gc2hvdyh5KSk7XG5cbiAgLy8gS2V5Ym9hcmQ6IFx1MjE5MCBcdTIxOTIgc3RlcCB0aHJvdWdoIHRoZSBjYWxlbmRhci5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgIGNvbnN0IGkgPSB5ZWFycy5pbmRleE9mKGN1cnJlbnQpO1xuICAgIGlmIChlLmtleSA9PT0gJ0Fycm93UmlnaHQnKSBzaG93KHllYXJzW01hdGgubWluKGkgKyAxLCB5ZWFycy5sZW5ndGggLSAxKV0pO1xuICAgIGlmIChlLmtleSA9PT0gJ0Fycm93TGVmdCcpIHNob3coeWVhcnNbTWF0aC5tYXgoaSAtIDEsIDApXSk7XG4gIH0pO1xuXG4gIGF3YWl0IHNob3coU1RBUlRfWUVBUik7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVhZHknKTtcbiAgLy8gUHJlZmV0Y2ggdGhlIHJlc3Qgc28gc3dpdGNoaW5nIGlzIGluc3RhbnQuXG4gIGZvciAoY29uc3QgeSBvZiB5ZWFycykgc25hcHNob3QoeSk7XG59XG5cbm1haW4oKS5jYXRjaCgoZXJyKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgZDMuc2VsZWN0KCcjcHJvYmxlbXMnKS5jbGFzc2VkKCdoaWRkZW4nLCBmYWxzZSkudGV4dChgUGFyY2htZW50IGNvdWxkIG5vdCBzdGFydDogJHtlcnIubWVzc2FnZX1gKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFDTyxNQUFNLFFBQU4sTUFBWTtBQUFBLElBQ2pCLGNBQWM7QUFDWixXQUFLLFlBQVksSUFBSSxhQUFhLEVBQUU7QUFDcEMsV0FBSyxLQUFLO0FBQUEsSUFDWjtBQUFBLElBQ0EsSUFBSSxHQUFHO0FBQ0wsWUFBTSxJQUFJLEtBQUs7QUFDZixVQUFJLElBQUk7QUFDUixlQUFTLElBQUksR0FBRyxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSztBQUMxQyxjQUFNLElBQUksRUFBRSxDQUFDLEdBQ1gsS0FBSyxJQUFJLEdBQ1QsS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQzVELFlBQUksR0FBSSxHQUFFLEdBQUcsSUFBSTtBQUNqQixZQUFJO0FBQUEsTUFDTjtBQUNBLFFBQUUsQ0FBQyxJQUFJO0FBQ1AsV0FBSyxLQUFLLElBQUk7QUFDZCxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsVUFBVTtBQUNSLFlBQU0sSUFBSSxLQUFLO0FBQ2YsVUFBSSxJQUFJLEtBQUssSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLO0FBQ2hDLFVBQUksSUFBSSxHQUFHO0FBQ1QsYUFBSyxFQUFFLEVBQUUsQ0FBQztBQUNWLGVBQU8sSUFBSSxHQUFHO0FBQ1osY0FBSTtBQUNKLGNBQUksRUFBRSxFQUFFLENB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QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLE9BQU87QUFBQSxJQUNQLGdCQUFnQjtBQUFBLElBQ2hCLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGdCQUFnQjtBQUFBLElBQ2hCLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLGVBQWU7QUFBQSxJQUNmLFdBQVc7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLHNCQUFzQjtBQUFBLElBQ3RCLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFnQjtBQUFBLElBQ2hCLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLGtCQUFrQjtBQUFBLElBQ2xCLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLGNBQWM7QUFBQSxJQUNkLGdCQUFnQjtBQUFBLElBQ2hCLGlCQUFpQjtBQUFBLElBQ2pCLG1CQUFtQjtBQUFBLElBQ25CLGlCQUFpQjtBQUFBLElBQ2pCLGlCQUFpQjtBQUFBLElBQ2pCLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLEtBQUs7QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFFBQVE7QUFBQSxJQUNSLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxFQUNmO0FBRUEsaUJBQU8sT0FBTyxPQUFPO0FBQUEsSUFDbkIsS0FBSyxVQUFVO0FBQ2IsYUFBTyxPQUFPLE9BQU8sSUFBSSxLQUFLLGVBQWEsTUFBTSxRQUFRO0FBQUEsSUFDM0Q7QUFBQSxJQUNBLGNBQWM7QUFDWixhQUFPLEtBQUssSUFBSSxFQUFFLFlBQVk7QUFBQSxJQUNoQztBQUFBLElBQ0EsS0FBSztBQUFBO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxVQUFVO0FBQUEsRUFDWixDQUFDO0FBRUQsV0FBUyxrQkFBa0I7QUFDekIsV0FBTyxLQUFLLElBQUksRUFBRSxVQUFVO0FBQUEsRUFDOUI7QUFFQSxXQUFTLG1CQUFtQjtBQUMxQixXQUFPLEtBQUssSUFBSSxFQUFFLFdBQVc7QUFBQSxFQUMvQjtBQUVBLFdBQVMsa0JBQWtCO0FBQ3pCLFdBQU8sV0FBVyxJQUFJLEVBQUUsVUFBVTtBQUFBLEVBQ3BDO0FBRUEsV0FBUyxrQkFBa0I7QUFDekIsV0FBTyxLQUFLLElBQUksRUFBRSxVQUFVO0FBQUEsRUFDOUI7QUFFZSxXQUFSLE1BQXVCLFFBQVE7QUFDcEMsUUFBSSxHQUFHO0FBQ1AsY0FBVSxTQUFTLElBQUksS0FBSyxFQUFFLFlBQVk7QUFDMUMsWUFBUSxJQUFJLE1BQU0sS0FBSyxNQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLElBQUksU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUN0RixNQUFNLElBQUksSUFBSSxJQUFLLEtBQUssSUFBSSxLQUFRLEtBQUssSUFBSSxLQUFRLEtBQUssSUFBSSxLQUFRLElBQUksTUFBUyxJQUFJLE9BQVEsSUFBTSxJQUFJLElBQU0sQ0FBQyxJQUNoSCxNQUFNLElBQUksS0FBSyxLQUFLLEtBQUssS0FBTSxLQUFLLEtBQUssS0FBTSxLQUFLLElBQUksTUFBTyxJQUFJLE9BQVEsR0FBSSxJQUMvRSxNQUFNLElBQUksS0FBTSxLQUFLLEtBQUssS0FBUSxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxLQUFLLElBQUksS0FBUSxJQUFJLE9BQVUsSUFBSSxPQUFRLElBQU0sSUFBSSxNQUFRLEdBQUksSUFDdEosU0FDQyxJQUFJLGFBQWEsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FDNUQsSUFBSSxhQUFhLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLElBQUksTUFBTSxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLEtBQ2hHLElBQUksY0FBYyxLQUFLLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQzdELElBQUksY0FBYyxLQUFLLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQyxJQUFJLE1BQU0sS0FBSyxFQUFFLENBQUMsSUFBSSxNQUFNLEtBQUssRUFBRSxDQUFDLElBQUksTUFBTSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQ2pHLElBQUksYUFBYSxLQUFLLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFB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Q1I7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBVTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLE1BQ1QsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLE1BQVE7QUFBQSxNQUNOO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVU7QUFBQSxJQUNWLFFBQVU7QUFBQSxNQUNSO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFRO0FBQUEsUUFDUixLQUFPO0FBQUEsUUFDUCxLQUFPO0FBQUEsUUFDUCxNQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQVE7QUFBQSxRQUNSLEtBQU87QUFBQSxRQUNQLEtBQU87QUFBQSxRQUNQLE1BQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBUTtBQUFBLFFBQ1IsS0FBTztBQUFBLFFBQ1AsS0FBTztBQUFBLFFBQ1AsTUFBUTtBQUFBLE1B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LEVBQ25DO0FBRUEsT0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRO0FBQ3BCLFlBQVEsTUFBTSxHQUFHO0FBQ2pCLElBQUdBLGdCQUFPLFdBQVcsRUFBRSxRQUFRLFVBQVUsS0FBSyxFQUFFLEtBQUssOEJBQThCLElBQUksT0FBTyxFQUFFO0FBQUEsRUFDbEcsQ0FBQzsiLAogICJuYW1lcyI6IFsiYXJyYXkiLCAic3RhcnQiLCAicmFuZ2UiLCAidHlwZSIsICJkb2N1bWVudCIsICJkYXR1bSIsICJzZWxlY3Rpb24iLCAibWVyZ2UiLCAiY3JlYXRlIiwgImNyZWF0ZSIsICJwYXJzZVR5cGVuYW1lcyIsICJ0eXBlIiwgInBhcmFtcyIsICJ3aW5kb3ciLCAiZGlzcGF0Y2hfZGVmYXVsdCIsICJkaXNwYXRjaF9kZWZhdWx0IiwgInNlbGVjdF9kZWZhdWx0IiwgInNlbGVjdEFsbF9kZWZhdWx0IiwgIm1pbiIsICJtYXgiLCAiY29uc3RhbnRfZGVmYXVsdCIsICJjb25zdGFudF9kZWZhdWx0IiwgImNvbG9yIiwgInJnYiIsICJzdGFydCIsICJpIiwgIm5vdyIsICJpZCIsICJnZXQiLCAic2V0IiwgInN0YXJ0IiwgImVtcHR5IiwgImludGVycnVwdF9kZWZhdWx0IiwgImlkIiwgInNldCIsICJnZXQiLCAidHJhbnNpdGlvbiIsICJhdHRyUmVtb3ZlIiwgImF0dHJSZW1vdmVOUyIsICJhdHRyQ29uc3RhbnQiLCAiYXR0ckNvbnN0YW50TlMiLCAiYXR0ckZ1bmN0aW9uIiwgImF0dHJGdW5jdGlvbk5TIiwgImF0dHJfZGVmYXVsdCIsICJpZCIsICJnZXQiLCAiaWQiLCAic2V0IiwgImdldCIsICJpZCIsICJzZXQiLCAiZ2V0IiwgImlkIiwgInNldCIsICJmaWx0ZXJfZGVmYXVsdCIsICJtZXJnZV9kZWZhdWx0IiwgInRyYW5zaXRpb24iLCAibWVyZ2UiLCAiaWQiLCAic2V0IiwgIm9uX2RlZmF1bHQiLCAiZ2V0IiwgImlkIiwgInJlbW92ZV9kZWZhdWx0IiwgInNlbGVjdF9kZWZhdWx0IiwgImlkIiwgImdldCIsICJzZWxlY3RBbGxfZGVmYXVsdCIsICJpZCIsICJjaGlsZHJlbiIsICJpbmhlcml0IiwgImdldCIsICJTZWxlY3Rpb24iLCAic2VsZWN0aW9uX2RlZmF1bHQiLCAic3R5bGVSZW1vdmUiLCAic3R5bGVDb25zdGFudCIsICJzdHlsZUZ1bmN0aW9uIiwgImlkIiwgInJlbW92ZSIsICJzZXQiLCAic3R5bGVfZGVmYXVsdCIsICJ0ZXh0Q29uc3RhbnQiLCAidGV4dEZ1bmN0aW9uIiwgInRleHRfZGVmYXVsdCIsICJpbmhlcml0IiwgImdldCIsICJpZCIsICJzZXQiLCAiaWQiLCAic2VsZWN0X2RlZmF1bHQiLCAic2VsZWN0QWxsX2RlZmF1bHQiLCAiZmlsdGVyX2RlZmF1bHQiLCAibWVyZ2VfZGVmYXVsdCIsICJzZWxlY3Rpb25fZGVmYXVsdCIsICJvbl9kZWZhdWx0IiwgImF0dHJfZGVmYXVsdCIsICJzdHlsZV9kZWZhdWx0IiwgInRleHRfZGVmYXVsdCIsICJyZW1vdmVfZGVmYXVsdCIsICJpZCIsICJ0cmFuc2l0aW9uX2RlZmF1bHQiLCAiaW50ZXJydXB0X2RlZmF1bHQiLCAidHJhbnNpdGlvbl9kZWZhdWx0IiwgImRlZ3JlZXMiLCAiYWJzIiwgIm5vb3AiLCAib2JqZWN0IiwgImNhcnRlc2lhbiIsICJzcGhlcmljYWwiLCAiYWJzIiwgIm5vb3AiLCAiYWJzIiwgImNvbXBhcmVJbnRlcnNlY3Rpb24iLCAibiIsICJzdGFydCIsICJhcnJheSIsICJhYnMiLCAic2lnbiIsICJzdGFydCIsICJwb2ludCIsICJhYnMiLCAiYWJzIiwgImRlbHRhIiwgImNvZGUiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiYWJzIiwgImNvbXBhcmVJbnRlcnNlY3Rpb24iLCAicmluZyIsICJwb2ludCIsICJ2aXNpYmxlIiwgInkwIiwgInkxIiwgInkiLCAieDAiLCAieDEiLCAieCIsICJYMSIsICJYMCIsICJZMSIsICJZMCIsICJYIiwgIlkiLCAiZ3JhdGljdWxlIiwgImFicyIsICJub29wIiwgImFicyIsICJ4MCIsICJ5MCIsICJub29wIiwgIngwMCIsICJ5MDAiLCAieDAiLCAieTAiLCAibm9vcCIsICJ4MDAiLCAieTAwIiwgIngwIiwgInkwIiwgIm5vb3AiLCAiYXBwZW5kIiwgInByb2plY3Rpb24iLCAib2JqZWN0IiwgInByb2plY3Rpb24iLCAib2JqZWN0IiwgIngwIiwgInkwIiwgIngxIiwgInkxIiwgImFicyIsICJ4MDAiLCAieTAwIiwgInRyYW5zZm9ybSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJjYWNoZSIsICJwcm9qZWN0aW9uIiwgImRlZ3JlZXMiLCAib2JqZWN0IiwgImRlZ3JlZXMiLCAieTAiLCAieTEiLCAiYWJzIiwgImNhY2hlIiwgIm9iamVjdCIsICJhYnMiLCAibG9jYXRpb24iLCAiaWRlbnRpdHkiLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJ0cmFuc2Zvcm0iLCAiaWRlbnRpdHlfZGVmYXVsdCIsICJ4MCIsICJ5MCIsICJhcnJheSIsICJvIiwgImlkIiwgImFyY3MiLCAidHlwZSIsICJzdGFydCIsICJmcmFnbWVudEJ5RW5kIiwgImZyYWdtZW50QnlTdGFydCIsICJvYmplY3QiLCAiZmlsdGVyIiwgImFyY3MiLCAic3RhZ2UiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAicHJvamVjdGlvbiIsICJjYWNoZSIsICJyb290IiwgIm5hbWVkIiwgInNlbGVjdF9kZWZhdWx0IiwgInNlbGVjdEFsbF9kZWZhdWx0Il0KfQo=
