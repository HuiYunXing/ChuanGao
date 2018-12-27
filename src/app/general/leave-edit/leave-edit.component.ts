import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-leave-edit',
  templateUrl: './leave-edit.component.html',
  styleUrls: ['./leave-edit.component.scss']
})
export class LeaveEditComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  applyDate: string;
  applyDateEnd: string;
  form: FormGroup;
  en: any;
  filename: string;
  file: any;
  orgCode: string;
  applyUserId: string;
  size = 15;
  page = 0;
  count: number;
  leaveDataList: any;
  hasData: boolean;
  leaveType: any = {
    1: '事假',
    2: '年休',
    3: '补休',
    4: '病假',
    5: '产假',
    6: '婚假',
    7: '其他'
  };
  cols: any;
  checkResult = ['未审核', '通过', '未通过', '已超时'];
  initForm: any;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      applyType: new FormControl('', Validators.required),
      remark: new FormControl('', Validators.required)
    });
    this.en = {
      firstDayOfWeek: 0,
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
    this.cols = [
      { field: 'orgName', header: '组织机构' },
      { field: 'userName', header: '请假人' },
      { field: 'applyTypeCN', header: '请假类型' },
      { field: 'applyDate', header: '开始请假时间' },
      { field: 'applyDateEnd', header: '结束请假时间' },
      { field: 'remark', header: '请假理由' }
    ];
    this.initForm = this.form.value;
  }

  fileChange($event) {
    if (/.+\.(jpg|png|jpeg)$/.test($event.target.files[0].name)) {
      this.filename = $event.target.files[0].name;
      this.file = $event.target.files[0];
    } else {
      this.sharedService.addAlert('通知', '文件格式错误！');
    }
  }

  submit() {
    this.addStaffLeave();
  }

  paginate($event) {
    this.page = $event.page;
    this.getInfo(this.page, this.size);
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

  addStaffLeave() {
    this.form.value.applyDate = this.dateFormat(this.applyDate);
    this.form.value.applyDateEnd = this.dateFormat(this.applyDateEnd);
    this.form.value.stationCode = this.orgCode;
    this.form.value.applyUserId = this.applyUserId;
    this.form.value.applyType = +this.form.value.applyType;
    if (!this.form.value.applyDate) {
      this.sharedService.addAlert('警告', '开始日期不能为空！');
    } else if (!this.form.value.applyDateEnd) {
      this.sharedService.addAlert('警告', '结束日期不能为空！');
    } else if (!this.form.value.applyType) {
      this.sharedService.addAlert('警告', '请假类型不能为空！');
    } else if (!this.form.value.remark) {
      this.sharedService.addAlert('警告', '请假理由不能为空！');
    } else {
      this.sharedService.post(
        '/Leave/staffLeave',
        JSON.stringify(this.form.value),
        {
          httpOptions: true,
          successAlert: false,
          animation: true,
          lock: true
        }
      ).subscribe(
        res => {
          if (res.code) {
            if (this.file) {
              this.upload(res.data.id);
            } else {
              this.sharedService.addAlert('通知', res.message);
              this.file = null;
              this.filename = '';
              this.toFirstPage();
            }
            this.applyDate = '';
            this.applyDateEnd = '';
            this.form.setValue(this.initForm);
          } else {
            this.sharedService.addAlert('通知', res.message);
          }
        }
        )
      }
    }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    if (element) {
      element.click();
    }else {
      this.getInfo(0, this.size);
    }
  }

  upload(id) {
    const formdata = new FormData();
    formdata.append('file', this.file);
    formdata.append('id', id);
    this.sharedService.post(
      '/upload/leaveInfo',
      formdata,
      {
        httpOptions: false,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      (res) => {
        if (res.code) {
          this.sharedService.addAlert('通知', '请假成功！');
        }else {
          this.sharedService.addAlert('通知', '请假申请已提交，请假条上传失败！');
        }
        this.file = null;
        this.filename = '';
      }
    )
  }

  getInfo(page, size) {
    const param: any = {
      page: page,
      size: size,
      orgList: [this.orgCode],
      userId: this.applyUserId
    };
    this.sharedService.post(
      '/Leave/getLeave',
      JSON.stringify(param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.count = res.data.count;
        res.data.leaveDataList.forEach(el => {
          el.applyTypeCN = this.leaveType[el.applyType];
          el.checkResultCN = this.checkResult[el.checkResult];
          if (el.overDeadline) {
            el.checkResultCN = this.checkResult[3];
          }
        });
        this.leaveDataList = res.data.leaveDataList;
        if (res.data.count > 0) {
          this.hasData = true;
        }
      }
    )
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgCode = res.orgCode;
        this.applyUserId = res.userId;
        this.getInfo(this.page, this.size);
      }
    }).unsubscribe();
  }

}
