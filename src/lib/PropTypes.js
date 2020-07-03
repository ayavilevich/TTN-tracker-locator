import PropTypes from 'prop-types';

export const PointsPropType = PropTypes.arrayOf(PropTypes.shape({
	time: PropTypes.instanceOf(Date).isRequired,
	deviceId: PropTypes.string,
	altitude: PropTypes.number,
	latitude: PropTypes.number,
	longitude: PropTypes.number,
	hdop: PropTypes.number,
	sats: PropTypes.number,
}));

export const MapValidPointsPropType = PropTypes.arrayOf(PropTypes.shape({
	time: PropTypes.instanceOf(Date).isRequired,
	deviceId: PropTypes.string,
	altitude: PropTypes.number,
	latitude: PropTypes.number.isRequired,
	longitude: PropTypes.number.isRequired,
	hdop: PropTypes.number,
	sats: PropTypes.number,
}));

export default PointsPropType;
