/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState, type ReactNode } from "react";
import { data, useFetcher } from "react-router";
import { Button } from "~/components/elements/button";
import { Details } from "~/components/elements/details";
import { useDialog } from "~/components/elements/dialog";
import { CheckBox } from "~/components/elements/form/check-box";
import { CheckList } from "~/components/elements/form/check-list";
import { FormItem } from "~/components/elements/form/common";
import { DateBox } from "~/components/elements/form/date-box";
import { DateSelectBox } from "~/components/elements/form/date-select-box";
import { FieldSet } from "~/components/elements/form/fieldset";
import { FileBox } from "~/components/elements/form/file-box";
import { NumberBox } from "~/components/elements/form/number-box";
import { RadioButtons } from "~/components/elements/form/radio-buttons";
import { SelectBox } from "~/components/elements/form/select-box";
import { Slider } from "~/components/elements/form/slider";
import { SwitchBox } from "~/components/elements/form/switch-box";
import { TextArea } from "~/components/elements/form/text-area";
import { TextBox } from "~/components/elements/form/text-box";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BadgeIcon, BookmarkFillIcon, BookmarkIcon, ButtonIcon, CalendarFillIcon, CalendarIcon, CameraFillIcon, CameraIcon, CardIcon, CheckCircleFillIcon, CheckCircleIcon, CheckIcon, ChocolateMenuFillIcon, ChocolateMenuIcon, CircleFillIcon, CircleIcon, ClearAllIcon, ClockFillIcon, ClockIcon, CloudDownloadIcon, CloudFillIcon, CloudIcon, CloudUploadIcon, ContainerIcon, CrossCircleFillIcon, CrossCircleIcon, CrossIcon, DeleteBackFillIcon, DeleteBackIcon, DeleteFillIcon, DeleteIcon, DoubleDownFillIcon, DoubleDownIcon, DoubleLeftFillIcon, DoubleLeftIcon, DoubleRightFillIcon, DoubleRightIcon, DoubleUpFillIcon, DoubleUpIcon, DownFillIcon, DownIcon, DownloadIcon, ElementIcon, ExclamationCircleFillIcon, ExclamationCircleIcon, ExclamationDiamondFillIcon, ExclamationDiamondIcon, ExclamationIcon, ExclamationTriangleFillIcon, ExclamationTriangleIcon, ExLinkIcon, FileAddFillIcon, FileAddIcon, FileDeleteFillIcon, FileDeleteIcon, FileFillIcon, FileIcon, FilterFillIcon, FilterIcon, FolderAddFillIcon, FolderAddIcon, FolderDeleteFillIcon, FolderDeleteIcon, FolderFillIcon, FolderIcon, FormIcon, FormItemIcon, GearFillIcon, GearIcon, GridFillIcon, GridIcon, HeartFillIcon, HeartHalfFillIcon, HeartIcon, HomeFillIcon, HomeIcon, HorizontalDividerIcon, KebabMenuIcon, LabelFillIcon, LabelIcon, LeftFillIcon, LeftIcon, LeftRightIcon, LinkIcon, ListFilterIcon, ListIcon, LoadingIcon, LocationFillIcon, LocationIcon, MagnifyingGlassIcon, MagnifyingGlassMinusFillIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusFillIcon, MagnifyingGlassPlusIcon, MailFillIcon, MailIcon, MeatballsMenuIcon, MenuIcon, MenuLeftIcon, MenuLeftRightIcon, MenuRightIcon, MinusCircleFillIcon, MinusCircleIcon, MinusIcon, NavContainerIcon, OrderListIcon, PinFillIcon, PinIcon, PlusCircleFillIcon, PlusCircleIcon, PlusIcon, PopupIcon, PowerIcon, QuestionCircleFillIcon, QuestionCircleIcon, QuestionIcon, RedoIcon, ReloadIcon, RightFillIcon, RightIcon, SaveFillIcon, SaveIcon, ShareFillIcon, ShareIcon, SignInIcon, SignOutIcon, SlideContainerIcon, SmileFillIcon, SmileIcon, SplitContainerIcon, StarFillIcon, StarHalfFillIcon, StarIcon, StepperIcon, SyncIcon, TabContainerIcon, TextBoxIcon, TodayFillIcon, TodayIcon, TooltipIcon, TrashCanFillIcon, TrashCanIcon, UndoIcon, UnloadIcon, UpDownIcon, UpFillIcon, UpIcon, UploadIcon, UserAddIcon, UserFillIcon, UserIcon, UserMinusIcon, UsersFillIcon, UsersIcon, VerticalDividerIcon } from "~/components/elements/icon";
import { Link } from "~/components/elements/link";
import { LinkButton } from "~/components/elements/link-button";
import { $alert, $confirm, $toast } from "~/components/elements/message-box";
import { NavLayout, useNavLayout } from "~/components/elements/nav-layout";
import { clsx } from "~/components/elements/utilities";
import { useAbortController } from "~/components/hooks/abort-controller";
import { usePageExitPropmt } from "~/components/hooks/page-exit-prompt";
import { useToggle } from "~/components/hooks/toggle";
import getIndexedDB, { type IndexedDBController, type IndexedDBStores } from "~/components/indexeddb/client";
import { formatDate } from "~/components/objects/date";
import { parseNumber } from "~/components/objects/numeric";
import { useTheme } from "~/components/providers/theme";
import { $schema } from "~/components/schema";
import { $array } from "~/components/schema/array";
import { $bool } from "~/components/schema/boolean";
import { $date, $datetime, $month } from "~/components/schema/date";
import { $file } from "~/components/schema/file";
import { useSchema, useSchemaArray, useSchemaContext, useSchemaValue } from "~/components/schema/hooks";
import { $num } from "~/components/schema/number";
import { getPayload } from "~/components/schema/server";
import { $str } from "~/components/schema/string";
import { $struct } from "~/components/schema/struct";
import { useLocale, useText } from "~/i18n/hooks";
import { Text } from "~/i18n/react-component";
import type { Route } from "./+types/page";

const text = $str(
  {
    // required: true,
    // source: [
    //   { value: "hoge", text: "HOGE" },
    //   { value: "fuga", text: "FUGA" },
    //   { value: "piyo", text: "PIYO" },
    // ],
  }
);

const birth = $date({
  // required: true,
  pair: {
    name: "date",
    position: "before",
  },
});

const schema = $schema({
  text: $str({
    required: true,
    min: 4,
    pattern: "email",
    label: "テキスト",
    sourceValidation: false,
    source: [
      { value: "hoge@example.com" },
      { value: "fuga@example.com", text: "sample mailaddress" },
      { value: "piyo@example.com" },
    ],
  }),
  requiredText: $str({
    required: true,
  }),
  // dynamicRequiredText: $str({
  //   required: () => true,
  // }),
  customMessageText: $str({
    required: [true, () => "入力しない場合、あなたの命は保証されません。"],
  }),
  // customDynamicRequiredText: $str({
  //   required: [() => true, () => "入力しなくても命だけは獲らないでいてやる。"],
  // }),
  sourceText: $str({
    required: true,
    source: [
      { value: "hoge", text: "HOGE" },
      { value: "fuga", text: "FUGA" },
      { value: "piyo", text: "PIYO" },
    ] as const,
  }),
  count: $num({
    sourceValidation: false,
    source: [
      { value: 10, text: "10歳" },
      { value: 20 },
    ],
  }),
  range: $num({
    required: true,
    min: 0,
    max: 100,
    float: 0,
    sourceValidation: false,
    source: [
      { value: 0, text: "0" },
      { value: 25, text: "" },
      { value: 50, text: "50" },
      { value: 75, text: "" },
      { value: 100, text: "100" },
    ],
  }),
  generation: $num({
    source: [
      { value: 0, text: "無印" },
      { value: 1, text: "AG" },
      { value: 2, text: "DP" },
      { value: 3, text: "BW" },
      { value: 4, text: "XY" },
      { value: 5, text: "SM" },
      { value: 6, text: "新無印" },
    ] as const,
  }),
  check: $bool(),
  // agreement: $bool({
  //   required: true,
  //   requiredAsTrue: true,
  // }),
  numFlag: $bool({
    trueValue: 1 as const,
    falseValue: 0 as const,
    required: true,
  }),
  month: $month({
    required: true,
  }),
  date: $date({
    source: () => {
      const date = new Date();
      const today = formatDate(date, "yyyy-MM-dd") as Schema.DateString;
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      const lastOfMonth = formatDate(date, "yyyy-MM-dd") as Schema.DateString;
      date.setDate(1);
      const firstOfMonth = formatDate(date, "yyyy-MM-dd") as Schema.DateString;
      return [
        { value: firstOfMonth, text: "月初" },
        { value: today, text: "今日" },
        { value: lastOfMonth, text: "月末" },
      ];
    },
    pair: {
      name: "datePair",
      position: "after",
    },
  }),
  datePair: $date({
    pair: {
      name: "date",
      position: "before",
    },
  }),
  datetime: $datetime(),
  datetimeHasSecond: $datetime({
    time: "hms",
  }),
  birth,
  birth_year: birth.splitYear({
    required: true,
  }),
  birth_month: birth.splitMonth({
    required: true,
  }),
  birth_day: birth.splitDay({
  }),
  file: $file({
    required: true,
  }),
  array: $array({
    prop: $num(),
    min: 1,
    source: [
      { value: 1, text: "item-1" },
      { value: 2, text: "item-2" },
      { value: 3, text: "item-3" },
    ],
  }),
  struct: $struct({
    props: {
      name: $str({
        required: true,
      }),
      age: $num(),
      birth: $date(),
    },
  }),
  structArray: $array({
    prop: $struct({
      props: {
        name: $str({
          required: ({ data, name }) => {
            const age = parseNumber(data.get(name, ".age"))[0];
            if (age == null) return false;
            return age > 10;
          },
          refs: [".age"],
        }),
        age: $num(),
        birth: $month(),
      },
    }),
  }),
});

// type SchemaValue = Schema.SchemaValue<typeof schema>;
// type TolerantSchemaValue = Schema.TolerantSchemaValue<typeof schema>;

// const start = performance.now();
// const submittion = parseWithSchema({
//   schema,
//   env: {
//     isServer: true,
//     t: (k) => k,
//   },
//   dep: {},
//   data: {
//     text: "hogefuga",
//     sourceText: "hoge",
//     count: 10,
//     array: [1, 2, 3],
//     structArray: [
//       { name: "hoge" },
//       { age: 2 },
//       { birth: "2025-06-15" },
//     ],
//     struct: {

//     },
//   } satisfies TolerantSchemaValue,
// })
// console.log(submittion);
// console.log(performance.now() - start);

export async function loader() {
  console.log(import.meta.env.MODE);
  return data({});
};

export async function action(args: Route.ActionArgs) {
  console.log("-----------------");
  const start = performance.now();
  const submittion = await getPayload(args.request, schema);
  console.log(submittion);
  console.log(performance.now() - start);
  console.log("-----------------");

  return data({
    data: submittion.data,
    results: submittion.results,
  });
};

export default function Page(props: Route.ComponentProps) {
  return (
    <NavLayout
      header={
        <span className="text-lg font-bold px-4">
          Sandbox
        </span>
      }
      footer={
        <div className="w-full text-sm text-center p-1">
          &copy;&nbsp;2024&nbsp;bizhermit.com
        </div>
      }
      content={<Contents {...props} />}
    >
      navigation
      <NavMenu />
    </NavLayout>
  );
};

function NavMenu() {
  const nav = useNavLayout();

  return (
    <ul>
      <li>
        <Link
          className="flex flex-row p-2 gap-2"
          to="/"
          onClick={() => {
            nav?.toggleMenu(false);
          }}
        >
          <HomeIcon />index
        </Link>
        <Button
          title="close menu"
          appearance="outline"
          onClick={() => {
            nav?.toggleMenu(false);
          }}
        >
          <CrossIcon />
        </Button>
      </li>
    </ul>
  );
};

function Contents(props: Route.ComponentProps) {
  const fetcher = useFetcher();
  const handleConfirmEnabled = usePageExitPropmt();

  const {
    SchemaProvider,
    handleSubmit,
    handleReset,
    getFormProps,
  } = useSchema({
    schema,
    onChangeEffected: handleConfirmEnabled,
    // loaderData: props.loaderData ? props.loaderData.data : undefined,
    actionData: fetcher.data ?
      fetcher.data.data :
      props.actionData
        ? props.actionData.data :
        undefined,
    // loaderData: props.loaderData ? props.loaderData.results : undefined,
    actionResults: fetcher.data ?
      fetcher.data.results :
      props.actionData ?
        props.actionData.results :
        undefined,
  });

  const formReadonly = useToggle();
  const formDisabled = useToggle();

  // console.log(dataItems);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row">
        <h1>Sandbox</h1>
        <LinkButton
          to="/"
          color="sub"
          appearance="outline"
          className="ml-auto"
        // disabled
        >
          <SignOutIcon />
          <span>index</span>
        </LinkButton>
      </div>
      <section className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              formReadonly.toggle();
            }}
          >
            readonly: {formReadonly.flag ? "on" : "off"}
          </Button>
          <Button
            onClick={() => {
              formDisabled.toggle();
            }}
          >
            disabled: {formDisabled.flag ? "on" : "off"}
          </Button>
        </div>
        <SchemaProvider>
          <fetcher.Form
            {...getFormProps("post", {
              encType: "multipart/form-data",
            })}
          >
            <FieldSet
              disabled={formDisabled.flag}
              readOnly={formReadonly.flag}
            >
              <Component1 />
              <Component2 />
            </FieldSet>
            <div className="flex gap-2">
              <Button
                type="submit"
                round
              >
                submit
              </Button>
              <Button
                type="reset"
                color="sub"
                round
              >
                reset
              </Button>
            </div>
          </fetcher.Form>
        </SchemaProvider>
      </section>
      <ThemeComponent />
      <LangComponent />
      <IndexedDBComponent />
      <StreamCompoment />
      <IconsComponent />
      <DialogComponent />
    </div>
  );
};

function Component1() {
  const { dataItems } = useSchemaContext<typeof schema>();

  const array = useSchemaArray(dataItems.structArray);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button
          appearance="outline"
          onClick={() => {
            array.push({
              name: "hoge",
            });
          }}
        >
          push last
        </Button>
        <Button
          appearance="outline"
          onClick={() => {
            array.push({
              name: "hogehoge",
            }, { position: "first" });
          }}
        >
          push first
        </Button>
        <Button
          appearance="outline"
          onClick={() => {
            array.bulkPush([
              { name: "fuga", age: 3 },
              { name: "piyo" },
            ]);
          }}
        >
          bulk push
        </Button>
      </div>
      <ul>
        {array.map(params => {
          return (
            <li key={params.key}>
              <span>
                {JSON.stringify(params.value)}
              </span>
              <TextBox
                $={params.dataItem.dataItems.name}
              />
              <NumberBox
                $={params.dataItem.dataItems.age}
              />
              <button
                type="button"
                onClick={() => {
                  params.remove();
                }}
              >
                delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function FormValueSetterComponent() {
  const { dataItems } = useSchemaContext<typeof schema>();

  const [value, setValue] = useSchemaValue(dataItems.range);

  return (
    <>
      <Button
        onClick={() => {
          setValue(40);
        }}
      >
        set value
      </Button>
      <span>{value}</span>
    </>
  );
};

function Component2() {
  const { dataItems } = useSchemaContext<typeof schema>();
  console.log("render");
  return (
    <div className="flex flex-row flex-wrap gap-2">
      <FormValueSetterComponent />
      <FormItem>
        <TextBox
          $={dataItems.text}
          placeholder="テキスト"
        />
      </FormItem>
      <FormItem>
        <NumberBox
          $={dataItems.count}
          placeholder="数値"
        />
      </FormItem>
      <FormItem>
        <SelectBox
          $={dataItems.generation}
          placeholder="世代"
        />
      </FormItem>
      <DynamicSelectBoxComponent />
      <FormItem>
        <CheckBox
          $={dataItems.check}
        >
          Check
        </CheckBox>
      </FormItem>
      <FormItem>
        <SwitchBox
          $={dataItems.numFlag}
        >
          Switch(Num)
        </SwitchBox>
      </FormItem>
      <FormItem>
        <RadioButtons
          $={dataItems.sourceText}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.date}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.datePair}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.month}
        />
      </FormItem>
      <FormItem>
        <DateBox
          $={dataItems.datetime}
        />
      </FormItem>
      <FormItem>
        <DateSelectBox
          $={dataItems.birth_year}
        />
      </FormItem>
      <FormItem>
        <TextArea
          $={dataItems.customMessageText}
        />
      </FormItem>
      <FormItem>
        <FileBox
          $={dataItems.file}
          placeholder="ファイルを選択してください。"
          viewMode="image"
        />
      </FormItem>
      <FormItem>
        <CheckList
          $={dataItems.array}
        />
      </FormItem>
      <FormItem>
        <Slider
          $={dataItems.range}
          omitOnSubmit
          showValueText
        />
      </FormItem>
      <FormItem>
        <NumberBox
          $={dataItems.range}
        />
      </FormItem>
    </div>
  );
};

function DynamicSelectBoxComponent() {
  const { dataItems } = useSchemaContext<typeof schema>();

  const [count, setCount] = useState(0);
  const [source, setSource] = useState<Schema.Source<string>>([
    { value: "hoge", text: "HOGE" },
    { value: "fuga", text: "FUGA" },
    { value: "piyo", text: "PIYO" },
  ]);

  return (
    <div>
      <Button
        onClick={() => {
          const c = count + 1;
          setCount(c);
          setSource([
            { value: "hoge", text: `HOGE - ${c}` },
            { value: "fuga", text: `FUGA - ${c}` },
            { value: "piyo", text: `PIYO - ${c}` },
          ]);
        }}
      >
        countup {count}
      </Button>
      <FormItem>
        <SelectBox
          $={dataItems.requiredText}
          source={source}
        />
      </FormItem>
    </div>
  );
};

function ThemeComponent() {
  const { theme, setTheme } = useTheme();

  const colors = ["primary", "secondary", "sub", "danger"] as const;

  return (
    <section>
      <Details summary="Theme">
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              setTheme("light");
            }}
          >
            light
          </Button>
          <Button
            onClick={() => {
              setTheme("dark");
            }}
          >
            dark
          </Button>
          <Button
            onClick={() => {
              setTheme("auto");
            }}
          >
            auto
          </Button>
          <span>
            {theme}
          </span>
        </div>
        <ul>
          <li>
            <h2>default</h2>
            <Button>FillButton</Button>
            <Button appearance="outline">OutlineButton</Button>
            <Button appearance="text">TextButton</Button>
          </li>
          {colors.map(color => {
            return (
              <li key={color}>
                <h2
                  className={clsx(
                    color === "primary" && "text-primary",
                    color === "secondary" && "text-secondary",
                    color === "sub" && "text-sub",
                    color === "danger" && "text-danger",
                  )}
                >
                  {color}
                </h2>
                <Button color={color}>FillButton</Button>
                <Button color={color} appearance="outline">OutlineButton</Button>
                <Button color={color} appearance="text">TextButton</Button>
              </li>
            );
          })}
        </ul>
      </Details>
    </section>
  );
};

function LangComponent() {
  const t = useText();
  const locale = useLocale();

  return (
    <section>
      <Details summary="i18n">
        <span>{t("halloWorld")}</span>
        <span>{t("replaceText", { hoge: "人民", fuga: 1000 })}</span>
        <div>{t("htmlText")}</div>
        <div>
          <Text
            i18nKey="htmlText"
            replaceMap={{
              replace1: (props: { children?: ReactNode; }) => (
                <span style={{ color: "red" }}>
                  完全に置き換えてもいいよ
                  {props.children}
                </span>
              ),
            }}
          />
        </div>
        {/* <p>
          <span>dangerouslySetInnerHTML</span>
          <div dangerouslySetInnerHTML={{ __html: t("htmlText") }} />
        </p> */}
        <div className="flex">
          <Button
            appearance={locale.lang === "ja" ? "fill" : "outline"}
            className="rounded-tr-none rounded-br-none"
            onClick={() => {
              locale.switch("ja");
            }}
          >
            日本語
          </Button>
          <Button
            appearance={locale.lang === "en" ? "fill" : "outline"}
            className="rounded-tl-none rounded-bl-none"
            onClick={() => {
              locale.switch("en");
            }}
          >
            English
          </Button>
        </div>
      </Details>
    </section>
  );
};

type Stores = IndexedDBStores<{
  hoge: {
    key: "email";
    data: {
      email: string;
      name: string;
      age: number;
    };
  };
}>;

function IndexedDBComponent() {
  const [db, setDB] = useState<IndexedDBController<Stores> | undefined>(undefined);

  useEffect(() => {
    getIndexedDB<Stores>({
      name: "template",
      upgrade: async ({ db, newVersion, oldVersion }) => {
        db.createObjectStore("hoge", { keyPath: "email" });
      },
    }).then((controller) => {
      setDB(controller);
      // controller.trans({ storeNames: "hoge" }, async ({ stores: { hoge } }) => {
      //   const value = await hoge.getByKey("hoge@example.com");
      //   console.log(value?.email);
      //   await hoge.deleteByKey("fuga@example.com");
      //   return;
      // });
    });
  }, []);

  return (
    <section>
      <Details summary="IndexedDB">
        {db == null
          ? "loading..."
          : <>
            <div className="flex flex-row gap-2">
              <Button
                onClick={async ({ unlock }) => {
                  const value = await db.read({
                    storeNames: "hoge",
                  }, async ({ hoge }) => {
                    return await hoge.getByKey("hoge@example.com");
                  });
                  console.log("get", value);
                  unlock();
                }}
              >
                show
              </Button>
              <Button
                onClick={async ({ unlock }) => {
                  const key = await db.write({
                    storeNames: "hoge",
                  }, async ({ hoge }) => {
                    return await hoge.insert({
                      email: "hoge@example.com",
                      age: 18,
                      name: "Tarou",
                    });
                  });
                  console.log("insert", key);
                  unlock();
                }}
              >
                add
              </Button>
              <Button
                onClick={async ({ unlock }) => {
                  const key = await db.write({
                    storeNames: "hoge",
                  }, async ({ hoge }) => {
                    const value = await hoge.getByKey("hoge@example.com");
                    if (value == null) return;
                    value.age = 88;
                    return await hoge.update(value);
                  });
                  console.log("update", key);
                  unlock();
                }}
              >
                update
              </Button>
              <Button
                onClick={async ({ unlock }) => {
                  const key = await db.write({
                    storeNames: "hoge",
                  }, async ({ hoge }) => {
                    hoge.upsert({
                      email: "fuga@example.com",
                      age: 0,
                      name: formatDate(new Date(), "yyyy-MM-dd hh:mm:ss") || "",
                    });
                  });
                  console.log("upsert", key);
                  unlock();
                }}
              >
                upsert
              </Button>
              <Button
                onClick={async ({ unlock }) => {
                  const result = await db.write({
                    storeNames: "hoge",
                  }, async ({ hoge }) => {
                    return await hoge.deleteByKey("hoge@example.com");
                  });
                  console.log("delete", result);
                  unlock();
                }}
              >
                delete
              </Button>
            </div>
          </>}
      </Details>
    </section>
  );
};

function StreamCompoment() {
  const [output, setOutput] = useState("");
  const abortController = useAbortController();

  async function fetchStream(timeout?: number) {
    await abortController.start(async (signal, setAbortCallback) => {
      try {
        const res = await fetch("/sandbox/stream", {
          method: "POST",
          signal,
        });
        if (!res.ok) throw new Error("response error");
        const reader = res.body?.getReader();

        setAbortCallback(() => {
          reader!.cancel("client aborted");
        });

        const decorder = new TextDecoder();
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          setOutput((prev) => prev + decorder.decode(value));
        }
      } catch (e) {
        console.error(e);
      }
    }, timeout);

    // try {
    //   const res = await fetch("/sandbox/stream", {
    //     method: "POST",
    //     signal: abortController.create(timeout),
    //   });
    //   if (!res.ok) throw new Error("response error");
    //   const reader = res.body?.getReader();
    //   const decorder = new TextDecoder();

    //   while (true) {
    //     const { done, value } = await reader!.read();
    //     if (done) break;
    //     setOutput((prev) => prev + decorder.decode(value));
    //   }
    // } catch (e) {
    //   console.error(e);
    // } finally {
    //   abortController.dispose();
    // }
  }

  const isProcessing = abortController.state === "processing";

  return (
    <section>
      <Details summary="Stream Response">
        <div className="flex flex-row gap-2">
          <Button
            disabled={isProcessing}
            onClick={async ({ unlock }) => {
              await fetchStream();
              unlock();
            }}
          >
            start
          </Button>
          <Button
            disabled={isProcessing}
            onClick={async ({ unlock }) => {
              await fetchStream(5000);
              unlock();
            }}
          >
            start(timeout: 5s)
          </Button>
          <Button
            disabled={!isProcessing}
            onClick={() => {
              abortController.abort();
            }}
          >
            abort
          </Button>
          <Button
            onClick={() => {
              setOutput("");
            }}
          >
            reset output
          </Button>
          <span>{abortController.state}</span>
        </div>
        <div className="break-words">
          {output}
        </div>
      </Details>
    </section>
  );
};

const icons = [
  PlusIcon,
  PlusCircleIcon,
  PlusCircleFillIcon,
  MinusIcon,
  MinusCircleIcon,
  MinusCircleFillIcon,
  CrossIcon,
  CrossCircleIcon,
  CrossCircleFillIcon,
  MenuIcon,
  MenuLeftIcon,
  MenuRightIcon,
  MenuLeftRightIcon,
  KebabMenuIcon,
  MeatballsMenuIcon,
  ChocolateMenuIcon,
  ChocolateMenuFillIcon,
  LeftIcon,
  LeftFillIcon,
  DoubleLeftIcon,
  DoubleLeftFillIcon,
  RightIcon,
  RightFillIcon,
  DoubleRightIcon,
  DoubleRightFillIcon,
  UpIcon,
  UpFillIcon,
  DoubleUpIcon,
  DoubleUpFillIcon,
  DownIcon,
  DownFillIcon,
  DoubleDownIcon,
  DoubleDownFillIcon,
  LeftRightIcon,
  UpDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  CalendarFillIcon,
  TodayIcon,
  TodayFillIcon,
  ClockIcon,
  ClockFillIcon,
  ListIcon,
  OrderListIcon,
  ListFilterIcon,
  ClearAllIcon,
  GridIcon,
  GridFillIcon,
  SaveIcon,
  SaveFillIcon,
  UndoIcon,
  RedoIcon,
  CloudIcon,
  CloudFillIcon,
  CloudDownloadIcon,
  CloudUploadIcon,
  DownloadIcon,
  UploadIcon,
  CircleIcon,
  CircleFillIcon,
  ReloadIcon,
  UnloadIcon,
  SyncIcon,
  HomeIcon,
  HomeFillIcon,
  ElementIcon,
  SmileIcon,
  SmileFillIcon,
  ButtonIcon,
  LinkIcon,
  ExLinkIcon,
  ContainerIcon,
  NavContainerIcon,
  PopupIcon,
  FormIcon,
  FormItemIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassPlusFillIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassMinusFillIcon,
  TextBoxIcon,
  TabContainerIcon,
  SlideContainerIcon,
  SplitContainerIcon,
  LoadingIcon,
  LabelIcon,
  LabelFillIcon,
  StepperIcon,
  VerticalDividerIcon,
  HorizontalDividerIcon,
  TooltipIcon,
  BadgeIcon,
  CardIcon,
  SignInIcon,
  SignOutIcon,
  FolderIcon,
  FolderFillIcon,
  FolderAddIcon,
  FolderAddFillIcon,
  FolderDeleteIcon,
  FolderDeleteFillIcon,
  FileIcon,
  FileFillIcon,
  FileAddIcon,
  FileAddFillIcon,
  FileDeleteIcon,
  FileDeleteFillIcon,
  ExclamationIcon,
  ExclamationCircleIcon,
  ExclamationCircleFillIcon,
  ExclamationTriangleIcon,
  ExclamationTriangleFillIcon,
  ExclamationDiamondIcon,
  ExclamationDiamondFillIcon,
  QuestionIcon,
  QuestionCircleIcon,
  QuestionCircleFillIcon,
  UserIcon,
  UserFillIcon,
  UserAddIcon,
  UserMinusIcon,
  UsersIcon,
  UsersFillIcon,
  PowerIcon,
  TrashCanIcon,
  TrashCanFillIcon,
  DeleteIcon,
  DeleteFillIcon,
  DeleteBackIcon,
  DeleteBackFillIcon,
  CheckIcon,
  CheckCircleIcon,
  CheckCircleFillIcon,
  ShareIcon,
  ShareFillIcon,
  BookmarkIcon,
  BookmarkFillIcon,
  GearIcon,
  GearFillIcon,
  PinIcon,
  PinFillIcon,
  MailIcon,
  MailFillIcon,
  StarIcon,
  StarFillIcon,
  StarHalfFillIcon,
  HeartIcon,
  HeartFillIcon,
  HeartHalfFillIcon,
  FilterIcon,
  FilterFillIcon,
  LocationIcon,
  LocationFillIcon,
  CameraIcon,
  CameraFillIcon,
];

function IconsComponent() {
  return (
    <section>
      <Details summary="Icons">
        <div className="details-content:">
          <ul className="flex flex-row flex-wrap gap-4 p-2">
            {icons.map((Icon, index) => {
              const IconlessName = Icon.name.match(/(.*)Icon/)?.[1];

              return (
                <li key={Icon.name}>
                  <h3 className="flex flex-row gap-2">
                    {index + 1}. {Icon.name} <Icon />
                  </h3>
                  <div className="flex gap-2 w-[300px]">
                    <Button>
                      <Icon />
                    </Button>
                    <Button
                      color="sub"
                      appearance="outline"
                      round
                    >
                      <Icon />
                    </Button>
                    <Button color="secondary">
                      <span>{IconlessName}</span>
                      <Icon />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Details>
    </section>
  );
};

function DialogComponent() {
  const dialog = useDialog();
  const [count, setCount] = useState(0);
  const t = useText();

  return (
    <section>
      <Details summary="Dialog">
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              dialog.showModal();
            }}
          >
            showModal
          </Button>
          <Button
            onClick={() => {
              dialog.show();
            }}
          >
            show
          </Button>
          <Button
            onClick={() => {
              dialog.close();
            }}
          >
            close
          </Button>
          <Button
            onClick={() => {
              setCount(c => c + 1);
            }}
          >
            countup
          </Button>
          <Button
            onClick={async ({ unlock }) => {
              await $alert({
                body: "Alert",
                color: "danger",
              });
              unlock();
            }}
          >
            alert
          </Button>
          <Button
            onClick={async ({ unlock }) => {
              const ret = await $confirm({
                header: "Confirm",
                body: (
                  <>
                    <span className="w-full text-left">confirm</span>
                    <span className="w-full text-center">confirm</span>
                    <span className="w-full text-right">confirm</span>
                  </>
                ),
                color: "sub",
                t,
              });
              console.log("confirm", ret);
              unlock();
            }}
          >
            confirm
          </Button>
          <Button
            onClick={() => {
              $alert({
                header: "Alert",
                body: "1\n2\n3\n4\n",
              });
            }}
          >
            alert eol
          </Button>
          <Button
            onClick={() => {
              setCount(c => c + 1);
              $toast({ body: `Toast ${count}` }).then(() => {
                console.log("toast closed.");
              });
            }}
          >
            toast
          </Button>
        </div>
        <dialog.Dialog className="p-4 grid items-center gap-4">
          <span>{count}</span>
          <Button
            onClick={() => {
              dialog.close();
            }}
          >
            close
          </Button>
        </dialog.Dialog>
      </Details>
    </section>
  );
};
