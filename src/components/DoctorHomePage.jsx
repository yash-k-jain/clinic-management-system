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
import TokenContainer from "./TokenContainer";
import { newTokenCreation } from "../lib/newTokenCreation";
import log from "../../logger";

const DoctorHomePage = () => {
  const { user } = useAuth();
  const [currentToken, setCurrentToken] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tokens"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "current")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        if (snapshot.empty) {
          setCurrentToken(null);
          return;
        }

        const tokenDoc = snapshot.docs[0];
        const tokenData = tokenDoc.data();

        const patientSnap = await getDoc(
          doc(db, "patients", tokenData.patientId)
        );

        setCurrentToken({
          id: tokenDoc.id,
          ...tokenData,
          patient: {
            id: patientSnap.id,
            ...patientSnap.data(),
          },
        });
      } catch (err) {
        log.error("Error fetching current token:", err);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // =========================
  // SAVE PRESCRIPTION
  // =========================
  const handleSavePrescription = async () => {
    if (!prescriptionText.trim()) {
      alert("Write prescription first");
      return;
    }

    try {
      await addDoc(collection(db, "prescriptions"), {
        patientId: currentToken.patientId,
        doctorId: user.uid,
        clinicId: user.clinicId,
        token: currentToken.token,
        prescriptionText,
        createdAt: new Date(),
      });

      setPrescriptionSaved(true);
      alert("Saved");
    } catch (err) {
      log.error(err);
      alert("Error saving");
    }
  };

  // =========================
  // NEXT TOKEN
  // =========================
  const handleNextToken = async () => {
    if (!currentToken) return;

    try {
      // mark token done
      await updateDoc(doc(db, "tokens", currentToken.id), {
        status: "done",
      });

      // mark patient done
      await updateDoc(doc(db, "patients", currentToken.patientId), {
        status: "done",
      });

      // 🔥 create next token
      await newTokenCreation(user);

      // reset UI
      setPrescriptionText("");
      setPrescriptionSaved(false);
    } catch (err) {
      log.error(err);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white to-blue-50 min-h-screen">
      <div className="bg-white shadow rounded-xl p-6 mb-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Now Operating Token
        </h2>

        <TokenContainer currentToken={currentToken} />

        {currentToken && (
          <div className="mt-6">
            <textarea
              rows="4"
              className="w-full border rounded p-2"
              placeholder="Write prescription..."
              value={prescriptionText}
              onChange={(e) => {
                setPrescriptionText(e.target.value);
                setPrescriptionSaved(false);
              }}
            />

            <button
              onClick={handleSavePrescription}
              disabled={prescriptionSaved}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Save Prescription
            </button>
          </div>
        )}

        <button
          onClick={handleNextToken}
          disabled={!currentToken || !prescriptionSaved}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400 cursor-pointer"
        >
          Next Token
        </button>
      </div>
    </div>
  );
};

export default DoctorHomePage;