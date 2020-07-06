import React from 'react';
// import styled from 'styled-components';
import { Statistic } from 'antd';
import {
	EyeOutlined, CarOutlined, RocketOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';

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
		let distanceIcon = (<EyeOutlined />);
		if (distance > 200) {
			distanceIcon = (<CarOutlined />);
		}
		if (distance > 200000) {
			distanceIcon = (<RocketOutlined />);
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
