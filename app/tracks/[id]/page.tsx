import { Layout } from '@/components/Layout';
import { Track, fetchTrack } from '@/features/tracks/api';
import TrackStatsComponent from './TrackStats';
import TrackActions from './TrackActions';
import { AuthorizationError } from '@/api';
import UnauthorizedScreen from '@/components/UnauthorizedScreen';

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

  return (
    <Layout pageTitle={track.name || 'Unnamed track'}>
      <TrackActions track={track} />
      <TrackStatsComponent track={track} />
    </Layout>
  );
}
