import { documentStore } from '@/lib/database';
import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';

import { discoverTileConfig } from './config';
import type { DiscoverTile, DiscoverTileWritePayload } from './types';

export type { DiscoverTile, DiscoverTileWritePayload } from './types';

export const discoverTileRepository = createOrderableCollectionRepository<DiscoverTile, DiscoverTileWritePayload>(
  documentStore,
  discoverTileConfig,
);
