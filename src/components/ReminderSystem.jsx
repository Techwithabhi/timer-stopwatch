/**
 * ReminderSystem component for configuring interval reminders in Timer mode.
 */
export default function ReminderSystem({ enabled, onToggle, interval, onIntervalChange }) {
    const presets = [5, 10, 15, 30, 45, 60];

    return (
        <div className="reminder-system">
            <div className="reminder-header">
                <h3 className="reminder-title">⏰ Smart Reminders</h3>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => onToggle(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                </label>
            </div>

            {enabled && (
                <div className="reminder-config">
                    <p className="reminder-desc">Get reminders at regular intervals</p>
                    <div className="reminder-presets">
                        {presets.map((min) => (
                            <button
                                key={min}
                                className={`reminder-preset-btn ${interval === min ? 'active' : ''}`}
                                onClick={() => onIntervalChange(min)}
                            >
                                {min}m
                            </button>
                        ))}
                    </div>
                    <div className="reminder-custom">
                        <label className="reminder-custom-label">Custom (minutes):</label>
                        <input
                            type="number"
                            className="reminder-custom-input"
                            min={1}
                            max={120}
                            value={interval}
                            onChange={(e) => onIntervalChange(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
