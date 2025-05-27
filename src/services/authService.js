import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export const registerUser = async (
  email,
  name,
  password,
  role = "receptionist"
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, {
      displayName: name,
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      name,
      role,
      uid: userCredential.user.uid,
      clinicId: `clinic_${Date.now()}`,
      createdAt: serverTimestamp(),
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, message: "User logged in successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
