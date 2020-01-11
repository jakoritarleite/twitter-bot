const fs = require('fs'),
      path = require('path')
const state = require('./state.js')
const visualRecognitionV3 = require('ibm-watson/visual-recognition/v3'),
    { IamAuthenticator } = require('ibm-watson/auth')

const watsonCredentials = require('../credentials/ibm-watson.json')

async function robot() {
    const search = state.load()
    search.score = []
    search.largest = 0
    search.post = ''

    const visualRecognition = new visualRecognitionV3({
        version: '2018-03-19',
        authenticator: new IamAuthenticator({ apikey: watsonCredentials.apikey }),
        url: watsonCredentials.url,
        headers: watsonCredentials.learn
    })

    for (i = 0; i < search.urls.length; i++) {
        await classifyImage(i)
    }

    async function classifyImage(index) {
        console.log('[+] Verifying the image content from ' + search.filenames[index])

        const targetClasses = require('../bot-files/target-classes.json')

        visualRecognition.classify({ url: search.urls[index] })
        .then(async function(response) {
            let score = 0
            let imageClasses = response.result.images[0].classifiers[0].classes.map((classes) => {
                return classes.class
            })

            let imageScores = response.result.images[0].classifiers[0].classes.map((classes) => {
                return classes.score
            })

            for (x = 0; x < imageClasses.length; x++) {
                if (targetClasses.includes(imageClasses[x])) {
                    if (imageScores[x] >= 0.6) {
                        score += imageScores[x] / 10
                    }
                }
            }
            search.score.push(score)
            search.largest = Math.max.apply(Math, search.score);

            for (x = 0; x < search.score.length; x++) {
                if (search.score[x] == search.largest) {
                    search.post = search.filenames[index]
                }
            }
            state.save(search)

        }) .catch(err => {
            console.log('[!] Error (' + err.message + '): classifying image ' + search.filenames[index])
        })
    }
}

module.exports = robot
