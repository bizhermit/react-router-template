import { clone } from "~/components/objects";

export function extendsValueObjectProps(
  base: ApiDoc.Value_Object,
  props: ApiDoc.Value_Object["props"],
) {
  const newObject = clone(base);
  newObject.props = {
    ...props,
    ...newObject.props,
  };
  return newObject;
};

export function overrideValueObjectProps(
  base: ApiDoc.Value_Object,
  props: ApiDoc.Value_Object["props"],
) {
  const newObject = clone(base);
  newObject.props = {
    ...newObject.props,
    ...props,
  };
  return newObject;
};
