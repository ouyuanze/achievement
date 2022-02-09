import Vue from 'vue'
var dragDialog = Vue.directive('dragDialog', {
  inserted: function (el) {
    console.log(el)
  }
})
export default dragDialog