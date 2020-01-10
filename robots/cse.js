const google = require('googleapis').google
const googleCustomSearchCredentials = require('../credentials/google-search.json')

async function robot(search) {
    const customSearch = google.customsearch('v1')

    await fetchGoogleAndReturnImages(search.term)
    await downloadAllImagesReturned(search.urls)

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
        
    }

}

module.exports = robot
