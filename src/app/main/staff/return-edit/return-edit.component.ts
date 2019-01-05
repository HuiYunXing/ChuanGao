import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { applyType, shiftId, list_group } from '../../../store/translate';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-return-edit',
  templateUrl: './return-edit.component.html',
  styleUrls: ['./return-edit.component.scss']
})
export class ReturnEditComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  en: any;
  form: FormGroup;
  cols: any;
  orgCode: string;
  userId: string;
  order: number;
  param: any = {
    page: 0,
    size: 15
  };
  _returnDate: string;
  _returnShift: string;
  count: number;
  hasData = false;
  shiftChangeDataList: any;
  list_group = list_group;
  shiftId = shiftId;
  selectedSwitch: string;
  view = 0;
  _select: any;
  returnStatus = ['未还班', '已还班', '已过期'];
  checkResult = ['未审核', '已通过', '未通过'];
  applyDate: string;
  applyDateEnd: string;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.cols = [
      // { field: 'orgName', header: '组织名称' },
      { field: 'applyUserName', header: '换/顶班申请人', sortItem: 'applyUserName' },
      { field: 'applyTeamsCN', header: '换/顶班班组', sortItem: 'applyTeams' },
      { field: 'applyDate', header: '换/顶班日期', sortItem: 'applyDate' },
      { field: 'applyShiftCN', header: '换/顶班班次', sortItem: 'applyShift' },
      { field: 'returnShiftCN', header: '还班班次', sortItem: 'returnShift' },
      { field: 'returnDate', header: '还班日期', sortItem: 'returnDate' },
      { field: 'remark', header: '备注', sortItem: 'remark' },
      { field: 'createTime', header: '登记时间', sortItem: 'createTime' },
      { field: 'returnStatusCN', header: '还班状态', sortItem: 'returnStatus' }
    ];
    this.form = new FormGroup({
      remark: new FormControl('', Validators.nullValidator),
      applyTeams: new FormControl('', Validators.nullValidator),
      backTeams: new FormControl('', Validators.nullValidator),
      backShift: new FormControl('', Validators.nullValidator),
      returnShift: new FormControl('', Validators.nullValidator)
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

  getInfo() {
    this.sharedService.post(
      '/ShiftChange/get',
      JSON.stringify(this.param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true,
        lock: true
      }
    ).subscribe(
      res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
          this.shiftChangeDataList = res.data.shiftChangeDataList;
          this.shiftChangeDataList.forEach(el => {
            el.applyTeamsCN = this.list_group[el.applyTeams];
            el.applyShiftCN = this.shiftId[el.applyShift];
            el.returnStatusCN = this.returnStatus[el.returnStatus];
            el.returnCheckCN = this.checkResult[el.returnCheck];
            el.returnShiftCN = this.shiftId[el.returnShift];
          });
        } else {
          this.hasData = false;
          this.shiftChangeDataList = [];
        }
      }
    )
    delete this.param.startDate;
    delete this.param.endDate;
  }

  select(val) {
    this.selectedSwitch = val === this.selectedSwitch ? '' : val;
  }

  check(val) {
    return val === this.selectedSwitch;
  }

  return() {
    if (this.selectedSwitch) {
      this._select = this.shiftChangeDataList.filter(el => el.id === this.selectedSwitch)[0];
      if (this._select.returnStatus === 1) {
        this.sharedService.addAlert('警告', '此记录已还班！');
      }else if (this._select.returnStatus === 2) {
        this.sharedService.addAlert('警告', '此记录已超过可修改期限！');
      }else {
        this.view = 1;
      }
    }else {
      this.sharedService.addAlert('警告', '请选择换班记录！');
    }
  }

  returnSubmit() {
    this._select.returnDate = this.dateFormat(this._returnDate);
    this._select.returnShift = +this._returnShift;
    this.sharedService.post(
      '/ShiftChange/update',
      JSON.stringify(this._select),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.toFirstPage();
        this._select = '';
      }
    )
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    if (element) {
      this.view = 0;
      element.click();
    }else {
      this.getInfo();
    }
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
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

  search() {
    if (this.dateFormat(this.applyDate) > this.dateFormat(this.applyDateEnd)){
      this.sharedService.addAlert('警告','开始日期不能大于结束日期');
      return;
    }
    this.param.startDate = this.dateFormat(this.applyDate);
    this.param.endDate = this.dateFormat(this.applyDateEnd);
    this.getInfo();
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgCode = res.orgCode;
        this.userId = res.userId;
        this.param.orgList = [res.orgCode];
        this.param.applyChangeType = 1;
        this.param.back = false;
        this.getInfo();
      }
    }).unsubscribe();
  }

}
