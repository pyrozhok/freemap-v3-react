import { point } from '@turf/helpers';
import { clearMap } from 'fm3/actions/mainActions';
import { osmLoadNode } from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmNode, OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadNodeProcessor: Processor<typeof osmLoadNode> = {
  actionCreator: osmLoadNode,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, action, getState }) => {
    const id = action.payload;

    const res = await httpRequest({
      getState,
      url: `//api.openstreetmap.org/api/0.6/node/${id}.json`,
      expectedStatus: 200,
      cancelActions: [clearMap, searchSelectResult],
    });

    const { elements } = assertType<OsmResult>(await res.json());

    const tags: Record<string, string> = elements[0].tags ?? {};

    const nodes = (
      elements.filter((el) => el.type === 'node') as OsmNode[]
    ).map((node) => [node.lon, node.lat]);

    dispatch(
      searchSelectResult({
        result: {
          osmType: 'node',
          id,
          geojson: point(nodes[0], tags),
          tags,
          detailed: true,
        },
        showToast: window.isRobot,
        zoomTo: !window.fmHeadless,
      }),
    );
  },
};
