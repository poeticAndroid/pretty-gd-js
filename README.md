# Prettify GDScript

![pretty godot](./images/pretty.png)

A formatter for GDScript that just works!

## Requirements

None!

## Usage

### Command line

```
$ npm install -g prettify-gdscript
$ prettify-gdscript *.gd
```

### API

  - `prettify(input:string, startInsideString:bool = false) -> string`
    - `input:string` - The string of GDScript to make pretty.
    - `startInsideString:bool` - if `true`, assume `input` is starting inside a `"""multiline string"""`. Default is `false`.
  - `isInsideString:bool` - `true` if last operation ended inside a `"""multiline string"""`.
  - `indent:string` - indentation string. Default is `"\t"`.
  - `eol:string` - line ending. Default is auto-detect.

#### Example

```js
const fs = require("node:fs"),
  pretty = require("prettify-gdscript")

let input = "", output = ""
let file = "my_script.gd"
input = "" + fs.readFileSync(file)
output += pretty.prettify(input) // <- This is the main function
output += pretty.eol || "\n"
fs.writeFileSync(file, output)
```

## Known Issues

none yet..

## Release Notes

### 1.10.0

 - Treat `!` as a sign (like `-` for negative values)

### 1.9.0

 - Opening curly brackets is now its own class (which helps with spacing in enums)

### 1.7.0

 - Recongnize operators longer than one character
 - Refactored tokenizer

### 1.3.0

 - Added support for `_` in numbers
 - Added support for `@annotations`
 - Added support for nodepaths starting with `&`, `^` or `%`

### 1.2.0

 - Recognizing node paths

### 0.3.0

 - Giving keywords some room

### 0.2.0

  - Fancy icon!

### 0.1.0

Initial release!
