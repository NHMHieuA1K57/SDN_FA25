// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";
// import { BrowserRouter } from "react-router-dom";
// import AuthProvider from "./context/auth-context/index.jsx";
// import InstructorProvider from "./context/instructor-context/index.jsx";
// import StudentProvider from "./context/student-context/index.jsx";

// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <AuthProvider>
//       <InstructorProvider>
//         <StudentProvider>
//           <App />
//         </StudentProvider>
//       </InstructorProvider>
//     </AuthProvider>
//   </BrowserRouter>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import { Toaster } from "@/components/ui/toaster.jsx"; // 1. Import the Toaster

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <InstructorProvider>
        <StudentProvider>
          <App />
          <Toaster /> {/* 2. Add the Toaster component here */}
        </StudentProvider>
      </InstructorProvider>
    </AuthProvider>
  </BrowserRouter>
);