/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F1115',
          950: '#0B0D11',
          900: '#0F1115',
          800: '#14171E',
          700: '#1A1E27',
          600: '#222731',
          500: '#2C323E'
        },
        sage: {
          50: '#F2F6EF',
          100: '#E2EBDC',
          200: '#CBDAC1',
          300: '#B2C7A4',
          400: '#9BB48B',
          500: '#89A578',
          600: '#6E8A5E',
          700: '#566E49'
        },
        silver: {
          100: '#F4F6F8',
          200: '#E3E7EC',
          300: '#C9D0D9',
          400: '#A7B0BC',
          500: '#828C99',
          600: '#5F6874'
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      letterSpacing: {
        tightest: '-0.045em',
        tighter: '-0.03em',
        widest: '0.28em'
      },
      maxWidth: {
        shell: '82rem'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
};
