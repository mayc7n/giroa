import { calculateBalance } from '@/domain/payment';
import type { ExpenseRepository, PaymentRepository, ServiceRepository, ClientRepository } from './ports';
import type { ServiceRecord } from '@/data/sqliteTypes';

export type TodayPendingService = {
  service: ServiceRecord;
  clientName: string;
  balanceCents: number;
};

export type TodaySummary = {
  clientsCount: number;
  serviceCount: number;
  entriesCents: number;
  exitsCents: number;
  periodBalanceCents: number;
  pendingCents: number;
  pendingServices: TodayPendingService[];
};

type TodayUseCaseDependencies = {
  clients: Pick<ClientRepository, 'list'>;
  services: Pick<ServiceRepository, 'list'>;
  payments: Pick<PaymentRepository, 'listAll'>;
  expenses: Pick<ExpenseRepository, 'listAll'>;
  period: () => { startDate: string; endDate: string };
};

export function createTodayUseCases({ clients, services, payments, expenses, period }: TodayUseCaseDependencies) {
  return {
    async getSummary(): Promise<TodaySummary> {
      const [clientRecords, serviceRecords, paymentRecords, expenseRecords] = await Promise.all([
        clients.list(),
        services.list(),
        payments.listAll(),
        expenses.listAll(),
      ]);
      const currentPeriod = period();
      const clientNames = new Map(clientRecords.map((client) => [client.id, client.name]));
      const pendingServices: TodayPendingService[] = [];

      const pendingCents = serviceRecords.reduce((total, service) => {
        const balanceCents = calculateBalance(
          service.totalCents,
          paymentRecords.filter((payment) => payment.serviceId === service.id),
        );
        if (balanceCents > 0) {
          pendingServices.push({
            service,
            clientName: clientNames.get(service.clientId) ?? 'Cliente não identificado',
            balanceCents,
          });
        }
        return total + balanceCents;
      }, 0);

      const entriesCents = paymentRecords
        .filter((payment) => payment.status === 'active')
        .filter((payment) => payment.paymentDate >= currentPeriod.startDate && payment.paymentDate <= currentPeriod.endDate)
        .reduce((total, payment) => total + payment.amountCents, 0);
      const exitsCents = expenseRecords
        .filter((expense) => expense.status === 'active')
        .filter((expense) => expense.expenseDate >= currentPeriod.startDate && expense.expenseDate <= currentPeriod.endDate)
        .reduce((total, expense) => total + expense.amountCents, 0);

      return {
        clientsCount: clientRecords.length,
        serviceCount: serviceRecords.length,
        entriesCents,
        exitsCents,
        periodBalanceCents: entriesCents - exitsCents,
        pendingCents,
        pendingServices,
      };
    },
  };
}
