import { Layout } from '@/components/Layout';
import { fetchTrack } from '@/features/tracks/api';
import TrackStatsComponent from './TrackStats';
import TrackActions from './TrackActions';
import { ServerError } from '@/api';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const track = await fetchTrack(params.id).catch((err) => {
    if (err instanceof ServerError && err.response.status === 404) {
      notFound();
    }
    throw err;
  });

  return (
    <Layout pageTitle={track.name || 'Unnamed track'}>
      <TrackActions track={track} />
      <TrackStatsComponent track={track} />
    </Layout>
  );
}
