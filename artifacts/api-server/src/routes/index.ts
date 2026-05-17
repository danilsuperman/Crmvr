import { Router, type IRouter } from "express";
import healthRouter from "./health";
import zonesRouter from "./zones";
import sessionTypesRouter from "./sessionTypes";
import clientsRouter from "./clients";
import bookingsRouter from "./bookings";
import eventsRouter from "./events";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/zones", zonesRouter);
router.use("/session-types", sessionTypesRouter);
router.use("/clients", clientsRouter);
router.use("/bookings", bookingsRouter);
router.use("/events", eventsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
