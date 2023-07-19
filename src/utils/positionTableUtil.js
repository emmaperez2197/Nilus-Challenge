// armamos la tabla con los equipos y los puntos inician de 0
const tablePositions = (matchs) => {
  const teams = matchs.reduce((accum, { teams }) => {
    Object.values(teams).forEach(team => accum.add(team))

    return accum
  }, new Set())

  return [...teams].map(team => ({
    team,
    points: 0,
    pointsBonus: 0,
    matchPlayed: 0,
    goalsFor: 0
  }))
}

module.exports = {
  tablePositions
}
