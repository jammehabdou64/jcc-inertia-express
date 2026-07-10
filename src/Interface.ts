import { Request, Response } from "express";

export type SharedProps =
  | Record<string, unknown>
  | ((req: Request, res: Response) => Record<string, unknown>);

export interface InertiaOptions {
  rootView: string;
  props?: SharedProps;
  version?: string | (() => string);
  ssr?: boolean;
}

export interface InertiaProps {
  component: string;
  props: Record<string, unknown>;
  url: string;
  version: string;
}
