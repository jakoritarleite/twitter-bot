function start() {
    const search = {}

    search.term = readAndReturnSearchTerm()

    function readAndReturnSearchTerm() {
        const terms = require('./bot-files/search-terms.json')
        return terms.target[0]
    }

    console.log(search)
}

start ()
