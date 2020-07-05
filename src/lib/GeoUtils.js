class GeoUtils {
	static normalizeHeading(heading) {
		if (heading > 180) {
			return heading - 360;
		}
		if (heading < -180) {
			return heading + 360;
		}
		return heading;
	}
}

export default GeoUtils;
