import { TestBed } from '@angular/core/testing';

import { Notafiscal } from './notafiscal';

describe('Notafiscal', () => {
  let service: Notafiscal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notafiscal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
