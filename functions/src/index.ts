import express from "express";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import loginRoutes from "./routers/loginroute";
import { WEB_API_KEY, JWT_SECRET } from "./controllers/login"; // <- Import secrets
import dashboardroute from "./routers/dashboard";
import ticketroutes from "./routers/ticket";
import teacherroutes from "./routers/teacher";
import raiseticketroutes from "./routers/riseticket";

setGlobalOptions({ maxInstances: 10 });

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://happyschool-99f85.web.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));
app.use(express.json());

app.use("/auth", loginRoutes);
app.use("/dashboard", dashboardroute);
app.use("/tickets", ticketroutes);
app.use("/teachers", teacherroutes); 
app.use("/raiseticket", raiseticketroutes);

// Optional test endpoint
export const helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase!");
});

// ✅ Inject secrets into entire Express app
export const api = onRequest({ secrets: [WEB_API_KEY, JWT_SECRET] }, app);
