import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJobDialogComponent } from './create-job-dialog.component';

describe('CreateJobDialogComponent', () => {
  let component: CreateJobDialogComponent;
  let fixture: ComponentFixture<CreateJobDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateJobDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
