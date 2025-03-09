const tokenize = require("./tokenizer")

const prettifier = {
  isInsideString: false,
  inputIndent: null,
  outputIndent: "\t",
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
      if (!prettifier.inputIndent) prettifier.inputIndent = tokens[0]
      if (!prettifier.outputIndent) prettifier.outputIndent = tokens[0]
      if (prettifier.inputIndent) indentLvl = tokens[0].length / prettifier.inputIndent.length
      let thisIndent = ""
      for (let i = 0; i < indentLvl; i++) {
        thisIndent += prettifier.outputIndent
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