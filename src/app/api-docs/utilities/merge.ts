import { clone } from "../../components/objects";

export function extendsValueObjectProps(
  base: ApiDoc.Value_Object,
  params: {
    componentName?: string;
    props: ApiDoc.Value_Object["props"];
  }
) {
  const newObject = clone(base);
  newObject.props = {
    ...params.props,
    ...newObject.props,
  };
  if (params.componentName) {
    newObject.componentName = params.componentName;
  } else {
    delete newObject.componentName;
  }
  return newObject;
};

export function overrideValueObjectProps(
  base: ApiDoc.Value_Object,
  params: {
    componentName?: string;
    props: ApiDoc.Value_Object["props"];
  }
) {
  const newObject = clone(base);
  newObject.props = {
    ...newObject.props,
    ...params.props,
  };
  if (params?.componentName) {
    newObject.componentName = params.componentName;
  } else {
    delete newObject.componentName;
  }
  return newObject;
};
