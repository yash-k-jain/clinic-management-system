import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const generateToken = async (clinicId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    // 1. Get latest token for today
    const q = query(
      collection(db, "tokens"),
      where("clinicId", "==", clinicId),
      where("createdAt", ">=", startOfDay),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 1; // first token of the day
    }

    const lastTokenData = snapshot.docs[0].data();
    const lastToken = lastTokenData.token || 0;

    return lastToken + 1;
  } catch (error) {
    console.error("Error generating token:", error);
    return 1;
  }
};