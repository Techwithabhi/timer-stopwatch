import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClockDisplay from './ClockDisplay';
import Controls from './Controls';
import ReminderSystem from './ReminderSystem';
import CompletionOverlay from './CompletionOverlay';
import { parseTime, validateTimeInput } from '../utils/time';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { playReminderSound, playCompletionSound } from '../utils/audio';

// Motivational messages for reminders
const MOTIVATIONAL_MESSAGES = [
    "Keep going! You're doing great! 💪",
    "Stay focused, you're on track! 🎯",
    "Halfway there — push through! 🚀",
    "Consistency is the key to success! 🔑",
    "You're making progress! Don't stop! ⭐",
    "Great rhythm! Keep it up! 🎵",
    "Focus mode activated! 🧠",
    "Every second counts — you got this! ⏰",
];

// Quick-start timer presets with activity-themed data
const TIMER_PRESETS = [
    {
        icon: '📚', name: 'Study Session', hours: 1, minutes: 0, seconds: 0,
        color: '#448aff', glowColor: 'rgba(68, 138, 255, 0.3)',
        bgEmoji: '📖', tip: 'Stay focused. Take short breaks every 25 minutes.',
        bgGradient: 'radial-gradient(ellipse at 30% 60%, rgba(68, 138, 255, 0.08) 0%, transparent 60%)',
    },
    {
        icon: '🏋️', name: 'Gym Workout', hours: 0, minutes: 45, seconds: 0,
        color: '#ff5252', glowColor: 'rgba(255, 82, 82, 0.3)',
        bgEmoji: '💪', tip: 'Push your limits! Rest 60s between sets.',
        bgGradient: 'radial-gradient(ellipse at 70% 40%, rgba(255, 82, 82, 0.08) 0%, transparent 60%)',
    },
    {
        icon: '🏃', name: 'Running', hours: 0, minutes: 30, seconds: 0,
        color: '#00e676', glowColor: 'rgba(0, 230, 118, 0.3)',
        bgEmoji: '🏅', tip: 'Maintain a steady pace. Hydrate well!',
        bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(0, 230, 118, 0.08) 0%, transparent 60%)',
    },
    {
        icon: '🍳', name: 'Cooking', hours: 0, minutes: 20, seconds: 0,
        color: '#ffab40', glowColor: 'rgba(255, 171, 64, 0.3)',
        bgEmoji: '👨‍🍳', tip: 'Prep ingredients first. Don\'t rush the cook!',
        bgGradient: 'radial-gradient(ellipse at 40% 70%, rgba(255, 171, 64, 0.08) 0%, transparent 60%)',
    },
    {
        icon: '🧘', name: 'Meditation', hours: 0, minutes: 15, seconds: 0,
        color: '#b040ff', glowColor: 'rgba(176, 64, 255, 0.3)',
        bgEmoji: '🕊️', tip: 'Breathe deeply. Let thoughts pass like clouds.',
        bgGradient: 'radial-gradient(ellipse at 50% 50%, rgba(176, 64, 255, 0.08) 0%, transparent 60%)',
    },
    {
        icon: '💤', name: 'Power Nap', hours: 0, minutes: 25, seconds: 0,
        color: '#00e5ff', glowColor: 'rgba(0, 229, 255, 0.3)',
        bgEmoji: '🌙', tip: 'Close your eyes. You\'ll wake up refreshed!',
        bgGradient: 'radial-gradient(ellipse at 60% 50%, rgba(0, 229, 255, 0.08) 0%, transparent 60%)',
    },
];

/**
 * Timer component with countdown, reminders, custom naming, and completion celebration.
 */
export default function Timer({ onBack, displayMode, onToggleDisplay }) {
    // Time input state
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    // Timer state
    const [totalMs, setTotalMs] = useState(0);
    const [remainingMs, setRemainingMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    // Timer name
    const [timerName, setTimerName] = useLocalStorage('clock-timer-name', '');

    // Reminder state
    const [reminderEnabled, setReminderEnabled] = useLocalStorage('clock-reminder-enabled', false);
    const [reminderInterval, setReminderInterval] = useLocalStorage('clock-reminder-interval', 30);
    const [showReminderToast, setShowReminderToast] = useState(false);
    const [reminderMessage, setReminderMessage] = useState('');

    // Refs
    const intervalRef = useRef(null);
    const endTimeRef = useRef(null);
    const lastReminderRef = useRef(0);
    const totalMsRef = useRef(0);

    // Combined set + start: calculates ms directly to avoid stale state
    const handleStartTimer = useCallback(() => {
        if (!validateTimeInput(hours, minutes, seconds)) return;
        const ms = parseTime(hours, minutes, seconds);
        totalMsRef.current = ms;
        setTotalMs(ms);
        setRemainingMs(ms);
        setIsStarted(true);
        setIsCompleted(false);
        lastReminderRef.current = 0;
        endTimeRef.current = Date.now() + ms;
        setIsRunning(true);
    }, [hours, minutes, seconds]);

    const handlePause = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    }, []);

    const handleResume = useCallback(() => {
        endTimeRef.current = Date.now() + remainingMs;
        setIsRunning(true);
    }, [remainingMs]);

    const handleReset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
        setIsStarted(false);
        setIsCompleted(false);
        setRemainingMs(0);
        setTotalMs(0);
        lastReminderRef.current = 0;
        setActivePreset(null);
    }, []);

    // Apply a preset template
    const handlePresetSelect = useCallback((preset) => {
        setHours(preset.hours);
        setMinutes(preset.minutes);
        setSeconds(preset.seconds);
        setTimerName(preset.name);
        setActivePreset(preset);
    }, [setTimerName]);

    // Main countdown effect
    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, endTimeRef.current - now);
            setRemainingMs(remaining);

            // Check reminders
            if (reminderEnabled && reminderInterval > 0) {
                const elapsed = totalMsRef.current - remaining;
                const intervalMs = reminderInterval * 60 * 1000;
                if (elapsed - lastReminderRef.current >= intervalMs && remaining > 0) {
                    lastReminderRef.current = Math.floor(elapsed / intervalMs) * intervalMs;
                    playReminderSound();
                    setReminderMessage(
                        MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
                    );
                    setShowReminderToast(true);
                    setTimeout(() => setShowReminderToast(false), 4000);
                }
            }

            // Check completion
            if (remaining <= 0) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setIsRunning(false);
                setIsCompleted(true);
                playCompletionSound();
            }
        }, 50);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, totalMs, reminderEnabled, reminderInterval]);

    // Progress
    const progress = totalMs > 0 ? Math.max(0, Math.min(1, 1 - remainingMs / totalMs)) : 0;

    // Clamp input helpers
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    const getButtons = () => {
        if (!isStarted) {
            return [
                {
                    label: 'Start',
                    icon: '▶',
                    onClick: handleStartTimer,
                    variant: 'primary',
                    disabled: !validateTimeInput(hours, minutes, seconds),
                },
            ];
        }
        if (isRunning) {
            return [
                { label: 'Pause', icon: '⏸', onClick: handlePause, variant: 'warning' },
                { label: 'Reset', icon: '↺', onClick: handleReset, variant: 'danger' },
            ];
        }
        if (isCompleted) {
            return [
                { label: 'New Timer', icon: '↺', onClick: handleReset, variant: 'primary' },
            ];
        }
        // Paused
        return [
            { label: 'Resume', icon: '▶', onClick: handleResume, variant: 'primary' },
            { label: 'Reset', icon: '↺', onClick: handleReset, variant: 'danger' },
        ];
    };

    return (
        <motion.div
            className="timer-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
        >
            <div className="view-header">
                <button className="back-btn" onClick={onBack} aria-label="Back to mode selection">
                    ← Back
                </button>
                <h2 className="view-title">Timer</h2>
            </div>

            {/* Timer Name */}
            <div className="timer-name-wrapper">
                <input
                    type="text"
                    className="timer-name-input"
                    placeholder="Name your timer (e.g., Study Session)"
                    value={timerName}
                    onChange={(e) => setTimerName(e.target.value)}
                    maxLength={40}
                />
            </div>

            {!isStarted ? (
                /* Time Input Screen */
                <motion.div
                    className="time-input-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Preset Templates */}
                    <div className="presets-section">
                        <h3 className="presets-title">Quick Start</h3>
                        <div className="presets-grid">
                            {TIMER_PRESETS.map((preset, index) => (
                                <motion.button
                                    key={preset.name}
                                    className={`preset-card ${timerName === preset.name ? 'active' : ''}`}
                                    onClick={() => handlePresetSelect(preset)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06, duration: 0.3 }}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ '--preset-color': preset.color }}
                                >
                                    <span className="preset-icon">{preset.icon}</span>
                                    <span className="preset-name">{preset.name}</span>
                                    <span className="preset-time">
                                        {preset.hours > 0 ? `${preset.hours}h ` : ''}
                                        {preset.minutes > 0 ? `${preset.minutes}m` : ''}
                                        {preset.seconds > 0 ? ` ${preset.seconds}s` : ''}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="presets-divider">
                        <span>or set custom time</span>
                    </div>

                    <div className="time-input-group">
                        <div className="time-input-col">
                            <label className="time-input-label">Hours</label>
                            <input
                                type="number"
                                className="time-input"
                                min={0}
                                max={23}
                                value={hours}
                                onChange={(e) => setHours(clamp(parseInt(e.target.value) || 0, 0, 23))}
                            />
                            <input
                                type="range"
                                className="time-slider"
                                min={0}
                                max={23}
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value))}
                            />
                        </div>
                        <span className="time-input-separator">:</span>
                        <div className="time-input-col">
                            <label className="time-input-label">Minutes</label>
                            <input
                                type="number"
                                className="time-input"
                                min={0}
                                max={59}
                                value={minutes}
                                onChange={(e) => setMinutes(clamp(parseInt(e.target.value) || 0, 0, 59))}
                            />
                            <input
                                type="range"
                                className="time-slider"
                                min={0}
                                max={59}
                                value={minutes}
                                onChange={(e) => setMinutes(parseInt(e.target.value))}
                            />
                        </div>
                        <span className="time-input-separator">:</span>
                        <div className="time-input-col">
                            <label className="time-input-label">Seconds</label>
                            <input
                                type="number"
                                className="time-input"
                                min={0}
                                max={59}
                                value={seconds}
                                onChange={(e) => setSeconds(clamp(parseInt(e.target.value) || 0, 0, 59))}
                            />
                            <input
                                type="range"
                                className="time-slider"
                                min={0}
                                max={59}
                                value={seconds}
                                onChange={(e) => setSeconds(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Reminder Settings */}
                    <ReminderSystem
                        enabled={reminderEnabled}
                        onToggle={setReminderEnabled}
                        interval={reminderInterval}
                        onIntervalChange={setReminderInterval}
                    />
                </motion.div>
            ) : (
                /* Running/Paused Timer Display */
                <div
                    className={`timer-running ${activePreset ? 'themed' : ''}`}
                    style={activePreset ? {
                        '--activity-color': activePreset.color,
                        '--activity-glow': activePreset.glowColor,
                        '--activity-bg': activePreset.bgGradient,
                    } : {}}
                >
                    {/* Activity background watermark */}
                    {activePreset && (
                        <div className="activity-watermark">{activePreset.bgEmoji}</div>
                    )}

                    {/* Activity header badge */}
                    {activePreset ? (
                        <div className="activity-header">
                            <span className="activity-header-icon">{activePreset.icon}</span>
                            <div className="activity-header-info">
                                <h3 className="activity-header-name">{timerName}</h3>
                                <p className="activity-header-tip">{activePreset.tip}</p>
                            </div>
                        </div>
                    ) : (
                        timerName && <p className="timer-purpose">{timerName}</p>
                    )}

                    <ClockDisplay
                        timeMs={remainingMs}
                        displayMode={displayMode}
                        onToggleDisplay={onToggleDisplay}
                        totalMs={totalMs}
                        accentColor={activePreset ? activePreset.color : 'var(--accent)'}
                    />

                    {/* Progress Bar */}
                    <div className="progress-bar-wrapper">
                        <motion.div
                            className="progress-bar-fill"
                            style={{
                                width: `${progress * 100}%`,
                                background: activePreset
                                    ? `linear-gradient(90deg, ${activePreset.color}, color-mix(in srgb, ${activePreset.color}, white 30%))`
                                    : undefined,
                                boxShadow: activePreset
                                    ? `0 0 12px ${activePreset.glowColor}`
                                    : undefined,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="progress-label">{Math.round(progress * 100)}% complete</p>
                </div>
            )}

            <Controls buttons={getButtons()} />

            {/* Reminder Toast */}
            <AnimatePresence>
                {showReminderToast && (
                    <motion.div
                        className="reminder-toast"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <span className="reminder-toast-icon">🔔</span>
                        <span className="reminder-toast-msg">{reminderMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion Overlay */}
            <AnimatePresence>
                {isCompleted && (
                    <CompletionOverlay
                        timerName={timerName}
                        onDismiss={handleReset}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
