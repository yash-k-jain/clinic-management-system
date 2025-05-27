import { signOut } from "firebase/auth";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
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
    signOut(auth)
    navigate("/login")
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex flex-wrap justify-between items-center">
      {/* Logo / Title */}
      <Link to="/">
        <div className="text-xl font-bold text-blue-700">
          Clinic Management System
        </div>
      </Link>

      {/* Right Section: Links + User Info + Logout */}
      <div className="flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            {link.name}
          </Link>
        ))}

        <div className="flex items-center space-x-2 border-l pl-4 ml-2">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold">
            {firstLetter}
          </div>
          <span className="font-medium text-gray-800">{user?.name}</span>
        </div>

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
