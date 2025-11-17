import express from "express";
import usersRoutes from "../features/users/users.route.js";
import authRoutes from "../features/auth/auth.route.js";
import subscriptionRoutes from "../features/subscriptions/subscription.route.js";
import subscriptionplanRoutes from "../features/subscription-plans/subscriptionplan.route.js";
import invitesRoutes from "../features/invites/invites.route.js";
import unitsRoutes from "../features/unit/unit.route.js";
import businessesRoutes from "../features/businesses/business.route.js";
import propertiesRoutes from "../features/property/property.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/subscription-plans", subscriptionplanRoutes);
router.use("/invites", invitesRoutes);
router.use("/units", unitsRoutes);
router.use("/businesses", businessesRoutes);
router.use("/properties", propertiesRoutes);

export default router;
