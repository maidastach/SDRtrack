import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Portion } from 'src/app/Interfaces/Food.interface';

@Component({
  selector: 'app-portions-modal',
  templateUrl: './portions-modal.page.html',
  styleUrls: ['./portions-modal.page.scss'],
})
export class PortionsModalPage implements OnInit
{
  @Input() portions: Portion[];

  constructor(private modal: ModalController) { }

  ngOnInit() { }

  closeModal(): void
  {
    this.modal.dismiss();
  }


}
