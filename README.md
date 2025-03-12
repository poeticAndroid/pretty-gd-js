# pretty.gd for JavaScript

![pretty godot](./images/pretty.png)

A formatter for GDScript that just works!

## Usage

### Command line

```
$ npm install -g pretty-gd-js

$ pretty.gd --help
Usage: pretty.gd [options] [path] [files...]

Options:
  -s, --spaces <size>  enforce (or, if -t is also set, convert from) space-based indentation
  -t, --tabs           enforce tab-based indentation
  -d, --dir            prettify all *.gd files in [path]
  -w, --watch          automatically prettify any modified *.gd files in [path]
  -h, --help           display help for command
```

### JavaScript API

  - `prettify(input: string, startInsideString: string = null): string`
    - `input: string` // The string of GDScript to make pretty.
    - `startInsideString: string` // If set to a string delimiter, assume `input` is starting inside a string. Default is `null`.
  - `isInsideString: string` // If last operation ended inside a string, this will be set to the type of quotes of the string. Otherwise `null`.
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

If you come across any issues with using this software, please [let me know](https://github.com/poeticAndroid/pretty-gd-js/issues).

## Release Notes

### 1.14.1

 - When `--dir` or `--watch` are used without specifying a `path`, it will default to current directory.
 - Command-line tool will safely ignore files and folders it cannot access.

### 1.14.0

 - Number literals, including hexadecimals, will be corrected to lower case.
 - Support for all types of strings, including `r"raw strings"`, `'''triple-single-quoted strings'''` and `%"node strings"`.
 - Better handling of multiline strings of any type. API changed slightly.

### 1.13.1

 - Command line options to prettify entire folders.
 - `not` is no longer treated as a keyword that has to be surrounded by whitespace.
 - `{ curly brackets }` are now padded inside.
 - Vertical spacing gets adjusted. `func` and `class` declarations get two blank lines above them. Maximum one consecutive blank line everywhere else.

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
