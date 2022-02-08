import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit
{
  constructor(private platform: Platform, private routerOutlet: IonRouterOutlet)
  {
    this.platform.backButton.subscribeWithPriority(
      -1,
      () =>
      {
        if (!this.routerOutlet.canGoBack())
        {
          if(confirm('Exit The App?'))
          {
            App.exitApp();
          }
        }
      }
    );
  }

  ngOnInit() { }
}
