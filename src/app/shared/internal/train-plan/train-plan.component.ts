import { Component, OnInit, SimpleChanges } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-train-plan',
  templateUrl: './train-plan.component.html',
  styleUrls: ['./train-plan.component.scss']
})
export class TrainPlanComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  startDate: string;
  endDate: string;
  en: any;
  file: any;
  checkMode = 'checkbox';
  filename: string;
  isChosen = false;
  login: Observable<any> = new Observable<any>();
  count: number;
  exOrg: Array<any>;
  DoOrg: string;
  planOrg: string;
  staffList: Array<any>;
  hasData: boolean;
  cols: Array<any>;
  selectedUser = '';
  isAdd: boolean;
  keys: Array<any>;
  orgList: Array<any>;
  selectionMode = 'single';
  searchOrg: Array<any>;
  initForm: any;
  order: number;
  param: any = {
    page: 0,
    size: 15,
  };
  trainTimeLong = 0.5;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      trainPlanName: new FormControl('', Validators.nullValidator),
      trainStartDate: new FormControl('', Validators.nullValidator),
      trainTeacher: new FormControl('', Validators.nullValidator),
      trainDoOrg: new FormControl('', Validators.nullValidator),
      trainPlanOrg: new FormControl('', Validators.nullValidator),
      trainEndDate: new FormControl('', Validators.nullValidator),
      trainUnit: new FormControl('', Validators.nullValidator),
      trainTimeLong: new FormControl('', Validators.nullValidator),
      trainType: new FormControl('', Validators.nullValidator),
      trainWay: new FormControl('', Validators.nullValidator),
      trainContent: new FormControl('', Validators.nullValidator),
      trainLoc: new FormControl('', Validators.nullValidator)
    });
    this.searchOrg = [];
    this.exOrg = [];
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
      { field: 'trainPlanName', header: '培训计划名称', sortItem: 'trainPlanName', sortable: true },
      { field: 'trainDoOrgName', header: '落实单位', sortItem: 'trainDoOrgName' },
      { field: 'trainStartDate', header: '开始时间', sortItem: 'trainStartDate', sortable: true },
      { field: 'trainEndDate', header: '结束时间', sortItem: 'trainEndDate', sortable: true },
      { field: 'trainWay', header: '培训方式', sortItem: 'trainWay', sortable: true },
      { field: 'trainType', header: '培训类别', sortItem: 'trainType', sortable: true },
      { field: 'trainTeacher', header: '培训讲师', sortItem: 'trainTeacher', sortable: true },
      { field: 'trainTimeLong', header: '培训课时', sortItem: 'trainTimeLong', sortable: true },
      { field: 'trainLoc', header: '培训地点', sortItem: 'trainLoc', sortable: true },
      { field: 'trainContent', header: '培训内容', sortItem: 'trainContent', sortable: true }
    ];
    this.initForm = {
      trainPlanOrg: '',
      trainPlanName: '',
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
    if (item.sortable) {
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
  }

  showConfirm() {
    if (this.selectedUser) {
      this.sharedService.addConfirm('警告', '确认删除该记录？')
        .subscribe(res => {
          this.deletePlan(this.selectedUser);
        });
    }else {
      this.sharedService.addAlert('警告', '请选择一条记录！');
    }
  }

  selectedEXOrg($event) {
    this.exOrg = ($event);
  }
  selectedSearchOrg($event) {
    this.searchOrg = ($event);
  }
  getStaffInfo(staffId) {
    this.sharedService.get(`/Train/planGetById?id=${staffId}`, {
        animation: true
      })
      .subscribe(res => {
          this.data = res.data.trainPlanData;
          this.form.patchValue(this.data);
          this.DoOrg = this.data.trainDoOrgList.join(',');
          this.startDate = this.data.trainStartDate;
          this.endDate = this.data.trainEndDate;
          this.trainTimeLong = this.data.trainTimeLong;
          this.filename = this.data.trainPlanFile;
      });
  }

  timeFormat(num) {
    num = Math.round(num * 2) / 2;
    this.trainTimeLong = num < 0.5 ? 0.5 : num;
  }

  getInfo() {
    if (this.searchOrg.length !== 0) {
      this.param.orgList = this.searchOrg.map(el => el.data);
    }
    this.sharedService.post('/Train/planGet', JSON.stringify(this.param) , {
              httpOptions: true,
              animation: true
            })
            .subscribe(res => {
                this.count = res.data.count;
                if (res.data.count > 0) {
                  this.hasData = true;
                }
                this.staffList = [];
                this.staffList = res.data.trainPlanDataList;
                this.staffList.forEach(el => {
                  el.trainDoOrgName = el.trainDoOrgList.join(',');
                })
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
    this.form.patchValue({trainPlanOrg: this.orgList[0].label});
    this.filename = '';
    this.isChosen = true;
    this.isAdd = true;
  }

  search() {
    if (this.searchOrg && this.searchOrg.length !== 0) {
      this.getInfo();
      this.toFirstPage();
    } else {
      this.sharedService.addAlert('警告', '请输入要查询的组织！');
    }
  }

  update() {
    if (this.selectedUser) {
      this.getStaffInfo(this.selectedUser);
      this.isChosen = true;
      this.isAdd = false;
    } else {
      this.sharedService.addAlert('警告', '请选择一个计划！');
    }
  }

  delete() {
    this.showConfirm();
  }

  select(val) {
    this.selectedUser = val === this.selectedUser ? '' : val;
  }

  check(val) {
    return val === this.selectedUser;
  }

  deletePlan(selectedUser) {
    this.sharedService.get(`/Train/planDelete?id=${selectedUser}`, {
        animation: true
      })
      .subscribe(res => {
        this.sharedService.addAlert('通知', res.message);
        this.getInfo();
      });
  }

  addStaff() {
    this.form.value.trainTimeLong = this.trainTimeLong;
    this.form.value.trainStartDate = this.dateFormat(this.startDate);
    this.form.value.trainEndDate = this.dateFormat(this.endDate);
    if (this.exOrg.length !== 0) {
      this.form.value.trainDoOrg = this.exOrg.map(el => el.data);
    } else {
      this.sharedService.addAlert('警告', '请选择落实单位！');
      return false;
    }
    this.form.value.trainPlanOrg = this.orgList[0].data;
    this.sharedService.post(`/Train/planAdd`, JSON.stringify(this.form.value), {
              httpOptions: true,
              animation: true,
              lock: true
            })
            .subscribe(res => {
                if (this.file) {
                  this.upload(res.data.id);
                } else {
                  this.toFirstPage();
                  this.sharedService.addAlert('通知', res.message);
                }
                this.startDate = '';
                this.endDate = '';
                this.trainTimeLong = 0.5;
            });
  }

  updateStaff() {
    const data: any = {
      id: this.selectedUser,
      trainPlanOrg: this.orgList[0].data,
      trainPlanName: this.form.value.trainPlanName,
      trainStartDate: this.dateFormat(this.startDate),
      trainEndDate: this.dateFormat(this.endDate),
      trainContent: this.form.value.trainContent,
      trainType: this.form.value.trainType,
      trainWay: this.form.value.trainWay,
      trainUnit: this.form.value.trainUnit,
      trainTeacher: this.form.value.trainTeacher,
      trainLoc: this.form.value.trainLoc,
      trainTimeLong: this.form.value.trainTimeLong
    };
    this.sharedService.post(`/Train/planUpdate`, JSON.stringify(data), {
              httpOptions: true
            })
            .subscribe(res => {
              if(res) {
                if (this.file) {
                  this.upload(this.selectedUser);
                } else {
                  this.isChosen = false;
                  this.getInfo();
                  this.sharedService.addAlert('警告', res.message);
                }
                this.startDate = '';
                this.endDate = '';
                this.trainTimeLong = 0.5;
              }
            })
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    if (this.isAdd) {
      this.addStaff();
    } else {
      this.updateStaff();
    }
  }

  upload(userId) {
    const formdata = new FormData();
    formdata.append('file', this.file);
    formdata.append('id', userId);
    this.sharedService.post(`/upload/trainPlan`, formdata, {
      httpOptions: false
    })
      .subscribe(res => {
        this.sharedService.addAlert('警告', res.message);
        this.file = null;
        this.filename = '';
        this.toFirstPage();
      });
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    this.selectedUser = '';
    this.isChosen = false;
    element.click();
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin) {
        this.searchOrg = [{data: res.orgCode, label: res.orgName}];
        this.orgList = [{data: res.orgCode, label: res.orgName}];
        this.planOrg = this.orgList[0].label;
        this.getInfo();
      }
    }).unsubscribe();
  }
}
