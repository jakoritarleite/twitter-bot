const state = require('./state.js')
const google = require('googleapis').google,
      imageDownloader = require('image-downloader')
const googleCustomSearchCredentials = require('../credentials/google-search.json')

async function robot() {
    const search = state.load()
    const customSearch = google.customsearch('v1')

    await fetchGoogleAndReturnImages(search.term)
    await downloadAllImagesReturned()

    state.save(search)

    async function fetchGoogleAndReturnImages(term) {
        const response = await customSearch.cse.list({
            auth:       googleCustomSearchCredentials.apiKey,
            cx:         googleCustomSearchCredentials.searchEngineId,
            q:          term,
            searchType: 'image',
            pages:      10
        })

        search.urls = response.data.items.map((item)=> { return item.link })
    }

    async function downloadAllImagesReturned() {
        search.filenames = []
        for (urlIndex = 0; urlIndex < search.urls.length; urlIndex++) {
            try {
                await downloadImage(search.urls[urlIndex], `${search.term}-${urlIndex}.jpg`)
                search.filenames[urlIndex] = `${search.term}-${urlIndex}.jpg`
                console.log('[!] Downloaded image ' + search.filenames[urlIndex])
            } catch (error) {
                console.log('[!] Error: downloading image ' + search.filenames[urlIndex])
                console.log(error)
            }
        }
    }

    async function downloadImage(url, filename) {
         return imageDownloader.image({
             url, url,
             dest: `./content/images/${filename}`
         })
    }

    async function getFilename(url, index) {
        var isSlash = false
		var isExtension = false
		var fName = 0
		var iName = 0
		var filename = ''
		for (i = url.length; i > 0; i--) {
			if ((url[i - 3] + url[i - 2] + url[i - 1] + url[i]) == '.jpg' && !isExtension) {
				fName = i
				isExtension = true
			}

			if (url[i] == '/' && !isSlash) {
				iName = i
				isSlash = true;
			}
		}

		for (i = iName + 1; i < fName + 1; i++) {
			filename += url[i]
		}
        return filename
    }
}

module.exports = robot
