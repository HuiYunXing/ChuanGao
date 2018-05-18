import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-check-search',
  templateUrl: './check-search.component.html',
  styleUrls: ['./check-search.component.scss']
})
export class CheckSearchComponent implements OnInit {
  form: FormGroup;
  startTime: string;
  endTime: string;
  count: number;
  yearList: Array<number> = [];
  dataList: Array<any>;
  orgList: Array<any>;
  page = 0;
  size = 15;
  hasData = false;
  selectionMode = 'checkbox';
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
  orgType: number;
  orgCode: string;
  orgName: string;
  login: Observable<any> = new Observable<any>();

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.cols = [
      { field: 'userName', header: '收费员名称' },
      { field: 'year', header: '考核年度' },
      { field: 'compositScore', header: '综合考核' },
      { field: 'examScore', header: '业务考核' },
      { field: 'star', header: '星评' },
      { field: 'computerLevel', header: '计算机等级' },
      { field: 'computerLevelEvaluate', header: '计算机评定时间' },
      { field: 'mandarinLevel', header: '普通话等级' },
      { field: 'mandarinLevelEvaluate', header: '普通话评定时间' },
      { field: 'picUrl', header: '证书图片' }
    ];
    const year = (new Date()).getFullYear();
    for (let i = 0; i < 10; i++) {
      this.yearList[i] = year - i;
    }
    this.form = new FormGroup({
      year: new FormControl(year, Validators.nullValidator)
    });
  }

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth();
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
    }else if (this.orgList.filter(el => el.orgType !==3).length) {
      this.sharedService.addAlert('警告', '请选择收费站！');
    }else {
      this.getInfo(this.page, this.size);
    }
  }

  paginate(event) {
    this.getInfo(event.page, this.size);
  }

  getInfo(page: number, size: number) {
    this.form.value.startTime = this.dateFormat(this.startTime);
    this.form.value.endTime = this.dateFormat(this.endTime);
    this.form.value.orgList = this.orgList.map(el => el.data);
    const param = {
      page: page,
      size: size,
    };
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        param[el] = this.form.value[el];
      }
    });
    this.sharedService.post('/Check/getDetail', JSON.stringify(param), {
      httpOptions: true
    })
      .subscribe(res => {
        this.count = res.data.count;
        this.dataList = res.data.checkDetailDataList;
        if (res.data.count > 0) {
          this.hasData = true;
        }
      });
  }

  check($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgType = res.orgType;
        this.orgCode = res.orgCode;
        this.orgName = res.orgName;
        this.orgList = [{
          data: res.orgCode,
          orgType: this.orgType
        }];
        if (res.orgType === 3) {
          this.getInfo(this.page, this.size);
        }
      }
    }).unsubscribe();
  }
}
