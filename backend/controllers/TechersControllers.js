const axios = require("axios");
const admin = require("../config/firebaseAdmin");
require("dotenv").config(); // Ensure environment variables are loaded

const db = admin.firestore();

const TeacherController = async (req, res) => {
  const email = req.params.email;

  try {
    // Get user's school
    const snapshot = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: "User info not found in Firestore" });
    }

    const userData = snapshot.data();
    const school = userData.school;

    if (!school) {
      console.error("school not found");
      return res.status(404).json({ error: "school not found" });
    }

    // Get all teacher document IDs
    const techSnapshot = await db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .get();

    const teacherIds = techSnapshot.docs.map(doc => doc.id);

    if (teacherIds.length === 0) {
      return res.status(404).json({ error: "No teachers found" });
    }

    // Fetch userinfo for each teacher
    const teacherData = await Promise.all(
      teacherIds.map(async (id) => {
        const docRef = db.collection("Users").doc(id).collection("userinfo").doc("userinfo");
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          return {
            id,
            ...docSnap.data(),
          };
        } else {
          return null;
        }
      })
    );

    // Filter out any nulls (in case some userinfo docs are missing)
    const filteredTeacherData = teacherData.filter(t => t !== null);

    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers: filteredTeacherData,
      noOfTechers: teacherIds.length,
    });

  } catch (e) {
    console.error("Error in fetching teachers:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { TeacherController };
