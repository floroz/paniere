import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowBoardComponent } from './show-board.component';

describe('ShowBoardComponent', () => {
  let component: ShowBoardComponent;
  let fixture: ComponentFixture<ShowBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
