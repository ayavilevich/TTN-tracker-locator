import React from 'react';
import { Alert } from 'antd';
import PropTypes from 'prop-types';
import {
	Map, Marker, GoogleApiWrapper,
} from 'google-maps-react';
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl,
} from 'react-mapbox-gl';

// browser agnostic orientation
function getBrowserOrientation() {
	let orientation;
	if (window.screen.orientation && window.screen.orientation.type) {
		orientation = window.screen.orientation.type;
	} else {
		orientation = window.screen.orientation
			|| window.screen.mozOrientation
			|| window.screen.msOrientation;
	}

	/*
		'portait-primary':      for (screen width < screen height, e.g. phone, phablet, small tablet)
								device is in 'normal' orientation
								for (screen width > screen height, e.g. large tablet, laptop)
								device has been turned 90deg clockwise from normal
		'portait-secondary':    for (screen width < screen height)
								device has been turned 180deg from normal
								for (screen width > screen height)
								device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
		'landscape-primary':    for (screen width < screen height)
								device has been turned 90deg clockwise from normal
								for (screen width > screen height)
								device is in 'normal' orientation
		'landscape-secondary':  for (screen width < screen height)
								device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
								for (screen width > screen height)
								device has been turned 180deg from normal
	*/

	return orientation;
}

// learn defaults for this device
let defaultOrientation;
if (window.screen.width > window.screen.height) {
	defaultOrientation = 'landscape';
} else {
	defaultOrientation = 'portrait';
}

class Locator extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			heading: 0,
			latitude: 0,
			longitude: 0,
		};
		this.watchPositionId = null;
	}

	componentDidMount() {
		const { mapBoxAccessToken } = this.props;

		// window.addEventListener('resize', this.handleResize);

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientation
		// https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientationabsolute
		window.addEventListener('deviceorientation', this.handleHeadingChange);
		window.addEventListener('deviceorientationabsolute', this.handleHeadingChange);

		// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
		this.watchPositionId = navigator.geolocation.watchPosition(this.handleLocationUpdate, this.handleLocationUpdateFail, {
			enableHighAccuracy: true,
			maximumAge: 30000,
			timeout: 27000,
		});

		// MapBox needs to be only once or it will recreate the map every time
		// https://github.com/alex3165/react-mapbox-gl/issues/812
		this.MapBox = ReactMapboxGl({
			accessToken: mapBoxAccessToken,
		});
		this.mapBoxAccessToken = mapBoxAccessToken; // store token of the MaxBox instance
		console.log('componentDidMount', this.props, this.MapBox);
	}

	componentDidUpdate(prevProps) {
		const { mapBoxAccessToken } = this.props;
		// console.log('componentDidUpdate', prevProps, this.props);

		// https://www.pluralsight.com/guides/prop-changes-in-react-component
		if (prevProps.mapBoxAccessToken !== mapBoxAccessToken) {
			// recreate map
			this.MapBox = ReactMapboxGl({
				accessToken: mapBoxAccessToken,
			});
			this.mapBoxAccessToken = mapBoxAccessToken; // store token of the MaxBox instance
			console.log('componentDidUpdate', mapBoxAccessToken, this.MapBox);
		}
	}

	/*
	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}
	*/

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service\
		console.log('componentDidCatch', error, errorInfo);
	}

	componentWillUnmount() {
		// window.removeEventListener('resize', this.handleResize);

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientation
		// https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientationabsolute
		window.removeEventListener('deviceorientation', this.handleHeadingChange);
		window.removeEventListener('deviceorientationabsolute', this.handleHeadingChange);

		// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/clearWatch
		navigator.geolocation.clearWatch(this.watchPositionId);
		this.watchPositionId = null;
	}

	// heading
	handleHeadingChange = (event) => {
		console.log('heading', event);

		let heading = event.alpha;

		if (typeof event.webkitCompassHeading !== 'undefined') {
			heading = event.webkitCompassHeading; // iOS non-standard
		} else if (!event.absolute) {
			return;
		}

		const orientation = getBrowserOrientation();

		if (typeof heading !== 'undefined' && heading !== null) { // && typeof orientation !== "undefined") {
			// we have a browser that reports device heading and orientation
			/* if (debug) {
				debugOrientation.textContent = orientation;
			} */

			// what adjustment we have to add to rotation to allow for current device orientation
			let adjustment = 0;
			if (defaultOrientation === 'landscape') {
				adjustment -= 90;
			}

			if (typeof orientation !== 'undefined') {
				const currentOrientation = orientation.split('-');

				if (defaultOrientation !== currentOrientation[0]) {
					if (defaultOrientation === 'landscape') {
						adjustment -= 270;
					} else {
						adjustment -= 90;
					}
				}

				if (currentOrientation[1] === 'secondary') {
					adjustment -= 180;
				}
			}

			/*
			positionCurrent.hng = heading + adjustment;

			var phase = positionCurrent.hng < 0 ? 360 + positionCurrent.hng : positionCurrent.hng;
			positionHng.textContent = (360 - phase | 0) + "°";
			*/

			console.log('Heading', heading, adjustment, orientation, defaultOrientation);
			this.setState({ heading: heading + adjustment });

			/*
					// apply rotation to compass rose
					if (typeof rose.style.transform !== "undefined") {
						rose.style.transform = "rotateZ(" + positionCurrent.hng + "deg)";
					} else if (typeof rose.style.webkitTransform !== "undefined") {
						rose.style.webkitTransform = "rotateZ(" + positionCurrent.hng + "deg)";
					} */
		} else {
			// device can't show heading

			// positionHng.textContent = "n/a";
			// showHeadingWarning();
			console.log('No heading');
			this.setState({ heading: 0 });
		}
	};

	// location (based on https://github.com/lamplightdev/compass)
	handleLocationUpdate = (position) => {
		const lat = position.coords.latitude;
		const lng = position.coords.longitude;
		console.log('pos', lat, lng);
		this.setState({ latitude: lat, longitude: lng });
	}

	handleLocationUpdateFail = (error) => {
		// TODO, render alert or notification
		console.log('location fail: ', error);
	}

	render() {
		const { google, googleApiKey, mapBoxAccessToken } = this.props;
		const { latitude, longitude, heading } = this.state;

		// console.log('render', this.props);

		return (
			<>
				{this.MapBox && mapBoxAccessToken && this.mapBoxAccessToken === mapBoxAccessToken && (
					<div style={{ width: '100vw', height: '100vh' }}>
						<this.MapBox
							// eslint-disable-next-line react/style-prop-object
							style="mapbox://styles/mapbox/streets-v9"
							containerStyle={{
								// height: '100vh',
								// width: '100vw'
								height: '100%',
								width: '100%',
							}}
							center={[longitude, latitude]}
							bearing={[-heading]}
							zoom={[16]}
						>
							<ScaleControl />
							<ZoomControl />
							<RotationControl style={{ top: 80 }} />
							<Layer type="symbol" id="marker" layout={{ 'icon-image': 'marker-15' }}>
								<Feature coordinates={[-0.481747846041145, 51.3233379650232]} />
							</Layer>
						</this.MapBox>
					</div>
				)}
				{!mapBoxAccessToken && google && googleApiKey && (
					<div style={{ width: '100vw', height: '100vh' }}>
						<Map google={google} zoom={16} center={{ lat: latitude, lng: longitude }}>
							<Marker
								onClick={this.onMarkerClick}
								name="Current location"
							/>
						</Map>
					</div>
				)}
				{!googleApiKey && !mapBoxAccessToken && (
					<Alert message="No map API keys specified in Settings" type="error" />
				)}
			</>
		);
	}
}

Locator.defaultProps = {
	mapBoxAccessToken: '',
	googleApiKey: '',
}

Locator.propTypes = {
	google: PropTypes.shape({}).isRequired,
	mapBoxAccessToken: PropTypes.string,
	googleApiKey: PropTypes.string,
};

export default GoogleApiWrapper(
	(props) => ({
		apiKey: props.googleApiKey, // https://console.developers.google.com/apis/credentials?project=ttn-tracker-locator
		// language: props.language,
	}
	),
)(Locator)
