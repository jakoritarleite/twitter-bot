async function robot(search) {
    await readAndReturnSearchTerm()

    async function readAndReturnSearchTerm() {
        const terms = require('../bot-files/search-terms.json')
        search.term = terms.target[0]

        console.log('[+] Searching for term: ' + search.term)
    }
}

module.exports = robot
