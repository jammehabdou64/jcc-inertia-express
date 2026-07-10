import { Request, Response, NextFunction } from "express";
import { InertiaOptions, InertiaProps } from "../Interface.js";

import "express";
import { fetchSSR, isValidSsrResult } from "./utils.js";

declare global {
  namespace Express {
    interface Response {
      inertia: (
        component: string,
        props?: Record<string, unknown>,
      ) => Promise<void>;
      inertiaRedirect: (url: string) => void;
    }
  }
}

class InertiaMiddleware {
  private getSharedProps(
    options: InertiaOptions,
    req: Request,
    res: Response,
  ): Record<string, unknown> {
    if (typeof options.props === "function") {
      return options.props(req, res);
    }
    return options.props || {};
  }

  private getVersion(options: InertiaOptions): string {
    if (typeof options.version === "function") {
      return options.version();
    }
    return options.version || "1";
  }

  private filterProps(
    props: Record<string, unknown>,
    only: string[],
  ): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    only.forEach((key) => {
      const trimmedKey = key.trim();
      if (trimmedKey in props) {
        filtered[trimmedKey] = props[trimmedKey];
      }
    });
    return filtered;
  }

  private resolveFinalProps(
    req: Request,
    component: string,
    mergedProps: Record<string, unknown>,
  ): Record<string, unknown> {
    const partialData = req.header("X-Inertia-Partial-Data");
    const partialComponent = req.header("X-Inertia-Partial-Component");

    if (partialData && partialComponent && partialComponent === component) {
      return this.filterProps(mergedProps, partialData.split(","));
    }

    return mergedProps;
  }

  private async renderSsr(
    inertiaData: InertiaProps,
  ): Promise<{ ssrHead: string; ssrBody: string } | null> {
    const ssrHost = process.env.SSR_HOST || "localhost";
    const ssrPort = process.env.SSR_PORT || "13714";

    try {
      const result = await fetchSSR(
        `http://${ssrHost}:${ssrPort}/render`,
        inertiaData,
      );

      if (!isValidSsrResult(result)) {
        console.warn(
          "SSR returned an empty or invalid response, falling back to client-side rendering.",
        );
        return null;
      }

      return {
        ssrHead: result.head?.join("\n") || "",
        ssrBody: result.body,
      };
    } catch (error: any) {
      console.error(error?.message);
      return null;
    }
  }

  public inertia(options: InertiaOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
      res.inertia = async (component: string, props = {}) => {
        try {
          const isInertiaRequest = req.header("X-Inertia");
          const version = this.getVersion(options);
          const sharedProps = this.getSharedProps(options, req, res);
          const mergedProps = { ...sharedProps, ...props };
          const finalProps = this.resolveFinalProps(
            req,
            component,
            mergedProps,
          );

          const inertiaData: InertiaProps = {
            component,
            props: finalProps,
            url: req.originalUrl,
            version,
          };

          if (isInertiaRequest) {
            const clientVersion = req.header("X-Inertia-Version");
            if (clientVersion && clientVersion !== version) {
              res
                .status(409)
                .setHeader("X-Inertia-Location", req.originalUrl)
                .end();
              return;
            }

            res.setHeader("X-Inertia", "true");
            res.setHeader("Vary", "X-Inertia");
            res.json(inertiaData);
            return;
          }

          const ssr = options.ssr ? await this.renderSsr(inertiaData) : null;

          res.render(options.rootView, {
            inertia: inertiaData,
            ssrHead: ssr?.ssrHead || "",
            ssrBody: ssr?.ssrBody || "",
            ...options,
          });
        } catch (error) {
          console.error(error);
          if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
          }
        }
      };

      res.inertiaRedirect = (url: string) => {
        if (req.header("X-Inertia")) {
          res.setHeader("X-Inertia-Location", url);
          res.status(303).end();
          return;
        }
        res.redirect(303, url);
      };
      next();
    };
  }
}

const inertiaMiddleware = new InertiaMiddleware();

export const inertia = (options: InertiaOptions) =>
  inertiaMiddleware.inertia(options);
