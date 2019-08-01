app.controller("HomeCtrl12", function ($scope,
                                     $http,
                                     httpService,
                                     $stateParams,
                                     $ionicModal,
                                     $ionicLoading,
                                     $ionicPlatform,
                                     $cordovaClipboard,
                                     $cordovaToast,
                                     $ionicGesture,
                                     //adMobService,
                                     $timeout) {

    $scope.isLoading = true;
    $scope.isTimeout = false;
    
    $ionicPlatform.ready(function () {
        console.log('Home Controller');
        if (isPhoneGap()) {
            // adMobService.showBannerAd();
            loadTermJSONFromDB($stateParams.id, $scope);
            // Added Load from SQLite before HTTP Request
            // Siapapun yang duluan di-load akan dimunculkan (utk Koneksi Internet yg kurang cepat)
        }

        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        httpService.post_token($scope, $http, url, obj);

    });

    // if get token success, request home data
    $scope.$on('httpService:postTokenSuccess', function () {
        token = $scope.data.token;
        //console.log(token);
        console.log('GET TOKEN SUCCESS');
        var url = term_content_url + $stateParams.id;
        httpService.get($scope, $http, url, 'content', token);
    });

    // if get home data success, set home data
    $scope.$on('httpService:getRequestSuccess', function () {
        $scope.content_data = {
            title: $scope.data.term.title,
            img_src: $scope.data.term.featured_image_path,
            menus: $scope.data.term_child,
            menu_post: $scope.data.term_child_posts
        };
//        $scope.home_menus = $scope.content_data.menus;
        
        if ($scope.data.home_share_apps_image != null && home_id == $scope.data.term.id && $scope.data.term.content_type_id == 2) {
            var ShareApps = {
                id: -5,
                icon_code: 'icon ion-android-share-alt',
                title: 'Share Apps',
                no: 1005,
                featured_image_path: $scope.data.home_share_apps_image
            };

            $scope.content_data.menus.push(ShareApps);
            //console.log($scope.content_data.menus);
        }


        $scope.isLoading = false;
        console.log('GET CONTENT SUCCESS: ' + $scope.content_data.menus.length);
        //console.log($scope.data);
          
        $scope.selectedMenuData = $scope.content_data.menus[0];
        document.getElementById('home12menuTitle').style.opacity = 1;
        // save to db
        if (isPhoneGap()) {
            saveTermJSONToDB($stateParams.id, 'HomeCtrl', $scope.data);
        }
    });

    $scope.$on('httpService:postTokenError', function () {
        if ($scope.status === 0) {
            console.log('NO INTERNET CONNECTION');
            if (isPhoneGap()) {
                loadTermJSONFromDB($stateParams.id, $scope);
            }
        }
        else {
            var url = token_url;
            var obj = serializeData({email: username, password: password, company_id: company_id});
            httpService.post_token($scope, $http, url, obj, 'content');
        }
    });

    $scope.$on('httpService:getRequestError', function () {
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        $scope.isTimeout = true;
//        httpService.post_token($scope, $http, url, obj, 'content');
    });

    $scope.$on('SQLite:getOfflineDataSuccess', function () {
        $scope.content_data = {
            title: $scope.data.term.title,
            img_src: $scope.data.term.featured_image_path,
            menus: $scope.data.term_child,
            menu_post: $scope.data.term_child_posts
        };
//        $scope.home_menus = $scope.content_data.menus;
        
        if ($scope.data.home_share_apps_image != null && home_id == $scope.data.term.id && $scope.data.term.content_type_id == 2) {
            var ShareApps =
            {
                id: -5,
                icon_code: 'icon ion-android-share-alt',
                title: 'Share Apps',
                no: 1005,
                featured_image_path: $scope.data.home_share_apps_image
            };

            $scope.content_data.menus.push(ShareApps);
            //console.log($scope.content_data.menus);
        }

        $scope.isLoading = false;
        console.log('GET OFFLINE CONTENT SUCCESS: ' + $scope.content_data.menus.length);
        
        $scope.selectedMenuData = $scope.content_data.menus[0];
        document.getElementById('home12menuTitle').style.opacity = 1;
        //console.log($scope.data);
    });

    $scope.$on('SQLite:getOfflineDataError', function () {
        $scope.isLoading = true;
        console.log('NO LOCAL DATA FOUND, PLEASE CONNECT TO INTERNET TO UPDATE DATA');
    });


    $scope.socialShare = function () {
        if (isPhoneGap()) {
            if (isAndroid()) {
                socialShare($cordovaClipboard, $cordovaToast, $timeout, "Download the app at:", null, null, playstore_link, null);
            }
            else if (isIOS()) {
                socialShare($cordovaClipboard, $cordovaToast, $timeout, 'Download the app at:', null, null, appstore_link, null);
            }
        } else {
            console.log('Social Share: Not a Mobile Device');
            console.log(playstore_link);
            console.log(appstore_link);
        }
    };

    // Create the menu modal that we will use later
    $ionicModal.fromTemplateUrl('templates/tabs-more-modal-1.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
        //success
    }, {
        //error
    });

    // Triggered in the menu modal to close it
    $scope.closeMenu = function () {
        $scope.modal.hide();
    };

    // Open the menu modal
    $scope.openMenu = function () {
        $scope.modal.show();
    };

    $scope.openDrawer = function (modalTemplateURL) {
        // Create the menu modal that we will use later
        if ($scope.modal == undefined) {
            $ionicModal.fromTemplateUrl(modalTemplateURL, {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                //success
                $scope.openMenu();
            }, {
                //error
            });
        }
        else if (modalTemplateURL !== "")
            $ionicModal.fromTemplateUrl(modalTemplateURL, {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
                //success
                $scope.openMenu();
            }, {
                //error
            });
        else
            $scope.openMenu();
    };
    
/**** START: circular menu ****/
    var circles = document.getElementsByClassName('ionic-wheel-circle');

    $scope.circlesHidden = true;

    $scope.showCircles= function() {
      var $circles = angular.element(circles);
      if ($scope.circlesHidden) {
        $circles.addClass('active');
      } else {
        $circles.removeClass('active');
      }
      $scope.toggleCirclesHidden();
    };

    $scope.toggleCirclesHidden = function() {
      return $scope.circlesHidden = !$scope.circlesHidden;
    };
    
    var menus = document.getElementsByClassName('show-menu-on-top');
    var circle = document.getElementById('ionic-wheel').parentElement;  
    $scope.selectedMenuData = '';
    
    $ionicGesture.on('drag', function(e){
        e.gesture.srcEvent.preventDefault();
        var st = window.getComputedStyle(circle, null);
        var tr = st.getPropertyValue("-webkit-transform") ||
                st.getPropertyValue("-moz-transform") ||
                st.getPropertyValue("-ms-transform") ||
                st.getPropertyValue("-o-transform") ||
                st.getPropertyValue("transform") ||
                "FAIL";
        
        var values = tr.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        
        var rot = Math.round(Math.atan2(b, a) * (180/Math.PI));
        rot = rot < 0 ? (360 + rot) : rot;
        
        var menuDeg = 360/menus.length;
        var offset = (90-menuDeg);
        for (var a = menus.length-1; a >= 0; a--){
            var currTop = -(a+1) * menuDeg + 360;
            currTop = currTop == 0 ? 360 : currTop;
            var degLow = currTop - menuDeg/2 - offset; 
            var degHigh = currTop + menuDeg/2 - offset; 
            // handle to fix > 360 and < 0 bug
            var tempRot = rot;
            if (currTop == 360){
                tempRot = rot < 180 ? (rot + 360) : rot;
            }
            
            if (degLow <= tempRot && tempRot <= degHigh){
                if ($scope.selectedMenuData != $scope.content_data.menus[a]){
                    $scope.selectedMenuData = $scope.content_data.menus[a];
                    $scope.$apply(); 
                }
                break;
            }
        }
    }, angular.element(circle));
/**** END: circular menu ****/
    
    $scope.retryLoadContent = function(){
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        
        $scope.isTimeout = false;
        
        httpService.post_token($scope, $http, url, obj, 'content');
    };
    
});

