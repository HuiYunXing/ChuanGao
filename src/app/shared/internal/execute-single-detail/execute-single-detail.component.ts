import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-execute-single-detail',
  templateUrl: './execute-single-detail.component.html',
  styleUrls: ['./execute-single-detail.component.scss']
})
export class ExecuteSingleDetailComponent implements OnInit {
  initData: any;
  id: string;
  planData: any = {};
  doData: any = {};
  doFilePath: string;
  planFilePath: string;

  constructor(
    private route: ActivatedRoute
  ) {

  }

  goBack() {
    window.history.back();
  }

  ngOnInit() {
    const data = window.sessionStorage.getItem('execute');
    this.id = this.route.snapshot.queryParams['id'];
    this.initData = JSON.parse(data);
    this.planData = this.initData.trainPlanData;
    this.doData = this.initData.trainDoListDataList.map(el => el.trainDoDetailDataList).reduce((a, b) => a.concat(b)).filter(el => el.id === this.id)[0];
    this.doData.trainDoOrgName = this.planData.trainDoOrgList.join('，');
    this.doFilePath = this.doData.trainFilePath;
    this.planFilePath = this.planData.trainPlanFile;
  }

}
