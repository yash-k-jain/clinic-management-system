import React, { useEffect, useState } from "react";
import {
  fetchAddedUser,
  fetchAllPatients,
  fetchPrescriptions,
} from "../lib/patientsPage";
import { useAuth } from "../context/AuthContext";
import NotLoggedIn from "../components/NotLoggedIn";
import LoadingSpinner from "../components/Loading";
import moment from "moment"; // Import moment.js
import Navbar from "../components/Navbar";
import log from "../../logger"; // import your logger utility

const PatientsPage = () => {
  const { user, loading } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch all patients and initialize the first selected patient
  useEffect(() => {
    if (!user) return;

    const fetchingData = async () => {
      const clinicId = user?.clinicId;
      log.info("Fetching all patients for clinic");
      try {
        const patientsData = await fetchAllPatients(clinicId);
        log.info(`Fetched ${patientsData.length} patients`);
        setPatients(patientsData);

        if (patientsData.length > 0) {
          const initialSelectedPatient = patientsData[0];
          log.info("Setting initial selected patient", {
            patientId: initialSelectedPatient.id,
          });
          setSelectedPatient(initialSelectedPatient);
        }
      } catch (error) {
        log.error("Error fetching patients", error);
      }
    };

    fetchingData();
  }, [user]);

  // Fetch "Added By" info and prescriptions every time the selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      const fetchingAddedByData = async () => {
        try {
          log.info("Fetching 'Added By' user data");
          const clinicId = user?.clinicId;

          // Fetch the "Added By" user data
          const addedUserData = await fetchAddedUser(selectedPatient?.addedBy);

          // Fetch prescriptions, wrap in try-catch to handle errors
          let prescription = null;
          try {
            prescription = await fetchPrescriptions(
              selectedPatient?.id,
              user?.uid,
              clinicId
            );
            log.info("Fetched prescriptions");
          } catch (error) {
            log.error("Error fetching prescription", error);
          }

          setSelectedPatient((prev) => ({
            ...prev,
            addedBy: addedUserData,
            prescription: prescription,
          }));
        } catch (error) {
          log.error("Error fetching added user", error);
        }
      };

      fetchingAddedByData();
    }
  }, [selectedPatient, user]);

  const filteredPatients = patients.filter((p) => {
    const match = p.name.toLowerCase().includes(search.toLowerCase());
    if (match) {
      log.debug("Patient matches search filter");
    }
    return match;
  });

  if (!user || user.role === "receptionist") return <NotLoggedIn />;
  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar user={user} />
      <div className="flex min-h-screen bg-gradient-to-r from-purple-300 to-blue-300 font-sans transition-all ease-in-out pt-2">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl p-6 rounded-xl border-r-4 border-purple-500 overflow-y-auto transform transition-transform duration-500">
          <h2 className="text-3xl font-extrabold mb-6 text-purple-700 text-center">
            Patients
          </h2>
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full mb-6 px-6 py-3 text-lg border-2 border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-400 transition-all ease-in-out"
            value={search}
            onChange={(e) => {
              log.debug("Search input changed", { value: e.target.value });
              setSearch(e.target.value);
            }}
          />
          <ul className="space-y-4">
            {filteredPatients.map((patient) => (
              <li
                key={patient?.id}
                onClick={() => {
                  log.info("Patient selected", {
                    patientId: patient.id,
                    name: patient.name,
                  });
                  setSelectedPatient(patient);
                }}
                className={`p-4 rounded-xl cursor-pointer transition duration-200 ease-in-out transform hover:bg-purple-100 hover:shadow-md ${
                  selectedPatient?.id === patient?.id
                    ? "bg-purple-200"
                    : "bg-gray-50"
                }`}
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {patient?.name}
                </h3>
                <p className="text-sm text-gray-600">Token #{patient?.token}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Details Pane */}
        <div className="flex-1 p-8">
          {selectedPatient ? (
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-8">
              <div className="flex items-center gap-6 mb-8">
                <img
                  src={selectedPatient.profilePicture}
                  alt={selectedPatient.name}
                  className="w-28 h-28 rounded-full border-4 border-purple-300 object-cover shadow-lg"
                />
                <div>
                  <h2 className="text-3xl font-semibold text-purple-700">
                    {selectedPatient.name}
                  </h2>
                  <p className="text-lg text-gray-600">
                    <strong>Token:</strong> #{selectedPatient.token}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 mb-8">
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
                  <strong>Emergency Contact:</strong>{" "}
                  {selectedPatient.emergencyContact}
                </p>
                <p>
                  <strong>Emergency Number:</strong>{" "}
                  {selectedPatient.emergencyNumber}
                </p>
                <p>
                  <strong>Father's Name:</strong> {selectedPatient.fatherName}
                </p>
                <p>
                  <strong>Status:</strong> {selectedPatient.status}
                </p>
                <p className="col-span-2">
                  <strong>Address:</strong> {selectedPatient.address}
                </p>
                <p>
                  <strong>Clinic ID:</strong> {selectedPatient.clinicId}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {moment(selectedPatient.createdAt?.toDate()).format(
                    "DD MMMM YYYY HH:mm:ss"
                  )}
                </p>
              </div>

              {/* Added By Information */}
              <div className="border-t-2 pt-6 mt-6 text-gray-700">
                <h3 className="text-2xl font-semibold text-purple-700">
                  Added By
                </h3>
                <div className="mt-4">
                  {selectedPatient.addedBy ? (
                    <>
                      <p>
                        <strong>Name:</strong> {selectedPatient.addedBy.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedPatient.addedBy.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {selectedPatient.addedBy.role}
                      </p>
                      <p>
                        <strong>UID:</strong> {selectedPatient.addedBy.uid}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      Loading "Added By" information...
                    </p>
                  )}
                </div>
              </div>

              {/* Prescription Information */}
              <div className="border-t-2 pt-6 mt-6 text-gray-700">
                <h3 className="text-2xl font-semibold text-purple-700">
                  Prescriptions
                </h3>
                <div className="mt-4">
                  {selectedPatient.prescription ? (
                    <>
                      <p>{selectedPatient.prescription[0].prescriptionText}</p>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      No prescriptions found for this patient.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-20">
              Select a patient to view details.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientsPage;
