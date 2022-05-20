---
'@backstage/plugin-scaffolder': minor
---

Get data of other fields in Form from a custom field in template Scaffolder.
following:

```tsx
const CustomFieldExtensionComponent = (props: FieldExtensionComponentProps<string[]>) => {
  const { formData } = props.formContext;
  ...
};

const CustomFieldExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: ...,
    component: CustomFieldExtensionComponent,
    validation: ...
  })
);
```
