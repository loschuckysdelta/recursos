import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { KeyFilterModule } from 'primeng/keyfilter';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@NgModule({
  exports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    TableModule,
    CheckboxModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    KeyFilterModule,
    ProgressSpinnerModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
})
export class PrimeNGModule {}
