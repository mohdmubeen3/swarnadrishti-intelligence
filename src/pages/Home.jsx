import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Radar,
  Activity,
  Dna,
  ShieldAlert,
  Calculator,
  ShieldCheck,
  Sliders,
  History,
  Scale,
  GitBranch,
  Bell,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Compass,
  Play,
  Database,
  Cpu,
  Lock,
  FileText
} from 'lucide-react';
import { IntroAnimation } from '../components/intro/IntroAnimation';
import '../styles/home.css';

export function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Accordion state: Initially ALL six sections are collapsed (null)
  const [openSection, setOpenSection] = useState(null);

  // Toggle single section (collapses previously open section, or collapses itself if clicked again)
  const toggleSection = (id) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  // Intro state: Show on initial visit per session or if ?intro=true is present
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('intro') === 'true') return true;
      }
      return sessionStorage.getItem('swarnadrishti_intro_seen') !== 'true';
    } catch {
      return true;
    }
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('swarnadrishti_intro_seen', 'true');
    } catch (e) {
      console.warn('SessionStorage unavailable', e);
    }
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // Navigates and opens a specific section smoothly
  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    setOpenSection(sectionId);
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Continuous seamless video loop handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const featureItems = [
    {
      to: '/app/scanner',
      title: 'Opportunity Scanner',
      desc: 'Finds contract pairs that meet the configured analytical criteria and relative spread thresholds.',
      icon: Radar,
      tag: 'Pair Discovery'
    },
    {
      to: '/app/rv-lab',
      title: 'Relative Value Lab',
      desc: 'Compares normalized prices, investigates spread differentials, and tracks rolling Z-scores.',
      icon: Activity,
      tag: 'Spread Workspace'
    },
    {
      to: '/app/fair-value',
      title: 'Fair Value & Contract DNA',
      desc: 'Examines contract specifications, estimated fair values, and deviations from those estimates.',
      icon: Dna,
      tag: 'Assay Normalization'
    },
    {
      to: '/app/liquidity-lifecycle',
      title: 'Liquidity & Lifecycle',
      desc: 'Evaluates available liquidity information, turnover patterns, and contract expiry constraints.',
      icon: ShieldAlert,
      tag: 'Tender Window Tracking'
    },
    {
      to: '/app/cost-estimator',
      title: 'Cost Estimator',
      desc: 'Calculates how transaction-cost assumptions (CTT, turnover levies, slippage) affect estimated net edge.',
      icon: Calculator,
      tag: 'Friction Deduction'
    },
    {
      to: '/app/signals',
      title: 'SignalGuard Engine',
      desc: 'Multi-factor gatekeeper rules ensuring opportunities survive cost, liquidity, and tender hurdles.',
      icon: ShieldCheck,
      tag: 'Gatekeeper Rules'
    },
    {
      to: '/app/simulator',
      title: 'What-If Simulator',
      desc: 'Interactive stress-testing of cost variations, spread shocks, and holding periods.',
      icon: Sliders,
      tag: 'Scenario Stress-Testing'
    },
    {
      to: '/app/backtesting',
      title: 'Walk-Forward Backtesting',
      desc: 'Evaluates strategies across historical periods while strictly guarding against look-ahead bias.',
      icon: History,
      tag: 'Look-Ahead Bias Protection'
    },
    {
      to: '/app/attribution',
      title: 'Gold-Neutral Attribution',
      desc: 'Distinguishes pure relative-value strategy alpha from underlying gold price beta movements.',
      icon: Scale,
      tag: 'Beta Decomposition'
    },
    {
      to: '/app/edge-survival',
      title: 'Edge Survival Analysis',
      desc: 'Waterfall decomposition examining whether statistical spreads remain positive after all frictions.',
      icon: GitBranch,
      tag: 'Survival Waterfall'
    },
    {
      to: '/app/alerts',
      title: 'Alerts & Monitor',
      desc: 'Surveillance feed alerting when configured statistical thresholds or tender dates trigger.',
      icon: Bell,
      tag: 'Event Surveillance'
    },
    {
      to: '/app/methodology',
      title: 'Methodology & Data Quality',
      desc: 'Complete documentation of data sources, assumptions, validation methods, limitations, and data freshness.',
      icon: BookOpen,
      tag: 'MCX Bhavcopy Integrity'
    }
  ];

  return (
    <>
      {/* Cinematic Logo Awakening Intro Overlay */}
      {showIntro && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      <div className="home-container">
        {/* ====================================================================
            A. Navigation Bar
            ==================================================================== */}
        <header className="home-nav">
          <div className="home-nav-inner">
            <Link to="/" className="home-brand">
              <img
                src="/assets/swarnadrishti-logo.png"
                alt="SwarnaDrishti Logo"
                className="home-brand-logo"
              />
              <div className="home-brand-text">
                <span className="home-brand-name">SwarnaDrishti</span>
                <span className="home-brand-sub">MCX Gold Intelligence</span>
              </div>
            </Link>

            <nav className="home-nav-links">
              <span className="home-nav-link" onClick={() => handleNavClick('overview')}>Platform Overview</span>
              <span className="home-nav-link" onClick={() => handleNavClick('reality')}>Market Reality</span>
              <span className="home-nav-link" onClick={() => handleNavClick('process')}>Analytical Process</span>
              <span className="home-nav-link" onClick={() => handleNavClick('modules')}>Workstation Modules</span>
              <span className="home-nav-link" onClick={() => handleNavClick('integrity')}>Analytical Integrity</span>
              <span className="home-nav-link" onClick={() => handleNavClick('navigation')}>Platform Info</span>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/app" className="btn btn-primary">
                <span>Launch Platform</span>
                <ArrowRight size={15} />
              </Link>

              <button
                className="home-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <div className={`home-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="home-mobile-link" onClick={() => handleNavClick('overview')}>Platform Overview</div>
            <div className="home-mobile-link" onClick={() => handleNavClick('reality')}>Market Reality</div>
            <div className="home-mobile-link" onClick={() => handleNavClick('process')}>Analytical Process</div>
            <div className="home-mobile-link" onClick={() => handleNavClick('modules')}>Workstation Modules</div>
            <div className="home-mobile-link" onClick={() => handleNavClick('integrity')}>Analytical Integrity</div>
            <div className="home-mobile-link" onClick={() => handleNavClick('navigation')}>Platform Information</div>
            <div className="home-mobile-link" onClick={() => { setMobileMenuOpen(false); handleReplayIntro(); }}>
              Replay Logo Intro
            </div>
            <Link to="/app" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => setMobileMenuOpen(false)}>
              <span>Launch Platform</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        {/* ====================================================================
            B. Cinematic Full-Background Video Hero Section
            ==================================================================== */}
        <section className="home-hero">
          {/* Full-bleed video background layered behind content */}
          <div className="hero-video-container">
            {!videoError && (
              <video
                ref={videoRef}
                className="hero-background-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/assets/swarnadrishti-logo.png"
                onError={() => setVideoError(true)}
              >
                <source src="/assets/swarnadrishti-hero.mp4" type="video/mp4" />
              </video>
            )}
            <div className="hero-video-overlay" />
          </div>

          {/* Foreground Content */}
          <div className="home-hero-inner">
            <div className="hero-content">
              <div className="hero-pill-badge">
                <Sparkles size={14} />
                <span>Quantitative Commodity Derivatives Intelligence</span>
              </div>

              <h1 className="hero-title">
                See Beyond Gold Prices. <br />
                <span className="gold-gradient-text">Discover Relative Value.</span>
              </h1>

              <p className="hero-description">
                SwarnaDrishti brings MCX gold futures into one clear analytical view—helping you compare contracts, understand price differences, and evaluate opportunities beyond headline prices.
              </p>

              <div className="hero-tagline">
                <Compass size={16} />
                <span>Compare contracts. Understand price differences. Validate before you act.</span>
              </div>

              <div className="hero-cta-group">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/app')}
                >
                  <span>Explore the Platform</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => handleNavClick('overview')}
                >
                  <span>Explore Information Sections</span>
                </button>
              </div>

              <div className="hero-stat-strip">
                <div className="hero-stat-item">
                  <span className="hero-stat-label">Analyzed Contracts</span>
                  <span className="hero-stat-value">GOLDM • GOLDTEN • GUINEA • PETAL</span>
                </div>
                <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                <div className="hero-stat-item">
                  <span className="hero-stat-label">Normalized Basis</span>
                  <span className="hero-stat-value" style={{ color: 'var(--gold-bright)' }}>Fine-Gold 999 (Rs. / 10g)</span>
                </div>
                <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                <div className="hero-stat-item">
                  <span className="hero-stat-label">Analytical Standard</span>
                  <span className="hero-stat-value" style={{ color: 'var(--status-actionable)' }}>Zero Fabricated Data</span>
                </div>
              </div>
            </div>

            <div className="hero-visual-wrap">
              <div className="hero-orbital-halo">
                <img
                  src="/assets/swarnadrishti-logo.png"
                  alt="SwarnaDrishti Logo"
                  className="hero-logo-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            C. Interactive Click-to-Open Information Hub (6 Specialized Sections)
            ==================================================================== */}
        <section id="intelligence-sections" className="interactive-hub-section">
          <div className="home-section-inner">
            <div className="section-header" style={{ marginBottom: 40 }}>
              <div className="section-tag">Interactive Knowledge Suite</div>
              <h2 className="section-title">Platform Intelligence Architecture</h2>
              <p className="section-subtitle">
                Select any section below to expand its detailed methodology, structural analysis, and quantitative workflows.
              </p>
            </div>

            <div className="accordion-wrapper" role="region" aria-label="SwarnaDrishti Information Sections">
              
              {/* ================================================================
                  SECTION 1: Platform Overview
                  ================================================================ */}
              <div
                id="section-overview"
                className={`accordion-panel ${openSection === 'overview' ? 'is-open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection('overview')}
                  aria-expanded={openSection === 'overview'}
                  aria-controls="panel-content-overview"
                >
                  <div className="accordion-header-left">
                    <div className="accordion-badge-row">
                      <span className="accordion-index">01</span>
                      <span className="accordion-tag">Platform Overview</span>
                    </div>
                    <h3 className="accordion-subheading">What Does SwarnaDrishti Do?</h3>
                    <p className="accordion-preview-desc">
                      Turning complex MCX gold futures specifications into transparent, explainable relative-value intelligence.
                    </p>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-state-pill">
                      {openSection === 'overview' ? 'Collapse' : 'Explore'}
                    </span>
                    <div className="accordion-icon-wrap">
                      <ChevronDown size={18} className="accordion-chevron" />
                    </div>
                  </div>
                </button>

                {openSection === 'overview' && (
                  <div id="panel-content-overview" className="accordion-body">
                    <div className="accordion-body-inner">
                      <div className="what-we-do-text">
                        <p>
                          Different MCX gold futures contracts represent the same underlying precious metal but differ in trading units (100g, 10g, 8g, 1g), quotation conventions, purity specifications, and settlement schedules. Because of these structural variations, raw headline prices cannot be compared directly without precision normalization.
                        </p>
                        <p>
                          <strong>SwarnaDrishti</strong> brings these contracts into a single analytical view. It compares contract prices on a standardized fine-gold basis, examines how contracts move relative to each other, and evaluates whether apparent price differences remain meaningful once real-world friction—such as regulatory transaction taxes, turnover fees, bid-ask slippage, and expiry constraints—is factored in.
                        </p>
                        <p style={{ fontWeight: 600, color: 'var(--gold-bright)' }}>
                          Product Principle: SwarnaDrishti provides quantitative decision support for market participants. It does not promise guaranteed profits, generate automated trading execution, or claim predictive certainty.
                        </p>
                      </div>

                      <div className="what-we-do-pillars" style={{ marginTop: 28, paddingTop: 24 }}>
                        <div className="pillar-box">
                          <div className="pillar-title">
                            <Activity size={18} />
                            <span>1. Unified Fine-Gold Basis</span>
                          </div>
                          <div className="pillar-desc">
                            Translates disparate contract quotes into a standard reference of Rs. per 10 grams of 999 fine gold for unbiased visual and mathematical comparison.
                          </div>
                        </div>

                        <div className="pillar-box">
                          <div className="pillar-title">
                            <Calculator size={18} />
                            <span>2. Friction & Lifecycle Reality</span>
                          </div>
                          <div className="pillar-desc">
                            Subjects theoretical spreads to statutory taxes (Commodity Transaction Tax - CTT on sell side), exchange turnover levies, brokerage, and tender period physical delivery constraints.
                          </div>
                        </div>

                        <div className="pillar-box">
                          <div className="pillar-title">
                            <ShieldCheck size={18} />
                            <span>3. Disciplined Decision Support</span>
                          </div>
                          <div className="pillar-desc">
                            Enforces strict SignalGuard multi-factor gatekeepers. If an apparent spread does not survive cost and liquidity thresholds, a transparent "No Signal" status is maintained.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  SECTION 2: Market Reality
                  ================================================================ */}
              <div
                id="section-reality"
                className={`accordion-panel ${openSection === 'reality' ? 'is-open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection('reality')}
                  aria-expanded={openSection === 'reality'}
                  aria-controls="panel-content-reality"
                >
                  <div className="accordion-header-left">
                    <div className="accordion-badge-row">
                      <span className="accordion-index">02</span>
                      <span className="accordion-tag">Market Reality</span>
                    </div>
                    <h3 className="accordion-subheading">The Problem We Solve</h3>
                    <p className="accordion-preview-desc">
                      Trading commodity derivatives involves subtle institutional frictions that standard price charts completely overlook.
                    </p>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-state-pill">
                      {openSection === 'reality' ? 'Collapse' : 'Explore'}
                    </span>
                    <div className="accordion-icon-wrap">
                      <ChevronDown size={18} className="accordion-chevron" />
                    </div>
                  </div>
                </button>

                {openSection === 'reality' && (
                  <div id="panel-content-reality" className="accordion-body">
                    <div className="accordion-body-inner">
                      <div className="problem-grid">
                        <div className="problem-card">
                          <div className="problem-card-num">01</div>
                          <h4 className="problem-card-title">Different Contracts, Different Price Bases</h4>
                          <p className="problem-card-desc">
                            MCX gold contracts such as GOLDM (100g), GOLDTEN (10g), GOLDGUINEA (8g), and GOLDPETAL (1g) differ in lot sizes and quotation units. Their raw prices cannot be compared without standardized conversion.
                          </p>
                        </div>

                        <div className="problem-card">
                          <div className="problem-card-num">02</div>
                          <h4 className="problem-card-title">Not Every Price Difference Is an Opportunity</h4>
                          <p className="problem-card-desc">
                            An apparent price differential between two contracts often reflects carrying costs, financing rates, or differing expiry horizons rather than an exploitable market mispricing.
                          </p>
                        </div>

                        <div className="problem-card">
                          <div className="problem-card-num">03</div>
                          <h4 className="problem-card-title">Trading Costs Can Change the Outcome</h4>
                          <p className="problem-card-desc">
                            A spread may look attractive on paper, but statutory taxes (CTT on sell-side), exchange turnover fees, clearing levies, and bid-ask slippage can quickly erase the theoretical advantage.
                          </p>
                        </div>

                        <div className="problem-card">
                          <div className="problem-card-num">04</div>
                          <h4 className="problem-card-title">Liquidity & Tender Period Constraints</h4>
                          <p className="problem-card-desc">
                            Entering staggered tender delivery periods can introduce severe liquidity drops, mandatory delivery obligations, and punitive margin increases that trap unhedged positions.
                          </p>
                        </div>

                        <div className="problem-card">
                          <div className="problem-card-num">05</div>
                          <h4 className="problem-card-title">Historical Results Need Proper Validation</h4>
                          <p className="problem-card-desc">
                            Backtesting on historical prices without walk-forward segmentation or safeguards against look-ahead bias creates illusory confidence that consistently fails under real trading conditions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  SECTION 3: Analytical Process
                  ================================================================ */}
              <div
                id="section-process"
                className={`accordion-panel ${openSection === 'process' ? 'is-open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection('process')}
                  aria-expanded={openSection === 'process'}
                  aria-controls="panel-content-process"
                >
                  <div className="accordion-header-left">
                    <div className="accordion-badge-row">
                      <span className="accordion-index">03</span>
                      <span className="accordion-tag">Analytical Process</span>
                    </div>
                    <h3 className="accordion-subheading">How SwarnaDrishti Works</h3>
                    <p className="accordion-preview-desc">
                      A disciplined 6-stage quantitative workflow from exchange data ingestion to out-of-sample edge verification.
                    </p>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-state-pill">
                      {openSection === 'process' ? 'Collapse' : 'Explore'}
                    </span>
                    <div className="accordion-icon-wrap">
                      <ChevronDown size={18} className="accordion-chevron" />
                    </div>
                  </div>
                </button>

                {openSection === 'process' && (
                  <div id="panel-content-process" className="accordion-body">
                    <div className="accordion-body-inner">
                      <div className="steps-pipeline-grid">
                        <div className="pipeline-card">
                          <div className="pipeline-badge">1</div>
                          <h4 className="pipeline-title">Collect Market Data</h4>
                          <p className="pipeline-desc">
                            Ingest official MCX Daily Bhavcopy settlement records, traded volumes, open interest, and contract calendar schedules.
                          </p>
                        </div>

                        <div className="pipeline-card">
                          <div className="pipeline-badge">2</div>
                          <h4 className="pipeline-title">Validate the Data</h4>
                          <p className="pipeline-desc">
                            Verify dates, contract identifiers, expiry calendars, missing price tolerance, and chronological data freshness.
                          </p>
                        </div>

                        <div className="pipeline-card">
                          <div className="pipeline-badge">3</div>
                          <h4 className="pipeline-title">Normalize Contracts</h4>
                          <p className="pipeline-desc">
                            Convert all raw contract quotes to a unified fine-gold benchmark of Rs. per 10 grams of 999 fine gold.
                          </p>
                        </div>

                        <div className="pipeline-card">
                          <div className="pipeline-badge">4</div>
                          <h4 className="pipeline-title">Analyze Relative Value</h4>
                          <p className="pipeline-desc">
                            Compute price spreads, tracking residuals, rolling Z-scores, and deviations from estimated fair value baselines.
                          </p>
                        </div>

                        <div className="pipeline-card">
                          <div className="pipeline-badge">5</div>
                          <h4 className="pipeline-title">Apply Trading Constraints</h4>
                          <p className="pipeline-desc">
                            Deduct statutory CTT (0.0125% sell), MCX turnover levies (0.0021%), brokerage, slippage, and evaluate tender window risks.
                          </p>
                        </div>

                        <div className="pipeline-card">
                          <div className="pipeline-badge">6</div>
                          <h4 className="pipeline-title">Validate the Result</h4>
                          <p className="pipeline-desc">
                            Perform out-of-sample walk-forward validation and gold-neutral attribution to confirm if the apparent edge is genuine.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  SECTION 4: Workstation Modules
                  ================================================================ */}
              <div
                id="section-modules"
                className={`accordion-panel ${openSection === 'modules' ? 'is-open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection('modules')}
                  aria-expanded={openSection === 'modules'}
                  aria-controls="panel-content-modules"
                >
                  <div className="accordion-header-left">
                    <div className="accordion-badge-row">
                      <span className="accordion-index">04</span>
                      <span className="accordion-tag">Workstation Modules</span>
                    </div>
                    <h3 className="accordion-subheading">Explore Specialized Analytical Capabilities</h3>
                    <p className="accordion-preview-desc">
                      Twelve purpose-built modules designed for commodity derivatives intelligence. Select any module to launch directly into the platform.
                    </p>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-state-pill">
                      {openSection === 'modules' ? 'Collapse' : 'Explore'}
                    </span>
                    <div className="accordion-icon-wrap">
                      <ChevronDown size={18} className="accordion-chevron" />
                    </div>
                  </div>
                </button>

                {openSection === 'modules' && (
                  <div id="panel-content-modules" className="accordion-body">
                    <div className="accordion-body-inner">
                      <div className="features-grid">
                        {featureItems.map((feat, idx) => {
                          const Icon = feat.icon;
                          return (
                            <Link key={idx} to={feat.to} className="feature-item-card">
                              <div className="feature-top">
                                <div className="feature-icon-box">
                                  <Icon size={22} />
                                </div>
                                <div className="feature-info">
                                  <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                                    {feat.tag}
                                  </div>
                                  <h4>{feat.title}</h4>
                                  <p>{feat.desc}</p>
                                </div>
                              </div>
                              <div className="feature-action-link">
                                <span>Open Module</span>
                                <ChevronRight size={14} />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  SECTION 5: Analytical Integrity
                  ================================================================ */}
              <div
                id="section-integrity"
                className={`accordion-panel ${openSection === 'integrity' ? 'is-open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection('integrity')}
                  aria-expanded={openSection === 'integrity'}
                  aria-controls="panel-content-integrity"
                >
                  <div className="accordion-header-left">
                    <div className="accordion-badge-row">
                      <span className="accordion-index">05</span>
                      <span className="accordion-tag">Analytical Integrity</span>
                    </div>
                    <h3 className="accordion-subheading">Committed to Quantitative Transparency</h3>
                    <p className="accordion-preview-desc">
                      SwarnaDrishti rejects synthetic market values. Financial values come from authentic exchange settlement sources, verified mathematical normalization, or user-configured assumptions.
                    </p>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-state-pill">
                      {openSection === 'integrity' ? 'Collapse' : 'Explore'}
                    </span>
                    <div className="accordion-icon-wrap">
                      <ChevronDown size={18} className="accordion-chevron" />
                    </div>
                  </div>
                </button>

                {openSection === 'integrity' && (
                  <div id="panel-content-integrity" className="accordion-body">
                    <div className="accordion-body-inner">
                      <div className="trust-banner" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
                        <div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.65 }}>
                            We believe that analytical honesty is far more valuable than generating false-positive signals. The platform enforces the following quantitative standards:
                          </p>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Real Data Sources:</strong> Uses official MCX Bhavcopy settlement records with zero missing price tolerance.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Missing vs Zero Distinction:</strong> Explicitly differentiates missing trading data from true zero values.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Look-Ahead Bias Protection:</strong> Strictly isolates in-sample parameters from out-of-sample validation windows.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Institutional Friction Deduction:</strong> Models statutory sell-side CTT, exchange turnover charges, and execution slippage upfront.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Lifecycle & Tender Risk:</strong> Evaluates staggered tender delivery windows to protect against physical delivery obligations.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Beta Attribution:</strong> Separates underlying macro gold price drift from the relative spread strategy's contribution.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <CheckCircle2 size={18} style={{ color: 'var(--status-actionable)', flexShrink: 0, marginTop: 2 }} />
                              <span><strong>Negative Signal Reporting:</strong> Transparently presents "No Signal" or "Rejected" when an edge fails validation instead of forcing trades.</span>
                            </li>
                          </ul>
                        </div>

                        <div style={{
                          backgroundColor: 'var(--bg-base)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-medium)',
                          padding: '28px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 18
                        }}>
                          <div>
                            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--gold-bright)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                              Notice & Limitations
                            </div>
                            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 10 }}>
                              Analytical Decision Support Platform
                            </h4>
                            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              SwarnaDrishti is an institutional-grade analytical research platform for MCX gold derivatives. It provides quantitative analytics and risk validation support. It does not provide trade execution services or guarantee investment returns. Settlement data represents official closing figures, not instantaneous orderbook depth.
                            </p>
                          </div>

                          <Link to="/app/methodology" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                            <span>Inspect Methodology & Data Quality Diagnostics</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================
                  SECTION 6: Platform information and navigation
                  ================================================================ */}
              <div
                id="section-navigation"
                className={`accordion-panel ${openSection === 'navigation' ? 'is-open' : ''}`}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection('navigation')}
                  aria-expanded={openSection === 'navigation'}
                  aria-controls="panel-content-navigation"
                >
                  <div className="accordion-header-left">
                    <div className="accordion-badge-row">
                      <span className="accordion-index">06</span>
                      <span className="accordion-tag">Platform Information and Navigation</span>
                    </div>
                    <h3 className="accordion-subheading">Workstation Architecture & Direct Access</h3>
                    <p className="accordion-preview-desc">
                      Fast-track access to all analytical modules, workstation routing architecture, and platform specifications.
                    </p>
                  </div>
                  <div className="accordion-header-right">
                    <span className="accordion-state-pill">
                      {openSection === 'navigation' ? 'Collapse' : 'Explore'}
                    </span>
                    <div className="accordion-icon-wrap">
                      <ChevronDown size={18} className="accordion-chevron" />
                    </div>
                  </div>
                </button>

                {openSection === 'navigation' && (
                  <div id="panel-content-navigation" className="accordion-body">
                    <div className="accordion-body-inner">
                      <div className="nav-overview-grid">
                        <div className="nav-group-card">
                          <div className="nav-group-title">
                            <Radar size={16} style={{ color: 'var(--gold-bright)' }} />
                            <span>1. Discovery & Spreads</span>
                          </div>
                          <ul className="nav-link-list">
                            <li><Link to="/app">Platform Overview (Executive Dashboard)</Link></li>
                            <li><Link to="/app/scanner">Opportunity Scanner (Pair Discovery)</Link></li>
                            <li><Link to="/app/rv-lab">Relative Value Lab (Spread & Z-Score Workspace)</Link></li>
                          </ul>
                        </div>

                        <div className="nav-group-card">
                          <div className="nav-group-title">
                            <Dna size={16} style={{ color: 'var(--accent-cyan)' }} />
                            <span>2. Valuation & Lifecycle</span>
                          </div>
                          <ul className="nav-link-list">
                            <li><Link to="/app/fair-value">Fair Value & Contract DNA (Assay Specifications)</Link></li>
                            <li><Link to="/app/liquidity-lifecycle">Liquidity & Lifecycle (Tender Windows)</Link></li>
                            <li><Link to="/app/cost-estimator">Cost Estimator (Statutory Friction)</Link></li>
                          </ul>
                        </div>

                        <div className="nav-group-card">
                          <div className="nav-group-title">
                            <ShieldCheck size={16} style={{ color: 'var(--status-actionable)' }} />
                            <span>3. Validation & Testing</span>
                          </div>
                          <ul className="nav-link-list">
                            <li><Link to="/app/signals">SignalGuard Engine (Gatekeeper Rules)</Link></li>
                            <li><Link to="/app/simulator">What-If Simulator (Stress Testing)</Link></li>
                            <li><Link to="/app/backtesting">Walk-Forward Backtesting (Look-Ahead Bias Free)</Link></li>
                            <li><Link to="/app/attribution">Gold-Neutral Attribution (Beta Decomposition)</Link></li>
                            <li><Link to="/app/edge-survival">Edge Survival Analysis (Waterfall)</Link></li>
                          </ul>
                        </div>

                        <div className="nav-group-card">
                          <div className="nav-group-title">
                            <BookOpen size={16} style={{ color: 'var(--gold-bright)' }} />
                            <span>4. Governance & Setup</span>
                          </div>
                          <ul className="nav-link-list">
                            <li><Link to="/app/alerts">Alerts & Event Surveillance</Link></li>
                            <li><Link to="/app/methodology">Methodology & Data Quality Diagnostics</Link></li>
                            <li><Link to="/app/settings">Workstation Settings & Friction Thresholds</Link></li>
                          </ul>
                        </div>
                      </div>

                      <div className="nav-quick-action-strip">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Compass size={20} style={{ color: 'var(--gold-bright)' }} />
                          <span style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            Ready to access the analytical terminal?
                          </span>
                        </div>
                        <Link to="/app" className="btn btn-primary">
                          <span>Launch Full Workstation Shell</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ====================================================================
            D. Final Call to Action
            ==================================================================== */}
        <section className="home-section" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.09) 0%, var(--bg-base) 80%)',
          textAlign: 'center',
          padding: '100px 24px'
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <img
              src="/assets/swarnadrishti-logo.png"
              alt="Logo"
              style={{ width: 84, height: 84, borderRadius: '50%', marginBottom: 24, boxShadow: '0 0 35px rgba(212, 175, 55, 0.35)', border: '1px solid rgba(212, 175, 55, 0.5)' }}
            />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 18 }}>
              Ready to Investigate <span className="gold-gradient-text">MCX Relative Value</span>?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.6 }}>
              Launch the workstation to scan live contract spreads, simulate transaction frictions, and inspect walk-forward backtests.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/app')}
              >
                <span>Launch SwarnaDrishti Workstation</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={handleReplayIntro}
                title="Watch opening animation and welcome greeting again"
              >
                <Play size={16} />
                <span>Replay Cinematic Intro</span>
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================================
            Footer
            ==================================================================== */}
        <footer className="home-footer">
          <div className="home-footer-inner">
            <div className="footer-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src="/assets/swarnadrishti-logo.png"
                  alt="SwarnaDrishti Logo"
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'contain', border: '1px solid rgba(212, 175, 55, 0.4)' }}
                />
                <div>
                  <div style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    SwarnaDrishti
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Commodity Derivatives Intelligence Platform
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.88rem' }}>
                <Link to="/app">Overview</Link>
                <Link to="/app/scanner">Scanner</Link>
                <Link to="/app/rv-lab">Relative Value</Link>
                <Link to="/app/backtesting">Backtesting</Link>
                <Link to="/app/methodology">Methodology</Link>
                <Link to="/app/settings">Settings</Link>
                <button
                  onClick={handleReplayIntro}
                  style={{ color: 'var(--gold-bright)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Play size={12} />
                  <span>Replay Intro</span>
                </button>
              </div>
            </div>

            <div className="footer-bottom">
              <div>
                © 2026 SwarnaDrishti • Multi Commodity Exchange of India (MCX) Relative-Value Intelligence
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                Normalized Basis: 999 Fine Gold • Rs. per 10g
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}