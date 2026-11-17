import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	assignments: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		markdown: v.string(),

		status: v.union(v.literal('draft'), v.literal('published')),

		// Optional starter project for students
		starterProject: v.optional(
			v.object({
				version: v.literal(1),
				id: v.string(),
				name: v.string(),
				code: v.string(),

				components: v.array(
					v.object({
						id: v.string(),
						type: v.union(v.literal('led'), v.literal('button')),
						name: v.string(),
						x: v.number(),
						y: v.number(),
						pin: v.optional(v.number()),
						color: v.optional(v.string())
					})
				),

				// Replace with your exact CircuitWire structure
				// once we confirm its fields.
				wires: v.array(v.any()),

				wiringMode: v.union(v.literal('auto'), v.literal('manual')),
				updatedAt: v.number()
			})
		),

		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_status', ['status'])
		.index('by_updated_at', ['updatedAt'])
});
