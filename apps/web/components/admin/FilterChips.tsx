import Link from "next/link";

export type FilterChipItem = {
  href: string;
  label: string;
  active: boolean;
};

export function filterHref(path: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value);
  }
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export function FilterChips({
  items,
  label,
}: {
  items: FilterChipItem[];
  label?: string;
}) {
  const nav = (
    <nav className="filter-chips" aria-label={label ?? "تصفية"}>
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className={item.active ? "is-active" : undefined}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  if (!label) return nav;

  return (
    <div className="filter-chips-wrap">
      <span className="filter-chips-label">{label}</span>
      {nav}
    </div>
  );
}
