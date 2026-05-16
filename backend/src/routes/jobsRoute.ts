import express from "express";
import { prisma } from "../../lib/prisma.ts";
import { Status } from "../../generated/prisma/enums.ts";
import { requireAuth, requireRole } from "../middleware/auth.ts";

const router = express.Router();

/**
 * GET /api/jobs
 * Handles: 
 * - Regular List (Pagination)
 * - Search (type/site/description/cost)
 * - Refine useMany (filtering by multiple ?id=1&id=2)
 * - Sort By and Order By (Navigation Filter)
 */

router.get("/", async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '', 
        _sort = 'createdAt', 
        _order = 'desc',
        recent = false,
        quickFixes = false
    } = req.query;

    // HANDLE REGULAR LIST (Pagination) 
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const take = parseInt(String(limit));   

    const numSearch = Number(search);

    // Define search and year filter across both Asset and Site tables 
   const where = {
        AND: [
            // Handle the search logic 
            search ? {
                OR: [
                    // Only add numeric filters if search is a valid number
                    ...(isNaN(numSearch) ? [] : [{ reference: { equals: numSearch } }]),
                    ...(isNaN(numSearch) ? [] : [{ cost: { equals: numSearch } }]),
                    { description: { contains: String(search), mode: 'insensitive' as const } },
                    { asset: { name: { contains: String(search), mode: 'insensitive' as const } } },
                    { site: { name: { contains: String(search), mode: 'insensitive' as const } } }
                ],
            } : {},
            recent === 'true' ? {
                createdAt: {
                    gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // last 1 days
                }
            } : {},
            quickFixes === 'true' ? {
                asset: { quickFixes: { gt: 1 } }
            } : {},
        ]
    };

    const orderBy = {
        [String(_sort)]: String(_order).toLowerCase() === 'asc' ? 'asc' : 'desc'
    };

    try {
        const [jobs, totalCount] = await prisma.$transaction([
            prisma.job.findMany({
                where,
                skip,
                take,
                orderBy,
                include: { asset: true }
            }),

            prisma.job.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / take);

        res.json({
            data: jobs,
            pagination: {
                currentPage: parseInt(String(page)),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: take
            }
        });

    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

/**
 * POST /api/jobs/add-job
 * Handles: Adding Jobs
 */
router.post("/add-job", async (req, res) => {

async function generateReference() {
    const lastJob = await prisma.job.findFirst({ orderBy: { reference: "desc" }, });
    // If no jobs yet, start at 100400
    if (!lastJob) return 100400;

    return lastJob.reference + 1;
}
  try {
    const {
      description,
      siteId,
      assetId,
      quickFixes
    } = req.body;

    const reference = await generateReference();

    const newJob = await prisma.job.create({
      data: {
        reference,
        description,  
        siteId,      
        assetId,     
        quickFixes: Number(quickFixes) || 0, 
        cost: 0,
        status: Status.LOGGED_WITH_NBS
      },
      include: { site: true, asset: true } // include relations if needed
    });

    if (assetId && quickFixes > 0) {
        await prisma.asset.update({
            where: { id: assetId },
            data: {
                quickFixes: { increment: Number(quickFixes) || 0 } // Increment quickFixes count for the asset
            }
        });
    }

    res.json({
      message: "Job created successfully",
      data: newJob,
    });

  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ error: "Failed to create job" });
  }
});


/**
 * PUT /api/jobs/:id
 * Handles: Updating a job by its ID,
 */
router.put("/:id", requireAuth, requireRole(['ADMIN', 'USER']), async (req, res) => {
    const { id } = req.params;
    
    try {
        const {
            assetId,
            siteId,
            status,
            cost,
            description,
        } = req.body;
        
        const updatedJobs = await prisma.job.update({
            where: { id: Number(id) },
            data: {
                assetId,
                siteId,
                status,
                cost,
                description,
            }, include: { site: true, asset: true } // Include relation for the detail views
        });

        if (!updatedJobs) return res.status(404).json({ error: "Job not found" });

        res.json({
            message: "Job updated successfully",
            data: updatedJobs,
        });

    } catch (err) {
        console.error("Error updating jobs:", err);

        res.status(500).json({ error: "Failed to update job" });
    }
});


/**
 * DELETE /api/jobs/:id
 * Handles: Deleting a job by its ID,
 */
router.delete("/:id", requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedJob = await prisma.job.delete({
            where: { id: Number(id) },
            include: { site: true, asset: true } // Include relation for the detail view
        });

        if (!deletedJob) return res.status(404).json({ error: "Job not found" });

        res.json({
            message: "Job deleted successfully",
            data: deletedJob,
        });

    } catch (err) {
        console.error("Error deleting job:", err);
        res.status(500).json({ error: "Failed to delete job" });
    }
});

/**
 * GET /api/jobs/status-options
 * Handles: Fetching only the status options for dropdowns
 */
router.get("/status-options", async (req, res) => {
   try {
        const statusOptions = Object.values(Status);

        res.json({ data: statusOptions });
    } catch (error) {
        console.error("Error fetching status options:", error);
        res.status(500).json({ error: "Failed to fetch status options" });
    }
})

export default router;