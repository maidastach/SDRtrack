import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SegmentChangeEventDetail } from '@ionic/core/dist/types/interface';
import { FoodList, FoodType, Meal, MealsObj, Portion, Values } from 'src/app/Interfaces/Food.interface';
import { IonicSelectableComponent } from 'ionic-selectable';
import { FoodService } from 'src/app/Services/food/food.service';
import { StorageService } from 'src/app/Services/storage/storage.service';
import { AlertController, IonDatetime, ModalController } from '@ionic/angular';
import { DateTimeService } from 'src/app/Services/datetime/datetime.service';
import { numberValidator } from './form-validators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit
{
  @ViewChild('productComponent') productComponent: IonicSelectableComponent;
  @ViewChild(IonDatetime, { static: true }) popoverDatetime: IonDatetime;

  dateForm: string;
  todaysMaxDate: string;

  foodObject: FoodList[];
  productsList: FoodType[];

  productForm: FormGroup;
  productNameControl: FormControl;
  productCategoryControl: FormControl;
  productCarbsControl: FormControl;
  productProteinsControl: FormControl;
  productSugarsControl: FormControl;
  productFibersControl: FormControl;
  productFatsControl: FormControl;
  productCaloriesControl: FormControl;

  mealForm: FormGroup;
	mealTypes: string[] = ['Breakfast', 'Snack', 'Lunch', 'Dinner'];
  isMealSelected: boolean;
  mealSelected: string;
  meal: Meal;
  todays: MealsObj[] = [];
  values: Values;

	constructor(
    private fb: FormBuilder,
    private foodService: FoodService,
    private storageService: StorageService,
    private alertController: AlertController,
    private dateTime: DateTimeService,
    public modalController: ModalController,
    )
  { }

	async ngOnInit()
  {
    const mealObj = await this.storageService.getProduct('mealObj');
    if(mealObj)
    {
      this.foodService.mealObj.next(mealObj);
    }
    this.foodService
      .mealObj
        .subscribe(
          $mealObj =>
          {
            if($mealObj.length > 0)
            {
              this.todays = this.foodService.createDayMealObj(new Date());
              this.values = (this.todays.length > 0)
                ? this.foodService.calcValuesForDay(this.todays)
                : null;
            }
          }
        );
    this.foodService
      .foodObj
        .subscribe(
          async (foodObject: FoodList[]) =>
          {
            console.log('foodObj subscription');
            if(foodObject.length < 1)
            {
              const isThereStorage = await this.storageService.getProduct('foodObj');
              if(!isThereStorage)
              {
                console.log('there is no storage');
                this.foodService.getFood()
                  .subscribe(
                    (food: FoodList[]) =>
                    {
                      this.foodService.foodObj.next(food);
                      this.storageService.setProduct({ key: 'foodObj', value: food });
                      return;
                    }
                  );
              }
              return;
            }
            this.foodObject = foodObject;
            this.productsList = this.foodService.createProductsList();
          }
        );
  }

  async onSelectMeal(event: Event): Promise<void>
  {
    const value = (event as CustomEvent<SegmentChangeEventDetail>).detail.value;
    if(!this.foodObject || this.foodObject.length < 1)
    {
      this.foodService
        .foodObj
          .next(await this.storageService.getProduct('foodObj'));
    }

    this.mealForm = this.fb.group(
      {
        food: ['', Validators.required],
        grams: ['', [Validators.required, numberValidator]],
      }
    );
    this.isMealSelected = true;
    this.mealSelected = value;
  }

  onAddProduct(event: { component: IonicSelectableComponent }): void
  {
    //Create frorm
    this.createAddSaveForm();

    // Clean form.
    this.productForm.reset();

    // Copy search text to food name field
    this.productNameControl.setValue(event.component.searchText);

    // Show form.
    event.component.showAddItemTemplate();
  }

  onSaveProduct(event: { component: IonicSelectableComponent; item: FoodType }): void
  {
    //Create frorm
    this.createAddSaveForm(event.item);

    // Show form.
    event.component.showAddItemTemplate();
  }

  async onDeleteProduct(event: { component: IonicSelectableComponent; item: FoodType }): Promise<void>
  {
    const alert = await this.alertController.create(
      {
        header: 'Confirm!',
        message: `Delete ${event.item.name}?`,
        buttons: [
          {
            text: 'Back',
            role: 'cancel',
            id: 'cancel-button',
            // eslint-disable-next-line arrow-body-style
            handler: () => {
              return;
            }
          },
          {
            text: 'Delete',
            id: 'confirm-button',
            handler: async () => {
              // Show loading while product is being deleted from storage.
              event.component.showLoading();

              // Delete product from storage.
              await this.foodService.deleteProduct(event.item);

              //Reset search field
              this.productComponent.search('');
              event.component.hideLoading();
            }
          }
        ]
      }
    );
    await alert.present();
  }

  async addProduct()
  {
    const adder = async () =>
    {
      // Create product.
      const product: FoodType = {
        ...this.productForm.value,
        _id: (Math.random() * 100000).toString(), //TODO
        category: this.productCategoryControl.value.category,
      };

      this.productComponent.showLoading();

      // Add product to storage.
      await this.foodService.addProduct(product);

      // Clean form.
      this.productForm.reset();

      this.productComponent.hideLoading();
      this.productComponent.search(product.name);
      this.productComponent.hideAddItemTemplate();
    };
    const alert = await this.alertController.create(
      {
        header: 'Confirm!',
        message: `Add ${this.productNameControl.value}?`,
        buttons: [
          {
            text: 'Back',
            role: 'cancel',
            id: 'cancel-button',
            // eslint-disable-next-line arrow-body-style
            handler: () => {
              return;
            }
          },
          {
            text: 'Add',
            id: 'confirm-button',
            handler: async () => await adder()
          }
        ]
      }
    );
    await alert.present();
  }

  async saveProduct(product: FoodType) {
    // Show loading while product is being saved to storage.
    this.productComponent.showLoading();

    const editedProduct: FoodType =
    {
      ...this.productForm.value,
      // eslint-disable-next-line no-underscore-dangle
      _id: product._id,
      category: this.productCategoryControl.value.category
    };

    await this.foodService.editProduct(editedProduct);

    this.productComponent.hideAddItemTemplate();

    // Hide loading.
    this.productComponent.hideLoading();
  };

  addPortion(): void
  {
    if(!this.meal?.portions)
      // eslint-disable-next-line curly
      this.meal = { portions: [ { ...this.mealForm.value, _id: '0' } ] };
    else
      // eslint-disable-next-line curly
      this.meal.portions.push({ ...this.mealForm.value, _id: (Math.random() * 10000).toString() });
    if(!this.todaysMaxDate)
    {
      this.todaysMaxDate = this.dateTime.todayISO();
    }
    this.mealForm.reset();
  }

  async addMeal(): Promise<void>
  {
    const portions: Portion[] = this.foodService.calcValuesForPortion(this.meal);
    const formatDate = this.dateForm.includes('PM') ? this.dateForm.replace('PM', ' PM') : this.dateForm.replace('AM', ' AM');
    this.meal = {
      _id: (Math.random() * 10000).toString(),
      name: this.mealSelected,
      date: this.dateForm,
      createdOn: new Date(formatDate),
      portions
    };

    const values: Values = this.foodService.calcValuesForEachMeal(this.meal);
    this.meal = {...this.meal, ...values };
    const mealObj = this.foodService.mealObj;
    // eslint-disable-next-line no-underscore-dangle
    const _id = (() =>
      {
        switch(this.mealSelected)
        {
          case 'Breakfast':
            return '0';
          case 'Snack':
            return '1';
          case 'Lunch':
            return '2';
          default:
            return '3';
        }
      }
    )();
    const message = 'Meal Added!';

    if(mealObj.value.length < 1)
    {
      await this.storageService.setProduct(
        {
          key: 'mealObj',
          value: [ { _id, name: this.mealSelected, meals: [ this.meal ] } ],
          message
        }
      );
      mealObj.next([ { _id: '0', name: this.mealSelected, meals: [ this.meal ] } ]);
    }
    else
    {
      const isMealPresent = mealObj.value.find($mealObj => $mealObj.name === this.mealSelected);
      if(isMealPresent)
      {
        const mappedMeal = mealObj.value.map(
          $mealObj =>
          {
            if($mealObj.name === this.mealSelected)
            {
              $mealObj.meals.push(this.meal);
            }
            return $mealObj;
          }
        );
        await this.storageService.setProduct(
          {
            key: 'mealObj',
            value: mappedMeal,
            message
          }
        );
        mealObj.next(mappedMeal);
      }
      else
      {
        await this.storageService.setProduct(
          {
            key: 'mealObj',
            value: [
              ...mealObj.value,
              { _id, name: this.mealSelected, meals: [ this.meal ] }
            ],
            message
          }
        );
        mealObj.next([
          ...mealObj.value,
          { _id, name: this.mealSelected, meals: [ this.meal ] }
        ]);
      }
    }
    this.isMealSelected = false;
    this.meal = null;
    this.mealSelected = '';
    this.dateForm = '';
  }

  async changeMeal()
  {
    if(this.meal)
    {
      const alert = await this.alertController.create(
        {
          cssClass: 'my-custom-class',
          header: 'Are you sure?',
          message: 'You will lose the data saved for the current meal',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },{
              text: 'Confirm',
              handler: () => {
                this.meal = null;
                this.mealSelected = '';
                this.isMealSelected = false;
                this.dateForm = '';
              }
            }
          ]
        }
      );
      await alert.present();
    }
    else
    {
      this.meal = null;
      this.mealSelected = '';
      this.isMealSelected = false;
      this.dateForm = '';
    }
  }

  createAddSaveForm(item?: FoodType): void
  {
    // Create product form that will be used to add or save product.
    this.productNameControl = this.fb.control(item?.name || null, Validators.required);
    this.productCategoryControl = this.fb.control(null, Validators.required);
    this.productCaloriesControl = this.fb.control(item?.calories || null, [Validators.required, Validators.max(1000), numberValidator]);
    this.productCarbsControl = this.fb.control(item?.carbs || null, [Validators.required, Validators.max(100), numberValidator]);
    this.productProteinsControl = this.fb.control(item?.proteins || null, [Validators.required, Validators.max(100), numberValidator]);
    this.productFatsControl = this.fb.control(item?.fats || null, [Validators.required, Validators.max(100), numberValidator]);
    this.productFibersControl = this.fb.control(item?.fibers || null, [Validators.required, Validators.max(100), numberValidator]);
    this.productSugarsControl = this.fb.control(item?.sugars || null, [Validators.required, Validators.max(100), numberValidator]);
    this.productForm = this.fb.group(
      {
        name: this.productNameControl,
        category: this.productCategoryControl,
        calories: this.productCaloriesControl,
        carbs: this.productCarbsControl,
        proteins: this.productProteinsControl,
        fats: this.productFatsControl,
        sugars: this.productSugarsControl,
        fibers: this.productFibersControl,
      }
    );
  }


  onDateChange(element: IonDatetime)
  {
    this.dateForm = this.dateTime.parseIsoToString(element.value);
  }

  deletePortion(id: string)
  {
    // eslint-disable-next-line no-underscore-dangle
    this.meal.portions = this.meal.portions.filter(portion => portion._id !== id);
    if(this.meal.portions.length < 1)
    {
      this.meal = null;
      this.dateForm = '';
    }
  }

  onOpenSearchModal(event: any) {
    console.log(event);
  }
}
