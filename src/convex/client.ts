import { ConvexClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL as url } from '$app/env/public';

if (!url) {
	throw new Error('Missing VITE_CONVEX_URL');
}

export const convex = new ConvexClient(url);
