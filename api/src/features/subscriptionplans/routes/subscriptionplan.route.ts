import express from "express";
import * as subscriptionPlanController from "../controllers/subscriptionplan.controllers.js";
import {
  createSubscriptionPlanSchema,
  updateSubscritionPlanSchema,
} from "../validators/subscriptionplan.validator.js";
import { validateSchema } from "../../../middlewares/validate.middleware.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router
  .route("/")
  .get(subscriptionPlanController.getAllSubscriptionPlans)
  .post(
    validateSchema(createSubscriptionPlanSchema),
    subscriptionPlanController.createSubscriptionPlan
  );

router
  .route("/:id")
  .get(subscriptionPlanController.getSubscriptionPlanById)
  .patch(
    validateSchema(updateSubscritionPlanSchema),
    subscriptionPlanController.updateSubscritionPlan
  )
  .delete(subscriptionPlanController.deleteSubscritionPlan);

export default router;
