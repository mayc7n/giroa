export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'cancelled';
export type WorkStatus = 'planned' | 'inProgress' | 'completed' | 'cancelled';
export type PaymentStatus = 'active' | 'reversed';

export type ClientRow = {
  id: string;
  name: string;
  normalized_name: string;
  contact: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteRow = {
  id: string;
  client_id: string;
  description: string;
  discount_cents: number;
  valid_until: string | null;
  status: QuoteStatus;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export type QuoteItemRow = {
  id: string;
  quote_id: string;
  description: string;
  quantity_milli: number;
  unit_price_cents: number;
  total_cents: number;
  position: number;
};

export type ServiceRow = {
  id: string;
  client_id: string;
  quote_id: string | null;
  description: string;
  total_cents: number;
  work_status: WorkStatus;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  service_id: string;
  amount_cents: number;
  payment_date: string;
  method: string;
  client_operation_id: string;
  status: PaymentStatus;
  created_at: string;
  reversed_at: string | null;
};

export type ClientRecord = {
  id: string;
  name: string;
  normalizedName: string;
  contact: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuoteItemRecord = {
  id: string;
  description: string;
  quantityMilli: number;
  unitPriceCents: number;
  totalCents: number;
  position: number;
};

export type QuoteRecord = {
  id: string;
  clientId: string;
  description: string;
  discountCents: number;
  validUntil: string | null;
  status: QuoteStatus;
  totalCents: number;
  items: QuoteItemRecord[];
  createdAt: string;
  updatedAt: string;
};

export type ServiceRecord = {
  id: string;
  clientId: string;
  quoteId: string | null;
  description: string;
  totalCents: number;
  workStatus: WorkStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  serviceId: string;
  amountCents: number;
  paymentDate: string;
  method: string;
  clientOperationId: string;
  status: PaymentStatus;
  createdAt: string;
  reversedAt: string | null;
};
