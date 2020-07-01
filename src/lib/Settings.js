const CONSTANTS = {
	STORAGE_KEY_PREFIX: 'ttn_',
	SETTINGS: {
		GOOGLE_API_KEY: 'googleApiKey',
		MAP_BOX_ACCESS_TOKEN: 'mapBoxAccessToken',
		DATA_SOURCE: 'dataSource',
		CUSTOM_DATA_URL: 'customDataUrl',
		TTN_APPLICATION_ID: 'ttnApplicationId',
		TTN_DEVICE_ID: 'ttnDeviceId',
		TTN_ACCESS_KEY: 'ttnAccessKey',
		TTN_CORS_PROXY_URL: 'ttnCorsProxyUrl',
		TTN_QUERY_LAST: 'ttnQueryLast',
		MAX_POINTS_TO_RENDER_ON_MAP: 'maxPointsToRenderOnMap',
	},
};

function getKey(key) {
	return `${CONSTANTS.STORAGE_KEY_PREFIX}${key}`;
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

class Settings {
	// serialization
	static serialize() {
		// take values from local storage and store them in a url parameter encoded string
		const settings = [];
		Object.values(CONSTANTS.SETTINGS).forEach((settingKey) => {
			const val = localStorage.getItem(getKey(settingKey));
			if (val !== null && val !== '' && val !== undefined) {
				settings.push(`${settingKey}=${encodeURIComponent(val)}`);
			}
		});
		return settings.join('&');
	}

	static deserialize(data) {
		// store in localStorage
		const settings = data.split('&');
		const possibleSettings = Object.values(CONSTANTS.SETTINGS);
		settings.forEach((settingPair) => {
			const pair = settingPair.split('=');
			if (pair.length === 2 && possibleSettings.includes(pair[0])) {
				localStorage.setItem(getKey(pair[0]), decodeURIComponent(pair[1]));
			}
		});
	}

	// access individual properties
	/*
	static getGoogleApiKey() {
		return localStorage.getItem(getKey(CONSTANTS.SETTINGS.GOOGLE_API_KEY));
	}

	static setGoogleApiKey(value) {
		localStorage.setItem(getKey(CONSTANTS.SETTINGS.GOOGLE_API_KEY), value);
	}

	static getMapBoxAccessToken() {
		return localStorage.getItem(getKey(CONSTANTS.SETTINGS.MAP_BOX_ACCESS_TOKEN));
	}

	static setMapBoxAccessToken(value) {
		localStorage.setItem(getKey(CONSTANTS.SETTINGS.MAP_BOX_ACCESS_TOKEN), value);
	}
	*/
}

function nullToUndefined(v) {
	return v === null ? undefined : v;
}

// dynamically add get and set functions for settings
Object.values(CONSTANTS.SETTINGS).forEach((settingKey) => {
	Settings[`get${capitalizeFirstLetter(settingKey)}`] = () => nullToUndefined(localStorage.getItem(getKey(settingKey)));
	Settings[`set${capitalizeFirstLetter(settingKey)}`] = (value) => (value !== null ? localStorage.setItem(getKey(settingKey), value) : localStorage.removeItem(getKey(settingKey)));
});

export default Settings;
