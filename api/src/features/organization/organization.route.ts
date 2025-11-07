import { Router } from "express";
import * as organizationController from "./organization.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import { createOrganizationSchema } from "./organization.validator.js";

const router = Router();

router
  .route("/")
  .get(authenticate, organizationController.getAllOrganizations)
  .post(
    authenticate,
    validateSchema(createOrganizationSchema),
    organizationController.createOrganization
  );

export default router;
