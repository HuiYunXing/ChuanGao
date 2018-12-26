import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as Actions from '../../../store/cacheStore.actions';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-green-search',
  templateUrl: './green-search.component.html',
  styleUrls: ['./green-search.component.scss']
})
export class GreenSearchComponent implements OnInit {
  en: any;
  cols: any;
  orgName: string;
  orgCode: string;
  login: Observable<any> = new Observable<any>();
  form: FormGroup;
  dateTime: string;
  orgType: number;
  param: any = {
    page: 0,
    size: 15
  };
  carCheckHisDataList: any;
  hasData: boolean;
  selectionMode = 'single';
  selected: any;
  count: any;
  order: number;

  boxType = ['开放货车', '封闭货车', '帆布货车', '其他货车'];
  carType = ['两轴货车', '三轴货车', '四轴货车', '五轴货车', '六轴货车'];
  shift = ['早班', '晚班'];
  firstCheck = ['未检', '合格', '不合格'];
  dealResult = ['免费放行', '缴费放行'];

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.en = {
      firstDayOfWeek: 0,
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
    this.login = store.select('login');
    this.cols = [
      { field: 'carNo', header: '车牌号', sortItem: 'carNo' },
      { field: 'boxTypeCN', header: '车型', sortItem: 'boxType' },
      { field: 'carTypeCN', header: '轴型', sortItem: 'carType' },
      { field: 'goods', header: '货物', sortItem: 'goods' },
      { field: 'entryName', header: '入口路段', sortItem: 'entryName' },
      { field: 'entryStation', header: '入口站', sortItem: 'entryStation' },
      { field: 'exportName', header: '出口路段', sortItem: 'exportName' },
      { field: 'exportStation', header: '出口站', sortItem: 'exportStation' },
      { field: 'shiftCN', header: '班次', sortItem: 'shift' },
      { field: 'firstCheckCN', header: '初检结果', sortItem: 'firstCheck' },
      { field: 'dealResultCN', header: '放行方式', sortItem: 'dealResult' },
      { field: 'moneyNew', header: '免/缴金额(元)', sortItem: 'money' },
      { field: 'shiftCar', header: '出口车道', sortItem: 'shiftCar' }
    ];
    this.form = new FormGroup({
      shift: new FormControl('-1', Validators.nullValidator),
      firstCheck: new FormControl('-1', Validators.nullValidator),
      carNo: new FormControl('', Validators.nullValidator),
      carType: new FormControl('-1', Validators.nullValidator)
    });
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

  sortByThis(item) {
    const index = this.cols.findIndex(el => el.sortItem === item.sortItem);
    const prev_index = this.cols.findIndex(el => el.isSort);
    if (this.param.column !== item.sortItem) {
      this.param.column = item.sortItem;
      this.order = 0;
      if (prev_index > -1) {
        this.cols[prev_index].isSort = false;
      }
      this.cols[index].isSort = true;
    }else {
      this.order = 1 - this.order;
    }
    this.param.order = this.order;
    this.getInfo();
  }

  selectedOrg($event) {
    this.selected = $event[0];
  }

  search() {
    if (this.selected) {
      if (this.selected.orgType !== 3) {
        this.sharedService.addAlert('警告', '请选择收费站！');
      }else {
        this.param.stationCode = this.selected.data;
        this.getInfo();
      }
    }else {
      if (this.orgType === 3) {
        this.getInfo();
      }else {
        this.sharedService.addAlert('警告', '请选择收费站！');
      }
    }
  }

  getInfo() {
    if (this.form.value.shift !== '-1') {
      this.param.shift = +this.form.value.shift;
    }
    if (this.form.value.firstCheck !== '-1') {
      this.param.firstCheck = +this.form.value.firstCheck;
    }
    if (this.form.value.carType !== '-1') {
      this.param.carType = +this.form.value.carType;
    }
    if (this.form.value.carNo !== '') {
      this.param.carNo = +this.form.value.carNo;
    }
    if (this.dateTime) {
      this.param.dateTime = this.dateFormat(this.dateTime);
    }
    this.sharedService.post(
      '/Green/getCarCheckHis',
      JSON.stringify(this.param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true,
        lock: true
      }
    ).subscribe(
      res => {
        this.carCheckHisDataList = res.data.carCheckHisDataList;
        this.carCheckHisDataList.forEach(el => {
          el.boxTypeCN = this.boxType[el.boxType];
          el.carTypeCN = this.carType[el.carType - 1];
          el.shiftCN = this.shift[el.shift - 1];
          el.firstCheckCN = this.firstCheck[el.firstCheck];
          el.dealResultCN = this.dealResult[el.dealResult - 1];
          el.moneyNew = (el.money / 100).toFixed(2);
        });
        if (res.data.count) {
          this.hasData = true;
          this.count = res.data.count;
        }else {
          this.hasData = false;
        }
      }
    )
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgName = res.orgName;
        this.orgCode = res.orgCode;
        this.param.stationCode = res.orgCode;
        this.orgType = res.orgType;
        if (this.orgType === 3) {
          this.getInfo();
        }
      }
    }).unsubscribe();
  }

}
