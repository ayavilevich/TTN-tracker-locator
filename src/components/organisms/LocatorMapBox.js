import React from 'react';
import PropTypes from 'prop-types';
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl,
} from 'react-mapbox-gl';
import { MapValidPointsPropType } from '../../lib/PropTypes';
import GLOBAL_CONSTANTS from '../../lib/Constants';

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

class LocatorMapBox extends React.Component {
	/*
	constructor(props) {
		super(props);
	}
	*/

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
						zoom={[16]}
					>
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
