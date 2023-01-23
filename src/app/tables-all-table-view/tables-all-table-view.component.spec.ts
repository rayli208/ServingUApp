import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesAllTableViewComponent } from './tables-all-table-view.component';

describe('TablesAllTableViewComponent', () => {
  let component: TablesAllTableViewComponent;
  let fixture: ComponentFixture<TablesAllTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablesAllTableViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesAllTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
