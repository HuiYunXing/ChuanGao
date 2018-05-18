import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import * as Actions from '../../store/cacheStore.actions';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  login: Observable<any>;
  role = '';
  orgLevel = ['超级', '路公司', '管理处', '收费站'];
  noteData: any = {};
  noteCount = 0;
  isShowDetail: boolean = false;
  isShowManager: boolean = false;
  orgType;
  isAdmin;

  logout(): void {
    window.sessionStorage.setItem('login', '');
    this.store.dispatch(new Actions.SaveLogin(''));
    this.router.navigate(['/login']);
  }

  constructor(
    private store: Store<any>,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
  }


  // 获取通知信息
  getNotification(orgCode, orgType) {
    this.sharedService.get(`/BaseInfo/getNotification?orgCode=${orgCode}&orgType=${orgType}`, {
      animation: true
    })
      .subscribe(res => {
        this.noteData = res.data;
        if (this.noteData) {
          this.noteCount = (this.noteData.shiftChangeCount || 0) +
            (this.noteData.returnCount || 0) +
            (this.noteData.replaceCount || 0) +
            (this.noteData.leaveCount || 0);
        }
      });
  }

  // 显示通知详情
  showNoteDetail() {
    this.isShowDetail = true;
  }

  // 隐藏通知详情
  hideNoteDetail() {
    this.isShowDetail = false;
  }

  // 调整对应通知详情页面
  linkDetail(_type) {
    let urlList = this.router.url.split('/');
    let urlCount = urlList.length - 1;
    let parentUrl = '';
    for (let i = 0; i < urlCount; i++) {
      parentUrl += '../';
    }
    if ('shift' === _type) {
      this.router.navigate([parentUrl + urlList[1] + '/staff/switchEdit']);
    }
    else if ('replace' === _type) {
      this.router.navigate([parentUrl + urlList[1] + '/staff/holdEdit']);
    }
    else if ('leave' === _type) {
      this.router.navigate([parentUrl + urlList[1] + '/staff/leaveEdit']);
    }
    else if ('editPassword' === _type) {
      this.router.navigate([parentUrl + urlList[1] + '/editPassword']);
    }
    else if ('return' === _type) {
      this.router.navigate([parentUrl + urlList[1] + '/staff/returnEdit']);
    }
  }

  showUserManager() {
    this.isShowManager = !this.isShowManager;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        let orgTypeDes;
        this.isAdmin = res.isAdmin;
        if(2 === this.isAdmin){
          orgTypeDes = '超级';
          this.orgType = '';
        }else{
          this.orgType = res.orgType;
          orgTypeDes = this.orgLevel[res.orgType];
          this.getNotification(res.orgCode, res.orgType);
        }
        this.role = `${orgTypeDes}${res.isAdmin ? '管理员' : '普通'}账号`;
      }
    }).unsubscribe();
  }

}
