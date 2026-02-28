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
    }, []);

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
                <div className="timer-running">
                    {timerName && <p className="timer-purpose">{timerName}</p>}

                    <ClockDisplay
                        timeMs={remainingMs}
                        displayMode={displayMode}
                        onToggleDisplay={onToggleDisplay}
                        totalMs={totalMs}
                    />

                    {/* Progress Bar */}
                    <div className="progress-bar-wrapper">
                        <motion.div
                            className="progress-bar-fill"
                            style={{ width: `${progress * 100}%` }}
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
