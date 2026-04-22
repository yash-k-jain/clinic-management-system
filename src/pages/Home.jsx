import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { db } from "../services/firebase";
import NotLoggedIn from "../components/NotLoggedIn";
import LoadingSpinner from "../components/Loading";
import {
  collection,
  query,
  where,
  orderBy,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import ReceptionistHomePage from "../components/ReceptionistHomePage";
import DoctorHomePage from "../components/DoctorHomePage";
import { newTokenCreation } from "../lib/newTokenCreation";
import log from "../../logger";

const Home = () => {
  const { user, loading } = useAuth();

  const [currentToken, setCurrentToken] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);

  useEffect(() => {
    if (!user) return;

    // 🔥 ensure one current token exists
    newTokenCreation(user);

    // ======================
    // CURRENT TOKEN
    // ======================
    const currentQuery = query(
      collection(db, "tokens"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "current")
    );

    const unsubscribeCurrent = onSnapshot(currentQuery, async (snap) => {
      if (snap.empty) {
        setCurrentToken(null);
        return;
      }

      const docSnap = snap.docs[0];
      const data = docSnap.data();

      const patientSnap = await getDoc(
        doc(db, "patients", data.patientId)
      );

      setCurrentToken({
        id: docSnap.id,
        ...data,
        patient: {
          id: patientSnap.id,
          ...patientSnap.data(),
        },
      });
    });

    // ======================
    // WAITING PATIENTS
    // ======================
    const waitingQuery = query(
      collection(db, "tokens"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "waiting"),
      where("paid", "==", true),
      orderBy("token", "asc")
    );

    const unsubscribeWaiting = onSnapshot(waitingQuery, async (snap) => {
      const list = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();

          const patientSnap = await getDoc(
            doc(db, "patients", data.patientId)
          );

          const patient = patientSnap.data();

          return {
            id: docSnap.id,
            token: data.token,
            name: patient?.name || "-",
            contactNumber: patient?.contactNumber || "-",
            dob: patient?.dob || "-",
            fatherName: patient?.fatherName || "-",
            address: patient?.address || "-",
            gender: patient?.gender || "-",
          };
        })
      );

      setWaitingPatients(list);
    });

    return () => {
      unsubscribeCurrent();
      unsubscribeWaiting();
    };
  }, [user]);

  // ======================
  // UI
  // ======================
  if (loading) return <LoadingSpinner />;
  if (!user) return <NotLoggedIn />;

  return (
    <>
      <Navbar user={user} />

      {user.role === "receptionist" && (
        <ReceptionistHomePage
          currentToken={currentToken}
          waitingPatients={waitingPatients}
        />
      )}

      {user.role === "doctor" && <DoctorHomePage user={user} />}
    </>
  );
};

export default Home;