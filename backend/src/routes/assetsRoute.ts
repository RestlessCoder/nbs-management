import express from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { AssetType } from "@prisma/client";

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

    // AssetType is a string enum-like object. 
    // Convert object to values array and find a match to support user-friendly search.
    const assetTypeValues = Object.values(AssetType); // ['CEILING','LIGHTING',...]

    const matchedType = assetTypeValues.find(t =>
        t.toLowerCase().includes(search.toString().toLowerCase())
    );

    // Define search and year filter across both Asset and Site tables 
   const where = {
        AND: [
            // Handle the search logic
            search ? {
                OR: [
                    { name: { contains: String(search), mode: 'insensitive' as const } },
                    { type: { equals: matchedType as AssetType } },
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
 * PUT /api/assets/:id
 * Handles: Updating an asset by its ID,
 */
router.put("/:id", requireAuth, requireRole(['ADMIN', 'USER']), async (req, res) => {
    const { id } = req.params;
    
    try {
        const {
            name,
            type,
            siteId,
            manufacturer,
            year,
            quickFixes,
        } = req.body;
        
        const updatedAssets = await prisma.asset.update({
            where: { id: Number(id) },
            data: {
                name,
                type,
                siteId,
                manufacturer,
                year,
                quickFixes,
            }, include: { site: true } // Include relation for the detail views
        });

        if (!updatedAssets) return res.status(404).json({ error: "Asset not found" });

        res.json({
            message: "Assets updated successfully",
            data: updatedAssets,
        });

    } catch (err) {
        console.error("Error updating assets:", err);

        if ((err as any)?.code === "P2002") {
            return res.status(400).json({
                error: "Asset name is already taken.",
            });
        }

        res.status(500).json({ error: "Failed to update asset" });
    }
});


/**
 * GET /api/assets/names
 * Handles: Fetching only the asset names for dropdowns 
 */
router.get("/names", async (req, res) => {
   try {
        const assets = await prisma.asset.findMany({
            select: { id: true, name: true }, 
            orderBy: { name: "asc" },        
        });

        res.json({ data: assets });
    } catch (error) {
        console.error("Error fetching asset names:", error);
        res.status(500).json({ error: "Failed to fetch asset names" });
    }
})


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

/**
 * GET /api/assets/:id
 * Handles: Fetching a single asset by its URL ID
 */
router.get("/:id", async (req, res) => {
    try {
        const asset = await prisma.asset.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { site: true } // Include relation for the detail view
        });

        if (!asset) return res.status(404).json({ error: "Asset not found" });

        res.json({ data: asset });
    } catch (error) {
        res.status(500).json({ error: "Invalid ID or Server Error" });
    }
});

export default router;