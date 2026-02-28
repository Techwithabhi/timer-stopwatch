import { motion } from 'framer-motion';

/**
 * Landing page component for selecting Stopwatch or Timer mode.
 */
export default function ModeSelector({ onSelectMode }) {
    const cards = [
        {
            mode: 'stopwatch',
            icon: '⏱️',
            title: 'Stopwatch',
            description: 'Track elapsed time with lap support',
        },
        {
            mode: 'timer',
            icon: '⏳',
            title: 'Timer',
            description: 'Countdown with reminders & goals',
        },
    ];

    return (
        <motion.div
            className="mode-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
        >
            <motion.h1
                className="mode-selector-title"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                Choose Your Mode
            </motion.h1>
            <div className="mode-cards">
                {cards.map((card, index) => (
                    <motion.button
                        key={card.mode}
                        className="mode-card"
                        onClick={() => onSelectMode(card.mode)}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <span className="mode-card-icon">{card.icon}</span>
                        <h2 className="mode-card-title">{card.title}</h2>
                        <p className="mode-card-desc">{card.description}</p>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
