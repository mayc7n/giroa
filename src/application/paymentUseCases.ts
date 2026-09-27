import { calculateBalance, validatePaymentAmount } from '@/domain/payment';
import { assertISODate } from '@/domain/date';
import type { PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
import type { PaymentRepository, ServiceRepository } from './ports';

type PaymentUseCaseDependencies = {
  services: ServiceRepository;
  payments: PaymentRepository;
  idFactory: () => string;
  clock: () => string;
};

export type ServiceFinancialSummary = {
  service: ServiceRecord;
  payments: PaymentRecord[];
  totalCents: number;
  receivedCents: number;
  balanceCents: number;
};

export function createPaymentUseCases({ services, payments, idFactory, clock }: PaymentUseCaseDependencies) {
  return {
    async register(input: {
      serviceId: string;
      amountCents: number;
      paymentDate: string;
      method: string;
      clientOperationId: string;
    }) {
      const operationId = input.clientOperationId.trim();
      if (!operationId) throw new Error('Identificador da operação ausente.');

      const existing = await payments.getByOperationId(operationId);
      if (existing) return existing;

      assertISODate(input.paymentDate);

      const service = await services.getById(input.serviceId);
      if (!service) throw new Error('Serviço não encontrado.');

      const currentPayments = await payments.listByServiceId(service.id);
      const balanceCents = calculateBalance(service.totalCents, currentPayments);
      validatePaymentAmount(input.amountCents, balanceCents);

      return payments.create({
        id: idFactory(),
        serviceId: service.id,
        amountCents: input.amountCents,
        paymentDate: input.paymentDate,
        method: input.method.trim() || 'não informado',
        clientOperationId: operationId,
        status: 'active',
        createdAt: clock(),
      });
    },
    async getServiceFinancialSummary(serviceId: string): Promise<ServiceFinancialSummary> {
      const service = await services.getById(serviceId);
      if (!service) throw new Error('Serviço não encontrado.');

      const currentPayments = await payments.listByServiceId(service.id);
      const receivedCents = currentPayments
        .filter((payment) => payment.status === 'active')
        .reduce((total, payment) => total + payment.amountCents, 0);

      return {
        service,
        payments: currentPayments,
        totalCents: service.totalCents,
        receivedCents,
        balanceCents: calculateBalance(service.totalCents, currentPayments),
      };
    },
    async getCashSummary() {
      const allServices = await services.list();
      const allPayments = await payments.listAll();
      const activePayments = allPayments.filter((payment) => payment.status === 'active');
      const pendingCents = allServices.reduce((total, service) => {
        const servicePayments = allPayments.filter((payment) => payment.serviceId === service.id);
        return total + calculateBalance(service.totalCents, servicePayments);
      }, 0);
      const entriesCents = activePayments.reduce((total, payment) => total + payment.amountCents, 0);

      return {
        entriesCents,
        exitsCents: 0,
        periodBalanceCents: entriesCents,
        pendingCents,
      };
    },
  };
}
