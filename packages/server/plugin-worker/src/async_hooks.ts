// eslint-disable-next-line no-eval
const async_hooks = eval(
  "typeof window === 'undefined' && require('node:async_hooks')",
);

export default async_hooks;
