!(function (e, t) {
    'function' == typeof define && define.amd
      ? define('postmonger', [], function () {
          return t(e)
        })
      : 'object' == typeof exports
      ? (module.exports = t(e))
      : (e.Postmonger = t(e))
  })(this, function (e) {
    e = e || window
    var t,
      n,
      o,
      r,
      c = c || void 0,
      a = e.Postmonger,
      i = e.addEventListener || e.attachEvent ? e : window
    return (
      (t = 'undefined' != typeof c ? c : {}),
      (t.noConflict = function () {
        return (e.Postmonger = a), this
      }),
      (t.version = '0.0.14'),
      (n = t.Connection = function (e) {
        e = 'object' == typeof e ? e : {}
        var t = e.connect || i.parent,
          n = e.from || '*',
          o = e.to || '*',
          r = this
        return (
          'string' == typeof t && (t = document.getElementById(t)),
          t && !t.postMessage && t.jquery && (t = t.get(0)),
          t &&
            !t.postMessage &&
            (t.contentWindow || t.contentDocument) &&
            (t = t.contentWindow || t.contentDocument),
          t && t.postMessage
            ? ((r.connect = t), (r.to = o), (r.from = n), r)
            : (i.console &&
                i.console.warn &&
                i.console.warn(
                  ' Warning: Postmonger could not establish connection with ',
                  e.connect
                ),
              !1)
        )
      }),
      (o = t.Events = function () {
        var e = /\s+/,
          t = this
        return (
          (t._callbacks = {}),
          (t._has = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t)
          }),
          (t._keys = function (e) {
            if (Object.keys) return Object.keys(e)
            if ('object' != typeof e) throw new TypeError('Invalid object')
            var n = []
            for (var o in e) t._has(e, o) && (n[n.length] = o)
            return n
          }),
          (t.on = function (n, o, r) {
            var c, a, i, s, f
            if (!o) return t
            for (
              n = n.split(e), t._callbacks = t._callbacks || {}, c = t._callbacks;
              (a = n.shift());
  
            )
              (f = c[a]),
                (i = f ? f.tail : {}),
                (s = {}),
                (i.next = s),
                (i.context = r),
                (i.callback = o),
                (c[a] = { tail: s, next: f ? f.next : i })
            return t
          }),
          (t.off = function (n, o, r) {
            var c,
              a,
              i,
              s,
              f,
              l = t._callbacks
            if (l) {
              if (!(n || o || r)) return delete t._callbacks, t
              for (n = n ? n.split(e) : t._keys(l); (c = n.shift()); )
                if (((a = l[c]), delete l[c], a && (o || r)))
                  for (i = a.tail; (a = a.next) !== i; )
                    (s = a.callback),
                      (f = a.context),
                      ((o && s) === o && (r && f) === r) || t.on(c, s, f)
              return t
            }
          }),
          (t.trigger = function (n) {
            var o, r, c, a, i, s, f
            if (!(c = t._callbacks)) return t
            for (
              s = c.all,
                n = n.split(e),
                f = Array.prototype.slice.call(arguments, 1);
              (o = n.shift());
  
            ) {
              if ((r = c[o]))
                for (a = r.tail; (r = r.next) !== a; )
                  r.callback.apply(r.context || t, f)
              if ((r = s))
                for (a = r.tail, i = [o].concat(f); (r = r.next) !== a; )
                  r.callback.apply(r.context || t, i)
            }
            return t
          }),
          t
        )
      }),
      (r = t.Session = function () {
        var t,
          r,
          c,
          a,
          s,
          f,
          l =
            arguments.length > 0
              ? Array.prototype.slice.call(arguments, 0)
              : [{}],
          u = [],
          p = new o(),
          g = new o(),
          d = this
        for (
          d.on = p.on,
            d.off = p.off,
            d.trigger = g.trigger,
            d.end = function () {
              return (
                p.off(),
                g.off(),
                i.removeEventListener
                  ? i.removeEventListener('message', f, !1)
                  : i.detachEvent && i.detachEvent('onmessage', f),
                d
              )
            },
            r = 0,
            a = l.length;
          a > r;
          r++
        )
          if ((t = new n(l[r]))) {
            for (c = 0, s = u.length; s > c; c++)
              if (
                u[c].connect === t.connect &&
                u[c].from === t.from &&
                u[c].to === t.to
              ) {
                t = null
                break
              }
            t && u.push(t)
          }
        if (
          ((f = function (t) {
            var n,
              o,
              r,
              c = null,
              a = []
            for (o = 0, r = u.length; r > o; o++)
              if (u[o].connect === t.source) {
                c = u[o]
                break
              }
            if (!c) return !1
            if ('*' !== c.from && c.from !== t.origin) return !1
            try {
              if (((n = JSON.parse(t.data)), !n.e)) return !1
            } catch (i) {
              return !1
            }
            a.push(n.e), delete n.e
            for (o in n) a.push(n[o])
            p.trigger.apply(e, a)
          }),
          i.addEventListener)
        )
          i.addEventListener('message', f, !1)
        else {
          if (!i.attachEvent)
            return (
              i.console &&
                i.console.warn &&
                i.console.warn(
                  'WARNING: Postmonger could not listen for messages on window %o',
                  i
                ),
              !1
            )
          i.attachEvent('onmessage', f)
        }
        return (
          g.on('all', function () {
            var e,
              t,
              n = Array.prototype.slice.call(arguments, 0),
              o = {}
            for (o.e = n[0], e = 1, t = n.length; t > e; e++) o['a' + e] = n[e]
            for (e = 0, t = u.length; t > e; e++)
              u[e].connect.postMessage(JSON.stringify(o), u[e].to)
          }),
          d
        )
      }),
      t
    )
  })
  