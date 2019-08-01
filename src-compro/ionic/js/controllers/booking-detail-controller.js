app.controller("BookingDetailCtrl", function ($scope,
                                            $rootScope,
                                            $http,
                                            $filter,
                                            httpService,
                                            $stateParams,
                                            $ionicLoading,
                                            $ionicPopup,
                                            $ionicHistory,
                                            $ionicPlatform,
                                            $cordovaClipboard,
                                            $cordovaToast,
                                            $timeout) {

    // loading spinner in the beginning
    $scope.isLoading = true;
    $scope.isTimeout = false;
    $scope.isLoginEnabled = isLoginEnabled;
    $scope.custom_booking_fields = [];
    $scope.default_booking_fields = [];
    $scope.input = {
        'meta' : {}
    };

    var loadCustomText = function() {
        $scope.button_text_book_now = getMenuText(ui_texts_bookings.button_text_book_now,'Book Now');
        $scope.button_text_please_login = getMenuText(ui_texts_bookings.button_text_please_login,'Please login to place a booking.');
        $scope.button_text_login_now = getMenuText(ui_texts_bookings.button_text_login_now,"Login Now");
        $scope.button_text_ok = getMenuText(ui_texts_bookings.button_text_ok,'OK');
        $scope.ui_text_booking_success = getMenuText(ui_texts_bookings.ui_text_booking_success, "Successfully submitted booking.");
        $scope.ui_text_booking_failed = getMenuText(ui_texts_bookings.ui_text_booking_failed, "Booking Failed. Please Check Your Internet Connection and Try Again");
        $scope.ui_text_please_login = getMenuText(ui_texts_bookings.ui_text_please_login,"Please login to place booking");
        $scope.title_text_login = getMenuText(ui_texts_bookings.title_text_login,"Login");
        $scope.title_text_booking = getMenuText(ui_texts_bookings.title_text_booking,"Booking");
        $scope.input_text_name = getMenuText(ui_texts_bookings.input_text_name,"Name");
        $scope.input_placeholder_name = getMenuText(ui_texts_bookings.input_placeholder_name,"Name");
        $scope.input_required_error_name = getMenuText(ui_texts_bookings.input_required_error_name,"Name must be filled.");
        $scope.input_text_booking_date = getMenuText(ui_texts_bookings.input_text_booking_date,"Booking Date.");
        $scope.input_placeholder_booking_date = getMenuText(ui_texts_bookings.input_placeholder_booking_date,"Booking Date.");
        $scope.input_required_error_booking_date = getMenuText(ui_texts_bookings.input_required_error_booking_date,"Booking Date must be filled.");
        $scope.input_format_error_booking_date = getMenuText(ui_texts_bookings.input_format_error_booking_date,"Wrong format for Booking Date field, please input a valid date.");
        $scope.input_text_booking_time = getMenuText(ui_texts_bookings.input_text_booking_time,"Booking Time.");
        $scope.input_placeholder_booking_time = getMenuText(ui_texts_bookings.input_placeholder_booking_time,"Booking Time.");
        $scope.input_required_error_booking_time = getMenuText(ui_texts_bookings.input_required_error_booking_time,"Booking Time must be filled.");
        $scope.input_format_error_booking_time = getMenuText(ui_texts_bookings.input_format_error_booking_time,"Wrong format for Booking Time field, please input a valid time.");
        $scope.input_text_message = getMenuText(ui_texts_bookings.input_text_message,"Message");
        $scope.input_placeholder_message = getMenuText(ui_texts_bookings.input_placeholder_message, "Message ");
        $scope.alert_text_booking_number = getMenuText(ui_texts_bookings.alert_text_booking_number, 'Booking Number');
        $scope.alert_text_submitted = getMenuText(ui_texts_bookings.alert_text_submitted,'Submitted *NEW');
    }

    loadCustomText();

    $ionicPlatform.ready(function(){

        // check user login
        if (user_id === '') {
            $scope.isLogin = false;
        } else {
            $scope.isLogin = true;
        }
        //console.log($ionicHistory.viewHistory());

        // initialize input text comment
        $scope.input = {
            comment: ''
        };

        $scope.liked = false;

        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        // call angular http service
        httpService.post_token($scope, $http, url, obj);

        // variable for saving new comment data
        $scope.list_comment_temp = '';
    });


    // get token for getting detail data success
    $scope.$on('httpService:postTokenSuccess', function () {
        token = $scope.data.token;
        //console.log(token);
        //request compressed image or high res images
        var url = "";
        if(loadCompressedImages==false)
        {
            url = post_content_url + $stateParams.id;
        }
        else
        {
            url = post_compressed_content_url + $stateParams.id;
        }

        // get data
        httpService.get($scope, $http, url, 'content', token + '&user_posts_user_id=' + encodeURIComponent(user_id));
        console.log('BookingDetailCtrl');

    });

    var term_content_type_id;
    $rootScope.$on('ReloadDefaultLanguage',reloadTermStaticPageLanguage);

    // get data success
    $scope.$on('httpService:getRequestSuccess', function () {

        $scope.content_data = {
            id: $stateParams.id,
            title: $scope.data.post.title,
            created_date: $scope.data.post.published_date,
            img_src: $scope.data.post.featured_image_path,
            summary: $scope.data.post.summary,
            content: $scope.data.post.content,
            comment_status: $scope.data.post.comment_status,
            total_likes: $scope.data.post.like_count,
            total_comments: $scope.data.post.comment_count,
            comments: $scope.data.post.comment,
            likes: $scope.data.post.like,
            post_meta: $scope.data.post.post_meta
        };

        term_content_type_id = $scope.data.post.term_content_type_id;
        $scope = reloadTermStaticPageLanguage($scope,term_content_type_id);

        for(var i=0; i<$scope.content_data.post_meta.length; i++)
        {
            if($scope.content_data.post_meta[i]['key'] == "custom_booking_fields") {
                $scope.custom_booking_fields = JSON.parse($scope.content_data.post_meta[i]['value']);
            }
            else if($scope.content_data.post_meta[i]['key'] == "default_booking_fields") {
                $scope.default_booking_fields = JSON.parse($scope.content_data.post_meta[i]['value']);
            }
        }
        console.log($scope.default_booking_fields);

        $scope.comments = $scope.content_data.comments;
        $scope.isLoading = false;
        if ($scope.content_data.comment_status != '0') {
            if($scope.content_data.likes !== undefined && $scope.content_data.likes !== null)
            {
                //console.log('bisa like');
                if (checkPostLikes($scope.content_data.likes, user_id)) {
                    //console.log('pernah like');
                    $scope.liked = true;
                } else {
                    $scope.liked = false;
                }
            }
        }

        //request compressed image if set to on
        if(loadCompressedImages)
        {
            var url = token_url;
            var obj = serializeData({email: username, password: password, company_id: company_id});
            // call angular http service
            httpService.post_token($scope, $http, url, obj, 'high-res-data-content');
        }

    });

    // if get token detail data Error, request token again
    $scope.$on('httpService:postTokenError', function () {
        if($scope.status === 0)
        {
            if(isPhoneGap())
            {
                loadPostJSONFromDB($stateParams.id, $scope);
            }


        }
        else {
            var url = token_url;
            var obj = serializeData({email: username, password: password, company_id: company_id});
            httpService.post_token($scope, $http, url, obj, 'content');
        }
    });

    // if get detail data Error, request token again
    $scope.$on('httpService:getRequestError', function () {
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        $scope.isTimeout = true;
//        httpService.post_token($scope, $http, url, obj, 'content');

    });

    $scope.$on('httpService:postTokenGetHighResDataSuccess', function (event, args) {
        token = $scope.data.token;

        //console.log(token);
        var url = post_content_url + $stateParams.id;
        httpService.get($scope, $http, url, 'high-res-data-content', token);

        //console.log($scope.data);
    });

    $scope.$on('httpService:postTokenGetHighResDataError', function (event, args) {
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        // call angular http service
        httpService.post_token($scope, $http, url, obj, 'high-res-data-content');
    });

    $scope.$on('httpService:getHighResDataSuccess', function (event, args) {
        var updated_data = args.data;
        $scope.content_data = {
            id: $stateParams.id,
            title: updated_data.post.title,
            created_date: updated_data.post.published_date,
            img_src: updated_data.post.featured_image_path,
            summary: updated_data.post.summary,
            content: updated_data.post.content,
            comment_status: updated_data.post.comment_status,
            total_likes: updated_data.post.like_count,
            total_comments: updated_data.post.comment_count,
            comments: updated_data.post.comment,
            likes: updated_data.post.like,
            post_meta: updated_data.post.post_meta
        };

        $scope = reloadTermStaticPageLanguage($scope,term_content_type_id);

        //display true resolution image
        console.log('true resolution loaded');

        // save to db first page
        if(isPhoneGap())
        {
            //console.log($stateParams.id + " " + $scope.data.post.term_id + " " + 'ArticleDetailCtrl' + " " + $scope.data);
            savePostJSONToDB($stateParams.id, updated_data.post.term_id, 'BookingDetailCtrl', updated_data);
            //console.log('saved');
        }

    });

    // if get data list article error, set timeout, then tap reload again.
    $scope.$on('httpService:getHighResDataError', function (event, args) {

        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        // call angular http service
        httpService.post_token($scope, $http, url, obj, 'high-res-data-content');

    });


    // function submit comment
    $scope.postComment = function () {
        if ($scope.input.comment !== '') {
            $scope.show();
            var url = token_url;
            var obj = serializeData({email: username, password: password, company_id: company_id});

            // get token for posting comment
            httpService.post_token($scope, $http, url, obj, 'post_comment');
        }
    };

    // if token for post comment success
    $scope.$on('httpService:postTokenCommentSuccess', function () {
        token = $scope.data.token;
        //console.log('token post comment = ' + token);
        var obj = serializeData({_method: 'POST', content: $scope.input.comment, post_id: $stateParams.id, user_id: user_id, company_id: company_id, author: username_login});

        // post comment
        httpService.post($scope, $http, comments_url + '?token=' + token, obj, 'post_comment');
    });

    // if token for post comment error
    $scope.$on('httpService:postTokenCommentError', function () {
        $scope.hide();
        $scope.showFailedAlert();
    });

    // if post comment success, show notification
    $scope.$on('httpService:postCommentSuccess', function () {

        if ($scope.data.success === true) {
            $scope.hide();
            $scope.showSuccessAlert();
            $scope.content_data.comments.push($scope.data.comment);
            $scope.content_data.total_comments++;

            $scope.input.comment = '';

           // console.log($scope.comments);
        } else {
            $scope.hide();
            $scope.showFailedAlert();
        }

    });

    $scope.$on('httpService:postCommentError', function () {
        //console.log('failed post comment');
        $scope.hide();
        $scope.showFailedAlert();
    });

    $scope.likeFunction = function () {
        $scope.show();
        //console.log('masuk like');

        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});
        httpService.post_token($scope, $http, url, obj, 'post_like');
    };

    $scope.$on('httpService:postTokenLikeSuccess', function () {
        var new_token = $scope.data.token;
        //console.log('token post Likes = ' + new_token);
        var obj = serializeData({_method: 'POST', content: '', post_id: $stateParams.id, user_id: user_id, company_id: company_id, author: username_login});

        // post comment
        httpService.post($scope, $http, likes_url + '?token=' + new_token, obj, 'post_like');
    });

    $scope.$on('httpService:postLikeSuccess', function () {

        if ($scope.data.success === true) {
            $scope.hide();
            $scope.liked = true;
            $scope.content_data.total_likes++;
        } else {
            $scope.hide();
            $scope.liked = false;
        }

    });

    $scope.$on('httpService:postLikeError', function () {

        $scope.hide();

    });

    $scope.$on('httpService:postTokenLikeError', function () {
        $scope.hide();
    });

    // loading fragment
    $scope.show = function () {
        $ionicLoading.show({
            template: ionicLoadingTemplate
        });
    };
    $scope.hide = function () {
        $ionicLoading.hide();
    };

    // alert fragment
    $scope.showSuccessAlert = function () {
      var alertPopup = $ionicPopup.alert({
        title: $scope.text_comment_title,
        css: 'cp-button',
        okType:'cp-button',
        okText:$scope.alert_button_ok,
        template: '<div style="width:100%;text-align:center">' + $scope.text_comment_alert_success + '</div>'
      });
    };

    $scope.showFailedAlert = function () {
      var alertPopup = $ionicPopup.alert({
        title: $scope.text_comment_title,
        css: 'cp-button',
        okType:'cp-button',
        okText:$scope.alert_button_ok,
        template: '<div style="width:100%;text-align:center">' + $scope.text_comment_alert_error + '</div>'
      });
    };

    $scope.socialShare = function () {
        if (isPhoneGap()) {
            if (isAndroid()) {
                socialShare($cordovaClipboard, $cordovaToast, $timeout, $scope.content_data.summary, $scope.content_data.title, null, playstore_link, 'Read more at');
            }
            else if (isIOS()) {
                socialShare($cordovaClipboard, $cordovaToast, $timeout, $scope.content_data.summary, $scope.content_data.title, null, appstore_link, 'Read more at');
            }
        } else {
            console.log('Social Share: Not a Mobile Device');
            console.log($scope.content_data.summary);
            console.log($scope.content_data.title);
            console.log(playstore_link);
            console.log(appstore_link);
        }
    };

    $scope.isPhoneGap = function()
    {
        return isPhoneGap();
    };

    $scope.$on('SQLite:getOfflineDataSuccess', function () {
        $scope.content_data = {
            id: $stateParams.id,
            title: $scope.data.post.title,
            created_date: $scope.data.post.published_date,
            img_src: $scope.data.post.featured_image_path,
            summary: $scope.data.post.summary,
            content: $scope.data.post.content,
            comment_status: $scope.data.post.comment_status,
            total_likes: $scope.data.post.like_count,
            total_comments: $scope.data.post.comment_count,
            comments: $scope.data.post.comment,
            likes: $scope.data.post.like
        };

        $scope.isLoading = false;
        if ($scope.content_data.comment_status !== '0') {
            if($scope.content_data.likes !== undefined && $scope.content_data.likes !== null)
            {
                //console.log('bisa like');
                if (checkPostLikes($scope.content_data.likes, user_id)) {
                    //console.log('pernah like');
                    $scope.liked = true;
                } else {
                    $scope.liked = false;
                }
            }
        }
    });

    $scope.submitBooking = function () {
        $scope.show();
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});

        // get token for posting comment
        httpService.post_token($scope, $http, url, obj, 'user-form');

    };

    // if get token success, request profile data
    $scope.$on('httpService:postTokenUserFormSuccess', function () {
        //console.log($scope.data);
        token = $scope.data.token;

        var d = new Date($scope.input.meta["booking_date"]);
        var dateString =
          d.getFullYear() +"/"+
          ("0" + (d.getMonth()+1)).slice(-2) +"/"+
          ("0" + d.getDate()).slice(-2);

        var t = new Date($scope.input.meta["booking_time"]);
        var timeString =
          ("0" + t.getHours()).slice(-2) + ":" +
          ("0" + t.getMinutes()).slice(-2);

        $scope.input.meta["booking_date"] = dateString;
        $scope.input.meta["booking_time"] = timeString;

        var tempString = JSON.stringify($scope.input.meta);

        $scope.input.meta["booking_date"] = d;
        $scope.input.meta["booking_time"] = t;

        var obj = serializeData({_method: 'POST', generateBookingNumber: true, content: 'place a booking', post_id: $stateParams.id, user_id: user_id, company_id: company_id, meta: tempString});

        // post comment
        //console.log(obj);
        httpService.post($scope, $http, user_form_url + '?token=' + token, obj, 'user-form');
    });


    $scope.$on('httpService:postUserFormSuccess', function () {
        $scope.hide();
        if($scope.data.success !== false)
        {

            var alertPopup = $ionicPopup.alert({
                title: $scope.title_text_booking,
                css: 'cp-button',
                okType:'cp-button',
                okText:$scope.alert_button_ok,
                template: '<div style="width:100%;text-align:center">'+ $scope.alert_text_booking_number + ' : '+$scope.data.booking_number + ' ' + $scope.alert_text_submitted + '</div>'
            });
            //$scope.showSubmitFormSuccessAlert();
        }
        else
        {
            $scope.showSubmitFormFailedAlert();
        }
    });

    $scope.$on('httpService:postTokenUserFormFailed', function () {
        $scope.hide();
        $scope.showFailedAlert();
    });

    $scope.$on('httpService:postUserFormError', function () {
        $scope.hide();
        $scope.showFailedAlert();
    });


    $scope.show = function () {
        $ionicLoading.show({
            template: ionicLoadingTemplate
        });
    };

    $scope.hide = function () {
        $ionicLoading.hide();
    };

    $scope.showSubmitFormSuccessAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: $scope.title_text_booking,
            css: 'cp-button',
            okType:'cp-button',
            okText:$scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">'+$scope.ui_text_booking_success+'</div>'
        });
    };

    $scope.showSubmitFormFailedAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: $scope.title_text_booking,
            css: 'cp-button',
            okType:'cp-button',
            okText:$scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">'+$scope.ui_text_booking_failed+'</div>'
        });
    };

    $scope.showFailedAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: $scope.title_text_booking,
            css: 'cp-button',
            okType:'cp-button',
            okText:$scope.alert_button_ok,
            template: '<div style="width:100%;text-align:center">'+$scope.ui_text_booking_failed+'</div>'
        });
    };

    $scope.showLoginRequiredAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: $scope.title_text_login,
            css: 'cp-button',
            okType: 'cp-button',
            template: '<div style="width:100%;text-align:center">'+$scope.ui_text_please_login+'</div>',
            buttons:[
                {
                    text: $scope.button_text_ok
                },
                {
                    text: $scope.button_text_login_now,
                    type: 'cp-button',
                    onTap: function(e)
                    {
                        $rootScope.login_redirect_location = '#'+$ionicHistory.currentView().url;
                        window.location.href= "#/app/login/-1" ;
                    }
                }
            ]
        });
    };
    $scope.retryLoadContent = function(){
        var url = token_url;
        var obj = serializeData({email: username, password: password, company_id: company_id});

        $scope.isTimeout = false;

        httpService.post_token($scope, $http, url, obj, 'content');
    };
});
