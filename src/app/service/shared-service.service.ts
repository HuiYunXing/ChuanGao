import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertComponent } from '../shared/alert/alert.component';
import { ConfirmComponent } from '../shared/confirm/confirm.component';
import { Observable } from 'rxjs/Observable';
import { LoadingComponent } from './loading/loading.component';
import { LoadingService } from './loading/loading.service';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class SharedService {
  bsModalRef: BsModalRef;
  loadingModalRef: BsModalRef;

  // private ip = `http://119.29.144.125:8080/cgfeesys`; // 测试服务器
  private ip = `http://171.217.92.230:20088/cgfeesys`;  // 客户服务器
  private loadingLock: boolean;

  constructor(
    private modalService: BsModalService,
    private loadingService: LoadingService,
    private http: Http
  ) {

  }

  addAlert(title: string, message: string): void {
    const initialState = {
      title: title,
      message: message
    };
    this.bsModalRef = this.modalService.show(AlertComponent, {initialState});
    this.bsModalRef.content.submitEmit.subscribe(res => {
      this.bsModalRef.hide();
    })
  }

  addConfirm(title: string, message: string): Observable<any> {
    return Observable.create(obser => {
      const initialState = {
        title: title,
        message: message
      };
      this.bsModalRef = this.modalService.show(ConfirmComponent, {initialState});
      this.bsModalRef.content.confirmEmit.subscribe(res => {
        this.bsModalRef.hide();
        obser.next();
      })
      this.bsModalRef.content.cancelEmit.subscribe(res => {
        this.bsModalRef.hide();
      })
    });
  }

  openLoadingAnimation(): void {
    this.loadingService.createLoading();
  }

  closeLoadingAnimation(): void {
    this.loadingService.clearLoading();
  }

  setLock(): void {
    this.loadingLock = true;
  }

  getLock(): boolean {
    return this.loadingLock;
  }

  clearLock(): void {
    this.loadingLock = false;
  }

  dateFormat(date): string {
    if (date) {
      const _date = new Date(date);
      const _month = (_date.getMonth() + 1) <= 9 ? `0${(_date.getMonth() + 1)}` : _date.getMonth() + 1;
      const _day = _date.getDate() <= 9 ? `0${_date.getDate()}` : _date.getDate();
      return `${_date.getFullYear()}-${_month}-${_day}`;
    }else {
      return '';
    }
  }

  post(path: string, param: any, options: {
    httpOptions: boolean,
    successAlert?: boolean,
    animation?: boolean,
    lock?: boolean
  }) {
    if (options.lock && this.getLock()) {
      this.addAlert('警告', '请勿重复操作！');
      return Observable.create(obser => {
        obser.next();
      })
    }else {
      if (options.lock) {
        this.setLock();
      }
      if (options.animation) {
        this.openLoadingAnimation();
      }
      return Observable.create(obser => {
        let httpOptions: any = {};
        if (options.httpOptions) {
          httpOptions = {
            headers: new Headers({'Content-Type': 'application/json'})
          }
        }
        this.http.post(this.ip + path, param, httpOptions)
        .map(res => res.json())
        .subscribe(res => {
          this.clearLock();
          if (res.code) {
            if (options.animation) {
              this.closeLoadingAnimation();
            }
            if (options.successAlert) {
              this.addAlert('通知', res.message);
            }
            obser.next(res);
          }else {
            this.addAlert('警告', res.message);
            if (options.animation) {
              this.closeLoadingAnimation();
            }
          }
        }, error => {
          this.clearLock();
          if (options.animation) {
            this.closeLoadingAnimation();
          }
          this.addAlert('警告', '网络异常，请重试！');
        })
      })
    }
  }

  get(path: string, options: {
    successAlert?: boolean,
    animation?: boolean,
    lock?: true
  }) {
    if (options.lock && this.getLock()) {
      this.addAlert('警告', '请勿重复操作！')
      return Observable.create(obser => {
        obser.next();
      })
    }else {
      if (options.lock) {
        this.setLock();
      }
      if (options.animation) {
        this.openLoadingAnimation();
      }
      return Observable.create(obser => {
        this.http.get(this.ip + path)
        .map(res => res.json())
        .subscribe(res => {
          this.clearLock();
          if (res.code) {
            if (options.animation) {
              this.closeLoadingAnimation();
            }
            if (options.successAlert) {
              this.addAlert('通知', res.message);
            }
            obser.next(res);
          }else {
            if (options.animation) {
              this.closeLoadingAnimation();
            }
            this.addAlert('警告', res.message);
          }
        }, error => {
          this.clearLock();
          if (options.animation) {
            this.closeLoadingAnimation();
          }
          this.addAlert('警告', '网络异常，请重试！');
        })
      })
    }
  }
}
