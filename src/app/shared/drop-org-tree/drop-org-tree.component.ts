import { Component, OnInit, EventEmitter, Output, Input, DoCheck } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { SharedService } from '../../service/shared-service.service';

@Component({
  selector: 'app-drop-org-tree',
  templateUrl: './drop-org-tree.component.html',
  styleUrls: ['./drop-org-tree.component.scss']
})
export class DropOrgTreeComponent implements OnInit, DoCheck {
  @Output()
  selectedOrg: EventEmitter<any> = new EventEmitter();
  @Input()
  selectionMode: string;
  @Input()
  set initOrgName(initOrgName: string) {
    if (this.selected !== initOrgName) {
      this.clear();
      this.selected = initOrgName;
      this.hasClicked = false;
    }
  }
  get initOrgName() {
    return this.selected;
  }

  @Input()
  propagateSelectionDown = false;

  login: Observable<any>;
  treeNodes: Array<any> = [];
  selectedFiles2: any;
  isShow = false;
  selected: string;
  hasClicked = false;
  initArr: Array<string> = [];

  constructor(
    private sharedService: SharedService,
    private store: Store<any>
  ) {
    this.login = store.select('login');
  }

  addChild(arr, node) {
    if (arr.id === node.pid) {
      arr.children.push({
        label: node.orgName,
        data: node.orgCode,
        id: node.id,
        orgType: node.orgType,
        expanded: true,
        children: []
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
            expanded: true,
            children: []
          });
        }
      });
    }
  }

  tab() {
    this.isShow = !this.isShow;
  }

  nodeSelect($event) {
    if (this.selectionMode === 'checkbox') {
      this.selected = this.selectedFiles2.map(el => el.label).join(', ');
    } else {
      this.selectedFiles2 = [$event.node];
      this.selected = this.selectedFiles2[0].label;
      this.isShow = false;
    }
    this.selectedOrg.emit(this.selectedFiles2);
  }

  getOrgInfo(orgCode) {
    this.sharedService.get(`/BaseInfo/getOrgRelation?orgCode=${orgCode}`, {
      animation: true
    })
    .subscribe(res => {
      this.toTreeNode(res.data);
    });
  }

  clear() {
    if (this.selectedFiles2) {
      const arr = this.selectedFiles2.map(el => el.label);
      Array.from(document.getElementsByClassName('ui-treenode-label'))
      .filter(item => {
        const dom = item.getElementsByClassName('ng-star-inserted');
        if (dom[0]) {
          return arr.includes(dom[0].innerHTML);
        }else {
          return false;
        }
      })
      .forEach(item => {
        const dom = item as HTMLElement;
        dom.click();
      });
    }
  }

  ngOnInit() {
    this.login.subscribe(res => {
      if (res && res.isAdmin !== 2) {
        this.getOrgInfo(res.orgCode);
      }
    }).unsubscribe();
    this.selected = this.selected || '';
    this.initArr = this.selected.split(',');
  }

  ngDoCheck() {
    if (!this.hasClicked && this.initArr.length && this.selectionMode === 'checkbox') {
      Array.from(document.getElementsByClassName('ui-treenode-label'))
          .filter(item => {
            const dom = item.getElementsByClassName('ng-star-inserted');
            if (dom[0]) {
              return this.initArr.includes(dom[0].innerHTML);
            } else {
              return false;
            }
          })
          .forEach(item => {
            const dom = item as HTMLElement;
            dom.click();
            this.hasClicked = true;
          });
    }
  }
}
