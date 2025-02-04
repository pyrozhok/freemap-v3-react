import { mapRefocus } from 'fm3/actions/mapActions';
import { wikiSetPoints } from 'fm3/actions/wikiActions';
import { cancelRegister } from 'fm3/cancelRegister';
import { httpRequest } from 'fm3/httpRequest';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { objectToURLSearchParams } from 'fm3/stringUtils';
import { OverpassElement, OverpassResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

interface WikiResponse {
  entities?: {
    [key: string]: {
      type: 'item';
      id: string;
      sitelinks: { [key: string]: { site: string; title: string } };
    };
  };
}

let initial = true;

export const wikiLayerProcessor: Processor = {
  errorKey: 'general.loadError',
  async handle({ getState, dispatch, prevState }) {
    const {
      map: { overlays, lat, lon, zoom },
      wiki: { points },
    } = getState();

    const prevMap = prevState.map;

    const ok0 = overlays.includes('w');

    const ok = ok0 && zoom >= 12;

    const prevOk0 = prevMap.overlays.includes('w');

    const prevOk = prevOk0 && prevMap.zoom >= 12;

    if (
      !initial &&
      `${lat},${lon},${ok}` === `${prevMap.lat},${prevMap.lon},${prevOk}`
    ) {
      return;
    }

    initial = false;

    if (!ok) {
      if (prevOk) {
        if (points.length) {
          dispatch(wikiSetPoints([]));
        }
      }

      return;
    }

    // debouncing
    try {
      await new Promise<void>((resolve, reject) => {
        const to = window.setTimeout(
          () => {
            cancelRegister.delete(cancelItem);

            resolve();
          },
          prevOk0 === ok0 ? 1000 : 0,
        );

        const cancelItem = {
          cancelActions: [mapRefocus],
          cancel: () => {
            cancelRegister.delete(cancelItem);

            window.clearTimeout(to);

            reject();
          },
        };

        cancelRegister.add(cancelItem);
      });
    } catch {
      return;
    }

    const bb = (await mapPromise).getBounds();

    const res = await httpRequest({
      getState,
      method: 'POST',
      url: 'https://overpass.freemap.sk/api/interpreter',
      body:
        `[out:json][bbox:${bb.getSouth()},${bb.getWest()},${bb.getNorth()},${bb.getEast()}];(` +
        `node[~"^wikipedia$|^wikidata$"~"."];` +
        `way[~"^wikipedia$|^wikidata$"~"."];` +
        `relation[~"^wikipedia$|^wikidata$"~"."];` +
        ');out tags center;',
      expectedStatus: 200,
      cancelActions: [mapRefocus],
    });

    const m = new Map<string, OverpassElement>();

    const wikidatas: string[] = [];

    const data = assertType<OverpassResult>(await res.json());

    for (const e of data.elements) {
      if (e.tags['wikipedia']) {
        e.tags['wikipedia'] = decodeURIComponent(
          e.tags['wikipedia'].replace(/_/g, ' '),
        );
      }

      const { wikipedia } = e.tags;

      if (wikipedia) {
        const e1 = m.get(wikipedia);

        if (
          !e1 ||
          e1.type === 'relation' ||
          (e1.type === 'way' && e.type === 'relation')
        ) {
          m.set(wikipedia, e);
        }
      } else {
        wikidatas.push(e.tags['wikidata']);
      }
    }

    // NOTE we don't dispatch partial data yet as it would close popup of wikidata-only item
    // dispatch(
    //   wikiSetPoints(
    //     [...m.values()].map((e: any) => ({
    //       id: e.id,
    //       lat: e.center?.lat ?? e.lat,
    //       lon: e.center?.lon ?? e.lon,
    //       name: e.tags?.name,
    //       wikipedia: e.tags.wikipedia,
    //     })),
    //   ),
    // );

    const { language } = getState().l10n;

    const res1 = await httpRequest({
      getState,
      url:
        'https://www.wikidata.org/w/api.php?' +
        objectToURLSearchParams({
          origin: '*',
          action: 'wbgetentities',
          props: 'sitelinks',
          format: 'json',
          ids: wikidatas.slice(0, 50).join('|'), // API limit is 50
          sitefilter: `${language}wiki|enwiki`,
        }),
      expectedStatus: 200,
      cancelActions: [mapRefocus],
    });

    const data1 = assertType<WikiResponse>(await res1.json());

    for (const e of data.elements) {
      if (e.tags['wikipedia']) {
        continue;
      }

      const sitelinks = data1.entities?.[e.tags['wikidata']]?.sitelinks;

      if (!sitelinks) {
        continue;
      }

      const title = (sitelinks[`${language}wiki`] || sitelinks['enwiki'])
        ?.title;

      if (title == null) {
        continue;
      }

      const wikipedia = `${
        `${language}wiki` in sitelinks ? language : 'en'
      }:${title}`;

      const e1 = m.get(wikipedia);

      if (
        !e1 ||
        e1.type === 'relation' ||
        (e1.type === 'way' && e.type === 'relation')
      ) {
        e.tags['wikipedia'] = wikipedia;

        m.set(wikipedia, e);
      }
    }

    dispatch(
      wikiSetPoints(
        [...m.values()].map((e: OverpassElement) => ({
          id: e.id,
          lat: e.type === 'node' ? e.lat : e.center.lat,
          lon: e.type === 'node' ? e.lon : e.center.lon,
          name: e.tags['name'],
          wikipedia: e.tags['wikipedia'],
        })),
      ),
    );
  },
};
