import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home'
import LoginPage from './components/login'
import SignUpPage from './components/signup'
import InsideClass from './components/insideclass'
import Quiz from './components/quize'
import ChatbotMenu from './components/chatbotmenu'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/classroom/:id" element={
          <ProtectedRoute>
            <InsideClass />
          </ProtectedRoute>
        } />
        <Route path="quiz" element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <ChatbotMenu />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
