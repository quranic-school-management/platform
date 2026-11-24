/** items: [[value, label], ...] */
export default function Stats({ items }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
      {items.map(([value, label]) => (
        <div className="border-t-2 border-ink pt-2" key={label}>
          <b className="block font-display font-semibold text-4xl leading-tight tracking-normal">{value}</b>
          <span className="text-muted text-[0.9375rem]">{label}</span>
        </div>
      ))}
    </div>
  );
}
