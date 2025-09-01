import { Utils } from "./Utils";
declare class Engine extends Utils {
    private option;
    private directives;
    private inertia;
    private vite;
    private viteReactRefresh;
    /**
     * Parses the template content based on the defined directives.
     * @param {string} content - Template content.
     * @param {Object} param - Local variables for rendering.
     * @returns {string} - Rendered content.
     */
    private parser;
    /**
     * Compiles the template content by processing directives and extending layouts.
     * @param {string} content - Template content.
     * @returns {Promise<string>} - Compiled content.
     */
    protected compiler(content: string): Promise<string>;
    render(filePath: string, locals: any, callback: any): Promise<any>;
}
declare const engine: Engine;
export { engine };
//# sourceMappingURL=Engine.d.ts.map