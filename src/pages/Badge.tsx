import { styled } from '@nextui-org/react';

export const StyledBadge = styled('span', {
  display: 'inline-flex',
  textTransform: 'uppercase',
  padding: '$2 $3',
  margin: '0 2px',
  fontWeight: '$bold',
  borderRadius: '14px',
  letterSpacing: '0.6px',
  lineHeight: 1,
  boxShadow: '1px 2px 5px 0px rgb(0 0 0 / 5%)',
  alignItems: 'center',
  alignSelf: 'center',
  color: '$white',
  variants: {
    type: {
      active: {
        bg: '$successLight',
        color: '$successLightContrast',
      },
      paused: {
        bg: '$cyan50',
        color: '$cyan500',
      },
      vacation: {
        bg: '$warningLight',
        color: '$warningLightContrast',
      },
    },
    size: {
      md: {
        fontSize: '10px',
      },
      lg: {
        fontSize: '14px',
      },
      xl: {
        fontSize: '18px',
      },
    }
  },
  defaultVariants: {
    type: 'active',
    size: 'md',
  },
});
