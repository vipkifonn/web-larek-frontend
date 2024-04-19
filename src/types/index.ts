//тип для продукта
export type ProductCategory =
	| 'софт-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

//тип для оплаты
export type PaymentMethod = 'онлайн' | 'при получении';

//интерфейс для товаров
export interface IProduct {
	id: string;
	category: ProductCategory;
	title: string;
	price: number;
	description: string;
	image: string;
}
//интерфейс для списка товаров
export interface IProductList {
	item: IProduct[];
}
//интерфейс для корзины
export interface IBasket {
	item: IProduct[];
	price: number;
}
//данные пользователя
export interface IDeliveryForm {
	payment?: PaymentMethod;
	address?: string;
	email?: string;
	phone?: string;
}

//информация в корзине
export interface IOrder extends IDeliveryForm {
	total: number;
	items: string[];
}

//итоговый счет
export interface IOrderTotal {
	id: string;
	total: number;
}

//показ карточки товара
export interface ICard extends IProduct {
	index?: string;
	buttonTitle?: string;
}

//состояние приложения
export interface IAppState {
	catalog: IProduct[];
	basket: IProduct[];
	preview: string | null;
	contact: IDeliveryForm | null;
	order: IOrder | null;
}