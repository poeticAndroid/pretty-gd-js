#!/usr/bin/env node

const fs = require("node:fs"),
  pretty = require("./index"), commander = require("commander")

const program = new commander.Command("pretty-gd-js")
program
  .option("-s, --spaces <size>", "space-based indentation")
  .option("-t, --tabs", "tab-based indentation")
  .arguments("<files...>")
  .parse()


function init() {
  let opts = program.opts()
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
    let input = fs.readFileSync(file)
    let output = pretty.prettify(input)
    output += pretty.eol || "\n"
    fs.writeFileSync(file, output)
  }
}

init()

