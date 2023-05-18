import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Navigation } from '@angular/router';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from 'projects/tools/src/lib/config.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Tools } from 'projects/tools/src/public-api';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = { username: '', password: '' };
  loading: boolean = false;
  returnUrl: string = '/';
  error: any = null;
  errorCode: string = '';

  signup_disabled: boolean = true;

  config: any;

  version: string = '0.0.1';

  _formGroup: UntypedFormGroup = new UntypedFormGroup({});

  _title: string = '';
  _logo: string = '';
  _header: string = '';

  _version: string = 'v2';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private authenticationService: AuthenticationService,
    private configService: ConfigService
  ) {
    this.config = this.configService.getConfiguration();
    const _currentNav: Navigation | null = this.router.getCurrentNavigation();
    if (_currentNav?.extras.state) {
      if (_currentNav?.extras.state.from ) {
        this.error = {
          from: _currentNav?.extras.state.from,
          message: _currentNav?.extras.state.message
        };
      }
    }

    this.configService.getConfig('app').subscribe(
      (result: any) => { /* console.log(result); */ }, 
      (err: any) => { console.error(err); }
    );
  }

  ngOnInit() {
    // reset login status
    if (this.authenticationService.isLogged()) {
      this.authenticationService.logout().subscribe(response => {
        // console.log('logout', response);
      });
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this._title = this.config.AppConfig.Layout.Login.title;
    this._logo = './assets/images/' + this.config.AppConfig.Layout.Login.logo;
    this._header = './assets/images/' + this.config.AppConfig.Layout.Login.header;

    this._initForm();

    // Clear MultiSnackbar
    Tools.MultiSnackbarDestroyAll();
  }

  get f(): { [key: string]: AbstractControl } {
    return this._formGroup.controls;
  }

  _initForm() {
    this._formGroup = new UntypedFormGroup({
      username: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
      password: new UntypedFormControl('', [Validators.required, Validators.minLength(4)])
    });
  }

  login(value: any) {
    this.loading = true;
    this.authenticationService.login(value.username, value.password)
      .subscribe(
        (response: any) => {
          if (!this.returnUrl || this.returnUrl === '/') {
            this.returnUrl = '/dashboard';
          }

          this.authenticationService.setCurrentSession(response);
          this.authenticationService.reloadSession();

          Tools.MultiSnackbarDestroyAll();
          this.router.navigate([this.returnUrl]);
          this.loading = false;
        },
        (error: any) => {
          this.error = error;
          this.errorCode = error.error.status;
          this.loading = false;
        }
      );

    // Mockup
    // const response = {
    //   principal: '<MOCKER>',
    //   roles: ['govshell_adm']
    // };
    // this.authenticationService.setCurrentSession(response);
    // this.authenticationService.reloadSession();
    // this.router.navigate(['/']);
  }

  _closeAlert() {
    this.error = null;
    this.errorCode = '';
  }
}
