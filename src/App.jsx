import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthProvider from "./context/AuthContext";
import AddPatientForm from "./pages/AddPatient";
import ClinicRecords from "./pages/ClinicRecords";
import PatientsPage from "./pages/PatientsPage";
import BillingPage from "./pages/BillsPage";
import ClinicInfoForm from "./pages/ClinicInfoForm";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/add-patient" element={<AddPatientForm />} />
            <Route path="/history" element={<ClinicRecords />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/clinic" element={<ClinicInfoForm />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
