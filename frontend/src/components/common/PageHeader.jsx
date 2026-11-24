export default function PageHeader({ title, sub, children }) {
  return (
    <div className="flex justify-between items-end gap-4 flex-wrap border-b border-rule pb-4">
      <div>
        <h1>{title}</h1>
        {sub && <p className="text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
