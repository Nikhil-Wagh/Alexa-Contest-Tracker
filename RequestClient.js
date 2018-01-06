'use strict';

const https = require("https"); 
const requestOptions = {
				            url: 'http://contesttrackerapi.herokuapp.com/',
				            json: true
				       	}

class RequestClient{
	getAllContests(){
		return new Promise((resolve, reject) => {
			const heroRequest = https.request(requestOptions, (response) => {
				const chunks = [];
				response.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                response.on('end', () => {
                	const responseString = chunks.join('');
                    resolve(responseString);
                });
			});
			heroRequest.on('error', (err) => {
				reject(err);
			});
			heroRequest.end();
		});
	}
}

module.exports = RequestClient;