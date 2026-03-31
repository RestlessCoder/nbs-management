import express from "express";
import { prisma } from "../../lib/prisma.ts";

/**
 * GET /api/assets
 * Handles: 
 * - Regular List (Pagination)
 * - Search (name/type/site)
 * - Refine useMany (filtering by multiple ?id=1&id=2)
 * - Sort By and Order By (Navigation Filter)
 */

const router = express.Router();

// Get all Assets with optional search, filtering and pagination
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

export default router;