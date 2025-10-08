// IMPORT NG MGA FRAMEWORKS
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './assets/components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
// END OF IMPORT NG MGA FRAMEWORKS

// PAGES IMPORT AREA
import Home from './pages/Home';
import Planets from './pages/Planets';
import ARScene from './pages/ARScene';
import Stars from './pages/Stars.jsx';
import Games from './pages/Games.jsx';
import Explore from './pages/Explore.jsx';
import SolarSystemAR from './pages/ExploreSection/SolarSystemAR.jsx';
import PlanetQuiz from './pages/GameSection/PlanetQuiz';
import ConnectTheStars from './pages/GameSection/ConnectTheStars';
import PlanetMatching from './pages/GameSection/PlanetMatching';
import StarARScene from './pages/StarARScene';
import SunMoon from './pages/SunMoon';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Earth from './pages/planets/Earth';
import Mercury from './pages/planets/Mercury';
import Venus from './pages/planets/Venus';
import Mars from './pages/planets/Mars';
import Jupiter from './pages/planets/Jupiter';
import Saturn from './pages/planets/Saturn';
import Uranus from './pages/planets/Uranus';
import Neptune from './pages/planets/Neptune';
import Sun from './pages/planets/Sun';
import BigDipper from './pages/constellations/BigDipper';
import SmallDipper from './pages/constellations/SmallDipper';
import Orion from './pages/constellations/Orion';
import Cancer from './pages/constellations/Cancer';
import Leo from './pages/constellations/Leo';
import Taurus from './pages/constellations/Taurus';
import Libra from './pages/constellations/Libra';
import Virgo from './pages/constellations/Virgo';
import ARConstellations from './pages/ARConstellations';

// END OF PAGES IMPORT AREA

// STYLE (CSS) AREA
import './styles/main.css';
import './styles/App.css';
import './styles/Planets.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// END OF STYLE (CSS) AREA

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes with Navbar */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/planets" element={<Planets />} />
                  <Route path="/planets/mercury" element={<Mercury />} />
                  <Route path="/planets/venus" element={<Venus />} />
                  <Route path="/planets/earth" element={<Earth />} />
                  <Route path="/planets/mars" element={<Mars />} />
                  <Route path="/planets/jupiter" element={<Jupiter />} />
                  <Route path="/planets/saturn" element={<Saturn />} />
                  <Route path="/planets/uranus" element={<Uranus />} />
                  <Route path="/planets/neptune" element={<Neptune />} />
                  <Route path="/planets/sun" element={<Sun />} />
                  <Route path="/constellations/big-dipper" element={<BigDipper />} />
                  <Route path="/constellations/small-dipper" element={<SmallDipper />} />
                  <Route path="/constellations/orion" element={<Orion />} />
                  <Route path="/constellations/cancer" element={<Cancer />} />
                  <Route path="/constellations/leo" element={<Leo />} />
                  <Route path="/constellations/taurus" element={<Taurus />} />
                  <Route path="/constellations/libra" element={<Libra />} />
                  <Route path="/constellations/virgo" element={<Virgo />} />
                  <Route path="/ar-constellations" element={<ARConstellations />} />
                  <Route path="/ar-scene" element={<ARScene />} />
                  <Route path="/stars" element={<Stars />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/SolarSystemAR" element={<SolarSystemAR/>} />
                  <Route path="/sun-moon" element={<SunMoon />} />
                  <Route path="/games/planet-quiz" element={<PlanetQuiz />} />
                  <Route path="/games/connect-the-stars" element={<ConnectTheStars />} />
                  <Route path="/games/planet-matching" element={<PlanetMatching />} />
                  <Route path="/star-3d/:starId" element={<StarARScene />} />
                  
                  {/* Protected Admin Route */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;