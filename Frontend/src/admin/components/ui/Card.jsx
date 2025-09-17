export default function Card({ title, children, footer }) {
  return (
    <div className="rounded-2xl border p-4">
      {title && <h3 className="mb-2 font-semibold">{title}</h3>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm opacity-80">{footer}</div>}
    </div>
  );
}
