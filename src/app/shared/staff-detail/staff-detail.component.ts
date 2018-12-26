import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { work_post, politicalStatus, positionalTitle, list_group } from '../../store/translate';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-staff-detail',
  templateUrl: './staff-detail.component.html',
  styleUrls: ['./staff-detail.component.scss']
})
export class StaffDetailComponent implements OnInit {
  staffId: string;
  data: any = {};
  educational = ['研究生', '本科', '专科', '中专', '高中'];
  work_post = work_post;
  now_date = new Date();
  politicalStatus = politicalStatus;
  positionalTitle = positionalTitle;
  listGroup = list_group;

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.staffId = this.route.snapshot.queryParams['id'];
  }

  age(val) {
    return this.now_date.getFullYear() - (new Date(val)).getFullYear() || 0;
  }

  getInfo(staffId) {
    this.sharedService.get(`/User/getUserDetail?userId=${staffId}`, {
      animation: true
    })
            .subscribe(res => {
                this.data = res.data;
            });
  }

  goBack() {
    window.history.back();
  }

  ngOnInit() {
    if (this.staffId) {
      this.getInfo(this.staffId);
    }else {
      this.router.navigate(['main/home']);
    }
  }
}
