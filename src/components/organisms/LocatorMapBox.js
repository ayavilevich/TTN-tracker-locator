import React from 'react';
import PropTypes from 'prop-types';
import ReactMapboxGl, {
	Layer,
	Feature,
	ScaleControl,
	ZoomControl,
	RotationControl,
} from 'react-mapbox-gl';

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
			accessToken, latitude, longitude, heading,
		} = this.props;

		return (
			<>
				{this.MapBox && this.accessToken === accessToken && (
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
	longitude: PropTypes.number,
	latitude: PropTypes.number,
	heading: PropTypes.number,
};

export default LocatorMapBox;
