/** A server route's `ANY` handler: refuse methods the route does not serve, as Next.js route handlers did. */
export const methodNotAllowed = (allow: string) => () => new Response(null, { status: 405, headers: { Allow: allow } });
