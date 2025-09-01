import "express";
class InertiaMiddleware {
    getSharedProps(options, req, res) {
        if (typeof options.props === "function") {
            return options.props(req, res);
        }
        return options.props || {};
    }
    getVersion(options) {
        if (typeof options.version === "function") {
            return options.version();
        }
        return options.version || "1";
    }
    filterProps(props, only) {
        const filtered = {};
        only.forEach((key) => {
            if (key in props) {
                filtered[key] = props[key];
            }
        });
        return filtered;
    }
    inertia(options) {
        return (req, res, next) => {
            res.inertia = (component, props = {}, option = {}) => {
                const isInertiaRequest = req.header("X-Inertia");
                const version = this.getVersion(options);
                const sharedProps = this.getSharedProps(options, req, res);
                const mergedProps = { ...sharedProps, ...props };
                //
                const only = req.header("X-Inertia-Partial-Data");
                const finalProps = only
                    ? this.filterProps(mergedProps, only.split(","))
                    : mergedProps;
                const inertiaData = {
                    component,
                    props: finalProps,
                    url: req.originalUrl,
                    version,
                };
                if (isInertiaRequest) {
                    const clientVersion = req.header("X-Inertia-Version");
                    if (clientVersion && clientVersion !== version) {
                        return res
                            .status(409)
                            .setHeader("X-Inertia-Location", req.originalUrl)
                            .end();
                    }
                    res.setHeader("X-Inertia", "true");
                    res.setHeader("Vary", "X-Inertia");
                    return res.json(inertiaData);
                }
                res.render(options.rootView, {
                    inertia: JSON.stringify(inertiaData),
                    ...options,
                });
            };
            res.inertiaRedirect = (url) => {
                if (req.header("X-Inertia")) {
                    res.setHeader("X-Inertia-Location", url);
                    return res.status(409).end();
                }
                return res.redirect(303, url);
            };
            next();
        };
    }
}
const inertiaMiddleware = new InertiaMiddleware();
export const inertia = (options) => inertiaMiddleware.inertia(options);
