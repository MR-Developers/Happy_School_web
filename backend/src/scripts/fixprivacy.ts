import admin from "../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();

const db = admin.firestore();

// 👇 CHANGE THIS
const TARGET_SCHOOL_ID = "Vivek Mandir Amgaon";

async function fixTicketPrivacy(): Promise<void> {
  try {
    console.log("🚀 Starting ticket privacy migration...");
    console.log(`🎯 Target school: ${TARGET_SCHOOL_ID}`);

    const ticketSubColRef = db
      .collection("Tickets")
      .doc(TARGET_SCHOOL_ID)
      .collection(TARGET_SCHOOL_ID);

    const ticketSnap = await ticketSubColRef.get();

    if (ticketSnap.empty) {
      console.log("⚠️ No tickets found for this school");
      process.exit(0);
    }

    let batch = db.batch();
    let batchCount = 0;
    let updatedCount = 0;

    for (const ticketDoc of ticketSnap.docs) {
      const data = ticketDoc.data() as { privacy?: boolean };

      if (data.privacy === undefined) {
        batch.set(ticketDoc.ref, { privacy: false }, { merge: true });
        batchCount++;
        updatedCount++;
      }

      if (batchCount === 500) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Updated ${updatedCount} tickets`);
    console.log("🎉 PRIVACY MIGRATION COMPLETED SUCCESSFULLY");
    process.exit(0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Migration failed:", error.message);
    } else {
      console.error("❌ Migration failed:", error);
    }
    process.exit(1);
  }
}

fixTicketPrivacy();
