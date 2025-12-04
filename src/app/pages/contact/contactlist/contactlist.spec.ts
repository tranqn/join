import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contactlist } from './contactlist';

describe('Contactlist', () => {
  let component: Contactlist;
  let fixture: ComponentFixture<Contactlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contactlist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contactlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
