/* eslint-disable no-console */

import { Button } from "$/components/elements/button";
import { LinkButton } from "$/components/elements/button/link-button";
import { CheckBox$ } from "$/components/elements/form/check-box/check-box";
import { CheckList$ } from "$/components/elements/form/check-box/check-list";
import { ComboBox$ } from "$/components/elements/form/combo-box/combo-box";
import { DateBox$ } from "$/components/elements/form/date-box/date-box";
import { DateSelectBox$ } from "$/components/elements/form/date-box/date-select-box";
import { FileBox$ } from "$/components/elements/form/file-box/file-box";
import { NumberBox$ } from "$/components/elements/form/number-box/number-box";
import { PasswordBox$ } from "$/components/elements/form/password-box/password-box";
import { RadioButtons$ } from "$/components/elements/form/radio-button/radio-buttons";
import { SelectBox$ } from "$/components/elements/form/select-box/select-box";
import { Slider$ } from "$/components/elements/form/slider/slider";
import { TextArea$ } from "$/components/elements/form/text-area/text-area";
import { TextBox$ } from "$/components/elements/form/text-box/text-box";
import { FormGrid, FormHeadline, FormRow } from "$/components/elements/form/wrapper/form-container";
import { FormItem } from "$/components/elements/form/wrapper/form-item";
import { DeleteIcon } from "$/components/elements/icon";
import { useForm } from "$/shared/hooks/form";
import { useFormArrayItem } from "$/shared/hooks/form/array-item";
import { useFormContext } from "$/shared/hooks/form/context";
import { useFormHasError } from "$/shared/hooks/form/error";
import { I18nContext } from "$/shared/hooks/i18n";
import { $Date } from "$/shared/objects/timestamp";
import { SchemaProvider } from "$/shared/providers/schema";
import { $arr } from "$/shared/schema/array";
import { $bool } from "$/shared/schema/boolean";
import { $date } from "$/shared/schema/date";
import { $datetime } from "$/shared/schema/datetime";
import { $enum } from "$/shared/schema/enum";
import { $file } from "$/shared/schema/file";
import { $month } from "$/shared/schema/month";
import { $num } from "$/shared/schema/number";
import { $obj } from "$/shared/schema/object";
import { getPayload } from "$/shared/schema/server";
import { $str } from "$/shared/schema/string";
import { use, useEffect } from "react";
import { data, useFetcher } from "react-router";
import type { Route } from "./+types/form";

const date = $date({
  required: true,
});

const schemaObj = $obj({
  props: {
    str: $str({
      // required: true,
    }),
    text: $str({
      label: "text",
      required: true,
    }),
    password: $str({
      label: "password",
      required: true,
    }),
    email: $str({
      label: "email",
      pattern: "email",
    }),
    note: $str({
      label: "note",
      refs: [".text"],
      required: ({ values }) => {
        return !!values.text;
      },
      minLength: 10,
    }),
    num: $num({
      label: "num",
    }).overwrite({
      required: true,
    }),
    rate: $num({
      label: "rate",
      min: 1,
      max: 99,
    }),
    file: $file({
      label: "file",
      // required: true,
    }),
    select: $enum({
      label: "select",
      // items: async () => {
      items: () => {
        // await sleep(2000);
        return [
          { value: "0", text: "value-0" },
          { value: "1", text: "value-1" },
          { value: "2", text: "value-2" },
          { value: "3", text: "value-3" },
          { value: "4", text: "value-4" },
        ] as const;
      },
      // required: true,
    }),
    combo: $enum({
      label: "combo",
      // items: async () => {
      items: () => {
        // await sleep(5000);
        return [
          { value: 0, text: "無印" },
          { value: 1, text: "AG" },
          { value: 2, text: "DP" },
          { value: 3, text: "BW" },
          { value: 4, text: "XY" },
          { value: 5, text: "SM" },
          { value: 6, text: "新無印" },
        ] as const;
      },
    }),
    check: $bool({
      label: "check",
      trueValue: 1,
      falseValue: 0,
      required: "nonFalse",
    }),
    toggle: $bool({
      label: "toggle",
      // required: true,
    }),
    radio: $enum({
      label: "radio",
      // items: async () => {
      items: () => {
        // await sleep(5000);
        return [
          { value: 0, text: "無印" },
          { value: 1, text: "AG" },
          { value: 2, text: "DP" },
          { value: 3, text: "BW" },
          { value: 4, text: "XY" },
          { value: 5, text: "SM" },
          { value: 6, text: "新無印" },
        ] as const;
      },
    }),
    checklist: $arr({
      label: "checklist",
      minLength: 1,
      maxLength: 3,
      prop: $enum({
        // items: async () => {
        items: () => {
          // await sleep(1000);
          return [
            { value: 0, text: "無印" },
            { value: 1, text: "AG" },
            { value: 2, text: "DP" },
            { value: 3, text: "BW" },
            { value: 4, text: "XY" },
            { value: 5, text: "SM" },
            { value: 6, text: "新無印" },
          ] as const;
        },
      }),
    }),
    date: $date({
      label: "date",
      // required: true,
      minDate: new $Date("2026-05-27"),
    }),
    month: $month({
      label: "month",
      // required: true,
    }),
    datetime: $datetime({
      label: "datetime",
      // required: true,
    }),
    // dateselect: $datetime({
    //   label: "dateselect",
    //   required: true,
    // }),
    date_year: date.getSplitYear({
      // required: true,
    }),
    date_month: date.getSplitMonth({
      // required: true,
    }),
    date_day: date.getSplitDay(),
    split_date: date.overwrite({
      splits: [
        ".date_year",
        ".date_month",
        ".date_day",
      ],
    }),
    arr: $arr({
      prop: $str({}),
      // required: true,
    }).overwrite({
      required: true,
    }),
    arr2: $arr({
      prop: $obj({
        props: {
          name: $str({ required: true }),
          age: $num({ required: true }),
        },
        required: true,
      }),
      required: true,
    }),
    // enum: enum1,
    // enum2: enum2,
  },
}).overwrite({
  // required: true,
});

export async function loader({ request }: Route.LoaderArgs) {
  console.log("loader", request.method, request.url);

  const submission = await getPayload({
    request,
    schema: schemaObj,
  });
  return data(submission);
};

export async function action({ request }: Route.ActionArgs) {
  console.log("action", request.method, request.url);
  const method = request.method.toUpperCase();

  if (method === "POST") {
    const submission = await getPayload({
      request,
      schema: schemaObj,
    });
    return data(submission);
  }
  return data({ values: {}, messages: {} });
};

export default function Page({ loaderData, actionData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof actionData>();

  const form = useForm({
    id: "sandbox",
    schema: schemaObj,
    values: {
      loader: loaderData.values,
      action: fetcher.data?.values ?? actionData?.values,
    },
    messages: {
      loader: loaderData.messages,
      action: fetcher.data?.messages ?? actionData?.messages,
    },
    state: fetcher.state,
  });

  return (
    <fetcher.Form
      {...form.props}
      method="POST"
      className="p-4"
    >
      <SchemaProvider
        {...form.providerProps}
      >
        <div className="sticky top-0 flex flex-row flex-wrap gap-2 p-2 bg-bg z-50">
          <Button type="submit">submit</Button>
          <Button type="reset">reset</Button>
          <LinkButton
            to={{
              pathname: ".",
            }}
          >
            no query
          </LinkButton>
          <LinkButton
            to={{
              search: [
                "combo=3",
                "select=0",
                "date_year=2026",
                `${encodeURIComponent("arr[0]")}=hoge`,
                `${encodeURIComponent("arr2[0].name")}=Mark`,
                `${encodeURIComponent("arr2[0].age")}=5`,
              ].join("&"),
            }}
          >
            query
          </LinkButton>
          <Button
            onClick={() => {
              const values = form.getValues();
              console.log(values);
            }}
          >
            show values
          </Button>
          <DisplayHasError />
        </div>
        <FormContent />
      </SchemaProvider>
    </fetcher.Form>
  );
};

function DisplayHasError() {
  const hasError = useFormHasError();
  return (
    <span>
      error: {String(hasError)}
    </span>
  );
};

function FormContent() {
  const form = useFormContext<typeof schemaObj>();

  useEffect(() => {
    console.log("mount", form.getValues());
    return () => {
      console.log("unmount");
    };
  }, []);

  return (
    <section
      className="flex flex-col gap-2 p-4 scroll-mt-all-[120px]"
    >
      <div className="flex flex-row flex-wrap gap-2">
        <FormGrid fillWidth>
          <FormHeadline>
            TextBox
          </FormHeadline>
          <FormRow
            caption={form.items.text.getLabel()}
          >
            <FormItem>
              <TextBox$
                formItem={form.items.text}
              />
            </FormItem>
          </FormRow>
          <FormRow
            caption={form.items.email.getLabel()}
          >
            <FormItem>
              <TextBox$
                formItem={form.items.email}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            PasswordBox
          </FormHeadline>
          <FormRow
            caption={form.items.password.getLabel()}
          >
            <FormItem>
              <PasswordBox$
                formItem={form.items.password}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            TextArea
          </FormHeadline>
          <FormRow
            caption={form.items.note.getLabel()}
          >
            <FormItem>
              <TextArea$
                formItem={form.items.note}
                rows="fit"
                minRows={3}
                maxRows={5}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            NumberBox
          </FormHeadline>
          <FormRow
            caption={form.items.num.getLabel()}
          >
            <FormItem>
              <NumberBox$
                formItem={form.items.num}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            Slider
          </FormHeadline>
          <FormRow
            caption={form.items.rate.getLabel()}
          >
            <FormItem>
              <Slider$
                formItem={form.items.rate}
                scales={[
                  { value: 1, text: "1%" },
                  { value: 33 },
                  { value: 66 },
                  { value: 99, text: "99%" },
                ]}
              />
            </FormItem>
            <FormItem>
              <NumberBox$
                formItem={form.items.rate}
                omitOnSubmit
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            File
          </FormHeadline>
          <FormRow
            caption={form.items.file.getLabel()}
          >
            <FormItem>
              <FileBox$
                formItem={form.items.file}
                placeholder="ファイルを選択してください"
                viewMode="link"
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            SelectBox
          </FormHeadline>
          <FormRow
            caption={form.items.select.getLabel()}
          >
            <FormItem>
              <SelectBox$
                formItem={form.items.select}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            ComboBox
          </FormHeadline>
          <FormRow
            caption={form.items.combo.getLabel()}
          >
            <FormItem>
              <ComboBox$
                formItem={form.items.combo}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            CheckBox
          </FormHeadline>
          <FormRow
            caption={form.items.check.getLabel()}
          >
            <FormItem>
              <CheckBox$
                formItem={form.items.check}
              >
                CheckBox
              </CheckBox$>
            </FormItem>
          </FormRow>
          <FormRow
            caption={form.items.toggle.getLabel()}
          >
            <FormItem>
              <CheckBox$
                formItem={form.items.toggle}
                appearance="togglebox"
                color="danger"
              >
                ToggleBox
              </CheckBox$>
            </FormItem>
          </FormRow>
          <FormHeadline>
            CheckList
          </FormHeadline>
          <FormRow
            caption={form.items.checklist.getLabel()}
          >
            <FormItem>
              <CheckList$
                formItem={form.items.checklist}
              // appearance="togglebox"
              // appearance="button"
              // color="primary"
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            RadioButtons
          </FormHeadline>
          <FormRow
            caption={form.items.radio.getLabel()}
          >
            <FormItem>
              <RadioButtons$
                formItem={form.items.radio}
              // color="primary"
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            DateBox
          </FormHeadline>
          <FormRow
            caption={form.items.date.getLabel()}
          >
            <FormItem>
              <DateBox$
                formItem={form.items.date}
              />
            </FormItem>
          </FormRow>
          <FormRow
            caption={form.items.month.getLabel()}
          >
            <FormItem>
              <DateBox$
                formItem={form.items.month}
              />
            </FormItem>
          </FormRow>
          <FormRow
            caption={form.items.datetime.getLabel()}
          >
            <FormItem>
              <DateBox$
                formItem={form.items.datetime}
              />
            </FormItem>
          </FormRow>
          <FormHeadline>
            DateSelectBox
          </FormHeadline>
          <FormRow
            caption={form.items.split_date.getLabel()}
          >
            <FormItem>
              <DateSelectBox$
                // formItem={form.items.dateselect}
                formItem={{
                  // id: form.items.split_date.getName(),
                  // id: "_dateselect",
                  core: form.items.split_date,
                  year: form.items.date_year,
                  month: form.items.date_month,
                  day: form.items.date_day,
                }}
              />
            </FormItem>
          </FormRow>
          <ArrayContent />
          <Array2Content />
        </FormGrid>
      </div>
    </section>
  );
};

function ArrayContent() {
  const form = useFormContext<typeof schemaObj>();
  const arr = useFormArrayItem(form.items.arr);
  const t = use(I18nContext).t;

  return (
    <>
      <FormHeadline>
        Array - String
      </FormHeadline>
      {
        arr.map(({ key, index, formItem }) => {
          return (
            <FormRow
              key={key}
              caption={<>{t(formItem.getLabel() as I18nTextKey)}{index}</>}
            >
              <FormItem>
                <TextBox$
                  formItem={formItem}
                />
              </FormItem>
            </FormRow>
          );
        })
      }
      <div className="flex flex-row flex-wrap gap-2 col-start-1 col-end-3">
        <Button
          onClick={() => {
            arr.remove();
          }}
        >
          clear
        </Button>
        <Button
          onClick={() => {
            arr.push("add");
          }}
        >
          add
        </Button>
        <Button
          onClick={() => {
            arr.insert(1, "insert");
          }}
        >
          insert
        </Button>
      </div>
    </>
  );
};

function Array2Content() {
  const form = useFormContext<typeof schemaObj>();
  const arr2 = useFormArrayItem(form.items.arr2);
  const t = use(I18nContext).t;

  return (
    <>
      <FormHeadline>
        Array - Object
      </FormHeadline>
      {
        arr2.map(({ key, index, formItem, formItems, remove }) => {
          return (
            <FormRow
              key={key}
              caption={<>{t(formItem.getLabel() as I18nTextKey)}{index}</>}
            >
              <div className="flex flex-row gap-2">
                <FormItem>
                  <TextBox$
                    formItem={formItems.name}
                  />
                </FormItem>
                <FormItem>
                  <NumberBox$
                    formItem={formItems.age}
                  />
                </FormItem>
                <Button
                  onClick={() => {
                    remove();
                  }}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </FormRow>
          );
        })
      }
      <div className="flex flex-row flex-wrap gap-2 col-start-1 col-end-3">
        <Button
          onClick={() => {
            arr2.remove();
          }}
        >
          clear
        </Button>
        <Button
          onClick={() => {
            arr2.push({
              name: "add",
            });
          }}
        >
          add
        </Button>
        <Button
          onClick={() => {
            arr2.insert(1, {
              name: "insert",
            });
          }}
        >
          insert
        </Button>
      </div>
    </>
  );
};
