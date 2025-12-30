import express, {Request, Response} from "express";
import axios, {isAxiosError} from "axios";
import {auth} from "firebase-admin";
import {WEB_API_KEY} from "./login";

const router = express.Router();

interface SendResetEmailBody {
    email: string;
}

interface FirebaseErrorResponse {
    error?: {
        message?: string;
    };
}

router.post(
  "/send-reset-email",
  async (
    req: Request<Record<string, never>, unknown, SendResetEmailBody>,
    res: Response
  ): Promise<void> => {
    const {email} = req.body;

    if (!email) {
      res.status(400).json({error: "Email is required"});
      return;
    }

    const apiKey = WEB_API_KEY.value();

    if (!apiKey) {
      res.status(500).json({
        error: "Firebase API key is missing in environment variables",
      });
      return;
    }

    try {
      // 🔍 STEP 1: Check if user exists
      const userRecord = await auth().getUserByEmail(email);

      // 📧 STEP 2: Send password reset email
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          requestType: "PASSWORD_RESET",
          email,
        }
      );

      res.status(200).json({
        message: "Password reset email sent successfully",
        uid: userRecord.uid,
      });
    } catch (error: unknown) {
      // Firebase Admin error
      if (error instanceof Error && "code" in error) {
        if ((error as { code: string }).code === "auth/user-not-found") {
          res.status(404).json({error: "No account found with this email"});
          return;
        }
      }

      // Axios error
      if (isAxiosError(error)) {
        const data = error.response?.data as FirebaseErrorResponse;

        res.status(400).json({
          error:
                        data?.error?.message ??
                        error.message ??
                        "Firebase request failed",
        });
        return;
      }

      // Generic error
      if (error instanceof Error) {
        res.status(500).json({error: error.message});
        return;
      }

      res.status(500).json({error: "Unknown error occurred"});
    }
  }
);

export default router;
