import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaniereComponent } from './paniere.component';

describe('PaniereComponent', () => {
  let component: PaniereComponent;
  let fixture: ComponentFixture<PaniereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaniereComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaniereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
