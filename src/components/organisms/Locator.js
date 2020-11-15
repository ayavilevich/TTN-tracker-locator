import React from 'react';
import styled from 'styled-components';
import { Alert } from 'antd';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import LatLon from 'geodesy/latlon-spherical';

import { PointsPropType } from '../../lib/PropTypes';
import GeoUtils from '../../lib/GeoUtils';

import LocatorGoogleMaps from './LocatorGoogleMaps';
import LocatorMapBox from './LocatorMapBox';
import DirectionBox from '../atoms/DirectionBox';
import DistanceBox from '../atoms/DistanceBox';
import AgeBox from '../atoms/AgeBox';

const CONSTANTS = {
	THROTTLE_HEADING: 100, // 10Hz
};

const FullViewport = styled.div`
	width: 100vw;
	height: 100vh;
`;

const AlertsOverlay = styled.div`
	position: absolute;
	left: 2vw;
	top: 10vh;
`;

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox
const NavigationBar = styled.div`
	position: absolute;
	bottom: 2vh;
	display: flex;
	width: 100%;
	flex-flow: row wrap;
	justify-content: center;
`;

const NavigationBarItem = styled.div`
	display: inline-block;
	padding: 4px 15px;
	background: #fff;
	border: 1px solid #d9d9d9;
	white-space: nowrap;
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
		this.throttledHandleHeadingChange = throttle(this.handleHeadingChange, CONSTANTS.THROTTLE_HEADING);
	}

	componentDidMount() {
		// window.addEventListener('resize', this.handleResize);

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientation
		// https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/ondeviceorientationabsolute
		// https://developer.mozilla.org/en-US/docs/Web/API/OrientationSensor
		window.addEventListener('deviceorientation', this.throttledHandleHeadingChange);
		window.addEventListener('deviceorientationabsolute', this.throttledHandleHeadingChange);

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

		window.removeEventListener('deviceorientation', this.throttledHandleHeadingChange);
		window.removeEventListener('deviceorientationabsolute', this.throttledHandleHeadingChange);

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

			console.log('Heading', heading, adjustment, orientation, defaultOrientation, -heading - adjustment);
			this.setState({ heading: GeoUtils.normalizeHeading(-heading - adjustment) }); // the heading and adjustment so far are for where the north is, mirror to get our heading relative to north

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
		// console.log('pos', position.coords); // can also have heading, accuracy and speed but not all browser provide that
		const { latitude, longitude } = position.coords;
		this.setState({ latitude, longitude });
	}

	handleLocationUpdateFail = (error) => {
		// TODO, render alert or notification
		console.log('location fail: ', error);
		this.setState({ latitude: false, longitude: false });
	}

	render() {
		const {
			googleApiKey, mapBoxAccessToken, points, maxPointsToRenderOnMap,
			demoLatitudeOffset, demoLongitudeOffset,
		} = this.props;
		const { latitude, longitude, heading } = this.state;

		// get subset of points to render on map
		const validPoints = points.filter((point) => typeof point.latitude === 'number' && typeof point.longitude === 'number');
		let pointsToRenderOnMap = [];
		if (points.length) {
			if (points.length > maxPointsToRenderOnMap) {
				// assume sorted by time
				// assume older entries are first
				pointsToRenderOnMap = validPoints.slice(-maxPointsToRenderOnMap);
			} else {
				pointsToRenderOnMap = validPoints;
			}
		}
		// console.log('points for map', points.length, validPoints.length, pointsToRenderOnMap.length);

		// target point (last known target position)
		// assume points are sorted with oldest first
		const targetPoint = pointsToRenderOnMap.length > 0 ? ({ ...pointsToRenderOnMap[pointsToRenderOnMap.length - 1] }) : false;
		const lastUpdatePoint = points.length > 0 ? points[points.length - 1] : false;

		// apply demo offset to pointsToRenderOnMap. normally changes nothing
		pointsToRenderOnMap = pointsToRenderOnMap.map((point) => {
			const newPoint = { ...point }; // clone
			newPoint.latitude += demoLatitudeOffset;
			newPoint.longitude += demoLongitudeOffset;
			return newPoint;
		});

		// distance and direction
		let targetDistance = false;
		let targetDirection = false;
		// test when there is not position or heading
		// targetDistance = 340;
		// targetDirection = 20;
		// calculate from known points
		if (latitude !== false && longitude !== false && targetPoint) {
			const p1 = new LatLon(latitude, longitude);
			const p2 = new LatLon(targetPoint.latitude, targetPoint.longitude);
			targetDistance = p1.distanceTo(p2); // defaults to meters
			if (heading !== false) {
				targetDirection = p1.initialBearingTo(p2); // degrees from north (0°..360°).
				console.log('direction to target', { bearing: targetDirection, heading });
				targetDirection = GeoUtils.normalizeHeading(targetDirection - heading); // correct relative to current heading
			}/* else {
				// test
				const headingTmp = 90;
				targetDirection = p1.initialBearingTo(p2); // degrees from north (0°..360°).
				console.log('direction to target (test)', { bearing: targetDirection, headingTmp });
				targetDirection = GeoUtils.normalizeHeading(targetDirection - headingTmp); // correct relative to current heading
			} */
		}

		// console.log('render', this.props);

		return (
			<FullViewport>
				{mapBoxAccessToken && (
					<LocatorMapBox
						accessToken={mapBoxAccessToken}
						latitude={latitude + demoLatitudeOffset}
						longitude={longitude + demoLongitudeOffset}
						heading={heading}
						points={pointsToRenderOnMap}
					/>
				)}
				{!mapBoxAccessToken && googleApiKey && (
					<LocatorGoogleMaps
						apiKey={googleApiKey}
						latitude={latitude + demoLatitudeOffset}
						longitude={longitude + demoLongitudeOffset}
						heading={heading}
						points={pointsToRenderOnMap}
					/>
				)}
				{!googleApiKey && !mapBoxAccessToken && (
					<Alert message="No map API keys specified in Settings" type="error" />
				)}
				<NavigationBar>
					{targetDistance !== false && (
						<>
							<NavigationBarItem>
								<DistanceBox
									distance={targetDistance}
								/>
							</NavigationBarItem>
							<NavigationBarItem>
								<DirectionBox
									direction={targetDirection}
								/>
							</NavigationBarItem>
							<NavigationBarItem>
								<AgeBox
									lastUpdateTime={lastUpdatePoint.time}
									hasFix={lastUpdatePoint.latitude !== false && lastUpdatePoint.longitude !== false}
								/>
							</NavigationBarItem>
						</>
					)}
				</NavigationBar>
				<AlertsOverlay>
					{heading === false && (
						<Alert message="Your heading is not available" type="warning" />
					)}
					{(latitude === false || longitude === false) && (
						<Alert message="Your location is not available" type="warning" />
					)}
					{points.length === 0 && (
						<Alert message="Target location is not available" type="warning" />
					)}
				</AlertsOverlay>
			</FullViewport>
		);
	}
}

Locator.defaultProps = {
	mapBoxAccessToken: '',
	googleApiKey: '',
	demoLatitudeOffset: 0,
	demoLongitudeOffset: 0,
}

Locator.propTypes = {
	mapBoxAccessToken: PropTypes.string,
	googleApiKey: PropTypes.string,
	points: PointsPropType.isRequired,
	maxPointsToRenderOnMap: PropTypes.number.isRequired,
	demoLatitudeOffset: PropTypes.number,
	demoLongitudeOffset: PropTypes.number,
};

export default Locator;
