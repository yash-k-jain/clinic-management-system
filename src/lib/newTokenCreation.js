import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
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
      return null; // already a current token
    }

    // 2. Get next waiting + paid token (lowest number)
    const waitingQuery = query(
      collection(db, "tokens"),
      where("clinicId", "==", user.clinicId),
      where("status", "==", "waiting"),
      where("paid", "==", true),
      orderBy("token", "asc"),
      limit(1)
    );

    const waitingSnap = await getDocs(waitingQuery);

    if (waitingSnap.empty) {
      return null; // no eligible tokens
    }

    const waitingDoc = waitingSnap.docs[0];
    const waitingData = waitingDoc.data();

    // 3. Update this token → make it current
    await updateDoc(doc(db, "tokens", waitingDoc.id), {
      status: "current",
    });

    return {
      id: waitingDoc.id,
      ...waitingData,
      status: "current",
    };
  } catch (error) {
    console.error("Error creating new token:", error);
    return null;
  }
};