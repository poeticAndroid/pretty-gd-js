const tokenize = require("./tokenizer")

const prettifier = {
  isInsideString: false,
  _indent: null,
  indent: "\t",
  eol: "",
  prettify(input, startInsideString = false) {
    if (!prettifier.eol) {
      if (input.includes("\r")) prettifier.eol = "\r\n"
      else if (input.includes("\n")) prettifier.eol = "\n"
    }
    prettifier.isInsideString = startInsideString
    input = input.replaceAll("\r", "")
    let lines = input.split("\n")
    let output = ""
    let indentLvl = 0
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      let line = lines[lineNum]
      if (prettifier.isInsideString) {
        output += line + prettifier.eol
        if (line.includes("\"\"\"")) prettifier.isInsideString = false
        continue
      }
      let tokens = tokenize(line)
      if (!prettifier._indent) prettifier._indent = tokens[0]
      if (!prettifier.indent) prettifier.indent = tokens[0]
      if (prettifier._indent) indentLvl = tokens[0].length / prettifier._indent.length
      let thisIndent = ""
      for (let i = 0; i < indentLvl; i++) {
        thisIndent += prettifier.indent
      }
      tokens.shift()
      let newLine = (thisIndent + tokens.join("")).trimEnd()
      output += newLine + prettifier.eol
      let lastToken = tokens.pop()
      if (lastToken && lastToken.slice(0, 3) === "\"\"\"" && !lastToken.includes("\"\"\"", 3)) prettifier.isInsideString = true
    }
    return output.trimEnd()
  }
}


module.exports = prettifier