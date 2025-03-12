#!/usr/bin/env node

const fs = require("node:fs"),
  pretty = require("./index"),
  commander = require("commander"),
  pck = require("./package.json")

const program = new commander.Command(myName())
program
  .option("-s, --spaces <size>", "enforce (or, if -t is also set, convert from) space-based indentation")
  .option("-t, --tabs", "enforce tab-based indentation")
  .option("-d, --dir", "prettify all *.gd files in [path]")
  .option("-w, --watch", "automatically prettify any modified *.gd files in [path]")
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

  if (opts.dir) {
    if (!path) path = program.args.shift() || "."
    path = stripTrailingSlash(path) + "/"
    prettifyFolder(path, true)
  }
  if (opts.watch) {
    if (!path) path = program.args.shift() || "."
    path = stripTrailingSlash(path) + "/"
    console.log("Watching", path, "for changes...")
    setInterval(e => prettifyFolder(path), 2048)
  }

  if (!path && !program.args.length) console.log(`Run '${myName()} --help' for help.`)
  else for (let filename of program.args) {
    filename = stripTrailingSlash(filename)
    let stat = fs.statSync(filename)
    if (stat.isDirectory()) prettifyFolder(filename, true)
    else prettifyFile(filename)
  }
}

let newestTime = 0

function prettifyFile(filename, newerThan = 0) {
  // debugCall("prettifyFile", ...arguments)
  let stat = fs.statSync(filename)
  if (stat.mtimeMs <= newerThan) return
  newestTime = Math.max(newestTime, stat.mtimeMs)
  let input = ("" + fs.readFileSync(filename)).replaceAll("\r", "")
  let output = pretty.prettify(input) + "\n"
  if (input != output) {
    let rnd = "" + Math.random()
    fs.writeFileSync(filename + rnd + ".tmp", output)
    fs.renameSync(filename + rnd + ".tmp", filename)
    console.log(stat.mtime.toLocaleString(), filename, "changed!")
  }
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
      if (newerThan == true) prettifyFile(filename)
      else if (newerThan) setTimeout(e => prettifyFile(filename, newerThan), 1024)
      else newestTime = Math.max(newestTime, stat?.mtimeMs || 0)
    }
  }
}

function readdirSafe(path) {
  // debugCall("readdirSafe", ...arguments)
  try {
    return fs.readdirSync(path)
  } catch (error) {
    console.log("fuck", error)
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

function myName() {
  let script = process.argv[1].split(/[\/\\]/).pop().replace(".js", "")
  for (let key in pck.bin) {
    if (script == pck.bin[key].split(/[\/\\]/).pop().replace(".js", "")) return key
  }
}

init()

