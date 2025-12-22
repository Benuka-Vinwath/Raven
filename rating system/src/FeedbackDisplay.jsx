import React, { useEffect, useState } from "react";
import { supabase } from "./SupabaseClient";
import "./FeedbackDisplay.css";

const PER_PAGE = 100;

const FeedBacksDisplay = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFeedbacks();

    // Realtime updates
    const channel = supabase
      .channel("public:feedBacks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedBacks" },
        () => {
          fetchFeedbacks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedBacks")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching feedbacks:", error);
    } else {
      setFeedbacks(data || []);
    }
    setLoading(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(feedbacks.length / PER_PAGE);
  const startIndex = (page - 1) * PER_PAGE;
  const currentData = feedbacks.slice(startIndex, startIndex + PER_PAGE);

  if (loading) return <p>Loading feedbacks...</p>;

  return (
    <div className="feedback-page">
      <h1>User Feedbacks - GUEST BOOK</h1>

      <div className="feedback-container">
        <div className="feedback-grid">
          {currentData.length > 0 ? (
            currentData.map((fb) => (
              <div className="feedback-card" key={fb.id}>
                <h2>{fb.Name}</h2>
                <p>{fb.Comment}</p>
                {fb.Rating && (
                  <div className="feedback-stars">
                    {"⭐".repeat(fb.Rating)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No feedbacks yet</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedBacksDisplay;
