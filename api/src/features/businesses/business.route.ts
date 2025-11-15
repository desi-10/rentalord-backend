import { Router } from "express";
import * as businessController from "./business.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import { createBusinessSchema } from "./business.validator.js";

const router = Router();

router
  .route("/")
  .get(authenticate, businessController.getAllBusinesses)
  .post(
    authenticate,
    validateSchema(createBusinessSchema),
    businessController.createBusiness
  );

export default router;
