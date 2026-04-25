import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { generateToken } from "../lib/generateToken";
import Select from "react-select";
import log from "../../logger";
import NotLoggedIn from "../components/NotLoggedIn";

const AddPatientForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    contactNumber: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyNumber: "",
    fatherName: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [patientIdInput, setPatientIdInput] = useState("");

  // Fetch clinic services
  useEffect(() => {
    const fetchClinicServices = async () => {
      if (user?.clinicId) {
        try {
          const clinicRef = doc(db, "clinic", user.clinicId);
          const clinicSnap = await getDoc(clinicRef);
          if (clinicSnap.exists()) {
            const clinicData = clinicSnap.data();
            const servicesMap = clinicData.services || {};
            log.info("Services map:", servicesMap);

            const formattedServices = Object.keys(servicesMap).map(
              (serviceKey) => ({
                label: serviceKey,
                value: serviceKey,
                price: servicesMap[serviceKey],
              })
            );
            log.info("Formatted services");
            setServicesOptions(formattedServices);
          } else {
            log.warn("No such clinic document!");
          }
        } catch (error) {
          log.error("Error fetching clinic services:", error);
        }
      }
    };

    fetchClinicServices();
  }, [user?.clinicId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Please enter a valid name.";
    if (!formData.gender) newErrors.gender = "Please select gender.";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Please enter a contact number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    log.info("Form submission data");
    const servicesMap = {};
    selectedServices.forEach((s) => {
      servicesMap[s.label] = s.price;
    });

    if (!validate()) return;

    try {
      const tokenNumber = await generateToken(user.clinicId);

      const patientRef = await addDoc(collection(db, "patients"), {
        name: formData.name,
        gender: formData.gender,
        dob: formData.dob,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyNumber: formData.emergencyNumber,
        fatherName: formData.fatherName,
        clinicId: user.clinicId,
        addedBy: user.uid,
        services: selectedServices.map((s) => s.label),
        createdAt: new Date(),
      });

      if (selectedServices.length > 0) {
        const tokenDoc = await addDoc(collection(db, "tokens"), {
          clinicId: user.clinicId,
          createdAt: new Date(),
          patientId: patientRef.id,
          token: tokenNumber,
          status: "waiting",
          paid: false,
        });

        await addDoc(collection(db, "bills"), {
          clinicId: user.clinicId,
          patientId: patientRef.id,
          tokenId: tokenDoc.id,
          token: tokenNumber,
          status: "unpaid",
          services: servicesMap,
          amount: selectedServices.reduce((acc, s) => acc + s.price, 0),
          createdAt: new Date(),
        });
      }

      alert("Patient and Billing added successfully!");
      navigate("/billing");

      setFormData({
        name: "",
        gender: "",
        dob: "",
        contactNumber: "",
        email: "",
        address: "",
        emergencyContact: "",
        emergencyNumber: "",
        fatherName: "",
      });
      setSelectedServices([]);
    } catch (error) {
      log.error("Error adding patient/billing:", error);
      alert("Failed to add patient.");
    }
  };

  const handleFetchPatient = async () => {
    if (!patientIdInput) {
      alert("Enter ID, phone or email");
      return;
    }

    try {
      log.info("Searching patient", { query: patientIdInput });

      let snap;

      // 🔹 Try ID first
      const docRef = doc(db, "patients", patientIdInput);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        snap = docSnap;
      } else {
        // 🔹 Try phone/email search
        const q = query(
          collection(db, "patients"),
          where("contactNumber", "==", patientIdInput)
        );

        const emailQuery = query(
          collection(db, "patients"),
          where("email", "==", patientIdInput)
        );

        const [phoneSnap, emailSnap] = await Promise.all([
          getDocs(q),
          getDocs(emailQuery),
        ]);

        if (!phoneSnap.empty) snap = phoneSnap.docs[0];
        else if (!emailSnap.empty) snap = emailSnap.docs[0];
        else {
          alert("Patient not found");
          return;
        }
      }

      const data = snap.data();

      setFormData({
        name: data.name || "",
        gender: data.gender || "",
        dob: data.dob || "",
        contactNumber: data.contactNumber || "",
        email: data.email || "",
        address: data.address || "",
        emergencyContact: data.emergencyContact || "",
        emergencyNumber: data.emergencyNumber || "",
        fatherName: data.fatherName || "",
      });

      log.info("Patient loaded successfully");
      setPatientIdInput("");
    } catch (error) {
      log.error("Fetch error", error);
      alert("Failed to fetch patient");
    }
  };

  if (!user || user.role !== "receptionist") {
    return <NotLoggedIn />;
  }

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex justify-center items-center py-12 px-6">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-8">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                🔍 Search Existing Patient
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter Patient ID / Phone / Email"
                />

                <button
                  type="button"
                  onClick={handleFetchPatient}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Add New Patient
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                // Dynamic Form Fields
                {
                  label: "Full Name",
                  name: "name",
                  type: "text",
                  placeholder: "Enter full name",
                },
                {
                  label: "Date of Birth",
                  name: "dob",
                  type: "date",
                  placeholder: "",
                },
                {
                  label: "Contact Number",
                  name: "contactNumber",
                  type: "tel",
                  placeholder: "Enter contact number",
                },
                {
                  label: "Email Address",
                  name: "email",
                  type: "email",
                  placeholder: "Enter email address",
                },
                {
                  label: "Father's Name",
                  name: "fatherName",
                  type: "text",
                  placeholder: "Enter father's name",
                },
                {
                  label: "Emergency Contact Name",
                  name: "emergencyContact",
                  type: "text",
                  placeholder: "Enter emergency contact name",
                },
                {
                  label: "Emergency Contact Number",
                  name: "emergencyNumber",
                  type: "tel",
                  placeholder: "Enter emergency contact number",
                },
              ].map((field) => (
                <div key={field.name} className="mb-6">
                  <label className="block text-sm font-medium text-gray-600">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                    placeholder={field.placeholder}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              {/* Gender Radio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Gender
                </label>
                <div className="flex space-x-6 mt-2">
                  {["Male", "Female"].map((gender) => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        onChange={handleChange}
                        checked={formData.gender === gender}
                        className="form-radio text-blue-500"
                      />
                      <span className="ml-2 text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-2">{errors.gender}</p>
                )}
              </div>

              {/* Address */}
              <div className="mb-6 md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter address"
                />
              </div>

              {/* Services */}
              <div className="mb-6 md:col-span-2">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">
                  Billing Information
                </h3>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select Services
                </label>
                <Select
                  isMulti
                  name="services"
                  options={servicesOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={setSelectedServices}
                  placeholder="Choose one or more services"
                />
                <div className="mt-4 text-gray-700">
                  <p className="text-sm">
                    <strong>Total Charges:</strong> ₹{" "}
                    {selectedServices.reduce(
                      (acc, s) => acc + parseInt(s.price),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition mt-6"
            >
              Add Patient
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddPatientForm;
