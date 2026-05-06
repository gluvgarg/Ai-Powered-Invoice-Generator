import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
}from "react-router-dom";
import { Toaster }from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Auth/Dashboard/Dashboard";
import Allinvoices from "./pages/Invoices/Allinvoices";
import Createinvoice from "./pages/Invoices/Createinvoice";
import Invoicedetail from "./pages/Invoices/Invoicedetail";
import ProfilePage from "./pages/Profile/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/login" element={<Login/>}/>

          <Route element={<ProtectedRoute/>}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/invoices" element={<Allinvoices/>}/>
            <Route path="/invoices/new" element={<Createinvoice/>}/>
            <Route path="/invoices/:id" element={<Invoicedetail/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
          </Route>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className : "",
          style: {
            fontSize: "13px",
          }
        }}
      />
    </AuthProvider>
  )
}

export default App
