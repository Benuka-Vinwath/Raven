import { useState } from "react";
import { supabase } from "./SupabaseClient";
import "./Rating.css";

export default function RatingForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !name || !comment) {
      alert("Please fill out all fields and select a rating!");
      return;
    }

    const { data, error } = await supabase.from("feedBacks").insert([
      {
        Name: name,
        Comment: comment,
        Rating: rating,
      },
    ]);

    if (error) {
      console.log("Error inserting data:", error);
      alert("Failed to submit the feedback, Try again!");
    } else {
      console.log("Inserted:", data);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setHover(0);
        setName("");
        setComment("");
      }, 4000);
    }
  };

  return (
    <div className="cyber-container">
      {/* Background Particles */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
      <div className="particle particle-6"></div>

      {/* Main Card */}
      <div className="feedback-card">
        {/* Corner Decorations */}
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>

        {submitted ? (
          <div className="success">
            <div className="success-icon">✓</div>
            <h2 className="success-title">TRANSMISSION RECEIVED</h2>
            <p className="success-text">Thank you, {name}!</p>
            <p className="success-text">Rating: {rating} / 5 ⭐</p>
            <div className="success-comment">{comment}</div>
          </div>
        ) : (
          <>
            <div className="header">
              <h1 className="main-title">GUEST BOOK</h1>
              <p className="subtitle">Neural Interface Active</p>
            </div>

            <div className="rating-section">
              <div className="rating-label">Rate Your Experience</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (hover || rating) ? "active" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form">
              <div className="input-group">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <textarea
                  className="textarea"
                  placeholder="Share Your Thoughts..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button onClick={handleSubmit} className="submit-btn">
                Transmit Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}