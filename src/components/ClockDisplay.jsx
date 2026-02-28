import { useMemo } from 'react';

/**
 * ClockDisplay component supporting both Digital and Analog (SVG) display modes.
 *
 * @param {Object} props
 * @param {number} props.timeMs - Time in milliseconds to display
 * @param {string} props.displayMode - 'digital' or 'analog'
 * @param {Function} props.onToggleDisplay - Callback to switch display mode
 * @param {number} [props.totalMs] - Total time for progress ring (timer mode)
 * @param {boolean} [props.showCentiseconds] - Show centiseconds in digital mode
 * @param {string} [props.accentColor] - Accent color for the clock
 */
export default function ClockDisplay({
    timeMs,
    displayMode,
    onToggleDisplay,
    totalMs = 0,
    showCentiseconds = false,
    accentColor = 'var(--accent)',
}) {
    return (
        <div className="clock-display">
            {displayMode === 'digital' ? (
                <DigitalClock timeMs={timeMs} showCentiseconds={showCentiseconds} />
            ) : (
                <AnalogClock timeMs={timeMs} totalMs={totalMs} accentColor={accentColor} />
            )}
            <button
                className="display-toggle-btn"
                onClick={onToggleDisplay}
                title={`Switch to ${displayMode === 'digital' ? 'Analog' : 'Digital'} display`}
            >
                {displayMode === 'digital' ? '🕐' : '🔢'}
            </button>
        </div>
    );
}

function DigitalClock({ timeMs, showCentiseconds }) {
    const totalSeconds = Math.floor(timeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((timeMs % 1000) / 10);
    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className="digital-clock" aria-label={`Time: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}>
            <span className="digit-group">
                <span className="digit">{pad(hours)}</span>
                <span className="digit-label">HRS</span>
            </span>
            <span className="digit-separator">:</span>
            <span className="digit-group">
                <span className="digit">{pad(minutes)}</span>
                <span className="digit-label">MIN</span>
            </span>
            <span className="digit-separator">:</span>
            <span className="digit-group">
                <span className="digit">{pad(seconds)}</span>
                <span className="digit-label">SEC</span>
            </span>
            {showCentiseconds && (
                <>
                    <span className="digit-separator small">.</span>
                    <span className="digit-group">
                        <span className="digit small">{pad(centiseconds)}</span>
                    </span>
                </>
            )}
        </div>
    );
}

function AnalogClock({ timeMs, totalMs, accentColor }) {
    const totalSeconds = timeMs / 1000;
    const hours = totalSeconds / 3600;
    const minutes = (totalSeconds % 3600) / 60;
    const seconds = totalSeconds % 60;

    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    // Progress ring
    const progress = totalMs > 0 ? Math.max(0, 1 - timeMs / totalMs) : 0;
    const circumference = 2 * Math.PI * 115;
    const strokeDashoffset = circumference * (1 - progress);

    const tickMarks = useMemo(() => {
        const marks = [];
        for (let i = 0; i < 60; i++) {
            const angle = i * 6;
            const isHour = i % 5 === 0;
            marks.push(
                <line
                    key={i}
                    x1="130"
                    y1={isHour ? '22' : '26'}
                    x2="130"
                    y2="32"
                    stroke="var(--clock-color, #e0e0e0)"
                    strokeWidth={isHour ? '2' : '1'}
                    opacity={isHour ? '0.8' : '0.4'}
                    transform={`rotate(${angle} 130 130)`}
                />
            );
        }
        return marks;
    }, []);

    const hourNumbers = useMemo(() => {
        const nums = [];
        for (let i = 1; i <= 12; i++) {
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            const x = 130 + 90 * Math.cos(angle);
            const y = 130 + 90 * Math.sin(angle);
            nums.push(
                <text
                    key={i}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--clock-color, #e0e0e0)"
                    fontSize="14"
                    fontWeight="600"
                    fontFamily="var(--font-mono)"
                >
                    {i}
                </text>
            );
        }
        return nums;
    }, []);

    return (
        <div className="analog-clock">
            <svg viewBox="0 0 260 260" className="analog-svg">
                {/* Progress ring */}
                {totalMs > 0 && (
                    <circle
                        cx="130"
                        cy="130"
                        r="115"
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 130 130)"
                        opacity="0.6"
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                )}

                {/* Outer ring */}
                <circle cx="130" cy="130" r="120" fill="none" stroke="var(--clock-color, #e0e0e0)" strokeWidth="2" opacity="0.3" />

                {/* Tick marks */}
                {tickMarks}

                {/* Hour numbers */}
                {hourNumbers}

                {/* Hour hand */}
                <line
                    x1="130"
                    y1="130"
                    x2="130"
                    y2="65"
                    stroke="var(--clock-color, #e0e0e0)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    transform={`rotate(${hourAngle} 130 130)`}
                />

                {/* Minute hand */}
                <line
                    x1="130"
                    y1="130"
                    x2="130"
                    y2="48"
                    stroke="var(--clock-color, #e0e0e0)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform={`rotate(${minuteAngle} 130 130)`}
                />

                {/* Second hand */}
                <line
                    x1="130"
                    y1="140"
                    x2="130"
                    y2="40"
                    stroke={accentColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    transform={`rotate(${secondAngle} 130 130)`}
                />

                {/* Center dot */}
                <circle cx="130" cy="130" r="4" fill={accentColor} />
            </svg>
        </div>
    );
}
