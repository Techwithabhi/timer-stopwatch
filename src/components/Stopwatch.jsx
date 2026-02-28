import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClockDisplay from './ClockDisplay';
import Controls from './Controls';
import { formatTime } from '../utils/time';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Stopwatch component with start, pause, resume, reset, and lap functionality.
 */
export default function Stopwatch({ onBack, displayMode, onToggleDisplay }) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useLocalStorage('clock-laps', []);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);
    const accumulatedRef = useRef(0);

    // High-precision interval using requestAnimationFrame
    const tick = useCallback(() => {
        if (startTimeRef.current !== null) {
            const now = performance.now();
            setElapsedMs(accumulatedRef.current + (now - startTimeRef.current));
            intervalRef.current = requestAnimationFrame(tick);
        }
    }, []);

    const handleStart = useCallback(() => {
        startTimeRef.current = performance.now();
        setIsRunning(true);
        intervalRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const handlePause = useCallback(() => {
        if (intervalRef.current) {
            cancelAnimationFrame(intervalRef.current);
            intervalRef.current = null;
        }
        accumulatedRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = null;
        setIsRunning(false);
    }, []);

    const handleResume = useCallback(() => {
        startTimeRef.current = performance.now();
        setIsRunning(true);
        intervalRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const handleReset = useCallback(() => {
        if (intervalRef.current) {
            cancelAnimationFrame(intervalRef.current);
            intervalRef.current = null;
        }
        startTimeRef.current = null;
        accumulatedRef.current = 0;
        setElapsedMs(0);
        setIsRunning(false);
        setLaps([]);
    }, [setLaps]);

    const handleLap = useCallback(() => {
        const lapTime = elapsedMs;
        const prevTotal = laps.length > 0 ? laps[0].totalMs : 0;
        const splitMs = lapTime - prevTotal;
        setLaps((prev) => [
            { id: prev.length + 1, splitMs, totalMs: lapTime },
            ...prev,
        ]);
    }, [elapsedMs, laps, setLaps]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                cancelAnimationFrame(intervalRef.current);
            }
        };
    }, []);

    // Determine which buttons to show
    const getButtons = () => {
        if (!isRunning && elapsedMs === 0) {
            return [
                { label: 'Start', icon: '▶', onClick: handleStart, variant: 'primary' },
            ];
        }
        if (isRunning) {
            return [
                { label: 'Lap', icon: '🏁', onClick: handleLap, variant: 'secondary' },
                { label: 'Pause', icon: '⏸', onClick: handlePause, variant: 'warning' },
            ];
        }
        // Paused
        return [
            { label: 'Resume', icon: '▶', onClick: handleResume, variant: 'primary' },
            { label: 'Reset', icon: '↺', onClick: handleReset, variant: 'danger' },
        ];
    };

    // Find best/worst laps
    const bestLap = laps.length > 1 ? laps.reduce((a, b) => a.splitMs < b.splitMs ? a : b) : null;
    const worstLap = laps.length > 1 ? laps.reduce((a, b) => a.splitMs > b.splitMs ? a : b) : null;

    return (
        <motion.div
            className="stopwatch-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
        >
            <div className="view-header">
                <button className="back-btn" onClick={onBack} aria-label="Back to mode selection">
                    ← Back
                </button>
                <h2 className="view-title">Stopwatch</h2>
            </div>

            <ClockDisplay
                timeMs={elapsedMs}
                displayMode={displayMode}
                onToggleDisplay={onToggleDisplay}
                showCentiseconds={true}
            />

            <Controls buttons={getButtons()} />

            {/* Lap History */}
            <AnimatePresence>
                {laps.length > 0 && (
                    <motion.div
                        className="lap-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h3 className="lap-title">Laps</h3>
                        <div className="lap-list">
                            {laps.map((lap) => {
                                let lapClass = '';
                                if (bestLap && lap.id === bestLap.id) lapClass = 'lap-best';
                                if (worstLap && lap.id === worstLap.id) lapClass = 'lap-worst';
                                return (
                                    <motion.div
                                        key={lap.id}
                                        className={`lap-item ${lapClass}`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="lap-number">Lap {lap.id}</span>
                                        <span className="lap-split">{formatTime(lap.splitMs, true)}</span>
                                        <span className="lap-total">{formatTime(lap.totalMs, true)}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
