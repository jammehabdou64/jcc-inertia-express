import fs from "fs";

export class Utils {
  protected viteHost: string;

  constructor() {
    this.viteHost = this.getPublicFile("hot") || "";
  }

  /**
   * Extracts content before and after a match within a string.
   */
  protected content(content: string, match: RegExpMatchArray) {
    const index = match.index ?? 0;
    const beforeMatch = content.substring(0, index);
    const afterMatch = content.substring(index + match[0].length);
    return { afterMatch, beforeMatch };
  }

  protected getAssets(content: string) {
    const value = content
      .trim()
      .match(/assets\((?<assetsPath>['"]([^'"]+)['"])\)/)?.groups || {
      assetsPath: "",
    };
    const path = value.assetsPath.replace(/\./g, "/").replace(/\"/g, "").trim();
    const assetType = path.split("/")[0] || "";
    return assetType === "js" ? `${path}.js` : `${path}.css`;
  }

  protected getPublicFile(file: string) {
    const getFile = `${process.cwd()}/public/${file}`;
    if (fs.existsSync(getFile)) {
      return fs.readFileSync(getFile).toString();
    }
  }

  protected addScriptTag(src: string) {
    return `<script
            type="module"
            src="${src}"
        ></script>`;
  }

  protected getAssetPath(
    resolvePath: string,
    beforeMatch: string,
    afterMatch: string,
    cssPath?: string,
  ): string {
    if (process.env.APP_ENV != "production") {
      const src = `${this.viteHost}/${resolvePath}`;
      return `${beforeMatch}${this.addScriptTag(src)}${afterMatch}`;
    }

    const manifestContent = this.getPublicFile("build/manifest.json");
    if (!manifestContent) {
      console.error("Run npm run vite in your terminal");
      return "";
    }

    const manifest: Record<string, { file: string; css?: string[] }> =
      JSON.parse(manifestContent);
    const assetData = manifest[resolvePath];
    if (!assetData) {
      throw new Error(`Asset not found: ${resolvePath}`);
    }

    const src = `/build/${assetData.file}`;

    const cssLink =
      assetData.css?.[0] ||
      manifest[cssPath?.replace(/\//, "") || "resources/css/app.css"]?.file;
    if (cssLink) {
      beforeMatch += this.addCSSLinkTag(`/build/${cssLink}`);
    }

    return `${beforeMatch}${this.addScriptTag(src)}${afterMatch}`;
  }

  protected addCSSLinkTag(link: string) {
    return ` <link rel="stylesheet" href="${link}" />`;
  }

  protected removeQuotes(str: string): string {
    return str.replace(/(\'|\")/g, "");
  }

  protected getResource(resources: Array<string>, select: number = 1) {
    const resource = resources[resources.length > 1 ? select : 0].trim();
    return this.removeQuotes(
      resource.startsWith("/") ? resource.slice(1) : resource,
    );
  }

  protected injectReactRefresh() {
    return ` <script type="module">
            import RefreshRuntime from '${this.viteHost}/@react-refresh';
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
        </script>`;
  }
}
