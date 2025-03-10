# pretty.gd for JavaScript

![pretty godot](./images/pretty.png)

A formatter for GDScript that just works!

## Requirements

None!

## Usage

### Command line

```
$ npm install -g pretty-gd-js

$ pretty.gd --help
Usage: pretty-gd-js [options] <files...>

Options:
  -s, --spaces <size>  space-based indentation
  -t, --tabs           tab-based indentation
  -h, --help           display help for command
```

### JavaScript API

  - `prettify(input: string, startInsideString: bool = false): string`
    - `input: string` // The string of GDScript to make pretty.
    - `startInsideString: bool` // if `true`, assume `input` is starting inside a `"""string"""`. Default is `false`.
  - `isInsideString: bool` // This is `true` if last operation ended inside a `"""string"""`.
  - `indent: string` // Indentation string. Default is `null` for auto-detect.
  - `tabSize: number` // Tab size. This will be overwritten if `indent` is set or detected to be space-based. Default is `4`.

To parse a document line by line, remember to feed `isInsideString` back into the `prettify()` call as the second parameter.

Keep in mind that `indent` and `tabSize` will be preserved between calls to `prettify()`.
If you want to auto-detect for each call, remember to reset these properties to `null`.

#### Example

```js
const fs = require("node:fs"),
  pretty = require("pretty-gd-js")

// configure indentation
pretty.indent = "\t"
pretty.tabSize = 4

let file = "my_script.gd"
let input = fs.readFileSync(file)
let output = pretty.prettify(input) // <- This is the main function
fs.writeFileSync(file, output + "\n")
```

## Known Issues

none yet..

## Release Notes

### 1.12.0

 - Removed `eol` property. Godot editor always saves with unix-style endings anyway.

### 1.11.3

 - The command line tool now actually works
 - Command line options

### 1.11.0

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
