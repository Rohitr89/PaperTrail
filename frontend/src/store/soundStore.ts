import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Howl } from 'howler';

// --- Audio Assets ---
// Using high-quality CDN links for a professional feel
const SOUNDS = {
  NOTIFY: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

// --- Sound Store ---
interface SoundState {
  play: (type: keyof typeof SOUNDS) => void;
  muted: boolean;
  toggleMute: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      muted: false,
      play: (type) => {
        const { muted } = useSoundStore.getState();
        if (!muted) {
          const sound = new Howl({ src: [SOUNDS[type]] });
          sound.play();
        }
      },
      toggleMute: () => set((state) => ({ muted: !state.muted })),
    }),
    { name: 'papertrail-sounds' }
  )
);
