// GDscript API

function print(...params) {
    console.log(...params)
}

function assert(condition, message = "") {
    if (!condition) throw new Error("Assertion failed" + message ? (": " + message) : ("."))
}

function bool(from) {
    return !!from
}

function int(from) {
    return parseInt(from)
}

function str(...args) {
    return args.join("")
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

function ceil(x) {
    return Math.ceil(x)
}

function range(b, n, s = 1) {
    var arr = []
    if (n === undefined) {
        n = b
        b = 0
    }
    b = parseInt(b)
    n = parseInt(n)
    s = parseInt(s)
    if (!s) return arr
    for (let i = b; i < n; i += s) {
        arr.push(i)
    }
    return arr
}

function func(type, methodName, implementation) {
    if (type.prototype) type = type.prototype
    Object.defineProperty(type, `_gdscript_${methodName}`, {
        value: implementation,
        enumerable: false,
        writable: true,
        configurable: true
    })
}

func(String, 'begins_with', function (text) {
    return this.slice(0, text.length) === text
})

func(String, 'containsn', function (what) {
    if (!what) return false
    return this.toLowerCase().includes(what.toLowerCase())
})

func(String, 'ends_with', function (text) {
    if (text == "") return true
    return this.slice(0 - text.length) === text
})

func(String, 'get_slice', function (delimiter, slice) {
    if (!delimiter) return ""
    return (this.includes(delimiter) ? this.split(delimiter)[slice] : this) || ""
})

func(String, 'length', function () {
    return this.length
})

func(String, 'rfind', function (what, from = -1) {
    if (!what) return -1
    return this.lastIndexOf(what, from < 0 ? this.length + from : from)
})

func(String, 'right', function (length) {
    if (!length) return ""
    return this.slice(length * -1)
})

func(String, 'split', function (delimiter = "", allow_empty = true, maxsplit = 0) {
    let input = this
    let parts = []
    if (!delimiter) allow_empty = false
    if (maxsplit < 1) maxsplit = Infinity
    while (maxsplit > 0 && input && input.includes(delimiter)) {
        let part = input.slice(0, input.indexOf(delimiter) || (delimiter ? 0 : 1))
        if (part || allow_empty) {
            parts.push(part)
            maxsplit--
        }
        input = input.slice((input.indexOf(delimiter) + delimiter.length) || 1)
    }
    if (input || allow_empty) parts.push(input)
    return parts
})

func(String, 'strip_edges', function (left = true, right = true) {
    let v = this
    if (left) v = v.trimStart()
    if (right) v = v.trimEnd()
    return v
})

func(String, 'substr', function (from, len = -1) {
    if (from < 0) return ""
    if (len == -1) len = Infinity
    return this.substr(from, len)
})

func(String, 'to_lower', function () {
    return this.toLowerCase()
})

func(String, 'unicode_at', function (at) {
    if (at < 0) return 0
    return this.charCodeAt(at)
})

func(Object, 'has', function (value) {
    return this[value] !== undefined
})

func(Array, 'has', function (value) {
    return this.includes(value)
})

func(Array, 'back', function () {
    return this.length ? this[this.length - 1] : null
})

func(Array, 'pop_front', function () {
    return this.shift()
})

func(Array, 'push_back', function (value) {
    this.push(value)
})

func(Array, 'size', function () {
    return this.length
})

func(JSON, 'stringify', function (data, indent = "", sort_keys = true, full_precision = false) {
    return JSON.stringify(data, null, indent)
})
