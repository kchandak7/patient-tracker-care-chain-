import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getPatientsForDoctor, getPatientById, getDoctorAppointments, createTaskByDoctor, getDoctorTasks, getDoctorPatientTasks, getPatientPrescription, getNursesForDoctor, updatePatientDiagnosis } from "../controllers/doctor.controller.js";

const router = express.Router();
router.use(protectRoute);

router.get("/patients",getPatientsForDoctor);
router.get("/patients/:id",getPatientById);
router.put("/patients/:id/diagnosis", updatePatientDiagnosis);
router.get("/appointments",getDoctorAppointments);
router.get("/nurses", getNursesForDoctor);
router.post("/tasks",createTaskByDoctor);
router.get("/tasks",getDoctorTasks);
router.get("/patients/:patientId/tasks",getDoctorPatientTasks);
router.get("/patients/:patientId/prescription", getPatientPrescription);



export default router;