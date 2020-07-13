import React from 'react';
// import styled from 'styled-components';
import { Statistic } from 'antd';
import PropTypes from 'prop-types';
import {
	DistanceSightIcon, DistanceWalkIcon, DistanceDriveIcon, DistanceFlyIcon,
} from './Icons';

// eslint-disable-next-line react/prefer-stateless-function
class DistanceBox extends React.Component {
	/*
	constructor(props) {
		super(props);
	}
	*/

	render() {
		const { distance } = this.props;

		// format distance with units
		let distanceValue = distance;
		let distanceUnit = 'm';
		let distanceIcon = (<DistanceSightIcon />);
		if (distance > 100) {
			distanceIcon = (<DistanceWalkIcon />);
		}
		if (distance > 1000) {
			distanceIcon = (<DistanceDriveIcon />);
		}
		if (distance > 200000) {
			distanceIcon = (<DistanceFlyIcon />);
		}
		if (distance > 500) { // after 500m convert to km
			distanceValue /= 1000;
			distanceUnit = 'km';
		}

		return (
			<Statistic
				title="Distance to target"
				value={distanceValue}
				precision={1}
				prefix={distanceIcon}
				suffix={distanceUnit}
			/>
		);
	}
}

DistanceBox.propTypes = {
	distance: PropTypes.number.isRequired, // in meters
};

export default DistanceBox;
