// Centralized theme configuration for Admin Dashboard
export const themeConfig = {
  // Color schemes
  colors: {
    primary: {
      light: 'from-blue-500 to-purple-600',
      dark: 'from-blue-600 to-purple-700',
      focus: 'focus:border-blue-500 dark:focus:border-blue-400',
      ring: 'focus:ring-blue-200 dark:focus:ring-blue-800'
    },
    success: {
      light: 'from-emerald-500 to-teal-600',
      dark: 'from-emerald-600 to-teal-700',
      focus: 'focus:border-emerald-500 dark:focus:border-emerald-400',
      ring: 'focus:ring-emerald-200 dark:focus:ring-emerald-800'
    },
    warning: {
      light: 'from-orange-500 to-yellow-600',
      dark: 'from-orange-600 to-yellow-700',
      focus: 'focus:border-orange-500 dark:focus:border-orange-400',
      ring: 'focus:ring-orange-200 dark:focus:ring-orange-800'
    },
    danger: {
      light: 'from-red-500 to-pink-600',
      dark: 'from-red-600 to-pink-700',
      focus: 'focus:border-red-500 dark:focus:border-red-400',
      ring: 'focus:ring-red-200 dark:focus:ring-red-800'
    },
    info: {
      light: 'from-purple-500 to-pink-600',
      dark: 'from-purple-600 to-pink-700',
      focus: 'focus:border-purple-500 dark:focus:border-purple-400',
      ring: 'focus:ring-purple-200 dark:focus:ring-purple-800'
    },
    search: {
      light: 'from-indigo-500 to-purple-600',
      dark: 'from-indigo-600 to-purple-700',
      focus: 'focus:border-indigo-500 dark:focus:border-indigo-400',
      ring: 'focus:ring-indigo-200 dark:focus:ring-indigo-800'
    },
    edit: {
      light: 'from-amber-500 to-orange-600',
      dark: 'from-amber-600 to-orange-700',
      focus: 'focus:border-amber-500 dark:focus:border-amber-400',
      ring: 'focus:ring-amber-200 dark:focus:ring-amber-800'
    },
    secondary: {
      light: 'from-slate-500 to-gray-600',
      dark: 'from-slate-600 to-gray-700',
      focus: 'focus:border-slate-500 dark:focus:border-slate-400',
      ring: 'focus:ring-slate-200 dark:focus:ring-slate-800'
    }
  },

  // Background gradients
  backgrounds: {
    main: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    card: 'bg-white dark:bg-slate-800',
    pricing: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
    specs: 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
    images: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    search: 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-600'
  },

  // Border styles
  borders: {
    card: 'border border-slate-200 dark:border-slate-700',
    input: 'border-2 border-slate-200 dark:border-slate-600',
    pricing: 'border border-blue-200 dark:border-blue-800',
    specs: 'border border-orange-200 dark:border-orange-800',
    images: 'border border-purple-200 dark:border-purple-800',
    search: 'border border-slate-200 dark:border-slate-600'
  },

  // Text colors
  text: {
    primary: 'text-slate-800 dark:text-slate-100',
    secondary: 'text-slate-700 dark:text-slate-300',
    muted: 'text-slate-600 dark:text-slate-400',
    placeholder: 'placeholder-slate-400 dark:placeholder-slate-500'
  },

  // Spacing
  spacing: {
    section: 'space-y-8',
    card: 'p-6',
    input: 'px-4 py-3',
    button: 'py-4 px-8'
  },

  // Border radius
  radius: {
    card: 'rounded-3xl',
    input: 'rounded-2xl',
    button: 'rounded-2xl',
    icon: 'rounded-xl'
  },

  // Shadows
  shadows: {
    card: 'shadow-lg hover:shadow-xl',
    button: 'shadow-lg hover:shadow-xl'
  },

  // Transitions
  transitions: 'transition-all duration-300',

  // Icons
  icons: {
    create: '📦',
    manage: '📋',
    edit: '✏️',
    pricing: '💰',
    specs: '⚙️',
    images: '📸',
    search: '🔍',
    save: '💾',
    delete: '🗑️',
    add: '➕',
    remove: '🗑️'
  }
};

// Helper function to get theme classes
export const getThemeClasses = (type, variant = 'light') => {
  const config = themeConfig[type];
  if (!config) return '';
  
  if (typeof config === 'string') return config;
  if (typeof config === 'object' && config[variant]) return config[variant];
  
  return '';
};

// Helper function to create section header
export const createSectionHeader = (title, icon, color = 'primary') => {
  return {
    title,
    icon,
    color,
    classes: `flex items-center gap-3 mb-6`
  };
};
