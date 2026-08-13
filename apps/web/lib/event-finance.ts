import { prisma } from "@/lib/prisma";

export type EventFinance = {
  totalPrice: number;
  discountsTotal: number;
  paymentsTotal: number;
  remaining: number;
};

/** مصدر واحد للحقيقة: المتبقي = الإجمالي − الخصومات − الدفعات */
export async function getEventFinance(eventId: number): Promise<EventFinance> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { totalPrice: true },
  });
  if (!event) {
    return { totalPrice: 0, discountsTotal: 0, paymentsTotal: 0, remaining: 0 };
  }

  const [discountAgg, paymentAgg] = await Promise.all([
    prisma.discount.aggregate({
      where: { eventId },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { eventId },
      _sum: { amount: true },
    }),
  ]);

  const totalPrice = Number(event.totalPrice);
  const discountsTotal = Number(discountAgg._sum.amount ?? 0);
  const paymentsTotal = Number(paymentAgg._sum.amount ?? 0);
  const remaining = totalPrice - discountsTotal - paymentsTotal;

  return {
    totalPrice,
    discountsTotal,
    paymentsTotal,
    remaining,
  };
}

export function formatMoney(n: number) {
  return `${n.toFixed(2)} ₪`;
}
