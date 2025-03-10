#!/usr/bin/env node

const fs = require("node:fs"),
  pretty = require("./index"), commander = require("commander")

const program = new commander.Command("prettify-gdscript")
program
  .option("--lf", "Unix-type line endings")
  .option("--crlf", "Dos-type line endings")
  .option("--spaces <size>", "Space-based indentation")
  .option("--tabs", "Tab-based indentation")
  .arguments("<files...>")
  .parse()


function init() {
  let input = "", output = ""
  let opts = program.opts()
  if (opts.lf) pretty.eol = "\n"
  if (opts.crlf) pretty.eol = "\r\n"
  if (opts.spaces) {
    pretty.indent = ""
    pretty.tabSize = opts.spaces == true ? 4 : opts.spaces
    for (let i = 0; i < pretty.tabSize; i++) {
      pretty.indent += " "
    }
  }
  if (opts.tabs) {
    pretty.indent = "\t"
  }
  for (file of program.args) {
    input = "" + fs.readFileSync(file)
    output = pretty.prettify(input)
    output += pretty.eol || "\n"
    fs.writeFileSync(file, output)
  }
}

init()

