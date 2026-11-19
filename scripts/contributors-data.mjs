// Builds contributors.json for the home page and the hub: per person, the merged pull requests they worked on plus
// the pull requests of other people they reviewed, in horizon-rust/horizon and in the mod fork (arismoko/horizon)
// before the mod API merge. The contributors-data workflow runs it every six hours on the contributors-data branch.
//
//   GITHUB_TOKEN=… node scripts/contributors-data.mjs <dir>
//
// <dir> holds prs.json (the per-PR cache this script keeps) and contributors.json (what the site reads). Both are
// written only when the list or the cache's pull requests changed, and only after every request succeeded: a failed
// run leaves the last good files as they were.
//
// A person is credited once per merged pull request when they are its author, an author or co-author of its merge
// commit (squash merges carry the branch's Co-authored-by trailers there), or an author or co-author of one of its
// own commits. Commits with two or more parents earn nothing: merging main into a branch is not work on it, and the
// merge commit of a pull request merged that way is authored by whoever pressed the button. A commit earns credit only
// in the first merged pull request that contains it, by merge time across both repositories.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Bumped whenever the cache's format or the counting changes: a cache with another value is discarded and rebuilt.
const RULE = "merged-prs-with-coauthors+reviews/3";
const MAIN = "horizon-rust/horizon";
const FORK = "arismoko/horizon";
// The mod API reached main through one merge (#16941, landed as #17145); the fork's work after it doesn't count.
const FORK_CUTOFF = "2026-11-16T01:32:48Z";

// Accounts that are agents or automation but have the GitHub type User, so the Bot check misses them. Only clear
// agents and services belong here, never a person.
const NOT_PEOPLE = new Set([
  "cairn-code", // "Agent built by @cairn"
  "claude", // Anthropic's Claude (Co-authored-by trailers)
  "codebuff-team", // Codebuff, an AI coding agent
  "codesmith-bot", // Codesmith <codesmith-bot@users.noreply.github.com>, an AI coding agent
  "codex", // OpenAI's Codex
  "cognition-team", // Devin <devin@cognition.ai>
  "copilot", // GitHub Copilot's coding agent
  "cursoragent", // Cursor's agent
  "dyna", // Dyna <dyna@users.noreply.github.com>, a placeholder address that resolves to an unrelated account
  "fo-agent", // an agent account
  "horizon", // Horizon <horizon@users.noreply.github.com>, the fork's sync tooling; resolves to an unrelated account
  "monkeycode-ai", // MonkeyCode, an AI coding agent
  "noreply", // matched by noreply@ addresses
  "pi-mono", // pi coding agent <noreply@pi.dev>
]);

const dir = process.argv[2];
const token = process.env.GITHUB_TOKEN;
if (!dir || !token) {
  console.error("usage: GITHUB_TOKEN=… node scripts/contributors-data.mjs <dir>");
  process.exit(2);
}

let requests = 0;
let points = 0;

// `missingNodes`: errors about node IDs that no longer resolve (a deleted account) are expected, not a failure.
async function graphql(query, variables = {}, { missingNodes = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      requests++;
      res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.replace(/\}\s*$/, " rateLimit { cost remaining resetAt } }"), variables }),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      if (attempt < 4) {
        console.log(`GraphQL request failed (${error.message}), trying again`);
        await sleep(10_000 * attempt);
        continue;
      }
      throw error;
    }
    // Out of points (other requests on the same token can use them up between our checks): wait for the reset and
    // send the same query again.
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    if (res.headers.get("x-ratelimit-remaining") === "0" && reset) {
      console.log(`Rate limit reached, waiting ${Math.ceil((reset * 1000 - Date.now()) / 60_000)} min for it to reset`);
      await sleep(reset * 1000 - Date.now() + 5_000);
      attempt--;
      continue;
    }
    // GitHub answers a heavy query with 502 now and then; the same query usually goes through on a second try.
    if ((res.status >= 500 || res.status === 403 || res.status === 429) && attempt < 4) {
      const retryAfter = Number(res.headers.get("retry-after")) || 0;
      console.log(`GraphQL answered ${res.status}, trying again`);
      await sleep(Math.max(retryAfter * 1000, 15_000 * attempt));
      continue;
    }
    if (!res.ok) throw new Error(`GraphQL: ${res.status} ${await res.text()}`);
    const { data, errors } = await res.json();
    const failures = (errors ?? []).filter((e) => !(missingNodes && e.type === "NOT_FOUND" && e.path?.[0] === "nodes"));
    if (failures.length || !data) throw new Error(`GraphQL: ${failures[0]?.message ?? "no data"}`);
    const { cost, remaining, resetAt } = data.rateLimit;
    points += cost;
    // The workflow's token gets about 1,000 points an hour, less than the first full run needs: wait for the reset.
    if (remaining < 200) {
      const wait = Date.parse(resetAt) - Date.now() + 5_000;
      console.log(`${remaining} points left, waiting ${Math.ceil(wait / 60_000)} min for the rate limit to reset`);
      await sleep(wait);
    }
    return data;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

const isPerson = (login, type = "User") =>
  !!login && type === "User" && !login.endsWith("[bot]") && !NOT_PEOPLE.has(login.toLowerCase());

const USER = "id login databaseId";

const AUTHORS = `authors(first: 10) { pageInfo { hasNextPage endCursor } nodes { user { ${USER} } } }`;
const COMMITS = (n) =>
  `commits(first: ${n}${n === 100 ? ", after: $after" : ""}) { pageInfo { hasNextPage endCursor } nodes { commit { id oid parents { totalCount } ${AUTHORS} } } }`;
const REVIEWS = (after) =>
  `reviews(first: ${after ? 100 : 30}${after ? ", after: $after" : ""}) { pageInfo { hasNextPage endCursor } nodes { author { __typename login ... on User { id databaseId } } } }`;

// People are kept by their GitHub account ID (databaseId), which a rename doesn't change, with the node ID that
// reads their current login back each run. Returns the account ID, or undefined for a bot, an agent or no account.
let users = {};
const remember = (user, type = "User") => {
  if (!user?.databaseId || !isPerson(user.login, type)) return undefined;
  users[user.databaseId] = { login: user.login, node: user.id };
  return user.databaseId;
};

async function commitAuthors(commit) {
  const people = commit.authors.nodes.map((a) => remember(a.user));
  let page = commit.authors.pageInfo;
  while (page.hasNextPage) {
    const data = await graphql(
      `query($id: ID!, $after: String) { node(id: $id) { ... on Commit { authors(first: 100, after: $after) { pageInfo { hasNextPage endCursor } nodes { user { ${USER} } } } } }`,
      { id: commit.id, after: page.endCursor },
    );
    people.push(...data.node.authors.nodes.map((a) => remember(a.user)));
    page = data.node.authors.pageInfo;
  }
  return people.filter(Boolean);
}

const stats = { mergerOnly: { [MAIN]: 0, [FORK]: 0 }, repeated: { [MAIN]: 0, [FORK]: 0 } };

// One merged pull request: { a: its author, t: when it merged, k: its single-parent commits (the merge commit of a
// squash merge included) as [sha, ...people], r: its reviewers }, people as account IDs. Which commits earn credit here is decided later,
// across every pull request (see `credit`).
async function mergedPr(repo, pr) {
  const author = remember(pr.author, pr.author?.__typename);
  const commitList = [];
  const credited = new Set();
  const add = async (commit) => {
    const people = [...new Set(await commitAuthors(commit))].sort((a, b) => a - b);
    people.forEach((l) => credited.add(l));
    if (people.length) commitList.push([commit.oid, ...people]);
  };
  let mergers = [];
  if (pr.mergeCommit) {
    if (pr.mergeCommit.parents.totalCount < 2) await add(pr.mergeCommit);
    else mergers = await commitAuthors(pr.mergeCommit);
  }
  let commits = pr.commits;
  for (;;) {
    for (const { commit } of commits.nodes) if (commit.parents.totalCount < 2) await add(commit);
    if (!commits.pageInfo.hasNextPage) break;
    const data = await graphql(`query($id: ID!, $after: String) { node(id: $id) { ... on PullRequest { ${COMMITS(100)} } } }`, {
      id: pr.id,
      after: commits.pageInfo.endCursor,
    });
    commits = data.node.commits;
  }
  if (mergers.some((l) => l !== author && !credited.has(l))) stats.mergerOnly[repo]++;
  return { a: author, t: pr.mergedAt, k: commitList, r: await reviewers(pr) };
}

async function reviewers(pr) {
  const people = new Set();
  let reviews = pr.reviews;
  for (;;) {
    for (const { author } of reviews.nodes) {
      const id = remember(author, author?.__typename);
      if (id) people.add(id);
    }
    if (!reviews.pageInfo.hasNextPage) break;
    const data = await graphql(`query($id: ID!, $after: String) { node(id: $id) { ... on PullRequest { ${REVIEWS(true)} } } }`, {
      id: pr.id,
      after: reviews.pageInfo.endCursor,
    });
    reviews = data.node.reviews;
  }
  return [...people].sort((a, b) => a - b);
}

// Pages of a repository's pull requests updated since `since` (all of them without it), newest update first. A pull
// request updated during the walk can move ahead of the cursor and be missed; the next run starts an hour before
// this one did, so it picks it up then.
async function* pullRequests(repo, states, fields, since) {
  const [owner, name] = repo.split("/");
  let after = null;
  let seen = 0;
  for (;;) {
    const data = await graphql(
      `query($owner: String!, $name: String!, $after: String) { repository(owner: $owner, name: $name) {
        pullRequests(states: [${states}], first: 50, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }) {
          pageInfo { hasNextPage endCursor } nodes { id number createdAt updatedAt mergedAt author { __typename login ... on User { id databaseId } } ${fields} } } } }`,
      { owner, name, after },
    );
    const page = data.repository.pullRequests;
    const nodes = page.nodes.filter((pr) => !since || pr.updatedAt >= since);
    if (nodes.length) yield nodes;
    seen += nodes.length;
    if (process.env.DEBUG || seen % 1000 < 50) console.log(`${repo} ${states}: ${seen} pull requests read`);
    if (nodes.length < page.nodes.length || !page.pageInfo.hasNextPage) return;
    after = page.pageInfo.endCursor;
  }
}

// Runs `task` over `items`, eight at a time: the follow-up requests of one page (long branches, many reviews).
async function eachLimited(items, task) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await task(items[next++]);
  };
  await Promise.all(Array.from({ length: 8 }, worker));
}

const MERGED_FIELDS = `mergeCommit { id oid parents { totalCount } ${AUTHORS} } ${COMMITS(10)} ${REVIEWS(false)}`;

// The merged pull requests (`merged`) and the reviewers of the others (`other`) of one repository.
async function walk(repo, part, since, before) {
  for await (const page of pullRequests(repo, "MERGED", MERGED_FIELDS, since)) {
    await eachLimited(
      page.filter((pr) => !before || pr.mergedAt < before),
      async (pr) => (part.merged[pr.number] = await mergedPr(repo, pr)),
    );
  }
  for await (const page of pullRequests(repo, "OPEN, CLOSED", REVIEWS(false), since)) {
    await eachLimited(
      page.filter((pr) => !before || pr.createdAt < before),
      async (pr) => {
        const r = await reviewers(pr);
        if (r.length) part.other[pr.number] = r;
        else delete part.other[pr.number];
      },
    );
  }
}

// The number of pull requests (any state) in `scope` that each person reviewed without being their author, by account
// ID: GitHub's search under their current login, ten people per request, four requests at a time.
async function reviewCounts(people, scope) {
  const counts = {};
  const chunks = [];
  for (let i = 0; i < people.length; i += 10) chunks.push(people.slice(i, i + 10));
  for (let i = 0; i < chunks.length; i += 4) {
    await Promise.all(
      chunks.slice(i, i + 4).map(async (chunk) => {
        const fields = chunk.map((id, j) => {
          const login = users[id].login;
          return `r${j}: search(query: ${JSON.stringify(`${scope} is:pr reviewed-by:${login} -author:${login}`)}, type: ISSUE, first: 0) { issueCount }`;
        });
        const data = await graphql(`query { ${fields.join(" ")} }`);
        chunk.forEach((id, j) => (counts[id] = data[`r${j}`].issueCount));
      }),
    );
  }
  return counts;
}

// Reads every known person's current login, so a rename shows the same way whether the cache is old or fresh. An
// account that no longer exists is dropped, as a fresh run would never see it.
async function refreshLogins() {
  const known = Object.keys(users);
  for (let i = 0; i < known.length; i += 100) {
    const chunk = known.slice(i, i + 100);
    const data = await graphql(`query($ids: [ID!]!) { nodes(ids: $ids) { ... on User { login databaseId } } }`, {
      ids: chunk.map((id) => users[id].node),
    }, { missingNodes: true });
    chunk.forEach((id, j) => {
      const user = data.nodes[j];
      if (user?.databaseId === Number(id)) users[id].login = user.login;
      else delete users[id];
    });
  }
}

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
};

const started = Date.now();
const cachePath = join(dir, "prs.json");
const outPath = join(dir, "contributors.json");
const empty = () => ({ merged: {}, other: {} });
const old = await readJson(cachePath);
const cache = old?.rule === RULE ? old : { rule: RULE, since: null, users: {}, main: empty(), fork: empty() };
const before = JSON.stringify({ ...old, since: null });
users = cache.users;

// Both repositories are read the same way, fresh or from the cache, so the result doesn't depend on when the cache
// was started: only pull requests updated since the last run are read again (the fork's limited to those merged or
// opened before the cutoff), and everyone's reviews are counted again each run. Start the next run an hour before
// this one started, so pull requests updated during the walk aren't missed.
const nextSince = new Date(started - 3_600_000).toISOString().replace(/\.\d+Z$/, "Z");
await walk(MAIN, cache.main, cache.since);
await walk(FORK, cache.fork, cache.since, FORK_CUTOFF);
cache.since = nextSince;
await refreshLogins();

const reviewersOf = (part) =>
  [...new Set([...Object.values(part.merged).flatMap((p) => p.r), ...Object.values(part.other).flat()])].filter((id) => users[id]);
const mainReviews = await reviewCounts(reviewersOf(cache.main), `repo:${MAIN}`);
const forkReviews = await reviewCounts(reviewersOf(cache.fork), `repo:${FORK} created:<${FORK_CUTOFF}`);

// Who each merged pull request credits: its author, and the people of each of its commits for which it is the first
// merged pull request (main's and the fork's together, by merge time) to contain that commit. A branch that carries
// commits merged before (a fork's sync with main, a branch cut from a stale one) earns nothing for them; fork commits
// that reached main later through the mod API merge count for the fork pull request that brought them.
function credit() {
  const prs = [
    ...Object.entries(cache.main.merged).map(([n, pr]) => ({ repo: MAIN, n: Number(n), pr })),
    ...Object.entries(cache.fork.merged).map(([n, pr]) => ({ repo: FORK, n: Number(n), pr })),
  ].sort((a, b) => (a.pr.t < b.pr.t ? -1 : a.pr.t > b.pr.t ? 1 : a.repo === b.repo ? a.n - b.n : a.repo === FORK ? -1 : 1));
  const seen = new Set();
  for (const entry of prs) {
    entry.credited = new Set(entry.pr.a ? [entry.pr.a] : []);
    entry.repeated = new Set();
    for (const [commit, ...people] of entry.pr.k) {
      if (seen.has(commit)) people.forEach((l) => entry.repeated.add(l));
      else {
        seen.add(commit);
        people.forEach((l) => entry.credited.add(l));
      }
    }
    // Only what the rule took away: people with no first commit in this pull request and not its author.
    stats.repeated[entry.repo] += [...entry.repeated].filter((l) => !entry.credited.has(l)).length;
  }
  return prs;
}

// One card per account, under its current login.
const people = new Map();
const person = (id) => {
  if (!people.has(id)) people.set(id, { id, prs: 0, reviews: 0 });
  return people.get(id);
};
for (const { credited } of credit()) for (const id of credited) person(Number(id)).prs++;
for (const counts of [mainReviews, forkReviews]) {
  for (const [id, n] of Object.entries(counts)) if (n > 0) person(Number(id)).reviews += n;
}
const contributors = [...people.values()]
  .filter((p) => users[p.id] && isPerson(users[p.id].login))
  .map((p) => ({ login: users[p.id].login, avatarUrl: `https://avatars.githubusercontent.com/u/${p.id}?v=4`, prs: p.prs, reviews: p.reviews }))
  .sort((a, b) => b.prs + b.reviews - (a.prs + a.reviews) || a.login.localeCompare(b.login));

const previous = await readJson(outPath);
const cacheChanged = before !== JSON.stringify({ ...cache, since: null });
const listChanged = previous?.rule !== RULE || JSON.stringify(previous.contributors) !== JSON.stringify(contributors);
await mkdir(dir, { recursive: true });
if (listChanged) {
  await writeFile(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), rule: RULE, contributors }, null, 1)}\n`);
}
if (listChanged || cacheChanged) await writeFile(cachePath, `${JSON.stringify(cache)}\n`);

console.log(
  `${contributors.length} people, ${Object.keys(cache.main.merged).length} merged PRs in ${MAIN}, ` +
    `${Object.keys(cache.fork.merged).length} in ${FORK}; ${requests} requests, ${points} points, ` +
    `${Math.round((Date.now() - started) / 1000)} s; merge-commit-only credits left out this run: ` +
    `${stats.mergerOnly[MAIN]} (${MAIN}), ${stats.mergerOnly[FORK]} (${FORK}); credits left out for commits an ` +
    `earlier pull request had: ${stats.repeated[MAIN]} (${MAIN}), ${stats.repeated[FORK]} (${FORK}); ` +
    `${listChanged ? "list changed" : "list unchanged"}`,
);
