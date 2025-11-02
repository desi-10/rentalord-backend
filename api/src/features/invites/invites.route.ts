import express from "express";
import * as inviteController from "../controllers/invite.controller.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware.js";
import { validateSchema } from "../../../middlewares/validate.middleware.js";
import { createInviteSchema } from "../validators/invites.validator.js";

const router = express.Router();

router.post("/accept", inviteController.acceptInviteController);

router
  .route("/admin")
  .get(authenticate, authorizeAdmin, inviteController.getInvitesController)
  .post(
    authenticate,
    authorizeAdmin,
    validateSchema(createInviteSchema),
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
