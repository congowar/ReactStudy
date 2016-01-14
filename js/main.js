$(function() {
    var app_id = '552216338261451';
    var scopes = 'email, user_friends, public_profile';
    var postData = [];
    var userData = {};
    var postsLimit = 5;


    var FacebookUserLogin = React.createClass({
        render: function() {
            var user = this.props.data;
            return (
                <div className="login-wrapper">
                    <div className="logo">
                        <img src="img/reactjs.png" alt="logo" width="54px"/>
                    </div>
                    <p className="header-text">Facebook Application</p>
                    <div className="wrapper-block">
                        <a href="#" id="logout" className="btn btn-danger">LOGOUT</a>
                        <div className="user-avatar"><img src={user.avatar}/></div>
                        <div className="wrapper-name">
                            <p className="user-data"><strong>Name: </strong>
                                <span className="user-info">{user.name}</span>
                            </p>
                            <p className="user-data"><strong>Email: </strong>
                                <span className="user-info">{user.email}</span>
                            </p>
                        </div>
                    </div>
                    <div className="clr"></div>
                </div>
            );
        }
    });


    var FacebookPost = React.createClass({

        readMore: function(postData, index) {
            var button = $("[data-id=" + index + "]");
            var buttons = $('.read-more');
            var closebutton = $("[data-idclose=" + index + "]");
            var post = button.closest('.post-block');
            var descriptionBlocks = $('.post-description');

            //for (var i = 0; i<=buttons.length) {
            //
            //}

            closebutton.css({"display": "table"});

            descriptionBlocks.animate({
                "width": "40%"
            }, 400);
        },

        closePost: function() {
            console.log("closePost is working");
        },

        render: function() {
            var shortLink = '';
            var _this = this;
            return (
                <div className="post-wrapper">
                    {this.props.data.map(function(current, index) {
                        shortLink = current.link.slice(0, 40) + "...";

                        return <div className="post-block">

                            <h2 className="post-header">{current.header}</h2>
                            <div className="parent-wrapper">

                                <img src={'http://graph.facebook.com/' + current.pageId + '/picture?type=normal'} width="60px"/>
                                <p className="post-info"><strong>Name: </strong>{current.name}</p>
                                <p className="post-info"><strong>Link: </strong><a href={current.link} target="_blank">{shortLink}</a></p>

                                <div className="button-wrapper">
                                    <div onClick={_this.closePost.bind(this, current, index)} data-idclose={index} className="btn close-btn">
                                        <i className="fa fa-times-circle close-sm"></i>Close
                                    </div>
                                    <div onClick={_this.readMore.bind(this, current, index)} data-id={index} className="btn read-more">
                                        <i className="fa fa-chevron-right fa-lg chevron-sm"></i>Read More
                                    </div>
                                </div>

                                <div className="post-description">
                                    <img src={current.picture} width="40%" />
                                    <p className="description-text">{current.description}</p>
                                </div>

                            </div>
                            <div className="separator"></div>

                        </div>
                    })}
                </div>
            );
        }
    });

    var LoginButton = React.createClass({
        render: function() {
            return (
                <a href="#" id="login" className="btn btn-primary ">
                    <i className="fa fa-facebook-official fa-2x"></i>
                    <span className="login-text">Log in with Facebook</span>
                </a>
            );
        }
    });

    ReactDOM.render(<LoginButton />, document.getElementById('button-container'));

    var DownloadButton = React.createClass({
        getNewPosts: function() {
            postsLimit += 5;
            getFacebookData();
            console.log("Current posts: " + postsLimit);
        },

        render: function() {
            return (
                <div onClick={this.getNewPosts} id="downloadmore" className="btn">Load More</div>
            );
        }
    });

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
        if (response.status === 'connected') {
            getFacebookData();
            $('#login').remove();
        } else {
            callback(false);
        };
    };

    var checkLoginState = function(callback) {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response, function(data) {
                callback(data);
            });
        });
    };

    var getFacebookData = function() {
        FB.api('/me', 'GET',
            {"fields": "id, name, email, posts.limit(" + postsLimit + "){full_picture, name, description, link, parent_id}"},
            function(response) {

            var posts = response.posts.data;

            userData.id = response.id;
            userData.email = response.email;
            userData.name = response.name;
            userData.avatar = 'http://graph.facebook.com/' + response.id + '/picture?type=small';

            for (var i = postsLimit - 5; i < posts.length; i++) {
                postData.push({
                    name: posts[i].name,
                    description: posts[i].description,
                    picture: posts[i].full_picture,
                    link: posts[i].link,
                    parentId: posts[i].parent_id,

                    //get post-header from description
                    get header() {
                        var header = [];
                        if (this.description)
                            header.push(this.description.split('.', 1));
                        else
                            header.push(this.name);
                        return header;
                    },

                    get pageId() {
                        var id = [];
                        if (this.parentId)
                            id.push(this.parentId.split('_', 1));
                        return id;
                    }
                });
            };

            console.log(postData);
            ReactDOM.render(<FacebookUserLogin data={userData} />, document.getElementById('facebook-login'));
            ReactDOM.render(<FacebookPost data={postData} />, document.getElementById('facebook-post'));
            ReactDOM.render(<DownloadButton />, document.getElementById('button-dwnd-container'));
        });
    };

    var facebookLogin = function() {
        checkLoginState(function(response) {
            if (!response) {
                FB.login(function(response) {
                    if (response.status === 'connected') {
                        getFacebookData();
                        $('#login').remove();
                    }
                }, {scope: scopes});
            };
        });
    };

    var facebookLogout = function() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.logout(function(responce) {
                    $('#facebook-login').empty();
                    $('#facebook-post').empty();
                    $('#button-dwnd-container').empty();
                    $('#logout').remove();
                    ReactDOM.render(<LoginButton />, document.getElementById('button-container'));
                })
            };
        });
    };

    //button click event
    $(document).on('click', '#login', function(e) {
        e.preventDefault();
        facebookLogin();
        //location.reload();
    });

    $(document).on('click', '#logout', function(e) {
        e.preventDefault();
        if (confirm("Are you shure?"))
            facebookLogout();
        else
            return false;
    });

});
