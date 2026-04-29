import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiNativeSelect } from '@taiga-ui/kit';

@Component({
  selector: 'app-formly-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, TuiTextfield],
  template: `
    <tui-textfield class="full-width" [class.no-border]="props['noBorder']">
      <input
        tuiTextfield
        [formControl]="formControl"
        [formlyAttributes]="field"
        [attr.placeholder]="props.placeholder || null"
        [attr.inputmode]="props['inputmode'] || null"
        [attr.maxlength]="props['maxLength'] || null">
    </tui-textfield>
  `
})
export class CondorFormlyTextFieldComponent extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'app-formly-date-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <input
      type="date"
      class="native-input"
      [formControl]="formControl"
      [formlyAttributes]="field">
  `
})
export class CondorFormlyDateFieldComponent extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'app-formly-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, TuiTextfield, TuiNativeSelect],
  template: `
    <tui-textfield class="full-width select-field" [class.no-border]="props['noBorder']">
      <select tuiSelect [formControl]="formControl" [formlyAttributes]="field">
        <option value="" disabled>{{ props.placeholder || '-- Select --' }}</option>
        <option *ngFor="let option of selectOptions" [value]="optionValue(option)">
          {{ optionLabel(option) }}
        </option>
      </select>
    </tui-textfield>
  `
})
export class CondorFormlySelectFieldComponent extends FieldType<FieldTypeConfig> {
  get selectOptions(): unknown[] {
    return Array.isArray(this.props.options) ? this.props.options : [];
  }

  optionValue(option: unknown): string {
    return typeof option === 'string'
      ? option
      : ((option as { value?: string })?.value || '');
  }

  optionLabel(option: unknown): string {
    return typeof option === 'string'
      ? option
      : ((option as { label?: string; value?: string })?.label || (option as { value?: string })?.value || '');
  }
}

@Component({
  selector: 'app-formly-textarea-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <textarea
      class="textarea-input"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [attr.placeholder]="props.placeholder || null"
      [attr.rows]="props['rows'] || null"></textarea>
  `
})
export class CondorFormlyTextareaFieldComponent extends FieldType<FieldTypeConfig> {}
