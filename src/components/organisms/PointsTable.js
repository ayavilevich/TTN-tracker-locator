import React from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';

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
			<a target="_blank" rel="noopener noreferrer" href={`http://maps.google.com/maps?z=15&q=loc:${record.latitude}+${record.longitude}`}>Open in Google maps</a>
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
	points: PropTypes.arrayOf(PropTypes.shape({
		time: PropTypes.instanceOf(Date).isRequired,
		deviceId: PropTypes.string,
		altitude: PropTypes.number,
		latitude: PropTypes.number,
		longitude: PropTypes.number,
		hdop: PropTypes.number,
		sats: PropTypes.number,
	})),
};

export default PointsTable;
