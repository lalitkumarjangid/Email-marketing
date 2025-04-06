import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ScheduleEmail from "./pages/ScheduleEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import EmailHistory from "./pages/EmailHistory";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/emailhistory" element={<ProtectedRoute><EmailHistory /></ProtectedRoute>} />
        <Route path="/schedule-email" element={<ProtectedRoute><ScheduleEmail /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
