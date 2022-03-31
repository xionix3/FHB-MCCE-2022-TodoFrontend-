import { Component, OnInit, ViewChildren, QueryList} from '@angular/core';
import { TodoItem } from 'src/app/interfaces/todo-item/todo-item';
import { TodoService } from 'src/app/services/todo/todo.service';
import {MatDialog} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TODOS } from 'src/app/services/mock/mock-todo-item';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})

export class TodoListComponent implements OnInit {

  items: TodoItem[] = [];
  @ViewChildren('itemComponent') itemComponents!: QueryList<TodoItemComponent>;

  constructor(
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.todoService.itemsObserver.subscribe((items) => {
      this.items = items.sort((a, b) => new Date (a.created).getTime() - new Date (b.created).getTime());
    });
    
    this.showSnackBar("Fetching Items...");
    this.todoService.fetchItems()
      .then(() => this.showSnackBar("Items successfully fetched!", "success"))
      .catch(() => {
        this.items = TODOS;
        this.showSnackBar("Error during fetching of items! Using mock data as fallback. Check error message for more details...", "error")
      });
  }

  addItem (): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        newItem: true,
        item: this.todoService.getNewItem()
      }
    });

    // subscribe to observable of dialog to update item in case the user hits save
    dialogRef.afterClosed().subscribe(item => {
      if (item) {
        this.showSnackBar("Creating Item...");
        this.todoService.putItem(item)
          .then(() => { 
            this.showSnackBar("Item successfully added!", "success");

            let changeSubscription = this.itemComponents.changes.subscribe((items) => {
              let addedItemEle = items.toArray().pop().todoItemContainer.nativeElement;
              addedItemEle.scrollIntoView();
              changeSubscription.unsubscribe();
            });
          })
          .catch(() => this.showSnackBar("Error during the creation of the todo! Check error message for more details...", "error"));
      }
    });
  }

  showSnackBar(message: string, panelClass: string = "info") {
    this.snackBar.open(message, undefined, { duration: 5000, panelClass: [panelClass], verticalPosition: "bottom" });
  }
}
