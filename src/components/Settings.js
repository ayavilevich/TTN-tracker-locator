import React from 'react';
import PropTypes from 'prop-types';
import {
	Form,
	Input,
	Button,
	// Checkbox
} from 'antd';

class Settings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
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

	render() {
		const { googleApiKey, mapBoxAccessToken, serializedSettings } = this.props;

		return (
			<>
				<Form
					name="basic"
					labelCol={{ span: 12 }}
					wrapperCol={{ span: 24 }}
					onFinish={this.onFinish}
					onFinishFailed={this.onFinishFailed}
				>
					<Form.Item
						label="Google API key"
						name="googleApiKey"
						initialValue={googleApiKey}
						rules={[{ required: false, message: 'For using Google Maps map' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="MapBox access token"
						name="mapBoxAccessToken"
						initialValue={mapBoxAccessToken}
						rules={[{ required: false, message: 'For using MapBox map' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 12, span: 24 }}>
						<>
							<Button type="primary" htmlType="submit">
								Save
							</Button>
							<Button onClick={() => { const { onFinish } = this.props; onFinish(); }}>
								Cancel
							</Button>
						</>
					</Form.Item>
				</Form>
				<a href={`#${serializedSettings}`}>Direct url to current configuration</a>
			</>
		);
	}
}

Settings.propTypes = {
	onFinish: PropTypes.func.isRequired,
	serializedSettings: PropTypes.string.isRequired,
	mapBoxAccessToken: PropTypes.string.isRequired,
	googleApiKey: PropTypes.string.isRequired,
};

export default Settings;
