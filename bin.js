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
    let to = setInterval(e => {
      if (input || process.stdin.readable) {
        input += process.stdin.read() || ""
        if (process.stdin.readableEnded) input = input.trimEnd() + (pretty.eol || "\n")
        if (input.includes("\n")) {
          let line = input.slice(0, input.indexOf("\n") + 1)
          input = input.slice(line.length)
          process.stdout.write(pretty.prettify(line, pretty.isInsideString))
          process.stdout.write(pretty.eol || "\n")
        }
      } else clearInterval(to)
    })
  }
}

init()

