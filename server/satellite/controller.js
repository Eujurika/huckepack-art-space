import { getIssPosition, getIssPasses } from './model.js';

export async function issPositionAction(request, response) {
	const data = await getIssPosition();
	response.send(data);
}

export async function issPassesAction(request, response) {
	const options = {
		lat: request.query.lat,
		lon: request.query.lon,
	};

	/* console.log('lat', options.lat);
  console.log('lon', options.lon); */

	const data = await getIssPasses(options);
	response.send(data);
}
