import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { work_post, politics, educational, list_group } from '../../../store/translate';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-attendance-compare',
  templateUrl: './attendance-compare.component.html',
  styleUrls: ['./attendance-compare.component.scss']
})
export class AttendanceCompareComponent implements OnInit {
  startTime: string;
  endTime: string;
  hasData = false;
  login: Observable<any> = new Observable<any>();
  selectionMode = 'single';
  isShow = false;
  planUserList: Array<any> = [];
  shiftChangeList: Array<any> = [];
  attendanceList: Array<any> = [];
  leaveList: Array<any> = [];
  en = {
    firstDayOfWeek: 0,
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  };
  myCalendar = [[], [], [], [], [], [], [], []];
  nowTime = new Date();
  now: string;
  _month = this.nowTime.getMonth() + 1;
  _year = this.nowTime.getFullYear();
  secheduleList: any;
  list_group = list_group;
  orgCode: string;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.now = this.dateFormat(this.nowTime);
    this.calendarInit(this.now);
    this.login = store.select('login');
  }

  calendarInit(mydate) {
    mydate = new Date(mydate);
    mydate = new Date(mydate.setMonth(mydate.getMonth() + 1));
    const monthLong = new Date(mydate.setDate(0)).getDate();
    const first = new Date(mydate.setDate(1));
    const startDate = first.getDay();
    for (let i = 0; i < 42; i++) {
      const row = Math.floor(i / 7);
      const col = Math.floor(i % 7);
      if (row === 0 && col < startDate) {
        const day = new Date((new Date(first)).setDate(first.getDate() - (startDate - col)));
        this.myCalendar[row][col] = {
          day: day,
          month: day.getMonth(),
          date: day.getDate()
        };
      }else {
        const day = new Date((new Date(first)).setDate(first.getDate() + (i - startDate)));
        this.myCalendar[row][col] = {
          day: day,
          month: day.getMonth(),
          date: day.getDate()
        };
      }
    }
  }

  hide() {
    this.isShow = false;
  }

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : (_date.getMonth() + 1);
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    }else {
      return '';
    }
  }

  bindSechedule() {
    const _month = (new Date(this.now)).getMonth();
    const _thisMonth = _month;
    const _thisMonthList = this.secheduleList.filter(el => {
      const diff = Math.abs((new Date(el.scheduleDate)).getMonth() - _thisMonth);
      return diff === 0 || diff === 1 || diff === 11;
    });
    _thisMonthList.forEach(el => {
      const day = new Date(el.scheduleDate);
      const month = day.getMonth();
      const date = day.getDate();
      this.myCalendar.forEach(row => {
        row.forEach(element => {
          if (element.date === date && element.month === month) {
            switch (el.shiftId) {
              case 1: {
                element.dayShift = {
                  shiftId: el.shiftId,
                  teamsGroup: el.teamsGroup,
                  scheduleType: el.scheduleType,
                };
                break;
              }
              case 2: {
                element.nightShift = {
                  shiftId: el.shiftId,
                  teamsGroup: el.teamsGroup,
                  scheduleType: el.scheduleType,
                };
                break;
              }
              case 3: {
                element.midShift = {
                  shiftId: el.shiftId,
                  teamsGroup: el.teamsGroup,
                  scheduleType: el.scheduleType,
                };
                break;
              }
            }
          }
        });
      });
    });
  }

  getInfo() {
    const param = {
      stationCode: this.orgCode,
      startTime: this.startTime,
      endTime: this.endTime
    };
    this.sharedService.post(
      '/Schedule/getTeamSchedule',
      JSON.stringify(param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.secheduleList = res.data.teamScheduleDataList;
        this.bindSechedule();
      }
    )
  }

  changeMonth(val) {
    this.nowTime.setMonth(this.nowTime.getMonth() + val);
    this._month = this.nowTime.getMonth() + 1;
    this._year = this.nowTime.getFullYear();
    this.now = this.dateFormat(this.nowTime);
    this.calendarInit(this.now);
    this.getTime();
    this.getInfo();
    this.bindSechedule();
  }

  resetToday() {
    this.nowTime = new Date();
    this._month = this.nowTime.getMonth() + 1;
    this._year = this.nowTime.getFullYear();
    this.now = this.dateFormat(this.nowTime);
    this.calendarInit(this.now);
    this.getTime();
    this.getInfo();
    this.bindSechedule();
  }

  getTime() {
    this.startTime = this.dateFormat(new Date((new Date(this.nowTime)).setDate(1)));
    this.endTime = this.dateFormat((new Date((new Date(this.nowTime)).setMonth(this.nowTime.getMonth() + 1))).setDate(0));
  }

  getAttendance(day, shift) {
    this.isShow = true;
    this.sharedService.post(
      '/Attendance/getCompare',
      JSON.stringify({
        stationCode: this.orgCode,
        date: this.dateFormat(day.day),
        shiftId: shift.shiftId
      }),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.planUserList = res.data.planUserList;
        this.shiftChangeList = res.data.shiftChangeList;
        this.attendanceList = res.data.attendanceList;
        this.leaveList = res.data.leaveList;
      }
    )
  }

  ngOnInit() {
    this.getTime();
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.orgCode = res.orgCode;
        this.getInfo();
      }
    }).unsubscribe();
  }

}
