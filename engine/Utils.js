import fs from "fs";
export class Utils {
    constructor() {
        this.viteHost = this.getPublicFile("hot") || "";
    }
    /**
     * Extracts content before and after a match within a string.
     * @param {string} content - The original string.
     * @param {object} match - The match object containing index and matched content.
     * @returns {object} - Object containing content before and after the match.
     */
    content(content, match) {
        const beforMatch = content.substring(0, match.index);
        const afterMatch = content.substring(match.index + match[0].length);
        return { afterMatch, beforMatch };
    }
    getAssets(content) {
        let value = content
            .trim()
            .match(/assets\((?<assetsPath>['"]([^'"]+)['"])\)/)?.groups || {
            assetsPath: "",
        };
        const path = value.assetsPath.replace(/\./g, "/").replace(/\"/g, "").trim();
        const assetType = path.split("/")[0] || "";
        return assetType === "js" ? `${path}.js` : `${path}.css`;
    }
    getPublicFile(file) {
        const getFile = `${process.cwd()}/public/${file}`;
        if (fs.existsSync(getFile)) {
            return fs.readFileSync(getFile).toString();
        }
    }
    addScriptTag(src) {
        return `<script
            type="module"
            src="${src}"
        ></script>`;
    }
    getAssetPath(resolvePath, beforeMatch, afterMatch, cssPath) {
        if (process.env.APP_ENV != "production") {
            const src = `${this.viteHost}/${resolvePath}`;
            return `${beforeMatch}${this.addScriptTag(src)}${afterMatch}`;
        }
        const manifestContent = this.getPublicFile("build/manifest.json");
        if (!manifestContent) {
            console.error("Run npm run vite in your terminal");
            return "";
        }
        const manifest = JSON.parse(manifestContent);
        const assetData = manifest[resolvePath];
        if (!assetData) {
            throw console.error(`Asset not found: ${resolvePath}`);
        }
        const src = `/build/${assetData.file}`;
        const cssLink = assetData.css?.[0] ||
            manifest[cssPath?.replace(/\//, "") || "resources/css/app.css"]?.file;
        if (cssLink) {
            beforeMatch += this.addCSSLinkTag(`/build/${cssLink}`);
        }
        return `${beforeMatch}${this.addScriptTag(src)}${afterMatch}`;
    }
    addCSSLinkTag(link) {
        return ` <link rel="stylesheet" href="${link}" />`;
    }
    /**
     * Removes quotes from a string.
     * @param {string} str - The original string.
     * @returns {string} - The string with quotes removed.
     */
    removeQuotes(str) {
        return str.replace(/(\'|\")/g, "");
    }
    getResource(resources, select = 1) {
        const resource = resources[resources.length > 1 ? select : 0].trim();
        return this.removeQuotes(resource.startsWith("/") ? resource.slice(1) : resource);
    }
    injectReactRefefresh() {
        return ` <script type="module">
            import RefreshRuntime from '${this.viteHost}/@react-refresh';
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
        </script>`;
    }
}
