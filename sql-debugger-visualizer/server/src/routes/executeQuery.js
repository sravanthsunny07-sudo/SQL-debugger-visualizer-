import { Router } from "express";
import { executeQuery } from "../../services/queryService.js";

const router = Router();

router.post("/", (req, res) => {
  const { query } = req.body ?? {};

  try {
    const result = executeQuery(query);

    res.json({
      success: true,
      message: result.message,
      data: result.data,
      steps: result.steps,
      final: result.final
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unable to execute the SQL query.";

    res.status(400).json({
      success: false,
      error: message
    });
  }
});

export default router;
