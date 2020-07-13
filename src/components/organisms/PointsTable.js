import React from 'react';
import { Table, Tooltip } from 'antd';
// import PropTypes from 'prop-types';
import { PointsPropType } from '../../lib/PropTypes';
import { MapLinkIcon } from '../atoms/Icons';

const columns = [
	{
		title: 'Time',
		dataIndex: 'time',
		key: 'time',
		render: (value) => value.toLocaleString(),
		defaultSortOrder: 'descend',
		sorter: (a, b) => a.time - b.time,
	},
	{
		title: 'Latitude',
		dataIndex: 'latitude',
		key: 'latitude',
	},
	{
		title: 'Longitude',
		dataIndex: 'longitude',
		key: 'longitude',
	},
	{
		title: 'Altitude',
		dataIndex: 'altitude',
		key: 'altitude',
	},
	{
		title: 'HDOP',
		dataIndex: 'hdop',
		key: 'hdop',
		sorter: (a, b) => a.hdop - b.hdop,
	},
	{
		title: 'Satelites',
		dataIndex: 'sats',
		key: 'sats',
		sorter: (a, b) => a.sats - b.sats,
	},
	{
		title: 'Device Id',
		dataIndex: 'deviceId',
		key: 'deviceId',
		sorter: (a, b) => a.deviceId.localeCompare(b.deviceId),
	},
	{
		title: 'Map',
		key: 'actions',
		render: (text, record) => (
			<>
				{record.latitude && record.longitude && (
					<Tooltip title="Open in Google maps">
						<a target="_blank" rel="noopener noreferrer" href={`http://maps.google.com/maps?z=15&q=loc:${record.latitude}+${record.longitude}`}>
							<MapLinkIcon />
						</a>
					</Tooltip>
				)}
			</>
		),
	},
];

class PointsTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		const { points } = this.props;

		return (
			<Table dataSource={points} columns={columns} />
		);
	}
}

PointsTable.defaultProps = {
	points: [],
}

PointsTable.propTypes = {
	points: PointsPropType,
};

export default PointsTable;
