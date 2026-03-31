import express from "express";
import { prisma } from "../../lib/prisma.ts";

const router = express.Router();

/**
 * GET /api/sites/:id
 * Handles: Fetching a single site by its URL ID
 */
router.get("/:id", async (req, res) => {
    try {
        const site = await prisma.site.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { assets: true } // Include relation for the detail view
        });

        if (!site) return res.status(404).json({ error: "Site not found" });

        res.json({ data: site });
    } catch (error) {
        res.status(500).json({ error: "Invalid ID or Server Error" });
    }
});

export default router;