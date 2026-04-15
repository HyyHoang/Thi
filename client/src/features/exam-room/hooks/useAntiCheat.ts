import { useEffect, useRef } from 'react';

interface AntiCheatConfig {
  isFullscreen: boolean;
  isPreventCopy: boolean;
  onViolation: (type: 'fullscreen_exit' | 'tab_switch') => void;
}

export function useAntiCheat({ isFullscreen, isPreventCopy, onViolation }: AntiCheatConfig) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Chống copy
    if (isPreventCopy) {
      const preventCopy = (e: ClipboardEvent | MouseEvent | KeyboardEvent) => {
        e.preventDefault();
        return false;
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'x')) {
          e.preventDefault();
        }
      };

      document.addEventListener('copy', preventCopy);
      document.addEventListener('contextmenu', preventCopy);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('contextmenu', preventCopy);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isPreventCopy]);

  useEffect(() => {
    // 2. Ép Fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        onViolation('fullscreen_exit');
      }
    };

    if (isFullscreen) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
    
    return () => {
      if (isFullscreen) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      }
    };
  }, [isFullscreen, onViolation]);

  useEffect(() => {
    // 3. Rời Tab (Blur)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      onViolation('tab_switch');
    };

    if (isFullscreen || isPreventCopy) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFullscreen, isPreventCopy, onViolation]);

  const requestFullscreen = () => {
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Lỗi khi yêu cầu full screen:", err);
      });
    }
  };

  return { containerRef, requestFullscreen };
}
