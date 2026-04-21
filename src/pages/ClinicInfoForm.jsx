import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import log from "../../logger"; // ✅ import logger
import NotLoggedIn from "../components/NotLoggedIn";

const ClinicInfoForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clinicInfo, setClinicInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [services, setServices] = useState([{ name: "", amount: "" }]);

  useEffect(() => {
    if (!user) {
      log.warn("No authenticated user found.");
      return;
    }

    const fetchClinicData = async () => {
      try {
        const clinicRef = doc(db, "clinic", user.clinicId);
        const clinicSnap = await getDoc(clinicRef);

        if (clinicSnap.exists()) {
          const clinicData = clinicSnap.data();
          log.info("Clinic data fetched successfully");

          if (clinicData) {
            setClinicInfo(clinicData);
          }

          if (clinicData.services) {
            const serviceArray = Object.entries(clinicData.services).map(
              ([key, value]) => ({ name: key, amount: value })
            );
            setServices(serviceArray);
            log.debug("Clinic services loaded:", serviceArray);
          }
        } else {
          log.warn("No clinic document found for clinicId");
        }
      } catch (error) {
        log.error("Error fetching clinic data:", error);
        alert("Failed to fetch clinic information.");
      }
    };

    fetchClinicData();
  }, [user]);

  const handleClinicChange = (e) => {
    const { name, value } = e.target;
    setClinicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedServices = [...services];
    updatedServices[index][name] = value;
    setServices(updatedServices);
  };

  const addService = () => {
    setServices([...services, { name: "", amount: "" }]);
    log.debug("New service field added.");
  };

  const removeService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    log.debug("Removed service at index");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    log.info("Submitting clinic form");

    const servicesMap = {};
    services.forEach((s) => {
      servicesMap[s.name] = Number(s.amount);
    });

    try {
      await setDoc(doc(db, "clinic", user.clinicId), {
        ...clinicInfo,
        services: servicesMap,
      });

      log.info("Clinic data saved successfully");

      alert("Clinic information saved successfully!");

      setClinicInfo({
        name: "",
        address: "",
        phone: "",
        email: "",
        website: "",
      });
      setServices([{ name: "", amount: "" }]);
      navigate("/");
    } catch (error) {
      log.error("Error saving clinic data:", error);
      alert("Failed to save clinic information.");
    }
  };

  if (!user || user.role !== "doctor") {
    return <NotLoggedIn />;
  }

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl space-y-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm text-gray-500">Clinic ID</p>
              <p className="text-lg font-semibold text-blue-700 tracking-wide">
                {user.clinicId}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(user.clinicId);
                log.info("Clinic ID copied to clipboard");
                alert("Clinic ID copied!");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
            >
              Copy
            </button>
          </div>
          <h2 className="text-3xl font-bold text-center text-blue-700">
            Clinic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Clinic Name"
              value={clinicInfo.name}
              onChange={handleClinicChange}
              className="input-style"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Clinic Address"
              value={clinicInfo.address}
              onChange={handleClinicChange}
              className="input-style"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={clinicInfo.phone}
              onChange={handleClinicChange}
              className="input-style"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={clinicInfo.email}
              onChange={handleClinicChange}
              className="input-style"
            />
            <input
              type="text"
              name="website"
              placeholder="Website (optional)"
              value={clinicInfo.website}
              onChange={handleClinicChange}
              className="input-style"
            />
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-blue-600 mb-4 text-center">
              Services
            </h3>
            {services.map((service, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 mb-4 items-center"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Service Name"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, e)}
                  className="input-style"
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount (₹)"
                    value={service.amount}
                    onChange={(e) => handleServiceChange(index, e)}
                    className="input-style"
                    required
                  />
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addService}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full transition mt-2 text-sm"
            >
              + Add More Service
            </button>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition text-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClinicInfoForm;
