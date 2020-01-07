var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    google = require('googleapis').google,
    imageDownloader = require('image-downloader');

const googleSearchCredentials = require(path.join(__dirname, '/credentials/google-search.json'));
const config = require(path.join(__dirname, '/credentials/twitter.json'));

var T = new Twit(config);
const customSearch = google.customsearch('v1'); 


function embbedId(name, data, url) {
	var fdata = fs.readFileSync(path.join(__dirname, 'images.json')).toString().replace('	}\n}', '	}') + `	
	"${name}": {
		"created_at":	"${data.created_at}",
		"id":			"${data.id}",
		"id_str":		"${data.id_str}",
		"url":			"${url}"
	}
}
	`

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

function postImage(image_name, url) {
	/*var isDuplicate = false
	const images = require(path.join(__dirname, 'images.json'))

	for (i = 0; i < images.length; i++) {
		if (image_name == images[i]) {
			console.log('[!] Image has been already posted.')
			isDuplicate = true
		}

	}*/

	console.log('[+] Opening the image: ' + image_name);
	var b64content = fs.readFileSync(path.join(__dirname, '/images/' + image_name), { encoding: 'base64' });

	/*if (isDuplicate) {
		return 0
	}*/

	console.log('[+] Uploading the image: ' + image_name);

	T.post('media/upload', { media_data: b64content }, (err, data, response)=>
		{
			if (err) {
				console.log('[!] ERROR on trying to upload image.');
				console.log(err);
			}

			if (response && !err) {
				console.log('[=] Uploaded.') //Success upload
				
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

async function searchImages (master_query) { //Thanks to Filipe Deschamps
	await downloadAllImages(await fetchGoogleAndReturnImagesLinks(master_query))

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

		return imageUrls
	}

	async function downloadAllImages(content) {
		content.downloadedImages = []

		for (let imageIndex = 0; imageIndex < content.length; imageIndex++) {
			try {
				if(content.downloadedImages.includes(content[imageIndex])) {
					throw  new Error('Image already exists.')
				}
				//console.log('[+] Downloading image ' + content[imageI ndex])
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
				await downloadAndSave(content[imageIndex])
				content.downloadedImages.push(content[imageIndex])
				console.log('[=] Downloaded image: ' + content[imageIndex] + ' as ' + filename)
				postImage(filename, content[imageIndex])
			} catch (error) {
				console.log('[!] ERROR on trying to download image: ' + content[imageIndex] + '.')
				console.log(error)
			}
		}
	}

	async function downloadAndSave(url) {
		return imageDownloader.image({
			url: url,
			dest: `./images/`
		})
	}
}

//searchImages('rtx 2080 ti')
const images = require(path.join(__dirname, 'images.json'))

if (images.includes('519064-nvidia-geforce-rtx-2080-ti-founders-edition.jpg')) {
	console.log("a")
}

//Think somehow to verify if the target image has been uploaded

