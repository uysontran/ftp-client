import { HashRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));

function App() {
  console.log(window.location.href)
  return (
    <HashRouter>
      <div className="app">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path = "/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
}
export default App;
