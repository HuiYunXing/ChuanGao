import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { applyType, shiftId, list_group } from '../../store/translate';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-switch-search',
  templateUrl: './switch-search.component.html',
  styleUrls: ['./switch-search.component.scss']
})
export class SwitchSearchComponent implements OnInit {
  form: FormGroup;
  startDate: string;
  endDate: string;
  count: number;
  applyType = applyType;
  list_group = list_group;
  shiftId = shiftId;
  shiftChangeDataList: Array<any>;
  orgList: Array<any>;
  page = 0;
  size = 15;
  hasData = false;
  selectionMode = 'checkbox';
  order: number;
  en = {
    firstDayOfWeek: 0,
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  };
  cols: any;
  checkItem = -1;
  param: any = {
    page: this.page,
    size: this.size
  };
  orgType: number;
  orgCode: string;
  orgName: string;
  applyChangeTypeCN = {
    1: '调班',
    2: '顶班'
  };
  login: Observable<any> = new Observable<any>();

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      listGroup: new FormControl('', Validators.nullValidator),
      userName: new FormControl('', Validators.nullValidator)
    });
    this.cols = [
      { field: 'orgName', header: '组织名称', sortItem: 'orgName'},
      { field: 'applyUserName', header: '换/顶班申请人', sortItem: 'applyUserName' },
      { field: 'applyTeamsCN', header: '换/顶班班组', sortItem: 'applyTeams' },
      { field: 'applyDate', header: '换/顶班日期', sortItem: 'applyDate' },
      { field: 'applyShiftCN', header: '换/顶班班次', sortItem: 'applyShift' },
      { field: 'applyChangeTypeCN', header: '排班类型', sortItem: 'applyChangeType' },
      { field: 'backUserName', header: '替班收费员', sortItem: 'backUserName' },
      { field: 'backTeamsCN', header: '替班班组', sortItem: 'backTeams' },
      { field: 'backDate', header: '替班日期', sortItem: 'backDate' },
      { field: 'backShiftCN', header: '替班班次', sortItem: 'backShift' },
      { field: 'remark', header: '备注', sortItem: 'remark' },
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
      this.paginate({page: 0});
    }
  }

  paginate(event) {
    this.param.page = event.page;
    this.getInfo();
  }

  getInfo() {
    this.form.value.startDate = this.dateFormat(this.startDate);
    this.form.value.endDate = this.dateFormat(this.endDate);
    this.form.value.orgList = this.orgList.map(el => el.data);
    this.param.applyChangeType = +this.checkItem;
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        this.param[el] = this.form.value[el];
      }
    });
    this.sharedService.post('/ShiftChange/get', JSON.stringify(this.param) , {
      httpOptions: true,
      animation: true
    })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
        }
        this.shiftChangeDataList = res.data.shiftChangeDataList;
        this.shiftChangeDataList.forEach(el => {
          el.applyTeamsCN = this.list_group[el.applyTeams];
          el.backTeamsCN = this.list_group[el.backTeams];
          el.applyShiftCN = this.shiftId[el.applyShift];
          el.backShiftCN = this.shiftId[el.backShift];
          el.returnShiftCN = this.shiftId[el.returnShift];
          el.applyChangeTypeCN = this.applyChangeTypeCN[el.applyChangeType];
        });
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
          orgType: res.orgType
        }];
        if (this.orgType === 3) {
          this.getInfo();
        }
      }
    }).unsubscribe();
  }

}
