# Prettify GDScript

![pretty godot](./images/pretty.png)

A formatter for GDScript that just works!

## Requirements

None!

## Usage

### Command line

```
$ npm install -g prettify-gdscript

$ prettify-gdscript --help
Usage: prettify-gdscript [options] <files...>

Options:
  --lf             Unix-type line endings
  --crlf           Dos-type line endings
  --spaces <size>  Space-based indentation
  --tabs           Tab-based indentation
  -h, --help       display help for command
```

### JavaScript API

  - `prettify(input: string, startInsideString: bool = false): string`
    - `input: string` - The string of GDScript to make pretty.
    - `startInsideString: bool` - if `true`, assume `input` is starting inside a `"""string"""`. Default is `false`.
  - `isInsideString: bool` - `true` if last operation ended inside a `"""string"""`.
  - `eol: string` - line ending. Default is `null` for auto-detect.
  - `indent: string` - indentation string. Default is `null` for auto-detect.
  - `tabSize: number` - Tab size. This will be overwritten if `indent` is set or detected to be space-based. Default is `4`.

To parse a document line by line, remember to feed `isInsideString` back into the `prettify()` call as the second parameter.

Keep in mind that `eol`, `indent` and `tabSize` will be preserved between calls to `prettify()`.
If you want to auto-detect for each call, remember to reset these properties to `null`.

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

### 1.11.1

 - Command line options

### 1.11.0

 - The command line tool now actually works
 - Parse indentation based on visual space, rather than character count

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
