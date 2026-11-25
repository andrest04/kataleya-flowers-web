'use client';

import SharedIconPicker from '@/features/admin/components/IconPicker';
import { discoverIcon } from '@/features/landing/components/DiscoverMoreSection/icons';
import {
  DISCOVER_ICON_LABELS,
  DISCOVER_ICON_NAMES,
  type DiscoverIconName,
} from '@/lib/discoverIcons';

interface IconPickerProps {
  error?: string;
  idPrefix: string;
  value: string;
  onChange: (icon: DiscoverIconName) => void;
}

export default function IconPicker({
  error,
  idPrefix,
  value,
  onChange,
}: IconPickerProps) {
  return (
    <SharedIconPicker
      error={error}
      idPrefix={idPrefix}
      value={value}
      names={DISCOVER_ICON_NAMES}
      labels={DISCOVER_ICON_LABELS}
      iconFor={discoverIcon}
      onChange={onChange}
    />
  );
}
