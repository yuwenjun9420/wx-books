//index.js
const app = getApp()
const db = wx.cloud.database();
Page({
  data: {
    bookList: [],
    page: 0
  },
  onPullDownRefresh(){
    this.getBookList(true);
  },
  onReachBottom() {
    console.log('页面触底了');
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.getBookList();
    });
  },
  //分页查询
  getBookList(init) {
    wx.showLoading({
      title: '正在加载...',
    })
    if (init) {
      //首次加载
      this.setData({
        page: 0
      })
    }
    //每页显示三条数据
    const pageCount = 4;
    let offset = this.data.page * pageCount;
    console.log(offset);

    let ret = db.collection('doubanbooks').orderBy('create_time', 'desc');
    if (this.data.page > 0) {
      //滚动加载
      ret = ret.skip(offset);
    }
    ret = ret.limit(pageCount).get().then(res => {
      if (init) {
        this.setData({
          bookList: res.data
        })
      } else {
        this.setData({
          bookList: [
            ...this.data.bookList,
            ...res.data
          ]
        })
      }
      wx.hideLoading();
    })

  },
  onLoad: function () {
    this.getBookList(true);
  },
})