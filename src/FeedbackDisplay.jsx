import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "./SupabaseClient";
import "./Feedbackdisplay.css";

export default function FeedbackTreeDisplay() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch feedbacks
  useEffect(() => {
    let mounted = true;
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from("feedBacks")
        .select("*")
        .order("id", { ascending: false });

      if (!error && mounted) setFeedbacks(data || []);
      if (mounted) setLoading(false);
    };
    fetchFeedbacks();

    const subscription = supabase
      .channel("public:feedBacks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedBacks" },
        () => fetchFeedbacks()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  // Auto-cycle through feedbacks
  useEffect(() => {
    if (feedbacks.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % feedbacks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [feedbacks.length, isPaused]);

  // Calculate statistics
  const stats = useMemo(() => {
    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.Rating || 0), 0) / feedbacks.length).toFixed(1)
      : "0.0";

    return { total: feedbacks.length, avgRating };
  }, [feedbacks]);

  // Natural hanging leaf positions
  const positions = useMemo(() => {
    const count = feedbacks.length || 0;
    const pos = [];
    
    // Create hanging positions along branches
    const branches = [
      { x: 20, y: 22, count: 4, spread: 15 },
      { x: 75, y: 22, count: 4, spread: 15 },
      { x: 15, y: 35, count: 5, spread: 18 },
      { x: 80, y: 35, count: 5, spread: 18 },
      { x: 25, y: 48, count: 4, spread: 16 },
      { x: 70, y: 48, count: 4, spread: 16 },
      { x: 18, y: 60, count: 4, spread: 14 },
      { x: 77, y: 60, count: 4, spread: 14 },
    ];

    let idx = 0;
    for (const branch of branches) {
      const itemsOnBranch = Math.min(branch.count, count - idx);
      for (let i = 0; i < itemsOnBranch; i++) {
        const offset = (i - itemsOnBranch / 2) * (branch.spread / itemsOnBranch);
        pos.push({
          left: `${branch.x + offset}%`,
          top: `${branch.y}%`,
          delay: idx * 0.1,
          swayDelay: Math.random() * 2
        });
        idx++;
      }
      if (idx >= count) break;
    }

    return pos;
  }, [feedbacks]);

  const handleLeafClick = (index) => {
    setActiveIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const navigateFeedback = (direction) => {
    setActiveIndex(prev => {
      if (direction === 'next') return (prev + 1) % feedbacks.length;
      return (prev - 1 + feedbacks.length) % feedbacks.length;
    });
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (loading) {
    return (
      <div className="tree-page">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-page">
      {/* Hero Header */}
      <header className="hero-header">
        <div className="header-content">
          <div className="title-wrapper">
            <h1 className="main-title">GUEST BOOK</h1>
            <p className="subtitle">Feedback Tree - Where Every Voice Blooms</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-text">Voices</span>
            </div>
            <div className="stat-pill">
              <span className="stat-number">{stats.avgRating}</span>
              <span className="stat-text">★ Rating</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {feedbacks.length > 0 ? (
          <div className="content-grid">
            {/* Feedback Display */}
            <div className="feedback-panel">
              <div className="panel-card">
                <div className="card-top">
                  <div className="user-badge">
                    <div 
                      className="badge-circle" 
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${Math.abs(hashCode(feedbacks[activeIndex]?.Name || "A")) % 360} 65% 55%), hsl(${(Math.abs(hashCode(feedbacks[activeIndex]?.Name || "A")) % 360 + 60) % 360} 65% 65%))` 
                      }}
                    >
                      {(feedbacks[activeIndex]?.Name?.charAt(0) || "U").toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h3>{feedbacks[activeIndex]?.Name || "Anonymous"}</h3>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < (feedbacks[activeIndex]?.Rating || 0) ? 'star filled' : 'star'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="card-controls">
                    <button className="ctrl-btn" onClick={() => navigateFeedback('prev')} aria-label="Previous">‹</button>
                    <button className={`ctrl-btn ${isPaused ? 'play' : 'pause'}`} onClick={() => setIsPaused(!isPaused)}>
                      {isPaused ? '▶' : '❚❚'}
                    </button>
                    <button className="ctrl-btn" onClick={() => navigateFeedback('next')} aria-label="Next">›</button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="quote-wrapper">
                    <span className="quote-icon">"</span>
                    <p className="comment-text">{feedbacks[activeIndex]?.Comment || "No comment provided"}</p>
                    <span className="quote-icon end">"</span>
                  </div>
                </div>

                <div className="card-bottom">
                  <time className="date-text">
                    {feedbacks[activeIndex]?.created_at 
                      ? new Date(feedbacks[activeIndex].created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric'
                        }) 
                      : "Date unknown"}
                  </time>
                  <span className="counter-badge">{activeIndex + 1} / {feedbacks.length}</span>
                </div>
              </div>
            </div>

            {/* Tree Visualization */}
            <div className="tree-panel">
              <div className="tree-wrapper">
                {/* Tree SVG */}
                <svg className="tree-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="trunk" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#8b7355', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#5d4a3a', stopOpacity: 1 }} />
                    </linearGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                    </filter>
                  </defs>

                  {/* Trunk */}
                  <rect x="230" y="300" width="40" height="300" rx="5" fill="url(#trunk)" filter="url(#shadow)" />
                  
                  {/* Main Branches */}
                  <path d="M 245 320 Q 180 300 120 320" stroke="#8b7355" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  <path d="M 255 320 Q 320 300 380 320" stroke="#8b7355" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  
                  <path d="M 240 360 Q 160 340 100 365" stroke="#8b7355" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  <path d="M 260 360 Q 340 340 400 365" stroke="#8b7355" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  
                  <path d="M 242 400 Q 180 385 130 410" stroke="#8b7355" strokeWidth="9" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  <path d="M 258 400 Q 320 385 370 410" stroke="#8b7355" strokeWidth="9" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  
                  <path d="M 240 440 Q 170 425 115 450" stroke="#8b7355" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                  <path d="M 260 440 Q 330 425 385 450" stroke="#8b7355" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#shadow)" />
                </svg>

                {/* Hanging Leaves */}
                <div className="leaves-container">
                  {feedbacks.map((fb, i) => {
                    const pos = positions[i];
                    if (!pos) return null;
                    const isActive = i === activeIndex;

                    return (
                      <div
                        key={fb.id}
                        className={`hanging-leaf ${isActive ? 'active' : ''}`}
                        style={{ 
                          left: pos.left, 
                          top: pos.top,
                          animationDelay: `${pos.delay}s, ${pos.swayDelay}s`
                        }}
                        onClick={() => handleLeafClick(i)}
                        title={`${fb.Name || 'Anonymous'}`}
                      >
                        {/* Stem */}
                        <div className="leaf-stem"></div>
                        
                        {/* Leaf */}
                        <svg className="leaf-svg" width="36" height="42" viewBox="0 0 36 42">
                          <defs>
                            <linearGradient id={`leafGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: isActive ? '#4ade80' : '#22c55e' }} />
                              <stop offset="100%" style={{ stopColor: isActive ? '#22c55e' : '#16a34a' }} />
                            </linearGradient>
                            <filter id={`leafShadow-${i}`}>
                              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25"/>
                            </filter>
                          </defs>
                          
                          {/* Leaf shape */}
                          <ellipse 
                            cx="18" 
                            cy="24" 
                            rx="14" 
                            ry="18" 
                            fill={`url(#leafGrad-${i})`}
                            filter={`url(#leafShadow-${i})`}
                          />
                          
                          {/* Leaf vein */}
                          <line 
                            x1="18" 
                            y1="8" 
                            x2="18" 
                            y2="38" 
                            stroke="rgba(0,0,0,0.15)" 
                            strokeWidth="1"
                          />
                        </svg>

                        {isActive && <div className="leaf-glow-ring"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-view">
            <div className="empty-icon">🌱</div>
            <h2>Waiting for the First Guest</h2>
            <p>Your feedback tree is ready to grow with beautiful memories.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function hashCode(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}