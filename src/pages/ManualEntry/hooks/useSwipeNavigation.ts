
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useSwipeNavigation = (triggerHapticFeedback: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    let touchStartX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;

      if (diffX > 100) {
        navigate("/");
        triggerHapticFeedback();
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, triggerHapticFeedback]);
};
