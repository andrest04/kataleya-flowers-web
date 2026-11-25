import type { ComplaintFormData } from '../../schemas/complaint';
import type { ComplaintFieldIssue, ComplaintType, DocType, ItemType } from '../../types';

export interface ComplaintFormExtras {
  isMinor: boolean;
  complaintType: ComplaintType;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '');
}

export function formDataToComplaint(
  formData: FormData,
  { isMinor, complaintType }: ComplaintFormExtras,
): ComplaintFormData {
  const amount = text(formData, 'claimedAmount').trim();
  return {
    consumerName: text(formData, 'consumerName'),
    consumerDocType: (formData.get('consumerDocType') as DocType | null) ?? 'DNI',
    consumerDocNumber: text(formData, 'consumerDocNumber'),
    consumerAddress: text(formData, 'consumerAddress'),
    consumerPhone: text(formData, 'consumerPhone'),
    consumerEmail: text(formData, 'consumerEmail'),
    isMinor,
    guardianName: text(formData, 'guardianName'),
    itemType: (formData.get('itemType') as ItemType | null) ?? 'PRODUCTO',
    itemDescription: text(formData, 'itemDescription'),
    claimedAmount: amount ? Number(amount) : undefined,
    complaintType,
    detail: text(formData, 'detail'),
    consumerRequest: text(formData, 'consumerRequest'),
  };
}

export function fieldErrorsFromIssues(
  issues: ComplaintFieldIssue[] | undefined,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues ?? []) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export function errorSummary(fieldErrors: Record<string, string>, fallback: string): string {
  const count = Object.keys(fieldErrors).length;
  if (count === 0) return fallback;
  return count === 1 ? 'Revisa el campo marcado.' : `Revisa los ${count} campos marcados.`;
}
