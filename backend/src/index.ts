import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import admin from "./config/firebaseAdmin";

import authRoutes from "./routes/LoginRoute";
import teacherRoutes from "./routes/TeacherRoute";
import ticketRoute from "./routes/TicketRoute";
import raiseTicketRoute from "./routes/RaiseTicketRoute";
import yourTicketRoute from "./routes/YourTicketRoute";
import dashboard from "./routes/DashboardRoute";
import chat from "./routes/Chat";
import challenges from "./routes/ChallengeRoutes";
import tasks from "./routes/TaskRoutes";
import UserAnswerRoutes from "./routes/UserAnswers";
import OneOnOne from "./routes/OneOnOneRoutes";
const app = express();
const db = admin.firestore();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization,x-api-key",
  })
);

app.use("/auth", authRoutes);
app.use("/get", teacherRoutes);
app.use("/getTickets", ticketRoute);
app.use("/postTicket", raiseTicketRoute);
app.use("/user", yourTicketRoute);
app.use("/api", dashboard);
app.use("/chat", chat);
app.use("/challenges", challenges);
app.use("/tasks", tasks);
app.use("/answers", UserAnswerRoutes);
app.use("/oneonone", OneOnOne);

app.get("/", async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("Users")
      .doc("thannirurajabrahmam@gmail.com")
      .collection("userinfo")
      .doc("userinfo")
      .get();

    if (snapshot.exists) {
      const data = snapshot.data();
      const userName = data?.Name;
      res.send({ name: userName });
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
