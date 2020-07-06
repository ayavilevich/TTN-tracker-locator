import React from 'react';
// import styled from 'styled-components';
import { Statistic } from 'antd';
import {
	ArrowUpOutlined, ArrowLeftOutlined, ArrowRightOutlined, QuestionOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';

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
		let directionIcon = (<QuestionOutlined />);
		if (direction !== false) {
			directionValue = direction > 180 ? direction - 360 : direction;
			directionIcon = (<ArrowUpOutlined />);
			if (directionValue < -45) {
				directionIcon = (<ArrowLeftOutlined />);
			}
			if (directionValue > 45) {
				directionIcon = (<ArrowRightOutlined />);
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
