import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getPatientsForNurse, getNursePatientTask, updateNurseTask } from "../controllers/nurse.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/patients",getPatientsForNurse);
router.get("/patients/:patientId/tasks", getNursePatientTask);
router.post("/tasks/:taskId",updateNurseTask);


export default router;