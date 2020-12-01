import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RbnComponent } from './rbn.component';

describe('RbnComponent', () => {
  let component: RbnComponent;
  let fixture: ComponentFixture<RbnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RbnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RbnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
