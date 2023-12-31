import lineString from "turf-linestring";
import bezierSpline from "@turf/bezier-spline";
import * as turf from '@turf/turf';
import DATA from './assets/data/coordinates.json'
import MapWidget from "./components/MapWidget";
import { useState } from "react";

// Function to convert GeoJSON to a list of points
function geoJsonToListOfPoints(geoJson = {}) {
  const pointList = [...(geoJson?.geometry?.coordinates ?? [])]
  return pointList;
}

// Function to check if a coordinate is present in a list
function isCoordinateInList(coordinate, coordinateList = []) {
  return coordinateList.some((item) => {
    return item[0] === coordinate[0] && item[1] === coordinate[1];
  });
}

// Function to find the index of a coordinate in a list
function findIndexOfCoordinate(coordinate, coordinateList = []) {
  return coordinateList.findIndex((item) => {
    return item[0] === coordinate[0] && item[1] === coordinate[1];
  });
}

// Function to look up coordinates in a list
function lookupCoordinatesInList(originalCoordinates = [], bigCoordinateList = []) {
  for (const coordinate of originalCoordinates) {
    if (isCoordinateInList(coordinate, bigCoordinateList)) {
      console.log(`Coordinate ${coordinate} is present in the big list.`);
    } else {
      console.log(`Coordinate ${coordinate} is not present in the big list.`);
    }
  }
}

// Function to calculate the distance between two points using Turf.js
function distanceCalculator(from, to) {
  var distance = turf.distance(from, to, { units: DATA.config.units });
  return distance
}

// Function to calculate the distance ratio between three points
function distanceRatioCalculator(boundaryStart, center, boundaryEnd) {
  return distanceCalculator(boundaryStart, center) / distanceCalculator(center, boundaryEnd)
}

// Function to find a coordinate with the minimum difference in ratio
function findCoordinateWithMinDifference(coordinates, startIndex, ratioCalculator, targetRatios) {
  return coordinates
    .slice(startIndex)
    .reduce((minDiffCoordinate, eachCoordinate) => {
      const ratio = ratioCalculator(eachCoordinate);
      const diff = Math.abs(ratio - targetRatios);

      if (diff < minDiffCoordinate.diff) {
        return { ratio, coordinate: eachCoordinate, diff };
      }

      return minDiffCoordinate;
    }, { diff: Infinity });
}

function App() {
  const [dataset, setDataset] = useState(DATA.datasets.dataset3)
  const handleChange = (event) => {
    setDataset(DATA.datasets[event.target.value]);
  };

  const originalCoordinates = dataset.coordinates
  const controlledCoordinate = dataset.controller

  const selector = <>
    <div style={{ paddingInline: '15px' }}>
      <label>
        <span style={{ paddingRight: '15px', fontWeight: 'bold' }}>Bezier Coordinate Estimator</span>
        <span style={{ color: 'rgba(0,0,0,0.2)' }}>|</span>
        <span style={{ paddingLeft: '15px' }}>Try a dataset:</span>
        <select style={{ fontSize: '14px', padding: '10px', margin: '10px' }} value={dataset.id} onChange={handleChange}>
          {Object.entries(DATA.datasets).map(([key, value], i) => {
            return <option value={value.id}>{value.name}</option>
          })}
        </select>
      </label>
      <div style={{ float: 'right' }}>
        <p><span style={{color: 'blue', fontWeight: 'bold'}}>Blue:</span> Original path, <span style={{color: 'red', fontWeight: 'bold'}}>Red:</span> Controller coordinate, <span style={{color: 'green', fontWeight: 'bold'}}>Green:</span> Adjusted path</p>
      </div>
    </div>
  </>

  if (originalCoordinates.length < 5) {
    return (
      <>
        {selector}
        <div style={{ padding: '15px' }}>
          <p>Dataset faulty</p>
          <p style={{ color: 'red' }}>Found {originalCoordinates.length} coordinates when expected is 5</p>
        </div>
      </>
    )
  }

  // Calculate a curved path from original coordinates
  const curved = bezierSpline(lineString([...originalCoordinates]));
  const listCurvedCoordinates = geoJsonToListOfPoints(curved)

  // Calculate original distance ratios
  const originalRatios = {
    first: distanceRatioCalculator(originalCoordinates.at(0), originalCoordinates.at(1), originalCoordinates.at(2)),
    second: distanceRatioCalculator(originalCoordinates.at(2), originalCoordinates.at(3), originalCoordinates.at(4))
  }

  // Adjust the curved path by inserting a controlled coordinate
  const adjustedCoordinates = [originalCoordinates.at(0), controlledCoordinate, originalCoordinates.at(-1)]
  const adjustedCurved = bezierSpline(lineString([...adjustedCoordinates]), { resolution: DATA.config.precision });
  const listAdjustedCurvedCoordinates = geoJsonToListOfPoints(adjustedCurved)

  // Find the index of the controlled coordinate in the adjusted list
  const controlledCoordinateIndexInInterpolatedList = findIndexOfCoordinate(controlledCoordinate, listAdjustedCurvedCoordinates)

  // Divide the search into two parts and find adjusted coordinates with minimum difference in ratio
  const firstAdjustedCoordinate = findCoordinateWithMinDifference(
    listAdjustedCurvedCoordinates,
    0,
    (eachCoordinate) =>
      distanceRatioCalculator(adjustedCoordinates.at(0), eachCoordinate, adjustedCoordinates.at(1)),
    originalRatios.first
  );

  const secondAdjustedCoordinate = findCoordinateWithMinDifference(
    listAdjustedCurvedCoordinates,
    controlledCoordinateIndexInInterpolatedList,
    (eachCoordinate) =>
      distanceRatioCalculator(adjustedCoordinates.at(1), eachCoordinate, adjustedCoordinates.at(2)),
    originalRatios.second
  );

  // Log the results
  console.log("Original ratios:", originalRatios)
  console.log("First adj:", firstAdjustedCoordinate)
  console.log("Second adj:", secondAdjustedCoordinate)
  const fullyAdjustedCoordinates = [adjustedCoordinates.at(0), firstAdjustedCoordinate.coordinate, controlledCoordinate, secondAdjustedCoordinate.coordinate, adjustedCoordinates.at(2)]

  console.log("fullyAdjustedCoordinates", adjustedCoordinates, fullyAdjustedCoordinates)
  return (
    <div className="" style={{ height: '100vh', width: '100vw', backgroundColor: '' }}>
      {/* {JSON.stringify(curved)} */}
      {selector}
      <MapWidget
        key={dataset.id}
        controlledCoordinate={controlledCoordinate}
        originalCoordinates={{
          list: listCurvedCoordinates,
          points: originalCoordinates
        }}
        adjustedCoordinates={{
          list: listAdjustedCurvedCoordinates,
          points: fullyAdjustedCoordinates
        }}
      />
    </div>
  );
}

export default App;
