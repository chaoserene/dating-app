import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    @Output() cancelRegister = new EventEmitter();
    registerForm: FormGroup;
    maxDate: Date;
    validationError: string[] = [];

  constructor(private accountService: AccountService, private toastr: ToastrService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
      this.initializeForm()
      this.maxDate = new Date();
      this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  register() {
      this.accountService.register(this.registerForm.value).subscribe( response => {
          this.router.navigateByUrl('/members');
          this.cancel();
      }, error => {
          console.log(error);
          this.validationError = error;
      })
  }

  cancel() {
      this.cancelRegister.emit(false);
  }

  initializeForm() {
      this.registerForm = this.fb.group({
          gender: ['male'],
          username: ['', Validators.required],
          knownAs: ['', Validators.required],
          dateOfBirth: ['', Validators.required],
          city: ['', Validators.required],
          country: ['', Validators.required],
          password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
          confirmPassword: ['', [Validators.required, this.matchValue('password')]]
      });
  }

  matchValue(machTo: string): ValidatorFn {
      return (control: AbstractControl) => {
        return control?.value === control?.parent?.controls[machTo].value ? null : {isMatching: true}
      };
  }

}
