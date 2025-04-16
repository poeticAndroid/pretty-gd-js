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
  let lastLineWasBlank = true
  let indentLvl = 0
  let indentLvlMin = 0
  let indentLvlMax = 1
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum]
    if (m.isInsideString) line = m.isInsideString + line
    let tokens = tokenize(line)
    if (m.isInsideString) {
      tokens[1] = tokens[1]?.trim().slice(m.isInsideString.length)
      if (tokens[1]?.slice(-m.isInsideString.length) !== m.isInsideString) {
        output += tokens.join("") + "\n"
        continue
      } else {
        output += tokens[1]
        tokens[1] = ""
        m.isInsideString = null
      }
    }

    let thisIndent = ""
    if (tokens.length > 1) {
      if (!m.indent) m.indent = tokens[0]
      if (m.indent.includes("\t")) m.indent = "\t"
      if (m.indent) m.tabSize = spaceSize(m.indent)
      if (m.tabSize) indentLvl = Math.min(Math.max(indentLvlMin, Math.ceil(spaceSize(tokens[0]) / m.tabSize)), indentLvlMax)
      for (let i = 0; i < indentLvl; i++) {
        thisIndent += m.indent
      }
    }
    indentLvlMin = 0
    indentLvlMax = indentLvl + 2


    tokens.shift()
    let newLine = (thisIndent + tokens.join("")).trimEnd()
    if (tokens.length || !lastLineWasBlank) output += newLine + "\n"
    let i = output.lastIndexOf("\n\n")
    if (i > 0 && ["class", "func"].includes(tokens[0]?.trim())) output = output.slice(0, i + 1) + output.slice(i)
    lastLineWasBlank = !tokens.length

    let lastToken = tokens.pop()?.trim()
    while (lastToken?.slice(0, 1) === "#") lastToken = tokens.pop()?.trim()
    let quot = isString(lastToken)
    if (quot && lastToken.slice(quot.length).slice(-quot.length) !== quot) {
      m.isInsideString = quot
    } else {
      if (lastToken === ":") indentLvlMin = indentLvlMax = indentLvl + 1
    }
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
