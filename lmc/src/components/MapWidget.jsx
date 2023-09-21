import { LayerGroup, LayersControl, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, Tooltip, Circle, useMapEvent, Rectangle } from 'react-leaflet'
// import icon from 'leaflet/dist/images/marker-icon.png';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import marker from '../../../../../assets/pin_sm.svg';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import iconMarker from 'leaflet/dist/images/marker-icon.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const icon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow
});

function swapCoordinates(coordinatesArray) {
    return coordinatesArray.map((coordinate) => [coordinate[1], coordinate[0]]);
}

const MapWidget = ({ datasetId, originalCoordinates = { list: [], points: [] }, adjustedCoordinates = { list: [], points: [] }, controlledCoordinate = [] }) => {
    const center = swapCoordinates([controlledCoordinate])[0]

    // console.log(adjustedCoordinates.points)

    return (
        <>
            <MapContainer key={datasetId} style={{ width: '100%', height: '100%' }} attributionControl={false} center={center} zoom={18} scrollWheelZoom={true} maxZoom={25}>
                {/* {pinned ? <MinimapControl position="bottomleft" zoom={12} /> : <></>} */}
                <TileLayer
                    attribution=''
                    // url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    // detectRetina={true}
                    maxZoom={25}
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {[...swapCoordinates(originalCoordinates.list)].map((coordinate, i) => {
                    return <Circle
                        key={i}
                        center={coordinate}
                        pathOptions={{ fillColor: 'blue', color: 'blue', fillOpacity: 1, stroke: true, fill: true }}
                        radius={0.1}>
                    </Circle>
                })}

                {[...swapCoordinates(adjustedCoordinates.list)].map((coordinate, i) => {
                    return <Circle
                        key={i}
                        center={coordinate}
                        pathOptions={{ fillColor: 'green', color: 'green', fillOpacity: 1, stroke: true, fill: true }}
                        radius={0.1}>
                    </Circle>
                })}

                {[...swapCoordinates(originalCoordinates.points)].map((coordinate, i) => {
                    return <Circle
                        key={i}
                        center={coordinate}
                        pathOptions={{ fillColor: 'blue', color: 'blue', fillOpacity: 1, stroke: true, fill: true }}
                        radius={2}>
                        <Tooltip>Original coordinate {i + 1}</Tooltip>
                    </Circle>
                })}

                {[...swapCoordinates(adjustedCoordinates.points)].map((coordinate, i) => {
                    return <Circle
                        key={i}
                        center={coordinate}
                        pathOptions={{ fillColor: 'green', color: 'green', fillOpacity: 1, stroke: true, fill: true }}
                        radius={2}>
                        <Tooltip>Adjusted coordinate {i + 1}</Tooltip>
                    </Circle>
                })}

                <Circle
                    center={center}
                    pathOptions={{ fillColor: 'red', color: 'black', fillOpacity: 1, stroke: true, fill: true }}
                    radius={2}>
                    <Tooltip>Controlled coordinate</Tooltip>
                </Circle>
            </MapContainer>
        </>
    )

}

export default MapWidget