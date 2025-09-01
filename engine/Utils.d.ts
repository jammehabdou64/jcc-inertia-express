export declare class Utils {
    protected viteHost: string;
    constructor();
    /**
     * Extracts content before and after a match within a string.
     * @param {string} content - The original string.
     * @param {object} match - The match object containing index and matched content.
     * @returns {object} - Object containing content before and after the match.
     */
    protected content(content: string, match: any): {
        afterMatch: string;
        beforMatch: string;
    };
    protected getAssets(content: string): string;
    protected getPublicFile(file: string): string | undefined;
    protected addScriptTag(src: string): string;
    protected getAssetPath(resolvePath: string, beforeMatch: string, afterMatch: string, cssPath?: string): string;
    protected addCSSLinkTag(link: string): string;
    /**
     * Removes quotes from a string.
     * @param {string} str - The original string.
     * @returns {string} - The string with quotes removed.
     */
    protected removeQuotes(str: string): string;
    protected getResource(resources: Array<string>, select?: number): string;
    protected injectReactRefefresh(): string;
}
//# sourceMappingURL=Utils.d.ts.map