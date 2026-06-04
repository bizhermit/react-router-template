import { Button } from "$/components/elements/button";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BadgeIcon, BookmarkFillIcon, BookmarkIcon, ButtonIcon, CalendarFillIcon, CalendarIcon, CameraFillIcon, CameraIcon, CardIcon, CheckCircleFillIcon, CheckCircleIcon, CheckIcon, ChocolateMenuFillIcon, ChocolateMenuIcon, CircleFillIcon, CircleIcon, ClearAllIcon, ClockFillIcon, ClockIcon, CloudDownloadIcon, CloudFillIcon, CloudIcon, CloudUploadIcon, ContainerIcon, CrossCircleFillIcon, CrossCircleIcon, CrossIcon, DeleteBackFillIcon, DeleteBackIcon, DeleteFillIcon, DeleteIcon, DocumentFillIcon, DocumentIcon, DoubleDownFillIcon, DoubleDownIcon, DoubleLeftFillIcon, DoubleLeftIcon, DoubleRightFillIcon, DoubleRightIcon, DoubleUpFillIcon, DoubleUpIcon, DownFillIcon, DownIcon, DownloadIcon, ElementIcon, ExclamationCircleFillIcon, ExclamationCircleIcon, ExclamationDiamondFillIcon, ExclamationDiamondIcon, ExclamationIcon, ExclamationTriangleFillIcon, ExclamationTriangleIcon, ExLinkIcon, FileAddFillIcon, FileAddIcon, FileDeleteFillIcon, FileDeleteIcon, FileFillIcon, FileIcon, FilterFillIcon, FilterIcon, FolderAddFillIcon, FolderAddIcon, FolderDeleteFillIcon, FolderDeleteIcon, FolderFillIcon, FolderIcon, FormIcon, FormItemIcon, GearFillIcon, GearIcon, GridFillIcon, GridIcon, HeartFillIcon, HeartHalfFillIcon, HeartIcon, HomeFillIcon, HomeIcon, HorizontalDividerIcon, KebabMenuIcon, LabelFillIcon, LabelIcon, LeftFillIcon, LeftIcon, LeftRightIcon, LinkIcon, ListFilterIcon, ListIcon, LoadingIcon, LocationFillIcon, LocationIcon, MagnifyingGlassIcon, MagnifyingGlassMinusFillIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusFillIcon, MagnifyingGlassPlusIcon, MailFillIcon, MailIcon, MeatballsMenuIcon, MenuIcon, MenuLeftIcon, MenuLeftRightIcon, MenuRightIcon, MinusCircleFillIcon, MinusCircleIcon, MinusIcon, NavContainerIcon, OrderListIcon, PinFillIcon, PinIcon, PlusCircleFillIcon, PlusCircleIcon, PlusIcon, PopupIcon, PowerIcon, QuestionCircleFillIcon, QuestionCircleIcon, QuestionIcon, RedoIcon, ReloadIcon, RightFillIcon, RightIcon, SaveFillIcon, SaveIcon, ShareFillIcon, ShareIcon, SignInIcon, SignOutIcon, SlideContainerIcon, SmileFillIcon, SmileIcon, SplitContainerIcon, StarFillIcon, StarHalfFillIcon, StarIcon, StepperIcon, SyncIcon, TabContainerIcon, TextBoxIcon, TodayFillIcon, TodayIcon, TooltipIcon, TrashCanFillIcon, TrashCanIcon, UndoIcon, UnloadIcon, UpDownIcon, UpFillIcon, UpIcon, UploadIcon, UserAddIcon, UserFillIcon, UserIcon, UserMinusIcon, UsersFillIcon, UsersIcon, VerticalDividerIcon, type IconProps } from "$/components/elements/icon";
import { type JSX } from "react";

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

export default function Page() {
  return (
    <section>
      <ul className="flex flex-row flex-wrap gap-4 p-4">
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
                  color="primary"
                  appearance="outline"
                  round
                >
                  <Icon />
                </Button>
                <Button color="mute" appearance="fill">
                  <span>{IconlessName}</span>
                  <Icon />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
