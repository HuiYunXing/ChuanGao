import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { work_post, politics, educational, list_group } from '../../store/translate';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-team-schedule-search',
  templateUrl: './team-schedule-search.component.html',
  styleUrls: ['./team-schedule-search.component.scss']
})
export class TeamScheduleSearchComponent implements OnInit {
  form: FormGroup;
  startTime: string;
  endTime: string;
  count: number;
  staffList: Array<any>;
  orgList: Array<any>;
  hasData = false;
  selectionMode = 'single';
  en = {
    firstDayOfWeek: 0,
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  };
  cols: any;
  checkItem: number;
  myCalendar = [[], [], [], [], [], [], [], []];
  nowTime = new Date();
  now: string;
  _month = this.nowTime.getMonth() + 1;
  _year = this.nowTime.getFullYear();
  secheduleList: any = [];
  list_group = list_group;
  orgType: number;
  orgCode: string;
  orgName: string;
  login: Observable<any> = new Observable<any>();
  today: string;

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.today = this.dateFormat(this.nowTime);
    this.now = this.dateFormat(this.nowTime.setDate(1));
    this.login = store.select('login');
    this.form = new FormGroup({
      teamsGroup: new FormControl('', Validators.nullValidator),
      shiftId: new FormControl('', Validators.nullValidator),
      userId: new FormControl('', Validators.nullValidator)
    });
    this.cols = [
      { field: 'userName', header: '姓名' },
      { field: 'userSex', header: '性别' },
      { field: 'politicalStatus', header: '政治面貌' },
      { field: 'userTel', header: '手机号码' },
      { field: 'userMail', header: '邮箱' },
      { field: 'workPost', header: '岗位' },
      { field: 'educational', header: '学历' },
      { field: 'listGroup', header: '班组' },
      { field: 'orgName', header: '组织名称' }
    ];
    this.calendarInit(this.now);
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
          year: day.getFullYear(),
          month: day.getMonth(),
          date: day.getDate()
        };
      }else {
        const day = new Date((new Date(first)).setDate(first.getDate() + (i - startDate)));
        this.myCalendar[row][col] = {
          day: day,
          year: day.getFullYear(),
          month: day.getMonth(),
          date: day.getDate()
        };
        if (this.dateFormat(day) === this.today) {
          this.myCalendar[row][col].today = true;
        }
      }
    }
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

  selectedOrg($event) {
    this.orgList = $event;
  }

  submit() {
    if (!this.orgList || this.orgList.length === 0) {
      this.sharedService.addAlert('警告', '请选择机构！');
    }else if (this.orgList.filter(el => el.orgType !== 3).length > 0) {
      this.sharedService.addAlert('警告', '请选择收费站！');
    }else {
      this.calendarInit(this.now);
      this.getInfo();
    }
  }

  paginate(event) {
    this.getInfo();
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
      const year = day.getFullYear();
      const month = day.getMonth();
      const date = day.getDate();
      this.myCalendar.forEach(row => {
        row.forEach(element => {
          if (element.date === date && element.month === month && element.year === year) {
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
    this.form.value.startTime = this.dateFormat(this.startTime);
    this.form.value.endTime = this.dateFormat(this.endTime);
    this.form.value.stationCode = this.orgList[0].data;
    this.form.value.teamsGroup = +this.form.value.teamsGroup;
    const param: any = {};
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        param[el] = this.form.value[el];
      }
    });
    if (param.teamsGroup === 0) {
      delete param.teamsGroup;
    }
    this.sharedService.post('/Schedule/getTeamSchedule', JSON.stringify(param) , {
              httpOptions: true,
              animation: true
            })
            .subscribe(res => {
              this.secheduleList = res.data.teamScheduleDataList;
              this.bindSechedule();
            });
  }

  teamChange($event) {
    if (this.orgList.length > 0 && $event.target.length !== -1) {
      this.getStaffs($event.target.value, this.orgList[0].data);
    }
  }

  getStaffs(teams, orgCode) {
    this.sharedService.get(`/ShiftChange/getUserByTeams?teams=${teams}&stationCode=${orgCode}`, {
      animation: true
    })
            .subscribe(res => {
                this.staffList = res.data;
            });
  }

  check($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  changeMonth(val) {
    this.nowTime.setMonth(this.nowTime.getMonth() + val);
    this._month = this.nowTime.getMonth() + 1;
    this._year = this.nowTime.getFullYear();
    this.now = this.dateFormat(this.nowTime);
    this.calendarInit(this.now);
    this.bindSechedule();
  }

  resetToday() {
    this.nowTime = new Date();
    this._month = this.nowTime.getMonth() + 1;
    this._year = this.nowTime.getFullYear();
    this.today = this.dateFormat(this.nowTime);
    this.now = this.dateFormat(this.nowTime.setDate(1));
    this.calendarInit(this.now);
    this.bindSechedule();
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgType = res.orgType;
        this.orgCode = res.orgCode;
        this.orgName = res.orgName;
        this.orgList = [{
          data: res.orgCode,
          orgType: res.orgType
        }];
        const date = new Date();
        this.startTime = this.sharedService.dateFormat(new Date(date.setDate(1)));
        this.endTime = this.sharedService.dateFormat(new Date(date.setMonth(date.getMonth() + 1)).setDate(0));
        this.getInfo();
      }
    }).unsubscribe();
  }

}
