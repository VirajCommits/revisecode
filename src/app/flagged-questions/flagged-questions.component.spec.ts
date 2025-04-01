import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaggedQuestionsComponent } from './flagged-questions.component';

describe('FlaggedQuestionsComponent', () => {
  let component: FlaggedQuestionsComponent;
  let fixture: ComponentFixture<FlaggedQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FlaggedQuestionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlaggedQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
