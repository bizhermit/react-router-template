import { clone } from "~/components/objects";

export function extendsValueObjectProps(
  base: ApiDoc.Value_Object,
  props: ApiDoc.Value_Object["props"],
  options?: {
    componentName?: string;
  }
) {
  const newObject = clone(base);
  newObject.props = {
    ...props,
    ...newObject.props,
  };
  if (options?.componentName) {
    newObject.componentName = options.componentName;
  } else {
    delete newObject.componentName;
  }
  return newObject;
};

export function overrideValueObjectProps(
  base: ApiDoc.Value_Object,
  props: ApiDoc.Value_Object["props"],
  options?: {
    componentName?: string;
  }
) {
  const newObject = clone(base);
  newObject.props = {
    ...newObject.props,
    ...props,
  };
  if (options?.componentName) {
    newObject.componentName = options.componentName;
  } else {
    delete newObject.componentName;
  }
  return newObject;
};
