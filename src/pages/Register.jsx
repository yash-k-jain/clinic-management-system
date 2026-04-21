import React, { useEffect, useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import log from "../../logger"; // import your logger utility

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
    clinicId: "",
  });
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (formData.role === "doctor") {
      const newClinicId = `clinic_${Date.now()}`;
      log.info("Role changed to doctor, setting clinicId");
      setFormData((prev) => ({ ...prev, clinicId: newClinicId }));
    } else {
      log.info("Role changed to receptionist, clearing clinicId");
      setFormData((prev) => ({ ...prev, clinicId: "" }));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    log.info("Register form submitted");

    try {
      const response = await registerUser(
        formData.email,
        formData.name,
        formData.password,
        formData.role,
        formData.clinicId
      );

      if (response.success) {
        log.info("Registration successful, navigating to home");
        navigate("/");
      } else {
        log.warn("Registration failed", { message: response.message });
        setErrors(response.message);
      }
    } catch (error) {
      log.error("Error during registration", error);
      setErrors(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Image */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://rescribe.in/assets/img/Product_Clinic_Mgmt_Assets/doctor_management.png)",
        }}
      ></div>

      {/* Right: Form */}
      <div className="flex items-center justify-center md:w-1/2 bg-gradient-to-tr from-sky-200 to-blue-500">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md m-6">
          <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
            Register
          </h2>
          {errors && <p className="text-red-500">{errors}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
            </select>
            <input
              type="text"
              name="clinicId"
              placeholder="Clinic ID"
              value={formData.clinicId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
              readOnly={formData.role === "doctor"}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Register
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
