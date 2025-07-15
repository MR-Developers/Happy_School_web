import admin from './config/firebaseAdmin'; // your existing config
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();
const SCHOOL_NAME = 'Teachers';

const ticketsRef = db.collection('Tickets').doc('Teachers').collection('Teachers');

const contributorsList = [
  { name: 'Rajabrahmam Thanniru', email: 'thanirurajabrahmam@gmail.com' },
  { name: 'Budda Manikanta Saaketh', email: 'buddamanikantasaaketh@gmail.com' },
  { name: 'John Doe', email: 'john@example.com' },
];

const statuses = ['Resolved', 'Ticket Raised'];

const getRandomContributor = () => {
  const rand = Math.floor(Math.random() * contributorsList.length);
  return [contributorsList[rand]];
};

const generateTickets = async () => {
  const now = new Date();

  const dummyTickets = Array.from({ length: 10 }, (_, i) => {
    const contributor = getRandomContributor();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      ticketText: `Sample issue ${i + 1}`,
      userName: contributor[0].name,
      email: contributor[0].email,
      timestamp: now.toLocaleString('en-IN', { hour12: true }),
      reply: '',
      status,
      tocken: 0,
      uid: uuidv4(),
      school: SCHOOL_NAME,
      contributors: contributor,
    };
  });

  for (const ticket of dummyTickets) {
    await ticketsRef.add(ticket);
  }

  console.log(`✅ 10 dummy tickets added under Tickets → ${SCHOOL_NAME} → Tickets`);
};

generateTickets().catch((err) => {
  console.error('❌ Error creating dummy tickets:', err);
});
