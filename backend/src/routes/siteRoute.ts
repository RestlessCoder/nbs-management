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
        _order = 'desc',
        //favorited = false, // Add query to filter by favorites
    } = req.query;
    
    // HANDLE useMany (Filtering by ID) 
    if (id) {
        // Convert to array in case Refine sends multiple: ?id=3&id=4
        const idArray = Array.isArray(id) 
            ? id.map(val => parseInt(String(val))) 
            : [parseInt(String(id))];

        const sites = await prisma.site.findMany({
            where: {
                id: { in: idArray },
                //...(favorited && { favoritedBy: { some: { userId: req.user?.id } } }),
            },
            // This pulls and include in the related assets array
            include: { assets: true, favoritedBy: true },
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
        // Only return favorited sites if ?favorited=true is set
        //...(favorited && { favoritedBy: { some: { userId: req.user?.id } } }),
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
            include: { favoritedBy: true }
        }),
            prisma.site.count({ where }),
        ]);

        // Add isFavorited flag to each site based on the current user's favorites
        const sitesWithFlag = sites.map(site => ({
            ...site,
            isFavorited: site.favoritedBy.some(fav => fav.userId === req.user?.id),
        }));

        const totalPages = Math.ceil(totalCount / take);

        res.json({
            data: sitesWithFlag,
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
 * GET /api/sites/favourites
 * Handles: Fetching all favorited sites for the authenticated user
 */
router.get("/favourites", requireAuth, async (req, res) => {
    const sites = await prisma.site.findMany({
        where: { favoritedBy: { some: { userId: req.user?.id } } },
        include: { assets: true, favoritedBy: true },
        orderBy: { createdAt: "desc" },
    });

    // Add isFavorited flag to each site based on the current user's favorites
    const sitesUserFlag = sites.map(site => ({
        ...site,
        isFavorited: site.favoritedBy.some(fav => fav.userId === req.user?.id),
    }));

    res.json({ data: sitesUserFlag });
  
});

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
 * PUT /api/sites/:id
 * Handles: Updating a site by its ID,
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


/**
 * POST /api/sites/favorites/toggle
 * Expects { siteId: number } in the body
 */
router.post("/favorites/toggle", requireAuth, async (req, res) => {
    try {
        const { siteId } = req.body;
        const userId = req.user?.id; 

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // 1. Check if it's already a favorite
        const existingFavorite = await prisma.userFavoriteSite.findUnique({
            where: {
                userId_siteId: {
                    userId: userId,
                    siteId: Number(siteId),
                },
            },
        });

        if (existingFavorite) {
            // 2. If it exists, remove it (unfavorite)
            await prisma.userFavoriteSite.delete({
                where: { id: existingFavorite.id },
            });
            return res.json({ data: { message: "Removed from favorites", isFavorite: false } });
        } else {
            // 3. If it doesn't exist, create it
            await prisma.userFavoriteSite.create({
                data: {
                    userId: userId,
                    siteId: Number(siteId),
                },
            });
            
            return res.json({ data: { message: "Added to favorites", isFavorite: true } });
        }
    } catch (err) {
        console.error("Favorite Error:", err);
        return res.status(500).json({ error: "Failed to update favorite status" });
    }
});


export default router;