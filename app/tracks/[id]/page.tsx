import { Layout } from '@/components/Layout';
import { Track, fetchTrack } from '@/features/tracks/api';
import TrackStatsComponent from '@/features/tracks/TrackStats';
import TrackActions from '@/features/tracks/TrackActions';
import { AuthorizationError } from '@/api';
import UnauthorizedScreen from '@/components/UnauthorizedScreen';
import ElevationChartComponent from '@/features/tracks/ElevationChartComponent';

export default async function Page({ params }: { params: { id: string } }) {
  let track: Track;
  try {
    track = await fetchTrack(params.id);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return await UnauthorizedScreen();
    } else {
      throw err;
    }
  }

  const geojson = track.geojson;
  const props = geojson.properties;
  const coordProps = props.coordinateProperties;

  return (
    <Layout
      pageTitle={track.name || 'Unnamed track'}
      pageActions={<TrackActions track={track} />}
    >
      <div className="w-full max-w-3xl space-y-6">
        {coordProps?.elevationMeters && coordProps?.times && (
          <ElevationChartComponent
            times={coordProps.times}
            coordinates={geojson.geometry.coordinates}
            elevations={coordProps.elevationMeters}
          />
        )}

        <TrackStatsComponent track={track} />
      </div>
    </Layout>
  );
}
