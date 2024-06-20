import {
  useFormattedElevation,
  useFormattedLength,
} from '@/analysis/formatHooks';
import { Track } from '@/features/tracks/api';

export default function TrackStatsComponent({ track }: { track: Track }) {
  const props = track.geojson.properties;
  const length = useFormattedLength(props.lengthMetres);
  const elevationGain = useFormattedElevation(42); // TODO: implement
  return (
    <dl>
      <StatComponent label="Length" value={length} />
      <StatComponent label="Elevation gain" value={elevationGain} />
    </dl>
  );
}

function StatComponent({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
