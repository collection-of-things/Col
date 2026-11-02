import {
  type GenericSchema,
  object,
  partial,
  pipe,
  rawCheck,
  record,
  safeParse,
  string,
  unknown,
} from "valibot";
import defaultTheme, {
  type Theme,
} from ".";

const golorStateTokensSchema = (
  _partial = false,
) => {
  const colorStateTokensSchema = (
    object({
      background: string(),
      text: string(),
      border: string(),
      hover: string(),
      active: string(),
    })
  );
  return _partial ? 
    partial(colorStateTokensSchema) :
    colorStateTokensSchema;
};

const getColorVariantsSchema = (
  _partial = false,
) => {
  const colorVariantSchema = (
    object({
      solid: golorStateTokensSchema(_partial),
      filled: golorStateTokensSchema(_partial),
      outlined: golorStateTokensSchema(_partial),
      ghost: golorStateTokensSchema(_partial),
    })
  );
  return _partial ? 
    partial(colorVariantSchema) :
    colorVariantSchema;
};

const builtInColors = new Set(
  Object.keys(defaultTheme.colors)
);

const ColorsSchema = pipe(
  record(string(), unknown()),
  rawCheck(({ dataset, addIssue }) => {
    const colors = dataset.value as Record<string, unknown>;
    for (const [key, color] of Object.entries(colors)) {
      const schema = builtInColors.has(key)
        ? getColorVariantsSchema(true)
        : getColorVariantsSchema();
      const result = safeParse(schema, color);
      if (!result.success) {
        for (const issue of result.issues) {
          addIssue({
            ...issue,
            path: [
              {
                type: "object",
                origin: "value",
                input: colors,
                key,
                value: color,
              },
              ...(issue.path ?? []),
            ],
          });
        }
      }
    }
  }),
);

const DisabledSchema = record(string(), string());

const RoundedSchema = record(string(), string());

const ShadowSchema = record(string(), string());

const TypographySchema = partial(
  object({
    colors: record(string(), string()),
    variants: record(string(), string()),
  })
);

// @ts-expect-error -- Valibot schema is too complex for TS to serialize
const ThemeSchema: GenericSchema<Theme> = (
  partial(
    object({
      colors: ColorsSchema,
      disabled: DisabledSchema,
      rounded: RoundedSchema,
      shadow: ShadowSchema,
      typography: TypographySchema,
      divider: string(),
      focus: string(),
      focusWithin: string(),
    })
  )
);

export default ThemeSchema;