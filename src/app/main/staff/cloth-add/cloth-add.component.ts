import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { applyType } from '../../../store/translate';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-cloth-add',
  templateUrl: './cloth-add.component.html',
  styleUrls: ['./cloth-add.component.scss']
})
export class ClothAddComponent implements OnInit {
  data: any = {};
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
  clothesDataList: Array<any>;
  staffList: Array<any>;
  hasData: boolean;
  cols: Array<any>;
  selectedCloth = '';
  isAdd: boolean;
  selectionMode = 'single';
  orgName: string;
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
  cloth: any;
  clothesTypeList = {
    1: '冬装',
    2: '春装',
    3: '头花',
    4: '春秋装',
  };
  clothesClassificationList = {
    1: '管理（执法）类服装',
    2: '收费类服装'
  };
  clothesSex: string;
  clothesClassification: string;
  clothesSize: string;
  clothesType: string;
  clothesDate: string;
  clothesChangeDate: string;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      clothesNum: new FormControl('', Validators.nullValidator),
      userId: new FormControl('', Validators.nullValidator),
      clothesSize: new FormControl('', Validators.nullValidator)
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
      { field: 'userName', header: '收费员名称', sortItem: 'userName' },
      { field: 'clothesType', header: '服装类型', sortItem: 'clothesType' },
      { field: 'clothesClassification', header: '服装类别', sortItem: 'clothesClassification' },
      { field: 'clothesDate', header: '领用日期', sortItem: 'clothesDate' },
      { field: 'clothesChangeDate', header: '到期日期', sortItem: 'clothesChangeDate' },
      { field: 'clothesSex', header: '性别', sortItem: 'clothesSex' },
      { field: 'clothesNum', header: '数量', sortItem: 'clothesNum' },
      { field: 'stationName', header: '收费站', sortItem: 'orgName' }
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
    this.data = this.clothesDataList.filter(el => el.id === leaveId)[0];
    this.isChosen = true;
    this.form.patchValue(this.data);
    this.form.patchValue({applyUserId: this.data.userId});
    this.applyDate = this.data.applyDate;
    this.filename = this.data.picName;
  }

  getInfo() {
    this.sharedService.post(
      '/Clothes/get',
      JSON.stringify(this.param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
          this.clothesDataList = res.data.clothesDataList;
          this.clothesDataList.forEach(el => {
            el.clothesType = this.clothesTypeList[el.clothesType];
            el.clothesClassification = this.clothesClassificationList[el.clothesClassification];
          });
        }
      }
    )
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
    if (this.selectedCloth) {
      this.getLeaveInfo(this.selectedCloth);
      this.isChosen = true;
      this.isAdd = false;
    }else {
      this.sharedService.addAlert('警告', '请输入要查询的人员姓名！');
    }
  }

  delete() {
    if (this.selectedCloth) {
      this.deleteCloth(this.selectedCloth);
    }else {
      this.sharedService.addAlert('警告', '请选择一条记录！');
    }
  }

  select(val) {
    this.selectedCloth = val === this.selectedCloth ? '' : val;
  }

  check(val) {
    return val === this.selectedCloth;
  }

  deleteCloth(selectedCloth) {
    const leaveDate = this.dateFormat(new Date());
    this.sharedService.get(
      `/Clothes/delete?id=${selectedCloth}`,
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

  addCloth() {
    this.sharedService.post(
      '/Clothes/add',
      JSON.stringify({
        userId: this.form.value.userId,
        clothesId: this.cloth.id,
        outOrgCode: this.orgCode,
        clothesDate: this.dateFormat(this.clothesDate),
        clothesChangeDate: this.dateFormat(this.clothesChangeDate),
        clothesType: this.cloth.clothesType,
        clothesClassification: this.cloth.clothesClassification,
        clothesSex: this.cloth.clothesSex,
        clothesSize: this.form.value.clothesSize,
        clothesNum: this.form.value.clothesNum
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

  updateLeave() {
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.data.applyDate = this.dateFormat(this.applyDate);
    this.data.applyDateEnd = this.dateFormat(this.applyDateEnd);
    this.sharedService.post(
      '/Leave/updateLeave`',
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
    // if (this.isAdd) {
    //   this.addCloth();
    // }else {
    //   this.updateLeave();
    // }
    this.addCloth();
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
      () => this.toFirstPage
    );
  }

  chosenCloth($event) {
    this.clothesType = $event.clothesType;
    this.clothesClassification = $event.clothesClassification;
    this.clothesSex = $event.clothesSex;
    this.clothesSize = $event.clothesSize;
    this.cloth = $event;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin && res.orgType === 3) {
        this.checkUserId = res.userId;
        this.orgCode = res.orgCode;
        this.orgType = res.orgType;
        this.orgName = res.orgName;
        this.param.orgList = [res.orgCode];
        this.form.value.orgName = res.orgName;
        this.getInfo();
        this.getStaff();
      }
    }).unsubscribe();
  }

}
