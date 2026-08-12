type Props = {
  title: string;
  phase: number;
  summary: string;
};

/** صفحة هيكلية حقيقية — ليست زراً ميتاً؛ توضح متى تُفعَّل الوظيفة */
export function PhasePlaceholder({ title, phase, summary }: Props) {
  return (
    <section className="panel">
      <h1>{title}</h1>
      <p>{summary}</p>
      <p>
        الشاشة موجودة ضمن شِل المرحلة 1 حتى لا يبقى أي رابط في القائمة بدون وجهة.
        الوظيفة الكاملة تُبنى في مرحلتها حسب خطة الإنتاج.
      </p>
      <span className="badge-phase">تُفعَّل في المرحلة {phase}</span>
    </section>
  );
}
