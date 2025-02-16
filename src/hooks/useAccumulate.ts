import { RepeatEvents } from "@/enums/RepeatEvents";
import Event from "@/types/Event";
import { DailyEvent, ListOfDailyEvents } from "@/types/ListOfDailyEvents";
import {
  addDays,
  addMonths,
  areIntervalsOverlapping,
  differenceInDays,
  format,
  fromUnixTime,
} from "date-fns";

const useAccumulate = () => {
  const newEvent = (event: Event, currentDate: Date) => {
    const daysDifference = differenceInDays(
      currentDate,
      new Date(event.timestamp * 1000)
    );
    const updatedTimestamp =
      addDays(new Date(event.timestamp * 1000), daysDifference).getTime() /
      1000;

    return {
      id: event.id,
      timestamp: updatedTimestamp,
      startTime: event.time[0] + daysDifference * 86400,
      endTime: event.time[1] + daysDifference * 86400,
      collisions: 0,
      repeat: event.repeat,
      repeatID: `${event.id}_${updatedTimestamp}`,
    };
  };

  const accumulateEvents = (
    currentDate: Date,
    lastDateOfWeek: Date,
    dailyEvents: ListOfDailyEvents,
    event: Event
  ) => {
    while (
      (event.repeat === RepeatEvents.DAILY &&
        currentDate <= addDays(fromUnixTime(event.timestamp), 30)) ||
      currentDate <= lastDateOfWeek
    ) {
      const eventDateKey = format(currentDate, "P");

      if (!dailyEvents[eventDateKey]) {
        dailyEvents[eventDateKey] = [];
      }

      dailyEvents[eventDateKey].push(newEvent(event, currentDate));

      if (event.repeat === RepeatEvents.DAILY) {
        currentDate = addDays(currentDate, 1);
      } else if (event.repeat === RepeatEvents.MONTHLY) {
        currentDate = addMonths(currentDate, 1);
      } else {
        break;
      }
    }
  };

  const accumulateCollisions = (dailyEvents: DailyEvent[]) => {
    dailyEvents.forEach((event, i) => {
      for (let j = i + 1; j < dailyEvents.length; j++) {
        const compareEvent = dailyEvents[j];
        const firstEventStart = fromUnixTime(event.startTime);
        const firstEventEnd = fromUnixTime(event.endTime);
        const secondEventStart = fromUnixTime(compareEvent.startTime);
        const secondEventEnd = fromUnixTime(compareEvent.endTime);
        if (
          areIntervalsOverlapping(
            { start: firstEventStart, end: firstEventEnd },
            { start: secondEventStart, end: secondEventEnd }
          )
        ) {
          event.collisions++;
          compareEvent.collisions++;
        }
      }
    });
  };

  return { accumulateEvents, accumulateCollisions };
};

export default useAccumulate;
