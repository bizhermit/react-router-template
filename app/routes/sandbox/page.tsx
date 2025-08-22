/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState, type ReactNode } from "react";
import { data, useFetcher } from "react-router";
import { getAuth } from "~/auth/server/loader";
import getIndexedDB, { type IndexedDBController, type IndexedDBStores } from "~/components/client/indexeddb";
import { formatDate } from "~/components/objects/date";
import { parseNumber } from "~/components/objects/numeric";
import { Button } from "~/components/react/elements/button";
import { Details } from "~/components/react/elements/details";
import { useDialog } from "~/components/react/elements/dialog";
import { CheckBox } from "~/components/react/elements/form/check-box";
import { CheckList } from "~/components/react/elements/form/check-list";
import { FormItem } from "~/components/react/elements/form/common";
import { DateBox } from "~/components/react/elements/form/date-box";
import { DateSelectBox } from "~/components/react/elements/form/date-select-box";
import { FieldSet } from "~/components/react/elements/form/fieldset";
import { FileBox } from "~/components/react/elements/form/file-box";
import { NumberBox } from "~/components/react/elements/form/number-box";
import { PasswordBox } from "~/components/react/elements/form/password-box";
import { RadioButtons } from "~/components/react/elements/form/radio-buttons";
import { SelectBox } from "~/components/react/elements/form/select-box";
import { Slider } from "~/components/react/elements/form/slider";
import { SwitchBox } from "~/components/react/elements/form/switch-box";
import { TextArea } from "~/components/react/elements/form/text-area";
import { TextBox } from "~/components/react/elements/form/text-box";
import { Text } from "~/components/react/elements/i18n-text";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BadgeIcon, BookmarkFillIcon, BookmarkIcon, ButtonIcon, CalendarFillIcon, CalendarIcon, CameraFillIcon, CameraIcon, CardIcon, CheckCircleFillIcon, CheckCircleIcon, CheckIcon, ChocolateMenuFillIcon, ChocolateMenuIcon, CircleFillIcon, CircleIcon, ClearAllIcon, ClockFillIcon, ClockIcon, CloudDownloadIcon, CloudFillIcon, CloudIcon, CloudUploadIcon, ContainerIcon, CrossCircleFillIcon, CrossCircleIcon, CrossIcon, DeleteBackFillIcon, DeleteBackIcon, DeleteFillIcon, DeleteIcon, DocumentFillIcon, DocumentIcon, DoubleDownFillIcon, DoubleDownIcon, DoubleLeftFillIcon, DoubleLeftIcon, DoubleRightFillIcon, DoubleRightIcon, DoubleUpFillIcon, DoubleUpIcon, DownFillIcon, DownIcon, DownloadIcon, ElementIcon, ExclamationCircleFillIcon, ExclamationCircleIcon, ExclamationDiamondFillIcon, ExclamationDiamondIcon, ExclamationIcon, ExclamationTriangleFillIcon, ExclamationTriangleIcon, ExLinkIcon, FileAddFillIcon, FileAddIcon, FileDeleteFillIcon, FileDeleteIcon, FileFillIcon, FileIcon, FilterFillIcon, FilterIcon, FolderAddFillIcon, FolderAddIcon, FolderDeleteFillIcon, FolderDeleteIcon, FolderFillIcon, FolderIcon, FormIcon, FormItemIcon, GearFillIcon, GearIcon, GridFillIcon, GridIcon, HeartFillIcon, HeartHalfFillIcon, HeartIcon, HomeFillIcon, HomeIcon, HorizontalDividerIcon, KebabMenuIcon, LabelFillIcon, LabelIcon, LeftFillIcon, LeftIcon, LeftRightIcon, LinkIcon, ListFilterIcon, ListIcon, LoadingIcon, LocationFillIcon, LocationIcon, MagnifyingGlassIcon, MagnifyingGlassMinusFillIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusFillIcon, MagnifyingGlassPlusIcon, MailFillIcon, MailIcon, MeatballsMenuIcon, MenuIcon, MenuLeftIcon, MenuLeftRightIcon, MenuRightIcon, MinusCircleFillIcon, MinusCircleIcon, MinusIcon, NavContainerIcon, OrderListIcon, PinFillIcon, PinIcon, PlusCircleFillIcon, PlusCircleIcon, PlusIcon, PopupIcon, PowerIcon, QuestionCircleFillIcon, QuestionCircleIcon, QuestionIcon, RedoIcon, ReloadIcon, RightFillIcon, RightIcon, SaveFillIcon, SaveIcon, ShareFillIcon, ShareIcon, SignInIcon, SignOutIcon, SlideContainerIcon, SmileFillIcon, SmileIcon, SplitContainerIcon, StarFillIcon, StarHalfFillIcon, StarIcon, StepperIcon, SyncIcon, TabContainerIcon, TextBoxIcon, TodayFillIcon, TodayIcon, TooltipIcon, TrashCanFillIcon, TrashCanIcon, UndoIcon, UnloadIcon, UpDownIcon, UpFillIcon, UpIcon, UploadIcon, UserAddIcon, UserFillIcon, UserIcon, UserMinusIcon, UsersFillIcon, UsersIcon, VerticalDividerIcon } from "~/components/react/elements/icon";
import { Link } from "~/components/react/elements/link";
import { LinkButton } from "~/components/react/elements/link-button";
import { LoadingBar } from "~/components/react/elements/loading";
import { $alert, $confirm, $toast } from "~/components/react/elements/message-box";
import { NavLayout, useNavLayout } from "~/components/react/elements/nav-layout";
import { clsx } from "~/components/react/elements/utilities";
import { useAbortController } from "~/components/react/hooks/abort-controller";
import { useLocale, useText } from "~/components/react/hooks/i18n";
import { usePageExitPropmt } from "~/components/react/hooks/page-exit-prompt";
import { useSchema, useSchemaArray, useSchemaContext, useSchemaValue } from "~/components/react/hooks/schema";
import { useToggle } from "~/components/react/hooks/toggle";
import { useTheme } from "~/components/react/providers/theme";
import { $schema } from "~/components/schema";
import { $array } from "~/components/schema/array";
import { $bool } from "~/components/schema/boolean";
import { $date, $datetime, $month } from "~/components/schema/date";
import { $file } from "~/components/schema/file";
import { $num } from "~/components/schema/number";
import { getPayload } from "~/components/schema/server";
import { $str } from "~/components/schema/string";
import { $struct } from "~/components/schema/struct";
import sleep from "~/components/utilities/sleep";
import { internalApi } from "~/features/api/internal";
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
  password: $str({
    label: "パスワード",
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
      const source = [];
      if (firstOfMonth !== today) {
        source.push({ value: firstOfMonth, text: "月初" });
      }
      source.push({ value: today, text: "今日" });
      if (lastOfMonth !== today) {
        source.push({ value: lastOfMonth, text: "月末" });
      }
      return source;
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

export async function loader({ request, context }: Route.LoaderArgs) {
  console.log(import.meta.env.MODE);
  const auth = getAuth({ request, context });
  return data({});
};

export async function action(args: Route.ActionArgs) {
  console.log("-----------------");
  console.log(Array.from(args.request.headers.entries()));
  const start = performance.now();
  const submittion = await getPayload({
    request: args.request,
    schema,
  });
  // console.log(submittion);
  console.log(performance.now() - start);
  console.log("-----------------");

  const auth = getAuth({ request: args.request, context: args.context });
  await sleep(5000);

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
    getData,
    CsrfTokenHidden,
  } = useSchema({
    schema,
    state: fetcher.state,
    // validationTrigger: "submit",
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
    <div className="relative flex flex-col gap-4 p-4">
      {/* <LoadingBar color="primary" /> */}
      {fetcher.state === "submitting" && <LoadingBar />}
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
              console.log(getData());
            }}
          >
            show data
          </Button>
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
            <CsrfTokenHidden />
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
      <FetchComponent />
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
      <ul className="flex flex-col gap-2 p-4">
        {array.map(params => {
          return (
            <li
              key={params.key}
              className="flex flex-row gap-2 items-center"
            >
              <span>
                {JSON.stringify(params.value)}
              </span>
              <TextBox
                $={params.dataItem.dataItems.name}
              />
              <NumberBox
                $={params.dataItem.dataItems.age}
              />
              <Button
                appearance="outline"
                color="danger"
                onClick={() => {
                  params.remove();
                }}
              >
                <DeleteIcon />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function FormValueSetterComponent() {
  const { dataItems } = useSchemaContext<typeof schema>();

  const [value, setValue] = useSchemaValue(dataItems.birth_month);

  return (
    <>
      <Button
        onClick={() => {
          setValue(null);
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
        <PasswordBox
          $={dataItems.password}
          placeholder="パスワード"
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
        // appearance="button"
        // color="secondary"
        >
          <HeartFillIcon className="text-pink-400 dark:text-pink-400" />
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
          // appearance="button"
          color="primary"
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
          rows="fit"
          maxRows={5}
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
          // appearance="button"
          color="primary"
        />
      </FormItem>
      <FormItem>
        <Slider
          $={dataItems.range}
          omitOnSubmit
          showValueText
          color="secondary"
        />
      </FormItem>
      <FormItem>
        <NumberBox
          className="w-[10rem]"
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
  DocumentIcon,
  DocumentFillIcon,
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
        <ul className="flex flex-row flex-wrap gap-4 p-2">
          {icons.map((Icon, index) => {
            const IconlessName = Icon.name.match(/(.*)Icon/)?.[1] || Icon.name;

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
              dialog.show({ closeWhenScrolled: true });
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

function FetchComponent() {
  return (
    <section>
      <Details summary="Fetch">
        <div className="flex flex-row gap-2">
          <Button
            onClick={async ({ unlock }) => {
              try {
                const res = await internalApi.get("/health");
                if (!res.ok) {
                  return;
                }
                console.log(res.data.now);
              } catch (e) {
                console.error(e);
              } finally {
                unlock();
              }
            }}
          >
            health
          </Button>
          <Button
            onClick={async ({ unlock }) => {
              try {
                const res = await internalApi.get("/sandbox/api/{id}", {
                  path: {
                    id: 1,
                  },
                });
                console.log(res);
                if (!res.ok) {
                  return;
                }

                if (res.status === 200) {
                  res.data;
                } else {
                  res.data;
                }
              } catch (e) {
                console.error(e);
              } finally {
                unlock();
              }
            }}
          >
            get
          </Button>
          <Button
            onClick={async ({ unlock }) => {
              try {
                const res = await internalApi.post("/sandbox/api", {
                  body: {
                    title: "sample title",
                    body: "sample body",
                  },
                });
                console.log(res);
              } catch (e) {
                console.error(e);
              } finally {
                unlock();
              }
            }}
          >
            post
          </Button>
          <Button
            onClick={async ({ unlock }) => {
              try {
                const res = await internalApi.put("/sandbox/api/{id}", {
                  path: {
                    id: 1,
                  },
                  body: {
                    title: "sample",
                    body: "sample",
                    updated_at: "2025-11-11T11:11:11.111",
                    id: 1,
                  },
                });
                console.log(res);
              } catch (e) {
                console.error(e);
              } finally {
                unlock();
              }
            }}
          >
            put
          </Button>
          <Button
            onClick={async ({ unlock }) => {
              try {
                const res = await internalApi.delete("/sandbox/api/{id}", {
                  path: {
                    id: 1,
                  },
                });
                console.log(res);
              } catch (e) {
                console.error(e);
              } finally {
                unlock();
              }
            }}
          >
            delete
          </Button>
        </div>
      </Details>
    </section>
  );
};
