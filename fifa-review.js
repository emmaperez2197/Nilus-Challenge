const fs = require('fs')
const getTablePositions = require('./fifa')

function getParams () {
  const args = process.argv.slice(2)

  const matchFiles = []
  let rulesFile = null
  const matchs = []
  let rules = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--match' && i + 1 < args.length) {
      matchFiles.push(args[i + 1])
      i++
    } else if (args[i] === '--rules' && i + 1 < args.length) {
      rulesFile = args[i + 1]
      i++
    }
  }

  if (rulesFile) {
    try {
      const rulesData = fs.readFileSync(rulesFile)
      const rulesJson = JSON.parse(rulesData)
      rules = rulesJson
    } catch (error) {
      console.error('Error al leer el archivo de reglas:', error.message)
      return
    }
  } else {
    console.error('No se proporcionó el archivo de reglas (--rules).')
    return
  }

  if (matchFiles.length > 0) {
    matchFiles.forEach((file) => {
      try {
        const matchData = fs.readFileSync(file)
        const matchJson = JSON.parse(matchData)
        matchs.push(matchJson)
      } catch (error) {
        console.error('Error al leer el archivo de partido:', file, error.message)
      }
    })
  } else {
    console.error('No se proporcionaron archivos de partido (--match).')
  }

  return { matchs, rules }
}

const { matchs, rules } = getParams()

console.log(getTablePositions(matchs, rules))
