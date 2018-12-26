import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-station-search',
  templateUrl: './station-search.component.html',
  styleUrls: ['./station-search.component.scss']
})
export class StationSearchComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  form: FormGroup;
  startDate: string;
  orgName: string;
  endDate: string;
  count: number;
  isChosen: boolean;
  doData: any = {};
  doFilePath: string;
  orgType: number;
  order: number;
  orgList: Array<any>;
  planList: Array<any>;
  hasData = false;
  selectionMode = 'single';
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
  param: any = {
    page: 0,
    size: 15
  }

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      meetingName: new FormControl('', Validators.nullValidator)
    });
    this.isChosen = false;
    this.cols = [
      { field: 'meetingName', header: '会议名称', sortItem: 'meetingName', sortable: true  },
      { field: 'meetingPlace', header: '会议地点', sortItem: 'meetingPlace', sortable: true  },
      { field: 'stationName', header: '所属机构', sortItem: 'stationName', sortable: true  },
      { field: 'meetingDate', header: '会议时间', sortItem: 'meetingDate', sortable: true  },
      { field: 'meetingHost', header: '主持人', sortItem: 'meetingHost', sortable: true  },
      { field: 'meetingNote', header: '记录人', sortItem: 'meetingNote', sortable: true  },
      { field: 'meetingJoinPeople', header: '参与人员' },
      { field: 'meetingContent', header: '会议内容', sortItem: 'meetingContent', sortable: true  }
    ];
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
      this.sharedService.addAlert('警告', '未选择机构');
    } else {
      this.getInfo();
    }
  }

  paginate(event) {
    this.param.page = event.page;
    this.getInfo();
  }

  getInfo() {
    this.form.value.startDate = this.dateFormat(this.startDate);
    this.form.value.endDate = this.dateFormat(this.endDate);
    this.form.value.orgList = this.orgList.map(el => el.data);
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.param[el] = this.form.value[el];
    });
    this.sharedService.post('/StationMeeting/get', JSON.stringify(this.param), {
      httpOptions: true,
      animation: true,
      lock: true
    })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
        }
        res.data.stationMeetingDataList.forEach(el => {
          if (el.meetingJoinPeople && el.meetingJoinPeople.length) {
            el.meetingJoinPeople = el.meetingJoinPeople.map(item => item.userName).join(',');
          }
        })
        this.planList = res.data.stationMeetingDataList;
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
        if (this.orgType === 3) {
          this.getInfo();
        }
      }
    }).unsubscribe();
  }

}
