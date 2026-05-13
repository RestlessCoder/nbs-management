import express from "express";
import { prisma } from "../../lib/prisma.ts";
import { requireAuth, requireRole, requireVerified } from "../middleware/auth.ts";

const router = express.Router();

/**
 * GET /api/sites
 * Handles: 
 * - Regular List (Pagination)
 * - Search (name/location)
 * - Refine useMany (filtering by multiple ?id=1&id=2)
 */

// Get all Site with optional search, filtering and pagination
router.get("/", requireAuth, requireVerified, async (req, res) => {
    const { 
        id, 
        page = 1, 
        limit = 10,
        search = '',
        _sort = 'createdAt', 
        _order = 'desc' 
    } = req.query;
    
    
    // HANDLE useMany (Filtering by ID) 
    if (id) {
        // Convert to array in case Refine sends multiple: ?id=3&id=4
        const idArray = Array.isArray(id) 
            ? id.map(val => parseInt(String(val))) 
            : [parseInt(String(id))];

        const sites = await prisma.site.findMany({
            where: {
                id: { in: idArray }
            },
            // This pulls and include in the related assets array
            include: { assets: true },
        });

        // Refine expects the result wrapped in { data: [...] }
        return res.json({ data: sites });
    }
 
    // HANDLE REGULAR LIST (Pagination) 
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const take = parseInt(String(limit));   

    // Construct the filter object
    const where = {
        // Handle the search logic
        ...(search && {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' as const} },
              { location: { contains: String(search), mode: 'insensitive' as const } },
              { entity: { contains: String(search), mode: 'insensitive' as const } },
              { category: { contains: String(search), mode: 'insensitive' as const } },
            ],
        }),
        
    };

    const orderBy = {
        [String(_sort)]: String(_order).toLowerCase() === 'asc' ? 'asc' : 'desc'
    };

    try {
        const [sites, totalCount] = await prisma.$transaction([
        prisma.site.findMany({
            where,
            skip,
            take,
            orderBy,
        }),
            prisma.site.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / take);

        res.json({
            data: sites,
            pagination: {
                currentPage: parseInt(String(page)),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: take
            }
        });

    } catch (error) {
        console.error("Error fetching sites:", error);
        res.status(500).json({ error: "Failed to fetch sites" });
    }

})

/**
 * GET /api/sites/names
 * Handles: Fetching only the site names, codes, and locations for dropdowns 
 */
router.get("/names", async (req, res) => {
   try {
        const sites = await prisma.site.findMany({
            select: { id: true, name: true, code: true, location: true}, 
            orderBy: { name: "asc" },        
        });

        res.json({ data: sites });
    } catch (error) {
        console.error("Error fetching site names:", error);
        res.status(500).json({ error: "Failed to fetch site names" });
    }
})

/**
 * PUT /api/users/:id
 * Handles: Updating a user by its ID,
 */
router.put("/:id", requireAuth, requireRole(['ADMIN', 'USER']), async (req, res) => {
    const { id } = req.params;
    
    try {
        const {
            name,
            entity,
            category,
            location,
            budget,
        } = req.body;
        

        const updatedSite = await prisma.site.update({
            where: { id: Number(id) },
            data: {
                name,
                entity,
                category,
                location,
                budget,
            },
        });

        if (!updatedSite) return res.status(404).json({ error: "Site not found" });

        res.json({
            message: "Site updated successfully",
            data: updatedSite,
        });

    } catch (err) {
        console.error("Error updating site:", err);

        if ((err as any)?.code === "P2002") {
            return res.status(400).json({
                error: "Site name is already taken.",
            });
        }

        res.status(500).json({ error: "Failed to update site" });
    }
});

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