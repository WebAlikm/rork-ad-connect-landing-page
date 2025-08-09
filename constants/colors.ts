const COLORS = {
  // Main colors
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  
  // Brand colors
  primary: '#20B2AA', // Teal
  accent: '#F4E4BC', // Warm sand
  
  // UI colors
  border: '#E5E7EB',
  cardBackground: '#FEFEFE',
  
  // Legacy (keeping for compatibility)
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: '#20B2AA',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#20B2AA',
  },
} as const;

export { COLORS };
export default COLORS;