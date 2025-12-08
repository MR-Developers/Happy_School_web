import admin from "../config/firebaseAdmin";
import dotenv from "dotenv";
dotenv.config();

const db = admin.firestore();

const coordinatorEmail = "karwatneeta@gmail.com";
const schoolName = "Vivek Mandir CBSE";

const userEmails: string[] = [
  "sangitamohature367@gmail.com",
  "devendraridnarthi123@gmail.com",
  "maheshb.52thade@gmail.com",
  "arebee777@gmail.com",
  "anil.bhojwani.gondia@gmail.com",
  "vinuchitransh1987@gmail.com",
  "abhilashapandey07@gmail.com",
  "pooja.agrawal2710@gmail.com",
  "manishatalwani626@gmail.com",
  "pratimadhabale50@gmail.com",
  "yogeshshukla049@gmail.com",
  "gayatrithakare1978@gmail.com",
  "chouhansubhassinh@gmail.com",
  "durgeshwaribhagat1234@gmail.com",
  "rajkumarirajepande@gmail.com",
  "pavitrahande123@gmail.com",
  "snehlatagajbhiye77@gmail.com",
  "savita.r2009@gmail.com",
  "ashishvmg10@gmail.com",
  "shahinasanno@gmail.com",
  "vishwas2007@gmail.com",
  "nakhateanuradha0@gmail.com",
  "mamtaagnihotri38@gmail.com",
  "sandhyaladekar28@gmail.com",
  "gr8anubhav@gmail.com",
  "chandabhave27@gmail.com",
  "poojajaswani65@gmail.com",
  "parmarj915@gmail.com",
  "roshankaranjekar72@gmail.com",
  "sapnaupwanshi70@gmail.com",
  "singhanubhuti75@gmail.com",
  "rakeshshriwas27@gmail.com",
  "ramnani.komal24@gmail.com",
  "sujanb3101@gmail.com",
  "ppramod427@gmail.com",
  "jenishawadhwani@gmail.com",
  "abhayjeettiwari0609@gmail.com",
];

async function assignWingToUsers() {
  try {
    console.log("Starting wing assignment...");
    const wingSnap = await db
      .collection("Wings")
      .where("coordinatorEmail", "==", coordinatorEmail)
      .where("schoolName", "==", schoolName)
      .limit(1)
      .get();

    if (wingSnap.empty) {
      console.error("❌ No Wing found for this coordinatorEmail + schoolName");
      process.exit(1);
    }

    const wingId = wingSnap.docs[0].id;
    console.log("✅ Wing Found:", wingId);

    const batch = db.batch();

    const updatedUsers: string[] = [];
    const missingUsers: string[] = [];

    for (const email of userEmails) {
      const userInfoRef = db
        .collection("Users")
        .doc(email.toLowerCase())
        .collection("userinfo")
        .doc("userinfo");

      const userInfoSnap = await userInfoRef.get();

      if (!userInfoSnap.exists) {
        console.log(`❌ MISSING USER: ${email}`);
        missingUsers.push(email);
        continue;
      }

      batch.set(userInfoRef, { wingId }, { merge: true });
      updatedUsers.push(email);
    }

    await batch.commit();

    console.log("\n🎉 WING ASSIGNMENT COMPLETED\n");

    console.log("✅ Successfully Updated Users:");
    console.log(updatedUsers);

    console.log("\n❌ Missing Users (userinfo/userinfo does not exist):");
    console.log(missingUsers);

    console.log("\nWing ID:", wingId);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

assignWingToUsers();
