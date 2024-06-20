import { fetchUnitSettings } from './serverApi';
import { UnitSettingsClientProvider } from './useUnitSettings';

export async function UnitSettingsProvider(props: {
  children: React.ReactNode;
}) {
  const initialValue = await fetchUnitSettings();
  return <UnitSettingsClientProvider initialValue={initialValue} {...props} />;
}
