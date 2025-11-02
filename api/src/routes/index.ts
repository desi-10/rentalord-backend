import express from "express";
import usersRoutes from "../features/users/users.route.js";
import authRoutes from "../features/auth/auth.route.js";
import subscriptionRoutes from "../features/subscriptions/subscription.route.js";
import subscriptionplanRoutes from "../features/subscriptionplans/subscriptionplan.route.js";
import invitesRoutes from "../features/invites/invites.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/subscription-plans", subscriptionplanRoutes);
router.use("/invites", invitesRoutes);

export default router;
