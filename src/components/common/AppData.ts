import { Model } from '../base/model';
import {
	IProduct,
	IOrder,
	IDeliveryForm,
	IAppState,
	FormErrors,
	PaymentMethod,
} from '../../types';
import { IEvents } from '../base/events';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class Product extends Model<IProduct> {
	id: string;
	title: string;
	price: number | null;
	description: string;
	category: string;
	image: string;
}

export class AppState extends Model<IAppState> {
	catalog: Product[];
	basket: Product[];
	order: IOrder;
	preview: string | null;
	formErrors: FormErrors = {};

	constructor(data: Partial<IAppState>, protected events: IEvents) {
		super(data, events);
		this.clearOrder();
		this.basket = [];
	}


//меняет список кпокупок
	setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}
// предпросмотр карточки товара
	setPreview(item: Product) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

//выбор метода оплаты
	setPaymentMethod(method: string): void {
		this.order.payment = method as PaymentMethod;
		this.validateDelivery();
	}
//итоговый счет
	getTotal(): number {
		return this.basket.reduce((total, item) => total + item.price,0);
	}
//отчистить заказ
	clearOrder() {
			this.order = {
				payment: 'online',
				address: '',
				email: '',
				phone: '',
				total: 0,
				items: [],
			};
		}
//манипуляции с корзиной	
	addToBasket(item: Product) {
			if (this.basket.indexOf(item) <= 0) {
				this.basket.push(item);
				this.updateBasket();
			}
		}

	removeFromBasket(item: Product) {
		this.basket = this.basket.filter((it) => it != item);
		this.updateBasket();
	}

	updateBasket() {
		this.emitChanges('counter:changed', this.basket);
		this.emitChanges('basket:changed', this.basket);
	}

	clearBasket() {
		this.basket = [];
		this.updateBasket();
	}
//проверка заполнености формы
	setContactForm(field: keyof IDeliveryForm, value: string) {
		this.order[field] = value;
		if (this.validateContact()) {
			this.events.emit('contact:ready', this.order);
		}
	}
	
	setDeliveryForm(field: keyof IDeliveryForm, value: string) {
		this.order[field] = value;
		if (this.validateDelivery()) {
			this.events.emit('delivery:ready', this.order);
		}
	}
//валидация форм адреса и контактов
	validateDelivery() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContact() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}