import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
	Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const IconWithSpacing = styled(InfoCircleOutlined)`
	margin: 0.3em;
`;

const LabelWithTooltip = function component(props) {
	const {
		label,
		tooltip,
	} = props;

	return (
		<>
			<span>{label}</span>
			{' '}
			<Tooltip title={tooltip}>
				<IconWithSpacing />
			</Tooltip>
		</>
	);
};

// consider string or element
// https://reactjs.org/docs/typechecking-with-proptypes.html
LabelWithTooltip.propTypes = {
	label: PropTypes.string.isRequired,
	tooltip: PropTypes.string.isRequired,
};

export default LabelWithTooltip;
