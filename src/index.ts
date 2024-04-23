import './scss/styles.scss';

import { LarekAPI } from './components/common/GlobalApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import {AppState, CatalogChangeEvent,Product} from './components/common/AppData';
import { Page } from './components/common/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { IDeliveryForm, IOrder } from './types';
import { Card } from './components/common/Cards';
import { Basket } from './components/common/Basket';
import { DeliveryForm, ContactForm } from './components/common/DeliveryForm';
import { Success } from './components/common/SuccsessForm';

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const deliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const delivery = new DeliveryForm(cloneTemplate(deliveryTemplate), events, {
	onClick: (ev: Event) => events.emit('payment:toggle', ev.target),
});
const contacts = new ContactForm(cloneTemplate(contactTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Получение списка продуктов при окрытие страницы
api
	.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.log(err);
	});

// Обновления каталога
events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});

// Открытие товара
events.on('card:select', (item: Product) => {
	appData.setPreview(item);
});

events.on('preview:changed', (item: Product) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('product:toggle', item);
			card.buttonTitle =
				appData.basket.indexOf(item) < 0 ? 'Купить' : 'Удалить из корзины';
		},
	});
	modal.render({
		content: card.render({
			title: item.title,
			description: item.description,
			image: item.image,
			price: item.price,
			category: item.category,
			buttonTitle:
				appData.basket.indexOf(item) < 0 ? 'Купить' : 'Удалить из корзины',
		}),
	});
});

// работа с товаром
events.on('product:toggle', (item: Product) => {
	if (appData.basket.indexOf(item) < 0) {
		events.emit('product:add', item);
	} else {
		events.emit('product:delete', item);
	}
});
//добавить в корзину
events.on('product:add', (item: Product) => {
	appData.addToBasket(item);
});
// удалить из корзины
events.on('product:delete', (item: Product) => appData.removeFromBasket(item));
// работа с корзиной
events.on('basket:changed', (items: Product[]) => {
	basket.items = items.map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('product:delete', item);
			},
		});
		return card.render({
			index: (index + 1).toString(),
			title: item.title,
			price: item.price,
		});
	});
	const newtotal = appData.getTotal();
	basket.total = newtotal;
	appData.order.total = newtotal;
	basket.toggleButton(newtotal === 0);
});

events.on('counter:changed', (item: string[]) => {
	page.counter = appData.basket.length;
});

// Открытие корзины
events.on('basket:open', () => {
	modal.render({
		content: basket.render({}),
	});
});

//Открытие формы доставки
events.on('order:open', () => {
	modal.render({
		content: delivery.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
	appData.order.items = appData.basket.map((item) => item.id);
});

// Смена способа оплаты заказа
events.on('payment:toggle', (target: HTMLElement) => {
	delivery.toggleButtons(target);
	appData.setPaymentMethod(target.getAttribute('name'));
});

// Изменение валидации
events.on('formErrors:change', (errors: Partial<IOrder>) => {
	const { payment, address, email, phone } = errors;
	delivery.valid = !payment && !address;
	contacts.valid = !email && !phone;
	delivery.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменение первой формы (доставка)
events.on(
	/^order\..*:change/,
	(data: { field: keyof IDeliveryForm; value: string }) => {
		appData.setDeliveryForm(data.field, data.value);
	}
);

// Изменение второй формы(контакты)
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IDeliveryForm; value: string }) => {
		appData.setContactForm(data.field, data.value);
	}
);

// Заполнили форму доставки
events.on('delivery:ready', () => {
	delivery.valid = true;
});

// Заоплнили форму контактов
events.on('contact:ready', () => {
	contacts.valid = true;
});

// Переход к форме контактов
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

// Оформление заказа (финальное окно)
events.on('contacts:submit', () => {
	api
		.orderProducts(appData.order)
		.then((result) => {
			appData.clearBasket();
			appData.clearOrder();
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});

			success.total = result.total.toString();
			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Модальное окно открыто
events.on('modal:open', () => {
	page.locked = true;
});

// Модальное окно закрыто
events.on('modal:close', () => {
	page.locked = false;
});