import fs from "fs";
import { Utils } from "./Utils.js";

class Engine extends Utils {
  private option: Record<string, unknown> = {};

  private directives = {
    inertia: /@inertia/,
    vite: /@vite\s*\(\[\s*(?<resource>[^\]]*?)\s*\]\)/,
    viteReactRefresh: /@viteReactRefresh/,
  };

  private inertia(
    content: string,
    match: RegExpMatchArray,
    param: Record<string, unknown> = this.option,
  ) {
    const json = JSON.stringify(param.inertia)
      .replace(/&/g, "\\u0026")
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e");

    const ssrBody =
      typeof param.ssrBody === "string" && param.ssrBody.length > 0
        ? param.ssrBody
        : "";

    const clientBootstrap = `<script data-page="app" type="application/json">${json}<\/script>`;
    const appShell = ssrBody
      ? `<div id="app">${ssrBody}</div>`
      : `<div id="app"></div>`;
    const inertiaContent = clientBootstrap + appShell;

    const { beforeMatch, afterMatch } = this.content(content, match);
    return this.parser(beforeMatch + inertiaContent + afterMatch, param);
  }

  private vite(
    content: string,
    match: RegExpMatchArray,
    param: Record<string, unknown> = this.option,
  ) {
    let { beforeMatch, afterMatch } = this.content(content, match);
    if (param?.ssrHead) {
      beforeMatch += param.ssrHead;
    }
    const resourcePath = this.removeQuotes(
      match?.groups?.resource || "",
    ).split(",");
    if (process.env.APP_ENV == "local" && resourcePath.length > 1) {
      beforeMatch += this.addCSSLinkTag(
        `${this.viteHost}/${this.getResource(resourcePath, 0)}`,
      );
      beforeMatch += this.addScriptTag(this.viteHost + "/@vite/client");
    }
    const resources = this.getResource(resourcePath);
    return this.parser(
      this.getAssetPath(resources, beforeMatch, afterMatch, resourcePath[0]),
    );
  }

  private viteReactRefresh(content: string, match: RegExpMatchArray) {
    const { beforeMatch, afterMatch } = this.content(content, match);
    let viteClientRefresh = "";
    if (process.env.APP_ENV == "local") {
      viteClientRefresh = this.injectReactRefresh();
    }

    return this.parser(beforeMatch + viteClientRefresh + afterMatch);
  }

  private parser(
    content: string,
    param: Record<string, unknown> = this.option,
  ): string {
    const match = content.match(
      new RegExp(
        Object.values(this.directives)
          .map((regex) => `(${regex.source})`)
          .join("|"),
      ),
    );
    if (!match) return content;
    switch (true) {
      case match[0].startsWith("@inertia"):
        return this.inertia(content, match, param);
      case match[0].startsWith("@viteReact"):
        return this.viteReactRefresh(content, match);
      case match[0].startsWith("@vite(["):
        return this.vite(content, match, param);
      default:
        return content;
    }
  }

  protected async compiler(content: string): Promise<string> {
    return this.parser(content);
  }

  async render(
    filePath: string,
    locals: Record<string, unknown>,
    callback: (err: Error | null, rendered?: string) => void,
  ) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      this.option = locals;
      const renderedContent = await this.compiler(content);
      callback(null, renderedContent);
    } catch (error) {
      callback(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

const engine = new Engine();
export { engine };
