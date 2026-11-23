import { createClientFromRequest } from "npm:@base44/sdk";

const CONTRACT_VERSION = "dreamlit.base44-export.v1";
const HELPER_BUILD_ID = "dreamlit-base44-mongo-export-0.1.0";
const PAGE_SIZE = 500;
const PREFLIGHT_DOCUMENT_CAP_PER_ENTITY = 100_000;

// Base44 function name: dreamlit-export-helper
// IMPORTANT: Include EVERY Base44 entity name, including User.
const ENTITIES: string[] = ["BoardTopic", "Chapter", "MockTest", "StudySession", "Task", "User"];

interface RequestBody {
  action?: unknown;
  app_id?: unknown;
  entities?: unknown;
  entity?: unknown;
  skip?: unknown;
  limit?: unknown;
  file_uri?: unknown;
}

interface EntityCount {
  count: number;
  capped: boolean;
}

class RequestError extends Error {}

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(
    { contract_version: CONTRACT_VERSION, ...body },
    {
      status,
      headers: { "cache-control": "no-store, max-age=0" },
    },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new RequestError(field + " is required.");
  }
  return value.trim();
}

function normalizeEntities(value: unknown): string[] {
  const source = value === undefined ? ENTITIES : value;
  if (!Array.isArray(source)) {
    throw new RequestError("entities must be an array of entity names.");
  }

  const entities: string[] = [];
  const seen = new Set<string>();
  for (const candidate of source) {
    if (typeof candidate !== "string") {
      throw new RequestError("Every entity name must be a string.");
    }
    const entity = candidate.trim();
    if (
      !entity ||
      entity.length > 200 ||
      entity.includes("\0") ||
      entity === "__proto__" ||
      entity === "constructor" ||
      entity === "prototype"
    ) {
      throw new RequestError("An entity name is invalid.");
    }
    if (!seen.has(entity)) {
      seen.add(entity);
      entities.push(entity);
    }
  }

  if (entities.length === 0) {
    throw new RequestError("Add at least one entity name to ENTITIES.");
  }
  return entities;
}

async function listEntityPage(
  base44: ReturnType<typeof createClientFromRequest>,
  entity: string,
  limit: number,
  skip: number,
): Promise<Record<string, unknown>[]> {
  const handler = base44.asServiceRole.entities[entity];
  if (!handler || typeof handler.list !== "function") {
    throw new RequestError("The requested entity is not available.");
  }
  const documents = await base44.asServiceRole.entities[entity].list(
    "created_date",
    limit,
    skip,
  );
  if (!Array.isArray(documents)) {
    throw new Error("The entity list response was invalid.");
  }
  return documents as Record<string, unknown>[];
}

async function countEntityDocuments(
  base44: ReturnType<typeof createClientFromRequest>,
  entity: string,
): Promise<EntityCount> {
  let count = 0;
  while (count < PREFLIGHT_DOCUMENT_CAP_PER_ENTITY) {
    const limit = Math.min(
      PAGE_SIZE,
      PREFLIGHT_DOCUMENT_CAP_PER_ENTITY - count,
    );
    const documents = await listEntityPage(base44, entity, limit, count);
    count += documents.length;
    if (documents.length < limit) return { count, capped: false };
  }
  return { count, capped: true };
}

function readStatus(error: unknown): number | null {
  if (!isRecord(error)) return null;
  return typeof error.status === "number"
    ? error.status
    : typeof error.statusCode === "number"
      ? error.statusCode
      : null;
}

Deno.serve(async (req): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ ok: false, error: "Only POST requests are supported." }, 405);
  }

  const configuredSecret = Deno.env.get("EXPORT_SECRET");
  const suppliedSecret = req.headers.get("x-export-secret");
  if (
    !configuredSecret ||
    !suppliedSecret ||
    suppliedSecret !== configuredSecret
  ) {
    return json({ ok: false, error: "The export secret was rejected." }, 403);
  }

  let body: RequestBody;
  try {
    const parsed: unknown = await req.json();
    if (!isRecord(parsed)) throw new RequestError("A JSON object is required.");
    body = parsed;
  } catch (error) {
    const message =
      error instanceof RequestError
        ? error.message
        : "A valid JSON body is required.";
    return json({ ok: false, error: message }, 400);
  }

  let base44: ReturnType<typeof createClientFromRequest> | null = null;
  try {
    base44 = createClientFromRequest(req);
    if (body.action === "ping") {
      return json({ ok: true, helper_build_id: HELPER_BUILD_ID });
    }

    if (body.action === "preflight") {
      const appId = requireString(body.app_id, "app_id");
      const entityNames = normalizeEntities(body.entities);
      const entities: Array<{ name: string; document_count: number }> = [];
      const warnings: string[] = [];

      for (const name of entityNames) {
        const result = await countEntityDocuments(base44, name);
        entities.push({ name, document_count: result.count });
        if (result.capped) {
          warnings.push(
            name +
              " reached the preflight count cap of " +
              PREFLIGHT_DOCUMENT_CAP_PER_ENTITY +
              "; its true document count may be higher.",
          );
        }
      }

      const user = entities.find((entity) => entity.name === "User");
      if (!user) {
        warnings.push(
          "User is not listed. Add User to ENTITIES to include user profiles.",
        );
      }
      return json({
        ok: true,
        app_id: appId,
        app_name: null,
        helper_build_id: HELPER_BUILD_ID,
        entities,
        total_documents: entities.reduce(
          (total, entity) => total + entity.document_count,
          0,
        ),
        user_profiles: {
          present: Boolean(user),
          document_count: user?.document_count ?? 0,
        },
        resource_inventory: null,
        warnings,
      });
    }

    if (body.action === "export_page") {
      const appId = requireString(body.app_id, "app_id");
      const entityNames = normalizeEntities(body.entities);
      const entity = requireString(body.entity, "entity");
      if (!entityNames.includes(entity)) {
        throw new RequestError(
          "The requested entity is not listed in ENTITIES.",
        );
      }
      if (
        !Number.isInteger(body.skip) ||
        typeof body.skip !== "number" ||
        body.skip < 0
      ) {
        throw new RequestError("skip must be a non-negative integer.");
      }
      if (
        !Number.isInteger(body.limit) ||
        typeof body.limit !== "number" ||
        body.limit < 1 ||
        body.limit > PAGE_SIZE
      ) {
        throw new RequestError("limit must be an integer from 1 to 500.");
      }

      const documents = await listEntityPage(
        base44,
        entity,
        body.limit,
        body.skip,
      );
      return json({
        ok: true,
        app_id: appId,
        entity,
        skip: body.skip,
        limit: body.limit,
        documents,
        done: documents.length < body.limit,
      });
    }

    if (body.action === "sign_file") {
      const fileUri = requireString(body.file_uri, "file_uri");
      const result =
        await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: fileUri,
        });
      if (
        !result ||
        typeof result.signed_url !== "string" ||
        !result.signed_url
      ) {
        throw new Error("The signed file response was invalid.");
      }
      return json({ ok: true, signed_url: result.signed_url });
    }

    throw new RequestError("The requested action is not supported.");
  } catch (error) {
    if (error instanceof RequestError) {
      return json({ ok: false, error: error.message }, 400);
    }
    if (readStatus(error) === 429) {
      return new Response(
        JSON.stringify({
          contract_version: CONTRACT_VERSION,
          ok: false,
          error: "Base44 rate limit reached.",
        }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store, max-age=0",
            "retry-after": "1",
          },
        },
      );
    }
    return json(
      { ok: false, error: "The helper could not complete the request." },
      500,
    );
  } finally {
    base44?.cleanup();
  }
});