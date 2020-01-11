const state = require('./state.js')
const path = require('path')
const algorithmia = require('algorithmia')
const algorithmiaCredentials = require('../credentials/algorithmia.json')

async function robot() {
    const search = state.load()

    for (i = 0; i < search.urls.length; i++) {
        await getImageColors(i)
    }

    async function getImageColors(index) {
        var input =  {
            "image":    search.urls[index],
            "zoom_h":   0,
            "zoom_w":   0
        }

        algorithmia.client(algorithmiaCredentials.apikey)
        .algo("coqnitics/colordetector/0.1.1?")
        .pipe(input)
        .then(async function(mresponse) {
            await analyzeColors(mresponse)
        })

        async function analyzeColors(response) {
            console.log('[+] Verifying the image: ' + search.filenames[index])
            const colors = response.get()

            for (x = 0; x < colors.length; x++) {
                if (colors[x].general_category == 'White' && colors[x].ratio >= 0.18 || colors[x].color_name == "light_grey" && colors[x].ratio >= 0.17) {
                    console.log('[=] Removing the image: ' + search.filenames[index])
                    search.filenames.splice(index, 1)
                    search.urls.splice(index, 1)
                }
                /*else if (colors[x].color_name == "light_grey" && colors[x].ratio >= 0.17) {
                    console.log('[=] Removing the image: ' + search.filenames[index])
                    search.filenames.splice(index, 1)
                    search.urls.splice(index, 1)
                }*/
            }
            state.save(search)
        }
    }
}

module.exports = robot
