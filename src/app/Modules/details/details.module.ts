import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PercentagePipe } from '../today/percentage-pipe/percentage.pipe';

const routes: Routes = [
  {
    path: '',
    component: DetailsComponent
  }
];

@NgModule({
  declarations: [DetailsComponent, PercentagePipe],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule
  ]
})
export class DetailsModule { }
