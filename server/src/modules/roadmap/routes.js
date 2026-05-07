import { Router } from "express";
import { responseEnvelope } from "../../shared/contracts/responseEnvelope.js";
import { mockStore } from "../../shared/mockStore.js";
import { validateDto } from "../../shared/middleware/validateDto.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(responseEnvelope(mockStore.roadmap, { module: "roadmap" }));
});

router.post("/reassess", validateDto(["checkpoint"]), (req, res) => {
  const adapted = {
    ...mockStore.roadmap,
    adaptation: `Checkpoint ${req.body.checkpoint} completed, week 4 reprioritized.`
  };
  res.json(responseEnvelope(adapted, { module: "roadmap", mode: "adaptive" }));
});

export default router;
