/**
 * The installed react-hook-form release exposes its runtime API correctly, but
 * its published declaration entrypoint references source files that are not in
 * the package. This local compatibility declaration restores the API used by
 * the generated shadcn form component until that upstream package is replaced.
 */
declare module "react-hook-form" {
  import type { ComponentType, ReactNode } from "react";

  export type FieldValues = Record<string, unknown>;
  export type FieldPath<TFieldValues extends FieldValues> =
    Extract<keyof TFieldValues, string> | string;

  export type ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  > = {
    name: TName;
    control?: unknown;
    render?: (...args: unknown[]) => ReactNode;
    [key: string]: unknown;
  };

  export const Controller: ComponentType<ControllerProps>;
  export const FormProvider: ComponentType<{ children?: ReactNode; [key: string]: unknown }>;
  export function useFormContext(): {
    getFieldState: (...args: unknown[]) => { error?: { message?: string } };
    formState: unknown;
  };
}
