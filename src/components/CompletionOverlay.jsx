import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Full-screen completion overlay with confetti and celebration message.
 */
export default function CompletionOverlay({ timerName, onDismiss }) {
    const hasLaunched = useRef(false);

    useEffect(() => {
        if (hasLaunched.current) return;
        hasLaunched.current = true;

        // Launch confetti bursts
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff'],
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();

        // Big center burst
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff'],
            });
        }, 500);
    }, []);

    return (
        <motion.div
            className="completion-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="completion-content"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
            >
                <motion.span
                    className="completion-emoji"
                    animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                    🎯
                </motion.span>
                <h2 className="completion-title">Target Achieved!</h2>
                {timerName && <p className="completion-name">"{timerName}" completed</p>}
                <p className="completion-subtitle">Great job staying focused! 🏆</p>
                <motion.button
                    className="completion-btn"
                    onClick={onDismiss}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Start New Timer
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
