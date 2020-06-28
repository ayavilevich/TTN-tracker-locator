const CONSTANTS = {
	STORAGE_KEY_PREFIX: 'ttn_',
	SETTINGS: {
		GOOGLE_API_KEY: 'googleApiKey',
		MAP_BOX_ACCESS_TOKEN: 'mapBoxAccessToken',
	},
};

function getKey(key) {
	return `${CONSTANTS.STORAGE_KEY_PREFIX}${key}`;
}

class Settings {
	// serialization
	static serialize() {
		// take values from local storage and store them in a url parameter encoded string
		const settings = [];
		Object.keys(CONSTANTS.SETTINGS).forEach((settingKey) => {
			const val = localStorage.getItem(getKey(CONSTANTS.SETTINGS[settingKey]));
			settings.push(`${CONSTANTS.SETTINGS[settingKey]}=${encodeURIComponent(val)}`);
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
}

export default Settings;
