import { Api, ApiListResponse } from "../base/api";
import { IOrderTotal, IProduct, IOrder} from "../../types";

// интерфейс для работы Api 
export interface ILarekAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderProducts: (order: IOrder) => Promise<IOrderTotal>
}


export class LarekAPI extends Api implements ILarekAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) =>
      data.items.map((item) => ({
        ...item,
        image: this.cdn + item.image
      }))
    );
  }

  getProductItem(id: string): Promise<IProduct> {
    return this.get(`/product/${id}`).then(
        (item: IProduct) => ({
            ...item,
            image: this.cdn + item.image,
        })
    );
  }

  orderProducts(order: IOrder): Promise<IOrderTotal> {
    return this.post(`/order`, order).then(
      (data: IOrderTotal) => data
    );
  }

}