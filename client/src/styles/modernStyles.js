// Modern UI Styles - Shared across all pages
// FFT Solar CRM

// Page container with gradient background
export const pageContainerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
  mx: -3,
  mt: -3,
  p: 3,
};

// Page title style
export const pageTitleStyle = {
  fontWeight: 800,
  mb: 4,
  color: '#0f172a',
  letterSpacing: '-0.02em',
  fontSize: '1.75rem',
};

// Modern card with rounded corners
export const modernCardStyle = {
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
};

// Modern table container
export const modernTableContainerStyle = {
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  overflow: 'hidden',
};

// Modern table header
export const modernTableHeadStyle = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#475569',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
    py: 2,
  },
};

// Modern table row
export const modernTableRowStyle = {
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
  },
  '& .MuiTableCell-body': {
    borderBottom: '1px solid #e2e8f0',
    py: 1.5,
  },
};

// Modern button style
export const modernButtonStyle = {
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  px: 3,
  py: 1.25,
  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
};

// Modern secondary button
export const modernSecondaryButtonStyle = {
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  px: 3,
  py: 1.25,
  border: '2px solid #e2e8f0',
  color: '#475569',
  '&:hover': {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
  },
};

// Modern select/input style
export const modernInputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'white',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3b82f6',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3b82f6',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3b82f6',
  },
};

// Modern chip styles
export const getModernChipStyle = (variant) => {
  const variants = {
    success: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      color: '#065f46',
      fontWeight: 600,
    },
    warning: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      color: '#92400e',
      fontWeight: 600,
    },
    info: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      color: '#1e40af',
      fontWeight: 600,
    },
    error: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      color: '#991b1b',
      fontWeight: 600,
    },
    default: {
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      color: '#475569',
      fontWeight: 600,
    },
    primary: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      color: '#1e40af',
      fontWeight: 600,
    },
    secondary: {
      background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      color: '#5b21b6',
      fontWeight: 600,
    },
  };
  return {
    ...variants[variant] || variants.default,
    borderRadius: '8px',
    px: 0.5,
  };
};

// Modern icon button
export const modernIconButtonStyle = {
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    transform: 'scale(1.05)',
  },
};

// Header bar style
export const headerBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 4,
  flexWrap: 'wrap',
  gap: 2,
};

// Filter container style
export const filterContainerStyle = {
  display: 'flex',
  gap: 2,
  alignItems: 'center',
  flexWrap: 'wrap',
};

// Gradient text colors
export const gradientTextStyles = {
  green: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  blue: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  red: {
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  orange: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  purple: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
};

// Modern form styles
export const modernFormCardStyle = {
  borderRadius: '24px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  p: 4,
};

// Login page specific styles
export const loginContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

export const loginCardStyle = {
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  p: 5,
  width: '100%',
  maxWidth: 420,
};

