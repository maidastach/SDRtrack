import { Injectable } from '@angular/core';
import { format, formatISO, parseISO } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService
{
  followingDay: Date;
  today: Date;

  constructor() {
    const oneDay = 24 * 60 * 60 * 1000;
    this.today = new Date();
    this.followingDay = new Date(this.today.getTime() + oneDay);
    console.log('datetime constructor');
   }

  parseIsoToString(date: string)
  {
    return format(parseISO(date), 'MMM, dd yyyy h:mma');
  }

  todayISO(): string
  {
    return formatISO(this.today);
  }

  tomorrowsDate(): Date
  {
    return this.followingDay;
  }

  todaysDate(): Date
  {
    return this.today;
  }

  parseDatetoSearch(date: Date)
  {
    return format(date, 'MMM, dd yyyy');
  }
}
