import type { Config } from 'tailwindcss';
const c = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
export default { darkMode: 'class', content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { paper: c('paper'), card: c('card'), ink: c('ink'), moss: c('moss'), accent: c('accent') }, fontFamily: { sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'], display: ['var(--font-display)', 'Georgia', 'serif'] } } }, plugins: [] } satisfies Config;
