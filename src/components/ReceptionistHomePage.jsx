import React, { useEffect } from "react";
import TokenContainer from "./TokenContainer";
import log from "../../logger"; // Assume you have this logger utility

const ReceptionistHomePage = ({ currentToken, waitingPatients }) => {
  useEffect(() => {
    log.info("ReceptionistHomePage mounted");
  }, []);

  useEffect(() => {
    log.info("Current token updated in ReceptionistHomePage");
  }, [currentToken]);

  useEffect(() => {
    log.info("Waiting patients updated");
  }, [waitingPatients]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Current Token Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Currently Operating Token
        </h2>

        <TokenContainer currentToken={currentToken} />
      </div>

      {/* Operated Patients List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Waiting Patients
        </h2>
        {waitingPatients?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Token</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">DOB</th>
                  <th className="p-3">Father's Name</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {waitingPatients.map((patient, idx) => {
                  log.debug(`Rendering patient row #${idx}`, {
                    token: patient.token,
                    name: patient.name,
                  });
                  return (
                    <tr key={idx}>
                      <td className="p-3">{patient.token}</td>
                      <td className="p-3">{patient.name}</td>
                      <td className="p-3">{patient.contactNumber}</td>
                      <td className="p-3">{patient.dob}</td>
                      <td className="p-3">{patient.fatherName}</td>
                      <td className="p-3">{patient.address}</td>
                      <td className="p-3">{patient.gender}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {log.warn("No waiting patients to show")}
            <p className="text-gray-500">No waiting patients to show.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceptionistHomePage;
