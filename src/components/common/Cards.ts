import { Component } from "../base/component";
import { ICard, IActions, ProductCategory} from "../../types";
import { ensureElement } from "../../utils/utils";

export class Card extends Component<ICard> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _button?: HTMLButtonElement;
  protected _description?: HTMLElement;
  protected _category?: HTMLElement;
  protected _index?: HTMLElement;
  protected _buttonTitle: string;

  constructor(container: HTMLElement, actions?: IActions) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._image = container.querySelector('.card__image');
    this._button = container.querySelector('.card__button');
    this._description = container.querySelector('.card__text');
    this._category = container.querySelector('.card__category');
    this._index = container.querySelector('.basket__item-index');

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
  }

  disablePriceButton(value: number | null) {
    if (!value) {
      if (this._button) {
        this._button.disabled = true;
      }
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  get title(): string {
    return this._title.textContent || '';
  }

  set price(value: number | null) {
    this.setText(this._price, (value) ? `${value.toString()} синапсов` : '');
    this.disablePriceButton(value);
  }

  get price(): number {
    return Number(this._price.textContent || '');
  }

  private categoryMap: Record<string, string> = {
    'софт-скил': '_soft',
    'другое': '_other',
    'дополнительное': '_additional',
    'кнопка': '_button',
    'хард-скил': '_hard',
  };

  set category(value: string) {
    this.setText(this._category, value);

    const baseClass = this._category.classList[0];
    this._category.className = '';
    this._category.classList.add(`${baseClass}`);
    this._category.classList.add(`${baseClass}${this.categoryMap[value]}`);
  }

  get category(): string {
    return this._category.textContent || '';
  }

  set index(value: string) {
    this._index.textContent = value;
  }

  get index(): string {
    return this._index.textContent || '';
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title)
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  set buttonTitle(value: string) {
    if (this._button) {
      this._button.textContent = value;
    }
  }
}