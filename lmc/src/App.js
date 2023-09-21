import lineString from "turf-linestring";
import bezierSpline from "@turf/bezier-spline";
import { featureCollection, point } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import * as turf from '@turf/turf';
import DATA from './assets/data/coordinates.json'

const dataset = DATA.datasets.dataset2
const originalCoordinates = dataset.coordinates
const controlledCoordinate = dataset.controller

function geoJsonToListOfPoints(geoJson={}) {
  const pointList = [...(geoJson?.geometry?.coordinates??[])]
  return pointList;
}

function isCoordinateInList(coordinate, coordinateList=[]) {
  return coordinateList.some((item) => {
    return item[0] === coordinate[0] && item[1] === coordinate[1];
  });
}

function findIndexOfCoordinate(coordinate, coordinateList=[]) {
  return coordinateList.findIndex((item) => {
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
  var distance = turf.distance(from, to, {units: DATA.config.units});
  // console.log(`Distance between ${from} and ${to} is ${distance}`)
  return distance
}

function distanceRatioCalculator(boundaryStart, center, boundaryEnd) {
  // console.log(`Distance Ratio: ${distanceCalculator(boundaryStart, center)} / ${distanceCalculator(center, boundaryEnd)}`)
  return distanceCalculator(boundaryStart, center) / distanceCalculator(center, boundaryEnd)
}

function App() {
  const curved = bezierSpline(lineString([...originalCoordinates]));
  const listCurvedCoordinates = geoJsonToListOfPoints(curved)
  const originalRatios = {
    first: distanceRatioCalculator(originalCoordinates.at(0), originalCoordinates.at(1), originalCoordinates.at(2)),
    second: distanceRatioCalculator(originalCoordinates.at(2), originalCoordinates.at(3), originalCoordinates.at(4))
  }
  console.log(`Original ratios:`, originalRatios)

  // adjusting the curved path
  const adjustedCoordinates = [originalCoordinates.at(0), controlledCoordinate, originalCoordinates.at(-1)]
  const adjustedCurved = bezierSpline(lineString([...adjustedCoordinates]), {resolution: DATA.config.precision});
  const listAdjustedCurvedCoordinates = geoJsonToListOfPoints(adjustedCurved)

  const controlledCoordinateIndexInInterpolatedList = findIndexOfCoordinate(controlledCoordinate, listAdjustedCurvedCoordinates)
  // console.log(listAdjustedCurvedCoordinates.length, controlledCoordinateIndexInInterpolatedList)

  // divide search
  const firstAdjustedCoordinate = [...listAdjustedCurvedCoordinates].splice(0, controlledCoordinateIndexInInterpolatedList).map((eachCoordinate) => {
    const ratio = distanceRatioCalculator(adjustedCoordinates.at(0), eachCoordinate, adjustedCoordinates.at(1))
    return {ratio: ratio, coordinate: eachCoordinate, diff: Math.abs(ratio - originalRatios.first)}
  }).sort((a, b) => a.diff - b.diff)[0]

  const secondAdjustedCoordinate = [...listAdjustedCurvedCoordinates].splice(controlledCoordinateIndexInInterpolatedList).map((eachCoordinate) => {
    const ratio = distanceRatioCalculator(adjustedCoordinates.at(1), eachCoordinate, adjustedCoordinates.at(2))
    return {ratio: ratio, coordinate: eachCoordinate, diff: Math.abs(ratio - originalRatios.second)}
  }).sort((a, b) => a.diff - b.diff)[0]

  console.log(firstAdjustedCoordinate)
  console.log(secondAdjustedCoordinate)

  return (
    <div className="">
      {JSON.stringify(curved)}
    </div>
  );
}

export default App;
