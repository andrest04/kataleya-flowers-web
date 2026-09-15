import { documentStore } from '@/lib/database';
import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';

import { valuePropConfig } from './config';
import type { ValueProp, ValuePropWritePayload } from './types';

export type { ValueProp, ValuePropWritePayload } from './types';

export const valuePropRepository = createOrderableCollectionRepository<ValueProp, ValuePropWritePayload>(
  documentStore,
  valuePropConfig,
);
