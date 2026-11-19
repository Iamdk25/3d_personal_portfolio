module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'public/draco', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    { files: ['*.config.js'], env: { node: true } },
    { files: ['src/components/canvas/**/*.jsx'], rules: { 'react/no-unknown-property': 'off' } },
    {
      files: ['src/context/SiteContext.jsx'],
      rules: { 'react-refresh/only-export-components': ['warn', { allowExportNames: ['useSite'] }] },
    },
  ],
}
