import React from 'react';
import styled from 'styled-components';
import { Button, Popover, notification } from 'antd';
import 'antd/dist/antd.css';
import { HashGet } from 'hashget';
import { DataIcon, ReloadIcon, SettingsIcon } from './components/atoms/Icons';

import Locator from './components/organisms/Locator';
import Settings from './components/organisms/Settings';
import PointsTable from './components/organisms/PointsTable';
import SettingsProvider from './lib/Settings';
import GLOBAL_CONSTANTS from './lib/Constants';
import PayloadProcessing from './lib/PayloadProcessing';
// import './App.css';

// log start
console.log(process.env.NODE_ENV, process.env);

const CONSTANTS = {
	HASH_PARAMS: {
		SETTINGS: 'settings',
		DEMO_LATITUDE_OFFSET: 'demo_lat',
		DEMO_LONGITUDE_OFFSET: 'demo_long',
	},
};

const AppContainer = styled.div`
	text-align: center;
	background-color: #282c34;
	min-height: 100vh;
	font-size: calc(10px + 2vmin);
	color: white;
`;
const CommandsBar = styled.nav`
	text-align: center;
	position: absolute;
	z-index: 100;
	width: 100%;
`;

class App extends React.Component {
	constructor(props) {
		super(props);
		const hashParser = new HashGet();
		// see if need to load some non-persistent settings from url (test, demo, etc)
		let demoLatitudeOffset = 0;
		let demoLongitudeOffset = 0;
		if (hashParser.has(CONSTANTS.HASH_PARAMS.DEMO_LATITUDE_OFFSET)) {
			demoLatitudeOffset = parseFloat(hashParser.getValue(CONSTANTS.HASH_PARAMS.DEMO_LATITUDE_OFFSET), 10);
		}
		if (hashParser.has(CONSTANTS.HASH_PARAMS.DEMO_LONGITUDE_OFFSET)) {
			demoLongitudeOffset = parseFloat(hashParser.getValue(CONSTANTS.HASH_PARAMS.DEMO_LONGITUDE_OFFSET), 10);
		}
		// see if need to load persistent settings from url
		if (hashParser.has(CONSTANTS.HASH_PARAMS.SETTINGS)) {
			const serializedSettings = hashParser.getValue(CONSTANTS.HASH_PARAMS.SETTINGS);
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
			// non persistent settings
			demoLatitudeOffset,
			demoLongitudeOffset,
			// persistent settings
			googleApiKey: SettingsProvider.getGoogleApiKey(),
			mapBoxAccessToken: SettingsProvider.getMapBoxAccessToken() || process.env.REACT_APP_DEFAULT_MAP_BOX_ACCESS_TOKEN,
			dataSource: SettingsProvider.getDataSource(),
			customDataUrl: SettingsProvider.getCustomDataUrl(),
			ttnApplicationId: SettingsProvider.getTtnApplicationId(),
			ttnDeviceId: SettingsProvider.getTtnDeviceId(),
			ttnAccessKey: SettingsProvider.getTtnAccessKey(),
			ttnCorsProxyUrl: SettingsProvider.getTtnCorsProxyUrl() || process.env.REACT_APP_DEFAULT_TTN_CORS_PROXY_URL,
			ttnQueryLast: SettingsProvider.getTtnQueryLast(),
			maxPointsToRenderOnMap: maxPointsToRenderOnMap !== undefined ? parseInt(maxPointsToRenderOnMap, 10) : maxPointsToRenderOnMap,
		};
	}

	componentDidMount() {
		// initial load
		this.handleLoadData();
	}

	componentDidUpdate(prevProps, prevState) {
		const {
			dataSource, customDataUrl, ttnApplicationId, ttnDeviceId, ttnAccessKey, ttnCorsProxyUrl, ttnQueryLast,
		} = this.state;
		// check if we need to reload the data
		if (prevState.dataSource !== dataSource || prevState.customDataUrl !== customDataUrl || prevState.ttnApplicationId !== ttnApplicationId
			|| prevState.ttnDeviceId !== ttnDeviceId || prevState.ttnAccessKey !== ttnAccessKey || prevState.ttnCorsProxyUrl !== ttnCorsProxyUrl || prevState.ttnQueryLast !== ttnQueryLast) {
			this.handleLoadData();
		}
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
			demoLatitudeOffset, demoLongitudeOffset,
		} = this.state;

		return (
			<AppContainer>
				<CommandsBar>
					<Button loading={loadingData} onClick={this.handleLoadData} icon={<ReloadIcon />}>Reload data</Button>

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
						<Button icon={<DataIcon />}>Data</Button>
					</Popover>

					<Popover
						placement="bottom"
						title="Settings"
						visible={settingsVisible}
						content={(
							<Settings
								onFinish={this.handleSettingsFinish}
								serializedSettings={`${CONSTANTS.HASH_PARAMS.SETTINGS}=${encodeURIComponent(SettingsProvider.serialize())}`}
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
						<Button icon={<SettingsIcon />}>Settings</Button>
					</Popover>
				</CommandsBar>
				<Locator
					googleApiKey={googleApiKey}
					mapBoxAccessToken={mapBoxAccessToken}
					points={points}
					maxPointsToRenderOnMap={maxPointsToRenderOnMap}
					demoLatitudeOffset={demoLatitudeOffset}
					demoLongitudeOffset={demoLongitudeOffset}
				/>
			</AppContainer>
		);
	}
}

export default App;
