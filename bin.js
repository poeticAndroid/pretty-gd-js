#!/usr/bin/env node

const fs = require("node:fs"),
  pretty = require("./index"),
  commander = require("commander")

const program = new commander.Command("pretty-gd-js")
program
  .option("-s, --spaces <size>", "space-based indentation")
  .option("-t, --tabs", "tab-based indentation")
  .option("-d, --dir", "prettify all *.gd files in a directory")
  .option("-w, --watch", "automatically prettify any modified *.gd files")
  .arguments("[path] [files...]")
  .parse()


function init() {
  let opts = program.opts()
  let dir
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
    if (!dir) dir = program.args.shift()
    while (dir.slice(-1) == "\\") dir = dir.slice(0, -1)
    prettifyFolder(dir, true)
  }
  if (opts.watch) {
    if (!dir) dir = program.args.shift()
    while (dir.slice(-1) == "\\") dir = dir.slice(0, -1)
    console.log("Watching", dir, "...")
    setInterval(e => prettifyFolder(dir), 2048)
  }

  for (let filename of program.args) {
    while (filename.slice(-1) == "\\") filename = filename.slice(0, -1)
    let stat = fs.statSync(filename)
    if (stat.isDirectory()) prettifyFolder(filename, true)
    else prettifyFile(filename)
  }
}

let newestTime = 0

function prettifyFile(filename, newerThan = 0) {
  // console.log("prettifyFile(", filename, ",", newerThan, ")")
  let stat = fs.statSync(filename)
  if (stat.mtimeMs <= newerThan) return
  newestTime = Math.max(newestTime, stat.mtimeMs)
  let input = "" + fs.readFileSync(filename)
  let output = pretty.prettify(input) + "\n"
  if (input != output) {
    let rnd = "" + Math.random()
    fs.writeFileSync(filename + rnd + ".tmp", output)
    fs.renameSync(filename + rnd + ".tmp", filename)
    console.log(stat.mtime.toLocaleTimeString(), filename, "changed!")
  }
}

function prettifyFolder(pathname, newerThan = newestTime) {
  // console.log("prettifyFolder(", pathname, ",", newerThan, ")")
  if (pathname.slice(-1) != "/") pathname += "/"
  let files = fs.readdirSync(pathname)
  for (let filename of files) {
    if (filename.slice(0, 1) == ".") continue
    if (filename.slice(-4).toLowerCase() == ".tmp") continue
    filename = pathname + filename
    let stat = fs.statSync(filename)
    if (stat.isDirectory()) prettifyFolder(filename, newerThan)
    else if (stat.isFile() && filename.slice(-3).toLowerCase() == ".gd") {
      if (newerThan == true) prettifyFile(filename)
      else if (newerThan) setTimeout(e => prettifyFile(filename, newerThan), 1024)
      else newestTime = Math.max(newestTime, stat.mtimeMs)
    }
  }
}


init()

