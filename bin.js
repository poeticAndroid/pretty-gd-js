#!/usr/bin/env node

import fs from "node:fs"
import pretty from "./index.js"
import { Command } from "commander"
import pck from "./package.json" with {type: "json"}

const program = new Command(binName())
program
  .option("-s, --spaces <size>", "enforce (or, if -t is also set, convert from) space-based indentation")
  .option("-t, --tabs", "enforce tab-based indentation")
  .option("-a, --auto", "auto-detect indentation on each file separately")
  .option("-p, --stdio", "read from stdin and write it prettified to stdout")
  .option("-d, --dir", "prettify all *.gd files in [path]")
  .option("-w, --watch", "automatically prettify any modified *.gd files in [path]")
  .option("-v, --version", "display version")
  .arguments("[path] [files...]")
  .parse()

function init() {
  let opts = program.opts()
  let path
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
  if (opts.auto) {
    autoDetect = true
  }

  if (opts.stdio) {
    let input = ""
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
    return
  }

  if (opts.dir) {
    if (!path) path = program.args.shift() || "."
    path = stripTrailingSlash(path) + "/"
    prettifyFolder(path, true)
  }
  if (opts.watch) {
    if (!path) path = program.args.shift() || "."
    path = stripTrailingSlash(path) + "/"
    console.log("Watching", path, "for changes...")
    setInterval(e => prettifyFolder(path), 1024)
  }

  if (opts.version) console.log("Package version:", pck.name, pck.version)

  if (!path && !program.args.length) console.log(`\nRun '${binName()} --help' for help.`)
  else for (let filename of program.args) {
    filename = stripTrailingSlash(filename)
    let stat = fs.statSync(filename)
    if (stat.isDirectory()) prettifyFolder(filename, true)
    else prettifyFile(filename)
  }
}

let newestTime = 0
let autoDetect
let indent

function prettifyFile(filename, newerThan = 0) {
  // debugCall("prettifyFile", ...arguments)
  let stat = fs.statSync(filename)
  if (stat.mtimeMs <= newerThan) return
  if (autoDetect) pretty.indent = null
  let input = ("" + fs.readFileSync(filename)).replaceAll("\r", "")
  let output = pretty.prettify(input) + "\n"
  if (indent != getIndentSettings()) {
    indent = getIndentSettings()
    console.log("Indentation set to", indent)
  }
  if (input != output) {
    // if (newerThan > true && input.slice(-1) == "\n") output = output.trim()

    let tmp = Math.random() + "pretty.tmp"
    try {
      fs.writeFileSync(filename + tmp, output)
      fs.renameSync(filename + tmp, filename)
    } catch (error) {
      console.log(stat?.mtime.toLocaleString(), "Error writing to", filename, "!!!")
      fs.unlink(filename + tmp, console.log)
      return null
    }

    // if (input.trim() != output.trim()) 
    console.log(stat?.mtime.toLocaleString(), filename, "pretty!")

    stat = statSafe(filename)
    if (newerThan > true) setTimeout(e => {
      if (!stat) return
      stat.mtime.setSeconds(stat.mtime.getSeconds() + 1)
      fs.utimesSync(filename, stat.mtime, stat.mtime)
    }, 1024)
  } // else console.log(stat?.mtime.toLocaleString(), filename, "already pretty..")
  newestTime = Math.max(newestTime, stat.mtimeMs)
  return true
}

function prettifyFolder(pathname, newerThan = newestTime) {
  // debugCall("prettifyFolder", ...arguments)
  pathname = stripTrailingSlash(pathname) + "/"
  let files = readdirSafe(pathname)
  for (let filename of files) {
    if (filename.slice(0, 1) == ".") continue
    if (filename.slice(-4).toLowerCase() == ".tmp") continue
    filename = pathname + filename
    let stat = statSafe(filename)
    if (stat?.isDirectory()) prettifyFolder(filename, newerThan)
    else if (stat?.isFile() && filename.slice(-3).toLowerCase() == ".gd") {
      if (newerThan) prettifyFile(filename, newerThan)
      else newestTime = Math.max(newestTime, stat?.mtimeMs || 0)
    }
  }
}

function readdirSafe(path) {
  // debugCall("readdirSafe", ...arguments)
  try {
    return fs.readdirSync(path)
  } catch (error) {
    return []
  }
}

function statSafe(path) {
  // debugCall("statSafe", ...arguments)
  try {
    return fs.statSync(path)
  } catch (error) {
    return null
  }
}

function stripTrailingSlash(path) {
  let l
  while (l != path.length) {
    l = path.length
    while (path.slice(-1) == "\\") path = path.slice(0, -1)
    while (path.slice(-1) == "/") path = path.slice(0, -1)
  }
  return path
}

function debugCall(funcName, ...args) {
  console.log(funcName + "(", JSON.stringify(args).slice(1, -1), ")")
}

function binName() {
  let script = process.argv[1].split(/[\/\\]/).pop().replace(".js", "")
  for (let key in pck.bin) {
    if (script == pck.bin[key].split(/[\/\\]/).pop().replace(".js", "")) return key
  }
}

function getIndentSettings() {
  if (!pretty.indent) return `auto-detect`
  if (pretty.indent == "\t") return `tabs(${pretty.tabSize})`
  if (pretty.indent.charAt(0) == " ") return `spaces(${pretty.tabSize})`
  return `unknown`
}

init()

