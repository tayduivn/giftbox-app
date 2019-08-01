app.controller("LoginCtrl", function ($scope,
                                      $rootScope,
                                      $http,
                                      httpService,
                                      $cordovaDevice,
                                      $cordovaCamera,
                                      $ionicLoading,
                                      $ionicPopup,
                                      $ionicHistory,
                                      $ionicPlatform,
                                      $state,
                                      $timeout) {

    var login_redirect_location = '';
    $scope.isConfirmSavePic = false;
    user_meta['u_profile_pic'] = user_meta['u_profile_pic'] == false || user_meta['u_profile_pic'] == null || user_meta['u_profile_pic'] == undefined ? '' : user_meta['u_profile_pic'];
    $scope.default_register_fields = JSON.parse(default_register_fields)[0];
    var translate_login_status = function(status_code)
    {
      if(status_code=="expired")
        return $scope.alert_login_failed_expired;
      else if (status_code == 'cp_expired')
        return $scope.alert_login_failed_cp_expired;
      else if(status_code=="unapproved")
        return $scope.alert_login_failed_unapproved;
      else if(status_code=="bound_device")
        return $scope.alert_login_failed_bound_device;
      else if(status_code=="wrong_email_password")
        return $scope.alert_login_failed_wrong_email_password;
      else if(status_code=="exception")
        return $scope.alert_login_failed_wrong_email_password;
      else if(status_code=="success")
        return $scope.alert_login_success;
      else if (status_code=='empty')
        return login_mode == 'username' ? $scope.alert_login_failed_requirement_username : $scope.alert_login_failed_requirement_email;
      else if (status_code=='unverified_account')
        return $scope.alert_login_failed_verify;

      console.log("***********************");
      console.log(status_code);
      console.log("***********************");

      return status_code;
    };

    var loadCustomText = function () {
        // default menu text
        $scope.button_text_login = getMenuText(ui_texts_login.button_text_login, "Log in");
        $scope.button_text_register = getMenuText(ui_texts_login.button_text_register, "Register");
        $scope.button_text_logout = getMenuText(default_menu_titles.logout, "Log Out");
        $scope.button_text_edit_profile = getMenuText(default_menu_titles.edit_profile, "Edit Profile");
        $scope.button_text_change_password = getMenuText(ui_texts_settings.text_change_password_title, "Change Password");
        $scope.button_text_top_up = getMenuText(default_menu_titles.top_up, "Top Up");
        $scope.ui_text_or = getMenuText(default_menu_titles.ui_text_or, "or");
        $scope.ui_text_forgot_password = getMenuText(default_menu_titles.ui_text_forgot_password, "Forgot Password?");
        $scope.ui_text_click_here = getMenuText(default_menu_titles.ui_text_click_here, "Click Here");
        $scope.summernote_text_login_instruction = getMenuText(ui_texts_login.summernote_text_login_instruction, "");

        var default_username_title = $scope.default_register_fields == false || $scope.default_register_fields == undefined || $scope.default_register_fields.username == null || $scope.default_register_fields.username.field_name == null ? "Username" : $scope.default_register_fields.username.field_name;
        var default_email_title = $scope.default_register_fields == false || $scope.default_register_fields == undefined || $scope.default_register_fields.email == null || $scope.default_register_fields.email.field_name == null ? "Email" : $scope.default_register_fields.email.field_name;
        var default_password_title = $scope.default_register_fields == false || $scope.default_register_fields == undefined || $scope.default_register_fields.password == null || $scope.default_register_fields.password.field_name == null ? "Password" : $scope.default_register_fields.password.field_name;

        $scope.ui_text_username = getMenuText(ui_texts_login.ui_text_username, default_username_title);
        $scope.ui_text_email = getMenuText(ui_texts_login.ui_text_email, default_email_title);
        $scope.ui_text_password = getMenuText(ui_texts_login.ui_text_password, default_password_title);

        $scope.alert_login_failed_requirement_email = getMenuText(ui_texts_login.login_requirement_email, "Email and password must be filled.");
        $scope.alert_login_failed_requirement_username = getMenuText(ui_texts_login.alert_login_failed_requirement_username, "Username and password must be filled.");

        $scope.alert_login_title = getMenuText(ui_texts_login.alert_login_title, "Login");
        $scope.alert_login_failed_connection = getMenuText(ui_texts_login.alert_login_failed_connection, "Login Failed. Please check your internet connection and try again.");
        $scope.alert_login_failed_verify = getMenuText(ui_texts_login.alert_login_failed_verify, "Login Failed. Please verify your email account to login.");
        $scope.alert_logout_confirm_title = getMenuText(ui_texts_login.alert_logout_confirm_title, "Logout");
        $scope.alert_logout_confirm_content = getMenuText(ui_texts_login.alert_logout_confirm_content, "Are you sure you want to logout?");
        $scope.alert_logout_confirm_button_ok = getMenuText(ui_texts_login.alert_logout_confirm_button_ok, "OK");
        $scope.alert_logout_confirm_button_cancel = getMenuText(ui_texts_login.alert_logout_confirm_button_cancel, "Cancel");

        $scope.alert_change_picture_success_title = getMenuText(ui_texts_profile.alert_change_picture_success_title, "Success");
        $scope.alert_change_picture_success_content = getMenuText(ui_texts_profile.alert_change_picture_success_content, "Successfully saved picture!");
        $scope.alert_change_picture_failed_title = getMenuText(ui_texts_profile.alert_change_picture_failed_title, "Failed");
        $scope.alert_change_picture_failed_content = getMenuText(ui_texts_profile.alert_change_picture_failed_content, "Failed to change picture, please check your internet connection and try again.");

        $scope.text_membership_menu_text_points = getMenuText(ui_texts_membership_menu.text_membership_menu_text_points, "Points");
        //$scope.text_membership_menu_text_loyalty = getMenuText(ui_texts_membership_menu.text_membership_menu_text_loyalty, "Loyalty");
        $scope.text_membership_menu_text_loyalty = $scope.loyalty_app_integration_apps_loyalty;
        $scope.text_membership_menu_text_connect_loyalty = getMenuText(ui_texts_membership_menu.text_membership_menu_text_connect_loyalty, "Connect to ") + $scope.loyalty_app_integration_apps_loyalty;
        $scope.text_membership_menu_text_disconnect_loyalty = getMenuText(ui_texts_membership_menu.text_membership_menu_text_disconnect_loyalty, "Disconnect From ") + $scope.loyalty_app_integration_apps_loyalty;
        $scope.loyalty_app_integration_apps_loyalty = $scope.loyalty_app_integration_apps_loyalty;
        $scope.text_loyalty_register = getMenuText(ui_texts_membership_menu.text_loyalty_register, "If you don't have account in ") + $scope.loyalty_app_integration_apps_loyalty + " app, please register on " + $scope.loyalty_app_integration_apps_loyalty + " app";
        $scope.text_link_play_store = "Link Publish Play Store";
        $scope.text_link_app_store = "Link Publish App Store";
    };

    loadCustomText();

    $ionicPlatform.ready(function () {
        console.log($rootScope.loyalty_email);
        $scope.result = '';
        $scope.member_card_enabled = member_card_enabled;


        if ($scope.member_card_enabled){
            $scope.custom_register_fields = JSON.parse(custom_register_fields);
            $scope.default_register_fields = JSON.parse(default_register_fields)[0];
            $scope.member_card_fields = JSON.parse(member_card_fields);
            $scope.user_meta = user_meta;
            $scope.email = email;
        }

        // initialize user login data, set '' for deployment
        $scope.input = {
            email: '',
            password: ''
        };

        $scope.username_login = username_login;

        if (user_id === '') {
            $scope.isLogin = false;
        } else {
            $scope.isLogin = true;
        }

        $scope.title = $scope.text_login_menu;
        //$scope.inAppPurchaseEnabled = inAppPurchaseEnabled;
        $scope.is_membership_enabled = is_membership_enabled;
        $scope.shopping_enabled = shopping_enabled ? 'YES':'NO';
        $scope.login_mode = login_mode;

        $scope.register_enabled = register_enabled;

        if($rootScope.login_redirect_location!=undefined && $rootScope.login_redirect_location!='')
        {
            login_redirect_location = $rootScope.login_redirect_location;
            $rootScope.lastRedirectLocation = login_redirect_location;
            $rootScope.login_redirect_location='';
        }

    });

    $scope.save_login_redirect = function(){
        $rootScope.login_redirect_location = login_redirect_location;
    }

    // function for login
    $scope.login = function () {
        console.log("LOGIN NIH");
        console.log(user_meta);
        var checkCred = (login_mode == 'username' ? $scope.input.username : $scope.input.email) !== '' && $scope.input.password !== '';

        if (checkCred) {
            $scope.show();

            var url = login_url;
            var input = $scope.input;
            var device_id = '';
            if (isPhoneGap()) {
                device_id = $cordovaDevice.getDevice().uuid;
            }
            console.log(input);
            var obj = serializeData({
                email: input.email,
                username: input.username,
                password: input.password,
                company_id: company_id,
                device_id: device_id
            });

            httpService.post($scope, $http, url, obj);
        } else {
            $scope.showRequirementAlert();
        }

    };

    $scope.showErrorAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: "Error",
            template: '<div style="width:100%;text-align:center">Your credentials doesnt match</div>',
            buttons:[
                {
                    text: $scope.alert_button_ok
                }
            ]
        });
    };

    $scope.showErrorLogoutAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: "Error",
            template: '<div style="width:100%;text-align:center">Something went wrong in disconnect</div>',
            buttons:[
                {
                    text: $scope.alert_button_ok
                }
            ]
        });
    };

    $scope.showLoginLoyalty = function (){
        console.log("Email Loyalty");
        console.log(user_meta["loyalty_email"]);
        if(user_meta["loyalty_email"] == undefined || user_meta["loyalty_email"] == ''){
            //$scope.showLoginAlert();
            $rootScope.login_redirect_location = '#/app/login/-1';
            window.location.href= "#/app/login-loyalty" ;
        }
        else{
            console.log("Berhasil");
        }
    }

    $scope.disconnectLoyalty = function (){
        $scope.show();
        var url = logout_loyalty_url;
        var obj = serializeData({
            user_id : $rootScope.user_id
        });
        console.log("Logout Loyalty");
        console.log(obj);
        httpService.post($scope, $http, url, obj, 'logout-loyalty');
    }


    $scope.loginLoyalty = function() {
        var checkCred = true;

        if (checkCred) {
            $scope.show();

            var url = login_loyalty_url;
            var input = $scope.input;
            console.log("Login Loyalty");
            console.log(input);
            var obj = serializeData({
                app_integration : $scope.loyalty_app_integration,
                email_integration : $scope.email,
                email : input.email,
                phone : "",
                password : input.password,
                merchant_code : $scope.loyalty_merchant_code,
                user_id : $rootScope.user_id
            });
            console.log(obj);
            httpService.post($scope, $http, url, obj, 'login-loyalty');
        } else {
            $scope.showRequirementAlert();
        }
    };

    $scope.$on('httpService:postLoginLoyaltySuccess', function () {
        console.log("USER ID");
        console.log($rootScope.user_id);
        $scope.hide();
        $scope.result = $scope.data;
        console.log("hasil login loyalty success");
        console.log($scope.result);
        $rootScope.loyalty_email = $scope.result.data.email;
        $rootScope.loyalty_balance = $scope.result.data.balance;
        $rootScope.loyalty_reward = $scope.result.data.reward;
        $rootScope.loyalty_name = $scope.result.data.name;
        $rootScope.loyalty_phone = $scope.result.data.phone;
        $rootScope.loyalty_member_code = $scope.result.data.code;
        $rootScope.loyalty_member_id = $scope.result.data.member_id;
        user_meta['loyalty_balance'] = $rootScope.loyalty_balance;
        user_meta['loyalty_reward'] = $rootScope.loyalty_reward;
        user_meta['loyalty_email'] = $rootScope.loyalty_email;
        user_meta['loyalty_phone'] = $rootScope.loyalty_phone;
        user_meta['loyalty_member_code'] = $rootScope.loyalty_member_code;
        user_meta['loyalty_member_id'] = $rootScope.loyalty_member_id;
        user_meta['loyalty_connect'] = $rootScope.loyalty_connect;
        console.log(user_meta);
        $scope.refreshMenu();
        if(login_redirect_location!=undefined && login_redirect_location!='')
        {
            // timeout supaya ada waktu buat loading $scope.isLogin di shoppingcart-controller
            $timeout(function(){
                window.location.href = login_redirect_location;
                login_redirect_location = '';
                $scope.refreshMenu();
            },100);
        }
    });

    $scope.$on('httpService:postLoginLoyaltyError', function () {
        $scope.hide();
        $scope.result = $scope.data;
        console.log("hasil login loyalty error");
        console.log($scope.result);
        var url = login_loyalty_url;
        var input = $scope.input;
        console.log("Login Loyalty");
        console.log(input);
        var obj = serializeData({
            app_integration : $scope.loyalty_app_integration,
            email_integration : $scope.email,
            email : input.email,
            phone : "",
            password : input.password,
            merchant_code : $scope.loyalty_merchant_code,
            user_id : $rootScope.user_id
        });

        //httpService.post($scope, $http, url, obj, 'login-loyalty');
        $scope.showErrorAlert();
    });

    $scope.$on('httpService:postLogoutLoyaltySuccess',function (){
        $scope.hide();
        console.log("hasil logout loyalty success");
        user_meta['loyalty_balance'] = '';
        user_meta['loyalty_reward'] = '';
        user_meta['loyalty_phone'] = '';
        user_meta['loyalty_member_id'] = '';
        user_meta['loyalty_email'] = '';
        user_meta['loyalty_connect'] = 'NO';
        user_meta['loyalty_member_code'] = '';
        $scope.refreshMenu();
    });

    $scope.$on('httpService:postLogoutLoyaltyError',function (){
        $scope.hide();
        console.log("hasil logout loyalty error");
        var url = logout_loyalty_url;
        var obj = serializeData({
            user_id : $rootScope.user_id
        });
        console.log("Logout Loyalty");
        console.log(obj);
        //httpService.post($scope, $http, url, obj, 'logout-loyalty');
        $scope.showErrorLogoutAlert();
    });

    // if post login data success
    $scope.$on('httpService:postRequestSuccess', function () {
        $scope.result = $scope.data;
        console.log($scope.result);
        if ($scope.result.success === true) {
            if(reservation_admin.length > 0){
                var all_admin = JSON.parse(reservation_admin);
                if($scope.result.user.company_user_group_id != null){
                    var company_user_group_id = $scope.result.user.company_user_group_id.toString();
                    if(all_admin.includes(company_user_group_id)){
                        $rootScope.admin_login = 'YES';
                    }
                    else{
                        $rootScope.admin_login = 'NO';
                    }
                }
                else{
                    $rootScope.admin_login = 'NO';
                }
            }
        }
        
        $scope.hide();

        if ($scope.result.message == null || $scope.result.message == '' || $scope.result.message == undefined) {
            $scope.showFailedAlert();
        }

        // if user authentication success
        if ($scope.result.success === true) {
            var temp_user_meta = $scope.result['user']['company_user_meta'];
            
            for(var i=0; i<temp_user_meta.length; i++)
            {
                var key = temp_user_meta[i]['key'];
                var value = temp_user_meta[i]['value'];
                if (key.indexOf('_date') !== -1) {
                    value = new Date(value);
                }
                user_meta[key] = value;
                if(key == 'loyalty_name') $rootScope.loyalty_name = value;
                else if(key == 'loyalty_balance') $rootScope.loyalty_balance = value;
                else if(key == 'loyalty_email') $rootScope.loyalty_email = value;
                else if(key == 'loyalty_phone') $rootScope.loyalty_phone = value;
                else if(key == 'loyalty_member_code') $rootScope.loyalty_member_code = value;
                else if(key == 'loyalty_member_id') $rootScope.loyalty_member_id = value;
                else if(key == 'loyalty_connect') $rootScope.loyalty_connect = value;
            }
            if (membership_features_enabled == 'YES'){
                if ($scope.result['user']['points'] != false && $scope.result['user']['points'] != null){
                    user_meta['approved_points'] = $scope.result['user']['points'].approved_points;
                    user_meta['lifetime_points'] = $scope.result['user']['points'].lifetime_points;
                    if($scope.loyalty_integration_active == 'YES') {
                        var pts = $scope.data.user.points;
                        user_meta['loyalty_balance'] = pts.loyalty_balance;
                        user_meta['loyalty_reward'] = pts.loyalty_reward;
                        user_meta['loyalty_email'] = $rootScope.loyalty_email;
                        user_meta['loyalty_phone'] = $rootScope.loyalty_phone;
                        user_meta['loyalty_member_code'] = $rootScope.loyalty_member_code;
                        user_meta['loyalty_member_id'] = $rootScope.loyalty_member_id;
                        user_meta['loyalty_connect'] = $rootScope.loyalty_connect;
                    }
                }
                else {
                    user_meta['approved_points'] = 0;
                    user_meta['lifetime_points'] = 0;
                }
            }

            user_meta['u_profile_pic'] = user_meta['u_profile_pic'] == false || user_meta['u_profile_pic'] == null || user_meta['u_profile_pic'] == undefined ? '' : user_meta['u_profile_pic'];

            if (cp_mode === 'YES'){
                cp_compro_member = user_meta['cp_compro_member'];
            }

            $scope.user_meta = user_meta;
            $scope.membership_features_enabled = membership_features_enabled;

            if (isPhoneGap()) {
                // save user login to database
                //console.log(db);
                if (db === '') {
                    db = window.sqlitePlugin.openDatabase({name: sqlitedb, location: 'default'});
                }

                db.transaction(function (tx) {

                    //console.log($scope.result.user.id + ' ' + $scope.result.user.username);
                    tx.executeSql('CREATE TABLE IF NOT EXISTS ' + user_table + ' (id integer primary key, user text)');
                    tx.executeSql('DELETE FROM ' + user_table);
                    tx.executeSql("INSERT INTO " + user_table + " (id, user) VALUES (?,?)", [$scope.result.user.id, JSON.stringify($scope.result.user)], function (tx, res) {
                        //console.log("insertId: " + res.insertId + " -- probably 1");
                        //console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");

                        $scope.showAlert('Login', translate_login_status($scope.result.status_code));
                        user_id = $scope.result.user.id;
                        username_login = $scope.result.user.username;
                        email = $scope.result.user.email;

                        console.log(username_login + ' ' + user_id + ' ' + email + ' ' + phone);

                        menu_text_user = default_menu_titles.user !== undefined && default_menu_titles.user[language]!==undefined ? default_menu_titles.user[language] : "User";

                        login_menu = menu_text_user;

                        $scope.title = $scope.text_login_menu;


//                        var idx = main_menu.findIndex(checkTemplate);
                        var idx = findMenuIndex(main_menu, "login");
                        main_menu[idx].title = login_menu;
                        // main_menu[main_menu.length - 4].title = login_menu;

                        $scope.username_login = username_login;
                        $rootScope.username_login = username_login;
                        $scope.email = email;
                        $rootScope.email = email;
                        console.log($rootScope.username_login);
                        console.log($rootScope.email);
                        $scope.isLogin = true;
                        $scope.isSupportLogin = true;
                        $rootScope.isSupportLoggedIn = true;
                        $rootScope.isLoggedIn = true;
                        $rootScope.isSupportAutoLogin = false;
                        main_menu['transaction_list'] = $scope.isLogin;
                        $rootScope.transaction_count = $scope.result['transaction_count'];

                        $rootScope.user_id = user_id;
                        $scope.refreshMenu();
                    }, function (e) {
                        console.log('SUPPORT USER LOGGED OUT ERROR');
                        console.log("ERROR: " + e.message);
                        $scope.isLogin = false;
                        $scope.isSupportLogin = false;
                        main_menu['transaction_list'] = $scope.isLogin;
                        $rootScope.transaction_count = $scope.result['transaction_count'];
                        $scope.showAlert('Login', "Login Error. Please Try Again");
                    });
                });
            }
            else {
                $scope.showAlert($scope.alert_login_title, translate_login_status($scope.result.status_code));
                user_id = $scope.result.user.id;
                username_login = $scope.result.user.username;
                email = $scope.result.user.email;

                //console.log(username_login + ' ' + user_id + ' ' + email + ' ' + phone + ' ' + address);
                menu_text_user = default_menu_titles.user !== undefined && default_menu_titles.user[language]!==undefined ? default_menu_titles.user[language] : "User";
                        console.log(default_menu_titles);
                login_menu = menu_text_user;

                $scope.title = $scope.text_login_menu;


//                var idx = main_menu.findIndex(checkTemplate);
                var idx = findMenuIndex(main_menu, "login");
                main_menu[idx].title = login_menu;

                // main_menu[main_menu.length - 4].title = login_menu;

                $scope.username_login = username_login;
                $scope.email = email;
                $scope.isLogin = true;
                $rootScope.isLoggedIn = true;
                $rootScope.isSupportLoggedIn = true;
                $scope.isSupportLogin = true;
                $rootScope.username_login = username_login;
                $rootScope.email = email;
                main_menu['transaction_list'] = $scope.isLogin;
                $rootScope.transaction_count = $scope.result['transaction_count'];
//                console.log("UPDATED");
//                console.log("ROOT SCOPE UPDATE" + $rootScope.transaction_count);
//                console.log($rootScope.transaction_count);
                $rootScope.isSupportAutoLogin = false;
                console.log($rootScope.username_login);
                console.log($rootScope.email);
                $rootScope.user_id = user_id;
                $scope.refreshMenu();

            }

            if(login_redirect_location!=undefined && login_redirect_location!='')
            {
                // timeout supaya ada waktu buat loading $scope.isLogin di shoppingcart-controller
                $timeout(function(){
                    window.location.href = login_redirect_location;
                    login_redirect_location = '';
                },100);
            }
        }
        else {
            //if expired and needs top-up
            if($scope.result.status_code === 'expired' && is_membership_enabled=='YES')
            {
                $scope.showAlert($scope.alert_login_title, translate_login_status($scope.result.status_code));
                user_id = $scope.result.user.id;
                username_login = $scope.result.user.username;
                email = $scope.result.user.email;

                console.log(username_login + ' ' + user_id + ' ' + email + ' ' + phone + ' ' + address);

                menu_text_user = default_menu_titles.user !== undefined && default_menu_titles.user[language]!==undefined ? default_menu_titles.user[language] : "User";

                login_menu = menu_text_user;

                $scope.title = $scope.text_login_menu;
                $scope.username_login = username_login;
                $scope.email = email;

                window.location.href = "#/app/top-up/-6";
            }
            else
            {
                $scope.isLogin = false;
                $rootScope.isLoggedIn = false;
                $rootScope.isSupportLoggedIn = false;
                main_menu['transaction_list'] = $scope.isLogin;
                $rootScope.transaction_count = $scope.result['transaction_count'];
                $scope.showAlert('Login', translate_login_status($scope.result.status_code));
            }
        }

    });

    // logout function
    $scope.showLogoutConfirm = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: $scope.alert_logout_confirm_title,
            template: $scope.alert_logout_confirm_content,
            okType:'cp-button',
            okText:$scope.alert_button_ok,
            cancelText:$scope.alert_button_cancel
        });

        //confirmation dialog
        confirmPopup.then(function (res) {
            if (res) {
                var device_id = '';
                if (isPhoneGap()) {
                    device_id = $cordovaDevice.getDevice().uuid;
                }
                //device_id = '2c5652e569bba77f'; // Testing Purposes Only
                var url = logout_url + '?user_id=' + user_id + '&company_id=' + company_id + '&device_id=' + device_id ;
                httpService.get($scope, $http, url, 'logout');

                isRefreshLanguage = true;
                $rootScope.admin_login = 'NO';
                user_id = '';
                $scope.refreshMenu();
//                user_meta['u_profile_pic'] = '';
                user_meta = {};

                if (isPhoneGap()) {
                    //console.log(db);
                    if (db === '') {
                        db = window.sqlitePlugin.openDatabase({name: sqlitedb, location: 'default'});
                    }
                    db.transaction(function (tx) {
                        //tx.executeSql('DROP TABLE IF EXISTS ' + user_table);
                        //console.log(user_id + " " + username_login);
                        tx.executeSql("DELETE FROM " + user_table, [], function (tx, res) {
                            //apus dari db
                            user_id = '';
                            username_login = '';
                            email = '';
                            phone = '';
                            address = '';

                            $scope.isLogin = false;
                            $rootScope.isLoggedIn = false;
                            $rootScope.isSupportLoggedIn = false;
                            main_menu['transaction_list'] = $scope.isLogin;
                            $rootScope.transaction_count = $scope.result['transaction_count'];

                            $scope.title = $scope.text_login_menu;

//                            var idx = main_menu.findIndex(checkTemplate);
                            var idx = findMenuIndex(main_menu, "login");
                            main_menu[idx].title = login_menu;
//                            console.log("*** Login MENU: " + $scope.title + "***");
                            // main_menu[main_menu.length - 4].title = login_menu;
                            $scope.showAlert('Logout', "Logout Success");

                            $ionicHistory.nextViewOptions({
                                disableBack: true
                            });
                            $ionicHistory.clearHistory();

                            if (login_required == true) {
                                login_menu = 'User';
//                                var idx = main_menu.findIndex(checkTemplate);
                                var idx = findMenuIndex(main_menu, "login");
                                main_menu[idx].title = login_menu;
                                // main_menu[main_menu.length - 4].title = login_menu;
                                $state.go("login");
                                $ionicHistory.clearHistory();
                            } else {
                                $state.go('app.' + home_template, {id: home_id});
                                $ionicHistory.clearHistory();
                            }

                        }, function (e) {
                            console.log("ERROR: " + e.message);
                            $scope.isLogin = true;
                            $rootScope.isLoggedIn = true;
                            $rootScope.isSupportLoggedIn = true;
                            main_menu['transaction_list'] = $scope.isLogin;
                            $rootScope.transaction_count = $scope.result['transaction_count'];
                            $scope.showAlert('Logout', "Logout Failed. Please Try Again");
                        });
                    });
                }
                else {

                    user_id = '';
                    username_login = '';
                    email = '';
                    phone = '';
                    address = '';

                    $scope.isLogin = false;
                    $rootScope.isLoggedIn = false;
                    $rootScope.admin_login = 'NO';
                    $rootScope.isSupportLoggedIn = false;
                    main_menu['transaction_list'] = $scope.isLogin;
                    $rootScope.transaction_count = $scope.result['transaction_count'];

                    $scope.title = $scope.text_login_menu;
                    console.log("*** Login MENU: " + $scope.title + "***");
                    // console.log(main_menu[main_menu.length - 3]);
//                    var idx = main_menu.findIndex(checkTemplate);
                    var idx = findMenuIndex(main_menu, "login");
                    main_menu[idx].title = login_menu;
                    // main_menu[main_menu.length - 4].title = login_menu;

                    $scope.showAlert('Logout', "Logout Success");

                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $ionicHistory.clearHistory();

                    if (login_required == true) {
                        login_menu = 'User';
//                        var idx = main_menu.findIndex(checkTemplate);
                        var idx = findMenuIndex(main_menu, "login");
                        main_menu[idx].title = login_menu;
                        // main_menu[main_menu.length - 4].title = login_menu;
                        $rootScope.$emit("ReloadDefaultLanguage");
                        $state.go("login");
                        $ionicHistory.clearHistory();
                    } else {
                        $state.go('app.' + home_template, {id: home_id});
                        $ionicHistory.clearHistory();
                    }
                }
            }
            else {
                $scope.isLogin = true;
                $rootScope.isLoggedIn = true;
                $rootScope.isSupportLoggedIn = true;
                main_menu['transaction_list'] = $scope.isLogin;
                $rootScope.transaction_count = $scope.result['transaction_count'];
            }
        });
    };

    $scope.$on('httpService:postRequestError', function () {
        $scope.hide();
        $scope.showFailedAlert();

    });

    $scope.showAlert = function (title, message) {
        isPopupShown = true;
        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_login_title,
            css: 'cp-button',
            template: '<div style="width:100%;text-align:center">' + message + '</div>',
            okType: 'cp-button',
            buttons: [{
                text: $scope.alert_button_ok,
                type: 'cp-button',
                onTap: function(e)
                {
                    showNextPopup();    // app-functions.js
                }
            }]
        });
    };

    $scope.show = function () {
        $ionicLoading.show({
            template: ionicLoadingTemplate
        });
    };

    $scope.hide = function () {
        $ionicLoading.hide();
    };

    $scope.showFailedAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_login_title,
            css: 'cp-button',
            okType: 'cp-button',
            okText: $scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">' + $scope.alert_login_failed_connection + '</div>'
        });
    };

    $scope.showRequirementAlert = function () {
        var messageEmail = $scope.alert_login_failed_requirement_email;
        var messageUsername = $scope.alert_login_failed_requirement_username;
        var message = login_mode == 'username' ? messageUsername : messageEmail;

        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_login_title,
            css: 'cp-button',
            okType: 'cp-button',
            okText: $scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">'+ message +'</div>'
        });
    };

    $scope.refreshMenu = function(){
        console.log("Login Refresh Menu Success");
//        user_meta = $scope.user_meta;
        $scope.$emit('httpService:refreshMenu');
    };

//================================================================================================
//================================== UPLOAD PROFILE PICTURE ======================================
//================================================================================================

    $scope.$on('httpService:postTokenEditProfileSuccess', function () {

        var token = $scope.data.token;

        for (var i in $scope.user_meta) {
            if (i.indexOf('expired_date') !== -1 && is_membership_enabled == 'YES') {
                $scope.expired_required = true;
            } 
            else if (i.indexOf('_date') !== -1) {    
                if(!isValidDate($scope.user_meta[i])) {
                    $scope.user_meta[i] = Date.now();
                    $scope.user_meta[i] = new Date($scope.user_meta[i]);
                }
                else if(isValidDate($scope.user_meta[i])) {
                    $scope.user_meta[i] = new Date($scope.user_meta[i]);
                }
            }
        }

        console.log($scope.user_meta);

        var tempString = JSON.stringify($scope.user_meta);

        var obj = serializeData({_method: 'POST', user_id:user_id, username: username_login, company_id: company_id, meta: tempString});
        httpService.post($scope, $http, profile_url + '?token=' + token, obj, 'edit-profile');

    });
    $scope.$on('httpService:postTokenEditProfileError', function () {
        $scope.hide();
        $scope.showChangePictureError();
    });

     $scope.$on('httpService:postEditProfileSuccess', function () {
        //console.log('edit profile baruuuuu');
        //console.log($scope.data);
        $scope.hide();
        $scope.isConfirmSavePic = false;
        if($scope.data.success === true)
        {
            $scope.showChangePictureSuccess();
            username_login = $scope.input.username;

            var temp_user_meta = $scope.data.user.company_user_meta;
            for(var i=0; i<temp_user_meta.length; i++)
            {
                var key = temp_user_meta[i]['key'];
                if (key.indexOf('u_profile_pic') !== -1) {
                    temp_user_meta[i]['value'] = user_meta['u_profile_pic'];
                }
            }

            $scope.data.user.company_user_meta = temp_user_meta;

            if (isPhoneGap()) {
                // save user login to database
                console.log(db);
                if (db === '') {
                    db = window.sqlitePlugin.openDatabase({name: sqlitedb, location: 'default'});
                }

                db.transaction(function (tx) {
                    tx.executeSql("DELETE FROM " + user_table + " WHERE id = ?",[user_id]);
                    tx.executeSql("INSERT INTO " + user_table + " (id, user) VALUES (?,?)", [$scope.data.user.id, JSON.stringify($scope.data.user)], function (tx, res) {
                        //console.log("insertId: " + res.insertId + " -- probably 1");
                        //console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");

                        user_id = $scope.data.user.id;
                        username_login = $scope.data.user.username;
                        email = $scope.data.user.email;

                    }, function (e) {

                    });
                });
            }
            else {
                user_id = $scope.data.user.id;
                username_login = $scope.data.user.username;
                email = $scope.data.user.email;
            }

        }
        else
        {
            $scope.showChangePictureError();
        }
    });

    $scope.$on('httpService:postEditProfileError', function () {
        $scope.hide();
        $scope.showChangePictureError();

    });

    $scope.changeProfilePicture = function(field_key){
        $scope.importImage($ionicPopup, $scope, $cordovaCamera, field_key);
    };

    $scope.confirmSavePicture = function(){
        $scope.show();
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});

        // save online
        httpService.post_token($scope, $http, url, obj, 'edit-profile');
    }

    $scope.cancelSavePicture = function(){
        $scope.isConfirmSavePic = false;
        $scope.user_meta['u_profile_pic'] = $scope.temp_pic;
    }

    $scope.importImage = function($ionicPopup, $scope, $cordovaCamera, field_key){
        var alertPopup = $ionicPopup.alert({
            title: $scope.text_upload_image_modal,
            template: '<div style="width:100%;text-align:center">'+$scope.text_upload_image_description+'</div>',
            cssClass: 'popup-vertical-buttons',
            buttons:[
                {
                    text: $scope.button_text_take_photo,
                    type: 'cp-button button-block',
                    onTap: function(e)
                    {
                        $scope.takePhoto($ionicPopup, $scope, $cordovaCamera, field_key);
                    }
                },
                {
                    text: $scope.button_text_browse,
                    type: 'cp-button button-block',
                    onTap: function(e)
                    {
                        $scope.choosePhoto($ionicPopup, $scope, $cordovaCamera, field_key);
                    }
                },
                {
                    text: $scope.button_text_back
                }
            ]
        });
    }

    $scope.takePhoto = function ($ionicPopup, $scope, $cordovaCamera, field_key) {
        $scope.temp_pic = $scope.user_meta[field_key];
        if (!isPhoneGap()) {
            console.log("Not in a mobile device");
            $scope.user_meta[field_key] =  "data:image/jpeg;base64,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";
            $scope.isConfirmSavePic = true;
            return;
        }
        var options = {
            quality: 85,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 512,
            targetHeight: 512,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.user_meta[field_key] =  "data:image/jpeg;base64," + imageData;
            $scope.isConfirmSavePic = true;
        }, function (err) {
            if(err == "Selection cancelled.") {
                //do Nothing
            }
            else if(err == "Camera cancelled.") {
                // do Nothing
            }
            else {
                $scope.uploadPhotoFailed($ionicPopup);
            }
        });
    };

    $scope.choosePhoto = function($ionicPopup, $scope, $cordovaCamera, field_key){
        $scope.temp_pic = $scope.user_meta[field_key];
        if (!isPhoneGap()) {
            console.log("Not in a mobile device");
            $scope.user_meta[field_key] =  "data:image/jpeg;base64,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";
            $scope.isConfirmSavePic = true;
            return;
        }
        var options = {
            quality: 85,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 512,
            targetHeight: 512,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.user_meta[field_key] =  "data:image/jpeg;base64," + imageData;
            $scope.isConfirmSavePic = true;
        }, function (err) {
            if(err == "Selection cancelled.") {
                //do Nothing
            }
            else if(err == "Camera cancelled.") {
                // do Nothing
            }
            else {
                $scope.uploadPhotoFailed($ionicPopup);
            }
        });
    }

    $scope.uploadPhotoSuccess = function ($ionicPopup) {
        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_upload_image_title,
            template: '<div style="width:100%;text-align:center">' + $scope.alert_upload_image_success + '</div>',
            buttons: [
                {
                    text: $scope.alert_button_ok,
                    type: 'cp-button'
                }
            ]
        });
    };

    $scope.uploadPhotoFailed = function ($ionicPopup) {
        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_upload_image_title,
            template: '<div style="width:100%;text-align:center">' + $scope.alert_upload_image_failed_connection + '</div>',
            buttons: [
                {
                    text: $scope.alert_upload_image_button_try_again,
                    type: 'cp-button'
                    // onTap: function(e) {
                    //     $scope.choosePhoto($scope.trans_id);
                    // }
                }
            ]
        });
    };

    $scope.showChangePictureSuccess = function (username) {
        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_change_picture_success_title,
            css: 'cp-button',
            okType:'cp-button',
            okText:$scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">' + $scope.alert_change_picture_success_content +'</div>'
        });
    };

     $scope.showChangePictureError = function () {
        var alertPopup = $ionicPopup.alert({
            title: $scope.alert_change_picture_failed_title,
            css: 'cp-button',
            okType:'cp-button',
            okText:$scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">' + $scope.alert_change_picture_failed_content + '</div>'
        });
    };
//==============================================================================

    $scope.splitString = function(input,splitLength){
        i = 0;
        var arr = [];
        for (var a = 0; a < input.length; a+=splitLength){
            arr[i++] = input.substring(a,a+splitLength);
        }

        var res = '';
        for (var a = 0; a < arr.length-1; a++){
           res += arr[a] + " ";
        }
        res += arr[arr.length-1];

        return res;
    };
});
