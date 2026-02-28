import { motion } from 'framer-motion';

/**
 * Reusable control buttons for Stopwatch and Timer.
 *
 * @param {Object} props
 * @param {Array} props.buttons - Array of button configs: { label, icon, onClick, variant, disabled }
 */
export default function Controls({ buttons }) {
    return (
        <div className="controls">
            {buttons.map((btn) => (
                <motion.button
                    key={btn.label}
                    className={`control-btn ${btn.variant || 'default'}`}
                    onClick={btn.onClick}
                    disabled={btn.disabled}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    title={btn.label}
                    aria-label={btn.label}
                >
                    <span className="control-icon">{btn.icon}</span>
                    <span className="control-label">{btn.label}</span>
                </motion.button>
            ))}
        </div>
    );
}
