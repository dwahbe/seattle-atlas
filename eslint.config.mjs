import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  nextPlugin.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  reactHooks.configs.flat['recommended-latest'],
  {
    rules: {
      // Downgrade to warning: setting state in effects is standard for
      // data fetching, browser API initialization, and state resets.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];
