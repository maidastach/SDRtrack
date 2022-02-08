export interface FoodType {
    _id?: string;
    name: string;
    category: string;
    calories: string;
    carbs: string;
    proteins: string;
    fats: string;
    fibers: string;
    sugars: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface FoodList {
    _id?: string;
    category: string;
    products: FoodType[];
}

export interface Portion {
    _id: string;
    food: FoodType;
    grams: string;
    calories: string;
    carbs: string;
    proteins: string;
    fats: string;
    fibers: string;
    sugars: string;
}

export interface Meal {
    _id?: string;
    name?: string;
    date?: string;
    portions?: Portion[];
    calories?: string;
    carbs?: string;
    proteins?: string;
    fats?: string;
    fibers?: string;
    sugars?: string;
    createdOn?: Date;
}

export interface MealsObj {
    _id: string;
    name: string;
    meals: Meal[];
}

export interface Values {
    calories?: string;
    carbs?: string;
    proteins?: string;
    fats?: string;
    fibers?: string;
    sugars?: string;
}
