export default class Prettifier {
    indent_str = "\t"
    tab_size = 4
    input = ""
    pos = 0
    first_words = []
    last_token = ""

    prettify(_input) {
        this.reset(_input)
        let output = ""
        let min_indent = 0
        let max_indent = 80
        while (!this.is_eof()) {
            let line = this.read_line(min_indent, max_indent)
            if (line._gdscript_strip_edges()) {
                for (let first_token of this.first_words) {
                    if (this.doubleblank._gdscript_has(first_token)) {
                        let i = output._gdscript_rfind("\n\n")
                        if (i > 0) output = output._gdscript_substr(0, i) + "\n" + output._gdscript_substr(i)
                    }
                }
                min_indent = 0
                max_indent = ceil(this.space_size(line) / this.tab_size) + 2
                output += line + "\n"
                if (this.last_token === ":") {
                    max_indent += -1
                    min_indent = max_indent
                }
            }
            else if (!output._gdscript_ends_with("\n\n")) {
                min_indent = 0
                output += "\n"
            }
        }
        return output._gdscript_strip_edges(false, true)
    }

    reset(_input = this.input, _indent_str = this.indent_str, _tab_size = this.tab_size, _pos = 0) {
        this.input = "" + _input
        this.indent_str = _indent_str
        this.tab_size = _tab_size
        this.pos = _pos
        if (!this.indent_str) this.indent_str = "\t"
        this.tab_size = this.space_size(this.indent_str)
        this.first_words = []
        this.last_token = ""
    }

    read_line(min_indent = 0, max_indent = 10) {
        let line = this.read_whitespace()
        this.first_words = []
        this.last_token = ""
        if (this.is_eol()) return this.read()._gdscript_strip_edges()
        let indent = clamp(ceil(this.space_size(line) / float(this.tab_size)), min_indent, max_indent)
        line = ""
        for (let i of range(indent)) {
            line += this.indent_str
        }
        let tokens = ["", "", ""]
        while (!this.is_eol()) {
            tokens._gdscript_push_back(this.read_token())
            while (tokens._gdscript_size() > 3) tokens._gdscript_pop_front()
            line += this.between(tokens[0], tokens[1], tokens[2]) + tokens._gdscript_back()
        }
        this.first_words = this.get_first_words(line)
        line += this.read()
        return line._gdscript_strip_edges(false, true)
    }

    read_token() {
        let token = ""
        this.read_whitespace()
        if (this.peek() === "\n") {
            token += this.read() + this.read_whitespace()
        }
        else if (this.longoperators._gdscript_has(this.peek(4))) {
            token += this.read(4)
        }
        else if (this.longoperators._gdscript_has(this.peek(3))) {
            token += this.read(3)
        }
        else if (this.longoperators._gdscript_has(this.peek(2))) {
            token += this.read(2)
        }
        else if (this.peek() === "#") {
            token += this.read_until("\n")
        }
        else if (this.peek() === "@" && this.identifier._gdscript_containsn(this.peek(1, 1))) {
            token += this.read() + this.read_while(this.identifier)
        }
        else if (this.peek() === "." && this.number._gdscript_containsn(this.peek(1, 1))) {
            token += this.read_number()
        }
        else if (this.number._gdscript_containsn(this.peek())) {
            token += this.read_number()
        }
        else if (this.string._gdscript_containsn(this.peek()) && this.quote._gdscript_containsn(this.peek(1, 1))) {
            token += this.read_string()
        }
        else if (this.quote._gdscript_containsn(this.peek())) {
            token += this.read_string()
        }
        else if (this.identifier._gdscript_containsn(this.peek())) {
            token += this.read_while(this.identifier)
        }
        else if (this.node._gdscript_containsn(this.peek())) {
            token += this.read_node()
        }
        else {
            token += this.read()
        }
        this.read_whitespace()
        if (!token._gdscript_begins_with("#")) {
            this.last_token = token
        }
        return token
    }

    read_node() {
        let token = this.read()._gdscript_to_lower()
        if (this.quote._gdscript_containsn(this.peek())) {
            token += this.read_string()
        }
        else {
            token += this.read_while(this.nodepath)
        }
        return token
    }

    read_string() {
        let token = ""
        let quot = this.read()._gdscript_to_lower()
        if (this.string._gdscript_containsn(quot)) {
            token += quot
            quot = this.read()
        }
        if (this.peek(2) === quot + quot) {
            quot += this.read(2)
        }
        token += quot
        while (!this.is_eof() && this.peek(quot._gdscript_length()) != quot) {
            if (this.peek() === "\\") token += this.read(2)
            else token += this.read(1)
        }
        token += this.read(quot._gdscript_length())
        return token
    }

    read_number() {
        let token = ""
        let reg = this.peek()
        while (reg._gdscript_containsn(this.peek())) {
            token += this.read()._gdscript_to_lower()
            if (token === ".") token = "0."
            if (token === "0") {
                reg = ".0123456789_bex"
                if ("0123456789"._gdscript_containsn(this.peek())) {
                    token = ""
                }
            }
            else if (token._gdscript_begins_with("0x")) reg = "0123456789_abcdef"
            else if (token._gdscript_begins_with("0b")) reg = "01_"
            else if (token._gdscript_ends_with("e")) reg = "+-0123456789_"
            else if (token._gdscript_containsn("e")) reg = "0123456789_"
            else if (token._gdscript_containsn(".")) reg = "0123456789_e"
            else reg = ".0123456789_e"
        }
        if (token === "0x") token += "0"
        else if (token === "0b") token += "0"
        else if (token._gdscript_ends_with(".")) token += "0"
        else if (token._gdscript_ends_with("e")) token += "0"
        else if (token._gdscript_ends_with("-")) token += "0"
        else if (token._gdscript_ends_with("+")) token += "0"
        return token
    }

    read_word() {
        let token = ""
        while (this.peek()._gdscript_strip_edges()) {
            token += this.read()
        }
        return token
    }

    read_whitespace() {
        let token = ""
        while (!this.is_eol() && !this.peek()._gdscript_strip_edges()) {
            token += this.read()
        }
        return token
    }

    read_while(charset) {
        let output = ""
        while (charset._gdscript_containsn(this.peek()) || (charset._gdscript_containsn("ø") && this.peek()._gdscript_unicode_at(0) > 127)) {
            output += this.read()
        }
        return output
    }

    read_until(delimiter) {
        let output = ""
        while (this.peek(delimiter._gdscript_length()) != delimiter && !this.is_eof()) {
            output += this.read()
        }
        return output
    }

    read(len = 1) {
        if (this.is_eof()) return ""
        this.pos += len
        return this.input._gdscript_substr(this.pos - len, len)
    }

    peek(len = 1, skip = 0) {
        if (this.is_eof()) return ""
        return this.input._gdscript_substr(this.pos + skip, len)
    }

    is_eol() {
        return this.is_eof() || this.peek() === "\n"
    }

    is_eof() {
        return this.pos >= this.input._gdscript_length()
    }

    is_keyword(token) {
        return this.keywords._gdscript_has(token)
    }

    is_identifier(token) {
        if (!token._gdscript_strip_edges()) return false
        if (this.is_keyword(token)) return false
        if (this.number._gdscript_containsn(token._gdscript_substr(0, 1))) return false
        for (let char of token) {
            if (!this.identifier._gdscript_containsn(char)) return false
        }
        return true
    }

    between(token0, token1, token2) {
        if (!token1) return ""
        if (!token2) return ""
        if (token2._gdscript_begins_with("#")) return "  "
        if (this.signage._gdscript_containsn(token1)) {
            if (this.keywords._gdscript_has(token0)) return ""
            if (this.parens_end._gdscript_containsn(token0)) return " "
            if (this.quote._gdscript_containsn(token0._gdscript_right(1))) return " "
            if (this.identifier._gdscript_containsn(token0._gdscript_right(1))) return " "
            return ""
        }
        if (token1 === "{") return " "
        if (token2 === "}") return " "
        if (this.parens_start._gdscript_containsn(token1)) return ""
        if (this.longoperators._gdscript_has(token1)) return " "
        if (this.longoperators._gdscript_has(token2)) return " "
        if (this.operator._gdscript_containsn(token1)) return " "
        if (this.operator._gdscript_containsn(token2)) return " "
        if (this.comma._gdscript_containsn(token1)) return " "
        if (this.comma._gdscript_containsn(token2)) return ""
        if (this.keywords._gdscript_has(token1)) return " "
        if (this.keywords._gdscript_has(token2)) return " "
        if (this.parens._gdscript_containsn(token1)) return ""
        if (this.parens._gdscript_containsn(token2)) return ""
        if (this.identifier._gdscript_containsn(token1._gdscript_right(1))) return " "
        return ""
    }

    get_first_words(line) {
        return (line._gdscript_strip_edges()._gdscript_get_slice("#", 0)._gdscript_get_slice("'", 0)._gdscript_get_slice('"', 0)._gdscript_split(" ", false))
    }

    space_size(whitespace) {
        if (!whitespace) return 0
        if (!this.tab_size) this.tab_size = 4
        let sum = 0
        for (let char of whitespace) {
            if (char === "\n") {
                sum = 0
            }
            else if (char === "\t") {
                sum += 1
                while (sum % this.tab_size) sum += 1
            }
            else if (char === " ") {
                sum += 1
            }
            else {
                return sum
            }
        }
        return sum
    }
    keywords = ["if", "else", "elif", "for", "while", "break", "continue",
        "pass", "return", "class", "class_name", "extends", "is", "as", "signal",
        "static", "const", "enum", "var", "breakpoint", "yield", "in", "and", "or"
    ]
    doubleblank = ["class", "func"]
    longoperators = ["**", "<<", ">>", "==", "!=", ">=", "<=", "&&", "||",
        "+=", "-=", "*=", "/=", "%=", "**=", "&=", "^=", "|=", "<<=", ">>=",
        ":=", "->"
    ]
    operator = "%&*+-/<=>?\\^|"
    string = "r&^"
    quote = "\"\'"
    node = "$%"
    comma = ",;:"
    parens_start = "(["
    parens = "([.])"
    parens_end = "]})"
    signage = "!+-"
    number = "0123456789"
    identifier = "0123456789_abcdefghijklmnopqrstuvwxyzø"
    nodepath = "%/" + this.identifier
}

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

function float(from) {
    return parseFloat(from)
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
