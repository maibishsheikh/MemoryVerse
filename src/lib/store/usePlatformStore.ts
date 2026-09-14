import { create } from 'zustand';
import { ChildProfile } from '@/types/lesson';
import { soundFx } from '@/lib/audio/sound-effects';

interface PlatformState {
  activeChild: ChildProfile | null;
  children: ChildProfile[];
  isLoading: boolean;
  isParentMode: boolean;
  isMuted: boolean;
  
  setActiveChild: (child: ChildProfile) => void;
  setChildren: (children: ChildProfile[]) => void;
  setIsParentMode: (enabled: boolean) => void;
  toggleMuted: () => void;
  addXpToActiveChild: (amount: number) => void;
  loadInitialData: () => Promise<void>;
  createChildProfile: (name: string, ageBand: 'explorer' | 'builder' | 'challenger', avatarKey: string) => Promise<ChildProfile | null>;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  activeChild: null,
  children: [],
  isLoading: true,
  isParentMode: false,
  isMuted: false,

  setActiveChild: (child) => {
    set({ activeChild: child });
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_child_id', child.id);
    }
  },

  setChildren: (children) => set({ children }),

  setIsParentMode: (enabled) => set({ isParentMode: enabled }),

  toggleMuted: () => {
    const nextMuted = !get().isMuted;
    soundFx.setMuted(nextMuted);
    set({ isMuted: nextMuted });
  },

  addXpToActiveChild: (amount) => {
    const current = get().activeChild;
    if (current) {
      const updated = { ...current, currentXp: current.currentXp + amount };
      set({
        activeChild: updated,
        children: get().children.map((c) => (c.id === updated.id ? updated : c)),
      });
    }
  },

  loadInitialData: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/children');
      if (res.ok) {
        const data: ChildProfile[] = await res.json();
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('active_child_id') : null;
        const matched = data.find((c) => c.id === savedId) || data[0] || null;
        set({
          children: data,
          activeChild: matched,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Failed to load children in store:', err);
      set({ isLoading: false });
    }
  },

  createChildProfile: async (name, ageBand, avatarKey) => {
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, ageBand, avatarKey }),
      });
      if (res.ok) {
        const newChild: ChildProfile = await res.json();
        set((state) => ({
          children: [...state.children, newChild],
          activeChild: newChild,
        }));
        soundFx.playSuccess();
        return newChild;
      }
    } catch (err) {
      console.error('Error creating child profile:', err);
    }
    return null;
  },
}));
