/** @type {const} */
const themeColors = {
  primary: { light: '#1B9E5A', dark: '#34D87A' },
  background: { light: '#FFFFFF', dark: '#111214' },
  surface: { light: '#F4F7F5', dark: '#1A1D1F' },
  foreground: { light: '#1A1A1A', dark: '#F0F0F0' },
  muted: { light: '#6B7280', dark: '#9CA3AF' },
  border: { light: '#E2E8F0', dark: '#2D3748' },
  success: { light: '#16A34A', dark: '#4ADE80' },
  warning: { light: '#EAB308', dark: '#FACC15' },
  error: { light: '#DC2626', dark: '#F87171' },
};

/** High contrast overrides for accessibility */
const highContrastOverrides = {
  light: {
    foreground: '#000000',
    muted: '#333333',
    border: '#000000',
  },
  dark: {
    foreground: '#FFFFFF',
    muted: '#E5E5E5',
    border: '#FFFFFF',
  },
};

module.exports = { themeColors, highContrastOverrides };
