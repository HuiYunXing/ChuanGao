import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit {
  login: Observable<any>;
  form: FormGroup;
  checkItem: string;
  keys: Array<string>;
  requiredItems: any = {
    pileInfo: '管辖范围描述（起止桩号集合）',
    totalMileage: '所辖路段里程（单位：公里）',
    address: '地址',
    contacts: '联系人',
    phoneNo: '联系电话',
    longitude: '经度',
    latitude: '纬度',
    briefIntro: '公司简介',
    historyHonour: '管理处历史荣誉'
  };

  constructor(
    private store: Store<any>,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      divisionCode: new FormControl('', Validators.nullValidator),
      divisionName: new FormControl('', Validators.nullValidator),
      pileInfo: new FormControl('', Validators.nullValidator),
      historyHonour: new FormControl('', Validators.nullValidator),
      address: new FormControl('', Validators.nullValidator),
      contacts: new FormControl('', Validators.nullValidator),
      phoneNo: new FormControl('', Validators.nullValidator),
      briefIntro: new FormControl('', Validators.nullValidator),
      // status: new FormControl('', Validators.nullValidator),
      totalMileage: new FormControl('', Validators.nullValidator),
      longitude: new FormControl('', Validators.nullValidator),
      latitude: new FormControl('', Validators.nullValidator)
    });
    this.keys = Object.keys(this.form.value);
  }

  getInfo(orgCode) {
    this.sharedService.get(`/BaseInfo/getDefaultDivision?divisionCode=${orgCode}`,{animation: true})
      .subscribe(res => {
        this.form.patchValue(res.data);
        this.checkItem = res.data.status;
      });
  }

  submit() {
    this.form.value.status = +this.checkItem;
    this.sharedService
      .post(
        '/BaseInfo/setDefaultDivision',
        JSON.stringify(this.form.value),
        {
          httpOptions: true,
          successAlert: true,
          animation: true
        }
      )
      .subscribe();
  }

  check($event) {
    this.checkItem = $event.target.value;
  }

  test(val) {
    return val === +this.checkItem;
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.orgType === 2) {
        this.getInfo(res.orgCode);
      }
    }).unsubscribe();
    window.scrollTo(0, 0);
  }
}
