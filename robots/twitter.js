const Twit = require('twit'),
      state = require('./state.js'),
      fs = require('fs'),
      path = require('path')
const twitterCredentials = require('../credentials/twitter.json')

let T = new Twit(twitterCredentials)

async function robot() {
    const search = state.load()

    let b64content = fs.readFileSync(path.join(__dirname, '../content/images/' + search.post), { encoding: 'base64' })

    console.log('[+] Uploading the image: ' + search.post)

    T.post('media/upload', { media_data: b64content })
    .then (async function (data) {
        console.log('[=] Uploaded image to Twitter')

        T.post('statuses/update', { media_ids: new Array(data.data.media_id_string) })
        .then (async function (tdata) {
            console.log('[=] Twitted image: ' + search.post + ' with id ' + tdata.data.id_str + ' on ' + tdata.data.user.screen_name)

        }) .catch(terr => {
            console.log('[!] Error (' + terr.message + '): tweeting image ' + search.post)
        })

    }) .catch (err => {
        console.log('[!] Error (' + err.message + '): uploading image ' + search.post)
    })
}

module.exports = robot
