import express from "express";
import { prisma } from "../../lib/prisma.ts";
import { requireAuth, requireRole } from "../middleware/auth.ts";

const router = express.Router();

/**
 * GET /api/assets
 * Handles: 
 * - Regular List (Pagination)
 * - Search (name/type/site)
 * - Refine useMany (filtering by multiple ?id=1&id=2)
 * - Sort By and Order By (Navigation Filter)
 */

router.get("/", async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '', 
        year,
        _sort = 'createdAt', 
        _order = 'desc' 
    } = req.query;

    // HANDLE REGULAR LIST (Pagination) 
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const take = parseInt(String(limit));   

    // Define search and year filter across both Asset and Site tables 
   const where = {
        AND: [
            // Handle the search logic
            search ? {
                OR: [
                    { name: { contains: String(search), mode: 'insensitive' as const } },
                    { type: { contains: String(search), mode: 'insensitive' as const } },
                    { site: { name: { contains: String(search), mode: 'insensitive' as const } } }
                ],
            } : {},
            // 3. Handle the year logic
            year ? {
                year: parseInt(String(year)) // Or { year: String(year) } depending on your Prisma schema type
            } : {}
        ]
    };

    const orderBy = {
        [String(_sort)]: String(_order).toLowerCase() === 'asc' ? 'asc' : 'desc'
    };

    try {
        const [assets, totalCount] = await prisma.$transaction([
        prisma.asset.findMany({
            where,
            skip,
            take,
            orderBy,
        }),
            prisma.asset.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / take);

        res.json({
            data: assets,
            pagination: {
                currentPage: parseInt(String(page)),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: take
            }
        });

    } catch (error) {
        console.error("Error fetching assets:", error);
        res.status(500).json({ error: "Failed to fetch assets" });
    }
});

/**
 * DELETE /api/assets/:id
 * Handles: Deleting an asset by its ID,
 */
router.delete("/:id", requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAsset = await prisma.asset.delete({
            where: { id: Number(id) },
            include: { site: true } // Include relation for the detail view
        });

        if (!deletedAsset) return res.status(404).json({ error: "Asset not found" });

        res.json({
            message: "Asset deleted successfully",
            data: deletedAsset,
        });

    } catch (err) {
        console.error("Error deleting asset:", err);
        res.status(500).json({ error: "Failed to delete asset" });
    }
});

export default router;