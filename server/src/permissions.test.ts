import { test } from "node:test";
import assert from "node:assert/strict";
import { User } from "@tracker/shared";
import { canSetStatus } from "./permissions";

const user = (userName: string, role: User["role"]): User => ({
  userName,
  displayName: userName,
  role,
});

test("an editor changes the status from draft to published", () => {
  assert.equal(
    canSetStatus(user("emma", "editor"), "Draft", "Published"),
    true,
  );
});

test("a contributor is rejected when trying to change the status from draft to published", () => {
  assert.equal(
    canSetStatus(user("jonas", "contributor"), "Draft", "Published"),
    false,
  );
});

test("a contributor is rejected when trying to change the status from published to draft", () => {
  assert.equal(
    canSetStatus(user("jonas", "contributor"), "Published", "Draft"),
    false,
  );
});

test("an editor changes the status from published to draft", () => {
  assert.equal(
    canSetStatus(user("emma", "editor"), "Published", "Draft"),
    true,
  );
});

test("an editor changes the status from idea to draft", () => {
  assert.equal(canSetStatus(user("emma", "editor"), "Idea", "Draft"), true);
});

test("a contributor changes the status from idea to draft", () => {
  assert.equal(
    canSetStatus(user("jonas", "contributor"), "Idea", "Draft"),
    true,
  );
});
