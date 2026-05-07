import { Router } from "express";
import { responseEnvelope } from "../../shared/contracts/responseEnvelope.js";
import { mockStore } from "../../shared/mockStore.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(responseEnvelope(mockStore.validate, { module: "validate" }, { sourceFreshness: "mock-v1" }));
});

export default router;
