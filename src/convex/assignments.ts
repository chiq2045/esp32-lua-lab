import { v } from 'convex/values';
import { query, internalMutation } from './_generated/server';

// Students can see published assignments.
export const listPublished = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query('assignments')
			.withIndex('by_status', (q) => q.eq('status', 'published'))
			.collect();
	}
});

// Students can open a published assignment.
export const getPublished = query({
	args: {
		id: v.id('assignments')
	},
	handler: async (ctx, args) => {
		const assignment = await ctx.db.get(args.id);

		if (!assignment || assignment.status !== 'published') {
			return null;
		}

		return assignment;
	}
});

// Internal: create a new assignment.
export const create = internalMutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		markdown: v.string()
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		return await ctx.db.insert('assignments', {
			title: args.title,
			description: args.description,
			markdown: args.markdown,
			status: 'draft',
			createdAt: now,
			updatedAt: now
		});
	}
});

// Internal: edit assignment content.
export const update = internalMutation({
	args: {
		id: v.id('assignments'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		markdown: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, ...changes } = args;

		const assignment = await ctx.db.get(id);

		if (!assignment) {
			throw new Error('Assignment not found');
		}

		await ctx.db.patch(id, {
			...changes,
			updatedAt: Date.now()
		});
	}
});

// Internal: publish or unpublish.
export const setStatus = internalMutation({
	args: {
		id: v.id('assignments'),
		status: v.union(v.literal('draft'), v.literal('published'))
	},
	handler: async (ctx, args) => {
		const assignment = await ctx.db.get(args.id);

		if (!assignment) {
			throw new Error('Assignment not found');
		}

		await ctx.db.patch(args.id, {
			status: args.status,
			updatedAt: Date.now()
		});
	}
});

// Internal: delete an assignment.
export const remove = internalMutation({
	args: {
		id: v.id('assignments')
	},
	handler: async (ctx, args) => {
		const assignment = await ctx.db.get(args.id);

		if (!assignment) {
			throw new Error('Assignment not found');
		}

		await ctx.db.delete(args.id);
	}
});
