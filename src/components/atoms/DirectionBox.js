import React from 'react';
// import styled from 'styled-components';
import { Statistic } from 'antd';
import PropTypes from 'prop-types';
import {
	DirectionForwardIcon, DirectionLeftIcon, DirectionRightIcon, DirectionUnknownIcon,
} from './Icons';

// eslint-disable-next-line react/prefer-stateless-function
class DirectionBox extends React.Component {
	/*
	constructor(props) {
		super(props);
	}
	*/

	render() {
		const { direction } = this.props;

		// format direction with units
		let directionValue = '-';
		let directionIcon = (<DirectionUnknownIcon />);
		if (direction !== false) {
			directionValue = direction > 180 ? direction - 360 : direction;
			directionIcon = (<DirectionForwardIcon />);
			if (directionValue < -45) {
				directionIcon = (<DirectionLeftIcon />);
			}
			if (directionValue > 45) {
				directionIcon = (<DirectionRightIcon />);
			}
		}

		return (
			<Statistic
				title="Direction to target"
				value={directionValue}
				precision={1}
				prefix={directionIcon}
				suffix="°"
			/>
		);
	}
}

DirectionBox.defaultProps = {
	direction: false,
}

DirectionBox.propTypes = {
	direction: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]), // in degrees
};

export default DirectionBox;
