import express from "express";
import * as subscriptionPlanController from "./subscriptionplan.controllers.js";
import {
  createSubscriptionPlanSchema,
  updateSubscritionPlanSchema,
} from "./subscriptionplan.validator.js";
import { validateSchema } from "../../middlewares/validate.middleware.js";
import {
  authenticate,
  authorizeAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", subscriptionPlanController.getAllSubscriptionPlans);

router.use(authenticate, authorizeAdmin);
router
  .route("/admin")
  .get(subscriptionPlanController.getAllSubscriptionPlans)
  .post(
    validateSchema(createSubscriptionPlanSchema),
    subscriptionPlanController.createSubscriptionPlan
  );

router
  .route("/:id/admin")
  .get(subscriptionPlanController.getSubscriptionPlanById)
  .patch(
    validateSchema(updateSubscritionPlanSchema),
    subscriptionPlanController.updateSubscritionPlan
  )
  .delete(subscriptionPlanController.deleteSubscritionPlan);

export default router;
