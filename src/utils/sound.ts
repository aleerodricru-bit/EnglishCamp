let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioContext = new Ctx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

export function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gainValue = 0.08,
  delayMs = 0
): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delayMs / 1000;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + durationMs / 1000 + 0.02);
  } catch {
    // Ignore audio context errors on restricted browsers
  }
}

export function playClickSound(muted: boolean): void {
  if (muted) return;
  playTone(540, 55, 'triangle', 0.04);
}

export function playCorrectSound(muted: boolean): void {
  if (muted) return;
  playTone(523.25, 110, 'triangle', 0.08, 0);
  playTone(659.25, 140, 'triangle', 0.09, 90);
}

export function playWrongSound(muted: boolean): void {
  if (muted) return;
  playTone(260, 130, 'sine', 0.06, 0);
  playTone(215, 160, 'sine', 0.06, 110);
}

export function playVictorySound(muted: boolean): void {
  if (muted) return;
  playTone(523.25, 130, 'triangle', 0.08, 0);
  playTone(659.25, 130, 'triangle', 0.08, 100);
  playTone(783.99, 140, 'triangle', 0.09, 200);
  playTone(1046.5, 280, 'triangle', 0.1, 310);
}

export function speakEnglish(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis failures
  }
}
