import express from "express";
import { createDoctor, deleteDoctor, createNurse, deleteNurse, getAllDoctors, getAllNurses,createPatient,deletePatient } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();
router.use(protectRoute);
router.use(adminOnly);


router.post("/createDoctor",createDoctor);
router.delete("/deleteDoctor/:id",deleteDoctor);
router.post("/createNurse",createNurse);
router.delete("/deleteNurse/:id",deleteNurse);
router.get("/getAllDoctors",getAllDoctors);
router.get("/getAllNurses",getAllNurses);
router.post("/createPatient",createPatient);
router.delete("/deletePatient/:id",deletePatient);


export default router;