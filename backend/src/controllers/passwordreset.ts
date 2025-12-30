import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/send-reset-email", async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {

        const apiKey = process.env.firebaseAPIKey;
        if (!apiKey) {
            res.status(500).json({ error: "Firebase API key is missing in environment variables" });
            return;
        }

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
            {
                requestType: "PASSWORD_RESET",
                email,
            }
        );

        res.status(200).json({
            message: "Password reset email sent successfully",
            response: response.data,
        });

    } catch (error: unknown) {
        // ✅ Type guard for Axios errors
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
            res.status(400).json({
                error: error.response?.data?.error?.message || error.message,
            });
            return;
        }

        // ✅ Fallback for non-Axios errors
        const err = error as Error;
        console.error("Unexpected error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;