const fs = require('fs')
const stateFilePath = './state.json'

function save(search) {
    const searchString = JSON.stringify(search)
    return fs.writeFileSync(stateFilePath, searchString)
}

function load() {
    const buffer = fs.readFileSync(stateFilePath, 'utf-8')
    const searchJson = JSON.parse(buffer)
    return searchJson
}

module.exports = {
    save,
    load
}
