import type {
  ClientRecord,
  PaymentRecord,
  QuoteRecord,
  QuoteStatus,
  ServiceRecord,
  WorkStatus,
} from '@/data/sqliteTypes';
import type { ClientSummary } from '@/domain/types';

export type CreateClientInput = {
  id: string;
  name: string;
  normalizedName: string;
  contact: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuoteInput = Omit<QuoteRecord, 'items'> & {
  items: QuoteRecord['items'];
};

export type CreateServiceInput = {
  id: string;
  clientId: string;
  quoteId: string;
  description: string;
  totalCents: number;
  workStatus: WorkStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentInput = {
  id: string;
  serviceId: string;
  amountCents: number;
  paymentDate: string;
  method: string;
  clientOperationId: string;
  status: 'active';
  createdAt: string;
};

export type OperationContext = {
  clientOperationId?: string;
};

export interface TransactionPort {
  withExclusive<T>(operation: OperationContext, work: () => Promise<T>): Promise<T>;
}

export interface ClientRepository {
  create(input: CreateClientInput): Promise<ClientRecord>;
  list(): Promise<ClientSummary[]>;
  getById(id: string): Promise<ClientRecord | null>;
}

export interface QuoteRepository {
  create(input: CreateQuoteInput): Promise<QuoteRecord>;
  getById(id: string): Promise<QuoteRecord | null>;
  updateStatus(id: string, status: QuoteStatus, updatedAt: string): Promise<void>;
}

export interface ServiceRepository {
  createFromApprovedQuote(input: CreateServiceInput): Promise<ServiceRecord>;
  getById(id: string): Promise<ServiceRecord | null>;
  getByQuoteId(quoteId: string): Promise<ServiceRecord | null>;
  list(): Promise<ServiceRecord[]>;
}

export interface PaymentRepository {
  create(input: CreatePaymentInput): Promise<PaymentRecord>;
  getByOperationId(clientOperationId: string): Promise<PaymentRecord | null>;
  listByServiceId(serviceId: string): Promise<PaymentRecord[]>;
  listAll(): Promise<PaymentRecord[]>;
}

export type GiroaRepositories = {
  clients: ClientRepository;
  quotes: QuoteRepository;
  services: ServiceRepository;
  payments: PaymentRepository;
  transactions: TransactionPort;
};
