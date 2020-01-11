const robots = {
    terms: require('./robots/terms.js'),
    cse: require('./robots/cse.js'),
    watson: require('./robots/watson.js'),
    color: require('./robots/color.js'),
    twitter: require('./robots/twitter.js'),
    state: require('./robots/state.js')
}

async function start() {
    await robots.terms()
    await robots.cse()
    await robots.color()
    await robots.watson()
    await robots.twitter()

    const search = robots.state.load()
}

start ()
