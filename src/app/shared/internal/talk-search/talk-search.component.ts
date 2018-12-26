import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../service/shared-service.service';
import { share } from 'rxjs/operators';

@Component({
  selector: 'app-talk-search',
  templateUrl: './talk-search.component.html',
  styleUrls: ['./talk-search.component.scss']
})
export class TalkSearchComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  form: FormGroup;
  startTime: string;
  endTime: string;
  count: number;
  isChosen: boolean;
  orgType: string;
  doData: any = {};
  imgArr: Array<string> = [];
  doFilePath: string;
  hasDo: number;
  orgList: Array<any>;
  orgName: string;
  planList: Array<any>;
  trainWay: string;
  trainType: string;
  trainPlanName: string;
  order: number;
  param: any = {
    page: 0,
    size: 15
  }
  hasData = false;
  selectionMode = 'single';
  reg = /.+(.JPEG|.jpeg|.JPG|.jpg|.PNG|.png)$/;
  en = {
    firstDayOfWeek: 0,
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  };
  cols: any;
  checkItem: number;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
    });
    this.isChosen = false;
    this.cols = [
      // { field: 'orgName', header: '单位名称', sortItem: 'orgName' },
      { field: 'chatLeader', header: '谈心人员', sortItem: 'chatLeader' },
      { field: 'chatType', header: '谈心类型', sortItem: 'chatType' },
      { field: 'chatLoc', header: '谈心地点', sortItem: 'chatLoc' },
      { field: 'chatDate', header: '谈心时间', sortItem: 'chatDate' },
      // { field: 'chatContent', header: '概要内容', sortItem: 'chatContent' }
    ];
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

  dateFormat(date) {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth() + 1;
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    } else {
      return '';
    }
  }

  selectedOrg($event) {
    this.orgList = $event;
  }

  submit() {
    if (!this.orgList || this.orgList.length === 0) {
      this.sharedService.addAlert('警告', '未选择机构！');
    } else {
      this.getInfo();
    }
  }

  paginate(event) {
    this.param.page = event.page;
    this.getInfo();
  }

  getInfo() {
    this.form.value.chatStartDate = this.dateFormat(this.startTime);
    this.form.value.chatEndDate = this.dateFormat(this.endTime);
    this.form.value.orgList = this.orgList.map(el => el.data);
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      if (this.form.value[el] || this.form.value[el] === 0) {
        this.param[el] = this.form.value[el];
      }
    });
    this.sharedService.post('/Chat/get', JSON.stringify(this.param) , {
      httpOptions: true,
      animation: true,
      lock: true
    })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
          res.data.chatDataList.forEach(item => {
            item.chatType = item.chatType === '0' ? '一般谈心' : '重要谈心';
          });
        }
        this.planList = res.data.chatDataList;
      });
  }

  check($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  detail(id) {
    this.isChosen = true;
    this.planList.forEach(item => {
      if (item.id === id) {
        this.doData = item;
        this.doFilePath = item.fileId;
        this.imgArr = this.doData.chatContent.split(';').filter(el => this.reg.test(el));
      }
    });
  }

  download(type) {
    if (type === 'do') {
      window.open(this.doFilePath);
    }
  }
  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgType = res.orgType;
        this.orgName = res.orgName;
        this.orgList = [{
          data: res.orgCode
        }];
        this.getInfo();
      }
    }).unsubscribe();
  }

}
