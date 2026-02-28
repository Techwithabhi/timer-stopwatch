import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import Stopwatch from './components/Stopwatch';
import Timer from './components/Timer';
import SettingsPanel from './components/SettingsPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { setMuted } from './utils/audio';

const DEFAULT_THEME = {
  name: 'Cyan Glow',
  bg: '#060b18',
  clockColor: '#e0ffff',
  accent: '#00e5ff',
};

/**
 * Main application component.
 * Manages mode selection, theme, and global state.
 */
export default function App() {
  const [mode, setMode] = useLocalStorage('clock-mode', null); // null = landing, 'stopwatch', 'timer'
  const [theme, setTheme] = useLocalStorage('clock-theme', DEFAULT_THEME);
  const [isMuted, setIsMuted] = useLocalStorage('clock-sound-muted', false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayMode, setDisplayMode] = useLocalStorage('clock-display-mode', 'digital');

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--clock-color', theme.clockColor);
    root.style.setProperty('--accent', theme.accent);
  }, [theme]);

  // Sync mute state
  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.code === 'Escape') {
        if (showSettings) setShowSettings(false);
        if (isFullscreen) exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [showSettings, isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  // Listen for fullscreen changes (e.g. user presses Esc natively)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleToggleDisplay = useCallback(() => {
    setDisplayMode((prev) => (prev === 'digital' ? 'analog' : 'digital'));
  }, [setDisplayMode]);

  return (
    <div className="app">
      <Header
        onOpenSettings={() => setShowSettings(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {mode === null && (
            <ModeSelector key="selector" onSelectMode={setMode} />
          )}
          {mode === 'stopwatch' && (
            <Stopwatch
              key="stopwatch"
              onBack={() => setMode(null)}
              displayMode={displayMode}
              onToggleDisplay={handleToggleDisplay}
            />
          )}
          {mode === 'timer' && (
            <Timer
              key="timer"
              onBack={() => setMode(null)}
              displayMode={displayMode}
              onToggleDisplay={handleToggleDisplay}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            key="settings"
            theme={theme}
            onThemeChange={setTheme}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Hint */}
      <div className="shortcuts-hint">
        <span>F — Fullscreen</span>
        <span>Esc — Close</span>
      </div>
    </div>
  );
}
