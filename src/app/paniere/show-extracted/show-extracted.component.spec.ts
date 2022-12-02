import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExtractedComponent } from './show-extracted.component';

describe('ShowExtractedComponent', () => {
  let component: ShowExtractedComponent;
  let fixture: ComponentFixture<ShowExtractedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowExtractedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowExtractedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
