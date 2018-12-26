import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { work_post, politics, educational, list_group } from '../../store/translate';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-staff-search',
  templateUrl: './staff-search.component.html',
  styleUrls: ['./staff-search.component.scss']
})
export class StaffSearchComponent implements OnInit {
  form: FormGroup;
  login: Observable<any> = new Observable<any>();
  birthday: string;
  hireDate: string;
  count: number;
  initOrgName: string;
  orgType: number;
  work_post = work_post;
  politics = politics;
  educational = educational;
  staffList: Array<any>;
  orgList: Array<any>;
  hasData = false;
  order: number;
  param: any = {
    page: 0,
    size: 15
  };
  selectionMode = 'checkbox';
  listGroup = list_group;
  en = {
    firstDayOfWeek: 0,
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  };
  cols: any;
  numberArr: Array<string> = ['workPost', 'political_status', 'educational', 'listGroup'];

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      orgName: new FormControl('', Validators.nullValidator),
      listGroup: new FormControl('', Validators.nullValidator),
      userName: new FormControl('', Validators.nullValidator),
      workPost: new FormControl('', Validators.nullValidator),
      userSex: new FormControl('', Validators.nullValidator),
      educational: new FormControl('', Validators.nullValidator),
      political_status: new FormControl('', Validators.nullValidator),
      specialSkill: new FormControl('', Validators.nullValidator)
    });
    this.cols = [
      { field: 'userName', header: '职工姓名', sortable: true, sortItem: 'userName'},
      { field: 'userSex', header: '性别', sortable: true, sortItem: 'userSex'},
      { field: 'politicalStatus', header: '政治面貌', sortable: true, sortItem: 'politicalStatus'},
      { field: 'userTel', header: '手机号码', sortable: true, sortItem: 'userTel'},
      { field: 'userMail', header: '邮箱', sortable: true, sortItem: 'userMail'},
      { field: 'workPost', header: '岗位', sortable: true, sortItem: 'workPost'},
      { field: 'educational', header: '学历', sortable: true, sortItem: 'educational'},
      { field: 'listGroupCN', header: '班组', sortable: true, sortItem: 'listGroup'},
      { field: 'orgName', header: '组织名称', sortable: true, sortItem: 'orgCode'}
    ];
  }

  sortByThis(item) {
    if (item.sortable){
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
    if (!this.count) {
      this.getInfo();
    }
  }

  submit() {
    if (!this.orgList || this.orgList.length === 0) {
      this.sharedService.addAlert('警告', '未选择机构！');
    }else {
      this.getInfo();
    }
  }

  paginate(event) {
    this.param.page = event.page;
    this.getInfo();
  }

  getInfo() {
    this.form.value.birthday = this.dateFormat(this.birthday);
    this.form.value.hireDate = this.dateFormat(this.hireDate);
    this.form.value.orgList = this.orgList.map(el => el.data);
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        this.param[el] = this.form.value[el];
      }else {
        delete this.param[el];
      }
    });
    this.numberArr.forEach(el => {
      if (this.param[el]) {
        this.param[el] = +this.param[el];
      }
    });
    this.sharedService.post('/StaffMag/getStaff', JSON.stringify(this.param), {
      httpOptions: true,
      animation: true,
      lock: true
    })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
        } else {
          this.sharedService.addAlert('警告', '没有匹配的人员信息，请重新设置查询条件！');
          this.hasData = false;
        }
        this.staffList = res.data.staffDataList.map(el => {
          el.politicalStatus = this.politics[el.politicalStatus];
          el.workPost = this.work_post[el.workPost];
          el.educational = this.educational[el.educational];
          el.listGroup = this.listGroup[el.listGroup];
          return el;
        });
      });
  }

  setManager(id, isAdmin) {
    const param = [{
      userId: id,
      isAdmin: isAdmin
    }]
    this.sharedService
      .post(
        '/Super/setManager',
        JSON.stringify(param),
        {
          httpOptions: true,
          successAlert: true,
          animation: true
        }
      )
      .subscribe(res => {
        this.getInfo();
      })
  }

  resetPwd(id) {
    this.sharedService.addConfirm('警告', '确认重置此账号密码？').subscribe(() => {
      this.sharedService.get(`/resetPassword?userId=${id}`, {
        animation: true
      })
      .subscribe(res => {
        this.sharedService.addAlert('通知', '重置成功');
      });
    })
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.initOrgName = res.orgName;
        this.orgType = res.orgType;
        // this.orgList = [{
        //   data: res.orgCode,
        //   orgType: res.orgType
        // }];
        // this.getInfo();
      }
    }).unsubscribe();
  }

}
