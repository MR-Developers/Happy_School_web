/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request, Response} from "express";
import admin from "../../config/firebase";
const db = admin.firestore();

export const counselorchallengecontroller = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {email} = req.params;

  if (!email) {
    res.status(400).json({error: "Email is required"});
    return;
  }

  try {
    const userInfoSnap = await db
      .collection("Users")
      .doc(email)
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (!userInfoSnap.exists) {
      res.status(404).json({error: "User info not found in Firestore"});
      return;
    }

    const userData = userInfoSnap.data() as {
      school?: string;
      schools?: string[];
    };
    const schools =
      userData?.schools || (userData?.school ? [userData.school] : []);

    if (!schools || schools.length === 0) {
      res.status(404).json({error: "No schools found for this user"});
      return;
    }

    const promises = schools.map(async (school) => {
      const docRef = db
        .collection("Content")
        .doc("Content")
        .collection(school)
        .doc(school)
        .collection("ChallengeNames")
        .doc("ChallengeNames");

      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error(`ChallengeNames not found for school: ${school}`);
      }

      return {school, challenges: docSnap.data()};
    });

    const settled = await Promise.allSettled(promises);

    const allChallenges: Array<{ school: string; challenges: any }> = [];
    const failedSchools: Array<{ school: string; reason: string }> = [];

    settled.forEach((result: any, idx: any) => {
      const schoolName = schools[idx];
      if (result.status === "fulfilled") {
        allChallenges.push(result.value);
      } else {
        const reason =
          result.reason instanceof Error ?
            result.reason.message :
            String(result.reason);
        console.error(`Failed fetching challenges for ${schoolName}:`, reason);
        failedSchools.push({school: schoolName, reason});
      }
    });

    if (allChallenges.length === 0) {
      res.status(404).json({
        error: "No challenges found for any assigned school",
        failedSchools,
      });
      return;
    }
    res.status(200).json({
      message: "Challenges fetched (partial if some failed)",
      totalSchoolsRequested: schools.length,
      totalWithChallenges: allChallenges.length,
      failedCount: failedSchools.length,
      failedSchools,
      data: allChallenges,
    });
  } catch (error: any) {
    console.error("Unexpected error in CounselorChallengeController:", error);
    res.status(500).json({error: "Failed to retrieve challenges"});
  }
};
