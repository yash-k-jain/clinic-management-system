import React from "react";
import TokenContainer from "./TokenContainer";

const ReceptionistHomePage = ({ currentToken, waitingPatients }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* CURRENT TOKEN */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Currently Operating Token
        </h2>

        <TokenContainer currentToken={currentToken} />
      </div>

      {/* WAITING LIST */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Waiting Patients
        </h2>

        {waitingPatients.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Token</th>
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">DOB</th>
                <th className="p-2">Father</th>
                <th className="p-2">Address</th>
                <th className="p-2">Gender</th>
              </tr>
            </thead>

            <tbody>
              {waitingPatients.map((p) => (
                <tr key={p.id}>
                  <td className="p-2">{p.token}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.contactNumber}</td>
                  <td className="p-2">{p.dob}</td>
                  <td className="p-2">{p.fatherName}</td>
                  <td className="p-2">{p.address}</td>
                  <td className="p-2">{p.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No waiting patients</p>
        )}
      </div>
    </div>
  );
};

export default ReceptionistHomePage;