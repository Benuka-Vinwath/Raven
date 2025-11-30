import React, { useEffect, useState } from "react";
import { supabase } from "./SupabaseClient";

const FeedBacksDisplay = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from("feedBacks")
        .select("*")
        .order("id", { ascending: false });

      console.log("DATA:", data, "ERROR:", error);

      if (error) {
        console.error("Error fetching feedbacks:", error);
      } else {
        setFeedbacks(data || []);
      }

      // Only run once for initial load
      if (loading) setLoading(false);
    };

    fetchFeedbacks();

    // Realtime listener
    const subscription = supabase
      .channel("public:feedBacks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedBacks" },
        (payload) => {
          console.log("Realtime payload:", payload);
          fetchFeedbacks();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  if (loading) return <p>Loading feedbacks...</p>;

  return (
    <div>
      <h1>User FeedBacks</h1>

      <div>
        {feedbacks.length > 0 ? (
          feedbacks.map((fb) => (
            <div key={fb.id}>
              <h2>{fb.Name}</h2>
              <p>{fb.Comment}</p>
              {fb.Rating && <div>{"⭐".repeat(fb.Rating)}</div>}
            </div>
          ))
        ) : (
          <p>No feedbacks yet</p>
        )}
      </div>
    </div>
  );
};

export default FeedBacksDisplay;
