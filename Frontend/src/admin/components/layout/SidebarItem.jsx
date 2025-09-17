import clsx from 'clsx';

const BTN = {
  collapsed: 'w-12 h-12',                 // collapsed button size
  expanded: 'w-full px-4 py-3',          // expanded button size
  radius: 'rounded-2xl',                  // soft pill
  icon: 'w-5 h-5',                       // icon size
};

export default function SidebarItem({ icon: Icon, active, onClick, title, collapsed = true, label }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={clsx(
        'relative', BTN.radius,
        'transition-all duration-200 outline-none',
        'text-slate-600 hover:text-slate-700',
        // size based on collapsed state
        collapsed ? BTN.collapsed : BTN.expanded,
        // layout: center the icon using a grid layer for collapsed, flex for expanded
        collapsed ? 'grid place-items-center' : 'flex items-center justify-center gap-3',
      )}
    >
      {/* background/glow layer fully covers the button and is always centered */}
      <span
        aria-hidden
        className={clsx(
          'absolute inset-0', BTN.radius, 'transition-all duration-200',
          active
            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_8px_24px_rgba(124,58,237,0.35)]'
            : 'bg-white/80 hover:bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]'
        )}
      />

      {/* icon layer – absolutely centered via grid parent; sits above bg */}
      <span className={clsx(
        'relative z-[1] grid place-items-center',
        !collapsed && 'flex-shrink-0'
      )}>
        <Icon className={clsx(BTN.icon, active ? 'text-white' : 'text-slate-600')} />
      </span>

      {/* label for expanded state */}
      {!collapsed && label && (
        <span className={clsx(
          'relative z-[1] text-sm font-medium truncate',
          active ? 'text-white' : 'text-slate-600'
        )}>
          {label}
        </span>
      )}
    </button>
  );
}
