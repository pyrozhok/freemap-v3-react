import React from 'react';
import PropTypes from 'prop-types';
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';

import { routePlannerSetStart, routePlannerSetFinish, routePlannerSetTransportType,
  routePlannerSetPickMode, routePlannerToggleItineraryVisibility, routePlannerExportGpx } from 'fm3/actions/routePlannerActions';
import { setTool, setActivePopup, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { getCurrentPosition } from 'fm3/geoutils';

function RoutePlannerMenu({ onSetStart, onSetFinish, pickPointMode, transportType,
    onChangeTransportType, onChangePickPointMode, onCancel, homeLocation, onGetCurrentPositionError, onMissingHomeLocation,
    onToggleItineraryVisibility, itineraryIsVisible, onToggleElevationChartVisibility, elevationProfileIsVisible, onStartProgress, onStopProgress,
    onGpxExport, routeFound, shapePoints }) {
  // TODO move to logic
  function setFromCurrentPosition(pointType) {
    onStartProgress();
    getCurrentPosition().then(({ lat, lon }) => {
      onStopProgress();
      if (pointType === 'start') {
        onSetStart({ lat, lon });
      } else if (pointType === 'finish') {
        onSetFinish({ lat, lon });
      } // else fail
    }, (e) => {
      onStopProgress();
      onGetCurrentPositionError(e);
    });
  }

  function setFromHomeLocation(pointType) {
    const { lat, lon } = homeLocation;
    if (!lat) {
      onMissingHomeLocation();
    } else if (pointType === 'start') {
      onSetStart({ lat, lon });
    } else if (pointType === 'finish') {
      onSetFinish({ lat, lon });
    }
  }

  // FIXME wrapper element can't be used
  return (
    <div>
      <Navbar.Form pullLeft>
        <ButtonGroup>
          <DropdownButton
            title={<span><FontAwesomeIcon icon="play" color="#409a40" /><span className="hidden-sm"> Štart</span></span>}
            id="add-start-dropdown"
            onClick={() => onChangePickPointMode('start')}
            active={pickPointMode === 'start'}
          >
            <MenuItem><FontAwesomeIcon icon="map-marker" /> Vybrať na mape</MenuItem>
            <MenuItem onClick={() => setFromCurrentPosition('start')}><FontAwesomeIcon icon="bullseye" /> Aktuálna poloha</MenuItem>
            <MenuItem onClick={() => setFromHomeLocation('start')}><FontAwesomeIcon icon="home" /> Domov</MenuItem>
          </DropdownButton>
          <DropdownButton
            title={<span><FontAwesomeIcon icon="stop" color="#d9534f" /><span className="hidden-sm"> Cieľ</span></span>}
            id="add-finish-dropdown"
            onClick={() => onChangePickPointMode('finish')}
            active={pickPointMode === 'finish'}
          >
            <MenuItem><FontAwesomeIcon icon="map-marker" /> Vybrať na mape</MenuItem>
            <MenuItem onClick={() => setFromCurrentPosition('finish')}><FontAwesomeIcon icon="bullseye" /> Aktuálna poloha</MenuItem>
            <MenuItem onClick={() => setFromHomeLocation('finish')}><FontAwesomeIcon icon="home" /> Domov</MenuItem>
          </DropdownButton>
        </ButtonGroup>
        {' '}
        <ButtonGroup>
          {
            [['car', 'car'], ['walk', 'male'], ['bicycle', 'bicycle']].map(([type, icon]) => (
              <Button key={type} active={transportType === type} onClick={() => onChangeTransportType(type)}>
                <FontAwesomeIcon icon={icon} />
              </Button>
            ))
          }
        </ButtonGroup>
        {' '}
        <Button onClick={() => onToggleItineraryVisibility()} active={itineraryIsVisible} title="Itinerár">
          <FontAwesomeIcon icon="list-ol" /><span className="hidden-sm"> Itinerár</span>
        </Button>
        {' '}
        { routeFound &&
          <Button onClick={() => onToggleElevationChartVisibility(shapePoints, elevationProfileIsVisible)} active={elevationProfileIsVisible} title="Výškový profil">
            <FontAwesomeIcon icon="bar-chart" /><span className="hidden-sm"> Výškový profil</span>
          </Button> }
        {' '}
        <Button onClick={onGpxExport} disabled={!routeFound} title="Exportuj do GPX">
          <FontAwesomeIcon icon="share" /><span className="hidden-sm"> Exportuj do GPX</span>
        </Button>
      </Navbar.Form>
      <Nav pullRight>
        <NavItem onClick={onCancel} title="Zavrieť">
          <Glyphicon glyph="remove" /><span className="hidden-sm"> Zavrieť</span>
        </NavItem>
      </Nav>
    </div>
  );
}

RoutePlannerMenu.propTypes = {
  onSetStart: PropTypes.func.isRequired,
  onSetFinish: PropTypes.func.isRequired,
  transportType: PropTypes.string,
  pickPointMode: PropTypes.string,
  onChangeTransportType: PropTypes.func.isRequired,
  onChangePickPointMode: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  homeLocation: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  onToggleItineraryVisibility: PropTypes.func.isRequired,
  itineraryIsVisible: PropTypes.bool.isRequired,
  onToggleElevationChartVisibility: PropTypes.func.isRequired,
  elevationProfileIsVisible: PropTypes.bool.isRequired,
  onStartProgress: PropTypes.func.isRequired,
  onStopProgress: PropTypes.func.isRequired,
  onGpxExport: PropTypes.func.isRequired,
  routeFound: PropTypes.bool.isRequired,
  shapePoints: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  onGetCurrentPositionError: PropTypes.func.isRequired,
  onMissingHomeLocation: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    homeLocation: state.main.homeLocation,
    transportType: state.routePlanner.transportType,
    pickPointMode: state.routePlanner.pickMode,
    itineraryIsVisible: state.routePlanner.itineraryIsVisible,
    routeFound: !!state.routePlanner.shapePoints,
    shapePoints: state.routePlanner.shapePoints,
    elevationProfileIsVisible: !!state.elevationChart.trackGeojson,
  }),
  dispatch => ({
    onSetStart(start) {
      dispatch(routePlannerSetStart(start));
    },
    onSetFinish(finish) {
      dispatch(routePlannerSetFinish(finish));
    },
    onToggleItineraryVisibility() {
      dispatch(routePlannerToggleItineraryVisibility());
    },
    onToggleElevationChartVisibility(shapePoints, elevationProfileIsVisible) {
      if (elevationProfileIsVisible) {
        dispatch(elevationChartClose());
      } else {
        const geojson = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: shapePoints.map(latlon => [latlon[1], latlon[0]]),
          },
        };
        dispatch(elevationChartSetTrackGeojson(geojson));
      }
    },
    onChangeTransportType(transportType) {
      dispatch(routePlannerSetTransportType(transportType));
    },
    onChangePickPointMode(pickMode) {
      dispatch(routePlannerSetPickMode(pickMode));
    },
    onCancel() {
      dispatch(setTool(null));
    },
    onStartProgress() {
      dispatch(startProgress());
    },
    onStopProgress() {
      dispatch(stopProgress());
    },
    onGpxExport() {
      dispatch(routePlannerExportGpx());
    },
    onGetCurrentPositionError() {
      dispatch(toastsAdd({
        collapseKey: 'routePlanner.gpsError',
        message: 'Nepodarilo sa získať aktuálnu polohu.',
        style: 'danger',
        timeout: 3000,
      }));
    },
    onMissingHomeLocation() {
      dispatch(toastsAdd({
        collapseKey: 'routePlanner.noHome',
        message: 'Najprv si musíte nastaviť domovskú polohu.',
        style: 'warning',
        cancelType: 'SET_TOOL',
        actions: [
          { name: 'Nastav', action: setActivePopup('settings') },
          { name: 'Zavri' },
        ],
      }));
    },
  }),
)(RoutePlannerMenu);
