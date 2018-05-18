import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../service/shared-service.service';
import { iterateListLike } from '@angular/core/src/change_detection/change_detection_util';

@Component({
  selector: 'app-goods-search',
  templateUrl: './goods-search.component.html',
  styleUrls: ['./goods-search.component.scss']
})
export class GoodsSearchComponent implements OnInit {
  goodsDetail: any;
  dataArr: any;
  cols: any;

  constructor(
    private sharedService: SharedService
  ) {
    this.cols = ['name', 'itemDetail', 'freeItem', 'noFreeItem', 'remark'];
  }

  getBaseGoods() {
    this.sharedService.get(
      '/Green/getBaseGoods',
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.dataArr = res.data.sort((a, b) => a.code - b.code);
        this.getDetailGoods();
      }
    )
  }

  getDetailGoods() {
    this.sharedService.get(
      '/Green/getDetailGoods',
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.goodsDetail = res.data.sort((a, b) => a.pCode - b.pCode);
        this.dataArr.forEach(el => {
          el.children = res.data.filter(item => item.pCode === el.code);
        });
      }
    )
  }

  ngOnInit() {
    this.getBaseGoods();
  }

}
