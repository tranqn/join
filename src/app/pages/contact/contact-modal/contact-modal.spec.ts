import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactModal } from './contact-modal';

describe('ContactModal', () => {
  let component: ContactModal;
  let fixture: ComponentFixture<ContactModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
