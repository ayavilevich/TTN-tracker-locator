import React from 'react';
import { Button, Popover } from 'antd';
import 'antd/dist/antd.css';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { HashGet } from 'hashget'

// import logo from './logo.svg';
import Locator from './components/Locator';
import Settings from './components/Settings';
import SettingsProvider from './lib/Settings';
import './App.css';

const CONSTANTS = {
	SETTINGS_HASH_PARAM: 'settings',
};

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
		this.state = {
			loadingData: false,
			settingsVisible: false,
			googleApiKey: SettingsProvider.getGoogleApiKey(),
			mapBoxAccessToken: SettingsProvider.getMapBoxAccessToken(),
		};
	}

	handleLoadData = () => {
		console.log('handle');
		this.setState({ loadingData: true });
		setTimeout(() => { this.setState({ loadingData: false }); }, 5000);
	};

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

		// special case, check for google api key change
		// Google API key change requires a reload because the key is part of a JS url that is added to the page
		// further, it didn't work in componentDidUpdate under the HOC, needs to be here, above
		if (googleApiKey !== values.getGoogleApiKey) {
			console.log('handleSettingsFinish, reload');
			window.location.reload();
			return;
		}

		// update state
		this.setState({
			settingsVisible: false,
			googleApiKey: values.googleApiKey,
			mapBoxAccessToken: values.mapBoxAccessToken,
		});
	}

	render() {
		const {
			loadingData, settingsVisible, googleApiKey, mapBoxAccessToken,
		} = this.state;

		return (
			<div className="App">
				<nav>
					<Button loading={loadingData} onClick={this.handleLoadData} icon={<ReloadOutlined />}>Reload data</Button>
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
							/>
						)}
						trigger="click"
						onVisibleChange={() => { this.setState({ settingsVisible: true }) }}
					>
						<Button icon={<SettingOutlined />}>Settings</Button>
					</Popover>
				</nav>
				<Locator
					className="Locator"
					googleApiKey={googleApiKey}
					mapBoxAccessToken={mapBoxAccessToken}
				/>
			</div>
		);
	}
}

export default App;
