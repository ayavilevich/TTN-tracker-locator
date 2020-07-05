import React from 'react';
import PropTypes from 'prop-types';
import {
	Map, Marker, GoogleApiWrapper, Polyline,
} from 'google-maps-react';
import { MapValidPointsPropType } from '../../lib/PropTypes';
import GLOBAL_CONSTANTS from '../../lib/Constants';

// eslint-disable-next-line react/prefer-stateless-function
class LocatorGoogleMaps extends React.Component {
	/*
	constructor(props) {
		super(props);
	}
	*/

	render() {
		const {
			google,
			// apiKey is used when applying the HOC
			apiKey, // eslint-disable-line no-unused-vars
			latitude,
			longitude,
			heading,
			points,
		} = this.props;

		// console.log('render', this.props);

		// figure out optimal bounds, TODO
		/*
		var points = [
			{ lat: 42.02, lng: -77.01 },
			{ lat: 42.03, lng: -77.02 },
			{ lat: 41.03, lng: -77.04 },
			{ lat: 42.05, lng: -77.02 }
		]
		var bounds = new this.props.google.maps.LatLngBounds();
		for (var i = 0; i < points.length; i++) {
		bounds.extend(points[i]);
		}

		then pass: bounds={bounds}
		*/

		const route = points.map((point) => ({ lng: point.longitude, lat: point.latitude }));
		console.log('google maps render, points', points.length, points, route);

		// decide on center of map
		let center;
		if (longitude !== false && latitude !== false) {
			center = { lat: latitude, lng: longitude }; // my position
		} else if (route.length > 0) {
			center = route[route.length - 1]; // last target position
		} else {
			center = { lng: GLOBAL_CONSTANTS.DEFAULT_MAP_CENTER.LONGITUDE, lat: GLOBAL_CONSTANTS.DEFAULT_MAP_CENTER.LATITUDE }; // some default position that is not just ocean
		}
		// console.log('map center', center);

		return (
			<>
				{google && (
					<Map google={google} zoom={16} center={center}>
						{longitude !== false && latitude !== false && heading !== false && (
							<Marker
								name="Your location with heading"
								position={{ lat: latitude, lng: longitude }}
								zIndex={google.maps.Marker.MAX_ZINDEX + 1}
								icon={{
									path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
									scale: 5,
									fillColor: 'white',
									fillOpacity: 0.5,
									strokeColor: 'black',
									strokeWeight: 3,
									rotation: heading,
									anchor: new google.maps.Point(0, 2.6),
								}}
							/>
						)}
						{longitude !== false && latitude !== false && heading === false && (
							<Marker
								name="Your location"
								position={{ lat: latitude, lng: longitude }}
								zIndex={google.maps.Marker.MAX_ZINDEX + 1}
								icon={{
									path: google.maps.SymbolPath.CIRCLE,
									scale: 8,
									fillColor: 'white',
									fillOpacity: 0.5,
									strokeColor: 'black',
									strokeWeight: 3,
									anchor: new google.maps.Point(0, 0),
								}}
							/>
						)}
						{route.length > 0 && (
							<Marker
								name="Target location"
								position={route[route.length - 1]}
								icon={{
									path: google.maps.SymbolPath.CIRCLE,
									scale: 8,
									fillColor: 'white',
									fillOpacity: 0.5,
									strokeColor: 'green',
									strokeWeight: 3,
									anchor: new google.maps.Point(0, 0),
								}}
							/>
						)}
						<Polyline
							path={route}
							strokeColor="#0000FF"
							strokeOpacity={0.8}
							strokeWeight={2}
						/>
					</Map>
				)}
			</>
		);
	}
}

LocatorGoogleMaps.defaultProps = {
	longitude: false,
	latitude: false,
	heading: false,
}

LocatorGoogleMaps.propTypes = {
	google: PropTypes.shape({ maps: PropTypes.shape({ SymbolPath: PropTypes.any, Point: PropTypes.any, Marker: PropTypes.any }) }).isRequired,
	apiKey: PropTypes.string.isRequired,
	longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
	latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
	heading: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
	points: MapValidPointsPropType.isRequired,
};

export default GoogleApiWrapper(
	(props) => ({
		apiKey: props.apiKey, // https://console.developers.google.com/apis/credentials?project=ttn-tracker-locator
		// language: props.language,
	}
	),
)(LocatorGoogleMaps)
