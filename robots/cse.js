const state = require('./state.js')
const google = require('googleapis').google
const googleCustomSearchCredentials = require('../credentials/google-search.json')

async function robot() {
    const search = state.load()
    const customSearch = google.customsearch('v1')

    await fetchGoogleAndReturnImages(search.term)
    await downloadAllImagesReturned(search.urls)

    state.save(search)

    async function fetchGoogleAndReturnImages(term) {
        const response = await customSearch.cse.list({
            auth:       googleCustomSearchCredentials.apiKey,
            cx:         googleCustomSearchCredentials.searchEngineId,
            q:          term,
            searchType: 'image',
            pages:      10
        })

        const imageUrls = response.data.items.map((item)=> { return item.link })

        search.urls = imageUrls
    }

    async function downloadAllImagesReturned(links) {
        return 'NULL'
    }

}

module.exports = robot
