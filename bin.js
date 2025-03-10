#!/usr/bin/env node

const fs = require("node:fs"),
  pretty = require("./index")

function init() {
  let input = "", output = ""
  for (file of process.argv) {
    if (file.slice(-3) == ".gd") {
      input = "" + fs.readFileSync(file)
      output += pretty.prettify(input)
      output += pretty.eol || "\n"
      fs.writeFileSync(file, output)
    }
  }
}

init()

