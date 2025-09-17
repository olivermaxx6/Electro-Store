export default function FormRow({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block opacity-80">{label}</span>
      {children}
    </label>
  );
}
