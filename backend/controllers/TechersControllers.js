const axios = require("axios");
const admin = require("../config/firebaseAdmin");
require("dotenv").config(); // Ensure environment variables are loaded

const db = admin.firestore();

const TeacherController = async (req, res) => {
  const email = req.params.email;

  try {
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
    if(!school){
      console.error("school not found");
      res.status(404).json({error:"school not found"})
    }
    const techSnapshot = await db
      .collection("SchoolUsers")
      .doc(school)
      .collection("Users")
      .get();

    const teachers = techSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
    });

  } catch (e) {
    console.error("Error in fetching teachers:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
};


module.exports = { TeacherController };
