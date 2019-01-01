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
  star: any;
  starLevelList: Array<any> = [];
  count: number;

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
        this.count = res.data.count;
        this.page = 0;
        this.hasData = true;
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
    if (!confirm('确认删除选中项的数据吗')){
      return;
    }
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

  paginate($event) {
    this.page = $event.page;
    this.getInfo();
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
          const item = res.data.checkSingleDataList.filter(staff => staff.userId == el.userId);
          if (item.length > 0) {
            el.score = item[0].score;
          }
        });
      }
    )
  }

  addStar() {
    let staffName: Array<string> = [];

    this.resultList.forEach(val => {
      val.score = val.score.split('.')[0];
      if (val.score < 0) staffName.push(val.userName);
      if (val.score > 5) staffName.push(val.userName);
    });

    if (staffName.length != 0){
      this.sharedService.addAlert('警告',`请注意数据：${staffName.join('，')}的星级评分不能小于0大于5`);
      return;
    }

    this.resultList = this.resultList.filter(val => {
      return val.score != '';
    });
    
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
      () => {
        this.view = 0;
        this.toFirstPage();
      }
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
    for (let i = 0; i < 6; i++){
      this.starLevelList[i] = i;
    }
    this.star = 0;
  }
}
