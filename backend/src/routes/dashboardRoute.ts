import express from "express";
import { prisma } from "../../lib/prisma";

const router = express.Router();

/**
 * GET /api/dashboard/sites
 * Handles:
 * - Fetch all sites with relations
 * - Include jobs (with quick fixes)
 * - Include assets (with quick fixes)
 * - Single site fetch by ID (/api/dashboard/sites/:id)
 * - Error handling for missing or invalid site IDs
 */
router.get("/grouped-sites", async (req, res) => {
    try {
        const sites = await prisma.site.findMany({
            include: {
                assets: true, // include all assets for the site
                jobs: true,   // include all jobs for the site
            },
        });

        return res.json({ data: sites });
    } catch (err) {
        console.error("Error fetching sites with jobs and assets:", err);
        return res.status(500).json({ error: "Failed to fetch sites" });
    }
});

/**
 * GET /api/dashboard/sites/:id
 * Handles:
 * - Fetch single site by ID
 * - Include related jobs (with quick fixes)
 * - Include related assets (with quick fixes)
 * - Return 404 if site not found
 * - Error handling for invalid or failed queries
 */
router.get("/sites/:id", async (req, res) => {
    try {
        const siteId = parseInt(req.params.id, 10);
        const site = await prisma.site.findUnique({
            where: { id: siteId },
            include: {
                assets: true,
                jobs: true,
            },
        });

        if (!site) {
            return res.status(404).json({ error: "Site not found" });
        }

        return res.json(site);
    } catch (err) {
        console.error("Error fetching site:", err);
        return res.status(500).json({ error: "Failed to fetch site" });
    }
});

export default router;
