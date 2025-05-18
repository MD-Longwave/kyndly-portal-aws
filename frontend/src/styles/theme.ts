// Design Tokens
export const colors = {
  // Primary Colors
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  // Neutral Colors
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Status Colors
  status: {
    success: {
      light: '#dcfce7',
      dark: '#166534',
    },
    warning: {
      light: '#fef3c7',
      dark: '#92400e',
    },
    error: {
      light: '#fee2e2',
      dark: '#991b1b',
    },
    info: {
      light: '#dbeafe',
      dark: '#1e40af',
    },
  },
};

// Common Styles
export const commonStyles = {
  // Card Styles
  card: {
    base: 'rounded-2xl shadow-lg transition-shadow duration-300',
    light: 'bg-white border border-slate-200 hover:shadow-xl',
    dark: 'bg-[#042C3A] border border-[#46BC97] hover:shadow-xl',
  },
  // Button Styles
  button: {
    base: 'inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all duration-200',
    primary: {
      light: 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white',
      dark: 'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white',
    },
    secondary: {
      light: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
      dark: 'bg-[#042C3A] border border-[#46BC97] text-slate-200 hover:bg-[#031C25]',
    },
  },
  // Input Styles
  input: {
    base: 'rounded-lg transition-colors duration-200',
    light: 'bg-white border border-slate-200 focus:border-teal-500 focus:ring-teal-500',
    dark: 'bg-[#042C3A] border border-[#46BC97]/50 focus:border-[#46BC97] focus:ring-[#46BC97]',
  },
  // Typography
  typography: {
    h1: {
      light: 'text-2xl font-bold text-slate-900 tracking-tight',
      dark: 'text-2xl font-bold text-white tracking-tight',
    },
    h2: {
      light: 'text-xl font-semibold text-slate-800 tracking-tight',
      dark: 'text-xl font-semibold text-slate-100 tracking-tight',
    },
    h3: {
      light: 'text-lg font-medium text-slate-700 tracking-tight',
      dark: 'text-lg font-medium text-slate-200 tracking-tight',
    },
    body: {
      light: 'text-base text-slate-600',
      dark: 'text-base text-slate-300',
    },
    caption: {
      light: 'text-sm text-slate-500',
      dark: 'text-sm text-slate-400',
    },
    label: {
      light: 'text-sm font-medium text-slate-700',
      dark: 'text-sm font-medium text-slate-200',
    },
  },
  // Status Badge
  badge: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    success: {
      light: 'bg-emerald-50 text-emerald-700',
      dark: 'bg-emerald-900/30 text-emerald-300',
    },
    warning: {
      light: 'bg-amber-50 text-amber-700',
      dark: 'bg-amber-900/30 text-amber-300',
    },
    error: {
      light: 'bg-red-50 text-red-700',
      dark: 'bg-red-900/30 text-red-300',
    },
    info: {
      light: 'bg-blue-50 text-blue-700',
      dark: 'bg-blue-900/30 text-blue-300',
    },
  },
  // Layout
  layout: {
    container: {
      light: 'bg-gradient-to-br from-white to-slate-50',
      dark: 'bg-gradient-to-br from-[#042C3A] to-[#031C25]',
    },
    section: {
      light: 'bg-white border border-slate-200',
      dark: 'bg-[#042C3A] border border-[#46BC97]',
    },
  },
  // Animation
  animation: {
    hover: 'transition-all duration-200',
    scale: 'hover:scale-105',
    fade: 'transition-opacity duration-200',
  },
};

// Helper function to get theme-aware styles
export const getThemeStyles = (isDark: boolean) => {
  return {
    card: isDark ? commonStyles.card.dark : commonStyles.card.light,
    button: {
      primary: isDark ? commonStyles.button.primary.dark : commonStyles.button.primary.light,
      secondary: isDark ? commonStyles.button.secondary.dark : commonStyles.button.secondary.light,
    },
    input: isDark ? commonStyles.input.dark : commonStyles.input.light,
    typography: {
      h1: isDark ? commonStyles.typography.h1.dark : commonStyles.typography.h1.light,
      h2: isDark ? commonStyles.typography.h2.dark : commonStyles.typography.h2.light,
      h3: isDark ? commonStyles.typography.h3.dark : commonStyles.typography.h3.light,
      body: isDark ? commonStyles.typography.body.dark : commonStyles.typography.body.light,
      caption: isDark ? commonStyles.typography.caption.dark : commonStyles.typography.caption.light,
      label: isDark ? commonStyles.typography.label.dark : commonStyles.typography.label.light,
    },
    badge: {
      success: isDark ? commonStyles.badge.success.dark : commonStyles.badge.success.light,
      warning: isDark ? commonStyles.badge.warning.dark : commonStyles.badge.warning.light,
      error: isDark ? commonStyles.badge.error.dark : commonStyles.badge.error.light,
      info: isDark ? commonStyles.badge.info.dark : commonStyles.badge.info.light,
    },
    layout: {
      container: isDark ? commonStyles.layout.container.dark : commonStyles.layout.container.light,
      section: isDark ? commonStyles.layout.section.dark : commonStyles.layout.section.light,
    },
  };
}; 