import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditNota } from './modal-edit-nota';

describe('ModalEditNota', () => {
  let component: ModalEditNota;
  let fixture: ComponentFixture<ModalEditNota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditNota]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditNota);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
