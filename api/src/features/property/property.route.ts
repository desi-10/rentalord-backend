import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as propertyController from "./property.controller.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import {
  createPropertySchema,
  propertyIdParams,
  updatePropertySchema,
} from "./property.validator.js";
import { businessMiddleware } from "../../middlewares/business.middleware.js";
import { upload } from "../../utils/multer.js";
import { validateParams } from "../../middlewares/params.middleware.js";

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

router
  .route("/:propertyId")
  .get(
    authenticate,
    businessMiddleware,
    propertyController.getPropertyByIdController
  )
  .patch(
    authenticate,
    businessMiddleware,
    validateParams(propertyIdParams),
    upload.single("image"),
    validateSchema(updatePropertySchema),
    propertyController.updatePropertyById
  )
  .delete(
    authenticate,
    businessMiddleware,
    propertyController.deletePropertyById
  );

export default router;
