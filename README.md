# TTN Tracker Locator

This is an HTML5 app that shows you in real-time where a GPS tracker is located relative to your location. The information about the tracker is pulled from TTN (The Things Network) LoRaWan system.

This app takes into consideration your own location and heading as opposed to alternatives which show the tracker's absolute position on a map. Mostly useful when the target is at a distance of a few hundred meters (~600ft).

Work in progress. Looking to get contributions and feedback.

Please read https://blog.yavilevich.com/2020/12/real-time-location-tracking-of-individuals-or-things-that-are-important-to-you/ which is a de facto documentation/reference for this project.

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
