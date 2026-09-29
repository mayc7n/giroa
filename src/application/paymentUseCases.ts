import { calculateBalance, validatePaymentAmount } from '@/domain/payment';
import { calculateNetCashBalance, sumActiveCents } from '@/domain/cash';
import { assertISODate } from '@/domain/date';
import type { ExpenseRecord, PaymentRecord, ServiceRecord } from '@/data/sqliteTypes';
import type { ExpenseRepository, PaymentRepository, ServiceRepository } from './ports';

type PaymentUseCaseDependencies = {
  services: ServiceRepository;
  payments: PaymentRepository;
  expenses?: ExpenseRepository;
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

export type CashMovement = {
  id: string;
  date: string;
  description: string;
  category: string;
  amountCents: number;
  kind: 'entry' | 'exit';
  status: 'active' | 'reversed';
};

export type CashSummary = {
  entriesCents: number;
  exitsCents: number;
  periodBalanceCents: number;
  pendingCents: number;
  movements: CashMovement[];
};

function isWithinPeriod(date: string, period: { startDate: string; endDate: string }): boolean {
  return date >= period.startDate && date <= period.endDate;
}

function createCashMovements(
  payments: PaymentRecord[],
  expenses: ExpenseRecord[],
  services: ServiceRecord[],
): CashMovement[] {
  const serviceDescriptions = new Map(services.map((service) => [service.id, service.description]));
  return [
    ...payments.map((payment) => ({
      id: payment.id,
      date: payment.paymentDate,
      description: serviceDescriptions.get(payment.serviceId) ?? 'Recebimento',
      category: payment.method,
      amountCents: payment.amountCents,
      kind: 'entry' as const,
      status: payment.status,
    })),
    ...expenses.map((expense) => ({
      id: expense.id,
      date: expense.expenseDate,
      description: expense.description,
      category: expense.category,
      amountCents: expense.amountCents,
      kind: 'exit' as const,
      status: expense.status,
    })),
  ].sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id));
}

export function createPaymentUseCases({ services, payments, expenses, idFactory, clock }: PaymentUseCaseDependencies) {
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
    async reversePayment(paymentId: string) {
      return payments.reverse(paymentId, clock());
    },
    async getCashSummary(period: { startDate: string; endDate: string }): Promise<CashSummary> {
      assertISODate(period.startDate);
      assertISODate(period.endDate);
      if (period.startDate > period.endDate) throw new Error('O período do caixa é inválido.');

      const allServices = await services.list();
      const allPayments = await payments.listAll();
      const allExpenses = expenses ? await expenses.listAll() : [];
      const periodPayments = allPayments.filter((payment) => isWithinPeriod(payment.paymentDate, period));
      const periodExpenses = allExpenses.filter((expense) => isWithinPeriod(expense.expenseDate, period));
      const pendingCents = allServices.reduce((total, service) => {
        const servicePayments = allPayments.filter((payment) => payment.serviceId === service.id);
        return total + calculateBalance(service.totalCents, servicePayments);
      }, 0);
      const entriesCents = sumActiveCents(periodPayments);
      const exitsCents = sumActiveCents(periodExpenses);

      return {
        entriesCents,
        exitsCents,
        periodBalanceCents: calculateNetCashBalance(periodPayments, periodExpenses),
        pendingCents,
        movements: createCashMovements(periodPayments, periodExpenses, allServices),
      };
    },
  };
}
