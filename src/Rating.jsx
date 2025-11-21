export default function RatingForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const id = 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !name || !comment) {
      alert("Please fill out all fields and select a rating!");
      return;
    }
    const{data,error} = await supabase.from("feedBacks").insert([
    {
      
      Name:name,
      Comment:comment,
      Rating:rating
    },
    ]);
    if(error)
    {
      console.log("Error inserting data:",error)
      alert("Failed to submit the feedback, Try again!")
    }else{
      console.log("Inserted:", data)
      setSubmitted(true);

      setTimeout(()=>{
        setSubmitted(false)
        setRating(0);
        setHover(0);
        setName("");
        setComment("");
      },3000);
    }
  };
  

  return (
    <div className="rating-container">
      <h2>Leave Your Feedback</h2>

      {submitted ? (
        <div className="thankyou">
          <h3>⭐ Thank you, {name}!</h3>
          <p>Your rating: {rating} / 5</p>
          <p>{comment}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[...Array(5)].map((star, index) => {
              const currentRating = index + 1;
              return (
                <span
                  key={index}
                  className={`star ${
                    currentRating <= (hover || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(currentRating)}
                  onMouseEnter={() => setHover(currentRating)}
                  onMouseLeave={() => setHover(rating)}
                >
                  ★
                </span>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}
