import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { work_post } from '../../../../store/translate';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from '../../../../service/shared-service.service';

@Component({
  selector: 'app-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.scss']
})
export class StarComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  cols: Array<any>;
  page = 0;
  size = 15;
  starList: Array<any>;
  starList2: Array<any>;
  hasData: boolean;
  resultList: any;
  staffList: any;
  year: number;
  yearList: Array<number> = [];
  view = 0;
  selectedId: any;
  _select: any;
  workPost = work_post;
  form: FormGroup;
  score = {
    0: '无 星',
    1: '一 星',
    2: '二 星',
    3: '三 星',
    4: '四 星',
    5: '五 星'
  };

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.cols = [
      { field: 'userId', header: '收费员编号' },
      { field: 'userName', header: '收费员名称' },
      { field: 'year', header: '考核年度' },
      { field: 'scoreCN', header: '考核星级' }
    ];
    this.form = new FormGroup({
      userId: new FormControl('', Validators.nullValidator),
      year: new FormControl('', Validators.nullValidator),
      score: new FormControl('', Validators.nullValidator)
    });
  }

  getInfo() {
    this.sharedService.post(
      '/Check/getCheckStar',
      JSON.stringify({
        orgList: [this.orgCode],
        page: this.page,
        size: this.size
      }),
      {
        httpOptions: true,
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.starList = res.data.checkSingleDataList;
        this.starList.forEach(val => val.scoreCN = this.score[val.score]);
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

  add() {
    this.view = 1;
    this.getStaff();
  }

  delete() {
    this.sharedService.get(
      `/Check/deleteCheck?id=${this.selectedId}&type=2`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => this.toFirstPage()
    );
  }

  toFirstPage() {
    const element = document.getElementsByClassName('ui-paginator-page')[0] as HTMLElement;
    if (element) {
      element.click();
    }else {
      this.getInfo();
    }
  }

  update() {
    if (this.selectedId) {
      this.view = 2;
      this._select = this.starList.filter(el => el.id === this.selectedId)[0];
      this.form.patchValue(this._select);
    }else {
      this.sharedService.addAlert('警告', '请选择一个记录');
    }
  }

  check(val) {
    return this.selectedId === val;
  }

  select(id) {
    this.selectedId = id === this.selectedId ? '' : id;
  }

  getData() {
    this.sharedService.post(
      '/Check/getCheckStar',
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
    )
  }

  addStar() {
    this.sharedService.post(
      '/Check/setCheckStar',
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
      '/Check/setCheckStar',
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

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.orgType === 3) {
        this.orgCode = res.orgCode;
        this.getInfo();
      }
    }).unsubscribe();
    const year = (new Date()).getFullYear();
    for (let i = 0; i < 10; i++) {
      this.yearList[i] = year - i;
    }
    this.year = year;
  }
}
