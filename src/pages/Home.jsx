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
  getDocs,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import ReceptionistHomePage from "../components/ReceptionistHomePage";
import DoctorHomePage from "../components/DoctorHomePage";
import log from "../../logger"; // <-- import logger

const Home = () => {
  const { user, loading } = useAuth();

  const [currentToken, setCurrentToken] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!user) {
        log.warn("No user found in Home component, aborting fetchTokens.");
        return;
      }

      try {
        // Subscribe to CURRENT token changes
        const tokenQuery = query(
          collection(db, "tokens"),
          where("clinicId", "==", user.clinicId),
          where("status", "==", "current")
        );

        log.info("Setting up listener for current token");
        onSnapshot(tokenQuery, async (tokenSnapshot) => {
          const tokenDoc = tokenSnapshot.docs[0];
          if (tokenDoc) {
            const current = tokenDoc.data();
            const currentTokenPatient = await getDoc(
              doc(db, "patients", current.patientId)
            );
            const currentPatient = currentTokenPatient.data();

            const currentToken = {
              ...current,
              patient: currentPatient,
            };

            log.debug("Current token updated");
            setCurrentToken(currentToken);
          } else {
            log.info("No current token found");
            setCurrentToken(null);
          }
        });

        // Subscribe to waiting patients
        const patientsQuery = query(
          collection(db, "patients"),
          where("clinicId", "==", user.clinicId),
          where("status", "==", "waiting"),
          where("addedBy", "==", user.uid),
          where("paid", "==", true),
          orderBy("createdAt", "desc")
        );

        onSnapshot(patientsQuery, (patientSnapshot) => {
          log.debug("Waiting patients snapshot updated", {
            count: patientSnapshot.docs.length,
          });
          const patients = patientSnapshot.docs.map((doc) => doc.data());
          setWaitingPatients(patients);
        });
      } catch (error) {
        log.error(
          "Error fetching tokens or patients in Home component:",
          error
        );
      }
    };

    fetchTokens();
  }, [user]);

  if (loading) {
    log.debug("Auth loading in Home component...");
    return <LoadingSpinner />;
  }

  if (!user) {
    log.warn("User not logged in in Home component.");
    return <NotLoggedIn />;
  }

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
