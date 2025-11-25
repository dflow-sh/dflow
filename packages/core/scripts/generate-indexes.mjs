import fs from "fs";
import path from "path";

// ALWAYS use the actual current package path
const ROOT = path.resolve(process.cwd());

function generateIndex(dir) {
  const files = fs.readdirSync(dir);

  let exports = [];

  for (const file of files) {
    if (file.startsWith(".")) continue;
    if (file === "index.ts") continue;

    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      generateIndex(full); // recurse
      exports.push(`export * from "./${file}";`);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      const name = file.replace(/\.(ts|tsx)$/, "");
      exports.push(`export * from "./${name}";`);
    }
  }

  fs.writeFileSync(
    path.join(dir, "index.ts"),
    exports.join("\n") + "\n"
  );

  console.log("Generated:", path.join(dir, "index.ts"));
}

// Correct paths
generateIndex(path.join(ROOT, "src"));  // src/*
generateIndex(ROOT);                    // core/*
