import fs from "node:fs"
import Prettifier from "./pretty-gd.js"
const prettifier = new Prettifier()


function init() {
    let gd = fs.readFileSync("../../godot/pretty-gd/addons/pretty-gd/pretty.gd")
    //let gd = fs.readFileSync("../../godot/pretty-gd/test/api_test.gd")
    let js = transpile(gd)
    fs.writeFileSync("pretty-gd.js", js.trim() + "\n")
    //fs.writeFileSync("test/api_test.js", js.trim() + "\n")
}

function transpile(gd) {
    let js = ""
    prettifier.reset(gd)
    let indent_level = 0
    let indent_stack = []
    let object_depth = 0
    let in_class = 0
    let in_func = 0
    let locals = []
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
        if (prettifier.peek(3) == "#; ") {
            js += prettifier.read_token().slice(1)
            continue
        }
        if (prettifier.peek() == "#") {
            js += "//" + prettifier.read_token()
            continue
        }

        let token = prettifier.read_token()

        if (token == "{" || token == "[") object_depth++
        if (token == "}" || token == "]") object_depth--
        if (token == "class_name") in_class++
        if (token == "extends" && !in_class) {
            token = "class_name"
            in_class++
        }
        if ((token == "const" || token == "var") && indent_level == 0) {
            token = prettifier.read_token()
            locals = []
            in_func = 3.5
        }
        if (token == "func") {
            locals = []
            in_func = 1
            in_class++
        }
        if (token == "(" && in_func == 1) in_func = 2
        if (prettifier.is_identifier(token) && in_func == 2) {
            locals.push(token)
            in_func = 2.5
        }
        if (prettifier.is_identifier(token) && in_func == 2.5) {
            if (!(AllGlobals.includes(token) || locals.includes(token))) token = "this." + token
        }
        if (token == "," && in_func == 2.5) in_func = 2
        if (token == ")" && in_func >= 2 && in_func < 3) in_func = 3
        if ((token == "const" || token == "var" || token == "for") && in_func == 3 && indent_level) in_func = 3.5
        if (prettifier.is_identifier(token)) {
            if (in_func == 3 && !(AllGlobals.includes(token) || locals.includes(token))) token = "this." + token
            if (in_func == 3.5) {
                locals.push(token)
                in_func = 3
            }
        }
        if (token == ".") token += "_gdscript_" + prettifier.read_token()

        /*if (token == "const" && in_class) {
            js += "}\n"
            in_class = 0
        }*/


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

        js += token + (token == "-" ? "" : " ")
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

    "PI": "Math.PI",
    "TAU": "Math.TAU",
    "INF": "Infinity",
    "NAN": "NaN"
}
const declarations = ["var", "const", "func"]
const blocks = ["if", "elif", "while", "for", "match"]


const Types = [
    "bool", "int", "float", "String", "Array", "Object",
    "false", "true", "null", "self",
    "JSON", "not"
]

const GlobalScope = [
    "abs", "absf", "absi", "acos", "acosh", "angle_difference", "asin",
    "asinh", "atan", "atan2", "atanh", "bezier_derivative",
    "bezier_interpolate", "bytes_to_var", "bytes_to_var_with_objects", "ceil",
    "ceilf", "ceili", "clamp", "clampf", "clampi", "cos", "cosh",
    "cubic_interpolate", "cubic_interpolate_angle",
    "cubic_interpolate_angle_in_time", "cubic_interpolate_in_time",
    "db_to_linear", "deg_to_rad", "ease", "error_string", "exp", "floor",
    "floorf", "floori", "fmod", "fposmod", "hash", "instance_from_id",
    "inverse_lerp", "is_equal_approx", "is_finite", "is_inf",
    "is_instance_id_valid", "is_instance_valid", "is_nan", "is_same",
    "is_zero_approx", "lerp", "lerp_angle", "lerpf", "linear_to_db", "log",
    "max", "maxf", "maxi", "min", "minf", "mini", "move_toward",
    "nearest_po2", "pingpong", "posmod", "pow", "print", "print_rich",
    "print_verbose", "printerr", "printraw", "prints", "printt", "push_error",
    "push_warning", "rad_to_deg", "rand_from_seed", "randf", "randf_range",
    "randfn", "randi", "randi_range", "randomize", "remap", "rid_allocate_id",
    "rid_from_int64", "rotate_toward", "round", "roundf", "roundi", "seed",
    "sign", "signf", "signi", "sin", "sinh", "smoothstep", "snapped",
    "snappedf", "snappedi", "sqrt", "step_decimals", "str", "str_to_var",
    "tan", "tanh", "type_convert", "type_string", "typeof", "var_to_bytes",
    "var_to_bytes_with_objects", "var_to_str", "weakref", "wrap", "wrapf",
    "wrapi"
]

const GDScript = [
    "assert", "char", "get_stack", "is_instance_of", "len", "load", "ord",
    "preload", "print_debug", "print_stack", "range", "type_exists"
]

const AllGlobals = [...Types, ...GlobalScope, ...GDScript]

init()