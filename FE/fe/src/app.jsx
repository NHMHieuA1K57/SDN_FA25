import { Route, Routes } from "react-router-dom";
import StudentHomePage from "./pages/student/home";

function App() {

  return (
    <Routes>
        <Route path="home" element={<StudentHomePage />} />
    </Routes>
  );
}

export default App;
