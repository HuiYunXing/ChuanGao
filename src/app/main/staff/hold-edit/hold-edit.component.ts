import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { applyType, list_group } from '../../../store/translate';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-hold-edit',
  templateUrl: './hold-edit.component.html',
  styleUrls: ['./hold-edit.component.scss']
})
export class HoldEditComponent implements OnInit {
  data: any = {};
  list_group = list_group;
  form: FormGroup;
  staffId: string;
  applyType = applyType;
  applyDate: string;
  applyDateEnd: string;
  checkUserId: string;
  en: any;
  changeTime: string;
  file: any;
  filename: string;
  isChosen = false;
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  count: number;
  holdList: Array<any>;
  staffList: Array<any>;
  hasData: boolean;
  cols: Array<any>;
  selectedLeave = '';
  isAdd: boolean;
  keys: Array<any>;
  searchName: string;
  orgType: number;
  initForm: any;
  order: number;
  param: any = {
    page: 0,
    size: 15,
    applyChangeType: 2
  };

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      applyUserId: new FormControl('', Validators.nullValidator),
      applyTeams: new FormControl('', Validators.nullValidator),
      shiftId: new FormControl('', Validators.nullValidator),
      remark: new FormControl('', Validators.nullValidator)
    });
    this.keys = Object.keys(this.form.value);
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
      // { field: 'orgName', header: '组织名称', sortItem: 'orgCode' },
      { field: 'applyUserName', header: '顶班申请人', sortItem: 'applyUserName' },
      { field: 'applyTeamsCN', header: '顶班班组', sortItem: 'applyTeams' },
      { field: 'applyDate', header: '顶班日期', sortItem: 'applyDate' },
      { field: 'createTime', header: '登记时间', sortItem: 'createTime' }
    ];
    this.initForm = {
      applyUserId: '',
      applyTeams: '-1',
      shiftId: '',
      remark: ''
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

  getLeaveInfo(leaveId) {
    this.data = this.holdList.filter(el => el.id === leaveId)[0];
    this.isChosen = true;
    this.form.patchValue(this.data);
    this.form.patchValue({applyUserId: this.data.userId});
    this.applyDate = this.data.applyDate;
    this.filename = this.data.picName;
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
          this.holdList = res.data.shiftChangeDataList;
          this.holdList.forEach(el => {
            el.applyTeamsCN = this.list_group[el.applyTeams];
          })
        }
      }
    )
  }

  fileChange($event) {
    this.filename = $event.target.files[0].name;
    this.file = $event.target.files[0];
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

  add() {
    this.form.reset();
    this.form.patchValue(this.initForm);
    this.filename = '';
    this.isChosen = true;
    this.isAdd = true;
  }

  search() {
    if (this.searchName && this.searchName.trim()) {
      this.param.userName = this.searchName;
      this.toFirstPage();
    }else {
      this.sharedService.addAlert('警告', '请输入要查询的人员姓名！');
    }
  }

  update() {
    if (this.selectedLeave) {
      this.getLeaveInfo(this.selectedLeave);
      this.isChosen = true;
      this.isAdd = false;
    }else {
      this.sharedService.addAlert('警告', '请选择一个请假信息！');
    }
  }

  delete() {
    if (this.selectedLeave) {
      this.deleteLeave(this.selectedLeave);
    }else {
      this.sharedService.addAlert('警告', '请选择一个人员');
    }
  }

  select(val) {
    this.selectedLeave = val === this.selectedLeave ? '' : val;
  }

  check(val) {
    return val === this.selectedLeave;
  }

  deleteLeave(selectedLeave) {
    const leaveDate = this.dateFormat(new Date());
    this.sharedService.get(
      `/ShiftChange/delete?id=${selectedLeave}`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.hasData = false;
        this.toFirstPage();
      }
    );
  }

  addHold() {
    this.form.value.applyDate = this.dateFormat(this.applyDate);
    this.form.value.stationCode = this.orgCode;
    this.form.value.checkUserId = this.checkUserId;
    this.form.value.applyChangeType = 2;
    this.sharedService.post(
      '/ShiftChange/set',
      JSON.stringify(this.form.value),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      () => this.toFirstPage()
    );
  }

  updateLeave() {
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.data.applyDate = this.dateFormat(this.applyDate);
    this.data.applyDateEnd = this.dateFormat(this.applyDateEnd);
    this.sharedService.post(
      '/Leave/updateLeave',
      JSON.stringify(this.data),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      () => this.toFirstPage()
    );
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    if (this.isAdd) {
      this.addHold();
    }else {
      this.updateLeave();
    }
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    if (element) {
      this.isChosen = false;
      element.click();
    }else {
      this.getInfo();
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

  changeCheckStatus(id, type) {
    this.sharedService.post(
      '/Leave/checkLeave',
      JSON.stringify({
        id: id,
        checkUserId: this.checkUserId,
        checkType: type
      }),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => this.toFirstPage()
    );
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin && res.orgType === 3) {
        this.checkUserId = res.userId;
        this.orgCode = res.orgCode;
        this.orgType = res.orgType;
        this.param.orgList = [res.orgCode];
        this.form.value.orgName = res.orgName;
        this.getInfo();
        this.getStaff();
      }
    }).unsubscribe();
  }

}
