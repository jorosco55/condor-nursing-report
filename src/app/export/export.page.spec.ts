import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExportPage } from './export.page';

describe('ExportPage', () => {
  let component: ExportPage;
  let fixture: ComponentFixture<ExportPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportPage, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
