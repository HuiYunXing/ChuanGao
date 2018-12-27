import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { list_group, shiftId } from '../../store/translate';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-switch-choose',
  templateUrl: './switch-choose.component.html',
  styleUrls: ['./switch-choose.component.scss']
})
export class SwitchChooseComponent implements OnInit, DoCheck {
  @Input()
  teams: string;

  @Input()
  userId: string;

  @Input()
  set userName(userName: string) {
    this._username = userName;
  }

  get userName() {
    return this._username;
  }

  @Output()
  chosenSchedule: EventEmitter<any> = new EventEmitter<any>();

  list_group = list_group;
  shiftId = shiftId;
  orgCode: string;
  cols: any;
  scheduleList: Array<any>;
  switchList: Array<any>;
  login: Observable<any> = new Observable<any>();
  _teams: string;
  _userId: string;
  switchTableShow = false;
  _username: string;
  loadingSchedule = false;

  _teamGroup: string;
  _date: string;

  constructor(
    private sharedServie: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
    this.cols = [
      { field: 'userName', header: '申请人' },
      { field: 'userSex', header: '上班日期' },
      { field: 'politicalStatus', header: '班组' },
      { field: 'userTel', header: '班次' },
      { field: 'userMail', header: '排班类型' }
    ];
  }

  toggle() {
    this.switchTableShow = !this.switchTableShow;
  }

  getSchedule() {
    this.loadingSchedule = true;
    this.sharedServie.get(`/ShiftChange/getScheduleByTeams?stationCode=${this.orgCode}&teams=${this._teams}&userId=${this._userId}`, {
      animation: true
    })
    .subscribe(res => {
              this.loadingSchedule = false;
              const _month = (new Date()).getMonth();
              const _thisMonth = _month;
              this.scheduleList = res.data.filter(el => {
                const diff = Math.abs((new Date(el.scheduleDate)).getMonth() - _thisMonth);
                return diff === 0 || diff === 1 || diff === 11;
              });
            });
  }

  chooseSchedule(schedule) {
    console.log(schedule);
    this._username = schedule.userName;
    this._teamGroup = schedule.shiftId;
    this._date = schedule.scheduleDate;
    this.chosenSchedule.emit(schedule);
    this.switchTableShow = false;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgCode = res.orgCode;
      }
    }).unsubscribe();
    this._username = this.userName;
    if (this.teams && this.userId) {
      this._teams = this.teams;
      this._userId = this.userId;
      this.getSchedule();
    }
  }

  ngDoCheck() {
    if (this.teams && this.userId && (this.teams !== this._teams || this._userId !== this.userId)) {
      this._teams = this.teams;
      this._userId = this.userId;
      this.getSchedule();
    }
  }

}
