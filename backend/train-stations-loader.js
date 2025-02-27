const data = require('./train-stations.json')

const capitalize = (str, lower = false) => {
  return (lower ? str.toLowerCase() : str).replace(
    /(?:^|\s|["'([{])+\S/g,
    (match) => match.toUpperCase()
  )
}

const a = new Map()
for (const trainStation of data) {
  if (
    trainStation.destination_iata != null && trainStation.destination != null &&
    trainStation.destination != 'TBD'
  )
    a.set(
      trainStation.destination_iata,
      capitalize(trainStation.destination, true)
    )
  if (trainStation.origine_iata != null && trainStation.origine != null && trainStation.origine != 'TBD')
    a.set(trainStation.origine_iata, capitalize(trainStation.origine, true))
}

let headers = ['id', 'iata', 'name'].join(',')

let writeStream = headers

let index = 0
for (let [key, value] of a) {
  writeStream += `\n${index++},${key},${value}`
}

let fs = require('fs')
fs.writeFileSync('train-stations.csv', writeStream)
console.log('Done writing to train-stations.csv')
