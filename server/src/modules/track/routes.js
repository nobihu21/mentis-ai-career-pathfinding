import { Router } from "express";
import { responseEnvelope } from "../../shared/contracts/responseEnvelope.js";
import { mockStore } from "../../shared/mockStore.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(responseEnvelope(mockStore.track, { module: "track" }));
});

export default router;
