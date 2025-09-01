import fs from "fs";
import { Utils } from "./Utils";
//
class Engine extends Utils {
    constructor() {
        super(...arguments);
        //
        this.option = {};
        //
        this.directives = {
            inertia: /@inertia/,
            vite: /@vite\s*\(\[\s*(?<resource>[^\]]*?)\s*\]\)/,
            viteReactRefresh: /@viteReactRefresh/,
        };
    }
    inertia(content, match, param = this.option) {
        const interiaContent = `<div id="app" data-page='${param.inertia}'></div>`;
        const { beforMatch, afterMatch } = this.content(content, match);
        return this.parser(beforMatch + interiaContent + afterMatch, param);
    }
    vite(content, match, param = this.option) {
        let { beforMatch, afterMatch } = this.content(content, match);
        const resourcePath = this.removeQuotes(match?.groups.resource || "").split(",");
        if (process.env.APP_ENV == "local" && resourcePath.length > 1) {
            beforMatch += this.addCSSLinkTag(`${this.viteHost}/${this.getResource(resourcePath, 0)}`);
            beforMatch += this.addScriptTag(this.viteHost + "/@vite/client");
        }
        const resources = this.getResource(resourcePath);
        return this.parser(this.getAssetPath(resources, beforMatch, afterMatch, resourcePath[0]));
    }
    viteReactRefresh(content, match, param) {
        const { beforMatch, afterMatch } = this.content(content, match);
        let viteClientRefresh = "";
        if (process.env.APP_ENV == "local") {
            viteClientRefresh = this.injectReactRefefresh();
        }
        return this.parser(beforMatch + viteClientRefresh + afterMatch);
    }
    /**
     * Parses the template content based on the defined directives.
     * @param {string} content - Template content.
     * @param {Object} param - Local variables for rendering.
     * @returns {string} - Rendered content.
     */
    parser(content, param = this.option) {
        const match = content.match(new RegExp(Object.values(this.directives)
            .map((regex) => `(${regex.source})`)
            .join("|")));
        if (!match)
            return content;
        switch (true) {
            case match[0].startsWith("@inertia"):
                return this.inertia(content, match, param);
            case match[0].startsWith("@viteReact"):
                return this.viteReactRefresh(content, match, param);
            case match[0].startsWith("@vite(["):
                return this.vite(content, match, param);
            default:
                return content;
        }
    }
    /**
     * Compiles the template content by processing directives and extending layouts.
     * @param {string} content - Template content.
     * @returns {Promise<string>} - Compiled content.
     */
    async compiler(content) {
        return this.parser(content);
    }
    async render(filePath, locals, callback) {
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            this.option = locals;
            const renderedContent = await this.compiler(content);
            return callback(null, renderedContent);
        }
        catch (error) {
            return console.error(error.message);
            // throw new AppError(error?.message, DEFAULT_ENGINE_ERROR);
        }
    }
}
const engine = new Engine();
export { engine };
