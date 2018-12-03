import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-leave-search',
  templateUrl: './leave-search.component.html',
  styleUrls: ['./leave-search.component.scss']
})
export class LeaveSearchComponent implements OnInit {
  form: FormGroup;
  applyDate: string;
  applyDateEnd: string;
  count: number;
  leaveDataList: Array<any>;
  orgList: Array<any>;
  order: number;
  page = 0;
  size = 15;
  param: any = {
    page: 0,
    size: 15
  }
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
  leaveType: any = {
    1: '事假',
    2: '年休',
    3: '补休',
    4: '病假',
    5: '产假',
    6: '婚假',
    7: '其他'
  };

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      listGroup: new FormControl('', Validators.nullValidator),
      userName: new FormControl('', Validators.nullValidator),
      leaveType: new FormControl('', Validators.nullValidator)
    });
    this.cols = [
      { field: 'orgName', header: '组织机构', sortItem: 'orgName' },
      { field: 'userName', header: '请假人', sortItem: 'userName' },
      { field: 'applyTypeCN', header: '请假类型', sortItem: 'applyType' },
      { field: 'applyDate', header: '开始请假时间', sortItem: 'applyDate' },
      { field: 'applyDateEnd', header: '结束请假时间', sortItem: 'applyDateEnd' },
      { field: 'remark', header: '请假理由', sortItem: 'remark' },
      { field: 'createTime', header: '登记时间', sortItem: 'createTime' }
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
    if (this.checkStation()) {
      this.sortByThis(item);
    }
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
    this.page = event.page;
    this.getInfo();
  }

  getInfo() {
    this.form.value.applyDate = this.dateFormat(this.applyDate);
    this.form.value.applyDateEnd = this.dateFormat(this.applyDateEnd);
    this.form.value.orgList = this.orgList.map(el => el.data);
    this.param = {
      page: this.page,
      size: this.size
    }
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        this.param[el] = this.form.value[el];
      }
    });
    if (this.param.leaveType) {
      this.param.leaveType = +this.param.leaveType;
    }
    this.sharedService.post('/Leave/getLeave', JSON.stringify(this.param) , {
              httpOptions: true,
              animation: true
            })
            .subscribe(res => {
                this.count = res.data.count;
                res.data.leaveDataList.forEach(el => {
                  el.applyTypeCN = this.leaveType[el.applyType];
                });
                this.leaveDataList = res.data.leaveDataList;
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
        if (this.orgType === 3) {
          this.getInfo();
        }
      }
    }).unsubscribe();
  }

}
