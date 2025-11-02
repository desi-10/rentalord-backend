import express from "express";
import * as subscriptionController from "../controllers/subscription.controller.js";
import { validateSchema } from "../../../middlewares/validate.middleware.js";
import {
  createSubscriptionSchema,
  updateSubscriptionStatusSchema,
} from "../validators/subscription.validator.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware.js";
import { validateParams } from "../../../middlewares/params.middleware.js";
import { subscriptionParams } from "../../subscriptionplans/validators/subscriptionplan.validator.js";

const router = express.Router();

router.route("/").get(subscriptionController.getUserActiveSubscription);
// router.route("/:id").get(validateParams(subscriptionParams));

//admin routes
router
  .route("/admin")
  .get(
    authenticate,
    authorizeAdmin,
    subscriptionController.getAllSubscriptionsController
  )
  .post(
    authenticate,
    authorizeAdmin,
    validateSchema(createSubscriptionSchema),
    subscriptionController.createUserSubscription
  );
// .patch(
//   validateParams(subscriptionParams),
//   validateSchema(updateSubscriptionStatusSchema),
//   subscriptionController.updateSubscriptionStatus
// );
// .delete();

export default router;
