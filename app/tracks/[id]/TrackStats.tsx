import DistanceText from '@/features/units/DistanceText';
import { Track } from '@/features/tracks/api';

export default function TrackStatsComponent({ track }: { track: Track }) {
  const props = track.geojson.properties;
  return (
    <dl>
      {props.lengthMeters !== undefined && (
        <StatComponent label="Length">
          <DistanceText meters={props.lengthMeters} />
        </StatComponent>
      )}
      {/* <StatComponent label="Elevation gain" value={elevationGain} /> */}
    </dl>
  );
}

function StatComponent({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold text-gray-900">{children}</dd>
    </div>
  );
}
