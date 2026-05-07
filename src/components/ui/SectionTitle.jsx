export default function SectionTitle({ label, title, subtitle, align = "left" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mentisSecondary">
          {label}
        </p>
      )}
      <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm leading-6 text-mentisTextSecondary">{subtitle}</p>}
    </div>
  );
}
