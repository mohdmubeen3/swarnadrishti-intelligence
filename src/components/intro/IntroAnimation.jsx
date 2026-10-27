import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import '../../styles/intro.css';

export function IntroAnimation({ onComplete }) {
  const [stage, setStage] = useState(1); // 1: Quiet, 2: Awaken, 3: Text & Voice & Enter CTA
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [voiceSpoken, setVoiceSpoken] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);

  const speechUtteranceRef = useRef(null);
  const timerRef = useRef([]);

  // Voice synthesis implementation
  const playFemaleGreeting = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechAvailable(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance('Welcome to SwarnaDrishti.');
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.lang = 'en-US';

      // Function to select natural female voice
      const assignVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        // Search preference: English female voices
        const femaleVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          const isEn = lang.startsWith('en');
          return isEn && (
            name.includes('female') ||
            name.includes('zira') ||
            name.includes('samantha') ||
            name.includes('karen') ||
            name.includes('victoria') ||
            name.includes('serena') ||
            name.includes('moira') ||
            name.includes('google uk english female') ||
            name.includes('natural')
          );
        }) || voices.find(v => v.lang.startsWith('en'));

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      };

      assignVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = assignVoice;
      }

      utterance.onend = () => setVoiceSpoken(true);
      utterance.onerror = () => setSpeechAvailable(false);

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeechAvailable(false);
    }
  };

  const handleEnter = () => {
    // Cancel speech and clear all sequence timers
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    timerRef.current.forEach(t => clearTimeout(t));

    setIsFadingOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 500);
  };

  // Keyboard shortcut: pressing Enter or Space enters the platform
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Choreographed Cinematic Animation Timeline:
  // - Stage 1: Quiet opening glow
  // - Stage 2: Logo awakening & orbital ring rotation (~1.0s)
  // - Stage 3: Title reveal, natural female voice greeting, and "Enter Website" button (~1.8s)
  // No auto-dismissal; the user enters at their own pace when pressing the button.
  useEffect(() => {
    const t1 = setTimeout(() => {
      setStage(2);
    }, 1000);

    const t2 = setTimeout(() => {
      setStage(3);
      playFemaleGreeting();
    }, 1800);

    timerRef.current = [t1, t2];

    return () => {
      timerRef.current.forEach(t => clearTimeout(t));
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={`intro-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="region"
      aria-label="Welcome to SwarnaDrishti Introduction"
    >
      {/* Supplied Background Asset: Gold Market Trading Desk */}
      <div className="intro-bg-image-layer" aria-hidden="true">
        <img
          src="/assets/gold-trading-desk.png"
          alt="Gold Market Trading Desk Atmosphere"
          className="intro-bg-img"
          onError={(e) => {
            console.warn('Welcome background image failed to load:', e);
          }}
        />
        <div className="intro-bg-overlay" />
      </div>

      {/* Background ambient lighting */}
      <div className="intro-backdrop" />

      {/* Decorative Golden Orbital Rings */}
      <div className="intro-orbital-wrapper">
        <div className="intro-ring intro-ring-outer" />
        <div className="intro-ring intro-ring-mid" />
        <div className="intro-ring intro-ring-inner" />

        {/* Logo with Iris Awakening Sweep */}
        <div className="intro-logo-container">
          <img
            src="/assets/swarnadrishti-logo.png"
            alt="SwarnaDrishti Logo"
            className="intro-logo-image"
          />
          <div className="intro-eye-light-sweep" />
        </div>
      </div>

      {/* Stage 3: Welcome Text & Enter Website CTA */}
      <div className="intro-text-stage">
        <h1 className="intro-welcome-heading">Welcome to SwarnaDrishti</h1>
        <div className="intro-sub-descriptor">COMMODITY DERIVATIVES INTELLIGENCE</div>

        {/* User-Triggered Entry Button */}
        <button
          className="intro-enter-btn"
          onClick={handleEnter}
          aria-label="Enter Website Homepage"
          autoFocus
        >
          <Sparkles size={16} className="intro-enter-sparkle" />
          <span>Enter Website</span>
          <ArrowRight size={17} className="intro-enter-arrow" />
        </button>
      </div>
    </div>
  );
}
