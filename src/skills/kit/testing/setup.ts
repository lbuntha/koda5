import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Unmount whatever a test rendered, after every test.
 *
 * Testing Library registers this itself only when Vitest runs with globals on.
 * With explicit imports — which is what the rest of this codebase uses — nothing
 * registers it, and every rendered activity stays in the document: queries then
 * match the *previous* test's buttons, clicks land on a dead tree, and the
 * failure surfaces somewhere unrelated. Cheap to add, very expensive to debug.
 */
afterEach(cleanup);
