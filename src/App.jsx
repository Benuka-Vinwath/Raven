import './App.css'
import Header from "./Header"
import Rating from "./Rating"
import{BrowserRouter as Router,Routes,Route} from "react-router-dom";
import FeedbackDisplay from "./FeedbackDisplay"

function App() {
  

  return (
   <>
      <Router>
        <Routes>
          <Route path = "/" element = {<Rating/>} />
          <Route path="/feedbacks" element = {<FeedbackDisplay/>} />

        </Routes>
      </Router>
    </>

  )
}
  
export default App;
