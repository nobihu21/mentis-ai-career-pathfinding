import { Router } from "express";
import { responseEnvelope } from "../../shared/contracts/responseEnvelope.js";
import { mockStore } from "../../shared/mockStore.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(responseEnvelope(mockStore.match, { module: "match" }, { ranking: "weighted-score-v1" }));
});

export default router;
