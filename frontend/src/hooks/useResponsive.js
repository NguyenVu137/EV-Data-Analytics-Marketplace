import React from 'react';
import useWindowSize from './useWindowSize';

const MOBILE_BREAKPOINT = 768;

const useResponsive = () => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(width < MOBILE_BREAKPOINT);
  }, [width]);

  return {
    isMobile,
    isDesktop: !isMobile,
    windowWidth: width
  };
};

export default useResponsive;