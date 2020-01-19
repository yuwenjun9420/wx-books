// pages/detail/detail.js
const db = wx.cloud.database();
Page({
  data: {
    detailInfo: {},
    bid: '',
    comments: '',
    userInfo: wx.getStorageSync('userInfo') || {}
  },
  //设置评论内容
  setComment(e) {
    //console.log(e.detail.value);
    this.setData({
      comments: e.detail.value
    })
  },
  //清空评论
  clearComment(){
    this.setData({
      comments: ''
    })
  },
  //添加评论
  addComment() {
    let bid = this.data.bid;
    let comments = this.data.comments;
    db.collection('doubanbooks').doc(bid)
      .update({
        data: {
          comment: db.command.push([{
            auth: this.data.userInfo.nickName,
            content: comments,
            date: new Date().toLocaleDateString().replace(/\//g, "-"),
            image: this.data.userInfo.avatarUrl
          }])
        }
      }).then(res => {
        wx.showToast({
          title: '评论成功',
          duration: 1000
        })
        //刷新页面
        this.getDetailInfo(bid);
      }).catch(e => {
        wx.showToast({
          title: '评论失败',
          duration: 1500
        })
      })
  },
  //访问量+1
  addView(bid) {
    if (!bid && bid == "") {
      return;
    }

    //访问量自增
    db.collection('doubanbooks').doc(bid)
      .update({
        data: {
          page_view: db.command.inc(1)
        }
      }).then(res => {
        console.log('更新成功啦');
        console.log(res);
      }).catch(e => {
        wx.showToast({
          title: '更新失败了',
          duration: 1500
        })
      })
  },
  //根据获取图书的详情
  getDetailInfo(bid) {
    if (!bid && bid == "") {
      return;
    }
    wx.showLoading({
      title: '加载中'
    })
    db.collection('doubanbooks').where({
        _id: bid
      }).get()
      .then(res => {
        //console.log(res.data);
        this.setData({
          detailInfo: res.data[0]
        })
        wx.setNavigationBarTitle({
          title: res.data[0].title,
        })
        //初始化评论内容
        this.clearComment();
        wx.hideLoading();
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options);
    let bid = options.id;
    this.setData({
      bid
    })
    this.addView(bid);//访问量+1
    this.getDetailInfo(bid); //获取详情页数据
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})