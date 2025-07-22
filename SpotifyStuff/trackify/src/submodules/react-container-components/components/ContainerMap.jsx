/*
* This reusable component is for adding a common containerized map.
*/

import React from 'react';
import PropTypes from 'prop-types';
import MapboxGL from 'mapbox-gl';
import { mapboxStyleUris } from '../models/mapboxStyleUris';
import ContainerButton from './ContainerButton';
import CollapsibleContainer from './CollapsibleContainer';

export default class ContainerMap extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            enableCollapse: false,
            interactive: true,
            latitude: 0,
            longitude: 0,
            zoom: 9,
            mapboxStyle: mapboxStyleUris['DARK'],
            markers: [],
            layers: []
        }

        this.mapContainerRef = React.createRef();
        this.map = null;
        this.originalLong = 0;
        this.originalLat = 0;
        this.originalZoom = 9;
        this.resetMap = this.resetMap.bind(this);
    }

    componentDidMount() {
        let updatedState = {
            enableCollapse: this.state.enableCollapse,
            interactive: this.state.interactive,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            zoom: this.state.zoom,
            mapboxStyle: this.state.mapboxStyle,
            markers: this.state.markers,
            layers: this.state.layers
        };

        if (this.props.enableCollapse) {
            updatedState.enableCollapse = this.props.enableCollapse;
        }

        if (this.props.interactive) {
            updatedState.interactive = this.props.interactive;
        }

        if (this.props.latitude) {
            updatedState.latitude = this.props.latitude;
        }

        if (this.props.longitude) {
            updatedState.longitude = this.props.longitude;
        }

        if (this.props.zoom) {
            updatedState.zoom = this.props.zoom;
        }

        if (this.props.mapboxStyle) {
            updatedState.mapboxStyle = (mapboxStyleUris[this.props.mapboxStyle] || this.props.mapboxStyle);
        }

        if (this.props.markers) {
            updatedState.markers = this.props.markers;
        }

        if (this.props.layers) {
            updatedState.layers = this.generateLayers();
        }

        this.setState({
            enableCollapse: updatedState.enableCollapse,
            interactive: updatedState.interactive,
            latitude: updatedState.latitude,
            longitude: updatedState.longitude,
            zoom: updatedState.zoom,
            mapboxStyle: updatedState.mapboxStyle,
            markers: updatedState.markers,
            poiLayer: updatedState.poiLayer,
            layers: updatedState.layers
        }, () => {
            this.originalLong = this.state.longitude;
            this.originalLat = this.state.latitude;
            this.originalZoom = this.state.zoom;

            if (this.mapContainerRef.current !== null && !this.map) {
                this.map = new MapboxGL.Map({
                    accessToken: this.props.mapboxAccessToken,
                    center: [this.state.longitude, this.state.latitude],
                    container: this.mapContainerRef.current,
                    interactive: this.state.interactive,
                    style: this.state.mapboxStyle,
                    zoom: this.state.zoom
                });

                this.map.on('load', () => {
                    this.refreshLayers();
                    this.refreshMarkers();    
                });

                this.map.on('click', (e) => {
                    const clickedCoord = new MapboxGL.LngLat(e.lngLat.lng, e.lngLat.lat);
                    const tolerance = 20;
                    let closestIndex = -1;
                    let closestDistance = tolerance;

                    console.log(`Coords of mouse click:  Long: [${clickedCoord.lng}] Lat: [${clickedCoord.lat}]`);

                    if (this.props.layers && this.props.layers.length > 0) {
                        const allPointsOfInterest = [].concat(...this.props.layers.map((layer) => layer.pointsOfInterest));

                        if (allPointsOfInterest && allPointsOfInterest.length > 0) {
                            for (let i = 0; i < allPointsOfInterest.length; i++) {
                                const distance = clickedCoord.distanceTo(new MapboxGL.LngLat(allPointsOfInterest[i].longitude, allPointsOfInterest[i].latitude));

                                if (distance < tolerance && distance < closestDistance) {
                                    closestDistance = distance;
                                    closestIndex = i;
                                }
                            }

                            if (closestIndex > -1) {
                                if (this.props.onPoiClicked) {
                                    this.props.onPoiClicked(allPointsOfInterest[closestIndex].longitude, allPointsOfInterest[closestIndex].latitude);
                                }

                                console.log(`Closest point to mouse click:  Long: [${allPointsOfInterest[closestIndex].longitude}] Lat: [${allPointsOfInterest[closestIndex].latitude}]`);
                                console.log(`Distance: [${closestDistance}]`);
                            }
                        }
                    }
                });

                this.map.on('move', () => {
                    this.setState({
                        latitude: this.map.getCenter().lat,
                        longitude: this.map.getCenter().lng,
                        zoom: this.map.getZoom()
                    });
                });
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const stateUpdate = {
            updateState: false,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            zoom: this.state.zoom,
            layers: this.state.layers,
            markers: this.state.markers
        };

        if (this.props.latitude !== prevProps.latitude) {
            stateUpdate.latitude = this.props.latitude;
            stateUpdate.updateState = true;
        }

        if (this.props.longitude !== prevProps.longitude) {
            stateUpdate.longitude = this.props.longitude;
            stateUpdate.updateState = true;
        }

        if (this.props.zoom !== prevProps.zoom) {
            stateUpdate.zoom = this.props.zoom;
            stateUpdate.updateState = true;
        }

        if (this.props.layers !== prevProps.layers) {
            stateUpdate.layers = this.generateLayers();
            stateUpdate.updateState = true;
        }

        if (this.props.marker !== prevProps.marker) {
            stateUpdate.markers = this.props.marker;
            stateUpdate.updateState = true;
        }

        if (stateUpdate.updateState) {
            this.map.on('load', () => {
                this.refreshLayers();
                this.refreshMarkers();
            });

            this.map.flyTo({
                center: [stateUpdate.longitude, stateUpdate.latitude],
                zoom: stateUpdate.zoom
            });
        }
    }

    render() {
        return (
            <div>
                <CollapsibleContainer
                    enableCollapse={this.state.enableCollapse}
                    label={this.props.label}
                >
                    <div className='map'>
                        <div
                            ref={this.mapContainerRef}
                            style={{
                                height: '400px',
                                margin: '5px'                            
                            }}
                        >
                            {
                                this.props.poiLegend &&
                                <div
                                    style={{
                                        columnGap: '10px',
                                        display: 'flex',
                                        left: '10px',
                                        position: 'absolute',
                                        top: '10px',
                                        zIndex: '1'
                                    }}
                                >
                                    {
                                        Object.entries(this.props.poiLegend).map(([legendItem]) => (
                                            <span
                                                key={legendItem}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '30px auto'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: this.props.poiLegend[legendItem],
                                                        borderRadius: '50%',
                                                        height: '20px',
                                                        marginRight: '8px',
                                                        width: '20px'
                                                    }}
                                                />
                                                <div>{legendItem}</div>
                                            </span>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                fontSize: 'x-small',
                                gridTemplateColumns: 'auto auto',
                                justifyContent: 'left'
                            }}
                        >
                            <span>
                                Latitude: {this.state.latitude} |
                                Longitude: {this.state.longitude} |
                                Zoom: {this.state.zoom}
                            </span>
                            <ContainerButton
                                buttonLabel={'Reset'}
                                small={true}
                                onButtonClick={this.resetMap}
                                buttonStyle={{
                                    marginLeft: '10px',
                                    width: '50px'
                                }}
                            />
                        </div>
                    </div>
                </CollapsibleContainer>
            </div>
        );
    }

    resetMap = () => {
        if (this.map) {
            this.map.flyTo({
                center: [this.originalLong, this.originalLat],
                zoom: this.originalZoom
            });
        }

        if (this.props.onResetClicked) {
            this.props.onResetClicked();
        }
    }

    configureCoordinatesForPointType(pointType, longitude, latitude, pointSize, rotationAngleInDegrees) {
        const coordinates = [];

        switch (pointType) {
            case 'circle': 
            case 'text': {
                coordinates.push(longitude);
                coordinates.push(latitude);
                break;
            }
            case 'triangle': {
                coordinates.push(this.generateTriangleCoords(longitude, latitude, pointSize, rotationAngleInDegrees));
                break;
            }
        }

        return coordinates;
    }

    destinationPoint(startCoordinates, distanceInDegrees, bearing) {
        const [lon1, lat1] = startCoordinates;
        const lat1Radians = (Math.PI / 180) * lat1;
        const lon1Radians = (Math.PI / 180) * lon1;
        const bearingRadians = (Math.PI / 180) * bearing;

        const lat2Radians = Math.asin(
            Math.sin(lat1Radians) *
            Math.cos(distanceInDegrees) +
            Math.cos(lat1Radians) *
            Math.sin(distanceInDegrees) *
            Math.cos(bearingRadians)
        );

        const lon2Radians = lon1Radians + Math.atan2(
            (
                Math.sin(bearingRadians) *
                Math.sin(distanceInDegrees) *
                Math.cos(lat1Radians)
            ),
            (
                Math.cos(distanceInDegrees) -
                Math.sin(lat1Radians) *
                Math.sin(lat2Radians)
            )
        );

        const lat2 = (180 / Math.PI) * lat2Radians;
        const lon2 = (180 / Math.PI) * lon2Radians;

        return [lon2, lat2];
    }

    generateLayers() {
        const layers = [];

        this.props.layers.forEach((layer) => {
            const features = [];

            layer.pointsOfInterest.forEach((poi) => {
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: this.getGeometryTypeFromPointType(layer.pointType),
                        coordinates: this.configureCoordinatesForPointType(layer.pointType, poi.longitude, poi.latitude, layer.pointSize, 0)
                    },
                    properties: {
                        id: 'pointsOfInterest',
                        name: `${layer.colorOfPoints} Size ${layer.pointSize} ${layer.pointType} Points`,
                        color: layer.colorOfPoints,
                        label: poi.label ? poi.label : ''
                    }
                });
            });

            let newLayer = {
                id: `${layer.colorOfPoints}Size${layer.pointSize}${layer.pointType}Layer`,
                type: this.getLayerTypeFromPointType(layer.pointType),
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: features
                    }
                }
            };

            switch (layer.pointType) {
                case 'circle': {
                    newLayer.paint = {
                        'circle-radius': layer.pointSize,
                        'circle-color': ['get', 'color']
                    };

                    break;
                }

                case 'triangle': {
                    newLayer.paint = {
                        'line-color': ['get', 'color'],
                        'line-width': 3
                    };

                    break;
                }

                case 'text': {
                    newLayer.layout = {
                        'text-field': ['get', 'label']
                    };

                    newLayer.paint = {
                        'text-color': ['get', 'color']
                    };

                    break;
                }
            }

            layers.push(newLayer);
        });

        return layers;
    }

    generateTriangleCoords(longitude, latitude, size, rotationAngleInDegrees) {
        const coords = [];
        const sideLengthInKm = .01 * size;

        // Earth's radius in kilometers (you can use a more accurate value if needed)
        const earthRadius = 6371.01;

        // Convert the side length from kilometers to degrees
        const sideLengthInDegrees = (sideLengthInKm / earthRadius) * (180 / Math.PI);

        const vertex1 = this.destinationPoint([longitude, latitude], sideLengthInDegrees, 0 + rotationAngleInDegrees);
        const vertex2 = this.destinationPoint([longitude, latitude], sideLengthInDegrees, 120 + rotationAngleInDegrees);
        const vertex3 = this.destinationPoint([longitude, latitude], sideLengthInDegrees, 240 + rotationAngleInDegrees);

        // coords.push([longitude, latitude]);
        coords.push(vertex1);
        coords.push(vertex2);
        coords.push(vertex3);
        coords.push(vertex1);

        return coords;
    }

    getGeometryTypeFromPointType(pointType) {
        let geometryType = '';

        switch (pointType) {
            case 'circle':
            case 'text': {
                geometryType = 'Point';
                break;
            }
            case 'triangle': {
                geometryType = 'Polygon';
                break;
            }
        }

        return geometryType;
    }

    getLayerTypeFromPointType(pointType) {
        let layerType = '';

        switch (pointType) {
            case 'triangle': {
                layerType = 'line';
                break;
            }
            case 'text': {
                layerType = 'symbol';
                break;
            }
            default: {
                layerType = pointType;
            }
        }

        return layerType;
    }

    refreshLayers() {
        if (this.map && this.state.layers && this.state.layers.length > 0) {
            if (this.map.layers) {
                const layerIds = this.map.layers.map((layer) => layer.id);

                layerIds.forEach((layerId) => {
                    if (this.map.getLayer(layerId)) {
                        this.map.removeLayer(layerId);
                    }
                });    
            }

            this.state.layers.forEach((layer) => {
                this.map.addLayer(layer);
            });
        }
    }

    refreshMarkers() {
        if (this.map) {
            if (this.map.markers) {
                this.map.markers.forEach((marker) => {
                    marker.remove();
                });   
            }
    
            if (this.state.markers && this.state.markers.length > 0) {
                this.state.markers.forEach((marker) => {
                    new MapboxGL.Marker()
                        .setLngLat([marker.longitude, marker.latitude])
                        .setPopup(new MapboxGL.Popup().setHTML(marker.label))
                        .addTo(this.map);
                });
            }    
        }
    }

    toggleLayerVisibility(index, layerId) {
        const updatedLayers = [...this.state.layers];
        updatedLayers[index].visible = !updatedLayers[index].visible;

        this.setState({
            layers: updatedLayers
        }, () => {
            if (this.map) {
                if (updatedLayers[index].visible) {
                    this.map.setLayoutProperty(
                        layerId,
                        'visibility',
                        'visible'
                    );
                } else {
                    this.map.setLayoutProperty(
                        layerId,
                        'visibility',
                        'none'
                    );
                }
            }

            this.refreshLayers();
        });
    }
}

ContainerMap.propTypes = {
    /** The access token to use for making calls into mapbox. */
    mapboxAccessToken: PropTypes.string.isRequired,

    /** The longitude value to use for the map. */
    longitude: PropTypes.number.isRequired,

    /** The latitude value to use for the map. */
    latitude: PropTypes.number.isRequired,

    /** The zoom value to use for the map. */
    zoom: PropTypes.number.isRequired,

    /** Optional - If provided, set to true for enabling collapsible container, otherwise it will be a normal container. */
    enableCollapse: PropTypes.bool,

    /** Optional - If provided, this will add a control to allow showing/hiding of specific map layers. */
    enableLayerFilter: PropTypes.bool,

    /** Option - If provided, set to false for disabling mouse, touch, or keyboard listeners. */
    interactive: PropTypes.bool,

    /** Optional - If provided, this will be the title that is set for the map. */
    label: PropTypes.string,

    /** Optional - If provided, these are layers to be added on top of the map. */
    layers: PropTypes.array,

    /** Optional - If provided, sets the style of the background map tiles.  Default is DARK. */
    mapboxStyle: PropTypes.oneOfType([
        PropTypes.oneOf(['ROAD', 'LIGHT', 'DARK', 'SATELLITE', 'HYBRID', 'TERRAIN']),
        PropTypes.object
    ]),

    /** Optional - If provided, this is label, latitude, and longitude data for markers to be placed on the map. */
    markers: PropTypes.array,

    /** Optional - If provided, this is an additional event that will be fired when a POI is clicked. */
    onPoiClicked: PropTypes.func,

    /** Optional - If provided, this is an additional event that will be fired when the reset button is clicked. */
    onResetClicked: PropTypes.func,

    /** Optional - If provided, this will generate a legend for defining what colors mean for rendered points of interest. */
    poiLegend: PropTypes.any
}
