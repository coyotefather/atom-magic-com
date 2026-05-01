/**
 * Users.ts
 *
 * Payload CMS collection config for Users — the admin accounts that can
 * log in to the Payload admin panel and manage content.
 *
 * What a User is:
 *   Users are CMS editors with access to the Payload admin panel at `/admin`.
 *   They can create, edit, and delete all other collection documents. There is
 *   no public user registration — accounts are created only by other admins.
 *
 *   Users are also referenced by the Entries collection's `author` field, so
 *   you can track which editor wrote each Codex article.
 *
 * Authentication:
 *   `auth: true` tells Payload to treat this as the authentication collection.
 *   Payload automatically adds `email`, `password`, and session management fields.
 *   These built-in auth fields are NOT listed in the `fields` array — only
 *   additional custom fields (like `name`) go there.
 *
 *   Login: POST to `/api/users/login` with `{ email, password }`
 *   The Payload admin panel handles login automatically.
 *
 * Fields (beyond the built-in auth fields):
 *   - `name` — The user's display name, shown in the admin panel and optionally
 *              on published content
 *
 * Access control (intentionally restrictive):
 *   - Read:   Only authenticated users can read the user list. Users cannot see
 *             each other's accounts from the public API.
 *   - Create: Disabled entirely — new users cannot self-register. New accounts
 *             must be created via the Payload admin panel by a logged-in admin.
 *   - Update: Users can only update their OWN account (`req.user?.id === id`).
 *             One admin cannot modify another admin's account through the API.
 *   - Delete: Any authenticated user can delete user accounts. (This is intentionally
 *             permissive for a single-admin setup — revisit if multiple editors are added.)
 */

import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only logged-in users can view the users list
    read: ({ req }) => Boolean(req.user),
    // No public registration — accounts are created via admin panel only
    create: () => false,
    // Users can only update their own account
    update: ({ req, id }) => req.user?.id === id,
    delete: ({ req }) => Boolean(req.user),
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
  ],
}
