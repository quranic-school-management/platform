import { Empty } from './States.jsx';

/** columns: [{ label, render(row) }]. On phones the table turns into a card list. */
export default function DataTable({ columns, rows, empty = 'لا توجد بيانات' }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[34rem]">
        <thead>
          <tr className="max-md:hidden">
            {columns.map((c, i) => (
              <th key={i} className="text-start font-medium text-[0.8125rem] text-muted p-2 border-b border-rule">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} className="hover:bg-paper-sunken max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1 max-md:py-3 max-md:border-b max-md:border-rule">
              {columns.map((c, j) => (
                <td
                  key={j}
                  className={`py-3 px-2 border-b border-rule max-md:p-0 max-md:border-0 ${j === 0 ? 'font-medium max-md:flex-[1_1_100%]' : ''}`}
                >
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
