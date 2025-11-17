import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as propertyController from "./property.controller.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import { createPropertySchema } from "./property.validator.js";
import { businessMiddleware } from "../../middlewares/business.middleware.js";
import { upload } from "../../utils/multer.js";

const router = Router();

router
  .route("/")
  .get(authenticate, businessMiddleware, propertyController.getAllProperties)
  .post(
    authenticate,
    businessMiddleware,
    upload.single("image"),
    validateSchema(createPropertySchema),
    propertyController.createProperty
  );

export default router;
