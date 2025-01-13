import { db } from "@/db"
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator"
import { router } from "@/server/__internals/router"
import { privateProcedure } from "@/server/procedures"
import { parseColor } from "@/utils"
import { startOfMonth } from "date-fns"
import { z } from "zod"

export const categoryRouter = router({
  getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
    const categories = await db.eventCategory.findMany({
      where: { userId: ctx.user.id },
      select: {
        id: true,
        name: true,
        emoji: true,
        color: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    const categoriesWithCounts = await Promise.all(
      categories.map(async (c) => {
        const firstDayOfMonth = startOfMonth(new Date())
        const [uniqueFieldCount, eventsCount, lastPing] = await Promise.all([
          db.event
            .findMany({
              where: {
                EventCategory: { id: c.id },
                createdAt: { gte: firstDayOfMonth },
              },
              select: {
                fields: true,
              },
              distinct: ["fields"],
            })
            .then((events) => {
              const fieldNames = new Set<string>()
              events.forEach((e) =>
                Object.keys(e.fields as object).forEach(fieldNames.add)
              )
              return fieldNames.size
            }),
          db.event.count({
            where: {
              EventCategory: { id: c.id },
              createdAt: { gte: firstDayOfMonth },
            },
          }),
          db.event.findFirst({
            where: { EventCategory: { id: c.id } },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
        ])

        return {
          ...c,
          uniqueFieldCount,
          eventsCount,
          lastPing: lastPing?.createdAt,
        }
      })
    )
    return c.superjson({ categories: categoriesWithCounts })
  }),
  createEventCategory: privateProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        color: z
          .string()
          .min(1, "Color is required")
          .regex(/^#[0-9A-F]{6}$/i, "Invalid color format."),
        emoji: z.string().emoji("Invalid emoji").optional(),
      })
    )
    .mutation(async ({ c, ctx, input }) => {
      const { user } = ctx
      const { color, name, emoji } = input

      // TODO: ADD PAID PLAN LOGIC

      const eventCategory = await db.eventCategory.create({
        data: {
          name: name.toLowerCase(),
          color: parseColor(color),
          emoji,
          userId: user.id,
        },
      })

      return c.json({ eventCategory })
    }),
  deleteCategory: privateProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ c, ctx, input }) => {
      const { name } = input
      await db.eventCategory.delete({
        where: { name_userId: { name, userId: ctx.user.id } },
      })
      return c.json({ success: true })
    }),
})
