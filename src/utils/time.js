/**
 * Time utility functions for formatting and parsing time values.
 */

/**
 * Format milliseconds to HH:MM:SS.cc display string.
 * @param {number} ms - Time in milliseconds
 * @param {boolean} showCentiseconds - Whether to show centiseconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms, showCentiseconds = false) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (n) => String(n).padStart(2, '0');

    if (showCentiseconds) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Parse hours, minutes, seconds to total milliseconds.
 */
export function parseTime(h, m, s) {
    return ((h * 3600) + (m * 60) + s) * 1000;
}

/**
 * Validate time inputs (max 23:59:59).
 */
export function validateTimeInput(h, m, s) {
    if (h < 0 || h > 23) return false;
    if (m < 0 || m > 59) return false;
    if (s < 0 || s > 59) return false;
    if (h === 0 && m === 0 && s === 0) return false;
    return true;
}

/**
 * Format a Date to a readable string.
 */
export function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format a Date to a live clock string.
 */
export function formatLiveTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
}

/**
 * Get progress ratio (0 to 1) for timer.
 */
export function getProgress(remaining, total) {
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, 1 - (remaining / total)));
}
