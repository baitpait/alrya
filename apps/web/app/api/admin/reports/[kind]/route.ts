import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  formatDateAr,
  parseEventStatus,
  reportDiscounts,
  reportEvents,
  reportOffers,
  reportPayments,
  reportStaff,
  REPORT_KINDS,
  toCsv,
  type ReportKind,
} from "@/lib/reports";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ kind: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { kind: rawKind } = await ctx.params;
  if (!REPORT_KINDS.includes(rawKind as ReportKind)) {
    return NextResponse.json({ error: "تقرير غير معروف" }, { status: 404 });
  }
  const kind = rawKind as ReportKind;
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q") ?? undefined;

  let filename = "report.csv";
  let csv = "";

  if (kind === "events") {
    const rows = await reportEvents({ q, status: parseEventStatus(sp.get("status")) });
    filename = "events.csv";
    csv = toCsv(
      ["#", "الزبون", "الهاتف", "الحالة", "الإجمالي", "خدمات", "دفعات", "أُنشئت"],
      rows.map((r) => [
        r.id,
        r.customer,
        r.phone,
        r.status,
        r.totalPrice.toFixed(2),
        r.services,
        r.payments,
        formatDateAr(r.createdAt),
      ]),
    );
  } else if (kind === "payments") {
    const rows = await reportPayments({ q });
    filename = "payments.csv";
    csv = toCsv(
      ["#", "التاريخ", "الزبون", "مناسبة", "المبلغ", "الطريقة", "ملاحظة"],
      rows.map((r) => [
        r.id,
        formatDateAr(r.paidAt),
        r.customer,
        r.eventId,
        r.amount.toFixed(2),
        r.method,
        r.note,
      ]),
    );
  } else if (kind === "discounts") {
    const rows = await reportDiscounts({ q });
    filename = "discounts.csv";
    csv = toCsv(
      ["#", "التاريخ", "الزبون", "مناسبة", "المبلغ", "السبب"],
      rows.map((r) => [
        r.id,
        formatDateAr(r.createdAt),
        r.customer,
        r.eventId,
        r.amount.toFixed(2),
        r.reason,
      ]),
    );
  } else if (kind === "staff") {
    const rows = await reportStaff({
      employee: sp.get("employee") ?? undefined,
      customer: sp.get("customer") ?? undefined,
      supervisor: sp.get("supervisor") ?? undefined,
    });
    filename = "staff.csv";
    csv = toCsv(
      [
        "#",
        "الموظف",
        "الزبون",
        "الخدمة",
        "مناسبة",
        "من",
        "الوظيفة",
        "راتب",
        "مكافأة",
        "مشرف",
      ],
      rows.map((r) => [
        r.id,
        r.employee,
        r.customer,
        r.service,
        r.eventId,
        formatDateAr(r.startsAt),
        r.jobTitle,
        r.salary != null ? r.salary.toFixed(2) : "",
        r.bonus != null ? r.bonus.toFixed(2) : "",
        r.supervisor,
      ]),
    );
  } else {
    const rows = await reportOffers({ q });
    filename = "offers.csv";
    csv = toCsv(
      ["#", "العرض", "الخدمة", "الجمهور", "السعر", "بدل", "استُخدم في مواعيد"],
      rows.map((r) => [
        r.id,
        r.name,
        r.service,
        r.audience,
        r.price.toFixed(2),
        r.listPrice != null ? r.listPrice.toFixed(2) : "",
        r.usedOn,
      ]),
    );
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
