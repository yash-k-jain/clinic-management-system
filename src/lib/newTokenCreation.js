import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const newTokenCreation = async (user) => {
  try {
    // 1. Check if a current token already exists
    const currentTokenQuery = query(
      collection(db, "tokens"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "current"),
      limit(1)
    );
    const currentTokenSnap = await getDocs(currentTokenQuery);
    if (!currentTokenSnap.empty) {
      return null; // A current token already exists, so do nothing
    }

    // 2. Get the first waiting patient (lowest token)
    const waitingQuery = query(
      collection(db, "patients"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "waiting"),
      where("paid", "==", true),
      orderBy("token", "asc"),
      limit(1)
    );
    const waitingSnap = await getDocs(waitingQuery);
    if (waitingSnap.empty) return null;

    const waitingPatientDoc = waitingSnap.docs[0];
    const waitingPatient = waitingPatientDoc.data();

    // 3. Create a new token and set it to current
    const tokenRef = await addDoc(collection(db, "tokens"), {
      token: waitingPatient.token,
      patientId: waitingPatientDoc.id,
      status: "current",
      clinicId: waitingPatient.clinicId,
      createdAt: new Date(),
    });

    return {
      id: tokenRef.id,
      token: waitingPatient.token,
      patientId: waitingPatientDoc.id,
      status: "current",
      clinicId: waitingPatient.clinicId,
      patient: waitingPatient,
    };
  } catch (error) {
    console.error("Error creating new token:", error);
    return null;
  }
};
