# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Базовый код
### Класс Api
Защищенный класс отвечает за работу API. Имеет конструктор, методы get и post, обработчик ответа от сервера.

### Класс Component
Абстрактный класс. Используется для создания элементов интерфейса.
Содержит конструктор и ряд методов для универсальной работы с DOM -компонентами: 
- toggleClass - переключается класс,
- #setText - устанавливает текстовое содержимое,
- #setImage - устанавливает изображения и альтернативный текст,
- setDisabled - изменяет статус блокировки,
- setHidden - скрывает элемент,
- setVisible - отображает элемент,
- render - возвращает корневой DOM-элемент.

### EventEmitter
Класс - брокер событий. Содержит конструктор, а также методы:
- on - устанавливает обработчик событий;
- off - снимает обработчик событий;
- emit - инициирует событие с данными;
- onAll - слушает все события;
- offAll - сбрасывает все обработчики;
- trigger - триггер, генерирующий событие при вызове;

### Класс Model
Абстрактный класс. Используется для создания модельных данных. Содержит конструктор и метод, сообщающий, об изменениях.

## Код моделей данных
### Класс AppData 
Класс отвечает за работу с данными, обрабатывает дейсткия пользователя.Наследует класс Model для отслеживания изменений. Содержит конструктор и методы: 

constructor(data, events )
- Clear busket - отчищает иконку корзины
- ClearOrder - отчищает заказ
- updateBusket - обновление иконки корзины
- setPreview -открытие карточки продукта
- AddtoBusket -добавление в корзину карточки продукта
- RemovefromBusket - удаление из корзины карточки продукта
- setCatalog - меняет список покупок
- setPaymentMethod - меняет метод оплаты,
- setForms - проверка заполнености форм
- Validate - проверка валидации
- getTotal - итоговый счет выдает
### Класс Form
Класс для работы с формами. Наследуется от Component<T>
Содержит конструктор и методы, отвечающие за работу с валидностью и ошибками при заполнении форм.
constructor(container: HTMLElement,events: IEvents)

+ set valid
+ set error


## Код отображения
### Класс Page
Класс отвечающий за тображение страницы. Наследуется от Component<T> Имеет конструктор и методы
constructor (container: HTMLElement,events: IEvents) 

- set card catalog - отображает каталог товаров
- set count - отображает счеткик

### Класс Card
Класс отвечающий за отображение карточки продукта.Наследуется от Component<ICard> Имеет конструктор и методы:
constructor (container: HTMLElement,events)

- set/get id - управляет индификатором карточки.
- set/get title - управляет названием товара.
- set/get category - управляет категорией и ее цветом.
- set/get price - управляет ценой товара.
- set image - устанавливает изображение товара.
- set description - устанавливает описание товара.

### Класс Busket
Класс отвечающий за отображение корзины.Наследуется от Component<IBusket> Имеет конструктор и методы:
constructor (container: HTMLElement,events: IEvents) 
- set items - устанавливает товары в корзине.
- set total - устанавливает общую стоимость товаров.

### Класс Modal 
Класс отвечающий за отображение модального окна.Наследуется от Component<T> Имеет конструктор и методы:
constructor (container: HTMLElement,events: IEvents)
- content - собирает содержимое модального окна;
- open - открывает модальное окно;
- close - закрывает модальное окно;

### Класс Succsess 
Класс отвечающий за отображение успешного заказа.Наследуется от Component<T> Имеет конструктор и методы:
constructor (container: HTMLElement,events: succsess)

-settotalcount - отображает финальный счет списания

## Типы
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

## Об архитектуре 

Взаимодействия внутри приложения происходят через события. Модели инициализируют события, слушатели событий в основном коде выполняют передачу данных компонентам отображения, а также вычислениями между этой передачей, и еще они меняют значения в моделях.
 