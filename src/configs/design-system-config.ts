export const designSystem = {
  // 颜色系统
  colors: {
    primary: {
      50: 'hsl(213 94% 98%)',
      100: 'hsl(213 94% 95%)',
      200: 'hsl(213 94% 90%)',
      300: 'hsl(213 94% 80%)',
      400: 'hsl(213 94% 68%)',
      500: 'hsl(221 83% 53%)', // 主色
      600: 'hsl(221 83% 43%)',
      700: 'hsl(221 83% 33%)',
      800: 'hsl(221 83% 23%)',
      900: 'hsl(221 83% 13%)',
    },
    secondary: {
      50: 'hsl(262 83% 98%)',
      100: 'hsl(262 83% 95%)',
      200: 'hsl(262 83% 90%)',
      300: 'hsl(262 83% 80%)',
      400: 'hsl(262 83% 68%)',
      500: 'hsl(262 83% 58%)', // 紫色
      600: 'hsl(262 83% 48%)',
      700: 'hsl(262 83% 38%)',
      800: 'hsl(262 83% 28%)',
      900: 'hsl(262 83% 18%)',
    },
    accent: {
      50: 'hsl(43 96% 98%)',
      100: 'hsl(43 96% 95%)',
      200: 'hsl(43 96% 90%)',
      300: 'hsl(43 96% 80%)',
      400: 'hsl(43 96% 68%)',
      500: 'hsl(43 96% 56%)', // 黄色
      600: 'hsl(43 96% 46%)',
      700: 'hsl(43 96% 36%)',
      800: 'hsl(43 96% 26%)',
      900: 'hsl(43 96% 16%)',
    },
    gray: {
      50: 'hsl(210 40% 98%)',
      100: 'hsl(210 40% 96%)',
      200: 'hsl(214 32% 91%)',
      300: 'hsl(213 27% 84%)',
      400: 'hsl(215 20% 65%)',
      500: 'hsl(215 16% 47%)',
      600: 'hsl(215 14% 34%)',
      700: 'hsl(215 12% 23%)',
      800: 'hsl(215 14% 14%)',
      900: 'hsl(222 84% 5%)',
    },
  },

  // 字体系统
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // 间距系统
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
    '5xl': '8rem', // 128px
    '6xl': '12rem', // 192px
  },

  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.375rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    full: '9999px',
  },

  // 阴影系统
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // 响应式断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px', // 您的设计稿基准
    '4xl': '2560px',
  },

  // 动画系统
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// 导出常用值
export const colors = designSystem.colors;
export const typography = designSystem.typography;
export const spacing = designSystem.spacing;
export const borderRadius = designSystem.borderRadius;
export const boxShadow = designSystem.boxShadow;
export const breakpoints = designSystem.breakpoints;
