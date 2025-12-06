import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as unitController from "./unit.controller.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import {
  createUnitSchema,
  unitIdParams,
  updateUnitSchema,
} from "./unit.validator.js";
import { businessMiddleware } from "../../middlewares/business.middleware.js";
import { validateParams } from "../../middlewares/params.middleware.js";
import { upload } from "../../utils/multer.js";

const router = Router();

router
  .route("/")
  .get(authenticate, businessMiddleware, unitController.getAllUnits)
  .post(
    authenticate,
    businessMiddleware,
    upload.array("images"),
    validateSchema(createUnitSchema),
    unitController.createUnit
  );

router
  .route("/:unitId")
  .get(
    authenticate,
    businessMiddleware,
    validateParams(unitIdParams),
    unitController.getUnitById
  )
  .patch(
    authenticate,
    businessMiddleware,
    validateParams(unitIdParams),
    upload.array("images"),
    validateSchema(updateUnitSchema),
    unitController.updateUnitById
  )
  .delete(
    authenticate,
    businessMiddleware,
    validateParams(unitIdParams),
    unitController.deleteUnitById
  );

export default router;
