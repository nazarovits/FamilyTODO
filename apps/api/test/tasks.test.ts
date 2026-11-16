import assert from "node:assert/strict";
import { once } from "node:events";
import { after, test } from "node:test";
import { TaskPriority, UserRole } from "@familytodo/shared-types";
import { createTaskRequestSchema } from "../src/schemas/tasks.js";
import { canAssignTask } from "../src/services/tasks/assignment-policy.js";

const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:5432/test";
const { app } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");
if (originalDatabaseUrl === undefined) {
  delete process.env.DATABASE_URL;
} else {
  process.env.DATABASE_URL = originalDatabaseUrl;
}

const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
if (!address || typeof address === "string") {
  throw new Error("The API test server failed to start.");
}
const testServerUrl = `http://127.0.0.1:${address.port}`;

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
  await prisma.$disconnect();
});

test("parents can assign tasks to any profiled user", () => {
  assert.equal(
    canAssignTask("parent-1", UserRole.Parent, "child-1", UserRole.Child),
    true,
  );
});

test("children can assign tasks to themselves or a parent only", () => {
  assert.equal(
    canAssignTask("child-1", UserRole.Child, "child-1", UserRole.Child),
    true,
  );
  assert.equal(
    canAssignTask("child-1", UserRole.Child, "parent-1", UserRole.Parent),
    true,
  );
  assert.equal(
    canAssignTask("child-1", UserRole.Child, "child-2", UserRole.Child),
    false,
  );
});

test("task request validation trims titles and accepts optional fields", () => {
  const result = createTaskRequestSchema.safeParse({
    title: "  Feed the cat  ",
    assigneeId: "00000000-0000-4000-8000-000000000001",
    priority: TaskPriority.High,
    dueAt: "2026-11-16T08:30:00Z",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.title, "Feed the cat");
  }
});

test("task request validation rejects invalid fields and server-owned fields", () => {
  const invalidRequests = [
    {
      title: "   ",
      assigneeId: "00000000-0000-4000-8000-000000000001",
    },
    {
      title: "Feed the cat",
      assigneeId: "00000000-0000-4000-8000-000000000001",
      estimateMinutes: 0,
    },
    {
      title: "Feed the cat",
      assigneeId: "00000000-0000-4000-8000-000000000001",
      createdById: "00000000-0000-4000-8000-000000000002",
      status: "DONE",
    },
    {
      title: "Feed the cat",
      assigneeId: "00000000-0000-4000-8000-000000000001",
      dueAt: "2026-11-16T08:30:00",
    },
  ];

  for (const request of invalidRequests) {
    assert.equal(createTaskRequestSchema.safeParse(request).success, false);
  }
});

test("task endpoints require authentication", async () => {
  const assigneesResponse = await fetch(`${testServerUrl}/api/tasks/assignees`);
  assert.equal(assigneesResponse.status, 401);
  assert.deepEqual(await assigneesResponse.json(), {
    error: {
      code: "UNAUTHENTICATED",
      message: "Authentication is required.",
    },
  });

  const createResponse = await fetch(`${testServerUrl}/api/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Test", assigneeId: "invalid" }),
  });
  assert.equal(createResponse.status, 401);
  assert.deepEqual(await createResponse.json(), {
    error: {
      code: "UNAUTHENTICATED",
      message: "Authentication is required.",
    },
  });
});
