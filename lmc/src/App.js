import lineString from "turf-linestring";
import bezierSpline from "@turf/bezier-spline";
import { featureCollection, point } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import * as turf from '@turf/turf';
import DATA from './assets/data/coordinates.json'

const dataset = DATA.dataset2
const originalCoordinates = dataset.coordinates
const controlledCoordinate = dataset.controller

function geoJsonToListOfPoints(geoJson={}) {
  const pointList = [...(geoJson?.geometry?.coordinates??[])]
  return pointList;
}

function isCoordinateInList(coordinate, coordinateList) {
  return coordinateList.some((item) => {
    return item[0] === coordinate[0] && item[1] === coordinate[1];
  });
}

function lookupCoordinatesInList(originalCoordinates=[], bigCoordinateList=[]) {
  for (const coordinate of originalCoordinates) {
    if (isCoordinateInList(coordinate, bigCoordinateList)) {
      console.log(`Coordinate ${coordinate} is present in the big list.`);
    } else {
      console.log(`Coordinate ${coordinate} is not present in the big list.`);
    }
  }
}

function distanceCalculator(from, to) {
  var distance = turf.distance(from, to, {units: 'meters'});
  return distance
}

function distanceRatioCalculator(boundaryStart, center, boundaryEnd) {
  return distanceCalculator(boundaryStart, center) / distanceCalculator(center, boundaryEnd)
}

function App() {
  const curved = bezierSpline(lineString([...originalCoordinates]));
  const listCurvedCoordinates = geoJsonToListOfPoints(curved)
  const ratio012 = distanceRatioCalculator(originalCoordinates.at(0), originalCoordinates.at(1), originalCoordinates.at(2));
  const ratio234 = distanceRatioCalculator(originalCoordinates.at(2), originalCoordinates.at(3), originalCoordinates.at(4));
  console.log(`Original ratios: ${ratio012}, ${ratio234}`)

  // adjusting the curved path
  const adjustedCoordinates = [
    originalCoordinates.at(0), controlledCoordinate, originalCoordinates.at(-1)
  ]
  const adjustedCurved = bezierSpline(lineString([...adjustedCoordinates]), {resolution: 10000});
  const listAdjustedCurvedCoordinates = geoJsonToListOfPoints(adjustedCurved)
  console.log(listAdjustedCurvedCoordinates.length)
  listAdjustedCurvedCoordinates.forEach((eachCoordinate) => {
    const firstRatio = distanceRatioCalculator(adjustedCoordinates.at(0), eachCoordinate, adjustedCoordinates.at(1))
    const secondRatio = distanceRatioCalculator(adjustedCoordinates.at(1), eachCoordinate, adjustedCoordinates.at(2))
    console.log(`${eachCoordinate} -> ${firstRatio}, ${secondRatio}`)
  })

  return (
    <div className="">
      {JSON.stringify(curved)}
    </div>
  );
}

export default App;
