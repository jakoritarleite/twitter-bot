const state = require('./state.js')

async function robot() {
    const search = {}
    await readAndReturnSearchTerm()

    async function readAndReturnSearchTerm() {
        const terms = require('../bot-files/search-terms.json')
        search.term = terms.target[0]

        state.save(search)
        console.log('[+] Searching for term: ' + search.term)
    }
}

module.exports = robot
