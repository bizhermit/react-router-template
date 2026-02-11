/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import getIndexedDB, { type IndexedDBController, type IndexedDBStores } from "$/client/indexeddb";
import { Button$ } from "$/components/elements/button";
import { Button } from "$/components/elements/button/button";
import { LinkButton } from "$/components/elements/button/link-button";
import { Carousel, type CarouselOptions, type CarouselRef } from "$/components/elements/carousel";
import { Details } from "$/components/elements/details";
import { Dialog, useDialog } from "$/components/elements/dialog";
import { CheckBox$ } from "$/components/elements/form/check-box";
import { CheckBox } from "$/components/elements/form/check-box/check-box";
import { CheckList } from "$/components/elements/form/check-box/check-list";
import { ComboBox$, ComboBoxItem } from "$/components/elements/form/combo-box";
import { ComboBox } from "$/components/elements/form/combo-box/combo-box";
import { DateBox$ } from "$/components/elements/form/date-box";
import { DateBox } from "$/components/elements/form/date-box/date-box";
import { DateSelectBox } from "$/components/elements/form/date-box/date-select-box";
import { FieldSet } from "$/components/elements/form/fieldset";
import { FileBox$ } from "$/components/elements/form/file-box";
import { FileBox } from "$/components/elements/form/file-box/file-box";
import { NumberBox$ } from "$/components/elements/form/number-box";
import { NumberBox } from "$/components/elements/form/number-box/number-box";
import { PasswordBox$ } from "$/components/elements/form/password-box";
import { PasswordBox } from "$/components/elements/form/password-box/password-box";
import { RadioButtons } from "$/components/elements/form/radio-button/radio-buttons";
import { SelectBox$, SelectBoxEmptyOption } from "$/components/elements/form/select-box";
import { SelectBox } from "$/components/elements/form/select-box/select-box";
import { Slider$ } from "$/components/elements/form/slider";
import { Slider } from "$/components/elements/form/slider/slider";
import { TextArea$ } from "$/components/elements/form/text-area";
import { TextArea } from "$/components/elements/form/text-area/text-area";
import { TextBox$ } from "$/components/elements/form/text-box";
import { TextBox } from "$/components/elements/form/text-box/text-box";
import { FormItem } from "$/components/elements/form/wrapper/form-item";
import { Text } from "$/components/elements/i18n-text";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BadgeIcon, BookmarkFillIcon, BookmarkIcon, ButtonIcon, CalendarFillIcon, CalendarIcon, CameraFillIcon, CameraIcon, CardIcon, CheckCircleFillIcon, CheckCircleIcon, CheckIcon, ChocolateMenuFillIcon, ChocolateMenuIcon, CircleFillIcon, CircleIcon, ClearAllIcon, ClockFillIcon, ClockIcon, CloudDownloadIcon, CloudFillIcon, CloudIcon, CloudUploadIcon, ContainerIcon, CrossCircleFillIcon, CrossCircleIcon, CrossIcon, DeleteBackFillIcon, DeleteBackIcon, DeleteFillIcon, DeleteIcon, DocumentFillIcon, DocumentIcon, DoubleDownFillIcon, DoubleDownIcon, DoubleLeftFillIcon, DoubleLeftIcon, DoubleRightFillIcon, DoubleRightIcon, DoubleUpFillIcon, DoubleUpIcon, DownFillIcon, DownIcon, DownloadIcon, ElementIcon, ExclamationCircleFillIcon, ExclamationCircleIcon, ExclamationDiamondFillIcon, ExclamationDiamondIcon, ExclamationIcon, ExclamationTriangleFillIcon, ExclamationTriangleIcon, ExLinkIcon, FileAddFillIcon, FileAddIcon, FileDeleteFillIcon, FileDeleteIcon, FileFillIcon, FileIcon, FilterFillIcon, FilterIcon, FolderAddFillIcon, FolderAddIcon, FolderDeleteFillIcon, FolderDeleteIcon, FolderFillIcon, FolderIcon, FormIcon, FormItemIcon, GearFillIcon, GearIcon, GridFillIcon, GridIcon, HeartFillIcon, HeartHalfFillIcon, HeartIcon, HomeFillIcon, HomeIcon, HorizontalDividerIcon, KebabMenuIcon, LabelFillIcon, LabelIcon, LeftFillIcon, LeftIcon, LeftRightIcon, LinkIcon, ListFilterIcon, ListIcon, LoadingIcon, LocationFillIcon, LocationIcon, MagnifyingGlassIcon, MagnifyingGlassMinusFillIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusFillIcon, MagnifyingGlassPlusIcon, MailFillIcon, MailIcon, MeatballsMenuIcon, MenuIcon, MenuLeftIcon, MenuLeftRightIcon, MenuRightIcon, MinusCircleFillIcon, MinusCircleIcon, MinusIcon, NavContainerIcon, OrderListIcon, PinFillIcon, PinIcon, PlusCircleFillIcon, PlusCircleIcon, PlusIcon, PopupIcon, PowerIcon, QuestionCircleFillIcon, QuestionCircleIcon, QuestionIcon, RedoIcon, ReloadIcon, RightFillIcon, RightIcon, SaveFillIcon, SaveIcon, ShareFillIcon, ShareIcon, SignInIcon, SignOutIcon, SlideContainerIcon, SmileFillIcon, SmileIcon, SplitContainerIcon, StarFillIcon, StarHalfFillIcon, StarIcon, StepperIcon, SyncIcon, TabContainerIcon, TextBoxIcon, TodayFillIcon, TodayIcon, TooltipIcon, TrashCanFillIcon, TrashCanIcon, UndoIcon, UnloadIcon, UpDownIcon, UpFillIcon, UpIcon, UploadIcon, UserAddIcon, UserFillIcon, UserIcon, UserMinusIcon, UsersFillIcon, UsersIcon, VerticalDividerIcon, type IconProps } from "$/components/elements/icon";
import { Link } from "$/components/elements/link";
import { LoadingBar } from "$/components/elements/loading";
import { $alert, $confirm, $toast } from "$/components/elements/message-box";
import { NavLayout, useNavLayout } from "$/components/elements/nav-layout";
import { Style } from "$/components/elements/style";
import { clsx } from "$/components/elements/utilities";
import { useAbortController } from "$/shared/hooks/abort-controller";
import { useLocale, useText } from "$/shared/hooks/i18n";
import { usePageExitPropmt } from "$/shared/hooks/page-exit-prompt";
import { useSchema, useSchemaArray, useSchemaContext, useSchemaValue } from "$/shared/hooks/schema";
import { useSubWindow } from "$/shared/hooks/sub-window";
import { useToggle } from "$/shared/hooks/toggle";
import { formatDate } from "$/shared/objects/date";
import { parseNumber } from "$/shared/objects/numeric";
import { useTheme } from "$/shared/providers/theme";
import { $schema } from "$/shared/schema";
import { $array } from "$/shared/schema/array";
import { $bool } from "$/shared/schema/boolean";
import { $date, $datetime, $month } from "$/shared/schema/date";
import { $file } from "$/shared/schema/file";
import { $num } from "$/shared/schema/number";
import { getPayload } from "$/shared/schema/server";
import { $str } from "$/shared/schema/string";
import { $struct } from "$/shared/schema/struct";
import sleep from "$/shared/timing/sleep";
import { useEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { data, useFetcher } from "react-router";
import { api } from "~/api/shared/internal";
import { auth } from "~/auth/server/auth";
import type { Route } from "./+types";

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

const source = [
  { value: 0, text: "無印" },
  { value: 1, text: "AG" },
  { value: 2, text: "DP" },
  { value: 3, text: "BW" },
  { value: 4, text: "XY" },
  { value: 5, text: "SM" },
  { value: 6, text: "新無印" },
] as const satisfies Schema.Source<number>;

const source2 = [
  { value: 0, text: "無印" },
  { value: 1, text: "AG" },
  { value: 2, text: "DP" },
  { value: 3, text: "BW" },
  { value: 4, text: "XY" },
  { value: 5, text: "SM" },
  { value: 6, text: "新無印" },
] as const satisfies Schema.Source<number>;

const schema = $schema({
  text: $str({
    // required: true,
    // required: [true, "入力ヲ求ム"],
    required: [true, { type: "e", message: "入力しようよ！" }],
    // required: [true, (p) => {
    //   console.log(p);
    //   return { type: "e", otype: "str", code: "required", label: p.label };
    // }],
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
    required: [true, () => ({ type: "e", message: "入力しない場合、あなたの命は保証されません。" })],
  }),
  // customDynamicRequiredText: $str({
  //   required: [() => true, () => "入力しなくても命だけは獲らないでいてやる。"],
  // }),
  sourceText: $str({
    // required: true,
    source: [
      { value: "helloworld", text: "halloWorld" },
      { value: "hoge", text: "HOGE" },
      { value: "fuga", text: "FUGA" },
      { value: "piyo", text: "PIYO" },
    ] as const,
  }),
  count: $num({
    required: true,
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
    source: source,
  }),
  generation2: $num({
    // required: true,
    source: source2,
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

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    // console.log(session);
  } catch {
    // ignore
  }
  return data({});
};

export async function action(args: Route.ActionArgs) {
  console.log("-----------------");
  const session = await auth.api.getSession({
    headers: args.request.headers,
  });
  console.log(session);
  const start = performance.now();
  const submittion = await getPayload({
    request: args.request,
    schema,
  });
  console.log(submittion);
  console.log(performance.now() - start);
  console.log("-----------------");

  // await sleep(5000);

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
          <HomeIcon />
          <span>index</span>
        </Link>
      </li>
      <li>
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
      <li>
        <Link to="/sandbox/hoge">
          sandbox/hgoe
        </Link>
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
        <SchemaProvider
          readOnly={formReadonly.flag}
          disabled={formDisabled.flag}
        >
          <fetcher.Form
            {...getFormProps("post", {
              encType: "multipart/form-data",
            })}
          >
            <FieldSet
            // readOnly={formReadonly.flag}
            // disabled={formDisabled.flag}
            >
              <Component1 />
              <Component2 />
            </FieldSet>
            <div className="flex gap-2">
              <Button$
                type="submit"
                round
              >
                submit
              </Button$>
              <Button$
                type="reset"
                color="sub"
                round
              >
                reset
              </Button$>
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
      <CarouselComponent />
      <SubWindowComponent />
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
            }, {
              allowState: ["enabled", "readonly"],
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

  const [value, setValue] = useSchemaValue(dataItems.generation2);

  return (
    <>
      <Button
        onClick={() => {
          setValue(null);
        }}
      >
        set null
      </Button>
      <Button
        onClick={() => {
          // setValue("hoge\nfuga\npiyo\nhoge");
          setValue(2);
        }}
      >
        set hoge
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
        <TextBox$ inputProps={{ placeholder: "テキスト" }} />
      </FormItem>
      <FormItem>
        <PasswordBox
          $={dataItems.password}
          placeholder="パスワード"
        />
        <PasswordBox$ inputProps={{ placeholder: "パスワード" }} />
      </FormItem>
      <FormItem>
        <NumberBox
          $={dataItems.count}
          placeholder="数値"
        />
        <NumberBox$ inputProps={{ placeholder: "数値", min: 0 }} />
      </FormItem>
      <FormItem>
        <ComboBox
          $={dataItems.generation2}
          placeholder="世代"
          emptyText
        />
        <ComboBox$
          onChangeValue={console.log}
          // multiple
          initValue="3"
          placeholder="世代"
          manualWidth
          className="w-25"
        >
          {source2.map(item => {
            return (
              <ComboBoxItem
                key={item.value}
                value={item.value}
                displayValue={item.text}
              >
                {item.text}
              </ComboBoxItem>
            );
          })}
        </ComboBox$>
      </FormItem>
      <FormItem>
        <SelectBox
          $={dataItems.generation}
          placeholder="世代"
        />
        <SelectBox$ placeholder="世代">
          <SelectBoxEmptyOption>
            {/* (世代) */}
          </SelectBoxEmptyOption>
          {source.map(item => {
            return (
              <option
                key={item.value}
                value={item.value}
              >
                {item.text}
              </option>
            );
          })}
        </SelectBox$>
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
        <CheckBox$>
          CheckBox
        </CheckBox$>
      </FormItem>
      <FormItem>
        <CheckBox
          appearance="togglebox"
          $={dataItems.numFlag}
        >
          Switch(Num)
        </CheckBox>
        <CheckBox$ appearance="togglebox">
          CheckBox
        </CheckBox$>
      </FormItem>
      <FormItem>
        <RadioButtons
          $={dataItems.sourceText}
          // appearance="button"
          color="primary"
        />
      </FormItem>
      <FormItem>
        <DateBox$ />
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
        <TextArea$ textAreaProps={{ rows: "fit" }} />
        <TextArea
          $={dataItems.customMessageText}
          rows="fit"
          minRows={3}
          maxRows={5}
        />
      </FormItem>
      <FormItem>
        <FileBox$ inputProps={{ placeholder: "ファイルを選択してください。" }} />
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
        <Slider$ showValueText />
        <Slider
          $={dataItems.range}
          omitOnSubmit
          showValueText
          color="secondary"
        />
      </FormItem>
      <FormItem>
        <NumberBox
          className="w-16"
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
  const { flag, toggle } = useToggle(false);

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
        <div className="flex flex-row gap-2">
          <Button onClick={toggle}>disbaled: {String(flag)}</Button>
        </div>
        <ul>
          <li>
            <h2>default</h2>
            <div className="flex flex-row gap-2">
              <Button
                disabled={flag}
                onClick={async ({ unlock }) => {
                  console.log("click");
                  await sleep(3000);
                  unlock();
                }}
              >
                OutlineButton
              </Button>
              <Button disabled={flag} appearance="fill">FillButton</Button>
              <Button disabled={flag} appearance="text">TextButton</Button>
            </div>
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
                <div className="flex flex-row gap-2">
                  <Button disabled={flag} color={color}>OutlineButton</Button>
                  <Button disabled={flag} color={color} appearance="fill">FillButton</Button>
                  <Button disabled={flag} color={color} appearance="text">TextButton</Button>
                </div>
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
                <span className="text-red-500">
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
        <div className="wrap-break-word">
          {output}
        </div>
      </Details>
    </section>
  );
};

const icons: [string, (p: IconProps) => JSX.Element][] = [
  ["PlusIcon", PlusIcon],
  ["PlusCircleIcon", PlusCircleIcon],
  ["PlusCircleFillIcon", PlusCircleFillIcon],
  ["MinusIcon", MinusIcon],
  ["MinusCircleIcon", MinusCircleIcon],
  ["MinusCircleFillIcon", MinusCircleFillIcon],
  ["CrossIcon", CrossIcon],
  ["CrossCircleIcon", CrossCircleIcon],
  ["CrossCircleFillIcon", CrossCircleFillIcon],
  ["MenuIcon", MenuIcon],
  ["MenuLeftIcon", MenuLeftIcon],
  ["MenuRightIcon", MenuRightIcon],
  ["MenuLeftRightIcon", MenuLeftRightIcon],
  ["KebabMenuIcon", KebabMenuIcon],
  ["MeatballsMenuIcon", MeatballsMenuIcon],
  ["ChocolateMenuIcon", ChocolateMenuIcon],
  ["ChocolateMenuFillIcon", ChocolateMenuFillIcon],
  ["LeftIcon", LeftIcon],
  ["LeftFillIcon", LeftFillIcon],
  ["DoubleLeftIcon", DoubleLeftIcon],
  ["DoubleLeftFillIcon", DoubleLeftFillIcon],
  ["RightIcon", RightIcon],
  ["RightFillIcon", RightFillIcon],
  ["DoubleRightIcon", DoubleRightIcon],
  ["DoubleRightFillIcon", DoubleRightFillIcon],
  ["UpIcon", UpIcon],
  ["UpFillIcon", UpFillIcon],
  ["DoubleUpIcon", DoubleUpIcon],
  ["DoubleUpFillIcon", DoubleUpFillIcon],
  ["DownIcon", DownIcon],
  ["DownFillIcon", DownFillIcon],
  ["DoubleDownIcon", DoubleDownIcon],
  ["DoubleDownFillIcon", DoubleDownFillIcon],
  ["LeftRightIcon", LeftRightIcon],
  ["UpDownIcon", UpDownIcon],
  ["ArrowLeftIcon", ArrowLeftIcon],
  ["ArrowRightIcon", ArrowRightIcon],
  ["ArrowUpIcon", ArrowUpIcon],
  ["ArrowDownIcon", ArrowDownIcon],
  ["CalendarIcon", CalendarIcon],
  ["CalendarFillIcon", CalendarFillIcon],
  ["TodayIcon", TodayIcon],
  ["TodayFillIcon", TodayFillIcon],
  ["ClockIcon", ClockIcon],
  ["ClockFillIcon", ClockFillIcon],
  ["ListIcon", ListIcon],
  ["OrderListIcon", OrderListIcon],
  ["ListFilterIcon", ListFilterIcon],
  ["ClearAllIcon", ClearAllIcon],
  ["GridIcon", GridIcon],
  ["GridFillIcon", GridFillIcon],
  ["SaveIcon", SaveIcon],
  ["SaveFillIcon", SaveFillIcon],
  ["UndoIcon", UndoIcon],
  ["RedoIcon", RedoIcon],
  ["CloudIcon", CloudIcon],
  ["CloudFillIcon", CloudFillIcon],
  ["CloudDownloadIcon", CloudDownloadIcon],
  ["CloudUploadIcon", CloudUploadIcon],
  ["DownloadIcon", DownloadIcon],
  ["UploadIcon", UploadIcon],
  ["CircleIcon", CircleIcon],
  ["CircleFillIcon", CircleFillIcon],
  ["ReloadIcon", ReloadIcon],
  ["UnloadIcon", UnloadIcon],
  ["SyncIcon", SyncIcon],
  ["HomeIcon", HomeIcon],
  ["HomeFillIcon", HomeFillIcon],
  ["ElementIcon", ElementIcon],
  ["SmileIcon", SmileIcon],
  ["SmileFillIcon", SmileFillIcon],
  ["ButtonIcon", ButtonIcon],
  ["LinkIcon", LinkIcon],
  ["ExLinkIcon", ExLinkIcon],
  ["ContainerIcon", ContainerIcon],
  ["NavContainerIcon", NavContainerIcon],
  ["PopupIcon", PopupIcon],
  ["FormIcon", FormIcon],
  ["FormItemIcon", FormItemIcon],
  ["MagnifyingGlassIcon", MagnifyingGlassIcon],
  ["MagnifyingGlassPlusIcon", MagnifyingGlassPlusIcon],
  ["MagnifyingGlassPlusFillIcon", MagnifyingGlassPlusFillIcon],
  ["MagnifyingGlassMinusIcon", MagnifyingGlassMinusIcon],
  ["MagnifyingGlassMinusFillIcon", MagnifyingGlassMinusFillIcon],
  ["TextBoxIcon", TextBoxIcon],
  ["TabContainerIcon", TabContainerIcon],
  ["SlideContainerIcon", SlideContainerIcon],
  ["SplitContainerIcon", SplitContainerIcon],
  ["LoadingIcon", LoadingIcon],
  ["LabelIcon", LabelIcon],
  ["LabelFillIcon", LabelFillIcon],
  ["StepperIcon", StepperIcon],
  ["VerticalDividerIcon", VerticalDividerIcon],
  ["HorizontalDividerIcon", HorizontalDividerIcon],
  ["TooltipIcon", TooltipIcon],
  ["BadgeIcon", BadgeIcon],
  ["CardIcon", CardIcon],
  ["SignInIcon", SignInIcon],
  ["SignOutIcon", SignOutIcon],
  ["FolderIcon", FolderIcon],
  ["FolderFillIcon", FolderFillIcon],
  ["FolderAddIcon", FolderAddIcon],
  ["FolderAddFillIcon", FolderAddFillIcon],
  ["FolderDeleteIcon", FolderDeleteIcon],
  ["FolderDeleteFillIcon", FolderDeleteFillIcon],
  ["FileIcon", FileIcon],
  ["FileFillIcon", FileFillIcon],
  ["FileAddIcon", FileAddIcon],
  ["FileAddFillIcon", FileAddFillIcon],
  ["FileDeleteIcon", FileDeleteIcon],
  ["FileDeleteFillIcon", FileDeleteFillIcon],
  ["DocumentIcon", DocumentIcon],
  ["DocumentFillIcon", DocumentFillIcon],
  ["ExclamationIcon", ExclamationIcon],
  ["ExclamationCircleIcon", ExclamationCircleIcon],
  ["ExclamationCircleFillIcon", ExclamationCircleFillIcon],
  ["ExclamationTriangleIcon", ExclamationTriangleIcon],
  ["ExclamationTriangleFillIcon", ExclamationTriangleFillIcon],
  ["ExclamationDiamondIcon", ExclamationDiamondIcon],
  ["ExclamationDiamondFillIcon", ExclamationDiamondFillIcon],
  ["QuestionIcon", QuestionIcon],
  ["QuestionCircleIcon", QuestionCircleIcon],
  ["QuestionCircleFillIcon", QuestionCircleFillIcon],
  ["UserIcon", UserIcon],
  ["UserFillIcon", UserFillIcon],
  ["UserAddIcon", UserAddIcon],
  ["UserMinusIcon", UserMinusIcon],
  ["UsersIcon", UsersIcon],
  ["UsersFillIcon", UsersFillIcon],
  ["PowerIcon", PowerIcon],
  ["TrashCanIcon", TrashCanIcon],
  ["TrashCanFillIcon", TrashCanFillIcon],
  ["DeleteIcon", DeleteIcon],
  ["DeleteFillIcon", DeleteFillIcon],
  ["DeleteBackIcon", DeleteBackIcon],
  ["DeleteBackFillIcon", DeleteBackFillIcon],
  ["CheckIcon", CheckIcon],
  ["CheckCircleIcon", CheckCircleIcon],
  ["CheckCircleFillIcon", CheckCircleFillIcon],
  ["ShareIcon", ShareIcon],
  ["ShareFillIcon", ShareFillIcon],
  ["BookmarkIcon", BookmarkIcon],
  ["BookmarkFillIcon", BookmarkFillIcon],
  ["GearIcon", GearIcon],
  ["GearFillIcon", GearFillIcon],
  ["PinIcon", PinIcon],
  ["PinFillIcon", PinFillIcon],
  ["MailIcon", MailIcon],
  ["MailFillIcon", MailFillIcon],
  ["StarIcon", StarIcon],
  ["StarFillIcon", StarFillIcon],
  ["StarHalfFillIcon", StarHalfFillIcon],
  ["HeartIcon", HeartIcon],
  ["HeartFillIcon", HeartFillIcon],
  ["HeartHalfFillIcon", HeartHalfFillIcon],
  ["FilterIcon", FilterIcon],
  ["FilterFillIcon", FilterFillIcon],
  ["LocationIcon", LocationIcon],
  ["LocationFillIcon", LocationFillIcon],
  ["CameraIcon", CameraIcon],
  ["CameraFillIcon", CameraFillIcon],
];

function IconsComponent() {
  return (
    <section>
      <Details summary="Icons">
        <ul className="flex flex-row flex-wrap gap-4 p-2">
          {icons.map(([name, Icon], index) => {
            const IconlessName = name.match(/(.*)Icon/)?.[1] || name;

            return (
              <li key={name}>
                <h3 className="flex flex-row gap-2">
                  {index + 1}. {name} <Icon />
                </h3>
                <div className="flex gap-2 w-75 overflow-hidden">
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

  const closeWhenScrolled = useToggle();
  const preventEscapeClose = useToggle();
  const preventCloseWhenClickOuter = useToggle();
  const preventRootScroll = useToggle();
  const anchorRef = useRef<HTMLButtonElement>(null!);

  return (
    <section>
      <Details summary="Dialog">
        <div className="flex flex-row gap-2">
          <CheckBox$
            appearance="togglebox"
            checked={closeWhenScrolled.flag}
            onChangeChecked={closeWhenScrolled.toggle}
          >
            closeWhenScrolled
          </CheckBox$>
          <CheckBox$
            appearance="togglebox"
            checked={preventEscapeClose.flag}
            onChangeChecked={preventEscapeClose.toggle}
          >
            preventEscapeClose
          </CheckBox$>
          <CheckBox$
            appearance="togglebox"
            checked={preventCloseWhenClickOuter.flag}
            onChangeChecked={preventCloseWhenClickOuter.toggle}
          >
            preventCloseWhenClickOuter
          </CheckBox$>
          <CheckBox$
            appearance="togglebox"
            checked={preventRootScroll.flag}
            onChangeChecked={preventRootScroll.toggle}
          >
            preventRootScroll
          </CheckBox$>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              dialog.current?.showModal();
            }}
            ref={anchorRef}
          >
            showModal
          </Button>
          <Button
            onClick={() => {
              dialog.current?.show();
            }}
          >
            show
          </Button>
          <Button
            onClick={() => {
              dialog.current?.close();
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
        <Dialog
          className="p-4 grid items-center gap-4"
          anchor={{
            element: anchorRef,
            x: "inner-left",
            y: "outer-top",
          }}
          ref={dialog}
          closeWhenScrolled={closeWhenScrolled.flag}
          preventEscapeClose={preventEscapeClose.flag}
          preventCloseWhenClickOuter={preventCloseWhenClickOuter.flag}
          preventRootScroll={preventRootScroll.flag}
        >
          <span>{count}</span>
          <NumberBox$
            value={count}
            onChangeValue={v => setCount(v ?? 0)}
          />
          <Button
            onClick={() => {
              dialog.current?.close();
            }}
          >
            close
          </Button>
        </Dialog>
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
                const res = await api.get("/health");
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
                const res = await api.get("/sandbox/api/{id}", {
                  path: {
                    id: "1",
                  },
                });
                console.log(res);
                if (!res.ok) {
                  return;
                }

                if (res.status === 200) {
                  res.data;
                } else {
                  // res.data
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
                const res = await api.post("/sandbox/api", {
                  body: {
                    title: "sample title",
                    body: "sample body",
                    updatedAt: "",
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
                const res = await api.put("/sandbox/api/{id}", {
                  path: {
                    id: "1",
                  },
                  body: {
                    title: "sample",
                    body: "sample",
                    updatedAt: "2025-11-11T11:11:11.111",
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
                const res = await api.delete("/sandbox/api/{id}", {
                  path: {
                    id: "1",
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

function CarouselComponent() {
  const [align, setAlign] = useState<CarouselOptions["align"]>();
  const [removePaddingSpace, setRemovePaddingSpace] = useState<CarouselOptions["removePadding"]>();
  const [slideWidth, setSlideWidth] = useState<string | undefined>(undefined);
  const carousel = useRef<CarouselRef | null>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section>
      <Details summary="Carousel">
        <div>
          <span>Align: {align} &lt;- </span>
          <Button onClick={() => setAlign(undefined)}>unset</Button>
          <Button onClick={() => setAlign("start")}>start</Button>
          <Button onClick={() => setAlign("center")}>center</Button>
          <Button onClick={() => setAlign("end")}>end</Button>
        </div>
        <div>
          <span>remove PaddingSpace: {String(removePaddingSpace)} &lt;- </span>
          <Button onClick={() => setRemovePaddingSpace(undefined)}>unset</Button>
          <Button onClick={() => setRemovePaddingSpace(false)}>padding</Button>
          <Button onClick={() => setRemovePaddingSpace(true)}>remove</Button>
        </div>
        <div>
          <span>slide width</span>
          <Button onClick={() => setSlideWidth(undefined)}>unset</Button>
          <Button onClick={() => setSlideWidth("100%")}>100%</Button>
          <Button onClick={() => setSlideWidth("75%")}>75%</Button>
          <Button onClick={() => setSlideWidth("100px")}>100px</Button>
          <Button onClick={() => setSlideWidth("250px")}>250px</Button>
        </div>
        <div className="w-full bg-red-600 p-8 flex flex-col h-75">
          {
            slideWidth != null &&
            <Style suppressHydrationWarning>
              {`#carousel{--slide-width:${slideWidth}}`}
            </Style>
          }
          <Carousel
            className="w-full bg-bg grow shrink"
            align={align}
            removePadding={removePaddingSpace}
            ref={carousel}
            id="carousel"
            onChangeScroll={setHasScroll}
            onChange={setCurrentIndex}
          >
            {[0, 1, 2, 3, 4, 5].map((num) => {
              return {
                key: num,
                element: (
                  <div className="grid place-items-center h-full w-full border border-gray-500">
                    {num}
                  </div>
                ),
              };
            })}
          </Carousel>
          {hasScroll &&
            <ol className="flex flex-row justify-center w-full gap-4 flex-none">
              {
                [0, 1, 2, 3, 4, 5].map((num) => {
                  return (
                    <li key={num}>
                      <Button
                        appearance="fill"
                        onClick={() => carousel.current?.select(num)}
                        color={currentIndex === num ? "primary" : "sub"}
                      >
                        {num}
                      </Button>
                    </li>
                  );
                })
              }
            </ol>}
        </div>
      </Details>
    </section>
  );
};

function SubWindowComponent() {
  const win = useSubWindow();

  return (
    <section>
      <Details summary="Sub Window">
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => {
              win.closeAll();
            }}
          >
            close all
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=unmount",
                closeTrigger: {
                  unmount: true,
                },
              });
            }}
          >
            open(unmount)
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=closeTab",
                closeTrigger: {
                  closeTab: true,
                },
              });
            }}
          >
            open(close tab)
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=transitionPage",
                closeTrigger: {
                  transitionPage: true,
                },
              });
            }}
          >
            open(transition page)
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=none",
              });
            }}
          >
            open
          </Button>
        </div>
      </Details>
    </section>
  );
};
