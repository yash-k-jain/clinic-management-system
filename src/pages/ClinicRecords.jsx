import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/Loading";
import NotLoggedIn from "../components/NotLoggedIn";
import log from "../../logger"; // ✅ import logger

const ClinicRecords = () => {
  const { user, loading } = useAuth();
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    const fetchAllPatients = async () => {
      if (!user) {
        log.warn("No user found");
        return;
      }

      try {
        const q = query(
          collection(db, "patients"),
          where("clinicId", "==", user.clinicId),
          where("addedBy", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        log.info("Fetched patient records");

        setAllPatients(records);
      } catch (error) {
        log.error("Failed to fetch patient records:", error);
      }
    };

    fetchAllPatients();
  }, [user]);

  if (loading) {
    log.debug("Auth loading...");
    return <LoadingSpinner />;
  }

  if (!user) {
    log.warn("User not logged in");
    return <NotLoggedIn />;
  }

  const groupedByDate = allPatients.reduce((acc, patient) => {
    const date = new Date(patient.createdAt.seconds * 1000);
    const dateKey = date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(patient);

    return acc;
  }, {});

  log.debug("Grouped patients by date");

  return (
    <>
      <Navbar user={user} />
      <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
        <div className="w-full mx-auto bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
            Clinic Patient Records
          </h1>

          {Object.keys(groupedByDate).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedByDate).map(([date, patients]) => (
                <div key={date}>
                  <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-1">
                    {date}
                  </h2>
                  <div className="overflow-x-auto shadow border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-blue-100 text-gray-800">
                        <tr>
                          <th className="p-3 text-left">Avatar</th>
                          <th className="p-3 text-left">Token</th>
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Phone</th>
                          <th className="p-3 text-left">DOB</th>
                          <th className="p-3 text-left">Gender</th>
                          <th className="p-3 text-left">Father's Name</th>
                          <th className="p-3 text-left">Address</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Created Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {patients.map((patient) => (
                          <tr
                            key={patient.id}
                            className="hover:bg-blue-50 transition"
                          >
                            <td className="p-3">
                              {patient.profilePicture ? (
                                <img
                                  src={patient.profilePicture}
                                  alt="avatar"
                                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-sm">
                                  {patient.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                              )}
                            </td>
                            <td className="p-3">{patient.token}</td>
                            <td className="p-3">{patient.name}</td>
                            <td className="p-3">{patient.contactNumber}</td>
                            <td className="p-3">{patient.dob}</td>
                            <td className="p-3">{patient.gender}</td>
                            <td className="p-3">{patient.fatherName}</td>
                            <td className="p-3">{patient.address}</td>
                            <td className="p-3 capitalize">
                              <span
                                className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                                  patient.status === "done"
                                    ? "bg-green-500"
                                    : patient.status === "current"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                                }`}
                              >
                                {patient.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {new Date(
                                patient.createdAt.seconds * 1000
                              ).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-10">
              No records found in this clinic.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ClinicRecords;
