// src/pages/BillingPage.js
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Loading";
import { newTokenCreation } from "../lib/newTokenCreation";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import log from "../../logger"; // ✅ Logger imported here
import NotLoggedIn from "../components/NotLoggedIn";

const BillingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [showBill, setShowBill] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  useEffect(() => {
    const fetchUnpaidBills = async () => {
      if (!user) return;

      log.info("Fetching unpaid bills for clinicId");

      try {
        const billsQuery = query(
          collection(db, "bills"),
          where("clinicId", "==", user.clinicId),
          where("status", "==", "unpaid"),
          orderBy("createdAt", "desc")
        );

        const billsSnap = await getDocs(billsQuery);

        const enrichedBills = await Promise.all(
          billsSnap.docs.map(async (billDoc) => {
            const billData = billDoc.data();
            const tokenRef = doc(db, "tokens", billData.tokenId);
            const clinicRef = doc(db, "clinic", user.clinicId);
            const patientRef = doc(db, "patients", billData.patientId);

            try {
              const [tokenSnap, clinicSnap, patientSnap] = await Promise.all([
                getDoc(tokenRef),
                getDoc(clinicRef),
                getDoc(patientRef),
              ]);

              const tokenData = tokenSnap.data();
              const clinicData = clinicSnap.data();
              const patientData = {
                id: patientSnap.id,
                ...patientSnap.data(),
              };

              log.debug("Fetched Token & clinic data", {
                tokenData,
                clinicData,
              });

              if (tokenData?.status === "waiting") {
                return {
                  id: billDoc.id,
                  ...billData,
                  tokenData: tokenData,
                  clinic: clinicData,
                  patient: patientData,
                };
              }
            } catch (err) {
              log.error("Error enriching bill data:", err);
            }

            return null;
          })
        );

        const filteredBills = enrichedBills.filter(Boolean);
        log.info(`Unpaid bills fetched: ${filteredBills.length}`);
        setBills(filteredBills);
      } catch (error) {
        log.error("Error fetching unpaid bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidBills();
  }, [user]);

  const markAsPaid = (billId) => {
    const selectedBill = bills.find((bill) => bill.id === billId);
    setCurrentBill(selectedBill);
    setShowBill(true);
    log.info("Selected bill for payment");
  };

  const handleCloseOrPrint = async (actionType) => {
    if (!currentBill) return;

    try {
      log.info("Marking bill as paid");

      await updateDoc(doc(db, "bills", currentBill.id), {
        status: "paid",
      });

      setBills((prev) => prev.filter((bill) => bill.id !== currentBill.id));

      await updateDoc(doc(db, "tokens", currentBill.tokenId), {
        paid: true,
      });

      await newTokenCreation(user);
      log.info("Token created and bill marked as paid.");

      if (actionType === "print") {
        log.info("Printing bill...");
        window.print();
      }
    } catch (error) {
      log.error("Error processing payment:", error);
    } finally {
      setCurrentBill(null);
      setShowBill(false);
      navigate("/");
    }
  };

  const amountInWords = (num) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if ((num = num.toString()).length > 9) return "overflow";
    const n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{3})$/);
    if (!n) return;
    let str = "";
    str +=
      n[1] !== "00"
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
        : "";
    str +=
      n[2] !== "00"
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
        : "";
    str +=
      n[3] !== "00"
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
        : "";
    str +=
      n[4] !== "000"
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " "
        : "";
    return str.trim() + " Only";
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "--";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getServiceCharge = (clinic, serviceName) => {
    if (!clinic?.services) return 0;
    const normalizedServices = Object.fromEntries(
      Object.entries(clinic.services).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ])
    );
    return normalizedServices[serviceName.toLowerCase()] || 0;
  };

  const getTotalAmount = (bill) => {
    const serviceNames = Object.keys(bill?.services || {});
    return serviceNames.reduce((total, serviceName) => {
      const price = parseInt(bill.clinic?.services?.[serviceName]) || 0;
      return total + price;
    }, 0);
  };

  if (loading) return <LoadingSpinner />;
  if (!user || user.role !== "receptionist") return <NotLoggedIn />;

  return (
    <>
      <Navbar user={user} />
      <div className="p-6 min-h-screen bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
            Unpaid Billing Records
          </h1>

          {bills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200 text-sm">
                <thead className="bg-blue-100 text-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Token</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Services</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="hover:bg-blue-50 transition duration-200"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {bill.patient?.name}
                      </td>
                      <td className="px-4 py-3">#{bill.tokenData.token}</td>
                      <td className="px-4 py-3">
                        {bill.patient?.contactNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">
                        ₹{getTotalAmount(bill)}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {Object.keys(bill.services || {}).join(", ")}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(
                          bill.createdAt?.seconds * 1000
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => markAsPaid(bill.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          Mark as Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg mt-10">
              No unpaid bills found.
            </p>
          )}
        </div>

        {/* BILL MODAL */}
        {showBill && currentBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 printable">
            <div className="bg-white rounded-lg shadow-lg w-[1000px] p-8">
              <div className="text-center mb-4">
                <img
                  src="/clinic-logo.png"
                  alt="Clinic Logo"
                  className="mx-auto w-24 h-24"
                />
                <h2 className="text-2xl font-bold">
                  {currentBill?.clinic?.name}
                </h2>
                <p className="text-sm">
                  {currentBill?.clinic?.address}
                  <br />
                  {currentBill?.clinic?.phone || "Phone Unavailable"} |{" "}
                  {currentBill?.clinic?.email} | {currentBill?.clinic?.website}
                </p>
              </div>

              <div className="text-sm grid grid-cols-2 gap-4 my-4">
                <p>
                  <strong>Name/Contact:</strong> {currentBill.patient?.name}/
                  {currentBill.patient?.contactNumber}
                </p>
                <p>
                  <strong>ID:</strong> {currentBill.patient?.id || "100007"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    currentBill.createdAt.seconds * 1000
                  ).toLocaleString()}
                </p>
                <p>
                  <strong>Bill #:</strong> {currentBill.token}
                </p>
                <p>
                  <strong>Age/Sex:</strong>{" "}
                  {calculateAge(currentBill.patient?.dob)} /{" "}
                  {currentBill.patient?.gender || "--"}
                </p>
                <p>
                  <strong>Dr/Referrer:</strong> Dr. Aryan Sagar
                </p>
              </div>

              <table className="w-full text-sm border mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">Sl.No</th>
                    <th className="border px-2 py-1">Particulars</th>
                    <th className="border px-2 py-1">Charges</th>
                    <th className="border px-2 py-1">Quantity</th>
                    <th className="border px-2 py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(currentBill.services || {}).map(
                    (service, idx) => {
                      const price = getServiceCharge(
                        currentBill.clinic,
                        service
                      );
                      return (
                        <tr key={idx}>
                          <td className="border px-2 py-1 text-center">
                            {idx + 1}
                          </td>
                          <td className="border px-2 py-1">{service}</td>
                          <td className="border px-2 py-1 text-right">
                            ₹{price}
                          </td>
                          <td className="border px-2 py-1 text-center">1</td>
                          <td className="border px-2 py-1 text-right">
                            ₹{price}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              <p className="font-semibold mb-1">
                {amountInWords(getTotalAmount(currentBill))}
              </p>
              <p className="font-semibold mb-4">
                Total Billed: ₹{getTotalAmount(currentBill)} | Payable: ₹
                {getTotalAmount(currentBill)}
              </p>

              <div className="flex justify-between items-end text-xs mt-8">
                <div>
                  {new Date().toLocaleString()} - Received Rs.{" "}
                  {getTotalAmount(currentBill)} (by Cash) as Payment
                </div>
                <div className="text-right">
                  Authorized Signatory
                  <br />
                  <strong>Aryan Sagar</strong>
                </div>
              </div>

              <p className="text-center text-xs mt-6 text-gray-400">
                Powered by {currentBill?.clinic?.name} -{" "}
                {currentBill?.clinic?.website || currentBill?.clinic?.email}
              </p>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => handleCloseOrPrint("print")}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Print
                </button>
                <button
                  onClick={() => handleCloseOrPrint("close")}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BillingPage;
