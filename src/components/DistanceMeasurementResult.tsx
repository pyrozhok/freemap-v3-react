import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Marker, Tooltip, Polyline, Polygon } from 'react-leaflet';
import { LeafletEvent } from 'leaflet';
import {
  distanceMeasurementAddPoint,
  distanceMeasurementUpdatePoint,
  distanceMeasurementRemovePoint,
  Point,
} from 'fm3/actions/distanceMeasurementActions';
import { ElevationChartActivePoint } from 'fm3/components/ElevationChartActivePoint';
import { distance, area } from 'fm3/geoutils';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { divIcon } from 'leaflet';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { selectFeature } from 'fm3/actions/mainActions';
import { LatLon } from 'fm3/types/common';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { toastsAdd } from 'fm3/actions/toastsActions';

// const defaultIcon = new L.Icon.Default();

const circularIcon = divIcon({
  // CircleMarker is not draggable
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  tooltipAnchor: [10, 0],
  html: '<div class="circular-leaflet-marker-icon"></div>',
});

type OwnProps = {
  index: number;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps & {
    t: Translator;
  };

const DistanceMeasurementResultInt: React.FC<Props> = ({
  line,
  index,
  onPointAdd,
  onPointUpdate,
  onPointRemove,
  onSelect,
  onValueShow,
  language,
  selected,
  t,
}) => {
  const points = line.points;

  const [coords, setCoords] = useState<LatLon | undefined>();

  const handleMouseMove = useCallback(
    (lat: number, lon: number, originalEvent) => {
      setCoords(
        selected && originalEvent.target.classList.contains('leaflet-container')
          ? { lat, lon }
          : undefined,
      );
    },
    [selected],
  );

  const handleMouseOut = useCallback(() => {
    setCoords(undefined);
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    mapEventEmitter.on('mouseMove', handleMouseMove);
    mapEventEmitter.on('mouseOut', handleMouseOut);

    return () => {
      mapEventEmitter.removeListener('mouseMove', handleMouseMove);
      mapEventEmitter.removeListener('mouseOut', handleMouseOut);
    };
  }, [selected, handleMouseMove, handleMouseOut]);

  const handlePoiAdd = useCallback(
    (lat: number, lon: number, position: number, id0: number) => {
      handleDragStart();
      const pos = position ? Math.ceil(position / 2) : points.length;

      let id: number | undefined;

      if (id0) {
        id = id0;
      } else if (pos === 0) {
        id = points.length ? points[pos].id - 1 : 0;
      } else if (pos === points.length) {
        id = points[pos - 1].id + 1;
      } else {
        id = (points[pos - 1].id + points[pos].id) / 2;
      }

      onPointAdd(index, { lat, lon, id }, pos);
    },
    [index, points, onPointAdd],
  );

  const handleMeasureMarkerDrag = useCallback(
    ({ latlng: { lat, lng: lon } }, id: number) => {
      onPointUpdate(index, { lat, lon, id });
    },
    [index, onPointUpdate],
  );

  const handleMarkerClick = useCallback(
    (id: number) => {
      onPointRemove(index, id);
    },
    [index, onPointRemove],
  );

  let prev: Point | null = null;
  let dist = 0;

  const nf = useMemo(
    () =>
      Intl.NumberFormat(language, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    [language],
  );

  const handleSelect = useCallback(() => {
    onSelect(line.type, index);
  }, [onSelect, index, line]);

  const { areaSize, ps } = useMemo(() => {
    const ps: Point[] = [];

    for (let i = 0; i < points.length; i++) {
      ps.push(points[i]);

      if (i < points.length - 1 || line.type === 'area') {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const lat = (p1.lat + p2.lat) / 2;
        const lon = (p1.lon + p2.lon) / 2;

        ps.push({
          lat,
          lon,
          id: points.length - 1 === i ? points.length * 2 : (p1.id + p2.id) / 2,
        });
      }
    }

    return { areaSize: points.length >= 3 ? area(points) : NaN, ps };
  }, [points, line.type]);

  const handleTooltipClick = useCallback(() => {
    onValueShow(areaSize);
  }, [onValueShow, areaSize]);

  return (
    <>
      {ps.length > 2 && line.type === 'distance' && (
        <Polyline
          weight={4}
          color={selected ? '#65b2ff' : 'blue'}
          interactive
          onclick={handleSelect}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
        />
      )}

      {ps.length > 1 && line.type === 'area' && (
        <Polygon
          weight={4}
          color={selected ? '#65b2ff' : 'blue'}
          interactive
          onclick={handleSelect}
          positions={ps
            .filter((_, i) => i % 2 === 0)
            .map(({ lat, lon }) => ({ lat, lng: lon }))}
        >
          {ps.length > 4 && (
            <Tooltip
              className="compact"
              offset={[-4, 0]}
              direction="center"
              permanent
              interactive
              key={ps.map(p => `${p.lat},${p.lon}`).join(',')}
            >
              <div onClick={handleTooltipClick}>
                {t('measurement.areaInfo', { areaSize })}
              </div>
            </Tooltip>
          )}
        </Polygon>
      )}

      {!!(ps.length > 2 && coords && !window.preventMapClick && selected) && (
        <Polyline
          weight={4}
          dashArray="6,8"
          positions={[
            {
              lat: ps[ps.length - (line.type === 'area' ? 2 : 1)].lat,
              lng: ps[ps.length - (line.type === 'area' ? 2 : 1)].lon,
            },
            { lat: coords.lat, lng: coords.lon },
            ...(line.type === 'distance' || ps.length < 3
              ? []
              : [{ lat: ps[0].lat, lng: ps[0].lon }]),
          ]}
        />
      )}

      {ps.map((p, i: number) => {
        if (i % 2 === 0) {
          if (prev) {
            dist += distance(p.lat, p.lon, prev.lat, prev.lon);
          }
          prev = p;
        }

        return i % 2 === 0 ? (
          <Marker
            key={p.id}
            draggable
            position={{ lat: p.lat, lng: p.lon }}
            // icon={defaultIcon} // NOTE changing icon doesn't work: https://github.com/Leaflet/Leaflet/issues/4484
            icon={circularIcon}
            opacity={1}
            onDrag={e => handleMeasureMarkerDrag(e as any, p.id)}
            onClick={() => handleMarkerClick(p.id)}
            onDragstart={handleDragStart}
            onDragend={handleDragEnd}
          >
            {line.type === 'distance' && (
              <Tooltip
                key={`${p.id}-${ps.length}`}
                className="compact"
                offset={[-4, 0]}
                direction="right"
                permanent={i === ps.length - 1}
              >
                <span>{nf.format(dist / 1000)} km</span>
              </Tooltip>
            )}
          </Marker>
        ) : (
          <Marker
            key={p.id}
            draggable
            position={{ lat: p.lat, lng: p.lon }}
            icon={circularIcon}
            opacity={0.5}
            onDragstart={(e: LeafletEvent) =>
              handlePoiAdd(
                e.target.getLatLng().lat,
                e.target.getLatLng().lng,
                i,
                p.id,
              )
            }
          />
        );
      })}

      <ElevationChartActivePoint />
    </>
  );
};

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragStart() {
  window.preventMapClick = true;
}

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function handleDragEnd() {
  window.setTimeout(() => {
    window.preventMapClick = false;
  });
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  line: state.distanceMeasurement.lines[ownProps.index],
  language: state.l10n.language,
  selected:
    (state.main.selection?.type === 'measure-dist' ||
      state.main.selection?.type === 'measure-area') &&
    ownProps.index === state.main.selection?.id,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onPointAdd(index: number, point: Point, position: number) {
    dispatch(distanceMeasurementAddPoint({ index, point, position }));
  },
  onPointUpdate(index: number, point: Point) {
    dispatch(distanceMeasurementUpdatePoint({ index, point }));
  },
  onPointRemove(index: number, id: number) {
    dispatch(distanceMeasurementRemovePoint({ index, id }));
  },
  onSelect(type: 'area' | 'distance', index: number) {
    dispatch(
      selectFeature({
        type: type === 'area' ? 'measure-area' : 'measure-dist',
        id: index,
      }),
    );
  },
  onValueShow(areaSize: number) {
    dispatch(
      toastsAdd({
        messageKey: 'measurement.areaInfo',
        messageParams: { areaSize },
        timeout: 5000,
        collapseKey: 'measurementInfo',
      }),
    );
  },
});

export const DistanceMeasurementResult = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(DistanceMeasurementResultInt));
