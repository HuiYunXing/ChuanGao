import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-device-search',
  templateUrl: './device-search.component.html',
  styleUrls: ['./device-search.component.scss']
})
export class DeviceSearchComponent implements OnInit {
  form: FormGroup;
  startTime: string;
  endTime: string;
  count: number;
  orgList: Array<any>;
  orgName: string;
  deviceList: Array<any>;
  orgType: number;
  assetName: string;
  deviceStartDate: string;
  deviceEndDate: string;
  login: Observable<any> = new Observable<any>();
  page = 0;
  size = 15;
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

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      assetName: new FormControl('', Validators.nullValidator)
    });
    this.login = store.select('login');
    this.cols = [
      { field: 'assetName', header: '资产名称' },
      { field: 'assetType', header: '资产类别' },
      { field: 'assetState', header: '资产状态' },
      { field: 'assetModel', header: '设备型号' },
      { field: 'assetNo', header: '设备编号' },
      { field: 'assetUser', header: '设备管理人' },
      { field: 'useOrg', header: '资产单位' },
      { field: 'buyNum', header: '购置数量' },
      { field: 'assetLife', header: '资产理论年限' },
      { field: 'buyDate', header: '购置日期' },
      { field: 'scrapDate', header: '报废日期' }
    ];
  }

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth() + 1;
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    } else {
      return '';
    }
  }

  selectedOrg($event) {
    this.orgList = $event;
  }

  submit() {
    if (!this.orgList || this.orgList.length === 0) {
      this.sharedService.addAlert('警告', '未选择机构');
    } else {
      this.getInfo(this.page, this.size);
    }
  }

  paginate(event) {
    this.getInfo(event.page, this.size);
  }

  getInfo(page: number, size: number) {
    this.form.value.startTime = this.dateFormat(this.deviceStartDate);
    this.form.value.endTime = this.dateFormat(this.deviceEndDate);
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
    this.sharedService
      .post('/FixedAsset/get', JSON.stringify(param), {
        httpOptions: true,
        animation: true
      })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
        }
        this.deviceList = res.data.fixedAssetDataList;
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
      if (res && res.isAdmin) {
        this.orgType = res.orgType;
        this.orgName = res.orgName;
        this.orgList = [{data: res.orgCode}];
        this.getInfo(this.page, this.size);
      }
    }).unsubscribe();
  }

}
