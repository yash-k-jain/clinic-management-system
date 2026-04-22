import React, { useEffect, useState } from "react";
import {
  fetchAddedUser,
  fetchAllPatients,
  fetchPrescriptions,
} from "../lib/patientsPage";
import { useAuth } from "../context/AuthContext";
import NotLoggedIn from "../components/NotLoggedIn";
import LoadingSpinner from "../components/Loading";
import moment from "moment";
import Navbar from "../components/Navbar";
import log from "../../logger";

const PatientsPage = () => {
  const { user, loading } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");

  // =========================
  // FETCH ALL PATIENTS
  // =========================
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        log.info("Fetching patients...");

        const data = await fetchAllPatients(user.clinicId);
        const filteredPatients = data.filter(
          (patient) => patient.status === "done"
        );
        setPatients(filteredPatients);

        if (data.length > 0) {
          setSelectedPatient(data[0]);
        }

        log.info(`Patients loaded: ${data.length}`);
      } catch (err) {
        log.error("Error fetching patients", err);
      }
    };

    fetchData();
  }, [user]);

  // =========================
  // FETCH ADDED BY + PRESCRIPTION
  // =========================
  useEffect(() => {
    if (!selectedPatient?.id) return;

    const fetchExtra = async () => {
      try {
        log.info("Fetching extra patient data...");

        const clinicId = user?.clinicId;

        const addedUserData = await fetchAddedUser(selectedPatient.addedBy);

        let prescription = [];
        try {
          prescription = await fetchPrescriptions(
            selectedPatient.id,
            user.uid,
            clinicId
          );
        } catch (err) {
          log.error("Prescription fetch failed", err);
        }

        setSelectedPatient((prev) => ({
          ...prev,
          addedBy: addedUserData,
          prescription,
        }));
      } catch (err) {
        log.error("Error fetching extra data", err);
      }
    };

    fetchExtra();
  }, [selectedPatient?.id]); // ✅ FIXED (no infinite loop)

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredPatients = patients.filter((p) => {
    const query = search.toLowerCase();

    return (
      p.name?.toLowerCase().includes(query) ||
      String(p.contactNumber || "").includes(query) ||
      p.email?.toLowerCase().includes(query)
    );
  });

  // =========================
  // UI STATES
  // =========================
  if (loading) return <LoadingSpinner />;
  if (!user || user.role === "receptionist") return <NotLoggedIn />;

  return (
    <>
      <Navbar user={user} />

      <div className="flex min-h-screen bg-gradient-to-r from-purple-300 to-blue-300 pt-2">
        {/* ================= SIDEBAR ================= */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl p-6 rounded-xl border-r-4 border-purple-500 overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center">
            Patients
          </h2>

          <input
            type="text"
            placeholder="Search by name, number, email..."
            className="w-full mb-6 px-4 py-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ul className="space-y-3">
            {filteredPatients.map((patient) => (
              <li
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`p-4 rounded-lg cursor-pointer transition ${
                  selectedPatient?.id === patient.id
                    ? "bg-purple-200"
                    : "bg-gray-50 hover:bg-purple-100"
                }`}
              >
                <h3 className="font-semibold">{patient.name}</h3>
                <p className="text-sm text-gray-600">Token #{patient.token}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="flex-1 p-8">
          {selectedPatient ? (
            <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8">
              {/* HEADER */}
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={selectedPatient.profilePicture || "/default-avatar.png"}
                  alt={selectedPatient.name}
                  className="w-24 h-24 rounded-full border object-cover"
                />

                <div>
                  <h2 className="text-2xl font-bold text-purple-700">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-gray-600">
                    Token #{selectedPatient.token}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <p>
                  <strong>Gender:</strong> {selectedPatient.gender}
                </p>
                <p>
                  <strong>DOB:</strong> {selectedPatient.dob}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedPatient.contactNumber}
                </p>
                <p>
                  <strong>Email:</strong> {selectedPatient.email}
                </p>
                <p>
                  <strong>Father:</strong> {selectedPatient.fatherName}
                </p>
                <p>
                  <strong>Status:</strong> {selectedPatient.status}
                </p>
                <p className="col-span-2">
                  <strong>Address:</strong> {selectedPatient.address}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {selectedPatient.createdAt
                    ? moment(selectedPatient.createdAt.toDate()).format(
                        "DD MMM YYYY HH:mm"
                      )
                    : "--"}
                </p>
              </div>

              {/* ADDED BY */}
              <div className="mt-8 border-t pt-4">
                <h3 className="text-xl font-semibold text-purple-700">
                  Added By
                </h3>

                {selectedPatient.addedBy ? (
                  <>
                    <p>Name: {selectedPatient.addedBy.name}</p>
                    <p>Email: {selectedPatient.addedBy.email}</p>
                    <p>Role: {selectedPatient.addedBy.role}</p>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </div>

              {/* PRESCRIPTIONS */}
              <div className="mt-8 border-t pt-4">
                <h3 className="text-xl font-semibold text-purple-700">
                  Prescriptions
                </h3>

                {selectedPatient.prescription?.length > 0 ? (
                  selectedPatient.prescription.map((p, i) => (
                    <p key={i} className="mt-2">
                      {p.prescriptionText}
                    </p>
                  ))
                ) : (
                  <p>No prescriptions found</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center mt-20">
              Select a patient to view details
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientsPage;
