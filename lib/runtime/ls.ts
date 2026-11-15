import { defineCommand } from "just-bash/browser";
// just-bash 3.6.0's ls -l uses fixed permission text; read actual metadata here.
export const trainingLs = defineCommand("ls", async (args, ctx) => {
  if (args.includes("--help"))
    return { stdout: "ls [-laAd1] [path ...]\n", stderr: "", exitCode: 0 };
  let long = false,
    all = false,
    directory = false,
    options = true;
  const paths: string[] = [];
  for (const arg of args) {
    if (options && arg === "--") {
      options = false;
      continue;
    }
    if (options && arg.startsWith("-") && arg !== "-") {
      for (const flag of arg.slice(1)) {
        if (flag === "l") long = true;
        else if (flag === "a" || flag === "A") all = true;
        else if (flag === "d") directory = true;
        else if (flag !== "1")
          return { stdout: "", stderr: `ls: 지원 옵션은 -l, -a, -A, -d, -1입니다.\n`, exitCode: 2 };
      }
    } else paths.push(arg);
  }
  let stdout = "",
    stderr = "";
  const line = async (path: string, name: string) => {
    if (!long) return `${name}\n`;
    const st = await ctx.fs.lstat(path);
    const permissions = [0o400, 0o200, 0o100, 0o40, 0o20, 0o10, 0o4, 0o2, 0o1].map((bit, i) =>
      st.mode & bit ? "rwx"[i % 3] : "-",
    );
    if (st.mode & 0o4000) permissions[2] = st.mode & 0o100 ? "s" : "S";
    if (st.mode & 0o2000) permissions[5] = st.mode & 0o10 ? "s" : "S";
    if (st.mode & 0o1000) permissions[8] = st.mode & 0o1 ? "t" : "T";
    return `${st.isDirectory ? "d" : st.isSymbolicLink ? "l" : "-"}${permissions.join("")} 1 student student ${st.size} ${st.mtime.toISOString().slice(0, 10)} ${name}\n`;
  };
  for (const input of paths.length ? paths : ["."]) {
    const path = ctx.fs.resolvePath(ctx.cwd, input);
    try {
      const st = await ctx.fs.lstat(path);
      if (st.isDirectory && !directory) {
        if (paths.length > 1) stdout += `${input}:\n`;
        for (const name of (await ctx.fs.readdir(path)).sort())
          if (all || !name.startsWith("."))
            stdout += await line(ctx.fs.resolvePath(path, name), name);
      } else stdout += await line(path, input);
    } catch {
      stderr += `ls: ${input}: 파일 또는 디렉터리를 찾을 수 없습니다.\n`;
    }
  }
  return { stdout, stderr, exitCode: stderr ? 2 : 0 };
});
