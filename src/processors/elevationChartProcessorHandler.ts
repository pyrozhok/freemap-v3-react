import turfAlong from '@turf/along';
import { Feature, Geometries, LineString } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import turfLength from '@turf/length';
import { RootAction } from 'fm3/actions';
import {
  elevationChartClose,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { clearMap, selectFeature } from 'fm3/actions/mainActions';
import { containsElevations, distance } from 'fm3/geoutils';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { RootState } from 'fm3/reducers';
import { ElevationProfilePoint } from 'fm3/reducers/elevationChartReducer';
import { Dispatch } from 'redux';
import { assertType } from 'typescript-is';

const handle: ProcessorHandler<typeof elevationChartSetTrackGeojson> = async ({
  dispatch,
  getState,
  action,
}) => {
  const trackGeojson = action.payload;

  if (containsElevations(trackGeojson)) {
    resolveElevationProfilePointsLocally(trackGeojson, dispatch);
  } else {
    await resolveElevationProfilePointsViaApi(getState, trackGeojson, dispatch);
  }
};

export default handle;

function resolveElevationProfilePointsLocally(
  trackGeojson: Feature<Geometries>,
  dispatch: Dispatch<RootAction>,
) {
  let dist = 0;

  let prevPt: [number, number, number] | undefined;

  const elevationProfilePoints: ElevationProfilePoint[] = [];

  for (const pt of getCoords(trackGeojson)) {
    const [lon, lat, ele] = pt;

    if (prevPt) {
      dist += distance(lat, lon, prevPt[1], prevPt[0]);
    }

    elevationProfilePoints.push({
      lat,
      lon,
      ele,
      distance: dist,
    });

    prevPt = pt;
  }

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
}

async function resolveElevationProfilePointsViaApi(
  getState: () => RootState,
  trackGeojson: Feature<LineString>,
  dispatch: Dispatch<RootAction>,
) {
  const totalDistanceInKm = turfLength(trackGeojson);

  const delta = Math.min(0.1, totalDistanceInKm / (window.innerWidth / 2));

  const elevationProfilePoints: {
    lat: number;
    lon: number;
    ele: number;
    distance: number;
  }[] = [];

  for (let dist = 0; dist <= totalDistanceInKm; dist += delta) {
    const [lon, lat] = getCoord(turfAlong(trackGeojson, dist));

    elevationProfilePoints.push({
      lat,
      lon,
      distance: dist * 1000,
      ele: Number.NaN, // will be filled later
    });
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/geotools/elevation',
    data: elevationProfilePoints.map(({ lat, lon }) => [lat, lon]),
    expectedStatus: 200,
    cancelActions: [
      elevationChartSetTrackGeojson,
      selectFeature,
      elevationChartClose,
      clearMap,
    ],
  });

  let climbUp = 0;

  let climbDown = 0;

  let prevEle: number | undefined;

  assertType<number[]>(await res.json()).forEach((ele: number, i: number) => {
    if (prevEle !== undefined) {
      const d = ele - prevEle;

      if (d > 0) {
        climbUp += d;
      } else {
        climbDown -= d;
      }
    }

    // TODO following are computed data, should not go to store
    Object.assign(elevationProfilePoints[i], { ele, climbUp, climbDown });

    prevEle = ele;
  });

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
}
