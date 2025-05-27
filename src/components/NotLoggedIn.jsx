import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotLoggedIn = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login'); // or wherever your login route is
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 text-center px-4">
      <div className="bg-white shadow-xl p-10 rounded-xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Hold up! 🚫</h1>
        <p className="text-gray-700 text-lg mb-6">
          You’re not logged in. Please log in to access this page.
        </p>
        <button
          onClick={handleLoginRedirect}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-300"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default NotLoggedIn;
