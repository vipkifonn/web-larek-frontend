import { Form } from '../common/Form';
import { IDeliveryForm, IActions } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class DeliveryForm extends Form<IDeliveryForm> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;
	_address: HTMLInputElement

	constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
		super(container, events);

		this._cardButton = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.container
		);
		this._cashButton = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.container
		);
		this.toggleClass(this._cardButton,'button_alt-active');

		if (actions?.onClick) {
			this._cardButton.addEventListener('click', actions.onClick);
			this._cashButton.addEventListener('click', actions.onClick);
		}
		this._address = this.container.elements.namedItem('address') as HTMLInputElement
	}

	toggleButtons(target: HTMLElement) {
		this.toggleClass(this._cardButton,'button_alt-active')
		this.toggleClass(this._cashButton,'button_alt-active')
	}

	set address(value: string) {
		this._address.value = value;
	}
}

export class ContactForm extends Form<IDeliveryForm> {
	_phone: HTMLInputElement
	_email: HTMLInputElement
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._phone = this.container.elements.namedItem('phone') as HTMLInputElement
		this._email = this.container.elements.namedItem('email') as HTMLInputElement
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	set email(value: string) {
		this._email.value = value;
	}
}