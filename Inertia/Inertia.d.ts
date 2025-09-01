import { Request, Response, NextFunction } from "express";
import { InertiaOptions } from "../Interface";
import "express";
declare global {
    namespace Express {
        interface Response {
            inertia: (component: string, props?: Record<string, any>, options?: any) => void;
            inertiaRedirect: (url: string) => void;
        }
    }
}
export declare const inertia: (options: InertiaOptions) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=Inertia.d.ts.map