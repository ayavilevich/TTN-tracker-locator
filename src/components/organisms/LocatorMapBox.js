import React from 'react';
import PropTypes from 'prop-types';
import ReactMapboxGl, {
	Layer,
	Feature,
	MapContext,
	/*
	ScaleControl,
	ZoomControl,
	RotationControl,
	*/
} from 'react-mapbox-gl';
import * as MapboxGl from 'mapbox-gl';
import { MapValidPointsPropType } from '../../lib/PropTypes';
import GLOBAL_CONSTANTS from '../../lib/Constants';

const CONSTANTS = {
	FIT_MAX_ZOOM: 30,
	FIT_PADDING_RATIO: 0.1, // 10% on each side
};

const linePaint = {
	'line-color': '#4790E5',
	'line-width': 6,
};

/*
const meCirclePaint = {
	'circle-radius': 10,
	'circle-color': '#E54E52',
	'circle-opacity': 0.8,
};
*/

const targetCirclePaint = {
	'circle-radius': 10,
	'circle-color': '#00AA00',
	'circle-opacity': 0.8,
};

/*
Fit all route points in view, with the "center" as the center of the view.
Fit in such a way that the points will be in view at any rotation/bearing/heading
Reference: https://github.com/mapbox/mapbox-gl-js/issues/1338
*/
function circularFitBounds(map, center, route) {
	const tr = map.transform;
	// console.log('fitBounds, tr, ', tr.width, tr.height); // size of the view in pixels
	const centerTransform = tr.project(MapboxGl.LngLat.convert(center)); // position of center in pixels
	// console.log('fitBounds, center, ', center, centerTransform);
	let maxDist = 0;
	route.forEach((point) => {
		const transformed = tr.project(MapboxGl.LngLat.convert(point));
		const dist = transformed.dist(centerTransform);
		maxDist = Math.max(maxDist, dist);
		// console.log('fitBounds, point, ', point, transformed, dist);
	});
	if (maxDist === 0) {
		return GLOBAL_CONSTANTS.DEFAULT_MAP_ZOOM;
	}
	// return zoom level that will fit a circle at radius of maxDist
	const lateralPadding = tr.width * CONSTANTS.FIT_PADDING_RATIO;
	const verticalPadding = tr.height * CONSTANTS.FIT_PADDING_RATIO;
	const scaleX = (tr.width - lateralPadding * 2) / (maxDist * 2);
	const scaleY = (tr.height - verticalPadding * 2) / (maxDist * 2);
	if (scaleY < 0 || scaleX < 0) {
		console.warn('Map cannot fit within canvas with the given bounds, padding, and/or offset.');
		return GLOBAL_CONSTANTS.DEFAULT_MAP_ZOOM;
	}
	const maxZoom = CONSTANTS.FIT_MAX_ZOOM;
	return Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), maxZoom);
}

class LocatorMapBox extends React.Component {
	constructor(props) {
		super(props);
		this.map = null;
	}

	componentDidMount() {
		const { accessToken } = this.props;

		// MapBox needs to be created only once (as long as access token is the same) or it will recreate the map every time
		// https://github.com/alex3165/react-mapbox-gl/issues/812
		this.MapBox = ReactMapboxGl({
			accessToken,
		});
		this.accessToken = accessToken; // store token of the MaxBox instance
		console.log('componentDidMount', this.props, this.MapBox);
	}

	componentDidUpdate(prevProps) {
		const { accessToken } = this.props;
		// console.log('componentDidUpdate', prevProps, this.props);

		// https://www.pluralsight.com/guides/prop-changes-in-react-component
		if (prevProps.accessToken !== accessToken) {
			// recreate map
			this.MapBox = ReactMapboxGl({
				accessToken,
			});
			this.accessToken = accessToken; // store token of the MaxBox instance
			console.log('componentDidUpdate', accessToken, this.MapBox);
		}
	}

	render() {
		const {
			accessToken, latitude, longitude, heading, points,
		} = this.props;

		const route = points.map((point) => [point.longitude, point.latitude]);
		// console.log('mapbox render, points', points.length, points, route);

		// decide on center of map
		let center;
		if (longitude !== false && latitude !== false) {
			center = [longitude, latitude]; // my position
		} else if (route.length > 0) {
			center = route[route.length - 1]; // last target position
		} else {
			center = [GLOBAL_CONSTANTS.DEFAULT_MAP_CENTER.LONGITUDE, GLOBAL_CONSTANTS.DEFAULT_MAP_CENTER.LATITUDE]; // some default position that is not just ocean
		}
		// console.log('map center', center);
		// set default zoom (before fitting a bounding view)
		let zoom = GLOBAL_CONSTANTS.DEFAULT_MAP_ZOOM;

		// figure out optimal bounds
		// fitBounds seems to be reseting the bearing (per documentation)
		// https://docs.mapbox.com/mapbox-gl-js/api/map/#map#fitbounds
		// https://stackoverflow.com/questions/35586360/mapbox-gl-js-getbounds-fitbounds
		// console.log('map in render', this.map);
		if (this.map && route.length > 0) {
			zoom = circularFitBounds(this.map, center, route);
		}

		return (
			<>
				{this.MapBox && this.accessToken === accessToken && (
					<this.MapBox
						// eslint-disable-next-line react/style-prop-object
						style="mapbox://styles/mapbox/streets-v11"
						// standard icons: https://github.com/mapbox/mapbox-gl-styles
						// available in light-v9 and other styles
						// marker-15 is available in light-v9 but not in streets-vX
						containerStyle={{
							height: '100%',
							width: '100%',
						}}
						center={center}
						bearing={[heading || 0]}
						zoom={[zoom]}
					>
						<MapContext.Consumer>
							{(map) => {
								// use `map` here
								// console.log('map in context', map, map.transform);
								this.map = map; // store map object
							}}
						</MapContext.Consumer>
						{/*
						<ScaleControl />
						<ZoomControl />
						<RotationControl style={{ top: 80 }} />
						*/}
						{/*
						<Layer type="symbol" layout={{ 'icon-image': 'marker-15' }}>
							<Feature coordinates={[longitude + 0.001, latitude]} />
						</Layer>
						<Layer type="circle" id="me" paint={meCirclePaint}>
							<Feature coordinates={[longitude, latitude]} />
						</Layer>
						*/}
						{longitude !== false && latitude !== false && (
							<Layer type="symbol" id="me" layout={{ 'icon-image': 'harbor-15' }}>
								<Feature coordinates={[longitude, latitude]} />
							</Layer>
						)}
						{route.length > 0 && (
							<Layer type="circle" id="target" paint={targetCirclePaint}>
								<Feature coordinates={route[route.length - 1]} />
							</Layer>
						)}
						<Layer type="line" id="path" paint={linePaint}>
							<Feature coordinates={route} />
						</Layer>
					</this.MapBox>
				)}
			</>
		);
	}
}

LocatorMapBox.defaultProps = {
	longitude: false,
	latitude: false,
	heading: false,
}

LocatorMapBox.propTypes = {
	accessToken: PropTypes.string.isRequired,
	longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
	latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
	heading: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
	points: MapValidPointsPropType.isRequired,
};

export default LocatorMapBox;
