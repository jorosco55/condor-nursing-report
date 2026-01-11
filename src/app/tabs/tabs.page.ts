import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TabsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
