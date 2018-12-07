import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { applyType, shiftId, list_group } from '../../store/translate';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-switch-edit',
  templateUrl: './switch-edit.component.html',
  styleUrls: ['./switch-edit.component.scss']
})
export class SwitchEditComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  applyType = applyType;
  list_group = list_group;
  shiftId = shiftId;
  adminId: string;
  en: any;
  file: any;
  isChosen = false;
  listGroup: number;
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  page = 0;
  size = 15;
  count: number;
  selectedSwitch: string;
  applyStaffList: Array<any>;
  backStaffList: Array<any>;
  hasData: boolean;
  cols: Array<any>;
  isAdd: boolean;
  searchName: string;
  orgType: number;
  initForm: any;
  param: any = {
    page: this.page,
    size: this.size
  };
  applyDate: string;
  applyDateEnd: string;
  applyUserId: string;
  applyUserName: string;
  backTeams: string;
  returnDate: string;
  backUserName: string;
  backUserId: string;
  applyInfo: any;
  userName = '';
  backInfo: any;
  applyChangeType = 1;
  userId: string;
  checkItem = 1;
  shiftChangeDataList: Array<any>;
  requiredItems: any = {};
  loadingStaffs = false;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      remark: new FormControl('', Validators.nullValidator),
      backTeams: new FormControl('', Validators.nullValidator),
      backShift: new FormControl('', Validators.nullValidator)
    });
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
      { field: 'orgName', header: '组织名称' },
      { field: 'applyDate', header: '换/顶班日期' },
      { field: 'applyShift', header: '换/顶班班次' },
      { field: 'backUserName', header: '替班收费员' },
      { field: 'backTeams', header: '替班班组' },
      { field: 'backDate', header: '替班日期' },
      { field: 'backShift', header: '替班班次' },
      { field: 'remark', header: '备注' }
    ];
    this.initForm = {
      backUserId: '-1',
      backTeams: '-1',
      remark: ''
    };
  }

  getSwitchInfo(leaveId) {
    this.data = this.shiftChangeDataList.filter(el => el.id === leaveId)[0];
    this.isChosen = true;
    this.applyUserName = this.data.applyUserName;
    this.backUserName = this.data.backUserName;
    this.backTeams = this.data.backTeams;
    this.applyUserId = this.data.applyUserId;
    this.backUserId = this.data.backUserId;
    this.form.patchValue(this.data);
    this.form.patchValue({applyUserId: this.data.userId});
    this.applyInfo = {
      scheduleDate: this.data.applyDate,
      shiftId: this.data.applyShift
    };
    this.backInfo = {
      scheduleDate: this.data.backDate,
      shiftId: this.data.backShift
    };
    this.getStaff(this.backTeams, 2);
  }

  test(val) {
    return val === +this.checkItem;
  }

  checkType($event) {
    this.checkItem = +$event.target.value;
  }

  getInfo() {
    this.sharedService.post(
      '/ShiftChange/get',
      JSON.stringify(this.param),
      {
        httpOptions: true,
        successAlert: false,
        animation:true
      }
    ).subscribe(
      res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
          this.shiftChangeDataList = res.data.shiftChangeDataList;
          this.shiftChangeDataList.forEach(el => {
            el.backTeams = this.list_group[el.backTeams];
            el.applyShift = this.shiftId[el.applyShift];
            el.backShift = this.shiftId[el.backShift];
          });
        }
      }
    )
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

  add() {
    this.form.patchValue(this.initForm);
    this.isChosen = true;
    this.isAdd = true;
  }

  backUserChoose(id) {
    this.backUserId = id;
    this.form.value.backUserId = id;
  }

  applyUserChoose(id) {
    this.applyUserId = id;
    this.form.value.applyUserId = id;
  }

  search() {
    // if (this.searchName && this.searchName.trim()) {
    //   this.param.userName = this.searchName;
    //   this.toFirstPage();
    // }else {
    //   alert('请输入要查询的人员姓名！');
    // }
  }

  update() {
    if (this.selectedSwitch) {
      this.getSwitchInfo(this.selectedSwitch);
      this.isChosen = true;
      this.isAdd = false;
    }else {
      this.sharedService.addAlert('通知','请选择一个请假信息！');
    }
  }

  delete() {
    if (this.selectedSwitch) {
      this.deleteLeave(this.selectedSwitch);
    }else {
      this.sharedService.addAlert('通知','请选择一个人员！');
    }
  }

  select(val) {
    this.selectedSwitch = val === this.selectedSwitch ? '' : val;
  }

  check(val) {
    // return val === this.selectedLeave;
  }

  deleteLeave(selectedSwitch) {
    this.sharedService.get(
      `/ShiftChange/delete?id=${selectedSwitch}`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.hasData = false;
        this.toFirstPage();
      }
    )
  }

  addSwitch() {
    this.form.value.stationCode = this.orgCode;
    if (this.applyInfo) {
      this.form.value.applyDate = this.applyInfo.scheduleDate;
      this.form.value.applyShift = this.applyInfo.shiftId;
    }
    this.form.value.applyChangeType = this.applyChangeType;
    if (this.checkItem === 1) {
      if (this.backInfo) {
        this.form.value.backDate = this.backInfo.scheduleDate;
        this.form.value.backShift = this.backInfo.shiftId;
      }
      if (this.backUserId) {
        this.form.value.backUserId = this.backUserId;
      }
      if (this.form.value.backTeams) {
        this.form.value.backTeams = +this.form.value.backTeams;
      }
      this.requiredItems = {
        backTeams: '替班人所在班组',
        backUserId: '替班人姓名',
        backDate: '替班信息',
        applyDate: '换班信息'
      };
      const keys = Object.keys(this.requiredItems);
      const param: any = {};
      const spaceArr = keys.filter(el => !this.form.value[el]).map(el => this.requiredItems[el]);
      if (spaceArr.length > 0) {
        this.sharedService.addAlert('警告',`${spaceArr.join(',')}为空`);
      }else {
        param.backTeams = this.form.value.backTeams;
        param.backUserId = this.form.value.backUserId;
        param.backDate = this.form.value.backDate;
        param.applyTeams = this.listGroup;
        param.applyUserId = this.userId;
        param.applyDate = this.form.value.applyDate;
        param.applyShift = this.form.value.applyShift;
        param.backShift = this.form.value.backShift;
        param.stationCode = this.orgCode;
        param.applyChangeType = this.applyChangeType;
        param.remark = this.form.value.remark;
        this.postHttp(param);
      }
    }else {
      this.requiredItems = {
        applyDate: '换班信息'
      };
      const keys = Object.keys(this.requiredItems);
      const param: any = {};
      const spaceArr = keys.filter(el => !this.form.value[el]).map(el => this.requiredItems[el]);
      if (spaceArr.length > 0) {
        this.sharedService.addAlert('警告',`${spaceArr.join(',')}为空`);
      }else {
        param.applyTeams = this.listGroup;
        param.applyUserId = this.userId;
        param.applyDate = this.form.value.applyDate;
        param.applyShift = this.form.value.applyShift;
        param.stationCode = this.orgCode;
        param.applyChangeType = this.applyChangeType;
        param.remark = this.form.value.remark;
        this.postHttp(param);
      }
    }
  }

  postHttp(param) {
    this.sharedService.post(
      '/ShiftChange/set',
      JSON.stringify(param),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.toFirstPage();
        this.userName = '';
        this.applyInfo = undefined;
        this.backInfo = undefined;
        this.form.patchValue(this.initForm);
        this.backUserName = '';
        this.applyUserName = '';
        this.backUserId = '';
        this.applyUserId = '';
      }
    )
  }

  updateLeave() {
    this.form.value.applyDate = this.applyInfo.scheduleDate;
    this.form.value.applyShift = this.applyInfo.shiftId;
    this.form.value.applyTeams = +this.listGroup;
    this.form.value.applyChangeType = this.applyChangeType;
    this.form.value.backShift = this.backInfo.shiftId;
    this.form.value.backDate = this.backInfo.scheduleDate;
    this.form.value.backTeams = +this.form.value.backTeams;
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.sharedService.post(
      '/ShiftChange/update',
      JSON.stringify(this.data),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.toFirstPage();
      }
    )
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    this.addSwitch();
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

  getStaff(teams, val) {
    this.sharedService.get(
      `/ShiftChange/getUserByTeams?stationCode=${this.orgCode}&teams=${teams}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(res => {
      this.backStaffList = res.data;
    });
  }

  chooseApplySchedule($event) {
    this.applyInfo = $event;
  }

  chooseBackSchedule($event) {
    this.backInfo = $event;
  }

  backTeamsChange($event) {
    this.backTeams = $event.target.value;
    if (this.backTeams !== '-1') {
      this.getStaff(this.backTeams, 2);
    }
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && !res.isAdmin) {
        this.listGroup = res.listGroup;
        this.orgCode = res.orgCode;
        this.userId = res.userId;
        this.param.orgList = [res.orgCode];
        this.param.applyUserId = res.userId;
        this.param.applyChangeType = 1;
        this.getInfo();
      }
    }).unsubscribe();
  }

}

