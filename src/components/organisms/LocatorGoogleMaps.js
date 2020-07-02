import React from 'react';
import PropTypes from 'prop-types';
import {
	Map, Marker, GoogleApiWrapper,
} from 'google-maps-react';

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
			heading, // TODO, emulate heading in google map
		} = this.props;

		// console.log('render', this.props);

		return (
			<>
				{google && (
					<Map google={google} zoom={16} center={{ lat: latitude, lng: longitude }}>
						<Marker
							onClick={this.onMarkerClick}
							name="Current location"
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
	google: PropTypes.shape({}).isRequired,
	apiKey: PropTypes.string.isRequired,
	longitude: PropTypes.number,
	latitude: PropTypes.number,
	heading: PropTypes.number,
};

export default GoogleApiWrapper(
	(props) => ({
		apiKey: props.apiKey, // https://console.developers.google.com/apis/credentials?project=ttn-tracker-locator
		// language: props.language,
	}
	),
)(LocatorGoogleMaps)
