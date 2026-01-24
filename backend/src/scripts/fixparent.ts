import admin from "../config/firebaseAdmin";
import dotenv from "dotenv";

dotenv.config();

const db = admin.firestore();

// 👇 TARGET SCHOOL
const TARGET_SCHOOL_ID = "Vivek Mandir State board";

async function fixTicketPrivacy(): Promise<void> {
  try {
    console.log("🚀 Starting ticket privacy migration...");
    console.log(`🎯 Target school: ${TARGET_SCHOOL_ID}`);

    /**
     * STEP 1: Ensure parent document exists
     * Path: /Tickets/{TARGET_SCHOOL_ID}
     */
    const parentRef = db.collection("Tickets").doc(TARGET_SCHOOL_ID);
    const parentSnap = await parentRef.get();

    if (!parentSnap.exists) {
      await parentRef.set({
        schoolId: TARGET_SCHOOL_ID,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        _system: "auto-created to fix non-existent ancestor",
      });

      console.log(`✅ Created missing parent doc: ${TARGET_SCHOOL_ID}`);
    } else {
      console.log("ℹ️ Parent document already exists");
    }

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
