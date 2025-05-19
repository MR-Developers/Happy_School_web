const express = require('express');
const cors = require("cors");
const admin = require('./config/firebaseAdmin'); // ✅ Import initialized admin

const app = express();
const authRoutes = require("./routes/LoginRoute");
const teacherRoutes = require("./routes/TeacherRoute");
const ticketRoute = require("./routes/TicketRoute");
const RaiseTicketRoute = require("./routes/RaiseTicketRoute");
const YourTicketRoute = require("./routes/YourTicketRoute");

const db = admin.firestore(); // ✅ Use admin from shared file

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization,x-api-key",
}));

app.use("/auth", authRoutes);
app.use("/get",teacherRoutes);
app.use("/getTickets",ticketRoute);
app.use("/postTicket",RaiseTicketRoute);
app.use("/user",YourTicketRoute);

app.get('/', async (req, res) => {
  const snapshot = await db
    .collection('Users')
    .doc('thannirurajabrahmam@gmail.com')
    .collection('userinfo')
    .doc('userinfo')
    .get();

  if (snapshot.exists) {
    const data = snapshot.data();
    const userName = data.Name;
    res.send({ name: userName });
  } else {
    res.status(404).send({ error: 'User not found' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
