'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/usePlatformStore';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  User,
  ShieldCheck,
  ChevronDown,
  Plus,
  Compass,
  BookOpen,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import Character from './Character';

export default function Navbar() {
  const pathname = usePathname();
  const {
    activeChild,
    children,
    isMuted,
    toggleMuted,
    setActiveChild,
    loadInitialData,
    createChildProfile,
  } = usePlatformStore();

  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBand, setNewChildBand] = useState<'explorer' | 'builder' | 'challenger'>('builder');

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Don't show main navbar inside active lesson fullscreen player
  const isInsideLesson = pathname?.startsWith('/lesson/');
  if (isInsideLesson) return null;

  const navItems = [
    { label: 'Home', href: '/', icon: Compass },
    { label: 'Learn', href: '/learn', icon: BookOpen },
    { label: 'Spaced Review', href: '/review', icon: RotateCcw },
    { label: 'Progress & Badges', href: '/progress', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-secondary-light/40 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-float group-hover:scale-105 transition-transform">
            <span className="text-2xl">🧠</span>
          </div>
          <div>
            <span className="font-heading text-2xl font-extrabold text-ink tracking-tight flex items-center gap-1">
              Memory<span className="text-primary-dark">Verse</span>
            </span>
            <span className="text-xs text-ink-muted font-bold block -mt-1">
              Interactive Learning
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-bg-lavender/80 p-1.5 rounded-full border border-secondary-light/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-white text-primary-dark shadow-sm scale-100'
                    : 'text-ink-muted hover:text-ink hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Stats, Audio, Child Profile Switcher */}
        <div className="flex items-center gap-3">
          {/* Streak Chip */}
          {activeChild && (
            <div className="flex items-center gap-1.5 bg-attention-light/40 border border-attention/30 px-3 py-1.5 rounded-full shadow-sm text-sm font-extrabold text-attention-dark">
              <Flame className="w-4 h-4 text-attention fill-attention animate-bounce-soft" />
              <span>{activeChild.currentStreak}d</span>
            </div>
          )}

          {/* XP Chip */}
          {activeChild && (
            <div className="flex items-center gap-1.5 bg-accent-light/50 border border-accent/40 px-3 py-1.5 rounded-full shadow-sm text-sm font-extrabold text-ink">
              <Sparkles className="w-4 h-4 text-accent-dark fill-accent" />
              <span>{activeChild.currentXp} XP</span>
            </div>
          )}

          {/* Audio Sound Toggle */}
          <button
            onClick={toggleMuted}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            className="w-10 h-10 rounded-full bg-white border border-secondary-light/60 flex items-center justify-center text-ink-muted hover:text-primary-dark hover:border-primary transition-colors shadow-sm"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-primary-dark" />}
          </button>

          {/* Child Profile Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowChildDropdown(!showChildDropdown)}
              className="flex items-center gap-2 bg-white border border-secondary-light/80 hover:border-secondary pl-2 pr-3 py-1.5 rounded-full shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-lavender flex items-center justify-center">
                {activeChild ? (
                  <Character
                    name={activeChild.avatarKey === 'aarav' ? 'aarav' : 'mia'}
                    size="sm"
                    className="w-8 h-8"
                  />
                ) : (
                  <User className="w-4 h-4 text-ink-muted" />
                )}
              </div>
              <span className="font-heading font-bold text-sm text-ink max-w-[80px] truncate">
                {activeChild?.displayName || 'Learner'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>

            {/* Dropdown Menu */}
            {showChildDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl p-3 shadow-card border border-secondary-light/60 z-50">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-3 py-1">
                  Switch Learner
                </div>

                <div className="space-y-1 my-1">
                  {children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChild(c);
                        setShowChildDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-left font-bold text-sm transition-colors ${
                        activeChild?.id === c.id
                          ? 'bg-secondary-light/40 text-primary-dark font-extrabold'
                          : 'hover:bg-bg-lavender text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{c.displayName}</span>
                        <span className="text-xs font-normal text-ink-muted">
                          ({c.ageBand})
                        </span>
                      </div>
                      {activeChild?.id === c.id && <span>✓</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-secondary-light/40 my-2 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowChildDropdown(false);
                      setShowAddChildModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-extrabold text-primary-dark hover:bg-bg-blue transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Child Profile
                  </button>

                  <Link
                    href="/parent"
                    onClick={() => setShowChildDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-extrabold text-ink-muted hover:text-ink hover:bg-bg-lavender transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-secondary-dark" /> Parent Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden flex items-center justify-around bg-white border-t border-secondary-light/40 py-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-xl text-xs font-bold ${
                isActive ? 'text-primary-dark font-extrabold' : 'text-ink-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 shadow-card border border-secondary-light">
            <h3 className="font-heading text-2xl font-bold text-ink mb-1">
              Add New Learner
            </h3>
            <p className="text-sm text-ink-muted mb-4">
              Create a child profile to track their individual memory mastery and spaced reviews.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase mb-1">
                  Child Name
                </label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full px-4 py-3 rounded-2xl border border-secondary-light focus:outline-none focus:ring-2 focus:ring-primary font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase mb-1">
                  Age Band
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'explorer', label: 'Explorer', ages: 'Ages 7–9' },
                    { id: 'builder', label: 'Builder', ages: 'Ages 10–12' },
                    { id: 'challenger', label: 'Challenger', ages: 'Ages 13–14' },
                  ].map((band) => (
                    <button
                      key={band.id}
                      type="button"
                      onClick={() => setNewChildBand(band.id as typeof newChildBand)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        newChildBand === band.id
                          ? 'border-primary bg-bg-blue text-primary-dark font-extrabold shadow-sm'
                          : 'border-secondary-light/60 hover:bg-bg-lavender text-ink-muted'
                      }`}
                    >
                      <div className="font-bold text-xs">{band.label}</div>
                      <div className="text-[10px] text-ink-muted">{band.ages}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="flex-1 py-3 rounded-full border border-secondary-light font-bold text-ink-muted hover:bg-bg-lavender"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (newChildName.trim()) {
                      await createChildProfile(newChildName.trim(), newChildBand, 'mia');
                      setNewChildName('');
                      setShowAddChildModal(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-full bg-primary text-white font-extrabold hover:bg-primary-dark shadow-float btn-bouncy"
                >
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
