import express from 'express';
import { getCoordinatorDashboardSummary } from '../../controllers/Co-ordinator/CoordinatorDashboard';

const router = express.Router();

router.get('/summary/:wingId', getCoordinatorDashboardSummary);
export default router;