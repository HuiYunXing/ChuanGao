import {Component, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/map';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';
import {ElementRef} from '@angular/core';
import { SharedService } from '../../../service/shared-service.service';

@Component({
  selector: 'app-self-edit',
  templateUrl: './self-edit.component.html',
  styleUrls: ['./self-edit.component.scss']
})
export class SelfEditComponent implements OnInit {
  data: any = {};
  form: FormGroup;
  staffId: string;
  hireDate: string;
  birthday: string;
  en: any;
  changeTime: string;
  file: any;
  filename: string;
  login: Observable<any> = new Observable<any>();
  orgCode: string;
  keys: Array<any>;
  orgName: string;
  orgType: number;
  data2: any;
  cropperSettings2: CropperSettings;
  bounds: any;
  srcImg: any;
  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;

  constructor(
    private elementRef: ElementRef,
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.form = new FormGroup({
      orgName: new FormControl('', Validators.nullValidator),
      userName: new FormControl('', Validators.nullValidator),
      userSex: new FormControl('', Validators.nullValidator),
      educational: new FormControl('', Validators.nullValidator),
      practitionerCertificate: new FormControl('', Validators.nullValidator),
      userTel: new FormControl('', Validators.nullValidator),
      workPost: new FormControl('', Validators.nullValidator),
      politicalStatus: new FormControl('', Validators.nullValidator),
      positionalTitle: new FormControl('', Validators.nullValidator),
      emergencyContact: new FormControl('', Validators.nullValidator),
      emergencyPhone: new FormControl('', Validators.nullValidator),
      userMail: new FormControl('', Validators.nullValidator),
      jobDetail: new FormControl('', Validators.nullValidator),
      listGroup: new FormControl('', Validators.nullValidator),
      awardDetail: new FormControl('', Validators.nullValidator),
      specialSkill: new FormControl('', Validators.nullValidator)
    });
    this.keys = Object.keys(this.form.value);
    this.en = {
      firstDayOfWeek: 0,
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
    this.login = store.select('login');

    this.cropperSettings2 = new CropperSettings();
    this.cropperSettings2.width = 150;
    this.cropperSettings2.height = 200;
    // this.cropperSettings2.keepAspect = false;

    this.cropperSettings2.croppedWidth = 150;
    this.cropperSettings2.croppedHeight = 200;

    this.cropperSettings2.canvasWidth = 500;
    this.cropperSettings2.canvasHeight = 300;

    this.cropperSettings2.minWidth = 70;
    this.cropperSettings2.minHeight = 100;

    this.cropperSettings2.rounded = false;
    this.cropperSettings2.minWithRelativeToResolution = false;

    this.cropperSettings2.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings2.cropperDrawSettings.strokeWidth = 2;
    this.cropperSettings2.noFileInput = true;

    this.data2 = {};
  }

  cropped(bounds) {
    this.bounds = bounds;
  }

  /**
   * Used to send image to second cropper
   * @param $event
   */
  fileChangeListener($event) {
    this.filename = $event.target.files[0].name;
    this.file = $event.target.files[0];
    const image: any = new Image();
    const file: File = $event.target.files[0];
    const myReader: FileReader = new FileReader();
    const that = this;
    // myReader.onloadend = function (loadEvent: any) {
    //   image.src = loadEvent.target.result;
    //   that.cropper.setImage(image);
    //   that.srcImg = that.cropper.inputImage;
    // };

    // myReader.readAsDataURL(file);
  }

  getStaffInfo(staffId) {
    this.sharedService.get(
      `/User/getUserDetail?userId=${staffId}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.data = res.data;
        this.form.patchValue(res.data);
        this.hireDate = res.data.hireDate;
        this.birthday = res.data.birthday;
        this.changeTime = res.data.changeTime;
        this.filename = res.data.fileName;
      }
    )
  }

  submit() {
    this.updateStaff();
  }

  fileChange($event) {
    this.filename = $event.target.files[0].name;
    this.file = $event.target.files[0];
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

  updateStaff() {
    const keys = Object.keys(this.form.value);
    keys.forEach(el => {
      this.data[el] = this.form.value[el];
    });
    this.data.hireDate = this.dateFormat(this.hireDate);
    this.data.birthday = this.dateFormat(this.birthday);
    this.data.changeTime = this.dateFormat(this.changeTime);
    this.data.politics = this.data.politics ? this.data.politics : 0;
    this.data.positionalTitle = this.data.positionalTitle ? this.data.positionalTitle : 0;
    this.sharedService.post(
      '/User/setUserDetail',
      JSON.stringify(this.data),
      {
        httpOptions: true,
        successAlert: true,
        animation: true
      }
    ).subscribe(
      () => {
        if (this.file) {
          this.upload(this.data.userId);
        }
      }
    )
  }

  upload(userId) {
    const formdata = new FormData();
    formdata.append('file', this.file);
    if (this.bounds) {
      formdata.append('imageX', this.bounds.x);
      formdata.append('imageY', this.bounds.y);
      formdata.append('imageW', this.bounds.w);
      formdata.append('imageH', this.bounds.h);
    }
    formdata.append('userId', userId);
    this.sharedService.post(
      '/upload/userInfo',
      formdata,
      {
        httpOptions: false,
        successAlert: true,
        animation: true
      }
    ).subscribe()
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgCode = res.orgCode;
        this.orgName = res.orgName;
        this.orgType = res.orgType;
        this.staffId = res.userId;
        this.form.value.orgName = res.orgName;
        this.getStaffInfo(res.userId);
      }
    }).unsubscribe();
  }

}
