import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { FormArray } from '@angular/forms/src/model';
import { identifierName } from '@angular/compiler';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-train-execute',
  templateUrl: './train-execute.component.html',
  styleUrls: ['./train-execute.component.scss']
})
export class TrainExecuteComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  trainForm: FormGroup;
  searchForm: FormGroup;
  orgCode: string;
  planId: string;
  doStartDate: string;
  doEndDate: string;
  startDate: string;
  endDate: string;
  en: any;
  file: any;
  filename: string;
  isChosen = false;
  orgType: number;
  login: Observable<any> = new Observable<any>();
  page = 0;
  size = 15;
  count: number;
  doFilePath: string;
  planFilePath: string;
  staffList: Array<any>;
  hasData: boolean;
  updateUrl = `http://119.29.144.125:8080/cgfeesys/User/setUserDetail`;
  cols: Array<any>;
  userList: Array<any>;
  selectedUser = '';
  isAdd: boolean;
  keys: Array<any>;
  selectionStaffMode = 'checkbox';
  selectionMode = 'single';
  searchOrg: Array<any>;
  initForm: any;
  orgName: string;
  _trainTimeLong = 0.5;
  order: number;
  param: any = {
    page: this.page,
    size: this.size
  };
  isShow = false;
  teams = 0;
  activedStaffList: Array<any> = [];
  joinStaffList: Array<any> = [];
  doId: string;
  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      trainPlanName: new FormControl('', Validators.nullValidator),
      trainOrgName: new FormControl('', Validators.nullValidator),
      trainDoOrg: new FormControl('', Validators.nullValidator),
      trainStartDate: new FormControl('', Validators.nullValidator),
      trainTeacher: new FormControl('', Validators.nullValidator),
      trainEndDate: new FormControl('', Validators.nullValidator),
      trainUnit: new FormControl('', Validators.nullValidator),
      trainTimeLong: new FormControl('', Validators.nullValidator),
      trainType: new FormControl('', Validators.nullValidator),
      trainWay: new FormControl('', Validators.nullValidator),
      trainContent: new FormControl('', Validators.nullValidator),
      trainLoc: new FormControl('', Validators.nullValidator)
    });
    this.trainForm = new FormGroup({
      trainPlanName: new FormControl('', Validators.nullValidator),
      trainAddress: new FormControl('', Validators.nullValidator),
      trainDoStartDate: new FormControl('', Validators.nullValidator),
      trainDoEndDate: new FormControl('', Validators.nullValidator),
      trainTeacher: new FormControl('', Validators.nullValidator),
      trainContent: new FormControl('', Validators.nullValidator),
      userIdList: new FormControl('', Validators.nullValidator)
    });
    this.searchForm = new FormGroup({
      hasDo: new FormControl('', Validators.nullValidator),
    });
    this.doFilePath = '';
    this.planFilePath = '';
    this.orgCode = '';
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
      { field: 'trainPlanName', header: '培训计划名称', sortItem: 'trainPlanName' },
      { field: 'trainPlanOrgName', header: '发起单位', sortItem: 'trainPlanOrgName' },
      { field: 'trainDoOrgName', header: '落实单位', sortItem: 'trainDoOrgName' },
      { field: 'hasDo', header: '落实状态', sortItem: 'trainDoStatus' },
      { field: 'trainPlanStartDate', header: '开始时间', sortItem: 'trainPlanStartDate' },
      { field: 'trainPlanEndDate', header: '结束时间', sortItem: 'trainPlanEndDate' },
    ];
    this.initForm = {
      trainPlanName: '',
      trainPlanOrg: '',
      trainStartDate: '',
      trainTeacher: '',
      trainEndDate: '',
      trainUnit: '',
      trainTimeLong: '',
      trainType: '',
      trainWay: '',
      trainContent: '',
      trainLoc: ''
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

  // trainTimerChanged($event){
  //   $event.target.value = this.trainForm.value.trainDoTimeNumber * 0.5;
  //   this.trainForm.value.trainDoTimeLong = $event.target.value;
  // }

  get trainTimeLong() {
    return this._trainTimeLong;
  }

  set trainTimeLong(val) {
    val = Math.round(val * 2) / 2;
    this._trainTimeLong = val < 0.5 ? 0.5 : val;
  }

  selectedOrg($event) {
    this.searchOrg[0] = ($event);
  }
  selectedStaff($event) {
    this.userList = ($event);
  }
  getStaffInfo(planId) {
    this.isChosen = true;
    this.sharedService.get(`/Train/planGetById?id=${planId}`, {
        animation: true
      })
      .subscribe(res => {
          this.data = res.data;
          this.form.patchValue(res.data.trainPlanData);
          this.planFilePath = res.data.trainPlanData.trainPlanFile;
          this.endDate = res.data.trainPlanData.trainEndDate;
          this.startDate = res.data.trainPlanData.trainStartDate;
          this.trainForm.patchValue({trainPlanName: res.data.trainPlanData.trainName});
          this.trainForm.patchValue(res.data.trainPlanData);
          this.doId = res.data.trainDoListDataList.filter(el => el.trainDoOrgCode === this.orgCode)[0].doId;
      });
  }

  getInfo() {
    if (+this.searchForm.value.hasDo === 1) {
      this.param.hasDo = false;
    }else if (+this.searchForm.value.hasDo === 2) {
      this.param.hasDo = true;
    }else {
      delete this.param.hasDo;
    }
    this.sharedService.post('/Train/doGet', JSON.stringify(this.param) , {
              httpOptions: true,
              animation: true,
              lock: true
            })
            .subscribe(res => {
              if(res) {
                this.count = res.data.count;
                if (res.data.count > 0) {
                  this.hasData = true;
                }
                res.data.trainDoDataList.forEach(item => {
                  item.hasDo = item.trainTimeLong === 0 ? '已落实' : '未落实';
                });
                this.staffList = res.data.trainDoDataList;
              }
            });
  }

  fileChange($event) {
    this.filename = $event.target.files[0].name;
    this.file = $event.target.files[0];
  }

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth();
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    } else {
      return '';
    }
  }

  add() {
    this.form.reset();
    this.form.patchValue(this.initForm);
    this.filename = '';
    this.doStartDate = '';
    this.doEndDate = '';
    this.filename = '';
    this.activedStaffList = [];
    this.isChosen = true;
    this.isAdd = true;
  }

  search() {
    this.getInfo();
  }

  select(val) {
    this.selectedUser = val === this.selectedUser ? '' : val;
  }

  check(val) {
    return val === this.selectedUser;
  }

  addStaff() {
    this.form.value.trainTimeLong = this.trainTimeLong;
    this.form.value.trainDoStartDate = this.dateFormat(this.doStartDate);
    this.form.value.trainDoEndDate = this.dateFormat(this.doEndDate);
    this.form.value.userIdList = this.activedStaffList.map(el => el.userId);
    const tmpObj: any = {};
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (el !== 'trainPlanName' && el !== 'trainDoOrgName') {
        tmpObj[el] = this.form.value[el];
      }
    });
    tmpObj.id = this.doId;
    this.sharedService.post(`/Train/doAdd`, JSON.stringify(tmpObj), {
              httpOptions: true
            })
            .subscribe(res => {
                if (this.file) {
                  this.upload(res.data.id);
                } else {
                  this.sharedService.addAlert('通知', res.message);
                  this.toFirstPage();
                }
            });
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    this.addStaff();
  }

  addStaffs() {
    this.isShow = true;
    if (this.orgType !== 3) {
      this.sharedService.get(`/BaseInfo/getStationUserId?stationCode=${this.orgCode}`, {
        animation: true
      })
      .subscribe(res => {
          this.joinStaffList = res.data;
          const selected = this.activedStaffList;
          this.joinStaffList.filter(el => selected.findIndex(item => item.userId === el.userId) > -1).forEach(el => {
            el.choose = true;
          });
      });
    }
  }

  teamsChange() {
    if (this.teams) {
      this.getStaffs();
    }
  }

  chooseAll() {
    this.joinStaffList.forEach(el => {
      el.choose = true;
    });
  }

  unChooseAll() {
    this.joinStaffList.forEach(el => {
      el.choose = false;
    });
  }

  getStaffs() {
    this.sharedService.get(`/ShiftChange/getUserByTeams?teams=${this.teams}&stationCode=${this.orgCode}`, {
      animation: true
    })
    .subscribe(res => {
        this.joinStaffList = res.data;
        const selected = this.activedStaffList;
        this.joinStaffList.filter(el => selected.findIndex(item => item.userId === el.userId) > -1).forEach(el => {
          el.choose = true;
        });
    });
  }

  chooseStaff(staff) {
    this.joinStaffList.forEach(el => {
      if (el.userId === staff.userId) {
        el.choose = !el.choose;
      }
    });
  }

  staffSubmit() {
    this.joinStaffList.filter(user => !user.choose).forEach(user => {
      const index = this.activedStaffList.findIndex(staff => staff.userId === user.userId);
      if (index > -1) {
        this.activedStaffList.splice(index, 1);
      }
    });
    const arr = this.activedStaffList.concat(this.joinStaffList.filter(user => user.choose));
    this.activedStaffList = [];
    arr.forEach(staff => {
      if (this.activedStaffList.findIndex(item => item.userId === staff.userId) === -1) {
        this.activedStaffList.push(staff);
      }
    });
    this.teams = 0;
    this.isShow = false;
    this.joinStaffList = [];
  }

  removeStaff(id) {
    this.activedStaffList = this.activedStaffList.filter(user => user.userId !== id);
  }

  staffCancel() {
    this.isShow = false;
    this.staffList = [];
  }

  upload(id) {
    const formdata = new FormData();
    formdata.append('file', this.file);
    formdata.append('id', id);
    this.sharedService.post(`/upload/trainDo`, formdata, {
      httpOptions: false,
      successAlert: true
    }).subscribe(res => {
        if (res) {
          this.file = null;
          this.filename = '';
          this.getInfo();
        }
      })
  }
  downloadFile(type) {
    if (type === 'do') {
      window.open(this.doFilePath);
    } else {
      window.open(this.planFilePath);
    }
  }
  toFirstPage() {
    this.isChosen = false;
    this.param.page = 0;
    this.getInfo();
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin) {
        this.orgCode = res.orgCode;
        this.orgType = res.orgType;
        this.param.orgList = [res.orgCode];
        this.orgName = res.orgName;
        this.getInfo();
      }
    }).unsubscribe();
  }
}

