import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { work_post } from '../../../../store/translate';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from '../../../../service/shared-service.service';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  levelList: Array<any>;
  hasData: boolean;
  workPost = work_post;
  form: FormGroup;
  staffList: any;
  data: any;
  computerLevelEvaluate: string;
  mandarinLevelEvaluate: string;
  en: any;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      userId: new FormControl('', Validators.nullValidator),
      computerLevel: new FormControl('', Validators.nullValidator),
      mandarinLevel: new FormControl('', Validators.nullValidator)
    });
    this.en = {
      firstDayOfWeek: 0,
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
  }

  add() {
    this.sharedService.post(
      '/Check/setCheckSkill',
      JSON.stringify(this.form.value),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe();
  }

  getInfo() {
    this.sharedService.get(
      `/Check/getCheckSkill?userId=${this.form.value.userId}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.data = res.data;
        this.form.patchValue(res.data);
        this.computerLevelEvaluate = res.data.computerLevelEvaluate || '';
        this.mandarinLevelEvaluate = res.data.mandarinLevelEvaluate || '';
      }
    )
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

  getStaff() {
    this.sharedService.get(
      `/BaseInfo/getStationUserId?stationCode=${this.orgCode}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => this.staffList = res.data
    );
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.orgCode = res.orgCode;
        this.getStaff();
      }
    }).unsubscribe();
  }

}
