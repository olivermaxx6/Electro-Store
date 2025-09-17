export default function Pager({ page, setPage, hasNext, hasPrev }) {
  return (
    <div className="flex items-center gap-2">
      <button disabled={!hasPrev} onClick={() => setPage((p)=>Math.max(1,p-1))}
        className="rounded-xl border px-3 py-1 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800">Prev</button>
      <span className="text-sm">Page {page}</span>
      <button disabled={!hasNext} onClick={() => setPage((p)=>p+1)}
        className="rounded-xl border px-3 py-1 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800">Next</button>
    </div>
  );
}
