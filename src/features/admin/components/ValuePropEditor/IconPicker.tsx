'use client';

import { valuePropIcon } from '@/components/shared/ValuePropsBand/icons';
import SharedIconPicker from '@/features/admin/components/IconPicker';
import {
  VALUE_PROP_ICON_LABELS,
  VALUE_PROP_ICON_NAMES,
  type ValuePropIconName,
} from '@/lib/valuePropIcons';

interface IconPickerProps {
  error?: string;
  idPrefix: string;
  value: string;
  onChange: (icon: ValuePropIconName) => void;
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
      names={VALUE_PROP_ICON_NAMES}
      labels={VALUE_PROP_ICON_LABELS}
      iconFor={valuePropIcon}
      onChange={onChange}
    />
  );
}
