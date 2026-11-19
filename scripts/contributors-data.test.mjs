// Replays scripts/contributors-data.mjs against a stand-in for GitHub's GraphQL API, without network: this file is
// both the test and, imported with CONTRIBUTORS_FIXTURE set, the fetch stand-in for the script's process.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixture = process.env.CONTRIBUTORS_FIXTURE;

if (fixture) {
  // One fork pull request, opened before the fork's cutoff (2026-11-16T01:32:48Z) and reviewed by `reviewer`.
  // "open": it is still open. "merged": it was merged after the cutoff, so it earns no pull request credit.
  const user = (n) => ({ __typename: "User", login: `person${n}`, id: `U_${n}`, databaseId: n });
  const none = { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] };
  const merged = fixture === "merged";
  const pr = {
    id: "PR_1",
    number: 1,
    createdAt: "2026-11-10T00:00:00Z",
    updatedAt: new Date().toISOString(),
    mergedAt: merged ? "2026-11-17T00:00:00Z" : null,
    author: user(1),
    mergeCommit: merged
      ? { id: "C_1", oid: "a".repeat(40), parents: { totalCount: 1 }, authors: { ...none, nodes: [{ user: user(1) }] } }
      : null,
    commits: none,
    reviews: { ...none, nodes: [{ author: user(2) }] },
  };
  const page = (nodes) => ({ repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } } });
  globalThis.fetch = async (_url, { body }) => {
    const { query, variables } = JSON.parse(body);
    const fork = variables?.owner === "arismoko";
    let data;
    if (query.includes("states: [MERGED]")) data = page(fork && merged ? [pr] : []);
    else if (query.includes("states: [OPEN, CLOSED]")) data = page(fork && !merged ? [pr] : []);
    else if (query.includes("nodes(ids:")) data = { nodes: variables.ids.map((id) => ({ login: `person${id.slice(2)}`, databaseId: Number(id.slice(2)) })) };
    else if (query.includes("search(")) {
      // GitHub's search: person2 reviewed one fork pull request opened before the cutoff, whatever its state.
      data = Object.fromEntries(
        [...query.matchAll(/(r\d+): search\(query: "([^"]*)"/g)].map(([, alias, q]) => [
          alias,
          { issueCount: q.includes("repo:arismoko/horizon") && q.includes("reviewed-by:person2 ") ? 1 : 0 },
        ]),
      );
    } else throw new Error(`unexpected query: ${query.slice(0, 80)}`);
    data.rateLimit = { cost: 1, remaining: 5000, resetAt: new Date(Date.now() + 3_600_000).toISOString() };
    return new Response(JSON.stringify({ data }), { headers: { "x-ratelimit-remaining": "4999" } });
  };
} else {
  const { test } = await import("node:test");
  const script = fileURLToPath(new URL("./contributors-data.mjs", import.meta.url));
  const run = (dir, state) => {
    const result = spawnSync(process.execPath, ["--import", import.meta.url, script, dir], {
      env: { ...process.env, GITHUB_TOKEN: "test", CONTRIBUTORS_FIXTURE: state },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(readFileSync(join(dir, "contributors.json"), "utf8")).contributors;
  };

  test("a fork pull request opened before the cutoff and merged after it keeps its reviewer, warm or fresh", (t) => {
    const warm = mkdtempSync(join(tmpdir(), "contributors-warm-"));
    const fresh = mkdtempSync(join(tmpdir(), "contributors-fresh-"));
    t.after(() => [warm, fresh].forEach((dir) => rmSync(dir, { recursive: true, force: true })));
    const expected = [{ login: "person2", avatarUrl: "https://avatars.githubusercontent.com/u/2?v=4", prs: 0, reviews: 1 }];
    assert.deepEqual(run(warm, "open"), expected);
    assert.deepEqual(run(warm, "merged"), expected);
    assert.deepEqual(run(fresh, "merged"), expected);
  });
}
