import React from 'react';
// import styled from 'styled-components';
import { Row, Col, Statistic } from 'antd';
import {
	ArrowUpOutlined, ArrowLeftOutlined, ArrowRightOutlined, EyeOutlined, CarOutlined, RocketOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';

// eslint-disable-next-line react/prefer-stateless-function
class Locator extends React.Component {
	/*
	constructor(props) {
		super(props);
	}
	*/

	render() {
		const { distance, direction } = this.props;

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

		// format distance with units
		const directionValue = direction > 180 ? direction - 360 : direction;
		let directionIcon = (<ArrowUpOutlined />);
		if (directionValue < -45) {
			directionIcon = (<ArrowLeftOutlined />);
		}
		if (directionValue > 45) {
			directionIcon = (<ArrowRightOutlined />);
		}

		return (
			<Row gutter={16}>
				<Col span={12}>
					<Statistic
						title="Distance to target"
						value={distanceValue}
						precision={1}
						prefix={distanceIcon}
						suffix={distanceUnit}
					/>
				</Col>
				<Col span={12}>
					<Statistic
						title="Direction to target"
						value={directionValue}
						precision={1}
						prefix={directionIcon}
						suffix="°"
					/>
				</Col>
			</Row>
		);
	}
}

Locator.propTypes = {
	distance: PropTypes.number.isRequired, // in meters
	direction: PropTypes.number.isRequired, // in degrees
};

export default Locator;
