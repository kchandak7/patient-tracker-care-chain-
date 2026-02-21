import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getPatientsForNurse, getNursePatientTask, updateNurseTask, getAllNurseTasks, getNurseProfile, togglePatientFlag } from "../controllers/nurse.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/profile", getNurseProfile);
router.get("/tasks", getAllNurseTasks);
router.get("/patients",getPatientsForNurse);
router.get("/patients/:patientId/tasks", getNursePatientTask);
router.put("/patients/:patientId/flag", togglePatientFlag);
router.post("/tasks/:taskId",updateNurseTask);


export default router;