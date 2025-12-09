// src/HolographicGuestBook.jsx
import React, { useEffect, useRef, useState } from "react";
import "./HolographicGuestBook.css";

// SAMPLE COMMENTS (no database)
const commentsData = [
  {
    name: "ALEX JOHNSON",
    tagline: "Product Designer",
    comment:
      "This holographic guest book feels magical. The animations are silky smooth and genuinely delightful.",
    rating: 5,
    timestamp: "2 minutes ago",
  },
  {
    name: "PRIYA DESILVA",
    tagline: "Event Host",
    comment:
      "Our guests loved seeing their messages float by in real time. It adds so much personality to the venue.",
    rating: 5,
    timestamp: "11 minutes ago",
  },
  {
    name: "MIGUEL RODRIGUEZ",
    tagline: "Digital Artist",
    comment:
      "The subtle holographic glow and motion are beautiful. It looks like a book made of light.",
    rating: 4,
    timestamp: "24 minutes ago",
  },
  {
    name: "SARAH LEE",
    tagline: "Developer",
    comment:
      "Super intuitive. I appreciate how the ratings and comments stay legible even with all the effects.",
    rating: 5,
    timestamp: "42 minutes ago",
  },
];

const SWITCH_INTERVAL = 4500; // ms

function createStarArray(rating, max = 5) {
  return Array.from({ length: max }, (_, i) => (i + 1 <= rating ? "★" : "☆"));
}

export function HolographicGuestBook() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [mostCommonRating, setMostCommonRating] = useState(5);
  const intervalRef = useRef(null);

  // parallax for floating comments
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);

  const totalEntries = commentsData.length;
  const currentComment = commentsData[currentIndex];

  // Calculate stats once
  useEffect(() => {
    if (!commentsData.length) return;
    const sum = commentsData.reduce((acc, c) => acc + c.rating, 0);
    const avg = sum / commentsData.length;
    setAverageRating(avg);

    const freq = {};
    commentsData.forEach((c) => {
      freq[c.rating] = (freq[c.rating] || 0) + 1;
    });
    const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    setMostCommonRating(Number(mostCommon || 5));
  }, []);

  // Auto rotate comments
  useEffect(() => {
    startAutoRotate();
    return () => stopAutoRotate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAutoRotate = () => {
    stopAutoRotate();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % commentsData.length);
    }, SWITCH_INTERVAL);
  };

  const stopAutoRotate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const avgStars = createStarArray(Math.round(averageRating));
  const formattedIndex = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
    totalEntries
  ).padStart(2, "0")}`;

  // mouse parallax handlers
  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;

    setParallax({
      x: x * 30,
      y: y * 20,
    });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

    const floatingPositions = [
    { top: "2%", left: "-19%" },   // top-left
    { top: "4%", left: "98%" },  // top-right
    { top: "82%", left: "-19%" }, // bottom-left
    { top: "88%", left: "96%" }, // bottom-right
    { top: "46%", left: "-19%" },  // left middle
    { top: "50%", left: "95%" }, // right middle
    { top: "20%", left: "4%" },  // upper-left side
    { top: "76%", left: "88%" }, // lower-right side
  ];


  return (
    <div className="gb-body">
      <div
        className="guest-book-wrapper"
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="glow-ring" />
        <div className="scanline" />

        {/* Depth parallax floating comments around dashboard */}
        {commentsData.length > 0 && (
          <div
            className="floating-comments-layer"
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            }}
          >
{commentsData.slice(0, 8).map((comment, index) => {
  const pos = floatingPositions[index % floatingPositions.length];
  return (
  <div
    key={index}
    className="parallax-comment"
    style={{
      top: pos.top,
      left: pos.left,
    }}


              >
                <div className="pc-stars">
                  {createStarArray(comment.rating).map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <div className="pc-text">
                  {comment.comment.length > 60
                    ? comment.comment.slice(0, 60) + "…"
                    : comment.comment}
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* decorative particles */}
        <div
          className="particle"
          style={{ top: "20%", left: "14%", animationDelay: "-2s" }}
        />
        <div
          className="particle"
          style={{ top: "70%", left: "80%", animationDelay: "-4s" }}
        />
        <div
          className="particle"
          style={{ top: "50%", left: "30%", animationDelay: "-6s" }}
        />

        {/* MAIN HOLOGRAPHIC BOOK */}
        <section className="guest-book">
          {/* LEFT PAGE */}
          <div className="left-page">
            <h1 className="title">Guest Book</h1>
            <p className="subtitle">Live impressions • Holographic edition</p>

            <div className="divider" />

            <p className="average-rating-label">Overall sentiment</p>
            <div className="average-rating-row">
              <span className="average-rating-value">
                {averageRating.toFixed(1)}
              </span>
              <div className="average-rating-stars">
                {avgStars.map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
            </div>
            <p className="rating-count">
              Based on {totalEntries} entr{totalEntries === 1 ? "y" : "ies"}
            </p>

            <div className="mini-metrics">
              <span>★ Most: {mostCommonRating}-star moments</span>
              <span>Entries: {totalEntries}</span>
              <span>Auto-scroll: Enabled</span>
            </div>
          </div>

          {/* RIGHT PAGE */}
          <div className="right-page">
            <div className="comment-header-row">
              <h2>Latest entries</h2>
              <span>{formattedIndex}</span>
            </div>

            <div className="comments-window">
              <div
                className="comments-track"
                onMouseEnter={stopAutoRotate}
                onMouseLeave={startAutoRotate}
              >
                {commentsData.map((comment, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <article
                      key={comment.name + index}
                      className={`comment-card ${
                        isActive ? "active" : "inactive"
                      }`}
                    >
                      <div className="comment-top-row">
                        <div className="comment-author">
                          <div className="avatar" />
                          <div className="author-meta">
                            <div className="author-name">{comment.name}</div>
                            <div className="author-tagline">
                              {comment.tagline}
                            </div>
                          </div>
                        </div>
                        <div className="comment-rating">
                          <div className="comment-stars">
                            {createStarArray(comment.rating).map((star, i) => (
                              <span key={i}>{star}</span>
                            ))}
                          </div>
                          <span className="rating-label">
                            {comment.rating.toFixed(1)} / 5
                          </span>
                        </div>
                      </div>

                      <p className="comment-body">{comment.comment}</p>

                      <div className="comment-footer">
                        <div className="timeline-dot">
                          {comment.timestamp || "live"}
                        </div>
                        <div className="auto-scroll-indicator">
                          <span />
                          <span />
                          <span />
                          &nbsp;SCROLLING
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="comment-footer bottom-footer">
              <div className="timeline-dot">
                {currentComment.timestamp || "live"}
              </div>
              <div className="auto-scroll-indicator">
                <span />
                <span />
                <span />
                &nbsp;AUTO&nbsp;SCROLL
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
