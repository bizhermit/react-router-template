export function $schema<SchemaProps extends Record<string, any>>(props: SchemaProps) {
  return props;
};

export function parseWithSchema<$Schema extends Record<string, any>>(parms: {
  schema: $Schema;
  data?: Record<string, any>;
  dep?: Record<string, any>;
  env: Schema.Env;
}) {
  


  return {

  } as const;
};
