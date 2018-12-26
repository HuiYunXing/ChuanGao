import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-staff-count',
  templateUrl: './staff-count.component.html',
  styleUrls: ['./staff-count.component.scss']
})
export class StaffCountComponent implements OnInit {
  options1: any;
  options2: any;
  options3: any;
  options4: any;
  updateOptions1: any;
  updateOptions2: any;
  updateOptions3: any;
  updateOptions4: any;
  login: Observable<any> = new Observable<any>();
  orgType: number;
  orgCode: string;
  cols: any;

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
  }

  getInfo(orgCode) {
    this.sharedService.get(`/StaffMag/staffStatistics?orgCode=${orgCode}`, {
      animation: true
    })
      .subscribe(res => {
        this.updateOptions1 = {
          series: [{
            name: '男',
            type: 'bar',
            stack: 'one',
            data: res.data.mans
          }, {
            name: '女',
            type: 'bar',
            stack: 'one',
            data: res.data.womem
          }]
        };
        const series2 = {
          type: 'pie',
          radius: [20, 70],
          roseType: 'area',
          data: [
            { value: res.data.educational[0], name: '研究生' },
            { value: res.data.educational[1], name: '本科' },
            { value: res.data.educational[2], name: '专科' },
            { value: res.data.educational[3], name: '中专' },
            { value: res.data.educational[4], name: '高中' }
          ]
        };
        series2.data = series2.data.filter(el => el.value > 0);
        this.updateOptions2 = {
          series: series2
        };
        const data3 = [];
        const keys = Object.keys(res.data.workAge);
        keys.forEach(el => {
          data3[+el] = res.data.workAge[+el];
        });
        for (let i = 0; i < data3.length; i++) {
          data3[i] = data3[i] || 0;
        }
        this.updateOptions3 = {
          series: {
            type: 'bar',
            data: data3
          }
        };
        const series4: any = {
          type: 'pie',
          radius: [20, 70],
          roseType: 'area',
          data: [
            { value: res.data.educational[0], name: '研究生' },
            { value: res.data.educational[1], name: '本科' },
            { value: res.data.educational[2], name: '专科' },
            { value: res.data.educational[3], name: '中专' },
            { value: res.data.educational[4], name: '高中' }
          ]
        };
        switch (this.orgType) {
          case 1: {
            series4.data = [
              { value: res.data.workPostList[0], name: '营运公司高级管理人员' },
              { value: res.data.workPostList[1], name: '营运公司中级管理人员' },
              { value: res.data.workPostList[2], name: '营运公司一般管理人员' }
            ];
            break;
          }
          case 2: {
            series4.data = [
              { value: res.data.workPostList[0], name: '管理处高级管理人员' },
              { value: res.data.workPostList[1], name: '管理处中级管理人员' },
              { value: res.data.workPostList[2], name: '管理处一般管理人员' }
            ];
            break;
          }
          case 3: {
            series4.data = [
              { value: res.data.starList[0], name: '一星' },
              { value: res.data.starList[1], name: '两星' },
              { value: res.data.starList[2], name: '三星' },
              { value: res.data.starList[3], name: '四星' },
              { value: res.data.starList[4], name: '五星' }
            ];
            break;
          }
        }
        series4.data = series4.data.filter(el => el.value > 0);
        this.updateOptions4 = {
          series: series4
        };
      });
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res) {
        this.orgType = res.orgType;
        this.orgCode = res.orgCode;
        this.getInfo(this.orgCode);
      }
    }).unsubscribe();

    const xAxisData: any = [];

    this.options1 = {
      title: {
        text: '年龄结构图',
        x: 'center',
        y: 'bottom'
      },
      legend: {
        data: ['男', '女'],
        align: 'right',
        width: '100%',
        height: '100%'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        data: ['18以下', '18-21', '22-25', '26-29', '30-33', '34-37', '38-41', '42-45', '46-49', '50-53', '54以上'],
        silent: false,
        splitLine: {
          show: false
        }
      },
      yAxis: {
        minInterval: 1
      },
      series: [{
        name: '男',
        type: 'bar',
        stack: 'one',
        itemStyle: {
          normal: {
            color: '#00D286'
          }
        }
      }, {
        name: '女',
        type: 'bar',
        stack: 'one',
        itemStyle: {
          normal: {
            color: '#D23343'
          }
        }
      }]
    };

    this.options2 = {
      title: {
        text: '学历展示图',
        x: 'center',
        y: 'bottom'
      },
      legend: {
        data: ['研究生', '本科', '专科', '中专', '高中'],
        orient: 'vertical',
        x: 'right',
        y: 'center'
      },
      tooltip: {
        formatter: '{c}'
      },
      series: {
        type: 'pie',
        radius: [20, 70],
        roseType: 'area'
      }
    };

    this.options3 = {
      title: {
        text: '工龄分布图',
        x: 'center',
        y: 'bottom'
      },
      yAxis: {
        name: '年',
        data: Array.from(new Array(30), (el, index) => index + '年')
      },
      xAxis: {
        name: '人数',
        minInterval: 3
      },
      tooltip: {
        formatter: '{c}'
      }
    };

    this.options4 = {
      title: {
        x: 'center',
        y: 'bottom'
      },
      legend: {
        type: 'scroll'
      },
      tooltip: {
        formatter: '{c}'
      },
    };

    switch (this.orgType) {
      case 1: {
        this.options4.title.text = '岗位统计图';
        this.options4.legend.data = ['营运公司高级管理人员', '营运公司中级管理人员', '营运公司一般管理人员'];
        this.options4.legend.orient = 'vertical';
        break;
      }
      case 2: {
        this.options4.title.text = '岗位统计图';
        this.options4.legend.data = ['管理处高级管理员', '管理处中级管理员', '管理处一般管理人员'];
        this.options4.legend.orient = 'vertical';
        break;
      }
      case 3: {
        this.options4.title.text = '星评统计图';
        this.options4.legend.data = ['一星', '两星', '三星', '四星', '五星'];
        break;
      }
    }
  }

}
