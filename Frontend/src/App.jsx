import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import LoginPage from './components/login'
import SignUpPage from './components/signup'
import InsideClass from './components/insideclass'
import Quiz from './components/quize'

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/classroom/:id" element={<InsideClass />} />
          <Route path="classroom/:id/quiz" element={<Quiz />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
