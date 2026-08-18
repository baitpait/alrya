import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionIconSubmit } from "@/components/admin/AdminActionIcons";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  OfferCreateModal,
  OfferEditModal,
} from "@/components/admin/OfferCreateModal";
import { ServiceEditModal } from "@/components/admin/ServiceCreateModal";
import { prisma } from "@/lib/prisma";
import {
  createOffer,
  deleteOffer,
  setServiceActive,
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
    include: {
      offers: {
        orderBy: { id: "desc" },
        include: { _count: { select: { eventServices: true } } },
      },
    },
  });
  if (!service) notFound();

  return (
    <div className="stack-gap">
      <AdminBackLink href="/admin/services" label="رجوع للخدمات" />

      <section className="panel event-hero-panel">
        <div className="calendar-toolbar">
          <div>
            <h1 className="event-page-title">
              {service.name}
              <span className="event-page-id">#{service.id}</span>
            </h1>
            <p className="event-hero-meta">
              <span className="event-status-pill">
                {service.kind === "SESSION" ? "جلسة" : "مناسبة"}
              </span>
              <span className="event-status-pill">
                {service.active ? "نشطة" : "معطّلة"}
              </span>
            </p>
          </div>
          <div className="calendar-toolbar-actions">
            <ServiceEditModal
              action={updateService}
              service={{
                id: service.id,
                name: service.name,
                kind: service.kind,
                active: service.active,
              }}
            />
            <form action={setServiceActive}>
              <input type="hidden" name="recordId" value={service.id} />
              <input
                type="hidden"
                name="active"
                value={service.active ? "false" : "true"}
              />
              <ActionIconSubmit
                label={
                  service.active
                    ? `تعطيل ${service.name}`
                    : `تفعيل ${service.name}`
                }
                kind={service.active ? "disable" : "enable"}
              />
            </form>
            <OfferCreateModal action={createOffer} serviceId={service.id} />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>العروض / الباقات ({service.offers.length})</h2>
        {service.offers.length === 0 ? (
          <p className="empty-hint">
            لا عروض بعد. أضيفي أول باقة من زر «إضافة عرض» أعلاه.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>العرض</th>
                  <th>السعر</th>
                  <th>بدل</th>
                  <th>الجمهور</th>
                  <th>مواعيد</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {service.offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.id}</td>
                    <td>
                      <strong>{offer.name}</strong>
                      {offer.description ? (
                        <div className="cell-sub">{offer.description}</div>
                      ) : null}
                    </td>
                    <td className="cell-ltr">{Number(offer.price).toFixed(2)} ₪</td>
                    <td className="cell-ltr">
                      {offer.listPrice != null
                        ? `${Number(offer.listPrice).toFixed(2)} ₪`
                        : "—"}
                    </td>
                    <td>{offer.audience || "—"}</td>
                    <td>{offer._count.eventServices}</td>
                    <td className="row-actions row-actions--icons">
                      <OfferEditModal
                        action={updateOffer}
                        serviceId={service.id}
                        offer={{
                          id: offer.id,
                          name: offer.name,
                          price: Number(offer.price),
                          listPrice:
                            offer.listPrice != null
                              ? Number(offer.listPrice)
                              : null,
                          audience: offer.audience,
                          description: offer.description,
                        }}
                      />
                      {offer._count.eventServices > 0 ? null : (
                        <ConfirmDelete
                          action={deleteOffer}
                          id={offer.id}
                          fieldName="recordId"
                          hiddenFields={{ serviceId: service.id }}
                          label={`حذف العرض ${offer.name}`}
                          message={`حذف العرض «${offer.name}»؟`}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
