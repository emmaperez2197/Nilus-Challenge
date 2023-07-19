const cuantityGoals = (event, rules) => {
  if (event.event === 'score' && (!event.obs || event.obs === 'pk')) return 1

  const goalkeeperRule = rules.find((rule) => rule?.condition?.player === 'goalkeeper')
  if (!goalkeeperRule) return 0

  if (event.event === 'score' && event.obs === goalkeeperRule.condition.player) {
    return +goalkeeperRule.value_factor.match(/\d+/)[0]
  }

  return 0
}

const getPointsToWinner = (rules) => {
  const ruleWin = rules.find((rule) => rule.event === 'win')

  if (ruleWin) return ruleWin.points

  return 3
}

const calculateBonusPointByQuantityGoals = (goals, rules) => {
  const bonusByQuantityGoals = rules.find((rule) => rule?.condition?.at_least)

  if (!bonusByQuantityGoals) return 0

  return goals >= bonusByQuantityGoals?.condition?.at_least ? 1 : 0
}

const getPointsToHomeAndAway = (homeGoals, awayGoals, rules) => {
  const pointsToWinner = getPointsToWinner(rules)

  if (homeGoals > awayGoals) {
    return {
      home: pointsToWinner, away: 0
    }
  }

  if (homeGoals < awayGoals) {
    return {
      home: 0, away: pointsToWinner
    }
  }

  return { home: 1, away: 1 }
}

const calculateResult = (match, rules) => {
  const homeGoals = match.home_events.reduce((acc, currentEvent) => {
    acc += cuantityGoals(currentEvent, rules)
    return acc
  }, 0)
  console.log('🚀 ~ file: services.js:53 ~ homeGoals ~ homeGoals:', homeGoals)

  const awayGoals = match.away_events.reduce((acc, currentEvent) => {
    acc += cuantityGoals(currentEvent, rules)
    return acc
  }, 0)

  const bonusPointsOfHomeTeam = calculateBonusPointByQuantityGoals(homeGoals, rules)
  const bonusPointsOfAwayTeam = calculateBonusPointByQuantityGoals(awayGoals, rules)
  const pointsToHomeAndAway = getPointsToHomeAndAway(homeGoals, awayGoals, rules)

  return {
    [match.teams.home]: {
      points: pointsToHomeAndAway.home + bonusPointsOfHomeTeam,
      pointsBonus: bonusPointsOfHomeTeam,
      matchPlayed: 1,
      goalsFor: homeGoals
    },
    [match.teams.away]: {
      points: pointsToHomeAndAway.away + bonusPointsOfAwayTeam,
      pointsBonus: bonusPointsOfAwayTeam,
      matchPlayed: 1,
      goalsFor: awayGoals
    }
  }
}

module.exports = calculateResult
