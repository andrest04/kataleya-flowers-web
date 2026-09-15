import { documentStore } from '../..';
import { createSiteSettingsRepository } from './appwriteRepository';
import type { SiteSettingsRepository } from './types';

export const siteSettingsRepository: SiteSettingsRepository = createSiteSettingsRepository(documentStore);

export type { SiteSettingsRecord, SiteSettingsRepository, SiteSettingsWritePayload } from './types';
