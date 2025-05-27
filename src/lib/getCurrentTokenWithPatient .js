import {
  collection,
  limit,
  orderBy,
  query,
  where,
  getDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "../services/firebase";

const getCurrentTokenWithPatient = async (clinicId) => {
  const tokenQuery = query(
    collection(db, "tokens"),
    where("status", "==", "current"),
    where("clinicId", "==", clinicId),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const tokenSnap = await getDocs(tokenQuery);
  const docSnap = tokenSnap.docs[0];

  if (!docSnap) return null;

  const tokenData = docSnap.data();
  const patientDoc = await getDoc(doc(db, "patients", tokenData.patientId));
  return {
    ...tokenData,
    id: docSnap.id,
    patient: patientDoc.data(),
  };
};

export default getCurrentTokenWithPatient;
