import React from "react";

const TokenContainer = ({ currentToken }) => {
  return (
    <>
      {currentToken && currentToken.patient ? (
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-blue-50 p-6 rounded-xl shadow-inner">
          <div className="w-32 h-32 flex-shrink-0">
            {currentToken.patient.profilePicture ? (
              <img
                src={currentToken.patient.profilePicture}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-blue-200 shadow-md"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-3xl">
                {currentToken.patient.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-gray-800 w-full">
            <div>
              <p className="text-sm font-extrabold text-black-500">
                Token Number
              </p>
              <p className="text-xl font-bold text-blue-700">
                #{currentToken.token}
              </p>
            </div>
            <div>
              <p className="text-sm text-black-500 font-extrabold">Name</p>
              <p className="text-lg">{currentToken.patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-black-500 font-extrabold">Phone</p>
              <p>{currentToken.patient.contactNumber}</p>
            </div>
            <div>
              <p className="text-sm text-black-500 font-extrabold">DOB</p>
              <p>{currentToken.patient.dob}</p>
            </div>
            <div>
              <p className="text-sm text-black-500 font-extrabold">Gender</p>
              <p>{currentToken.patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-black-500 font-extrabold">
                Father's Name
              </p>
              <p>{currentToken.patient.fatherName}</p>
            </div>
            <div>
              <p className="text-sm text-black-500 font-extrabold">
                Operated Date
              </p>
              <p>
                {new Date(
                  currentToken.patient.createdAt?.seconds * 1000
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-extrabold mb-2">
                Services
              </p>
              <div className="flex flex-wrap gap-2">
                {currentToken.patient.services?.map((service) => (
                  <span
                    key={service}
                    className="bg-purple-200 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-black-500 font-extrabold">Address</p>
              <p>{currentToken.patient.address}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-black-600">No current token assigned.</p>
      )}
    </>
  );
};

export default TokenContainer;
