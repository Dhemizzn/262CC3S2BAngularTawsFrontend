import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewQuote } from './new-quote';

describe('NewQuote', () => {
  let component: NewQuote;
  let fixture: ComponentFixture<NewQuote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewQuote],
    }).compileComponents();

    fixture = TestBed.createComponent(NewQuote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
