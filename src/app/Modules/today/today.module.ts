import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodayComponent } from './today.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PercentagePipe } from './percentage-pipe/percentage.pipe';
import { PortionsModalPage } from './portions-modal/portions-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TodayComponent
  }
];

@NgModule({
  declarations: [TodayComponent, PercentagePipe, PortionsModalPage],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
  ]
})
export class TodayModule { }
