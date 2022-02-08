/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { BehaviorSubject, Observable } from 'rxjs';
import { FoodList, FoodType, Meal, MealsObj, Portion, Values } from 'src/app/Interfaces/Food.interface';
import { PortionsModalPage } from 'src/app/Modules/today/portions-modal/portions-modal.page';
import { DateTimeService } from '../datetime/datetime.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class FoodService
{
  foodObj: BehaviorSubject<FoodList[]> = new BehaviorSubject<FoodList[]>([]);
  mealObj: BehaviorSubject<MealsObj[]> = new BehaviorSubject<MealsObj[]>([]);

  constructor(private http: HttpClient,
    private storageService: StorageService,
    private datetime: DateTimeService,
    private modalController: ModalController,
    private alertController: AlertController)
  { }

  getFood(): Observable<FoodList[]>
  {
    return this.http.get<FoodList[]>('/assets/products.json');
  }

  createProductsList(): FoodType[]
  {
    const products: FoodType[] = [];

    this.foodObj.value.forEach(
      (food: FoodList) => food.products.forEach(
        (product: FoodType) => products.push(product)
      )
    );

    return products;
  }

  async addProduct(product: FoodType): Promise<void>
  {
    const newFood: FoodList[] = this.foodObj.value.map(
      food => {
        if(food.category === product.category)
        {
          food.products.push(product);
        }
        return food;
      }
    );
    this.foodObj.next(newFood);

    await this.storageService.setProduct({ key: 'foodObj', value: newFood, message: 'New Product Added!' });
  }

  async deleteProduct(product: FoodType): Promise<void>
  {
    const newFood = [];
    this.foodObj.value.forEach(
      eachFood => {
        if(eachFood.category === product.category)
        {
          eachFood.products = eachFood.products.filter(
          // eslint-disable-next-line no-underscore-dangle
            prod => prod._id !== product._id
          );
        }
        newFood.push(eachFood);
      }
    );
    this.foodObj.next(newFood);
    await this.storageService.setProduct({ key: 'foodObj', value: newFood, message: 'Product Removed'});
  }


  async editProduct(editedProduct: FoodType, timeout = 1000): Promise<void>
  {
    let newFood = [];

    const type = editedProduct.category;
    const findList: FoodList = this.foodObj.value.find(eachFood => eachFood.category === type);
    // eslint-disable-next-line no-underscore-dangle
    const isSameType: FoodType | undefined = findList.products.find(prod => prod._id === editedProduct._id);

    if(isSameType)
    {
      this.foodObj.value.forEach(
        eachFood => {
          if(eachFood.category === type)
          {
            eachFood.products = eachFood.products.map(
              prod => {
                // eslint-disable-next-line no-underscore-dangle
                if(prod._id === editedProduct._id)
                {
                  prod = editedProduct;
                }
                return prod;
              }
            );
          }
          newFood.push(eachFood);
        }
      );
    }
    else
    {
      this.foodObj.value.forEach(
        eachFood => {
          {
            eachFood.products = eachFood.products.filter(
            // eslint-disable-next-line no-underscore-dangle
              prod => prod._id !== editedProduct._id
            );
          }
          newFood.push(eachFood);
        }
      );

      newFood = newFood.map(
        food => {
          if(food.category === editedProduct.category)
          {
            food.products.push(editedProduct);
          }
          return food;
        }
      );
    }
    this.foodObj.next(newFood);
    await this.storageService.setProduct({ key: 'foodObj', value: newFood, message: 'Product Updated!' });
  }

  calcValuesForEachMeal(meal: Meal): Values
  {
    let calories = 0;
    let carbs = 0;
    let sugars = 0;
    let proteins = 0;
    let fats = 0;
    let fibers = 0;

    meal.portions.map(
      portion => {
        calories += parseFloat(portion.calories);
        carbs += parseFloat(portion.carbs);
        proteins += parseFloat(portion.proteins);
        sugars += parseFloat(portion.sugars);
        fats += parseFloat(portion.fats);
        fibers += parseFloat(portion.fibers);
      }
    );

    const values: Values = {
      calories: calories.toFixed(2),
      carbs: carbs.toFixed(2),
      sugars: sugars.toFixed(2),
      proteins: proteins.toFixed(2),
      fibers: fibers.toFixed(2),
      fats: fats.toFixed(2)
    };

    return values;
  }

  calcValuesForPortion(meal: Meal): Portion[]
  {
    meal.portions = meal.portions.map(
      portion => {
        portion.calories = ((parseFloat(portion.food.calories) / 100) * parseFloat(portion.grams)).toFixed(2);
        portion.carbs = ((parseFloat(portion.food.carbs) / 100) * parseFloat(portion.grams)).toFixed(2);
        portion.sugars = ((parseFloat(portion.food.sugars) / 100) * parseFloat(portion.grams)).toFixed(2);
        portion.proteins = ((parseFloat(portion.food.proteins) / 100) * parseFloat(portion.grams)).toFixed(2);
        portion.fats = ((parseFloat(portion.food.fats) / 100) * parseFloat(portion.grams)).toFixed(2);
        portion.fibers = ((parseFloat(portion.food.fibers) / 100) * parseFloat(portion.grams)).toFixed(2);
        return portion;
      }
    );
    return meal.portions;
  }

  createDayMealObj(date: Date): MealsObj[]
  {
    const formattedDate: string = this.datetime.parseDatetoSearch(date);
    const cloned: MealsObj[] = JSON.parse(JSON.stringify(this.mealObj.value));
    const day: MealsObj[] = cloned.filter(
      (eachMealObj: MealsObj) =>
      {
        eachMealObj.meals = eachMealObj.meals.filter(
            meal => meal.date.includes(formattedDate)
        );
        return eachMealObj.meals.length > 0 && eachMealObj;
      }
    );
    return day;
  }

  createByMealObj(mealName: string): MealsObj[]
  {
    const cloned: MealsObj[] = JSON.parse(JSON.stringify(this.mealObj.value));
    const result: MealsObj[] = cloned.filter(
      (eachMealObj: MealsObj) => eachMealObj.name === mealName
    );
    return result;
  };

  createDateRangeMealObj(start: Date, end: Date): MealsObj[]
  {
    const cloned: MealsObj[] = JSON.parse(JSON.stringify(this.mealObj.value));
    const result: MealsObj[] = cloned.filter(
      (eachMealObj: MealsObj) =>
      {
        eachMealObj.meals = eachMealObj.meals.filter(
          meal => new Date(meal.createdOn) >= start && new Date(meal.createdOn) <= end
        );
        return eachMealObj.meals.length > 0 && eachMealObj;
      }
    );
    return result;
  }

  calcValuesForDay(day: MealsObj[]): Values
  {
    const values: Values = {
      calories: '0',
      carbs: '0',
      sugars: '0',
      proteins: '0',
      fats: '0',
      fibers: '0',
    };
    day.map(
      mealObj =>
        {
          mealObj.meals.forEach(
            meal =>
            {
              values.calories = (parseFloat(values.calories) + parseFloat(meal.calories)).toFixed(2);
              values.carbs = (parseFloat(values.carbs) + parseFloat(meal.carbs)).toFixed(2);
              values.sugars = (parseFloat(values.sugars) + parseFloat(meal.sugars)).toFixed(2);
              values.proteins = (parseFloat(values.proteins) + parseFloat(meal.proteins)).toFixed(2);
              values.fats = (parseFloat(values.fats) + parseFloat(meal.fats)).toFixed(2);
              values.fibers = (parseFloat(values.fibers) + parseFloat(meal.fibers)).toFixed(2);
            }
          );
        }
    );
    return values;
  }

  async openModal(portions: Portion[])
  {
    const modal = await this.modalController.create(
      {
        component: PortionsModalPage,
        cssClass: 'my-custom-class',
        componentProps: {
          portions,
        }
      }
    );
    return await modal.present();
  }

  async deletePortion(mealName: string, id: string)
  {
    const alert = await this.alertController.create(
      {
        cssClass: 'my-custom-class',
        header: 'Delete the meal?',
        buttons: [
          {
            text: 'Back',
            role: 'cancel',
            cssClass: 'secondary',
          },{
            text: 'Delete',
            handler: async () => await this.deleter(mealName, id)
          }
        ]
      }
    );
    await alert.present();
  }

  async deleter(mealName: string, id: string)
  {
    const newMealObj: MealsObj[] = this.mealObj.value.filter(
      (eachMealObj: MealsObj) =>
      {
        if(eachMealObj.name !== mealName)
        {
          return true;
        }
        eachMealObj.meals = eachMealObj.meals.filter(
          // eslint-disable-next-line no-underscore-dangle
          meal => meal._id !== id
        );
        return eachMealObj.meals.length > 0 && true;
      }
    );
    this.mealObj.next(newMealObj);
    await this.storageService.setProduct({ key: 'mealObj', value: newMealObj, message: 'Meal Deleted!' });
  };
}
