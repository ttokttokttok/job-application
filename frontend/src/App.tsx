import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ResumeUpload from './pages/ResumeUpload';
import ProfileForm from './pages/ProfileForm';
import NewDashboard from './pages/NewDashboard';
import ApplicationDetails from './pages/ApplicationDetails';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ResumeUpload />} />
        <Route path="/profile" element={<><Header /><ProfileForm /></>} />
        <Route path="/dashboard" element={<NewDashboard />} />
        <Route path="/application/:id" element={<><Header /><ApplicationDetails /></>} />
      </Routes>
    </Router>
  );
}

export default App;
