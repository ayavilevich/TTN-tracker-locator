import React from 'react';
// import styled from 'styled-components';
import { Statistic } from 'antd';
import moment from 'moment'; // https://momentjs.com/docs/#/durations/
import momentDurationFormatSetup from 'moment-duration-format'; // https://github.com/jsmreese/moment-duration-format
import PropTypes from 'prop-types';
import { LocationFixIcon, LocationNoFixIcon } from './Icons';

momentDurationFormatSetup(moment);

const CONSTANTS = {
	INTERVAL_MS: 1000, // 1Hz
};

// eslint-disable-next-line react/prefer-stateless-function
class AgeBox extends React.Component {
	constructor(props) {
		super(props);

		const { lastUpdateTime } = this.props;
		this.state = {
			age: moment.duration(moment().diff(lastUpdateTime)),
		};
	}

	componentDidMount() {
		this.timer = setInterval(this.updateAge, CONSTANTS.INTERVAL_MS);
	}

	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	updateAge = () => {
		const { lastUpdateTime } = this.props;
		this.setState({ age: moment.duration(moment().diff(lastUpdateTime)) });
	};

	render() {
		const { hasFix } = this.props;
		const { age } = this.state;

		// format
		const value = age.format();
		const icon = hasFix ? (<LocationFixIcon />) : (<LocationNoFixIcon />);

		// TODO: state, timer, render diff

		return (
			<Statistic
				title="Age of target position"
				value={value}
				prefix={icon}
			/>
		);
	}
}

AgeBox.propTypes = {
	lastUpdateTime: PropTypes.instanceOf(Date).isRequired, // in meters
	hasFix: PropTypes.bool.isRequired,
};

export default AgeBox;
