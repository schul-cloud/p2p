"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-MessageChannel-applicationcache-cookies-customevent-datachannel-dataview-getusermedia-indexeddb-peerconnection-postmessage-quotamanagement-serviceworker-websockets !*/
!function (e, n, t) {
  function r(e, n) {
    return (typeof e === "undefined" ? "undefined" : _typeof(e)) === n;
  }function o() {
    var e, n, t, o, i, a, s;for (var l in _) {
      if (_.hasOwnProperty(l)) {
        if (e = [], n = _[l], n.name && (e.push(n.name.toLowerCase()), n.options && n.options.aliases && n.options.aliases.length)) for (t = 0; t < n.options.aliases.length; t++) {
          e.push(n.options.aliases[t].toLowerCase());
        }for (o = r(n.fn, "function") ? n.fn() : n.fn, i = 0; i < e.length; i++) {
          a = e[i], s = a.split("."), 1 === s.length ? Modernizr[s[0]] = o : (!Modernizr[s[0]] || Modernizr[s[0]] instanceof Boolean || (Modernizr[s[0]] = new Boolean(Modernizr[s[0]])), Modernizr[s[0]][s[1]] = o), x.push((o ? "" : "no-") + s.join("-"));
        }
      }
    }
  }function i(e, n) {
    return !!~("" + e).indexOf(n);
  }function a() {
    return "function" != typeof n.createElement ? n.createElement(arguments[0]) : k ? n.createElementNS.call(n, "http://www.w3.org/2000/svg", arguments[0]) : n.createElement.apply(n, arguments);
  }function s() {
    var e = n.body;return e || (e = a(k ? "svg" : "body"), e.fake = !0), e;
  }function l(e, t, r, o) {
    var i,
        l,
        u,
        f,
        d = "modernizr",
        c = a("div"),
        p = s();if (parseInt(r, 10)) for (; r--;) {
      u = a("div"), u.id = o ? o[r] : d + (r + 1), c.appendChild(u);
    }return i = a("style"), i.type = "text/css", i.id = "s" + d, (p.fake ? p : c).appendChild(i), p.appendChild(c), i.styleSheet ? i.styleSheet.cssText = e : i.appendChild(n.createTextNode(e)), c.id = d, p.fake && (p.style.background = "", p.style.overflow = "hidden", f = b.style.overflow, b.style.overflow = "hidden", b.appendChild(p)), l = t(c, e), p.fake ? (p.parentNode.removeChild(p), b.style.overflow = f, b.offsetHeight) : c.parentNode.removeChild(c), !!l;
  }function u(e) {
    return e.replace(/([A-Z])/g, function (e, n) {
      return "-" + n.toLowerCase();
    }).replace(/^ms-/, "-ms-");
  }function f(n, t, r) {
    var o;if ("getComputedStyle" in e) {
      o = getComputedStyle.call(e, n, t);var i = e.console;if (null !== o) r && (o = o.getPropertyValue(r));else if (i) {
        var a = i.error ? "error" : "log";i[a].call(i, "getComputedStyle returning null, its possible modernizr test results are inaccurate");
      }
    } else o = !t && n.currentStyle && n.currentStyle[r];return o;
  }function d(n, r) {
    var o = n.length;if ("CSS" in e && "supports" in e.CSS) {
      for (; o--;) {
        if (e.CSS.supports(u(n[o]), r)) return !0;
      }return !1;
    }if ("CSSSupportsRule" in e) {
      for (var i = []; o--;) {
        i.push("(" + u(n[o]) + ":" + r + ")");
      }return i = i.join(" or "), l("@supports (" + i + ") { #modernizr { position: absolute; } }", function (e) {
        return "absolute" == f(e, null, "position");
      });
    }return t;
  }function c(e) {
    return e.replace(/([a-z])-([a-z])/g, function (e, n, t) {
      return n + t.toUpperCase();
    }).replace(/^-/, "");
  }function p(e, n, o, s) {
    function l() {
      f && (delete P.style, delete P.modElem);
    }if (s = r(s, "undefined") ? !1 : s, !r(o, "undefined")) {
      var u = d(e, o);if (!r(u, "undefined")) return u;
    }for (var f, p, v, g, m, h = ["modernizr", "tspan", "samp"]; !P.style && h.length;) {
      f = !0, P.modElem = a(h.shift()), P.style = P.modElem.style;
    }for (v = e.length, p = 0; v > p; p++) {
      if (g = e[p], m = P.style[g], i(g, "-") && (g = c(g)), P.style[g] !== t) {
        if (s || r(o, "undefined")) return l(), "pfx" == n ? g : !0;try {
          P.style[g] = o;
        } catch (y) {}if (P.style[g] != m) return l(), "pfx" == n ? g : !0;
      }
    }return l(), !1;
  }function v(e, n) {
    return function () {
      return e.apply(n, arguments);
    };
  }function g(e, n, t) {
    var o;for (var i in e) {
      if (e[i] in n) return t === !1 ? e[i] : (o = n[e[i]], r(o, "function") ? v(o, t || n) : o);
    }return !1;
  }function m(e, n, t, o, i) {
    var a = e.charAt(0).toUpperCase() + e.slice(1),
        s = (e + " " + T.join(a + " ") + a).split(" ");return r(n, "string") || r(n, "undefined") ? p(s, n, o, i) : (s = (e + " " + z.join(a + " ") + a).split(" "), g(s, n, t));
  }function h(e) {
    var n = b.className,
        t = Modernizr._config.classPrefix || "";if (k && (n = n.baseVal), Modernizr._config.enableJSClass) {
      var r = new RegExp("(^|\\s)" + t + "no-js(\\s|$)");n = n.replace(r, "$1" + t + "js$2");
    }Modernizr._config.enableClasses && (n += " " + t + e.join(" " + t), k ? b.className.baseVal = n : b.className = n);
  }function y(e, n) {
    if ("object" == (typeof e === "undefined" ? "undefined" : _typeof(e))) for (var t in e) {
      O(e, t) && y(t, e[t]);
    } else {
      e = e.toLowerCase();var r = e.split("."),
          o = Modernizr[r[0]];if (2 == r.length && (o = o[r[1]]), "undefined" != typeof o) return Modernizr;n = "function" == typeof n ? n() : n, 1 == r.length ? Modernizr[r[0]] = n : (!Modernizr[r[0]] || Modernizr[r[0]] instanceof Boolean || (Modernizr[r[0]] = new Boolean(Modernizr[r[0]])), Modernizr[r[0]][r[1]] = n), h([(n && 0 != n ? "" : "no-") + r.join("-")]), Modernizr._trigger(e, n);
    }return Modernizr;
  }function C(e, n) {
    var t = e.deleteDatabase(n);t.onsuccess = function () {
      y("indexeddb.deletedatabase", !0);
    }, t.onerror = function () {
      y("indexeddb.deletedatabase", !1);
    };
  }var _ = [],
      w = { _version: "3.6.0", _config: { classPrefix: "", enableClasses: !0, enableJSClass: !0, usePrefixes: !0 }, _q: [], on: function on(e, n) {
      var t = this;setTimeout(function () {
        n(t[e]);
      }, 0);
    }, addTest: function addTest(e, n, t) {
      _.push({ name: e, fn: n, options: t });
    }, addAsyncTest: function addAsyncTest(e) {
      _.push({ name: null, fn: e });
    } },
      Modernizr = function Modernizr() {};Modernizr.prototype = w, Modernizr = new Modernizr();var x = [];Modernizr.addTest("applicationcache", "applicationCache" in e), Modernizr.addTest("cookies", function () {
    try {
      n.cookie = "cookietest=1";var e = -1 != n.cookie.indexOf("cookietest=");return n.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT", e;
    } catch (t) {
      return !1;
    }
  }), Modernizr.addTest("customevent", "CustomEvent" in e && "function" == typeof e.CustomEvent), Modernizr.addTest("dataview", "undefined" != typeof DataView && "getFloat64" in DataView.prototype);var S = "Moz O ms Webkit",
      T = w._config.usePrefixes ? S.split(" ") : [];w._cssomPrefixes = T;var b = n.documentElement,
      k = "svg" === b.nodeName.toLowerCase(),
      E = { elem: a("modernizr") };Modernizr._q.push(function () {
    delete E.elem;
  });var P = { style: E.elem.style };Modernizr._q.unshift(function () {
    delete P.style;
  });var z = w._config.usePrefixes ? S.toLowerCase().split(" ") : [];w._domPrefixes = z, w.testAllProps = m;var N = function N(n) {
    var r,
        o = prefixes.length,
        i = e.CSSRule;if ("undefined" == typeof i) return t;if (!n) return !1;if (n = n.replace(/^@/, ""), r = n.replace(/-/g, "_").toUpperCase() + "_RULE", r in i) return "@" + n;for (var a = 0; o > a; a++) {
      var s = prefixes[a],
          l = s.toUpperCase() + "_" + r;if (l in i) return "@-" + s.toLowerCase() + "-" + n;
    }return !1;
  };w.atRule = N;var O,
      j = w.prefixed = function (e, n, t) {
    return 0 === e.indexOf("@") ? N(e) : (-1 != e.indexOf("-") && (e = c(e)), n ? m(e, n, t) : m(e, "pfx"));
  };!function () {
    var e = {}.hasOwnProperty;O = r(e, "undefined") || r(e.call, "undefined") ? function (e, n) {
      return n in e && r(e.constructor.prototype[n], "undefined");
    } : function (n, t) {
      return e.call(n, t);
    };
  }(), w._l = {}, w.on = function (e, n) {
    this._l[e] || (this._l[e] = []), this._l[e].push(n), Modernizr.hasOwnProperty(e) && setTimeout(function () {
      Modernizr._trigger(e, Modernizr[e]);
    }, 0);
  }, w._trigger = function (e, n) {
    if (this._l[e]) {
      var t = this._l[e];setTimeout(function () {
        var e, r;for (e = 0; e < t.length; e++) {
          (r = t[e])(n);
        }
      }, 0), delete this._l[e];
    }
  }, Modernizr._q.push(function () {
    w.addTest = y;
  }), Modernizr.addAsyncTest(function () {
    var n;try {
      n = j("indexedDB", e);
    } catch (t) {}if (n) {
      var r = "modernizr-" + Math.random(),
          o = n.open(r);o.onerror = function () {
        o.error && "InvalidStateError" === o.error.name ? y("indexeddb", !1) : (y("indexeddb", !0), C(n, r));
      }, o.onsuccess = function () {
        y("indexeddb", !0), C(n, r);
      };
    } else y("indexeddb", !1);
  }), Modernizr.addTest("messagechannel", "MessageChannel" in e), Modernizr.addTest("postmessage", "postMessage" in e), Modernizr.addTest("quotamanagement", function () {
    var e = j("temporaryStorage", navigator),
        n = j("persistentStorage", navigator);return !(!e || !n);
  }), Modernizr.addTest("serviceworker", "serviceWorker" in navigator);var L = !1;try {
    L = "WebSocket" in e && 2 === e.WebSocket.CLOSING;
  } catch (M) {}Modernizr.addTest("websockets", L), Modernizr.addTest("peerconnection", !!j("RTCPeerConnection", e)), Modernizr.addTest("datachannel", function () {
    if (!Modernizr.peerconnection) return !1;for (var n = 0, t = z.length; t > n; n++) {
      var r = e[z[n] + "RTCPeerConnection"];if (r) {
        var o = new r(null);return "createDataChannel" in o;
      }
    }return !1;
  }), Modernizr.addTest("getUserMedia", "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices), o(), delete w.addTest, delete w.addAsyncTest;for (var R = 0; R < Modernizr._q.length; R++) {
    Modernizr._q[R]();
  }e.Modernizr = Modernizr;
}(window, document);