import { Button } from "$/components/elements/button";
import { useRender } from "$/shared/hooks/render";
import { $Date, $DateTime } from "$/shared/objects/timestamp";
import { useState } from "react";

export default function Page() {
  const [dateValue, setDateValue] = useState<$DateTime>(() => new $DateTime());
  const render = useRender();

  return (
    <>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            const d = new $DateTime();
            console.log(d);
            setDateValue(d);
          }}
        >
          reset
        </Button>
        <Button
          onClick={() => {
            setDateValue(new $DateTime(new $Date(dateValue)));
          }}
        >
          set timestamp
        </Button>
        <Button
          onClick={() => {
            try {
              // setValue(new $DateTime("2020-01-02T12:34:56.789Asia/Tokyo"));
              // setValue(new $DateTime("2020-01-02T12:34:56.789+09:00"));
              // setValue(new $DateTime("2020-01-01T12:34:56.789+0900"));
              // setValue(new $DateTime("2020-01-02T12:34:56.789+00:00"));
              setDateValue(new $DateTime("Thu Apr 16 2026 18:28:52 GMT+0900 (日本標準時)"));
              // setValue(new $DateTime("Thu, 16 Apr 2026 01:20:30 GMT"));
            } catch (e) {
              console.error(e);
            }
          }}
        >
          set string
        </Button>
        <Button
          onClick={() => {
            const d = new Date();
            setDateValue(new $DateTime(d));
          }}
        >
          set date
        </Button>
        <Button
          onClick={() => {
            setDateValue(new $DateTime(Date.now()));
          }}
        >
          set number
        </Button>
        <Button
          onClick={() => {
            dateValue?.setNow();
            render();
          }}
        >
          set now
        </Button>
        <Button
          onClick={() => {
            dateValue.setMonth(2);
            render();
          }}
        >
          set month 8
        </Button>
        <Button
          onClick={() => {
            dateValue.setDay(0);
            render();
          }}
        >
          set day 0
        </Button>
        <Button
          onClick={() => {
            dateValue.setDay(1);
            render();
          }}
        >
          set day 1
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            dateValue.addYear(1);
            render();
          }}
        >
          add year 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMonth(1);
            render();
          }}
        >
          add month 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addDay(1);
            render();
          }}
        >
          add day 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addHour(1);
            render();
          }}
        >
          add hour 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMinute(1);
            render();
          }}
        >
          add minute 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addSecond(1);
            render();
          }}
        >
          add second 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMillisecond(1);
            render();
          }}
        >
          add millisecond 1
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            dateValue.addYear(-1);
            render();
          }}
        >
          minus year 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMonth(-1);
            render();
          }}
        >
          minus month 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addDay(-1);
            render();
          }}
        >
          minus day 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addHour(-1);
            render();
          }}
        >
          minus hour 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMinute(-1);
            render();
          }}
        >
          minus minute 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addSecond(-1);
            render();
          }}
        >
          minus second 1
        </Button>
        <Button
          onClick={() => {
            dateValue.addMillisecond(-1);
            render();
          }}
        >
          minus millisecond 1
        </Button>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          onClick={() => {
            dateValue.moveFirstDay();
            render();
          }}
        >
          move first day
        </Button>
        <Button
          onClick={() => {
            dateValue.moveLastDay();
            render();
          }}
        >
          move last day
        </Button>
      </div>
      {
        dateValue &&
        <ul className="px-8 py-4 list-disc">
          <li>年: {dateValue.getYear()}</li>
          <li>月: {dateValue.getMonth()}</li>
          <li>日: {dateValue.getDay()}</li>
          <li>時: {dateValue.getHour()}</li>
          <li>分: {dateValue.getMinute()}</li>
          <li>秒: {dateValue.getSecond()}</li>
          <li>ms: {dateValue.getMillisecond()}</li>
          <li>曜: {dateValue.getWeek()}</li>
          <hr />
          <li>iso: {dateValue.toISOString()}</li>
          <li>json: {dateValue.toJSON()}</li>
          <li>str: {dateValue.toString()}</li>
          <li>date: {dateValue.toDateString()}</li>
          <li>time: {dateValue.toTimeString()}</li>
          <li>offset: {dateValue.getOffset()}</li>
          <li>{dateValue.toString(`yyyy年MM月dd日(W) hh時mm分ss秒`)}</li>
          <li>{JSON.stringify({ value: dateValue })}</li>
        </ul>
      }
    </>
  );
};
