import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  isDate?: boolean;
  isCurrency?: boolean;
  isSelect?: boolean;
  customClass?: string;
}

export interface TableActionsConfig {
  edit?: boolean;
  delete?: boolean;
  view?: boolean;
}

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css'],
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    NgIf,
    NgForOf,
    NgClass
  ]
})
export class GenericTableComponent  implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actionsConfig: TableActionsConfig = { edit: false, delete: false, view: false }
  @Input() isLoading: boolean = false;

  @Output() editClicked = new EventEmitter<any>();
  @Output() deleteClicked = new EventEmitter<any>();
  @Output() viewClicked = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {}

  /**
   * Obtiene el valor de una celda en una fila dada.
   * @param row
   * @param columnKey
   */
  getCellValue(row: any, columnKey: string): any {
    return columnKey.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : '', row);
  }

  /**
   * Maneja el evento de edición de una fila.
   * @param item
   */
  onEdit(item: any): void {
    this.editClicked.emit(item);
  }

  /**
   * Maneja el evento de eliminación de una fila.
   * @param item
   */
  onDelete(item: any): void {
    this.deleteClicked.emit(item);
  }

  /**
   * Maneja el evento de visualización de una fila.
   * @param item
   */
  onView(item: any): void {
    this.viewClicked.emit(item);
  }

  /**
   * Determina si la columna de acciones debe mostrarse.
   */
  // Determina si la columna de acciones debe mostrarse
  showActionsColumn(): boolean {
    return !!(this.actionsConfig.edit || this.actionsConfig.delete || this.actionsConfig.view);
  }
}
