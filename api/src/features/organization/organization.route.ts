import { Router } from "express";
import * as organizationController from "./organization.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/").get(authenticate, organizationController.getAllOrganizations);

export default router;
