$(function() {
    var app_id = '552216338261451';
    var scopes = 'email, user_friends, public_profile';

    var btn_login = '<a href="#" id="login" class="btn btn-primary">LOGIN</a>';
    var div_session = '<div id="facebook-session">'+
                      '<strong></strong><br>'+
                      '<img class="avatar"><br>'+
                      '<a href="#" id="logout" class="btn btn-danger">LOGOUT</a>'+
                      '</div>';

    window.fbAsyncInit = function() {
        FB.init({
            appId      : app_id,
            status	   : true,
            cookie     : true,
            xfbml      : true,
            version    : 'v2.2'
        });

        FB.getLoginStatus(function(response) {
            statusChangeCallback(response, function() {
            });
        });
    };

    var statusChangeCallback = function(response, callback) {
        console.log(response);
        if (response.status === 'connected') {
            getFacebookData();
        } else {
            callback(false);
        }
    };

    var checkLoginState = function(callback) {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response, function(data) {
                callback(data);
            });
        });
    };

    var getFacebookData = function() {
        FB.api('/me', function(response) {
            $('#login').after(div_session);
            $('#login').remove();
            $('#facebook-session strong').text("Name: " + response.name);
            $('#facebook-session').text(response.link)
            $('#facebook-session img').attr('src', 'http://graph.facebook.com/' + response.id + '/picture?type=large');
        })

    }

    var facebookLogin = function() {
        checkLoginState(function(response) {
            if (!response) {
                FB.login(function(response) {
                    if (response.status === 'connected')
                    getFacebookData();
                }, {scope: scopes});
            };
        });
    };

    var facebookLogout = function() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.logout(function(responce) {
                    $('#facebook-session').before(btn_login);
                    $('#facebook-session').remove();
                })
            };
        });
    };

    //button click event
    $(document).on('click', '#login', function(e) {
        e.preventDefault();
        facebookLogin();
    });

    $(document).on('click', '#logout', function(e) {
        e.preventDefault();
        if (confirm("Are you shure?"))
            facebookLogout();
        else
            return false;
    });

});
