import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { newTokenCreation } from "../lib/newTokenCreation";
import TokenContainer from "./TokenContainer";
// import getCurrentTokenWithPatient from "../lib/getCurrentTokenWithPatient ";
import log from "../../logger"; // Assume you have a logger utility

const DoctorHomePage = () => {
  const { user } = useAuth();
  const [currentToken, setCurrentToken] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      log.info("No user logged in, skipping token listener");
      return;
    }

    const tokenQuery = query(
      collection(db, "tokens"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "current")
    );

    const unsubscribe = onSnapshot(tokenQuery, async (tokenSnapshot) => {
      try {
        if (!tokenSnapshot.empty) {
          const tokenDoc = tokenSnapshot.docs[0];
          const current = tokenDoc.data();
          log.info("Current token found");

          const currentTokenPatientSnap = await getDoc(
            doc(db, "patients", current.patientId)
          );

          const currentPatient = currentTokenPatientSnap.data();
          log.info("Current patient data fetched");

          setCurrentToken({
            id: tokenDoc.id, // Include the document ID
            ...current,
            patient: currentPatient,
          });
        } else {
          log.info("No current token found, creating new token");
          const newTokenData = await newTokenCreation(user);
          log.info("New token created");
          setCurrentToken(newTokenData);
        }
      } catch (error) {
        log.error("Error in token listener", error);
      }
    });

    return () => {
      log.info("Unsubscribing token listener");
      unsubscribe();
    };
  }, [user]);

  const handleSavePrescription = async () => {
    if (!prescriptionText.trim()) {
      log.warn("Attempted to save empty prescription");
      alert("Please write a prescription before saving.");
      return;
    }

    try {
      log.info("Saving prescription");

      await addDoc(collection(db, "prescriptions"), {
        patientId: currentToken.patientId || currentToken.patient?.uid,
        doctorId: user.uid,
        clinicId: user.clinicId,
        token: currentToken.token,
        prescriptionText,
        createdAt: new Date(),
      });

      log.info("Prescription saved successfully");
      alert("Prescription saved successfully.");
      setPrescriptionSaved(true);
    } catch (error) {
      log.error("Error saving prescription", error);
      alert("Failed to save prescription. Please try again.");
    }
  };

  const handleNextToken = async () => {
    if (!currentToken) {
      log.warn("Next token requested but currentToken is null");
      return;
    }

    try {
      log.info("Moving to next token");

      setPrescriptionText("");
      setPrescriptionSaved(false);

      await updateDoc(doc(db, "tokens", currentToken.id), {
        status: "done",
      });

      await updateDoc(doc(db, "patients", currentToken.patientId), {
        status: "done",
      });

      log.info("Current token and patient marked as done");
      // The onSnapshot listener will handle new token creation or updates
    } catch (error) {
      log.error("Error moving to next token", error);
      alert("Failed to move to next token. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white to-blue-50 min-h-screen">
      <div className="bg-white shadow rounded-xl p-6 mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Now Operating Token
        </h2>

        <TokenContainer currentToken={currentToken} />

        {/* Prescription Box */}
        {currentToken && (
          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-1">
              Prescription
            </label>
            <textarea
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Write prescription here..."
              value={prescriptionText}
              onChange={(e) => {
                setPrescriptionText(e.target.value);
                setPrescriptionSaved(false);
                log.debug("Prescription text changed", {
                  textLength: e.target.value.length,
                });
              }}
            />
            <button
              onClick={handleSavePrescription}
              disabled={prescriptionSaved}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save Prescription
            </button>
          </div>
        )}

        <button
          onClick={handleNextToken}
          disabled={currentToken && !prescriptionSaved}
          className={`mt-6 font-semibold px-6 py-2 rounded-lg transition cursor-pointer ${
            currentToken && !prescriptionSaved
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Next Token
        </button>
      </div>
    </div>
  );
};

export default DoctorHomePage;
