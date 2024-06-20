'use client';

import InlineAlert from '@/components/InlineAlert';
import * as Plot from '@observablehq/plot';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { distance as computeDistance } from '@turf/distance';
import {
  formatDistance,
  formatDateTime,
  formatElevation,
  elevationUnitLabel,
  elevationInUnit,
  formatUnitless,
} from '@/features/units/format';
import { useUnitSettings } from '@/features/units/useUnitSettings';
import Skeleton from '@/components/Skeleton';

interface PointEntry {
  Time: Date;
  'Elevation gain': number;
  absElevationMeters: number;
  distanceMeters: number;
}

export default function ElevationChartComponent({
  coordinates,
  times,
  elevations,
}: {
  coordinates: [number, number][];
  times: string[];
  elevations: number[];
}) {
  const [isMalformed, setIsMalformed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [settings] = useUnitSettings();
  const [loaded, setLoaded] = useState(false);

  const height = 200;
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new ResizeObserver((entries) => {
      const rect = entries[0]!.contentRect;
      setWidth(rect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    if (
      coordinates.length === 0 ||
      coordinates.length !== elevations.length ||
      coordinates.length !== times.length
    ) {
      setIsMalformed(true);
      return;
    }

    const originCoord = coordinates[0]!;
    const originElevation = elevations[0]!;
    const points: PointEntry[] = [];
    for (let i = 0; i < coordinates.length; i++) {
      const time = new Date(times[i]!);
      if (isNaN(time.getTime())) {
        setIsMalformed(true);
        return;
      }

      const absElevationMeters = elevations[i]!;
      const elGain = elevationInUnit(
        absElevationMeters - originElevation,
        settings.elevation,
      );

      const distanceMeters = computeDistance(originCoord, coordinates[i]!, {
        units: 'meters',
      });

      points.push({
        Time: time,
        'Elevation gain': elGain,
        absElevationMeters,
        distanceMeters,
      });
    }

    // So that the area under curve displays correctly
    points.push({
      ...points[points.length - 1]!,
      'Elevation gain': 0,
    });

    const plot = Plot.plot({
      width,
      height,
      marginLeft: 0, // don’t need left-margin since labels are inset
      marks: [
        Plot.gridY({
          strokeDasharray: '0.75,2',
          strokeOpacity: 1,
        }),
        Plot.axisY({
          tickSize: 0, // don’t draw ticks
          lineAnchor: 'bottom', // draw labels above grid lines
          anchor: 'right',
          marginRight: 60, // space for five digits
          tickFormat: ((value: number, i: number, axis: number[]) => {
            let formatted = formatUnitless(value, 0);
            if (i === axis.length - 1) {
              const unit = elevationUnitLabel(settings.elevation);
              formatted += ` ${unit}`;
            }
            return formatted;
          }) as any,
        }),
        Plot.line(points, {
          x: 'Time',
          y: 'Elevation gain',
          fill: '#a1a1aa', // zinc-400
          fillOpacity: 0.4,
          tip: true,
          title(d: PointEntry, _i: number) {
            const absEl = formatElevation(
              d.absElevationMeters,
              settings.elevation,
            );
            const elGain = formatElevation(
              d['Elevation gain'],
              settings.elevation,
            );
            const distance = formatDistance(
              d.distanceMeters,
              settings.distance,
            );
            const time = formatDateTime(d.Time);
            return [
              `Time: ${time}`,
              `Elevation: ${absEl.join(' ')}`,
              `Elevation gain: ${elGain.join(' ')}`,
              `Distance: ${distance.join(' ')}`,
            ].join('\n\n');
          },
        }),
        Plot.ruleY([0], { stroke: '#7f7f7f' }),
        Plot.crosshairX(points, {
          x: 'Time',
          y: 'Elevation gain',
        }),
      ],
    });

    el.append(plot);
    setLoaded(true);

    return () => {
      plot.remove();
    };
  }, [coordinates, elevations, times, settings, width]);
  return (
    <div ref={ref} style={{ height }}>
      {!loaded && <Skeleton maxWidth={'100%'} height={'100%'} />}
      {isMalformed && (
        <InlineAlert variant="error">Malformed elevation data</InlineAlert>
      )}
    </div>
  );
}
