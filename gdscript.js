// GDscript API

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
    for (let i = b; i < n; i += s) {
        arr.push(i)
    }
    return arr
}

function func(type, methodName, implementation) {
    Object.defineProperty(type.prototype, `_gdscript_${methodName}`, {
        value: implementation,
        enumerable: false,
        writable: true,
        configurable: true
    })
}

func(Array, 'back', function () {
    return this.length ? this[this.length - 1] : null
})

func(String, 'begins_with', function (text) {
    return this.slice(0, text.length) === text
})

func(String, 'containsn', function (what) {
    if (!what) return false
    return this.toLowerCase().includes(what.toLowerCase())
})

func(String, 'ends_with', function (text) {
    return this.slice(0 - text.length) === text
})

func(String, 'get_slice', function (delimiter, slice) {
    return (this.includes(delimiter) ? this.split(delimiter)[slice] : this) || ""
})

func(Object, 'has', function (value) {
    return this[value] !== undefined
})

func(Array, 'has', function (value) {
    return this.includes(value)
})

func(String, 'length', function () {
    return this.length
})

func(Array, 'pop_front', function () {
    this.shift()
})

func(Array, 'push_back', function (value) {
    this.push(value)
})

func(String, 'rfind', function (what, from = -1) {
    return this.lastIndexOf(what, from < 0 ? this.length + from : from)
})

func(String, 'right', function (length) {
    return this.slice(length * -1)
})

func(Array, 'size', function () {
    return this.length
})

func(String, 'split', function (delimiter = "", allow_empty = true, maxsplit = 0) {
    let input = this
    let parts = []
    if (maxsplit == 0) maxsplit = Infinity
    while (maxsplit > 0 && input.includes(delimiter)) {
        let part = input.slice(0, input.indexOf(delimiter))
        if (part || allow_empty) parts.push(part)
        input = input.slice(input.indexOf(delimiter) + delimiter.length)
        maxsplit--
    }
    if (input) parts.push(input)
    return parts
})

func(String, 'strip_edges', function (left = true, right = true) {
    let v = this
    if (left) v = v.trimStart()
    if (right) v = v.trimEnd()
    return v
})

func(String, 'substr', function (from, len = -1) {
    return this.substr(from, len < 0 ? Infinity : len)
})

func(String, 'to_lower', function () {
    return this.toLowerCase()
})

func(String, 'unicode_at', function (at) {
    return this.charCodeAt(at)
})

