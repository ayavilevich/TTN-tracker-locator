import React from 'react';
import styled from 'styled-components';
import { Button, Popover, notification } from 'antd';
import 'antd/dist/antd.css';
import { ReloadOutlined, SettingOutlined, DashboardOutlined } from '@ant-design/icons';
import { HashGet } from 'hashget'

import Locator from './components/organisms/Locator';
import Settings from './components/organisms/Settings';
import PointsTable from './components/organisms/PointsTable';
import SettingsProvider from './lib/Settings';
import GLOBAL_CONSTANTS from './lib/Constants';
import PayloadProcessing from './lib/PayloadProcessing';
// import './App.css';

const CONSTANTS = {
	SETTINGS_HASH_PARAM: 'settings',
};

const AppContainer = styled.div`
	text-align: center;
	background-color: #282c34;
	min-height: 100vh;
	font-size: calc(10px + 2vmin);
	color: white;
`;
const Navigation = styled.nav`
	text-align: center;
	position: absolute;
	z-index: 100;
	width: 100%;
`;

class App extends React.Component {
	constructor(props) {
		super(props);
		// see if need to load persistent settings from url
		const hashParser = new HashGet();
		if (hashParser.has(CONSTANTS.SETTINGS_HASH_PARAM)) {
			const serializedSettings = hashParser.getValue(CONSTANTS.SETTINGS_HASH_PARAM);
			console.log('loading settings from hash', serializedSettings);
			SettingsProvider.deserialize(decodeURIComponent(serializedSettings));
		}
		// init state
		// parse format for some settings
		const maxPointsToRenderOnMap = SettingsProvider.getMaxPointsToRenderOnMap()
		this.state = {
			loadingData: false,
			settingsVisible: false,
			pointsTableVisible: false,
			points: [],
			// persistent settings
			googleApiKey: SettingsProvider.getGoogleApiKey(),
			mapBoxAccessToken: SettingsProvider.getMapBoxAccessToken(),
			dataSource: SettingsProvider.getDataSource(),
			customDataUrl: SettingsProvider.getCustomDataUrl(),
			ttnApplicationId: SettingsProvider.getTtnApplicationId(),
			ttnDeviceId: SettingsProvider.getTtnDeviceId(),
			ttnAccessKey: SettingsProvider.getTtnAccessKey(),
			ttnCorsProxyUrl: SettingsProvider.getTtnCorsProxyUrl(),
			ttnQueryLast: SettingsProvider.getTtnQueryLast(),
			maxPointsToRenderOnMap: maxPointsToRenderOnMap !== undefined ? parseInt(maxPointsToRenderOnMap, 10) : maxPointsToRenderOnMap,
		};
	}

	handleSettingsFinish = (values) => {
		const { googleApiKey } = this.state;

		// check finish success or failure
		if (!values) { // finish without apply
			this.setState({
				settingsVisible: false,
			});
			return;
		}

		// save values
		SettingsProvider.setGoogleApiKey(values.googleApiKey);
		SettingsProvider.setMapBoxAccessToken(values.mapBoxAccessToken);
		SettingsProvider.setDataSource(values.dataSource);
		SettingsProvider.setCustomDataUrl(values.customDataUrl);
		SettingsProvider.setTtnApplicationId(values.ttnApplicationId);
		SettingsProvider.setTtnDeviceId(values.ttnDeviceId);
		SettingsProvider.setTtnAccessKey(values.ttnAccessKey);
		SettingsProvider.setTtnCorsProxyUrl(values.ttnCorsProxyUrl);
		SettingsProvider.setTtnQueryLast(values.ttnQueryLast);
		SettingsProvider.setMaxPointsToRenderOnMap(values.maxPointsToRenderOnMap);

		// special case, check for google api key change
		// Google API key change requires a reload because the key is part of a JS url that is added to the page
		// further, it didn't work in componentDidUpdate under the HOC, needs to be above (Locator or App)
		if (googleApiKey !== values.googleApiKey) {
			console.log('handleSettingsFinish, reload');
			window.location.reload();
			return;
		}

		// update state
		this.setState({
			settingsVisible: false,
			googleApiKey: values.googleApiKey,
			mapBoxAccessToken: values.mapBoxAccessToken,
			dataSource: values.dataSource,
			customDataUrl: values.customDataUrl,
			ttnApplicationId: values.ttnApplicationId,
			ttnDeviceId: values.ttnDeviceId,
			ttnAccessKey: values.ttnAccessKey,
			ttnCorsProxyUrl: values.ttnCorsProxyUrl,
			ttnQueryLast: values.ttnQueryLast,
			maxPointsToRenderOnMap: values.maxPointsToRenderOnMap,
		});
	}

	handleLoadData = () => {
		const { loadingData } = this.state;
		if (loadingData) {
			return; // don't load another time in parallel
		}
		console.log('handle fetch');
		this.setState({ loadingData: true });
		this.fetchData()
			.then((response) => {
				// check errors
				if (response.ok) {
					if (response.status === 204) {
						return [];
					}
					// should we handle non json response?
					return response.json();
				}
				// show issue
				if (response.status === 0) {
					notification.error({
						message: 'Unable to get response',
						description: 'Are there CORS limitations in place?',
					});
				} else {
					notification.error({
						message: 'Error code reported',
						description: response.statusText,
					});
				}
				this.setState({ loadingData: false });
				return null; // will pass 'null' as data for next processor in the chain
			})
			.then((data) => {
				if (data) {
					// do something
					this.processLocationData(data);
				}
				this.setState({ loadingData: false });
			})
			.catch((error) => {
				console.error(error);
				notification.error({
					message: 'Error loading data',
					description: error.toString(),
				});
				this.setState({ loadingData: false });
			});
		// setTimeout(() => { this.setState({ loadingData: false }); }, 5000);
	};

	processLocationData(data) {
		console.log('Got data', data.length, data);

		try {
			const points = data.map(PayloadProcessing.preProcessSample);
			this.setState({ points });
		} catch (error) {
			notification.error({
				message: 'Error parsing data',
				description: error.toString(),
			});
		}
	}

	fetchData() {
		const {
			dataSource, customDataUrl, ttnApplicationId, ttnDeviceId, ttnAccessKey, ttnCorsProxyUrl, ttnQueryLast,
		} = this.state;
		if (dataSource === GLOBAL_CONSTANTS.DATA_SOURCE.CUSTOM) {
			return fetch(customDataUrl, {
				// mode: 'no-cors', // you get no content with this
			});
		}
		if (dataSource === GLOBAL_CONSTANTS.DATA_SOURCE.TTN) {
			const myHeaders = new Headers();
			myHeaders.append('Accept', 'application/json');
			myHeaders.append('Authorization', `key ${ttnAccessKey}`);
			return fetch(`${ttnCorsProxyUrl}https://${ttnApplicationId}.data.thethingsnetwork.org/api/v2/query/${ttnDeviceId}?last=${ttnQueryLast}`, {
				headers: myHeaders,
			}); // TODO, make "last" configurable
		}
		// else, error
		return new Promise((resolve, reject) => {
			reject(new Error('Data source is not configured'));
		});
	}

	render() {
		const {
			loadingData, settingsVisible, pointsTableVisible, points,
			googleApiKey, mapBoxAccessToken,
			dataSource, customDataUrl, ttnApplicationId, ttnDeviceId, ttnAccessKey, ttnCorsProxyUrl, ttnQueryLast,
			maxPointsToRenderOnMap,
		} = this.state;

		// get subset of points
		const validPoints = points.filter((point) => typeof point.latitude === 'number' && typeof point.longitude === 'number');
		let pointsToRenderOnMap = [];
		if (points.length) {
			if (points.length > maxPointsToRenderOnMap) {
				// assume sorted by time
				// assume older entries are first
				pointsToRenderOnMap = validPoints.slice(-maxPointsToRenderOnMap);
			} else {
				pointsToRenderOnMap = validPoints;
			}
		}
		console.log('points for map', points.length, validPoints.length, pointsToRenderOnMap.length);

		return (
			<AppContainer>
				<Navigation>
					<Button loading={loadingData} onClick={this.handleLoadData} icon={<ReloadOutlined />}>Reload data</Button>

					<Popover
						placement="bottom"
						title="Data"
						visible={pointsTableVisible}
						content={(
							<PointsTable
								points={points}
							/>
						)}
						trigger="click"
						onVisibleChange={(visible) => { this.setState({ pointsTableVisible: visible }); }}
					>
						<Button icon={<DashboardOutlined />}>Data</Button>
					</Popover>

					<Popover
						placement="bottom"
						title="Settings"
						visible={settingsVisible}
						content={(
							<Settings
								onFinish={this.handleSettingsFinish}
								serializedSettings={`${CONSTANTS.SETTINGS_HASH_PARAM}=${encodeURIComponent(SettingsProvider.serialize())}`}
								googleApiKey={googleApiKey}
								mapBoxAccessToken={mapBoxAccessToken}
								dataSource={dataSource}
								customDataUrl={customDataUrl}
								ttnApplicationId={ttnApplicationId}
								ttnDeviceId={ttnDeviceId}
								ttnAccessKey={ttnAccessKey}
								ttnCorsProxyUrl={ttnCorsProxyUrl}
								ttnQueryLast={ttnQueryLast}
								maxPointsToRenderOnMap={maxPointsToRenderOnMap}
							/>
						)}
						trigger="click"
						onVisibleChange={() => { this.setState({ settingsVisible: true /* Force closing with save or cancel causing onFinish */ }) }}
					>
						<Button icon={<SettingOutlined />}>Settings</Button>
					</Popover>
				</Navigation>
				<Locator
					googleApiKey={googleApiKey}
					mapBoxAccessToken={mapBoxAccessToken}
					points={pointsToRenderOnMap}
				/>
			</AppContainer>
		);
	}
}

export default App;
