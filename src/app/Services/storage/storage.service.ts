import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ToastController } from '@ionic/angular';
import { FoodList, MealsObj } from 'src/app/Interfaces/Food.interface';

interface StorageType {
  key: 'mealObj' | 'foodObj';
  value: FoodList[] | MealsObj[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService
{
  constructor(private toastController: ToastController) { }

  async setProduct(obj: StorageType): Promise<void>
  {
    try
    {
      await Storage.set({ key: obj.key, value: JSON.stringify(obj.value) });
      if(obj.message)
      {
        await this.presentToast(obj.message);
      }
    }
    catch(error)
    {
      await this.presentToast('Error Saving Data!');
    }
  };

  async getProduct(key: string): Promise<any | null>
  {
    try
    {
      const { value } = await Storage.get({ key });
      return JSON.parse(value);
    }
    catch(error)
    {
      await this.presentToast('Error Loading Data!');
    }
  };

  async removeProduct(key: string): Promise<void>
  {
    try
    {
      await Storage.remove({ key });
      await this.presentToast('Data Removed Succesfully!');
    }
    catch(error)
    {
      await this.presentToast('Error Removing Data!');
    }
  };

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }
}
