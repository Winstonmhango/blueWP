/*
  
  DeepBlue Starter Kit - version 1.1
  Copyright (c) 2015 INMAGIK SRL - www.inmagik.com
  All rights reserved

  written by Mauro Bianchi
  bianchimro@gmail.com  
  
  file: controllers.js
  description: this file contains all controllers of the DeepBlue app.

*/


//controllers are packed into a module
angular.module('deepBlue.controllers', [])

//top view controller
.controller('AppCtrl', function($scope, $rootScope, $state) {
  
  // #SIMPLIFIED-IMPLEMENTATION:
  // Simplified handling and logout function.
  // A real app would delegate a service for organizing session data
  // and auth stuff in a better way.
  
  $rootScope.user = {
    avatar : 'sampledata/images/avatar.jpg'
  };



  $scope.login = function(){
    //in this case we just set the user in $rootScope
    $rootScope.user = {
      email : "mary@ubiqtspaces.com",
      name : "Mary Ubiquitous",
      address : "Rue de Galvignac",
      city : "RonnieLand",
      zip  : "00007",
      avatar : 'sampledata/images/avatar.jpg'
    };
    //finally, we route our app to the 'app.shop' view
    $state.go('app.shop');
  };

  $scope.logout = function(){
  $rootScope.user = {};
  $state.go('app.start')
  };
})

// This controller is bound to the "app.account" view




// Feeds controller.
.controller('FeedsCtrl', function($scope, $http, $stateParams, $sce) {
    $http.get('http://allfashion.mobiproj.com/wp-json/wp/v2/posts/' + $stateParams.postId).then(
      function(returnedData){
        $scope.postDetails = returnedData.data;
        $scope.post_title = $sce.trustAsHtml($scope.postDetails.title.rendered);
        $scope.post_content = $sce.trustAsHtml($scope.postDetails.content.rendered);
        $scope.post_image = $scope.postDetails.better_featured_image.source_url;
      }, function(err){
        console.log(err);
      })

})

// Shop controller.
.controller('ShopCtrl', function($scope, $ionicActionSheet, BackendService, CartService, $http, $sce ) {
  

  $scope.siteCategories = [];
  $scope.cart = CartService.loadCart();

  $scope.doRefresh = function(){
      BackendService.getProducts()
      .success(function(newItems) {
        $scope.products = newItems;
       // console.log($scope.products);
        $http.get("http://allfashion.mobiproj.com/wp-json/wp/v2/categories/").then(
        function(returnedData){
          $scope.siteCategories = returnedData.data;
          $scope.products.forEach(function(item1) {
            item1.categoryObj = $scope.siteCategories.find(function(item2) {
              return item2.name === item1.title;
            });
          });
        }, function(err){
          console.log(err);
        })
      })
      .finally(function() {
        // Stop the ion-refresher from spinning (not needed in this view)
        $scope.$broadcast('scroll.refreshComplete');
      });
  };




  // private method to add a product to cart
  var addProductToCart = function(product){
    $scope.cart.products.push(product);
    CartService.saveCart($scope.cart);
  };

  // method to add a product to cart via $ionicActionSheet
  $scope.addProduct = function(product){
    $ionicActionSheet.show({
       buttons: [
         { text: '<b>Add to cart</b>' }
       ],
       titleText: 'Buy ' + product.title,
       cancelText: 'Cancel',
       cancel: function() {
          // add cancel code if needed ..
       },
       buttonClicked: function(index) {
         if(index == 0){
           addProductToCart(product);
           return true;
         }
         return true;
       }
     });
  };



  //trigger initial refresh of products
  $scope.doRefresh();

})

// controller for "app.cart" view
.controller('CartCtrl', function($scope, CartService, $ionicListDelegate, $http, $sce, $ionicScrollDelegate) {
  
  $scope.doRefresh = function(){
    $scope.recentPosts = [];

    $http.get("http://allfashion.mobiproj.com/wp-json/wp/v2/posts?per_page=50").then(
      function(returnedData){
        $scope.recentPosts = returnedData.data;
        console.log($scope.recentPosts);
        $scope.recentPosts.forEach(function(element, index, array) {
          element.excerpt.rendered = element.excerpt.rendered.substr(0, 150);
          element.excerpt.rendered = $sce.trustAsHtml(element.excerpt.rendered);
          element.title.rendered = $sce.trustAsHtml(element.title.rendered);
        })
   
    }, function(err){
      console.log(err);
    })

    
    .finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
  $scope.recentPosts = [];

  $http.get("http://allfashion.mobiproj.com/wp-json/wp/v2/posts?per_page=50").then(
    function(returnedData){
      $scope.recentPosts = returnedData.data;
      //console.log($scope.recentPosts);
      $scope.recentPosts.forEach(function(element, index, array) {
        element.excerpt.rendered = element.excerpt.rendered.substr(0, 150);
        element.excerpt.rendered = $sce.trustAsHtml(element.excerpt.rendered);
        element.title.rendered = $sce.trustAsHtml(element.title.rendered);
      })
 
  }, function(err){
    console.log(err);
  })

  $scope.searchTextChanged = function() {
    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(true);
  };




  // using the CartService to load cart from localStorage
  $scope.cart = CartService.loadCart();
  
  // we assign getTotal method of CartService to $scope to have it available
  // in our template
  $scope.getTotal = CartService.getTotal;

  // removes product from cart (making in persistent)
  $scope.dropProduct = function($index){
    $scope.cart.products.splice($index, 1);
    CartService.saveCart($scope.cart);
    // as this method is triggered in an <ion-option-button> 
    // we close the list after that (not strictly needed)
    $ionicListDelegate.closeOptionButtons();

  }
})

.controller('CheckoutCtrl', function($scope, CartService, $state) {
  
  //using the CartService to load cart from localStorage
  $scope.cart = CartService.loadCart();
  $scope.getTotal = CartService.getTotal;

  $scope.getTotal = CartService.getTotal;

  // #NOT-IMPLEMENTED: This method is just calling alert()
  // you should implement this method to connect an ecommerce
  // after that the cart is reset and user is redirected to shop
  $scope.checkout = function(){
    alert("this implementation is up to you!");
    $scope.cart = CartService.resetCart();
    $state.go('app.shop')
  }

})