import { lineString, polygon } from '@turf/helpers';
import { clearMap } from 'fm3/actions/mainActions';
import { osmLoadWay } from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { positionsEqual, shouldBeArea } from 'fm3/geoutils';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadWayProcessor: Processor<typeof osmLoadWay> = {
  actionCreator: osmLoadWay,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const id = action.payload;

    const res = await httpRequest({
      getState,
      url: `//api.openstreetmap.org/api/0.6/way/${id}/full.json`,
      expectedStatus: 200,
      cancelActions: [clearMap, searchSelectResult],
    });

    const nodes: Record<string, [number, number]> = {};

    const { elements } = assertType<OsmResult>(await res.json());

    for (const item of elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        const coordinates = item.nodes.map((ref) => nodes[ref]);

        const tags = item.tags ?? {};

        dispatch(
          searchSelectResult({
            result: {
              osmType: 'way',
              id,
              geojson:
                positionsEqual(
                  coordinates[0],
                  coordinates[coordinates.length - 1],
                ) && shouldBeArea(tags)
                  ? polygon([coordinates], item.tags)
                  : lineString(coordinates, item.tags),
              tags,
              detailed: true,
            },
            showToast: window.isRobot,
            zoomTo: !window.fmHeadless,
          }),
        );
      }
    }
  },
};
