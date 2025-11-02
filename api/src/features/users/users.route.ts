// src/features/users/routes/user.routes.ts
import express from "express";
import * as userController from "./users.controller.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../middlewares/auth.middleware.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
} from "./users.validator.js";
import { validateParams } from "../../middlewares/params.middleware.js";
// optional

const router = express.Router();

router.get("/me", authenticate, userController.getCurrentUser);
router.patch(
  "/update",
  authenticate,
  validateSchema(updateUserSchema),
  userController.updateCurentUser
);

// admin routes
router
  .route("/")
  .get(authenticate, authorizeAdmin, userController.getAllUsers)
  .post(
    authenticate,
    authorizeAdmin,
    validateSchema(createUserSchema),
    userController.createUser
  );

router
  .route("/:id")
  .get(
    authenticate,
    authorizeAdmin,
    validateParams(userParamsSchema),
    userController.getUserById
  )
  .patch(
    authenticate,
    authorizeAdmin,
    validateParams(userParamsSchema),
    validateSchema(updateUserSchema),
    userController.updateUser
  )
  .delete(
    authenticate,
    authorizeAdmin,
    validateParams(userParamsSchema),
    userController.deleteUser
  );

export default router;
