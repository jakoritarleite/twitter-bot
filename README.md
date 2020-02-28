# [Twitter Bot](https://twitter.com/hardillect) [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&logo=twitter)](https://twitter.com/koritarsa)

![version](https://img.shields.io/badge/version-2.0.1-blue.svg?style=flat)
![licence](https://img.shields.io/badge/licence-MIT-blue.svg?style=flat)
![issues](https://img.shields.io/badge/open%20issues-1-green?style=flat)
![issues closed](https://img.shields.io/badge/closed%20issues-4-green.svg?style=flat)
![build](https://img.shields.io/badge/build-passing-orange.svg?style=flat)

It is an automated bot that searchs images (you specify which is the content) on the Google using cse (Custom Search Engine), download them and classify using the color return by a pixel array (return a pallete with the predominant colors), and send as colors classifieds images to Watson (IBM's AI) to get what is in the image, and then according to a *.json* file it identify if is what you want and return the best image to be posted on the Twitter account.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to use the software and how to install them

Packages:

```
node.js^13.5.0
npm^6.13.6
npm@get-image-colors^2.0.0,
   @googleapis^46.0.0,
   @ibm-watson^5.2.1,
   @algorithmia^0.3.10,
   @path^0.12.7,
   @twit^2.2.11
```
To install them:

```
npm i <package name>
```

### Running

To run the bot you will need to create account _Google_, _IBM_ and _Twitter_, to have access on Google Custom Search API's, Watson Visual Recognition API's and Twitter API's.

Fill the files on `./credentials/*.json` with the api keys from Twitter, Google and IBM.


```
{
  "consumer_key":         "12ADS21678XkjA089",
  "consumer_secret":      "23kK13675LKJ4552L",
  "access_token":         "4J1KNN6LMKL412KL42L",
  "access_token_secret":  "214K5KMFMKL46NLHAP9"
}
```

And to run the bot

```
npm start
```



## Running the tests

To test the bot you will just need to run the follow command

* This test every function.

```
npm test
```

### Single tests

```
npm test cse
npm test watson
npm test twitter
```

What these test do ?

* This test the Google Custom Search Engine, and return you photos links.

```
npm test cse
```

* This test the Watson Visual Recognition and return you the detected things.

```
npm test watson
```

* This test the Twitter API and verify if the uploading and tweeting is working.

```
npm test twitter
```

## Deployment

To deploy it on live system is very simple, you just need to do what you've done to run in your local machine. But one thing that you'll need is an server with storage service.

## Built With

* [Node.js](https://nodejs.org/en/) - The JavaScript runtime
* [npm](https://www.npmjs.com/) - The package manager
* [Sublime Text](https://www.sublimetext.com/) - Used to code
* [Google Custom Search](https://cse.google.com/) - To search images on the internet
* [IBM - Watson](https://cloud.ibm.com/developer/watson/dashboard) - To recognize the objects on the image
* [Twitter API](https://developer.twitter.com/en/docs/api-reference-index) - To send and post the image on account

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/jakoritarleite/twitter-bot/tags).

## Authors

* **João Koritar** - *Every Work* - [Twitter](https://twitter.com/koritarsa)

See also the list of [contributors](https://github.com/jakoritarleite/twitter-bot/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* If you want to give me a hat tip, email me at [jakoritarleite@gmail.com]()
* My main inspiration to do that was [Archillect](https://archillect.com)
* [Filipe Deschamps] (https://www.youtube.com/channel/UCU5JicSrEM5A63jkJ2QvGYw) that I've looked the video-maker code to make mine better
