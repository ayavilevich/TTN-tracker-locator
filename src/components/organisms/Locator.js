import React from 'react';
import styled from 'styled-components';
import { Alert } from 'antd';
import PropTypes from 'prop-types';
import { MapValidPointsPropType } from '../../lib/PropTypes';

import LocatorGoogleMaps from './LocatorGoogleMaps';
import LocatorMapBox from './LocatorMapBox';

const FullViewport = styled.div`
	width: 100vw;
	height: 100vh;
`;
const AlertsOverlay = styled.div`
	position: absolute;
	left: 10vw;
	top: 10vh;
`;

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
			heading: false,
			latitude: false,
			longitude: false,
		};
		this.watchPositionId = null;
	}

	componentDidMount() {
		// window.addEventListener('resize', this.handleResize);

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientation
		// https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientationabsolute
		// https://developer.mozilla.org/en-US/docs/Web/API/OrientationSensor
		window.addEventListener('deviceorientation', this.handleHeadingChange);
		window.addEventListener('deviceorientationabsolute', this.handleHeadingChange);

		// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
		this.watchPositionId = navigator.geolocation.watchPosition(this.handleLocationUpdate, this.handleLocationUpdateFail, {
			enableHighAccuracy: true,
			maximumAge: 30000,
			timeout: 27000,
		});
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
			this.setState({ heading: false });
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
		this.setState({ latitude: false, longitude: false });
	}

	render() {
		const { googleApiKey, mapBoxAccessToken, points } = this.props;
		const { latitude, longitude, heading } = this.state;

		// console.log('render', this.props);

		return (
			<FullViewport>
				{mapBoxAccessToken && (
					<LocatorMapBox
						accessToken={mapBoxAccessToken}
						latitude={latitude}
						longitude={longitude}
						heading={heading}
						points={points}
					/>
				)}
				{!mapBoxAccessToken && googleApiKey && (
					<LocatorGoogleMaps
						apiKey={googleApiKey}
						latitude={latitude}
						longitude={longitude}
						heading={heading}
						points={points}
					/>
				)}
				{!googleApiKey && !mapBoxAccessToken && (
					<Alert message="No map API keys specified in Settings" type="error" />
				)}
				<AlertsOverlay>
					{heading === false && (
						<Alert message="Your heading is not available" type="warning" />
					)}
					{(latitude === false || longitude === false) && (
						<Alert message="Your location is not available" type="warning" />
					)}
				</AlertsOverlay>
			</FullViewport>
		);
	}
}

Locator.defaultProps = {
	mapBoxAccessToken: '',
	googleApiKey: '',
}

Locator.propTypes = {
	mapBoxAccessToken: PropTypes.string,
	googleApiKey: PropTypes.string,
	points: MapValidPointsPropType.isRequired,
};

export default Locator;
