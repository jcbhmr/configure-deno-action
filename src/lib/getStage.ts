import * as core from "@actions/core";

export default async function getStage(action: any): "pre" | "main" | "post" {
  const { pre, main, post, "pre-if": preIf, "post-if": postIf } = action;

  if (preIf !== "always()") {
    throw new DOMException("Cannot handle pre-if", "NotSupportedError");
  }

  const nextStage = {
    "": pre,
    pre: "main",
    main: "post",
    post: "",
  };

  const previousStage = core.getState("using-deno:stage") as
    | "pre"
    | "main"
    | "post"
    | "";
  const stage = nextStage[previousStage];

  core.saveState("using-deno:stage", stage);
}
