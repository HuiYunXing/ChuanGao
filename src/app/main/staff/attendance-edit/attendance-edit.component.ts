import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { work_post, politics, educational, list_group } from '../../../store/translate';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-attendance-edit',
  templateUrl: './attendance-edit.component.html',
  styleUrls: ['./attendance-edit.component.scss']
})
export class AttendanceEditComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  staffList: Array<any>;
  applyDate: string;
  shiftId: number;
  orgCode: string;
  teams: string;
  isShow: boolean;
  activedType: number;
  attenceSmallType: number;
  leaveUser: string;
  en = {
    firstDayOfWeek: 0,
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  };
  attendanceList: Array<any>;
  freeItemsList: Array<any>;
  attenceTypeToAdd: number;
  initType: Array<any>;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = this.store.select('login');
    this.attenceTypeToAdd = 0;
    this.shiftId = 0;
    this.attendanceList = [
      {
        value: '1',
        label: '实际上班',
        staff: []
      }
    ];
    this.initType = [
      {
        value: '2',
        label: '替班',
        staff: []
      },
      {
        value: '3',
        label: '加班',
        staff: []
      },
      {
        value: '4',
        label: '休息',
        staff: []
      },
      {
        value: '5',
        label: '请假',
        staff: []
      },
      {
        value: '6',
        label: '还班',
        staff: []
      },
      {
        value: '7',
        label: '旷工',
        staff: []
      },
      {
        value: '8',
        label: '早退',
        staff: []
      },
      {
        value: '9',
        label: '迟到',
        staff: []
      }
    ];
    this.freeItemsList = this.initType;
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

  removeStaff(val, id) {
    this.attendanceList.forEach(el => {
      if (+el.value === +val) {
        el.staff = el.staff.filter(user => user.userId !== id);
      }
    });
  }

  submit() {
    const attendanceStaffList: Array<any> = [];
    this.attendanceList.forEach(el => {
      if (el.staff && el.staff.length > 0) {
        el.staff.forEach(staff => {
          const user: any = {
            attenceUser: staff.userId,
            userTeams: el.teams,
            attenceType: el.value
          };
          if (+el.value === 5) {
            user.attenceSmallType = staff.attenceSmallType;
          }
          attendanceStaffList.push(user);
        });
      }
    });
    const param = {
      stationCode: this.orgCode,
      attenceDate: this.dateFormat(this.applyDate),
      shiftId: this.shiftId,
      attendanceStaffList: attendanceStaffList
    };
    if (!param.attenceDate) {
      this.sharedService.addAlert('警告', '请选择考勤日期！');
    }else if (!param.shiftId) {
      this.sharedService.addAlert('警告', '请选择班次！');
    }else {
      this.sharedService.post(
        '/Attendance/add',
        JSON.stringify(param),
        {
          httpOptions: true,
          successAlert: true,
          animation: true
        }
      ).subscribe(
        () => {
          this.freeItemsList = this.initType;
          this.attendanceList = [
            {
              value: '1',
              label: '实际上班',
              staff: []
            }
          ];
          this.applyDate = '';
          this.shiftId = 0;
        }
      )
    }
  }

  teamsChange() {
    if (this.teams) {
      this.getStaffs();
    }
  }

  getStaffs() {
    this.sharedService.get(
      `/ShiftChange/getUserByTeams?teams=${this.teams}&stationCode=${this.orgCode}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.staffList = res.data;
        const selected = this.attendanceList.filter(el => el.value === this.activedType)[0].staff;
        this.staffList.filter(el => selected.findIndex(item => item.userId === el.userId) > -1).forEach(el => {
          el.choose = true;
        });
      }
    )
  }

  getWorkStaffs(day, shift) {
    this.sharedService.post(
      '/Attendance/getCompare',
      JSON.stringify({
        stationCode: this.orgCode,
        date: this.dateFormat(day),
        shiftId: shift
      }),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.attendanceList[0].staff = res.data.planUserList;
      }
    )
  }

  addAttendanceType() {
    if (this.attenceTypeToAdd) {
      const item = this.freeItemsList.filter(el => el.value === this.attenceTypeToAdd)[0];
      this.attendanceList.push(item);
      this.freeItemsList = this.freeItemsList.filter(el => +el.value !== +this.attenceTypeToAdd);
      this.attenceTypeToAdd = 0;
    }else {
      this.sharedService.addAlert('警告', '请选择要添加的考勤类别！');
    }
  }

  chooseStaff(staff) {
    this.staffList.forEach(el => {
      if (el.userId === staff.userId) {
        el.choose = !el.choose;
      }
    });
  }

  addStaffs(val) {
    this.teams = '0';
    this.isShow = true;
    this.activedType = val;
  }

  staffSubmit() {
    if (+this.activedType !== 5) {
      this.attendanceList.forEach(el => {
        if (+el.value === +this.activedType) {
          this.staffList.filter(user => !user.choose).forEach(user => {
            const index = el.staff.findIndex(staff => staff.userId === user.userId);
            if (index > -1) {
              el.staff.splice(index, 1);
            }
          });
          const arr = el.staff.concat(this.staffList.filter(user => user.choose));
          el.staff = [];
          arr.forEach(staff => {
            if (el.staff.findIndex(item => item.userId === staff.userId) === -1) {
              el.staff.push(staff);
            }
          });
          el.teams = this.teams;
        }
      });
    }else {
      this.attendanceList.forEach(el => {
        if (+el.value === +this.activedType) {
          if (!el.staff) {
            el.staff = [];
          }
          const item = this.staffList.filter(user => user.userId === this.leaveUser)[0];
          item.attenceSmallType = this.attenceSmallType;
          el.staff.push(item);
          el.teams = this.teams;
        }
      });
    }
    this.isShow = false;
    this.staffList = [];
  }

  getNewWorkers() {
    if (this.applyDate && this.shiftId) {
      this.getWorkStaffs(this.applyDate, this.shiftId);
    }
  }

  staffCancel() {
    this.isShow = false;
    this.staffList = [];
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgCode = res.orgCode;
      }
    }).unsubscribe();
  }

}
