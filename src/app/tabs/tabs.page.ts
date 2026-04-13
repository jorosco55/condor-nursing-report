import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, medkitOutline, bandageOutline, shareOutline, alertCircleOutline } from 'ionicons/icons';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage implements OnInit, OnDestroy {
  narcoticsAlert = false;
  medsAlert = false;
  scAlert = false;
  private destroy$ = new Subject<void>();

  private reportService = inject(ReportService);

  constructor() {
    addIcons({ documentTextOutline, medkitOutline, bandageOutline, shareOutline, alertCircleOutline });
  }

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

    this.reportService.scAlert$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.scAlert = value);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
