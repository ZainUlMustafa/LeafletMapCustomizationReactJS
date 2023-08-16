import lineString from "turf-linestring";
import bezierSpline from "@turf/bezier-spline";

function geojsonToCoordinateList(geojson) {
  const coordinates = [];

  function extractCoordinates(geometry) {
    if (geometry.type === 'Point') {
      coordinates.push(geometry.coordinates);
    } else if (geometry.type === 'LineString' || geometry.type === 'Polygon') {
      geometry.coordinates.forEach(coord => coordinates.push(coord));
    } else if (geometry.type === 'MultiPoint' || geometry.type === 'MultiLineString' || geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(subCoords => {
        if (Array.isArray(subCoords[0])) {
          subCoords.forEach(coord => coordinates.push(coord));
        } else {
          coordinates.push(subCoords);
        }
      });
    }
  }

  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach(feature => extractCoordinates(feature.geometry));
  } else {
    extractCoordinates(geojson);
  }

  return coordinates;
}

function App() {
  var line = lineString([
    //   [-76.091308, 18.427501],
    // [-76.695556, 18.729501],
    // [-76.552734, 19.40443],
    // [-74.61914, 19.134789],
    // [-73.652343, 20.07657],
    // [-73.157958, 20.21066]
    [67.067038, 24.882108],
    [67.066971, 24.882209],
    [67.067015, 24.882412],
    [67.067227, 24.882538],
    [67.067449, 24.882496],
    [67.067573, 24.882317],
    [67.067533, 24.882119],
    [67.067274, 24.881999]
  ]);

  var curved = bezierSpline(line);
  const listCoor = geojsonToCoordinateList(curved)

  return (
    <div className="">
      {JSON.stringify(curved)}
    </div>
  );
}

export default App;
