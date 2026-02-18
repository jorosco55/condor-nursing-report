import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TabsPage implements OnInit, OnDestroy {
  narcoticsAlert = false;
  medsAlert = false;
  private destroy$ = new Subject<void>();

  constructor(private reportService: ReportService) { }

  ngOnInit() {
    this.reportService.hydrateNarcoticsState();
    combineLatest([
      this.reportService.narcRecordStatus$,
      this.reportService.hasNarcoticSelection$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([narcStatus, hasSelection]) => {
        const isAdministered = narcStatus === 'Administered';
        this.narcoticsAlert = isAdministered && !hasSelection;
      });

    combineLatest([
      this.reportService.medicationRecordStatus$,
      this.reportService.hasMedsSelection$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([medStatus, hasSelection]) => {
        const isAdministered = medStatus === 'Administered';
        this.medsAlert = isAdministered && !hasSelection;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
