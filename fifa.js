const calculateResult = require('./src/funtions/services')
const { tablePositions } = require('./src/utils/positionTableUtil')

const getTablePositions = (matchs, rules) => {
  const table = tablePositions(matchs)
  console.log('🚀 ~ file: fifa.js:6 ~ getTablePositions ~ table:', table)

  matchs.forEach((match) => {
    const result = calculateResult(match, rules)
    console.log('🚀 ~ file: fifa.js:10 ~ matchs.forEach ~ result:', result)

    const teams = Object.keys(result)

    teams.forEach(team => {
      const { points, pointsBonus, matchPlayed, goalsFor } = result[team]
      console.log('🚀 ~ file: fifa.js:16 ~ matchs.forEach ~ matchPlayed:', matchPlayed)

      const teamInTable = table.find(currentTeam => currentTeam.team === team)

      teamInTable.points += points
      teamInTable.pointsBonus += pointsBonus
      teamInTable.matchPlayed += matchPlayed
      teamInTable.goalsFor += goalsFor
    })
  })

  return table.sort((a, b) => b.points - a.points)
}

module.exports = getTablePositions
