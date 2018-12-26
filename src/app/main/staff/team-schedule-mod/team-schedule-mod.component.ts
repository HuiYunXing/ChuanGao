import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { list_group } from '../../../store/translate';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-team-schedule-mod',
  templateUrl: './team-schedule-mod.component.html',
  styleUrls: ['./team-schedule-mod.component.scss']
})
export class TeamScheduleModComponent implements OnInit {
  form: FormGroup;
  startTime: string;
  endTime: string;
  count: number;
  modList: Array<any>;
  login: Observable<any> = new Observable<any>();
  selectionMode = 'single';
  orgCode: string;
  modDetail: Array<any>;
  list_group = list_group;
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
  addMod = false;
  col: Array<any>;
  shiftList = {
    1: '早班',
    2: '夜班',
    3: '中班'
  };

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      scheduleTypeDesc	: new FormControl('', Validators.nullValidator),
      scheduleDays: new FormControl('', Validators.nullValidator)
    });
    this.login = this.store.select('login');
    this.cols = [
      { field: 'cycleDay', header: '排班第几天' },
      { field: 'shiftId', header: '班次' }
    ];
  }

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth() + 1;
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    }else {
      return '';
    }
  }

  getInfo() {
    this.sharedService.get(
      `/Schedule/getScheduleMould?stationCode=${this.orgCode}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => this.modList = res.data
    );
  }

  modChange() {
    const days = this.form.value.scheduleDays;
    this.modDetail = [];
    for (let i = 1; i <= 2 * days; i++) {
      const shiftId = i % 2 === 1 ? 1 : 2;
      this.modDetail.push({
        shiftId: shiftId,
        cycleDay: Math.ceil(i / 2),
        teamsGroup: -1
      });
    }
  }

  submit() {
    if (this.form.value.scheduleDays && this.form.value.scheduleDays > 0) {
      this.modDetail.forEach(el => {
        el.teamsGroup = +el.teamsGroup;
      });
      const valid = this.modDetail.filter(el => el.teamsGroup === -1).length === 0;
      if (valid) {
        if (this.form.value.scheduleTypeDesc) {
          this.sharedService.post(
            '/Schedule/setScheduleMould',
            JSON.stringify({
              stationCode: this.orgCode,
              scheduleTypeDesc: this.form.value.scheduleTypeDesc,
              scheduleDays: this.form.value.scheduleDays,
              mouldLists: this.modDetail
            }),
            {
              httpOptions: true,
              successAlert: true,
              animation: true
            }
            ).subscribe(
              () => {
                this.getInfo();
                this.addMod = false,
                this.modDetail = [];
              }
            );
          } else {
            this.sharedService.addAlert('警告', '请填写模板描述！');
          }
      }else {
        this.sharedService.addAlert('警告', '请在所有班次选择班组！');
      }
    }else {
      this.sharedService.addAlert('警告', '请填写正确周期');
    }
  }

  test(val) {
    return val === this.checkItem;
  }

  searchModDetail(id) {
    this.sharedService.get(
      `/Schedule/getScheduleMouldList?scheduleType=${id}`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      res => this.modDetail = res.data
    )
  }

  add() {
    this.addMod = true;
    this.modDetail = [];
  }

  deleteMod() {
    if (this.checkItem) {
      this.sharedService.addConfirm('提示', '确认删除此模板？').subscribe(() => {
        this.sharedService.get(
          `/Schedule/deleteScheduleMould?scheduleType=${this.checkItem}`,
          {
            successAlert: false,
            animation: true
          }
        ).subscribe(
          () => this.getInfo()
        );
      })
    }else {
      this.sharedService.addAlert('警告', '请选择一个模板！');
    }
  }

  chooseMod(id) {
    this.checkItem = this.checkItem === id ? '' : id;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.orgCode = res.orgCode;
        this.getInfo();
      }
    }).unsubscribe();
  }

}
