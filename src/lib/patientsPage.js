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
    // Check if clinicId is provided
    if (!clinicId) {
      throw new Error("clinicId is required");
    }

    console.log("Fetching patients for clinicId:", clinicId);

    // Construct Firestore query
    const q = query(
      collection(db, "patients"),
      where("clinicId", "==", clinicId),
      where("paid", "==", true),
      orderBy("createdAt", "asc")
    );

    // Get documents
    const snapShot = await getDocs(q);

    if (snapShot.empty) {
      throw new Error("No patients found");
    }

    // Map over documents and extract data
    const patientsData = snapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return patientsData;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw new Error("Failed to fetch patients");
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
