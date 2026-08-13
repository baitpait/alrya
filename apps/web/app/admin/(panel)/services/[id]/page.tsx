import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createOffer,
  deleteOffer,
  updateOffer,
  updateService,
} from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id: Number(id) },
  });
  return { title: service ? `خدمة: ${service.name}` : "خدمة" };
}

export const dynamic = "force-dynamic";

export default async function AdminServiceDetailPage({ params }: Props) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const service = await prisma.service.findUnique({
    where: { id },
    include: { offers: { orderBy: { id: "desc" } } },
  });
  if (!service) notFound();

  return (
    <div className="stack-gap">
      <p>
        <Link className="text-link" href="/admin/services">
          ← رجوع للخدمات
        </Link>
      </p>

      <section className="panel">
        <h1>تعديل الخدمة</h1>
        <form action={updateService} className="inline-form">
          <input type="hidden" name="id" value={service.id} />
          <label>
            الاسم
            <input name="name" required defaultValue={service.name} />
          </label>
          <label>
            النوع
            <select name="kind" defaultValue={service.kind}>
              <option value="EVENT">مناسبة</option>
              <option value="SESSION">جلسة</option>
            </select>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              name="active"
              defaultChecked={service.active}
            />
            نشطة
          </label>
          <button type="submit">حفظ التعديل</button>
        </form>
      </section>

      <section className="panel">
        <h2>إضافة عرض / باقة</h2>
        <form action={createOffer} className="inline-form">
          <input type="hidden" name="serviceId" value={service.id} />
          <label>
            اسم العرض
            <input name="name" required placeholder="مثال: باقة ذهبية" />
          </label>
          <label>
            السعر / المبلغ (₪)
            <input
              className="input-ltr"
              name="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </label>
          <label>
            بدل (اختياري)
            <input
              className="input-ltr"
              name="listPrice"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="سعر مرجعي"
            />
          </label>
          <label>
            الجمهور / الطاقم (اختياري)
            <input name="audience" placeholder="شخص واحد / شخصين" />
          </label>
          <label>
            الوصف (اختياري)
            <textarea name="description" rows={2} />
          </label>
          <button type="submit">حفظ العرض</button>
        </form>
      </section>

      <section className="panel">
        <h2>عروض هذه الخدمة ({service.offers.length})</h2>
        {service.offers.length === 0 ? (
          <p>لا عروض بعد.</p>
        ) : (
          <div className="stack-gap">
            {service.offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <form action={updateOffer} className="inline-form">
                  <input type="hidden" name="id" value={offer.id} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <label>
                    الاسم
                    <input name="name" required defaultValue={offer.name} />
                  </label>
                  <label>
                    السعر / المبلغ (₪)
                    <input
                      className="input-ltr"
                      name="price"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      required
                      defaultValue={Number(offer.price)}
                    />
                  </label>
                  <label>
                    بدل (₪)
                    <input
                      className="input-ltr"
                      name="listPrice"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      defaultValue={
                        offer.listPrice != null ? Number(offer.listPrice) : ""
                      }
                    />
                  </label>
                  <label>
                    الجمهور / الطاقم
                    <input
                      name="audience"
                      defaultValue={offer.audience ?? ""}
                    />
                  </label>
                  <label>
                    الوصف
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={offer.description ?? ""}
                    />
                  </label>
                  <div className="row-actions">
                    <button type="submit">تحديث العرض</button>
                  </div>
                </form>
                <form action={deleteOffer}>
                  <input type="hidden" name="id" value={offer.id} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <button type="submit" className="btn-danger">
                    حذف العرض
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
