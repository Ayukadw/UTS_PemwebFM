import { Routes, Route } from "react-router-dom";

import "antd/dist/reset.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import "./assets/styles/adaptive.css";

// import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/layout/PrivateRoute";

// import Blank from "./pages/Blank";
// import Gallery from "./pages/Gallery";
import Playlist from "./pages/Playlist";
import Music from "./pages/Music";
import Movie from "./pages/Movie";
import Others from "./pages/Others";
import Song from "./pages/Song";
import Education from "./pages/Education";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          exact
          path="/"
          element={<PrivateRoute component={<Playlist />} />}
        />
        <Route
          exact
          path="/music"
          element={<PrivateRoute component={<Music />} />}
        />  
        <Route
          exact
          path="/movie"
          element={<PrivateRoute component={<Movie />} />}
        />
        <Route
          exact
          path="/playlist"
          element={<PrivateRoute component={<Playlist />} />}
        />
        <Route
          exact
          path="/others"
          element={<PrivateRoute component={<Others />} />}
        />
        <Route
          exact
          path="/song"
          element={<PrivateRoute component={<Song />} />}
        />
        <Route
          exact
          path="/education"
          element={<PrivateRoute component={<Education />} />}
        />
      </Routes>
    </div>
  );
}

export default App;
