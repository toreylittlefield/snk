export const h = (element: string, attributes: any) => `<${element} ${toAttribute(attributes)}/>`;

export const t = (element: string, attributes: any, content: string) =>
  `<${element} ${toAttribute(attributes)}>${content}</${element}>`;

export const toAttribute = (o: any) =>
  Object.entries(o)
    .filter(([, value]) => value !== null)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ');
