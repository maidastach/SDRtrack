import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonDatetime, ModalController } from '@ionic/angular';
import { MealsObj, Portion } from 'src/app/Interfaces/Food.interface';
import { DateTimeService } from 'src/app/Services/datetime/datetime.service';
import { FoodService } from 'src/app/Services/food/food.service';
import { StorageService } from 'src/app/Services/storage/storage.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit
{
  @ViewChild('dateRangeModal') dateRangeModal: ModalController;
  mealObj: MealsObj[];
  filteredMealObj: MealsObj[];
  todaysMaxDate: string;
  isFilterOn: boolean;
  startDate: string;
  endDate: string;

  constructor(private foodService: FoodService, private dateTime: DateTimeService, private storageService: StorageService,
    private actionSheetController: ActionSheetController) { }

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
        // eslint-disable-next-line no-underscore-dangle
        this.mealObj = $mealObj.sort((a, b) => parseInt(a._id, 10) - parseInt(b._id, 10));;
        this.filteredMealObj = this.mealObj;
      }
    );
    this.todaysMaxDate = this.dateTime.todayISO();
  }

  deletePortion(mealName: string, id: string)
  {
    this.foodService.deletePortion(mealName, id);
  }

  openModal(portions: Portion[])
  {
    this.foodService.openModal(portions);
  }

  filterByDay(element: IonDatetime)
  {
    this.isFilterOn = true;
    this.filteredMealObj = this.foodService.createDayMealObj(new Date(element.value));
  }

  async onClickMeal()
  {
    const actionSheet = await this.actionSheetController.create(
      {
        header: 'Which Meal?',
        buttons: [
          {
            text: 'Breakfast',
            icon: 'trash',
            handler: () => this.filterByMeal('Breakfast')
          },
          {
            text: 'Snack',
            icon: 'share',
            handler: () => this.filterByMeal('Snack')
          },
          {
            text: 'Lunch',
            icon: 'caret-forward-circle',
            handler: () => this.filterByMeal('Lunch')
          },
          {
            text: 'Dinner',
            icon: 'heart',
            handler: () => this.filterByMeal('Dinner')
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
          }
        ]
      }
    );
    await actionSheet.present();
  }

  filterByMeal(mealName: string)
  {
    this.isFilterOn = true;
    this.filteredMealObj = this.foodService.createByMealObj(mealName);
  }

  dismissRange()
  {
    this.startDate = null;
    this.endDate = null;
    this.dateRangeModal.dismiss();
  }

  filterByRange()
  {
    this.isFilterOn = true;
    const start = new Date(this.startDate.split('T')[0] + ' 00:00');
    const end = new Date(this.endDate.split('T')[0] + ' 23:59');
    this.filteredMealObj = this.foodService.createDateRangeMealObj(start, end);
    this.startDate = null;
    this.endDate = null;
    this.dateRangeModal.dismiss();
  }

  removeFiter(): void
  {
    this.isFilterOn = false;
    this.filteredMealObj = this.mealObj;
  }

}
