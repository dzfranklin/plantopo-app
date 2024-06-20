import { Layout } from '@/components/Layout';
import licenseReport from '@/license-report.json';
import { nonLocaleCompare } from '@/nonLocalCompare';

export default function Page() {
  return (
    <Layout pageTitle="Credits" className="prose prose-h2:text-xl">
      <section>
        <h2>Data</h2>
        <ul>
          <li>
            Map data from{' '}
            <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> ©
            OpenStreetMap contributors
          </li>
          <li>
            Contains{' '}
            <a href="https://osdatahub.os.uk/legal/overview">OS data</a> &copy;
            Crown copyright and database rights {new Date().getFullYear()}
          </li>
          <li>
            Data from European Space Agency, Sinergise (2021).{' '}
            <i>Copernicus Global Digital Elevation Model</i>. Distributed by{' '}
            OpenTopography.{' '}
            <a href="https://doi.org/10.5069/G9028PQB">
              https://doi.org/10.5069/G9028PQB
            </a>
          </li>
        </ul>

        <h2>App</h2>
        <ul>
          {Object.entries(licenseReport)
            .sort(([a], [b]) => nonLocaleCompare(a, b))
            .map(([name, entry], i) => (
              <li key={i}>
                <a href={entryURL(entry)}>{name}</a>{' '}
                {'publisher' in entry && <span>by {entry.publisher}</span>} (
                {entry.licenses})
              </li>
            ))}
        </ul>

        <h2>API</h2>
        <p>
          See{' '}
          <a href="https://github.com/dzfranklin/plantopo-api/blob/main/go.mod">
            github.com/dzfranklin/plantopo-api/blob/main/go.mod
          </a>
        </p>

        <h2>Elevation API</h2>
        <p>
          See{' '}
          <a href="https://github.com/dzfranklin/elevation-api/blob/main/Cargo.toml">
            github.com/dzfranklin/elevation-api/blob/main/Cargo.toml
          </a>
        </p>

        <h2>ToGeoJSON API</h2>
        <p>
          See{' '}
          <a href="https://github.com/dzfranklin/togeojson-server/blob/main/deno.lock">
            github.com/dzfranklin/togeojson-server/blob/main/deno.lock
          </a>
        </p>
      </section>
    </Layout>
  );
}

function entryURL(entry: (typeof licenseReport)[keyof typeof licenseReport]) {
  if ('repository' in entry && typeof entry.repository === 'string') {
    return entry.repository;
  } else if ('url' in entry && typeof entry.url === 'string') {
    return entry.url;
  } else {
    return undefined;
  }
}
