import { defineMiddleware } from "..";

/**
 * Appends an auth token to the request state, if one exists
 */
export const authToken = () => {
  return defineMiddleware((req) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return;
    }

    const [type, credentials] = authHeader.split(/\s+/);

    // Assuming type == 'Bearer'
    return { token: credentials };
  });
};

const getUserFromToken = async (token: string) => {
  // TODO: Implement
  return { id: "123" };
};

/**
 * Gets a user from a token, otherwise error.
 */
export const isAuthed = () => {
  return defineMiddleware(async (req, state: { token: string }) => {
    const result = getUserFromToken(state.token);

    if (result != null) {
      return { user: result };
    }

    return new Response("Forbidden", {
      status: 401,
    });
  });
};
