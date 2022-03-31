import { Injectable } from '@angular/core';
import { TodoItem } from "src/app/interfaces/todo-item/todo-item";
import { TodoItemState } from 'src/app/interfaces/todo-item/todo-item-state';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data/data.service';
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  itemsObserver: BehaviorSubject<TodoItem[]> = new BehaviorSubject(<TodoItem[]>[]);

  constructor(private dataservice: DataService) {}

  fetchItems() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let payload = await this.dataservice.getTodoItems();
        this.itemsObserver.next(payload.Items);
        resolve()
      }
      catch(err) {
        reject(err);
      }
    });
  }

  async putItem(updatedItem: TodoItem) {
    await this.dataservice.updateTodoItem(updatedItem);
    return await this.fetchItems();
  }

  getNewItem() {
    let item: TodoItem = {
      id: uuidv4(),
      name: "New Todo",
      description: "Description of the Todo",
      created: new Date().toUTCString(),
      state: TodoItemState.Open,
    }

    return item;
  }

  async deleteItem(deleteItem: TodoItem) {
    await this.dataservice.deleteTodoItem(deleteItem);
    return await this.fetchItems();
  }

  getItemIndexById(id: string): number {
    return this.itemsObserver.value.findIndex(item => item.id == id);
  }
}
