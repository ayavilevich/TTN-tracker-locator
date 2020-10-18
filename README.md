# TTN Tracker Locator

This is an HTML5 app that shows you in real-time where a GPS tracker is located relative to your location. The information about the tracker is pulled from TTN (The Things Network) LoRaWan system.

This takes into consideration your own location and heading as opposed to alternatives which show the tracker's absolute position on a map. Mostly useful when the target is at a distance of a few hundred meters (~600ft).

Work in progress. Looking to get contributions and feedback.

## Usage instructions

You need to have a working LoRa tracker (such as LGT-92 or something DIY such as a TTGO T-BEAM running ESP32-Paxcounter).  
The tracker has to report to a TTN application.  
You need to have Latitude and Longitude information properly parsed in the payload.  
You need to enable “Data Storage” integration for the application.  
Next go to https://ayavilevich.github.io/TTN-tracker-locator/  
In “settings”, provide the relevant TTN application id, TTN device id and a TTN access token.  
Best practice would be to create a dedicated access token for this use. The settings are stored locally in the browser. This app has no back-end of its own.  
Adjust other optional properties in “settings”, save and reload data in the main screen.  

If everything is working you would get the recent path of the tracker relative to your position and orientation. If something doesn’t work, troubleshoot in the “data” screen or using TTN console. If you want to report an issue please do so in the repository.

The https://ayavilevich.github.io/TTN-tracker-locator/ is a build that I host, pre-configured with a matching CORS proxy and a MapBox access token so you don't need to get your own. If you want to host your own version make sure to supply these resources on your own.

## Known issues

On Firefox there is no compass data (your heading if fixed) - workaround, use Chrome  
If using Google map as map provider, map is not rotating - limitation of Google Maps - workaround, use MapBox  
On Chrome and using Google map as map provider, markers are flashing - workaround, use MapBox  

All kinds of visual glitches and UX difficulties, especially on mobile devices.

## TODO

Auto reload data  
Add support for several trackers at once.  

# React generator notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
