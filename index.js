const tokenize = require("./tokenizer")

let m = {
  prettify,
  isInsideString: false,
  eol: null,
  indent: null,
  tabSize: 4,
}

function prettify(input, startInsideString = false) {
  if (!m.eol) {
    if (input.includes("\r")) m.eol = "\r\n"
    else if (input.includes("\n")) m.eol = "\n"
    else m.eol = ""
  }
  m.isInsideString = startInsideString
  input = input.replaceAll("\r", "")
  let lines = input.split("\n")
  let output = ""
  let indentLvl = 0
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum]
    if (m.isInsideString) {
      output += line + m.eol
      if (line.includes("\"\"\"")) m.isInsideString = false
      continue
    }
    let tokens = tokenize(line)
    if (!m.indent) m.indent = tokens[0]
    if (m.indent.includes("\t")) m.indent = "\t"
    if (m.indent) m.tabSize = spaceSize(m.indent)
    if (m.tabSize) indentLvl = Math.ceil(spaceSize(tokens[0]) / m.tabSize)
    let thisIndent = ""
    for (let i = 0; i < indentLvl; i++) {
      thisIndent += m.indent
    }
    tokens.shift()
    let newLine = (thisIndent + tokens.join("")).trimEnd()
    output += newLine + m.eol
    let lastToken = tokens.pop()
    if (lastToken && lastToken.slice(0, 3) === "\"\"\"" && !lastToken.includes("\"\"\"", 3)) m.isInsideString = true
  }
  return output.trimEnd()
}

function spaceSize(whitespace) {
  if (!whitespace) return 0
  let sum = 0
  for (let char of whitespace) {
    switch (char) {
      case "\r":
      case "\n":
        sum = 0
        break

      case "\t":
        do { sum++ } while (sum % (m.tabSize || 4))
        break

      default:
        sum++
    }
  }
  return sum
}


module.exports = m