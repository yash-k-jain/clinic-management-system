import { signOut } from "firebase/auth";
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ get current route

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";
  const role = user?.role;

  const doctorLinks = [
    { name: "Patients", path: "/patients" },
    { name: "Clinic Profile", path: "/clinic" },
  ];

  const receptionistLinks = [
    { name: "Add Patient", path: "/add-patient" },
    { name: "History", path: "/history" },
    { name: "Billing", path: "/billing" },
  ];

  const navLinks =
    role === "doctor"
      ? doctorLinks
      : role === "receptionist"
      ? receptionistLinks
      : [];

  const handleLogout = () => {
    signOut(auth);
    navigate("/login");
  };

  // ✅ helper for active styling
  const getLinkClass = (path) =>
    location.pathname === path
      ? "text-blue-700 font-semibold border-b-2 border-blue-600 pb-1"
      : "text-gray-700 hover:text-blue-600 font-medium transition";

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex flex-wrap justify-between items-center">
      {/* Logo */}
      <Link to="/">
        <div className="text-xl font-bold text-blue-700">
          Clinic Management System
        </div>
      </Link>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        <Link to="/" className={getLinkClass("/")}>
          Back to Patient Window
        </Link>

        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={getLinkClass(link.path)} // ✅ active logic applied
          >
            {link.name}
          </Link>
        ))}

        {/* User Info */}
        <div className="flex items-center space-x-2 border-l pl-4 ml-2">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold">
            {firstLetter}
          </div>
          <span className="font-medium text-gray-800">{user?.name}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;