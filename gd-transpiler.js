import fs from "node:fs"
import Prettifier from "./pretty-gd.js"
const prettifier = new Prettifier()


function init() {
    let gd = fs.readFileSync("../../godot/pretty-gd/addons/pretty-gd/pretty.gd")
    let js = transpile(gd)
    fs.writeFileSync("pretty-gd.js", js.trim() + "\n")
}

function transpile(gd) {
    let js = ""
    prettifier.reset(gd)
    let indent_level = 0
    let indent_stack = []
    let object_depth = 0
    let in_class = 0
    let in_declaration = false
    let in_block = false
    while (!prettifier.is_eof()) {
        if (prettifier.is_eol()) {
            in_declaration = false
            if (in_class == 1) {
                js += "{"
                in_class++
            }
            while (prettifier.is_eol() && !prettifier.is_eof()) {
                prettifier.read()
            }
            let _indent_level = prettifier.read_whitespace().length
            if (_indent_level > indent_level) {
                indent_stack.push(indent_level)
                if (object_depth === 0) js += "{"
            }
            while (_indent_level < indent_level) {
                indent_level = indent_stack.pop()
                if (object_depth === 0) js += "}"
            }
            js += "\n"
            for (let i = 0; i < _indent_level; i++) js += "    "
            indent_level = _indent_level
        }
        if (prettifier.peek() == "#") {
            js += "//" + prettifier.read_token()
            continue
        }

        let token = prettifier.read_token()

        if (token == "{" || token == "[") object_depth++
        if (token == "}" || token == "]") object_depth--
        if (token == "class_name") in_class++
        if (token == "var" && in_class == 2) token = ""
        if (token == "func") in_class++
        if (token == "const" && in_class) {
            js += "}\n"
            in_class = 0
        }

        if (token == "self") token = "this" + prettifier.read_token()
        if (token == ".") token += "_gdscript_" + prettifier.read_token()


        if (declarations.includes(token)) in_declaration = true
        if (blocks.includes(token)) in_block = true

        if ((token === ":" || token === "->") && !object_depth) {
            token = ""

            if (in_declaration && prettifier.peek().trim()) {
                prettifier.read_token()
            } else if (in_block) {
                token = ")"
                in_block = false
            }
        }

        if (map[token]) token = map[token]

        js += token + " "
    }
    if (in_class > 1) {
        js += "}"
    }
    return js + "\n\n" + fs.readFileSync("gdscript.js")
}

const map = {
    ":=": "=",
    "==": "===",
    "not": "!",
    "and": "&&",
    "or": "||",
    "in": "of",
    "Array": " ",
    "class_name": "export default class",
    "self": "this",
    "func": "\n",
    "var": "let",

    "if": "if (",
    "elif": "else if (",
    "while": "while (",
    "for": "for (let",
    "match": "switch (",

    "INF": "Infinity"
}
const declarations = ["var", "const", "func"]
const blocks = ["if", "elif", "while", "for", "match"]

init()
