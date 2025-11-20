import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ResumeUpload from './pages/ResumeUpload';
import ProfileForm from './pages/ProfileForm';
import Dashboard from './pages/Dashboard';
import ApplicationDetails from './pages/ApplicationDetails';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<ResumeUpload />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/application/:id" element={<ApplicationDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
