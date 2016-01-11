$(function() {
    var app_id = '552216338261451';
    var user_id = '';
    var postsLimit = 10;
    var scopes = 'email, user_friends, public_profile';
    var postData = [];

    var btn_login = '<a href="#" id="login" class="btn btn-primary">Log in with Facebook</a>';
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
            getPosts();
        } else {
            callback(false);
        };
    };

    var checkLoginState = function(callback) {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response, function(data) {
                console.log(data);
                callback(data);
            });
        });
    };

    var getFacebookData = function() {
        FB.api('/me', function(response) {
            $('#login').after(div_session);
            $('#login').remove();
            $('#facebook-session strong').text("Name: " + response.name);
            $('#facebook-session').text(response.link);
            $('#facebook-session img').attr('src', 'http://graph.facebook.com/' + response.id + '/picture?type=large');
        });
    };

    var getPosts = function() {
        FB.api('/me', 'GET', {"fields": "posts.limit(" + postsLimit + "){full_picture, name, caption, description, icon}"},
            function(response) {
            var posts = response.posts.data;

            for (var i = 0; i < posts.length; i++) {
                postData.push({
                    name: posts[i].name,
                    description: posts[i].description,
                    picture: posts[i].full_picture,
                    caption: posts[i].caption,
                    icon: posts[i].icon
                });
            };
        });

        var FacebookPost = React.createClass({
            render: function() {
                return (
                    <div>
                        {this.props.data.map(function(current, index) {
                            return <div className="post-block">
                                      <h2 className="post-header">Header</h2>
                                      <p>From: {current.name}</p><img src={current.icon} />
                                      <img src={current.picture} width="100%" />
                                      <p className="post-description">{current.description}</p>;
                                      <div className="separator"></div>
                                   </div>;
                        })}
                    </div>
                )
            }
        });

        ReactDOM.render(<FacebookPost data={postData} />, document.getElementById('facebook-post'));
    };

    var facebookLogin = function() {
        checkLoginState(function(response) {
            if (!response) {
                FB.login(function(response) {
                    if (response.status === 'connected')
                    getFacebookData();
                    getPosts();
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
