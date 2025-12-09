// src/HolographicGuestBook.jsx
import React, { useEffect, useRef, useState } from "react";
import "./HolographicGuestBook.css";
import { supabase } from "./supabaseClient";

const SWITCH_INTERVAL = 4500; // ms

function createStarArray(rating, max = 5) {
  return Array.from({ length: max }, (_, i) => (i + 1 <= rating ? "★" : "☆"));
}

// Helper function to format timestamp
function formatTimestamp(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function HolographicGuestBook() {
  const [commentsData, setCommentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [mostCommonRating, setMostCommonRating] = useState(5);
  const intervalRef = useRef(null);

  // parallax for floating comments
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);

  const totalEntries = commentsData.length;
  const currentComment = commentsData[currentIndex] || {};

  // Fetch comments from Supabase
  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription for feedBacks table
    const subscription = supabase
      .channel('feedbacks_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feedBacks' },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchComments();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments from Supabase...');
      const { data, error } = await supabase
        .from('feedBacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched data:', data);

      if (!data || data.length === 0) {
        console.warn('No comments found in database');
        setCommentsData([]);
        setLoading(false);
        return;
      }

      // Transform data to match component structure
      // Note: Supabase column names are PascalCase (Name, Comment, Rating)
      const transformedData = data.map(item => ({
        name: item.Name || item.name || 'Anonymous',
        tagline: item.Tagline || item.tagline || item.Title || item.title || 'Guest',
        comment: item.Comment || item.comment || item.Feedback || item.feedback || item.Message || item.message || '',
        rating: item.Rating || item.rating || 5,
        timestamp: formatTimestamp(item.created_at || item.Created_at || item.timestamp)
      }));

      console.log('Transformed data:', transformedData);
      setCommentsData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setLoading(false);
    }
  };

  // Calculate stats when comments change
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
  }, [commentsData]);

  // Auto rotate comments
  useEffect(() => {
    if (commentsData.length > 0) {
      startAutoRotate();
    }
    return () => stopAutoRotate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsData.length]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="gb-body">
        <div className="guest-book-wrapper">
          <div className="glow-ring" />
          <section className="guest-book">
            <div className="left-page">
              <h1 className="title">Guest Book</h1>
              <p className="subtitle">Loading...</p>
            </div>
            <div className="right-page">
              <h2>Fetching entries...</h2>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Show message if no comments
  if (commentsData.length === 0) {
    return (
      <div className="gb-body">
        <div className="guest-book-wrapper">
          <div className="glow-ring" />
          <section className="guest-book">
            <div className="left-page">
              <h1 className="title">Guest Book</h1>
              <p className="subtitle">Be the first to leave a comment!</p>
            </div>
            <div className="right-page">
              <h2>No entries yet</h2>
              <p>Your feedback will appear here.</p>
            </div>
          </section>
        </div>
      </div>
    );
  }


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
