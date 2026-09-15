export interface Complaint {
  id: string;
  correlativo: number;
  complaintType: string;
  consumerName: string;
  consumerDocType: string;
  consumerDocNumber: string;
  consumerEmail: string;
  consumerPhone: string | null;
  consumerAddress: string;
  isMinor: boolean;
  guardianName: string | null;
  itemType: string;
  itemDescription: string;
  claimedAmount: number | null;
  detail: string;
  consumerRequest: string;
  providerResponse: string | null;
  status: string;
  respondedAt: string | null;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintInsert {
  correlativo: number;
  complaintType: string;
  consumerName: string;
  consumerDocType: string;
  consumerDocNumber: string;
  consumerEmail: string;
  consumerPhone: string | null;
  consumerAddress: string;
  isMinor: boolean;
  guardianName: string | null;
  itemType: string;
  itemDescription: string;
  claimedAmount: number | null;
  detail: string;
  consumerRequest: string;
}

export interface ComplaintCreated {
  id: string;
  correlativo: number;
  createdAt: string;
}

export interface ComplaintStatusUpdate {
  status: string;
  providerResponse: string | null;
  respondedAt: string | null;
}

export interface ComplaintsRepository {
  list(): Promise<Complaint[]>;
  findById(id: string): Promise<Complaint | null>;
  allocateCorrelativo(year: number): Promise<number>;
  insert(input: ComplaintInsert): Promise<ComplaintCreated>;
  updateStatus(id: string, data: ComplaintStatusUpdate): Promise<void>;
}
