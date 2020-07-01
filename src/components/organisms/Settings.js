import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
	Form,
	Input,
	InputNumber,
	Button,
	Radio,
	// Checkbox
} from 'antd';
import LabelWithTooltip from '../molecules/LabelWithTooltip';
import GLOBAL_CONSTANTS from '../../lib/Constants';

const CONSTANTS = {
	DEFAULT_CORS_PROXY: 'https://cors-anywhere.herokuapp.com/',
	DEFAULT_QUERY_LAST: '10m',
	DEFAULT_MAX_POINTS: 10,
};

// form wouldn't grow the parent on its own
const WideForm = styled(Form)`
	width: 45em;
`;

const mustBeSetIfDataSourceIsTtn = ({ getFieldValue }) => ({
	validator(rule, value) {
		if (value || getFieldValue('dataSource') !== GLOBAL_CONSTANTS.DATA_SOURCE.TTN) {
			return Promise.resolve();
		}
		return Promise.reject(Error(''));
	},
	message: 'Value must be provided if data source is TTN',
})

class Settings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: props.dataSource,
		};
	}

	onFinish = (values) => {
		const { onFinish } = this.props;
		// log
		console.log('Success:', values);
		// pass event higher
		onFinish(values);
	};

	onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	onValuesChange = (changedValues, allValues) => {
		console.log('onValuesChange:', changedValues, allValues);
		if (typeof changedValues.dataSource === 'string') { // if data source changed
			this.setState({ dataSource: changedValues.dataSource }); // update state
		}
	};

	render() {
		const {
			googleApiKey, mapBoxAccessToken, serializedSettings,
			customDataUrl, ttnApplicationId, ttnDeviceId, ttnAccessKey, ttnCorsProxyUrl, ttnQueryLast,
			maxPointsToRenderOnMap,
		} = this.props;
		const { dataSource } = this.state;

		return (
			<>
				<WideForm
					name="basic"
					labelCol={{ span: 12 }}
					wrapperCol={{ span: 12 }}
					onFinish={this.onFinish}
					onFinishFailed={this.onFinishFailed}
					onValuesChange={this.onValuesChange}
				>
					<Form.Item
						label={<LabelWithTooltip label="MapBox access token" tooltip="This is the preferred type of map that rotates in sync with your heading" />}
						name="mapBoxAccessToken"
						initialValue={mapBoxAccessToken}
						dependencies={['googleApiKey']}
						rules={[
							({ getFieldValue }) => ({
								validator(rule, value) {
									if (value || getFieldValue('googleApiKey')) {
										return Promise.resolve();
									}
									return Promise.reject(Error(''));
								},
								message: 'Please specify at least one map API key',
							}),
						]}
					>
						<Input placeholder="pk...." />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="Google API key" tooltip="This is another type of map that can be used" />}
						name="googleApiKey"
						initialValue={googleApiKey}
						dependencies={['mapBoxAccessToken']}
						rules={[
							({ getFieldValue }) => ({
								validator(rule, value) {
									if (value || getFieldValue('mapBoxAccessToken')) {
										return Promise.resolve();
									}
									return Promise.reject(Error(''));
								},
								message: 'Please specify at least one map API key',
							}),
						]}
					>
						<Input placeholder="Axxxx...xxx_xxx...xxx" />
					</Form.Item>

					<Form.Item label="Data source" name="dataSource" initialValue={dataSource}>
						<Radio.Group value={dataSource}>
							<Radio.Button value={GLOBAL_CONSTANTS.DATA_SOURCE.TTN}>TTN</Radio.Button>
							<Radio.Button value={GLOBAL_CONSTANTS.DATA_SOURCE.CUSTOM}>Custom</Radio.Button>
						</Radio.Group>
					</Form.Item>

					<Form.Item
						label="Custom data url"
						name="customDataUrl"
						initialValue={customDataUrl}
						hidden={dataSource !== GLOBAL_CONSTANTS.DATA_SOURCE.CUSTOM}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="CORS proxy for TTN" tooltip="You can run your own, see cors-anywhere@github" />}
						name="ttnCorsProxyUrl"
						initialValue={ttnCorsProxyUrl}
						hidden={dataSource !== GLOBAL_CONSTANTS.DATA_SOURCE.TTN}
						dependencies={['dataSource']}
						rules={[mustBeSetIfDataSourceIsTtn]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="TTN application id" tooltip="The id of your TTN application, has to be integrated with the Data Storage integration" />}
						name="ttnApplicationId"
						initialValue={ttnApplicationId}
						hidden={dataSource !== GLOBAL_CONSTANTS.DATA_SOURCE.TTN}
						dependencies={['dataSource']}
						rules={[mustBeSetIfDataSourceIsTtn]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="TTN device id" tooltip="The id of the device you want to locate" />}
						name="ttnDeviceId"
						initialValue={ttnDeviceId}
						hidden={dataSource !== GLOBAL_CONSTANTS.DATA_SOURCE.TTN}
						dependencies={['dataSource']}
						rules={[mustBeSetIfDataSourceIsTtn]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="TTN access key" tooltip="Access key for the TTN application, you can generate a specific one for this use case in the console" />}
						name="ttnAccessKey"
						initialValue={ttnAccessKey}
						hidden={dataSource !== GLOBAL_CONSTANTS.DATA_SOURCE.TTN}
						dependencies={['dataSource']}
						rules={[mustBeSetIfDataSourceIsTtn]}
					>
						<Input placeholder="ttn-account-v2...." />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="TTN query 'last'" tooltip="Duration on which we want to get the data. Examples: 30s, 10m, 1h, 2d, etc" />}
						name="ttnQueryLast"
						initialValue={ttnQueryLast}
						hidden={dataSource !== GLOBAL_CONSTANTS.DATA_SOURCE.TTN}
						dependencies={['dataSource']}
						rules={[mustBeSetIfDataSourceIsTtn]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label={<LabelWithTooltip label="Max number of points to render on map" tooltip="If data source returned more samples then the newest will be rendered" />}
						name="maxPointsToRenderOnMap"
						initialValue={maxPointsToRenderOnMap}
						rules={[{ required: true, message: 'Please set number of points!' }]}
					>
						<InputNumber min={1} max={100} />
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 12, span: 12 }}>
						<>
							<Button type="primary" htmlType="submit">
								Save
							</Button>
							<Button onClick={() => { const { onFinish } = this.props; onFinish(); }}>
								Cancel
							</Button>
						</>
					</Form.Item>
				</WideForm>
				<a href={`#${serializedSettings}`}>Direct url to current configuration</a>
			</>
		);
	}
}

Settings.defaultProps = {
	customDataUrl: '',
	ttnApplicationId: '',
	ttnDeviceId: '',
	ttnAccessKey: '',
	ttnCorsProxyUrl: CONSTANTS.DEFAULT_CORS_PROXY,
	ttnQueryLast: CONSTANTS.DEFAULT_QUERY_LAST,
	maxPointsToRenderOnMap: CONSTANTS.DEFAULT_MAX_POINTS,
};

Settings.propTypes = {
	onFinish: PropTypes.func.isRequired,
	serializedSettings: PropTypes.string.isRequired,
	mapBoxAccessToken: PropTypes.string.isRequired,
	googleApiKey: PropTypes.string.isRequired,
	dataSource: PropTypes.string.isRequired,
	customDataUrl: PropTypes.string,
	ttnApplicationId: PropTypes.string,
	ttnDeviceId: PropTypes.string,
	ttnAccessKey: PropTypes.string,
	ttnCorsProxyUrl: PropTypes.string,
	ttnQueryLast: PropTypes.string,
	maxPointsToRenderOnMap: PropTypes.number,
};

export default Settings;
