var fs = require('fs'),
    path = require('path'),
    getColors = require('get-image-colors'),
    Twit = require('twit'),
    google = require('googleapis').google,
    imageDownloader = require('image-downloader'),
    visualRecognitionV3 = require('ibm-watson/visual-recognition/v3'),
    { IamAuthenticator } = require('ibm-watson/auth');

const googleSearchCredentials = require(path.join(__dirname, '/credentials/google-search.json'));
const config = require(path.join(__dirname, '/credentials/twitter.json'));

var T = new Twit(config);
const customSearch = google.customsearch('v1');
const ibmWatson = require(path.join(__dirname, '/credentials/ibm-watson.json'))

function embbedId(name, data, url) {
	var fdata = fs.readFileSync(path.join(__dirname, 'images.json')).toString().replace('		}\n	]\n}', '		},') + `	
		{
			"archive_name":		"${name}",
			"created_at":		"${data.created_at}",
			"id":				"${data.id}",
			"id_str":			"${data.id_str}",
			"url":				"${url}"
		}
	]
}`

	fs.writeFile('images.json', fdata, (err) => 
		{
			if (err) {
				console.log('[!] ERROR on trying to write at image.js.');
			} else {
				console.log('[=] Embbeded image data.');
			}
		}
	);
}

function tweet(message) {
	console.log('[+] Trying to Tweet ' + '"' + message + '"');

	T.post('statuses/update', { status: message }, (err, data, response)=> 
		{
 			if (err) {
 				console.log('[!] ERROR on trying to tweet.');
 				console.log(err);
 			}

 			if (response && !err) {
 				console.log('[=] Twitted ' + '"' + message + '"' + ' on ' + data.user.screen_name + ' with id ' + data.user.id_str + '.');
 			}
		}
	);
}

function retweet(_id) {
	console.log('[+] Retweeting ' + _id);
	T.post('statuses/retweet/:id', { id: _id }, (err, data, response)=>
		{
			if (err) {
				console.log('[!] ERROR on trying to retweet ' + _id + '.');
				console.log(err);
			}

			if (response && !err) {
				console.log('[=] Retweeted ' + data.id_str + ' on ' + data.user.screen_name + ' with id ' + data.user.id_str + '.')
			}
		}
	);
}

async function postImage(image_name, url) {
	console.log('[+] Opening the image: ' + image_name);
	var b64content = fs.readFileSync(path.join(__dirname, '/images/AI/classified/' + image_name), { encoding: 'base64' });

	console.log('[+] Uploading the image: ' + image_name);

	T.post('media/upload', { media_data: b64content }, (err, data, response)=>
		{
			if (err) {
				console.log('[!] ERROR on trying to upload image.');
				console.log(err);
			}

			if (response && !err) {
				console.log('[=] Uploaded.')
				
				console.log('[+] Now tweeting it');
				T.post('statuses/update', { media_ids: new Array(data.media_id_string) }, (err, data, response)=>
					{
						if (err) {
							console.log('[!] ERROR on tweeting the image.');
							console.log(err);
						}

						if (response && !err) {
							console.log('[=] Posted the image: ' + image_name + ' with id ' + data.id_str + ' on ' + data.user.screen_name + '.');
							embbedId(image_name, data, url);
						}
					}
				);
			}
		}
	);
}

async function searchImages(master_query) { //Thanks to Filipe Deschamps
	await downloadAllImages(await fetchGoogleAndReturnImagesLinks(master_query))

	function verifyItHasBeenPosted(filename) {
		const content = require(path.join(__dirname, 'images.json'))
		const names = content.images.map((images)=>{
			return images.archive_name
		})
		var doExists = false

		for (i = 0; i < names.length; i++) {
			if (names[i] == filename) {
				doExists = true
			}
		}

		if (doExists) {
			return true
		}
	}

	async function fetchGoogleAndReturnImagesLinks(query) {
		const response = await customSearch.cse.list({
			auth: googleSearchCredentials.apiKey,
			cx: googleSearchCredentials.searchEngineId,
			q: query,
			searchType: 'image',
			//imgSize: 'huge',
			pages: 10
		})
			
		const imageUrls = response.data.items.map((item)=>{
			return item.link
		})

		//console.log(imageUrls)
		return imageUrls
	}

	async function downloadAllImages(content) {
		content.downloadedImages = []

		for (i = 0; i < content.length; i++) {
			if (content[i] == 'https://webobjects2.cdw.com/is/image/CDW/5333589?$product-main$') {
				content.splice(i, 1);
			}
		}

		for (let imageIndex = 0; imageIndex < content.length; imageIndex++) {
			try {
				if(content.downloadedImages.includes(content[imageIndex])) {
					throw  new Error('Image already exists.')
				}
				//console.log('[+] Downloading image ' + content[imageIndex])
				var isSlash = false
				var isExtension = false
				var fName = 0
				var iName = 0
				var filename = ''
				for (i = content[imageIndex].length; i > 0; i--) {
					if ((content[imageIndex][i - 3] + content[imageIndex][i - 2] + content[imageIndex][i - 1] + content[imageIndex][i]) == '.jpg' && !isExtension) {
						fName = i
						isExtension = true
					}

					if (content[imageIndex][i] == '/' && !isSlash) {
						iName = i
						isSlash = true;
					}
				}
				for (i = iName + 1; i < fName + 1; i++) {
					filename += content[imageIndex][i]
				}

				var doExists = verifyItHasBeenPosted(filename)
				var isWhite = false

				if (doExists) {
					console.log('[!] This image has been posted.')
				} else if (!doExists) {
					imageDownloader.image({
						url: content[imageIndex],
						dest: `./images/AI/color-classify/`
					})
					console.log('[+] Checking if image is fit to be posted.')
					getColors('./images/AI/color-classify/' + filename)
					.then(colors => {
						var isWhite = false
						var colorMap = colors.map(color => color.rgb())

						for (i = 0; i < colorMap.length; i++) {
							if (colorMap[i][0] >= 225 && colorMap[i][1] >= 225 && colorMap[i][2] >= 225) {
								isWhite = true
							}
						}

						if (!isWhite) {
							console.log('[+] Sending image to Watson')
							AIImageClassifier(content[imageIndex], filename)
						} else {
							console.log('[+] The image is not fit.')
						}
					})
					.catch(err=> {
						console.log('[!] ERROR in classify images.')
						console.log(err)
					})
				}
			} catch (error) {
				console.log('[!] ERROR on trying to download image: ' + content[imageIndex] + '.')
				console.log(error)
			}
		}
	}

	async function downloadAndSave(url) {
		return imageDownloader.image({
			url: url,
			dest: `./images/AI/classified/`
		})
	}
}

async function AIImageClassifier(url, filename) {
	const visualRecognition = new visualRecognitionV3({
		version: '2018-03-19',
		authenticator: new IamAuthenticator({
			apikey: ibmWatson.apikey
		}),
		url: ibmWatson.url,
		headers: ibmWatson.learn
	})

	const classifyParams = {
		url: url
	}

	visualRecognition.classify(classifyParams)
		.then(response=> {
			var classifiedImages = response.result
			//console.log(JSON.stringify(classifiedImages, null, 2))
			var fdata = fs.readFileSync('images-AI.json')
			fs.writeFile('images-AI.json', fdata + '\n' + JSON.stringify(classifiedImages, null, 2), (err) => 
				{
					if (err) {
						console.log('[!] ERROR on trying to write at image.js.');
					} else {
						//console.log('[=] Embbeded image data.');
					}
				}
			);
			
			var targetImages = require('./target-image-data.json')
			var targetDataClass = targetImages.classifiers.map((classes)=>{
				return classes.class
			})

			var imageDataClass = classifiedImages.images[0].classifiers[0].classes.map((classes)=>{
				return classes.class
			})

			var imageDataScore = classifiedImages.images[0].classifiers[0].classes.map((classes)=>{
				return classes.score
			})

			var fit = 0

			for (i = 0; i < targetDataClass.length; i++) {
				for (x = 0; x < imageDataClass.length; x++) {
					if (targetDataClass[i] == imageDataClass[x]) {
						//console.log(`${targetData[i]} == ${imageDataClass[x]}`)
						if (imageDataScore[x] > 0.555) {
							fit += imageDataScore[x] / 10
						}
					}
				}
			}

			console.log(url)
			console.log(fit)

			if (fit > 0.2) {
				var doPost = true
			} else {
				var doPost = false
			}
			
			if (doPost) {
				console.log('[=] The image is fit to be posted.')
				imageDownloader.image({
					url: url,
					dest: `./images/AI/classified/`
				})
				//content.downloadedImages.push(url)
				console.log('[=] Downloaded image: ' + url + ' as ' + filename)
				postImage(filename, url)

				return 0
				//process.exit(1)
			} else {
				console.log('[=] The image isn`t fit to be posted.')
			}
		})
		.catch(err=> {
			console.log('[!] ERROR in classify images.')
			console.log(err)
		})
}

while (true) {
	setInterval(function() {searchImages('ryzen threadripper')}, 1 * 60000)
}