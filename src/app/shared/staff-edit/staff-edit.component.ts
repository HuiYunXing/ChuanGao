import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { work_post, politics, educational, list_group } from '../../store/translate';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-staff-edit',
  templateUrl: './staff-edit.component.html',
  styleUrls: ['./staff-edit.component.scss']
})
export class StaffEditComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  staffId: string;
  hireDate: string;
  birthday: string;
  en: any;
  changeTime: string;
  file: any;
  filename: string;
  isChosen = false;
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  count: number;
  order: number;
  staffList: Array<any>;
  hasData: boolean;
  work_post = work_post;
  politics = politics;
  educational = educational;
  list_group = list_group;
  updateUrl = `http://119.29.144.125:8080/cgfeesys/User/setUserDetail`;
  cols: Array<any>;
  selectedUser = '';
  isAdd: boolean;
  keys: Array<any>;
  searchName: string;
  orgName: string;
  orgType: number;
  initForm: any;
  param: any = {
    page: 0,
    size: 15
  };

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      orgName: new FormControl('', Validators.nullValidator),
      userName: new FormControl('', Validators.nullValidator),
      userSex: new FormControl('', Validators.nullValidator),
      educational: new FormControl('', Validators.nullValidator),
      practitionerCertificate: new FormControl('', Validators.nullValidator),
      userTel: new FormControl('', Validators.nullValidator),
      workPost: new FormControl('', Validators.nullValidator),
      politicalStatus: new FormControl('', Validators.nullValidator),
      positionalTitle: new FormControl('', Validators.nullValidator),
      emergencyContact: new FormControl('', Validators.nullValidator),
      emergencyPhone: new FormControl('', Validators.nullValidator),
      userMail: new FormControl('', Validators.nullValidator),
      jobDetail: new FormControl('', Validators.nullValidator),
      listGroup: new FormControl('', Validators.nullValidator),
      awardDetail: new FormControl('', Validators.nullValidator),
      specialSkill: new FormControl('', Validators.nullValidator)
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
      { field: 'orgName', header: '组织名称', sortItem: 'orgCode' },
      { field: 'userId', header: '人员编码', sortItem: 'userId' },
      { field: 'userName', header: '姓名', sortItem: 'userName' },
      { field: 'userSex', header: '性别', sortItem: 'userSex' },
      { field: 'userTel', header: '手机号码', sortItem: 'userTel' },
      { field: 'userMail', header: '邮箱', sortItem: 'userMail' },
      { field: 'politicalStatus', header: '政治面貌', sortItem: 'politicalStatus' },
      { field: 'workPost', header: '岗位', sortItem: 'workPost' },
      { field: 'birthday', header: '出生日期', sortItem: 'birthday' },
      { field: 'hireDate', header: '入职时间', sortItem: 'hireDate' },
      { field: 'educational', header: '学历', sortItem: 'educational' },
      { field: 'practitionerCertificate', header: '从业证书', sortItem: 'practitionerCertificate' },
      { field: 'collectionSysId', header: '系统工号', sortItem: 'collectionSysId' },
      { field: 'workLicense', header: '上岗证编号', sortItem: 'workLicense' },
      { field: 'listGroupCN', header: '班组', sortItem: 'listGroup' },
      // { field: 'changeTime', header: '变更时间', sortItem: 'changeTime' },
      { field: 'emergencyContact', header: '紧急联系人', sortItem: 'emergencyContact' },
      { field: 'emergencyPhone', header: '紧急联系电话', sortItem: 'emergencyPhone' }
    ];
    this.initForm = {
      orgName: '',
      userName: '',
      userSex: '',
      educational: '',
      practitionerCertificate: '',
      userTel: '',
      workPost: '',
      politicalStatus: '',
      positionalTitle: '',
      emergencyContact: '',
      emergencyPhone: '',
      userMail: '',
      jobDetail: '',
      listGroup: '',
      awardDetail: '',
      specialSkill: '',
      hireDate: '',
      birthday: '',
      changeTime: ''
    };
  }

  showConfirm() {
    if (this.selectedUser) {
      this.sharedService.addConfirm('警告', '确定离职该人员？').subscribe(res => {
        this.staffLeave(this.selectedUser);
      })
    }else {
      this.sharedService.addAlert('警告', '请选择一个人员！');
    }
  }

  getStaffInfo(staffId) {
    this.sharedService
      .get(`/User/getUserDetail?userId=${staffId}`, {
        animation: true
      })
      .subscribe(res => {
        this.data = res.data;
        this.form.patchValue(res.data);
        this.hireDate = res.data.hireDate;
        this.birthday = res.data.birthday;
        this.changeTime = res.data.changeTime;
        this.filename = res.data.fileName;
      })
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
    this.sharedService
      .post('/StaffMag/getStaff', JSON.stringify(this.param), {
        animation: true,
        httpOptions: true
      })
      .subscribe(res => {
        if (res) {
          this.count = res.data.count;
          if (res.data.count > 0) {
            this.hasData = true;
            this.staffList = res.data.staffDataList.map(el => {
              el.politicalStatus = this.politics[el.politicalStatus];
              el.workPost = this.work_post[el.workPost];
              el.educational = this.educational[el.educational];
              el.listGroupCN = this.list_group[el.listGroup];
              return el;
            });
          }
        }
      })
  }

  fileChange($event) {
    this.filename = $event.target.files[0].name;
    this.file = $event.target.files[0];
  }

  add() {
    this.form.reset();
    this.form.patchValue(this.initForm);
    this.birthday = '';
    this.hireDate = '';
    this.form.patchValue({orgName: this.orgName});
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
    if (this.selectedUser) {
      this.birthday = '';
      this.hireDate = '';
      this.form.patchValue(this.initForm);
      this.getStaffInfo(this.selectedUser);
      this.isChosen = true;
      this.isAdd = false;
    }else {
      this.sharedService.addAlert('警告', '请选择一个人员！');
    }
  }

  select(val) {
    this.selectedUser = val === this.selectedUser ? '' : val;
  }

  check(val) {
    return val === this.selectedUser;
  }

  staffLeave(selectedUser) {
    const leaveDate = this.sharedService.dateFormat(new Date());
    this.sharedService.get(`/StaffMag/staffLeave?userId=${selectedUser}&leaveDate=${leaveDate}`, {
      animation: true
    })
            .subscribe(res => {
              this.sharedService.addAlert('警告', res.message);
              this.toFirstPage();
            });
  }

  addStaff() {
    this.form.value.hireDate = this.sharedService.dateFormat(this.hireDate);
    this.form.value.birthday = this.sharedService.dateFormat(this.birthday);
    this.form.value.changeTime = this.sharedService.dateFormat(this.changeTime);
    this.form.value.workPost = +this.form.value.workPost;
    this.form.value.educational = +this.form.value.educational;
    this.form.value.listGroup = +this.form.value.listGroup;
    this.form.value.orgType = +this.orgType;
    this.form.value.orgCode = this.orgCode;
    this.form.value.politicalStatus = +this.form.value.politicalStatus;
    this.form.value.positionalTitle = +this.form.value.positionalTitle;
    if (this.orgType !== 3) {
      delete this.form.value.listGroup;
    }
    this.sharedService.post(`/StaffMag/addStaff`, JSON.stringify(this.form.value), {
              httpOptions: true
            })
            .subscribe(res => {
                if (this.file) {
                  this.upload(res.data.userId);
                }else {
                  this.sharedService.addAlert('通知', '人员录入成功！');
                  this.toFirstPage();
                }
            });
  }

  updateStaff() {
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.data.hireDate = this.sharedService.dateFormat(this.hireDate);
    this.data.birthday = this.sharedService.dateFormat(this.birthday);
    this.data.changeTime = this.sharedService.dateFormat(this.changeTime);
    this.data.politics = this.data.politics ? this.data.politics : 0;
    this.data.positionalTitle = this.data.positionalTitle ? this.data.positionalTitle : 0;
    if (this.form.value.listGroup) {
      this.data.listGroup = +this.form.value.listGroup;
    };
    this.sharedService.post(`/User/setUserDetail`, JSON.stringify(this.data), {
              httpOptions: true
            })
            .subscribe(res => {
                if (this.file) {
                  this.upload(this.data.userId);
                }else {
                  this.toFirstPage();
                }
            });
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    if (this.isAdd) {
        this.addStaff();
      }else {
        this.updateStaff();
      }
  }

  upload(userId) {
    const formdata = new FormData();
    formdata.append('file', this.file);
    formdata.append('userId', userId);
    this.sharedService.post(`/upload/userInfo`, formdata, {
      httpOptions: false,
      successAlert: true
    })
      .subscribe(res => {
        this.file = null;
        this.filename = '';
        this.toFirstPage();
      })
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
        this.orgCode = res.orgCode;
        this.orgName = res.orgName;
        this.orgType = res.orgType;
        this.param.orgList = [res.orgCode];
        this.form.value.orgName = res.orgName;
        this.getInfo();
      }
    }).unsubscribe();
  }

}
