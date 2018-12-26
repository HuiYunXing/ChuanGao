import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-cloth-history',
  templateUrl: './cloth-history.component.html',
  styleUrls: ['./cloth-history.component.scss']
})
export class ClothHistoryComponent implements OnInit {
  form: FormGroup;
  clothesChangeStartDate: string;
  clothesChangeEndDate: string;
  count: number;
  clothesDataList: Array<any>;
  orgList: Array<any>;
  hasData = false;
  selectionMode = 'checkbox';
  order: number;
  param: any = {
    page: 0,
    size: 15
  }
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
  clothesType: any = {
    1: '冬装',
    2: '夏装',
    3: '头花',
    4: '春秋装'
  };
  clothesClassification: any = {
    1: '管理（执法）类服装',
    2: '收费类服装'
  };

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      clothesType: new FormControl('', Validators.nullValidator),
      clothesClassification: new FormControl('', Validators.nullValidator),
      clothesSex: new FormControl('', Validators.nullValidator)
    });
    this.cols = [
      { field: 'userName', header: '收费员名称', sortItem: 'userName' },
      { field: 'clothesTypeCN', header: '服装类型', sortItem: 'clothesType' },
      { field: 'clothesClassificationCN', header: '服装类别', sortItem: 'clothesClassification' },
      { field: 'clothesDate', header: '领用日期', sortItem: 'clothesDate' },
      { field: 'clothesChangeDate', header: '到期日期', sortItem: 'clothesChangeDate' },
      { field: 'clothesSex', header: '性别', sortItem: 'clothesSex' },
      { field: 'clothesNum', header: '数量', sortItem: 'clothesNum' },
      { field: 'stationName', header: '收费站', sortItem: 'orgName' }
    ];
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

  tableSort(item) {
    if(this.checkStation()) {
      this.sortByThis(item);
    }
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

  selectedOrg($event) {
    this.orgList = $event;
  }

  checkStation(): boolean {
    if (!this.orgList || this.orgList.length === 0) {
      this.sharedService.addAlert('警告', '未选择机构！');
      return false;
    }else if (this.orgList.filter(el => el.orgType !== 3).length > 0) {
      this.sharedService.addAlert('警告', '请选择收费站！');
      return false;
    }else {
      return true;
    }
  }

  submit() {
    if (this.checkStation()) {
      this.getInfo();
    }
  }

  paginate(event) {
    this.getInfo();
  }

  getInfo() {
    this.form.value.clothesChangeStartDate = this.dateFormat(this.clothesChangeStartDate);
    this.form.value.clothesChangeEndDate = this.dateFormat(this.clothesChangeEndDate);
    this.form.value.orgList = this.orgList.map(el => el.data);
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        this.param[el] = this.form.value[el];
      }
    });
    this.sharedService.post('/Clothes/get', JSON.stringify(this.param) , {
              httpOptions: true,
              animation: true,
              lock: true
            })
            .subscribe(res => {
                this.count = res.data.count;
                res.data.clothesDataList.forEach(el => {
                  el.clothesClassificationCN = this.clothesClassification[el.clothesClassification];
                  el.clothesTypeCN = this.clothesType[el.clothesType];
                });
                this.clothesDataList = res.data.clothesDataList;
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
          this.getInfo();
        }
      }
    }).unsubscribe();
  }

}
