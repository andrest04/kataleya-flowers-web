import { documentStore } from '@/lib/database';
import { createOrderableCollectionRepository } from '@/lib/database/orderableCollection/factory';

import { testimonialConfig } from './config';
import type { Testimonial, TestimonialWritePayload } from './types';

export type { Testimonial, TestimonialWritePayload } from './types';

export const testimonialRepository = createOrderableCollectionRepository<Testimonial, TestimonialWritePayload>(
  documentStore,
  testimonialConfig,
);
