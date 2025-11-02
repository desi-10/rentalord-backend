import express from "express";
import * as inviteController from "../controllers/invite.controller.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware.js";
import { validateSchema } from "../../../middlewares/validate.middleware.js";
import { createPropertyInviteSchema } from "../validators/property.validator.js";

const router = express.Router();

router.post("/accept", inviteController.acceptInviteController);

router
  .route("/admin")
  .get(authenticate, authorizeAdmin, inviteController.getInvitesController)
  .post(
    authenticate,
    authorizeAdmin,
    validateSchema(createPropertyInviteSchema),
    inviteController.createInviteController
  );

router
  .route("/:id/admin")
  .get(authenticate, authorizeAdmin, inviteController.getInviteController)
  .patch(authenticate, authorizeAdmin, inviteController.updateInviteController)
  .delete(
    authenticate,
    authorizeAdmin,
    inviteController.deleteInviteController
  );

export default router;
