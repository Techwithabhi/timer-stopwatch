import { motion } from 'framer-motion';

/**
 * Settings panel for theme customization.
 */
export default function SettingsPanel({ theme, onThemeChange, onClose }) {
    const presetThemes = [
        {
            name: 'Cyan Glow',
            bg: '#060b18',
            clockColor: '#e0ffff',
            accent: '#00e5ff',
        },
        {
            name: 'Neon Blue',
            bg: '#050a15',
            clockColor: '#d0e0ff',
            accent: '#448aff',
        },
        {
            name: 'Aqua',
            bg: '#051a1a',
            clockColor: '#b2ffff',
            accent: '#00bfa5',
        },
        {
            name: 'Electric',
            bg: '#0a0520',
            clockColor: '#e8d5ff',
            accent: '#b040ff',
        },
        {
            name: 'Hot Pink',
            bg: '#15050f',
            clockColor: '#ffe0f0',
            accent: '#ff2d87',
        },
        {
            name: 'Lime',
            bg: '#0a1205',
            clockColor: '#e8ffe0',
            accent: '#76ff03',
        },
    ];

    const handleColorChange = (key, value) => {
        onThemeChange({ ...theme, [key]: value });
    };

    return (
        <motion.div
            className="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="settings-panel"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="settings-header">
                    <h2 className="settings-title">🎨 Customize Theme</h2>
                    <button className="settings-close" onClick={onClose} aria-label="Close settings">
                        ✕
                    </button>
                </div>

                {/* Preset Themes */}
                <div className="settings-section">
                    <h3 className="settings-section-title">Presets</h3>
                    <div className="theme-presets">
                        {presetThemes.map((preset) => (
                            <button
                                key={preset.name}
                                className={`theme-preset-btn ${theme.bg === preset.bg && theme.accent === preset.accent ? 'active' : ''
                                    }`}
                                onClick={() => onThemeChange(preset)}
                                aria-label={`${preset.name} theme`}
                            >
                                <span
                                    className="theme-preview"
                                    style={{
                                        background: preset.bg,
                                        border: `2px solid ${preset.accent}`,
                                    }}
                                >
                                    <span
                                        className="theme-preview-dot"
                                        style={{ background: preset.accent }}
                                    />
                                </span>
                                <span className="theme-preset-name">{preset.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Colors */}
                <div className="settings-section">
                    <h3 className="settings-section-title">Custom Colors</h3>

                    <div className="color-picker-group">
                        <label className="color-picker-label">
                            Background
                            <input
                                type="color"
                                value={theme.bg}
                                onChange={(e) => handleColorChange('bg', e.target.value)}
                                className="color-picker"
                            />
                        </label>
                        <label className="color-picker-label">
                            Clock Color
                            <input
                                type="color"
                                value={theme.clockColor}
                                onChange={(e) => handleColorChange('clockColor', e.target.value)}
                                className="color-picker"
                            />
                        </label>
                        <label className="color-picker-label">
                            Accent Color
                            <input
                                type="color"
                                value={theme.accent}
                                onChange={(e) => handleColorChange('accent', e.target.value)}
                                className="color-picker"
                            />
                        </label>
                    </div>
                </div>

                {/* Reset */}
                <button
                    className="settings-reset-btn"
                    onClick={() =>
                        onThemeChange({
                            name: 'Midnight',
                            bg: '#0a0a1a',
                            clockColor: '#e0e0ff',
                            accent: '#6c5ce7',
                        })
                    }
                >
                    Reset to Default
                </button>
            </motion.div>
        </motion.div>
    );
}
