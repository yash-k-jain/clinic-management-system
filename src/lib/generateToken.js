import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export const generateToken = async (clinicId) => {
  try {
    // Get the last added patient for the clinic
    const q = query(
      collection(db, "patients"),
      where("clinicId", "==", clinicId),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // No patients yet — first token
      return 1;
    }

    const lastPatient = snapshot.docs[0].data();
    const lastToken = lastPatient.token || 0;
    const createdAt = lastPatient.createdAt.toDate(); // Convert Firestore Timestamp to JS Date

    const today = new Date();
    const isYesterdayOrBefore = createdAt.toDateString() !== today.toDateString();

    return isYesterdayOrBefore ? 1 : lastToken + 1;

  } catch (error) {
    console.error("Error generating token:", error);
    return 1; // fallback
  }
};
