import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-talk-input',
  templateUrl: './talk-input.component.html',
  styleUrls: ['./talk-input.component.scss']
})
export class TalkInputComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  startDate: string;
  endDate: string;
  orgName: string;
  en: any;
  isChosen = false;
  login: Observable<any> = new Observable<any>();
  page = 0;
  size = 15;
  orgList: Array<any>;
  org: string;
  orgType: number;
  files: Array<any> = [];
  count: number;
  deviceList: Array<any>;
  hasData: boolean;
  updateUrl = `http://119.29.144.125:8080/cgfeesys/User/setUserDetail`;
  cols: Array<any>;
  staffList: Array<any>;
  isAdd: boolean;
  keys: Array<any>;
  file: any;
  initstaff: string;
  filename: string;
  selectedDevice: string;
  selectionMode = 'checkbox';
  selectionStaffMode = 'checkbox';
  searchOrg: Array<any>;
  initForm: any;
  order: number;
  param: any = {
    page: this.page,
    size: this.size
  };
  chatType = ['一般谈心', '重要谈心'];

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      chatLeader: new FormControl('', Validators.nullValidator),
      chatLoc: new FormControl('', Validators.nullValidator),
      chatType: new FormControl('0', Validators.nullValidator),
      chatPersonList: new FormControl('', Validators.nullValidator),
      chatContent: new FormControl('', Validators.nullValidator)
    });
    this.orgList = [];
    this.staffList = [];
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
    this.initstaff = '';
    this.cols = [
      { field: 'chatTypeCN', header: '谈心类型', sortItem: 'chatType' },
      { field: 'chatLeader', header: '谈心人员', sortItem: 'chatLeader' },
      { field: 'chatUserName', header: '谈心对象', sortItem: 'chatUserName' },
      { field: 'chatLoc', header: '谈心地点', sortItem: 'chatLoc' },
      { field: 'chatDate', header: '谈心时间', sortItem: 'chatDate' },
      // { field: 'chatContent', header: '概要内容', sortItem: 'chatContent' }
    ];
    this.initForm = {
      chatLeader: '',
      chatLoc: '',
      chatType: '',
      chatContent: '',
      chatPersonList: ''
    };
  }

  showConfirm() {
    if (this.selectedDevice) {
      this.sharedService.addAlert('警告', '确认删除该记录？');
    }else {
      this.sharedService.addAlert('警告', '请选择一条记录！');
    }
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

  selectedOrg($event) {
    this.orgList = ($event);
  }
  selectedSearchOrg($event) {
    this.searchOrg = ($event);
  }
  selectedStaff($event) {
    this.staffList = ($event);
  }

  deleteFile(index) {
    this.files.splice(index, 1);
  }

  getStaffInfo(staffId) {
    this.deviceList.forEach(item => {
      if (item.id === staffId) {
        // if (item.chatType === '一般谈心') {
        //   item.chatType = '0';
        // } else {
        //   item.chatType = '1';
        // }
        this.form.patchValue(item);
        this.initstaff = item.chatUserName;
        this.startDate = item.chatDate;
        if (item.chatContent) {
          this.filename = item.chatContent.split('fileName=')[1];
        } else {
          this.filename = '';
        }
        this.org = item.orgName;
      }
    });
  }

  getInfo() {
    if (this.searchOrg.length !== 0) {
      this.param.orgList = this.searchOrg.map(el => el.data);
    }
    this.sharedService.post('/Chat/get', JSON.stringify(this.param), {
      httpOptions: true
    })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
        }
        res.data.chatDataList.forEach(item => {
          // if (item.chatType === 0) {
          //   item.chatType = '一般谈心';
          // } else {
          //   item.chatType = '重要谈心';
          // }
          item.chatTypeCN = this.chatType[item.chatType];
        });
        this.deviceList = res.data.chatDataList;
      });
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
    this.startDate = '';
    this.filename = '';
    this.initstaff = '';
    this.isChosen = true;
    this.isAdd = true;
  }

  search() {
    this.getInfo();
    this.toFirstPage();
  }

  update() {
    if (this.selectedDevice) {
      this.getStaffInfo(this.selectedDevice);
      this.isChosen = true;
      this.isAdd = false;
    } else {
      this.sharedService.addAlert('警告', '请选择一个谈心记录');
    }
  }

  delete() {
    this.showConfirm();
  }

  select(val) {
    this.selectedDevice = val === this.selectedDevice ? '' : val;
  }

  check(val) {
    return val === this.selectedDevice;
  }

  staffLeave(selectedUser) {
    this.sharedService.get(`/Chat/delete?id=${selectedUser}`, {
      successAlert: false
    })
            .subscribe(res => {
              this.sharedService.addAlert('警告', res.message);
              this.toFirstPage();
            });
  }

  addDevice() {
    this.form.value.chatDate = this.dateFormat(this.startDate);
    this.form.value.orgCode = this.orgList[0].data;
    this.form.value.chatPersonList = this.staffList.map(el => el.data);
    this.sharedService.post(`/Chat/add`, JSON.stringify(this.form.value), {
              httpOptions: true
            })
            .subscribe(res => {
                if (this.files.length) {
                  this.upload(res.data.id);
                } else {
                  this.toFirstPage();
                }
            });
  }

  updateDevice() {
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.data.id = this.selectedDevice;
    this.data.chatDate = this.dateFormat(this.startDate);
    this.data.orgCode = this.orgList[0].data;
    this.data.chatPersonList = this.staffList.map(el => el.data);
    this.sharedService.post(`/Chat/update`, JSON.stringify(this.data), {
              httpOptions: true
            })
            .subscribe(res => {
                if (this.files.length) {
                  this.upload(this.selectedDevice);
                } else {
                  this.toFirstPage();
                  this.sharedService.addAlert('通知', res.message);
                }

            });
  }

  paginate($event) {
    this.param.page = $event.page;
    this.getInfo();
  }

  submit() {
    if (this.isAdd) {
      this.addDevice();
    } else {
      this.updateDevice();
    }
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    this.isChosen = false;
    element.click();
  }
  fileChange($event) {
    this.filename = $event.target.files[0].name;
    this.files.push($event.target.files[0]);
  }

  upload(userId) {
    const formdata = new FormData();
    this.files.forEach(file => {
      formdata.append('file', file);
    })
    formdata.append('id', userId);
    this.sharedService.post(`/upload/chat`, formdata, {
      httpOptions: false
    })
      .subscribe(res => {
        this.sharedService.addAlert('通知', res.message);
        this.toFirstPage();
        this.files = [];
      }, error => {
        this.sharedService.addAlert('警告', '上传失败，请重试！');
      });
  }
  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin) {
        this.orgType = res.orgType;
        this.searchOrg = [{data: res.orgCode, label: res.orgName}];
        this.orgList = [{data: res.orgCode}];
        this.orgName = res.orgName;
        this.getInfo();
      }
    }).unsubscribe();
  }
}
