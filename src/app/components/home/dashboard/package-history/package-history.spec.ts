import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PackageHistory } from './package-history';

describe('PackageHistory', () => {
  let component: PackageHistory;
  let fixture: ComponentFixture<PackageHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(PackageHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
