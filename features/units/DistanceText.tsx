'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '../../components/dropdown';
import { forwardRef } from 'react';
import { useUnitSettings } from './useUnitSettings';

export default function DistanceText({ meters }: { meters: number }) {
  const [settings, updateSettings] = useUnitSettings();
  const [value, unit] = formatDistance(meters, settings.distance);
  return (
    <span className="inline-flex items-baseline">
      <span>
        {value} {unit}
      </span>
      <Dropdown>
        <DropdownButton as={UnitButton} className="inline-flex items-center">
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </DropdownButton>
        <DropdownMenu>
          <DropdownItem
            onClick={() => updateSettings({ ...settings, distance: 'metric' })}
          >
            Metric
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              updateSettings({ ...settings, distance: 'imperial' })
            }
          >
            Imperial
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </span>
  );
}

const UnitButton = forwardRef<HTMLButtonElement>((props, ref) => (
  <button {...props} ref={ref} />
));
UnitButton.displayName = 'UnitButton';

function formatDistance(
  meters: number,
  unit: 'metric' | 'imperial',
): [string, string] {
  if (unit === 'metric') {
    return [toLocaleString(meters / 1000, { maximumFractionDigits: 2 }), 'km'];
  } else {
    return [
      toLocaleString(meters / 1609.344, { maximumFractionDigits: 2 }),
      'mi',
    ];
  }
}

function toLocaleString(
  value: number,
  options: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString(getLang(), options);
}

function getLang() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}
