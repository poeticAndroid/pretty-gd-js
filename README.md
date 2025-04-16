# pretty.gd for JavaScript

![pretty godot](./images/pretty.png)

A formatter for GDScript that just works!

## Usage

### Command line

```
$ npm install -g pretty-gd-js

$ pretty-gd --help
Usage: pretty-gd [options] [path] [files...]

Options:
  -s, --spaces <size>  enforce (or, if -t is also set, convert from) space-based indentation
  -t, --tabs           enforce tab-based indentation
  -a, --auto           auto-detect indentation on each file separately
  -p, --stdio          read from stdin and write it prettified to stdout
  -d, --dir            prettify all *.gd files in [path]
  -w, --watch          automatically prettify any modified *.gd files in [path]
  -v, --version        display version
  -h, --help           display help for command
```

### Godot editor

From the terminal/command line, type the following:

```
$ cd path/to/godot/project/

$ pretty-gd -w
Watching ./ for changes...
```

The  `-w/--watch` option alone will not check already existing files, but only those that get modified _while_ `pretty-gd -w` is running.
You can add `-d/--dir` to also check existing files, like this: `pretty-gd -d -w`

To disable the annoying "Files have been modified outside Godot" dialog box, go to the following setting and enable it:

`Editor -> Editor Settings -> Text Editor -> Behavior -> Auto Reload Scripts on External Change`

Note that when `pretty-gd` modifies a file, the changes doesn't show up in Godot editor right away. External changes are only detected when the Godot window changes focus.

### JavaScript API

  - `prettify(input: string, startInsideString: string = null): string`
    - `input: string` // The string of GDScript to make pretty.
    - `startInsideString: string` // If set to a string delimiter, assume `input` is starting inside a string. Default is `null`.
  - `isInsideString: string` // If last operation ended inside a string, this will be set to the type of quotes(string delimiter) of the string. Otherwise `null`.
  - `indent: string` // Indentation string. Default is `null` for auto-detect.
  - `tabSize: number` // Tab size. This will be overwritten if `indent` is set or detected to be space-based. Default is `4`.

To parse a document line by line, remember to feed `isInsideString` back into the `prettify()` call as the second parameter.

Keep in mind that `indent` and `tabSize` will be preserved between calls to `prettify()`.
If you want to auto-detect for each call, remember to reset these properties to `null`.

#### Example

```js
import fs from "node:fs"
import pretty from "pretty-gd-js"

// configure indentation
pretty.indent = "\t"
pretty.tabSize = 4

let file = "my_script.gd"
let input = fs.readFileSync(file)
let output = pretty.prettify(input) // <- This is the main function
fs.writeFileSync(file, output + "\n")
```

## Known Issues

 - The Godot editor only checks for file changes when the window changes from unfocused to focused. So if you're running `pretty-gd -w` in the background, and it prettifies a script you just saved, you won't see the prettified script until you tab out and back into the editor.
 - It seems Godot editor only checks the file timestamp down to the second (at least on some systems), meaning if Godot editor saves a file that then gets changed and resaved externally within the same second, Godot editor doesn't detect it as a change. Hence why `pretty-gd -w` will wait one second before resaving the file.

If you come across any other issues with using this software, please [let me know](https://github.com/poeticAndroid/pretty-gd-js/issues).

## Release Notes

### 1.18.1

 - Another bugfix of handling of multiline strings. 🤞

### 1.18.0

 - Making sure that lines ending with a `:` is followed by a properly indented line.
 - Positive numbers/values can now be signed with a `+`.
 - Command line tool renamed to `pretty-gd`. (`pretty.gd` still included as an alias.)

### 1.17.0

 - `-a/--auto` option to auto-detect type of indentation on each file, instead of auto-detecting only on the first encountered file and applying it to all files, if neither `-s`, `-t` or `-a` is set.
 - `pretty.gd -w` will now prettify a file immediately after detecting a change (which can still take up to a second). Instead of delaying the file write to trigger Godot editor's change detection, `pretty.gd` will write the file straight away and then update it's modification timestamp a second later.
 - More strict parsing of number literals.
 - A `0` gets added to number literals that start or end with a decimal point or `e`(exponent marker).
 - Redundant leading zeroes gets removed from number literals.
 - Negative numbers that come after closing brackets`)}]`, strings, names or other numbers are treated as a subtraction of a unsigned number, thus separating the `-` and the number.
 - Bugfixed handling of multiline strings, so a string delimiter(`'`, `"`, `'''` or `"""`) can now stand alone on a line and the parser will recognize it as _either_ the beginning _or_ end of a string (and not both).

### 1.16.0

 - `match`, `tool`, `onready`, `export`, `setget`, `remote`, `master`, `puppet`, `remotesync`, `mastersync` and `puppetsync` are no longer treated as keywords that has to be surrounded by whitespace.

### 1.15.0

 - In `--watch` mode, file changes will be delayed by one second to ensure Godot editor will detect it as an external change.
 - Added `--stdio` mode for piping data in and out.

### 1.14.2

 - Display version with `--version`.
 - Refactored to use ES modules instead of `require`.
 - Test tool that [runs in the browser](https://github.com/poeticAndroid/pretty-gd-js/blob/main/test/test.html).
 - Fixed bug parsing multi-line strings.

### 1.14.1

 - If `--dir` or `--watch` are used without specifying a `path`, it will default to current directory.
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

 - Recognize operators longer than one character
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
