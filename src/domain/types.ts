export type PaymentStatus = 'active' | 'reversed';

export type Payment = {
  amountCents: number;
  status: PaymentStatus;
};

export type QuoteItemInput = {
  description: string;
  quantityMilli: number;
  unitPriceCents: number;
};

export type QuoteTotals = {
  lineTotalsCents: number[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

export type ClientSummary = {
  id: string;
  name: string;
  contact?: string | null;
};

export type ClientSelection =
  | { kind: 'none' }
  | { kind: 'single'; client: ClientSummary }
  | { kind: 'requiresChoice'; clients: ClientSummary[] };
