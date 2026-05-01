import express from "express";
import { prisma } from "../../lib/prisma.ts";
import { requireAuth, requireRole, requireVerified } from "../middleware/auth.ts";

const router = express.Router();

/**
 * GET /api/users
 * Handles: 
 * - Regular List (Pagination)
 * - Search (name/email)
 * - Refine useMany (filtering by multiple ?id=1&id=2)
 */

// Get all Users with optional search, filtering and pagination
router.get("/", requireAuth, requireVerified, async (req, res) => {
    const { 
        id, 
        page = 1, 
        limit = 10,
        search = '',
        _sort = 'createdAt', 
        _order = 'desc' 
    } = req.query;
    

 
    // HANDLE REGULAR LIST (Pagination) 
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const take = parseInt(String(limit));   

    // Construct the filter object
    const where = {
        // Handle the search logic
        ...(search && {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' as const} },
              { site: { name: { contains: String(search), mode: 'insensitive' as const } } }
            ],
        }),
        
    };

    const orderBy = {
        [String(_sort)]: String(_order).toLowerCase() === 'asc' ? 'asc' : 'desc'
    };

    try {
        const [users, totalCount] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip,
            take,
            orderBy,
        }),
            prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / take);

        res.json({
            data: users,
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
 * DELETE /api/users/:id
 * Handles: Deleting a user by its ID,
 */
router.delete("/:id", requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await prisma.user.delete({
            where: { id: Number(id) },
            include: { site: true } // Include relation for the detail view
        });

        if (!deletedUser) return res.status(404).json({ error: "User not found" });

        res.json({
            message: "User deleted successfully",
            data: deletedUser,
        });

    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;