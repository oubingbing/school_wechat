var order = ['red', 'yellow', 'blue', 'green', 'red'];
var data = [
  { "color":"red","id":"a"},
  { "color": "yellow", "id": "b" },
  { "color": "blue", "id": "c" },
  { "color": "red", "id": "d" },
  { "color": "green", "id": "e" },
  { "color": "yellow", "id": "f" },
  { "color": "green", "id": "g" },
  { "color": "blue", "id": "h" },
  { "color": "red", "id": "o" },
];

Page({
  data: {
    toView: 'red',
    scrollTop: 100,
    list:data
  },
  upper: function (e) {
    console.log(e)
  },
  lower: function (e) {
    console.log(e)
  },
  scroll: function (e) {
    console.log(e)
  },
  tap: function (e) {
    for (var i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1]
        })
        break
      }
    }
  },
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  }
})