//index.js
const db = wx.cloud.database();
Page({
  data: {
    bookList: [],
    page: 0,
    limit: 4,
    slider: [],
    indicatorDots: true,
    indicatorActiveColor: '#c21e29',
    autoplay: true,
    circular: true,
    interval: 3000,
    duration: 500
  },
  //轮播图
  getSlider() {
    db.collection('doubanbooks').orderBy('page_view', 'desc')
      .orderBy('create_time', 'desc')
      .limit(9)
      .get()
      .then(res => {
        let data = [];
        for (let i = 0; i < res.data.length; i += 3) {
          data.push(res.data.slice(i, i + 3))
        }
        //console.log(data);
        this.setData({
          slider: data
        })
      })
  },

  //下拉刷新
  onPullDownRefresh() {
    this.getBookList(true);
  },
  //上拉触底
  onReachBottom() {
    //console.log('触底了');
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.getBookList();
    })
  },
  //分页加载数据
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
    let offset = this.data.page * this.data.limit; //起始位置开始查询数据
    let ret = db.collection('doubanbooks').orderBy('create_time', 'desc');
    if (!init) {
      ret = ret.skip(offset);
    }
    ret = ret.limit(this.data.limit)
      .get().then(res => {
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
        wx.hideLoading()
      })
  },
  //页面跳转
  jumpToDetail(event) {
    console.log('页面要跳转到详情页了');
    console.log(event.currentTarget.dataset.bid);
    let bid = event.currentTarget.dataset.bid ? event.currentTarget.dataset.bid : '';
    let url = '/pages/detail/detail?id=' + bid;
    wx.navigateTo({
      url
    })
  },
  //页面加载完成
  onLoad() {
    console.log('page loaded.');
    wx.setNavigationBarTitle({
      title: '首页'
    })
    //this.getBookList(true);
    //wx.startPullDownRefresh() //开始下拉刷新
    //this.getSlider();
  },
  //监听页面显示
  onShow(item) {
    //刷新数据
    this.getBookList(true);
    this.getSlider();
  }
})