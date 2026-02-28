import { useState, useEffect } from 'react';
import { formatDate, formatLiveTime } from '../utils/time';
import { motion } from 'framer-motion';

/**
 * Header component displaying live date/time, settings, sound toggle, and fullscreen.
 */
export default function Header({ onOpenSettings, isMuted, onToggleMute, onToggleFullscreen, isFullscreen }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.header
            className="header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="header-time">
                <span className="header-date">{formatDate(now)}</span>
                <span className="header-clock">{formatLiveTime(now)}</span>
            </div>
            <div className="header-actions">
                <button
                    className="icon-btn"
                    onClick={onToggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>
                <button
                    className="icon-btn"
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                    {isFullscreen ? '⛶' : '⛶'}
                </button>
                <button
                    className="icon-btn"
                    onClick={onOpenSettings}
                    title="Settings"
                    aria-label="Open settings"
                >
                    ⚙️
                </button>
            </div>
        </motion.header>
    );
}
