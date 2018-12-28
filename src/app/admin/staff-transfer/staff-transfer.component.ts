import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { applyType, educational, politics, politicalStatus, positionalTitle, list_group, work_post } from '../../store/translate';
import { SharedService } from "../../service/shared-service.service";

@Component({
  selector: 'app-staff-transfer',
  templateUrl: './staff-transfer.component.html',
  styleUrls: ['./staff-transfer.component.scss']
})
export class StaffTransferComponent implements OnInit {
  data: any = {};
  maskShow = false;
  form: FormGroup;
  staffId: string;
  applyType = applyType;
  educational = educational;
  politics = politics;
  politicalStatus = politicalStatus;
  positionalTitle = positionalTitle;
  list_group = list_group;
  work_post = work_post;
  checkItem = 1;
  startTime: string;
  endTime: string;
  adminId: string;
  en: any;
  changeTime: string;
  file: any;
  filename: string;
  isChosen = false;
  selectionMode = 'checkbox';
  selectionMode2 = 'single';
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  page = 0;
  size = 15;
  count: number;
  staffList: Array<any>;
  hasData: boolean;
  cols: Array<any>;
  isAdd: boolean;
  keys: Array<any>;
  searchName: string;
  orgType: number;
  initForm: any;
  param: any = {
    page: this.page,
    size: this.size
  };
  orgList: any = [];
  newOrg: any;
  staffSelected = [];
  orgNameOnly = [];

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      applyUserId: new FormControl('', Validators.nullValidator),
      applyType: new FormControl('', Validators.nullValidator),
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
      { field: 'orgName', header: '组织名称' },
      { field: 'tempOrgName', header: '临时组织名称' },
      { field: 'userName', header: '姓名' },
      { field: 'userSex', header: '性别' },
      { field: 'userTel', header: '手机号码' },
      { field: 'userMail', header: '邮箱' },
      { field: 'politicalStatus', header: '政治面貌' },
      { field: 'positionalTitle', header: '职称' },
      { field: 'workPost', header: '岗位' },
      { field: 'hireDate', header: '入职时间' },
      { field: 'educational', header: '学历' },
      { field: 'listGroup', header: '班组' },
    ];
    this.initForm = {
      userId: '',
      leaveType: '-1'
    };
  }

  selectedOrg($event) {
    this.orgList = $event;
  }

  selectedOrg2($event) {
    this.newOrg = $event;
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
    if (this.staffSelected.length > 0) {
      this.isChosen = true;
      this.orgNameOnly = Array.from(new Set(this.orgNameOnly));
    }else {
      this.sharedService.addAlert('警告','请选择员工！');
    }
  }

  search() {
    this.param.orgList = this.orgList.map(el => {
      return el.data;
    });
    this.getStaff();
  }

  select(item) {
    const index = this.staffSelected.findIndex(el => el.userId === item.userId);
    if (index > -1) {
      this.staffSelected.splice(index, 1);
    }else {
      this.staffSelected.push(item);
      this.orgNameOnly.push(item.orgName);
    }
  }

  staffCancel() {
    this.isChosen = false;
  }

  check(val) {
    return this.staffSelected.findIndex(el => el.userId === val) > -1;
  }

  isTemporary($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getStaff();
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    if (element) {
      this.isChosen = false;
      element.click();
    }else {
      this.getStaff();
    }
  }

  staffSubmit() {
    const arr = [];
    this.staffSelected.forEach(el => {
      const obj: any = {
        userId: el.userId,
        oldOrgCode: el.orgCode,
        newOrgCode: this.newOrg[0].data,
        temporary: this.checkItem == 0,
        startTime: this.dateFormat(this.startTime)
      };
      if (this.checkItem == 0) {
        obj.endTime = this.dateFormat(this.endTime);
      }
      arr.push(obj);
    });
    this.sharedService.post(
      '/StaffMag/staffTransfer',
      JSON.stringify({staffTransferBeanList: arr}),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      res => this.toFirstPage()
    );
    this.orgNameOnly = [];
  }

  getStaff() {
    this.sharedService.post(
      '/StaffMag/getStaff',
      JSON.stringify(this.param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.staffSelected = [];
        this.count = res.data.count;
        this.staffList = res.data.staffDataList;
        console.log(this.staffList);
        this.staffList.forEach(val => {
          val.listGroup = list_group[val.listGroup];
          val.educational = educational[val.educational];
          val.politicalStatus = politicalStatus[val.politicalStatus];
          val.positionalTitle = positionalTitle[val.positionalTitle];
          val.workPost = work_post[val.workPost];
        });
        this.hasData = true;
      }
    );
    
  }

  getOrgInfo(orgCode) {
    this.sharedService.get(
      `/BaseInfo/getOrgRelation?orgCode=${orgCode}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.param.orgList = res.data.map(el => el.orgCode);
        this.getStaff();
      }
    )
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin) {
        this.adminId = res.userId;
        this.orgCode = res.orgCode;
        this.orgType = res.orgType;
        this.form.value.orgName = res.orgName;
        this.getOrgInfo(this.orgCode);
      }
    }).unsubscribe();
  }

}
