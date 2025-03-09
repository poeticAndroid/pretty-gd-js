#!/usr/bin/env node

const fs = require("node:fs"),
  readline = require("node:readline"),
  pretty = require("./index")

function init() {
  let fileIn = process.argv[2]
  let input = ""
  if (fileIn) {
    input = "" + fs.readFileSync(fileIn)
    process.stdout.write(pretty.prettify(input))
    process.stdout.write(pretty.eol || "\n")
  } else {
    process.stdin.on("readable", e => {
      let chunk = ""
      do {
        input += chunk
      } while (chunk = process.stdin.read())
    })
    process.stdin.on("end", e => {
      process.stdout.write(pretty.prettify(input))
      process.stdout.write(pretty.eol || "\n")
    })
  }
}

init()

