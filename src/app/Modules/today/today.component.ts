import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, SegmentChangeEventDetail } from '@ionic/angular';
import { MealsObj, Portion, Values } from 'src/app/Interfaces/Food.interface';
import { FoodService } from 'src/app/Services/food/food.service';
import { StorageService } from 'src/app/Services/storage/storage.service';
import { PortionsModalPage } from './portions-modal/portions-modal.page';

@Component({
  selector: 'app-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
})
export class TodayComponent implements OnInit
{
  todays: MealsObj[] = [];
  todaysFiltered: MealsObj[];
  values: Values;
  selectedMeal: string;

  constructor(private foodService: FoodService,
    private storageService: StorageService,
    private modalController: ModalController,
    private alertController: AlertController,
    ) { }

  async ngOnInit()
  {
    const mealObj = await this.storageService.getProduct('mealObj');
    if(mealObj)
    {
      this.foodService.mealObj.next(mealObj);
    }
    this.foodService.mealObj.subscribe(
      $mealObj =>
      {
        this.todays = this.foodService.createDayMealObj(new Date());
        this.todaysFiltered = this.todays;
        this.values = (this.todays.length > 0)
          ? this.foodService.calcValuesForDay(this.todays)
          : null;
      }
    );
  }

  calcValuesByMealName(mealName: string): string
  {
    const meals: MealsObj = this.todays.find(eachMealObj => eachMealObj.name === mealName);
    let calories = '0';
    meals.meals.forEach(
      meal =>
      {
        calories = (parseFloat(calories) + parseFloat(meal.calories)).toFixed(2);
      }
    );
    return calories;
  }

  filterMealView(event: Event): void
  {
    if(this.todays.length > 0)
    {
      const value: string = (event as CustomEvent<SegmentChangeEventDetail>).detail.value;
      if(value === 'Day')
      {
        //this.values = this.foodService.calcValuesForDay(this.todays);
        this.selectedMeal = null;
        this.todaysFiltered = this.todays;
        return;
      }
      this.selectedMeal = value;
      const meals: MealsObj = this.todays.find(eachMealObj => eachMealObj.name === value);
      if(!meals)
      {
        //this.values = null;
        this.todaysFiltered = [];
        return;
      }
      // const values: Values = {
      //   calories: '0',
      //   carbs: '0',
      //   sugars: '0',
      //   proteins: '0',
      //   fats: '0',
      //   fibers: '0',
      // };
      // meals.meals.forEach(
      //   meal =>
      //   {
      //     values.calories = (parseFloat(values.calories) + parseFloat(meal.calories)).toFixed(2);
      //     values.carbs = (parseFloat(values.carbs) + parseFloat(meal.carbs)).toFixed(2);
      //     values.sugars = (parseFloat(values.sugars) + parseFloat(meal.sugars)).toFixed(2);
      //     values.proteins = (parseFloat(values.proteins) + parseFloat(meal.proteins)).toFixed(2);
      //     values.fats = (parseFloat(values.fats) + parseFloat(meal.fats)).toFixed(2);
      //     values.fibers = (parseFloat(values.fibers) + parseFloat(meal.fibers)).toFixed(2);
      //   }
      // );
      // this.values = values;
      this.filterTodays(value);
      return;
    }
  }

  filterTodays(mealName: string): void
  {
    this.todaysFiltered = this.todays.filter(eachMealObj => eachMealObj.name === mealName);
  }

  deletePortion(mealName: string, id: string)
  {
    this.foodService.deletePortion(mealName, id);
  }

  openModal(portions: Portion[])
  {
    this.foodService.openModal(portions);
  }

}
