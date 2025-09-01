export interface InertiaOptions {
    rootView: string;
    props: Record<string, any>;
    sharedProps?: Record<string, any> | ((req: Request) => Record<string, any>);
    version?: string | (() => string);
}
export interface InertiaProps {
    component: string;
    props: Record<string, any>;
    url: string;
    version: string;
}
//# sourceMappingURL=Interface.d.ts.map