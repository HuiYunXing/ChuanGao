import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-green-check-detail',
  templateUrl: './green-check-detail.component.html',
  styleUrls: ['./green-check-detail.component.scss']
})
export class GreenCheckDetailComponent implements OnInit {
  login: Observable<any> = new Observable<any>();
  id: string;
  data: any = {};
  boxType = ['开放货车', '封闭货车', '帆布货车', '其他货车'];
  carType = ['两轴货车', '三轴货车', '四轴货车', '五轴货车', '六轴货车'];
  shift = ['早班', '晚班'];
  firstCheck = ['未检', '合格', '不合格'];
  dealResult = ['免费放行', '缴费放行'];
  runType = ['正常运输', '超限运输', '装载比例不足', '货品不符', '其他'];
  // btnShow: false;
  notCheck: boolean;
  orgType: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = this.store.select('login');
  }

  getInfo() {
    this.sharedService.get(
      `/Green/getCarHisById?id=${this.id}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.data = res.data;
        this.notCheck = !res.data.firstCheck;
        this.data.boxTypeCN = this.boxType[this.data.boxType];
        this.data.carTypeCN = this.carType[this.data.carType - 1];
        this.data.shiftCN = this.shift[this.data.shift - 1];
        this.data.firstCheckCN = this.firstCheck[this.data.firstCheck];
        this.data.dealResultCN = this.dealResult[this.data.dealResult - 1];
        this.data.runTypeCN = this.dealResult[this.data.dealResult - 1];
      }
    )
  }

  passSubmit() {
    this.sharedService.get(
      `/Green/carCheck?id=${this.id}&check=1`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.router.navigate(['/main/green/check']);
      }
    )
  }

  notpassSubmit() {
    this.sharedService.get(
      `/Green/carCheck?id=${this.id}&check=2`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        this.router.navigate(['/main/green/check']);
      }
    )
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgType = res.orgType;
      }
    }).unsubscribe();
    this.id = this.route.snapshot.queryParams['id'];
    this.getInfo();
  }

}
