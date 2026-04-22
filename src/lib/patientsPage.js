import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const fetchAllPatients = async (clinicId) => {
  try {
    if (!clinicId) throw new Error("clinicId is required");

    // ✅ Fetch patients
    const patientQuery = query(
      collection(db, "patients"),
      where("clinicId", "==", clinicId),
      orderBy("createdAt", "asc")
    );

    // ✅ Fetch tokens
    const tokenQuery = query(
      collection(db, "tokens"),
      where("clinicId", "==", clinicId)
    );

    const [patientSnap, tokenSnap] = await Promise.all([
      getDocs(patientQuery),
      getDocs(tokenQuery),
    ]);

    // ✅ Create token map
    const tokenMap = {};
    tokenSnap.docs.forEach((docSnap) => {
      const t = docSnap.data();
      tokenMap[t.patientId] = {
        token: t.token,
        status: t.status,
      };
    });

    // ✅ Merge (SIMPLE)
    const patientsData = patientSnap.docs.map((docSnap) => {
      const patient = docSnap.data();
      const token = tokenMap[docSnap.id];

      return {
        id: docSnap.id,
        ...patient,
        token: token?.token || "--",
        status: token?.status || patient.status || "unknown",
      };
    });

    return patientsData;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const fetchAddedUser = async (addedById) => {
  try {
    if (!addedById) {
      throw new Error("addedById is required");
    }

    console.log("Fetching added user for addedById:", addedById);

    const addedUserSnap = await getDoc(doc(db, "users", addedById));

    if (!addedUserSnap.exists()) {
      throw new Error("Added user not found");
    }

    const addedUserData = addedUserSnap.data();
    return addedUserData;
  } catch (error) {
    console.error("Error fetching added user:", error);
    throw new Error("Failed to fetch added user");
  }
};

export const fetchPrescriptions = async (patientId, doctorId, clinicId) => {
  try {
    console.log(
      "Fetching medications for patientId:",
      patientId,
      doctorId,
      clinicId
    );
    if (!patientId || !doctorId || !clinicId) {
      throw new Error("patientId, doctorId, clinicId is required");
    }

    console.log("Fetching medications for patientId:", patientId);

    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      where("doctorId", "==", doctorId),
      where("clinicId", "==", clinicId),
      orderBy("createdAt", "asc")
    );

    const snapShot = await getDocs(q);

    if (snapShot.empty) {
      throw new Error("No medications found");
    }

    const prescriptionData = snapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return prescriptionData;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw new Error("Failed to fetch prescriptions");
  }
};
