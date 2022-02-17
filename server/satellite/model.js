import fetch from 'node-fetch';

export async function getIssPasses(options) {
	console.log('options', options);
	const url = `http://api.open-notify.org/iss/v1/?lat=${options.lon}&lon=${options.lat}`;
	console.log('url', url);

	const response = await fetch(
		/* 'http://api.open-notify.org/iss/v1/?lat=70.55&lon=95.1' */
		url
	);

	console.log('response', response);
	try {
		const data = await response.json();
		console.log('data', data);
		return data;
	} catch (err) {
		console.error(err);
		return err;
	}
}

export async function getIssPosition() {
	const response = await fetch('http://api.open-notify.org/iss-now.json');
	const data = await response.json();
	return data;
}
