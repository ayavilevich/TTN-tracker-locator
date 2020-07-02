const JSON5 = require('json5');

/*
{
	"altitude": 69,
	"device_id": "tbeam-v11",
	"hdop": 1.44,
	"latitude": 31.000000,
	"longitude": 34.000000,
	"raw": "QQQQQQQQQQQ",
	"sats": 6,
	"time": "2020-06-21T06:38:50.916274439Z"
},
or for Cayenne LPP
{
	device_id,
	time,
	gps_20: "map[altitude:93 latitude:31.0000 longitude:34.0000]"
}
or
map[longitude:34.6375 altitude:66 latitude:31.7714]
*/
const lppGpsRegexp = /^map\[(.*)\]$/;

// Handling hdop: https://gis.stackexchange.com/questions/97774/how-can-i-convert-horizontal-dilution-of-position-to-a-radius-of-68-confidence
// cheap USB/Bluetooth/built-in GPS units the manufacturers simply use 3-5 m as the accuracy of the device and then multiply it with HDOP

class PayloadProcessing {
	static preProcessSample(sample) {
		let { latitude, longitude, altitude } = sample;
		const {
			gps_20, device_id, hdop, sats, // eslint-disable-line camelcase
		} = sample;
		// parse LPP format
		if (gps_20 && typeof gps_20 === 'string') { // eslint-disable-line camelcase
			const match = gps_20.match(lppGpsRegexp);
			if (match) {
				const jsonized = (`{${match[1]}}`).replace(/ /g, ', '); // reformat into a valid json5 string
				try {
					const object = JSON5.parse(jsonized);
					altitude = object.altitude;
					latitude = object.latitude;
					longitude = object.longitude;
				} catch (error) {
					console.warn('error parsing LPP gsp payload', error, jsonized);
				}
			}
		}
		// time is the only required field
		return {
			time: new Date(sample.time),
			deviceId: device_id,
			altitude,
			latitude,
			longitude,
			hdop,
			sats,
			// TODO, add accuracy property based on hdop
		};
	}
}

export default PayloadProcessing;
