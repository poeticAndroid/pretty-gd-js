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
                    if (doubleblank._gdscript_has(first_token)) {
                        let i = output._gdscript_rfind("\n\n")
                        if (i > 0) output = output._gdscript_substr(0, i) + "\n" + output._gdscript_substr(i)
                    }
                }
                min_indent = 0
                max_indent = ceil(this.space_size(line) / this.tab_size) + 2
                output += line + "\n"
                if (this.last_token === ":") {
                    max_indent += - 1
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
        //#var indent = clamp(ceil((self.space_size(line) + self.tab_size - 1) / self.tab_size), min_indent, max_indent)
        let indent = clamp(ceil(this.space_size(line) / this.tab_size), min_indent, max_indent)
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
        else if (longoperators._gdscript_has(this.peek(4))) {
            token += this.read(4)
        }
        else if (longoperators._gdscript_has(this.peek(3))) {
            token += this.read(3)
        }
        else if (longoperators._gdscript_has(this.peek(2))) {
            token += this.read(2)
        }
        else if (this.peek() === "#") {
            token += this.read_until("\n")
        }
        else if (this.peek() === "@" && identifier._gdscript_containsn(this.peek(1, 1))) {
            token += this.read() + this.read_while(identifier)
        }
        else if (this.peek() === "." && number._gdscript_containsn(this.peek(1, 1))) {
            token += this.read_number()
        }
        else if (number._gdscript_containsn(this.peek())) {
            token += this.read_number()
        }
        else if (string._gdscript_containsn(this.peek()) && quote._gdscript_containsn(this.peek(1, 1))) {
            token += this.read_string()
        }
        else if (quote._gdscript_containsn(this.peek())) {
            token += this.read_string()
        }
        else if (identifier._gdscript_containsn(this.peek())) {
            token += this.read_while(identifier)
        }
        else if (node._gdscript_containsn(this.peek())) {
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
        if (quote._gdscript_containsn(this.peek())) {
            token += this.read_string()
        }
        else {
            token += this.read_while(nodepath)
        }
        return token
    }

    read_string() {
        let token = ""
        let quot = this.read()._gdscript_to_lower()
        if (string._gdscript_containsn(quot)) {
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

    between(token0, token1, token2) {
        if (!token1) return ""
        if (!token2) return ""
        if (token2._gdscript_begins_with("#")) return "  "
        if (sign._gdscript_containsn(token1)) {
            if (keywords._gdscript_has(token0)) return ""
            if (parens_end._gdscript_containsn(token0)) return " "
            if (quote._gdscript_containsn(token0._gdscript_right(1))) return " "
            if (identifier._gdscript_containsn(token0._gdscript_right(1))) return " "
            return ""
        }
        if (token1 === "{") return " "
        if (token2 === "}") return " "
        if (parens_start._gdscript_containsn(token1)) return ""
        if (longoperators._gdscript_has(token1)) return " "
        if (longoperators._gdscript_has(token2)) return " "
        if (operator._gdscript_containsn(token1)) return " "
        if (operator._gdscript_containsn(token2)) return " "
        if (comma._gdscript_containsn(token1)) return " "
        if (comma._gdscript_containsn(token2)) return ""
        if (keywords._gdscript_has(token1)) return " "
        if (keywords._gdscript_has(token2)) return " "
        if (parens._gdscript_containsn(token1)) return ""
        if (parens._gdscript_containsn(token2)) return ""
        if (identifier._gdscript_containsn(token1._gdscript_right(1))) return " "
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
}
const keywords = ["if", "else", "elif", "for", "while", "break", "continue",
    "pass", "return", "class", "class_name", "extends", "is", "as", "signal",
    "static", "const", "enum", "var", "breakpoint", "yield", "in", "and", "or"
]
const doubleblank = ["class", "func"]
const longoperators = ["**", "<<", ">>", "==", "!=", ">=", "<=", "&&", "||",
    "+=", "-=", "*=", "/=", "%=", "**=", "&=", "^=", "|=", "<<=", ">>=",
    ":=", "->"
]
const operator = "%&*+-/<=>?\\^|"
const string = "r&^"
const quote = "\"\'"
const node = "$%"
const comma = ",;:"
const parens_start = "(["
const parens = "([.])"
const parens_end = "]})"
const sign = "!+-"
const number = "0123456789"
const identifier = "0123456789_abcdefghijklmnopqrstuvwxyzø"
const nodepath = "%/" + identifier


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
