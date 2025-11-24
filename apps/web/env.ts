import { keys as core } from "@dflow/core/keys";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  extends: [
    core(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
