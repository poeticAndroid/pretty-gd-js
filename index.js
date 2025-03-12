import tokenize from "./tokenizer.js"

const m = {
  prettify,
  isInsideString: false,
  indent: null,
  tabSize: 4,
}

function prettify(input, startInsideString = null) {
  m.isInsideString = startInsideString
  input = ("" + input).replaceAll("\r", "")
  let lines = input.split("\n")
  let output = ""
  let indentLvl = 0
  let lastLineWasBlank = true
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum]
    if (m.isInsideString) line = m.isInsideString + line
    let tokens = tokenize(line)
    if (m.isInsideString) {
      tokens[1] = tokens[1]?.replace(m.isInsideString, "")
      if (tokens[1]?.slice(-m.isInsideString) !== m.isInsideString) {
        output += tokens.join("") + "\n"
        continue
      } else m.isInsideString == null
    }

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
    if (tokens.length || !lastLineWasBlank) output += newLine + "\n"
    let i = output.lastIndexOf("\n\n")
    if (i > 0 && ["class", "func"].includes(tokens[0]?.trim())) output = output.slice(0, i + 1) + output.slice(i)
    lastLineWasBlank = !tokens.length

    let lastToken = tokens.pop()
    let quot = isString(lastToken)
    if (quot && lastToken.replace(quot, "").slice(-quot.length) !== quot) m.isInsideString = quot
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

function isString(token) {
  if (!token) return null
  if (token.charAt(0).match(/[r\&\$\%\^]/)) token = token.slice(1)
  let quot = token.slice(0, 3)
  if (quot === '"""') return quot
  if (quot === "'''") return quot
  quot = token.slice(0, 1)
  if (quot.match(/[\"\']/)) return quot
  return null
}


export default m
