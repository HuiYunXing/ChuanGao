import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-doc-search',
  templateUrl: './doc-search.component.html',
  styleUrls: ['./doc-search.component.scss']
})
export class DocSearchComponent implements OnInit {
  form: FormGroup;
  startTime: string;
  endTime: string;
  count: number;
  login: Observable<any> = new Observable<any>();
  hasDo: number;
  orgList: Array<any>;
  planList: Array<any>;
  orgName: string;
  orgType: number;
  selectedDoc: string;
  page = 0;
  size = 15;
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

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      fileNum: new FormControl('', Validators.nullValidator),
      keyWord: new FormControl('', Validators.nullValidator),
      fileType: new FormControl('', Validators.nullValidator),
      fileLevel: new FormControl('', Validators.nullValidator)
    });
    this.cols = [
      { field: 'fileType', header: '文件类型' },
      { field: 'fileName', header: '文件名称' },
      { field: 'fileUnit', header: '发文单位' },
      { field: 'fileNum', header: '发文文号' },
      { field: 'fileLevel', header: '文件级别' },
      { field: 'filePublishTime', header: '发文时间' },
      { field: 'fileOwnerName', header: '上传单位' },
      { field: 'keyWord', header: '关键字' }
    ];
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

  submit() {
    this.getInfo(this.page, this.size);
  }

  paginate(event) {
    this.getInfo(event.page, this.size);
  }

  select(val) {
    this.selectedDoc = val === this.selectedDoc ? '' : val;
  }

  checked(val) {
    return val === this.selectedDoc;
  }

  down() {
    if (this.selectedDoc) {
      window.open(this.selectedDoc);
    } else {
      this.sharedService.addAlert('警告', '请选择一个文档');
    }
  }
  getInfo(page: number, size: number) {
    this.form.value.filePublishStartTime = this.dateFormat(this.startTime);
    this.form.value.filePublishEndTime = this.dateFormat(this.endTime);
    this.form.value.orgCode = this.orgList[0].data;
    const param = {
      page: page,
      size: size,
    };
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      param[el] = this.form.value[el];
    });
    this.sharedService
      .post('/FileManager/get', JSON.stringify(param), {
        httpOptions: true,
        animation: true
      })
      .subscribe(res => {
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.hasData = true;
        }
        this.planList = res.data.fileManagerDataList;
      });
  }

  check($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin !== 2) {
        this.orgType = res.orgType;
        this.orgList = [{
          data: res.orgCode
        }];
        this.orgName = res.orgName;
        this.getInfo(this.page, this.size);
      }
    }).unsubscribe();
  }

}
