import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import { SharedService } from '../service/shared-service.service';

@Component({
  selector: 'app-super',
  templateUrl: './super.component.html',
  styleUrls: ['./super.component.scss']
})
export class SuperComponent implements OnInit {
  dataArr: any;
  selectedFiles2: any;
  treeNodes: Array<any> = [];
  login: Observable<any>;
  form: FormGroup;
  selected: any = {};
  initForm: any;
  expanded: true;
  view = 0;
  orgCode: string;
  keys: Array<string>;
  staffList: any = {};
  allTreeNodes: Array<any> = [{
    label: '机构树形图',
    data: '',
    expanded: true,
    children: [],
    orgType: 0
  }];
  requiredItems = {
    orgName: '机构名称',
    orgCode: '机构代码',
    adminName: '机构管理员姓名'
  };

  constructor(
    private store: Store<any>,
    private sharedService: SharedService
  ) {
    this.login = store.select('login');
    this.form = new FormGroup({
      orgName: new FormControl('', Validators.nullValidator),
      orgCode: new FormControl('', Validators.nullValidator),
      orgType: new FormControl('-1', Validators.nullValidator),
      adminName: new FormControl('', Validators.nullValidator),
      pOrgCode: new FormControl('', Validators.nullValidator)
    });
    this.initForm = this.form.value;
    this.keys = Object.keys(this.form.value);
  }

  nodeSelect($event) {
    this.form.patchValue($event.node);
    this.selected = $event.node;
    if (this.selected.orgType) {
      this.getStaff($event.node.data);
    }
  }

  getStaff(orgCode) {
    this.sharedService.get(
      `/Super/getAllUserInfo?orgCode=${orgCode}`,
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => {
        this.staffList = res.data;
        this.view = 2;
      }
    )
  }

  changeIsAdmin(index) {
    this.staffList[index].isAdmin = 1 - this.staffList[index].isAdmin;
  }

  add() {
    if (this.selected.orgType === 3) {
      this.sharedService.addAlert('警告', '不能为收费站添加子机构！');
    }else {
      const orgType = this.selected.orgType || 0;
      this.view = 1;
      this.form.patchValue(this.initForm);
      this.form.patchValue({
        pOrgCode: this.selected.data,
        orgType: orgType + 1
      });
    }
  }

  addAdmin() {
    const param = this.staffList.map(el => {
      return {
        userId: el.adminCode,
        isAdmin: el.isAdmin
      };
    });
    if (param.filter(el => el.isAdmin).length > 0) {
      this.sharedService.post(
        '/Super/setManager',
        JSON.stringify(param),
        {
          httpOptions: true,
          successAlert: true,
          animation: true
        }
      ).subscribe(
        () => this.getStaff(this.selected.data)
      );
    }else {
      this.sharedService.addAlert('警告', '至少选择一个管理员！');
    }
  }

  delete() {
    this.sharedService.addConfirm('确认通知', '是否确认删除？').subscribe(() => {
      this.sharedService.get(`/Super/deleteOrg?orgCode=${this.selected.data}&orgType=${this.selected.orgType}`,
        {
          successAlert: true,
          animation: true
        }
      ).subscribe(
        () => {
          this.view = 0;
          this.getOrgInfo();
        }
      )
    })
  }

  addChild(arr, node) {
    if (arr.id === node.pid) {
      arr.children.push({
        label: node.orgName,
        data: node.orgCode,
        id: node.id,
        orgType: node.orgType,
        children: [],
        expanded: true,
        adminDataList: node.adminDataList
      });
    } else if (arr.children.length > 0) {
      arr.children.forEach(el => {
        this.addChild(el, node);
      });
    }
  }

  toTreeNode(arr) {
    for (let i = 1; i <= 3; i++) {
      const _arr = arr.filter(el => el.orgType === i);
      _arr.forEach(el => {
        if (el.pid) {
          this.treeNodes.forEach(element => {
            this.addChild(element, el);
          });
        } else {
          this.treeNodes.push({
            label: el.orgName,
            data: el.orgCode,
            id: el.id,
            orgType: el.orgType,
            children: [],
            expanded: true,
            adminDataList: el.adminDataList
          });
        }
      });
    }
    this.allTreeNodes[0].children = this.treeNodes;
  }

  getOrgInfo() {
    this.treeNodes = [];
    this.sharedService.get(
      '/Super/getAllOrgInfo',
      {
        successAlert: false,
        animation: true
      }
    ).subscribe(
      res => this.toTreeNode(res.data)
    );
  }

  submit() {
    const spaceArr = this.keys.filter(el => !this.form.value[el] && this.form.value[el] !== 0).map(el => this.requiredItems[el]);
    if (spaceArr.length > 0) {
      this.sharedService.addAlert('警告', `${spaceArr.join(',')}为空`);
    }else {
      this.form.value.orgType = +this.form.value.orgType;
      this.sharedService.post(
        '/Super/addOrg',
        JSON.stringify(this.form.value),
        {
          httpOptions: true,
          successAlert: true,
          animation: true
        }
      ).subscribe(
        () => {
          this.view = 0;
          this.getOrgInfo();
        }
      )
    }
  }

  resetPwd(id) {
    this.sharedService.get(
      `/resetPassword?userId=${id}`,
      {
        successAlert: true,
        animation: true
      }
    ).subscribe()
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin === 2) {
        this.orgCode = res.orgCode;
        this.getOrgInfo();
      }
    }).unsubscribe();
  }

}
