/**
 * Audio utility using Web Audio API for generating alarm and notification sounds.
 * No external audio files required.
 */

let audioContext = null;
let isMuted = false;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Play a soft chime sound for reminders.
 */
export function playReminderSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Two-tone chime
        const frequencies = [523.25, 659.25]; // C5, E5
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0, now + i * 0.2);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.2 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.6);
        });
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
}

/**
 * Play a success/completion sound.
 */
export function playCompletionSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Ascending arpeggio: C5, E5, G5, C6
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.25, now + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.8);
        });
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
}

/**
 * Set mute state.
 */
export function setMuted(muted) {
    isMuted = muted;
}

/**
 * Get current mute state.
 */
export function getMuted() {
    return isMuted;
}
