import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { work_post } from '../../../../store/translate';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from '../../../../service/shared-service.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  cols: Array<any>;
  page = 0;
  size = 15;
  examList: Array<any>;
  hasData: boolean;
  resultList: any;
  staffList: any;
  year: number;
  yearList: Array<number> = [];
  view = 0;
  selectedId: string;
  _select: any;
  workPost = work_post;
  form: FormGroup;
  count: number;
  userId: string;

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.cols = [
      { field: 'userId', header: '收费员编号' },
      { field: 'userName', header: '收费员名称' },
      { field: 'year', header: '考核年度' },
      { field: 'score', header: '考核得分' }
    ];
    this.form = new FormGroup({
      userId: new FormControl('', Validators.nullValidator),
      year: new FormControl('', Validators.nullValidator),
      score: new FormControl('', Validators.nullValidator)
    });
  }

  getInfo() {
    let param = {
      orgList: [this.orgCode],
      page: this.page,
      size: this.size,
      year: this.year,
      userId: this.userId
    };

    this.sharedService.post(
      '/Check/getCheckExam',
      JSON.stringify(param),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        if (res.data.checkSingleDataList.length > 0) {
          this.examList = res.data.checkSingleDataList;
          this.count = res.data.count;
          this.page = 0;
          this.hasData = true;
        } else {
          this.examList = [];
          this.hasData = false;
        }
      }
    );
  }

  getStaff() {
    this.sharedService.get(
      `/BaseInfo/getStationUserId?stationCode=${this.orgCode}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.staffList = res.data;
        this.resultList = this.staffList.map(el => {
          return {
            userName: el.userName,
            userId: el.userId,
            score: '',
            editable: false
          };
        });
        this.getData();
      }
    )
  }

  getData() {
    this.sharedService.post(
      '/Check/getCheckExam',
      JSON.stringify({
        orgList: [this.orgCode],
        page: 0,
        size: this.staffList.length,
        year: this.year
      }),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.resultList.forEach(el => {
          const item = res.data.checkSingleDataList.filter(staff => staff.userId === el.userId);
          if (item.length > 0) {
            el.score = item[0].score;
          }
        });
      }
    );
  }

  add() {
    this.view = 1;
    this.getStaff();
  }

  delete() {
    if(this.selectedId == null || this.selectedId == undefined){
      this.sharedService.addAlert('警告','请选择需要删除的数据！');
      return;
    }
    this.sharedService.get(
      `/Check/deleteCheck?id=${this.selectedId}&type=1`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => this.toFirstPage
    );
  }

  update() {
    if (this.selectedId) {
      this.view = 2;
      this._select = this.examList.filter(el => el.id === this.selectedId)[0];
      this.form.patchValue(this._select);
    }else {
      this.sharedService.addAlert('警告', '请选择一个记录');
    }
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    if (element) {
      element.click();
    }else {
      this.getInfo();
    }
  }

  paginate($event) {
    this.page = $event.page;
    this.getInfo();
  }

  check(val) {
    return this.selectedId === val;
  }

  select(id) {
    this.selectedId = id === this.selectedId ? '' : id;
  }

  addExam() {
    this.sharedService.post(
      '/Check/setCheckExam',
      JSON.stringify(
        this.resultList.map(el => {
          return {
            userId: el.userId,
            stationCode: this.orgCode,
            year: this.year,
            score: el.score
          };
        })
      ),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => this.view = 0
    );
  }

  updateExam() {
    this.form.value.id = this._select.id;
    this.form.value.stationCode = this.orgCode;
    this.sharedService.post(
      '/Check/setCheckExam',
      JSON.stringify(
        [this.form.value]
      ),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.view = 0;
        this.selectedId = '';
        this.toFirstPage();
      }
    )
  }

  search() {
    if (this.year && this.userId != '') {
      this.sharedService.addAlert('警告','你只能使用一个查询条件');
      return;
    }
    this.getInfo();
  }

  ngOnInit() {
    const year = (new Date()).getFullYear();
    this.userId = '';
    for (let i = 0; i < 10; i++) {
      this.yearList[i] = year - i;
    }
    this.year = year;
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.orgCode = res.orgCode;
        this.getInfo();
        this.getStaff();
      }
    }).unsubscribe();
  }
}
