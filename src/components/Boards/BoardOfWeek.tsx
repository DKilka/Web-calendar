import { useEffect, useState } from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  getDate,
  lastDayOfMonth,
  startOfWeek,
  getUnixTime,
  parse,
  EachDayOfIntervalResult,
  subHours,
  addDays,
  isSameHour,
  fromUnixTime,
  setHours,
  isSameDay,
} from "date-fns";

import { Calendar } from "@/types/Calendar";
import Event from "@/types/Event";
import EventInfo from "../EventInfo/EventInfo";
import { listOfHours } from "@/utils/listOfTime";
import { RepeatEvents } from "@/enums/RepeatEvents";
import { ListOfDailyEvents } from "@/types/ListOfDailyEvents";
import useCalculate from "@/hooks/useCalculate";
import EventItem from "../EventItem/EventItem";
import HeaderOfBoard from "../HeaderOfBoard/HeaderOfBoard";

interface BoardOfWeekProps {
  currentDate: Date;
  calendars: Calendar[];
  events: Event[];
  setEditable: (el: boolean) => void;
  setCurrentEvent?: (el: Event) => void;
  setVisibilityEdit: (el: boolean) => void;
}

const BoardOfWeek = ({
  currentDate,
  calendars,
  events,
  setEditable,
  setCurrentEvent,
  setVisibilityEdit,
}: BoardOfWeekProps) => {
  const [daysOfWeek, setDaysOfWeek] = useState<
    EachDayOfIntervalResult<
      {
        start: Date;
        end: Date;
      },
      undefined
    >
  >(
    eachDayOfInterval({
      start: new Date(startOfWeek(new Date(currentDate))),
      end: new Date(endOfWeek(new Date(currentDate))),
    })
  );
  const weekdays: string[] = daysOfWeek.map((day) => format(day, "EEE"));
  const [daysInWeek, setDaysInWeek] = useState<number[]>([]);
  const [startWeek, setStartWeek] = useState<number>(
    startOfWeek(new Date(currentDate)).getDate()
  );
  const [lastDayInMonth, setLastDayInMonth] = useState<number>(
    lastDayOfMonth(new Date(currentDate)).getDate()
  );
  const [visibilityInfoModal, setVisibilityInfoModal] =
    useState<boolean>(false);
  const [listOfDailyEvents, setListOfDailyEvents] = useState<ListOfDailyEvents>(
    {}
  );

  useEffect(() => {
    setStartWeek(startOfWeek(new Date(currentDate)).getDate());
    setLastDayInMonth(lastDayOfMonth(new Date(currentDate)).getDate());
    setDaysOfWeek(
      eachDayOfInterval({
        start: new Date(startOfWeek(new Date(currentDate))),
        end: new Date(endOfWeek(new Date(currentDate))),
      })
    );
    setDaysInWeek([]);
  }, [currentDate]);

  useEffect(() => {
    //7 is a week
    for (let i = 0; i < 7; i++) {
      const day =
        startWeek + i <= lastDayInMonth
          ? startWeek + i
          : startWeek + i - lastDayInMonth;
      setDaysInWeek((prev) => [...prev, day]);
    }
  }, [startWeek]);

  useEffect(() => {
    // const { currentWeekNumber, eventsByWeek } = calculateEventsForWeek(
    //   events,
    //   currentDate
    // );
    // const updatedEvents = calculateCollisions(eventsByWeek, currentWeekNumber);
    // setListOfDailyEvents(updatedEvents);
  }, [events, currentDate]);

  const calculateId = (el: string, index: number) => {
    const currentDay = daysOfWeek[index];
    const parsedTime = parse(el, "h a", new Date(currentDate));
    const dayOfWeekDate = setHours(currentDay, parsedTime.getHours());

    return getUnixTime(subHours(dayOfWeekDate, 1));
  };

  const updateCurrentEvent = (el: Event) => {
    if (!visibilityInfoModal) {
      setVisibilityInfoModal(!visibilityInfoModal);
    }
    setCurrentEvent && setCurrentEvent(el);
  };

  const isEventOnDay = (event: Event, id: number): boolean => {
    const eventStartDate = new Date(event.timestamp * 1000);
    const halfYear = addDays(eventStartDate, 30);

    if (!event.repeat || event.repeat === RepeatEvents.DOES_NOT_REPEAT) {
      return isSameHour(eventStartDate, fromUnixTime(id));
    }

    if (event.repeat === RepeatEvents.DAILY) {
      const repeatID =
        (eventStartDate.getHours() === fromUnixTime(id).getHours() &&
          getUnixTime(eventStartDate) <= id &&
          getUnixTime(currentDate) <= getUnixTime(halfYear)) ||
        (isSameDay(eventStartDate, fromUnixTime(id)) &&
          isSameHour(eventStartDate, fromUnixTime(id)));
      if (repeatID) {
        const daysDifference =
          fromUnixTime(id).getDate() - eventStartDate.getDate();
        const updatedTimestamp = getUnixTime(
          addDays(new Date(event.timestamp * 1000), daysDifference)
        );
        event.repeatID = `${event.id}_${updatedTimestamp}`;
      }
      return (
        (eventStartDate.getHours() === fromUnixTime(id).getHours() &&
          getUnixTime(eventStartDate) <= id &&
          getUnixTime(currentDate) <= getUnixTime(halfYear)) ||
        (isSameDay(eventStartDate, fromUnixTime(id)) &&
          isSameHour(eventStartDate, fromUnixTime(id)))
      );
    }
    if (event.repeat === RepeatEvents.MONTHLY) {
      return (
        eventStartDate.getHours() === fromUnixTime(id).getHours() &&
        eventStartDate.getDate() === fromUnixTime(id).getDate() &&
        getUnixTime(currentDate) <= getUnixTime(halfYear)
      );
    }

    return false;
  };

  return (
    <>
      {
        <EventInfo
          events={events}
          isVisible={visibilityInfoModal}
          setEditable={setEditable}
          setVisibilityEdit={setVisibilityEdit}
          setVisibility={setVisibilityInfoModal}
        />
      }
      <section className="w-full rounded-lg bg-white">
        <HeaderOfBoard daysInWeek={daysInWeek} weekdays={weekdays} />
        <section className="overflow-y-scroll no-scrollbar h-[79vh]">
          {listOfHours.map((time: string) => {
            return (
              <div
                className="flex flex-row bg-white dark:bg-darkSub"
                key={crypto.randomUUID()}
              >
                <span className="text-center h-28 w-[14%] flex items-end justify-center bg-lightMain dark:bg-darkMain">
                  {time}
                </span>
                <div className="flex flex-row w-full">
                  {weekdays.map((_, index: number) => {
                    const id = calculateId(time, index);
                    return (
                      <div
                        className="border-b-2 border-l-2 w-[14.25%] relative"
                        id={id.toString()}
                        key={crypto.randomUUID()}
                      >
                        {events?.map((el: Event) => {
                          if (isEventOnDay(el, id) && el.calendar.isVisible) {
                            const currentCalendar: Calendar =
                              calendars.find(
                                (calendar) => calendar.name === el.calendar.name
                              ) || calendars[0];
                            const day = format(fromUnixTime(id), "P");

                            return (
                              <EventItem
                                key={crypto.randomUUID()}
                                el={el}
                                day={day}
                                listOfDailyEvents={listOfDailyEvents}
                                updateCurrentEvent={updateCurrentEvent}
                                currentCalendar={currentCalendar}
                              />
                            );
                          }
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </section>
    </>
  );
};

export default BoardOfWeek;
