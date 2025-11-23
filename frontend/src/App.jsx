import { useState, useEffect } from "react";
import "./App.css"; // FIXED for Vercel builds
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Simulator from "./pages/Simulator.jsx";
import ChatWidget from "./components/ChatWidget";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("cyber_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/simulator/:type" element={<Simulator user={user} />} />
        </Routes>
      </BrowserRouter>

      {user && <ChatWidget userId={user.id} />}

      <Toaster />
    </div>
  );
}

export default App;
