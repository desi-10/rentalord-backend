import express from "express";
import {
  createUnits,
  deleteUnitById,
  getAllUnits,
  getUnitById,
  updateUnitController,
} from "./unit.controller.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import {
  createUnitSchema,
  unitParams,
  updateUnitSchema,
} from "./unit.validator.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../middlewares/auth.middleware.js";
import { validateParams } from "../../middlewares/params.middleware.js";
import { membershipMiddleware } from "../../middlewares/memership.middleware.js";
const router = express.Router();

router
  .route("/")
  .get(getAllUnits)
  .post(
    authenticate,
    authorizeAdmin,
    validateSchema(createUnitSchema),
    createUnits
  );

router
  .route("/:id")
  .get(validateParams(unitParams), authenticate, getUnitById)
  .patch(
    validateParams(unitParams),
    membershipMiddleware,
    authenticate,
    authorizeAdmin,
    validateSchema(updateUnitSchema),
    updateUnitController
  )
  .delete(
    validateParams(unitParams),
    authenticate,
    authorizeAdmin,
    deleteUnitById
  );

export default router;
